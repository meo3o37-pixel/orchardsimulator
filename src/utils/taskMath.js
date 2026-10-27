import { trellisTrainingMultiplier } from '../features/cadastre/trellisInvestment.js';
import { FRUIT_LOAD_MAX, SPRAY_TASK_KEYS } from '../config/simConfig';
import { clamp } from './common';
import { cropRowsByVarietyAndAge, treeAgeYear } from './cropLots';
import { fruitLoadPerTreeForAgeRow } from './fruitLoad';
const BRICK_COLLECTION_LABOR_PER_TREE = 0.02;
const APPLE_CONTAINER_BOX_CAPACITY_KG = 20;
const APPLE_CONTAINER_COATING_LABOR_PER_BOX = 0.12;
const APPLE_CONTAINER_COLLECTION_LABOR_PER_BOX = 0.1;

const BASE_FERTILIZATION_PROGRESS_STEP = 5;
const SPRAY_LABOR_PER_TREE = 0.02;
const POLLINATION_LABOR_PER_TREE = 0.5; // 1 ?筌뤾퍓吏??/ 2??
const REFLECTIVE_FILM_LABOR_PER_TREE = 0.03;
const REFLECTIVE_FILM_COLLECTION_LABOR_PER_TREE = 0.02; // 10 노동력당 약 1000m(2m/주 기준)
const LEAF_PLUCKING_LABOR_MIN = 0.01;
const LEAF_PLUCKING_LABOR_MAX = 2;
const DEFAULT_TASK_LABOR_PER_TREE_BY_KEY = {
  leafPlucking: 0.5,
  trellisInstall: 0.5,
  irrigationPipeInstall: 0.1,
  dripNozzleInstall: 0.1,
  sprinklerNozzleInstall: 0.1,
  microSprinklerNozzleInstall: 0.1,
  pruningBranchDisposal: 0.3,
  leafWasteDisposal: 0.28,
  droppedFruitWasteDisposal: 0.32,
  pruningSealant: 0.18,
  reflectiveFilm: REFLECTIVE_FILM_LABOR_PER_TREE,
  reflectiveFilmCollection: REFLECTIVE_FILM_COLLECTION_LABOR_PER_TREE,
  brickCollection: BRICK_COLLECTION_LABOR_PER_TREE,
  appleContainerCoating: APPLE_CONTAINER_COATING_LABOR_PER_BOX,
  appleContainerCollection: APPLE_CONTAINER_COLLECTION_LABOR_PER_BOX
};
export const PEST_EARLY_MAX_REDUCTION = 15;
export const THINNING_TASK_KEYS = new Set(['flowerThinning', 'thinning1', 'thinning2', 'thinning3']);
export const TASK_LABOR_PER_TREE = {
  flowerThinning: 0.45,
  thinning1: 2.0,
  thinning2: 1.7,
  thinning3: 1.5
};

const flowerThinningLaborPerTreeByAge = (ageYear) => {
  const age = Math.max(1, Math.floor(Number(ageYear) || 1));
  if (age <= 1) return 0.1;
  if (age === 2) return 0.2;
  if (age === 3) return 0.4;
  return 0.45;
};

const thinningLaborPerTreeByAge = {
  thinning1: { 1: 0.1, 2: 0.4, 3: 0.8, 4: 1.4, 5: 1.6, 6: 1.8 },
  thinning2: { 1: 0.1, 2: 0.3, 3: 0.7, 4: 1.2, 5: 1.4, 6: 1.6 },
  thinning3: { 1: 0.1, 2: 0.3, 3: 0.6, 4: 1.0, 5: 1.2, 6: 1.4 }
};

export const watersproutPruningLaborPerTree = (ageYear = 1) => {
  const age = Math.max(1, Math.floor(Number(ageYear) || 1));
  // 하계전정(도장지 전정) 연령별 주당 노동력
  // 1년생: 0.05 (10 노동력당 약 200주), 2년생: 0.10, 3년생: 0.20, 4년생: 0.50
  if (age <= 1) return 0.05;
  if (age === 2) return 0.1;
  if (age === 3) return 0.2;
  if (age === 4) return 0.5;
  // 5~9년생 이후는 가지량 증가를 반영해 점진 증가
  if (age === 5) return 0.62;
  if (age === 6) return 0.75;
  if (age === 7) return 0.9;
  if (age === 8) return 1.05;
  if (age === 9) return 1.2;
  return 1.25;
};
const WINTER_PRUNING_HEAVY_TASK_KEY = 'winterPruningHeavy';
const WINTER_PRUNING_TASK_KEYS = new Set(['winterPruning', WINTER_PRUNING_HEAVY_TASK_KEY]);

