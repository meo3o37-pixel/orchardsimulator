export const SLOPE_LABOR_MULTIPLIER_BY_DEGREE = Object.freeze({
  0: 1.00,
  1: 1.01,
  2: 1.02,
  3: 1.03,
  4: 1.05,
  5: 1.07,
  6: 1.09,
  7: 1.11,
  8: 1.14,
  9: 1.17,
  10: 1.20,
  11: 1.24,
  12: 1.28,
  13: 1.32,
  14: 1.37,
  15: 1.42
});

export const SLOPE_LABOR_MULTIPLIER_TABLE = Object.freeze([
  ...Object.entries(SLOPE_LABOR_MULTIPLIER_BY_DEGREE).map(([deg, multiplier]) => {
    const degree = Math.max(0, Math.floor(Number(deg) || 0));
    return {
      min: degree,
      max: degree,
      multiplier: Number(multiplier) || 1,
      label: `${degree}도`
    };
  }),
  {
    min: 16,
    max: 90,
    multiplier: Number(SLOPE_LABOR_MULTIPLIER_BY_DEGREE[15]) || 1,
    label: '16도 이상'
  }
]);

export const slopeJudgeLabelByDeg = (slopeDeg = 0) => {
  const slope = Math.max(0, Number(slopeDeg) || 0);
  if (slope <= 2) return '매우 평탄함';
  if (slope <= 4) return '평탄함';
  if (slope <= 6) return '완만함';
  if (slope <= 8) return '약간 가파름';
  if (slope <= 10) return '가파름';
  if (slope <= 12) return '꽤 가파름';
  if (slope <= 15) return '급경사';
  return '매우 급경사';
};

export const LAND_GROUPS = [
  { key: 'small', label: '소형', minPy: 100, maxPy: 1000, count: 180 },
  { key: 'medium', label: '중형', minPy: 1000, maxPy: 3000, count: 105 },
  { key: 'large', label: '대형', minPy: 3000, maxPy: 5000, count: 57 },
  { key: 'xlarge', label: '초대형', minPy: 5000, maxPy: 15000, count: 30 }
];

export const LAND_REGION = {
  eupMyeon: [
    '진보면',
    '파천면',
    '현동면',
    '안덕면',
    '부남면',
    '주왕산면',
    '청송읍',
    '현서면',
    '영덕읍',
    '지품면',
    '달산면',
    '강구면',
    '병곡면',
    '축산면',
    '남정면',
    '의성읍',
    '단촌면',
    '봉양면',
    '옥산면',
    '춘산면'
  ],
  ri: [
    '각산리',
    '송전리',
    '구산리',
    '신기리',
    '거대리',
    '대율리',
    '중기리',
    '다정리',
    '기곡리',
    '오목리',
    '송강리',
    '금곡리',
    '상평리',
    '하평리',
    '본촌리',
    '장전리',
    '신촌리',
    '용전리',
    '월전리',
    '덕천리',
    '사촌리',
    '상리',
    '하리',
    '수락리',
    '오산리',
    '노루실리',
    '감곡리',
    '청운리',
    '명당리',
    '백자리',
    '안심리',
    '호명리',
    '매곡리',
    '도평리',
    '화전리',
    '율현리'
  ]
};

function seededRand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const slopeBandOf = (slopeDeg = 0) => {
  const slope = Math.max(0, Number(slopeDeg) || 0);
  return SLOPE_LABOR_MULTIPLIER_TABLE.find((band) => slope >= band.min && slope <= band.max)
    || SLOPE_LABOR_MULTIPLIER_TABLE[SLOPE_LABOR_MULTIPLIER_TABLE.length - 1];
};

const pickSlopeDeg = (seed) => {
  const roll = seededRand(seed + 133);
  if (roll < 0.52) return Math.floor(0 + seededRand(seed + 134) * 5);
  if (roll < 0.88) return Math.floor(5 + seededRand(seed + 135) * 3);
  if (roll < 0.96) return Math.floor(8 + seededRand(seed + 136) * 3);
  if (roll < 0.995) return Math.floor(11 + seededRand(seed + 137) * 4);
  return Math.floor(15 + seededRand(seed + 138) * 4);
};

