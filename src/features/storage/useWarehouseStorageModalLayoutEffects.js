import { useEffect } from 'react';

export function useWarehouseStorageModalLayoutEffects({
  facilityStorageCarrierOnlyMode,
  facilityStorageGeneralGridRef,
  facilityStorageHarvestForkliftRows,
  facilityStorageHarvestTab,
  facilityStorageLeftModalRef,
  facilityStorageModalOpen,
  facilityStorageParkedCarrierInstances,
  facilityStoragePersonalOnlyMode,
  facilityStorageSelectedCarrierId,
  facilityStorageSelectedLoadMachineId,
  facilityStorageSelectedTransportKey,
  facilityStorageTab,
  facilityStorageVisibleRows,
  selectedFieldParkingSlots,
  setFacilityStorageGeneralGridMaxHeightPx,
  setFacilityStorageRightHeightPx,
  setFacilityStorageSelectedCarrierId,
  setFacilityStorageSelectedLoadMachineId,
  setFacilityStorageSelectedTransportKey,
}) {
  useEffect(() => {
    if (!facilityStorageModalOpen) return;
    if (facilityStorageCarrierOnlyMode || facilityStoragePersonalOnlyMode) return;
    if (!facilityStorageParkedCarrierInstances.length) {
      const forkliftOnlyExists = facilityStorageHarvestForkliftRows.some(
        (row) => String(row?.machine?.id || '') === String(facilityStorageSelectedCarrierId || '')
      );
      if (facilityStorageSelectedCarrierId && !forkliftOnlyExists) setFacilityStorageSelectedCarrierId('');
      return;
    }
    if (!facilityStorageSelectedCarrierId) return;
    const exists = facilityStorageParkedCarrierInstances
      .some((row) => String(row?.machine?.id || '') === String(facilityStorageSelectedCarrierId || ''))
      || facilityStorageHarvestForkliftRows
        .some((row) => String(row?.machine?.id || '') === String(facilityStorageSelectedCarrierId || ''));
    if (!exists) {
      setFacilityStorageSelectedCarrierId('');
    }
  }, [
    facilityStorageModalOpen,
    facilityStorageCarrierOnlyMode,
    facilityStoragePersonalOnlyMode,
    facilityStorageParkedCarrierInstances,
    facilityStorageHarvestForkliftRows,
    facilityStorageSelectedCarrierId,
    setFacilityStorageSelectedCarrierId,
  ]);

  useEffect(() => {
    if (!facilityStorageModalOpen) return;
    if (!facilityStorageSelectedTransportKey) return;
    const exists = facilityStorageHarvestForkliftRows
      .some((row) => String(row?.key || '') === String(facilityStorageSelectedTransportKey || ''));
    if (!exists) {
      setFacilityStorageSelectedTransportKey('');
    }
  }, [
    facilityStorageModalOpen,
    facilityStorageHarvestForkliftRows,
    facilityStorageSelectedTransportKey,
    setFacilityStorageSelectedTransportKey,
  ]);

  useEffect(() => {
    if (!facilityStorageModalOpen) return;
    if (!facilityStorageSelectedLoadMachineId) return;
    const exists = selectedFieldParkingSlots.some(
      (instanceId) => String(instanceId || '') === String(facilityStorageSelectedLoadMachineId || '')
    );
    if (!exists) {
      setFacilityStorageSelectedLoadMachineId('');
    }
  }, [
    facilityStorageModalOpen,
    facilityStorageSelectedLoadMachineId,
    selectedFieldParkingSlots,
    setFacilityStorageSelectedLoadMachineId,
  ]);

  useEffect(() => {
    if (!facilityStorageModalOpen) return;
    const node = facilityStorageLeftModalRef.current;
    if (!node) return;
    const update = () => setFacilityStorageRightHeightPx(Math.max(0, node.offsetHeight || 0));
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => update());
      observer.observe(node);
      return () => observer.disconnect();
    }
    const timer = setInterval(update, 250);
    return () => clearInterval(timer);
  }, [
    facilityStorageLeftModalRef,
    facilityStorageModalOpen,
    facilityStorageSelectedCarrierId,
    setFacilityStorageRightHeightPx,
  ]);

  const facilityStorageVisibleRowCount = facilityStorageVisibleRows.length;

  useEffect(() => {
    const shouldMeasure = facilityStorageModalOpen
      && facilityStorageTab === 'harvest'
      && facilityStorageHarvestTab === 'general'
      && facilityStorageVisibleRowCount > 0;
    const resetGridMaxHeight = () => {
      setFacilityStorageGeneralGridMaxHeightPx((prev) => (prev === 0 ? prev : 0));
    };
    if (!shouldMeasure) {
      resetGridMaxHeight();
      return undefined;
    }
    const node = facilityStorageGeneralGridRef.current;
    if (!node) {
      resetGridMaxHeight();
      return undefined;
    }
    const update = () => {
      const cards = Array.from(node.children || []).filter((child) => child instanceof HTMLElement);
      if (!cards.length) {
        resetGridMaxHeight();
        return;
      }
      const rows = [];
      cards.forEach((card) => {
        const top = Math.round(card.offsetTop || 0);
        const bottom = top + Math.round(card.offsetHeight || 0);
        const lastRow = rows[rows.length - 1];
        if (!lastRow || Math.abs(lastRow.top - top) > 4) {
          rows.push({ top, bottom });
          return;
        }
        lastRow.bottom = Math.max(lastRow.bottom, bottom);
      });
      if (rows.length <= 2) {
        resetGridMaxHeight();
        return;
      }
      const style = typeof window !== 'undefined' ? window.getComputedStyle(node) : null;
      const paddingBottom = style ? Math.max(0, parseFloat(style.paddingBottom) || 0) : 0;
      const maxHeightPx = Math.ceil(rows[1].bottom + paddingBottom);
      setFacilityStorageGeneralGridMaxHeightPx((prev) => (Math.abs(prev - maxHeightPx) <= 1 ? prev : maxHeightPx));
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => update());
      observer.observe(node);
      cardsLoop:
      for (const child of Array.from(node.children || [])) {
        if (!(child instanceof HTMLElement)) continue cardsLoop;
        observer.observe(child);
      }
      return () => observer.disconnect();
    }
    const timer = setInterval(update, 250);
    return () => clearInterval(timer);
  }, [
    facilityStorageGeneralGridRef,
    facilityStorageHarvestTab,
    facilityStorageModalOpen,
    facilityStorageTab,
    facilityStorageVisibleRowCount,
    setFacilityStorageGeneralGridMaxHeightPx,
  ]);
}
