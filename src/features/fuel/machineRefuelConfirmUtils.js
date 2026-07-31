export function resolveMachineRefuelSelectedCanContext({
  machineRefuelSelectedCan,
  machineRefuelCanSourceSections,
  normalizeFuelContainerKey,
  machineRefuelFuelKey,
  parseCapacityLitersFromText,
  floorLitersToStep,
  normalizeFuelStorageByContainer,
  game
}) {
  const selectedCanOptionKey = String(machineRefuelSelectedCan?.optionKey || '');
  const selectedCanMatchedOption = (machineRefuelCanSourceSections || [])
    .flatMap((section) => (section?.options || []))
    .find((option) => String(option?.optionKey || '') === selectedCanOptionKey) || null;
  const selectedCanKey = normalizeFuelContainerKey(
    selectedCanMatchedOption?.itemKey || machineRefuelSelectedCan?.itemKey
  ) || String(selectedCanMatchedOption?.itemKey || machineRefuelSelectedCan?.itemKey || '');
  const selectedCanSourceKey = String(
    selectedCanMatchedOption?.sourceKey || machineRefuelSelectedCan?.sourceKey || 'warehouse'
  );
  const selectedCanSourceType = selectedCanSourceKey.startsWith('vehicle:') ? 'vehicle' : selectedCanSourceKey;
  const selectedCanSourceCarrierId = selectedCanSourceType === 'vehicle'
    ? String(selectedCanSourceKey.split(':').slice(1).join(':') || '')
    : '';
  const selectedCanGroupKey = String(
    selectedCanMatchedOption?.groupKey || machineRefuelSelectedCan?.groupKey || `${selectedCanSourceKey}:${selectedCanKey}:${machineRefuelFuelKey}`
  );
  const selectedCanOptionIndex = Math.max(
    0,
    Math.floor(Number(selectedCanMatchedOption?.optionIndex ?? machineRefuelSelectedCan?.optionIndex) || 0)
  );
  const selectedCanGroupQty = Math.max(
    1,
    Math.floor(Number(selectedCanMatchedOption?.groupQty ?? machineRefuelSelectedCan?.groupQty) || 1)
  );
  const selectedCanCap = Math.max(
    0,
    Number(selectedCanMatchedOption?.cap ?? machineRefuelSelectedCan?.cap)
    || parseCapacityLitersFromText(machineRefuelSelectedCan?.label)
    || parseCapacityLitersFromText(selectedCanKey)
    || 0
  );
  const selectedCanFuelLitersSnapshot = floorLitersToStep(machineRefuelSelectedCan?.fuelLiters);
  const selectedCanFuelLitersFromLabel = (() => {
    const label = String(machineRefuelSelectedCan?.label || selectedCanMatchedOption?.label || '');
    const match = label.match(/말통\s*([0-9]+(?:\.[0-9]+)?)L\s*\/\s*([0-9]+(?:\.[0-9]+)?)L/i);
    if (!match) return 0;
    return floorLitersToStep(match[1]);
  })();
  const selectedGroupVisibleSplit = (() => {
    const base = Array.from({ length: selectedCanGroupQty }, () => 0);
    (machineRefuelCanSourceSections || [])
      .flatMap((section) => (section?.options || []))
      .filter((option) => (
        String(option?.sourceKey || '') === selectedCanSourceKey
        && String(option?.itemKey || '') === selectedCanKey
      ))
      .forEach((option) => {
        const idx = Math.max(0, Math.floor(Number(option?.optionIndex) || 0));
        if (idx >= base.length) return;
        base[idx] = floorLitersToStep(option?.fuelLiters);
      });
    return base;
  })();
  const hasSelectedGroupVisibleSplit = selectedGroupVisibleSplit.some((liters) => liters > 0);
  const selectedGroupVisibleTotalLiters = floorLitersToStep(
    selectedGroupVisibleSplit.reduce((sum, liters) => sum + floorLitersToStep(liters), 0)
  );
  const selectedGroupTotalLiters = selectedCanSourceType === 'vehicle'
    ? floorLitersToStep(
      normalizeFuelStorageByContainer(
        game?.vehicleFuelStorageByInstance?.[selectedCanSourceCarrierId] || {}
      )?.[selectedCanKey]?.[machineRefuelFuelKey]
    )
    : floorLitersToStep(
      normalizeFuelStorageByContainer(game?.fuelStorageByContainer || {})?.[selectedCanKey]?.[machineRefuelFuelKey]
    );

  return {
    selectedCanMatchedOption,
    selectedCanKey,
    selectedCanSourceType,
    selectedCanSourceCarrierId,
    selectedCanGroupKey,
    selectedCanOptionIndex,
    selectedCanGroupQty,
    selectedCanCap,
    selectedCanFuelLitersSnapshot,
    selectedCanFuelLitersFromLabel,
    selectedGroupVisibleSplit,
    hasSelectedGroupVisibleSplit,
    selectedGroupVisibleTotalLiters,
    selectedGroupTotalLiters
  };
}

