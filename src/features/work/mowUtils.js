import { clamp } from '../../utils/common';
import { liveTreeCount } from '../../utils/cropLots';

export const WEED_MOW_REDUCE_AMOUNT = 80;
export const WEED_MOW_LABOR_COST = 10;
export const WEED_MOW_GROWTH_REDUCTION_DAYS = 7;
export const WEED_MOW_GROWTH_REDUCTION_RATIO = 0.8;
export const RIDE_MOWER_WEED_FLOOR = 25;
export const WALK_MOWER_WEED_FLOOR = 15;

export const MOWER_WORK_PROFILE_BY_TYPE = {
  shoulder: { laborPerTree: 0.07875, maxProgressPercent: 100 },
  walk: { laborPerTree: 0.035, maxProgressPercent: 85 },
  ride: { laborPerTree: 0.01225, maxProgressPercent: 85 }
};

export const mowerWorkProfileOf = (machineKey) => {
  const key = String(machineKey || '').toLowerCase();
  if (key.startsWith('brushride') || key === 'ridemower' || key === 'hame1022x') return MOWER_WORK_PROFILE_BY_TYPE.ride;
  if (key.startsWith('brushwalk')) return MOWER_WORK_PROFILE_BY_TYPE.walk;
  if (key.startsWith('brushshoulder')) return MOWER_WORK_PROFILE_BY_TYPE.shoulder;
  return MOWER_WORK_PROFILE_BY_TYPE.walk;
};
export const isRideMowerMachineKey = (machineKey) => {
  const key = String(machineKey || '').toLowerCase();
  return key.startsWith('brushride') || key === 'ridemower' || key === 'hame1022x';
};
export const weedFloorByMowerMachineKey = (machineKey, weedNow = 0) => {
  const key = String(machineKey || '').toLowerCase();
  const safeWeedNow = clamp(Number(weedNow) || 0, 0, 100);
  if (isRideMowerMachineKey(key)) return Math.min(RIDE_MOWER_WEED_FLOOR, safeWeedNow);
  if (key.startsWith('brushwalk')) return Math.min(WALK_MOWER_WEED_FLOOR, safeWeedNow);
  return 0;
};

export const mowWorkloadTreesOfField = (field) => {
  const liveTrees = Math.max(0, liveTreeCount(field));
  if (liveTrees > 0) return liveTrees;
  const py = Math.max(1, Number(field?.py) || 1);
  return Math.max(1, Math.round(py * 2));
};

export const buildSelectedMowStats = ({
  selectedField,
  selectedMowMachineKey = '',
  selectedMowMachineProfile,
  laborMultiplier = 1
}) => {
  const selectedMowLaborNeed = Math.round((Math.max(0, WEED_MOW_LABOR_COST * Math.max(0, Number(laborMultiplier) || 0)) + Number.EPSILON) * 10) / 10;
  const selectedMowLaborPerTree = Math.max(0.01, Number(selectedMowMachineProfile?.laborPerTree) || 0.4);
  const selectedMowMaxProgressPercent = clamp(Number(selectedMowMachineProfile?.maxProgressPercent) || 90, 1, 100);
  const selectedMowTreesPerActionRaw = selectedMowLaborNeed / selectedMowLaborPerTree;
  const selectedMowWorkloadTrees = mowWorkloadTreesOfField(selectedField);
  const selectedMowProgressCapRatio = selectedMowMaxProgressPercent / 100;
  const selectedMowMaxWorkedTrees = selectedMowWorkloadTrees * selectedMowProgressCapRatio;
  const selectedMowWorkedTrees = clamp(Number(selectedField?.mowWorkedTrees) || 0, 0, selectedMowMaxWorkedTrees);
  const selectedMowRemainingTrees = Math.max(0, selectedMowMaxWorkedTrees - selectedMowWorkedTrees);
  const selectedMowTreesPerAction = Math.max(0, Math.min(selectedMowTreesPerActionRaw, selectedMowRemainingTrees));
  const selectedMowWorkRatio = clamp(selectedMowWorkedTrees / Math.max(1, selectedMowWorkloadTrees), 0, selectedMowProgressCapRatio);
  const selectedMowExpectedWeedReduceRaw = WEED_MOW_REDUCE_AMOUNT * clamp(selectedMowTreesPerAction / Math.max(1, selectedMowWorkloadTrees), 0, selectedMowProgressCapRatio);
  const weedNow = clamp(Number(selectedField?.weed) || 0, 0, 100);
  const weedFloor = weedFloorByMowerMachineKey(selectedMowMachineKey, weedNow);
  const selectedMowExpectedWeedReduce = clamp(selectedMowExpectedWeedReduceRaw, 0, Math.max(0, weedNow - weedFloor));
  const selectedMowProgressPercent = clamp(selectedMowWorkRatio * 100, 0, selectedMowMaxProgressPercent);
  return {
    selectedMowLaborNeed,
    selectedMowLaborPerTree,
    selectedMowMaxProgressPercent,
    selectedMowTreesPerAction,
    selectedMowWorkloadTrees,
    selectedMowWorkedTrees,
    selectedMowExpectedWeedReduce,
    selectedMowProgressPercent
  };
};
