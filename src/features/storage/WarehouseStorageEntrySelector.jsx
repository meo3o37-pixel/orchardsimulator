import React from 'react';

export default function WarehouseStorageEntrySelector({
  preserveSelectedCarrier = false,
  entryTab,
  setEntryTab,
  entryPanelClassName,
  onEntryPanelAnimationEnd,
  selectableWarehouseRows,
  stripColdStorageIconName,
  openSelectedFieldWarehouseStorageModal,
  selectedTotalParkingCapacity,
  selectedFieldParkingSlots,
  resolveMachineInstanceById,
  isForkliftMachineLike,
  validateFacilityStorageMachineLoad,
  selectedCarrier,
  selectedTransportRow,
  selectedCarrierId,
  fieldParkingSlotZoneLabel,
  selectedField,
  selectedOpenParkingCapacity,
  machineImageSrcOfParkingState,
  game,
  machineDisplayNameWithRentTag,
  openShopItemDetailModal,
  executeFacilityStorageMachineLoad,
  closeFacilityStorageModal,
  parkingRowsOverride = null,
  parkingOnly = false,
  embedded = false,
  emptyParkingMessage = '',
}) {
  const parkingMode = parkingOnly || String(entryTab || 'parking') === 'parking';
  const parkingRows = Array.isArray(parkingRowsOverride)
    ? parkingRowsOverride
    : Array.from({ length: Math.max(0, selectedTotalParkingCapacity) }, (_, idx) => {
      const slotNo = idx + 1;
      const instanceId = selectedFieldParkingSlots[idx] || '';
      const machine = instanceId ? resolveMachineInstanceById(instanceId) : null;
      return {
        key: `parking-slot:${slotNo}`,
        slotNo,
        parkingSlotNo: slotNo,
        machine,
        machineInstanceId: String(machine?.id || ''),
        slotZoneLabel: fieldParkingSlotZoneLabel(selectedField, slotNo),
        isProtectedSlot: slotNo > selectedOpenParkingCapacity,
        imageSrc: machine ? machineImageSrcOfParkingState(machine, game) : '',
        name: machine
          ? String(machine?.item?.name || machineDisplayNameWithRentTag(machine) || `P${slotNo}`)
          : `P${slotNo}`,
      };
    });

  return (
    <>
      <div className="confirm-modal__title">
        {parkingMode ? '적재 장비 선택' : '창고 선택'}
      </div>
      <div className="confirm-modal__desc">
        {parkingMode
          ? '적재할 장비를 선택해 주세요.'
          : '적재함을 관리하려면 먼저 확인할 창고를 선택해 주세요.'}
      </div>
      {!parkingOnly ? (
        <div className="focus-tabs warehouse-storage-entry-tabs" style={{ marginTop: 10, marginBottom: 10 }}>
          <button
            type="button"
            className={`focus-tab focus-tab--farm-main-animate ${entryTab === 'warehouse' ? 'focus-tab--active' : ''}`.trim()}
            onClick={() => setEntryTab('warehouse')}
          >
            창고
          </button>
          <button
            type="button"
            className={`focus-tab focus-tab--farm-main-animate ${entryTab === 'parking' ? 'focus-tab--active' : ''}`.trim()}
            onClick={() => setEntryTab('parking')}
          >
            주차칸
          </button>
        </div>
      ) : null}
      <div className="facility-storage-entry-modal__body">
        <div
          className={`${entryPanelClassName} map-transfer-vehicle-list ${parkingMode ? 'warehouse-storage-entry-list--parking' : ''}`.trim()}
          style={{ marginTop: 0 }}
          onAnimationEnd={onEntryPanelAnimationEnd}
        >
          {!parkingMode ? (
            selectableWarehouseRows.length ? (
              selectableWarehouseRows.map((row) => {
                const facilityKey = String(row?.key || '');
                const imageSrc = String(row?.imageSrc || '');
                const isGreenWarehouse = facilityKey.startsWith('panelWarehouse') || facilityKey.startsWith('goodsWarehouse');
                return (
                  <button
                    key={`facility-storage-select-${row.key}`}
                    type="button"
                    className={`map-transfer-vehicle-card warehouse-storage-entry-warehouse-card ${imageSrc ? 'warehouse-storage-entry-warehouse-card--has-image' : ''} ${isGreenWarehouse ? 'is-green-warehouse' : ''} ${row.isColdStorage && row.coldEnabled ? 'is-cold-on' : ''}`.trim()}
                    onClick={() => openSelectedFieldWarehouseStorageModal(row.key, preserveSelectedCarrier)}
                  >
                    {imageSrc ? (
                      <span className="warehouse-storage-entry-warehouse-card__image" aria-hidden="true">
                        <img src={imageSrc} alt="" loading="lazy" />
                      </span>
                    ) : null}
                    <span className="warehouse-storage-entry-warehouse-card__body">
                      <span className="map-transfer-vehicle-card__head">
                        <strong>{stripColdStorageIconName(row.name)}</strong>
                        {row.isColdStorage ? <span>{`냉장 ${row.coldStatusLabel || 'OFF'}`}</span> : null}
                      </span>
                      <span className="map-transfer-vehicle-card__meta">
                        {`보관량 ${row.usedKg.toLocaleString()} / ${row.capacityKg.toLocaleString()}kg`}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="empty-box" style={{ marginTop: 2 }}>
                현재 토지에서 사용할 창고 시설이 없습니다.
              </div>
            )
          ) : (
            parkingRows.length > 0 ? (
              <div className="warehouse-storage-entry-parking-grid">
                {parkingRows.map((parkingRow, idx) => {
                  const slotNo = Math.max(0, Number(parkingRow?.parkingSlotNo ?? parkingRow?.slotNo) || 0);
                  const machine = parkingRow?.machine
                    || (parkingRow?.machineInstanceId ? resolveMachineInstanceById(String(parkingRow.machineInstanceId)) : null);
                  const machineItem = machine?.item || null;
                  const payloadKg = Math.max(0, Number(machineItem?.payloadKg) || 0);
                  const hasPayload = Boolean(machine && payloadKg > 0 && !isForkliftMachineLike(machine));
                  const loadValidation = machine
                    ? validateFacilityStorageMachineLoad(machine, selectedCarrier, selectedTransportRow)
                    : { ok: false, reason: '' };
                  const isForklift = Boolean(machine && isForkliftMachineLike(machine));
                  const isSelectedCarrier = Boolean(
                    hasPayload && String(machine?.id || '') === String(selectedCarrierId || '')
                  );
                  const isSelectedTransport = Boolean(
                    machine
                    && selectedTransportRow
                    && selectedTransportRow.sourceType === 'machine'
                    && String(selectedTransportRow?.machine?.id || '') === String(machine?.id || '')
                  );
                  const canUseLoadButton = Boolean(machine && !isSelectedCarrier && !isSelectedTransport);
                  const canDirectLoad = Boolean(canUseLoadButton && selectedCarrier && selectedTransportRow && loadValidation.ok);
                  const isUnavailable = Boolean(
                    canUseLoadButton
                    && selectedCarrier
                    && selectedTransportRow
                    && !loadValidation.ok
                  );
                  const zoneLabel = String(parkingRow?.slotZoneLabel || fieldParkingSlotZoneLabel(selectedField, slotNo));
                  const isProtectedSlot = Boolean(parkingRow?.isProtectedSlot ?? (slotNo > selectedOpenParkingCapacity));
                  const machineBgImage = String(parkingRow?.imageSrc || (machine ? machineImageSrcOfParkingState(machine, game) : ''));
                  const label = machine
                    ? String(parkingRow?.name || machineItem?.name || machineDisplayNameWithRentTag(machine) || `P${slotNo || idx + 1}`)
                    : `P${slotNo || idx + 1}`;
                  return (
                    <div
                      key={String(parkingRow?.displayKey || parkingRow?.key || `facility-storage-entry-slot-${slotNo || idx + 1}`)}
                      className={`option-card parking-slot-card warehouse-storage-entry-slot-card ${machineBgImage ? 'parking-slot-card--with-machine-bg' : ''} ${isForklift ? 'warehouse-storage-entry-slot-card--forklift' : ''} ${isUnavailable ? 'is-unavailable' : ''} ${(isSelectedCarrier || isSelectedTransport) ? 'is-selected' : ''}`.trim()}
                      style={machineBgImage ? { ['--parking-machine-bg']: `url("${machineBgImage}")` } : undefined}
                    >
                      <button
                        type="button"
                        className={`control-slot-empty parking-slot-button is-active ${isProtectedSlot ? 'is-available' : 'is-openfield'} ${machine ? 'is-occupied' : ''} ${(isSelectedCarrier || isSelectedTransport) ? 'is-selected' : ''}`.trim()}
                        disabled={!machine}
                        onClick={() => {
                          if (!machine || !machineItem) return;
                          openShopItemDetailModal(
                            machineItem,
                            String(machineItem?.category || 'machine'),
                            {
                              viewOnly: true,
                              machineInstanceId: String(machine?.id || ''),
                              parkingSlotNo: slotNo,
                            }
                          );
                        }}
                        title={machine ? '장비 상세정보를 확인합니다.' : '빈 주차칸'}
                      >
                        <span className="parking-slot-badge-wrap">
                          <span className={`parking-slot-badge parking-slot-badge--left ${isProtectedSlot ? 'is-protected' : 'is-openfield'}`.trim()}>
                            {zoneLabel}
                          </span>
                          <span className="parking-slot-badge parking-slot-badge--right">
                            {`P${slotNo || idx + 1}`}
                          </span>
                        </span>
                      </button>
                      <div className="warehouse-storage-entry-slot-card__name">
                        {label}
                      </div>
                      {isUnavailable ? (
                        <div className="warehouse-storage-entry-slot-card__status is-unavailable">적재불가</div>
                      ) : null}
                      {isSelectedCarrier ? (
                        <div className="warehouse-storage-entry-slot-card__status is-selected">선택된 적재함</div>
                      ) : null}
                      {!isSelectedCarrier && isSelectedTransport ? (
                        <div className="warehouse-storage-entry-slot-card__status is-selected">선택된 운반기구</div>
                      ) : null}
                      {canUseLoadButton ? (
                        <button
                          type="button"
                          className="button button--primary button--compact facility-workbench-install-button warehouse-storage-entry-slot-card__action"
                          disabled={!canDirectLoad}
                          onClick={() => executeFacilityStorageMachineLoad(machine)}
                          title={canDirectLoad ? '이 장비를 적재합니다.' : String(loadValidation.reason || '')}
                        >
                          적재
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-box" style={{ marginTop: 2 }}>
                {emptyParkingMessage || '현재 표시할 차량이 없습니다.'}
              </div>
            )
          )}
        </div>
        {parkingMode ? (
          <div className="confirm-modal__desc" style={{ marginTop: 10 }}>
            {selectedCarrier && selectedTransportRow
              ? '적재 가능한 장비 카드의 적재 버튼을 눌러 주세요.'
              : ''}
          </div>
        ) : null}
        {!embedded ? (
          <div className="footer-actions facility-storage-entry-modal__footer" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="button button--ghost" onClick={closeFacilityStorageModal}>닫기</button>
          </div>
        ) : null}
      </div>
    </>
  );
}
