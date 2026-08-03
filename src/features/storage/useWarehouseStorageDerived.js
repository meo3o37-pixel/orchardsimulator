import { useCallback, useEffect, useMemo } from 'react';
import { formatKg, roundKg } from '../../utils/common';
import { normalizeHarvestGradeLabel } from '../../utils/harvestGrade';
import {
  buildSortingCargoSlotEntry,
  buildWorkbenchCargoSlotEntry,
  sortingCargoStorageSlotNoOf,
  workbenchCargoStorageSlotNoOf
} from './workbenchStorageSlots';
import {
  harvestStorageMoveStatusLabelOf,
  projectHarvestStorageDisplayFields,
  harvestStorageSlotVisualFilledBoxCount
} from './storageSlotModel';
import { formatHarvestBoxStateLabel } from './harvestBoxLabel';

const WAREHOUSE_ROWS_VIEW_CACHE_BY_ROWS = new WeakMap();
const WAREHOUSE_VISIBLE_ROWS_CACHE_BY_ROWS_VIEW = new WeakMap();
const WAREHOUSE_EMPTY_ROWS = Object.freeze([]);
const WAREHOUSE_SUBTAB_KEYS = Object.freeze([
  'harvestContainer',
  'fuelContainer',
  'pallet',
  'waterTank',
  'pruningTool',
  'transportTool',
  'sprayTool',
  'installTool',
  'trellisMaterial',
  'irrigationMaterial',
  'reflectiveMaterial'
]);
const WAREHOUSE_SUBTAB_KEY_SET = new Set(WAREHOUSE_SUBTAB_KEYS);
const WAREHOUSE_INSTALL_PART_ITEM_KEYS = new Set([
  'appleSortingPartsSmall',
  'appleSortingPartsMedium',
  'appleSortingPartsLarge'
]);
const WAREHOUSE_OBJECT_CACHE_IDS = new WeakMap();
let warehouseObjectCacheIdSeq = 0;

const warehouseObjectCacheIdOf = (value) => {
  if ((typeof value !== 'object' && typeof value !== 'function') || value === null) return String(value);
  let id = WAREHOUSE_OBJECT_CACHE_IDS.get(value);
  if (!id) {
    warehouseObjectCacheIdSeq += 1;
    id = `ref-${warehouseObjectCacheIdSeq}`;
    WAREHOUSE_OBJECT_CACHE_IDS.set(value, id);
  }
  return id;
};

const warehouseCachedMapGetOrSet = (cacheMap, key, buildValue) => {
  if (cacheMap.has(key)) return cacheMap.get(key);
  const value = buildValue();
  cacheMap.set(key, value);
  return value;
};

const storageSubTabMatchesWarehouseItem = (tabKeyRaw = '', item = {}) => {
  const tabKey = String(tabKeyRaw || '');
  const category = String(item?.category || '');
  const itemKey = String(item?.key || item?.displayKey || '');
  const name = String(item?.name || '');
  const type = String(item?.type || '');
  const text = `${itemKey} ${name} ${type}`;
  if (tabKey === 'harvestContainer') {
    return category === 'container' && /appleContainer|수확|20kg들이|컨테이너/i.test(text);
  }
  if (tabKey === 'fuelContainer') {
    return category === 'container' && /containerCan|말통|연료|경유|휘발유|등유|fuel|jerry/i.test(text);
  }
  if (tabKey === 'pallet') {
    return category === 'container' && /pallet|pallette|파렛트|팔레트/i.test(text);
  }
  if (tabKey === 'waterTank') {
    return category === 'container' && /waterTank|물탱크|생활수/i.test(text);
  }
  if (tabKey === 'pruningTool') {
    return category === 'tool' && /pruning|thinning|전정|적과|가위|톱/i.test(text);
  }
  if (tabKey === 'transportTool') {
    return category === 'tool' && /cart|wheelbarrow|palletJack|ladder|사다리|카트|손수레|팔레트 잭|운반/i.test(text);
  }
  if (tabKey === 'sprayTool') {
    return category === 'tool' && (type === 'spray' || /sprayer|등짐|분무|방제/i.test(text));
  }
  if (tabKey === 'installTool') {
    return category === 'tool' && WAREHOUSE_INSTALL_PART_ITEM_KEYS.has(itemKey);
  }
  if (tabKey === 'trellisMaterial') {
    return category === 'consumableMaterial' && /trellis|stake|scaffold|wire|anchor|binding|training|cableTie|지주|비계|와이어|앙카|결속|유인끈|타이/i.test(text);
  }
  if (tabKey === 'irrigationMaterial') {
    return category === 'consumableMaterial' && /irrigation|drip|sprinkler|관수|점적|스프링클러|살수|노즐|배관/i.test(text);
  }
  if (tabKey === 'reflectiveMaterial') {
    return category === 'consumableMaterial' && /reflective|반사필름/i.test(text);
  }
  return false;
};

const warehouseRowsViewOf = ({
  facilityStorageRows,
  facilityStorageTab,
  facilityStorageFacilityTab,
  isHarvestStorageItem
}) => {
  const rows = Array.isArray(facilityStorageRows) ? facilityStorageRows : WAREHOUSE_EMPTY_ROWS;
  let cacheByKey = WAREHOUSE_ROWS_VIEW_CACHE_BY_ROWS.get(rows);
  if (!cacheByKey) {
    cacheByKey = new Map();
    WAREHOUSE_ROWS_VIEW_CACHE_BY_ROWS.set(rows, cacheByKey);
  }
  const tabKey = String(facilityStorageTab || '');
  const facilityTabKey = String(facilityStorageFacilityTab || '');
  const cacheKey = [
    tabKey,
    facilityTabKey,
    warehouseObjectCacheIdOf(isHarvestStorageItem)
  ].join('|');
  return warehouseCachedMapGetOrSet(cacheByKey, cacheKey, () => {
    if (tabKey === 'all') {
      return rows.filter((item) => String(item?.category || '') !== 'facility' && !item?.isParkedMachineRow);
    }
    if (tabKey === 'harvest' || (tabKey === 'facility' && facilityTabKey === 'harvest')) {
      return rows.filter((item) => isHarvestStorageItem(item));
    }
    if (tabKey === 'vehicle') {
      return rows.filter((item) => Boolean(item?.isParkedMachineRow));
    }
    if (tabKey === 'farmInput') {
      return rows.filter((item) => ['pesticide', 'pollen', 'fertilizer'].includes(String(item?.category || '')));
    }
    if (WAREHOUSE_SUBTAB_KEY_SET.has(tabKey)) {
      return rows.filter((item) => storageSubTabMatchesWarehouseItem(tabKey, item));
    }
    return rows.filter((item) => String(item?.category || '') === tabKey);
  });
};

const warehouseVisibleRowsOf = ({
  facilityStorageTab,
  facilityStorageFacilityTab,
  facilityStorageHarvestTab,
  facilityStorageSupportsHarvestPalletSlots,
  facilityStorageRowsView,
  facilityStorageHarvestGeneralRows,
  appleSortingFacilityKeys
}) => {
  const tabKey = String(facilityStorageTab || '');
  const facilityTabKey = String(facilityStorageFacilityTab || '');
  const harvestTabKey = String(facilityStorageHarvestTab || '');
  if (tabKey === 'facility') {
    if (facilityTabKey === 'harvest') {
      if (facilityStorageSupportsHarvestPalletSlots) return WAREHOUSE_EMPTY_ROWS;
      return harvestTabKey === 'general' ? facilityStorageHarvestGeneralRows : WAREHOUSE_EMPTY_ROWS;
    }
    if (facilityTabKey === 'workbench') return WAREHOUSE_EMPTY_ROWS;
    if (facilityTabKey !== 'sorting') return WAREHOUSE_EMPTY_ROWS;
  } else if (tabKey === 'harvest') {
    if (facilityStorageSupportsHarvestPalletSlots) return WAREHOUSE_EMPTY_ROWS;
    return harvestTabKey === 'general' ? facilityStorageHarvestGeneralRows : WAREHOUSE_EMPTY_ROWS;
  } else {
    return facilityStorageRowsView;
  }

  const rowsView = Array.isArray(facilityStorageRowsView) ? facilityStorageRowsView : WAREHOUSE_EMPTY_ROWS;
  let cacheByKey = WAREHOUSE_VISIBLE_ROWS_CACHE_BY_ROWS_VIEW.get(rowsView);
  if (!cacheByKey) {
    cacheByKey = new Map();
    WAREHOUSE_VISIBLE_ROWS_CACHE_BY_ROWS_VIEW.set(rowsView, cacheByKey);
  }
  const sortingKeys = Array.isArray(appleSortingFacilityKeys) ? appleSortingFacilityKeys : [];
  const sortingKey = sortingKeys
    .map((key) => String(key || ''))
    .join(',');
  const cacheKey = `${facilityTabKey}|${sortingKey}`;
  return warehouseCachedMapGetOrSet(cacheByKey, cacheKey, () => (
    rowsView.filter((item) => sortingKeys.includes(String(item?.facilityKey || item?.key || '')))
  ));
};

export function useWarehouseStorageFacilityTabGuard(
  facilityTabs,
  activeFacilityTab,
  setActiveFacilityTab
) {
  useEffect(() => {
    const availableTabKeys = new Set(facilityTabs.map(([key]) => String(key || '')));
    if (availableTabKeys.has(String(activeFacilityTab || ''))) return;
    const fallbackTab = String(facilityTabs?.[0]?.[0] || 'workbench');
    if (fallbackTab !== String(activeFacilityTab || '')) {
      setActiveFacilityTab(fallbackTab);
    }
  }, [activeFacilityTab, facilityTabs, setActiveFacilityTab]);
}

function useDirectionalPanelTransition({
  prevKeyRef,
  currentKey,
  fallbackKey,
  orderMap,
  setDirection,
  setArmed
}) {
  useEffect(() => {
    const prevKey = String(prevKeyRef.current || fallbackKey);
    const nextKey = String(currentKey || fallbackKey);
    if (prevKey === nextKey) return;
    const prevIndex = Number(orderMap?.[prevKey]);
    const nextIndex = Number(orderMap?.[nextKey]);
    setDirection(
      Number.isFinite(prevIndex) && Number.isFinite(nextIndex) && nextIndex < prevIndex
        ? 'backward'
        : 'forward'
    );
    setArmed(true);
    prevKeyRef.current = nextKey;
  }, [currentKey, fallbackKey, orderMap, prevKeyRef, setArmed, setDirection]);
}

export function useWarehouseStoragePanelTransitions({
  entryPrevTabRef,
  entryTab,
  setEntryPanelSlideDirection,
  setEntryPanelSlideArmed,
  prevViewKeyRef,
  viewKey,
  viewOrderMap,
  setPanelSlideDirection,
  setPanelSlideArmed,
  carrierViewPrevTabRef,
  carrierViewTab,
  setCarrierViewPanelSlideDirection,
  setCarrierViewPanelSlideArmed
}) {
  useDirectionalPanelTransition({
    prevKeyRef: entryPrevTabRef,
    currentKey: entryTab,
    fallbackKey: 'warehouse',
    orderMap: { warehouse: 0, parking: 1 },
    setDirection: setEntryPanelSlideDirection,
    setArmed: setEntryPanelSlideArmed
  });

  useDirectionalPanelTransition({
    prevKeyRef: prevViewKeyRef,
    currentKey: viewKey,
    fallbackKey: 'all',
    orderMap: viewOrderMap,
    setDirection: setPanelSlideDirection,
    setArmed: setPanelSlideArmed
  });

  useDirectionalPanelTransition({
    prevKeyRef: carrierViewPrevTabRef,
    currentKey: carrierViewTab,
    fallbackKey: 'cargo',
    orderMap: { cargo: 0, pallet: 1, machine: 2 },
    setDirection: setCarrierViewPanelSlideDirection,
    setArmed: setCarrierViewPanelSlideArmed
  });
}

export function useWarehouseStorageViewState({
  facilityStorageTabs,
  facilityStorageRows,
  facilityStorageTab,
  facilityStorageHarvestTab,
  facilityStorageSupportsHarvestTab,
  facilityStorageSupportsHarvestPalletSlots,
  facilityStorageFacilityTab,
  facilityStorageSupportsFacilityCoolingTab,
  facilityStorageSupportsFacilitySortingTab,
  facilityStorageSupportsFacilityWorkbenchTab,
  facilityStorageIsColdStorage,
  isHarvestStorageItem,
  appleSortingFacilityKeys,
  facilityStoragePanelSlideArmed,
  facilityStoragePanelSlideDirection
}) {
  const primaryTabs = useMemo(
    () => facilityStorageTabs.filter(([key]) => String(key || '') !== 'facility'),
    [facilityStorageTabs]
  );

  const rowsView = useMemo(
    () => warehouseRowsViewOf({
      facilityStorageRows,
      facilityStorageTab,
      facilityStorageFacilityTab,
      isHarvestStorageItem
    }),
    [facilityStorageFacilityTab, facilityStorageRows, facilityStorageTab, isHarvestStorageItem]
  );

  const harvestTabs = useMemo(
    () => (
      facilityStorageSupportsHarvestPalletSlots
        ? [['pallet', '저장공간']]
        : [['general', '일반저장']]
    ),
    [facilityStorageSupportsHarvestPalletSlots]
  );

  const facilityTabs = useMemo(
    () => ([
      ...(facilityStorageSupportsHarvestTab ? [['harvest', '📦 적재칸']] : []),
      ...(facilityStorageSupportsFacilityCoolingTab ? [['coolingBlower', '냉풍기'], ['coolingOutdoor', '실외기']] : []),
      ...(facilityStorageSupportsFacilitySortingTab && !facilityStorageIsColdStorage ? [['sorting', '🧺 선별기']] : []),
      ...(facilityStorageSupportsFacilityWorkbenchTab ? [['workbench', '🛠️ 작업대']] : [])
    ]),
    [
      facilityStorageIsColdStorage,
      facilityStorageSupportsHarvestTab,
      facilityStorageSupportsFacilityCoolingTab,
      facilityStorageSupportsFacilitySortingTab,
      facilityStorageSupportsFacilityWorkbenchTab
    ]
  );

  const harvestTab = facilityStorageSupportsHarvestPalletSlots
    ? 'pallet'
    : String(facilityStorageHarvestTab || 'general');
  const viewKey = useMemo(
    () => (
      facilityStorageTab === 'harvest'
        ? `harvest:${harvestTab}`
        : facilityStorageTab === 'facility'
          ? `facility:${String(facilityStorageFacilityTab || 'harvest')}`
          : String(facilityStorageTab || 'all')
    ),
    [facilityStorageFacilityTab, facilityStorageTab, facilityStorageSupportsHarvestPalletSlots, harvestTab]
  );

  const viewOrderMap = useMemo(() => {
    const orderMap = {};
    let orderIndex = 0;
    facilityStorageTabs.forEach(([key]) => {
      const normalizedKey = String(key || '');
      if (normalizedKey === 'harvest') {
        orderMap.harvest = orderIndex;
        if (facilityStorageSupportsHarvestPalletSlots) {
          orderMap['harvest:pallet'] = orderIndex;
          orderIndex += 1;
          return;
        }
        orderMap['harvest:general'] = orderIndex;
        orderIndex += 1;
        return;
      }
      if (normalizedKey === 'facility') {
        orderMap.facility = orderIndex;
        if (facilityStorageSupportsHarvestTab) {
          orderMap['facility:harvest'] = orderIndex;
          orderIndex += 1;
        }
        if (facilityStorageSupportsFacilityCoolingTab) {
          orderMap['facility:cooling'] = orderIndex;
          orderIndex += 1;
        }
        orderMap['facility:sorting'] = orderIndex;
        orderIndex += 1;
        orderMap['facility:workbench'] = orderIndex;
        orderIndex += 1;
        return;
      }
      orderMap[normalizedKey] = orderIndex;
      orderIndex += 1;
    });
    return orderMap;
  }, [facilityStorageSupportsFacilityCoolingTab, facilityStorageSupportsHarvestPalletSlots, facilityStorageSupportsHarvestTab, facilityStorageTabs]);

  const panelClassName = useMemo(
    () => `focus-tab-panel warehouse-storage-tab-panel warehouse-storage-tab-panel--card-grid ${facilityStorageTab === 'facility' ? 'warehouse-storage-tab-panel--facility' : ''} ${facilityStoragePanelSlideArmed ? `focus-tab-panel--enter-${facilityStoragePanelSlideDirection}` : ''}`.trim(),
    [facilityStoragePanelSlideArmed, facilityStoragePanelSlideDirection, facilityStorageTab]
  );

  return {
    primaryTabs,
    rowsView,
    harvestTabs,
    facilityTabs,
    viewKey,
    viewOrderMap,
    panelClassName
  };
}

export function useWarehouseStorageVisibleRows({
  facilityStorageTab,
  facilityStorageFacilityTab,
  facilityStorageHarvestTab,
  facilityStorageSupportsHarvestPalletSlots,
  facilityStorageRowsView,
  facilityStorageHarvestGeneralRows,
  appleSortingFacilityKeys
}) {
  return useMemo(() => {
    return warehouseVisibleRowsOf({
      facilityStorageTab,
      facilityStorageFacilityTab,
      facilityStorageHarvestTab,
      facilityStorageSupportsHarvestPalletSlots,
      facilityStorageRowsView,
      facilityStorageHarvestGeneralRows,
      appleSortingFacilityKeys
    });
  }, [
    appleSortingFacilityKeys,
    facilityStorageFacilityTab,
    facilityStorageHarvestGeneralRows,
    facilityStorageHarvestTab,
    facilityStorageSupportsHarvestPalletSlots,
    facilityStorageRowsView,
    facilityStorageTab
  ]);
}

