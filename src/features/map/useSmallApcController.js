import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildAppleSortingPlan } from '../../utils/appleSorting';

const SMALL_APC_SHIPPING_VEHICLE_PROFILES = [
  {
    name: '현대 마이티 4톤',
    keywords: ['현대', '마이티', '4톤'],
    minBoxCount: 0,
  },
  {
    name: 'MAN TGM 18.320',
    keywords: ['MAN', 'TGM', '18.320'],
    minBoxCount: 144,
  },
];

export default function useSmallApcController({
  game,
  setGame,
  smallApcMapOpen,
  setMapLocationModal,
  setTownMarkerParkingModal,
  appendPhoneNotificationsStatePatch,
  pushDiary,
  won,
  appendSmallApcColdStorageRows,
  buildSmallApcStemRemovalJobsForTicket,
  buildSmallApcSortingJobsForUnload,
  buildSmallApcHarvestRowsForVehicle,
  buildSmallApcUnloadTempStorageEntries,
  normalizeCargoByItemKey,
  appendMapShopTempStorageEntries,
  normalizeSmallApcStemRemovalJobs,
  normalizeSmallApcSortingJobs,
  normalizeSmallApcSortingOutputBins,
  normalizeSmallApcColdStorageByBuilding,
  normalizeSmallApcColdStorageEntry,
  normalizeSmallApcPackingJobs,
  normalizeSmallApcShippingJobs,
  rebalanceSmallApcStaffAssignments,
  buildSmallApcStaffingProfile,
  buildSmallApcHarvestRowsForSettlementTicket,
  buildSmallApcSettlementDraft,
  townMarkerParkingStorageKeyOf,
  clearVehicleFromSettlementParking,
  normalizeActiveTownMarkerParkingSlots,
  SMALL_APC_COLD_STORAGE_BUILDING_KEYS,
  SMALL_APC_STEM_REMOVAL_BASE_DURATION_MS,
  SMALL_APC_STEM_REMOVAL_MOVE_OUT_DURATION_MS,
  SMALL_APC_SORTING_BASE_DURATION_MS,
  SMALL_APC_SORTING_MOVE_OUT_DURATION_MS,
  SMALL_APC_PLAYER_POST_UNLOAD_FINE_WON,
  devPlayerWorkSkipEnabled = false,
  devPlayerSortingSkipEnabled = false,
}) {
  const [smallApcLiveNotice, setSmallApcLiveNotice] = useState(null);
  const [smallApcLiveNoticeQueue, setSmallApcLiveNoticeQueue] = useState([]);
  const [smallApcWorkflowNow, setSmallApcWorkflowNow] = useState(() => Date.now());
  const SMALL_APC_BOX_CAPACITY_KG = 20;
  const SMALL_APC_BOXES_PER_PALLET = 36;
  const SMALL_APC_PALLETS_PER_SLOT = 3;
  const SMALL_APC_PALLET_CAPACITY_KG = SMALL_APC_BOX_CAPACITY_KG * SMALL_APC_BOXES_PER_PALLET;
  const SMALL_APC_SHIPPING_MIN_PALLET_COUNT = 4;
  const SMALL_APC_SHIPPING_MIN_BOX_COUNT = SMALL_APC_BOXES_PER_PALLET * SMALL_APC_SHIPPING_MIN_PALLET_COUNT;
  const SMALL_APC_SHIPPING_CALL_MIN_DELAY_MS = 3 * 60 * 1000;
  const SMALL_APC_SHIPPING_CALL_MAX_DELAY_MS = 5 * 60 * 1000;
  const SMALL_APC_PACKING_BASE_DURATION_MS = 12000;
  const SMALL_APC_PACKING_BOX_DURATION_MS = 350;
  const SMALL_APC_PACKING_OUTPUT_BUFFER_MS = 4000;
  const SMALL_APC_SHIPPING_BASE_DURATION_MS = 9000;
  const SMALL_APC_SHIPPING_PARKING_SLOT_COUNT = 4;
  const SMALL_APC_UNLOAD_BUILDING_KEY = 'building-1';
  const SMALL_APC_SORTED_BUILDING_KEY = 'building-2';
  const SMALL_APC_SHIPPING_BUILDING_KEY = 'building-3';
  const activeSmallApcWorkersOf = useCallback((staffState = null, facilityKey = '') => {
    if (typeof buildSmallApcStaffingProfile !== 'function') return 0;
    const profile = buildSmallApcStaffingProfile(staffState);
    return Math.max(0, Number(profile?.facilityByKey?.[facilityKey]?.activeWorkers || 0));
  }, [buildSmallApcStaffingProfile]);
  const pauseSmallApcTimedJobsWhenUnstaffed = useCallback((jobs = [], {
    now = Date.now(),
    activeWorkers = 0,
    isDone = null,
  } = {}) => {
    const normalizedJobs = Array.isArray(jobs) ? jobs : [];
    const hasActiveWorkers = Math.max(0, Number(activeWorkers || 0)) > 0;
    let changed = false;
    const nextJobs = normalizedJobs.map((job) => {
      if (!job || typeof job !== 'object') return job;
      if (typeof isDone === 'function' && isDone(job)) return job;
      const startedAt = Math.max(0, Number(job?.startedAt || 0));
      if (startedAt <= 0 || now < startedAt) {
        const nextJob = job?.lastStaffCheckedAt ? { ...job, lastStaffCheckedAt: 0 } : job;
        if (nextJob !== job) changed = true;
        return nextJob;
      }
      const lastStaffCheckedAt = Math.max(startedAt, Number(job?.lastStaffCheckedAt || startedAt));
      if (hasActiveWorkers) {
        if (Number(job?.lastStaffCheckedAt || 0) === now) return job;
        changed = true;
        return {
          ...job,
          lastStaffCheckedAt: now,
        };
      }
      const stalledMs = Math.max(0, now - lastStaffCheckedAt);
      if (stalledMs <= 0 && Number(job?.lastStaffCheckedAt || 0) === now) return job;
      changed = true;
      return {
        ...job,
        startedAt: startedAt + stalledMs,
        moveInStartedAt: Math.max(0, Number(job?.moveInStartedAt || 0)) + stalledMs,
        lastStaffCheckedAt: now,
      };
    });
    return changed ? nextJobs : normalizedJobs;
  }, []);
  const applyStemRemovalSkipTiming = useCallback((jobs = [], now = Date.now()) => (
    (Array.isArray(jobs) ? jobs : []).map((job) => {
      if (!devPlayerWorkSkipEnabled || !job?.playerOwned) return job;
      const durationMs = Math.max(100, Number(job?.durationMs || SMALL_APC_STEM_REMOVAL_BASE_DURATION_MS));
      const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || SMALL_APC_STEM_REMOVAL_MOVE_OUT_DURATION_MS));
      const startedAt = now - durationMs - moveOutDurationMs - 1;
      return {
        ...job,
        moveInStartedAt: Math.max(0, startedAt - Math.max(100, Number(job?.moveInDurationMs || 100))),
        startedAt,
      };
    })
  ), [SMALL_APC_STEM_REMOVAL_BASE_DURATION_MS, SMALL_APC_STEM_REMOVAL_MOVE_OUT_DURATION_MS, devPlayerWorkSkipEnabled]);
  const applySortingSkipTiming = useCallback((jobs = [], now = Date.now()) => (
    (Array.isArray(jobs) ? jobs : []).map((job) => {
      if (!devPlayerSortingSkipEnabled || !job?.playerOwned) return job;
      const durationMs = Math.max(100, Number(job?.durationMs || SMALL_APC_SORTING_BASE_DURATION_MS));
      const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || SMALL_APC_SORTING_MOVE_OUT_DURATION_MS));
      const startedAt = now - durationMs - moveOutDurationMs - 1;
      return {
        ...job,
        moveInStartedAt: Math.max(0, startedAt - Math.max(100, Number(job?.moveInDurationMs || 100))),
        startedAt,
      };
    })
  ), [SMALL_APC_SORTING_BASE_DURATION_MS, SMALL_APC_SORTING_MOVE_OUT_DURATION_MS, devPlayerSortingSkipEnabled]);
  const smallApcFreshnessBucketOf = useCallback((freshnessRaw = 0) => {
    const freshness = Math.max(0, Math.min(100, Number(freshnessRaw) || 0));
    if (freshness >= 80) return '상';
    if (freshness >= 50) return '중';
    return '하';
  }, []);

  const buildSmallApcSettlementPreviewRows = useCallback((harvestRows = []) => {
    const grouped = new Map();
    const distributeBoxCountsByWeight = (rows = [], totalBoxesRaw = 0) => {
      const sourceRows = (Array.isArray(rows) ? rows : []).filter((row) => Math.max(0, Number(row?.totalKg || 0)) > 0.001);
      if (!sourceRows.length) return [];
      const totalBoxes = Math.max(0, Math.floor(Number(totalBoxesRaw) || 0));
      if (totalBoxes <= 0) {
        return sourceRows.map((row) => ({
          ...row,
          boxCount: Math.max(1, Math.ceil(Math.max(0, Number(row?.totalKg || 0)) / SMALL_APC_BOX_CAPACITY_KG)),
        }));
      }
      const totalKg = sourceRows.reduce((sum, row) => sum + Math.max(0, Number(row?.totalKg || 0)), 0);
      if (totalKg <= 0.001) {
        return sourceRows.map((row, index) => ({
          ...row,
          boxCount: index < totalBoxes ? 1 : 0,
        })).filter((row) => row.boxCount > 0);
      }
      const positiveRowCount = sourceRows.length;
      const withBase = totalBoxes >= positiveRowCount;
      const baseBoxCount = withBase ? 1 : 0;
      let remainingBoxes = totalBoxes - (withBase ? positiveRowCount : 0);
      if (remainingBoxes < 0) remainingBoxes = 0;
      const seeded = sourceRows.map((row) => {
        const weight = Math.max(0, Number(row?.totalKg || 0)) / totalKg;
        const rawExtra = remainingBoxes * weight;
        const extraFloor = Math.floor(rawExtra);
        return {
          ...row,
          boxCount: baseBoxCount + extraFloor,
          __fraction: rawExtra - extraFloor,
          __weight: weight,
        };
      });
      let assignedBoxes = seeded.reduce((sum, row) => sum + Math.max(0, Number(row?.boxCount || 0)), 0);
      let leftoverBoxes = Math.max(0, totalBoxes - assignedBoxes);
      if (!withBase && leftoverBoxes > 0) {
        seeded
          .sort((a, b) => {
            const fractionDiff = Number(b?.__fraction || 0) - Number(a?.__fraction || 0);
            if (fractionDiff !== 0) return fractionDiff;
            return Number(b?.__weight || 0) - Number(a?.__weight || 0);
          })
          .forEach((row) => {
            if (leftoverBoxes <= 0) return;
            row.boxCount += 1;
            leftoverBoxes -= 1;
          });
      } else if (leftoverBoxes > 0) {
        seeded
          .sort((a, b) => {
            const fractionDiff = Number(b?.__fraction || 0) - Number(a?.__fraction || 0);
            if (fractionDiff !== 0) return fractionDiff;
            return Number(b?.__weight || 0) - Number(a?.__weight || 0);
          })
          .forEach((row) => {
            if (leftoverBoxes <= 0) return;
            row.boxCount += 1;
            leftoverBoxes -= 1;
          });
      }
      return seeded
        .filter((row) => Math.max(0, Number(row?.boxCount || 0)) > 0)
        .map(({ __fraction, __weight, ...rest }) => rest);
    };
    const appendGroupedRow = (row = null) => {
      if (!row) return;
      const totalKg = Math.max(0, Number(row?.totalKg || 0));
      const boxCount = Math.max(0, Math.floor(Number(row?.boxCount || 0)));
      if (totalKg <= 0.001 || boxCount <= 0) return;
      const groupKey = [
        String(row?.cropLabel || '수확물').trim(),
        String(row?.produceTypeLabel || '사과').trim(),
        String(row?.qualityLabel || '보통').trim(),
        String(row?.gradeLabel || '미선별').trim(),
        String(row?.sizeLabel || '미측정').trim(),
        Boolean(row?.stemRemoved) ? 'removed' : 'attached',
        String(row?.freshnessBucketLabel || '').trim() || smallApcFreshnessBucketOf(row?.life),
      ].join('::');
      const current = grouped.get(groupKey) || {
        rowKey: String(row?.rowKey || '').trim() || `small-apc-settlement-preview-${grouped.size + 1}`,
        cropLabel: String(row?.cropLabel || '수확물').trim() || '수확물',
        produceTypeLabel: String(row?.produceTypeLabel || '사과').trim() || '사과',
        qualityLabel: String(row?.qualityLabel || '보통').trim() || '보통',
        gradeLabel: String(row?.gradeLabel || '미선별').trim() || '미선별',
        sizeLabel: String(row?.sizeLabel || '미측정').trim() || '미측정',
        stemRemoved: Boolean(row?.stemRemoved),
        freshnessBucketLabel: String(row?.freshnessBucketLabel || '').trim() || smallApcFreshnessBucketOf(row?.life),
        life: 0,
        boxCount: 0,
        totalKg: 0,
        lifeWeightTotalKg: 0,
      };
      current.boxCount += boxCount;
      current.totalKg += totalKg;
      current.life += Math.max(0, Number(row?.life || 0)) * totalKg;
      current.lifeWeightTotalKg += totalKg;
      grouped.set(groupKey, current);
    };

    (Array.isArray(harvestRows) ? harvestRows : []).forEach((sourceRow, sourceIndex) => {
      const totalKg = Math.max(0, Number(sourceRow?.totalKg || 0));
      const quality = Math.max(0, Number(sourceRow?.life || 0));
      const sourceBoxCount = Math.max(0, Math.floor(Number(sourceRow?.boxCount || 0)));
      if (totalKg <= 0.001) return;
      const sortingPlan = buildAppleSortingPlan({ totalKg, quality });
      const sourceGradeLabel = String(sourceRow?.gradeLabel || '미선별').trim() || '미선별';
      let outputRows = [];
      if (!sourceGradeLabel || sourceGradeLabel === '미선별') {
        outputRows = [
          ...((sortingPlan?.rows?.a || []).map((row) => ({ gradeLabel: 'A급', dieKey: String(row?.dieKey || ''), sizeLabel: String(row?.dieLabel || '미측정'), totalKg: Math.max(0, Number(row?.kg || 0)) }))),
          ...((sortingPlan?.rows?.b || []).map((row) => ({ gradeLabel: 'B급', dieKey: String(row?.dieKey || ''), sizeLabel: String(row?.dieLabel || '미측정'), totalKg: Math.max(0, Number(row?.kg || 0)) }))),
          ...((sortingPlan?.rows?.processing || []).map((row) => ({ gradeLabel: '가공급', dieKey: String(row?.dieKey || ''), sizeLabel: String(row?.dieLabel || '미측정'), totalKg: Math.max(0, Number(row?.kg || 0)) }))),
        ];
      } else if (sourceGradeLabel === '가공급') {
        outputRows = (sortingPlan?.rows?.processing || []).map((row) => ({
          gradeLabel: '가공급',
          dieKey: String(row?.dieKey || ''),
          sizeLabel: String(row?.dieLabel || '10다이').trim() || '10다이',
          totalKg: Math.max(0, Number(row?.kg || 0)),
        }));
      } else if (sourceGradeLabel === 'A급' || sourceGradeLabel === 'B급') {
        const dieRows = sourceGradeLabel === 'A급'
          ? (sortingPlan?.rows?.a || [])
          : (sortingPlan?.rows?.b || []);
        outputRows = dieRows.map((row) => ({
          gradeLabel: sourceGradeLabel,
          dieKey: String(row?.dieKey || ''),
          sizeLabel: String(row?.dieLabel || '미측정').trim() || '미측정',
          totalKg: Math.max(0, Number(row?.kg || 0)),
        }));
      }
      const distributedRows = distributeBoxCountsByWeight(
        outputRows
          .filter((row) => row.totalKg > 0.001 && row.dieKey)
          .map((row, outputIndex) => ({
            rowKey: `${String(sourceRow?.rowKey || `settlement-preview-${sourceIndex + 1}`)}-${outputIndex + 1}`,
            cropLabel: String(sourceRow?.cropLabel || sourceRow?.produceTypeLabel || '사과').trim() || '사과',
            produceTypeLabel: String(sourceRow?.produceTypeLabel || '사과').trim() || '사과',
            qualityLabel: String(sourceRow?.qualityLabel || '보통').trim() || '보통',
            gradeLabel: String(row?.gradeLabel || '').trim() || '미선별',
            sizeLabel: String(row?.sizeLabel || '미측정').trim() || '미측정',
            stemRemoved: true,
            life: quality,
            freshnessBucketLabel: smallApcFreshnessBucketOf(quality),
            totalKg: Math.max(0, Number(row?.totalKg || 0)),
          })),
        sourceBoxCount
      );
      distributedRows.forEach((row) => appendGroupedRow(row));
    });

    return Array.from(grouped.values())
      .map((row) => {
        const weightKg = Math.max(0, Number(row?.lifeWeightTotalKg || 0));
        const { lifeWeightTotalKg, ...rest } = row || {};
        return {
          ...rest,
          life: weightKg > 0 ? Math.round((Number(row?.life || 0) / weightKg) * 10) / 10 : 0,
        };
      })
      .filter((row) => Math.max(0, Number(row?.boxCount || 0)) > 0 && Math.max(0, Number(row?.totalKg || 0)) > 0.001);
  }, [SMALL_APC_BOX_CAPACITY_KG, smallApcFreshnessBucketOf]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setSmallApcWorkflowNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  const placeRowsIntoColdStorage = useCallback((coldStorageByBuilding, rows = [], preferredBuildingKeys = []) => {
    const nextColdStorageByBuilding = normalizeSmallApcColdStorageByBuilding(coldStorageByBuilding);
    const pendingRows = Array.isArray(rows) ? rows.map((row) => normalizeSmallApcColdStorageEntry(row)).filter(Boolean) : [];
    const placedRows = [];
    const slotSignatureOf = (entry = null) => {
      const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
      if (!normalizedEntry) return '';
      return [
        String(normalizedEntry?.sourceTicketNo || '').trim(),
        String(normalizedEntry?.cropLabel || '수확물').trim(),
        String(normalizedEntry?.produceTypeLabel || '사과').trim(),
        String(normalizedEntry?.qualityLabel || '보통').trim(),
        String(normalizedEntry?.gradeLabel || '미선별').trim(),
        String(normalizedEntry?.sizeLabel || '미측정').trim(),
        normalizedEntry?.stemRemoved ? 'removed' : 'attached',
        String(normalizedEntry?.apcStorageStatus || '보관중').trim() || '보관중',
        String(normalizedEntry?.apcPackTypeLabel || '').trim(),
      ].join('::');
    };
    const mergeColdStorageEntry = (baseEntry = null, incomingEntry = null) => {
      const base = normalizeSmallApcColdStorageEntry(baseEntry);
      const incoming = normalizeSmallApcColdStorageEntry(incomingEntry);
      if (!base || !incoming) return base || incoming || null;
      const mergedBoxCount = Math.max(0, Number(base?.boxCount || 0)) + Math.max(0, Number(incoming?.boxCount || 0));
      const mergedTotalKg = Math.max(0, Number(base?.totalKg || 0)) + Math.max(0, Number(incoming?.totalKg || 0));
      const weightedLife = mergedTotalKg > 0
        ? (
            ((Math.max(0, Number(base?.life || 0)) * Math.max(0, Number(base?.totalKg || 0)))
            + (Math.max(0, Number(incoming?.life || 0)) * Math.max(0, Number(incoming?.totalKg || 0))))
            / mergedTotalKg
          )
        : 0;
      const mergedEntry = normalizeSmallApcColdStorageEntry({
        ...base,
        life: Math.round((weightedLife + Number.EPSILON) * 10) / 10,
        storedAt: Math.max(Math.max(0, Number(base?.storedAt || 0)), Math.max(0, Number(incoming?.storedAt || 0))),
        apcStorageStatusUpdatedAt: Math.max(
          Math.max(0, Number(base?.apcStorageStatusUpdatedAt || 0)),
          Math.max(0, Number(incoming?.apcStorageStatusUpdatedAt || 0))
        ),
        boxCount: mergedBoxCount,
        totalKg: mergedTotalKg,
        palletStackCount: Math.max(1, Math.ceil(mergedBoxCount / SMALL_APC_BOXES_PER_PALLET)),
      });
      return mergedEntry;
    };
    const safePreferredOrder = Array.isArray(preferredBuildingKeys) && preferredBuildingKeys.length
      ? preferredBuildingKeys
      : SMALL_APC_COLD_STORAGE_BUILDING_KEYS;
    let sourceIndex = 0;
    safePreferredOrder.forEach((buildingKey) => {
      const buildingSlots = Array.isArray(nextColdStorageByBuilding?.[buildingKey]) ? [...nextColdStorageByBuilding[buildingKey]] : [];
      while (sourceIndex < pendingRows.length) {
        const nextEntry = normalizeSmallApcColdStorageEntry(pendingRows[sourceIndex]);
        if (!nextEntry) {
          sourceIndex += 1;
          continue;
        }
        const mergeableIndex = buildingSlots.findIndex((entry) => {
          const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
          if (!normalizedEntry) return false;
          if (slotSignatureOf(normalizedEntry) !== slotSignatureOf(nextEntry)) return false;
          const mergedBoxCount = Math.max(0, Number(normalizedEntry?.boxCount || 0)) + Math.max(0, Number(nextEntry?.boxCount || 0));
          return mergedBoxCount <= (SMALL_APC_BOXES_PER_PALLET * SMALL_APC_PALLETS_PER_SLOT);
        });
        if (mergeableIndex < 0) break;
        buildingSlots[mergeableIndex] = mergeColdStorageEntry(buildingSlots[mergeableIndex], nextEntry);
        placedRows.push(buildingSlots[mergeableIndex]);
        sourceIndex += 1;
      }
      nextColdStorageByBuilding[buildingKey] = buildingSlots.map((entry) => {
        if (entry || sourceIndex >= pendingRows.length) return entry;
        const nextEntry = pendingRows[sourceIndex];
        sourceIndex += 1;
        placedRows.push(nextEntry);
        return nextEntry;
      });
    });
    return {
      nextColdStorageByBuilding,
      placedRows,
      leftoverRows: pendingRows.slice(sourceIndex),
    };
  }, [SMALL_APC_BOXES_PER_PALLET, SMALL_APC_COLD_STORAGE_BUILDING_KEYS, SMALL_APC_PALLETS_PER_SLOT, normalizeSmallApcColdStorageByBuilding, normalizeSmallApcColdStorageEntry]);

  const placeRowsIntoEmptyColdStorageSlots = useCallback((coldStorageByBuilding, rows = [], buildingKey = SMALL_APC_UNLOAD_BUILDING_KEY) => {
    const nextColdStorageByBuilding = normalizeSmallApcColdStorageByBuilding(coldStorageByBuilding);
    const pendingRows = Array.isArray(rows) ? rows.map((row) => normalizeSmallApcColdStorageEntry(row)).filter(Boolean) : [];
    const targetSlots = Array.isArray(nextColdStorageByBuilding?.[buildingKey]) ? [...nextColdStorageByBuilding[buildingKey]] : [];
    const placedRows = [];
    const leftoverRows = [];
    const mergeIntoSlotLayers = (baseEntry = null, incomingEntry = null) => {
      const base = normalizeSmallApcColdStorageEntry(baseEntry);
      const incoming = normalizeSmallApcColdStorageEntry(incomingEntry);
      if (!base || !incoming) return base || incoming || null;
      const baseLayers = Array.isArray(base?.layerEntries) && base.layerEntries.length
        ? base.layerEntries.map((layerEntry) => normalizeSmallApcColdStorageEntry(layerEntry)).filter(Boolean)
        : [normalizeSmallApcColdStorageEntry({ ...base, layerEntries: undefined, palletStackCount: 1 })].filter(Boolean);
      const incomingLayers = Array.isArray(incoming?.layerEntries) && incoming.layerEntries.length
        ? incoming.layerEntries.map((layerEntry) => normalizeSmallApcColdStorageEntry(layerEntry)).filter(Boolean)
        : [normalizeSmallApcColdStorageEntry({ ...incoming, layerEntries: undefined, palletStackCount: 1 })].filter(Boolean);
      const mergedLayers = [...baseLayers, ...incomingLayers].slice(0, SMALL_APC_PALLETS_PER_SLOT);
      const mergedTotalKg = mergedLayers.reduce((sum, layerEntry) => sum + Math.max(0, Number(layerEntry?.totalKg || 0)), 0);
      const mergedBoxCount = mergedLayers.reduce((sum, layerEntry) => sum + Math.max(0, Number(layerEntry?.boxCount || 0)), 0);
      const weightedLife = mergedTotalKg > 0
        ? mergedLayers.reduce(
          (sum, layerEntry) => sum + (Math.max(0, Number(layerEntry?.life || 0)) * Math.max(0, Number(layerEntry?.totalKg || 0))),
          0
        ) / mergedTotalKg
        : Math.max(0, Number(base?.life || 0));
      return normalizeSmallApcColdStorageEntry({
        ...base,
        life: Math.round((weightedLife + Number.EPSILON) * 10) / 10,
        boxCount: mergedBoxCount,
        totalKg: mergedTotalKg,
        palletStackCount: mergedLayers.length,
        layerEntries: mergedLayers,
        storedAt: Math.max(Math.max(0, Number(base?.storedAt || 0)), Math.max(0, Number(incoming?.storedAt || 0))),
      });
    };
    pendingRows.forEach((nextEntry) => {
      const ticketNo = String(nextEntry?.sourceTicketNo || '').trim();
      const stackableIndex = targetSlots.findIndex((entry) => {
        const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
        if (!normalizedEntry) return false;
        if (String(normalizedEntry?.sourceTicketNo || '').trim() !== ticketNo) return false;
        const currentLayerCount = Array.isArray(normalizedEntry?.layerEntries) && normalizedEntry.layerEntries.length
          ? normalizedEntry.layerEntries.length
          : Math.max(1, Number(normalizedEntry?.palletStackCount || 1));
        return currentLayerCount < SMALL_APC_PALLETS_PER_SLOT;
      });
      if (stackableIndex >= 0) {
        targetSlots[stackableIndex] = mergeIntoSlotLayers(targetSlots[stackableIndex], nextEntry);
        placedRows.push(nextEntry);
        return;
      }
      const emptySlotIndex = targetSlots.findIndex((entry) => !entry);
      if (emptySlotIndex >= 0) {
        targetSlots[emptySlotIndex] = nextEntry;
        placedRows.push(nextEntry);
        return;
      }
      leftoverRows.push(nextEntry);
    });
    nextColdStorageByBuilding[buildingKey] = targetSlots;
    return {
      nextColdStorageByBuilding,
      placedRows,
      leftoverRows,
    };
  }, [SMALL_APC_PALLETS_PER_SLOT, SMALL_APC_UNLOAD_BUILDING_KEY, normalizeSmallApcColdStorageByBuilding, normalizeSmallApcColdStorageEntry]);

  const buildColdStorageRowFromOutputBin = useCallback((bin, totalKg, boxCount, suffix = '') => (
    normalizeSmallApcColdStorageEntry({
      rowKey: `small-apc-sorted-${String(bin?.ticketNo || 'ticket')}-${String(bin?.lineNo || 1)}-${String(bin?.gradeLabel || 'grade')}-${String(bin?.dieKey || 'die')}${suffix ? `-${suffix}` : ''}-${Date.now()}`,
      slotRowKey: `small-apc-sorted-${String(bin?.ticketNo || 'ticket')}-${String(bin?.lineNo || 1)}-${String(bin?.gradeLabel || 'grade')}-${String(bin?.dieKey || 'die')}${suffix ? `-${suffix}` : ''}-${Date.now()}`,
      lineNo: Math.max(1, Number(bin?.lineNo || 1)),
      sourceTicketNo: String(bin?.ticketNo || '').trim(),
      shipperName: String(bin?.shipperName || '').trim(),
      vehicleName: String(bin?.vehicleName || '').trim(),
      vehiclePlateText: String(bin?.vehiclePlateText || '').trim(),
      playerOwned: Boolean(bin?.playerOwned),
      cropId: String(bin?.cropId || 'apple').trim() || 'apple',
      cropLabel: String(bin?.cropLabel || bin?.produceTypeLabel || '사과').trim() || '사과',
      produceTypeLabel: String(bin?.produceTypeLabel || '사과').trim() || '사과',
      qualityLabel: String(bin?.qualityLabel || '보통').trim() || '보통',
      gradeLabel: String(bin?.gradeLabel || '미선별').trim() || '미선별',
      freshnessBucketLabel: String(bin?.freshnessBucketLabel || '').trim() || smallApcFreshnessBucketOf(bin?.life),
      dieKey: String(bin?.dieKey || '').trim(),
      sizeLabel: String(bin?.sizeLabel || '미측정').trim() || '미측정',
      stemRemoved: true,
      life: Math.max(0, Number(bin?.life || 0)),
      harvestedDay: Math.max(0, Number(bin?.harvestedDay || 0)),
      loadBoxKey: '',
      loadBoxImageSrc: '',
      detailText: `${String(bin?.gradeLabel || '미선별')} · ${String(bin?.sizeLabel || '미측정')} · ${Math.max(1, boxCount)}상자`,
      detailLines: [
        `선별라인 L${Math.max(1, Number(bin?.lineNo || 1))}`,
        `${Math.round(Math.max(0, Number(totalKg) || 0)).toLocaleString()}kg`,
      ],
      boxCount: Math.max(1, boxCount),
      totalKg: Math.max(0, Number(totalKg) || 0),
      storedAt: Date.now(),
    })
  ), [normalizeSmallApcColdStorageEntry, smallApcFreshnessBucketOf]);

  const buildSortingOutputBinFromColdStorageRow = useCallback((entry = null) => {
    const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
    if (!normalizedEntry) return null;
    const totalKg = Math.max(0, Number(normalizedEntry?.totalKg || 0));
    if (totalKg <= 0) return null;
    return {
      id: `small-apc-output-${Math.max(1, Number(normalizedEntry?.lineNo || 1))}-${String(normalizedEntry?.sourceTicketNo || '').trim()}-${String(normalizedEntry?.gradeLabel || '')}-${String(normalizedEntry?.dieKey || '')}-${String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim()}`,
      lineNo: Math.max(1, Number(normalizedEntry?.lineNo || 1)),
      ticketNo: String(normalizedEntry?.sourceTicketNo || '').trim(),
      shipperName: String(normalizedEntry?.shipperName || '').trim(),
      vehicleName: String(normalizedEntry?.vehicleName || '').trim(),
      vehiclePlateText: String(normalizedEntry?.vehiclePlateText || '').trim(),
      playerOwned: Boolean(normalizedEntry?.playerOwned),
      cropId: String(normalizedEntry?.cropId || 'apple').trim() || 'apple',
      cropLabel: String(normalizedEntry?.cropLabel || normalizedEntry?.produceTypeLabel || '사과').trim() || '사과',
      produceTypeLabel: String(normalizedEntry?.produceTypeLabel || '사과').trim() || '사과',
      qualityLabel: String(normalizedEntry?.qualityLabel || '보통').trim() || '보통',
      gradeLabel: String(normalizedEntry?.gradeLabel || '미선별').trim() || '미선별',
      freshnessBucketLabel: String(normalizedEntry?.freshnessBucketLabel || '').trim() || smallApcFreshnessBucketOf(normalizedEntry?.life),
      dieKey: String(normalizedEntry?.dieKey || '').trim(),
      sizeLabel: String(normalizedEntry?.sizeLabel || '미측정').trim() || '미측정',
      stemRemoved: true,
      life: Math.max(0, Number(normalizedEntry?.life || 0)),
      totalKg,
      boxCount: Math.max(1, Math.floor(Number(normalizedEntry?.boxCount || Math.ceil(totalKg / SMALL_APC_BOX_CAPACITY_KG)))),
      updatedAt: Date.now(),
    };
  }, [SMALL_APC_BOX_CAPACITY_KG, normalizeSmallApcColdStorageEntry, smallApcFreshnessBucketOf]);
  const buildSplitColdStorageRowsFromEntry = useCallback((entry = null, {
    boxesPerRow = SMALL_APC_BOXES_PER_PALLET,
    rowCount = 1,
    statusLabel = '보관중',
    packTypeLabel = '',
    suffix = 'split',
  } = {}) => {
    const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
    if (!normalizedEntry) return [];
    const safeBoxesPerRow = Math.max(1, Math.floor(Number(boxesPerRow) || SMALL_APC_BOXES_PER_PALLET));
    const safeRowCount = Math.max(0, Math.floor(Number(rowCount) || 0));
    const totalBoxCount = Math.max(1, Math.floor(Number(normalizedEntry?.boxCount || 0)));
    const approxBoxKg = totalBoxCount > 0
      ? (Math.max(0, Number(normalizedEntry?.totalKg || 0)) / totalBoxCount)
      : SMALL_APC_BOX_CAPACITY_KG;
    return Array.from({ length: safeRowCount }, (_, index) => normalizeSmallApcColdStorageEntry({
      ...normalizedEntry,
      rowKey: `${String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || 'small-apc-entry')}-${suffix}-${index + 1}-${Date.now()}`,
      slotRowKey: `${String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || 'small-apc-entry')}-${suffix}-${index + 1}-${Date.now()}`,
      boxCount: safeBoxesPerRow,
      totalKg: Math.max(0, Math.round((safeBoxesPerRow * approxBoxKg) * 10) / 10),
      palletStackCount: 1,
      apcStorageStatus: statusLabel,
      apcStorageStatusUpdatedAt: Date.now(),
      apcPackTypeLabel: packTypeLabel,
      storedAt: Date.now(),
    }));
  }, [SMALL_APC_BOXES_PER_PALLET, SMALL_APC_BOX_CAPACITY_KG, normalizeSmallApcColdStorageEntry]);

  const shouldPackSmallApcEntry = useCallback((entry = null) => {
    const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
    const gradeLabel = String(normalizedEntry?.gradeLabel || '미선별').trim();
    return gradeLabel === 'A급';
  }, [normalizeSmallApcColdStorageEntry]);

  const findColdStorageBuildingKeyByRowKey = useCallback((coldStorageByBuilding, sourceSlotRowKeyRaw = '') => {
    const sourceSlotRowKey = String(sourceSlotRowKeyRaw || '').trim();
    if (!sourceSlotRowKey) return '';
    for (const buildingKey of SMALL_APC_COLD_STORAGE_BUILDING_KEYS) {
      const rows = Array.isArray(coldStorageByBuilding?.[buildingKey]) ? coldStorageByBuilding[buildingKey] : [];
      if (rows.some((entry) => String(entry?.slotRowKey || entry?.rowKey || '').trim() === sourceSlotRowKey)) {
        return buildingKey;
      }
    }
    return '';
  }, [SMALL_APC_COLD_STORAGE_BUILDING_KEYS]);

  const buildSmallApcDispatchVehicle = useCallback((entry = null, shippingParkingSlotNo = 1) => {
    const boxCount = Math.max(0, Number(entry?.boxCount || 0));
    const matchedProfile = [...SMALL_APC_SHIPPING_VEHICLE_PROFILES]
      .sort((a, b) => Number(b?.minBoxCount || 0) - Number(a?.minBoxCount || 0))
      .find((profile) => boxCount >= Math.max(0, Number(profile?.minBoxCount || 0)))
      || SMALL_APC_SHIPPING_VEHICLE_PROFILES[0];
    const ticketNo = String(entry?.sourceTicketNo || '').trim();
    const ticketDigits = ticketNo.replace(/\D+/g, '').slice(-2).padStart(2, '0');
    return {
      dispatchVehicleName: String(matchedProfile?.name || '출고 차량').trim() || '출고 차량',
      dispatchVehiclePlateText: `APC-${String(shippingParkingSlotNo).padStart(2, '0')}${ticketDigits}`,
      dispatchVehicleSearchKeywords: Array.isArray(matchedProfile?.keywords) ? matchedProfile.keywords : [],
    };
  }, []);

  const smallApcEligibleShippingBoxCountOfRows = useCallback((rows = []) => (
    (Array.isArray(rows) ? rows : []).reduce((sum, entry) => {
      const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
      if (!normalizedEntry) return sum;
      const gradeLabel = String(normalizedEntry?.gradeLabel || '미선별').trim();
      const statusLabel = String(normalizedEntry?.apcStorageStatus || '보관중').trim() || '보관중';
      if (gradeLabel === '미선별') return sum;
      if (!['보관중', '포장완료', '출고대기'].includes(statusLabel)) return sum;
      return sum + Math.max(0, Number(normalizedEntry?.boxCount || 0));
    }, 0)
  ), [normalizeSmallApcColdStorageEntry]);

  const queueSmallApcLiveNotice = useCallback((draft = null) => {
    if (!draft || typeof draft !== 'object') return;
    setSmallApcLiveNoticeQueue((prev) => ([
      ...prev,
      {
        id: `${String(draft?.type || 'notice')}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...draft,
      }
    ]));
  }, []);

  const smallApcPlayerShipmentTicketSet = useMemo(() => {
    const ticketSet = new Set();
    (Array.isArray(game?.smallApcPlayerShipmentTicketNos) ? game.smallApcPlayerShipmentTicketNos : []).forEach((ticketNo) => {
      const normalizedTicketNo = String(ticketNo || '').trim();
      if (normalizedTicketNo) ticketSet.add(normalizedTicketNo);
    });
    return ticketSet;
  }, [game?.smallApcPlayerShipmentTicketNos]);

  useEffect(() => {
    setSmallApcLiveNotice((prev) => {
      if (!prev || String(prev?.type || '') !== 'sorting-done') return prev;
      const ticketNo = String(prev?.ticketNo || '').trim();
      return ticketNo && smallApcPlayerShipmentTicketSet.has(ticketNo) ? prev : null;
    });
    setSmallApcLiveNoticeQueue((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const next = current.filter((notice) => {
        if (String(notice?.type || '') !== 'sorting-done') return true;
        const ticketNo = String(notice?.ticketNo || '').trim();
        return Boolean(ticketNo && smallApcPlayerShipmentTicketSet.has(ticketNo));
      });
      return next.length === current.length ? current : next;
    });
  }, [smallApcPlayerShipmentTicketSet]);

  const sendSmallApcColdStorageToPacking = useCallback((sourceSlotRowKeyRaw = '', options = null) => {
    const sourceSlotRowKey = String(sourceSlotRowKeyRaw || '').trim();
    const silent = Boolean(options?.silent);
    if (!sourceSlotRowKey) return;
    let blockedReason = '';
    setGame((prev) => {
      if (!prev) return prev;
      const now = Date.now();
      let nextColdStorageByBuilding = normalizeSmallApcColdStorageByBuilding(prev?.smallApcColdStorageByBuilding);
      const sourceBuildingKey = findColdStorageBuildingKeyByRowKey(nextColdStorageByBuilding, sourceSlotRowKey);
      if (sourceBuildingKey !== SMALL_APC_SORTED_BUILDING_KEY) {
        blockedReason = '포장 보내기는 선별완료동(2동) 물량만 가능합니다.';
        return prev;
      }
      let targetEntry = null;
      SMALL_APC_COLD_STORAGE_BUILDING_KEYS.forEach((buildingKey) => {
        nextColdStorageByBuilding[buildingKey] = nextColdStorageByBuilding[buildingKey].map((entry) => {
          const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
          const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
          if (!normalizedEntry || rowKey !== sourceSlotRowKey) return normalizedEntry;
          targetEntry = normalizedEntry;
          return normalizedEntry;
        });
      });
      if (!targetEntry) return prev;
      const gradeLabel = String(targetEntry?.gradeLabel || '미선별').trim();
      const currentStatus = String(targetEntry?.apcStorageStatus || '보관중').trim() || '보관중';
      if (gradeLabel === '미선별' || !['보관중', '포장완료', '출고대기'].includes(currentStatus)) return prev;

      const packingJobs = normalizeSmallApcPackingJobs(prev?.smallApcPackingJobs);
      const shippingJobs = normalizeSmallApcShippingJobs(prev?.smallApcShippingJobs);
      const hasActiveJob = packingJobs.some((job) => String(job?.sourceSlotRowKey || '').trim() === sourceSlotRowKey && String(job?.status || 'queued').trim() !== 'done')
        || shippingJobs.some((job) => String(job?.sourceSlotRowKey || '').trim() === sourceSlotRowKey && String(job?.status || 'queued').trim() !== 'done');
      if (hasActiveJob || currentStatus === '포장완료') return prev;

      const benchMetrics = [1, 2].map((workbenchNo) => {
        const benchJobs = packingJobs.filter((job) => Math.max(1, Number(job?.workbenchNo || 1)) === workbenchNo);
        const pendingCount = benchJobs.filter((job) => String(job?.status || 'queued').trim() !== 'done').length;
        const readyAt = benchJobs.reduce(
          (max, job) => Math.max(max, Math.max(0, Number(job?.startedAt || 0)) + Math.max(100, Number(job?.durationMs || 0))),
          now
        );
        return { workbenchNo, pendingCount, readyAt };
      }).sort((a, b) => (a.pendingCount - b.pendingCount) || (a.readyAt - b.readyAt) || (a.workbenchNo - b.workbenchNo));
      const targetBench = benchMetrics[0] || { workbenchNo: 1, readyAt: now };
      const startedAt = Math.max(now + 600, targetBench.readyAt);
      const durationMs = SMALL_APC_PACKING_BASE_DURATION_MS + (Math.max(1, Number(targetEntry?.boxCount || 0)) * SMALL_APC_PACKING_BOX_DURATION_MS);
      const nextPackingJobs = [
        ...packingJobs,
        {
          id: `small-apc-packing-${sourceSlotRowKey}-${now}`,
          sourceSlotRowKey,
          workbenchNo: targetBench.workbenchNo,
          ticketNo: String(targetEntry?.sourceTicketNo || '').trim(),
          shipperName: String(targetEntry?.shipperName || '').trim(),
          vehicleName: String(targetEntry?.vehicleName || '').trim(),
          produceTypeLabel: String(targetEntry?.produceTypeLabel || '사과').trim() || '사과',
          gradeLabel,
          sizeLabel: String(targetEntry?.sizeLabel || '미측정').trim() || '미측정',
          boxCount: Math.max(0, Number(targetEntry?.boxCount || 0)),
          totalKg: Math.max(0, Number(targetEntry?.totalKg || 0)),
          packTypeLabel: '선물포장',
          status: 'queued',
          createdAt: now,
          startedAt,
          durationMs,
          completedAt: 0,
        },
      ];

      SMALL_APC_COLD_STORAGE_BUILDING_KEYS.forEach((buildingKey) => {
        nextColdStorageByBuilding[buildingKey] = nextColdStorageByBuilding[buildingKey].map((entry) => {
          const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
          const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
          if (!normalizedEntry || rowKey !== sourceSlotRowKey) return normalizedEntry;
          return {
            ...normalizedEntry,
            apcStorageStatus: '포장대기',
            apcStorageStatusUpdatedAt: now,
            apcPackTypeLabel: '선물포장',
          };
        });
      });

      return {
        ...prev,
        smallApcColdStorageByBuilding: nextColdStorageByBuilding,
        smallApcPackingJobs: nextPackingJobs,
      };
    });
    if (blockedReason && !silent) window.alert(blockedReason);
  }, [
    SMALL_APC_COLD_STORAGE_BUILDING_KEYS,
    SMALL_APC_PACKING_BASE_DURATION_MS,
    SMALL_APC_PACKING_BOX_DURATION_MS,
    SMALL_APC_SORTED_BUILDING_KEY,
    findColdStorageBuildingKeyByRowKey,
    normalizeSmallApcColdStorageByBuilding,
    normalizeSmallApcColdStorageEntry,
    normalizeSmallApcPackingJobs,
    normalizeSmallApcShippingJobs,
    setGame,
  ]);

  const sendSmallApcColdStorageToShipping = useCallback((sourceSlotRowKeyRaw = '', options = null) => {
    const sourceSlotRowKey = String(sourceSlotRowKeyRaw || '').trim();
    const silent = Boolean(options?.silent);
    if (!sourceSlotRowKey) return;
    let blockedReason = '';
    setGame((prev) => {
      if (!prev) return prev;
      const now = Date.now();
      const nextColdStorageByBuilding = normalizeSmallApcColdStorageByBuilding(prev?.smallApcColdStorageByBuilding);
      const sourceBuildingKey = findColdStorageBuildingKeyByRowKey(nextColdStorageByBuilding, sourceSlotRowKey);
      if (sourceBuildingKey !== SMALL_APC_SORTED_BUILDING_KEY && sourceBuildingKey !== SMALL_APC_SHIPPING_BUILDING_KEY) {
        blockedReason = '출고 보내기는 선별완료동(2동) 또는 출고동(3동) 물량만 가능합니다.';
        return prev;
      }
      let targetEntry = null;
      SMALL_APC_COLD_STORAGE_BUILDING_KEYS.forEach((buildingKey) => {
        nextColdStorageByBuilding[buildingKey] = nextColdStorageByBuilding[buildingKey].map((entry) => {
          const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
          const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
          if (!normalizedEntry || rowKey !== sourceSlotRowKey) return normalizedEntry;
          targetEntry = normalizedEntry;
          return normalizedEntry;
        });
      });
      if (!targetEntry) return prev;
      const gradeLabel = String(targetEntry?.gradeLabel || '미선별').trim();
      const currentStatus = String(targetEntry?.apcStorageStatus || '보관중').trim() || '보관중';
      if (gradeLabel === '미선별' || !['보관중', '포장완료'].includes(currentStatus)) return prev;

      const packingJobs = normalizeSmallApcPackingJobs(prev?.smallApcPackingJobs);
      const shippingJobs = normalizeSmallApcShippingJobs(prev?.smallApcShippingJobs);
      const hasPackingJob = packingJobs.some((job) => String(job?.sourceSlotRowKey || '').trim() === sourceSlotRowKey && String(job?.status || 'queued').trim() !== 'done');
      const hasShippingJob = shippingJobs.some((job) => String(job?.sourceSlotRowKey || '').trim() === sourceSlotRowKey && String(job?.status || 'queued').trim() !== 'done');
      if (hasPackingJob || hasShippingJob) return prev;

      const occupiedShippingParkingSlotSet = new Set(
        shippingJobs
          .filter((job) => String(job?.status || 'queued').trim() !== 'done')
          .map((job) => Math.max(0, Number(job?.shippingParkingSlotNo || 0)))
          .filter((slotNo) => slotNo >= 1 && slotNo <= SMALL_APC_SHIPPING_PARKING_SLOT_COUNT)
      );
      const shippingParkingSlotNo = Array.from(
        { length: SMALL_APC_SHIPPING_PARKING_SLOT_COUNT },
        (_, slotIndex) => slotIndex + 1
      ).find((slotNo) => !occupiedShippingParkingSlotSet.has(slotNo)) || 0;

      if (sourceBuildingKey !== SMALL_APC_SHIPPING_BUILDING_KEY) {
        const shippingTargetSlots = Array.isArray(nextColdStorageByBuilding?.[SMALL_APC_SHIPPING_BUILDING_KEY])
          ? [...nextColdStorageByBuilding[SMALL_APC_SHIPPING_BUILDING_KEY]]
          : [];
        const emptyShippingSlotIndex = shippingTargetSlots.findIndex((entry) => !entry);
        if (emptyShippingSlotIndex < 0) {
          blockedReason = '출고동(3동)에 빈 저장공간이 없어 먼저 정리해야 합니다.';
          return prev;
        }
        nextColdStorageByBuilding[sourceBuildingKey] = nextColdStorageByBuilding[sourceBuildingKey].map((entry) => {
          const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
          const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
          if (!normalizedEntry || rowKey !== sourceSlotRowKey) return normalizedEntry;
          return null;
        });
        shippingTargetSlots[emptyShippingSlotIndex] = normalizeSmallApcColdStorageEntry({
          ...targetEntry,
          apcStorageStatus: '출고대기',
          apcStorageStatusUpdatedAt: now,
        });
        nextColdStorageByBuilding[SMALL_APC_SHIPPING_BUILDING_KEY] = shippingTargetSlots;
      }

      nextColdStorageByBuilding[SMALL_APC_SHIPPING_BUILDING_KEY] = nextColdStorageByBuilding[SMALL_APC_SHIPPING_BUILDING_KEY].map((entry) => {
        const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
        const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
        if (!normalizedEntry || rowKey !== sourceSlotRowKey) return normalizedEntry;
        return {
          ...normalizedEntry,
          apcStorageStatus: '출고대기',
          apcStorageStatusUpdatedAt: now,
        };
      });

      const shippingReadyRows = Array.isArray(nextColdStorageByBuilding?.[SMALL_APC_SHIPPING_BUILDING_KEY])
        ? nextColdStorageByBuilding[SMALL_APC_SHIPPING_BUILDING_KEY]
        : [];
      const totalReadyBoxCount = smallApcEligibleShippingBoxCountOfRows(shippingReadyRows);
      if (totalReadyBoxCount < SMALL_APC_SHIPPING_MIN_BOX_COUNT) {
        return {
          ...prev,
          smallApcColdStorageByBuilding: nextColdStorageByBuilding,
        };
      }

      if (shippingParkingSlotNo <= 0) {
        return {
          ...prev,
          smallApcColdStorageByBuilding: nextColdStorageByBuilding,
        };
      }

      const shippingReadyAt = shippingJobs.reduce(
        (max, job) => Math.max(max, Math.max(0, Number(job?.startedAt || 0)) + Math.max(100, Number(job?.durationMs || 0))),
        now
      );
      const callDelayMs = Math.max(
        SMALL_APC_SHIPPING_CALL_MIN_DELAY_MS,
        Math.floor(
          (Math.random() * (SMALL_APC_SHIPPING_CALL_MAX_DELAY_MS - SMALL_APC_SHIPPING_CALL_MIN_DELAY_MS + 1))
          + SMALL_APC_SHIPPING_CALL_MIN_DELAY_MS
        )
      );
      const startedAt = Math.max(now + callDelayMs, shippingReadyAt);
      const dispatchVehicle = buildSmallApcDispatchVehicle(targetEntry, shippingParkingSlotNo);
      const nextShippingJobs = [
        ...shippingJobs,
        {
          id: `small-apc-shipping-${sourceSlotRowKey}-${now}`,
          sourceSlotRowKey,
          ticketNo: String(targetEntry?.sourceTicketNo || '').trim(),
          shipperName: String(targetEntry?.shipperName || '').trim(),
          vehicleName: String(targetEntry?.vehicleName || '').trim(),
          produceTypeLabel: String(targetEntry?.produceTypeLabel || '사과').trim() || '사과',
          gradeLabel,
          sizeLabel: String(targetEntry?.sizeLabel || '미측정').trim() || '미측정',
          boxCount: Math.max(0, Number(targetEntry?.boxCount || 0)),
          totalKg: Math.max(0, Number(targetEntry?.totalKg || 0)),
          packTypeLabel: String(targetEntry?.apcPackTypeLabel || '').trim(),
          shippingParkingSlotNo,
          dispatchVehicleName: dispatchVehicle.dispatchVehicleName,
          dispatchVehiclePlateText: dispatchVehicle.dispatchVehiclePlateText,
          dispatchVehicleSearchKeywords: dispatchVehicle.dispatchVehicleSearchKeywords,
          status: 'queued',
          createdAt: now,
          startedAt,
          durationMs: SMALL_APC_SHIPPING_BASE_DURATION_MS,
          completedAt: 0,
        },
      ];

      return {
        ...prev,
        smallApcColdStorageByBuilding: nextColdStorageByBuilding,
        smallApcShippingJobs: nextShippingJobs,
      };
    });
    if (blockedReason && !silent) window.alert(blockedReason);
  }, [
    SMALL_APC_COLD_STORAGE_BUILDING_KEYS,
    SMALL_APC_SHIPPING_CALL_MAX_DELAY_MS,
    SMALL_APC_SHIPPING_CALL_MIN_DELAY_MS,
    SMALL_APC_SHIPPING_BASE_DURATION_MS,
    SMALL_APC_SHIPPING_BUILDING_KEY,
    SMALL_APC_SHIPPING_MIN_BOX_COUNT,
    SMALL_APC_SHIPPING_PARKING_SLOT_COUNT,
    SMALL_APC_SORTED_BUILDING_KEY,
    buildSmallApcDispatchVehicle,
    findColdStorageBuildingKeyByRowKey,
    normalizeSmallApcColdStorageByBuilding,
    normalizeSmallApcColdStorageEntry,
    normalizeSmallApcPackingJobs,
    normalizeSmallApcShippingJobs,
    smallApcEligibleShippingBoxCountOfRows,
    setGame,
  ]);

  useEffect(() => {
    if (!smallApcMapOpen) return;
    const coldStorageByBuilding = normalizeSmallApcColdStorageByBuilding(game?.smallApcColdStorageByBuilding);
    const sortedRows = Array.isArray(coldStorageByBuilding?.[SMALL_APC_SORTED_BUILDING_KEY])
      ? coldStorageByBuilding[SMALL_APC_SORTED_BUILDING_KEY]
      : [];
    const shippingRows = Array.isArray(coldStorageByBuilding?.[SMALL_APC_SHIPPING_BUILDING_KEY])
      ? coldStorageByBuilding[SMALL_APC_SHIPPING_BUILDING_KEY]
      : [];
    const packingJobs = normalizeSmallApcPackingJobs(game?.smallApcPackingJobs);
    const shippingJobs = normalizeSmallApcShippingJobs(game?.smallApcShippingJobs);
    const shippingHasFreeSlot = shippingRows.some((entry) => !normalizeSmallApcColdStorageEntry(entry));

    const hasActivePackingJobForRow = (rowKey) => packingJobs.some((job) => (
      String(job?.sourceSlotRowKey || '').trim() === rowKey
      && String(job?.status || 'queued').trim() !== 'done'
    ));
    const hasActiveShippingJobForRow = (rowKey) => shippingJobs.some((job) => (
      String(job?.sourceSlotRowKey || '').trim() === rowKey
      && String(job?.status || 'queued').trim() !== 'done'
    ));
    const canQueueShippingForEntry = (normalizedEntry) => {
      const statusLabel = String(normalizedEntry?.apcStorageStatus || '보관중').trim() || '보관중';
      return statusLabel === '출고대기'
        || statusLabel === '포장완료'
        || (statusLabel === '보관중' && !shouldPackSmallApcEntry(normalizedEntry));
    };

    const shippingCandidateInSorted = sortedRows.find((entry) => {
      const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
      if (!normalizedEntry || !shippingHasFreeSlot) return false;
      const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
      return Boolean(rowKey)
        && canQueueShippingForEntry(normalizedEntry)
        && !hasActivePackingJobForRow(rowKey)
        && !hasActiveShippingJobForRow(rowKey);
    });
    if (shippingCandidateInSorted) {
      sendSmallApcColdStorageToShipping(
        String(shippingCandidateInSorted?.slotRowKey || shippingCandidateInSorted?.rowKey || '').trim(),
        { silent: true }
      );
      return;
    }

    const shippingCandidateInShippingBuilding = shippingRows.find((entry) => {
      const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
      if (!normalizedEntry) return false;
      const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
      return Boolean(rowKey)
        && canQueueShippingForEntry(normalizedEntry)
        && !hasActivePackingJobForRow(rowKey)
        && !hasActiveShippingJobForRow(rowKey);
    });
    if (shippingCandidateInShippingBuilding) {
      sendSmallApcColdStorageToShipping(
        String(shippingCandidateInShippingBuilding?.slotRowKey || shippingCandidateInShippingBuilding?.rowKey || '').trim(),
        { silent: true }
      );
      return;
    }

    const packingCandidate = sortedRows.find((entry) => {
      const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
      if (!normalizedEntry) return false;
      const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
      const gradeLabel = String(normalizedEntry?.gradeLabel || '미선별').trim();
      const statusLabel = String(normalizedEntry?.apcStorageStatus || '보관중').trim() || '보관중';
      return Boolean(rowKey)
        && gradeLabel !== '미선별'
        && shouldPackSmallApcEntry(normalizedEntry)
        && statusLabel === '보관중'
        && !hasActivePackingJobForRow(rowKey)
        && !hasActiveShippingJobForRow(rowKey);
    });
    if (packingCandidate) {
      sendSmallApcColdStorageToPacking(
        String(packingCandidate?.slotRowKey || packingCandidate?.rowKey || '').trim(),
        { silent: true }
      );
    }
  }, [
    SMALL_APC_SHIPPING_BUILDING_KEY,
    SMALL_APC_SORTED_BUILDING_KEY,
    game?.smallApcColdStorageByBuilding,
    game?.smallApcPackingJobs,
    game?.smallApcShippingJobs,
    normalizeSmallApcColdStorageByBuilding,
    normalizeSmallApcColdStorageEntry,
    normalizeSmallApcPackingJobs,
    normalizeSmallApcShippingJobs,
    sendSmallApcColdStorageToPacking,
    sendSmallApcColdStorageToShipping,
    shouldPackSmallApcEntry,
    smallApcMapOpen,
  ]);

  const closeSmallApcLiveNotice = useCallback(() => {
    setSmallApcLiveNotice(null);
  }, []);

  const paySmallApcSettlement = useCallback((ticketNoRaw = '') => {
    const ticketNo = String(ticketNoRaw || '').trim();
    if (!ticketNo) return;
    setGame((prev) => {
      if (!prev) return prev;
      const currentRows = Array.isArray(prev?.smallApcSettlementRows) ? prev.smallApcSettlementRows : [];
      const playerTicketSet = new Set(
        (Array.isArray(prev?.smallApcPlayerShipmentTicketNos) ? prev.smallApcPlayerShipmentTicketNos : [])
          .map((value) => String(value || '').trim())
          .filter(Boolean)
      );
      const playerName = String(prev?.playerName || '').trim();
      const targetRow = currentRows.find((row) => {
        if (String(row?.ticketNo || '').trim() !== ticketNo) return false;
        if (String(row?.status || 'pending') !== 'pending') return false;
        const rowTicketNo = String(row?.ticketNo || '').trim();
        const rowShipperName = String(row?.shipperName || '').trim();
        return Boolean(
          (rowTicketNo && playerTicketSet.has(rowTicketNo))
          || (playerName && rowShipperName && rowShipperName === playerName)
        );
      }) || null;
      if (!targetRow) return prev;
      const paidAt = Date.now();
      const netAmount = Math.max(0, Number(targetRow?.netAmount || 0));
      const nextRows = currentRows.map((row) => (
        String(row?.ticketNo || '').trim() === ticketNo
          ? { ...row, status: 'paid', paidAt }
          : row
      ));
      const logText = `소형 APC 정산 완료: ${String(targetRow?.shipperName || '출하자')} / ${ticketNo} / ${String(targetRow?.cargoType || '사과')} ${Math.max(0, Number(targetRow?.cargoKg || 0)).toLocaleString()}kg / +${won(netAmount)}`;
      const nextState = {
        ...prev,
        money: (Number(prev?.money) || 0) + netAmount,
        smallApcSettlementRows: nextRows,
        logs: pushDiary(prev, logText),
      };
      return {
        ...nextState,
        ...appendPhoneNotificationsStatePatch(nextState, [
          {
            type: 'small-apc-settlement-paid',
            source: 'small-apc',
            priority: 'default',
            title: '소형 APC 정산 완료',
            body: `${ticketNo} ${String(targetRow?.vehicleName || '출하 차량')} 정산금 ${won(netAmount)}을 수령했습니다.`,
            createdDay: Math.max(1, Math.floor(Number(prev?.day) || 1)),
            createdAtLabel: '소형 APC',
            actionApp: 'messages',
          }
        ]),
      };
    });
    if (smallApcMapOpen) {
      queueSmallApcLiveNotice({
        type: 'settlement-paid',
        title: '정산이 완료되었습니다',
        body: `${ticketNo} 출하 건 정산금을 바로 수령했습니다.\n지급 완료 후에는 일반 주차장 이동과 다음 작업을 이어서 진행하면 됩니다.`,
        primaryLabel: '확인',
        secondaryLabel: '닫기',
      });
    }
  }, [appendPhoneNotificationsStatePatch, pushDiary, queueSmallApcLiveNotice, setGame, smallApcMapOpen, won]);

  useEffect(() => {
    if (!smallApcMapOpen) {
      setSmallApcLiveNotice(null);
      setSmallApcLiveNoticeQueue((prev) => prev.length ? [] : prev);
      return;
    }
    if (smallApcLiveNotice || !smallApcLiveNoticeQueue.length) return;
    setSmallApcLiveNotice(smallApcLiveNoticeQueue[0]);
    setSmallApcLiveNoticeQueue((prev) => prev.slice(1));
  }, [smallApcLiveNotice, smallApcLiveNoticeQueue, smallApcMapOpen]);

  const handleSmallApcPlayerTurnReady = useCallback((payload = {}) => {
    const ticketNo = String(payload?.ticketNo || '').trim();
    const shipperName = String(payload?.shipperName || '').trim();
    const vehicleName = String(payload?.vehicleName || '내 화물차').trim();
    const vehiclePlateText = String(payload?.vehiclePlateText || '').trim();
    const loadingSlotNo = Math.max(0, Number(payload?.loadingSlotNo || 0));
    const deadlineMinutes = Math.max(1, Math.round((Number(payload?.deadlineMs || 0) / 60000) || 3));
    if (!ticketNo || loadingSlotNo <= 0) return;
    setGame((prev) => ({
      ...prev,
      ...appendPhoneNotificationsStatePatch(prev, [
        {
          type: 'small-apc-turn-ready',
          source: 'small-apc',
          priority: 'high',
          title: '소형 APC 순번 알림',
          body: `${ticketNo} ${vehicleName}${vehiclePlateText ? ` (${vehiclePlateText})` : ''} · ${deadlineMinutes}분 안에 하차칸 H${loadingSlotNo}에 차를 대 주세요.`,
          createdDay: Math.max(1, Math.floor(Number(prev?.day) || 1)),
          createdAtLabel: '문자알림',
          actionApp: 'messages',
        }
      ])
    }));
    if (smallApcMapOpen) {
      queueSmallApcLiveNotice({
        type: 'turn-ready',
        title: `${shipperName || '출하자'}님, 하차 주차칸으로 이동하세요`,
        body: `${ticketNo} ${vehicleName}${vehiclePlateText ? ` (${vehiclePlateText})` : ''}\n하차 주차칸 H${loadingSlotNo}번으로 이동한 뒤 차량을 진입해 주세요.\n호출 후 ${deadlineMinutes}분 안에 들어와야 합니다.`,
        primaryLabel: '하차칸 보기',
        secondaryLabel: '확인',
        onPrimary: () => {
          setMapLocationModal((prev) => ({ ...prev, view: 'sorting' }));
          setTownMarkerParkingModal({
            open: true,
            destinationKey: 'smallApc',
            zone: 'loading',
            slotNo: loadingSlotNo,
          });
        },
      });
    }
  }, [appendPhoneNotificationsStatePatch, queueSmallApcLiveNotice, setGame, setMapLocationModal, setTownMarkerParkingModal, smallApcMapOpen]);

  const applySmallApcUnloadStorageState = useCallback((prev, payload = {}, options = {}) => {
    if (!prev) return prev;
    const ticketNo = String(payload?.ticketNo || '').trim();
    const playerVehicleId = String(payload?.playerVehicleId || '').trim();
    const shipperName = String(payload?.shipperName || '').trim();
    const vehicleName = String(payload?.vehicleName || (options?.playerOwned ? '내 차량' : 'NPC 차량')).trim();
    const vehiclePlateText = String(payload?.vehiclePlateText || '').trim();
    const cargoKg = Math.max(0, Number(payload?.cargoKg || 0));
    const cargoType = String(payload?.cargoType || '사과').trim() || '사과';
    if (!ticketNo) return prev;
    const harvestRows = options?.playerOwned
      ? buildSmallApcHarvestRowsForVehicle({
          storage: prev?.storage,
          vehicleId: playerVehicleId,
        })
      : [];
    const settlementPreviewRows = options?.playerOwned
      ? buildSmallApcSettlementPreviewRows(harvestRows)
      : [];
    const receivedBoxCount = options?.playerOwned
      ? harvestRows.reduce((sum, row) => sum + Math.max(0, Number(row?.boxCount || 0)), 0)
      : 0;
    const unloadTempStorageEntries = options?.playerOwned
      ? buildSmallApcUnloadTempStorageEntries({
          storage: prev?.storage,
          vehicleCargoByInstance: prev?.vehicleCargoByInstance,
          vehicleId: playerVehicleId,
        })
      : [];
    const unloadPlacementResult = appendSmallApcColdStorageRows({
      coldStorageByBuilding: prev?.smallApcColdStorageByBuilding,
      ticketNo,
      shipperName,
      vehicleName,
      vehiclePlateText,
      shipmentDay: Math.max(1, Math.floor(Number(prev?.day) || 1)),
      harvestRows,
      cargoKg,
      cargoType,
      playerOwned: Boolean(options?.playerOwned),
      preferredBuildingOrder: [SMALL_APC_UNLOAD_BUILDING_KEY],
      returnPlacementResult: true,
    });
    const nextColdStorageByBuilding = unloadPlacementResult?.nextColdStorageByBuilding || normalizeSmallApcColdStorageByBuilding(prev?.smallApcColdStorageByBuilding);
    const placedUnloadRows = Array.isArray(unloadPlacementResult?.placedRows) ? unloadPlacementResult.placedRows : [];
    const leftoverUnloadRows = Array.isArray(unloadPlacementResult?.leftoverRows) ? unloadPlacementResult.leftoverRows : [];
    const nextPendingUnloadRows = [
      ...((Array.isArray(prev?.smallApcPendingUnloadRows) ? prev.smallApcPendingUnloadRows : [])
        .map((row) => normalizeSmallApcColdStorageEntry(row))
        .filter(Boolean)),
      ...leftoverUnloadRows,
    ];
    const nextStemRemovalJobs = applyStemRemovalSkipTiming(buildSmallApcStemRemovalJobsForTicket({
      stemRemovalJobs: prev?.smallApcStemRemovalJobs,
      coldStorageByBuilding: nextColdStorageByBuilding,
      ticketNo,
    }));
    let nextSortingJobs = prev?.smallApcSortingJobs;
    const placedStemRemovedRows = placedUnloadRows.filter((row) => Boolean(row?.stemRemoved));
    if (placedStemRemovedRows.length) {
      nextSortingJobs = applySortingSkipTiming(buildSmallApcSortingJobsForUnload({
        sortingJobs: nextSortingJobs,
        ticketNo,
        shipperName,
        vehicleName,
        vehiclePlateText,
        shipmentDay: Math.max(1, Math.floor(Number(prev?.day) || 1)),
        harvestRows: placedStemRemovedRows,
        cargoKg: placedStemRemovedRows.reduce((sum, row) => sum + Math.max(0, Number(row?.totalKg || 0)), 0),
        cargoType,
        playerOwned: Boolean(options?.playerOwned),
      }));
    }
    const nextStorage = options?.playerOwned && playerVehicleId
      ? (Array.isArray(prev?.storage)
          ? prev.storage.filter((batch) => String(batch?.storageVehicleInstanceId || '').trim() !== playerVehicleId)
          : prev?.storage)
      : prev?.storage;
    const nextVehicleCargoByInstance = (() => {
      if (!options?.playerOwned || !playerVehicleId) return prev?.vehicleCargoByInstance;
      const currentCargoByInstance = { ...(prev?.vehicleCargoByInstance || {}) };
      const nextCargo = normalizeCargoByItemKey(currentCargoByInstance[playerVehicleId] || {});
      const currentPalletQty = Math.max(0, Math.floor(Number(nextCargo?.plasticPallet1100) || 0));
      if (currentPalletQty > 0) {
        delete nextCargo.plasticPallet1100;
      }
      if (Object.keys(nextCargo).length > 0) {
        currentCargoByInstance[playerVehicleId] = nextCargo;
      } else {
        delete currentCargoByInstance[playerVehicleId];
      }
      return currentCargoByInstance;
    })();
    const nextMapShopTempStorageByMarker = options?.playerOwned
      ? appendMapShopTempStorageEntries({
          storageByMarker: prev?.mapShopTempStorageByMarker,
          shopKeyRaw: 'smallApc',
          entries: unloadTempStorageEntries,
          day: prev?.day || 1,
        })
      : prev?.mapShopTempStorageByMarker;
    const nextSettlementRows = (() => {
      if (!options?.playerOwned) return prev?.smallApcSettlementRows;
      const currentRows = Array.isArray(prev?.smallApcSettlementRows) ? prev.smallApcSettlementRows : [];
      const draft = buildSmallApcSettlementDraft({
        ticketNo,
        shipperName,
        vehicleName,
        vehiclePlateText,
        shipmentDay: Math.max(1, Math.floor(Number(prev?.day) || 1)),
        harvestRows: settlementPreviewRows,
        fallbackCargoKg: cargoKg,
        receivedBoxCount,
        fallbackCargoType: cargoType,
        settlementDay: Math.max(1, Math.floor(Number(prev?.day) || 1)),
      });
      const existingIndex = currentRows.findIndex((row) => String(row?.ticketNo || '').trim() === ticketNo);
      if (existingIndex < 0) {
        return [
          ...currentRows,
          {
            ...draft,
            status: 'processing',
          },
        ];
      }
      const existingRow = currentRows[existingIndex];
      const nextRows = [...currentRows];
      nextRows[existingIndex] = {
        ...draft,
        status: String(existingRow?.status || '') === 'paid' ? 'paid' : 'processing',
        createdAt: Math.max(0, Number(existingRow?.createdAt || 0)) || draft.createdAt,
        paidAt: Math.max(0, Number(existingRow?.paidAt || 0)),
      };
      return nextRows;
    })();
    const nextState = {
      ...prev,
      storage: nextStorage,
      vehicleCargoByInstance: nextVehicleCargoByInstance,
      mapShopTempStorageByMarker: nextMapShopTempStorageByMarker,
      smallApcColdStorageByBuilding: nextColdStorageByBuilding,
      smallApcPendingUnloadRows: nextPendingUnloadRows,
      smallApcStemRemovalJobs: nextStemRemovalJobs,
      smallApcSortingJobs: nextSortingJobs,
      smallApcSettlementRows: nextSettlementRows,
      smallApcPlayerShipmentTicketNos: Boolean(options?.playerOwned)
        ? Array.from(new Set([
            ...((Array.isArray(prev?.smallApcPlayerShipmentTicketNos) ? prev.smallApcPlayerShipmentTicketNos : [])
              .map((entry) => String(entry || '').trim())
              .filter(Boolean)),
            ticketNo,
          ]))
        : prev?.smallApcPlayerShipmentTicketNos,
    };
    if (!options?.playerOwned) return nextState;
    return {
      ...nextState,
      ...appendPhoneNotificationsStatePatch(nextState, [
        {
          type: 'small-apc-unload-done',
          source: 'small-apc',
          priority: 'high',
          title: '소형 APC 하차 완료',
          body: `${ticketNo} ${vehicleName}${vehiclePlateText ? ` (${vehiclePlateText})` : ''} 하차가 완료되었습니다. 이제 APC 선별이 진행되며, 선별완료 후 정산 안내가 도착합니다.`,
          createdDay: Math.max(1, Math.floor(Number(prev?.day) || 1)),
          createdAtLabel: '문자알림',
          actionApp: 'messages',
        }
      ]),
    };
  }, [
    appendMapShopTempStorageEntries,
    appendPhoneNotificationsStatePatch,
    appendSmallApcColdStorageRows,
    applySortingSkipTiming,
    applyStemRemovalSkipTiming,
    buildSmallApcHarvestRowsForVehicle,
    buildSmallApcSettlementDraft,
    buildSmallApcSettlementPreviewRows,
    buildSmallApcSortingJobsForUnload,
    buildSmallApcStemRemovalJobsForTicket,
    buildSmallApcUnloadTempStorageEntries,
    normalizeCargoByItemKey,
    normalizeSmallApcColdStorageByBuilding,
    normalizeSmallApcColdStorageEntry,
  ]);

  const handleSmallApcPlayerUnloadDone = useCallback((payload = {}) => {
    const ticketNo = String(payload?.ticketNo || '').trim();
    const shipperName = String(payload?.shipperName || '').trim();
    const vehicleName = String(payload?.vehicleName || '내 차량').trim();
    const vehiclePlateText = String(payload?.vehiclePlateText || '').trim();
    const loadingSlotNo = Math.max(0, Number(payload?.loadingSlotNo || 0));
    if (!ticketNo || loadingSlotNo <= 0) return;
    setGame((prev) => applySmallApcUnloadStorageState(prev, payload, { playerOwned: true }));
    if (smallApcMapOpen) {
      queueSmallApcLiveNotice({
        type: 'unload-done',
        title: `${shipperName || '출하자'}님, 하차가 완료되었습니다`,
        body: `${ticketNo} ${vehicleName}${vehiclePlateText ? ` (${vehiclePlateText})` : ''}\n하차 주차칸 H${loadingSlotNo} 작업이 끝났습니다.\n이제 APC 선별이 진행되며, 선별이 끝나면 정산 안내를 보내드립니다.`,
        primaryLabel: '사무실 가기',
        secondaryLabel: '확인',
        onPrimary: () => {
          setMapLocationModal((prev) => ({ ...prev, view: 'office' }));
        },
      });
    }
  }, [applySmallApcUnloadStorageState, queueSmallApcLiveNotice, setGame, setMapLocationModal, smallApcMapOpen]);

  const handleSmallApcNpcUnloadDone = useCallback((payload = {}) => {
    const ticketNo = String(payload?.ticketNo || '').trim();
    if (!ticketNo) return;
    setGame((prev) => applySmallApcUnloadStorageState(prev, payload, { playerOwned: false }));
  }, [applySmallApcUnloadStorageState, setGame]);

  useEffect(() => {
    const pendingUnloadRows = Array.isArray(game?.smallApcPendingUnloadRows) ? game.smallApcPendingUnloadRows : [];
    if (!pendingUnloadRows.length) return;
    setGame((prev) => {
      if (!prev) return prev;
      const normalizedPendingRows = (Array.isArray(prev?.smallApcPendingUnloadRows) ? prev.smallApcPendingUnloadRows : [])
        .map((row) => normalizeSmallApcColdStorageEntry(row))
        .filter(Boolean);
      if (!normalizedPendingRows.length) return prev;
      const placementResult = placeRowsIntoEmptyColdStorageSlots(
        prev?.smallApcColdStorageByBuilding,
        normalizedPendingRows,
        SMALL_APC_UNLOAD_BUILDING_KEY
      );
      const placedRows = Array.isArray(placementResult?.placedRows) ? placementResult.placedRows : [];
      if (!placedRows.length) return prev;
      const nextColdStorageByBuilding = placementResult?.nextColdStorageByBuilding || normalizeSmallApcColdStorageByBuilding(prev?.smallApcColdStorageByBuilding);
      const leftoverRows = Array.isArray(placementResult?.leftoverRows) ? placementResult.leftoverRows : [];
      let nextStemRemovalJobs = prev?.smallApcStemRemovalJobs;
      const placedTicketNos = Array.from(new Set(
        placedRows
          .map((row) => String(row?.sourceTicketNo || '').trim())
          .filter(Boolean)
      ));
      placedTicketNos.forEach((ticketNo) => {
        nextStemRemovalJobs = applyStemRemovalSkipTiming(buildSmallApcStemRemovalJobsForTicket({
          stemRemovalJobs: nextStemRemovalJobs,
          coldStorageByBuilding: nextColdStorageByBuilding,
          ticketNo,
        }));
      });
      let nextSortingJobs = prev?.smallApcSortingJobs;
      const placedStemRemovedRowsByTicket = placedRows
        .filter((row) => Boolean(row?.stemRemoved))
        .reduce((acc, row) => {
          const ticketNo = String(row?.sourceTicketNo || '').trim();
          if (!ticketNo) return acc;
          if (!acc[ticketNo]) acc[ticketNo] = [];
          acc[ticketNo].push(row);
          return acc;
        }, {});
      Object.entries(placedStemRemovedRowsByTicket).forEach(([ticketNo, rows]) => {
        nextSortingJobs = applySortingSkipTiming(buildSmallApcSortingJobsForUnload({
          sortingJobs: nextSortingJobs,
          ticketNo,
          shipperName: String(rows[0]?.shipperName || '').trim(),
          vehicleName: String(rows[0]?.vehicleName || '').trim(),
          vehiclePlateText: String(rows[0]?.vehiclePlateText || '').trim(),
          harvestRows: rows,
          cargoKg: rows.reduce((sum, row) => sum + Math.max(0, Number(row?.totalKg || 0)), 0),
          cargoType: String(rows[0]?.produceTypeLabel || '?ш낵').trim() || '?ш낵',
          playerOwned: Boolean(rows[0]?.playerOwned),
        }));
      });
      return {
        ...prev,
        smallApcColdStorageByBuilding: nextColdStorageByBuilding,
        smallApcPendingUnloadRows: leftoverRows,
        smallApcStemRemovalJobs: nextStemRemovalJobs,
        smallApcSortingJobs: nextSortingJobs,
      };
    });
  }, [
    SMALL_APC_UNLOAD_BUILDING_KEY,
    applySortingSkipTiming,
    applyStemRemovalSkipTiming,
    buildSmallApcSortingJobsForUnload,
    buildSmallApcStemRemovalJobsForTicket,
    game?.smallApcPendingUnloadRows,
    normalizeSmallApcColdStorageByBuilding,
    normalizeSmallApcColdStorageEntry,
    placeRowsIntoEmptyColdStorageSlots,
    setGame,
  ]);

  useEffect(() => {
    const currentStemRemovalJobs = Array.isArray(game?.smallApcStemRemovalJobs) ? game.smallApcStemRemovalJobs : [];
    if (!currentStemRemovalJobs.length) return;
    const now = smallApcWorkflowNow;
    const activeWorkshopWorkers = activeSmallApcWorkersOf(game?.smallApcStaffState, 'workshop');
    if (activeWorkshopWorkers <= 0) {
      setGame((prev) => {
        if (!prev) return prev;
        const currentJobs = normalizeSmallApcStemRemovalJobs(prev?.smallApcStemRemovalJobs);
        const nextJobs = pauseSmallApcTimedJobsWhenUnstaffed(currentJobs, {
          now,
          activeWorkers: activeWorkshopWorkers,
        });
        if (nextJobs === currentJobs) return prev;
        return {
          ...prev,
          smallApcStemRemovalJobs: nextJobs,
        };
      });
      return;
    }
    const finishedJobIds = new Set(
      currentStemRemovalJobs
        .filter((job) => {
          const startedAt = Math.max(0, Number(job?.startedAt || 0));
          const durationMs = Math.max(100, Number(job?.durationMs || SMALL_APC_STEM_REMOVAL_BASE_DURATION_MS));
          const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || SMALL_APC_STEM_REMOVAL_MOVE_OUT_DURATION_MS));
          return now >= startedAt + durationMs + moveOutDurationMs;
        })
        .map((job) => String(job?.id || '').trim())
        .filter(Boolean)
    );
    if (!finishedJobIds.size) return;
    setGame((prev) => {
      if (!prev) return prev;
      const stemRemovalJobs = normalizeSmallApcStemRemovalJobs(prev?.smallApcStemRemovalJobs);
      const finishedJobs = stemRemovalJobs.filter((job) => finishedJobIds.has(String(job?.id || '').trim()));
      if (!finishedJobs.length) return prev;
      const finishedJobBySourceSlotRowKey = new Map(
        finishedJobs.map((job) => [String(job?.sourceSlotRowKey || '').trim(), job])
      );
      const updatedEntries = [];
      const nextColdStorageByBuilding = normalizeSmallApcColdStorageByBuilding(prev?.smallApcColdStorageByBuilding);
      SMALL_APC_COLD_STORAGE_BUILDING_KEYS.forEach((buildingKey) => {
        nextColdStorageByBuilding[buildingKey] = nextColdStorageByBuilding[buildingKey].map((entry) => {
          const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
          const sourceSlotRowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
          const finishedJob = finishedJobBySourceSlotRowKey.get(sourceSlotRowKey);
          if (!normalizedEntry || !finishedJob) return normalizedEntry;
          const nextEntry = {
            ...normalizedEntry,
            stemRemoved: true,
          };
          updatedEntries.push(nextEntry);
          return nextEntry;
        });
      });
      let nextSortingJobs = prev?.smallApcSortingJobs;
      const entryGroupsByTicket = updatedEntries.reduce((acc, entry) => {
        const ticketNo = String(entry?.sourceTicketNo || '').trim();
        if (!ticketNo) return acc;
        if (!acc[ticketNo]) acc[ticketNo] = [];
        acc[ticketNo].push(entry);
        return acc;
      }, {});
      Object.entries(entryGroupsByTicket).forEach(([ticketNo, entries]) => {
        nextSortingJobs = applySortingSkipTiming(buildSmallApcSortingJobsForUnload({
          sortingJobs: nextSortingJobs,
          ticketNo,
          shipperName: String(entries[0]?.shipperName || '').trim(),
          vehicleName: String(entries[0]?.vehicleName || '').trim(),
          vehiclePlateText: String(entries[0]?.vehiclePlateText || '').trim(),
          harvestRows: entries,
          cargoKg: entries.reduce((sum, entry) => sum + Math.max(0, Number(entry?.totalKg || 0)), 0),
          cargoType: String(entries[0]?.produceTypeLabel || '사과').trim() || '사과',
          playerOwned: Boolean(entries[0]?.playerOwned),
        }));
      });
      return {
        ...prev,
        smallApcColdStorageByBuilding: nextColdStorageByBuilding,
        smallApcStemRemovalJobs: stemRemovalJobs.filter((job) => !finishedJobIds.has(String(job?.id || '').trim())),
        smallApcSortingJobs: nextSortingJobs,
      };
    });
  }, [
    SMALL_APC_COLD_STORAGE_BUILDING_KEYS,
    SMALL_APC_STEM_REMOVAL_BASE_DURATION_MS,
    SMALL_APC_STEM_REMOVAL_MOVE_OUT_DURATION_MS,
    applySortingSkipTiming,
    buildSmallApcSortingJobsForUnload,
    game?.smallApcStemRemovalJobs,
    normalizeSmallApcColdStorageByBuilding,
    normalizeSmallApcColdStorageEntry,
    normalizeSmallApcStemRemovalJobs,
    activeSmallApcWorkersOf,
    pauseSmallApcTimedJobsWhenUnstaffed,
    game?.smallApcStaffState,
    setGame,
    smallApcWorkflowNow,
  ]);

  useEffect(() => {
    if (!devPlayerWorkSkipEnabled && !devPlayerSortingSkipEnabled) return;
    const now = Date.now();
    setGame((prev) => {
      if (!prev) return prev;
      const currentStemRemovalJobs = normalizeSmallApcStemRemovalJobs(prev?.smallApcStemRemovalJobs);
      const currentSortingJobs = normalizeSmallApcSortingJobs(prev?.smallApcSortingJobs);
      const nextStemRemovalJobs = applyStemRemovalSkipTiming(currentStemRemovalJobs, now);
      const nextSortingJobs = applySortingSkipTiming(currentSortingJobs, now);
      const stemChanged = nextStemRemovalJobs.some((job, index) => job !== currentStemRemovalJobs[index]);
      const sortingChanged = nextSortingJobs.some((job, index) => job !== currentSortingJobs[index]);
      if (!stemChanged && !sortingChanged) return prev;
      return {
        ...prev,
        smallApcStemRemovalJobs: stemChanged ? nextStemRemovalJobs : prev?.smallApcStemRemovalJobs,
        smallApcSortingJobs: sortingChanged ? nextSortingJobs : prev?.smallApcSortingJobs,
      };
    });
  }, [
    applySortingSkipTiming,
    applyStemRemovalSkipTiming,
    devPlayerSortingSkipEnabled,
    devPlayerWorkSkipEnabled,
    normalizeSmallApcSortingJobs,
    normalizeSmallApcStemRemovalJobs,
    setGame,
  ]);

  useEffect(() => {
    if (typeof rebalanceSmallApcStaffAssignments !== 'function') return;
    const activeStemRemovalCount = (Array.isArray(game?.smallApcStemRemovalJobs) ? game.smallApcStemRemovalJobs : [])
      .filter((job) => Math.max(0, Number(job?.outputCommittedAt || 0)) <= 0)
      .length;
    const activePackingCount = (Array.isArray(game?.smallApcPackingJobs) ? game.smallApcPackingJobs : [])
      .filter((job) => Math.max(0, Number(job?.completedAt || 0)) <= 0)
      .length;
    const activeSortingCount = (Array.isArray(game?.smallApcSortingJobs) ? game.smallApcSortingJobs : [])
      .filter((job) => Math.max(0, Number(job?.outputCommittedAt || 0)) <= 0)
      .length;
    const activeShippingCount = (Array.isArray(game?.smallApcShippingJobs) ? game.smallApcShippingJobs : [])
      .filter((job) => Math.max(0, Number(job?.completedAt || 0)) <= 0)
      .length;
    const pendingUnloadCount = (Array.isArray(game?.smallApcPendingUnloadRows) ? game.smallApcPendingUnloadRows : []).length;
    const workload = {
      receiving: 1,
      office: activeSortingCount + activeShippingCount > 0 ? 1 : 0,
      loading: pendingUnloadCount,
      sorting: activeSortingCount,
      workshop: activeStemRemovalCount + activePackingCount,
      coldStorage: pendingUnloadCount + activeSortingCount,
      shipping: activeShippingCount,
    };
    const staffStateSignatureOf = (staffState = null) => JSON.stringify(
      (Array.isArray(staffState?.members) ? staffState.members : [])
        .map((member) => [
          String(member?.id || ''),
          String(member?.roleKey || ''),
          String(member?.attendanceStatus || ''),
          String(member?.activityStatus || ''),
          String(member?.assignedFacilityKey || ''),
        ])
    );
    setGame((prev) => {
      if (!prev) return prev;
      const currentSignature = staffStateSignatureOf(prev?.smallApcStaffState);
      const nextStaffState = rebalanceSmallApcStaffAssignments(prev?.smallApcStaffState, { workload });
      const nextSignature = staffStateSignatureOf(nextStaffState);
      if (currentSignature === nextSignature) return prev;
      return {
        ...prev,
        smallApcStaffState: nextStaffState,
      };
    });
  }, [
    game?.smallApcPackingJobs,
    game?.smallApcPendingUnloadRows,
    game?.smallApcShippingJobs,
    game?.smallApcSortingJobs,
    game?.smallApcStemRemovalJobs,
    rebalanceSmallApcStaffAssignments,
    setGame,
  ]);

  useEffect(() => {
    const currentPackingJobs = Array.isArray(game?.smallApcPackingJobs) ? game.smallApcPackingJobs : [];
    if (!currentPackingJobs.length) return;
    const now = smallApcWorkflowNow;
    const activeWorkshopWorkers = activeSmallApcWorkersOf(game?.smallApcStaffState, 'workshop');
    setGame((prev) => {
      if (!prev) return prev;
      const packingJobs = normalizeSmallApcPackingJobs(prev?.smallApcPackingJobs);
      if (!packingJobs.length) return prev;
      if (activeWorkshopWorkers <= 0) {
        const nextPackingJobs = pauseSmallApcTimedJobsWhenUnstaffed(packingJobs, {
          now,
          activeWorkers: activeWorkshopWorkers,
          isDone: (job) => Math.max(0, Number(job?.completedAt || 0)) > 0,
        });
        if (nextPackingJobs === packingJobs) return prev;
        return {
          ...prev,
          smallApcPackingJobs: nextPackingJobs,
        };
      }
      let nextColdStorageByBuilding = normalizeSmallApcColdStorageByBuilding(prev?.smallApcColdStorageByBuilding);
      let changed = false;

      const updateEntryStatus = (sourceSlotRowKey, updater) => {
        SMALL_APC_COLD_STORAGE_BUILDING_KEYS.forEach((buildingKey) => {
          nextColdStorageByBuilding[buildingKey] = nextColdStorageByBuilding[buildingKey].map((entry) => {
            const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
            const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
            if (!normalizedEntry || rowKey !== sourceSlotRowKey) return normalizedEntry;
            const nextEntry = updater(normalizedEntry);
            if (nextEntry !== normalizedEntry) changed = true;
            return nextEntry;
          });
        });
      };
      const finalizePackedEntry = (sourceSlotRowKey, job) => {
        let packedEntry = null;
        let sourceBuildingKey = '';
        SMALL_APC_COLD_STORAGE_BUILDING_KEYS.forEach((buildingKey) => {
          nextColdStorageByBuilding[buildingKey] = nextColdStorageByBuilding[buildingKey].map((entry) => {
            const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
            const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
            if (!normalizedEntry || rowKey !== sourceSlotRowKey) return normalizedEntry;
            sourceBuildingKey = buildingKey;
            packedEntry = {
              ...normalizedEntry,
              apcStorageStatus: '포장완료',
              apcStorageStatusUpdatedAt: now,
              apcPackTypeLabel: String(job?.packTypeLabel || '선물포장').trim() || '선물포장',
            };
            changed = true;
            return packedEntry;
          });
        });
        if (!packedEntry || sourceBuildingKey !== SMALL_APC_SORTED_BUILDING_KEY) return { transferred: false, remainingBoxCount: 0, remainingTotalKg: 0 };
        const fullPalletCount = Math.floor(Math.max(0, Number(packedEntry?.boxCount || 0)) / SMALL_APC_BOXES_PER_PALLET);
        if (fullPalletCount <= 0) return { transferred: false, remainingBoxCount: Math.max(0, Number(packedEntry?.boxCount || 0)), remainingTotalKg: Math.max(0, Number(packedEntry?.totalKg || 0)) };
        const rows = buildSplitColdStorageRowsFromEntry(packedEntry, {
          boxesPerRow: SMALL_APC_BOXES_PER_PALLET,
          rowCount: fullPalletCount,
          statusLabel: '출고대기',
          packTypeLabel: String(job?.packTypeLabel || '선물포장').trim() || '선물포장',
          suffix: 'packed-shipping',
        });
        const placementResult = placeRowsIntoColdStorage(
          nextColdStorageByBuilding,
          rows,
          [SMALL_APC_SHIPPING_BUILDING_KEY]
        );
        const transferredPalletCount = Math.max(0, Number(placementResult?.placedRows?.length || 0));
        if (transferredPalletCount <= 0) {
          return { transferred: false, remainingBoxCount: Math.max(0, Number(packedEntry?.boxCount || 0)), remainingTotalKg: Math.max(0, Number(packedEntry?.totalKg || 0)) };
        }
        nextColdStorageByBuilding = placementResult.nextColdStorageByBuilding;
        const transferredBoxCount = transferredPalletCount * SMALL_APC_BOXES_PER_PALLET;
        const totalBoxCount = Math.max(1, Math.floor(Number(packedEntry?.boxCount || 0)));
        const approxBoxKg = totalBoxCount > 0
          ? (Math.max(0, Number(packedEntry?.totalKg || 0)) / totalBoxCount)
          : SMALL_APC_BOX_CAPACITY_KG;
        const remainingBoxCount = Math.max(0, totalBoxCount - transferredBoxCount);
        const remainingTotalKg = Math.max(0, Math.round((remainingBoxCount * approxBoxKg) * 10) / 10);
        nextColdStorageByBuilding[SMALL_APC_SORTED_BUILDING_KEY] = nextColdStorageByBuilding[SMALL_APC_SORTED_BUILDING_KEY].map((entry) => {
          const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
          const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
          if (!normalizedEntry || rowKey !== sourceSlotRowKey) return normalizedEntry;
          changed = true;
          if (remainingBoxCount <= 0 || remainingTotalKg <= 0.001) return null;
          return normalizeSmallApcColdStorageEntry({
            ...normalizedEntry,
            boxCount: remainingBoxCount,
            totalKg: remainingTotalKg,
            palletStackCount: Math.max(1, Math.ceil(remainingBoxCount / SMALL_APC_BOXES_PER_PALLET)),
            apcStorageStatus: '포장완료',
            apcStorageStatusUpdatedAt: now,
            apcPackTypeLabel: String(job?.packTypeLabel || '선물포장').trim() || '선물포장',
          });
        });
        return { transferred: true, remainingBoxCount, remainingTotalKg };
      };

      const nextPackingJobs = [];
      packingJobs.forEach((job) => {
        const startedAt = Math.max(0, Number(job?.startedAt || 0));
        const finishedAt = startedAt + Math.max(100, Number(job?.durationMs || 0));
        const sourceSlotRowKey = String(job?.sourceSlotRowKey || '').trim();
        const currentStatus = String(job?.status || 'queued').trim() || 'queued';
        const completedAt = Math.max(0, Number(job?.completedAt || 0));
        if (completedAt > 0) {
          const readyToTransferAt = completedAt + SMALL_APC_PACKING_OUTPUT_BUFFER_MS;
          if (now >= readyToTransferAt) {
            const transferResult = finalizePackedEntry(sourceSlotRowKey, job);
            if (transferResult?.transferred) {
              changed = true;
              if (Math.max(0, Number(transferResult?.remainingBoxCount || 0)) > 0) {
                nextPackingJobs.push({
                  ...job,
                  boxCount: Math.max(0, Math.floor(Number(transferResult?.remainingBoxCount || 0))),
                  totalKg: Math.max(0, Number(transferResult?.remainingTotalKg || 0)),
                  completedAt: now,
                });
              }
              return;
            }
          }
          nextPackingJobs.push(job);
          return;
        }
        if (now >= finishedAt) {
          updateEntryStatus(sourceSlotRowKey, (entry) => ({
            ...entry,
            apcStorageStatus: '포장완료',
            apcStorageStatusUpdatedAt: now,
            apcPackTypeLabel: String(job?.packTypeLabel || '선물포장').trim() || '선물포장',
          }));
          if (currentStatus !== 'done' || completedAt <= 0) {
            changed = true;
            nextPackingJobs.push({
              ...job,
              status: 'done',
              completedAt: now,
            });
            return;
          }
          nextPackingJobs.push(job);
          return;
        }
        if (now >= startedAt && currentStatus !== 'active') {
          updateEntryStatus(sourceSlotRowKey, (entry) => ({
            ...entry,
            apcStorageStatus: '포장중',
            apcStorageStatusUpdatedAt: now,
            apcPackTypeLabel: String(job?.packTypeLabel || '선물포장').trim() || '선물포장',
          }));
          changed = true;
          nextPackingJobs.push({
            ...job,
            status: 'active',
          });
          return;
        }
        nextPackingJobs.push(job);
      });

      if (!changed) return prev;
      return {
        ...prev,
        smallApcColdStorageByBuilding: nextColdStorageByBuilding,
        smallApcPackingJobs: nextPackingJobs,
      };
    });
  }, [
    SMALL_APC_COLD_STORAGE_BUILDING_KEYS,
    SMALL_APC_SHIPPING_BUILDING_KEY,
    SMALL_APC_SORTED_BUILDING_KEY,
    game?.smallApcPackingJobs,
    normalizeSmallApcColdStorageByBuilding,
    normalizeSmallApcColdStorageEntry,
    normalizeSmallApcPackingJobs,
    activeSmallApcWorkersOf,
    pauseSmallApcTimedJobsWhenUnstaffed,
    game?.smallApcStaffState,
    SMALL_APC_PACKING_OUTPUT_BUFFER_MS,
    buildSplitColdStorageRowsFromEntry,
    placeRowsIntoColdStorage,
    setGame,
    smallApcWorkflowNow,
  ]);

  useEffect(() => {
    const currentShippingJobs = Array.isArray(game?.smallApcShippingJobs) ? game.smallApcShippingJobs : [];
    if (!currentShippingJobs.length) return;
    const now = smallApcWorkflowNow;
    const activeShippingWorkers = activeSmallApcWorkersOf(game?.smallApcStaffState, 'shipping');
    setGame((prev) => {
      if (!prev) return prev;
      const shippingJobs = normalizeSmallApcShippingJobs(prev?.smallApcShippingJobs);
      if (!shippingJobs.length) return prev;
      if (activeShippingWorkers <= 0) {
        const nextShippingJobs = pauseSmallApcTimedJobsWhenUnstaffed(shippingJobs, {
          now,
          activeWorkers: activeShippingWorkers,
          isDone: (job) => Math.max(0, Number(job?.completedAt || 0)) > 0,
        });
        if (nextShippingJobs === shippingJobs) return prev;
        return {
          ...prev,
          smallApcShippingJobs: nextShippingJobs,
        };
      }
      let nextColdStorageByBuilding = normalizeSmallApcColdStorageByBuilding(prev?.smallApcColdStorageByBuilding);
      let changed = false;

      const nextShippingJobs = shippingJobs.map((job) => {
        const sourceSlotRowKey = String(job?.sourceSlotRowKey || '').trim();
        const startedAt = Math.max(0, Number(job?.startedAt || 0));
        const finishedAt = startedAt + Math.max(100, Number(job?.durationMs || 0));
        const currentStatus = String(job?.status || 'queued').trim() || 'queued';
        if (Math.max(0, Number(job?.completedAt || 0)) > 0) return job;
        if (now >= finishedAt) {
          SMALL_APC_COLD_STORAGE_BUILDING_KEYS.forEach((buildingKey) => {
            nextColdStorageByBuilding[buildingKey] = nextColdStorageByBuilding[buildingKey].map((entry) => {
              const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
              const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
              if (!normalizedEntry || rowKey !== sourceSlotRowKey) return normalizedEntry;
              changed = true;
              return null;
            });
          });
          changed = true;
          return {
            ...job,
            status: 'done',
            completedAt: now,
          };
        }
        if (now >= startedAt && currentStatus !== 'active') {
          SMALL_APC_COLD_STORAGE_BUILDING_KEYS.forEach((buildingKey) => {
            nextColdStorageByBuilding[buildingKey] = nextColdStorageByBuilding[buildingKey].map((entry) => {
              const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
              const rowKey = String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim();
              if (!normalizedEntry || rowKey !== sourceSlotRowKey) return normalizedEntry;
              changed = true;
              return {
                ...normalizedEntry,
                apcStorageStatus: '출고중',
                apcStorageStatusUpdatedAt: now,
              };
            });
          });
          changed = true;
          return {
            ...job,
            status: 'active',
          };
        }
        return job;
      });

      if (!changed) return prev;
      return {
        ...prev,
        smallApcColdStorageByBuilding: nextColdStorageByBuilding,
        smallApcShippingJobs: nextShippingJobs,
      };
    });
  }, [
    SMALL_APC_COLD_STORAGE_BUILDING_KEYS,
    game?.smallApcShippingJobs,
    normalizeSmallApcColdStorageByBuilding,
    normalizeSmallApcColdStorageEntry,
    normalizeSmallApcShippingJobs,
    activeSmallApcWorkersOf,
    pauseSmallApcTimedJobsWhenUnstaffed,
    game?.smallApcStaffState,
    setGame,
    smallApcWorkflowNow,
  ]);

  useEffect(() => {
    const currentSortingJobs = Array.isArray(game?.smallApcSortingJobs) ? game.smallApcSortingJobs : [];
    const currentOutputBins = Array.isArray(game?.smallApcSortingOutputBins) ? game.smallApcSortingOutputBins : [];
    if (!currentSortingJobs.length && !currentOutputBins.length) return;
    const now = smallApcWorkflowNow;
    const activeSortingWorkers = activeSmallApcWorkersOf(game?.smallApcStaffState, 'sorting');
    setGame((prev) => {
      if (!prev) return prev;
      const sortingJobs = normalizeSmallApcSortingJobs(prev?.smallApcSortingJobs);
      let sortingOutputBins = normalizeSmallApcSortingOutputBins(prev?.smallApcSortingOutputBins);
      let nextColdStorageByBuilding = normalizeSmallApcColdStorageByBuilding(prev?.smallApcColdStorageByBuilding);
      let changed = false;
      if (sortingJobs.length && activeSortingWorkers <= 0) {
        const nextSortingJobs = pauseSmallApcTimedJobsWhenUnstaffed(sortingJobs, {
          now,
          activeWorkers: activeSortingWorkers,
          isDone: (job) => Math.max(0, Number(job?.outputCommittedAt || 0)) > 0,
        });
        if (nextSortingJobs !== sortingJobs) {
          return {
            ...prev,
            smallApcSortingJobs: nextSortingJobs,
          };
        }
      }

      const flushBinRowsIntoColdStorage = (rows = []) => {
        const placementResult = placeRowsIntoColdStorage(
          nextColdStorageByBuilding,
          rows,
          [SMALL_APC_SORTED_BUILDING_KEY]
        );
        const { nextColdStorageByBuilding: placedStorage, placedRows } = placementResult;
        if (placedRows.length > 0) {
          nextColdStorageByBuilding = placedStorage;
          changed = true;
        }
        return placementResult;
      };

      sortingJobs.forEach((job, jobIndex) => {
        const finishedAt = Math.max(0, Number(job?.startedAt || 0)) + Math.max(100, Number(job?.durationMs || SMALL_APC_SORTING_BASE_DURATION_MS));
        if (now < finishedAt || Math.max(0, Number(job?.outputCommittedAt || 0)) > 0) return;
        const sourceSlotRowKey = String(job?.sourceSlotRowKey || '').trim();
        let sourceEntry = null;
        if (sourceSlotRowKey) {
          SMALL_APC_COLD_STORAGE_BUILDING_KEYS.forEach((buildingKey) => {
            nextColdStorageByBuilding[buildingKey] = nextColdStorageByBuilding[buildingKey].map((entry) => {
              const normalizedEntry = normalizeSmallApcColdStorageEntry(entry);
              if (!normalizedEntry) return normalizedEntry;
              if (String(normalizedEntry?.slotRowKey || normalizedEntry?.rowKey || '').trim() !== sourceSlotRowKey) return normalizedEntry;
              sourceEntry = normalizedEntry;
              changed = true;
              return null;
            });
          });
        }
        const lineNo = Math.max(1, Number(job?.lineNo || 1));
        const ticketNo = String(job?.ticketNo || '').trim();
        const totalKg = Math.max(0, Number(sourceEntry?.totalKg || job?.cargoKg || 0));
        const quality = Math.max(0, Number(sourceEntry?.life || 0));
        const sortingPlan = buildAppleSortingPlan({ totalKg, quality });
        const sourceGradeLabel = String(sourceEntry?.gradeLabel || job?.gradeLabel || '미선별').trim() || '미선별';
        let outputRows = [];
        if (!sourceGradeLabel || sourceGradeLabel === '미선별') {
          outputRows = [
            ...((sortingPlan?.rows?.a || []).map((row) => ({ gradeLabel: 'A급', dieKey: String(row?.dieKey || ''), sizeLabel: String(row?.dieLabel || '미측정'), totalKg: Math.max(0, Number(row?.kg || 0)) }))),
            ...((sortingPlan?.rows?.b || []).map((row) => ({ gradeLabel: 'B급', dieKey: String(row?.dieKey || ''), sizeLabel: String(row?.dieLabel || '미측정'), totalKg: Math.max(0, Number(row?.kg || 0)) }))),
            ...((sortingPlan?.rows?.processing || []).map((row) => ({ gradeLabel: '가공급', dieKey: String(row?.dieKey || ''), sizeLabel: String(row?.dieLabel || '미측정'), totalKg: Math.max(0, Number(row?.kg || 0)) }))),
          ];
        } else if (sourceGradeLabel === '가공급') {
          outputRows = (sortingPlan?.rows?.processing || []).map((row) => ({
            gradeLabel: '가공급',
            dieKey: String(row?.dieKey || ''),
            sizeLabel: String(row?.dieLabel || '10다이').trim() || '10다이',
            totalKg: Math.max(0, Number(row?.kg || 0)),
          }));
        } else if (sourceGradeLabel === 'A급' || sourceGradeLabel === 'B급') {
          const dieRows = sourceGradeLabel === 'A급'
            ? (sortingPlan?.rows?.a || [])
            : (sortingPlan?.rows?.b || []);
          outputRows = dieRows.map((row) => ({
            gradeLabel: sourceGradeLabel,
            dieKey: String(row?.dieKey || ''),
            sizeLabel: String(row?.dieLabel || '미측정').trim() || '미측정',
            totalKg: Math.max(0, Number(row?.kg || 0)),
          }));
        }
        outputRows = outputRows.filter((row) => row.totalKg > 0.001 && row.dieKey);
        outputRows.forEach((row) => {
          const freshnessBucketLabel = smallApcFreshnessBucketOf(quality);
          const existingIndex = sortingOutputBins.findIndex((entry) => (
            String(entry?.ticketNo || '').trim() === ticketNo
            && String(entry?.gradeLabel || '') === String(row.gradeLabel || '')
            && String(entry?.dieKey || '') === String(row.dieKey || '')
            && String(entry?.freshnessBucketLabel || '') === freshnessBucketLabel
          ));
          if (existingIndex >= 0) {
            const currentEntry = sortingOutputBins[existingIndex];
            const nextTicketNos = Array.from(new Set(
              [
                ...(Array.isArray(currentEntry?.ticketNos) ? currentEntry.ticketNos : []),
                String(currentEntry?.ticketNo || '').trim(),
                ticketNo,
              ]
                .map((value) => String(value || '').trim())
                .filter(Boolean)
            ));
            const incomingShipperName = String(job?.shipperName || '').trim();
            const currentShipperName = String(currentEntry?.shipperName || '').trim();
            const incomingVehicleName = String(job?.vehicleName || '').trim();
            const currentVehicleName = String(currentEntry?.vehicleName || '').trim();
            sortingOutputBins[existingIndex] = {
              ...currentEntry,
              totalKg: Math.max(0, Number(currentEntry?.totalKg || 0)) + row.totalKg,
              boxCount: Math.max(1, Math.ceil((Math.max(0, Number(currentEntry?.totalKg || 0)) + row.totalKg) / SMALL_APC_BOX_CAPACITY_KG)),
              ticketNos: nextTicketNos,
              playerOwned: Boolean(currentEntry?.playerOwned) || Boolean(job?.playerOwned),
              shipperName: currentShipperName && incomingShipperName && currentShipperName !== incomingShipperName ? '혼합 출하' : (currentShipperName || incomingShipperName),
              vehicleName: currentVehicleName && incomingVehicleName && currentVehicleName !== incomingVehicleName ? '혼합 차량' : (currentVehicleName || incomingVehicleName),
              vehiclePlateText: currentVehicleName && incomingVehicleName && currentVehicleName !== incomingVehicleName
                ? ''
                : (String(currentEntry?.vehiclePlateText || '').trim() || String(job?.vehiclePlateText || '').trim()),
              updatedAt: now,
            };
            changed = true;
            return;
          }
          sortingOutputBins.push({
            id: `small-apc-output-${lineNo}-${ticketNo}-${String(row.gradeLabel || '')}-${String(row.dieKey || '')}-${freshnessBucketLabel}`,
            lineNo,
            ticketNo,
            ticketNos: ticketNo ? [ticketNo] : [],
            shipperName: String(job?.shipperName || '').trim(),
            vehicleName: String(job?.vehicleName || '').trim(),
            vehiclePlateText: String(job?.vehiclePlateText || '').trim(),
            playerOwned: Boolean(job?.playerOwned),
            cropId: String(sourceEntry?.cropId || 'apple').trim() || 'apple',
            cropLabel: String(sourceEntry?.cropLabel || sourceEntry?.produceTypeLabel || '사과').trim() || '사과',
            produceTypeLabel: String(sourceEntry?.produceTypeLabel || job?.produceTypeLabel || '사과').trim() || '사과',
            qualityLabel: String(sourceEntry?.qualityLabel || job?.qualityLabel || '보통').trim() || '보통',
            gradeLabel: String(row.gradeLabel || '').trim(),
            freshnessBucketLabel,
            dieKey: String(row.dieKey || '').trim(),
            sizeLabel: String(row.sizeLabel || '미측정').trim() || '미측정',
            stemRemoved: true,
            life: quality,
            totalKg: row.totalKg,
            boxCount: Math.max(1, Math.ceil(row.totalKg / SMALL_APC_BOX_CAPACITY_KG)),
            updatedAt: now,
          });
          changed = true;
        });
        sortingJobs[jobIndex] = {
          ...job,
          outputCommittedAt: now,
        };
      });

      sortingOutputBins = sortingOutputBins.flatMap((bin) => {
        let remainingKg = Math.max(0, Number(bin?.totalKg || 0));
        const fullPalletCount = Math.floor((remainingKg + 0.001) / SMALL_APC_PALLET_CAPACITY_KG);
        if (fullPalletCount > 0) {
          const rows = Array.from({ length: fullPalletCount }, (_, index) => buildColdStorageRowFromOutputBin(
            bin,
            SMALL_APC_PALLET_CAPACITY_KG,
            SMALL_APC_BOXES_PER_PALLET,
            `full-${index + 1}`
          ));
          const { placedRows } = flushBinRowsIntoColdStorage(rows);
          remainingKg = Math.max(0, remainingKg - (placedRows.length * SMALL_APC_PALLET_CAPACITY_KG));
        }
        if (remainingKg <= 0.001) {
          changed = true;
          return [];
        }
        return [{
          ...bin,
          totalKg: remainingKg,
          boxCount: Math.max(1, Math.ceil(remainingKg / SMALL_APC_BOX_CAPACITY_KG)),
          updatedAt: now,
        }];
      });

      if (!changed) return prev;
      return {
        ...prev,
        smallApcColdStorageByBuilding: nextColdStorageByBuilding,
        smallApcSortingJobs: sortingJobs,
        smallApcSortingOutputBins: sortingOutputBins,
      };
    });
  }, [
    SMALL_APC_BOXES_PER_PALLET,
    SMALL_APC_BOX_CAPACITY_KG,
    SMALL_APC_COLD_STORAGE_BUILDING_KEYS,
    SMALL_APC_PALLET_CAPACITY_KG,
    SMALL_APC_SORTING_BASE_DURATION_MS,
    SMALL_APC_SORTING_MOVE_OUT_DURATION_MS,
    SMALL_APC_SORTED_BUILDING_KEY,
    buildSortingOutputBinFromColdStorageRow,
    buildColdStorageRowFromOutputBin,
    game?.smallApcSortingJobs,
    game?.smallApcSortingOutputBins,
    normalizeSmallApcColdStorageByBuilding,
    normalizeSmallApcColdStorageEntry,
    normalizeSmallApcSortingJobs,
    normalizeSmallApcSortingOutputBins,
    activeSmallApcWorkersOf,
    pauseSmallApcTimedJobsWhenUnstaffed,
    game?.smallApcStaffState,
    placeRowsIntoColdStorage,
    setGame,
    smallApcFreshnessBucketOf,
    smallApcWorkflowNow,
  ]);

  useEffect(() => {
    const currentSortingJobs = Array.isArray(game?.smallApcSortingJobs) ? game.smallApcSortingJobs : [];
    const currentSortingOutputBins = Array.isArray(game?.smallApcSortingOutputBins) ? game.smallApcSortingOutputBins : [];
    if (!currentSortingJobs.length) return;
    const existingSettlementRows = Array.isArray(game?.smallApcSettlementRows) ? game.smallApcSettlementRows : [];
    const existingSettlementStatusByTicket = new Map(
      existingSettlementRows
        .map((row) => [String(row?.ticketNo || '').trim(), String(row?.status || '').trim()])
        .filter(([ticketNo]) => Boolean(ticketNo))
    );
    const now = smallApcWorkflowNow;
    const ticketReadyRows = new Map();
    currentSortingJobs.forEach((job) => {
      const ticketNo = String(job?.ticketNo || '').trim();
      if (!ticketNo) return;
      const row = ticketReadyRows.get(ticketNo) || { allDone: true, jobs: [] };
      const startedAt = Math.max(0, Number(job?.startedAt || 0));
      const durationMs = Math.max(100, Number(job?.durationMs || SMALL_APC_SORTING_BASE_DURATION_MS));
      const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || SMALL_APC_SORTING_MOVE_OUT_DURATION_MS));
      if (now < startedAt + durationMs + moveOutDurationMs) row.allDone = false;
      row.jobs.push(job);
      ticketReadyRows.set(ticketNo, row);
    });
    const readyTickets = Array.from(ticketReadyRows.entries())
      .filter(([, row]) => row.allDone && row.jobs.length > 0)
      .filter(([ticketNo]) => smallApcPlayerShipmentTicketSet.has(ticketNo))
      .map(([ticketNo, row]) => {
        const firstJob = row.jobs[0] || {};
        const harvestRows = buildSmallApcHarvestRowsForSettlementTicket({
          coldStorageByBuilding: game?.smallApcColdStorageByBuilding,
          sortingOutputBins: game?.smallApcSortingOutputBins,
          ticketNo,
        });
        return {
          ticketNo,
          shipperName: String(firstJob?.shipperName || '').trim(),
          vehicleName: String(firstJob?.vehicleName || '').trim(),
          vehiclePlateText: String(firstJob?.vehiclePlateText || '').trim(),
          shipmentDay: Math.max(0, Math.floor(Number(firstJob?.shipmentDay || 0))),
          cargoKg: row.jobs.reduce((sum, job) => sum + Math.max(0, Number(job?.cargoKg || 0)), 0),
          receivedBoxCount: row.jobs.reduce((sum, job) => sum + Math.max(0, Number(job?.boxCount || 0)), 0),
          cargoType: String(firstJob?.produceTypeLabel || '사과').trim() || '사과',
          harvestRows,
        };
      })
      .filter((row) => row.ticketNo);
    if (!readyTickets.length) return;
    const newReadyTickets = readyTickets.filter((row) => {
      const ticketNo = String(row?.ticketNo || '').trim();
      if (!ticketNo) return false;
      const status = existingSettlementStatusByTicket.get(ticketNo);
      return status !== 'pending' && status !== 'paid';
    });
    setGame((prev) => {
      if (!prev) return prev;
      const currentRows = Array.isArray(prev?.smallApcSettlementRows) ? prev.smallApcSettlementRows : [];
      const currentTicketSet = new Set(currentRows.map((row) => String(row?.ticketNo || '').trim()).filter(Boolean));
      const readyTicketSet = new Set(readyTickets.map((row) => String(row?.ticketNo || '').trim()).filter(Boolean));
      const readyTicketMap = new Map(
        readyTickets.map((row) => [String(row?.ticketNo || '').trim(), row]).filter(([ticketNo]) => Boolean(ticketNo))
      );
      const nextSettlementRows = currentRows.map((row) => {
        const ticketNo = String(row?.ticketNo || '').trim();
        if (!ticketNo || !readyTicketSet.has(ticketNo) || String(row?.status || '') === 'paid') return row;
        const readyRow = readyTicketMap.get(ticketNo);
        if (!readyRow) {
          return {
            ...row,
            status: 'pending',
          };
        }
        return {
          ...buildSmallApcSettlementDraft({
            ticketNo: readyRow.ticketNo,
            shipperName: readyRow.shipperName,
            vehicleName: readyRow.vehicleName,
            vehiclePlateText: readyRow.vehiclePlateText,
            shipmentDay: readyRow.shipmentDay,
            harvestRows: readyRow.harvestRows,
            fallbackCargoKg: readyRow.cargoKg,
            receivedBoxCount: readyRow.receivedBoxCount,
            fallbackCargoType: readyRow.cargoType,
            settlementDay: Math.max(1, Math.floor(Number(prev?.day) || 1)),
          }),
          status: 'pending',
        };
      });
      const draftRows = readyTickets
        .filter((row) => !currentTicketSet.has(String(row?.ticketNo || '').trim()))
        .map((row) => buildSmallApcSettlementDraft({
          ticketNo: row.ticketNo,
          shipperName: row.shipperName,
          vehicleName: row.vehicleName,
          vehiclePlateText: row.vehiclePlateText,
          shipmentDay: row.shipmentDay,
          harvestRows: row.harvestRows,
          fallbackCargoKg: row.cargoKg,
          receivedBoxCount: row.receivedBoxCount,
          fallbackCargoType: row.cargoType,
          settlementDay: Math.max(1, Math.floor(Number(prev?.day) || 1)),
        }))
        .filter((row) => String(row?.ticketNo || '').trim());
      const drafts = draftRows.map((row) => ({
        ...row,
        status: 'pending',
      }));
      const mergedSettlementRows = drafts.length ? [...nextSettlementRows, ...drafts] : nextSettlementRows;
      const settlementChanged = (
        mergedSettlementRows.length !== currentRows.length
        || mergedSettlementRows.some((row, index) => row !== currentRows[index])
      );
      if (!settlementChanged) return prev;
      const nextState = {
        ...prev,
        smallApcSettlementRows: mergedSettlementRows,
      };
      return {
        ...nextState,
        ...appendPhoneNotificationsStatePatch(nextState, drafts.map((row) => ({
          type: 'small-apc-sorting-done',
          source: 'small-apc',
          priority: 'high',
          title: '소형 APC 선별 완료',
          body: `${row.ticketNo} ${String(row?.vehicleName || '출하 차량')}${row?.vehiclePlateText ? ` (${row.vehiclePlateText})` : ''} 선별이 끝났습니다. 이제 소형 APC 사무실 정산 창구에서 정산받을 수 있습니다.`,
          createdDay: Math.max(1, Math.floor(Number(prev?.day) || 1)),
          createdAtLabel: '문자알림',
          actionApp: 'messages',
        }))),
      };
    });
    if (smallApcMapOpen) {
      newReadyTickets.forEach((row) => {
        queueSmallApcLiveNotice({
          type: 'sorting-done',
          ticketNo: row.ticketNo,
          title: `${row.shipperName || '출하자'}님, 선별이 완료되었습니다`,
          body: `${row.ticketNo} ${row.vehicleName || '출하 차량'}${row.vehiclePlateText ? ` (${row.vehiclePlateText})` : ''}\nAPC 선별이 끝났습니다.\n이제 소형 APC 사무실 정산 창구에서 정산받을 수 있습니다.`,
        });
      });
    }
  }, [
    SMALL_APC_SORTING_BASE_DURATION_MS,
    SMALL_APC_SORTING_MOVE_OUT_DURATION_MS,
    appendPhoneNotificationsStatePatch,
    buildSmallApcHarvestRowsForSettlementTicket,
    buildSmallApcSettlementDraft,
    game?.smallApcColdStorageByBuilding,
    game?.smallApcSettlementRows,
    game?.smallApcSortingJobs,
    game?.smallApcSortingOutputBins,
    queueSmallApcLiveNotice,
    setGame,
    setMapLocationModal,
    smallApcMapOpen,
    smallApcPlayerShipmentTicketSet,
    smallApcWorkflowNow,
  ]);

  useEffect(() => {
    const settlementRows = Array.isArray(game?.smallApcSettlementRows) ? game.smallApcSettlementRows : [];
    if (!settlementRows.length) return;
    const playerTicketSet = new Set(
      (Array.isArray(game?.smallApcPlayerShipmentTicketNos) ? game.smallApcPlayerShipmentTicketNos : [])
        .map((ticketNo) => String(ticketNo || '').trim())
        .filter(Boolean)
    );
    const draftByTicket = new Map();
    settlementRows.forEach((row) => {
      const ticketNo = String(row?.ticketNo || '').trim();
      if (!ticketNo || !playerTicketSet.has(ticketNo)) return;
      if (String(row?.status || '').trim() !== 'pending') return;
      const harvestRows = buildSmallApcHarvestRowsForSettlementTicket({
        coldStorageByBuilding: game?.smallApcColdStorageByBuilding,
        sortingOutputBins: game?.smallApcSortingOutputBins,
        ticketNo,
      });
      if (!harvestRows.length) return;
      draftByTicket.set(ticketNo, buildSmallApcSettlementDraft({
        ticketNo,
        shipperName: row?.shipperName,
        vehicleName: row?.vehicleName,
        vehiclePlateText: row?.vehiclePlateText,
        shipmentDay: row?.shipmentDay,
        harvestRows,
        fallbackCargoKg: row?.cargoKg,
        receivedBoxCount: row?.receivedBoxCount,
        fallbackCargoType: row?.cargoType,
        settlementDay: Math.max(1, Math.floor(Number(game?.day) || 1)),
      }));
    });
    if (!draftByTicket.size) return;
    const hasMismatch = settlementRows.some((row) => {
      const ticketNo = String(row?.ticketNo || '').trim();
      const nextDraft = draftByTicket.get(ticketNo);
      if (!nextDraft) return false;
      return (
        Math.abs(Math.max(0, Number(row?.cargoKg || 0)) - Math.max(0, Number(nextDraft?.cargoKg || 0))) > 0.001
        || Math.max(0, Number(row?.boxCount || 0)) !== Math.max(0, Number(nextDraft?.boxCount || 0))
        || JSON.stringify(row?.boxGroups || []) !== JSON.stringify(nextDraft?.boxGroups || [])
      );
    });
    if (!hasMismatch) return;
    setGame((prev) => {
      if (!prev) return prev;
      const currentRows = Array.isArray(prev?.smallApcSettlementRows) ? prev.smallApcSettlementRows : [];
      let changed = false;
      const nextRows = currentRows.map((row) => {
        const ticketNo = String(row?.ticketNo || '').trim();
        const nextDraft = draftByTicket.get(ticketNo);
        if (!nextDraft) return row;
        const nextRow = {
          ...nextDraft,
          status: 'pending',
          createdAt: Math.max(0, Number(row?.createdAt || 0)) || nextDraft.createdAt,
          paidAt: Math.max(0, Number(row?.paidAt || 0)),
        };
        if (
          Math.abs(Math.max(0, Number(row?.cargoKg || 0)) - Math.max(0, Number(nextRow?.cargoKg || 0))) <= 0.001
          && Math.max(0, Number(row?.boxCount || 0)) === Math.max(0, Number(nextRow?.boxCount || 0))
          && JSON.stringify(row?.boxGroups || []) === JSON.stringify(nextRow?.boxGroups || [])
        ) {
          return row;
        }
        changed = true;
        return nextRow;
      });
      if (!changed) return prev;
      return {
        ...prev,
        smallApcSettlementRows: nextRows,
      };
    });
  }, [
    buildSmallApcHarvestRowsForSettlementTicket,
    buildSmallApcSettlementDraft,
    game?.day,
    game?.smallApcColdStorageByBuilding,
    game?.smallApcPlayerShipmentTicketNos,
    game?.smallApcSettlementRows,
    game?.smallApcSortingOutputBins,
    setGame,
  ]);

  const handleSmallApcPlayerUnloadGraceExpired = useCallback((job = null) => {
    const playerVehicleId = String(job?.playerVehicleId || '').trim();
    const vehicleName = String(job?.vehicleName || '내 화물차').trim() || '내 화물차';
    const vehiclePlateText = String(job?.vehiclePlateText || '').trim();
    if (!playerVehicleId) return;
    const loadingStorageKey = townMarkerParkingStorageKeyOf('smallApc', 'loading');
    const generalStorageKey = townMarkerParkingStorageKeyOf('smallApc', 'general');
    setGame((prev) => {
      if (!prev) return prev;
      const nextTownMarkerParkingByKey = clearVehicleFromSettlementParking({
        parkingByKey: prev?.townMarkerParkingByKey || {},
        vehicleInstanceId: playerVehicleId,
        normalizeSlots: (key, rawSlots) => normalizeActiveTownMarkerParkingSlots(key, rawSlots),
      });
      const generalSlots = normalizeActiveTownMarkerParkingSlots(
        generalStorageKey,
        nextTownMarkerParkingByKey?.[generalStorageKey]
      );
      const targetSlotIndex = generalSlots.findIndex((entry) => !String(entry || '').trim());
      if (targetSlotIndex < 0) return prev;
      generalSlots[targetSlotIndex] = playerVehicleId;
      nextTownMarkerParkingByKey[generalStorageKey] = generalSlots;
      nextTownMarkerParkingByKey[loadingStorageKey] = normalizeActiveTownMarkerParkingSlots(
        loadingStorageKey,
        nextTownMarkerParkingByKey?.[loadingStorageKey]
      );
      const fine = Math.max(0, Number(SMALL_APC_PLAYER_POST_UNLOAD_FINE_WON) || 0);
      const movedSlotNo = targetSlotIndex + 1;
      const detailText = `${vehicleName}${vehiclePlateText ? ` (${vehiclePlateText})` : ''}`;
      const logText = `소형 APC 하차칸 체류 초과: ${detailText} 일반 주차장 P${movedSlotNo}로 이동${fine > 0 ? ` / 벌금 -${won(fine)}` : ''}`;
      const nextState = {
        ...prev,
        money: Math.max(0, (Number(prev.money) || 0) - fine),
        townMarkerParkingByKey: nextTownMarkerParkingByKey,
        townMarkerParkingSlotByKey: {
          ...(prev?.townMarkerParkingSlotByKey || {}),
          [loadingStorageKey]: 0,
          [generalStorageKey]: movedSlotNo,
        },
        logs: pushDiary(prev, logText),
      };
      return {
        ...nextState,
        ...appendPhoneNotificationsStatePatch(nextState, [
          {
            type: 'small-apc-overstay-fine',
            source: 'small-apc',
            priority: 'high',
            title: '소형 APC 하차칸 정리',
            body: `${detailText} 차량이 3분을 넘겨 일반 주차장 P${movedSlotNo}로 이동되었습니다.${fine > 0 ? ` 벌금 ${won(fine)} 부과.` : ''}`,
            createdDay: Math.max(1, Math.floor(Number(prev?.day) || 1)),
            createdAtLabel: '소형 APC',
            actionApp: 'messages',
          }
        ]),
      };
    });
  }, [
    SMALL_APC_PLAYER_POST_UNLOAD_FINE_WON,
    appendPhoneNotificationsStatePatch,
    clearVehicleFromSettlementParking,
    normalizeActiveTownMarkerParkingSlots,
    pushDiary,
    setGame,
    townMarkerParkingStorageKeyOf,
    won,
  ]);

  return {
    smallApcLiveNotice,
    closeSmallApcLiveNotice,
    paySmallApcSettlement,
    sendSmallApcColdStorageToPacking,
    sendSmallApcColdStorageToShipping,
    handleSmallApcPlayerTurnReady,
    handleSmallApcPlayerUnloadDone,
    handleSmallApcNpcUnloadDone,
    handleSmallApcPlayerUnloadGraceExpired,
  };
}
