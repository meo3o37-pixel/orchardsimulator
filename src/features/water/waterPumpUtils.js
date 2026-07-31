const calcPumpLaborNeed = (addLiters, deps, field) => {
  const hasAutoValve = deps.fieldHasAutoRefillSystem(field);
  if (hasAutoValve) return 0;
  return Math.max(1, Math.ceil(addLiters / deps.waterPumpUnitLiter) * deps.waterPumpLaborPer1000L);
};

const calcPumpFees = (addLiters, deps) => ({
  powerFee: Math.max(1, Math.round((addLiters / deps.waterPumpUnitLiter) * deps.waterPumpPowerFeePer1000L)),
  envFee: Math.max(1, Math.round(addLiters * deps.waterEnvFeePerLiter))
});

const buildTankDurabilityByFacility = (target, nextFacilityDurabilityByKey, deps) =>
  deps.tankFacilityKeys.reduce((acc, tankKey) => {
    if (deps.fieldFacilityCountOf(target, tankKey) <= 0) return acc;
    acc[tankKey] = deps.clamp(Number(nextFacilityDurabilityByKey?.[tankKey] ?? 100), 0, 100);
    return acc;
  }, {});

export const buildWaterPumpRequestContext = (
  {
    field,
    day,
    liters,
    unitId = '',
    labor = 0,
    money = 0
  },
  deps
) => {
  const pumpLiters = Math.max(deps.waterPumpUnitLiter, Math.floor(Number(liters) || deps.waterPumpUnitLiter));
  if (!deps.fieldFacilityUsable(field, 'farmPowerElectric', day)) {
    return { ok: false, message: '한전 농사용전기 시설 내구도를 확인하거나 수리를 진행해 주세요.' };
  }
  if (!deps.fieldFacilityUsable(field, 'wellFacility', day)) {
    return { ok: false, message: '관정 시설 내구도를 확인하거나 수리를 진행해 주세요.' };
  }
  const groundwaterAvailableLiters = Math.max(0, (Number(field?.groundwaterTonsBase) || 0) * 1000);
  if (unitId) {
    const units = deps.splitTankWaterByUnit(field, Math.max(0, Number(field?.tankWaterLiters) || 0));
    const targetUnit = units.find((entry) => entry.unitId === unitId);
    if (!targetUnit) return { ok: false, message: '' };
    if (!deps.fieldFacilityUsable(field, targetUnit.facilityKey, day)) {
      return { ok: false, message: '해당 물탱크는 내구도 0%이거나 수리 중입니다.' };
    }
    const room = Math.max(0, targetUnit.capacity - targetUnit.water);
    if (room <= 0) return { ok: false, message: '해당 물탱크가 이미 가득 찼습니다.' };
    const addable = Math.min(pumpLiters, room, groundwaterAvailableLiters);
    if (addable <= 0) return { ok: false, message: '지하수 잔량이 부족합니다.' };
    const laborNeed = calcPumpLaborNeed(addable, deps, field);
    if (labor < laborNeed) return { ok: false, message: `노동력이 부족합니다. (필요 ${laborNeed})` };
    const { powerFee, envFee } = calcPumpFees(addable, deps);
    if (money < (powerFee + envFee)) {
      return { ok: false, message: `자금이 부족합니다. (전기료 ${deps.won(powerFee)} / 환경부담금 ${deps.won(envFee)})` };
    }
    return {
      ok: true,
      unitId,
      pumpLiters,
      addable,
      laborNeed,
      powerFee,
      envFee,
      targetUnit
    };
  }
  const capacity = deps.fieldTankOperationalCapacityLiters(field, day);
  if (capacity <= 0) return { ok: false, message: 'PE물탱크가 설치된 토지에서만 물 퍼올리기가 가능합니다.' };
  const current = Math.max(0, Number(field?.tankWaterLiters) || 0);
  if (current >= capacity) return { ok: false, message: '물탱크가 이미 가득 찼습니다.' };
  const addable = Math.min(pumpLiters, capacity - current, groundwaterAvailableLiters);
  if (addable <= 0) return { ok: false, message: '지하수 잔량이 부족합니다.' };
  const laborNeed = calcPumpLaborNeed(addable, deps, field);
  if (labor < laborNeed) return { ok: false, message: `노동력이 부족합니다. (필요 ${laborNeed})` };
  const { powerFee, envFee } = calcPumpFees(addable, deps);
  if (money < (powerFee + envFee)) {
    return { ok: false, message: `자금이 부족합니다. (전기료 ${deps.won(powerFee)} / 환경부담금 ${deps.won(envFee)})` };
  }
  return {
    ok: true,
    unitId: '',
    pumpLiters,
    addable,
    laborNeed,
    powerFee,
    envFee
  };
};

