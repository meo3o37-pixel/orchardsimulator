import {
  formatRemainingSecondsText,
  SMALL_APC_LOADING_ASSIGNMENT_PENDING,
  SMALL_APC_LOADING_PARKING_KEY,
  SMALL_APC_LOADING_PARKING_SLOT_COUNT,
  SMALL_APC_LOADING_WAITING,
  smallApcLoadingOccupiesBay,
  smallApcPlayerTurnReservationActive,
  smallApcLoadingStatusLabelOf,
  smallApcLoadingStatusToneOf,
} from './smallApcUtils';

export const buildSmallApcReceptionWorkflowRows = ({
  npcBySlot = {},
  now = Date.now(),
  findItemImageSrcByKeywords,
}) => {
  const baseRows = Object.entries(npcBySlot || {})
    .map(([slotNoRaw, job]) => {
      const slotNo = Number(slotNoRaw);
      const parkedVehicleName = String(job?.vehicleName || '');
      const remainingMs = Math.max(0, Number(job?.stageEndsAt || 0) - now);
      const playerTurnReserved = smallApcPlayerTurnReservationActive(job, now);
      const reservedRemainingMs = Math.max(0, Number(job?.playerDeadlineAt || 0) - now);
      const statusLabel = playerTurnReserved
        ? '하차칸 진입 대기'
        : smallApcLoadingStatusLabelOf(job?.status);
      const isPlayerUnloadComplete = Boolean(
        job?.playerOwned
        && String(job?.status || '') === 'done'
      );
      const parkedVehicleImageSrc = String(job?.parkedVehicleImageSrc || '').trim()
        || (
          parkedVehicleName
            ? (
                findItemImageSrcByKeywords?.([parkedVehicleName])
                || findItemImageSrcByKeywords?.(parkedVehicleName.split(/\s+/).filter(Boolean))
              )
            : ''
        );
      return {
        slotNo,
        loadingSlotNo: Math.max(0, Number(job?.loadingSlotNo) || 0),
        slotLabel: Number(job?.loadingSlotNo) > 0 ? `H${Number(job.loadingSlotNo)}` : String(job?.ticketNo || ''),
        parkedVehicleId: String(job?.playerVehicleId || ''),
        occupied: Boolean(job),
        occupiedByOther: Boolean(job && !job?.playerOwned),
        randomOccupiedByNpc: Boolean(job && job?.npcOnly),
        playerOwned: Boolean(job?.playerOwned),
        parkedVehicleName,
        parkedVehicleImageSrc,
        parkingLabel: job?.status === SMALL_APC_LOADING_ASSIGNMENT_PENDING || job?.status === SMALL_APC_LOADING_WAITING
          ? '소형 APC 일반 주차'
          : '소형 APC 하차',
        npcOnly: Boolean(job?.npcOnly),
        ticketNo: String(job?.ticketNo || ''),
        status: String(job?.status || ''),
        statusLabel,
        statusTone: playerTurnReserved ? 'issued' : smallApcLoadingStatusToneOf(job?.status),
        statusBadge: statusLabel,
        statusHint: playerTurnReserved
          ? `하차칸 H${Math.max(0, Number(job?.loadingSlotNo || 0))} · ${formatRemainingSecondsText(reservedRemainingMs)} 남음`
          : (
              isPlayerUnloadComplete
                ? `하차 완료 · ${formatRemainingSecondsText(remainingMs)} 안에 차량을 빼 주세요`
                : (job?.stageEndsAt > 0
                ? `${statusLabel} · ${formatRemainingSecondsText(remainingMs)} 남음`
                : statusLabel)
            ),
        workflowLabel: statusLabel,
        cargoType: String(job?.cargoType || ''),
        cargoKg: Math.max(0, Number(job?.cargoKg) || 0),
        parkedVehiclePlate: job?.vehiclePlate || null,
        parkedVehiclePlateText: String(job?.vehiclePlateText || ''),
        shipperName: String(job?.shipperName || job?.farmerName || ''),
        shipperGender: String(job?.shipperGender || ''),
        shipperEmoji: String(job?.shipperEmoji || ''),
        farmerName: String(job?.farmerName || ''),
        remainingText: playerTurnReserved
          ? formatRemainingSecondsText(reservedRemainingMs)
          : (job?.stageEndsAt > 0 ? formatRemainingSecondsText(remainingMs) : ''),
        remainingMs,
        playerDeadlineAt: Math.max(0, Number(job?.playerDeadlineAt || 0)),
        playerTurnReserved,
        ticketDisplayText: String(job?.ticketNo || ''),
        occupiedAt: Number(job?.occupiedAt || 0),
        canAssign: Boolean(job && job.status === SMALL_APC_LOADING_ASSIGNMENT_PENDING)
      };
    })
    .sort((a, b) => Number(a?.slotNo || 0) - Number(b?.slotNo || 0));

  const waitingRows = baseRows
    .filter((row) => row?.status === SMALL_APC_LOADING_WAITING)
    .sort((a, b) => {
      const occupiedDiff = Number(a?.occupiedAt || 0) - Number(b?.occupiedAt || 0);
      if (occupiedDiff !== 0) return occupiedDiff;
      return Number(a?.slotNo || 0) - Number(b?.slotNo || 0);
    });

  const waitingOrderBySlot = new Map(
    waitingRows.map((row, index) => [Number(row?.slotNo || 0), index + 1])
  );

  return baseRows.map((row) => {
    const waitingOrder = waitingOrderBySlot.get(Number(row?.slotNo || 0)) || 0;
    return {
      ...row,
      waitingOrder,
      waitingOrderLabel: waitingOrder > 0
        ? (waitingOrder === 1 ? '다음 진입' : `${waitingOrder}순위 대기`)
        : '',
    };
  });
};

