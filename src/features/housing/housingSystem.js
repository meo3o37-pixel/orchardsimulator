import { FOOD_MART_ITEMS } from '../../config/items/foodMart';
import { APPLIANCE_ITEMS } from '../../config/items/appliance';
import { FURNITURE_ITEMS } from '../../config/items/furniture';
import { CLOTHING_ITEMS } from '../../config/items/clothing';
import { clamp, monthOf } from '../../utils/common';
import { seasonKey } from '../../systems/weatherSystem';
import {
  facilityBuildOptionKeysOfFacility,
  facilityBuildOptionMapOfFacility,
  facilityBuildOptionsOfFacility,
} from '../facility/facilityMetaUtils';

export const housingOptionsOfFacility = (facilityKey) => facilityBuildOptionsOfFacility(facilityKey);
export const housingOptionMapOfFacility = (facilityKey) => facilityBuildOptionMapOfFacility(facilityKey);
export const housingOptionKeysOfFacility = (facilityKey) => facilityBuildOptionKeysOfFacility(facilityKey);

export const housingOptionExtraCost = (facilityKey, optionKeys) => {
  const optionMap = housingOptionMapOfFacility(facilityKey);
  return (optionKeys || []).reduce((sum, key) => sum + (optionMap[key]?.price || 0), 0);
};

export const HOUSING_APPLIANCE_SLOT_DEFS = Object.freeze([
  { key: 'fridge', type: 'fridge', icon: '🧊', label: '냉장고 자리', hint: '식료품 보관 가전 설치 공간' },
  { key: 'microwave', type: 'microwave', icon: '♨️', label: '전자레인지 자리', hint: '간편식 조리 가전 설치 공간' },
  { key: 'pc', type: 'computer', icon: '💻', label: 'PC 자리', hint: '정보 확인용 전자기기 설치 공간' },
  { key: 'tv', type: 'tv', icon: '📺', label: 'TV 자리', hint: '휴식용 영상 가전 설치 공간' },
  { key: 'aircon', type: 'airConditioner', icon: '🌀', label: '에어컨 자리', hint: '실내 온도 조절 가전 설치 공간' },
  { key: 'washer', type: 'washingMachine', icon: '🧺', label: '세탁기 자리', hint: '작업복 세탁 가전 설치 공간' },
  { key: 'riceCooker', type: 'riceCooker', icon: '🍚', label: '전기밥솥 자리', hint: '밥과 간편 조리용 가전 설치 공간' },
  { key: 'waterPurifier', type: 'waterPurifier', icon: '💧', label: '정수기 자리', hint: '생활용 식수 공급 가전 설치 공간' },
  { key: 'electricKettle', type: 'electricKettle', icon: '☕', label: '커피포트 자리', hint: '온수와 간단 음료 준비 가전 설치 공간' },
  { key: 'fan', type: 'fan', icon: '🌀', label: '선풍기 자리', hint: '실내 공기 순환 가전 설치 공간' },
  { key: 'heatingMat', type: 'heatingMat', icon: '🔥', label: '온열 매트 자리', hint: '침구 보온용 매트 설치 공간' },
  { key: 'heater', type: 'heater', icon: '🌡️', label: '난방기구 자리', hint: '실내 난방 보조 가전 설치 공간' },
  { key: 'boiler', type: 'boiler', icon: '♨️', label: '보일러 자리', hint: '난방수와 온수 공급 설비 설치 공간' },
  { key: 'inductionCooktop', type: 'inductionCooktop', icon: '♨️', label: '인덕션 자리', hint: '전기 조리 가전 설치 공간' }
]);

export const HOUSING_FURNITURE_SLOT_DEFS = Object.freeze([
  { key: 'bed', type: 'bed', icon: '🛏️', label: '침대 자리', hint: '수면용 가구 설치 공간' },
  { key: 'desk', type: 'desk', icon: '🧾', label: '책상 자리', hint: '서류와 PC 작업용 가구 설치 공간' },
  { key: 'chair', type: 'chair', icon: '🪑', label: '의자 자리', hint: '업무와 식사용 의자 설치 공간' },
  { key: 'storage', type: 'storage', icon: '🗄️', label: '수납장 자리', hint: '생활용품 보관 가구 설치 공간' },
  { key: 'diningTable', type: 'diningTable', icon: '🍽️', label: '식탁 자리', hint: '식사와 간단한 준비 작업 공간' }
]);

export const HOUSING_CLOTHING_SLOT_DEFS = Object.freeze([
  { key: 'head', type: 'head', icon: '⛑️', label: '머리', hint: '안전모나 모자를 착용하는 자리' },
  { key: 'face', type: 'face', icon: '😷', label: '얼굴', hint: '마스크나 보안경을 착용하는 자리' },
  { key: 'upper', type: 'upper', icon: '🧥', label: '상의', hint: '작업복 상의, 방수자켓, 방한복, 안전조끼를 착용하는 자리' },
  { key: 'lower', type: 'lower', icon: '👖', label: '하의', hint: '작업복 하의나 방수·방한 바지를 착용하는 자리' },
  { key: 'hands', type: 'hands', icon: '🧤', label: '손', hint: '목장갑이나 고무장갑을 착용하는 자리' },
  { key: 'feet', type: 'feet', icon: '🥾', label: '발', hint: '작업화나 장화를 착용하는 자리' }
]);

const LEGACY_CLOTHING_SLOT_KEY_BY_TYPE = Object.freeze({
  outerwear: 'upper',
  vest: 'upper',
  gloves: 'hands',
  shoes: 'feet',
  eyes: 'face'
});

const HOUSING_WATER_TANK_SLOT_COUNT_BY_FACILITY = Object.freeze({
  farmHut6Basic: 1,
  farmHut6Insulated: 1,
  farmContainer40Office: 1,
  panelHouse9: 1,
  lightWood12: 1,
  modular15Value: 1,
  mobileHome13: 1,
  steelOfficeLounge: 1,
  dualContainerLinked: 2,
  modular25Standard: 2,
  woodHouse30: 2,
  smartFarmResidence: 2,
  premiumCountry35: 3,
  hanokHybrid28: 2,
  passiveHouse30: 3,
  villaFarm40: 3,
  estateFarm55: 4
});

export const housingWaterTankSlotCountOfFacility = (facilityKeyRaw = '') => {
  const facilityKey = String(facilityKeyRaw || '');
  if (!facilityKey) return 0;
  if (Object.prototype.hasOwnProperty.call(HOUSING_WATER_TANK_SLOT_COUNT_BY_FACILITY, facilityKey)) {
    return Math.max(0, Math.floor(Number(HOUSING_WATER_TANK_SLOT_COUNT_BY_FACILITY[facilityKey]) || 0));
  }
  return 1;
};

export const housingWaterTankSlotDefsOfFacility = (facilityKeyRaw = '') => (
  Array.from({ length: housingWaterTankSlotCountOfFacility(facilityKeyRaw) }, (_, index) => ({
    key: `tank${index + 1}`,
    icon: '💧',
    label: `물탱크 ${index + 1}`,
    hint: '생활수 저장용 소형 물탱크 설치 공간'
  }))
);

const HOUSING_DEFAULT_APPLIANCES_BY_FACILITY = Object.freeze({
  sandwichPanelDorm4: {
    fridge: 'livingCoolR93M',
    microwave: 'heatWaveM20',
    riceCooker: 'cookingPotMini3',
    fan: 'windMateDesk8'
  },
  farmContainer20Used: {
    fridge: 'livingCoolR93M',
    microwave: 'heatWaveM20',
    riceCooker: 'cookingPotMini3',
    fan: 'windMateDesk8'
  },
  usedSiteOffice5: {
    fridge: 'livingCoolR93M',
    microwave: 'heatWaveM20',
    riceCooker: 'cookingPotMini3',
    fan: 'windMateDesk8'
  },
  farmHut6Basic: {
    fridge: 'livingCoolS180',
    microwave: 'heatWaveM20',
    riceCooker: 'cookingPotClassic6',
    washer: 'cleanSpinMini35',
    aircon: 'airBreezeWindow6',
    fan: 'windMateStand14',
    electricKettle: 'boilMateK17',
    inductionCooktop: 'cookTopSolo1'
  },
  farmHut6Insulated: {
    fridge: 'livingCoolS180',
    microwave: 'heatWaveD23',
    riceCooker: 'cookingPotClassic6',
    washer: 'cleanSpinMini35',
    aircon: 'airBreezeWindow6',
    fan: 'windMateStand14',
    heatingMat: 'warmPadSingle',
    electricKettle: 'boilMateK17',
    inductionCooktop: 'cookTopSolo1'
  },
  farmContainer40Office: {
    fridge: 'livingCoolS180',
    microwave: 'heatWaveD23',
    riceCooker: 'cookingPotClassic6',
    washer: 'cleanSpinMini35',
    aircon: 'airBreezeWall8',
    fan: 'windMateStand14',
    heatingMat: 'warmPadSingle',
    electricKettle: 'boilMateK17',
    inductionCooktop: 'cookTopSolo1'
  },
  panelHouse9: {
    fridge: 'livingCoolS180',
    microwave: 'heatWaveD23',
    riceCooker: 'cookingPotClassic6',
    washer: 'cleanSpinMini35',
    aircon: 'airBreezeWall8',
    fan: 'windMateStand14',
    heatingMat: 'warmPadSingle',
    electricKettle: 'boilMateK17',
    inductionCooktop: 'cookTopSolo1'
  },
  lightWood12: {
    fridge: 'livingCoolC320',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotClassic6',
    washer: 'cleanSpinT10',
    aircon: 'airBreezeWall12',
    fan: 'windMateCirculator12',
    heatingMat: 'warmPadDouble',
    waterPurifier: 'pureDropCounter4',
    electricKettle: 'boilMateGlass18',
    inductionCooktop: 'cookTopDuo2',
    pc: 'officeMiniPc',
    tv: 'basicTv32'
  },
  modular15Value: {
    fridge: 'livingCoolC320',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotClassic6',
    washer: 'cleanSpinT10',
    aircon: 'airBreezeWall12',
    fan: 'windMateCirculator12',
    heatingMat: 'warmPadDouble',
    waterPurifier: 'pureDropCounter4',
    electricKettle: 'boilMateGlass18',
    inductionCooktop: 'cookTopDuo2',
    pc: 'basicDesktopPc',
    tv: 'smartTv43'
  },
  mobileHome13: {
    fridge: 'livingCoolC320',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotClassic6',
    washer: 'cleanSpinT10',
    aircon: 'airBreezeWall12',
    fan: 'windMateCirculator12',
    heatingMat: 'warmPadDouble',
    waterPurifier: 'pureDropCounter4',
    electricKettle: 'boilMateGlass18',
    inductionCooktop: 'cookTopDuo2',
    pc: 'officeMiniPc',
    tv: 'smartTv43'
  },
  steelOfficeLounge: {
    fridge: 'livingCoolC320',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotClassic6',
    washer: 'cleanSpinT10',
    aircon: 'airBreezeWall12',
    fan: 'windMateCirculator12',
    heatingMat: 'warmPadDouble',
    waterPurifier: 'pureDropCounter4',
    electricKettle: 'boilMateGlass18',
    inductionCooktop: 'cookTopDuo2',
    pc: 'basicDesktopPc',
    tv: 'smartTv43'
  },
  dualContainerLinked: {
    fridge: 'livingCoolC320',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotClassic6',
    washer: 'cleanSpinT10',
    aircon: 'airBreezeWall12',
    fan: 'windMateCirculator12',
    heatingMat: 'warmPadDouble',
    waterPurifier: 'pureDropCounter4',
    electricKettle: 'boilMateGlass18',
    inductionCooktop: 'cookTopDuo2',
    pc: 'basicDesktopPc',
    tv: 'smartTv43'
  },
  modular25Standard: {
    fridge: 'livingCoolF610',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotIH10',
    washer: 'cleanSpinD15',
    aircon: 'airBreezeStand18',
    fan: 'windMateCirculator12',
    heatingMat: 'warmWaterMatQueen',
    waterPurifier: 'pureDropHotCool6',
    electricKettle: 'boilMateThermo30',
    inductionCooktop: 'cookTopFlex3',
    pc: 'farmWorkstationPc',
    tv: 'smartTv55'
  },
  woodHouse30: {
    fridge: 'livingCoolF610',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotIH10',
    washer: 'cleanSpinD15',
    aircon: 'airBreezeStand18',
    fan: 'windMateCirculator12',
    heatingMat: 'warmWaterMatQueen',
    waterPurifier: 'pureDropHotCool6',
    electricKettle: 'boilMateThermo30',
    inductionCooktop: 'cookTopFlex3',
    pc: 'farmWorkstationPc',
    tv: 'smartTv55'
  },
  smartFarmResidence: {
    fridge: 'livingCoolF610',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotIH10',
    washer: 'cleanSpinSteam18',
    aircon: 'airBreezeMulti23',
    fan: 'windMateCirculator12',
    heatingMat: 'warmWaterMatQueen',
    waterPurifier: 'pureDropHotCool6',
    electricKettle: 'boilMateThermo30',
    inductionCooktop: 'cookTopFlex3',
    pc: 'farmWorkstationPc',
    tv: 'smartTv55'
  },
  premiumCountry35: {
    fridge: 'livingCoolPro850',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotIH10',
    washer: 'cleanSpinSteam18',
    aircon: 'airBreezeMulti23',
    fan: 'windMateCirculator12',
    heatingMat: 'warmWaterMatQueen',
    waterPurifier: 'pureDropHotCool6',
    electricKettle: 'boilMateThermo30',
    inductionCooktop: 'cookTopFlex3',
    pc: 'farmWorkstationPc',
    tv: 'premiumTv65'
  },
  hanokHybrid28: {
    fridge: 'livingCoolF610',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotIH10',
    washer: 'cleanSpinD15',
    aircon: 'airBreezeStand18',
    fan: 'windMateCirculator12',
    heatingMat: 'warmWaterMatQueen',
    waterPurifier: 'pureDropHotCool6',
    electricKettle: 'boilMateThermo30',
    inductionCooktop: 'cookTopFlex3',
    pc: 'basicDesktopPc',
    tv: 'smartTv55'
  },
  passiveHouse30: {
    fridge: 'livingCoolPro850',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotIH10',
    washer: 'cleanSpinSteam18',
    aircon: 'airBreezeMulti23',
    fan: 'windMateCirculator12',
    heatingMat: 'warmWaterMatQueen',
    waterPurifier: 'pureDropHotCool6',
    electricKettle: 'boilMateThermo30',
    inductionCooktop: 'cookTopFlex3',
    pc: 'farmWorkstationPc',
    tv: 'smartTv55'
  },
  villaFarm40: {
    fridge: 'livingCoolPro850',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotIH10',
    washer: 'cleanSpinWashDry24',
    aircon: 'airBreezeMulti23',
    fan: 'windMateCirculator12',
    heatingMat: 'warmWaterMatQueen',
    waterPurifier: 'pureDropStand9',
    electricKettle: 'boilMateThermo30',
    inductionCooktop: 'cookTopFlex3',
    pc: 'farmWorkstationPc',
    tv: 'premiumTv65'
  },
  estateFarm55: {
    fridge: 'livingCoolPro850',
    microwave: 'heatWaveFlat28',
    riceCooker: 'cookingPotIH10',
    washer: 'cleanSpinWashDry24',
    aircon: 'airBreezeMulti23',
    fan: 'windMateCirculator12',
    heatingMat: 'warmWaterMatQueen',
    waterPurifier: 'pureDropStand9',
    electricKettle: 'boilMateThermo30',
    inductionCooktop: 'cookTopFlex3',
    pc: 'farmWorkstationPc',
    tv: 'premiumTv65'
  }
});

const APPLIANCE_ITEM_BY_KEY = APPLIANCE_ITEMS.reduce((acc, item) => {
  const key = String(item?.key || '');
  if (key) acc[key] = item;
  return acc;
}, {});

const FURNITURE_ITEM_BY_KEY = FURNITURE_ITEMS.reduce((acc, item) => {
  const key = String(item?.key || '');
  if (key) acc[key] = item;
  return acc;
}, {});

const CLOTHING_ITEM_BY_KEY = CLOTHING_ITEMS.reduce((acc, item) => {
  const key = String(item?.key || '');
  if (key) acc[key] = item;
  return acc;
}, {});

const HOUSING_APPLIANCE_SLOT_BY_KEY = HOUSING_APPLIANCE_SLOT_DEFS.reduce((acc, slot) => ({
  ...acc,
  [slot.key]: slot
}), {});

const HOUSING_FURNITURE_SLOT_BY_KEY = HOUSING_FURNITURE_SLOT_DEFS.reduce((acc, slot) => ({
  ...acc,
  [slot.key]: slot
}), {});

const HOUSING_CLOTHING_SLOT_BY_KEY = HOUSING_CLOTHING_SLOT_DEFS.reduce((acc, slot) => ({
  ...acc,
  [slot.key]: slot
}), {});

export const housingDefaultAppliancesOfFacility = (facilityKeyRaw = '') => {
  const facilityKey = String(facilityKeyRaw || '');
  return { ...(HOUSING_DEFAULT_APPLIANCES_BY_FACILITY[facilityKey] || {}) };
};

export const normalizeHousingApplianceInstallations = (raw = {}, facilityKeyRaw = '') => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const merged = {
    ...housingDefaultAppliancesOfFacility(facilityKeyRaw),
    ...source
  };
  const next = {};
  Object.entries(merged).forEach(([slotKeyRaw, itemKeyRaw]) => {
    const slotKey = String(slotKeyRaw || '');
    const itemKey = String(itemKeyRaw || '');
    const slot = HOUSING_APPLIANCE_SLOT_BY_KEY[slotKey];
    if (!slot) return;
    if (Object.prototype.hasOwnProperty.call(source, slotKey) && !itemKey) {
      next[slotKey] = '';
      return;
    }
    const item = APPLIANCE_ITEM_BY_KEY[itemKey];
    if (!item || String(item?.type || '') !== String(slot.type || '')) return;
    next[slotKey] = itemKey;
  });
  return next;
};

export const housingDefaultFurnitureOfFacility = (facilityKeyRaw = '') => {
  const facilityKey = String(facilityKeyRaw || '');
  if (['sandwichPanelDorm4', 'farmContainer20Used', 'usedSiteOffice5'].includes(facilityKey)) {
    return {
      bed: 'simpleFoldingBed',
      desk: 'foldingTable800',
      chair: 'plasticChair',
      diningTable: 'foldingDiningTable1'
    };
  }
  if (['farmHut6Basic', 'farmHut6Insulated', 'farmContainer40Office', 'panelHouse9'].includes(facilityKey)) {
    return {
      bed: 'singleBedBasic',
      desk: 'basicWorkDesk1200',
      chair: 'farmOfficeChair',
      storage: ['farmContainer40Office', 'panelHouse9'].includes(facilityKey) ? 'steelUtilityShelf4' : 'plasticDrawerCabinet',
      diningTable: 'diningTable2'
    };
  }
  if (['lightWood12', 'modular15Value', 'mobileHome13', 'steelOfficeLounge', 'dualContainerLinked'].includes(facilityKey)) {
    return {
      bed: 'superSingleBed',
      desk: 'officeDesk1400',
      chair: 'farmOfficeChair',
      storage: 'multiStorageCabinet',
      diningTable: 'diningTable2'
    };
  }
  if (['modular25Standard', 'woodHouse30', 'smartFarmResidence', 'premiumCountry35', 'hanokHybrid28', 'passiveHouse30'].includes(facilityKey)) {
    return {
      bed: 'doubleBedBasic',
      desk: ['smartFarmResidence', 'premiumCountry35', 'passiveHouse30'].includes(facilityKey) ? 'executiveDesk1600' : 'officeDesk1400',
      chair: ['smartFarmResidence', 'premiumCountry35', 'passiveHouse30'].includes(facilityKey) ? 'ergonomicChair' : 'farmOfficeChair',
      storage: ['premiumCountry35', 'passiveHouse30'].includes(facilityKey) ? 'premiumWardrobe' : 'wardrobeBasic',
      diningTable: 'diningTable4'
    };
  }
  if (['villaFarm40', 'estateFarm55'].includes(facilityKey)) {
    return {
      bed: 'premiumMattressBed',
      desk: 'executiveDesk1600',
      chair: 'ergonomicChair',
      storage: 'premiumWardrobe',
      diningTable: 'diningTable6'
    };
  }
  return {};
};

export const housingDefaultFurniturePackageCostOfFacility = (facilityKeyRaw = '') => {
  const defaults = housingDefaultFurnitureOfFacility(facilityKeyRaw);
  return Object.values(defaults).reduce((sum, itemKeyRaw) => {
    const itemKey = String(itemKeyRaw || '');
    return sum + Math.max(0, Number(FURNITURE_ITEM_BY_KEY[itemKey]?.price) || 0);
  }, 0);
};

export const normalizeHousingFurnitureInstallations = (raw = {}) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const next = {};
  Object.entries(source).forEach(([slotKeyRaw, itemKeyRaw]) => {
    const slotKey = String(slotKeyRaw || '');
    const itemKey = String(itemKeyRaw || '');
    const slot = HOUSING_FURNITURE_SLOT_BY_KEY[slotKey];
    const item = FURNITURE_ITEM_BY_KEY[itemKey];
    if (!slot || !item || String(item?.type || '') !== String(slot.type || '')) return;
    next[slotKey] = itemKey;
  });
  return next;
};

export const normalizeHousingClothingEquipments = (raw = {}) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const next = {};
  Object.entries(source).forEach(([slotKeyRaw, itemKeyRaw]) => {
    const itemKey = String(itemKeyRaw || '');
    const item = CLOTHING_ITEM_BY_KEY[itemKey];
    if (!item) return;
    const slotKey = String(slotKeyRaw || '');
    const resolvedSlotKey = HOUSING_CLOTHING_SLOT_BY_KEY[slotKey]
      ? slotKey
      : String(LEGACY_CLOTHING_SLOT_KEY_BY_TYPE[slotKey] || '');
    const slot = HOUSING_CLOTHING_SLOT_BY_KEY[resolvedSlotKey];
    if (!slot || !item || String(item?.type || '') !== String(slot.type || '')) return;
    next[resolvedSlotKey] = itemKey;
  });
  return next;
};

