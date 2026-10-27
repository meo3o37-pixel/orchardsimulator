import { selfLaborAvailable } from '../../utils/overwork.js';
import polygonClipping from 'polygon-clipping';
import { polygonAreaSqKmFromPoints } from './cadastreData.js';
import { validateCultivationZone } from './cultivationZones.js';
import { drainageFootprintPaths } from './drainage.js';

export const PARKING_SLOT_PY = 4;
const PY_M2 = 3.305785;
const ring = (points) => [points.map(({ x, y }) => [x, y])];
const area = (polygons) => polygons.reduce((sum, polygon) => sum + polygon.reduce((a, r, i) => a + (i ? -1 : 1) * polygonAreaSqKmFromPoints(r.map(([x, y]) => ({ x, y }))), 0), 0);
export const parkingFootprintsOverlap = (a, b) => area(polygonClipping.intersection(ring(a), ring(b))) > 1e-10;
const validParkingPlan = (raw) => raw?.version === 1 && Number.isInteger(raw.slots) && raw.slots >= 1 && raw.slots <= 20
  && Number.isFinite(raw.anchor?.x) && Number.isFinite(raw.anchor?.y) && [0, 90, 180, 270].includes(raw.angle);

// Game dimensions: each bay is 4 py; only the adjacent 3 m manoeuvring aisle uses extra land.
export function parkingGeometry(raw, boundary = []) {
  if (!validParkingPlan(raw)) return null;
  const { slots, angle, anchor } = raw;
  const width = 2.5 * slots, depth = PARKING_SLOT_PY * PY_M2 / 2.5;
  const cos = Math.cos(angle * Math.PI / 180), sin = Math.sin(angle * Math.PI / 180);
  const point = (x, y) => ({ x: anchor.x + (x * cos - y * sin) / 1000, y: anchor.y + (x * sin + y * cos) / 1000 });
  const rect = (x, y, w, h) => [point(x, y), point(x + w, y), point(x + w, y + h), point(x, y + h)];
  const parking = rect(0, 0, width, depth), aisle = rect(0, depth, width, 3);
  try {
    const footprints = [parking, aisle];
    const occupiedPy = slots * PARKING_SLOT_PY + width * 3 / PY_M2;
    return { plan: { version: 1, slots, angle, anchor: { ...anchor }, boundaryId: String(raw.boundaryId || '') }, parking, aisle, footprints, occupiedPy,
      bays: Array.from({ length: slots }, (_, i) => rect(i * 2.5, 0, 2.5, depth)) };
  } catch { return null; }
}

// Rebuild legacy saves to drop their former automatic entrance footprint and area.
export function normalizeOpenParking(raw) {
  const geometry = parkingGeometry(raw);
  return geometry ? { ...geometry.plan, occupiedPy: geometry.occupiedPy, footprints: geometry.footprints } : null;
}
export const openParkingOccupiedPy = (raw) => validParkingPlan(raw) ? raw.slots * (PARKING_SLOT_PY + 7.5 / PY_M2) : 0;

export function parkingPlanError(field, geometry, boundary, zones = []) {
  if (!geometry) return '지도에서 주차장 위치를 선택해 주세요.';
  for (const points of [geometry.parking, geometry.aisle]) {
    const error = validateCultivationZone({ points, boundaryPoints: boundary, zones: [...zones.filter((z) => z.kind !== 'farm'), ...(field.facilitySites || []).filter(s => s.occupiedPy > 0).map(s => ({ id: s.id, points: s.points }))] });
    if (error) return `주차장·회차 통로: ${error}`;
  }
  // Existing trees do not yet have spatial coordinates. Never guess which to remove.
  if (Number(field.trees) > 0 && (JSON.stringify(field.openParking?.anchor) !== JSON.stringify(geometry.plan.anchor) || field.openParking?.angle !== geometry.plan.angle)) return '기존 나무의 위치 정보가 없어 새 위치로 배치할 수 없습니다. 빈 토지에서 먼저 설정해 주세요.';
  if (Number(field.trees) > 0 && geometry.occupiedPy > openParkingOccupiedPy(field.openParking) + .001) return '나무가 있는 토지는 주차장을 확장하기 전에 식재 공간을 정리해 주세요.';
  try {
    const obstacles = [...zones.filter((z) => z.kind !== 'farm').map((z) => z.points), ...(field.openYard?.footprints||[]), ...(field.cadastreYardPlan?.plan?.footprints||[]), ...drainageFootprintPaths(field.drainage?.routes || [], 'excavation')];
    for (const obstacle of obstacles) for (const footprint of geometry.footprints) {
      if (parkingFootprintsOverlap(footprint, obstacle)) return '주차장 또는 회차 공간이 건물·배수로와 겹칩니다.';
    }
  } catch { return '주차장 경계를 계산할 수 없습니다.'; }
  return '';
}

export function parkingWorkQuote(field, plan, boundary, mode = 'contractor') {
  if (!['contractor', 'excavator'].includes(mode)) return { error: '외주 또는 내 굴삭기를 선택해 주세요.' };
  const geometry = parkingGeometry(plan, boundary);
  if (!geometry) return { error: '지도에서 주차장 위치를 먼저 선택해 주세요.', cost: 0, labor: 0, fuel: 0, workPy: 0 };
  const old = normalizeOpenParking(field?.openParking);
  const moved = Boolean(old) && (JSON.stringify(old.anchor) !== JSON.stringify(plan.anchor) || old.angle !== plan.angle);
  const starter = old ? null : parkingGeometry({ ...plan, slots: 1 }, boundary);
  const baseArea = old ? Number(old.occupiedPy) || 0 : starter?.occupiedPy || 0;
  const expansionPy = Math.max(0, plan.slots - (Number(old?.slots) || 1)) * PARKING_SLOT_PY;
  // A relocation rebuilds parking and its manoeuvring aisle. Shrinking alone is free.
  const workPy = moved ? geometry.occupiedPy : Math.max(expansionPy, geometry.occupiedPy - baseArea, 0);
  const units = workPy > .001 ? Math.ceil(workPy / PARKING_SLOT_PY - 1e-6) : 0;
  return { workPy, units, cost: mode === 'contractor' && units ? 100000 + units * 50000 : 0,
    labor: mode === 'excavator' ? units * 5 : 0, fuel: mode === 'excavator' ? units : 0 };
}

