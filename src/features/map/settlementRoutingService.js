export const openSettlementMapLocation = (
  setMapLocationModal,
  {
    key = '',
    tab = 'tool',
    view = 'menu',
    parkingReturnKey = '',
  } = {}
) => {
  setMapLocationModal?.({
    open: true,
    key,
    tab,
    view,
    parkingReturnKey,
  });
};

export const createSettlementModalOpeners = ({
  setMapLocationModal,
  setGameAlertMessage,
  openSmallApcMapModal,
} = {}) => ({
  openMapFarmMartModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'farmMart',
    tab: 'tool',
    view: 'menu',
    parkingReturnKey: 'farmMart',
  }),
  openMapBankModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'bank',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'bank',
  }),
  openMapFuelStationModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'fuelStation',
    tab: 'fuel',
    view: 'menu',
    parkingReturnKey: 'fuelStation',
  }),
  openMapPesticideModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'pesticideShop',
    tab: 'all',
    view: 'menu',
    parkingReturnKey: 'pesticideShop',
  }),
  openMapSeedlingModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'seedlingShop',
    tab: 'seedling',
    view: 'menu',
    parkingReturnKey: 'seedlingShop',
  }),
  openMapMachineRentModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'machineRent',
    tab: 'machine',
    view: 'menu',
    parkingReturnKey: 'machineRent',
  }),
  openMapTownOfficeMachineRentModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'townOffice',
    tab: 'machine',
    view: 'rental',
    parkingReturnKey: 'townOffice',
  }),
  openMapTownOfficeModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'townOffice',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'townOffice',
  }),
  openMapSmallCityModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'smallCity',
    tab: 'transport',
    view: 'menu',
    parkingReturnKey: 'smallCity',
  }),
  openMapUsedCarDealerModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'usedCarDealer',
    tab: 'transport',
    view: 'menu',
    parkingReturnKey: 'usedCarDealer',
  }),
  openMapLandBankModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'landBank',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'landBank',
  }),
  openMapLaborOfficeModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'laborOffice',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'laborOffice',
  }),
  openMapFoodMartModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'foodMart',
    tab: 'all',
    view: 'menu',
    parkingReturnKey: 'foodMart',
  }),
  openMapConstructionModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'constructionOffice',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'constructionOffice',
  }),
  openMapMaintenanceModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'maintenanceShop',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'maintenanceShop',
  }),
  openMapVillageInnModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'villageInn',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'villageInn',
  }),
  openMapVillagePensionModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'villagePension',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'villagePension',
  }),
  openMapMotelModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'motel',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'motel',
  }),
  openMapGuestHouseModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'guestHouse',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'guestHouse',
  }),
  openMapRealEstateOfficeModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'realEstateOffice',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'realEstateOffice',
  }),
  openMapOneRoomVillaModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'oneRoomVilla',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'oneRoomVilla',
  }),
  openMapApartmentModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'apartment',
    tab: 'service',
    view: 'menu',
    parkingReturnKey: 'apartment',
  }),
  openMapHomeLivingCenterModal: () => openSettlementMapLocation(setMapLocationModal, {
    key: 'homeLivingCenter',
    tab: 'shop',
    view: 'menu',
    parkingReturnKey: 'homeLivingCenter',
  }),
  openMapProcessingCenterModal: () => setGameAlertMessage?.('농산물가공센터 기능은 준비 중입니다.'),
  openMapHerbalClinicModal: () => setGameAlertMessage?.('한의원 기능은 준비 중입니다.'),
  openSmallApcMapModal: () => openSmallApcMapModal?.(setMapLocationModal),
});

export const resolveSettlementMarkerAction = (destinationKeyRaw, handlers = {}) => {
  const destinationKey = String(destinationKeyRaw || '');
  const actionMap = {
    bank: handlers.openMapBankModal,
    fuelStation: handlers.openMapFuelStationModal,
    farmMart: handlers.openMapFarmMartModal,
    pesticideShop: handlers.openMapPesticideModal,
    machineRent: handlers.openMapMachineRentModal,
    processingCenter: handlers.openMapProcessingCenterModal,
    seedlingShop: handlers.openMapSeedlingModal,
    foodMart: handlers.openMapFoodMartModal,
    townOffice: handlers.openMapTownOfficeModal,
    landBank: handlers.openMapLandBankModal,
    laborOffice: handlers.openMapLaborOfficeModal,
    constructionOffice: handlers.openMapConstructionModal,
    maintenanceShop: handlers.openMapMaintenanceModal,
    villageInn: handlers.openMapVillageInnModal,
    villagePension: handlers.openMapVillagePensionModal,
    motel: handlers.openMapMotelModal,
    guestHouse: handlers.openMapGuestHouseModal,
    realEstateOffice: handlers.openMapRealEstateOfficeModal,
    oneRoomVilla: handlers.openMapOneRoomVillaModal,
    apartment: handlers.openMapApartmentModal,
    homeLivingCenter: handlers.openMapHomeLivingCenterModal,
    herbalClinic: handlers.openMapHerbalClinicModal,
    smallApc: handlers.openSmallApcMapModal,
    smallCity: handlers.openMapSmallCityModal,
    usedCarDealer: handlers.openMapUsedCarDealerModal,
  };
  const fn = actionMap[destinationKey];
  if (typeof fn !== 'function') return false;
  fn();
  return true;
};

export const resolveSettlementMenuEntryAction = (markerKeyRaw, handlers = {}) => {
  const markerKey = String(markerKeyRaw || '');
  if (markerKey === 'machineRent' || markerKey === 'smallCity' || markerKey === 'usedCarDealer') {
    handlers.setMapLocationModal?.((prev) => ({
      ...prev,
      view: markerKey === 'usedCarDealer' ? 'used' : 'shop',
      tab: markerKey === 'smallCity' || markerKey === 'usedCarDealer' ? 'transport' : 'machine',
    }));
    return true;
  }
  if (markerKey === 'townOffice' || markerKey === 'landBank') {
    handlers.setMapLocationModal?.((prev) => ({ ...prev, view: 'landBank' }));
    return true;
  }
  if (markerKey === 'foodMart') {
    handlers.setMapLocationModal?.((prev) => ({ ...prev, view: 'shop', tab: 'all' }));
    return true;
  }
  handlers.closeMapLocationModal?.();
  if (markerKey === 'laborOffice') {
    handlers.setTabGroup?.('management');
    handlers.setTab?.('crew');
    return true;
  }
  if (markerKey === 'constructionOffice') {
    handlers.setTabGroup?.('management');
    handlers.setTab?.('facility');
    return true;
  }
  if (markerKey === 'maintenanceShop') {
    handlers.setGameAlertMessage?.('정비소 상점은 현재 미구현 상태입니다.\n구현 예정입니다.');
    return true;
  }
  if (markerKey === 'smallApc') {
    handlers.enterSmallApcMapReceivingView?.(handlers.setMapLocationModal);
    return true;
  }
  return false;
};