export const winterPruningLaborPerTree = (ageYear = 1, taskKey = 'winterPruning') => {
  const age = Math.max(1, Math.floor(Number(ageYear) || 1));
  const base = (() => {
    if (age <= 1) return 0.12;
    if (age === 2) return 0.28;
    if (age === 3) return 0.6;
    if (age === 4) return 1.2;
    if (age === 5) return 1.45;
    if (age === 6) return 1.7;
    if (age === 7) return 1.95;
    if (age === 8) return 2.15;
    if (age === 9) return 2.35;
    return 2.5;
  })();
  return taskKey === WINTER_PRUNING_HEAVY_TASK_KEY ? (base * 1.28) : base;
};
const WATERSPROUT_PRUNING_TASK_KEYS = new Set(['watersproutPruning', 'watersproutPruning2']);

const weightedWinterPruningLaborPerTree = (field, day, taskKey = 'winterPruning') => {
  const d = Math.max(1, Math.floor(Number(day) || 1));
  const rows = cropRowsByVarietyAndAge(field, d);
  if (rows.length) {
    const weighted = rows.reduce((acc, row) => {
      const alive = Math.max(0, Number(row?.aliveTrees) || 0);
      if (alive <= 0) return acc;
      return {
        trees: acc.trees + alive,
        sum: acc.sum + (alive * winterPruningLaborPerTree(row?.ageYear, taskKey))
      };
    }, { trees: 0, sum: 0 });
    if (weighted.trees > 0) return weighted.sum / weighted.trees;
  }
  return winterPruningLaborPerTree(treeAgeYear(field, d), taskKey);
};

const weightedFlowerThinningLaborPerTree = (field, day) => {
  const d = Math.max(1, Math.floor(Number(day) || 1));
  const rows = cropRowsByVarietyAndAge(field, d);
  if (rows.length) {
    const weighted = rows.reduce((acc, row) => {
      const alive = Math.max(0, Number(row?.aliveTrees) || 0);
      if (alive <= 0) return acc;
      return {
        trees: acc.trees + alive,
        sum: acc.sum + (alive * flowerThinningLaborPerTreeByAge(row?.ageYear))
      };
    }, { trees: 0, sum: 0 });
    if (weighted.trees > 0) return weighted.sum / weighted.trees;
  }
  return flowerThinningLaborPerTreeByAge(treeAgeYear(field, d));
};

export const thinningLaborPerTree = (taskKey, ageYear = 1) => {
  if (!THINNING_TASK_KEYS.has(taskKey)) return 0;
  if (taskKey === 'flowerThinning') return flowerThinningLaborPerTreeByAge(ageYear);
  const age = Math.max(1, Math.floor(Number(ageYear) || 1));
  const ageKey = age >= 6 ? 6 : age;
  const mapped = thinningLaborPerTreeByAge[taskKey]?.[ageKey];
  if (typeof mapped === 'number') return Math.max(0.1, mapped);
  return Math.max(0.1, Number(TASK_LABOR_PER_TREE[taskKey]) || 1);
};

const weightedThinningLaborPerTree = (taskKey, field, day) => {
  const d = Math.max(1, Math.floor(Number(day) || 1));
  const rows = cropRowsByVarietyAndAge(field, d);
  if (rows.length) {
    const weighted = rows.reduce((acc, row) => {
      const alive = Math.max(0, Number(row?.aliveTrees) || 0);
      if (alive <= 0) return acc;
      return {
        trees: acc.trees + alive,
        sum: acc.sum + (alive * thinningLaborPerTree(taskKey, row?.ageYear))
      };
    }, { trees: 0, sum: 0 });
    if (weighted.trees > 0) return weighted.sum / weighted.trees;
  }
  return thinningLaborPerTree(taskKey, treeAgeYear(field, d));
};

const weightedWatersproutPruningLaborPerTree = (field, day) => {
  const d = Math.max(1, Math.floor(Number(day) || 1));
  const rows = cropRowsByVarietyAndAge(field, d);
  if (rows.length) {
    const weighted = rows.reduce((acc, row) => {
      const alive = Math.max(0, Number(row?.aliveTrees) || 0);
      if (alive <= 0) return acc;
      return {
        trees: acc.trees + alive,
        sum: acc.sum + (alive * watersproutPruningLaborPerTree(row?.ageYear))
      };
    }, { trees: 0, sum: 0 });
    if (weighted.trees > 0) return weighted.sum / weighted.trees;
  }
  return watersproutPruningLaborPerTree(treeAgeYear(field, d));
};

