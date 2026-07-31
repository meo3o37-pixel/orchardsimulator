export const normalizeSettlementParkingSlots = (rawSlots, slotCount, parseMachineParkingInstanceId) => {
  const source = Array.isArray(rawSlots) ? rawSlots : [];
  const safeSlotCount = Math.max(0, Math.floor(Number(slotCount) || 0));
  return Array.from({ length: safeSlotCount }, (_, idx) => {
    const parsed = parseMachineParkingInstanceId?.(source[idx]);
    return parsed?.id || '';
  });
};

export const createSettlementParkingNormalizer = ({
  slotCountOf,
  parseMachineParkingInstanceId,
} = {}) => (
  (destinationKeyRaw, rawSlots) => {
    const slotCount = slotCountOf(destinationKeyRaw);
    return normalizeSettlementParkingSlots(rawSlots, slotCount, parseMachineParkingInstanceId);
  }
);

export const createBaseSettlementParkingContext = ({
  defaultSlotCount = 4,
  resolveZoneOptions,
  resolveSlotCount,
  resolveSlotPrefix,
  parseMachineParkingInstanceId,
} = {}) => {
  const zoneOptionsOf = (destinationKeyRaw = '') => (
    resolveZoneOptions(destinationKeyRaw, defaultSlotCount)
  );

  const slotCountOf = (destinationKeyRaw = '', zoneRaw = 'general') => (
    resolveSlotCount(destinationKeyRaw, zoneRaw, defaultSlotCount)
  );

  const slotPrefixOf = (destinationKeyRaw = '', zoneRaw = 'general') => (
    resolveSlotPrefix(destinationKeyRaw, zoneRaw, defaultSlotCount)
  );

  return {
    zoneOptionsOf,
    slotCountOf,
    slotPrefixOf,
    normalizeSlots: createSettlementParkingNormalizer({
      slotCountOf,
      parseMachineParkingInstanceId,
    }),
  };
};

export const resolveSettlementParkingModalState = ({
  game,
  parkingModal,
  destinationLabelOf,
  zoneOptionsOf,
  slotPrefixOf,
  slotCountOf,
  storageKeyOf,
  normalizeSlots,
} = {}) => {
  const destinationKey = String(parkingModal?.destinationKey || '');
  const destinationLabel = String(destinationLabelOf?.(destinationKey) || '');
  const zoneOptions = zoneOptionsOf?.(destinationKey) || [];
  const activeZone = zoneOptions.some((option) => option.key === String(parkingModal?.zone || 'general'))
    ? String(parkingModal?.zone || 'general')
    : 'general';
  const storageKey = String(storageKeyOf?.(destinationKey, activeZone) || destinationKey || '');
  const slotPrefix = String(slotPrefixOf?.(destinationKey, activeZone) || 'P');
  const slotHeading = zoneOptions.find((option) => option.key === activeZone)?.slotHeading || '주차칸';
  const raw = Array.isArray(game?.townMarkerParkingByKey?.[storageKey]) ? game.townMarkerParkingByKey[storageKey] : [];
  const slots = normalizeSlots?.(storageKey, raw) || [];
  const arrivedVehicleId = String(game?.townArrivalVehicleInstanceId || '');
  const selectedSlotNo = Math.max(0, Math.floor(Number(parkingModal?.slotNo) || 0));
  const slotCount = Math.max(0, Number(slotCountOf?.(storageKey) || 0));

  return {
    destinationKey,
    destinationLabel,
    zoneOptions,
    activeZone,
    storageKey,
    slotPrefix,
    slotHeading,
    slots,
    arrivedVehicleId,
    selectedSlotNo,
    slotCount,
  };
};

