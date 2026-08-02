import { clamp, monthOf } from '../../utils/common';
import { buildRandomPersonProfile, personEmojiOfGender } from '../../utils/personName';
import { buildVehiclePlate } from '../../utils/vehiclePlate';

export const SMALL_APC_PARKING_SLOT_COUNT = 12;
export const SMALL_APC_LOADING_PARKING_SLOT_COUNT = 4;
export const SMALL_APC_LOADING_PARKING_KEY = 'smallApc:loading';
export const SMALL_APC_SHIPPING_PARKING_SLOT_COUNT = 4;
export const SMALL_APC_SHIPPING_PARKING_KEY = 'smallApc:shipping';
export const USED_CAR_DEALER_SHIPPING_PARKING_SLOT_COUNT = 8;
export const USED_CAR_DEALER_SHIPPING_PARKING_KEY = 'usedCarDealer:shipping';

export const SMALL_APC_LOADING_ASSIGNMENT_PENDING = 'assignmentPending';
export const SMALL_APC_LOADING_WAITING = 'waiting';
export const SMALL_APC_LOADING_PREPARING = 'preparing';
export const SMALL_APC_LOADING_UNLOADING = 'unloading';
export const SMALL_APC_LOADING_DONE = 'done';
export const SMALL_APC_LOADING_CLEANUP = 'cleanup';
export const SMALL_APC_PLAYER_LOADING_ENTRY_GRACE_MS = 3 * 60 * 1000;
export const SMALL_APC_PLAYER_POST_UNLOAD_GRACE_MS = 3 * 60 * 1000;
export const SMALL_APC_PLAYER_POST_UNLOAD_FINE_WON = 30000;

export const SMALL_APC_LOADING_FARMER_NAMES = Object.freeze([
  '대흥과수원',
  '청명농원',
  '대성영농조합',
  '금빛사과농장',
  '아람과수원',
  '수결농장'
]);

export const SMALL_APC_LOADING_CARGO_TYPES = Object.freeze([
  '사과',
  '사과',
  '사과',
  '사과 혼합'
]);

export const townMarkerParkingStorageKeyOf = (destinationKeyRaw = '', zoneRaw = 'general') => {
  const destinationKey = String(destinationKeyRaw || '');
  const zone = String(zoneRaw || 'general');
  if (destinationKey === 'smallApc' && zone === 'loading') return SMALL_APC_LOADING_PARKING_KEY;
  if (destinationKey === 'smallApc' && zone === 'shipping') return SMALL_APC_SHIPPING_PARKING_KEY;
  if (destinationKey === 'usedCarDealer' && zone === 'shipping') return USED_CAR_DEALER_SHIPPING_PARKING_KEY;
  return destinationKey;
};

export const townMarkerParkingZoneOptionsOf = (
  destinationKeyRaw = '',
  defaultTownMarkerParkingSlotCount = 4
) => {
  const destinationKey = String(destinationKeyRaw || '');
  if (destinationKey === 'smallApc') {
    return [
      { key: 'general', label: '일반 주차장', slotPrefix: 'P', slotHeading: '일반 주차장', slotCount: SMALL_APC_PARKING_SLOT_COUNT },
      { key: 'loading', label: '하차 주차칸', slotPrefix: 'H', slotHeading: '하차 주차칸', slotCount: SMALL_APC_LOADING_PARKING_SLOT_COUNT },
      { key: 'shipping', label: '출고 주차칸', slotPrefix: 'S', slotHeading: '출고 주차칸', slotCount: SMALL_APC_SHIPPING_PARKING_SLOT_COUNT }
    ];
  }
  if (destinationKey === 'usedCarDealer') {
    return [
      { key: 'general', label: '일반 주차장', slotPrefix: 'P', slotHeading: '일반 주차장', slotCount: defaultTownMarkerParkingSlotCount },
      { key: 'shipping', label: '출고 주차장', slotPrefix: 'S', slotHeading: '출고 주차장', slotCount: USED_CAR_DEALER_SHIPPING_PARKING_SLOT_COUNT }
    ];
  }
  return [
    { key: 'general', label: '주차칸', slotPrefix: 'P', slotHeading: '주차칸', slotCount: defaultTownMarkerParkingSlotCount }
  ];
};

