export function handleFuelKioskCanSelection({
  option,
  mapLocationModal,
  fuelKioskStep,
  mapTransferSelectedCarrier,
  mapTransferSelectedCarrierCargoRows,
  stageFuelCanToKiosk,
  setFuelKioskCanPickerOpen,
  setFuelKioskBorrowedCan,
  setFuelKioskCanKey,
  setFuelKioskSelectedCanLabelOverride,
  setFuelKioskFuelingDone
}) {
  const isFuelStationMapModal = mapLocationModal.open && String(mapLocationModal.key || '') === 'fuelStation';
  const selectedCarrierId = String(mapTransferSelectedCarrier?.id || '');
  const optionItemKey = String(option?.key || '');
  const carrierCargoQty = mapTransferSelectedCarrierCargoRows
    .find((row) => String(row?.itemKey || '') === optionItemKey)?.qty || 0;

  if (isFuelStationMapModal && fuelKioskStep === 'confirm' && selectedCarrierId && carrierCargoQty > 0 && optionItemKey) {
    stageFuelCanToKiosk(String(option.optionKey || option.key || ''), optionItemKey);
    setFuelKioskCanPickerOpen(false);
    return;
  }

  setFuelKioskBorrowedCan(null);
  setFuelKioskCanKey(option.optionKey || option.key);
  setFuelKioskSelectedCanLabelOverride('');
  setFuelKioskFuelingDone(false);
  setFuelKioskCanPickerOpen(false);
}