export const normalizeHousingClothingStorageByItemKey = (raw = {}) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const next = {};
  Object.entries(source).forEach(([itemKeyRaw, qtyRaw]) => {
    const itemKey = String(itemKeyRaw || '');
    const item = CLOTHING_ITEM_BY_KEY[itemKey];
    const qty = Math.max(0, Math.floor(Number(qtyRaw) || 0));
    if (!item || qty <= 0) return;
    next[itemKey] = Math.max(0, Math.floor(Number(next[itemKey]) || 0)) + qty;
  });
  return next;
};

export const normalizeHousingWaterTankInstallations = (raw = {}, facilityKeyRaw = '') => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const slotKeySet = new Set(housingWaterTankSlotDefsOfFacility(facilityKeyRaw).map((slot) => String(slot.key || '')));
  const next = {};
  Object.entries(source).forEach(([slotKeyRaw, itemKeyRaw]) => {
    const slotKey = String(slotKeyRaw || '');
    const itemKey = String(itemKeyRaw || '');
    if (!slotKeySet.has(slotKey) || !itemKey) return;
    next[slotKey] = itemKey;
  });
  return next;
};

export const housingFacilityEmojiOf = (facilityKeyRaw = '') => {
  const facilityKey = String(facilityKeyRaw || '');
  if (facilityKey.toLowerCase().includes('container') || facilityKey === 'usedSiteOffice5') return '🏚️';
  if (facilityKey.toLowerCase().includes('wood') || facilityKey === 'hanokHybrid28') return '🏡';
  if (facilityKey.toLowerCase().includes('modular') || facilityKey === 'panelHouse9') return '🏠';
  if (facilityKey === 'smartFarmResidence' || facilityKey === 'passiveHouse30') return '🏘️';
  return '🏠';
};

export const HOUSING_BATHROOM_TIER_BY_FACILITY = Object.freeze({
  sandwichPanelDorm4: 0,
  farmContainer20Used: 0,
  usedSiteOffice5: 0,
  farmContainer40Office: 0,
  steelOfficeLounge: 0,
  farmHut6Basic: 1,
  farmHut6Insulated: 1,
  panelHouse9: 2,
  lightWood12: 2,
  modular15Value: 2,
  mobileHome13: 2,
  dualContainerLinked: 2,
  modular25Standard: 3,
  woodHouse30: 3,
  smartFarmResidence: 3,
  premiumCountry35: 3,
  hanokHybrid28: 3,
  passiveHouse30: 3,
  villaFarm40: 4,
  estateFarm55: 4
});

export const housingBathroomTierOfFacility = (facilityKeyRaw = '') => {
  const facilityKey = String(facilityKeyRaw || '');
  return Math.max(0, Math.floor(Number(HOUSING_BATHROOM_TIER_BY_FACILITY[facilityKey]) || 0));
};

export const housingHasBathroomOfFacility = (facilityKeyRaw = '') => housingBathroomTierOfFacility(facilityKeyRaw) > 0;

export const housingBathroomTierLabelOf = (tierRaw = 0) => {
  const tier = Math.max(0, Math.floor(Number(tierRaw) || 0));
  if (tier >= 4) return '고급/복수 욕실';
  if (tier >= 3) return '다인 욕실';
  if (tier >= 2) return '일반 욕실';
  if (tier >= 1) return '간이 욕실';
  return '욕실 없음';
};

export const normalizeHousingBathroomState = (raw = {}, dayRaw = 1) => {
  const day = Math.max(1, Math.floor(Number(dayRaw) || 1));
  const cleanliness = clamp(Number(raw?.cleanliness), 0, 100);
  return {
    cleanliness: Number.isFinite(cleanliness) ? Math.round(cleanliness) : 70,
    showeredDay: Math.max(0, Math.floor(Number(raw?.showeredDay) || 0)),
    chemicalWashDay: Math.max(0, Math.floor(Number(raw?.chemicalWashDay) || 0)),
    cleanedDay: Math.max(0, Math.floor(Number(raw?.cleanedDay) || 0)),
    day
  };
};

export const housingBathroomInfoOf = ({
  facilityKey = '',
  bathroomState = {},
  day = 1
} = {}) => {
  const tier = housingBathroomTierOfFacility(facilityKey);
  const state = normalizeHousingBathroomState(bathroomState, day);
  const cleanliness = Math.max(0, Math.min(100, Number(state.cleanliness) || 0));
  const cleanlinessLabel = cleanliness >= 85 ? '깨끗함'
    : cleanliness >= 65 ? '양호'
      : cleanliness >= 40 ? '보통'
        : cleanliness >= 20 ? '주의'
          : '불량';
  const cleanlinessTone = cleanliness >= 65 ? 'good'
    : cleanliness >= 40 ? 'normal'
      : cleanliness >= 20 ? 'warn'
        : 'bad';
  return {
    ...state,
    tier,
    tierLabel: housingBathroomTierLabelOf(tier),
    hasBathroom: tier > 0,
    cleanliness,
    cleanlinessLabel,
    cleanlinessTone,
    showeredToday: state.showeredDay === Math.max(1, Math.floor(Number(day) || 1)),
    chemicalWashedToday: state.chemicalWashDay === Math.max(1, Math.floor(Number(day) || 1)),
    cleanedToday: state.cleanedDay === Math.max(1, Math.floor(Number(day) || 1))
  };
};

export const housingRoomButtonsByFacilityKey = (facilityKey) => {
  const key = String(facilityKey || '');
  if (key === 'farmHut6Basic') return ['거실', '부엌', '창고', '욕실'];
  if (key === 'farmHut6Insulated') return ['거실', '부엌', '내방', '창고', '욕실'];
  if (key === 'sandwichPanelDorm4') return ['거실', '부엌', '창고'];
  if (['farmContainer20Used', 'usedSiteOffice5'].includes(key)) return ['거실', '부엌', '내방', '창고'];
  if (['farmContainer40Office', 'steelOfficeLounge'].includes(key)) return ['거실', '부엌', '내방1', '창고'];
  if (['panelHouse9', 'lightWood12', 'modular15Value', 'mobileHome13', 'dualContainerLinked'].includes(key)) {
    return ['거실', '부엌', '내방1', '창고', '욕실'];
  }
  if (['modular25Standard', 'woodHouse30', 'smartFarmResidence', 'premiumCountry35', 'hanokHybrid28', 'passiveHouse30'].includes(key)) {
    return ['거실', '부엌', '내방1', '내방2', '창고', '욕실', '다용도실'];
  }
  if (key === 'villaFarm40') {
    return ['거실', '부엌', '내방1', '내방2', '내방3', '창고', '욕실', '작업실'];
  }
  if (key === 'estateFarm55') {
    return ['거실', '대형부엌', '내방1', '내방2', '내방3', '게스트룸', '창고', '욕실', '차고'];
  }
  return ['거실', '부엌', '내방', '창고'];
};

export const normalizeHousingFoodStorageByItemKey = (rawCargo = {}) => {
  if (!rawCargo || typeof rawCargo !== 'object') return {};
  const next = {};
  const addQty = (itemKeyRaw = '', qtyRaw = 0) => {
    const safeItemKey = String(itemKeyRaw || '');
    const rawQty = Math.max(0, Number(qtyRaw) || 0);
    const safeQty = Math.round(rawQty * 100) / 100;
    if (!safeItemKey || safeQty <= 0) return;
    next[safeItemKey] = Math.round((Math.max(0, Number(next[safeItemKey]) || 0) + safeQty) * 100) / 100;
  };
  Object.entries(rawCargo).forEach(([itemKey, qty]) => {
    const safeItemKey = String(itemKey || '');
    const rawQty = Math.max(0, Number(qty) || 0);
    if (!safeItemKey || rawQty <= 0) return;
    if (safeItemKey === 'foodInstantRice210g3Pack') {
      addQty('foodInstantRice210g', rawQty * 3);
      return;
    }
    if (safeItemKey === 'foodInstantRice210g6Pack') {
      addQty('foodInstantRice210g', rawQty * 6);
      return;
    }
    addQty(safeItemKey, rawQty);
  });
  return next;
};

const HOUSING_FOOD_SHELF_LIFE_BY_ITEM_KEY = Object.freeze({
  foodWater2L: { room: 180, fridge: 180, freezer: 0 },
  foodSportsDrink15L: { room: 120, fridge: 120, freezer: 0 },
  foodCanCoffee: { room: 180, fridge: 180, freezer: 0 },
  foodCupRamen: { room: 180, fridge: 180, freezer: 0 },
  foodBagRamen5Pack: { room: 180, fridge: 180, freezer: 0 },
  foodBagRamenSingle: { room: 180, fridge: 180, freezer: 0 },
  foodRamenSpicy5Pack: { room: 180, fridge: 180, freezer: 0 },
  foodRamenSpicySingle: { room: 180, fridge: 180, freezer: 0 },
  foodRamenMild5Pack: { room: 180, fridge: 180, freezer: 0 },
  foodRamenMildSingle: { room: 180, fridge: 180, freezer: 0 },
  foodJjajangRamen4Pack: { room: 180, fridge: 180, freezer: 0 },
  foodJjajangRamenSingle: { room: 180, fridge: 180, freezer: 0 },
  foodInstantRice210g: { room: 180, fridge: 180, freezer: 0 },
  foodInstantRice210g3Pack: { room: 180, fridge: 180, freezer: 0 },
  foodInstantRice210g6Pack: { room: 180, fridge: 180, freezer: 0 },
  foodInstantSoupSeaweed: { room: 180, fridge: 180, freezer: 0 },
  foodCreamSoupPack: { room: 180, fridge: 180, freezer: 0 },
  foodCreamSoupSingle: { room: 180, fridge: 180, freezer: 0 },
  foodPastaSpaghetti500g: { room: 365, fridge: 365, freezer: 0 },
  foodCereal500g: { room: 180, fridge: 180, freezer: 0 },
  foodSeaweed16Pack: { room: 180, fridge: 180, freezer: 0 },
  foodCrackerBox: { room: 120, fridge: 120, freezer: 0 },
  foodChocolatePie12Pack: { room: 60, fridge: 60, freezer: 0 },
  foodPotatoChips: { room: 90, fridge: 90, freezer: 0 },
  foodPeanutSnack: { room: 90, fridge: 90, freezer: 0 },
  foodChocoBar4Pack: { room: 90, fridge: 90, freezer: 0 },
  foodJellySnack: { room: 180, fridge: 180, freezer: 0 },
  foodTriangleGimbap: { room: 1, fridge: 1, freezer: 0 },
  foodLunchBox: { room: 1, fridge: 1, freezer: 0 },
  foodKimbapRoll: { room: 1, fridge: 1, freezer: 0 },
  foodHotdog: { room: 1, fridge: 2, freezer: 0 },
  foodHamburger: { room: 1, fridge: 2, freezer: 0 },
  foodBreadLoaf: { room: 3, fridge: 5, freezer: 21 },
  foodBagel4Pack: { room: 3, fridge: 5, freezer: 21 },
  foodMilk1L: { room: 1, fridge: 5, freezer: 0 },
  foodBananaMilk: { room: 1, fridge: 4, freezer: 0 },
  foodMilkCoffee500ml: { room: 1, fridge: 5, freezer: 0 },
  foodYogurt4Pack: { room: 1, fridge: 10, freezer: 0 },
  foodEgg30Pack: { room: 10, fridge: 30, freezer: 0 },
  foodRice10kg: { room: 180, fridge: 180, freezer: 0 },
  foodTofu300g: { room: 1, fridge: 5, freezer: 14 },
  foodBeanSprouts500g: { room: 1, fridge: 4, freezer: 0 },
  foodPorkFront600g: { room: 1, fridge: 3, freezer: 45 },
  foodSpam200g: { room: 365, fridge: 365, freezer: 0 },
  foodTunaCan150g: { room: 365, fridge: 365, freezer: 0 },
  foodSausagePack: { room: 2, fridge: 14, freezer: 30 },
  foodFishCake300g: { room: 1, fridge: 7, freezer: 30 },
  foodFrozenPorkCutlet: { room: 1, fridge: 3, freezer: 60 },
  foodFrozenPasta: { room: 1, fridge: 3, freezer: 45 },
  foodFrozenDumpling1kg: { room: 1, fridge: 3, freezer: 60 },
  foodFrozenFriedRice: { room: 1, fridge: 3, freezer: 45 },
  foodFrozenTteokbokki: { room: 1, fridge: 3, freezer: 45 },
  foodFrozenUdon: { room: 1, fridge: 3, freezer: 45 },
  foodFrozenPizza: { room: 1, fridge: 3, freezer: 45 },
  foodKimchi35kg: { room: 3, fridge: 60, freezer: 0 },
  foodLettuce300g: { room: 1, fridge: 5, freezer: 0 },
  foodCucumber3Pack: { room: 2, fridge: 7, freezer: 0 },
  foodCherryTomato500g: { room: 3, fridge: 7, freezer: 0 },
  foodGreenOnion300g: { room: 2, fridge: 10, freezer: 30 },
  foodCabbageHalf: { room: 3, fridge: 10, freezer: 0 },
  foodCarrot500g: { room: 5, fridge: 21, freezer: 60 },
  foodOnion1kg: { room: 20, fridge: 30, freezer: 60 },
  foodPotato1kg: { room: 21, fridge: 30, freezer: 0 },
  foodSweetPotato1kg: { room: 14, fridge: 21, freezer: 0 },
  foodStrawberryJam500g: { room: 180, fridge: 180, freezer: 0 },
  foodSaladDressing250ml: { room: 90, fridge: 90, freezer: 0 },
  foodKingOysterMushroom400g: { room: 1, fridge: 7, freezer: 30 },
  foodOysterMushroom300g: { room: 1, fridge: 5, freezer: 30 },
  foodShiitakeMushroom200g: { room: 2, fridge: 7, freezer: 30 },
  foodApple4Pack: { room: 7, fridge: 21, freezer: 0 },
  foodBanana1Hand: { room: 4, fridge: 6, freezer: 0 },
  foodMandarin1kg: { room: 7, fridge: 21, freezer: 0 },
  foodSikhye15L: { room: 90, fridge: 90, freezer: 0 },
  foodOrangeJuice15L: { room: 90, fridge: 90, freezer: 0 },
  foodCola15L: { room: 180, fridge: 180, freezer: 0 },
  foodCider15L: { room: 180, fridge: 180, freezer: 0 },
  foodGreenTea500ml: { room: 120, fridge: 120, freezer: 0 },
  foodBarleyTea15L: { room: 120, fridge: 120, freezer: 0 },
  foodEnergyDrink250ml: { room: 180, fridge: 180, freezer: 0 },
  foodTomatoJuice15L: { room: 90, fridge: 90, freezer: 0 },
  foodMixCoffee100Pack: { room: 365, fridge: 365, freezer: 0 },
  foodGreenTeaBag50Pack: { room: 365, fridge: 365, freezer: 0 },
  foodSoySauce18L: { room: 365, fridge: 365, freezer: 0 },
  foodCookingOil18L: { room: 180, fridge: 180, freezer: 0 },
  foodFlour1kg: { room: 180, fridge: 180, freezer: 0 },
  foodSugar3kg: { room: 365, fridge: 365, freezer: 0 },
  foodSalt1kg: { room: 365, fridge: 365, freezer: 0 },
  foodMincedGarlic500g: { room: 14, fridge: 45, freezer: 90 },
  foodRedPepperPowder500g: { room: 180, fridge: 365, freezer: 0 },
  foodRedPepperPaste500g: { room: 180, fridge: 365, freezer: 0 },
  foodSoybeanPaste500g: { room: 180, fridge: 365, freezer: 0 },
  foodSesameOil320ml: { room: 180, fridge: 180, freezer: 0 },
  foodMayonnaise500g: { room: 90, fridge: 180, freezer: 0 }
});

const HOUSING_FOOD_DEFAULT_SHELF_LIFE_BY_SUBGROUP = Object.freeze({
  instant: { room: 30, fridge: 45, freezer: 0 },
  fresh: { room: 2, fridge: 7, freezer: 21 },
  frozen: { room: 1, fridge: 3, freezer: 45 },
  drink: { room: 7, fridge: 14, freezer: 0 },
  bulk: { room: 60, fridge: 90, freezer: 0 },
  cooked: { room: 1, fridge: 3, freezer: 14 },
  living: { room: 0, fridge: 0, freezer: 0 }
});

const HOUSING_FOOD_DEFAULT_SHELF_LIFE = Object.freeze({ room: 30, fridge: 45, freezer: 0 });

export const housingFoodShelfLifeDaysOf = (itemKeyRaw = '', storageTypeRaw = 'fridge') => {
  const itemKey = String(itemKeyRaw || '');
  const storageType = String(storageTypeRaw || '') === 'freezer'
    ? 'freezer'
    : (String(storageTypeRaw || '') === 'room' ? 'room' : 'fridge');
  const direct = HOUSING_FOOD_SHELF_LIFE_BY_ITEM_KEY[itemKey];
  if (direct && Object.prototype.hasOwnProperty.call(direct, storageType)) return Math.max(0, Math.floor(Number(direct[storageType]) || 0));
  const meta = FOOD_MART_META_BY_KEY[itemKey] || {};
  const subgroup = String(meta?.subgroup || '');
  const bySubgroup = HOUSING_FOOD_DEFAULT_SHELF_LIFE_BY_SUBGROUP[subgroup] || HOUSING_FOOD_DEFAULT_SHELF_LIFE;
  return Math.max(0, Math.floor(Number(bySubgroup[storageType]) || 0));
};

export const housingFoodExpireDayOf = (itemKeyRaw = '', storageTypeRaw = 'fridge', storedDayRaw = 1) => {
  const storedDay = Math.max(1, Math.floor(Number(storedDayRaw) || 1));
  const shelfLifeDays = housingFoodShelfLifeDaysOf(itemKeyRaw, storageTypeRaw);
  return shelfLifeDays > 0 ? storedDay + shelfLifeDays - 1 : 0;
};

export const normalizeHousingFoodStorageBatchesByFacilityKey = (raw = {}) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const next = {};
  Object.entries(raw).forEach(([facilityKeyRaw, facilityRaw]) => {
    const facilityKey = String(facilityKeyRaw || '');
    if (!facilityKey || !facilityRaw || typeof facilityRaw !== 'object' || Array.isArray(facilityRaw)) return;
    const nextFacility = {};
    Object.entries(facilityRaw).forEach(([itemKeyRaw, batchRowsRaw]) => {
      const itemKey = String(itemKeyRaw || '');
      const batchRows = Array.isArray(batchRowsRaw) ? batchRowsRaw : [];
      const mergedRows = {};
      batchRows.forEach((row) => {
        const qty = Math.round(Math.max(0, Number(row?.qty) || 0) * 10000) / 10000;
        if (!itemKey || qty <= 0) return;
        const storedDay = Math.max(1, Math.floor(Number(row?.storedDay) || 1));
        const expireDay = Math.max(0, Math.floor(Number(row?.expireDay) || 0));
        const batchKey = `${storedDay}:${expireDay}`;
        const prevQty = Math.max(0, Number(mergedRows[batchKey]?.qty) || 0);
        mergedRows[batchKey] = {
          storedDay,
          expireDay,
          qty: Math.round((prevQty + qty) * 10000) / 10000
        };
      });
      const rows = Object.values(mergedRows)
        .filter((row) => Math.max(0, Number(row.qty) || 0) > 0)
        .sort((a, b) => (Number(a.expireDay || 999999) - Number(b.expireDay || 999999)) || (Number(a.storedDay) - Number(b.storedDay)));
      if (rows.length) nextFacility[itemKey] = rows;
    });
    if (Object.keys(nextFacility).length) next[facilityKey] = nextFacility;
  });
  return next;
};

export const addHousingFoodStorageBatch = ({
  batchesByFacilityKey = {},
  facilityKey = '',
  itemKey = '',
  qty = 0,
  storageType = 'fridge',
  day = 1
} = {}) => {
  const targetFacilityKey = String(facilityKey || '');
  const targetItemKey = String(itemKey || '');
  const safeQty = Math.round(Math.max(0, Number(qty) || 0) * 10000) / 10000;
  if (!targetFacilityKey || !targetItemKey || safeQty <= 0) return normalizeHousingFoodStorageBatchesByFacilityKey(batchesByFacilityKey);
  const next = normalizeHousingFoodStorageBatchesByFacilityKey(batchesByFacilityKey);
  const facilityRows = { ...(next[targetFacilityKey] || {}) };
  const rows = [...(facilityRows[targetItemKey] || [])];
  const storedDay = Math.max(1, Math.floor(Number(day) || 1));
  const expireDay = housingFoodExpireDayOf(targetItemKey, storageType, storedDay);
  const existingIndex = rows.findIndex((row) => Number(row.storedDay) === storedDay && Number(row.expireDay) === expireDay);
  if (existingIndex >= 0) {
    rows[existingIndex] = {
      ...rows[existingIndex],
      qty: Math.round((Math.max(0, Number(rows[existingIndex].qty) || 0) + safeQty) * 10000) / 10000
    };
  } else {
    rows.push({ storedDay, expireDay, qty: safeQty });
  }
  facilityRows[targetItemKey] = rows.sort((a, b) => (Number(a.expireDay || 999999) - Number(b.expireDay || 999999)) || (Number(a.storedDay) - Number(b.storedDay)));
  next[targetFacilityKey] = facilityRows;
  return next;
};

export const consumeHousingFoodStorageBatches = ({
  batchesByFacilityKey = {},
  facilityKey = '',
  itemKey = '',
  qty = 0
} = {}) => {
  const targetFacilityKey = String(facilityKey || '');
  const targetItemKey = String(itemKey || '');
  let remain = Math.round(Math.max(0, Number(qty) || 0) * 10000) / 10000;
  const next = normalizeHousingFoodStorageBatchesByFacilityKey(batchesByFacilityKey);
  if (!targetFacilityKey || !targetItemKey || remain <= 0) return { batchesByFacilityKey: next, consumed: 0, shortage: remain };
  const facilityRows = { ...(next[targetFacilityKey] || {}) };
  const rows = [...(facilityRows[targetItemKey] || [])].sort((a, b) => (Number(a.expireDay || 999999) - Number(b.expireDay || 999999)) || (Number(a.storedDay) - Number(b.storedDay)));
  const consumedRows = [];
  const keptRows = [];
  rows.forEach((row) => {
    const rowQty = Math.max(0, Number(row.qty) || 0);
    if (rowQty <= 0) return;
    if (remain <= 0.0001) {
      keptRows.push(row);
      return;
    }
    const useQty = Math.min(rowQty, remain);
    consumedRows.push({ ...row, qty: Math.round(useQty * 10000) / 10000 });
    const leftQty = Math.max(0, rowQty - useQty);
    remain = Math.max(0, remain - useQty);
    if (leftQty > 0.0001) keptRows.push({ ...row, qty: Math.round(leftQty * 10000) / 10000 });
  });
  if (keptRows.length) facilityRows[targetItemKey] = keptRows;
  else delete facilityRows[targetItemKey];
  if (Object.keys(facilityRows).length) next[targetFacilityKey] = facilityRows;
  else delete next[targetFacilityKey];
  return {
    batchesByFacilityKey: next,
    consumed: Math.round((Math.max(0, Number(qty) || 0) - remain) * 10000) / 10000,
    shortage: Math.round(remain * 10000) / 10000,
    consumedRows
  };
};

