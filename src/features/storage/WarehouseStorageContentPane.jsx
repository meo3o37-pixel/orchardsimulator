import React from 'react';
import { createPortal } from 'react-dom';
import WarehouseStorageMainPane from './WarehouseStorageMainPane';
import WarehouseStorageCardGrid from './WarehouseStorageCardGrid';
import { WarehouseCoolingPanel, WarehouseSortingPanel, WarehouseWorkbenchPanel } from './WarehouseStorageFacilityPanels';
import WarehouseHarvestSlotPanel from './WarehouseHarvestSlotPanel';
import WarehouseHarvestBoxDetailModal from './WarehouseHarvestBoxDetailModal';
import WarehouseHarvestDetailModal from './WarehouseHarvestDetailModal';
import WarehouseHarvestMovePickerModal from './WarehouseHarvestMovePickerModal';
import WarehouseHarvestSourceSelectModal from './WarehouseHarvestSourceSelectModal';

export default function WarehouseStorageContentPane({
  modalRef,
  interactionLocked = false,
  interactionLockedReason = '',
  className,
  activeFacilityStorageKey,
  entrySelector,
  vehicleEntrySelector,
  title,
  coldStatus,
  hideTabs,
  primaryTabs,
  activeTab,
  activeFacilityTab,
  onSelectPrimaryTab,
  facilityButtonIcon,
  onSelectFacilityTabShortcut,
  harvestTabs,
  activeHarvestTab,
  onSelectHarvestTab,
  facilityTabs,
  onSelectFacilityTab,
  panelClassName,
  onPanelAnimationEnd,
  showFooter,
  usedKgText,
  capacityKgText,
  usagePctText,
  onOpenShareModal,
  onBack,
  onClose,
  harvestMovePicker,
  harvestGeneralMovePicker,
  closeHarvestMovePicker,
  selectedTransportLabel,
  selectedTransportMode,
  onChooseTransportMode,
  harvestMoveTargetSummaryLabel,
  harvestMoveTargetSummaryVisual,
  patchHarvestMovePicker,
  pendingHarvestMoveTarget,
  harvestMoveViewKey,
  harvestMovePanelClassName,
  onHarvestMovePanelAnimationEnd,
  chooseHarvestMoveTarget,
  harvestMoveStorageRows,
  harvestMoveWarehouseContentKey,
  harvestMoveWarehousePanelClassName,
  onHarvestMoveWarehousePanelAnimationEnd,
  harvestMoveSortingRows,
  harvestMoveWorkbenchRows,
  harvestMoveGeneralRows,
  sortingHarvestSlotRows,
  harvestDetailOpen,
  harvestDetailMode,
  closeHarvestDetail,
  harvestDetailSlot,
  harvestDetailLocationLabel,
  harvestDetailLayer,
  harvestDetailSummary,
  harvestDetailImageSrc,
  harvestDetailBatchRows,
  harvestDetailCardSections,
  harvestDetailCanMergeRemainders,
  harvestDetailMergeRemaindersLabel,
  mergeHarvestDetailRemainders,
  harvestSlotCount,
  harvestSlotRows,
  palletImageSrc,
  visibleLayerBySlot,
  individualFillAnimBySlot,
  stackAnimBySlot,
  generalFirstLoadAnimByRow,
  selectedTransportRow,
  selectedTransportCanMovePallet,
  selectedTransportHasPalletOnDock = false,
  selectedTransportIndividualCarryLimit,
  selectedTransportCanStackPallet,
  openHarvestDetail,
  editHarvestPalletMemo,
  setVisibleLayerBySlot,
  harvestPalletLayerEntryOf,
  harvestPalletFilledBoxCount,
  harvestPalletVisualFilledBoxCount,
  harvestPalletLoadLabel,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxFilledAt,
  harvestPalletVisibleFilledSlotsAfterPreview,
  harvestPalletBoxToneAt,
  harvestBoxTooltipBySlot,
  openHarvestPalletMovePicker,
  pickIndividualHarvestBoxToTransport,
  pickIndividualTransportDockHarvestBoxToTransport,
  pickIndividualHarvestBoxToSelectedTransportDock,
  traceHarvestBoxInteraction,
  openHarvestPalletUnloadPicker,
  openHarvestPalletLoadPicker,
  movingHarvestPreviewSource,
  movingHarvestPreviewBoxCount = 0,
  movingHarvestPreviewFilledBoxCount = 0,
  movingHarvestPreviewDockAvailableBoxCount = 0,
  movingHarvestPreviewCarriesWholePallet = false,
  confirmHarvestSourceSelectionAndLoad,
  harvestBoxesPerPallet,
  harvestSlotToneClassName = '',
  sortingSlots,
  locationLabel,
  sortingPalletByEquipment,
  sortingWorkerByEquipment,
  sortingInOutSelectionByFacility,
  sortingStaffPlanOf,
  sortingStorageSlotsOf,
  buildSortingPreviewHtml,
  sortingPreviewFrameKeyOf,
  appleContainerLabelOf,
  openShopItemDetailModal,
  unloadSortingStoragePallet,
  openSortingStoragePalletLoadPicker,
  openSortingBoxPicker,
  openSortingInOutModal,
  setSortingWorkerPicker,
  openSortingRunConfirm,
  openSortingInstallFromEmptySlot,
  coolingSlots,
  coolingFacilityLabel,
  coolingStatusLabel,
  coolingTempLabel,
  coolingEnabled,
  coolingFacilityType,
  workbenchSlots,
  workbenchStaffPlanOf,
  workbenchCargoPlanOf,
  workbenchHarvestSlotRows,
  harvestSlotByFacility,
  harvestStoredPalletSlotsByFacility,
  harvestStoredFloorSummaryRowsByFacilityAndSlot,
  buildHarvestPalletSlotEntries,
  harvestBoxCapacityKg,
  workbenchTaskByFacility,
  workbenchInOutSelectionByFacility,
  workbenchStartStateBySlotKey,
  workbenchInlineAnimationBySlotKey,
  sortingStartStateByEquipmentKey,
  sortingAnimatingByEquipmentKey,
  normalizeSortingInOutSlotNoList,
  renderWorkbenchInOutSlotBadges,
  openWorkbenchTaskPicker,
  openWorkbenchInOutModal,
  openWorkbenchBoxPicker,
  startWorkbenchTask,
  setWorkbenchWorkerPicker,
  openWorkbenchInstallPicker,
  uninstallWorkbenchTable,
  laborText,
  crewIconOf,
  visibleRows,
  generalGridMaxHeightPx,
  gridRef,
  selectedCarrier,
  selectedHarvestSourceRowKey,
  selectedHarvestSourceRow,
  facilityMoveQtyByKey,
  setFacilityMoveQtyByKey,
  openFacilityStorageMachineLoadEntryForCarrier,
  openFacilityStorageCarrierPanelForMachine,
  moveStorageItemToSelectedCarrier,
  openOtherWarehouseTransferPlaceholder,
  openHarvestGeneralMovePicker,
  requestDisposeWarehouseItem,
  openFuelKioskFromWarehouseMachineItem,
  shouldIgnoreDetailCardOpen,
  toolImageSrcOf,
  disposalVerbForItem,
  canApplyOneMcpToHarvestCard = null,
  oneMcpDisabledReasonOfHarvestCard = null,
  applyOneMcpToHarvestCard = null,
  isReflectiveFilmItemKey,
  formatCountWithUnit,
  formatLiterTextFixed2,
  shoulderBrushFuelSummaryOfItem,
  durabilityToneClass,
  clamp,
}) {
  const [selectedHarvestDetailCard, setSelectedHarvestDetailCard] = React.useState(null);
  const showHarvestSourceSelectModal = harvestDetailOpen
    && String(harvestDetailMode || '') === 'source-select';

  React.useEffect(() => {
    setSelectedHarvestDetailCard(null);
  }, [
    harvestDetailOpen,
    harvestDetailMode,
    harvestDetailSlot?.slotNo,
    harvestDetailLayer,
    harvestDetailLocationLabel
  ]);

  return (
    <>
      <WarehouseStorageMainPane
        modalRef={modalRef}
        className={className}
        activeFacilityStorageKey={activeFacilityStorageKey}
        entrySelector={entrySelector}
        title={title}
        coldStatus={coldStatus}
        hideTabs={hideTabs}
        primaryTabs={primaryTabs}
        activeTab={activeTab}
        activeFacilityTab={activeFacilityTab}
        onSelectPrimaryTab={onSelectPrimaryTab}
        showFacilityShortcut={facilityTabs.length > 0}
        facilityButtonIcon={facilityButtonIcon}
        onSelectFacilityTabShortcut={onSelectFacilityTabShortcut}
        harvestTabs={harvestTabs}
        activeHarvestTab={activeHarvestTab}
        onSelectHarvestTab={onSelectHarvestTab}
        facilityTabs={facilityTabs}
        onSelectFacilityTab={onSelectFacilityTab}
        panelClassName={panelClassName}
        onPanelAnimationEnd={onPanelAnimationEnd}
        showFooter={showFooter}
        usedKgText={usedKgText}
        capacityKgText={capacityKgText}
        usagePctText={usagePctText}
        interactionLocked={interactionLocked}
        interactionLockedReason={interactionLockedReason}
        onOpenShareModal={onOpenShareModal}
        onBack={onBack}
        onClose={onClose}
      >
      {harvestDetailOpen && !showHarvestSourceSelectModal ? (
          <WarehouseHarvestDetailModal
            slot={harvestDetailSlot}
            locationLabel={harvestDetailLocationLabel}
            layer={harvestDetailLayer}
            summary={harvestDetailSummary}
            imageSrc={harvestDetailImageSrc}
            batchRows={harvestDetailBatchRows}
            cardSections={harvestDetailCardSections}
            canMergeRemainders={harvestDetailCanMergeRemainders}
            mergeRemaindersLabel={harvestDetailMergeRemaindersLabel}
            onMergeRemainders={mergeHarvestDetailRemainders}
            selectedCardId={selectedHarvestDetailCard?.id || ''}
            onSelectCard={(card) => setSelectedHarvestDetailCard(card || null)}
          />
      ) : harvestMovePicker ? (
        <WarehouseHarvestMovePickerModal
          embedded
          picker={harvestMovePicker}
          onClose={closeHarvestMovePicker}
          selectedTransportLabel={selectedTransportLabel}
          selectedTransportMode={selectedTransportMode}
          selectedTransportCanMovePallet={selectedTransportCanMovePallet}
          onChooseTransportMode={onChooseTransportMode}
          targetSummaryLabel={harvestMoveTargetSummaryLabel}
          targetSummaryVisual={harvestMoveTargetSummaryVisual}
          onPatchPicker={patchHarvestMovePicker}
          viewKey={harvestMoveViewKey}
          panelClassName={harvestMovePanelClassName}
          onPanelAnimationEnd={onHarvestMovePanelAnimationEnd}
          onChooseTarget={chooseHarvestMoveTarget}
          storageRows={harvestMoveStorageRows}
          warehouseContentKey={harvestMoveWarehouseContentKey}
          warehousePanelClassName={harvestMoveWarehousePanelClassName}
          onWarehousePanelAnimationEnd={onHarvestMoveWarehousePanelAnimationEnd}
          sortingRows={harvestMoveSortingRows}
          workbenchRows={harvestMoveWorkbenchRows}
          generalRows={harvestMoveGeneralRows}
          formatCountWithUnit={formatCountWithUnit}
          harvestPalletLayerEntryOf={harvestPalletLayerEntryOf}
          harvestPalletFilledBoxCount={harvestPalletFilledBoxCount}
          harvestPalletVisualFilledBoxCount={harvestPalletVisualFilledBoxCount}
          harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
          harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
          harvestPalletBoxToneAt={harvestPalletBoxToneAt}
          individualFillAnimBySlot={individualFillAnimBySlot}
          palletItemImageSrc={palletImageSrc}
          harvestBoxesPerPallet={harvestBoxesPerPallet}
        />
      ) : ((activeTab === 'harvest') || (activeTab === 'facility' && activeFacilityTab === 'harvest')) && activeHarvestTab === 'pallet' ? (
        <WarehouseHarvestSlotPanel
          slotCount={harvestSlotCount}
          slotRows={harvestSlotRows}
          palletImageSrc={palletImageSrc}
          activeFacilityStorageKey={activeFacilityStorageKey}
          visibleLayerBySlot={visibleLayerBySlot}
          individualFillAnimBySlot={individualFillAnimBySlot}
          stackAnimBySlot={stackAnimBySlot}
          generalFirstLoadAnimByRow={generalFirstLoadAnimByRow}
          selectedTransportRow={selectedTransportRow}
          selectedTransportCanMovePallet={selectedTransportCanMovePallet}
          selectedTransportHasPalletOnDock={selectedTransportHasPalletOnDock}
          selectedTransportIndividualCarryLimit={selectedTransportIndividualCarryLimit}
          selectedTransportCanStackPallet={selectedTransportCanStackPallet}
          openHarvestDetail={openHarvestDetail}
          editHarvestPalletMemo={editHarvestPalletMemo}
          setVisibleLayerBySlot={setVisibleLayerBySlot}
          harvestPalletLayerEntryOf={harvestPalletLayerEntryOf}
          harvestPalletFilledBoxCount={harvestPalletFilledBoxCount}
          harvestPalletVisualFilledBoxCount={harvestPalletVisualFilledBoxCount}
          harvestPalletLoadLabel={harvestPalletLoadLabel}
          harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
          harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
          harvestPalletBoxToneAt={harvestPalletBoxToneAt}
          harvestBoxTooltipBySlot={harvestBoxTooltipBySlot}
          storageToneClassName={harvestSlotToneClassName}
          renderSlotOverlayBadges={renderWorkbenchInOutSlotBadges}
          openHarvestPalletMovePicker={openHarvestPalletMovePicker}
          pickIndividualHarvestBoxToTransport={pickIndividualHarvestBoxToTransport}
          pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
          pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
          traceHarvestBoxInteraction={traceHarvestBoxInteraction}
          openHarvestPalletUnloadPicker={openHarvestPalletUnloadPicker}
          openHarvestPalletLoadPicker={openHarvestPalletLoadPicker}
          harvestMoveActive={Boolean(harvestMovePicker || movingHarvestPreviewSource)}
          chooseHarvestMoveTarget={chooseHarvestMoveTarget}
          pendingHarvestMoveTarget={pendingHarvestMoveTarget}
          movingHarvestPreviewSource={movingHarvestPreviewSource}
          movingHarvestPreviewBoxCount={movingHarvestPreviewBoxCount}
          movingHarvestPreviewFilledBoxCount={movingHarvestPreviewFilledBoxCount}
          movingHarvestPreviewDockAvailableBoxCount={movingHarvestPreviewDockAvailableBoxCount}
          movingHarvestPreviewCarriesWholePallet={movingHarvestPreviewCarriesWholePallet}
          selectedTransportMode={selectedTransportMode}
          harvestBoxesPerPallet={harvestBoxesPerPallet}
        />
      ) : activeTab === 'facility' && activeFacilityTab === 'sorting' ? (
        <>
          <WarehouseSortingPanel
            activeFacilityStorageKey={activeFacilityStorageKey}
            slots={sortingSlots}
            locationLabel={locationLabel}
            sortingPalletByEquipment={sortingPalletByEquipment}
            sortingWorkerByEquipment={sortingWorkerByEquipment}
            sortingInOutSelectionByFacility={sortingInOutSelectionByFacility}
            sortingHarvestSlotRows={sortingHarvestSlotRows}
            sortingStaffPlanOf={sortingStaffPlanOf}
            sortingStorageSlotsOf={sortingStorageSlotsOf}
            buildSortingPreviewHtml={buildSortingPreviewHtml}
            sortingPreviewFrameKeyOf={sortingPreviewFrameKeyOf}
            appleContainerLabelOf={appleContainerLabelOf}
            palletImageSrc={palletImageSrc}
            openShopItemDetailModal={openShopItemDetailModal}
            unloadSortingStoragePallet={unloadSortingStoragePallet}
            openSortingStoragePalletLoadPicker={openSortingStoragePalletLoadPicker}
            openSortingBoxPicker={openSortingBoxPicker}
            openSortingInOutModal={openSortingInOutModal}
            setSortingWorkerPicker={setSortingWorkerPicker}
            openSortingRunConfirm={openSortingRunConfirm}
            sortingStartStateByEquipmentKey={sortingStartStateByEquipmentKey}
            sortingAnimatingByEquipmentKey={sortingAnimatingByEquipmentKey}
            normalizeSortingInOutSlotNoList={normalizeSortingInOutSlotNoList}
            openHarvestDetail={openHarvestDetail}
            editHarvestPalletMemo={editHarvestPalletMemo}
            openSortingInstallFromEmptySlot={openSortingInstallFromEmptySlot}
            openHarvestPalletUnloadPicker={openHarvestPalletUnloadPicker}
            openHarvestPalletMovePicker={openHarvestPalletMovePicker}
            harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
            harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
            harvestPalletVisibleFilledSlotsAfterPreview={harvestPalletVisibleFilledSlotsAfterPreview}
            harvestPalletBoxToneAt={harvestPalletBoxToneAt}
            harvestBoxesPerPallet={harvestBoxesPerPallet}
            selectedTransportRow={selectedTransportRow}
            selectedTransportCanMovePallet={selectedTransportCanMovePallet}
            selectedTransportHasPalletOnDock={selectedTransportHasPalletOnDock}
            selectedTransportIndividualCarryLimit={selectedTransportIndividualCarryLimit}
            selectedTransportCanStackPallet={selectedTransportCanStackPallet}
            selectedTransportMode={selectedTransportMode}
            harvestMoveActive={Boolean(harvestMovePicker || movingHarvestPreviewSource)}
            visibleLayerBySlot={visibleLayerBySlot}
            setVisibleLayerBySlot={setVisibleLayerBySlot}
            pendingHarvestMoveTarget={pendingHarvestMoveTarget}
            chooseHarvestMoveTarget={chooseHarvestMoveTarget}
            harvestBoxTooltipBySlot={harvestBoxTooltipBySlot}
            storageToneClassName={harvestSlotToneClassName}
            pickIndividualHarvestBoxToTransport={pickIndividualHarvestBoxToTransport}
            pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
            pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
            movingHarvestPreviewSource={movingHarvestPreviewSource}
            movingHarvestPreviewBoxCount={movingHarvestPreviewBoxCount}
            movingHarvestPreviewFilledBoxCount={movingHarvestPreviewFilledBoxCount}
            movingHarvestPreviewDockAvailableBoxCount={movingHarvestPreviewDockAvailableBoxCount}
            laborText={laborText}
            crewIconOf={crewIconOf}
          />
          <WarehouseHarvestSlotPanel
            slotCount={harvestSlotCount}
            slotRows={harvestSlotRows}
            palletImageSrc={palletImageSrc}
            activeFacilityStorageKey={activeFacilityStorageKey}
            visibleLayerBySlot={visibleLayerBySlot}
            individualFillAnimBySlot={individualFillAnimBySlot}
            stackAnimBySlot={stackAnimBySlot}
            generalFirstLoadAnimByRow={generalFirstLoadAnimByRow}
            selectedTransportRow={selectedTransportRow}
            selectedTransportCanMovePallet={selectedTransportCanMovePallet}
            selectedTransportHasPalletOnDock={selectedTransportHasPalletOnDock}
            selectedTransportIndividualCarryLimit={selectedTransportIndividualCarryLimit}
            selectedTransportCanStackPallet={selectedTransportCanStackPallet}
            openHarvestDetail={openHarvestDetail}
            editHarvestPalletMemo={editHarvestPalletMemo}
            setVisibleLayerBySlot={setVisibleLayerBySlot}
            harvestPalletLayerEntryOf={harvestPalletLayerEntryOf}
            harvestPalletFilledBoxCount={harvestPalletFilledBoxCount}
            harvestPalletVisualFilledBoxCount={harvestPalletVisualFilledBoxCount}
            harvestPalletLoadLabel={harvestPalletLoadLabel}
            harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
            harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
            harvestPalletBoxToneAt={harvestPalletBoxToneAt}
            harvestBoxTooltipBySlot={harvestBoxTooltipBySlot}
            storageToneClassName={harvestSlotToneClassName}
            renderSlotOverlayBadges={renderWorkbenchInOutSlotBadges}
            openHarvestPalletMovePicker={openHarvestPalletMovePicker}
            pickIndividualHarvestBoxToTransport={pickIndividualHarvestBoxToTransport}
            pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
            pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
            traceHarvestBoxInteraction={traceHarvestBoxInteraction}
            openHarvestPalletUnloadPicker={openHarvestPalletUnloadPicker}
            openHarvestPalletLoadPicker={openHarvestPalletLoadPicker}
            harvestMoveActive={Boolean(harvestMovePicker || movingHarvestPreviewSource)}
            chooseHarvestMoveTarget={chooseHarvestMoveTarget}
            pendingHarvestMoveTarget={pendingHarvestMoveTarget}
            movingHarvestPreviewSource={movingHarvestPreviewSource}
            movingHarvestPreviewBoxCount={movingHarvestPreviewBoxCount}
            movingHarvestPreviewFilledBoxCount={movingHarvestPreviewFilledBoxCount}
            movingHarvestPreviewDockAvailableBoxCount={movingHarvestPreviewDockAvailableBoxCount}
            movingHarvestPreviewCarriesWholePallet={movingHarvestPreviewCarriesWholePallet}
            selectedTransportMode={selectedTransportMode}
            harvestBoxesPerPallet={harvestBoxesPerPallet}
          />
        </>
      ) : activeTab === 'facility' && (activeFacilityTab === 'coolingBlower' || activeFacilityTab === 'coolingOutdoor') ? (
        <WarehouseCoolingPanel
          slots={coolingSlots}
          facilityLabel={coolingFacilityLabel}
          statusLabel={coolingStatusLabel}
          tempLabel={coolingTempLabel}
          isOn={coolingEnabled}
          facilityType={coolingFacilityType}
        />
      ) : activeTab === 'facility' && activeFacilityTab === 'workbench' ? (
        <>
          <WarehouseWorkbenchPanel
            slots={workbenchSlots}
            activeFacilityStorageKey={activeFacilityStorageKey}
            selectedTransportRow={selectedTransportRow}
            selectedTransportCanMovePallet={selectedTransportCanMovePallet}
            selectedTransportHasPalletOnDock={selectedTransportHasPalletOnDock}
            selectedTransportCanStackPallet={selectedTransportCanStackPallet}
            selectedTransportMode={selectedTransportMode}
            harvestMoveActive={Boolean(harvestMovePicker || movingHarvestPreviewSource)}
            visibleLayerBySlot={visibleLayerBySlot}
            setVisibleLayerBySlot={setVisibleLayerBySlot}
            pendingHarvestMoveTarget={pendingHarvestMoveTarget}
            chooseHarvestMoveTarget={chooseHarvestMoveTarget}
            workbenchStaffPlanOf={workbenchStaffPlanOf}
            workbenchCargoPlanOf={workbenchCargoPlanOf}
            workbenchHarvestSlotRows={workbenchHarvestSlotRows}
            harvestSlotRows={harvestSlotRows}
            harvestSlotByFacility={harvestSlotByFacility}
            harvestStoredPalletSlotsByFacility={harvestStoredPalletSlotsByFacility}
            harvestStoredFloorSummaryRowsByFacilityAndSlot={harvestStoredFloorSummaryRowsByFacilityAndSlot}
            buildHarvestPalletSlotEntries={buildHarvestPalletSlotEntries}
            harvestBoxCapacityKg={harvestBoxCapacityKg}
            palletImageSrc={palletImageSrc}
            openHarvestDetail={openHarvestDetail}
            editHarvestPalletMemo={editHarvestPalletMemo}
            openHarvestPalletLoadPicker={openHarvestPalletLoadPicker}
            openHarvestPalletUnloadPicker={openHarvestPalletUnloadPicker}
            openHarvestPalletMovePicker={openHarvestPalletMovePicker}
            harvestPalletLayerEntryOf={harvestPalletLayerEntryOf}
            harvestPalletVisualFilledBoxCount={harvestPalletVisualFilledBoxCount}
            harvestPalletLoadLabel={harvestPalletLoadLabel}
            harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
            harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
            harvestPalletVisibleFilledSlotsAfterPreview={harvestPalletVisibleFilledSlotsAfterPreview}
            harvestPalletBoxToneAt={harvestPalletBoxToneAt}
            harvestBoxTooltipBySlot={harvestBoxTooltipBySlot}
            storageToneClassName={harvestSlotToneClassName}
            harvestBoxesPerPallet={harvestBoxesPerPallet}
            selectedTransportIndividualCarryLimit={selectedTransportIndividualCarryLimit}
            pickIndividualHarvestBoxToTransport={pickIndividualHarvestBoxToTransport}
            pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
            pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
            movingHarvestPreviewSource={movingHarvestPreviewSource}
            movingHarvestPreviewBoxCount={movingHarvestPreviewBoxCount}
            movingHarvestPreviewFilledBoxCount={movingHarvestPreviewFilledBoxCount}
            movingHarvestPreviewDockAvailableBoxCount={movingHarvestPreviewDockAvailableBoxCount}
            individualFillAnimBySlot={individualFillAnimBySlot}
            workbenchTaskByFacility={workbenchTaskByFacility}
            workbenchInOutSelectionByFacility={workbenchInOutSelectionByFacility}
            workbenchStartStateBySlotKey={workbenchStartStateBySlotKey}
            workbenchInlineAnimationBySlotKey={workbenchInlineAnimationBySlotKey}
            openWorkbenchTaskPicker={openWorkbenchTaskPicker}
            openWorkbenchInOutModal={openWorkbenchInOutModal}
            openWorkbenchBoxPicker={openWorkbenchBoxPicker}
            startWorkbenchTask={startWorkbenchTask}
            setWorkbenchWorkerPicker={setWorkbenchWorkerPicker}
            openWorkbenchInstallPicker={openWorkbenchInstallPicker}
            uninstallWorkbenchTable={uninstallWorkbenchTable}
            openShopItemDetailModal={openShopItemDetailModal}
            locationLabel={locationLabel}
            laborText={laborText}
            crewIconOf={crewIconOf}
          />
          <WarehouseHarvestSlotPanel
            slotCount={harvestSlotCount}
            slotRows={harvestSlotRows}
            palletImageSrc={palletImageSrc}
            activeFacilityStorageKey={activeFacilityStorageKey}
            visibleLayerBySlot={visibleLayerBySlot}
            individualFillAnimBySlot={individualFillAnimBySlot}
            stackAnimBySlot={stackAnimBySlot}
            generalFirstLoadAnimByRow={generalFirstLoadAnimByRow}
            selectedTransportRow={selectedTransportRow}
            selectedTransportCanMovePallet={selectedTransportCanMovePallet}
            selectedTransportHasPalletOnDock={selectedTransportHasPalletOnDock}
            selectedTransportIndividualCarryLimit={selectedTransportIndividualCarryLimit}
            selectedTransportCanStackPallet={selectedTransportCanStackPallet}
            openHarvestDetail={openHarvestDetail}
            editHarvestPalletMemo={editHarvestPalletMemo}
            setVisibleLayerBySlot={setVisibleLayerBySlot}
            harvestPalletLayerEntryOf={harvestPalletLayerEntryOf}
            harvestPalletFilledBoxCount={harvestPalletFilledBoxCount}
            harvestPalletVisualFilledBoxCount={harvestPalletVisualFilledBoxCount}
            harvestPalletLoadLabel={harvestPalletLoadLabel}
            harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
            harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
            harvestPalletBoxToneAt={harvestPalletBoxToneAt}
            harvestBoxTooltipBySlot={harvestBoxTooltipBySlot}
            renderSlotOverlayBadges={renderWorkbenchInOutSlotBadges}
            openHarvestPalletMovePicker={openHarvestPalletMovePicker}
            pickIndividualHarvestBoxToTransport={pickIndividualHarvestBoxToTransport}
            pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
            pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
            traceHarvestBoxInteraction={traceHarvestBoxInteraction}
            openHarvestPalletUnloadPicker={openHarvestPalletUnloadPicker}
            openHarvestPalletLoadPicker={openHarvestPalletLoadPicker}
            harvestMoveActive={Boolean(harvestMovePicker || movingHarvestPreviewSource)}
            chooseHarvestMoveTarget={chooseHarvestMoveTarget}
            pendingHarvestMoveTarget={pendingHarvestMoveTarget}
            movingHarvestPreviewSource={movingHarvestPreviewSource}
            movingHarvestPreviewBoxCount={movingHarvestPreviewBoxCount}
            movingHarvestPreviewFilledBoxCount={movingHarvestPreviewFilledBoxCount}
            movingHarvestPreviewDockAvailableBoxCount={movingHarvestPreviewDockAvailableBoxCount}
            movingHarvestPreviewCarriesWholePallet={movingHarvestPreviewCarriesWholePallet}
            selectedTransportMode={selectedTransportMode}
            harvestBoxesPerPallet={harvestBoxesPerPallet}
          />
        </>
      ) : activeTab === 'vehicle' ? (
        vehicleEntrySelector
      ) : visibleRows.length ? (
        <WarehouseStorageCardGrid
          items={visibleRows}
          activeTab={activeTab}
          activeHarvestTab={activeHarvestTab}
          locationLabel={locationLabel}
          isFacilityList={activeTab === 'facility'}
          generalGridMaxHeightPx={generalGridMaxHeightPx}
          gridRef={gridRef}
          selectedCarrier={selectedCarrier}
          selectedHarvestSourceRowKey={selectedHarvestSourceRowKey}
          selectedHarvestSourceRow={selectedHarvestSourceRow}
          selectedTransportRow={selectedTransportRow}
          selectedTransportCanMovePallet={selectedTransportCanMovePallet}
          facilityMoveQtyByKey={facilityMoveQtyByKey}
          setFacilityMoveQtyByKey={setFacilityMoveQtyByKey}
          openFacilityStorageMachineLoadEntryForCarrier={openFacilityStorageMachineLoadEntryForCarrier}
          openFacilityStorageCarrierPanelForMachine={openFacilityStorageCarrierPanelForMachine}
          moveStorageItemToSelectedCarrier={moveStorageItemToSelectedCarrier}
          openOtherWarehouseTransferPlaceholder={openOtherWarehouseTransferPlaceholder}
          openHarvestGeneralMovePicker={openHarvestGeneralMovePicker}
          requestDisposeWarehouseItem={requestDisposeWarehouseItem}
          openFuelKioskFromWarehouseMachineItem={openFuelKioskFromWarehouseMachineItem}
          openShopItemDetailModal={openShopItemDetailModal}
          shouldIgnoreDetailCardOpen={shouldIgnoreDetailCardOpen}
          toolImageSrcOf={toolImageSrcOf}
          disposalVerbForItem={disposalVerbForItem}
          isReflectiveFilmItemKey={isReflectiveFilmItemKey}
          formatCountWithUnit={formatCountWithUnit}
          formatLiterTextFixed2={formatLiterTextFixed2}
          shoulderBrushFuelSummaryOfItem={shoulderBrushFuelSummaryOfItem}
          durabilityToneClass={durabilityToneClass}
          clamp={clamp}
          interactionLocked={interactionLocked}
          interactionLockedReason={interactionLockedReason}
        />
      ) : (
        <div className="empty-box" style={{ marginTop: 10 }}>
          {activeTab === 'harvest' || (activeTab === 'facility' && activeFacilityTab === 'harvest')
            ? '적재된 수확물이 없습니다.'
            : '보관 중인 아이템이 없습니다.'}
        </div>
      )}
      {showHarvestSourceSelectModal && typeof document !== 'undefined'
        ? createPortal(
          <>
            <div
              className="confirm-modal-backdrop confirm-modal-backdrop--soft confirm-modal-backdrop--harvest-source-select"
              onClick={closeHarvestDetail}
            />
            <section
              className="confirm-modal confirm-modal--harvest-source-select"
              role="dialog"
              aria-modal="true"
              aria-label="추가 적재할 수확물 선택"
            >
              <div className="confirm-modal__title">추가 적재할 수확물 선택</div>
              <WarehouseHarvestSourceSelectModal
                locationLabel={harvestDetailLocationLabel}
                cardSections={harvestDetailCardSections}
                picker={harvestMovePicker}
                selectedTransportLabel={selectedTransportLabel}
                selectedTransportMode={selectedTransportMode}
                harvestBoxesPerPallet={harvestBoxesPerPallet}
                onPatchPicker={patchHarvestMovePicker}
                onConfirmLoad={confirmHarvestSourceSelectionAndLoad}
                onClose={closeHarvestDetail}
              />
            </section>
          </>,
          document.body
        )
        : null}
      </WarehouseStorageMainPane>
      <WarehouseHarvestBoxDetailModal
        card={selectedHarvestDetailCard}
        canApplyOneMcp={Boolean(
          selectedHarvestDetailCard
          && (typeof canApplyOneMcpToHarvestCard === 'function'
            ? canApplyOneMcpToHarvestCard(selectedHarvestDetailCard)
            : false)
        )}
        oneMcpDisabledReason={selectedHarvestDetailCard && typeof oneMcpDisabledReasonOfHarvestCard === 'function'
          ? oneMcpDisabledReasonOfHarvestCard(selectedHarvestDetailCard)
          : ''}
        onApplyOneMcp={typeof applyOneMcpToHarvestCard === 'function'
          ? applyOneMcpToHarvestCard
          : null}
        onClose={() => setSelectedHarvestDetailCard(null)}
      />
    </>
  );
}
