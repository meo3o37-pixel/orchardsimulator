const applyForcedForecastWeather = (
  rows,
  {
    nextDay,
    untilDay,
    weatherName,
    weatherDesc
  },
  deps
) => {
  const remainingDays = Math.max(0, untilDay - nextDay + 1);
  if (remainingDays <= 0) return rows;
  const lastDayInForecast = nextDay + Math.min(7, remainingDays - 1);
  return rows.map((row, index) => {
    const day = Math.max(1, Math.floor(Number(row?.day) || 0));
    if (day < nextDay || day > lastDayInForecast) return row;
    return {
      ...row,
      weather: weatherName,
      weatherDesc,
      accuracy: index === 0 ? 1 : deps.clamp(Number(row?.accuracy) || deps.weatherForecastAccuracyByLead(index), 0.82, 1)
    };
  });
};

export const buildNextWeatherState = (
  {
    prevWeatherForecast,
    nextDay,
    weatherName,
    nextTemperatureC,
    isWinterSeason,
    prevPestRainBoostUntilDay,
    prevWeedRainBoostUntilDay,
    monsoonEndDay,
    monsoonWeather,
    dryHotWindUntilDay,
    dryHotWindWeather
  },
  deps
) => {
  let nextWeatherForecast = deps.rollWeatherForecastRows(
    prevWeatherForecast,
    nextDay,
    weatherName,
    8,
    nextTemperatureC
  );

  const nextPestRainBoostUntilDay = (!isWinterSeason && deps.isPrecipWeatherName(weatherName))
    ? Math.max(prevPestRainBoostUntilDay, nextDay + deps.pestRainWeatherBoostDays)
    : prevPestRainBoostUntilDay;
  const nextWeedRainBoostUntilDay = deps.isPrecipWeatherName(weatherName)
    ? Math.max(prevWeedRainBoostUntilDay, nextDay + deps.weedRainWeatherBoostDays)
    : prevWeedRainBoostUntilDay;

  nextWeatherForecast = applyForcedForecastWeather(nextWeatherForecast, {
    nextDay,
    untilDay: monsoonEndDay,
    weatherName: monsoonWeather.name,
    weatherDesc: monsoonWeather.desc
  }, deps);

  nextWeatherForecast = applyForcedForecastWeather(nextWeatherForecast, {
    nextDay,
    untilDay: dryHotWindUntilDay,
    weatherName: dryHotWindWeather.name,
    weatherDesc: dryHotWindWeather.desc
  }, deps);

  return {
    nextWeatherForecast,
    nextPestRainBoostUntilDay,
    nextWeedRainBoostUntilDay
  };
};
