import { SMALL_APC_LOADING_PARKING_KEY } from './smallApcUtils';

export const buildSettlementParkedVehicleKeySet = ({
  parkingByKey,
  storageKeys,
  resolveMachineInstanceById,
} = {}) => {
  const next = new Set();
  Object.entries(parkingByKey || {}).forEach(([key, slots]) => {
    const safeKey = String(key || '');
    if (!storageKeys?.has?.(safeKey)) return;
    if (safeKey === SMALL_APC_LOADING_PARKING_KEY) return;
    const hasParkedVehicle = Array.isArray(slots) && slots.some((entry) => (
      entry ? Boolean(resolveMachineInstanceById?.(String(entry))) : false
    ));
    if (!hasParkedVehicle) return;
    next.add(safeKey);
  });
  return next;
};

export const buildSettlementSelectableVehicleInstances = ({
  game,
  parkingKeys = [],
  parkingKeySet,
  parkingByKey,
  mapMarkerNameOf,
  resolveMachineInstanceById,
  parseMachineParkingInstanceId,
  machineItemMap,
  equipmentItemMap,
  equipmentDurabilityOfUnit,
  isTownParkingEligibleVehicle,
  machineFuelKeyFromType,
} = {}) => {
  const safeParkingKeys = Array.isArray(parkingKeys) ? parkingKeys : [];
  const filteredParkingKeys = safeParkingKeys.filter((key) => parkingKeySet?.has?.(String(key || '')));
  if (!filteredParkingKeys.length) return [];

  const vehicleIds = new Set();
  const collected = [];

  const pushVehicleById = (instanceIdRaw, parkingKeyRaw = '') => {
    const instanceId = String(parseMachineParkingInstanceId?.(instanceIdRaw)?.id || instanceIdRaw || '');
    if (!instanceId || vehicleIds.has(instanceId)) return;
    const parkingKey = String(parkingKeyRaw || '');
    const parkingLocationLabel = parkingKey ? `${mapMarkerNameOf?.(parkingKey) || parkingKey} 주차` : '';
    const resolved = resolveMachineInstanceById?.(instanceId);
    const parsed = parseMachineParkingInstanceId?.(instanceId);
    const fallbackItem = parsed
      ? (machineItemMap?.[parsed.machineKey] || equipmentItemMap?.[parsed.machineKey] || null)
      : null;
    const vehicle = resolved
      ? { ...resolved, parkingLocationLabel }
      : (parsed && fallbackItem
          ? {
              id: parsed.id,
              machineKey: parsed.machineKey,
              unitNo: parsed.unitNo,
              item: fallbackItem,
              durability: equipmentDurabilityOfUnit?.(game, parsed.machineKey, parsed.unitNo),
              parkingLocationLabel,
            }
          : null);
    if (!vehicle) return;
    const type = String(vehicle?.item?.type || '');
    if (!['transport', 'passenger'].includes(type)) return;
    if (!isTownParkingEligibleVehicle?.(vehicle)) return;
    if ((Number(vehicle?.item?.fuelTankLiters) || 0) <= 0) return;
    if (!machineFuelKeyFromType?.(vehicle?.item?.fuelType)) return;
    vehicleIds.add(instanceId);
    collected.push(vehicle);
  };

  filteredParkingKeys.forEach((parkingKey) => {
    const slots = Array.isArray(parkingByKey?.[parkingKey]) ? parkingByKey[parkingKey] : [];
    slots.forEach((entry) => pushVehicleById(entry, parkingKey));
  });

  return collected;
};

