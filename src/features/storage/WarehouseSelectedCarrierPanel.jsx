import React from 'react';
import WarehouseSharedHarvestSlotCard from './WarehouseSharedHarvestSlotCard';

function buildHarvestBoxFillAnimMetaMap(fillAnimEntry = null) {
  const tick = Math.max(0, Math.floor(Number(fillAnimEntry?.tick) || 0));
  if (tick <= 0) return new Map();
  const visualSlotNos = Array.isArray(fillAnimEntry?.visualSlotNos)
    ? fillAnimEntry.visualSlotNos
        .map((value) => Math.max(0, Math.floor(Number(value) || 0)))
        .filter((value, index, array) => value > 0 && array.indexOf(value) === index)
    : [];
  return visualSlotNos.reduce((acc, visualSlotNo, index) => {
    acc.set(visualSlotNo, {
      tick,
      order: index,
    });
    return acc;
  }, new Map());
}

export default function WarehouseSelectedCarrierPanel({
  selectedCarrier,
  personalCarrierId,
  isForkliftMachineLike,
  selectedCarrierPalletSlotRows,
  carrierViewTab,
  setCarrierViewTab,
  carrierViewPanelClassName,
  onCarrierViewPanelAnimationEnd,
  machineDisplayNameWithRentTag,
  durabilityToneClass,
  equipmentDurabilityOf,
  game,
  selectedCarrierCurrentLoadKg,
  selectedCarrierRecommendedLoadKg,
  selectedCarrierLoadBand,
  selectedCarrierLoadBlocked,
  carrierOnlyMode,
  carrierCargoRows,
  harvestCargoRows,
  itemMetaByKey,
  itemNameByKey,
  activeFacilityStorageKey,
  selectedTransportRow,
  facilityUnloadQtyByKey,
  setFacilityUnloadQtyByKey,
  moveCarrierItemToStorage,
  moveCarrierHarvestToStorage,
  moveCarrierItemToCarrierOnlyTarget,
  carrierPalletFootprintUsageSummaryOfMachine,
  carrierPalletVisibleLayerBySlot,
  setCarrierPalletVisibleLayerBySlot,
  harvestPalletFilledBoxCount,
  harvestPalletLoadLabel,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxFilledAt,
  harvestPalletVisibleFilledSlotsAfterPreview,
  harvestPalletBoxToneAt,
  harvestBoxTooltipBySlot = {},
  individualFillAnimBySlot = {},
  harvestBoxesPerPallet,
  palletItemImageSrc,
  openHarvestDetail,
  editHarvestPalletMemo = null,
  harvestDetailSource,
  harvestDetailSlotNo,
  harvestDetailLayer,
  harvestAvailablePalletQty,
  loadEmptyPalletToCarrierSlot,
  unloadEmptyPalletFromCarrierSlot,
  loadCarrierEmptyPalletToSelectedTransportDock = null,
  selectedTransportHasPalletOnDock = false,
  selectedTransportCanStackPallet,
  selectedTransportCanMovePallet,
  selectedTransportIndividualCarryLimit = 0,
  selectedTransportMode,
  loadCarrierHarvestPalletToSelectedTransportDock = null,
  pickIndividualCarrierHarvestBoxToTransport,
  pickIndividualTransportDockHarvestBoxToTransport = null,
  pickIndividualHarvestBoxToSelectedTransportDock = null,
  harvestMoveActive,
  harvestMoveCargoTarget,
  harvestMovePalletTargetRowsBySlot,
  chooseHarvestMoveTargetFromCarrier,
  pendingHarvestMoveTarget = null,
  movingHarvestPreviewSource,
  movingHarvestPreviewBoxCount = 0,
  movingHarvestPreviewFilledBoxCount = 0,
  movingHarvestPreviewDockAvailableBoxCount = 0,
  movingHarvestPreviewCarriesWholePallet = false,
  selectedCarrierLoadedMachineRows,
  machineImageSrcOfParkingState,
  unloadLoadedMachineFromCarrier,
  setSelectedCarrierId,
  closeFacilityStorageModal,
}) {
  const selectedCarrierId = String(selectedCarrier?.id || '');
  const isPersonalCarrier = selectedCarrierId === personalCarrierId;
  const selectedCarrierType = String(selectedCarrier?.item?.type || '');
  const isPassengerCarrier = selectedCarrierType === 'passenger';
  const supportsCarrierPalletTab = !isPersonalCarrier
    && !isPassengerCarrier
    && !isForkliftMachineLike(selectedCarrier)
    && selectedCarrierPalletSlotRows.length > 0;
  const supportsCarrierMachineTab = !isPersonalCarrier
    && !isPassengerCarrier
    && !isForkliftMachineLike(selectedCarrier)
    && Math.max(0, Number(selectedCarrier?.item?.payloadKg) || 0) > 0;
  const activeCarrierViewTab = (
    carrierViewTab === 'pallet' && supportsCarrierPalletTab
  ) || (
    carrierViewTab === 'machine' && supportsCarrierMachineTab
  )
    ? carrierViewTab
    : 'cargo';
  const displayCargoRows = [...(harvestCargoRows || []), ...(carrierCargoRows || [])];
  const movingSourceType = String(movingHarvestPreviewSource?.sourceType || '');
  const movingSourceVehicleInstanceId = String(movingHarvestPreviewSource?.sourceVehicleInstanceId || '');
  const movingSourceSlotNo = Math.max(0, Math.floor(Number(movingHarvestPreviewSource?.sourceVehiclePalletSlotNo) || 0));
  const movingSourceLayerKey = String(movingHarvestPreviewSource?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
  const isIndividualTransportMode = String(selectedTransportMode || 'pallet') === 'individual';
  const selectedTransportToolKey = String(selectedTransportRow?.toolKey || '').trim();
  const isSelectedTransportPalletJack = selectedTransportToolKey === 'palletJack';
  const harvestMoveActionLabel = isIndividualTransportMode ? '결합' : '놓기';
  const pendingTargetType = String(pendingHarvestMoveTarget?.targetType || '');
  const pendingTargetVehicleInstanceId = String(
    pendingHarvestMoveTarget?.targetVehicleInstanceId
    || pendingHarvestMoveTarget?.vehicleInstanceId
    || ''
  );
  const pendingTargetVehiclePalletSlotNo = Math.max(
    0,
    Math.floor(
      Number(
        pendingHarvestMoveTarget?.targetVehiclePalletSlotNo
        || pendingHarvestMoveTarget?.vehiclePalletSlotNo
        || 0
      ) || 0
    )
  );
  const palletUsageSummary = carrierPalletFootprintUsageSummaryOfMachine(selectedCarrier);
  const currentLoadKgText = `${Math.max(0, Math.round(Number(selectedCarrierCurrentLoadKg) || 0)).toLocaleString()}kg`;
  const recommendedLoadKgText = `${Math.max(0, Math.round(Number(selectedCarrierRecommendedLoadKg) || 0)).toLocaleString()}kg`;
  const overloadToneClass = selectedCarrierLoadBlocked
    ? 'storage-card__title-inline-meta--overload-blocked'
    : selectedCarrierLoadBand === 'heavy'
      ? 'storage-card__title-inline-meta--overload-heavy'
      : selectedCarrierLoadBand === 'medium'
        ? 'storage-card__title-inline-meta--overload-medium'
        : selectedCarrierLoadBand === 'light'
          ? 'storage-card__title-inline-meta--overload-light'
          : '';
  const overloadLabel = selectedCarrierLoadBlocked
    ? '과적 한도 초과'
    : selectedCarrierLoadBand === 'heavy'
      ? '심한 과적'
      : selectedCarrierLoadBand === 'medium'
        ? '중과적'
        : selectedCarrierLoadBand === 'light'
          ? '경과적'
          : '';
  const selectedCarrierBgImageSrc = selectedCarrierId
    ? String(machineImageSrcOfParkingState(selectedCarrier, game) || '')
    : '';
  return (
    <div
      className="warehouse-storage-modal-vehicle-list warehouse-storage-modal-vehicle-list--selected"
      style={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        maxHeight: 'none',
      }}
    >
      <div
        className="storage-card"
      >
        <div className="storage-card__head">
          <strong>
            {isPersonalCarrier ? '개인소지품' : machineDisplayNameWithRentTag(selectedCarrier)}
            {!isPersonalCarrier ? (
              <span className={`storage-card__title-inline-meta ${durabilityToneClass(equipmentDurabilityOf(game, selectedCarrier?.machineKey))}`}>
                {`내구도 ${equipmentDurabilityOf(game, selectedCarrier?.machineKey).toFixed(1)}%`}
              </span>
            ) : null}
          </strong>
          {!isForkliftMachineLike(selectedCarrier) ? (
            <span className={`storage-card__title-inline-meta ${overloadToneClass}`.trim()}>
              {`현재 ${currentLoadKgText} / 권장 ${recommendedLoadKgText}`}
              {overloadLabel ? ` · ${overloadLabel}` : ''}
            </span>
          ) : null}
        </div>
      </div>
      {carrierOnlyMode ? (
        <div className="storage-card__meta" style={{ marginTop: 6 }}>
              {isPersonalCarrier
                ? '개인소지품에서 탑승 차량으로 옮길 수 있습니다.'
                : '탑승 차량에서 개인소지품으로 옮길 수 있습니다.'}
        </div>
      ) : null}
      {(supportsCarrierPalletTab || supportsCarrierMachineTab) ? (
        <div className="focus-tabs warehouse-storage-carrier-tabs" style={{ marginTop: 2 }}>
          <button
            type="button"
            className={`focus-tab focus-tab--farm-main-animate ${activeCarrierViewTab === 'cargo' ? 'focus-tab--active' : ''}`.trim()}
            onClick={() => setCarrierViewTab('cargo')}
          >
            {isPersonalCarrier ? '가방' : '일반 적재함'}
          </button>
          {supportsCarrierPalletTab ? (
            <button
              type="button"
              className={`focus-tab focus-tab--farm-main-animate ${activeCarrierViewTab === 'pallet' ? 'focus-tab--active' : ''}`.trim()}
              onClick={() => setCarrierViewTab('pallet')}
            >
              수확물
            </button>
          ) : null}
          {supportsCarrierMachineTab ? (
            <button
              type="button"
              className={`focus-tab focus-tab--farm-main-animate ${activeCarrierViewTab === 'machine' ? 'focus-tab--active' : ''}`.trim()}
              onClick={() => setCarrierViewTab('machine')}
            >
              장비자리
            </button>
          ) : null}
        </div>
      ) : null}
      <div
        className={`${carrierViewPanelClassName} warehouse-selected-carrier-view-panel ${selectedCarrierBgImageSrc ? 'parking-slot-card--with-machine-bg' : ''}`.trim()}
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...(selectedCarrierBgImageSrc ? { ['--parking-machine-bg']: `url("${selectedCarrierBgImageSrc}")` } : {}),
        }}
        onAnimationEnd={onCarrierViewPanelAnimationEnd}
      >
        {activeCarrierViewTab === 'cargo' ? (
          <div className="warehouse-storage-carrier-cargo-pane">
            {!carrierOnlyMode && harvestMoveActive && harvestMoveCargoTarget ? (
              <div className="warehouse-storage-modal-list warehouse-storage-modal-list--plain warehouse-storage-modal-list--carrier-cargo-target" style={{ marginTop: 6 }}>
                <div className="warehouse-storage-modal-list__row warehouse-storage-modal-list__row--harvest-move-target">
                  <div style={{ display: 'grid', gap: 2 }}>
                    <strong>수확물 적재하기</strong>
                    <span className="storage-card__meta">
                      선택한 수확물을 이 차량 일반 적재함에 바로 싣습니다.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="button button--compact button--primary facility-workbench-install-button"
                    onClick={() => chooseHarvestMoveTargetFromCarrier(harvestMoveCargoTarget)}
                    disabled={!harvestMoveCargoTarget?.canChoose}
                    title={harvestMoveCargoTarget?.canChoose ? '선택한 수확물을 차량 일반 적재함에 적재합니다.' : String(harvestMoveCargoTarget?.blockReason || '현재 선택 상태로는 차량 일반 적재함에 적재할 수 없습니다.')}
                  >
                    {harvestMoveActionLabel}
                  </button>
                </div>
              </div>
            ) : null}
            <div className="warehouse-storage-carrier-cargo-scroll">
            {displayCargoRows.length ? (
              <div className="warehouse-storage-modal-list warehouse-storage-modal-list--plain warehouse-storage-modal-list--carrier-cargo-scroll" style={{ marginTop: 6 }}>
                {displayCargoRows.map((row) => {
                  const meta = itemMetaByKey?.[row.itemKey] || {};
                  const unit = String(meta?.unit || '개');
                  const weightKg = Math.max(0, Number(meta?.weightKg) || 0);
                  const durable = Boolean(meta?.durable);
                  const durability = durable ? equipmentDurabilityOf(game, row.itemKey) : null;
                  const rowKey = String(row?.rowKey || row.itemKey);
                  if (row?.isHarvestStoredBox) {
                    const max = Math.max(1, Number(row?.qty) || 1);
                    const raw = Math.max(1, Math.floor(Number(facilityUnloadQtyByKey[rowKey]) || 1));
                    const qtyValue = Math.min(max, raw);
                    return (
                      <div key={`carrier-cargo-${rowKey}`} className="warehouse-storage-modal-list__row">
                        <div style={{ display: 'grid', gap: 2 }}>
                          <strong>{String(row?.label || row?.cropLabel || '수확물')}</strong>
                          <span className="storage-card__meta">
                            {`${String(row?.boxText || `${Math.max(0, Number(row?.qty) || 0).toLocaleString()}박스`)} · ${String(row?.detailText || '수확물 적재중')}${Number(row?.totalKg) > 0 ? ` · 총 ${Math.round(Number(row.totalKg)).toLocaleString()}kg` : ''}`}
                          </span>
                        </div>
                        <div className="warehouse-storage-carrier-cargo-row__actions">
                          {!carrierOnlyMode && Boolean(activeFacilityStorageKey) ? (
                            <>
                              <input
                                className="text-input shop-buy-qty-input"
                                style={{ width: 64, height: 34, padding: '0 8px', textAlign: 'center' }}
                                type="number"
                                min={1}
                                max={max}
                                value={qtyValue}
                                onChange={(e) => {
                                  const next = Math.max(1, Math.min(max, Math.floor(Number(e.target.value) || 1)));
                                  setFacilityUnloadQtyByKey((prev) => ({ ...(prev || {}), [rowKey]: next }));
                                }}
                              />
                              <button
                                type="button"
                                className="button button--ghost button--compact facility-workbench-install-button"
                                onClick={() => moveCarrierHarvestToStorage(row, qtyValue)}
                              >
                                빼기
                              </button>
                            </>
                          ) : null}
                          <span className="warehouse-storage-carrier-cargo-row__qty">{String(row?.boxText || `${Math.max(0, Number(row?.qty) || 0).toLocaleString()}박스`)}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={`carrier-cargo-${rowKey}`} className="warehouse-storage-modal-list__row">
                      <div style={{ display: 'grid', gap: 2 }}>
                        <strong>{row.label || itemNameByKey[row.itemKey] || row.itemKey}</strong>
                        <span className="storage-card__meta">
                          {`무게 ${weightKg > 0 ? `${weightKg}kg/${unit}` : '-'}${weightKg > 0 ? ` · 총 ${(weightKg * Math.max(0, Number(row.qty) || 0)).toFixed(1)}kg` : ''}${durable && Number.isFinite(Number(durability)) ? ` · 내구도 ${Number(durability).toFixed(1)}%` : ''}`}
                        </span>
                      </div>
                      <div className="warehouse-storage-carrier-cargo-row__actions">
                        {!carrierOnlyMode && Boolean(activeFacilityStorageKey) ? (
                          <>
                            <input
                              className="text-input shop-buy-qty-input"
                              style={{ width: 64, height: 34, padding: '0 8px', textAlign: 'center' }}
                              type="number"
                              min={1}
                              max={Math.max(1, Number(row?.qty) || 1)}
                              value={(() => {
                                const max = Math.max(1, Number(row?.qty) || 1);
                                const raw = Math.max(1, Math.floor(Number(facilityUnloadQtyByKey[rowKey]) || 1));
                                return Math.min(max, raw);
                              })()}
                              onChange={(e) => {
                                const raw = Math.floor(Number(e.target.value) || 1);
                                const max = Math.max(1, Number(row?.qty) || 1);
                                const next = Math.max(1, Math.min(max, raw));
                                setFacilityUnloadQtyByKey((prev) => ({ ...(prev || {}), [rowKey]: next }));
                              }}
                            />
                            <button
                              type="button"
                              className="button button--ghost button--compact facility-workbench-install-button"
                              disabled={!selectedTransportRow}
                              title={!selectedTransportRow ? '운반기구를 먼저 선택해 주세요.' : ''}
                              onClick={() => moveCarrierItemToStorage(row, facilityUnloadQtyByKey[rowKey] || 1)}
                            >
                              빼기
                            </button>
                          </>
                        ) : null}
                        {carrierOnlyMode ? (
                          <>
                            <input
                              className="text-input shop-buy-qty-input"
                              style={{ width: 64, height: 34, padding: '0 8px', textAlign: 'center' }}
                              type="number"
                              min={1}
                              max={Math.max(1, Number(row?.qty) || 1)}
                              value={(() => {
                                const max = Math.max(1, Number(row?.qty) || 1);
                                const raw = Math.max(1, Math.floor(Number(facilityUnloadQtyByKey[rowKey]) || 1));
                                return Math.min(max, raw);
                              })()}
                              onChange={(e) => {
                                const raw = Math.floor(Number(e.target.value) || 1);
                                const max = Math.max(1, Number(row?.qty) || 1);
                                const next = Math.max(1, Math.min(max, raw));
                                setFacilityUnloadQtyByKey((prev) => ({ ...(prev || {}), [rowKey]: next }));
                              }}
                            />
                            <button
                              type="button"
                              className="button button--ghost button--compact facility-workbench-install-button"
                              onClick={() => moveCarrierItemToCarrierOnlyTarget(row, facilityUnloadQtyByKey[rowKey] || 1)}
                            >
                              옮기기
                            </button>
                          </>
                        ) : null}
                        <span className="warehouse-storage-carrier-cargo-row__qty">{`${row.qty}${unit}`}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-box" style={{ marginTop: 6 }}>
                {isPersonalCarrier ? '현재 가방에 들어있는 짐이 없습니다.' : '현재 차량 일반 적재함에 적재된 짐이 없습니다.'}
              </div>
            )}
            </div>
          </div>
        ) : null}
        {activeCarrierViewTab === 'pallet' && supportsCarrierPalletTab ? (
          <div className="warehouse-storage-carrier-pane-scroll">
            <div className="warehouse-harvest-slot-panel warehouse-harvest-slot-panel--carrier-side" style={{ marginTop: 8 }}>
              <div className="warehouse-harvest-slot-panel__head">
                <strong>저장공간</strong>
                <span>{`총 ${selectedCarrierPalletSlotRows.length.toLocaleString()}칸`}</span>
              </div>
              {selectedCarrierPalletSlotRows.length ? (
                <div className="warehouse-harvest-slot-grid warehouse-harvest-slot-grid--transport-side warehouse-harvest-slot-grid--carrier-side">
                  {selectedCarrierPalletSlotRows.map((slot) => {
                  const visibleLayerStateKey = `${selectedCarrierId}:${slot.slotNo}`;
                  const isMovingSourceSlot = movingSourceType === 'vehicle-slot'
                    && movingSourceVehicleInstanceId === selectedCarrierId
                    && movingSourceSlotNo === Number(slot.slotNo || 0);
                  const isMovingEmptyPalletSnapshotSource = isMovingSourceSlot
                    && (Boolean(movingHarvestPreviewSource?.isEmptyPallet) || Boolean(movingHarvestPreviewSource?.isEmptyPalletSnapshot));
                  const shouldBlockSelfTargetSelectionFromMovingSource = isMovingSourceSlot
                    && !isMovingEmptyPalletSnapshotSource;
                  const isMovingWholePalletSource = isMovingSourceSlot
                    && (Boolean(movingHarvestPreviewCarriesWholePallet) || !isIndividualTransportMode);
                  const movingOnlyTopLayer = isMovingWholePalletSource
                    && movingSourceLayerKey === 'top'
                    && Boolean(slot?.hasTopLayer);
                  const effectiveSlot = isMovingWholePalletSource
                    ? (
                      movingOnlyTopLayer
                        ? {
                          ...slot,
                          hasTopLayer: false,
                          topLayer: null,
                          topMemo: '',
                        }
                        : {
                          ...slot,
                          occupied: false,
                          hasTopLayer: false,
                          topLayer: null,
                          slotType: 'empty',
                          sourceLabel: '',
                          qtyKg: 0,
                          storagePalletBoxCount: 0,
                          storagePalletRemainderKg: 0,
                          filledBoxTones: [],
                          boxCount: 0,
                          bottomMemo: '',
                          topMemo: '',
                        }
                    )
                    : slot;
                  const visibleLayerKey = effectiveSlot.hasTopLayer && carrierPalletVisibleLayerBySlot?.[visibleLayerStateKey] === 'top'
                    ? 'top'
                    : 'bottom';
                  const bottomLayerEntry = effectiveSlot;
                  const topLayerEntry = effectiveSlot.topLayer || null;
                  const visibleLayerEntry = visibleLayerKey === 'top' ? topLayerEntry : bottomLayerEntry;
                  const moveTarget = harvestMovePalletTargetRowsBySlot?.[slot.slotNo] || null;
                  const isPendingMoveTarget = isIndividualTransportMode
                    && pendingTargetType === 'vehicle-slot'
                    && pendingTargetVehicleInstanceId === selectedCarrierId
                    && pendingTargetVehiclePalletSlotNo === Number(slot.slotNo || 0);
                  const canShowEmptyIndividualTargetGrid = isIndividualTransportMode
                    && Boolean(moveTarget?.canChoose)
                    && (
                      effectiveSlot.slotType === 'emptyPallet'
                    );
                  const visibleBoxCapacity = Math.max(
                    1,
                    canShowEmptyIndividualTargetGrid
                      ? 55
                      : Math.floor(Number(visibleLayerEntry?.maxBoxes || effectiveSlot?.maxBoxes || harvestBoxesPerPallet) || harvestBoxesPerPallet)
                  );
                  const shouldUseVehicleFloorGrid = effectiveSlot.isFloorStored
                    || (canShowEmptyIndividualTargetGrid && effectiveSlot.slotType === 'empty');
                  const visibleGridColumnCount = shouldUseVehicleFloorGrid ? 11 : 6;
                  const bottomFilledBoxCount = harvestPalletFilledBoxCount(bottomLayerEntry);
                  const topFilledBoxCount = harvestPalletFilledBoxCount(topLayerEntry);
                  const rawVisibleFilledBoxCount = harvestPalletFilledBoxCount(visibleLayerEntry);
                  const previewMovingBoxCount = (
                    isMovingSourceSlot
                    && isIndividualTransportMode
                    && movingSourceLayerKey === visibleLayerKey
                  )
                    ? Math.min(
                        Math.max(0, rawVisibleFilledBoxCount),
                        Math.max(0, Math.floor(Number(movingHarvestPreviewBoxCount) || 0))
                      )
                    : 0;
                  const visibleFilledSlots = previewMovingBoxCount > 0 && typeof harvestPalletVisibleFilledSlotsAfterPreview === 'function'
                    ? harvestPalletVisibleFilledSlotsAfterPreview(
                        visibleLayerEntry,
                        movingHarvestPreviewSource,
                        previewMovingBoxCount
                      )
                    : null;
                  const visibleFilledBoxCount = Array.isArray(visibleFilledSlots)
                    ? visibleFilledSlots.reduce((sum, filled) => sum + (filled ? 1 : 0), 0)
                    : Math.max(0, rawVisibleFilledBoxCount - previewMovingBoxCount);
                  const visibleLoadLabel = effectiveSlot.isFloorStored
                    ? `${Math.max(0, visibleFilledBoxCount).toLocaleString()}박스/${Math.max(0, visibleBoxCapacity).toLocaleString()}박스`
                    : `${Math.max(0, visibleFilledBoxCount).toLocaleString()}박스/${Math.max(0, Math.floor(Number(harvestBoxesPerPallet) || 0)).toLocaleString()}박스`;
                  const showHarvestSourceText = visibleFilledBoxCount <= 0;
                  const carrierSlotHintText = effectiveSlot.slotType === 'emptyPallet'
                    ? '빈 팔레트 적재됨'
                    : (effectiveSlot.slotType === 'harvest' ? '빈 팔레트 적재됨' : '');
                  const boxTooltipEntry = harvestBoxTooltipBySlot?.[slot.slotNo] || null;
                  const bottomBoxTooltips = Array.isArray(boxTooltipEntry?.bottom) ? boxTooltipEntry.bottom : [];
                  const topBoxTooltips = Array.isArray(boxTooltipEntry?.top) ? boxTooltipEntry.top : [];
                  const visibleBoxTooltips = visibleLayerKey === 'top' ? topBoxTooltips : bottomBoxTooltips;
                  const fillAnimMetaByVisualSlotNo = buildHarvestBoxFillAnimMetaMap(
                    individualFillAnimBySlot?.[`vehicle:${selectedCarrierId}:${slot.slotNo}`] || null
                  );
                  const canPickBoxesIndividually = Boolean(selectedTransportRow)
                    && isIndividualTransportMode
                    && Math.max(0, Math.floor(Number(selectedTransportIndividualCarryLimit) || 0)) > 0
                    && typeof pickIndividualCarrierHarvestBoxToTransport === 'function'
                    && effectiveSlot.slotType === 'harvest'
                    && !effectiveSlot.hasTopLayer;
                  const canReceiveBoxesFromTransportDock = false;
                  const canSendBoxesBackToTransportDock = isPendingMoveTarget
                    && isIndividualTransportMode
                    && typeof pickIndividualHarvestBoxToSelectedTransportDock === 'function';
                  const canStartIndividualVehicleTargetSelection = Boolean(selectedTransportRow)
                    && isIndividualTransportMode
                    && Boolean(moveTarget)
                    && String(moveTarget?.targetType || '') === 'vehicle-slot'
                    && !shouldBlockSelfTargetSelectionFromMovingSource
                    && !isPendingMoveTarget;
                  const shouldAlwaysShowEmptyPalletCombineButton = Boolean(selectedTransportRow)
                    && isIndividualTransportMode
                    && effectiveSlot.slotType === 'emptyPallet';
                  const shouldShowSingleLayerGrid = !effectiveSlot.hasTopLayer
                    && effectiveSlot.slotType !== 'machineBlocked'
                    && (
                      effectiveSlot.slotType !== 'emptyPallet'
                      || visibleFilledBoxCount > 0
                      || canReceiveBoxesFromTransportDock
                      || canSendBoxesBackToTransportDock
                    )
                    && (effectiveSlot.slotType !== 'empty' || canShowEmptyIndividualTargetGrid);
                  const canShowIndividualMoveTargetButton = canStartIndividualVehicleTargetSelection;
                  const isStackedPalletBlockedForSelectedTransport = Boolean(selectedTransportRow)
                    && isSelectedTransportPalletJack
                    && Boolean(effectiveSlot.hasTopLayer);
                  const hideVehiclePalletMoveButtonsForSelectedTransport = Boolean(selectedTransportRow)
                    && isSelectedTransportPalletJack
                    && !isIndividualTransportMode;
                  const canLoadHarvestPalletToSelectedTransport = Boolean(selectedTransportRow)
                    && Boolean(selectedTransportCanMovePallet)
                    && !selectedTransportHasPalletOnDock
                    && !isIndividualTransportMode
                    && !hideVehiclePalletMoveButtonsForSelectedTransport
                    && effectiveSlot.slotType === 'harvest'
                    && !effectiveSlot.isFloorStored
                    && (!effectiveSlot.hasTopLayer || !isStackedPalletBlockedForSelectedTransport)
                    && typeof loadCarrierHarvestPalletToSelectedTransportDock === 'function';
                  const canLoadEmptyPalletToSelectedTransport = Boolean(selectedTransportRow)
                    && Boolean(selectedTransportCanMovePallet)
                    && !selectedTransportHasPalletOnDock
                    && !isIndividualTransportMode
                    && !hideVehiclePalletMoveButtonsForSelectedTransport
                    && effectiveSlot.slotType === 'emptyPallet'
                    && typeof loadCarrierEmptyPalletToSelectedTransportDock === 'function';
                  const showTransportActions = (
                    canLoadHarvestPalletToSelectedTransport
                    || canLoadEmptyPalletToSelectedTransport
                  ) && !isIndividualTransportMode;
                  const hasInteractiveSingleLayerBoxes = canPickBoxesIndividually
                    || canReceiveBoxesFromTransportDock
                    || canSendBoxesBackToTransportDock
                    || canShowEmptyIndividualTargetGrid;
                  const emptyIndividualMoveTargetDisabledReason = String(
                    moveTarget?.blockReason
                    || (isIndividualTransportMode
                      ? '먼저 옮길 수확물을 선택해 주세요.'
                      : '현재 선택 상태로는 이 저장공간에 적재할 수 없습니다.')
                  );
                  const slotHoverTitle = effectiveSlot.occupied
                    ? String(visibleLayerEntry?.sourceLabel || slot.sourceLabel || '이 슬롯에는 이미 팔레트가 적재되어 있습니다.')
                    : (harvestAvailablePalletQty > 0 ? '차량에 빈 파레트 적재 가능' : '현재 토지에 적재 가능한 빈 파레트가 없습니다.');
                  const canOpenCarrierDetailByCard = effectiveSlot.occupied && !selectedTransportRow;
                  const openCarrierDetail = () => {
                    openHarvestDetail({
                      layerKey: visibleLayerKey,
                      slotNo: slot.slotNo,
                      source: {
                        type: 'vehicle',
                        vehicleInstanceId: selectedCarrierId,
                        slotNo: slot.slotNo,
                      },
                    });
                  };
                  const renderIndividualMoveTargetButton = () => (
                    <button
                      type="button"
                      className="button button--compact button--primary facility-workbench-install-button warehouse-harvest-slot-card__move-target-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        chooseHarvestMoveTargetFromCarrier(moveTarget);
                      }}
                      disabled={!moveTarget?.canChoose}
                      title={moveTarget?.canChoose ? '개별 적재한 수확물을 이 적재칸에 결합합니다.' : emptyIndividualMoveTargetDisabledReason}
                    >
                      결합
                    </button>
                  );
                  const slotLabel = `수확물 적재칸 ${slot.slotNo}`;
                  const sharedSlotEntryUnified = {
                    ...effectiveSlot,
                    occupied: effectiveSlot.slotType !== 'empty' && effectiveSlot.slotType !== 'machineBlocked',
                    hasStoredHarvest: effectiveSlot.slotType === 'harvest',
                    hasEmptyPallet: effectiveSlot.slotType === 'emptyPallet',
                    target: moveTarget,
                  };
                  const headerStatusLabel = effectiveSlot.slotType === 'harvest'
                    ? '수확물 적재중'
                    : (
                      effectiveSlot.slotType === 'emptyPallet'
                        ? '빈 팔레트 적재됨'
                        : (
                          effectiveSlot.slotType === 'machineBlocked'
                            ? '장비 적재로 사용 중'
                            : '빈 저장공간'
                        )
                    );
                  const headerNodeUnified = (
                    <>
                      <strong>{slotLabel}</strong>
                      <span className="warehouse-harvest-slot-card__status">
                        {headerStatusLabel}
                      </span>
                    </>
                  );
                  const manualContentUnified = selectedTransportRow ? null : (
                    effectiveSlot.slotType === 'empty' ? (
                      !carrierOnlyMode && harvestAvailablePalletQty > 0 ? (
                        <button
                          type="button"
                          className="button button--compact button--primary facility-workbench-install-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            loadEmptyPalletToCarrierSlot(slot.slotNo);
                          }}
                        >
                          팔레트 적재
                        </button>
                      ) : null
                    ) : (
                      effectiveSlot.slotType === 'emptyPallet' ? (
                        <button
                          type="button"
                          className="button button--compact button--primary facility-workbench-install-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            unloadEmptyPalletFromCarrierSlot(slot.slotNo);
                          }}
                        >
                          빼기
                        </button>
                      ) : null
                    )
                  );
                  return (
                    <WarehouseSharedHarvestSlotCard
                      key={`carrier-pallet-slot-${selectedCarrierId}-${slot.slotNo}`}
                      slotNo={slot.slotNo}
                      slotLabel={slotLabel}
                      slotEntry={sharedSlotEntryUnified}
                      palletImageSrc={palletItemImageSrc}
                      activeFacilityStorageKey={activeFacilityStorageKey}
                      openHarvestDetail={openHarvestDetail}
                      openDetailSource={{
                        type: 'vehicle',
                        vehicleInstanceId: selectedCarrierId,
                        slotNo: slot.slotNo,
                      }}
                      movePickerMeta={{
                        vehicleInstanceId: selectedCarrierId,
                        slotNo: slot.slotNo,
                      }}
                      selectedTransportRow={selectedTransportRow}
                      selectedTransportCanMovePallet={selectedTransportCanMovePallet}
                      selectedTransportCanStackPallet={selectedTransportCanStackPallet}
                      selectedTransportHasPalletOnDock={selectedTransportHasPalletOnDock}
                      selectedTransportIndividualCarryLimit={selectedTransportIndividualCarryLimit}
                      selectedTransportMode={selectedTransportMode}
                      harvestMoveActive={harvestMoveActive}
                      pendingHarvestMoveTarget={pendingHarvestMoveTarget}
                      chooseHarvestMoveTarget={chooseHarvestMoveTargetFromCarrier}
                      pickIndividualHarvestBoxToTransport={pickIndividualCarrierHarvestBoxToTransport}
                      pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
                      pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
                      movingHarvestPreviewSource={movingHarvestPreviewSource}
                      movingHarvestPreviewBoxCount={movingHarvestPreviewBoxCount}
                      movingHarvestPreviewFilledBoxCount={movingHarvestPreviewFilledBoxCount}
                      visibleLayerBySlot={carrierPalletVisibleLayerBySlot}
                      setVisibleLayerBySlot={setCarrierPalletVisibleLayerBySlot}
                      visibleLayerSlotKey={visibleLayerStateKey}
                      harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
                      harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
                      harvestPalletVisibleFilledSlotsAfterPreview={harvestPalletVisibleFilledSlotsAfterPreview}
                      harvestPalletBoxToneAt={harvestPalletBoxToneAt}
                      harvestBoxesPerPallet={harvestBoxesPerPallet}
                      harvestBoxTooltipBySlot={harvestBoxTooltipBySlot}
                      individualFillAnimBySlot={individualFillAnimBySlot}
                      editHarvestPalletMemo={editHarvestPalletMemo}
                      headerNode={headerNodeUnified}
                      manualContent={manualContentUnified}
                      onTransportPickHarvestPallet={loadCarrierHarvestPalletToSelectedTransportDock}
                      onTransportPickEmptyPallet={loadCarrierEmptyPalletToSelectedTransportDock}
                    />
                  );
                  if (!effectiveSlot.hasTopLayer && !effectiveSlot.isFloorStored) {
                    const slotLabel = `수확물 적재칸 ${slot.slotNo}`;
                    const sharedSlotEntry = {
                      ...effectiveSlot,
                      occupied: effectiveSlot.slotType !== 'empty' && effectiveSlot.slotType !== 'machineBlocked',
                      hasStoredHarvest: effectiveSlot.slotType === 'harvest',
                      hasEmptyPallet: effectiveSlot.slotType === 'emptyPallet',
                      target: moveTarget,
                    };
                    const manualContent = selectedTransportRow ? null : (
                      effectiveSlot.slotType === 'empty' ? (
                        !carrierOnlyMode && harvestAvailablePalletQty > 0 ? (
                          <button
                            type="button"
                            className="button button--compact button--primary facility-workbench-install-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              loadEmptyPalletToCarrierSlot(slot.slotNo);
                            }}
                          >
                            팔레트 적재
                          </button>
                        ) : null
                      ) : (
                        effectiveSlot.slotType === 'emptyPallet' ? (
                          <button
                            type="button"
                            className="button button--compact button--primary facility-workbench-install-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              unloadEmptyPalletFromCarrierSlot(slot.slotNo);
                            }}
                          >
                            빼기
                          </button>
                        ) : null
                      )
                    );
                    return (
                      <WarehouseSharedHarvestSlotCard
                        key={`carrier-pallet-slot-${selectedCarrierId}-${slot.slotNo}`}
                        slotNo={slot.slotNo}
                        slotLabel={slotLabel}
                        slotEntry={sharedSlotEntry}
                        palletImageSrc={palletItemImageSrc}
                        activeFacilityStorageKey={activeFacilityStorageKey}
                        openHarvestDetail={openHarvestDetail}
                        openDetailSource={{
                          type: 'vehicle',
                          vehicleInstanceId: selectedCarrierId,
                          slotNo: slot.slotNo,
                        }}
                        movePickerMeta={{
                          vehicleInstanceId: selectedCarrierId,
                          slotNo: slot.slotNo,
                        }}
                        selectedTransportRow={selectedTransportRow}
                        selectedTransportCanMovePallet={selectedTransportCanMovePallet}
                        selectedTransportCanStackPallet={selectedTransportCanStackPallet}
                        selectedTransportHasPalletOnDock={selectedTransportHasPalletOnDock}
                        selectedTransportIndividualCarryLimit={selectedTransportIndividualCarryLimit}
                        selectedTransportMode={selectedTransportMode}
                        harvestMoveActive={harvestMoveActive}
                        pendingHarvestMoveTarget={pendingHarvestMoveTarget}
                        chooseHarvestMoveTarget={chooseHarvestMoveTargetFromCarrier}
                        pickIndividualHarvestBoxToTransport={pickIndividualCarrierHarvestBoxToTransport}
                        pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
                        pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
                        movingHarvestPreviewSource={movingHarvestPreviewSource}
                        movingHarvestPreviewBoxCount={movingHarvestPreviewBoxCount}
                        movingHarvestPreviewFilledBoxCount={movingHarvestPreviewFilledBoxCount}
                        visibleLayerBySlot={carrierPalletVisibleLayerBySlot}
                        setVisibleLayerBySlot={setCarrierPalletVisibleLayerBySlot}
                        harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
                        harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
                        harvestPalletVisibleFilledSlotsAfterPreview={harvestPalletVisibleFilledSlotsAfterPreview}
                        harvestPalletBoxToneAt={harvestPalletBoxToneAt}
                        harvestBoxesPerPallet={harvestBoxesPerPallet}
                        harvestBoxTooltipBySlot={harvestBoxTooltipBySlot}
                        individualFillAnimBySlot={individualFillAnimBySlot}
                        editHarvestPalletMemo={editHarvestPalletMemo}
                        manualContent={manualContent}
                        onTransportPickHarvestPallet={loadCarrierHarvestPalletToSelectedTransportDock}
                        onTransportPickEmptyPallet={loadCarrierEmptyPalletToSelectedTransportDock}
                      />
                    );
                  }
                  return (
                    <div
                      key={`carrier-pallet-slot-${selectedCarrierId}-${slot.slotNo}`}
                      className={`warehouse-harvest-slot-card ${effectiveSlot.occupied ? 'warehouse-harvest-slot-card--occupied' : 'warehouse-harvest-slot-card--empty'} ${effectiveSlot.slotType !== 'empty' && !effectiveSlot.isFloorStored && palletItemImageSrc ? 'warehouse-harvest-slot-card--with-pallet-bg' : ''} ${visibleFilledBoxCount > 0 ? 'warehouse-harvest-slot-card--with-boxes' : ''} ${showTransportActions ? 'warehouse-harvest-slot-card--actionable' : ''} ${effectiveSlot.hasTopLayer ? 'warehouse-harvest-slot-card--stacked' : ''} ${!effectiveSlot.hasTopLayer && visibleFilledBoxCount > 0 ? 'warehouse-harvest-slot-card--single-layer' : ''} ${effectiveSlot.isFloorStored ? 'warehouse-harvest-slot-card--floor-stored' : ''} ${effectiveSlot.hasTopLayer && visibleLayerKey === 'top' ? 'warehouse-harvest-slot-card--view-top' : ''} ${effectiveSlot.hasTopLayer && visibleLayerKey === 'bottom' ? 'warehouse-harvest-slot-card--view-bottom' : ''} ${isMovingWholePalletSource ? 'warehouse-harvest-slot-card--moving-source' : ''} ${isPendingMoveTarget ? 'warehouse-harvest-slot-card--selected' : ''}`.trim()}
                      title={visibleFilledBoxCount > 0 ? undefined : slotHoverTitle}
                      style={effectiveSlot.slotType !== 'empty' && !effectiveSlot.isFloorStored && palletItemImageSrc ? { '--warehouse-pallet-bg': `url("${palletItemImageSrc}")` } : undefined}
                      data-harvest-move-source-id={`vehicle-slot:${selectedCarrierId}:${slot.slotNo}`}
                      role={canOpenCarrierDetailByCard ? 'button' : undefined}
                      tabIndex={canOpenCarrierDetailByCard ? 0 : undefined}
                      onClick={canOpenCarrierDetailByCard ? openCarrierDetail : undefined}
                      onKeyDown={canOpenCarrierDetailByCard ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openCarrierDetail();
                        }
                      } : undefined}
                    >
                      {effectiveSlot.hasTopLayer ? (
                        <>
                          <button
                            type="button"
                            className={`warehouse-harvest-slot-layer-toggle warehouse-harvest-slot-layer-toggle--top ${visibleLayerKey === 'top' ? 'is-active' : ''}`.trim()}
                            aria-label="2단 보기"
                            title="2단 보기"
                            onClick={(event) => {
                              event.stopPropagation();
                              setCarrierPalletVisibleLayerBySlot((prev) => ({
                                ...(prev || {}),
                                [visibleLayerStateKey]: 'top',
                              }));
                            }}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className={`warehouse-harvest-slot-layer-toggle warehouse-harvest-slot-layer-toggle--bottom ${visibleLayerKey === 'bottom' ? 'is-active' : ''}`.trim()}
                            aria-label="1단 보기"
                            title="1단 보기"
                            onClick={(event) => {
                              event.stopPropagation();
                              setCarrierPalletVisibleLayerBySlot((prev) => ({
                                ...(prev || {}),
                                [visibleLayerStateKey]: 'bottom',
                              }));
                            }}
                          >
                            ▼
                          </button>
                        </>
                      ) : null}
                      {effectiveSlot.hasTopLayer ? (
                        <div className={`warehouse-harvest-slot-stack ${hasInteractiveSingleLayerBoxes ? 'has-interactive-boxes' : ''}`.trim()} aria-hidden="true">
                          <button
                            type="button"
                            className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--bottom ${visibleLayerKey === 'bottom' ? 'is-active' : 'is-inactive'}`.trim()}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (visibleLayerKey === 'bottom') {
                                if (selectedTransportRow) return;
                                openHarvestDetail({
                                  layerKey: 'bottom',
                                  slotNo: slot.slotNo,
                                  source: {
                                    type: 'vehicle',
                                    vehicleInstanceId: selectedCarrierId,
                                    slotNo: slot.slotNo,
                                  },
                                });
                                return;
                              }
                              setCarrierPalletVisibleLayerBySlot((prev) => ({
                                ...(prev || {}),
                                [visibleLayerStateKey]: 'bottom',
                              }));
                            }}
                          >
                            <span className="warehouse-harvest-slot-layer-card__badge">1단</span>
                            {visibleLayerKey === 'bottom' ? (
                              <div className="warehouse-harvest-slot-box-grid warehouse-harvest-slot-box-grid--layer">
                                {Array.from({ length: visibleBoxCapacity }, (_, boxIndex) => {
                                  const displayBoxIndex = harvestPalletDisplayBoxIndexOf(boxIndex, visibleGridColumnCount, visibleBoxCapacity);
                                  const isFilledBox = Array.isArray(visibleFilledSlots)
                                    ? Boolean(visibleFilledSlots[displayBoxIndex])
                                    : (
                                      typeof harvestPalletBoxFilledAt === 'function'
                                        ? harvestPalletBoxFilledAt(bottomLayerEntry, displayBoxIndex)
                                        : displayBoxIndex < visibleFilledBoxCount
                                    );
                                  const canPickThisBox = canPickBoxesIndividually && isFilledBox && !effectiveSlot.hasTopLayer;
                                  const canReceiveThisBox = canReceiveBoxesFromTransportDock
                                    && displayBoxIndex >= visibleFilledBoxCount;
                                  const canSendThisBoxBackToTransport = canSendBoxesBackToTransportDock
                                    && isFilledBox;
                                  const tooltipAnchorId = `vehicle-slot-box:${selectedCarrierId}:${slot.slotNo}:bottom:${displayBoxIndex}`;
                                  const fillAnimMeta = visibleLayerKey === 'bottom'
                                    ? (fillAnimMetaByVisualSlotNo.get(displayBoxIndex + 1) || null)
                                    : null;
                                  return (
                                    <span
                                      key={`carrier-pallet-slot-${slot.slotNo}-bottom-box-${boxIndex + 1}`}
                                      tabIndex={-1}
                                      className={`warehouse-harvest-slot-box warehouse-harvest-slot-box-button ${isFilledBox ? 'is-filled' : ''} ${harvestPalletBoxToneAt(bottomLayerEntry, displayBoxIndex) === 'green' ? 'is-green' : 'is-yellow'} ${(canPickThisBox || canReceiveThisBox || canSendThisBoxBackToTransport) ? 'is-box-pickable' : ''} ${fillAnimMeta ? 'is-individual-fill-drop' : ''}`.trim()}
                                      style={fillAnimMeta ? { '--harvest-fill-drop-delay-ms': `${Math.max(0, Number(fillAnimMeta?.order) || 0) * 64}ms` } : undefined}
                                      data-harvest-move-source-id={canPickThisBox ? tooltipAnchorId : undefined}
                                      aria-label={isFilledBox ? String(bottomBoxTooltips?.[displayBoxIndex]?.text || '') : ''}
                                      title={isFilledBox ? String(bottomBoxTooltips?.[displayBoxIndex]?.text || '') : ''}
                                      onClick={canReceiveThisBox ? (event) => {
                                        event.stopPropagation();
                                        pickIndividualTransportDockHarvestBoxToTransport();
                                      } : canSendThisBoxBackToTransport ? (event) => {
                                        event.stopPropagation();
                                        const boxTooltip = bottomBoxTooltips?.[displayBoxIndex] || null;
                                        pickIndividualHarvestBoxToSelectedTransportDock({
                                          sourceType: 'vehicle-slot',
                                          sourceVehicleInstanceId: selectedCarrierId,
                                          sourceVehiclePalletSlotNo: slot.slotNo,
                                          sourceLayerKey: 'bottom',
                                          sourceVehicleFloorStored: Boolean(slot?.isFloorStored),
                                          sourceDomId: `vehicle-slot-box:${selectedCarrierId}:${slot.slotNo}:bottom:${displayBoxIndex}`,
                                          sourceVisualSlotNo: Math.max(1, Math.floor(Number(boxTooltip?.sourceVisualSlotNo || boxTooltip?.visualSlotNo) || displayBoxIndex + 1)),
                                          sourceDisplaySlotNo: displayBoxIndex + 1,
                                          sourceBatchId: String(boxTooltip?.sourceBatchId || ''),
                                          sourceBoxUnitNo: Math.max(0, Math.floor(Number(boxTooltip?.sourceBoxUnitNo) || 0)),
                                        });
                                      } : canPickThisBox ? (event) => {
                                        event.stopPropagation();
                                        pickIndividualCarrierHarvestBoxToTransport(slot.slotNo, 'bottom', `vehicle-slot-box:${selectedCarrierId}:${slot.slotNo}:bottom:${displayBoxIndex}`);
                                      } : undefined}
                                    />
                                  );
                                })}
                              </div>
                            ) : null}
                          </button>
                          <button
                            type="button"
                            className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--top ${visibleLayerKey === 'top' ? 'is-active' : 'is-inactive'}`.trim()}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (visibleLayerKey === 'top') {
                                if (selectedTransportRow) return;
                                openHarvestDetail({
                                  layerKey: 'top',
                                  slotNo: slot.slotNo,
                                  source: {
                                    type: 'vehicle',
                                    vehicleInstanceId: selectedCarrierId,
                                    slotNo: slot.slotNo,
                                  },
                                });
                                return;
                              }
                              setCarrierPalletVisibleLayerBySlot((prev) => ({
                                ...(prev || {}),
                                [visibleLayerStateKey]: 'top',
                              }));
                            }}
                          >
                            <span className="warehouse-harvest-slot-layer-card__badge">2단</span>
                            {visibleLayerKey === 'top' ? (
                              <div className="warehouse-harvest-slot-box-grid warehouse-harvest-slot-box-grid--layer">
                                {Array.from({ length: visibleBoxCapacity }, (_, boxIndex) => {
                                  const displayBoxIndex = harvestPalletDisplayBoxIndexOf(boxIndex, visibleGridColumnCount, visibleBoxCapacity);
                                  const isFilledBox = Array.isArray(visibleFilledSlots)
                                    ? Boolean(visibleFilledSlots[displayBoxIndex])
                                    : (
                                      typeof harvestPalletBoxFilledAt === 'function'
                                        ? harvestPalletBoxFilledAt(topLayerEntry, displayBoxIndex)
                                        : displayBoxIndex < visibleFilledBoxCount
                                    );
                                  const canPickThisBox = canPickBoxesIndividually && isFilledBox;
                                  const canReceiveThisBox = canReceiveBoxesFromTransportDock
                                    && displayBoxIndex >= visibleFilledBoxCount;
                                  const canSendThisBoxBackToTransport = canSendBoxesBackToTransportDock
                                    && isFilledBox;
                                  const tooltipAnchorId = `vehicle-slot-box:${selectedCarrierId}:${slot.slotNo}:top:${displayBoxIndex}`;
                                  const fillAnimMeta = visibleLayerKey === 'top'
                                    ? (fillAnimMetaByVisualSlotNo.get(displayBoxIndex + 1) || null)
                                    : null;
                                  return (
                                    <span
                                      key={`carrier-pallet-slot-${slot.slotNo}-top-box-${boxIndex + 1}`}
                                      tabIndex={-1}
                                      className={`warehouse-harvest-slot-box warehouse-harvest-slot-box-button ${isFilledBox ? 'is-filled' : ''} ${harvestPalletBoxToneAt(topLayerEntry, displayBoxIndex) === 'green' ? 'is-green' : 'is-yellow'} ${(canPickThisBox || canReceiveThisBox || canSendThisBoxBackToTransport) ? 'is-box-pickable' : ''} ${fillAnimMeta ? 'is-individual-fill-drop' : ''}`.trim()}
                                      style={fillAnimMeta ? { '--harvest-fill-drop-delay-ms': `${Math.max(0, Number(fillAnimMeta?.order) || 0) * 64}ms` } : undefined}
                                      data-harvest-move-source-id={canPickThisBox ? tooltipAnchorId : undefined}
                                      aria-label={isFilledBox ? String(topBoxTooltips?.[displayBoxIndex]?.text || '') : ''}
                                      title={isFilledBox ? String(topBoxTooltips?.[displayBoxIndex]?.text || '') : ''}
                                      onClick={canReceiveThisBox ? (event) => {
                                        event.stopPropagation();
                                        pickIndividualTransportDockHarvestBoxToTransport();
                                      } : canSendThisBoxBackToTransport ? (event) => {
                                        event.stopPropagation();
                                        const boxTooltip = topBoxTooltips?.[displayBoxIndex] || null;
                                        pickIndividualHarvestBoxToSelectedTransportDock({
                                          sourceType: 'vehicle-slot',
                                          sourceVehicleInstanceId: selectedCarrierId,
                                          sourceVehiclePalletSlotNo: slot.slotNo,
                                          sourceLayerKey: 'top',
                                          sourceVehicleFloorStored: Boolean(slot?.isFloorStored),
                                          sourceDomId: `vehicle-slot-box:${selectedCarrierId}:${slot.slotNo}:top:${displayBoxIndex}`,
                                          sourceVisualSlotNo: Math.max(1, Math.floor(Number(boxTooltip?.sourceVisualSlotNo || boxTooltip?.visualSlotNo) || displayBoxIndex + 1)),
                                          sourceDisplaySlotNo: displayBoxIndex + 1,
                                          sourceBatchId: String(boxTooltip?.sourceBatchId || ''),
                                          sourceBoxUnitNo: Math.max(0, Math.floor(Number(boxTooltip?.sourceBoxUnitNo) || 0)),
                                        });
                                      } : canPickThisBox ? (event) => {
                                        event.stopPropagation();
                                        pickIndividualCarrierHarvestBoxToTransport(slot.slotNo, 'top', `vehicle-slot-box:${selectedCarrierId}:${slot.slotNo}:top:${displayBoxIndex}`);
                                      } : undefined}
                                    />
                                  );
                                })}
                              </div>
                            ) : null}
                          </button>
                          {effectiveSlot.occupied && visibleLoadLabel ? (
                            <span className="warehouse-harvest-slot-card__load-label">
                              {String(visibleLoadLabel || '').split(' + ')[0] || visibleLoadLabel}
                            </span>
                          ) : null}
                        </div>
                      ) : (shouldShowSingleLayerGrid ? null : (
                        <>
                          <strong>{`수확물 적재칸 ${slot.slotNo}`}</strong>
                          <span className="warehouse-harvest-slot-card__status">
                            {effectiveSlot.slotType === 'harvest'
                              ? '수확물 적재중'
                              : (effectiveSlot.slotType === 'emptyPallet'
                                ? '빈 팔레트'
                                : (slot.slotType === 'machineBlocked' ? '장비 적재로 사용 중' : '적재칸'))}
                          </span>
                        </>
                      ))}
                      {shouldShowSingleLayerGrid ? (
                        <div className="warehouse-harvest-slot-stack" aria-hidden="true">
                          <div
                            key={`carrier-pallet-slot-${slot.slotNo}-${visibleLayerKey}`}
                            className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--single is-active ${shouldUseVehicleFloorGrid ? 'warehouse-harvest-slot-layer-card--floor' : ''}`.trim()}
                          >
                            {shouldUseVehicleFloorGrid ? null : (
                              <span className="warehouse-harvest-slot-layer-card__badge">{visibleLayerKey === 'top' ? '2단' : '1단'}</span>
                            )}
                            <div className={`warehouse-harvest-slot-box-grid ${shouldUseVehicleFloorGrid ? 'warehouse-harvest-slot-box-grid--vehicle-floor' : ''}`.trim()}>
                              {Array.from({ length: visibleBoxCapacity }, (_, boxIndex) => {
                                const displayBoxIndex = harvestPalletDisplayBoxIndexOf(boxIndex, visibleGridColumnCount, visibleBoxCapacity);
                                const isFilledBox = Array.isArray(visibleFilledSlots)
                                  ? Boolean(visibleFilledSlots[displayBoxIndex])
                                  : (
                                    typeof harvestPalletBoxFilledAt === 'function'
                                      ? harvestPalletBoxFilledAt(visibleLayerEntry, displayBoxIndex)
                                      : displayBoxIndex < visibleFilledBoxCount
                                  );
                                const canPickThisBox = canPickBoxesIndividually && isFilledBox;
                                const canChooseThisBoxTarget = false;
                                const canReceiveThisBox = canReceiveBoxesFromTransportDock
                                  && displayBoxIndex >= visibleFilledBoxCount;
                                const canSendThisBoxBackToTransport = canSendBoxesBackToTransportDock
                                  && isFilledBox;
                                const boxDomId = `vehicle-slot-box:${selectedCarrierId}:${slot.slotNo}:${visibleLayerKey}:${displayBoxIndex}`;
                                const fillAnimMeta = fillAnimMetaByVisualSlotNo.get(displayBoxIndex + 1) || null;
                                return (
                                  <span
                                    key={`carrier-pallet-slot-${slot.slotNo}-box-${boxIndex + 1}`}
                                    tabIndex={-1}
                                    className={`warehouse-harvest-slot-box warehouse-harvest-slot-box-button ${isFilledBox ? 'is-filled' : ''} ${harvestPalletBoxToneAt(visibleLayerEntry, displayBoxIndex) === 'green' ? 'is-green' : 'is-yellow'} ${(canPickThisBox || canChooseThisBoxTarget || canReceiveThisBox || canSendThisBoxBackToTransport) ? 'is-box-pickable' : ''} ${fillAnimMeta ? 'is-individual-fill-drop' : ''}`.trim()}
                                    style={fillAnimMeta ? { '--harvest-fill-drop-delay-ms': `${Math.max(0, Number(fillAnimMeta?.order) || 0) * 64}ms` } : undefined}
                                    data-harvest-move-source-id={canPickThisBox ? boxDomId : undefined}
                                    aria-label={isFilledBox ? String(visibleBoxTooltips?.[displayBoxIndex]?.text || '') : ''}
                                    title={isFilledBox ? String(visibleBoxTooltips?.[displayBoxIndex]?.text || '') : ''}
                                    onClick={canReceiveThisBox ? (event) => {
                                      event.stopPropagation();
                                      pickIndividualTransportDockHarvestBoxToTransport();
                                    } : canSendThisBoxBackToTransport ? (event) => {
                                      event.stopPropagation();
                                      const boxTooltip = visibleBoxTooltips?.[displayBoxIndex] || null;
                                      pickIndividualHarvestBoxToSelectedTransportDock({
                                        sourceType: 'vehicle-slot',
                                        sourceVehicleInstanceId: selectedCarrierId,
                                        sourceVehiclePalletSlotNo: slot.slotNo,
                                        sourceLayerKey: visibleLayerKey,
                                        sourceVehicleFloorStored: Boolean(effectiveSlot?.isFloorStored),
                                        sourceDomId: `vehicle-slot-box:${selectedCarrierId}:${slot.slotNo}:${visibleLayerKey}:${displayBoxIndex}`,
                                        sourceVisualSlotNo: Math.max(1, Math.floor(Number(boxTooltip?.sourceVisualSlotNo || boxTooltip?.visualSlotNo) || displayBoxIndex + 1)),
                                        sourceDisplaySlotNo: displayBoxIndex + 1,
                                        sourceBatchId: String(boxTooltip?.sourceBatchId || ''),
                                        sourceBoxUnitNo: Math.max(0, Math.floor(Number(boxTooltip?.sourceBoxUnitNo) || 0)),
                                      });
                                    } : canPickThisBox ? (event) => {
                                      event.stopPropagation();
                                      pickIndividualCarrierHarvestBoxToTransport(slot.slotNo, visibleLayerKey, `vehicle-slot-box:${selectedCarrierId}:${slot.slotNo}:${visibleLayerKey}:${displayBoxIndex}`);
                                    } : undefined}
                                  />
                                );
                              })}
                            </div>
                          </div>
                          {effectiveSlot.occupied && visibleLoadLabel ? (
                            <span className="warehouse-harvest-slot-card__load-label">
                              {String(visibleLoadLabel || '').split(' + ')[0] || visibleLoadLabel}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      {canShowIndividualMoveTargetButton
                        && effectiveSlot.slotType !== 'empty'
                        && effectiveSlot.slotType !== 'emptyPallet'
                        ? renderIndividualMoveTargetButton()
                        : null}
                      {canLoadHarvestPalletToSelectedTransport ? (
                        <button
                          type="button"
                          className="button button--compact button--primary facility-workbench-install-button warehouse-harvest-slot-card__move-target-button"
                          title="현재 선택한 운반기구로 이 팔레트를 들어 옮깁니다."
                          onClick={(event) => {
                            event.stopPropagation();
                            loadCarrierHarvestPalletToSelectedTransportDock(slot.slotNo, visibleLayerKey);
                          }}
                        >
                          들기
                        </button>
                      ) : null}
                      {canLoadEmptyPalletToSelectedTransport ? (
                        <button
                          type="button"
                          className="button button--compact button--primary facility-workbench-install-button warehouse-harvest-slot-card__move-target-button"
                          title="현재 선택한 운반기구로 이 빈 팔레트를 들어 옮깁니다."
                          onClick={(event) => {
                            event.stopPropagation();
                            loadCarrierEmptyPalletToSelectedTransportDock(slot.slotNo);
                          }}
                        >
                          들기
                        </button>
                      ) : null}
                      {effectiveSlot.slotType === 'empty' ? (
                        harvestMoveActive || canStartIndividualVehicleTargetSelection ? (
                          (() => {
                            const moveTarget = harvestMovePalletTargetRowsBySlot?.[slot.slotNo] || null;
                            if (isIndividualTransportMode) {
                              return canShowIndividualMoveTargetButton ? renderIndividualMoveTargetButton() : (
                                <span className="disabled-tip" title={emptyIndividualMoveTargetDisabledReason}>
                                  <button
                                    type="button"
                                    className="button button--compact button--primary facility-workbench-install-button"
                                    disabled
                                  >
                                    {harvestMoveActionLabel}
                                  </button>
                                </span>
                              );
                            }
                            if (hideVehiclePalletMoveButtonsForSelectedTransport) {
                              return null;
                            }
                            return (
                              <button
                                type="button"
                                className="button button--compact button--primary facility-workbench-install-button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  chooseHarvestMoveTargetFromCarrier(moveTarget);
                                }}
                                disabled={!moveTarget?.canChoose}
                                title={moveTarget?.canChoose ? '선택한 수확물을 이 저장공간에 적재합니다.' : '현재 선택 상태로는 이 저장공간에 적재할 수 없습니다.'}
                              >
                                {harvestMoveActionLabel}
                              </button>
                            );
                          })()
                        ) : !carrierOnlyMode && !selectedTransportRow && harvestAvailablePalletQty > 0 ? (
                          <button
                            type="button"
                            className="button button--compact button--primary facility-workbench-install-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              loadEmptyPalletToCarrierSlot(slot.slotNo);
                            }}
                          >
                            팔레트 적재
                          </button>
                        ) : !carrierOnlyMode && !selectedTransportRow ? (
                          <span className="disabled-tip" title="현재 토지에 적재 가능한 빈 파레트가 없습니다.">
                            <button
                              type="button"
                              className="button button--compact button--primary facility-workbench-install-button"
                              disabled
                            >
                              팔레트 적재
                            </button>
                          </span>
                        ) : null
                      ) : null}
                      {effectiveSlot.slotType === 'emptyPallet' ? (
                        harvestMoveActive || canStartIndividualVehicleTargetSelection || shouldAlwaysShowEmptyPalletCombineButton ? (
                          (() => {
                            const moveTarget = harvestMovePalletTargetRowsBySlot?.[slot.slotNo] || null;
                            if (isIndividualTransportMode) {
                              return shouldAlwaysShowEmptyPalletCombineButton ? renderIndividualMoveTargetButton() : (
                                <span className="disabled-tip" title={emptyIndividualMoveTargetDisabledReason}>
                                  <button
                                    type="button"
                                    className="button button--compact button--primary facility-workbench-install-button"
                                    disabled
                                  >
                                    {harvestMoveActionLabel}
                                  </button>
                                </span>
                              );
                            }
                            if (hideVehiclePalletMoveButtonsForSelectedTransport) {
                              return null;
                            }
                            return (
                              <button
                                type="button"
                                className="button button--compact button--primary facility-workbench-install-button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  chooseHarvestMoveTargetFromCarrier(moveTarget);
                                }}
                                disabled={!moveTarget?.canChoose}
                                title={moveTarget?.canChoose ? '선택한 수확물을 이 빈 팔레트에 적재합니다.' : '현재 선택 상태로는 이 빈 팔레트에 적재할 수 없습니다.'}
                              >
                                {harvestMoveActionLabel}
                              </button>
                            );
                          })()
                        ) : !selectedTransportRow ? (
                          <button
                            type="button"
                            className="button button--compact button--primary facility-workbench-install-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              unloadEmptyPalletFromCarrierSlot(slot.slotNo);
                            }}
                          >
                            빼기
                          </button>
                        ) : null
                      ) : null}
                      {isPendingMoveTarget || selectedTransportRow ? null : (effectiveSlot.occupied && showHarvestSourceText && carrierSlotHintText ? (
                        <span className="meter__hint">{carrierSlotHintText}</span>
                      ) : null)}
                    </div>
                  );
                  })}
                </div>
              ) : (
                <div className="empty-box" style={{ marginTop: 6 }}>
                  이 차량은 파레트 적재 슬롯이 없습니다.
                </div>
              )}
            </div>
          </div>
        ) : null}
        {activeCarrierViewTab === 'machine' && supportsCarrierMachineTab ? (
          <div className="warehouse-storage-carrier-pane-scroll">
            <div className="warehouse-harvest-slot-panel warehouse-harvest-slot-panel--carrier-machine-side" style={{ marginTop: 8 }}>
              <div className="warehouse-harvest-slot-panel__head">
                <strong>장비자리</strong>
                <span>{`${selectedCarrierLoadedMachineRows.length.toLocaleString()}대 · ${palletUsageSummary.usedMachineSlots.toLocaleString()}칸 사용`}</span>
              </div>
              {(() => {
              const totalMachineSlots = Math.max(0, Number(palletUsageSummary.totalMachineSlots) || 0);
              if (totalMachineSlots <= 0) {
                return (
                  <div className="empty-box" style={{ marginTop: 6 }}>
                    현재 차량 장비자리를 사용할 수 없습니다.
                  </div>
                );
              }
              const machineSlotEntries = [];
              selectedCarrierLoadedMachineRows.forEach((row) => {
                const slotUseCount = Math.max(1, Math.floor(Number(row.machineSlotCount) || 1));
                for (let partIndex = 0; partIndex < slotUseCount && machineSlotEntries.length < totalMachineSlots; partIndex += 1) {
                  machineSlotEntries.push({
                    type: 'machine',
                    row,
                    partIndex,
                    slotNo: machineSlotEntries.length + 1,
                  });
                }
              });
              while (machineSlotEntries.length < totalMachineSlots) {
                machineSlotEntries.push({
                  type: 'empty',
                  slotNo: machineSlotEntries.length + 1,
                });
              }
              return (
                <div className="warehouse-storage-machine-slot-grid warehouse-storage-machine-slot-grid--carrier-side">
                  {machineSlotEntries.map((entry, entryIndex) => {
                    if (entry.type === 'empty') {
                      return (
                        <div
                          key={`carrier-machine-empty-slot-${selectedCarrierId}-${entry.slotNo}`}
                          className="warehouse-storage-machine-slot-card warehouse-storage-machine-slot-card--empty"
                        >
                          <strong>{`J${entry.slotNo}`}</strong>
                          <span>빈 장비 자리</span>
                        </div>
                      );
                    }
                    const row = entry.row;
                    const machineImageSrc = machineImageSrcOfParkingState(row.machine, game);
                    const isHeadSlot = entry.partIndex === 0;
                    return (
                      <div
                        key={`carrier-loaded-machine-${row.key}-slot-${entryIndex + 1}`}
                        className={`warehouse-storage-machine-slot-card warehouse-storage-machine-slot-card--occupied ${isHeadSlot ? 'is-head' : 'is-tail'}`.trim()}
                      >
                        <div className="warehouse-storage-machine-slot-card__slotno">{`J${entry.slotNo}`}</div>
                        {isHeadSlot ? (
                          <>
                            <div className="warehouse-storage-machine-slot-card__head">
                              <strong>{machineDisplayNameWithRentTag(row.machine)}</strong>
                              <span>{`${row.machineSlotCount}칸`}</span>
                            </div>
                            {machineImageSrc ? (
                              <div className="warehouse-storage-machine-slot-card__image">
                                <img src={machineImageSrc} alt={machineDisplayNameWithRentTag(row.machine)} loading="lazy" />
                              </div>
                            ) : null}
                            <div className="storage-card__meta">
                              {`중량 ${row.weightKg.toLocaleString()}kg · ${row.loadMethod === 'forklift' ? '지게차 적재' : '운반 사다리 적재'}`}
                            </div>
                            <div className="footer-actions" style={{ marginTop: 8, justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="button button--ghost button--compact"
                                onClick={() => unloadLoadedMachineFromCarrier(row.key)}
                              >
                                하차
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <strong>{machineDisplayNameWithRentTag(row.machine)}</strong>
                            <span>장비 사용</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
              })()}
            </div>
          </div>
        ) : null}
      </div>
      {!carrierOnlyMode ? (
        <div
          className="footer-actions"
          style={{ marginTop: 'auto', paddingTop: 12, paddingBottom: 2, justifyContent: 'flex-end' }}
        >
          {Boolean(activeFacilityStorageKey) && carrierCargoRows.length && activeCarrierViewTab === 'cargo' ? (
            <button
              className="button button--ghost facility-workbench-install-button"
              disabled={!selectedTransportRow}
              title={!selectedTransportRow ? '운반기구를 먼저 선택해 주세요.' : ''}
              onClick={() => {
                carrierCargoRows.forEach((row) => {
                  const qty = Math.max(1, Math.floor(Number(row?.qty) || 1));
                  moveCarrierItemToStorage(row, qty);
                });
              }}
            >
              모두빼기
            </button>
          ) : null}
          <button className="button button--ghost day-transition-animate-button" onClick={() => setSelectedCarrierId('')}>
            {isPersonalCarrier ? '가방 선택' : '적재함 선택'}
          </button>
        </div>
      ) : (
        <div
          className="footer-actions"
          style={{ marginTop: 'auto', paddingTop: 12, paddingBottom: 2, justifyContent: 'flex-end' }}
        >
          <button className="button button--ghost" onClick={closeFacilityStorageModal}>닫기</button>
        </div>
      )}
    </div>
  );
}