export const applyWaterPumpToField = (
  {
    target,
    day,
    liters,
    unitId = '',
    labor = 0,
    money = 0
  },
  deps
) => {
  const request = buildWaterPumpRequestContext({
    field: target,
    day,
    liters,
    unitId,
    labor,
    money
  }, deps);
  if (!request?.ok) return null;
  const groundwaterAvailable = Math.max(0, (Number(target?.groundwaterTonsBase) || 0) * 1000);
  if (unitId) {
    const currentUnits = deps.splitTankWaterByUnit(target, Math.max(0, Number(target?.tankWaterLiters) || 0));
    const unitIndex = currentUnits.findIndex((entry) => entry.unitId === unitId);
    if (unitIndex < 0) return null;
    const selectedUnit = currentUnits[unitIndex];
    if (!deps.fieldFacilityUsable(target, selectedUnit.facilityKey, day)) return null;
    const unitRoom = Math.max(0, selectedUnit.capacity - selectedUnit.water);
    const realAdd = Math.min(request.addable, unitRoom, groundwaterAvailable);
    if (realAdd <= 0) return null;
    const realLaborNeed = calcPumpLaborNeed(realAdd, deps, target);
    if (labor < realLaborNeed) return null;
    const { powerFee, envFee } = calcPumpFees(realAdd, deps);
    if (money < (powerFee + envFee)) return null;
    currentUnits[unitIndex] = { ...selectedUnit, water: selectedUnit.water + realAdd };
    const nextTotal = currentUnits.reduce((sum, unit) => sum + (Number(unit.water) || 0), 0);
    let nextFacilityDurabilityByKey = { ...(target?.facilityDurabilityByKey || target?.tankDurabilityByFacility || {}) };
    const wellRule = deps.facilityDurabilityRuleOf('wellFacility');
    const powerRule = deps.facilityDurabilityRuleOf('farmPowerElectric');
    const tankRule = deps.facilityDurabilityRuleOf(selectedUnit.facilityKey);
    nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      'wellFacility',
      ((wellRule.pumpManualPer1000L || 0) * realAdd) / deps.waterPumpUnitLiter
    );
    nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      'farmPowerElectric',
      ((powerRule.pumpManualPer1000L || 0) * realAdd) / deps.waterPumpUnitLiter
    );
    nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      selectedUnit.facilityKey,
      ((tankRule.tankFillPer1000L || 0) * realAdd) / deps.waterPumpUnitLiter
    );
    return {
      nextField: {
        ...target,
        tankWaterLiters: nextTotal,
        tankWaterLitersByUnit: deps.tankUnitWaterMapFromUnits(currentUnits),
        groundwaterTonsBase: Math.max(0, (groundwaterAvailable - realAdd) / 1000),
        facilityDurabilityByKey: nextFacilityDurabilityByKey,
        tankDurabilityByFacility: buildTankDurabilityByFacility(target, nextFacilityDurabilityByKey, deps)
      },
      realAdd,
      laborNeed: realLaborNeed,
      powerFee,
      envFee,
      unitIndexLabel: selectedUnit.index
    };
  }
  const targetCapacity = deps.fieldTankOperationalCapacityLiters(target, day);
  if (targetCapacity <= 0) return null;
  const before = Math.max(0, Number(target?.tankWaterLiters) || 0);
  const realAdd = Math.min(request.addable, targetCapacity - before, groundwaterAvailable);
  if (realAdd <= 0) return null;
  const realLaborNeed = calcPumpLaborNeed(realAdd, deps, target);
  if (labor < realLaborNeed) return null;
  const { powerFee, envFee } = calcPumpFees(realAdd, deps);
  if (money < (powerFee + envFee)) return null;
  const nextTotal = before + realAdd;
  const nextUnits = deps.splitTankWaterByUnit(target, nextTotal);
  const beforeByFacility = deps.splitTankWaterByFacility(target, before);
  const afterByFacility = deps.splitTankWaterByFacility(
    { ...target, tankWaterLitersByUnit: deps.tankUnitWaterMapFromUnits(nextUnits) },
    nextTotal
  );
  let nextFacilityDurabilityByKey = { ...(target?.facilityDurabilityByKey || target?.tankDurabilityByFacility || {}) };
  const wellRule = deps.facilityDurabilityRuleOf('wellFacility');
  const powerRule = deps.facilityDurabilityRuleOf('farmPowerElectric');
  nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
    nextFacilityDurabilityByKey,
    'wellFacility',
    ((wellRule.pumpManualPer1000L || 0) * realAdd) / deps.waterPumpUnitLiter
  );
  nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
    nextFacilityDurabilityByKey,
    'farmPowerElectric',
    ((powerRule.pumpManualPer1000L || 0) * realAdd) / deps.waterPumpUnitLiter
  );
  deps.tankFacilityKeys.forEach((tankKey) => {
    const increased = Math.max(0, (Number(afterByFacility[tankKey]) || 0) - (Number(beforeByFacility[tankKey]) || 0));
    if (increased <= 0) return;
    const rule = deps.facilityDurabilityRuleOf(tankKey);
    nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      tankKey,
      ((rule.tankFillPer1000L || 0) * increased) / deps.waterPumpUnitLiter
    );
  });
  return {
    nextField: {
      ...target,
      tankWaterLiters: nextTotal,
      tankWaterLitersByUnit: deps.tankUnitWaterMapFromUnits(nextUnits),
      groundwaterTonsBase: Math.max(0, (groundwaterAvailable - realAdd) / 1000),
      facilityDurabilityByKey: nextFacilityDurabilityByKey,
      tankDurabilityByFacility: buildTankDurabilityByFacility(target, nextFacilityDurabilityByKey, deps)
    },
    realAdd,
    laborNeed: realLaborNeed,
    powerFee,
    envFee,
    unitIndexLabel: null
  };
};

export const formatWaterPumpLogText = (
  {
    fieldName,
    liters,
    powerFee,
    envFee,
    laborNeed,
    unitIndexLabel = null
  },
  deps
) => `${fieldName} ${unitIndexLabel ? `${unitIndexLabel}호 탱크 ` : ''}물 퍼올리기 ${liters.toLocaleString()}L (전기료 -${deps.won(powerFee)} / 환경부담금 -${deps.won(envFee)}${laborNeed > 0 ? ` / 노동력 -${laborNeed}` : ''})`;
