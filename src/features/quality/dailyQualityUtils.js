export const buildDailyQualityContext = (
  {
    field,
    nextDay,
    month,
    weatherName,
    nextNutrition,
    nextWater,
    nextPest,
    nextDiseaseProfile,
    nextTaskProgress,
    vigorAgeMul,
    pruningEffectActive,
    pruningEffect,
    fieldWithNextFruitLoad
  },
  deps
) => {
  const resetQuality = month === 3 && (field.growth || 0) < 10 ? 5 : undefined;
  const nextGrowth = deps.calendarGrowthPercent(nextDay, field.lastHarvestYear, field?.cropId);
  const dailyNutritionPenalty = deps.dailyQualityPenaltyFromNutrition({
    ...field,
    nutrition: nextNutrition,
    water: nextWater,
    pest: nextPest
  });
  const fruitDiseaseQualityPenaltyRows = deps.fruitDiseaseQualityPenaltyBreakdown(nextDiseaseProfile || field?.diseaseProfile, month);
  const fruitDiseaseQualityPenalty = fruitDiseaseQualityPenaltyRows.reduce((sum, row) => sum + (Number(row.value) || 0), 0);
  const pestQualityGauge = deps.clamp(
    nextPest - deps.fruitDiseaseCompositeQualityPressure(nextDiseaseProfile || field?.diseaseProfile),
    0,
    100
  );
  const pestQualityPenalty = deps.dailyPestQualityPenalty(pestQualityGauge);
  const waterQualityPenalty = deps.dailyWaterQualityPenalty(nextWater);
  const vigorQualityPenaltyBase = deps.dailyHighVigorQualityPenalty(field.vigor) * vigorAgeMul;
  const vigorQualityPenalty = pruningEffectActive
    ? (vigorQualityPenaltyBase * (1 - (pruningEffect?.highVigorQualityPenaltyReductionRatio || 0)))
    : vigorQualityPenaltyBase;
  const thinningQualityRecoveryBonus = month >= 7
    ? (
      ((deps.clamp(Number(nextTaskProgress?.thinning1) || 0, 0, 100) / 100) * deps.thinningQualityRecoveryBonusMax.thinning1)
      + ((deps.clamp(Number(nextTaskProgress?.thinning2) || 0, 0, 100) / 100) * deps.thinningQualityRecoveryBonusMax.thinning2)
      + ((deps.clamp(Number(nextTaskProgress?.thinning3) || 0, 0, 100) / 100) * deps.thinningQualityRecoveryBonusMax.thinning3)
    )
    : 0;
  const foliarQualityRecoveryBonus = Math.max(0, Number(field?.foliarQualityRecoveryPendingBonus) || 0);
  const leafPluckingQualityRecoveryBonus = deps.ageTargetTaskProgressStatusOfField(
    { ...field, taskProgress: nextTaskProgress },
    nextDay,
    'leafPlucking',
    deps.crops
  ).progressPct >= 99.95
    ? deps.leafPluckingDailyQualityRecoveryAtFullProgress
    : 0;
  const canopyTrainingQualityRecoveryBonus = (() => {
    const rows = deps.cropRowsByVarietyAndAge(field, nextDay, deps.crops).filter((row) => (Number(row?.aliveTrees) || 0) > 0);
    if (!rows.length) return 0;
    const totalAlive = rows.reduce((sum, row) => sum + Math.max(0, Number(row?.aliveTrees) || 0), 0);
    if (totalAlive <= 0) return 0;
    const workedByAge = field?.ageTaskWorkedTreesByTask?.[deps.canopyTrainingTaskKey] || {};
    const supportWorked = Math.max(0, Number(workedByAge?.['1']) || 0) + Math.max(0, Number(workedByAge?.['4']) || 0);
    const coreWorked = Math.max(0, Number(workedByAge?.['2']) || 0) + Math.max(0, Number(workedByAge?.['3']) || 0);
    const bonusTrees = (supportWorked * deps.canopyTrainingDailyQualityBonusEarlyDone)
      + (coreWorked * deps.canopyTrainingDailyQualityBonusLateDone);
    return bonusTrees / totalAlive;
  })();
  const baseDailyQualityRecovery = nextGrowth >= 9 ? 0.1 : 0;
  const dailyQualityRecovery = baseDailyQualityRecovery
    + thinningQualityRecoveryBonus
    + foliarQualityRecoveryBonus
    + leafPluckingQualityRecoveryBonus
    + canopyTrainingQualityRecoveryBonus;
  const totalTrees = Math.max(0, Number(field?.trees) || 0);
  const supportAssignedTrees = Math.max(0, deps.fieldFacilityCountOf(field, 'trellisWireSupport'));
  const unsupportedRatio = totalTrees > 0 ? deps.clamp((totalTrees - supportAssignedTrees) / totalTrees, 0, 1) : 0;
  const supportQualityPenalty = 0.3 * unsupportedRatio;
  const baseQuality = resetQuality ?? field.quality;
  const fruitOverloadQualityPenalty = deps.dailyFruitOverloadQualityPenaltyForField(fieldWithNextFruitLoad, nextDay);
  const fruitLoadOptimalQualityBonus = deps.dailyFruitLoadOptimalQualityBonusForField(fieldWithNextFruitLoad, nextDay);
  const hailQualityPenalty = Math.max(0, Number(deps.hailQualityPenaltyByWeather?.[String(weatherName || '')]) || 0);
  return {
    nextGrowth,
    dailyNutritionPenalty,
    pestQualityPenalty,
    fruitDiseaseQualityPenalty,
    waterQualityPenalty,
    vigorQualityPenalty,
    dailyQualityRecovery,
    supportQualityPenalty,
    baseQuality,
    fruitOverloadQualityPenalty,
    fruitLoadOptimalQualityBonus,
    hailQualityPenalty,
    hailLogText: hailQualityPenalty > 0 && field.cropId
      ? `${field.name} ${String(weatherName || '우박')} 피해: 품질 -${hailQualityPenalty.toFixed(1)}`
      : ''
  };
};
