import { useCallback, useEffect } from 'react';

export function useWarehouseOtherWarehouseTransferActions({
  activeFacilityStorageKey,
  decodeUnicodeEscapes,
  facilityStorageModal,
  facilityStorageOtherWarehouseTransferPicker,
  facilityStorageSelectedCarrier,
  game,
  itemMetaByKey,
  itemNameByKey,
  machineDisplayNameWithRentTag,
  normalizeCargoByItemKey,
  normalizeFuelContainerKey,
  pushDiary,
  resolveFieldFacilityInventoryByFacility,
  selectedField,
  selectedFieldStorageUsedKgByFacility,
  setFacilityStorageOtherWarehouseTransferPicker,
  setGame,
  storageCapacityKgTotalOfFieldFacility,
  stripColdStorageIconName,
}) {
  const openOtherWarehouseTransferPlaceholder = useCallback((item, qtyRaw = 1) => {
    const itemName = String(item?.name || item?.label || item?.itemKey || '아이템');
    const qty = Math.max(1, Math.floor(Number(qtyRaw) || 1));
    setFacilityStorageOtherWarehouseTransferPicker({
      item: item || null,
      itemName,
      qty,
    });
  }, [setFacilityStorageOtherWarehouseTransferPicker]);

  const closeOtherWarehouseTransferPicker = useCallback(() => {
    setFacilityStorageOtherWarehouseTransferPicker(null);
  }, [setFacilityStorageOtherWarehouseTransferPicker]);

  useEffect(() => {
    if (!facilityStorageModal.open) {
      setFacilityStorageOtherWarehouseTransferPicker(null);
    }
  }, [facilityStorageModal.open, setFacilityStorageOtherWarehouseTransferPicker]);

  const selectOtherWarehouseTransferTarget = useCallback((row) => {
    const picker = facilityStorageOtherWarehouseTransferPicker;
    if (!picker) return;
    const item = picker?.item || null;
    const sourceContainerKey = String(item?.sourceContainerKey || '');
    const rawItemKey = String((item?.isStoredFuelItem && sourceContainerKey) ? sourceContainerKey : (item?.key || ''));
    const itemKey = normalizeFuelContainerKey(rawItemKey) || rawItemKey;
    const itemName = String(picker?.itemName || item?.name || itemNameByKey?.[itemKey] || itemKey || '아이템');
    const qtyRequested = Math.max(1, Math.floor(Number(picker?.qty) || 1));
    const targetFacilityKey = String(row?.key || '');
    const sourceFacilityKey = String(activeFacilityStorageKey || facilityStorageModal?.facilityKey || '');
    const sourceFacilityName = decodeUnicodeEscapes(stripColdStorageIconName(facilityStorageModal?.facilityName || '창고'));
    const targetName = decodeUnicodeEscapes(stripColdStorageIconName(row?.name || '창고'));
    if (!itemKey || !sourceFacilityKey || !targetFacilityKey || sourceFacilityKey === targetFacilityKey) {
      return;
    }
    const unitWeightKg = Math.max(0, Number(item?.weightKg) || Number(itemMetaByKey?.[itemKey]?.weightKg) || 0);
    const currentTargetUsedKg = Math.max(0, Number(selectedFieldStorageUsedKgByFacility?.[targetFacilityKey]) || 0);
    const targetCapacityKg = Math.max(0, Number(storageCapacityKgTotalOfFieldFacility(selectedField, targetFacilityKey)) || 0);
    const availableTargetKg = Math.max(0, targetCapacityKg - currentTargetUsedKg);
    if (unitWeightKg > 0 && availableTargetKg + 1e-9 < unitWeightKg) {
      window.alert(`${targetName}에 적재 공간이 부족합니다.`);
      return;
    }
    const currentStorage = resolveFieldFacilityInventoryByFacility(game, game?.selectedField);
    const currentSourceInventory = normalizeCargoByItemKey(currentStorage?.byFacility?.[sourceFacilityKey] || {});
    const currentSourceQty = Math.max(0, Number(currentSourceInventory?.[itemKey]) || 0);
    let plannedQtyToMove = Math.max(0, Math.min(qtyRequested, currentSourceQty));
    if (unitWeightKg > 0) {
      const maxByWeight = Math.max(0, Math.floor((availableTargetKg + 1e-9) / unitWeightKg));
      plannedQtyToMove = Math.min(plannedQtyToMove, maxByWeight);
    }
    if (plannedQtyToMove <= 0) {
      window.alert('옮길 수량이 없거나 대상 창고 공간이 부족합니다.');
      return;
    }
    setGame((prev) => {
      const { fieldId, byFacility } = resolveFieldFacilityInventoryByFacility(prev, prev?.selectedField);
      if (!fieldId) return prev;
      const nextByFacility = { ...(byFacility || {}) };
      const sourceFacilityInventory = normalizeCargoByItemKey(nextByFacility[sourceFacilityKey] || {});
      const targetFacilityInventory = normalizeCargoByItemKey(nextByFacility[targetFacilityKey] || {});
      const sourceQty = Math.max(0, Number(sourceFacilityInventory?.[itemKey]) || 0);
      if (sourceQty <= 0) return prev;
      let qtyToMove = Math.max(0, Math.min(plannedQtyToMove, sourceQty));
      if (qtyToMove <= 0) return prev;
      if (unitWeightKg > 0) {
        const maxByWeight = Math.max(0, Math.floor((availableTargetKg + 1e-9) / unitWeightKg));
        qtyToMove = Math.min(qtyToMove, maxByWeight);
      }
      if (qtyToMove <= 0) return prev;
      sourceFacilityInventory[itemKey] = Math.max(0, sourceQty - qtyToMove);
      if ((sourceFacilityInventory[itemKey] || 0) <= 0) delete sourceFacilityInventory[itemKey];
      targetFacilityInventory[itemKey] = Math.max(0, Number(targetFacilityInventory?.[itemKey]) || 0) + qtyToMove;
      if (Object.keys(sourceFacilityInventory).length > 0) {
        nextByFacility[sourceFacilityKey] = sourceFacilityInventory;
      } else {
        delete nextByFacility[sourceFacilityKey];
      }
      nextByFacility[targetFacilityKey] = targetFacilityInventory;
      const carrierLabel = facilityStorageSelectedCarrier
        ? ` (${machineDisplayNameWithRentTag(facilityStorageSelectedCarrier)} 이동)`
        : '';
      return {
        ...prev,
        fieldFacilityInventoryByFieldId: {
          ...(prev.fieldFacilityInventoryByFieldId || {}),
          [fieldId]: nextByFacility,
        },
        logs: pushDiary(
          prev,
          `${sourceFacilityName} → ${targetName}: ${itemName} ${qtyToMove}${String(item?.unit || itemMetaByKey?.[itemKey]?.unit || '')}${carrierLabel}`
        ),
      };
    });
    setFacilityStorageOtherWarehouseTransferPicker(null);
  }, [
    activeFacilityStorageKey,
    decodeUnicodeEscapes,
    facilityStorageModal?.facilityKey,
    facilityStorageModal?.facilityName,
    facilityStorageOtherWarehouseTransferPicker,
    facilityStorageSelectedCarrier,
    game,
    itemMetaByKey,
    itemNameByKey,
    machineDisplayNameWithRentTag,
    normalizeCargoByItemKey,
    normalizeFuelContainerKey,
    pushDiary,
    resolveFieldFacilityInventoryByFacility,
    selectedField,
    selectedFieldStorageUsedKgByFacility,
    setFacilityStorageOtherWarehouseTransferPicker,
    setGame,
    storageCapacityKgTotalOfFieldFacility,
    stripColdStorageIconName,
  ]);

  return {
    closeOtherWarehouseTransferPicker,
    openOtherWarehouseTransferPlaceholder,
    selectOtherWarehouseTransferTarget,
  };
}
