import { clamp } from '../../utils/common';
import {
  EXTRA_SETTLEMENT_MARKER_DEFAULT_POSITIONS,
  SMALL_CITY_MARKER_DEFAULT_POSITIONS,
  TOWN_MARKER_CLASS_NAMES,
  TOWN_MARKER_DEFAULT_POSITIONS,
  TOWN_MARKER_POSITION_STATE_KEYS,
} from './settlementMarkersConfig';

export const normalizeSettlementMarkerPos = (pos, fallbackPos) => ({
  x: clamp(Number(pos?.x) || Number(fallbackPos?.x) || 50, 1, 99),
  y: clamp(Number(pos?.y) || Number(fallbackPos?.y) || 50, 2, 99),
});

export const normalizeTownSettlementMarkerState = (game = {}) => (
  Object.entries(TOWN_MARKER_POSITION_STATE_KEYS).reduce((acc, [markerKey, stateKey]) => {
    acc[stateKey] = normalizeSettlementMarkerPos(
      game?.[stateKey],
      TOWN_MARKER_DEFAULT_POSITIONS[markerKey] || TOWN_MARKER_DEFAULT_POSITIONS.bank,
    );
    return acc;
  }, {})
);

export const markerPosFromPointerEvent = (event, wrapEl) => {
  const rect = wrapEl?.getBoundingClientRect?.();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return { ...TOWN_MARKER_DEFAULT_POSITIONS.bank };
  }
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  return normalizeSettlementMarkerPos({ x, y }, TOWN_MARKER_DEFAULT_POSITIONS.bank);
};

export const resolveActiveSettlementContext = ({
  game,
  townMoveUserMarkers,
} = {}) => {
  const townCurrentMarkerId = String(game?.townCurrentMarkerId || '');
  const markers = Array.isArray(townMoveUserMarkers) ? townMoveUserMarkers : [];
  const activeSettlementMarker = markers.find(
    (marker) => String(marker?.id || '') === townCurrentMarkerId,
  ) || null;
  const activeSettlementName = String(activeSettlementMarker?.name || '').trim();
  const isSmallCityContext = Boolean(
    townCurrentMarkerId
    && activeSettlementMarker
    && (
      String(activeSettlementMarker?.type || 'village') === 'city'
      || /소도시/.test(String(activeSettlementMarker?.name || ''))
    )
  );

  return {
    townCurrentMarkerId,
    activeSettlementMarker,
    activeSettlementName,
    isSmallCityContext,
  };
};

const hasFiniteMarkerCoords = (pos) => (
  Number.isFinite(Number(pos?.x)) && Number.isFinite(Number(pos?.y))
);

const DIRECT_DRAG_MARKER_KEY_SET = new Set([
  'villageInn',
  'villagePension',
]);

