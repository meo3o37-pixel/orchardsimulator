import { FACILITIES, FACILITIES_BY_TAB } from './facilityCatalog.js';

export const HOUSING_FACILITY_KEYS = (FACILITIES_BY_TAB.housing || []).map((x) => x.key);

const FACILITY_BASE_PRICE_BY_KEY = FACILITIES.reduce((acc, facility) => ({
  ...acc,
  [facility.key]: Number(facility?.price) || 0
}), {});

const housingOptionPrice = (facilityKey, rate, min = 0) =>
  Math.max(min, Math.round(((FACILITY_BASE_PRICE_BY_KEY[facilityKey] || 0) * rate) / 10000) * 10000);

const buildHousingOptions = (facilityKey, specs = []) =>
  specs.map((spec) => ({
    ...spec,
    key: spec.key,
    name: spec.name,
    price: Number.isFinite(Number(spec.price))
      ? Math.max(0, Math.round(Number(spec.price)))
      : housingOptionPrice(facilityKey, spec.rate, spec.min || 0),
    desc: spec.desc
  }));

const HOUSING_OPTION_PRESETS = {
  hut: [
    { key: 'insulationPack', name: '단열 패키지', rate: 0.07, min: 500000, desc: '벽체/창호 단열 강화' }
  ],
  container: [
    { key: 'highCubeRoof', name: '하이큐브 단열천장', rate: 0.08, min: 900000, desc: '고온/결로 대응형 천장' },
    { key: 'windowUpgrade', name: '창호 업그레이드', rate: 0.06, min: 700000, desc: '로이창호/방충망 포함' }
  ],
  house: [
    { key: 'doubleWindow', name: '고단열 창호', rate: 0.06, min: 1200000, desc: '기밀 성능 강화' },
    { key: 'floorHeating', name: '바닥난방 확장', rate: 0.08, min: 1800000, desc: '동절기 난방 효율 개선' }
  ],
  modular: [
    { key: 'heatRecovery', name: '열회수 환기', rate: 0.08, min: 2500000, desc: '실내 공기질/에너지 향상' },
    { key: 'rooftopCanopy', name: '지붕 캐노피', rate: 0.07, min: 1800000, desc: '우천 작업 동선 확보' }
  ],
  premium: [
    { key: 'tripleWindow', name: '삼중창 패키지', rate: 0.07, min: 4200000, desc: '고급 단열/차음 성능' },
    { key: 'hvacPremium', name: '프리미엄 냉난방', rate: 0.09, min: 5600000, desc: '대공간 인버터 시스템' }
  ]
};