const slopePriceMultiplierOf = (slopeDeg = 0) => {
  const slope = Math.max(0, Number(slopeDeg) || 0);
  if (slope <= 4) return 1.03;
  if (slope <= 7) return 1.0;
  if (slope <= 10) return 0.94;
  if (slope <= 14) return 0.87;
  return 0.76;
};

const groundwaterDepthFactorOf = (slopeDeg = 0) => {
  const slope = Math.max(0, Number(slopeDeg) || 0);
  if (slope <= 4) return 1.1;
  if (slope <= 7) return 1.0;
  if (slope <= 10) return 0.92;
  if (slope <= 14) return 0.84;
  return 0.72;
};

const clampPriceMultiplier = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  if (n < 0.65) return 0.65;
  if (n > 1.15) return 1.15;
  return n;
};

export const slopeLaborMultiplierByDeg = (slopeDeg = 0) => slopeBandOf(slopeDeg).multiplier;
export const slopeBandLabelByDeg = (slopeDeg = 0) => slopeJudgeLabelByDeg(slopeDeg);

export function createLandPool({
  landGroups = LAND_GROUPS,
  region = LAND_REGION
} = {}) {
  const pool = [];
  let id = 0;
  const pushGeneratedLand = ({ group, groupIndex, itemIndex, seed, encounter = false }) => {
    const py = Math.floor(group.minPy + seededRand(seed) * (group.maxPy - group.minPy + 1));
    const regionOffset = encounter ? 7 : 0;
    const eup = region.eupMyeon[(itemIndex + groupIndex * 2 + regionOffset) % region.eupMyeon.length];
    const ri = region.ri[(itemIndex * 3 + groupIndex + regionOffset) % region.ri.length];
    const mainNo = 10 + ((itemIndex * (encounter ? 53 : 37) + groupIndex * 11 + (encounter ? 211 : 0)) % 490);
    const subNo = 1 + ((itemIndex * (encounter ? 29 : 19) + groupIndex * 7 + (encounter ? 13 : 0)) % 38);
    const slopeDeg = pickSlopeDeg(seed);
    const slopePriceMultiplier = slopePriceMultiplierOf(slopeDeg);
    const slopeGroundwaterFactor = groundwaterDepthFactorOf(slopeDeg);
    const unitPriceBase = 100000 + Math.floor(seededRand(seed + 77) * 50001);

    const slopeGroundwaterBonusRatio = (slopeGroundwaterFactor - 0.72) / (1.1 - 0.72);
    const groundwaterBaseRaw = 1000 + (seededRand(seed + 171) * 2000);
    const groundwaterDepthAdjusted = groundwaterBaseRaw * (0.86 + (slopeGroundwaterBonusRatio * 0.28));
    const groundwaterTonsBase = Math.max(1000, Math.min(3000, Math.round(groundwaterDepthAdjusted)));
    const groundwaterDailyRechargeLiters = Math.max(
      90,
      Math.round(
        groundwaterTonsBase
        * (0.35 + seededRand(seed + 173) * 0.42)
      )
    );
    const groundwaterPriceBonus = clampPriceMultiplier(0.96 + Math.min(0.09, groundwaterTonsBase / 24000));
    const unitPrice = Math.round(unitPriceBase * slopePriceMultiplier * groundwaterPriceBonus);

    pool.push({
      id,
      group: group.key,
      name: `청송군 ${eup} ${ri} ${mainNo}-${subNo}`,
      py,
      slopeDeg,
      slopeLaborMultiplier: slopeLaborMultiplierByDeg(slopeDeg),
      groundwaterTonsBase,
      groundwaterDailyRechargeLiters,
      price: py * unitPrice
    });
    id += 1;
  };

  landGroups.forEach((group, groupIndex) => {
    for (let i = 0; i < group.count; i += 1) {
      const seed = (groupIndex + 1) * 1000 + i * 17;
      pushGeneratedLand({ group, groupIndex, itemIndex: i, seed });
    }
  });

  landGroups.forEach((group, groupIndex) => {
    for (let i = 0; i < group.count; i += 1) {
      const seed = (groupIndex + 5) * 10000 + i * 31;
      pushGeneratedLand({ group, groupIndex, itemIndex: i, seed, encounter: true });
    }
  });

  return pool;
}
