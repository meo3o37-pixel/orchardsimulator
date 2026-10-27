import { useCallback } from 'react';
import { pushDiary } from '../../utils/common';

export function useWarehouseWorkbenchTaskRunner({
  allocateWorkbenchLaborAcrossWorkers,
  appleContainerLabelOf,
  laborText,
  mergeHarvestRemaindersInStorageSlots,
  normalizeCargoByItemKey,
  normalizeFacilityScopedMap,
  normalizedHarvestLoadBoxKey,
  resolveFieldFacilityInventoryByFacility,
  resolveWorkbenchTaskContext,
  roundLabor,
  spendExternalCrewLaborByWorkerMap,
  setGame,
  crops,
  workbenchTaskLabelOf,
  normalizeHarvestGradeLabel,
  harvestBoxCapacityKg,
  setWindowAlert = (message) => window.alert(message),
}) {
  return useCallback((facilityKeyRaw, workbenchSlotKeyRaw) => {
    const facilityKey = String(facilityKeyRaw || '');
    const workbenchSlotKey = String(workbenchSlotKeyRaw || '');
    if (!facilityKey || !workbenchSlotKey) return false;
    const createWorkbenchResultBatchId = (baseIdRaw = 'harvest-batch') => {
      const baseId = String(baseIdRaw || 'harvest-batch');
      return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `${baseId}-workbench-${crypto.randomUUID()}`
        : `${baseId}-workbench-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    };

    let processResult = {
      ok: false,
      alertMessage: '',
      processedBoxCount: 0,
    };

    setGame((prev) => {
      if (!prev || !Array.isArray(prev?.storage)) {
        processResult = { ok: false, alertMessage: '작업대 데이터를 불러오지 못했습니다.', processedBoxCount: 0 };
        return prev;
      }

      const storage = Array.isArray(prev.storage) ? prev.storage : [];
      const {
        selectedTaskKey,
        outputSlotNos,
        selectedSourceEntries,
        outputPieces,
        allocatedTargets,
        requiredAdditionalBoxCountsByItemKey,
        assignedWorkerEntries,
        totalLaborCost,
      } = resolveWorkbenchTaskContext(prev, facilityKey, workbenchSlotKey);
      const outputSlotOrder = new Map(outputSlotNos.map((slotNo, index) => ([slotNo, index])));

      if (!selectedSourceEntries.length) {
        processResult = {
          ok: false,
          alertMessage: selectedTaskKey === 'stemRemovalPartialSort'
            ? '투입칸에 꼭지제거 후 부분선별할 미선별 박스가 없습니다.'
            : selectedTaskKey === 'partialSortOnly'
              ? '투입칸에 부분선별할 미선별 박스가 없습니다.'
              : '투입칸에 꼭지제거할 박스가 없습니다.',
          processedBoxCount: 0,
        };
        return prev;
      }
      if (!assignedWorkerEntries.length) {
        processResult = { ok: false, alertMessage: '인원을 먼저 배치해야 합니다.', processedBoxCount: 0 };
        return prev;
      }

      const sourceIndexSet = new Set(selectedSourceEntries.map((entry) => entry.index));

      if (!outputPieces.length) {
        processResult = { ok: false, alertMessage: '작업 결과를 만들 수 없습니다.', processedBoxCount: 0 };
        return prev;
      }

      const { fieldId, byFacility } = resolveFieldFacilityInventoryByFacility(prev, prev?.selectedField);
      const nextByFacility = fieldId ? normalizeFacilityScopedMap(byFacility || {}) : {};
      const facilityInventory = fieldId ? normalizeCargoByItemKey(nextByFacility[facilityKey] || {}) : {};
      const nextInventory = { ...(prev.inventory || {}) };

      selectedSourceEntries.forEach(({ batch }) => {
        const itemKey = normalizedHarvestLoadBoxKey(batch?.loadBoxKey) || 'appleContainerYellow20kg';
        facilityInventory[itemKey] = Math.max(0, Number(facilityInventory?.[itemKey]) || 0) + 1;
        nextInventory[itemKey] = Math.max(0, Number(nextInventory?.[itemKey]) || 0) + 1;
      });
      Object.entries(requiredAdditionalBoxCountsByItemKey).forEach(([itemKeyRaw, additionalNeededCountRaw]) => {
        const itemKey = normalizedHarvestLoadBoxKey(itemKeyRaw) || 'appleContainerYellow20kg';
        const additionalNeededCount = Math.max(0, Number(additionalNeededCountRaw) || 0);
        if (additionalNeededCount <= 0) return;
        facilityInventory[itemKey] = Math.max(0, Number(facilityInventory?.[itemKey]) || 0) - additionalNeededCount;
        nextInventory[itemKey] = Math.max(0, Number(nextInventory?.[itemKey]) || 0) - additionalNeededCount;
      });

      const insufficientContainerItemKey = Object.keys(facilityInventory).find((itemKey) => Number(facilityInventory?.[itemKey]) < 0)
        || Object.keys(nextInventory).find((itemKey) => Number(nextInventory?.[itemKey]) < 0)
        || '';
      if (insufficientContainerItemKey) {
        processResult = {
          ok: false,
          alertMessage: `${insufficientContainerItemKey} 박스 재고가 부족합니다.`,
          processedBoxCount: 0,
        };
        return prev;
      }

      const laborAllocation = allocateWorkbenchLaborAcrossWorkers(assignedWorkerEntries, totalLaborCost);
      if (laborAllocation.remainingLabor > 0.001) {
        processResult = {
          ok: false,
          alertMessage: `배치 인원의 노동력이 부족합니다. (필요 ${laborText(totalLaborCost)} / 보유 ${laborText(assignedWorkerEntries.reduce((sum, entry) => sum + (Number(entry?.labor) || 0), 0))})`,
          processedBoxCount: 0,
        };
        return prev;
      }
      const selfLaborNeed = roundLabor(Number(laborAllocation.spendByWorkerToken?.self) || 0);
      const externalLaborSpendMap = Object.fromEntries(
        assignedWorkerEntries
          .filter((entry) => String(entry?.workerType || '') === 'external' && String(entry?.workerId || ''))
          .map((entry) => [String(entry.workerId || ''), roundLabor(Number(laborAllocation.spendByWorkerToken?.[entry.workerToken]) || 0)])
          .filter(([, laborNeed]) => laborNeed > 0)
      );
      const externalLaborSpendResult = spendExternalCrewLaborByWorkerMap(prev, externalLaborSpendMap);
      const nextLabor = roundLabor((Number(prev?.labor) || 0) - selfLaborNeed);

      let nextStorageBoxUnitNo = storage.reduce(
        (max, batch) => Math.max(max, Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0))),
        0
      );

      const nextStorage = storage
        .filter((_, index) => !sourceIndexSet.has(index))
        .concat(outputPieces.map((piece, pieceIndex) => {
          const target = allocatedTargets[pieceIndex];
          const qtyKg = Math.round(Math.max(0, Number(piece.qty) || 0) * 10) / 10;
          const fullBoxCount = Math.max(0, Math.floor((qtyKg + 0.001) / harvestBoxCapacityKg));
          const remainderKg = Math.round(Math.max(0, qtyKg - (fullBoxCount * harvestBoxCapacityKg)) * 10) / 10;
          const partialBoxCount = remainderKg > 0.001 ? 1 : 0;
          nextStorageBoxUnitNo += 1;
          return {
            ...piece.batch,
            id: createWorkbenchResultBatchId(piece.batch?.id || 'harvest-batch'),
            qty: qtyKg,
            stemRemoved: typeof piece?.stemRemoved === 'boolean'
              ? piece.stemRemoved
              : true,
            stemStatusKey: String(
              piece?.stemStatusKey
              || (typeof piece?.stemRemoved === 'boolean'
                ? (piece.stemRemoved ? 'removed' : 'attached')
                : 'removed')
            ).trim(),
            stemStatusLabel: String(
              piece?.stemStatusLabel
              || (typeof piece?.stemRemoved === 'boolean'
                ? (piece.stemRemoved ? '꼭지 제거' : '꼭지 있음')
                : '꼭지 제거')
            ).trim(),
            loadBoxKey: String(piece?.loadBoxKey || piece.batch?.loadBoxKey || 'appleContainerYellow20kg'),
            gradeLabel: normalizeHarvestGradeLabel(piece?.gradeLabel || piece.batch?.gradeLabel, '미선별') || '미선별',
            sizeLabel: String(piece?.sizeLabel || piece.batch?.sizeLabel || '').trim() || '미측정',
            palletized: !target?.usesFloorStorage,
            storageFacilityKey: facilityKey,
            storagePalletGroupId: target?.usesFloorStorage ? '' : `workbench-output:${facilityKey}:${target?.slotNo}:1`,
            storagePalletSlotNo: Math.max(0, Number(target?.slotNo) || 0),
            storagePalletNo: Math.max(0, Number(target?.slotNo) || 0),
            storagePalletLayer: target?.usesFloorStorage ? 0 : 1,
            storageVehicleInstanceId: '',
            storageVehiclePalletSlotNo: 0,
            storageVehiclePalletLayer: 0,
            storageSortingEquipmentKey: '',
            storageSortingPositionKey: '',
            storageWorkbenchFacilityKey: '',
            storageWorkbenchSlotKey: '',
            storageWorkbenchCargoSlotKey: '',
            storageBoxUnitNo: nextStorageBoxUnitNo,
            storageBoxVisualSlotNo: Math.max(0, Number(target?.visualSlotNo) || 0),
            storageBoxCount: fullBoxCount,
            storagePartialBoxCount: partialBoxCount,
            storageRemainderKg: partialBoxCount ? remainderKg : 0,
          };
        }));
      const autoMergeTargetMap = allocatedTargets.reduce((acc, target) => {
        const slotNo = Math.max(0, Math.floor(Number(target?.slotNo) || 0));
        if (slotNo <= 0) return acc;
        const mergeKey = `${slotNo}:${target?.usesFloorStorage ? 'floor' : 'pallet'}`;
        if (!acc.has(mergeKey)) {
          acc.set(mergeKey, {
            slotNo,
            isFloorStored: Boolean(target?.usesFloorStorage),
          });
        }
        return acc;
      }, new Map());
      const mergedWorkbenchOutput = mergeHarvestRemaindersInStorageSlots({
        storage: nextStorage,
        facilityKeyRaw: facilityKey,
        slotTargets: Array.from(autoMergeTargetMap.values()),
        nextStorageBoxUnitNoStart: nextStorageBoxUnitNo,
        inventoryByItemKey: nextInventory,
        facilityInventoryByItemKey: facilityInventory,
      });

      const cropLabel = String(crops?.[selectedSourceEntries[0]?.batch?.cropId || '']?.name || selectedSourceEntries[0]?.batch?.cropId || '수확물');
      const taskLabel = String(workbenchTaskLabelOf(selectedTaskKey) || '작업').replace(/^[^\s]+\s*/u, '').trim() || '작업';
      const nextState = {
        ...prev,
        labor: nextLabor,
        crewRents: externalLaborSpendResult.crewRents,
        storage: mergedWorkbenchOutput.storage,
        inventory: mergedWorkbenchOutput.inventoryByItemKey,
        logs: pushDiary(
          prev,
          `${taskLabel} 완료: ${cropLabel} ${selectedSourceEntries.length}박스 처리 (노동력 -${laborText(totalLaborCost)})`
        ),
        fieldFacilityInventoryByFieldId: fieldId
          ? {
            ...(prev.fieldFacilityInventoryByFieldId || {}),
            [fieldId]: {
              ...nextByFacility,
              [facilityKey]: mergedWorkbenchOutput.facilityInventoryByItemKey,
            },
          }
          : (prev.fieldFacilityInventoryByFieldId || {}),
      };
      processResult = {
        ok: true,
        alertMessage: '',
        processedBoxCount: selectedSourceEntries.length,
      };
      return nextState;
    });

    if (!processResult.ok && processResult.alertMessage) {
      setWindowAlert(processResult.alertMessage);
    }
    return processResult.ok;
  }, [
    allocateWorkbenchLaborAcrossWorkers,
    crops,
    harvestBoxCapacityKg,
    laborText,
    mergeHarvestRemaindersInStorageSlots,
    normalizeCargoByItemKey,
    normalizeFacilityScopedMap,
    normalizeHarvestGradeLabel,
    normalizedHarvestLoadBoxKey,
    resolveFieldFacilityInventoryByFacility,
    resolveWorkbenchTaskContext,
    roundLabor,
    setGame,
    setWindowAlert,
    spendExternalCrewLaborByWorkerMap,
    workbenchTaskLabelOf,
  ]);
}

export function useWarehouseSortingTaskRunner({
  activeFacilityStorageKey,
  allocateWorkbenchLaborAcrossWorkers,
  appleContainerLabelOf,
  buildSortingOutputPlacementPlan,
  crops,
  laborText,
  mergeHarvestRemaindersInStorageSlots,
  normalizeCargoByItemKey,
  normalizeFacilityScopedMap,
  normalizeHarvestGradeLabel,
  normalizedHarvestLoadBoxKey,
  resolveFieldFacilityInventoryByFacility,
  resolveSortingStartState,
  resolveSortingTaskContext,
  roundLabor,
  roundWorkbenchHarvestKg,
  sortingStartStateByEquipmentKey,
  spendExternalCrewLaborByWorkerMap,
  setFacilityStorageHarvestSlotByFacility,
  setGame,
  harvestBoxCapacityKg,
  setWindowAlert = (message) => window.alert(message),
}) {
  return useCallback((equipmentStorageKeyRaw) => {
    const facilityKey = String(activeFacilityStorageKey || '');
    const equipmentStorageKey = String(equipmentStorageKeyRaw || '');
    if (!facilityKey || !equipmentStorageKey) return false;
    const startState = sortingStartStateByEquipmentKey?.[equipmentStorageKey] || null;
    if (startState?.blockedReason) {
      setWindowAlert(startState.blockedReason);
      return false;
    }

    const createSortingResultBatchId = (baseIdRaw = 'harvest-batch') => {
      const baseId = String(baseIdRaw || 'harvest-batch');
      return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `${baseId}-sorting-${crypto.randomUUID()}`
        : `${baseId}-sorting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    };

    let processResult = {
      ok: false,
      alertMessage: '',
      processedBoxCount: 0,
      emptiedSourceSlotNo: 0,
    };

    setGame((prev) => {
      if (!prev || !Array.isArray(prev?.storage)) {
        processResult = { ok: false, alertMessage: '선별기 데이터를 불러오지 못했습니다.', processedBoxCount: 0 };
        return prev;
      }

      const storage = Array.isArray(prev.storage) ? prev.storage : [];
      const context = resolveSortingTaskContext(prev, facilityKey, equipmentStorageKey);
      const { fieldId, byFacility } = resolveFieldFacilityInventoryByFacility(prev, prev?.selectedField);
      const nextByFacility = fieldId ? normalizeFacilityScopedMap(byFacility || {}) : {};
      const facilityInventory = fieldId ? normalizeCargoByItemKey(nextByFacility[facilityKey] || {}) : {};
      const startStateFromPrev = resolveSortingStartState(context, facilityInventory);
      if (startStateFromPrev.blockedReason) {
        processResult = { ok: false, alertMessage: startStateFromPrev.blockedReason, processedBoxCount: 0 };
        return prev;
      }
      if (!context.estimatedOutputPieces.length) {
        processResult = { ok: false, alertMessage: '선별 결과를 만들 수 없습니다.', processedBoxCount: 0 };
        return prev;
      }
      const nextInventory = { ...(prev.inventory || {}) };

      Object.entries(context.returnableInputBoxCountsByItemKey).forEach(([itemKeyRaw, returnCountRaw]) => {
        const itemKey = normalizedHarvestLoadBoxKey(itemKeyRaw) || 'appleContainerYellow20kg';
        const returnCount = Math.max(0, Number(returnCountRaw) || 0);
        if (returnCount <= 0) return;
        facilityInventory[itemKey] = Math.max(0, Number(facilityInventory?.[itemKey]) || 0) + returnCount;
        nextInventory[itemKey] = Math.max(0, Number(nextInventory?.[itemKey]) || 0) + returnCount;
      });
      Object.entries(context.requiredAdditionalBoxCountsByItemKey).forEach(([itemKeyRaw, additionalNeededCountRaw]) => {
        const itemKey = normalizedHarvestLoadBoxKey(itemKeyRaw) || 'appleContainerYellow20kg';
        const additionalNeededCount = Math.max(0, Number(additionalNeededCountRaw) || 0);
        if (additionalNeededCount <= 0) return;
        facilityInventory[itemKey] = Math.max(0, Number(facilityInventory?.[itemKey]) || 0) - additionalNeededCount;
        nextInventory[itemKey] = Math.max(0, Number(nextInventory?.[itemKey]) || 0) - additionalNeededCount;
      });

      const insufficientContainerItemKey = Object.keys(facilityInventory).find((itemKey) => Number(facilityInventory?.[itemKey]) < 0)
        || Object.keys(nextInventory).find((itemKey) => Number(nextInventory?.[itemKey]) < 0)
        || '';
      if (insufficientContainerItemKey) {
        processResult = {
          ok: false,
          alertMessage: `${appleContainerLabelOf(insufficientContainerItemKey)} 재고가 부족합니다.`,
          processedBoxCount: 0,
        };
        return prev;
      }

      const laborAllocation = allocateWorkbenchLaborAcrossWorkers(context.assignedWorkerEntries, context.totalLaborCost);
      if (laborAllocation.remainingLabor > 0.001) {
        processResult = {
          ok: false,
          alertMessage: `배치 인원의 노동력이 부족합니다. (필요 ${laborText(context.totalLaborCost)} / 보유 ${laborText(context.totalAssignedLabor)})`,
          processedBoxCount: 0,
        };
        return prev;
      }
      const selfLaborNeed = roundLabor(Number(laborAllocation.spendByWorkerToken?.self) || 0);
      const externalLaborSpendMap = Object.fromEntries(
        context.assignedWorkerEntries
          .filter((entry) => String(entry?.workerType || '') === 'external' && String(entry?.workerId || ''))
          .map((entry) => [String(entry.workerId || ''), roundLabor(Number(laborAllocation.spendByWorkerToken?.[entry.workerToken]) || 0)])
          .filter(([, laborNeed]) => laborNeed > 0)
      );
      const externalLaborSpendResult = spendExternalCrewLaborByWorkerMap(prev, externalLaborSpendMap);
      const nextLabor = roundLabor((Number(prev?.labor) || 0) - selfLaborNeed);

      const sourceIndexSet = new Set(context.processableEntries.map((entry) => entry.index));
      const sourceBatchByIndex = new Map(context.processableEntries.map((entry) => ([entry.index, entry.batch])));
      const sourceSlotNo = Math.max(0, Math.floor(Number(context.inputSlotNo) || 0));
      const placementPlan = buildSortingOutputPlacementPlan({
        storage,
        facilityKey,
        outputSlotNos: context.outputSlotNos,
        outputRulesBySlotNo: context.outputRulesBySlotNo,
        sourceIndexSet,
        outputBoxes: context.estimatedOutputBoxes,
      });
      if (placementPlan.unplacedPieces.length > 0) {
        processResult = {
          ok: false,
          alertMessage: '배출칸 공간이 부족합니다.',
          processedBoxCount: 0,
        };
        return prev;
      }

      let nextStorageBoxUnitNo = storage.reduce(
        (max, batch) => Math.max(max, Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0))),
        0
      );
      const nextStorage = storage
        .filter((_, index) => !sourceIndexSet.has(index))
        .concat(placementPlan.placedEntries.map(({ box, target }) => {
          const sourceBatch = sourceBatchByIndex.get(box?.sourceIndex) || context.processableEntries[0]?.batch || {};
          const qtyKg = roundWorkbenchHarvestKg(box?.qty);
          nextStorageBoxUnitNo += 1;
          return {
            ...sourceBatch,
            id: createSortingResultBatchId(sourceBatch?.id || 'harvest-batch'),
            qty: qtyKg,
            stemRemoved: true,
            cropId: String(box?.cropId || sourceBatch?.cropId || ''),
            produceTypeLabel: String(box?.produceTypeLabel || sourceBatch?.produceTypeLabel || '사과'),
            quality: Math.max(0, Math.min(100, Number(box?.quality) || Number(sourceBatch?.quality) || 0)),
            loadBoxKey: String(box?.loadBoxKey || context.selectedOutputLoadBoxKey || sourceBatch?.loadBoxKey || 'appleContainerYellow20kg'),
            gradeLabel: normalizeHarvestGradeLabel(box?.gradeLabel || sourceBatch?.gradeLabel, '미선별') || '미선별',
            sizeLabel: String(box?.sizeLabel || sourceBatch?.sizeLabel || '').trim() || '미측정',
            palletized: !target?.usesFloorStorage,
            storageFacilityKey: facilityKey,
            storagePalletGroupId: target?.usesFloorStorage ? '' : `sorting-output:${facilityKey}:${target?.slotNo}:1`,
            storagePalletSlotNo: Math.max(0, Number(target?.slotNo) || 0),
            storagePalletNo: Math.max(0, Number(target?.slotNo) || 0),
            storagePalletLayer: target?.usesFloorStorage ? 0 : 1,
            storageVehicleInstanceId: '',
            storageVehiclePalletSlotNo: 0,
            storageVehiclePalletLayer: 0,
            storageSortingEquipmentKey: '',
            storageSortingPositionKey: '',
            storageWorkbenchFacilityKey: '',
            storageWorkbenchSlotKey: '',
            storageWorkbenchCargoSlotKey: '',
            storageBoxUnitNo: nextStorageBoxUnitNo,
            storageBoxVisualSlotNo: Math.max(0, Number(target?.visualSlotNo) || 0),
            storageBoxCount: Math.max(0, Math.floor((qtyKg + 0.001) / harvestBoxCapacityKg)),
            storagePartialBoxCount: (
              roundWorkbenchHarvestKg(
                Math.max(0, qtyKg - (Math.max(0, Math.floor((qtyKg + 0.001) / harvestBoxCapacityKg)) * harvestBoxCapacityKg))
              ) > 0.001
            ) ? 1 : 0,
            storageRemainderKg: roundWorkbenchHarvestKg(
              Math.max(0, qtyKg - (Math.max(0, Math.floor((qtyKg + 0.001) / harvestBoxCapacityKg)) * harvestBoxCapacityKg))
            ),
          };
        }));
      const sourceSlotStillHasBoxes = sourceSlotNo > 0 && nextStorage.some((batch) => {
        if (!batch) return false;
        if (String(batch?.storageFacilityKey || '') !== facilityKey) return false;
        if (String(batch?.storageVehicleInstanceId || '')) return false;
        if (String(batch?.storageSortingEquipmentKey || '') || String(batch?.storageWorkbenchSlotKey || '')) return false;
        return Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0)) === sourceSlotNo;
      });
      const autoMergeTargetMap = placementPlan.placedEntries.reduce((acc, { target }) => {
        const slotNo = Math.max(0, Math.floor(Number(target?.slotNo) || 0));
        if (slotNo <= 0) return acc;
        const mergeKey = `${slotNo}:${target?.usesFloorStorage ? 'floor' : 'pallet'}`;
        if (!acc.has(mergeKey)) {
          acc.set(mergeKey, {
            slotNo,
            isFloorStored: Boolean(target?.usesFloorStorage),
          });
        }
        return acc;
      }, new Map());
      const mergedSortingOutput = mergeHarvestRemaindersInStorageSlots({
        storage: nextStorage,
        facilityKeyRaw: facilityKey,
        slotTargets: Array.from(autoMergeTargetMap.values()),
        nextStorageBoxUnitNoStart: nextStorageBoxUnitNo,
        inventoryByItemKey: nextInventory,
        facilityInventoryByItemKey: facilityInventory,
      });

      const cropLabel = String(crops?.[context.processableEntries[0]?.batch?.cropId || '']?.name || context.processableEntries[0]?.batch?.cropId || '수확물');
      const nextState = {
        ...prev,
        labor: nextLabor,
        crewRents: externalLaborSpendResult.crewRents,
        storage: mergedSortingOutput.storage,
        inventory: mergedSortingOutput.inventoryByItemKey,
        logs: pushDiary(
          prev,
          `선별 완료: ${cropLabel} ${context.processableEntries.length}박스 처리 (노동력 -${laborText(context.totalLaborCost)})`
        ),
        fieldFacilityInventoryByFieldId: fieldId
          ? {
            ...(prev.fieldFacilityInventoryByFieldId || {}),
            [fieldId]: {
              ...nextByFacility,
              [facilityKey]: mergedSortingOutput.facilityInventoryByItemKey,
            },
          }
          : (prev.fieldFacilityInventoryByFieldId || {}),
      };
      processResult = {
        ok: true,
        alertMessage: '',
        processedBoxCount: context.processableEntries.length,
        emptiedSourceSlotNo: !sourceSlotStillHasBoxes ? sourceSlotNo : 0,
      };
      return nextState;
    });

    if (!processResult.ok && processResult.alertMessage) {
      setWindowAlert(processResult.alertMessage);
      return false;
    }
    if (processResult.ok && processResult.emptiedSourceSlotNo > 0) {
      setFacilityStorageHarvestSlotByFacility((prev) => {
        const currentSlotsRaw = Array.isArray(prev?.[facilityKey]) ? prev[facilityKey] : [];
        const nextSlots = [...currentSlotsRaw];
        nextSlots[processResult.emptiedSourceSlotNo - 1] = {
          itemKey: 'plasticPallet1100',
          sourceType: 'emptyPallet',
          sourceLabel: '빈 팔레트',
        };
        return {
          ...(prev || {}),
          [facilityKey]: nextSlots,
        };
      });
    }
    return processResult.ok;
  }, [
    activeFacilityStorageKey,
    allocateWorkbenchLaborAcrossWorkers,
    appleContainerLabelOf,
    buildSortingOutputPlacementPlan,
    crops,
    harvestBoxCapacityKg,
    laborText,
    mergeHarvestRemaindersInStorageSlots,
    normalizeCargoByItemKey,
    normalizeFacilityScopedMap,
    normalizeHarvestGradeLabel,
    normalizedHarvestLoadBoxKey,
    resolveFieldFacilityInventoryByFacility,
    resolveSortingStartState,
    resolveSortingTaskContext,
    roundLabor,
    roundWorkbenchHarvestKg,
    setFacilityStorageHarvestSlotByFacility,
    setGame,
    setWindowAlert,
    sortingStartStateByEquipmentKey,
    spendExternalCrewLaborByWorkerMap,
  ]);
}
