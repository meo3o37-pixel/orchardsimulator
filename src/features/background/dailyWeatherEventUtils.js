export const resolveDailyWeatherEventState = (
  {
    prev,
    nextDay,
    month,
    nextYear
  },
  deps
) => {
  const prevSummerYear = Number(prev.monsoonSummerStartsYear) || nextYear;
  let monsoonSummerStartsYear = prevSummerYear === nextYear ? prevSummerYear : nextYear;
  let monsoonSummerStarts = prevSummerYear === nextYear ? Math.max(0, Number(prev.monsoonSummerStarts) || 0) : 0;
  const prevMonsoonEndDay = Math.max(0, Number(prev.monsoonEndDay) || 0);
  const monsoonOngoing = prevMonsoonEndDay >= nextDay;
  let monsoonEndDay = prevMonsoonEndDay;
  let monsoonStartedToday = false;

  const prevDryHotWindUntilDay = Math.max(0, Number(prev.dryHotWindUntilDay) || 0);
  const dryHotWindOngoing = prevDryHotWindUntilDay >= nextDay;
  let dryHotWindUntilDay = prevDryHotWindUntilDay;
  let dryHotWindStartedToday = false;

  const nextForecastRow = (Array.isArray(prev.weatherForecast) ? prev.weatherForecast : [])
    .find((row) => Math.max(1, Math.floor(Number(row?.day) || 0)) === nextDay);

  let weather;
  if (nextForecastRow?.weather) {
    const forecastWeatherName = String(nextForecastRow.weather || '');
    const forecastEntry = deps.weatherEntryByName?.[forecastWeatherName];
    const forecastIsPrecip = deps.isPrecipWeatherName(forecastWeatherName);
    const precipitationChance = deps.precipitationChanceFromForecastRow(nextForecastRow, 1);
    const shouldPrecip = Math.random() < (precipitationChance / 100);
    if (forecastEntry && (forecastIsPrecip === shouldPrecip)) {
      weather = forecastEntry;
    } else {
      weather = deps.pickWeatherByPrecip(month, prev.weather, shouldPrecip);
    }
  } else {
    weather = deps.pickWeather(month, prev.weather);
  }

  const forecastTemperatureC = Number.isFinite(Number(nextForecastRow?.temperatureC))
    ? deps.clamp(Math.round(Number(nextForecastRow.temperatureC)), -30, 45)
    : deps.pickTemperatureForDay(nextDay);
  let nextTemperatureC = forecastTemperatureC;
  let coldSnapLog = '';

  if (monsoonOngoing) {
    weather = deps.monsoonWeather;
  } else if (
    deps.monsoonMonths.includes(month)
    && monsoonSummerStarts < deps.monsoonMaxStartsPerSummer
    && Math.random() < deps.monsoonStartChance
  ) {
    const duration = deps.randIntInclusive(deps.monsoonDurationMin, deps.monsoonDurationMax);
    monsoonEndDay = nextDay + duration - 1;
    monsoonStartedToday = true;
    monsoonSummerStarts += 1;
    weather = deps.monsoonWeather;
  } else if (prevMonsoonEndDay > 0 && prevMonsoonEndDay < nextDay) {
    monsoonEndDay = 0;
  } else if (!deps.monsoonMonths.includes(month) && monsoonEndDay > 0) {
    monsoonEndDay = 0;
  }

  if (month === 4 && Math.random() < deps.aprilColdSnapChance) {
    const dropC = deps.randIntInclusive(deps.aprilColdSnapDropMinC, deps.aprilColdSnapDropMaxC);
    nextTemperatureC = deps.clamp(nextTemperatureC - dropC, -30, 45);
    coldSnapLog = `꽃샘추위 발생: 기온 ${forecastTemperatureC}°C → ${nextTemperatureC}°C (${dropC}°C 하락)`;
  }

  const isSummerMonth = [6, 7, 8].includes(month);
  if (monsoonOngoing || monsoonStartedToday || !isSummerMonth) {
    dryHotWindUntilDay = 0;
  } else if (dryHotWindOngoing && isSummerMonth) {
    weather = deps.dryHotWindWeather;
  } else if (isSummerMonth && Math.random() < deps.dryHotWindStartChance) {
    const duration = deps.randIntInclusive(deps.dryHotWindDurationMin, deps.dryHotWindDurationMax);
    dryHotWindUntilDay = nextDay + duration - 1;
    dryHotWindStartedToday = true;
    weather = deps.dryHotWindWeather;
  } else if (prevDryHotWindUntilDay > 0 && prevDryHotWindUntilDay < nextDay) {
    dryHotWindUntilDay = 0;
  }

  const hailAllowed = deps.seasonKey(month) !== 'winter' && weather?.name !== deps.dryHotWindWeather.name;
  const hailConvertibleWeather = /비|소나기|장마|흐림|구름|박무|안개/.test(String(weather?.name || ''));
  if (hailAllowed && hailConvertibleWeather && Math.random() < deps.hailEventChance) {
    weather = deps.hailWeatherOptions[deps.randIntInclusive(0, deps.hailWeatherOptions.length - 1)] || weather;
  }

  return {
    nextForecastRow,
    weather,
    forecastTemperatureC,
    nextTemperatureC,
    coldSnapLog,
    prevMonsoonEndDay,
    monsoonEndDay,
    monsoonSummerStartsYear,
    monsoonSummerStarts,
    monsoonStartedToday,
    prevDryHotWindUntilDay,
    dryHotWindUntilDay,
    dryHotWindStartedToday
  };
};

export const buildDailyWeatherEventLogs = (
  {
    nextDay,
    monsoonStartedToday,
    monsoonEndDay,
    prevMonsoonEndDay,
    dryHotWindStartedToday,
    dryHotWindUntilDay,
    prevDryHotWindUntilDay
  },
  deps
) => {
  const monsoonLog = monsoonStartedToday
    ? `장마 시작: ${deps.longDate(nextDay)} ~ ${deps.longDate(monsoonEndDay)}`
    : (prevMonsoonEndDay > 0 && prevMonsoonEndDay === nextDay ? '장마 종료: 오늘로 장마가 마무리됩니다.' : '');
  const dryHotWindLog = dryHotWindStartedToday
    ? `건조열풍 시작: ${deps.longDate(nextDay)} ~ ${deps.longDate(dryHotWindUntilDay)}`
    : (prevDryHotWindUntilDay > 0 && prevDryHotWindUntilDay === nextDay ? '건조열풍 종료: 토양 수분 스트레스가 완화됩니다.' : '');

  return { monsoonLog, dryHotWindLog };
};
