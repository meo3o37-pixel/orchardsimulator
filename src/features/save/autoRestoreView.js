import { clamp } from '../../utils/common';

const SAFE_RESTORE_PHONE_APPS = new Set([
  'bank',
  'weather',
  'messages',
  'contacts',
  'labor',
  'health',
  'settings',
  'apple-helper-chat'
]);

const SAFE_RESTORE_HOUSING_OBJECTS = new Set([
  'fridge',
  'meal',
  'bed',
  'hvac',
  'bathroom',
  'closet',
  'storage',
  'window',
  'pc',
  'livingDetail',
  'farmLog',
  'calendar'
]);

const SAFE_RESTORE_MAP_LOCATION_KEYS = new Set([
  'farmMart',
  'pesticideShop',
  'seedlingShop',
  'fuelStation',
  'machineRent',
  'smallCity',
  'foodMart',
  'constructionOffice',
  'maintenanceShop',
  'smallApc',
  'bank',
  'townOffice',
  'landBank',
  'laborOffice'
]);

const SAFE_RESTORE_MAP_LOCATION_VIEWS = new Set(['menu', 'shop', 'pickup', 'office']);

const sanitizeRestoreKey = (value, fallback = '') => {
  const next = String(value || '').trim();
  return /^[a-zA-Z0-9:_-]{1,40}$/.test(next) ? next : fallback;
};

const sanitizeRestorableMapLocationModal = (raw = {}) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const key = SAFE_RESTORE_MAP_LOCATION_KEYS.has(String(source.key || '')) ? String(source.key) : '';
  const open = Boolean(source.open) && Boolean(key);
  return {
    open,
    key: open ? key : '',
    tab: sanitizeRestoreKey(source.tab, key === 'foodMart' ? 'all' : 'tool'),
    view: SAFE_RESTORE_MAP_LOCATION_VIEWS.has(String(source.view || '')) ? String(source.view) : 'shop',
    parkingReturnKey: sanitizeRestoreKey(source.parkingReturnKey, '')
  };
};

export const sanitizeLastActiveSaveSlotPreference = (value, slotCount = 0) => {
  if (value == null || value === '') return null;
  const slot = Math.floor(Number(value));
  return Number.isInteger(slot) && slot >= 0 && slot < Math.max(0, Number(slotCount) || 0) ? slot : null;
};

const sanitizeRestorableExternalMapCenter = (raw = {}, config = {}) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const fallback = config.externalMapPreset?.center || { x: 0, y: 0 };
  const safeX = Number.isFinite(Number(source.x)) ? Number(source.x) : Number(fallback.x) || 0;
  const safeY = Number.isFinite(Number(source.y)) ? Number(source.y) : Number(fallback.y) || 0;
  return {
    x: Number(clamp(safeX, -config.externalMapMaxX, config.externalMapMaxX).toFixed(2)),
    y: Number(clamp(safeY, -config.externalMapMaxY, config.externalMapMaxY).toFixed(2))
  };
};

