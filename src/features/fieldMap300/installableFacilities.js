import { FACILITY_OCCUPY_PY as LEGACY_GAME_FACILITY_OCCUPY_PY } from '../../config/game/facilities.js';
import { FACILITY_OCCUPY_PY as SIM_FACILITY_OCCUPY_PY } from '../../config/sim/facilities.js';
import {
  fieldMap300FacilityImageNameForKey,
  fieldMap300TreeImageKeyForAge
} from './facilityImageAssets';
import FIELD_MAP_300_FACILITY_CATALOG_OVERRIDES from './fieldMap300FacilityCatalogOverrides.json';

const FIELD_MAP_300_OCCUPY_PY = Object.freeze({
  ...SIM_FACILITY_OCCUPY_PY,
  ...LEGACY_GAME_FACILITY_OCCUPY_PY,
  parkingOpenLot: 1,
});

function resolveOccupyPy(key, fallback = 0) {
  const resolved = FIELD_MAP_300_OCCUPY_PY[String(key || '')];
  return Number.isFinite(resolved) ? Math.max(0, resolved) : Math.max(0, Number(fallback || 0));
}

const createFacility = (facility) => {
  const occupyPy = Object.prototype.hasOwnProperty.call(facility || {}, 'occupyPy')
    ? Math.max(0, Number(facility?.occupyPy || 0))
    : resolveOccupyPy(facility?.key, facility?.occupyPy);
  const placementKind = String(facility?.placementKind || 'area');

  return Object.freeze({
    category: 'facility',
    placementKind,
    installGroup: 'general',
    gameFacilityKey: String(facility?.key || ''),
    previewImageKey: '',
    previewTone: 'summer',
    ...facility,
    occupyPy,
    width: Math.max(1, Number(facility?.width || 1)),
    height: Math.max(1, Number(facility?.height || 1)),
    fixedFootprint: true,
  });
};

const createPainter = (facility) => Object.freeze({
  category: 'painter',
  placementKind: 'paint',
  installGroup: 'paint',
  gameFacilityKey: '',
  previewImageKey: '',
  ...facility,
});

const createTreePainter = (age) => createPainter({
  key: `treePainterAge${age}`,
  name: `나무 ${age}년생`,
  width: 1,
  height: 1,
  occupyPy: 0,
  type: 'tree',
  previewSkin: 'tree',
  previewTone: 'summer',
  previewImageKey: fieldMap300TreeImageKeyForAge(age, 'summer'),
  treeAge: age,
  placementMode: 'paint-tree',
  hint: age === 1
    ? '막 식재한 어린 나무 1년생 픽셀을 직접 찍습니다.'
    : age === 2
      ? '수관이 조금 오른 2년생 나무 픽셀을 직접 찍습니다.'
      : age === 3
        ? '과원 줄이 보이기 시작하는 3년생 나무 픽셀을 직접 찍습니다.'
        : age === 4
          ? '수관이 더 넓어진 4년생 나무 픽셀을 직접 찍습니다.'
          : age === 5
          ? '결실 수형에 가까운 5년생 나무 픽셀을 직접 찍습니다.'
          : '가장 크게 자란 6년생 나무 픽셀을 직접 찍습니다.',
});

const createWinterTreePainter = (age) => createPainter({
  key: `treePainterAge${age}Winter`,
  name: `나무 ${age}년생 동계`,
  width: 1,
  height: 1,
  occupyPy: 0,
  type: 'tree',
  previewSkin: 'tree',
  previewTone: 'winter',
  previewImageKey: fieldMap300TreeImageKeyForAge(age, 'winter'),
  treeAge: age,
  placementMode: 'paint-tree',
  hint: age === 1
    ? '막 식재한 어린 나무 1년생 동계 픽셀을 직접 찍습니다.'
    : age === 2
      ? '수관이 조금 오른 2년생 동계 나무 픽셀을 직접 찍습니다.'
      : age === 3
        ? '과원 줄이 보이기 시작하는 3년생 동계 나무 픽셀을 직접 찍습니다.'
        : age === 4
          ? '수관이 더 넓어진 4년생 동계 나무 픽셀을 직접 찍습니다.'
          : age === 5
            ? '결실 수형에 가까운 5년생 동계 나무 픽셀을 직접 찍습니다.'
            : '가장 크게 자란 6년생 동계 나무 픽셀을 직접 찍습니다.',
});

