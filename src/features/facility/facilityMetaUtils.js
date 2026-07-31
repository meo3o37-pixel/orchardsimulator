import {
  COLD_STORAGE_DAILY_POWER_COST_BY_FACILITY,
  FACILITIES,
  FACILITY_MAP,
  HOUSING_OPTION_MAP_BY_FACILITY,
  HOUSING_OPTIONS_BY_FACILITY
} from '../../config/simConfig';

// Hard cap removed: actual parking slots now follow field size + installed facility capacity.
export const PARKING_MAX_SLOTS = Number.MAX_SAFE_INTEGER;

export const facilityBuildOptionsOfFacility = (facilityKey) => HOUSING_OPTIONS_BY_FACILITY?.[facilityKey] || [];
export const facilityBuildOptionMapOfFacility = (facilityKey) => HOUSING_OPTION_MAP_BY_FACILITY?.[facilityKey] || {};
export const facilityBuildOptionKeysOfFacility = (facilityKey) => (facilityBuildOptionsOfFacility(facilityKey) || []).map((option) => option.key);

export const fieldFacilityBuildOptionKeys = (field, facilityKey) => (
  Array.isArray(field?.housingOptionKeysByFacility?.[facilityKey])
    ? field.housingOptionKeysByFacility[facilityKey]
    : []
);

export const facilityRideMachineCapacityBonusOfField = (field, facilityKey) => {
  const selectedKeys = fieldFacilityBuildOptionKeys(field, facilityKey);
  const optionMap = facilityBuildOptionMapOfFacility(facilityKey);
  return selectedKeys.reduce(
    (sum, key) => sum + Math.max(0, Number(optionMap?.[key]?.rideMachineCapacityBonus) || 0),
    0
  );
};

export const facilityActsAsColdStorage = (field, facilityKey) => {
  const key = String(facilityKey || '');
  if (!key) return false;
  if (key.startsWith('coldStorage')) return true;
  const selectedKeys = fieldFacilityBuildOptionKeys(field, key);
  const optionMap = facilityBuildOptionMapOfFacility(key);
  return selectedKeys.some((optionKey) => Boolean(optionMap?.[optionKey]?.enablesColdStorage));
};

export const coldStorageSeasonalPowerMultiplierOfMonth = (monthRaw) => {
  const month = Math.max(1, Math.min(12, Math.floor(Number(monthRaw) || 0)));
  if ([6, 7, 8].includes(month)) return 1.1;
  if ([12, 1, 2].includes(month)) return 0.95;
  return 1;
};

export const coldFacilityEnabledUnitCountOf = (field, facilityKey) => {
  const key = String(facilityKey || '');
  if (!facilityActsAsColdStorage(field, key)) return 0;
  const installedCount = Math.max(
    0,
    Number(field?.landFacilityCounts?.[key]) || (field?.landFacilities?.[key] ? 1 : 0)
  );
  const usesColdStorageControls = key.startsWith('coldStorage');
  const legacyEnabled = usesColdStorageControls
    ? field?.coldStorageControlEnabled !== false
    : field?.panelCoolingControlEnabled !== false;
  if (installedCount <= 0 || !legacyEnabled) return 0;
  const controlMap = field?.coldFacilityControlByUnitKey || {};
  let enabledCount = 0;
  for (let unitIndex = 1; unitIndex <= installedCount; unitIndex += 1) {
    const unitKey = `${key}::${unitIndex}`;
    const state = controlMap?.[unitKey] || null;
    if (state?.enabled !== false) enabledCount += 1;
  }
  return enabledCount;
};

export const coldFacilityControlEnabledOf = (field, facilityKey) => (
  coldFacilityEnabledUnitCountOf(field, facilityKey) > 0
);

export const coldFacilityDailyPowerCostOf = (
  field,
  facilityKey,
  dailyCostByFacility = COLD_STORAGE_DAILY_POWER_COST_BY_FACILITY,
  month = null
) => {
  const key = String(facilityKey || '');
  const dailyCost = Math.max(0, Number(dailyCostByFacility?.[key]) || 0);
  if (dailyCost <= 0) return 0;
  const seasonalMultiplier = coldStorageSeasonalPowerMultiplierOfMonth(month);
  return Math.round(coldFacilityEnabledUnitCountOf(field, key) * dailyCost * seasonalMultiplier);
};