export const resolveTownSettlementMarkerPositions = ({
  game,
  isSmallCityContext = false,
  townMarkerCoordsLocked = true,
} = {}) => {
  const townPositions = Object.entries(TOWN_MARKER_POSITION_STATE_KEYS).reduce((acc, [markerKey, stateKey]) => {
    acc[markerKey] = normalizeSettlementMarkerPos(
      game?.[stateKey],
      TOWN_MARKER_DEFAULT_POSITIONS[markerKey] || TOWN_MARKER_DEFAULT_POSITIONS.bank,
    );
    return acc;
  }, {});

  const normalizedLandBankPos = normalizeSettlementMarkerPos(
    game?.landBankMarkerPos,
    EXTRA_SETTLEMENT_MARKER_DEFAULT_POSITIONS.landBank,
  );
  const normalizedSmallCityPos = normalizeSettlementMarkerPos(
    game?.smallCityMarkerPos,
    EXTRA_SETTLEMENT_MARKER_DEFAULT_POSITIONS.smallCity,
  );
  const normalizedUsedCarDealerPos = normalizeSettlementMarkerPos(
    game?.usedCarDealerMarkerPos,
    EXTRA_SETTLEMENT_MARKER_DEFAULT_POSITIONS.usedCarDealer,
  );
  const normalizedLocalFoodStorePos = normalizeSettlementMarkerPos(
    game?.localFoodStoreMarkerPos,
    SMALL_CITY_MARKER_DEFAULT_POSITIONS.localFoodStore,
  );
  const normalizedVillageInnPos = normalizeSettlementMarkerPos(
    game?.villageInnMarkerPos,
    TOWN_MARKER_DEFAULT_POSITIONS.villageInn,
  );
  const normalizedVillagePensionPos = normalizeSettlementMarkerPos(
    game?.villagePensionMarkerPos,
    TOWN_MARKER_DEFAULT_POSITIONS.villagePension,
  );
  const normalizedMotelPos = normalizeSettlementMarkerPos(
    game?.motelMarkerPos,
    SMALL_CITY_MARKER_DEFAULT_POSITIONS.motel,
  );
  const normalizedGuestHousePos = normalizeSettlementMarkerPos(
    game?.guestHouseMarkerPos,
    SMALL_CITY_MARKER_DEFAULT_POSITIONS.guestHouse,
  );
  const normalizedRealEstateOfficePos = normalizeSettlementMarkerPos(
    game?.realEstateOfficeMarkerPos,
    SMALL_CITY_MARKER_DEFAULT_POSITIONS.realEstateOffice,
  );
  const normalizedOneRoomVillaPos = normalizeSettlementMarkerPos(
    game?.oneRoomVillaMarkerPos,
    SMALL_CITY_MARKER_DEFAULT_POSITIONS.oneRoomVilla,
  );
  const normalizedApartmentPos = normalizeSettlementMarkerPos(
    game?.apartmentMarkerPos,
    SMALL_CITY_MARKER_DEFAULT_POSITIONS.apartment,
  );
  const normalizedHomeLivingCenterPos = normalizeSettlementMarkerPos(
    game?.homeLivingCenterMarkerPos,
    SMALL_CITY_MARKER_DEFAULT_POSITIONS.homeLivingCenter,
  );
  const normalizedHospitalPos = normalizeSettlementMarkerPos(
    game?.hospitalMarkerPos,
    SMALL_CITY_MARKER_DEFAULT_POSITIONS.hospital,
  );
  const hasSavedMarkerLayout = Math.max(0, Math.floor(Number(game?.townMarkerLayoutSavedAtDay) || 0)) > 0;
  const editablePos = (stateKey, fallbackPos) => (
    (townMarkerCoordsLocked && !hasSavedMarkerLayout) || !hasFiniteMarkerCoords(game?.[stateKey])
      ? fallbackPos
      : normalizeSettlementMarkerPos(game?.[stateKey], fallbackPos)
  );

  return {
    bank: isSmallCityContext
      ? editablePos('bankMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.bank)
      : editablePos('bankMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.bank),
    fuelStation: isSmallCityContext
      ? editablePos('fuelMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.fuelStation)
      : editablePos('fuelMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.fuelStation),
    farmMart: isSmallCityContext
      ? editablePos('martMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.farmMart)
      : editablePos('martMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.farmMart),
    pesticideShop: isSmallCityContext
      ? editablePos('pestMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.pesticideShop)
      : editablePos('pestMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.pesticideShop),
    machineRent: isSmallCityContext
      ? editablePos('machineRentMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.machineRent)
      : editablePos('machineRentMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.machineRent),
    townOffice: isSmallCityContext
      ? editablePos('townOfficeMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.townOffice)
      : editablePos('townOfficeMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.townOffice),
    landBank: isSmallCityContext
      ? editablePos('landBankMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.landBank)
      : editablePos('landBankMarkerPos', EXTRA_SETTLEMENT_MARKER_DEFAULT_POSITIONS.landBank),
    seedlingShop: isSmallCityContext
      ? editablePos('seedlingShopMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.seedlingShop)
      : editablePos('seedlingShopMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.seedlingShop),
    foodMart: isSmallCityContext
      ? editablePos('foodMartMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.foodMart)
      : editablePos('foodMartMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.foodMart),
    laborOffice: isSmallCityContext
      ? editablePos('laborOfficeMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.laborOffice)
      : editablePos('laborOfficeMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.laborOffice),
    constructionOffice: isSmallCityContext
      ? editablePos('constructionOfficeMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.constructionOffice)
      : editablePos('constructionOfficeMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.constructionOffice),
    maintenanceShop: isSmallCityContext
      ? editablePos('maintenanceMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.maintenanceShop)
      : editablePos('maintenanceMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.maintenanceShop),
    processingCenter: editablePos('processingCenterMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.processingCenter),
    smallApc: editablePos('smallApcMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.smallApc),
    herbalClinic: editablePos('herbalClinicMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.herbalClinic),
    villageInn: editablePos('villageInnMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.villageInn),
    villagePension: editablePos('villagePensionMarkerPos', TOWN_MARKER_DEFAULT_POSITIONS.villagePension),
    smallCity: isSmallCityContext
      ? editablePos('smallCityMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.smallCity)
      : normalizedSmallCityPos,
    localFoodStore: isSmallCityContext
      ? editablePos('localFoodStoreMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.localFoodStore)
      : editablePos('localFoodStoreMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.localFoodStore),
    usedCarDealer: isSmallCityContext
      ? editablePos('usedCarDealerMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.usedCarDealer)
      : normalizedUsedCarDealerPos,
    motel: editablePos('motelMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.motel),
    guestHouse: editablePos('guestHouseMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.guestHouse),
    realEstateOffice: editablePos('realEstateOfficeMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.realEstateOffice),
    oneRoomVilla: editablePos('oneRoomVillaMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.oneRoomVilla),
    apartment: editablePos('apartmentMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.apartment),
    homeLivingCenter: editablePos('homeLivingCenterMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.homeLivingCenter),
    hospital: isSmallCityContext
      ? editablePos('hospitalMarkerPos', SMALL_CITY_MARKER_DEFAULT_POSITIONS.hospital)
      : normalizedHospitalPos,
  };
};

export const buildTownSettlementMarkerViewModel = ({
  mapMarkerNameOf,
  positions,
  isSmallCityContext = false,
} = {}) => {
  const resolveLabel = (markerKey) => String(mapMarkerNameOf?.(markerKey) || markerKey || '마커');
  const markerKeys = [
    'bank',
    'fuelStation',
    'farmMart',
    'pesticideShop',
    'machineRent',
    'townOffice',
    'seedlingShop',
    'foodMart',
    'laborOffice',
    'constructionOffice',
    'maintenanceShop',
    'processingCenter',
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
  ];
  const markerRows = markerKeys.map((key) => ({
    key,
    label: resolveLabel(key),
    className: TOWN_MARKER_CLASS_NAMES[key] || '',
    stateKey: TOWN_MARKER_POSITION_STATE_KEYS[key] || '',
    pos: normalizeSettlementMarkerPos(
      positions?.[key],
      TOWN_MARKER_DEFAULT_POSITIONS[key] || TOWN_MARKER_DEFAULT_POSITIONS.bank,
    ),
    directDrag: DIRECT_DRAG_MARKER_KEY_SET.has(key),
    hidden: (
      (isSmallCityContext && ['processingCenter', 'smallApc', 'herbalClinic', 'seedlingShop', 'villageInn', 'villagePension'].includes(key))
      || (!isSmallCityContext && ['hospital', 'motel', 'guestHouse', 'realEstateOffice', 'oneRoomVilla', 'apartment', 'homeLivingCenter'].includes(key))
    ),
    draggable: key !== 'processingCenter',
  }));
  const coordRows = markerRows.filter((row) => !row.hidden);
  return { markerRows, coordRows };
};