export const normalizeSettlementParkingState = ({
  rawSlotByKey,
  rawParkingByKey,
  storageKeys,
  slotCountOf,
  normalizeSlots,
  clampSlotNo,
} = {}) => {
  const safeStorageKeys = storageKeys instanceof Set ? storageKeys : new Set(storageKeys || []);
  const nextSlotByKey = {};
  Object.entries(rawSlotByKey || {}).forEach(([key, slotNo]) => {
    const safeKey = String(key || '');
    if (!safeStorageKeys.has(safeKey)) return;
    nextSlotByKey[safeKey] = clampSlotNo(slotNo, safeKey, slotCountOf?.(safeKey));
  });

  const nextParkingByKey = {};
  Object.entries(rawParkingByKey || {}).forEach(([key, slots]) => {
    const safeKey = String(key || '');
    if (!safeStorageKeys.has(safeKey)) return;
    nextParkingByKey[safeKey] = normalizeSlots(safeKey, slots);
  });

  return {
    townMarkerParkingSlotByKey: nextSlotByKey,
    townMarkerParkingByKey: nextParkingByKey,
  };
};

export const createSettlementParkingContext = ({
  isSmallCityContext = false,
  defaultSlotCount = 4,
  smallCitySettlementParkingKeys = [],
  smallCityDoubleParkingExcludedKeys = [],
  resolveZoneOptions,
  resolveSlotCount,
  resolveSlotPrefix,
  parseMachineParkingInstanceId,
} = {}) => {
  const smallCityParkingKeySet = new Set(smallCitySettlementParkingKeys || []);
  const smallCityExcludedKeySet = new Set(smallCityDoubleParkingExcludedKeys || []);

  const baseSlotCountOf = (destinationKeyRaw = '') => {
    const destinationKey = String(destinationKeyRaw || '');
    if (!isSmallCityContext) return defaultSlotCount;
    if (!smallCityParkingKeySet.has(destinationKey)) return defaultSlotCount;
    if (smallCityExcludedKeySet.has(destinationKey)) return defaultSlotCount;
    return defaultSlotCount * 2;
  };

  const zoneOptionsOf = (destinationKeyRaw = '') => (
    resolveZoneOptions(destinationKeyRaw, baseSlotCountOf(destinationKeyRaw))
  );

  const slotCountOf = (destinationKeyRaw = '', zoneRaw = 'general') => (
    resolveSlotCount(destinationKeyRaw, zoneRaw, baseSlotCountOf(destinationKeyRaw))
  );

  const slotPrefixOf = (destinationKeyRaw = '', zoneRaw = 'general') => (
    resolveSlotPrefix(destinationKeyRaw, zoneRaw, baseSlotCountOf(destinationKeyRaw))
  );

  const normalizeSlots = (destinationKeyRaw, rawSlots) => (
    normalizeSettlementParkingSlots(rawSlots, slotCountOf(destinationKeyRaw), parseMachineParkingInstanceId)
  );

  return {
    baseSlotCountOf,
    zoneOptionsOf,
    slotCountOf,
    slotPrefixOf,
    normalizeSlots,
  };
};

export const clearVehicleFromSettlementParking = ({
  parkingByKey,
  vehicleInstanceId,
  normalizeSlots,
} = {}) => {
  const nextByKey = { ...(parkingByKey || {}) };
  Object.keys(nextByKey).forEach((key) => {
    const normalized = normalizeSlots(key, nextByKey[key]);
    let touched = false;
    for (let i = 0; i < normalized.length; i += 1) {
      if (normalized[i] !== vehicleInstanceId) continue;
      normalized[i] = '';
      touched = true;
    }
    if (touched) nextByKey[key] = normalized;
  });
  return nextByKey;
};

export const removeVehicleFromSettlementParkingState = ({
  prevGame,
  vehicleInstanceId,
} = {}) => {
  if (!prevGame) return prevGame;
  const nextTownMarkerParkingByKey = Object.entries(prevGame?.townMarkerParkingByKey || {}).reduce((acc, [key, raw]) => {
    const slots = Array.isArray(raw) ? [...raw] : [];
    acc[key] = slots.map((entry) => (String(entry || '') === vehicleInstanceId ? '' : entry));
    return acc;
  }, {});
  const nextTownArrivalVehicleInstanceId = String(prevGame?.townArrivalVehicleInstanceId || '') === vehicleInstanceId
    ? ''
    : String(prevGame?.townArrivalVehicleInstanceId || '');
  return {
    ...prevGame,
    townMarkerParkingByKey: nextTownMarkerParkingByKey,
    townArrivalVehicleInstanceId: nextTownArrivalVehicleInstanceId,
  };
};