export const moveHousingFoodStorageBatch = ({
  sourceBatchesByFacilityKey = {},
  targetBatchesByFacilityKey = {},
  facilityKey = '',
  itemKey = '',
  qty = 0,
  targetStorageType = 'fridge',
  day = 1
} = {}) => {
  const consumed = consumeHousingFoodStorageBatches({
    batchesByFacilityKey: sourceBatchesByFacilityKey,
    facilityKey,
    itemKey,
    qty
  });
  let nextTarget = normalizeHousingFoodStorageBatchesByFacilityKey(targetBatchesByFacilityKey);
  const targetFacilityKey = String(facilityKey || '');
  const targetItemKey = String(itemKey || '');
  const targetShelfLife = housingFoodShelfLifeDaysOf(targetItemKey, targetStorageType);
  (consumed.consumedRows || []).forEach((row) => {
    const sourceRemainDays = Math.max(0, Number(row.expireDay) || 0 ? Number(row.expireDay) - Math.max(1, Math.floor(Number(day) || 1)) + 1 : 0);
    const storedDay = Math.max(1, Math.floor(Number(day) || 1));
    const expireDay = targetShelfLife > 0
      ? storedDay + Math.min(targetShelfLife, sourceRemainDays > 0 ? sourceRemainDays : targetShelfLife) - 1
      : 0;
    const facilityRows = { ...(nextTarget[targetFacilityKey] || {}) };
    const rows = [...(facilityRows[targetItemKey] || []), { storedDay, expireDay, qty: row.qty }];
    facilityRows[targetItemKey] = rows;
    nextTarget[targetFacilityKey] = facilityRows;
    nextTarget = normalizeHousingFoodStorageBatchesByFacilityKey(nextTarget);
  });
  return {
    sourceBatchesByFacilityKey: consumed.batchesByFacilityKey,
    targetBatchesByFacilityKey: nextTarget,
    moved: consumed.consumed,
    shortage: consumed.shortage
  };
};

export const housingFoodStorageExpirySummaryOf = ({
  batchesByFacilityKey = {},
  facilityKey = '',
  itemKey = '',
  day = 1
} = {}) => {
  const normalized = normalizeHousingFoodStorageBatchesByFacilityKey(batchesByFacilityKey);
  const rows = normalized?.[String(facilityKey || '')]?.[String(itemKey || '')] || [];
  if (!rows.length) return null;
  const today = Math.max(1, Math.floor(Number(day) || 1));
  const datedRows = rows.filter((row) => Math.max(0, Number(row.expireDay) || 0) > 0);
  if (!datedRows.length) return { tone: 'stable', label: '장기보관', expireDay: 0, remainDays: null };
  const first = [...datedRows].sort((a, b) => Number(a.expireDay) - Number(b.expireDay))[0];
  const expireDay = Math.max(0, Math.floor(Number(first.expireDay) || 0));
  const remainDays = expireDay - today + 1;
  const tone = remainDays <= 0 ? 'expired' : (remainDays <= 2 ? 'soon' : (remainDays <= 5 ? 'watch' : 'stable'));
  const label = remainDays <= 0 ? '오늘 폐기 대상' : (remainDays <= 2 ? `${remainDays}일 내 사용` : `유통기한 ${remainDays}일 남음`);
  return { tone, label, expireDay, remainDays };
};

export const expireHousingFoodStorageBatchesForField = ({
  field = null,
  day = 1,
  itemMetaByKey = {}
} = {}) => {
  if (!field) return { field, logs: [] };
  const today = Math.max(1, Math.floor(Number(day) || 1));
  const storageConfigs = [
    {
      storageKey: 'housingFoodStorageByFacilityKey',
      batchKey: 'housingFoodStorageBatchesByFacilityKey',
      label: '냉장실'
    },
    {
      storageKey: 'housingFreezerFoodStorageByFacilityKey',
      batchKey: 'housingFreezerFoodStorageBatchesByFacilityKey',
      label: '냉동실'
    }
  ];
  let nextField = field;
  const logs = [];
  storageConfigs.forEach((config) => {
    const batchMap = normalizeHousingFoodStorageBatchesByFacilityKey(nextField?.[config.batchKey] || {});
    if (!Object.keys(batchMap).length) return;
    const storageMapByFacility = { ...(nextField?.[config.storageKey] || {}) };
    const nextBatchMap = {};
    let changed = false;
    Object.entries(batchMap).forEach(([facilityKey, itemRows]) => {
      const storageInventory = normalizeHousingFoodStorageByItemKey(storageMapByFacility[facilityKey] || {});
      const nextFacilityBatches = {};
      Object.entries(itemRows || {}).forEach(([itemKey, rows]) => {
        let expiredQty = 0;
        const keptRows = [];
        (Array.isArray(rows) ? rows : []).forEach((row) => {
          const expireDay = Math.max(0, Math.floor(Number(row?.expireDay) || 0));
          const qty = Math.max(0, Number(row?.qty) || 0);
          if (qty <= 0) return;
          if (expireDay > 0 && expireDay < today) {
            expiredQty = Math.round((expiredQty + qty) * 10000) / 10000;
            changed = true;
          } else {
            keptRows.push(row);
          }
        });
        if (expiredQty > 0) {
          const currentQty = Math.max(0, Number(storageInventory[itemKey]) || 0);
          const nextQty = Math.max(0, currentQty - expiredQty);
          if (nextQty > 0.0001) storageInventory[itemKey] = Math.round(nextQty * 100) / 100;
          else delete storageInventory[itemKey];
          const itemName = String(itemMetaByKey?.[itemKey]?.name || FOOD_MART_META_BY_KEY?.[itemKey]?.name || itemKey);
          const unit = String(itemMetaByKey?.[itemKey]?.unit || FOOD_MART_META_BY_KEY?.[itemKey]?.unit || '');
          logs.push(`${field?.name || '필지'} ${facilityKey} ${config.label} 유통기한 만료 폐기: ${itemName} ${Math.round(expiredQty * 100) / 100}${unit}`);
        }
        if (keptRows.length) nextFacilityBatches[itemKey] = keptRows;
      });
      if (Object.keys(storageInventory).length > 0) storageMapByFacility[facilityKey] = storageInventory;
      else delete storageMapByFacility[facilityKey];
      if (Object.keys(nextFacilityBatches).length) nextBatchMap[facilityKey] = nextFacilityBatches;
    });
    if (changed) {
      nextField = {
        ...nextField,
        [config.storageKey]: storageMapByFacility,
        [config.batchKey]: nextBatchMap
      };
    }
  });
  return { field: nextField, logs };
};

export const normalizeHousingPreparedMealCountByFacilityKey = (raw = {}) => {
  if (!raw || typeof raw !== 'object') return {};
  const next = {};
  Object.entries(raw).forEach(([facilityKeyRaw, countRaw]) => {
    const facilityKey = String(facilityKeyRaw || '');
    const count = Math.max(0, Math.floor(Number(countRaw) || 0));
    if (!facilityKey || count <= 0) return;
    next[facilityKey] = count;
  });
  return next;
};

export const HOUSING_PREPARED_MEAL_FALLBACK_KEY = 'basicMeal';

export const normalizeHousingPreparedMealStockByFacilityKey = (raw = {}) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const next = {};
  Object.entries(raw).forEach(([facilityKeyRaw, stockRaw]) => {
    const facilityKey = String(facilityKeyRaw || '');
    if (!facilityKey) return;
    if (Number.isFinite(Number(stockRaw))) {
      const count = Math.max(0, Math.floor(Number(stockRaw) || 0));
      if (count > 0) next[facilityKey] = { [HOUSING_PREPARED_MEAL_FALLBACK_KEY]: count };
      return;
    }
    const stock = stockRaw && typeof stockRaw === 'object' && !Array.isArray(stockRaw) ? stockRaw : {};
    const nextStock = {};
    Object.entries(stock).forEach(([mealKeyRaw, countRaw]) => {
      const mealKey = String(mealKeyRaw || '');
      const count = Math.max(0, Math.floor(Number(countRaw) || 0));
      if (!mealKey || count <= 0) return;
      nextStock[mealKey] = count;
    });
    if (Object.keys(nextStock).length > 0) next[facilityKey] = nextStock;
  });
  return next;
};

export const housingPreparedMealCountOfStock = (stockRaw = {}) => {
  const stock = stockRaw && typeof stockRaw === 'object' && !Array.isArray(stockRaw) ? stockRaw : {};
  return Object.values(stock).reduce((sum, countRaw) => sum + Math.max(0, Math.floor(Number(countRaw) || 0)), 0);
};

const HOUSING_THERMAL_PROFILE_BY_FACILITY = {
  farmHut6Basic: { winterWarmth: 3, summerCooling: 0, stability: 0.28, label: '간이 단열' },
  farmHut6Insulated: { winterWarmth: 7, summerCooling: 1, stability: 0.48, label: '단열 보강' },
  farmContainer20Used: { winterWarmth: 4, summerCooling: 0, stability: 0.35, label: '외기 영향 큼' },
  sandwichPanelDorm4: { winterWarmth: 5, summerCooling: 1, stability: 0.42, label: '패널 단열' },
  usedSiteOffice5: { winterWarmth: 5, summerCooling: 0, stability: 0.4, label: '간이 단열' },
  farmContainer40Office: { winterWarmth: 6, summerCooling: 1, stability: 0.45, label: '컨테이너 관리동' },
  panelHouse9: { winterWarmth: 9, summerCooling: 2, stability: 0.62, label: '패널 단열' },
  lightWood12: { winterWarmth: 10, summerCooling: 2, stability: 0.68, label: '목구조 단열' },
  modular15Value: { winterWarmth: 11, summerCooling: 3, stability: 0.72, label: '모듈러 단열' },
  mobileHome13: { winterWarmth: 10, summerCooling: 2, stability: 0.66, label: '이동식 주택' },
  steelOfficeLounge: { winterWarmth: 9, summerCooling: 2, stability: 0.6, label: '철골 관리동' },
  dualContainerLinked: { winterWarmth: 8, summerCooling: 2, stability: 0.56, label: '연결 컨테이너' },
  modular25Standard: { winterWarmth: 13, summerCooling: 4, stability: 0.78, label: '고단열 모듈러' },
  woodHouse30: { winterWarmth: 14, summerCooling: 4, stability: 0.8, label: '목조 주택' },
  smartFarmResidence: { winterWarmth: 14, summerCooling: 5, stability: 0.82, label: '관제 주거동' },
  premiumCountry35: { winterWarmth: 15, summerCooling: 5, stability: 0.84, label: '고급 단열' },
  hanokHybrid28: { winterWarmth: 13, summerCooling: 4, stability: 0.78, label: '한옥 혼합형' },
  passiveHouse30: { winterWarmth: 17, summerCooling: 6, stability: 0.9, label: '패시브급' },
  villaFarm40: { winterWarmth: 16, summerCooling: 6, stability: 0.86, label: '빌라급 주거' },
  estateFarm55: { winterWarmth: 18, summerCooling: 7, stability: 0.9, label: '최상급 주거' }
};

const HOUSING_LIVING_QUALITY_BY_FACILITY = {
  farmHut6Basic: { adjust: 30, label: '간이 농막', detail: '최소 휴식 공간 확보' },
  farmHut6Insulated: { adjust: 34, label: '단열 농막', detail: '단열 보강으로 기본 휴식성 확보' },
  farmContainer20Used: { adjust: 30, label: '중고 컨테이너', detail: '임시 주거 공간 확보' },
  sandwichPanelDorm4: { adjust: 30, label: '초소형 숙소', detail: '작지만 기본 숙박 공간 확보' },
  usedSiteOffice5: { adjust: 36, label: '중고 현장사무실', detail: '사무와 휴게 겸용 공간 확보' },
  farmContainer40Office: { adjust: 40, label: '컨테이너 관리동', detail: '관리동 겸용 주거 편의 확보' },
  panelHouse9: { adjust: 44, label: '기본 주거성', detail: '기본 생활여건 보정' },
  lightWood12: { adjust: 48, label: '경량목구조', detail: '안정적인 휴식 공간' },
  modular15Value: { adjust: 52, label: '실속형 모듈러', detail: '공간과 마감이 개선됨' },
  mobileHome13: { adjust: 50, label: '이동식 주택', detail: '독립 주거성 확보' },
  steelOfficeLounge: { adjust: 46, label: '철골 관리동', detail: '휴게 겸용 공간 확보' },
  dualContainerLinked: { adjust: 45, label: '연결 컨테이너', detail: '넓어진 컨테이너 생활 공간' },
  modular25Standard: { adjust: 58, label: '표준 모듈러', detail: '장기 거주가 가능한 안정적 주거성' },
  woodHouse30: { adjust: 62, label: '목조주택', detail: '휴식 품질과 공간성이 좋아 가점' },
  smartFarmResidence: { adjust: 66, label: '스마트팜 주거동', detail: '관리와 주거를 겸한 고급 주거성' },
  premiumCountry35: { adjust: 72, label: '프리미엄 전원주택', detail: '쾌적한 생활 기반으로 큰 가점' },
  hanokHybrid28: { adjust: 68, label: '한옥 하이브리드', detail: '주거 감성과 공간 품질 가점' },
  passiveHouse30: { adjust: 76, label: '패시브하우스', detail: '높은 쾌적성과 에너지 안정성' },
  villaFarm40: { adjust: 78, label: '빌라형 농장주택', detail: '넓은 공간과 생활 편의 가점' },
  estateFarm55: { adjust: 85, label: '대저택형 레지던스', detail: '최상급 주거성으로 최대 가점' }
};

export const housingFacilityLivingQualityInfoOf = (facilityKeyRaw = '', facilityNameRaw = '') => {
  const facilityKey = String(facilityKeyRaw || '');
  const quality = HOUSING_LIVING_QUALITY_BY_FACILITY[facilityKey] || { adjust: 0, label: '기본 주거성', detail: '생활여건 기준점' };
  return {
    facilityKey,
    facilityName: String(facilityNameRaw || ''),
    adjust: Math.max(30, Math.round(Number(quality.adjust) || 0)),
    label: String(quality.label || '기본 주거성'),
    detail: String(quality.detail || '생활여건 기준점')
  };
};

const HOUSING_THERMAL_OPTION_EFFECTS = {
  insulationPack: { winterWarmth: 3, summerCooling: 1, stability: 0.08, label: '단열' },
  highCubeRoof: { winterWarmth: 2, summerCooling: 3, stability: 0.06, label: '단열천장' },
  windowUpgrade: { winterWarmth: 2, summerCooling: 1, stability: 0.05, label: '창호' },
  doubleWindow: { winterWarmth: 3, summerCooling: 1, stability: 0.07, label: '고단열 창호' },
  tripleWindow: { winterWarmth: 4, summerCooling: 2, stability: 0.1, label: '삼중창' },
  floorHeating: { winterWarmth: 5, summerCooling: 0, stability: 0.03, label: '바닥난방' },
  heatRecovery: { winterWarmth: 2, summerCooling: 1, stability: 0.09, label: '열회수 환기' },
  hvacPremium: { winterWarmth: 6, summerCooling: 6, stability: 0.12, label: '냉난방' },
  rooftopCanopy: { winterWarmth: 0, summerCooling: 2, stability: 0.03, label: '차양' },
  solarStorage: { winterWarmth: 1, summerCooling: 1, stability: 0.04, label: '전력 안정' }
};

const HOUSING_HVAC_MODES = ['off', 'heating', 'cooling', 'auto'];
const HOUSING_HVAC_COOLING_TYPES = new Set(['airConditioner', 'fan']);
const HOUSING_HVAC_HEATING_TYPES = new Set(['heater']);
export const DEFAULT_HOUSING_HVAC_SETTING = Object.freeze({
  mode: 'off',
  targetTemperatureC: 21,
  deviceSelectionEnabled: false,
  selectedCoolingKeys: Object.freeze([]),
  selectedHeatingKeys: Object.freeze([])
});

const normalizeHvacSelectedKeys = (rawKeys = [], allowedTypes = new Set()) => {
  const source = Array.isArray(rawKeys) ? rawKeys : [];
  const seen = new Set();
  const next = [];
  source.forEach((keyRaw) => {
    const key = String(keyRaw || '').trim();
    const item = APPLIANCE_ITEM_BY_KEY[key];
    if (!key || seen.has(key) || !item || !allowedTypes.has(String(item.type || ''))) return;
    seen.add(key);
    next.push(key);
  });
  return next;
};

export const normalizeHousingHvacSetting = (raw = {}) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const mode = HOUSING_HVAC_MODES.includes(String(source.mode || '')) ? String(source.mode) : 'off';
  const deviceSelectionEnabled = Boolean(
    source.deviceSelectionEnabled
    || Object.prototype.hasOwnProperty.call(source, 'selectedCoolingKeys')
    || Object.prototype.hasOwnProperty.call(source, 'selectedHeatingKeys')
  );
  return {
    mode,
    targetTemperatureC: clamp(Math.round(Number(source.targetTemperatureC) || 21), 16, 28),
    deviceSelectionEnabled,
    selectedCoolingKeys: normalizeHvacSelectedKeys(source.selectedCoolingKeys, HOUSING_HVAC_COOLING_TYPES),
    selectedHeatingKeys: normalizeHvacSelectedKeys(source.selectedHeatingKeys, HOUSING_HVAC_HEATING_TYPES)
  };
};

export const housingHvacSettingIsDefault = (settingRaw = {}) => {
  const setting = normalizeHousingHvacSetting(settingRaw);
  return setting.mode === DEFAULT_HOUSING_HVAC_SETTING.mode
    && setting.targetTemperatureC === DEFAULT_HOUSING_HVAC_SETTING.targetTemperatureC
    && setting.selectedCoolingKeys.length === 0
    && setting.selectedHeatingKeys.length === 0;
};

export const DEFAULT_HOUSING_FRIDGE_SETTING = Object.freeze({ fridgeTempC: 4, freezerTempC: -18 });

export const normalizeHousingFridgeSetting = (raw = {}) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const fridgeTempRaw = Number(source.fridgeTempC);
  const freezerTempRaw = Number(source.freezerTempC);
  return {
    fridgeTempC: clamp(
      Number.isFinite(fridgeTempRaw) ? Math.round(fridgeTempRaw) : DEFAULT_HOUSING_FRIDGE_SETTING.fridgeTempC,
      0,
      8
    ),
    freezerTempC: clamp(
      Number.isFinite(freezerTempRaw) ? Math.round(freezerTempRaw) : DEFAULT_HOUSING_FRIDGE_SETTING.freezerTempC,
      -24,
      -12
    )
  };
};

export const housingHvacModeLabel = (modeRaw = 'off') => ({
  off: '공조 꺼짐',
  heating: '난방',
  cooling: '냉방',
  auto: '자동 공조'
}[String(modeRaw || 'off')] || '공조 꺼짐');

const housingHvacApplianceRowsOf = (itemKeysRaw = [], allowedTypes = new Set()) => (
  normalizeHvacSelectedKeys(itemKeysRaw, allowedTypes)
    .map((key) => APPLIANCE_ITEM_BY_KEY[key])
    .filter(Boolean)
);

const housingHvacCoolingPowerOf = (itemRows = []) => {
  const rawPower = itemRows.reduce((sum, item) => {
    const type = String(item?.type || '');
    if (type === 'airConditioner') {
      return sum + 0.22 + (Math.max(0, Number(item.coolingCapacityKw) || 0) * 0.105);
    }
    if (type === 'fan') {
      const bladeInch = Math.max(0, Number(item.bladeInch) || 0);
      const speedSteps = Math.max(0, Number(item.speedSteps) || 0);
      const isCirculator = String(item.fanType || '').includes('서큘레이터');
      return sum + 0.08 + (bladeInch * 0.006) + (speedSteps * 0.012) + (isCirculator ? 0.05 : 0);
    }
    return sum;
  }, 0);
  return clamp(rawPower, 0, 0.9);
};

const housingHvacHeatingPowerOf = (itemRows = []) => {
  const rawPower = itemRows.reduce((sum, item) => {
    const outputWatts = Math.max(0, Number(item.outputWatts) || 0);
    const heatingArea = Math.max(0, Number(item.heatingAreaPyeong) || 0);
    return sum + 0.18 + (outputWatts / 4200) + (heatingArea * 0.035);
  }, 0);
  return clamp(rawPower, 0, 0.9);
};

const housingHvacApplianceLabelOf = (rows = [], fallback = '') => {
  if (!rows.length) return fallback;
  if (rows.length === 1) return String(rows[0]?.name || fallback);
  return `${String(rows[0]?.name || fallback)} 외 ${rows.length - 1}대`;
};

export const housingIndoorComfortLabel = (temperatureC) => {
  const temp = Number(temperatureC);
  if (!Number.isFinite(temp)) return '🌡️ 측정 대기';
  if (temp <= -10) return '☠️ 실내 동사 위험';
  if (temp <= 0) return '🚨 생활공간 불가';
  if (temp <= 4) return '🧊 저체온 생명위험';
  if (temp <= 9) return '🥶 저체온 위험';
  if (temp <= 14) return '❄️ 장기 생활 부적합';
  if (temp <= 17) return '🧥 옷 껴입고 임시 생활';
  if (temp <= 20) return '🌱 생활 가능 최저권';
  if (temp <= 24) return '🌿 안전 쾌적';
  if (temp <= 27) return '☀️ 약간 더움';
  if (temp <= 30) return '🌤️ 다소 더움';
  if (temp <= 33) return '🔥 더움';
  return '♨️ 무더움';
};