const createGroundPainter = ({
  key,
  name,
  previewImageKey,
  previewImageName = '',
  hint,
  type = 'summer-ground'
}) => createPainter({
  key,
  name,
  width: 1,
  height: 1,
  occupyPy: 0,
  type,
  previewSkin: type === 'winter-ground' ? 'winter' : 'summer',
  previewTone: type === 'winter-ground' ? 'winter' : 'summer',
  previewImageKey,
  previewImageName,
  placementMode: 'paint-ground',
  hint,
});

const createGroundAreaPainter = ({
  key,
  name,
  previewImageKey,
  previewImageName = '',
  hint,
  variantKeys = [],
  type = 'summer-ground'
}) => createPainter({
  key,
  name,
  width: 1,
  height: 1,
  occupyPy: 0,
  type,
  previewSkin: type === 'winter-ground' ? 'winter' : 'summer',
  previewTone: type === 'winter-ground' ? 'winter' : 'summer',
  previewImageKey,
  previewImageName,
  placementMode: 'paint-ground-area-random',
  variantKeys: Array.isArray(variantKeys) ? variantKeys.filter(Boolean) : [],
  hint,
});

const STATIC_FIELD_MAP_300_INSTALLABLE_FACILITIES = Object.freeze([
  createTreePainter(1),
  createTreePainter(2),
  createTreePainter(3),
  createTreePainter(4),
  createTreePainter(5),
  createTreePainter(6),
  createWinterTreePainter(1),
  createWinterTreePainter(2),
  createWinterTreePainter(3),
  createWinterTreePainter(4),
  createWinterTreePainter(5),
  createWinterTreePainter(6),
  createGroundPainter({
    key: 'cementGroundPainter1',
    name: '시멘트땅 1',
    previewImageKey: 'cementGroundPainter1',
    hint: '작업장이나 보행 구역용 시멘트 바닥 픽셀을 직접 칠합니다.'
  }),
  createGroundAreaPainter({
    key: 'grassGroundAreaPainter',
    name: '풀밭땅 배치',
    previewImageKey: 'grassGroundPainter1',
    hint: '드래그한 영역 안을 풀밭땅 계열로 랜덤 배치합니다.',
    variantKeys: ['grassGroundPainter1', 'grassGroundPainter2', 'grassGroundPainter3', 'grassGroundPainter4']
  }),
  createGroundAreaPainter({
    key: 'dirtGroundAreaPainter',
    name: '흙땅 배치',
    previewImageKey: 'dirtGroundPainter1',
    hint: '드래그한 영역 안을 흙땅 계열로 랜덤 배치합니다.',
    variantKeys: ['dirtGroundPainter1', 'dirtGroundPainter2']
  }),
  createGroundAreaPainter({
    key: 'weedLightGroundAreaPainter',
    name: '잡초보통땅 배치',
    previewImageKey: 'weedLightGroundPainter1',
    hint: '드래그한 영역 안을 잡초보통땅 계열로 랜덤 배치합니다.',
    variantKeys: ['weedLightGroundPainter1', 'weedLightGroundPainter2', 'weedLightGroundPainter3']
  }),
  createGroundAreaPainter({
    key: 'weedHeavyGroundAreaPainter',
    name: '잡초많은땅 배치',
    previewImageKey: 'weedHeavyGroundPainter1',
    hint: '드래그한 영역 안을 잡초많은땅 계열로 랜덤 배치합니다.',
    variantKeys: ['weedHeavyGroundPainter1', 'weedHeavyGroundPainter2', 'weedHeavyGroundPainter3']
  }),
  createGroundPainter({
    key: 'grassGroundPainter1',
    name: '풀밭땅 1',
    previewImageKey: 'grassGroundPainter1',
    hint: '기본 잔디 바닥 픽셀을 직접 칠합니다.'
  }),
  createGroundPainter({
    key: 'grassGroundPainter2',
    name: '풀밭땅 2',
    previewImageKey: 'grassGroundPainter2',
    hint: '결이 조금 다른 잔디 바닥 픽셀을 직접 칠합니다.'
  }),
  createGroundPainter({
    key: 'grassGroundPainter3',
    name: '풀밭땅 3',
    previewImageKey: 'grassGroundPainter3',
    hint: '밝은 톤 잔디 바닥 픽셀을 직접 칠합니다.'
  }),
  createGroundPainter({
    key: 'grassGroundPainter4',
    name: '풀밭땅 4',
    previewImageKey: 'grassGroundPainter4',
    hint: '조금 더 촘촘한 잔디 바닥 픽셀을 직접 칠합니다.'
  }),
  createGroundPainter({
    key: 'dirtGroundPainter1',
    name: '흙땅 1',
    previewImageKey: 'dirtGroundPainter1',
    hint: '기본 흙 바닥 픽셀을 직접 칠합니다.'
  }),
  createGroundPainter({
    key: 'dirtGroundPainter2',
    name: '흙땅 2',
    previewImageKey: 'dirtGroundPainter2',
    hint: '질감이 다른 흙 바닥 픽셀을 직접 칠합니다.'
  }),
  createGroundPainter({
    key: 'weedLightGroundPainter1',
    name: '잡초보통땅 1',
    previewImageKey: 'weedLightGroundPainter1',
    hint: '잡초가 적당히 있는 바닥 픽셀을 직접 칠합니다.'
  }),
  createGroundPainter({
    key: 'weedLightGroundPainter2',
    name: '잡초보통땅 2',
    previewImageKey: 'weedLightGroundPainter2',
    hint: '결이 다른 잡초보통땅 픽셀을 직접 칠합니다.'
  }),
  createGroundPainter({
    key: 'weedLightGroundPainter3',
    name: '잡초보통땅 3',
    previewImageKey: 'weedLightGroundPainter3',
    hint: '변형된 잡초보통땅 픽셀을 직접 칠합니다.'
  }),
  createGroundPainter({
    key: 'weedHeavyGroundPainter1',
    name: '잡초많은땅 1',
    previewImageKey: 'weedHeavyGroundPainter1',
    hint: '잡초가 많이 올라온 바닥 픽셀을 직접 칠합니다.'
  }),
  createGroundPainter({
    key: 'weedHeavyGroundPainter2',
    name: '잡초많은땅 2',
    previewImageKey: 'weedHeavyGroundPainter2',
    hint: '결이 다른 잡초많은땅 픽셀을 직접 칠합니다.'
  }),
  createGroundPainter({
    key: 'weedHeavyGroundPainter3',
    name: '잡초많은땅 3',
    previewImageKey: 'weedHeavyGroundPainter3',
    hint: '변형된 잡초많은땅 픽셀을 직접 칠합니다.'
  }),
  createFacility({
    key: 'wellFacility',
    name: '관정',
    width: 2,
    height: 2,
    type: 'well',
    previewSkin: 'well',
    previewImageKey: 'wellFacility',
    installGroup: 'waterInfra',
    fixedFootprint: true,
    hint: '지하수 취수를 담당하는 시설입니다.',
  }),
  createFacility({
    key: 'farmPowerElectric',
    name: '한전 농사용전기',
    width: 2,
    height: 2,
    type: 'facility',
    previewSkin: 'power',
    previewImageKey: 'farmPowerElectric',
    installGroup: 'powerInfra',
    placementKind: 'point',
    hint: '전력 인입용 소형 설비로 표시합니다.',
  }),
  createFacility({
    key: 'evChargerStation',
    name: 'EV 충전기',
    width: 2,
    height: 3,
    type: 'facility',
    previewSkin: 'power',
    previewImageKey: 'evChargerStation',
    installGroup: 'powerInfra',
    hint: '전기차 또는 이동 장비 충전용 설비입니다.',
  }),
  createFacility({
    key: 'autoRefillSystem',
    name: '자동급수시스템',
    width: 2,
    height: 2,
    type: 'facility',
    previewSkin: 'pump',
    previewImageKey: 'autoRefillSystem',
    installGroup: 'waterInfra',
    placementKind: 'point',
    hint: '물탱크와 연결되는 자동 보충 장치입니다.',
  }),
  createFacility({
    key: 'frostFan',
    name: '방상팬',
    width: 6,
    height: 5,
    type: 'facility',
    previewSkin: 'fan',
    previewImageKey: 'frostFan',
    installGroup: 'climate',
    hint: '저온 피해 완화를 위한 송풍 시설입니다.',
  }),
  createFacility({
    key: 'peTankSmall',
    name: 'PE 물탱크 1톤',
    width: 3,
    height: 3,
    type: 'water',
    previewSkin: 'tank',
    previewImageKey: 'peTankSmall',
    installGroup: 'waterStorage',
    hint: '1,000L 저장용 소형 물탱크입니다.',
  }),
  createFacility({
    key: 'peTankMedium',
    name: 'PE 물탱크 3톤',
    width: 4,
    height: 3,
    type: 'water',
    previewSkin: 'tank',
    previewImageKey: 'peTankMedium',
    installGroup: 'waterStorage',
    hint: '3,000L 저장용 중형 물탱크입니다.',
  }),
  createFacility({
    key: 'peTankLarge',
    name: 'PE 물탱크 5톤',
    width: 6,
    height: 3,
    type: 'water',
    previewSkin: 'tank',
    previewImageKey: 'peTankLarge',
    installGroup: 'waterStorage',
    hint: '5,000L 저장용 대형 물탱크입니다.',
  }),
  createFacility({
    key: 'peTankXl',
    name: 'PE 물탱크 10톤',
    width: 5,
    height: 4,
    type: 'water',
    previewSkin: 'tank',
    previewImageKey: 'peTankXl',
    installGroup: 'waterStorage',
    hint: '10톤급 저장 설비를 초대형 물탱크 이미지 기준으로 표시합니다.',
  }),
  createFacility({
    key: 'peTankXxl',
    name: 'PE 물탱크 20톤',
    width: 6,
    height: 6,
    type: 'water',
    previewSkin: 'tank',
    previewImageKey: 'peTankXxl',
    installGroup: 'waterStorage',
    hint: '20톤급 저장 설비를 초대형 물탱크 이미지 기준으로 표시합니다.',
  }),
  createFacility({
    key: 'panelWarehouse3',
    name: '판넬 창고 3평',
    width: 4,
    height: 3,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'panelWarehouse3',
    installGroup: 'warehouse',
    hint: '농약병과 자재, 공구를 보관하는 3평 판넬 창고입니다.',
  }),
  createFacility({
    key: 'panelWarehouse5',
    name: '판넬 창고 5평',
    width: 5,
    height: 4,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'panelWarehouse5',
    installGroup: 'warehouse',
    hint: '중형 자재와 소형 장비 보관에 적합한 5평 판넬 창고입니다.',
  }),
  createFacility({
    key: 'panelWarehouse8',
    name: '판넬 창고 8평',
    width: 6,
    height: 5,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'panelWarehouse8',
    installGroup: 'warehouse',
    hint: '자재 적재와 작업 동선 분리가 가능한 8평 판넬 창고입니다.',
  }),
  createFacility({
    key: 'goodsWarehouseSmall',
    name: '건창고 소형 (10평)',
    width: 4,
    height: 3,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'goodsWarehouseSmall',
    installGroup: 'warehouse',
    hint: '수확물과 일반 자재를 건조 상태로 보관하는 소형 건창고입니다.',
  }),
  createFacility({
    key: 'goodsWarehouseMedium',
    name: '건창고 중형 (20평)',
    width: 5,
    height: 4,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'goodsWarehouseMedium',
    installGroup: 'warehouse',
    hint: '보관량이 넉넉한 중형 건창고입니다.',
  }),
  createFacility({
    key: 'goodsWarehouseLarge',
    name: '건창고 대형 (35평)',
    width: 6,
    height: 5,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'goodsWarehouseLarge',
    installGroup: 'warehouse',
    hint: '대량 출하 전 물품 적재가 가능한 대형 건창고입니다.',
  }),
  createFacility({
    key: 'goodsWarehouseXl',
    name: '건창고 특대형 (50평)',
    width: 7,
    height: 6,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'goodsWarehouseXl',
    installGroup: 'warehouse',
    hint: '대형 차량 접근까지 고려한 초대형 건창고입니다.',
  }),
  createFacility({
    key: 'coldStorageMedium',
    name: '저온저장고 중형 (10평)',
    width: 15,
    height: 6,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'coldStorageMedium',
    installGroup: 'coldStorage',
    hint: '중간 규모 수확물 저장용 저온저장고입니다.',
    occupyPy: 10,
  }),
  createFacility({
    key: 'coldStorageLarge',
    name: '저온저장고 대형 (20평)',
    width: 18,
    height: 10,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'coldStorageLarge',
    installGroup: 'coldStorage',
    hint: '출하 전 대량 저장을 고려한 대형 저온저장고입니다.',
    occupyPy: 20,
  }),
  createFacility({
    key: 'coldStorageXl',
    name: '저온저장고 특대형 (30평)',
    width: 18,
    height: 15,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'coldStorageXl',
    installGroup: 'coldStorage',
    hint: '선별 전 대량 적재까지 고려한 초대형 저온저장고입니다.',
    occupyPy: 30,
  }),
  createFacility({
    key: 'coldStorageXxl',
    name: '저온저장고 초특대형 (40평)',
    width: 24,
    height: 15,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'coldStorageXxl',
    installGroup: 'coldStorage',
    hint: '상시 대량 출하까지 염두에 둔 특대형 저온저장고입니다.',
    occupyPy: 40,
  }),
  createFacility({
    key: 'machineShedSmall',
    name: '농기계 보관소 소형 (8평)',
    width: 12,
    height: 6,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'machineShedSmall',
    installGroup: 'machineStorage',
    hint: '예초기 등 소형 장비 위주로 쓰는 보관소 타입입니다.',
    occupyPy: 8,
  }),
  createFacility({
    key: 'machineShedMedium',
    name: '농기계 보관소 중형 (15평)',
    width: 15,
    height: 9,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'machineShedMedium',
    installGroup: 'machineStorage',
    hint: '방제 장비와 소형 운반 장비까지 수납 가능한 보관소 타입입니다.',
    occupyPy: 15,
  }),
  createFacility({
    key: 'machineShedLarge',
    name: '농기계 보관소 대형 (25평)',
    width: 25,
    height: 9,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'machineShedLarge',
    installGroup: 'machineStorage',
    hint: '중형 농기계까지 고려한 대형 보관소 타입입니다.',
    occupyPy: 25,
  }),
  createFacility({
    key: 'machineShedModern',
    name: '농기계 보관소 모던스타일',
    width: 15,
    height: 9,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'machineShedModern',
    installGroup: 'machineStorage',
    hint: '전면 출입과 장비 동선을 넉넉하게 잡은 모던형 농기계 보관소입니다.',
    occupyPy: 15,
  }),
  createFacility({
    key: 'goodsWarehouseVintage8',
    name: '옛날 건창고 8평형',
    width: 12,
    height: 6,
    type: 'shed',
    previewSkin: 'control',
    previewImageKey: 'goodsWarehouseVintage8',
    installGroup: 'warehouse',
    hint: '예전 농가 스타일의 8평형 건창고입니다.',
    occupyPy: 8,
  }),
  createFacility({
    key: 'concretePowerPole',
    name: '콘크리트 전봇대',
    width: 2,
    height: 1,
    type: 'facility',
    previewSkin: 'power',
    previewImageKey: 'concretePowerPole',
    installGroup: 'powerInfra',
    hint: '전력선 인입과 지지용 콘크리트 전봇대입니다.',
    occupyPy: 0,
  }),
  createFacility({
    key: 'parkingOpenLot',
    name: '주차 공간',
    width: 3,
    height: 3,
    type: 'apron',
    previewSkin: 'summer',
    previewImageKey: 'parkingOpenLot',
    installGroup: 'parking',
    hint: '차량과 이동 장비 대기를 위한 야외 주차 공간입니다.',
  }),
]);

