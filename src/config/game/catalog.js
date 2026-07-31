export const SHOP_TABS = [
  ['tool', '도구'],
  ['machine', '농기계'],
  ['consumableMaterial', '소모성 재료'],
  ['seedling', '묘목'],
  ['pesticide', '농약'],
  ['fertilizer', '비료']
];

export const WAREHOUSE_TABS = [['all', '전체'], ...SHOP_TABS];

export const MACHINE_TABS = [
  ['spray', '방제'],
  ['tractor', '트랙터'],
  ['rotary', '로터리'],
  ['transport', '운반'],
  ['work', '예초'],
  ['aerial', '고소작업']
];

export const SHOP_ITEMS = {
  tool: [
    { key: 'pruningShears', name: '전정가위', price: 35000, desc: '가지치기 기본 도구', unit: '개', durable: true, usageWear: 0.35, naturalWearDaily: 0.02 },
    { key: 'thinningShears', name: '적과가위', price: 32000, desc: '적과 작업용 전용 가위', unit: '개', durable: true, usageWear: 0.28, naturalWearDaily: 0.015 },
    { key: 'pruningSaw', name: '전정톱', price: 42000, desc: '굵은 가지 용 전정 톱', unit: '개', durable: true, usageWear: 0.25, naturalWearDaily: 0.01 },
    { key: 'orchardLadder', name: '과수형 사다리', price: 180000, desc: '과수 작업용 경량 사다리', unit: '개', durable: true, usageWear: 0.12, naturalWearDaily: 0.008 },
    { key: 'palletJack', name: '팔레트 잭', price: 190000, desc: '창고 바닥 팔레트 이동용 수동 운반 도구', unit: '개', durable: true, usageWear: 0.1, naturalWearDaily: 0.006, weightKg: 63, liftCapacityKg: 600, palletMoveLabor: 0.7 },
    { key: 'platformCart4Wheel', name: '플랫폼카트(4륜)', price: 90000, desc: '상자·자재를 평판 위에 싣고 밀어 옮기는 4륜 운반 카트', unit: '개', durable: true, usageWear: 0.08, naturalWearDaily: 0.004, weightKg: 16 },
    { key: 'handCart2Wheel', name: '핸드카트(2륜)', price: 50000, desc: '소형 상자와 자재를 세워서 옮기기 쉬운 2륜 운반 카트', unit: '개', durable: true, usageWear: 0.07, naturalWearDaily: 0.004, weightKg: 5 }
  ],
  machine: [
    { key: 'hanaHa1000Wms6', type: 'spray', name: '한아 HA-1000WMS Ⅵ', price: 35000000, desc: '1000L 바퀴형 SS기', unit: '대', durable: true, tier: 'premium', usageWear: 0.22 },
    { key: 'hanaHa1000Sca3', type: 'spray', name: '한아 HA-1000SCA Ⅲ', price: 38000000, desc: '1100L 캐빈형 SS기', unit: '대', durable: true, tier: 'premium', usageWear: 0.22 },
    { key: 'hanaHa1000Wsd', type: 'spray', name: '한아 HA-1000WSD', price: 29000000, desc: '1000L 전용형 SS기', unit: '대', durable: true, tier: 'high', usageWear: 0.24 },
    { key: 'hanaHa600Wms5', type: 'spray', name: '한아 HA-600WMS Ⅴ', price: 24000000, desc: '600L 중형 SS기', unit: '대', durable: true, tier: 'mid', usageWear: 0.27 },
    { key: 'hanaHa500Cm3', type: 'spray', name: '한아 HA-500CM Ⅲ', price: 20000000, desc: '500L 궤도형 소형 SS기', unit: '대', durable: true, tier: 'mid', usageWear: 0.28 },
    { key: 'asiaAss6', type: 'spray', name: '아세아텍 ASS6', price: 26000000, desc: '500L 프리미엄형 SS기', unit: '대', durable: true, tier: 'premium', usageWear: 0.22 },
    { key: 'asiaAss5', type: 'spray', name: '아세아텍 ASS5', price: 22000000, desc: '500L 보급형 SS기', unit: '대', durable: true, tier: 'high', usageWear: 0.25 },
    { key: 'asiaAts6', type: 'spray', name: '아세아텍 ATS6', price: 28000000, desc: '900L 다목적형 SS기', unit: '대', durable: true, tier: 'high', usageWear: 0.24 },
    { key: 'asiaAss1016Tld2', type: 'spray', name: '아세아텍 ASS-1016TLD2', price: 35000000, desc: '1000L 대용량 SS기', unit: '대', durable: true, tier: 'premium', usageWear: 0.22 },
    { key: 'asiaAcs1000', type: 'spray', name: '아세아텍 ACS-1000', price: 34000000, desc: '1000L 캐빈형 SS기', unit: '대', durable: true, tier: 'premium', usageWear: 0.22 },
    { key: 'asiaAss400C', type: 'spray', name: '아세아텍 ASS-400C', price: 15000000, desc: '400L 소형 SS기', unit: '대', durable: true, tier: 'entry', usageWear: 0.33 },
    { key: 'asia500G', type: 'spray', name: '아세아텍 ASIA 500G', price: 35000000, desc: '500L 무인 SS기', unit: '대', durable: true, tier: 'premium', usageWear: 0.2 },
    { key: 'lsMt3', type: 'tractor', name: 'LS MT3', price: 33000000, desc: '과수 대표 모델 (신품 2,800~3,800만원)', unit: '대', durable: true, tier: 'high', usageWear: 0.16 },
    { key: 'tymT58', type: 'tractor', name: 'TYM T58', price: 30000000, desc: '구 동양물산 계열 모델 (신품 2,500~3,500만원)', unit: '대', durable: true, tier: 'high', usageWear: 0.17 },
    { key: 'kubotaL4701', type: 'tractor', name: 'Kubota L4701', price: 42000000, desc: '중형급 과수 작업 모델 (신품 3,500~5,000만원)', unit: '대', durable: true, tier: 'premium', usageWear: 0.14 },
    { key: 'rideMower', type: 'work', name: '승용 예초기', price: 6200000, desc: '초생 관리·작업 보조', unit: '대', durable: true, tier: 'mid', usageWear: 0.2 },
    { key: 'haMe1022x', type: 'work', name: '한아 HA-ME1022X', price: 11000000, desc: '승용 예초기 · 작업 보조', unit: '대', durable: true, tier: 'high', usageWear: 0.14 },
    { key: 'aerialLiftElectric', type: 'aerial', name: '고소작업차 (리프트형) 전기모델', price: 9800000, desc: '리프트형 고소작업 장비 · 2인승 · 전기 구동', unit: '대', durable: true, tier: 'high', usageWear: 0.16, seatCount: 2 },
    { key: 'aerialLiftGasoline', type: 'aerial', name: '고소작업차 (리프트형)', price: 9400000, desc: '리프트형 고소작업 장비 · 2인승 · 휘발유 엔진', unit: '대', durable: true, tier: 'high', usageWear: 0.17, seatCount: 2 },
    { key: 'aerialBoomElectric', type: 'aerial', name: '고소작업차 (관절형) 전기모델', price: 10200000, desc: '관절형 붐 고소작업 장비 · 1인승 · 전기 구동', unit: '대', durable: true, tier: 'premium', usageWear: 0.14, seatCount: 1 },
    { key: 'aerialBoomGasoline', type: 'aerial', name: '고소작업차 (관절형)', price: 9900000, desc: '관절형 붐 고소작업 장비 · 1인승 · 휘발유 엔진', unit: '대', durable: true, tier: 'premium', usageWear: 0.15, seatCount: 1 },
    { key: 'aerialBoomGasoline2Seat', type: 'aerial', name: '고소작업차 (관절형) 2인승', price: 11200000, desc: '관절형 붐 고소작업 장비 · 2인승 · 휘발유 엔진', unit: '대', durable: true, tier: 'premium', usageWear: 0.16, seatCount: 2 },
    { key: 'daewooLabo', type: 'transport', name: '대우 라보', price: 9800000, desc: '경상용 초소형 화물차 · 소형 농자재 운반용', unit: '대', durable: true, tier: 'entry', usageWear: 0.22 },
    { key: 'chevroletDamas', type: 'passenger', name: '쉐보레 다마스', price: 11200000, desc: '소형 밴 승용차 · 경량 화물 적재', unit: '대', durable: true, tier: 'entry', usageWear: 0.21 },
    { key: 'ray', type: 'passenger', name: '기아 레이', price: 14200000, desc: '경형 승용차 · 적재 180kg', unit: '대', durable: true, tier: 'entry', usageWear: 0.21 }
  ],
  seedling: [
    { key: 'seedlingFuji', name: 'M9대목 후지 묘목', price: 15000, desc: 'M9대목 후지 사과 묘목', unit: '주' },
    { key: 'seedlingSummerPrince', name: 'M9대목 썸머프린스 묘목', price: 16000, desc: '7월 초중순 출하를 노리는 조생 사과 묘목', unit: '주' },
    { key: 'seedlingHongro', name: 'M9대목 홍로 묘목', price: 14250, desc: '개발중', unit: '주' },
    { key: 'seedlingGamhong', name: 'M9대목 감홍 묘목', price: 18000, desc: '개발중', unit: '주' },
    { key: 'seedlingSinano', name: 'M9대목 시나노골드 묘목', price: 16500, desc: '개발중', unit: '주' }
  ],
  consumableMaterial: [],
  pesticide: [
    { key: 'pesticideGeneral', name: '일반 살균제', price: 48000, desc: '기본 병해충 방제 (20L)', unit: '통' },
    { key: 'pesticidePremium', name: '프리미엄 살충제', price: 69000, desc: '고효율 해충 방제 (20L)', unit: '통' },
    { key: 'treeProtectantBasic18L', name: '노루페인트 외부용 수성페인트 18L', price: 66000, desc: '기본형 수목보호제(농가 사용형) · 줄기 도포용 보호 코팅', unit: '통' },
    { key: 'treeProtectantWiltPruf10L', name: '윌트프루프 10L 수목보호제', price: 440000, desc: '고급형 수목보호제 · 수분 손실 완화용 보호 코팅', unit: '통' },
    { key: 'pesticideMachineOil', name: '기계유 유제', price: 54000, desc: '월동기 해충·응애 기초 방제용 (20L)', unit: '통' },
  ],
  fertilizer: [
    { key: 'fertilizerNpk', name: 'NPK 복합비료 (20kg)', price: 18000, desc: '기비/밑거름 작업용 (1포당 20주)', unit: '포' },
    { key: 'fertilizerNk', name: 'NK 비료 (20kg)', price: 21000, desc: '기비/밑거름 작업용 (1포당 20주)', unit: '포' },
    { key: 'fertilizerOrganic', name: '유기질 비료 (20kg)', price: 15000, desc: '기비/밑거름 작업용 (1포당 20주)', unit: '포' },
    { key: 'fertilizerCalcium', name: '칼슘 비료 (20kg)', price: 17000, desc: '기비/밑거름 작업용 (1포당 20주)', unit: '포' }
  ]
};