export const sanitizeLastViewStatePreference = (raw = {}, config = {}) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const safeScreen = String(source.screen || '') === 'game' ? 'game' : 'menu';
  const safeTab = ['farm', 'storage', 'map', 'landBank', 'warehouse', 'crew', 'shop', 'facility', 'log'].includes(String(source.tab || '')) ? String(source.tab) : 'farm';
  const safeFocusTab = ['cropStatus', 'manage', 'housing', 'landFacility', 'work', 'workOrder'].includes(String(source.focusTab || '')) ? String(source.focusTab) : 'manage';
  const safePhoneApp = SAFE_RESTORE_PHONE_APPS.has(String(source.phoneOpenedApp || '')) ? String(source.phoneOpenedApp) : '';
  const safeHousingObjectKey = SAFE_RESTORE_HOUSING_OBJECTS.has(String(source.housingInteriorPendingObjectKey || '')) ? String(source.housingInteriorPendingObjectKey) : '';
  const externalMapOpen = Boolean(source.externalMapOpen);
  const mapLocationModal = sanitizeRestorableMapLocationModal(source.mapLocationModal || {});
  const defaultShopTab = String(config.defaultManagementShopTab || 'machine');
  const defaultExternalMapZoom = Number(config.externalMapTownMoveDefaultZoom) || 0.5;
  const minExternalMapZoom = Number(config.externalMapTownMoveMinZoom) || 0.25;
  const maxExternalMapZoom = Number(config.externalMapMaxZoom) || 10;
  return {
    screen: safeScreen,
    tab: safeTab,
    tabGroup: ['farmOps'].includes(String(source.tabGroup || '')) ? String(source.tabGroup) : 'farmOps',
    focusTab: safeFocusTab,
    warehouseTab: sanitizeRestoreKey(source.warehouseTab, 'all'),
    shopTab: sanitizeRestoreKey(source.shopTab, defaultShopTab),
    landFacilityMainTab: ['types', 'warehouse', 'parking', 'control'].includes(String(source.landFacilityMainTab || '')) ? String(source.landFacilityMainTab) : 'types',
    landFacilitySubTab: sanitizeRestoreKey(source.landFacilitySubTab, 'land'),
    housingViewMode: ['list', 'detail'].includes(String(source.housingViewMode || '')) ? String(source.housingViewMode) : 'list',
    housingViewSelectedFacilityKey: sanitizeRestoreKey(source.housingViewSelectedFacilityKey, ''),
    housingInteriorFacilityKey: sanitizeRestoreKey(source.housingInteriorFacilityKey, ''),
    housingInteriorPendingObjectKey: safeHousingObjectKey,
    externalMapOpen,
    externalMapLocationContext: String(source.externalMapLocationContext || '') === 'town' ? 'town' : 'field',
    externalMapFieldSelectMode: Boolean(source.externalMapFieldSelectMode),
    externalMapZoom: Number(clamp(Number(source.externalMapZoom) || defaultExternalMapZoom, minExternalMapZoom, maxExternalMapZoom).toFixed(2)),
    externalMapCenter: sanitizeRestorableExternalMapCenter(source.externalMapCenter, config),
    externalMapVillageMarkersVisible: source.externalMapVillageMarkersVisible !== false,
    externalMapCityMarkersVisible: source.externalMapCityMarkersVisible !== false,
    externalMapFieldMarkersVisible: source.externalMapFieldMarkersVisible !== false,
    externalMapLandAreasVisible: source.externalMapLandAreasVisible !== false,
    mapLocationModal,
    quickDrawerOpen: Boolean(source.quickDrawerOpen),
    phoneUnlocked: Boolean(source.phoneUnlocked),
    phoneOpenedApp: safePhoneApp
  };
};

export const sanitizeAccountPreferences = (raw = {}, config = {}) => ({
  devFastNextDay: Boolean(raw?.devFastNextDay),
  devAutoPageReloadEnabled: raw?.devAutoPageReloadEnabled !== false,
  autoSaveEnabled: raw?.autoSaveEnabled !== false,
  autoRestoreViewEnabled: raw?.autoRestoreViewEnabled !== false,
  lastActiveSaveSlot: sanitizeLastActiveSaveSlotPreference(raw?.lastActiveSaveSlot, config.saveSlotCount),
  lastViewState: sanitizeLastViewStatePreference(raw?.lastViewState, config),
  shopCartByKey: raw?.shopCartByKey && typeof raw.shopCartByKey === 'object' && !Array.isArray(raw.shopCartByKey)
    ? raw.shopCartByKey
    : {},
  housingEntryButtonPosition: {
    xPercent: clamp(Number(raw?.housingEntryButtonPosition?.xPercent), 12, 88) || 67,
    yPercent: clamp(Number(raw?.housingEntryButtonPosition?.yPercent), 18, 90) || 78,
  },
  housingEntryButtonDragEnabled: Boolean(raw?.housingEntryButtonDragEnabled),
  townMarkerPositions: raw?.townMarkerPositions && typeof raw.townMarkerPositions === 'object' && !Array.isArray(raw.townMarkerPositions)
    ? raw.townMarkerPositions
    : null,
  townMarkerCoordsLocked: raw?.townMarkerCoordsLocked !== false,
  townMarkerLayoutSavedAtDay: Math.max(0, Math.floor(Number(raw?.townMarkerLayoutSavedAtDay) || 0))
});

