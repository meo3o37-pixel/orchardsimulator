import { clamp } from '../../utils/common';
import {
  mowerWorkProfileOf,
  mowWorkloadTreesOfField,
  weedFloorByMowerMachineKey,
  WEED_MOW_GROWTH_REDUCTION_DAYS,
  WEED_MOW_REDUCE_AMOUNT
} from './mowUtils';
import { rainyWorkLaborMultiplier, temperatureLaborMultiplier } from './weatherRules';
import { buildTaskBlock, TASK_BLOCK_REASON } from './taskBlockUtils';

const MOW_DURABILITY_WEAR_MULTIPLIER = 0.65;

export const prepareMowRequest = ({
  game,
  selectedMowMachineInstance,
  source,
  laborNeed,
  availableLaborBySource,
  activeWorkersByType,
  isUnderRepair,
  equipmentDurabilityOf,
  bypassLaborPrompt
}) => {
  if (!selectedMowMachineInstance) {
    return buildTaskBlock({
      reasonCode: TASK_BLOCK_REASON.MACHINE_NOT_SELECTED,
      message: '예초기 선택 후 작업할 수 있습니다. "사용 예초기 고르기"에서 현재 토지 주차/창고/차량 적재함 예초기를 선택해 주세요.'
    });
  }
  const mowMachineKey = String(selectedMowMachineInstance.machineKey || '');
  const mowMachineName = selectedMowMachineInstance.item?.name || mowMachineKey;
  if (isUnderRepair(game, mowMachineKey)) {
    return buildTaskBlock({
      reasonCode: TASK_BLOCK_REASON.MACHINE_UNDER_REPAIR,
      message: `${mowMachineName}는 수리 중입니다. 다른 예초기를 선택하거나 수리 완료 후 작업해 주세요.`,
      details: { mowMachineKey }
    });
  }
  if (equipmentDurabilityOf(game, mowMachineKey) <= 0) {
    return buildTaskBlock({
      reasonCode: TASK_BLOCK_REASON.MACHINE_DURABILITY_EMPTY,
      message: `${mowMachineName} 내구도가 0%입니다. 수리 후 사용해 주세요.`,
      details: { mowMachineKey }
    });
  }
  const availableLabor = availableLaborBySource(game, source);
  if (availableLabor < laborNeed) {
    if (!bypassLaborPrompt && availableLabor > 0) {
      return {
        ok: false,
        needsPrompt: true,
        reasonCode: TASK_BLOCK_REASON.INSUFFICIENT_LABOR,
        availableLabor,
        laborNeed,
        mowMachineName
      };
    }
    if (availableLabor <= 0) {
      return buildTaskBlock({
        reasonCode: TASK_BLOCK_REASON.INSUFFICIENT_LABOR,
        message: `${source === 'workOrder' ? '외부인력' : '노동력'}이 부족합니다. (필요 ${laborNeed})`,
        details: { availableLabor, laborNeed }
      });
    }
  }
  return {
    ok: true,
    availableLabor,
    mowMachineKey,
    mowMachineName
  };
};

