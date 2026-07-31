import React from 'react';
import WarehouseSharedHarvestSlotCard from './WarehouseSharedHarvestSlotCard';

function buildDefaultHeaderNode(slotLabel, effectiveSlot) {
  const occupied = Boolean(effectiveSlot?.occupied);
  const isFloorStored = Boolean(effectiveSlot?.isFloorStored);
  const hasStoredHarvest = Boolean(effectiveSlot?.hasStoredHarvest ?? effectiveSlot?.isHarvestStored);
  const isSortingCargoSlot = Boolean(effectiveSlot?.isSortingCargoSlot);
  const isWorkbenchCargoSlot = Boolean(effectiveSlot?.isWorkbenchCargoSlot);
  const emptySlotLabel = isSortingCargoSlot
    ? '빈 선별기 적재칸'
    : (
      isWorkbenchCargoSlot
        ? '빈 작업대 적재칸'
        : '빈 저장공간'
    );
  const statusLabel = occupied
    ? (
      isFloorStored
        ? '바닥 적재중'
        : (hasStoredHarvest ? '수확물 적재중' : '빈 팔레트 적재됨')
    )
    : emptySlotLabel;
  return (
    <>
      <strong>{slotLabel}</strong>
      <span className="warehouse-harvest-slot-card__status">{statusLabel}</span>
    </>
  );
}

