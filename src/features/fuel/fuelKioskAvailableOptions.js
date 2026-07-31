export function buildFuelKioskAvailableOptions({
  mapLocationModal,
  mapTransferSelectedCarrier,
  game,
  normalizeFuelStorageByContainer,
  baseContainerItems,
  fuelKioskVisualFuelKey,
  fuelItemNameMap,
  buildFuelKioskAvailableCanOptions,
  fuelKioskStagedCan,
  floorLitersToStep,
  formatLiterTextFixed2,
  fuelKioskLastReceipt
}) {
  const isFuelStationMapModal = mapLocationModal.open && String(mapLocationModal.key || '') === 'fuelStation';
  const selectedCarrierId = String(mapTransferSelectedCarrier?.id || '');
  const useCarrierSource = Boolean(isFuelStationMapModal && selectedCarrierId);
  const selectedCarrierInventory = useCarrierSource
    ? (game?.vehicleCargoByInstance?.[selectedCarrierId] || {})
    : null;
  const selectedCarrierFuelStorage = useCarrierSource
    ? normalizeFuelStorageByContainer(game?.vehicleFuelStorageByInstance?.[selectedCarrierId] || {})
    : null;
  const baseOptions = buildFuelKioskAvailableCanOptions({
    game,
    baseContainerItems: Array.isArray(baseContainerItems) ? baseContainerItems : [],
    fuelKioskVisualFuelKey,
    fuelItemNameMap,
    inventoryByContainer: selectedCarrierInventory,
    fuelStorageByContainer: selectedCarrierFuelStorage
  });
  if (!fuelKioskStagedCan) return baseOptions;
  const cap = Math.max(1, Number(fuelKioskStagedCan?.capacityPerUnit) || 1);
  const liters = floorLitersToStep(Math.max(0, Number(fuelKioskStagedCan?.storedLiters) || 0));
  const fuelKey = String(fuelKioskStagedCan?.fuelKey || fuelKioskVisualFuelKey || '');
  const fuelNameRaw = String(fuelItemNameMap?.[fuelKey] || fuelKioskLastReceipt?.fuelName || '연료');
  const fuelName = fuelNameRaw.replace(/\s*\([^)]*\)\s*/g, '').trim() || fuelNameRaw;
  return [{
    key: String(fuelKioskStagedCan?.containerKey || ''),
    optionKey: '__staged__',
    qty: 1,
    capacityPerUnit: cap,
    sameFuelStored: liters,
    sameFuelStoredPerCan: liters,
    activeFuelKey: fuelKey,
    storableRemain: floorLitersToStep(Math.max(0, cap - liters)),
    targetCanRemain: floorLitersToStep(Math.max(0, cap - liters)),
    displayLabel: `${fuelName}말통(${formatLiterTextFixed2(liters)}L/${formatLiterTextFixed2(cap)}L)`,
    optionLabel: '주유소 보관 말통'
  }, ...baseOptions];
}
