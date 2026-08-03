import React from 'react';
import MapTransferCargoList from './MapTransferCargoList';
import MapTransferCarrierSelectorList from './MapTransferCarrierSelectorList';
import MapTransferFuelDirectCard from './MapTransferFuelDirectCard';

export default function MapTransferVehicleArea({
  mapTransferParkedCarrierRows,
  mapTransferSelectedCarrier,
  mapTransferSelectedCarrierId,
  setMapTransferSelectedCarrierId,
  machineImageSrcOf,
  isFuelStationMapModal,
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
  setFuelKioskBorrowedCan,
  mapTransferSelectedCarrierCargoRows,
  isFuelCanDirectSelectMode,
  mapTransferCarrierCargoRows,
  itemMetaByKey,
  itemNameByKey,
  moveCarrierCargoRowToShopCart,
  formatLiterText,
  containerCapacityLitersOfItem,
  parseCapacityLitersFromText,
  normalizeFuelStorageByContainer,
  game,
  fuelCanSplitByGroupSource,
  clamp,
  floorLitersToStep,
  fuelItemNameMap,
  normalizeFuelContainerKey,
  fuelKioskAvailableCanOptions,
  fuelKioskBorrowedCan,
  fuelKioskCanKey,
  stageFuelCanToKiosk,
  toolImageSrcOf
}) {
  const selectedCarrierId = String(mapTransferSelectedCarrier?.id || '');
  const isPersonalCarrier = selectedCarrierId === mapTransferPersonalCarrierId;
  const isEquippedBagCarrier = selectedCarrierId === '__equipped_bag__'
    || String(mapTransferSelectedCarrier?.machineKey || '') === 'equippedBag';
  const selectedCarrierLabel = isPersonalCarrier
    ? '개인소지품'
    : isEquippedBagCarrier
      ? '가방'
      : '선택한 적재함';
  if (!mapTransferParkedCarrierRows.length) {
    return (
      <div className="empty-box" style={{ minHeight: 120 }}>
        이 지점 주차칸에 적재 가능한 차량이 없습니다.
      </div>
    );
  }
  return (
    <div className="map-transfer-vehicle-list">
      {!mapTransferSelectedCarrier ? (
        <MapTransferCarrierSelectorList
          mapTransferParkedCarrierRows={mapTransferParkedCarrierRows}
          mapTransferSelectedCarrierId={mapTransferSelectedCarrierId}
          setMapTransferSelectedCarrierId={setMapTransferSelectedCarrierId}
          machineImageSrcOf={machineImageSrcOf}
        />
      ) : null}
      {mapTransferSelectedCarrier ? (
        <>
          {isFuelStationMapModal ? (
            <MapTransferFuelDirectCard
              mapTransferSelectedCarrier={mapTransferSelectedCarrier}
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
            />
          ) : null}
          {mapTransferSelectedCarrierCargoRows.length ? (
            <div className="map-transfer-cargo-list">
              <MapTransferCargoList
                mapTransferSelectedCarrierCargoRows={mapTransferSelectedCarrierCargoRows}
                isFuelCanDirectSelectMode={isFuelCanDirectSelectMode}
                mapTransferCarrierCargoRows={mapTransferCarrierCargoRows}
                itemMetaByKey={itemMetaByKey}
                itemNameByKey={itemNameByKey}
                moveCarrierCargoRowToShopCart={moveCarrierCargoRowToShopCart}
                formatLiterText={formatLiterText}
                formatLiterTextFixed2={formatLiterTextFixed2}
                containerCapacityLitersOfItem={containerCapacityLitersOfItem}
                parseCapacityLitersFromText={parseCapacityLitersFromText}
                mapTransferSelectedCarrier={mapTransferSelectedCarrier}
                normalizeFuelStorageByContainer={normalizeFuelStorageByContainer}
                game={game}
                fuelCanSplitByGroupSource={fuelCanSplitByGroupSource}
                clamp={clamp}
                floorLitersToStep={floorLitersToStep}
                fuelItemNameMap={fuelItemNameMap}
                machineFuelTypeLabelOf={machineFuelTypeLabelOf}
                normalizeFuelContainerKey={normalizeFuelContainerKey}
                fuelKioskAvailableCanOptions={fuelKioskAvailableCanOptions}
                fuelKioskBorrowedCan={fuelKioskBorrowedCan}
                fuelKioskCanKey={fuelKioskCanKey}
                stageFuelCanToKiosk={stageFuelCanToKiosk}
                setFuelKioskDirectTargetCarrierId={setFuelKioskDirectTargetCarrierId}
                toolImageSrcOf={toolImageSrcOf}
              />
            </div>
          ) : (
            <div className="empty-box">{`${selectedCarrierLabel}이 비어 있습니다.`}</div>
          )}
        </>
      ) : (
        <div className="empty-box" />
      )}
    </div>
  );
}
