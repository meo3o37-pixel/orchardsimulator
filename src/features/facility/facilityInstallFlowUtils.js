const panelWarehouseCoolingFacilityKeys = ['panelWarehouse3', 'panelWarehouse5', 'panelWarehouse8'];

export const buildFacilityInstallContext = (
  {
    facility,
    field,
    game,
    fieldIndex,
    installRequest = {}
  },
  deps
) => {
  const isTank = deps.tankFacilityKeys.includes(facility.key);
  const hasFacilityBuildOptions = deps.housingOptionKeysOfFacility(facility.key).length > 0;
  const isWell = facility.key === 'wellFacility';
  const isIrrigation = deps.irrigationFacilityKeys.includes(facility.key);
  const isTreeCountFacility = isIrrigation || Boolean(facility?.perTree);
  const tankUpgradeOptionKeys = isTank
    ? Array.from(new Set(installRequest.tankUpgradeOptionKeys || [])).filter((key) => Boolean(deps.tankUpgradeOptionMap[key]))
    : [];
  const validHousingOptionKeys = deps.housingOptionKeysOfFacility(facility.key);
  const housingOptionKeys = hasFacilityBuildOptions
    ? Array.from(new Set(installRequest.housingOptionKeys || [])).filter((key) => validHousingOptionKeys.includes(key))
    : [];
  const wellDepthOptionKey = isWell && deps.wellDepthOptionKeys.includes(String(installRequest?.wellDepthOptionKey || ''))
    ? String(installRequest.wellDepthOptionKey)
    : '';
  const wellPrecisionSensorEnabled = isWell ? Boolean(installRequest?.wellPrecisionSensorEnabled) : false;
  const requestedTreeInstallCountRaw = Math.max(0, Math.floor(Number(installRequest?.requestedTreeInstallCount) || 0));
  const availableTreeAssignable = isIrrigation
    ? Math.max(0, deps.fieldIrrigationUnassignedTrees(field))
    : (facility.perTree ? Math.max(0, deps.fieldPerTreeFacilityUnassignedTrees(field, facility.key)) : 0);
  const treeInstallCount = isTreeCountFacility
    ? (availableTreeAssignable <= 0
      ? 0
      : (requestedTreeInstallCountRaw > 0 ? Math.min(requestedTreeInstallCountRaw, availableTreeAssignable) : availableTreeAssignable))
    : 0;
  const optionCost = isTank ? deps.tankOptionExtraCost(tankUpgradeOptionKeys) : 0;
  const housingCost = hasFacilityBuildOptions ? deps.housingOptionExtraCost(facility.key, housingOptionKeys) : 0;
  const housingFurnitureCost = deps.housingFacilityKeys?.includes(facility.key) && installRequest?.housingFurnitureIncluded
    ? Math.max(0, Number(deps.housingDefaultFurniturePackageCostOfFacility?.(facility.key)) || 0)
    : 0;
  const wellOptionCost = isWell ? deps.wellBuildOptionExtraCost(wellDepthOptionKey, wellPrecisionSensorEnabled) : 0;
  const treeInstallCost = treeInstallCount * Math.max(0, Number(facility?.unitPricePerTree) || 0);
  const baseInstallCost = isTreeCountFacility ? treeInstallCost : deps.facilityCost(facility, game, fieldIndex);
  const installCost = baseInstallCost + optionCost + housingCost + housingFurnitureCost + wellOptionCost;
  return {
    isTank,
    hasFacilityBuildOptions,
    isWell,
    isIrrigation,
    isTreeCountFacility,
    tankUpgradeOptionKeys,
    housingOptionKeys,
    wellDepthOptionKey,
    wellPrecisionSensorEnabled,
    requestedTreeInstallCountRaw,
    availableTreeAssignable,
    treeInstallCount,
    optionCost,
    housingCost,
    housingFurnitureCost,
    wellOptionCost,
    treeInstallCost,
    baseInstallCost,
    installCost
  };
};