export const buildSettlementParkingSlotRows = ({
  slotCount = 0,
  slots = [],
  storageKey = '',
  slotPrefix = 'P',
  destinationKey = '',
  activeZone = 'general',
  townParkingRandomBusyByKey,
  townParkingNpcBusyCooldownByKey,
  townMarkerParkingArrivedVehicleId = '',
  parseMachineParkingInstanceId,
  machineItemMap,
  equipmentItemMap,
  toolImageSrcOf,
  findItemImageSrcByKeywords,
  normalizeVehiclePlateOverride,
  buildVehiclePlate,
  vehiclePlateByInstance,
  destinationLabelForParkingArea,
} = {}) => (
  Array.from({ length: Math.max(0, Number(slotCount) || 0) }, (_, idx) => {
    const slotNo = idx + 1;
    const parkedVehicleId = String(slots[idx] || '');
    const randomBusyInfo = townParkingRandomBusyByKey?.[storageKey]?.[slotNo] || { busy: false, vehicleName: '' };
    const npcBusyCooldownExpiresAt = Number(townParkingNpcBusyCooldownByKey?.[storageKey]?.[slotNo] || 0);
    const npcBusyCooldownActive = npcBusyCooldownExpiresAt > Date.now();
    const randomOccupiedByNpc = !parkedVehicleId && !npcBusyCooldownActive && Boolean(randomBusyInfo?.busy);
    const occupiedByOther = Boolean(
      randomOccupiedByNpc
      || (
        townMarkerParkingArrivedVehicleId
        && parkedVehicleId
        && parkedVehicleId !== townMarkerParkingArrivedVehicleId
      )
    );
    const parsedVehicle = parkedVehicleId ? parseMachineParkingInstanceId?.(parkedVehicleId) : null;
    const parkedVehicleItem = parsedVehicle
      ? (machineItemMap?.[parsedVehicle.machineKey] || equipmentItemMap?.[parsedVehicle.machineKey] || null)
      : null;
    const parkedVehicleName = parsedVehicle
      ? `${parkedVehicleItem?.name || parsedVehicle.machineKey}${Number(parsedVehicle?.unitNo) > 0 ? ` #${parsedVehicle.unitNo}` : ''}`
      : (randomOccupiedByNpc ? String(randomBusyInfo?.vehicleName || '포터') : '');
    const parkedVehicleImageSrc = parsedVehicle
      ? toolImageSrcOf?.(String(parkedVehicleItem?.key || parsedVehicle.machineKey || ''))
      : (
          randomOccupiedByNpc
            ? (
                findItemImageSrcByKeywords?.([String(randomBusyInfo?.vehicleName || '')])
                || findItemImageSrcByKeywords?.(String(randomBusyInfo?.vehicleName || '').split(/\s+/).filter(Boolean))
              )
            : ''
        );
    const parkedVehiclePlate = parsedVehicle
      ? (
          normalizeVehiclePlateOverride?.(vehiclePlateByInstance?.[parsedVehicle.id] || null)
          || buildVehiclePlate?.({
            seed: parsedVehicle.id,
            ownerType: 'player',
            vehicleName: String(parkedVehicleItem?.name || parsedVehicle.machineKey || ''),
            payloadKg: Number(parkedVehicleItem?.payloadKg) || 0,
          })
        )
      : (
          randomOccupiedByNpc
            ? buildVehiclePlate?.({
                seed: ['town-random-busy', storageKey, slotNo, String(randomBusyInfo?.vehicleName || '')].join('::'),
                ownerType: 'npc',
                vehicleName: String(randomBusyInfo?.vehicleName || ''),
              })
            : null
        );
    return {
      slotNo,
      slotLabel: `${slotPrefix}${slotNo}`,
      parkedVehicleId,
      parkedVehicleMachineType: String(parkedVehicleItem?.type || ''),
      occupiedByOther,
      occupied: Boolean(parkedVehicleId) || randomOccupiedByNpc,
      randomOccupiedByNpc,
      parkedVehicleName,
      parkedVehicleImageSrc,
      parkedVehiclePlate,
      parkedVehiclePlateText: String(parkedVehiclePlate?.displayText || ''),
      parkingLabel: String(destinationKey || '') === 'smallApc'
        ? destinationLabelForParkingArea?.(destinationKey, activeZone) || ''
        : '',
    };
  })
);
