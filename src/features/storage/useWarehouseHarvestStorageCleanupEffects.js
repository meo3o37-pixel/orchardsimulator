import { useEffect } from 'react';

export function useWarehouseHarvestStorageCleanupEffects({
  facilityStorageSelectedCarrier,
  facilityStorageSelectedCarrierPalletSlotRows,
  harvestStoredFloorSummaryRowsByFacilityAndSlot,
  harvestStoredPalletSlotsByFacility,
  harvestStoredPalletSlotsByVehicleInstance,
  normalizeVehiclePalletSlotsByInstance,
  setFacilityStorageCarrierPalletVisibleLayerBySlot,
  setFacilityStorageHarvestSlotByFacility,
  setGame,
}) {
  useEffect(() => {
    setFacilityStorageCarrierPalletVisibleLayerBySlot((prev) => {
      const carrierId = String(facilityStorageSelectedCarrier?.id || '');
      const next = {};
      facilityStorageSelectedCarrierPalletSlotRows.forEach((slot) => {
        const slotNo = Math.max(0, Number(slot?.slotNo) || 0);
        if (slotNo <= 0 || !slot?.hasTopLayer) return;
        const key = `${carrierId}:${slotNo}`;
        next[key] = prev?.[key] === 'top' ? 'top' : 'bottom';
      });
      return next;
    });
  }, [
    facilityStorageSelectedCarrier,
    facilityStorageSelectedCarrierPalletSlotRows,
    setFacilityStorageCarrierPalletVisibleLayerBySlot,
  ]);

  useEffect(() => {
    setFacilityStorageHarvestSlotByFacility((prev) => {
      const next = { ...(prev || {}) };
      let changed = false;
      Object.entries(prev || {}).forEach(([facilityKeyRaw, currentSlotsRaw]) => {
        const facilityKey = String(facilityKeyRaw || '');
        if (!Array.isArray(currentSlotsRaw) || !currentSlotsRaw.length) return;
        const floorRowsBySlot = harvestStoredFloorSummaryRowsByFacilityAndSlot?.[facilityKey] || {};
        const floorSourceSlotNos = new Set(
          Object.values(floorRowsBySlot || {})
            .map((row) => Math.max(0, Math.floor(Number(row?.sourceSlotNo) || 0)))
            .filter((slotNo) => slotNo > 0)
        );
        const cleaned = currentSlotsRaw.map((rawEntry, idx) => {
          if (!rawEntry) return null;
          const slotNo = idx + 1;
          const hasStoredHarvest = Boolean(harvestStoredPalletSlotsByFacility?.[facilityKey]?.[slotNo]);
          const hasStoredFloorHarvest = Boolean(floorRowsBySlot?.[slotNo]);
          const sourceType = String(rawEntry?.sourceType || '');
          const isHarvestMemo = sourceType === 'harvest';
          const isFloorHarvestMemo = sourceType === 'floorHarvest';
          const isEmptyPalletMemo = String(rawEntry?.sourceType || '') === 'emptyPallet';
          const isStaleFloorSourceMemo = isEmptyPalletMemo
            && !hasStoredHarvest
            && !hasStoredFloorHarvest
            && floorSourceSlotNos.has(slotNo);
          const isStaleHarvestMemo = isHarvestMemo && !hasStoredHarvest;
          const isStaleFloorHarvestMemo = isFloorHarvestMemo && !hasStoredFloorHarvest;
          if (
            hasStoredHarvest
            || hasStoredFloorHarvest
            || isStaleFloorSourceMemo
            || isStaleHarvestMemo
            || isStaleFloorHarvestMemo
          ) return null;
          return rawEntry;
        });
        const rowChanged = cleaned.some((entry, idx) => entry !== (currentSlotsRaw[idx] || null));
        if (!rowChanged) return;
        next[facilityKey] = cleaned;
        changed = true;
      });
      return changed ? next : prev;
    });
  }, [
    harvestStoredPalletSlotsByFacility,
    harvestStoredFloorSummaryRowsByFacilityAndSlot,
    setFacilityStorageHarvestSlotByFacility,
  ]);

  useEffect(() => {
    setGame((prev) => {
      const rawByInstance = normalizeVehiclePalletSlotsByInstance(prev?.vehiclePalletSlotsByInstance || {});
      let changed = false;
      const nextByInstance = { ...rawByInstance };
      Object.entries(rawByInstance).forEach(([instanceId, slotMap]) => {
        const nextSlotMap = { ...(slotMap || {}) };
        Object.keys(slotMap || {}).forEach((slotNoRaw) => {
          const slotNo = Math.max(1, Math.floor(Number(slotNoRaw) || 0));
          if (harvestStoredPalletSlotsByVehicleInstance?.[instanceId]?.[slotNo]?.bottomLayer) {
            delete nextSlotMap[slotNo];
            changed = true;
          }
        });
        if (Object.keys(nextSlotMap).length > 0) nextByInstance[instanceId] = nextSlotMap;
        else delete nextByInstance[instanceId];
      });
      return changed ? { ...prev, vehiclePalletSlotsByInstance: nextByInstance } : prev;
    });
  }, [
    harvestStoredPalletSlotsByVehicleInstance,
    normalizeVehiclePalletSlotsByInstance,
    setGame,
  ]);
}