const leafPluckingLaborPerTreeByFruitLoad = (field, day) => {
  const d = Math.max(1, Math.floor(Number(day) || 1));
  const rows = cropRowsByVarietyAndAge(field, d);
  if (rows.length) {
    const weighted = rows.reduce((acc, row) => {
      const alive = Math.max(0, Number(row?.aliveTrees) || 0);
      if (alive <= 0) return acc;
      const load = Math.max(0, Number(fruitLoadPerTreeForAgeRow(field, row, d)) || 0);
      return {
        trees: acc.trees + alive,
        sum: acc.sum + (alive * load)
      };
    }, { trees: 0, sum: 0 });
    if (weighted.trees > 0) {
      return clamp(weighted.sum / weighted.trees / 500, LEAF_PLUCKING_LABOR_MIN, LEAF_PLUCKING_LABOR_MAX);
    }
  }
  const fallbackLoad = clamp(Number(field?.fruitLoadPerTree) || 0, 0, FRUIT_LOAD_MAX);
  return clamp(fallbackLoad / 500, LEAF_PLUCKING_LABOR_MIN, LEAF_PLUCKING_LABOR_MAX);
};

export const THINNING_FRUIT_LOAD_REDUCTION_MAX = {
  flowerThinning: 0.3,
  thinning1: 0.53,
  thinning2: 0.25,
  thinning3: 0.13
};

export const thinningFruitLoadReductionByProgress = (taskKey, progressDelta) => {
  if (!THINNING_TASK_KEYS.has(taskKey)) return 0;
  const cap = THINNING_FRUIT_LOAD_REDUCTION_MAX[taskKey] || 0;
  return (cap * Math.max(0, Number(progressDelta) || 0)) / 100;
};

export const vigorLaborMultiplier = (vigor) => {
  return 1;
};

export const taskProgressStep = (task) => {
  if (!task) return 0;
  if (task.key === 'baseFertilization') return BASE_FERTILIZATION_PROGRESS_STEP;
  return task.speed;
};

export const taskLaborNeed = (task, field, day = 1) => {
  if (!task) return 0;
  if (task.key === 'appleContainerCoating') {
    const pendingKg = (field?.pendingLoads || []).reduce((sum, load) => sum + Math.max(0, Number(load?.qty) || 0), 0);
    const requiredUnits = Math.max(0, Math.ceil(pendingKg / APPLE_CONTAINER_BOX_CAPACITY_KG));
    const appliedMap = field?.appleContainerAppliedUnitsByItemKey || {};
    const appliedUnits = Object.values(appliedMap).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
    const remainUnits = Math.max(0, requiredUnits - appliedUnits);
    return Math.max(1, remainUnits * APPLE_CONTAINER_COATING_LABOR_PER_BOX);
  }
  if (task.key === 'appleContainerCollection') {
    const appliedMap = field?.appleContainerAppliedUnitsByItemKey || {};
    const appliedUnits = Object.values(appliedMap).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
    return Math.max(1, appliedUnits * APPLE_CONTAINER_COLLECTION_LABOR_PER_BOX);
  }
  const totalTrees = Math.max(1, Math.ceil(Number(field?.trees) || 0));
  const currentProgress = clamp(Number(field?.taskProgress?.[task.key]) || 0, 0, 100);
  const step = taskProgressStep(task);
  const nextProgress = clamp(currentProgress + step, 0, 100);
  const progressDelta = Math.max(0, nextProgress - currentProgress);
  const processedTrees = Math.max(1, Math.ceil((totalTrees * progressDelta) / 100));
  if (THINNING_TASK_KEYS.has(task.key)) {
    const perTreeLabor = task.key === 'flowerThinning'
      ? weightedFlowerThinningLaborPerTree(field, day)
      : weightedThinningLaborPerTree(task.key, field, day);
    return Math.max(1, processedTrees * perTreeLabor);
  }
  if (task.key === 'pollination') {
    return Math.max(1, processedTrees * POLLINATION_LABOR_PER_TREE);
  }
  if (task.key === 'leafPlucking') {
    return Math.max(1, processedTrees * leafPluckingLaborPerTreeByFruitLoad(field, day));
  }
  if (WINTER_PRUNING_TASK_KEYS.has(task.key)) {
    return Math.max(1, processedTrees * weightedWinterPruningLaborPerTree(field, day, task.key));
  }
  if (WATERSPROUT_PRUNING_TASK_KEYS.has(task.key)) {
    return Math.max(1, processedTrees * weightedWatersproutPruningLaborPerTree(field, day));
  }
  if (SPRAY_TASK_KEYS.includes(task.key)) {
    return Math.max(1, processedTrees * SPRAY_LABOR_PER_TREE);
  }
  const defaultPerTreeLabor = (
    task.key === 'reflectiveFilm'
    || task.key === 'reflectiveFilmCollection'
    || task.key === 'brickCollection'
  )
    ? Math.max(0.01, Number(DEFAULT_TASK_LABOR_PER_TREE_BY_KEY[task.key]) || 1)
    : Math.max(0.1, Number(DEFAULT_TASK_LABOR_PER_TREE_BY_KEY[task.key]) || 1);
  return Math.max(1, processedTrees * defaultPerTreeLabor * (task.key==='canopyTraining'?trellisTrainingMultiplier(field):1));
};

