import { clamp } from '../../utils/common';

export const computeSprayCapacityContext = ({
  isSprayTask,
  prev,
  taskKey,
  field,
  current,
  canStartNextSprayCycle,
  sprayMode,
  firstUsableMixedSprayerKey,
  sprayMixStateOf,
  sprayNeedRemainingLitersForTask,
  sprayMachineTankLiters,
  sprayMachineTankLitersOfKey
}) => {
  if (!isSprayTask) {
    return {
      sprayMachineKey: null,
      sprayMix: null,
      sprayNeedLiters: 0,
      sprayCap: 0,
      maxSprayUseLiters: 0,
      sprayCoverageMax: 1
    };
  }
  const sprayMachineKey = firstUsableMixedSprayerKey(prev, taskKey, field || null);
  const sprayMix = sprayMachineKey ? sprayMixStateOf(prev, sprayMachineKey) : null;
  const sprayNeedBaseField = canStartNextSprayCycle
    ? {
      ...current,
      taskProgress: { ...current.taskProgress, [taskKey]: 0 }
    }
    : current;
  const sprayNeedLiters = sprayNeedRemainingLitersForTask(sprayNeedBaseField, taskKey, prev.day);
  const sprayCap = (() => {
    if (!sprayMachineKey) return 0;
    if (typeof sprayMachineTankLitersOfKey === 'function') {
      return Math.max(0, Number(sprayMachineTankLitersOfKey(prev, sprayMachineKey)) || 0);
    }
    return Math.max(0, Number(sprayMachineTankLiters?.[sprayMachineKey]) || 0);
  })();
  const maxSprayUseLiters = Math.max(
    0,
    Math.min(
      Number(sprayMix?.waterLiters) || 0,
      sprayMode === 'full' ? sprayCap : sprayNeedLiters
    )
  );
  const sprayCoverageMax = sprayNeedLiters > 0 ? clamp(maxSprayUseLiters / sprayNeedLiters, 0, 1) : 0;
  return {
    sprayMachineKey,
    sprayMix,
    sprayNeedLiters,
    sprayCap,
    maxSprayUseLiters,
    sprayCoverageMax
  };
};

export const capProcessableTreesByAgeTarget = ({
  taskKey,
  selectedAgeYear,
  current,
  prevDay,
  totalAliveTrees,
  processableTrees,
  cropRowsByVarietyAndAge,
  crops,
  pruningTaskKeys,
  workedTaskKey,
  workedByAgeMap
}) => {
  let nextProcessableTrees = processableTrees;
  let pruningTargetShare = 1;
  const resolvedWorkedTaskKey = String(workedTaskKey || taskKey || '');

  if (taskKey === 'pollination' && selectedAgeYear) {
    const rows = cropRowsByVarietyAndAge(current, prevDay, crops);
    const ageKey = `${Math.max(1, Math.floor(Number(selectedAgeYear) || 1))}`;
    const targetRow = rows.find((row) => `${Math.max(1, Math.floor(Number(row?.ageYear) || 1))}` === ageKey);
    const targetAlive = Math.max(0, Number(targetRow?.aliveTrees) || 0);
    const workedByTask = current?.ageTaskWorkedTreesByTask?.pollination || {};
    const targetWorked = Math.max(0, Number(workedByTask?.[ageKey]) || 0);
    const remainTargetTrees = Math.max(0, targetAlive - targetWorked);
    nextProcessableTrees = Math.min(nextProcessableTrees, remainTargetTrees);
  }

  if (taskKey === 'leafPlucking' && selectedAgeYear) {
    const rows = cropRowsByVarietyAndAge(current, prevDay, crops);
    const ageKey = `${Math.max(1, Math.floor(Number(selectedAgeYear) || 1))}`;
    const targetRow = rows.find((row) => `${Math.max(1, Math.floor(Number(row?.ageYear) || 1))}` === ageKey);
    const targetAlive = Math.max(0, Number(targetRow?.aliveTrees) || 0);
    const workedByTask = workedByAgeMap || current?.ageTaskWorkedTreesByTask?.[resolvedWorkedTaskKey] || {};
    const targetWorked = Math.max(0, Number(workedByTask?.[ageKey]) || 0);
    const remainTargetTrees = Math.max(0, targetAlive - targetWorked);
    nextProcessableTrees = Math.min(nextProcessableTrees, remainTargetTrees);
  }

  if (pruningTaskKeys.has(taskKey) && selectedAgeYear) {
    const rows = cropRowsByVarietyAndAge(current, prevDay, crops);
    const ageKey = `${Math.max(1, Math.floor(Number(selectedAgeYear) || 1))}`;
    const targetRow = rows.find((row) => `${Math.max(1, Math.floor(Number(row?.ageYear) || 1))}` === ageKey);
    const targetAlive = Math.max(0, Number(targetRow?.aliveTrees) || 0);
    pruningTargetShare = totalAliveTrees > 0 ? clamp(targetAlive / totalAliveTrees, 0, 1) : 0;
    const workedByTask = current?.ageTaskWorkedTreesByTask?.[taskKey] || {};
    const targetWorked = Math.max(0, Number(workedByTask?.[ageKey]) || 0);
    const remainTargetTrees = Math.max(0, targetAlive - targetWorked);
    nextProcessableTrees = Math.min(nextProcessableTrees, remainTargetTrees);
  }

  return {
    processableTrees: nextProcessableTrees,
    pruningTargetShare
  };
};

