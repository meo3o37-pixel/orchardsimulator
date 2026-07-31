import { useCallback } from 'react';
import { pushDiary, roundKg } from '../../utils/common';
import { buildHarvestPalletSlotMeta } from '../harvest/harvestPalletGrid';
import { normalizeHarvestPalletMemoColor, resolveHarvestPalletMemoLayer } from './harvestPalletMemo';
import { sortingCargoStorageSlotNoOf } from './workbenchStorageSlots';

export function useWarehouseStorageModalOpeners({
  activeFacilityStorageKey,
  setFacilityStorageWorkbenchTaskPicker,
  setFacilityStorageWorkbenchBoxPicker,
  setFacilityStorageSortingBoxPicker,
  setFacilityStorageWorkbenchInOutFocus,
  setFacilityStorageWorkbenchInOutModal,
  setFacilityStorageSortingInOutFocus,
  setFacilityStorageSortingInOutModal,
  setFacilityStorageSelectedCarrierId,
  setFacilityStorageSelectedTransportKey,
  setFacilityStorageHarvestMovePicker,
}) {
  const openWorkbenchTaskPicker = useCallback((workbenchSlotKeyRaw, workbenchSlotLabelRaw = '', workbenchNameRaw = '') => {
    const facilityKey = String(activeFacilityStorageKey || '');
    const workbenchSlotKey = String(workbenchSlotKeyRaw || '');
    if (!facilityKey || !workbenchSlotKey) return;
    setFacilityStorageWorkbenchTaskPicker({
      facilityKey,
      workbenchSlotKey,
      workbenchSlotLabel: String(workbenchSlotLabelRaw || '').trim(),
      workbenchName: String(workbenchNameRaw || '').trim() || '작업대',
    });
  }, [activeFacilityStorageKey, setFacilityStorageWorkbenchTaskPicker]);

  const closeWorkbenchTaskPicker = useCallback(() => {
    setFacilityStorageWorkbenchTaskPicker(null);
  }, [setFacilityStorageWorkbenchTaskPicker]);

  const openWorkbenchBoxPicker = useCallback((workbenchSlotKeyRaw, workbenchSlotLabelRaw = '', workbenchNameRaw = '') => {
    const facilityKey = String(activeFacilityStorageKey || '');
    const workbenchSlotKey = String(workbenchSlotKeyRaw || '');
    if (!facilityKey || !workbenchSlotKey) return;
    setFacilityStorageWorkbenchBoxPicker({
      facilityKey,
      workbenchSlotKey,
      workbenchSlotLabel: String(workbenchSlotLabelRaw || '').trim(),
      workbenchName: String(workbenchNameRaw || '').trim() || '작업대',
    });
  }, [activeFacilityStorageKey, setFacilityStorageWorkbenchBoxPicker]);

  const closeWorkbenchBoxPicker = useCallback(() => {
    setFacilityStorageWorkbenchBoxPicker(null);
  }, [setFacilityStorageWorkbenchBoxPicker]);

  const openSortingBoxPicker = useCallback((sortingSlotKeyRaw, equipmentStorageKeyRaw, sortingSlotLabelRaw = '', equipmentNameRaw = '') => {
    const facilityKey = String(activeFacilityStorageKey || '');
    const sortingSlotKey = String(sortingSlotKeyRaw || '');
    const equipmentStorageKey = String(equipmentStorageKeyRaw || '');
    if (!facilityKey || !sortingSlotKey || !equipmentStorageKey) return;
    setFacilityStorageSortingBoxPicker({
      facilityKey,
      sortingSlotKey,
      equipmentStorageKey,
      sortingSlotLabel: String(sortingSlotLabelRaw || '').trim(),
      equipmentName: String(equipmentNameRaw || '').trim() || '선별기',
    });
  }, [activeFacilityStorageKey, setFacilityStorageSortingBoxPicker]);

  const closeSortingBoxPicker = useCallback(() => {
    setFacilityStorageSortingBoxPicker(null);
  }, [setFacilityStorageSortingBoxPicker]);

  const openWorkbenchInOutModal = useCallback((workbenchSlotKeyRaw, workbenchSlotLabelRaw = '', workbenchNameRaw = '') => {
    const facilityKey = String(activeFacilityStorageKey || '');
    const workbenchSlotKey = String(workbenchSlotKeyRaw || '');
    if (!facilityKey || !workbenchSlotKey) return;
    const nextFocus = {
      facilityKey,
      workbenchSlotKey,
      workbenchSlotLabel: String(workbenchSlotLabelRaw || '').trim(),
      workbenchName: String(workbenchNameRaw || '').trim() || '작업대',
    };
    setFacilityStorageSelectedCarrierId('');
    setFacilityStorageSelectedTransportKey('');
    setFacilityStorageHarvestMovePicker(null);
    setFacilityStorageWorkbenchInOutFocus(nextFocus);
    setFacilityStorageWorkbenchInOutModal(nextFocus);
  }, [
    activeFacilityStorageKey,
    setFacilityStorageHarvestMovePicker,
    setFacilityStorageSelectedCarrierId,
    setFacilityStorageSelectedTransportKey,
    setFacilityStorageWorkbenchInOutFocus,
    setFacilityStorageWorkbenchInOutModal,
  ]);

  const closeWorkbenchInOutModal = useCallback(() => {
    setFacilityStorageWorkbenchInOutModal(null);
  }, [setFacilityStorageWorkbenchInOutModal]);

  const openSortingInOutModal = useCallback((sortingSlotKeyRaw, equipmentStorageKeyRaw, sortingSlotLabelRaw = '', equipmentNameRaw = '') => {
    const facilityKey = String(activeFacilityStorageKey || '');
    const sortingSlotKey = String(sortingSlotKeyRaw || '');
    const equipmentStorageKey = String(equipmentStorageKeyRaw || '');
    if (!facilityKey || !sortingSlotKey || !equipmentStorageKey) return;
    const nextFocus = {
      facilityKey,
      sortingSlotKey,
      equipmentStorageKey,
      sortingSlotLabel: String(sortingSlotLabelRaw || '').trim(),
      equipmentName: String(equipmentNameRaw || '').trim() || '선별기',
      workbenchSlotLabel: String(sortingSlotLabelRaw || '').trim(),
      workbenchName: String(equipmentNameRaw || '').trim() || '선별기',
    };
    setFacilityStorageSelectedCarrierId('');
    setFacilityStorageSelectedTransportKey('');
    setFacilityStorageHarvestMovePicker(null);
    setFacilityStorageSortingInOutFocus(nextFocus);
    setFacilityStorageSortingInOutModal(nextFocus);
  }, [
    activeFacilityStorageKey,
    setFacilityStorageHarvestMovePicker,
    setFacilityStorageSelectedCarrierId,
    setFacilityStorageSelectedTransportKey,
    setFacilityStorageSortingInOutFocus,
    setFacilityStorageSortingInOutModal,
  ]);

  const closeSortingInOutModal = useCallback(() => {
    setFacilityStorageSortingInOutModal(null);
  }, [setFacilityStorageSortingInOutModal]);

  return {
    openWorkbenchTaskPicker,
    closeWorkbenchTaskPicker,
    openWorkbenchBoxPicker,
    closeWorkbenchBoxPicker,
    openSortingBoxPicker,
    closeSortingBoxPicker,
    openWorkbenchInOutModal,
    closeWorkbenchInOutModal,
    openSortingInOutModal,
    closeSortingInOutModal,
  };
}

export function useWarehouseStorageInOutActions({
  facilityStorageHarvestTopLayerSlotNoSet,
  facilityStorageWorkbenchInOutModal,
  facilityStorageWorkbenchSlots,
  facilityStorageSortingInOutModal,
  facilityStorageWorkbenchInOutSelectionByFacility,
  facilityStorageSortingInOutSelectionByFacility,
  facilityStorageWorkbenchOutputRulePicker,
  facilityStorageSortingOutputRulePicker,
  normalizeWorkbenchInOutSlotNoList,
  normalizeSortingInOutSlotNoList,
  normalizeWorkbenchOutputRuleMap,
  normalizeSortingOutputRuleMap,
  normalizeWorkbenchOutputRule,
  normalizeSortingOutputRule,
  setFacilityStorageWorkbenchInOutSelectionByFacility,
  setFacilityStorageSortingInOutSelectionByFacility,
  setFacilityStorageWorkbenchOutputRulePicker,
  setFacilityStorageSortingOutputRulePicker,
}) {
  const toggleWorkbenchInOutSlotSelection = useCallback((modeRaw, slotNoRaw) => {
    const facilityKey = String(facilityStorageWorkbenchInOutModal?.facilityKey || '');
    const workbenchSlotKey = String(facilityStorageWorkbenchInOutModal?.workbenchSlotKey || '');
    const mode = String(modeRaw || '');
    const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
    if (!facilityKey || !workbenchSlotKey || slotNo <= 0) return;
    if (mode !== 'input' && mode !== 'output') return;
    if (facilityStorageHarvestTopLayerSlotNoSet.has(slotNo)) return;
    const workbenchSlot = (Array.isArray(facilityStorageWorkbenchSlots) ? facilityStorageWorkbenchSlots : [])
      .find((slot) => String(slot?.key || '') === workbenchSlotKey) || null;
    const installedTableKey = String(workbenchSlot?.installedTable?.tableKey || '');
    const maxInputSlotCount = installedTableKey === 'simpleWorkbench' ? 3 : Number.POSITIVE_INFINITY;
    setFacilityStorageWorkbenchInOutSelectionByFacility((prev) => {
      const next = { ...(prev || {}) };
      const nextFacility = { ...(next[facilityKey] || {}) };
      const currentWorkbench = nextFacility?.[workbenchSlotKey] || {};
      const inputSlotNos = normalizeWorkbenchInOutSlotNoList(
        currentWorkbench?.inputSlotNos ?? currentWorkbench?.inputSlotNo
      );
      const outputSlotNos = normalizeWorkbenchInOutSlotNoList(
        currentWorkbench?.outputSlotNos ?? currentWorkbench?.outputSlotNo
      );
      const outputRulesBySlotNo = normalizeWorkbenchOutputRuleMap(
        currentWorkbench?.outputRulesBySlotNo ?? currentWorkbench?.outputAssignmentsBySlotNo
      );
      const nextWorkbench = {
        inputSlotNos,
        outputSlotNos,
        outputRulesBySlotNo,
      };
      const targetKey = mode === 'input' ? 'inputSlotNos' : 'outputSlotNos';
      const oppositeKey = mode === 'input' ? 'outputSlotNos' : 'inputSlotNos';
      const isAlreadySelected = nextWorkbench[targetKey].includes(slotNo);
      if (mode === 'input' && !isAlreadySelected && nextWorkbench[targetKey].length >= maxInputSlotCount) {
        window.alert('간이 작업대 투입칸은 최대 3개까지 선택할 수 있습니다.');
        return prev;
      }
      nextWorkbench[targetKey] = isAlreadySelected
        ? nextWorkbench[targetKey].filter((entrySlotNo) => entrySlotNo !== slotNo)
        : [...nextWorkbench[targetKey], slotNo];
      if (!isAlreadySelected) {
        nextWorkbench[oppositeKey] = nextWorkbench[oppositeKey].filter(
          (entrySlotNo) => entrySlotNo !== slotNo
        );
        if (mode === 'input') {
          delete nextWorkbench.outputRulesBySlotNo[slotNo];
        }
      }
      if (mode === 'output' && isAlreadySelected) {
        delete nextWorkbench.outputRulesBySlotNo[slotNo];
      }
      if (nextWorkbench.inputSlotNos.length > 0 || nextWorkbench.outputSlotNos.length > 0) {
        nextFacility[workbenchSlotKey] = nextWorkbench;
      } else {
        delete nextFacility[workbenchSlotKey];
      }
      if (Object.keys(nextFacility).length > 0) {
        next[facilityKey] = nextFacility;
      } else {
        delete next[facilityKey];
      }
      return next;
    });
  }, [
    facilityStorageHarvestTopLayerSlotNoSet,
    facilityStorageWorkbenchInOutModal,
    facilityStorageWorkbenchSlots,
    normalizeWorkbenchInOutSlotNoList,
    normalizeWorkbenchOutputRuleMap,
    setFacilityStorageWorkbenchInOutSelectionByFacility,
  ]);

  const toggleSortingInOutSlotSelection = useCallback((modeRaw, slotNoRaw) => {
    const facilityKey = String(facilityStorageSortingInOutModal?.facilityKey || '');
    const equipmentStorageKey = String(facilityStorageSortingInOutModal?.equipmentStorageKey || '');
    const mode = String(modeRaw || '');
    const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
    if (!facilityKey || !equipmentStorageKey || slotNo <= 0) return;
    if (mode !== 'input' && mode !== 'output') return;
    if (facilityStorageHarvestTopLayerSlotNoSet.has(slotNo)) return;
    setFacilityStorageSortingInOutSelectionByFacility((prev) => {
      const next = { ...(prev || {}) };
      const nextFacility = { ...(next[facilityKey] || {}) };
      const currentEquipment = nextFacility?.[equipmentStorageKey] || {};
      const inputSlotNos = normalizeSortingInOutSlotNoList(
        currentEquipment?.inputSlotNos ?? currentEquipment?.inputSlotNo
      );
      const outputSlotNos = normalizeSortingInOutSlotNoList(
        currentEquipment?.outputSlotNos ?? currentEquipment?.outputSlotNo
      );
      const outputRulesBySlotNo = normalizeSortingOutputRuleMap(
        currentEquipment?.outputRulesBySlotNo ?? currentEquipment?.outputAssignmentsBySlotNo
      );
      const nextEquipment = {
        inputSlotNos,
        outputSlotNos,
        outputRulesBySlotNo,
      };
      const targetKey = mode === 'input' ? 'inputSlotNos' : 'outputSlotNos';
      const oppositeKey = mode === 'input' ? 'outputSlotNos' : 'inputSlotNos';
      const isAlreadySelected = nextEquipment[targetKey].includes(slotNo);
      if (mode === 'input' && !isAlreadySelected && nextEquipment.inputSlotNos.length >= 1) {
        window.alert('선별기 투입칸은 1개만 선택할 수 있습니다.');
        return prev;
      }
      nextEquipment[targetKey] = isAlreadySelected
        ? nextEquipment[targetKey].filter((entrySlotNo) => entrySlotNo !== slotNo)
        : [...nextEquipment[targetKey], slotNo];
      if (!isAlreadySelected) {
        nextEquipment[oppositeKey] = nextEquipment[oppositeKey].filter((entrySlotNo) => entrySlotNo !== slotNo);
        if (mode === 'input') {
          delete nextEquipment.outputRulesBySlotNo[slotNo];
        }
      }
      if (mode === 'output' && isAlreadySelected) {
        delete nextEquipment.outputRulesBySlotNo[slotNo];
      }
      if (nextEquipment.inputSlotNos.length > 0 || nextEquipment.outputSlotNos.length > 0) {
        nextFacility[equipmentStorageKey] = nextEquipment;
      } else {
        delete nextFacility[equipmentStorageKey];
      }
      if (Object.keys(nextFacility).length > 0) {
        next[facilityKey] = nextFacility;
      } else {
        delete next[facilityKey];
      }
      return next;
    });
  }, [
    facilityStorageHarvestTopLayerSlotNoSet,
    facilityStorageSortingInOutModal,
    normalizeSortingInOutSlotNoList,
    normalizeSortingOutputRuleMap,
    setFacilityStorageSortingInOutSelectionByFacility,
  ]);

  const openSortingOutputRulePicker = useCallback((slotNoRaw) => {
    const facilityKey = String(facilityStorageSortingInOutModal?.facilityKey || '');
    const equipmentStorageKey = String(facilityStorageSortingInOutModal?.equipmentStorageKey || '');
    const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
    if (!facilityKey || !equipmentStorageKey || slotNo <= 0) return;
    const currentSelection = facilityStorageSortingInOutSelectionByFacility?.[facilityKey]?.[equipmentStorageKey] || null;
    const outputRulesBySlotNo = normalizeSortingOutputRuleMap(
      currentSelection?.outputRulesBySlotNo ?? currentSelection?.outputAssignmentsBySlotNo
    );
    setFacilityStorageSortingOutputRulePicker({
      facilityKey,
      equipmentStorageKey,
      slotNo,
      equipmentName: String(facilityStorageSortingInOutModal?.equipmentName || '선별기'),
      currentRule: outputRulesBySlotNo[slotNo] || null,
      selectedGradeLabel: String(outputRulesBySlotNo?.[slotNo]?.gradeLabel || 'A급'),
    });
  }, [
    facilityStorageSortingInOutModal,
    facilityStorageSortingInOutSelectionByFacility,
    normalizeSortingOutputRuleMap,
    setFacilityStorageSortingOutputRulePicker,
  ]);

  const closeSortingOutputRulePicker = useCallback(() => {
    setFacilityStorageSortingOutputRulePicker(null);
  }, [setFacilityStorageSortingOutputRulePicker]);

  const selectSortingOutputRuleGrade = useCallback((gradeLabelRaw) => {
    const gradeLabel = String(gradeLabelRaw || '').trim();
    if (!gradeLabel) return;
    setFacilityStorageSortingOutputRulePicker((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        selectedGradeLabel: gradeLabel,
      };
    });
  }, [setFacilityStorageSortingOutputRulePicker]);

  const selectSortingOutputRule = useCallback((ruleRaw) => {
    const facilityKey = String(facilityStorageSortingOutputRulePicker?.facilityKey || '');
    const equipmentStorageKey = String(facilityStorageSortingOutputRulePicker?.equipmentStorageKey || '');
    const slotNo = Math.max(0, Math.floor(Number(facilityStorageSortingOutputRulePicker?.slotNo || 0) || 0));
    const normalizedRule = normalizeSortingOutputRule(ruleRaw);
    if (!facilityKey || !equipmentStorageKey || slotNo <= 0 || !normalizedRule) return;
    setFacilityStorageSortingInOutSelectionByFacility((prev) => {
      const next = { ...(prev || {}) };
      const nextFacility = { ...(next[facilityKey] || {}) };
      const currentEquipment = nextFacility?.[equipmentStorageKey] || {};
      const inputSlotNos = normalizeSortingInOutSlotNoList(
        currentEquipment?.inputSlotNos ?? currentEquipment?.inputSlotNo
      ).filter((entrySlotNo) => entrySlotNo !== slotNo);
      const outputSlotNos = normalizeSortingInOutSlotNoList(
        currentEquipment?.outputSlotNos ?? currentEquipment?.outputSlotNo
      );
      const outputRulesBySlotNo = normalizeSortingOutputRuleMap(
        currentEquipment?.outputRulesBySlotNo ?? currentEquipment?.outputAssignmentsBySlotNo
      );
      if (!outputSlotNos.includes(slotNo)) {
        outputSlotNos.push(slotNo);
      }
      outputRulesBySlotNo[slotNo] = normalizedRule;
      nextFacility[equipmentStorageKey] = {
        inputSlotNos,
        outputSlotNos,
        outputRulesBySlotNo,
      };
      next[facilityKey] = nextFacility;
      return next;
    });
    setFacilityStorageSortingOutputRulePicker(null);
  }, [
    facilityStorageSortingOutputRulePicker,
    normalizeSortingInOutSlotNoList,
    normalizeSortingOutputRule,
    normalizeSortingOutputRuleMap,
    setFacilityStorageSortingInOutSelectionByFacility,
    setFacilityStorageSortingOutputRulePicker,
  ]);

  const clearSortingOutputRule = useCallback((slotNoRaw = null) => {
    const facilityKey = String(
      facilityStorageSortingOutputRulePicker?.facilityKey
      || facilityStorageSortingInOutModal?.facilityKey
      || ''
    );
    const equipmentStorageKey = String(
      facilityStorageSortingOutputRulePicker?.equipmentStorageKey
      || facilityStorageSortingInOutModal?.equipmentStorageKey
      || ''
    );
    const slotNo = Math.max(
      0,
      Math.floor(
        Number(
          slotNoRaw
          ?? facilityStorageSortingOutputRulePicker?.slotNo
          ?? 0
        ) || 0
      )
    );
    if (!facilityKey || !equipmentStorageKey || slotNo <= 0) return;
    setFacilityStorageSortingInOutSelectionByFacility((prev) => {
      const next = { ...(prev || {}) };
      const nextFacility = { ...(next[facilityKey] || {}) };
      const currentEquipment = nextFacility?.[equipmentStorageKey] || {};
      const inputSlotNos = normalizeSortingInOutSlotNoList(
        currentEquipment?.inputSlotNos ?? currentEquipment?.inputSlotNo
      );
      const outputSlotNos = normalizeSortingInOutSlotNoList(
        currentEquipment?.outputSlotNos ?? currentEquipment?.outputSlotNo
      ).filter((entrySlotNo) => entrySlotNo !== slotNo);
      const outputRulesBySlotNo = normalizeSortingOutputRuleMap(
        currentEquipment?.outputRulesBySlotNo ?? currentEquipment?.outputAssignmentsBySlotNo
      );
      delete outputRulesBySlotNo[slotNo];
      if (inputSlotNos.length > 0 || outputSlotNos.length > 0) {
        nextFacility[equipmentStorageKey] = {
          inputSlotNos,
          outputSlotNos,
          outputRulesBySlotNo,
        };
        next[facilityKey] = nextFacility;
      } else {
        delete nextFacility[equipmentStorageKey];
        if (Object.keys(nextFacility).length > 0) {
          next[facilityKey] = nextFacility;
        } else {
          delete next[facilityKey];
        }
      }
      return next;
    });
    setFacilityStorageSortingOutputRulePicker((prev) => {
      if (Math.max(0, Math.floor(Number(prev?.slotNo || 0) || 0)) !== slotNo) return prev;
      return null;
    });
  }, [
    facilityStorageSortingInOutModal,
    facilityStorageSortingOutputRulePicker,
    normalizeSortingInOutSlotNoList,
    normalizeSortingOutputRuleMap,
    setFacilityStorageSortingInOutSelectionByFacility,
    setFacilityStorageSortingOutputRulePicker,
  ]);

  const openWorkbenchOutputRulePicker = useCallback((slotNoRaw) => {
    const facilityKey = String(facilityStorageWorkbenchInOutModal?.facilityKey || '');
    const workbenchSlotKey = String(facilityStorageWorkbenchInOutModal?.workbenchSlotKey || '');
    const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
    if (!facilityKey || !workbenchSlotKey || slotNo <= 0) return;
    const currentSelection = facilityStorageWorkbenchInOutSelectionByFacility?.[facilityKey]?.[workbenchSlotKey] || null;
    const outputRulesBySlotNo = normalizeWorkbenchOutputRuleMap(
      currentSelection?.outputRulesBySlotNo ?? currentSelection?.outputAssignmentsBySlotNo
    );
    setFacilityStorageWorkbenchOutputRulePicker({
      facilityKey,
      workbenchSlotKey,
      slotNo,
      workbenchName: String(facilityStorageWorkbenchInOutModal?.workbenchName || '작업대'),
      currentRule: outputRulesBySlotNo[slotNo] || null,
      selectedGradeLabel: String(outputRulesBySlotNo?.[slotNo]?.gradeLabel || 'A급'),
    });
  }, [
    facilityStorageWorkbenchInOutModal,
    facilityStorageWorkbenchInOutSelectionByFacility,
    normalizeWorkbenchOutputRuleMap,
    setFacilityStorageWorkbenchOutputRulePicker,
  ]);

  const closeWorkbenchOutputRulePicker = useCallback(() => {
    setFacilityStorageWorkbenchOutputRulePicker(null);
  }, [setFacilityStorageWorkbenchOutputRulePicker]);

  const selectWorkbenchOutputRuleGrade = useCallback((gradeLabelRaw) => {
    const gradeLabel = String(gradeLabelRaw || '').trim();
    if (!gradeLabel) return;
    setFacilityStorageWorkbenchOutputRulePicker((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        selectedGradeLabel: gradeLabel,
      };
    });
  }, [setFacilityStorageWorkbenchOutputRulePicker]);

  const selectWorkbenchOutputRule = useCallback((ruleRaw) => {
    const facilityKey = String(facilityStorageWorkbenchOutputRulePicker?.facilityKey || '');
    const workbenchSlotKey = String(facilityStorageWorkbenchOutputRulePicker?.workbenchSlotKey || '');
    const slotNo = Math.max(0, Math.floor(Number(facilityStorageWorkbenchOutputRulePicker?.slotNo || 0) || 0));
    const normalizedRule = normalizeWorkbenchOutputRule(ruleRaw);
    if (!facilityKey || !workbenchSlotKey || slotNo <= 0 || !normalizedRule) return;
    setFacilityStorageWorkbenchInOutSelectionByFacility((prev) => {
      const next = { ...(prev || {}) };
      const nextFacility = { ...(next[facilityKey] || {}) };
      const currentWorkbench = nextFacility?.[workbenchSlotKey] || {};
      const inputSlotNos = normalizeWorkbenchInOutSlotNoList(
        currentWorkbench?.inputSlotNos ?? currentWorkbench?.inputSlotNo
      ).filter((entrySlotNo) => entrySlotNo !== slotNo);
      const outputSlotNos = normalizeWorkbenchInOutSlotNoList(
        currentWorkbench?.outputSlotNos ?? currentWorkbench?.outputSlotNo
      );
      const outputRulesBySlotNo = normalizeWorkbenchOutputRuleMap(
        currentWorkbench?.outputRulesBySlotNo ?? currentWorkbench?.outputAssignmentsBySlotNo
      );
      if (!outputSlotNos.includes(slotNo)) {
        outputSlotNos.push(slotNo);
      }
      outputRulesBySlotNo[slotNo] = normalizedRule;
      nextFacility[workbenchSlotKey] = {
        inputSlotNos,
        outputSlotNos,
        outputRulesBySlotNo,
      };
      next[facilityKey] = nextFacility;
      return next;
    });
    setFacilityStorageWorkbenchOutputRulePicker(null);
  }, [
    facilityStorageWorkbenchOutputRulePicker,
    normalizeWorkbenchInOutSlotNoList,
    normalizeWorkbenchOutputRule,
    normalizeWorkbenchOutputRuleMap,
    setFacilityStorageWorkbenchInOutSelectionByFacility,
    setFacilityStorageWorkbenchOutputRulePicker,
  ]);

  const clearWorkbenchOutputRule = useCallback((slotNoRaw = null) => {
    const facilityKey = String(
      facilityStorageWorkbenchOutputRulePicker?.facilityKey
      || facilityStorageWorkbenchInOutModal?.facilityKey
      || ''
    );
    const workbenchSlotKey = String(
      facilityStorageWorkbenchOutputRulePicker?.workbenchSlotKey
      || facilityStorageWorkbenchInOutModal?.workbenchSlotKey
      || ''
    );
    const slotNo = Math.max(
      0,
      Math.floor(
        Number(
          slotNoRaw
          ?? facilityStorageWorkbenchOutputRulePicker?.slotNo
          ?? 0
        ) || 0
      )
    );
    if (!facilityKey || !workbenchSlotKey || slotNo <= 0) return;
    setFacilityStorageWorkbenchInOutSelectionByFacility((prev) => {
      const next = { ...(prev || {}) };
      const nextFacility = { ...(next[facilityKey] || {}) };
      const currentWorkbench = nextFacility?.[workbenchSlotKey] || {};
      const inputSlotNos = normalizeWorkbenchInOutSlotNoList(
        currentWorkbench?.inputSlotNos ?? currentWorkbench?.inputSlotNo
      );
      const outputSlotNos = normalizeWorkbenchInOutSlotNoList(
        currentWorkbench?.outputSlotNos ?? currentWorkbench?.outputSlotNo
      ).filter((entrySlotNo) => entrySlotNo !== slotNo);
      const outputRulesBySlotNo = normalizeWorkbenchOutputRuleMap(
        currentWorkbench?.outputRulesBySlotNo ?? currentWorkbench?.outputAssignmentsBySlotNo
      );
      delete outputRulesBySlotNo[slotNo];
      if (inputSlotNos.length > 0 || outputSlotNos.length > 0) {
        nextFacility[workbenchSlotKey] = {
          inputSlotNos,
          outputSlotNos,
          outputRulesBySlotNo,
        };
        next[facilityKey] = nextFacility;
      } else {
        delete nextFacility[workbenchSlotKey];
        if (Object.keys(nextFacility).length > 0) {
          next[facilityKey] = nextFacility;
        } else {
          delete next[facilityKey];
        }
      }
      return next;
    });
    setFacilityStorageWorkbenchOutputRulePicker((prev) => {
      if (Math.max(0, Math.floor(Number(prev?.slotNo || 0) || 0)) !== slotNo) return prev;
      return null;
    });
  }, [
    facilityStorageWorkbenchInOutModal,
    facilityStorageWorkbenchOutputRulePicker,
    normalizeWorkbenchInOutSlotNoList,
    normalizeWorkbenchOutputRuleMap,
    setFacilityStorageWorkbenchInOutSelectionByFacility,
    setFacilityStorageWorkbenchOutputRulePicker,
  ]);

  return {
    toggleWorkbenchInOutSlotSelection,
    toggleSortingInOutSlotSelection,
    openSortingOutputRulePicker,
    closeSortingOutputRulePicker,
    selectSortingOutputRuleGrade,
    selectSortingOutputRule,
    clearSortingOutputRule,
    openWorkbenchOutputRulePicker,
    closeWorkbenchOutputRulePicker,
    selectWorkbenchOutputRuleGrade,
    selectWorkbenchOutputRule,
    clearWorkbenchOutputRule,
  };
}

function getHarvestBatchDedicatedStorageKind(batch = null) {
  const sortingEquipmentKey = String(batch?.storageSortingEquipmentKey || '');
  const sortingPositionKey = String(batch?.storageSortingPositionKey || '');
  if (sortingEquipmentKey && sortingPositionKey) return 'sorting';
  const workbenchFacilityKey = String(batch?.storageWorkbenchFacilityKey || '');
  const workbenchSlotKey = String(batch?.storageWorkbenchSlotKey || '');
  const workbenchCargoSlotKey = String(batch?.storageWorkbenchCargoSlotKey || '');
  if (workbenchFacilityKey && workbenchSlotKey && workbenchCargoSlotKey) return 'workbench';
  return '';
}

