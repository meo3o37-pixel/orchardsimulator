export function buildSprayerMixRequest({
  game,
  machineKey,
  mixRecipe,
  autoFillRecentWater = false,
  normalizeMixRecipe,
  sprayMixStateOf,
  sprayMachineTankCapacityLitersOfKey
}) {
  if (!game || !machineKey) return { ok: false };
  const normalizedRecipe = normalizeMixRecipe(mixRecipe, '');
  if (!normalizedRecipe.length) return { ok: false, reason: '배합 이력이 없습니다.' };
  const totalRatio = normalizedRecipe.reduce((sum, entry) => sum + Math.max(0.1, Number(entry.ratio) || 0), 0);
  if (totalRatio <= 0) return { ok: false, reason: '약제 비율을 확인해 주세요.' };
  if (!autoFillRecentWater && (sprayMixStateOf(game, machineKey).waterLiters || 0) <= 0) {
    return { ok: false, reason: '먼저 SS기에 물받기를 진행해 주세요.' };
  }
  const currentMix = sprayMixStateOf(game, machineKey);
  const cap = sprayMachineTankCapacityLitersOfKey(game, machineKey);
  if (currentMix.ready && currentMix.waterLiters >= cap) {
    return { ok: false, reason: '이미 배합 완료된 가득 찬 SS기입니다. 먼저 액체를 비워 주세요.' };
  }
  return {
    ok: true,
    normalizedRecipe,
    totalRatio,
    cap
  };
}

export function buildSprayerMixApplyState({
  prev,
  machineKey,
  normalizedRecipe,
  totalRatio,
  cap,
  autoFillRecentWater = false,
  sprayMixStateOf,
  fieldTankWaterLitersEffective,
  splitTankWaterByUnit,
  tankUnitWaterMapFromUnits,
  pesticideSolutionPerUnitLiterByKey,
  bordeauxMixRecipe,
  bordeauxMaterialPackKgByKey,
  pesticideItemMap,
  mixRecipeLabel,
  pushDiary,
  machineItemMap
}) {
  const nextInventory = { ...(prev.inventory || {}) };
  const nextOpenRemain = { ...(prev.pesticideOpenRemain || {}) };
  const openedUnitsByKey = {};
  const copperPackKg = Number(bordeauxMaterialPackKgByKey[bordeauxMixRecipe.copperSulfateKey]) || 1;
  const limePackKg = Number(bordeauxMaterialPackKgByKey[bordeauxMixRecipe.hydratedLimeKey]) || 1;
  let copperStock = Math.max(0, Number(nextInventory?.[bordeauxMixRecipe.copperSulfateKey]) || 0);
  let limeStock = Math.max(0, Number(nextInventory?.[bordeauxMixRecipe.hydratedLimeKey]) || 0);
  let copperRemainKg = copperStock * copperPackKg;
  let limeRemainKg = limeStock * limePackKg;
  let fields = prev.fields;
  let mix = sprayMixStateOf(prev, machineKey);
  const machineName = machineItemMap[machineKey]?.name || 'SS기';
  let autoWaterLog = '';

  if (autoFillRecentWater && (mix.waterLiters || 0) <= 0) {
    const ownedFieldWithWater = prev.fields
      .map((field, idx) => ({ field, idx }))
      .find(({ field }) => field?.owned && fieldTankWaterLitersEffective(field) > 0);
    const preferredIndex = Number.isFinite(Number(mix?.lastSourceFieldIndex)) ? Number(mix.lastSourceFieldIndex) : -1;
    const preferredField = prev.fields?.[preferredIndex];
    const hasPreferredWater = Boolean(preferredField?.owned) && fieldTankWaterLitersEffective(preferredField) > 0;
    const sourceIndex = hasPreferredWater ? preferredIndex : (ownedFieldWithWater?.idx ?? -1);
    const sourceField = sourceIndex >= 0 ? prev.fields[sourceIndex] : null;
    if (sourceField?.owned) {
      const remain = Math.max(0, cap - (Number(mix?.waterLiters) || 0));
      const sourceWater = fieldTankWaterLitersEffective(sourceField);
      const move = Math.floor(Math.min(sourceWater, remain));
      if (move > 0) {
        const nextSourceWater = Math.max(0, sourceWater - move);
        const nextSourceUnits = splitTankWaterByUnit(sourceField, nextSourceWater);
        fields = [...prev.fields];
        fields[sourceIndex] = {
          ...sourceField,
          tankWaterLiters: nextSourceWater,
          tankWaterLitersByUnit: tankUnitWaterMapFromUnits(nextSourceUnits)
        };
        mix = {
          ...mix,
          waterLiters: (Number(mix?.waterLiters) || 0) + move,
          mixRecipe: [],
          pesticideKey: null,
          ready: false,
          lastSourceFieldIndex: sourceIndex
        };
        autoWaterLog = `${machineName} 물받기 ${move}L (${sourceField.name})`;
      }
    }
  }

  if ((mix.waterLiters || 0) <= 0) return { ok: false };
  const totalLiters = Math.max(0, Number(mix.waterLiters) || 0);

  for (const entry of normalizedRecipe) {
    const pesticideKey = entry.key;
    const solutionPerUnit = Math.max(0, Number(pesticideSolutionPerUnitLiterByKey[pesticideKey]) || 0);
    if (solutionPerUnit <= 0) return { ok: false };
    const needLiters = totalLiters * (entry.ratio / totalRatio);
    let remain = Math.max(0, Number(nextOpenRemain?.[pesticideKey]) || 0);
    let stock = Math.max(0, Number(nextInventory?.[pesticideKey]) || 0);
    let pendingNeed = needLiters;
    while (pendingNeed > 1e-6) {
      if (remain <= 1e-6) {
        if (pesticideKey === bordeauxMixRecipe.pesticideKey) {
          if (copperRemainKg < 1 || limeRemainKg < 1) return { ok: false };
          copperRemainKg -= 1;
          limeRemainKg -= 1;
        } else {
          if (stock <= 0) return { ok: false };
          stock -= 1;
          nextInventory[pesticideKey] = stock;
        }
        remain = solutionPerUnit;
        openedUnitsByKey[pesticideKey] = (openedUnitsByKey[pesticideKey] || 0) + 1;
      }
      const used = Math.min(remain, pendingNeed);
      remain -= used;
      pendingNeed -= used;
    }
    nextOpenRemain[pesticideKey] = Math.max(0, remain);
  }

  const nextMix = {
    ...mix,
    mixRecipe: normalizedRecipe,
    pesticideKey: normalizedRecipe[0]?.key || null,
    ready: true,
    mixedDay: prev.day,
    lastSourceFieldIndex: Number.isFinite(Number(mix?.lastSourceFieldIndex)) ? Number(mix.lastSourceFieldIndex) : -1
  };
  nextInventory[bordeauxMixRecipe.copperSulfateKey] = Math.max(0, Number((copperRemainKg / copperPackKg).toFixed(3)));
  nextInventory[bordeauxMixRecipe.hydratedLimeKey] = Math.max(0, Number((limeRemainKg / limePackKg).toFixed(3)));
  const openedText = Object.entries(openedUnitsByKey)
    .map(([key, count]) => `${pesticideItemMap[key]?.name || key} ${count}${pesticideItemMap[key]?.unit || '개'}`)
    .join(', ');
  const mixLog = `${machineName} 약제배합 완료 (${mixRecipeLabel(nextMix)}${openedText ? ` / 개봉 ${openedText}` : ''})`;
  const mergedLog = autoWaterLog ? `${autoWaterLog} / ${mixLog}` : mixLog;

  return {
    ok: true,
    nextState: {
      ...prev,
      fields,
      inventory: nextInventory,
      pesticideOpenRemain: nextOpenRemain,
      sprayMixByMachine: {
        ...(prev.sprayMixByMachine || {}),
        [machineKey]: nextMix
      },
      logs: pushDiary(prev, mergedLog)
    }
  };
}