export const buildNextSprayMixByMachine = ({
  prev,
  sprayUseLiters,
  sprayMachineKey,
  sprayMixStateOf
}) => {
  if (!(sprayUseLiters > 0 && sprayMachineKey)) return prev.sprayMixByMachine || {};
  const currentMix = sprayMixStateOf(prev, sprayMachineKey);
  const nextWater = Math.max(0, currentMix.waterLiters - sprayUseLiters);
  return {
    ...(prev.sprayMixByMachine || {}),
    [sprayMachineKey]: {
      ...currentMix,
      waterLiters: nextWater,
      ready: nextWater > 0
    }
  };
};

export const spendLaborBySource = ({
  prev,
  source,
  spendLabor,
  roundLabor
}) => ({
  labor: source === 'workOrder' ? prev.labor : roundLabor(prev.labor - spendLabor),
  externalLaborRemaining: source === 'workOrder'
    ? roundLabor((Number(prev.externalLaborRemaining) || 0) - spendLabor)
    : (Number(prev.externalLaborRemaining) || 0)
});

export const consumeFertilizerByLabor = ({
  prev,
  fertilizerKey,
  spendLabor,
  openPerBag = 20
}) => {
  const currentOpenRemain = prev.fertilizerOpenRemain || {};
  let remain = Number(currentOpenRemain[fertilizerKey]) || 0;
  let bagQty = Number(prev.inventory?.[fertilizerKey]) || 0;
  let consume = spendLabor;
  while (consume > 0) {
    if (remain <= 0) {
      if (bagQty <= 0) return { ok: false };
      bagQty -= 1;
      remain = openPerBag;
    }
    const used = Math.min(remain, consume);
    remain -= used;
    consume -= used;
  }
  return {
    ok: true,
    fertilizerOpenRemain: { ...currentOpenRemain, [fertilizerKey]: remain },
    inventory: { ...(prev.inventory || {}), [fertilizerKey]: bagQty }
  };
};

export const consumePollenByNeed = ({
  prev,
  pollenKey,
  pollenNeedGrams,
  gramsPerUnit
}) => {
  const currentOpenRemain = prev.pollenOpenRemain || {};
  let remain = Math.max(0, Number(currentOpenRemain[pollenKey]) || 0);
  let stock = Math.max(0, Number(prev.inventory?.[pollenKey]) || 0);
  let consume = Math.max(0, Number(pollenNeedGrams) || 0);
  let openedUnits = 0;
  while (consume > 0) {
    if (remain <= 0) {
      if (stock <= 0) return { ok: false };
      stock -= 1;
      openedUnits += 1;
      remain = gramsPerUnit;
    }
    const used = Math.min(remain, consume);
    remain -= used;
    consume -= used;
  }
  return {
    ok: true,
    openedUnits,
    pollenOpenRemain: { ...currentOpenRemain, [pollenKey]: remain },
    inventory: { ...(prev.inventory || {}), [pollenKey]: stock }
  };
};

