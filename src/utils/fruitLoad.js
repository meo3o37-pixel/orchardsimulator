import {
  FRUIT_LOAD_MAX,
  FRUIT_LOAD_PROFILE_BY_AGE,
  FRUIT_LOAD_RISE_END_DAY,
  FRUIT_LOAD_RISE_END_MONTH,
  FRUIT_LOAD_RISE_START_DAY,
  FRUIT_LOAD_RISE_START_MONTH,
  POLLINATION_FRUIT_LOAD_BONUS_MAX
} from '../config/simConfig';
import { clamp, toDate } from './common';
import { cropRowsByVarietyAndAge, treeAgeYear } from './cropLots';

export const fruitLoadProfileForAge = (ageYear) => {
  const age = Math.max(1, Math.floor(Number(ageYear) || 1));
  return FRUIT_LOAD_PROFILE_BY_AGE[Math.min(10, age)] || FRUIT_LOAD_PROFILE_BY_AGE[10];
};

export const deterministicUnit01 = (seed) => {
  const x = Math.sin((Number(seed) || 0) * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const seasonalFruitLoadProgress = (day) => {
  const d = toDate(day);
  return seasonalFruitLoadProgressByDate(d);
};

const seasonalFruitLoadProgressByDate = (d) => {
  const y = d.getFullYear();
  const start = new Date(y, FRUIT_LOAD_RISE_START_MONTH - 1, FRUIT_LOAD_RISE_START_DAY);
  const end = new Date(y, FRUIT_LOAD_RISE_END_MONTH - 1, FRUIT_LOAD_RISE_END_DAY);
  if (d < start) return 0;
  if (d >= end) return 1;
  const raw = clamp((d.getTime() - start.getTime()) / (end.getTime() - start.getTime()), 0, 1);
  return 0.5 - (0.5 * Math.cos(Math.PI * raw));
};

const lerp = (value, start, end, from, to) => {
  const safeStart = Number(start) || 0;
  const safeEnd = Number(end) || 0;
  if (safeEnd <= safeStart) return Number(to) || 0;
  const t = clamp(((Number(value) || 0) - safeStart) / (safeEnd - safeStart), 0, 1);
  return (Number(from) || 0) + ((Number(to) || 0) - (Number(from) || 0)) * t;
};

const naturalFruitSetStageMultiplier = (field, ageYear = 1) => {
  const g = clamp(Number(field?.growth) || 0, 0, 100);
  const age = Math.max(1, Math.floor(Number(ageYear) || 1));

  // 1~2년생은 화뢰 형성~만개 구간만 보정한다.
  if (age <= 2) {
    if (g < 8) return 1.0;
    if (g < 16) return 1.2;
    return 1.0;
  }

  // Peak is fixed from flower-bud formation, then reduced during drop periods.
  if (g < 8) return 1.0; // before flower-bud stage
  if (g < 16) return 1.2; // flower-bud formation ~ full bloom
  if (g < 19) return lerp(g, 16, 19, 1.2, 1.15); // petal-fall period: -0.05 (period-based)
  if (g < 46) return lerp(g, 19, 46, 1.15, 1.07); // to end of 1st physiological drop: -0.08
  if (g < 52) return lerp(g, 46, 52, 1.07, 1.02); // 2nd physiological drop: -0.05
  if (g < 62) return lerp(g, 52, 62, 1.02, 1.0); // to physiological drop end: -0.02
  return 1.0;
};

const FLOWER_BUD_START_GROWTH = 8;
const FULL_BLOOM_END_GROWTH = 16;
const hasCarryoverFruitLoadState = (field) => {
  if (!field?.cropId) return false;
  const currentFruitLoad = Math.max(0, Number(field?.fruitLoadPerTree) || 0);
  if (currentFruitLoad > 0.001) return true;
  const reductionMap = field?.fruitLoadReductionByAge;
  if (!reductionMap || typeof reductionMap !== 'object') return false;
  return Object.values(reductionMap).some((value) => Math.max(0, Number(value) || 0) > 0.001);
};

const naturalFruitSetSeasonalProgress = (field, day, ageYear = 1) => {
  const g = clamp(Number(field?.growth) || 0, 0, 100);
  // 자연착과량 상승은 화뢰형성~만개 구간에서만 진행되고,
  // 만개 종료 이후에는 더 이상 상승하지 않는다.
  if (g < FLOWER_BUD_START_GROWTH) return hasCarryoverFruitLoadState(field) ? 1 : 0;
  if (g < FULL_BLOOM_END_GROWTH) {
    return lerp(g, FLOWER_BUD_START_GROWTH, FULL_BLOOM_END_GROWTH, 0, 1);
  }
  return 1;
};

export const unmanagedFruitLoadTargetForAge = (fieldId, year, ageYear) => {
  const profile = fruitLoadProfileForAge(ageYear);
  const [minVal, maxVal] = profile.unmanaged;
  const seed = (Number(fieldId) || 0) * 100000 + (Number(year) || 0) * 97 + Math.max(1, Math.floor(Number(ageYear) || 1)) * 131;
  const r = deterministicUnit01(seed);
  return minVal + ((maxVal - minVal) * r);
};

export const pollinationFruitLoadMultiplier = (field) => {
  const map = field?.pollinationFruitLoadBonusByAge || {};
  const getAgeKey = (ageYear) => `${Math.max(1, Math.floor(Number(ageYear) || 1))}`;
  const pollinationBonusForAge = (ageYear) => {
    const ageKey = getAgeKey(ageYear);
    const common = clamp(Number(map?.all) || 0, 0, POLLINATION_FRUIT_LOAD_BONUS_MAX);
    const ageSpecific = clamp(Number(map?.[ageKey]) || 0, 0, POLLINATION_FRUIT_LOAD_BONUS_MAX);
    const merged = clamp(common + ageSpecific, 0, POLLINATION_FRUIT_LOAD_BONUS_MAX);
    if (merged > 0) return merged;
    return clamp(Number(field?.pollinationFruitLoadBonus) || 0, 0, POLLINATION_FRUIT_LOAD_BONUS_MAX);
  };
  const progress = clamp(Number(field?.taskProgress?.pollination) || 0, 0, 100);
  return (ageYear) => 1 + (0.25 * (progress / 100)) + pollinationBonusForAge(ageYear);
};

const fruitLoadReductionForAge = (field, ageYear) => {
  const map = field?.fruitLoadReductionByAge || {};
  const key = `${Math.max(1, Math.floor(Number(ageYear) || 1))}`;
  const common = Math.max(0, Number(map?.all) || 0);
  const ageSpecific = Math.max(0, Number(map?.[key]) || 0);
  return common + ageSpecific;
};

const winterPruningFruitLoadMultiplierForAge = (field, ageYear, day) => {
  const effectYear = Math.max(0, Math.floor(Number(field?.winterPruningEffectYear) || 0));
  const currentYear = toDate(day).getFullYear();
  if (effectYear <= 0 || effectYear !== currentYear) return 1;
  const map = field?.winterPruningFruitLoadAdjustByAge || {};
  const key = `${Math.max(1, Math.floor(Number(ageYear) || 1))}`;
  const common = Number(map?.all) || 0;
  const ageSpecific = Number(map?.[key]) || 0;
  return clamp(1 + common + ageSpecific, 0.55, 1.45);
};

export const fruitLoadPerTreeForAgeRow = (field, row, day) => {
  const factors = fruitLoadFactorsForAgeRow(field, row, day);
  return factors.final;
};

export const fruitLoadFactorsForAgeRow = (field, row, day) => {
  const ageYear = Math.max(1, Number(row?.ageYear) || treeAgeYear(field, day));
  const year = toDate(day).getFullYear();
  const pollinationMultiplierOfAge = pollinationFruitLoadMultiplier(field);
  const unmanagedTarget = unmanagedFruitLoadTargetForAge(field?.id, year, ageYear);
  const winterPruningMultiplier = winterPruningFruitLoadMultiplierForAge(field, ageYear, day);
  const pollinationMultiplier = pollinationMultiplierOfAge(ageYear);
  const target = unmanagedTarget * winterPruningMultiplier * pollinationMultiplier;
  const stageMultiplier = naturalFruitSetStageMultiplier(field, ageYear);
  const seasonalProgress = naturalFruitSetSeasonalProgress(field, day, ageYear);
  const beforeReduction = target * seasonalProgress * stageMultiplier;
  const reduction = fruitLoadReductionForAge(field, ageYear);
  const final = clamp(beforeReduction - reduction, 0, FRUIT_LOAD_MAX);
  return {
    ageYear,
    unmanagedTarget,
    winterPruningMultiplier,
    pollinationMultiplier,
    target,
    seasonalProgress,
    stageMultiplier,
    beforeReduction,
    reduction,
    final
  };
};

export const fieldFruitLoadPerTreeByRows = (field, day) => {
  if (!field?.cropId || (Number(field?.trees) || 0) <= 0) return 0;
  const rows = cropRowsByVarietyAndAge(field, day);
  if (!rows.length) {
    const ageYear = Math.max(1, treeAgeYear(field, day));
    const target = unmanagedFruitLoadTargetForAge(field?.id, toDate(day).getFullYear(), ageYear);
    return clamp(
      target * naturalFruitSetSeasonalProgress(field, day, ageYear) * naturalFruitSetStageMultiplier(field, ageYear),
      0,
      FRUIT_LOAD_MAX
    );
  }
  const weighted = rows.reduce((acc, row) => {
    const alive = Math.max(0, Number(row?.aliveTrees) || 0);
    if (alive <= 0) return acc;
    const perTree = fruitLoadPerTreeForAgeRow(field, row, day);
    return { sum: acc.sum + (perTree * alive), trees: acc.trees + alive };
  }, { sum: 0, trees: 0 });
  if (weighted.trees <= 0) return 0;
  return clamp(weighted.sum / weighted.trees, 0, FRUIT_LOAD_MAX);
};
