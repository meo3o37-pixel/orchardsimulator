import { clamp, randIntInclusive, toDate } from './common';

export const RAIN_WEATHERS = [
  '\uBD04\uBE44',
  '\uC774\uC2AC\uBE44',
  '\uAC15\uD55C\uBD04\uBE44',
  '\uC57D\uD55C\uC18C\uB098\uAE30',
  '\uC5EC\uB984\uC18C\uB098\uAE30',
  '\uC18C\uB098\uAE30',
  '\uAC15\uD55C\uC18C\uB098\uAE30',
  '\uC7A5\uB9C8',
  '\uC7A5\uB9DB\uBE44',
  '\uD3ED\uC6B0',
  '\uAC00\uC744\uC774\uC2AC\uBE44',
  '\uAC00\uC744\uBE44',
  '\uAC15\uD55C\uAC00\uC744\uBE44',
  '\uC57D\uD55C\uC6B0\uBC15',
  '\uC6B0\uBC15',
  '\uAC15\uD55C\uC6B0\uBC15',
  '\uC9C4\uB208\uAE68\uBE44',
  '\uB208',
  '\uD3ED\uC124'
];

const WEATHER_PICK_DEFAULT_WEIGHT = 1;
const WEATHER_PICK_RAIN_WEIGHT = 0.3;
const WEATHER_PICK_DRY_HOT_WIND_WEIGHT = WEATHER_PICK_DEFAULT_WEIGHT * 0.2;

export const weatherPickWeight = (weatherName) =>
  weatherName === '\uAC74\uC870\uC5F4\uD48D'
    ? WEATHER_PICK_DRY_HOT_WIND_WEIGHT
    : (RAIN_WEATHERS.includes(weatherName) ? WEATHER_PICK_RAIN_WEIGHT : WEATHER_PICK_DEFAULT_WEIGHT);

export const rainfallWaterGain = (weatherName) => {
  if (weatherName === '\uC774\uC2AC\uBE44' || weatherName === '\uBD04\uBE44' || weatherName === '\uAC00\uC744\uC774\uC2AC\uBE44' || weatherName === '\uC9C4\uB208\uAE68\uBE44') return 1.15;
  if (weatherName === '\uC57D\uD55C\uC18C\uB098\uAE30' || weatherName === '\uC5EC\uB984\uC18C\uB098\uAE30' || weatherName === '\uC18C\uB098\uAE30' || weatherName === '\uAC00\uC744\uBE44' || weatherName === '\uB208') return 2.45;
  if (weatherName === '\uAC15\uD55C\uC18C\uB098\uAE30' || weatherName === '\uAC15\uD55C\uBD04\uBE44' || weatherName === '\uAC15\uD55C\uAC00\uC744\uBE44') return 3.75;
  if (weatherName === '\uC57D\uD55C\uC6B0\uBC15') return 2.65;
  if (weatherName === '\uC6B0\uBC15') return 3.2;
  if (weatherName === '\uAC15\uD55C\uC6B0\uBC15') return 3.9;
  if (weatherName === '\uC7A5\uB9C8' || weatherName === '\uC7A5\uB9DB\uBE44' || weatherName === '\uD3ED\uC6B0' || weatherName === '\uB300\uC124' || weatherName === '\uD3ED\uC124') return 5.2;
  return 0;
};

const pointOf = (year, month, date, value) => ({
  t: new Date(year, month - 1, date).getTime(),
  value
});

const DEFAULT_GROWTH_CURVE_POINTS = Object.freeze([
  [1, 1, 0],
  [3, 1, 3],
  [4, 1, 8],
  [4, 20, 14],
  [5, 10, 24],
  [6, 1, 34],
  [6, 20, 46],
  [7, 10, 58],
  [8, 1, 70],
  [8, 20, 80],
  [9, 10, 88],
  [10, 1, 94],
  [10, 20, 98],
  [11, 15, 100],
  [12, 1, 0]
]);