export const townMarkerParkingSlotCountOf = (
  destinationKeyRaw = '',
  zoneRaw = 'general',
  defaultTownMarkerParkingSlotCount = 4
) => {
  const storageKey = townMarkerParkingStorageKeyOf(destinationKeyRaw, zoneRaw);
  if (storageKey === SMALL_APC_LOADING_PARKING_KEY) return SMALL_APC_LOADING_PARKING_SLOT_COUNT;
  if (storageKey === SMALL_APC_SHIPPING_PARKING_KEY) return SMALL_APC_SHIPPING_PARKING_SLOT_COUNT;
  if (storageKey === USED_CAR_DEALER_SHIPPING_PARKING_KEY) return USED_CAR_DEALER_SHIPPING_PARKING_SLOT_COUNT;
  if (String(destinationKeyRaw || '') === 'smallApc' || storageKey === 'smallApc') return SMALL_APC_PARKING_SLOT_COUNT;
  return defaultTownMarkerParkingSlotCount;
};

export const townMarkerParkingSlotPrefixOf = (
  destinationKeyRaw = '',
  zoneRaw = 'general',
  defaultTownMarkerParkingSlotCount = 4
) => (
  townMarkerParkingZoneOptionsOf(destinationKeyRaw, defaultTownMarkerParkingSlotCount)
    .find((option) => option.key === String(zoneRaw || 'general'))?.slotPrefix || 'P'
);

export const destinationLabelForParkingArea = (destinationKeyRaw = '', zoneRaw = 'general') => {
  const destinationLabel = String(destinationKeyRaw || '') === 'smallApc' ? '소형 APC' : '';
  if (String(destinationKeyRaw || '') === USED_CAR_DEALER_SHIPPING_PARKING_KEY) return '자동차 대리점 출고';
  if (String(destinationKeyRaw || '') === 'usedCarDealer' && String(zoneRaw || 'general') === 'shipping') return '자동차 대리점 출고';
  if (!destinationLabel) return '방문지 주차';
  if (String(zoneRaw || 'general') === 'loading') return `${destinationLabel} 하차`;
  if (String(zoneRaw || 'general') === 'shipping') return `${destinationLabel} 출고`;
  return `${destinationLabel} 주차`;
};

export const smallApcLoadingStatusLabelOf = (statusRaw = '') => {
  const status = String(statusRaw || '');
  if (status === SMALL_APC_LOADING_ASSIGNMENT_PENDING) return '접수대기';
  if (status === SMALL_APC_LOADING_WAITING) return '입고 대기';
  if (status === SMALL_APC_LOADING_PREPARING) return '하차준비';
  if (status === SMALL_APC_LOADING_UNLOADING) return '하차중';
  if (status === SMALL_APC_LOADING_DONE) return '하차완료';
  if (status === SMALL_APC_LOADING_CLEANUP) return '정리중';
  return '';
};

export const smallApcLoadingStatusToneOf = (statusRaw = '') => {
  const status = String(statusRaw || '');
  if (status === SMALL_APC_LOADING_ASSIGNMENT_PENDING) return 'pending';
  if (status === SMALL_APC_LOADING_WAITING) return 'waiting';
  if (status === SMALL_APC_LOADING_PREPARING) return 'preparing';
  if (status === SMALL_APC_LOADING_UNLOADING) return 'unloading';
  if (status === SMALL_APC_LOADING_DONE) return 'done';
  if (status === SMALL_APC_LOADING_CLEANUP) return 'cleanup';
  return 'pending';
};

export const smallApcLoadingOccupiesBay = (statusRaw = '') => {
  const status = String(statusRaw || '');
  return [
    SMALL_APC_LOADING_PREPARING,
    SMALL_APC_LOADING_UNLOADING,
    SMALL_APC_LOADING_DONE,
    SMALL_APC_LOADING_CLEANUP
  ].includes(status);
};

export const smallApcPlayerTurnReservationActive = (job = null, now = Date.now()) => (
  Boolean(
    job?.playerOwned
    && String(job?.status || '') === SMALL_APC_LOADING_WAITING
    && Number(job?.loadingSlotNo || 0) > 0
    && Number(job?.playerDeadlineAt || 0) > now
  )
);

