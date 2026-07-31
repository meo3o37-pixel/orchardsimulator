import React, { useCallback, useMemo } from 'react';

export function useWarehouseInOutSlotHelpers({
  activeFacilityStorageKey,
  facilityStorageSortingInOutSelectionByFacility,
  facilityStorageWorkbenchInOutSelectionByFacility,
  facilityStorageWorkbenchTaskByFacility,
  facilityStorageWorkbenchTaskPicker,
  normalizeSortingInOutSlotNoList,
  normalizeSortingOutputRuleMap,
  normalizeWorkbenchInOutSlotNoList,
  normalizeWorkbenchOutputRuleMap,
  setFacilityStorageWorkbenchTaskByFacility,
  setFacilityStorageWorkbenchTaskPicker,
  sortingOutputRuleLabelOf,
  workbenchOutputRuleLabelOf,
  workbenchTaskIconOf,
}) {
  const renderWorkbenchInOutSlotBadgeChips = useCallback((slot) => {
    const slotNo = Math.max(0, Math.floor(Number(slot?.slotNo) || 0));
    const facilityKey = String(activeFacilityStorageKey || '');
    if (!facilityKey || slotNo <= 0) return null;
    const chipNodes = [];

    const sortingSelections = facilityStorageSortingInOutSelectionByFacility?.[facilityKey] || {};
    Object.entries(sortingSelections).forEach(([equipmentStorageKeyRaw, selection]) => {
      const equipmentStorageKey = String(equipmentStorageKeyRaw || '');
      if (!equipmentStorageKey) return;
      const inputSlotNos = normalizeSortingInOutSlotNoList(
        selection?.inputSlotNos ?? selection?.inputSlotNo
      );
      const outputSlotNos = normalizeSortingInOutSlotNoList(
        selection?.outputSlotNos ?? selection?.outputSlotNo
      );
      const outputRulesBySlotNo = normalizeSortingOutputRuleMap(
        selection?.outputRulesBySlotNo ?? selection?.outputAssignmentsBySlotNo
      );
      if (inputSlotNos.includes(slotNo)) {
        chipNodes.push(
          <span
            key={`sorting-input-${equipmentStorageKey}-${slotNo}`}
            className="warehouse-workbench-inout-slot-actions__chip warehouse-workbench-inout-slot-actions__chip--input"
          >
            ⚖️ 📥 투입
          </span>
        );
      }
      if (outputSlotNos.includes(slotNo)) {
        const outputRuleLabel = sortingOutputRuleLabelOf(outputRulesBySlotNo?.[slotNo] || null);
        chipNodes.push(
          <span
            key={`sorting-output-${equipmentStorageKey}-${slotNo}`}
            className="warehouse-workbench-inout-slot-actions__chip warehouse-workbench-inout-slot-actions__chip--output"
          >
            {outputRuleLabel ? `⚖️ 📤 ${outputRuleLabel}` : '⚖️ 📤 배출'}
          </span>
        );
      }
    });

    const workbenchSelections = facilityStorageWorkbenchInOutSelectionByFacility?.[facilityKey] || {};
    Object.entries(workbenchSelections).forEach(([workbenchSlotKeyRaw, selection]) => {
      const workbenchSlotKey = String(workbenchSlotKeyRaw || '');
      if (!workbenchSlotKey) return;
      const inputSlotNos = normalizeWorkbenchInOutSlotNoList(
        selection?.inputSlotNos ?? selection?.inputSlotNo
      );
      const outputSlotNos = normalizeWorkbenchInOutSlotNoList(
        selection?.outputSlotNos ?? selection?.outputSlotNo
      );
      const outputRulesBySlotNo = normalizeWorkbenchOutputRuleMap(
        selection?.outputRulesBySlotNo ?? selection?.outputAssignmentsBySlotNo
      );
      const selectedTaskKey = String(facilityStorageWorkbenchTaskByFacility?.[facilityKey]?.[workbenchSlotKey] || '');
      const selectedTaskIcon = workbenchTaskIconOf(selectedTaskKey);
      if (inputSlotNos.includes(slotNo)) {
        chipNodes.push(
          <span
            key={`workbench-input-${workbenchSlotKey}-${slotNo}`}
            className="warehouse-workbench-inout-slot-actions__chip warehouse-workbench-inout-slot-actions__chip--input"
          >
            {selectedTaskIcon ? `${selectedTaskIcon} 📥 투입` : '📥 투입'}
          </span>
        );
      }
      if (outputSlotNos.includes(slotNo)) {
        const outputRuleLabel = workbenchOutputRuleLabelOf(outputRulesBySlotNo?.[slotNo] || null);
        chipNodes.push(
          <span
            key={`workbench-output-${workbenchSlotKey}-${slotNo}`}
            className="warehouse-workbench-inout-slot-actions__chip warehouse-workbench-inout-slot-actions__chip--output"
          >
            {selectedTaskIcon
              ? `${selectedTaskIcon} 📤 ${outputRuleLabel || '배출'}`
              : `📤 ${outputRuleLabel || '배출'}`}
          </span>
        );
      }
    });

    if (!chipNodes.length) return null;
    return <>{chipNodes}</>;
  }, [
    activeFacilityStorageKey,
    facilityStorageSortingInOutSelectionByFacility,
    facilityStorageWorkbenchInOutSelectionByFacility,
    facilityStorageWorkbenchTaskByFacility,
    normalizeSortingInOutSlotNoList,
    normalizeSortingOutputRuleMap,
    normalizeWorkbenchInOutSlotNoList,
    normalizeWorkbenchOutputRuleMap,
    sortingOutputRuleLabelOf,
    workbenchOutputRuleLabelOf,
    workbenchTaskIconOf,
  ]);

  const selectWorkbenchTask = useCallback((taskKeyRaw) => {
    const facilityKey = String(facilityStorageWorkbenchTaskPicker?.facilityKey || '');
    const workbenchSlotKey = String(facilityStorageWorkbenchTaskPicker?.workbenchSlotKey || '');
    const taskKey = String(taskKeyRaw || '');
    if (!facilityKey || !workbenchSlotKey) return;
    setFacilityStorageWorkbenchTaskByFacility((prev) => {
      const next = { ...(prev || {}) };
      const nextFacilityTasks = { ...(next[facilityKey] || {}) };
      if (taskKey) {
        nextFacilityTasks[workbenchSlotKey] = taskKey;
      } else {
        delete nextFacilityTasks[workbenchSlotKey];
      }
      if (Object.keys(nextFacilityTasks).length) {
        next[facilityKey] = nextFacilityTasks;
      } else {
        delete next[facilityKey];
      }
      return next;
    });
    setFacilityStorageWorkbenchTaskPicker(null);
  }, [
    facilityStorageWorkbenchTaskPicker,
    setFacilityStorageWorkbenchTaskByFacility,
    setFacilityStorageWorkbenchTaskPicker,
  ]);

  const facilityStorageInOutSlotOwnersByFacility = useMemo(() => {
    const next = {};
    const pushOwner = (facilityKeyRaw, slotNoRaw, ownerKindRaw, ownerKeyRaw) => {
      const facilityKey = String(facilityKeyRaw || '');
      const ownerKind = String(ownerKindRaw || '');
      const ownerKey = String(ownerKeyRaw || '');
      const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
      if (!facilityKey || !ownerKind || !ownerKey || slotNo <= 0) return;
      const facilityMap = next[facilityKey] || {};
      const slotOwners = Array.isArray(facilityMap?.[slotNo]) ? facilityMap[slotNo] : [];
      slotOwners.push({ ownerKind, ownerKey });
      facilityMap[slotNo] = slotOwners;
      next[facilityKey] = facilityMap;
    };

    Object.entries(facilityStorageWorkbenchInOutSelectionByFacility || {}).forEach(([facilityKey, workbenchMap]) => {
      Object.entries(workbenchMap || {}).forEach(([workbenchSlotKey, selection]) => {
        const inputSlotNos = normalizeWorkbenchInOutSlotNoList(
          selection?.inputSlotNos ?? selection?.inputSlotNo
        );
        const outputSlotNos = normalizeWorkbenchInOutSlotNoList(
          selection?.outputSlotNos ?? selection?.outputSlotNo
        );
        [...inputSlotNos, ...outputSlotNos].forEach((slotNo) => {
          pushOwner(facilityKey, slotNo, 'workbench', workbenchSlotKey);
        });
      });
    });

    Object.entries(facilityStorageSortingInOutSelectionByFacility || {}).forEach(([facilityKey, equipmentMap]) => {
      Object.entries(equipmentMap || {}).forEach(([equipmentStorageKey, selection]) => {
        const inputSlotNos = normalizeSortingInOutSlotNoList(
          selection?.inputSlotNos ?? selection?.inputSlotNo
        );
        const outputSlotNos = normalizeSortingInOutSlotNoList(
          selection?.outputSlotNos ?? selection?.outputSlotNo
        );
        [...inputSlotNos, ...outputSlotNos].forEach((slotNo) => {
          pushOwner(facilityKey, slotNo, 'sorting', equipmentStorageKey);
        });
      });
    });

    return next;
  }, [
    facilityStorageWorkbenchInOutSelectionByFacility,
    facilityStorageSortingInOutSelectionByFacility,
    normalizeWorkbenchInOutSlotNoList,
    normalizeSortingInOutSlotNoList,
  ]);

  const hasOtherFacilityInOutOwner = useCallback((facilityKeyRaw, slotNoRaw, ownerKindRaw, ownerKeyRaw) => {
    const facilityKey = String(facilityKeyRaw || '');
    const ownerKind = String(ownerKindRaw || '');
    const ownerKey = String(ownerKeyRaw || '');
    const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
    if (!facilityKey || !ownerKind || !ownerKey || slotNo <= 0) return false;
    const slotOwners = facilityStorageInOutSlotOwnersByFacility?.[facilityKey]?.[slotNo];
    if (!Array.isArray(slotOwners) || slotOwners.length <= 0) return false;
    return slotOwners.some((entry) => (
      String(entry?.ownerKind || '') !== ownerKind
      || String(entry?.ownerKey || '') !== ownerKey
    ));
  }, [facilityStorageInOutSlotOwnersByFacility]);

  return {
    hasOtherFacilityInOutOwner,
    renderWorkbenchInOutSlotBadgeChips,
    selectWorkbenchTask,
  };
}