export function parkingDrainageConflict(field, plan) {
  const parking = normalizeOpenParking(field?.openParking);
  if (!parking) return false;
  try { return drainageFootprintPaths(plan?.routes || field.drainage?.routes || [], 'excavation').some((p) => parking.footprints.some((q) => parkingFootprintsOverlap(p, q))); }
  catch { return true; }
}

export function applyOpenParking(state, fieldId, raw, { boundary, boundaryId, protectedCapacity = 0, openCapacity = 0, occupiedPy = () => 0,
  workMode = 'contractor', machine = null, excavatorKeys, fuel = 0, durability = 0 } = {}) {
  const fail = (message) => ({ ok: false, message, state });
  const field = state.fields.find((f) => String(f.id) === String(fieldId));
  if (!field?.owned) return fail('소유한 토지에서만 설정할 수 있습니다.');
  if (!boundary?.length || raw?.boundaryId !== boundaryId) return fail('현재 토지 경계를 다시 확인해 주세요.');
  const geometry = parkingGeometry(raw, boundary);
  const error = parkingPlanError(field, geometry, boundary, state.cultivationZonesByFieldId?.[String(fieldId)] || []);
  if (error) return fail(error);
  const old = field.openParking;
  const quote = parkingWorkQuote(field, raw, boundary, workMode);
  if (quote.error) return fail(quote.error);
  const usingMachine = workMode === 'excavator' && quote.units > 0;
  if (usingMachine) {
    if (!machine || !excavatorKeys?.has(machine.machineKey) || !(field.machineParkingSlots || []).includes(machine.id)) return fail('현재 토지에 주차된 내 굴삭기를 선택해 주세요.');
    if (!(Number(state.inventory?.[machine.machineKey]) >= Math.max(1, Number(machine.unitNo) || 1))) return fail('보유 굴삭기를 확인해 주세요.');
    if (!(Number(durability) > 0)) return fail('굴삭기 정비가 필요합니다.');
    if (!(selfLaborAvailable(state) >= quote.labor)) return fail(`내 노동력 ${quote.labor}이 필요합니다.`);
    if (!(Number(fuel) >= quote.fuel)) return fail(`굴삭기 연료 ${quote.fuel}L가 필요합니다.`);
  }
  const changing = old?.slots !== geometry.plan.slots || JSON.stringify(old?.anchor) !== JSON.stringify(geometry.plan.anchor) || old?.angle !== geometry.plan.angle;
  const parked = field.machineParkingSlots || [];
  if (changing && old && parked.some((id) => id && !(usingMachine && id === machine.id))) return fail('시공할 굴삭기를 제외한 차량과 장비를 먼저 다른 곳으로 옮겨 주세요.');
  if (!old && parked.some((entry, index) => entry && (index >= geometry.plan.slots + protectedCapacity || (protectedCapacity > 0 && geometry.plan.slots !== openCapacity && index >= Math.min(openCapacity, geometry.plan.slots))))) return fail('현재 주차 위치를 유지할 수 없습니다. 차량을 이동하거나 기존 노지 주차 칸 수에 맞춰 배치해 주세요.');
  const totalCap = geometry.plan.slots + protectedCapacity;
  if (parked.some((id, index) => id && index >= totalCap)) return fail('변경 후 주차 칸에 남아 있는 차량·굴삭기를 수용할 수 없습니다. 먼저 빈 칸으로 옮겨 주세요.');
  if ((field.evChargeSlotNos || []).some((n) => n > totalCap)) return fail('주차장 축소 전에 범위를 벗어나는 충전 슬롯을 해제해 주세요.');
  const extraArea = geometry.occupiedPy - openParkingOccupiedPy(old);
  if (occupiedPy(field) + extraArea > Number(field.py) + .001) return fail('시설과 주차장을 배치할 토지 면적이 부족합니다.');
  const { cost, labor } = quote;
  if (Number(state.money) < cost) return fail(`정지 작업비 ${cost.toLocaleString()}원이 필요합니다.`);
  const openParking = { ...geometry.plan, occupiedPy: geometry.occupiedPy, footprints: geometry.footprints };
  return { ok: true, message: `노지 주차장 ${openParking.slots}칸 · ${workMode === 'excavator' ? '내 굴삭기' : '전문 외주'} · 작업비 ${cost.toLocaleString()}원 · 노동력 ${labor} · 연료 ${quote.fuel}L`,
    state: { ...state, money: state.money - cost, labor: Number(state.labor || 0) - labor,
      ...(usingMachine ? { machineFuelByInstance: { ...(state.machineFuelByInstance || {}), [machine.id]: fuel - quote.fuel },
        equipmentDurabilityByInstance: { ...(state.equipmentDurabilityByInstance || {}), [machine.id]: Math.max(0, durability - quote.fuel / 4.8 * (Number(machine.item?.usageWear) || .12)) } } : {}),
      fields: state.fields.map((f) => f === field ? { ...field, openParking } : f) } };
}