function buildInstallableFromCatalogEntry(entry) {
  const nextEntry = {
    ...entry,
    previewImageName: String(
      entry?.previewImageName
      || fieldMap300FacilityImageNameForKey(entry?.previewImageKey || entry?.key)
      || ''
    )
  };
  if (nextEntry?.placementMode === 'paint-ground') {
    return createGroundPainter(nextEntry);
  }
  if (nextEntry?.placementMode === 'paint-tree') {
    return createPainter(nextEntry);
  }
  return createFacility(nextEntry);
}

function normalizeCatalogEntry(entry, index) {
  const fallbackKey = `customFacility${index + 1}`;
  return {
    ...entry,
    key: String(entry?.key || fallbackKey),
    name: String(entry?.name || `새 시설 ${index + 1}`),
    type: String(entry?.type || (entry?.placementMode === 'paint-ground' ? 'summer-ground' : 'facility')),
    previewSkin: String(
      entry?.previewSkin
      || (entry?.placementMode === 'paint-ground'
        ? (String(entry?.type || '') === 'winter-ground' ? 'winter' : 'summer')
        : 'facility')
    ),
    previewTone: String(entry?.previewTone || 'summer'),
    previewImageKey: String(entry?.previewImageKey || ''),
    previewImageName: String(
      entry?.previewImageName
      || fieldMap300FacilityImageNameForKey(entry?.previewImageKey || entry?.key)
      || ''
    ),
    hint: String(entry?.hint || ''),
    category: String(entry?.category || (entry?.placementMode ? 'painter' : 'facility')),
    installGroup: String(entry?.installGroup || 'general'),
    placementKind: String(entry?.placementKind || (entry?.placementMode ? 'paint' : 'area')),
    gameFacilityKey: String(entry?.gameFacilityKey || entry?.key || ''),
    placementMode: String(entry?.placementMode || ''),
    width: Math.max(1, Number(entry?.width || 1)),
    height: Math.max(1, Number(entry?.height || 1)),
    occupyPy: Math.max(0, Number(entry?.occupyPy || 0)),
    treeAge: entry?.treeAge == null ? undefined : Math.max(1, Math.min(6, Number(entry.treeAge) || 1)),
    fixedFootprint: true
  };
}

