export const normalizeFacilityScopedMap = (raw) => {
  if (!raw || typeof raw !== 'object') return {};
  const next = {};
  Object.entries(raw).forEach(([facilityKeyRaw, value]) => {
    const facilityKey = String(facilityKeyRaw || '');
    if (!facilityKey || !value || typeof value !== 'object') return;
    const safeMap = {};
    Object.entries(value).forEach(([itemKey, qty]) => {
      const safeKey = String(itemKey || '');
      const safeQty = Math.max(0, Number(qty) || 0);
      if (!safeKey || safeQty <= 0) return;
      safeMap[safeKey] = safeQty;
    });
    if (Object.keys(safeMap).length) next[facilityKey] = safeMap;
  });
  return next;
};

export const warehouseFacilityKeysOfField = (
  field,
  { storageCapacityByFacility = {}, fieldFacilityCountOf = () => 0 } = {}
) =>
  Object.keys(storageCapacityByFacility || {})
    .filter((facilityKey) => fieldFacilityCountOf(field, facilityKey) > 0);

export const defaultWarehouseFacilityKeyOfField = (
  field,
  {
    storageCapacityByFacility = {},
    fieldFacilityCountOf = () => 0,
    facilityActsAsColdStorage = () => false
  } = {}
) => {
  const keys = warehouseFacilityKeysOfField(field, { storageCapacityByFacility, fieldFacilityCountOf });
  if (!keys.length) return '';
  const nonCold = keys.find((key) => !facilityActsAsColdStorage(field, key));
  return String(nonCold || keys[0] || '');
};

export const resolveFieldFacilityInventoryByFacility = ({
  gameState,
  fieldIndex,
  storageCapacityByFacility = {},
  fieldFacilityCountOf = () => 0,
  facilityActsAsColdStorage = () => false,
  normalizeCargoByItemKey = (value) => value
} = {}) => {
  const safeIndex = Math.max(0, Number(fieldIndex) || 0);
  const field = gameState?.fields?.[safeIndex] || null;
  const fieldId = String(field?.id || '');
  const defaultFacilityKey = defaultWarehouseFacilityKeyOfField(field, {
    storageCapacityByFacility,
    fieldFacilityCountOf,
    facilityActsAsColdStorage
  });
  const warehouseKeys = warehouseFacilityKeysOfField(field, {
    storageCapacityByFacility,
    fieldFacilityCountOf
  });
  const totalInventory = normalizeCargoByItemKey(gameState?.inventory || {});
  const rawByFacility = normalizeFacilityScopedMap(
    gameState?.fieldFacilityInventoryByFieldId?.[fieldId] || {}
  );
  const byFacility = { ...rawByFacility };
  warehouseKeys.forEach((facilityKey) => {
    if (!byFacility[facilityKey]) byFacility[facilityKey] = {};
  });
  const allocatedTotals = {};
  Object.values(byFacility).forEach((facilityMap) => {
    Object.entries(facilityMap || {}).forEach(([itemKey, qty]) => {
      const safeQty = Math.max(0, Number(qty) || 0);
      if (!itemKey || safeQty <= 0) return;
      allocatedTotals[itemKey] = Math.max(0, Number(allocatedTotals[itemKey]) || 0) + safeQty;
    });
  });
  if (defaultFacilityKey) {
    const fallbackMap = { ...(byFacility[defaultFacilityKey] || {}) };
    Object.entries(totalInventory).forEach(([itemKey, totalQty]) => {
      const safeTotal = Math.max(0, Number(totalQty) || 0);
      const allocated = Math.max(0, Number(allocatedTotals[itemKey]) || 0);
      const unallocated = Math.max(0, safeTotal - allocated);
      if (unallocated <= 0) return;
      fallbackMap[itemKey] = Math.max(0, Number(fallbackMap[itemKey]) || 0) + unallocated;
    });
    byFacility[defaultFacilityKey] = normalizeCargoByItemKey(fallbackMap);
  }
  Object.keys(byFacility).forEach((facilityKey) => {
    const normalized = normalizeCargoByItemKey(byFacility[facilityKey]);
    if (Object.keys(normalized).length) {
      byFacility[facilityKey] = normalized;
    } else {
      delete byFacility[facilityKey];
    }
  });
  return { fieldId, defaultFacilityKey, byFacility };
};