export const resolveFacilityInstallUprootState = (
  {
    field,
    facilityKey,
    day,
    skipUprootPrompt = false,
    uprootPlanByAge = {},
    nextMaxTreesAfterInstall = 0
  },
  deps
) => {
  let target = field;
  let uprootSummaryText = '';
  let trellisUprootSummaryText = '';
  let irrigationUprootSummaryText = '';
  const requiredUprootTrees = deps.facilityInstallRequiredUprootTrees(target, facilityKey);
  if (requiredUprootTrees > 0) {
    if (!skipUprootPrompt) return { ok: false, target: field };
    const planCheck = deps.validateFacilityUprootPlan(target, day, requiredUprootTrees, uprootPlanByAge || {});
    if (!planCheck.ok) return { ok: false, target: field };
    const uprootResult = deps.applyUprootPlanToField(target, day, planCheck.planByAge);
    target = uprootResult.field;
    const trellisUprootResult = deps.applyTrellisAutoUprootForFacilityInstall(target, uprootResult.removedTotal, nextMaxTreesAfterInstall);
    target = trellisUprootResult.field;
    const byAgeText = Object.entries(uprootResult.removedByAge)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([ageKey, qty]) => `${ageKey}년차 ${qty}주`)
      .join(', ');
    if (uprootResult.removedTotal > 0) {
      uprootSummaryText = byAgeText
        ? ` / 나무 제거 ${uprootResult.removedTotal}주 (${byAgeText})`
        : ` / 나무 제거 ${uprootResult.removedTotal}주`;
    }
    if (trellisUprootResult.removedTotal > 0) {
      trellisUprootSummaryText = ' / 지주대 자동 해체 ' + trellisUprootResult.removedTotal + '주'
        + (trellisUprootResult.removedByCapacity > 0 ? ` (수용주수 초과분 ${trellisUprootResult.removedByCapacity}주 포함)` : '');
      const irrigationRemovedEntries = Object.entries(trellisUprootResult.irrigationRemovedByKey || {})
        .filter(([, qty]) => (Number(qty) || 0) > 0)
        .map(([key, qty]) => `${deps.facilityMap?.[key]?.name || key} ${Math.max(0, Math.floor(Number(qty) || 0))}주`);
      if (irrigationRemovedEntries.length > 0) {
        irrigationUprootSummaryText = ` / 관수시설 자동 해체 ${irrigationRemovedEntries.join(', ')}`;
      }
    }
    return { ok: true, target, uprootSummaryText, trellisUprootSummaryText, irrigationUprootSummaryText };
  }
  const trellisUprootResult = deps.applyTrellisAutoUprootForFacilityInstall(target, 0, nextMaxTreesAfterInstall);
  target = trellisUprootResult.field;
  if (trellisUprootResult.removedTotal > 0) {
    trellisUprootSummaryText = ' / 지주대 자동 해체 ' + trellisUprootResult.removedTotal + '주'
      + (trellisUprootResult.removedByCapacity > 0 ? ` (수용주수 초과분 ${trellisUprootResult.removedByCapacity}주 포함)` : '');
    const irrigationRemovedEntries = Object.entries(trellisUprootResult.irrigationRemovedByKey || {})
      .filter(([, qty]) => (Number(qty) || 0) > 0)
      .map(([key, qty]) => `${deps.facilityMap?.[key]?.name || key} ${Math.max(0, Math.floor(Number(qty) || 0))}주`);
    if (irrigationRemovedEntries.length > 0) {
      irrigationUprootSummaryText = ` / 관수시설 자동 해체 ${irrigationRemovedEntries.join(', ')}`;
    }
  }
  return { ok: true, target, uprootSummaryText, trellisUprootSummaryText, irrigationUprootSummaryText };
};