const runtimeOverrideItems = Array.isArray(FIELD_MAP_300_FACILITY_CATALOG_OVERRIDES?.items)
  ? [...FIELD_MAP_300_FACILITY_CATALOG_OVERRIDES.items]
  : [];

function buildCatalogEntriesFromOverrides(overrideSource = runtimeOverrideItems) {
  const overrideByKey = new Map(
    overrideSource
      .map((entry, index) => normalizeCatalogEntry(entry, index))
      .map((entry) => [entry.key, entry])
  );

  return [
    ...STATIC_FIELD_MAP_300_INSTALLABLE_FACILITIES.map((entry, index) => {
      const normalizedBase = normalizeCatalogEntry(entry, index);
      const override = overrideByKey.get(normalizedBase.key);
      return Object.freeze(normalizeCatalogEntry(override ? { ...normalizedBase, ...override } : normalizedBase, index));
    }),
    ...[...overrideByKey.values()]
      .filter((entry) => !STATIC_FIELD_MAP_300_INSTALLABLE_FACILITIES.some((base) => String(base?.key || '') === entry.key))
      .map((entry, index) => Object.freeze(normalizeCatalogEntry(entry, STATIC_FIELD_MAP_300_INSTALLABLE_FACILITIES.length + index)))
  ];
}