export function validateMachineRefuelRequest({
  selectedCanKey,
  machineRefuelLitersDraft,
  floorLitersToStep,
  machineRefuelFuelKey,
  machineRefuelMaxLiters,
  machineRefuelTankRemainLiters
}) {
  if (!selectedCanKey) return { ok: false, reason: '말통을 먼저 선택해 주세요.' };

  const liters = floorLitersToStep(machineRefuelLitersDraft);
  if (liters <= 0) return { ok: false, reason: '주유할 리터를 입력해 주세요.' };
  if (!machineRefuelFuelKey) return { ok: false, reason: '장비 연료 종류를 확인할 수 없습니다.' };

  const safeLiters = Math.max(0, Math.min(machineRefuelMaxLiters, liters));
  if (safeLiters <= 0) {
    if (machineRefuelTankRemainLiters <= 0) {
      return { ok: false, reason: '이미 연료탱크가 가득 찼습니다.' };
    }
    return { ok: false, reason: '보유 중인 연료가 부족합니다.' };
  }

  return { ok: true, safeLiters };
}

export function startMachineRefuelAnimation({
  machineRefuelAnimating,
  machineRefuelTimerRef,
  machineRefuelProgressTimerRef,
  safeLiters,
  clamp,
  setMachineRefuelAnimating,
  setMachineRefuelAnimatingLiters,
  setMachineRefuelAnimatingProgress
}) {
  if (machineRefuelAnimating) return null;

  if (machineRefuelTimerRef.current) clearTimeout(machineRefuelTimerRef.current);
  if (machineRefuelProgressTimerRef.current) clearInterval(machineRefuelProgressTimerRef.current);

  const durationMs = Math.max(1200, Math.min(3200, 900 + Math.round(safeLiters * 70)));
  const startedAt = Date.now();

  setMachineRefuelAnimating(true);
  setMachineRefuelAnimatingLiters(safeLiters);
  setMachineRefuelAnimatingProgress(0);

  machineRefuelProgressTimerRef.current = setInterval(() => {
    const elapsed = Date.now() - startedAt;
    const progress = clamp(elapsed / durationMs, 0, 1);
    setMachineRefuelAnimatingProgress(progress);
    if (progress >= 1) {
      if (machineRefuelProgressTimerRef.current) {
        clearInterval(machineRefuelProgressTimerRef.current);
        machineRefuelProgressTimerRef.current = null;
      }
    }
  }, 50);

  return { durationMs };
}

export function finalizeMachineRefuelAnimation({
  machineRefuelTimerRef,
  machineRefuelProgressTimerRef,
  setMachineRefuelAnimating,
  setMachineRefuelAnimatingLiters,
  setMachineRefuelAnimatingProgress
}) {
  setMachineRefuelAnimating(false);
  setMachineRefuelAnimatingLiters(0);
  setMachineRefuelAnimatingProgress(0);
  machineRefuelTimerRef.current = null;
  if (machineRefuelProgressTimerRef.current) {
    clearInterval(machineRefuelProgressTimerRef.current);
    machineRefuelProgressTimerRef.current = null;
  }
}