export const buildPruningEffectState = ({
  isPruningTask,
  taskKey,
  currentProgress,
  nextProgress,
  currentPruningEffect,
  prevDay,
  pruningEffectDurationDays,
  pruningEffectPestReductionRatio,
  pruningEffectHighVigorQualityPenaltyReductionRatio,
  currentElectricPruningPestBoost,
  usedElectricPruningTool,
  electricPruningPestBoostDays,
  electricPruningPestBoostDaily
}) => {
  const nextPruningEffectByTask = (() => {
    if (!isPruningTask) return currentPruningEffect || null;
    const completedNow = currentProgress < 100 && nextProgress >= 100;
    if (!completedNow) return currentPruningEffect || null;
    const duration = pruningEffectDurationDays[taskKey] || 5;
    const startDay = prevDay + 1;
    const endDay = prevDay + duration;
    if (currentPruningEffect && typeof currentPruningEffect === 'object' && Number(currentPruningEffect.endDay) >= startDay) {
      return {
        startDay: Math.max(1, Math.floor(Number(currentPruningEffect.startDay) || startDay)),
        endDay: Math.max(endDay, Math.floor(Number(currentPruningEffect.endDay) || 0)),
        pestReductionRatio: Math.max(
          pruningEffectPestReductionRatio,
          clamp(Number(currentPruningEffect.pestReductionRatio) || 0, 0, 1)
        ),
        highVigorQualityPenaltyReductionRatio: Math.max(
          pruningEffectHighVigorQualityPenaltyReductionRatio,
          clamp(Number(currentPruningEffect.highVigorQualityPenaltyReductionRatio) || 0, 0, 1)
        ),
        source: taskKey
      };
    }
    return {
      startDay,
      endDay,
      pestReductionRatio: pruningEffectPestReductionRatio,
      highVigorQualityPenaltyReductionRatio: pruningEffectHighVigorQualityPenaltyReductionRatio,
      source: taskKey
    };
  })();

  const nextElectricPruningPestBoost = (() => {
    if (!(isPruningTask && usedElectricPruningTool)) return currentElectricPruningPestBoost || null;
    const startDay = prevDay + 1;
    const endDay = prevDay + electricPruningPestBoostDays;
    if (
      currentElectricPruningPestBoost
      && typeof currentElectricPruningPestBoost === 'object'
      && Number(currentElectricPruningPestBoost.endDay) >= startDay
    ) {
      return {
        startDay: Math.max(1, Math.floor(Number(currentElectricPruningPestBoost.startDay) || startDay)),
        endDay: Math.max(endDay, Math.floor(Number(currentElectricPruningPestBoost.endDay) || 0)),
        dailyIncrease: Math.max(electricPruningPestBoostDaily, Number(currentElectricPruningPestBoost.dailyIncrease) || 0)
      };
    }
    return {
      startDay,
      endDay,
      dailyIncrease: electricPruningPestBoostDaily
    };
  })();

  return {
    nextPruningEffectByTask,
    nextElectricPruningPestBoost
  };
};

export const buildSprayUsageDeltaByPesticide = ({
  isSprayTask,
  taskKey,
  sprayUseLiters,
  sprayMix,
  normalizeMixRecipe
}) => {
  if (!isSprayTask || sprayUseLiters <= 0) return {};
  const recipe = normalizeMixRecipe(sprayMix?.mixRecipe, sprayMix?.pesticideKey || '');
  if (!recipe.length) return {};
  const totalRatio = recipe.reduce((sum, entry) => sum + Math.max(0, Number(entry?.ratio) || 0), 0);
  const baseRatio = totalRatio > 0 ? totalRatio : recipe.length;
  const usage = {};
  recipe.forEach((entry) => {
    const key = entry?.key;
    if (!key) return;
    const ratio = totalRatio > 0 ? Math.max(0, Number(entry?.ratio) || 0) : 1;
    const liters = sprayUseLiters * (ratio / Math.max(1, baseRatio));
    usage[key] = (Number(usage[key]) || 0) + liters;
  });
  return usage;
};

export const buildPestSeasonSlowDecay = ({
  isSprayTask,
  sprayUseLiters,
  sprayUsageDeltaByPesticide,
  sprayUsageRatioBySubgroup,
  currentPestSeasonSlowDecay,
  fullTotal,
  decayDays,
  nextProgress,
  prevDay
}) => {
  if (!isSprayTask || sprayUseLiters <= 0) return currentPestSeasonSlowDecay || null;
  const ratios = sprayUsageRatioBySubgroup(sprayUsageDeltaByPesticide);
  if (ratios.total <= 0) return currentPestSeasonSlowDecay || null;
  const hasSingle = (ratios.fungicide > 0 || ratios.insecticide > 0);
  if (!hasSingle) return currentPestSeasonSlowDecay || null;
  const progressRatio = clamp(Math.max(0, nextProgress) / 100, 0, 1);
  // 병균/해충 게이지 분리 이후에는 단일 살균/살충 배합도 동일 효율로 감쇠를 적용합니다.
  const totalDecay = fullTotal * progressRatio;
  const dailyDecay = totalDecay / decayDays;
  return {
    startDay: prevDay + 1,
    endDay: prevDay + decayDays,
    dailyDecay
  };
};
