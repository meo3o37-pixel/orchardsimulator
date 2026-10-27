import ClipperLib from 'clipper-lib';
import { zoneBoundaryError } from './cultivationZones.js';
import { plantingSettingsError } from './plantingSettings.js';
import { drainageFootprintPaths } from './drainage.js';

const SCALE = 1000;
const MAX_CANDIDATES = 200000;
const MAX_TREES = 50000;
const MAX_ROWS = 3000;

export const generatePlantingPreview = (points, settings, drainageRoutes = [], excludedPolygons = []) => {
  const empty = { trees: [], rows: [], inset: [], treeCount: 0, rowCount: 0, usableAreaSqM: 0, error: '' };
  const error = plantingSettingsError(settings) || zoneBoundaryError(points);
  if (error) return { ...empty, error };
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const angle = settings.angleDeg * Math.PI / 180;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  // Clipper works in local millimetres; map coordinates are kilometres.
  const path = points.map((p) => {
    const x = (p.x - cx) * 1000, y = (p.y - cy) * 1000;
    return { X: Math.round((x * cos + y * sin) * SCALE), Y: Math.round((-x * sin + y * cos) * SCALE) };
  });
  if (!ClipperLib.Clipper.Orientation(path)) path.reverse();
  const worldPoint = ({ X, Y }) => ({ x: cx + (X * cos - Y * sin) / (SCALE * 1000), y: cy + (X * sin + Y * cos) / (SCALE * 1000) });
  try {
    let insetPaths = [path];
    if (settings.edgeMargin > 0) {
      const offset = new ClipperLib.ClipperOffset(2, 1);
      offset.AddPath(path, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
      insetPaths = new ClipperLib.Paths();
      offset.Execute(insetPaths, -settings.edgeMargin * SCALE);
    }
    if (!insetPaths.length) return empty;
    // Fix the lattice to the original planting polygon, before removing drain corridors.
    const all = insetPaths.flat();
    const minX = Math.min(...all.map((p) => p.X)), maxX = Math.max(...all.map((p) => p.X));
    const minY = Math.min(...all.map((p) => p.Y)), maxY = Math.max(...all.map((p) => p.Y));
    const rowStep = settings.rowSpacing * SCALE, treeStep = settings.treeSpacing * SCALE;
    const rowSlots = Math.max(1, Math.ceil((maxY - minY) / rowStep - 1e-9));
    const treeSlots = Math.max(1, Math.ceil((maxX - minX) / treeStep - 1e-9));
    if (rowSlots > MAX_ROWS || rowSlots * treeSlots > MAX_CANDIDATES) return { ...empty, error: '배치가 너무 조밀합니다. 간격을 넓히거나 구역을 나눠 주세요.' };
    const originX = minX + ((maxX - minX) - (treeSlots - 1) * treeStep) / 2;
    const originY = minY + ((maxY - minY) - (rowSlots - 1) * rowStep) / 2;
    const corridors = [...drainageFootprintPaths(drainageRoutes, 'planting'), ...excludedPolygons].map((ring) => ring.map((point) => {
      const x = (point.x - cx) * 1000, y = (point.y - cy) * 1000;
      return { X: Math.round((x * cos + y * sin) * SCALE), Y: Math.round((-x * sin + y * cos) * SCALE) };
    }));
    corridors.forEach((ring) => { if (!ClipperLib.Clipper.Orientation(ring)) ring.reverse(); });
    if (corridors.length) {
      const clip = new ClipperLib.Clipper(), difference = new ClipperLib.Paths();
      clip.AddPaths(insetPaths, ClipperLib.PolyType.ptSubject, true);
      clip.AddPaths(corridors, ClipperLib.PolyType.ptClip, true);
      clip.Execute(ClipperLib.ClipType.ctDifference, difference, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
      insetPaths = difference;
    }
    const trees = [], rows = [];
    let rowCount = 0;
    for (let index = 0; index < rowSlots; index += 1) {
      const y = Math.round(originY + index * rowStep);
      const clipper = new ClipperLib.Clipper();
      clipper.AddPath([{ X: minX - SCALE, Y: y }, { X: maxX + SCALE, Y: y }], ClipperLib.PolyType.ptSubject, false);
      clipper.AddPaths(insetPaths, ClipperLib.PolyType.ptClip, true);
      const solution = new ClipperLib.PolyTree();
      clipper.Execute(ClipperLib.ClipType.ctIntersection, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
      const segments = ClipperLib.Clipper.OpenPathsFromPolyTree(solution);
      const rowTrees = [];
      for (const segment of segments) {
        const left = Math.min(...segment.map((p) => p.X)), right = Math.max(...segment.map((p) => p.X));
        const first = Math.max(0, Math.ceil((left - originX) / treeStep - 1e-9));
        const last = Math.min(treeSlots - 1, Math.floor((right - originX) / treeStep + 1e-9));
        if (first > last) continue;
        rows.push([worldPoint({ X: left, Y: y }), worldPoint({ X: right, Y: y })]);
        for (let tree = first; tree <= last; tree += 1) {
          const candidate = { X: Math.round(originX + tree * treeStep), Y: y };
          // Clipped row segments include their endpoints; a tree on an obstacle edge is excluded too.
          if (!corridors.some((ring) => ClipperLib.Clipper.PointInPolygon(candidate, ring) !== 0)) rowTrees.push(worldPoint(candidate));
        }
      }
      if (rowTrees.length) rowCount += 1;
      trees.push(...rowTrees);
      if (trees.length > MAX_TREES) return { ...empty, error: '한 구역에 50,000주를 초과합니다. 구역을 나눠 주세요.' };
    }
    const usableAreaSqM = Math.abs(insetPaths.reduce((sum, ring) => sum + ClipperLib.Clipper.Area(ring), 0)) / (SCALE * SCALE);
    return { trees, rows, inset: insetPaths.map((ring) => ring.map(worldPoint)), treeCount: trees.length, rowCount, usableAreaSqM, error: '' };
  } catch {
    return { ...empty, error: '식재 배치를 계산할 수 없습니다. 구역 경계를 확인해 주세요.' };
  }
};
