import { INFRASTRUCTURE_ITEMS } from './infrastructureItems.js';
import { DRAINAGE_MATERIAL_ITEMS } from './drainageMaterial.js';
export const CONSUMABLE_MATERIAL_ITEMS = [
  ...DRAINAGE_MATERIAL_ITEMS,
  ...INFRASTRUCTURE_ITEMS,
  {
    key: 'trellisStake',
    name: '지주대 2m',
    price: 1500,
    desc: '개별 나무 지지용. 지주시설 설계에서 나무당 0~2개 선택 · 설치율에 따라 강풍 피해 위험 감소',
    unit: '개',
    durable: false,
    weightKg: 0.25
  },
  {
    key: 'scaffoldPipe',
    name: '비계파이프 3m',
    price: 18000,
    desc: '나무 열 양 끝과 중간의 구조 지주용. 기본 최대 5m 간격 · 촘촘할수록 강풍 저항 증가, 자재·시공비 증가',
    unit: '본',
    durable: false,
    weightKg: 8
  },
  {
    key: 'trellisWire',
    name: 'PE코팅와이어 1m',
    price: 500,
    desc: '지주 사이 연결·가지 유인용. 열 길이×단수로 계산 · 단수를 늘리면 가지유인 노동력 절감, 연결·보수 부담 증가',
    unit: 'm',
    durable: false,
    weightKg: 0.042
  },
  {
    key: 'cementBrick100Pack',
    name: '시멘트벽돌',
    price: 100,
    desc: '개당 판매',
    unit: '개',
    weightKg: 1
  },
  {
    key: 'reflectiveFilm002t1x500',
    name: '반사필름 0.02mm x 1m x 500m',
    price: 100000,
    desc: '과원 반사광 확보용 소모성 필름',
    unit: '롤',
    weightKg: 9
  },
  {
    key: 'collectedReflectiveFilm',
    name: '수거된 반사필름',
    price: 0,
    desc: '반사필름 수거 작업 결과물 · 1m 단위 보관',
    unit: 'm',
    weightKg: 0.018
  },
  {
    key: 'anchorBand500Pack',
    name: '앙카밴드',
    price: 10000,
    desc: '1봉지 500개입, 지주대·와이어 고정용 소모성 밴드',
    unit: '봉지',
    weightKg: 0.35
  },
  {
    key: 'bindingString400Pack',
    name: '결속끈',
    price: 8000,
    desc: '1봉지 400개입, 자재 결속용 끈',
    unit: '봉지',
    weightKg: 0.6
  },
  {
    key: 'orchardTrainingString900m',
    name: '과수유인끈 900M',
    price: 12000,
    desc: '과수 유인 작업용 끈',
    unit: '롤',
    weightKg: 1.8
  },
  {
    key: 'cableTie100Pack',
    name: '결속타이',
    price: 12000,
    desc: '1봉지 100개입, 배선·자재 결속용 타이',
    unit: '봉지',
    weightKg: 0.15
  },
  {
    key: 'irrigationPipe100mRoll',
    name: '관수배관 100M 1롤',
    price: 120000,
    desc: '1롤 100m, 배관 설치 시 1주당 1m 소모',
    unit: '롤',
    weightKg: 10
  },
  {
    key: 'dripNozzle',
    name: '점적노즐',
    price: 700,
    desc: '주당 1개 설치, 기본 5L/주/일 (펌프 ON 시 10L)',
    unit: '개',
    weightKg: 0.03
  },
  {
    key: 'sprinklerNozzle',
    name: '스프링클러 노즐',
    price: 950,
    desc: '주당 1개 설치, 기본 15L/주/일 (펌프 ON 시 50L)',
    unit: '개',
    weightKg: 0.07
  },
  {
    key: 'microSprinklerNozzle',
    name: '미세살수 노즐',
    price: 1250,
    desc: '주당 1개 설치, 60L/주/일 (관수펌프 필수)',
    unit: '개',
    weightKg: 0.1
  },
  {
    key: 'housingGeneralWaste',
    name: '생활쓰레기',
    price: 0,
    desc: '하우징 생활 중 생긴 일반 쓰레기. 1kg 단위로 적재됩니다.',
    unit: 'kg',
    weightKg: 1
  },
  {
    key: 'housingFoodWaste',
    name: '음식물 쓰레기',
    price: 0,
    desc: '조리와 식사 후 남은 음식물 쓰레기. 방치하면 생활품질이 떨어집니다.',
    unit: 'kg',
    weightKg: 1
  },
  {
    key: 'housingRecycleWaste',
    name: '재활용 쓰레기',
    price: 0,
    desc: '생수병, 포장재 등 분리배출 가능한 쓰레기. 1kg 단위로 적재됩니다.',
    unit: 'kg',
    weightKg: 1
  }
];