export const taskLaborPerTree = (task, field, day = 1) => {
  if (!task) return 1;
  if(task.key==='canopyTraining')return trellisTrainingMultiplier(field);
  if (task.key === 'appleContainerCoating') {
    return Math.max(0.01, APPLE_CONTAINER_COATING_LABOR_PER_BOX);
  }
  if (task.key === 'appleContainerCollection') {
    return Math.max(0.01, APPLE_CONTAINER_COLLECTION_LABOR_PER_BOX);
  }
  if (THINNING_TASK_KEYS.has(task.key)) {
    return task.key === 'flowerThinning'
      ? weightedFlowerThinningLaborPerTree(field, day)
      : weightedThinningLaborPerTree(task.key, field, day);
  }
  if (task.key === 'pollination') return POLLINATION_LABOR_PER_TREE;
  if (task.key === 'leafPlucking') return leafPluckingLaborPerTreeByFruitLoad(field, day);
  if (WINTER_PRUNING_TASK_KEYS.has(task.key)) return weightedWinterPruningLaborPerTree(field, day, task.key);
  if (WATERSPROUT_PRUNING_TASK_KEYS.has(task.key)) return weightedWatersproutPruningLaborPerTree(field, day);
  if (SPRAY_TASK_KEYS.includes(task.key)) return SPRAY_LABOR_PER_TREE;
  if (task.key === 'reflectiveFilm') {
    return Math.max(0.01, Number(DEFAULT_TASK_LABOR_PER_TREE_BY_KEY[task.key]) || 1);
  }
  if (task.key === 'reflectiveFilmCollection') {
    return Math.max(0.01, Number(DEFAULT_TASK_LABOR_PER_TREE_BY_KEY[task.key]) || REFLECTIVE_FILM_COLLECTION_LABOR_PER_TREE);
  }
  if (task.key === 'brickCollection') {
    return Math.max(0.01, Number(DEFAULT_TASK_LABOR_PER_TREE_BY_KEY[task.key]) || BRICK_COLLECTION_LABOR_PER_TREE);
  }
  return Math.max(0.1, Number(DEFAULT_TASK_LABOR_PER_TREE_BY_KEY[task.key]) || 1);
};

export const taskProgressUnitText = (task, field) => {
  if (!task) return '';
  if (task.key === 'trellisInstall') {
    const totalTrees = Math.max(1, Math.ceil(Number(field?.trees) || 0));
    const installedTrees = clamp(Number(field?.landFacilityCounts?.trellisWireSupport) || 0, 0, totalTrees);
    const progress = totalTrees > 0 ? clamp((installedTrees / totalTrees) * 100, 0, 100) : 0;
    return `${installedTrees}/${totalTrees}\uC8FC (${progress.toFixed(1)}%)`;
  }
  if (task.key === 'pruningSealant') {
    const needByAge = field?.pruningSealNeedByAge || {};
    const doneByAge = field?.ageTaskWorkedTreesByTask?.pruningSealant || {};
    const totalTrees = Math.max(
      1,
      Math.round(
        Object.values(needByAge).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0)
      )
    );
    const doneTrees = Math.min(
      totalTrees,
      Math.round(
        Object.entries(needByAge).reduce((sum, [ageKey, needRaw]) => {
          const need = Math.max(0, Number(needRaw) || 0);
          const done = Math.max(0, Number(doneByAge?.[ageKey]) || 0);
          return sum + Math.min(need, done);
        }, 0)
      )
    );
    const progress = totalTrees > 0 ? clamp((doneTrees / totalTrees) * 100, 0, 100) : 0;
    return `${doneTrees}/${totalTrees}\uC8FC (${progress.toFixed(1)}%)`;
  }
  const rawProgress = clamp(Number(field?.taskProgress?.[task.key]) || 0, 0, 100);
  const progress = rawProgress >= 99.95 ? 100 : rawProgress;
  const totalTrees = Math.max(1, Math.ceil(Number(field?.trees) || 0));
  const doneTrees = progress >= 100
    ? totalTrees
    : Math.min(totalTrees, Math.floor((totalTrees * progress) / 100));
  return `${doneTrees}/${totalTrees}\uC8FC (${progress.toFixed(1)}%)`;
};