const GROWTH_CURVE_POINTS_BY_CROP = Object.freeze({
  hongro: Object.freeze([
    [1, 1, 0],
    [3, 1, 4],
    [4, 1, 10],
    [4, 20, 18],
    [5, 10, 30],
    [6, 1, 42],
    [6, 20, 56],
    [7, 10, 70],
    [8, 1, 84],
    [8, 20, 94],
    [9, 5, 100],
    [9, 20, 100],
    [10, 1, 0]
  ]),
  fuji: Object.freeze([
    [1, 1, 0],
    [3, 1, 3],
    [4, 1, 8],
    [4, 20, 14],
    [5, 10, 24],
    [6, 1, 34],
    [6, 20, 46],
    [7, 10, 58],
    [8, 1, 70],
    [8, 20, 80],
    [9, 10, 88],
    [10, 1, 94],
    [10, 20, 98],
    [11, 15, 100],
    [11, 30, 100],
    [12, 1, 0]
  ]),
  gamhong: Object.freeze([
    [1, 1, 0],
    [3, 1, 3],
    [4, 1, 8],
    [4, 20, 14],
    [5, 10, 24],
    [6, 1, 34],
    [6, 20, 46],
    [7, 10, 58],
    [8, 1, 70],
    [8, 20, 80],
    [9, 20, 90],
    [10, 20, 100],
    [11, 5, 100],
    [11, 15, 0]
  ]),
  sinano: Object.freeze([
    [1, 1, 0],
    [3, 1, 3],
    [4, 1, 8],
    [4, 20, 14],
    [5, 10, 24],
    [6, 1, 34],
    [6, 20, 46],
    [7, 10, 58],
    [8, 1, 70],
    [8, 20, 80],
    [9, 15, 90],
    [10, 25, 100],
    [11, 10, 100],
    [11, 20, 0]
  ])
});

export const calendarGrowthPercent = (day, lastHarvestYear, cropId = '') => {
  const d = toDate(day);
  const year = d.getFullYear();
  if ((Number(lastHarvestYear) || 0) === year) return 0;
  const curvePoints = GROWTH_CURVE_POINTS_BY_CROP[String(cropId || '')] || DEFAULT_GROWTH_CURVE_POINTS;
  const points = curvePoints.map(([month, date, value]) => pointOf(year, month, date, value));
  const t = d.getTime();
  if (t <= points[0].t) return points[0].value;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    if (t <= next.t) {
      const ratio = clamp((t - prev.t) / (next.t - prev.t), 0, 1);
      return clamp(prev.value + ((next.value - prev.value) * ratio), 0, 100);
    }
  }
  return points[points.length - 1].value;
};

export const dailyQualityPenaltyFromNutrition = (field) => {
  const n = clamp(Number(field?.nutrition) || 0, 0, 100);
  // 양분 25 미만에서만 일일 품질 패널티를 부여한다.
  // n=25 -> 0, n=0 -> 최대 0.8/일
  if (n >= 25) return 0;
  const ratio = clamp((25 - n) / 25, 0, 1);
  return 0.8 * Math.pow(ratio, 1.15);
};

const weatherWaterBonus = (weatherName) => {
  if (RAIN_WEATHERS.includes(weatherName)) return -0.24;
  if (weatherName === '\uAC74\uC870\uC5F4\uD48D') return 0.85;
  if (weatherName === '\uB9D1\uC74C' || weatherName === '\uCCAD\uBA85' || weatherName === '\uC6B0\uBC15') return 0.16;
  return 0;
};

export const dailyNutritionDrain = (month) => {
  if ([6, 7, 8].includes(month)) return 0.14;
  if ([12, 1, 2].includes(month)) return 0.08;
  return 0.11;
};

export const dailyWeedIncrease = (month) => {
  // 4~8월은 생육 우세, 9월은 정체, 10월부터는 서서히 자연감소로 전환
  if (month === 1) return -5.5;
  if (month === 2) return -0.55;
  if (month === 3) return -0.10;
  if (month === 4) return 0.25;
  if (month === 5) return 0.55;
  if (month === 6) return 1.25;
  if (month === 7) return 1.35;
  if (month === 8) return 0.85;
  if (month === 9) return 0.10;
  if (month === 10) return -0.25;
  if (month === 11) return -0.45;
  return -5.5;
};

