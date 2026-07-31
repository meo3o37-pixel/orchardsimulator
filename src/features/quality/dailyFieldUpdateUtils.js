import { buildDailyQualityContext } from './dailyQualityUtils';

export const finalizeNonCropDailyFieldState = (params, deps) => {
  const {
    field,
    nextDay,
    nextWater,
    nextCanopySunlight,
    nextWeed,
    herbicideDailyVigorPenalty,
    weedVigorPenaltyNoCrop,
    nextNutrition,
    currentPestProfile,
    currentDiseaseProfile,
    nextOverwinterPestProfile,
    nextOverwinterDiseaseProfile,
    nextTankWater,
    nextTankUnits,
    nextGroundwaterTonsBase,
    nextFacilityDurabilityByKey,
    nextRepairMap,
    nextTankDurabilityByFacility,
    evSlowChargedKwh,
    nextEvSlowChargeReservedInstanceId,
    nextPlan,
    weedGrowthReductionUntilDay,
    microSprinklerEnabled,
    microSprinklerRan,
    nextTaskLastDoneDayByKey,
    nextTaskProgress,
    nextSprayUsageLitersByPesticide,
    nextBloomInsecticidePenaltyState,
    nextHerbicideEffectState,
    nextFoliarVigorBoost
  } = params;

  return {
    ...field,
    water: nextWater,
    canopySunlight: nextCanopySunlight,
    weed: nextWeed,
    vigor: deps.clamp((Number(field.vigor) || 10) - herbicideDailyVigorPenalty - weedVigorPenaltyNoCrop, 0, 100),
    nutrition: nextNutrition,
    pestProfile: currentPestProfile,
    diseaseProfile: currentDiseaseProfile,
    overwinterPestProfile: nextOverwinterPestProfile || deps.normalizePestProfile(field?.overwinterPestProfile, 0),
    overwinterDiseaseProfile: nextOverwinterDiseaseProfile || deps.normalizeDiseaseProfile(field?.overwinterDiseaseProfile, 0),
    pest: deps.composePestGaugeValue(currentPestProfile, currentDiseaseProfile),
    tankWaterLiters: nextTankWater,
    tankWaterLitersByUnit: deps.tankUnitWaterMapFromUnits(nextTankUnits),
    groundwaterTonsBase: nextGroundwaterTonsBase,
    facilityDurabilityByKey: nextFacilityDurabilityByKey,
    facilityRepairByKey: nextRepairMap,
    tankDurabilityByFacility: nextTankDurabilityByFacility,
    evChargeUsageKwhTotal: Math.max(0, Number(field?.evChargeUsageKwhTotal) || 0) + evSlowChargedKwh,
    evSlowChargeReservedInstanceId: nextEvSlowChargeReservedInstanceId,
    irrigationPlan: nextPlan,
    fruitLoadPerTree: 0,
    coldDamageFruitLoadLossTotal: 0,
    coldDamagePending: { quality: 0, vigor: 0, fruitLoad: 0, daysLeft: 0 },
    winterTreeStress: 0,
    winterDamageLevel: 'none',
    winterDeathRisk: 0,
    winterDamageAppliedYear: 0,
    mowWorkedTrees: 0,
    weedGrowthReductionUntilDay,
    microSprinklerEnabled,
    microSprinklerLastRunDay: microSprinklerRan ? nextDay : Math.max(0, Number(field?.microSprinklerLastRunDay) || 0),
    taskLastDoneDayByKey: nextTaskLastDoneDayByKey,
    taskProgress: nextTaskProgress,
    sprayUsageLitersByPesticide: nextSprayUsageLitersByPesticide,
    pestOutbreak: null,
    bloomInsecticidePenalty: nextBloomInsecticidePenaltyState,
    herbicideEffect: nextHerbicideEffectState,
    foliarVigorBoost: nextFoliarVigorBoost
  };
};