export const housingIndoorHealthInfoOf = (indoorInfo = null) => {
  const temp = Number(indoorInfo?.temperatureC);
  if (!Number.isFinite(temp)) {
    return {
      delta: 0,
      label: '건강 영향 없음',
      detail: '실내온도 측정값 없음',
      tone: 'zero'
    };
  }
  const result = temp <= -10
    ? { delta: -7.0, label: '동사 위험', detail: '하루 건강도 -7.0 · 난방 없이 수면 시 생명위험', tone: 'minus' }
    : temp <= 0
      ? { delta: -5.5, label: '생활공간 불가', detail: '하루 건강도 -5.5 · 물이 얼고 장시간 체류가 위험', tone: 'minus' }
      : temp <= 4
        ? { delta: -4.0, label: '저체온 생명위험', detail: '하루 건강도 -4.0 · 수면 중 저체온증 가능', tone: 'minus' }
        : temp <= 9
          ? { delta: -2.6, label: '상당히 위험', detail: '하루 건강도 -2.6 · 잠잘 때 체온 저하 위험', tone: 'minus' }
          : temp <= 14
            ? { delta: -1.4, label: '장기 생활 부적합', detail: '하루 건강도 -1.4 · 혈압·호흡기 부담 증가', tone: 'minus' }
            : temp <= 17
              ? { delta: -0.6, label: '추위 부담', detail: '하루 건강도 -0.6 · 옷을 껴입어야 임시 생활 가능', tone: 'minus' }
              : temp <= 27
                ? { delta: 0, label: '건강 영향 없음', detail: '하루 건강도 변화 없음 · 생활 가능한 온도권', tone: 'zero' }
                : temp <= 30
                  ? { delta: -0.2, label: '더위 부담', detail: '하루 건강도 -0.2 · 수분 관리 필요', tone: 'minus' }
                  : temp <= 33
                    ? { delta: -0.5, label: '고온 부담', detail: '하루 건강도 -0.5 · 열피로 위험 증가', tone: 'minus' }
                    : { delta: -0.9, label: '폭염 부담', detail: '하루 건강도 -0.9 · 냉방 또는 환기 필요', tone: 'minus' };
  return {
    ...result,
    delta: Math.round(result.delta * 10) / 10
  };
};

export const housingIndoorHealthDeltaOf = (indoorInfo = null) => (
  Math.round((Number(housingIndoorHealthInfoOf(indoorInfo).delta) || 0) * 10) / 10
);

export const housingIndoorIllnessRiskInfoOf = (indoorInfo = null) => {
  const temp = Number(indoorInfo?.temperatureC);
  if (!Number.isFinite(temp)) {
    return {
      coldRisk: 0,
      heatRisk: 0,
      totalRisk: 0,
      label: '질병 유발 없음',
      detail: '실내온도 측정값 없음',
      tone: 'zero'
    };
  }
  const coldRisk = temp <= -10 ? 0.35
    : temp <= 0 ? 0.3
      : temp <= 4 ? 0.24
        : temp <= 9 ? 0.16
          : temp <= 14 ? 0.08
            : temp <= 17 ? 0.03
              : 0;
  const heatRisk = temp >= 34 ? 0.05
    : temp >= 31 ? 0.03
      : temp >= 28 ? 0.012
        : 0;
  const totalRisk = clamp(coldRisk + heatRisk, 0, 0.4);
  const label = coldRisk > 0
    ? (coldRisk >= 0.24 ? '저체온·감기 위험 매우 높음' : (coldRisk >= 0.08 ? '감기 위험 높음' : '감기 위험 있음'))
    : heatRisk > 0
      ? (heatRisk >= 0.03 ? '탈수 위험 높음' : '탈수 위험 있음')
      : '질병 유발 없음';
  const detail = coldRisk > 0
    ? `감기 기운 발생 확률 +${Math.round(coldRisk * 1000) / 10}%/일`
    : heatRisk > 0
      ? `탈수 기운 발생 확률 +${Math.round(heatRisk * 1000) / 10}%/일`
      : '온도성 질병 추가 확률 없음';
  return {
    coldRisk,
    heatRisk,
    totalRisk,
    label,
    detail,
    tone: totalRisk > 0 ? 'minus' : 'zero'
  };
};

export const housingIndoorLivingScoreBreakdownOf = (indoorInfo = null) => {
  const temp = Number(indoorInfo?.temperatureC);
  if (!Number.isFinite(temp)) {
    return {
      temperatureAdjust: 0,
      activeHvacBonus: 0,
      total: 0,
      temperatureLabel: '측정 대기',
      temperatureDetail: '실내온도 측정값 없음',
      hvacLabel: '공조 보정 없음',
      hvacDetail: '공조 미작동'
    };
  }
  const temperatureAdjust = temp >= 18 && temp <= 24 ? 10
    : temp >= 15 && temp <= 27 ? 4
      : temp >= 10 && temp <= 30 ? -6
        : temp >= 5 && temp <= 33 ? -16
          : temp >= 1 && temp <= 36 ? -28
            : -45;
  const activeHvacMode = String(indoorInfo?.activeHvacMode || 'off');
  const activeHvacBonus = activeHvacMode !== 'off' && activeHvacMode !== 'idle' ? 3 : 0;
  const temperatureLabel = temperatureAdjust >= 10 ? '쾌적 온도권'
    : temperatureAdjust >= 4 ? '임시 생활 온도권'
      : temperatureAdjust >= -6 ? '장기 생활 부적합'
        : temperatureAdjust >= -16 ? '저체온 위험 온도권'
          : temperatureAdjust >= -28 ? '생활공간 불가 온도권'
            : '생명 위험 온도권';
  return {
    temperatureAdjust,
    activeHvacBonus,
    total: temperatureAdjust + activeHvacBonus,
    temperatureLabel,
    temperatureDetail: `${Math.round(temp)}°C · ${housingIndoorComfortLabel(temp)}`,
    hvacLabel: activeHvacBonus > 0 ? '공조 작동 중' : '공조 보정 없음',
    hvacDetail: activeHvacBonus > 0
      ? `${indoorInfo?.activeHvacLabel || housingHvacModeLabel(activeHvacMode)} 생활여건 +3`
      : '꺼짐 또는 목표온도 도달 대기'
  };
};

export const housingIndoorLivingScoreAdjustmentOf = (indoorInfo = null) => {
  return Number(housingIndoorLivingScoreBreakdownOf(indoorInfo).total) || 0;
};

export const housingFanSleepQualityInfoOf = ({
  fanItem = null,
  indoorInfo = null,
  powerInfo = null
} = {}) => {
  const temp = Number(indoorInfo?.temperatureC);
  const hasFan = String(fanItem?.type || '') === 'fan';
  if (!hasFan) {
    const noFanAdjust = Number.isFinite(temp)
      ? (temp >= 30 ? -6 : (temp >= 26 ? -4 : (temp >= 24 ? -2 : 0)))
      : 0;
    return {
      hasFan: false,
      label: '선풍기 없음',
      detail: noFanAdjust < 0 ? '더운 밤 공기순환 부족' : '선풍기 보정 없음',
      qualityScore: 0,
      adjust: noFanAdjust
    };
  }
  if (powerInfo?.tone === 'off') {
    return {
      hasFan: true,
      label: String(fanItem?.name || '선풍기'),
      detail: '실내 전기 OFF로 선풍기 미작동',
      qualityScore: 0,
      adjust: 0
    };
  }
  const bladeInch = Math.max(0, Number(fanItem?.bladeInch) || 0);
  const speedSteps = Math.max(0, Number(fanItem?.speedSteps) || 0);
  const isCirculator = String(fanItem?.fanType || '').includes('서큘레이터');
  const qualityScore = clamp(Math.round(
    2
    + (Math.max(0, bladeInch - 8) * 0.35)
    + (speedSteps * 0.45)
    + (fanItem?.oscillation ? 1 : 0)
    + (isCirculator ? 2 : 0)
  ), 2, 10);
  const adjust = Number.isFinite(temp)
    ? (temp >= 30
      ? clamp(Math.round(qualityScore * 0.9), 2, 8)
      : temp >= 26
        ? clamp(Math.round(qualityScore * 0.65), 1, 6)
        : temp >= 23
          ? clamp(Math.round(qualityScore * 0.35), 1, 3)
          : 0)
    : 0;
  return {
    hasFan: true,
    label: String(fanItem?.name || '선풍기'),
    detail: adjust > 0 ? `풍량 품질 ${qualityScore}/10 · 더운 밤 공기순환` : `풍량 품질 ${qualityScore}/10`,
    qualityScore,
    adjust
  };
};

export const housingIndoorTemperatureInfoOf = ({
  facilityKey = '',
  optionKeys = [],
  hvacSetting = DEFAULT_HOUSING_HVAC_SETTING,
  installedApplianceKeys = [],
  outdoorTemperatureC = 15,
  day = 1
} = {}) => {
  const profile = HOUSING_THERMAL_PROFILE_BY_FACILITY[String(facilityKey || '')]
    || { winterWarmth: 6, summerCooling: 1, stability: 0.45, label: '기본 단열' };
  const optionEffects = Array.from(new Set(Array.isArray(optionKeys) ? optionKeys : []))
    .map((key) => HOUSING_THERMAL_OPTION_EFFECTS[String(key || '')])
    .filter(Boolean);
  const effectTotal = optionEffects.reduce((acc, effect) => ({
    winterWarmth: acc.winterWarmth + (Number(effect.winterWarmth) || 0),
    summerCooling: acc.summerCooling + (Number(effect.summerCooling) || 0),
    stability: acc.stability + (Number(effect.stability) || 0)
  }), { winterWarmth: 0, summerCooling: 0, stability: 0 });
  const outdoor = clamp(Math.round(Number(outdoorTemperatureC) || 15), -30, 45);
  const season = seasonKey(monthOf(day));
  const winterWeight = season === 'winter' ? 1 : (season === 'fall' ? 0.35 : 0.12);
  const summerWeight = season === 'summer' ? 1 : (season === 'spring' ? 0.25 : 0.08);
  const stability = clamp((Number(profile.stability) || 0) + effectTotal.stability, 0, 0.95);
  const seasonalAdjusted = outdoor
    + (((Number(profile.winterWarmth) || 0) + effectTotal.winterWarmth) * winterWeight)
    - (((Number(profile.summerCooling) || 0) + effectTotal.summerCooling) * summerWeight);
  const comfortTarget = season === 'summer' ? 24 : (season === 'winter' ? 20 : 21);
  const safeHvac = normalizeHousingHvacSetting(hvacSetting);
  const installedKeySet = new Set((Array.isArray(installedApplianceKeys) ? installedApplianceKeys : []).map((key) => String(key || '')).filter(Boolean));
  const filteredCoolingKeys = safeHvac.selectedCoolingKeys.filter((key) => installedKeySet.size <= 0 || installedKeySet.has(key));
  const filteredHeatingKeys = safeHvac.selectedHeatingKeys.filter((key) => installedKeySet.size <= 0 || installedKeySet.has(key));
  const legacyGenericHvac = safeHvac.mode !== 'off'
    && !safeHvac.deviceSelectionEnabled
    && safeHvac.selectedCoolingKeys.length === 0
    && safeHvac.selectedHeatingKeys.length === 0;
  const coolingRows = housingHvacApplianceRowsOf(filteredCoolingKeys, HOUSING_HVAC_COOLING_TYPES);
  const heatingRows = housingHvacApplianceRowsOf(filteredHeatingKeys, HOUSING_HVAC_HEATING_TYPES);
  const hasPremiumHvac = optionEffects.some((effect) => effect === HOUSING_THERMAL_OPTION_EFFECTS.hvacPremium);
  const hasHeatRecovery = optionEffects.some((effect) => effect === HOUSING_THERMAL_OPTION_EFFECTS.heatRecovery);
  const genericHvacPower = hasPremiumHvac ? 0.78 : 0.46;
  const coolingPower = coolingRows.length ? housingHvacCoolingPowerOf(coolingRows) : (legacyGenericHvac ? genericHvacPower : 0);
  const heatingPower = heatingRows.length ? housingHvacHeatingPowerOf(heatingRows) : (legacyGenericHvac ? genericHvacPower : 0);
  const hvacEfficiency = clamp(0.62 + (stability * 0.3) + (hasHeatRecovery ? 0.08 : 0), 0.45, 0.95);
  const passiveIndoor = seasonalAdjusted + ((comfortTarget - seasonalAdjusted) * stability * 0.35);
  const activeHvacMode = (() => {
    if (safeHvac.mode === 'heating') return heatingPower > 0 ? 'heating' : 'idle';
    if (safeHvac.mode === 'cooling') return coolingPower > 0 ? 'cooling' : 'idle';
    if (safeHvac.mode === 'auto') {
      if (passiveIndoor < safeHvac.targetTemperatureC - 1 && heatingPower > 0) return 'heating';
      if (passiveIndoor > safeHvac.targetTemperatureC + 1 && coolingPower > 0) return 'cooling';
      return 'idle';
    }
    return safeHvac.mode;
  })();
  const hvacAdjusted = (() => {
    if (activeHvacMode === 'heating' && passiveIndoor < safeHvac.targetTemperatureC) {
      return passiveIndoor + ((safeHvac.targetTemperatureC - passiveIndoor) * heatingPower * hvacEfficiency);
    }
    if (activeHvacMode === 'cooling' && passiveIndoor > safeHvac.targetTemperatureC) {
      return passiveIndoor - ((passiveIndoor - safeHvac.targetTemperatureC) * coolingPower * hvacEfficiency);
    }
    return passiveIndoor;
  })();
  const roundedIndoor = clamp(Math.round(hvacAdjusted), -18, 38);
  const appliedLabels = optionEffects.map((effect) => effect.label).filter(Boolean);
  const activeHvacLabel = activeHvacMode === 'idle'
    ? '대기'
    : (activeHvacMode === 'cooling'
      ? housingHvacApplianceLabelOf(coolingRows, housingHvacModeLabel(activeHvacMode))
      : (activeHvacMode === 'heating'
        ? housingHvacApplianceLabelOf(heatingRows, housingHvacModeLabel(activeHvacMode))
        : housingHvacModeLabel(activeHvacMode)));
  const livingScoreBreakdown = housingIndoorLivingScoreBreakdownOf({
    temperatureC: roundedIndoor,
    activeHvacMode,
    activeHvacLabel
  });
  return {
    temperatureC: roundedIndoor,
    label: housingIndoorComfortLabel(roundedIndoor),
    profileLabel: profile.label || '기본 단열',
    appliedLabels: appliedLabels.slice(0, 3),
    outdoorTemperatureC: outdoor,
    stability,
    hvacMode: safeHvac.mode,
    hvacModeLabel: housingHvacModeLabel(safeHvac.mode),
    activeHvacMode,
    activeHvacLabel,
    targetTemperatureC: safeHvac.targetTemperatureC,
    selectedCoolingKeys: filteredCoolingKeys,
    selectedHeatingKeys: filteredHeatingKeys,
    coolingApplianceLabel: housingHvacApplianceLabelOf(coolingRows, '냉방 기구 없음'),
    heatingApplianceLabel: housingHvacApplianceLabelOf(heatingRows, '난방 기구 없음'),
    hasPremiumHvac,
    passiveTemperatureC: Math.round(passiveIndoor),
    seasonalAdjustedTemperatureC: Math.round(seasonalAdjusted),
    stabilityPercent: Math.round(stability * 100),
    hvacPowerPercent: Math.round((activeHvacMode === 'heating' ? heatingPower : (activeHvacMode === 'cooling' ? coolingPower : Math.max(heatingPower, coolingPower))) * hvacEfficiency * 100),
    livingScoreBreakdown,
    healthInfo: housingIndoorHealthInfoOf({ temperatureC: roundedIndoor }),
    illnessRiskInfo: housingIndoorIllnessRiskInfoOf({ temperatureC: roundedIndoor })
  };
};

export const housingSleepQualityInfoOf = ({
  indoorInfo = null,
  facilityQualityInfo = null,
  powerInfo = null,
  fanInfo = null,
  weatherName = '',
  bedAdjust = 8
} = {}) => {
  const temp = Number(indoorInfo?.temperatureC);
  const stability = clamp(Number(indoorInfo?.stability) || 0, 0, 0.95);
  const housingAdjust = Math.round((Math.max(30, Number(facilityQualityInfo?.adjust) || 30) - 30) * 0.32);
  const powerAdjust = powerInfo?.tone === 'off' ? -14 : 3;
  const hvacAdjust = indoorInfo?.activeHvacMode && indoorInfo.activeHvacMode !== 'off' && indoorInfo.activeHvacMode !== 'idle' ? 5 : 0;
  const fanAdjust = Math.round(Number(fanInfo?.adjust) || 0);
  const weatherText = String(weatherName || '');
  const weatherAdjust = /강풍|태풍|폭우|호우|대설|폭설|한파/.test(weatherText)
    ? -8
    : /비|눈|우박|천둥|번개/.test(weatherText)
      ? -4
      : /맑음|청명|쾌청/.test(weatherText)
        ? 2
        : 0;
  const temperatureAdjust = Number.isFinite(temp)
    ? (temp >= 18 && temp <= 22 ? 18
      : temp >= 16 && temp <= 24 ? 12
        : temp >= 15 && temp <= 27 ? 4
          : temp >= 10 && temp <= 30 ? -14
            : temp >= 5 && temp <= 33 ? -30
              : temp >= 1 && temp <= 36 ? -44
                : -58)
    : 0;
  const baseScore = 38;
  const stabilityAdjust = Math.round(stability * 10);
  const bedScoreAdjust = Math.round(Number(bedAdjust) || 0);
  const normalized = clamp(Math.round(
    baseScore
    + housingAdjust
    + stabilityAdjust
    + bedScoreAdjust
    + temperatureAdjust
    + powerAdjust
    + hvacAdjust
    + fanAdjust
    + weatherAdjust
  ), 0, 100);
  const label = normalized >= 92 ? '최상'
    : normalized >= 82 ? '매우 좋음'
      : normalized >= 70 ? '좋음'
        : normalized >= 58 ? '보통'
          : normalized >= 42 ? '불편'
            : normalized >= 25 ? '나쁨'
              : '매우 나쁨';
  const reason = Number.isFinite(temp)
    ? `${indoorInfo.label || '실내'} · ${Math.round(temp)}°C`
    : '실내온도 측정 대기';
  return {
    score: normalized,
    label,
    reason,
    fanInfo,
    factors: {
      base: baseScore,
      housing: housingAdjust,
      bed: bedScoreAdjust,
      temperature: temperatureAdjust,
      power: powerAdjust,
      hvac: hvacAdjust,
      fan: fanAdjust,
      weather: weatherAdjust,
      stability: stabilityAdjust
    }
  };
};

const HOUSING_LIFE_SUPPLY_EXPLICIT_DAYS_BY_ITEM_KEY = {
  foodWater2L: { foodDays: 0.15 },
  foodSportsDrink15L: { foodDays: 0.1 },
  foodCanCoffee: { foodDays: 0.03 },
  foodCupRamen: { foodDays: 0.25 },
  foodTriangleGimbap: { foodDays: 0.3 },
  foodLunchBox: { foodDays: 0.55 },
  foodKimbapRoll: { foodDays: 0.45 },
  foodHotdog: { foodDays: 0.25 },
  foodHamburger: { foodDays: 0.35 },
  foodBagRamen5Pack: { foodDays: 1.25 },
  foodBagRamenSingle: { foodDays: 0.25 },
  foodBreadLoaf: { foodDays: 1 },
  foodMilk1L: { foodDays: 0.35 },
  foodEgg30Pack: { foodDays: 2.5 },
  foodRice10kg: { foodDays: 14 },
  foodKimchi35kg: { foodDays: 4 },
  foodTofu300g: { foodDays: 0.35 },
  foodBeanSprouts500g: { foodDays: 0.4 },
  foodOnion1kg: { foodDays: 0.8 },
  foodPorkFront600g: { foodDays: 0.75 },
  foodSpam200g: { foodDays: 0.35 },
  foodTunaCan150g: { foodDays: 0.25 },
  foodSlicedCheese20: { foodDays: 1.2 },
  foodFrozenPorkCutlet: { foodDays: 0.9 },
  foodFrozenPasta: { foodDays: 0.45 },
  foodFrozenDumpling1kg: { foodDays: 1.1 },
  foodFrozenFriedRice: { foodDays: 0.5 },
  foodFrozenTteokbokki: { foodDays: 0.55 },
  foodFrozenUdon: { foodDays: 0.45 },
  foodInstantRice210g: { foodDays: 0.3 },
  foodInstantRice210g3Pack: { foodDays: 0.9 },
  foodInstantRice210g6Pack: { foodDays: 1.8 },
  foodInstantSoupSeaweed: { foodDays: 0.15 },
  foodInstantSoupYukgaejang: { foodDays: 0.25 },
  foodUdonPack2: { foodDays: 0.65 },
  foodColdNoodle2Pack: { foodDays: 0.65 },
  foodPastaSpaghetti500g: { foodDays: 1.3 },
  foodCreamSoupPack: { foodDays: 0.6 },
  foodCreamSoupSingle: { foodDays: 0.2 },
  foodCurry3Pack: { foodDays: 0.75 },
  foodJjajangSauce3Pack: { foodDays: 0.75 },
  foodRicePorridgeAbalone: { foodDays: 0.35 },
  foodRicePorridgeVegetable: { foodDays: 0.35 },
  foodSausagePack: { foodDays: 0.5 },
  foodCrackerBox: { foodDays: 0.35 },
  foodChocolatePie12Pack: { foodDays: 0.45 },
  foodPotatoChips: { foodDays: 0.2 },
  foodPeanutSnack: { foodDays: 0.25 },
  foodIceCreamBar6Pack: { foodDays: 0.35 },
  foodBananaMilk: { foodDays: 0.08 },
  foodMilkCoffee500ml: { foodDays: 0.08 },
  foodSikhye15L: { foodDays: 0.12 },
  foodOrangeJuice15L: { foodDays: 0.12 },
  foodCola15L: { foodDays: 0.1 },
  foodCider15L: { foodDays: 0.1 },
  foodGreenTea500ml: { foodDays: 0.06 },
  foodBarleyTea15L: { foodDays: 0.12 },
  foodMixCoffee100Pack: { foodDays: 0.5 },
  foodGreenTeaBag50Pack: { foodDays: 0.25 },
  foodSoySauce18L: { foodDays: 0.7 },
  foodCookingOil18L: { foodDays: 0.9 },
  foodFlour1kg: { foodDays: 1.4 },
  foodSugar3kg: { foodDays: 0.8 },
  foodBagel4Pack: { foodDays: 0.8 },
  foodStrawberryJam500g: { foodDays: 0.6 },
  foodYogurt4Pack: { foodDays: 0.45 },
  foodApple4Pack: { foodDays: 0.45 },
  foodBanana1Hand: { foodDays: 0.6 },
  foodMandarin1kg: { foodDays: 0.8 },
  foodCabbageHalf: { foodDays: 0.55 },
  foodPotato1kg: { foodDays: 1 },
  foodCarrot500g: { foodDays: 0.45 },
  foodLettuce300g: { foodDays: 0.35 },
  foodCucumber3Pack: { foodDays: 0.5 },
  foodCherryTomato500g: { foodDays: 0.45 },
  foodSweetPotato1kg: { foodDays: 1.1 },
  foodSaladDressing250ml: { foodDays: 0.7 },
  foodFishCake300g: { foodDays: 0.35 },
  foodFrozenPizza: { foodDays: 0.75 },
  foodRamenSpicySingle: { foodDays: 0.25 },
  foodRamenSpicy5Pack: { foodDays: 1.25 },
  foodRamenMildSingle: { foodDays: 0.25 },
  foodRamenMild5Pack: { foodDays: 1.25 },
  foodJjajangRamenSingle: { foodDays: 0.25 },
  foodJjajangRamen4Pack: { foodDays: 1 },
  foodCupRiceBeefSoup: { foodDays: 0.45 },
  foodCereal500g: { foodDays: 1.1 },
  foodSeaweed16Pack: { foodDays: 0.5 },
  foodChocoBar4Pack: { foodDays: 0.3 },
  foodJellySnack: { foodDays: 0.2 },
  foodEnergyDrink250ml: { foodDays: 0.06 },
  foodTomatoJuice15L: { foodDays: 0.12 },
  foodSalt1kg: { foodDays: 0.4 },
  foodRedPepperPaste500g: { foodDays: 0.5 },
  foodSoybeanPaste500g: { foodDays: 0.5 },
  foodSesameOil320ml: { foodDays: 0.35 }
};

