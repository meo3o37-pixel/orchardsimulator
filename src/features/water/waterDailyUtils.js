import { infrastructureIrrigationDelivery, infrastructureIrrigationDemand } from '../cadastre/infrastructureIrrigation.js';
export const processDailyWaterSystems = (
  {
    field,
    nextDay,
    prevMoney,
    autoRefillSpentMoney = 0,
    initialFacilityDurabilityByKey = {}
  },
  deps
) => {
  const designed = Boolean(field?.orchardInfrastructure?.irrigation);
  const plan = designed ? null : field?.irrigationPlan || null;
  const hasIrrigationControlSystem = deps.fieldFacilityCountOf(field, 'irrigationControlSystem') > 0;
  const irrigationPumpActive = deps.fieldIrrigationPumpActive(field);
  const planActive = Boolean(
    hasIrrigationControlSystem
    && plan
    && (Number(plan.startDay) || 0) <= nextDay
    && nextDay <= (Number(plan.endDay) || 0)
    && deps.fieldFacilityUsable(field, plan.facilityKey, nextDay)
  );
  const plantedTrees = Math.max(0, Number(field?.trees) || 0);
  const tankCapacity = deps.fieldTankOperationalCapacityLiters(field, nextDay);
  const tankBefore = deps.clamp(Number(field?.tankWaterLiters) || 0, 0, tankCapacity);
  const groundwaterTonsBefore = Math.max(0, Number(field?.groundwaterTonsBase) || 0);
  const groundwaterDailyRechargeLiters = Math.max(0, Number(field?.groundwaterDailyRechargeLiters) || 0);
  let groundwaterLitersAvailable = groundwaterTonsBefore * 1000;
  const hasAutoRefillValve = deps.fieldHasAutoRefillSystem(field);
  const autoRefillEnabled = Boolean(field?.autoRefillEnabled);
  const hasInsulationCover = deps.fieldHasTankOption(field, 'insulationCover');
  const hasTankInfra = deps.fieldFacilityUsable(field, 'wellFacility', nextDay)
    && deps.fieldFacilityUsable(field, 'farmPowerElectric', nextDay)
    && tankCapacity > 0;
  let tankAfterAutoRefill = tankBefore;
  let autoRefillUsedLiters = 0;
  let autoRefillPowerFeeTotal = 0;
  let autoRefillEnvFeeTotal = 0;
  const autoRefillTargetWater = Math.floor(tankCapacity * deps.tankAutoRefillTargetRatio);
  const tryAutoRefill = (needLiters) => {
    if (!hasAutoRefillValve || !autoRefillEnabled || !hasTankInfra) return 0;
    const refillNeedLiters = Math.max(0, Number(needLiters) || 0);
    if (refillNeedLiters <= 0) return 0;
    const refillLiters = Math.min(refillNeedLiters, groundwaterLitersAvailable);
    if (refillLiters <= 0) return 0;
    const refillPowerFee = Math.max(1, Math.round((refillLiters / deps.waterPumpUnitLiter) * deps.waterPumpPowerFeePer1000L));
    const refillEnvFee = Math.max(1, Math.round(refillLiters * deps.waterEnvFeePerLiter));
    if (prevMoney - autoRefillSpentMoney - autoRefillPowerFeeTotal - autoRefillEnvFeeTotal < (refillPowerFee + refillEnvFee)) return 0;
    tankAfterAutoRefill += refillLiters;
    autoRefillUsedLiters += refillLiters;
    autoRefillPowerFeeTotal += refillPowerFee;
    autoRefillEnvFeeTotal += refillEnvFee;
    groundwaterLitersAvailable = Math.max(0, groundwaterLitersAvailable - refillLiters);
    return refillLiters;
  };
  tryAutoRefill(autoRefillTargetWater - tankAfterAutoRefill);
  let irrigationUseLiters = 0;
  let irrigationWaterGain = 0;
  if (planActive) {
    const assignedTrees = Math.max(0, deps.fieldFacilityCountOf(field, plan.facilityKey));
    const maxLitersPerTree = deps.irrigationMaxLitersPerTreeByFacilityAndPump(plan.facilityKey, irrigationPumpActive);
    const litersPerTreePerDay = deps.clamp(Number(plan.litersPerTreePerDay) || 0, deps.irrigationMinLitersPerTree, maxLitersPerTree);
    if (hasTankInfra && plantedTrees > 0 && assignedTrees > 0 && litersPerTreePerDay > 0) {
      const needLiters = litersPerTreePerDay * assignedTrees;
      if (needLiters > tankAfterAutoRefill) {
        tryAutoRefill(needLiters - tankAfterAutoRefill);
      }
      const actualRatio = needLiters > 0 ? Math.min(1, tankAfterAutoRefill / needLiters) : 0;
      irrigationUseLiters = needLiters * actualRatio;
      const deliveredLitersPerTree = litersPerTreePerDay * actualRatio;
      const coverageRatio = deps.clamp(assignedTrees / plantedTrees, 0, 1);
      irrigationWaterGain = deliveredLitersPerTree * 0.2 * coverageRatio;
    }
  }
  if(designed){
    const need = infrastructureIrrigationDemand(field);
    if(field.orchardInfrastructure.irrigation.settings.enabled && hasTankInfra && irrigationPumpActive && need.hours<=24)tryAutoRefill(need.liters-tankAfterAutoRefill);
    const delivered = infrastructureIrrigationDelivery(field,tankAfterAutoRefill,{tankReady:hasTankInfra,pumpActive:irrigationPumpActive});
    irrigationUseLiters=delivered.usedLiters;irrigationWaterGain=delivered.waterGain;
  }
  const passiveIrrigationTrees = Math.max(
    0,
    Math.max(
      Math.floor(deps.fieldFacilityCountOf(field, 'dripIrrigation')),
      Math.floor(deps.fieldFacilityCountOf(field, 'sprinklerIrrigation')),
      Math.floor(deps.fieldFacilityCountOf(field, deps.microSprinklerIrrigationFacilityKey))
    )
  );
  const passiveIrrigationUseLiters = (designed || hasIrrigationControlSystem)
    ? 0
    : (Math.max(0, Math.min(plantedTrees, passiveIrrigationTrees)) * 2);
  const tankBeforeIrrigation = tankAfterAutoRefill;
  const tankAfterIrrigation = Math.max(0, tankBeforeIrrigation - irrigationUseLiters - passiveIrrigationUseLiters);
  tankAfterAutoRefill = tankAfterIrrigation;
  tryAutoRefill(autoRefillTargetWater - tankAfterAutoRefill);
  const stageNow = deps.growthStageLabel(field);
  const coldRiskInfo = deps.coldRiskInfoOfStageAndTemp(stageNow, deps.nextTemperatureC);
  const hasColdRiskToday = Boolean(field?.cropId) && coldRiskInfo.active && (coldRiskInfo.level === 'warn' || coldRiskInfo.level === 'danger');
  const microSprinklerEnabled = Boolean(field?.microSprinklerEnabled);
  const microSprinklerRequiredLiters = Math.round(Math.max(0, Number(field?.trees) || 0) * deps.microSprinklerLitersPerTree);
  const microSprinklerInfraReady = !designed && Boolean(
    field?.cropId
    && deps.fieldFacilityCountOf(field, deps.microSprinklerIrrigationFacilityKey) > 0
    && irrigationPumpActive
    && tankCapacity > 0
  );
  let microSprinklerUsedLiters = 0;
  let microSprinklerRan = false;
  let microSprinklerWaterShortage = false;
  let microSprinklerStopPenalty = false;
  if (hasColdRiskToday) {
    if (microSprinklerEnabled && microSprinklerInfraReady) {
      const availableForSprinkler = tankAfterAutoRefill + groundwaterLitersAvailable;
      if (availableForSprinkler + 1e-6 >= microSprinklerRequiredLiters) {
        const consumeFromTank = Math.min(tankAfterAutoRefill, microSprinklerRequiredLiters);
        tankAfterAutoRefill = Math.max(0, tankAfterAutoRefill - consumeFromTank);
        const remainingNeed = Math.max(0, microSprinklerRequiredLiters - consumeFromTank);
        if (remainingNeed > 0) groundwaterLitersAvailable = Math.max(0, groundwaterLitersAvailable - remainingNeed);
        microSprinklerUsedLiters = microSprinklerRequiredLiters;
        microSprinklerRan = true;
      } else {
        microSprinklerWaterShortage = true;
      }
    } else if (microSprinklerEnabled && !microSprinklerInfraReady) {
      microSprinklerWaterShortage = true;
    }
    if (!microSprinklerEnabled && Number(field?.microSprinklerLastRunDay || 0) === (nextDay - 1)) {
      microSprinklerStopPenalty = true;
    }
  }
  const nextGroundwaterTonsBase = Math.max(0, (groundwaterLitersAvailable + groundwaterDailyRechargeLiters) / 1000);
  const nextTankWater = tankAfterAutoRefill;
  const nextTankUnits = deps.splitTankWaterByUnit(field, nextTankWater);
  const winterStoredWaterWear = deps.isWinterSeason && nextTankWater > 0
    ? (hasInsulationCover ? deps.tankDurabilityWinterCoverWear : deps.tankDurabilityWinterFreezeWear)
    : 0;
  let nextFacilityDurabilityByKey = initialFacilityDurabilityByKey;
  if (autoRefillUsedLiters > 0) {
    const wellRule = deps.facilityDurabilityRuleOf('wellFacility');
    const powerRule = deps.facilityDurabilityRuleOf('farmPowerElectric');
    nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      'wellFacility',
      ((wellRule.pumpAutoPer1000L || 0) * autoRefillUsedLiters) / deps.waterPumpUnitLiter
    );
    nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      'farmPowerElectric',
      ((powerRule.pumpAutoPer1000L || 0) * autoRefillUsedLiters) / deps.waterPumpUnitLiter
    );
  }
  if (irrigationUseLiters > 0 && plan?.facilityKey) {
    const rule = deps.facilityDurabilityRuleOf(plan.facilityKey);
    nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      plan.facilityKey,
      ((rule.irrigationPer1000L || 0) * irrigationUseLiters) / deps.waterPumpUnitLiter
    );
    const wellRule = deps.facilityDurabilityRuleOf('wellFacility');
    const powerRule = deps.facilityDurabilityRuleOf('farmPowerElectric');
    nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      'wellFacility',
      ((wellRule.irrigationPer1000L || 0) * irrigationUseLiters) / deps.waterPumpUnitLiter
    );
    nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      'farmPowerElectric',
      ((powerRule.irrigationPer1000L || 0) * irrigationUseLiters) / deps.waterPumpUnitLiter
    );
    const tankBeforeByFacility = deps.splitTankWaterByFacility(field, tankBeforeIrrigation);
    const tankAfterByFacility = deps.splitTankWaterByFacility(
      { ...field, tankWaterLitersByUnit: deps.tankUnitWaterMapFromUnits(nextTankUnits) },
      tankAfterIrrigation
    );
    deps.tankFacilityKeys.forEach((tankKey) => {
      const outflow = Math.max(0, (Number(tankBeforeByFacility[tankKey]) || 0) - (Number(tankAfterByFacility[tankKey]) || 0));
      if (outflow <= 0) return;
      const tankRule = deps.facilityDurabilityRuleOf(tankKey);
      const wearPer1000 = tankRule.irrigationPer1000L || ((tankRule.tankFillPer1000L || 0) * 0.6);
      nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
        nextFacilityDurabilityByKey,
        tankKey,
        (wearPer1000 * outflow) / deps.waterPumpUnitLiter
      );
    });
  }
  if (microSprinklerUsedLiters > 0) {
    const wellRule = deps.facilityDurabilityRuleOf('wellFacility');
    const powerRule = deps.facilityDurabilityRuleOf('farmPowerElectric');
    nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      'wellFacility',
      ((wellRule.irrigationPer1000L || 0) * microSprinklerUsedLiters) / deps.waterPumpUnitLiter
    );
    nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      'farmPowerElectric',
      ((powerRule.irrigationPer1000L || 0) * microSprinklerUsedLiters) / deps.waterPumpUnitLiter
    );
    const tankRuleFallback = deps.tankDurabilityDailyWear * 0.25;
    deps.tankFacilityKeys.forEach((tankKey) => {
      if (deps.fieldFacilityCountOf(field, tankKey) <= 0) return;
      const tankRule = deps.facilityDurabilityRuleOf(tankKey);
      const wearPer1000 = tankRule.irrigationPer1000L || tankRuleFallback;
      nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(
        nextFacilityDurabilityByKey,
        tankKey,
        (wearPer1000 * microSprinklerUsedLiters) / deps.waterPumpUnitLiter
      );
    });
  }
  if (winterStoredWaterWear > 0) {
    deps.tankFacilityKeys.forEach((tankKey) => {
      if (deps.fieldFacilityCountOf(field, tankKey) <= 0) return;
      nextFacilityDurabilityByKey = deps.applyFacilityDurabilityWear(nextFacilityDurabilityByKey, tankKey, winterStoredWaterWear);
    });
  }
  return {
    plan,
    hasIrrigationControlSystem,
    irrigationPumpActive,
    hasColdRiskToday,
    autoRefillUsedLiters,
    autoRefillPowerFeeTotal,
    autoRefillEnvFeeTotal,
    irrigationUseLiters,
    irrigationWaterGain,
    microSprinklerUsedLiters,
    microSprinklerRan,
    microSprinklerWaterShortage,
    microSprinklerStopPenalty,
    nextGroundwaterTonsBase,
    nextTankWater,
    nextTankUnits,
    nextFacilityDurabilityByKey,
    freezeRiskTriggered: Boolean(deps.isWinterSeason && nextTankWater > 0 && !hasInsulationCover && tankCapacity > 0)
  };
};
