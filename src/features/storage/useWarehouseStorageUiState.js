import React, { useCallback, useRef, useState } from 'react';

export function useWarehouseStorageUiState() {
  const [facilityStorageModal, setFacilityStorageModal] = useState({ open: false, facilityKey: '', facilityName: '' });
  const [facilityStorageEntryModalOpen, setFacilityStorageEntryModalOpen] = useState(false);
  const [facilityStorageEntryTab, setFacilityStorageEntryTab] = useState('warehouse');
  const [facilityStorageEntryPanelSlideDirection, setFacilityStorageEntryPanelSlideDirection] = useState('forward');
  const [facilityStorageEntryPanelSlideArmed, setFacilityStorageEntryPanelSlideArmed] = useState(false);
  const [facilityStorageTab, setFacilityStorageTab] = useState('all');
  const [facilityStorageTabByFacility, setFacilityStorageTabByFacility] = useState({});
  const [facilityStorageFacilityTab, setFacilityStorageFacilityTab] = useState('sorting');
  const [facilityStorageFacilityTabByFacility, setFacilityStorageFacilityTabByFacility] = useState({});
  const [facilityStoragePanelSlideDirection, setFacilityStoragePanelSlideDirection] = useState('forward');
  const [facilityStoragePanelSlideArmed, setFacilityStoragePanelSlideArmed] = useState(false);
  const [facilityStorageCarrierViewTab, setFacilityStorageCarrierViewTab] = useState('cargo');
  const [facilityStorageCarrierViewPanelSlideDirection, setFacilityStorageCarrierViewPanelSlideDirection] = useState('forward');
  const [facilityStorageCarrierViewPanelSlideArmed, setFacilityStorageCarrierViewPanelSlideArmed] = useState(false);
  const [facilityStorageSelectedLoadMachineId, setFacilityStorageSelectedLoadMachineId] = useState('');
  const [facilityStorageSelectedCarrierId, setFacilityStorageSelectedCarrierId] = useState('');
  const [facilityStorageSelectedTransportKey, setFacilityStorageSelectedTransportKey] = useState('');
  const [facilityStorageCarrierOnlyMode, setFacilityStorageCarrierOnlyMode] = useState(false);
  const [facilityStorageAnchorCarrierId, setFacilityStorageAnchorCarrierId] = useState('');
  const [facilityStorageShareModalOpen, setFacilityStorageShareModalOpen] = useState(false);
  const [facilityStorageHarvestSlotByFacility, setFacilityStorageHarvestSlotByFacility] = useState({});
  const [facilityStorageHarvestLoadPicker, setFacilityStorageHarvestLoadPicker] = useState(null);
  const [facilityStorageSortingPalletByEquipment, setFacilityStorageSortingPalletByEquipment] = useState({});
  const [facilityStorageSortingPalletLoadPicker, setFacilityStorageSortingPalletLoadPicker] = useState(null);
  const [facilityStorageSortingWorkerByEquipment, setFacilityStorageSortingWorkerByEquipment] = useState({});
  const [facilityStorageSortingWorkerPicker, setFacilityStorageSortingWorkerPicker] = useState(null);
  const [facilityStorageWorkbenchPalletByFacility, setFacilityStorageWorkbenchPalletByFacility] = useState({});
  const [facilityStorageWorkbenchWorkerByFacility, setFacilityStorageWorkbenchWorkerByFacility] = useState({});
  const [facilityStorageWorkbenchWorkerPicker, setFacilityStorageWorkbenchWorkerPicker] = useState(null);
  const [facilityStorageCarrierPalletLoadPicker, setFacilityStorageCarrierPalletLoadPicker] = useState(null);
  const [facilityStorageHarvestUnloadPicker, setFacilityStorageHarvestUnloadPicker] = useState(null);
  const [facilityStorageHarvestMovePicker, setFacilityStorageHarvestMovePicker] = useState(null);
  const [facilityStorageSelectedTransportMode, setFacilityStorageSelectedTransportMode] = useState('pallet');
  const [facilityStorageHarvestMovePanelSlideDirection, setFacilityStorageHarvestMovePanelSlideDirection] = useState('forward');
  const [facilityStorageHarvestMovePanelSlideArmed, setFacilityStorageHarvestMovePanelSlideArmed] = useState(false);
  const [facilityStorageHarvestMoveWarehousePanelSlideDirection, setFacilityStorageHarvestMoveWarehousePanelSlideDirection] = useState('forward');
  const [facilityStorageHarvestMoveWarehousePanelSlideArmed, setFacilityStorageHarvestMoveWarehousePanelSlideArmed] = useState(false);
  const [facilityStorageHarvestGeneralMovePicker, setFacilityStorageHarvestGeneralMovePicker] = useState(null);
  const [facilityStorageHarvestGeneralMovePanelSlideDirection, setFacilityStorageHarvestGeneralMovePanelSlideDirection] = useState('forward');
  const [facilityStorageHarvestGeneralMovePanelSlideArmed, setFacilityStorageHarvestGeneralMovePanelSlideArmed] = useState(false);
  const [facilityStorageHarvestDetailSlotNo, setFacilityStorageHarvestDetailSlotNo] = useState(0);
  const [facilityStorageHarvestDetailSource, setFacilityStorageHarvestDetailSource] = useState(null);
  const [facilityStorageHarvestDetailLayer, setFacilityStorageHarvestDetailLayer] = useState('bottom');
  const [facilityStorageHarvestDetailMode, setFacilityStorageHarvestDetailMode] = useState('inspect');
  const [facilityStorageHarvestVisibleLayerBySlot, setFacilityStorageHarvestVisibleLayerBySlot] = useState({});
  const [facilityStorageHarvestIndividualFillAnimBySlot, setFacilityStorageHarvestIndividualFillAnimBySlot] = useState({});
  const [facilityStorageHarvestStackAnimBySlot, setFacilityStorageHarvestStackAnimBySlot] = useState({});
  const [facilityStorageHarvestGeneralFirstLoadAnimByRow, setFacilityStorageHarvestGeneralFirstLoadAnimByRow] = useState({});
  const [facilityStorageCarrierPalletVisibleLayerBySlot, setFacilityStorageCarrierPalletVisibleLayerBySlot] = useState({});
  const facilityStorageEntryPrevTabRef = useRef('warehouse');
  const facilityStoragePrevViewKeyRef = useRef('all');
  const facilityStorageCarrierViewPrevTabRef = useRef('cargo');
  const facilityStorageHarvestMovePrevViewKeyRef = useRef('warehouse:storage');
  const facilityStorageHarvestMovePrevWarehouseKeyRef = useRef('');
  const facilityStorageHarvestGeneralMovePrevTabRef = useRef('current-pallet');
  const facilityStorageHarvestIndividualFillAnimTimersRef = useRef({});
  const facilityStorageHarvestStackAnimTimersRef = useRef({});
  const facilityStorageHarvestGeneralFirstLoadAnimTimersRef = useRef({});
  const [facilityStorageRightHeightPx, setFacilityStorageRightHeightPx] = useState(0);
  const [facilityStorageGeneralGridMaxHeightPx, setFacilityStorageGeneralGridMaxHeightPx] = useState(0);
  const [facilityStorageHarvestTab, setFacilityStorageHarvestTab] = useState('pallet');
  const facilityStorageLeftModalRef = React.useRef(null);
  const facilityStorageGeneralGridRef = React.useRef(null);
  const openFacilityStorageHarvestDetail = useCallback(({ layerKey = 'bottom', slotNo = 0, source = null, mode = 'inspect' } = {}) => {
    setFacilityStorageHarvestDetailLayer(String(layerKey || '') === 'top' ? 'top' : 'bottom');
    setFacilityStorageHarvestDetailSlotNo(Math.max(1, Math.floor(Number(slotNo) || 1)));
    setFacilityStorageHarvestDetailSource(source || null);
    setFacilityStorageHarvestDetailMode(String(mode || '') === 'source-select' ? 'source-select' : 'inspect');
  }, []);
  const closeFacilityStorageHarvestDetail = useCallback(() => {
    setFacilityStorageHarvestDetailSlotNo(0);
    setFacilityStorageHarvestDetailSource(null);
    setFacilityStorageHarvestDetailLayer('bottom');
    setFacilityStorageHarvestDetailMode('inspect');
  }, []);

  return {
    facilityStorageModal,
    setFacilityStorageModal,
    facilityStorageEntryModalOpen,
    setFacilityStorageEntryModalOpen,
    facilityStorageEntryTab,
    setFacilityStorageEntryTab,
    facilityStorageEntryPanelSlideDirection,
    setFacilityStorageEntryPanelSlideDirection,
    facilityStorageEntryPanelSlideArmed,
    setFacilityStorageEntryPanelSlideArmed,
    facilityStorageTab,
    setFacilityStorageTab,
    facilityStorageTabByFacility,
    setFacilityStorageTabByFacility,
    facilityStorageFacilityTab,
    setFacilityStorageFacilityTab,
    facilityStorageFacilityTabByFacility,
    setFacilityStorageFacilityTabByFacility,
    facilityStoragePanelSlideDirection,
    setFacilityStoragePanelSlideDirection,
    facilityStoragePanelSlideArmed,
    setFacilityStoragePanelSlideArmed,
    facilityStorageCarrierViewTab,
    setFacilityStorageCarrierViewTab,
    facilityStorageCarrierViewPanelSlideDirection,
    setFacilityStorageCarrierViewPanelSlideDirection,
    facilityStorageCarrierViewPanelSlideArmed,
    setFacilityStorageCarrierViewPanelSlideArmed,
    facilityStorageSelectedLoadMachineId,
    setFacilityStorageSelectedLoadMachineId,
    facilityStorageSelectedCarrierId,
    setFacilityStorageSelectedCarrierId,
    facilityStorageSelectedTransportKey,
    setFacilityStorageSelectedTransportKey,
    facilityStorageCarrierOnlyMode,
    setFacilityStorageCarrierOnlyMode,
    facilityStorageAnchorCarrierId,
    setFacilityStorageAnchorCarrierId,
    facilityStorageShareModalOpen,
    setFacilityStorageShareModalOpen,
    facilityStorageHarvestSlotByFacility,
    setFacilityStorageHarvestSlotByFacility,
    facilityStorageHarvestLoadPicker,
    setFacilityStorageHarvestLoadPicker,
    facilityStorageSortingPalletByEquipment,
    setFacilityStorageSortingPalletByEquipment,
    facilityStorageSortingPalletLoadPicker,
    setFacilityStorageSortingPalletLoadPicker,
    facilityStorageSortingWorkerByEquipment,
    setFacilityStorageSortingWorkerByEquipment,
    facilityStorageSortingWorkerPicker,
    setFacilityStorageSortingWorkerPicker,
    facilityStorageWorkbenchPalletByFacility,
    setFacilityStorageWorkbenchPalletByFacility,
    facilityStorageWorkbenchWorkerByFacility,
    setFacilityStorageWorkbenchWorkerByFacility,
    facilityStorageWorkbenchWorkerPicker,
    setFacilityStorageWorkbenchWorkerPicker,
    facilityStorageCarrierPalletLoadPicker,
    setFacilityStorageCarrierPalletLoadPicker,
    facilityStorageHarvestUnloadPicker,
    setFacilityStorageHarvestUnloadPicker,
    facilityStorageHarvestMovePicker,
    setFacilityStorageHarvestMovePicker,
    facilityStorageSelectedTransportMode,
    setFacilityStorageSelectedTransportMode,
    facilityStorageHarvestMovePanelSlideDirection,
    setFacilityStorageHarvestMovePanelSlideDirection,
    facilityStorageHarvestMovePanelSlideArmed,
    setFacilityStorageHarvestMovePanelSlideArmed,
    facilityStorageHarvestMoveWarehousePanelSlideDirection,
    setFacilityStorageHarvestMoveWarehousePanelSlideDirection,
    facilityStorageHarvestMoveWarehousePanelSlideArmed,
    setFacilityStorageHarvestMoveWarehousePanelSlideArmed,
    facilityStorageHarvestGeneralMovePicker,
    setFacilityStorageHarvestGeneralMovePicker,
    facilityStorageHarvestGeneralMovePanelSlideDirection,
    setFacilityStorageHarvestGeneralMovePanelSlideDirection,
    facilityStorageHarvestGeneralMovePanelSlideArmed,
    setFacilityStorageHarvestGeneralMovePanelSlideArmed,
    facilityStorageHarvestDetailSlotNo,
    setFacilityStorageHarvestDetailSlotNo,
    facilityStorageHarvestDetailSource,
    setFacilityStorageHarvestDetailSource,
    facilityStorageHarvestDetailLayer,
    setFacilityStorageHarvestDetailLayer,
    facilityStorageHarvestDetailMode,
    setFacilityStorageHarvestDetailMode,
    facilityStorageHarvestVisibleLayerBySlot,
    setFacilityStorageHarvestVisibleLayerBySlot,
    facilityStorageHarvestIndividualFillAnimBySlot,
    setFacilityStorageHarvestIndividualFillAnimBySlot,
    facilityStorageHarvestStackAnimBySlot,
    setFacilityStorageHarvestStackAnimBySlot,
    facilityStorageHarvestGeneralFirstLoadAnimByRow,
    setFacilityStorageHarvestGeneralFirstLoadAnimByRow,
    facilityStorageCarrierPalletVisibleLayerBySlot,
    setFacilityStorageCarrierPalletVisibleLayerBySlot,
    facilityStorageEntryPrevTabRef,
    facilityStoragePrevViewKeyRef,
    facilityStorageCarrierViewPrevTabRef,
    facilityStorageHarvestMovePrevViewKeyRef,
    facilityStorageHarvestMovePrevWarehouseKeyRef,
    facilityStorageHarvestGeneralMovePrevTabRef,
    facilityStorageHarvestIndividualFillAnimTimersRef,
    facilityStorageHarvestStackAnimTimersRef,
    facilityStorageHarvestGeneralFirstLoadAnimTimersRef,
    facilityStorageRightHeightPx,
    setFacilityStorageRightHeightPx,
    facilityStorageGeneralGridMaxHeightPx,
    setFacilityStorageGeneralGridMaxHeightPx,
    facilityStorageHarvestTab,
    setFacilityStorageHarvestTab,
    facilityStorageLeftModalRef,
    facilityStorageGeneralGridRef,
    openFacilityStorageHarvestDetail,
    closeFacilityStorageHarvestDetail
  };
}