const HOUSING_LIFE_SUPPLY_DAILY_CONSUME_QTY_BY_ITEM_KEY = {
  foodRice10kg: 0.08,
  foodKimchi35kg: 0.15,
  foodSoySauce18L: 0.03,
  foodCookingOil18L: 0.03,
  foodFlour1kg: 0.12,
  foodSugar3kg: 0.06,
  foodSalt1kg: 0.04,
  foodRedPepperPaste500g: 0.08,
  foodSoybeanPaste500g: 0.08,
  foodSesameOil320ml: 0.08,
  foodMixCoffee100Pack: 0.08,
  foodGreenTeaBag50Pack: 0.08,
  foodEgg30Pack: 0.18,
  foodSlicedCheese20: 0.18,
  foodBreadLoaf: 0.25,
  foodBagRamen5Pack: 0.25,
  foodBagRamenSingle: 1,
  foodRamenSpicySingle: 1,
  foodRamenSpicy5Pack: 0.25,
  foodRamenMildSingle: 1,
  foodRamenMild5Pack: 0.25,
  foodJjajangRamenSingle: 1,
  foodJjajangRamen4Pack: 0.25,
  foodFrozenDumpling1kg: 0.25,
  foodPastaSpaghetti500g: 0.2,
  foodCereal500g: 0.2,
  foodSeaweed16Pack: 0.12,
  foodCreamSoupSingle: 1,
  foodLettuce300g: 0.35,
  foodCucumber3Pack: 0.34,
  foodCherryTomato500g: 0.3,
  foodSweetPotato1kg: 0.25,
  foodSaladDressing250ml: 0.08,
  foodInstantRice210g: 1
};

const FOOD_MART_META_BY_KEY = (FOOD_MART_ITEMS || []).reduce((acc, item) => {
  const key = String(item?.key || '');
  if (key) acc[key] = item;
  return acc;
}, {});
FOOD_MART_META_BY_KEY.housingCookedRiceBowl = {
  key: 'housingCookedRiceBowl',
  name: '지어진밥',
  unit: '공기',
  subgroup: 'cooked'
};
FOOD_MART_META_BY_KEY.housingWaterCup = {
  key: 'housingWaterCup',
  name: '물 한컵',
  unit: '컵',
  subgroup: 'drink'
};
FOOD_MART_META_BY_KEY.housingHotWaterCup = {
  key: 'housingHotWaterCup',
  name: '온수 한컵',
  unit: '컵',
  subgroup: 'drink'
};
FOOD_MART_META_BY_KEY.housingMixCoffeeCup = {
  key: 'housingMixCoffeeCup',
  name: '믹스커피 한잔',
  unit: '잔',
  subgroup: 'drink'
};
FOOD_MART_META_BY_KEY.housingGreenTeaCup = {
  key: 'housingGreenTeaCup',
  name: '녹차 한잔',
  unit: '잔',
  subgroup: 'drink'
};
FOOD_MART_META_BY_KEY.housingFilledWaterBottle = {
  key: 'housingFilledWaterBottle',
  name: '채운 물병',
  unit: '병',
  subgroup: 'drink'
};

export const HOUSING_MEAL_RECIPE_CATEGORY_TABS = Object.freeze([
  ['rice', '🍚 밥류'],
  ['vegetarian', '🥬 채식류'],
  ['soup', '🍲 국·찌개'],
  ['noodle', '🍜 면류'],
  ['bread', '🍞 빵·아침']
]);

const HOUSING_MEAL_RECIPE_CATEGORY_LABEL_BY_KEY = HOUSING_MEAL_RECIPE_CATEGORY_TABS.reduce((acc, [key, label]) => {
  acc[key] = label;
  return acc;
}, {});

export const HOUSING_MEAL_PREP_DEFS = Object.freeze([
  {
    key: 'housingCookedRiceBowl',
    name: '지어진밥',
    desc: '전기밥솥으로 지어둔 기본 밥',
    ingredients: { foodRice10kg: 0.025 },
    outputItemKey: 'housingCookedRiceBowl',
    outputQty: 3
  },
  {
    key: 'housingWaterCup',
    name: '물 한컵',
    desc: '정수기에서 바로 받아둔 마실 물',
    ingredients: {},
    waterOnly: true,
    outputItemKey: 'housingWaterCup',
    outputQty: 1
  },
  {
    key: 'housingFilledWaterBottle',
    name: '물병 채우기',
    desc: '정수기 물을 물병에 채워 보관',
    ingredients: {},
    waterOnly: true,
    outputItemKey: 'housingFilledWaterBottle',
    outputQty: 1
  },
  {
    key: 'housingHotWaterCup',
    name: '온수 한컵',
    desc: '커피포트로 끓여둔 뜨거운 물',
    ingredients: {},
    waterOnly: true,
    outputItemKey: 'housingHotWaterCup',
    outputQty: 1
  },
  {
    key: 'preparedMixCoffee',
    name: '믹스커피 타기',
    desc: '믹스커피 한 봉에 뜨거운 물을 부어 타 둡니다.',
    ingredients: { foodMixCoffee100Pack: 0.01 },
    outputItemKey: 'housingMixCoffeeCup',
    outputQty: 1
  },
  {
    key: 'preparedGreenTea',
    name: '녹차 우리기',
    desc: '녹차 티백 한 개에 뜨거운 물을 부어 우려 둡니다.',
    ingredients: { foodGreenTeaBag50Pack: 0.02 },
    outputItemKey: 'housingGreenTeaCup',
    outputQty: 1
  },
  {
    key: 'preparedCupRamen',
    name: '끓인 컵라면',
    desc: '컵라면에 뜨거운 물을 부어 바로 먹는 간편식',
    ingredients: { foodCupRamen: 1 }
  },
  {
    key: 'heatedTriangleGimbap',
    name: '데운 삼각김밥',
    desc: '삼각김밥을 살짝 데워 먹는 짧은 식사',
    ingredients: { foodTriangleGimbap: 1 }
  },
  {
    key: 'heatedLunchBox',
    name: '데운 도시락',
    desc: '전자레인지로 데운 즉석 도시락',
    ingredients: { foodLunchBox: 1 }
  },
  {
    key: 'heatedKimbapRoll',
    name: '데운 줄김밥',
    desc: '줄김밥을 살짝 데워 먹는 간편 한 끼',
    ingredients: { foodKimbapRoll: 1 }
  },
  {
    key: 'heatedHotdog',
    name: '데운 핫도그',
    desc: '전자레인지로 데운 분식형 간편식',
    ingredients: { foodHotdog: 1 }
  },
  {
    key: 'heatedHamburger',
    name: '데운 편의점 햄버거',
    desc: '포장 햄버거를 데워 먹는 빠른 식사',
    ingredients: { foodHamburger: 1 }
  },
  {
    key: 'boiledBagRamen',
    name: '끓인 얼큰라면',
    desc: '얼큰라면 1봉을 물에 끓인 기본 라면',
    ingredients: { foodBagRamenSingle: 1 }
  },
  {
    key: 'boiledSpicyRamen',
    name: '끓인 매운라면',
    desc: '매운라면 1봉을 끓인 간단한 면식',
    ingredients: { foodRamenSpicySingle: 1 }
  },
  {
    key: 'boiledMildRamen',
    name: '끓인 순한라면',
    desc: '순한라면 1봉을 끓인 부담 적은 면식',
    ingredients: { foodRamenMildSingle: 1 }
  },
  {
    key: 'boiledJjajangRamen',
    name: '끓인 짜장라면',
    desc: '짜장라면 1봉을 끓인 별미 간편식',
    ingredients: { foodJjajangRamenSingle: 1 }
  },
  {
    key: 'heatedInstantRice',
    name: '데운 즉석밥',
    desc: '즉석밥 1개를 데워 바로 먹는 기본 식사',
    ingredients: { foodInstantRice210g: 1 }
  },
  {
    key: 'heatedInstantSeaweedSoup',
    name: '데운 미역국',
    desc: '즉석 미역국에 뜨거운 물을 부어 먹는 국물식',
    ingredients: { foodInstantSoupSeaweed: 1 }
  },
  {
    key: 'heatedInstantYukgaejang',
    name: '데운 육개장',
    desc: '즉석 육개장을 데워 먹는 국물 간편식',
    ingredients: { foodInstantSoupYukgaejang: 1 }
  },
  {
    key: 'steamedFrozenDumpling',
    name: '찐 냉동만두',
    desc: '냉동만두를 찌거나 구워 먹는 간편식',
    ingredients: { foodFrozenDumpling1kg: 0.18 }
  },
  {
    key: 'heatedFrozenPorkCutlet',
    name: '데운 돈까스',
    desc: '냉동 돈까스를 팬이나 에어프라이어로 데운 식사',
    ingredients: { foodFrozenPorkCutlet: 0.25 }
  },
  {
    key: 'heatedFrozenPizza',
    name: '데운 냉동피자',
    desc: '냉동피자를 오븐이나 에어프라이어로 데운 식사',
    ingredients: { foodFrozenPizza: 1 }
  },
  {
    key: 'boiledColdNoodle',
    name: '삶은 냉면',
    desc: '냉면 1인분을 삶아 차갑게 먹는 간편 면식',
    ingredients: { foodColdNoodle2Pack: 0.5 }
  },
  {
    key: 'preparedCreamSoup',
    name: '탄 컵스프',
    desc: '컵스프에 뜨거운 물을 부어 먹는 가벼운 간편식',
    ingredients: { foodCreamSoupSingle: 1 }
  },
  {
    key: 'heatedFrozenFriedRice',
    name: '데운 냉동볶음밥',
    desc: '냉동볶음밥을 팬이나 전자레인지로 데운 식사',
    ingredients: { foodFrozenFriedRice: 1 }
  },
  {
    key: 'heatedFrozenPasta',
    name: '데운 냉동파스타',
    desc: '냉동파스타를 데워 바로 먹는 면식',
    ingredients: { foodFrozenPasta: 1 }
  },
  {
    key: 'heatedFrozenTteokbokki',
    name: '데운 냉동 떡볶이',
    desc: '냉동 떡볶이를 데운 분식 식사',
    ingredients: { foodFrozenTteokbokki: 1 }
  },
  {
    key: 'boiledFrozenUdon',
    name: '끓인 냉동 우동',
    desc: '냉동 우동을 끓여 먹는 따뜻한 간편식',
    ingredients: { foodFrozenUdon: 1 }
  },
  {
    key: 'heatedPorridgeAbalone',
    name: '데운 전복죽',
    desc: '전복죽 팩을 데워 먹는 부담 적은 식사',
    ingredients: { foodRicePorridgeAbalone: 1 }
  },
  {
    key: 'heatedPorridgeVegetable',
    name: '데운 야채죽',
    desc: '야채죽 팩을 데워 먹는 가벼운 식사',
    ingredients: { foodRicePorridgeVegetable: 1 }
  },
  {
    key: 'preparedCupRiceSoup',
    name: '끓인 컵국밥',
    desc: '컵국밥에 뜨거운 물을 부어 먹는 간편 국밥',
    ingredients: { foodCupRiceBeefSoup: 1 }
  }
]);

export const HOUSING_MEAL_PREP_BY_KEY = HOUSING_MEAL_PREP_DEFS.reduce((acc, prep) => {
  acc[prep.key] = prep;
  return acc;
}, {});

export const HOUSING_DAILY_LIVING_WATER_LITERS = 50;

const HOUSING_MEAL_PREP_WATER_LITERS_BY_KEY = Object.freeze({
  housingCookedRiceBowl: 0.35,
  housingWaterCup: 0.2,
  housingFilledWaterBottle: 1,
  housingHotWaterCup: 0.25,
  preparedMixCoffee: 0.18,
  preparedGreenTea: 0.18,
  preparedCupRamen: 0.35,
  boiledBagRamen: 0.55,
  boiledSpicyRamen: 0.55,
  boiledMildRamen: 0.55,
  boiledJjajangRamen: 0.45,
  heatedInstantSeaweedSoup: 0.35,
  heatedInstantYukgaejang: 0.35,
  steamedFrozenDumpling: 0.2,
  boiledColdNoodle: 1.2,
  preparedCreamSoup: 0.18,
  boiledFrozenUdon: 0.6,
  preparedCupRiceSoup: 0.3
});

const HOUSING_MEAL_RECIPE_WATER_LITERS_BY_KEY = Object.freeze({
  porkKimchiStew: 0.7,
  doenjangStewSet: 0.75,
  kimchiTofuSoup: 0.8,
  eggRamen: 0.6,
  fishCakeUdon: 0.65,
  dumplingRamenPot: 0.75,
  curryUdon: 0.55,
  mushroomStirFryUdon: 0.25,
  porkStirFryUdon: 0.25
});

export const housingWaterDisplayTextOf = (litersRaw = 0) => {
  const liters = Math.max(0, Number(litersRaw) || 0);
  if (liters <= 0) return '물 없음';
  if (liters < 1) return `물 ${Math.round(liters * 1000)}ml`;
  return `물 ${Math.round(liters * 10) / 10}L`;
};

export const housingMealWaterLitersOf = (meal = null) => {
  const key = String(meal?.key || '');
  if (!key) return 0;
  if (HOUSING_MEAL_PREP_WATER_LITERS_BY_KEY[key] != null) {
    return Math.max(0, Number(HOUSING_MEAL_PREP_WATER_LITERS_BY_KEY[key]) || 0);
  }
  if (HOUSING_MEAL_RECIPE_WATER_LITERS_BY_KEY[key] != null) {
    return Math.max(0, Number(HOUSING_MEAL_RECIPE_WATER_LITERS_BY_KEY[key]) || 0);
  }
  const category = String(meal?.category || '');
  if (category === 'soup') return 0.7;
  return 0;
};

