import { clamp } from './common.js';
import { PROCESSING_GRADE_LABEL } from './harvestGrade.js';

export const APPLE_SORTING_DIE_SPECS = Object.freeze([
  { die: 1, key: 'die1', label: '1다이', name: '초특대과', countText: '8~10과', unitWeightG: 560 },
  { die: 2, key: 'die2', label: '2다이', name: '특특대과', countText: '10~12과', unitWeightG: 460 },
  { die: 3, key: 'die3', label: '3다이', name: '특대과', countText: '12~14과', unitWeightG: 390 },
  { die: 4, key: 'die4', label: '4다이', name: '대과', countText: '14~16과', unitWeightG: 335 },
  { die: 5, key: 'die5', label: '5다이', name: '중과', countText: '16~18과', unitWeightG: 295 },
  { die: 6, key: 'die6', label: '6다이', name: '중소과', countText: '18~20과', unitWeightG: 265 },
  { die: 7, key: 'die7', label: '7다이', name: '소과', countText: '20~23과', unitWeightG: 235 },
  { die: 8, key: 'die8', label: '8다이', name: '소소과', countText: '23~26과', unitWeightG: 205 },
  { die: 9, key: 'die9', label: '9다이', name: '극소과', countText: '26~30과', unitWeightG: 180 },
  { die: 10, key: 'die10', label: '10다이', name: '가공과', countText: '30과 이상', unitWeightG: 160 }
]);

const QUALITY_CLASS_RATIO_ANCHORS = Object.freeze([
  { quality: 0, a: 1, b: 3, processing: 96 },
  { quality: 10, a: 1.5, b: 4.5, processing: 94 },
  { quality: 20, a: 3, b: 8, processing: 89 },
  { quality: 30, a: 6, b: 14, processing: 80 },
  { quality: 40, a: 12, b: 20, processing: 68 },
  { quality: 50, a: 20, b: 26, processing: 54 },
  { quality: 60, a: 32, b: 28, processing: 40 },
  { quality: 70, a: 46, b: 27, processing: 27 },
  { quality: 80, a: 60, b: 23, processing: 17 },
  { quality: 90, a: 73, b: 18, processing: 9 },
  { quality: 100, a: 84, b: 13, processing: 3 }
]);

const A_SIZE_RATIO_ANCHORS = Object.freeze([
  {
    quality: 0,
    weights: { die3: 1, die4: 3, die5: 6, die6: 12, die7: 28, die8: 30, die9: 20 }
  },
  {
    quality: 50,
    weights: { die2: 2, die3: 8, die4: 18, die5: 24, die6: 24, die7: 15, die8: 7, die9: 2 }
  },
  {
    quality: 100,
    weights: { die1: 4, die2: 11, die3: 21, die4: 24, die5: 20, die6: 12, die7: 6, die8: 1.5, die9: 0.5 }
  }
]);

const B_SIZE_RATIO_ANCHORS = Object.freeze([
  {
    quality: 0,
    weights: { die3: 0.5, die4: 1.5, die5: 4, die6: 9, die7: 20, die8: 25, die9: 25, die10: 15 }
  },
  {
    quality: 50,
    weights: { die2: 1, die3: 4, die4: 10, die5: 18, die6: 22, die7: 20, die8: 13, die9: 8, die10: 4 }
  },
  {
    quality: 100,
    weights: { die1: 2, die2: 7, die3: 15, die4: 22, die5: 22, die6: 17, die7: 9, die8: 4, die9: 1.5, die10: 0.5 }
  }
]);

const PROCESSING_SIZE_RATIO_ANCHORS = Object.freeze([
  {
    quality: 0,
    weights: { die1: 1, die2: 2, die3: 4, die4: 7, die5: 10, die6: 14, die7: 18, die8: 20, die9: 16, die10: 8 }
  },
  {
    quality: 50,
    weights: { die1: 2, die2: 4, die3: 7, die4: 10, die5: 13, die6: 16, die7: 17, die8: 15, die9: 10, die10: 6 }
  },
  {
    quality: 100,
    weights: { die1: 3, die2: 6, die3: 10, die4: 13, die5: 16, die6: 17, die7: 15, die8: 10, die9: 6, die10: 4 }
  }
]);

const DIE_KEYS = APPLE_SORTING_DIE_SPECS.map((item) => item.key);

const interpolateScalarAnchors = (anchors, quality, key) => {
  const q = clamp(Number(quality) || 0, 0, 100);
  if (!anchors.length) return 0;
  if (q <= anchors[0].quality) return Number(anchors[0][key]) || 0;
  for (let i = 1; i < anchors.length; i += 1) {
    const left = anchors[i - 1];
    const right = anchors[i];
    if (q > right.quality) continue;
    const span = Math.max(0.0001, Number(right.quality) - Number(left.quality));
    const t = clamp((q - Number(left.quality)) / span, 0, 1);
    const leftValue = Number(left[key]) || 0;
    const rightValue = Number(right[key]) || 0;
    return leftValue + ((rightValue - leftValue) * t);
  }
  return Number(anchors[anchors.length - 1][key]) || 0;
};

