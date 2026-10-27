export const FACILITY_TABS = [
  ['land', '토지시설'],
  ['general', '일반시설'],
  ['work', '작업시설'],
  ['support', '지원시설'],
  ['housing', '하우징'],
];

export const FACILITIES_BY_TAB = {
  land: [
    { key: 'wellFacility', name: '관정', price: 5000000, desc: '지하수 취수 기반 물 사용 시설 (관수 작업 필수)' },
    { key: 'farmPowerElectric', name: '한전 농사용전기', price: 6500000, desc: '관정 양수 및 전기 기반 시설 가동에 필요한 전력 인입 설비' },
    { key: 'autoRefillSystem', name: '자동급수시스템', price: 210000, desc: '물탱크 수위가 목표(95%) 미만일 때 자동으로 급수' },
    { key: 'irrigationControlSystem', name: '관수 제어시스템', price: 980000, desc: '제어판 관수패널 활성화 및 관수량 설정 가능' },
    { key: 'frostFan', name: '방상팬', price: 4800000, desc: '저온 피해 완화용 송풍 시설 · 500평당 1대' },
    { key: 'peTankSmall', name: 'PE물탱크 소형 (1톤)', price: 500000, desc: '1,000L 저장 용량' },
    { key: 'peTankMedium', name: 'PE물탱크 중형 (3톤)', price: 900000, desc: '3,000L 저장 용량' },
    { key: 'peTankLarge', name: 'PE물탱크 대형 (5톤)', price: 1800000, desc: '5,000L 저장 용량' },
    { key: 'peTankXl', name: 'PE물탱크 초대형 (10톤)', price: 2900000, desc: '10,000L 저장 용량' },
    { key: 'peTankXxl', name: 'PE물탱크 특대형 (20톤)', price: 4800000, desc: '20,000L 저장 용량' },
    { key: 'dripIrrigation', name: '점적관수', unitPricePerTree: 8000, perTree: true, manualInstallOnly: true, desc: '직접 시공형 관수시설 (작업탭에서 점적노즐 설치)' },
    { key: 'sprinklerIrrigation', name: '스프링클러 관수', unitPricePerTree: 12500, perTree: true, manualInstallOnly: true, desc: '직접 시공형 관수시설 (작업탭에서 스프링클러 노즐 설치)' }
  ],
  general: [
    { key: 'openStorage3000Py', name: '노지 야적창고', price: 0, baseProvided: true, desc: '노지 시설 설계에서 적재면·통로·위치를 직접 정합니다. 완공 후 설계 면적에 맞는 저장 용량이 적용됩니다.' },
    { key: 'panelWarehouse3', name: '판넬창고 3평', price: 2400000, desc: '소규모 농자재 보관용 판넬창고' },
    { key: 'panelWarehouse5', name: '판넬창고 5평', price: 3600000, desc: '중소형 자재·소모품 보관용 판넬창고' },
    { key: 'panelWarehouse8', name: '판넬창고 8평', price: 5400000, desc: '자재·포장재 분리 보관 가능한 판넬창고' },
    { key: 'goodsWarehouseSmall', name: '건창고 소형 (10평)', price: 9500000, desc: '농자재/포장재 보관용 건식 창고' },
    { key: 'goodsWarehouseMedium', name: '건창고 중형 (20평)', price: 16500000, desc: '자재·완제품 분리 보관 가능한 중형 건창고' },
    { key: 'goodsWarehouseLarge', name: '건창고 대형 (35평)', price: 27800000, desc: '대량 자재/수확물 임시 보관용 대형 건창고' },
    { key: 'goodsWarehouseXl', name: '건창고 특대형 (50평)', price: 39200000, desc: '포장·출하 동선 연계 가능한 특대 건창고' },
    { key: 'coldStorageMedium', name: '저온저장고 소형 (10평)', price: 73000000, desc: '출하 전 중기 저장용 표준 저온저장고' },
    { key: 'coldStorageLarge', name: '저온저장고 중형 (20평)', price: 128000000, desc: '대량 수확물 장기 저장용 저온저장고' },
    { key: 'coldStorageXl', name: '저온저장고 대형 (30평)', price: 186000000, desc: '고용량 장기 저장·선별 연계형 저온저장고' },
    { key: 'coldStorageXxl', name: '저온저장고 특대형 (40평)', price: 242000000, desc: '상시 대량 출하 대비형 저온저장고' },
    { key: 'coldStorageMax', name: '저온저장고 초특대형 (50평)', price: 298000000, desc: '대규모 저장·선별·출하 연계형 저온저장고' },
    { key: 'machineShedSmall', name: '농기계 보관소 소형 (8평)', price: 12000000, desc: '예초기/소형장비 보관용 보관소', rideMachineCapacity: 3 },
    { key: 'machineShedSmallPlus', name: '농기계 보관소 중소형 (12평)', price: 16800000, desc: '소형 트랙터 1대 포함 복합 보관형', rideMachineCapacity: 5 },
    { key: 'machineShedMedium', name: '농기계 보관소 중형 (15평)', price: 21800000, desc: 'SS기·소형 트랙터 동시 보관 가능한 보관소', rideMachineCapacity: 7 },
    { key: 'machineShedMediumPlus', name: '농기계 보관소 중대형 (20평)', price: 28600000, desc: '트랙터/승용예초기 다기종 보관형', rideMachineCapacity: 9 },
    { key: 'machineShedLarge', name: '농기계 보관소 대형 (25평)', price: 34800000, desc: '트랙터·운반차 정비 동선 포함 보관소', rideMachineCapacity: 11 },
    { key: 'machineShedLargePlus', name: '농기계 보관소 특대형 (32평)', price: 43500000, desc: '복수 대형 장비 상시 보관·관리 보관소', rideMachineCapacity: 13 },
    { key: 'machineShedXl', name: '농기계 보관소 초특대형 (40평)', price: 52500000, desc: '대형 장비 다수 보관 + 정비공간 확장형', rideMachineCapacity: 15 }
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
  ],
  housing: [
    { key: 'farmHut6Basic', name: '농막 6평 기본형', price: 7500000, desc: '저가형 현장 숙소 · 미니주방/난방 기본' },
    { key: 'farmHut6Insulated', name: '농막 6평 단열형', price: 11000000, desc: '저가형+단열 보강 · 겨울 상주형' },
    { key: 'farmContainer20Used', name: '중고 컨테이너 하우스 4평', price: 4500000, desc: '중고 컨테이너 개조형 · 휴게/숙식 겸용' },
    { key: 'sandwichPanelDorm4', name: '조립식 샌드위치패널 숙소 4평', price: 3900000, desc: '초저가 조립식 숙소 · 단기 현장 체류용' },
    { key: 'usedSiteOffice5', name: '중고 현장사무실 5평', price: 5200000, desc: '중고 사무실 개조형 · 휴게/간이숙식 겸용' },
    { key: 'farmContainer40Office', name: '컨테이너 관리동 8평', price: 17000000, desc: '현장사무+휴게 일체형 컨테이너' },
    { key: 'panelHouse9', name: '조립식 패널하우스 9평', price: 18000000, desc: '실속형 주거 · 욕실/보일러 옵션 포함형' },
    { key: 'lightWood12', name: '경량목구조 12평', price: 32000000, desc: '목조 실속형 · 단열/환기 강화형' },
    { key: 'modular15Value', name: '모듈러 15평 실속형', price: 48000000, desc: '공장제작 모듈러 · 시공기간 단축형' },
    { key: 'mobileHome13', name: '이동식 주택 13평', price: 55000000, desc: '법적 범위 내 이동 가능형 · 창고 겸용' },
    { key: 'steelOfficeLounge', name: '철골 관리동(사무+휴게)', price: 60000000, desc: '농장 운영실+휴게실 복합 공간' },
    { key: 'dualContainerLinked', name: '듀얼 컨테이너 하우스 12평', price: 68000000, desc: '연결형 복합 컨테이너 · 주거/업무 분리형' },
    { key: 'modular25Standard', name: '모듈러 25평 스탠다드', price: 95000000, desc: '중상급 표준형 · 고단열/시스템창호' },
    { key: 'woodHouse30', name: '목조주택 30평', price: 130000000, desc: '전원형 상주 주택 · 기본 풀옵션급' },
    { key: 'smartFarmResidence', name: '스마트팜 관제 주거동', price: 155000000, desc: '주거+CCTV+관제실 통합형' },
    { key: 'premiumCountry35', name: '프리미엄 전원주택 35평', price: 220000000, desc: '고급 마감/단열/냉난방 패키지' },
    { key: 'hanokHybrid28', name: '한옥 하이브리드 28평', price: 260000000, desc: '한옥 감성 + 현대식 설비 복합형' },
    { key: 'passiveHouse30', name: '패시브하우스 30평', price: 300000000, desc: '초고단열/열회수환기 · 에너지 절감형' },
    { key: 'villaFarm40', name: '빌라형 농가주택 40평', price: 390000000, desc: '다인 거주형 · 창고/차고 포함' },
    { key: 'estateFarm55', name: '대저택형 농장 레지던스 55평', price: 650000000, desc: '최상급 주거동 · 고급 설비 풀패키지' }
  ]
};