export const HOUSING_MEAL_RECIPE_DEFS = Object.freeze([
  {
    key: 'eggRiceBreakfast',
    name: '간장 계란밥',
    category: 'vegetarian',
    desc: '밥에 계란, 간장, 참기름을 더한 간단한 한 끼',
    ingredients: { housingCookedRiceBowl: 1, foodEgg30Pack: 0.04, foodSoySauce18L: 0.007, foodSesameOil320ml: 0.015 }
  },
  {
    key: 'bibimbap',
    name: '비빔밥',
    category: 'vegetarian',
    desc: '밥에 콩나물, 당근, 오이, 계란을 올리고 고추장과 참기름으로 비벼 먹는 기본 비빔밥',
    ingredients: { housingCookedRiceBowl: 1.1, foodBeanSprouts500g: 0.14, foodCarrot500g: 0.08, foodCucumber3Pack: 0.34, foodEgg30Pack: 0.04, foodRedPepperPaste500g: 0.025, foodSesameOil320ml: 0.012 }
  },
  {
    key: 'porkKimchiStew',
    name: '돼지고기 김치찌개',
    category: 'soup',
    desc: '비 오거나 추운 날 든든한 국물 식사',
    ingredients: { housingCookedRiceBowl: 1, foodKimchi35kg: 0.045, foodPorkFront600g: 0.18, foodTofu300g: 0.25 }
  },
  {
    key: 'doenjangStewSet',
    name: '된장찌개',
    category: 'soup',
    desc: '두부와 채소를 넣은 무난한 집밥',
    ingredients: { housingCookedRiceBowl: 1, foodSoybeanPaste500g: 0.025, foodTofu300g: 0.25, foodOnion1kg: 0.08, foodPotato1kg: 0.08 }
  },
  {
    key: 'ramenWithEgg',
    name: '계란라면',
    category: 'noodle',
    desc: '바쁜 날 빠르게 끓여 먹는 한 끼',
    ingredients: { foodBagRamen5Pack: 0.2, foodEgg30Pack: 0.04, foodKimchi35kg: 0.02 }
  },
  {
    key: 'friedRice',
    name: '채소 볶음밥',
    category: 'vegetarian',
    desc: '남은 채소와 밥으로 만드는 작업 전 식사',
    ingredients: { housingCookedRiceBowl: 1.2, foodEgg30Pack: 0.04, foodOnion1kg: 0.08, foodCarrot500g: 0.08, foodCookingOil18L: 0.008 }
  },
  {
    key: 'curryRice',
    name: '카레라이스',
    category: 'vegetarian',
    desc: '한번 준비해 두면 먹기 편한 든든한 식사',
    ingredients: { housingCookedRiceBowl: 1.2, foodCurry3Pack: 0.34, foodPotato1kg: 0.08, foodCarrot500g: 0.08, foodOnion1kg: 0.08 }
  },
  {
    key: 'sausageBreadPlate',
    name: '소시지 빵식사',
    category: 'bread',
    desc: '아침이나 야간에 간단히 먹는 빵 식사',
    ingredients: { foodBreadLoaf: 0.12, foodSausagePack: 0.2, foodSlicedCheese20: 0.04 }
  },
  {
    key: 'spamKimchiFriedRice',
    name: '스팸 김치볶음밥',
    category: 'rice',
    desc: '김치와 햄을 볶아 빠르게 만드는 든든한 숙소식',
    ingredients: { housingCookedRiceBowl: 1.2, foodKimchi35kg: 0.04, foodSpam200g: 0.25, foodEgg30Pack: 0.04, foodGreenOnion300g: 0.06, foodCookingOil18L: 0.008 }
  },
  {
    key: 'tunaMayoRiceBowl',
    name: '참치마요 덮밥',
    category: 'rice',
    desc: '참치와 마요네즈, 계란을 올린 간단한 밥 한 그릇',
    ingredients: { housingCookedRiceBowl: 1, foodTunaCan150g: 0.5, foodMayonnaise500g: 0.035, foodEgg30Pack: 0.04, foodSeaweed16Pack: 0.06, foodSoySauce18L: 0.006 }
  },
  {
    key: 'beanSproutSoupSet',
    name: '콩나물국밥',
    category: 'soup',
    desc: '저렴한 재료로 끓이는 아침 국물 식사',
    ingredients: { housingCookedRiceBowl: 1, foodBeanSprouts500g: 0.2, foodEgg30Pack: 0.04, foodSalt1kg: 0.002, foodSoySauce18L: 0.006 }
  },
  {
    key: 'porkGochujangStirFry',
    name: '고추장 돼지볶음',
    category: 'rice',
    desc: '작업 후 먹기 좋은 매콤한 고기 반찬 식사',
    ingredients: { housingCookedRiceBowl: 1.2, foodPorkFront600g: 0.2, foodRedPepperPaste500g: 0.035, foodRedPepperPowder500g: 0.012, foodMincedGarlic500g: 0.018, foodOnion1kg: 0.08, foodCabbageHalf: 0.08, foodCookingOil18L: 0.008 }
  },
  {
    key: 'tofuKimchiPlate',
    name: '두부김치',
    category: 'rice',
    desc: '데운 두부와 볶은 김치를 곁들이는 반찬형 식사',
    ingredients: { housingCookedRiceBowl: 1, foodTofu300g: 0.5, foodKimchi35kg: 0.04, foodPorkFront600g: 0.12, foodGreenOnion300g: 0.04, foodSesameOil320ml: 0.015 }
  },
  {
    key: 'fishCakeUdon',
    name: '어묵우동',
    category: 'noodle',
    desc: '어묵과 우동사리를 끓여 먹는 따뜻한 면식',
    ingredients: { foodUdonPack2: 0.5, foodFishCake300g: 0.35, foodOnion1kg: 0.05, foodSoySauce18L: 0.01 }
  },
  {
    key: 'jjajangRice',
    name: '짜장덮밥',
    category: 'rice',
    desc: '양파와 고기를 더해 만드는 짜장밥',
    ingredients: { housingCookedRiceBowl: 1.2, foodJjajangSauce3Pack: 0.34, foodOnion1kg: 0.08, foodPorkFront600g: 0.12 }
  },
  {
    key: 'cabbageEggToast',
    name: '양배추 계란토스트',
    category: 'bread',
    desc: '식빵에 계란과 양배추를 넣어 굽는 아침 식사',
    ingredients: { foodBreadLoaf: 0.12, foodEgg30Pack: 0.04, foodCabbageHalf: 0.06, foodSlicedCheese20: 0.04, foodCookingOil18L: 0.01 }
  },
  {
    key: 'bagelCheeseBreakfast',
    name: '베이글 치즈 브런치',
    category: 'bread',
    desc: '베이글에 계란과 치즈를 곁들이는 가벼운 조리식',
    ingredients: { foodBagel4Pack: 0.25, foodEgg30Pack: 0.04, foodSlicedCheese20: 0.04, foodMilk1L: 0.15 }
  },
  {
    key: 'dumplingRamenPot',
    name: '만두라면 냄비',
    category: 'noodle',
    desc: '라면에 만두와 계란을 넣어 끓이는 비상식량 식사',
    ingredients: { foodBagRamen5Pack: 0.2, foodFrozenDumpling1kg: 0.15, foodEgg30Pack: 0.04, foodKimchi35kg: 0.02 }
  },
  {
    key: 'porkPotatoStew',
    name: '돼지고기 감자찌개',
    category: 'soup',
    desc: '감자와 고추장을 넣어 끓이는 농가형 찌개 식사',
    ingredients: { housingCookedRiceBowl: 1, foodPorkFront600g: 0.18, foodPotato1kg: 0.12, foodOnion1kg: 0.06, foodRedPepperPaste500g: 0.025, foodSoybeanPaste500g: 0.015 }
  },
  {
    key: 'porkDoenjangStewSet',
    name: '돼지고기 된장찌개',
    category: 'soup',
    desc: '돼지고기와 된장을 넣어 끓이는 구수한 찌개 식사',
    ingredients: { housingCookedRiceBowl: 1, foodPorkFront600g: 0.16, foodSoybeanPaste500g: 0.028, foodTofu300g: 0.25, foodOnion1kg: 0.06, foodGreenOnion300g: 0.03 }
  },
  {
    key: 'kimchiPorkStirFrySet',
    name: '김치제육',
    category: 'rice',
    desc: '돼지고기와 김치를 볶아 밥과 먹는 든든한 고기 요리',
    ingredients: { housingCookedRiceBowl: 1.2, foodPorkFront600g: 0.2, foodKimchi35kg: 0.055, foodOnion1kg: 0.08, foodGreenOnion300g: 0.04, foodRedPepperPowder500g: 0.008, foodCookingOil18L: 0.008 }
  },
  {
    key: 'porkCurryRice',
    name: '돼지고기 카레덮밥',
    category: 'rice',
    desc: '돼지고기와 감자, 당근을 넣은 카레 덮밥',
    ingredients: { housingCookedRiceBowl: 1.2, foodPorkFront600g: 0.16, foodCurry3Pack: 0.34, foodPotato1kg: 0.1, foodCarrot500g: 0.08, foodOnion1kg: 0.08 }
  },
  {
    key: 'porkCutletRiceSet',
    name: '돈까스 정식',
    category: 'rice',
    desc: '냉동 돈까스를 데워 밥과 양배추를 곁들이는 정식',
    ingredients: { housingCookedRiceBowl: 1, foodFrozenPorkCutlet: 0.25, foodCabbageHalf: 0.05, foodCookingOil18L: 0.012 }
  },
  {
    key: 'sausageVegStirFrySet',
    name: '소시지 야채볶음',
    category: 'rice',
    desc: '비엔나소시지와 양파, 양배추를 볶아 먹는 반찬형 식사',
    ingredients: { housingCookedRiceBowl: 1, foodSausagePack: 0.35, foodOnion1kg: 0.08, foodCabbageHalf: 0.08, foodSoySauce18L: 0.006, foodCookingOil18L: 0.008 }
  },
  {
    key: 'budaeStewSet',
    name: '부대찌개',
    category: 'soup',
    desc: '햄, 소시지, 라면사리를 넣어 끓이는 고기 국물 식사',
    ingredients: { housingCookedRiceBowl: 1, foodSpam200g: 0.25, foodSausagePack: 0.25, foodBagRamen5Pack: 0.1, foodKimchi35kg: 0.035, foodTofu300g: 0.2, foodRedPepperPaste500g: 0.018 }
  },
  {
    key: 'dumplingRiceSoup',
    name: '만두국밥',
    category: 'soup',
    desc: '만두와 계란을 넣고 밥을 곁들이는 따뜻한 국밥',
    ingredients: { housingCookedRiceBowl: 1, foodFrozenDumpling1kg: 0.18, foodEgg30Pack: 0.04, foodGreenOnion300g: 0.03, foodSoySauce18L: 0.006 }
  },
  {
    key: 'porkStirFryUdon',
    name: '돼지고기 볶음우동',
    category: 'noodle',
    desc: '돼지고기와 양파를 볶아 우동사리와 섞는 면식',
    ingredients: { foodUdonPack2: 0.5, foodPorkFront600g: 0.14, foodOnion1kg: 0.08, foodCabbageHalf: 0.08, foodSoySauce18L: 0.01, foodCookingOil18L: 0.008 }
  },
  {
    key: 'kimchiTunaFriedRice',
    name: '김치참치볶음밥',
    category: 'rice',
    desc: '김치와 참치를 볶아 만드는 간단한 팬 식사',
    ingredients: { housingCookedRiceBowl: 1.2, foodKimchi35kg: 0.04, foodTunaCan150g: 0.5, foodEgg30Pack: 0.04, foodGreenOnion300g: 0.05, foodCookingOil18L: 0.008 }
  },
  {
    key: 'spamMayoRiceBowl',
    name: '스팸마요 덮밥',
    category: 'rice',
    desc: '구운 햄과 계란, 마요네즈를 올린 든든한 덮밥',
    ingredients: { housingCookedRiceBowl: 1.1, foodSpam200g: 0.3, foodEgg30Pack: 0.04, foodMayonnaise500g: 0.035, foodSeaweed16Pack: 0.06, foodSoySauce18L: 0.005 }
  },
  {
    key: 'fishCakeStirFrySet',
    name: '어묵볶음',
    category: 'rice',
    desc: '어묵과 양파를 볶아 밥과 먹는 기본 반찬 식사',
    ingredients: { housingCookedRiceBowl: 1, foodFishCake300g: 0.4, foodOnion1kg: 0.08, foodGreenOnion300g: 0.04, foodSoySauce18L: 0.008, foodCookingOil18L: 0.006 }
  },
  {
    key: 'tofuEggPanSet',
    name: '두부계란부침',
    category: 'vegetarian',
    desc: '두부와 계란을 부쳐 간장 양념과 먹는 담백한 식사',
    ingredients: { housingCookedRiceBowl: 1, foodTofu300g: 0.5, foodEgg30Pack: 0.04, foodGreenOnion300g: 0.03, foodSoySauce18L: 0.006, foodCookingOil18L: 0.008 }
  },
  {
    key: 'mushroomTofuRiceBowl',
    name: '버섯두부덮밥',
    category: 'vegetarian',
    desc: '버섯과 두부를 간장 양념으로 볶아 밥에 올리는 채식 덮밥',
    ingredients: { housingCookedRiceBowl: 1.1, foodOysterMushroom300g: 0.25, foodTofu300g: 0.5, foodOnion1kg: 0.06, foodSoySauce18L: 0.01, foodCookingOil18L: 0.008 }
  },
  {
    key: 'shiitakeBeanSproutRice',
    name: '표고 콩나물밥',
    category: 'vegetarian',
    desc: '표고버섯과 콩나물을 곁들인 담백한 밥 한 그릇',
    ingredients: { housingCookedRiceBowl: 1.1, foodShiitakeMushroom200g: 0.35, foodBeanSprouts500g: 0.18, foodGreenOnion300g: 0.03, foodSoySauce18L: 0.008, foodSesameOil320ml: 0.01 }
  },
  {
    key: 'kingOysterMushroomSteakSet',
    name: '새송이버섯 구이',
    category: 'vegetarian',
    desc: '새송이버섯을 두툼하게 구워 밥과 먹는 채식 반찬 식사',
    ingredients: { housingCookedRiceBowl: 1, foodKingOysterMushroom400g: 0.35, foodSoySauce18L: 0.008, foodMincedGarlic500g: 0.01, foodCookingOil18L: 0.008 }
  },
  {
    key: 'mushroomVegetableFriedRice',
    name: '버섯 채소볶음밥',
    category: 'vegetarian',
    desc: '버섯과 양파, 당근을 넣어 볶는 채식 볶음밥',
    ingredients: { housingCookedRiceBowl: 1.2, foodOysterMushroom300g: 0.2, foodCarrot500g: 0.08, foodOnion1kg: 0.08, foodGreenOnion300g: 0.03, foodCookingOil18L: 0.01 }
  },
  {
    key: 'tunaKimchiStew',
    name: '참치김치찌개',
    category: 'soup',
    desc: '참치캔과 김치를 넣어 빠르게 끓이는 숙소 찌개',
    ingredients: { housingCookedRiceBowl: 1, foodKimchi35kg: 0.045, foodTunaCan150g: 0.5, foodTofu300g: 0.25, foodGreenOnion300g: 0.04, foodRedPepperPowder500g: 0.008 }
  },
  {
    key: 'eggDropRiceSoup',
    name: '계란국밥',
    category: 'soup',
    desc: '계란과 대파를 풀어 넣는 가벼운 국밥',
    ingredients: { housingCookedRiceBowl: 1, foodEgg30Pack: 0.04, foodGreenOnion300g: 0.04, foodSalt1kg: 0.0015, foodSoySauce18L: 0.004 }
  },
  {
    key: 'curryUdon',
    name: '카레우동',
    category: 'vegetarian',
    desc: '카레 소스에 우동사리와 채소를 넣어 끓이는 면식',
    ingredients: { foodUdonPack2: 0.5, foodCurry3Pack: 0.34, foodOnion1kg: 0.06, foodPotato1kg: 0.08, foodCarrot500g: 0.08 }
  },
  {
    key: 'mushroomDoenjangStew',
    name: '버섯 된장찌개',
    category: 'vegetarian',
    desc: '버섯과 두부를 넣어 끓이는 구수한 채식 찌개',
    ingredients: { housingCookedRiceBowl: 1, foodOysterMushroom300g: 0.2, foodShiitakeMushroom200g: 0.25, foodSoybeanPaste500g: 0.028, foodTofu300g: 0.25, foodOnion1kg: 0.06 }
  },
  {
    key: 'mushroomCurryRice',
    name: '버섯카레라이스',
    category: 'vegetarian',
    desc: '새송이버섯과 채소를 넣은 고기 없는 카레라이스',
    ingredients: { housingCookedRiceBowl: 1.2, foodKingOysterMushroom400g: 0.25, foodCurry3Pack: 0.34, foodPotato1kg: 0.1, foodCarrot500g: 0.08, foodOnion1kg: 0.08 }
  },
  {
    key: 'mushroomStirFryUdon',
    name: '버섯 볶음우동',
    category: 'vegetarian',
    desc: '버섯과 양배추를 볶아 우동사리와 섞는 채식 면식',
    ingredients: { foodUdonPack2: 0.5, foodKingOysterMushroom400g: 0.2, foodOysterMushroom300g: 0.15, foodCabbageHalf: 0.08, foodSoySauce18L: 0.01, foodCookingOil18L: 0.008 }
  },
  {
    key: 'potatoSoyBraisedSet',
    name: '감자조림',
    category: 'vegetarian',
    desc: '감자를 간장 양념에 졸여 밥과 먹는 기본 채식 반찬 식사',
    ingredients: { housingCookedRiceBowl: 1, foodPotato1kg: 0.16, foodOnion1kg: 0.05, foodSoySauce18L: 0.012, foodSesameOil320ml: 0.008, foodSugar3kg: 0.004 }
  },
  {
    key: 'cabbageTofuStirFrySet',
    name: '양배추 두부볶음',
    category: 'vegetarian',
    desc: '두부와 양배추를 담백하게 볶아 밥과 먹는 채식 요리',
    ingredients: { housingCookedRiceBowl: 1, foodTofu300g: 0.5, foodCabbageHalf: 0.12, foodOnion1kg: 0.05, foodMincedGarlic500g: 0.01, foodSoySauce18L: 0.008, foodCookingOil18L: 0.008 }
  },
  {
    key: 'beanSproutBibimbap',
    name: '콩나물 비빔밥',
    category: 'vegetarian',
    desc: '콩나물과 양념장을 올려 비벼 먹는 가벼운 채식 밥상',
    ingredients: { housingCookedRiceBowl: 1.1, foodBeanSprouts500g: 0.2, foodGreenOnion300g: 0.03, foodSoySauce18L: 0.01, foodSesameOil320ml: 0.012, foodRedPepperPowder500g: 0.004 }
  },
  {
    key: 'kimchiTofuRiceSoup',
    name: '김치두부국밥',
    category: 'vegetarian',
    desc: '김치와 두부를 넣어 끓이는 고기 없는 얼큰한 국밥',
    ingredients: { housingCookedRiceBowl: 1, foodKimchi35kg: 0.045, foodTofu300g: 0.35, foodGreenOnion300g: 0.04, foodMincedGarlic500g: 0.008, foodRedPepperPowder500g: 0.006 }
  },
  {
    key: 'potatoCarrotFriedRice',
    name: '감자채 볶음밥',
    category: 'vegetarian',
    desc: '감자와 당근을 잘게 볶아 밥과 섞는 소박한 채식 볶음밥',
    ingredients: { housingCookedRiceBowl: 1.2, foodPotato1kg: 0.1, foodCarrot500g: 0.08, foodOnion1kg: 0.05, foodGreenOnion300g: 0.03, foodCookingOil18L: 0.01, foodSalt1kg: 0.0015 }
  },
  {
    key: 'mushroomSesameBibimbap',
    name: '버섯 참기름 비빔밥',
    category: 'vegetarian',
    desc: '볶은 버섯과 참기름 양념을 얹어 먹는 향 좋은 채식 비빔밥',
    ingredients: { housingCookedRiceBowl: 1.1, foodShiitakeMushroom200g: 0.25, foodOysterMushroom300g: 0.18, foodGreenOnion300g: 0.03, foodSoySauce18L: 0.01, foodSesameOil320ml: 0.015 }
  },
  {
    key: 'lettuceTomatoSalad',
    name: '양상추 토마토 샐러드',
    category: 'vegetarian',
    desc: '양상추와 방울토마토, 오이를 가볍게 버무린 신선한 샐러드',
    ingredients: { foodLettuce300g: 0.35, foodCherryTomato500g: 0.25, foodCucumber3Pack: 0.34, foodSaladDressing250ml: 0.06 }
  },
  {
    key: 'tofuSaladBowl',
    name: '두부 샐러드',
    category: 'vegetarian',
    desc: '물기를 뺀 두부와 신선 채소를 곁들인 든든한 채식 샐러드',
    ingredients: { foodTofu300g: 0.5, foodLettuce300g: 0.25, foodCucumber3Pack: 0.34, foodCherryTomato500g: 0.18, foodSaladDressing250ml: 0.05 }
  },
  {
    key: 'potatoEggSalad',
    name: '감자 계란 샐러드',
    category: 'vegetarian',
    desc: '삶은 감자와 계란을 마요네즈로 버무린 부드러운 샐러드',
    ingredients: { foodPotato1kg: 0.18, foodEgg30Pack: 0.04, foodCarrot500g: 0.06, foodMayonnaise500g: 0.035 }
  },
  {
    key: 'sweetPotatoSalad',
    name: '고구마 샐러드',
    category: 'vegetarian',
    desc: '찐 고구마를 으깨 우유와 마요네즈로 촉촉하게 만든 샐러드',
    ingredients: { foodSweetPotato1kg: 0.22, foodMilk1L: 0.04, foodMayonnaise500g: 0.025 }
  },
  {
    key: 'cucumberBibimbap',
    name: '오이무침 비빔밥',
    category: 'vegetarian',
    desc: '오이무침과 참기름 양념을 밥에 비벼 먹는 가벼운 채식 한 끼',
    ingredients: { housingCookedRiceBowl: 1.1, foodCucumber3Pack: 0.34, foodRedPepperPowder500g: 0.004, foodSoySauce18L: 0.006, foodSesameOil320ml: 0.01 }
  },
  {
    key: 'tunaMayoToast',
    name: '참치마요 토스트',
    category: 'bread',
    desc: '참치와 마요네즈를 섞어 식빵에 올리는 간단한 아침',
    ingredients: { foodBreadLoaf: 0.12, foodTunaCan150g: 0.5, foodMayonnaise500g: 0.035, foodSlicedCheese20: 0.04, foodCabbageHalf: 0.04 }
  }
]);

export const HOUSING_MEAL_RECIPE_BY_KEY = HOUSING_MEAL_RECIPE_DEFS.reduce((acc, recipe) => {
  acc[recipe.key] = recipe;
  return acc;
}, {});

export const HOUSING_MEAL_PLATE_OPTION_DEFS = Object.freeze({
  rice: [
    {
      key: 'cookedRice',
      name: '지어진밥',
      desc: '밥솥으로 지어둔 기본 밥',
      ingredients: { housingCookedRiceBowl: 1 }
    },
    {
      key: 'eggRice',
      name: '간장 계란밥',
      desc: '밥에 계란과 간장을 더한 간단한 밥',
      ingredients: { housingCookedRiceBowl: 1, foodEgg30Pack: 0.04, foodSoySauce18L: 0.004 }
    },
    {
      key: 'beanSproutRice',
      name: '콩나물밥',
      desc: '콩나물을 올려 먹는 가벼운 밥',
      ingredients: { housingCookedRiceBowl: 1, foodBeanSprouts500g: 0.12, foodSoySauce18L: 0.004 }
    }
  ],
  main: [
    {
      key: 'porkStirFryMain',
      name: '제육볶음',
      desc: '돼지고기와 고추장 양념을 볶은 메인',
      ingredients: { foodPorkFront600g: 0.18, foodRedPepperPaste500g: 0.03, foodRedPepperPowder500g: 0.008, foodMincedGarlic500g: 0.012, foodOnion1kg: 0.08, foodCookingOil18L: 0.008 }
    },
    {
      key: 'doenjangStewMain',
      name: '된장찌개',
      desc: '두부와 채소를 넣은 국물 메인',
      ingredients: { foodSoybeanPaste500g: 0.03, foodTofu300g: 0.25, foodPotato1kg: 0.08, foodOnion1kg: 0.06 }
    },
    {
      key: 'tofuPanMain',
      name: '두부부침',
      desc: '두부를 부쳐 간장 양념과 먹는 담백한 메인',
      ingredients: { foodTofu300g: 0.5, foodSoySauce18L: 0.006, foodCookingOil18L: 0.008 }
    },
    {
      key: 'mushroomGrillMain',
      name: '버섯구이',
      desc: '새송이와 느타리를 구운 채식 메인',
      ingredients: { foodKingOysterMushroom400g: 0.22, foodOysterMushroom300g: 0.12, foodSoySauce18L: 0.006, foodCookingOil18L: 0.008 }
    },
    {
      key: 'tofuSaladMain',
      name: '두부 샐러드',
      desc: '두부와 신선 채소를 곁들인 가벼운 채식 메인',
      ingredients: { foodTofu300g: 0.5, foodLettuce300g: 0.22, foodCherryTomato500g: 0.16, foodCucumber3Pack: 0.25, foodSaladDressing250ml: 0.05 }
    },
    {
      key: 'porkKimchiStewMain',
      name: '돼지고기 김치찌개',
      desc: '김치와 돼지고기, 두부를 넣은 든든한 찌개',
      ingredients: { foodKimchi35kg: 0.05, foodPorkFront600g: 0.16, foodTofu300g: 0.25, foodGreenOnion300g: 0.04 }
    },
    {
      key: 'curryMain',
      name: '카레',
      desc: '감자와 당근, 양파를 넣은 카레 메인',
      ingredients: { foodCurry3Pack: 0.34, foodPotato1kg: 0.1, foodCarrot500g: 0.08, foodOnion1kg: 0.08 }
    }
  ],
  side: [
    {
      key: 'kimchiSide',
      name: '김치',
      desc: '한상 기본 반찬',
      ingredients: { foodKimchi35kg: 0.025 }
    },
    {
      key: 'seaweedSide',
      name: '조미김',
      desc: '밥과 같이 먹는 간단한 반찬',
      ingredients: { foodSeaweed16Pack: 0.06 }
    },
    {
      key: 'beanSproutSide',
      name: '콩나물무침',
      desc: '콩나물과 참기름을 무친 반찬',
      ingredients: { foodBeanSprouts500g: 0.14, foodSesameOil320ml: 0.008, foodSalt1kg: 0.001 }
    },
    {
      key: 'potatoBraisedSide',
      name: '감자조림',
      desc: '감자를 간장 양념에 졸인 반찬',
      ingredients: { foodPotato1kg: 0.12, foodSoySauce18L: 0.008, foodSugar3kg: 0.003 }
    },
    {
      key: 'cabbageStirSide',
      name: '양배추볶음',
      desc: '양배추와 양파를 볶은 채소 반찬',
      ingredients: { foodCabbageHalf: 0.1, foodOnion1kg: 0.04, foodCookingOil18L: 0.006 }
    },
    {
      key: 'mushroomStirSide',
      name: '버섯볶음',
      desc: '느타리버섯을 볶은 반찬',
      ingredients: { foodOysterMushroom300g: 0.14, foodSoySauce18L: 0.006, foodCookingOil18L: 0.006 }
    },
    {
      key: 'cucumberSeasonedSide',
      name: '오이무침',
      desc: '오이를 고춧가루와 참기름에 무친 아삭한 반찬',
      ingredients: { foodCucumber3Pack: 0.34, foodRedPepperPowder500g: 0.003, foodSesameOil320ml: 0.006, foodSalt1kg: 0.001 }
    },
    {
      key: 'tomatoSaladSide',
      name: '방울토마토 샐러드',
      desc: '방울토마토와 양상추를 가볍게 곁들이는 반찬',
      ingredients: { foodCherryTomato500g: 0.18, foodLettuce300g: 0.16, foodSaladDressing250ml: 0.035 }
    },
    {
      key: 'sweetPotatoSaladSide',
      name: '고구마 샐러드',
      desc: '찐 고구마를 부드럽게 으깬 든든한 반찬',
      ingredients: { foodSweetPotato1kg: 0.16, foodMayonnaise500g: 0.018, foodMilk1L: 0.025 }
    }
  ],
  soup: [
    {
      key: 'beanSproutSoup',
      name: '콩나물국',
      desc: '콩나물과 대파를 넣은 가벼운 국',
      ingredients: { foodBeanSprouts500g: 0.16, foodGreenOnion300g: 0.03, foodSalt1kg: 0.0015 }
    },
    {
      key: 'kimchiTofuSoup',
      name: '김치두부국',
      desc: '김치와 두부를 넣은 얼큰한 국',
      ingredients: { foodKimchi35kg: 0.045, foodTofu300g: 0.25, foodGreenOnion300g: 0.03, foodRedPepperPowder500g: 0.004 }
    },
    {
      key: 'doenjangSoup',
      name: '된장국',
      desc: '된장과 두부, 감자를 넣은 기본 국',
      ingredients: { foodSoybeanPaste500g: 0.024, foodTofu300g: 0.18, foodPotato1kg: 0.06, foodOnion1kg: 0.04 }
    },
    {
      key: 'instantSeaweedSoup',
      name: '미역국',
      desc: '즉석 미역국을 데워 곁들이는 국',
      ingredients: { foodInstantSoupSeaweed: 1 }
    }
  ],
  dessert: [
    {
      key: 'appleDessert',
      name: '사과',
      desc: '식후에 먹기 좋은 사과',
      ingredients: { foodApple4Pack: 0.25 }
    },
    {
      key: 'bananaDessert',
      name: '바나나',
      desc: '작업 후 당 보충용 바나나',
      ingredients: { foodBanana1Hand: 0.14 }
    },
    {
      key: 'yogurtDessert',
      name: '요구르트',
      desc: '가볍게 곁들이는 후식 요구르트',
      ingredients: { foodYogurt4Pack: 0.25 }
    },
    {
      key: 'iceCreamDessert',
      name: '아이스크림바',
      desc: '더운 날 식후에 먹는 후식',
      ingredients: { foodIceCreamBar6Pack: 0.17 }
    }
  ]
});

