import ClipperLib from 'clipper-lib';
import { soilProfileOf } from '../../utils/soil.js';

// All dimensions, prices and capacities below are game balance values.
export const PIPE_TYPES = [
  { key: 'pipe100', name: '유공 가지관 100mm', width: .6, price: 28000, capacity: 3, buried: true, capture: true },
  { key: 'pipe150', name: '집수 주관 150mm', width: .6, price: 42000, capacity: 7, buried: true, capture: false }
];
export const isBuried = (route) => PIPE_TYPES.some((t) => t.key === route?.type);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) * 1000;
const lengthOf = (points) => points.slice(1).reduce((s, b, i) => s + distance(points[i], b), 0);
const projection = (p, bearing) => (p.x * Math.cos(bearing * Math.PI / 180) + p.y * Math.sin(bearing * Math.PI / 180)) * 1000;
export const pipeSpacing = (field) => {
  const soil = soilProfileOf(field).composition;
  return soil.sand * .10 + soil.sandyLoam * .08 + soil.loam * .06 + soil.clayLoam * .04 + soil.clay * .03;
};
export const pipeRate = (r) => 28000 * (r.type === 'pipe150' ? 1.5 : 1) + (r.envelope ? 3000 : 0);

export function routeDepthAt(route, segment = 0, t = 0) {
  if (!isBuried(route)) return ({ earth: 1.1, lined: 1.3, main: 1.5 })[route.type] || 1.1;
  const total = lengthOf(route.points);
  const before = lengthOf(route.points.slice(0, segment + 1));
  const along = before + (route.points[segment + 1] ? distance(route.points[segment], route.points[segment + 1]) * t : 0);
  return route.depthStart + (route.depthEnd - route.depthStart) * (total ? along / total : 0);
}
export function pipeGradeError(route, bearing, slopeDeg) {
  if (!isBuried(route)) return '';
  const tangent = Math.tan(Math.max(0, Math.min(60, Number(slopeDeg) || 0)) * Math.PI / 180);
  for (let i = 1; i < route.points.length; i++) {
    const a = route.points[i - 1], b = route.points[i];
    const drop = (projection(b, bearing) - projection(a, bearing)) * tangent + routeDepthAt(route, i - 1, 1) - routeDepthAt(route, i - 1, 0);
    if (drop / Math.max(.001, distance(a, b)) < .002 - 1e-8) return '유공관 역구배·구배 부족: 관 바닥이 출구 방향으로 최소 0.2% 내려가게 깊이를 조정해 주세요(게임 기준).';
  }
  return '';
}
export function junctionDepthOK(route, receiving) {
  if (!isBuried(route)) return !isBuried(receiving); // Surface runoff needs an open channel, not an unmodeled inlet.
  const end = route.points.at(-1);
  for (let i = 1; i < receiving.points.length; i++) {
    const a = receiving.points[i - 1], b = receiving.points[i], dx = b.x - a.x, dy = b.y - a.y;
    const den = dx * dx + dy * dy;
    const t = den ? Math.max(0, Math.min(1, ((end.x - a.x) * dx + (end.y - a.y) * dy) / den)) : 0;
    if (distance(end, { x: a.x + dx * t, y: a.y + dy * t }) <= .05 && route.depthEnd <= routeDepthAt(receiving, i - 1, t) + .02) return true;
  }
  return false;
}

// Union buffers and clip to the parcel: overlapping pipes never double count.
export function pipeCoveragePaths(routes, boundary, spacing) {
  if (!routes.length || !boundary?.length) return { paths: [], fraction: 0 };
  const origin = boundary[0];
  const toPath = (points) => points.map((p) => ({ X: Math.round((p.x - origin.x) * 1e6), Y: Math.round((p.y - origin.y) * 1e6) }));
  const offset = new ClipperLib.ClipperOffset(2, 25), buffered = new ClipperLib.Paths();
  routes.forEach((r) => offset.AddPath(toPath(r.points), ClipperLib.JoinType.jtRound, ClipperLib.EndType.etOpenRound));
  offset.Execute(buffered, spacing * 500);
  const clip = new ClipperLib.Clipper(), result = new ClipperLib.Paths();
  clip.AddPaths(buffered, ClipperLib.PolyType.ptSubject, true);
  const parcel = toPath(boundary);
  clip.AddPath(parcel, ClipperLib.PolyType.ptClip, true);
  clip.Execute(ClipperLib.ClipType.ctIntersection, result, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
  const area = Math.abs(result.reduce((s, ring) => s + ClipperLib.Clipper.Area(ring), 0));
  return { fraction: Math.max(0, Math.min(1, area / Math.max(1, Math.abs(ClipperLib.Clipper.Area(parcel))))), paths: result.map((ring) => ring.map((p) => ({ x: origin.x + p.X / 1e6, y: origin.y + p.Y / 1e6 }))) };
}

export function analyzePipeNetwork(plan, field, built, downstream, roots, typeOf) {
  const { routes, boundary } = plan;
  const rate = (i) => typeOf(routes[i].type).capacity * (1 - routes[i].blockage / 100);
  // Widest downstream path, bounded by each collector and the final outlet.
  const available = routes.map(() => 0);
  roots.forEach((i) => { if (built[i]) available[i] = rate(i); });
  for (let step = 0; step < routes.length; step++) {
    let changed = false;
    routes.forEach((_, i) => {
      if (!built[i]) return;
      const next = Math.max(available[i], ...downstream[i].map((k) => Math.min(rate(i), available[k])));
      if (next > available[i]) { available[i] = next; changed = true; }
    });
    if (!changed) break;
  }
  const pipes = routes.filter((r, i) => r.type === 'pipe100' && built[i] && available[i] > 0);
  const spacing = pipeSpacing(field);
  const coverage = pipeCoveragePaths(pipes, boundary, spacing);
  const branchLimit = routes.reduce((s, r, i) => s + (r.type === 'pipe100' && built[i] ? available[i] : 0), 0);
  const outletLimit = roots.reduce((s, i) => s + (built[i] ? rate(i) : 0), 0);
  // A conservative shared main bottleneck prevents multiple branches bypassing a small collector.
  const collectors = routes.flatMap((r, i) => r.type === 'pipe150' && built[i] ? [rate(i)] : []);
  const rawCapacity = Math.min(branchLimit, outletLimit, ...(collectors.length ? collectors : [Infinity]));
  const capacity = Math.min(12 * coverage.fraction, rawCapacity * 300 / Math.max(100, Number(field?.py) || 0));
  return { pipeSpacing: spacing, pipeCoverage: coverage.fraction, pipePaths: coverage.paths, pipeCapacity: capacity, outletCapacity: outletLimit * 300 / Math.max(100, Number(field?.py) || 0) };
}