function clearHarvestBatchDedicatedStorageFields() {
  return {
    storageSortingEquipmentKey: '',
    storageSortingPositionKey: '',
    storageWorkbenchFacilityKey: '',
    storageWorkbenchSlotKey: '',
    storageWorkbenchCargoSlotKey: '',
  };
}

function matchHarvestBatchStorageSlot(batch, options = {}) {
  const slotNo = Math.max(0, Math.floor(Number(options?.slotNo || 0) || 0));
  const facilityKey = String(options?.facilityKey || '');
  const dedicatedKind = String(options?.dedicatedKind || '');
  if (slotNo <= 0) return false;
  if (dedicatedKind === 'sorting') {
    return (
      getHarvestBatchDedicatedStorageKind(batch) === 'sorting'
      && String(batch?.storageSortingEquipmentKey || '') === String(options?.sortingEquipmentKey || '')
      && String(batch?.storageSortingPositionKey || '') === String(options?.sortingPositionKey || '')
      && String(batch?.storageFacilityKey || '') === facilityKey
      && Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0)) === slotNo
    );
  }
  if (dedicatedKind === 'workbench') {
    return (
      getHarvestBatchDedicatedStorageKind(batch) === 'workbench'
      && String(batch?.storageWorkbenchFacilityKey || '') === facilityKey
      && String(batch?.storageWorkbenchSlotKey || '') === String(options?.workbenchSlotKey || '')
      && String(batch?.storageWorkbenchCargoSlotKey || '') === String(options?.workbenchCargoSlotKey || '')
      && Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0)) === slotNo
    );
  }
  return (
    !getHarvestBatchDedicatedStorageKind(batch)
    && String(batch?.storageFacilityKey || '') === facilityKey
    && Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0)) === slotNo
  );
}

function buildHarvestBatchStoragePatch({
  targetType = '',
  targetFacilityKey = '',
  targetFacilityUnitIndex = 0,
  targetFacilityUnitKey = '',
  nextTargetSlotNo = 0,
  targetLayerNo = 0,
  targetGroupId = '',
  targetVehicleInstanceId = '',
  targetVehiclePalletSlotNo = 0,
  targetIsSortingCargoSlot = false,
  targetSortingEquipmentKey = '',
  targetSortingPositionKey = '',
  targetIsWorkbenchCargoSlot = false,
  targetWorkbenchFacilityKey = '',
  targetWorkbenchSlotKey = '',
  targetWorkbenchCargoSlotKey = '',
} = {}) {
  if (targetType === 'vehicle-slot') {
    return {
      storageFacilityKey: '',
      storageFacilityUnitIndex: 0,
      storageFacilityUnitKey: '',
      storagePalletGroupId: '',
      storagePalletSlotNo: 0,
      storagePalletNo: 0,
      storagePalletLayer: 0,
      storageVehicleInstanceId: String(targetVehicleInstanceId || ''),
      storageVehiclePalletSlotNo: Math.max(0, Math.floor(Number(targetVehiclePalletSlotNo) || 0)),
      ...clearHarvestBatchDedicatedStorageFields(),
    };
  }
  const dedicatedFields = targetIsSortingCargoSlot
    ? {
      storageSortingEquipmentKey: String(targetSortingEquipmentKey || ''),
      storageSortingPositionKey: String(targetSortingPositionKey || ''),
      storageWorkbenchFacilityKey: '',
      storageWorkbenchSlotKey: '',
      storageWorkbenchCargoSlotKey: '',
    }
    : (
      targetIsWorkbenchCargoSlot
        ? {
          storageSortingEquipmentKey: '',
          storageSortingPositionKey: '',
          storageWorkbenchFacilityKey: String(targetWorkbenchFacilityKey || targetFacilityKey || ''),
          storageWorkbenchSlotKey: String(targetWorkbenchSlotKey || ''),
          storageWorkbenchCargoSlotKey: String(targetWorkbenchCargoSlotKey || ''),
        }
        : clearHarvestBatchDedicatedStorageFields()
    );
  return {
    storageFacilityKey: String(targetFacilityKey || ''),
    storageFacilityUnitIndex: Math.max(0, Math.floor(Number(targetFacilityUnitIndex) || 0)),
    storageFacilityUnitKey: String(targetFacilityUnitKey || ''),
    storagePalletGroupId: String(targetGroupId || ''),
    storagePalletSlotNo: Math.max(0, Math.floor(Number(nextTargetSlotNo) || 0)),
    storagePalletNo: Math.max(0, Math.floor(Number(nextTargetSlotNo) || 0)),
    storagePalletLayer: Math.max(0, Math.floor(Number(targetLayerNo) || 0)),
    storageVehicleInstanceId: '',
    storageVehiclePalletSlotNo: 0,
    ...dedicatedFields,
  };
}

function canonicalizePalletizedHarvestVisualSlots(storageRows = [], harvestBoxCapacityKg = 20) {
  if (!Array.isArray(storageRows) || !storageRows.length) return storageRows;
  const safeHarvestBoxCapacityKg = Math.max(0.001, Number(harvestBoxCapacityKg) || 20);
  const normalizeVisualSlotNo = (slotNoRaw, maxBoxes = 36) => {
    const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
    return slotNo >= 1 && slotNo <= maxBoxes ? slotNo : 0;
  };
  const isFullHarvestBoxQty = (qtyKgRaw) => Math.max(0, Number(qtyKgRaw) || 0) >= safeHarvestBoxCapacityKg - 0.001;
  const groupedRows = new Map();
  storageRows.forEach((batch, index) => {
    if (!batch?.palletized) return;
    const facilityKey = String(batch?.storageFacilityKey || '');
    const slotNo = Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0));
    const vehicleInstanceId = String(batch?.storageVehicleInstanceId || '');
    const vehicleSlotNo = Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0));
    const layerNo = Math.max(1, Math.min(2, Math.floor(Number(
      vehicleInstanceId ? (batch?.storageVehiclePalletLayer || 1) : (batch?.storagePalletLayer || 1)
    ) || 1)));
    if (slotNo <= 0 && vehicleSlotNo <= 0) return;
    const dedicatedKind = getHarvestBatchDedicatedStorageKind(batch);
    const groupKey = vehicleInstanceId
      ? `vehicle:${vehicleInstanceId}:${vehicleSlotNo}:${layerNo}`
      : (
        dedicatedKind === 'sorting'
          ? `sorting:${facilityKey}:${String(batch?.storageSortingEquipmentKey || '')}:${String(batch?.storageSortingPositionKey || '')}:${slotNo}:${layerNo}`
          : (
            dedicatedKind === 'workbench'
              ? `workbench:${String(batch?.storageWorkbenchFacilityKey || facilityKey || '')}:${String(batch?.storageWorkbenchSlotKey || '')}:${String(batch?.storageWorkbenchCargoSlotKey || '')}:${slotNo}:${layerNo}`
              : `warehouse:${facilityKey}:${slotNo}:${layerNo}`
          )
      );
    const rows = groupedRows.get(groupKey) || [];
    rows.push({
      rowIndex: index,
      batch,
      visualSlotNo: normalizeVisualSlotNo(batch?.storageBoxVisualSlotNo),
      sortValue: Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0)),
    });
    groupedRows.set(groupKey, rows);
  });
  if (!groupedRows.size) return storageRows;
  const reassignedVisualSlotNoByRowIndex = new Map();
  groupedRows.forEach((rows) => {
    if (rows.length) {
      buildHarvestPalletSlotMeta({
        entries: rows,
        maxBoxes: 36,
        getVisualSlotNo: (entry) => entry.visualSlotNo,
        getSortValue: (entry) => entry.sortValue,
        getEntryMeta: (entry) => ({ rowIndex: entry.rowIndex }),
      }).forEach((slot) => {
        if (!slot?.filled) return;
        reassignedVisualSlotNoByRowIndex.set(
          Math.max(0, Math.floor(Number(slot.rowIndex) || 0)),
          Math.max(0, Math.floor(Number(slot.visualSlotNo) || 0))
        );
      });
    }
  });
  let changed = false;
  const nextRows = storageRows.map((batch, index) => {
    if (!reassignedVisualSlotNoByRowIndex.has(index)) return batch;
    const nextVisualSlotNo = Math.max(0, Math.floor(Number(reassignedVisualSlotNoByRowIndex.get(index)) || 0));
    if (Math.max(0, Math.floor(Number(batch?.storageBoxVisualSlotNo) || 0)) === nextVisualSlotNo) return batch;
    changed = true;
    return {
      ...batch,
      storageBoxVisualSlotNo: nextVisualSlotNo,
    };
  });
  return changed ? nextRows : storageRows;
}

function repairLegacyWarehouseFloorStoredHarvestVisualSlots(storageRows = [], harvestBoxCapacityKg = 20) {
  if (!Array.isArray(storageRows) || !storageRows.length) return storageRows;
  const maxBoxes = 36;
  const normalizeVisualSlotNo = (slotNoRaw) => {
    const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
    return slotNo >= 1 && slotNo <= maxBoxes ? slotNo : 0;
  };
  const groupedRows = new Map();
  storageRows.forEach((batch, index) => {
    if (batch?.palletized) return;
    if (String(batch?.storageVehicleInstanceId || '')) return;
    if (getHarvestBatchDedicatedStorageKind(batch)) return;
    const facilityKey = String(batch?.storageFacilityKey || '');
    const slotNo = Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0));
    if (!facilityKey || slotNo <= 0) return;
    const groupKey = `warehouse-floor:${facilityKey}:${slotNo}`;
    const rows = groupedRows.get(groupKey) || [];
    rows.push({
      rowIndex: index,
      visualSlotNo: normalizeVisualSlotNo(batch?.storageBoxVisualSlotNo),
      sortValue: Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0)),
    });
    groupedRows.set(groupKey, rows);
  });
  if (!groupedRows.size) return storageRows;
  const nextRows = storageRows.slice();
  let changed = false;
  groupedRows.forEach((rows) => {
    if (!rows.length) return;
    const usedVisualSlotNos = new Set();
    const hasBrokenVisualSlots = rows.some((entry) => {
      const visualSlotNo = normalizeVisualSlotNo(entry.visualSlotNo);
      if (visualSlotNo <= 0) return true;
      if (usedVisualSlotNos.has(visualSlotNo)) return true;
      usedVisualSlotNos.add(visualSlotNo);
      return false;
    });
    if (!hasBrokenVisualSlots) return;
    const assignedVisualSlotNoByRowIndex = new Map();
    usedVisualSlotNos.clear();
    rows
      .slice()
      .sort((a, b) => (a.sortValue - b.sortValue) || (a.rowIndex - b.rowIndex))
      .forEach((entry) => {
        const currentVisualSlotNo = normalizeVisualSlotNo(entry.visualSlotNo);
        if (currentVisualSlotNo <= 0 || usedVisualSlotNos.has(currentVisualSlotNo)) return;
        usedVisualSlotNos.add(currentVisualSlotNo);
        assignedVisualSlotNoByRowIndex.set(entry.rowIndex, currentVisualSlotNo);
      });
    rows
      .slice()
      .sort((a, b) => (a.sortValue - b.sortValue) || (a.rowIndex - b.rowIndex))
      .forEach((entry) => {
        if (assignedVisualSlotNoByRowIndex.has(entry.rowIndex)) return;
        for (let slotNo = 1; slotNo <= maxBoxes; slotNo += 1) {
          if (usedVisualSlotNos.has(slotNo)) continue;
          usedVisualSlotNos.add(slotNo);
          assignedVisualSlotNoByRowIndex.set(entry.rowIndex, slotNo);
          break;
        }
      });
    rows.forEach((entry) => {
      const nextVisualSlotNo = Math.max(0, Math.floor(Number(assignedVisualSlotNoByRowIndex.get(entry.rowIndex)) || 0));
      if (Math.max(0, Math.floor(Number(nextRows[entry.rowIndex]?.storageBoxVisualSlotNo) || 0)) === nextVisualSlotNo) return;
      changed = true;
      nextRows[entry.rowIndex] = {
        ...nextRows[entry.rowIndex],
        storageBoxVisualSlotNo: nextVisualSlotNo,
      };
    });
  });
  return changed ? nextRows : storageRows;
}

function hydrateWarehouseFloorStoredHarvestSlotMetadata(storageRows = [], harvestBoxCapacityKg = 20) {
  if (!Array.isArray(storageRows) || !storageRows.length) return storageRows;
  const safeHarvestBoxCapacityKg = Math.max(0.001, Number(harvestBoxCapacityKg) || 20);
  const maxBoxes = 36;
  const isFullHarvestBoxQty = (qtyKgRaw) => Math.max(0, Number(qtyKgRaw) || 0) >= safeHarvestBoxCapacityKg - 0.001;
  const groupedRows = new Map();
  storageRows.forEach((batch, index) => {
    if (batch?.palletized) return;
    if (String(batch?.storageVehicleInstanceId || '')) return;
    if (getHarvestBatchDedicatedStorageKind(batch)) return;
    const facilityKey = String(batch?.storageFacilityKey || '');
    const slotNo = Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0));
    if (!facilityKey || slotNo <= 0) return;
    const groupKey = `warehouse-floor:${facilityKey}:${slotNo}`;
    const rows = groupedRows.get(groupKey) || [];
    rows.push({
      rowIndex: index,
      batch,
      qtyKg: Math.max(0, Number(batch?.qty) || 0),
      visualSlotNo: Math.max(0, Math.floor(Number(batch?.storageBoxVisualSlotNo) || 0)),
      sortValue: Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0)),
    });
    groupedRows.set(groupKey, rows);
  });
  if (!groupedRows.size) return storageRows;
  const nextRows = storageRows.slice();
  let changed = false;
  groupedRows.forEach((rows) => {
    if (!rows.length) return;
    const totalQtyKg = roundKg(rows.reduce((sum, entry) => sum + entry.qtyKg, 0), 2);
    const fullBoxCount = rows.reduce((sum, entry) => sum + (isFullHarvestBoxQty(entry.qtyKg) ? 1 : 0), 0);
    const partialBoxCount = rows.reduce((sum, entry) => sum + (isFullHarvestBoxQty(entry.qtyKg) ? 0 : 1), 0);
    const remainderKg = roundKg(rows.reduce(
      (sum, entry) => sum + (isFullHarvestBoxQty(entry.qtyKg) ? 0 : entry.qtyKg),
      0
    ), 2);
    const capacityKg = roundKg(maxBoxes * safeHarvestBoxCapacityKg, 2);
    let runningLoadedKg = 0;
    rows
      .slice()
      .sort((a, b) => {
        const aVisual = Math.max(0, Math.floor(Number(a.visualSlotNo) || 0)) || Number.MAX_SAFE_INTEGER;
        const bVisual = Math.max(0, Math.floor(Number(b.visualSlotNo) || 0)) || Number.MAX_SAFE_INTEGER;
        return (aVisual - bVisual) || (a.sortValue - b.sortValue) || (a.rowIndex - b.rowIndex);
      })
      .forEach((entry) => {
        runningLoadedKg = roundKg(runningLoadedKg + entry.qtyKg, 2);
        const prevBatch = nextRows[entry.rowIndex];
        const nextBatch = {
          ...prevBatch,
          storagePalletNo: Math.max(0, Math.floor(Number(entry?.batch?.storagePalletSlotNo || entry?.batch?.storagePalletNo) || 0)),
          storagePalletSlotNo: Math.max(0, Math.floor(Number(entry?.batch?.storagePalletSlotNo || entry?.batch?.storagePalletNo) || 0)),
          storagePalletLayer: 0,
          storagePalletCapacityKg: capacityKg,
          storagePalletLoadedKg: runningLoadedKg,
          storagePalletRemainingKg: roundKg(capacityKg - runningLoadedKg, 2),
          storagePalletBoxCount: fullBoxCount,
          storagePalletPartialBoxCount: partialBoxCount,
          storagePalletRemainderKg: remainderKg,
          storageVehicleInstanceId: '',
          storageVehiclePalletSlotNo: 0,
          storageVehiclePalletLayer: 0,
          storageBoxCount: isFullHarvestBoxQty(entry.qtyKg) ? 1 : 0,
          storagePartialBoxCount: isFullHarvestBoxQty(entry.qtyKg) ? 0 : 1,
          storageRemainderKg: isFullHarvestBoxQty(entry.qtyKg) ? 0 : entry.qtyKg,
        };
        if (
          Math.abs(Math.max(0, Number(prevBatch?.storagePalletCapacityKg) || 0) - nextBatch.storagePalletCapacityKg) > 0.001
          || Math.abs(Math.max(0, Number(prevBatch?.storagePalletLoadedKg) || 0) - nextBatch.storagePalletLoadedKg) > 0.001
          || Math.abs(Math.max(0, Number(prevBatch?.storagePalletRemainingKg) || 0) - nextBatch.storagePalletRemainingKg) > 0.001
          || Math.max(0, Math.floor(Number(prevBatch?.storagePalletBoxCount) || 0)) !== nextBatch.storagePalletBoxCount
          || Math.max(0, Math.floor(Number(prevBatch?.storagePalletPartialBoxCount) || 0)) !== nextBatch.storagePalletPartialBoxCount
          || Math.abs(Math.max(0, Number(prevBatch?.storagePalletRemainderKg) || 0) - nextBatch.storagePalletRemainderKg) > 0.001
          || Math.max(0, Math.floor(Number(prevBatch?.storageBoxCount) || 0)) !== nextBatch.storageBoxCount
          || Math.max(0, Math.floor(Number(prevBatch?.storagePartialBoxCount) || 0)) !== nextBatch.storagePartialBoxCount
          || Math.abs(Math.max(0, Number(prevBatch?.storageRemainderKg) || 0) - nextBatch.storageRemainderKg) > 0.001
          || String(prevBatch?.storageVehicleInstanceId || '') !== ''
          || Math.max(0, Math.floor(Number(prevBatch?.storageVehiclePalletSlotNo) || 0)) !== 0
          || Math.max(0, Math.floor(Number(prevBatch?.storageVehiclePalletLayer) || 0)) !== 0
        ) {
          changed = true;
        }
        nextRows[entry.rowIndex] = nextBatch;
      });
  });
  return changed ? nextRows : storageRows;
}

function consumePlasticPalletFromSource({
  prev,
  sourceRow,
  selectedFacilityKey,
  resolveFieldFacilityInventoryByFacility
}) {
  if (!prev || !sourceRow || !selectedFacilityKey) return prev;

  if (sourceRow.sourceType === 'warehouse') {
    const sourceFacilityKey = String(sourceRow.sourceFacilityKey || selectedFacilityKey || '');
    const { fieldId, byFacility } = resolveFieldFacilityInventoryByFacility(prev, prev?.selectedField);
    if (!fieldId || !sourceFacilityKey) return prev;
    const nextByFacility = { ...(byFacility || {}) };
    const facilityInventory = { ...(nextByFacility[sourceFacilityKey] || {}) };
    const currentQty = Math.max(0, Number(facilityInventory.plasticPallet1100) || 0);
    if (currentQty <= 0) return prev;
    facilityInventory.plasticPallet1100 = currentQty - 1;
    if (facilityInventory.plasticPallet1100 <= 0) delete facilityInventory.plasticPallet1100;
    if (Object.keys(facilityInventory).length) nextByFacility[sourceFacilityKey] = facilityInventory;
    else delete nextByFacility[sourceFacilityKey];
    const nextInventory = { ...(prev.inventory || {}) };
    nextInventory.plasticPallet1100 = Math.max(0, Number(nextInventory.plasticPallet1100) || 0) - 1;
    if (nextInventory.plasticPallet1100 <= 0) delete nextInventory.plasticPallet1100;
    return {
      ...prev,
      inventory: nextInventory,
      fieldFacilityInventoryByFieldId: {
        ...(prev.fieldFacilityInventoryByFieldId || {}),
        [fieldId]: nextByFacility
      }
    };
  }

  if (sourceRow.sourceType === 'carrier') {
    const carrierId = String(sourceRow.carrierId || '');
    if (!carrierId) return prev;
    const nextVehicleCargoByInstance = { ...(prev.vehicleCargoByInstance || {}) };
    const cargo = { ...(nextVehicleCargoByInstance[carrierId] || {}) };
    const currentQty = Math.max(0, Number(cargo.plasticPallet1100) || 0);
    if (currentQty <= 0) return prev;
    cargo.plasticPallet1100 = currentQty - 1;
    if (cargo.plasticPallet1100 <= 0) delete cargo.plasticPallet1100;
    if (Object.keys(cargo).length) nextVehicleCargoByInstance[carrierId] = cargo;
    else delete nextVehicleCargoByInstance[carrierId];
    return {
      ...prev,
      vehicleCargoByInstance: nextVehicleCargoByInstance
    };
  }

  return prev;
}

function restorePlasticPalletToFacility({
  prev,
  selectedFacilityKey,
  resolveFieldFacilityInventoryByFacility
}) {
  if (!prev || !selectedFacilityKey) return prev;
  const { fieldId, byFacility } = resolveFieldFacilityInventoryByFacility(prev, prev?.selectedField);
  if (!fieldId) return prev;
  const nextByFacility = { ...(byFacility || {}) };
  const facilityInventory = { ...(nextByFacility[selectedFacilityKey] || {}) };
  facilityInventory.plasticPallet1100 = Math.max(0, Number(facilityInventory.plasticPallet1100) || 0) + 1;
  nextByFacility[selectedFacilityKey] = facilityInventory;
  const nextInventory = { ...(prev.inventory || {}) };
  nextInventory.plasticPallet1100 = Math.max(0, Number(nextInventory.plasticPallet1100) || 0) + 1;
  return {
    ...prev,
    inventory: nextInventory,
    fieldFacilityInventoryByFieldId: {
      ...(prev.fieldFacilityInventoryByFieldId || {}),
      [fieldId]: nextByFacility
    }
  };
}

export function useWarehouseStorageWorkerAssignmentActions({
  gameLabor,
  sortingWorkerByEquipment,
  setSortingWorkerByEquipment,
  sortingWorkerPicker,
  setSortingWorkerPicker,
  workbenchWorkerByFacility,
  setWorkbenchWorkerByFacility,
  workbenchWorkerPicker,
  setWorkbenchWorkerPicker
}) {
  const legacySortingWorkerSlotKeyOf = useCallback((slotKeyRaw) => {
    const slotKey = String(slotKeyRaw || '');
    if (!slotKey) return '';
    return slotKey.includes('-worker-slot-')
      ? slotKey.replace('-worker-slot-', '-staff-slot-')
      : slotKey;
  }, []);
  const resolveSortingWorkerSlotKey = useCallback((picker) => (
    String(picker?.slotKey || picker?.positionKey || '')
  ), []);
  const resolveSortingWorkerSlotKeys = useCallback((picker) => {
    const slotKeys = Array.isArray(picker?.slotKeys)
      ? picker.slotKeys
      : (Array.isArray(picker?.positionKeys) ? picker.positionKeys : []);
    const normalized = slotKeys.map((key) => String(key || '')).filter(Boolean);
    if (normalized.length) return normalized;
    const singleKey = resolveSortingWorkerSlotKey(picker);
    return singleKey ? [singleKey] : [];
  }, [resolveSortingWorkerSlotKey]);
  const readSortingWorkerAssignment = useCallback((equipmentStorageKeyRaw, slotKeyRaw) => {
    const equipmentStorageKey = String(equipmentStorageKeyRaw || '');
    const slotKey = String(slotKeyRaw || '');
    if (!equipmentStorageKey || !slotKey) return null;
    const equipmentEntries = sortingWorkerByEquipment?.[equipmentStorageKey] || {};
    return equipmentEntries?.[slotKey] || equipmentEntries?.[legacySortingWorkerSlotKeyOf(slotKey)] || null;
  }, [legacySortingWorkerSlotKeyOf, sortingWorkerByEquipment]);

  const clearSortingWorkerAssignment = useCallback((equipmentStorageKeyRaw, positionKeyRaw) => {
    const equipmentStorageKey = String(equipmentStorageKeyRaw || '');
    const slotKey = String(positionKeyRaw || '');
    const legacySlotKey = legacySortingWorkerSlotKeyOf(slotKey);
    if (!equipmentStorageKey || !slotKey) return;
    setSortingWorkerByEquipment((prev) => {
      const next = { ...(prev || {}) };
      const equipmentEntries = { ...(next?.[equipmentStorageKey] || {}) };
      delete equipmentEntries[slotKey];
      if (legacySlotKey && legacySlotKey !== slotKey) delete equipmentEntries[legacySlotKey];
      if (Object.keys(equipmentEntries).length > 0) next[equipmentStorageKey] = equipmentEntries;
      else delete next[equipmentStorageKey];
      return next;
    });
  }, [legacySortingWorkerSlotKeyOf, setSortingWorkerByEquipment]);

  const chooseSortingWorkerAssignment = useCallback(() => {
    const equipmentStorageKey = String(sortingWorkerPicker?.equipmentStorageKey || '');
    const slotKey = resolveSortingWorkerSlotKey(sortingWorkerPicker);
    if (!equipmentStorageKey || !slotKey) return;
    const currentAssignment = readSortingWorkerAssignment(equipmentStorageKey, slotKey);
    if (String(currentAssignment?.workerType || '') === 'self') {
      clearSortingWorkerAssignment(equipmentStorageKey, slotKey);
      setSortingWorkerPicker(null);
      return;
    }
    const legacySlotKey = legacySortingWorkerSlotKeyOf(slotKey);
    setSortingWorkerByEquipment((prev) => {
      const next = { ...(prev || {}) };
      const equipmentEntries = { ...(next?.[equipmentStorageKey] || {}) };
      if (legacySlotKey && legacySlotKey !== slotKey) delete equipmentEntries[legacySlotKey];
      equipmentEntries[slotKey] = {
          workerType: 'self',
          workerId: '',
          workerTypeKey: 'self',
          workerGender: 'neutral',
          workerLabel: '나',
          workerLabor: Math.max(0, Number(gameLabor) || 0)
      };
      next[equipmentStorageKey] = equipmentEntries;
      return next;
    });
    setSortingWorkerPicker(null);
  }, [
    clearSortingWorkerAssignment,
    gameLabor,
    legacySortingWorkerSlotKeyOf,
    readSortingWorkerAssignment,
    resolveSortingWorkerSlotKey,
    setSortingWorkerByEquipment,
    setSortingWorkerPicker,
    sortingWorkerPicker
  ]);

  const confirmSortingWorkerAssignments = useCallback((selectionsRaw = []) => {
    const equipmentStorageKey = String(sortingWorkerPicker?.equipmentStorageKey || '');
    const slotKey = resolveSortingWorkerSlotKey(sortingWorkerPicker);
    const targetSlotKeys = resolveSortingWorkerSlotKeys(sortingWorkerPicker);
    if (!equipmentStorageKey || !slotKey || !targetSlotKeys.length) return;

    const selections = Array.isArray(selectionsRaw) ? selectionsRaw : [];
    setSortingWorkerByEquipment((prev) => {
      const next = { ...(prev || {}) };
      const equipmentEntries = { ...(next?.[equipmentStorageKey] || {}) };
      targetSlotKeys.forEach((key, index) => {
        const legacySlotKey = legacySortingWorkerSlotKeyOf(key);
        const selection = selections[index] || null;
        if (!selection) {
          delete equipmentEntries[key];
          if (legacySlotKey && legacySlotKey !== key) delete equipmentEntries[legacySlotKey];
          return;
        }
        if (selection.kind === 'self') {
          equipmentEntries[key] = {
            workerType: 'self',
            workerId: '',
            workerTypeKey: 'self',
            workerGender: 'neutral',
            workerLabel: '나',
            workerLabor: Math.max(0, Number(gameLabor) || 0)
          };
          return;
        }
        const worker = selection?.worker || null;
        const workerId = String(worker?.id || '');
        if (!workerId) {
          delete equipmentEntries[key];
          if (legacySlotKey && legacySlotKey !== key) delete equipmentEntries[legacySlotKey];
          return;
        }
        equipmentEntries[key] = {
          workerType: 'external',
          workerId,
          workerTypeKey: String(selection?.workerTypeKey || ''),
          workerGender: String(worker?.gender || 'neutral'),
          workerLabel: String(worker?.name || '외부인력'),
          workerLabor: Math.max(0, Number(worker?.labor) || 0)
        };
      });
      if (Object.keys(equipmentEntries).length > 0) next[equipmentStorageKey] = equipmentEntries;
      else delete next[equipmentStorageKey];
      return next;
    });
    setSortingWorkerPicker(null);
  }, [
    gameLabor,
    legacySortingWorkerSlotKeyOf,
    resolveSortingWorkerSlotKey,
    resolveSortingWorkerSlotKeys,
    setSortingWorkerByEquipment,
    setSortingWorkerPicker,
    sortingWorkerPicker
  ]);

  const chooseSortingExternalWorkerAssignment = useCallback((workerTypeKeyRaw, worker) => {
    const equipmentStorageKey = String(sortingWorkerPicker?.equipmentStorageKey || '');
    const slotKey = resolveSortingWorkerSlotKey(sortingWorkerPicker);
    const workerTypeKey = String(workerTypeKeyRaw || '');
    const workerId = String(worker?.id || '');
    if (!equipmentStorageKey || !slotKey || !workerId) return;
    const currentAssignment = readSortingWorkerAssignment(equipmentStorageKey, slotKey);
    if (
      String(currentAssignment?.workerType || '') === 'external'
      && String(currentAssignment?.workerId || '') === workerId
    ) {
      clearSortingWorkerAssignment(equipmentStorageKey, slotKey);
      return;
    }
    const legacySlotKey = legacySortingWorkerSlotKeyOf(slotKey);
    setSortingWorkerByEquipment((prev) => {
      const next = { ...(prev || {}) };
      const equipmentEntries = { ...(next?.[equipmentStorageKey] || {}) };
      if (legacySlotKey && legacySlotKey !== slotKey) delete equipmentEntries[legacySlotKey];
      equipmentEntries[slotKey] = {
          workerType: 'external',
          workerId,
          workerTypeKey,
          workerGender: String(worker?.gender || 'neutral'),
          workerLabel: String(worker?.name || '외부인력'),
          workerLabor: Math.max(0, Number(worker?.labor) || 0)
      };
      next[equipmentStorageKey] = equipmentEntries;
      return next;
    });
    setSortingWorkerPicker(null);
  }, [
    clearSortingWorkerAssignment,
    legacySortingWorkerSlotKeyOf,
    readSortingWorkerAssignment,
    resolveSortingWorkerSlotKey,
    setSortingWorkerByEquipment,
    setSortingWorkerPicker,
    sortingWorkerPicker
  ]);

  const clearWorkbenchWorkerAssignment = useCallback((facilityKeyRaw, workbenchSlotKeyRaw, positionKeyRaw) => {
    const facilityKey = String(facilityKeyRaw || '');
    const workbenchSlotKey = String(workbenchSlotKeyRaw || '');
    const positionKey = String(positionKeyRaw || '');
    if (!facilityKey || !workbenchSlotKey || !positionKey) return;
    setWorkbenchWorkerByFacility((prev) => {
      const next = { ...(prev || {}) };
      const facilityEntries = { ...(next?.[facilityKey] || {}) };
      const slotEntries = { ...(facilityEntries?.[workbenchSlotKey] || {}) };
      delete slotEntries[positionKey];
      if (Object.keys(slotEntries).length > 0) facilityEntries[workbenchSlotKey] = slotEntries;
      else delete facilityEntries[workbenchSlotKey];
      if (Object.keys(facilityEntries).length > 0) next[facilityKey] = facilityEntries;
      else delete next[facilityKey];
      return next;
    });
  }, [setWorkbenchWorkerByFacility]);

  const chooseWorkbenchWorkerAssignment = useCallback(() => {
    const facilityKey = String(workbenchWorkerPicker?.facilityKey || '');
    const workbenchSlotKey = String(workbenchWorkerPicker?.workbenchSlotKey || '');
    const positionKey = String(workbenchWorkerPicker?.positionKey || '');
    const positionKeys = Array.isArray(workbenchWorkerPicker?.positionKeys)
      ? workbenchWorkerPicker.positionKeys.map((key) => String(key || '')).filter(Boolean)
      : [];
    const targetPositionKeys = positionKeys.length ? positionKeys : [positionKey];
    if (!facilityKey || !workbenchSlotKey || !positionKey) return;
    const currentAssignment = workbenchWorkerByFacility?.[facilityKey]?.[workbenchSlotKey]?.[positionKey] || null;
    if (String(currentAssignment?.workerType || '') === 'self') {
      targetPositionKeys.forEach((key) => {
        clearWorkbenchWorkerAssignment(facilityKey, workbenchSlotKey, key);
      });
      setWorkbenchWorkerPicker(null);
      return;
    }
    setWorkbenchWorkerByFacility((prev) => {
      const next = { ...(prev || {}) };
      const facilityEntries = { ...(next?.[facilityKey] || {}) };
      const slotEntries = { ...(facilityEntries?.[workbenchSlotKey] || {}) };
      targetPositionKeys.forEach((key) => {
        slotEntries[key] = {
          workerType: 'self',
          workerId: '',
          workerTypeKey: 'self',
          workerGender: 'neutral',
          workerLabel: '나',
          workerLabor: Math.max(0, Number(gameLabor) || 0)
        };
      });
      facilityEntries[workbenchSlotKey] = slotEntries;
      next[facilityKey] = facilityEntries;
      return next;
    });
    setWorkbenchWorkerPicker(null);
  }, [
    clearWorkbenchWorkerAssignment,
    gameLabor,
    setWorkbenchWorkerByFacility,
    setWorkbenchWorkerPicker,
    workbenchWorkerByFacility,
    workbenchWorkerPicker
  ]);

  const confirmWorkbenchWorkerAssignments = useCallback((selectionsRaw = []) => {
    const facilityKey = String(workbenchWorkerPicker?.facilityKey || '');
    const workbenchSlotKey = String(workbenchWorkerPicker?.workbenchSlotKey || '');
    const positionKey = String(workbenchWorkerPicker?.positionKey || '');
    const positionKeys = Array.isArray(workbenchWorkerPicker?.positionKeys)
      ? workbenchWorkerPicker.positionKeys.map((key) => String(key || '')).filter(Boolean)
      : [];
    const targetPositionKeys = positionKeys.length ? positionKeys : [positionKey];
    if (!facilityKey || !workbenchSlotKey || !positionKey || !targetPositionKeys.length) return;

    const selections = Array.isArray(selectionsRaw) ? selectionsRaw : [];
    setWorkbenchWorkerByFacility((prev) => {
      const next = { ...(prev || {}) };
      const facilityEntries = { ...(next?.[facilityKey] || {}) };
      const slotEntries = { ...(facilityEntries?.[workbenchSlotKey] || {}) };
      targetPositionKeys.forEach((key, index) => {
        const selection = selections[index] || null;
        if (!selection) {
          delete slotEntries[key];
          return;
        }
        if (selection.kind === 'self') {
          slotEntries[key] = {
            workerType: 'self',
            workerId: '',
            workerTypeKey: 'self',
            workerGender: 'neutral',
            workerLabel: '나',
            workerLabor: Math.max(0, Number(gameLabor) || 0)
          };
          return;
        }
        const worker = selection?.worker || null;
        const workerId = String(worker?.id || '');
        if (!workerId) {
          delete slotEntries[key];
          return;
        }
        slotEntries[key] = {
          workerType: 'external',
          workerId,
          workerTypeKey: String(selection?.workerTypeKey || ''),
          workerGender: String(worker?.gender || 'neutral'),
          workerLabel: String(worker?.name || '외부인력'),
          workerLabor: Math.max(0, Number(worker?.labor) || 0)
        };
      });
      if (Object.keys(slotEntries).length > 0) facilityEntries[workbenchSlotKey] = slotEntries;
      else delete facilityEntries[workbenchSlotKey];
      if (Object.keys(facilityEntries).length > 0) next[facilityKey] = facilityEntries;
      else delete next[facilityKey];
      return next;
    });
    setWorkbenchWorkerPicker(null);
  }, [
    gameLabor,
    setWorkbenchWorkerByFacility,
    setWorkbenchWorkerPicker,
    workbenchWorkerPicker
  ]);

  const chooseWorkbenchExternalWorkerAssignment = useCallback((workerTypeKeyRaw, worker) => {
    const facilityKey = String(workbenchWorkerPicker?.facilityKey || '');
    const workbenchSlotKey = String(workbenchWorkerPicker?.workbenchSlotKey || '');
    const positionKey = String(workbenchWorkerPicker?.positionKey || '');
    const positionKeys = Array.isArray(workbenchWorkerPicker?.positionKeys)
      ? workbenchWorkerPicker.positionKeys.map((key) => String(key || '')).filter(Boolean)
      : [];
    const targetPositionKeys = positionKeys.length ? positionKeys : [positionKey];
    const workerTypeKey = String(workerTypeKeyRaw || '');
    const workerId = String(worker?.id || '');
    if (!facilityKey || !workbenchSlotKey || !positionKey || !workerId) return;
    const currentAssignment = workbenchWorkerByFacility?.[facilityKey]?.[workbenchSlotKey]?.[positionKey] || null;
    if (
      String(currentAssignment?.workerType || '') === 'external'
      && String(currentAssignment?.workerId || '') === workerId
    ) {
      targetPositionKeys.forEach((key) => {
        clearWorkbenchWorkerAssignment(facilityKey, workbenchSlotKey, key);
      });
      return;
    }
    setWorkbenchWorkerByFacility((prev) => {
      const next = { ...(prev || {}) };
      const facilityEntries = { ...(next?.[facilityKey] || {}) };
      const slotEntries = { ...(facilityEntries?.[workbenchSlotKey] || {}) };
      targetPositionKeys.forEach((key) => {
        slotEntries[key] = {
          workerType: 'external',
          workerId,
          workerTypeKey,
          workerGender: String(worker?.gender || 'neutral'),
          workerLabel: String(worker?.name || '외부인력'),
          workerLabor: Math.max(0, Number(worker?.labor) || 0)
        };
      });
      facilityEntries[workbenchSlotKey] = slotEntries;
      next[facilityKey] = facilityEntries;
      return next;
    });
    setWorkbenchWorkerPicker(null);
  }, [
    clearWorkbenchWorkerAssignment,
    setWorkbenchWorkerByFacility,
    setWorkbenchWorkerPicker,
    workbenchWorkerByFacility,
    workbenchWorkerPicker
  ]);

  return {
    clearSortingWorkerAssignment,
    chooseSortingWorkerAssignment,
    chooseSortingExternalWorkerAssignment,
    confirmSortingWorkerAssignments,
    clearWorkbenchWorkerAssignment,
    chooseWorkbenchWorkerAssignment,
    chooseWorkbenchExternalWorkerAssignment,
    confirmWorkbenchWorkerAssignments
  };
}

