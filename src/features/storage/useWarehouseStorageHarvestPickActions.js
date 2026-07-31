import { useCallback } from 'react';

export function useWarehouseStorageHarvestPickActions({
  activeFacilityStorageKey,
  appendBugReportActionTrace,
  buildActionLogBaseMetadata,
  buildHarvestSourceBoxCardFromStoredLayer,
  buildIndividualHarvestMovePickerState,
  canReuseFacilityStorageTransportLoad,
  clearTransportDockSuppressedSourceKey,
  currentFacilityStorageWarehouseSubTab,
  facilityStorageHarvestDetailOpen,
  facilityStorageHarvestMovePicker,
  facilityStorageHasSelectedTransportEarly,
  facilityStorageSelectedCarrier,
  facilityStorageSelectedCarrierPalletSlotRows,
  facilityStorageSelectedTransportDockCapacityBoxesEarly,
  facilityStorageSelectedTransportDockInstanceIdEarly,
  facilityStorageSelectedTransportDockStoredSource,
  facilityStorageSelectedTransportIndividualCarryLimitEarly,
  facilityStorageSelectedTransportKey,
  facilityStorageSelectedTransportMode,
  facilityStorageTransportDockPreviewSource,
  game,
  getFacilityStorageIndividualNeonTarget,
  harvestBoxVisualSlotNoFromDomId,
  harvestBoxesPerPallet,
  harvestPalletFilledBoxCount,
  harvestPalletLoadLabel,
  moveHarvestPalletToSelectedTransportDock,
  normalizeVehiclePalletSlotsByInstance,
  resolveIndividualHarvestMoveSource,
  setFacilityStorageHarvestDetailLayer,
  setFacilityStorageHarvestDetailSlotNo,
  setFacilityStorageHarvestDetailSource,
  setFacilityStorageHarvestMovePicker,
  setFacilityStorageTransportDockPreviewSource,
  setGame,
  vehicleSlotFloorBoxCapacity,
}) {
  const pickIndividualCarrierHarvestBoxToTransport = useCallback((slotNoRaw, layerKeyRaw = 'bottom', sourceDomIdRaw = '') => {
    if (!facilityStorageHasSelectedTransportEarly) {
      window.alert('운반기구를 먼저 선택해 주세요.');
      return;
    }
    const carryLimit = Math.max(0, Math.floor(Number(facilityStorageSelectedTransportIndividualCarryLimitEarly) || 0));
    if (carryLimit <= 0) return;
    const sourcePayload = slotNoRaw && typeof slotNoRaw === 'object' ? slotNoRaw : null;
    const carrierId = String(facilityStorageSelectedCarrier?.id || '');
    const slotNo = Math.max(1, Math.floor(Number(sourcePayload?.sourceVehiclePalletSlotNo || slotNoRaw) || 1));
    const sourceLayerKey = String(sourcePayload?.sourceLayerKey || layerKeyRaw || 'bottom') === 'top' ? 'top' : 'bottom';
    const sourceDomId = String(sourcePayload?.sourceDomId || sourceDomIdRaw || '');
    const slot = facilityStorageSelectedCarrierPalletSlotRows.find((row) => Number(row?.slotNo) === slotNo) || null;
    if (!carrierId || !slot || slot.slotType !== 'harvest') return;
    if (slot?.hasTopLayer) return;
    const source = resolveIndividualHarvestMoveSource({
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: carrierId,
      sourceVehiclePalletSlotNo: slotNo,
      sourceLayerKey,
      sourceVehicleFloorStored: Boolean(slot?.isFloorStored),
      sourceVisualSlotNo: Math.max(0, Math.floor(Number(sourcePayload?.sourceVisualSlotNo || sourcePayload?.sourceDisplaySlotNo) || 0)),
      sourceBatchId: String(sourcePayload?.sourceBatchId || ''),
      sourceBoxUnitNo: Math.max(0, Math.floor(Number(sourcePayload?.sourceBoxUnitNo) || 0)),
      sourceDomId,
    });
    const sourceBoxCard = source?.sourceBoxCard || null;
    if (!sourceBoxCard) {
      window.alert('이 팔레트는 현재 개별 상자 선택을 바로 계산할 수 없습니다.');
      return;
    }
    if (!canReuseFacilityStorageTransportLoad({
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: carrierId,
      sourceVehiclePalletSlotNo: slotNo,
      sourceLayerKey,
      sourceVehicleFloorStored: Boolean(slot?.isFloorStored),
    }, {
      mode: 'individual',
    })) {
      return;
    }
    const sourceMaxCount = Math.max(1, Math.floor(Number(source?.sourceMaxCount) || 1));
    setFacilityStorageTransportDockPreviewSource({
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: carrierId,
      sourceVehiclePalletSlotNo: slotNo,
      sourceLayerKey,
      sourceVehicleFloorStored: Boolean(slot?.isFloorStored),
      sourceDomId,
      sourceTransportKey: String(facilityStorageSelectedTransportKey || ''),
    });
    setFacilityStorageHarvestMovePicker((prev) => {
      const sameSource = prev
        && String(prev?.sourceType || '') === 'vehicle-slot'
        && String(prev?.sourceVehicleInstanceId || '') === carrierId
        && Math.max(1, Math.floor(Number(prev?.sourceVehiclePalletSlotNo) || 1)) === slotNo
        && String(prev?.sourceLayerKey || 'bottom') === sourceLayerKey;
      const hasPendingTarget = Boolean(prev?.pendingTarget);
      const nextSelectedBoxCount = hasPendingTarget
        ? 1
        : sameSource
          ? Math.min(
            sourceMaxCount,
            carryLimit,
            Math.max(0, Math.floor(Number(prev?.selectedBoxCount) || 0)) + 1
          )
          : 1;
      return buildIndividualHarvestMovePickerState({
        prev,
        source,
        warehouseSubTab: currentFacilityStorageWarehouseSubTab,
        targetFacilityKey: String(activeFacilityStorageKey || ''),
        sourceTransportKey: String(facilityStorageSelectedTransportKey || ''),
        pendingTarget: prev?.pendingTarget || null,
        selectedBoxCount: nextSelectedBoxCount,
        autoCommitToPendingTargetTick: hasPendingTarget ? Date.now() : 0,
      });
    });
    if (facilityStorageHarvestDetailOpen) {
      setFacilityStorageHarvestDetailSlotNo(0);
      setFacilityStorageHarvestDetailSource(null);
      setFacilityStorageHarvestDetailLayer('bottom');
    }
  }, [
    activeFacilityStorageKey,
    buildIndividualHarvestMovePickerState,
    currentFacilityStorageWarehouseSubTab,
    canReuseFacilityStorageTransportLoad,
    facilityStorageHarvestDetailOpen,
    facilityStorageHasSelectedTransportEarly,
    facilityStorageSelectedCarrier,
    facilityStorageSelectedCarrierPalletSlotRows,
    facilityStorageSelectedTransportIndividualCarryLimitEarly,
    facilityStorageSelectedTransportKey,
    resolveIndividualHarvestMoveSource,
    setFacilityStorageHarvestDetailLayer,
    setFacilityStorageHarvestDetailSlotNo,
    setFacilityStorageHarvestDetailSource,
    setFacilityStorageHarvestMovePicker,
    setFacilityStorageTransportDockPreviewSource
  ]);

  const loadCarrierHarvestPalletToSelectedTransportDock = useCallback((slotNoRaw, layerKeyRaw = 'bottom') => {
    if (!facilityStorageHasSelectedTransportEarly) {
      window.alert('운반기구를 먼저 선택해 주세요.');
      return;
    }
    const carrierId = String(facilityStorageSelectedCarrier?.id || '');
    const slotNo = Math.max(1, Math.floor(Number(slotNoRaw) || 1));
    const sourceLayerKey = String(layerKeyRaw || 'bottom') === 'top' ? 'top' : 'bottom';
    const slot = facilityStorageSelectedCarrierPalletSlotRows.find((row) => Number(row?.slotNo) === slotNo) || null;
    if (!carrierId || !slot || slot.slotType !== 'harvest' || slot?.isFloorStored) return;
    if (!canReuseFacilityStorageTransportLoad({
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: carrierId,
      sourceVehiclePalletSlotNo: slotNo,
      sourceLayerKey,
    }, {
      mode: 'pallet',
    })) {
      return;
    }
    moveHarvestPalletToSelectedTransportDock({
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: carrierId,
      sourceVehiclePalletSlotNo: slotNo,
      sourceLayerKey,
      previewFilledBoxCount: harvestPalletFilledBoxCount(slot),
      previewBoxTones: Array.isArray(slot?.filledBoxSlotTones)
        ? slot.filledBoxSlotTones.slice(0, harvestBoxesPerPallet)
        : [],
      previewLoadLabel: harvestPalletLoadLabel(slot),
    });
  }, [
    canReuseFacilityStorageTransportLoad,
    facilityStorageHasSelectedTransportEarly,
    facilityStorageSelectedCarrier,
    facilityStorageSelectedCarrierPalletSlotRows,
    harvestBoxesPerPallet,
    harvestPalletFilledBoxCount,
    harvestPalletLoadLabel,
    moveHarvestPalletToSelectedTransportDock,
  ]);

  const loadCarrierEmptyPalletToSelectedTransportDock = useCallback((slotNoRaw) => {
    if (!facilityStorageHasSelectedTransportEarly) {
      window.alert('운반기구를 먼저 선택해 주세요.');
      return;
    }
    const carrierId = String(facilityStorageSelectedCarrier?.id || '');
    const slotNo = Math.max(1, Math.floor(Number(slotNoRaw) || 1));
    const slot = facilityStorageSelectedCarrierPalletSlotRows.find((row) => Number(row?.slotNo) === slotNo) || null;
    if (!carrierId || !slot || slot.slotType !== 'emptyPallet') return;
    if (!canReuseFacilityStorageTransportLoad({
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: carrierId,
      sourceVehiclePalletSlotNo: slotNo,
      sourceLayerKey: 'bottom',
    }, {
      mode: 'pallet',
    })) {
      return;
    }
    const transportInstanceId = String(facilityStorageSelectedTransportDockInstanceIdEarly || '');
    if (!transportInstanceId) return;
    const currentStorage = Array.isArray(game?.storage) ? game.storage : [];
    const hasHarvestPalletOnDock = currentStorage.some((batch) => (
      batch?.palletized
      && String(batch?.storageVehicleInstanceId || '') === transportInstanceId
      && Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0)) === 1
      && Math.max(1, Math.min(2, Math.floor(Number(batch?.storageVehiclePalletLayer || 1) || 1))) === 1
      && Math.max(0, Number(batch?.qty) || 0) > 0
    ));
    const hasEmptyPalletOnDock = Boolean(
      normalizeVehiclePalletSlotsByInstance(game?.vehiclePalletSlotsByInstance || {})?.[transportInstanceId]?.[1]
    );
    if (hasHarvestPalletOnDock || hasEmptyPalletOnDock) {
      window.alert('운반기구 적재칸에 이미 팔레트가 실려 있습니다. 먼저 내려놓아 주세요.');
      return;
    }
    clearTransportDockSuppressedSourceKey?.();
    setGame((prev) => {
      if (!prev) return prev;
      const nextVehiclePalletSlotsByInstance = { ...(prev.vehiclePalletSlotsByInstance || {}) };
      const carrierSlots = { ...(nextVehiclePalletSlotsByInstance[carrierId] || {}) };
      delete carrierSlots[slotNo];
      if (Object.keys(carrierSlots).length > 0) nextVehiclePalletSlotsByInstance[carrierId] = carrierSlots;
      else delete nextVehiclePalletSlotsByInstance[carrierId];
      nextVehiclePalletSlotsByInstance[transportInstanceId] = {
        ...(nextVehiclePalletSlotsByInstance[transportInstanceId] || {}),
        1: { itemKey: 'plasticPallet1100' }
      };
      return {
        ...prev,
        vehiclePalletSlotsByInstance: nextVehiclePalletSlotsByInstance,
      };
    });
    setFacilityStorageHarvestMovePicker({
      presentation: 'inline',
      warehouseSubTab: currentFacilityStorageWarehouseSubTab,
      sourceType: 'vehicle-slot',
      sourceFacilityKey: '',
      sourceSlotNo: 0,
      sourceVehicleInstanceId: transportInstanceId,
      sourceVehiclePalletSlotNo: 1,
      sourceLayerKey: 'bottom',
      sourceTransportKey: String(facilityStorageSelectedTransportKey || ''),
      targetFacilityKey: String(activeFacilityStorageKey || ''),
      isEmptyPallet: true,
      isEmptyPalletSnapshot: true,
      emptyPalletOrigin: 'vehicle-slot',
      emptyPalletOriginVehicleInstanceId: carrierId,
      emptyPalletOriginVehiclePalletSlotNo: slotNo,
      pendingTarget: null,
      resumePendingTargetAfterCommit: null,
      selectedSourceCards: [],
      selectedBoxCount: 0,
      sourceBoxCard: null,
    });
    setFacilityStorageTransportDockPreviewSource({
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: transportInstanceId,
      sourceVehiclePalletSlotNo: 1,
      sourceLayerKey: 'bottom',
      sourceTransportKey: String(facilityStorageSelectedTransportKey || ''),
      targetFacilityKey: String(activeFacilityStorageKey || ''),
      sourceLabel: '운반기구',
      isEmptyPallet: true,
      isEmptyPalletSnapshot: true,
      emptyPalletOrigin: 'vehicle-slot',
      emptyPalletOriginVehicleInstanceId: carrierId,
      emptyPalletOriginVehiclePalletSlotNo: slotNo,
    });
    if (facilityStorageHarvestDetailOpen) {
      setFacilityStorageHarvestDetailSlotNo(0);
      setFacilityStorageHarvestDetailSource(null);
      setFacilityStorageHarvestDetailLayer('bottom');
    }
  }, [
    activeFacilityStorageKey,
    canReuseFacilityStorageTransportLoad,
    clearTransportDockSuppressedSourceKey,
    currentFacilityStorageWarehouseSubTab,
    facilityStorageHarvestDetailOpen,
    facilityStorageHasSelectedTransportEarly,
    facilityStorageSelectedCarrier,
    facilityStorageSelectedCarrierPalletSlotRows,
    facilityStorageSelectedTransportDockInstanceIdEarly,
    facilityStorageSelectedTransportKey,
    game?.storage,
    game?.vehiclePalletSlotsByInstance,
    normalizeVehiclePalletSlotsByInstance,
    setFacilityStorageHarvestDetailLayer,
    setFacilityStorageHarvestDetailSlotNo,
    setFacilityStorageHarvestDetailSource,
    setFacilityStorageHarvestMovePicker,
    setFacilityStorageTransportDockPreviewSource,
    setGame,
  ]);

  const pickIndividualTransportDockHarvestBoxToTransport = useCallback((sourcePickPayloadRaw = '') => {
    appendBugReportActionTrace({
      action: 'harvest.transport_dock_box_pick.requested',
      result: 'info',
      metadata: {
        ...buildActionLogBaseMetadata(),
        label: '운반기구 적재칸 개별박스 클릭',
        payloadType: typeof sourcePickPayloadRaw,
        sourceInputEventType: String(sourcePickPayloadRaw?.sourceInputEventType || ''),
      },
    });
    if (!facilityStorageHasSelectedTransportEarly) {
      appendBugReportActionTrace({
        action: 'harvest.transport_dock_box_pick.blocked',
        result: 'blocked',
        metadata: {
          ...buildActionLogBaseMetadata(),
          label: '운반기구 미선택',
        },
      });
      window.alert('운반기구를 먼저 선택해 주세요.');
      return;
    }
    const neonTarget = getFacilityStorageIndividualNeonTarget([
      'vehicle-slot',
      'warehouse-empty',
      'warehouse-floor-harvest',
      'warehouse-empty-pallet',
      'warehouse-harvest-pallet',
    ]);
    if (!neonTarget) {
      appendBugReportActionTrace({
        action: 'harvest.transport_dock_box_pick.blocked',
        result: 'blocked',
        metadata: {
          ...buildActionLogBaseMetadata(),
          label: '네온 결합 대상 없음',
        },
      });
      return;
    }
    const carryLimit = Math.max(0, Math.floor(Number(facilityStorageSelectedTransportIndividualCarryLimitEarly) || 0));
    if (carryLimit <= 0) {
      appendBugReportActionTrace({
        action: 'harvest.transport_dock_box_pick.blocked',
        result: 'blocked',
        metadata: {
          ...buildActionLogBaseMetadata(),
          label: '개별 운반 한도 0',
        },
      });
      return;
    }
    const sourcePickPayload = sourcePickPayloadRaw && typeof sourcePickPayloadRaw === 'object'
      ? sourcePickPayloadRaw
      : { sourceDomId: String(sourcePickPayloadRaw || '') };
    const previewSource = facilityStorageSelectedTransportDockStoredSource
      || facilityStorageTransportDockPreviewSource
      || null;
    const hasSelectedDockStoredSource = Boolean(
      facilityStorageSelectedTransportDockStoredSource
      && String(facilityStorageSelectedTransportDockStoredSource?.sourceType || '') === 'vehicle-slot'
    );
    const sourceType = hasSelectedDockStoredSource
      ? 'vehicle-slot'
      : String(sourcePickPayload?.sourceType || previewSource?.sourceType || 'vehicle-slot');
    const carrierId = String(
      sourcePickPayload?.sourceVehicleInstanceId
      || previewSource?.sourceVehicleInstanceId
      || facilityStorageSelectedTransportDockInstanceIdEarly
      || ''
    );
    const slotNo = Math.max(
      1,
      Math.floor(
        Number(sourcePickPayload?.sourceVehiclePalletSlotNo || previewSource?.sourceVehiclePalletSlotNo)
        || 1
      )
    );
    const sourceLayerKey = String(sourcePickPayload?.sourceLayerKey || previewSource?.sourceLayerKey || 'bottom') === 'top'
      ? 'top'
      : 'bottom';
    const sourceVisualSlotNo = Math.max(
      0,
      Math.min(
        Boolean(sourcePickPayload?.sourceVehicleFloorStored || sourcePickPayload?.isFloorStored)
          ? vehicleSlotFloorBoxCapacity
          : harvestBoxesPerPallet,
        Math.floor(Number(sourcePickPayload?.sourceVisualSlotNo) || harvestBoxVisualSlotNoFromDomId(sourcePickPayload?.sourceDomId || ''))
      )
    );
    const sourceDisplaySlotNo = Math.max(
      0,
      Math.min(
        Boolean(sourcePickPayload?.sourceVehicleFloorStored || sourcePickPayload?.isFloorStored)
          ? vehicleSlotFloorBoxCapacity
          : harvestBoxesPerPallet,
        Math.floor(Number(sourcePickPayload?.sourceDisplaySlotNo) || 0)
      )
    );
    const requestedSourceVisualSlotNo = Math.max(
      0,
      sourceVisualSlotNo || sourceDisplaySlotNo
    );
    if (!carrierId || sourceType !== 'vehicle-slot') {
      appendBugReportActionTrace({
        action: 'harvest.transport_dock_box_pick.blocked',
        result: 'blocked',
        metadata: {
          ...buildActionLogBaseMetadata(),
          label: '운반기구 소스 불일치',
          sourceType,
          payloadSourceType: String(sourcePickPayload?.sourceType || ''),
          previewSourceType: String(previewSource?.sourceType || ''),
          hasSelectedDockStoredSource,
          carrierId,
        },
      });
      return;
    }
    const source = resolveIndividualHarvestMoveSource({
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: carrierId,
      sourceVehiclePalletSlotNo: slotNo,
      sourceLayerKey,
      sourceVehicleFloorStored: Boolean(sourcePickPayload?.sourceVehicleFloorStored || sourcePickPayload?.isFloorStored),
      sourceVisualSlotNo: requestedSourceVisualSlotNo,
      sourceBatchId: String(sourcePickPayload?.sourceBatchId || ''),
      sourceBoxUnitNo: Math.max(0, Math.floor(Number(sourcePickPayload?.sourceBoxUnitNo) || 0)),
      sourceDomId: String(sourcePickPayload?.sourceDomId || ''),
    });
    const resolvedSourceVisualSlotNo = requestedSourceVisualSlotNo;
    const sourceBoxCard = source?.sourceBoxCard || null;
    if (!sourceBoxCard) {
      appendBugReportActionTrace({
        action: 'harvest.transport_dock_box_pick.blocked',
        result: 'blocked',
        metadata: {
          ...buildActionLogBaseMetadata(),
          label: '소스 박스카드 없음',
          sourceType,
          carrierId,
          slotNo,
          sourceLayerKey,
          sourceVisualSlotNo,
          sourceDisplaySlotNo,
          requestedSourceVisualSlotNo,
          sourceBatchId: String(sourcePickPayload?.sourceBatchId || ''),
          sourceBoxUnitNo: Math.max(0, Math.floor(Number(sourcePickPayload?.sourceBoxUnitNo) || 0)),
          previewSourceType: String(previewSource?.sourceType || ''),
        },
      });
      return;
    }
    const sourceMaxCount = Math.max(1, Math.floor(Number(source?.sourceMaxCount) || 1));
    setFacilityStorageHarvestMovePicker((prev) => {
      const sameSource = prev
        && String(prev?.sourceType || '') === 'vehicle-slot'
        && String(prev?.sourceVehicleInstanceId || '') === carrierId
        && Math.max(1, Math.floor(Number(prev?.sourceVehiclePalletSlotNo) || 1)) === slotNo
        && String(prev?.sourceLayerKey || 'bottom') === sourceLayerKey;
      const preservedPendingTarget = sameSource
        ? (prev?.pendingTarget || neonTarget || null)
        : (neonTarget || null);
      return buildIndividualHarvestMovePickerState({
        prev,
        source,
        warehouseSubTab: currentFacilityStorageWarehouseSubTab,
        sourceTransportKey: String(facilityStorageSelectedTransportKey || carrierId),
        targetFacilityKey: String(activeFacilityStorageKey || ''),
        pendingTarget: preservedPendingTarget,
        resumePendingTargetAfterCommit: null,
        selectedBoxCount: Math.min(sourceMaxCount, carryLimit, 1),
        autoCommitToPendingTargetTick: preservedPendingTarget ? Date.now() : 0,
      });
    });
    appendBugReportActionTrace({
      action: 'harvest.transport_dock_box_pick.accepted',
      result: 'success',
      metadata: {
        ...buildActionLogBaseMetadata(),
        label: '운반기구 적재칸 개별박스 선택 수락',
        sourceType,
        carrierId,
        slotNo,
        sourceLayerKey,
        sourceVisualSlotNo,
        sourceDisplaySlotNo,
        resolvedSourceVisualSlotNo,
      },
    });
  }, [
    activeFacilityStorageKey,
    appendBugReportActionTrace,
    buildActionLogBaseMetadata,
    buildIndividualHarvestMovePickerState,
    currentFacilityStorageWarehouseSubTab,
    facilityStorageHasSelectedTransportEarly,
    facilityStorageSelectedTransportDockStoredSource,
    facilityStorageSelectedTransportDockInstanceIdEarly,
    facilityStorageSelectedTransportIndividualCarryLimitEarly,
    facilityStorageSelectedTransportKey,
    facilityStorageTransportDockPreviewSource,
    getFacilityStorageIndividualNeonTarget,
    harvestBoxVisualSlotNoFromDomId,
    harvestBoxesPerPallet,
    resolveIndividualHarvestMoveSource,
    setFacilityStorageHarvestMovePicker,
    vehicleSlotFloorBoxCapacity
  ]);

  const pickIndividualHarvestBoxToSelectedTransportDock = useCallback((sourceSpecRaw = null) => {
    if (!facilityStorageHasSelectedTransportEarly) return;
    const neonTarget = getFacilityStorageIndividualNeonTarget([
      'vehicle-slot',
      'warehouse-empty',
      'warehouse-floor-harvest',
      'warehouse-empty-pallet',
      'warehouse-harvest-pallet',
    ]);
    if (!neonTarget) return;
    const carryLimit = Math.max(0, Math.floor(Number(facilityStorageSelectedTransportIndividualCarryLimitEarly) || 0));
    if (carryLimit <= 0) return;
    const sourceSpec = sourceSpecRaw && typeof sourceSpecRaw === 'object' ? sourceSpecRaw : null;
    const sourceType = String(sourceSpec?.sourceType || '');
    const sourceLayerKey = String(sourceSpec?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
    const sourceVisualSlotNo = Math.max(
      0,
      Math.min(
        Boolean(sourceSpec?.sourceVehicleFloorStored || sourceSpec?.isFloorStored)
          ? vehicleSlotFloorBoxCapacity
          : harvestBoxesPerPallet,
        Math.floor(Number(sourceSpec?.sourceVisualSlotNo) || harvestBoxVisualSlotNoFromDomId(sourceSpec?.sourceDomId || ''))
      )
    );
    const source = ['warehouse-slot', 'vehicle-slot'].includes(sourceType)
      ? resolveIndividualHarvestMoveSource({
        sourceType,
        sourceFacilityKey: String(activeFacilityStorageKey || ''),
        sourceSlotNo: Math.max(1, Math.floor(Number(sourceSpec?.sourceSlotNo) || 1)),
        sourceVehicleInstanceId: String(sourceSpec?.sourceVehicleInstanceId || ''),
        sourceVehiclePalletSlotNo: Math.max(1, Math.floor(Number(sourceSpec?.sourceVehiclePalletSlotNo) || 1)),
        sourceLayerKey,
        sourceVehicleFloorStored: Boolean(sourceSpec?.sourceVehicleFloorStored || sourceSpec?.isFloorStored),
        sourceVisualSlotNo,
        sourceBatchId: String(sourceSpec?.sourceBatchId || ''),
        sourceBoxUnitNo: Math.max(0, Math.floor(Number(sourceSpec?.sourceBoxUnitNo) || 0)),
        sourceDomId: String(sourceSpec?.sourceDomId || ''),
      })
      : null;
    const sourceBoxCard = source?.sourceBoxCard || null;
    if (!sourceBoxCard) return;
    const transportPreview = facilityStorageTransportDockPreviewSource
      || facilityStorageSelectedTransportDockStoredSource
      || null;
    const targetVehicleInstanceId = String(
      facilityStorageSelectedTransportDockInstanceIdEarly
      || transportPreview?.sourceVehicleInstanceId
      || ''
    );
    if (!targetVehicleInstanceId) {
      window.alert('선택한 운반기구 정보를 확인할 수 없습니다.');
      return;
    }
    const targetVehiclePalletSlotNo = Math.max(1, Math.floor(Number(transportPreview?.sourceVehiclePalletSlotNo || 1) || 1));
    const targetVehicleFloorStored = Boolean(transportPreview?.sourceVehicleFloorStored || transportPreview?.isFloorStored);
    const transportDockStoredCard = buildHarvestSourceBoxCardFromStoredLayer({
      sourceType: 'vehicle-slot',
      vehicleInstanceId: targetVehicleInstanceId,
      vehiclePalletSlotNo: targetVehiclePalletSlotNo,
      layerKey: 'bottom',
      sourceVehicleFloorStored: targetVehicleFloorStored,
    });
    const previewFilledBoxCount = Math.max(
      0,
      Math.floor(Number(transportPreview?.filledBoxCount) || 0)
    );
    const previewSelectedBoxCount = Math.max(
      0,
      Math.floor(Number(transportPreview?.selectedBoxCount) || 0)
    );
    const pickerDockBoxCount = (() => {
      const picker = facilityStorageHarvestMovePicker || null;
      if (!picker) return 0;
      if (String(facilityStorageSelectedTransportMode || 'pallet') !== 'individual') return 0;
      if (String(picker?.sourceTransportKey || '') !== String(facilityStorageSelectedTransportKey || '')) return 0;
      const pickerSelectedBoxCount = Math.max(0, Math.floor(Number(picker?.selectedBoxCount) || 0));
      if (pickerSelectedBoxCount <= 0) return 0;
      const pickerSourceType = String(picker?.sourceType || '');
      if (pickerSourceType !== 'vehicle-slot') {
        return pickerSelectedBoxCount;
      }
      const pickerSourceVehicleInstanceId = String(picker?.sourceVehicleInstanceId || '');
      const pickerSourceVehiclePalletSlotNo = Math.max(
        1,
        Math.floor(Number(picker?.sourceVehiclePalletSlotNo || 1) || 1)
      );
      if (
        pickerSourceVehicleInstanceId !== targetVehicleInstanceId
        || pickerSourceVehiclePalletSlotNo !== targetVehiclePalletSlotNo
      ) {
        return 0;
      }
      return pickerSelectedBoxCount;
    })();
    const targetCapacityBoxes = targetVehicleFloorStored
      ? vehicleSlotFloorBoxCapacity
      : facilityStorageSelectedTransportDockCapacityBoxesEarly;
    const currentFilledBoxCount = Math.max(
      0,
      Math.min(
        targetCapacityBoxes,
        Math.max(
          pickerDockBoxCount,
          String(facilityStorageSelectedTransportMode || 'pallet') === 'individual'
            && transportPreview
            && String(transportPreview?.sourceType || '') !== 'vehicle-slot'
            ? previewSelectedBoxCount
            : 0,
          Math.floor(
            Number(
              transportPreview
                ? previewFilledBoxCount
                : (transportDockStoredCard?.boxCount || 0)
            ) || 0
          )
        )
      )
    );
    if (!targetVehicleInstanceId || currentFilledBoxCount >= targetCapacityBoxes) {
      window.alert('적재할 곳이 다 찼습니다.');
      return;
    }
    setFacilityStorageTransportDockPreviewSource({
      sourceType: 'vehicle-slot',
      sourceVehicleInstanceId: targetVehicleInstanceId,
      sourceVehiclePalletSlotNo: targetVehiclePalletSlotNo,
      sourceLayerKey: 'bottom',
      sourceVehicleFloorStored: targetVehicleFloorStored,
      sourceTransportKey: String(facilityStorageSelectedTransportKey || targetVehicleInstanceId || ''),
    });
    setFacilityStorageHarvestMovePicker((prev) => {
      const nextPendingTarget = {
        key: `vehicle:${targetVehicleInstanceId}:${targetVehiclePalletSlotNo}:harvest-pallet`,
        targetType: 'vehicle-slot',
        vehicleInstanceId: targetVehicleInstanceId,
        targetVehicleInstanceId,
        vehiclePalletSlotNo: targetVehiclePalletSlotNo,
        targetVehiclePalletSlotNo,
        filledBoxCount: currentFilledBoxCount,
        availableBoxCount: Math.max(0, targetCapacityBoxes - currentFilledBoxCount),
        hasLoadedEmptyPallet: Boolean(transportPreview?.isEmptyPallet) || currentFilledBoxCount <= 0,
        isVehicleFloorTarget: targetVehicleFloorStored,
        sourceVehicleFloorStored: targetVehicleFloorStored,
        maxBoxes: targetCapacityBoxes,
        canChoose: currentFilledBoxCount < targetCapacityBoxes,
      };
      return buildIndividualHarvestMovePickerState({
        prev,
        source,
        warehouseSubTab: currentFacilityStorageWarehouseSubTab,
        sourceTransportKey: String(facilityStorageSelectedTransportKey || ''),
        targetFacilityKey: String(activeFacilityStorageKey || ''),
        pendingTarget: nextPendingTarget,
        resumePendingTargetAfterCommit: prev?.pendingTarget && String(prev?.pendingTarget?.targetType || '').startsWith('warehouse-')
          ? { ...prev.pendingTarget }
          : null,
        selectedBoxCount: Math.min(1, carryLimit, targetCapacityBoxes),
        autoCommitToPendingTargetTick: Date.now(),
      });
    });
  }, [
    activeFacilityStorageKey,
    buildHarvestSourceBoxCardFromStoredLayer,
    buildIndividualHarvestMovePickerState,
    currentFacilityStorageWarehouseSubTab,
    facilityStorageHarvestMovePicker,
    facilityStorageHasSelectedTransportEarly,
    facilityStorageSelectedTransportDockCapacityBoxesEarly,
    facilityStorageSelectedTransportDockInstanceIdEarly,
    facilityStorageSelectedTransportDockStoredSource,
    facilityStorageSelectedTransportIndividualCarryLimitEarly,
    facilityStorageSelectedTransportKey,
    facilityStorageSelectedTransportMode,
    facilityStorageTransportDockPreviewSource,
    getFacilityStorageIndividualNeonTarget,
    harvestBoxVisualSlotNoFromDomId,
    harvestBoxesPerPallet,
    resolveIndividualHarvestMoveSource,
    setFacilityStorageHarvestMovePicker,
    setFacilityStorageTransportDockPreviewSource,
    vehicleSlotFloorBoxCapacity,
  ]);

  return {
    loadCarrierEmptyPalletToSelectedTransportDock,
    loadCarrierHarvestPalletToSelectedTransportDock,
    pickIndividualCarrierHarvestBoxToTransport,
    pickIndividualHarvestBoxToSelectedTransportDock,
    pickIndividualTransportDockHarvestBoxToTransport,
  };
}