export default function WarehouseHarvestSlotCardFrame({
  slotNo = 0,
  slotLabel = '',
  slotEntry = null,
  activeFacilityStorageKey = '',
  palletImageSrc = '',
  visibleLayerBySlot = {},
  selectedTransportRow = null,
  selectedTransportCanMovePallet = false,
  selectedTransportHasPalletOnDock = false,
  selectedTransportIndividualCarryLimit = 0,
  selectedTransportCanStackPallet = false,
  openHarvestDetail = null,
  editHarvestPalletMemo = null,
  setVisibleLayerBySlot = null,
  openHarvestPalletMovePicker = null,
  pickIndividualHarvestBoxToTransport = null,
  pickIndividualTransportDockHarvestBoxToTransport = null,
  pickIndividualHarvestBoxToSelectedTransportDock = null,
  openHarvestPalletUnloadPicker = null,
  openHarvestPalletLoadPicker = null,
  harvestMoveActive = false,
  chooseHarvestMoveTarget = null,
  pendingHarvestMoveTarget = null,
  movingHarvestPreviewSource = null,
  movingHarvestPreviewBoxCount = 0,
  movingHarvestPreviewFilledBoxCount = 0,
  movingHarvestPreviewCarriesWholePallet = false,
  selectedTransportMode = 'pallet',
  harvestBoxesPerPallet = 0,
  harvestPalletDisplayBoxIndexOf = null,
  harvestPalletBoxFilledAt = null,
  harvestPalletVisibleFilledSlotsAfterPreview = null,
  harvestPalletBoxToneAt = null,
  harvestBoxTooltipBySlot = {},
  individualFillAnimBySlot = {},
  animateSlotShell = true,
  cardClassName = '',
  storageToneClassName = '',
  overlayBadgeContent = null,
  openDetailSource = null,
  movePickerMeta = null,
  visibleLayerSlotKey = null,
  headerNode = null,
  onManualLoad = null,
  onManualUnload = null,
  canManualLoad = false,
  showDisabledManualLoad = false,
  manualLoadDisabledReason = '',
  hideLoadLabel = false,
  manualContentOverride = undefined,
  alwaysShowManualContent = false,
  suppressMemoButton = false,
}) {
  const normalizedSlotNo = Math.max(0, Math.floor(Number(slotNo) || 0));
  const movingSourceType = String(movingHarvestPreviewSource?.sourceType || '');
  const movingSourceSlotNo = Math.max(0, Math.floor(Number(movingHarvestPreviewSource?.sourceSlotNo) || 0));
  const movingSourceLayerKey = String(movingHarvestPreviewSource?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
  const isIndividualTransportMode = String(selectedTransportMode || 'pallet') === 'individual';
  const mergedCardClassName = [cardClassName, storageToneClassName].filter(Boolean).join(' ');

  const isMovingSourceSlot = movingSourceType === 'warehouse-slot'
    && movingSourceSlotNo === normalizedSlotNo;
  const isMovingWholePalletSource = isMovingSourceSlot
    && (Boolean(movingHarvestPreviewCarriesWholePallet) || !isIndividualTransportMode);
  const movingOnlyTopLayer = isMovingWholePalletSource
    && movingSourceLayerKey === 'top'
    && Boolean(slotEntry?.hasTopLayer);

  const effectiveSlot = isMovingWholePalletSource
    ? (
      movingOnlyTopLayer
        ? {
          ...slotEntry,
          hasTopLayer: false,
          topLayer: null,
          topMemo: '',
        }
        : {
          ...slotEntry,
          occupied: false,
          canLoad: true,
          hasTopLayer: false,
          topLayer: null,
          isHarvestStored: false,
          hasStoredHarvest: false,
          isFloorStored: false,
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
    : (slotEntry || null);

  const moveTarget = (
    slotEntry
    && Number(slotEntry?.slotNo || slotEntry?.storageSlotNo || 0) === normalizedSlotNo
    && String(slotEntry?.target?.facilityKey || activeFacilityStorageKey || '') === String(activeFacilityStorageKey || '')
  )
    ? (slotEntry?.target || null)
    : null;

  const sharedSlotEntry = effectiveSlot
    ? {
      ...effectiveSlot,
      hasStoredHarvest: Boolean(effectiveSlot?.hasStoredHarvest ?? effectiveSlot?.isHarvestStored),
      hasEmptyPallet: Boolean(
        effectiveSlot?.hasEmptyPallet
        ?? (effectiveSlot?.occupied && !(effectiveSlot?.hasStoredHarvest ?? effectiveSlot?.isHarvestStored))
      ),
      target: moveTarget,
    }
    : {
      occupied: false,
      hasStoredHarvest: false,
      hasEmptyPallet: false,
      target: moveTarget,
    };

  const renderedHeaderNode = headerNode || buildDefaultHeaderNode(slotLabel, sharedSlotEntry);
  const occupied = Boolean(sharedSlotEntry?.occupied);
  const hasStoredHarvest = Boolean(sharedSlotEntry?.hasStoredHarvest ?? sharedSlotEntry?.isHarvestStored);
  const defaultManualContent = selectedTransportRow ? null : (
    occupied ? (
      hasStoredHarvest ? null : (
        typeof onManualUnload === 'function' ? (
          <>
            <span className="warehouse-harvest-slot-card__status">빈 팔레트 적재됨</span>
            <button
              type="button"
              className="button button--compact button--ghost facility-workbench-install-button"
              onClick={(event) => {
                event.stopPropagation();
                onManualUnload();
              }}
            >
              빼기
            </button>
          </>
        ) : null
      )
    ) : (
      typeof onManualLoad === 'function' && canManualLoad ? (
        <button
          type="button"
          className="button button--compact button--primary facility-workbench-install-button"
          onClick={(event) => {
            event.stopPropagation();
            onManualLoad();
          }}
        >
          팔레트 적재
        </button>
      ) : (
        typeof onManualLoad === 'function' && showDisabledManualLoad ? (
          <span className="disabled-tip" title={manualLoadDisabledReason}>
            <button
              type="button"
              className="button button--compact button--primary facility-workbench-install-button"
              disabled
            >
              팔레트 적재
            </button>
          </span>
        ) : null
      )
    )
  );
  const manualContent = manualContentOverride !== undefined
    ? manualContentOverride
    : defaultManualContent;

  return (
    <WarehouseSharedHarvestSlotCard
      slotNo={normalizedSlotNo}
      slotLabel={slotLabel}
      slotEntry={sharedSlotEntry}
      palletImageSrc={palletImageSrc}
      activeFacilityStorageKey={activeFacilityStorageKey}
      openHarvestDetail={openHarvestDetail}
      editHarvestPalletMemo={editHarvestPalletMemo}
      openHarvestPalletMovePicker={openHarvestPalletMovePicker}
      selectedTransportRow={selectedTransportRow}
      selectedTransportCanMovePallet={selectedTransportCanMovePallet}
      selectedTransportCanStackPallet={selectedTransportCanStackPallet}
      selectedTransportHasPalletOnDock={selectedTransportHasPalletOnDock}
      selectedTransportIndividualCarryLimit={selectedTransportIndividualCarryLimit}
      selectedTransportMode={selectedTransportMode}
      harvestMoveActive={harvestMoveActive}
      pendingHarvestMoveTarget={pendingHarvestMoveTarget}
      chooseHarvestMoveTarget={chooseHarvestMoveTarget}
      pickIndividualHarvestBoxToTransport={pickIndividualHarvestBoxToTransport}
      pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
      pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
      movingHarvestPreviewSource={movingHarvestPreviewSource}
      movingHarvestPreviewBoxCount={movingHarvestPreviewBoxCount}
      movingHarvestPreviewFilledBoxCount={movingHarvestPreviewFilledBoxCount}
      visibleLayerBySlot={visibleLayerBySlot}
      setVisibleLayerBySlot={setVisibleLayerBySlot}
      visibleLayerSlotKey={visibleLayerSlotKey}
      harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
      harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
      harvestPalletVisibleFilledSlotsAfterPreview={harvestPalletVisibleFilledSlotsAfterPreview}
      harvestPalletBoxToneAt={harvestPalletBoxToneAt}
      harvestBoxesPerPallet={harvestBoxesPerPallet}
      harvestBoxTooltipBySlot={harvestBoxTooltipBySlot}
      individualFillAnimBySlot={individualFillAnimBySlot}
      animateSlotShell={animateSlotShell}
      cardClassName={mergedCardClassName}
      overlayBadgeContent={overlayBadgeContent}
      openDetailSource={openDetailSource}
      movePickerMeta={movePickerMeta}
      headerNode={renderedHeaderNode}
      manualContent={manualContent}
      hideLoadLabel={hideLoadLabel}
      alwaysShowManualContent={alwaysShowManualContent}
      suppressMemoButton={suppressMemoButton}
    />
  );
}
