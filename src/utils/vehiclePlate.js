const PRIVATE_PLATE_LETTERS = ['가', '나', '다', '라', '마', '거', '너', '더', '러'];
const FARM_PLATE_LETTERS = ['바', '사', '아', '자'];
const LOGISTICS_PLATE_LETTERS = ['배', '허', '호'];

const PLAYER_REGION = Object.freeze({ code: 'GB', label: '경북' });
const NPC_FARM_REGIONS = Object.freeze([
  { code: 'GB', label: '경북' },
  { code: 'GN', label: '경남' },
  { code: 'CB', label: '충북' },
  { code: 'JB', label: '전북' },
]);
const PRIVATE_REGIONS = Object.freeze([
  { code: 'GB', label: '경북' },
  { code: 'DG', label: '대구' },
  { code: 'GN', label: '경남' },
  { code: 'GG', label: '경기' },
]);
const LOGISTICS_REGIONS = Object.freeze([
  { code: 'GB', label: '경북' },
  { code: 'DG', label: '대구' },
  { code: 'GG', label: '경기' },
  { code: 'IC', label: '인천' },
  { code: 'BS', label: '부산' },
]);

const TRUCK_NAME_PATTERN = /(포터|봉고|라보|다마스|마이티|파비스|엑시언트|MAN|트럭|카고|덤프|냉동탑차|윙바디|리프트카|톤)/i;
const PASSENGER_NAME_PATTERN = /(모닝|레이|스파크|아반떼|그랜저|소나타|코나|투싼|스포티지|쏘렌토|카니발|아이오닉|EV\d|제네시스|G70|G80|G90|셀토스|K3|K5|K7|K8|SUV|세단)/i;
const VAN_NAME_PATTERN = /(스타리아|스타렉스|카니발|밴)/i;

const hashString = (valueRaw = '') => {
  const value = String(valueRaw || '');
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const pickByHash = (items, hash) => {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;
  return list[Math.abs(Number(hash) || 0) % list.length] || list[0] || null;
};

export const inferVehicleKind = ({ vehicleName = '', payloadKg = 0 } = {}) => {
  const name = String(vehicleName || '');
  const safePayloadKg = Math.max(0, Number(payloadKg) || 0);
  if (safePayloadKg > 0 || TRUCK_NAME_PATTERN.test(name)) return 'truck';
  if (VAN_NAME_PATTERN.test(name)) return 'van';
  if (PASSENGER_NAME_PATTERN.test(name)) return 'passenger';
  return 'vehicle';
};

export const buildVehiclePlateProfile = ({
  ownerType = 'player',
  usageType = '',
  vehicleName = '',
  payloadKg = 0,
} = {}) => {
  const safeOwnerType = ['player', 'npc', 'company'].includes(String(ownerType || ''))
    ? String(ownerType || '')
    : 'player';
  const vehicleKind = inferVehicleKind({ vehicleName, payloadKg });
  let resolvedUsageType = String(usageType || '').trim();
  if (!resolvedUsageType) {
    if (safeOwnerType === 'company') resolvedUsageType = 'logistics';
    else if (vehicleKind === 'truck') resolvedUsageType = 'farm';
    else resolvedUsageType = 'private';
  }
  return {
    ownerType: safeOwnerType,
    usageType: resolvedUsageType,
    vehicleKind,
  };
};

export const buildVehiclePlate = ({
  seed = '',
  ownerType = 'player',
  usageType = '',
  vehicleName = '',
  payloadKg = 0,
} = {}) => {
  const profile = buildVehiclePlateProfile({ ownerType, usageType, vehicleName, payloadKg });
  const safeSeed = String(seed || `${profile.ownerType}:${profile.usageType}:${vehicleName}`);
  const hash = hashString(safeSeed);
  const frontNumber = 10 + (hash % 90);
  const rearNumber = 1000 + ((hash >>> 7) % 9000);
  const letterPool = profile.usageType === 'logistics'
    ? LOGISTICS_PLATE_LETTERS
    : profile.usageType === 'farm'
      ? FARM_PLATE_LETTERS
      : PRIVATE_PLATE_LETTERS;
  const regionPool = profile.ownerType === 'player'
    ? [PLAYER_REGION]
    : profile.usageType === 'logistics'
      ? LOGISTICS_REGIONS
      : profile.usageType === 'farm'
        ? NPC_FARM_REGIONS
        : PRIVATE_REGIONS;
  const region = pickByHash(regionPool, hash >>> 3) || PLAYER_REGION;
  const letter = String(pickByHash(letterPool, hash >>> 5) || '가');
  const number = `${frontNumber}${letter} ${String(rearNumber).padStart(4, '0')}`;
  return {
    ownerType: profile.ownerType,
    usageType: profile.usageType,
    vehicleKind: profile.vehicleKind,
    regionCode: String(region?.code || ''),
    regionLabel: String(region?.label || ''),
    number,
    displayText: number,
    fullText: `${String(region?.label || '')} ${number}`.trim(),
  };
};
