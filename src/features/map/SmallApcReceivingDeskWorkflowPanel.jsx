import React from 'react';
import { HarvestQualityStampedCrate } from '../harvest/HarvestPendingBoxesPanel';

const SMALL_APC_SUBMODAL_CLOSE_MS = 280;
const SMALL_APC_TICKET_PRINTER_MS = 2600;
const SMALL_APC_TICKET_PRINTER_HOLD_MS = 2000;

function SmallApcVehicleQueueContent({
  vehicleName = '',
  vehiclePlateText = '',
  vehicleImageSrc = '',
  shipperName = '',
  shipperEmoji = '',
  primaryText = '',
  secondaryText = '',
  detailLines = [],
  isPlayerVehicle = false
}) {
  return (
    <div className="small-apc-receiving-queue__content">
      {vehicleImageSrc ? (
        <div className="small-apc-receiving-queue__thumb">
          <img src={vehicleImageSrc} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className="small-apc-receiving-queue__text">
        <div className="small-apc-receiving-queue__title-row">
          <span>{vehicleName || '대기 차량'}</span>
          {isPlayerVehicle ? (
            <small className="small-apc-receiving-queue__player-badge">내 차량</small>
          ) : null}
        </div>
        {vehiclePlateText ? (
          <small className="small-apc-receiving-queue__plate">번호판 {vehiclePlateText}</small>
        ) : null}
        {shipperName ? (
          <b>{shipperEmoji || '🧑‍🌾'} 출하 {shipperName}</b>
        ) : null}
        <em>{primaryText}{secondaryText ? ` · ${secondaryText}` : ''}</em>
        {Array.isArray(detailLines) && detailLines.length ? (
          <div className="small-apc-receiving-queue__detail">
            {detailLines.map((line, index) => (
              <span key={`detail-${index}`}>{line}</span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SmallApcPlayerVehicleSelectModal({
  open = false,
  closing = false,
  candidateRows = [],
  selectedVehicleId = '',
  vehicleDetailById = {},
  onSelect,
  onConfirm,
  onClose
}) {
  const selectedRow = React.useMemo(
    () => candidateRows.find((row) => String(row?.parkedVehicleId || '') === String(selectedVehicleId || '')) || null,
    [candidateRows, selectedVehicleId]
  );

  const selectedDetail = selectedRow
    ? (vehicleDetailById?.[String(selectedRow?.parkedVehicleId || '')] || null)
    : null;
  const hasStemAttachedHarvest = Array.isArray(selectedDetail?.harvestRows)
    && selectedDetail.harvestRows.some((row) => row?.stemRemoved === false);
  const confirmDisabled = !selectedRow;
  const confirmTitle = confirmDisabled ? '접수할 차량을 먼저 선택해 주세요.' : '';

  if (!open) return null;
  return (
    <>
      <div className={`confirm-modal-backdrop ${closing ? 'is-closing' : ''}`.trim()} onClick={onClose} />
      <div
        className={`confirm-modal confirm-modal--small-apc-receiving small-apc-receiving-modal small-apc-receiving-modal--picker confirm-modal--small-apc-player-select ${closing ? 'is-closing' : ''}`.trim()}
      >
        <div className="panel__header small-apc-panel__header">
          <div>
            <div className="panel__eyebrow">소형 APC</div>
            <h2>접수 차량 선택</h2>
          </div>
        </div>

        <div className="small-apc-player-select__body">
          {!selectedRow ? (
            <section className="panel-card small-apc-receiving-card">
              <div className="small-apc-receiving-card__head">
                <strong>일반 주차장 내 화물차</strong>
                <span>{candidateRows.length}대</span>
              </div>
              <div className="small-apc-receiving-queue">
                {candidateRows.length ? (
                  candidateRows.map((row) => (
                    <div
                      key={`small-apc-player-select-${row.slotNo}`}
                      className="small-apc-receiving-queue__item is-waiting small-apc-player-select__candidate-item"
                    >
                      <strong>{row.slotLabel}</strong>
                      <button
                        type="button"
                        className="small-apc-player-select__candidate-main"
                        onClick={() => onSelect?.(row)}
                      >
                        <SmallApcVehicleQueueContent
                          vehicleName={row.parkedVehicleName}
                          vehiclePlateText={row.parkedVehiclePlateText}
                          vehicleImageSrc={row.parkedVehicleImageSrc}
                          primaryText="선택 가능"
                          secondaryText={row.parkingLabel || '일반 주차장'}
                        />
                      </button>
                      <button
                        type="button"
                        className="button button--primary warehouse-storage-footer-button small-apc-player-select__candidate-action"
                        onClick={() => onSelect?.(row)}
                      >
                        선택하기
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="small-apc-receiving-empty">일반 주차장에 세워 둔 내 화물차가 없습니다.</div>
                )}
              </div>
            </section>
          ) : (
            <section className="panel-card small-apc-receiving-card">
              <div className="small-apc-receiving-card__head">
                <strong>선택 차량 상세</strong>
                <span>{selectedRow.parkedVehicleName || '내 화물차'}</span>
              </div>

              <div className="small-apc-receiving-summary-grid">
                <div className="summary-chip small-apc-receiving-summary-chip">
                  <span>수확물 묶음</span>
                  <strong>{Math.max(0, Number(selectedDetail?.harvestRows?.length) || 0)}건</strong>
                </div>
                <div className="summary-chip small-apc-receiving-summary-chip">
                  <span>기타 적재품</span>
                  <strong>{Math.max(0, Number(selectedDetail?.cargoItemRows?.length) || 0)}종</strong>
                </div>
                <div className="summary-chip small-apc-receiving-summary-chip">
                  <span>총 적재중량</span>
                  <strong>{Math.max(0, Number(selectedDetail?.totalLoadKg) || 0).toFixed(1)}kg</strong>
                </div>
              </div>

              {hasStemAttachedHarvest ? (
                <div className="small-apc-receiving-result">
                  <strong>꼭지 미제거 물량 안내</strong>
                  <span>미제거 물량은 먼저 꼭지 제거 작업 후 선별되며, 추가 작업 시간과 비용이 최종 정산에 반영됩니다.</span>
                </div>
              ) : null}

              <div className="small-apc-receiving-queue">
                {Array.isArray(selectedDetail?.harvestRows) && selectedDetail.harvestRows.length ? (
                  selectedDetail.harvestRows.map((row) => (
                    <div
                      key={`small-apc-harvest-detail-${row.rowKey}`}
                      className="small-apc-receiving-queue__item is-done"
                    >
                      <strong>{row.cropLabel}</strong>
                      <div className="small-apc-receiving-queue__content small-apc-receiving-queue__content--harvest-detail">
                        <div className="small-apc-receiving-queue__text">
                          <div className="small-apc-receiving-queue__title-row">
                            <span>{`${row.qualityLabel} / ${row.gradeLabel}`}</span>
                          </div>
                          <em>{`${row.sizeLabel} · ${row.boxCount}상자 · ${row.totalKg.toFixed(1)}kg`}</em>
                          {Array.isArray(row.detailLines) && row.detailLines.length ? (
                            <div className="small-apc-receiving-queue__detail">
                              {row.detailLines.map((line, index) => (
                                <span key={`detail-${row.rowKey}-${index}`}>{line}</span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        {/appleContainer/i.test(String(row.loadBoxKey || '')) ? (
                          <div className="small-apc-receiving-queue__thumb small-apc-receiving-queue__thumb--harvest-detail">
                            <HarvestQualityStampedCrate
                              tone={/green/i.test(String(row.loadBoxKey || '')) ? 'green' : 'yellow'}
                              fillRatio={1}
                              life={row?.life}
                              qualityLabel={row.qualityLabel || '보통'}
                              gradeLabel={row.gradeLabel || '미선별'}
                              sizeLabel={row.sizeLabel || '미측정'}
                              className="small-apc-receiving-queue__crate"
                            />
                            {row.stemRemoved ? (
                              <div className="small-apc-harvest-stem-stamp" aria-hidden="true">
                                <span className="small-apc-harvest-stem-stamp__ring" />
                                <span className="small-apc-harvest-stem-stamp__label">꼭지 제거</span>
                              </div>
                            ) : null}
                          </div>
                        ) : row.loadBoxImageSrc ? (
                          <div className="small-apc-receiving-queue__thumb small-apc-receiving-queue__thumb--harvest-detail">
                            <img src={row.loadBoxImageSrc} alt="" loading="lazy" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="small-apc-receiving-empty">이 차량에는 수확물 배치가 없습니다.</div>
                )}
              </div>

              {Array.isArray(selectedDetail?.cargoItemRows) && selectedDetail.cargoItemRows.length ? (
                <div className="small-apc-receiving-queue" style={{ marginTop: 12 }}>
                  {selectedDetail.cargoItemRows.map((row) => (
                    <div
                      key={`small-apc-cargo-detail-${row.itemKey}`}
                      className="small-apc-receiving-queue__item is-waiting"
                    >
                      <strong>{row.itemLabel}</strong>
                      <SmallApcVehicleQueueContent
                        vehicleName={`${row.qty.toLocaleString()}${row.unit}`}
                        primaryText="기타 적재품"
                        secondaryText={`${row.totalWeightKg.toFixed(1)}kg`}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          )}
        </div>

        <div className="footer-actions small-apc-player-select__footer">
          {selectedRow ? (
            <button
              className="button button--ghost warehouse-storage-footer-button"
              onClick={() => onSelect?.({ parkedVehicleId: '' })}
            >
              이전
            </button>
          ) : null}
          {selectedRow ? (
            <button
              type="button"
              className="button button--primary warehouse-storage-footer-button"
              disabled={confirmDisabled}
              title={confirmTitle}
              onClick={() => onConfirm?.(selectedRow)}
            >
              등록하기
            </button>
          ) : null}
          <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>닫기</button>
        </div>
      </div>
    </>
  );
}

function SmallApcTicketPrinterModal({
  open = false,
  closing = false,
  ticketNo = 'A-001',
  waitingCount = 0,
  currentTicketNo = 'A-000',
  vehicleName = '',
  vehiclePlateText = '',
  issuedAtText = '',
  onClose
}) {
  if (!open) return null;
  const ticketNumberText = String(ticketNo || 'A-001').replace(/^A-/i, '') || '001';
  const currentNumberText = String(currentTicketNo || 'A-000').replace(/^A-/i, '') || '000';
  const animationStyle = {
    '--small-apc-ticket-print-cycle': `${SMALL_APC_TICKET_PRINTER_MS}ms`,
    '--small-apc-ticket-visible-cycle': `${SMALL_APC_TICKET_PRINTER_MS + SMALL_APC_TICKET_PRINTER_HOLD_MS}ms`,
  };
  return (
    <>
      <div className={`confirm-modal-backdrop ${closing ? 'is-closing' : ''}`.trim()} onClick={onClose} />
      <div
        className={`confirm-modal confirm-modal--small-apc-ticket-printer ${closing ? 'is-closing' : ''}`.trim()}
        style={animationStyle}
      >
        <div className="small-apc-ticket-printer">
          <div className="small-apc-ticket-printer__machine">
            <div className="small-apc-ticket-printer__machine-body" />
            <div className="small-apc-ticket-printer__brand">
              <span className="small-apc-ticket-printer__led" />
              <span>SMART QUEUE</span>
            </div>
            <div className="small-apc-ticket-printer__display">
              <span className="small-apc-ticket-printer__display-label">대기 인원</span>
              <strong>{Math.max(0, Number(waitingCount) || 0)}</strong>
              <em>명</em>
            </div>
            <div className="small-apc-ticket-printer__instruction">번호표를 발급합니다</div>
            <div className="small-apc-ticket-printer__slot" />
            <div className="small-apc-ticket-printer__ticket-motion">
              <div className="small-apc-ticket-printer__ticket-paper">
                <div className="small-apc-ticket-printer__ticket-title">WAITING TICKET</div>
                <div className="small-apc-ticket-printer__ticket-number">{ticketNumberText}</div>
                <div className="small-apc-ticket-printer__ticket-line" />
                <div className="small-apc-ticket-printer__ticket-current">현재 호출 번호 <strong>{currentNumberText}</strong></div>
                <div className="small-apc-ticket-printer__ticket-vehicle">
                  {vehicleName || '접수 차량'}
                  {vehiclePlateText ? ` · ${vehiclePlateText}` : ''}
                </div>
                <div className="small-apc-ticket-printer__ticket-notice">순번 문자알림</div>
                <div className="small-apc-ticket-printer__barcode" />
                <div className="small-apc-ticket-printer__ticket-date">{issuedAtText || '2026.06.25 14:32'}</div>
              </div>
            </div>
            <div className="small-apc-ticket-printer__upper-mask" />
            <div className="small-apc-ticket-printer__top-ridge" />
            <div className="small-apc-ticket-printer__push-button">
              <span className="small-apc-ticket-printer__button-face">발권</span>
              <span className="small-apc-ticket-printer__push-label">PUSH</span>
            </div>
            <div className="small-apc-ticket-printer__vent" />
            <i className="small-apc-ticket-printer__screw small-apc-ticket-printer__screw--1" />
            <i className="small-apc-ticket-printer__screw small-apc-ticket-printer__screw--2" />
            <i className="small-apc-ticket-printer__screw small-apc-ticket-printer__screw--3" />
            <i className="small-apc-ticket-printer__screw small-apc-ticket-printer__screw--4" />
          </div>
        </div>
      </div>
    </>
  );
}

export default function SmallApcReceivingDeskWorkflowPanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  closing = false,
  receptionWorkflowRows = [],
  loadingSlotRows = [],
  staffingProfile = null,
  generalParkingSlotRows = [],
  playerVehicleDetailById = {},
  onAssignLoadingSlot,
  operationProfile = null,
  onBack,
  onClose
}) {
  const [playerVehicleModalOpen, setPlayerVehicleModalOpen] = React.useState(false);
  const [playerVehicleModalClosing, setPlayerVehicleModalClosing] = React.useState(false);
  const [selectedPlayerVehicleId, setSelectedPlayerVehicleId] = React.useState('');
  const playerVehicleModalCloseTimerRef = React.useRef(null);
  const [ticketPrinterModalOpen, setTicketPrinterModalOpen] = React.useState(false);
  const [ticketPrinterModalClosing, setTicketPrinterModalClosing] = React.useState(false);
  const [ticketPrinterPreview, setTicketPrinterPreview] = React.useState(null);
  const ticketPrinterModalCloseTimerRef = React.useRef(null);
  const ticketPrinterCompleteTimerRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (playerVehicleModalCloseTimerRef.current) {
        clearTimeout(playerVehicleModalCloseTimerRef.current);
        playerVehicleModalCloseTimerRef.current = null;
      }
      if (ticketPrinterModalCloseTimerRef.current) {
        clearTimeout(ticketPrinterModalCloseTimerRef.current);
        ticketPrinterModalCloseTimerRef.current = null;
      }
      if (ticketPrinterCompleteTimerRef.current) {
        clearTimeout(ticketPrinterCompleteTimerRef.current);
        ticketPrinterCompleteTimerRef.current = null;
      }
    };
  }, []);

  const occupiedRows = React.useMemo(
    () => (Array.isArray(receptionWorkflowRows) ? receptionWorkflowRows : []).filter((row) => row?.occupied),
    [receptionWorkflowRows]
  );
  const assignPendingRows = React.useMemo(
    () => occupiedRows.filter((row) => row?.canAssign),
    [occupiedRows]
  );
  const activeRows = React.useMemo(
    () => occupiedRows.filter((row) => row?.status && row?.status !== 'assignmentPending'),
    [occupiedRows]
  );
  const waitingRows = React.useMemo(
    () => activeRows
      .filter((row) => row?.status === 'waiting')
      .sort((a, b) => Number(a?.waitingOrder || 0) - Number(b?.waitingOrder || 0)),
    [activeRows]
  );
  const bayRows = React.useMemo(
    () => (Array.isArray(loadingSlotRows) ? loadingSlotRows : []),
    [loadingSlotRows]
  );
  const loadingStaffMembers = React.useMemo(
    () => (Array.isArray(staffingProfile?.facilityByEntryKey?.receiving?.assignedMembers)
      ? staffingProfile.facilityByEntryKey.receiving.assignedMembers.filter(
        (member) => String(member?.statusKey || member?.status || '').trim() === 'working'
      )
      : []),
    [staffingProfile]
  );
  const nightReceptionClosed = Boolean(
    operationProfile?.isNight && !operationProfile?.nightReceptionOpen
  );
  const nightReceptionReason = nightReceptionClosed
    ? (
        operationProfile?.isNightOperationSeason
          ? '야간에는 APC가 바쁠 때만 접수합니다. 현재는 혼잡도가 낮아 접수를 쉬고 있습니다.'
          : '현재 달은 야간 운영 기간이 아닙니다. 소형 APC 접수는 주간에만 가능합니다.'
      )
    : '';
  const registeredPlayerVehicleIdSet = React.useMemo(
    () => new Set(
      occupiedRows
        .map((row) => String(row?.parkedVehicleId || '').trim())
        .filter(Boolean)
    ),
    [occupiedRows]
  );
  const playerCargoTruckRows = React.useMemo(
    () => (Array.isArray(generalParkingSlotRows) ? generalParkingSlotRows : [])
      .filter((row) => String(row?.parkedVehicleId || ''))
      .filter((row) => !registeredPlayerVehicleIdSet.has(String(row?.parkedVehicleId || '').trim()))
      .filter((row) => {
        const machineType = String(row?.parkedVehicleMachineType || '').toLowerCase();
        return machineType === 'transport' || machineType === 'harvestcarrier';
      }),
    [generalParkingSlotRows, registeredPlayerVehicleIdSet]
  );
  const selectedPlayerVehicleRow = React.useMemo(
    () => playerCargoTruckRows.find((row) => String(row?.parkedVehicleId || '') === String(selectedPlayerVehicleId || '')) || null,
    [playerCargoTruckRows, selectedPlayerVehicleId]
  );
  const nextWaitingRow = React.useMemo(
    () => waitingRows[0] || null,
    [waitingRows]
  );
  const queueRows = React.useMemo(
    () => ([
      ...assignPendingRows.map((row) => ({
        ...row,
        queueStateLabel: '접수 대기',
        queueStateHint: '번호표 발급 전'
      })),
      ...waitingRows.map((row) => ({
        ...row,
        queueStateLabel: row?.playerTurnReserved ? '하차칸 진입 대기' : '입고 대기',
        queueStateHint: row?.playerTurnReserved
          ? `하차칸 H${Math.max(0, Number(row?.loadingSlotNo || 0))} · ${row.remainingText || '진입 준비'}`
          : `${row.waitingOrderLabel || '대기 중'}${row.ticketDisplayText ? ` · ${row.ticketDisplayText}` : ''}`
      }))
    ]),
    [assignPendingRows, waitingRows]
  );
  const nextTicketNoPreview = React.useMemo(() => {
    const maxSeq = (Array.isArray(queueRows) ? queueRows : []).reduce((max, row) => {
      const match = String(row?.ticketDisplayText || row?.ticketNo || '').match(/A-(\d+)/i);
      const seq = match ? Number(match[1]) || 0 : 0;
      return Math.max(max, seq);
    }, 0);
    return `A-${String(maxSeq + 1).padStart(3, '0')}`;
  }, [queueRows]);
  const currentTicketNoPreview = React.useMemo(
    () => String(nextWaitingRow?.ticketDisplayText || 'A-000'),
    [nextWaitingRow]
  );

  const handleAssignLoadingSlot = () => {
    if (!playerCargoTruckRows.length) return;
    if (playerVehicleModalCloseTimerRef.current) {
      clearTimeout(playerVehicleModalCloseTimerRef.current);
      playerVehicleModalCloseTimerRef.current = null;
    }
    setPlayerVehicleModalClosing(false);
    setPlayerVehicleModalOpen(true);
  };

  const requestClosePlayerVehicleModal = React.useCallback(() => {
    if (!playerVehicleModalOpen || playerVehicleModalClosing) return;
    setPlayerVehicleModalClosing(true);
    if (playerVehicleModalCloseTimerRef.current) {
      clearTimeout(playerVehicleModalCloseTimerRef.current);
    }
    playerVehicleModalCloseTimerRef.current = setTimeout(() => {
      setPlayerVehicleModalOpen(false);
      setPlayerVehicleModalClosing(false);
      setSelectedPlayerVehicleId('');
      playerVehicleModalCloseTimerRef.current = null;
    }, SMALL_APC_SUBMODAL_CLOSE_MS);
  }, [playerVehicleModalClosing, playerVehicleModalOpen]);
  const requestCloseTicketPrinterModal = React.useCallback(() => {
    if (ticketPrinterModalClosing) return;
    setTicketPrinterModalClosing(true);
    if (ticketPrinterModalCloseTimerRef.current) {
      clearTimeout(ticketPrinterModalCloseTimerRef.current);
    }
    ticketPrinterModalCloseTimerRef.current = setTimeout(() => {
      setTicketPrinterModalOpen(false);
      setTicketPrinterModalClosing(false);
      setTicketPrinterPreview(null);
      ticketPrinterModalCloseTimerRef.current = null;
    }, SMALL_APC_SUBMODAL_CLOSE_MS);
  }, [ticketPrinterModalClosing]);

  const assignButtonDisabled = nightReceptionClosed || !playerCargoTruckRows.length;
  const assignButtonTitle = nightReceptionClosed
    ? nightReceptionReason
    : (
        !playerCargoTruckRows.length
          ? '일반 주차장에 세워 둔 내 화물차가 없어 접수할 수 없습니다.'
          : ''
      );
  const isPlayerVehicleModalVisible = playerVehicleModalOpen || playerVehicleModalClosing;
  const isTicketPrinterModalVisible = ticketPrinterModalOpen || ticketPrinterModalClosing;
  const shouldMuteDesk = (isPlayerVehicleModalVisible || isTicketPrinterModalVisible) && !closing;

  return (
    <>
      <div
        className={`${className} small-apc-receiving-modal small-apc-receiving-modal--desk ${shouldMuteDesk ? 'is-submodal-muted' : ''}`.trim()}
      >
        <div className="panel__header small-apc-panel__header">
          <div>
            <div className="panel__eyebrow">소형 APC</div>
            <h2>출하접수대</h2>
          </div>
        </div>
        <div className="small-apc-receiving-layout">
          <section className="panel-card small-apc-receiving-card small-apc-receiving-card--single-panel">
            <div className="small-apc-receiving-overview-top">
              <div className="small-apc-receiving-card__head">
                <strong>접수 현황</strong>
              </div>
              <div className="small-apc-receiving-overview-stage">
                <div className="small-apc-receiving-staff-strip">
                  <div className="small-apc-receiving-staff-panel__head">
                    <strong>직원투입 현황</strong>
                    <span>{`${loadingStaffMembers.length}명`}</span>
                  </div>
                  {loadingStaffMembers.length ? (
                    <div className="small-apc-receiving-staff-panel__list">
                      {loadingStaffMembers.map((member, index) => (
                        <div
                          key={`small-apc-loading-staff-top-${member.name}-${index + 1}`}
                          className="small-apc-receiving-staff-panel__card"
                        >
                          <div className="small-apc-receiving-staff-panel__item">
                            <span className="small-apc-receiving-staff-panel__emoji" aria-hidden="true">🧑‍🔧</span>
                            <span className="small-apc-receiving-staff-panel__text">
                              {`${String(member?.name || '직원')} · ${String(member?.statusLabel || '근무중')}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="small-apc-receiving-staff-panel__empty">배치된 직원 없음</div>
                  )}
                </div>
              </div>
            </div>

            <div className="small-apc-receiving-card__head">
              <strong>입고 등록</strong>
              <span>내 차량 접수 시작</span>
            </div>
            <div className="small-apc-receiving-station">
              <div className="small-apc-receiving-station__copy">
                <strong>접수 차량 선택</strong>
                <p>{nightReceptionClosed
                  ? nightReceptionReason
                  : '일반 주차장에 세워 둔 내 화물차를 골라 적재 수확물과 품질 상태를 먼저 확인합니다.'}</p>
              </div>
              <button
                type="button"
                className="button button--primary day-transition-animate-button"
                disabled={assignButtonDisabled}
                title={assignButtonTitle}
                onClick={handleAssignLoadingSlot}
              >
                접수하기
              </button>
            </div>

            <div className="small-apc-receiving-queue">
              {bayRows.length ? (
                bayRows.map((row) => (
                  <div
                    key={`small-apc-workflow-${row.slotLabel}`}
                    className={`small-apc-receiving-queue__item is-${String(row?.statusTone || 'pending')}`.trim()}
                  >
                    <strong>{row.slotLabel}</strong>
                    <SmallApcVehicleQueueContent
                      vehicleName={row.parkedVehicleName || '비어 있음'}
                      vehiclePlateText={row.parkedVehiclePlateText}
                      vehicleImageSrc={row.parkedVehicleImageSrc}
                      shipperName={row.shipperName || row.farmerName}
                      shipperEmoji={row.shipperEmoji}
                      isPlayerVehicle={Boolean(row?.playerOwned)}
                      primaryText={row.statusHint || row.workflowLabel || '하차칸 비어 있음'}
                      secondaryText={row.cargoType || ''}
                    />
                  </div>
                ))
              ) : (
                <div className="small-apc-receiving-empty">현재 하차칸 정보가 없습니다.</div>
              )}
            </div>

            {selectedPlayerVehicleRow ? (
              <div className="small-apc-receiving-result">
                <strong>선택 차량</strong>
                <span>
                  {selectedPlayerVehicleRow.parkedVehicleName || '내 화물차'}
                  {selectedPlayerVehicleRow?.parkedVehiclePlateText ? ` · ${selectedPlayerVehicleRow.parkedVehiclePlateText}` : ''}
                  {` / ${selectedPlayerVehicleRow.slotLabel}`}
                </span>
              </div>
            ) : null}

            {nextWaitingRow ? (
              <div className="small-apc-receiving-result">
                <strong>다음 하차칸 진입</strong>
                <span>
                  {nextWaitingRow.parkedVehicleName || '대기 차량'}
                  {nextWaitingRow?.parkedVehiclePlateText ? ` · ${nextWaitingRow.parkedVehiclePlateText}` : ''}
                  {nextWaitingRow.ticketDisplayText ? ` / ${nextWaitingRow.ticketDisplayText}` : ''}
                </span>
              </div>
            ) : null}

            <div className="small-apc-receiving-queue">
              {queueRows.length ? (
                queueRows.map((row, index) => (
                  <div
                    key={`small-apc-register-${row.slotNo}-${row.ticketDisplayText || index}`}
                    className={`small-apc-receiving-queue__item is-${String(row?.statusTone || 'pending')}`.trim()}
                  >
                    <strong>{row.ticketDisplayText || `P${Number(row?.slotNo || 0)}`}</strong>
                    <SmallApcVehicleQueueContent
                      vehicleName={row.parkedVehicleName}
                      vehiclePlateText={row.parkedVehiclePlateText}
                      vehicleImageSrc={row.parkedVehicleImageSrc}
                      shipperName={row.shipperName || row.farmerName}
                      shipperEmoji={row.shipperEmoji}
                      isPlayerVehicle={Boolean(row?.playerOwned)}
                      primaryText={row.queueStateLabel}
                      secondaryText={row.queueStateHint}
                    />
                  </div>
                ))
              ) : (
                <div className="small-apc-receiving-empty">현재 접수 대기 차량과 입고 대기 차량이 없습니다.</div>
              )}
            </div>
          </section>
        </div>

        <div className="footer-actions">
          <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
          <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
        </div>
      </div>

      <SmallApcPlayerVehicleSelectModal
        open={isPlayerVehicleModalVisible}
        closing={closing || playerVehicleModalClosing}
        candidateRows={playerCargoTruckRows}
        selectedVehicleId={selectedPlayerVehicleId}
        vehicleDetailById={playerVehicleDetailById}
        onSelect={(row) => {
          const vehicleId = String(row?.parkedVehicleId || '');
          setSelectedPlayerVehicleId(vehicleId);
        }}
        onConfirm={(row) => {
          const vehicleId = String(row?.parkedVehicleId || '');
          if (!vehicleId) return;
          const selectedDetail = playerVehicleDetailById?.[vehicleId] || null;
          setTicketPrinterPreview({
            ticketNo: nextTicketNoPreview,
            currentTicketNo: currentTicketNoPreview,
            waitingCount: waitingRows.length + 1,
            vehicleName: String(row?.parkedVehicleName || '내 화물차'),
            vehiclePlateText: String(row?.parkedVehiclePlateText || ''),
            issuedAtText: new Intl.DateTimeFormat('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }).format(new Date()).replace(/\.\s/g, '.').replace(/\.$/, ''),
          });
          setPlayerVehicleModalOpen(false);
          setPlayerVehicleModalClosing(false);
          setTicketPrinterModalClosing(false);
          setTicketPrinterModalOpen(true);
          if (ticketPrinterCompleteTimerRef.current) {
            clearTimeout(ticketPrinterCompleteTimerRef.current);
          }
          ticketPrinterCompleteTimerRef.current = setTimeout(() => {
            onAssignLoadingSlot?.(row, selectedDetail);
            ticketPrinterCompleteTimerRef.current = null;
            requestCloseTicketPrinterModal();
          }, SMALL_APC_TICKET_PRINTER_MS + SMALL_APC_TICKET_PRINTER_HOLD_MS);
        }}
        onClose={requestClosePlayerVehicleModal}
      />
      <SmallApcTicketPrinterModal
        open={isTicketPrinterModalVisible}
        closing={closing || ticketPrinterModalClosing}
        ticketNo={ticketPrinterPreview?.ticketNo || nextTicketNoPreview}
        currentTicketNo={ticketPrinterPreview?.currentTicketNo || currentTicketNoPreview}
        waitingCount={ticketPrinterPreview?.waitingCount || 0}
        vehicleName={ticketPrinterPreview?.vehicleName || ''}
        vehiclePlateText={ticketPrinterPreview?.vehiclePlateText || ''}
        issuedAtText={ticketPrinterPreview?.issuedAtText || ''}
        onClose={requestCloseTicketPrinterModal}
      />
    </>
  );
}
