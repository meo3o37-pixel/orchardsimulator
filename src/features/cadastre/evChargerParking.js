import { facilityPlacementGeometry } from '../facility/facilityConstruction.js';
import { parkingGeometry } from './openParking.js';

export const evChargerParking = (field, builtOnly = false) => parkingGeometry(
  builtOnly ? field?.openParking : field?.cadastreParkingPlan?.plan || field?.openParking
);

export function evChargerSiteForSlot(field, slotNo, builtOnly = false) {
  const parking = evChargerParking(field, builtOnly);
  const bay = parking?.bays[slotNo - 1];
  if (!bay) return null;
  const edge = { x: (bay[0].x + bay[1].x) / 2, y: (bay[0].y + bay[1].y) / 2 };
  const dx = bay[1].x - bay[0].x;
  const dy = bay[1].y - bay[0].y;
  const length = Math.hypot(dx, dy);
  if (!length) return null;
  const halfWidthKm = Math.sqrt(3.305785) / 2000;
  const center = { x: edge.x + dy / length * halfWidthKm, y: edge.y - dx / length * halfWidthKm };
  return { ...facilityPlacementGeometry('evChargerStation', center, parking.plan.angle), evChargeSlotNo: slotNo };
}

export function evChargerSlotError(field, site, builtOnly = false) {
  if (site?.facilityKey !== 'evChargerStation') return '';
  const slotNo = Number(site.evChargeSlotNo);
  const expected = evChargerSiteForSlot(field, slotNo, builtOnly);
  if (!expected) return 'EV 충전소를 배치할 주차칸이 없습니다. 주차장을 먼저 설계해 주세요.';
  if (!Number.isFinite(site.center?.x) || !Number.isFinite(site.center?.y)
    || Math.hypot(site.center.x - expected.center.x, site.center.y - expected.center.y) > 1e-8) {
    return 'EV 충전소 위치가 주차칸 가장자리와 맞지 않습니다. 설계 위치를 다시 선택해 주세요.';
  }
  return '';
}
