import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  advanceSmallApcLoadingNpcJob,
  buildSmallApcArrivalProfile,
  buildSmallApcLoadingNpcJob,
  buildSmallApcLoadingPlayerJob,
  SMALL_APC_LOADING_ASSIGNMENT_PENDING,
  SMALL_APC_LOADING_PARKING_KEY,
  SMALL_APC_SHIPPING_PARKING_KEY,
  SMALL_APC_LOADING_PARKING_SLOT_COUNT,
  SMALL_APC_PLAYER_LOADING_ENTRY_GRACE_MS,
  SMALL_APC_LOADING_DONE,
  SMALL_APC_LOADING_PREPARING,
  SMALL_APC_LOADING_UNLOADING,
  SMALL_APC_LOADING_WAITING,
  SMALL_APC_PARKING_SLOT_COUNT,
  smallApcLoadingBlocksBay,
  smallApcLoadingDurationByStatus,
  smallApcLoadingOccupiesBay,
  smallApcPlayerTurnReservationActive,
} from './smallApcUtils';
import {
  buildSmallApcLoadingSlotRows,
  buildSmallApcReceptionWorkflowRows,
  mergeSmallApcGeneralParkingSlotRows,
} from './smallApcSelectors';

export default function useSmallApcWorkflow({
  randIntInclusive,
  randomVehicleNames,
  findItemImageSrcByKeywords,
  day,
  timeOfDay,
  weatherName,
  playerName,
  townMarkerParkingModalDestinationKey,
  townMarkerParkingStorageKey,
  townMarkerParkingArrivedVehicleId,
  baseTownMarkerParkingSlotRows,
  smallApcBaseParkingSlotRows,
  smallApcBaseLoadingParkingSlotRows,
  smallApcBaseShippingParkingSlotRows,
  devPlayerUnloadSkipEnabled = false,
  activeReceivingWorkerCount = 1,
  activeLoadingWorkerCount = 1,
  onPlayerTurnReady,
  onPlayerUnloadDone,
  onNpcUnloadDone,
  onPlayerUnloadGraceExpired,
}) {
  const [smallApcLoadingNpcBySlot, setSmallApcLoadingNpcBySlot] = useState({});
  const [smallApcLoadingTicketSeq, setSmallApcLoadingTicketSeq] = useState(0);
  const [smallApcLoadingNow, setSmallApcLoadingNow] = useState(() => Date.now());
  const smallApcLoadingTicketSeqRef = useRef(0);
  const smallApcPlayerJobSlotSeqRef = useRef(1000);
  const notifiedPlayerTurnTicketSetRef = useRef(new Set());
  const notifiedPlayerUnloadDoneKeySetRef = useRef(new Set());
  const notifiedNpcUnloadDoneKeySetRef = useRef(new Set());
  const handledPlayerUnloadExpiryKeySetRef = useRef(new Set());

  const issueOldestPendingSmallApcTicket = useCallback((prev, now = Date.now()) => {
    const pendingEntry = Object.entries(prev || {})
      .map(([slotNo, job]) => ({ slotNo: Number(slotNo), job }))
      .filter(({ job }) => job && job.status === SMALL_APC_LOADING_ASSIGNMENT_PENDING)
      .sort((a, b) => Number(a.job?.occupiedAt || 0) - Number(b.job?.occupiedAt || 0))[0];
    if (!pendingEntry) {
      return {
        nextJobs: prev,
        assignedPayload: null,
        changed: false,
      };
    }
    const nextTicketSeq = smallApcLoadingTicketSeqRef.current + 1;
    smallApcLoadingTicketSeqRef.current = nextTicketSeq;
    setSmallApcLoadingTicketSeq(nextTicketSeq);
    const ticketNo = `A-${String(nextTicketSeq).padStart(3, '0')}`;
    const nextJob = {
      ...pendingEntry.job,
      loadingSlotNo: 0,
      status: SMALL_APC_LOADING_WAITING,
      ticketNo,
      stageStartedAt: now,
      stageEndsAt: 0
    };
    return {
      nextJobs: {
        ...(prev || {}),
        [pendingEntry.slotNo]: nextJob
      },
      assignedPayload: {
        slotLabel: ticketNo,
        vehicleName: String(nextJob?.vehicleName || '대기 차량'),
        ticketNo
      },
      changed: true,
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSmallApcLoadingNow(Date.now());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    smallApcLoadingTicketSeqRef.current = smallApcLoadingTicketSeq;
  }, [smallApcLoadingTicketSeq]);

  useEffect(() => {
    const ticketSet = notifiedPlayerTurnTicketSetRef.current;
    Object.values(smallApcLoadingNpcBySlot || {}).forEach((job) => {
      if (!job?.playerOwned) return;
      if (!smallApcPlayerTurnReservationActive(job, Date.now())) return;
      const ticketNo = String(job?.ticketNo || '').trim();
      const notificationKey = `${ticketNo}:${Math.max(0, Number(job?.playerTurnCalledAt || 0))}`;
      if (!ticketNo || ticketSet.has(notificationKey)) return;
      ticketSet.add(notificationKey);
      onPlayerTurnReady?.({
        ticketNo,
        vehicleName: String(job?.vehicleName || '내 화물차'),
        vehiclePlateText: String(job?.vehiclePlateText || ''),
        shipperName: String(job?.shipperName || job?.farmerName || ''),
        loadingSlotNo: Math.max(0, Number(job?.loadingSlotNo || 0)),
        deadlineMs: SMALL_APC_PLAYER_LOADING_ENTRY_GRACE_MS,
      });
    });
  }, [onPlayerTurnReady, smallApcLoadingNpcBySlot]);

  useEffect(() => {
    const notificationSet = notifiedPlayerUnloadDoneKeySetRef.current;
    Object.values(smallApcLoadingNpcBySlot || {}).forEach((job) => {
      if (!job?.playerOwned) return;
      if (String(job?.status || '') !== SMALL_APC_LOADING_DONE) return;
      const ticketNo = String(job?.ticketNo || '').trim();
      const stageStartedAt = Math.max(0, Number(job?.stageStartedAt || 0));
      const notificationKey = `${ticketNo}:${stageStartedAt}`;
      if (!ticketNo || notificationSet.has(notificationKey)) return;
      notificationSet.add(notificationKey);
      onPlayerUnloadDone?.({
        ticketNo,
        playerVehicleId: String(job?.playerVehicleId || ''),
        vehicleName: String(job?.vehicleName || '내 차량'),
        vehiclePlateText: String(job?.vehiclePlateText || ''),
        shipperName: String(job?.shipperName || job?.farmerName || ''),
        cargoType: String(job?.cargoType || ''),
        cargoKg: Math.max(0, Number(job?.cargoKg || 0)),
        loadingSlotNo: Math.max(0, Number(job?.loadingSlotNo || 0)),
        deadlineMs: Math.max(0, Number(job?.stageEndsAt || 0) - Date.now()),
      });
    });
  }, [onPlayerUnloadDone, smallApcLoadingNpcBySlot]);

  useEffect(() => {
    const notificationSet = notifiedNpcUnloadDoneKeySetRef.current;
    Object.values(smallApcLoadingNpcBySlot || {}).forEach((job) => {
      if (job?.playerOwned) return;
      if (String(job?.status || '') !== SMALL_APC_LOADING_DONE) return;
      const ticketNo = String(job?.ticketNo || '').trim();
      const stageStartedAt = Math.max(0, Number(job?.stageStartedAt || 0));
      const notificationKey = `${ticketNo}:${stageStartedAt}`;
      if (!ticketNo || notificationSet.has(notificationKey)) return;
      notificationSet.add(notificationKey);
      onNpcUnloadDone?.({
        ticketNo,
        vehicleName: String(job?.vehicleName || 'NPC 차량'),
        vehiclePlateText: String(job?.vehiclePlateText || ''),
        shipperName: String(job?.shipperName || job?.farmerName || ''),
        cargoType: String(job?.cargoType || ''),
        cargoKg: Math.max(0, Number(job?.cargoKg || 0)),
      });
    });
  }, [onNpcUnloadDone, smallApcLoadingNpcBySlot]);

  const arrivalProfile = useMemo(
    () => buildSmallApcArrivalProfile({
      day,
      timeOfDay,
      weatherName,
      npcBySlot: smallApcLoadingNpcBySlot,
    }),
    [day, smallApcLoadingNpcBySlot, timeOfDay, weatherName]
  );

  useEffect(() => {
    let disposed = false;
    let timeoutId = 0;
    const scheduleNextSpawn = () => {
      timeoutId = window.setTimeout(() => {
        if (disposed) return;
        setSmallApcLoadingNpcBySlot((prev) => {
          const next = { ...(prev || {}) };
          const occupiedSlots = Object.keys(next).map((slotNo) => Number(slotNo)).filter((slotNo) => slotNo >= 1 && slotNo <= SMALL_APC_PARKING_SLOT_COUNT);
          const emptySlots = Array.from({ length: SMALL_APC_PARKING_SLOT_COUNT }, (_, idx) => idx + 1)
            .filter((slotNo) => !occupiedSlots.includes(slotNo));
          if (!arrivalProfile.nightReceptionOpen || !emptySlots.length || occupiedSlots.length >= 8 || Math.random() > arrivalProfile.spawnChance) return prev;
          const slotNo = emptySlots[Math.floor(Math.random() * emptySlots.length)] || 1;
          next[slotNo] = buildSmallApcLoadingNpcJob({
            slotNo,
            now: Date.now(),
            randomVehicleNames,
            arrivalProfile,
            randIntInclusive,
          });
          return next;
        });
        scheduleNextSpawn();
      }, randIntInclusive(arrivalProfile.spawnDelayMinMs, arrivalProfile.spawnDelayMaxMs));
    };
    setSmallApcLoadingNpcBySlot((prev) => {
      if (Object.keys(prev || {}).length > 0) return prev;
      if (!arrivalProfile.nightReceptionOpen) return prev;
      const seeded = {};
      const initialCount = arrivalProfile.initialSeedCount;
      for (let idx = 0; idx < initialCount; idx += 1) {
        const slotNo = idx + 1;
        seeded[slotNo] = buildSmallApcLoadingNpcJob({
          slotNo,
          now: Date.now(),
          randomVehicleNames,
          arrivalProfile,
          randIntInclusive,
        });
      }
      return seeded;
    });
    scheduleNextSpawn();
    return () => {
      disposed = true;
      window.clearTimeout(timeoutId);
    };
  }, [arrivalProfile.initialSeedCount, arrivalProfile.nightReceptionOpen, arrivalProfile.spawnChance, arrivalProfile.spawnDelayMaxMs, arrivalProfile.spawnDelayMinMs, randIntInclusive, randomVehicleNames]);

  useEffect(() => {
    if (!arrivalProfile.nightReceptionOpen) return;
    const now = Date.now();
    const expiredPlayerJobs = [];
    setSmallApcLoadingNpcBySlot((prev) => {
      let touched = false;
      const next = { ...(prev || {}) };
      Object.entries(prev || {}).forEach(([slotNoRaw, job]) => {
        const slotNo = Number(slotNoRaw);
        if (!job) return;
        const status = String(job?.status || '');
        if (
          activeLoadingWorkerCount <= 0
          && (status === SMALL_APC_LOADING_PREPARING || status === SMALL_APC_LOADING_UNLOADING)
          && Number(job?.stageEndsAt || 0) > 0
        ) {
          const lastCheckedAt = Math.max(
            Number(job?.stageStartedAt || now),
            Number(job?.lastLoadingStaffCheckedAt || job?.stageStartedAt || now)
          );
          const stalledMs = Math.max(0, now - lastCheckedAt);
          next[slotNo] = {
            ...job,
            stageEndsAt: Number(job?.stageEndsAt || 0) + stalledMs,
            lastLoadingStaffCheckedAt: now,
          };
          touched = true;
          return;
        }
        const stageEndsAt = Number(job?.stageEndsAt || 0);
        if (stageEndsAt <= 0 || stageEndsAt > now) return;
        if (job?.playerOwned && String(job?.status || '') === SMALL_APC_LOADING_DONE) {
          delete next[slotNo];
          expiredPlayerJobs.push({ ...job });
          touched = true;
          return;
        }
        const advanced = advanceSmallApcLoadingNpcJob(job, now);
        if (!advanced) {
          delete next[slotNo];
        } else {
          next[slotNo] = advanced;
        }
        touched = true;
      });
      return touched ? next : prev;
    });
    expiredPlayerJobs.forEach((job) => {
      const expiryKey = `${String(job?.playerVehicleId || '')}:${Math.max(0, Number(job?.stageEndsAt || 0))}`;
      if (!expiryKey || handledPlayerUnloadExpiryKeySetRef.current.has(expiryKey)) return;
      handledPlayerUnloadExpiryKeySetRef.current.add(expiryKey);
      onPlayerUnloadGraceExpired?.(job);
    });
  }, [activeLoadingWorkerCount, onPlayerUnloadGraceExpired, smallApcLoadingNow]);

  useEffect(() => {
    if (activeReceivingWorkerCount <= 0) return;
    const now = Date.now();
    setSmallApcLoadingNpcBySlot((prev) => {
      const oldestPendingEntry = Object.entries(prev || {})
        .map(([slotNo, job]) => ({ slotNo: Number(slotNo), job }))
        .filter(({ job }) => job && job.status === SMALL_APC_LOADING_ASSIGNMENT_PENDING)
        .sort((a, b) => Number(a.job?.occupiedAt || 0) - Number(b.job?.occupiedAt || 0))[0];
      if (!oldestPendingEntry) return prev;
      const pendingElapsedMs = Math.max(0, now - Number(oldestPendingEntry.job?.occupiedAt || now));
      if (pendingElapsedMs < 9000) return prev;
      const { nextJobs, changed } = issueOldestPendingSmallApcTicket(prev, now);
      return changed ? nextJobs : prev;
    });
  }, [activeReceivingWorkerCount, arrivalProfile.nightReceptionOpen, issueOldestPendingSmallApcTicket, smallApcLoadingNow]);

  useEffect(() => {
    if (!arrivalProfile.nightReceptionOpen) return;
    if (activeLoadingWorkerCount <= 0) return;
    setSmallApcLoadingNpcBySlot((prev) => {
      const waitingEntries = Object.entries(prev || {})
        .map(([slotNo, job]) => ({ slotNo: Number(slotNo), job }))
        .filter(({ job }) => job && job.status === SMALL_APC_LOADING_WAITING && Number(job?.loadingSlotNo || 0) <= 0)
        .sort((a, b) => Number(a.job?.occupiedAt || 0) - Number(b.job?.occupiedAt || 0));
      if (!waitingEntries.length) return prev;
      const now = Date.now();
      const occupiedLoadingSlotSet = new Set(
        Object.values(prev || {})
          .filter((job) => smallApcLoadingBlocksBay(job, now))
          .map((job) => Number(job?.loadingSlotNo || 0))
          .filter((slotNo) => slotNo >= 1 && slotNo <= SMALL_APC_LOADING_PARKING_SLOT_COUNT)
      );
      const availableLoadingSlotNos = Array.from({ length: SMALL_APC_LOADING_PARKING_SLOT_COUNT }, (_, idx) => idx + 1)
        .filter((slotNo) => !occupiedLoadingSlotSet.has(slotNo));
      if (!availableLoadingSlotNos.length) return prev;
      const next = { ...(prev || {}) };
      let touched = false;
      waitingEntries.forEach(({ slotNo, job }, index) => {
        const loadingSlotNo = availableLoadingSlotNos[index];
        if (!loadingSlotNo) return;
        next[slotNo] = job?.playerOwned
          ? {
              ...job,
              loadingSlotNo,
              playerTurnCalledAt: now,
              playerDeadlineAt: now + SMALL_APC_PLAYER_LOADING_ENTRY_GRACE_MS,
              stageStartedAt: now,
              stageEndsAt: 0
            }
          : {
              ...job,
              loadingSlotNo,
              status: SMALL_APC_LOADING_PREPARING,
              stageStartedAt: now,
              stageEndsAt: now + smallApcLoadingDurationByStatus(SMALL_APC_LOADING_PREPARING, job)
            };
        touched = true;
      });
      return touched ? next : prev;
    });
  }, [activeLoadingWorkerCount, arrivalProfile.nightReceptionOpen, smallApcLoadingNow]);

  useEffect(() => {
    const loadingRows = Array.isArray(smallApcBaseLoadingParkingSlotRows) ? smallApcBaseLoadingParkingSlotRows : [];
    if (!loadingRows.length) return;
    const now = Date.now();
    setSmallApcLoadingNpcBySlot((prev) => {
      let touched = false;
      const next = { ...(prev || {}) };
      Object.entries(prev || {}).forEach(([slotNoRaw, job]) => {
        if (!job?.playerOwned) return;
        const loadingSlotNo = Math.max(0, Number(job?.loadingSlotNo || 0));
        if (loadingSlotNo <= 0) return;
        const matchedSlotRow = loadingRows.find((row) => Number(row?.slotNo || 0) === loadingSlotNo) || null;
        const parkedVehicleId = String(matchedSlotRow?.parkedVehicleId || '').trim();
        const playerVehicleId = String(job?.playerVehicleId || '').trim();
        const currentStatus = String(job?.status || '');
        if (
          playerVehicleId
          && currentStatus === SMALL_APC_LOADING_DONE
          && !parkedVehicleId
        ) {
          delete next[slotNoRaw];
          touched = true;
          return;
        }
        if (currentStatus !== SMALL_APC_LOADING_WAITING) return;
        if (parkedVehicleId && parkedVehicleId === playerVehicleId) {
          if (activeLoadingWorkerCount <= 0) return;
          if (devPlayerUnloadSkipEnabled) {
            next[slotNoRaw] = {
              ...job,
              status: SMALL_APC_LOADING_DONE,
              stageStartedAt: now,
              stageEndsAt: now + smallApcLoadingDurationByStatus(SMALL_APC_LOADING_DONE, job)
            };
            touched = true;
            return;
          }
          next[slotNoRaw] = {
            ...job,
            status: SMALL_APC_LOADING_PREPARING,
            stageStartedAt: now,
            stageEndsAt: now + smallApcLoadingDurationByStatus(SMALL_APC_LOADING_PREPARING, job)
          };
          touched = true;
          return;
        }
        const deadlineAt = Math.max(0, Number(job?.playerDeadlineAt || 0));
        if (deadlineAt > 0 && deadlineAt <= now) {
          next[slotNoRaw] = {
            ...job,
            loadingSlotNo: 0,
            occupiedAt: now,
            stageStartedAt: now,
            stageEndsAt: 0,
            playerTurnCalledAt: 0,
            playerDeadlineAt: 0,
          };
          touched = true;
        }
      });
      return touched ? next : prev;
    });
  }, [activeLoadingWorkerCount, devPlayerUnloadSkipEnabled, smallApcBaseLoadingParkingSlotRows, smallApcLoadingNow]);

  useEffect(() => {
    if (!devPlayerUnloadSkipEnabled) return;
    const now = Date.now();
    setSmallApcLoadingNpcBySlot((prev) => {
      let touched = false;
      const next = { ...(prev || {}) };
      Object.entries(prev || {}).forEach(([slotNoRaw, job]) => {
        if (!job?.playerOwned) return;
        const currentStatus = String(job?.status || '');
        if (currentStatus !== SMALL_APC_LOADING_PREPARING && currentStatus !== SMALL_APC_LOADING_UNLOADING) return;
        next[slotNoRaw] = {
          ...job,
          status: SMALL_APC_LOADING_DONE,
          stageStartedAt: now,
          stageEndsAt: now + smallApcLoadingDurationByStatus(SMALL_APC_LOADING_DONE, job)
        };
        touched = true;
      });
      return touched ? next : prev;
    });
  }, [devPlayerUnloadSkipEnabled, smallApcLoadingNow]);

  const smallApcReceptionWorkflowRows = useMemo(() => {
    const baseRows = buildSmallApcReceptionWorkflowRows({
      npcBySlot: smallApcLoadingNpcBySlot,
      now: smallApcLoadingNow,
      findItemImageSrcByKeywords,
    });
    const playerVehicleImageById = new Map(
      [
        ...(Array.isArray(smallApcBaseParkingSlotRows) ? smallApcBaseParkingSlotRows : []),
        ...(Array.isArray(smallApcBaseLoadingParkingSlotRows) ? smallApcBaseLoadingParkingSlotRows : []),
      ]
        .filter((row) => String(row?.parkedVehicleId || '').trim())
        .map((row) => [String(row?.parkedVehicleId || '').trim(), String(row?.parkedVehicleImageSrc || '')])
    );
    return baseRows.map((row) => {
      if (!row?.playerOwned) return row;
      const vehicleId = String(row?.parkedVehicleId || '').trim();
      const actualImageSrc = playerVehicleImageById.get(vehicleId) || '';
      if (!actualImageSrc) return row;
      return {
        ...row,
        parkedVehicleImageSrc: actualImageSrc,
      };
    });
  }, [findItemImageSrcByKeywords, smallApcBaseLoadingParkingSlotRows, smallApcBaseParkingSlotRows, smallApcLoadingNow, smallApcLoadingNpcBySlot]);

  const smallApcLoadingSlotRows = useMemo(
    () => buildSmallApcLoadingSlotRows(smallApcReceptionWorkflowRows),
    [smallApcReceptionWorkflowRows]
  );

  const smallApcLoadingParkingSlotRows = useMemo(() => {
    const baseRows = Array.isArray(smallApcBaseLoadingParkingSlotRows) ? smallApcBaseLoadingParkingSlotRows : [];
    if (!baseRows.length) return [];
    const reservedPlayerRows = (Array.isArray(smallApcReceptionWorkflowRows) ? smallApcReceptionWorkflowRows : [])
      .filter((row) => Boolean(row?.playerTurnReserved));
    const occupiedWorkflowRowBySlot = new Map(
      (Array.isArray(smallApcReceptionWorkflowRows) ? smallApcReceptionWorkflowRows : [])
        .filter((row) => smallApcLoadingOccupiesBay(row?.status))
        .map((row) => [Number(row?.loadingSlotNo || 0), row])
    );
    const reservedPlayerRowBySlot = new Map(
      reservedPlayerRows
        .map((row) => [Number(row?.loadingSlotNo || 0), row])
    );
    const arrivedVehicleId = String(townMarkerParkingArrivedVehicleId || '').trim();
    const activeReservedPlayerRow = reservedPlayerRows.find((row) => String(row?.parkedVehicleId || '').trim() === arrivedVehicleId) || null;
    const activeReservedSlotNo = Math.max(0, Number(activeReservedPlayerRow?.loadingSlotNo || 0));
    return baseRows.map((baseRow) => {
      const slotNo = Number(baseRow?.slotNo || 0);
      const occupiedWorkflowRow = occupiedWorkflowRowBySlot.get(slotNo);
      if (occupiedWorkflowRow) {
        const isPlayerOwnedWorkflowRow = Boolean(occupiedWorkflowRow?.playerOwned);
        return {
          ...baseRow,
          parkedVehicleId: isPlayerOwnedWorkflowRow
            ? String(baseRow?.parkedVehicleId || occupiedWorkflowRow?.parkedVehicleId || '')
            : '',
          occupied: true,
          occupiedByOther: !isPlayerOwnedWorkflowRow,
          randomOccupiedByNpc: !isPlayerOwnedWorkflowRow,
          npcOnly: !isPlayerOwnedWorkflowRow,
          parkedVehicleName: String(occupiedWorkflowRow?.parkedVehicleName || baseRow?.parkedVehicleName || ''),
          parkedVehicleImageSrc: String(occupiedWorkflowRow?.parkedVehicleImageSrc || baseRow?.parkedVehicleImageSrc || ''),
          parkingLabel: '소형 APC 하차',
          ticketNo: String(occupiedWorkflowRow?.ticketNo || ''),
          status: String(occupiedWorkflowRow?.status || ''),
          statusLabel: String(occupiedWorkflowRow?.statusLabel || ''),
          statusTone: String(occupiedWorkflowRow?.statusTone || ''),
          statusBadge: String(occupiedWorkflowRow?.statusBadge || ''),
          statusHint: String(occupiedWorkflowRow?.statusHint || ''),
          workflowLabel: String(occupiedWorkflowRow?.workflowLabel || ''),
          cargoType: String(occupiedWorkflowRow?.cargoType || ''),
          cargoKg: Math.max(0, Number(occupiedWorkflowRow?.cargoKg) || 0),
          parkedVehiclePlate: occupiedWorkflowRow?.parkedVehiclePlate || baseRow?.parkedVehiclePlate || null,
          parkedVehiclePlateText: String(occupiedWorkflowRow?.parkedVehiclePlateText || baseRow?.parkedVehiclePlateText || ''),
          shipperName: String(occupiedWorkflowRow?.shipperName || occupiedWorkflowRow?.farmerName || '').trim() || (isPlayerOwnedWorkflowRow ? String(playerName || '').trim() : ''),
          shipperGender: String(occupiedWorkflowRow?.shipperGender || ''),
          shipperEmoji: String(occupiedWorkflowRow?.shipperEmoji || ''),
          farmerName: String(occupiedWorkflowRow?.farmerName || '').trim() || (isPlayerOwnedWorkflowRow ? String(playerName || '').trim() : ''),
          remainingText: String(occupiedWorkflowRow?.remainingText || ''),
          remainingMs: Math.max(0, Number(occupiedWorkflowRow?.remainingMs) || 0),
          playerOwned: Boolean(occupiedWorkflowRow?.playerOwned),
          playerTurnReserved: Boolean(occupiedWorkflowRow?.playerTurnReserved),
          playerDeadlineAt: Math.max(0, Number(occupiedWorkflowRow?.playerDeadlineAt || 0)),
          canAssign: false,
        };
      }
      const reservedPlayerRow = reservedPlayerRowBySlot.get(slotNo);
      if (!reservedPlayerRow) {
        if (arrivedVehicleId && activeReservedSlotNo > 0 && slotNo !== activeReservedSlotNo) {
          return {
            ...baseRow,
            occupiedByOther: true,
            statusBadge: '지정칸 아님',
            statusTone: 'pending',
          };
        }
        return {
          ...baseRow,
          statusBadge: '자리 배정 필요',
          statusTone: 'pending',
          statusHint: '자리 배정 필요',
          workflowLabel: '번호표 발급 후 배정',
          requiresAssignment: true,
        };
      }
      const reservedVehicleId = String(reservedPlayerRow?.parkedVehicleId || '').trim();
      const parkedVehicleId = String(baseRow?.parkedVehicleId || '').trim();
      const correctVehicleParked = Boolean(reservedVehicleId && parkedVehicleId === reservedVehicleId);
      const occupiedByDifferentVehicle = Boolean(parkedVehicleId && parkedVehicleId !== reservedVehicleId);
      const designatedVehicleArrived = Boolean(arrivedVehicleId && arrivedVehicleId === reservedVehicleId);
      const showReservedVehiclePreview = correctVehicleParked || occupiedByDifferentVehicle;
      return {
        ...baseRow,
        occupied: correctVehicleParked || occupiedByDifferentVehicle,
        occupiedByOther: occupiedByDifferentVehicle || (Boolean(arrivedVehicleId) && !designatedVehicleArrived && !correctVehicleParked),
        randomOccupiedByNpc: false,
        npcOnly: false,
        parkedVehicleName: showReservedVehiclePreview
          ? String(baseRow?.parkedVehicleName || reservedPlayerRow?.parkedVehicleName || '')
          : '',
        parkedVehicleImageSrc: showReservedVehiclePreview
          ? String(baseRow?.parkedVehicleImageSrc || reservedPlayerRow?.parkedVehicleImageSrc || '')
          : '',
        parkingLabel: showReservedVehiclePreview ? '소형 APC 하차' : '입고대기 자리',
        ticketNo: String(reservedPlayerRow?.ticketNo || ''),
        status: String(reservedPlayerRow?.status || ''),
        statusLabel: String(reservedPlayerRow?.statusLabel || ''),
        statusTone: 'issued',
        statusBadge: '내 순번',
        statusHint: String(reservedPlayerRow?.statusHint || ''),
        workflowLabel: designatedVehicleArrived ? '여기에 주차' : '지정 차량 전용',
        cargoType: String(reservedPlayerRow?.cargoType || ''),
        cargoKg: Math.max(0, Number(reservedPlayerRow?.cargoKg) || 0),
        parkedVehiclePlate: baseRow?.parkedVehiclePlate || reservedPlayerRow?.parkedVehiclePlate || null,
        parkedVehiclePlateText: String(baseRow?.parkedVehiclePlateText || reservedPlayerRow?.parkedVehiclePlateText || ''),
        shipperName: String(reservedPlayerRow?.shipperName || reservedPlayerRow?.farmerName || '').trim() || String(playerName || '').trim(),
        shipperGender: String(reservedPlayerRow?.shipperGender || ''),
        shipperEmoji: String(reservedPlayerRow?.shipperEmoji || ''),
        farmerName: String(reservedPlayerRow?.farmerName || '').trim() || String(playerName || '').trim(),
        remainingText: String(reservedPlayerRow?.remainingText || ''),
        remainingMs: Math.max(0, Number(reservedPlayerRow?.remainingMs) || 0),
        playerOwned: Boolean(reservedPlayerRow?.playerOwned),
        playerTurnReserved: Boolean(reservedPlayerRow?.playerTurnReserved),
        playerDeadlineAt: Math.max(0, Number(reservedPlayerRow?.playerDeadlineAt || 0)),
        canAssign: false,
      };
    });
  }, [playerName, smallApcBaseLoadingParkingSlotRows, smallApcReceptionWorkflowRows, townMarkerParkingArrivedVehicleId]);

  const smallApcGeneralParkingSlotRows = useMemo(
    () => mergeSmallApcGeneralParkingSlotRows({
      destinationKey: 'smallApc',
      parkingStorageKey: 'smallApc',
      baseRows: smallApcBaseParkingSlotRows,
      receptionWorkflowRows: smallApcReceptionWorkflowRows,
    }),
    [
      smallApcBaseParkingSlotRows,
      smallApcReceptionWorkflowRows,
    ]
  );

  const smallApcShippingParkingSlotRows = useMemo(
    () => (Array.isArray(smallApcBaseShippingParkingSlotRows) ? smallApcBaseShippingParkingSlotRows : []),
    [smallApcBaseShippingParkingSlotRows]
  );

  const townMarkerParkingSlotRows = useMemo(
    () => (
      townMarkerParkingModalDestinationKey === 'smallApc'
        ? (
            townMarkerParkingStorageKey === SMALL_APC_LOADING_PARKING_KEY
              ? smallApcLoadingParkingSlotRows
              : (
                  townMarkerParkingStorageKey === SMALL_APC_SHIPPING_PARKING_KEY
                    ? smallApcShippingParkingSlotRows
                    : smallApcGeneralParkingSlotRows
                )
          )
        : baseTownMarkerParkingSlotRows
    ),
    [
      baseTownMarkerParkingSlotRows,
      smallApcGeneralParkingSlotRows,
      smallApcLoadingParkingSlotRows,
      smallApcShippingParkingSlotRows,
      townMarkerParkingModalDestinationKey,
      townMarkerParkingStorageKey
    ]
  );

  const assignSmallApcLoadingSlot = useCallback((playerParkingRow = null, playerVehicleDetail = null) => {
    const playerVehicleId = String(playerParkingRow?.parkedVehicleId || '').trim();
    if (playerVehicleId) {
      let assignedPayload = null;
      setSmallApcLoadingNpcBySlot((prev) => {
        const existingEntry = Object.entries(prev || {})
          .find(([, job]) => String(job?.playerVehicleId || '').trim() === playerVehicleId);
        if (existingEntry) {
          const existingJob = existingEntry[1] || {};
          assignedPayload = {
            slotLabel: String(existingJob?.ticketNo || ''),
            vehicleName: String(existingJob?.vehicleName || playerParkingRow?.parkedVehicleName || '내 화물차'),
            ticketNo: String(existingJob?.ticketNo || ''),
          };
          return prev;
        }
        let nextPlayerSlotNo = Math.max(1001, smallApcPlayerJobSlotSeqRef.current + 1);
        while (Object.prototype.hasOwnProperty.call(prev || {}, String(nextPlayerSlotNo))) {
          nextPlayerSlotNo += 1;
        }
        smallApcPlayerJobSlotSeqRef.current = nextPlayerSlotNo;
        const nextTicketSeq = smallApcLoadingTicketSeqRef.current + 1;
        smallApcLoadingTicketSeqRef.current = nextTicketSeq;
        setSmallApcLoadingTicketSeq(nextTicketSeq);
        const ticketNo = `A-${String(nextTicketSeq).padStart(3, '0')}`;
        const nextJob = {
          ...buildSmallApcLoadingPlayerJob({
            slotNo: nextPlayerSlotNo,
            now: Date.now(),
            parkedVehicleRow: playerParkingRow,
            vehicleDetail: playerVehicleDetail,
            playerName,
          }),
          ticketNo,
        };
        assignedPayload = {
          slotLabel: ticketNo,
          vehicleName: String(nextJob?.vehicleName || '내 화물차'),
          ticketNo,
        };
        return {
          ...(prev || {}),
          [nextPlayerSlotNo]: nextJob,
        };
      });
      return assignedPayload;
    }
    let assignedPayload = null;
    setSmallApcLoadingNpcBySlot((prev) => {
      const { nextJobs, assignedPayload: nextAssignedPayload, changed } = issueOldestPendingSmallApcTicket(prev, Date.now());
      if (!changed) return prev;
      assignedPayload = nextAssignedPayload;
      return nextJobs;
    });
    return assignedPayload;
  }, [issueOldestPendingSmallApcTicket, playerName]);

  return {
    smallApcLoadingNpcBySlot,
    setSmallApcLoadingNpcBySlot,
    smallApcLoadingNow,
    arrivalProfile,
    smallApcReceptionWorkflowRows,
    smallApcLoadingSlotRows,
    smallApcGeneralParkingSlotRows,
    smallApcLoadingParkingSlotRows,
    smallApcShippingParkingSlotRows,
    townMarkerParkingSlotRows,
    assignSmallApcLoadingSlot,
    smallApcOperationProfile: arrivalProfile,
  };
}