export function useWarehouseStoragePalletActions({
  harvestSlotCount,
  harvestSlotRows,
  harvestSlotByFacility,
  harvestAvailablePalletQty,
  harvestLoadSourceRows,
  selectedTransportRow,
  harvestLoadPicker,
  setHarvestLoadPicker,
  sortingPalletByEquipment,
  sortingPalletLoadPicker,
  setSortingPalletLoadPicker,
  workbenchPalletByFacility,
  setGame,
  resolveFieldFacilityInventoryByFacility,
  facilityStorageModalFacilityKey,
  activeFacilityStorageKey,
  setHarvestSlotByFacility,
  setSortingPalletByEquipment,
  setWorkbenchPalletByFacility,
  setTransportDockPreviewSource,
  setFacilityStorageHarvestMovePicker,
  clearTransportDockSuppressedSourceKey,
  selectedTransportKey = '',
  selectedTransportDockInstanceId = ''
}) {
  const syncSortingStoragePalletUiState = useCallback((prev, equipmentStorageKey, positionKey, nextEntry = null) => {
    const next = { ...(prev || {}) };
    const equipmentSlots = { ...(next?.[equipmentStorageKey] || {}) };
    if (nextEntry?.itemKey) {
      equipmentSlots[positionKey] = nextEntry;
      next[equipmentStorageKey] = equipmentSlots;
      return next;
    }
    delete equipmentSlots[positionKey];
    if (Object.keys(equipmentSlots).length > 0) next[equipmentStorageKey] = equipmentSlots;
    else delete next[equipmentStorageKey];
    return next;
  }, []);
  const syncWorkbenchStoragePalletUiState = useCallback((
    prev,
    facilityKeyRaw,
    workbenchSlotKeyRaw,
    cargoSlotKeyRaw,
    nextEntry = null,
  ) => {
    const facilityKey = String(facilityKeyRaw || '');
    const workbenchSlotKey = String(workbenchSlotKeyRaw || '');
    const cargoSlotKey = String(cargoSlotKeyRaw || '');
    if (!facilityKey || !workbenchSlotKey || !cargoSlotKey) return prev;
    const next = { ...(prev || {}) };
    const facilityEntries = { ...(next?.[facilityKey] || {}) };
    const slotEntries = { ...(facilityEntries?.[workbenchSlotKey] || {}) };
    if (nextEntry?.itemKey) {
      slotEntries[cargoSlotKey] = nextEntry;
      facilityEntries[workbenchSlotKey] = slotEntries;
      next[facilityKey] = facilityEntries;
      return next;
    }
    delete slotEntries[cargoSlotKey];
    if (Object.keys(slotEntries).length > 0) facilityEntries[workbenchSlotKey] = slotEntries;
    else delete facilityEntries[workbenchSlotKey];
    if (Object.keys(facilityEntries).length > 0) next[facilityKey] = facilityEntries;
    else delete next[facilityKey];
    return next;
  }, []);

  const applyHarvestPalletLoadSourceRow = useCallback((sourceRow, pickerState) => {
    const loadTargetSlotNo = Math.max(1, Math.floor(Number(pickerState?.slotNo) || 0));
    const facilityKey = String(activeFacilityStorageKey || '');
    const targetKind = String(pickerState?.targetKind || '');
    const isSortingTarget = targetKind === 'sorting-storage';
    const isWorkbenchTarget = String(pickerState?.facilityType || '') === 'workbench';
    const selectedFacilityKey = String(facilityStorageModalFacilityKey || '');
    if ((!loadTargetSlotNo && targetKind !== 'transport-dock') || !facilityKey || !sourceRow || !selectedFacilityKey) return false;
    if (targetKind === 'transport-dock') {
      const transportDockInstanceId = String(selectedTransportDockInstanceId || '');
      if (!transportDockInstanceId) {
        window.alert('운반기구 적재칸 정보를 찾을 수 없습니다.');
        return false;
      }
      setGame((prev) => {
        const consumed = consumePlasticPalletFromSource({
          prev,
          sourceRow,
          selectedFacilityKey,
          resolveFieldFacilityInventoryByFacility
        });
        if (!consumed) return consumed;
        return {
          ...consumed,
          vehiclePalletSlotsByInstance: {
            ...(consumed.vehiclePalletSlotsByInstance || {}),
            [transportDockInstanceId]: {
              ...((consumed.vehiclePalletSlotsByInstance || {})[transportDockInstanceId] || {}),
              1: { itemKey: 'plasticPallet1100' }
            }
          }
        };
      });
      clearTransportDockSuppressedSourceKey?.();
      setTransportDockPreviewSource?.({
        sourceType: 'vehicle-slot',
        sourceFacilityKey: '',
        targetFacilityKey: facilityKey,
        sourceLayerKey: 'bottom',
        sourceLabel: '운반기구',
        sourceTransportKey: String(selectedTransportKey || ''),
        sourceVehicleInstanceId: transportDockInstanceId,
        sourceVehiclePalletSlotNo: 1,
        sourceStockSlotNo: Math.max(1, Math.floor(Number(sourceRow?.slot) || 1)),
        isEmptyPallet: true,
        isEmptyPalletSnapshot: true,
        isTransportDockDisplayOnly: true,
      });
      setFacilityStorageHarvestMovePicker?.({
        presentation: 'inline',
        warehouseSubTab: 'storage',
        sourceType: 'vehicle-slot',
        sourceFacilityKey: '',
        sourceSlotNo: 0,
        sourceVehicleInstanceId: transportDockInstanceId,
        sourceVehiclePalletSlotNo: 1,
        sourceLayerKey: 'bottom',
        sourceTransportKey: String(selectedTransportKey || ''),
        targetFacilityKey: facilityKey,
        pendingTarget: null,
        resumePendingTargetAfterCommit: null,
        selectedSourceCards: [],
        selectedBoxCount: 0,
        sourceBoxCard: null,
        isEmptyPallet: true,
        isEmptyPalletSnapshot: true,
      });
      setHarvestLoadPicker(null);
      return true;
    }
    setGame((prev) => consumePlasticPalletFromSource({
      prev,
      sourceRow,
      selectedFacilityKey,
      resolveFieldFacilityInventoryByFacility
    }));
    if (isSortingTarget) {
      const equipmentStorageKey = String(pickerState?.equipmentStorageKey || '');
      const positionKey = String(pickerState?.positionKey || '');
      if (equipmentStorageKey && positionKey) {
        setSortingPalletByEquipment((prev) => syncSortingStoragePalletUiState(
          prev,
          equipmentStorageKey,
          positionKey,
          {
            itemKey: 'plasticPallet1100',
            sourceType: sourceRow.sourceType,
            sourceLabel: sourceRow.title
          }
        ));
      }
      setSortingPalletLoadPicker(null);
      return true;
    }
    if (isWorkbenchTarget) {
      const workbenchSlotKey = String(pickerState?.workbenchMeta?.workbenchSlotKey || '');
      const cargoSlotKey = String(
        pickerState?.workbenchMeta?.cargoSlotKey
        || pickerState?.cargoSlotKey
        || '',
      );
      if (workbenchSlotKey && cargoSlotKey) {
        setWorkbenchPalletByFacility((prev) => syncWorkbenchStoragePalletUiState(
          prev,
          facilityKey,
          workbenchSlotKey,
          cargoSlotKey,
          {
            itemKey: 'plasticPallet1100',
            sourceType: sourceRow.sourceType,
            sourceLabel: sourceRow.title
          }
        ));
      }
      setHarvestLoadPicker(null);
      return true;
    }
    setHarvestSlotByFacility((prev) => {
      const currentSlotsRaw = Array.isArray(prev?.[facilityKey]) ? prev[facilityKey] : [];
      const nextSlots = currentSlotsRaw.slice();
      nextSlots[loadTargetSlotNo - 1] = {
        itemKey: 'plasticPallet1100',
        sourceType: sourceRow.sourceType,
        sourceLabel: sourceRow.title
      };
      return {
        ...prev,
        [facilityKey]: nextSlots
      };
    });
    setHarvestLoadPicker(null);
    return true;
  }, [
    activeFacilityStorageKey,
    clearTransportDockSuppressedSourceKey,
    facilityStorageModalFacilityKey,
    resolveFieldFacilityInventoryByFacility,
    selectedTransportKey,
    selectedTransportDockInstanceId,
    setGame,
    setFacilityStorageHarvestMovePicker,
    setHarvestLoadPicker,
    setHarvestSlotByFacility,
    setSortingPalletByEquipment,
    setSortingPalletLoadPicker,
    setWorkbenchPalletByFacility,
    syncSortingStoragePalletUiState,
    syncWorkbenchStoragePalletUiState,
    setTransportDockPreviewSource
  ]);

  const openHarvestPalletLoadPicker = useCallback((slotNo, options = null) => {
    const targetSlotNo = Math.max(1, Math.floor(Number(slotNo) || 1));
    const targetKind = String(options?.targetKind || '');
    const isSortingTarget = targetKind === 'sorting-storage';
    const isWorkbenchTarget = String(options?.facilityType || '') === 'workbench';
    const isTransportDockTarget = targetKind === 'transport-dock';
    const slot = isTransportDockTarget
      ? null
      : (harvestSlotRows.find((row) => Number(row?.slotNo) === targetSlotNo) || null);
    const facilityKey = String(activeFacilityStorageKey || '');
    const savedSlotsRaw = Array.isArray(harvestSlotByFacility?.[facilityKey]) ? harvestSlotByFacility[facilityKey] : [];
    const savedEntry = isTransportDockTarget ? null : (savedSlotsRaw[targetSlotNo - 1] || null);
    const sortingSavedEntry = isSortingTarget
      ? (sortingPalletByEquipment?.[
        String(options?.equipmentStorageKey || '')
      ]?.[
        String(options?.positionKey || '')
      ] || null)
      : null;
    const workbenchSavedEntry = isWorkbenchTarget
      ? (workbenchPalletByFacility?.[facilityKey]?.[
        String(options?.workbenchMeta?.workbenchSlotKey || '')
      ]?.[
        String(options?.workbenchMeta?.cargoSlotKey || '')
      ] || null)
      : null;
    if (!isWorkbenchTarget && !isSortingTarget && !isTransportDockTarget && !slot) {
      window.alert('적재할 슬롯 정보를 찾을 수 없습니다.');
      return;
    }
    if (
      !isTransportDockTarget
      && (
        (!isWorkbenchTarget && !isSortingTarget && slot && slot.occupied)
        || (isSortingTarget && Boolean(sortingSavedEntry))
        || (isWorkbenchTarget && Boolean(workbenchSavedEntry))
      )
    ) {
      window.alert('이미 이 슬롯에 팔레트가 적재되어 있습니다.');
      return;
    }
    if (isTransportDockTarget && !selectedTransportRow) {
      window.alert('운반기구를 먼저 선택해 주세요.');
      return;
    }
    if (harvestAvailablePalletQty <= 0 || !harvestLoadSourceRows.length) {
      window.alert('현재 토지에 적재 가능한 플라스틱 팔레트가 없습니다.');
      return;
    }
    const pickerState = {
      slotNo: targetSlotNo,
      ...(options && typeof options === 'object' ? options : {})
    };
    const currentWarehouseSourceRow = harvestLoadSourceRows.find((row) => (
      String(row?.sourceType || '') === 'warehouse'
      && String(row?.sourceFacilityKey || '') === facilityKey
    )) || null;
    if (currentWarehouseSourceRow && applyHarvestPalletLoadSourceRow(currentWarehouseSourceRow, pickerState)) {
      return;
    }
    if (isSortingTarget) {
      setSortingPalletLoadPicker({
        ...pickerState
      });
      return;
    }
    setHarvestLoadPicker({
      ...pickerState
    });
  }, [
    activeFacilityStorageKey,
    applyHarvestPalletLoadSourceRow,
    harvestAvailablePalletQty,
    harvestLoadSourceRows,
    harvestSlotByFacility,
    harvestSlotRows,
    sortingPalletByEquipment,
    selectedTransportRow,
    setHarvestLoadPicker,
    setSortingPalletLoadPicker,
    workbenchPalletByFacility
  ]);

  const openSortingStoragePalletLoadPicker = useCallback((sortingSlot, sortingItem, positionSlot) => {
    const sortingSlotKey = String(sortingSlot?.key || '');
    const equipmentStorageKey = String(sortingItem?.displayKey || sortingItem?.key || '');
    const positionKey = String(positionSlot?.key || '');
    const storageSlotNo = sortingCargoStorageSlotNoOf(sortingSlotKey, positionKey);
    if (!sortingSlotKey || !equipmentStorageKey || !positionKey || storageSlotNo <= 0) return;
    openHarvestPalletLoadPicker(storageSlotNo, {
      targetKind: 'sorting-storage',
      equipmentStorageKey,
      equipmentName: String(sortingItem?.name || '선별기'),
      sortingSlotKey,
      positionKey,
      positionTitle: String(positionSlot?.title || '저장공간')
    });
  }, [
    openHarvestPalletLoadPicker
  ]);

  const chooseHarvestPalletLoadSource = useCallback((sourceSlot) => {
    const sourceRow = harvestLoadSourceRows.find((row) => Number(row?.slot) === Number(sourceSlot)) || null;
    if (!sourceRow) return;
    applyHarvestPalletLoadSourceRow(sourceRow, harvestLoadPicker || null);
  }, [applyHarvestPalletLoadSourceRow, harvestLoadPicker, harvestLoadSourceRows]);

  const chooseSortingStoragePalletLoadSource = useCallback((sourceSlot) => {
    const sourceRow = harvestLoadSourceRows.find((row) => Number(row?.slot) === Number(sourceSlot)) || null;
    if (!sourceRow) return;
    applyHarvestPalletLoadSourceRow(sourceRow, sortingPalletLoadPicker || null);
  }, [
    applyHarvestPalletLoadSourceRow,
    harvestLoadSourceRows,
    sortingPalletLoadPicker
  ]);

  const unloadSortingStoragePallet = useCallback((sortingSlot, sortingItem, positionSlot) => {
    const sortingSlotKey = String(sortingSlot?.key || '');
    const equipmentStorageKey = String(sortingItem?.displayKey || sortingItem?.key || '');
    const positionKey = String(positionSlot?.key || '');
    const storageSlotNo = sortingCargoStorageSlotNoOf(sortingSlotKey, positionKey);
    const currentEntry = sortingPalletByEquipment?.[equipmentStorageKey]?.[positionKey] || null;
    const selectedFacilityKey = String(facilityStorageModalFacilityKey || '');
    const facilityKey = String(activeFacilityStorageKey || '');
    if (!sortingSlotKey || !equipmentStorageKey || !positionKey || storageSlotNo <= 0 || !currentEntry?.itemKey || !selectedFacilityKey || !facilityKey) return;
    setGame((prev) => restorePlasticPalletToFacility({
      prev,
      selectedFacilityKey,
      resolveFieldFacilityInventoryByFacility
    }));
    setHarvestSlotByFacility((prev) => {
      const currentSlotsRaw = Array.isArray(prev?.[facilityKey]) ? prev[facilityKey] : [];
      if (!currentSlotsRaw.length || !currentSlotsRaw[storageSlotNo - 1]) return prev;
      const nextSlots = currentSlotsRaw.slice();
      nextSlots[storageSlotNo - 1] = null;
      return {
        ...(prev || {}),
        [facilityKey]: nextSlots
      };
    });
    setSortingPalletByEquipment((prev) => {
      return syncSortingStoragePalletUiState(prev, equipmentStorageKey, positionKey, null);
    });
  }, [
    activeFacilityStorageKey,
    facilityStorageModalFacilityKey,
    resolveFieldFacilityInventoryByFacility,
    setGame,
    setHarvestSlotByFacility,
    setSortingPalletByEquipment,
    sortingPalletByEquipment,
    syncSortingStoragePalletUiState
  ]);

  return {
    openHarvestPalletLoadPicker,
    openSortingStoragePalletLoadPicker,
    chooseHarvestPalletLoadSource,
    chooseSortingStoragePalletLoadSource,
    unloadSortingStoragePallet
  };
}

export function useWarehouseWorkbenchInstallActions({
  workbenchSlots,
  setWorkbenchInstallPicker,
  workbenchInstallOptions,
  workbenchInstallPicker,
  workbenchTableByKey,
  activeFacilityStorageKey,
  setGame,
  resolveFieldFacilityInventoryByFacility,
  facilityStorageModalFacilityKey,
  appleContainerItemKeys,
  normalizeCargoByItemKey,
  workbenchSlotCountOfFacility
}) {
  const openWorkbenchInstallPicker = useCallback((slotNo) => {
    const targetSlotNo = Math.max(1, Math.floor(Number(slotNo) || 1));
    const targetSlot = workbenchSlots[targetSlotNo - 1] || null;
    if (!targetSlot || targetSlot.installedTable) return;
    setWorkbenchInstallPicker({
      slotNo: targetSlotNo,
      slotLabel: String(targetSlot.label || `작업칸 ${targetSlotNo}`),
      selectedTableKey: ''
    });
  }, [setWorkbenchInstallPicker, workbenchSlots]);

  const closeWorkbenchInstallPicker = useCallback(() => {
    setWorkbenchInstallPicker(null);
  }, [setWorkbenchInstallPicker]);

  const selectWorkbenchInstallTable = useCallback((tableKeyRaw) => {
    const tableKey = String(tableKeyRaw || '');
    if (!tableKey) return;
    setWorkbenchInstallPicker((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        selectedTableKey: tableKey
      };
    });
  }, [setWorkbenchInstallPicker]);

  const clearWorkbenchInstallTableSelection = useCallback(() => {
    setWorkbenchInstallPicker((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        selectedTableKey: ''
      };
    });
  }, [setWorkbenchInstallPicker]);

  const installWorkbenchTable = useCallback((optionKeyRaw) => {
    const optionKey = String(optionKeyRaw || '');
    const selectedOption = workbenchInstallOptions.find((entry) => String(entry?.optionKey || '') === optionKey) || null;
    const tableKey = String(selectedOption?.key || '');
    const table = workbenchTableByKey[tableKey] || null;
    const slotNo = Math.max(1, Math.floor(Number(workbenchInstallPicker?.slotNo) || 0));
    const facilityKey = String(activeFacilityStorageKey || '');
    if (!table || !slotNo || !facilityKey) return;
    if (!selectedOption?.canInstall) {
      window.alert(selectedOption?.blockReason || '설치 자재가 부족합니다.');
      return;
    }
    setGame((prev) => {
      if (!prev) return prev;
      const fieldIndex = Math.max(0, Number(prev?.selectedField) || 0);
      if (!prev?.fields?.[fieldIndex]) return prev;
      const { fieldId, defaultFacilityKey, byFacility } = resolveFieldFacilityInventoryByFacility(prev, fieldIndex);
      const selectedFacilityKey = String(facilityStorageModalFacilityKey || '') || defaultFacilityKey;
      const sourceAllocations = Array.isArray(selectedOption?.sourceAllocations) ? selectedOption.sourceAllocations : [];
      if (!fieldId || !selectedFacilityKey || !sourceAllocations.length) return prev;
      const nextByFacility = { ...(byFacility || {}) };
      const needPalletQty = Math.max(0, Math.floor(Number(table.requiredPalletQty) || 0));
      const takeFromCargoMap = (sourceMapRaw, takeContainerQty, takePalletQty) => {
        const sourceMap = { ...(sourceMapRaw || {}) };
        let remainContainerNeed = Math.max(0, Math.floor(Number(takeContainerQty) || 0));
        appleContainerItemKeys.forEach((itemKey) => {
          if (remainContainerNeed <= 0) return;
          const currentQty = Math.max(0, Math.floor(Number(sourceMap[itemKey]) || 0));
          if (currentQty <= 0) return;
          const usedQty = Math.min(currentQty, remainContainerNeed);
          const nextQty = currentQty - usedQty;
          if (nextQty > 0) sourceMap[itemKey] = nextQty;
          else delete sourceMap[itemKey];
          remainContainerNeed -= usedQty;
        });
        const currentPalletQty = Math.max(0, Math.floor(Number(sourceMap.plasticPallet1100) || 0));
        const palletNeed = Math.max(0, Math.floor(Number(takePalletQty) || 0));
        if (remainContainerNeed > 0 || currentPalletQty < palletNeed) return null;
        const nextPalletQty = currentPalletQty - palletNeed;
        if (nextPalletQty > 0) sourceMap.plasticPallet1100 = nextPalletQty;
        else delete sourceMap.plasticPallet1100;
        return normalizeCargoByItemKey(sourceMap);
      };
      let nextInventory = { ...(prev.inventory || {}) };
      let nextVehicleCargoByInstance = { ...(prev.vehicleCargoByInstance || {}) };
      let warehouseConsumedContainerQty = 0;
      let warehouseConsumedPalletQty = 0;
      for (const allocation of sourceAllocations) {
        const sourceType = String(allocation?.sourceType || '');
        const sourceKey = String(allocation?.sourceKey || '');
        const takeContainerQty = Math.max(0, Math.floor(Number(allocation?.useAppleContainerQty) || 0));
        const takePalletQty = Math.max(0, Math.floor(Number(allocation?.usePalletQty) || 0));
        if (!sourceKey || (takeContainerQty <= 0 && takePalletQty <= 0)) continue;
        if (sourceType === 'warehouse') {
          const sourceFacilityInventory = { ...(nextByFacility[sourceKey] || {}) };
          const consumedInventory = takeFromCargoMap(sourceFacilityInventory, takeContainerQty, takePalletQty);
          if (!consumedInventory) return prev;
          if (Object.keys(consumedInventory).length) nextByFacility[sourceKey] = consumedInventory;
          else delete nextByFacility[sourceKey];
          warehouseConsumedContainerQty += takeContainerQty;
          warehouseConsumedPalletQty += takePalletQty;
          continue;
        }
        if (sourceType === 'carrier') {
          const sourceCargo = normalizeCargoByItemKey(nextVehicleCargoByInstance?.[sourceKey] || prev?.vehicleCargoByInstance?.[sourceKey] || {});
          const consumedCargo = takeFromCargoMap(sourceCargo, takeContainerQty, takePalletQty);
          if (!consumedCargo) return prev;
          if (Object.keys(consumedCargo).length) nextVehicleCargoByInstance[sourceKey] = consumedCargo;
          else delete nextVehicleCargoByInstance[sourceKey];
          continue;
        }
        return prev;
      }
      let remainGlobalContainerNeed = warehouseConsumedContainerQty;
      appleContainerItemKeys.forEach((itemKey) => {
        if (remainGlobalContainerNeed <= 0) return;
        const currentQty = Math.max(0, Math.floor(Number(nextInventory[itemKey]) || 0));
        if (currentQty <= 0) return;
        const usedQty = Math.min(currentQty, remainGlobalContainerNeed);
        const nextQty = currentQty - usedQty;
        if (nextQty > 0) nextInventory[itemKey] = nextQty;
        else delete nextInventory[itemKey];
        remainGlobalContainerNeed -= usedQty;
      });
      nextInventory.plasticPallet1100 = Math.max(0, Math.floor(Number(nextInventory.plasticPallet1100) || 0) - warehouseConsumedPalletQty);
      if (nextInventory.plasticPallet1100 <= 0) delete nextInventory.plasticPallet1100;

      const nextFields = Array.isArray(prev?.fields) ? prev.fields.map((field, index) => {
        if (index !== fieldIndex) return field;
        const slotCount = workbenchSlotCountOfFacility(field, facilityKey);
        const rawInstallMap = field?.workbenchInstallationsByFacilityKey || {};
        const facilityEntries = Array.isArray(rawInstallMap[facilityKey])
          ? [...rawInstallMap[facilityKey]]
          : Array.from({ length: slotCount }, () => null);
        facilityEntries[slotNo - 1] = {
          tableKey,
          name: table.name,
          installedAtDay: Math.max(0, Math.floor(Number(prev?.day) || 0)),
          requiredAppleContainerQty: Math.max(0, Math.floor(Number(table.requiredAppleContainerQty) || 0)),
          requiredPalletQty: needPalletQty
        };
        return {
          ...field,
          workbenchInstallationsByFacilityKey: {
            ...rawInstallMap,
            [facilityKey]: facilityEntries
          }
        };
      }) : prev?.fields;

      return {
        ...prev,
        inventory: nextInventory,
        vehicleCargoByInstance: nextVehicleCargoByInstance,
        fields: nextFields,
        fieldFacilityInventoryByFieldId: {
          ...(prev.fieldFacilityInventoryByFieldId || {}),
          [fieldId]: nextByFacility
        }
      };
    });
    setWorkbenchInstallPicker(null);
  }, [
    activeFacilityStorageKey,
    appleContainerItemKeys,
    facilityStorageModalFacilityKey,
    normalizeCargoByItemKey,
    resolveFieldFacilityInventoryByFacility,
    setGame,
    setWorkbenchInstallPicker,
    workbenchInstallOptions,
    workbenchInstallPicker,
    workbenchSlotCountOfFacility,
    workbenchTableByKey
  ]);

  const uninstallWorkbenchTable = useCallback((slotNoRaw) => {
    const slotNo = Math.max(1, Math.floor(Number(slotNoRaw) || 0));
    const facilityKey = String(activeFacilityStorageKey || '');
    if (!slotNo || !facilityKey) return;
    setGame((prev) => {
      if (!prev) return prev;
      const fieldIndex = Math.max(0, Number(prev?.selectedField) || 0);
      const field = prev?.fields?.[fieldIndex];
      if (!field) return prev;
      const rawInstallMap = field?.workbenchInstallationsByFacilityKey || {};
      const facilityEntries = Array.isArray(rawInstallMap[facilityKey])
        ? [...rawInstallMap[facilityKey]]
        : [];
      if (!facilityEntries[slotNo - 1]) return prev;
      facilityEntries[slotNo - 1] = null;
      return {
        ...prev,
        fields: prev.fields.map((row, index) => (
          index === fieldIndex
            ? {
              ...row,
              workbenchInstallationsByFacilityKey: {
                ...rawInstallMap,
                [facilityKey]: facilityEntries
              }
            }
            : row
        ))
      };
    });
  }, [activeFacilityStorageKey, setGame]);

  return {
    openWorkbenchInstallPicker,
    closeWorkbenchInstallPicker,
    selectWorkbenchInstallTable,
    clearWorkbenchInstallTableSelection,
    installWorkbenchTable,
    uninstallWorkbenchTable
  };
}

