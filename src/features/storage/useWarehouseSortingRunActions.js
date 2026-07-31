import { useCallback, useEffect } from 'react';

export function useWarehouseSortingRunActions({
  closeFacilityStorageSortingRunConfirm,
  facilityStorageSortingAnimatingByEquipment,
  facilityStorageSortingItemByEquipmentKey,
  facilityStorageSortingRunConfirm,
  facilityStorageSortingRunConfirmSourceRef,
  facilityStorageSortingRunTargetByEquipment,
  setFacilityStorageSortingAnimatingByEquipment,
  setFacilityStorageSortingRunTargetByEquipment,
  setFacilityStorageSortingWorkerPicker,
  sortingStartStateByEquipmentKey,
  startSortingTask,
}) {
  const openFacilityStorageSortingRunConfirm = useCallback((item, sourceWindow = null) => {
    const equipmentStorageKey = String(item?.displayKey || item?.key || '');
    if (!equipmentStorageKey) return;
    const startState = sortingStartStateByEquipmentKey?.[equipmentStorageKey] || null;
    if (startState?.blockedReason) {
      window.alert(startState.blockedReason);
      return;
    }
    if (facilityStorageSortingAnimatingByEquipment?.[equipmentStorageKey]) {
      return;
    }
    const savedCargoSlotKey = String(facilityStorageSortingRunTargetByEquipment?.[equipmentStorageKey] || '');
    if (sourceWindow) {
      setFacilityStorageSortingAnimatingByEquipment((prev) => ({
        ...prev,
        [equipmentStorageKey]: true,
      }));
      sourceWindow.postMessage({
        type: 'facility-storage-sorting-run-start',
        equipmentStorageKey,
        selectedCargoSlotKey: savedCargoSlotKey,
      }, '*');
      return;
    }
    const runStarted = startSortingTask(equipmentStorageKey);
    if (!runStarted) return;
    if (equipmentStorageKey && savedCargoSlotKey) {
      setFacilityStorageSortingRunTargetByEquipment((prev) => ({
        ...prev,
        [equipmentStorageKey]: savedCargoSlotKey,
      }));
    }
  }, [
    facilityStorageSortingAnimatingByEquipment,
    facilityStorageSortingRunTargetByEquipment,
    setFacilityStorageSortingAnimatingByEquipment,
    setFacilityStorageSortingRunTargetByEquipment,
    sortingStartStateByEquipmentKey,
    startSortingTask,
  ]);

  useEffect(() => {
    const handleSortingPreviewMessage = (event) => {
      const payload = event?.data;
      if (!payload) return;
      const payloadType = String(payload?.type || '');
      if (payloadType === 'facility-storage-sorting-run-request') {
        const equipmentStorageKey = String(payload?.equipmentStorageKey || '');
        if (!equipmentStorageKey) return;
        const sourceWindow = event?.source || null;
        const savedCargoSlotKey = String(facilityStorageSortingRunTargetByEquipment?.[equipmentStorageKey] || '');
        const startState = sortingStartStateByEquipmentKey?.[equipmentStorageKey] || null;
        if (startState?.blockedReason) {
          window.alert(startState.blockedReason);
          return;
        }
        if (facilityStorageSortingAnimatingByEquipment?.[equipmentStorageKey]) return;
        if (sourceWindow) {
          setFacilityStorageSortingAnimatingByEquipment((prev) => ({
            ...prev,
            [equipmentStorageKey]: true,
          }));
          sourceWindow.postMessage({
            type: 'facility-storage-sorting-run-start',
            equipmentStorageKey,
            selectedCargoSlotKey: savedCargoSlotKey,
          }, '*');
        }
        if (equipmentStorageKey && savedCargoSlotKey) {
          setFacilityStorageSortingRunTargetByEquipment((prev) => ({
            ...prev,
            [equipmentStorageKey]: savedCargoSlotKey,
          }));
        }
        return;
      }
      if (payloadType === 'facility-storage-sorting-run-complete') {
        const equipmentStorageKey = String(payload?.equipmentStorageKey || '');
        if (!equipmentStorageKey) return;
        setFacilityStorageSortingAnimatingByEquipment((prev) => ({
          ...prev,
          [equipmentStorageKey]: false,
        }));
        startSortingTask(equipmentStorageKey);
        return;
      }
      if (payloadType !== 'facility-storage-sorting-worker-picker') return;
      const equipmentStorageKey = String(payload?.equipmentStorageKey || '');
      const slotKey = String(payload?.slotKey || payload?.positionKey || '');
      if (!equipmentStorageKey || !slotKey) return;
      const item = facilityStorageSortingItemByEquipmentKey?.[equipmentStorageKey] || null;
      setFacilityStorageSortingWorkerPicker({
        equipmentStorageKey,
        equipmentName: String(item?.name || '선별기'),
        mode: 'root',
        slotKey,
        slotLabel: String(payload?.slotLabel || payload?.positionTitle || '인원칸'),
      });
    };
    window.addEventListener('message', handleSortingPreviewMessage);
    return () => window.removeEventListener('message', handleSortingPreviewMessage);
  }, [
    facilityStorageSortingAnimatingByEquipment,
    facilityStorageSortingItemByEquipmentKey,
    facilityStorageSortingRunTargetByEquipment,
    setFacilityStorageSortingAnimatingByEquipment,
    setFacilityStorageSortingRunTargetByEquipment,
    setFacilityStorageSortingWorkerPicker,
    sortingStartStateByEquipmentKey,
    startSortingTask,
  ]);

  const confirmFacilityStorageSortingRun = useCallback(() => {
    const sourceWindow = facilityStorageSortingRunConfirmSourceRef.current;
    const equipmentStorageKey = String(facilityStorageSortingRunConfirm?.equipmentStorageKey || '');
    const selectedCargoSlotKey = String(facilityStorageSortingRunConfirm?.selectedCargoSlotKey || '');
    const startState = sortingStartStateByEquipmentKey?.[equipmentStorageKey] || null;
    if (startState?.blockedReason) {
      window.alert(startState.blockedReason);
      closeFacilityStorageSortingRunConfirm();
      return;
    }
    const runStarted = startSortingTask(equipmentStorageKey);
    if (!runStarted) {
      return;
    }
    if (sourceWindow && equipmentStorageKey) {
      sourceWindow.postMessage({
        type: 'facility-storage-sorting-run-confirm',
        equipmentStorageKey,
        selectedCargoSlotKey,
      }, '*');
    }
    if (equipmentStorageKey && selectedCargoSlotKey) {
      setFacilityStorageSortingRunTargetByEquipment((prev) => ({
        ...prev,
        [equipmentStorageKey]: selectedCargoSlotKey,
      }));
    }
    closeFacilityStorageSortingRunConfirm();
  }, [
    closeFacilityStorageSortingRunConfirm,
    facilityStorageSortingRunConfirm,
    facilityStorageSortingRunConfirmSourceRef,
    setFacilityStorageSortingRunTargetByEquipment,
    sortingStartStateByEquipmentKey,
    startSortingTask,
  ]);

  return {
    confirmFacilityStorageSortingRun,
    openFacilityStorageSortingRunConfirm,
  };
}
