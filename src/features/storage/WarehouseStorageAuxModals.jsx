import React from 'react';
import WarehouseOtherWarehouseTransferModal from './WarehouseOtherWarehouseTransferModal';
import WarehouseWorkbenchInstallPickerModal from './WarehouseWorkbenchInstallPickerModal';
import WarehouseWorkbenchInOutModal from './WarehouseWorkbenchInOutModal';
import WarehouseWorkbenchTaskPickerModal from './WarehouseWorkbenchTaskPickerModal';
import WarehouseWorkerPickerModal from './WarehouseWorkerPickerModal';
import WarehouseStorageAuxPickers from './WarehouseStorageAuxPickers';

export default function WarehouseStorageAuxModals(props) {
  const {
    facilityStorageModalOpen,
    facilityStorageOtherWarehouseTransferPicker,
    facilityStorageOtherWarehouseTransferTargetRows,
    stripColdStorageIconName,
    selectOtherWarehouseTransferTarget,
    closeOtherWarehouseTransferPicker,
    workbenchInstallPicker,
    selectedWorkbenchInstallTable,
    workbenchInstallTableOptions,
    installWorkbenchTable,
    selectWorkbenchInstallTable,
    clearWorkbenchInstallTableSelection,
    closeWorkbenchInstallPicker,
    facilityStorageWorkbenchTaskPicker,
    facilityStorageWorkbenchTaskByFacility,
    selectWorkbenchTask,
    closeWorkbenchTaskPicker,
    facilityStorageWorkbenchInOutModal,
    closeWorkbenchInOutModal,
    workbenchInOutBody,
    facilityStorageSortingInOutModal,
    closeSortingInOutModal,
    sortingInOutBody,
    facilityStorageSortingOutputRulePicker,
    closeSortingOutputRulePicker,
    sortingOutputRulePickerBody,
    facilityStorageWorkbenchOutputRulePicker,
    closeWorkbenchOutputRulePicker,
    workbenchOutputRulePickerBody,
    slotMode,
    SlotPickerModal,
    slotSummaries,
    closeSlotPicker,
    chooseSlot,
    deleteSlot,
    facilityStorageSortingWorkerPicker,
    facilityStorageSortingWorkerByEquipment,
    facilityStorageSortingWorkerPickerExternalEntries,
    activeCrew,
    totalCrewCountOfTypes,
    harvestCrewTypeKeys,
    harvestCrewIconOf,
    clearSortingWorkerAssignment,
    chooseSortingWorkerAssignment,
    chooseSortingExternalWorkerAssignment,
    confirmSortingWorkerAssignments,
    setFacilityStorageSortingWorkerPicker,
    facilityStorageWorkbenchWorkerPicker,
    facilityStorageWorkbenchWorkerByFacility,
    facilityStorageWorkbenchWorkerPickerExternalEntries,
    clearWorkbenchWorkerAssignment,
    chooseWorkbenchWorkerAssignment,
    chooseWorkbenchExternalWorkerAssignment,
    confirmWorkbenchWorkerAssignments,
    setFacilityStorageWorkbenchWorkerPicker,
    facilityStorageEntryModalOpen,
    renderFacilityStorageEntrySelector,
    setFacilityStorageEntryModalOpen,
    setFacilityStorageEntryTab,
    facilityStorageHarvestLoadPicker,
    facilityStorageHarvestLoadSourceRows,
    setFacilityStorageHarvestLoadPicker,
    chooseHarvestPalletLoadSource,
    facilityStorageSortingPalletLoadPicker,
    setFacilityStorageSortingPalletLoadPicker,
    chooseSortingStoragePalletLoadSource,
    facilityStorageCarrierPalletLoadPicker,
    setFacilityStorageCarrierPalletLoadPicker,
    chooseCarrierPalletLoadSource,
  } = props;

  return (
    <>
      <WarehouseOtherWarehouseTransferModal
        open={facilityStorageModalOpen && Boolean(facilityStorageOtherWarehouseTransferPicker)}
        picker={facilityStorageOtherWarehouseTransferPicker}
        warehouseRows={facilityStorageOtherWarehouseTransferTargetRows}
        stripColdStorageIconName={stripColdStorageIconName}
        onSelectWarehouse={selectOtherWarehouseTransferTarget}
        onClose={closeOtherWarehouseTransferPicker}
      />
      <WarehouseWorkbenchInstallPickerModal
        open={facilityStorageModalOpen && Boolean(workbenchInstallPicker)}
        selectedTable={selectedWorkbenchInstallTable}
        picker={workbenchInstallPicker}
        tableOptions={workbenchInstallTableOptions}
        onInstall={installWorkbenchTable}
        onSelectTable={selectWorkbenchInstallTable}
        onClearTableSelection={clearWorkbenchInstallTableSelection}
        onClose={closeWorkbenchInstallPicker}
      />
      <WarehouseWorkbenchTaskPickerModal
        open={facilityStorageModalOpen && Boolean(facilityStorageWorkbenchTaskPicker)}
        picker={facilityStorageWorkbenchTaskPicker}
        selectedTaskKey={facilityStorageWorkbenchTaskByFacility?.[
          String(facilityStorageWorkbenchTaskPicker?.facilityKey || '')
        ]?.[
          String(facilityStorageWorkbenchTaskPicker?.workbenchSlotKey || '')
        ] || ''}
        onSelectTask={selectWorkbenchTask}
        onClose={closeWorkbenchTaskPicker}
      />
      <WarehouseWorkbenchInOutModal
        open={facilityStorageModalOpen && Boolean(facilityStorageWorkbenchInOutModal)}
        picker={facilityStorageWorkbenchInOutModal}
        onConfirm={closeWorkbenchInOutModal}
        onClose={closeWorkbenchInOutModal}
      >
        {workbenchInOutBody}
      </WarehouseWorkbenchInOutModal>
      <WarehouseWorkbenchInOutModal
        open={facilityStorageModalOpen && Boolean(facilityStorageSortingInOutModal)}
        picker={facilityStorageSortingInOutModal}
        onConfirm={closeSortingInOutModal}
        onClose={closeSortingInOutModal}
      >
        {sortingInOutBody}
      </WarehouseWorkbenchInOutModal>
      {facilityStorageModalOpen && facilityStorageSortingOutputRulePicker ? (
        <>
          <div className="confirm-modal-backdrop confirm-modal-backdrop--soft" style={{ zIndex: 3904 }} onClick={closeSortingOutputRulePicker} />
          <div className="confirm-modal sorting-output-rule-picker-modal" style={{ zIndex: 3905 }}>
            {sortingOutputRulePickerBody}
          </div>
        </>
      ) : null}
      {facilityStorageModalOpen && facilityStorageWorkbenchOutputRulePicker ? (
        <>
          <div className="confirm-modal-backdrop confirm-modal-backdrop--soft" style={{ zIndex: 3906 }} onClick={closeWorkbenchOutputRulePicker} />
          <div className="confirm-modal sorting-output-rule-picker-modal" style={{ zIndex: 3907 }}>
            {workbenchOutputRulePickerBody}
          </div>
        </>
      ) : null}
      {slotMode ? (
        <SlotPickerModal
          title={slotMode === 'save' ? '어느 슬롯에 저장할까요?' : '어느 슬롯을 불러올까요?'}
          hint="슬롯 버튼을 누르면 즉시 적용됩니다."
          items={slotSummaries}
          tabsClassName="slot-picker__tabs--save-slots"
          onClose={closeSlotPicker}
          onChoose={chooseSlot}
          onDelete={deleteSlot}
          isDisabled={(item) => slotMode === 'load' && item.empty}
        />
      ) : null}
      <WarehouseWorkerPickerModal
        open={Boolean(facilityStorageSortingWorkerPicker)}
        title="선별기 인원배치"
        description={`${String(facilityStorageSortingWorkerPicker?.equipmentName || '선별기')}에 넣을 인원을 바로 고르세요.`}
        currentAssignment={facilityStorageSortingWorkerByEquipment?.[
          String(facilityStorageSortingWorkerPicker?.equipmentStorageKey || '')
        ]?.[
          String(facilityStorageSortingWorkerPicker?.slotKey || facilityStorageSortingWorkerPicker?.positionKey || '')
        ] || facilityStorageSortingWorkerByEquipment?.[
          String(facilityStorageSortingWorkerPicker?.equipmentStorageKey || '')
        ]?.[
          String(facilityStorageSortingWorkerPicker?.slotKey || facilityStorageSortingWorkerPicker?.positionKey || '').replace('-worker-slot-', '-staff-slot-')
        ] || null}
        currentAssignments={(Array.isArray(facilityStorageSortingWorkerPicker?.slotKeys)
          ? facilityStorageSortingWorkerPicker.slotKeys
          : (Array.isArray(facilityStorageSortingWorkerPicker?.positionKeys)
            ? facilityStorageSortingWorkerPicker.positionKeys
            : [facilityStorageSortingWorkerPicker?.slotKey || facilityStorageSortingWorkerPicker?.positionKey])
        ).map((key) => (
          facilityStorageSortingWorkerByEquipment?.[
            String(facilityStorageSortingWorkerPicker?.equipmentStorageKey || '')
          ]?.[
            String(key || '')
          ] || facilityStorageSortingWorkerByEquipment?.[
            String(facilityStorageSortingWorkerPicker?.equipmentStorageKey || '')
          ]?.[
            String(key || '').replace('-worker-slot-', '-staff-slot-')
          ] || null
        )).filter(Boolean)}
        externalEntries={facilityStorageSortingWorkerPickerExternalEntries}
        activeCrew={activeCrew}
        totalCrewCountOfTypes={totalCrewCountOfTypes}
        harvestCrewTypeKeys={harvestCrewTypeKeys}
        harvestCrewIconOf={harvestCrewIconOf}
        maxSelection={Math.max(
          1,
          Array.isArray(facilityStorageSortingWorkerPicker?.slotKeys)
            ? facilityStorageSortingWorkerPicker.slotKeys.length
            : Array.isArray(facilityStorageSortingWorkerPicker?.positionKeys)
              ? facilityStorageSortingWorkerPicker.positionKeys.length
              : 1
        )}
        onClear={() => clearSortingWorkerAssignment(
          String(facilityStorageSortingWorkerPicker?.equipmentStorageKey || ''),
          String(facilityStorageSortingWorkerPicker?.slotKey || facilityStorageSortingWorkerPicker?.positionKey || '')
        )}
        onChooseSelf={() => chooseSortingWorkerAssignment('self')}
        onChooseExternal={chooseSortingExternalWorkerAssignment}
        onConfirmSelections={confirmSortingWorkerAssignments}
        onClose={() => setFacilityStorageSortingWorkerPicker(null)}
      />
      <WarehouseWorkerPickerModal
        open={Boolean(facilityStorageWorkbenchWorkerPicker)}
        title="작업대 인원배치"
        description={`${String(facilityStorageWorkbenchWorkerPicker?.workbenchName || '작업대')}에서 이 자리를 맡길 인원을 바로 고르세요.`}
        currentAssignment={facilityStorageWorkbenchWorkerByFacility?.[
          String(facilityStorageWorkbenchWorkerPicker?.facilityKey || '')
        ]?.[
          String(facilityStorageWorkbenchWorkerPicker?.workbenchSlotKey || '')
        ]?.[
          String(facilityStorageWorkbenchWorkerPicker?.positionKey || '')
        ] || null}
        currentAssignments={(Array.isArray(facilityStorageWorkbenchWorkerPicker?.positionKeys)
          ? facilityStorageWorkbenchWorkerPicker.positionKeys
          : [facilityStorageWorkbenchWorkerPicker?.positionKey]
        ).map((key) => (
          facilityStorageWorkbenchWorkerByFacility?.[
            String(facilityStorageWorkbenchWorkerPicker?.facilityKey || '')
          ]?.[
            String(facilityStorageWorkbenchWorkerPicker?.workbenchSlotKey || '')
          ]?.[
            String(key || '')
          ] || null
        )).filter(Boolean)}
        externalEntries={facilityStorageWorkbenchWorkerPickerExternalEntries}
        activeCrew={activeCrew}
        totalCrewCountOfTypes={totalCrewCountOfTypes}
        harvestCrewTypeKeys={harvestCrewTypeKeys}
        harvestCrewIconOf={harvestCrewIconOf}
        maxSelection={4}
        onClear={() => clearWorkbenchWorkerAssignment(
          String(facilityStorageWorkbenchWorkerPicker?.facilityKey || ''),
          String(facilityStorageWorkbenchWorkerPicker?.workbenchSlotKey || ''),
          String(facilityStorageWorkbenchWorkerPicker?.positionKey || '')
        )}
        onChooseSelf={() => chooseWorkbenchWorkerAssignment('self')}
        onChooseExternal={chooseWorkbenchExternalWorkerAssignment}
        onConfirmSelections={confirmWorkbenchWorkerAssignments}
        onClose={() => setFacilityStorageWorkbenchWorkerPicker(null)}
      />
      <WarehouseStorageAuxPickers
        SlotPickerComponent={SlotPickerModal}
        entryModalOpen={facilityStorageEntryModalOpen}
        entrySelectorNode={renderFacilityStorageEntrySelector(true)}
        onCloseEntryModal={() => {
          setFacilityStorageEntryModalOpen(false);
          setFacilityStorageEntryTab('warehouse');
        }}
        harvestLoadPicker={facilityStorageHarvestLoadPicker}
        harvestLoadSourceRows={facilityStorageHarvestLoadSourceRows}
        onCloseHarvestLoadPicker={() => setFacilityStorageHarvestLoadPicker(null)}
        onChooseHarvestLoadSource={chooseHarvestPalletLoadSource}
        sortingPalletLoadPicker={facilityStorageSortingPalletLoadPicker}
        onCloseSortingPalletLoadPicker={() => setFacilityStorageSortingPalletLoadPicker(null)}
        onChooseSortingPalletLoadSource={chooseSortingStoragePalletLoadSource}
        carrierPalletLoadPicker={facilityStorageCarrierPalletLoadPicker}
        onCloseCarrierPalletLoadPicker={() => setFacilityStorageCarrierPalletLoadPicker(null)}
        onChooseCarrierPalletLoadSource={chooseCarrierPalletLoadSource}
      />
    </>
  );
}
