import { resolveDailyCrewState } from '../../utils/dailyCrewUtils';
import { buildDailyWeatherEventLogs, resolveDailyWeatherEventState } from '../background/dailyWeatherEventUtils';

export const buildAdvanceDayPrelude = (params, deps) => {
  const { prev, currentTimeOfDay } = params;
  const nextDay = prev.day + 1;
  const month = deps.monthOf(nextDay);
  const nextYear = deps.toDate(nextDay).getFullYear();

  const weatherState = resolveDailyWeatherEventState({
    prev,
    nextDay,
    month,
    nextYear
  }, deps.weather);

  const crewState = resolveDailyCrewState({
    prevCrewRents: prev.crewRents,
    prevLabor: prev.labor,
    nextDay,
    currentTimeOfDay,
    nightSelfLaborBase: deps.labor.nightSelfLaborBase,
    nightLaborLowUsageThreshold: deps.labor.nightLaborLowUsageThreshold,
    selfLaborBase: deps.labor.selfLaborBase,
    selfLaborExhausted: deps.labor.selfLaborExhausted
  }, deps.crew);

  const activeAssignedOnNext = crewState.assignedRents.filter(
    (rent) => rent.status === 'approved' && rent.startDay <= nextDay && nextDay <= rent.endDay
  );
  const externalCrewLaborByType = activeAssignedOnNext.reduce((acc, rent) => {
    const type = deps.crewTypes.normalizeCrewTypeKey(rent.type);
    return {
      ...acc,
      [type]: (acc[type] || 0) + deps.crew.assignedLaborTotalOfRent(rent)
    };
  }, deps.crewTypes.createEmptyCrewTypeMap());
  const externalCrewLabor = deps.crewTypes.crewTypeKeys.reduce(
    (sum, key) => sum + Math.max(0, Number(externalCrewLaborByType[key]) || 0),
    0
  );
  const nextLabor = crewState.selfLabor;
  const dayLog = `하루 진행 / 날씨 ${weatherState.weather.name} (${weatherState.weather.desc}) / 기온 ${weatherState.nextTemperatureC}°C`;
  const laborTypeLog = deps.crewTypes.crewTypeKeys
    .map((key) => `${deps.crewTypes.crewTypeNameOf(key)} ${Math.max(0, Number(externalCrewLaborByType[key]) || 0)}`)
    .join(' / ');
  const laborLog = `노동력 배정: 자가 ${crewState.selfLabor} / 외부인력 ${externalCrewLabor} (${laborTypeLog}) / 전야 사용 ${crewState.nightUsedLabor.toFixed(1)}`;
  const weatherLogs = buildDailyWeatherEventLogs({
    nextDay,
    monsoonStartedToday: weatherState.monsoonStartedToday,
    monsoonEndDay: weatherState.monsoonEndDay,
    prevMonsoonEndDay: weatherState.prevMonsoonEndDay,
    dryHotWindStartedToday: weatherState.dryHotWindStartedToday,
    dryHotWindUntilDay: weatherState.dryHotWindUntilDay,
    prevDryHotWindUntilDay: weatherState.prevDryHotWindUntilDay
  }, deps.formatters);

  const isWeekTick = nextDay % 7 === 0;
  const nutritionDrain = deps.daily.dailyNutritionDrain(month);
  const waterDrain = deps.daily.dailyWaterDrain(month, weatherState.weather.name);
  const weedIncreaseBase = deps.daily.dailyWeedIncrease(month);
  const isWinterSeason = deps.season.seasonKey(month) === 'winter';
  const prevPestRainBoostUntilDay = Math.max(0, Math.floor(Number(prev?.pestRainBoostUntilDay) || 0));
  const pestRainBoostMultiplier = !isWinterSeason && nextDay <= prevPestRainBoostUntilDay
    ? deps.daily.pestRainWeatherBoostMultiplier
    : 1;
  const prevWeedRainBoostUntilDay = Math.max(0, Math.floor(Number(prev?.weedRainBoostUntilDay) || 0));
  const weedRainBoostMultiplier = nextDay <= prevWeedRainBoostUntilDay
    ? deps.daily.weedRainWeatherBoostMultiplier
    : 1;

  return {
    month,
    nextDay,
    nextYear,
    ...weatherState,
    ...crewState,
    externalCrewLaborByType,
    externalCrewLabor,
    nextLabor,
    dayLog,
    laborLog,
    monsoonLog: weatherLogs.monsoonLog,
    dryHotWindLog: weatherLogs.dryHotWindLog,
    isWeekTick,
    nutritionDrain,
    waterDrain,
    weedIncreaseBase,
    isWinterSeason,
    prevPestRainBoostUntilDay,
    pestRainBoostMultiplier,
    prevWeedRainBoostUntilDay,
    weedRainBoostMultiplier
  };
};