export function useWarehouseStorageInOutRules({
  normalizeHarvestGradeLabel,
  processGradeLabel,
  sortingMixedOutputRule,
  sortingOutputRuleOptions,
  sortingOutputGradeLabels,
  workbenchMixedOutputRule,
}) {
  const normalizeWorkbenchInOutSlotNoList = useCallback((value) => {
    const rawList = Array.isArray(value)
      ? value
      : (Number(value) > 0 ? [value] : []);
    const nextList = [];
    rawList.forEach((slotNoRaw) => {
      const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
      if (slotNo > 0 && !nextList.includes(slotNo)) nextList.push(slotNo);
    });
    return nextList;
  }, []);

  const normalizeSortingInOutSlotNoList = normalizeWorkbenchInOutSlotNoList;

  const sanitizeFacilityInOutSelectionMap = useCallback((
    valueRaw,
    normalizeSlotNoList,
    normalizeOutputRuleMap = null
  ) => {
    const source = valueRaw && typeof valueRaw === 'object' ? valueRaw : {};
    let changed = false;
    const next = Object.entries(source).reduce((facilityAcc, [facilityKey, entryMapRaw]) => {
      const entryMap = entryMapRaw && typeof entryMapRaw === 'object' ? entryMapRaw : {};
      const nextEntryMap = Object.entries(entryMap).reduce((entryAcc, [entryKey, selectionRaw]) => {
        const selection = selectionRaw && typeof selectionRaw === 'object' ? selectionRaw : {};
        const normalizedInputSlotNos = normalizeSlotNoList(selection?.inputSlotNos ?? selection?.inputSlotNo);
        const normalizedOutputSlotNos = normalizeSlotNoList(selection?.outputSlotNos ?? selection?.outputSlotNo);
        const nextSelection = {
          ...selection,
          inputSlotNos: normalizedInputSlotNos,
          outputSlotNos: normalizedOutputSlotNos,
        };
        const hadLegacyInputSlotNo = Object.prototype.hasOwnProperty.call(nextSelection, 'inputSlotNo');
        const hadLegacyOutputSlotNo = Object.prototype.hasOwnProperty.call(nextSelection, 'outputSlotNo');
        if (hadLegacyInputSlotNo) delete nextSelection.inputSlotNo;
        if (hadLegacyOutputSlotNo) delete nextSelection.outputSlotNo;
        if (hadLegacyInputSlotNo || hadLegacyOutputSlotNo) changed = true;
        const currentInputSlotNos = Array.isArray(selection?.inputSlotNos)
          ? normalizeSlotNoList(selection.inputSlotNos)
          : [];
        const currentOutputSlotNos = Array.isArray(selection?.outputSlotNos)
          ? normalizeSlotNoList(selection.outputSlotNos)
          : [];
        if (
          currentInputSlotNos.length !== normalizedInputSlotNos.length
          || currentInputSlotNos.some((slotNo, index) => slotNo !== normalizedInputSlotNos[index])
        ) {
          changed = true;
        }
        if (
          currentOutputSlotNos.length !== normalizedOutputSlotNos.length
          || currentOutputSlotNos.some((slotNo, index) => slotNo !== normalizedOutputSlotNos[index])
        ) {
          changed = true;
        }
        if (typeof normalizeOutputRuleMap === 'function') {
          const normalizedOutputRulesBySlotNo = normalizeOutputRuleMap(
            selection?.outputRulesBySlotNo ?? selection?.outputAssignmentsBySlotNo
          );
          const currentOutputRulesBySlotNo = normalizeOutputRuleMap(selection?.outputRulesBySlotNo);
          nextSelection.outputRulesBySlotNo = normalizedOutputRulesBySlotNo;
          if (Object.prototype.hasOwnProperty.call(nextSelection, 'outputAssignmentsBySlotNo')) {
            delete nextSelection.outputAssignmentsBySlotNo;
            changed = true;
          }
          if (JSON.stringify(currentOutputRulesBySlotNo) !== JSON.stringify(normalizedOutputRulesBySlotNo)) {
            changed = true;
          }
        }
        entryAcc[entryKey] = nextSelection;
        return entryAcc;
      }, {});
      facilityAcc[facilityKey] = nextEntryMap;
      return facilityAcc;
    }, {});
    return { changed, next };
  }, []);

  const normalizeSortingOutputRule = useCallback((ruleRaw) => {
    const ruleType = String(ruleRaw?.ruleType || '').trim();
    if (ruleType === 'mixed') {
      return {
        ...sortingMixedOutputRule,
      };
    }
    const gradeLabel = normalizeHarvestGradeLabel(ruleRaw?.gradeLabel);
    const dieKey = String(ruleRaw?.dieKey || '').trim();
    const sizeLabel = String(ruleRaw?.sizeLabel || '').trim();
    const matchedRule = sortingOutputRuleOptions.find((rule) => (
      normalizeHarvestGradeLabel(rule?.gradeLabel) === gradeLabel
      && String(rule?.dieKey || '') === dieKey
    ));
    if (!matchedRule) return null;
    return {
      gradeLabel: matchedRule.gradeLabel,
      dieKey: matchedRule.dieKey,
      sizeLabel: sizeLabel || matchedRule.sizeLabel,
    };
  }, [normalizeHarvestGradeLabel, sortingMixedOutputRule, sortingOutputRuleOptions]);

  const normalizeSortingOutputRuleMap = useCallback((valueRaw) => {
    const source = valueRaw && typeof valueRaw === 'object' ? valueRaw : {};
    return Object.entries(source).reduce((acc, [slotNoRaw, ruleRaw]) => {
      const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
      const normalizedRule = normalizeSortingOutputRule(ruleRaw);
      if (slotNo > 0 && normalizedRule) {
        acc[slotNo] = normalizedRule;
      }
      return acc;
    }, {});
  }, [normalizeSortingOutputRule]);

  const sortingOutputRuleLabelOf = useCallback((ruleRaw) => {
    const rule = normalizeSortingOutputRule(ruleRaw);
    if (!rule) return '';
    if (String(rule.ruleType || '') === 'mixed') return '혼합배출칸';
    return `${normalizeHarvestGradeLabel(rule.gradeLabel)} ${String(rule.sizeLabel || '').trim()}`.trim();
  }, [normalizeHarvestGradeLabel, normalizeSortingOutputRule]);

  const sortingOutputRuleKeyOf = useCallback((ruleRaw) => {
    const rule = normalizeSortingOutputRule(ruleRaw);
    if (!rule || String(rule.ruleType || '') === 'mixed') return '';
    const gradeLabel = normalizeHarvestGradeLabel(rule.gradeLabel);
    const dieKey = String(rule.dieKey || '').trim();
    if (!gradeLabel || !dieKey) return '';
    return `${gradeLabel}:${dieKey}`;
  }, [normalizeHarvestGradeLabel, normalizeSortingOutputRule]);

  const sortingOutputRuleLabelFromKey = useCallback((ruleKeyRaw) => {
    const ruleKey = String(ruleKeyRaw || '').trim();
    if (!ruleKey) return '';
    const [gradeLabelRaw = '', dieKeyRaw = ''] = ruleKey.split(':');
    const gradeLabel = normalizeHarvestGradeLabel(gradeLabelRaw);
    const dieKey = String(dieKeyRaw || '').trim();
    const matchedRule = sortingOutputRuleOptions.find((rule) => (
      normalizeHarvestGradeLabel(rule?.gradeLabel) === gradeLabel
      && String(rule?.dieKey || '').trim() === dieKey
    ));
    if (!matchedRule) return `${gradeLabel} ${dieKey}`.trim();
    return `${normalizeHarvestGradeLabel(matchedRule.gradeLabel)} ${String(matchedRule.sizeLabel || '').trim()}`.trim();
  }, [normalizeHarvestGradeLabel, sortingOutputRuleOptions]);

  const sortingMissingRuleMessageOf = useCallback((missingRuleKeysRaw = []) => {
    const missingRuleLabels = Array.from(new Set(
      (Array.isArray(missingRuleKeysRaw) ? missingRuleKeysRaw : [])
        .map((ruleKey) => sortingOutputRuleLabelFromKey(ruleKey))
        .filter(Boolean)
    ));
    if (!missingRuleLabels.length) return '혼합배출칸이 필요합니다.';
    return `다음 배출 자리가 필요합니다. (${missingRuleLabels.join(', ')}) 또는 혼합배출칸이 필요합니다.`;
  }, [sortingOutputRuleLabelFromKey]);

  const buildRequiredSortingRuleKeys = useCallback((entriesRaw = []) => {
    const entries = Array.isArray(entriesRaw) ? entriesRaw : [];
    if (!entries.length) return [];
    const hasUnclassified = entries.some(({ batch }) => {
      const gradeLabel = normalizeHarvestGradeLabel(batch?.gradeLabel);
      return !gradeLabel || gradeLabel === '미선별';
    });
    const requiredGradeLabels = hasUnclassified
      ? [...sortingOutputGradeLabels]
      : sortingOutputGradeLabels.filter((gradeLabel) => (
        entries.some(({ batch }) => normalizeHarvestGradeLabel(batch?.gradeLabel) === gradeLabel)
      ));
    const requiredKeySet = new Set(
      sortingOutputRuleOptions
        .filter((rule) => requiredGradeLabels.includes(normalizeHarvestGradeLabel(rule?.gradeLabel)))
        .map((rule) => sortingOutputRuleKeyOf(rule))
        .filter(Boolean)
    );
    return Array.from(requiredKeySet);
  }, [normalizeHarvestGradeLabel, sortingOutputGradeLabels, sortingOutputRuleKeyOf, sortingOutputRuleOptions]);

  const normalizeWorkbenchOutputRule = useCallback((ruleRaw) => {
    const ruleType = String(ruleRaw?.ruleType || '').trim();
    if (ruleType === 'mixed') {
      return {
        ...workbenchMixedOutputRule,
      };
    }
    const gradeLabel = normalizeHarvestGradeLabel(ruleRaw?.gradeLabel);
    if (!gradeLabel || !['A급', 'B급', processGradeLabel].includes(gradeLabel)) return null;
    return {
      ruleType: 'grade',
      gradeLabel,
    };
  }, [normalizeHarvestGradeLabel, processGradeLabel, workbenchMixedOutputRule]);

  const normalizeWorkbenchOutputRuleMap = useCallback((valueRaw) => {
    const source = valueRaw && typeof valueRaw === 'object' ? valueRaw : {};
    return Object.entries(source).reduce((acc, [slotNoRaw, ruleRaw]) => {
      const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
      const normalizedRule = normalizeWorkbenchOutputRule(ruleRaw);
      if (slotNo > 0 && normalizedRule) {
        acc[slotNo] = normalizedRule;
      }
      return acc;
    }, {});
  }, [normalizeWorkbenchOutputRule]);

  const workbenchOutputRuleLabelOf = useCallback((ruleRaw) => {
    const rule = normalizeWorkbenchOutputRule(ruleRaw);
    if (!rule) return '';
    if (String(rule.ruleType || '') === 'mixed') return '혼합배출칸';
    return normalizeHarvestGradeLabel(rule.gradeLabel);
  }, [normalizeHarvestGradeLabel, normalizeWorkbenchOutputRule]);

  return {
    normalizeWorkbenchInOutSlotNoList,
    normalizeSortingInOutSlotNoList,
    sanitizeFacilityInOutSelectionMap,
    normalizeSortingOutputRule,
    normalizeSortingOutputRuleMap,
    sortingOutputRuleLabelOf,
    sortingOutputRuleKeyOf,
    sortingOutputRuleLabelFromKey,
    sortingMissingRuleMessageOf,
    buildRequiredSortingRuleKeys,
    normalizeWorkbenchOutputRule,
    normalizeWorkbenchOutputRuleMap,
    workbenchOutputRuleLabelOf,
  };
}

export function useWarehouseStorageInOutSelectionSanitizer({
  facilityStorageHarvestSlotRows,
  activeFacilityStorageKey,
  normalizeWorkbenchInOutSlotNoList,
  normalizeSortingInOutSlotNoList,
  normalizeWorkbenchOutputRuleMap,
  normalizeSortingOutputRuleMap,
  sanitizeFacilityInOutSelectionMap,
  setFacilityStorageWorkbenchInOutSelectionByFacility,
  setFacilityStorageSortingInOutSelectionByFacility,
}) {
  const facilityStorageHarvestTopLayerSlotNoSet = useMemo(
    () => new Set(
      (Array.isArray(facilityStorageHarvestSlotRows) ? facilityStorageHarvestSlotRows : [])
        .filter((slot) => Boolean(slot?.hasTopLayer))
        .map((slot) => Math.max(0, Math.floor(Number(slot?.slotNo || slot?.storageSlotNo || 0) || 0)))
        .filter((slotNo) => slotNo > 0)
    ),
    [facilityStorageHarvestSlotRows]
  );

  useEffect(() => {
    setFacilityStorageSortingInOutSelectionByFacility((prev) => {
      const { changed, next } = sanitizeFacilityInOutSelectionMap(
        prev,
        normalizeSortingInOutSlotNoList,
        normalizeSortingOutputRuleMap
      );
      return changed ? next : prev;
    });
  }, [
    normalizeSortingInOutSlotNoList,
    normalizeSortingOutputRuleMap,
    sanitizeFacilityInOutSelectionMap,
    setFacilityStorageSortingInOutSelectionByFacility,
  ]);

  useEffect(() => {
    setFacilityStorageWorkbenchInOutSelectionByFacility((prev) => {
      const { changed, next } = sanitizeFacilityInOutSelectionMap(
        prev,
        normalizeWorkbenchInOutSlotNoList,
        normalizeWorkbenchOutputRuleMap
      );
      return changed ? next : prev;
    });
  }, [
    normalizeWorkbenchInOutSlotNoList,
    normalizeWorkbenchOutputRuleMap,
    sanitizeFacilityInOutSelectionMap,
    setFacilityStorageWorkbenchInOutSelectionByFacility,
  ]);

  useEffect(() => {
    const facilityKey = String(activeFacilityStorageKey || '');
    if (!facilityKey || facilityStorageHarvestTopLayerSlotNoSet.size <= 0) return;
    setFacilityStorageWorkbenchInOutSelectionByFacility((prev) => {
      const next = { ...(prev || {}) };
      const currentFacilitySelection = next?.[facilityKey];
      if (!currentFacilitySelection || typeof currentFacilitySelection !== 'object') return prev;
      let changed = false;
      const nextFacilitySelection = Object.entries(currentFacilitySelection).reduce((acc, [workbenchSlotKey, selectionRaw]) => {
        const selection = selectionRaw || {};
        const inputSlotNos = normalizeWorkbenchInOutSlotNoList(
          selection?.inputSlotNos ?? selection?.inputSlotNo
        );
        const outputSlotNos = normalizeWorkbenchInOutSlotNoList(
          selection?.outputSlotNos ?? selection?.outputSlotNo
        );
        const outputRulesBySlotNo = normalizeWorkbenchOutputRuleMap(
          selection?.outputRulesBySlotNo ?? selection?.outputAssignmentsBySlotNo
        );
        const sanitizedInputSlotNos = inputSlotNos.filter((slotNo) => !facilityStorageHarvestTopLayerSlotNoSet.has(slotNo));
        const sanitizedOutputSlotNos = outputSlotNos.filter((slotNo) => !facilityStorageHarvestTopLayerSlotNoSet.has(slotNo));
        const sanitizedOutputRulesBySlotNo = Object.fromEntries(
          Object.entries(outputRulesBySlotNo).filter(([slotNoRaw]) => sanitizedOutputSlotNos.includes(Math.max(0, Math.floor(Number(slotNoRaw) || 0))))
        );
        if (sanitizedInputSlotNos.length !== inputSlotNos.length) changed = true;
        if (sanitizedOutputSlotNos.length !== outputSlotNos.length) changed = true;
        if (Object.keys(sanitizedOutputRulesBySlotNo).length !== Object.keys(outputRulesBySlotNo).length) changed = true;
        if (sanitizedInputSlotNos.length > 0 || sanitizedOutputSlotNos.length > 0) {
          acc[workbenchSlotKey] = {
            inputSlotNos: sanitizedInputSlotNos,
            outputSlotNos: sanitizedOutputSlotNos,
            outputRulesBySlotNo: sanitizedOutputRulesBySlotNo,
          };
        } else {
          changed = true;
        }
        return acc;
      }, {});
      if (!changed) return prev;
      if (Object.keys(nextFacilitySelection).length > 0) {
        next[facilityKey] = nextFacilitySelection;
      } else {
        delete next[facilityKey];
      }
      return next;
    });
  }, [
    activeFacilityStorageKey,
    facilityStorageHarvestTopLayerSlotNoSet,
    normalizeWorkbenchInOutSlotNoList,
    normalizeWorkbenchOutputRuleMap,
    setFacilityStorageWorkbenchInOutSelectionByFacility,
  ]);

  useEffect(() => {
    const facilityKey = String(activeFacilityStorageKey || '');
    if (!facilityKey || facilityStorageHarvestTopLayerSlotNoSet.size <= 0) return;
    setFacilityStorageSortingInOutSelectionByFacility((prev) => {
      const next = { ...(prev || {}) };
      const currentFacilitySelection = next?.[facilityKey];
      if (!currentFacilitySelection || typeof currentFacilitySelection !== 'object') return prev;
      let changed = false;
      const nextFacilitySelection = Object.entries(currentFacilitySelection).reduce((acc, [equipmentStorageKey, selectionRaw]) => {
        const selection = selectionRaw || {};
        const inputSlotNos = normalizeSortingInOutSlotNoList(
          selection?.inputSlotNos ?? selection?.inputSlotNo
        );
        const outputSlotNos = normalizeSortingInOutSlotNoList(
          selection?.outputSlotNos ?? selection?.outputSlotNo
        );
        const outputRulesBySlotNo = normalizeSortingOutputRuleMap(
          selection?.outputRulesBySlotNo ?? selection?.outputAssignmentsBySlotNo
        );
        const sanitizedInputSlotNos = inputSlotNos.filter((slotNo) => !facilityStorageHarvestTopLayerSlotNoSet.has(slotNo));
        const sanitizedOutputSlotNos = outputSlotNos.filter((slotNo) => !facilityStorageHarvestTopLayerSlotNoSet.has(slotNo));
        const sanitizedOutputRulesBySlotNo = Object.fromEntries(
          Object.entries(outputRulesBySlotNo).filter(([slotNoRaw]) => sanitizedOutputSlotNos.includes(Math.max(0, Math.floor(Number(slotNoRaw) || 0))))
        );
        if (sanitizedInputSlotNos.length !== inputSlotNos.length) changed = true;
        if (sanitizedOutputSlotNos.length !== outputSlotNos.length) changed = true;
        if (Object.keys(sanitizedOutputRulesBySlotNo).length !== Object.keys(outputRulesBySlotNo).length) changed = true;
        if (sanitizedInputSlotNos.length > 0 || sanitizedOutputSlotNos.length > 0) {
          acc[equipmentStorageKey] = {
            inputSlotNos: sanitizedInputSlotNos,
            outputSlotNos: sanitizedOutputSlotNos,
            outputRulesBySlotNo: sanitizedOutputRulesBySlotNo,
          };
        } else {
          changed = true;
        }
        return acc;
      }, {});
      if (!changed) return prev;
      if (Object.keys(nextFacilitySelection).length > 0) {
        next[facilityKey] = nextFacilitySelection;
      } else {
        delete next[facilityKey];
      }
      return next;
    });
  }, [
    activeFacilityStorageKey,
    facilityStorageHarvestTopLayerSlotNoSet,
    normalizeSortingInOutSlotNoList,
    normalizeSortingOutputRuleMap,
    setFacilityStorageSortingInOutSelectionByFacility,
  ]);

  return {
    facilityStorageHarvestTopLayerSlotNoSet,
  };
}

export function useWarehouseHarvestMoveViewState(picker) {
  const viewKey = 'warehouse';

  const warehouseSubTabKey = useMemo(() => {
    const warehouseSubTab = String(picker?.warehouseSubTab || 'storage');
    if (warehouseSubTab === 'general') return 'storage';
    if (warehouseSubTab === 'sorting') return 'sorting';
    if (warehouseSubTab === 'workbench') return 'workbench';
    return 'storage';
  }, [picker?.warehouseSubTab]);

  const warehouseContentKey = useMemo(
    () => `${warehouseSubTabKey}:${String(picker?.targetFacilityKey || '')}`,
    [picker?.targetFacilityKey, warehouseSubTabKey]
  );

  return {
    viewKey,
    warehouseSubTabKey,
    warehouseContentKey
  };
}

export function useWarehouseStorageCoolingSlots({
  activeFacilityStorageKey,
  facilityStorageFacilityTab,
  selectedField,
  clampFn,
  fieldFacilityDurabilityOf,
  durabilityToneClass,
  coolingOutdoorSlotCountOfFacilityKey,
  coolingBlowerSlotCountOfFacilityKey,
  coolingOutdoorEquipmentCostOfFacilityKey,
  coolingBlowerEquipmentCostOfFacilityKey,
  panelCoolingOutdoorImage,
  coldStorageOutdoorImage,
  panelCoolingBlowerImage,
  coldStorageBlowerImage,
  fieldFacilityCountOf,
  won,
}) {
  return useMemo(() => {
    const isOutdoorTab = facilityStorageFacilityTab === 'coolingOutdoor';
    const isPanelCoolingFacility = String(activeFacilityStorageKey || '').startsWith('panelWarehouse');
    const facilityDurability = clampFn(
      fieldFacilityDurabilityOf(selectedField, activeFacilityStorageKey),
      0,
      100
    );
    const durabilityClassName = durabilityToneClass(facilityDurability);
    const slotCount = isOutdoorTab
      ? coolingOutdoorSlotCountOfFacilityKey(activeFacilityStorageKey)
      : coolingBlowerSlotCountOfFacilityKey(activeFacilityStorageKey);
    const slotLabelPrefix = isOutdoorTab ? '실외기칸' : '냉풍기칸';
    const slotTitlePrefix = isOutdoorTab ? '실외기' : '냉풍기';
    const slotCost = isOutdoorTab
      ? coolingOutdoorEquipmentCostOfFacilityKey(activeFacilityStorageKey)
      : coolingBlowerEquipmentCostOfFacilityKey(activeFacilityStorageKey);
    const slotImageSrc = isOutdoorTab
      ? (isPanelCoolingFacility ? panelCoolingOutdoorImage : coldStorageOutdoorImage)
      : (isPanelCoolingFacility ? panelCoolingBlowerImage : coldStorageBlowerImage);
    const facilityCount = Math.max(0, fieldFacilityCountOf(selectedField, activeFacilityStorageKey));
    return Array.from({ length: slotCount }, (_, index) => ({
      key: `${isOutdoorTab ? 'cooling-outdoor' : 'cooling-blower'}-slot-${index + 1}`,
      label: `${slotLabelPrefix} ${index + 1}`,
      title: `${slotTitlePrefix} ${index + 1}`,
      summary: `${Math.max(1, facilityCount)}동 기준`,
      imageSrc: slotImageSrc,
      costText: won(slotCost),
      durabilityPct: facilityDurability,
      durabilityClassName
    }));
  }, [
    activeFacilityStorageKey,
    clampFn,
    coldStorageBlowerImage,
    coldStorageOutdoorImage,
    coolingBlowerEquipmentCostOfFacilityKey,
    coolingBlowerSlotCountOfFacilityKey,
    coolingOutdoorEquipmentCostOfFacilityKey,
    coolingOutdoorSlotCountOfFacilityKey,
    durabilityToneClass,
    facilityStorageFacilityTab,
    fieldFacilityCountOf,
    fieldFacilityDurabilityOf,
    panelCoolingBlowerImage,
    panelCoolingOutdoorImage,
    selectedField,
    won,
  ]);
}

export function useWarehouseWorkbenchDerived({
  activeFacilityStorageKey,
  selectedField,
  facilityStorageWorkbenchWorkerByFacility,
  gameLabor,
  harvestWorkerRosterByType,
  workbenchSlotCountOfFacility,
  workbenchInstalledEntriesOfField,
  normalizeWorkbenchCargoSlotLabel,
  roundLabor,
}) {
  const facilityStorageWorkbenchSlots = useMemo(() => {
    const slotCount = workbenchSlotCountOfFacility(selectedField, activeFacilityStorageKey);
    const installedEntries = workbenchInstalledEntriesOfField(selectedField, activeFacilityStorageKey, slotCount);
    return Array.from({ length: slotCount }, (_, index) => ({
      key: `workbench-slot-${index + 1}`,
      label: `작업칸 ${index + 1}`,
      installedTable: installedEntries[index] || null
    }));
  }, [activeFacilityStorageKey, selectedField, workbenchInstalledEntriesOfField, workbenchSlotCountOfFacility]);

  const resolveWorkbenchAssignmentCurrentLabor = useCallback((assignment) => {
    const workerType = String(assignment?.workerType || '');
    const workerId = String(assignment?.workerId || '');
    if (workerType === 'self') {
      return roundLabor(Math.max(0, Number(gameLabor) || 0));
    }
    if (workerType === 'external' && workerId) {
      const worker = Object.values(harvestWorkerRosterByType || {})
        .flat()
        .find((entry) => String(entry?.id || '') === workerId);
      return roundLabor(Math.max(0, Number(worker?.labor) || 0));
    }
    return roundLabor(Math.max(0, Number(assignment?.workerLabor) || 0));
  }, [gameLabor, harvestWorkerRosterByType, roundLabor]);

  const facilityStorageWorkbenchStaffPlanOf = useCallback((installedTable, workbenchSlotKeyRaw = '', facilityKeyRaw = '') => {
    const maxWorkers = Math.max(0, Math.floor(Number(installedTable?.maxWorkers) || 0));
    const roleLabels = Array.isArray(installedTable?.roleLabels) ? installedTable.roleLabels : [];
    const workbenchSlotKey = String(workbenchSlotKeyRaw || '');
    const facilityKey = String(facilityKeyRaw || '');
    return Array.from({ length: maxWorkers }, (_, index) => ({
      key: `${String(installedTable?.tableKey || 'workbench')}-worker-slot-${index + 1}`,
      label: String(roleLabels[index] || `투입칸 ${index + 1}`),
      assignment: (() => {
        const assignment = facilityStorageWorkbenchWorkerByFacility?.[facilityKey]?.[workbenchSlotKey]?.[`${String(installedTable?.tableKey || 'workbench')}-worker-slot-${index + 1}`] || null;
        return assignment
          ? {
            ...assignment,
            workerLabor: resolveWorkbenchAssignmentCurrentLabor(assignment),
          }
          : null;
      })(),
      status: '투입 가능'
    }));
  }, [facilityStorageWorkbenchWorkerByFacility, resolveWorkbenchAssignmentCurrentLabor]);

  const facilityStorageWorkbenchCargoPlanOf = useCallback((installedTable) => {
    const cargoSlotCount = Math.max(0, Math.floor(Number(installedTable?.cargoSlotCount) || 0));
    const cargoSlotLabels = Array.isArray(installedTable?.cargoSlotLabels) ? installedTable.cargoSlotLabels : [];
    return Array.from({ length: cargoSlotCount }, (_, index) => ({
      key: `${String(installedTable?.tableKey || 'workbench')}-cargo-slot-${index + 1}`,
      label: normalizeWorkbenchCargoSlotLabel(cargoSlotLabels[index], index)
    }));
  }, [normalizeWorkbenchCargoSlotLabel]);

  return {
    facilityStorageWorkbenchSlots,
    resolveWorkbenchAssignmentCurrentLabor,
    facilityStorageWorkbenchStaffPlanOf,
    facilityStorageWorkbenchCargoPlanOf,
  };
}

