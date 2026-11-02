import { polygonContainsPoint } from './cadastreData.js';
import { parkingGeometry } from './openParking.js';
import { yardGeometry } from './openYard.js';
import { normalizeFacilitySites } from '../facility/facilityConstruction.js';

const valid = point => Number.isFinite(point?.x) && Number.isFinite(point?.y);
const center = points => ({ x: points.reduce((sum, p) => sum + p.x, 0) / points.length, y: points.reduce((sum, p) => sum + p.y, 0) / points.length });
export const roadTargets = (field, zones = []) => {
  const planned = (field.cadastreFacilityLayoutPlans || []).filter(plan => Array.isArray(plan.points) && plan.points.length >= 3);
  const plannedIds = new Set(planned.map(plan => plan.id));
  const sites = normalizeFacilitySites(field.facilitySites).filter(site => !plannedIds.has(site.id));
  const parking = parkingGeometry(field.cadastreParkingPlan?.plan || field.openParking);
  const yard = yardGeometry(field.cadastreYardPlan?.plan || field.openYard);
  return [
    ...planned.map(plan => ({ id: `facility:${plan.id}`, name: plan.name || '시설·건물', point: center(plan.points) })),
    ...sites.map(site => ({ id: `facility:${site.id}`, name: site.name || '시설·건물', point: center(site.points) })),
    ...zones.filter(zone => zone.kind === 'farm' && zone.points?.length >= 3).map(zone => ({ id: `zone:${zone.id}`, name: `${zone.name} 재배구역`, point: zone.points[0] })),
    ...(parking ? [{ id: 'parking', name: '노지 주차장', point: center(parking.aisle) }] : []),
    ...(yard ? [{ id: 'yard', name: '노지 야적창고', point: center(yard.aisle) }] : [])
  ].filter(target => valid(target.point));
};

export function nearestBoundaryPoint(boundary, point) {
  let closest = null, distance = Infinity;
  for (let i = 0; i < boundary.length; i++) {
    const a = boundary[i], b = boundary[(i + 1) % boundary.length];
    const dx = b.x - a.x, dy = b.y - a.y, length2 = dx * dx + dy * dy;
    const t = length2 ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length2)) : 0;
    const projected = { x: a.x + dx * t, y: a.y + dy * t };
    const d = Math.hypot(point.x - projected.x, point.y - projected.y);
    if (d < distance) { distance = d; closest = projected; }
  }
  return closest;
}

export function connectedRoadRoutes(routes) {
  const connected = new Set(['entrance']);
  let changed = true;
  while (changed) {
    changed = false;
    for (const route of routes) {
      if (connected.has(route.startId) && !connected.has(route.endId)) { connected.add(route.endId); changed = true; }
      if (connected.has(route.endId) && !connected.has(route.startId)) { connected.add(route.startId); changed = true; }
    }
  }
  return routes.filter(route => connected.has(route.startId) && connected.has(route.endId));
}

export function roadPlanError(plan, boundary, targets) {
  if (!valid(plan?.entrance)) return '지도에서 토지 경계의 진입점을 먼저 선택해 주세요.';
  const nearest = nearestBoundaryPoint(boundary, plan.entrance);
  if (!nearest || Math.hypot(plan.entrance.x - nearest.x, plan.entrance.y - nearest.y) > 1e-7) return '진입점은 토지 경계 위에 있어야 합니다.';
  if (!Array.isArray(plan.routes)) return '도로 경로를 확인해 주세요.';
  const ids = new Set(), endpoints = new Map([['entrance', plan.entrance], ...targets.map(target => [target.id, target.point])]);
  for (const route of plan.routes || []) {
    const key = [route.startId, route.endId].sort().join('|');
    if (route.startId === route.endId || !endpoints.has(route.startId) || !endpoints.has(route.endId) || ids.has(key)) return '연결할 목적지를 확인해 주세요.';
    ids.add(key);
    if (!Array.isArray(route.points) || route.points.length < 2 || route.points.length > 100 || route.points.some(point => !valid(point))) return '도로 경로를 확인해 주세요.';
    const start = endpoints.get(route.startId), end = endpoints.get(route.endId);
    if (Math.hypot(route.points[0].x - start.x, route.points[0].y - start.y) > 1e-7 || Math.hypot(route.points.at(-1).x - end.x, route.points.at(-1).y - end.y) > 1e-7) return '도로 양끝을 선택한 시설에 연결해 주세요.';
    for (let i = 1; i < route.points.length; i++) {
      const a = route.points[i - 1], b = route.points[i];
      for (let step = 1; step <= 10; step++) {
        const t = step / 11;
        if (!polygonContainsPoint(boundary, { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })) return '도로는 토지 경계 안으로 배치해 주세요.';
      }
    }
  }
  if (connectedRoadRoutes(plan.routes).length !== plan.routes.length) return '모든 도로가 토지 진입점까지 이어지도록 연결해 주세요.';
  return '';
}
