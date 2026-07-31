import React from 'react';
import { storageSlotLabelOf } from './storageSlotModel';
import WarehouseHarvestSlotCardFrame from './WarehouseHarvestSlotCardFrame';

export default function WarehouseHarvestSlotPanel({
  className = '',
  slotCount,
  slotRows,
  palletImageSrc,
  activeFacilityStorageKey,
  visibleLayerBySlot,
  selectedTransportRow,
  selectedTransportCanMovePallet,
  selectedTransportHasPalletOnDock = false,
  selectedTransportIndividualCarryLimit = 0,
  selectedTransportCanStackPallet,
  openHarvestDetail,
  editHarvestPalletMemo,
  setVisibleLayerBySlot,
  openHarvestPalletMovePicker,
  pickIndividualHarvestBoxToTransport,
  pickIndividualTransportDockHarvestBoxToTransport = null,
  pickIndividualHarvestBoxToSelectedTransportDock = null,
  openHarvestPalletUnloadPicker,
  openHarvestPalletLoadPicker,
  harvestMoveActive = false,
  chooseHarvestMoveTarget = null,
  pendingHarvestMoveTarget = null,
  movingHarvestPreviewSource,
  movingHarvestPreviewBoxCount = 0,
  movingHarvestPreviewFilledBoxCount = 0,
  movingHarvestPreviewCarriesWholePallet = false,
  selectedTransportMode = 'pallet',
  harvestBoxesPerPallet,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxFilledAt,
  harvestPalletVisibleFilledSlotsAfterPreview,
  harvestPalletBoxToneAt,
  harvestBoxTooltipBySlot = {},
  individualFillAnimBySlot = {},
  storageToneClassName = '',
  animateSlotShell = true,
  renderSlotOverlayBadges = null,
  renderSlotManualContent = null,
  alwaysShowSlotManualContent = false,
  suppressMemoButton = false,
}) {
  return (
    <div className={`warehouse-harvest-slot-panel ${className}`.trim()}>
      <div className="warehouse-harvest-slot-panel__head">
        <strong>저장공간</strong>
        <span>{`총 ${slotCount.toLocaleString()}칸`}</span>
      </div>
      {slotRows.length ? (
        <div className="warehouse-harvest-slot-grid">
          {slotRows.map((slot) => {
            const slotLabel = storageSlotLabelOf('harvest', slot.slotNo, { oneBased: true });
            const overlayBadgeContent = typeof renderSlotOverlayBadges === 'function'
              ? renderSlotOverlayBadges(slot, { slotLabel })
              : null;
            const manualContentOverride = typeof renderSlotManualContent === 'function'
              ? renderSlotManualContent(slot, { slotLabel })
              : undefined;
            return (
              <WarehouseHarvestSlotCardFrame
                key={`warehouse-harvest-slot-${slot.slotNo}`}
                slotNo={slot.slotNo}
                slotLabel={slotLabel}
                slotEntry={slot}
                activeFacilityStorageKey={activeFacilityStorageKey}
                palletImageSrc={palletImageSrc}
                visibleLayerBySlot={visibleLayerBySlot}
                selectedTransportRow={selectedTransportRow}
                selectedTransportCanMovePallet={selectedTransportCanMovePallet}
                selectedTransportHasPalletOnDock={selectedTransportHasPalletOnDock}
                selectedTransportIndividualCarryLimit={selectedTransportIndividualCarryLimit}
                selectedTransportCanStackPallet={selectedTransportCanStackPallet}
                openHarvestDetail={openHarvestDetail}
                editHarvestPalletMemo={editHarvestPalletMemo}
                setVisibleLayerBySlot={setVisibleLayerBySlot}
                openHarvestPalletMovePicker={openHarvestPalletMovePicker}
                pickIndividualHarvestBoxToTransport={pickIndividualHarvestBoxToTransport}
                pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
                pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
                openHarvestPalletUnloadPicker={openHarvestPalletUnloadPicker}
                openHarvestPalletLoadPicker={openHarvestPalletLoadPicker}
                harvestMoveActive={harvestMoveActive}
                chooseHarvestMoveTarget={chooseHarvestMoveTarget}
                pendingHarvestMoveTarget={pendingHarvestMoveTarget}
                movingHarvestPreviewSource={movingHarvestPreviewSource}
                movingHarvestPreviewBoxCount={movingHarvestPreviewBoxCount}
                movingHarvestPreviewFilledBoxCount={movingHarvestPreviewFilledBoxCount}
                movingHarvestPreviewCarriesWholePallet={movingHarvestPreviewCarriesWholePallet}
                selectedTransportMode={selectedTransportMode}
                harvestBoxesPerPallet={harvestBoxesPerPallet}
                harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
                harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
                harvestPalletVisibleFilledSlotsAfterPreview={harvestPalletVisibleFilledSlotsAfterPreview}
                harvestPalletBoxToneAt={harvestPalletBoxToneAt}
                harvestBoxTooltipBySlot={harvestBoxTooltipBySlot}
                individualFillAnimBySlot={individualFillAnimBySlot}
                animateSlotShell={animateSlotShell}
                storageToneClassName={storageToneClassName}
                overlayBadgeContent={overlayBadgeContent}
                suppressMemoButton={suppressMemoButton}
                onManualLoad={() => openHarvestPalletLoadPicker(slot.slotNo)}
                onManualUnload={() => openHarvestPalletUnloadPicker(slot.slotNo)}
                canManualLoad={Boolean(slot?.canLoad)}
                manualContentOverride={manualContentOverride}
                alwaysShowManualContent={alwaysShowSlotManualContent}
              />
            );
          })}
        </div>
      ) : (
        <div className="warehouse-harvest-slot-empty">사용 가능한 수확물 저장공간이 없습니다.</div>
      )}
    </div>
  );
}
