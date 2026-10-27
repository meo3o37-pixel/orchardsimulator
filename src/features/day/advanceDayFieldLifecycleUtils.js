import { applyDailyTrellisInvestment } from '../cadastre/trellisInvestment.js';
import { buildAdvanceDayFieldSurface } from './advanceDayFieldSurfaceUtils';
import { buildAdvanceDayFieldBiology } from './advanceDayFieldBiologyUtils';
import { finalizeAdvanceDayField } from './advanceDayFieldFinalizeUtils';
import { advanceRootWaterStress, rootWaterStressEffects, enforceRootVigorPenalty } from '../../utils/rootWaterStress.js';

export const processAdvanceDayFieldLifecycle = (params, deps) => {
  const {
    field: previousField,
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

  const field = { ...previousField, rootWaterStress: advanceRootWaterStress(previousField, nextWater, nextDay) };
  const rootEffects = rootWaterStressEffects({ ...field, water: nextWater });

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
  }, { ...deps.finalize, dailyWaterQualityPenalty: (water) => Math.max(deps.finalize.dailyWaterQualityPenalty(water), rootEffects.qualityPenalty) });
  if (fieldFinalizationResult.nextField) {
    fieldFinalizationResult.nextField = {
      ...enforceRootVigorPenalty(previousField, fieldFinalizationResult.nextField, rootEffects),
      rootWaterStress: field.rootWaterStress
    };
  }

  if(fieldFinalizationResult.nextField){
    const investment=applyDailyTrellisInvestment(fieldFinalizationResult.nextField,weatherName,nextDay);
    fieldFinalizationResult.nextField=investment.field;
    fieldFinalizationResult.windDamageLogText=investment.log;
  }
  return {
    fieldSurfaceResult,
    fieldBiologyResult,
    fieldFinalizationResult
  };
};