export const prepareMowFuelLimitedRequest = ({
  game,
  selectedMowMachineInstance,
  laborNeed,
  laborOverride,
  selectedMowTreesPerAction,
  selectedMowLaborPerTree,
  isCombustionMachineItem,
  machineFuelForWorkByKey,
  machineFuelLitersOfInstance,
  mowerFuelNeedLitersPerTreeByMachine
}) => {
  const mowMachineName = selectedMowMachineInstance
    ? (selectedMowMachineInstance.item?.name || String(selectedMowMachineInstance.machineKey || ''))
    : '';
  let effectiveLaborNeed = laborNeed;
  let effectiveLaborOverride = laborOverride;

  if (selectedMowMachineInstance && isCombustionMachineItem(selectedMowMachineInstance.item)) {
    const fuelState = machineFuelForWorkByKey(game, selectedMowMachineInstance.machineKey, 0);
    const fuelInstance = fuelState?.instance || null;
    const fuelItem = fuelInstance?.item || selectedMowMachineInstance.item;
    const availableFuelLiters = fuelInstance
      ? Math.max(0, machineFuelLitersOfInstance(game, fuelInstance.id, fuelItem))
      : 0;
    if (availableFuelLiters <= 0.01) {
      return buildTaskBlock({
        reasonCode: TASK_BLOCK_REASON.NO_FUEL,
        message: '장비에 연료가 없습니다.',
        details: { availableFuelLiters }
      });
    }
    const fuelPerTree = Math.max(0.0001, mowerFuelNeedLitersPerTreeByMachine(selectedMowMachineInstance.machineKey));
    const fuelLimitedTrees = availableFuelLiters / fuelPerTree;
    const laborLimitedTrees = Math.max(0, Number(selectedMowTreesPerAction) || 0);
    const treesAllowedByFuel = Math.max(0, Math.min(laborLimitedTrees, fuelLimitedTrees));
    if (laborLimitedTrees <= 0) {
      return buildTaskBlock({
        reasonCode: TASK_BLOCK_REASON.WORKLOAD_EXHAUSTED,
        message: `${mowMachineName || '현재선택한 예초기'} 로는 더이상 예초할수없습니다.`
      });
    }
    if (treesAllowedByFuel <= 0) {
      return buildTaskBlock({
        reasonCode: TASK_BLOCK_REASON.INSUFFICIENT_FUEL,
        message: '장비에 연료가 부족합니다.',
        details: { availableFuelLiters, fuelPerTree }
      });
    }
    const fuelLimitedLaborNeed = treesAllowedByFuel * Math.max(0.01, Number(selectedMowLaborPerTree) || 0.01);
    if (!(fuelLimitedLaborNeed > 0)) {
      return buildTaskBlock({
        reasonCode: TASK_BLOCK_REASON.WORKLOAD_EXHAUSTED,
        message: `${mowMachineName || '현재선택한 예초기'} 로는 더이상 예초할수없습니다.`
      });
    }
    effectiveLaborNeed = Math.min(laborNeed, fuelLimitedLaborNeed);
    const requestedLabor = Math.max(0, Number(laborOverride) || laborNeed);
    effectiveLaborOverride = Math.min(requestedLabor, fuelLimitedLaborNeed);
  }

  return {
    ok: true,
    effectiveLaborNeed,
    effectiveLaborOverride,
    mowMachineName
  };
};