export function scheduleMachineRefuelCompletion({
  machineRefuelTimerRef,
  durationMs,
  setGame,
  buildNextGame,
  onComplete
}) {
  machineRefuelTimerRef.current = setTimeout(() => {
    setGame((prev) => buildNextGame(prev));
    if (typeof onComplete === 'function') onComplete();
  }, durationMs);
}

export function buildMachineRefuelGameUpdateContext({
  machineRefuelTargetInstanceId,
  machineRefuelTargetItem,
  isCombustionMachineItem,
  buildOwnedMachineInstances,
  machineRefuelResolvedTankKey,
  machineHasSeparateSprayFuelTank,
  machineFuelCapacityLitersOfItem,
  machineFuelLitersTrackedOfInstanceByTank,
  clamp,
  safeLiters,
  floorLitersToStep,
  normalizeVehicleFuelStorageByInstance,
  selectedCanSourceType,
  selectedCanSourceCarrierId,
  normalizeFuelStorageByContainer,
  consumeStoredFuelLitersFromContainer,
  machineRefuelFuelKey,
  selectedCanKey,
  fuelItemNameMap,
  machineRefuelFuelTypeLabel,
  machineRefuelTargetInstance,
  machineRefuelTankLabel,
  selectedCanGroupKey,
  hasSelectedGroupVisibleSplit,
  selectedGroupVisibleTotalLiters,
  selectedGroupTotalLiters,
  selectedCanGroupQty,
  selectedGroupVisibleSplit,
  selectedCanCap,
  parseCapacityLitersFromText,
  machineRefuelSelectedCan,
  normalizeFuelCanSplit,
  splitFuelLitersByCanCount,
  selectedCanOptionIndex,
  selectedCanFuelLitersFromLabel,
  selectedCanFuelLitersSnapshot,
  pushDiary
}) {
  return {
    machineRefuelTargetInstanceId,
    machineRefuelTargetItem,
    isCombustionMachineItem,
    buildOwnedMachineInstances,
    machineRefuelResolvedTankKey,
    machineHasSeparateSprayFuelTank,
    machineFuelCapacityLitersOfItem,
    machineFuelLitersTrackedOfInstanceByTank,
    clamp,
    safeLiters,
    floorLitersToStep,
    normalizeVehicleFuelStorageByInstance,
    selectedCanSourceType,
    selectedCanSourceCarrierId,
    normalizeFuelStorageByContainer,
    consumeStoredFuelLitersFromContainer,
    machineRefuelFuelKey,
    selectedCanKey,
    fuelItemNameMap,
    machineRefuelFuelTypeLabel,
    machineRefuelTargetInstance,
    machineRefuelTankLabel,
    selectedCanGroupKey,
    hasSelectedGroupVisibleSplit,
    selectedGroupVisibleTotalLiters,
    selectedGroupTotalLiters,
    selectedCanGroupQty,
    selectedGroupVisibleSplit,
    selectedCanCap,
    parseCapacityLitersFromText,
    machineRefuelSelectedCan,
    normalizeFuelCanSplit,
    splitFuelLitersByCanCount,
    selectedCanOptionIndex,
    selectedCanFuelLitersFromLabel,
    selectedCanFuelLitersSnapshot,
    pushDiary
  };
}

