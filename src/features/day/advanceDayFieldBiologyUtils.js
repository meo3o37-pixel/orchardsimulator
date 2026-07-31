import { processDailyPestProfiles } from '../pest/pestDailyUtils';

const WINTER_PROTECTION_COATING_TASK_KEY = 'winterProtectionCoating';
const PRUNING_SEAL_TASK_KEY = 'pruningSealant';

export const pruningSealCankerDailyDeltaOf = ({
  field,
  nextDay,
  month,
  weatherName,
  temperatureC,
  deps
}) => {
  if (!field?.cropId) return 0;
  const effectYear = Math.max(0, Math.floor(Number(field?.pruningSealEffectYear) || 0));
  if (effectYear <= 0 || effectYear !== deps.toDate(nextDay).getFullYear()) return 0;
  const needByAge = field?.pruningSealNeedByAge || {};
  const doneByAge = field?.ageTaskWorkedTreesByTask?.[PRUNING_SEAL_TASK_KEY] || {};
  const modeByAge = field?.winterPruningModeByAge || {};
  const weighted = Object.entries(needByAge).reduce((acc, [ageKeyRaw, needRaw]) => {
    const ageKey = String(ageKeyRaw || '');
    const need = Math.max(0, Number(needRaw) || 0);
    if (need <= 0) return acc;
    const done = Math.max(0, Number(doneByAge?.[ageKey]) || 0);
    const remain = Math.max(0, need - Math.min(need, done));
    const mode = String(modeByAge?.[ageKey] || 'light');
    const dailyBase = mode === 'heavy' ? 0.010 : 0.004;
    return {
      need: acc.need + need,
      delta: acc.delta + (dailyBase * remain)
    };
  }, { need: 0, delta: 0 });
  if (weighted.need <= 0 || weighted.delta <= 0) return 0;
  const weatherBand = deps.weatherRiskBandOf(weatherName, temperatureC);
  const weatherMul = weatherBand === 'rain' ? 1.5 : weatherBand === 'humid' ? 1.25 : 1.0;
  const monthMul = month === 3 || month === 4
    ? 1.6
    : month === 5 || month === 6
      ? 1.2
      : month === 1 || month === 2 || month === 11 || month === 12
        ? 0.6
        : 0.8;
  return deps.clamp((weighted.delta / weighted.need) * weatherMul * monthMul, 0, 0.03);
};

