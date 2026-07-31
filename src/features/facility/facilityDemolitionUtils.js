export const applyFacilityDemolitionToField = (
  {
    target,
    facilityKey
  },
  deps
) => {
  const currentCount = deps.fieldFacilityCountOf(target, facilityKey);
  const isTank = deps.tankFacilityKeys.includes(facilityKey);
  const nextFacilities = { ...(target.landFacilities || {}) };
  const nextCounts = { ...(target.landFacilityCounts || {}) };
  if (isTank) {
    if (currentCount > 1) {
      nextCounts[facilityKey] = currentCount - 1;
      nextFacilities[facilityKey] = true;
    } else {
      delete nextCounts[facilityKey];
      delete nextFacilities[facilityKey];
    }
  } else {
    delete nextCounts[facilityKey];
    delete nextFacilities[facilityKey];
  }
  const nextTankOptionMap = { ...(target.tankUpgradeOptionKeysByFacility || {}) };
  const nextTankOptionByUnitMap = { ...(target.tankUpgradeOptionKeysByUnit || {}) };
  const nextHousingOptionMap = { ...(target.housingOptionKeysByFacility || {}) };
  const nextTankDurabilityMap = { ...(target.tankDurabilityByFacility || {}) };
  const nextFacilityDurabilityMap = { ...(target.facilityDurabilityByKey || {}) };
  const nextFacilityRepairByKey = { ...(target.facilityRepairByKey || {}) };
  const nextAppleSortingWarehouseMap = { ...(target.appleSortingWarehouseByFacilityKey || {}) };
  if (isTank) {
    const removeIndex = Math.max(1, currentCount);
    const removeUnitId = `${facilityKey}-${removeIndex}`;
    delete nextTankOptionByUnitMap[removeUnitId];
  }
  if (isTank && (!nextFacilities[facilityKey] || (Number(nextCounts[facilityKey]) || 0) <= 0)) {
    delete nextTankOptionMap[facilityKey];
    delete nextTankDurabilityMap[facilityKey];
    Object.keys(nextTankOptionByUnitMap).forEach((unitId) => {
      if (unitId.startsWith(`${facilityKey}-`)) delete nextTankOptionByUnitMap[unitId];
    });
  }
  if (!nextFacilities[facilityKey] || (Number(nextCounts[facilityKey]) || 0) <= 0) {
    delete nextFacilityDurabilityMap[facilityKey];
    delete nextHousingOptionMap[facilityKey];
    delete nextFacilityRepairByKey[facilityKey];
  }
  if (Array.isArray(deps.appleSortingFacilityKeys) && deps.appleSortingFacilityKeys.includes(facilityKey)) {
    delete nextAppleSortingWarehouseMap[facilityKey];
  }
  if (Array.isArray(deps.dryWarehouseFacilityKeys) && deps.dryWarehouseFacilityKeys.includes(facilityKey)) {
    Object.keys(nextAppleSortingWarehouseMap).forEach((sortingFacilityKey) => {
      if (nextAppleSortingWarehouseMap[sortingFacilityKey] === facilityKey) {
        delete nextAppleSortingWarehouseMap[sortingFacilityKey];
      }
    });
  }
  const nextFieldBase = {
    ...target,
    landFacilities: nextFacilities,
    landFacilityCounts: nextCounts,
    facilityDurabilityByKey: nextFacilityDurabilityMap,
    facilityRepairByKey: nextFacilityRepairByKey,
    appleSortingWarehouseByFacilityKey: nextAppleSortingWarehouseMap,
    tankUpgradeOptionKeysByFacility: nextTankOptionMap,
    tankUpgradeOptionKeysByUnit: nextTankOptionByUnitMap,
    housingOptionKeysByFacility: nextHousingOptionMap,
    evChargeSlotNos: (() => {
      if (facilityKey === 'evChargerStation' && (!nextFacilities[facilityKey] || (Number(nextCounts[facilityKey]) || 0) <= 0)) {
        return [];
      }
      const totalCap = Math.max(0, Math.min(deps.parkingMaxSlots, deps.fieldTotalParkingCapacity({
        ...target,
        landFacilities: nextFacilities,
        landFacilityCounts: nextCounts
      })));
      const raw = Array.isArray(target?.evChargeSlotNos) ? target.evChargeSlotNos : [];
      return Array.from(new Set(raw.map((slotNo) => Math.floor(Number(slotNo) || 0)).filter((slotNo) => slotNo >= 1 && slotNo <= totalCap)));
    })(),
    evSlowChargeReservedInstanceId: (() => {
      if (facilityKey === 'evChargerStation' && (!nextFacilities[facilityKey] || (Number(nextCounts[facilityKey]) || 0) <= 0)) return '';
      return String(target?.evSlowChargeReservedInstanceId || '');
    })(),
    tankDurabilityByFacility: nextTankDurabilityMap
  };
  const nextTankCapacity = deps.fieldTankCapacityLiters(nextFieldBase);
  return {
    ...nextFieldBase,
    tankWaterLiters: Math.min(Math.max(0, Number(target.tankWaterLiters) || 0), nextTankCapacity),
    irrigationPlan: (() => {
      const plan = target?.irrigationPlan || null;
      if (!plan) return null;
      if (!nextFieldBase?.landFacilities?.wellFacility || !nextFieldBase?.landFacilities?.farmPowerElectric) return null;
      if (deps.fieldTankCapacityLiters(nextFieldBase) <= 0) return null;
      if (deps.fieldFacilityCountOf(nextFieldBase, plan.facilityKey) <= 0) return null;
      return plan;
    })()
  };
};