export const applyFacilityInstallToField = (
  {
    target,
    facility,
    installRequest = {},
    treeInstallCount = 0,
    tankUpgradeOptionKeys = [],
    housingOptionKeys = [],
    wellDepthOptionKey = '',
    wellPrecisionSensorEnabled = false
  },
  deps
) => {
  const isTank = deps.tankFacilityKeys.includes(facility.key);
  const isIrrigation = deps.irrigationFacilityKeys.includes(facility.key);
  const isWell = facility.key === 'wellFacility';
  const hasFacilityBuildOptions = deps.housingOptionKeysOfFacility(facility.key).length > 0;
  const currentCount = Math.max(0, Number(target?.landFacilityCounts?.[facility.key]) || 0);
  const irrigationAssign = isIrrigation ? treeInstallCount : 0;
  const perTreeAssign = (facility.perTree && !isIrrigation) ? treeInstallCount : 0;
  const currentTankOptionMap = target?.tankUpgradeOptionKeysByFacility || {};
  const currentTankUnitOptionMap = target?.tankUpgradeOptionKeysByUnit || {};
  const nextTankUnitOptionMap = { ...currentTankUnitOptionMap };
  const currentHousingOptionMap = target?.housingOptionKeysByFacility || {};
  const currentHousingOptionKeys = Array.isArray(currentHousingOptionMap?.[facility.key]) ? currentHousingOptionMap[facility.key] : [];
  const mergedHousingOptionKeys = Array.from(new Set([...currentHousingOptionKeys, ...housingOptionKeys]));
  const currentHousingFurnitureMap = target?.housingFurnitureInstallationsByFacilityKey || {};
  const existingHousingFurniture = currentHousingFurnitureMap?.[facility.key] || {};
  const nextHousingFurniture = deps.housingFacilityKeys?.includes(facility.key) && installRequest?.housingFurnitureIncluded
    ? deps.normalizeHousingFurnitureInstallations?.({
        ...deps.housingDefaultFurnitureOfFacility?.(facility.key),
        ...existingHousingFurniture
      }, facility.key)
    : deps.normalizeHousingFurnitureInstallations?.(existingHousingFurniture, facility.key);
  const currentAppleSortingWarehouseMap = target?.appleSortingWarehouseByFacilityKey || {};
  const currentTankDurabilityMap = target?.tankDurabilityByFacility || {};
  const currentTankDurability = deps.clamp(Number(currentTankDurabilityMap?.[facility.key] ?? 100), 0, 100);
  const nextTankDurability = isTank ? ((currentTankDurability * currentCount) + 100) / Math.max(1, currentCount + 1) : currentTankDurability;
  const currentFacilityDurabilityMap = target?.facilityDurabilityByKey || {};
  const currentFacilityDurability = deps.clamp(Number(currentFacilityDurabilityMap?.[facility.key] ?? 100), 0, 100);
  const addCount = isTank ? 1 : isIrrigation ? Math.max(1, irrigationAssign) : facility.perTree ? Math.max(1, perTreeAssign) : 1;
  const nextFacilityDurability = ((currentFacilityDurability * Math.max(0, currentCount)) + (100 * addCount)) / Math.max(1, currentCount + addCount);
  const isAppleSortingFacility = Array.isArray(deps.appleSortingFacilityKeys) && deps.appleSortingFacilityKeys.includes(facility.key);
  const requestedAppleSortingWarehouseFacilityKey = String(installRequest?.selectedWarehouseFacilityKey || '');
  const nextAppleSortingWarehouseMap = isAppleSortingFacility
    ? {
      ...currentAppleSortingWarehouseMap,
      ...(Array.isArray(deps.dryWarehouseFacilityKeys) && deps.dryWarehouseFacilityKeys.includes(requestedAppleSortingWarehouseFacilityKey)
        ? { [facility.key]: requestedAppleSortingWarehouseFacilityKey }
        : {})
    }
    : { ...currentAppleSortingWarehouseMap };
  if (isTank) {
    const nextUnitIndex = currentCount + 1;
    const nextUnitId = facility.key + '-' + nextUnitIndex;
    if (tankUpgradeOptionKeys.length > 0) nextTankUnitOptionMap[nextUnitId] = Array.from(new Set(tankUpgradeOptionKeys));
  }
  let nextControlPanelOrder = deps.normalizeControlPanelOrder(target?.controlPanelOrder);
  if (facility.key === 'wellFacility' && addCount > 0) nextControlPanelOrder = deps.appendControlPanelOrderKey(nextControlPanelOrder, 'wellPanel');
  if (facility.key === 'farmPowerElectric' && addCount > 0) nextControlPanelOrder = deps.appendControlPanelOrderKey(nextControlPanelOrder, 'farmPower');
  if (facility.key === 'evChargerStation' && addCount > 0) nextControlPanelOrder = deps.appendControlPanelOrderKey(nextControlPanelOrder, 'evCharger');
  if (facility.key === 'autoRefillSystem' || (isTank && tankUpgradeOptionKeys.includes('autoRefillValve'))) nextControlPanelOrder = deps.appendControlPanelOrderKey(nextControlPanelOrder, 'autoRefill');
  if (isTank && tankUpgradeOptionKeys.includes('irrigationPump')) nextControlPanelOrder = deps.appendControlPanelOrderKey(nextControlPanelOrder, 'irrigationPump');
  if (deps.irrigationControlPlanFacilityKeys.includes(facility.key) && addCount > 0) nextControlPanelOrder = deps.appendControlPanelOrderKey(nextControlPanelOrder, 'irrigation');
  if (facility.key === deps.microSprinklerIrrigationFacilityKey && addCount > 0) nextControlPanelOrder = deps.appendControlPanelOrderKey(nextControlPanelOrder, 'microSprinkler');
  if (facility.key === 'frostFan' && addCount > 0) nextControlPanelOrder = deps.appendControlPanelOrderKey(nextControlPanelOrder, 'frostFan');
  if (deps.coldStorageFacilityKeys.includes(facility.key) && addCount > 0) nextControlPanelOrder = deps.appendControlPanelOrderKey(nextControlPanelOrder, 'coldStorage');
  if (panelWarehouseCoolingFacilityKeys.includes(facility.key) && housingOptionKeys.includes(deps.panelWarehouseCoolingOptionKey)) nextControlPanelOrder = deps.appendControlPanelOrderKey(nextControlPanelOrder, 'panelCooling');
  const baseEvChargeSlots = Array.isArray(target?.evChargeSlotNos) ? target.evChargeSlotNos : [];
  const nextEvChargeSlotNos = (() => {
    if (facility.key !== 'evChargerStation') return baseEvChargeSlots;
    const totalCap = Math.max(0, Math.min(deps.parkingMaxSlots, deps.fieldTotalParkingCapacity(target)));
    const slotNo = deps.clamp(Math.floor(Number(installRequest?.evChargeSlotNo) || 0), 1, totalCap);
    if (slotNo <= 0) return baseEvChargeSlots;
    return Array.from(new Set([...baseEvChargeSlots, slotNo])).filter((x) => x >= 1 && x <= totalCap).sort((a, b) => a - b);
  })();
  return {
    ...target,
    landFacilities: { ...(target.landFacilities || {}), [facility.key]: true },
    landFacilityCounts: {
      ...(target.landFacilityCounts || {}),
      [facility.key]: currentCount + addCount
    },
    tankWaterLiters: Math.max(0, Number(target.tankWaterLiters) || 0),
    facilityDurabilityByKey: { ...currentFacilityDurabilityMap, [facility.key]: deps.clamp(nextFacilityDurability, 0, 100) },
    tankUpgradeOptionKeysByFacility: isTank ? { ...currentTankOptionMap } : { ...(target.tankUpgradeOptionKeysByFacility || {}) },
    tankUpgradeOptionKeysByUnit: isTank ? nextTankUnitOptionMap : { ...(target.tankUpgradeOptionKeysByUnit || {}) },
    appleSortingWarehouseByFacilityKey: nextAppleSortingWarehouseMap,
    housingOptionKeysByFacility: hasFacilityBuildOptions ? { ...currentHousingOptionMap, [facility.key]: mergedHousingOptionKeys } : { ...(target.housingOptionKeysByFacility || {}) },
    housingFurnitureInstallationsByFacilityKey: deps.housingFacilityKeys?.includes(facility.key)
      ? {
          ...currentHousingFurnitureMap,
          ...(nextHousingFurniture && Object.keys(nextHousingFurniture).length > 0 ? { [facility.key]: nextHousingFurniture } : {})
        }
      : { ...(target.housingFurnitureInstallationsByFacilityKey || {}) },
    wellDepthOptionKey: isWell ? (wellDepthOptionKey || (deps.wellDepthOptionKeys[0] || 'wellDepth50m')) : String(target?.wellDepthOptionKey || ''),
    wellPrecisionSensorEnabled: isWell ? wellPrecisionSensorEnabled : Boolean(target?.wellPrecisionSensorEnabled),
    controlPanelOrder: nextControlPanelOrder,
    evChargeSlotNos: nextEvChargeSlotNos,
    tankDurabilityByFacility: isTank ? { ...currentTankDurabilityMap, [facility.key]: deps.clamp(nextTankDurability, 0, 100) } : { ...(target.tankDurabilityByFacility || {}) }
  };
};
