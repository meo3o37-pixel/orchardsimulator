import React from 'react';

export default function MapTransferFuelDirectCard({
  mapTransferSelectedCarrier,
  mapTransferPersonalCarrierId,
  selectedCarrierCanDirectRefuel,
  selectedCarrierTankCurrent,
  selectedCarrierTankCapacity,
  formatLiterTextFixed2,
  selectedCarrierFuelTypeMismatch,
  machineFuelTypeLabelOf,
  setFuelKioskDirectTargetCarrierId,
  machineFuelKeyFromType,
  setFuelKioskKey,
  setFuelKioskCanKey,
  setFuelKioskSelectedCanLabelOverride,
  setFuelKioskCanPickerOpen,
  setFuelKioskFuelingDone,
  setFuelKioskBorrowedCan
}) {
  const selectedCarrierId = String(mapTransferSelectedCarrier?.id || '');
  const isPersonalCarrier = selectedCarrierId === mapTransferPersonalCarrierId;
  const isEquippedBagCarrier = selectedCarrierId === '__equipped_bag__'
    || String(mapTransferSelectedCarrier?.machineKey || '') === 'equippedBag';
  const selectedCarrierLabel = isPersonalCarrier
    ? '개인소지품'
    : isEquippedBagCarrier
      ? '가방'
      : `${mapTransferSelectedCarrier?.item?.name || mapTransferSelectedCarrier?.machineKey || '선택 차량'} #${mapTransferSelectedCarrier?.unitNo}`;
  return (
    <div className="map-transfer-vehicle-card map-transfer-vehicle-card--selected">
      <div className="map-transfer-vehicle-card__head">
        <strong>{selectedCarrierLabel}</strong>
        <span>{isPersonalCarrier ? '기본' : isEquippedBagCarrier ? '착용' : '선택완료'}</span>
      </div>
      <div className="map-transfer-vehicle-card__meta">
        {selectedCarrierCanDirectRefuel
          ? `연료 ${formatLiterTextFixed2(selectedCarrierTankCurrent)}L / ${formatLiterTextFixed2(selectedCarrierTankCapacity)}L`
          : '직접주유 대상 아님'}
      </div>
      <div className="map-transfer-vehicle-card__actions">
        <button
          type="button"
          className="button button--ghost button--compact day-transition-animate-button"
          onClick={() => {
            if (!selectedCarrierCanDirectRefuel || selectedCarrierFuelTypeMismatch) return;
            setFuelKioskDirectTargetCarrierId(String(mapTransferSelectedCarrier?.id || ''));
            const targetFuelKey = String(machineFuelKeyFromType(mapTransferSelectedCarrier?.item?.fuelType) || '');
            if (targetFuelKey) {
              setFuelKioskKey(targetFuelKey);
            }
            setFuelKioskCanKey('');
            setFuelKioskSelectedCanLabelOverride('');
            setFuelKioskCanPickerOpen(false);
            setFuelKioskFuelingDone(false);
            setFuelKioskBorrowedCan(null);
          }}
          disabled={!selectedCarrierCanDirectRefuel || selectedCarrierFuelTypeMismatch}
          title={
            selectedCarrierFuelTypeMismatch
              ? `선택 차량은 ${machineFuelTypeLabelOf(mapTransferSelectedCarrier?.item?.fuelType)}만 주유할 수 있습니다.`
              : selectedCarrierCanDirectRefuel
              ? '선택 차량에 바로 주유'
              : '내연기관 차량/농기계만 차량주유가 가능합니다.'
          }
        >
          차량주유
        </button>
      </div>
    </div>
  );
}
