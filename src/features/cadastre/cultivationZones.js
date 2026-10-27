import polygonClipping from 'polygon-clipping';
import { polygonAreaSqKmFromPoints, polygonBoundsFromPoints } from './cadastreData.js';
import { normalizePlantingSettings } from './plantingSettings.js';

const AREA_EPSILON = 1e-10;
const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
const onSegment = (a, b, p) => Math.abs(cross(a, b, p)) < 1e-12
  && p.x >= Math.min(a.x, b.x) - 1e-12 && p.x <= Math.max(a.x, b.x) + 1e-12
  && p.y >= Math.min(a.y, b.y) - 1e-12 && p.y <= Math.max(a.y, b.y) + 1e-12;
const segmentsMeet = (a, b, c, d) => (
  (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0)
  || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b)
);

export const zoneBoundaryError = (points) => {
  if (!Array.isArray(points) || points.length < 3) return '경계점을 3개 이상 지정해 주세요.';
  if (points.length > 256) return '경계점은 최대 256개까지 지정할 수 있습니다.';
  if (points.some((p) => !Number.isFinite(p?.x) || !Number.isFinite(p?.y))) return '경계 좌표가 올바르지 않습니다.';
  for (let i = 0; i < points.length; i += 1) {
    const next = (i + 1) % points.length;
    if (Math.hypot(points[i].x - points[next].x, points[i].y - points[next].y) < 1e-9) return '겹치는 경계점을 분리해 주세요.';
    for (let j = i + 1; j < points.length; j += 1) {
      if (j === next || (j + 1) % points.length === i) continue;
      if (segmentsMeet(points[i], points[next], points[j], points[(j + 1) % points.length])) return '경계선이 서로 교차하거나 닿아 있습니다.';
    }
  }
  if (polygonAreaSqKmFromPoints(points) < AREA_EPSILON) return '구역 면적이 너무 작습니다.';
  return '';
};

const ringOf = (points) => [points.map(({ x, y }) => [x, y])];
const clippedArea = (multiPolygon) => multiPolygon.reduce((sum, polygon) => sum + polygon.reduce((area, ring, index) => {
  const value = polygonAreaSqKmFromPoints(ring.map(([x, y]) => ({ x, y })));
  return area + (index === 0 ? value : -value);
}, 0), 0);

export const validateCultivationZone = ({ points, boundaryPoints, zones = [], excludeId = '' }) => {
  const error = zoneBoundaryError(points);
  if (error) return error;
  if (zoneBoundaryError(boundaryPoints)) return '토지 경계를 확인해 주세요.';
  try {
    if (clippedArea(polygonClipping.difference(ringOf(points), ringOf(boundaryPoints))) > AREA_EPSILON) return '재배구역은 토지 경계 안에 있어야 합니다.';
    for (const zone of zones) {
      if (zone.id === excludeId || zoneBoundaryError(zone.points)) continue;
      if (clippedArea(polygonClipping.intersection(ringOf(points), ringOf(zone.points))) > AREA_EPSILON) return '다른 구역과 겹칩니다.';
    }
  } catch {
    return '경계를 계산할 수 없습니다. 경계점을 확인해 주세요.';
  }
  return '';
};

export const normalizeCultivationZones = (raw) => {
  if (!Array.isArray(raw)) return [];
  const ids = new Set();
  return raw.slice(0, 200).flatMap((zone) => {
    const id = typeof zone?.id === 'string' ? zone.id.slice(0, 100) : '';
    if (!id || ids.has(id) || zoneBoundaryError(zone?.points)) return [];
    ids.add(id);
    return [{
      id,
      kind: ['farm', 'building', 'access'].includes(zone.kind) ? zone.kind : 'farm',
      name: String(zone.name || '재배구역').trim().slice(0, 40) || '재배구역',
      boundaryContourId: String(zone.boundaryContourId || '').slice(0, 100),
      ...(zone.planting ? { planting: normalizePlantingSettings(zone.planting) } : {}),
      points: zone.points.map(({ x, y }) => ({ x, y }))
    }];
  });
};

export const normalizeCultivationZoneMap = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).map(([fieldId, zones]) => [fieldId, normalizeCultivationZones(zones)]));
};

export const cadastreEditorTransform = (points) => {
  const bounds = polygonBoundsFromPoints(points);
  if (!bounds) return null;
  const scale = 90 / Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, 1e-9);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return {
    toSvg: (p) => ({ x: 50 + (p.x - cx) * scale, y: 50 + (p.y - cy) * scale }),
    toWorld: (p) => ({ x: cx + (p.x - 50) / scale, y: cy + (p.y - 50) / scale })
  };
};
