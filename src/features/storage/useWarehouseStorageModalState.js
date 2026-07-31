import React, { useState } from 'react';

export function useWarehouseStorageModalState() {
  const [facilityStorageWorkbenchInOutModal, setFacilityStorageWorkbenchInOutModal] = useState(null);
  const [facilityStorageWorkbenchInOutFocus, setFacilityStorageWorkbenchInOutFocus] = useState(null);
  const [facilityStorageWorkbenchInOutSelectionByFacility, setFacilityStorageWorkbenchInOutSelectionByFacility] = useState({});
  const [facilityStorageWorkbenchOutputRulePicker, setFacilityStorageWorkbenchOutputRulePicker] = useState(null);
  const [facilityStorageSortingInOutModal, setFacilityStorageSortingInOutModal] = useState(null);
  const [facilityStorageSortingInOutFocus, setFacilityStorageSortingInOutFocus] = useState(null);
  const [facilityStorageSortingInOutSelectionByFacility, setFacilityStorageSortingInOutSelectionByFacility] = useState({});
  const [facilityStorageSortingOutputRulePicker, setFacilityStorageSortingOutputRulePicker] = useState(null);
  const [facilityStorageWorkbenchTaskPicker, setFacilityStorageWorkbenchTaskPicker] = useState(null);
  const [facilityStorageWorkbenchTaskByFacility, setFacilityStorageWorkbenchTaskByFacility] = useState({});
  const [facilityStorageWorkbenchBoxPicker, setFacilityStorageWorkbenchBoxPicker] = useState(null);
  const [facilityStorageWorkbenchBoxSelectionByFacility, setFacilityStorageWorkbenchBoxSelectionByFacility] = useState({});
  const [facilityStorageSortingBoxPicker, setFacilityStorageSortingBoxPicker] = useState(null);
  const [facilityStorageSortingBoxSelectionByFacility, setFacilityStorageSortingBoxSelectionByFacility] = useState({});
  const [facilityStorageOtherWarehouseTransferPicker, setFacilityStorageOtherWarehouseTransferPicker] = useState(null);
  const [facilityStorageClosing, setFacilityStorageClosing] = useState(false);
  const [facilityStoragePersonalOnlyMode, setFacilityStoragePersonalOnlyMode] = useState(false);
  const [facilityStorageSortingRunConfirm, setFacilityStorageSortingRunConfirm] = useState(null);
  const [facilityStorageSortingRunTargetByEquipment, setFacilityStorageSortingRunTargetByEquipment] = useState({});
  const [facilityStorageSortingAnimatingByEquipment, setFacilityStorageSortingAnimatingByEquipment] = useState({});
  const [facilityStorageSortingAnimationProgressByEquipment, setFacilityStorageSortingAnimationProgressByEquipment] = useState({});
  const facilityStorageSortingRunConfirmSourceRef = React.useRef(null);

  return {
    facilityStorageWorkbenchInOutModal,
    setFacilityStorageWorkbenchInOutModal,
    facilityStorageWorkbenchInOutFocus,
    setFacilityStorageWorkbenchInOutFocus,
    facilityStorageWorkbenchInOutSelectionByFacility,
    setFacilityStorageWorkbenchInOutSelectionByFacility,
    facilityStorageWorkbenchOutputRulePicker,
    setFacilityStorageWorkbenchOutputRulePicker,
    facilityStorageSortingInOutModal,
    setFacilityStorageSortingInOutModal,
    facilityStorageSortingInOutFocus,
    setFacilityStorageSortingInOutFocus,
    facilityStorageSortingInOutSelectionByFacility,
    setFacilityStorageSortingInOutSelectionByFacility,
    facilityStorageSortingOutputRulePicker,
    setFacilityStorageSortingOutputRulePicker,
    facilityStorageWorkbenchTaskPicker,
    setFacilityStorageWorkbenchTaskPicker,
    facilityStorageWorkbenchTaskByFacility,
    setFacilityStorageWorkbenchTaskByFacility,
    facilityStorageWorkbenchBoxPicker,
    setFacilityStorageWorkbenchBoxPicker,
    facilityStorageWorkbenchBoxSelectionByFacility,
    setFacilityStorageWorkbenchBoxSelectionByFacility,
    facilityStorageSortingBoxPicker,
    setFacilityStorageSortingBoxPicker,
    facilityStorageSortingBoxSelectionByFacility,
    setFacilityStorageSortingBoxSelectionByFacility,
    facilityStorageOtherWarehouseTransferPicker,
    setFacilityStorageOtherWarehouseTransferPicker,
    facilityStorageClosing,
    setFacilityStorageClosing,
    facilityStoragePersonalOnlyMode,
    setFacilityStoragePersonalOnlyMode,
    facilityStorageSortingRunConfirm,
    setFacilityStorageSortingRunConfirm,
    facilityStorageSortingRunTargetByEquipment,
    setFacilityStorageSortingRunTargetByEquipment,
    facilityStorageSortingAnimatingByEquipment,
    setFacilityStorageSortingAnimatingByEquipment,
    facilityStorageSortingAnimationProgressByEquipment,
    setFacilityStorageSortingAnimationProgressByEquipment,
    facilityStorageSortingRunConfirmSourceRef,
  };
}