export const finalizeCropDailyFieldState = (params, deps) => {
  const {
    field,
    nextDay,
    month,
    weatherName,
    nextNutrition,
    nextWater,
    nextPest,
    nextTaskProgress,
    vigorAgeMul,
    pruningEffectActive,
    pruningEffect,
    fieldWithNextFruitLoad,
    nextCanopySunlight,
    canopySunlightQualityBonus,
    nextTankWater,
    nextTankUnits,
    nextGroundwaterTonsBase,
    nextFacilityDurabilityByKey,
    nextRepairMap,
    nextTankDurabilityByFacility,
    evSlowChargedKwh,
    nextEvSlowChargeReservedInstanceId,
    nextPlan,
    nextFruitLoadPerTree,
    nextFruitLoadReductionByAge,
    nextColdDamageFruitLoadLossTotal,
    nextColdDamagePending,
    nextPruningEffect,
    nextElectricPruningPestBoost,
    nextFoliarVigorBoost,
    nextPestProfile,
    nextDiseaseProfile,
    nextOverwinterPestProfile,
    nextOverwinterDiseaseProfile,
    nextSlowDecayState,
    nextPestOutbreakState,
    nextBloomInsecticidePenaltyState,
    nextHerbicideEffectState,
    appliedBaseDailyVigorDelta,
    appliedFruitLoadVigorDelta,
    appliedFoliarVigorBoostToday,
    herbicideDailyVigorPenalty,
    pestVigorPenalty,
    weedVigorPenalty,
    nextWinterTreeStress,
    nextWinterDamageLevel,
    nextWinterDeathRisk,
    winterTreeStressVigorPenalty,
    coldVigorPenalty,
    bloomDailyQualityPenalty,
    weedGrowthReductionUntilDay,
    microSprinklerEnabled,
    microSprinklerRan,
    coldQualityPenalty,
    coldVigorPenaltyApplied
  } = params;

  const qualityContext = buildDailyQualityContext({
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
  }, {
    clamp: deps.clamp,
    crops: deps.crops,
    canopyTrainingTaskKey: deps.canopyTrainingTaskKey,
    thinningQualityRecoveryBonusMax: deps.thinningQualityRecoveryBonusMax,
    leafPluckingDailyQualityRecoveryAtFullProgress: deps.leafPluckingDailyQualityRecoveryAtFullProgress,
    canopyTrainingDailyQualityBonusEarlyDone: deps.canopyTrainingDailyQualityBonusEarlyDone,
    canopyTrainingDailyQualityBonusLateDone: deps.canopyTrainingDailyQualityBonusLateDone,
    hailQualityPenaltyByWeather: deps.hailQualityPenaltyByWeather,
    calendarGrowthPercent: deps.calendarGrowthPercent,
    dailyQualityPenaltyFromNutrition: deps.dailyQualityPenaltyFromNutrition,
    dailyPestQualityPenalty: deps.dailyPestQualityPenalty,
    fruitDiseaseQualityPenaltyBreakdown: deps.fruitDiseaseQualityPenaltyBreakdown,
    fruitDiseaseCompositeQualityPressure: deps.fruitDiseaseCompositeQualityPressure,
    dailyWaterQualityPenalty: deps.dailyWaterQualityPenalty,
    dailyHighVigorQualityPenalty: deps.dailyHighVigorQualityPenalty,
    dailyFruitOverloadQualityPenaltyForField: deps.dailyFruitOverloadQualityPenaltyForField,
    dailyFruitLoadOptimalQualityBonusForField: deps.dailyFruitLoadOptimalQualityBonusForField,
    ageTargetTaskProgressStatusOfField: deps.ageTargetTaskProgressStatusOfField,
    cropRowsByVarietyAndAge: deps.cropRowsByVarietyAndAge,
    fieldFacilityCountOf: deps.fieldFacilityCountOf
  });
  const {
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
    hailLogText
  } = qualityContext;

  const deathChance = deps.dailyPestDeathChance(nextPest);
  const currentDead = Math.max(0, Number(field.deadTrees) || 0);
  const currentLive = Math.max(0, (Number(field.trees) || 0) - currentDead);
  const pestDeadAdd = deps.dailyPestDeathCount(currentLive, nextPest, deathChance);
  const naturalDeadAdd = deps.dailyNaturalDeathCount(currentLive - pestDeadAdd);
  const nextYear = deps.toDate(nextDay).getFullYear();
  const winterDeathRateBase = Number(nextWinterDeathRisk) || 0;
  const winterDeathAgeMultiplier = (() => {
    const rows = deps.cropRowsByVarietyAndAge(field, nextDay, deps.crops).filter((row) => (Number(row?.aliveTrees) || 0) > 0);
    if (!rows.length) return 1;
    const weighted = rows.reduce((acc, row) => {
      const alive = Math.max(0, Number(row?.aliveTrees) || 0);
      const age = Math.max(1, Math.floor(Number(row?.ageYear) || 1));
      const mul = age <= 1 ? 1.8 : age === 2 ? 1.4 : age === 3 ? 1.15 : 1.0;
      return {
        trees: acc.trees + alive,
        sum: acc.sum + (alive * mul)
      };
    }, { trees: 0, sum: 0 });
    return weighted.trees > 0 ? (weighted.sum / weighted.trees) : 1;
  })();
  const winterDeathAppliedThisYear = Math.max(0, Math.floor(Number(field?.winterDamageAppliedYear) || 0)) >= nextYear;
  const winterDamageResolvedNow = month === 3 && !winterDeathAppliedThisYear;
  const winterDeathAdd = (
    winterDamageResolvedNow
    && winterDeathRateBase > 0
    && nextWinterTreeStress >= 40
    && currentLive > 0
  )
    ? Math.min(
      currentLive,
      Math.max(
        0,
        Math.floor(currentLive * Math.min(0.08, winterDeathRateBase * winterDeathAgeMultiplier))
      )
    )
    : 0;
  const deadAdd = Math.min(currentLive, pestDeadAdd + naturalDeadAdd + winterDeathAdd);

  return {
    deadAdd,
    hailLogText,
    nextField: {
      ...field,
      growth: nextGrowth,
      water: nextWater,
      weed: params.nextWeed,
      pruningBranchWasteKg: params.nextPruningBranchWasteKg,
      leafWasteKg: params.nextLeafWasteKg,
      droppedFruitWasteKg: params.nextDroppedFruitWasteKg,
      nutrition: nextNutrition,
      tankWaterLiters: nextTankWater,
      tankWaterLitersByUnit: deps.tankUnitWaterMapFromUnits(nextTankUnits),
      groundwaterTonsBase: nextGroundwaterTonsBase,
      facilityDurabilityByKey: nextFacilityDurabilityByKey,
      facilityRepairByKey: nextRepairMap,
      tankDurabilityByFacility: nextTankDurabilityByFacility,
      evChargeUsageKwhTotal: Math.max(0, Number(field?.evChargeUsageKwhTotal) || 0) + evSlowChargedKwh,
      evSlowChargeReservedInstanceId: nextEvSlowChargeReservedInstanceId,
      irrigationPlan: nextPlan,
      fruitLoadPerTree: nextFruitLoadPerTree,
      fruitLoadReductionByAge: nextFruitLoadReductionByAge,
      coldDamageFruitLoadLossTotal: nextColdDamageFruitLoadLossTotal,
      coldDamagePending: nextColdDamagePending,
      pruningEffect: nextPruningEffect,
      electricPruningPestBoost: nextElectricPruningPestBoost,
      foliarVigorBoost: nextFoliarVigorBoost,
      pestProfile: nextPestProfile,
      diseaseProfile: nextDiseaseProfile,
      overwinterPestProfile: nextOverwinterPestProfile,
      overwinterDiseaseProfile: nextOverwinterDiseaseProfile,
      pest: nextPest,
      pestSeasonSlowDecay: nextSlowDecayState,
      pestOutbreak: nextPestOutbreakState,
      bloomInsecticidePenalty: nextBloomInsecticidePenaltyState,
      herbicideEffect: nextHerbicideEffectState,
      taskLastDoneDayByKey: params.nextTaskLastDoneDayByKey,
      vigor: deps.clamp(
        (Number(field.vigor) || 10)
        + appliedBaseDailyVigorDelta
        + appliedFruitLoadVigorDelta
        + appliedFoliarVigorBoostToday
        - herbicideDailyVigorPenalty
        - pestVigorPenalty
        - weedVigorPenalty
        - winterTreeStressVigorPenalty
        - coldVigorPenaltyApplied,
        0,
        100
      ),
      quality: deps.clamp(
        baseQuality
        + dailyQualityRecovery
        + fruitLoadOptimalQualityBonus
        + canopySunlightQualityBonus
        - dailyNutritionPenalty
        - pestQualityPenalty
        - fruitDiseaseQualityPenalty
        - waterQualityPenalty
        - vigorQualityPenalty
        - supportQualityPenalty
        - bloomDailyQualityPenalty
        - params.pestOutbreakQualityPenalty
        - fruitOverloadQualityPenalty
        - coldQualityPenalty
        - hailQualityPenalty,
        0,
        100
      ),
      canopySunlight: nextCanopySunlight,
      deadTrees: currentDead + deadAdd,
      winterTreeStress: nextWinterTreeStress,
      winterDamageLevel: nextWinterDamageLevel,
      winterDeathRisk: nextWinterDeathRisk,
      winterDamageAppliedYear: winterDamageResolvedNow
        ? nextYear
        : Math.max(0, Math.floor(Number(field?.winterDamageAppliedYear) || 0)),
      mowWorkedTrees: 0,
      weedGrowthReductionUntilDay,
      microSprinklerEnabled,
      microSprinklerLastRunDay: microSprinklerRan ? nextDay : Math.max(0, Number(field?.microSprinklerLastRunDay) || 0),
      taskProgress: nextTaskProgress,
      sprayUsageLitersByPesticide: params.nextSprayUsageLitersByPesticide,
      note: deps.monthTaskText[month] || '생육 진행'
    }
  };
};
