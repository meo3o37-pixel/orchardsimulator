import { SMALL_APC_LOADING_PARKING_KEY, SMALL_APC_SHIPPING_PARKING_KEY } from './smallApcUtils';

export const TOWN_MARKER_PARKING_SLOT_COUNT = 4;

export const TOWN_MARKER_KEYS_WITH_PARKING = new Set([
  'bank',
  'fuelStation',
  'farmMart',
  'pesticideShop',
  'machineRent',
  'smallCity',
  'townOffice',
  'landBank',
  'seedlingShop',
  'foodMart',
  'laborOffice',
  'constructionOffice',
  'maintenanceShop',
  'processingCenter',
  'usedCarDealer',
  'smallApc',
  'herbalClinic',
  'hospital',
  'villageInn',
  'villagePension',
  'motel',
  'guestHouse',
  'realEstateOffice',
  'oneRoomVilla',
  'apartment',
  'homeLivingCenter',
]);

export const TOWN_SETTLEMENT_PARKING_KEYS = Object.freeze([
  'bank',
  'fuelStation',
  'farmMart',
  'pesticideShop',
  'machineRent',
  'smallApc',
  'townOffice',
  'landBank',
  'seedlingShop',
  'foodMart',
  'laborOffice',
  'constructionOffice',
  'maintenanceShop',
  'processingCenter',
  'villageInn',
  'villagePension',
]);

export const TOWN_MARKER_PARKING_STORAGE_KEYS = new Set([
  ...TOWN_MARKER_KEYS_WITH_PARKING,
]);

export const SMALL_CITY_SETTLEMENT_PARKING_KEYS = Object.freeze([
  ...TOWN_SETTLEMENT_PARKING_KEYS.filter((key) => key !== 'processingCenter'),
  'smallCity',
  'usedCarDealer',
  'smallApc',
  'herbalClinic',
  'hospital',
  'motel',
  'guestHouse',
  'realEstateOffice',
  'oneRoomVilla',
  'apartment',
  'homeLivingCenter',
]);

export const SMALL_CITY_DOUBLE_PARKING_EXCLUDED_KEYS = Object.freeze([
  'fuelStation',
  'foodMart',
  'farmMart',
]);

export const buildSettlementParkingStorageKeys = (extraStorageKeys = []) => (
  new Set([
    ...TOWN_MARKER_PARKING_STORAGE_KEYS,
    ...extraStorageKeys,
  ])
);

export const SETTLEMENT_PARKING_STORAGE_KEYS = buildSettlementParkingStorageKeys([
  SMALL_APC_LOADING_PARKING_KEY,
  SMALL_APC_SHIPPING_PARKING_KEY,
]);

export const resolveCurrentSettlementParkingKeys = ({
  townCurrentMarkerId,
  isSmallCityContext = false,
} = {}) => {
  const currentMarkerId = String(townCurrentMarkerId || '');
  if (TOWN_MARKER_KEYS_WITH_PARKING.has(currentMarkerId)) return [currentMarkerId];
  return isSmallCityContext
    ? SMALL_CITY_SETTLEMENT_PARKING_KEYS
    : TOWN_SETTLEMENT_PARKING_KEYS;
};

export const TOWN_MARKER_DEFAULT_POSITIONS = Object.freeze({
  bank: { x: 74.2, y: 86.2 },
  fuelStation: { x: 25.9, y: 79.3 },
  farmMart: { x: 29.8, y: 56.9 },
  pesticideShop: { x: 62.8, y: 54.0 },
  machineRent: { x: 76.4, y: 57.7 },
  townOffice: { x: 75.0, y: 30.0 },
  seedlingShop: { x: 5.8, y: 66.4 },
  foodMart: { x: 43.9, y: 50.8 },
  laborOffice: { x: 56.4, y: 58.4 },
  constructionOffice: { x: 91.4, y: 28.5 },
  maintenanceShop: { x: 89.5, y: 60.3 },
  processingCenter: { x: 22.1, y: 52.4 },
  smallApc: { x: 39.2, y: 37.3 },
  herbalClinic: { x: 18.0, y: 25.3 },
  hospital: { x: 80.7, y: 52.4 },
  villageInn: { x: 57.2, y: 43.6 },
  villagePension: { x: 43.0, y: 69.3 },
});

export const SMALL_CITY_MARKER_DEFAULT_POSITIONS = Object.freeze({
  bank: { x: 65.5, y: 51.4 },
  fuelStation: { x: 61.7, y: 44.6 },
  farmMart: { x: 45.2, y: 62.2 },
  pesticideShop: { x: 17.3, y: 27.4 },
  machineRent: { x: 13.1, y: 43.1 },
  townOffice: { x: 8.5, y: 32.7 },
  seedlingShop: { x: 80.7, y: 52.4 },
  hospital: { x: 80.7, y: 52.4 },
  foodMart: { x: 67.9, y: 60.8 },
  laborOffice: { x: 93.5, y: 48.9 },
  constructionOffice: { x: 6.4, y: 55.8 },
  maintenanceShop: { x: 29.5, y: 64.2 },
  landBank: { x: 88.7, y: 35.6 },
  smallCity: { x: 20.0, y: 76.7 },
  localFoodStore: { x: 78.4, y: 68.8 },
  usedCarDealer: { x: 21.6, y: 68.5 },
  motel: { x: 88.6, y: 35.8 },
  guestHouse: { x: 35.5, y: 41.3 },
  realEstateOffice: { x: 75.0, y: 46.3 },
  oneRoomVilla: { x: 35.1, y: 32.7 },
  apartment: { x: 68.3, y: 29.4 },
  homeLivingCenter: { x: 53.8, y: 52.8 },
});