export const dailyWaterDrain = (month, weatherName) => {
  const base = [6, 7, 8].includes(month) ? 0.9 : [12, 1, 2].includes(month) ? 0.62 : 0.72;
  return Math.max(0.35, base + weatherWaterBonus(weatherName));
};

export const dailyPestIncrease = (month, weatherName) => {
  let base = 0;
  if (month === 3) base = 0.45;
  else if (month === 4) base = 0.65;
  else if (month === 5) base = 0.95;
  else if (month === 6) base = 1.45;
  else if (month === 7) base = 1.55;
  else if (month === 8) base = 1.35;
  else if (month === 9) base = 0.95;
  else if (month === 10) base = 0.75;
  else if (month === 11) base = 0.45;
  else base = 0.18;

  const isRain = RAIN_WEATHERS.includes(weatherName);
  let weatherAdj = 0;
  if (weatherName === '\uAC15\uD55C\uC6B0\uBC15') weatherAdj = 0.35;
  else if (weatherName === '\uC7A5\uB9C8' || weatherName === '\uC7A5\uB9DB\uBE44' || weatherName === '\uD3ED\uC6B0' || weatherName === '\uB300\uC124' || weatherName === '\uD3ED\uC124') weatherAdj = 0.4;
  else if (isRain) weatherAdj = 0.2;

  return Math.max(0, base + weatherAdj);
};

export const dailyVigorIncrease = (month, weatherName, nutrition, water) => {
  // 수세 상승 체감을 위해 기본 증가량을 상향했다.
  let base = [3, 4, 5, 6, 7, 8, 9].includes(month) ? 0.68 : 0.33;
  // 여름철(6~8월)에는 상승 폭을 추가로 높인다.
  if ([6, 7, 8].includes(month)) base += 0.18;
  // 가을 후반(10~11월)은 수세 하락 구간으로 강제한다.
  if (month === 10) base = -0.22;
  if (month === 11) base = -0.34;
  // 기본값 약 35% 하향
  base *= 0.65;
  // 날씨 보정은 강수 날씨일 때만 적용 (강수 종류별 최대 +2.0)
  const rainBonus = RAIN_WEATHERS.includes(weatherName)
    ? clamp((rainfallWaterGain(weatherName) / 4.16) * 2, 0, 2)
    : 0;
  // 양분 보정: 50을 기준으로 단계별 증감
  const n = clamp(Number(nutrition) || 0, 0, 100);
  let nutritionAdj = 0;
  if (n >= 90) nutritionAdj = 0.20;
  else if (n >= 80) nutritionAdj = 0.14;
  else if (n >= 70) nutritionAdj = 0.09;
  else if (n >= 60) nutritionAdj = 0.05;
  else if (n >= 50) nutritionAdj = 0.02;
  else if (n >= 40) nutritionAdj = -0.02;
  else if (n >= 30) nutritionAdj = -0.08;
  else if (n >= 20) nutritionAdj = -0.14;
  else nutritionAdj = -0.20;
  // 수분 보정: 토양수분 상태 구간에 맞춘 단계형 보정
  const w = clamp(Number(water) || 0, 0, 100);
  let waterAdj = 0;
  if (w < 10) waterAdj = 0; // 극건조
  else if (w < 20) waterAdj = -0.08; // 건조
  else if (w < 30) waterAdj = 0; // 부족
  else if (w < 45) waterAdj = 0.01; // 약간 부족
  else if (w < 50) waterAdj = 0.016; // 보통
  else if (w < 60) waterAdj = 0.04; // 적정
  else if (w < 75) waterAdj = 0.08; // 양호
  else if (w < 90) waterAdj = 0.12; // 다소 과습
  else waterAdj = 0; // 과습
  const raw = base + rainBonus + nutritionAdj + waterAdj;
  if (month === 10 || month === 11) return Math.min(-0.05, raw);
  return Math.max(0.1, raw);
};