export const fieldColdStorageDailyPowerCost = (
  field,
  dailyCostByFacility = COLD_STORAGE_DAILY_POWER_COST_BY_FACILITY,
  month = null
) => Object.keys(dailyCostByFacility || {}).reduce(
  (sum, facilityKey) => sum + coldFacilityDailyPowerCostOf(field, facilityKey, dailyCostByFacility, month),
  0
);

export const coldFacilityStatusLabelOf = (field, facilityKey) => (
  coldFacilityControlEnabledOf(field, facilityKey) ? 'ON' : 'OFF'
);

export const facilityRideMachineCapacityOfField = (field, facilityKey) => {
  const facility = FACILITY_MAP?.[facilityKey] || {};
  const baseCapacity = Math.max(0, Number(facility?.rideMachineCapacity) || 0);
  const count = Math.max(0, Number(field?.landFacilityCounts?.[facilityKey]) || (field?.landFacilities?.[facilityKey] ? 1 : 0));
  return (baseCapacity * count) + facilityRideMachineCapacityBonusOfField(field, facilityKey);
};

export const fieldOpenParkingCapacityByPy = (field) => {
  const py = Math.max(0, Number(field?.py) || 0);
  if (py <= 120) return 2;
  if (py <= 250) return 3;
  if (py <= 450) return 4;
  if (py <= 700) return 5;
  return 6;
};

export const fieldProtectedParkingCapacity = (field) => (
  (FACILITIES || []).reduce((sum, facility) => {
    const facilityCapacity = facilityRideMachineCapacityOfField(field, facility?.key);
    if (facilityCapacity <= 0) return sum;
    return sum + facilityCapacity;
  }, 0)
);

export const parkingFacilityDisplayName = (name, facilityKey = '', field = null) => {
  if (facilityActsAsColdStorage(field, facilityKey)) return '저온냉장';
  return String(name || '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || '보관시설';
};

export const fieldProtectedParkingFacilityNames = (field) => (
  (FACILITIES || []).reduce((list, facility) => {
    const basePerUnit = Math.max(0, Number(facility?.rideMachineCapacity) || 0);
    const count = Math.max(0, Number(field?.landFacilityCounts?.[facility.key]) || (field?.landFacilities?.[facility.key] ? 1 : 0));
    if (count <= 0) return list;
    const facilityName = parkingFacilityDisplayName(facility?.name || facility?.key || '보관시설', facility?.key, field);
    const totalSlots = (basePerUnit * count) + facilityRideMachineCapacityBonusOfField(field, facility?.key);
    for (let idx = 0; idx < totalSlots; idx += 1) list.push(facilityName);
    return list;
  }, [])
);

export const fieldParkingSlotZoneLabel = (field, slotNo) => {
  const safeSlotNo = Math.max(1, Math.floor(Number(slotNo) || 0));
  const openCap = Math.max(0, fieldOpenParkingCapacityByPy(field));
  if (safeSlotNo <= openCap) return '노지';
  const protectedNames = fieldProtectedParkingFacilityNames(field);
  return protectedNames[safeSlotNo - openCap - 1] || '보관시설';
};

export const fieldTotalParkingCapacity = (field) => (
  Math.max(0, fieldOpenParkingCapacityByPy(field)) + Math.max(0, fieldProtectedParkingCapacity(field))
);

export const withColdStorageIconName = (name, facilityKey, field = null) => {
  const label = String(name || '');
  const shouldMarkCold = facilityActsAsColdStorage(field, facilityKey) || label.includes('저온저장고');
  return shouldMarkCold && !label.startsWith('❄ ')
    ? `❄ ${label}`
    : label;
};

export const stripColdStorageIconName = (name) => String(name || '').replace(/^❄\s*/, '');