export const applyMowToGame = (prev, options) => {
  const {
    source,
    selectedMowMachineInstance,
    laborOverride,
    laborNeed,
    availableLaborBySource,
    activeWorkersByType,
    isUnderRepair,
    equipmentDurabilityOf,
    applyEquipmentUseWear,
    equipmentItemMap,
    pushDiary,
    laborText,
    mowMachineName,
    slopeLaborMultiplier = 1
  } = options;

  const fields = [...prev.fields];
  const field = fields[prev.selectedField];
  const machineKey = String(selectedMowMachineInstance?.machineKey || '');
  if (!machineKey || isUnderRepair(prev, machineKey) || equipmentDurabilityOf(prev, machineKey) <= 0) return prev;
  const profile = mowerWorkProfileOf(machineKey, selectedMowMachineInstance?.item);
  const weatherLaborMultiplier = rainyWorkLaborMultiplier(prev.weather);
  const tempLaborMultiplier = temperatureLaborMultiplier(prev.temperatureC);
  const slopeMultiplier = Math.max(1, Number(slopeLaborMultiplier) || 1);
  const laborPerTree = Math.max(
    0.01,
    (Number(profile?.laborPerTree) || 0.4) * weatherLaborMultiplier * tempLaborMultiplier * slopeMultiplier
  );
  const maxProgressPercent = clamp(Number(profile?.maxProgressPercent) || 90, 1, 100);
  const progressCapRatio = maxProgressPercent / 100;
  const available = availableLaborBySource(prev, source);
  if (available <= 0) return prev;

  const requestedLabor = Math.max(0, Number(laborOverride) || laborNeed);
  const laborCost = Math.min(requestedLabor, available);
  if (!(laborCost > 0)) return prev;
  const weedNow = clamp(Number(field.weed) || 0, 0, 100);
  const workloadTrees = mowWorkloadTreesOfField(field);
  const maxWorkedTrees = workloadTrees * progressCapRatio;
  const workedTreesNow = clamp(Number(field?.mowWorkedTrees) || 0, 0, maxWorkedTrees);
  const treesPerActionRaw = laborCost / laborPerTree;
  const treesPerAction = Math.max(0, Math.min(treesPerActionRaw, Math.max(0, maxWorkedTrees - workedTreesNow)));
  if (treesPerAction <= 0) return prev;

  const workRatio = clamp(treesPerAction / Math.max(1, workloadTrees), 0, progressCapRatio);
  const weedReduceAmount = WEED_MOW_REDUCE_AMOUNT * workRatio;
  const weedFloor = weedFloorByMowerMachineKey(machineKey, weedNow);
  const nextWeed = clamp(weedNow - weedReduceAmount, weedFloor, 100);
  const nextWorkedTrees = clamp(workedTreesNow + treesPerAction, 0, maxWorkedTrees);
  const reachedFullMowProgress = nextWorkedTrees >= maxWorkedTrees;
  const nextWeedGrowthReductionUntilDay = reachedFullMowProgress
    ? Math.max(
      Math.max(0, Math.floor(Number(field?.weedGrowthReductionUntilDay) || 0)),
      Math.floor(Number(prev.day) || 0) + WEED_MOW_GROWTH_REDUCTION_DAYS
    )
    : Math.max(0, Math.floor(Number(field?.weedGrowthReductionUntilDay) || 0));
  const baseMowWear = Math.max(0, Number(equipmentItemMap[machineKey]?.usageWear) || 0.2);
  const standardTreesPerAction = Math.max(0.0001, Math.max(0.1, Number(laborNeed) || 0.1) / laborPerTree);
  const mowWorkRatio = clamp(treesPerAction / standardTreesPerAction, 0.2, 1);
  const adjustedMowWear = baseMowWear * MOW_DURABILITY_WEAR_MULTIPLIER * mowWorkRatio;
  const wearApplied = applyEquipmentUseWear(prev, { [machineKey]: adjustedMowWear });

  fields[prev.selectedField] = {
    ...field,
    weed: nextWeed,
    mowWorkedTrees: nextWorkedTrees,
    weedGrowthReductionUntilDay: nextWeedGrowthReductionUntilDay,
    note: field.cropId ? field.note : `예초 완료 (잡초 ${Math.round(weedNow)} -> ${Math.round(nextWeed)})`
  };

  return {
    ...prev,
    equipmentDurability: wearApplied.equipmentDurability,
    equipmentDurabilityByInstance: wearApplied.equipmentDurabilityByInstance,
    labor: source === 'workOrder' ? prev.labor : (prev.labor - laborCost),
    externalLaborRemaining: source === 'workOrder' ? Math.max(0, (Number(prev.externalLaborRemaining) || 0) - laborCost) : (Number(prev.externalLaborRemaining) || 0),
    fields,
    logs: pushDiary(
      prev,
      `${field.name} 예초 ${source === 'workOrder' ? '지시' : '작업'} (${mowMachineName}, 작업량 ${Math.round(treesPerAction)}주, 누적 ${Math.round(nextWorkedTrees)}/${Math.round(workloadTrees)}주, 잡초 ${Math.round(weedNow)} -> ${Math.round(nextWeed)}, ${source === 'workOrder' ? `외부인력 노동력 -${laborText(laborCost)}` : `노동력 -${laborText(laborCost)}`})`
    )
  };
};

export const applyMowFuelConsumption = ({
  prev,
  nextAfterMow,
  selectedMowMachineInstance,
  isCombustionMachineItem,
  mowFuelNeedLitersByMachine,
  consumeMachineFuelForWorkByKey
}) => {
  if (!selectedMowMachineInstance || !isCombustionMachineItem(selectedMowMachineInstance.item)) {
    return { ok: true, nextState: nextAfterMow };
  }
  const fieldIndex = Math.max(0, Number(prev?.selectedField) || 0);
  const beforeWorkedTrees = Math.max(0, Number(prev?.fields?.[fieldIndex]?.mowWorkedTrees) || 0);
  const afterWorkedTrees = Math.max(0, Number(nextAfterMow?.fields?.[fieldIndex]?.mowWorkedTrees) || 0);
  const workedTreesDelta = Math.max(0, afterWorkedTrees - beforeWorkedTrees);
  const fuelNeed = mowFuelNeedLitersByMachine(selectedMowMachineInstance.machineKey, workedTreesDelta);
  if (fuelNeed <= 0) return { ok: true, nextState: nextAfterMow };
  const consumedFuel = consumeMachineFuelForWorkByKey(nextAfterMow, selectedMowMachineInstance.machineKey, fuelNeed);
  if (!consumedFuel.ok) return { ok: false, nextState: prev };
  return {
    ok: true,
    nextState: {
      ...nextAfterMow,
      machineFuelByInstance: consumedFuel.nextMachineFuelByInstance
    }
  };
};
