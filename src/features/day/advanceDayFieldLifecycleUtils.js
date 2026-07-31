import { buildAdvanceDayFieldSurface } from './advanceDayFieldSurfaceUtils';
import { buildAdvanceDayFieldBiology } from './advanceDayFieldBiologyUtils';
import { finalizeAdvanceDayField } from './advanceDayFieldFinalizeUtils';

export const processAdvanceDayFieldLifecycle = (params, deps) => {
  const {
    field,
    nextDay,
    month,
    weatherName,
    nextTemperatureC,
    nextNightTemperatureC,
    nextNutrition,
    nextWater,
    nextCanopySunlight,
    canopySunlightQualityBonus,
    hasColdRiskToday,
    coldRiskInfo,
    microSprinklerRan,
    microSprinklerWaterShortage,
    microSprinklerStopPenalty,
    pestRainBoostMultiplier,
    weedIncreaseBase,
    isWinterSeason,
    weedRainBoostMultiplier,
    weedMowGrowthReductionRatio,
    nextTankWater,
    nextTankUnits,
    nextGroundwaterTonsBase,
    nextFacilityDurabilityByKey,
    nextRepairMap,
    nextTankDurabilityByFacility,
    evSlowChargedKwh,
    nextEvSlowChargeReservedInstanceId,
    nextPlan
  } = params;

  const fieldSurfaceResult = buildAdvanceDayFieldSurface({
    field,
    nextDay,
    weatherName,
    nextNutrition,
    nextWater,
    weedIncreaseBase,
    isWinterSeason,
    weedRainBoostMultiplier,
    weedMowGrowthReductionRatio
  }, deps.surface);

  const microSprinklerEnabled = Boolean(field?.microSprinklerEnabled);
  const fieldBiologyResult = buildAdvanceDayFieldBiology({
    field,
    nextDay,
    month,
    weatherName,
    nextTemperatureC,
    nextNightTemperatureC,
    nextNutrition,
    nextWater,
    nextWeed: fieldSurfaceResult.nextWeed,
    hasColdRiskToday,
    coldRiskInfo,
    microSprinklerRan,
    microSprinklerWaterShortage,
    microSprinklerStopPenalty,
    nextCanopySunlight,
    pestRainBoostMultiplier
  }, deps.biology);

  const fieldFinalizationResult = finalizeAdvanceDayField({
    field,
    nextDay,
    month,
    weatherName,
    nextNutrition,
    nextWater,
    nextWeed: fieldSurfaceResult.nextWeed,
    nextCanopySunlight,
    canopySunlightQualityBonus,
    weedVigorPenaltyNoCrop: fieldBiologyResult.weedVigorPenaltyNoCrop,
    nextTankWater,
    nextTankUnits,
    nextGroundwaterTonsBase,
    nextFacilityDurabilityByKey,
    nextRepairMap,
    nextTankDurabilityByFacility,
    evSlowChargedKwh,
    nextEvSlowChargeReservedInstanceId,
    nextPlan,
    microSprinklerEnabled,
    microSprinklerRan,
    fieldSurfaceResult,
    fieldBiologyResult
  }, deps.finalize);

  return {
    fieldSurfaceResult,
    fieldBiologyResult,
    fieldFinalizationResult
  };
};