export function buildSprayerWaterFillRequest({
  game,
  sprayMixModalMachineKey,
  sprayMixDraft,
  sprayMixStateOf,
  sprayMachineTankCapacityLitersOfKey
}) {
  if (!game || !sprayMixModalMachineKey) return { ok: false };
  const sourceIndex = Number(sprayMixDraft?.sourceFieldIndex);
  const cap = sprayMachineTankCapacityLitersOfKey(game, sprayMixModalMachineKey);
  const currentMix = sprayMixStateOf(game, sprayMixModalMachineKey);
  if (sourceIndex < 0) return { ok: false, reason: '물받기할 토지를 선택해 주세요.' };
  if (currentMix.ready && currentMix.waterLiters >= cap) {
    return { ok: false, reason: '이미 배합 완료된 가득 찬 SS기입니다. 먼저 액체를 비워 주세요.' };
  }
  return { ok: true, sourceIndex, cap };
}

export function buildSprayerWaterFillApplyState({
  prev,
  sprayMixModalMachineKey,
  sprayMixDraft,
  sourceIndex,
  cap,
  sprayMixStateOf,
  pushDiary,
  machineName = 'SS기'
}) {
  const fields = [...prev.fields];
  const source = fields[sourceIndex];
  if (!source || !source.owned) return { ok: false };
  const sourceWater = Math.max(0, Number(source.tankWaterLiters) || 0);
  const mix = sprayMixStateOf(prev, sprayMixModalMachineKey);
  const isFullAndReady = Boolean(mix.ready) && mix.waterLiters >= cap;
  if (isFullAndReady) return { ok: false };
  const remain = Math.max(0, cap - mix.waterLiters);
  if (remain <= 0) return { ok: false };
  const maxMovableStep = Math.floor(Math.min(sourceWater, remain));
  if (maxMovableStep <= 0) return { ok: false };
  const draftLiters = Math.floor(Number(sprayMixDraft?.waterLiters) || 0);
  const move = Math.max(1, Math.min(maxMovableStep, draftLiters));
  if (move <= 0) return { ok: false };
  fields[sourceIndex] = { ...source, tankWaterLiters: sourceWater - move };
  const nextMix = {
    ...mix,
    waterLiters: mix.waterLiters + move,
    mixRecipe: [],
    pesticideKey: null,
    ready: false,
    lastSourceFieldIndex: sourceIndex
  };
  return {
    ok: true,
    nextState: {
      ...prev,
      fields,
      sprayMixByMachine: {
        ...(prev.sprayMixByMachine || {}),
        [sprayMixModalMachineKey]: nextMix
      },
      logs: pushDiary(prev, `${machineName} 물받기 ${move}L (${source.name})`)
    }
  };
}

export function buildSprayerDrainApplyState({
  prev,
  machineKey,
  sprayMixStateOf,
  pushDiary,
  machineName = 'SS기'
}) {
  const mix = sprayMixStateOf(prev, machineKey);
  if ((mix.waterLiters || 0) <= 0 && !mix.ready) return { ok: false };
  return {
    ok: true,
    nextState: {
      ...prev,
      sprayMixByMachine: {
        ...(prev.sprayMixByMachine || {}),
        [machineKey]: {
          waterLiters: 0,
          mixRecipe: [],
          pesticideKey: null,
          ready: false,
          mixedDay: 0
        }
      },
      logs: pushDiary(prev, `${machineName} 액체 비우기`)
    }
  };
}