export const remapSettlementParkingState = ({
  prevGame,
  remapInstanceId,
} = {}) => {
  if (!prevGame || typeof remapInstanceId !== 'function') return prevGame;
  const nextTownMarkerParkingByKey = Object.entries(prevGame?.townMarkerParkingByKey || {}).reduce((acc, [key, slots]) => {
    const raw = Array.isArray(slots) ? slots : [];
    acc[key] = raw.map((entry) => remapInstanceId(entry));
    return acc;
  }, {});
  const nextTownArrivalVehicleInstanceId = remapInstanceId(prevGame?.townArrivalVehicleInstanceId || '');
  return {
    ...prevGame,
    townMarkerParkingByKey: nextTownMarkerParkingByKey,
    townArrivalVehicleInstanceId: nextTownArrivalVehicleInstanceId,
  };
};

export const applySettlementParkingAssignment = ({
  prevGame,
  storageKey,
  slotNo,
  shouldEnter = true,
  forceToggleOff = false,
  normalizeSlots,
} = {}) => {
  if (!prevGame) return { nextGame: prevGame, occupiedByOther: false };
  const currentArrivedVehicleId = String(prevGame?.townArrivalVehicleInstanceId || '');
  if (!currentArrivedVehicleId) return { nextGame: prevGame, occupiedByOther: false };
  const nextByKey = clearVehicleFromSettlementParking({
    parkingByKey: prevGame?.townMarkerParkingByKey || {},
    vehicleInstanceId: currentArrivedVehicleId,
    normalizeSlots,
  });
  const destinationSlots = normalizeSlots(storageKey, nextByKey[storageKey]);
  const occupiedVehicleId = String(destinationSlots[slotNo - 1] || '');
  if (occupiedVehicleId && occupiedVehicleId !== currentArrivedVehicleId) {
    return { nextGame: prevGame, occupiedByOther: true };
  }
  const isToggleOff = !shouldEnter && forceToggleOff;
  destinationSlots[slotNo - 1] = isToggleOff ? '' : currentArrivedVehicleId;
  nextByKey[storageKey] = destinationSlots;
  return {
    occupiedByOther: false,
    nextGame: {
      ...prevGame,
      townArrivalVehicleInstanceId: isToggleOff ? currentArrivedVehicleId : '',
      townMarkerParkingSlotByKey: {
        ...(prevGame?.townMarkerParkingSlotByKey || {}),
        [storageKey]: isToggleOff ? 0 : slotNo,
      },
      townMarkerParkingByKey: nextByKey,
    },
  };
};

export const pickupSettlementParkedVehicle = ({
  prevGame,
  storageKey,
  slotNo,
  normalizeSlots,
} = {}) => {
  if (!prevGame) return { nextGame: prevGame, pickedVehicleId: '' };
  const prevByKey = { ...(prevGame?.townMarkerParkingByKey || {}) };
  const destinationSlots = normalizeSlots(storageKey, prevByKey[storageKey]);
  const pickedVehicleId = String(destinationSlots[slotNo - 1] || '');
  if (!pickedVehicleId) return { nextGame: prevGame, pickedVehicleId: '' };
  destinationSlots[slotNo - 1] = '';
  prevByKey[storageKey] = destinationSlots;
  return {
    pickedVehicleId,
    nextGame: {
      ...prevGame,
      townArrivalVehicleInstanceId: pickedVehicleId,
      townMarkerParkingSlotByKey: {
        ...(prevGame?.townMarkerParkingSlotByKey || {}),
        [storageKey]: 0,
      },
      townMarkerParkingByKey: prevByKey,
    },
  };
};
