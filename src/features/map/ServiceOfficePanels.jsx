import React from 'react';
import { MapEntryModal } from './MapLocationPanels';
import WarehouseHarvestSlotPanel from '../storage/WarehouseHarvestSlotPanel';
import { HarvestBoxGrid } from '../storage/WarehouseSharedHarvestSlotCard';
import { buildHarvestStorageSlotToneArray } from '../storage/storageSlotModel';
import { harvestPalletDisplayBoxIndexOf } from '../harvest/harvestPalletGrid';
import { SMALL_APC_SORTING_IDLE_GAP_MS } from './smallApcState';
import ANIMATION_LAB_APPLE_STEM_REMOVAL_HTML from '../../data/animationLabAppleStemRemoval.html?raw';

const SMALL_APC_SORTING_MACHINE_SLOTS = Object.freeze(
  Array.from({ length: 2 }, (_, index) => ({
    key: `sorter-${index + 1}`,
    lineNo: index + 1,
    label: `선별기 ${index + 1}`,
    state: '대기',
    detail: '작업 배정 전'
  }))
);

const SMALL_APC_COLD_STORAGE_TABS = Object.freeze([
  {
    key: 'building-1',
    label: '1동',
    fullLabel: '1동 하차동',
    shortRoleLabel: '하차동',
    summary: '하차된 물량을 잠시 보관하며 선별 순서를 기다리는 공간입니다.',
    actionHint: '선별 순서가 되면 2동 선별완료동으로 이동합니다.',
  },
  {
    key: 'building-2',
    label: '2동',
    fullLabel: '2동 선별완료동',
    shortRoleLabel: '선별완료동',
    summary: '선별이 끝난 물량을 등급별로 정리해 보관하는 공간입니다.',
    actionHint: '여기 물량은 포장 또는 출고 대상으로 이어집니다.',
  },
  {
    key: 'building-3',
    label: '3동',
    fullLabel: '3동 출고동',
    shortRoleLabel: '출고동',
    summary: '출고가 확정된 물량을 모아 상차 전까지 대기시키는 공간입니다.',
    actionHint: '출고 주차칸 상차 전 최종 대기 구역입니다.',
  },
]);

const SMALL_APC_STAFF_MEMBERS = Object.freeze([
  '김현우',
  '박지훈',
  '이서준',
  '최민재',
  '정도윤',
  '강지후',
  '한예준',
  '오수민',
  '윤하람',
  '신가온',
  '문지안',
  '배서윤',
  '임채원',
  '조하은',
  '백나리',
]);

const SMALL_APC_STAFF_ROLE_LABELS = Object.freeze([
  '하차 반장',
  '입고 확인',
  '선별 투입',
  '라인 보조',
  '팔레트 이동',
]);

const CONSTRUCTION_FACILITY_IMAGE_MODULES = {
  ...import.meta.glob(
    '../../assets/images/시설/*.{png,jpg,jpeg,webp,avif}',
    {
      eager: true,
      import: 'default'
    }
  ),
  ...import.meta.glob(
    '../../assets/images/시설/시설아아콘이미지/토지시설/*.{png,jpg,jpeg,webp,avif}',
    {
      eager: true,
      import: 'default'
    }
  ),
  ...import.meta.glob(
    '../../assets/images/시설/시설아아콘이미지/일반시설/*.{png,jpg,jpeg,webp,avif}',
    {
      eager: true,
      import: 'default'
    }
  ),
  ...import.meta.glob(
    '../../assets/images/하우징/**/*.{png,jpg,jpeg,webp,avif}',
    {
      eager: true,
      import: 'default'
    }
  )
};

const CONSTRUCTION_FACILITY_IMAGE_BY_NAME = Object.freeze(
  Object.fromEntries(
    Object.entries(CONSTRUCTION_FACILITY_IMAGE_MODULES).map(([filePath, url]) => [
      String(filePath || '').split('/').pop() || '',
      String(url || '')
    ])
  )
);

const CONSTRUCTION_FACILITY_IMAGE_ENTRY_BY_NAME = Object.freeze(
  Object.fromEntries(
    Object.entries(CONSTRUCTION_FACILITY_IMAGE_MODULES).map(([filePath, url]) => [
      String(filePath || '').split('/').pop() || '',
      { filePath: String(filePath || ''), url: String(url || '') }
    ])
  )
);

const CONSTRUCTION_FACILITY_IMAGE_NAME_BY_KEY = Object.freeze({
  wellFacility: '관정.png',
  farmPowerElectric: '한전농사용전기.png',
  autoRefillSystem: '자동급수시스템.png',
  irrigationControlSystem: '관수제어시스템.png',
  frostFan: '방상팬.png',
  peTankSmall: 'PE물탱크 1톤.png',
  peTankMedium: 'PE물탱크 3톤.png',
  peTankLarge: 'PE물탱크 5톤.png',
  peTankXl: 'PE물탱크 10톤.png',
  peTankXxl: 'PE 물탱크 20톤.png',
  evChargerStation: 'EV충전기.png',
  openStorage3000Py: '노지창고.png',
  panelWarehouse3: '판넬창고3평.png',
  panelWarehouse5: '판넬창고5평.png',
  panelWarehouse8: '판넬창고8평.png',
  appleSortingLineSmall: '소형선별기.png',
  appleSortingLineMedium: '중형선별기.png',
  appleSortingLineLarge: '대형 선별기.png',
  smallApcWorkbenchTable: '작업 테이블.png',
  smallApcPackingWorkbenchTable: '소형APC 사과 포장작업대.png',
  goodsWarehouseSmall: '건창고 소형.png',
  goodsWarehouseMedium: '건창고 중형.png',
  goodsWarehouseLarge: '건창고 대형.png',
  goodsWarehouseXl: '건창고 특대형.png',
  coldStorageMedium: '저온저장고 소형.png',
  coldStorageLarge: '저온저장고 중형.png',
  coldStorageXl: '저온저장고 대형.png',
  coldStorageXxl: '저온저장고 특대형.png',
  coldStorageMax: '저온저장고 초특대형.png',
  machineShedSmall: '농기계 보관소 소형.png',
  machineShedSmallPlus: '농기계 보관소 소형.png',
  machineShedMedium: '농기계 보관소 중형.png',
  machineShedMediumPlus: '농기계 보관소 중형.png',
  machineShedLarge: '농기계 보관소 대형.png',
  machineShedLargePlus: '농기계 보관소 특대형.png',
  machineShedXl: '농기계 보관소 특대형.png',
  farmHut6Basic: '농막 6평 기본형.png',
  farmHut6Insulated: '농막 6평 단열형.png',
  farmContainer20Used: '중고 컨테이너 하우스 4평.png',
  sandwichPanelDorm4: '조립식 샌드위치패널 숙소 4평.png',
  usedSiteOffice5: '중고 현장사무실 5평.png',
  farmContainer40Office: '컨테이너 관리동 8평.png',
  panelHouse9: '조립식 경량하우스 9평.png',
  lightWood12: '경량목구조 12평.png',
  modular15Value: '모듈러 15평 실속형.png',
  mobileHome13: '이동식 주택 13평.png',
  steelOfficeLounge: '철골 관리동(사무+휴게).png',
  dualContainerLinked: '듀얼 컨테이너 하우스 12평.png',
  modular25Standard: '모듈러 25평 스탠다드.png',
  woodHouse30: '목조주택 30평.png',
  smartFarmResidence: '스마트팜 관리 주거동.png',
  premiumCountry35: '프리미엄 전원주택 35평.png',
  hanokHybrid28: '한옥 하이브리드 28평.png',
  passiveHouse30: '패시브하우스 30평.png',
  villaFarm40: '빌라형 농장주택 40평.png',
  estateFarm55: '대저택형 농장 레지던스 55평.png'
});

const SMALL_APC_STEM_REMOVAL_CARD_SRC_DOC = String(ANIMATION_LAB_APPLE_STEM_REMOVAL_HTML || '')
  .replace(
    '</head>',
    `<style>
    html, body {
      width: 100% !important;
      height: 100% !important;
      min-height: 0 !important;
      overflow: hidden !important;
      background: transparent !important;
    }
    body {
      display: block !important;
      background: transparent !important;
    }
    .wrap {
      width: 100% !important;
      height: 100% !important;
      display: grid !important;
      place-items: end center !important;
      padding: 0 !important;
      gap: 0 !important;
    }
    .apple-job {
      width: 320px !important;
      height: 180px !important;
      transform: translateX(6px) translateY(10px) scale(0.54);
      transform-origin: center bottom;
    }
    </style></head>`
  )
  .replace(
    'const playAnimation = () => {',
    'const playAnimation = () => { window.clearTimeout(window.__smallApcStemRemovalDoneTimer);'
  )
  .replace(
    'setTimeout(() => {',
    'window.__smallApcStemRemovalDoneTimer = setTimeout(() => {'
  )
  .replace(
    'playAnimation();',
    'playAnimation(); window.setInterval(playAnimation, WORK_TIME_MS * WORK_LOOPS + 220);'
  );

export function constructionFacilityImageSrcOf(facilityKey) {
  const imageName = CONSTRUCTION_FACILITY_IMAGE_NAME_BY_KEY[String(facilityKey || '')] || '';
  return imageName ? String(CONSTRUCTION_FACILITY_IMAGE_BY_NAME[imageName] || '') : '';
}

export function constructionFacilityInteriorImageSrcOf(facilityKey, timeOfDay = 'day', options = {}) {
  const exteriorImageName = CONSTRUCTION_FACILITY_IMAGE_NAME_BY_KEY[String(facilityKey || '')] || '';
  if (!exteriorImageName) return '';
  const exteriorEntry = CONSTRUCTION_FACILITY_IMAGE_ENTRY_BY_NAME[exteriorImageName] || null;
  const exteriorFilePath = String(exteriorEntry?.filePath || '');
  const exteriorFolderPath = exteriorFilePath.includes('/')
    ? exteriorFilePath.slice(0, exteriorFilePath.lastIndexOf('/'))
    : '';
  const month = Math.max(1, Math.min(12, Math.floor(Number(options?.month) || 0)));
  const seasonKey = [3, 4, 5].includes(month)
    ? 'spring'
    : [6, 7, 8].includes(month)
      ? 'summer'
      : [9, 10, 11].includes(month)
        ? 'fall'
        : month > 0
          ? 'winter'
          : '';
  const isNight = String(timeOfDay || 'day') === 'night';
  const dayInteriorImageName = exteriorImageName.replace(/\.png$/i, ' 내부 낮.png');
  const seasonalInteriorImageNames = (() => {
    const weatherName = String(options?.weatherName || '');
    const rainSuffix = /비|소나기|장마|폭우|이슬비|봄비|가을비|우박/.test(weatherName) ? ['우천', '비'] : [];
    if (seasonKey === 'spring') return isNight ? [...rainSuffix.map((prefix) => `${prefix} 밤.png`), '춘계 밤.png', '봄 밤.png', '밤.png'] : [...rainSuffix.map((prefix) => `${prefix} 낮.png`), '춘계 낮.png', '봄 낮.png', dayInteriorImageName];
    if (seasonKey === 'summer') return isNight ? [...rainSuffix.map((prefix) => `${prefix} 밤.png`), '하계 밤.png', '여름 밤.png', '밤.png'] : [...rainSuffix.map((prefix) => `${prefix} 낮.png`), '하계 낮.png', '여름 낮.png', dayInteriorImageName];
    if (seasonKey === 'fall') return isNight ? [...rainSuffix.map((prefix) => `${prefix} 밤.png`), '추계 밤.png', '가을 밤.png', '밤.png'] : [...rainSuffix.map((prefix) => `${prefix} 낮.png`), '추계 낮.png', '가을 낮.png', dayInteriorImageName];
    if (seasonKey === 'winter') {
      const snowSuffix = /눈|대설|폭설|진눈깨비/.test(weatherName) ? ['동계 눈', '겨울 눈'] : [];
      return isNight
        ? [...snowSuffix.map((prefix) => `${prefix} 밤.png`), '동계 밤.png', '겨울 밤.png', '밤.png']
        : [...snowSuffix.map((prefix) => `${prefix} 낮.png`), '동계 낮.png', '겨울 낮.png', dayInteriorImageName];
    }
    return isNight ? ['밤.png'] : [dayInteriorImageName];
  })();
  for (const interiorImageName of seasonalInteriorImageNames) {
    if (exteriorFolderPath) {
      const interiorPath = `${exteriorFolderPath}/${interiorImageName}`;
      const interiorSrc = CONSTRUCTION_FACILITY_IMAGE_MODULES[interiorPath];
      if (interiorSrc) return String(interiorSrc || '');
    }
    const globalInteriorSrc = CONSTRUCTION_FACILITY_IMAGE_BY_NAME[interiorImageName];
    if (globalInteriorSrc) return String(globalInteriorSrc || '');
  }
  if (exteriorFolderPath) {
    const dayInteriorSrc = CONSTRUCTION_FACILITY_IMAGE_MODULES[`${exteriorFolderPath}/${dayInteriorImageName}`];
    if (dayInteriorSrc) return String(dayInteriorSrc || '');
  }
  const interiorImageName = exteriorImageName.replace(/\.png$/i, ' 내부 낮.png');
  return String(CONSTRUCTION_FACILITY_IMAGE_BY_NAME[interiorImageName] || '');
}

function smallApcAssignedMembersOf(facilityProfile = null) {
  return (Array.isArray(facilityProfile?.assignedMembers) ? facilityProfile.assignedMembers : [])
    .filter((member) => String(member?.statusKey || member?.status || '').trim() === 'working');
}

