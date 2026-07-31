export const buildAdvanceDayFieldSurface = (params, deps) => {
  const {
    field,
    nextDay,
    weatherName,
    nextNutrition,
    nextWater,
    weedIncreaseBase,
    isWinterSeason,
    weedRainBoostMultiplier,
    weedMowGrowthReductionRatio
  } = params;

  const herbicideEffect = deps.normalizeHerbicideEffect(field?.herbicideEffect);
  const herbicideEffectActive = Boolean(
    herbicideEffect
    && nextDay >= herbicideEffect.startDay
    && nextDay <= herbicideEffect.endDay
  );
  const herbicideWeedGrowthReductionRatio = herbicideEffectActive
    ? deps.clamp(Number(herbicideEffect.weedGrowthReductionRatio) || 0, 0, 0.98)
    : 0;
  const herbicideDailyWeedReductionRatio = herbicideEffectActive
    ? deps.clamp(Number(herbicideEffect.dailyWeedReductionRatio) || 0, 0, 0.98)
    : 0;
  const herbicideDailyVigorPenalty = herbicideEffectActive
    ? Math.max(0, Number(herbicideEffect.dailyVigorPenalty) || 0)
    : 0;
  const herbicideDailyWeedReductionAmount = herbicideEffectActive
    ? deps.clamp(Number(herbicideEffect.dailyWeedReductionAmount) || 0, 0, 100)
    : 0;
  const nextHerbicideEffectState = (() => {
    if (!herbicideEffect) return null;
    if (nextDay > herbicideEffect.endDay) return null;
    return herbicideEffect;
  })();

  const weedGrowthReductionUntilDay = Math.max(0, Math.floor(Number(field?.weedGrowthReductionUntilDay) || 0));
  const weedGrowthReductionActive = weedGrowthReductionUntilDay > 0 && nextDay <= weedGrowthReductionUntilDay;
  const weedIncreaseRawBase = weedIncreaseBase
    + deps.dailyWeedWeatherBonus(weatherName)
    + deps.dailyWeedNutritionBonus(nextNutrition)
    + deps.dailyWeedWaterBonus(nextWater);
  const weedIncreaseRaw = weedIncreaseRawBase > 0
    ? (weedIncreaseRawBase * weedRainBoostMultiplier)
    : weedIncreaseRawBase;
  const weedIncreaseAfterMow = weedGrowthReductionActive
    ? (weedIncreaseRaw * (1 - weedMowGrowthReductionRatio))
    : weedIncreaseRaw;
  const weedIncreaseBaseAfterHerbicide = weedIncreaseAfterMow * (1 - herbicideWeedGrowthReductionRatio);
  const weedDeltaAfterHerbicide = (
    weedIncreaseBaseAfterHerbicide * (1 - herbicideDailyWeedReductionRatio)
  ) - herbicideDailyWeedReductionAmount;
  const nextWeed = isWinterSeason
    ? 0
    : deps.clamp((Number(field?.weed) || 0) + weedDeltaAfterHerbicide, 0, 100);

  return {
    herbicideDailyVigorPenalty,
    nextHerbicideEffectState,
    weedGrowthReductionUntilDay,
    nextWeed
  };
};