export const HOUSING_MEAL_PLATE_OPTION_BY_KEY = Object.values(HOUSING_MEAL_PLATE_OPTION_DEFS).flat().reduce((acc, option) => {
  acc[option.key] = option;
  return acc;
}, {});

export const housingMealRecipePreparedNameOf = (mealKeyRaw = '') => {
  const mealKey = String(mealKeyRaw || '');
  if (mealKey === HOUSING_PREPARED_MEAL_FALLBACK_KEY) return '한끼식사';
  if (mealKey === 'customMealPlate') return '차린 한상';
  if (HOUSING_MEAL_PREP_BY_KEY[mealKey]) return HOUSING_MEAL_PREP_BY_KEY[mealKey].name;
  return HOUSING_MEAL_RECIPE_BY_KEY[mealKey]?.name || `${FOOD_MART_META_BY_KEY[mealKey]?.name || mealKey} 식사`;
};

const HOUSING_MEAL_RECIPE_PORTION_UNIT_BY_ITEM_KEY = Object.freeze({
  housingCookedRiceBowl: { amount: 1, unit: '공기', name: '지어진밥' },
  foodCupRamen: { amount: 1, unit: '개', name: '컵라면' },
  foodTriangleGimbap: { amount: 1, unit: '개', name: '삼각김밥' },
  foodLunchBox: { amount: 1, unit: '개', name: '도시락' },
  foodKimbapRoll: { amount: 1, unit: '줄', name: '줄김밥' },
  foodHotdog: { amount: 1, unit: '개', name: '핫도그' },
  foodHamburger: { amount: 1, unit: '개', name: '편의점 햄버거' },
  foodRice10kg: { amount: 10000, unit: 'g', name: '쌀' },
  foodKimchi35kg: { amount: 3500, unit: 'g', name: '김치' },
  foodSeaweed16Pack: { amount: 16, unit: '봉', name: '조미김' },
  foodEgg30Pack: { amount: 30, unit: '개', name: '계란' },
  foodSoySauce18L: { amount: 1800, unit: 'mL', name: '진간장' },
  foodSesameOil320ml: { amount: 320, unit: 'mL', name: '참기름' },
  foodPorkFront600g: { amount: 600, unit: 'g', name: '돼지고기' },
  foodTofu300g: { amount: 300, unit: 'g', name: '두부' },
  foodSoybeanPaste500g: { amount: 500, unit: 'g', name: '된장' },
  foodOnion1kg: { amount: 1000, unit: 'g', name: '양파' },
  foodPotato1kg: { amount: 1000, unit: 'g', name: '감자' },
  foodBagRamen5Pack: { amount: 5, unit: '봉', name: '얼큰라면' },
  foodBagRamenSingle: { amount: 1, unit: '봉', name: '얼큰라면' },
  foodRamenSpicySingle: { amount: 1, unit: '봉', name: '매운라면' },
  foodRamenSpicy5Pack: { amount: 5, unit: '봉', name: '매운라면' },
  foodRamenMildSingle: { amount: 1, unit: '봉', name: '순한라면' },
  foodRamenMild5Pack: { amount: 5, unit: '봉', name: '순한라면' },
  foodJjajangRamenSingle: { amount: 1, unit: '봉', name: '짜장라면' },
  foodJjajangRamen4Pack: { amount: 4, unit: '봉', name: '짜장라면' },
  foodCarrot500g: { amount: 500, unit: 'g', name: '당근' },
  foodLettuce300g: { amount: 300, unit: 'g', name: '양상추' },
  foodCucumber3Pack: { amount: 3, unit: '개', name: '오이' },
  foodCherryTomato500g: { amount: 500, unit: 'g', name: '방울토마토' },
  foodSweetPotato1kg: { amount: 1000, unit: 'g', name: '고구마' },
  foodSaladDressing250ml: { amount: 250, unit: 'mL', name: '샐러드 드레싱' },
  foodKingOysterMushroom400g: { amount: 400, unit: 'g', name: '새송이버섯' },
  foodOysterMushroom300g: { amount: 300, unit: 'g', name: '느타리버섯' },
  foodShiitakeMushroom200g: { amount: 200, unit: 'g', name: '표고버섯' },
  foodCookingOil18L: { amount: 1800, unit: 'mL', name: '식용유' },
  foodCurry3Pack: { amount: 3, unit: '인분', name: '카레' },
  foodBreadLoaf: { amount: 10, unit: '장', name: '식빵' },
  foodSausagePack: { amount: 1, unit: '봉', name: '비엔나소시지' },
  foodSlicedCheese20: { amount: 20, unit: '장', name: '슬라이스치즈' },
  foodSpam200g: { amount: 200, unit: 'g', name: '햄' },
  foodFrozenPorkCutlet: { amount: 800, unit: 'g', name: '냉동 돈까스' },
  foodInstantRice210g: { amount: 1, unit: '개', name: '즉석밥' },
  foodInstantRice210g3Pack: { amount: 3, unit: '개', name: '즉석밥' },
  foodInstantRice210g6Pack: { amount: 6, unit: '개', name: '즉석밥' },
  foodInstantSoupSeaweed: { amount: 1, unit: '개', name: '즉석 미역국' },
  foodInstantSoupYukgaejang: { amount: 1, unit: '팩', name: '즉석 육개장' },
  foodTunaCan150g: { amount: 150, unit: 'g', name: '참치' },
  foodBeanSprouts500g: { amount: 500, unit: 'g', name: '콩나물' },
  foodSalt1kg: { amount: 1000, unit: 'g', name: '소금' },
  foodGreenOnion300g: { amount: 300, unit: 'g', name: '대파' },
  foodMincedGarlic500g: { amount: 500, unit: 'g', name: '다진마늘' },
  foodRedPepperPowder500g: { amount: 500, unit: 'g', name: '고춧가루' },
  foodRedPepperPaste500g: { amount: 500, unit: 'g', name: '고추장' },
  foodCabbageHalf: { amount: 1100, unit: 'g', name: '양배추' },
  foodUdonPack2: { amount: 2, unit: '인분', name: '우동사리' },
  foodColdNoodle2Pack: { amount: 2, unit: '인분', name: '냉면' },
  foodFishCake300g: { amount: 300, unit: 'g', name: '어묵' },
  foodJjajangSauce3Pack: { amount: 3, unit: '인분', name: '짜장소스' },
  foodBagel4Pack: { amount: 4, unit: '개', name: '베이글' },
  foodMilk1L: { amount: 1000, unit: 'mL', name: '우유' },
  foodMayonnaise500g: { amount: 500, unit: 'g', name: '마요네즈' },
  foodFrozenDumpling1kg: { amount: 1000, unit: 'g', name: '냉동만두' },
  foodFrozenFriedRice: { amount: 1, unit: '봉', name: '냉동볶음밥' },
  foodFrozenPasta: { amount: 1, unit: '봉', name: '냉동파스타' },
  foodFrozenTteokbokki: { amount: 1, unit: '봉', name: '냉동 떡볶이' },
  foodFrozenUdon: { amount: 1, unit: '봉', name: '냉동 우동' },
  foodFrozenPizza: { amount: 1, unit: '판', name: '냉동피자' },
  foodCreamSoupSingle: { amount: 1, unit: '개', name: '컵스프' },
  foodCreamSoupPack: { amount: 3, unit: '개', name: '컵스프' },
  foodMixCoffee100Pack: { amount: 100, unit: '봉', name: '믹스커피' },
  foodGreenTeaBag50Pack: { amount: 50, unit: '개', name: '녹차 티백' },
  foodRicePorridgeAbalone: { amount: 1, unit: '팩', name: '전복죽' },
  foodRicePorridgeVegetable: { amount: 1, unit: '팩', name: '야채죽' },
  foodCupRiceBeefSoup: { amount: 1, unit: '개', name: '컵국밥' }
});

const formatHousingMealRecipePortionAmount = (amountRaw = 0, unit = '') => {
  const amount = Math.max(0, Number(amountRaw) || 0);
  if (amount <= 0) return `0${unit}`;
  if (['g', 'mL'].includes(unit)) {
    if (amount >= 1000 && amount % 1000 === 0) return `${amount / 1000}${unit === 'g' ? 'kg' : 'L'}`;
    if (amount >= 100) return `${Math.round(amount)}${unit}`;
    return `${Math.round(amount * 10) / 10}${unit}`;
  }
  if (['개', '장', '봉'].includes(unit)) {
    if (amount >= 0.75) return `${Math.max(1, Math.round(amount))}${unit}`;
    return `${Math.max(0.5, Math.round(amount * 2) / 2)}${unit}`;
  }
  if (amount >= 10 || Number.isInteger(amount)) return `${Math.round(amount * 10) / 10}${unit}`;
  return `${Math.round(amount * 10) / 10}${unit}`;
};

const formatHousingMealRecipeSpoonAmount = (amountRaw = 0, spoonMl = 15) => {
  const amount = Math.max(0, Number(amountRaw) || 0);
  const spoon = Math.max(1, Number(spoonMl) || 15);
  const spoonCount = amount / spoon;
  if (spoonCount >= 1) {
    const rounded = Math.round(spoonCount * 10) / 10;
    return `${Number.isInteger(rounded) ? Math.round(rounded) : rounded}큰술`;
  }
  const teaspoonCount = amount / 5;
  if (teaspoonCount >= 0.5) {
    const rounded = Math.round(teaspoonCount * 10) / 10;
    return `${Number.isInteger(rounded) ? Math.round(rounded) : rounded}작은술`;
  }
  return `${Math.round(amount * 10) / 10}mL`;
};

export const housingMealRecipeIngredientDisplayTextOf = (itemKeyRaw = '', qtyRaw = 0) => {
  const itemKey = String(itemKeyRaw || '');
  const qty = Math.max(0, Number(qtyRaw) || 0);
  const portion = HOUSING_MEAL_RECIPE_PORTION_UNIT_BY_ITEM_KEY[itemKey];
  if (portion) {
    if (['foodSoySauce18L', 'foodSesameOil320ml', 'foodCookingOil18L'].includes(itemKey)) {
      return `${portion.name} ${formatHousingMealRecipeSpoonAmount((Number(portion.amount) || 0) * qty)}`;
    }
    if (['foodRedPepperPaste500g', 'foodSoybeanPaste500g', 'foodMayonnaise500g', 'foodSaladDressing250ml'].includes(itemKey)) {
      return `${portion.name} ${formatHousingMealRecipeSpoonAmount((Number(portion.amount) || 0) * qty, 18)}`;
    }
    if (['foodMincedGarlic500g', 'foodRedPepperPowder500g'].includes(itemKey)) {
      return `${portion.name} ${formatHousingMealRecipeSpoonAmount((Number(portion.amount) || 0) * qty, 8)}`;
    }
    if (itemKey === 'foodSalt1kg') {
      const grams = (Number(portion.amount) || 0) * qty;
      if (grams <= 10) return `${portion.name} ${Math.max(0.5, Math.round((grams / 5) * 2) / 2)}작은술`;
    }
    return `${portion.name} ${formatHousingMealRecipePortionAmount((Number(portion.amount) || 0) * qty, portion.unit)}`;
  }
  const meta = FOOD_MART_META_BY_KEY[itemKey] || {};
  const weightKg = Math.max(0, Number(meta?.weightKg) || 0);
  if (weightKg > 0) {
    return `${String(meta?.name || itemKey)} ${formatHousingMealRecipePortionAmount(weightKg * qty * 1000, 'g')}`;
  }
  const requiredQty = Math.round(qty * 100) / 100;
  return `${String(meta?.name || itemKey)} ${requiredQty}${String(meta?.unit || '')}`;
};

export const buildHousingMealRecipeRows = (fridgeStorageRaw = {}) => {
  const storageMap = normalizeHousingFoodStorageByItemKey(fridgeStorageRaw || {});
  return HOUSING_MEAL_RECIPE_DEFS.map((recipe) => {
    const ingredients = Object.entries(recipe.ingredients || {}).map(([itemKey, qtyRaw]) => {
      const requiredQty = Math.max(0, Number(qtyRaw) || 0);
      const availableQty = Math.max(0, Number(storageMap[itemKey]) || 0);
      const meta = FOOD_MART_META_BY_KEY[itemKey] || {};
      return {
        itemKey,
        name: String(meta?.name || itemKey),
        unit: String(meta?.unit || ''),
        requiredQty,
        availableQty,
        displayText: housingMealRecipeIngredientDisplayTextOf(itemKey, requiredQty),
        ok: availableQty + 0.0001 >= requiredQty
      };
    });
    return {
      ...recipe,
      category: String(recipe.category || 'rice'),
      categoryLabel: HOUSING_MEAL_RECIPE_CATEGORY_LABEL_BY_KEY[String(recipe.category || '')] || '기타',
      mealEffect: housingMealEffectOf(recipe.key),
      waterLiters: housingMealWaterLitersOf(recipe),
      ingredients,
      canCook: ingredients.length > 0 && ingredients.every((ingredient) => ingredient.ok)
    };
  });
};

export const buildHousingMealPlateOptionRows = (fridgeStorageRaw = {}) => {
  const storageMap = normalizeHousingFoodStorageByItemKey(fridgeStorageRaw || {});
  const buildRows = (slotKey = '') => (
    (HOUSING_MEAL_PLATE_OPTION_DEFS[slotKey] || []).map((option) => {
      const ingredients = Object.entries(option.ingredients || {}).map(([itemKey, qtyRaw]) => {
        const requiredQty = Math.max(0, Number(qtyRaw) || 0);
        const availableQty = Math.max(0, Number(storageMap[itemKey]) || 0);
        const meta = FOOD_MART_META_BY_KEY[itemKey] || {};
        return {
          itemKey,
          name: String(meta?.name || itemKey),
          unit: String(meta?.unit || ''),
          requiredQty,
          availableQty,
          displayText: housingMealRecipeIngredientDisplayTextOf(itemKey, requiredQty),
          ok: availableQty + 0.0001 >= requiredQty
        };
      });
      return {
        ...option,
        slotKey,
        ingredients,
        canCook: ingredients.length > 0 && ingredients.every((ingredient) => ingredient.ok)
      };
    })
  );
  return {
    rice: buildRows('rice'),
    main: buildRows('main'),
    side: buildRows('side'),
    soup: buildRows('soup'),
    dessert: buildRows('dessert')
  };
};

export const buildHousingMealPrepRows = (fridgeStorageRaw = {}, freezerStorageRaw = {}) => {
  const fridgeStorageMap = normalizeHousingFoodStorageByItemKey(fridgeStorageRaw || {});
  const freezerStorageMap = normalizeHousingFoodStorageByItemKey(freezerStorageRaw || {});
  return HOUSING_MEAL_PREP_DEFS.map((prep) => {
    const ingredients = Object.entries(prep.ingredients || {}).map(([itemKey, qtyRaw]) => {
      const requiredQty = Math.max(0, Number(qtyRaw) || 0);
      const fridgeQty = Math.max(0, Number(fridgeStorageMap[itemKey]) || 0);
      const freezerQty = Math.max(0, Number(freezerStorageMap[itemKey]) || 0);
      const availableQty = fridgeQty + freezerQty;
      const meta = FOOD_MART_META_BY_KEY[itemKey] || {};
      return {
        itemKey,
        name: String(meta?.name || itemKey),
        unit: String(meta?.unit || ''),
        requiredQty,
        availableQty,
        fridgeQty,
        freezerQty,
        displayText: housingMealRecipeIngredientDisplayTextOf(itemKey, requiredQty),
        ok: availableQty + 0.0001 >= requiredQty
      };
    });
    return {
      ...prep,
      type: 'prep',
      mealEffect: housingMealEffectOf(prep.key),
      waterLiters: housingMealWaterLitersOf(prep),
      ingredients,
      canCook: (ingredients.length > 0 || prep.waterOnly) && ingredients.every((ingredient) => ingredient.ok)
    };
  });
};

export const housingMealRecipeIngredientTextOf = (recipe = null) => (
  [
    ...Object.entries(recipe?.ingredients || {}).map(([itemKey, qtyRaw]) => (
      housingMealRecipeIngredientDisplayTextOf(itemKey, qtyRaw)
    )),
    ...(housingMealWaterLitersOf(recipe) > 0 ? [housingWaterDisplayTextOf(housingMealWaterLitersOf(recipe))] : [])
  ].join(', ')
);

export const housingLifeSupplyItemDaysOf = (itemKeyRaw = '') => {
  const itemKey = String(itemKeyRaw || '');
  const explicit = HOUSING_LIFE_SUPPLY_EXPLICIT_DAYS_BY_ITEM_KEY[itemKey];
  if (explicit) return explicit;
  const meta = FOOD_MART_META_BY_KEY[itemKey] || {};
  const subgroup = String(meta?.subgroup || '');
  if (subgroup === 'living') return { foodDays: 0, essentialDays: 0 };
  if (subgroup === 'bulk') return { foodDays: 0.7 };
  if (subgroup === 'fresh') return { foodDays: 0.5 };
  if (subgroup === 'instant') return { foodDays: 0.35 };
  if (subgroup === 'drink') return { foodDays: 0.08 };
  return { foodDays: 0 };
};

export const housingLifeSupplyDailyConsumeQtyOf = (itemKeyRaw = '') => {
  const itemKey = String(itemKeyRaw || '');
  const explicit = Number(HOUSING_LIFE_SUPPLY_DAILY_CONSUME_QTY_BY_ITEM_KEY[itemKey]);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  return 1;
};

export const housingMealCookConsumeQtyOf = (itemKeyRaw = '') => {
  const itemKey = String(itemKeyRaw || '');
  const explicitDailyQty = Number(HOUSING_LIFE_SUPPLY_DAILY_CONSUME_QTY_BY_ITEM_KEY[itemKey]);
  if (Number.isFinite(explicitDailyQty) && explicitDailyQty > 0) {
    return Math.max(0.01, Math.round((explicitDailyQty / 3) * 100) / 100);
  }
  return 1;
};

export const HOUSING_MEAL_LIMIT_BY_PHASE = Object.freeze({ day: 2, night: 1 });
export const HOUSING_DAILY_MEAL_TARGET = HOUSING_MEAL_LIMIT_BY_PHASE.day + HOUSING_MEAL_LIMIT_BY_PHASE.night;
export const HOUSING_MEAL_LABOR_RECOVERY = 15;
export const HOUSING_MEAL_COOLDOWN_MS = 3 * 60 * 1000;