const normalizeRatioMap = (ratioMap = {}) => {
  const safeEntries = Object.entries(ratioMap)
    .map(([key, value]) => [String(key || ''), Math.max(0, Number(value) || 0)])
    .filter(([key, value]) => key && value > 0);
  const total = safeEntries.reduce((sum, [, value]) => sum + value, 0);
  if (total <= 0) return {};
  return safeEntries.reduce((acc, [key, value]) => {
    acc[key] = value / total;
    return acc;
  }, {});
};

const interpolateSizeRatioAnchors = (anchors, quality) => {
  const q = clamp(Number(quality) || 0, 0, 100);
  if (!anchors.length) return {};
  let left = anchors[0];
  let right = anchors[anchors.length - 1];
  for (let i = 1; i < anchors.length; i += 1) {
    if (q <= anchors[i].quality) {
      left = anchors[i - 1];
      right = anchors[i];
      break;
    }
  }
  const span = Math.max(0.0001, Number(right.quality) - Number(left.quality));
  const t = left === right ? 0 : clamp((q - Number(left.quality)) / span, 0, 1);
  const weights = DIE_KEYS.reduce((acc, key) => {
    const leftValue = Number(left?.weights?.[key]) || 0;
    const rightValue = Number(right?.weights?.[key]) || 0;
    acc[key] = leftValue + ((rightValue - leftValue) * t);
    return acc;
  }, {});
  return normalizeRatioMap(weights);
};

export const appleSortingClassRatioOfQuality = (quality) => {
  const a = interpolateScalarAnchors(QUALITY_CLASS_RATIO_ANCHORS, quality, 'a');
  const b = interpolateScalarAnchors(QUALITY_CLASS_RATIO_ANCHORS, quality, 'b');
  const processing = interpolateScalarAnchors(QUALITY_CLASS_RATIO_ANCHORS, quality, 'processing');
  const normalized = normalizeRatioMap({ a, b, processing });
  return {
    a: normalized.a || 0,
    b: normalized.b || 0,
    processing: normalized.processing || 0
  };
};

export const appleSortingSizeRatioByClassOfQuality = (quality) => ({
  a: interpolateSizeRatioAnchors(A_SIZE_RATIO_ANCHORS, quality),
  b: interpolateSizeRatioAnchors(B_SIZE_RATIO_ANCHORS, quality),
  processing: interpolateSizeRatioAnchors(PROCESSING_SIZE_RATIO_ANCHORS, quality)
});

const splitKgByRatio = (totalKg, ratioMap = {}) => {
  const safeKg = Math.max(0, Number(totalKg) || 0);
  return Object.entries(normalizeRatioMap(ratioMap)).reduce((acc, [key, ratio]) => {
    acc[key] = safeKg * ratio;
    return acc;
  }, {});
};

const buildDieRowsFromKgMap = (kgMap = {}, gradeLabel = '') => (
  APPLE_SORTING_DIE_SPECS
    .map((spec) => {
      const kg = Math.max(0, Number(kgMap?.[spec.key]) || 0);
      if (kg <= 0) return null;
      return {
        grade: gradeLabel,
        die: spec.die,
        dieKey: spec.key,
        dieLabel: spec.label,
        name: spec.name,
        countText: spec.countText,
        unitWeightG: spec.unitWeightG,
        kg
      };
    })
    .filter(Boolean)
);

export const buildAppleSortingPlan = ({ totalKg = 0, quality = 0 } = {}) => {
  const safeTotalKg = Math.max(0, Number(totalKg) || 0);
  const safeQuality = clamp(Number(quality) || 0, 0, 100);
  const classRatio = appleSortingClassRatioOfQuality(safeQuality);
  const classKg = {
    a: safeTotalKg * classRatio.a,
    b: safeTotalKg * classRatio.b,
    processing: safeTotalKg * classRatio.processing
  };
  const sizeRatioByClass = appleSortingSizeRatioByClassOfQuality(safeQuality);
  const aDieKg = splitKgByRatio(classKg.a, sizeRatioByClass.a);
  const bDieKg = splitKgByRatio(classKg.b, sizeRatioByClass.b);
  const processingDieKg = splitKgByRatio(classKg.processing, sizeRatioByClass.processing);
  return {
    quality: safeQuality,
    totalKg: safeTotalKg,
    classRatio,
    classKg,
    sizeRatioByClass,
    aDieKg,
    bDieKg,
    processingDieKg,
    rows: {
      a: buildDieRowsFromKgMap(aDieKg, 'A급'),
      b: buildDieRowsFromKgMap(bDieKg, 'B급'),
      processing: buildDieRowsFromKgMap(processingDieKg, PROCESSING_GRADE_LABEL)
    }
  };
};
