import React from 'react';
import MapTransferFooterActions from './MapTransferFooterActions';
import MapTransferPanelHeader from './MapTransferPanelHeader';
import MapTransferVehicleArea from './MapTransferVehicleArea';

export default function MapTransferPlaceholderModal({
  docked = false,
  paymentDocked = false,
  paymentEntering = false,
  paymentClosing = false,
  mapLocationModal,
  mapShopTempStorageKeys,
  mapShopIsPaymentShifted,
  fuelKioskStep,
  mapTransferSelectedCarrier,
  mapTransferPersonalCarrierId,
  isCombustionMachineItem,
  machineFuelKeyFromType,
  fuelKioskLastReceipt,
  machineTankCapacityLitersOfItem,
  machineFuelLitersOfInstance,
  game,
  mapTransferSelectedCarrierCurrentLoadKg,
  mapTransferSelectedCarrierPayloadKg,
  mapTransferParkedCarrierRows,
  mapTransferSelectedCarrierId,
  setMapTransferSelectedCarrierId,
  formatLiterTextFixed2,
  machineFuelTypeLabelOf,
  machineImageSrcOf,
  setFuelKioskDirectTargetCarrierId,
  setFuelKioskKey,
  setFuelKioskCanKey,
  setFuelKioskSelectedCanLabelOverride,
  setFuelKioskCanPickerOpen,
  setFuelKioskFuelingDone,
  setFuelKioskBorrowedCan,
  mapTransferSelectedCarrierCargoRows,
  mapTransferCarrierCargoRows,
  itemMetaByKey,
  itemNameByKey,
  moveCarrierCargoRowToShopCart,
  formatLiterText,
  containerCapacityLitersOfItem,
  parseCapacityLitersFromText,
  normalizeFuelStorageByContainer,
  fuelCanSplitByGroupSource,
  clamp,
  floorLitersToStep,
  fuelItemNameMap,
  normalizeFuelContainerKey,
  fuelKioskAvailableCanOptions,
  fuelKioskBorrowedCan,
  fuelKioskCanKey,
  stageFuelCanToKiosk,
  setMapShopExitAnimating,
  returnToMapShop,
  closeMapLocationModal
}) {
  const isFuelStationMapModal = mapLocationModal.open && String(mapLocationModal.key || '') === 'fuelStation';
  const isTempStorageView = mapLocationModal.open
    && mapLocationModal.view === 'pickup'
    && mapShopTempStorageKeys.has(String(mapLocationModal.key || ''));
  const isTransferPanelOpen = mapShopIsPaymentShifted || isFuelStationMapModal || isTempStorageView;
  const isFuelCanDirectSelectMode = isFuelStationMapModal && fuelKioskStep === 'confirm';
  const selectedCarrierIsMachine = mapTransferSelectedCarrier && mapTransferSelectedCarrier?.id !== mapTransferPersonalCarrierId;
  const selectedCarrierCanDirectRefuel = selectedCarrierIsMachine
    ? Boolean(isCombustionMachineItem(mapTransferSelectedCarrier?.item))
    : false;
  const selectedCarrierRequiredFuelKey = selectedCarrierCanDirectRefuel
    ? String(machineFuelKeyFromType(mapTransferSelectedCarrier?.item?.fuelType) || '')
    : '';
  const selectedCarrierActiveFuelKey = String(fuelKioskLastReceipt?.fuelKey || '');
  const selectedCarrierFuelTypeMismatch = Boolean(
    selectedCarrierCanDirectRefuel
    && selectedCarrierRequiredFuelKey
    && selectedCarrierActiveFuelKey
    && selectedCarrierRequiredFuelKey !== selectedCarrierActiveFuelKey
  );
  const selectedCarrierTankCapacity = selectedCarrierCanDirectRefuel
    ? Math.max(0, machineTankCapacityLitersOfItem(mapTransferSelectedCarrier?.item))
    : 0;
  const selectedCarrierTankCurrent = selectedCarrierCanDirectRefuel
    ? Math.max(0, machineFuelLitersOfInstance(game, mapTransferSelectedCarrier?.id, mapTransferSelectedCarrier?.item))
    : 0;

  const transferPanelBody = (
    <div className={`map-transfer-panel ${docked ? 'map-transfer-panel--docked' : ''}`.trim()}>
      <MapTransferPanelHeader
        mapTransferSelectedCarrier={mapTransferSelectedCarrier}
        mapTransferPersonalCarrierId={mapTransferPersonalCarrierId}
        mapShopIsPaymentShifted={mapShopIsPaymentShifted}
        currentLoadKg={mapTransferSelectedCarrierCurrentLoadKg}
        payloadKg={mapTransferSelectedCarrierPayloadKg}
        machineImageSrcOf={machineImageSrcOf}
      />
      <div className="map-transfer-center-icon" aria-hidden>
        <svg viewBox="0 0 24 24" role="presentation">
          <path d="M4.2 10.3h7.1v4.7H4.2z" />
          <path d="M12.6 11.1h4v3.9h-4z" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="15.8" cy="18" r="1.6" />
        </svg>
      </div>
      <MapTransferVehicleArea
        mapTransferParkedCarrierRows={mapTransferParkedCarrierRows}
        mapTransferSelectedCarrier={mapTransferSelectedCarrier}
        mapTransferSelectedCarrierId={mapTransferSelectedCarrierId}
        setMapTransferSelectedCarrierId={setMapTransferSelectedCarrierId}
        machineImageSrcOf={machineImageSrcOf}
        isFuelStationMapModal={isFuelStationMapModal}
        mapTransferPersonalCarrierId={mapTransferPersonalCarrierId}
        selectedCarrierCanDirectRefuel={selectedCarrierCanDirectRefuel}
        selectedCarrierTankCurrent={selectedCarrierTankCurrent}
        selectedCarrierTankCapacity={selectedCarrierTankCapacity}
        formatLiterTextFixed2={formatLiterTextFixed2}
        selectedCarrierFuelTypeMismatch={selectedCarrierFuelTypeMismatch}
        machineFuelTypeLabelOf={machineFuelTypeLabelOf}
        setFuelKioskDirectTargetCarrierId={setFuelKioskDirectTargetCarrierId}
        machineFuelKeyFromType={machineFuelKeyFromType}
        setFuelKioskKey={setFuelKioskKey}
        setFuelKioskCanKey={setFuelKioskCanKey}
        setFuelKioskSelectedCanLabelOverride={setFuelKioskSelectedCanLabelOverride}
        setFuelKioskCanPickerOpen={setFuelKioskCanPickerOpen}
        setFuelKioskFuelingDone={setFuelKioskFuelingDone}
        setFuelKioskBorrowedCan={setFuelKioskBorrowedCan}
        mapTransferSelectedCarrierCargoRows={mapTransferSelectedCarrierCargoRows}
        isFuelCanDirectSelectMode={isFuelCanDirectSelectMode}
        mapTransferCarrierCargoRows={mapTransferCarrierCargoRows}
        itemMetaByKey={itemMetaByKey}
        itemNameByKey={itemNameByKey}
        moveCarrierCargoRowToShopCart={moveCarrierCargoRowToShopCart}
        formatLiterText={formatLiterText}
        containerCapacityLitersOfItem={containerCapacityLitersOfItem}
        parseCapacityLitersFromText={parseCapacityLitersFromText}
        normalizeFuelStorageByContainer={normalizeFuelStorageByContainer}
        game={game}
        fuelCanSplitByGroupSource={fuelCanSplitByGroupSource}
        clamp={clamp}
        floorLitersToStep={floorLitersToStep}
        fuelItemNameMap={fuelItemNameMap}
        normalizeFuelContainerKey={normalizeFuelContainerKey}
        fuelKioskAvailableCanOptions={fuelKioskAvailableCanOptions}
        fuelKioskBorrowedCan={fuelKioskBorrowedCan}
        fuelKioskCanKey={fuelKioskCanKey}
        stageFuelCanToKiosk={stageFuelCanToKiosk}
      />
      <MapTransferFooterActions
        mapTransferSelectedCarrier={mapTransferSelectedCarrier}
        setMapTransferSelectedCarrierId={setMapTransferSelectedCarrierId}
        setMapShopExitAnimating={setMapShopExitAnimating}
        returnToMapShop={returnToMapShop}
        closeMapLocationModal={closeMapLocationModal}
      />
    </div>
  );

  if (docked || paymentDocked) {
    return (
      <div className={`map-transfer-docked ${paymentDocked ? 'map-transfer-docked--payment' : ''} ${paymentEntering ? 'is-payment-entering' : ''} ${paymentClosing ? 'is-closing' : ''} ${mapTransferSelectedCarrier ? 'is-linked' : ''}`.trim()}>
        {transferPanelBody}
      </div>
    );
  }
  return (
    <div
      className={`confirm-modal confirm-modal--map-transfer-placeholder ${isTransferPanelOpen ? 'is-open' : ''} ${mapTransferSelectedCarrier ? 'is-linked' : ''} ${isTempStorageView ? 'is-temp-storage-view' : ''}`.trim()}
    >
      {transferPanelBody}
    </div>
  );
}
