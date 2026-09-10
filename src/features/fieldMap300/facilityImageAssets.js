const FIELD_MAP_300_OBJECT_IMAGE_MODULES = import.meta.glob(
  '../../assets/images/농지맵 사물 이미지/*.{png,jpg,jpeg,webp,gif,avif}',
  {
    eager: true,
    import: 'default'
  }
);
const FIELD_MAP_300_FACILITY_IMAGE_MODULES = import.meta.glob(
  '../../assets/images/시설/**/*.{png,jpg,jpeg,webp,gif,avif}',
  {
    eager: true,
    import: 'default'
  }
);

function basenameOf(path) {
  return String(path || '').split('/').pop() || '';
}

const FIELD_MAP_300_IMAGE_URL_BY_NAME = Object.freeze(
  Object.fromEntries(
    Object.entries({
      ...FIELD_MAP_300_OBJECT_IMAGE_MODULES,
      ...FIELD_MAP_300_FACILITY_IMAGE_MODULES
    }).map(([filePath, url]) => [
      basenameOf(filePath),
      String(url || '')
    ])
  )
);

export const FIELD_MAP_300_IMAGE_OPTIONS = Object.freeze(
  Object.entries(FIELD_MAP_300_IMAGE_URL_BY_NAME)
    .map(([name, url]) => ({ name, url }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
);

export const FIELD_MAP_300_FACILITY_IMAGE_ALIASES = Object.freeze({
  treePainterAge1: '사과 1,2년생 하계.png',
  treePainterAge2: '사과 1,2년생 하계.png',
  treePainterAge3: '사과 3,4년생 하계.png',
  treePainterAge4: '사과 3,4년생 하계.png',
  treePainterAge5: '사과 5,6년생 하계.png',
  treePainterAge6: '사과 5,6년생 하계.png',
  treePainterAge1Winter: '사과 1,2년생 동계.png',
  treePainterAge2Winter: '사과 1,2년생 동계.png',
  treePainterAge3Winter: '사과 3,4년생 동계.png',
  treePainterAge4Winter: '사과 3,4년생 동계.png',
  treePainterAge5Winter: '사과 5,6년생 동계.png',
  treePainterAge6Winter: '사과 5,6년생 동계.png',
  evChargerStation: 'EV 충전기.png',
  wellFacility: '관정.png',
  farmPowerElectric: '한전 농사용전기.png',
  autoRefillSystem: '실외기.png',
  frostFan: '방상팬.png',
  peTankSmall: 'PE물탱크 소형.png',
  peTankMedium: 'PE 물탱크 중형.png',
  peTankLarge: 'PE 물탱크 대형.png',
  peTankXl: 'PE 물탱크 초대형.png',
  peTankXxl: 'PE 물탱크 초대형.png',
  panelWarehouse3: '판넬 창고 소형.png',
  panelWarehouse5: '판넬 창고 중형.png',
  panelWarehouse8: '판넬 창고 대형.png',
  goodsWarehouseSmall: '건창고 소형.png',
  goodsWarehouseMedium: '건창고 중형.png',
  goodsWarehouseLarge: '건창고 대형.png',
  goodsWarehouseXl: '건창고 초대형.png',
  coldStorageMedium: '저온저장고 중형.png',
  coldStorageLarge: '저온저장고 대형.png',
  coldStorageXl: '저온저장고 초대형.png',
  coldStorageXxl: '저온저장고 특대형.png',
  machineShedSmall: '농기계 보관소 소형.png',
  machineShedMedium: '농기계 보관소 중형.png',
  machineShedLarge: '농기계 보관소 대형.png',
  machineShedModern: '농기계 보관소 모던스타일.png',
  goodsWarehouseVintage8: '옛날 건창고 8평형.png',
  concretePowerPole: '콘크리트 전봇대.png',
  parkingOpenLot: '주차 공간.png',
  portableToilet: '간이 화장실.png',
  outdoorToilet: '야외 화장실.png',
  workerRestroom: '작업자 화장실.png',
  hygieneShowerUnit: '샤워실 포함 위생동.png',
  cementGroundPainter1: '시멘트땅1.png',
  grassGroundPainter1: '풀밭땅.png',
  grassGroundPainter2: '풀밭땅2.png',
  grassGroundPainter3: '풀밭땅3.png',
  grassGroundPainter4: '풀밭땅4.png',
  dirtGroundPainter1: '흙땅.png',
  dirtGroundPainter2: '흙땅2.png',
  weedLightGroundPainter1: '잡초보통땅.png',
  weedLightGroundPainter2: '잡초보통땅2.png',
  weedLightGroundPainter3: '잡초보통땅3.png',
  weedHeavyGroundPainter1: '잡초많은땅.png',
  weedHeavyGroundPainter2: '잡초많은땅2.png',
  weedHeavyGroundPainter3: '잡초많은땅3.png'
});

const FIELD_MAP_300_ALIAS_URLS = Object.freeze(
  Object.fromEntries(
    Object.entries(FIELD_MAP_300_FACILITY_IMAGE_ALIASES).map(([key, imageName]) => [
      key,
      String(FIELD_MAP_300_IMAGE_URL_BY_NAME[imageName] || '')
    ])
  )
);

const FIELD_MAP_300_TREE_IMAGE_KEYS = Object.freeze({
  summer: Object.freeze({
    1: 'treePainterAge1',
    2: 'treePainterAge2',
    3: 'treePainterAge3',
    4: 'treePainterAge4',
    5: 'treePainterAge5',
    6: 'treePainterAge6'
  }),
  winter: Object.freeze({
    1: 'treePainterAge1Winter',
    2: 'treePainterAge2Winter',
    3: 'treePainterAge3Winter',
    4: 'treePainterAge4Winter',
    5: 'treePainterAge5Winter',
    6: 'treePainterAge6Winter'
  })
});

export function fieldMap300TreeImageKeyForAge(age, tone = 'summer') {
  const safeAge = Math.max(1, Math.min(6, Math.round(Number(age) || 1)));
  const safeTone = String(tone || 'summer') === 'winter' ? 'winter' : 'summer';
  return FIELD_MAP_300_TREE_IMAGE_KEYS[safeTone]?.[safeAge] || FIELD_MAP_300_TREE_IMAGE_KEYS.summer[safeAge];
}

export function fieldMap300FacilityImageNameForKey(key = '') {
  return String(FIELD_MAP_300_FACILITY_IMAGE_ALIASES[String(key || '')] || '');
}

export function resolveFieldMap300ImageUrl(facilityLike) {
  const previewImageName = String(facilityLike?.previewImageName || '');
  if (previewImageName) {
    const byName = FIELD_MAP_300_IMAGE_URL_BY_NAME[previewImageName];
    if (byName) return String(byName);
  }
  const previewImageKey = String(facilityLike?.previewImageKey || facilityLike?.key || '');
  if (previewImageKey) {
    const aliased = FIELD_MAP_300_ALIAS_URLS[previewImageKey];
    if (aliased) return String(aliased);
    const directByName = FIELD_MAP_300_IMAGE_URL_BY_NAME[previewImageKey];
    if (directByName) return String(directByName);
  }
  return '';
}

export const FIELD_MAP_300_FACILITY_IMAGE_URLS = Object.freeze({
  ...FIELD_MAP_300_IMAGE_URL_BY_NAME,
  ...FIELD_MAP_300_ALIAS_URLS
});
