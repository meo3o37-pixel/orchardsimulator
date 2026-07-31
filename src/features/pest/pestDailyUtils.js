export const processDailyPestProfiles = (
  {
    field,
    nextDay,
    month,
    weatherName,
    temperatureC,
    nextWater,
    nextWeed,
    vigorAgeMul,
    cleanupWastePenaltyProfile,
    pestRainBoostMultiplier
  },
  deps
) => {
  const d = deps.toDate(nextDay);
  const date = d.getDate();
  const isReserveEmpty = (profile = {}, keys = []) => keys.every((key) => (Number(profile?.[key]) || 0) <= 0.000001);
  const scaleProfile = (profile = {}, ratioRaw = 1, keys = []) => {
    const ratio = Math.max(0, Number(ratioRaw) || 0);
    return keys.reduce((acc, key) => {
      acc[key] = deps.clamp((Number(profile?.[key]) || 0) * ratio, 0, 100);
      return acc;
    }, {});
  };
  const applyProfileDecay = (profile = {}, decayRaw = 0, keys = []) => {
    const keepRatio = Math.max(0, 1 - Math.max(0, Number(decayRaw) || 0));
    return scaleProfile(profile, keepRatio, keys);
  };
  const winterProfileCap = (profile = {}, capProfile = {}, keys = []) => keys.reduce((acc, key) => {
    acc[key] = deps.clamp(
      Math.min(
        Number(profile?.[key]) || 0,
        Number(capProfile?.[key]) || 0
      ),
      0,
      100
    );
    return acc;
  }, {});
  const isLateAutumnPeakDay = month === 11 && date === 20;
  const isLateAutumnDecayWindow = month === 11 && date >= 21;
  const isWinterDormantWindow = month === 12 || month === 1 || month === 2;
  const isSpringWakeDay = month === 3 && date === 1;
  const currentPestProfile = deps.normalizePestProfile(field?.pestProfile, Number(field?.pest ?? 10));
  const currentDiseaseProfile = deps.normalizeDiseaseProfile(field?.diseaseProfile, Number(field?.pest ?? 10));
  const currentOverwinterPestProfile = deps.normalizePestProfile(field?.overwinterPestProfile, 0);
  const currentOverwinterDiseaseProfile = deps.normalizeDiseaseProfile(field?.overwinterDiseaseProfile, 0);
  const waterPestBonus = deps.waterPestStressBonus(nextWater);
  const highVigorPestBonus = deps.dailyHighVigorPestBonus(field.vigor) * vigorAgeMul;
  const pestAgeMul = deps.pestIncreaseAgeMultiplierForField(field, nextDay);
  const stageLabelNow = deps.growthStageLabel(field);
  const pestOutbreakActive = false;
  const pestOutbreakQualityPenalty = 0;
  const pestOutbreakPestIncreaseBonus = 0;
  const pruningEffect = (() => {
    const raw = field?.pruningEffect;
    if (!raw || typeof raw !== 'object') return null;
    const startDay = Math.max(0, Math.floor(Number(raw.startDay) || 0));
    const endDay = Math.max(0, Math.floor(Number(raw.endDay) || 0));
    const pestReductionRatio = deps.clamp(Number(raw.pestReductionRatio) || 0, 0, 1);
    const highVigorQualityPenaltyReductionRatio = deps.clamp(Number(raw.highVigorQualityPenaltyReductionRatio) || 0, 0, 1);
    if (startDay <= 0 || endDay < startDay) return null;
    if (pestReductionRatio <= 0 && highVigorQualityPenaltyReductionRatio <= 0) return null;
    return {
      startDay,
      endDay,
      pestReductionRatio,
      highVigorQualityPenaltyReductionRatio,
      source: String(raw.source || '')
    };
  })();
  const pruningEffectActive = Boolean(pruningEffect && nextDay >= pruningEffect.startDay && nextDay <= pruningEffect.endDay);
  const electricPruningPestBoost = (() => {
    const raw = field?.electricPruningPestBoost;
    if (!raw || typeof raw !== 'object') return null;
    const startDay = Math.max(0, Math.floor(Number(raw.startDay) || 0));
    const endDay = Math.max(0, Math.floor(Number(raw.endDay) || 0));
    const dailyIncrease = Math.max(0, Number(raw.dailyIncrease) || 0);
    if (startDay <= 0 || endDay < startDay || dailyIncrease <= 0) return null;
    return { startDay, endDay, dailyIncrease };
  })();
  const electricPruningPestBoostActive = Boolean(
    electricPruningPestBoost
    && nextDay >= electricPruningPestBoost.startDay
    && nextDay <= electricPruningPestBoost.endDay
  );
  const electricPruningPestBoostToday = electricPruningPestBoostActive
    ? (electricPruningPestBoost.dailyIncrease || 0)
    : 0;
  const weedPestMultiplier = (nextWeed >= 60 && nextWeed < 80) ? 1.15 : 1;
  const pestIncreaseBase = (((deps.dailyPestIncrease(month, weatherName) + waterPestBonus + highVigorPestBonus + pestOutbreakPestIncreaseBonus + cleanupWastePenaltyProfile.pestDailyBonus) * weedPestMultiplier) * pestAgeMul) * pestRainBoostMultiplier;
  const pestIncrease = pruningEffectActive
    ? (pestIncreaseBase * (1 - (pruningEffect?.pestReductionRatio || 0)))
    : pestIncreaseBase;
  const diseaseIncreaseBase = Math.max(
    0,
    (deps.dailyPestIncrease(month, weatherName) * 0.8)
    + (deps.weatherRiskBandOf(weatherName, temperatureC) === 'rain' ? 0.24 : 0)
    + (deps.weatherRiskBandOf(weatherName, temperatureC) === 'humid' ? 0.15 : 0)
  );
  const slowDecay = (() => {
    const raw = field?.pestSeasonSlowDecay;
    if (!raw || typeof raw !== 'object') return null;
    const startDay = Math.max(0, Math.floor(Number(raw.startDay) || 0));
    const endDay = Math.max(0, Math.floor(Number(raw.endDay) || 0));
    const dailyDecay = Math.max(0, Number(raw.dailyDecay) || 0);
    if (startDay <= 0 || endDay < startDay || dailyDecay <= 0) return null;
    return { startDay, endDay, dailyDecay };
  })();
  const slowDecayActive = Boolean(slowDecay && nextDay >= slowDecay.startDay && nextDay <= slowDecay.endDay);
  const slowDecayToday = slowDecayActive ? slowDecay.dailyDecay : 0;
  const pestDailyDelta = deps.buildProfileIncreaseDelta({
    baseIncreaseRaw: pestIncrease,
    month,
    stageLabel: stageLabelNow,
    weatherName,
    temperatureC,
    keys: deps.pestProfileKeys,
    weightMap: deps.pestProfileWeight,
    stageMultiplierMap: deps.pestProfileStageMultiplier,
    weatherMultiplierMap: deps.pestProfileWeatherMultiplier,
    monthMultiplierMap: deps.pestProfileMonthMultiplier
  });
  const diseaseDailyDelta = deps.buildProfileIncreaseDelta({
    baseIncreaseRaw: diseaseIncreaseBase,
    month,
    stageLabel: stageLabelNow,
    weatherName,
    temperatureC,
    keys: deps.diseaseProfileKeys,
    weightMap: deps.diseaseProfileWeight,
    stageMultiplierMap: deps.diseaseProfileStageMultiplier,
    weatherMultiplierMap: deps.diseaseProfileWeatherMultiplier,
    monthMultiplierMap: deps.diseaseProfileMonthMultiplier
  });
  const electricBoostDelta = {
    mite: electricPruningPestBoostToday * 0.65,
    moth: electricPruningPestBoostToday * 0.35
  };
  const slowDecayDelta = deps.pestProfileKeys.reduce((acc, key) => ({
    ...acc,
    [key]: -slowDecayToday * (Number(deps.pestProfileWeight[key]) || 0)
  }), {});
  const pestProfileAfterDaily = deps.applyProfileDelta(
    deps.applyProfileDelta(
      deps.applyProfileDelta(currentPestProfile, pestDailyDelta, deps.pestProfileKeys),
      electricBoostDelta,
      deps.pestProfileKeys
    ),
    slowDecayDelta,
    deps.pestProfileKeys
  );
  const diseaseProfileAfterDaily = deps.applyProfileDelta(currentDiseaseProfile, diseaseDailyDelta, deps.diseaseProfileKeys);
  const nextPestBase = deps.composePestGaugeValue(pestProfileAfterDaily, diseaseProfileAfterDaily);
  const nextPestOutbreakState = null;
  const pestEventDelta = {};
  let nextPestProfile = deps.applyProfileDelta(pestProfileAfterDaily, pestEventDelta, deps.pestProfileKeys);
  let nextDiseaseProfile = diseaseProfileAfterDaily;
  let nextOverwinterPestProfile = currentOverwinterPestProfile;
  let nextOverwinterDiseaseProfile = currentOverwinterDiseaseProfile;

  if (isLateAutumnPeakDay) {
    nextOverwinterPestProfile = scaleProfile(nextPestProfile, 0.45, deps.pestProfileKeys);
    nextOverwinterDiseaseProfile = scaleProfile(nextDiseaseProfile, 0.50, deps.diseaseProfileKeys);
  } else if (isLateAutumnDecayWindow || isWinterDormantWindow || isSpringWakeDay) {
    const fallbackReservePestProfile = isReserveEmpty(currentOverwinterPestProfile, deps.pestProfileKeys)
      ? scaleProfile(currentPestProfile, 0.45, deps.pestProfileKeys)
      : currentOverwinterPestProfile;
    const fallbackReserveDiseaseProfile = isReserveEmpty(currentOverwinterDiseaseProfile, deps.diseaseProfileKeys)
      ? scaleProfile(currentDiseaseProfile, 0.50, deps.diseaseProfileKeys)
      : currentOverwinterDiseaseProfile;

    if (isLateAutumnDecayWindow) {
      nextOverwinterPestProfile = applyProfileDecay(fallbackReservePestProfile, 0.01, deps.pestProfileKeys);
      nextOverwinterDiseaseProfile = applyProfileDecay(fallbackReserveDiseaseProfile, 0.006, deps.diseaseProfileKeys);
      nextPestProfile = winterProfileCap(
        applyProfileDecay(nextPestProfile, 0.12, deps.pestProfileKeys),
        scaleProfile(nextOverwinterPestProfile, 1.22, deps.pestProfileKeys),
        deps.pestProfileKeys
      );
      nextDiseaseProfile = winterProfileCap(
        applyProfileDecay(nextDiseaseProfile, 0.10, deps.diseaseProfileKeys),
        scaleProfile(nextOverwinterDiseaseProfile, 1.22, deps.diseaseProfileKeys),
        deps.diseaseProfileKeys
      );
    } else if (isWinterDormantWindow) {
      nextOverwinterPestProfile = applyProfileDecay(fallbackReservePestProfile, 0.0035, deps.pestProfileKeys);
      nextOverwinterDiseaseProfile = applyProfileDecay(fallbackReserveDiseaseProfile, 0.0020, deps.diseaseProfileKeys);
      nextPestProfile = scaleProfile(nextOverwinterPestProfile, 0.35, deps.pestProfileKeys);
      nextDiseaseProfile = scaleProfile(nextOverwinterDiseaseProfile, 0.42, deps.diseaseProfileKeys);
    } else if (isSpringWakeDay) {
      nextOverwinterPestProfile = fallbackReservePestProfile;
      nextOverwinterDiseaseProfile = fallbackReserveDiseaseProfile;
      nextPestProfile = scaleProfile(nextOverwinterPestProfile, 0.78, deps.pestProfileKeys);
      nextDiseaseProfile = scaleProfile(nextOverwinterDiseaseProfile, 0.82, deps.diseaseProfileKeys);
      nextOverwinterPestProfile = deps.normalizePestProfile(null, 0);
      nextOverwinterDiseaseProfile = deps.normalizeDiseaseProfile(null, 0);
    }
  }

  const nextPest = deps.composePestGaugeValue(nextPestProfile, nextDiseaseProfile);
  const nextSlowDecayState = (() => {
    if (!slowDecay) return null;
    if (nextDay > slowDecay.endDay) return null;
    return slowDecay;
  })();
  const nextPruningEffect = (() => {
    if (!pruningEffect) return null;
    if (nextDay > pruningEffect.endDay) return null;
    return pruningEffect;
  })();
  const nextElectricPruningPestBoost = (() => {
    if (!electricPruningPestBoost) return null;
    if (nextDay > electricPruningPestBoost.endDay) return null;
    return electricPruningPestBoost;
  })();
  return {
    currentPestProfile,
    currentDiseaseProfile,
    nextPestBase,
    nextPestProfile,
    nextDiseaseProfile,
    nextPest,
    nextOverwinterPestProfile,
    nextOverwinterDiseaseProfile,
    nextPestOutbreakState,
    nextSlowDecayState,
    nextPruningEffect,
    nextElectricPruningPestBoost,
    pruningEffect,
    pruningEffectActive,
    pestOutbreakActive,
    pestOutbreakQualityPenalty,
    pestOutbreakPestIncreaseBonus,
    stageLabelNow
  };
};