export const buildSmallApcLoadingSlotRows = (receptionWorkflowRows = []) => (
  Array.from({ length: SMALL_APC_LOADING_PARKING_SLOT_COUNT }, (_, idx) => {
    const slotNo = idx + 1;
    const job = receptionWorkflowRows.find(
      (row) => Number(row?.loadingSlotNo || 0) === slotNo && smallApcLoadingOccupiesBay(row?.status)
    ) || null;
    return {
      slotNo,
      slotLabel: `H${slotNo}`,
      parkedVehicleId: '',
      occupied: Boolean(job),
      occupiedByOther: Boolean(job),
      randomOccupiedByNpc: Boolean(job),
      parkedVehicleName: String(job?.parkedVehicleName || ''),
      parkedVehicleImageSrc: String(job?.parkedVehicleImageSrc || ''),
      parkingLabel: '소형 APC 하차',
      npcOnly: true,
      ticketNo: String(job?.ticketNo || ''),
      status: String(job?.status || ''),
      statusLabel: String(job?.statusLabel || ''),
      statusTone: String(job?.statusTone || ''),
      statusBadge: String(job?.statusBadge || ''),
      statusHint: String(job?.statusHint || ''),
      workflowLabel: String(job?.workflowLabel || ''),
      cargoType: String(job?.cargoType || ''),
      cargoKg: Math.max(0, Number(job?.cargoKg) || 0),
      parkedVehiclePlate: job?.parkedVehiclePlate || null,
      parkedVehiclePlateText: String(job?.parkedVehiclePlateText || ''),
      shipperName: String(job?.shipperName || job?.farmerName || ''),
      shipperGender: String(job?.shipperGender || ''),
      shipperEmoji: String(job?.shipperEmoji || ''),
      farmerName: String(job?.farmerName || ''),
      remainingText: String(job?.remainingText || ''),
      ticketDisplayText: String(job?.ticketDisplayText || ''),
      canAssign: false
    };
  })
);

export const mergeSmallApcGeneralParkingSlotRows = ({
  destinationKey = '',
  parkingStorageKey = '',
  baseRows = [],
  receptionWorkflowRows = [],
}) => {
  if (String(destinationKey || '') !== 'smallApc') return baseRows;
  if (parkingStorageKey === SMALL_APC_LOADING_PARKING_KEY) return baseRows;
  const queueRows = receptionWorkflowRows.filter((row) => (
    row?.npcOnly
    && (
      row?.status === SMALL_APC_LOADING_ASSIGNMENT_PENDING
      || row?.status === SMALL_APC_LOADING_WAITING
    )
  ));
  if (!queueRows.length) return baseRows;
  const nextRows = [...baseRows];
  let queueIndex = 0;
  for (let idx = 0; idx < nextRows.length && queueIndex < queueRows.length; idx += 1) {
    const row = nextRows[idx];
    if (row?.occupied) continue;
    const job = queueRows[queueIndex];
    nextRows[idx] = {
      ...row,
      occupied: true,
      occupiedByOther: true,
      randomOccupiedByNpc: true,
      npcOnly: true,
      parkedVehicleName: String(job?.parkedVehicleName || ''),
      parkedVehicleImageSrc: String(job?.parkedVehicleImageSrc || ''),
      parkedVehiclePlate: job?.parkedVehiclePlate || null,
      parkedVehiclePlateText: String(job?.parkedVehiclePlateText || ''),
      parkingLabel: '소형 APC 일반 주차',
      status: String(job?.status || ''),
      statusLabel: String(job?.statusLabel || ''),
      statusTone: String(job?.statusTone || ''),
      statusBadge: String(job?.statusBadge || ''),
      statusHint: String(job?.statusHint || ''),
      workflowLabel: String(job?.workflowLabel || '대기중'),
      shipperName: String(job?.shipperName || job?.farmerName || ''),
      shipperGender: String(job?.shipperGender || ''),
      shipperEmoji: String(job?.shipperEmoji || '')
    };
    queueIndex += 1;
  }
  return nextRows;
};
