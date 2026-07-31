import { useEffect, useRef, useState } from 'react';

export function useWarehouseSortingAnimationState() {
  const [facilityStorageSortingAnimationPreviewBySlotNo, setFacilityStorageSortingAnimationPreviewBySlotNo] = useState({});
  const facilityStorageSortingPreviewAnimTimersRef = useRef({});
  const facilityStorageSortingAnimationFrameRef = useRef(null);
  const facilityStorageSortingAnimationSessionRef = useRef({});
  const facilityStorageSortingPreviewCountRef = useRef({});

  return {
    facilityStorageSortingAnimationFrameRef,
    facilityStorageSortingAnimationPreviewBySlotNo,
    facilityStorageSortingAnimationSessionRef,
    facilityStorageSortingPreviewAnimTimersRef,
    facilityStorageSortingPreviewCountRef,
    setFacilityStorageSortingAnimationPreviewBySlotNo,
  };
}

export function useWarehouseSortingAnimationEffects({
  activeFacilityStorageKey,
  clamp,
  facilityStorageSortingAnimatingByEquipment,
  facilityStorageSortingAnimationFrameRef,
  facilityStorageSortingAnimationPreviewBySlotNo,
  facilityStorageSortingAnimationProgressByEquipment,
  facilityStorageSortingAnimationSessionRef,
  facilityStorageSortingPreviewAnimTimersRef,
  facilityStorageSortingPreviewCountRef,
  game,
  resolveSortingTaskContext,
  setFacilityStorageHarvestIndividualFillAnimBySlot,
  setFacilityStorageSortingAnimationPreviewBySlotNo,
  setFacilityStorageSortingAnimationProgressByEquipment,
  sortingAnimationDurationMsForBoxCount,
}) {
  useEffect(() => {
    const facilityKey = String(activeFacilityStorageKey || '');
    const activeEquipmentKeys = Object.entries(facilityStorageSortingAnimatingByEquipment || {})
      .filter(([, animatingRaw]) => Boolean(animatingRaw))
      .map(([equipmentStorageKeyRaw]) => String(equipmentStorageKeyRaw || ''))
      .filter(Boolean);

    if (!facilityKey || !activeEquipmentKeys.length) {
      facilityStorageSortingAnimationSessionRef.current = {};
      setFacilityStorageSortingAnimationProgressByEquipment({});
      if (facilityStorageSortingAnimationFrameRef.current) {
        cancelAnimationFrame(facilityStorageSortingAnimationFrameRef.current);
        facilityStorageSortingAnimationFrameRef.current = null;
      }
      return undefined;
    }

    const sessionMap = { ...(facilityStorageSortingAnimationSessionRef.current || {}) };
    const activeSet = new Set(activeEquipmentKeys);
    Object.keys(sessionMap).forEach((equipmentStorageKey) => {
      if (!activeSet.has(equipmentStorageKey)) delete sessionMap[equipmentStorageKey];
    });

    const now = (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();
    activeEquipmentKeys.forEach((equipmentStorageKey) => {
      if (sessionMap[equipmentStorageKey]) return;
      const context = resolveSortingTaskContext(game, facilityKey, equipmentStorageKey);
      const sourceBoxCount = Math.max(0, Number(context?.processableBoxCount) || Number(context?.processableEntries?.length) || 0);
      const outputBoxCount = Math.max(0, Number(context?.estimatedOutputBoxCount) || Number(context?.placedEntries?.length) || 0);
      const displayBoxCount = Math.max(sourceBoxCount, outputBoxCount, 1);
      sessionMap[equipmentStorageKey] = {
        startedAt: now,
        durationMs: sortingAnimationDurationMsForBoxCount(displayBoxCount),
      };
    });
    facilityStorageSortingAnimationSessionRef.current = sessionMap;

    const tick = () => {
      const currentSessions = facilityStorageSortingAnimationSessionRef.current || {};
      const currentActiveKeys = Object.keys(currentSessions);
      if (!currentActiveKeys.length) {
        facilityStorageSortingAnimationFrameRef.current = null;
        setFacilityStorageSortingAnimationProgressByEquipment({});
        return;
      }
      const frameNow = (typeof performance !== 'undefined' && typeof performance.now === 'function')
        ? performance.now()
        : Date.now();
      const nextProgressByEquipment = {};
      currentActiveKeys.forEach((equipmentStorageKey) => {
        const session = currentSessions[equipmentStorageKey];
        if (!session) return;
        const durationMs = Math.max(1, Number(session?.durationMs) || 1);
        const progressRatio = clamp((frameNow - Number(session?.startedAt || frameNow)) / durationMs, 0, 0.985);
        nextProgressByEquipment[equipmentStorageKey] = progressRatio;
      });
      setFacilityStorageSortingAnimationProgressByEquipment(nextProgressByEquipment);
      facilityStorageSortingAnimationFrameRef.current = requestAnimationFrame(tick);
    };

    if (!facilityStorageSortingAnimationFrameRef.current) {
      tick();
    }
    return () => {
      if (!(Object.keys(facilityStorageSortingAnimationSessionRef.current || {}).length)) {
        if (facilityStorageSortingAnimationFrameRef.current) {
          cancelAnimationFrame(facilityStorageSortingAnimationFrameRef.current);
          facilityStorageSortingAnimationFrameRef.current = null;
        }
      }
    };
  }, [
    activeFacilityStorageKey,
    clamp,
    facilityStorageSortingAnimatingByEquipment,
    facilityStorageSortingAnimationFrameRef,
    facilityStorageSortingAnimationSessionRef,
    game,
    resolveSortingTaskContext,
    setFacilityStorageSortingAnimationProgressByEquipment,
    sortingAnimationDurationMsForBoxCount,
  ]);

  useEffect(() => {
    const roundSortingPreviewKg = (valueRaw = 0) => (
      Math.round((Math.max(0, Number(valueRaw) || 0) + Number.EPSILON) * 10) / 10
    );
    const facilityKey = String(activeFacilityStorageKey || '');
    if (!facilityKey) {
      setFacilityStorageSortingAnimationPreviewBySlotNo({});
      return;
    }
    const previewBySlotNo = {};
    Object.entries(facilityStorageSortingAnimatingByEquipment || {}).forEach(([equipmentStorageKeyRaw, animatingRaw]) => {
      const equipmentStorageKey = String(equipmentStorageKeyRaw || '');
      if (!equipmentStorageKey || !animatingRaw) return;
      const context = resolveSortingTaskContext(game, facilityKey, equipmentStorageKey);
      const progressRatio = clamp(
        Number(facilityStorageSortingAnimationProgressByEquipment?.[equipmentStorageKey]) || 0,
        0,
        0.985
      );
      const inputSlotNo = Math.max(0, Math.floor(Number(context?.inputSlotNo) || 0));
      const sourceTone = /green/i.test(String(
        context?.processableEntries?.[0]?.batch?.loadBoxKey
        || context?.selectedInputLoadBoxKey
        || context?.selectedOutputLoadBoxKey
        || ''
      )) ? 'green' : 'yellow';
      const totalInputBoxCount = Math.max(0, Number(context?.processableBoxCount) || Number(context?.processableEntries?.length) || 0);
      const totalInputQtyKg = roundSortingPreviewKg(
        (Array.isArray(context?.processableEntries) ? context.processableEntries : []).reduce(
          (sum, entry) => sum + Math.max(0, Number(entry?.batch?.qty) || 0),
          0
        )
      );
      if (inputSlotNo > 0 && totalInputBoxCount > 0) {
        const movedInputBoxCount = Math.min(
          Math.max(0, totalInputBoxCount - 1),
          Math.floor(totalInputBoxCount * progressRatio)
        );
        const remainingInputBoxCount = Math.max(1, totalInputBoxCount - movedInputBoxCount);
        const remainingQtyKg = totalInputQtyKg > 0
          ? roundSortingPreviewKg(totalInputQtyKg * (remainingInputBoxCount / Math.max(1, totalInputBoxCount)))
          : 0;
        previewBySlotNo[inputSlotNo] = {
          previewType: 'sorting-input-preview',
          filledBoxCount: remainingInputBoxCount,
          qtyKg: remainingQtyKg,
          tone: sourceTone,
        };
      }
      const slotPreviewTotals = {};
      (Array.isArray(context?.placedEntries) ? context.placedEntries : []).forEach(({ box, target }) => {
        const targetSlotNo = Math.max(0, Math.floor(Number(target?.slotNo) || 0));
        if (targetSlotNo <= 0) return;
        const tone = /green/i.test(String(box?.loadBoxKey || context?.selectedOutputLoadBoxKey || '')) ? 'green' : 'yellow';
        if (!slotPreviewTotals[targetSlotNo]) {
          slotPreviewTotals[targetSlotNo] = {
            previewType: 'sorting-output-preview',
            filledBoxCount: 0,
            qtyKg: 0,
            tone,
            usesFloorStorage: Boolean(target?.usesFloorStorage),
          };
        }
        slotPreviewTotals[targetSlotNo].usesFloorStorage = Boolean(target?.usesFloorStorage);
        slotPreviewTotals[targetSlotNo].filledBoxCount += 1;
        slotPreviewTotals[targetSlotNo].qtyKg = roundSortingPreviewKg(
          Number(slotPreviewTotals[targetSlotNo].qtyKg || 0) + Math.max(0, Number(box?.qty) || 0)
        );
      });
      Object.entries(slotPreviewTotals).forEach(([targetSlotNoRaw, entry]) => {
        const targetSlotNo = Math.max(0, Math.floor(Number(targetSlotNoRaw) || 0));
        if (targetSlotNo <= 0) return;
        const totalFilledBoxCount = Math.max(0, Math.floor(Number(entry?.filledBoxCount) || 0));
        const visibleFilledBoxCount = totalFilledBoxCount <= 0
          ? 0
          : Math.min(
            Math.max(0, totalFilledBoxCount - 1),
            Math.floor(totalFilledBoxCount * progressRatio)
          );
        previewBySlotNo[targetSlotNo] = {
          ...entry,
          filledBoxCount: visibleFilledBoxCount,
          qtyKg: roundSortingPreviewKg((Number(entry?.qtyKg) || 0) * progressRatio),
        };
      });
    });
    setFacilityStorageSortingAnimationPreviewBySlotNo(previewBySlotNo);
  }, [
    activeFacilityStorageKey,
    clamp,
    facilityStorageSortingAnimationProgressByEquipment,
    facilityStorageSortingAnimatingByEquipment,
    game,
    resolveSortingTaskContext,
    setFacilityStorageSortingAnimationPreviewBySlotNo,
  ]);

  useEffect(() => {
    const outputEntries = Object.entries(facilityStorageSortingAnimationPreviewBySlotNo || {})
      .map(([slotNoRaw, entry]) => ({
        slotNo: Math.max(0, Math.floor(Number(slotNoRaw) || 0)),
        entry,
      }))
      .filter(({ slotNo, entry }) => slotNo > 0 && String(entry?.previewType || '') === 'sorting-output-preview');
    if (!outputEntries.length) {
      facilityStorageSortingPreviewCountRef.current = {};
      return undefined;
    }

    setFacilityStorageHarvestIndividualFillAnimBySlot((prev) => {
      const next = { ...(prev || {}) };
      const nextCountMap = {};
      outputEntries.forEach(({ slotNo, entry }) => {
        const animKey = `warehouse:${slotNo}`;
        const filledBoxCount = Math.max(0, Math.floor(Number(entry?.filledBoxCount) || 0));
        nextCountMap[animKey] = filledBoxCount;
        const previousFilledBoxCount = Math.max(
          0,
          Math.floor(Number(facilityStorageSortingPreviewCountRef.current?.[animKey]) || 0)
        );
        if (filledBoxCount <= previousFilledBoxCount) return;
        const previousTick = Math.max(0, Number(next?.[animKey]?.tick) || 0);
        const visualSlotNos = Array.from(
          { length: filledBoxCount - previousFilledBoxCount },
          (_, index) => previousFilledBoxCount + index + 1
        );
        next[animKey] = {
          count: filledBoxCount,
          tick: previousTick + 1,
          visualSlotNos,
          pendingVisualSlotNos: [],
          deferCommitVisual: false,
        };
        const currentTimerId = facilityStorageSortingPreviewAnimTimersRef.current?.[animKey];
        if (currentTimerId) clearTimeout(currentTimerId);
        facilityStorageSortingPreviewAnimTimersRef.current[animKey] = setTimeout(() => {
          setFacilityStorageHarvestIndividualFillAnimBySlot((currentPrev) => {
            if (!currentPrev?.[animKey]) return currentPrev;
            const currentNext = { ...(currentPrev || {}) };
            delete currentNext[animKey];
            return currentNext;
          });
          delete facilityStorageSortingPreviewAnimTimersRef.current[animKey];
        }, 1100);
      });
      facilityStorageSortingPreviewCountRef.current = nextCountMap;
      return next;
    });
    return undefined;
  }, [
    facilityStorageSortingAnimationPreviewBySlotNo,
    facilityStorageSortingPreviewAnimTimersRef,
    facilityStorageSortingPreviewCountRef,
    setFacilityStorageHarvestIndividualFillAnimBySlot,
  ]);
}