export const buildCurrentRestorableViewState = (state = {}, config = {}) => sanitizeLastViewStatePreference(state, config);

export const getRestorableViewLoadingPhaseKeys = (viewRaw = {}, config = {}) => {
  const view = sanitizeLastViewStatePreference(viewRaw, config);
  if (view.screen !== 'game') return [];
  const keys = new Set(['field']);
  const tab = String(view.tab || 'farm');
  const focusTab = String(view.focusTab || 'manage');
  const mapLocationKey = String(view.mapLocationModal?.key || '');
  const mapLocationView = String(view.mapLocationModal?.view || '');
  const mapLocationTab = String(view.mapLocationModal?.tab || '');

  if (tab === 'map' || view.externalMapOpen || view.mapLocationModal?.open) {
    keys.add('map');
  }
  if (tab === 'storage' || tab === 'warehouse' || view.mapLocationModal?.open) {
    keys.add('warehouse');
  }
  if (tab === 'shop' || ['machineRent', 'smallCity', 'usedCarDealer'].includes(mapLocationKey)) {
    keys.add('vehicle');
  }
  if (
    tab === 'facility'
    || focusTab === 'landFacility'
    || focusTab === 'housing'
    || ['constructionOffice', 'maintenanceShop', 'smallApc'].includes(mapLocationKey)
    || (mapLocationKey === 'townOffice' && mapLocationTab === 'machine')
  ) {
    keys.add('facility');
  }
  if (mapLocationView === 'shop' || mapLocationView === 'pickup') {
    keys.add('warehouse');
  }
  return [...keys];
};

