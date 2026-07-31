import React from 'react';
import { harvestPalletDisplayBoxIndexOf } from './harvestPalletGrid';
import HarvestPendingBoxesPanel from './HarvestPendingBoxesPanel';
import WarehouseSharedHarvestSlotCard from '../storage/WarehouseSharedHarvestSlotCard';

export default function HarvestTransportModal({
  isOpen,
  isClosing = false,
  onClose,
  onConfirm,
  pendingLoadBoxSummary,
  pendingKg,
  selectedPendingKg = 0,
  pendingLoadImageSrc,
  pendingLoadImageItemKey,
  selectedPendingCardIds = [],
  onTogglePendingCard,
  plannedMoveKg = 0,
  laborNeed = 0,
  laborNeedText = '',
  transportLaborPerBox = 0,
  harvestBoxCapacityKg = 20,
  workEfficiencyRatio = 1,
  transportMachineName,
  equipmentRows,
  selectedEquipmentKey,
  onSelectEquipment,
  useSelfLabor,
  onToggleSelfLabor,
  selfLaborAvailable = 0,
  selectedLaborCap = 0,
  workerTypeKeys = ['worker', 'skilledWorker'],
  availableWorkerMix,
  selectedWorkerMix,
  workerRosterByType,
  selectedWorkerIdsByType,
  onToggleWorker,
  transportAssignmentByEquipmentKey,
  onAssignWorkerToEquipment,
  crewIconOf,
  destinationRows,
  selectedDestinationKey,
  onSelectDestination,
  selectedDestination,
  requiredPalletSlotCount = 0,
  selectedDestinationPalletSlotCount = 0,
  selectedDestinationPalletSlots = [],
  destinationHarvestRows = [],
  selectedDestinationPalletSlotNos = [],
  onToggleDestinationPalletSlot,
  blockedReason,
  palletImageSrc = '',
  harvestPalletBoxFilledAt = null,
  harvestPalletBoxToneAt = null,
}) {
  if (!isOpen) return null;
  const MANUAL_TRANSPORT_EQUIPMENT_KEY = 'manual:carry';

  const WORKER_TYPE_KEYS = Array.isArray(workerTypeKeys) && workerTypeKeys.length
    ? workerTypeKeys
    : ['worker', 'skilledWorker'];
  const WORKER_DRAG_MIME = 'application/x-harvest-transport-worker';
  const WORKER_TYPE_LABELS = {
    beginner: '초보노동',
    worker: '일반노동',
    skilledWorker: '숙련노동'
  };
  const HARVEST_BOXES_PER_PALLET = 36;
  const [draggingWorkerPayload, setDraggingWorkerPayload] = React.useState(null);
  const [visibleLayerBySlot, setVisibleLayerBySlot] = React.useState({});
  const [dropEquipmentKey, setDropEquipmentKey] = React.useState('');
  const selectedExternalHeadcount = WORKER_TYPE_KEYS.reduce(
    (acc, key) => acc + Math.max(0, Number(selectedWorkerMix?.[key] || 0)),
    0
  );
  const isTransportLaborUnassigned = Math.max(0, Number(selectedLaborCap) || 0) <= 0;
  const requiresDestinationSlotSelection = Boolean(selectedDestination?.supportsPalletSlots)
    && Math.max(0, Number(selectedDestinationPalletSlotCount) || 0) > 0;
  const isDestinationSlotUnselected = requiresDestinationSlotSelection
    && (selectedDestinationPalletSlotNos || []).length <= 0;
  const confirmBlockedReason = blockedReason
    || (isDestinationSlotUnselected ? '적재할 적재칸을 먼저 선택해 주세요.' : '')
    || (isTransportLaborUnassigned ? '운반 인력을 선택해 주세요.' : '');
  const isDestinationUnselected = !String(selectedDestinationKey || '');
  const confirmDisabled = isDestinationUnselected || Boolean(confirmBlockedReason);
  const confirmButtonTitle = isDestinationUnselected
    ? '적재할 곳을 먼저 선택해 주세요.'
    : confirmBlockedReason;
  const confirmButtonHoverTitle = confirmDisabled
    ? (confirmButtonTitle || '지금은 운반을 실행할 수 없습니다.')
    : '';
  const selectedEquipmentRow = (equipmentRows || []).find(
    (row) => String(row?.key || '') === String(selectedEquipmentKey || '')
  ) || null;
  const transportFormulaText = React.useMemo(() => {
    const selectedKg = Math.max(0, Number(selectedPendingKg) || 0);
    const moveKg = Math.max(0, Number(plannedMoveKg) || 0);
    const boxCapacityKg = Math.max(1, Number(harvestBoxCapacityKg) || 20);
    const laborPerBox = Math.max(0.01, Number(transportLaborPerBox) || 0);
    const safeWorkEfficiencyRatio = Math.max(0.01, Number(workEfficiencyRatio) || 1);
    const movedBoxCount = Math.ceil(moveKg / boxCapacityKg);
    const baseLaborNeed = movedBoxCount * laborPerBox;
    const workEfficiencyPercent = safeWorkEfficiencyRatio * 100;
    const finalLaborNeedText = laborNeedText || Number(laborNeed || 0).toLocaleString();
    const lines = [
      '운반 노동력 안내',
      '',
      '[요약]',
      `선택 수확물: ${selectedKg.toLocaleString()}kg`,
      `이번에 실제로 옮기는 양: ${moveKg.toLocaleString()}kg`,
      `필요 노동력: ${finalLaborNeedText}`,
      '',
      '[왜 운반량이 줄었나요?]',
      moveKg < selectedKg
        ? `선택한 수확물 전체(${selectedKg.toLocaleString()}kg)를 한 번에 못 옮겨서, 이번에는 ${moveKg.toLocaleString()}kg까지만 운반합니다.`
        : '선택한 수확물을 이번에 전부 운반할 수 있습니다.',
      '운반량은 목적지 여유, 적재, 선택한 인원 노동력 한도까지 반영됩니다.',
      '',
      '[계산 기준]',
      `기준 장비: ${transportMachineName || '미선택'}`,
      `1박스 무게: ${boxCapacityKg.toLocaleString()}kg`,
      `운반 박스 수: ${movedBoxCount.toLocaleString()}박스`,
      `맨박스당 필요 노동력: ${laborPerBox.toLocaleString()}`,
      `기본 노동력: ${movedBoxCount.toLocaleString()} x ${laborPerBox.toLocaleString()} = ${baseLaborNeed.toLocaleString()}`,
      `현재 작업효율: ${workEfficiencyPercent.toFixed(1)}%`,
      `최종 필요 노동력: ${baseLaborNeed.toLocaleString()} / ${safeWorkEfficiencyRatio.toFixed(3)} = ${finalLaborNeedText}`
    ];
    return lines.join('\n');
  }, [selectedPendingKg, plannedMoveKg, harvestBoxCapacityKg, transportLaborPerBox, workEfficiencyRatio, transportMachineName, laborNeedText, laborNeed]);
  const parseWorkerDragPayload = React.useCallback((rawValue) => {
    if (!rawValue) return null;
    try {
      const parsed = JSON.parse(String(rawValue || ''));
      if (parsed?.kind === 'self') return { kind: 'self' };
      if (parsed?.kind === 'worker' && parsed?.typeKey && parsed?.workerId) {
        return {
          kind: 'worker',
          typeKey: String(parsed.typeKey || ''),
          workerId: String(parsed.workerId || '')
        };
      }
    } catch {
      return null;
    }
    return null;
  }, []);

  const readWorkerDragPayload = React.useCallback((dataTransfer) => {
    const directPayload = parseWorkerDragPayload(dataTransfer?.getData?.(WORKER_DRAG_MIME));
    if (directPayload) return directPayload;
    return parseWorkerDragPayload(dataTransfer?.getData?.('text/plain'));
  }, [parseWorkerDragPayload]);

  const assignedWorkerIconRowsOfEquipment = React.useCallback((equipmentKey) => {
    const assignment = transportAssignmentByEquipmentKey?.[String(equipmentKey || '')] || null;
    if (!assignment) return [];
    return [
      ...(assignment.useSelfLabor ? [{ key: 'self', icon: '🧑‍🌾', label: '자가' }] : []),
      ...WORKER_TYPE_KEYS.flatMap((typeKey) => {
        const list = workerRosterByType?.[typeKey] || [];
        const selectedIds = new Set(assignment.selectedWorkerIdsByType?.[typeKey] || []);
        return list
          .filter((worker) => selectedIds.has(String(worker?.id || '')))
          .map((worker, index) => ({
            key: `${typeKey}:${String(worker?.id || index)}`,
            icon: crewIconOf ? crewIconOf(typeKey, worker?.gender) : '👷',
            label: worker?.name || '외부인력'
          }));
      })
    ];
  }, [WORKER_TYPE_KEYS, crewIconOf, transportAssignmentByEquipmentKey, workerRosterByType]);
  const workerAssignmentStatusMap = React.useMemo(() => {
    const equipmentMetaByKey = new Map(
      (equipmentRows || []).map((row) => [String(row?.key || ''), {
        isLockedToday: Boolean(row?.isLockedToday),
        lockedTransportAssignment: row?.lockedTransportAssignment || null,
      }])
    );
    const equipmentLabelByKey = new Map(
      (equipmentRows || []).map((row) => [String(row?.key || ''), String(row?.label || '운반 장비')])
    );
    const nextMap = {};
    Object.entries(transportAssignmentByEquipmentKey || {}).forEach(([equipmentKey, assignment]) => {
      if (String(equipmentKey || '') === MANUAL_TRANSPORT_EQUIPMENT_KEY) return;
      const label = equipmentLabelByKey.get(String(equipmentKey || '')) || '운반 장비';
      const equipmentMeta = equipmentMetaByKey.get(String(equipmentKey || '')) || null;
      const lockedTransportAssignment = equipmentMeta?.lockedTransportAssignment || null;
      const isSelfLockedToday = Boolean(equipmentMeta?.isLockedToday) && Boolean(lockedTransportAssignment?.useSelfLabor);
      if (assignment?.useSelfLabor) {
        nextMap.self = {
          equipmentKey: String(equipmentKey || ''),
          label,
          isLockedToday: isSelfLockedToday
        };
      }
      WORKER_TYPE_KEYS.forEach((typeKey) => {
        const lockedWorkerIds = new Set(
          (lockedTransportAssignment?.selectedWorkerIdsByType?.[typeKey] || []).map((workerId) => String(workerId || ''))
        );
        (assignment?.selectedWorkerIdsByType?.[typeKey] || []).forEach((workerId) => {
          const safeWorkerId = String(workerId || '');
          if (!safeWorkerId) return;
          nextMap[`${typeKey}:${safeWorkerId}`] = {
            equipmentKey: String(equipmentKey || ''),
            label,
            isLockedToday: Boolean(equipmentMeta?.isLockedToday) && lockedWorkerIds.has(safeWorkerId)
          };
        });
      });
    });
    return nextMap;
  }, [MANUAL_TRANSPORT_EQUIPMENT_KEY, WORKER_TYPE_KEYS, equipmentRows, transportAssignmentByEquipmentKey]);

  React.useEffect(() => {
    if (!draggingWorkerPayload) setDropEquipmentKey('');
  }, [draggingWorkerPayload]);
  const showRightPalletSidePanel = Boolean(selectedDestination?.supportsPalletSlots) && selectedDestinationPalletSlotCount > 0;
  const showLeftPalletSidePanel = Boolean(selectedEquipmentKey);

  const sideRightCloseTimerRef = React.useRef(null);
  const sideLeftCloseTimerRef = React.useRef(null);

  const [rightSidePanelMounted, setRightSidePanelMounted] = React.useState(showRightPalletSidePanel);
  const [rightSidePanelClosing, setRightSidePanelClosing] = React.useState(false);
  const [leftSidePanelMounted, setLeftSidePanelMounted] = React.useState(showLeftPalletSidePanel);
  const [leftSidePanelClosing, setLeftSidePanelClosing] = React.useState(false);
  const [sidePanelSnapshot, setSidePanelSnapshot] = React.useState({
    label: selectedDestination?.label || '창고',
    slotCount: selectedDestinationPalletSlotCount,
    slots: selectedDestinationPalletSlots || []
  });

  React.useEffect(() => {
    return () => {
      if (sideRightCloseTimerRef.current) {
        clearTimeout(sideRightCloseTimerRef.current);
        sideRightCloseTimerRef.current = null;
      }
      if (sideLeftCloseTimerRef.current) {
        clearTimeout(sideLeftCloseTimerRef.current);
        sideLeftCloseTimerRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (showRightPalletSidePanel) {
      if (sideRightCloseTimerRef.current) {
        clearTimeout(sideRightCloseTimerRef.current);
        sideRightCloseTimerRef.current = null;
      }
      setSidePanelSnapshot({
        label: selectedDestination?.label || '창고',
        slotCount: selectedDestinationPalletSlotCount,
        slots: selectedDestinationPalletSlots || []
      });
      setRightSidePanelMounted(true);
      setRightSidePanelClosing(false);
      return;
    }
    if (!rightSidePanelMounted || rightSidePanelClosing) return;
    setRightSidePanelClosing(true);
    sideRightCloseTimerRef.current = setTimeout(() => {
      setRightSidePanelMounted(false);
      setRightSidePanelClosing(false);
      sideRightCloseTimerRef.current = null;
    }, 560);
  }, [
    showRightPalletSidePanel,
    rightSidePanelMounted,
    rightSidePanelClosing,
    selectedDestination,
    selectedDestinationPalletSlotCount,
    selectedDestinationPalletSlots
  ]);

  React.useEffect(() => {
    if (showLeftPalletSidePanel) {
      if (sideLeftCloseTimerRef.current) {
        clearTimeout(sideLeftCloseTimerRef.current);
        sideLeftCloseTimerRef.current = null;
      }
      setLeftSidePanelMounted(true);
      setLeftSidePanelClosing(false);
      return;
    }
    if (!leftSidePanelMounted || leftSidePanelClosing) return;
    setLeftSidePanelClosing(true);
    sideLeftCloseTimerRef.current = setTimeout(() => {
      setLeftSidePanelMounted(false);
      setLeftSidePanelClosing(false);
      sideLeftCloseTimerRef.current = null;
    }, 560);
  }, [showLeftPalletSidePanel, leftSidePanelMounted, leftSidePanelClosing]);

  const sidePanelLabel = showRightPalletSidePanel ? (selectedDestination?.label || '창고') : sidePanelSnapshot.label;
  const sidePanelSlotCount = showRightPalletSidePanel ? selectedDestinationPalletSlotCount : sidePanelSnapshot.slotCount;
  const sidePanelSlots = showRightPalletSidePanel ? (selectedDestinationPalletSlots || []) : (sidePanelSnapshot.slots || []);
  const occupiedPalletSlots = (sidePanelSlots || []).filter((slot) => Boolean(slot?.occupied)).length;
  const selectedPalletSlotCount = (selectedDestinationPalletSlotNos || []).length;
  const normalizedDestinationStorageTab = 'general';
  const rightPanelVisible = showRightPalletSidePanel || rightSidePanelMounted;
  const leftPanelVisible = showLeftPalletSidePanel || leftSidePanelMounted;
  const sidePanelVisible = rightPanelVisible || leftPanelVisible;
  const rightPanelIsClosing = isClosing || rightSidePanelClosing;
  const leftPanelIsClosing = isClosing || leftSidePanelClosing;

  return (
    <>
      <div className={`confirm-modal-backdrop ${isClosing ? 'is-closing' : ''}`.trim()} onClick={onClose} />
      <div className={`harvest-transport-modal-cluster ${sidePanelVisible ? 'is-side-open' : ''} ${isClosing ? 'is-closing' : ''}`.trim()}>
        <div
          className="harvest-transport-modal-cluster__shell"
          onClick={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <div className={`confirm-modal confirm-modal--harvest-plan confirm-modal--harvest-transport ${isClosing ? 'is-closing' : ''}`.trim()}>
            <div className="confirm-modal__title">운반</div>
            <div className="harvest-transport-pending-wrap">
              <HarvestPendingBoxesPanel
                title=""
                pendingLoadBoxSummary={pendingLoadBoxSummary}
                pendingLoadLabel="운반 대기 상자"
                pendingLoadImageSrc={pendingLoadImageSrc}
                pendingLoadImageItemKey={pendingLoadImageItemKey}
                selectedCardIds={selectedPendingCardIds}
                onToggleCard={onTogglePendingCard}
                emptyText="현재 대기 중인 상자가 없습니다."
                layout="row"
                panelClassName="harvest-transport-pending-panel"
              />
              <div className="harvest-transport-pending-hint">
                {`${pendingKg.toLocaleString()}kg${pendingLoadBoxSummary.hasRemainderBox ? `, 미반납 ${pendingLoadBoxSummary.remainderKg.toLocaleString()}kg` : ''}`}
              </div>
            </div>
            <div className="harvest-plan-labor-row">
              <div className="harvest-plan-labor-meter harvest-plan-labor-meter--transport harvest-transport-choice-panel">
                <div className="harvest-plan-labor-meter__head">
                  <span>운반 장비 선택</span>
                  <strong className={`harvest-transport-select-state ${transportMachineName ? 'is-selected' : 'is-unselected'}`}>
                    {transportMachineName ? `배치 대상 : ${transportMachineName}` : '미선택'}
                  </strong>
                </div>
                <div className="harvest-plan-worker-grid harvest-transport-choice-list">
                  {(equipmentRows || []).length ? (
                    equipmentRows.map((row) => {
                      const isSelected = String(selectedEquipmentKey || '') === String(row.key || '');
                      const equipmentKey = String(row.key || '');
                      const isManualCarry = equipmentKey === MANUAL_TRANSPORT_EQUIPMENT_KEY;
                      const assignedWorkerIconRows = assignedWorkerIconRowsOfEquipment(equipmentKey);
                      const maxWorkers = Math.max(1, Number(row?.maxWorkers) || 1);
                      const isFull = assignedWorkerIconRows.length >= maxWorkers;
                      const isLockedToday = Boolean(row?.isLockedToday);
                      const isDropActive = dropEquipmentKey === equipmentKey;
                      return (
                        <button
                          key={`harvest-transport-equipment-${equipmentKey}`}
                          type="button"
                          className={`harvest-plan-worker-chip harvest-transport-choice-card harvest-transport-choice-card--worker-drop ${isSelected ? 'harvest-plan-worker-chip--active is-selected' : 'harvest-plan-worker-chip--locked'} ${isDropActive ? 'harvest-transport-choice-card--worker-drop-active' : ''}`.trim()}
                          aria-pressed={isSelected}
                          onClick={() => onSelectEquipment(equipmentKey)}
                          onDragOver={(event) => {
                            const nextPayload = readWorkerDragPayload(event.dataTransfer) || draggingWorkerPayload;
                            if (!nextPayload || isLockedToday || isFull) return;
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';
                            setDropEquipmentKey(equipmentKey);
                          }}
                          onDragLeave={() => {
                            if (dropEquipmentKey === equipmentKey) setDropEquipmentKey('');
                          }}
                          onDrop={(event) => {
                            const nextPayload = readWorkerDragPayload(event.dataTransfer) || draggingWorkerPayload;
                            if (!nextPayload || isLockedToday || isFull) return;
                            event.preventDefault();
                            setDropEquipmentKey('');
                            setDraggingWorkerPayload(null);
                            onAssignWorkerToEquipment?.(equipmentKey, nextPayload);
                          }}
                        >
                          {row.imageSrc ? (
                            <span className="harvest-plan-worker-chip__equip">
                              <span className={`harvest-plan-worker-chip__equip-icon ${isSelected ? 'is-selected' : ''}`.trim()}>
                                <img src={row.imageSrc} alt={row.label} />
                              </span>
                            </span>
                          ) : (
                            <span className="harvest-plan-worker-chip__icon">{row.imageEmoji || '운반'}</span>
                          )}
                          <span className="harvest-transport-equipment-row__content">
                            <span className="harvest-transport-equipment-row__top">
                              <span className="harvest-plan-worker-chip__name">{row.label}</span>
                              {isLockedToday ? (
                                <span className="harvest-transport-equipment-row__inuse-badge" aria-label="사용중">
                                  <span className="harvest-transport-equipment-row__inuse-led" aria-hidden="true" />
                                  사용중
                                </span>
                              ) : (
                                <span className="harvest-plan-worker-chip__labor">
                                  {assignedWorkerIconRows.length ? '배치됨' : row.hint}
                                </span>
                              )}
                            </span>
                            <span className="harvest-transport-equipment-row__meta">
                              <span>{Number(row.payloadKg) > 0 ? `적재량 ${Number(row.payloadKg).toLocaleString()}kg` : ''}</span>
                              <span>{isManualCarry ? `현재 ${assignedWorkerIconRows.length}명 · 제한없음` : `현재 ${assignedWorkerIconRows.length}/${maxWorkers}명`}</span>
                              {assignedWorkerIconRows.length ? (
                                <span className="harvest-transport-equipment-row__crew" aria-label="배치 인원">
                                  {assignedWorkerIconRows.map((worker) => (
                                    <span
                                      key={`transport-assigned-worker-${worker.key}`}
                                      className="harvest-transport-equipment-row__crew-icon"
                                      title={worker.label}
                                    >
                                      {worker.icon}
                                    </span>
                                  ))}
                                </span>
                              ) : null}
                            </span>
                            {isDropActive && !isLockedToday && !isFull ? (
                              <span className="harvest-transport-equipment-row__drop-hint">여기에 놓으면 이 장비에 배치됩니다</span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="meter__hint" aria-hidden="true" />
                  )}
                </div>
              </div>
              <div className="harvest-plan-labor-meter harvest-plan-labor-meter--external harvest-transport-choice-panel">
                <div className="harvest-plan-labor-meter__head">
                  <span>운반 목적지 선택</span>
                  <strong className={`harvest-transport-select-state ${selectedDestination ? 'is-selected' : 'is-unselected'}`}>
                    {selectedDestination ? `선택됨 : ${selectedDestination.label}` : '미선택'}
                  </strong>
                </div>
                <div className="harvest-transport-warehouse-list harvest-transport-choice-list">
                  {destinationRows.length ? (
                    destinationRows.map((row) => (
                      <button
                        key={`harvest-transport-destination-${row.key}`}
                        type="button"
                        className={`harvest-transport-warehouse-row harvest-transport-choice-card ${
                          row.isColdStorage && row.coldEnabled ? 'is-cold-on ' : ''
                        }${
                          String(selectedDestinationKey || '') === String(row.key || '') ? 'harvest-plan-worker-chip--active is-selected is-active' : ''
                        }`}
                        onClick={() => onSelectDestination(String(row.key || ''))}
                      >
                        <div className="harvest-transport-warehouse-row__top">
                          <strong>{row.label}</strong>
                          {row.isColdStorage ? (
                            <span className="harvest-transport-warehouse-row__cold-meta">
                              <span>{row.hint}</span>
                              <span className={`harvest-transport-cold-toggle ${row.coldEnabled ? 'is-on' : 'is-off'}`.trim()}>
                                <span className="harvest-transport-cold-toggle__thumb" aria-hidden="true" />
                                <b>{`냉장 ${row.coldStatusLabel || 'OFF'}`}</b>
                              </span>
                            </span>
                          ) : (
                            <span>{row.hint}</span>
                          )}
                        </div>
                        <div className="harvest-transport-warehouse-row__meta">
                          <span>
                            {row.type === 'carrier'
                              ? `${Math.round(row.usedKg).toLocaleString()} / ${Math.round(row.capacityKg).toLocaleString()}kg 사용`
                              : `${Math.round(row.usedKg).toLocaleString()} / ${Math.round(row.capacityKg).toLocaleString()}kg 보관`}
                          </span>
                          <strong>{`${Math.round(row.percent)}%`}</strong>
                        </div>
                        <div className="meter__track meter__track--blue harvest-transport-warehouse-row__track" aria-hidden="true">
                          <span style={{ width: `${row.percent}%` }} />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="harvest-transport-warehouse-row">
                      <strong>선택 가능한 목적지 없음</strong>
                      <span>현재 선택 가능한 목적지가 없습니다.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="footer-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  window.alert(transportFormulaText);
                }}
              >
                산출식
              </button>
              <span title={confirmButtonHoverTitle}>
                <button
                  type="button"
                  className="button button--primary"
                  disabled={confirmDisabled}
                  aria-label={confirmButtonHoverTitle || '운반 실행'}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onConfirm?.();
                  }}
                >
                  운반 실행
                </button>
              </span>
              <button
                type="button"
                className="button button--ghost"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onClose?.();
                }}
              >
                닫기
              </button>
            </div>
          </div>
          {sidePanelVisible ? (
            <>
              {rightPanelVisible ? (
                <div className={`confirm-modal confirm-modal--harvest-transport-side confirm-modal--harvest-transport-side--right ${normalizedDestinationStorageTab === 'general' ? 'confirm-modal--harvest-transport-side--general' : ''} ${rightPanelIsClosing ? 'is-closing' : ''}`.trim()}>
                  <div className={`warehouse-harvest-slot-panel warehouse-harvest-slot-panel--transport-side ${normalizedDestinationStorageTab === 'general' ? 'warehouse-harvest-slot-panel--transport-side-general' : ''}`.trim()}>
                    <div className="warehouse-harvest-slot-panel__head">
                      <strong>{sidePanelLabel}</strong>
                    </div>
                    <div className="warehouse-harvest-slot-grid warehouse-harvest-slot-grid--transport-side">
                      {sidePanelSlots.map((slot) => {
                        const isSelectable = Math.max(0, Number(slot?.remainKg) || 0) > 0;
                        const visualBoxCount = Math.max(1, Math.floor(Number(slot?.maxBoxes) || HARVEST_BOXES_PER_PALLET));
                        const hasBoxes = Boolean(slot?.occupied) && Boolean(slot?.isHarvestStored || slot?.hasStoredHarvest || slot?.isFloorStored);
                        const isVehicleFloorSlot = !slot?.occupied && visualBoxCount > HARVEST_BOXES_PER_PALLET;
                        const slotLabel = `수확물 적재칸 ${slot.slotNo}`;
                        const headerNode = !hasBoxes ? (
                          <>
                            <strong>{slotLabel}</strong>
                            <span className="warehouse-harvest-slot-card__status">
                              {slot?.slotType === 'emptyPallet' ? '빈 팔레트 적재됨' : (isVehicleFloorSlot ? '바닥 적재 공간' : '저장공간')}
                            </span>
                          </>
                        ) : null;
                        return (
                          <WarehouseSharedHarvestSlotCard
                            key={`harvest-transport-storage-pallet-right-${slot.slotNo}`}
                            slotNo={slot.slotNo}
                            slotLabel={slotLabel}
                            slotEntry={slot}
                            palletImageSrc={palletImageSrc}
                            activeFacilityStorageKey={String(selectedDestinationKey || '')}
                            visibleLayerBySlot={visibleLayerBySlot}
                            setVisibleLayerBySlot={setVisibleLayerBySlot}
                            harvestBoxesPerPallet={visualBoxCount}
                            harvestPalletDisplayBoxIndexOf={(boxIndex) => harvestPalletDisplayBoxIndexOf(boxIndex, 6, visualBoxCount)}
                            harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
                            harvestPalletBoxToneAt={harvestPalletBoxToneAt}
                            cardClassName="warehouse-harvest-slot-card--transport-side"
                            headerNode={headerNode}
                            suppressDetailOpen
                            suppressMemoButton
                            cardButtonEnabled={isSelectable}
                            forceSelected={Boolean(slot.selected)}
                            onCardButtonClick={() => {
                              if (!isSelectable) return;
                              onToggleDestinationPalletSlot?.(slot.slotNo);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
              {leftPanelVisible ? (
                <div className={`confirm-modal confirm-modal--harvest-transport-side confirm-modal--harvest-transport-side--left ${leftPanelIsClosing ? 'is-closing' : ''}`.trim()}>
                  <div className="warehouse-harvest-slot-panel warehouse-harvest-slot-panel--transport-side harvest-transport-labor-side">
                    <div className="warehouse-harvest-slot-panel__head">
                      <strong>{selectedEquipmentRow ? `${selectedEquipmentRow.label} 인력 배치` : '인력 투입 선택'}</strong>
                      <span>{`자가 ${useSelfLabor ? '참여' : '미참여'} · 외부 ${selectedExternalHeadcount}명`}</span>
                    </div>
                    <div className="meter__hint" style={{ marginBottom: 8 }}>
                      사람 카드를 장비 카드로 끌어 놓으면 바로 배치됩니다. 선택 해제는 사람 카드를 다시 누르면 됩니다.
                    </div>
                    <div className="harvest-transport-labor-side__list">
                      <div className="harvest-plan-worker-field">
                    <div className="harvest-plan-worker-grid">
                      {(() => {
                        const assignedStatus = workerAssignmentStatusMap.self || null;
                        const isAssignedToOtherEquipment = Boolean(
                          assignedStatus && String(assignedStatus.equipmentKey || '') !== String(selectedEquipmentKey || '')
                        );
                        const assignmentBadgeLabel = assignedStatus?.isLockedToday ? '사용중' : '배치됨';
                        const assignmentTitle = isAssignedToOtherEquipment
                          ? `이미 ${assignedStatus?.label || '다른 장비'}에 ${assignedStatus?.isLockedToday ? '사용중' : '배치됨'}`
                          : '';
                        return (
                          <button
                            type="button"
                            className={`harvest-plan-worker-chip harvest-transport-choice-card ${useSelfLabor ? 'harvest-plan-worker-chip--active is-selected' : 'harvest-plan-worker-chip--locked'} ${isAssignedToOtherEquipment ? 'harvest-transport-choice-card--assigned-other' : ''}`.trim()}
                            onClick={() => {
                              if (isAssignedToOtherEquipment) return;
                              onToggleSelfLabor();
                            }}
                            draggable={!isAssignedToOtherEquipment}
                            aria-disabled={isAssignedToOtherEquipment}
                            title={assignmentTitle}
                            onDragStart={(event) => {
                              if (isAssignedToOtherEquipment) {
                                event.preventDefault();
                                return;
                              }
                              const payload = { kind: 'self' };
                              const raw = JSON.stringify(payload);
                              setDraggingWorkerPayload(payload);
                              event.dataTransfer.setData(WORKER_DRAG_MIME, raw);
                              event.dataTransfer.setData('text/plain', raw);
                              event.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => {
                              setDraggingWorkerPayload(null);
                              setDropEquipmentKey('');
                            }}
                          >
                            <span className="harvest-plan-worker-chip__icon">🧑‍🌾</span>
                            <span className="harvest-plan-worker-chip__name">나 (자가노동력)</span>
                            {assignedStatus ? (
                              <span className={`harvest-transport-worker-assigned-badge ${isAssignedToOtherEquipment ? 'harvest-transport-worker-assigned-badge--other' : ''}`.trim()}>
                                {assignmentBadgeLabel}
                              </span>
                            ) : null}
                            <span className="harvest-plan-worker-chip__labor">{`${Math.max(0, Number(selfLaborAvailable) || 0)} 노동력`}</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                      {WORKER_TYPE_KEYS.map((typeKey) => {
                        const availableCount = Number(availableWorkerMix?.[typeKey] || 0);
                        if (availableCount <= 0) return null;
                        const selectedIds = selectedWorkerIdsByType?.[typeKey] || [];
                        const list = workerRosterByType?.[typeKey] || [];
                        return (
                          <div key={`transport-worker-field-${typeKey}`} className="harvest-plan-worker-field">
                            <div className="harvest-plan-worker-field__top">
                              <span>{`${WORKER_TYPE_LABELS[typeKey]} (현재 ${availableCount}명)`}</span>
                              <strong>{`${selectedIds.length}명 선택`}</strong>
                            </div>
                            <div className="harvest-plan-worker-grid">
                              {list.map((worker, index) => {
                                const workerId = String(worker?.id || '');
                                const isSelected = selectedIds.includes(workerId);
                                const assignedStatus = workerAssignmentStatusMap[`${typeKey}:${workerId}`] || null;
                                const isAssignedToOtherEquipment = Boolean(
                                  assignedStatus && String(assignedStatus.equipmentKey || '') !== String(selectedEquipmentKey || '')
                                );
                                const assignmentBadgeLabel = assignedStatus?.isLockedToday ? '사용중' : '배치됨';
                                const assignmentTitle = isAssignedToOtherEquipment
                                  ? `이미 ${assignedStatus?.label || '다른 장비'}에 ${assignedStatus?.isLockedToday ? '사용중' : '배치됨'}`
                                  : '';
                                return (
                                  <button
                                    key={workerId || `transport-worker-${typeKey}-${index + 1}`}
                                    type="button"
                                    className={`harvest-plan-worker-chip harvest-transport-choice-card ${isSelected ? 'harvest-plan-worker-chip--active is-selected' : 'harvest-plan-worker-chip--locked'} ${isAssignedToOtherEquipment ? 'harvest-transport-choice-card--assigned-other' : ''}`.trim()}
                                    onClick={() => {
                                      if (isAssignedToOtherEquipment) return;
                                      onToggleWorker(typeKey, worker?.id);
                                    }}
                                    draggable={!isAssignedToOtherEquipment}
                                    aria-disabled={isAssignedToOtherEquipment}
                                    title={assignmentTitle}
                                    onDragStart={(event) => {
                                      if (isAssignedToOtherEquipment) {
                                        event.preventDefault();
                                        return;
                                      }
                                      const payload = { kind: 'worker', typeKey, workerId };
                                      const raw = JSON.stringify(payload);
                                      setDraggingWorkerPayload(payload);
                                      event.dataTransfer.setData(WORKER_DRAG_MIME, raw);
                                      event.dataTransfer.setData('text/plain', raw);
                                      event.dataTransfer.effectAllowed = 'move';
                                    }}
                                    onDragEnd={() => {
                                      setDraggingWorkerPayload(null);
                                      setDropEquipmentKey('');
                                    }}
                                  >
                                    <span className="harvest-plan-worker-chip__icon">{crewIconOf ? crewIconOf(typeKey, worker?.gender) : '👷'}</span>
                                    <span className="harvest-plan-worker-chip__name">{worker?.name || '외부인력'}</span>
                                    {assignedStatus ? (
                                      <span className={`harvest-transport-worker-assigned-badge ${isAssignedToOtherEquipment ? 'harvest-transport-worker-assigned-badge--other' : ''}`.trim()}>
                                        {assignmentBadgeLabel}
                                      </span>
                                    ) : null}
                                    <span className="harvest-plan-worker-chip__labor">{`${Math.max(0, Number(worker?.labor) || 0)} 노동력`}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
