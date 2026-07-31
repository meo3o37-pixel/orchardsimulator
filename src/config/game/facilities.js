export const FACILITY_TABS = [
  ['land', '토지시설'],
  ['general', '일반시설'],
  ['work', '작업시설'],
  ['support', '지원시설']
];

export const FACILITIES_BY_TAB = {
  land: [
    { key: 'wellFacility', name: '관정', price: 5000000, desc: '지하수 취수 기반 물 사용 시설 (관수 작업 필수)' },
    { key: 'farmPowerElectric', name: '한전 농사용전기', price: 6500000, desc: '관정 양수 및 전기 기반 시설 가동에 필요한 전력 인입 설비' },
    { key: 'peTankSmall', name: 'PE물탱크 소형 (1톤)', price: 500000, desc: '1,000L 저장 용량' },
    { key: 'peTankMedium', name: 'PE물탱크 중형 (3톤)', price: 900000, desc: '3,000L 저장 용량' },
    { key: 'peTankLarge', name: 'PE물탱크 대형 (5톤)', price: 1800000, desc: '5,000L 저장 용량' },
    { key: 'peTankXl', name: 'PE물탱크 초대형 (10톤)', price: 2900000, desc: '10,000L 저장 용량' },
    { key: 'peTankXxl', name: 'PE물탱크 특대형 (20톤)', price: 4800000, desc: '20,000L 저장 용량' },
    { key: 'dripIrrigation', name: '점적관수', unitPricePerTree: 8000, perTree: true, desc: '주당 하루 최대 40L. 물손실이 적어 효율이 높은 정밀 관수 (손실 약 8%)' },
    { key: 'sprinklerIrrigation', name: '스프링쿨러 관수', unitPricePerTree: 12500, perTree: true, desc: '주당 하루 최대 100L. 살수 범위는 넓지만 물손실이 커 효율이 낮은 관수 (손실 약 35%)' }
  ],
  general: [
    { key: 'panelWarehouse3', name: '판넬창고 3평', price: 2400000, desc: '소규모 농자재 보관용 판넬창고' },
    { key: 'panelWarehouse5', name: '판넬창고 5평', price: 3600000, desc: '중소형 자재·소모품 보관용 판넬창고' },
    { key: 'panelWarehouse8', name: '판넬창고 8평', price: 5400000, desc: '자재·포장재 분리 보관 가능한 판넬창고' }
  ],
  work: [
    { key: 'appleSortingLineSmall', name: '사과선별기 소형', price: 8900000, desc: '소규모 출하용 1~2구간 반자동 사과 선별 설비', weightKg: 850, minWorkers: 1, recommendedWorkers: 4 },
    { key: 'appleSortingLineMedium', name: '사과선별기 중형', price: 14900000, desc: '중간 규모 농장용 다구간 반자동 사과 선별 설비', weightKg: 1600, minWorkers: 2, recommendedWorkers: 5 },
    { key: 'appleSortingLineLarge', name: '사과선별기 대형', price: 23300000, desc: '출하 물량이 많은 농장용 고용량 사과 선별 설비', weightKg: 2800, minWorkers: 3, recommendedWorkers: 6 }
  ],
  support: [
    { key: 'evChargerStation', name: 'EV 충전소', price: 4200000, desc: '전기 농기계·차량 수동 충전 시설 (전력 ON 필요)' },
    { key: 'portableToilet', name: '간이 화장실', price: 1200000, desc: '전기·급수 없이 설치 가능한 임시 화장실 · 단기 작업 인원 대응' },
    { key: 'outdoorToilet', name: '야외 화장실', price: 4800000, desc: '정화조/배수 기반의 고정식 야외 화장실 · 상시 현장 체류 대응' },
    { key: 'workerRestroom', name: '작업자 화장실', price: 12000000, desc: '세면대와 남녀 분리 공간을 갖춘 작업자용 화장실' },
    { key: 'hygieneShowerUnit', name: '샤워실 포함 위생동', price: 28000000, desc: '샤워실·세면장·탈의 공간을 갖춘 농약 작업 후 세척용 위생동' }
  ]
};

