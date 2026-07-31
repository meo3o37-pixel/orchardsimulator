const TOWN_MARKER_NAME_MAP = Object.freeze({
  bank: '은행',
  fuelStation: '주유소',
  farmMart: '농자재 마트',
  pesticideShop: '약제상점',
  machineRent: '농기계임대사업소',
  townOffice: '농민센터',
  landBank: '농지은행',
  seedlingShop: '묘목 상점',
  foodMart: '식자재 마트',
  laborOffice: '인력 사무소',
  constructionOffice: '건설사무소',
  maintenanceShop: '정비소',
  processingCenter: '농산물가공센터',
  usedCarDealer: '중고차 대리점',
  smallApc: '소형 APC',
  herbalClinic: '한의원',
  hospital: '병원',
  smallCity: '소도시',
  localFoodStore: '로컬푸드 직매장',
  villageInn: '민박',
  villagePension: '펜션',
  motel: '모텔',
  guestHouse: '게스트하우스',
  realEstateOffice: '부동산',
  oneRoomVilla: '원룸빌라',
  apartment: '아파트',
  homeLivingCenter: '홈리빙센터',
});

const SMALL_CITY_MARKER_NAME_MAP = Object.freeze({
  ...TOWN_MARKER_NAME_MAP,
  pesticideShop: '농업 연구소',
  machineRent: '농기계 대리점',
  townOffice: '농업기술센터',
  seedlingShop: '묘목 상점',
  hospital: '병원',
  laborOffice: '인력지원센터',
  constructionOffice: '전문농시설건설소',
  maintenanceShop: '1급자동차공업사',
  smallCity: '자동차 대리점',
  localFoodStore: '로컬푸드 직매장',
  motel: '모텔',
  guestHouse: '게스트하우스',
  realEstateOffice: '부동산',
  oneRoomVilla: '원룸빌라',
  apartment: '아파트',
  homeLivingCenter: '홈리빙센터',
});

export const resolveSettlementMarkerName = ({
  markerKeyRaw = '',
  activeSettlementName = '',
  isSmallCityContext = false,
} = {}) => {
  const markerKey = String(markerKeyRaw || '');
  const nameMap = isSmallCityContext ? SMALL_CITY_MARKER_NAME_MAP : TOWN_MARKER_NAME_MAP;
  const baseName = String(nameMap[markerKey] || markerKey || '마커');
  const safeSettlementName = String(activeSettlementName || '').trim();
  if (!safeSettlementName) return baseName;
  if (markerKey === 'smallCity') return baseName;
  if (baseName.startsWith(safeSettlementName)) return baseName;
  return `${safeSettlementName} ${baseName}`;
};

export const resolveSettlementDestinationLabel = ({
  destinationKey,
  mapMarkerNameOf,
} = {}) => {
  const key = String(destinationKey || '');
  if ([
    'bank',
    'fuelStation',
    'farmMart',
    'pesticideShop',
    'machineRent',
    'smallApc',
    'herbalClinic',
    'hospital',
    'smallCity',
    'localFoodStore',
    'townOffice',
    'landBank',
    'seedlingShop',
    'foodMart',
    'laborOffice',
    'constructionOffice',
    'maintenanceShop',
    'processingCenter',
    'usedCarDealer',
    'villageInn',
    'villagePension',
    'motel',
    'guestHouse',
    'realEstateOffice',
    'oneRoomVilla',
    'apartment',
    'homeLivingCenter',
  ].includes(key)) {
    return mapMarkerNameOf(key);
  }
  return '방문 지점';
};