export const HOUSING_OPTIONS_BY_FACILITY = {
  panelWarehouse3: [
    { key: 'coldCoolingUnit', name: '저온냉방기 추가', price: 7200000, desc: '판넬창고 내부 저온 유지 설비 추가로 저온 저장고처럼 운용', enablesColdStorage: true }
  ],
  panelWarehouse5: [
    { key: 'coldCoolingUnit', name: '저온냉방기 추가', price: 7200000, desc: '판넬창고 내부 저온 유지 설비 추가로 저온 저장고처럼 운용', enablesColdStorage: true }
  ],
  panelWarehouse8: [
    { key: 'machineParkingBay', name: '농기계 보관소 1칸 추가', price: 3600000, desc: '측면 개방형 보관칸 증설로 탑승형 농기계 1대 추가 주차', rideMachineCapacityBonus: 1 },
    { key: 'coldCoolingUnit', name: '저온냉방기 추가', price: 7200000, desc: '판넬창고 내부 저온 유지 설비 추가로 저온 저장고처럼 운용', enablesColdStorage: true }
  ],
  goodsWarehouseSmall: [
    { key: 'machineParkingBay2', name: '농기계 보관소 2칸 추가', price: 6800000, desc: '건창고 측면 보관칸 확장으로 탑승형 농기계 2대 추가 주차', rideMachineCapacityBonus: 2, optionGroup: 'machineParkingBayExpansion' },
    { key: 'machineParkingBay4', name: '농기계 보관소 4칸 추가', price: 12800000, desc: '건창고 측면 차양 보관칸 확장으로 탑승형 농기계 4대 추가 주차', rideMachineCapacityBonus: 4, optionGroup: 'machineParkingBayExpansion' }
  ],
  goodsWarehouseMedium: [
    { key: 'machineParkingBay2', name: '농기계 보관소 2칸 추가', price: 6800000, desc: '건창고 측면 보관칸 확장으로 탑승형 농기계 2대 추가 주차', rideMachineCapacityBonus: 2, optionGroup: 'machineParkingBayExpansion' },
    { key: 'machineParkingBay4', name: '농기계 보관소 4칸 추가', price: 12800000, desc: '건창고 측면 차양 보관칸 확장으로 탑승형 농기계 4대 추가 주차', rideMachineCapacityBonus: 4, optionGroup: 'machineParkingBayExpansion' }
  ],
  goodsWarehouseLarge: [
    { key: 'machineParkingBay2', name: '농기계 보관소 2칸 추가', price: 6800000, desc: '건창고 측면 보관칸 확장으로 탑승형 농기계 2대 추가 주차', rideMachineCapacityBonus: 2, optionGroup: 'machineParkingBayExpansion' },
    { key: 'machineParkingBay4', name: '농기계 보관소 4칸 추가', price: 12800000, desc: '건창고 측면 차양 보관칸 확장으로 탑승형 농기계 4대 추가 주차', rideMachineCapacityBonus: 4, optionGroup: 'machineParkingBayExpansion' }
  ],
  goodsWarehouseXl: [
    { key: 'machineParkingBay2', name: '농기계 보관소 2칸 추가', price: 6800000, desc: '건창고 측면 보관칸 확장으로 탑승형 농기계 2대 추가 주차', rideMachineCapacityBonus: 2, optionGroup: 'machineParkingBayExpansion' },
    { key: 'machineParkingBay4', name: '농기계 보관소 4칸 추가', price: 12800000, desc: '건창고 측면 차양 보관칸 확장으로 탑승형 농기계 4대 추가 주차', rideMachineCapacityBonus: 4, optionGroup: 'machineParkingBayExpansion' }
  ],
  farmHut6Basic: buildHousingOptions('farmHut6Basic', HOUSING_OPTION_PRESETS.hut),
  farmHut6Insulated: buildHousingOptions('farmHut6Insulated', HOUSING_OPTION_PRESETS.hut),
  farmContainer20Used: buildHousingOptions('farmContainer20Used', HOUSING_OPTION_PRESETS.container),
  sandwichPanelDorm4: buildHousingOptions('sandwichPanelDorm4', HOUSING_OPTION_PRESETS.hut),
  usedSiteOffice5: buildHousingOptions('usedSiteOffice5', HOUSING_OPTION_PRESETS.container),
  farmContainer40Office: buildHousingOptions('farmContainer40Office', HOUSING_OPTION_PRESETS.container),
  panelHouse9: buildHousingOptions('panelHouse9', HOUSING_OPTION_PRESETS.house),
  lightWood12: buildHousingOptions('lightWood12', HOUSING_OPTION_PRESETS.house),
  modular15Value: buildHousingOptions('modular15Value', HOUSING_OPTION_PRESETS.modular),
  mobileHome13: buildHousingOptions('mobileHome13', HOUSING_OPTION_PRESETS.modular),
  steelOfficeLounge: buildHousingOptions('steelOfficeLounge', HOUSING_OPTION_PRESETS.house),
  dualContainerLinked: buildHousingOptions('dualContainerLinked', HOUSING_OPTION_PRESETS.container),
  modular25Standard: buildHousingOptions('modular25Standard', HOUSING_OPTION_PRESETS.modular),
  woodHouse30: buildHousingOptions('woodHouse30', HOUSING_OPTION_PRESETS.premium),
  smartFarmResidence: buildHousingOptions('smartFarmResidence', HOUSING_OPTION_PRESETS.modular),
  premiumCountry35: buildHousingOptions('premiumCountry35', HOUSING_OPTION_PRESETS.premium),
  hanokHybrid28: buildHousingOptions('hanokHybrid28', HOUSING_OPTION_PRESETS.premium),
  passiveHouse30: buildHousingOptions('passiveHouse30', [...HOUSING_OPTION_PRESETS.premium, { key: 'solarStorage', name: '태양광+ESS', rate: 0.12, min: 14000000, desc: '자립 에너지 확장' }]),
  villaFarm40: buildHousingOptions('villaFarm40', HOUSING_OPTION_PRESETS.premium),
  estateFarm55: buildHousingOptions('estateFarm55', HOUSING_OPTION_PRESETS.premium)
};

export const HOUSING_OPTION_MAP_BY_FACILITY = Object.entries(HOUSING_OPTIONS_BY_FACILITY).reduce((acc, [facilityKey, options]) => ({
  ...acc,
  [facilityKey]: (options || []).reduce((mapAcc, option) => ({ ...mapAcc, [option.key]: option }), {})
}), {});

export const HOUSING_OPTION_KEYS_BY_FACILITY = Object.entries(HOUSING_OPTIONS_BY_FACILITY).reduce((acc, [facilityKey, options]) => ({
  ...acc,
  [facilityKey]: (options || []).map((option) => option.key)
}), {});