export const buildAdvanceDayFieldBiology = (params, deps) => {
  const {
    field,
    nextDay,
    month,
    weatherName,
    nextTemperatureC,
    nextNightTemperatureC,
    nextNutrition,
    nextWater,
    nextWeed,
    hasColdRiskToday,
    coldRiskInfo,
    microSprinklerRan,
    microSprinklerWaterShortage,
    microSprinklerStopPenalty,
    nextCanopySunlight,
    pestRainBoostMultiplier
  } = params;

  const coldRiskTemperatureC = Number.isFinite(Number(nextNightTemperatureC)) ? nextNightTemperatureC : nextTemperatureC;
  const vigorAgeMul = deps.vigorImpactAgeMultiplierForField(field, nextDay);
  const vigorFruitPenalty = deps.highVigorFruitPenalty(field.vigor) * vigorAgeMul;
  const winterProtectionCoatingPct = deps.clamp(
    Number(field?.taskProgress?.[WINTER_PROTECTION_COATING_TASK_KEY]) || 0,
    0,
    100
  );
  const winterProtectionCoatingDecay = (() => {
    const weather = String(weatherName || '');
    let decay = 0.7;
    if (weather.includes('비') || weather.includes('눈') || weather.includes('진눈깨비')) decay += 0.25;
    if (weather.includes('대설') || weather.includes('폭설')) decay += 0.4;
    if (weather.includes('강풍') || weather.includes('돌풍') || weather.includes('한파')) decay += 0.15;
    if (month >= 3) decay += 0.5;
    return decay;
  })();
  const nextWinterProtectionCoatingPct = deps.clamp(
    winterProtectionCoatingPct - winterProtectionCoatingDecay,
    0,
    100
  );
  const winterTreeStressBase = (() => {
    if (!field?.cropId) return 0;
    if (![11, 12, 1, 2].includes(month)) return 0;
    if (coldRiskTemperatureC <= -16) return 0.22;
    if (coldRiskTemperatureC <= -13) return 0.14;
    if (coldRiskTemperatureC <= -10) return 0.08;
    if (coldRiskTemperatureC <= -7) return 0.04;
    return 0;
  })();
  const winterTreeStressProtectionRatio = 0.35 * (winterProtectionCoatingPct / 100);
  const winterTreeStressVigorPenalty = Math.max(
    0,
    winterTreeStressBase * Math.max(0.4, 1 - winterTreeStressProtectionRatio)
  );
  const currentWinterTreeStress = deps.clamp(Number(field?.winterTreeStress) || 0, 0, 100);
  const winterTreeStressAgeMultiplier = (() => {
    const rows = deps.cropRowsByVarietyAndAge(field, nextDay, deps.crops).filter((row) => (Number(row?.aliveTrees) || 0) > 0);
    if (!rows.length) return 1;
    const weighted = rows.reduce((acc, row) => {
      const alive = Math.max(0, Number(row?.aliveTrees) || 0);
      const age = Math.max(1, Math.floor(Number(row?.ageYear) || 1));
      const mul = age <= 1 ? 1.6 : age === 2 ? 1.35 : age === 3 ? 1.15 : 1.0;
      return {
        trees: acc.trees + alive,
        sum: acc.sum + (alive * mul)
      };
    }, { trees: 0, sum: 0 });
    return weighted.trees > 0 ? (weighted.sum / weighted.trees) : 1;
  })();
  const winterTreeStressVigorMultiplier = (() => {
    const vigor = deps.clamp(Number(field?.vigor) || 0, 0, 100);
    if (vigor < 30) return 1.4;
    if (vigor < 50) return 1.2;
    return 1.0;
  })();
  const winterTreeStressDailyAdd = Math.max(
    0,
    winterTreeStressBase * 50 * winterTreeStressAgeMultiplier * winterTreeStressVigorMultiplier * Math.max(0.4, 1 - winterTreeStressProtectionRatio)
  );
  const winterTreeStressRecovery = (![11, 12, 1, 2].includes(month) && currentWinterTreeStress > 0)
    ? (month >= 3 ? 1.2 : 0.35)
    : 0;
  const nextWinterTreeStress = deps.clamp(
    currentWinterTreeStress + winterTreeStressDailyAdd - winterTreeStressRecovery,
    0,
    100
  );
  const nextWinterDamageLevel = (() => {
    if (nextWinterTreeStress >= 70) return 'critical';
    if (nextWinterTreeStress >= 45) return 'severe';
    if (nextWinterTreeStress >= 25) return 'moderate';
    if (nextWinterTreeStress >= 10) return 'light';
    return 'none';
  })();
  const nextWinterDeathRisk = (() => {
    if (nextWinterTreeStress >= 80) return 0.04;
    if (nextWinterTreeStress >= 60) return 0.015;
    if (nextWinterTreeStress >= 40) return 0.004;
    return 0;
  })();
  const winterTreeStressVigorPenaltyFinal = (() => {
    if (nextWinterDamageLevel === 'critical') return 0.3;
    if (nextWinterDamageLevel === 'severe') return 0.18;
    if (nextWinterDamageLevel === 'moderate') return 0.08;
    if (nextWinterDamageLevel === 'light') return 0.03;
    return 0;
  })();
  const winterDamageLogText = (() => {
    if (!field?.cropId || winterTreeStressDailyAdd <= 0.01) return '';
    const fieldName = String(field?.name || '과수원');
    const protectText = winterProtectionCoatingPct > 0
      ? ` / 도포 보호 ${winterProtectionCoatingPct.toFixed(0)}%`
      : '';
    return `${fieldName} 동해 스트레스 +${winterTreeStressDailyAdd.toFixed(1)} (${Math.round(coldRiskTemperatureC)}°C / 단계 ${nextWinterDamageLevel}${protectText})`;
  })();

  const bloomInsecticidePenalty = (() => {
    const raw = field?.bloomInsecticidePenalty;
    if (!raw || typeof raw !== 'object') return null;
    const startDay = Math.max(0, Math.floor(Number(raw.startDay) || 0));
    const endDay = Math.max(0, Math.floor(Number(raw.endDay) || 0));
    const dailyQualityPenalty = Math.max(0, Number(raw.dailyQualityPenalty) || 0);
    const pauseFruitLoadGrowth = Boolean(raw.pauseFruitLoadGrowth);
    if (startDay <= 0 || endDay < startDay) return null;
    if (dailyQualityPenalty <= 0 && !pauseFruitLoadGrowth) return null;
    return { startDay, endDay, dailyQualityPenalty, pauseFruitLoadGrowth };
  })();
  const bloomInsecticidePenaltyActive = Boolean(
    bloomInsecticidePenalty
    && nextDay >= bloomInsecticidePenalty.startDay
    && nextDay <= bloomInsecticidePenalty.endDay
  );
  const bloomDailyQualityPenalty = bloomInsecticidePenaltyActive
    ? (bloomInsecticidePenalty.dailyQualityPenalty || 0)
    : 0;
  const bloomFruitLoadGrowthPaused = bloomInsecticidePenaltyActive
    ? Boolean(bloomInsecticidePenalty.pauseFruitLoadGrowth)
    : false;
  const nextBloomInsecticidePenaltyState = (() => {
    if (!bloomInsecticidePenalty) return null;
    if (nextDay > bloomInsecticidePenalty.endDay) return null;
    return bloomInsecticidePenalty;
  })();

  const coldDamageBase = hasColdRiskToday
    ? (coldRiskInfo.level === 'danger' ? deps.coldDamageDangerBase : deps.coldDamageWarnBase)
    : 0;
  const frostFanProtection = Boolean(
    hasColdRiskToday
    && deps.fieldHasFrostFanSystem(field)
    && Boolean(field?.frostFanEnabled)
    && deps.fieldFacilityUsable(field, 'frostFan', nextDay)
  )
    ? deps.frostFanProtectionRatio
    : 0;
  const microSprinklerProtection = hasColdRiskToday && microSprinklerRan ? deps.microSprinklerProtectionRatio : 0;
  const coldDamagePenaltyMulBase = Math.max(0.05, 1 - frostFanProtection - microSprinklerProtection);
  const coldDamagePenaltyMul = coldDamagePenaltyMulBase
    + (microSprinklerWaterShortage ? deps.microSprinklerWaterShortagePenaltyRatio : 0)
    + (microSprinklerStopPenalty ? deps.microSprinklerStopPenaltyRatio : 0);
  const coldDamage = coldDamageBase > 0 ? (coldDamageBase * coldDamagePenaltyMul) : 0;
  const addedColdFruitLoadPenalty = Math.max(0, coldDamage * deps.coldDamageToFruitLoadRatio);
  const addedColdQualityPenalty = Math.max(0, coldDamage * deps.coldDamageToQualityRatio);
  const addedColdVigorPenalty = Math.max(0, coldDamage * deps.coldDamageToVigorRatio);
  const coldDamageToday = deps.resolveColdDamageForDay(field?.coldDamagePending, {
    quality: addedColdQualityPenalty,
    vigor: addedColdVigorPenalty,
    fruitLoad: addedColdFruitLoadPenalty
  });
  const coldFruitLoadPenalty = coldDamageToday.todayFruitLoadPenalty;
  const coldQualityPenalty = coldDamageToday.todayQualityPenalty;
  const coldVigorPenalty = coldDamageToday.todayVigorPenalty;
  const nextColdDamagePending = coldDamageToday.nextPending;

  const coldDamageLogText = hasColdRiskToday && coldDamage > 0
    ? (() => {
        const defenseTags = [
          frostFanProtection > 0 ? '방상팬' : '',
          microSprinklerRan ? '미세살수 정상' : '',
          microSprinklerWaterShortage ? '미세살수 물량부족' : '',
          microSprinklerStopPenalty ? '미세살수 중단패널티' : ''
        ].filter(Boolean).join(', ');
        return `${field.name} ${coldRiskInfo.stageLabel} 냉해 (${Math.round(coldRiskTemperatureC)}°C) 피해 ${coldDamage.toFixed(1)} / 10일 분할 반영 시작`
          + (defenseTags ? ` / ${defenseTags}` : '');
      })()
    : '';

  const baseNextFruitLoadReductionByAge = (() => {
    const base = { ...(field.fruitLoadReductionByAge || {}) };
    const addTotal = Math.max(0, vigorFruitPenalty);
    const totalAdd = addTotal + coldFruitLoadPenalty;
    if (totalAdd <= 0) return base;
    const nextAll = Math.max(0, Number(base.all) || 0) + totalAdd;
    return { ...base, all: nextAll };
  })();
  const fieldWithBaseNextFruitLoad = { ...field, fruitLoadReductionByAge: baseNextFruitLoadReductionByAge };
  const cleanupWasteDailyGenerated = deps.cleanupWasteDailyGenerationKgOfField(
    fieldWithBaseNextFruitLoad,
    nextDay,
    month,
    weatherName
  );
  const overdueDroppedFruitLoadPerTree = Math.max(0, Number(cleanupWasteDailyGenerated?.droppedFruitLoadPerTree) || 0);
  const nextFruitLoadReductionByAge = overdueDroppedFruitLoadPerTree > 0
    ? {
      ...baseNextFruitLoadReductionByAge,
      all: Math.max(0, Number(baseNextFruitLoadReductionByAge?.all) || 0) + overdueDroppedFruitLoadPerTree
    }
    : baseNextFruitLoadReductionByAge;
  const nextPruningBranchWasteKg = Math.max(0, Number(field?.pruningBranchWasteKg) || 0);
  const nextLeafWasteKg = Math.max(0, Number(field?.leafWasteKg) || 0)
    + Math.max(0, Number(cleanupWasteDailyGenerated?.leafKg) || 0);
  const nextDroppedFruitWasteKg = Math.max(0, Number(field?.droppedFruitWasteKg) || 0)
    + Math.max(0, Number(cleanupWasteDailyGenerated?.droppedFruitKg) || 0);
  const cleanupWastePenaltyProfile = deps.cleanupWastePenaltyProfileOfField({
    ...field,
    pruningBranchWasteKg: nextPruningBranchWasteKg,
    leafWasteKg: nextLeafWasteKg,
    droppedFruitWasteKg: nextDroppedFruitWasteKg
  });
  const fieldWithNextFruitLoad = { ...field, fruitLoadReductionByAge: nextFruitLoadReductionByAge };
  const nextFruitLoadPerTreeRaw = deps.fieldFruitLoadPerTreeByRows(fieldWithNextFruitLoad, nextDay);
  const nextFruitLoadPerTree = bloomFruitLoadGrowthPaused
    ? Math.min(deps.clamp(Number(field.fruitLoadPerTree) || 0, 0, deps.fruitLoadMax), nextFruitLoadPerTreeRaw)
    : nextFruitLoadPerTreeRaw;
  const fruitLoadVigorDelta = deps.fruitLoadVigorDeltaByAgeForField(fieldWithNextFruitLoad, nextDay);
  const appliedBaseDailyVigorDeltaRaw = deps.dailyVigorIncrease(month, weatherName, nextNutrition, nextWater)
    * deps.vigorGrowthAgeMultiplierForField(field, nextDay);
  const vigorGainEnabledBySunlight = nextCanopySunlight >= deps.canopySunlightVigorGainMin;
  const appliedBaseDailyVigorDelta = vigorGainEnabledBySunlight
    ? appliedBaseDailyVigorDeltaRaw
    : Math.min(0, appliedBaseDailyVigorDeltaRaw);
  const appliedFruitLoadVigorDelta = vigorGainEnabledBySunlight
    ? fruitLoadVigorDelta
    : Math.min(0, fruitLoadVigorDelta);
  const nextColdDamageFruitLoadLossTotal = field.cropId
    ? (Math.max(0, Number(field?.coldDamageFruitLoadLossTotal) || 0) + coldFruitLoadPenalty)
    : 0;

  const currentTaskProgress = { ...(field.taskProgress || {}) };
  const currentTaskLastDoneDayByKey = { ...(field.taskLastDoneDayByKey || {}) };
  const nextTaskProgress = { ...currentTaskProgress };
  deps.sprayTaskKeys.forEach((sprayKey) => {
    nextTaskProgress[sprayKey] = 0;
  });
  deps.cleanupWasteTaskKeys.forEach((cleanupKey) => {
    nextTaskProgress[cleanupKey] = 0;
  });
  nextTaskProgress[WINTER_PROTECTION_COATING_TASK_KEY] = nextWinterProtectionCoatingPct;
  const nextSprayUsageLitersByPesticide = {};
  const nextTaskLastDoneDayByKey = { ...currentTaskLastDoneDayByKey };
  deps.sprayTaskKeys.forEach((sprayKey) => {
    const sprayProgress = deps.clamp(Number(currentTaskProgress?.[sprayKey]) || 0, 0, 100);
    const sprayLastDoneDay = Math.max(0, Math.floor(Number(currentTaskLastDoneDayByKey?.[sprayKey]) || 0));
    const sprayCooldownActive = sprayLastDoneDay > 0 && nextDay < (sprayLastDoneDay + deps.pestSeasonIntervalDays);
    const sprayTriggeredToday = sprayProgress > 0;
    if (sprayTriggeredToday) {
      nextTaskLastDoneDayByKey[sprayKey] = nextDay;
    } else if (!sprayCooldownActive) {
      nextTaskLastDoneDayByKey[sprayKey] = 0;
    }
  });

  const foliarVigorBoost = (() => {
    const raw = field?.foliarVigorBoost;
    if (!raw || typeof raw !== 'object') return null;
    const startDay = Math.max(0, Math.floor(Number(raw.startDay) || 0));
    const endDay = Math.max(0, Math.floor(Number(raw.endDay) || 0));
    const dailyIncrease = Math.max(0, Number(raw.dailyIncrease) || 0);
    if (startDay <= 0 || endDay < startDay || dailyIncrease <= 0) return null;
    return { startDay, endDay, dailyIncrease };
  })();
  const foliarVigorBoostActive = Boolean(
    foliarVigorBoost
    && nextDay >= foliarVigorBoost.startDay
    && nextDay <= foliarVigorBoost.endDay
  );
  const foliarVigorBoostToday = foliarVigorBoostActive
    ? (foliarVigorBoost.dailyIncrease || 0)
    : 0;
  const appliedFoliarVigorBoostToday = vigorGainEnabledBySunlight ? foliarVigorBoostToday : 0;

  const pestProfileResultRaw = processDailyPestProfiles({
    field,
    nextDay,
    month,
    weatherName,
    temperatureC: nextTemperatureC,
    nextWater,
    nextWeed,
    vigorAgeMul,
    cleanupWastePenaltyProfile,
    pestRainBoostMultiplier
  }, {
    clamp: deps.clamp,
    toDate: deps.toDate,
    normalizePestProfile: deps.normalizePestProfile,
    normalizeDiseaseProfile: deps.normalizeDiseaseProfile,
    waterPestStressBonus: deps.waterPestStressBonus,
    dailyHighVigorPestBonus: deps.dailyHighVigorPestBonus,
    pestIncreaseAgeMultiplierForField: deps.pestIncreaseAgeMultiplierForField,
    growthStageLabel: deps.growthStageLabel,
    dailyPestIncrease: deps.dailyPestIncrease,
    weatherRiskBandOf: deps.weatherRiskBandOf,
    buildProfileIncreaseDelta: deps.buildProfileIncreaseDelta,
    applyProfileDelta: deps.applyProfileDelta,
    composePestGaugeValue: deps.composePestGaugeValue,
    pestProfileKeys: deps.pestProfileKeys,
    diseaseProfileKeys: deps.diseaseProfileKeys,
    pestProfileWeight: deps.pestProfileWeight,
    diseaseProfileWeight: deps.diseaseProfileWeight,
    pestProfileStageMultiplier: deps.pestProfileStageMultiplier,
    diseaseProfileStageMultiplier: deps.diseaseProfileStageMultiplier,
    pestProfileWeatherMultiplier: deps.pestProfileWeatherMultiplier,
    diseaseProfileWeatherMultiplier: deps.diseaseProfileWeatherMultiplier,
    pestProfileMonthMultiplier: deps.pestProfileMonthMultiplier,
    diseaseProfileMonthMultiplier: deps.diseaseProfileMonthMultiplier
  });
  const pruningSealCankerDailyDelta = pruningSealCankerDailyDeltaOf({
    field,
    nextDay,
    month,
    weatherName,
    temperatureC: nextTemperatureC,
    deps
  });
  const pestProfileResult = pruningSealCankerDailyDelta > 0
    ? (() => {
        const nextDiseaseProfile = deps.applyProfileDelta(
          pestProfileResultRaw.nextDiseaseProfile,
          { canker: pruningSealCankerDailyDelta },
          deps.diseaseProfileKeys
        );
        return {
          ...pestProfileResultRaw,
          nextDiseaseProfile,
          nextPest: deps.composePestGaugeValue(pestProfileResultRaw.nextPestProfile, nextDiseaseProfile),
          pruningSealCankerDailyDelta
        };
      })()
    : {
        ...pestProfileResultRaw,
        pruningSealCankerDailyDelta: 0
      };

  const weedVigorPenaltyNoCrop = deps.severeWeedVigorPenaltyByLevel(nextWeed);
  const pestVigorPenalty = deps.pestVigorPenaltyByLevel(pestProfileResult.nextPest);
  const weedVigorPenalty = deps.severeWeedVigorPenaltyByLevel(nextWeed);
  const nextFoliarVigorBoost = (() => {
    if (!foliarVigorBoost) return null;
    if (nextDay > foliarVigorBoost.endDay) return null;
    return foliarVigorBoost;
  })();

  return {
    nextPruningBranchWasteKg,
    nextLeafWasteKg,
    nextDroppedFruitWasteKg,
    cleanupWastePenaltyProfile,
    vigorAgeMul,
    bloomDailyQualityPenalty,
    bloomFruitLoadGrowthPaused,
    nextBloomInsecticidePenaltyState,
    coldFruitLoadPenalty,
    coldQualityPenalty,
    coldVigorPenalty,
    nextColdDamagePending,
    coldDamageLogText,
    nextFruitLoadReductionByAge,
    fieldWithNextFruitLoad,
    nextFruitLoadPerTree,
    appliedBaseDailyVigorDelta,
    appliedFruitLoadVigorDelta,
    nextColdDamageFruitLoadLossTotal,
    nextTaskProgress,
    nextSprayUsageLitersByPesticide,
    nextTaskLastDoneDayByKey,
    appliedFoliarVigorBoostToday,
    nextFoliarVigorBoost,
    vigorGainEnabledBySunlight,
    weedVigorPenaltyNoCrop,
    pestVigorPenalty,
    weedVigorPenalty,
    nextWinterTreeStress,
    nextWinterDamageLevel,
    nextWinterDeathRisk,
    winterDamageLogText,
    winterTreeStressVigorPenalty: winterTreeStressVigorPenaltyFinal,
    pestProfileResult
  };
};
