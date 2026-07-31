import { SHOP_ITEMS as SHOP_ITEMS_BY_CATEGORY } from '../items/index.js';

export const CREW_TYPES = {
  beginner: { key: 'beginner', name: '초보노동자', wage: 105000, workLabel: '수확보조/적재/운반보조/단순 정리 작업' },
  worker: { key: 'worker', name: '노동자', wage: 130000, workLabel: '적과/적엽/수확/기비/시설정비/포장 등 일반 작업' },
  skilledWorker: { key: 'skilledWorker', name: '숙련노동자', wage: 170000, workLabel: '고효율 수확/정밀 적과/현장 숙련 작업' },
  agriTechnician: { key: 'agriTechnician', name: '농업기술자', wage: 220000, workLabel: '작업지시 전정/약제살포/전문 관리 작업' }
};

export const SHOP_TABS = [
  ['tool', '도구'],
  ['machine', '농기계'],
  ['transport', '화물차'],
  ['passenger', '승용차'],
  ['fuel', '주유소'],
  ['container', '컨테이너'],
  ['consumableMaterial', '소모성 재료'],
  ['seedling', '묘목'],
  ['pesticide', '농약'],
  ['pollen', '꽃가루'],
  ['fertilizer', '비료']
];
export const WAREHOUSE_TABS = [['all', '전체'], ...SHOP_TABS];
export const MACHINE_TABS = [
  ['spray', '방제'],
  ['tractor', '트랙터'],
  ['rotary', '로터리'],
  ['work', '예초'],
  ['operation', '작업'],
  ['harvestCarrier', '동력운반'],
  ['aerial', '고소작업']
];
export const PESTICIDE_TABS = [
  ['all', '전체'],
  ['fungicide', '살균'],
  ['insecticide', '살충'],
  ['herbicide', '제초'],
  ['nutrition', '영양제'],
  ['protectant', '수목보호'],
  ['material', '재료']
];

const STAGE_QUALITY_AGENT_ITEMS = [
  {
    key: 'nutriGrowthBooster',
    subgroup: 'nutrition',
    name: '과키워',
    formulation: '액제',
    price: 30000,
    desc: '유효성분: 아미노산 + 해조추출물 + 생리활성물질(Amino acids + seaweed extract + bioactive substances) · 과실 비대·세포분열 보조 · 권장 희석 1000배',
    unit: '1병'
  },
  {
    key: 'nutriGiantBig',
    subgroup: 'nutrition',
    name: '자이언트빅',
    formulation: '액제',
    price: 60000,
    desc: '유효성분: 트립토판 + 아르기닌 + 식물성아미노산 + 미량요소(Tryptophan + arginine + plant amino acids + trace elements) · 프리미엄 과실비대·균일과 관리 · 권장 희석 1000배',
    unit: '1병'
  },
  {
    key: 'nutriKalamin',
    subgroup: 'nutrition',
    name: '칼라민',
    formulation: '액제',
    price: 30000,
    desc: '유효성분: 천연유기활성제 + 유기인산 + 탄수화물 + 복합아미노산(Organic activator + phosphorus + carbohydrate + amino acid complex) · 착색·당도·광합성 보조 · 권장 희석 500~1000배',
    unit: '1병'
  },
  {
    key: 'nutriPremiumColor',
    subgroup: 'nutrition',
    name: '찐칼라',
    formulation: '액제',
    price: 50000,
    desc: '유효성분: 과실색소발현 전구체 + 착색기 필수영양소 + 미량요소(Color precursor + essential nutrients + trace elements) · 프리미엄 착색·당도 관리 · 권장 희석 500~1000배',
    unit: '1병'
  }
];

export const SHOP_ITEMS = {
  ...SHOP_ITEMS_BY_CATEGORY,
  pesticide: [
    ...(SHOP_ITEMS_BY_CATEGORY.pesticide || []),
    ...STAGE_QUALITY_AGENT_ITEMS
  ]
};

const PORTABLE_SPRAYER_TOOL_KEYS = new Set(['backpackSprayer20LManual', 'backpackSprayer20LElectric']);

export const MACHINE_ITEM_MAP = [
  ...(SHOP_ITEMS.machine || []),
  ...(SHOP_ITEMS.tool || []).filter((item) => PORTABLE_SPRAYER_TOOL_KEYS.has(String(item?.key || '')))
].reduce((acc, item) => ({ ...acc, [item.key]: item }), {});

const PESTICIDE_ITEM_MAP_BASE = (SHOP_ITEMS.pesticide || []).reduce((acc, item) => ({ ...acc, [item.key]: item }), {});

export const PESTICIDE_ITEM_MAP = {
  ...PESTICIDE_ITEM_MAP_BASE,
  pesticideBordeaux: {
    key: 'pesticideBordeaux',
    name: '보르도액 (동제)',
    unit: 'kg',
    desc: '황산동/석회 배합 생성'
  }
};