export const smallApcLoadingBlocksBay = (job = null, now = Date.now()) => (
  smallApcLoadingOccupiesBay(job?.status)
  || smallApcPlayerTurnReservationActive(job, now)
);

export const smallApcArrivalSeasonKeyOf = (monthRaw = 1) => {
  const month = Math.max(1, Math.floor(Number(monthRaw) || 1));
  if ([3, 4, 5].includes(month)) return 'spring';
  if ([6, 7, 8].includes(month)) return 'summer';
  if ([9, 10, 11].includes(month)) return 'fall';
  return 'winter';
};

export const smallApcArrivalWeatherClassOf = (weatherNameRaw = '') => {
  const weatherName = String(weatherNameRaw || '');
  if (/폭우|호우|강한|태풍|폭설|대설|우박|폭염|한파/.test(weatherName)) return 'extreme';
  if (/비|소나기|장마|진눈깨비|눈/.test(weatherName)) return 'rain';
  if (/바람|강풍|북서풍/.test(weatherName)) return 'wind';
  if (/무더위|열대야|건조한더위/.test(weatherName)) return 'hot';
  if (/흐림|구름|안개|박무|황사/.test(weatherName)) return 'cloud';
  if (/맑음|청명|건조|선선/.test(weatherName)) return 'fair';
  return 'normal';
};

export const buildSmallApcArrivalProfile = ({
  day = 1,
  timeOfDay = 'day',
  weatherName = '',
  npcBySlot = {},
} = {}) => {
  const month = monthOf(Math.max(1, Math.floor(Number(day) || 1)));
  const seasonKey = smallApcArrivalSeasonKeyOf(month);
  const weatherClass = smallApcArrivalWeatherClassOf(weatherName);
  const isNight = String(timeOfDay || 'day') === 'night';
  const jobs = Object.values(npcBySlot || {}).filter(Boolean);
  const assignmentPendingCount = jobs.filter((job) => job?.status === SMALL_APC_LOADING_ASSIGNMENT_PENDING).length;
  const waitingCount = jobs.filter((job) => job?.status === SMALL_APC_LOADING_WAITING).length;
  const occupiedBayCount = jobs.filter((job) => smallApcLoadingOccupiesBay(job?.status)).length;
  const activeJobCount = jobs.length;
  const isNightOperationSeason = [2, 3, 8, 9, 10, 11].includes(month);
  const nightBusyEnough = occupiedBayCount >= 2 || waitingCount >= 2 || activeJobCount >= 5 || assignmentPendingCount >= 2;
  const nightReceptionOpen = !isNight || (isNightOperationSeason && nightBusyEnough);
  const isPeakHarvestMonth = [9, 10].includes(month);
  const isHarvestShoulderMonth = [8, 11].includes(month);
  const congestionScore = clamp(
    (activeJobCount / 8) * 0.45
      + (occupiedBayCount / SMALL_APC_LOADING_PARKING_SLOT_COUNT) * 0.35
      + ((assignmentPendingCount + waitingCount) / 5) * 0.2,
    0,
    1
  );

  const seasonBaseByKey = {
    spring: 0.42,
    summer: 0.33,
    fall: 0.6,
    winter: 0.2,
  };
  const weatherAdjustmentByClass = {
    fair: 0.09,
    normal: 0.03,
    cloud: 0.01,
    hot: -0.04,
    wind: -0.07,
    rain: -0.16,
    extreme: -0.34,
  };

  const spawnChance = clamp(
    (seasonBaseByKey[seasonKey] ?? 0.35)
      + (isPeakHarvestMonth ? 0.16 : 0)
      + (isHarvestShoulderMonth ? 0.08 : 0)
      + (isNight ? -0.22 : 0.11)
      + (weatherAdjustmentByClass[weatherClass] ?? 0)
      - (congestionScore * 0.38),
    0.05,
    0.88
  );

  const delayScale = clamp(
    1.18
      + (congestionScore * 0.65)
      + (isNight ? 0.22 : -0.08)
      + (weatherClass === 'rain' ? 0.16 : 0)
      + (weatherClass === 'extreme' ? 0.32 : 0)
      - (isPeakHarvestMonth ? 0.24 : 0)
      - (isHarvestShoulderMonth ? 0.12 : 0),
    0.72,
    2.2
  );

  const seedCount = clamp(
    Math.round(
      1
      + (isPeakHarvestMonth ? 1 : 0)
      + (isHarvestShoulderMonth ? 0.5 : 0)
      + (spawnChance * 1.6)
      - (isNight ? 0.6 : 0)
      - (weatherClass === 'extreme' ? 0.9 : 0)
    ),
    1,
    4
  );

  return {
    month,
    seasonKey,
    weatherClass,
    isNight,
    isNightOperationSeason,
    nightBusyEnough,
    nightReceptionOpen,
    activeJobCount,
    assignmentPendingCount,
    waitingCount,
    occupiedBayCount,
    congestionScore,
    isPeakHarvestMonth,
    isHarvestShoulderMonth,
    spawnChance,
    spawnDelayMinMs: Math.round(9000 * delayScale),
    spawnDelayMaxMs: Math.round(17000 * delayScale),
    initialSeedCount: seedCount,
  };
};