const HOUSING_MEAL_EFFECT_BY_KEY = Object.freeze({
  preparedCupRamen: { health: 0, labor: 8, satisfaction: 1, satisfactionDays: 1 },
  boiledBagRamen: { health: 0, labor: 9, satisfaction: 1, satisfactionDays: 1 },
  boiledSpicyRamen: { health: 0, labor: 10, satisfaction: 1, satisfactionDays: 1 },
  boiledMildRamen: { health: 0, labor: 8, satisfaction: 1, satisfactionDays: 1 },
  boiledJjajangRamen: { health: 0, labor: 9, satisfaction: 1, satisfactionDays: 1 },
  heatedInstantRice: { health: 0.015, labor: 6, satisfaction: 0, satisfactionDays: 0 },
  heatedTriangleGimbap: { health: 0, labor: 7, satisfaction: 1, satisfactionDays: 1 },
  heatedKimbapRoll: { health: 0.025, labor: 9, satisfaction: 1, satisfactionDays: 1 },
  heatedLunchBox: { health: 0.03, labor: 11, satisfaction: 1, satisfactionDays: 1 },
  heatedHotdog: { health: 0, labor: 9, satisfaction: 1, satisfactionDays: 1 },
  heatedHamburger: { health: 0, labor: 11, satisfaction: 1, satisfactionDays: 1 },
  heatedInstantSeaweedSoup: { health: 0.05, labor: 7, satisfaction: 1, satisfactionDays: 2 },
  heatedInstantYukgaejang: { health: 0.03, labor: 10, satisfaction: 1, satisfactionDays: 2 },
  steamedFrozenDumpling: { health: 0, labor: 10, satisfaction: 1, satisfactionDays: 1 },
  heatedFrozenPorkCutlet: { health: 0, labor: 12, satisfaction: 1, satisfactionDays: 1 },
  heatedFrozenPizza: { health: 0, labor: 12, satisfaction: 1, satisfactionDays: 1 },
  boiledColdNoodle: { health: 0.015, labor: 9, satisfaction: 1, satisfactionDays: 1 },
  preparedCreamSoup: { health: 0, labor: 6, satisfaction: 1, satisfactionDays: 1 },
  heatedFrozenFriedRice: { health: 0, labor: 11, satisfaction: 1, satisfactionDays: 1 },
  heatedFrozenPasta: { health: 0, labor: 11, satisfaction: 1, satisfactionDays: 1 },
  heatedFrozenTteokbokki: { health: 0, labor: 10, satisfaction: 1, satisfactionDays: 1 },
  boiledFrozenUdon: { health: 0.02, labor: 10, satisfaction: 1, satisfactionDays: 1 },
  heatedPorridgeAbalone: { health: 0.06, labor: 9, satisfaction: 1, satisfactionDays: 2 },
  heatedPorridgeVegetable: { health: 0.06, labor: 8, satisfaction: 1, satisfactionDays: 2 },
  preparedCupRiceSoup: { health: 0.03, labor: 11, satisfaction: 1, satisfactionDays: 2 },

  eggRiceBreakfast: { health: 0.09, labor: 10, satisfaction: 1, satisfactionDays: 2 },
  bibimbap: { health: 0.15, labor: 12, satisfaction: 2, satisfactionDays: 4 },
  porkKimchiStew: { health: 0.12, labor: 13, satisfaction: 2, satisfactionDays: 3 },
  doenjangStewSet: { health: 0.14, labor: 11, satisfaction: 2, satisfactionDays: 4 },
  ramenWithEgg: { health: 0.025, labor: 11, satisfaction: 1, satisfactionDays: 1 },
  friedRice: { health: 0.12, labor: 11, satisfaction: 1, satisfactionDays: 3 },
  curryRice: { health: 0.11, labor: 12, satisfaction: 1, satisfactionDays: 3 },
  sausageBreadPlate: { health: 0.04, labor: 12, satisfaction: 1, satisfactionDays: 2 },
  spamKimchiFriedRice: { health: 0.03, labor: 13, satisfaction: 1, satisfactionDays: 2 },
  tunaMayoRiceBowl: { health: 0.06, labor: 12, satisfaction: 1, satisfactionDays: 2 },
  beanSproutSoupSet: { health: 0.15, labor: 11, satisfaction: 2, satisfactionDays: 4 },
  porkGochujangStirFry: { health: 0.09, labor: 15, satisfaction: 2, satisfactionDays: 3 },
  tofuKimchiPlate: { health: 0.12, labor: 12, satisfaction: 2, satisfactionDays: 3 },
  fishCakeUdon: { health: 0.05, labor: 11, satisfaction: 1, satisfactionDays: 2 },
  jjajangRice: { health: 0.04, labor: 13, satisfaction: 1, satisfactionDays: 2 },
  cabbageEggToast: { health: 0.1, labor: 10, satisfaction: 1, satisfactionDays: 3 },
  bagelCheeseBreakfast: { health: 0.08, labor: 12, satisfaction: 2, satisfactionDays: 3 },
  dumplingRamenPot: { health: 0.03, labor: 14, satisfaction: 2, satisfactionDays: 2 },
  porkPotatoStew: { health: 0.13, labor: 14, satisfaction: 2, satisfactionDays: 4 },
  porkDoenjangStewSet: { health: 0.14, labor: 14, satisfaction: 2, satisfactionDays: 4 },
  kimchiPorkStirFrySet: { health: 0.09, labor: 15, satisfaction: 2, satisfactionDays: 4 },
  porkCurryRice: { health: 0.09, labor: 15, satisfaction: 2, satisfactionDays: 3 },
  porkCutletRiceSet: { health: 0.05, labor: 15, satisfaction: 2, satisfactionDays: 3 },
  sausageVegStirFrySet: { health: 0.07, labor: 13, satisfaction: 1, satisfactionDays: 3 },
  budaeStewSet: { health: 0.04, labor: 15, satisfaction: 2, satisfactionDays: 3 },
  dumplingRiceSoup: { health: 0.09, labor: 13, satisfaction: 2, satisfactionDays: 3 },
  porkStirFryUdon: { health: 0.07, labor: 14, satisfaction: 1, satisfactionDays: 2 },
  kimchiTunaFriedRice: { health: 0.07, labor: 13, satisfaction: 1, satisfactionDays: 3 },
  spamMayoRiceBowl: { health: 0.025, labor: 14, satisfaction: 1, satisfactionDays: 2 },
  fishCakeStirFrySet: { health: 0.05, labor: 11, satisfaction: 1, satisfactionDays: 2 },
  tofuEggPanSet: { health: 0.14, labor: 11, satisfaction: 2, satisfactionDays: 4 },
  mushroomTofuRiceBowl: { health: 0.16, labor: 12, satisfaction: 2, satisfactionDays: 4 },
  shiitakeBeanSproutRice: { health: 0.17, labor: 11, satisfaction: 2, satisfactionDays: 4 },
  kingOysterMushroomSteakSet: { health: 0.16, labor: 9, satisfaction: 2, satisfactionDays: 4 },
  mushroomVegetableFriedRice: { health: 0.15, labor: 12, satisfaction: 2, satisfactionDays: 4 },
  tunaKimchiStew: { health: 0.11, labor: 13, satisfaction: 2, satisfactionDays: 3 },
  eggDropRiceSoup: { health: 0.12, labor: 11, satisfaction: 1, satisfactionDays: 3 },
  curryUdon: { health: 0.08, labor: 12, satisfaction: 1, satisfactionDays: 2 },
  mushroomDoenjangStew: { health: 0.18, labor: 11, satisfaction: 2, satisfactionDays: 5 },
  mushroomCurryRice: { health: 0.15, labor: 12, satisfaction: 2, satisfactionDays: 4 },
  mushroomStirFryUdon: { health: 0.13, labor: 12, satisfaction: 2, satisfactionDays: 3 },
  potatoSoyBraisedSet: { health: 0.12, labor: 9, satisfaction: 1, satisfactionDays: 3 },
  cabbageTofuStirFrySet: { health: 0.16, labor: 10, satisfaction: 2, satisfactionDays: 4 },
  beanSproutBibimbap: { health: 0.17, labor: 11, satisfaction: 2, satisfactionDays: 4 },
  kimchiTofuRiceSoup: { health: 0.16, labor: 12, satisfaction: 2, satisfactionDays: 4 },
  potatoCarrotFriedRice: { health: 0.11, labor: 11, satisfaction: 1, satisfactionDays: 3 },
  mushroomSesameBibimbap: { health: 0.18, labor: 12, satisfaction: 2, satisfactionDays: 5 },
  lettuceTomatoSalad: { health: 0.2, labor: 7, satisfaction: 2, satisfactionDays: 5 },
  tofuSaladBowl: { health: 0.2, labor: 8, satisfaction: 2, satisfactionDays: 5 },
  potatoEggSalad: { health: 0.15, labor: 10, satisfaction: 2, satisfactionDays: 4 },
  sweetPotatoSalad: { health: 0.16, labor: 9, satisfaction: 2, satisfactionDays: 4 },
  cucumberBibimbap: { health: 0.17, labor: 11, satisfaction: 2, satisfactionDays: 4 },
  tunaMayoToast: { health: 0.06, labor: 11, satisfaction: 1, satisfactionDays: 2 }
});

export const housingMealEffectOf = (mealKeyRaw = '') => {
  const effect = HOUSING_MEAL_EFFECT_BY_KEY[String(mealKeyRaw || '')] || {};
  return {
    health: Math.max(0, Number(effect.health) || 0),
    labor: Math.max(0, Math.min(15, Number(effect.labor) || 0)),
    satisfaction: Math.max(0, Math.floor(Number(effect.satisfaction) || 0)),
    satisfactionDays: Math.max(0, Math.floor(Number(effect.satisfactionDays) || 0))
  };
};

export const housingMealSatisfactionBuffInfoOf = (buffsRaw = [], dayRaw = 1) => {
  const day = Math.max(1, Math.floor(Number(dayRaw) || 1));
  const activeBuffs = (Array.isArray(buffsRaw) ? buffsRaw : [])
    .map((buff) => ({
      value: Math.max(0, Math.floor(Number(buff?.value) || 0)),
      startDay: Math.max(1, Math.floor(Number(buff?.startDay) || day)),
      endDay: Math.max(1, Math.floor(Number(buff?.endDay) || 0)),
      mealKey: String(buff?.mealKey || '')
    }))
    .filter((buff) => buff.value > 0 && buff.endDay >= day);
  const total = Math.min(3, activeBuffs.reduce((sum, buff) => sum + buff.value, 0));
  const maxEndDay = activeBuffs.reduce((max, buff) => Math.max(max, buff.endDay), day);
  return {
    value: total,
    activeBuffs,
    remainingDays: total > 0 ? Math.max(1, maxEndDay - day + 1) : 0,
    detail: total > 0 ? `식사 만족도 +${total} · ${Math.max(1, maxEndDay - day + 1)}일 남음` : ''
  };
};

export const normalizeHousingMealUsage = (raw = {}, dayRaw = 1) => {
  const safeDay = Math.max(1, Math.floor(Number(dayRaw) || 1));
  const storedDay = Math.max(1, Math.floor(Number(raw?.day) || 0));
  if (storedDay !== safeDay) {
    return { day: safeDay, dayCount: 0, nightCount: 0, lastMealAt: 0 };
  }
  return {
    day: safeDay,
    dayCount: Math.max(0, Math.floor(Number(raw?.dayCount) || 0)),
    nightCount: Math.max(0, Math.floor(Number(raw?.nightCount) || 0)),
    lastMealAt: Math.max(0, Math.floor(Number(raw?.lastMealAt) || 0))
  };
};

export const formatHousingLifeSupplyDays = (daysRaw = 0) => {
  const days = Math.max(0, Number(daysRaw) || 0);
  if (days <= 0) return '0일';
  if (days < 1) return '1일 미만';
  if (days < 10) return `${Math.round(days * 10) / 10}일`;
  return `${Math.round(days)}일`;
};

export const housingLifeSupplyInfoOf = (fridgeStorageRaw = {}, preparedMealCountRaw = 0) => {
  const storageMap = normalizeHousingFoodStorageByItemKey(fridgeStorageRaw || {});
  let foodDays = 0;
  let essentialDays = 0;
  let foodItemCount = 0;
  let essentialItemCount = 0;
  Object.entries(storageMap).forEach(([itemKeyRaw, qtyRaw]) => {
    const itemKey = String(itemKeyRaw || '');
    const qty = Math.max(0, Number(qtyRaw) || 0);
    if (!itemKey || qty <= 0 || !FOOD_MART_META_BY_KEY[itemKey]) return;
    const itemDays = housingLifeSupplyItemDaysOf(itemKey);
    const itemFoodDays = Math.max(0, Number(itemDays?.foodDays) || 0) * qty;
    const itemEssentialDays = Math.max(0, Number(itemDays?.essentialDays) || 0) * qty;
    foodDays += itemFoodDays;
    essentialDays += itemEssentialDays;
    if (itemFoodDays > 0) foodItemCount += qty;
    if (itemEssentialDays > 0) essentialItemCount += qty;
  });
  const preparedMealCount = Math.max(0, Math.floor(Number(preparedMealCountRaw) || 0));
  if (preparedMealCount > 0) {
    foodDays += preparedMealCount / HOUSING_DAILY_MEAL_TARGET;
    foodItemCount += preparedMealCount;
  }
  const foodLabel = formatHousingLifeSupplyDays(foodDays);
  const essentialLabel = formatHousingLifeSupplyDays(essentialDays);
  const missingDetailParts = [
    foodDays >= 1 ? '' : (foodDays > 0 ? '식료품 부족' : '식료품 없음'),
    essentialDays >= 1 ? '' : (essentialDays > 0 ? '생필품 부족' : '생필품 없음')
  ].filter(Boolean);
  return {
    foodDays,
    essentialDays,
    foodLabel,
    essentialLabel,
    foodItemCount,
    essentialItemCount,
    hasFood: foodDays > 0,
    hasEssential: essentialDays > 0,
    detail: missingDetailParts.join(' · ')
  };
};

export const housingLifeSupplyScoreBreakdownOf = (lifeSupplyInfo = null) => {
  if (!lifeSupplyInfo) return { foodAdjust: 0, essentialAdjust: 0, total: 0 };
  const foodDays = Math.max(0, Number(lifeSupplyInfo?.foodDays) || 0);
  const essentialDays = Math.max(0, Number(lifeSupplyInfo?.essentialDays) || 0);
  const foodAdjust = foodDays >= 7 ? 8
    : foodDays >= 3 ? 5
      : foodDays >= 1 ? 1
        : foodDays > 0 ? -8
          : -22;
  const essentialAdjust = essentialDays >= 7 ? 5
    : essentialDays >= 3 ? 3
      : essentialDays >= 1 ? 0
        : essentialDays > 0 ? -3
          : -8;
  return {
    foodAdjust,
    essentialAdjust,
    total: foodAdjust + essentialAdjust
  };
};

export const housingLifeSupplyScoreAdjustmentOf = (lifeSupplyInfo = null) => {
  return housingLifeSupplyScoreBreakdownOf(lifeSupplyInfo).total;
};

const createDeterministicRandom = (seed) => {
  let value = Number(seed) || 1;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const deterministicSeedOf = (sourceRaw = '') => {
  const source = String(sourceRaw || '');
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const consumeHousingDailyLifeSupplyForField = ({
  field,
  day,
  fieldIndex = 0,
  itemMetaByKey = {},
  itemCategoryByKey = {}
} = {}) => {
  const foodStorageByFacilityKey = field?.housingFoodStorageByFacilityKey || {};
  if (!foodStorageByFacilityKey || typeof foodStorageByFacilityKey !== 'object') return { field, logs: [] };
  const nextFoodStorageByFacilityKey = { ...foodStorageByFacilityKey };
  let nextFoodStorageBatchesByFacilityKey = normalizeHousingFoodStorageBatchesByFacilityKey(field?.housingFoodStorageBatchesByFacilityKey || {});
  const logs = [];
  let changed = false;
  Object.entries(foodStorageByFacilityKey).forEach(([facilityKeyRaw, inventoryRaw]) => {
    const facilityKey = String(facilityKeyRaw || '');
    const inventory = normalizeHousingFoodStorageByItemKey(inventoryRaw || {});
    const candidates = Object.entries(inventory)
      .map(([itemKeyRaw, qtyRaw]) => {
        const itemKey = String(itemKeyRaw || '');
        const qty = Math.max(0, Number(qtyRaw) || 0);
        if (!itemKey || qty <= 0) return null;
        if (String(itemCategoryByKey?.[itemKey] || '') !== 'foodMart') return null;
        if (String(itemMetaByKey?.[itemKey]?.subgroup || FOOD_MART_META_BY_KEY?.[itemKey]?.subgroup || '') === 'living') return null;
        const itemDays = housingLifeSupplyItemDaysOf(itemKey);
        const hasEssentialValue = (Number(itemDays?.essentialDays) || 0) > 0;
        if (!hasEssentialValue) return null;
        return { itemKey, qty };
      })
      .filter(Boolean);
    if (!facilityKey || !candidates.length) return;
    const random = createDeterministicRandom(deterministicSeedOf(`${day}:${field?.id || fieldIndex}:${facilityKey}:life-supply`));
    const picked = candidates[Math.floor(random() * candidates.length)] || candidates[0];
    if (!picked) return;
    const consumeQty = Math.min(picked.qty, housingLifeSupplyDailyConsumeQtyOf(picked.itemKey));
    if (consumeQty <= 0) return;
    const nextInventory = { ...inventory };
    const remainingQty = Math.max(0, (Number(nextInventory[picked.itemKey]) || 0) - consumeQty);
    if (remainingQty > 0.0001) nextInventory[picked.itemKey] = Math.round(remainingQty * 100) / 100;
    else delete nextInventory[picked.itemKey];
    nextFoodStorageBatchesByFacilityKey = consumeHousingFoodStorageBatches({
      batchesByFacilityKey: nextFoodStorageBatchesByFacilityKey,
      facilityKey,
      itemKey: picked.itemKey,
      qty: consumeQty
    }).batchesByFacilityKey;
    if (Object.keys(nextInventory).length > 0) nextFoodStorageByFacilityKey[facilityKey] = nextInventory;
    else delete nextFoodStorageByFacilityKey[facilityKey];
    changed = true;
    const itemMeta = itemMetaByKey?.[picked.itemKey] || {};
    const itemName = String(itemMeta?.name || picked.itemKey);
    const unit = String(itemMeta?.unit || '');
    const amountText = consumeQty >= 1
      ? `${Math.round(consumeQty * 100) / 100}${unit}`
      : `${Math.round(consumeQty * 100)}%`;
    logs.push(`${field?.name || '필지'} ${facilityKey} 냉장실 생필품 소비: ${itemName} ${amountText}`);
  });
  if (!changed) return { field, logs };
  return {
    field: {
      ...field,
      housingFoodStorageByFacilityKey: nextFoodStorageByFacilityKey,
      housingFoodStorageBatchesByFacilityKey: nextFoodStorageBatchesByFacilityKey
    },
    logs
  };
};

export const consumeHousingPreparedMealsForField = ({
  field,
  facilityKey = '',
  mealCount = 0,
  itemMetaByKey = {}
} = {}) => {
  const targetFacilityKey = String(facilityKey || '');
  const targetMealCount = Math.max(0, Math.floor(Number(mealCount) || 0));
  if (!field || !targetFacilityKey || targetMealCount <= 0) {
    return { field, consumed: 0, shortage: targetMealCount, logs: [] };
  }
  const preparedMap = normalizeHousingPreparedMealStockByFacilityKey({
    ...(field?.housingPreparedMealStockByFacilityKey || {}),
    ...Object.entries(normalizeHousingPreparedMealCountByFacilityKey(field?.housingPreparedMealCountByFacilityKey || {})).reduce((acc, [legacyFacilityKey, count]) => {
      if (!field?.housingPreparedMealStockByFacilityKey?.[legacyFacilityKey] && count > 0) {
        acc[legacyFacilityKey] = { [HOUSING_PREPARED_MEAL_FALLBACK_KEY]: count };
      }
      return acc;
    }, {})
  });
  const facilityStock = preparedMap[targetFacilityKey] || {};
  const available = housingPreparedMealCountOfStock(facilityStock);
  const consumed = Math.min(available, targetMealCount);
  const shortage = Math.max(0, targetMealCount - consumed);
  if (consumed <= 0) {
    return {
      field,
      consumed: 0,
      shortage,
      logs: shortage > 0 ? [`${field?.name || '필지'} ${targetFacilityKey} 한끼식사 부족: ${shortage}끼 부족`] : []
    };
  }
  const nextPreparedMap = { ...preparedMap };
  const nextFacilityStock = { ...facilityStock };
  let remainingToConsume = consumed;
  const consumedLabels = [];
  Object.entries(nextFacilityStock).forEach(([mealKey, countRaw]) => {
    if (remainingToConsume <= 0) return;
    const count = Math.max(0, Math.floor(Number(countRaw) || 0));
    const useCount = Math.min(count, remainingToConsume);
    if (useCount <= 0) return;
    const nextCount = count - useCount;
    if (nextCount > 0) nextFacilityStock[mealKey] = nextCount;
    else delete nextFacilityStock[mealKey];
    remainingToConsume -= useCount;
    const mealLabel = housingMealRecipePreparedNameOf(mealKey);
    consumedLabels.push(`${mealLabel} ${useCount}개`);
  });
  if (Object.keys(nextFacilityStock).length > 0) nextPreparedMap[targetFacilityKey] = nextFacilityStock;
  else delete nextPreparedMap[targetFacilityKey];
  return {
    field: {
      ...field,
      housingPreparedMealStockByFacilityKey: nextPreparedMap,
      housingPreparedMealCountByFacilityKey: {}
    },
    consumed,
    shortage,
    logs: [
      `${field?.name || '필지'} ${targetFacilityKey} 하루 식사 자동 소비: ${consumedLabels.join(', ') || `한끼식사 ${consumed}개`}${shortage > 0 ? ` · ${shortage}끼 부족` : ''}`
    ]
  };
};

export const housingSleepQualityScoreAdjustmentOf = (sleepQualityInfo = null) => {
  const sleepScore = Math.max(0, Math.min(100, Number(sleepQualityInfo?.score) || 0));
  if (sleepScore >= 90) return 10;
  if (sleepScore >= 75) return 5;
  if (sleepScore >= 55) return 0;
  if (sleepScore >= 35) return -10;
  return -20;
};

export const housingLivingConditionInfoOf = ({
  sleepQualityInfo = null,
  powerInfo = null,
  indoorInfo = null,
  lifeSupplyInfo = null,
  facilityQualityInfo = null,
  internetInfo = null,
  satisfactionBuffInfo = null
} = {}) => {
  const powerPenalty = powerInfo?.tone === 'off' ? 18 : 0;
  const powerAdjust = -powerPenalty;
  const indoorBreakdown = indoorInfo?.livingScoreBreakdown || housingIndoorLivingScoreBreakdownOf(indoorInfo);
  const hvacAdjust = Number(indoorBreakdown.total) || 0;
  const facilityAdjust = Math.max(30, Math.round(Number(facilityQualityInfo?.adjust) || 0));
  const lifeSupplyBreakdown = housingLifeSupplyScoreBreakdownOf(lifeSupplyInfo);
  const lifeSupplyAdjust = lifeSupplyBreakdown.total;
  const hasInternet = Boolean(internetInfo?.installed);
  const internetPending = Boolean(internetInfo?.pending);
  const internetAdjust = hasInternet
    ? (powerInfo?.tone === 'off' ? 0 : 4)
    : (internetPending ? 0 : -4);
  const satisfactionAdjust = Math.max(0, Math.min(3, Math.floor(Number(satisfactionBuffInfo?.value) || 0)));
  const baseScore = 0;
  const nextScore = clamp(Math.round(baseScore + facilityAdjust + powerAdjust + hvacAdjust + lifeSupplyAdjust + internetAdjust + satisfactionAdjust), 0, 100);
  const nextLabel = nextScore >= 95 ? '최상'
    : nextScore >= 88 ? '매우 좋음'
      : nextScore >= 80 ? '좋음'
        : nextScore >= 70 ? '양호'
          : nextScore >= 60 ? '보통'
            : nextScore >= 50 ? '불안정'
              : nextScore >= 40 ? '주의'
                : nextScore >= 30 ? '나쁨'
                  : nextScore >= 15 ? '매우 나쁨'
                    : '열악';
  const supplyDetail = lifeSupplyInfo?.detail || '';
  const nextDetail = powerInfo?.tone === 'off'
    ? (supplyDetail ? `${supplyDetail} · 실내 전기 확인` : '실내 전기 확인 필요')
    : (satisfactionBuffInfo?.detail || supplyDetail || (indoorInfo?.activeHvacMode && indoorInfo.activeHvacMode !== 'off'
        ? `${indoorInfo.activeHvacLabel} 반영`
        : '냉장실/실내 전기/실내상태 확인'));
  const nextTone = nextScore >= 80 ? 'good'
    : nextScore >= 60 ? 'normal'
      : nextScore >= 40 ? 'warn'
        : 'bad';
  return {
    score: nextScore,
    label: nextLabel,
    detail: nextDetail,
    tone: nextTone,
    lifeSupplyInfo,
    facilityQualityInfo,
    internetInfo,
    indoorBreakdown,
    scoreFactors: {
      base: baseScore,
      housing: facilityAdjust,
      food: lifeSupplyBreakdown.foodAdjust,
      essential: lifeSupplyBreakdown.essentialAdjust,
      satisfaction: satisfactionAdjust,
      power: powerAdjust,
      internet: internetAdjust,
      hvac: hvacAdjust,
      total: facilityAdjust + powerAdjust + hvacAdjust + lifeSupplyAdjust + internetAdjust + satisfactionAdjust
    }
  };
};
