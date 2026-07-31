import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useWarehouseStorageTransportState({
  activeFacilityStorageKey,
  buildIndividualHarvestMovePickerState,
  facilityStorageFacilityTab,
  facilityStorageHarvestForkliftRows,
  facilityStorageHarvestMovePicker,
  facilityStorageSelectedTransportCanMovePallet,
  facilityStorageSelectedTransportDockInstanceId,
  facilityStorageSelectedTransportKey,
  facilityStorageSelectedTransportMode,
  facilityStorageSelectedTransportRow,
  facilityStorageTab,
  game,
  isForkliftMachineLike,
  normalizeVehiclePalletSlotsByInstance,
  resolveIndividualHarvestMoveSource,
  setFacilityStorageHarvestMovePicker,
  setFacilityStorageSelectedTransportKey,
  setFacilityStorageSelectedTransportMode,
}) {
  const [facilityStorageTransportDockPreviewSource, setFacilityStorageTransportDockPreviewSource] = useState(null);
  const [facilityStorageTransportDockMotion, setFacilityStorageTransportDockMotion] = useState(null);
  const [facilityStorageTransportDockSuppressedSourceKey, setFacilityStorageTransportDockSuppressedSourceKey] = useState('');
  const facilityStoragePrevTransportDockPreviewKeyRef = useRef('');

  const clearTransportDockSuppressedSourceKey = useCallback(() => {
    setFacilityStorageTransportDockSuppressedSourceKey('');
  }, []);

  const isSameFacilityStorageTransportLoadSource = useCallback((picker, sourceSpec = {}) => {
    if (!picker || !sourceSpec) return false;
    const pickerSourceType = String(picker?.sourceType || 'warehouse-slot');
    const sourceType = String(sourceSpec?.sourceType || 'warehouse-slot');
    if (pickerSourceType !== sourceType) return false;
    if (sourceType === 'vehicle-slot') {
      return String(picker?.sourceVehicleInstanceId || '') === String(sourceSpec?.sourceVehicleInstanceId || '')
        && Math.max(1, Math.floor(Number(picker?.sourceVehiclePalletSlotNo) || 1)) === Math.max(1, Math.floor(Number(sourceSpec?.sourceVehiclePalletSlotNo) || 1))
        && Boolean(picker?.sourceVehicleFloorStored || picker?.isFloorStored) === Boolean(sourceSpec?.sourceVehicleFloorStored || sourceSpec?.isFloorStored)
        && String(picker?.sourceLayerKey || 'bottom') === String(sourceSpec?.sourceLayerKey || 'bottom');
    }
    return Math.max(1, Math.floor(Number(picker?.sourceSlotNo) || 1)) === Math.max(1, Math.floor(Number(sourceSpec?.sourceSlotNo) || 1))
      && Boolean(picker?.sourceFloorStored || picker?.isFloorStored) === Boolean(sourceSpec?.sourceFloorStored || sourceSpec?.isFloorStored)
      && String(picker?.sourceLayerKey || 'bottom') === String(sourceSpec?.sourceLayerKey || 'bottom');
  }, []);

  const facilityStorageSelectedTransportDockStoredSource = useMemo(() => {
    const transportInstanceId = String(facilityStorageSelectedTransportDockInstanceId || '');
    const selectedTransportKey = String(facilityStorageSelectedTransportKey || '');
    if (!transportInstanceId) return null;
    const hasStoredBottomLayer = (Array.isArray(game?.storage) ? game.storage : []).some((batch) => (
      batch?.palletized
      && String(batch?.storageVehicleInstanceId || '') === transportInstanceId
      && Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0)) === 1
      && Math.max(1, Math.min(2, Math.floor(Number(batch?.storageVehiclePalletLayer || 1) || 1))) === 1
      && Math.max(0, Number(batch?.qty) || 0) > 0
    ));
    const hasLoadedEmptyPalletOnDock = Boolean(
      normalizeVehiclePalletSlotsByInstance(game?.vehiclePalletSlotsByInstance || {})?.[transportInstanceId]?.[1]
    );
    if (!hasStoredBottomLayer && !hasLoadedEmptyPalletOnDock) return null;
    return {
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: transportInstanceId,
      sourceVehiclePalletSlotNo: 1,
      sourceLayerKey: 'bottom',
      targetFacilityKey: String(activeFacilityStorageKey || ''),
      sourceTransportKey: selectedTransportKey,
      isEmptyPallet: !hasStoredBottomLayer && hasLoadedEmptyPalletOnDock,
      isEmptyPalletSnapshot: !hasStoredBottomLayer && hasLoadedEmptyPalletOnDock,
      isBuiltInEmptyPallet: false,
      sourceLabel: facilityStorageSelectedTransportRow?.sourceType === 'machine'
        ? `${facilityStorageSelectedTransportRow?.machine?.item?.name || facilityStorageSelectedTransportRow?.machine?.machineKey || '운반기구'}${Number(facilityStorageSelectedTransportRow?.machine?.unitNo) > 0 ? ` #${facilityStorageSelectedTransportRow.machine.unitNo}` : ''}`
        : String(facilityStorageSelectedTransportRow?.toolName || facilityStorageSelectedTransportRow?.toolMeta?.name || '운반기구')
    };
  }, [
    activeFacilityStorageKey,
    facilityStorageSelectedTransportDockInstanceId,
    facilityStorageSelectedTransportKey,
    facilityStorageSelectedTransportRow,
    game?.storage,
    game?.vehiclePalletSlotsByInstance,
    normalizeVehiclePalletSlotsByInstance,
  ]);

  const facilityStorageVisibleTransportDockPreviewSource = useMemo(() => {
    const previewSource = facilityStorageTransportDockPreviewSource || null;
    if (!previewSource) return null;
    const sourceType = String(previewSource?.sourceType || '');
    if (sourceType !== 'empty-pallet-stock') return previewSource;
    const previewSourceKey = [
      sourceType,
      String(previewSource?.sourceTransportKey || ''),
      String(previewSource?.sourceFacilityKey || ''),
      Math.max(1, Math.floor(Number(previewSource?.sourceStockSlotNo || previewSource?.sourceVehiclePalletSlotNo || previewSource?.sourceSlotNo) || 1)),
      String(previewSource?.sourceLayerKey || 'bottom'),
    ].join(':');
    if (previewSourceKey === String(facilityStorageTransportDockSuppressedSourceKey || '')) {
      return null;
    }
    return previewSource;
  }, [
    facilityStorageTransportDockPreviewSource,
    facilityStorageTransportDockSuppressedSourceKey,
  ]);

  const facilityStorageActiveHarvestMoveSource = useMemo(() => {
    const shouldUseStoredDockAsMoveSource = String(facilityStorageSelectedTransportMode || 'pallet') !== 'individual';
    const baseSource = shouldUseStoredDockAsMoveSource
      ? (
        facilityStorageSelectedTransportDockStoredSource
        || facilityStorageVisibleTransportDockPreviewSource
        || facilityStorageHarvestMovePicker
      )
      : (
        facilityStorageHarvestMovePicker
        || facilityStorageVisibleTransportDockPreviewSource
        || null
      );
    if (!baseSource) return null;
    const selectedTransportInstanceId = String(facilityStorageSelectedTransportDockInstanceId || '');
    const selectedTransportKey = String(facilityStorageSelectedTransportKey || '');
    const sourceType = String(baseSource?.sourceType || '');
    const sourceVehicleInstanceId = String(baseSource?.sourceVehicleInstanceId || '');
    const sourceVehiclePalletSlotNo = Math.max(1, Math.floor(Number(baseSource?.sourceVehiclePalletSlotNo || 1) || 1));
    const sourceTransportKey = String(baseSource?.sourceTransportKey || '');
    const sourceMatchesSelectedDock = sourceType === 'vehicle-slot'
      && sourceVehicleInstanceId
      && sourceVehicleInstanceId === selectedTransportInstanceId
      && sourceVehiclePalletSlotNo === 1
      && (!sourceTransportKey || sourceTransportKey === selectedTransportKey);
    const hasEmptyPalletOnSelectedDock = sourceMatchesSelectedDock
      && Boolean(
        normalizeVehiclePalletSlotsByInstance(game?.vehiclePalletSlotsByInstance || {})?.[sourceVehicleInstanceId]?.[sourceVehiclePalletSlotNo]
      );
    if (baseSource?.isTransportDockDisplayOnly) {
      const isEmptyPalletDisplaySource = Boolean(baseSource?.isEmptyPallet || baseSource?.isEmptyPalletSnapshot);
      if (!isEmptyPalletDisplaySource || !hasEmptyPalletOnSelectedDock) return null;
    }
    return {
      ...baseSource,
      sourceBoxCard: baseSource?.sourceBoxCard || null,
      selectedBoxCount: Math.max(0, Math.floor(Number(baseSource?.selectedBoxCount) || 0)),
    };
  }, [
    facilityStorageHarvestMovePicker,
    facilityStorageSelectedTransportDockInstanceId,
    facilityStorageSelectedTransportDockStoredSource,
    facilityStorageSelectedTransportKey,
    facilityStorageSelectedTransportMode,
    facilityStorageVisibleTransportDockPreviewSource,
    game?.vehiclePalletSlotsByInstance,
    normalizeVehiclePalletSlotsByInstance,
  ]);

  const facilityStorageActiveHarvestMoveTransportKey = String(
    facilityStorageActiveHarvestMoveSource?.sourceTransportKey || ''
  );
  const facilityStorageSelectedTransportMatchesActiveHarvestMove = !facilityStorageActiveHarvestMoveTransportKey
    || facilityStorageActiveHarvestMoveTransportKey === String(facilityStorageSelectedTransportKey || '');

  const facilityStorageSelectedTransportHasPalletOnDock = useMemo(() => {
    const selectedTransportKey = String(facilityStorageSelectedTransportKey || '');
    const transportInstanceId = String(facilityStorageSelectedTransportDockInstanceId || '');
    if (!selectedTransportKey || !transportInstanceId) return false;
    const hasStoredBottomLayer = (Array.isArray(game?.storage) ? game.storage : []).some((batch) => (
      batch?.palletized
      && String(batch?.storageVehicleInstanceId || '') === transportInstanceId
      && Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0)) === 1
      && Math.max(1, Math.min(2, Math.floor(Number(batch?.storageVehiclePalletLayer || 1) || 1))) === 1
      && Math.max(0, Number(batch?.qty) || 0) > 0
    ));
    const hasLoadedEmptyPalletOnDock = Boolean(
      normalizeVehiclePalletSlotsByInstance(game?.vehiclePalletSlotsByInstance || {})?.[transportInstanceId]?.[1]
    );
    const sourceCandidates = [
      facilityStorageVisibleTransportDockPreviewSource,
      facilityStorageSelectedTransportDockStoredSource,
    ].filter(Boolean);
    return hasStoredBottomLayer || hasLoadedEmptyPalletOnDock || sourceCandidates.some((previewSource) => {
      const previewSourceTransportKey = String(previewSource?.sourceTransportKey || '');
      return !previewSourceTransportKey || previewSourceTransportKey === selectedTransportKey;
    });
  }, [
    facilityStorageSelectedTransportDockInstanceId,
    facilityStorageSelectedTransportDockStoredSource,
    facilityStorageSelectedTransportKey,
    facilityStorageVisibleTransportDockPreviewSource,
    game?.storage,
    game?.vehiclePalletSlotsByInstance,
    normalizeVehiclePalletSlotsByInstance,
  ]);

  const currentFacilityStorageWarehouseSubTab = facilityStorageTab === 'facility'
    ? (
      facilityStorageFacilityTab === 'workbench'
        ? 'workbench'
        : (facilityStorageFacilityTab === 'sorting' ? 'sorting' : 'storage')
    )
    : 'storage';

  const chooseFacilityStorageTransportMode = useCallback((modeRaw) => {
    const requestedMode = String(modeRaw || '') === 'individual' ? 'individual' : 'pallet';
    const mode = facilityStorageSelectedTransportCanMovePallet ? requestedMode : 'individual';
    if (
      mode === 'individual'
      && facilityStorageSelectedTransportCanMovePallet
      && !facilityStorageSelectedTransportHasPalletOnDock
    ) {
      window.alert('개별 적재는 운반기구 적재칸에 팔레트를 먼저 실어야 선택할 수 있습니다.');
      return;
    }
    setFacilityStorageSelectedTransportMode(mode);
  }, [
    facilityStorageSelectedTransportCanMovePallet,
    facilityStorageSelectedTransportHasPalletOnDock,
    setFacilityStorageSelectedTransportMode,
  ]);

  useEffect(() => {
    if (String(facilityStorageSelectedTransportMode || 'pallet') !== 'individual') return;
    if (facilityStorageHarvestMovePicker) return;
    const storedSource = facilityStorageSelectedTransportDockStoredSource || null;
    if (!storedSource) return;
    if (storedSource?.isEmptyPallet || storedSource?.isEmptyPalletSnapshot) {
      setFacilityStorageHarvestMovePicker((prev) => (
        prev || {
          presentation: 'inline',
          warehouseSubTab: currentFacilityStorageWarehouseSubTab,
          sourceType: 'vehicle-slot',
          sourceFacilityKey: '',
          sourceSlotNo: 0,
          sourceVehicleInstanceId: String(storedSource?.sourceVehicleInstanceId || ''),
          sourceVehiclePalletSlotNo: Math.max(1, Math.floor(Number(storedSource?.sourceVehiclePalletSlotNo || 1) || 1)),
          sourceVehicleFloorStored: false,
          sourceLayerKey: 'bottom',
          sourceTransportKey: String(storedSource?.sourceTransportKey || facilityStorageSelectedTransportKey || ''),
          targetFacilityKey: String(activeFacilityStorageKey || storedSource?.targetFacilityKey || ''),
          pendingTarget: null,
          resumePendingTargetAfterCommit: null,
          selectedSourceCards: [],
          selectedBoxCount: 0,
          autoCommitToPendingTargetTick: 0,
          sourceBoxCard: null,
          sourceDomId: '',
          sourceWorkbenchSlotKey: '',
          sourceWorkbenchSlotLabel: '',
          sourceWorkbenchName: '',
          sourceCargoSlotKey: '',
          sourceCargoSlotLabel: '',
          preferredWorkbenchTargetSlotNo: 0,
          isEmptyPallet: true,
          isEmptyPalletSnapshot: true,
        }
      ));
      return;
    }
    const source = resolveIndividualHarvestMoveSource({
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: String(storedSource?.sourceVehicleInstanceId || ''),
      sourceVehiclePalletSlotNo: Math.max(1, Math.floor(Number(storedSource?.sourceVehiclePalletSlotNo || 1) || 1)),
      sourceLayerKey: String(storedSource?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom',
      sourceTransportKey: String(storedSource?.sourceTransportKey || facilityStorageSelectedTransportKey || ''),
    });
    if (!source) return;
    setFacilityStorageHarvestMovePicker((prev) => (
      prev || buildIndividualHarvestMovePickerState({
        prev,
        source,
        warehouseSubTab: currentFacilityStorageWarehouseSubTab,
        targetFacilityKey: String(activeFacilityStorageKey || storedSource?.targetFacilityKey || ''),
        sourceTransportKey: String(storedSource?.sourceTransportKey || facilityStorageSelectedTransportKey || ''),
        pendingTarget: null,
        selectedBoxCount: 0,
        autoCommitToPendingTargetTick: 0,
      })
    ));
  }, [
    activeFacilityStorageKey,
    buildIndividualHarvestMovePickerState,
    currentFacilityStorageWarehouseSubTab,
    facilityStorageHarvestMovePicker,
    facilityStorageSelectedTransportDockStoredSource,
    facilityStorageSelectedTransportKey,
    facilityStorageSelectedTransportMode,
    resolveIndividualHarvestMoveSource,
    setFacilityStorageHarvestMovePicker,
  ]);

  useEffect(() => {
    if (String(facilityStorageSelectedTransportMode || 'pallet') === 'individual') return;
    setFacilityStorageHarvestMovePicker((prev) => {
      if (!prev) return prev;
      if (prev?.pendingTarget) {
        return {
          ...prev,
          pendingTarget: null,
          autoCommitToPendingTargetTick: 0,
          selectedBoxCount: 0,
          selectedSourceCards: [],
        };
      }
      const sourceType = String(prev?.sourceType || '');
      const sourceVehicleInstanceId = String(prev?.sourceVehicleInstanceId || '');
      const sourceVehiclePalletSlotNo = Math.max(1, Math.floor(Number(prev?.sourceVehiclePalletSlotNo || 1) || 1));
      const sourceTransportKey = String(prev?.sourceTransportKey || '');
      const selectedTransportKey = String(facilityStorageSelectedTransportKey || '');
      const sourceMatchesSelectedDock = (
        sourceType === 'vehicle-slot'
        && sourceVehicleInstanceId
        && sourceVehicleInstanceId === String(facilityStorageSelectedTransportDockInstanceId || '')
        && sourceVehiclePalletSlotNo === 1
        && (!sourceTransportKey || sourceTransportKey === selectedTransportKey)
      );
      return sourceMatchesSelectedDock ? prev : null;
    });
    setFacilityStorageTransportDockPreviewSource((prev) => {
      if (!prev) return prev;
      const sourceType = String(prev?.sourceType || '');
      const sourceVehicleInstanceId = String(prev?.sourceVehicleInstanceId || '');
      const sourceVehiclePalletSlotNo = Math.max(1, Math.floor(Number(prev?.sourceVehiclePalletSlotNo || 1) || 1));
      if (
        sourceType === 'vehicle-slot'
        && sourceVehicleInstanceId
        && sourceVehicleInstanceId === String(facilityStorageSelectedTransportDockInstanceId || '')
        && sourceVehiclePalletSlotNo === 1
      ) {
        return prev;
      }
      return null;
    });
  }, [
    facilityStorageSelectedTransportDockInstanceId,
    facilityStorageSelectedTransportKey,
    facilityStorageSelectedTransportMode,
    setFacilityStorageHarvestMovePicker,
  ]);

  useEffect(() => {
    const transportInstanceId = String(facilityStorageSelectedTransportDockInstanceId || '');
    const selectedTransportKey = String(facilityStorageSelectedTransportKey || '');
    if (!transportInstanceId || !selectedTransportKey) return;
    const sourceMatchesSelectedTransport = (source) => {
      if (!source) return false;
      const sourceTransportKey = String(source?.sourceTransportKey || '');
      if (sourceTransportKey && sourceTransportKey !== selectedTransportKey) return false;
      return String(source?.sourceVehicleInstanceId || '') === transportInstanceId
        && Math.max(1, Math.floor(Number(source?.sourceVehiclePalletSlotNo || 1) || 1)) === 1;
    };
    if (
      sourceMatchesSelectedTransport(facilityStorageHarvestMovePicker)
      || sourceMatchesSelectedTransport(facilityStorageTransportDockPreviewSource)
    ) {
      return;
    }
    const hasEmptyPalletOnDock = Boolean(
      normalizeVehiclePalletSlotsByInstance(game?.vehiclePalletSlotsByInstance || {})?.[transportInstanceId]?.[1]
    );
    if (!hasEmptyPalletOnDock) return;
    const hasHarvestPalletOnDock = (Array.isArray(game?.storage) ? game.storage : []).some((batch) => (
      batch?.palletized
      && String(batch?.storageVehicleInstanceId || '') === transportInstanceId
      && Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0)) === 1
      && Math.max(1, Math.min(2, Math.floor(Number(batch?.storageVehiclePalletLayer || 1) || 1))) === 1
      && Math.max(0, Number(batch?.qty) || 0) > 0
    ));
    if (hasHarvestPalletOnDock) return;
    clearTransportDockSuppressedSourceKey();
    setFacilityStorageTransportDockPreviewSource({
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: transportInstanceId,
      sourceVehiclePalletSlotNo: 1,
      sourceLayerKey: 'bottom',
      sourceTransportKey: selectedTransportKey,
      sourceLabel: '운반기구',
      isEmptyPallet: true,
      isEmptyPalletSnapshot: true,
      isTransportDockDisplayOnly: true,
    });
  }, [
    clearTransportDockSuppressedSourceKey,
    facilityStorageHarvestMovePicker,
    facilityStorageSelectedTransportDockInstanceId,
    facilityStorageSelectedTransportKey,
    facilityStorageTransportDockPreviewSource,
    game?.storage,
    game?.vehiclePalletSlotsByInstance,
    normalizeVehiclePalletSlotsByInstance,
  ]);

  useEffect(() => {
    const previewSource = facilityStorageTransportDockPreviewSource || facilityStorageHarvestMovePicker || null;
    if (!previewSource?.isEmptyPallet && !previewSource?.isEmptyPalletSnapshot) return;
    const transportInstanceId = String(facilityStorageSelectedTransportDockInstanceId || '');
    const sourceVehicleInstanceId = String(previewSource?.sourceVehicleInstanceId || '');
    const sourceTransportKey = String(previewSource?.sourceTransportKey || '');
    if (!transportInstanceId || sourceVehicleInstanceId !== transportInstanceId) return;
    if (sourceTransportKey && sourceTransportKey !== String(facilityStorageSelectedTransportKey || '')) return;
    const sourceSlotNo = Math.max(1, Math.floor(Number(previewSource?.sourceVehiclePalletSlotNo || 1) || 1));
    const hasEmptyPalletOnDock = Boolean(
      normalizeVehiclePalletSlotsByInstance(game?.vehiclePalletSlotsByInstance || {})?.[transportInstanceId]?.[sourceSlotNo]
    );
    if (hasEmptyPalletOnDock) return;
    const hasHarvestPalletOnDock = (Array.isArray(game?.storage) ? game.storage : []).some((batch) => (
      batch?.palletized
      && String(batch?.storageVehicleInstanceId || '') === transportInstanceId
      && Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0)) === sourceSlotNo
      && Math.max(1, Math.min(2, Math.floor(Number(batch?.storageVehiclePalletLayer || 1) || 1))) === 1
      && Math.max(0, Number(batch?.qty) || 0) > 0
    ));
    if (hasHarvestPalletOnDock) return;
    const sourceMatchesSelectedDock = (source) => {
      if (!source) return false;
      const sourceType = String(source?.sourceType || '');
      if (sourceType !== 'vehicle-slot') return false;
      const sourceKey = String(source?.sourceTransportKey || '');
      return String(source?.sourceVehicleInstanceId || '') === transportInstanceId
        && Math.max(1, Math.floor(Number(source?.sourceVehiclePalletSlotNo || 1) || 1)) === sourceSlotNo
        && (!sourceKey || sourceKey === String(facilityStorageSelectedTransportKey || ''));
    };
    if (Boolean(previewSource?.isTransportDockDisplayOnly)) {
      setFacilityStorageTransportDockPreviewSource((prev) => (
        sourceMatchesSelectedDock(prev) ? null : prev
      ));
    }
    setFacilityStorageHarvestMovePicker((prev) => {
      if (!prev) return prev;
      if (!prev?.isEmptyPallet && !prev?.isEmptyPalletSnapshot) return prev;
      return sourceMatchesSelectedDock(prev) ? null : prev;
    });
  }, [
    facilityStorageHarvestMovePicker,
    facilityStorageSelectedTransportDockInstanceId,
    facilityStorageSelectedTransportKey,
    facilityStorageTransportDockPreviewSource,
    game?.storage,
    game?.vehiclePalletSlotsByInstance,
    normalizeVehiclePalletSlotsByInstance,
    setFacilityStorageHarvestMovePicker,
  ]);

  const chooseFacilityStorageTransport = useCallback((transportKeyRaw) => {
    const transportKey = String(transportKeyRaw || '');
    const prevSelectedTransportKey = String(facilityStorageSelectedTransportKey || '');
    setFacilityStorageSelectedTransportKey(transportKey);
    if (transportKey === prevSelectedTransportKey) return;
    const selectedRow = facilityStorageHarvestForkliftRows
      .find((row) => String(row?.key || '') === transportKey) || null;
    if (!selectedRow) return;
    const canMovePallet = selectedRow.sourceType === 'machine'
      ? isForkliftMachineLike(selectedRow.machine)
      : String(selectedRow?.toolKey || '') === 'palletJack';
    setFacilityStorageSelectedTransportMode(canMovePallet ? 'pallet' : 'individual');
  }, [
    facilityStorageHarvestForkliftRows,
    facilityStorageSelectedTransportKey,
    isForkliftMachineLike,
    setFacilityStorageSelectedTransportKey,
    setFacilityStorageSelectedTransportMode,
  ]);

  useEffect(() => {
    if (!facilityStorageSelectedTransportRow) return;
    if (facilityStorageSelectedTransportCanMovePallet) return;
    if (String(facilityStorageSelectedTransportMode || 'pallet') !== 'pallet') return;
    setFacilityStorageSelectedTransportMode('individual');
  }, [
    facilityStorageSelectedTransportCanMovePallet,
    facilityStorageSelectedTransportMode,
    facilityStorageSelectedTransportRow,
    setFacilityStorageSelectedTransportMode,
  ]);

  return {
    chooseFacilityStorageTransport,
    chooseFacilityStorageTransportMode,
    clearTransportDockSuppressedSourceKey,
    currentFacilityStorageWarehouseSubTab,
    facilityStorageActiveHarvestMoveSource,
    facilityStoragePrevTransportDockPreviewKeyRef,
    facilityStorageSelectedTransportHasPalletOnDock,
    facilityStorageSelectedTransportMatchesActiveHarvestMove,
    facilityStorageSelectedTransportDockStoredSource,
    facilityStorageTransportDockMotion,
    facilityStorageTransportDockPreviewSource,
    facilityStorageTransportDockSuppressedSourceKey,
    facilityStorageVisibleTransportDockPreviewSource,
    isSameFacilityStorageTransportLoadSource,
    setFacilityStorageTransportDockMotion,
    setFacilityStorageTransportDockPreviewSource,
    setFacilityStorageTransportDockSuppressedSourceKey,
  };
}