export const formatRemainingSecondsText = (remainingMsRaw = 0) => {
  const remainingMs = Math.max(0, Number(remainingMsRaw) || 0);
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}분 ${String(seconds).padStart(2, '0')}초` : `${seconds}초`;
};

export const smallApcLoadingVehicleClassOf = (vehicleNameRaw = '') => {
  const vehicleName = String(vehicleNameRaw || '');
  if (/마이티|파비스|엑시언트|MAN|18\.320|4톤|2\.5톤/i.test(vehicleName)) return 'heavy';
  if (/포터|봉고|라보|다마스/i.test(vehicleName)) return 'light';
  return 'medium';
};

const SMALL_APC_LOADING_VEHICLE_CLASS_WEIGHTS = [
  { key: 'light', weight: 75 },
  { key: 'medium', weight: 20 },
  { key: 'heavy', weight: 5 },
];

const SMALL_APC_BOX_KG = 20;
const SMALL_APC_BOXES_PER_HARVEST_SLOT = 36;

const smallApcLoadingHarvestSlotCountOfVehicleName = (vehicleNameRaw = '') => {
  const vehicleName = String(vehicleNameRaw || '').trim();
  if (/포터|봉고/i.test(vehicleName)) return 2;
  if (/라보/i.test(vehicleName)) return 1;
  if (/마이티 2\.5톤|2\.5톤/i.test(vehicleName)) return 4;
  if (/마이티 3\.5톤|마이티 4톤|4톤/i.test(vehicleName)) return 6;
  if (/파비스|MAN|18\.320/i.test(vehicleName)) return 8;
  if (/엑시언트/i.test(vehicleName)) return 14;
  return 0;
};

const smallApcLoadingBoxRangeOfVehicleName = (vehicleNameRaw = '') => {
  const vehicleName = String(vehicleNameRaw || '').trim();
  const harvestSlotCount = smallApcLoadingHarvestSlotCountOfVehicleName(vehicleName);
  if (harvestSlotCount > 0) {
    const maxBoxCount = harvestSlotCount * SMALL_APC_BOXES_PER_HARVEST_SLOT;
    return {
      minBoxCount: Math.max(1, Math.ceil(maxBoxCount * 0.5)),
      maxBoxCount,
    };
  }
  if (smallApcLoadingVehicleClassOf(vehicleName) === 'heavy') return { minBoxCount: 60, maxBoxCount: 90 };
  if (smallApcLoadingVehicleClassOf(vehicleName) === 'light') return { minBoxCount: 16, maxBoxCount: 28 };
  return { minBoxCount: 24, maxBoxCount: 48 };
};

const pickSmallApcLoadingVehicleClass = () => {
  const totalWeight = SMALL_APC_LOADING_VEHICLE_CLASS_WEIGHTS.reduce(
    (sum, entry) => sum + Math.max(0, Number(entry?.weight) || 0),
    0
  );
  if (totalWeight <= 0) return 'light';
  let roll = Math.random() * totalWeight;
  for (const entry of SMALL_APC_LOADING_VEHICLE_CLASS_WEIGHTS) {
    roll -= Math.max(0, Number(entry?.weight) || 0);
    if (roll < 0) return String(entry?.key || 'light');
  }
  return 'light';
};

const pickSmallApcLoadingVehicleName = (vehicleNameRaw = '', randomVehicleNames = []) => {
  const directVehicleName = String(vehicleNameRaw || '').trim();
  if (directVehicleName) return directVehicleName;
  const safeVehicleNames = (Array.isArray(randomVehicleNames) ? randomVehicleNames : [])
    .map((nameRaw) => String(nameRaw || '').trim())
    .filter((name) => name && smallApcLoadingHarvestSlotCountOfVehicleName(name) > 0);
  if (!safeVehicleNames.length) return '현대 포터2';

  const namesByClass = {
    light: [],
    medium: [],
    heavy: [],
  };
  safeVehicleNames.forEach((nameRaw) => {
    const name = String(nameRaw || '').trim();
    if (!name) return;
    const vehicleClass = smallApcLoadingVehicleClassOf(name);
    if (!Array.isArray(namesByClass[vehicleClass])) {
      namesByClass[vehicleClass] = [];
    }
    namesByClass[vehicleClass].push(name);
  });

  const preferredClass = pickSmallApcLoadingVehicleClass();
  const preferredPool = namesByClass[preferredClass];
  if (Array.isArray(preferredPool) && preferredPool.length) {
    return preferredPool[Math.floor(Math.random() * preferredPool.length)] || '현대 포터2';
  }

  const fallbackPool = ['light', 'medium', 'heavy']
    .flatMap((vehicleClass) => (Array.isArray(namesByClass[vehicleClass]) ? namesByClass[vehicleClass] : []));
  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)] || '현대 포터2';
};

export const smallApcLoadingDurationByStatus = (statusRaw = '', job = null) => {
  const status = String(statusRaw || '');
  const cargoKg = Math.max(0, Number(job?.cargoKg) || 0);
  const vehicleClass = smallApcLoadingVehicleClassOf(job?.vehicleName);
  if (status === SMALL_APC_LOADING_WAITING) {
    return 10000 + Math.floor(Math.random() * 12000);
  }
  if (status === SMALL_APC_LOADING_PREPARING) {
    return 8000 + Math.floor(Math.random() * 10000);
  }
  if (status === SMALL_APC_LOADING_UNLOADING) {
    const baseByClass = vehicleClass === 'heavy' ? 58000 : vehicleClass === 'light' ? 32000 : 44000;
    const cargoBonus = Math.round((cargoKg / 100) * 1200);
    return baseByClass + cargoBonus;
  }
  if (status === SMALL_APC_LOADING_DONE) {
    if (job?.playerOwned) return SMALL_APC_PLAYER_POST_UNLOAD_GRACE_MS;
    return 8000 + Math.floor(Math.random() * 9000);
  }
  if (status === SMALL_APC_LOADING_CLEANUP) {
    return 12000 + Math.floor(Math.random() * 12000);
  }
  return 0;
};

export const buildSmallApcLoadingNpcJob = ({
  slotNo,
  now = Date.now(),
  vehicleNameRaw = '',
  randomVehicleNames = [],
  randIntInclusive,
}) => {
  const vehicleName = pickSmallApcLoadingVehicleName(vehicleNameRaw, randomVehicleNames);
  const { minBoxCount, maxBoxCount } = smallApcLoadingBoxRangeOfVehicleName(vehicleName);
  const cargoBoxCount = Math.max(1, randIntInclusive(
    Math.max(1, Number(minBoxCount) || 1),
    Math.max(1, Number(maxBoxCount) || 1)
  ));
  const cargoKg = cargoBoxCount * SMALL_APC_BOX_KG;
  const shipperProfile = buildRandomPersonProfile();
  const farmerName = SMALL_APC_LOADING_FARMER_NAMES[randIntInclusive(0, SMALL_APC_LOADING_FARMER_NAMES.length - 1)] || '대흥과수원';
  const vehiclePlate = buildVehiclePlate({
    seed: ['small-apc-npc', vehicleName, shipperProfile?.name || '', farmerName, slotNo, now].join('::'),
    ownerType: 'npc',
    usageType: 'farm',
    vehicleName,
    payloadKg: cargoKg,
  });
  return {
    slotNo,
    loadingSlotNo: 0,
    status: SMALL_APC_LOADING_ASSIGNMENT_PENDING,
    vehicleName,
    ticketNo: '',
    cargoType: SMALL_APC_LOADING_CARGO_TYPES[randIntInclusive(0, SMALL_APC_LOADING_CARGO_TYPES.length - 1)] || '사과',
    cargoKg,
    vehiclePlate,
    vehiclePlateText: String(vehiclePlate?.displayText || ''),
    shipperName: String(shipperProfile?.name || '외부인력1'),
    shipperGender: String(shipperProfile?.gender || 'neutral'),
    shipperEmoji: personEmojiOfGender(shipperProfile?.gender || 'neutral'),
    farmerName,
    occupiedAt: now,
    stageStartedAt: now,
    stageEndsAt: 0,
    completedAt: 0
  };
};

export const buildSmallApcLoadingPlayerJob = ({
  slotNo,
  now = Date.now(),
  parkedVehicleRow = null,
  vehicleDetail = null,
  playerName = '',
}) => {
  const harvestRows = Array.isArray(vehicleDetail?.harvestRows) ? vehicleDetail.harvestRows : [];
  const primaryHarvestRow = harvestRows[0] || null;
  const vehicleName = String(parkedVehicleRow?.parkedVehicleName || '내 화물차');
  const vehiclePlate = parkedVehicleRow?.parkedVehiclePlate || null;
  const safePlayerName = String(playerName || '').trim() || '청년 농부';
  return {
    slotNo,
    loadingSlotNo: 0,
    status: SMALL_APC_LOADING_WAITING,
    vehicleName,
    parkedVehicleImageSrc: String(parkedVehicleRow?.parkedVehicleImageSrc || ''),
    ticketNo: '',
    cargoType: String(primaryHarvestRow?.cropLabel || '적재 수확물'),
    cargoKg: Math.max(0, Number(vehicleDetail?.totalLoadKg) || 0),
    vehiclePlate,
    vehiclePlateText: String(parkedVehicleRow?.parkedVehiclePlateText || vehiclePlate?.displayText || ''),
    shipperName: safePlayerName,
    shipperGender: 'neutral',
    shipperEmoji: personEmojiOfGender('neutral'),
    farmerName: safePlayerName,
    occupiedAt: now,
    stageStartedAt: now,
    stageEndsAt: 0,
    completedAt: 0,
    playerOwned: true,
    npcOnly: false,
    playerVehicleId: String(parkedVehicleRow?.parkedVehicleId || ''),
    playerTurnCalledAt: 0,
    playerDeadlineAt: 0,
  };
};

export const advanceSmallApcLoadingNpcJob = (job, now = Date.now()) => {
  if (!job || typeof job !== 'object') return null;
  if (job.status === SMALL_APC_LOADING_WAITING) {
    return job;
  }
  if (job.status === SMALL_APC_LOADING_PREPARING) {
    const nextStatus = SMALL_APC_LOADING_UNLOADING;
    return {
      ...job,
      status: nextStatus,
      stageStartedAt: now,
      stageEndsAt: now + smallApcLoadingDurationByStatus(nextStatus, job)
    };
  }
  if (job.status === SMALL_APC_LOADING_UNLOADING) {
    const nextStatus = SMALL_APC_LOADING_DONE;
    return {
      ...job,
      status: nextStatus,
      stageStartedAt: now,
      stageEndsAt: now + smallApcLoadingDurationByStatus(nextStatus, job)
    };
  }
  if (job.status === SMALL_APC_LOADING_DONE) {
    const nextStatus = SMALL_APC_LOADING_CLEANUP;
    return {
      ...job,
      status: nextStatus,
      stageStartedAt: now,
      stageEndsAt: now + smallApcLoadingDurationByStatus(nextStatus, job)
    };
  }
  if (job.status === SMALL_APC_LOADING_CLEANUP) {
    return null;
  }
  return job;
};