export function useWarehouseWorkbenchTaskContext({
  facilityStorageWorkbenchTaskByFacility,
  facilityStorageWorkbenchBoxSelectionByFacility,
  facilityStorageWorkbenchInOutSelectionByFacility,
  normalizeWorkbenchInOutSlotNoList,
  normalizeHarvestGradeLabel,
  normalizeHarvestStemRemoved,
  normalizedHarvestLoadBoxKey,
  resolveProcessableWorkbenchPlan,
  resolveWorkbenchAssignedWorkerEntries,
  roundLabor,
  workbenchLaborCostPerBoxOf,
}) {
  return useCallback((gameState, facilityKeyRaw, workbenchSlotKeyRaw) => {
    const gameStorage = Array.isArray(gameState?.storage) ? gameState.storage : [];
    const facilityKey = String(facilityKeyRaw || '');
    const workbenchSlotKey = String(workbenchSlotKeyRaw || '');
    const selectedTaskKey = String(
      facilityStorageWorkbenchTaskByFacility?.[facilityKey]?.[workbenchSlotKey] || ''
    );
    const selectedBoxSelectionIds = Array.isArray(facilityStorageWorkbenchBoxSelectionByFacility?.[facilityKey]?.[workbenchSlotKey])
      ? facilityStorageWorkbenchBoxSelectionByFacility[facilityKey][workbenchSlotKey]
      : [];
    const selectedOutputLoadBoxKey = String(selectedBoxSelectionIds[0]?.split(':')?.[0] || '').trim();
    const currentSelection = facilityStorageWorkbenchInOutSelectionByFacility?.[facilityKey]?.[workbenchSlotKey] || null;
    const inputSlotNos = normalizeWorkbenchInOutSlotNoList(
      currentSelection?.inputSlotNos ?? currentSelection?.inputSlotNo
    );
    const outputSlotNos = normalizeWorkbenchInOutSlotNoList(
      currentSelection?.outputSlotNos ?? currentSelection?.outputSlotNo
    );
    const inputSlotOrder = new Map(inputSlotNos.map((slotNo, index) => ([slotNo, index])));
    const onlyStemAttachedInputs = selectedTaskKey !== 'partialSortOnly';
    const excludesSortedInputs = ['partialSortOnly', 'stemRemovalPartialSort'].includes(selectedTaskKey);
    const selectedSourceEntriesRaw = gameStorage
      .map((batch, index) => ({ batch, index }))
      .filter(({ batch }) => {
        if (!batch) return false;
        if (String(batch?.storageFacilityKey || '') !== facilityKey) return false;
        if (String(batch?.storageVehicleInstanceId || '')) return false;
        if (String(batch?.storageSortingEquipmentKey || '') || String(batch?.storageWorkbenchSlotKey || '')) return false;
        const slotNo = Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0));
        if (!inputSlotOrder.has(slotNo)) return false;
        if (batch?.palletized) {
          const layerNo = Math.max(1, Math.min(2, Math.floor(Number(batch?.storagePalletLayer || 1) || 1)));
          if (layerNo !== 1) return false;
        }
        if (excludesSortedInputs) {
          const gradeLabel = normalizeHarvestGradeLabel(batch?.gradeLabel, '미선별') || '미선별';
          if (gradeLabel !== '미선별') return false;
        }
        return onlyStemAttachedInputs
          ? normalizeHarvestStemRemoved(batch?.stemRemoved) === false
          : true;
      })
      .sort((a, b) => {
        const slotDiff = (inputSlotOrder.get(Math.max(0, Math.floor(Number(a.batch?.storagePalletSlotNo || a.batch?.storagePalletNo) || 0))) || 0)
          - (inputSlotOrder.get(Math.max(0, Math.floor(Number(b.batch?.storagePalletSlotNo || b.batch?.storagePalletNo) || 0))) || 0);
        if (slotDiff !== 0) return slotDiff;
        const visualDiff = Math.max(0, Math.floor(Number(a.batch?.storageBoxVisualSlotNo) || 0))
          - Math.max(0, Math.floor(Number(b.batch?.storageBoxVisualSlotNo) || 0));
        if (visualDiff !== 0) return visualDiff;
        return Math.max(0, Math.floor(Number(a.batch?.storageBoxUnitNo) || 0))
          - Math.max(0, Math.floor(Number(b.batch?.storageBoxUnitNo) || 0));
      })
      .slice(0, 6);
    const processablePlan = resolveProcessableWorkbenchPlan({
      storage: gameStorage,
      facilityKey,
      selectedTaskKey,
      selectedSourceEntries: selectedSourceEntriesRaw,
      selectedOutputLoadBoxKey,
      outputSlotNos,
    });
    const selectedSourceEntries = processablePlan.processableEntries;
    const outputPieces = processablePlan.outputPieces;
    const requiredAdditionalBoxCountsByItemKey = outputPieces.reduce((acc, { loadBoxKey }) => {
      const itemKey = normalizedHarvestLoadBoxKey(loadBoxKey) || 'appleContainerYellow20kg';
      acc[itemKey] = Math.max(0, Number(acc[itemKey]) || 0) + 1;
      return acc;
    }, {});
    Object.entries(requiredAdditionalBoxCountsByItemKey).forEach(([itemKeyRaw, outputCountRaw]) => {
      const itemKey = normalizedHarvestLoadBoxKey(itemKeyRaw) || 'appleContainerYellow20kg';
      const outputCount = Math.max(0, Number(outputCountRaw) || 0);
      const sourceCount = selectedSourceEntries.reduce((sum, { batch }) => {
        const sourceItemKey = normalizedHarvestLoadBoxKey(batch?.loadBoxKey) || 'appleContainerYellow20kg';
        return sum + (sourceItemKey === itemKey ? 1 : 0);
      }, 0);
      requiredAdditionalBoxCountsByItemKey[itemKey] = Math.max(0, outputCount - sourceCount);
    });
    const normalizedSelectedBoxItemKey = normalizedHarvestLoadBoxKey(selectedOutputLoadBoxKey) || '';
    const selectedBoxRequiredCount = normalizedSelectedBoxItemKey
      ? Math.max(0, Number(requiredAdditionalBoxCountsByItemKey?.[normalizedSelectedBoxItemKey] || 0))
      : 0;
    const assignedWorkerEntries = resolveWorkbenchAssignedWorkerEntries(gameState, facilityKey, workbenchSlotKey);
    const assignedWorkerCount = Math.max(0, assignedWorkerEntries.length);
    const totalAssignedLabor = roundLabor(assignedWorkerEntries.reduce((sum, entry) => sum + Math.max(0, Number(entry?.actualLabor) || 0), 0));
    const laborCostPerBox = assignedWorkerCount > 0
      ? workbenchLaborCostPerBoxOf(selectedTaskKey, assignedWorkerCount)
      : 0;
    const totalLaborCost = assignedWorkerCount > 0
      ? roundLabor(selectedSourceEntries.length * laborCostPerBox)
      : 0;
    return {
      selectedTaskKey,
      selectedOutputLoadBoxKey,
      inputSlotNos,
      outputSlotNos,
      candidateSourceEntryCount: selectedSourceEntriesRaw.length,
      selectedSourceEntries,
      processableBoxCount: selectedSourceEntries.length,
      outputPieces,
      allocatedTargets: processablePlan.allocatedTargets,
      requiredAdditionalBoxCountsByItemKey,
      selectedBoxRequiredCount,
      assignedWorkerEntries,
      assignedWorkerCount,
      totalAssignedLabor,
      laborCostPerBox,
      totalLaborCost,
    };
  }, [
    facilityStorageWorkbenchBoxSelectionByFacility,
    facilityStorageWorkbenchInOutSelectionByFacility,
    facilityStorageWorkbenchTaskByFacility,
    normalizeHarvestGradeLabel,
    normalizeHarvestStemRemoved,
    normalizeWorkbenchInOutSlotNoList,
    normalizedHarvestLoadBoxKey,
    resolveProcessableWorkbenchPlan,
    resolveWorkbenchAssignedWorkerEntries,
    roundLabor,
    workbenchLaborCostPerBoxOf,
  ]);
}

export function useWarehouseWorkbenchStartState({
  activeFacilityStorageKey,
  selectedFieldFacilityInventoryState,
  facilityStorageWorkbenchSlots,
  game,
  appleContainerLabelOf,
  laborText,
  normalizeCargoByItemKey,
  normalizedHarvestLoadBoxKey,
  resolveWorkbenchTaskContext,
}) {
  return useMemo(() => {
    const facilityKey = String(activeFacilityStorageKey || '');
    if (!facilityKey) return {};
    const inventoryMap = normalizeCargoByItemKey(selectedFieldFacilityInventoryState?.byFacility?.[facilityKey] || {});
    return (Array.isArray(facilityStorageWorkbenchSlots) ? facilityStorageWorkbenchSlots : []).reduce((acc, slot) => {
      const slotKey = String(slot?.key || '');
      if (!slotKey) return acc;
      const context = resolveWorkbenchTaskContext(game, facilityKey, slotKey);
      const selectedBoxItemKey = normalizedHarvestLoadBoxKey(context.selectedOutputLoadBoxKey) || '';
      const selectedBoxStockQty = selectedBoxItemKey
        ? Math.max(0, Math.floor(Number(inventoryMap?.[selectedBoxItemKey]) || 0))
        : 0;
      const hasEnoughSelectedBoxStock = !selectedBoxItemKey || context.selectedBoxRequiredCount <= selectedBoxStockQty;
      const hasAssignedWorkers = context.assignedWorkerCount > 0;
      const hasEnoughAssignedLabor = !hasAssignedWorkers || context.totalLaborCost <= context.totalAssignedLabor + 0.001;
      acc[slotKey] = {
        selectedBoxItemKey,
        selectedBoxStockQty,
        candidateSourceEntryCount: context.candidateSourceEntryCount,
        processableBoxCount: context.processableBoxCount,
        selectedBoxRequiredCount: context.selectedBoxRequiredCount,
        hasEnoughSelectedBoxStock,
        assignedWorkerCount: context.assignedWorkerCount,
        totalAssignedLabor: context.totalAssignedLabor,
        laborCostPerBox: context.laborCostPerBox,
        totalLaborCost: context.totalLaborCost,
        hasEnoughAssignedLabor,
        blockedReason: !selectedBoxItemKey
          ? '박스를 먼저 선택해야 합니다.'
          : context.candidateSourceEntryCount <= 0
            ? String(context.selectedTaskKey || '') === 'stemRemovalPartialSort'
              ? '투입칸에 꼭지제거 후 부분선별할 미선별 박스가 없습니다.'
              : String(context.selectedTaskKey || '') === 'partialSortOnly'
                ? '투입칸에 부분선별할 미선별 박스가 없습니다.'
                : '투입칸에 꼭지제거할 박스가 없습니다.'
          : context.candidateSourceEntryCount > 0 && context.processableBoxCount <= 0
            ? ['partialSortOnly', 'stemRemovalPartialSort'].includes(String(context.selectedTaskKey || ''))
              ? '부분선별 결과를 담을 배출 공간이 부족합니다. 배출칸을 더 비우거나 배출칸 수를 늘려 주세요.'
              : '작업 결과를 담을 배출 공간이 부족합니다.'
            : !hasEnoughSelectedBoxStock
              ? `${appleContainerLabelOf(selectedBoxItemKey)} 박스가 ${context.selectedBoxRequiredCount}개 필요합니다.`
            : hasAssignedWorkers && !hasEnoughAssignedLabor
              ? `배치 인원의 노동력이 부족합니다. (필요 ${laborText(context.totalLaborCost)} / 보유 ${laborText(context.totalAssignedLabor)})`
            : '',
      };
      return acc;
    }, {});
  }, [
    activeFacilityStorageKey,
    appleContainerLabelOf,
    facilityStorageWorkbenchSlots,
    game,
    laborText,
    normalizeCargoByItemKey,
    normalizedHarvestLoadBoxKey,
    resolveWorkbenchTaskContext,
    selectedFieldFacilityInventoryState,
  ]);
}