function SmallApcStaffDeploymentPanel({
  members = [],
  emptyLabel = '배치된 직원 없음',
}) {
  const staffMembers = Array.isArray(members) ? members.filter(Boolean) : [];
  return (
    <div className="small-apc-receiving-staff-strip">
      <div className="small-apc-receiving-staff-panel__head">
        <strong>직원투입 현황</strong>
        <span>{`${staffMembers.length}명`}</span>
      </div>
      {staffMembers.length ? (
        <div className="small-apc-receiving-staff-panel__list">
          {staffMembers.map((member, index) => (
            <div
              key={`small-apc-staff-deployment-${String(member?.name || 'staff')}-${index + 1}`}
              className="small-apc-receiving-staff-panel__card"
            >
              <div className="small-apc-receiving-staff-panel__item">
                <span className="small-apc-receiving-staff-panel__emoji" aria-hidden="true">🧑‍🔧</span>
                <span className="small-apc-receiving-staff-panel__text">
                  {`${String(member?.name || '직원')} · ${String(member?.statusLabel || '근무중')}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="small-apc-receiving-staff-panel__empty">{emptyLabel}</div>
      )}
    </div>
  );
}

export function TownOfficeLandBankPanelUnified({
  className = 'confirm-modal confirm-modal--labor-office',
  bankLands,
  money,
  landGroups,
  landTab,
  onSelectLandTab,
  currentGroup,
  won,
  onBuyLand,
  centerTileImageSrc,
  centerTileImageView,
  bankLandMapNodes,
  selectedBankLand,
  selectedBankLandId,
  onMapClick,
  slopeBandLabelOf,
  viewportRef,
  isDragging = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  mapStageStyle,
  onBack,
  onClose
}) {
  return (
    <div className={`${className} land-bank-panel--angular`.trim()}>
      <div className="panel__header">
        <div>
          <div className="panel__eyebrow">농지 은행</div>
          <h2>추가 토지 매입</h2>
        </div>
        <div className="inline-summary">
          <div className="summary-chip"><span>가용 토지</span><strong>{bankLands.length}개</strong></div>
          <div className="summary-chip"><span>보유 자금</span><strong>{won(money)}</strong></div>
        </div>
      </div>
      <div className="focus-tabs">
        {landGroups.map((g) => (
          <button key={g.key} className={`focus-tab focus-tab--farm-main-animate ${landTab === g.key ? 'focus-tab--active' : ''}`} onClick={() => onSelectLandTab(g.key)}>
            {g.label}
          </button>
        ))}
      </div>
      <div className="inline-summary" style={{ marginTop: 12 }}>
        <div className="summary-chip"><span>평수 범위</span><strong>{currentGroup.minPy}~{currentGroup.maxPy}평</strong></div>
        <div className="summary-chip"><span>판매 물량</span><strong>{currentGroup.count}개 중 {bankLands.length}개</strong></div>
      </div>
      {bankLands.length ? (
        <div className="land-select-layout" style={{ marginTop: 14 }}>
          <div className="land-map-panel">
            <div className="land-map-stage-wrap">
              <div
                ref={viewportRef}
                className={`land-map-stage ${isDragging ? 'is-dragging' : ''}`.trim()}
                style={mapStageStyle}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onWheelCapture={onWheel}
                onWheel={onWheel}
                onClick={onMapClick}
              >
                {centerTileImageView ? (
                  <img
                    src={centerTileImageSrc}
                    alt=""
                    className="land-map-stage__center-image"
                    draggable="false"
                    style={{
                      left: `${Number(centerTileImageView.x) || 0}px`,
                      top: `${Number(centerTileImageView.y) || 0}px`,
                      width: `${Math.max(0, Number(centerTileImageView.width) || 0)}px`,
                      height: `${Math.max(0, Number(centerTileImageView.height) || 0)}px`
                    }}
                  />
                ) : null}
                <div className="land-map-stage__backdrop" />
                <div className="land-map-stage__corner-badge">토지를 눌러 선택</div>
                {(Array.isArray(bankLandMapNodes) ? bankLandMapNodes : []).map((land) => (
                  <div
                    key={land.id}
                    className={`land-map-node ${selectedBankLandId === land.id ? 'land-map-node--selected' : ''} ${land.overBudget ? 'land-map-node--over' : 'land-map-node--open'}`}
                    style={{
                      left: `${land.p.x}px`,
                      top: `${land.p.y}px`,
                      width: `${land.size}px`,
                      height: `${land.size}px`,
                      zIndex: selectedBankLandId === land.id ? 3 : 1
                    }}
                  >
                    <span>{land.id}</span>
                  </div>
                ))}
              </div>
              <div className="land-map-stage__footer">
                <span>도로와 하천, 마을 위치는 접근성 감각을 잡기 위한 탐색용 표시입니다.</span>
                <strong>{selectedBankLand ? `${selectedBankLand.name} 확인 중` : '아직 필지를 고르지 않았습니다'}</strong>
              </div>
            </div>
          </div>
          <aside className="land-side-panel">
            <div className="land-side-panel__summary">
              <div className="land-side-panel__summary-top">
                <div>
                  <span>선택한 필지</span>
                  <strong>{selectedBankLand ? selectedBankLand.name : '아직 선택하지 않음'}</strong>
                </div>
                {selectedBankLand ? (
                  <em className={`land-side-panel__status ${selectedBankLand.price > money ? 'land-side-panel__status--over' : 'land-side-panel__status--open'}`}>
                    {selectedBankLand.price > money ? '자금 부족' : '매입 가능'}
                  </em>
                ) : null}
              </div>
              <p>{selectedBankLand ? `${selectedBankLand.py}평 · 경사 ${Math.max(0, Number(selectedBankLand?.slopeDeg) || 0)}도 · 지하수 ${Math.round(Math.max(0, Number(selectedBankLand?.groundwaterTonsBase) || 0)).toLocaleString()}톤` : '지도에서 토지를 누르면 이곳에 필지 정보가 정리됩니다.'}</p>
            </div>
            <div className="land-side-panel__detail">
              {selectedBankLand ? (
                <>
                  <div className="land-side-panel__money-grid">
                    <div className="land-side-panel__money-card">
                      <span>매입가</span>
                      <strong>{won(selectedBankLand.price)}</strong>
                    </div>
                    <div className="land-side-panel__money-card">
                      <span>매입 후 잔액</span>
                      <strong>{won(Math.max(0, money - selectedBankLand.price))}</strong>
                    </div>
                    <div className="land-side-panel__money-card land-side-panel__money-card--wide">
                      <span>경사 등급</span>
                      <strong>{slopeBandLabelOf(selectedBankLand.slopeDeg)}</strong>
                    </div>
                  </div>
                  <div className="land-side-panel__facts land-side-panel__facts--boxed">
                    <div className="land-fact-row"><span>평수</span><strong>{Math.max(0, Number(selectedBankLand?.py) || 0).toLocaleString()}평</strong></div>
                    <div className="land-fact-row"><span>지하수 기본량</span><strong>{Math.round(Math.max(0, Number(selectedBankLand?.groundwaterTonsBase) || 0)).toLocaleString()}톤</strong></div>
                    <div className="land-fact-row"><span>지하수 일 충전량</span><strong>{Math.round(Math.max(0, Number(selectedBankLand?.groundwaterDailyRechargeLiters) || 0)).toLocaleString()}L</strong></div>
                    <div className="land-fact-row"><span>경사도</span><strong>{Math.max(0, Number(selectedBankLand?.slopeDeg) || 0)}도</strong></div>
                  </div>
                  <div className="footer-actions" style={{ marginTop: 14 }}>
                    <button
                      className="button button--ghost day-transition-animate-button"
                      disabled={selectedBankLand.price > money}
                      title={selectedBankLand.price > money ? '자금이 부족합니다.' : ''}
                      onClick={() => onBuyLand(selectedBankLand.id)}
                    >
                      매입
                    </button>
                  </div>
                </>
              ) : (
                <div className="land-side-panel__empty">
                  <strong>필지를 먼저 골라 주세요</strong>
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : (
        <div className="empty-box">해당 구간에서 매입 가능한 토지가 없습니다.</div>
      )}
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

export function TownOfficeLandBankPanel({
  className = 'confirm-modal confirm-modal--labor-office',
  bankLands,
  money,
  landGroups,
  landTab,
  onSelectLandTab,
  currentGroup,
  won,
  onBuyLand,
  viewportWidth,
  viewportHeight,
  centerTileImageSrc,
  centerTileImageView,
  bankLandMapNodes,
  selectedBankLand,
  selectedBankLandId,
  onSelectBankLand,
  slopeBandLabelOf,
  viewportRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  mapStageStyle,
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="panel__header">
        <div><div className="panel__eyebrow">농지은행</div><h2>추가 토지 매입</h2></div>
        <div className="inline-summary">
          <div className="summary-chip"><span>가용 토지</span><strong>{bankLands.length}개</strong></div>
          <div className="summary-chip"><span>보유 자금</span><strong>{won(money)}</strong></div>
          </div>
      </div>
      <div className="focus-tabs">
        {landGroups.map((g) => (
          <button key={g.key} className={`focus-tab focus-tab--farm-main-animate ${landTab === g.key ? 'focus-tab--active' : ''}`} onClick={() => onSelectLandTab(g.key)}>
            {g.label}
          </button>
        ))}
      </div>
      <div className="inline-summary" style={{ marginTop: 12 }}>
        <div className="summary-chip"><span>평수 범위</span><strong>{currentGroup.minPy}~{currentGroup.maxPy}평</strong></div>
        <div className="summary-chip"><span>판매 물량</span><strong>{currentGroup.count}개 중 {bankLands.length}개</strong></div>
      </div>
      {bankLands.length ? (
        <div className="two-col" style={{ marginTop: 14, alignItems: 'start' }}>
          <div className="land-map-stage-wrap">
            <div
              ref={viewportRef}
              className="land-map-stage"
              style={mapStageStyle}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheelCapture={onWheel}
              onWheel={onWheel}
            >
              <svg className="land-map-stage__svg" viewBox={`0 0 ${viewportWidth} ${viewportHeight}`} preserveAspectRatio="none" aria-label="전체지도 기반 추가 토지 선택">
                <rect x="0" y="0" width={viewportWidth} height={viewportHeight} className="land-map-stage__svg-base" />
                {centerTileImageView ? (
                  <image
                    href={centerTileImageSrc}
                    x={Number(centerTileImageView.x) || 0}
                    y={Number(centerTileImageView.y) || 0}
                    width={Math.max(0, Number(centerTileImageView.width) || 0)}
                    height={Math.max(0, Number(centerTileImageView.height) || 0)}
                    preserveAspectRatio="none"
                    className="external-map-viewer__center-image is-ready"
                  />
                ) : null}
              </svg>
              <div className="land-map-stage__backdrop" />
              <div className="land-map-stage__corner-badge">토지를 눌러 선택</div>
              {(Array.isArray(bankLandMapNodes) ? bankLandMapNodes : []).map((land) => (
                <button
                  key={land.id}
                  type="button"
                  className={`land-map-node ${selectedBankLandId === land.id ? 'land-map-node--selected' : ''} ${land.overBudget ? 'land-map-node--over' : 'land-map-node--open'}`}
                  style={{
                    left: `${land.p.x}px`,
                    top: `${land.p.y}px`,
                    width: `${land.size}px`,
                    height: `${land.size}px`,
                    zIndex: selectedBankLandId === land.id ? 3 : 1
                  }}
                  onClick={() => onSelectBankLand(land.id)}
                  title={`${land.name} · ${land.py}평`}
                >
                  <span>{land.id}</span>
                </button>
              ))}
              <div className="land-map-stage__footer">
                <span>{`${currentGroup.label} 매물 ${bankLands.length}개`}</span>
                <strong>{selectedBankLand ? `${selectedBankLand.name} 확인 중` : '아직 필지를 고르지 않았습니다'}</strong>
              </div>
            </div>
          </div>
          <aside className="land-side-panel">
            <div className="land-side-panel__summary">
              <div className="land-side-panel__summary-top">
                <div>
                  <span>선택한 필지</span>
                  <strong>{selectedBankLand ? selectedBankLand.name : '아직 선택하지 않음'}</strong>
                </div>
                {selectedBankLand ? (
                  <em className={`land-side-panel__status ${selectedBankLand.price > money ? 'land-side-panel__status--over' : 'land-side-panel__status--open'}`}>
                    {selectedBankLand.price > money ? '자금 부족' : '매입 가능'}
                  </em>
                ) : null}
              </div>
              <p>{selectedBankLand ? `${selectedBankLand.py}평 · 경사 ${Math.max(0, Number(selectedBankLand?.slopeDeg) || 0)}도 · 지하수 ${Math.round(Math.max(0, Number(selectedBankLand?.groundwaterTonsBase) || 0)).toLocaleString()}톤` : '지도에서 토지를 누르면 이곳에 필지 정보가 정리됩니다.'}</p>
            </div>
            <div className="land-side-panel__detail">
              {selectedBankLand ? (
                <>
                  <div className="land-side-panel__money-grid">
                    <div className="land-side-panel__money-card">
                      <span>매입가</span>
                      <strong>{won(selectedBankLand.price)}</strong>
                    </div>
                    <div className="land-side-panel__money-card">
                      <span>매입 후 잔액</span>
                      <strong>{won(Math.max(0, money - selectedBankLand.price))}</strong>
                    </div>
                    <div className="land-side-panel__money-card land-side-panel__money-card--wide">
                      <span>경사 등급</span>
                      <strong>{slopeBandLabelOf(selectedBankLand.slopeDeg)}</strong>
                    </div>
                  </div>
                  <div className="land-side-panel__facts land-side-panel__facts--boxed">
                    <div className="land-fact-row"><span>평수</span><strong>{Math.max(0, Number(selectedBankLand?.py) || 0).toLocaleString()}평</strong></div>
                    <div className="land-fact-row"><span>지하수 기본량</span><strong>{Math.round(Math.max(0, Number(selectedBankLand?.groundwaterTonsBase) || 0)).toLocaleString()}톤</strong></div>
                    <div className="land-fact-row"><span>지하수 일 충전량</span><strong>{Math.round(Math.max(0, Number(selectedBankLand?.groundwaterDailyRechargeLiters) || 0)).toLocaleString()}L</strong></div>
                    <div className="land-fact-row"><span>경사도</span><strong>{Math.max(0, Number(selectedBankLand?.slopeDeg) || 0)}도</strong></div>
                  </div>
                  <div className="footer-actions" style={{ marginTop: 14 }}>
                    <button
                      className="button button--ghost day-transition-animate-button"
                      disabled={selectedBankLand.price > money}
                      title={selectedBankLand.price > money ? '자금이 부족합니다.' : ''}
                      onClick={() => onBuyLand(selectedBankLand.id)}
                    >
                      매입
                    </button>
                  </div>
                </>
              ) : (
                <div className="land-side-panel__empty">
                  <strong>필지를 먼저 골라 주세요</strong>
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : (
        <div className="empty-box">해당 구간에서 매입 가능한 토지가 없습니다.</div>
      )}
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function LaborOfficePanel({
  className = 'confirm-modal confirm-modal--labor-office',
  crewTypeKeys,
  crewTypeNameOf,
  crewAvailabilityPreviewByType,
  crewTypes,
  crewDraft,
  setCrewDraft,
  minCrewStartDate,
  minCrewStartDay,
  won,
  rentCrew,
  crewRentsVisible,
  normalizeCrewRent,
  day,
  longDate,
  payApprovedCrewRent,
  approveRejectedCrewRent,
  cancelCrewRent,
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="panel__header">
        <div><div className="panel__eyebrow">인력사무소</div><h2>인력 대여</h2></div>
        <div className="inline-summary">
          {crewTypeKeys.map((crewKey) => (
            <div key={`map-crew-summary-${crewKey}`} className="summary-chip">
              <span>{`${crewTypeNameOf(crewKey)}(${longDate(crewAvailabilityPreviewByType?.[crewKey]?.day || minCrewStartDay)} 기준)`}</span>
              <strong>{`남음 ${Math.max(0, Number(crewAvailabilityPreviewByType?.[crewKey]?.remaining) || 0)}명`}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="option-grid">
        {Object.values(crewTypes).map((crew) => (
          <div key={crew.key} className="option-card">
            <div className="meter__hint" style={{ marginBottom: 6 }}>
              {`${longDate(crewAvailabilityPreviewByType?.[crew.key]?.day || minCrewStartDay)} 시작 기준 남은 예약 가능 인원 ${Math.max(0, Number(crewAvailabilityPreviewByType?.[crew.key]?.remaining) || 0)}명`}
            </div>
            <div className="option-card__row"><strong>{crew.name}</strong><span>일 {won(crew.wage)}/인</span></div>
            <div className="option-card__meta">인원</div>
            <input
              className="text-input"
              type="number"
              min={1}
              value={crewDraft[crew.key].count}
              onChange={(e) =>
                setCrewDraft((prev) => ({
                  ...prev,
                  [crew.key]: { ...prev[crew.key], count: e.target.value }
                }))
              }
            />
            <div className="inline-summary" style={{ marginTop: 10 }}>
              <div style={{ minWidth: 190 }}>
                <div className="option-card__meta">시작일</div>
                <input
                  className="text-input"
                  type="date"
                  value={crewDraft[crew.key].start}
                  min={minCrewStartDate}
                  onChange={(e) =>
                    setCrewDraft((prev) => ({
                      ...prev,
                      [crew.key]: { ...prev[crew.key], start: e.target.value }
                    }))
                  }
                />
              </div>
              <div style={{ minWidth: 190 }}>
                <div className="option-card__meta">종료일</div>
                <input
                  className="text-input"
                  type="date"
                  value={crewDraft[crew.key].end}
                  min={crewDraft[crew.key].start}
                  onChange={(e) =>
                    setCrewDraft((prev) => ({
                      ...prev,
                      [crew.key]: { ...prev[crew.key], end: e.target.value }
                    }))
                  }
                />
              </div>
            </div>
            <div className="footer-actions" style={{ marginTop: 10 }}>
              <button
                className="button button--ghost day-transition-animate-button"
                onClick={() => rentCrew(crew.key)}
                disabled={(Number(crewAvailabilityPreviewByType?.[crew.key]?.remaining) || 0) <= 0}
              >
                대여 등록
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="panel__header" style={{ marginTop: 14 }}>
        <div><h2>대여 목록</h2></div>
      </div>
      {crewRentsVisible.length ? (
        <div className="storage-list labor-rent-list">
          {crewRentsVisible
            .slice()
            .reverse()
            .map((rent) => {
              const normalized = normalizeCrewRent(rent);
              const status =
                normalized.status === 'pending'
                  ? '심사중'
                  : normalized.status === 'rejected'
                    ? '미승인'
                    : day < normalized.startDay
                      ? '확정됨'
                      : day > normalized.endDay
                        ? '종료'
                        : '진행 중';
              return (
                <div key={rent.id} className="storage-card labor-rent-card">
                  <div className="storage-card__head">
                    <strong>{crewTypes[normalized.type].name} {normalized.count}명</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{status}</span>
                      {normalized.status === 'approved' && day < normalized.startDay && normalized.paymentPending ? (
                        <button className="button button--primary day-transition-animate-button" onClick={() => payApprovedCrewRent(normalized.id)}>
                          결제하기
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="storage-card__meta">
                    기간 {longDate(normalized.startDay)} ~ {longDate(normalized.endDay)} / 일 {won(normalized.wage)} /인
                  </div>
                  {normalized.status === 'pending' ? (
                    <div className="meter__hint">심사 예정일 {longDate(normalized.reviewDay)} (1~2일 내 결과)</div>
                  ) : null}
                  {normalized.status === 'approved' && day < normalized.startDay && normalized.paymentPending ? (
                    <div className="meter__hint">인력 대여가 확정되었습니다. 결제를 진행해 주세요.</div>
                  ) : null}
                  {normalized.status === 'rejected' ? (
                    <div className="meter__hint">대여하시는 날짜는 인력이 부족합니다. 추가비용 {won(normalized.extraFee)} 결제 시 승인됩니다.</div>
                  ) : null}
                  {(status !== '종료' || normalized.status === 'rejected') ? (
                    <div className="footer-actions" style={{ marginTop: 10 }}>
                      {normalized.status === 'rejected' ? (
                        <button className="button button--primary day-transition-animate-button" onClick={() => approveRejectedCrewRent(normalized.id)}>
                          추가비용 결제 후 승인
                        </button>
                      ) : null}
                      <button className="button button--ghost day-transition-animate-button" onClick={() => cancelCrewRent(normalized.id)}>대여 취소</button>
                    </div>
                  ) : null}
                </div>
              );
            })}
        </div>
      ) : (
        <div className="empty-box">등록된 대여가 없습니다.</div>
      )}
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function ConstructionOfficePanel({
  className = 'confirm-modal confirm-modal--construction-estimate',
  money,
  won,
  facilityTabs,
  facilityTab,
  onSelectFacilityTab,
  facilities,
  game,
  selectedField,
  canInstallFacilityOnField,
  facilityCost,
  facilityOccupyPy,
  facilityOccupyPyOfField,
  storageCapacityOfFacility,
  storageCapacityKgByFacility,
  withColdStorageIconName,
  housingOptionKeysOfFacility,
  housingOptionMapOfFacility,
  openFacilityInstallPicker,
  onBack,
  onClose
}) {
  const previousFacilityTabRef = React.useRef(facilityTab);
  const previousFacilityTab = previousFacilityTabRef.current;
  const currentFacilityTabIndex = facilityTabs.findIndex(([key]) => key === facilityTab);
  const previousFacilityTabIndex = facilityTabs.findIndex(([key]) => key === previousFacilityTab);
  const tabPanelAnimationClass = previousFacilityTab === facilityTab
    ? ''
    : currentFacilityTabIndex >= previousFacilityTabIndex
      ? 'focus-tab-panel--enter-forward'
      : 'focus-tab-panel--enter-backward';

  React.useEffect(() => {
    previousFacilityTabRef.current = facilityTab;
  }, [facilityTab]);

  return (
    <div className={className}>
      <div className="panel__header">
        <div><div className="panel__eyebrow">시설견적</div><h2>농장 기반시설</h2></div>
        <div className="summary-chip"><span>보유 자금</span><strong>{won(money)}</strong></div>
      </div>
      <div className="focus-tabs">
        {facilityTabs.map(([key, label]) => (
          <button
            key={key}
            className={`focus-tab focus-tab--farm-main-animate ${facilityTab === key ? 'focus-tab--active' : ''}`.trim()}
            onClick={() => onSelectFacilityTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        key={`construction-facility-tab-${facilityTab}`}
        className={`focus-tab-panel ${tabPanelAnimationClass}`.trim()}
        style={{ marginTop: 14 }}
      >
        {facilities.length ? (
          <div className="option-grid">
            {facilities.map((facility) => {
            const ownedFieldIndexes = (game.fields || []).map((field, idx) => (field.owned ? idx : -1)).filter((idx) => idx >= 0);
            const installableFieldIndexes = ownedFieldIndexes.filter((idx) => {
              const field = game.fields[idx];
              return canInstallFacilityOnField(facility, field);
            });
            const selectedOwned = Boolean(selectedField?.owned);
            const previewFieldIndex = selectedOwned ? game.selectedField : installableFieldIndexes[0];
            const cost = previewFieldIndex !== undefined ? facilityCost(facility, game, previewFieldIndex) : facilityCost(facility, game);
            const noTargetField = installableFieldIndexes.length <= 0;
            const noMoney = installableFieldIndexes.every((idx) => game.money < facilityCost(facility, game, idx));
            const needPy = Math.max(0, Number(
              facility.key === 'openStorage3000Py' && typeof facilityOccupyPyOfField === 'function'
                ? facilityOccupyPyOfField(selectedField, facility.key)
                : facilityOccupyPy?.[facility.key]
            ) || 0);
            const facilityWeightKg = Math.max(0, Number(facility?.weightKg) || 0);
            const storageCapacityKg = Math.max(
              0,
              Number(
                facility.key === 'openStorage3000Py' && typeof storageCapacityOfFacility === 'function'
                  ? storageCapacityOfFacility(facility.key)
                  : storageCapacityKgByFacility?.[facility.key]
              ) || 0
            );
            const housingOptionKeys = housingOptionKeysOfFacility(facility.key);
            const housingOptionMap = housingOptionMapOfFacility(facility.key);
            const hasRideMachineBonus = housingOptionKeys.some((key) => Math.max(0, Number(housingOptionMap?.[key]?.rideMachineCapacityBonus) || 0) > 0);
            const totalRideMachineBonus = housingOptionKeys.reduce((sum, key) => sum + Math.max(0, Number(housingOptionMap?.[key]?.rideMachineCapacityBonus) || 0), 0);
            const facilityImageSrc = constructionFacilityImageSrcOf(facility.key);

            return (
              <div
                key={facility.key}
                className={`option-card ${facilityImageSrc ? 'shop-tool-card--has-image' : ''}`.trim()}
              >
                {facilityImageSrc ? (
                  <div className="shop-tool-thumb" aria-hidden="true">
                    <img src={facilityImageSrc} alt="" loading="lazy" />
                  </div>
                ) : null}
                <div className="option-card__row">
                  <strong>{withColdStorageIconName(facility.name, facility.key, selectedField)}</strong>
                  <span>{facility.perTree ? `${won(facility.unitPricePerTree)} /주` : won(cost)}</span>
                </div>
                <div className="option-card__meta">{facility.desc}</div>
                {(Number(facility.rideMachineCapacity) > 0 || hasRideMachineBonus) ? (
                  <div className="option-card__meta">
                    탑승형 농기계 수용: {Number(facility.rideMachineCapacity) > 0 ? `${Number(facility.rideMachineCapacity)}대` : '기본 없음'}
                    {hasRideMachineBonus ? ` (옵션 최대 +${totalRideMachineBonus}대)` : ''}
                  </div>
                ) : null}
                {storageCapacityKg > 0 ? (
                  <div className="option-card__meta">보관 가능: {storageCapacityKg.toLocaleString()}kg</div>
                ) : null}
                {facilityWeightKg > 0 ? (
                  <div className="option-card__meta">무게: {facilityWeightKg.toLocaleString()}kg</div>
                ) : null}
                {needPy > 0 ? <div className="option-card__meta">점유평수: {needPy}평</div> : null}
                <div className="footer-actions" style={{ marginTop: 10 }}>
                  <button
                    className="button button--ghost day-transition-animate-button"
                    disabled={noTargetField || noMoney}
                    title={noTargetField ? '설치 가능한 보유 토지가 없습니다.' : noMoney ? '설치 가능한 토지 기준 자금이 부족합니다.' : ''}
                    onClick={() => openFacilityInstallPicker(facility.key)}
                  >
                    건설
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-box" style={{ marginTop: 14 }}>해당 시설 카테고리는 준비 중입니다.</div>
      )}
      </div>
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function ConstructionOfficeAdminPanel({
  className = 'confirm-modal confirm-modal--labor-office',
  money = 0,
  selectedField = null,
  day = 1,
  won = (value) => `${value}`,
  longDate = (value) => `${value}일`,
  waterworksCost = 0,
  waterworksDistanceKm = 0,
  waterworksHasRoadDistance = false,
  waterworksBuildDays = 3,
  onApplyWaterworks,
  onBack,
  onClose
}) {
  const owned = Boolean(selectedField?.owned);
  const connected = Boolean(selectedField?.housingMunicipalWaterConnected);
  const readyDay = Math.max(0, Number(selectedField?.housingMunicipalWaterReadyDay) || 0);
  const pending = !connected && readyDay > Number(day || 0);
  const canApply = owned && !connected && !pending && Number(money) >= Number(waterworksCost || 0);
  const statusText = connected
    ? '상하수도 연결 완료'
    : pending
      ? `공사중 · 완료예정 ${longDate(readyDay)}`
      : owned
        ? '신청 가능'
        : '보유 토지 선택 필요';
  const blockReason = !owned
    ? '상하수도 공사를 신청할 보유 토지를 선택해 주세요.'
    : connected
      ? '이미 상하수도 인입이 완료된 토지입니다.'
      : pending
        ? '이미 상하수도 인입 공사가 진행 중입니다.'
        : Number(money) < Number(waterworksCost || 0)
          ? '자금이 부족합니다.'
          : '';

  return (
    <div className={className}>
      <div className="panel__header">
        <div>
          <div className="panel__eyebrow">사무실</div>
          <h2>상하수도 인입 신청</h2>
        </div>
        <div className="summary-chip"><span>보유 자금</span><strong>{won(money)}</strong></div>
      </div>
      <div className="option-grid" style={{ marginTop: 14 }}>
        <article className="option-card">
          <div className="option-card__row">
            <strong>상하수도 인입 공사</strong>
            <span>{won(waterworksCost)}</span>
          </div>
          <div className="option-card__meta">
            집 생활수와 조리수에 안정적인 상수도를 연결하고 배수관을 함께 정비합니다. 완료 후 생활수질은 95/100으로 유지됩니다.
          </div>
          <div className="option-card__meta">
            공사비 산정: 기본 500만원 + 도로/상수관 접근거리 가산
            {waterworksHasRoadDistance ? ` · 도로까지 약 ${Number(waterworksDistanceKm || 0).toFixed(2)}km` : ''}
          </div>
          <div className="option-card__meta">공사 기간: {waterworksBuildDays}일</div>
          <div className="option-card__meta">대상 토지: {owned ? selectedField.name : '없음'}</div>
          <div className="option-card__meta">상태: {statusText}</div>
          <div className="footer-actions" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="button button--ghost day-transition-animate-button"
              disabled={!canApply}
              title={blockReason}
              onClick={onApplyWaterworks}
            >
              신청
            </button>
          </div>
        </article>
      </div>
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function TownOfficeColdStorageConsultingPanel({
  className = 'confirm-modal confirm-modal--labor-office',
  rows = [],
  selectedUnitKey = '',
  onSelectUnitKey,
  onInstall,
  won = (value) => `${value}`,
  onBack,
  onClose
}) {
  const consultingRows = Array.isArray(rows) ? rows : [];
  const selectedRow = consultingRows.find((row) => String(row?.unitKey || '') === String(selectedUnitKey || '')) || consultingRows[0] || null;
  const [confirmUnitKey, setConfirmUnitKey] = React.useState('');
  const confirmRow = consultingRows.find((row) => String(row?.unitKey || '') === String(confirmUnitKey || '')) || null;

  React.useEffect(() => {
    if (!confirmUnitKey) return;
    if (!consultingRows.some((row) => String(row?.unitKey || '') === String(confirmUnitKey || ''))) {
      setConfirmUnitKey('');
    }
  }, [confirmUnitKey, consultingRows]);

  React.useEffect(() => {
    if (!selectedRow || String(selectedRow?.unitKey || '') !== String(confirmUnitKey || '')) return;
    if (!selectedRow.canTreat) {
      setConfirmUnitKey('');
    }
  }, [confirmUnitKey, selectedRow]);

  return (
    <div className={className}>
      <div className="panel__header">
        <div>
          <div className="panel__eyebrow">기술상담</div>
          <h2>저온창고 1-MCP 처리</h2>
        </div>
        {selectedRow ? (
          <div className="summary-chip">
            <span>처리비</span>
            <strong>{won(selectedRow.installCost)}</strong>
          </div>
        ) : null}
      </div>
      <div className="confirm-modal__desc">
        저온창고에 저장 중인 사과에 1-MCP를 1회 처리합니다. 설비 설치가 아니라 현재 보관 물량에 대한 일회성 처리입니다.
      </div>
      <div className="confirm-modal__desc" style={{ marginTop: 4 }}>
        처리비는 창고 면적 기준 평당 99,990원입니다.
      </div>
      {consultingRows.length ? (
        <div className="option-grid" style={{ marginTop: 14 }}>
          {consultingRows.map((row) => {
            const isSelected = String(row?.unitKey || '') === String(selectedUnitKey || '');
            return (
              <button
                key={row.unitKey}
                type="button"
                className={`option-card option-card--left ${isSelected ? 'option-card--selected' : ''}`.trim()}
                onClick={() => onSelectUnitKey?.(row.unitKey)}
                style={{ textAlign: 'left' }}
              >
                <div className="option-card__row">
                  <strong>{row.title}</strong>
                  <span>{Math.max(0, Number(row?.storedAppleKg) || 0) <= 0 ? '보관 중 없음' : (row.canTreat ? '처리 가능' : '처리 완료')}</span>
                </div>
                <div className="option-card__meta">{`${row.areaPy}평 · 처리비 ${won(row.installCost)}`}</div>
                <div className="option-card__meta">{`현재 저장 사과량 ${Math.max(0, Number(row?.storedAppleKg) || 0).toLocaleString('ko-KR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}kg`}</div>
                <div className="option-card__meta">
                  {Math.max(0, Number(row?.storedAppleKg) || 0) <= 0
                    ? '현재 이 저온창고에는 처리할 사과가 없습니다.'
                    : (row.canTreat
                      ? `미처리 물량 ${Math.max(0, Number(row?.untreatedAppleKg) || 0).toLocaleString('ko-KR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}kg를 1회 처리합니다.`
                      : '현재 저장 사과는 이미 1-MCP 처리가 끝났습니다.')}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="empty-box" style={{ marginTop: 14 }}>
          현재 토지에 도입 가능한 저온창고가 없습니다.
        </div>
      )}
      {selectedRow ? (
        <div className="footer-actions" style={{ marginTop: 14, justifyContent: 'space-between' }}>
          <div className="meter__hint">
            {Math.max(0, Number(selectedRow?.storedAppleKg) || 0) <= 0
              ? '저장 중인 사과가 있어야 1-MCP 처리를 진행할 수 있습니다.'
              : (selectedRow.canTreat
                ? `${selectedRow.title}에 저장된 사과를 1회 1-MCP 처리합니다.`
                : '현재 저장 사과는 이미 1-MCP 처리가 끝났습니다.')}
          </div>
          <button
            type="button"
            className="button button--ghost day-transition-animate-button"
            disabled={!selectedRow.canTreat}
            onClick={() => setConfirmUnitKey(selectedRow.unitKey)}
          >
            {selectedRow.canTreat ? '처리신청' : '처리 완료'}
          </button>
        </div>
      ) : null}
      {confirmRow ? (
        <div className="option-card option-card--left option-card--selected" style={{ marginTop: 14, padding: 18 }}>
          <div className="panel__eyebrow">처리 신청 계약서</div>
          <div className="option-card__row" style={{ marginTop: 4 }}>
            <strong>{`${confirmRow.title} 1-MCP 처리 계약`}</strong>
            <span>{won(confirmRow.installCost)}</span>
          </div>
          <div className="confirm-modal__desc" style={{ marginTop: 8 }}>
            아래 계약 내용을 확인한 뒤 결제를 진행하면 해당 저온창고의 미처리 사과에 1-MCP 1회 처리가 즉시 접수됩니다.
          </div>
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            <div className="option-card__meta"><strong>1.</strong> 처리 대상: {confirmRow.title} 보관 사과</div>
            <div className="option-card__meta"><strong>2.</strong> 창고 면적: {confirmRow.areaPy}평</div>
            <div className="option-card__meta"><strong>3.</strong> 현재 저장 사과량: {Math.max(0, Number(confirmRow?.storedAppleKg) || 0).toLocaleString('ko-KR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}kg</div>
            <div className="option-card__meta"><strong>4.</strong> 이번 처리 물량: {Math.max(0, Number(confirmRow?.untreatedAppleKg) || 0).toLocaleString('ko-KR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}kg</div>
            <div className="option-card__meta"><strong>5.</strong> 작업 단가: 평당 {won(99990)}</div>
            <div className="option-card__meta"><strong>6.</strong> 총 작업비: {won(confirmRow.installCost)}</div>
            <div className="option-card__meta"><strong>7.</strong> 작업 방식: 저온창고 내 1-MCP 일회 처리</div>
            <div className="option-card__meta"><strong>8.</strong> 결제 완료 후 처리 상태가 즉시 반영됩니다.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <div className="summary-chip"><span>면적</span><strong>{`${confirmRow.areaPy}평`}</strong></div>
            <div className="summary-chip"><span>처리 물량</span><strong>{`${Math.max(0, Number(confirmRow?.untreatedAppleKg) || 0).toLocaleString('ko-KR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}kg`}</strong></div>
            <div className="summary-chip"><span>총 결제금</span><strong>{won(confirmRow.installCost)}</strong></div>
          </div>
          <div className="footer-actions" style={{ marginTop: 12, justifyContent: 'space-between' }}>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setConfirmUnitKey('')}
            >
              계약서 닫기
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={() => {
                onInstall?.(confirmRow.unitKey);
                setConfirmUnitKey('');
              }}
            >
              결제 진행
            </button>
          </div>
        </div>
      ) : null}
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function TownOfficeOverlay({
  open,
  view,
  title,
  closing = false,
  pickupPanel = null,
  landBankPanel = null,
  consultingMenuTitle = '기술상담',
  consultingMenuDescription = '상담할 항목을 선택해 주세요.',
  consultingMenuActions = null,
  consultingPanel = null,
  supportPanel = null,
  description = '원하는 기능을 선택해 주세요.',
  entryActions = null,
  onOpenLandBank,
  onOpenPickup,
  onBack,
  onClose
}) {
  if (!open) return null;
  return (
    <>
      <div className={`confirm-modal-backdrop ${closing ? 'is-closing' : ''}`.trim()} onClick={onClose} />
      {view === 'pickup' ? (
        pickupPanel
      ) : view === 'consulting-menu' ? (
        <MapEntryModal
          className={`confirm-modal confirm-modal--map-shop-entry ${closing ? 'is-closing' : ''}`.trim()}
          title={consultingMenuTitle}
          description={consultingMenuDescription}
          actions={Array.isArray(consultingMenuActions) ? consultingMenuActions : []}
          onBack={onBack}
          onClose={onClose}
        />
      ) : view === 'consulting' ? (
        consultingPanel
      ) : view === 'support' ? (
        supportPanel
      ) : view === 'landBank' ? (
        landBankPanel
      ) : (
        <MapEntryModal
          className={`confirm-modal confirm-modal--map-shop-entry ${closing ? 'is-closing' : ''}`.trim()}
          title={title}
          description={description}
          actions={Array.isArray(entryActions) && entryActions.length ? entryActions : [
            { key: 'land-bank', label: '농지매매', onClick: onOpenLandBank },
            { key: 'pickup', label: '물품 임시보관소', onClick: onOpenPickup }
          ]}
          onBack={onBack}
          onClose={onClose}
        />
      )}
    </>
  );
}

export function LaborOfficeOverlay({
  open,
  view,
  title,
  closing = false,
  pickupPanel = null,
  laborPanel = null,
  officePanel = null,
  onOpenLabor,
  onOpenOffice,
  onOpenPickup,
  onBack,
  onClose
}) {
  if (!open) return null;
  return (
    <>
      <div className={`confirm-modal-backdrop ${closing ? 'is-closing' : ''}`.trim()} onClick={onClose} />
      {view === 'pickup' ? (
        pickupPanel
      ) : (view === 'office' || view === 'officeSettlement') ? (
        officePanel
      ) : view === 'shop' ? (
        laborPanel
      ) : (
        <MapEntryModal
          className={`confirm-modal confirm-modal--map-shop-entry ${closing ? 'is-closing' : ''}`.trim()}
          title={title}
          actions={[
            { key: 'labor', label: '인력대여', onClick: onOpenLabor || onOpenOffice },
            { key: 'pickup', label: '물품 임시보관소', onClick: onOpenPickup },
            ...(officePanel && typeof onOpenOffice === 'function'
              ? [{ key: 'office', label: '사무실', onClick: onOpenOffice }]
              : [])
          ]}
          onBack={onBack}
          onClose={onClose}
        />
      )}
    </>
  );
}

export function SimplePickupShopOverlay({
  open,
  title,
  shopLabel = '상점',
  pickupPanel = null,
  officePanel = null,
  officeLabel = '사무실',
  view,
  closing = false,
  onOpenShop,
  onOpenPickup,
  onOpenOffice,
  onBack,
  onClose
}) {
  if (!open) return null;
  return (
    <>
      <div className={`confirm-modal-backdrop ${closing ? 'is-closing' : ''}`.trim()} onClick={onClose} />
      {view === 'pickup' ? (
        pickupPanel
      ) : view === 'office' ? (
        officePanel
      ) : (
        <MapEntryModal
          className={`confirm-modal confirm-modal--map-shop-entry ${closing ? 'is-closing' : ''}`.trim()}
          title={title}
          actions={[
            { key: 'shop', label: shopLabel, onClick: onOpenShop },
            { key: 'pickup', label: '물품 임시보관소', onClick: onOpenPickup },
            ...(officePanel && typeof onOpenOffice === 'function'
              ? [{ key: 'office', label: officeLabel, onClick: onOpenOffice }]
              : [])
          ]}
          onBack={onBack}
          onClose={onClose}
        />
      )}
    </>
  );
}

export function FarmMartOfficePanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">농자재 마트</div>
          <h2>사무실</h2>
        </div>
      </div>
      <div className="small-apc-receiving-layout">
        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-card__head">
            <strong>운영 안내</strong>
            <span>마트 사무실</span>
          </div>
          <div className="small-apc-sorting-slot-grid">
            <div
              className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine small-apc-packing-workbench-card"
              style={packingWorkbenchImageSrc ? { '--small-apc-workbench-bg': `url("${packingWorkbenchImageSrc}")` } : undefined}
            >
              <strong>주문 상담</strong>
              <span>대량 구매 문의</span>
              <em>비료, 농약, 자재 묶음 주문과 입고 일정을 상담합니다.</em>
            </div>
            <div
              className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine small-apc-packing-workbench-card"
              style={packingWorkbenchImageSrc ? { '--small-apc-workbench-bg': `url("${packingWorkbenchImageSrc}")` } : undefined}
            >
              <strong>파트타임 일자리</strong>
              <span>일자리 구하기</span>
              <em>상하차 보조, 진열 정리, 입고 보조 같은 단기 아르바이트 공고를 확인합니다.</em>
            </div>
            <div
              className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine small-apc-packing-workbench-card"
              style={packingWorkbenchImageSrc ? { '--small-apc-workbench-bg': `url("${packingWorkbenchImageSrc}")` } : undefined}
            >
              <strong>거래 확인</strong>
              <span>외상·정산 예정</span>
              <em>거래 내역, 외상 가능 여부, 세금계산서 요청 같은 사무 처리를 맡습니다.</em>
            </div>
            <div
              className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine small-apc-packing-workbench-card"
              style={packingWorkbenchImageSrc ? { '--small-apc-workbench-bg': `url("${packingWorkbenchImageSrc}")` } : undefined}
            >
              <strong>배송 문의</strong>
              <span>창고·농장 납품</span>
              <em>앞으로 자재 배송 요청이나 반품 접수 기능을 이쪽에 연결할 수 있습니다.</em>
            </div>
          </div>
        </section>
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function LaborOfficeInfoPanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">인력사무소</div>
          <h2>사무실</h2>
        </div>
      </div>
      <div className="small-apc-receiving-layout">
        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-card__head">
            <strong>고용 안내</strong>
            <span>현장 인력 상담</span>
          </div>
          <div className="small-apc-sorting-slot-grid">
            <div className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine">
              <strong>인력 상담</strong>
              <span>작업별 배정 문의</span>
              <em>수확, 적재, 선별, 상하차처럼 필요한 작업에 맞춰 인력 구성을 상담합니다.</em>
            </div>
            <div className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine">
              <strong>단기 일자리</strong>
              <span>당일·단기 모집</span>
              <em>일용직, 단기 보조, 시즌 작업 공고를 확인하고 지원 가능한 인력을 연결합니다.</em>
            </div>
            <div className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine">
              <strong>비용 안내</strong>
              <span>임금·수수료 확인</span>
              <em>인건비, 소개 수수료, 계약 기간, 결제 일정 같은 고용 조건을 확인하는 창구입니다.</em>
            </div>
          </div>
        </section>
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function FoodMartOfficePanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">식자재 마트</div>
          <h2>사무실</h2>
        </div>
      </div>
      <div className="small-apc-receiving-layout">
        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-card__head">
            <strong>운영 안내</strong>
            <span>마트 사무실</span>
          </div>
          <div className="small-apc-sorting-slot-grid">
            <div className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine">
              <strong>납품 상담</strong>
              <span>식자재 공급 문의</span>
              <em>과일, 채소, 가공품 납품 일정과 매입 가능 물량을 상담합니다.</em>
            </div>
            <div className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine">
              <strong>파트타임 일자리</strong>
              <span>일자리 구하기</span>
              <em>진열 보조, 계산대 보조, 창고 정리 같은 단기 아르바이트 공고를 확인합니다.</em>
            </div>
            <div className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine">
              <strong>거래 확인</strong>
              <span>정산·서류 문의</span>
              <em>납품 정산, 거래 내역, 영수증과 세금계산서 요청 같은 사무 처리를 맡습니다.</em>
            </div>
          </div>
        </section>
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function SmallApcOfficePanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  mode = 'office',
  staffingProfile = null,
  settlementRows = [],
  won = (value) => `${Math.round(Number(value) || 0).toLocaleString()}원`,
  onPaySettlement,
  onOpenSettlement,
  onOpenStaffRoster,
  onBack,
  onClose
}) {
  const pendingRows = (Array.isArray(settlementRows) ? settlementRows : [])
    .filter((row) => String(row?.status || 'pending').trim() === 'pending');
  const isSettlementMode = String(mode || 'office') === 'settlement';
  const officeStaffMembers = React.useMemo(
    () => smallApcAssignedMembersOf(staffingProfile?.facilityByEntryKey?.office || null),
    [staffingProfile]
  );
  const handleOpenSettlement = React.useCallback(() => {
    if (typeof onOpenSettlement === 'function') onOpenSettlement();
  }, [onOpenSettlement]);
  const handleOpenStaffRoster = React.useCallback(() => {
    if (typeof onOpenStaffRoster === 'function') onOpenStaffRoster();
  }, [onOpenStaffRoster]);
  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">소형 APC</div>
          <h2>{isSettlementMode ? '정산 창구' : '사무실'}</h2>
        </div>
      </div>
      <div className="small-apc-receiving-layout">
        {!isSettlementMode ? (
          <section className="panel-card small-apc-receiving-card">
            <div className="small-apc-receiving-overview-stage">
              <SmallApcStaffDeploymentPanel members={officeStaffMembers} />
            </div>
            <div className="small-apc-receiving-card__head">
              <strong>운영 사무</strong>
              <span>현장 관리</span>
            </div>
            <div className="small-apc-sorting-slot-grid">
              <div className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine small-apc-office-card">
                <strong>📋 입고 문의 · 보관 상담</strong>
              </div>
              <div className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine small-apc-office-card">
                <strong>🧑‍🌾 파트타임 일자리 문의</strong>
              </div>
              <button
                type="button"
                className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine small-apc-sorting-slot-card--button small-apc-office-card"
                onClick={handleOpenSettlement}
              >
                <strong>💵 정산 창구</strong>
              </button>
              <button
                type="button"
                className="small-apc-sorting-slot-card small-apc-sorting-slot-card--machine small-apc-sorting-slot-card--button small-apc-office-card"
                onClick={handleOpenStaffRoster}
              >
                <strong>📇 직원명단</strong>
              </button>
            </div>
          </section>
        ) : null}
        {isSettlementMode ? (
          <section className="panel-card small-apc-receiving-card">
            <div className="small-apc-receiving-card__head">
              <strong>정산 대기</strong>
              <span>{`${pendingRows.length}건`}</span>
            </div>
            <div className="small-apc-receiving-queue">
              {pendingRows.length ? (
                pendingRows.map((row) => (
                  <div
                    key={`small-apc-settlement-${String(row?.ticketNo || row?.id || '')}`}
                    className="small-apc-receiving-queue__item is-issued small-apc-office-settlement-card"
                  >
                    <strong>{String(row?.ticketNo || '정산')}</strong>
                    <div className="small-apc-receiving-queue__content">
                      <div className="small-apc-receiving-queue__text">
                        <div className="small-apc-receiving-queue__title-row">
                          <span>{String(row?.vehicleName || '출하 차량')}</span>
                        </div>
                        <b>{`출하자 ${String(row?.shipperName || '미상')}`}</b>
                        <em>
                          {`${String(row?.cargoType || '사과')} · ${Math.max(0, Number(row?.receivedCargoKg ?? row?.cargoKg) || 0).toLocaleString()}kg · 접수 ${Math.max(0, Number(row?.receivedBoxCount ?? row?.boxCount) || 0)}상자`}
                        </em>
                        {Math.max(0, Number(row?.receivedBoxCount ?? row?.boxCount) || 0) !== Math.max(0, Number(row?.boxCount) || 0) ? (
                          <span>{`선별 후 같은 규격끼리 합쳐져 정산 기준은 ${Math.max(0, Number(row?.boxCount) || 0)}상자입니다.`}</span>
                        ) : null}
                        <span>{`총 매입액 ${won(row?.grossAmount || 0)} / 작업 수수료 ${won(row?.feeAmount || 0)}`}</span>
                        <span>{`지급액 ${won(row?.netAmount || 0)}`}</span>
                        {Array.isArray(row?.boxGroups) && row.boxGroups.length ? (
                          <div className="small-apc-receiving-queue__detail">
                            {row.boxGroups.map((group) => (
                              <span key={`settlement-group-${String(group?.rowKey || '')}`}>
                                {`${String(group?.gradeLabel || '미선별')} ${String(group?.sizeLabel || '미측정')} / 신선도 ${String(group?.freshnessBucketLabel || '중')} : ${Math.max(0, Number(group?.boxCount || 0))}상자 / ${Math.max(0, Number(group?.totalKg || 0)).toFixed(1)}kg / ${won(group?.netAmount || 0)}`}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="footer-actions small-apc-office-settlement-card__actions">
                      <button
                        type="button"
                        className="button button--primary"
                        onClick={() => onPaySettlement?.(String(row?.ticketNo || '').trim())}
                      >
                        정산 받기
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="small-apc-receiving-empty">현재 바로 받을 정산 건이 없습니다.</div>
              )}
            </div>
          </section>
        ) : null}
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function SmallApcSupportSpacePanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  title = '지원 공간',
  summary = '',
  details = [],
  facilityProfile = null,
  shippingJobs = [],
  shippingSlotRows = [],
  onBack,
  onClose
}) {
  const [shippingNowTick, setShippingNowTick] = React.useState(() => Date.now());
  const detailRows = Array.isArray(details) ? details.filter(Boolean) : [];
  const isShippingYard = String(title || '').trim() === '상품출고장';
  const hideSummaryChips = isShippingYard || String(title || '').trim() === '식당';
  const supportStaffMembers = React.useMemo(
    () => smallApcAssignedMembersOf(facilityProfile),
    [facilityProfile]
  );
  React.useEffect(() => {
    if (!isShippingYard) return undefined;
    const timerId = window.setInterval(() => {
      setShippingNowTick(Date.now());
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [isShippingYard]);
  const shippingQueueRows = isShippingYard
    ? (Array.isArray(shippingJobs) ? shippingJobs : []).slice().sort((a, b) => Math.max(0, Number(b?.createdAt || 0)) - Math.max(0, Number(a?.createdAt || 0)))
    : [];
  const shippingParkingRows = isShippingYard
    ? (Array.isArray(shippingSlotRows) ? shippingSlotRows : [])
    : [];
  const shippingJobBySlotNo = React.useMemo(
    () => new Map(
      shippingQueueRows
        .filter((job) => String(job?.status || 'queued').trim() !== 'done')
        .map((job) => [Math.max(0, Number(job?.shippingParkingSlotNo || 0)), job])
        .filter(([slotNo]) => slotNo > 0)
    ),
    [shippingQueueRows]
  );
  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">소형 APC</div>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="small-apc-receiving-layout">
        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-overview-stage">
            <SmallApcStaffDeploymentPanel members={supportStaffMembers} />
          </div>
          <div className="small-apc-receiving-card__head">
            <strong>{title}</strong>
            <span>{isShippingYard ? `${shippingQueueRows.filter((job) => String(job?.status || 'queued').trim() !== 'done').length}건 진행 중` : '운영 공간'}</span>
          </div>
          {facilityProfile && !hideSummaryChips ? (
            <div className="small-apc-receiving-summary-grid" style={{ marginBottom: 12 }}>
              <div className="summary-chip small-apc-receiving-summary-chip">
                <span>정원</span>
                <strong>{`${Math.max(0, Number(facilityProfile?.maxWorkers || 0))}명`}</strong>
              </div>
              <div className="summary-chip small-apc-receiving-summary-chip">
                <span>현재 투입</span>
                <strong>{`${Math.max(0, Number(facilityProfile?.activeWorkers || 0))}명`}</strong>
              </div>
              <div className="summary-chip small-apc-receiving-summary-chip">
                <span>실가동</span>
                <strong>{facilityProfile?.maxUnitCount > 0
                  ? `${Math.max(0, Number(facilityProfile?.activeUnitCount || 0))}/${Math.max(0, Number(facilityProfile?.maxUnitCount || 0))}${String(facilityProfile?.unitLabel || '')}`
                  : String(facilityProfile?.statusLabel || '배치 없음')}</strong>
              </div>
            </div>
          ) : null}
          {isShippingYard ? (
            <div className="small-apc-receiving-queue">
              {shippingQueueRows.length ? shippingQueueRows.map((job) => {
                const status = String(job?.status || 'queued').trim() || 'queued';
                const statusLabel = status === 'done'
                  ? '출고완료'
                  : status === 'active'
                    ? '출고중'
                    : '출고대기';
                const toneClassName = status === 'done'
                  ? 'is-paid'
                  : status === 'active'
                    ? 'is-issued'
                    : 'is-pending';
                return (
                  <div key={job.id} className={`small-apc-receiving-queue__item ${toneClassName}`.trim()}>
                    <strong>{String(job?.ticketNo || '출고건').trim() || '출고건'}</strong>
                    <div className="small-apc-receiving-queue__content">
                      <div className="small-apc-receiving-queue__text">
                        <b>{`${String(job?.shipperName || '출하자').trim() || '출하자'} · ${String(job?.gradeLabel || '미선별').trim() || '미선별'} / ${String(job?.sizeLabel || '미측정').trim() || '미측정'}`}</b>
                        <div className="small-apc-receiving-queue__detail">
                          <span>{`${Math.max(0, Number(job?.boxCount || 0)).toLocaleString()}상자 · ${Math.round(Math.max(0, Number(job?.totalKg || 0))).toLocaleString()}kg`}</span>
                          <span>{job?.packTypeLabel ? `포장: ${String(job.packTypeLabel).trim()}` : '포장 없이 바로 출고'}</span>
                          <span>{`${String(job?.dispatchVehicleName || '').trim() || '출고 차량'}${String(job?.dispatchVehiclePlateText || '').trim() ? ` (${String(job.dispatchVehiclePlateText).trim()})` : ''}`}</span>
                          <span>{`상태: ${statusLabel}`}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="small-apc-receiving-queue__item small-apc-office-settlement-card">
                  <strong>상품출고장</strong>
                  <div className="small-apc-receiving-queue__content">
                    <div className="small-apc-receiving-queue__text">
                      <b>출고 대기 물량 없음</b>
                      <em>저온창고에서 포장 완료 또는 보관중 물량을 출고로 보내면 이곳에 표시됩니다.</em>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="small-apc-receiving-queue">
              <div className="small-apc-receiving-queue__item is-issued small-apc-office-settlement-card">
                <strong>{title}</strong>
                <div className="small-apc-receiving-queue__content">
                  <div className="small-apc-receiving-queue__text">
                    <b>{summary || `${title} 화면은 준비 중입니다.`}</b>
                    {detailRows.length ? (
                      <div className="small-apc-receiving-queue__detail">
                        {detailRows.map((row, index) => (
                          <span key={`${title}-${index + 1}`}>{String(row)}</span>
                        ))}
                      </div>
                    ) : (
                      <em>현재는 입구 메뉴에서 접근할 수 있도록 공간만 먼저 연결했습니다.</em>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        {isShippingYard ? (
          <section className="panel-card small-apc-receiving-card">
            <div className="small-apc-receiving-card__head">
              <strong>출고 주차칸</strong>
              <span>{`총 ${shippingParkingRows.length}칸`}</span>
            </div>
            <div className="field-move-parking-panel" style={{ marginTop: 8 }}>
              <div className="field-move-parking-slot-grid">
                {shippingParkingRows.map((slotRow) => {
                  const parkedVehicleName = String(slotRow?.parkedVehicleName || '').trim();
                  const parkedVehiclePlateText = String(slotRow?.parkedVehiclePlateText || '').trim();
                  const parkedVehicleImageSrc = String(slotRow?.parkedVehicleImageSrc || '').trim();
                  const occupied = Boolean(slotRow?.occupied);
                  const linkedJob = shippingJobBySlotNo.get(Math.max(0, Number(slotRow?.slotNo || 0))) || null;
                  const status = String(linkedJob?.status || slotRow?.status || '').trim() || '';
                  const isReservedSlot = status === 'queued';
                  const etaMs = Math.max(0, Number(linkedJob?.startedAt || 0) - shippingNowTick);
                  const etaText = isReservedSlot
                    ? `${Math.floor(etaMs / 60000)}분 ${String(Math.floor((etaMs % 60000) / 1000)).padStart(2, '0')}초`
                    : '';
                  return (
                    <div key={`small-apc-shipping-slot-${slotRow?.slotNo || 0}`} className="field-move-parking-slot-wrap">
                      <button
                        type="button"
                        className={`field-move-parking-slot-btn ${occupied ? 'is-owned-occupied' : 'is-empty'}`.trim()}
                        disabled
                        title={occupied ? `${parkedVehicleName}${parkedVehiclePlateText ? ` · ${parkedVehiclePlateText}` : ''}` : '비어 있음'}
                      >
                        <div className="field-move-parking-slot-btn__card">
                          <strong>{String(slotRow?.slotLabel || '')}</strong>
                          {isReservedSlot ? (
                            <small className="field-move-parking-slot-btn__status-note">예약칸</small>
                          ) : null}
                          {parkedVehicleImageSrc ? (
                            <div className="field-move-parking-slot-btn__thumb" aria-hidden="true">
                              <img src={parkedVehicleImageSrc} alt="" />
                            </div>
                          ) : null}
                          <span>{String(slotRow?.parkingLabel || '소형 APC 출고')}</span>
                          <em>{occupied ? (isReservedSlot ? '출고차 예약됨' : '출고 차량 대기중') : '비어 있음'}</em>
                          {isReservedSlot && etaText ? (
                            <small className="field-move-parking-slot-btn__status-note">{`도착예정 ${etaText}`}</small>
                          ) : null}
                          {parkedVehicleName ? (
                            <small className="field-move-parking-slot-btn__status-note">{parkedVehicleName}</small>
                          ) : null}
                          {parkedVehiclePlateText ? (
                            <small className="field-move-parking-slot-btn__status-note field-move-parking-slot-btn__status-note--plate">
                              {parkedVehiclePlateText}
                            </small>
                          ) : null}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function SmallApcStaffLoungePanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  staffingProfile = null,
  mode = 'lounge',
  onBack,
  onClose
}) {
  const isRosterMode = String(mode || 'lounge') === 'roster';
  const smallApcStaffSummary = React.useMemo(() => {
    const allMembers = Array.isArray(staffingProfile?.staffRows) ? staffingProfile.staffRows : [];
    const visibleMembers = isRosterMode
      ? allMembers
      : allMembers.filter((member) => String(member?.statusKey || member?.status || '').trim() === 'resting');
    return {
      current: visibleMembers.length,
      capacity: Math.max(0, Number(staffingProfile?.totalWorkers || 0)),
      members: visibleMembers,
    };
  }, [isRosterMode, staffingProfile]);

  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">소형 APC</div>
          <h2>{isRosterMode ? '직원명단' : '직원휴게소'}</h2>
        </div>
      </div>
      <div
        className="panel-card"
        style={{
          padding: '14px 18px',
          borderRadius: 22,
          background: 'linear-gradient(135deg, rgba(244,251,243,0.94), rgba(255,249,240,0.96))',
          boxShadow: '0 18px 38px rgba(58, 92, 66, 0.10)',
          border: '1px solid rgba(148, 182, 156, 0.26)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b8575', marginBottom: 3 }}>
              {isRosterMode ? '전체 직원 현황' : '현재 쉬는 인원'}
            </div>
            <strong style={{ fontSize: 22, lineHeight: 1.15, color: '#234b35' }}>
              {`${smallApcStaffSummary.current}/${smallApcStaffSummary.capacity}명`}
            </strong>
          </div>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              background: 'rgba(219, 241, 222, 0.9)',
              color: '#2f6b45',
              fontSize: 13,
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            {isRosterMode
              ? (smallApcStaffSummary.current ? `등록 직원 ${smallApcStaffSummary.current}명` : '등록 직원 없음')
              : (smallApcStaffSummary.current ? `휴식중 ${smallApcStaffSummary.current}명` : '지금은 쉬는 직원 없음')}
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#738979', marginBottom: 10 }}>
          {isRosterMode
            ? '소형 APC에 등록된 전체 직원 목록입니다.'
            : '휴식 상태로 전환된 직원만 이곳에 표시됩니다.'}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
            gap: 10,
          }}
        >
          {smallApcStaffSummary.members.length ? smallApcStaffSummary.members.map((member, index) => (
            <div
              key={`small-apc-staff-${member.name}-${index + 1}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 58,
                padding: '10px 12px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(166, 190, 170, 0.34)',
                boxShadow: '0 8px 18px rgba(77, 111, 85, 0.08)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(220,239,221,0.95), rgba(243,249,232,0.98))',
                  color: '#2d5a41',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                <span style={{ lineHeight: 1 }} aria-hidden="true">{isRosterMode ? '🧑‍🔧' : '😴'}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: '#234b35',
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: 3,
                    wordBreak: 'keep-all',
                  }}
                >
                  {member.name}
                </div>
                <div
                  style={{
                    color: '#7b9080',
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {isRosterMode
                    ? `${String(member.roleLabel || '일반직')} · ${String(member.currentFacilityLabel || member.assignedFacilityLabel || '미배치')} · ${String(member.statusDescription || member.statusLabel || '근무중')}`
                    : `${String(member.roleLabel || '일반직')} · ${String(member.currentFacilityLabel || member.assignedFacilityLabel || '미배치')} · 휴식중`}
                </div>
              </div>
            </div>
          )) : (
            <div
              style={{
                gridColumn: '1 / -1',
                minHeight: 92,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.72)',
                border: '1px dashed rgba(166, 190, 170, 0.5)',
                color: '#6f8577',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {isRosterMode ? '등록된 직원이 없습니다.' : '지금은 휴게실에서 쉬는 직원이 없습니다.'}
            </div>
          )}
        </div>
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function SmallApcWorkshopPanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  staffingProfile = null,
  stemRemovalJobs = [],
  packingJobs = [],
  sortingJobs = [],
  sortingOutputBins = [],
  coldStorageByBuilding = null,
  onBack,
  onClose
}) {
  const workshopStaffMembers = React.useMemo(
    () => smallApcAssignedMembersOf(staffingProfile?.facilityByEntryKey?.workshop || null),
    [staffingProfile]
  );
  const [workflowNow, setWorkflowNow] = React.useState(() => Date.now());
  const workbenchImageSrc = constructionFacilityImageSrcOf('smallApcWorkbenchTable');
  const packingWorkbenchImageSrc = constructionFacilityImageSrcOf('smallApcPackingWorkbenchTable');
  const packingOutputBufferMs = 4000;
  React.useEffect(() => {
    const timerId = window.setInterval(() => {
      setWorkflowNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timerId);
  }, []);
  const workbenchCards = React.useMemo(() => (
    Array.from({ length: 2 }, (_, index) => {
      const workbenchNo = index + 1;
      const queuedJobs = (Array.isArray(stemRemovalJobs) ? stemRemovalJobs : [])
        .filter((item) => Math.max(1, Number(item?.workbenchNo || 1)) === workbenchNo)
        .sort((a, b) => Math.max(0, Number(a?.startedAt || 0)) - Math.max(0, Number(b?.startedAt || 0)));
      const job = queuedJobs[0] || null;
      if (!job) {
        return {
          key: `workbench-${workbenchNo}`,
          title: `작업대 ${workbenchNo}`,
          statusLabel: '대기',
          statusTone: 'pending',
          detailText: '배정된 꼭지 제거 작업이 없습니다.',
          metaText: '현재 작업대가 비어 있습니다.',
          queueCount: 0,
          occupied: false,
        };
      }
      const moveInStartedAt = Math.max(0, Number(job?.moveInStartedAt || 0));
      const moveInDurationMs = Math.max(100, Number(job?.moveInDurationMs || 3000));
      const startedAt = Math.max(0, Number(job?.startedAt || 0));
      const durationMs = Math.max(100, Number(job?.durationMs || 0));
      const finishedAt = startedAt + durationMs;
      const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || 3000));
      const clearedAt = finishedAt + moveOutDurationMs;
      const isMovingIn = workflowNow >= moveInStartedAt && workflowNow < startedAt;
      const isMovingOut = workflowNow >= finishedAt && workflowNow < clearedAt;
      const isActive = workflowNow >= startedAt && workflowNow < finishedAt;
      const isStemRemovalTask = String(job?.taskKey || '').startsWith('stemRemoval');
      const progressDurationMs = Math.max(100, durationMs);
      const taskProgress = isActive
        ? Math.max(0, Math.min(1, (workflowNow - startedAt) / progressDurationMs))
        : (workflowNow >= finishedAt ? 1 : 0);
      const statusLabel = isMovingIn
        ? '저온창고에서 이동중'
        : isMovingOut
          ? '저온창고로 복귀중'
          : isActive
            ? '꼭지 제거 작업중'
            : workflowNow >= clearedAt
              ? '대기'
              : '작업준비 중';
      const statusTone = isMovingIn
        ? 'preparing'
        : isMovingOut
          ? 'cleanup'
          : isActive
            ? 'unloading'
            : 'waiting';
      return {
        key: `workbench-${workbenchNo}`,
        title: `작업대 ${workbenchNo}`,
        statusLabel,
        statusTone,
        detailText: `${String(job?.vehicleName || '사과 작업')} · ${Math.max(0, Number(job?.boxCount || 0))}박스`,
        metaText: isActive
          ? `${String(job?.shipperName || '출하자')} · 진행 ${Math.round(taskProgress * 100)}%${queuedJobs.length > 1 ? ` · 뒤 대기 ${queuedJobs.length - 1}건` : ''}`
          : `${String(job?.shipperName || '출하자')} · ${queuedJobs.length > 1 ? `뒤 대기 ${queuedJobs.length - 1}건` : '현재 배정 작업 진행'}`,
        queueCount: queuedJobs.length,
        occupied: true,
        showStemRemovalAnimation: isStemRemovalTask && isActive,
      };
    })
  ), [stemRemovalJobs, workflowNow]);
  const packingWorkbenchCards = React.useMemo(() => (
    Array.from({ length: 2 }, (_, index) => {
      const workbenchNo = index + 1;
      const queuedJobs = (Array.isArray(packingJobs) ? packingJobs : [])
        .filter((item) => Math.max(1, Number(item?.workbenchNo || 1)) === workbenchNo)
        .sort((a, b) => Math.max(0, Number(a?.startedAt || 0)) - Math.max(0, Number(b?.startedAt || 0)));
      const job = queuedJobs[0] || null;
      if (!job) {
        return {
          key: `packing-workbench-${workbenchNo}`,
          title: `포장대 ${workbenchNo}`,
          statusLabel: '대기',
          statusTone: 'pending',
          detailText: '배정된 포장 작업이 없습니다.',
          metaText: '현재 포장대가 비어 있습니다.',
          occupied: false,
        };
      }
      const startedAt = Math.max(0, Number(job?.startedAt || 0));
      const durationMs = Math.max(100, Number(job?.durationMs || 0));
      const finishedAt = startedAt + durationMs;
      const isActive = workflowNow >= startedAt && workflowNow < finishedAt;
      const isDone = workflowNow >= finishedAt || String(job?.status || 'queued').trim() === 'done';
      const progress = isActive ? Math.max(0, Math.min(1, (workflowNow - startedAt) / durationMs)) : (isDone ? 1 : 0);
      return {
        key: `packing-workbench-${workbenchNo}`,
        title: `포장대 ${workbenchNo}`,
        statusLabel: isDone ? '포장완료' : isActive ? '포장중' : '포장대기',
        statusTone: isDone ? 'waiting' : isActive ? 'unloading' : 'preparing',
        detailText: `${String(job?.shipperName || '출하자')} · ${Math.max(0, Number(job?.boxCount || 0))}상자`,
        metaText: isDone
          ? `${String(job?.gradeLabel || '미선별')} / ${String(job?.sizeLabel || '미측정')} · ${String(job?.packTypeLabel || '선물포장')}`
          : `${String(job?.gradeLabel || '미선별')} / ${String(job?.sizeLabel || '미측정')} · 진행 ${Math.round(progress * 100)}%`,
        occupied: true,
      };
    })
  ), [packingJobs, workflowNow]);
  const expandWorkroomPalletSlots = React.useCallback((entries = [], maxSlots = Infinity) => {
    const expanded = [];
    const safeMaxSlots = Number.isFinite(Number(maxSlots)) ? Math.max(0, Math.floor(Number(maxSlots))) : Infinity;
    entries.forEach((entry) => {
      let remainingBoxCount = Math.max(0, Math.floor(Number(entry?.boxCount || 0)));
      let partIndex = 0;
      while (remainingBoxCount > 0 && expanded.length < safeMaxSlots) {
        const palletBoxCount = Math.max(0, Math.min(36, remainingBoxCount));
        expanded.push({
          ...entry,
          key: `${String(entry?.key || 'buffer')}-pallet-${partIndex + 1}`,
          boxCount: palletBoxCount,
          title: String(entry?.title || ''),
        });
        remainingBoxCount -= palletBoxCount;
        partIndex += 1;
      }
    });
    return expanded;
  }, []);
  const workroomInputBufferSlots = React.useMemo(() => {
    const stemEntries = (Array.isArray(stemRemovalJobs) ? stemRemovalJobs : [])
      .filter((job) => {
        const startedAt = Math.max(0, Number(job?.startedAt || 0));
        return workflowNow < startedAt;
      })
      .map((job) => {
        const moveInStartedAt = Math.max(0, Number(job?.moveInStartedAt || 0));
        const startedAt = Math.max(0, Number(job?.startedAt || 0));
        const isMovingIn = workflowNow >= moveInStartedAt && workflowNow < startedAt;
        return {
          key: `workroom-input-stem-${String(job?.id || '')}`,
          title: '꼭지 미제거 사과',
          badgeLabel: isMovingIn ? '작업대 이동중' : '작업대기',
          badgeTone: isMovingIn ? 'preparing' : 'waiting',
          boxCount: Math.max(0, Math.min(36, Number(job?.boxCount || 0))),
          detailText: `${String(job?.shipperName || '출하자')} · ${Math.max(0, Number(job?.boxCount || 0))}상자`,
          metaText: `${String(job?.vehicleName || '사과 작업')} · 꼭지 제거`,
        };
      });
    const packingEntries = (Array.isArray(packingJobs) ? packingJobs : [])
      .filter((job) => {
        const startedAt = Math.max(0, Number(job?.startedAt || 0));
        const completedAt = Math.max(0, Number(job?.completedAt || 0));
        return completedAt <= 0 && workflowNow < startedAt;
      })
      .map((job) => ({
        key: `workroom-input-packing-${String(job?.id || '')}`,
        title: '포장대기 사과',
        badgeLabel: '포장대기',
        badgeTone: 'preparing',
        boxCount: Math.max(0, Math.min(36, Number(job?.boxCount || 0))),
        detailText: `${String(job?.shipperName || '출하자')} · ${Math.max(0, Number(job?.boxCount || 0))}상자`,
        metaText: `${String(job?.gradeLabel || '미선별')} / ${String(job?.sizeLabel || '미측정')} · ${String(job?.packTypeLabel || '선물포장')}`,
      }));
    return expandWorkroomPalletSlots(
      [...stemEntries, ...packingEntries]
        .sort((a, b) => String(a?.badgeLabel || '').localeCompare(String(b?.badgeLabel || ''), 'ko')),
      5
    );
  }, [expandWorkroomPalletSlots, packingJobs, stemRemovalJobs, workflowNow]);
  const workroomProcessOutputBufferSlots = React.useMemo(() => {
    const stemEntries = (Array.isArray(stemRemovalJobs) ? stemRemovalJobs : [])
      .filter((job) => {
        const startedAt = Math.max(0, Number(job?.startedAt || 0));
        const durationMs = Math.max(100, Number(job?.durationMs || 0));
        const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || 3000));
        const finishedAt = startedAt + durationMs;
        const clearedAt = finishedAt + moveOutDurationMs;
        return workflowNow >= finishedAt && workflowNow < clearedAt;
      })
      .map((job) => ({
        key: `workroom-output-stem-${String(job?.id || '')}`,
        title: '꼭지 제거 완료 사과',
        badgeLabel: '선별라인 이동중',
        badgeTone: 'cleanup',
        boxCount: Math.max(0, Math.min(36, Number(job?.boxCount || 0))),
        detailText: `${String(job?.shipperName || '출하자')} · ${Math.max(0, Number(job?.boxCount || 0))}상자`,
        metaText: `${String(job?.vehicleName || '사과 작업')} · 다음 공정 대기`,
      }));
    const partialSortingEntries = (Array.isArray(sortingOutputBins) ? sortingOutputBins : [])
      .filter((bin) => Math.max(0, Number(bin?.boxCount || 0)) > 0)
      .map((bin) => ({
        key: `workroom-output-sorting-${String(bin?.id || '')}`,
        title: '부분선별 완료 사과',
        badgeLabel: '2동 반입대기',
        badgeTone: 'cleanup',
        boxCount: Math.max(0, Number(bin?.boxCount || 0)),
        detailText: `${String(bin?.gradeLabel || '미선별')} · ${String(bin?.sizeLabel || '미측정')} · ${Math.max(0, Number(bin?.boxCount || 0))}상자`,
        metaText: `${String(bin?.freshnessBucketLabel || '중')} 선도 · 선별 잔량`,
      }));
    return expandWorkroomPalletSlots([...partialSortingEntries, ...stemEntries]);
  }, [expandWorkroomPalletSlots, sortingOutputBins, stemRemovalJobs, workflowNow]);
  const workroomPackingOutputBufferSlots = React.useMemo(() => {
    const packingEntries = (Array.isArray(packingJobs) ? packingJobs : [])
      .filter((job) => {
        const completedAt = Math.max(0, Number(job?.completedAt || 0));
        return completedAt > 0;
      })
      .map((job) => ({
        key: `workroom-output-packing-${String(job?.id || '')}`,
        title: '포장 완료 사과',
        badgeLabel: '3동 이동대기',
        badgeTone: 'done',
        boxCount: Math.max(0, Math.min(36, Number(job?.boxCount || 0))),
        detailText: `${String(job?.shipperName || '출하자')} · ${Math.max(0, Number(job?.boxCount || 0))}상자`,
        metaText: `${String(job?.gradeLabel || '미선별')} / ${String(job?.sizeLabel || '미측정')} · ${String(job?.packTypeLabel || '선물포장')}`,
      }));
    return expandWorkroomPalletSlots(packingEntries, 5);
  }, [expandWorkroomPalletSlots, packingJobs]);
  const renderWorkroomBufferCard = React.useCallback((slot, emptyLabel) => {
    const boxEntries = Array.from({ length: 36 }, (_, boxIndex) => {
      const storageBoxIndex = harvestPalletDisplayBoxIndexOf(boxIndex, 6, 36);
      const filled = storageBoxIndex < Math.max(0, Math.min(36, Number(slot?.boxCount || 0)));
      return {
        key: `${String(slot?.key || 'empty')}-buffer-box-${boxIndex + 1}`,
        filled,
        tone: 'yellow',
      };
    });
    if (!slot) {
      return (
        <div className="small-apc-workroom-buffer-card is-empty">
          <div className="small-apc-workroom-buffer-card__grid">
            <HarvestBoxGrid boxEntries={boxEntries} />
          </div>
          <span className="small-apc-workroom-buffer-card__empty">{emptyLabel}</span>
        </div>
      );
    }
    return (
      <div className="small-apc-workroom-buffer-card is-occupied">
        <div className="small-apc-workroom-buffer-card__top">
          <strong>{slot.title}</strong>
          <span className={`small-apc-sorting-slot-card__badge is-${String(slot.badgeTone || 'pending')}`.trim()}>{slot.badgeLabel}</span>
        </div>
        <div className="small-apc-workroom-buffer-card__grid">
          <HarvestBoxGrid boxEntries={boxEntries} />
        </div>
        <div className="small-apc-workroom-buffer-card__body">
          <b>{slot.detailText}</b>
          <em>{slot.metaText}</em>
        </div>
      </div>
    );
  }, []);
  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">소형 APC</div>
          <h2>작업실</h2>
        </div>
      </div>
      <div className="small-apc-receiving-layout">
        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-overview-stage">
            <SmallApcStaffDeploymentPanel members={workshopStaffMembers} />
          </div>
          <div className="small-apc-workroom-buffer-section">
            <div className="small-apc-workroom-buffer-section__head">
              <strong>작업대기 적재칸</strong>
              <span>{`${workroomInputBufferSlots.length}/5칸 사용 중`}</span>
            </div>
            <div className="small-apc-workroom-buffer-grid">
              {Array.from({ length: 5 }, (_, index) => renderWorkroomBufferCard(workroomInputBufferSlots[index] || null, '빈 대기칸'))}
            </div>
          </div>
          <div className="small-apc-sorting-slot-grid">
            {workbenchCards.map((slot) => (
              <div
                key={slot.key}
                className={[
                  'small-apc-sorting-slot-card',
                  'small-apc-sorting-slot-card--machine',
                  'small-apc-workbench-card',
                  slot.showStemRemovalAnimation ? 'has-stem-removal-animation' : '',
                  slot.occupied ? 'is-occupied' : 'is-empty',
                ].filter(Boolean).join(' ')}
                style={workbenchImageSrc ? { '--small-apc-workbench-bg': `url("${workbenchImageSrc}")` } : undefined}
              >
                <div className="small-apc-sorting-slot-card__top">
                  <strong>{slot.title}</strong>
                  <span className={`small-apc-sorting-slot-card__badge is-${String(slot.statusTone || 'pending')}`.trim()}>
                    {slot.statusLabel}
                  </span>
                </div>
                {slot.occupied ? (
                  <div className="small-apc-sorting-slot-card__occupied">
                    <div className="small-apc-sorting-slot-card__copy">
                      <span>{slot.statusLabel}</span>
                      <em>{slot.detailText}</em>
                      <em>{slot.metaText}</em>
                    </div>
                    {slot.showStemRemovalAnimation ? (
                      <div className="small-apc-workbench-card__animation" aria-hidden="true">
                        <iframe
                          className="small-apc-workbench-card__animation-frame"
                          title={`${slot.title}-stem-removal-animation`}
                          srcDoc={SMALL_APC_STEM_REMOVAL_CARD_SRC_DOC}
                          tabIndex={-1}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="small-apc-sorting-slot-card__idle">
                    <span>{slot.statusLabel}</span>
                    <em>{slot.detailText}</em>
                  </div>
                )}
              </div>
            ))}
            {packingWorkbenchCards.map((slot) => (
              <div
                key={slot.key}
                className={`small-apc-sorting-slot-card small-apc-sorting-slot-card--machine small-apc-packing-workbench-card ${slot.occupied ? 'is-occupied' : 'is-empty'}`.trim()}
                style={packingWorkbenchImageSrc ? { '--small-apc-workbench-bg': `url("${packingWorkbenchImageSrc}")` } : undefined}
              >
                <div className="small-apc-sorting-slot-card__top">
                  <strong>{slot.title}</strong>
                  <span className={`small-apc-sorting-slot-card__badge is-${String(slot.statusTone || 'pending')}`.trim()}>{slot.statusLabel}</span>
                </div>
                {slot.occupied ? (
                  <div className="small-apc-sorting-slot-card__occupied">
                    <div className="small-apc-sorting-slot-card__copy">
                      <span>{slot.statusLabel}</span>
                      <em>{slot.detailText}</em>
                      <em>{slot.metaText}</em>
                    </div>
                  </div>
                ) : (
                  <div className="small-apc-sorting-slot-card__idle">
                    <span>{slot.statusLabel}</span>
                    <em>{slot.detailText}</em>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="small-apc-workroom-buffer-section small-apc-workroom-buffer-section--output">
            <div className="small-apc-workroom-buffer-section__head">
              <strong>부분선별·꼭지제거 완료칸</strong>
              <span>{`${workroomProcessOutputBufferSlots.length}칸 사용 중`}</span>
            </div>
            <div className="small-apc-workroom-buffer-grid">
              {workroomProcessOutputBufferSlots.length > 0
                ? workroomProcessOutputBufferSlots.map((slot) => renderWorkroomBufferCard(slot, '빈 완료칸'))
                : renderWorkroomBufferCard(null, '빈 완료칸')}
            </div>
          </div>
          <div className="small-apc-workroom-buffer-section small-apc-workroom-buffer-section--output">
            <div className="small-apc-workroom-buffer-section__head">
              <strong>포장 완료칸</strong>
              <span>{`${workroomPackingOutputBufferSlots.length}/5칸 사용 중`}</span>
            </div>
            <div className="small-apc-workroom-buffer-grid">
              {Array.from({ length: 5 }, (_, index) => renderWorkroomBufferCard(workroomPackingOutputBufferSlots[index] || null, '빈 포장완료칸'))}
            </div>
          </div>
        </section>
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function SmallApcOverlay({
  open,
  title,
  pickupPanel = null,
  coldStoragePanel = null,
  officePanel = null,
  workshopPanel = null,
  loungePanel = null,
  staffRosterPanel = null,
  cafeteriaPanel = null,
  shippingPanel = null,
  view,
  closing = false,
  receivingDeskPanel = null,
  sortingPanel = null,
  staffingProfile = null,
  onOpenReceivingDesk,
  onOpenLoadingYard,
  onOpenSortingLine,
  onOpenPickup,
  onOpenColdStorage,
  onOpenOffice,
  onOpenWorkshop,
  onOpenLounge,
  onOpenCafeteria,
  onOpenShipping,
  onBack,
  onClose
}) {
  if (!open) return null;
  const actionOfEntryKey = (entryKey, label, onClick) => {
    return {
      key: entryKey,
      label,
      onClick,
    };
  };
  return (
    <>
      <div className={`confirm-modal-backdrop ${closing ? 'is-closing' : ''}`.trim()} onClick={onClose} />
      {view === 'coldStorage' ? (
        coldStoragePanel
      ) : (view === 'office' || view === 'officeSettlement') ? (
        officePanel
      ) : view === 'workshop' ? (
        workshopPanel
      ) : view === 'lounge' ? (
        loungePanel
      ) : view === 'staffRoster' ? (
        staffRosterPanel
      ) : view === 'cafeteria' ? (
        cafeteriaPanel
      ) : view === 'shipping' ? (
        shippingPanel
      ) : view === 'pickup' ? (
        pickupPanel
      ) : view === 'sorting' ? (
        sortingPanel
      ) : view === 'receiving' ? (
        receivingDeskPanel
      ) : (
        <MapEntryModal
          className={`confirm-modal confirm-modal--map-shop-entry confirm-modal--small-apc-entry ${closing ? 'is-closing' : ''}`.trim()}
          title={title}
          description="소형 APC 입구입니다. 접수 또는 보관 기능을 선택해 주세요."
          actions={[
            actionOfEntryKey('receiving', '출하접수대', onOpenReceivingDesk),
            actionOfEntryKey('loading-yard', '하차장', onOpenLoadingYard),
            actionOfEntryKey('sorting', '선별장', onOpenSortingLine),
            actionOfEntryKey('cold-storage', 'APC 저온창고', onOpenColdStorage),
            actionOfEntryKey('pickup', '물품 임시보관소', onOpenPickup),
            ...(officePanel && typeof onOpenOffice === 'function'
              ? [actionOfEntryKey('office', '사무실', onOpenOffice)]
              : []),
            ...(workshopPanel && typeof onOpenWorkshop === 'function'
              ? [actionOfEntryKey('workshop', '작업실', onOpenWorkshop)]
              : []),
            ...(typeof onOpenLounge === 'function'
              ? [actionOfEntryKey('lounge', '직원휴게실', onOpenLounge)]
              : []),
            ...(typeof onOpenCafeteria === 'function'
              ? [actionOfEntryKey('cafeteria', '식당', onOpenCafeteria)]
              : []),
            ...(typeof onOpenShipping === 'function'
              ? [actionOfEntryKey('shipping', '상품출고장', onOpenShipping)]
              : [])
          ]}
          onBack={onBack}
          onClose={onClose}
        />
      )}
    </>
  );
}

export function SmallApcColdStoragePanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  staffingProfile = null,
  coldStorageByBuilding = null,
  pendingUnloadRows = [],
  stemRemovalJobs = [],
  sortingJobs = [],
  onBack,
  onClose
}) {
  const coldStorageStaffMembers = React.useMemo(
    () => smallApcAssignedMembersOf(staffingProfile?.facilityByEntryKey?.['cold-storage'] || null),
    [staffingProfile]
  );
  const [activeTabKey, setActiveTabKey] = React.useState(SMALL_APC_COLD_STORAGE_TABS[0]?.key || 'building-1');
  const [sortingNowTick, setSortingNowTick] = React.useState(() => Date.now());
  const [tabSlideClassName, setTabSlideClassName] = React.useState('');
  const [visibleLayerBySlot, setVisibleLayerBySlot] = React.useState({});
  const [slotLayerAnimByNo, setSlotLayerAnimByNo] = React.useState({});
  const tabSlideTimerRef = React.useRef(null);
  const slotLayerAnimTimerRef = React.useRef({});
  const activeTab = SMALL_APC_COLD_STORAGE_TABS.find((tab) => tab.key === activeTabKey) || SMALL_APC_COLD_STORAGE_TABS[0];
  React.useEffect(() => () => {
    if (tabSlideTimerRef.current) {
      window.clearTimeout(tabSlideTimerRef.current);
      tabSlideTimerRef.current = null;
    }
    Object.values(slotLayerAnimTimerRef.current || {}).forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    slotLayerAnimTimerRef.current = {};
  }, []);
  React.useEffect(() => {
    const normalizedSortingJobs = Array.isArray(sortingJobs) ? sortingJobs : [];
    const normalizedStemRemovalJobs = Array.isArray(stemRemovalJobs) ? stemRemovalJobs : [];
    const now = Date.now();
    let nextTransitionAt = Number.POSITIVE_INFINITY;

    normalizedSortingJobs.forEach((job) => {
      const moveInStartedAt = Math.max(0, Number(job?.moveInStartedAt || 0));
      const startedAt = Math.max(0, Number(job?.startedAt || 0));
      const durationMs = Math.max(100, Number(job?.durationMs || 0));
      const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || 3000));
      const finishedAt = startedAt + durationMs;
      const clearedAt = finishedAt + moveOutDurationMs;

      [moveInStartedAt, startedAt, finishedAt, clearedAt].forEach((timestamp) => {
        if (timestamp > now && timestamp < nextTransitionAt) {
          nextTransitionAt = timestamp;
        }
      });
    });

    normalizedStemRemovalJobs.forEach((job) => {
      const moveInStartedAt = Math.max(0, Number(job?.moveInStartedAt || 0));
      const startedAt = Math.max(0, Number(job?.startedAt || 0));
      const durationMs = Math.max(100, Number(job?.durationMs || 0));
      const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || 3000));
      const finishedAt = startedAt + durationMs;
      const clearedAt = finishedAt + moveOutDurationMs;

      [moveInStartedAt, startedAt, finishedAt, clearedAt].forEach((timestamp) => {
        if (timestamp > now && timestamp < nextTransitionAt) {
          nextTransitionAt = timestamp;
        }
      });
    });

    if (!Number.isFinite(nextTransitionAt)) return undefined;

    const delayMs = Math.max(80, nextTransitionAt - now + 24);
    const timerId = window.setTimeout(() => {
      setSortingNowTick(Date.now());
    }, delayMs);

    return () => window.clearTimeout(timerId);
  }, [sortingJobs, sortingNowTick, stemRemovalJobs]);
  const activeStemRemovalSourceRowKeySet = React.useMemo(() => {
    const now = sortingNowTick;
    return new Set(
      (Array.isArray(stemRemovalJobs) ? stemRemovalJobs : [])
        .filter((job) => {
          const sourceRowKey = String(job?.sourceSlotRowKey || job?.sourceRowKey || '').trim();
          if (!sourceRowKey) return false;
          const moveInStartedAt = Math.max(0, Number(job?.moveInStartedAt || 0));
          const startedAt = Math.max(0, Number(job?.startedAt || 0));
          const durationMs = Math.max(100, Number(job?.durationMs || 0));
          const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || 3000));
          const clearedAt = startedAt + durationMs + moveOutDurationMs;
          return now >= moveInStartedAt && now < clearedAt;
        })
        .map((job) => String(job?.sourceSlotRowKey || job?.sourceRowKey || '').trim())
        .filter(Boolean)
    );
  }, [sortingNowTick, stemRemovalJobs]);
  const activeSortingSourceRowKeySet = React.useMemo(() => {
    const now = sortingNowTick;
    return new Set(
      (Array.isArray(sortingJobs) ? sortingJobs : [])
        .filter((job) => {
          const sourceRowKey = String(job?.sourceSlotRowKey || job?.sourceRowKey || '').trim();
          if (!sourceRowKey) return false;
          const moveInStartedAt = Math.max(0, Number(job?.moveInStartedAt || 0));
          const startedAt = Math.max(0, Number(job?.startedAt || 0));
          const durationMs = Math.max(100, Number(job?.durationMs || 0));
          const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || 3000));
          const clearedAt = startedAt + durationMs + moveOutDurationMs;
          return now >= moveInStartedAt && now < clearedAt;
        })
        .map((job) => String(job?.sourceSlotRowKey || job?.sourceRowKey || '').trim())
        .filter(Boolean)
    );
  }, [sortingJobs, sortingNowTick]);
  const visibleSlotRows = React.useMemo(() => {
    const sourceSlots = Array.isArray(coldStorageByBuilding?.[activeTab?.key]) ? coldStorageByBuilding[activeTab.key] : [];
    return Array.from({ length: 20 }, (_, index) => ({
      slotNo: index + 1,
      storedEntry: (() => {
        const sourceEntry = sourceSlots[index] && typeof sourceSlots[index] === 'object' ? sourceSlots[index] : null;
        const sourceRowKey = String(sourceEntry?.slotRowKey || sourceEntry?.rowKey || '').trim();
        if (sourceRowKey && activeStemRemovalSourceRowKeySet.has(sourceRowKey)) {
          return null;
        }
        if (sourceRowKey && activeSortingSourceRowKeySet.has(sourceRowKey)) {
          return null;
        }
        return sourceEntry;
      })(),
    }));
  }, [activeSortingSourceRowKeySet, activeStemRemovalSourceRowKeySet, activeTab?.key, coldStorageByBuilding]);
  const occupiedCount = visibleSlotRows.filter((row) => row?.storedEntry).length;
  const layerEntriesOf = React.useCallback((storedEntry = null) => {
    if (!storedEntry) return [];
    const explicitLayerEntries = Array.isArray(storedEntry?.layerEntries)
      ? storedEntry.layerEntries.filter(Boolean)
      : [];
    if (explicitLayerEntries.length) return explicitLayerEntries.slice(0, 3);
    const totalBoxCount = Math.max(0, Math.floor(Number(storedEntry?.boxCount || 0)));
    const totalKg = Math.max(0, Number(storedEntry?.totalKg || 0));
    if (totalBoxCount <= 0 || totalKg <= 0) return [];
    const approxBoxKg = totalBoxCount > 0 ? (totalKg / totalBoxCount) : 20;
    let remainingBoxCount = totalBoxCount;
    let remainingKg = totalKg;
    const layers = [];
    while (remainingBoxCount > 0 && layers.length < 3) {
      const layerBoxCount = Math.min(36, remainingBoxCount);
      const layerKg = remainingBoxCount === layerBoxCount
        ? remainingKg
        : Math.min(remainingKg, layerBoxCount * approxBoxKg);
      layers.push({
        ...storedEntry,
        boxCount: layerBoxCount,
        totalKg: layerKg,
      });
      remainingBoxCount -= layerBoxCount;
      remainingKg = Math.max(0, remainingKg - layerKg);
    }
    return layers;
  }, []);
  React.useEffect(() => {
    setVisibleLayerBySlot((prev) => {
      const next = {};
      let changed = false;
      visibleSlotRows.forEach((row) => {
        const slotNo = Math.max(0, Number(row?.slotNo || 0));
        const layerEntries = layerEntriesOf(row?.storedEntry);
        const maxLayerIndex = Math.max(0, layerEntries.length - 1);
        if (slotNo <= 0 || maxLayerIndex <= 0) {
          if (prev?.[slotNo]) changed = true;
          return;
        }
        const currentVisibleLayer = Math.max(0, Math.min(maxLayerIndex, Math.floor(Number(prev?.[slotNo]) || 0)));
        next[slotNo] = currentVisibleLayer;
        if (prev?.[slotNo] !== currentVisibleLayer) changed = true;
      });
      if (!changed && Object.keys(prev || {}).length === Object.keys(next).length) {
        return prev;
      }
      return next;
    });
  }, [layerEntriesOf, visibleSlotRows]);
  const sortingStatusBySourceRowKey = React.useMemo(() => {
    const now = sortingNowTick;
    return (Array.isArray(sortingJobs) ? sortingJobs : []).reduce((acc, job) => {
      const sourceRowKey = String(job?.sourceSlotRowKey || job?.sourceRowKey || '').trim();
      if (!sourceRowKey) return acc;
      const moveInStartedAt = Math.max(0, Number(job?.moveInStartedAt || 0));
      const moveInDurationMs = Math.max(100, Number(job?.moveInDurationMs || 3000));
      const startedAt = Math.max(0, Number(job?.startedAt || 0));
      const durationMs = Math.max(100, Number(job?.durationMs || 0));
      const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || 3000));
      const finishedAt = startedAt + durationMs;
      const clearedAt = finishedAt + moveOutDurationMs;
      let state = 'queued';
      let label = '선별대기';
      let toneClassName = 'warehouse-workbench-inout-slot-actions__chip--output';
      if (now >= clearedAt) {
        state = 'done';
        label = '선별완료';
        toneClassName = 'warehouse-workbench-inout-slot-actions__chip--input';
      } else if (now >= finishedAt) {
        state = 'moving-out';
        label = '선별라인 정리중';
        toneClassName = 'warehouse-workbench-inout-slot-actions__chip--output';
      } else if (now >= startedAt) {
        state = 'active';
        label = '선별중';
        toneClassName = 'warehouse-workbench-inout-slot-actions__chip--input';
      } else if (now >= moveInStartedAt) {
        state = 'moving-in';
        label = '선별기로 이동중';
        toneClassName = 'warehouse-workbench-inout-slot-actions__chip--output';
      }
      acc[sourceRowKey] = {
        state,
        label,
        toneClassName,
        lineNo: Math.max(1, Number(job?.lineNo || 1)),
        ticketNo: String(job?.ticketNo || '').trim(),
      };
      return acc;
    }, {});
  }, [sortingJobs, sortingNowTick]);
  const coldStorageSlotRows = React.useMemo(
    () => visibleSlotRows.map((row) => {
      const storedEntry = row?.storedEntry || null;
      const layerEntries = layerEntriesOf(storedEntry);
      const currentLayerIndex = Math.max(0, Math.min(layerEntries.length - 1, Math.floor(Number(visibleLayerBySlot?.[row.slotNo]) || 0)));
      const visibleLayerEntry = layerEntries[currentLayerIndex] || null;
      const isUnloadBuilding = String(activeTab?.key || '') === 'building-1';
      const isShippingBuilding = String(activeTab?.key || '') === 'building-3';
      const boxTone = isShippingBuilding && Boolean(String(visibleLayerEntry?.apcPackTypeLabel || storedEntry?.apcPackTypeLabel || '').trim())
        ? 'packed'
        : 'yellow';
      const visibleBoxCount = Math.max(0, Math.floor(Number(visibleLayerEntry?.boxCount || 0)));
      const sortingStatus = sortingStatusBySourceRowKey[String(storedEntry?.slotRowKey || storedEntry?.rowKey || '').trim()] || null;
      const shipperMemoLabel = String(visibleLayerEntry?.shipperName || storedEntry?.shipperName || '').trim();
      const cropMemoLabelRaw = String(visibleLayerEntry?.cropLabel || storedEntry?.cropLabel || '').trim();
      const produceMemoLabel = String(visibleLayerEntry?.produceTypeLabel || storedEntry?.produceTypeLabel || '').trim();
      const cropMemoLabel = cropMemoLabelRaw && cropMemoLabelRaw !== '수확물'
        ? cropMemoLabelRaw
        : (produceMemoLabel || cropMemoLabelRaw);
      return {
        slotNo: row.slotNo,
        occupied: Boolean(storedEntry),
        storedEntry,
        layerEntries,
        currentLayerIndex,
        visibleLayerEntry,
        visibleBoxCount,
        boxTone,
        sortingStatus,
        labelText: isUnloadBuilding
          ? [shipperMemoLabel, cropMemoLabel].filter(Boolean).join('-')
          : `${String(visibleLayerEntry?.qualityLabel || storedEntry?.qualityLabel || '보통')} / ${String(visibleLayerEntry?.gradeLabel || storedEntry?.gradeLabel || '미선별')}`,
        detailText: `${String(visibleLayerEntry?.sizeLabel || storedEntry?.sizeLabel || '미측정')} · ${visibleBoxCount}상자`,
      };
    }),
    [activeTab?.key, layerEntriesOf, sortingStatusBySourceRowKey, visibleLayerBySlot, visibleSlotRows]
  );
  const harvestPalletBoxToneAt = React.useCallback((entry) => {
    const tone = String(entry?.boxTone || '').trim();
    if (tone === 'packed') return 'packed';
    return tone === 'green' ? 'green' : 'yellow';
  }, []);
  const sortedStorageRows = React.useMemo(() => (
    visibleSlotRows
      .map((row) => ({
        slotNo: Math.max(0, Number(row?.slotNo || 0)),
        entry: row?.storedEntry || null,
      }))
      .filter(({ entry }) => entry && String(entry?.gradeLabel || '미선별').trim() !== '미선별')
  ), [visibleSlotRows]);
  const pendingUnloadSummary = React.useMemo(() => {
    const rows = (Array.isArray(pendingUnloadRows) ? pendingUnloadRows : []).filter(Boolean);
    return {
      rowCount: rows.length,
      boxCount: rows.reduce((sum, row) => sum + Math.max(0, Number(row?.boxCount || 0)), 0),
      totalKg: rows.reduce((sum, row) => sum + Math.max(0, Number(row?.totalKg || 0)), 0),
    };
  }, [pendingUnloadRows]);

  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">소형 APC</div>
          <h2>APC 저온창고</h2>
        </div>
      </div>
      <div className="small-apc-receiving-layout">
        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-overview-stage">
            <SmallApcStaffDeploymentPanel members={coldStorageStaffMembers} />
          </div>
          <div className="small-apc-receiving-card__head">
            <strong>공정별 저온동</strong>
            <span>{`${activeTab?.fullLabel || '1동 하차동'} · ${occupiedCount}/20칸 사용 중`}</span>
          </div>
          <div className="focus-tabs small-apc-cold-storage-tabs" role="tablist" aria-label="APC 저온창고 보관동 선택">
            {SMALL_APC_COLD_STORAGE_TABS.map((tab) => {
              const selected = tab.key === activeTab?.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`focus-tab focus-tab--farm-main-animate ${selected ? 'is-active focus-tab--active' : ''}`.trim()}
                  onClick={() => {
                    if (tab.key === activeTab?.key) return;
                    const currentIndex = SMALL_APC_COLD_STORAGE_TABS.findIndex((item) => item.key === activeTab?.key);
                    const nextIndex = SMALL_APC_COLD_STORAGE_TABS.findIndex((item) => item.key === tab.key);
                    const nextSlideClassName = nextIndex > currentIndex
                      ? 'is-tab-sliding-left'
                      : 'is-tab-sliding-right';
                    if (tabSlideTimerRef.current) {
                      window.clearTimeout(tabSlideTimerRef.current);
                      tabSlideTimerRef.current = null;
                    }
                    setTabSlideClassName('');
                    window.setTimeout(() => {
                      setActiveTabKey(tab.key);
                      setTabSlideClassName(nextSlideClassName);
                      tabSlideTimerRef.current = window.setTimeout(() => {
                        setTabSlideClassName('');
                        tabSlideTimerRef.current = null;
                      }, 280);
                    }, 0);
                  }}
                >
                  <span>{tab.fullLabel || tab.label}</span>
                </button>
              );
            })}
          </div>
          <div className="small-apc-receiving-queue" style={{ marginTop: 14, marginBottom: 12 }}>
            <div className="small-apc-receiving-queue__item small-apc-receiving-queue__item--text-only is-issued small-apc-office-settlement-card">
              <div className="small-apc-receiving-queue__content small-apc-receiving-queue__content--text-only">
                <div className="small-apc-receiving-queue__text">
                  <b>{String(activeTab?.summary || '저온 보관동 설명 준비 중입니다.')}</b>
                  <em>{String(activeTab?.actionHint || '')}</em>
                </div>
              </div>
            </div>
          </div>
          {activeTab?.key === 'building-1' && pendingUnloadSummary.rowCount > 0 ? (
            <div className="small-apc-receiving-queue" style={{ marginBottom: 12 }}>
              <div className="small-apc-receiving-queue__item small-apc-receiving-queue__item--text-only is-waiting small-apc-office-settlement-card">
                <div className="small-apc-receiving-queue__content small-apc-receiving-queue__content--text-only">
                  <div className="small-apc-receiving-queue__text">
                    <b>{`1동 만석으로 반입 대기 ${pendingUnloadSummary.rowCount}칸`}</b>
                    <em>{`${pendingUnloadSummary.boxCount.toLocaleString()}박스 · ${Math.max(0, Math.round(pendingUnloadSummary.totalKg)).toLocaleString()}kg · 빈칸이 생기면 자동으로 1동에 들어갑니다.`}</em>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className={`warehouse-harvest-slot-panel warehouse-harvest-slot-panel--small-apc-cold-storage ${tabSlideClassName}`.trim()}>
            <div className="warehouse-harvest-slot-panel__head">
              <strong>저장공간</strong>
              <span>총 20칸</span>
            </div>
            <div className="warehouse-harvest-slot-grid small-apc-cold-storage-slot-grid">
              {coldStorageSlotRows.map((slot) => {
                if (!slot?.occupied || !slot?.visibleLayerEntry) {
                  return (
                    <div
                      key={`small-apc-cold-slot-${slot.slotNo}`}
                      className="warehouse-harvest-slot-card warehouse-harvest-slot-card--empty small-apc-cold-storage-slot-card is-empty"
                    >
                      <strong>{`수확물 적재칸 ${slot.slotNo}`}</strong>
                      <span className="warehouse-harvest-slot-card__status">빈 저장공간</span>
                    </div>
                  );
                }
                const layerCount = Math.max(1, slot.layerEntries.length);
                const currentLayerNo = slot.currentLayerIndex + 1;
                const layerAnimClassName = String(slotLayerAnimByNo?.[slot.slotNo] || '').trim();
                const ghostLayerIndexes = layerCount > 1
                  ? Array.from({ length: layerCount }, (_, index) => index).filter((index) => index !== slot.currentLayerIndex)
                  : [];
                const boxEntries = Array.from({ length: 36 }, (_, boxIndex) => {
                  const storageBoxIndex = harvestPalletDisplayBoxIndexOf(boxIndex, 6, 36);
                  const filled = storageBoxIndex < slot.visibleBoxCount;
                  return {
                    key: `small-apc-cold-slot-${slot.slotNo}-layer-${currentLayerNo}-box-${boxIndex + 1}`,
                    filled,
                    tone: filled ? harvestPalletBoxToneAt({ boxTone: slot.boxTone }) : 'yellow',
                    text: filled
                      ? [
                        `팔레트 ${currentLayerNo}단`,
                        `품질: ${String(slot.visibleLayerEntry?.qualityLabel || '보통')}`,
                        `등급: ${String(slot.visibleLayerEntry?.gradeLabel || '미선별')}`,
                        `크기: ${String(slot.visibleLayerEntry?.sizeLabel || '미측정')}`,
                        `중량: 20kg`,
                        `선도: ${Math.max(0, Number(slot.visibleLayerEntry?.life || 0))}점`,
                      ].join('\n')
                      : '',
                  };
                });
                return (
                  <div
                    key={`small-apc-cold-slot-${slot.slotNo}`}
                    className="warehouse-harvest-slot-card warehouse-harvest-slot-card--occupied warehouse-harvest-slot-card--with-boxes warehouse-harvest-slot-card--single-layer warehouse-harvest-slot-card--cold-storage small-apc-cold-storage-slot-card small-apc-cold-storage-slot-card--occupied"
                  >
                    {slot.sortingStatus ? (
                      <div className="warehouse-harvest-slot-card__overlay-chips">
                        <span className={`warehouse-workbench-inout-slot-actions__chip ${slot.sortingStatus.toneClassName}`.trim()}>
                          {`${slot.sortingStatus.label} · L${Math.max(1, Number(slot.sortingStatus?.lineNo || 1))}`}
                        </span>
                      </div>
                    ) : null}
                    {layerCount > 1 ? (
                      <>
                        <button
                          type="button"
                          className={`warehouse-harvest-slot-layer-toggle warehouse-harvest-slot-layer-toggle--top ${slot.currentLayerIndex >= layerCount - 1 ? 'is-active' : ''}`.trim()}
                          aria-label="윗단 보기"
                          title="윗단 보기"
                          onClick={() => {
                            if (slot.currentLayerIndex >= layerCount - 1) return;
                            setSlotLayerAnimByNo((prev) => ({ ...(prev || {}), [slot.slotNo]: 'warehouse-harvest-slot-layer-card--anim-top' }));
                            if (slotLayerAnimTimerRef.current[slot.slotNo]) {
                              window.clearTimeout(slotLayerAnimTimerRef.current[slot.slotNo]);
                            }
                            slotLayerAnimTimerRef.current[slot.slotNo] = window.setTimeout(() => {
                              setSlotLayerAnimByNo((prev) => {
                                const next = { ...(prev || {}) };
                                delete next[slot.slotNo];
                                return next;
                              });
                              delete slotLayerAnimTimerRef.current[slot.slotNo];
                            }, 240);
                            setVisibleLayerBySlot((prev) => ({
                              ...(prev || {}),
                              [slot.slotNo]: Math.min(layerCount - 1, slot.currentLayerIndex + 1),
                            }));
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className={`warehouse-harvest-slot-layer-toggle warehouse-harvest-slot-layer-toggle--bottom ${slot.currentLayerIndex <= 0 ? 'is-active' : ''}`.trim()}
                          aria-label="아랫단 보기"
                          title="아랫단 보기"
                          onClick={() => {
                            if (slot.currentLayerIndex <= 0) return;
                            setSlotLayerAnimByNo((prev) => ({ ...(prev || {}), [slot.slotNo]: 'warehouse-harvest-slot-layer-card--anim-bottom' }));
                            if (slotLayerAnimTimerRef.current[slot.slotNo]) {
                              window.clearTimeout(slotLayerAnimTimerRef.current[slot.slotNo]);
                            }
                            slotLayerAnimTimerRef.current[slot.slotNo] = window.setTimeout(() => {
                              setSlotLayerAnimByNo((prev) => {
                                const next = { ...(prev || {}) };
                                delete next[slot.slotNo];
                                return next;
                              });
                              delete slotLayerAnimTimerRef.current[slot.slotNo];
                            }, 240);
                            setVisibleLayerBySlot((prev) => ({
                              ...(prev || {}),
                              [slot.slotNo]: Math.max(0, slot.currentLayerIndex - 1),
                            }));
                          }}
                        >
                          ▼
                        </button>
                      </>
                    ) : null}
                    <div className="warehouse-harvest-slot-stack small-apc-cold-storage-slot-card__stack">
                      {ghostLayerIndexes.map((layerIndex, ghostIndex) => (
                        <div
                          key={`small-apc-cold-slot-${slot.slotNo}-ghost-${layerIndex + 1}`}
                          className={`small-apc-cold-storage-slot-card__ghost-layer small-apc-cold-storage-slot-card__ghost-layer--depth-${Math.min(ghostIndex + 1, 2)}`.trim()}
                          aria-hidden="true"
                        >
                          <span className="warehouse-harvest-slot-layer-card__badge">{`${layerIndex + 1}단`}</span>
                        </div>
                      ))}
                      <div className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--single is-active small-apc-cold-storage-slot-card__layer ${layerAnimClassName}`.trim()}>
                        <span className="warehouse-harvest-slot-layer-card__badge">{`${currentLayerNo}단`}</span>
                        <HarvestBoxGrid boxEntries={boxEntries} />
                      </div>
                      <span className="warehouse-harvest-slot-card__load-label small-apc-cold-storage-slot-card__load-label">
                        {`${slot.visibleBoxCount}박스/36박스`}
                      </span>
                    </div>
                    <div className="warehouse-harvest-slot-card__memo-text warehouse-harvest-slot-card__memo-text--bottom-inline small-apc-cold-storage-slot-card__memo-text">
                      {slot.labelText || slot.detailText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function SmallApcSortingPanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  initialSection = 'loading',
  mode = 'combined',
  staffingProfile = null,
  loadingSlotRows = [],
  sortingJobs = [],
  sortingOutputBins = [],
  coldStorageByBuilding = null,
  onBack,
  onClose
}) {
  const loadingSectionRef = React.useRef(null);
  const sortingSectionRef = React.useRef(null);
  const panelMode = String(mode || 'combined');
  const showLoadingSection = panelMode === 'combined' || panelMode === 'loading-only';
  const showSortingSection = panelMode === 'combined' || panelMode === 'sorting-only';
  const panelTitle = panelMode === 'loading-only'
    ? '하차장'
    : panelMode === 'sorting-only'
      ? '선별장'
      : '하차/선별장';
  const unloadSlotRows = Array.isArray(loadingSlotRows) ? loadingSlotRows : [];
  const loadingStaffMembers = React.useMemo(
    () => smallApcAssignedMembersOf(staffingProfile?.facilityByEntryKey?.['loading-yard'] || null),
    [staffingProfile]
  );
  const sortingStaffMembers = React.useMemo(
    () => smallApcAssignedMembersOf(staffingProfile?.facilityByEntryKey?.sorting || null),
    [staffingProfile]
  );
  const [slotMotionByNo, setSlotMotionByNo] = React.useState({});
  const prevUnloadSlotSnapshotRef = React.useRef({});
  const slotMotionTimeoutRef = React.useRef({});

  React.useEffect(() => {
    const prevSnapshot = prevUnloadSlotSnapshotRef.current || {};
    const nextSnapshot = {};
    const motionUpdates = {};

    unloadSlotRows.forEach((slot) => {
      const slotNo = Math.max(0, Number(slot?.slotNo || 0));
      if (slotNo <= 0) return;
      const snapshot = {
        occupied: Boolean(slot?.occupied),
        status: String(slot?.status || ''),
        statusLabel: String(slot?.statusLabel || ''),
        ticketNo: String(slot?.ticketNo || ''),
        parkedVehicleName: String(slot?.parkedVehicleName || ''),
      };
      nextSnapshot[slotNo] = snapshot;

      const prev = prevSnapshot[slotNo];
      if (!prev) return;

      const vehicleChanged = prev.ticketNo !== snapshot.ticketNo || prev.parkedVehicleName !== snapshot.parkedVehicleName;
      if (!prev.occupied && snapshot.occupied) {
        motionUpdates[slotNo] = { kind: 'enter', tick: Date.now() };
        return;
      }
      if (snapshot.occupied && vehicleChanged) {
        motionUpdates[slotNo] = { kind: 'enter', tick: Date.now() };
        return;
      }
      if (
        prev.occupied
        && snapshot.occupied
        && (prev.status !== snapshot.status || prev.statusLabel !== snapshot.statusLabel)
      ) {
        motionUpdates[slotNo] = { kind: 'status', tick: Date.now() };
      }
    });

    prevUnloadSlotSnapshotRef.current = nextSnapshot;

    const motionSlotNos = Object.keys(motionUpdates);
    if (!motionSlotNos.length) return undefined;

    setSlotMotionByNo((prev) => ({ ...prev, ...motionUpdates }));

    motionSlotNos.forEach((slotNoRaw) => {
      const slotNo = String(slotNoRaw);
      if (slotMotionTimeoutRef.current[slotNo]) {
        window.clearTimeout(slotMotionTimeoutRef.current[slotNo]);
      }
      slotMotionTimeoutRef.current[slotNo] = window.setTimeout(() => {
        setSlotMotionByNo((prev) => {
          if (!prev[slotNo]) return prev;
          const next = { ...prev };
          delete next[slotNo];
          return next;
        });
        delete slotMotionTimeoutRef.current[slotNo];
      }, 1300);
    });

    return undefined;
  }, [unloadSlotRows]);

  React.useEffect(() => () => {
    Object.values(slotMotionTimeoutRef.current || {}).forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    slotMotionTimeoutRef.current = {};
  }, []);
  React.useEffect(() => {
    if (!showLoadingSection && !showSortingSection) return;
    const targetSection = String(initialSection || 'loading') === 'sorting'
      ? sortingSectionRef.current
      : loadingSectionRef.current;
    if (!targetSection) return;
    window.requestAnimationFrame(() => {
      targetSection.scrollIntoView({ block: 'start', inline: 'nearest' });
    });
  }, [initialSection, showLoadingSection, showSortingSection]);
  const [inputPreviewIndexByLine, setInputPreviewIndexByLine] = React.useState({});
  const [inputPreviewMotionByLine, setInputPreviewMotionByLine] = React.useState({});
  const [sortingNowTick, setSortingNowTick] = React.useState(() => Date.now());
  React.useEffect(() => {
    const timerId = window.setInterval(() => {
      setSortingNowTick(Date.now());
    }, 120);
    return () => window.clearInterval(timerId);
  }, []);
  const sorterImageSrc = constructionFacilityImageSrcOf('appleSortingLineSmall');
  const coldStorageSourceRowMap = React.useMemo(() => {
    const rows = Object.values(coldStorageByBuilding || {}).flatMap((buildingRows) => (
      Array.isArray(buildingRows) ? buildingRows : []
    ));
    return rows.reduce((acc, entry) => {
      const sourceKey = String(entry?.slotRowKey || entry?.rowKey || '').trim();
      if (!sourceKey || acc[sourceKey]) return acc;
      acc[sourceKey] = entry;
      return acc;
    }, {});
  }, [coldStorageByBuilding]);
  const machineLineRows = React.useMemo(() => {
    const normalizedJobs = Array.isArray(sortingJobs) ? sortingJobs : [];
    return SMALL_APC_SORTING_MACHINE_SLOTS.map((slot, index) => {
      const lineNo = index + 1;
      const lineJobs = normalizedJobs
        .filter((job) => Math.max(1, Number(job?.lineNo || 1)) === lineNo)
        .sort((a, b) => Math.max(0, Number(a?.startedAt || 0)) - Math.max(0, Number(b?.startedAt || 0)));
      const activeJob = lineJobs.find((job) => {
        const startedAt = Math.max(0, Number(job?.startedAt || 0));
        const durationMs = Math.max(100, Number(job?.durationMs || 0));
        return sortingNowTick >= startedAt && sortingNowTick < startedAt + durationMs;
      }) || null;
      const movingInJob = !activeJob
        ? lineJobs.find((job) => {
            const moveInStartedAt = Math.max(0, Number(job?.moveInStartedAt || 0));
            const startedAt = Math.max(0, Number(job?.startedAt || 0));
            return sortingNowTick >= moveInStartedAt && sortingNowTick < startedAt;
          }) || null
        : null;
      const completedDisplayJob = !activeJob && !movingInJob
        ? lineJobs.find((job) => {
            const startedAt = Math.max(0, Number(job?.startedAt || 0));
            const durationMs = Math.max(100, Number(job?.durationMs || 0));
            const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || 3000));
            const finishedAt = startedAt + durationMs;
            const completionDisplayMs = Math.min(900, Math.max(400, Math.round(moveOutDurationMs * 0.25)));
            const moveOutStartedAt = Math.min(finishedAt + completionDisplayMs, finishedAt + moveOutDurationMs);
            return sortingNowTick >= finishedAt && sortingNowTick < moveOutStartedAt;
          }) || null
        : null;
      const movingOutDisplayJob = !activeJob && !movingInJob && !completedDisplayJob
        ? lineJobs.find((job) => {
            const startedAt = Math.max(0, Number(job?.startedAt || 0));
            const durationMs = Math.max(100, Number(job?.durationMs || 0));
            const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || 3000));
            const finishedAt = startedAt + durationMs;
            const completionDisplayMs = Math.min(900, Math.max(400, Math.round(moveOutDurationMs * 0.25)));
            const moveOutStartedAt = Math.min(finishedAt + completionDisplayMs, finishedAt + moveOutDurationMs);
            const moveOutFinishedAt = finishedAt + moveOutDurationMs;
            return sortingNowTick >= moveOutStartedAt && sortingNowTick < moveOutFinishedAt;
          }) || null
        : null;
      const cleanupDisplayJob = !activeJob && !movingInJob && !completedDisplayJob && !movingOutDisplayJob
        ? lineJobs.find((job) => {
            const startedAt = Math.max(0, Number(job?.startedAt || 0));
            const durationMs = Math.max(100, Number(job?.durationMs || 0));
            const moveOutDurationMs = Math.max(100, Number(job?.moveOutDurationMs || 3000));
            const finishedAt = startedAt + durationMs;
            const moveOutFinishedAt = finishedAt + moveOutDurationMs;
            return sortingNowTick >= moveOutFinishedAt && sortingNowTick < moveOutFinishedAt + SMALL_APC_SORTING_IDLE_GAP_MS;
          }) || null
        : null;
      const queuedJobs = lineJobs.filter((job) => (
        sortingNowTick < Math.max(0, Number(job?.moveInStartedAt || job?.startedAt || 0))
      ));
      const queuedJob = !activeJob && !movingInJob && !completedDisplayJob && !movingOutDisplayJob && !cleanupDisplayJob
        ? lineJobs.find((job) => sortingNowTick < Math.max(0, Number(job?.moveInStartedAt || job?.startedAt || 0))) || null
        : null;
      const currentJob = activeJob || movingInJob || completedDisplayJob || movingOutDisplayJob || cleanupDisplayJob || queuedJob || null;
      if (!currentJob) {
        return {
          ...slot,
          state: '대기',
          detail: '작업 배정 전',
          statusTone: 'pending',
          currentJob: null,
          queueCount: 0,
          progressPct: 0,
        };
      }
      const moveInStartedAt = Math.max(0, Number(currentJob?.moveInStartedAt || 0));
      const startedAt = Math.max(0, Number(currentJob?.startedAt || 0));
      const durationMs = Math.max(100, Number(currentJob?.durationMs || 0));
      const moveInDurationMs = Math.max(100, Number(currentJob?.moveInDurationMs || 3000));
      const moveOutDurationMs = Math.max(100, Number(currentJob?.moveOutDurationMs || 3000));
      const finishedAt = startedAt + durationMs;
      const completionDisplayMs = Math.min(900, Math.max(400, Math.round(moveOutDurationMs * 0.25)));
      const moveOutStartedAt = Math.min(finishedAt + completionDisplayMs, finishedAt + moveOutDurationMs);
      const moveOutFinishedAt = finishedAt + moveOutDurationMs;
      const cleanupFinishedAt = moveOutFinishedAt + SMALL_APC_SORTING_IDLE_GAP_MS;
      const elapsedMs = sortingNowTick - startedAt;
      const cleanupProgressRatio = (movingOutDisplayJob || cleanupDisplayJob)
        ? Math.max(
            0,
            Math.min(
              1,
              (sortingNowTick - moveOutStartedAt) / Math.max(100, cleanupFinishedAt - moveOutStartedAt)
            )
          )
        : 0;
      const progressRatio = activeJob
        ? Math.max(0, Math.min(1, elapsedMs / durationMs))
        : movingInJob
          ? Math.max(0, Math.min(1, (sortingNowTick - moveInStartedAt) / moveInDurationMs))
          : completedDisplayJob
            ? 1
            : ((movingOutDisplayJob || cleanupDisplayJob) ? cleanupProgressRatio : 0);
      const progressPct = activeJob || movingInJob
        ? Math.max(0, Math.min(100, Math.round(progressRatio * 100)))
        : completedDisplayJob
          ? 100
          : ((movingOutDisplayJob || cleanupDisplayJob) ? Math.max(0, Math.min(100, Math.round(progressRatio * 100))) : 0);
      const currentJobBoxCount = Math.max(0, Math.floor(Number(currentJob?.boxCount || 0)));
      const remainingBoxCount = activeJob
        ? Math.max(0, Math.ceil(currentJobBoxCount * (1 - progressRatio)))
          : movingInJob
            ? currentJobBoxCount
          : (queuedJob ? currentJobBoxCount : 0);
      const shipperName = String(currentJob?.shipperName || '').trim();
      const ticketNo = String(currentJob?.ticketNo || '').trim();
      const cargoKg = Math.max(0, Number(currentJob?.cargoKg || 0));
      const detailParts = [
        shipperName ? `출하자 ${shipperName}` : '',
        cargoKg > 0 ? `${cargoKg.toLocaleString()}kg` : '',
        ticketNo,
      ].filter(Boolean);
      const statusTone = activeJob ? 'unloading' : ((movingInJob || queuedJob) ? 'waiting' : 'done');
      const totalAssignedBoxCount = lineJobs.reduce(
        (sum, job) => sum + Math.max(0, Math.floor(Number(job?.boxCount || 0))),
        0
      );
      const queuedBoxCount = Math.max(
        0,
        queuedJobs.reduce((sum, job) => sum + Math.max(0, Math.floor(Number(job?.boxCount || 0))), 0)
      );
      const inputPreviewJobs = lineJobs
        .filter((job) => {
          const startedAt = Math.max(0, Number(job?.startedAt || 0));
          const durationMs = Math.max(100, Number(job?.durationMs || 0));
          return sortingNowTick < startedAt + durationMs;
        })
        .flatMap((job) => {
          const moveInStartedAt = Math.max(0, Number(job?.moveInStartedAt || 0));
          const moveInDurationMs = Math.max(100, Number(job?.moveInDurationMs || 3000));
          const startedAt = Math.max(0, Number(job?.startedAt || 0));
          const durationMs = Math.max(100, Number(job?.durationMs || 0));
          const boxCount = Math.max(0, Math.floor(Number(job?.boxCount || 0)));
          const previewState = sortingNowTick >= startedAt && sortingNowTick < startedAt + durationMs
            ? 'active'
            : sortingNowTick >= moveInStartedAt && sortingNowTick < startedAt
              ? 'moving-in'
              : 'queued';
          const moveInProgressRatio = previewState === 'moving-in'
            ? Math.max(0, Math.min(1, (sortingNowTick - moveInStartedAt) / moveInDurationMs))
            : 1;
          const activeProgressRatio = previewState === 'active'
            ? Math.max(0, Math.min(1, (sortingNowTick - startedAt) / durationMs))
            : 0;
          const inputPreviewVisibleExactCount = previewState === 'moving-in'
            ? Math.max(0, Math.min(boxCount, boxCount * moveInProgressRatio))
            : previewState === 'active'
              ? Math.max(0, Math.min(boxCount, boxCount * (1 - activeProgressRatio)))
              : boxCount;
          const inputPreviewVisibleBoxCount = previewState === 'moving-in'
            ? Math.max(0, Math.min(boxCount, Math.round(boxCount * moveInProgressRatio)))
            : previewState === 'active'
              ? Math.max(0, Math.min(boxCount, Math.ceil(boxCount * (1 - activeProgressRatio))))
              : boxCount;
          const sourceStoredEntry = coldStorageSourceRowMap[String(job?.sourceSlotRowKey || job?.sourceRowKey || '').trim()] || null;
          const palletCapacity = 36;
          const previewPalletCount = Math.max(1, Math.ceil(boxCount / palletCapacity));
          return Array.from({ length: previewPalletCount }, (_, palletIndex) => {
            const palletOffset = palletIndex * palletCapacity;
            const chunkBoxCount = Math.max(0, Math.min(palletCapacity, boxCount - palletOffset));
            const chunkVisibleExactCount = Math.max(
              0,
              Math.min(
                chunkBoxCount,
                Number(inputPreviewVisibleExactCount || 0) - palletOffset
              )
            );
            const chunkVisibleBoxCount = Math.max(
              0,
              Math.min(
                chunkBoxCount,
                Math.floor(Number(inputPreviewVisibleBoxCount || 0) - palletOffset)
              )
            );
            return {
              ...job,
              id: `${String(job?.id || `sorting-${lineNo}-${ticketNo || 'job'}`)}-preview-${palletIndex + 1}`,
              previewState,
              previewPalletIndex: palletIndex,
              previewPalletCount,
              previewPalletOffset: palletOffset,
              boxCount: chunkBoxCount,
              inputPreviewVisibleExactCount: chunkVisibleExactCount,
              inputPreviewVisibleBoxCount: chunkVisibleBoxCount,
              sourceStoredEntry: sourceStoredEntry
                ? {
                  ...sourceStoredEntry,
                  boxCount: chunkBoxCount,
                }
                : sourceStoredEntry,
            };
          });
        });
      const actualInputJob = inputPreviewJobs.find((job) => (
        job?.previewState === 'active' || job?.previewState === 'moving-in'
      )) || null;
      return {
        ...slot,
        state: activeJob
          ? '선별 진행 중'
          : movingInJob
            ? '선별기로 이동중'
            : completedDisplayJob
              ? '선별 완료'
              : movingOutDisplayJob
                ? '선별라인 정리중'
                : cleanupDisplayJob
                  ? '선별라인 정리중'
                  : '선별 대기',
        detail: detailParts.join(' · ') || '작업 배정됨',
        statusTone,
        currentJob,
        sourceStoredEntry: currentJob
          ? (coldStorageSourceRowMap[String(currentJob?.sourceSlotRowKey || currentJob?.sourceRowKey || '').trim()] || null)
          : null,
        queueCount: Math.max(0, (currentJob ? 1 : 0) + queuedJobs.length),
        currentJobBoxCount,
        remainingBoxCount,
        totalAssignedBoxCount,
        queuedBoxCount,
        progressPct,
        actualInputJob,
        inputPreviewJobs,
      };
    });
  }, [coldStorageSourceRowMap, sortingJobs, sortingNowTick]);
  React.useEffect(() => {
    setInputPreviewIndexByLine((prev) => {
      let changed = false;
      const next = { ...prev };
      machineLineRows.forEach((slot) => {
        const lineKey = String(slot?.key || `sorter-${Math.max(1, Number(slot?.lineNo || 1))}`);
        const previewJobs = Array.isArray(slot?.inputPreviewJobs) ? slot.inputPreviewJobs : [];
        const previewCount = previewJobs.length;
        const currentIndex = Math.max(0, Math.floor(Number(prev?.[lineKey]) || 0));
        if (previewCount <= 0) {
          if (Object.prototype.hasOwnProperty.call(next, lineKey)) {
            delete next[lineKey];
            changed = true;
          }
          return;
        }
        const boundedIndex = Math.min(currentIndex, previewCount - 1);
        if (boundedIndex !== currentIndex) {
          next[lineKey] = boundedIndex;
          changed = true;
        } else if (!Object.prototype.hasOwnProperty.call(next, lineKey)) {
          const movingInIndex = previewJobs.findIndex((job) => String(job?.previewState || '') === 'moving-in');
          next[lineKey] = movingInIndex >= 0 ? movingInIndex : 0;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [machineLineRows]);
  const sortingOutputBinsSummary = React.useMemo(() => {
    const normalizedBins = Array.isArray(sortingOutputBins) ? sortingOutputBins : [];
    const groupedBinMap = normalizedBins.reduce((acc, entry) => {
      const gradeLabel = String(entry?.gradeLabel || '').trim();
      const dieKey = String(entry?.dieKey || '').trim();
      const freshnessBucketLabel = String(entry?.freshnessBucketLabel || '').trim() || '중';
      if (!gradeLabel || !dieKey) {
        return acc;
      }
      const key = `${gradeLabel}:${dieKey}:${freshnessBucketLabel}`;
      if (!acc[key]) {
        acc[key] = {
          gradeLabel,
          dieKey,
          freshnessBucketLabel,
          totalKg: 0,
          ticketNos: new Set(),
        };
      }
      acc[key].totalKg += Math.max(0, Number(entry?.totalKg || 0));
      const ticketNoCandidates = Array.isArray(entry?.ticketNos) && entry.ticketNos.length
        ? entry.ticketNos
        : [entry?.ticketNo];
      ticketNoCandidates
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .forEach((ticketNo) => {
          acc[key].ticketNos.add(ticketNo);
        });
      return acc;
    }, {});
    const gradeOrder = ['A급', 'B급', '가공급'];
    const freshnessBucketOrder = ['상', '중', '하'];
    const bins = gradeOrder.flatMap((gradeLabel) => (
      Array.from({ length: 10 }, (_, dieIndex) => {
        const dieNo = dieIndex + 1;
        const dieKey = `die${dieNo}`;
        return freshnessBucketOrder.map((freshnessBucketLabel) => {
          const matched = groupedBinMap[`${gradeLabel}:${dieKey}:${freshnessBucketLabel}`] || null;
          const totalKg = Math.max(0, Number(matched?.totalKg || 0));
          const visibleBoxCount = Math.max(0, Math.min(36, Math.ceil(totalKg / 20)));
          return {
            key: `sorting-output-${gradeLabel}-${dieKey}-${freshnessBucketLabel}`,
            gradeLabel,
            dieKey,
            dieLabel: `${dieNo}다이`,
            freshnessBucketLabel,
            boxCount: visibleBoxCount,
            totalKg,
            ticketNos: matched ? Array.from(matched.ticketNos) : [],
            occupied: visibleBoxCount > 0,
          };
        });
      }).flat()
    ));
    const visibleBins = bins.filter((entry) => entry.occupied);
    const sectionOrder = ['A급', 'B급', '가공급'];
    const sections = sectionOrder.map((gradeLabel) => {
      const gradeBins = visibleBins.filter((entry) => entry.gradeLabel === gradeLabel);
      return {
        key: `sorting-output-section-${gradeLabel}`,
        gradeLabel,
        occupiedBinCount: gradeBins.length,
        bins: gradeBins,
      };
    }).filter((section) => section.occupiedBinCount > 0);
    return {
      occupiedBinCount: visibleBins.length,
      bins: visibleBins,
      sections,
    };
  }, [sortingOutputBins]);
  const buildSortingInputPalletPreview = React.useCallback((slot, previewJob = null) => {
    const boxCapacity = 36;
    const slotState = String(slot?.state || '');
    if (slotState === '선별 완료' || slotState === '선별라인 정리중') {
      return {
        boxCount: 0,
        totalBoxCount: 0,
        loadLabel: '',
        boxEntries: Array.from({ length: boxCapacity }, (_, index) => ({
          key: `small-apc-input-${slot?.key || 'line'}-${index + 1}`,
          filled: false,
          tone: 'yellow',
        })),
      };
    }
    const sourceStoredEntry = previewJob?.sourceStoredEntry || slot?.sourceStoredEntry || null;
    const previewBoxCount = Math.max(0, Math.floor(Number(previewJob?.boxCount || 0)));
    const previewVisibleBoxCount = Math.max(
      0,
      Math.floor(Number(previewJob?.inputPreviewVisibleBoxCount ?? previewBoxCount) || 0)
    );
    const previewVisibleExactCount = Math.max(
      0,
      Number(previewJob?.inputPreviewVisibleExactCount ?? previewVisibleBoxCount) || 0
    );
    const previewState = String(previewJob?.previewState || '');
    const totalBoxCount = Math.max(
      0,
      Math.min(
        boxCapacity,
        Math.floor(Number(sourceStoredEntry?.boxCount ?? previewBoxCount ?? slot?.currentJob?.boxCount) || 0)
      )
    );
    const shouldShowDockingPallet = previewState === 'moving-in' && totalBoxCount > 0;
    const visibleBoxCount = Math.max(
      0,
      Math.min(
        totalBoxCount,
        shouldShowDockingPallet
          ? totalBoxCount
          : (previewVisibleBoxCount || totalBoxCount)
      )
    );
    const shouldAnimateUndocking = previewState === 'active' && totalBoxCount > 0 && visibleBoxCount <= 0;
    const clampedVisibleExactCount = Math.max(0, Math.min(totalBoxCount, previewVisibleExactCount || visibleBoxCount));
    const fullyFilledCount = Math.max(0, Math.min(totalBoxCount, Math.floor(clampedVisibleExactCount)));
    const drainingFillRatio = previewState === 'active'
      ? Math.max(0, Math.min(1, clampedVisibleExactCount - fullyFilledCount))
      : 0;
    const sourceTone = 'yellow';
    const explicitTones = Array.isArray(sourceStoredEntry?.filledBoxTones)
      ? sourceStoredEntry.filledBoxTones.slice(0, totalBoxCount)
      : Array.from({ length: totalBoxCount }, () => sourceTone);
    const filledBoxSlotTones = buildHarvestStorageSlotToneArray(
      {
        qtyKg: Math.max(0, Number(sourceStoredEntry?.totalKg || 0)) || (totalBoxCount * 20),
        filledBoxTones: explicitTones,
        storagePalletBoxCount: totalBoxCount,
        boxTone: sourceTone,
      },
      { boxCapacityKg: 20, maxBoxes: boxCapacity }
    );
    return {
      boxCount: visibleBoxCount,
      totalBoxCount,
      shouldAnimateUndocking,
      loadLabel: `${(shouldShowDockingPallet ? totalBoxCount : visibleBoxCount).toLocaleString()}박스/${totalBoxCount.toLocaleString()}박스`,
      boxEntries: Array.from({ length: boxCapacity }, (_, index) => {
        const storageBoxIndex = harvestPalletDisplayBoxIndexOf(index, 6, boxCapacity);
        const shouldUseVisibleCountFill = previewState === 'active';
        const filledByVisibleCount = storageBoxIndex < fullyFilledCount;
        const filledByStoredShape = storageBoxIndex < totalBoxCount && Boolean(filledBoxSlotTones[storageBoxIndex]);
        const isDrainingBox = previewState === 'active'
          && drainingFillRatio > 0
          && storageBoxIndex === fullyFilledCount
          && storageBoxIndex < totalBoxCount;
        return {
          key: `small-apc-input-${slot?.key || 'line'}-${index + 1}`,
          filled: shouldUseVisibleCountFill
            ? (filledByVisibleCount || isDrainingBox)
            : filledByStoredShape,
          tone: 'yellow',
          className: isDrainingBox ? 'is-progress-draining' : '',
          style: isDrainingBox ? { '--small-apc-box-fill': drainingFillRatio } : undefined,
        };
      }),
    };
  }, []);

  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">소형 APC</div>
          <h2>{panelTitle}</h2>
        </div>
      </div>
      <div className="small-apc-receiving-layout">
        {showLoadingSection ? (
        <section ref={loadingSectionRef} className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-overview-stage">
            <SmallApcStaffDeploymentPanel members={loadingStaffMembers} />
          </div>
          <div className="small-apc-receiving-card__head">
            <strong>하차칸</strong>
          </div>
          <div className="small-apc-sorting-slot-grid">
            {unloadSlotRows.map((slot) => {
              const motion = slotMotionByNo[String(slot.slotNo)] || slotMotionByNo[Number(slot.slotNo)] || null;
              const isUnloading = String(slot?.statusTone || '') === 'unloading';
              return (
              <div
                key={`loading-slot-${slot.slotNo}`}
                className={[
                  'small-apc-sorting-slot-card',
                  slot.occupied ? 'is-occupied' : 'is-empty',
                  isUnloading ? 'is-unloading-active' : '',
                  motion?.kind === 'enter' ? 'is-anim-enter' : '',
                  motion?.kind === 'status' ? 'is-anim-status' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="small-apc-sorting-slot-card__top">
                  <strong>{`하차구역 ${slot.slotNo}`}</strong>
                  <span className={`small-apc-sorting-slot-card__badge is-${String(slot.statusTone || (slot.occupied ? 'waiting' : 'pending'))}`.trim()}>
                    {slot.occupied ? (slot.statusLabel || '작업 중') : '비어 있음'}
                  </span>
                </div>
                {slot.occupied ? (
                  <div className="small-apc-sorting-slot-card__occupied">
                    {slot.parkedVehicleImageSrc ? (
                      <div className="small-apc-sorting-slot-card__thumb">
                        <img src={slot.parkedVehicleImageSrc} alt="" loading="lazy" />
                      </div>
                    ) : null}
                    <div className="small-apc-sorting-slot-card__copy">
                      {String(slot.parkedVehiclePlateText || '').trim() ? (
                        <span>{`차량번호 ${String(slot.parkedVehiclePlateText || '').trim()}`}</span>
                      ) : null}
                      {String(slot.shipperName || slot.farmerName || '').trim() ? (
                        <span>{`출하자 ${String(slot.shipperName || slot.farmerName || '').trim()}`}</span>
                      ) : null}
                      <b>{String(slot.parkedVehicleName || '하차 차량').trim() || '하차 차량'}</b>
                      <span>
                        {[
                          Math.max(0, Number(slot.cargoKg) || 0) > 0 ? `${Math.max(0, Number(slot.cargoKg) || 0).toLocaleString()}kg` : '',
                          String(slot.ticketNo || '').trim(),
                        ].filter(Boolean).join(' · ') || '적재 정보 없음'}
                      </span>
                      <em>{String(slot.statusHint || slot.remainingText || slot.workflowLabel || '작업 진행 중').trim()}</em>
                    </div>
                    {isUnloading ? (
                      <div className="small-apc-sorting-slot-card__cargo-flow" aria-hidden="true">
                        <span className="small-apc-sorting-slot-card__cargo-flow-line" />
                        {[0, 1, 2].map((index) => (
                          <span
                            key={`loading-slot-flow-${slot.slotNo}-${index}`}
                            className="small-apc-sorting-slot-card__cargo-box"
                            style={{ '--small-apc-cargo-delay': `${index * 0.72}s` }}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="small-apc-sorting-slot-card__idle">
                    <span>하차 완료 물량 대기</span>
                    <em>호출된 차량이 하차칸에 들어오면 이곳에 상태와 차량 정보가 표시됩니다.</em>
                  </div>
                )}
              </div>
            )})}
          </div>
        </section>
        ) : null}

        {showSortingSection ? (
        <>
        <section ref={sortingSectionRef} className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-overview-stage">
            <SmallApcStaffDeploymentPanel members={sortingStaffMembers} />
          </div>
          <div className="small-apc-receiving-card__head">
            <strong>선별기 라인</strong>
          </div>
          <div className="small-apc-sorting-slot-grid small-apc-sorting-slot-grid--machine-lines">
            {machineLineRows.map((slot) => {
              const previewJobs = Array.isArray(slot?.inputPreviewJobs) ? slot.inputPreviewJobs : [];
              const previewJobCount = previewJobs.length;
              const lineKey = String(slot?.key || `sorter-${Math.max(1, Number(slot?.lineNo || 1))}`);
              const actualInputJob = slot?.actualInputJob || null;
              const previewIndex = previewJobCount > 0
                ? Math.min(
                    Math.max(0, Math.floor(Number(inputPreviewIndexByLine?.[lineKey]) || 0)),
                    previewJobCount - 1,
                  )
                : 0;
              const previewJob = previewJobCount > 0 ? previewJobs[previewIndex] : null;
              const previewMotion = inputPreviewMotionByLine?.[lineKey] || null;
              const inputPalletPreview = buildSortingInputPalletPreview(slot, previewJob);
              const hasInputBoxes = inputPalletPreview.boxCount > 0;
              const shouldAnimateUndocking = Boolean(inputPalletPreview.shouldAnimateUndocking);
              const hideInputPalletMeta = String(slot?.statusTone || '') === 'done';
              const showInputPalletGrid = hasInputBoxes || shouldAnimateUndocking;
              const canBrowseQueuedInputs = previewJobCount > 1;
              const actualInputJobIndex = actualInputJob
                ? previewJobs.findIndex((job) => String(job?.id || '') === String(actualInputJob?.id || ''))
                : -1;
              const fallbackDisplayBoxCount = Math.max(
                0,
                Math.floor(Number((slot?.remainingBoxCount ?? slot?.currentJobBoxCount ?? slot.currentJob?.boxCount) || 0))
              );
              const actualInputPalletBoxCount = actualInputJob
                ? Math.max(0, Math.floor(Number(actualInputJob?.boxCount || 0)))
                : fallbackDisplayBoxCount;
              const actualInputVisibleBoxCount = actualInputJob
                ? Math.max(
                    0,
                    Math.floor(Number(
                      String(actualInputJob?.previewState || '') === 'active'
                        ? (actualInputJob?.inputPreviewVisibleBoxCount ?? actualInputJob?.boxCount)
                        : actualInputJob?.boxCount
                    ) || 0)
                  )
                : fallbackDisplayBoxCount;
              const activeTicketNo = String(actualInputJob?.ticketNo || slot?.currentJob?.ticketNo || '').trim();
              const queuedInputBoxCount = actualInputJobIndex >= 0
                ? previewJobs
                  .slice(actualInputJobIndex + 1)
                  .filter((job) => String(job?.ticketNo || '').trim() === activeTicketNo)
                  .reduce((sum, job) => sum + Math.max(0, Math.floor(Number(job?.boxCount || 0))), 0)
                : 0;
              return (
                <div
                  key={slot.key}
                  className={[
                    'small-apc-sorting-slot-card',
                    'small-apc-sorting-slot-card--machine',
                    slot?.currentJob ? 'is-occupied' : 'is-empty',
                    String(slot?.statusTone || '') === 'unloading' ? 'is-unloading-active' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <div className="small-apc-sorting-slot-card__top">
                    <strong>{slot.label}</strong>
                    <span className={`small-apc-sorting-slot-card__badge is-${String(slot?.statusTone || 'pending')}`.trim()}>
                      {slot.state}
                    </span>
                  </div>
                  <div className="small-apc-sorting-machine-card">
                    {sorterImageSrc ? (
                      <div className="small-apc-sorting-machine-card__thumb">
                        <img src={sorterImageSrc} alt="" loading="lazy" />
                      </div>
                    ) : null}
                    <div className="small-apc-sorting-machine-card__copy">
                      <span>{slot.state}</span>
                      <b>
                        {slot?.currentJob
                          ? `${String(slot.currentJob?.produceTypeLabel || '사과')} / ${String(slot.currentJob?.gradeLabel || '미선별')}`
                          : '소형 사과 선별기'}
                      </b>
                      <em>{slot.detail}</em>
                      <small>
                        {slot?.currentJob
                          ? `${String(slot.currentJob?.sizeLabel || '미측정')} · ${slot.currentJob?.stemRemoved ? '꼭지 제거' : '꼭지 미제거'}${slot.queueCount > 1 ? ` · 뒤 대기 ${slot.queueCount - 1}건` : ''}`
                          : '현재 배정된 하차 물량이 없어서 대기 중입니다.'}
                      </small>
                      {slot?.currentJob ? (
                        <div className="small-apc-sorting-machine-card__progress">
                          <span>{slot.state}</span>
                          <strong>{`${Math.max(0, Number(slot.progressPct || 0))}%`}</strong>
                          <div className="small-apc-sorting-machine-card__progress-bar">
                            <span style={{ width: `${Math.max(0, Math.min(100, Number(slot.progressPct || 0)))}%` }} />
                          </div>
                          <small className="small-apc-sorting-machine-card__progress-meta">
                            {slot.state === '선별기로 이동중'
                              ? `선별기로 이동중 ${actualInputPalletBoxCount.toLocaleString()}박스${queuedInputBoxCount > 0 ? ` · 뒤 대기 ${queuedInputBoxCount.toLocaleString()}박스` : ''}`
                              : slot.state === '선별 완료'
                                ? '선별 완료 · 결과 팔레트 배출 준비'
                              : slot.state === '선별라인 정리중'
                                ? `선별라인 정리중${queuedInputBoxCount > 0 ? ` · 다음 대기 ${queuedInputBoxCount.toLocaleString()}박스` : ''}`
                                : `${String(slot?.statusTone || '') === 'unloading' ? '현재 투입' : '현재 대기'} ${actualInputVisibleBoxCount.toLocaleString()}박스${queuedInputBoxCount > 0 ? ` · 뒤 대기 ${queuedInputBoxCount.toLocaleString()}박스` : ''}`}
                          </small>
                        </div>
                      ) : null}
                    </div>
                    <div className="small-apc-sorting-input-pallet-carousel">
                      <button
                        type="button"
                        className="small-apc-sorting-input-pallet-nav is-prev"
                        aria-label="이전 투입 팔레트 보기"
                        title={canBrowseQueuedInputs ? '이전 투입 팔레트' : '이전 투입 팔레트 없음'}
                        disabled={!canBrowseQueuedInputs}
                        onClick={() => {
                          if (!canBrowseQueuedInputs) return;
                          const nextToken = Date.now();
                          setInputPreviewMotionByLine((prev) => ({
                            ...(prev || {}),
                            [lineKey]: {
                              direction: 'prev',
                              token: nextToken,
                            },
                          }));
                          setInputPreviewIndexByLine((prev) => {
                            const currentIndex = Math.max(0, Math.floor(Number(prev?.[lineKey]) || 0));
                            const nextIndex = (currentIndex - 1 + previewJobCount) % previewJobCount;
                            return { ...(prev || {}), [lineKey]: nextIndex };
                          });
                        }}
                      >
                        <span aria-hidden="true" />
                      </button>
                      <div className="small-apc-sorting-input-pallet-shell">
                        <div
                          key={`${lineKey}-${String(previewJob?.id || 'empty')}-${String(previewMotion?.token || 'base')}`}
                          className={[
                            'warehouse-harvest-slot-card',
                            'small-apc-sorting-input-pallet-card',
                            previewMotion?.direction === 'prev' ? 'is-carousel-sliding-prev' : '',
                            previewMotion?.direction === 'next' ? 'is-carousel-sliding-next' : '',
                            slot.state === '선별기로 이동중' ? 'is-sorting-pallet-docking' : '',
                            shouldAnimateUndocking ? 'is-sorting-pallet-undocking' : '',
                            (hasInputBoxes || shouldAnimateUndocking) ? 'warehouse-harvest-slot-card--occupied' : 'warehouse-harvest-slot-card--empty',
                            'warehouse-harvest-slot-card--with-boxes',
                          ].filter(Boolean).join(' ')}
                        >
                          {hasInputBoxes && !hideInputPalletMeta ? (
                            <button
                              type="button"
                              className="warehouse-harvest-slot-card__memo-button"
                              tabIndex={-1}
                            >
                              메모
                            </button>
                          ) : null}
                          {showInputPalletGrid ? (
                            <div
                              className={`warehouse-harvest-slot-stack ${hasInputBoxes ? 'has-filled-boxes' : ''}`.trim()}
                              aria-hidden="true"
                            >
                              <div
                                className={[
                                  'warehouse-harvest-slot-layer-card',
                                  'warehouse-harvest-slot-layer-card--single',
                                  'is-active',
                                  hasInputBoxes ? 'has-filled-boxes' : 'warehouse-harvest-slot-layer-card--empty-target',
                                ].filter(Boolean).join(' ')}
                              >
                                {!hideInputPalletMeta ? (
                                  <span className="warehouse-harvest-slot-layer-card__badge">1단</span>
                                ) : null}
                                <div className={`warehouse-harvest-slot-box-grid warehouse-harvest-slot-box-grid--layer ${hasInputBoxes ? 'has-filled-boxes' : ''}`.trim()}>
                                  {inputPalletPreview.boxEntries.map((cell) => (
                                  <span
                                    key={cell.key}
                                    className={[
                                      'warehouse-harvest-slot-box',
                                      cell.className || '',
                                      cell.filled ? 'is-filled' : '',
                                      cell.filled ? (cell.tone === 'green' ? 'is-green' : 'is-yellow') : '',
                                    ].filter(Boolean).join(' ')}
                                    style={cell.style}
                                  />
                                ))}
                              </div>
                              </div>
                              {hasInputBoxes && !hideInputPalletMeta ? (
                                <span className="warehouse-harvest-slot-card__load-label">
                                  {inputPalletPreview.loadLabel}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <div className="small-apc-sorting-input-pallet-card__empty-label">
                              빈 투입칸
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="small-apc-sorting-input-pallet-nav is-next"
                        aria-label="다음 투입 팔레트 보기"
                        title={canBrowseQueuedInputs ? '다음 투입 팔레트' : '다음 투입 팔레트 없음'}
                        disabled={!canBrowseQueuedInputs}
                        onClick={() => {
                          if (!canBrowseQueuedInputs) return;
                          const nextToken = Date.now();
                          setInputPreviewMotionByLine((prev) => ({
                            ...(prev || {}),
                            [lineKey]: {
                              direction: 'next',
                              token: nextToken,
                            },
                          }));
                          setInputPreviewIndexByLine((prev) => {
                            const currentIndex = Math.max(0, Math.floor(Number(prev?.[lineKey]) || 0));
                            const nextIndex = (currentIndex + 1) % previewJobCount;
                            return { ...(prev || {}), [lineKey]: nextIndex };
                          });
                        }}
                      >
                        <span aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  {String(slot?.statusTone || '') === 'unloading' ? (
                    <div className="small-apc-sorting-machine-card__flow" aria-hidden="true">
                      {[0, 1, 2].map((index) => (
                        <span
                          key={`${slot.key}-flow-${index}`}
                          className="small-apc-sorting-machine-card__flow-dot"
                          style={{ '--small-apc-cargo-delay': `${index * 0.52}s` }}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-card__head">
            <strong>선별 배출칸</strong>
            <span>{`${sortingOutputBinsSummary.occupiedBinCount}칸 사용 중`}</span>
          </div>
          {sortingOutputBinsSummary.occupiedBinCount > 0 ? (
            <div className="small-apc-sorting-output-card">
              {sortingOutputBinsSummary.sections.map((section) => (
                <section key={section.key} className="small-apc-sorting-output-section">
                  <div className="small-apc-sorting-output-section__head">
                    <strong>{section.gradeLabel}</strong>
                    <span>{`${section.occupiedBinCount}칸`}</span>
                  </div>
                  <div className="small-apc-sorting-output-bin-grid">
                    {section.bins.map((bin) => (
                      (() => {
                        const titleText = `${bin.gradeLabel} ${bin.dieLabel} · 신선도 ${bin.freshnessBucketLabel} · ${bin.boxCount}/36박스 · ${Math.round(bin.totalKg).toLocaleString()}kg${bin.ticketNos.length ? ` · ${bin.ticketNos.join(', ')}` : ''}`;
                        const outputGridColumnCount = 6;
                        const outputGridDisplayOrder = Array.from({ length: 36 }, (_, orderIndex) => {
                          const rowFromBottom = Math.floor(orderIndex / outputGridColumnCount);
                          const columnIndex = orderIndex % outputGridColumnCount;
                          const rowIndex = 5 - rowFromBottom;
                          return (rowIndex * outputGridColumnCount) + columnIndex;
                        });
                        const filledIndexSet = new Set(outputGridDisplayOrder.slice(0, bin.boxCount));
                        const boxEntries = Array.from({ length: 36 }, (_, boxIndex) => ({
                          key: `${bin.key}-box-${boxIndex + 1}`,
                          filled: filledIndexSet.has(boxIndex),
                          tone: 'yellow',
                          tooltip: { text: titleText },
                        }));
                        return (
                          <div
                            key={bin.key}
                            className={[
                              'small-apc-sorting-output-bin',
                              bin.occupied ? 'is-occupied' : 'is-empty',
                            ].filter(Boolean).join(' ')}
                            title={titleText}
                          >
                            <div className="small-apc-sorting-output-bin__grid-shell" aria-hidden="true">
                              <HarvestBoxGrid boxEntries={boxEntries} />
                            </div>
                            <strong>{`${bin.gradeLabel} ${bin.dieLabel}`}</strong>
                            <small>{`신선도 ${bin.freshnessBucketLabel}`}</small>
                            <span>{`${bin.boxCount}/36`}</span>
                          </div>
                        );
                      })()
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </section>
        </>
        ) : null}
      </div>

      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function SmallApcReceivingDeskPanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">소형 APC</div>
          <h2>출하접수대</h2>
        </div>
      </div>
      <div className="small-apc-receiving-layout">
        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-card__head">
            <strong>접수 현황</strong>
            <span>오늘 기준</span>
          </div>
          <div className="small-apc-receiving-summary-grid">
            <div className="summary-chip small-apc-receiving-summary-chip">
              <span>접수 건수</span>
              <strong>0건</strong>
            </div>
            <div className="summary-chip small-apc-receiving-summary-chip">
              <span>총 입고량</span>
              <strong>0kg</strong>
            </div>
            <div className="summary-chip small-apc-receiving-summary-chip">
              <span>하차 대기</span>
              <strong>0건</strong>
            </div>
          </div>
        </section>

        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-card__head">
            <strong>입고 등록</strong>
            <span>직접 입력</span>
          </div>
        </section>
      </div>

      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

function SmallApcVehicleQueueContent({
  vehicleName = '',
  vehicleImageSrc = '',
  shipperName = '',
  shipperEmoji = '',
  primaryText = '',
  secondaryText = '',
  staffVisualNodes = [],
  isPlayerVehicle = false
}) {
  const visualNodes = Array.isArray(staffVisualNodes) ? staffVisualNodes : [];
  return (
    <div className="small-apc-receiving-queue__content">
      {vehicleImageSrc ? (
        <div className="small-apc-receiving-queue__thumb">
          <img src={vehicleImageSrc} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className="small-apc-receiving-queue__text">
        <div className="small-apc-receiving-queue__title-row">
          <span>{vehicleName || '대기 차량'}</span>
          {isPlayerVehicle ? (
            <small className="small-apc-receiving-queue__player-badge">내 차량</small>
          ) : null}
        </div>
        {shipperName ? (
          <b>{shipperEmoji || '🧑‍🌾'} 출하자 {shipperName}</b>
        ) : null}
        <em>{primaryText}{secondaryText ? ` · ${secondaryText}` : ''}</em>
        {visualNodes.length ? (
          <div className="small-apc-receiving-queue__staff-visual" aria-hidden="true">
            {visualNodes.map((node, index) => (
              <span
                key={`staff-visual-${vehicleName || 'slot'}-${index}`}
                className={`small-apc-receiving-queue__staff-slot ${node?.isEmpty ? 'is-empty' : `is-${String(node?.statusKey || 'working')}`}`.trim()}
                title={String(node?.statusLabel || (node?.isEmpty ? '미배치' : '배치됨'))}
              >
                {String(node?.emoji || (node?.isEmpty ? '▫️' : '🧑'))}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SmallApcReceivingDeskFlowPanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  loadingSlotRows = [],
  onAssignLoadingSlot,
  onBack,
  onClose
}) {
  const occupiedRows = React.useMemo(
    () => (Array.isArray(loadingSlotRows) ? loadingSlotRows : []).filter((row) => row?.occupied),
    [loadingSlotRows]
  );
  const assignPendingRows = React.useMemo(
    () => occupiedRows.filter((row) => row?.canAssign),
    [occupiedRows]
  );
  const waitingRows = React.useMemo(
    () => occupiedRows.filter((row) => row?.status === 'waiting'),
    [occupiedRows]
  );
  const assignedRows = React.useMemo(
    () => occupiedRows.filter((row) => row?.status && row?.status !== 'assignmentPending'),
    [occupiedRows]
  );
  const latestAssignedRow = React.useMemo(
    () => assignedRows[assignedRows.length - 1] || null,
    [assignedRows]
  );

  const handleAssignLoadingSlot = () => {
    if (!waitingRows.length) return;
    onAssignLoadingSlot?.();
  };

  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">소형 APC</div>
          <h2>출하접수대</h2>
        </div>
      </div>
      <div className="small-apc-receiving-layout">
        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-card__head">
            <strong>접수 현황</strong>
            <span>하차 대기 기준</span>
          </div>
          <div className="small-apc-receiving-summary-grid">
            <div className="summary-chip small-apc-receiving-summary-chip">
              <span>배정 완료</span>
              <strong>{assignedRows.length}건</strong>
            </div>
            <div className="summary-chip small-apc-receiving-summary-chip">
              <span>하차 대기</span>
              <strong>{waitingRows.length}건</strong>
            </div>
            <div className="summary-chip small-apc-receiving-summary-chip">
              <span>하차칸 운영</span>
              <strong>{occupiedRows.length}/4칸</strong>
            </div>
          </div>
          <div className="small-apc-receiving-queue">
            {occupiedRows.length ? (
              occupiedRows.map((row) => (
                <div
                  key={`small-apc-loading-${row.slotLabel}`}
                  className={`small-apc-receiving-queue__item ${row?.canAssign ? 'is-waiting' : 'is-issued'}`.trim()}
                >
                  <strong>{row.slotLabel}</strong>
                  <SmallApcVehicleQueueContent
                    vehicleName={row.parkedVehicleName}
                    vehicleImageSrc={row.parkedVehicleImageSrc}
                    shipperName={row.shipperName || row.farmerName}
                    shipperEmoji={row.shipperEmoji}
                    primaryText={row?.canAssign ? '접수 대기' : '배정 완료'}
                  />
                </div>
              ))
            ) : (
              <div className="small-apc-receiving-empty">현재 하차 대기 차량이 없습니다.</div>
            )}
          </div>
        </section>

        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-card__head">
            <strong>입고 등록</strong>
            <span>하차칸 먼저 배정</span>
          </div>
          <div className="small-apc-receiving-station">
            <div className="small-apc-receiving-station__copy">
              <strong>하차칸 배정</strong>
              <p>접수대에서 대기 차량을 순서대로 호출해 H1~H4 하차칸을 배정합니다.</p>
            </div>
            <button
              type="button"
              className="button button--primary day-transition-animate-button"
              disabled={!waitingRows.length}
              onClick={handleAssignLoadingSlot}
            >
              접수하기
            </button>
          </div>

          {latestAssignedRow ? (
            <div className="small-apc-receiving-result">
              <strong>최근 배정</strong>
              <span>{latestAssignedRow.parkedVehicleName || '대기 차량'} / {latestAssignedRow.slotLabel}</span>
            </div>
          ) : null}
        </section>
      </div>

      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function SmallApcReceivingDeskWorkflowPanel({
  className = 'confirm-modal confirm-modal--small-apc-receiving',
  receptionWorkflowRows = [],
  loadingSlotRows = [],
  staffingProfile = null,
  onAssignLoadingSlot,
  onBack,
  onClose
}) {
  const occupiedRows = React.useMemo(
    () => (Array.isArray(receptionWorkflowRows) ? receptionWorkflowRows : []).filter((row) => row?.occupied),
    [receptionWorkflowRows]
  );
  const assignPendingRows = React.useMemo(
    () => occupiedRows.filter((row) => row?.canAssign),
    [occupiedRows]
  );
  const activeRows = React.useMemo(
    () => occupiedRows.filter((row) => row?.status && row?.status !== 'assignmentPending'),
    [occupiedRows]
  );
  const waitingRows = React.useMemo(
    () => activeRows
      .filter((row) => row?.status === 'waiting')
      .sort((a, b) => Number(a?.waitingOrder || 0) - Number(b?.waitingOrder || 0)),
    [activeRows]
  );
  const bayRows = React.useMemo(
    () => (Array.isArray(loadingSlotRows) ? loadingSlotRows : []),
    [loadingSlotRows]
  );
  const loadingStaffMembers = React.useMemo(
    () => (Array.isArray(staffingProfile?.facilityByEntryKey?.['loading-yard']?.assignedMembers)
      ? staffingProfile.facilityByEntryKey['loading-yard'].assignedMembers
      : []),
    [staffingProfile]
  );
  const nextWaitingRow = React.useMemo(
    () => waitingRows[0] || null,
    [waitingRows]
  );
  const loadingStaffVisualBySlotLabel = React.useMemo(() => {
    const staffMembers = Array.isArray(staffingProfile?.facilityByEntryKey?.['loading-yard']?.assignedMembers)
      ? staffingProfile.facilityByEntryKey['loading-yard'].assignedMembers
      : [];
    const statusEmojiByKey = {
      working: '🧑',
      moving: '🏃',
      resting: '😴',
      eating: '🍚',
      absent: '🌙',
      vacation: '🏖️',
      hangoverLeave: '🤢',
      sickLeave: '🤒',
      offDuty: '🏠',
      unauthorizedLeave: '💨',
      missing: '🫥',
      late: '⏰',
      training: '🧠',
      meeting: '📋',
      smokingBreak: '🚬',
    };
    const workersPerBay = 2;
    return (Array.isArray(loadingSlotRows) ? loadingSlotRows : []).reduce((acc, row) => {
      const slotNo = Math.max(1, Number(row?.slotNo || 0));
      const slotLabel = String(row?.slotLabel || `H${slotNo}`).trim() || `H${slotNo}`;
      const startIndex = (slotNo - 1) * workersPerBay;
      acc[slotLabel] = Array.from({ length: workersPerBay }, (_, index) => {
        const member = staffMembers[startIndex + index] || null;
        const statusKey = String(member?.statusKey || member?.status || 'working').trim() || 'working';
        return member
          ? {
            isEmpty: false,
            statusKey,
            statusLabel: String(member?.statusLabel || '근무중').trim() || '근무중',
            emoji: statusEmojiByKey[statusKey] || '🧑',
          }
          : {
            isEmpty: true,
            statusKey: '',
            statusLabel: '미배치',
            emoji: '▫️',
          };
      });
      return acc;
    }, {});
  }, [loadingSlotRows, staffingProfile]);
  const queueRows = React.useMemo(
    () => (
      [
        ...assignPendingRows.map((row) => ({
          ...row,
          queueStateLabel: '접수 대기',
          queueStateHint: '번호표 발급 전'
        })),
        ...waitingRows.map((row) => ({
          ...row,
          queueStateLabel: '입고 대기',
          queueStateHint: `${row.waitingOrderLabel || '대기중'}${row.ticketDisplayText ? ` · ${row.ticketDisplayText}` : ''}`
        }))
      ]
    ),
    [assignPendingRows, waitingRows]
  );

  const handleAssignLoadingSlot = () => {
    if (!assignPendingRows.length) return;
    onAssignLoadingSlot?.();
  };

  return (
    <div className={className}>
      <div className="panel__header small-apc-panel__header">
        <div>
          <div className="panel__eyebrow">소형 APC</div>
          <h2>출하접수대</h2>
        </div>
      </div>
      <div className="small-apc-receiving-layout">
        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-card__head">
            <strong>접수 현황</strong>
            <span>하차칸 작업 현황</span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.65fr) minmax(220px, 0.8fr)',
              gap: 14,
              alignItems: 'start',
              marginBottom: 14,
            }}
          >
            <div className="small-apc-receiving-summary-grid">
              <div className="summary-chip small-apc-receiving-summary-chip">
                <span>접수 대기</span>
                <strong>{assignPendingRows.length}건</strong>
              </div>
              <div className="summary-chip small-apc-receiving-summary-chip">
                <span>입고 대기</span>
                <strong>{waitingRows.length}건</strong>
              </div>
              <div className="summary-chip small-apc-receiving-summary-chip">
                <span>하차칸 운영</span>
                <strong>{bayRows.length}/4칸</strong>
              </div>
            </div>
            <div
              style={{
                minHeight: 92,
                padding: '10px 12px',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(198, 214, 199, 0.72)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.38)',
              }}
            >
              <div className="small-apc-receiving-card__head" style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: '0.92rem' }}>직원투입 현황</strong>
                <span>{`${loadingStaffMembers.length}명`}</span>
              </div>
              {loadingStaffMembers.length ? (
                <div
                  style={{
                    display: 'grid',
                    gap: 6,
                  }}
                >
                  {loadingStaffMembers.map((member, index) => (
                    <div
                      key={`small-apc-loading-staff-top-${member.name}-${index + 1}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        minWidth: 0,
                        color: '#305845',
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      <span style={{ fontSize: 15, lineHeight: 1 }} aria-hidden="true">🧑</span>
                      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {`${String(member?.name || '직원')} · ${String(member?.statusLabel || '근무중')}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#7b9080', fontSize: 12, fontWeight: 700 }}>배치된 직원 없음</div>
              )}
            </div>
          </div>
          <div className="small-apc-receiving-queue">
            {bayRows.length ? (
              bayRows.map((row) => (
                <div
                  key={`small-apc-workflow-${row.slotLabel}`}
                  className={`small-apc-receiving-queue__item is-${String(row?.statusTone || 'pending')}`.trim()}
                >
                  <strong>{row.slotLabel}</strong>
                  <SmallApcVehicleQueueContent
                    vehicleName={row.parkedVehicleName || '비어 있음'}
                    vehicleImageSrc={row.parkedVehicleImageSrc}
                    shipperName={row.shipperName || row.farmerName}
                    shipperEmoji={row.shipperEmoji}
                    primaryText={row.statusHint || row.workflowLabel || '하차칸 비어 있음'}
                    secondaryText={row.cargoType || ''}
                    staffVisualNodes={loadingStaffVisualBySlotLabel[String(row?.slotLabel || '').trim()] || []}
                  />
                </div>
              ))
            ) : (
              <div className="small-apc-receiving-empty">현재 하차칸 정보가 없습니다.</div>
            )}
          </div>
        </section>

        <section className="panel-card small-apc-receiving-card">
          <div className="small-apc-receiving-card__head">
            <strong>입고 등록</strong>
            <span>하차칸 먼저 배정</span>
          </div>
          <div className="small-apc-receiving-station">
            <div className="small-apc-receiving-station__copy">
              <strong>하차칸 배정</strong>
              <p>접수 대기 차량을 호출하면 입고 대기로 전환되고, 이후 하차준비부터 하차칸에 표시됩니다.</p>
            </div>
            <button
              type="button"
              className="button button--primary day-transition-animate-button"
              disabled={!assignPendingRows.length}
              onClick={handleAssignLoadingSlot}
            >
              접수하기
            </button>
          </div>

          {nextWaitingRow ? (
            <div className="small-apc-receiving-result">
              <strong>다음 하차칸 진입</strong>
              <span>
                {nextWaitingRow.parkedVehicleName || '대기 차량'}
                {nextWaitingRow.ticketDisplayText ? ` / ${nextWaitingRow.ticketDisplayText}` : ''}
              </span>
            </div>
          ) : null}

          <div className="small-apc-receiving-queue">
            {queueRows.length ? (
              queueRows.map((row, index) => (
                <div
                  key={`small-apc-register-${row.slotNo}-${row.ticketDisplayText || index}`}
                  className={`small-apc-receiving-queue__item is-${String(row?.statusTone || 'pending')}`.trim()}
                >
                  <strong>{row.ticketDisplayText || `P${Number(row?.slotNo || 0)}`}</strong>
                  <SmallApcVehicleQueueContent
                    vehicleName={row.parkedVehicleName}
                    vehicleImageSrc={row.parkedVehicleImageSrc}
                    shipperName={row.shipperName || row.farmerName}
                    shipperEmoji={row.shipperEmoji}
                    primaryText={row.queueStateLabel}
                    secondaryText={row.queueStateHint}
                  />
                </div>
              ))
            ) : (
              <div className="small-apc-receiving-empty">현재 접수 대기 차량과 입고 대기 차량이 없습니다.</div>
            )}
          </div>
        </section>
      </div>

      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function ConstructionOfficeOverlay({
  open,
  view,
  title,
  closing = false,
  pickupPanel = null,
  constructionPanel = null,
  officePanel = null,
  onOpenShop,
  onOpenPickup,
  onOpenOffice,
  onBack,
  onClose
}) {
  if (!open) return null;
  return (
    <>
      <div className={`confirm-modal-backdrop ${closing ? 'is-closing' : ''}`.trim()} onClick={onClose} />
      {view === 'pickup' ? (
        pickupPanel
      ) : view === 'shop' ? (
        constructionPanel
      ) : view === 'office' ? (
        officePanel
      ) : (
        <MapEntryModal
          className={`confirm-modal confirm-modal--map-shop-entry ${closing ? 'is-closing' : ''}`.trim()}
          title={title}
          actions={[
            { key: 'shop', label: '시설견적', onClick: onOpenShop },
            ...(officePanel && typeof onOpenOffice === 'function'
              ? [{ key: 'office', label: '사무실', onClick: onOpenOffice }]
              : []),
            { key: 'pickup', label: '물품 임시보관소', onClick: onOpenPickup }
          ]}
          onBack={onBack}
          onClose={onClose}
        />
      )}
    </>
  );
}