export const EXTRA_SETTLEMENT_MARKER_DEFAULT_POSITIONS = Object.freeze({
  landBank: { x: 88.7, y: 35.6 },
  smallCity: { x: 49.0, y: 17.3 },
  usedCarDealer: { x: 21.6, y: 68.5 },
});

export const createDefaultSettlementMarkerPositions = () => ({
  bankMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.bank },
  fuelMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.fuelStation },
  martMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.farmMart },
  pestMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.pesticideShop },
  machineRentMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.machineRent },
  townOfficeMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.townOffice },
  landBankMarkerPos: { ...EXTRA_SETTLEMENT_MARKER_DEFAULT_POSITIONS.landBank },
  seedlingShopMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.seedlingShop },
  foodMartMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.foodMart },
  laborOfficeMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.laborOffice },
  constructionOfficeMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.constructionOffice },
  maintenanceMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.maintenanceShop },
  processingCenterMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.processingCenter },
  smallApcMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.smallApc },
  herbalClinicMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.herbalClinic },
  villageInnMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.villageInn },
  villagePensionMarkerPos: { ...TOWN_MARKER_DEFAULT_POSITIONS.villagePension },
  smallCityMarkerPos: { ...EXTRA_SETTLEMENT_MARKER_DEFAULT_POSITIONS.smallCity },
  localFoodStoreMarkerPos: { ...SMALL_CITY_MARKER_DEFAULT_POSITIONS.localFoodStore },
  usedCarDealerMarkerPos: { ...EXTRA_SETTLEMENT_MARKER_DEFAULT_POSITIONS.usedCarDealer },
  hospitalMarkerPos: { ...SMALL_CITY_MARKER_DEFAULT_POSITIONS.hospital },
  motelMarkerPos: { ...SMALL_CITY_MARKER_DEFAULT_POSITIONS.motel },
  guestHouseMarkerPos: { ...SMALL_CITY_MARKER_DEFAULT_POSITIONS.guestHouse },
  realEstateOfficeMarkerPos: { ...SMALL_CITY_MARKER_DEFAULT_POSITIONS.realEstateOffice },
  oneRoomVillaMarkerPos: { ...SMALL_CITY_MARKER_DEFAULT_POSITIONS.oneRoomVilla },
  apartmentMarkerPos: { ...SMALL_CITY_MARKER_DEFAULT_POSITIONS.apartment },
  homeLivingCenterMarkerPos: { ...SMALL_CITY_MARKER_DEFAULT_POSITIONS.homeLivingCenter },
});

export const createDefaultSettlementState = () => ({
  ...createDefaultSettlementMarkerPositions(),
  townCurrentMarkerId: '',
  townArrivalVehicleInstanceId: '',
  townMarkerCoordsLocked: true,
  townMarkerCoordsDirty: false,
  townMarkerLayoutSavedAtDay: 0,
  townMarkerParkingSlotByKey: {},
  townMarkerParkingByKey: {},
});

export const TOWN_MARKER_POSITION_STATE_KEYS = Object.freeze({
  bank: 'bankMarkerPos',
  fuelStation: 'fuelMarkerPos',
  farmMart: 'martMarkerPos',
  pesticideShop: 'pestMarkerPos',
  machineRent: 'machineRentMarkerPos',
  townOffice: 'townOfficeMarkerPos',
  seedlingShop: 'seedlingShopMarkerPos',
  foodMart: 'foodMartMarkerPos',
  laborOffice: 'laborOfficeMarkerPos',
  constructionOffice: 'constructionOfficeMarkerPos',
  maintenanceShop: 'maintenanceMarkerPos',
  processingCenter: 'processingCenterMarkerPos',
  smallApc: 'smallApcMarkerPos',
  herbalClinic: 'herbalClinicMarkerPos',
  hospital: 'hospitalMarkerPos',
  villageInn: 'villageInnMarkerPos',
  villagePension: 'villagePensionMarkerPos',
  localFoodStore: 'localFoodStoreMarkerPos',
  motel: 'motelMarkerPos',
  guestHouse: 'guestHouseMarkerPos',
  realEstateOffice: 'realEstateOfficeMarkerPos',
  oneRoomVilla: 'oneRoomVillaMarkerPos',
  apartment: 'apartmentMarkerPos',
  homeLivingCenter: 'homeLivingCenterMarkerPos',
});

export const TOWN_MARKER_CLASS_NAMES = Object.freeze({
  bank: 'map-marker--bank',
  fuelStation: 'map-marker--fuel',
  farmMart: 'map-marker--mart',
  pesticideShop: 'map-marker--pesticide',
  machineRent: 'map-marker--machine-rent',
  townOffice: 'map-marker--town-office',
  seedlingShop: 'map-marker--seedling-shop',
  foodMart: 'map-marker--food-mart',
  laborOffice: 'map-marker--labor-office',
  constructionOffice: 'map-marker--construction-office',
  maintenanceShop: 'map-marker--maintenance',
  processingCenter: 'map-marker--processing-center',
  smallApc: 'map-marker--small-apc',
  herbalClinic: 'map-marker--herbal-clinic',
  hospital: 'map-marker--hospital',
  villageInn: 'map-marker--village-inn',
  villagePension: 'map-marker--village-pension',
  motel: 'map-marker--motel',
  guestHouse: 'map-marker--guest-house',
  realEstateOffice: 'map-marker--real-estate-office',
  oneRoomVilla: 'map-marker--one-room-villa',
  apartment: 'map-marker--apartment',
  homeLivingCenter: 'map-marker--home-living-center',
});

export const isTownParkingEligibleVehicle = (machineOrItem) => {
  const item = machineOrItem?.item || machineOrItem || null;
  const type = String(item?.type || '');
  return ['transport', 'passenger'].includes(type);
};