export function useWarehouseBoxPickerState({
  appleContainerItemKeys,
  appleContainerLabelOf,
  facilityStorageWorkbenchBoxPicker,
  facilityStorageSortingBoxPicker,
  facilityStorageWorkbenchBoxSelectionByFacility,
  facilityStorageSortingBoxSelectionByFacility,
  selectedFieldFacilityInventoryState,
  normalizeCargoByItemKey,
  setFacilityStorageWorkbenchBoxSelectionByFacility,
  setFacilityStorageSortingBoxSelectionByFacility,
}) {
  const workbenchBoxSelectionIdOf = useCallback(
    (optionOrKey, sourceTypeRaw = 'stock') => {
      if (optionOrKey && typeof optionOrKey === 'object') {
        const optionKey = String(optionOrKey?.key || '');
        const optionSourceType = String(optionOrKey?.sourceType || 'stock');
        return `${optionKey}:${optionSourceType}`;
      }
      return `${String(optionOrKey || '')}:${String(sourceTypeRaw || 'stock')}`;
    },
    []
  );

  const workbenchBoxPickerStockOptions = useMemo(() => {
    const facilityKey = String(facilityStorageWorkbenchBoxPicker?.facilityKey || '');
    if (!facilityKey) return [];
    const inventoryMap = normalizeCargoByItemKey(selectedFieldFacilityInventoryState?.byFacility?.[facilityKey] || {});
    return appleContainerItemKeys
      .map((itemKey) => {
        const qty = Math.max(0, Math.floor(Number(inventoryMap?.[itemKey]) || 0));
        if (qty <= 0) return null;
        return {
          key: itemKey,
          label: appleContainerLabelOf(itemKey),
          qty,
          warehouseQty: qty,
          parkedCargoQty: 0,
          appliedQty: 0,
          sourceType: 'stock',
        };
      })
      .filter(Boolean);
  }, [
    appleContainerItemKeys,
    appleContainerLabelOf,
    facilityStorageWorkbenchBoxPicker,
    normalizeCargoByItemKey,
    selectedFieldFacilityInventoryState,
  ]);

  const sortingBoxPickerStockOptions = useMemo(() => {
    const facilityKey = String(facilityStorageSortingBoxPicker?.facilityKey || '');
    if (!facilityKey) return [];
    const inventoryMap = normalizeCargoByItemKey(selectedFieldFacilityInventoryState?.byFacility?.[facilityKey] || {});
    return appleContainerItemKeys
      .map((itemKey) => {
        const qty = Math.max(0, Math.floor(Number(inventoryMap?.[itemKey]) || 0));
        if (qty <= 0) return null;
        return {
          key: itemKey,
          label: appleContainerLabelOf(itemKey),
          qty,
          warehouseQty: qty,
          parkedCargoQty: 0,
          appliedQty: 0,
          sourceType: 'stock',
        };
      })
      .filter(Boolean);
  }, [
    appleContainerItemKeys,
    appleContainerLabelOf,
    facilityStorageSortingBoxPicker,
    normalizeCargoByItemKey,
    selectedFieldFacilityInventoryState,
  ]);

  const selectedWorkbenchBoxPickerIds = useMemo(() => {
    const facilityKey = String(facilityStorageWorkbenchBoxPicker?.facilityKey || '');
    const workbenchSlotKey = String(facilityStorageWorkbenchBoxPicker?.workbenchSlotKey || '');
    if (!facilityKey || !workbenchSlotKey) return [];
    const currentIds = facilityStorageWorkbenchBoxSelectionByFacility?.[facilityKey]?.[workbenchSlotKey];
    return Array.isArray(currentIds) ? currentIds.filter(Boolean) : [];
  }, [facilityStorageWorkbenchBoxPicker, facilityStorageWorkbenchBoxSelectionByFacility]);

  const selectedSortingBoxPickerIds = useMemo(() => {
    const facilityKey = String(facilityStorageSortingBoxPicker?.facilityKey || '');
    const equipmentStorageKey = String(facilityStorageSortingBoxPicker?.equipmentStorageKey || '');
    if (!facilityKey || !equipmentStorageKey) return [];
    const currentIds = facilityStorageSortingBoxSelectionByFacility?.[facilityKey]?.[equipmentStorageKey];
    return Array.isArray(currentIds) ? currentIds.filter(Boolean) : [];
  }, [facilityStorageSortingBoxPicker, facilityStorageSortingBoxSelectionByFacility]);

  const toggleWorkbenchBoxPickerOption = useCallback((option) => {
    const facilityKey = String(facilityStorageWorkbenchBoxPicker?.facilityKey || '');
    const workbenchSlotKey = String(facilityStorageWorkbenchBoxPicker?.workbenchSlotKey || '');
    if (!facilityKey || !workbenchSlotKey) return;
    const selectionId = workbenchBoxSelectionIdOf(option);
    setFacilityStorageWorkbenchBoxSelectionByFacility((prev) => {
      const next = { ...(prev || {}) };
      const nextFacility = { ...(next[facilityKey] || {}) };
      const currentIds = Array.isArray(nextFacility?.[workbenchSlotKey]) ? nextFacility[workbenchSlotKey] : [];
      const nextIds = currentIds.includes(selectionId)
        ? currentIds.filter((id) => id !== selectionId)
        : [selectionId];
      if (nextIds.length > 0) {
        nextFacility[workbenchSlotKey] = nextIds;
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
    facilityStorageWorkbenchBoxPicker,
    setFacilityStorageWorkbenchBoxSelectionByFacility,
    workbenchBoxSelectionIdOf,
  ]);

  const toggleSortingBoxPickerOption = useCallback((option) => {
    const facilityKey = String(facilityStorageSortingBoxPicker?.facilityKey || '');
    const equipmentStorageKey = String(facilityStorageSortingBoxPicker?.equipmentStorageKey || '');
    if (!facilityKey || !equipmentStorageKey) return;
    const selectionId = workbenchBoxSelectionIdOf(option);
    setFacilityStorageSortingBoxSelectionByFacility((prev) => {
      const next = { ...(prev || {}) };
      const nextFacility = { ...(next[facilityKey] || {}) };
      const currentIds = Array.isArray(nextFacility?.[equipmentStorageKey]) ? nextFacility[equipmentStorageKey] : [];
      const nextIds = currentIds.includes(selectionId)
        ? currentIds.filter((id) => id !== selectionId)
        : [selectionId];
      if (nextIds.length > 0) {
        nextFacility[equipmentStorageKey] = nextIds;
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
    facilityStorageSortingBoxPicker,
    setFacilityStorageSortingBoxSelectionByFacility,
    workbenchBoxSelectionIdOf,
  ]);

  return {
    workbenchBoxSelectionIdOf,
    workbenchBoxPickerStockOptions,
    sortingBoxPickerStockOptions,
    selectedWorkbenchBoxPickerIds,
    selectedSortingBoxPickerIds,
    toggleWorkbenchBoxPickerOption,
    toggleSortingBoxPickerOption,
  };
}

export function useWarehouseSortingDerived({
  activeFacilityStorageKey,
  facilityStorageRowsView,
  facilityStorageRows,
  selectedField,
  appleSortingFacilityKeys,
  appleSortingFacilityKeyByPartsItemKey,
  facilityMap,
  facilities,
  supportsAppleSortingInWarehouseFacility,
  appleSortingSlotCountOfFacilityKey,
  appleSortingWarehouseFacilityKeyOfField,
  harvestPalletSlotCountOfFacility,
  storageSlotLabelOf,
}) {
  const facilityStorageSortingSlots = useMemo(() => {
    const slotCount = supportsAppleSortingInWarehouseFacility(activeFacilityStorageKey)
      ? appleSortingSlotCountOfFacilityKey(activeFacilityStorageKey)
      : 0;
    const sortingRows = facilityStorageRowsView.filter((item) => (
      appleSortingFacilityKeys.includes(String(item?.facilityKey || item?.key || ''))
    ));
    return Array.from({ length: slotCount }, (_, index) => ({
      key: `sorting-slot-${index + 1}`,
      label: `선별기칸 ${index + 1}`,
      item: sortingRows[index] || null
    }));
  }, [
    activeFacilityStorageKey,
    appleSortingFacilityKeys,
    appleSortingSlotCountOfFacilityKey,
    facilityStorageRowsView,
    supportsAppleSortingInWarehouseFacility,
  ]);

  const facilityStorageSortingPartsRows = useMemo(() => (
    facilityStorageRows.filter((item) => (
      String(item?.category || '') === 'tool'
      && Number(item?.qty) > 0
      && Boolean(appleSortingFacilityKeyByPartsItemKey?.[String(item?.key || '')])
    ))
  ), [appleSortingFacilityKeyByPartsItemKey, facilityStorageRows]);

  const facilityStorageSortingStaffPlanOf = useCallback((item) => {
    const facilityKey = String(item?.facilityKey || item?.key || '');
    const facilityConfig = facilityMap?.[facilityKey] || facilities.find((facility) => String(facility?.key || '') === facilityKey) || null;
    const minWorkers = Math.max(0, Math.floor(Number(facilityConfig?.minWorkers) || 0));
    const recommendedWorkers = Math.max(minWorkers, Math.floor(Number(facilityConfig?.recommendedWorkers) || 0));
    const cardCount = Math.max(1, recommendedWorkers);
    return {
      minWorkers,
      recommendedWorkers,
      cards: Array.from({ length: cardCount }, (_, index) => ({
        key: `${facilityKey || 'sorting'}-worker-slot-${index + 1}`,
        label: `인원칸 ${index + 1}`,
        required: index < minWorkers,
        recommended: index < recommendedWorkers
      }))
    };
  }, [facilities, facilityMap]);

  const facilityStorageSortingPreviewSlotsOf = useCallback(() => ([
    {
      key: 'input',
      title: '투입인원배정',
      body: '',
      previewClassName: 'sorting-position-slot--input'
    },
    {
      key: 'die-1',
      title: '선별인원배정',
      body: '',
      previewClassName: 'sorting-position-slot--output-a'
    },
    {
      key: 'die-2',
      title: '선별인원배정',
      body: '',
      previewClassName: 'sorting-position-slot--output-b'
    },
    {
      key: 'processed',
      title: '배출인원배정',
      body: '',
      previewClassName: 'sorting-position-slot--output-processed'
    }
  ]), []);

  const facilityStorageSortingStorageSlotsOf = useCallback((item) => {
    const facilityKey = String(item?.facilityKey || item?.key || '');
    const assignedWarehouseFacilityKey = appleSortingWarehouseFacilityKeyOfField(selectedField, facilityKey);
    const slotCount = assignedWarehouseFacilityKey
      ? harvestPalletSlotCountOfFacility(selectedField, assignedWarehouseFacilityKey)
      : 0;
    return Array.from({ length: slotCount }, (_, index) => {
      const slotNo = index + 1;
      return {
        key: `storage-${slotNo}`,
        title: storageSlotLabelOf('sorting', slotNo, { oneBased: true }),
        body: `${slotNo}번 적치`,
        meta: `${storageSlotLabelOf('sorting', slotNo, { oneBased: true })}번`,
        cardClassName: 'is-sorting-role'
      };
    });
  }, [
    appleSortingWarehouseFacilityKeyOfField,
    harvestPalletSlotCountOfFacility,
    selectedField,
    storageSlotLabelOf,
  ]);

  const facilityStorageSortingPreviewSlotMetaByKey = useMemo(() => (
    facilityStorageSortingPreviewSlotsOf().reduce((acc, slot) => {
      const key = String(slot?.key || '');
      if (key) acc[key] = slot;
      return acc;
    }, {})
  ), [facilityStorageSortingPreviewSlotsOf]);

  const facilityStorageSortingItemByEquipmentKey = useMemo(() => (
    facilityStorageRowsView.reduce((acc, item) => {
      if (!appleSortingFacilityKeys.includes(String(item?.facilityKey || item?.key || ''))) return acc;
      const equipmentStorageKey = String(item?.displayKey || item?.key || '');
      if (equipmentStorageKey) acc[equipmentStorageKey] = item;
      return acc;
    }, {})
  ), [appleSortingFacilityKeys, facilityStorageRowsView]);

  return {
    facilityStorageSortingSlots,
    facilityStorageSortingPartsRows,
    facilityStorageSortingStaffPlanOf,
    facilityStorageSortingPreviewSlotsOf,
    facilityStorageSortingStorageSlotsOf,
    facilityStorageSortingPreviewSlotMetaByKey,
    facilityStorageSortingItemByEquipmentKey,
  };
}

export function useWarehouseSortingStartState({
  activeFacilityStorageKey,
  selectedFieldFacilityInventoryState,
  facilityStorageSortingSlots,
  game,
  normalizeCargoByItemKey,
  normalizedHarvestLoadBoxKey,
  appleContainerLabelOf,
  laborText,
  sortingMissingRuleMessageOf,
  resolveSortingTaskContext,
}) {
  const resolveSortingStartState = useCallback((context, inventoryMapRaw = {}) => {
    const inventoryMap = normalizeCargoByItemKey(inventoryMapRaw || {});
    const selectedBoxItemKey = normalizedHarvestLoadBoxKey(context?.selectedOutputLoadBoxKey) || '';
    const selectedBoxStockQty = selectedBoxItemKey
      ? Math.max(0, Math.floor(Number(inventoryMap?.[selectedBoxItemKey]) || 0))
      : 0;
    const hasEnoughSelectedBoxStock = !selectedBoxItemKey || (Number(context?.selectedBoxRequiredCount) || 0) <= selectedBoxStockQty;
    const hasAssignedWorkers = Math.max(0, Number(context?.assignedWorkerCount) || 0) > 0;
    const hasEnoughAssignedLabor = !hasAssignedWorkers
      || (
        String(context?.processableLimitReason || '') !== 'labor'
        && (Number(context?.totalLaborCost) || 0) <= (Number(context?.totalAssignedLabor) || 0) + 0.001
      );
    let blockedReason = '';
    if (!context?.inputSlotNo) {
      blockedReason = '투입 자리를 먼저 선택해야 합니다.';
    } else if (!(Array.isArray(context?.outputSlotNos) ? context.outputSlotNos.length : 0)) {
      blockedReason = '배출 자리를 1개 이상 선택해야 합니다.';
    } else if (Math.max(0, Number(context?.outputRuleSlotCount) || 0) <= 0) {
      blockedReason = '배출 규칙을 1개 이상 선택해야 합니다.';
    } else if (context?.requiresCompleteOutputRuleCoverage && !context?.hasCompleteOutputRuleCoverage) {
      blockedReason = sortingMissingRuleMessageOf(context?.missingRequiredSortingRuleKeys || []);
    } else if (!selectedBoxItemKey) {
      blockedReason = '박스를 먼저 선택해야 합니다.';
    } else if (Math.max(0, Number(context?.candidateSourceEntryCount) || 0) <= 0) {
      blockedReason = '투입칸에 선별할 상자가 없습니다.';
    } else if (Math.max(0, Number(context?.blockedStemEntryCount) || 0) > 0) {
      blockedReason = '꼭지 제거가 안 된 상자는 선별기에 넣을 수 없습니다.';
    } else if (
      Math.max(0, Number(context?.processableCandidateEntryCount) || 0) > 0
      && Math.max(0, Number(context?.processableBoxCount) || 0) <= 0
      && String(context?.processableLimitReason || '') === 'box-stock'
    ) {
      blockedReason = `${appleContainerLabelOf(selectedBoxItemKey)} 박스 재고가 부족합니다. (현재 ${selectedBoxStockQty}개 / 최소 ${Math.max(1, Number(context?.minimumSelectedBoxRequiredCount) || 0)}개 필요)`;
    } else if (
      Math.max(0, Number(context?.processableCandidateEntryCount) || 0) > 0
      && Math.max(0, Number(context?.processableBoxCount) || 0) <= 0
      && String(context?.processableLimitReason || '') === 'labor'
    ) {
      blockedReason = `배치 인원의 노동력이 부족합니다. (보유 ${laborText(context?.totalAssignedLabor)})`;
    } else if (
      Math.max(0, Number(context?.processableCandidateEntryCount) || 0) > 0
      && Math.max(0, Number(context?.processableBoxCount) || 0) <= 0
    ) {
      blockedReason = '배출칸 공간이 없습니다.';
    } else if (Math.max(0, Number(context?.processableBoxCount) || 0) <= 0) {
      blockedReason = '선별 가능한 상자가 없습니다.';
    } else if (!hasAssignedWorkers) {
      blockedReason = '인원을 먼저 배치해야 합니다.';
    } else if (!hasEnoughSelectedBoxStock) {
      blockedReason = `${appleContainerLabelOf(selectedBoxItemKey)} 박스 재고가 부족합니다. (현재 ${selectedBoxStockQty}개 / 필요 ${Math.max(0, Number(context?.selectedBoxRequiredCount) || 0)}개)`;
    } else if (!hasEnoughAssignedLabor) {
      blockedReason = `배치 인원의 노동력이 부족합니다. (필요 ${laborText(context?.totalLaborCost)} / 보유 ${laborText(context?.totalAssignedLabor)})`;
    }
    return {
      selectedBoxItemKey,
      selectedBoxStockQty,
      hasEnoughSelectedBoxStock,
      hasAssignedWorkers,
      hasEnoughAssignedLabor,
      blockedReason,
    };
  }, [
    appleContainerLabelOf,
    laborText,
    normalizeCargoByItemKey,
    normalizedHarvestLoadBoxKey,
    sortingMissingRuleMessageOf,
  ]);

  const sortingStartStateByEquipmentKey = useMemo(() => {
    const facilityKey = String(activeFacilityStorageKey || '');
    if (!facilityKey) return {};
    const inventoryMap = normalizeCargoByItemKey(selectedFieldFacilityInventoryState?.byFacility?.[facilityKey] || {});
    return (Array.isArray(facilityStorageSortingSlots) ? facilityStorageSortingSlots : []).reduce((acc, slot) => {
      const item = slot?.item || null;
      const equipmentStorageKey = String(item?.displayKey || item?.key || '');
      if (!equipmentStorageKey) return acc;
      const context = resolveSortingTaskContext(game, facilityKey, equipmentStorageKey);
      const startState = resolveSortingStartState(context, inventoryMap);
      acc[equipmentStorageKey] = {
        selectedBoxItemKey: startState.selectedBoxItemKey,
        selectedBoxStockQty: startState.selectedBoxStockQty,
        selectedBoxRequiredCount: context.selectedBoxRequiredCount,
        candidateSourceEntryCount: context.candidateSourceEntryCount,
        processableCandidateEntryCount: context.processableCandidateEntryCount,
        blockedStemEntryCount: context.blockedStemEntryCount,
        processableBoxCount: context.processableBoxCount,
        classifiedBoxCount: context.classifiedBoxCount,
        unclassifiedBoxCount: context.unclassifiedBoxCount,
        outputRuleSlotCount: context.outputRuleSlotCount,
        hasMixedOutputRule: context.hasMixedOutputRule,
        requiredSortingRuleCount: context.requiredSortingRuleCount,
        selectedExactOutputRuleCount: context.selectedExactOutputRuleCount,
        missingRequiredSortingRuleCount: context.missingRequiredSortingRuleCount,
        outputSlotAvailableBoxCount: context.outputSlotAvailableBoxCount,
        assignedWorkerCount: context.assignedWorkerCount,
        totalAssignedLabor: context.totalAssignedLabor,
        totalLaborCost: context.totalLaborCost,
        hasEnoughSelectedBoxStock: startState.hasEnoughSelectedBoxStock,
        hasEnoughAssignedLabor: startState.hasEnoughAssignedLabor,
        blockedReason: startState.blockedReason,
      };
      return acc;
    }, {});
  }, [
    activeFacilityStorageKey,
    facilityStorageSortingSlots,
    game,
    normalizeCargoByItemKey,
    resolveSortingStartState,
    resolveSortingTaskContext,
    selectedFieldFacilityInventoryState,
  ]);

  return {
    resolveSortingStartState,
    sortingStartStateByEquipmentKey,
  };
}

export function useWarehouseSortingTaskContext({
  facilityStorageSortingBoxSelectionByFacility,
  facilityStorageSortingInOutSelectionByFacility,
  normalizeSortingInOutSlotNoList,
  normalizeSortingOutputRuleMap,
  normalizeSortingOutputRule,
  normalizeCargoByItemKey,
  normalizedHarvestLoadBoxKey,
  resolveFieldFacilityInventoryByFacility,
  resolveProcessableSortingPlan,
  resolveSortingAssignedWorkerEntries,
  groupSortingOutputPiecesByPriority,
  buildWorkbenchOutputSlotStateMap,
  roundWorkbenchHarvestKg,
  sortingLaborCostPerBoxOf,
  sortingOutputRuleKeyOf,
  buildRequiredSortingRuleKeys,
  normalizeHarvestStemRemoved,
  normalizeHarvestGradeLabel,
  roundLabor,
  harvestBoxesPerPallet,
}) {
  const resolveSortingTaskContext = useCallback((gameState, facilityKeyRaw = '', equipmentStorageKeyRaw = '') => {
    const gameStorage = Array.isArray(gameState?.storage) ? gameState.storage : [];
    const facilityKey = String(facilityKeyRaw || '');
    const equipmentStorageKey = String(equipmentStorageKeyRaw || '');
    const { byFacility } = resolveFieldFacilityInventoryByFacility(gameState, gameState?.selectedField);
    const facilityInventory = normalizeCargoByItemKey(byFacility?.[facilityKey] || {});
    const selectedBoxSelectionIds = Array.isArray(facilityStorageSortingBoxSelectionByFacility?.[facilityKey]?.[equipmentStorageKey])
      ? facilityStorageSortingBoxSelectionByFacility[facilityKey][equipmentStorageKey]
      : [];
    const selectedOutputLoadBoxKey = String(selectedBoxSelectionIds[0]?.split(':')?.[0] || '').trim();
    const currentSelection = facilityStorageSortingInOutSelectionByFacility?.[facilityKey]?.[equipmentStorageKey] || null;
    const inputSlotNos = normalizeSortingInOutSlotNoList(
      currentSelection?.inputSlotNos ?? currentSelection?.inputSlotNo
    );
    const outputSlotNos = normalizeSortingInOutSlotNoList(
      currentSelection?.outputSlotNos ?? currentSelection?.outputSlotNo
    );
    const selectedOutputSlotNoSet = new Set(outputSlotNos);
    const outputRulesBySlotNo = Object.fromEntries(
      Object.entries(
        normalizeSortingOutputRuleMap(
          currentSelection?.outputRulesBySlotNo ?? currentSelection?.outputAssignmentsBySlotNo
        )
      ).filter(([slotNoRaw]) => selectedOutputSlotNoSet.has(Math.max(0, Math.floor(Number(slotNoRaw) || 0))))
    );
    const normalizedOutputRules = Object.values(outputRulesBySlotNo).map((rule) => normalizeSortingOutputRule(rule)).filter(Boolean);
    const hasMixedOutputRule = normalizedOutputRules.some((rule) => String(rule?.ruleType || '') === 'mixed');
    const selectedExactOutputRuleKeys = Array.from(new Set(
      normalizedOutputRules
        .map((rule) => sortingOutputRuleKeyOf(rule))
        .filter(Boolean)
    ));
    const inputSlotNo = Math.max(0, Number(inputSlotNos[0]) || 0);
    const selectedSourceEntries = inputSlotNo <= 0
      ? []
      : gameStorage
        .map((batch, index) => ({ batch, index }))
        .filter(({ batch }) => {
          if (!batch) return false;
          if (String(batch?.storageFacilityKey || '') !== facilityKey) return false;
          if (String(batch?.storageVehicleInstanceId || '')) return false;
          if (String(batch?.storageSortingEquipmentKey || '') || String(batch?.storageWorkbenchSlotKey || '')) return false;
          const slotNo = Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0));
          if (slotNo !== inputSlotNo) return false;
          if (batch?.palletized) {
            const layerNo = Math.max(1, Math.min(2, Math.floor(Number(batch?.storagePalletLayer || 1) || 1)));
            if (layerNo !== 1) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const visualDiff = Math.max(0, Math.floor(Number(a.batch?.storageBoxVisualSlotNo) || 0))
            - Math.max(0, Math.floor(Number(b.batch?.storageBoxVisualSlotNo) || 0));
          if (visualDiff !== 0) return visualDiff;
          return Math.max(0, Math.floor(Number(a.batch?.storageBoxUnitNo) || 0))
            - Math.max(0, Math.floor(Number(b.batch?.storageBoxUnitNo) || 0));
        });
    const blockedStemEntries = selectedSourceEntries.filter(({ batch }) => normalizeHarvestStemRemoved(batch?.stemRemoved) === false);
    const processableCandidateEntries = selectedSourceEntries.filter(({ batch }) => normalizeHarvestStemRemoved(batch?.stemRemoved) === true);
    const requiredSortingRuleKeys = buildRequiredSortingRuleKeys(processableCandidateEntries);
    const missingRequiredSortingRuleKeys = requiredSortingRuleKeys.filter((ruleKey) => !selectedExactOutputRuleKeys.includes(ruleKey));
    const requiresCompleteOutputRuleCoverage = requiredSortingRuleKeys.length > 0 && !hasMixedOutputRule;
    const hasCompleteOutputRuleCoverage = hasMixedOutputRule || missingRequiredSortingRuleKeys.length <= 0;
    const assignedWorkerEntries = resolveSortingAssignedWorkerEntries(gameState, equipmentStorageKey);
    const assignedWorkerCount = Math.max(0, assignedWorkerEntries.length);
    const totalAssignedLabor = roundLabor(assignedWorkerEntries.reduce((sum, entry) => sum + Math.max(0, Number(entry?.actualLabor) || 0), 0));
    const processablePlan = resolveProcessableSortingPlan({
      storage: gameStorage,
      facilityKey,
      candidateEntries: processableCandidateEntries,
      selectedOutputLoadBoxKey,
      outputSlotNos,
      outputRulesBySlotNo,
      availableBoxStockByItemKey: facilityInventory,
      assignedWorkerCount,
      totalAssignedLabor,
    });
    const processableEntries = processablePlan.processableEntries;
    const classifiedEntries = processableEntries.filter(({ batch }) => {
      const gradeLabel = normalizeHarvestGradeLabel(batch?.gradeLabel);
      return gradeLabel && gradeLabel !== '미선별';
    });
    const unclassifiedEntries = processableEntries.filter(({ batch }) => {
      const gradeLabel = normalizeHarvestGradeLabel(batch?.gradeLabel);
      return !gradeLabel || gradeLabel === '미선별';
    });
    const estimatedOutputPieces = processablePlan.outputPieces;
    const estimatedOutputBoxes = Array.isArray(processablePlan.outputBoxes) ? processablePlan.outputBoxes : [];
    const returnableInputBoxCountsByItemKey = processableEntries.reduce((acc, { batch }) => {
      const itemKey = normalizedHarvestLoadBoxKey(batch?.loadBoxKey) || 'appleContainerYellow20kg';
      acc[itemKey] = Math.max(0, Number(acc[itemKey]) || 0) + 1;
      return acc;
    }, {});
    const requiredAdditionalBoxCountsByItemKey = estimatedOutputBoxes.reduce((acc, box) => {
      const itemKey = normalizedHarvestLoadBoxKey(box?.loadBoxKey) || 'appleContainerYellow20kg';
      acc[itemKey] = Math.max(0, Number(acc[itemKey]) || 0) + 1;
      return acc;
    }, {});
    Object.entries(requiredAdditionalBoxCountsByItemKey).forEach(([itemKeyRaw, outputCountRaw]) => {
      const itemKey = normalizedHarvestLoadBoxKey(itemKeyRaw) || 'appleContainerYellow20kg';
      const outputCount = Math.max(0, Number(outputCountRaw) || 0);
      const returnedCount = Math.max(0, Number(returnableInputBoxCountsByItemKey?.[itemKey] || 0));
      requiredAdditionalBoxCountsByItemKey[itemKey] = Math.max(0, outputCount - returnedCount);
    });
    const normalizedSelectedBoxItemKey = normalizedHarvestLoadBoxKey(selectedOutputLoadBoxKey) || '';
    const selectedBoxRequiredCount = normalizedSelectedBoxItemKey
      ? Math.max(0, Number(requiredAdditionalBoxCountsByItemKey?.[normalizedSelectedBoxItemKey] || 0))
      : 0;
    const minimumRequiredAdditionalBoxCountsByItemKey = normalizeCargoByItemKey(
      processablePlan?.blockingRequiredAdditionalBoxCountsByItemKey || {}
    );
    const minimumSelectedBoxRequiredCount = normalizedSelectedBoxItemKey
      ? Math.max(0, Number(minimumRequiredAdditionalBoxCountsByItemKey?.[normalizedSelectedBoxItemKey] || 0))
      : 0;
    const laborCostBreakdown = {
      unclassified: assignedWorkerCount > 0
        ? roundLabor(unclassifiedEntries.length * sortingLaborCostPerBoxOf('unclassified', assignedWorkerCount))
        : 0,
      classified: assignedWorkerCount > 0
        ? roundLabor(classifiedEntries.length * sortingLaborCostPerBoxOf('classified', assignedWorkerCount))
        : 0,
    };
    const totalLaborCost = roundLabor(laborCostBreakdown.unclassified + laborCostBreakdown.classified);
    const sourceIndexSet = new Set(processableEntries.map((entry) => entry.index));
    const outputSlotStateMap = buildWorkbenchOutputSlotStateMap(
      gameStorage,
      facilityKey,
      outputSlotNos,
      sourceIndexSet
    );
    const outputSlotAvailableBoxCount = outputSlotNos.reduce((sum, slotNoRaw) => {
      const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
      const slotState = outputSlotStateMap.get(slotNo);
      const filledCount = Math.max(0, Number(slotState?.filledCount) || 0);
      return sum + Math.max(0, harvestBoxesPerPallet - filledCount);
    }, 0);
    const estimatedGradeTotals = estimatedOutputPieces.reduce((acc, piece) => {
      const gradeLabel = normalizeHarvestGradeLabel(piece?.gradeLabel, '미분류') || '미분류';
      acc[gradeLabel] = roundWorkbenchHarvestKg((Number(acc[gradeLabel]) || 0) + (Number(piece?.qty) || 0));
      return acc;
    }, {});
    const estimatedOutputGroupsByPriority = groupSortingOutputPiecesByPriority(estimatedOutputPieces);
    return {
      selectedOutputLoadBoxKey,
      inputSlotNos,
      inputSlotNo,
      outputSlotNos,
      outputRulesBySlotNo,
      outputRuleSlotCount: Object.keys(outputRulesBySlotNo).length,
      hasMixedOutputRule,
      requiredSortingRuleKeys,
      requiredSortingRuleCount: requiredSortingRuleKeys.length,
      selectedExactOutputRuleKeys,
      selectedExactOutputRuleCount: selectedExactOutputRuleKeys.length,
      missingRequiredSortingRuleKeys,
      missingRequiredSortingRuleCount: missingRequiredSortingRuleKeys.length,
      requiresCompleteOutputRuleCoverage,
      hasCompleteOutputRuleCoverage,
      selectedSourceEntries,
      candidateSourceEntryCount: selectedSourceEntries.length,
      processableCandidateEntryCount: processableCandidateEntries.length,
      blockedStemEntries,
      blockedStemEntryCount: blockedStemEntries.length,
      processableEntries,
      processableBoxCount: processableEntries.length,
      processableLimitReason: String(processablePlan?.stopReason || ''),
      classifiedEntries,
      classifiedBoxCount: classifiedEntries.length,
      unclassifiedEntries,
      unclassifiedBoxCount: unclassifiedEntries.length,
      returnableInputBoxCountsByItemKey,
      requiredAdditionalBoxCountsByItemKey,
      selectedBoxRequiredCount,
      minimumRequiredAdditionalBoxCountsByItemKey,
      minimumSelectedBoxRequiredCount,
      estimatedOutputPieces,
      estimatedOutputBoxes,
      outputSlotAvailableBoxCount,
      estimatedGradeTotals,
      estimatedOutputGroupsByPriority,
      allocatedTargets: processablePlan.placedEntries.map((entry) => entry.target),
      placedEntries: processablePlan.placedEntries,
      assignedWorkerEntries,
      assignedWorkerCount,
      totalAssignedLabor,
      laborCostBreakdown,
      totalLaborCost,
    };
  }, [
    buildRequiredSortingRuleKeys,
    facilityStorageSortingBoxSelectionByFacility,
    facilityStorageSortingInOutSelectionByFacility,
    normalizeSortingInOutSlotNoList,
    normalizeSortingOutputRuleMap,
    normalizeSortingOutputRule,
    normalizeCargoByItemKey,
    normalizedHarvestLoadBoxKey,
    resolveFieldFacilityInventoryByFacility,
    resolveProcessableSortingPlan,
    resolveSortingAssignedWorkerEntries,
    groupSortingOutputPiecesByPriority,
    buildWorkbenchOutputSlotStateMap,
    roundWorkbenchHarvestKg,
    sortingLaborCostPerBoxOf,
    sortingOutputRuleKeyOf,
    normalizeHarvestStemRemoved,
    normalizeHarvestGradeLabel,
    roundLabor,
    harvestBoxesPerPallet,
  ]);

  return { resolveSortingTaskContext };
}

export function useWarehouseSortingPreviewHtml({
  activeFacilityStorageKey,
  facilityStorageSortingBoxSelectionByFacility,
  facilityStorageSortingInOutSelectionByFacility,
  facilityStorageSortingPreviewSlotsOf,
  facilityStorageSortingWorkerByEquipment,
  game,
  normalizedHarvestLoadBoxKey,
  animationLabAppleSorterHtml,
  sortingAnimationDurationMsForBoxCount,
}) {
  const buildFacilityStorageSortingPreviewHtml = useCallback((item) => {
    const equipmentStorageKey = String(item?.displayKey || item?.key || '');
    const facilityKey = String(activeFacilityStorageKey || '');
    const source = String(animationLabAppleSorterHtml || '');
    if (!source) return '';
    facilityStorageSortingPreviewSlotsOf();
    const currentSelection = facilityStorageSortingInOutSelectionByFacility?.[facilityKey]?.[equipmentStorageKey] || null;
    const selectedInputSlotNos = (() => {
      const rawValue = currentSelection?.inputSlotNos ?? currentSelection?.inputSlotNo;
      const rawList = Array.isArray(rawValue)
        ? rawValue
        : (Number(rawValue) > 0 ? [rawValue] : []);
      const nextList = [];
      rawList.forEach((slotNoRaw) => {
        const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
        if (slotNo > 0 && !nextList.includes(slotNo)) nextList.push(slotNo);
      });
      return nextList;
    })();
    const hasSelectedInputSlot = selectedInputSlotNos.length > 0;
    const selectedInputSlotNo = Math.max(0, Number(selectedInputSlotNos[0]) || 0);
    const selectedInputPreviewBatches = selectedInputSlotNo <= 0
      ? ''
      : (Array.isArray(game?.storage) ? game.storage : [])
        .filter((batch) => {
          if (!batch) return false;
          if (String(batch?.storageFacilityKey || '') !== facilityKey) return false;
          if (String(batch?.storageVehicleInstanceId || '')) return false;
          if (String(batch?.storageSortingEquipmentKey || '') || String(batch?.storageWorkbenchSlotKey || '')) return false;
          const slotNo = Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0));
          if (slotNo !== selectedInputSlotNo) return false;
          if (batch?.palletized) {
            const layerNo = Math.max(1, Math.min(2, Math.floor(Number(batch?.storagePalletLayer || 1) || 1)));
            if (layerNo !== 1) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const visualDiff = Math.max(0, Math.floor(Number(a?.storageBoxVisualSlotNo) || 0))
            - Math.max(0, Math.floor(Number(b?.storageBoxVisualSlotNo) || 0));
          if (visualDiff !== 0) return visualDiff;
          return Math.max(0, Math.floor(Number(a?.storageBoxUnitNo) || 0))
            - Math.max(0, Math.floor(Number(b?.storageBoxUnitNo) || 0));
        });
    const selectedInputPreviewBoxItemKey = Array.isArray(selectedInputPreviewBatches)
      ? (
        selectedInputPreviewBatches
          .map((batch) => normalizedHarvestLoadBoxKey(batch?.loadBoxKey) || 'appleContainerYellow20kg')[0] || ''
      )
      : '';
    const selectedInputPreviewBoxCount = Array.isArray(selectedInputPreviewBatches)
      ? selectedInputPreviewBatches.length
      : 0;
    const sortingPreviewDurationMs = sortingAnimationDurationMsForBoxCount(selectedInputPreviewBoxCount);
    const sortingPreviewDurationLabel = `${Math.max(1, Math.round(sortingPreviewDurationMs / 1000))}초`;
    const selectedInputPreviewTone = /green/i.test(selectedInputPreviewBoxItemKey) ? 'green' : 'yellow';
    const selectedBoxSelectionIds = Array.isArray(facilityStorageSortingBoxSelectionByFacility?.[facilityKey]?.[equipmentStorageKey])
      ? facilityStorageSortingBoxSelectionByFacility[facilityKey][equipmentStorageKey]
      : [];
    const selectedPreviewBoxItemKey = String(selectedBoxSelectionIds[0]?.split(':')?.[0] || '').trim();
    const hasSelectedPreviewBox = Boolean(selectedPreviewBoxItemKey);
    const selectedPreviewBoxTone = /green/i.test(selectedPreviewBoxItemKey) ? 'green' : 'yellow';
    const previewCss = `
html, body {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  overflow: hidden !important;
  background: linear-gradient(180deg, rgba(255, 253, 248, 0.98), rgba(247, 242, 233, 0.96)) !important;
}
body {
  display: block !important;
}
.sorter {
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  display: block !important;
  box-sizing: border-box !important;
  padding: 8px 16px 2px !important;
  transform: none !important;
  overflow: hidden !important;
}
.sorting-position-slot {
  display: none !important;
  pointer-events: none !important;
}
.sorter-controls {
  display: none !important;
}
.sorter-run-button {
  position: relative !important;
  overflow: hidden !important;
  isolation: isolate !important;
  min-height: 44px !important;
  padding: 10px 18px !important;
  border-radius: 14px !important;
  border: 1px solid rgba(52, 103, 77, 0.28) !important;
  background: linear-gradient(180deg, #4e996b 0%, #35784f 100%) !important;
  color: #f6fff4 !important;
  font-size: 0.96rem !important;
  font-weight: 800 !important;
  line-height: 1.1 !important;
  letter-spacing: -0.01em !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.2),
    0 10px 18px rgba(35, 66, 43, .18) !important;
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.14s ease !important;
}
.sorter-run-button[disabled] {
  border-color: rgba(76, 110, 90, 0.18) !important;
  background: linear-gradient(180deg, #85a792 0%, #6d8d79 100%) !important;
  color: rgba(245, 252, 243, 0.88) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.16),
    0 6px 12px rgba(35, 66, 43, .12) !important;
}
.sorter-run-button::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  background: linear-gradient(120deg, rgba(140, 225, 157, 0.24), rgba(140, 225, 157, 0)) !important;
  opacity: 0 !important;
  transform: scaleX(0.2) translateX(-85%) !important;
  transform-origin: left center !important;
  transition: opacity 0.2s ease, transform 0.35s ease !important;
  pointer-events: none !important;
}
.sorter-run-button::after {
  content: "" !important;
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  z-index: 0 !important;
  width: 34px !important;
  height: 34px !important;
  border-radius: 50% !important;
  background: radial-gradient(circle, rgba(140, 225, 157, 0.5), rgba(140, 225, 157, 0)) !important;
  transform: scale(0) !important;
  opacity: 0 !important;
  transition: transform 0.16s ease, opacity 0.16s ease !important;
  pointer-events: none !important;
}
.sorter-run-button:hover:not(:disabled) {
  transform: translateY(-1.5px) !important;
  filter: brightness(1.02) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.18),
    0 14px 24px rgba(35, 66, 43, .22) !important;
}
.sorter-run-button:hover:not(:disabled)::before {
  opacity: 1 !important;
  transform: scaleX(1.15) translateX(0) !important;
}
.sorter-run-button:active:not(:disabled) {
  transform: translateY(0.5px) scale(0.985) !important;
}
.sorter-run-button:active:not(:disabled)::after {
  transform: scale(14) !important;
  opacity: 0 !important;
}
.sorter-run-button > * {
  position: relative !important;
  z-index: 1 !important;
}
.field-move-modal .slot-button,
.shop-pay-card-modal .shop-pay-card-picker__dot {
  position: relative !important;
  overflow: hidden !important;
  isolation: isolate !important;
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.14s ease !important;
}
.field-move-modal .slot-button::before,
.shop-pay-card-modal .shop-pay-card-picker__dot::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  background: linear-gradient(120deg, rgba(140, 225, 157, 0.24), rgba(140, 225, 157, 0)) !important;
  opacity: 0 !important;
  transform: scaleX(0.2) translateX(-85%) !important;
  transform-origin: left center !important;
  transition: opacity 0.2s ease, transform 0.35s ease !important;
  pointer-events: none !important;
}
.field-move-modal .slot-button::after,
.shop-pay-card-modal .shop-pay-card-picker__dot::after {
  content: "" !important;
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  z-index: 0 !important;
  width: 34px !important;
  height: 34px !important;
  border-radius: 50% !important;
  background: radial-gradient(circle, rgba(140, 225, 157, 0.5), rgba(140, 225, 157, 0)) !important;
  transform: scale(0) !important;
  opacity: 0 !important;
  transition: transform 0.16s ease, opacity 0.16s ease !important;
  pointer-events: none !important;
}
.field-move-modal .slot-button:hover:not(:disabled),
.shop-pay-card-modal .shop-pay-card-picker__dot:hover:not(:disabled) {
  transform: translateY(-1.5px) !important;
  filter: brightness(1.02) !important;
}
.field-move-modal .slot-button:hover:not(:disabled)::before,
.shop-pay-card-modal .shop-pay-card-picker__dot:hover:not(:disabled)::before {
  opacity: 1 !important;
  transform: scaleX(1.15) translateX(0) !important;
}
.field-move-modal .slot-button:active:not(:disabled),
.shop-pay-card-modal .shop-pay-card-picker__dot:active:not(:disabled) {
  transform: translateY(0.5px) scale(0.985) !important;
}
.field-move-modal .slot-button:active:not(:disabled)::after,
.shop-pay-card-modal .shop-pay-card-picker__dot:active:not(:disabled)::after {
  transform: scale(14) !important;
  opacity: 0 !important;
}
.field-move-modal .slot-button > *,
.shop-pay-card-modal .shop-pay-card-picker__dot > * {
  position: relative !important;
  z-index: 1 !important;
}
.sorter-run-status { display: none !important; }
.sorter-progress-panel {
  left: 50% !important;
  top: auto !important;
  bottom: 72px !important;
  width: min(360px, calc(100% - 220px)) !important;
  transform: translateX(-50%) scale(0.82) !important;
  transform-origin: center bottom !important;
}
.machine {
  position: absolute !important;
  left: 55.3% !important;
  top: 29.4% !important;
  transform: translate(-50%, -50%) scale(0.75) !important;
  transform-origin: center center !important;
}
.machine > .sorter-apple-crate { display: ${hasSelectedInputSlot ? 'block' : 'none'} !important; }
.machine > .sorter-apple-crate .apple-crate-preview {
  --crate-bg-top: ${selectedInputPreviewTone === 'green' ? '#63c567' : '#ffad1f'} !important;
  --crate-bg-mid: ${selectedInputPreviewTone === 'green' ? '#37ad49' : '#ff9500'} !important;
  --crate-bg-bot: ${selectedInputPreviewTone === 'green' ? '#25863a' : '#f27c00'} !important;
  --crate-rib: ${selectedInputPreviewTone === 'green' ? 'rgba(38, 110, 48, 0.95)' : 'rgba(230, 110, 0, 0.95)'} !important;
  --crate-mesh: ${selectedInputPreviewTone === 'green' ? 'rgba(185, 238, 143, 0.9)' : 'rgba(255, 188, 80, 0.9)'} !important;
  --crate-inner-top: ${selectedInputPreviewTone === 'green' ? '#56be61' : '#ff9c10'} !important;
  --crate-inner-bottom: ${selectedInputPreviewTone === 'green' ? '#2f9d44' : '#ff9300'} !important;
  --crate-top-cap: ${selectedInputPreviewTone === 'green' ? 'rgba(153, 227, 144, 0.94)' : 'rgba(255, 190, 80, 0.95)'} !important;
  --crate-top-hole: rgba(255, 255, 255, 0.95) !important;
  --crate-side-frame-a: ${selectedInputPreviewTone === 'green' ? '#2b8f3c' : '#f48a00'} !important;
  --crate-side-frame-b: ${selectedInputPreviewTone === 'green' ? '#5fc86a' : '#ffad1f'} !important;
}
.catch-crates { display: ${hasSelectedPreviewBox ? 'flex' : 'none'} !important; z-index: 8 !important; pointer-events: none !important; }
.catch-crate {
  --crate-top: ${selectedPreviewBoxTone === 'green' ? '#63c567' : '#ffc24d'} !important;
  --crate-mid: ${selectedPreviewBoxTone === 'green' ? '#37ad49' : '#ffa616'} !important;
  --crate-bot: ${selectedPreviewBoxTone === 'green' ? '#25863a' : '#f18700'} !important;
  --crate-edge: ${selectedPreviewBoxTone === 'green' ? '#2d6c31' : '#dd7800'} !important;
  --crate-mesh-color: ${selectedPreviewBoxTone === 'green' ? 'rgba(185, 238, 143, 0.86)' : 'rgba(255, 188, 80, 0.9)'} !important;
  --crate-inner-top: ${selectedPreviewBoxTone === 'green' ? '#56be61' : '#ffb128'} !important;
  --crate-inner-bottom: ${selectedPreviewBoxTone === 'green' ? '#2f9d44' : '#ff9806'} !important;
  --crate-top-cap: ${selectedPreviewBoxTone === 'green' ? 'rgba(153, 227, 144, 0.94)' : 'rgba(255, 203, 109, 0.96)'} !important;
  --crate-side-frame-a: ${selectedPreviewBoxTone === 'green' ? '#2b8f3c' : '#f48a00'} !important;
  --crate-side-frame-b: ${selectedPreviewBoxTone === 'green' ? '#5fc86a' : '#ffad1f'} !important;
}
.sorting-position-slot {
  position: absolute !important;
  z-index: 7 !important;
  width: 72px !important;
  min-width: 72px !important;
  min-height: 72px !important;
  border-radius: 16px !important;
  border: 2px dashed rgba(58, 96, 73, 0.22) !important;
  background: linear-gradient(180deg, rgba(255, 253, 248, 0.72), rgba(247, 242, 233, 0.82)) !important;
  box-shadow: 0 8px 16px rgba(35, 71, 53, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.5) !important;
  padding: 8px 10px !important;
  display: grid !important;
  align-content: center !important;
  gap: 2px !important;
  text-align: center !important;
  cursor: pointer !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  font: inherit !important;
  outline: none !important;
  overflow: hidden !important;
  isolation: isolate !important;
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.14s ease !important;
}
.sorting-position-slot::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  background: linear-gradient(120deg, rgba(140, 225, 157, 0.22), rgba(140, 225, 157, 0)) !important;
  opacity: 0 !important;
  transform: scaleX(0.2) translateX(-85%) !important;
  transform-origin: left center !important;
  transition: opacity 0.2s ease, transform 0.35s ease !important;
  pointer-events: none !important;
}
.sorting-position-slot::after {
  content: "" !important;
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  z-index: 0 !important;
  width: 30px !important;
  height: 30px !important;
  border-radius: 50% !important;
  background: radial-gradient(circle, rgba(140, 225, 157, 0.45), rgba(140, 225, 157, 0)) !important;
  transform: scale(0) !important;
  opacity: 0 !important;
  transition: transform 0.16s ease, opacity 0.16s ease !important;
  pointer-events: none !important;
}
.sorting-position-slot--assigned {
  border: 2px solid rgba(58, 96, 73, 0.36) !important;
  background: linear-gradient(180deg, rgba(255, 253, 248, 0.9), rgba(246, 240, 228, 0.96)) !important;
  box-shadow: 0 10px 18px rgba(35, 71, 53, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.54) !important;
  align-content: center !important;
  justify-items: center !important;
  gap: 4px !important;
}
.sorting-position-slot:hover { transform: translateX(-50%) translateY(-1px) !important; filter: brightness(1.02) !important; box-shadow: 0 12px 18px rgba(35, 71, 53, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.56) !important; }
.sorting-position-slot:hover::before { opacity: 1 !important; transform: scaleX(1.15) translateX(0) !important; }
.sorting-position-slot:active { transform: translateX(-50%) translateY(0.5px) scale(0.985) !important; }
.sorting-position-slot:active::after { transform: scale(14) !important; opacity: 0 !important; }
.sorting-position-slot:focus-visible { box-shadow: 0 0 0 3px rgba(255, 191, 71, 0.38), 0 12px 18px rgba(35, 71, 53, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.56) !important; }
.sorting-position-slot__title { position: relative !important; z-index: 1 !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 2px !important; max-width: 100% !important; font-size: 0.78rem !important; font-weight: 800 !important; color: #295441 !important; line-height: 1 !important; white-space: nowrap !important; }
.sorting-position-slot--title-only { display: flex !important; align-items: center !important; justify-content: center !important; }
.sorting-position-slot__body { position: relative !important; z-index: 1 !important; font-size: 0.7rem !important; font-weight: 700 !important; color: rgba(42, 77, 60, 0.7) !important; line-height: 1.15 !important; }
.sorting-position-slot__worker { position: relative !important; z-index: 1 !important; display: grid !important; align-items: center !important; justify-content: center !important; gap: 4px !important; align-self: center !important; width: 100% !important; max-width: 100% !important; color: #2d5a45 !important; justify-self: center !important; padding: 0 !important; margin: 0 !important; }
.sorting-position-slot__worker-head { display: grid !important; align-items: center !important; justify-content: center !important; gap: 4px !important; width: 100% !important; max-width: 100% !important; }
.sorting-position-slot__worker-icon { display: block !important; justify-self: center !important; font-size: 0.92rem !important; line-height: 1 !important; }
.sorting-position-slot__worker-label { display: block !important; justify-self: center !important; max-width: 100% !important; font-size: 0.7rem !important; font-weight: 800 !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; line-height: 1.05 !important; text-align: center !important; }
.sorting-position-slot__worker-labor { font-size: 0.62rem !important; font-weight: 800 !important; color: rgba(42, 77, 60, 0.74) !important; line-height: 1 !important; white-space: nowrap !important; text-align: center !important; }
.sorting-position-slot--input { left: 178px !important; bottom: 54px !important; transform: translateX(-50%) !important; }
.sorting-position-slot--output-a { left: 53.2% !important; bottom: 94px !important; transform: translateX(-50%) !important; }
.sorting-position-slot--output-b { left: 66.9% !important; bottom: 94px !important; transform: translateX(-50%) !important; }
.sorting-position-slot--output-processed { left: 80.1% !important; bottom: 94px !important; transform: translateX(-50%) !important; }
.catch-crate__label { display: none !important; }
`;
    const positionSlotMarkup = '';
    const previewScript = '';
    const htmlWithEquipmentKey = source.includes('<body')
      ? source.replace('<body', `<body data-equipment-storage-key="${equipmentStorageKey}"`)
      : source;
    const htmlWithCss = htmlWithEquipmentKey.includes('</style>')
      ? htmlWithEquipmentKey.replace('</style>', `${previewCss}\n</style>`)
      : `${htmlWithEquipmentKey}<style>${previewCss}</style>`;
    const htmlWithSlots = htmlWithCss.includes('</body>')
      ? htmlWithCss.replace('</body>', `${positionSlotMarkup}\n${previewScript}\n</body>`)
      : `${htmlWithCss}${positionSlotMarkup}${previewScript}`;
    return htmlWithSlots
      .replace('const RUN_TOTAL_MS = 20000;', `const RUN_TOTAL_MS = ${sortingPreviewDurationMs};`)
      .replace('<span>20초</span>', `<span>${sortingPreviewDurationLabel}</span>`)
      .replace("runStatus.textContent = '20초 진행';", `runStatus.textContent = '${sortingPreviewDurationLabel} 진행';`)
      .replace('>실행</button>', '>▶ 선별시작</button>')
      .replace("runButton.textContent = '실행';", "runButton.textContent = '▶ 선별시작';");
  }, [
    activeFacilityStorageKey,
    animationLabAppleSorterHtml,
    facilityStorageSortingBoxSelectionByFacility,
    facilityStorageSortingInOutSelectionByFacility,
    facilityStorageSortingPreviewSlotsOf,
    facilityStorageSortingWorkerByEquipment,
    game,
    normalizedHarvestLoadBoxKey,
    sortingAnimationDurationMsForBoxCount,
  ]);

  return { buildFacilityStorageSortingPreviewHtml };
}

export function useWarehouseSortingWorkerPickerExternalEntries(
  currentCrewRosterEntries,
  sortingWorkerByEquipment,
  sortingWorkerPicker
) {
  return useMemo(() => {
    const equipmentStorageKey = String(sortingWorkerPicker?.equipmentStorageKey || '');
    const slotKey = String(sortingWorkerPicker?.slotKey || sortingWorkerPicker?.positionKey || '');
    const slotKeys = Array.isArray(sortingWorkerPicker?.slotKeys)
      ? sortingWorkerPicker.slotKeys.map((key) => String(key || '')).filter(Boolean)
      : (Array.isArray(sortingWorkerPicker?.positionKeys)
        ? sortingWorkerPicker.positionKeys.map((key) => String(key || '')).filter(Boolean)
        : []);
    const targetSlotKeys = slotKeys.length ? slotKeys : [slotKey].filter(Boolean);
    const legacySlotKeyOf = (value) => (
      String(value || '').includes('-worker-slot-')
        ? String(value || '').replace('-worker-slot-', '-staff-slot-')
        : String(value || '')
    );
    const readAssignment = (key) => (
      sortingWorkerByEquipment?.[equipmentStorageKey]?.[key]
      || sortingWorkerByEquipment?.[equipmentStorageKey]?.[legacySlotKeyOf(key)]
      || null
    );
    const currentWorkerIds = new Set(
      targetSlotKeys
        .map((key) => String(readAssignment(key)?.workerId || ''))
        .filter(Boolean)
    );
    const occupiedWorkerIds = new Set(
      Object.entries(sortingWorkerByEquipment?.[equipmentStorageKey] || {})
        .filter(([entrySlotKey]) => {
          const normalizedKey = String(entrySlotKey || '');
          const modernKey = normalizedKey.includes('-staff-slot-')
            ? normalizedKey.replace('-staff-slot-', '-worker-slot-')
            : normalizedKey;
          return !targetSlotKeys.includes(normalizedKey) && !targetSlotKeys.includes(modernKey);
        })
        .map(([, entry]) => String(entry?.workerId || ''))
        .filter(Boolean)
    );
    return currentCrewRosterEntries
      .map((entry) => ({
        ...entry,
        workers: (entry.workers || []).filter((worker) => {
          const workerId = String(worker?.id || '');
          if (!workerId) return false;
          if (Math.max(0, Number(worker?.labor) || 0) <= 0 && !currentWorkerIds.has(workerId)) return false;
          return currentWorkerIds.has(workerId) || !occupiedWorkerIds.has(workerId);
        })
      }))
      .filter((entry) => (entry.workers || []).length > 0);
  }, [currentCrewRosterEntries, sortingWorkerByEquipment, sortingWorkerPicker]);
}

export function useWarehouseWorkbenchWorkerPickerExternalEntries(
  currentCrewRosterEntries,
  workbenchWorkerByFacility,
  workbenchWorkerPicker
) {
  return useMemo(() => {
    return currentCrewRosterEntries
      .map((entry) => ({
        ...entry,
        workers: (entry.workers || []).filter((worker) => {
          const workerId = String(worker?.id || '');
          if (!workerId) return false;
          return true;
        })
      }))
      .filter((entry) => (entry.workers || []).length > 0);
  }, [currentCrewRosterEntries]);
}

export function useWarehouseHarvestDetailDerived({
  detailSource,
  detailSlotNo,
  detailLayer,
  selectedCarrier,
  selectedCarrierPalletSlotRows,
  harvestStoredPalletSlotsByVehicleInstance,
  harvestStoredFloorSlotsByVehicleInstance,
  harvestSlotRows,
  workbenchHarvestSlotRows = [],
  activeFacilityStorageKey,
  facilityName,
  resolveMachineInstanceById,
  decodeUnicodeEscapes,
  stripColdStorageIconName,
  game,
  normalizedHarvestLoadBoxKey,
  toolImageSrcOf,
  clamp,
  qualityStateText,
  crops,
  harvestBoxCapacityKg,
  floorHarvestDisplayKeyOf
}) {
  const slot = useMemo(() => {
    const detailType = String(detailSource?.type || 'warehouse');
    const slotNo = Math.max(0, Math.floor(Number(detailSource?.slotNo || detailSlotNo) || 0));
    if (slotNo <= 0) return null;
    if (detailType === 'vehicle') {
      const vehicleInstanceId = String(detailSource?.vehicleInstanceId || '');
      if (!vehicleInstanceId) return null;
      if (vehicleInstanceId === String(selectedCarrier?.id || '')) {
        const selectedCarrierSlot = selectedCarrierPalletSlotRows.find((entry) => entry.slotNo === slotNo) || null;
        if (selectedCarrierSlot) return selectedCarrierSlot;
      }
      const storedSlotEntry = harvestStoredPalletSlotsByVehicleInstance?.[vehicleInstanceId]?.[slotNo] || null;
      const storedFloorEntry = harvestStoredFloorSlotsByVehicleInstance?.[vehicleInstanceId]?.[slotNo] || null;
      const bottomLayer = storedSlotEntry?.bottomLayer || null;
      if (!bottomLayer && !storedFloorEntry) return null;
      if (storedFloorEntry && !bottomLayer) {
        return {
          slotNo,
          occupied: true,
          slotType: 'harvest',
          ...projectHarvestStorageDisplayFields(
            storedFloorEntry,
            {
              slotNo,
              palletCapacityKg: 0,
              aggregateLayerQty: true,
            }
          ),
        };
      }
      return {
        slotNo,
        occupied: true,
        slotType: 'harvest',
        ...projectHarvestStorageDisplayFields(
          {
            ...bottomLayer,
            topLayer: storedSlotEntry?.topLayer || null,
          },
          {
            slotNo,
            palletCapacityKg: 0,
            aggregateLayerQty: true,
          }
        ),
      };
    }
    return harvestSlotRows.find((entry) => entry.slotNo === slotNo)
      || workbenchHarvestSlotRows.find((entry) => entry.slotNo === slotNo)
      || null;
  }, [detailSource, detailSlotNo, harvestSlotRows, selectedCarrier, selectedCarrierPalletSlotRows, harvestStoredFloorSlotsByVehicleInstance, harvestStoredPalletSlotsByVehicleInstance, workbenchHarvestSlotRows]);

  const locationLabel = useMemo(() => {
    const detailType = String(detailSource?.type || 'warehouse');
    if (detailType === 'vehicle') {
      const vehicleInstanceId = String(detailSource?.vehicleInstanceId || '');
      const vehicle = vehicleInstanceId === String(selectedCarrier?.id || '')
        ? selectedCarrier
        : resolveMachineInstanceById(vehicleInstanceId);
      if (!vehicle) return '차량의 팔레트';
      const baseName = String(vehicle?.item?.name || vehicle?.machineKey || '차량');
      const unitNo = Math.max(1, Math.floor(Number(vehicle?.unitNo) || 1));
      const isRent = vehicle?.rent && !vehicle?.owned;
      return `${baseName} #${unitNo}${isRent ? ' (임대)' : ''}의 ${slot?.isFloorStored ? '저장공간' : '팔레트'}`;
    }
    const placeLabel = slot?.isFloorStored ? '저장공간' : '팔레트';
    return `${decodeUnicodeEscapes(stripColdStorageIconName(facilityName || '창고'))} ${placeLabel}`;
  }, [detailSource, selectedCarrier, resolveMachineInstanceById, facilityName, decodeUnicodeEscapes, stripColdStorageIconName, slot?.isFloorStored]);

  const imageSrc = useMemo(() => {
    const loadBoxKey = normalizedHarvestLoadBoxKey(slot?.loadBoxKey);
    if (loadBoxKey) return toolImageSrcOf(loadBoxKey);
    return toolImageSrcOf('plasticPallet1100');
  }, [slot, normalizedHarvestLoadBoxKey, toolImageSrcOf]);

  const batchRows = useMemo(() => {
    const detailType = String(detailSource?.type || 'warehouse');
    const facilityKey = String(activeFacilityStorageKey || '');
    const vehicleInstanceId = String(detailSource?.vehicleInstanceId || '');
    const slotNo = Math.max(0, Math.floor(Number(slot?.slotNo) || 0));
    if (!slot || !slot.isHarvestStored || slotNo <= 0) return [];
    if (detailType === 'warehouse' && !facilityKey) return [];
    if (detailType === 'vehicle' && !vehicleInstanceId) return [];
    const isFloorStored = Boolean(slot?.isFloorStored);
    return (game?.storage || []).flatMap((batch, index) => {
      const batchFacilityKey = String(batch?.storageFacilityKey || '');
      const batchSlotNo = Math.max(0, Math.floor(Number(batch?.storagePalletSlotNo || batch?.storagePalletNo) || 0));
      const batchVehicleInstanceId = String(batch?.storageVehicleInstanceId || '');
      const batchVehicleSlotNo = Math.max(0, Math.floor(Number(batch?.storageVehiclePalletSlotNo || 0) || 0));
      const matched = detailType === 'vehicle'
        ? (
          batchVehicleInstanceId === vehicleInstanceId
          && batchVehicleSlotNo === slotNo
          && (isFloorStored ? !batch?.palletized : batch?.palletized)
        )
        : (isFloorStored
          ? (!batch?.palletized && batchFacilityKey === facilityKey && batchSlotNo === slotNo)
          : (batch?.palletized && batchFacilityKey === facilityKey && batchSlotNo === slotNo));
      if (!matched) return [];
      const cropId = String(batch?.cropId || '');
      const quality = clamp(Number(batch?.quality) || 0, 0, 100);
      const qualityLabel = String(qualityStateText(quality) || '보통');
      const stemRemoved = typeof batch?.stemRemoved === 'boolean' ? batch.stemRemoved : false;
      const stemStatusKey = stemRemoved ? 'removed' : 'attached';
      const stemStatusLabel = stemRemoved ? '꼭지 제거' : '꼭지 있음';
      const loadBoxKey = normalizedHarvestLoadBoxKey(batch?.loadBoxKey) || 'appleContainerYellow20kg';
      const qtyKg = Math.max(0, Number(batch?.qty) || 0);
      const fillRatio = Math.max(0, Math.min(1, qtyKg / harvestBoxCapacityKg));
      const fullBoxes = qtyKg >= harvestBoxCapacityKg ? Math.floor(qtyKg / harvestBoxCapacityKg) : 0;
      const remainderKg = roundKg(Math.max(0, qtyKg - (fullBoxes * harvestBoxCapacityKg)), 2);
      const hasRemainderBox = remainderKg > 0;
      const movedBoxCount = fullBoxes + (hasRemainderBox ? 1 : 0);
      const boxCountLabel = hasRemainderBox
        ? (fullBoxes > 0 ? `${fullBoxes.toLocaleString()}박스 + 잔량박스 1` : '잔량박스 1')
        : `${Math.max(1, fullBoxes).toLocaleString()}박스`;
      const weightLabel = `${formatKg(qtyKg, 2)}kg`;
      const layerNo = Math.max(
        1,
        Math.min(2, Math.floor(Number(
          detailType === 'vehicle'
            ? (batch?.storageVehiclePalletLayer || 1)
            : (isFloorStored ? 1 : (batch?.storagePalletLayer || 1))
        ) || 1))
      );
      const layerLabel = `${layerNo}단`;
      return [{
        key: String(batch?.id || `harvest-detail-batch-${index + 1}`),
        cropId,
        cropName: crops?.[cropId]?.name || '작물',
        quality,
        qualityLabel,
        gradeLabel: normalizeHarvestGradeLabel(batch?.gradeLabel, '미선별') || '미선별',
        sizeLabel: String(batch?.sizeLabel || '').trim() || '미측정',
        stemRemoved,
        stemStatusKey,
        stemStatusLabel,
        qtyKg,
        movedBoxCount,
        fullBoxes,
        remainderKg,
        hasRemainderBox,
        boxCountLabel,
        weightLabel,
        layerLabel,
        loadBoxKey,
        appleCrateTone: /green/i.test(String(loadBoxKey || '')) ? 'green' : 'yellow',
        imageSrc: /appleContainer/i.test(String(loadBoxKey || '')) ? '' : toolImageSrcOf(loadBoxKey),
        life: Math.max(0, Number(batch?.life) || 0),
        harvestedDay: Math.max(0, Number(batch?.harvestedDay) || 0),
        oneMcpTreated: Boolean(batch?.treated1Mcp),
        storageFacilityUnitKey: String(batch?.storageFacilityUnitKey || ''),
        fillRatio,
        palletLayer: layerNo,
        boxUnitNo: Math.max(0, Math.floor(Number(batch?.storageBoxUnitNo) || 0))
      }];
    }).sort((a, b) => (
      Number(a.palletLayer || 1) - Number(b.palletLayer || 1)
    ) || (
      Number(b.quality || 0) - Number(a.quality || 0)
    ) || (
      Number(b.harvestedDay || 0) - Number(a.harvestedDay || 0)
    ) || (
      Number(b.qtyKg || 0) - Number(a.qtyKg || 0)
    ) || (
      Number(a.boxUnitNo || 0) - Number(b.boxUnitNo || 0)
    ) || String(a.cropName || '').localeCompare(String(b.cropName || ''), 'ko'));
  }, [
    slot,
    detailSource,
    activeFacilityStorageKey,
    game,
    clamp,
    qualityStateText,
    normalizedHarvestLoadBoxKey,
    harvestBoxCapacityKg,
    crops,
    toolImageSrcOf
  ]);

  const cardSections = useMemo(() => {
    const targetLayerLabel = detailLayer === 'top' ? '2단' : '1단';
    const layerRows = batchRows.filter((row) => String(row?.layerLabel || '1단') === targetLayerLabel);
    if (!layerRows.length) return [];
    const isFloorStored = Boolean(slot?.isFloorStored);
    const groupedRows = [];
    const fullBoxBucketByKey = new Map();
    layerRows.forEach((row) => {
      const hasRemainder = Boolean(row?.hasRemainderBox);
      const sourceBatchId = String(row?.key || '');
      const sourceBoxUnitNo = Math.max(0, Math.floor(Number(row?.boxUnitNo) || 0));
      const floorDisplayKey = isFloorStored
        ? floorHarvestDisplayKeyOf?.({
          facilityKey: String(activeFacilityStorageKey || ''),
          slotNo: Math.max(0, Math.floor(Number(slot?.slotNo) || 0)),
          loadBoxKey: String(row?.loadBoxKey || ''),
          qualityLabel: String(row?.qualityLabel || '보통'),
          cropId: String(row?.cropId || ''),
          stemStatusKey: String(row?.stemStatusKey || 'attached'),
          sourceIsFullBox: !hasRemainder,
          sourceFillStep: hasRemainder
            ? (Math.max(0, Number(row?.remainderKg) || 0) > ((harvestBoxCapacityKg / 3) + 0.001) ? 2 : 1)
            : 3
        })
        : '';
      if (!hasRemainder) {
        const bucketKey = [
          String(row?.loadBoxKey || ''),
          String(row?.qualityLabel || '보통'),
          String(row?.cropId || ''),
          String(row?.cropName || '기타'),
          String(row?.stemStatusKey || 'attached'),
          Boolean(row?.oneMcpTreated) ? '1mcp' : 'raw',
          normalizeHarvestGradeLabel(row?.gradeLabel, '미선별'),
          String(row?.sizeLabel || '').trim() || '미측정'
        ].join('::');
        const bucket = fullBoxBucketByKey.get(bucketKey) || {
          qty: 0,
          remainderKg: 0,
          hasRemainder: false,
          imageItemKey: String(row?.loadBoxKey || ''),
          qualityLabel: String(row?.qualityLabel || '보통'),
          stemRemoved: Boolean(row?.stemRemoved),
          stemStatusKey: String(row?.stemStatusKey || 'attached'),
          stemStatusLabel: String(row?.stemStatusLabel || '꼭지 있음'),
          cropId: String(row?.cropId || ''),
          cropLabel: String(row?.cropName || '기타'),
          sourceBatchIds: [],
          sourceBoxUnitNos: [],
          sourceFillStep: 3,
          displayKey: floorDisplayKey,
          sourceFacilityKey: String(activeFacilityStorageKey || ''),
          sourceSlotNo: Math.max(0, Math.floor(Number(slot?.slotNo) || 0)),
          isHarvestStoredBox: isFloorStored,
          loadBoxKey: String(row?.loadBoxKey || ''),
          harvestedDay: Math.max(0, Number(row?.harvestedDay) || 0),
          life: Math.max(0, Number(row?.life) || 0),
          oneMcpTreated: Boolean(row?.oneMcpTreated),
          storageFacilityUnitKey: String(row?.storageFacilityUnitKey || ''),
          gradeLabel: normalizeHarvestGradeLabel(row?.gradeLabel, '미선별'),
          sizeLabel: String(row?.sizeLabel || '').trim() || '미측정',
          produceTypeLabel: String(row?.produceTypeLabel || '사과')
        };
        bucket.qty += Math.max(0, Number(row?.qtyKg) || 0);
        if (sourceBatchId) bucket.sourceBatchIds.push(sourceBatchId);
        if (sourceBoxUnitNo > 0) bucket.sourceBoxUnitNos.push(sourceBoxUnitNo);
        fullBoxBucketByKey.set(bucketKey, bucket);
        return;
      }
      groupedRows.push({
        qty: Math.max(0, Number(row?.qtyKg) || 0),
        remainderKg: Math.max(0, Number(row?.remainderKg) || 0),
        hasRemainder: true,
        imageItemKey: String(row?.loadBoxKey || ''),
        qualityLabel: String(row?.qualityLabel || '보통'),
        stemRemoved: Boolean(row?.stemRemoved),
        stemStatusKey: String(row?.stemStatusKey || 'attached'),
        stemStatusLabel: String(row?.stemStatusLabel || '꼭지 있음'),
        cropId: String(row?.cropId || ''),
        cropLabel: String(row?.cropName || '기타'),
        sourceBatchId,
        sourceBoxUnitNo,
        sourceFillStep: Math.max(0, Number(row?.remainderKg) || 0) > ((harvestBoxCapacityKg / 3) + 0.001) ? 2 : 1,
        displayKey: floorDisplayKey,
        sourceFacilityKey: String(activeFacilityStorageKey || ''),
        sourceSlotNo: Math.max(0, Math.floor(Number(slot?.slotNo) || 0)),
        isHarvestStoredBox: isFloorStored,
        loadBoxKey: String(row?.loadBoxKey || ''),
        harvestedDay: Math.max(0, Number(row?.harvestedDay) || 0),
        life: Math.max(0, Number(row?.life) || 0),
        oneMcpTreated: Boolean(row?.oneMcpTreated),
        storageFacilityUnitKey: String(row?.storageFacilityUnitKey || ''),
        gradeLabel: normalizeHarvestGradeLabel(row?.gradeLabel, '미선별'),
        sizeLabel: String(row?.sizeLabel || '').trim() || '미측정',
        produceTypeLabel: String(row?.produceTypeLabel || '사과')
      });
    });
    groupedRows.unshift(...Array.from(fullBoxBucketByKey.values()));
    return [{
      key: detailLayer === 'top' ? 'top' : 'bottom',
      title: targetLayerLabel,
      groupedRows
    }];
  }, [batchRows, detailLayer, harvestBoxCapacityKg, slot?.isFloorStored, slot?.slotNo, floorHarvestDisplayKeyOf, activeFacilityStorageKey]);

  const summary = useMemo(() => {
    const targetLayerLabel = detailLayer === 'top' ? '2단' : '1단';
    const layerRows = batchRows.filter((row) => String(row?.layerLabel || '1단') === targetLayerLabel);
    const totalWeightKg = layerRows.reduce((sum, row) => sum + Math.max(0, Number(row?.qtyKg) || 0), 0);
    const normalizedTotalWeightKg = Math.round(totalWeightKg * 10) / 10;
    const totalBoxes = layerRows.filter((row) => Math.max(0, Number(row?.qtyKg) || 0) > 0.001).length;
    return {
      totalBoxes,
      totalWeightKg: normalizedTotalWeightKg
    };
  }, [batchRows, detailLayer]);

  return {
    slot,
    locationLabel,
    imageSrc,
    batchRows,
    cardSections,
    summary
  };
}

export function useWarehouseHarvestMoveTargets({
  picker,
  selectedTransportMode,
  selectedTransportCanStackPallet = false,
  harvestGeneralRowMap,
  resolveMachineInstanceById,
  machineDisplayNameWithRentTag,
  decodeUnicodeEscapes,
  stripColdStorageIconName,
  facilityName,
  facilityMap,
  formatCountWithUnit,
  harvestStoredPalletSlotsByVehicleInstance,
  activeFacilityStorageKey,
  harvestSlotRows,
  selectedField,
  harvestSlotByFacility,
  harvestStoredKgByFacility,
  harvestStoredPalletSlotsByFacility,
  harvestStoredFloorSummaryRowsByFacilityAndSlot,
  harvestPalletSlotCountOfFacility,
  buildHarvestPalletSlotEntries,
  selectableWarehouseRows,
  harvestStoredGeneralRowsByFacility,
  harvestPalletLayerEntryOf,
  harvestBoxCapacityKg,
  harvestPalletCapacityKg,
  harvestBoxesPerPallet,
  sortingSlots,
  sortingStorageSlotsOf,
  workbenchSlots,
  workbenchCargoPlanOf
}) {
  const sourceCardQtyKgOf = (cardLike) => Math.max(
    0,
    Number(cardLike?.qtyKg)
    || Number(cardLike?.totalWeightKg)
    || Number(cardLike?.weightKg)
    || Number(cardLike?.sourceWeightKg)
    || Number(cardLike?.displayWeightKg)
    || 0
  );

  const selectedMoveKgFromSourceCard = (pickerLike) => {
    const card = pickerLike?.sourceBoxCard || null;
    if (!card) return 0;
    const cardKind = String(card?.cardKind || '');
    const sourceQtyKg = sourceCardQtyKgOf(card);
    if (cardKind === 'partial') return sourceQtyKg;
    const boxCount = Math.max(1, Math.floor(Number(card?.boxCount) || 1));
    const selectedBoxCount = Math.max(1, Math.min(boxCount, Math.floor(Number(pickerLike?.selectedBoxCount) || boxCount)));
    return Math.round((((sourceQtyKg / boxCount) * selectedBoxCount) + Number.EPSILON) * 10) / 10;
  };

  const formatSelectedSourceBoxLabel = (card) => {
    if (!card) return '';
    return formatHarvestBoxStateLabel({
      cropLabel: String(card?.cropLabel || '수확물'),
      qualityLabel: String(card?.qualityLabel || '보통'),
      qtyKg: sourceCardQtyKgOf(card),
      stemRemoved: card?.stemRemoved,
      stemStatusKey: String(card?.stemStatusKey || card?.stemStatus || ''),
      stemStatusLabel: String(card?.stemStatusLabel || card?.stemLabel || '')
    });
  };

  const formatSlotSourceBoxLabel = (ownerLabel, slotNo, layerLabel, card) => (
    `${ownerLabel}의 팔레트 ${slotNo} ${layerLabel} · ${formatSelectedSourceBoxLabel(card)}`.trim()
  );

  const resolveSourceFacilityLabel = (sourceFacilityKey) => {
    const normalizedSourceFacilityKey = String(sourceFacilityKey || '');
    const activeKey = String(activeFacilityStorageKey || '');
    const fallbackFacilityName = normalizedSourceFacilityKey === activeKey
      ? facilityName
      : '';
    return decodeUnicodeEscapes(
      stripColdStorageIconName(
        facilityMap?.[normalizedSourceFacilityKey]?.name
        || fallbackFacilityName
        || normalizedSourceFacilityKey
        || '창고'
      )
    );
  };

  const targetSummaryLabel = useMemo(() => {
    if (!picker) return '없음';
    const unloadMode = String(selectedTransportMode || 'pallet') === 'individual' ? 'individual' : 'pallet';
    const sourceBoxCard = unloadMode === 'individual' ? (picker?.sourceBoxCard || null) : null;
    const sourceTypeRaw = String(picker?.sourceType || 'warehouse-slot');
    if (sourceTypeRaw === 'warehouse-general') {
      const sourceFacilityLabel = resolveSourceFacilityLabel(picker?.sourceFacilityKey);
      const sourceRow = harvestGeneralRowMap?.[String(picker?.sourceRowKey || '')] || null;
      if (!sourceRow) return `${sourceFacilityLabel}의 일반저장 · 수확물 보관분`;
      return `${sourceFacilityLabel}의 일반저장 · ${String(sourceRow?.cropLabel || sourceRow?.name || '수확물')} ${String(sourceRow?.boxText || formatCountWithUnit(sourceRow?.qty, sourceRow?.unit) || '보관분')}`.trim();
    }
    if (sourceTypeRaw === 'vehicle-cargo') {
      const sourceVehicleInstanceId = String(picker?.sourceVehicleInstanceId || '');
      const sourceVehicle = sourceVehicleInstanceId ? resolveMachineInstanceById(sourceVehicleInstanceId) : null;
      const sourceVehicleName = sourceVehicle ? machineDisplayNameWithRentTag(sourceVehicle) : '차량';
      if (unloadMode === 'individual' && sourceBoxCard) {
        return `${sourceVehicleName} · ${formatSelectedSourceBoxLabel(sourceBoxCard)}`;
      }
      return `${sourceVehicleName} · 일반 적재함 수확물`;
    }
    const sourceLayerKey = String(picker?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
    const sourceLayerLabel = sourceLayerKey === 'top' ? '2단' : '1단';
    const buildIndividualBoxLabel = (prefixLabel, layerEntry) => {
      const qtyKg = Math.max(0, Number(layerEntry?.qtyKg) || 0);
      const fullBoxes = Math.max(0, Math.floor(Number(layerEntry?.storagePalletBoxCount ?? layerEntry?.storageBoxCount) || 0));
      const remainderKg = Math.max(0, Number(layerEntry?.storagePalletRemainderKg ?? layerEntry?.storageRemainderKg) || 0);
      if (qtyKg <= 0) return `${prefixLabel} · ${sourceLayerLabel} 상자`;
      const boxText = fullBoxes > 0
        ? `${fullBoxes.toLocaleString()}박스${remainderKg > 0 ? ` + 잔량 ${formatKg(remainderKg, 2)}kg` : ''}`
        : (remainderKg > 0 ? `잔량 ${formatKg(remainderKg, 2)}kg` : `${formatKg(qtyKg, 2)}kg`);
      return `${prefixLabel} · ${sourceLayerLabel} 상자 ${boxText}`;
    };
    const sourceType = sourceTypeRaw === 'vehicle-slot' ? 'vehicle-slot' : 'warehouse-slot';
    if (sourceType === 'vehicle-slot') {
      const sourceVehicleInstanceId = String(picker?.sourceVehicleInstanceId || '');
      const sourceVehiclePalletSlotNo = Math.max(1, Math.floor(Number(picker?.sourceVehiclePalletSlotNo) || 0));
      const sourceVehicle = sourceVehicleInstanceId ? resolveMachineInstanceById(sourceVehicleInstanceId) : null;
      const sourceVehicleName = sourceVehicle ? machineDisplayNameWithRentTag(sourceVehicle) : '차량';
      const sourceVehicleEntry = harvestStoredPalletSlotsByVehicleInstance?.[sourceVehicleInstanceId]?.[sourceVehiclePalletSlotNo] || null;
      const sourceLayerEntry = sourceLayerKey === 'top'
        ? (sourceVehicleEntry?.topLayer || null)
        : (sourceVehicleEntry?.bottomLayer || null);
      if (unloadMode === 'individual') {
        if (sourceBoxCard) return formatSlotSourceBoxLabel(sourceVehicleName, sourceVehiclePalletSlotNo, sourceLayerLabel, sourceBoxCard);
        return buildIndividualBoxLabel(sourceVehicleName, sourceLayerEntry);
      }
      return `${sourceVehicleName} · 팔레트 ${sourceVehiclePalletSlotNo}${sourceLayerKey === 'top' ? ' 2단' : ' 1단'}`;
    }
    const sourceFacilityKey = String(picker?.sourceFacilityKey || '');
    const sourceSlotNo = Math.max(1, Math.floor(Number(picker?.sourceSlotNo) || 0));
    const sourceFacilityName = resolveSourceFacilityLabel(sourceFacilityKey);
    let sourceEntry = null;
    if (sourceFacilityKey === String(activeFacilityStorageKey || '')) {
      const activeStoredSourceEntry = harvestStoredPalletSlotsByFacility?.[sourceFacilityKey]?.[sourceSlotNo] || null;
      const activeStoredFloorSourceEntry = harvestStoredFloorSummaryRowsByFacilityAndSlot?.[sourceFacilityKey]?.[sourceSlotNo] || null;
      sourceEntry = harvestSlotRows[sourceSlotNo - 1]?.entry || (
        activeStoredSourceEntry
          ? {
            ...(activeStoredSourceEntry?.bottomLayer || activeStoredSourceEntry || {}),
            itemKey: 'harvestPallet',
            sourceType: 'harvest',
            topLayer: activeStoredSourceEntry?.bottomLayer ? (activeStoredSourceEntry?.topLayer || null) : null
          }
          : (activeStoredFloorSourceEntry || null)
      );
    } else if (selectedField && sourceFacilityKey) {
      const slotCount = harvestPalletSlotCountOfFacility(selectedField, sourceFacilityKey);
      const savedSlotsRaw = Array.isArray(harvestSlotByFacility?.[sourceFacilityKey]) ? harvestSlotByFacility[sourceFacilityKey] : [];
      const legacyHarvestKg = Math.max(0, Number(harvestStoredKgByFacility?.[sourceFacilityKey]) || 0);
      const storedHarvestSlotsByNo = harvestStoredPalletSlotsByFacility?.[sourceFacilityKey] || {};
      const storedFloorRowsBySlot = harvestStoredFloorSummaryRowsByFacilityAndSlot?.[sourceFacilityKey] || {};
      sourceEntry = buildHarvestPalletSlotEntries({
        slotCount,
        savedSlotsRaw,
        storedHarvestSlotsByNo,
        storedFloorRowsBySlot,
        legacyHarvestKg
      })[sourceSlotNo - 1] || null;
    }
    const sourceLayerEntry = sourceLayerKey === 'top'
      ? (sourceEntry?.topLayer || null)
      : sourceEntry;
    if (unloadMode === 'individual') {
      if (sourceBoxCard) return formatSlotSourceBoxLabel(sourceFacilityName, sourceSlotNo, sourceLayerLabel, sourceBoxCard);
      return buildIndividualBoxLabel(sourceFacilityName, sourceLayerEntry);
    }
    return `${sourceFacilityName} · 팔레트 ${sourceSlotNo}${sourceLayerKey === 'top' ? ' 2단' : ' 1단'}`;
  }, [
    selectedTransportMode,
    picker,
    harvestGeneralRowMap,
    resolveMachineInstanceById,
    machineDisplayNameWithRentTag,
    decodeUnicodeEscapes,
    stripColdStorageIconName,
    facilityName,
    facilityMap,
    formatCountWithUnit,
    harvestStoredPalletSlotsByVehicleInstance,
    activeFacilityStorageKey,
    harvestSlotRows,
    selectedField,
    harvestSlotByFacility,
    harvestStoredKgByFacility,
    harvestStoredPalletSlotsByFacility,
    harvestStoredFloorSummaryRowsByFacilityAndSlot,
    harvestPalletSlotCountOfFacility,
    buildHarvestPalletSlotEntries
  ]);

  const targetSummaryVisual = useMemo(() => {
    if (!picker) return null;
    const unloadMode = String(selectedTransportMode || 'pallet') === 'individual' ? 'individual' : 'pallet';
    const sourceBoxCard = unloadMode === 'individual' ? (picker?.sourceBoxCard || null) : null;
    const sourceTypeRaw = String(picker?.sourceType || 'warehouse-slot');
    const buildIndividualVisual = (layerEntry, fallbackCropLabel) => {
      if (!layerEntry) return null;
      const qtyKg = Math.max(0, Number(layerEntry?.qtyKg) || 0);
      const fullBoxes = Math.max(0, Math.floor(Number(layerEntry?.storagePalletBoxCount ?? layerEntry?.storageBoxCount) || 0));
      const remainderKg = Math.max(0, Number(layerEntry?.storagePalletRemainderKg ?? layerEntry?.storageRemainderKg) || 0);
      const crateTone = Array.isArray(layerEntry?.loadBoxTones) && /green/i.test(String(layerEntry.loadBoxTones[0] || ''))
        ? 'green'
        : 'yellow';
      const fillRatio = fullBoxes > 0
        ? 1
        : (remainderKg > ((20 / 3) + 0.001) ? (2 / 3) : (remainderKg > 0 ? (1 / 3) : 1));
      const fillLabel = fullBoxes > 0 ? '' : (remainderKg > ((20 / 3) + 0.001) ? '2/3' : (remainderKg > 0 ? '1/3' : ''));
      const boxText = fullBoxes > 0
        ? `${fullBoxes.toLocaleString()}박스`
        : (remainderKg > 0 ? `${fillLabel}박스` : `${formatKg(qtyKg, 2)}kg`);
      return {
        kind: 'general',
        crateTone,
        cropLabel: String(fallbackCropLabel || '수확물'),
        boxText,
        fillRatio,
        fillLabel,
        qualityLabel: '보통'
      };
    };
    const buildIndividualCardVisual = (card) => {
      if (!card) return null;
      return {
        kind: 'general',
        crateTone: /green/i.test(String(card?.imageItemKey || '')) ? 'green' : 'yellow',
        cropLabel: String(card?.cropLabel || '수확물'),
        boxText: String(card?.cardKind || '') === 'full'
          ? `${Math.max(0, Math.floor(Number(card?.boxCount) || 0)).toLocaleString()}박스`
          : String(card?.fillLabel || '잔량박스'),
        fillRatio: Math.max(0, Math.min(1, Number(card?.fillRatio) || 1)),
        fillLabel: String(card?.fillLabel || ''),
        qualityLabel: String(card?.qualityLabel || '보통'),
        stemStatusKey: String(card?.stemStatusKey || card?.stemStatus || ''),
        stemStatusLabel: String(card?.stemStatusLabel || card?.stemLabel || ''),
        stemRemoved: typeof card?.stemRemoved === 'boolean' ? card.stemRemoved : undefined
      };
    };
    if (sourceTypeRaw === 'warehouse-general') {
      const sourceRow = harvestGeneralRowMap?.[String(picker?.sourceRowKey || '')] || null;
      if (!sourceRow) return null;
      return {
        kind: 'general',
        crateTone: /green/i.test(String(sourceRow?.loadBoxKey || sourceRow?.key || '')) ? 'green' : 'yellow',
        cropLabel: String(sourceRow?.cropLabel || sourceRow?.name || '수확물'),
        boxText: String(sourceRow?.boxText || formatCountWithUnit(sourceRow?.qty, sourceRow?.unit) || '보관분'),
        fillRatio: Math.max(0, Math.min(1, Number(sourceRow?.fillRatio) || 1)),
        fillLabel: String(sourceRow?.fillLabel || ''),
        qualityLabel: String(sourceRow?.qualityLabel || '보통'),
        stemStatusKey: String(sourceRow?.stemStatusKey || sourceRow?.stemStatus || ''),
        stemStatusLabel: String(sourceRow?.stemStatusLabel || sourceRow?.stemLabel || ''),
        stemRemoved: typeof sourceRow?.stemRemoved === 'boolean' ? sourceRow.stemRemoved : undefined
      };
    }
    const sourceLayerKey = String(picker?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
    const sourceType = sourceTypeRaw === 'vehicle-slot' ? 'vehicle-slot' : 'warehouse-slot';
    if (sourceType === 'vehicle-slot') {
      const sourceVehicleInstanceId = String(picker?.sourceVehicleInstanceId || '');
      const sourceVehiclePalletSlotNo = Math.max(1, Math.floor(Number(picker?.sourceVehiclePalletSlotNo) || 0));
      const sourceEntry = sourceVehicleInstanceId
        ? (harvestStoredPalletSlotsByVehicleInstance?.[sourceVehicleInstanceId]?.[sourceVehiclePalletSlotNo] || null)
        : null;
      const layerEntry = sourceLayerKey === 'top'
        ? (sourceEntry?.topLayer || null)
        : (sourceEntry?.bottomLayer || null);
      if (!layerEntry) return null;
      if (unloadMode === 'individual') {
        if (sourceBoxCard) return buildIndividualCardVisual(sourceBoxCard);
        return buildIndividualVisual(layerEntry, '선택 상자');
      }
      return {
        kind: 'pallet',
        slotLabel: `팔레트 ${sourceVehiclePalletSlotNo}`,
        layerLabel: sourceLayerKey === 'top' ? '2단' : '1단',
        entry: layerEntry
      };
    }
    const sourceFacilityKey = String(picker?.sourceFacilityKey || '');
    const sourceSlotNo = Math.max(1, Math.floor(Number(picker?.sourceSlotNo) || 0));
    let sourceEntry = null;
    if (sourceFacilityKey === String(activeFacilityStorageKey || '')) {
      const activeStoredSourceEntry = harvestStoredPalletSlotsByFacility?.[sourceFacilityKey]?.[sourceSlotNo] || null;
      const activeStoredFloorSourceEntry = harvestStoredFloorSummaryRowsByFacilityAndSlot?.[sourceFacilityKey]?.[sourceSlotNo] || null;
      sourceEntry = harvestSlotRows[sourceSlotNo - 1]?.entry || (
        activeStoredSourceEntry
          ? {
            ...(activeStoredSourceEntry?.bottomLayer || activeStoredSourceEntry || {}),
            itemKey: 'harvestPallet',
            sourceType: 'harvest',
            topLayer: activeStoredSourceEntry?.bottomLayer ? (activeStoredSourceEntry?.topLayer || null) : null
          }
          : (activeStoredFloorSourceEntry || null)
      );
    } else if (selectedField && sourceFacilityKey) {
      const slotCount = harvestPalletSlotCountOfFacility(selectedField, sourceFacilityKey);
      const savedSlotsRaw = Array.isArray(harvestSlotByFacility?.[sourceFacilityKey]) ? harvestSlotByFacility[sourceFacilityKey] : [];
      const legacyHarvestKg = Math.max(0, Number(harvestStoredKgByFacility?.[sourceFacilityKey]) || 0);
      const storedHarvestSlotsByNo = harvestStoredPalletSlotsByFacility?.[sourceFacilityKey] || {};
      const storedFloorRowsBySlot = harvestStoredFloorSummaryRowsByFacilityAndSlot?.[sourceFacilityKey] || {};
      sourceEntry = buildHarvestPalletSlotEntries({
        slotCount,
        savedSlotsRaw,
        storedHarvestSlotsByNo,
        storedFloorRowsBySlot,
        legacyHarvestKg
      })[sourceSlotNo - 1] || null;
    }
    const layerEntry = sourceLayerKey === 'top'
      ? (sourceEntry?.topLayer || null)
      : sourceEntry;
    if (!layerEntry) return null;
    if (unloadMode === 'individual') {
      if (sourceBoxCard) return buildIndividualCardVisual(sourceBoxCard);
      return buildIndividualVisual(layerEntry, '선택 상자');
    }
    return {
      kind: 'pallet',
      slotLabel: `P${sourceSlotNo}`,
      layerLabel: sourceLayerKey === 'top' ? '2단' : '1단',
      entry: layerEntry
    };
  }, [
    picker,
    selectedTransportMode,
    harvestGeneralRowMap,
    formatCountWithUnit,
    harvestStoredPalletSlotsByVehicleInstance,
    activeFacilityStorageKey,
    harvestSlotRows,
    selectedField,
    harvestSlotByFacility,
    harvestStoredKgByFacility,
    harvestStoredPalletSlotsByFacility,
    harvestStoredFloorSummaryRowsByFacilityAndSlot,
    harvestPalletSlotCountOfFacility,
    buildHarvestPalletSlotEntries
  ]);

  const titleSummaryLabel = useMemo(() => {
    if (!picker) return '';
    const unloadMode = String(selectedTransportMode || 'pallet') === 'individual' ? 'individual' : 'pallet';
    const sourceBoxCard = unloadMode === 'individual' ? (picker?.sourceBoxCard || null) : null;
    const sourceTypeRaw = String(picker?.sourceType || 'warehouse-slot');
    const previewLabel = String(targetSummaryLabel || '').trim();
    if (sourceTypeRaw === 'warehouse-slot' || sourceTypeRaw === 'vehicle-slot' || sourceTypeRaw === 'warehouse-general') return previewLabel;
    if (sourceBoxCard) return formatSelectedSourceBoxLabel(sourceBoxCard);
    const separatorIndex = previewLabel.indexOf(' · ');
    return separatorIndex >= 0 ? previewLabel.slice(separatorIndex + 3).trim() : previewLabel;
  }, [picker, selectedTransportMode, targetSummaryLabel]);

  const generalRows = useMemo(() => {
    return [];
  }, [
    picker
  ]);

  const workbenchRows = useMemo(
    () => {
      const unloadMode = String(selectedTransportMode || 'pallet') === 'individual' ? 'individual' : 'pallet';
      const sourceTypeRaw = String(picker?.sourceType || 'warehouse-slot');
      const sourceType = sourceTypeRaw === 'vehicle-slot'
        ? 'vehicle-slot'
        : (
          sourceTypeRaw === 'warehouse-general'
            ? 'warehouse-general'
            : (
              sourceTypeRaw === 'vehicle-cargo'
                ? 'vehicle-cargo'
                : (sourceTypeRaw === 'empty-pallet-stock' ? 'empty-pallet-stock' : 'warehouse-slot')
            )
        );
      const sourceFacilityKey = String(picker?.sourceFacilityKey || '');
      const sourceSlotNo = Math.max(1, Math.floor(Number(picker?.sourceSlotNo) || 0));
      const sourceVehicleInstanceId = String(picker?.sourceVehicleInstanceId || '');
      const sourceVehiclePalletSlotNo = Math.max(1, Math.floor(Number(picker?.sourceVehiclePalletSlotNo) || 0));
      const sourceLayerKey = String(picker?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
      const sourceGeneralRow = sourceType === 'warehouse-general'
        ? (harvestGeneralRowMap?.[String(picker?.sourceRowKey || '')] || null)
        : null;
      const targetFacilityKey = String(picker?.targetFacilityKey || activeFacilityStorageKey || '');
      const safeHarvestPalletCapacityKg = Math.max(0, Number(harvestPalletCapacityKg) || 0);
      const safeHarvestBoxesPerPallet = Math.max(1, Math.floor(Number(harvestBoxesPerPallet) || 36));
      const activeStoredSourceEntry = sourceType === 'warehouse-slot' && sourceFacilityKey === String(activeFacilityStorageKey || '')
        ? (harvestStoredPalletSlotsByFacility?.[sourceFacilityKey]?.[sourceSlotNo] || null)
        : null;
      const activeStoredFloorSourceEntry = sourceType === 'warehouse-slot' && sourceFacilityKey === String(activeFacilityStorageKey || '')
        ? (harvestStoredFloorSummaryRowsByFacilityAndSlot?.[sourceFacilityKey]?.[sourceSlotNo] || null)
        : null;
      const activeWorkbenchSourceEntry = sourceType === 'warehouse-slot' && sourceFacilityKey === String(activeFacilityStorageKey || '')
        ? buildWorkbenchCargoSlotEntry({
          storageSlotNo: sourceSlotNo,
          savedSlotsRaw: Array.isArray(harvestSlotByFacility?.[sourceFacilityKey]) ? harvestSlotByFacility[sourceFacilityKey] : [],
          storedHarvestSlotsByNo: harvestStoredPalletSlotsByFacility?.[sourceFacilityKey] || {},
          storedFloorRowsBySlot: harvestStoredFloorSummaryRowsByFacilityAndSlot?.[sourceFacilityKey] || {},
          buildHarvestPalletSlotEntries,
        })
        : null;
      const warehouseSourceSlot = sourceType === 'warehouse-slot' && sourceFacilityKey === String(activeFacilityStorageKey || '')
        ? (
          harvestSlotRows[sourceSlotNo - 1]
          || (
            activeStoredSourceEntry ? {
              occupied: true,
              isHarvestStored: true,
              hasTopLayer: Boolean(activeStoredSourceEntry?.topLayer),
              topLayer: activeStoredSourceEntry?.topLayer || null,
              ...(activeStoredSourceEntry?.bottomLayer || activeStoredSourceEntry || {})
            } : (
              activeStoredFloorSourceEntry ? {
                occupied: true,
                isHarvestStored: true,
                isFloorStored: true,
                hasTopLayer: false,
                topLayer: null,
                ...activeStoredFloorSourceEntry
              } : (
                activeWorkbenchSourceEntry ? {
                  occupied: true,
                  isHarvestStored: String(activeWorkbenchSourceEntry?.sourceType || '') === 'harvest' || String(activeWorkbenchSourceEntry?.sourceType || '') === 'floorHarvest',
                  isFloorStored: String(activeWorkbenchSourceEntry?.sourceType || '') === 'floorHarvest',
                  hasTopLayer: Boolean(activeWorkbenchSourceEntry?.topLayer),
                  topLayer: activeWorkbenchSourceEntry?.topLayer || null,
                  ...activeWorkbenchSourceEntry
                } : null
              )
            )
          )
        )
        : null;
      const vehicleStoredSourceEntry = sourceType === 'vehicle-slot'
        ? (harvestStoredPalletSlotsByVehicleInstance?.[sourceVehicleInstanceId]?.[sourceVehiclePalletSlotNo] || null)
        : null;
      const sourceSlot = sourceType === 'warehouse-slot'
        ? warehouseSourceSlot
        : (vehicleStoredSourceEntry ? {
            occupied: true,
            isHarvestStored: true,
            hasTopLayer: Boolean(vehicleStoredSourceEntry?.topLayer),
            topLayer: vehicleStoredSourceEntry?.topLayer || null,
            ...vehicleStoredSourceEntry?.bottomLayer
          } : null);
      const sourceLayerEntry = sourceType === 'vehicle-slot'
        ? (sourceLayerKey === 'top' ? vehicleStoredSourceEntry?.topLayer || null : vehicleStoredSourceEntry?.bottomLayer || null)
        : harvestPalletLayerEntryOf(sourceSlot, sourceLayerKey);
      const resolvedSourceQtyKg = Math.max(
        0,
        Number(sourceLayerEntry?.qtyKg)
        || Number(sourceSlot?.qtyKg)
        || Number(sourceSlot?.bottomLayer?.qtyKg)
        || 0
      );
      const requiredKg = sourceType === 'warehouse-general'
        ? Math.max(0, Number(sourceGeneralRow?.totalKg) || 0)
        : (
          unloadMode === 'individual' && picker?.sourceBoxCard
            ? selectedMoveKgFromSourceCard(picker)
            : resolvedSourceQtyKg
        );
      return workbenchSlots
        .filter((slot) => slot?.installedTable)
        .map((slot) => {
          const slotKey = String(slot?.key || '');
          const savedSlotsRaw = targetFacilityKey
            ? (Array.isArray(harvestSlotByFacility?.[targetFacilityKey]) ? harvestSlotByFacility[targetFacilityKey] : [])
            : [];
          const storedHarvestSlotsByNo = targetFacilityKey
            ? (harvestStoredPalletSlotsByFacility?.[targetFacilityKey] || {})
            : {};
          const storedFloorRowsBySlot = targetFacilityKey
            ? (harvestStoredFloorSummaryRowsByFacilityAndSlot?.[targetFacilityKey] || {})
            : {};
          const cargoSlots = workbenchCargoPlanOf(slot.installedTable).map((cargoSlot) => {
            const cargoSlotKey = String(cargoSlot?.key || '');
            const storageSlotNo = workbenchCargoStorageSlotNoOf(slotKey, cargoSlotKey);
            const slotEntry = buildWorkbenchCargoSlotEntry({
              storageSlotNo,
              savedSlotsRaw,
              storedHarvestSlotsByNo,
              storedFloorRowsBySlot,
              buildHarvestPalletSlotEntries,
            });
            const bottomLayer = slotEntry || null;
            const topLayer = slotEntry?.topLayer || null;
            const isFloorStored = Boolean(slotEntry?.sourceType === 'floorHarvest');
            const usedKg = Math.max(
              0,
              Math.round((
                Math.max(0, Number(bottomLayer?.qtyKg) || 0)
                + Math.max(0, Number(topLayer?.qtyKg) || 0)
                + Number.EPSILON
              ) * 10) / 10
            );
            const filledBoxCount = harvestStorageSlotVisualFilledBoxCount(bottomLayer, {
              boxCapacityKg: harvestBoxCapacityKg,
              maxBoxes: safeHarvestBoxesPerPallet,
            });
            const availableBoxCount = Math.max(0, safeHarvestBoxesPerPallet - filledBoxCount);
            const availableKg = Math.max(
              0,
              Math.round(((safeHarvestPalletCapacityKg - usedKg) + Number.EPSILON) * 10) / 10
            );
            const hasStoredHarvest = Boolean(slotEntry?.sourceType === 'harvest' || slotEntry?.sourceType === 'floorHarvest');
            const hasEmptyPallet = Boolean(slotEntry) && !hasStoredHarvest && !isFloorStored;
            const sameSourceSlot = sourceType === 'warehouse-slot'
              && sourceFacilityKey === targetFacilityKey
              && sourceSlotNo === storageSlotNo;
            const canStackTop = unloadMode !== 'individual'
              && Boolean(selectedTransportCanStackPallet)
              && hasStoredHarvest
              && !isFloorStored
              && !sameSourceSlot
              && !topLayer
              && filledBoxCount >= safeHarvestBoxesPerPallet;
            const targetType = unloadMode === 'individual'
              ? (
                hasStoredHarvest
                  ? (isFloorStored ? 'warehouse-floor-harvest' : 'warehouse-harvest-pallet')
                  : (hasEmptyPallet ? 'warehouse-empty-pallet' : 'warehouse-empty')
              )
              : (
                hasStoredHarvest
                  ? (canStackTop ? 'warehouse-stack-top' : 'warehouse-harvest-pallet-blocked')
                  : 'warehouse-empty'
              );
            let blockReason = '';
            if (!picker) {
              blockReason = '옮길 수확물을 먼저 선택해 주세요.';
            } else if (!targetFacilityKey) {
              blockReason = '작업대를 설치한 창고를 먼저 선택해 주세요.';
            } else if (sourceType === 'warehouse-general') {
              blockReason = '일반저장 수확물은 먼저 운반기구에 실어야 합니다.';
            } else if (sameSourceSlot) {
              blockReason = '같은 적재칸으로는 이동할 수 없습니다.';
            } else if (false && safeHarvestPalletCapacityKg <= 0) {
              blockReason = '작업대 적재칸 용량을 확인할 수 없습니다.';
            } else if (unloadMode !== 'individual' && requiredKg <= 0) {
              blockReason = '옮길 수확물 무게를 확인할 수 없습니다.';
            } else if (unloadMode !== 'individual' && hasStoredHarvest && !canStackTop) {
              blockReason = '이미 사용 중인 작업대 적재칸에는 팔레트째 이동할 수 없습니다.';
            } else if (unloadMode !== 'individual' && !canStackTop && availableBoxCount <= 0) {
              blockReason = `적재칸이 가득 찼습니다. (최대 ${safeHarvestBoxesPerPallet.toLocaleString()}박스)`;
            } else if (topLayer && targetType !== 'warehouse-stack-top') {
              blockReason = '이미 사용 중인 작업대 적재칸에는 팔레트째 이동할 수 없습니다.';
            }
            return {
              ...cargoSlot,
              storageSlotNo,
              occupied: hasStoredHarvest || hasEmptyPallet,
              hasStoredHarvest,
              hasEmptyPallet,
              isFloorStored,
              bottomLayer,
              filledBoxCount,
              loadLabel: String(bottomLayer?.loadLabel || bottomLayer?.floorBoxText || ''),
              usedKg,
              availableKg,
              availableBoxCount,
              target: {
                key: `workbench-cargo:${targetFacilityKey}:${slotKey}:${cargoSlotKey}`,
                targetType: String(targetType || ''),
                facilityKey: targetFacilityKey,
                slotNo: storageSlotNo,
                availableKg,
                availableBoxCount,
                canChoose: !blockReason && !String(targetType || '').endsWith('-blocked'),
                blockReason,
                isWorkbenchCargoSlot: true,
                workbenchSlotKey: slotKey,
                workbenchSlotLabel: String(slot?.label || ''),
                workbenchName: String(slot?.installedTable?.name || slot?.label || '작업대'),
                cargoSlotKey,
                cargoSlotLabel: String(cargoSlot?.label || ''),
                displayLabel: `${String(slot?.installedTable?.name || slot?.label || '작업대')} ${String(cargoSlot?.label || '')}`.trim()
              }
            };
          });
          return {
            key: slotKey,
            slotLabel: String(slot?.label || ''),
            title: String(slot?.installedTable?.name || slot?.label || '작업대'),
            desc: String(slot?.label || ''),
            imageUrl: String(slot?.installedTable?.imageUrl || ''),
            roleLabels: Array.isArray(slot?.installedTable?.roleLabels)
              ? slot.installedTable.roleLabels.map((label, index) => String(label || `인원배정 ${index + 1}`))
              : [],
            cargoSlots
          };
        });
    },
    [
      activeFacilityStorageKey,
      buildHarvestPalletSlotEntries,
      harvestGeneralRowMap,
      harvestBoxesPerPallet,
      harvestPalletCapacityKg,
      harvestPalletLayerEntryOf,
      harvestSlotByFacility,
      harvestSlotRows,
      harvestStoredFloorSummaryRowsByFacilityAndSlot,
      harvestStoredPalletSlotsByFacility,
      harvestStoredPalletSlotsByVehicleInstance,
      picker,
      selectedTransportCanStackPallet,
      selectedTransportMode,
      workbenchCargoPlanOf,
      workbenchSlots
    ]
  );

  const buildStorageTargetForAuxSlot = ({
    slotEntry,
    storageSlotNo,
    targetFacilityKey,
    sourceType,
    sourceFacilityKey,
    sourceSlotNo,
    unloadMode,
    safeHarvestBoxesPerPallet,
    safeHarvestPalletCapacityKg,
    palletMoveBlockedLabel,
    fullBlockedLabel,
    displayLabel,
    extraTarget = {}
  }) => {
    const bottomLayer = slotEntry || null;
    const topLayer = slotEntry?.topLayer || null;
    const isFloorStored = Boolean(slotEntry?.sourceType === 'floorHarvest');
    const usedKg = Math.max(
      0,
      Math.round((
        Math.max(0, Number(bottomLayer?.qtyKg) || 0)
        + Math.max(0, Number(topLayer?.qtyKg) || 0)
        + Number.EPSILON
      ) * 10) / 10
    );
    const filledBoxCount = harvestStorageSlotVisualFilledBoxCount(bottomLayer, {
      boxCapacityKg: harvestBoxCapacityKg,
      maxBoxes: safeHarvestBoxesPerPallet,
    });
    const availableBoxCount = Math.max(0, safeHarvestBoxesPerPallet - filledBoxCount);
    const availableKg = Math.max(
      0,
      Math.round(((safeHarvestPalletCapacityKg - usedKg) + Number.EPSILON) * 10) / 10
    );
    const hasStoredHarvest = Boolean(slotEntry?.sourceType === 'harvest' || slotEntry?.sourceType === 'floorHarvest');
    const hasEmptyPallet = Boolean(slotEntry) && !hasStoredHarvest && !isFloorStored;
    const sameSourceSlot = sourceType === 'warehouse-slot'
      && sourceFacilityKey === targetFacilityKey
      && sourceSlotNo === storageSlotNo;
    const canStackTop = unloadMode !== 'individual'
      && Boolean(selectedTransportCanStackPallet)
      && hasStoredHarvest
      && !isFloorStored
      && !sameSourceSlot
      && !topLayer
      && filledBoxCount >= safeHarvestBoxesPerPallet;
    const targetType = unloadMode === 'individual'
      ? (
        hasStoredHarvest
          ? (isFloorStored ? 'warehouse-floor-harvest' : 'warehouse-harvest-pallet')
          : (hasEmptyPallet ? 'warehouse-empty-pallet' : 'warehouse-empty')
      )
      : (
        hasStoredHarvest
          ? (canStackTop ? 'warehouse-stack-top' : 'warehouse-harvest-pallet-blocked')
          : 'warehouse-empty'
      );
    let blockReason = '';
    if (!picker) {
      blockReason = '옮길 수확물을 먼저 선택해 주세요.';
    } else if (!targetFacilityKey) {
      blockReason = '창고를 먼저 선택해 주세요.';
    } else if (sourceType === 'warehouse-general') {
      blockReason = '일반저장 수확물은 먼저 운반기구에 실어야 합니다.';
    } else if (sameSourceSlot) {
      blockReason = '같은 적재칸으로는 이동할 수 없습니다.';
    } else if (unloadMode !== 'individual' && hasStoredHarvest && !canStackTop) {
      blockReason = palletMoveBlockedLabel;
    } else if (unloadMode !== 'individual' && !canStackTop && availableBoxCount <= 0) {
      blockReason = fullBlockedLabel;
    } else if (topLayer && targetType !== 'warehouse-stack-top') {
      blockReason = palletMoveBlockedLabel;
    }
    return {
      occupied: hasStoredHarvest || hasEmptyPallet,
      hasStoredHarvest,
      hasEmptyPallet,
      isFloorStored,
      bottomLayer,
      filledBoxCount,
      loadLabel: String(bottomLayer?.loadLabel || bottomLayer?.floorBoxText || ''),
      usedKg,
      availableKg,
      availableBoxCount,
      target: {
        targetType: String(targetType || ''),
        facilityKey: targetFacilityKey,
        slotNo: storageSlotNo,
        availableKg,
        availableBoxCount,
        canChoose: !blockReason && !String(targetType || '').endsWith('-blocked'),
        blockReason,
        displayLabel,
        ...extraTarget
      }
    };
  };

  const sortingRows = useMemo(
    () => {
      const unloadMode = String(selectedTransportMode || 'pallet') === 'individual' ? 'individual' : 'pallet';
      const sourceTypeRaw = String(picker?.sourceType || 'warehouse-slot');
      const sourceType = sourceTypeRaw === 'vehicle-slot'
        ? 'vehicle-slot'
        : (
          sourceTypeRaw === 'warehouse-general'
            ? 'warehouse-general'
            : (sourceTypeRaw === 'empty-pallet-stock' ? 'empty-pallet-stock' : 'warehouse-slot')
        );
      const sourceFacilityKey = String(picker?.sourceFacilityKey || '');
      const sourceSlotNo = Math.max(1, Math.floor(Number(picker?.sourceSlotNo) || 0));
      const targetFacilityKey = String(picker?.targetFacilityKey || activeFacilityStorageKey || '');
      const safeHarvestPalletCapacityKg = Math.max(0, Number(harvestPalletCapacityKg) || 0);
      const safeHarvestBoxesPerPallet = Math.max(1, Math.floor(Number(harvestBoxesPerPallet) || 36));
      const savedSlotsRaw = targetFacilityKey
        ? (Array.isArray(harvestSlotByFacility?.[targetFacilityKey]) ? harvestSlotByFacility[targetFacilityKey] : [])
        : [];
      const storedHarvestSlotsByNo = targetFacilityKey
        ? (harvestStoredPalletSlotsByFacility?.[targetFacilityKey] || {})
        : {};
      const storedFloorRowsBySlot = targetFacilityKey
        ? (harvestStoredFloorSummaryRowsByFacilityAndSlot?.[targetFacilityKey] || {})
        : {};
      return sortingSlots
        .filter((slot) => slot?.item)
        .map((slot) => {
          const sortingSlotKey = String(slot?.key || '');
          const storageSlots = sortingStorageSlotsOf(slot.item).map((positionSlot) => {
            const cargoSlotKey = String(positionSlot?.key || '');
            const storageSlotNo = sortingCargoStorageSlotNoOf(sortingSlotKey, cargoSlotKey);
            const slotEntry = buildSortingCargoSlotEntry({
              storageSlotNo,
              savedSlotsRaw,
              storedHarvestSlotsByNo,
              storedFloorRowsBySlot,
              buildHarvestPalletSlotEntries,
            });
            const targetInfo = buildStorageTargetForAuxSlot({
              slotEntry,
              storageSlotNo,
              targetFacilityKey,
              sourceType,
              sourceFacilityKey,
              sourceSlotNo,
              unloadMode,
              safeHarvestBoxesPerPallet,
              safeHarvestPalletCapacityKg,
              palletMoveBlockedLabel: '이미 사용 중인 선별기 적재칸에는 팔레트째 이동할 수 없습니다.',
              fullBlockedLabel: `적재칸이 가득 찼습니다. (최대 ${safeHarvestBoxesPerPallet.toLocaleString()}박스)`,
              displayLabel: `${String(slot?.item?.name || slot?.label || '선별기')} ${String(positionSlot?.title || '')}`.trim(),
              extraTarget: {
                key: `sorting-cargo:${targetFacilityKey}:${sortingSlotKey}:${cargoSlotKey}`,
                isSortingCargoSlot: true,
                sortingSlotKey,
                sortingName: String(slot?.item?.name || slot?.label || '선별기'),
                cargoSlotKey,
                cargoSlotLabel: String(positionSlot?.title || '')
              }
            });
            return {
              ...positionSlot,
              storageSlotNo,
              ...targetInfo
            };
          });
          return {
            key: sortingSlotKey,
            title: String(slot?.item?.name || slot?.label || '선별기'),
            desc: String(slot?.label || ''),
            storageSlots
          };
        });
    },
    [
      activeFacilityStorageKey,
      buildHarvestPalletSlotEntries,
      harvestBoxCapacityKg,
      harvestBoxesPerPallet,
      harvestPalletCapacityKg,
      harvestSlotByFacility,
      harvestStoredFloorSummaryRowsByFacilityAndSlot,
      harvestStoredPalletSlotsByFacility,
      picker,
      selectedTransportCanStackPallet,
      selectedTransportMode,
      sortingSlots,
      sortingStorageSlotsOf
    ]
  );

  const workbenchTargetSlotRows = useMemo(
    () => workbenchRows.flatMap((row) => (
      (row?.cargoSlots || []).map((cargoSlot) => {
        const target = cargoSlot?.target || {};
        const disabled = !target?.canChoose;
        const statusLabel = harvestStorageMoveStatusLabelOf(target, {
          disabled,
          emptyLabel: '적재',
          occupiedLabel: '적재 불가',
          emptyPalletLabel: '적재',
          floorHarvestLabel: '추가 적재',
          harvestPalletLabel: '추가 적재 가능',
          stackTopLabel: '2단 적재'
        });
        const topLayer = cargoSlot?.bottomLayer?.topLayer || cargoSlot?.topLayer || null;
        return {
          slotNo: Math.max(0, Math.floor(Number(cargoSlot?.storageSlotNo) || 0)),
          facilityKey: String(target?.facilityKey || ''),
          targetType: String(target?.targetType || ''),
          title: String(cargoSlot?.label || target?.cargoSlotLabel || ''),
          desc: statusLabel,
          occupied: Boolean(cargoSlot?.occupied),
          entry: cargoSlot?.bottomLayer || null,
          sourceType: String(cargoSlot?.bottomLayer?.sourceType || ''),
          sourceLabel: String(cargoSlot?.bottomLayer?.sourceLabel || ''),
          isFloorStored: Boolean(cargoSlot?.isFloorStored),
          isHarvestStored: Boolean(cargoSlot?.hasStoredHarvest),
          hasTopLayer: Boolean(topLayer),
          loadBoxKey: String(cargoSlot?.bottomLayer?.loadBoxKey || ''),
          boxTone: String(cargoSlot?.bottomLayer?.boxTone || ''),
          filledBoxTones: Array.isArray(cargoSlot?.bottomLayer?.filledBoxTones)
            ? cargoSlot.bottomLayer.filledBoxTones
            : [],
          partialBoxTones: Array.isArray(cargoSlot?.bottomLayer?.partialBoxTones)
            ? cargoSlot.bottomLayer.partialBoxTones
            : [],
          storagePalletPartialBoxCount: Math.max(0, Math.floor(Number(cargoSlot?.bottomLayer?.storagePalletPartialBoxCount) || 0)),
          topLayer: topLayer ? {
            ...topLayer,
            slotNo: Math.max(0, Math.floor(Number(cargoSlot?.storageSlotNo) || 0))
          } : null,
          loadLabel: String(cargoSlot?.loadLabel || ''),
          filledBoxCount: Math.max(0, Math.floor(Number(cargoSlot?.filledBoxCount) || 0)),
          topLayerFilledBoxCount: topLayer
            ? harvestStorageSlotVisualFilledBoxCount(topLayer, {
              boxCapacityKg: harvestBoxCapacityKg,
              maxBoxes: harvestBoxesPerPallet,
            })
            : 0,
          availableKg: Math.max(0, Number(cargoSlot?.availableKg) || 0),
          availableBoxCount: Math.max(0, Math.floor(Number(cargoSlot?.availableBoxCount) || 0)),
          canChoose: !disabled,
          blockReason: String(target?.blockReason || ''),
          isWorkbenchCargoSlot: true,
          workbenchSlotKey: String(target?.workbenchSlotKey || row?.key || ''),
          workbenchSlotLabel: String(target?.workbenchSlotLabel || row?.slotLabel || ''),
          workbenchName: String(target?.workbenchName || row?.title || ''),
          cargoSlotKey: String(target?.cargoSlotKey || cargoSlot?.key || ''),
          cargoSlotLabel: String(target?.cargoSlotLabel || cargoSlot?.label || ''),
          displayLabel: String(target?.displayLabel || `${row?.title || ''} ${cargoSlot?.label || ''}`.trim())
        };
      })
    )),
    [harvestBoxCapacityKg, harvestBoxesPerPallet, workbenchRows]
  );

  const sortingTargetSlotRows = useMemo(
    () => sortingRows.flatMap((row) => (
      (row?.storageSlots || []).map((cargoSlot) => {
        const target = cargoSlot?.target || {};
        const disabled = !target?.canChoose;
        const statusLabel = harvestStorageMoveStatusLabelOf(target, {
          disabled,
          emptyLabel: '적재',
          occupiedLabel: '적재 불가',
          emptyPalletLabel: '적재',
          floorHarvestLabel: '추가 적재',
          harvestPalletLabel: '추가 적재 가능',
          stackTopLabel: '2단 적재'
        });
        const topLayer = cargoSlot?.bottomLayer?.topLayer || cargoSlot?.topLayer || null;
        return {
          slotNo: Math.max(0, Math.floor(Number(cargoSlot?.storageSlotNo) || 0)),
          facilityKey: String(target?.facilityKey || ''),
          targetType: String(target?.targetType || ''),
          title: String(cargoSlot?.title || target?.cargoSlotLabel || ''),
          desc: statusLabel,
          occupied: Boolean(cargoSlot?.occupied),
          entry: cargoSlot?.bottomLayer || null,
          sourceType: String(cargoSlot?.bottomLayer?.sourceType || ''),
          sourceLabel: String(cargoSlot?.bottomLayer?.sourceLabel || ''),
          isFloorStored: Boolean(cargoSlot?.isFloorStored),
          isHarvestStored: Boolean(cargoSlot?.hasStoredHarvest),
          hasTopLayer: Boolean(topLayer),
          loadBoxKey: String(cargoSlot?.bottomLayer?.loadBoxKey || ''),
          boxTone: String(cargoSlot?.bottomLayer?.boxTone || ''),
          filledBoxTones: Array.isArray(cargoSlot?.bottomLayer?.filledBoxTones)
            ? cargoSlot.bottomLayer.filledBoxTones
            : [],
          partialBoxTones: Array.isArray(cargoSlot?.bottomLayer?.partialBoxTones)
            ? cargoSlot.bottomLayer.partialBoxTones
            : [],
          storagePalletPartialBoxCount: Math.max(0, Math.floor(Number(cargoSlot?.bottomLayer?.storagePalletPartialBoxCount) || 0)),
          topLayer: topLayer ? {
            ...topLayer,
            slotNo: Math.max(0, Math.floor(Number(cargoSlot?.storageSlotNo) || 0))
          } : null,
          loadLabel: String(cargoSlot?.loadLabel || ''),
          filledBoxCount: Math.max(0, Math.floor(Number(cargoSlot?.filledBoxCount) || 0)),
          topLayerFilledBoxCount: topLayer
            ? harvestStorageSlotVisualFilledBoxCount(topLayer, {
              boxCapacityKg: harvestBoxCapacityKg,
              maxBoxes: harvestBoxesPerPallet,
            })
            : 0,
          availableKg: Math.max(0, Number(cargoSlot?.availableKg) || 0),
          availableBoxCount: Math.max(0, Math.floor(Number(cargoSlot?.availableBoxCount) || 0)),
          canChoose: !disabled,
          blockReason: String(target?.blockReason || ''),
          isSortingCargoSlot: true,
          sortingSlotKey: String(target?.sortingSlotKey || row?.key || ''),
          sortingName: String(target?.sortingName || row?.title || ''),
          cargoSlotKey: String(target?.cargoSlotKey || cargoSlot?.key || ''),
          cargoSlotLabel: String(target?.cargoSlotLabel || cargoSlot?.title || ''),
          displayLabel: String(target?.displayLabel || `${row?.title || ''} ${cargoSlot?.title || ''}`.trim())
        };
      })
    )),
    [harvestBoxCapacityKg, harvestBoxesPerPallet, sortingRows]
  );

  return {
    titleSummaryLabel,
    targetSummaryLabel,
    targetSummaryVisual,
    generalRows,
    sortingRows,
    sortingTargetSlotRows,
    workbenchRows,
    workbenchTargetSlotRows
  };
}