export const applyRestorableViewState = (viewRaw = {}, context = {}) => {
  const config = context.config || {};
  const setters = context.setters || {};
  const view = sanitizeLastViewStatePreference(viewRaw, config);
  setters.setTab?.(view.tab || 'farm');
  setters.setTabGroup?.(view.tabGroup || 'farmOps');
  setters.setFocusTab?.(view.focusTab || 'manage');
  setters.setWarehouseTab?.(view.warehouseTab || 'all');
  setters.setShopTab?.(view.shopTab || config.defaultManagementShopTab || 'machine');
  setters.setLandFacilityMainTab?.(view.landFacilityMainTab || 'types');
  setters.setLandFacilitySubTab?.(view.landFacilitySubTab || 'land');
  setters.setHousingViewMode?.(view.housingViewMode || 'list');
  setters.setHousingViewSelectedFacilityKey?.(view.housingViewSelectedFacilityKey || '');
  setters.setHousingInteriorFacilityKey?.(view.housingInteriorFacilityKey || '');
  setters.setHousingInteriorPendingObjectKey?.(view.housingInteriorFacilityKey ? view.housingInteriorPendingObjectKey || '' : '');
  setters.setHousingDoorAnimationModal?.(null);
  setters.setTownMoveMapZoom?.(view.externalMapZoom || config.externalMapTownMoveDefaultZoom || 0.5);
  setters.setTownMoveMapCenter?.(view.externalMapCenter || config.externalMapPreset?.center || { x: 0, y: 0 });
  setters.setTownMoveMapTool?.('pan');
  setters.setTownMoveDrawDraftPoints?.([]);
  setters.setTownMoveCoordinateMeasureEnabled?.(false);
  setters.setTownMoveCursorCoordinateView?.(null);
  setters.setTownMoveFieldSelectMode?.(Boolean(view.externalMapFieldSelectMode));
  setters.setTownMoveLocationContext?.(view.externalMapLocationContext || 'field');
  setters.setTownMoveVillageMarkersVisible?.(view.externalMapVillageMarkersVisible !== false);
  setters.setTownMoveCityMarkersVisible?.(view.externalMapCityMarkersVisible !== false);
  setters.setTownMoveFieldMarkersVisible?.(view.externalMapFieldMarkersVisible !== false);
  setters.setTownMoveLandAreasVisible?.(view.externalMapLandAreasVisible !== false);
  setters.setTownMoveMarkerMoveTarget?.({ kind: '', id: '' });
  setters.setTownMoveMarkerConfirmModal?.({ open: false, markerId: '', settlementLabel: '마을' });
  setters.setTownMoveModal?.({ open: Boolean(view.externalMapOpen), vehicleInstanceId: '' });
  setters.setMapLocationModal?.(
    view.mapLocationModal?.open
      ? {
          open: true,
          key: view.mapLocationModal.key,
          tab: view.mapLocationModal.tab || (view.mapLocationModal.key === 'foodMart' ? 'all' : 'tool'),
          view: view.mapLocationModal.view || 'shop',
          parkingReturnKey: view.mapLocationModal.parkingReturnKey || ''
        }
      : { open: false, key: '', tab: 'tool', view: 'shop', parkingReturnKey: '' }
  );
  setters.setMapShopClosing?.(false);
  setters.setMapShopExitAnimating?.(false);
  setters.setQuickDrawerOpen?.(Boolean(view.quickDrawerOpen || view.phoneOpenedApp));
  setters.setPhoneUnlocked?.(Boolean(view.phoneUnlocked || view.phoneOpenedApp));
  setters.setPhoneOpenedApp?.(view.phoneOpenedApp || '');
  setters.setPhoneAppTransitionPhase?.(view.phoneOpenedApp ? 'open' : 'idle');
  setters.setPhoneAppOrigin?.(null);
  return view;
};

export const restoreAutoSavedView = ({
  preferencesRaw = {},
  session = null,
  authSession = null,
  config = {},
  loadGame,
  normalizeLoadedGame,
  resetFacilityStorageUiStateForGameLoad,
  applyRestorableViewState: applyView,
  setters = {}
} = {}) => {
  const preferences = sanitizeAccountPreferences(preferencesRaw, config);
  if (!preferences.autoSaveEnabled || !preferences.autoRestoreViewEnabled) return false;
  const view = sanitizeLastViewStatePreference(preferences.lastViewState || {}, config);
  if (view.screen !== 'game') {
    setters.setGame?.(null);
    setters.setActiveSaveSlot?.(null);
    setters.setScreen?.('menu');
    setters.setSlotMode?.('');
    setters.setLastRestorableViewState?.(view);
    setters.setUiEntranceSeed?.((prev) => prev + 1);
    return false;
  }
  const slot = sanitizeLastActiveSaveSlotPreference(preferences.lastActiveSaveSlot, config.saveSlotCount);
  if (slot == null) return false;
  const loaded = loadGame?.(slot);
  if (!loaded) return false;
  try {
    resetFacilityStorageUiStateForGameLoad?.();
    const username = String(session?.username || authSession?.username || '');
    setters.setGame?.(normalizeLoadedGame ? normalizeLoadedGame(loaded, username) : loaded);
    setters.setActiveSaveSlot?.(slot);
    setters.setLastRestorableSaveSlot?.(slot);
    setters.setLastRestorableViewState?.(view);
    setters.setScreen?.('game');
    applyView?.(view);
    setters.setUiEntranceSeed?.((prev) => prev + 1);
    return true;
  } catch (error) {
    console.error('auto_restore_view_failed', error);
    return false;
  }
};