export const SEEDLING_KEY_BY_CROP = {
  fuji: 'seedlingFuji',
  summerPrince: 'seedlingSummerPrince',
  hongro: 'seedlingHongro',
  gamhong: 'seedlingGamhong',
  sinano: 'seedlingSinano'
};

export const SPRAY_TASK_KEYS = ['pestEarly', 'herbicideSpray', 'pestSeason', 'foliarFertilization'];
export const WATER_USE_TASK_KEYS = ['waterNutrition'];
export const SPRAY_MACHINE_KEYS = (SHOP_ITEMS.machine || []).filter((item) => item.type === 'spray').map((item) => item.key);
export const TRACTOR_MACHINE_KEYS = (SHOP_ITEMS.machine || []).filter((item) => item.type === 'tractor').map((item) => item.key);
export const EQUIPMENT_ITEMS = [...(SHOP_ITEMS.tool || []), ...(SHOP_ITEMS.machine || [])].filter((item) => item.durable);
export const EQUIPMENT_ITEM_MAP = EQUIPMENT_ITEMS.reduce((acc, item) => ({ ...acc, [item.key]: item }), {});

export const FERTILIZER_NUTRITION_GAIN = {
  fertilizerNpk: 2.5,
  fertilizerNk: 2.2,
  fertilizerOrganic: 1.8,
  fertilizerCalcium: 1.0
};

export const FERTILIZER_KEYS = Object.keys(FERTILIZER_NUTRITION_GAIN);