export function useWarehouseCarrierEmptyPalletActions({
  harvestAvailablePalletQty,
  harvestLoadSourceRows,
  selectedTransportRow,
  setCarrierPalletLoadPicker,
  selectedCarrier,
  selectedCarrierPalletSlotRows,
  carrierPalletLoadPicker,
  itemMetaByKey,
  defaultPalletWeightKg,
  resolveMachineInstanceById,
  game,
  carrierCargoUsedKgByInstance,
  cleanupWasteLoadedKgByInstance,
  carrierLoadedMachineWeightKgByInstance,
  carrierEmptyPalletLoadedKgByInstance,
  harvestStoredPalletSlotsByVehicleInstance,
  carrierMaxAllowedLoadKg,
  setGame,
  resolveFieldFacilityInventoryByFacility,
  facilityStorageModalFacilityKey
}) {
  const applyCarrierPalletLoadSourceRow = useCallback((sourceRow, carrierIdRaw, slotNoRaw) => {
    const carrierId = String(carrierIdRaw || '');
    const targetSlotNo = Math.max(1, Math.floor(Number(slotNoRaw) || 0));
    if (!carrierId || targetSlotNo <= 0 || !sourceRow) return false;
    const palletWeightKg = Math.max(0, Number(itemMetaByKey?.plasticPallet1100?.weightKg) || defaultPalletWeightKg);
    const targetCarrier = carrierId === String(selectedCarrier?.id || '')
      ? selectedCarrier
      : resolveMachineInstanceById(carrierId);
    const payloadKg = Math.max(0, Number(targetCarrier?.item?.payloadKg) || 0);
    const usedKg = Math.max(
      0,
      carrierCargoUsedKgByInstance(game, carrierId)
      + cleanupWasteLoadedKgByInstance(game, carrierId)
      + carrierLoadedMachineWeightKgByInstance(game, carrierId)
      + carrierEmptyPalletLoadedKgByInstance(game, carrierId)
      + Object.values(harvestStoredPalletSlotsByVehicleInstance?.[carrierId] || {}).reduce((sum, slotEntry) => {
        const bottomKg = Math.max(0, Number(slotEntry?.bottomLayer?.qtyKg) || 0);
        const topKg = Math.max(0, Number(slotEntry?.topLayer?.qtyKg) || 0);
        return sum + bottomKg + topKg;
      }, 0)
    );
    if (payloadKg > 0 && usedKg + palletWeightKg > carrierMaxAllowedLoadKg(payloadKg)) {
      window.alert('차량 적재한도를 초과합니다.');
      return false;
    }
    const selectedFacilityKey = String(facilityStorageModalFacilityKey || '');
    if (!selectedFacilityKey) return false;
    setGame((prev) => {
      const consumed = consumePlasticPalletFromSource({
        prev,
        sourceRow,
        selectedFacilityKey,
        resolveFieldFacilityInventoryByFacility
      });
      if (!consumed) return consumed;
      return {
        ...consumed,
        vehiclePalletSlotsByInstance: {
          ...(consumed.vehiclePalletSlotsByInstance || {}),
          [carrierId]: {
            ...((consumed.vehiclePalletSlotsByInstance || {})[carrierId] || {}),
            [targetSlotNo]: { itemKey: 'plasticPallet1100' }
          }
        }
      };
    });
    setCarrierPalletLoadPicker(null);
    return true;
  }, [
    carrierCargoUsedKgByInstance,
    carrierEmptyPalletLoadedKgByInstance,
    carrierLoadedMachineWeightKgByInstance,
    carrierMaxAllowedLoadKg,
    cleanupWasteLoadedKgByInstance,
    defaultPalletWeightKg,
    facilityStorageModalFacilityKey,
    game,
    harvestStoredPalletSlotsByVehicleInstance,
    itemMetaByKey,
    resolveFieldFacilityInventoryByFacility,
    resolveMachineInstanceById,
    selectedCarrier,
    setCarrierPalletLoadPicker,
    setGame
  ]);

  const openEmptyPalletLoadPickerForCarrierSlot = useCallback((carrierIdRaw, slotNoRaw) => {
    const carrierId = String(carrierIdRaw || '');
    const targetSlotNo = Math.max(1, Math.floor(Number(slotNoRaw) || 0));
    if (!carrierId || targetSlotNo <= 0) return;
    if (harvestAvailablePalletQty <= 0 || !harvestLoadSourceRows.length) {
      window.alert('현재 토지에 적재 가능한 빈 파레트가 없습니다.');
      return;
    }
    const selectedFacilityKey = String(facilityStorageModalFacilityKey || '');
    const currentWarehouseSourceRow = harvestLoadSourceRows.find((row) => (
      String(row?.sourceType || '') === 'warehouse'
      && String(row?.sourceFacilityKey || '') === selectedFacilityKey
    )) || null;
    if (currentWarehouseSourceRow && applyCarrierPalletLoadSourceRow(currentWarehouseSourceRow, carrierId, targetSlotNo)) {
      return;
    }
    setCarrierPalletLoadPicker({
      carrierId,
      slotNo: targetSlotNo
    });
  }, [
    applyCarrierPalletLoadSourceRow,
    facilityStorageModalFacilityKey,
    harvestAvailablePalletQty,
    harvestLoadSourceRows,
    setCarrierPalletLoadPicker
  ]);

  const loadEmptyPalletToCarrierSlot = useCallback((slotNo) => {
    const carrierId = String(selectedCarrier?.id || '');
    const targetSlotNo = Math.max(1, Math.floor(Number(slotNo) || 0));
    if (!carrierId || targetSlotNo <= 0) return;
    const slot = selectedCarrierPalletSlotRows.find((row) => Number(row?.slotNo) === targetSlotNo) || null;
    if (!slot || slot.occupied) {
      window.alert('이미 이 파레트 자리에 적재물이 있습니다.');
      return;
    }
    openEmptyPalletLoadPickerForCarrierSlot(carrierId, targetSlotNo);
  }, [openEmptyPalletLoadPickerForCarrierSlot, selectedCarrier, selectedCarrierPalletSlotRows]);

  const chooseCarrierPalletLoadSource = useCallback((sourceSlot) => {
    const carrierId = String(carrierPalletLoadPicker?.carrierId || '');
    const targetSlotNo = Math.max(1, Math.floor(Number(carrierPalletLoadPicker?.slotNo) || 0));
    const sourceRow = harvestLoadSourceRows.find((row) => Number(row?.slot) === Number(sourceSlot)) || null;
    applyCarrierPalletLoadSourceRow(sourceRow, carrierId, targetSlotNo);
  }, [
    applyCarrierPalletLoadSourceRow,
    carrierPalletLoadPicker,
    harvestLoadSourceRows
  ]);

  const unloadEmptyPalletFromCarrierSlot = useCallback((slotNo) => {
    const carrierId = String(selectedCarrier?.id || '');
    const targetSlotNo = Math.max(1, Math.floor(Number(slotNo) || 0));
    const selectedFacilityKey = String(facilityStorageModalFacilityKey || '');
    if (!carrierId || targetSlotNo <= 0 || !selectedFacilityKey) return;
    const slot = selectedCarrierPalletSlotRows.find((row) => Number(row?.slotNo) === targetSlotNo) || null;
    if (!slot || slot.slotType !== 'emptyPallet') return;
    setGame((prev) => {
      if (!prev) return prev;
      const { fieldId, defaultFacilityKey, byFacility } = resolveFieldFacilityInventoryByFacility(prev, prev?.selectedField);
      const safeFacilityKey = selectedFacilityKey || defaultFacilityKey;
      if (!fieldId || !safeFacilityKey) return prev;
      const nextByFacility = { ...(byFacility || {}) };
      const facilityInventory = { ...(nextByFacility[safeFacilityKey] || {}) };
      facilityInventory.plasticPallet1100 = Math.max(0, Number(facilityInventory.plasticPallet1100) || 0) + 1;
      nextByFacility[safeFacilityKey] = facilityInventory;
      const nextInventory = { ...(prev.inventory || {}) };
      nextInventory.plasticPallet1100 = Math.max(0, Number(nextInventory.plasticPallet1100) || 0) + 1;
      const nextVehiclePalletSlotsByInstance = { ...(prev.vehiclePalletSlotsByInstance || {}) };
      const carrierSlots = { ...(nextVehiclePalletSlotsByInstance[carrierId] || {}) };
      delete carrierSlots[targetSlotNo];
      if (Object.keys(carrierSlots).length > 0) nextVehiclePalletSlotsByInstance[carrierId] = carrierSlots;
      else delete nextVehiclePalletSlotsByInstance[carrierId];
      return {
        ...prev,
        inventory: nextInventory,
        vehiclePalletSlotsByInstance: nextVehiclePalletSlotsByInstance,
        fieldFacilityInventoryByFieldId: {
          ...(prev.fieldFacilityInventoryByFieldId || {}),
          [fieldId]: nextByFacility
        }
      };
    });
  }, [
    facilityStorageModalFacilityKey,
    resolveFieldFacilityInventoryByFacility,
    selectedCarrier,
    selectedCarrierPalletSlotRows,
    setGame
  ]);

  return {
    openEmptyPalletLoadPickerForCarrierSlot,
    loadEmptyPalletToCarrierSlot,
    chooseCarrierPalletLoadSource,
    unloadEmptyPalletFromCarrierSlot
  };
}