export const FACILITIES = Object.values(FACILITIES_BY_TAB).flat();
export const FACILITY_MAP = FACILITIES.reduce((acc, facility) => ({ ...acc, [facility.key]: facility }), {});
export const TANK_FACILITY_KEYS = ['peTankSmall', 'peTankMedium', 'peTankLarge', 'peTankXl', 'peTankXxl'];
export const TANK_UPGRADE_OPTIONS = [
  { key: 'waterLevelGauge', name: '수위 게이지', price: 150000, desc: '물탱크 저장수를 1/3 눈대중이 아닌 정밀 수치로 표시' },
  { key: 'insulationCover', name: '보온 커버', price: 230000, desc: '겨울 저장수 동파로 인한 물탱크 내구도 급감 방지' },
  { key: 'irrigationPump', name: '관수펌프', price: 320000, desc: '관수 유량 증대 및 미세살수 가동용 펌프 옵션' }
];
export const TANK_UPGRADE_OPTION_MAP = TANK_UPGRADE_OPTIONS.reduce((acc, option) => ({ ...acc, [option.key]: option }), {});
export const TANK_UPGRADE_OPTION_KEYS = TANK_UPGRADE_OPTIONS.map((option) => option.key);
export const WELL_DEPTH_OPTIONS = [
  { key: 'wellDepth50m', name: '50m급', price: 0, desc: '기본 관정 깊이 (기준 100%)' },
  { key: 'wellDepth100m', name: '100m급', price: 1200000, desc: '중심 수맥 대응 깊이 확장 (기준 대비 +40%)' },
  { key: 'wellDepth150m', name: '150m급', price: 2600000, desc: '심층 수맥 대응 깊이 확장 (기준 대비 +80%)' },
  { key: 'wellDepth200m', name: '200m급', price: 4200000, desc: '초심층 수맥 대응 깊이 확장 (기준 대비 +120%)' }
];
export const WELL_DEPTH_OPTION_MAP = WELL_DEPTH_OPTIONS.reduce((acc, option) => ({ ...acc, [option.key]: option }), {});
export const WELL_DEPTH_OPTION_KEYS = WELL_DEPTH_OPTIONS.map((option) => option.key);
export const WELL_EXTRA_OPTIONS = [
  { key: 'wellPrecisionSensor', name: '지하수량 정밀센서', price: 850000, desc: '수위/유량 정밀 모니터링 센서' }
];
export const WELL_EXTRA_OPTION_MAP = WELL_EXTRA_OPTIONS.reduce((acc, option) => ({ ...acc, [option.key]: option }), {});
