import { clamp, toDate } from '../utils/common';

const WEATHER_POOLS = {
  spring: [
    { name: '맑음', desc: '햇살 좋음' },
    { name: '구름많음', desc: '온화한 날씨' },
    { name: '흐림', desc: '큰 변화 없는 평온한 하늘' },
    { name: '산들바람', desc: '작업하기 좋은 바람' },
    { name: '포근함', desc: '생육에 무난한 기온' },
    { name: '이슬비', desc: '약한 비, 토양 수분 보강' },
    { name: '봄비', desc: '안정적인 강수' },
    { name: '강한봄비', desc: '강한 봄비, 배수 점검 필요' },
    { name: '황사', desc: '실외 작업 주의' }
  ],
  summer: [
    { name: '맑음', desc: '강한 일사' },
    { name: '구름많음', desc: '한낮 일사 완화' },
    { name: '바람많음', desc: '통풍 양호, 체감 온도 하락' },
    { name: '박무', desc: '옅은 안개, 시야 약간 저하' },
    { name: '후텁지근', desc: '습도 높지만 강수 없음' },
    { name: '열대야', desc: '야간 고온 지속' },
    { name: '약한소나기', desc: '짧은 약한 소나기' },
    { name: '소나기', desc: '국지성 강수' },
    { name: '강한소나기', desc: '짧고 강한 강수' },
    { name: '장맛비', desc: '지속 강수, 배수 관리 필요' },
    { name: '폭우', desc: '토양 과습 주의' },
    { name: '무더위', desc: '고온 주의' }
  ],
  fall: [
    { name: '맑음', desc: '수확 적기' },
    { name: '구름많음', desc: '일사 완만, 작업 안정' },
    { name: '청명', desc: '가시거리 좋고 쾌청함' },
    { name: '선선함', desc: '수확·운반 작업 적합' },
    { name: '가을이슬비', desc: '약한 비' },
    { name: '가을비', desc: '작업 속도 저하' },
    { name: '강한가을비', desc: '강한 가을비' },
    { name: '건조', desc: '관수 보강 필요' },
    { name: '안개', desc: '아침 시야 저하' }
  ],
  winter: [
    { name: '맑음', desc: '서늘 건조' },
    { name: '구름많음', desc: '기온 낮고 일사 약함' },
    { name: '흐림', desc: '강수 없는 동절기 흐림' },
    { name: '건조한한겨울', desc: '차고 건조한 공기' },
    { name: '북서풍', desc: '체감온도 하락, 강수 없음' },
    { name: '진눈깨비', desc: '약한 강수' },
    { name: '눈', desc: '적설 주의' },
    { name: '대설', desc: '시설물 점검 필요' },
    { name: '한파', desc: '냉해 방지 작업' }
  ]
};

export const RAIN_WEATHERS = [
  '이슬비',
  '봄비',
  '강한봄비',
  '약한소나기',
  '소나기',
  '강한소나기',
  '장맛비',
  '폭우',
  '가을이슬비',
  '가을비',
  '강한가을비',
  '진눈깨비',
  '눈',
  '대설',
  '장마'
];

export const seasonKey = (month) =>
  ([3, 4, 5].includes(month) ? 'spring' : [6, 7, 8].includes(month) ? 'summer' : [9, 10, 11].includes(month) ? 'fall' : 'winter');

export const pickWeather = (month) => {
  const pool = WEATHER_POOLS[seasonKey(month)] || WEATHER_POOLS.spring;
  return pool[Math.floor(Math.random() * pool.length)];
};

export const rainfallWaterGain = (weatherName) => {
  if (weatherName === '이슬비' || weatherName === '가을이슬비' || weatherName === '진눈깨비') return 0.35;
  if (weatherName === '약한소나기' || weatherName === '봄비' || weatherName === '가을비' || weatherName === '눈') return 0.75;
  if (weatherName === '소나기' || weatherName === '강한봄비' || weatherName === '강한가을비') return 1.15;
  if (weatherName === '강한소나기' || weatherName === '장맛비' || weatherName === '대설' || weatherName === '장마') return 1.6;
  if (weatherName === '폭우') return 2.1;
  return 0;
};

export const dailyFruitGrowth = (day, weatherName) => {
  const d = toDate(day);
  const month = d.getMonth() + 1;
  const date = d.getDate();
  let base = 0;

  if (month <= 2) base = 0;
  else if (month === 3) base = 0.12;
  else if (month === 4) base = 0.18;
  else if (month === 5) base = 0.28;
  else if (month === 6) base = 0.38;
  else if (month === 7) base = 0.46;
  else if (month === 8) base = 0.52;
  else if (month === 9) base = 0.62;
  else if (month === 10 && date < 25) base = 0.78;
  else if ((month === 10 && date >= 25) || (month === 11 && date <= 15)) base = 0.20;
  else if (month === 11) base = 0.06;
  else base = 0;

  const isRain = RAIN_WEATHERS.includes(weatherName);
  const isHeavyRain = ['강한소나기', '장맛비', '폭우', '대설', '장마'].includes(weatherName);
  let weatherAdj = 0;
  if (weatherName === '맑음') weatherAdj = 0.03;
  else if (weatherName === '구름많음' || weatherName === '안개') weatherAdj = -0.01;
  else if (isRain) weatherAdj = isHeavyRain ? -0.03 : -0.02;
  else if (weatherName === '무더위') weatherAdj = -0.03;
  else if (weatherName === '황사' || weatherName === '한파') weatherAdj = -0.04;

  return Math.max(0, base + weatherAdj);
};

export const weatherWaterBonus = (weatherName) => {
  if (RAIN_WEATHERS.includes(weatherName)) return -0.24;
  if (weatherName === '건조' || weatherName === '무더위' || weatherName === '한파') return 0.16;
  return 0;
};

export const dailyNutritionDrain = (month) => {
  if ([6, 7, 8].includes(month)) return 0.14;
  if ([12, 1, 2].includes(month)) return 0.08;
  return 0.11;
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
  if (weatherName === '장맛비' || weatherName === '폭우' || weatherName === '장마') weatherAdj = 0.4;
  else if (isRain) weatherAdj = 0.2;
  else if (weatherName === '무더위') weatherAdj = 0.15;
  else if (weatherName === '대설' || weatherName === '한파') weatherAdj = -0.12;

  return Math.max(0, base + weatherAdj);
};

export const dailyVigorIncrease = (month, weatherName, nutrition) => {
  let base = [3, 4, 5, 6, 7, 8, 9].includes(month) ? 0.2 : 0.14;
  if (weatherName === '맑음') base += 0.01;
  if (weatherName === '한파' || weatherName === '대설') base -= 0.02;
  const n = clamp(Number(nutrition) || 0, 0, 100);
  let nutritionAdj = 0;
  if (n >= 80) nutritionAdj = 0.07;
  else if (n >= 65) nutritionAdj = 0.04;
  else if (n >= 50) nutritionAdj = 0.015;
  else if (n >= 40) nutritionAdj = 0;
  else if (n >= 30) nutritionAdj = -0.03;
  else nutritionAdj = -0.06;
  return Math.max(0.03, base + nutritionAdj);
};