export const dailyHighVigorPestBonus = (vigor) => {
  const v = clamp(Number(vigor) || 0, 0, 100);
  if (v >= 40) return 0;
  const t = clamp((40 - v) / 40, 0, 1);
  // 수세가 약할수록 병충해 일일 증가량 가산 (최대 +2/day)
  return 2 * Math.pow(t, 1.05);
};

export const dailyHighVigorQualityPenalty = (vigor) => {
  return 0;
};

export const highVigorFruitPenalty = (vigor) => {
  const v = clamp(Number(vigor) || 0, 0, 100);
  if (v <= 60) return 0;
  const t = clamp((v - 60) / 40, 0, 1);
  // 수세가 강할수록 자연착과량 감소분을 일일 누적 (최대 0.02개/주/일)
  return 0.02 * Math.pow(t, 1.15);
};

export const dailyPestQualityPenalty = (pestValue) => {
  const p = clamp(Number(pestValue) || 0, 0, 100);
  if (p < 45) return 0;
  // 경계값 이후로 급증하지 않도록 완만한 곡선 적용 (45~100 구간 최대 5)
  const t = clamp((p - 45) / 55, 0, 1);
  return Math.pow(t, 1.1) * 5;
};

const FRUIT_DISEASE_QUALITY_RULES = Object.freeze({
  scab: {
    label: '검은별무늬병 과피 피해',
    threshold: 20,
    maxDailyPenalty: 0.18,
    compositeWeight: 0.22 * 0.4
  },
  bitterRot: {
    label: '탄저병 과실 피해',
    threshold: 20,
    maxDailyPenalty: 0.35,
    compositeWeight: 0.20 * 0.4
  }
});

const fruitDiseaseQualityMonthMultiplier = (monthRaw) => {
  const month = Math.max(1, Math.min(12, Math.floor(Number(monthRaw) || 1)));
  if (month >= 7 && month <= 10) return 1.25;
  if (month >= 4 && month <= 6) return 0.8;
  return 0.2;
};

export const fruitDiseaseCompositeQualityPressure = (diseaseProfile = {}) => Object.entries(FRUIT_DISEASE_QUALITY_RULES)
  .reduce((sum, [key, rule]) => (
    sum + (clamp(Number(diseaseProfile?.[key]) || 0, 0, 100) * (Number(rule.compositeWeight) || 0))
  ), 0);

export const fruitDiseaseQualityPenaltyBreakdown = (diseaseProfile = {}, monthRaw = 1) => {
  const monthMultiplier = fruitDiseaseQualityMonthMultiplier(monthRaw);
  return Object.entries(FRUIT_DISEASE_QUALITY_RULES)
    .map(([key, rule]) => {
      const value = clamp(Number(diseaseProfile?.[key]) || 0, 0, 100);
      const threshold = clamp(Number(rule.threshold) || 0, 0, 100);
      if (value <= threshold) return null;
      const t = clamp((value - threshold) / Math.max(1, 100 - threshold), 0, 1);
      const penalty = t * (Number(rule.maxDailyPenalty) || 0) * monthMultiplier;
      return {
        key,
        label: rule.label,
        diseaseValue: value,
        value: penalty
      };
    })
    .filter((row) => row && row.value > 0);
};

export const dailyFruitDiseaseQualityPenalty = (diseaseProfile = {}, monthRaw = 1) => (
  fruitDiseaseQualityPenaltyBreakdown(diseaseProfile, monthRaw)
    .reduce((sum, row) => sum + (Number(row.value) || 0), 0)
);

export const dailyPestDeathChance = (pestValue) => {
  const p = clamp(Number(pestValue) || 0, 0, 100);
  if (p < 30) return 0;
  // 사용자 체감 기준의 단계형 선형 보간
  // 30:5%, 40:10%, 50:13%, 60:20%, 70:25%, 80:35%
  // 상위 구간은 급상승하도록 90:80%, 100:98%로 확장
  const lerp = (a, b, t) => a + ((b - a) * t);
  if (p < 40) return lerp(0.05, 0.10, (p - 30) / 10);
  if (p < 50) return lerp(0.10, 0.13, (p - 40) / 10);
  if (p < 60) return lerp(0.13, 0.20, (p - 50) / 10);
  if (p < 70) return lerp(0.20, 0.25, (p - 60) / 10);
  if (p < 80) return lerp(0.25, 0.35, (p - 70) / 10);
  if (p < 90) return lerp(0.35, 0.80, (p - 80) / 10);
  return lerp(0.80, 0.98, (p - 90) / 10);
};

