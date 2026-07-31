import React, { useEffect, useRef, useState } from 'react';

const PARKING_SLOT_VACATE_MS = 460;
const PARKING_SLOT_DOCK_MS = 560;
const PARKING_SLOT_OCCUPY_MS = 520;

const ParkingSlotButton = ({
  isSelected = false,
  isOccupied = false,
  className = '',
  children,
  disabled = false,
  onClick,
  ...props
}) => {
  const [isDocking, setIsDocking] = useState(false);
  const [isOccupying, setIsOccupying] = useState(false);
  const [vacatingSnapshot, setVacatingSnapshot] = useState(null);
  const prevSelectedRef = useRef(Boolean(isSelected));
  const prevOccupiedRef = useRef(Boolean(isOccupied));
  const lastOccupiedSnapshotRef = useRef(null);

  useEffect(() => {
    const wasSelected = prevSelectedRef.current;
    prevSelectedRef.current = Boolean(isSelected);
    if (wasSelected || !isSelected) return undefined;
    setIsDocking(true);
    const timeoutId = window.setTimeout(() => {
      setIsDocking(false);
    }, PARKING_SLOT_DOCK_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isSelected]);

  useEffect(() => {
    if (!isOccupied) return;
    lastOccupiedSnapshotRef.current = {
      children,
      isOwnedOccupied: className.includes('is-owned-occupied'),
      isOccupiedByOther: className.includes('is-occupied'),
      isProtected: className.includes('is-protected')
    };
  }, [children, className, isOccupied]);

  useEffect(() => {
    const wasOccupied = prevOccupiedRef.current;
    prevOccupiedRef.current = Boolean(isOccupied);
    if (wasOccupied && !isOccupied && lastOccupiedSnapshotRef.current) {
      setVacatingSnapshot(lastOccupiedSnapshotRef.current);
      const timeoutId = window.setTimeout(() => {
        setVacatingSnapshot(null);
      }, PARKING_SLOT_VACATE_MS);
      return () => window.clearTimeout(timeoutId);
    }
    if (wasOccupied || !isOccupied) return undefined;
    setIsOccupying(true);
    const timeoutId = window.setTimeout(() => {
      setIsOccupying(false);
    }, PARKING_SLOT_OCCUPY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isOccupied]);

  const isInteractionLocked = isDocking || isOccupying || Boolean(vacatingSnapshot);
  const isDisabled = Boolean(disabled || isInteractionLocked);

  return (
    <button
      {...props}
      className={`${className} ${isSelected ? 'is-selected' : ''} ${isDocking ? 'is-docking' : ''} ${isOccupying ? 'is-occupying' : ''} ${isInteractionLocked ? 'is-animation-locked' : ''}`.trim()}
      disabled={isDisabled}
      onClick={(event) => {
        if (isInteractionLocked) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
    >
      <div className="field-move-parking-slot-btn__card">
        {children}
      </div>
      {vacatingSnapshot ? (
        <div
          className={[
            'field-move-parking-slot-btn__card',
            'field-move-parking-slot-btn__ghost',
            vacatingSnapshot.isOwnedOccupied ? 'is-owned-occupied' : '',
            vacatingSnapshot.isOccupiedByOther ? 'is-occupied' : '',
            vacatingSnapshot.isProtected ? 'is-protected' : ''
          ].filter(Boolean).join(' ')}
          aria-hidden="true"
        >
          {vacatingSnapshot.children}
        </div>
      ) : null}
    </button>
  );
};

export const ParkingSlotSelectorPanel = ({
  title,
  capacity,
  openCapacity = 0,
  parkingSlots = [],
  activeSlotNo = 0,
  resolveParkedMachine,
  machineImageSrcOf,
  onSelect,
  slotLabel,
  occupiedText,
  emptyText = '선택 가능',
  emptyHint,
  className = ''
}) => {
  const useTwoRowScroll = Number(capacity) > 8;
  return (
    <div className={`field-move-parking-panel ${useTwoRowScroll ? 'field-move-parking-panel--two-row-scroll' : ''} ${className}`.trim()}>
      <div className="field-move-parking-panel__head">
        <strong>{title}</strong>
        <span>{`총 ${capacity}칸`}</span>
      </div>
      {capacity > 0 ? (
        <div className="field-move-parking-slot-grid">
          {Array.from({ length: capacity }, (_, idx) => {
            const slotNo = idx + 1;
            const parkedVehicleId = String(parkingSlots[idx] || '');
            const isOccupied = Boolean(parkedVehicleId);
            const isSelected = slotNo === activeSlotNo;
            const isProtected = slotNo > openCapacity;
            const parkedVehicle = parkedVehicleId ? resolveParkedMachine?.(parkedVehicleId) : null;
            const parkedVehicleImageSrc = parkedVehicle ? (machineImageSrcOf?.(parkedVehicle) || '') : '';
            return (
              <ParkingSlotButton
                key={`parking-slot-${title}-${slotNo}`}
                isSelected={isSelected}
                isOccupied={isOccupied}
                className={`field-move-parking-slot-btn ${!isOccupied ? 'is-empty' : ''} ${isProtected ? 'is-protected' : ''} ${isOccupied ? 'is-occupied' : ''}`.trim()}
                onClick={() => {
                  if (isOccupied) return;
                  onSelect(slotNo);
                }}
                disabled={isOccupied}
                title={isOccupied
                  ? (
                      parkedVehicle
                        ? `${parkedVehicle.item?.name || parkedVehicle.machineKey} #${parkedVehicle.unitNo}${parkedVehicle?.plateText ? ` · ${parkedVehicle.plateText}` : ''} 주차중`
                        : '주차중'
                    )
                  : ''}
              >
                <strong>{`P${slotNo}`}</strong>
                {parkedVehicleImageSrc ? (
                  <div className="field-move-parking-slot-btn__thumb" aria-hidden="true">
                    <img src={parkedVehicleImageSrc} alt="" />
                  </div>
                ) : null}
                <span>{typeof slotLabel === 'function' ? slotLabel(slotNo, parkedVehicle) : slotLabel}</span>
                <em>
                  {isOccupied
                    ? (typeof occupiedText === 'function' ? occupiedText(parkedVehicle, slotNo) : occupiedText)
                    : emptyText}
                </em>
              </ParkingSlotButton>
            );
          })}
        </div>
      ) : (
        <div className="meter__hint">{emptyHint}</div>
      )}
    </div>
  );
};

export const TownMarkerParkingPanel = ({
  destinationLabel,
  slotRows,
  selectedSlotNo = 0,
  arrivedVehicleId = '',
  readOnly = false,
  resolveParkedMachine,
  machineImageSrcOf,
  onPickupParkedVehicle,
  onToggleSlot,
  onOpenCargo,
  townMarkerParkingSlotCount,
  slotHeading = '주차칸',
  panelKeyPrefix = ''
}) => {
  const disabledByWalk = !arrivedVehicleId;
  const useTwoRowScroll = Number(townMarkerParkingSlotCount) > 8;
  return (
    <div className={`field-move-parking-panel ${useTwoRowScroll ? 'field-move-parking-panel--two-row-scroll' : ''}`.trim()} style={{ marginTop: 8 }}>
      <div className="field-move-parking-panel__head">
        <strong>{slotHeading}</strong>
        <span>{`총 ${townMarkerParkingSlotCount}칸`}</span>
      </div>
      <div className="field-move-parking-slot-grid">
        {slotRows.map((slotRow) => {
          const slotNo = slotRow.slotNo;
          const isSelected = selectedSlotNo === slotNo;
          const isOwnedOccupied = slotRow.occupied && !slotRow.occupiedByOther;
          const isNpcOnly = Boolean(slotRow?.npcOnly);
          const isPlayerReservedSlot = Boolean(slotRow?.playerOwned && slotRow?.playerTurnReserved);
          const requiresAssignment = Boolean(slotRow?.requiresAssignment);
          const parkedVehicleName = String(slotRow?.parkedVehicleName || '차량');
          const parkedVehiclePlateText = String(slotRow?.parkedVehiclePlateText || '').trim();
          const parkedMachine = slotRow.parkedVehicleId
            ? resolveParkedMachine?.(slotRow.parkedVehicleId)
            : null;
          const parkedMachineImageSrc = parkedMachine
            ? (machineImageSrcOf?.(parkedMachine) || '')
            : String(slotRow?.parkedVehicleImageSrc || '');
          const statusText = isNpcOnly
            ? String(slotRow?.workflowLabel || '')
            : isPlayerReservedSlot
              ? String(slotRow?.remainingText ? `${slotRow.remainingText} 남음` : '남은 시간 확인 중')
              : slotRow.occupiedByOther
                ? '사용중'
                : (slotRow.occupied
                    ? '내 차량 주차중'
                    : (String(slotRow?.statusHint || '').trim() || (readOnly ? '전용 구역' : (disabledByWalk ? '비어 있음' : '선택 가능'))));
          const detailPrimaryText = isNpcOnly
            ? (slotRow.occupied ? parkedVehicleName : '')
            : isPlayerReservedSlot
              ? String(slotRow?.workflowLabel || '내 예약 자리')
              : (slotRow.occupied ? parkedVehicleName : '');
          const detailSecondaryText = isNpcOnly
            ? (parkedVehiclePlateText || '')
            : ((slotRow.occupied || slotRow.occupiedByOther) && parkedVehiclePlateText
                ? parkedVehiclePlateText
                : '');
          const shipperName = String(slotRow?.shipperName || slotRow?.farmerName || '').trim();
          const shipperEmoji = String(slotRow?.shipperEmoji || '').trim();
          const detailTertiaryText = slotRow.occupied && shipperName
            ? `${shipperEmoji || '🧑‍🌾'} 출하 ${shipperName}`
            : '';
          const badgeText = isPlayerReservedSlot
            ? '내 예약'
            : String(slotRow?.statusBadge || '');
          const canOpenCargo = Boolean(
            slotRow.occupied
            && !slotRow.occupiedByOther
            && (Number(parkedMachine?.item?.payloadKg) || 0) > 0
          );
          return (
            <div key={`town-marker-parking-slot-${String(panelKeyPrefix || 'general')}-${slotNo}`} className="field-move-parking-slot-wrap">
              <ParkingSlotButton
                isSelected={isSelected}
                isOccupied={slotRow.occupied}
                className={`field-move-parking-slot-btn ${!slotRow.occupied ? 'is-empty' : ''} ${isOwnedOccupied ? 'is-owned-occupied' : ''} ${slotRow.occupiedByOther ? 'is-occupied' : ''}`.trim()}
                onClick={() => {
                  if (readOnly) return;
                  if (isNpcOnly) return;
                  if (requiresAssignment) return;
                  if (disabledByWalk) {
                    if (!slotRow.occupied || slotRow.randomOccupiedByNpc || slotRow.occupiedByOther) return;
                    onPickupParkedVehicle(slotNo);
                    return;
                  }
                  if (slotRow.occupiedByOther) return;
                  onToggleSlot(slotNo, slotRow.occupied && !slotRow.occupiedByOther);
                }}
                disabled={disabledByWalk
                  ? (readOnly || !slotRow.occupied || slotRow.randomOccupiedByNpc || slotRow.occupiedByOther || requiresAssignment)
                  : (readOnly || slotRow.occupiedByOther || isNpcOnly || requiresAssignment)}
              >
                <strong>{String(slotRow?.slotLabel || `P${slotNo}`)}</strong>
                {badgeText ? (
                  <span className={`field-move-parking-slot-btn__status-badge is-${String(slotRow?.statusTone || 'pending')}`.trim()}>
                    {badgeText}
                  </span>
                ) : null}
                {parkedMachineImageSrc ? (
                  <div className="field-move-parking-slot-btn__thumb" aria-hidden="true">
                    <img src={parkedMachineImageSrc} alt="" />
                  </div>
                ) : null}
                <span>{String(slotRow?.parkingLabel || `${destinationLabel} 주차`)}</span>
                <em>{statusText}</em>
                {detailPrimaryText ? (
                  <small className="field-move-parking-slot-btn__status-note">{detailPrimaryText}</small>
                ) : null}
                {detailSecondaryText ? (
                  <small className="field-move-parking-slot-btn__status-note field-move-parking-slot-btn__status-note--plate">
                    {detailSecondaryText}
                  </small>
                ) : null}
                {detailTertiaryText ? (
                  <small className="field-move-parking-slot-btn__status-note">{detailTertiaryText}</small>
                ) : null}
              </ParkingSlotButton>
              {canOpenCargo && !readOnly ? (
                <button
                  type="button"
                  className="button button--ghost button--compact day-transition-animate-button field-move-parking-slot-cargo-btn"
                  onClick={() => onOpenCargo(String(parkedMachine?.id || ''))}
                >
                  적재함
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ParkingFieldTargetList = ({
  title,
  items,
  activeIndex = -1,
  onSelect
}) => (
  <div className="field-move-parking-panel" style={{ marginTop: 10 }}>
    <div className="field-move-parking-panel__head">
      <strong>{title}</strong>
      <span>{`총 ${items.length}개`}</span>
    </div>
    <div className="field-move-vehicle-list">
      {items.map(({ key, label, meta, value }, idx) => {
        const targetValue = Number.isInteger(value) ? value : idx;
        const isActive = targetValue === activeIndex;
        return (
          <button
            key={key}
            type="button"
            className={`field-move-vehicle-btn focus-tab--farm-main-animate ${isActive ? 'is-active' : ''}`.trim()}
            onClick={() => onSelect(targetValue)}
          >
            <strong>{label}</strong>
            <span>{meta}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export const CargoParkingSlotSelectorPanel = ({
  title,
  capacity,
  openCapacity = 0,
  parkingSlots = [],
  selectedMainSlotNo = 0,
  activeSlotNo = 0,
  fieldLabel = '도착 토지',
  resolveParkedMachine,
  machineImageSrcOf,
  onSelect
}) => {
  const useTwoRowScroll = Number(capacity) > 8;
  return (
    <div className={`field-move-parking-panel ${useTwoRowScroll ? 'field-move-parking-panel--two-row-scroll' : ''}`.trim()} style={{ marginTop: 8 }}>
      <div className="field-move-parking-panel__head">
        <strong>{title}</strong>
        <span>{`총 ${capacity}칸`}</span>
      </div>
      {capacity > 0 ? (
        <div className="field-move-parking-slot-grid">
          {Array.from({ length: capacity }, (_, idx) => {
            const slotNo = idx + 1;
            const parkedVehicleId = String(parkingSlots[idx] || '');
            const parkedVehicle = parkedVehicleId ? resolveParkedMachine?.(parkedVehicleId) : null;
            const isOccupied = Boolean(parkedVehicleId);
            const isSelected = slotNo === activeSlotNo;
            const isDisabled = isOccupied || slotNo === selectedMainSlotNo;
            const isProtected = slotNo > openCapacity;
            const parkedVehicleImageSrc = parkedVehicle ? (machineImageSrcOf?.(parkedVehicle) || '') : '';
            return (
              <ParkingSlotButton
                key={`cargo-parking-slot-${slotNo}`}
                isSelected={isSelected}
                isOccupied={isOccupied}
                className={`field-move-parking-slot-btn ${!isOccupied && slotNo !== selectedMainSlotNo ? 'is-empty' : ''} ${isProtected ? 'is-protected' : ''} ${isDisabled ? 'is-occupied' : ''}`.trim()}
                onClick={() => {
                  if (isDisabled) return;
                  onSelect(slotNo);
                }}
                disabled={isDisabled}
              >
                <strong>{`P${slotNo}`}</strong>
                {parkedVehicleImageSrc ? (
                  <div className="field-move-parking-slot-btn__thumb" aria-hidden="true">
                    <img src={parkedVehicleImageSrc} alt="" />
                  </div>
                ) : null}
                <span>{`${fieldLabel} 주차`}</span>
                <em>
                  {isOccupied
                    ? `${parkedVehicle?.item?.name || '사용중'}${Number(parkedVehicle?.unitNo) > 0 ? ` #${parkedVehicle.unitNo}` : ''}${parkedVehicle?.plateText ? ` · ${parkedVehicle.plateText}` : ''}`
                    : (slotNo === selectedMainSlotNo ? '본체 칸과 중복 불가' : '선택 가능')}
                </em>
              </ParkingSlotButton>
            );
          })}
        </div>
      ) : (
        <div className="meter__hint">선택한 토지에 주차칸이 없습니다.</div>
      )}
    </div>
  );
};
