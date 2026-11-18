import { allocatePipeMaterials, consumeAllocatedPipes, pipeMaterialLimits } from './pipeMaterials.js';
import { selfLaborAvailable } from '../../utils/overwork.js';
import ClipperLib from 'clipper-lib';
import { soilProfileOf } from '../../utils/soil.js';
import { slopeBearingOf } from '../../utils/terrain.js';
import { polygonContainsPoint, polygonAreaPyFromPoints } from './cadastreData.js';
import { zoneBoundaryError } from './cultivationZones.js';
import { PIPE_TYPES, isBuried, pipeRate, pipeGradeError, junctionDepthOK, analyzePipeNetwork } from './pipeSystem.js';
import { isActualTreeRowPipe } from './orchardPipeLayout.js';

// Game balance values, not civil-engineering recommendations. Coordinates are km.
export const DRAINAGE_TYPES = [
  { key: 'earth', name: '흙수로', width: .4, fixedSizeLabel: '윗폭 40cm', price: 8000, capacity: 3, clogChance: .12, clogDaily: .8, clogEvent: 6, desc: '땅을 파서 만든 열린 수로 · 도로 횡단 불가 · 비 오는 날 막힘 위험 12%, 퇴적이 빠름(게임 기준)' },
  { key: 'lined', name: 'PE관 배수로 · 20cm', width: .6, fixedSizeLabel: '관경 20cm', price: 30000, capacity: 5, clogChance: .06, clogDaily: .35, clogEvent: 4, desc: '땅속에 묻는 관로 · 매립·다짐 후 도로 횡단 가능 · 비 오는 날 막힘 위험 6%(게임 기준)' },
  { key: 'main', name: '콘크리트 수로', width: .8, fixedSizeLabel: '내부 폭 60cm', price: 150000, capacity: 12, clogChance: .02, clogDaily: .12, clogEvent: 2, desc: '콘크리트 구조물을 땅에 묻는 수로 · 상부 차량 통행·도로 사용 가능 · 매우 높은 공사비와 확실한 배수 능력 · 비 오는 날 막힘 위험 2%(게임 기준)' },
  ...PIPE_TYPES
];
export const DRAINAGE_SELF_WORK_COST_FACTOR = .45;
export const drainageExcavatorWear = (fuel, machine, durability) => (
  Math.min(durability, fuel / 4.8 * (Number(machine.item?.usageWear) || .12))
);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v) || 0));
const typeOf = (key) => DRAINAGE_TYPES.find((type) => type.key === key) || DRAINAGE_TYPES[0];
export const drainageScopeMatches = (route, scope = 'all') => scope === 'all' || (scope === 'pipes' ? isBuried(route) : scope === 'surface' && !isBuried(route));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) * 1000;
export const drainageLength = (points = []) => points.slice(1).reduce((sum, point, i) => sum + distance(points[i], point), 0);
export const drainageRequirement = (py) => ({ length: Math.max(12, Math.ceil(Math.max(0, Number(py) || 0) / 10)), outlets: Math.max(1, Math.ceil(Math.max(0, Number(py) || 0) / 1500)) });
const validPoint = (p) => Number.isFinite(p?.x) && Number.isFinite(p?.y) && Math.abs(p.x) < 100000 && Math.abs(p.y) < 100000;
const copyPoints = (rows, max) => Array.isArray(rows) && rows.length <= max && rows.every(validPoint) ? rows.map(({ x, y }) => ({ x, y })) : [];
export function normalizeDrainage(raw) {
  if (!raw || raw.version !== 1) return null;
  const rawRoutes = Array.isArray(raw.routes) ? raw.routes : [];
  if (rawRoutes.length > 256 || rawRoutes.reduce((sum, r) => sum + (r?.points?.length || 0), 0) > 2048) return null;
  const boundary = copyPoints(raw.boundary, 256);
  if (zoneBoundaryError(boundary)) return null;
  return { version: 1, bearing: clamp(raw.bearing, 0, 359), boundary, boundaryId: String(raw.boundaryId || '').slice(0, 100),
    contractorMeters: clamp(raw.contractorMeters, 0, 200), routes: (Array.isArray(raw.routes) ? raw.routes : []).slice(0, 256).flatMap((r) => {
      const points = copyPoints(r?.points, 512), length = drainageLength(points);
      if (points.length < 2 || length < (isBuried(r)&&String(r.id).startsWith('tree-link:')?.1:1) || length > 2000) return [];
      if(!isBuried(r)&&!(Number(r.work)>0)){
        const bearing=clamp(raw.bearing,0,359),first=points[0],last=points.at(-1);
        const drop=projection(last,bearing)-projection(first,bearing);
        if(drop<-.05)points.reverse();
        else if(Math.abs(drop)<=.05){
          const connects=p=>isDrainageOutlet(p,boundary,bearing)||rawRoutes.some(other=>other!==r&&Array.isArray(other.points)&&other.points.length>=2&&other.points.every(validPoint)&&routeDistance(p,other.points)<=.05&&Math.max(...other.points.map(q=>projection(q,bearing)))>projection(p,bearing)+.05);
          if(connects(first)&&!connects(last))points.reverse();
        }
      }
      return [{ id: String(r.id || '').slice(0, 100), type: typeOf(r.type).key, points, work: clamp(r.work, 0, length), blockage: clamp(r.blockage, 0, 100),
        ...(isBuried(r) ? { depthStart: r.depthStart == null ? .6 : clamp(r.depthStart, .4, 1.8), depthEnd: r.depthEnd == null ? .8 : clamp(r.depthEnd, .4, 1.8), envelope: Boolean(r.envelope), ...(r.rowKey ? { rowKey: String(r.rowKey).slice(0, 150) } : {}) } : {}) }];
    }), paidOutlets: clamp(raw.paidOutlets, 0, 256),
    paidOutletIds: (Array.isArray(raw.paidOutletIds) ? raw.paidOutletIds : rawRoutes.filter(r => r.points?.length && r.points.every(validPoint) && !inside(r.points.at(-1), boundary)).slice(0, clamp(raw.paidOutlets,0,256)).map(r => r.id)).slice(0,256).map(String),
    lastWorkDay: Number(raw.lastWorkDay) || 0, lastDailyDay: Number(raw.lastDailyDay) || 0,
    slopeDeg: clamp(raw.slopeDeg, 0, 60), paidAccess: (Array.isArray(raw.paidAccess) ? raw.paidAccess : []).slice(0, 256).map(String),
    waterModel: raw.waterModel === 2 ? 2 : 1, surfaceWater: clamp(raw.surfaceWater, 0, 100), rootWetDays: clamp(raw.rootWetDays, 0, 10000),
    lastSurfaceDrained: clamp(raw.lastSurfaceDrained, 0, 100), lastPipeDrained: clamp(raw.lastPipeDrained, 0, 100),
    occupiedPy: clamp(raw.occupiedPy, 0, 1000000), lastDrained: clamp(raw.lastDrained, 0, 100), lastWater: clamp(raw.lastWater, 0, 100), lastAction: String(raw.lastAction || '').slice(0, 200) };
}
export function pointSegmentDistance(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, den = dx * dx + dy * dy;
  const t = den ? clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / den, 0, 1) : 0;
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}
const boundaryDistance = (p, boundary) => Math.min(...boundary.map((a, i) => pointSegmentDistance(p, a, boundary[(i + 1) % boundary.length])));
const inside = (p, boundary) => polygonContainsPoint(boundary, p) || boundaryDistance(p, boundary) < .02;
const routeDistance = (p, points) => Math.min(...points.slice(1).map((b, i) => pointSegmentDistance(p, points[i], b)));
const projection = (p, bearing) => (p.x * Math.cos(bearing * Math.PI / 180) + p.y * Math.sin(bearing * Math.PI / 180)) * 1000;
// A boundary outlet must face out of the parcel in the downhill direction.
const boundaryOutlet = (p,boundary,bearing) => boundaryDistance(p,boundary)<=.05 && !inside({x:p.x+Math.cos(bearing*Math.PI/180)*.0001,y:p.y+Math.sin(bearing*Math.PI/180)*.0001},boundary);
const isDrainageOutlet = (p,boundary,bearing) => !inside(p,boundary)||boundaryOutlet(p,boundary,bearing);
const downstreamExternalOutlet = (p,boundary,bearing) => {
  let nearest=null,best=Infinity;
  boundary.forEach((a,i)=>{const b=boundary[(i+1)%boundary.length],dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy;
    const t=den?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/den,0,1):0,q={x:a.x+dx*t,y:a.y+dy*t},gap=distance(p,q);
    if(gap<best){best=gap;nearest=q;}
  });
  return best<=5&&nearest&&boundaryOutlet(nearest,boundary,bearing)&&projection(p,bearing)>projection(nearest,bearing)+.05;
};
// Split at boundary intersections; this catches even narrow concave notches.
function segmentIntervals(a, b, boundary) {
  const cuts = [0, 1], dx = b.x - a.x, dy = b.y - a.y;
  boundary.forEach((c, i) => {
    const d = boundary[(i + 1) % boundary.length], ex = d.x - c.x, ey = d.y - c.y, den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-18) return;
    const t = ((c.x - a.x) * ey - (c.y - a.y) * ex) / den, u = ((c.x - a.x) * dy - (c.y - a.y) * dx) / den;
    if (t > 0 && t < 1 && u >= 0 && u <= 1) cuts.push(t);
  });
  cuts.sort((x, y) => x - y);
  return cuts.slice(1).flatMap((end, i) => end - cuts[i] > 1e-9 ? [{ inside: inside({ x: a.x + dx * (cuts[i] + end) / 2, y: a.y + dy * (cuts[i] + end) / 2 }, boundary), length: (end - cuts[i]) * distance(a, b) }] : []);
}
export function analyzeDrainage(raw, py, field = {}) {
  const plan = normalizeDrainage(raw), requirement = drainageRequirement(py);
  const empty = { plan, requirement, error: '', ready: false, length: 0, builtLength: 0, outletCount: 0, capacity: 0, progress: 0, areaPy: 0, roots: [], pipeSpacing: 0, pipeCoverage: 0, pipeCapacity: 0, pipePaths: [], outletCapacity: 0 };
  if (!plan || !plan.routes.length) return { ...empty, error: '배수로를 그리고 낮은 쪽 토지 밖 배출구까지 연결해 주세요.' };
  const { routes, boundary, bearing } = plan;
  const roots = [], lengths = [];
  const fail = (error) => ({ ...empty, error });
  const ids = new Set();
  for (let i = 0; i < routes.length; i++) {
    const r = routes[i], end = r.points.at(-1);
    if (!r.id || ids.has(r.id)) return fail('배수로 식별자가 중복되었습니다.');
    ids.add(r.id);
    const gradeError = pipeGradeError(r, bearing, field.slopeDeg ?? plan.slopeDeg);
    if (gradeError) return fail(gradeError);
    const outlet = isDrainageOutlet(end, boundary, bearing);
    if (!inside(r.points[0], boundary)) return fail('하경사 방향의 배수로 시작점은 토지 안에 있어야 합니다.');
    if (outlet && !boundaryOutlet(end,boundary,bearing) && !downstreamExternalOutlet(end,boundary,bearing)) return fail('배출구는 하경사 쪽 토지 경계 또는 토지 밖 5m 이내에 배치해 주세요.');
    let onLand = 0;
    for (let j = 1; j < r.points.length; j++) {
      const a = r.points[j - 1], b = r.points[j];
      if (distance(a, b) < .1) return fail('너무 가까운 경계점은 합쳐 주세요.');
      if (!isBuried(r) && projection(b, bearing) < projection(a, bearing) - .05) return fail('역경사 구간이 있습니다. 시작점부터 배출구 방향으로 내려가게 그려 주세요.');
      const intervals = segmentIntervals(a, b, boundary);
      if (intervals.some((v) => !v.inside) && !(outlet && j === r.points.length - 1 && intervals[0]?.inside && intervals.filter((v) => !v.inside).length === 1 && !intervals.at(-1)?.inside)) return fail('토지 밖으로 나갔다 다시 들어오는 배수로는 사용할 수 없습니다.');
      onLand += intervals.filter((v) => v.inside).reduce((sum, v) => sum + v.length, 0);
      // Reject coincident/retraced segments rather than counting fake extra length.
      for (let k = 0; k <= i; k++) for (let n = 1; n < routes[k].points.length; n++) {
        if (k === i && n >= j) continue;
        const c = routes[k].points[n - 1], d = routes[k].points[n];
        const parallel = Math.abs((b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x)) < 1e-12;
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (parallel && pointSegmentDistance(mid, c, d) < .15) return fail('겹치거나 되짚는 배수로 길이는 중복 시공할 수 없습니다.');
      }
    }
    lengths.push(onLand);
    if (outlet) {
      if (roots.some((k) => distance(routes[k].points.at(-1), end) < 2)) return fail('별도 배출구는 서로 2m 이상 떨어뜨려 배치해 주세요.');
      roots.push(i);
    }
  }
  const downstream = routes.map((r, i) => routes.flatMap((other, k) => k !== i && routeDistance(r.points.at(-1), other.points) <= .05 && junctionDepthOK(r, other, bearing) ? [k] : []));
  const connectedToOutlet = (completedOnly) => {
    const eligible = routes.map((r) => !completedOnly || r.work + .01 >= drainageLength(r.points));
    const connected = new Set(roots.filter((i) => eligible[i])), queue = [...connected];
    while (queue.length) {
      const target = queue.shift();
      routes.forEach((_, i) => { if (eligible[i] && !connected.has(i) && downstream[i].includes(target)) { connected.add(i); queue.push(i); } });
    }
    return connected;
  };
  const plannedConnected=connectedToOutlet(false);
  const connectedRouteIds=[...plannedConnected].map(index=>routes[index].id);
  if (plannedConnected.size !== routes.length) return {...fail('끝이 막혔거나 배출구에 이어지지 않았습니다. 연결점과 관 바닥 높이를 확인해 주세요.'),connectedRouteIds,unconnectedRouteIds:routes.filter((_,index)=>!plannedConnected.has(index)).map(route=>route.id)};
  const completed = connectedToOutlet(true);
  const built = routes.map((_, i) => completed.has(i));
  const length = lengths.reduce((a, b, i) => a + (isBuried(routes[i]) ? 0 : b), 0);
  const builtLength = lengths.reduce((sum, n, i) => sum + (built[i] && !isBuried(routes[i]) ? n : 0), 0);
  const outletCount = roots.filter((i) => built[i] && !isBuried(routes[i])).length;
  const progress = Math.min(1, builtLength / requirement.length, outletCount / requirement.outlets);
  const outletCapacity = roots.reduce((sum, i) => sum + (built[i] && !isBuried(routes[i]) ? typeOf(routes[i].type).capacity * (1 - routes[i].blockage / 100) : 0), 0);
  const slowest = Math.min(...routes.filter((r, i) => built[i] && !isBuried(r)).map((r) => typeOf(r.type).capacity * (1 - r.blockage / 100)), outletCapacity);
  return { ...empty, error: '', plan, roots, connectedRouteIds, unconnectedRouteIds:[], length, builtLength, outletCount, progress, ready: progress >= 1,
    capacity: Math.min(15, slowest * 300 / Math.max(100, py) * progress),
    ...analyzePipeNetwork(plan, { ...field, py }, built, downstream, roots, typeOf),
    areaPy: drainageFootprintPaths(routes).reduce((sum, ring) => sum + polygonAreaPyFromPoints(ring), 0) };
}
export function drainageFootprintPaths(routes = [], purpose = 'occupied') {
  if (!routes.length) return [];
  const origin = routes[0].points[0], offset = new ClipperLib.ClipperOffset(2, .25);
  for (const r of routes) {
    const single = new ClipperLib.ClipperOffset(2, .25), paths = new ClipperLib.Paths();
    const local = r.points.map((p) => ({ X: Math.round((p.x - origin.x) * 1e6), Y: Math.round((p.y - origin.y) * 1e6) }));
    if (isBuried(r) && purpose !== 'excavation') {
      // Buried runs may be beneath tree rows. Only surface access points
      // exclude planting or occupy permanent land; excavation stays separate.
      [local[0], local.at(-1)].forEach((p) => paths.push([{X:p.X-250,Y:p.Y-250},{X:p.X+250,Y:p.Y-250},{X:p.X+250,Y:p.Y+250},{X:p.X-250,Y:p.Y+250}]));
    } else {
      single.AddPath(local, ClipperLib.JoinType.jtSquare, ClipperLib.EndType.etOpenButt);
      single.Execute(paths, typeOf(r.type).width * 500 + (purpose === 'planting' && !isBuried(r) ? 500 : 0));
    }
    paths.forEach((ring) => offset.AddPath(ring, ClipperLib.JoinType.jtSquare, ClipperLib.EndType.etClosedPolygon));
  }
  const merged = new ClipperLib.Paths(); offset.Execute(merged, 0);
  return merged.map((ring) => ring.map((p) => ({ x: origin.x + p.X / 1e6, y: origin.y + p.Y / 1e6 })));
}
export function drainageOccupiedPy(plan) {
  const routes = plan.routes.filter((r) => r.work + .01 >= drainageLength(r.points));
  const paths = drainageFootprintPaths(routes);
  if (!paths.length) return 0;
  const origin = plan.boundary[0];
  const toPath = (ring) => ring.map((p) => ({ X: Math.round((p.x - origin.x) * 1e6), Y: Math.round((p.y - origin.y) * 1e6) }));
  const clipper = new ClipperLib.Clipper(), solution = new ClipperLib.Paths();
  clipper.AddPaths(paths.map(toPath), ClipperLib.PolyType.ptSubject, true);
  clipper.AddPath(toPath(plan.boundary), ClipperLib.PolyType.ptClip, true);
  clipper.Execute(ClipperLib.ClipType.ctIntersection, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
  return Math.abs(solution.reduce((sum, ring) => sum + ClipperLib.Clipper.Area(ring), 0)) / 1e6 / 3.305785;
}
export function drainageConflictsWithBuildings(plan, zones = []) {
  const buildings = zones.filter((z) => z.kind === 'building' && z.points?.length >= 3);
  if (!buildings.length || !plan?.routes?.length) return false;
  const origin = plan.boundary[0], clip = new ClipperLib.Clipper(), solution = new ClipperLib.Paths();
  const path = (points) => points.map((p) => ({ X: Math.round((p.x - origin.x) * 1e6), Y: Math.round((p.y - origin.y) * 1e6) }));
  clip.AddPaths(drainageFootprintPaths(plan.routes, 'excavation').map(path), ClipperLib.PolyType.ptSubject, true);
  clip.AddPaths(buildings.map((z) => path(z.points)), ClipperLib.PolyType.ptClip, true);
  clip.Execute(ClipperLib.ClipType.ctIntersection, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
  return Math.abs(solution.reduce((sum, ring) => sum + ClipperLib.Clipper.Area(ring), 0)) > 100;
}
export function drainagePlantingBlocker(field) {
  if (Number(field?.trees) > 0 && !field?.drainage?.routes?.some((r) => r.work > 0)) return ''; // Existing planted farms keep legacy eligibility until spatial conversion.
  const status = analyzeDrainage(field?.drainage, field?.py);
  return status.ready ? '' : `배수 기준 미달: 완공·연결 수로 ${status.builtLength.toFixed(1)}/${status.requirement.length}m, 하경사 외부 배출구 ${status.outletCount}/${status.requirement.outlets}개. 지적도 → 배수로에서 시공해 주세요.`;
}
export function applyDailyDrainage(field, water, rainGain, day) {
  const plan = normalizeDrainage(field?.drainage);
  if (!plan) return { water: clamp(water, 0, 100), drainage: null };
  if (plan.lastDailyDay === day) return { water: plan.lastWater, drainage: plan };
  const soil = soilProfileOf(field);
  const sandShare = (soil.composition.sand + soil.composition.sandyLoam) / 100;
  const updated = { ...plan, routes: plan.routes.map(r => {
    if(rainGain<5||r.work+.01<drainageLength(r.points))return r;
    if(isBuried(r))return {...r,blockage:clamp(r.blockage+.12+sandShare*(r.envelope?.08:.6),0,100)};
    const type=typeOf(r.type);
    // Stable per field, route and day: reopening a save does not reroll blockages.
    let hash=2166136261;for(const char of `${field.id}:${r.id}:${day}`)hash=Math.imul(hash^char.charCodeAt(0),16777619);
    hash^=hash>>>16;hash=Math.imul(hash,0x85ebca6b);hash^=hash>>>13;
    const incident=(hash>>>0)/4294967296<type.clogChance;
    return {...r,blockage:clamp(r.blockage+type.clogDaily+(incident?type.clogEvent:0),0,100)};
  }) };
  const status = analyzeDrainage(updated, field.py, field);
  const soilEfficiency = field.soilComposition ? soilProfileOf(field).channel : 1;
  const undergroundActive = plan.waterModel === 2 || updated.routes.some((r) => (r.rowKey || r.type === 'pipe100') && r.work + .01 >= drainageLength(r.points));
  if (undergroundActive) {
    // Split rain once: surface storage + root-zone input conserve the same
    // moisture units. Surface and pipe drainage share the final outlet budget.
    const surfaceInput = Math.max(0, rainGain) * .6;
    const pooled = clamp(plan.surfaceWater + surfaceInput, 0, 100);
    const infiltrated = Math.min(pooled, 1.8 * soil.channel);
    const rootWater = Math.max(0, water - surfaceInput + infiltrated);
    const budget = status.outletCapacity * soilEfficiency;
    const surfaceDrained = Math.min(Math.max(0, pooled - infiltrated), status.capacity * soilEfficiency, budget);
    const pipeDrained = Math.min(Math.max(0, rootWater - 75), status.pipeCapacity * soilEfficiency, Math.max(0, budget - surfaceDrained));
    const nextWater = clamp(rootWater - pipeDrained, 0, 100);
    return { water: nextWater, drainage: { ...updated, waterModel: 2, surfaceWater: Math.max(0, pooled - infiltrated - surfaceDrained), rootWetDays: nextWater >= 90 ? plan.rootWetDays + 1 : 0,
      lastDailyDay: day, lastDrained: surfaceDrained + pipeDrained, lastSurfaceDrained: surfaceDrained, lastPipeDrained: pipeDrained, lastWater: nextWater } };
  }
  const drained = Math.min(Math.max(0, water - 75), status.capacity * soilEfficiency);
  return { water: clamp(water - drained, 0, 100), drainage: { ...updated, lastDailyDay: day, lastDrained: drained, lastWater: clamp(water - drained, 0, 100) } };
}

export function drainageWorkQuote(planRaw, mode, day, labor = 0, fuel = 0, availableLabor = selfLaborAvailable({ labor, day }), scope = 'all', pipeLimits = null) {
  const plan = normalizeDrainage(planRaw);
  if (!plan) return { error: '배수 계획부터 저장해 주세요.' };
  const contractorAvailable = plan.lastWorkDay === day ? Math.max(0, 200 - plan.contractorMeters) : 200;
  if (mode === 'contractor' && contractorAvailable < .1) return { error: '오늘 이 토지의 외주 작업 한도 200m를 모두 사용했습니다.' };
  const remaining = plan.routes.reduce((sum, r) => sum + (drainageScopeMatches(r, scope) ? Math.max(0, drainageLength(r.points) - r.work) : 0), 0);
  let metreBudget = mode !== 'contractor' ? Infinity : contractorAvailable;
  const pipeLeft = { ...pipeLimits };
  let laborLeft = availableLabor, fuelLeft = fuel, length = 0, laborUsed = 0, fuelUsed = 0, cost = 0;
  const routes = plan.routes.map((r) => {
    if (!drainageScopeMatches(r, scope) || (mode === 'shovel' && isBuried(r))) return r;
    const lpm = mode === 'shovel' ? 8 : isBuried(r) ? .35 : .2, fpm = isBuried(r) ? .18 : .12;
    const add = Math.max(0, Math.min(metreBudget, Math.max(0, drainageLength(r.points) - r.work), mode !== 'contractor' ? laborLeft / lpm : Infinity, mode === 'excavator' ? fuelLeft / fpm : Infinity, mode !== 'contractor' && pipeLimits && (isBuried(r)||r.type==='lined'||r.type==='main') ? Math.max(0,pipeLeft[r.type]||0) : Infinity));
    if (mode !== 'contractor' && pipeLimits && (isBuried(r)||r.type==='lined'||r.type==='main')) pipeLeft[r.type] = Math.max(0,(pipeLeft[r.type]||0)-add);
    metreBudget -= add; length += add;
    if (mode !== 'contractor') { laborLeft -= add * lpm; fuelLeft -= add * (mode === 'shovel' ? 0 : fpm); laborUsed += add * lpm; fuelUsed += add * fpm; }
    cost += add * (isBuried(r) ? pipeRate(r) : typeOf(r.type).price) * (mode !== 'contractor' ? DRAINAGE_SELF_WORK_COST_FACTOR : 1);
    return { ...r, work: r.work + add };
  });
  if (length < .1 && mode !== 'contractor' && pipeLimits && plan.routes.some(r => drainageScopeMatches(r,scope) && (isBuried(r)||r.type==='lined'||r.type==='main') && r.work+.1 < drainageLength(r.points) && (pipeLimits[r.type]||0) < .1)) return { error: '시공 자재가 부족합니다. 농자재마트에서 해당 규격의 관 또는 콘크리트 수로를 구매해 현재 토지로 가져와 주세요.' };
  if (length < .1) return { error: remaining < .1 ? '모든 배수로가 완공되었습니다.' : '작업할 노동력이나 굴삭기 연료가 부족합니다.' };
  const newAccess = routes.filter((r, i) => isBuried(r) && r.work > plan.routes[i].work && !plan.paidAccess.includes(r.id)).map((r) => r.id);
  const newOutlets = routes.filter((r,i) => r.work > plan.routes[i].work && isDrainageOutlet(r.points.at(-1),plan.boundary,plan.bearing) && !plan.paidOutletIds.includes(r.id)).map(r=>r.id);
  const paidOutletIds = [...plan.paidOutletIds, ...newOutlets];
  const outletCost = newOutlets.length * 200000;
  return { length, cost: Math.ceil(cost + outletCost + newAccess.length * 80000), outletCost, labor: laborUsed, fuel: fuelUsed, plan: { ...plan, routes, paidAccess: [...plan.paidAccess, ...newAccess], paidOutletIds, paidOutlets: paidOutletIds.length, lastWorkDay: mode === 'contractor' ? day : plan.lastWorkDay,
    contractorMeters: mode === 'contractor' ? 200 - contractorAvailable + length : plan.contractorMeters } };
}

export function applyDrainageAction(state, fieldId, action, deps = {}) {
  const index = state?.fields?.findIndex((f) => String(f.id) === String(fieldId) && f.owned);
  if (index == null || index < 0) return { ok: false, message: '보유 토지를 선택해 주세요.' };
  const field = state.fields[index], old = normalizeDrainage(field.drainage);
  const fail = (message) => ({ ok: false, message });
  let plan, cost = 0, labor = 0, fuel = 0, machine = null, message, materials = null;
  if (action.kind === 'save') {
    if (zoneBoundaryError(deps.boundary || [])) return fail('현재 토지 경계가 필요합니다.');
    plan = normalizeDrainage({ version: 1, ...action.plan, boundary: deps.boundary, boundaryId: deps.boundaryId, slopeDeg: field.slopeDeg,
      paidOutlets: old?.paidOutlets || 0, paidOutletIds: old?.paidOutletIds || [], paidAccess: old?.paidAccess || [], waterModel: old?.waterModel || 1, surfaceWater: old?.surfaceWater || 0, rootWetDays: old?.rootWetDays || 0,
      lastWater: old?.lastWater || 0, lastDrained: old?.lastDrained || 0, lastSurfaceDrained: old?.lastSurfaceDrained || 0, lastPipeDrained: old?.lastPipeDrained || 0,
      lastWorkDay: old?.lastWorkDay || 0, contractorMeters: old?.contractorMeters || 0, lastDailyDay: old?.lastDailyDay || 0 });
    if (!plan || plan.routes.length !== action.plan?.routes?.length) return fail('배수 계획의 좌표·길이를 확인해 주세요.');
    if (plan.bearing !== slopeBearingOf(field)) return fail('경사 방향은 토지마다 고정됩니다. 토지의 하경사 방향으로 배수로를 설계해 주세요.');
    if (action.scope === 'pipes' && plan.routes.some(r => (r.rowKey || r.type === 'pipe100') && !(old?.routes.some(o => o.id === r.id && o.work > 0)) && !isActualTreeRowPipe(field, r, plan.bearing))) return fail('유공관은 실제 식재된 나무 열 아래로 설계해 주세요.');
    const hasWork = old?.routes.some((r) => r.work > 0);
    if (hasWork && (old.bearing !== plan.bearing || JSON.stringify(old.boundary) !== JSON.stringify(plan.boundary))) return fail('시공한 배수로의 경사 방향과 토지 경계는 변경할 수 없습니다.');
    if (old?.routes.some((r) => r.work > 0 && !plan.routes.some((n) => n.id === r.id && n.type === r.type && JSON.stringify(n.points) === JSON.stringify(r.points)))) return fail('시공한 배수로는 삭제하거나 이동할 수 없습니다.');
    if (old?.routes.some((r) => isBuried(r) && r.work > 0 && !plan.routes.some((n) => n.id === r.id && n.depthStart === r.depthStart && n.depthEnd === r.depthEnd && n.envelope === r.envelope))) return fail('시공한 관의 깊이와 피복재는 변경할 수 없습니다.');
    // Never trust completion or maintenance values from an editor.
    plan.routes = plan.routes.map((r) => ({ ...r, work: old?.routes.find((n) => n.id === r.id)?.work || 0, blockage: old?.routes.find((n) => n.id === r.id)?.blockage || 0 }));
    const status = analyzeDrainage(plan, field.py, field);
    if (status.error) return fail(status.error);
    message = '배수 계획을 저장했습니다. 아직 시공하지 않은 수로에는 배수 효과가 없습니다.';
  } else if (action.kind === 'work' || action.kind === 'clean') {
    plan = old;
    if (plan && plan.bearing !== slopeBearingOf(field)) return fail('배수 계획의 방향이 토지의 하경사 방향과 다릅니다.');
    const status = analyzeDrainage(plan, field.py, field);
    if (status.error) return fail(status.error);
    if (!['contractor', 'excavator', 'shovel'].includes(action.mode)) return fail('외주 또는 내 굴삭기를 선택해 주세요.');
    if (action.mode === 'shovel' && (action.kind !== 'work' || action.scope === 'pipes' || !deps.hasShovel)) return fail('삽을 보유해야 하며 삽 작업은 지표 배수로 시공만 가능합니다.');
    if (action.mode === 'contractor' && plan.lastWorkDay === state.day && plan.contractorMeters >= 199.9) return fail('오늘의 외주 작업 한도 200m를 모두 사용했습니다.');
    if (action.mode === 'excavator') {
      machine = deps.machine;
      if (!machine || !(field.machineParkingSlots || []).includes(machine.id) || !deps.excavatorKeys?.has(machine.machineKey)) return fail('현재 토지에 주차된 내 굴삭기를 선택해 주세요.');
      if (!(Number(state.inventory?.[machine.machineKey]) >= Number(machine.unitNo || 1))) return fail('보유 굴삭기를 확인해 주세요.');
      if (!(Number(deps.durability) > 0)) return fail('굴삭기 정비가 필요합니다.');
    }
    if (action.kind === 'work') {
      // Planted trees currently lack authoritative individual coordinates. Do not delete them by guesswork.
      const pending = old.routes.filter(r => drainageScopeMatches(r, action.scope) && r.work + .01 < drainageLength(r.points));
      if (Number(field.trees) > 0 && pending.some(r => !isBuried(r) || action.scope !== 'pipes')) return fail('나무가 있는 토지의 배수로 굴착은 위치 확인이 필요합니다.');
      if (action.scope === 'pipes' && pending.some(r => (r.rowKey || r.type === 'pipe100') && !isActualTreeRowPipe(field,r,plan.bearing))) return fail('실제 나무 열 위치가 변경되었습니다. 유공관 설계를 다시 확인해 주세요.');
      const quote = drainageWorkQuote(plan, action.mode, state.day, state.labor, deps.fuel, selfLaborAvailable(state), action.scope, action.mode !== 'contractor' ? pipeMaterialLimits(state,field,deps) : null);
      if (quote.error) return fail(quote.error);
      ({ cost, labor, fuel, plan } = quote);
      materials = allocatePipeMaterials(state, field, old, plan, {...deps,drainageContractor:action.mode==='contractor'});
      cost = Math.max(0, cost - materials.credit);
      message = `${action.scope === 'pipes' ? '유공관 매설' : '배수로 시공'} ${action.mode === 'shovel' ? '자가 삽 작업' : action.mode === 'excavator' ? '내 굴삭기' : '전문 외주'} ${quote.length.toFixed(1)}m / 비용 ${cost.toLocaleString()}원`;
    } else {
      const built = plan.routes.filter((r) => r.work > 0 && drainageScopeMatches(r, action.scope));
      if (!built.some((r) => r.blockage > 0)) return fail('청소할 배수로가 없습니다.');
      cost = action.mode === 'excavator' ? 0 : Math.max(20000, Math.ceil(built.reduce((sum, r) => sum + r.work * (isBuried(r) ? pipeRate(r) : typeOf(r.type).price), 0) * .05));
      labor = action.mode === 'excavator' ? Math.max(1, built.reduce((sum, r) => sum + r.work, 0) * .025) : 0;
      fuel = action.mode === 'excavator' ? labor * .6 : 0;
      plan = { ...plan, routes: plan.routes.map((r) => drainageScopeMatches(r,action.scope) ? ({ ...r, blockage: 0 }) : r), lastWorkDay: action.mode === 'contractor' ? state.day : plan.lastWorkDay,
        contractorMeters: action.mode === 'contractor' ? 200 : plan.contractorMeters };
      message = '배수로 청소를 마쳤습니다.';
    }
    if (state.money < cost) return fail(`작업비 ${cost.toLocaleString()}원이 필요합니다.`);
    if (selfLaborAvailable(state) + .00001 < labor || (machine && deps.fuel < fuel)) return fail('노동력 또는 굴삭기 연료가 부족합니다.');
  } else return fail('지원하지 않는 배수 작업입니다.');
  if (['save', 'work'].includes(action.kind) && drainageConflictsWithBuildings(plan, [...(state.cultivationZonesByFieldId?.[String(field.id)] || []), ...[...(field.openYard?.footprints||[]), ...(field.cadastreYardPlan?.plan?.footprints||[])].map(points=>({kind:'building',points}))])) return fail('굴착할 수로·유공관이 건물 구역과 겹칩니다. 관로를 건물 밖으로 옮겨 주세요.');
  const consumed = materials ? consumeAllocatedPipes(state, field, materials, deps) : { ok: true, state };
  if (!consumed.ok) return fail('유공관·집수관 재고가 변경되었습니다. 다시 확인해 주세요.');
  plan.occupiedPy = drainageOccupiedPy(plan);
  const fields = state.fields.map((f, i) => i === index ? { ...f, ...(materials ? { cadastrePipeOffcuts: materials.offcuts } : {}), drainage: { ...plan, lastAction: message } } : f);
  return { ok: true, message, state: { ...consumed.state, fields, money: state.money - cost, labor: state.labor - labor,
    ...(machine ? { machineFuelByInstance: { ...(state.machineFuelByInstance || {}), [machine.id]: Math.max(0, deps.fuel - fuel) },
      equipmentDurabilityByInstance: { ...(state.equipmentDurabilityByInstance || {}), [machine.id]: deps.durability - drainageExcavatorWear(fuel, machine, deps.durability) } } : {}) } };
}
