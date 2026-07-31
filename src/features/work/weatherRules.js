const WEATHER_LABOR_RULES = [
  { pattern: /(폭우|장마|장맛비|강한소나기|대설|한파)/, multiplier: 1.9 },
  { pattern: /(강한우박|건조열풍)/, multiplier: 1.8 },
  { pattern: /(우박|비|소나기|눈|진눈깨비|이슬비|강풍|돌풍|황사|폭염|무더위|열대야|후텁)/, multiplier: 1.45 },
  { pattern: /(바람많음|산들바람)/, multiplier: 1.0 },
  { pattern: /(안개|박무|바람)/, multiplier: 1.15 },
  { pattern: /(흐림|흐린|구름많음|구름|맑음|청명)/, multiplier: 1.0 }
];

export const isWetWeatherForSpray = (weatherName = '') => {
  const w = String(weatherName || '');
  return /(우박|비|소나기|장마|장맛비|폭우|눈|진눈깨비|이슬비)/.test(w);
};

export const weatherLaborMultiplier = (weatherName = '') => {
  const w = String(weatherName || '');
  const hit = WEATHER_LABOR_RULES.find((rule) => rule.pattern.test(w));
  return Number(hit?.multiplier) || 1;
};

export const temperatureLaborMultiplier = (temperatureC = 15) => {
  const temp = Number(temperatureC);
  const safeTemp = Number.isFinite(temp) ? temp : 15;
  if (safeTemp >= 34) return 1.35;
  if (safeTemp >= 31) return 1.22;
  if (safeTemp >= 28) return 1.12;
  if (safeTemp >= 25) return 1.05;
  if (safeTemp >= 5) return 1.0;
  if (safeTemp >= 0) return 1.08;
  if (safeTemp >= -4) return 1.18;
  return 1.32;
};

// Backward-compat alias: 기존 호출부가 남아있어도 동일 동작 보장
export const rainyWorkLaborMultiplier = (weatherName = '') => weatherLaborMultiplier(weatherName);