export const FACILITIES = Object.values(FACILITIES_BY_TAB).flat();
export const TANK_FACILITY_KEYS = ['peTankSmall', 'peTankMedium', 'peTankLarge', 'peTankXl', 'peTankXxl'];
export const SINGLE_PER_LAND_FACILITY_KEYS = ['wellFacility', 'farmPowerElectric'];
export const SANITATION_FACILITY_KEYS = ['portableToilet', 'outdoorToilet', 'workerRestroom', 'hygieneShowerUnit'];
export const TANK_CAPACITY_LITERS = {
  peTankSmall: 1000,
  peTankMedium: 3000,
  peTankLarge: 5000,
  peTankXl: 10000,
  peTankXxl: 20000
};
export const IRRIGATION_FACILITY_KEYS = ['dripIrrigation', 'sprinklerIrrigation'];
export const FACILITY_OCCUPY_PY = {
  wellFacility: 1,
  evChargerStation: 1,
  portableToilet: 1,
  outdoorToilet: 2,
  workerRestroom: 6,
  hygieneShowerUnit: 12,
  peTankSmall: 1,
  peTankMedium: 2,
  peTankLarge: 3,
  peTankXl: 4,
  peTankXxl: 6,
  panelWarehouse3: 3,
  panelWarehouse5: 5,
  panelWarehouse8: 8,
  appleSortingLineSmall: 0,
  appleSortingLineMedium: 0,
  appleSortingLineLarge: 0
};
export const STORAGE_CAPACITY_KG_BY_FACILITY = {
  panelWarehouse3: 600,
  panelWarehouse5: 1000,
  panelWarehouse8: 1800,
  goodsWarehouseSmall: 5000,
  goodsWarehouseMedium: 10000,
  goodsWarehouseLarge: 18000,
  goodsWarehouseXl: 26000,
  coldStorageMedium: 12000,
  coldStorageLarge: 24000,
  coldStorageXl: 36000,
  coldStorageXxl: 48000,
  coldStorageMax: 60000,
  machineShedSmall: 500,
  machineShedSmallPlus: 800,
  machineShedMedium: 1200,
  machineShedMediumPlus: 1600,
  machineShedLarge: 2200,
  machineShedLargePlus: 3000,
  machineShedXl: 3800,
  farmHut6Basic: 180,
  farmHut6Insulated: 220,
  farmContainer20Used: 320,
  farmContainer40Office: 420,
  panelHouse9: 260,
  lightWood12: 300,
  modular15Value: 380,
  mobileHome13: 320,
  steelOfficeLounge: 400,
  dualContainerLinked: 460,
  modular25Standard: 520,
  woodHouse30: 600,
  smartFarmResidence: 500,
  premiumCountry35: 700,
  hanokHybrid28: 560,
  passiveHouse30: 620,
  villaFarm40: 800,
  estateFarm55: 1000
};
export const COLD_STORAGE_DAILY_POWER_COST_BY_FACILITY = {
  panelWarehouse8: 10000,
  coldStorageMedium: 18000,
  coldStorageLarge: 30000,
  coldStorageXl: 45000,
  coldStorageXxl: 45000,
  coldStorageMax: 45000
};
export const WATER_PUMP_UNIT_LITER = 1000;
export const WATER_PUMP_POWER_FEE_PER_1000L = 100;
export const IRRIGATION_MIN_L_PER_TREE = 0;
export const IRRIGATION_MAX_L_PER_TREE = 40;
export const IRRIGATION_MAX_DAYS = 30;
export const IRRIGATION_WATER_GAIN_MAX_PER_DAY = 1.8;
export const IRRIGATION_RESPONSE_CURVE = 0.9;
export const IRRIGATION_FACILITY_EFFICIENCY = {
  dripIrrigation: 0.92,
  sprinklerIrrigation: 0.74
};
