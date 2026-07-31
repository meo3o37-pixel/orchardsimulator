import { useCallback, useRef } from 'react';

export function useWarehouseStorageHarvestTargetActions({
  activeFacilityStorageKey,
  chooseHarvestPalletMoveTarget,
  currentFacilityStorageWarehouseSubTab,
  facilityStorageActiveHarvestMoveSource,
  facilityStorageHarvestMovePicker,
  facilityStorageSelectedTransportDockInstanceIdEarly,
  facilityStorageSelectedTransportKey,
  facilityStorageSelectedTransportMode,
  facilityStorageSelectedTransportRow,
  resolveLiveHarvestMoveTarget,
  setFacilityStorageHarvestMovePicker,
  setFacilityStorageTransportDockPreviewSource,
  setGame,
  tryHandleLoadedTransportDockTargetSelection,
}) {
  const openHarvestMoveSourceDetailForIndividualTarget = useCallback(() => false, []);

  const handleHarvestMoveTargetSelection = useCallback((target) => {
    if (openHarvestMoveSourceDetailForIndividualTarget(target)) return;
    chooseHarvestPalletMoveTarget(target);
  }, [
    chooseHarvestPalletMoveTarget,
    openHarvestMoveSourceDetailForIndividualTarget,
  ]);

  const tryMoveLoadedEmptyPalletFromSelectedTransportToVehicleSlot = useCallback((target) => {
    const picker = facilityStorageActiveHarvestMoveSource;
    const targetType = String(target?.targetType || '');
    const sourceType = String(picker?.sourceType || '');
    const sourceVehicleInstanceId = String(picker?.sourceVehicleInstanceId || '');
    const sourceVehiclePalletSlotNo = Math.max(1, Math.floor(Number(picker?.sourceVehiclePalletSlotNo || 1) || 1));
    const targetVehicleInstanceId = String(target?.vehicleInstanceId || '');
    const targetVehiclePalletSlotNo = Math.max(1, Math.floor(Number(target?.vehiclePalletSlotNo || 0) || 0));
    const selectedTransportDockInstanceId = String(facilityStorageSelectedTransportDockInstanceIdEarly || '');
    const isLoadedEmptyPalletSource = sourceType === 'vehicle-slot'
      && (Boolean(picker?.isEmptyPallet) || Boolean(picker?.isEmptyPalletSnapshot));
    if (String(facilityStorageSelectedTransportMode || 'pallet') === 'individual') return false;
    if (!picker || !target) return false;
    if (!isLoadedEmptyPalletSource) return false;
    if (targetType !== 'vehicle-slot') return false;
    if (!targetVehicleInstanceId || targetVehiclePalletSlotNo <= 0) return false;
    if (!selectedTransportDockInstanceId || sourceVehicleInstanceId !== selectedTransportDockInstanceId || sourceVehiclePalletSlotNo !== 1) {
      return false;
    }
    if (sourceVehicleInstanceId === targetVehicleInstanceId && sourceVehiclePalletSlotNo === targetVehiclePalletSlotNo) {
      return false;
    }
    setGame((prev) => {
      if (!prev) return prev;
      const nextVehiclePalletSlotsByInstance = { ...(prev.vehiclePalletSlotsByInstance || {}) };
      const sourceSlotMap = { ...(nextVehiclePalletSlotsByInstance[sourceVehicleInstanceId] || {}) };
      delete sourceSlotMap[sourceVehiclePalletSlotNo];
      if (Object.keys(sourceSlotMap).length > 0) nextVehiclePalletSlotsByInstance[sourceVehicleInstanceId] = sourceSlotMap;
      else delete nextVehiclePalletSlotsByInstance[sourceVehicleInstanceId];
      nextVehiclePalletSlotsByInstance[targetVehicleInstanceId] = {
        ...(nextVehiclePalletSlotsByInstance[targetVehicleInstanceId] || {}),
        [targetVehiclePalletSlotNo]: { itemKey: 'plasticPallet1100' }
      };
      return {
        ...prev,
        vehiclePalletSlotsByInstance: nextVehiclePalletSlotsByInstance,
      };
    });
    setFacilityStorageHarvestMovePicker(null);
    setFacilityStorageTransportDockPreviewSource(null);
    return true;
  }, [
    facilityStorageActiveHarvestMoveSource,
    facilityStorageSelectedTransportDockInstanceIdEarly,
    facilityStorageSelectedTransportMode,
    setFacilityStorageHarvestMovePicker,
    setFacilityStorageTransportDockPreviewSource,
    setGame,
  ]);

  const confirmHarvestSourceSelectionAndLoad = useCallback(() => {
    const picker = facilityStorageHarvestMovePicker;
    const pendingTarget = picker?.pendingTarget || null;
    const selectedSourceCards = Array.isArray(picker?.selectedSourceCards)
      ? picker.selectedSourceCards.filter((card) => Math.max(0, Math.floor(Number(card?.selectedCount) || 0)) > 0)
      : [];
    const hasPreviewHeldBoxes = Boolean(picker?.sourceBoxCard)
      && Math.max(0, Math.floor(Number(picker?.selectedBoxCount) || 0)) > 0;
    if (!picker || !pendingTarget) return;
    if (!selectedSourceCards.length && !hasPreviewHeldBoxes) {
      window.alert('추가 적재할 수확물 상자를 먼저 선택해 주세요.');
      return;
    }
    const livePendingTarget = resolveLiveHarvestMoveTarget(pendingTarget) || pendingTarget;
    chooseHarvestPalletMoveTarget(livePendingTarget, {
      keepIndividualPickerOpen: true,
    });
  }, [
    chooseHarvestPalletMoveTarget,
    facilityStorageHarvestMovePicker,
    resolveLiveHarvestMoveTarget,
  ]);

  const requestHarvestMoveTargetFromCarrier = useCallback((target) => {
    const picker = facilityStorageActiveHarvestMoveSource;
    if (!target || target?.canChoose === false) return;
    if (tryMoveLoadedEmptyPalletFromSelectedTransportToVehicleSlot(target)) return;
    if (String(facilityStorageSelectedTransportMode || 'pallet') === 'individual') {
      setFacilityStorageHarvestMovePicker((prev) => ({
        ...(prev || {}),
        presentation: 'inline',
        warehouseSubTab: currentFacilityStorageWarehouseSubTab,
        sourceType: String(prev?.sourceType || ''),
        sourceFacilityKey: String(prev?.sourceFacilityKey || ''),
        sourceSlotNo: Math.max(0, Math.floor(Number(prev?.sourceSlotNo) || 0)),
        sourceVehicleInstanceId: String(prev?.sourceVehicleInstanceId || ''),
        sourceVehiclePalletSlotNo: Math.max(0, Math.floor(Number(prev?.sourceVehiclePalletSlotNo) || 0)),
        sourceLayerKey: String(prev?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom',
        sourceTransportKey: String(prev?.sourceTransportKey || facilityStorageSelectedTransportKey || ''),
        targetFacilityKey: String(activeFacilityStorageKey || ''),
        pendingTarget: target,
        resumePendingTargetAfterCommit: prev?.resumePendingTargetAfterCommit || null,
        selectedSourceCards: Array.isArray(prev?.selectedSourceCards) ? prev.selectedSourceCards : [],
        selectedBoxCount: Math.max(0, Math.floor(Number(prev?.selectedBoxCount) || 0)),
        sourceBoxCard: prev?.sourceBoxCard || null,
        autoCommitToPendingTargetTick: 0,
      }));
      return;
    }
    if (!picker) {
      if (tryHandleLoadedTransportDockTargetSelection(() => target)) return;
      if (String(facilityStorageSelectedTransportMode || 'pallet') !== 'individual' || !facilityStorageSelectedTransportRow) return;
      setFacilityStorageHarvestMovePicker((prev) => ({
        ...(prev || {}),
        presentation: 'inline',
        warehouseSubTab: currentFacilityStorageWarehouseSubTab,
        sourceType: String(prev?.sourceType || ''),
        sourceFacilityKey: String(prev?.sourceFacilityKey || ''),
        sourceSlotNo: Math.max(0, Math.floor(Number(prev?.sourceSlotNo) || 0)),
        sourceVehicleInstanceId: String(prev?.sourceVehicleInstanceId || ''),
        sourceVehiclePalletSlotNo: Math.max(0, Math.floor(Number(prev?.sourceVehiclePalletSlotNo) || 0)),
        sourceLayerKey: String(prev?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom',
        sourceTransportKey: String(prev?.sourceTransportKey || facilityStorageSelectedTransportKey || ''),
        targetFacilityKey: String(activeFacilityStorageKey || ''),
        pendingTarget: target,
        resumePendingTargetAfterCommit: prev?.resumePendingTargetAfterCommit || null,
        selectedSourceCards: Array.isArray(prev?.selectedSourceCards) ? prev.selectedSourceCards : [],
        selectedBoxCount: Math.max(0, Math.floor(Number(prev?.selectedBoxCount) || 0)),
        sourceBoxCard: prev?.sourceBoxCard || null,
        autoCommitToPendingTargetTick: 0,
      }));
      return;
    }
    handleHarvestMoveTargetSelection(target);
  }, [
    activeFacilityStorageKey,
    currentFacilityStorageWarehouseSubTab,
    facilityStorageActiveHarvestMoveSource,
    facilityStorageSelectedTransportKey,
    facilityStorageSelectedTransportMode,
    facilityStorageSelectedTransportRow,
    handleHarvestMoveTargetSelection,
    setFacilityStorageHarvestMovePicker,
    tryHandleLoadedTransportDockTargetSelection,
    tryMoveLoadedEmptyPalletFromSelectedTransportToVehicleSlot,
  ]);

  const facilityStorageHarvestMoveLastHandledAutoCommitTickRef = useRef(0);

  return {
    confirmHarvestSourceSelectionAndLoad,
    facilityStorageHarvestMoveLastHandledAutoCommitTickRef,
    handleHarvestMoveTargetSelection,
    requestHarvestMoveTargetFromCarrier,
    tryMoveLoadedEmptyPalletFromSelectedTransportToVehicleSlot,
  };
}