export function useWarehouseHarvestMoveActions({
  facilityStorageHarvestGeneralMovePicker,
  facilityStorageHarvestGeneralRowMap,
  facilityStorageHarvestGeneralMoveTargetRows,
  facilityStorageHarvestMovePicker,
  facilityStorageTransportDockPreviewSource,
  facilityStorageSelectedTransportDockStoredSource,
  facilityStorageSelectedTransportMode,
  facilityStorageSelectedTransportRow,
  facilityStorageSelectedTransportCanMovePallet,
  facilityStorageSelectedTransportCanStackPallet,
  facilityStorageHarvestSlotRows,
  resolveFacilityStorageWarehouseSlotRow,
  activeFacilityStorageKey,
  activeFacilityStorageUsedKg = 0,
  activeFacilityStorageCapacityKg = 0,
  facilityStorageModal,
  harvestStoredFloorSummaryRowsByFacilityAndSlot,
  harvestStoredPalletSlotsByVehicleInstance,
  harvestStoredPalletSlotsByFacility,
  harvestPalletLayerEntryOf,
  harvestBoxesPerPallet,
  harvestBoxCapacityKg,
  facilityStorageDefaultPalletWeightKg,
  facilityStorageDefaultLoadBoxWeightKg,
  itemMetaByKey,
  game,
  setGame,
  setFacilityStorageTab,
  setFacilityStorageHarvestTab,
  harvestAvailablePalletQty,
  harvestLoadSourceRows,
  resolveFieldFacilityInventoryByFacility,
  facilityStorageModalFacilityKey,
  setFacilityStorageHarvestGeneralMovePicker,
  setFacilityStorageHarvestMovePicker,
  setFacilityStorageHarvestDetailSlotNo,
  setFacilityStorageHarvestDetailSource,
  setFacilityStorageHarvestDetailLayer,
  setFacilityStorageHarvestSlotByFacility,
  setFacilityStorageHarvestVisibleLayerBySlot,
  primeFacilityStorageHarvestIndividualFillAnim,
  playFacilityStorageHarvestIndividualFillAnim,
  playFacilityStorageHarvestStackAnim,
  playFacilityStorageHarvestGeneralFirstLoadAnim,
  resolveMachineInstanceById,
  machineDisplayNameWithRentTag,
  decodeUnicodeEscapes,
  stripColdStorageIconName,
  facilityMap,
  laborText,
  roundLabor,
  isMatchingHarvestGeneralBatch,
  isMatchingHarvestPalletCardBatch,
  harvestPalletLoadMeta,
  machineParkingInstanceId,
  facilityStoragePalletMoveWear,
  facilityStorageForkliftPalletMoveLabor,
  facilityStoragePalletJackPalletMoveLabor,
  applyEquipmentUseWear,
  normalizeHarvestPalletMemoByFieldMap,
  openSelectedFieldWarehouseStorageModal,
  queueSelectedFieldWarehouseStorageModal,
  clearTransportDockPreview,
  traceHarvestIndividualFillAnim = null
}) {
  const PALLET_TRANSFER_TARGET_ANIM_DELAY_MS = 260;
  const focusWarehouseTargetFacility = useCallback((targetFacilityKeyRaw, targetTypeRaw, targetWarehouseSubTabRaw = '') => {
    const targetType = String(targetTypeRaw || '');
    const targetFacilityKey = String(targetFacilityKeyRaw || '');
    const targetWarehouseSubTab = (() => {
      const rawSubTab = String(targetWarehouseSubTabRaw || '');
      if (rawSubTab === 'workbench') return 'workbench';
      if (rawSubTab === 'sorting') return 'sorting';
      return '';
    })();
    if (!targetType.startsWith('warehouse-') || !targetFacilityKey) return;
    const targetHarvestTab = targetType === 'warehouse-general' ? 'general' : 'pallet';
    const targetPrimaryTab = targetWarehouseSubTab ? 'facility' : 'harvest';
    if (queueSelectedFieldWarehouseStorageModal) {
      queueSelectedFieldWarehouseStorageModal(targetFacilityKey, true, true, targetPrimaryTab, targetHarvestTab, targetWarehouseSubTab);
      return;
    }
    openSelectedFieldWarehouseStorageModal?.(targetFacilityKey, true, true, targetPrimaryTab, targetHarvestTab, targetWarehouseSubTab);
  }, [openSelectedFieldWarehouseStorageModal, queueSelectedFieldWarehouseStorageModal]);

  const harvestGeneralDisplayKeyOf = useCallback(({
    facilityKey,
    loadBoxKey,
    qualityLabel,
    cropLabel,
    stemStatusKey,
    sourceIsFullBox,
    sourceFillStep,
    qtyKg
  }) => {
    const normalizedFacilityKey = String(facilityKey || '').trim();
    if (!normalizedFacilityKey) return '';
    const normalizedLoadBoxKey = String(loadBoxKey || 'appleContainerYellow20kg').trim() || 'appleContainerYellow20kg';
    const normalizedQualityLabel = String(qualityLabel || '보통').trim() || '보통';
    const normalizedCropLabel = String(cropLabel || '기타').trim() || '기타';
    const normalizedStemStatusKey = String(stemStatusKey || 'attached').trim() || 'attached';
    const safeHarvestBoxCapacityKg = Math.max(0.001, Number(harvestBoxCapacityKg) || 20);
    const resolvedIsFullBox = typeof sourceIsFullBox === 'boolean'
      ? sourceIsFullBox
      : (Math.max(0, Number(qtyKg) || 0) >= safeHarvestBoxCapacityKg - 0.001);
    const resolvedFillStep = resolvedIsFullBox
      ? 3
      : Math.max(
        1,
        Math.min(
          2,
          Math.floor(
            Number(sourceFillStep)
            || ((Math.max(0, Number(qtyKg) || 0) / safeHarvestBoxCapacityKg) > (1 / 3) ? 2 : 1)
          )
        )
      );
    const groupKey = resolvedIsFullBox
      ? `${normalizedFacilityKey}:${normalizedLoadBoxKey}:${normalizedQualityLabel}:${normalizedCropLabel}:${normalizedStemStatusKey}:full`
      : `${normalizedFacilityKey}:${normalizedLoadBoxKey}:${normalizedQualityLabel}:${normalizedCropLabel}:${normalizedStemStatusKey}:partial:${resolvedFillStep}`;
    return `harvestStoredGeneral:${groupKey}`;
  }, [harvestBoxCapacityKg]);
  const targetAvailableBoxCountOf = useCallback((target) => {
    const explicit = Math.floor(Number(target?.availableBoxCount));
    if (Number.isFinite(explicit)) return Math.max(0, explicit);
    const targetType = String(target?.targetType || '');
    const safeHarvestBoxesPerPallet = Math.max(1, Math.floor(Number(harvestBoxesPerPallet) || 36));
    const targetCapacityBoxes = Math.max(
      1,
      Math.floor(Number(target?.maxBoxes ?? target?.capacityBoxes) || safeHarvestBoxesPerPallet)
    );
    const filledBoxCount = Math.max(0, Math.floor(Number(target?.filledBoxCount) || 0));
    if ([
      'warehouse-empty',
      'warehouse-floor-harvest',
      'warehouse-empty-pallet',
      'warehouse-harvest-pallet',
      'vehicle-slot',
    ].includes(targetType)) {
      return Math.max(0, targetCapacityBoxes - filledBoxCount);
    }
    return Math.max(0, Math.floor((Math.max(0, Number(target?.availableKg) || 0) + 0.001) / Math.max(0.001, Number(harvestBoxCapacityKg) || 20)));
  }, [harvestBoxCapacityKg, harvestBoxesPerPallet]);

  const confirmHarvestGeneralMoveToPallet = useCallback(() => {
    window.alert('수확물 일반저장 경로는 더 이상 사용하지 않습니다.');
    setFacilityStorageHarvestGeneralMovePicker(null);
    setFacilityStorageHarvestMovePicker(null);
    return;
    const picker = facilityStorageHarvestGeneralMovePicker;
    const facilityKey = String(picker?.facilityKey || '');
    const rowKey = String(picker?.rowKey || '');
    const row = facilityStorageHarvestGeneralRowMap?.[rowKey] || null;
    const selectedTargetKeys = Array.isArray(picker?.selectedTargetKeys) ? picker.selectedTargetKeys : [];
    if (!facilityKey || !row) return;
    const selectedTargets = facilityStorageHarvestGeneralMoveTargetRows
      .filter((target) => selectedTargetKeys.includes(String(target?.key || '')) && target?.canChoose);
    if (!selectedTargets.length) {
      window.alert('옮길 저장공간을 먼저 선택해 주세요.');
      return;
    }
    const totalBoxCount = Math.max(0, Math.floor(Number(row?.qty) || 0));
    const maxBoxCountByTargets = selectedTargets.reduce((sum, target) => (
      sum + targetAvailableBoxCountOf(target)
    ), 0);
    const selectedBoxCount = Math.max(0, Math.min(
      totalBoxCount,
      maxBoxCountByTargets,
      Math.floor(Number(picker?.selectedBoxCount) || 0)
    ));
    if (totalBoxCount <= 0) {
      window.alert('옮길 수확물 박스 수를 확인할 수 없습니다.');
      return;
    }
    if (selectedBoxCount <= 0) {
      window.alert('옮길 박스 수를 먼저 선택해 주세요.');
      return;
    }
    if (selectedBoxCount > totalBoxCount) {
      window.alert(`현재 일반저장 수확물은 ${totalBoxCount.toLocaleString()}박스까지만 옮길 수 있습니다.`);
      return;
    }
    if (selectedBoxCount > maxBoxCountByTargets) {
      window.alert(`선택한 팔레트 수가 부족합니다. (선택 ${selectedTargets.length}칸 · 최대 ${maxBoxCountByTargets.toLocaleString()}박스)`);
      return;
    }
    const matchingBatches = (game?.storage || [])
      .map((batch, index) => ({ batch, index }))
      .filter(({ batch }) => isMatchingHarvestGeneralBatch(batch, row))
      .sort((a, b) => Math.max(0, Number(b?.batch?.qty) || 0) - Math.max(0, Number(a?.batch?.qty) || 0));
    if (!matchingBatches.length) {
      window.alert('일반저장 수확물 원본 데이터를 찾지 못했습니다.');
      return;
    }
    if (matchingBatches.length < selectedBoxCount) {
      window.alert('일반저장 수확물 보관량이 갱신되어 다시 선택이 필요합니다.');
      return;
    }
    const selectedBatchEntries = matchingBatches.slice(0, selectedBoxCount);
    const requiredKg = selectedBatchEntries.reduce((sum, entry) => sum + Math.max(0, Number(entry?.batch?.qty) || 0), 0);
    if (requiredKg <= 0) {
      window.alert('옮길 수확물 보관량을 확인할 수 없습니다.');
      return;
    }
    const totalBatchKg = matchingBatches.reduce((sum, entry) => sum + Math.max(0, Number(entry?.batch?.qty) || 0), 0);
    if (totalBatchKg + 0.001 < requiredKg) {
      window.alert('일반저장 수확물 보관량이 갱신되어 다시 선택이 필요합니다.');
      return;
    }
    const placementPlan = selectedTargets.map((target) => {
      const rawTargetType = String(target?.targetType || '');
      const targetType = unloadMode === 'individual'
        ? (
          rawTargetType === 'warehouse-stack-top'
            || rawTargetType === 'warehouse-harvest-pallet-blocked'
            || rawTargetType === 'warehouse-occupied'
            ? 'warehouse-harvest-pallet'
            : rawTargetType
        )
        : rawTargetType;
      const targetFacilityKey = String(target?.facilityKey || facilityKey || '');
      const slotNo = Math.max(1, Math.floor(Number(target?.slotNo) || 1));
      const layerNo = targetType === 'warehouse-stack-top' ? 2 : 1;
      return {
        targetType,
        facilityKey: targetFacilityKey,
        slotNo,
        layerNo,
        vehicleInstanceId: String(target?.vehicleInstanceId || ''),
        vehiclePalletSlotNo: Math.max(1, Math.floor(Number(target?.vehiclePalletSlotNo) || 1)),
        isSortingCargoSlot: Boolean(target?.isSortingCargoSlot),
        sortingEquipmentKey: String(target?.equipmentStorageKey || target?.sortingEquipmentKey || ''),
        sortingPositionKey: String(target?.positionKey || target?.cargoSlotKey || ''),
        isWorkbenchCargoSlot: Boolean(target?.isWorkbenchCargoSlot),
        workbenchFacilityKey: String(target?.facilityKey || targetFacilityKey || ''),
        workbenchSlotKey: String(target?.workbenchSlotKey || ''),
        workbenchCargoSlotKey: String(target?.cargoSlotKey || ''),
        remainBoxCount: targetAvailableBoxCountOf(target),
        groupId: `storage-repallet-${targetFacilityKey}-${slotNo}-${layerNo}`
      };
    });
    const batchPlacementById = {};
    selectedBatchEntries.forEach(({ batch, index }) => {
      const batchId = String(batch?.id || `batch-${index}`);
      const target = placementPlan.find((entry) => entry.remainBoxCount > 0);
      if (!target) return;
      target.remainBoxCount = Math.max(0, target.remainBoxCount - 1);
      batchPlacementById[`${index}:${batchId}`] = target;
    });
    if (Object.keys(batchPlacementById).length !== selectedBatchEntries.length) {
      window.alert('선택한 저장공간에 박스를 모두 나눠 담을 수 없습니다. 다른 저장공간을 더 선택해 주세요.');
      return;
    }
    setGame((prev) => {
      if (!prev) return prev;
      let movedBatchCount = 0;
      const nextStorage = (prev?.storage || []).map((batch, index) => {
        const batchId = String(batch?.id || `batch-${index}`);
        const placement = batchPlacementById[`${index}:${batchId}`];
        if (!placement) return batch;
        movedBatchCount += 1;
        if (placement.targetType === 'warehouse-general') {
          return {
            ...batch,
            palletized: false,
            storageFacilityKey: String(placement.facilityKey || ''),
            storagePalletGroupId: '',
            storagePalletNo: 0,
            storagePalletSlotNo: 0,
            storagePalletLayer: 0,
            storageVehicleInstanceId: '',
            storageVehiclePalletSlotNo: 0,
            storageVehiclePalletLayer: 0,
            ...clearHarvestBatchDedicatedStorageFields()
          };
        }
        if (placement.targetType === 'vehicle-slot') {
          return {
            ...batch,
            palletized: true,
            storageFacilityKey: '',
            storagePalletGroupId: '',
            storagePalletNo: 0,
            storagePalletSlotNo: 0,
            storagePalletLayer: 0,
            storageVehicleInstanceId: String(placement.vehicleInstanceId || ''),
            storageVehiclePalletSlotNo: Math.max(1, Number(placement.vehiclePalletSlotNo) || 1),
            storageVehiclePalletLayer: 1,
            ...clearHarvestBatchDedicatedStorageFields()
          };
        }
        return {
          ...batch,
          palletized: true,
          ...buildHarvestBatchStoragePatch({
            targetType: placement.targetType,
            targetFacilityKey: String(placement.facilityKey || facilityKey || ''),
            nextTargetSlotNo: placement.slotNo,
            targetLayerNo: placement.layerNo,
            targetGroupId: placement.groupId,
            targetIsSortingCargoSlot: placement.isSortingCargoSlot,
            targetSortingEquipmentKey: placement.sortingEquipmentKey,
            targetSortingPositionKey: placement.sortingPositionKey,
            targetIsWorkbenchCargoSlot: placement.isWorkbenchCargoSlot,
            targetWorkbenchFacilityKey: placement.workbenchFacilityKey,
            targetWorkbenchSlotKey: placement.workbenchSlotKey,
            targetWorkbenchCargoSlotKey: placement.workbenchCargoSlotKey,
          }),
          storageVehiclePalletLayer: 0
        };
      });
      if (movedBatchCount <= 0) return prev;
      const targetSummaryText = selectedTargets
        .map((target) => {
          const targetType = String(target?.targetType || '');
          if (targetType === 'warehouse-general') {
            return decodeUnicodeEscapes(stripColdStorageIconName(facilityMap?.[String(target?.facilityKey || '')]?.name || '다른 창고 일반저장'));
          }
          if (targetType === 'vehicle-slot') {
            const vehicle = resolveMachineInstanceById(String(target?.vehicleInstanceId || ''));
            const vehicleLabel = vehicle
              ? `${vehicle?.item?.name || vehicle?.machineKey || '차량'} #${vehicle?.unitNo || 1}`
              : '차량';
            return `${vehicleLabel} 팔레트 ${Math.max(1, Math.floor(Number(target?.vehiclePalletSlotNo) || 1))}`;
          }
          const facilityLabel = String(target?.facilityKey || '') !== facilityKey
            ? `${decodeUnicodeEscapes(stripColdStorageIconName(facilityMap?.[String(target?.facilityKey || '')]?.name || '다른 창고'))} `
            : '';
          return `${facilityLabel}P${Math.max(1, Math.floor(Number(target?.slotNo) || 1))}${targetType === 'warehouse-stack-top' ? ' 2단' : ''}`;
        })
        .join(', ');
      return {
        ...prev,
        storage: nextStorage,
        logs: pushDiary(
          prev,
          `${facilityStorageModal?.facilityName || '창고'} 일반저장 수확물 ${selectedBoxCount.toLocaleString()}박스 ${Math.round(requiredKg).toLocaleString()}kg 팔레트 이동 → ${targetSummaryText}`
        )
      };
    });
    setFacilityStorageHarvestGeneralMovePicker(null);
    setFacilityStorageHarvestMovePicker(null);
    const focusedWarehouseTarget = selectedTargets.find((target) => String(target?.targetType || '').startsWith('warehouse-')) || null;
    const focusedTargetType = focusedWarehouseTarget
      ? String(focusedWarehouseTarget?.targetType || '')
      : (selectedTargets.some((target) => String(target?.targetType || '') === 'warehouse-general') ? 'warehouse-general' : 'warehouse-empty');
    if (focusedWarehouseTarget) {
      focusWarehouseTargetFacility(
        String(focusedWarehouseTarget?.facilityKey || ''),
        focusedTargetType,
        focusedWarehouseTarget?.isWorkbenchCargoSlot
          ? 'workbench'
          : (focusedWarehouseTarget?.isSortingCargoSlot ? 'sorting' : '')
      );
    }
  }, [
    decodeUnicodeEscapes,
    facilityMap,
    facilityStorageHarvestGeneralMovePicker,
    facilityStorageHarvestGeneralMoveTargetRows,
    facilityStorageHarvestGeneralRowMap,
    facilityStorageModal,
    game?.storage,
    harvestGeneralDisplayKeyOf,
    harvestBoxCapacityKg,
    isMatchingHarvestGeneralBatch,
    playFacilityStorageHarvestGeneralFirstLoadAnim,
    resolveMachineInstanceById,
    setFacilityStorageHarvestGeneralMovePicker,
    setFacilityStorageHarvestMovePicker,
    setGame,
    stripColdStorageIconName,
    targetAvailableBoxCountOf,
    focusWarehouseTargetFacility
  ]);

  const chooseHarvestPalletMoveTarget = useCallback((target, options = {}) => {
    const mergedStoredOrPreviewSource = facilityStorageTransportDockPreviewSource
      || facilityStorageSelectedTransportDockStoredSource
      || null;
    const picker = (facilityStorageHarvestMovePicker || mergedStoredOrPreviewSource)
      ? {
        ...(mergedStoredOrPreviewSource || {}),
        ...(facilityStorageHarvestMovePicker || {}),
        sourceBoxCard: facilityStorageHarvestMovePicker?.sourceBoxCard
          || mergedStoredOrPreviewSource?.sourceBoxCard
          || null,
        selectedBoxCount: Math.max(
          0,
          Math.floor(
            Number(
              facilityStorageHarvestMovePicker?.selectedBoxCount
              ?? mergedStoredOrPreviewSource?.selectedBoxCount
              ?? 0
            ) || 0
          )
        ),
      }
      : null;
    const sourceTypeRaw = String(picker?.sourceType || 'warehouse-slot');
    const unloadMode = String(facilityStorageSelectedTransportMode || 'pallet') === 'individual' ? 'individual' : 'pallet';
    const keepIndividualPickerOpen = Boolean(options?.keepIndividualPickerOpen);
    const safeHarvestBoxCapacityKg = Math.max(0.001, Number(harvestBoxCapacityKg) || 20);
    const safeHarvestBoxesPerPallet = Math.max(
      1,
      Math.floor(
        Number(harvestBoxesPerPallet)
        || Math.round(720 / safeHarvestBoxCapacityKg)
        || 36
      )
    );
    const safeVehicleSlotFloorBoxes = 55;
    const inferHarvestBoxCountFromQty = (qtyKgRaw) => {
      const qtyKg = Math.max(0, Number(qtyKgRaw) || 0);
      if (qtyKg <= 0) return 0;
      return Math.max(1, Math.ceil((qtyKg - 0.001) / safeHarvestBoxCapacityKg));
    };
    const countHarvestBoxesInTargetLayer = ({
      targetType = '',
      facilityKey = '',
      slotNo = 0,
      vehicleInstanceId = '',
      vehicleFloorTarget = false,
      dedicatedKind = '',
      sortingEquipmentKey = '',
      sortingPositionKey = '',
      workbenchSlotKey = '',
      workbenchCargoSlotKey = '',
    } = {}) => {
      const safeTargetType = String(targetType || '');
      const safeFacilityKey = String(facilityKey || '');
      const safeVehicleInstanceId = String(vehicleInstanceId || '');
      const safeSlotNo = Math.max(1, Math.floor(Number(slotNo) || 0));
      if (![
        'warehouse-empty',
        'warehouse-floor-harvest',
        'warehouse-empty-pallet',
        'warehouse-harvest-pallet',
        'vehicle-slot'
      ].includes(safeTargetType)) return 0;
      if (['warehouse-empty', 'warehouse-floor-harvest', 'warehouse-empty-pallet', 'warehouse-harvest-pallet'].includes(safeTargetType) && (!safeFacilityKey || safeSlotNo <= 0)) return 0;
      if (safeTargetType === 'vehicle-slot' && (!safeVehicleInstanceId || safeSlotNo <= 0)) return 0;
      return (game?.storage || []).reduce((sum, batch) => {
        if (safeTargetType === 'vehicle-slot') {
          if (String(batch?.storageVehicleInstanceId || '') !== safeVehicleInstanceId) return sum;
          if (Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0)) !== safeSlotNo) return sum;
          if (vehicleFloorTarget) {
            if (batch?.palletized) return sum;
            return sum + inferHarvestBoxCountFromQty(batch?.qty);
          }
          if (!batch?.palletized) return sum;
          if (Math.max(1, Math.min(2, Math.floor(Number(batch?.storageVehiclePalletLayer) || 1))) !== 1) return sum;
          return sum + inferHarvestBoxCountFromQty(batch?.qty);
        }
        if (safeTargetType === 'warehouse-empty' || safeTargetType === 'warehouse-floor-harvest') {
          if (batch?.palletized) return sum;
          if (!matchHarvestBatchStorageSlot(batch, {
            facilityKey: safeFacilityKey,
            slotNo: safeSlotNo,
            dedicatedKind,
            sortingEquipmentKey,
            sortingPositionKey,
            workbenchSlotKey,
            workbenchCargoSlotKey,
          })) return sum;
          return sum + inferHarvestBoxCountFromQty(batch?.qty);
        }
        if (!batch?.palletized) return sum;
        if (!matchHarvestBatchStorageSlot(batch, {
          facilityKey: safeFacilityKey,
          slotNo: safeSlotNo,
          dedicatedKind,
          sortingEquipmentKey,
          sortingPositionKey,
          workbenchSlotKey,
          workbenchCargoSlotKey,
        })) return sum;
        if (Math.max(1, Math.min(2, Math.floor(Number(batch?.storagePalletLayer) || 1))) !== 1) return sum;
        if (safeTargetType === 'warehouse-empty-pallet' && Math.max(0, Number(batch?.qty) || 0) > 0.001) {
          return sum + inferHarvestBoxCountFromQty(batch?.qty);
        } else {
          return sum + inferHarvestBoxCountFromQty(batch?.qty);
        }
      }, 0);
    };
    const clearBlockedIndividualMoveState = () => {
      if (unloadMode !== 'individual' || typeof setFacilityStorageHarvestMovePicker !== 'function') return;
      setFacilityStorageHarvestMovePicker((prev) => (
        prev
          ? {
            ...prev,
            pendingTarget: null,
            resumePendingTargetAfterCommit: null,
            selectedBoxCount: 0,
            selectedSourceCards: [],
            sourceBoxCard: null,
            autoCommitToPendingTargetTick: 0,
          }
          : prev
      ));
    };
    if (sourceTypeRaw === 'warehouse-general') {
      window.alert('수확물 일반저장 경로는 더 이상 사용하지 않습니다.');
      setFacilityStorageHarvestMovePicker?.(null);
      return;
      const sourceFacilityKey = String(picker?.sourceFacilityKey || '');
      const sourceRowKey = String(picker?.sourceRowKey || '');
      const sourceRow = facilityStorageHarvestGeneralRowMap?.[sourceRowKey] || null;
      const totalBoxCount = Math.max(0, Math.floor(Number(sourceRow?.qty) || 0));
      const selectedBoxCount = totalBoxCount > 0 ? 1 : 0;
      const targetType = String(target?.targetType || '');
      const targetIsVehicleFloor = targetType === 'vehicle-slot' && Boolean(target?.isVehicleFloorTarget);
      const targetBoxCapacity = targetIsVehicleFloor
        ? safeVehicleSlotFloorBoxes
        : Math.max(1, Math.floor(Number(target?.maxBoxes ?? target?.capacityBoxes) || safeHarvestBoxesPerPallet));
      const targetBoxLimitSubject = (targetType === 'warehouse-empty' || targetType === 'warehouse-floor-harvest')
        ? '바닥 적재칸 한 칸'
        : targetIsVehicleFloor
          ? '차량 바닥 적재칸 한 칸'
        : targetType === 'vehicle-slot'
          ? '운반기구 적재칸 한 칸'
          : '팔레트 한 장';
      const targetFacilityKey = String(target?.facilityKey || picker?.targetFacilityKey || '');
      const nextTargetSlotNo = Math.max(1, Math.floor(Number(target?.slotNo) || 0));
      const targetVehicleInstanceId = String(target?.vehicleInstanceId || '');
      const targetVehiclePalletSlotNo = Math.max(1, Math.floor(Number(target?.vehiclePalletSlotNo) || 0));
      const targetAvailableBoxCount = targetAvailableBoxCountOf(target);
      const selectedTransportRow = facilityStorageSelectedTransportRow;
      if (!sourceFacilityKey || !sourceRow) return;
      if (!selectedTransportRow) {
        window.alert('운반기구를 먼저 선택해 주세요.');
        return;
      }
      if (!picker?.sourceBoxCard || Math.max(0, Math.floor(Number(picker?.selectedBoxCount) || 0)) <= 0) {
        window.alert('일반저장 수확물은 먼저 운반기구에 1박스 실은 뒤 목적지를 선택해 주세요.');
        return;
      }
      if (targetType === 'vehicle-cargo') {
        window.alert('수확물은 차량 일반 적재함이 아니라 차량 수확물 적재칸에 적재해 주세요.');
        return;
      }
      if (targetType !== 'vehicle-slot') {
        window.alert('일반저장 수확물은 먼저 운반기구에 1박스씩 실은 뒤 목적지로 옮겨 주세요.');
        return;
      }
      if (!['warehouse-empty', 'warehouse-floor-harvest', 'warehouse-stack-top', 'warehouse-general', 'vehicle-slot', 'warehouse-empty-pallet', 'warehouse-harvest-pallet'].includes(targetType)) return;
      if ((targetType === 'warehouse-general' || targetType === 'warehouse-floor-harvest') && unloadMode !== 'individual') {
        window.alert('일반저장이나 바닥 적재칸으로 옮기려면 개별 적재를 선택해 주세요.');
        return;
      }
      if ((targetType === 'warehouse-stack-top') && unloadMode !== 'pallet') {
        return;
      }
      if ((targetType === 'warehouse-empty-pallet' || targetType === 'warehouse-harvest-pallet' || targetType === 'vehicle-slot') && unloadMode !== 'individual') {
        window.alert('빈 팔레트에 옮겨 담으려면 개별 적재를 선택해 주세요.');
        return;
      }
      if (target?.canChoose === false) {
        window.alert('현재 선택한 곳으로는 옮길 수 없습니다.');
        return;
      }
      if (totalBoxCount <= 0 || selectedBoxCount <= 0) {
        window.alert('옮길 박스 수를 먼저 선택해 주세요.');
        return;
      }
      const matchingBatches = (game?.storage || [])
        .map((batch, index) => ({ batch, index }))
        .filter(({ batch }) => isMatchingHarvestGeneralBatch(batch, sourceRow))
        .sort((a, b) => Math.max(0, Number(b?.batch?.qty) || 0) - Math.max(0, Number(a?.batch?.qty) || 0));
      if (!matchingBatches.length) {
        window.alert('일반저장 수확물 원본 데이터를 찾지 못했습니다.');
        return;
      }
      if (matchingBatches.length < selectedBoxCount) {
        window.alert('일반저장 수확물 보관량이 갱신되어 다시 선택이 필요합니다.');
        return;
      }
      const selectedBatchEntries = matchingBatches.slice(0, selectedBoxCount);
      const requiredKg = selectedBatchEntries.reduce((sum, entry) => sum + Math.max(0, Number(entry?.batch?.qty) || 0), 0);
      if (requiredKg <= 0) {
        window.alert('옮길 수확물 보관량을 확인할 수 없습니다.');
        return;
      }
      const targetIsWorkbenchCargoSlot = Boolean(target?.isWorkbenchCargoSlot);
      const targetIsSortingCargoSlot = Boolean(target?.isSortingCargoSlot);
      const targetSortingEquipmentKey = String(target?.equipmentStorageKey || target?.sortingEquipmentKey || '');
      const targetSortingPositionKey = String(target?.positionKey || target?.cargoSlotKey || '');
      const targetWorkbenchFacilityKey = String(target?.facilityKey || targetFacilityKey || '');
      const targetWorkbenchSlotKey = String(target?.workbenchSlotKey || '');
      const targetWorkbenchCargoSlotKey = String(target?.cargoSlotKey || '');
      let currentTargetBoxCount = 0;
      if (['warehouse-empty', 'warehouse-floor-harvest', 'warehouse-empty-pallet', 'warehouse-harvest-pallet', 'vehicle-slot'].includes(targetType)) {
        currentTargetBoxCount = countHarvestBoxesInTargetLayer({
          targetType,
          facilityKey: targetFacilityKey,
          slotNo: targetType === 'vehicle-slot' ? targetVehiclePalletSlotNo : nextTargetSlotNo,
          vehicleInstanceId: targetVehicleInstanceId,
          vehicleFloorTarget: targetIsVehicleFloor,
          dedicatedKind: targetIsSortingCargoSlot ? 'sorting' : (targetIsWorkbenchCargoSlot ? 'workbench' : ''),
          sortingEquipmentKey: targetSortingEquipmentKey,
          sortingPositionKey: targetSortingPositionKey,
          workbenchSlotKey: targetWorkbenchSlotKey,
          workbenchCargoSlotKey: targetWorkbenchCargoSlotKey,
        });
        const liveTargetAvailableBoxCount = Math.max(0, targetBoxCapacity - currentTargetBoxCount);
        if (currentTargetBoxCount + selectedBoxCount > targetBoxCapacity) {
          clearBlockedIndividualMoveState();
          window.alert(
            currentTargetBoxCount >= targetBoxCapacity
              ? '적재할 곳이 다 찼습니다.'
              : `${targetBoxLimitSubject}에는 최대 ${targetBoxCapacity.toLocaleString()}박스까지만 적재할 수 있습니다.`
          );
          return;
        }
        if (selectedBoxCount > liveTargetAvailableBoxCount) {
          clearBlockedIndividualMoveState();
          window.alert(liveTargetAvailableBoxCount <= 0
            ? '적재할 곳이 다 찼습니다.'
            : `선택한 저장공간에는 ${liveTargetAvailableBoxCount.toLocaleString()}박스까지만 추가 적재할 수 있습니다.`);
          return;
        }
      }
      const targetIsAuxCargoSlot = targetIsWorkbenchCargoSlot || targetIsSortingCargoSlot;
      const targetDisplayLabel = String(target?.displayLabel || '').trim();
      const targetLabel = targetIsAuxCargoSlot && targetDisplayLabel
        ? targetDisplayLabel
        : targetType === 'vehicle-slot'
        ? (() => {
          const targetVehicle = resolveMachineInstanceById(targetVehicleInstanceId);
          return `${targetVehicle ? machineDisplayNameWithRentTag(targetVehicle) : '차량'} 적재함 P${targetVehiclePalletSlotNo}`;
        })()
        : targetType === 'warehouse-general'
          ? `${decodeUnicodeEscapes(stripColdStorageIconName(facilityMap?.[targetFacilityKey]?.name || targetFacilityKey || '창고'))} 일반저장`
          : `${decodeUnicodeEscapes(stripColdStorageIconName(facilityMap?.[targetFacilityKey]?.name || targetFacilityKey || '창고'))} P${nextTargetSlotNo}${targetType === 'warehouse-stack-top' ? ' 상단' : ''}`;
      const moveLogText = `${facilityStorageModal?.facilityName || '창고'} ${Math.max(0, Number(sourceRow?.sourceSlotNo) || 0) > 0 ? '바닥 적재 수확물' : '일반저장 수확물'} ${selectedBoxCount.toLocaleString()}박스 ${Math.round(requiredKg).toLocaleString()}kg 이동 → ${targetLabel}${(targetType === 'warehouse-empty' || targetType === 'warehouse-floor-harvest') && unloadMode === 'individual' ? ' (바닥 적재)' : ''}`;
      const targetLoadAnimVisualSlotNos = unloadMode === 'individual'
        ? Array.from(
            { length: selectedBoxCount },
            (_, index) => currentTargetBoxCount + index + 1
          ).filter((value) => value > 0)
        : [];
      const targetLayerNo = targetType === 'warehouse-stack-top' ? 2 : 1;
      const targetGroupId = targetType === 'warehouse-empty' || targetType === 'warehouse-stack-top' || targetType === 'warehouse-empty-pallet' || targetType === 'warehouse-harvest-pallet'
        ? `storage-repallet-${targetFacilityKey}-${nextTargetSlotNo}-${targetLayerNo}`
        : '';
      const generalTargetRowKey = targetType === 'warehouse-general'
        ? harvestGeneralDisplayKeyOf({
          facilityKey: targetFacilityKey,
          loadBoxKey: sourceRow?.loadBoxKey,
          qualityLabel: sourceRow?.qualityLabel,
          cropLabel: sourceRow?.cropLabel || sourceRow?.name,
          stemStatusKey: sourceRow?.stemStatusKey,
          sourceIsFullBox: sourceRow?.sourceIsFullBox,
          sourceFillStep: sourceRow?.sourceFillStep,
          qtyKg: sourceRow?.totalKg
        })
        : '';
      setGame((prev) => {
        if (!prev) return prev;
        let movedBatchCount = 0;
        const selectedBatchKeySet = new Set(selectedBatchEntries.map(({ index, batch }) => `${index}:${String(batch?.id || `batch-${index}`)}`));
        const nextStorage = (prev?.storage || []).map((batch, index) => {
          const batchKey = `${index}:${String(batch?.id || `batch-${index}`)}`;
          if (!selectedBatchKeySet.has(batchKey)) return batch;
          movedBatchCount += 1;
          if (targetType === 'warehouse-general' || ((targetType === 'warehouse-empty' || targetType === 'warehouse-floor-harvest') && unloadMode === 'individual')) {
            return {
              ...batch,
              palletized: false,
              storageFacilityKey: targetFacilityKey,
              storagePalletGroupId: '',
              storagePalletNo: targetType !== 'warehouse-general' ? nextTargetSlotNo : 0,
              storagePalletSlotNo: targetType !== 'warehouse-general' ? nextTargetSlotNo : 0,
              storagePalletLayer: 0,
              storageVehicleInstanceId: '',
              storageVehiclePalletSlotNo: 0,
              storageVehiclePalletLayer: 0,
              ...clearHarvestBatchDedicatedStorageFields()
            };
          }
          if (targetType === 'vehicle-slot') {
            if (targetIsVehicleFloor) {
              return {
                ...batch,
                palletized: false,
                storageFacilityKey: '',
                storagePalletGroupId: '',
                storagePalletNo: 0,
                storagePalletSlotNo: 0,
                storagePalletLayer: 0,
                storageVehicleInstanceId: targetVehicleInstanceId,
                storageVehiclePalletSlotNo: targetVehiclePalletSlotNo,
                storageVehiclePalletLayer: 0,
                ...clearHarvestBatchDedicatedStorageFields()
              };
            }
            return {
              ...batch,
              palletized: true,
              storageFacilityKey: '',
              storagePalletGroupId: '',
              storagePalletNo: 0,
              storagePalletSlotNo: 0,
              storagePalletLayer: 0,
              storageVehicleInstanceId: targetVehicleInstanceId,
              storageVehiclePalletSlotNo: targetVehiclePalletSlotNo,
              storageVehiclePalletLayer: 1,
              ...clearHarvestBatchDedicatedStorageFields()
            };
          }
          return {
            ...batch,
            palletized: true,
            ...buildHarvestBatchStoragePatch({
              targetType,
              targetFacilityKey,
              nextTargetSlotNo,
              targetLayerNo,
              targetGroupId,
              targetIsSortingCargoSlot,
              targetSortingEquipmentKey,
              targetSortingPositionKey,
              targetIsWorkbenchCargoSlot,
              targetWorkbenchFacilityKey,
              targetWorkbenchSlotKey,
              targetWorkbenchCargoSlotKey,
            }),
            storageVehiclePalletLayer: 0
          };
        });
        if (movedBatchCount <= 0) return prev;
        return {
          ...prev,
          storage: nextStorage,
          logs: pushDiary(prev, moveLogText),
        };
      });
      if (!targetIsAuxCargoSlot && (targetType === 'warehouse-empty' || targetType === 'warehouse-floor-harvest' || targetType === 'warehouse-stack-top' || targetType === 'warehouse-empty-pallet' || targetType === 'warehouse-harvest-pallet')) {
        setFacilityStorageHarvestSlotByFacility((prev) => {
          const next = { ...(prev || {}) };
          const targetRaw = Array.isArray(next?.[targetFacilityKey]) ? next[targetFacilityKey] : [];
          const targetNext = [...targetRaw];
          targetNext[nextTargetSlotNo - 1] = null;
          next[targetFacilityKey] = targetNext;
          return next;
        });
        setFacilityStorageHarvestVisibleLayerBySlot((prev) => ({
          ...(prev || {}),
          [nextTargetSlotNo]: targetType === 'warehouse-stack-top' ? 'top' : 'bottom'
        }));
        if (unloadMode === 'individual' && ['warehouse-empty', 'warehouse-floor-harvest', 'warehouse-empty-pallet', 'warehouse-harvest-pallet'].includes(targetType)) {
          traceHarvestIndividualFillAnim?.('actions-direct-call', {
            targetType,
            slotNo: nextTargetSlotNo,
            boxCount: selectedBoxCount,
            animKey: `warehouse:${nextTargetSlotNo}`,
            visualSlotNos: targetLoadAnimVisualSlotNos,
          });
          playFacilityStorageHarvestIndividualFillAnim?.(nextTargetSlotNo, selectedBoxCount, {
            animKey: `warehouse:${nextTargetSlotNo}`,
            visualSlotNos: targetLoadAnimVisualSlotNos,
          });
        }
        if (targetType === 'warehouse-stack-top') playFacilityStorageHarvestStackAnim(nextTargetSlotNo);
      }
      if (generalTargetRowKey) playFacilityStorageHarvestGeneralFirstLoadAnim?.(generalTargetRowKey);
      setFacilityStorageHarvestGeneralMovePicker(null);
      setFacilityStorageHarvestMovePicker(null);
      setFacilityStorageHarvestDetailSlotNo(0);
      setFacilityStorageHarvestDetailSource(null);
      setFacilityStorageHarvestDetailLayer('bottom');
      return;
    }
    const sourceType = sourceTypeRaw === 'vehicle-slot'
      ? 'vehicle-slot'
      : (sourceTypeRaw === 'vehicle-cargo' ? 'vehicle-cargo' : (sourceTypeRaw === 'empty-pallet-stock' ? 'empty-pallet-stock' : 'warehouse-slot'));
    const sourceFacilityKey = String(picker?.sourceFacilityKey || '');
    const sourceSlotNo = Math.max(1, Math.floor(Number(picker?.sourceSlotNo) || 0));
    const sourceVehicleInstanceId = String(picker?.sourceVehicleInstanceId || '');
    const sourceVehiclePalletSlotNo = Math.max(1, Math.floor(Number(picker?.sourceVehiclePalletSlotNo) || 0));
    const sourceVehicleFloorStored = Boolean(picker?.sourceVehicleFloorStored);
    const sourceLayerKey = String(picker?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
    const selectedTransportSourceKey = facilityStorageSelectedTransportRow?.sourceType === 'machine'
      ? String(facilityStorageSelectedTransportRow?.machine?.id || '')
      : '';
    const sourceTransportKey = String(picker?.sourceTransportKey || '');
    const sourceIsSelectedTransportDock = sourceType === 'vehicle-slot'
      && sourceVehiclePalletSlotNo === 1
      && (
        Boolean(sourceTransportKey)
        || (
          Boolean(selectedTransportSourceKey)
          && sourceVehicleInstanceId === selectedTransportSourceKey
        )
      );
    const runTargetLoadAnim = (callback) => {
      if (typeof callback !== 'function') return;
      if (sourceIsSelectedTransportDock) {
        window.setTimeout(callback, PALLET_TRANSFER_TARGET_ANIM_DELAY_MS);
        return;
      }
      callback();
    };
    const warehouseSourceSlot = sourceType === 'warehouse-slot'
      ? (
        typeof resolveFacilityStorageWarehouseSlotRow === 'function'
          ? (resolveFacilityStorageWarehouseSlotRow(sourceSlotNo, sourceFacilityKey) || null)
          : (
            sourceFacilityKey === String(activeFacilityStorageKey || '')
              ? (facilityStorageHarvestSlotRows[sourceSlotNo - 1] || null)
              : null
          )
      )
      : null;
    const vehicleStoredSourceEntry = sourceType === 'vehicle-slot'
      ? (harvestStoredPalletSlotsByVehicleInstance?.[sourceVehicleInstanceId]?.[sourceVehiclePalletSlotNo] || null)
      : null;
    const vehicleFloorSourceEntry = sourceType === 'vehicle-slot' && sourceVehicleFloorStored
      ? (game?.storage || []).reduce((entry, batch) => {
        if (batch?.palletized) return entry;
        if (String(batch?.storageVehicleInstanceId || '') !== sourceVehicleInstanceId) return entry;
        if (Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0)) !== sourceVehiclePalletSlotNo) return entry;
        const qtyKg = Math.max(0, Number(batch?.qty) || 0);
        if (qtyKg <= 0) return entry;
        const next = entry || {
          sourceType: 'floorHarvest',
          sourceLabel: '차량 바닥 적재 수확물',
          qtyKg: 0,
          filledBoxTones: [],
          filledBoxSlotTones: [],
          partialBoxTones: [],
          storagePalletBoxCount: 0,
          storagePalletPartialBoxCount: 0,
          storagePalletRemainderKg: 0,
          isFloorStored: true
        };
        next.qtyKg = Math.max(0, Number(next.qtyKg) || 0) + qtyKg;
        return next;
      }, null)
      : null;
    const vehicleEmptyPalletSourceEntry = sourceType === 'vehicle-slot'
      ? (((game?.vehiclePalletSlotsByInstance || {})?.[sourceVehicleInstanceId] || {})?.[sourceVehiclePalletSlotNo] || null)
      : null;
    const sourceIsLoadedEmptyPallet = sourceType === 'empty-pallet-stock'
      || (
        sourceType === 'vehicle-slot'
        && !vehicleStoredSourceEntry?.bottomLayer
        && !vehicleStoredSourceEntry?.topLayer
        && Boolean(vehicleEmptyPalletSourceEntry)
      );
    const sourceWarehouseFloorEntry = sourceType === 'warehouse-slot'
      ? (harvestStoredFloorSummaryRowsByFacilityAndSlot?.[sourceFacilityKey]?.[sourceSlotNo] || null)
      : null;
    const sourceSlot = sourceType === 'empty-pallet-stock'
      ? {
        occupied: true,
        isHarvestStored: false,
        hasTopLayer: false,
        topLayer: null,
        sourceLabel: '빈 팔레트',
        qtyKg: 0,
        loadBoxKey: '',
        boxTone: '',
        filledBoxTones: [],
        filledBoxSlotTones: [],
        storagePalletBoxCount: 0,
        storagePalletRemainderKg: 0
      }
      : sourceType === 'warehouse-slot'
      ? warehouseSourceSlot
      : (vehicleFloorSourceEntry ? {
          occupied: true,
          isHarvestStored: true,
          isFloorStored: true,
          hasTopLayer: false,
          topLayer: null,
          ...vehicleFloorSourceEntry
        } : (vehicleStoredSourceEntry ? {
          occupied: true,
          isHarvestStored: true,
          hasTopLayer: Boolean(vehicleStoredSourceEntry?.topLayer),
          topLayer: vehicleStoredSourceEntry?.topLayer || null,
          ...vehicleStoredSourceEntry?.bottomLayer
        } : (
          sourceIsLoadedEmptyPallet ? {
            occupied: true,
            isHarvestStored: false,
            hasTopLayer: false,
            topLayer: null,
            sourceLabel: '빈 팔레트',
            qtyKg: 0,
            loadBoxKey: '',
            boxTone: '',
            filledBoxTones: [],
            filledBoxSlotTones: [],
            storagePalletBoxCount: 0,
            storagePalletRemainderKg: 0
          } : null
        )));
    const sourceIsHarvest = Boolean((sourceType === 'vehicle-slot' && !sourceIsLoadedEmptyPallet) || sourceType === 'vehicle-cargo' || sourceSlot?.isHarvestStored);
    const sourceIsFloorStored = Boolean(
      (sourceType === 'warehouse-slot' && (sourceSlot?.isFloorStored || sourceWarehouseFloorEntry))
      || (sourceType === 'vehicle-slot' && sourceSlot?.isFloorStored)
    );
    const sourceLayerEntry = sourceType === 'vehicle-slot'
      ? (
        sourceIsLoadedEmptyPallet
          ? sourceSlot
          : (sourceIsFloorStored ? sourceSlot : (sourceLayerKey === 'top' ? vehicleStoredSourceEntry?.topLayer || null : vehicleStoredSourceEntry?.bottomLayer || null))
      )
      : (sourceType === 'vehicle-cargo'
        ? null
        : (sourceType === 'empty-pallet-stock'
          ? sourceSlot
          : harvestPalletLayerEntryOf(sourceSlot, sourceLayerKey)));
    const storedSourceEntry = sourceType === 'warehouse-slot'
      ? (harvestStoredPalletSlotsByFacility?.[sourceFacilityKey]?.[sourceSlotNo] || null)
      : (sourceType === 'vehicle-slot' ? (sourceIsFloorStored ? { bottomLayer: sourceSlot } : vehicleStoredSourceEntry) : null);
    const sourceLayerNo = (() => {
      if (sourceLayerKey === 'top') return 2;
      if (sourceIsHarvest && !storedSourceEntry?.bottomLayer && storedSourceEntry?.topLayer) return 2;
      return 1;
    })();
    const sourceQtyKg = Math.max(0, Number(sourceLayerEntry?.qtyKg) || 0);
    const targetFacilityKey = String(target?.facilityKey || picker?.targetFacilityKey || '');
    const nextTargetSlotNo = Math.max(1, Math.floor(Number(target?.slotNo) || 0));
    const targetVehicleInstanceId = String(target?.vehicleInstanceId || '');
    const targetVehiclePalletSlotNo = Math.max(1, Math.floor(Number(target?.vehiclePalletSlotNo) || 0));
    const rawTargetType = String(target?.targetType || '');
    const liveTargetWarehouseSlot = (
      unloadMode === 'individual'
      && targetFacilityKey
      && nextTargetSlotNo > 0
      && String(rawTargetType || '').startsWith('warehouse-')
      && typeof resolveFacilityStorageWarehouseSlotRow === 'function'
    )
      ? (resolveFacilityStorageWarehouseSlotRow(nextTargetSlotNo, targetFacilityKey) || null)
      : null;
    const targetType = unloadMode === 'individual' && String(rawTargetType || '').startsWith('warehouse-')
      ? (
        liveTargetWarehouseSlot
          ? (
            liveTargetWarehouseSlot?.isFloorStored
              ? 'warehouse-floor-harvest'
              : liveTargetWarehouseSlot?.occupied
                ? (liveTargetWarehouseSlot?.isHarvestStored ? 'warehouse-harvest-pallet' : 'warehouse-empty-pallet')
                : 'warehouse-empty'
          )
          : (
            Boolean(target?.isFloorStored)
              ? 'warehouse-floor-harvest'
              : (
                Boolean(target?.hasStoredHarvest || target?.isHarvestStored)
                || rawTargetType === 'warehouse-stack-top'
                || rawTargetType === 'warehouse-harvest-pallet'
                || rawTargetType === 'warehouse-harvest-pallet-blocked'
                || rawTargetType === 'warehouse-occupied'
              )
                ? 'warehouse-harvest-pallet'
                : (
                  Boolean(target?.hasEmptyPallet) || rawTargetType === 'warehouse-empty-pallet'
                    ? 'warehouse-empty-pallet'
                    : 'warehouse-empty'
                )
          )
      )
      : rawTargetType;
    const targetBoxLimitSubject = (targetType === 'warehouse-empty' || targetType === 'warehouse-floor-harvest')
      ? '바닥 적재칸 한 칸'
      : '팔레트 한 장';
    const targetAvailableBoxCount = targetAvailableBoxCountOf(target);
    const targetVehicleStoredEntry = targetType === 'vehicle-slot'
      ? (harvestStoredPalletSlotsByVehicleInstance?.[targetVehicleInstanceId]?.[targetVehiclePalletSlotNo] || null)
      : null;
    const targetVehicleFloorEntry = targetType === 'vehicle-slot'
      ? (Array.isArray(game?.storage) ? game.storage.find((batch) => (
          !batch?.palletized
          && String(batch?.storageVehicleInstanceId || '') === targetVehicleInstanceId
          && Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0)) === targetVehiclePalletSlotNo
          && Math.max(0, Number(batch?.qty) || 0) > 0
        )) : null)
      : null;
    const targetVehicleEmptyPalletEntry = targetType === 'vehicle-slot'
      ? (((game?.vehiclePalletSlotsByInstance || {})?.[targetVehicleInstanceId] || {})?.[targetVehiclePalletSlotNo] || null)
      : null;
    const targetActuallyHasHarvestPallet = Boolean(targetVehicleStoredEntry?.bottomLayer);
    const targetActuallyHasFloorHarvest = Boolean(targetVehicleFloorEntry) && !targetActuallyHasHarvestPallet;
    const targetActuallyHasLoadedEmptyPallet = Boolean(targetVehicleEmptyPalletEntry)
      && !targetActuallyHasHarvestPallet
      && !targetActuallyHasFloorHarvest;
    if (sourceType === 'warehouse-slot') {
      if (!sourceFacilityKey || !sourceSlotNo || !sourceSlot) return;
      if (sourceSlot?.hasTopLayer && sourceLayerKey !== 'top') return;
    } else if (sourceType === 'empty-pallet-stock') {
      if (!sourceSlot) return;
    } else if (sourceType === 'vehicle-slot') {
      if (!sourceVehicleInstanceId || !sourceVehiclePalletSlotNo || !sourceLayerEntry) return;
    } else if (!sourceVehicleInstanceId || !sourceBoxCard) {
      return;
    }
    const selectedTransportRow = facilityStorageSelectedTransportRow;
    if (targetType === 'vehicle-cargo') {
      window.alert('수확물은 차량 일반 적재함이 아니라 차량 수확물 적재칸에 적재해 주세요.');
      return;
    }
    if (targetType === 'warehouse-general') {
      window.alert('수확물은 일반저장에 보관하지 않습니다. 팔레트 적재나 바닥 적재 저장공간을 선택해 주세요.');
      return;
    }
    const movingToGeneralStorage = targetType === 'warehouse-general';
    const movingToFloorStorage = (targetType === 'warehouse-empty' || targetType === 'warehouse-floor-harvest') && unloadMode === 'individual';
    const movingToVehicleCargo = false;
    const movingToVehicleFloorStorage = targetType === 'vehicle-slot' && Boolean(target?.isVehicleFloorTarget) && unloadMode === 'individual';
    const movingToWarehousePalletTarget = unloadMode !== 'individual'
      && (targetType === 'warehouse-empty' || targetType === 'warehouse-stack-top');
    const movingWholeHarvestPalletToVehicleSlot = unloadMode !== 'individual'
      && targetType === 'vehicle-slot'
      && !Boolean(target?.isVehicleFloorTarget)
      && sourceIsHarvest
      && Boolean(facilityStorageSelectedTransportCanStackPallet);
    const targetRequestsDockPalletSeed = targetType === 'vehicle-slot'
      && Boolean(target?.hasLoadedEmptyPallet)
      && !targetActuallyHasHarvestPallet
      && !targetActuallyHasFloorHarvest;
    const movingToEmptyPallet = targetType === 'warehouse-empty-pallet'
      || (targetType === 'vehicle-slot' && (targetActuallyHasLoadedEmptyPallet || targetRequestsDockPalletSeed));
    const movingToHarvestPallet = targetType === 'warehouse-harvest-pallet'
      || (targetType === 'vehicle-slot' && targetActuallyHasHarvestPallet);
    const movingToPalletUnloadTarget = !movingToVehicleFloorStorage && (movingToEmptyPallet || movingToHarvestPallet);
    if (!selectedTransportRow) {
      window.alert('운반기구를 먼저 선택해 주세요.');
      return;
    }
    if ((movingToGeneralStorage || movingToVehicleCargo || movingToFloorStorage || movingToVehicleFloorStorage) && unloadMode !== 'individual') {
      window.alert('일반저장이나 바닥 적재칸으로 옮기려면 개별 적재를 선택해 주세요.');
      return;
    }
    if (
      unloadMode !== 'individual'
      && !movingToGeneralStorage
      && !movingToVehicleCargo
      && !movingToFloorStorage
      && !movingToVehicleFloorStorage
      && !movingToWarehousePalletTarget
      && !movingWholeHarvestPalletToVehicleSlot
      && !movingToPalletUnloadTarget
    ) {
      return;
    }
    if (movingToPalletUnloadTarget && unloadMode !== 'individual') {
      window.alert('빈 팔레트에 옮겨 담으려면 개별 적재를 선택해 주세요.');
      return;
    }
    const sourceComesFromVehicleSlot = sourceType === 'vehicle-slot' && !sourceIsSelectedTransportDock;
    if (!movingToGeneralStorage && !movingToVehicleCargo && !movingToFloorStorage && !movingToVehicleFloorStorage && !movingToWarehousePalletTarget && !movingWholeHarvestPalletToVehicleSlot && !movingToPalletUnloadTarget && sourceComesFromVehicleSlot && !facilityStorageSelectedTransportCanStackPallet) {
      window.alert('차량에서 수확물이 담긴 파레트를 내리려면 지게차가 필요합니다.');
      return;
    }
    const selectedTransportLabel = selectedTransportRow.sourceType === 'machine'
      ? machineDisplayNameWithRentTag(selectedTransportRow.machine)
      : String(selectedTransportRow?.toolName || selectedTransportRow?.toolMeta?.name || '팔레트 잭');
    const sourcePalletMeta = harvestPalletLoadMeta(sourceLayerEntry);
    const legacySourceBoxCard = unloadMode === 'individual' ? (picker?.sourceBoxCard || null) : null;
    const pickerSelectedSourceCards = unloadMode === 'individual' && Array.isArray(picker?.selectedSourceCards)
      ? picker.selectedSourceCards.filter(Boolean)
      : [];
    const normalizedSelectedSourceCardsBase = unloadMode === 'individual'
      ? (
        pickerSelectedSourceCards.length
          ? pickerSelectedSourceCards.map((card) => ({
            ...card,
            selectedCount: String(card?.cardKind || '') === 'partial'
              ? Math.max(0, Math.min(1, Math.floor(Number(card?.selectedCount) || 0)))
              : Math.max(
                0,
                Math.min(
                  Math.max(0, Math.floor(Number(card?.boxCount) || 0)),
                  Math.floor(Number(card?.selectedCount) || 0)
                )
              )
          })).filter((card) => (
            Math.max(0, Math.floor(Number(card?.selectedCount) || 0)) > 0
          ))
          : (
            legacySourceBoxCard && Math.max(0, Math.floor(Number(picker?.selectedBoxCount) || 0)) > 0
              ? [{
                ...legacySourceBoxCard,
                selectedCount: String(legacySourceBoxCard?.cardKind || '') === 'partial'
                  ? 1
                  : Math.max(
                    1,
                    Math.min(
                      Math.max(
                        1,
                        Math.floor(
                          Number(legacySourceBoxCard?.boxCount)
                          || (Array.isArray(legacySourceBoxCard?.sourceBoxUnitNos) ? legacySourceBoxCard.sourceBoxUnitNos.length : 0)
                          || (Array.isArray(legacySourceBoxCard?.sourceBatchIds) ? legacySourceBoxCard.sourceBatchIds.length : 0)
                          || 1
                        )
                      ),
                      Math.floor(
                        Number(picker?.selectedBoxCount)
                        || Math.max(
                          1,
                          Math.floor(
                            Number(legacySourceBoxCard?.boxCount)
                            || (Array.isArray(legacySourceBoxCard?.sourceBoxUnitNos) ? legacySourceBoxCard.sourceBoxUnitNos.length : 0)
                            || (Array.isArray(legacySourceBoxCard?.sourceBatchIds) ? legacySourceBoxCard.sourceBatchIds.length : 0)
                            || 1
                          )
                        )
                      )
                    )
                  )
              }]
              : []
          )
      )
      : [];
    const normalizeTargetDockSlotNo = (slotNoRaw) => {
      const capacity = movingToPalletUnloadTarget
        ? safeHarvestBoxesPerPallet
        : (movingToVehicleFloorStorage ? safeVehicleSlotFloorBoxes : safeHarvestBoxesPerPallet);
      const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
      return slotNo >= 1 && slotNo <= capacity ? slotNo : 0;
    };
    const normalizedSelectedSourceCards = (() => {
      if (
        unloadMode !== 'individual'
        || !movingToPalletUnloadTarget
        || !targetVehicleInstanceId
        || !targetVehiclePalletSlotNo
        || !normalizedSelectedSourceCardsBase.length
      ) {
        return normalizedSelectedSourceCardsBase;
      }
      const occupiedTargetSlotNos = (game?.storage || []).reduce((acc, batch) => {
        if (!batch?.palletized) return acc;
        if (String(batch?.storageVehicleInstanceId || '') !== targetVehicleInstanceId) return acc;
        if (Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0)) !== targetVehiclePalletSlotNo) return acc;
        if (Math.max(1, Math.min(2, Math.floor(Number(batch?.storageVehiclePalletLayer || 1) || 1))) !== 1) return acc;
        const visualSlotNo = normalizeTargetDockSlotNo(batch?.storageBoxVisualSlotNo);
        if (visualSlotNo > 0) acc.add(visualSlotNo);
        return acc;
      }, new Set());
      const claimedTargetSlotNos = new Set();
      return normalizedSelectedSourceCardsBase.map((card) => {
        const selectedCount = String(card?.cardKind || '') === 'partial'
          ? Math.max(0, Math.min(1, Math.floor(Number(card?.selectedCount) || 0)))
          : Math.max(0, Math.floor(Number(card?.selectedCount) || 0));
        if (selectedCount <= 0) return card;
        const explicitTargetDockSlotNos = Array.isArray(card?.targetDockSlotNos)
          ? card.targetDockSlotNos
              .map((value) => normalizeTargetDockSlotNo(value))
              .filter((value) => value > 0)
          : [];
        const normalizedCardTargetDockSlotNo = normalizeTargetDockSlotNo(card?.targetDockSlotNo);
        const sourceVisualSlotNos = Array.isArray(card?.sourceVisualSlotNos)
          ? card.sourceVisualSlotNos
              .map((value) => normalizeTargetDockSlotNo(value))
              .filter((value) => value > 0)
          : [];
        const repairedTargetDockSlotNos = Array.from({ length: selectedCount }, (_, index) => {
          const preferredSlotNo = explicitTargetDockSlotNos[index]
            || (index === 0 ? normalizedCardTargetDockSlotNo : 0)
            || sourceVisualSlotNos[index]
            || (index === 0 ? sourceVisualSlotNos[0] : 0);
          if (
            preferredSlotNo > 0
            && !occupiedTargetSlotNos.has(preferredSlotNo)
            && !claimedTargetSlotNos.has(preferredSlotNo)
          ) {
            claimedTargetSlotNos.add(preferredSlotNo);
            return preferredSlotNo;
          }
          for (let slotNo = 1; slotNo <= safeHarvestBoxesPerPallet; slotNo += 1) {
            if (occupiedTargetSlotNos.has(slotNo) || claimedTargetSlotNos.has(slotNo)) continue;
            claimedTargetSlotNos.add(slotNo);
            return slotNo;
          }
          return preferredSlotNo > 0 ? preferredSlotNo : 0;
        });
        return {
          ...card,
          targetDockSlotNo: repairedTargetDockSlotNos[0] || normalizedCardTargetDockSlotNo || 0,
          targetDockSlotNos: repairedTargetDockSlotNos.filter((value) => value > 0),
        };
      });
    })();
    const sourceBoxCard = normalizedSelectedSourceCards.length === 1
      ? normalizedSelectedSourceCards[0]
      : null;
    const matchSourceBatchEntriesForCard = (card) => (game?.storage || [])
      .map((batch, index) => ({ batch, index }))
      .filter(({ batch }) => {
        const batchFacilityKey = String(batch?.storageFacilityKey || '');
        const batchSlotNo = Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0));
        const batchVehicleInstanceId = String(batch?.storageVehicleInstanceId || '');
        const batchVehicleSlotNo = Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0));
        const batchLayerNo = Math.max(
          1,
          Math.min(
            2,
            Math.floor(Number(
              sourceType === 'vehicle-slot'
                ? (batch?.storageVehiclePalletLayer || 1)
                : (batch?.storagePalletLayer || 1)
            ) || 1)
          )
        );
        const sourceMatched = sourceType === 'vehicle-slot'
          ? (
            sourceIsFloorStored
              ? (!batch?.palletized && batchVehicleInstanceId === sourceVehicleInstanceId && batchVehicleSlotNo === sourceVehiclePalletSlotNo)
              : (batch?.palletized && batchVehicleInstanceId === sourceVehicleInstanceId && batchVehicleSlotNo === sourceVehiclePalletSlotNo && batchLayerNo === sourceLayerNo)
          )
          : sourceType === 'vehicle-cargo'
            ? (!batch?.palletized && batchVehicleInstanceId === sourceVehicleInstanceId && batchVehicleSlotNo <= 0)
            : sourceIsFloorStored
              ? (!batch?.palletized && batchFacilityKey === sourceFacilityKey && batchSlotNo === sourceSlotNo)
              : (batch?.palletized && batchFacilityKey === sourceFacilityKey && batchSlotNo === sourceSlotNo && batchLayerNo === sourceLayerNo);
        if (!sourceMatched) return false;
        if (sourceType === 'vehicle-cargo') {
          const cardSourceBatchIds = Array.isArray(card?.sourceBatchIds)
            ? card.sourceBatchIds.map((value) => String(value || '')).filter(Boolean)
            : [];
          if (cardSourceBatchIds.length) return cardSourceBatchIds.includes(String(batch?.id || ''));
          const cardSourceBoxUnitNos = Array.isArray(card?.sourceBoxUnitNos)
            ? card.sourceBoxUnitNos.map((value) => Math.max(0, Math.floor(Number(value) || 0))).filter((value) => value > 0)
            : [];
          return cardSourceBoxUnitNos.length
            ? cardSourceBoxUnitNos.includes(Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0)))
            : false;
        }
        if (sourceIsFloorStored) {
          const cardSourceBatchIds = Array.isArray(card?.sourceBatchIds)
            ? card.sourceBatchIds.map((value) => String(value || '')).filter(Boolean)
            : [];
          if (cardSourceBatchIds.length) return cardSourceBatchIds.includes(String(batch?.id || ''));
          const cardSourceBatchId = String(card?.sourceBatchId || '');
          if (cardSourceBatchId) return String(batch?.id || '') === cardSourceBatchId;
          const cardSourceBoxUnitNos = Array.isArray(card?.sourceBoxUnitNos)
            ? card.sourceBoxUnitNos.map((value) => Math.max(0, Math.floor(Number(value) || 0))).filter((value) => value > 0)
            : [];
          if (cardSourceBoxUnitNos.length) {
            return cardSourceBoxUnitNos.includes(Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0)));
          }
          const cardSourceBoxUnitNo = Math.max(0, Math.floor(Number(card?.sourceBoxUnitNo) || 0));
          if (cardSourceBoxUnitNo > 0) {
            return Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0)) === cardSourceBoxUnitNo;
          }
          return !batch?.palletized;
        }
        return isMatchingHarvestPalletCardBatch(batch, card);
      });
    const selectedSourceCardResolutions = unloadMode === 'individual'
      ? normalizedSelectedSourceCards.map((card) => {
        const matchingEntries = matchSourceBatchEntriesForCard(card);
        const selectedCount = String(card?.cardKind || '') === 'partial'
          ? Math.max(0, Math.min(1, Math.floor(Number(card?.selectedCount) || 0)))
          : Math.max(
            1,
            Math.min(
              Math.max(
                1,
                Math.floor(
                  Number(card?.boxCount)
                  || (Array.isArray(card?.sourceBoxUnitNos) ? card.sourceBoxUnitNos.length : 0)
                  || (Array.isArray(card?.sourceBatchIds) ? card.sourceBatchIds.length : 0)
                  || 1
                )
              ),
              Math.floor(Number(card?.selectedCount) || 1)
            )
          );
        const selectedKg = String(card?.cardKind || '') === 'partial'
          ? Math.max(0, Number(card?.qtyKg) || 0)
          : Math.round((((Math.max(0, Number(card?.qtyKg) || 0) / Math.max(1, Math.floor(Number(card?.boxCount) || 1))) * selectedCount) + Number.EPSILON) * 10) / 10;
        const sourceBatchId = String(card?.sourceBatchId || '');
        const sourceBatchIds = Array.isArray(card?.sourceBatchIds)
          ? card.sourceBatchIds.map((value) => String(value || '')).filter(Boolean)
          : [];
        const sourceBoxUnitNo = Math.max(0, Math.floor(Number(card?.sourceBoxUnitNo) || 0));
        const sourceBoxUnitNos = Array.isArray(card?.sourceBoxUnitNos)
          ? card.sourceBoxUnitNos.map((value) => Math.max(0, Math.floor(Number(value) || 0))).filter((value) => value > 0)
          : [];
        const sourceVisualSlotNos = Array.isArray(card?.sourceVisualSlotNos)
          ? card.sourceVisualSlotNos.map((value) => Math.max(0, Math.floor(Number(value) || 0))).filter((value) => value > 0)
          : [];
        const targetDockSlotNos = Array.isArray(card?.targetDockSlotNos)
          ? card.targetDockSlotNos.map((value) => Math.max(0, Math.floor(Number(value) || 0))).filter((value) => value > 0)
          : [];
        let selectedEntries = [];
        if (String(card?.cardKind || '') === 'partial') {
          const entry = matchingEntries[0] || null;
          if (entry) {
            selectedEntries = [{
              ...entry,
              sourceVisualSlotNo: sourceVisualSlotNos[0] || 0,
              targetDockSlotNo: targetDockSlotNos[0] || Math.max(0, Math.floor(Number(card?.targetDockSlotNo) || 0)),
              moveQtyKg: Math.max(0, Number(entry?.batch?.qty) || 0),
              moveCardKind: 'partial'
            }];
          }
        } else if (sourceBoxUnitNos.length || sourceBatchIds.length || sourceVisualSlotNos.length) {
          const usedMatchedEntryKeys = new Set();
          const requestedEntryCount = Math.max(
            0,
            Math.min(
              selectedCount,
              Math.max(sourceBoxUnitNos.length, sourceBatchIds.length, sourceVisualSlotNos.length)
            )
          );
          const takeMatchingEntry = (predicate) => {
            const matchedEntry = matchingEntries.find((entry) => {
              const entryKey = `${entry.index}:${String(entry?.batch?.id || `batch-${entry.index}`)}`;
              if (usedMatchedEntryKeys.has(entryKey)) return false;
              return predicate(entry, entryKey);
            }) || null;
            if (!matchedEntry) return null;
            usedMatchedEntryKeys.add(`${matchedEntry.index}:${String(matchedEntry?.batch?.id || `batch-${matchedEntry.index}`)}`);
            return matchedEntry;
          };
          for (let requestIndex = 0; requestIndex < requestedEntryCount; requestIndex += 1) {
            const requestedUnitNo = sourceBoxUnitNos[requestIndex] || 0;
            const requestedBatchId = String(sourceBatchIds[requestIndex] || '').trim();
            const requestedVisualSlotNo = sourceVisualSlotNos[requestIndex] || 0;
            const matchedEntry = (
              (requestedUnitNo > 0
                ? takeMatchingEntry(({ batch }) => (
                    Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0)) === requestedUnitNo
                  ))
                : null)
              || (requestedBatchId
                ? takeMatchingEntry(({ batch }) => String(batch?.id || '') === requestedBatchId)
                : null)
              || (requestedVisualSlotNo > 0
                ? takeMatchingEntry(({ batch }) => (
                    Math.max(0, Math.floor(Number(batch?.storageBoxVisualSlotNo) || 0)) === requestedVisualSlotNo
                  ))
                : null)
            );
            if (!matchedEntry) continue;
            selectedEntries.push({
              ...matchedEntry,
              sourceVisualSlotNo: requestedVisualSlotNo || Math.max(0, Math.floor(Number(matchedEntry?.batch?.storageBoxVisualSlotNo) || 0)),
              targetDockSlotNo: targetDockSlotNos[requestIndex] || Math.max(0, Math.floor(Number(card?.targetDockSlotNo) || 0)),
              moveQtyKg: Math.max(0, Number(matchedEntry?.batch?.qty) || 0),
              moveCardKind: 'full'
            });
          }
        } else {
          const targetedEntry = matchingEntries.find(({ batch }) => (
            (sourceBatchId && String(batch?.id || '') === sourceBatchId)
            || (sourceBoxUnitNo > 0 && Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0)) === sourceBoxUnitNo)
          )) || null;
          if (targetedEntry) {
            const batchQtyKg = Math.max(0, Number(targetedEntry?.batch?.qty) || 0);
            const moveQtyKg = Math.min(batchQtyKg, Math.max(0, Number(selectedKg) || 0));
            selectedEntries = moveQtyKg > 0 ? [{
              ...targetedEntry,
              sourceVisualSlotNo: sourceVisualSlotNos[0] || 0,
              targetDockSlotNo: targetDockSlotNos[0] || Math.max(0, Math.floor(Number(card?.targetDockSlotNo) || 0)),
              moveQtyKg,
              moveCardKind: String(card?.cardKind || '')
            }] : [];
        } else if (
            matchingEntries.length === 1
            && selectedCount > 0
            && Math.max(0, Number(selectedKg) || 0) > 0
          ) {
            const soleEntry = matchingEntries[0];
            const batchQtyKg = Math.max(0, Number(soleEntry?.batch?.qty) || 0);
            const resolvedCardKind = String(card?.cardKind || '');
            const requestedMoveQtyKg = resolvedCardKind === 'partial'
              ? Math.max(0, Number(selectedKg) || 0)
              : Math.max(
                  0,
                  Math.min(
                    batchQtyKg,
                    selectedCount * safeHarvestBoxCapacityKg
                  )
                );
            const moveQtyKg = Math.min(batchQtyKg, requestedMoveQtyKg);
            selectedEntries = moveQtyKg > 0 ? [{
              ...soleEntry,
              sourceVisualSlotNo: sourceVisualSlotNos[0] || 0,
              targetDockSlotNo: targetDockSlotNos[0] || Math.max(0, Math.floor(Number(card?.targetDockSlotNo) || 0)),
              moveQtyKg,
              moveCardKind: resolvedCardKind
            }] : [];
          }
        }
        const explicitSourceEntryCount = sourceBoxUnitNos.length || sourceBatchIds.length || 0;
        const expectedCount = String(card?.cardKind || '') === 'partial'
          ? 1
          : (
            explicitSourceEntryCount > 0
              ? Math.min(selectedCount, explicitSourceEntryCount)
              : (
                sourceBatchId || sourceBoxUnitNo > 0
                  ? 1
                  : selectedCount
              )
          );
        return {
          card,
          selectedCount,
          selectedKg,
          expectedCount,
          matchingEntries,
          selectedEntries
        };
      })
      : [];
    const selectedSourceBatchEntries = selectedSourceCardResolutions.flatMap((resolution) => resolution.selectedEntries);
    const requiresExplicitIndividualDockTargetSlots = unloadMode === 'individual'
      && movingToPalletUnloadTarget
      && targetType === 'vehicle-slot';
    const selectedIndividualDockTargetSlotNos = requiresExplicitIndividualDockTargetSlots
      ? selectedSourceBatchEntries
          .map((entry) => Math.max(0, Math.floor(Number(entry?.targetDockSlotNo) || 0)))
          .filter((value) => value > 0)
      : [];
    const selectedSourceBatchKeySetForDockCheck = new Set(
      selectedSourceBatchEntries.map((entry) => `${entry.index}:${String(entry?.batch?.id || `batch-${entry.index}`)}`)
    );
    const hasMissingIndividualDockTargetSlot = requiresExplicitIndividualDockTargetSlots
      && selectedSourceBatchEntries.some((entry) => Math.max(0, Math.floor(Number(entry?.targetDockSlotNo) || 0)) <= 0);
    const hasDuplicateIndividualDockTargetSlot = requiresExplicitIndividualDockTargetSlots
      && new Set(selectedIndividualDockTargetSlotNos).size !== selectedIndividualDockTargetSlotNos.length;
    const selectedSourceMoveKg = selectedSourceBatchEntries.reduce(
      (sum, entry) => sum + Math.max(0, Number(entry?.moveQtyKg ?? entry?.batch?.qty) || 0),
      0
    );
    const selectedSourceMoveBoxCount = selectedSourceCardResolutions.reduce(
      (sum, resolution) => sum + Math.max(0, Number(resolution?.selectedCount) || 0),
      0
    );
    const selectedSourceVisualSlotNosForMove = unloadMode === 'individual'
      ? selectedSourceBatchEntries
          .map((entry) => Math.max(0, Math.floor(Number(entry?.sourceVisualSlotNo) || 0)))
          .filter((value) => value > 0)
      : [];
    let currentTargetBoxCount = 0;
    let targetLoadAnimVisualSlotNos = [];
    const sourceMatchingBatchEntries = [];
    const sourceCardSelectedBoxCount = 0;
    const sourceBoxCardSelectedKg = 0;
    const palletWeightKg = Math.max(
      0,
      Number(itemMetaByKey?.plasticPallet1100?.weightKg) || facilityStorageDefaultPalletWeightKg
    );
    const loadBoxWeightKg = Math.max(
      0,
      Number(itemMetaByKey?.[String(sourceLayerEntry?.loadBoxKey || '')]?.weightKg) || facilityStorageDefaultLoadBoxWeightKg
    );
    const partialBoxCount = sourcePalletMeta.remainderKg > 0 ? 1 : 0;
    const totalLoadBoxCount = Math.max(0, Number(sourcePalletMeta.fullBoxes) || 0) + partialBoxCount;
    const sourcePalletGrossWeightKg = roundLabor(
      sourceQtyKg + palletWeightKg + (totalLoadBoxCount * loadBoxWeightKg)
    );
    const actualMoveKg = unloadMode === 'individual' && normalizedSelectedSourceCards.length
      ? selectedSourceMoveKg
      : sourceQtyKg;
    const targetAvailableKgRaw = Number(target?.availableKg);
    const targetHasAvailableKg = Number.isFinite(targetAvailableKgRaw);
    const targetAvailableKg = Math.max(0, targetAvailableKgRaw);
    const activeFacilityRemainingKg = Math.max(
      0,
      Math.max(0, Number(activeFacilityStorageCapacityKg) || 0)
        - Math.max(0, Number(activeFacilityStorageUsedKg) || 0)
    );
    const sourceStillHasHarvestAfterMove = unloadMode === 'individual'
      && !sourceIsLoadedEmptyPallet
      && sourceQtyKg > 0
      && actualMoveKg + 0.001 < sourceQtyKg;
    const returningWholePalletToOriginalWarehouseSlot = Boolean(
      facilityStorageTransportDockPreviewSource
      && unloadMode === 'pallet'
      && sourceType === 'warehouse-slot'
      && targetType === 'warehouse-empty'
      && sourceFacilityKey === targetFacilityKey
      && sourceSlotNo === nextTargetSlotNo
    );
    if (targetType === 'warehouse-empty' || targetType === 'warehouse-floor-harvest' || targetType === 'warehouse-stack-top' || targetType === 'warehouse-empty-pallet' || targetType === 'warehouse-harvest-pallet') {
      if (!targetFacilityKey || !nextTargetSlotNo) return;
      if (
        sourceType === 'warehouse-slot'
        && sourceFacilityKey === targetFacilityKey
        && sourceSlotNo === nextTargetSlotNo
        && !returningWholePalletToOriginalWarehouseSlot
      ) return;
    } else if (targetType === 'warehouse-general') {
      if (!targetFacilityKey) return;
    } else if (targetType === 'vehicle-cargo') {
      window.alert('수확물은 차량 일반 적재함이 아니라 차량 수확물 적재칸에 적재해 주세요.');
      return;
    } else if (targetType === 'vehicle-slot') {
      if (!targetVehicleInstanceId || !targetVehiclePalletSlotNo) return;
      const movingWholeEmptyPalletToVehicleSlot = unloadMode === 'pallet' && !sourceIsHarvest;
      if (
        !movingToVehicleFloorStorage
        && !movingToEmptyPallet
        && !movingWholeEmptyPalletToVehicleSlot
        && !(unloadMode === 'individual' && movingToHarvestPallet)
        && (!facilityStorageSelectedTransportCanStackPallet || !sourceIsHarvest)
      ) {
        return;
      }
    } else {
      return;
    }
    if (false && unloadMode === 'individual' && normalizedSelectedSourceCards.length) {
      const explicitSourceBoxUnitNos = Array.isArray(sourceBoxCard?.sourceBoxUnitNos)
        ? sourceBoxCard.sourceBoxUnitNos.map((value) => Math.max(0, Math.floor(Number(value) || 0))).filter((value) => value > 0)
        : [];
      const explicitSourceBatchIds = Array.isArray(sourceBoxCard?.sourceBatchIds)
        ? sourceBoxCard.sourceBatchIds.map((value) => String(value || '')).filter(Boolean)
        : [];
      const explicitSourceEntryCount = explicitSourceBoxUnitNos.length || explicitSourceBatchIds.length || 0;
      const expectedBatchCount = String(sourceBoxCard?.cardKind || '') === 'partial'
        ? 1
        : (
          explicitSourceEntryCount > 0
            ? Math.min(sourceCardSelectedBoxCount, explicitSourceEntryCount)
            : (
              String(sourceBoxCard?.sourceBatchId || '') || Math.max(0, Math.floor(Number(sourceBoxCard?.sourceBoxUnitNo) || 0)) > 0
                ? 1
                : sourceCardSelectedBoxCount
            )
        );
      if (sourceMatchingBatchEntries.length < expectedBatchCount || selectedSourceBatchEntries.length < expectedBatchCount) {
        window.alert('선택한 상자 묶음 보관 상태가 바뀌어서 다시 선택해야 합니다.');
        return;
      }
      if (selectedSourceMoveKg <= 0) {
        window.alert('옮길 상자 무게를 확인할 수 없습니다.');
        return;
      }
      if (String(sourceBoxCard?.cardKind || '') !== 'partial' && selectedSourceMoveKg + 0.001 < sourceBoxCardSelectedKg) {
        window.alert('선택한 박스 수만큼 옮길 수 없어 다시 선택해야 합니다.');
        return;
      }
    }
    if (false && unloadMode === 'individual' && !sourceBoxCard) {
      window.alert('개별 적재하려면 팔레트 상세에서 옮길 상자를 먼저 선택해 주세요.');
      return;
    }
    if (hasMissingIndividualDockTargetSlot) {
      window.alert('개별 적재 대상 슬롯을 확정하지 못해 다시 선택해야 합니다.');
      return;
    }
    if (hasDuplicateIndividualDockTargetSlot) {
      window.alert('개별 적재 대상 슬롯이 겹쳐 다시 선택해야 합니다.');
      return;
    }
    if (unloadMode === 'individual' && normalizedSelectedSourceCards.length) {
      const invalidResolution = selectedSourceCardResolutions.find((resolution) => {
        if ((resolution?.matchingEntries?.length || 0) < Math.max(0, Number(resolution?.expectedCount) || 0)) return true;
        if ((resolution?.selectedEntries?.length || 0) < Math.max(0, Number(resolution?.expectedCount) || 0)) return true;
        if (Math.max(0, Number(resolution?.selectedKg) || 0) <= 0) return true;
        return String(resolution?.card?.cardKind || '') !== 'partial'
          && resolution.selectedEntries.reduce((sum, entry) => sum + Math.max(0, Number(entry?.moveQtyKg ?? entry?.batch?.qty) || 0), 0) + 0.001 < Math.max(0, Number(resolution?.selectedKg) || 0);
      }) || null;
      if (invalidResolution) {
        window.alert('선택한 상자 묶음의 보관 상태가 바뀌어 다시 선택해야 합니다.');
        return;
      }
      if (selectedSourceMoveKg <= 0 || selectedSourceMoveBoxCount <= 0) {
        window.alert('옮길 수확물 상자 수량을 먼저 선택해 주세요.');
        return;
      }
    }
    if (unloadMode === 'individual' && !normalizedSelectedSourceCards.length) {
      setFacilityStorageHarvestMovePicker?.((prev) => (
        prev
          ? {
            ...prev,
            pendingTarget: target || null,
          }
          : prev
      ));
      return;
    }
    const targetIsWorkbenchCargoSlot = Boolean(target?.isWorkbenchCargoSlot);
    const targetIsSortingCargoSlot = Boolean(target?.isSortingCargoSlot);
    const targetSortingEquipmentKey = String(target?.equipmentStorageKey || target?.sortingEquipmentKey || '');
    const targetSortingPositionKey = String(target?.positionKey || target?.cargoSlotKey || '');
    const targetWorkbenchFacilityKey = String(target?.facilityKey || targetFacilityKey || '');
    const targetWorkbenchSlotKey = String(target?.workbenchSlotKey || '');
    const targetWorkbenchCargoSlotKey = String(target?.cargoSlotKey || '');
    if (movingToPalletUnloadTarget || movingToFloorStorage || movingToVehicleFloorStorage) {
      const targetBoxCapacity = movingToVehicleFloorStorage
        ? safeVehicleSlotFloorBoxes
        : Math.max(1, Math.floor(Number(target?.maxBoxes ?? target?.capacityBoxes) || safeHarvestBoxesPerPallet));
      const targetBoxLimitSubjectForMove = movingToVehicleFloorStorage
        ? '차량 바닥 적재칸 한 칸'
        : (targetType === 'vehicle-slot' ? '운반기구 적재칸 한 칸' : targetBoxLimitSubject);
      currentTargetBoxCount = countHarvestBoxesInTargetLayer({
        targetType,
        facilityKey: targetFacilityKey,
        slotNo: targetType === 'vehicle-slot' ? targetVehiclePalletSlotNo : nextTargetSlotNo,
        vehicleInstanceId: targetVehicleInstanceId,
        vehicleFloorTarget: movingToVehicleFloorStorage,
        dedicatedKind: targetIsSortingCargoSlot ? 'sorting' : (targetIsWorkbenchCargoSlot ? 'workbench' : ''),
        sortingEquipmentKey: targetSortingEquipmentKey,
        sortingPositionKey: targetSortingPositionKey,
        workbenchSlotKey: targetWorkbenchSlotKey,
        workbenchCargoSlotKey: targetWorkbenchCargoSlotKey,
      });
      const liveTargetAvailableBoxCount = Math.max(0, targetBoxCapacity - currentTargetBoxCount);
      const incomingBoxCount = unloadMode === 'individual'
        ? selectedSourceMoveBoxCount
        : inferHarvestBoxCountFromQty(actualMoveKg);
      if (currentTargetBoxCount + incomingBoxCount > targetBoxCapacity) {
        clearBlockedIndividualMoveState();
        window.alert(
          currentTargetBoxCount >= targetBoxCapacity
            ? '적재할 곳이 다 찼습니다.'
            : `${targetBoxLimitSubjectForMove}에는 최대 ${targetBoxCapacity.toLocaleString()}박스까지만 적재할 수 있습니다.`
        );
        return;
      }
      if (incomingBoxCount > liveTargetAvailableBoxCount) {
        clearBlockedIndividualMoveState();
        window.alert(liveTargetAvailableBoxCount <= 0
          ? '적재할 곳이 다 찼습니다.'
          : `선택한 저장공간에는 ${liveTargetAvailableBoxCount.toLocaleString()}박스까지만 추가 적재할 수 있습니다.`);
        return;
      }
      targetLoadAnimVisualSlotNos = unloadMode === 'individual'
        ? (
            requiresExplicitIndividualDockTargetSlots
              ? selectedIndividualDockTargetSlotNos.slice(0, selectedSourceMoveBoxCount)
              : (
                  selectedSourceVisualSlotNosForMove.length >= selectedSourceMoveBoxCount
                    ? selectedSourceVisualSlotNosForMove.slice(0, selectedSourceMoveBoxCount)
                    : Array.from(
                        { length: selectedSourceMoveBoxCount },
                        (_, index) => currentTargetBoxCount + index + 1
                      )
                )
          ).filter((value) => value > 0)
        : [];
      if (
        targetType === 'vehicle-slot'
        && unloadMode !== 'individual'
        && targetHasAvailableKg
        && actualMoveKg > targetAvailableKg + 0.001
      ) {
        clearBlockedIndividualMoveState();
        window.alert('차량 적재한도를 초과합니다.');
        return;
      }
      if (
        targetType !== 'vehicle-slot'
        && targetFacilityKey
        && targetFacilityKey === String(activeFacilityStorageKey || '')
        && Math.max(0, Number(activeFacilityStorageCapacityKg) || 0) > 0
        && actualMoveKg > activeFacilityRemainingKg + 0.001
      ) {
        clearBlockedIndividualMoveState();
        window.alert('저장공간 용량이 부족합니다.');
        return;
      }
    }
    const targetIsAuxCargoSlot = targetIsWorkbenchCargoSlot || targetIsSortingCargoSlot;
    const targetDisplayLabel = String(target?.displayLabel || '').trim();
    const targetLabel = targetIsAuxCargoSlot && targetDisplayLabel
      ? targetDisplayLabel
      : targetType === 'vehicle-slot'
      ? (() => {
        const targetVehicle = resolveMachineInstanceById(targetVehicleInstanceId);
        return `${targetVehicle ? machineDisplayNameWithRentTag(targetVehicle) : '차량'} 적재함 P${targetVehiclePalletSlotNo}`;
      })()
      : targetType === 'vehicle-cargo'
        ? (() => {
          const targetVehicle = resolveMachineInstanceById(targetVehicleInstanceId);
          return `${targetVehicle ? machineDisplayNameWithRentTag(targetVehicle) : '차량'} 일반 적재함`;
        })()
      : targetType === 'warehouse-general'
        ? `${decodeUnicodeEscapes(stripColdStorageIconName(facilityMap?.[targetFacilityKey]?.name || targetFacilityKey || '창고'))} 일반저장`
      : movingToFloorStorage
        ? `${facilityStorageModal?.facilityName || '창고'} P${nextTargetSlotNo} 바닥 적재`
      : targetType === 'warehouse-empty-pallet'
        ? `${facilityStorageModal?.facilityName || '창고'} P${nextTargetSlotNo} 빈 팔레트`
      : `${facilityStorageModal?.facilityName || '창고'} P${nextTargetSlotNo}${targetType === 'warehouse-stack-top' ? ' 상단' : ''}`;
    const generalTargetRowKey = targetType === 'warehouse-general'
      ? harvestGeneralDisplayKeyOf({
        facilityKey: targetFacilityKey,
        loadBoxKey: sourceBoxCard?.imageItemKey || sourceLayerEntry?.loadBoxKey,
        qualityLabel: sourceBoxCard?.qualityLabel,
        cropLabel: sourceBoxCard?.cropLabel,
        stemStatusKey: sourceBoxCard?.stemStatusKey,
        sourceIsFullBox: String(sourceBoxCard?.cardKind || '') === 'full',
        sourceFillStep: sourceBoxCard?.sourceFillStep,
        qtyKg: unloadMode === 'individual' ? actualMoveKg : sourceQtyKg
      })
      : '';
    const moveLogText = `${facilityStorageModal?.facilityName || '창고'} 수확물이동: ${selectedTransportLabel} / ${sourceIsHarvest ? '수확 팔레트' : '빈 팔레트'} ${sourcePalletGrossWeightKg.toLocaleString()}kg → ${targetLabel}`;
    const sourceLayerMemo = sourceType === 'warehouse-slot'
      ? String(sourceLayerKey === 'top' ? sourceSlot?.topMemo || '' : sourceSlot?.bottomMemo || '')
      : String(sourceLayerEntry?.palletMemo || '');
    const sourceLayerMemoColor = normalizeHarvestPalletMemoColor(
      sourceType === 'warehouse-slot'
        ? (sourceLayerKey === 'top' ? sourceSlot?.topMemoColor : sourceSlot?.bottomMemoColor)
        : sourceLayerEntry?.palletMemoColor
    );
    const selectedTransportWearMap = selectedTransportRow.sourceType === 'machine'
      ? {
        [machineParkingInstanceId(
          String(selectedTransportRow?.machine?.machineKey || selectedTransportRow?.machine?.item?.key || ''),
          Math.max(1, Math.floor(Number(selectedTransportRow?.machine?.unitNo) || 1))
        )]: facilityStoragePalletMoveWear
      }
      : {
        [machineParkingInstanceId(
          String(selectedTransportRow?.toolKey || ''),
          Math.max(1, Math.floor(Number(selectedTransportRow?.unitNo) || 1))
        )]: facilityStoragePalletMoveWear
      };
    if (sourceIsHarvest) {
      setGame((prev) => {
        if (!prev) return prev;
        const fieldId = String(prev?.fields?.[Math.max(0, Number(prev?.selectedField) || 0)]?.id || '');
        const currentByField = normalizeHarvestPalletMemoByFieldMap(prev?.harvestPalletMemoByFieldId || {});
        const nextByField = { ...currentByField };
        const movedTargetVisualSlotNos = [];
        const movedTargetBatchIds = new Set();
        const collectMovedTargetVisualSlotNo = (batch) => {
          const batchId = String(batch?.id || '').trim();
          if (batchId) movedTargetBatchIds.add(batchId);
          const visualSlotNo = Math.max(0, Math.floor(Number(batch?.storageBoxVisualSlotNo) || 0));
          if (visualSlotNo > 0) movedTargetVisualSlotNos.push(visualSlotNo);
          return batch;
        };
        const movedSourceBatchMoveQtyMap = new Map(
          selectedSourceBatchEntries.map((entry) => ([
            `${entry.index}:${String(entry?.batch?.id || `batch-${entry.index}`)}`,
            Math.max(0, Number(entry?.moveQtyKg ?? entry?.batch?.qty) || 0)
          ]))
        );
        const movedSourceBatchCardKindMap = new Map(
          selectedSourceBatchEntries.map((entry) => ([
            `${entry.index}:${String(entry?.batch?.id || `batch-${entry.index}`)}`,
            String(entry?.moveCardKind || '')
          ]))
        );
        const selectedSourceBatchKeySet = new Set(
          selectedSourceBatchEntries.map((entry) => `${entry.index}:${String(entry?.batch?.id || `batch-${entry.index}`)}`)
        );
        const sourceBatchVisualSlotNosByBatchKey = new Map();
        selectedSourceCardResolutions.forEach((resolution) => {
          const sourceVisualSlotNos = Array.isArray(resolution?.card?.sourceVisualSlotNos)
            ? resolution.card.sourceVisualSlotNos.map((value) => Math.max(0, Math.floor(Number(value) || 0))).filter((value) => value > 0)
            : [];
          if (!sourceVisualSlotNos.length) return;
          if (resolution?.matchingEntries?.length !== 1) return;
          const matchedEntry = resolution.matchingEntries[0];
          const batchKey = `${matchedEntry.index}:${String(matchedEntry?.batch?.id || `batch-${matchedEntry.index}`)}`;
          sourceBatchVisualSlotNosByBatchKey.set(batchKey, sourceVisualSlotNos);
        });
        const selectedSourceVisualSlotNosByBatchKey = selectedSourceBatchEntries.reduce((acc, entry) => {
          const batchKey = `${entry.index}:${String(entry?.batch?.id || `batch-${entry.index}`)}`;
          const next = acc.get(batchKey) || [];
          const sourceVisualSlotNo = Math.max(0, Math.floor(Number(entry?.sourceVisualSlotNo) || 0));
          if (sourceVisualSlotNo > 0) next.push(sourceVisualSlotNo);
          acc.set(batchKey, next);
          return acc;
        }, new Map());
        const selectedTargetVisualSlotNosByBatchKey = selectedSourceBatchEntries.reduce((acc, entry) => {
          const batchKey = `${entry.index}:${String(entry?.batch?.id || `batch-${entry.index}`)}`;
          const next = acc.get(batchKey) || [];
          const targetVisualSlotNo = Math.max(0, Math.floor(Number(entry?.targetDockSlotNo) || 0));
          if (targetVisualSlotNo > 0) next.push(targetVisualSlotNo);
          acc.set(batchKey, next);
          return acc;
        }, new Map());
        const safeHarvestBoxCapacityKg = Math.max(1, Number(harvestBoxCapacityKg) || 20);
        const normalizeVisualSlotNo = (slotNoRaw) => {
          const slotNo = Math.floor(Number(slotNoRaw) || 0);
          const visualCapacity = movingToVehicleFloorStorage || sourceIsFloorStored
            ? safeVehicleSlotFloorBoxes
            : safeHarvestBoxesPerPallet;
          return slotNo >= 1 && slotNo <= visualCapacity ? slotNo : 0;
        };
        const isFullHarvestBoxQty = (qtyKgRaw) => Math.max(0, Number(qtyKgRaw) || 0) >= safeHarvestBoxCapacityKg - 0.001;
        let nextSplitStorageBoxUnitNo = Array.isArray(prev?.storage)
          ? prev.storage.reduce(
            (max, batch) => Math.max(max, Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0))),
            0
          )
          : 0;
        const shouldAssignTargetVisualSlots = movingToPalletUnloadTarget || movingToVehicleFloorStorage || movingToFloorStorage;
        const targetVisualSlotCapacity = movingToVehicleFloorStorage ? safeVehicleSlotFloorBoxes : safeHarvestBoxesPerPallet;
        const usedTargetVisualSlotNos = shouldAssignTargetVisualSlots
          ? (Array.isArray(prev?.storage) ? prev.storage.reduce((acc, batch, batchIndex) => {
              if (selectedSourceBatchKeySet.has(`${batchIndex}:${String(batch?.id || `batch-${batchIndex}`)}`)) return acc;
              if (targetType === 'vehicle-slot') {
                if (movingToVehicleFloorStorage) {
                  if (batch?.palletized) return acc;
                } else if (!batch?.palletized) return acc;
                if (String(batch?.storageVehicleInstanceId || '') !== targetVehicleInstanceId) return acc;
                if (Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0)) !== targetVehiclePalletSlotNo) return acc;
                if (!movingToVehicleFloorStorage && Math.max(1, Math.min(2, Math.floor(Number(batch?.storageVehiclePalletLayer) || 1))) !== 1) return acc;
              } else {
                if (movingToFloorStorage) {
                  if (batch?.palletized) return acc;
                  if (String(batch?.storageFacilityKey || '') !== targetFacilityKey) return acc;
                  if (Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0)) !== nextTargetSlotNo) return acc;
                } else {
                  if (!batch?.palletized) return acc;
                  if (!matchHarvestBatchStorageSlot(batch, {
                    facilityKey: targetFacilityKey,
                    slotNo: nextTargetSlotNo,
                    dedicatedKind: targetIsSortingCargoSlot ? 'sorting' : (targetIsWorkbenchCargoSlot ? 'workbench' : ''),
                    sortingEquipmentKey: targetSortingEquipmentKey,
                    sortingPositionKey: targetSortingPositionKey,
                    workbenchSlotKey: targetWorkbenchSlotKey,
                    workbenchCargoSlotKey: targetWorkbenchCargoSlotKey,
                  })) return acc;
                  if (Math.max(1, Math.min(2, Math.floor(Number(batch?.storagePalletLayer) || 1))) !== 1) return acc;
                }
              }
              const visualSlotNo = normalizeVisualSlotNo(batch?.storageBoxVisualSlotNo);
              if (visualSlotNo > 0) acc.add(visualSlotNo);
              return acc;
            }, new Set()) : new Set())
          : new Set();
        const claimTargetVisualSlotNo = (preferredSlotNoRaw = 0, options = {}) => {
          if (!shouldAssignTargetVisualSlots) return 0;
          const strictPreferredOnly = Boolean(options?.strictPreferredOnly);
          const preferredSlotNo = normalizeVisualSlotNo(preferredSlotNoRaw);
          if (preferredSlotNo > 0 && !usedTargetVisualSlotNos.has(preferredSlotNo)) {
            usedTargetVisualSlotNos.add(preferredSlotNo);
            return preferredSlotNo;
          }
          if (strictPreferredOnly) return 0;
          for (let slotNo = 1; slotNo <= targetVisualSlotCapacity; slotNo += 1) {
            if (usedTargetVisualSlotNos.has(slotNo)) continue;
            usedTargetVisualSlotNos.add(slotNo);
            return slotNo;
          }
          return 0;
        };
        const createSplitBatchId = (batchIdRaw) => {
          const baseId = String(batchIdRaw || 'harvest-batch');
          return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? `${baseId}-split-${crypto.randomUUID()}`
            : `${baseId}-split-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        };
        const createIndependentBoxBatch = (batch, qtyKg, options = {}) => {
          const nextQtyKg = roundKg(qtyKg, 2);
          return {
            ...batch,
            id: createSplitBatchId(batch?.id || 'harvest-batch'),
            qty: nextQtyKg,
            storageBoxUnitNo: ++nextSplitStorageBoxUnitNo,
            storageBoxVisualSlotNo: normalizeVisualSlotNo(options?.storageBoxVisualSlotNo ?? batch?.storageBoxVisualSlotNo)
          };
        };
        const applyTargetToMovedBatch = (batch, carriedPalletMemo, carriedPalletMemoColor, options = {}) => {
          const nextTargetVisualSlotNo = claimTargetVisualSlotNo(
            movingToFloorStorage || movingToPalletUnloadTarget || movingToVehicleFloorStorage
              ? (options?.preferredTargetVisualSlotNo ?? batch?.storageBoxVisualSlotNo)
              : 0,
            {
              strictPreferredOnly: requiresExplicitIndividualDockTargetSlots,
            }
          );
          const nextBatch = {
            ...batch,
            storageBoxVisualSlotNo: nextTargetVisualSlotNo
          };
          if (carriedPalletMemo) {
            nextBatch.palletMemo = carriedPalletMemo;
            nextBatch.palletMemoColor = normalizeHarvestPalletMemoColor(carriedPalletMemoColor);
          } else {
            delete nextBatch.palletMemo;
            delete nextBatch.palletMemoColor;
          }
          if (targetType === 'vehicle-slot') {
            if (movingToVehicleFloorStorage) {
              delete nextBatch.palletMemo;
              delete nextBatch.palletMemoColor;
              return {
                ...nextBatch,
                palletized: false,
                storagePalletGroupId: '',
                storageFacilityKey: '',
                storagePalletSlotNo: 0,
                storagePalletNo: 0,
                storagePalletLayer: 0,
                storageVehicleInstanceId: targetVehicleInstanceId,
                storageVehiclePalletSlotNo: targetVehiclePalletSlotNo,
                storageVehiclePalletLayer: 0,
                ...clearHarvestBatchDedicatedStorageFields()
              };
            }
            return {
              ...nextBatch,
              palletized: true,
              storagePalletGroupId: '',
              storageFacilityKey: '',
              storagePalletSlotNo: 0,
              storagePalletNo: 0,
              storagePalletLayer: 0,
              storageVehicleInstanceId: targetVehicleInstanceId,
              storageVehiclePalletSlotNo: targetVehiclePalletSlotNo,
              storageVehiclePalletLayer: 1,
              ...clearHarvestBatchDedicatedStorageFields()
            };
          }
          if (targetType === 'vehicle-cargo') {
            delete nextBatch.palletMemo;
            delete nextBatch.palletMemoColor;
            return {
              ...nextBatch,
              palletized: false,
              storagePalletGroupId: '',
              storageFacilityKey: '',
              storagePalletSlotNo: 0,
              storagePalletNo: 0,
              storagePalletLayer: 0,
              storageVehicleInstanceId: targetVehicleInstanceId,
              storageVehiclePalletSlotNo: 0,
              storageVehiclePalletLayer: 0,
              storageBoxVisualSlotNo: 0,
              ...clearHarvestBatchDedicatedStorageFields()
            };
          }
          if (targetType === 'warehouse-general' || movingToFloorStorage) {
            delete nextBatch.palletMemo;
            delete nextBatch.palletMemoColor;
            return {
              ...nextBatch,
              palletized: false,
              storagePalletGroupId: '',
              storageFacilityKey: targetFacilityKey,
              storagePalletSlotNo: movingToFloorStorage ? nextTargetSlotNo : 0,
              storagePalletNo: movingToFloorStorage ? nextTargetSlotNo : 0,
              storagePalletLayer: 0,
              storageVehicleInstanceId: '',
              storageVehiclePalletSlotNo: 0,
              storageVehiclePalletLayer: 0,
              storageBoxVisualSlotNo: movingToFloorStorage ? nextTargetVisualSlotNo : 0,
              ...clearHarvestBatchDedicatedStorageFields()
            };
          }
          return {
            ...nextBatch,
            palletized: true,
            ...buildHarvestBatchStoragePatch({
              targetType,
              targetFacilityKey,
              nextTargetSlotNo,
              targetLayerNo: 1,
              targetGroupId: `storage-repallet-${targetFacilityKey}-${nextTargetSlotNo}-1`,
              targetIsSortingCargoSlot,
              targetSortingEquipmentKey,
              targetSortingPositionKey,
              targetIsWorkbenchCargoSlot,
              targetWorkbenchFacilityKey,
              targetWorkbenchSlotKey,
              targetWorkbenchCargoSlotKey,
            }),
            storageVehiclePalletLayer: 0
          };
        };
        const clearLegacySlotMemo = (facilityKeyRaw, slotNoRaw, layerKeyRaw) => {
          if (!fieldId) return;
          const facilityKey = String(facilityKeyRaw || '');
          const slotNo = Math.max(1, Math.floor(Number(slotNoRaw) || 0));
          const layerKey = String(layerKeyRaw || '') === 'top' ? 'top' : 'bottom';
          if (!facilityKey || slotNo <= 0) return;
          const nextByFacility = { ...(nextByField[fieldId] || {}) };
          const facilityMemoMap = { ...(nextByFacility[facilityKey] || {}) };
          const currentSlotMemo = facilityMemoMap[slotNo];
          if (!currentSlotMemo) return;
          const nextSlotMemo = {
            bottom: resolveHarvestPalletMemoLayer(currentSlotMemo?.bottom),
            top: resolveHarvestPalletMemoLayer(currentSlotMemo?.top)
          };
          nextSlotMemo[layerKey] = {
            text: '',
            color: normalizeHarvestPalletMemoColor(nextSlotMemo[layerKey]?.color),
          };
          if (nextSlotMemo.bottom.text || nextSlotMemo.top.text) facilityMemoMap[slotNo] = nextSlotMemo;
          else delete facilityMemoMap[slotNo];
          if (Object.keys(facilityMemoMap).length > 0) nextByFacility[facilityKey] = facilityMemoMap;
          else delete nextByFacility[facilityKey];
          if (Object.keys(nextByFacility).length > 0) nextByField[fieldId] = nextByFacility;
          else delete nextByField[fieldId];
        };
        const compactSourceLayerVisualSlots = (storageRows) => {
          if (
            unloadMode !== 'individual'
            || !sourceIsHarvest
            || selectedSourceMoveBoxCount <= 0
            || !Array.isArray(storageRows)
            || !['warehouse-slot', 'vehicle-slot'].includes(sourceType)
          ) {
            return storageRows;
          }
          return storageRows;
        };
        const nextStorageUncompacted = Array.isArray(prev?.storage) ? prev.storage.flatMap((batch, index) => {
          const batchFacilityKey = String(batch?.storageFacilityKey || '');
          const batchSlotNo = Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0));
          const batchVehicleInstanceId = String(batch?.storageVehicleInstanceId || '');
          const batchVehicleSlotNo = Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0));
          const batchLayerNo = Math.max(
            1,
            Math.min(
              2,
              Math.floor(Number(
                sourceType === 'vehicle-slot'
                  ? (batch?.storageVehiclePalletLayer || 1)
                  : (batch?.storagePalletLayer || 1)
              ) || 1)
            )
          );
          const sourceMatched = sourceType === 'vehicle-slot'
            ? (
              sourceIsFloorStored
                ? (!batch?.palletized && batchVehicleInstanceId === sourceVehicleInstanceId && batchVehicleSlotNo === sourceVehiclePalletSlotNo)
                : (batch?.palletized && batchVehicleInstanceId === sourceVehicleInstanceId && batchVehicleSlotNo === sourceVehiclePalletSlotNo && batchLayerNo === sourceLayerNo)
            )
            : sourceIsFloorStored
              ? (!batch?.palletized && batchFacilityKey === sourceFacilityKey && batchSlotNo === sourceSlotNo)
              : (batch?.palletized && batchFacilityKey === sourceFacilityKey && batchSlotNo === sourceSlotNo && batchLayerNo === sourceLayerNo);
          if (!sourceMatched) return [batch];
          // Pallet memo is layer-level metadata. Do not let individual box moves clone it onto a new pallet.
          const shouldCarryPalletMemoWithMove = unloadMode !== 'individual';
          const carriedPalletMemo = shouldCarryPalletMemoWithMove
            ? String(batch?.palletMemo || sourceLayerMemo || '').trim().slice(0, 60)
            : '';
          const carriedPalletMemoColor = shouldCarryPalletMemoWithMove
            ? normalizeHarvestPalletMemoColor(batch?.palletMemoColor || sourceLayerMemoColor)
            : normalizeHarvestPalletMemoColor('');
          if (unloadMode === 'individual' && normalizedSelectedSourceCards.length) {
            const batchKey = `${index}:${String(batch?.id || `batch-${index}`)}`;
            const moveQtyKg = Math.max(0, Number(movedSourceBatchMoveQtyMap.get(batchKey)) || 0);
            const moveCardKind = String(movedSourceBatchCardKindMap.get(batchKey) || '');
            const sourceVisualSlotNos = Array.isArray(sourceBatchVisualSlotNosByBatchKey.get(batchKey))
              ? sourceBatchVisualSlotNosByBatchKey.get(batchKey).slice()
              : [];
            const selectedVisualSlotNos = Array.isArray(selectedSourceVisualSlotNosByBatchKey.get(batchKey))
              ? selectedSourceVisualSlotNosByBatchKey.get(batchKey).slice()
              : [];
            const preferredTargetVisualSlotNos = Array.isArray(selectedTargetVisualSlotNosByBatchKey.get(batchKey))
              ? selectedTargetVisualSlotNosByBatchKey.get(batchKey).slice()
              : [];
            if (moveQtyKg <= 0) return [batch];
            const batchQtyKg = Math.max(0, Number(batch?.qty) || 0);
            if (moveCardKind === 'full') {
              if (batchQtyKg <= safeHarvestBoxCapacityKg + 0.001) {
                return [collectMovedTargetVisualSlotNo(applyTargetToMovedBatch(batch, carriedPalletMemo, carriedPalletMemoColor, {
                  preferredTargetVisualSlotNo: preferredTargetVisualSlotNos[0] || selectedVisualSlotNos[0] || batch?.storageBoxVisualSlotNo
                }))];
              }
              const totalFullBoxCount = Math.max(0, Math.floor(batchQtyKg / safeHarvestBoxCapacityKg));
              const remainderQtyKg = Math.max(
                0,
                Math.round(((batchQtyKg - (totalFullBoxCount * safeHarvestBoxCapacityKg)) + Number.EPSILON) * 10) / 10
              );
              const moveFullBoxCount = Math.max(
                0,
                Math.min(
                  totalFullBoxCount,
                  Math.floor((moveQtyKg + 0.001) / safeHarvestBoxCapacityKg)
                )
              );
              if (moveFullBoxCount > 0) {
                const remainingFullBoxCount = Math.max(0, totalFullBoxCount - moveFullBoxCount);
                const remainingVisualSlotNos = sourceVisualSlotNos.length
                  ? (() => {
                    const next = sourceVisualSlotNos.slice();
                    selectedVisualSlotNos.forEach((selectedSlotNo) => {
                      const removeIndex = next.findIndex((slotNo) => slotNo === selectedSlotNo);
                      if (removeIndex >= 0) next.splice(removeIndex, 1);
                    });
                    return next;
                  })()
                  : [];
                const remainingSourceBatches = [];
                for (let boxIndex = 0; boxIndex < remainingFullBoxCount; boxIndex += 1) {
                  remainingSourceBatches.push(createIndependentBoxBatch(batch, safeHarvestBoxCapacityKg, {
                    storageBoxVisualSlotNo: remainingVisualSlotNos[boxIndex] || batch?.storageBoxVisualSlotNo
                  }));
                }
                if (remainderQtyKg > 0.001) {
                  remainingSourceBatches.push(createIndependentBoxBatch(batch, remainderQtyKg, {
                    storageBoxVisualSlotNo: remainingVisualSlotNos[remainingFullBoxCount] || batch?.storageBoxVisualSlotNo
                  }));
                }
                const movedTargetBatches = [];
                for (let boxIndex = 0; boxIndex < moveFullBoxCount; boxIndex += 1) {
                  movedTargetBatches.push(
                    collectMovedTargetVisualSlotNo(applyTargetToMovedBatch(
                      createIndependentBoxBatch(batch, safeHarvestBoxCapacityKg, {
                        storageBoxVisualSlotNo: selectedVisualSlotNos[boxIndex] || batch?.storageBoxVisualSlotNo
                      }),
                      carriedPalletMemo,
                      carriedPalletMemoColor,
                      {
                        preferredTargetVisualSlotNo: preferredTargetVisualSlotNos[boxIndex] || selectedVisualSlotNos[boxIndex] || batch?.storageBoxVisualSlotNo
                      }
                    ))
                  );
                }
                return [...remainingSourceBatches, ...movedTargetBatches];
              }
            }
            if (batchQtyKg <= moveQtyKg + 0.001) {
              return [collectMovedTargetVisualSlotNo(applyTargetToMovedBatch(batch, carriedPalletMemo, carriedPalletMemoColor, {
                preferredTargetVisualSlotNo: preferredTargetVisualSlotNos[0] || selectedVisualSlotNos[0] || batch?.storageBoxVisualSlotNo
              }))];
            }
            nextSplitStorageBoxUnitNo += 1;
            const remainingQtyKg = Math.max(0, Math.round(((batchQtyKg - moveQtyKg) + Number.EPSILON) * 10) / 10);
            const remainingBatch = {
              ...batch,
              qty: remainingQtyKg
            };
            const movedBatch = collectMovedTargetVisualSlotNo(applyTargetToMovedBatch({
              ...batch,
              id: createSplitBatchId(batch?.id || `batch-${index}`),
              qty: Math.round((moveQtyKg + Number.EPSILON) * 10) / 10,
              storageBoxUnitNo: nextSplitStorageBoxUnitNo
            }, carriedPalletMemo, carriedPalletMemoColor, {
              preferredTargetVisualSlotNo: preferredTargetVisualSlotNos[0] || selectedVisualSlotNos[0] || batch?.storageBoxVisualSlotNo
            }));
            return [remainingBatch, movedBatch];
          }
          const nextBatch = {
            ...batch
          };
          if (carriedPalletMemo) {
            nextBatch.palletMemo = carriedPalletMemo;
            nextBatch.palletMemoColor = carriedPalletMemoColor;
          } else {
            delete nextBatch.palletMemo;
            delete nextBatch.palletMemoColor;
          }
          if (targetType === 'vehicle-slot') {
            return [{
              ...nextBatch,
              storageFacilityKey: '',
              storagePalletSlotNo: 0,
              storagePalletNo: 0,
              storagePalletLayer: 0,
              storageVehicleInstanceId: targetVehicleInstanceId,
              storageVehiclePalletSlotNo: targetVehiclePalletSlotNo,
              storageVehiclePalletLayer: 1,
              ...clearHarvestBatchDedicatedStorageFields()
            }];
          }
          if (targetType === 'vehicle-cargo') {
            delete nextBatch.palletMemo;
            delete nextBatch.palletMemoColor;
            return [{
              ...nextBatch,
              palletized: false,
              storagePalletGroupId: '',
              storageFacilityKey: '',
              storagePalletSlotNo: 0,
              storagePalletNo: 0,
              storagePalletLayer: 0,
              storageVehicleInstanceId: targetVehicleInstanceId,
              storageVehiclePalletSlotNo: 0,
              storageVehiclePalletLayer: 0,
              ...clearHarvestBatchDedicatedStorageFields()
            }];
          }
          if (targetType === 'warehouse-general') {
            delete nextBatch.palletMemo;
            delete nextBatch.palletMemoColor;
            return [{
              ...nextBatch,
              palletized: false,
              storagePalletGroupId: '',
              storageFacilityKey: targetFacilityKey,
              storagePalletSlotNo: 0,
              storagePalletNo: 0,
              storagePalletLayer: 0,
              storageVehicleInstanceId: '',
              storageVehiclePalletSlotNo: 0,
              storageVehiclePalletLayer: 0,
              ...clearHarvestBatchDedicatedStorageFields()
            }];
          }
          if (targetType === 'warehouse-empty-pallet' || targetType === 'warehouse-harvest-pallet') {
            return [{
              ...nextBatch,
              ...buildHarvestBatchStoragePatch({
                targetType,
                targetFacilityKey,
                nextTargetSlotNo,
                targetLayerNo: 1,
                targetGroupId: `storage-repallet-${targetFacilityKey}-${nextTargetSlotNo}-1`,
                targetIsSortingCargoSlot,
                targetSortingEquipmentKey,
                targetSortingPositionKey,
                targetIsWorkbenchCargoSlot,
                targetWorkbenchFacilityKey,
                targetWorkbenchSlotKey,
                targetWorkbenchCargoSlotKey,
              }),
              storageVehiclePalletLayer: 0
            }];
          }
          return [{
            ...nextBatch,
            ...buildHarvestBatchStoragePatch({
              targetType,
              targetFacilityKey,
              nextTargetSlotNo,
              targetLayerNo: targetType === 'warehouse-stack-top' ? 2 : 1,
              targetGroupId: `storage-repallet-${targetFacilityKey}-${nextTargetSlotNo}-${targetType === 'warehouse-stack-top' ? 2 : 1}`,
              targetIsSortingCargoSlot,
              targetSortingEquipmentKey,
              targetSortingPositionKey,
              targetIsWorkbenchCargoSlot,
              targetWorkbenchFacilityKey,
              targetWorkbenchSlotKey,
              targetWorkbenchCargoSlotKey,
            }),
            storageVehiclePalletLayer: 0
          }];
        }) : prev?.storage;
        const nextStorage = hydrateWarehouseFloorStoredHarvestSlotMetadata(
          repairLegacyWarehouseFloorStoredHarvestVisualSlots(
            canonicalizePalletizedHarvestVisualSlots(
              compactSourceLayerVisualSlots(nextStorageUncompacted),
              safeHarvestBoxCapacityKg
            ),
            safeHarvestBoxCapacityKg
          ),
          safeHarvestBoxCapacityKg
        );
        const finalMovedTargetVisualSlotNos = Array.isArray(nextStorage)
          ? nextStorage.reduce((acc, batch) => {
              const batchId = String(batch?.id || '').trim();
              if (!batchId || !movedTargetBatchIds.has(batchId)) return acc;
              const visualSlotNo = Math.max(0, Math.floor(Number(batch?.storageBoxVisualSlotNo) || 0));
              if (visualSlotNo > 0) acc.push(visualSlotNo);
              return acc;
            }, [])
          : [];
        targetLoadAnimVisualSlotNos = Array.from(new Set(
          (finalMovedTargetVisualSlotNos.length ? finalMovedTargetVisualSlotNos : movedTargetVisualSlotNos)
            .map((value) => Math.max(0, Math.floor(Number(value) || 0)))
            .filter((value) => value > 0)
        ));
        if (sourceType === 'warehouse-slot') {
          clearLegacySlotMemo(sourceFacilityKey, sourceSlotNo, sourceLayerKey);
        }
        if (!targetIsAuxCargoSlot && (targetType === 'warehouse-empty' || targetType === 'warehouse-stack-top' || targetType === 'warehouse-empty-pallet' || targetType === 'warehouse-harvest-pallet')) {
          clearLegacySlotMemo(targetFacilityKey, nextTargetSlotNo, targetType === 'warehouse-stack-top' ? 'top' : 'bottom');
        }
        const wearApplied = applyEquipmentUseWear(prev, selectedTransportWearMap);
        const nextVehiclePalletSlotsByInstance = { ...(prev?.vehiclePalletSlotsByInstance || {}) };
        const ensureVehicleEmptyPallet = (instanceIdRaw, slotNoRaw) => {
          const instanceId = String(instanceIdRaw || '');
          const slotNo = Math.max(1, Math.floor(Number(slotNoRaw) || 0));
          if (!instanceId || slotNo <= 0) return;
          nextVehiclePalletSlotsByInstance[instanceId] = {
            ...(nextVehiclePalletSlotsByInstance[instanceId] || {}),
            [slotNo]: { itemKey: 'plasticPallet1100' }
          };
        };
        const clearVehicleEmptyPallet = (instanceIdRaw, slotNoRaw) => {
          const instanceId = String(instanceIdRaw || '');
          const slotNo = Math.max(1, Math.floor(Number(slotNoRaw) || 0));
          if (!instanceId || slotNo <= 0) return;
          const slotMap = { ...(nextVehiclePalletSlotsByInstance[instanceId] || {}) };
          delete slotMap[slotNo];
          if (Object.keys(slotMap).length > 0) nextVehiclePalletSlotsByInstance[instanceId] = slotMap;
          else delete nextVehiclePalletSlotsByInstance[instanceId];
        };
        if (unloadMode === 'individual' || movingToGeneralStorage || movingToFloorStorage) {
          if (
            facilityStorageSelectedTransportCanMovePallet
            && sourceType === 'vehicle-slot'
            && !sourceIsFloorStored
            && !sourceStillHasHarvestAfterMove
          ) {
            ensureVehicleEmptyPallet(sourceVehicleInstanceId, sourceVehiclePalletSlotNo);
          }
          if (targetType === 'vehicle-slot') clearVehicleEmptyPallet(targetVehicleInstanceId, targetVehiclePalletSlotNo);
        }
        const nextState = {
          ...prev,
          storage: nextStorage,
          harvestPalletMemoByFieldId: nextByField,
          vehiclePalletSlotsByInstance: nextVehiclePalletSlotsByInstance,
          logs: pushDiary(prev, moveLogText),
          equipmentDurability: wearApplied.equipmentDurability,
          equipmentDurabilityByInstance: wearApplied.equipmentDurabilityByInstance
        };
        return nextState;
      });
      if (sourceType === 'warehouse-slot' || (!targetIsAuxCargoSlot && (targetType === 'warehouse-empty' || targetType === 'warehouse-stack-top'))) {
        setFacilityStorageHarvestSlotByFacility((prev) => {
          const next = { ...(prev || {}) };
          if (sourceType === 'warehouse-slot') {
            const sourceRaw = Array.isArray(next?.[sourceFacilityKey]) ? next[sourceFacilityKey] : [];
            const sourceNext = [...sourceRaw];
            const shouldLeaveEmptyPallet = unloadMode === 'individual'
              && !sourceSlot?.isFloorStored
              && !sourceStillHasHarvestAfterMove;
            sourceNext[sourceSlotNo - 1] = shouldLeaveEmptyPallet
              ? { itemKey: 'plasticPallet1100', sourceType: 'emptyPallet', sourceLabel: '빈 팔레트' }
              : null;
            next[sourceFacilityKey] = sourceNext;
          }
          if (!targetIsAuxCargoSlot && (targetType === 'warehouse-empty' || targetType === 'warehouse-floor-harvest' || targetType === 'warehouse-stack-top' || targetType === 'warehouse-empty-pallet' || targetType === 'warehouse-harvest-pallet')) {
            const targetRaw = Array.isArray(next?.[targetFacilityKey]) ? next[targetFacilityKey] : [];
            const targetNext = sourceType === 'warehouse-slot' && sourceFacilityKey === targetFacilityKey
              ? [...(next[targetFacilityKey] || [])]
              : [...targetRaw];
            targetNext[nextTargetSlotNo - 1] = null;
            next[targetFacilityKey] = targetNext;
          }
          return next;
        });
      }
      if (!targetIsAuxCargoSlot && targetType === 'warehouse-stack-top') {
        setFacilityStorageHarvestVisibleLayerBySlot((prev) => ({
          ...(prev || {}),
          [nextTargetSlotNo]: 'top'
        }));
        runTargetLoadAnim(() => {
          playFacilityStorageHarvestStackAnim(nextTargetSlotNo);
        });
      } else if (!targetIsAuxCargoSlot && (targetType === 'warehouse-empty' || targetType === 'warehouse-floor-harvest' || targetType === 'warehouse-empty-pallet' || targetType === 'warehouse-harvest-pallet')) {
        setFacilityStorageHarvestVisibleLayerBySlot((prev) => ({
          ...(prev || {}),
          [nextTargetSlotNo]: 'bottom'
        }));
        if (unloadMode === 'individual' && selectedSourceMoveBoxCount > 0) {
          const selectedSourceEntrySlots = selectedSourceBatchEntries.map((entry, index) => ({
            index,
            sourceVisualSlotNo: Math.max(0, Math.floor(Number(entry?.sourceVisualSlotNo) || 0)),
            targetVisualSlotNo: Math.max(0, Math.floor(Number(entry?.targetDockSlotNo) || 0)),
            batchId: String(entry?.batch?.id || ''),
            boxUnitNo: Math.max(0, Math.floor(Number(entry?.batch?.storageBoxUnitNo) || 0)),
          }));
          const targetLoadAnimVisualSlotNosSnapshot = Array.isArray(targetLoadAnimVisualSlotNos)
            ? targetLoadAnimVisualSlotNos.slice()
            : [];
          const selectedSourceEntrySlotsSnapshot = selectedSourceEntrySlots.map((entry) => ({ ...entry }));
          primeFacilityStorageHarvestIndividualFillAnim?.(nextTargetSlotNo, selectedSourceMoveBoxCount, {
            animKey: `warehouse:${nextTargetSlotNo}`,
            visualSlotNos: targetLoadAnimVisualSlotNosSnapshot,
            deferCommitVisual: true,
          });
          traceHarvestIndividualFillAnim?.('actions-delayed-scheduled', {
            targetType,
            slotNo: nextTargetSlotNo,
            boxCount: selectedSourceMoveBoxCount,
            animKey: `warehouse:${nextTargetSlotNo}`,
            visualSlotNos: targetLoadAnimVisualSlotNosSnapshot,
            selectedSourceEntrySlots: selectedSourceEntrySlotsSnapshot,
            sourceIsSelectedTransportDock,
          });
          runTargetLoadAnim(() => {
            traceHarvestIndividualFillAnim?.('actions-delayed-call', {
              targetType,
              slotNo: nextTargetSlotNo,
              boxCount: selectedSourceMoveBoxCount,
              animKey: `warehouse:${nextTargetSlotNo}`,
              visualSlotNos: targetLoadAnimVisualSlotNosSnapshot,
              selectedSourceEntrySlots: selectedSourceEntrySlotsSnapshot,
              sourceIsSelectedTransportDock,
            });
            playFacilityStorageHarvestIndividualFillAnim?.(nextTargetSlotNo, selectedSourceMoveBoxCount, {
              animKey: `warehouse:${nextTargetSlotNo}`,
              visualSlotNos: targetLoadAnimVisualSlotNosSnapshot,
              deferCommitVisual: true,
            });
          });
        }
      } else if (targetType === 'vehicle-slot') {
        if (unloadMode === 'individual' && selectedSourceMoveBoxCount > 0) {
          const vehicleAnimKey = `vehicle:${targetVehicleInstanceId}:${targetVehiclePalletSlotNo}`;
          const selectedSourceEntrySlots = selectedSourceBatchEntries.map((entry, index) => ({
            index,
            sourceVisualSlotNo: Math.max(0, Math.floor(Number(entry?.sourceVisualSlotNo) || 0)),
            targetDockSlotNo: Math.max(0, Math.floor(Number(entry?.targetDockSlotNo) || 0)),
            batchId: String(entry?.batch?.id || ''),
            boxUnitNo: Math.max(0, Math.floor(Number(entry?.batch?.storageBoxUnitNo) || 0)),
          }));
          const targetLoadAnimVisualSlotNosSnapshot = Array.isArray(targetLoadAnimVisualSlotNos)
            ? targetLoadAnimVisualSlotNos.slice()
            : [];
          const selectedSourceEntrySlotsSnapshot = selectedSourceEntrySlots.map((entry) => ({ ...entry }));
          primeFacilityStorageHarvestIndividualFillAnim?.(targetVehiclePalletSlotNo, selectedSourceMoveBoxCount, {
            animKey: vehicleAnimKey,
            visualSlotNos: targetLoadAnimVisualSlotNosSnapshot,
            deferCommitVisual: true,
          });
          traceHarvestIndividualFillAnim?.('actions-vehicle-slot-scheduled', {
            targetType,
            slotNo: targetVehiclePalletSlotNo,
            boxCount: selectedSourceMoveBoxCount,
            animKey: vehicleAnimKey,
            visualSlotNos: targetLoadAnimVisualSlotNosSnapshot,
            selectedSourceEntrySlots: selectedSourceEntrySlotsSnapshot,
            sourceIsSelectedTransportDock,
          });
          runTargetLoadAnim(() => {
            traceHarvestIndividualFillAnim?.('actions-vehicle-slot-call', {
              targetType,
              slotNo: targetVehiclePalletSlotNo,
              boxCount: selectedSourceMoveBoxCount,
              animKey: vehicleAnimKey,
              visualSlotNos: targetLoadAnimVisualSlotNosSnapshot,
              selectedSourceEntrySlots: selectedSourceEntrySlotsSnapshot,
              sourceIsSelectedTransportDock,
            });
            playFacilityStorageHarvestIndividualFillAnim?.(targetVehiclePalletSlotNo, selectedSourceMoveBoxCount, {
              animKey: vehicleAnimKey,
              visualSlotNos: targetLoadAnimVisualSlotNosSnapshot,
              deferCommitVisual: true,
            });
          });
        }
      }
      if (generalTargetRowKey) {
        runTargetLoadAnim(() => {
          playFacilityStorageHarvestGeneralFirstLoadAnim?.(generalTargetRowKey);
        });
      }
    } else {
      if (targetType !== 'warehouse-empty' && targetType !== 'vehicle-slot') {
        window.alert('빈 팔레트는 빈 창고칸이나 빈 차량 적재칸으로만 이동할 수 있습니다.');
        return;
      }
      setGame((prev) => {
        if (!prev) return prev;
        const wearApplied = applyEquipmentUseWear(prev, selectedTransportWearMap);
        const nextVehiclePalletSlotsByInstance = { ...(prev?.vehiclePalletSlotsByInstance || {}) };
        if (sourceType === 'vehicle-slot') {
          const slotMap = { ...(nextVehiclePalletSlotsByInstance[sourceVehicleInstanceId] || {}) };
          delete slotMap[sourceVehiclePalletSlotNo];
          if (Object.keys(slotMap).length > 0) nextVehiclePalletSlotsByInstance[sourceVehicleInstanceId] = slotMap;
          else delete nextVehiclePalletSlotsByInstance[sourceVehicleInstanceId];
        }
        if (targetType === 'vehicle-slot') {
          nextVehiclePalletSlotsByInstance[targetVehicleInstanceId] = {
            ...(nextVehiclePalletSlotsByInstance[targetVehicleInstanceId] || {}),
            [targetVehiclePalletSlotNo]: { itemKey: 'plasticPallet1100' }
          };
        }
        return {
          ...prev,
          logs: pushDiary(prev, moveLogText),
          vehiclePalletSlotsByInstance: nextVehiclePalletSlotsByInstance,
          equipmentDurability: wearApplied.equipmentDurability,
          equipmentDurabilityByInstance: wearApplied.equipmentDurabilityByInstance
        };
      });
      if (sourceType === 'warehouse-slot' || targetType !== 'vehicle-slot') {
        setFacilityStorageHarvestSlotByFacility((prev) => {
          const sourceRaw = sourceType === 'warehouse-slot'
            ? (Array.isArray(prev?.[sourceFacilityKey]) ? prev[sourceFacilityKey] : [])
            : [];
          const targetRaw = Array.isArray(prev?.[targetFacilityKey]) ? prev[targetFacilityKey] : [];
          const sourceNext = [...sourceRaw];
          const targetNext = sourceFacilityKey === targetFacilityKey ? sourceNext : [...targetRaw];
          const movedEntry = sourceType === 'empty-pallet-stock' || sourceType === 'vehicle-slot'
            ? { itemKey: 'plasticPallet1100', sourceType: 'emptyPallet', sourceLabel: '빈 팔레트' }
            : (sourceNext[sourceSlotNo - 1] || null);
          if (sourceType === 'warehouse-slot') {
            sourceNext[sourceSlotNo - 1] = null;
          }
          if (targetType !== 'vehicle-slot') {
            targetNext[nextTargetSlotNo - 1] = movedEntry;
          }
          return {
            ...prev,
            ...(sourceType === 'warehouse-slot' ? { [sourceFacilityKey]: sourceNext } : {}),
            ...(targetType !== 'vehicle-slot' ? { [targetFacilityKey]: targetNext } : {})
          };
        });
      }
    }
    const sourceHasRemainingLoadAfterMove = sourceStillHasHarvestAfterMove || actualMoveKg + 0.001 < sourceQtyKg;
    const shouldKeepIndividualPickerOpen = keepIndividualPickerOpen
      && unloadMode === 'individual'
      && selectedSourceMoveBoxCount > 0
      && (
        sourceHasRemainingLoadAfterMove
        || (
          Boolean(picker?.pendingTarget)
          && sourceType !== 'vehicle-slot'
        )
      );
    if (shouldKeepIndividualPickerOpen) {
      const resumePendingTargetAfterCommit = picker?.resumePendingTargetAfterCommit || null;
      const shouldRestoreWarehousePairAfterDockReturn = (
        sourceType === 'warehouse-slot'
        && targetType === 'vehicle-slot'
        && Boolean(resumePendingTargetAfterCommit)
      );
      console.info('[harvest-move-debug] keep individual picker open after commit', {
        sourceType,
        targetType,
        sourceSlotNo,
        sourceVehicleInstanceId,
        sourceVehiclePalletSlotNo,
        targetFacilityKey,
        targetSlotNo: nextTargetSlotNo,
        targetVehicleInstanceId,
        targetVehiclePalletSlotNo,
        sourceStillHasHarvestAfterMove,
        selectedSourceMoveBoxCount,
        pickerSelectedBoxCount: Math.max(0, Math.floor(Number(picker?.selectedBoxCount) || 0)),
        pickerSourceBoxCard: Boolean(picker?.sourceBoxCard),
        pendingTargetType: String(picker?.pendingTarget?.targetType || ''),
        resumePendingTargetType: String(resumePendingTargetAfterCommit?.targetType || ''),
        shouldRestoreWarehousePairAfterDockReturn,
      });
      setFacilityStorageHarvestMovePicker((prev) => (
        prev
          ? (
            shouldRestoreWarehousePairAfterDockReturn
              ? {
                ...prev,
                sourceType: 'vehicle-slot',
                sourceFacilityKey: '',
                sourceSlotNo: 0,
                sourceVehicleInstanceId: targetVehicleInstanceId,
                sourceVehiclePalletSlotNo: targetVehiclePalletSlotNo,
                sourceLayerKey: 'bottom',
                sourceTransportKey: String(prev?.sourceTransportKey || ''),
                pendingTarget: resumePendingTargetAfterCommit,
                resumePendingTargetAfterCommit: null,
                selectedBoxCount: 0,
                selectedSourceCards: [],
                sourceBoxCard: null,
                autoCommitToPendingTargetTick: 0,
              }
              : {
                ...prev,
                pendingTarget: target || null,
                resumePendingTargetAfterCommit: null,
                selectedBoxCount: 0,
                selectedSourceCards: [],
                sourceBoxCard: sourceStillHasHarvestAfterMove ? (prev?.sourceBoxCard || null) : null,
                autoCommitToPendingTargetTick: 0,
              }
          )
          : prev
      ));
    } else {
      setFacilityStorageHarvestMovePicker(null);
      clearTransportDockPreview?.();
    }
    focusWarehouseTargetFacility(
      targetFacilityKey,
      targetType,
      target?.isWorkbenchCargoSlot
        ? 'workbench'
        : (target?.isSortingCargoSlot ? 'sorting' : '')
    );
    setFacilityStorageHarvestDetailSlotNo(0);
    setFacilityStorageHarvestDetailSource(null);
    setFacilityStorageHarvestDetailLayer('bottom');
  }, [
    activeFacilityStorageKey,
    applyEquipmentUseWear,
    decodeUnicodeEscapes,
    facilityMap,
    facilityStorageDefaultLoadBoxWeightKg,
    facilityStorageDefaultPalletWeightKg,
    facilityStorageHarvestGeneralRowMap,
    facilityStorageHarvestMovePicker,
    facilityStorageTransportDockPreviewSource,
    facilityStorageSelectedTransportDockStoredSource,
    facilityStorageHarvestSlotRows,
    facilityStorageModalFacilityKey,
    facilityStorageModal,
    facilityStoragePalletMoveWear,
    facilityStorageSelectedTransportCanMovePallet,
    facilityStorageSelectedTransportCanStackPallet,
    facilityStorageSelectedTransportMode,
    facilityStorageSelectedTransportRow,
    game?.storage,
    harvestAvailablePalletQty,
    harvestBoxCapacityKg,
    harvestBoxesPerPallet,
    harvestGeneralDisplayKeyOf,
    harvestLoadSourceRows,
    harvestPalletLayerEntryOf,
    harvestPalletLoadMeta,
    harvestStoredFloorSummaryRowsByFacilityAndSlot,
    harvestStoredPalletSlotsByFacility,
    harvestStoredPalletSlotsByVehicleInstance,
    isMatchingHarvestGeneralBatch,
    isMatchingHarvestPalletCardBatch,
    itemMetaByKey,
    laborText,
    machineDisplayNameWithRentTag,
    machineParkingInstanceId,
    normalizeHarvestPalletMemoByFieldMap,
    playFacilityStorageHarvestIndividualFillAnim,
    playFacilityStorageHarvestGeneralFirstLoadAnim,
    playFacilityStorageHarvestStackAnim,
    resolveFieldFacilityInventoryByFacility,
    resolveMachineInstanceById,
    roundLabor,
    setFacilityStorageHarvestDetailLayer,
    setFacilityStorageHarvestDetailSlotNo,
    setFacilityStorageHarvestDetailSource,
    setFacilityStorageHarvestTab,
    setFacilityStorageHarvestMovePicker,
    setFacilityStorageHarvestSlotByFacility,
    setFacilityStorageHarvestVisibleLayerBySlot,
    setFacilityStorageTab,
    setGame,
    stripColdStorageIconName,
    focusWarehouseTargetFacility,
    clearTransportDockPreview,
    traceHarvestIndividualFillAnim
  ]);

  return {
    confirmHarvestGeneralMoveToPallet,
    chooseHarvestPalletMoveTarget
  };
}
