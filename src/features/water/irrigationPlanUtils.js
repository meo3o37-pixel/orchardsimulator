export const buildIrrigationPlanStartContext = (
  {
    field,
    day,
    facilityKey,
    litersPerTreePerDay,
    maxLitersPerTree,
    hasControlSystem
  },
  deps
) => {
  if (!hasControlSystem) return { ok: false, message: '관수 제어시스템 설치 후 사용할 수 있습니다.' };
  if ((Number(field?.trees) || 0) <= 0) return { ok: false, message: '식재된 나무가 있어야 관수 설정이 가능합니다.' };
  if (!deps.fieldFacilityUsable(field, 'wellFacility', day)) {
    return { ok: false, message: '관정 시설 내구도를 확인하거나 수리를 진행해 주세요.' };
  }
  if (!deps.fieldFacilityUsable(field, 'farmPowerElectric', day)) {
    return { ok: false, message: '한전 농사용전기 시설 내구도를 확인하거나 수리를 진행해 주세요.' };
  }
  if (deps.fieldTankOperationalCapacityLiters(field, day) <= 0) {
    return { ok: false, message: '사용 가능한 PE물탱크가 필요합니다. (내구도 0%/수리중 제외)' };
  }
  if (!deps.fieldFacilityUsable(field, facilityKey, day)) {
    return { ok: false, message: '해당 관수시설이 내구도 0%이거나 수리 중입니다.' };
  }
  return {
    ok: true,
    litersPerTreePerDay: deps.clamp(Number(litersPerTreePerDay) || 0, deps.irrigationMinLitersPerTree, maxLitersPerTree)
  };
};

export const createIrrigationPlan = (
  {
    facilityKey,
    litersPerTreePerDay,
    day
  },
  deps
) => ({
  facilityKey,
  litersPerTreePerDay,
  startDay: day,
  endDay: day + deps.irrigationMaxDays - 1
});

export const applyIrrigationPlanToField = ({ target, plan }) => ({
  ...target,
  irrigationPlan: plan
});

export const applyIrrigationPlanLitersUpdate = (
  {
    target,
    facilityKey,
    litersPerTreePerDay
  }
) => {
  if (!target?.irrigationPlan || target.irrigationPlan.facilityKey !== facilityKey) return null;
  return {
    ...target,
    irrigationPlan: {
      ...target.irrigationPlan,
      litersPerTreePerDay
    }
  };
};

export const clearIrrigationPlan = (target) => {
  if (!target?.irrigationPlan) return null;
  return {
    ...target,
    irrigationPlan: null
  };
};

export const formatIrrigationPlanStartLogText = ({ fieldName, facilityName, litersPerTreePerDay }) =>
  `${fieldName} 자동 관수 설정: ${facilityName} / ${litersPerTreePerDay}L·주·일`;

export const formatIrrigationPlanStopLogText = ({ fieldName }) =>
  `${fieldName} 자동 관수 중지`;