function syncInstallableRuntime(catalogEntries) {
  FIELD_MAP_300_INSTALLABLE_CATALOG.splice(0, FIELD_MAP_300_INSTALLABLE_CATALOG.length, ...catalogEntries);

  const nextFacilities = catalogEntries.map((entry) => Object.freeze(buildInstallableFromCatalogEntry(entry)));
  FIELD_MAP_300_INSTALLABLE_FACILITIES.splice(0, FIELD_MAP_300_INSTALLABLE_FACILITIES.length, ...nextFacilities);

  Object.keys(FIELD_MAP_300_INSTALLABLE_BY_KEY).forEach((key) => {
    delete FIELD_MAP_300_INSTALLABLE_BY_KEY[key];
  });
  nextFacilities.forEach((facility) => {
    FIELD_MAP_300_INSTALLABLE_BY_KEY[facility.key] = facility;
  });
}

function rebuildInstallableRuntime(overrideSource = runtimeOverrideItems) {
  const nextCatalogEntries = buildCatalogEntriesFromOverrides(overrideSource);
  syncInstallableRuntime(nextCatalogEntries);
  return nextCatalogEntries;
}

export const FIELD_MAP_300_INSTALLABLE_CATALOG = [];
export const FIELD_MAP_300_INSTALLABLE_FACILITIES = [];
export const FIELD_MAP_300_INSTALLABLE_BY_KEY = {};

export function applyFieldMap300CatalogOverrideRuntime(entry) {
  const normalizedEntry = normalizeCatalogEntry(entry, runtimeOverrideItems.length);
  const existingIndex = runtimeOverrideItems.findIndex((item) => String(item?.key || '') === normalizedEntry.key);
  if (existingIndex >= 0) runtimeOverrideItems[existingIndex] = normalizedEntry;
  else runtimeOverrideItems.push(normalizedEntry);
  rebuildInstallableRuntime(runtimeOverrideItems);
  return FIELD_MAP_300_INSTALLABLE_BY_KEY[normalizedEntry.key] || null;
}

rebuildInstallableRuntime(runtimeOverrideItems);

export const FIELD_MAP_300_INSTALL_GROUPS = Object.freeze([
  ['paint', '직접 그리기'],
  ['waterInfra', '급수 기반시설'],
  ['powerInfra', '전력 기반시설'],
  ['climate', '기상 대응시설'],
  ['waterStorage', '물 저장시설'],
  ['warehouse', '일반 창고'],
  ['coldStorage', '저온 저장'],
  ['machineStorage', '농기계 보관'],
  ['parking', '주차 공간'],
  ['general', '기타'],
]);
