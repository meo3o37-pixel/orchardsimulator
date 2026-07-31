export const buildFacilityRepairContext = (
  {
    facility,
    field
  },
  deps
) => {
  const durability = deps.fieldFacilityDurabilityOf(field, facility.key);
  const assetValue = deps.facilityInstalledAssetValue(facility, field);
  const damageRatio = deps.clamp((100 - durability) / 100, 0.05, 1);
  const repairCost = Math.max(deps.facilityRepairMinCost, Math.round(assetValue * deps.facilityRepairCostRate * damageRatio));
  return {
    durability,
    assetValue,
    damageRatio,
    repairCost
  };
};

export const applyFacilityRepairStartToField = (
  {
    target,
    facilityKey,
    day,
    readyDay,
    finalCost
  }
) => ({
  ...target,
  facilityRepairByKey: {
    ...(target.facilityRepairByKey || {}),
    [facilityKey]: {
      startDay: day,
      readyDay,
      cost: finalCost
    }
  }
});