export function applyMachineRefuelGameUpdate(prev, context) {
  const {
    machineRefuelTargetInstanceId,
    machineRefuelTargetItem,
    isCombustionMachineItem,
    buildOwnedMachineInstances,
    machineRefuelResolvedTankKey,
    machineHasSeparateSprayFuelTank,
    machineFuelCapacityLitersOfItem,
    machineFuelLitersTrackedOfInstanceByTank,
    clamp,
    safeLiters,
    floorLitersToStep,
    normalizeVehicleFuelStorageByInstance,
    selectedCanSourceType,
    selectedCanSourceCarrierId,
    normalizeFuelStorageByContainer,
    consumeStoredFuelLitersFromContainer,
    machineRefuelFuelKey,
    selectedCanKey,
    fuelItemNameMap,
    machineRefuelFuelTypeLabel,
    machineRefuelTargetInstance,
    machineRefuelTankLabel,
    selectedCanGroupKey,
    hasSelectedGroupVisibleSplit,
    selectedGroupVisibleTotalLiters,
    selectedGroupTotalLiters,
    selectedCanGroupQty,
    selectedGroupVisibleSplit,
    selectedCanCap,
    parseCapacityLitersFromText,
    machineRefuelSelectedCan,
    normalizeFuelCanSplit,
    splitFuelLitersByCanCount,
    selectedCanOptionIndex,
    selectedCanFuelLitersFromLabel,
    selectedCanFuelLitersSnapshot,
    pushDiary
  } = context;

  const targetId = String(machineRefuelTargetInstanceId || '');
  if (!targetId) return prev;

  const target = buildOwnedMachineInstances(prev).find((x) => String(x?.id || '') === targetId) || null;
  const targetItem = target?.item || machineRefuelTargetItem || null;
  if (!targetItem || !isCombustionMachineItem(targetItem)) return prev;

  const resolvedTankKey = machineRefuelResolvedTankKey === 'spray' && machineHasSeparateSprayFuelTank(targetItem)
    ? 'spray'
    : 'drive';
  const cap = machineFuelCapacityLitersOfItem(targetItem, resolvedTankKey);
  const current = target
    ? machineFuelLitersTrackedOfInstanceByTank(prev, target.id, targetItem, resolvedTankKey)
    : clamp(
      Number(
        resolvedTankKey === 'spray'
          ? prev?.machineSprayFuelByInstance?.[targetId]
          : prev?.machineFuelByInstance?.[targetId]
      ) || 0,
      0,
      cap
    );
  const room = Math.max(0, cap - current);
  const request = floorLitersToStep(Math.min(room, safeLiters));
  if (request <= 0) return prev;

  let consumed = { nextFuelStorageByContainer: { ...(prev.fuelStorageByContainer || {}) }, consumedLiters: 0 };
  let nextVehicleFuelStorageByInstance = normalizeVehicleFuelStorageByInstance(prev.vehicleFuelStorageByInstance || {});

  if (selectedCanSourceType === 'vehicle') {
    const carrierId = String(selectedCanSourceCarrierId || targetId || '');
    const sourceFuelStorage = normalizeFuelStorageByContainer(nextVehicleFuelStorageByInstance[carrierId] || {});
    consumed = consumeStoredFuelLitersFromContainer(sourceFuelStorage, machineRefuelFuelKey, selectedCanKey, request);
    if (Object.keys(consumed.nextFuelStorageByContainer || {}).length > 0) {
      nextVehicleFuelStorageByInstance[carrierId] = consumed.nextFuelStorageByContainer;
    } else {
      delete nextVehicleFuelStorageByInstance[carrierId];
    }
  } else {
    consumed = consumeStoredFuelLitersFromContainer(
      normalizeFuelStorageByContainer(prev.fuelStorageByContainer || {}),
      machineRefuelFuelKey,
      selectedCanKey,
      request
    );
  }

  if (consumed.consumedLiters <= 0) return prev;

  const appliedLiters = floorLitersToStep(consumed.consumedLiters);
  const nextFuel = clamp(current + consumed.consumedLiters, 0, cap);
  const fuelName = fuelItemNameMap[machineRefuelFuelKey] || machineRefuelFuelTypeLabel || machineRefuelFuelKey;
  const targetName = targetItem?.name || target?.machineKey || machineRefuelTargetInstance?.machineKey || '장비';
  const unitNo = Number(target?.unitNo || machineRefuelTargetInstance?.unitNo || 1);

  let nextFuelCanSplitByGroup = { ...(prev.fuelCanSplitByGroup || {}) };
  if (appliedLiters > 0 && selectedCanGroupKey) {
    const prevSplitRaw = nextFuelCanSplitByGroup?.[selectedCanGroupKey];
    const baseGroupTotalLiters = hasSelectedGroupVisibleSplit
      ? selectedGroupVisibleTotalLiters
      : selectedGroupTotalLiters;
    const safeGroupQty = Math.max(
      1,
      selectedCanGroupQty,
      hasSelectedGroupVisibleSplit ? selectedGroupVisibleSplit.length : 0
    );
    const safeCap = Math.max(
      0,
      selectedCanCap,
      parseCapacityLitersFromText(machineRefuelSelectedCan?.label),
      parseCapacityLitersFromText(selectedCanKey)
    );
    const baseSplit = normalizeFuelCanSplit(
      hasSelectedGroupVisibleSplit ? selectedGroupVisibleSplit : prevSplitRaw,
      safeGroupQty,
      safeCap,
      baseGroupTotalLiters
    ) || splitFuelLitersByCanCount(
      baseGroupTotalLiters,
      safeGroupQty,
      safeCap
    );
    const effectiveBaseSplit = baseSplit.length
      ? baseSplit
      : (hasSelectedGroupVisibleSplit ? [...selectedGroupVisibleSplit] : []);

    if (effectiveBaseSplit.length) {
      const nextSplit = [...effectiveBaseSplit];
      let targetOptionIndex = selectedCanOptionIndex;
      const targetLitersHint = selectedCanFuelLitersFromLabel > 0
        ? selectedCanFuelLitersFromLabel
        : selectedCanFuelLitersSnapshot;

      if (targetLitersHint > 0 && nextSplit.length) {
        const exactCandidates = nextSplit
          .map((liters, idx) => ({ liters: floorLitersToStep(liters), idx }))
          .filter((row) => Math.abs(row.liters - targetLitersHint) <= 0.01)
          .map((row) => row.idx);
        if (exactCandidates.length === 1) {
          targetOptionIndex = exactCandidates[0];
        } else if (exactCandidates.length > 1) {
          targetOptionIndex = exactCandidates.includes(selectedCanOptionIndex)
            ? selectedCanOptionIndex
            : exactCandidates[0];
        }
      }

      if (
        targetOptionIndex < 0
        || targetOptionIndex >= nextSplit.length
        || floorLitersToStep(nextSplit[targetOptionIndex]) <= 0
      ) {
        const fallbackIndex = nextSplit.findIndex((liters) => floorLitersToStep(liters) > 0);
        if (fallbackIndex >= 0) targetOptionIndex = fallbackIndex;
      }

      if (targetOptionIndex < nextSplit.length) {
        const remain = Math.max(0, floorLitersToStep(nextSplit[targetOptionIndex] - appliedLiters));
        nextSplit[targetOptionIndex] = remain;
        const nextGroupTotalLiters = floorLitersToStep(Math.max(0, baseGroupTotalLiters - appliedLiters));
        const normalizedNextSplit = safeCap > 0
          ? (
            normalizeFuelCanSplit(
              nextSplit,
              safeGroupQty,
              safeCap,
              nextGroupTotalLiters
            ) || nextSplit
          )
          : nextSplit;

        nextFuelCanSplitByGroup = {
          ...nextFuelCanSplitByGroup,
          [selectedCanGroupKey]: normalizedNextSplit.map((value) => floorLitersToStep(value))
        };
      }
    }
  }

  return {
    ...prev,
    fuelStorageByContainer: selectedCanSourceType === 'vehicle'
      ? (prev.fuelStorageByContainer || {})
      : consumed.nextFuelStorageByContainer,
    vehicleFuelStorageByInstance: nextVehicleFuelStorageByInstance,
    machineFuelByInstance: resolvedTankKey === 'spray'
      ? { ...(prev.machineFuelByInstance || {}) }
      : {
        ...(prev.machineFuelByInstance || {}),
        [targetId]: nextFuel
      },
    machineSprayFuelByInstance: resolvedTankKey === 'spray'
      ? {
        ...(prev.machineSprayFuelByInstance || {}),
        [targetId]: nextFuel
      }
      : { ...(prev.machineSprayFuelByInstance || {}) },
    fuelCanSplitByGroup: nextFuelCanSplitByGroup,
    logs: pushDiary(
      prev,
      `장비 주유: ${targetName} #${unitNo} / ${machineRefuelTankLabel} / ${fuelName} ${consumed.consumedLiters}L (탱크 ${nextFuel.toFixed(1)}L/${cap.toFixed(1)}L)`
    )
  };
}
