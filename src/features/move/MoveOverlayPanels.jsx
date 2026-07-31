import React from 'react';
import {
  CargoParkingSlotSelectorPanel,
  ParkingFieldTargetList,
  ParkingSlotSelectorPanel,
  TownMarkerParkingPanel
} from './MoveParkingPanels';

export const TownMarkerParkingModal = ({
  closing = false,
  destinationLabel,
  description,
  zoneTabs = [],
  activeZone = 'general',
  onSelectZone,
  slotRows,
  selectedSlotNo = 0,
  arrivedVehicleId = '',
  resolveParkedMachine,
  machineImageSrcOf,
  onPickupParkedVehicle,
  onToggleSlot,
  onOpenCargo,
  slotCount = 0,
  slotHeading = '주차칸',
  readOnly = false,
  readOnlyActionLabel = '전용 구역',
  onClose,
  onConfirmEnter
}) => {
  const previousZoneRef = React.useRef(activeZone);
  const zoneTabsRef = React.useRef(null);
  const zoneButtonRefs = React.useRef({});
  const previousZone = previousZoneRef.current;
  const currentZoneIndex = zoneTabs.findIndex((zone) => zone.key === activeZone);
  const previousZoneIndex = zoneTabs.findIndex((zone) => zone.key === previousZone);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = React.useState(null);
  const zonePanelAnimationClass = previousZone === activeZone
    ? ''
    : currentZoneIndex >= previousZoneIndex
      ? 'town-marker-parking-panel-switcher--enter-forward'
      : 'town-marker-parking-panel-switcher--enter-backward';

  React.useEffect(() => {
    previousZoneRef.current = activeZone;
  }, [activeZone]);

  React.useEffect(() => {
    const tabContainer = zoneTabsRef.current;
    const activeButton = zoneButtonRefs.current?.[activeZone] || null;
    if (!tabContainer || !activeButton) {
      setActiveIndicatorStyle(null);
      return undefined;
    }
    const updateIndicator = () => {
      const nextStyle = {
        width: activeButton.offsetWidth,
        transform: `translateX(${activeButton.offsetLeft}px)`,
      };
      setActiveIndicatorStyle((prev) => (
        prev
        && prev.width === nextStyle.width
        && prev.transform === nextStyle.transform
          ? prev
          : nextStyle
      ));
    };
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => {
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeZone, zoneTabs]);

  return (
    <>
      <div className={`confirm-modal-backdrop ${closing ? 'is-closing' : ''}`.trim()} onClick={onClose} />
      <div className={`confirm-modal field-move-modal ${closing ? 'is-closing' : ''}`.trim()}>
        <div className="confirm-modal__title">{`${destinationLabel} 주차칸 선택`}</div>
        <div className="confirm-modal__desc">{description}</div>
        {zoneTabs.length > 1 ? (
          <div
            ref={zoneTabsRef}
            className="focus-tabs town-marker-parking-zone-tabs"
            role="tablist"
            aria-label={`${destinationLabel} 주차 구역`}
          >
            <span
              className="town-marker-parking-zone-tabs__indicator"
              aria-hidden="true"
              style={activeIndicatorStyle || undefined}
            />
            {zoneTabs.map((zone) => (
              <button
                key={zone.key}
                ref={(node) => {
                  if (node) {
                    zoneButtonRefs.current[zone.key] = node;
                  } else {
                    delete zoneButtonRefs.current[zone.key];
                  }
                }}
                type="button"
                role="tab"
                aria-selected={activeZone === zone.key}
                className={`focus-tab ${activeZone === zone.key ? 'focus-tab--active' : ''}`.trim()}
                onClick={() => onSelectZone?.(zone.key)}
              >
                {zone.label}
              </button>
            ))}
          </div>
        ) : null}
        <div
          key={`town-marker-parking-panel-${activeZone}`}
          className={`town-marker-parking-panel-switcher ${zonePanelAnimationClass}`.trim()}
        >
          <TownMarkerParkingPanel
            destinationLabel={destinationLabel}
            slotRows={slotRows}
            selectedSlotNo={selectedSlotNo}
            arrivedVehicleId={arrivedVehicleId}
            readOnly={readOnly}
            resolveParkedMachine={resolveParkedMachine}
            machineImageSrcOf={machineImageSrcOf}
            onPickupParkedVehicle={onPickupParkedVehicle}
            onToggleSlot={onToggleSlot}
            onOpenCargo={onOpenCargo}
            townMarkerParkingSlotCount={slotCount}
            slotHeading={slotHeading}
            panelKeyPrefix={activeZone}
          />
        </div>
        <div className="footer-actions">
          <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>닫기</button>
          <button
            className="button button--primary day-transition-animate-button"
            onClick={onConfirmEnter}
            disabled={Boolean(arrivedVehicleId) || readOnly}
          >
            {readOnly ? readOnlyActionLabel : '들어가기'}
          </button>
        </div>
      </div>
    </>
  );
};

export const MachineRentTransportChoiceModal = ({
  deliveryFeeText,
  onDirectPickup,
  onRequestDelivery
}) => (
  <>
    <div className="confirm-modal-backdrop" />
    <div className="confirm-modal" style={{ zIndex: 171 }}>
      <div className="confirm-modal__title">운반 방식 선택</div>
      <div className="confirm-modal__desc">
        결제가 완료되었습니다. 직접 운반 또는 배송 요청 중 하나를 선택해 주세요.
      </div>
      <div className="inline-summary" style={{ marginTop: 10 }}>
        <div className="summary-chip"><span>직접 운반</span><strong>임시보관소로 이동</strong></div>
        <div className="summary-chip"><span>배송 요청</span><strong>{deliveryFeeText}</strong></div>
      </div>
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--primary day-transition-animate-button" onClick={onDirectPickup}>직접 운반</button>
        <button className="button button--ghost day-transition-animate-button" onClick={onRequestDelivery}>배송 요청</button>
      </div>
    </div>
  </>
);

export const MachineRentDeliveryPlacementModal = ({
  hasBundle = false,
  bundleItemName = '',
  activeFieldIndex = -1,
  fieldItems,
  onSelectField,
  totalParkingCapacity = 0,
  openParkingCapacity = 0,
  parkingSlots,
  activeMainSlotNo = 0,
  activeCargoSlotNo = 0,
  targetFieldLabel,
  resolveParkedMachine,
  machineImageSrcOf,
  onSelectMainSlot,
  onSelectCargoSlot,
  onConfirm,
  onCancel
}) => (
  <>
    <div className="confirm-modal-backdrop" />
    <div className="confirm-modal field-move-modal" style={{ zIndex: 172 }}>
      <div className="confirm-modal__title">배송 요청 도착지 지정</div>
      <div className="confirm-modal__desc">
        {hasBundle
          ? '보유한 토지에서 SS기 본체 주차칸과 적재함 주차칸을 각각 선택해 주세요.'
          : '보유한 토지와 주차칸을 선택해 주세요.'}
      </div>
      <ParkingFieldTargetList
        title="도착 토지 선택"
        activeIndex={activeFieldIndex}
        items={fieldItems}
        onSelect={onSelectField}
      />
      <div style={{ marginTop: 8 }}>
        <ParkingSlotSelectorPanel
          title={hasBundle ? 'SS기 본체 주차칸 선택' : '도착지 주차칸 선택'}
          capacity={totalParkingCapacity}
          openCapacity={openParkingCapacity}
          parkingSlots={parkingSlots}
          activeSlotNo={activeMainSlotNo}
          resolveParkedMachine={resolveParkedMachine}
          machineImageSrcOf={machineImageSrcOf}
          onSelect={onSelectMainSlot}
          slotLabel={`${targetFieldLabel} 주차`}
          occupiedText={(parkedVehicle) => `${parkedVehicle?.item?.name || '사용중'}${Number(parkedVehicle?.unitNo) > 0 ? ` #${parkedVehicle.unitNo}` : ''}`}
          emptyText="선택 가능"
          emptyHint="선택한 토지에 주차칸이 없습니다."
        />
      </div>
      {hasBundle ? (
        <CargoParkingSlotSelectorPanel
          title={`${bundleItemName || '적재함'} 주차칸 선택`}
          capacity={totalParkingCapacity}
          openCapacity={openParkingCapacity}
          parkingSlots={parkingSlots}
          selectedMainSlotNo={activeMainSlotNo}
          activeSlotNo={activeCargoSlotNo}
          fieldLabel={targetFieldLabel}
          resolveParkedMachine={resolveParkedMachine}
          machineImageSrcOf={machineImageSrcOf}
          onSelect={onSelectCargoSlot}
        />
      ) : null}
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--primary day-transition-animate-button" onClick={onConfirm}>배송 완료</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onCancel}>취소</button>
      </div>
    </div>
  </>
);