const NATURAL_DAILY_DEATH_CHANCE = 0.001; // 0.1%

export const dailyPestDeathCount = (currentLive, pestValue, deathChance) => {
  const live = Math.max(0, Math.floor(Number(currentLive) || 0));
  if (live <= 0 || deathChance <= 0) return 0;
  if (Math.random() >= deathChance) return 0;
  const p = clamp(Number(pestValue) || 0, 0, 100);
  let maxDeathsOnHit = 1;
  let minDeathsOnHit = 1;
  if (p >= 100) {
    minDeathsOnHit = 10;
    maxDeathsOnHit = 20;
  } else if (p >= 90) {
    minDeathsOnHit = 4;
    maxDeathsOnHit = 12;
  } else if (p >= 80) maxDeathsOnHit = 8;
  else if (p >= 60) maxDeathsOnHit = 6;
  return Math.min(live, randIntInclusive(minDeathsOnHit, maxDeathsOnHit));
};

export const dailyNaturalDeathCount = (currentLive) => {
  const live = Math.max(0, Math.floor(Number(currentLive) || 0));
  if (live <= 0) return 0;
  return Math.random() < NATURAL_DAILY_DEATH_CHANCE ? 1 : 0;
};

export const waterPestStressBonus = (waterValue) => {
  const w = clamp(Number(waterValue) || 0, 0, 100);
  if (w <= 20) {
    const t = clamp((20 - w) / 20, 0, 1);
    return 3 * Math.pow(t, 1.15);
  }
  if (w >= 75) {
    const t = clamp((w - 75) / 25, 0, 1);
    return 5 * Math.pow(t, 0.65);
  }
  return 0;
};

export const dailyWaterQualityPenalty = (waterValue) => {
  const w = clamp(Number(waterValue) || 0, 0, 100);
  if (w >= 90) {
    const t = (w - 90) / 10; // 90~100
    return 0.08 + (0.17 * Math.pow(t, 1.1)); // 0.08 ~ 0.25 /day
  }
  if (w >= 25) return 0;
  if (w >= 10) {
    const t = (25 - w) / 15; // 25~10
    return 0.2 * Math.pow(t, 1.1);
  }
  const t = (10 - w) / 10; // 10~0
  return 0.2 + (0.3 * Math.pow(t, 1.2)); // max 0.5/day
};

export const fruitSetOverWaterPenalty = () => {
  return 0;
};

export const dailyWeedWeatherBonus = (weatherName) => {
  const w = String(weatherName || '');
  if (w.includes('\uC7A5\uB9C8') || w.includes('\uD3ED\uC6B0') || w.includes('\uAC15\uD55C')) return 0.55;
  if (w.includes('\uBE44') || w.includes('\uC18C\uB098\uAE30') || w.includes('\uB208')) return 0.32;
  if (w.includes('\uAC74\uC870')) return 0.12;
  if (w.includes('\uB9D1\uC74C') || w.includes('\uCCAD\uBA85')) return -0.08;
  return 0;
};
export const dailyWeedNutritionBonus = (nutrition) => {
  const n = clamp(Number(nutrition) || 0, 0, 100);
  if (n >= 80) return 0.35;
  if (n >= 65) return 0.24;
  if (n >= 50) return 0.12;
  if (n >= 40) return 0.04;
  if (n >= 30) return 0;
  if (n >= 20) return 0;
  return -0.18;
};

export const dailyWeedWaterBonus = (water) => {
  const w = clamp(Number(water) || 0, 0, 100);
  if (w >= 80) return 0.45;
  if (w >= 65) return 0.30;
  if (w >= 50) return 0.16;
  if (w >= 40) return 0.06;
  if (w >= 30) return 0;
  if (w >= 15) return -0.10;
  return -0.16;
};

