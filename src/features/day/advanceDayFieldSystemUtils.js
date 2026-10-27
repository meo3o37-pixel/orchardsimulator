import { coldFacilityEnabledUnitCountOf } from '../facility/facilityMetaUtils';
import { processDailySlowEvCharge } from '../ev/evChargeService';
import { processDailyWaterSystems } from '../water/waterDailyUtils';
import { applyDailyDrainage } from '../cadastre/drainage';

const COLD_FACILITY_DURABILITY_WEAR_MIN_PER_YEAR = 5;
const COLD_FACILITY_DURABILITY_WEAR_MAX_PER_YEAR = 10;
const DAYS_PER_YEAR = 365;

const randomColdFacilityWearPerDay = (enabledRatio = 1) => {
  const safeRatio = Math.max(0, Math.min(1, Number(enabledRatio) || 0));
  if (safeRatio <= 0) return 0;
  const annualWear =
    COLD_FACILITY_DURABILITY_WEAR_MIN_PER_YEAR
    + (Math.random() * (COLD_FACILITY_DURABILITY_WEAR_MAX_PER_YEAR - COLD_FACILITY_DURABILITY_WEAR_MIN_PER_YEAR));
  return (annualWear / DAYS_PER_YEAR) * safeRatio;
};

export const processAdvanceDayFieldSystems = (params, deps) => {
  const {
    field,
    prev,
    nextDay,
    month,
    nextTemperatureC,
    nextNightTemperatureC,
    isWinterSeason,
    autoRefillPowerFeeSpent,
    autoRefillEnvFeeSpent,
    evSlowChargeCostSpent,
    nextMachineBatteryKwhByInstance
  } = params;

  let standbyPowerFeeAdd = 0;
  let coldStoragePowerFeeAdd = 0;
  const tankCapacity = deps.water.fieldTankOperationalCapacityLiters(field, nextDay);
  const installedKeys = deps.durability.installedFacilityKeysOf(field);
  let nextFacilityDurabilityByKey = installedKeys.reduce((acc, facilityKey) => {
    const rule = deps.durability.facilityDurabilityRuleOf(facilityKey);
    const naturalDaily = Math.max(0, Number(rule.naturalDaily) || 0);
    return deps.durability.applyFacilityDurabilityWear(acc, facilityKey, naturalDaily);
  }, { ...(field?.facilityDurabilityByKey || field?.tankDurabilityByFacility || {}) });
  const farmPowerOn = deps.shared.fieldFacilityUsable(field, 'farmPowerElectric', nextDay) && field?.powerControlEnabled !== false;
  if (farmPowerOn) {
    standbyPowerFeeAdd += deps.power.standbyPowerFarmPowerOnDaily;
    if (deps.water.fieldHasIrrigationPumpInstalled(field) && field?.irrigationPumpEnabled === true) {
      standbyPowerFeeAdd += deps.power.standbyPowerIrrigationPumpOnDaily;
    }
    if (deps.shared.fieldFacilityUsable(field, 'evChargerStation', nextDay) && field?.evChargerControlEnabled !== false) {
      standbyPowerFeeAdd += deps.power.standbyPowerEvChargerOnDaily;
    }
    if (deps.shared.fieldFacilityUsable(field, 'frostFan', nextDay) && Boolean(field?.frostFanEnabled)) {
      const frostFanCount = Math.max(0, deps.shared.fieldFacilityCountOf(field, 'frostFan'));
      standbyPowerFeeAdd += frostFanCount * deps.power.standbyPowerFrostFanPerUnitDaily;
    }
    Object.entries(deps.power.coldStorageDailyPowerCostByFacility || {}).forEach(([facilityKey, dailyCostRaw]) => {
      if (!deps.shared.fieldFacilityUsable(field, facilityKey, nextDay)) return;
      const dailyCost = Math.max(0, Number(dailyCostRaw) || 0);
      if (dailyCost <= 0) return;
      const installedUnitCount = Math.max(0, deps.shared.fieldFacilityCountOf(field, facilityKey));
      if (installedUnitCount <= 0) return;
      const enabledUnitCount = Math.max(0, coldFacilityEnabledUnitCountOf(field, facilityKey));
      if (enabledUnitCount <= 0) return;
      const seasonalMultiplier = Number(deps.power.coldStorageSeasonalPowerMultiplierOfMonth?.(month) || 1);
      const facilityCost = Math.round(enabledUnitCount * dailyCost * seasonalMultiplier);
      standbyPowerFeeAdd += facilityCost;
      coldStoragePowerFeeAdd += facilityCost;
      nextFacilityDurabilityByKey = deps.durability.applyFacilityDurabilityWear(
        nextFacilityDurabilityByKey,
        facilityKey,
        randomColdFacilityWearPerDay(enabledUnitCount / installedUnitCount)
      );
    });
  }

  const currentRepairMap = field?.facilityRepairByKey || {};
  const nextRepairMap = {};
  const completedRepairKeys = [];
  Object.entries(currentRepairMap).forEach(([facilityKey, order]) => {
    const readyDay = Number(order?.readyDay) || 0;
    if (readyDay > nextDay) {
      nextRepairMap[facilityKey] = {
        startDay: Number(order?.startDay) || nextDay,
        readyDay,
        cost: Math.max(0, Number(order?.cost) || 0)
      };
    } else {
      completedRepairKeys.push(facilityKey);
    }
  });

  const waterSystemResult = processDailyWaterSystems({
    field,
    nextDay,
    prevMoney: prev.money,
    autoRefillSpentMoney: autoRefillPowerFeeSpent + autoRefillEnvFeeSpent,
    initialFacilityDurabilityByKey: nextFacilityDurabilityByKey
  }, {
    clamp: deps.shared.clamp,
    nextTemperatureC: Number.isFinite(Number(nextNightTemperatureC)) ? nextNightTemperatureC : nextTemperatureC,
    isWinterSeason,
    fieldFacilityCountOf: deps.shared.fieldFacilityCountOf,
    fieldFacilityUsable: deps.shared.fieldFacilityUsable,
    fieldHasAutoRefillSystem: deps.water.fieldHasAutoRefillSystem,
    fieldHasTankOption: deps.water.fieldHasTankOption,
    fieldIrrigationPumpActive: deps.water.fieldIrrigationPumpActive,
    fieldTankOperationalCapacityLiters: deps.water.fieldTankOperationalCapacityLiters,
    irrigationMaxLitersPerTreeByFacilityAndPump: deps.water.irrigationMaxLitersPerTreeByFacilityAndPump,
    growthStageLabel: deps.water.growthStageLabel,
    coldRiskInfoOfStageAndTemp: deps.water.coldRiskInfoOfStageAndTemp,
    splitTankWaterByUnit: deps.water.splitTankWaterByUnit,
    splitTankWaterByFacility: deps.water.splitTankWaterByFacility,
    tankUnitWaterMapFromUnits: deps.water.tankUnitWaterMapFromUnits,
    facilityDurabilityRuleOf: deps.durability.facilityDurabilityRuleOf,
    applyFacilityDurabilityWear: deps.durability.applyFacilityDurabilityWear,
    microSprinklerIrrigationFacilityKey: deps.water.microSprinklerIrrigationFacilityKey,
    microSprinklerLitersPerTree: deps.water.microSprinklerLitersPerTree,
    irrigationMinLitersPerTree: deps.water.irrigationMinLitersPerTree,
    tankAutoRefillTargetRatio: deps.water.tankAutoRefillTargetRatio,
    tankDurabilityWinterCoverWear: deps.water.tankDurabilityWinterCoverWear,
    tankDurabilityWinterFreezeWear: deps.water.tankDurabilityWinterFreezeWear,
    tankDurabilityDailyWear: deps.water.tankDurabilityDailyWear,
    tankFacilityKeys: deps.water.tankFacilityKeys,
    waterPumpUnitLiter: deps.water.waterPumpUnitLiter,
    waterPumpPowerFeePer1000L: deps.water.waterPumpPowerFeePer1000L,
    waterEnvFeePerLiter: deps.water.waterEnvFeePerLiter
  });

  nextFacilityDurabilityByKey = waterSystemResult.nextFacilityDurabilityByKey;

  const supportCount = Math.max(0, deps.shared.fieldFacilityCountOf(field, 'trellisWireSupport'));
  if (supportCount > 0) {
    const supportRule = deps.durability.facilityDurabilityRuleOf('trellisWireSupport');
    nextFacilityDurabilityByKey = deps.durability.applyFacilityDurabilityWear(
      nextFacilityDurabilityByKey,
      'trellisWireSupport',
      supportCount * (supportRule.supportPerTreeDaily || 0)
    );
  }

  const facilityRepairDoneLogs = [];
  completedRepairKeys.forEach((facilityKey) => {
    if (deps.shared.fieldFacilityCountOf(field, facilityKey) <= 0) return;
    nextFacilityDurabilityByKey[facilityKey] = 100;
    const facilityName = deps.durability.facilityMap[facilityKey]?.name || facilityKey;
    facilityRepairDoneLogs.push(`${field.name} ${facilityName} 수리 완료`);
  });

  const slowChargeOutcome = processDailySlowEvCharge({
    field,
    nextDay,
    prev,
    nextMachineBatteryKwhByInstance,
    nextFacilityDurabilityByKey,
    availableMoney: prev.money - autoRefillPowerFeeSpent - autoRefillEnvFeeSpent - evSlowChargeCostSpent
  }, {
    won: deps.ev.won,
    clamp: deps.shared.clamp,
    fieldFacilityUsable: deps.shared.fieldFacilityUsable,
    parseMachineParkingInstanceId: deps.ev.parseMachineParkingInstanceId,
    machineItemMap: deps.ev.machineItemMap,
    equipmentItemMap: deps.ev.equipmentItemMap,
    isElectricMachineItem: deps.ev.isElectricMachineItem,
    electricBatteryCapacityKwhOfItem: deps.ev.electricBatteryCapacityKwhOfItem,
    electricBatteryKwhOfInstance: deps.ev.electricBatteryKwhOfInstance,
    applyFacilityDurabilityWear: deps.durability.applyFacilityDurabilityWear,
    evChargeSlowKwhPerAction: deps.ev.evChargeSlowKwhPerAction,
    evChargeSlowCostPerKwh: deps.ev.evChargeSlowCostPerKwh,
    evChargePowerFacilityWearPer100Kwh: deps.ev.evChargePowerFacilityWearPer100Kwh,
    evChargeStationWearPer100Kwh: deps.ev.evChargeStationWearPer100Kwh
  });

  nextFacilityDurabilityByKey = slowChargeOutcome.nextFacilityDurabilityByKey;

  const nextTankDurabilityByFacility = deps.water.tankFacilityKeys.reduce((acc, tankKey) => {
    if (deps.shared.fieldFacilityCountOf(field, tankKey) <= 0) return acc;
    acc[tankKey] = deps.shared.clamp(Number(nextFacilityDurabilityByKey?.[tankKey] ?? 100), 0, 100);
    return acc;
  }, {});

  const nextPlan = waterSystemResult.plan && nextDay > (Number(waterSystemResult.plan.endDay) || 0)
    ? null
    : waterSystemResult.plan;
  const drainageResult = applyDailyDrainage(field, params.waterAfterDrain + params.rainGain + waterSystemResult.irrigationWaterGain, params.rainGain, nextDay);
  const nextWater = drainageResult.water;
  const nextCanopySunlight = deps.shared.canopySunlightAdjustedByDayOfField(field, nextDay, params.weatherName);
  const canopySunlightQualityBonus = deps.shared.canopySunlightQualityBonusOf(nextCanopySunlight);
  const coldRiskTemperatureC = Number.isFinite(Number(nextNightTemperatureC)) ? nextNightTemperatureC : nextTemperatureC;
  const coldRiskInfo = deps.water.coldRiskInfoOfStageAndTemp(deps.water.growthStageLabel(field), coldRiskTemperatureC);

  return {
    tankCapacity,
    nextDrainage: drainageResult.drainage,
    standbyPowerFeeAdd,
    coldStoragePowerFeeAdd,
    nextRepairMap,
    completedRepairKeys,
    nextFacilityDurabilityByKey,
    facilityRepairDoneLogs,
    slowChargeOutcome,
    nextTankDurabilityByFacility,
    nextPlan,
    nextWater,
    nextCanopySunlight,
    canopySunlightQualityBonus,
    coldRiskInfo,
    ...waterSystemResult
  };
};
