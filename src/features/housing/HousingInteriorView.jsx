import React from 'react';
import { HOUSING_INTERIOR_OBJECT_BUTTONS } from './housingInteriorConfig';
import {
  HOUSING_APPLIANCE_SLOT_DEFS,
  HOUSING_CLOTHING_SLOT_DEFS,
  HOUSING_FURNITURE_SLOT_DEFS,
  housingFoodStorageExpirySummaryOf,
  housingHasBathroomOfFacility,
} from './housingSystem';
import HousingPcDesktop from './HousingPcDesktop';
import {
  PLAYER_HEALTH_STATUS_STEPS,
  PLAYER_SELF_LABOR_STATUS_STEPS,
  playerStatusStepForValue,
} from '../health/playerHealthSystem';

function SmoothHeightPanel({ children, className = '', watchKey = '' }) {
  const outerRef = React.useRef(null);
  const innerRef = React.useRef(null);
  const [height, setHeight] = React.useState('auto');

  React.useLayoutEffect(() => {
    const innerEl = innerRef.current;
    if (!innerEl) return undefined;
    const updateHeight = () => {
      const measuredHeight = Math.max(
        innerEl.scrollHeight,
        innerEl.getBoundingClientRect().height
      );
      setHeight(`${Math.ceil(measuredHeight) + 2}px`);
    };
    updateHeight();
    const rafId = window.requestAnimationFrame(updateHeight);
    if (typeof ResizeObserver === 'undefined') {
      const timer = window.setInterval(updateHeight, 120);
      return () => {
        window.cancelAnimationFrame(rafId);
        window.clearInterval(timer);
      };
    }
    const observer = new ResizeObserver(updateHeight);
    observer.observe(innerEl);
    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [watchKey]);

  return (
    <div
      ref={outerRef}
      className={`smooth-height-panel ${className}`.trim()}
      style={{ height }}
    >
      <div ref={innerRef} className="smooth-height-panel__inner">
        {children}
      </div>
    </div>
  );
}

const HOUSING_KITCHEN_RECIPE_TABS = Object.freeze([
  ['rice', '🍚 밥류'],
  ['vegetarian', '🥬 채식류'],
  ['soup', '🍲 국·찌개'],
  ['noodle', '🍜 면류'],
  ['bread', '🍞 빵·아침']
]);

const HOUSING_APPLIANCE_COOKING_DURATION_MS_BY_TYPE = Object.freeze({
  riceCooker: 60000,
  microwave: 20000,
  electricKettle: 15000
});

export default function HousingInteriorView({
  housingInteriorFacilityKey = '',
  housingInteriorImageSrc,
  housingInteriorHasDedicatedImage,
  housingIndoorTemperatureInfo,
  housingInteriorPowerInfo,
  housingSleepQualityInfo,
  housingLivingConditionInfo,
  housingPlayerStatusInfo,
  housingInteriorHvacSetting,
  updateHousingInteriorHvacSetting,
  housingInteriorFridgeSetting,
  updateHousingInteriorFridgeSetting,
  toggleHousingInteriorPowerControl,
  housingInteriorPendingObject,
  housingBathroomInfo = null,
  housingInteriorFridgeStoredRows,
  housingInteriorFreezerStoredRows = [],
  housingInteriorColdStorageCapacityInfo = null,
  housingInteriorFridgeSourceRows,
  housingInteriorStorageRows = [],
  housingInteriorStorageInfo = null,
  housingInteriorWaterTankSlotRows = [],
  housingInteriorApplianceSlotRows = [],
  housingInteriorClothingSlotRows = [],
  housingInteriorClothingStorageRows = [],
  housingInteriorFurnitureSlotRows = [],
  housingInteriorInstallSourceRows = [],
  housingInteriorInstallDestinationRows = [],
  housingInteriorBagRows = [],
  housingInteriorBagFoodRows = [],
  housingInteriorBagClothingRows = [],
  housingInteriorVehicleFoodSourceRows = [],
  housingInteriorStorageSourceRows = [],
  housingMealInfo,
  housingWaterInfo = null,
  isHousingInteriorWindowPreviewOpen,
  weatherSceneImage,
  game,
  phoneTimeText = '',
  isNightPhase,
  timeTransitionModal,
  handleHousingInteriorObjectButtonClick,
  closeHousingInteriorPendingModal,
  startDayTimeTransition,
  advanceMultipleDays,
  eatHousingMeal,
  showerHousingBathroom,
  washHousingBathroomAfterWork,
  cleanHousingBathroom,
  cookHousingMeal,
  plateHousingMeal,
  moveFoodItemToHousingFridge,
  moveFoodItemToHousingStorage,
  moveFoodItemFromHousingStorageToInventory,
  moveClothingItemToHousingWardrobe,
  moveClothingItemFromHousingWardrobe,
  installHousingWaterTankSlot,
  removeHousingWaterTankSlot,
  installHousingSlotItem,
  moveHousingSlotItemToTarget,
  moveFoodItemFromHousingColdStorage,
  moveFoodItemBetweenHousingColdStorage,
  openSaveLoadFromHousing,
  openMainMenuFromHousing,
  addCalendarEvent,
  removeCalendarEvent,
}) {
  const [bedPanelMode, setBedPanelMode] = React.useState('main');
  const [dayAdvanceDraft, setDayAdvanceDraft] = React.useState('7');
  const [farmLogFilter, setFarmLogFilter] = React.useState('all');
  const [farmLogDateFilter, setFarmLogDateFilter] = React.useState('all');
  const [farmLogTypingActive, setFarmLogTypingActive] = React.useState(false);
  const [farmLogTypingStatus, setFarmLogTypingStatus] = React.useState('');
  const [farmLogTypedLines, setFarmLogTypedLines] = React.useState([]);
  const [farmLogCurrentTypedLine, setFarmLogCurrentTypedLine] = React.useState('');
  const [fridgeTempModalKey, setFridgeTempModalKey] = React.useState('');
  const [indoorTemperatureDetailOpen, setIndoorTemperatureDetailOpen] = React.useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = React.useState('');
  const [calendarTitleDraft, setCalendarTitleDraft] = React.useState('');
  const [calendarNoteDraft, setCalendarNoteDraft] = React.useState('');
  const [calendarMessage, setCalendarMessage] = React.useState('');
  const [kitchenTab, setKitchenTab] = React.useState('meal');
  const [cookRecipeTab, setCookRecipeTab] = React.useState('rice');
  const [selectedCookRecipeKey, setSelectedCookRecipeKey] = React.useState('');
  const [selectedCookingApplianceKey, setSelectedCookingApplianceKey] = React.useState('');
  const [selectedCookingPrepKey, setSelectedCookingPrepKey] = React.useState('');
  const [collapsingCookingPrepKey, setCollapsingCookingPrepKey] = React.useState('');
  const [selectedCookingPrepQtyByKey, setSelectedCookingPrepQtyByKey] = React.useState({});
  const [deselectingCookingPrepKey, setDeselectingCookingPrepKey] = React.useState('');
  const [selectedRiceCookBowls, setSelectedRiceCookBowls] = React.useState(3);
  const [selectedRiceWaterSourceKey, setSelectedRiceWaterSourceKey] = React.useState('');
  const [cookingApplianceTasksByKey, setCookingApplianceTasksByKey] = React.useState({});
  const [activePlateSlotKey, setActivePlateSlotKey] = React.useState('rice');
  const [plateOptionPickerSlotKey, setPlateOptionPickerSlotKey] = React.useState('');
  const [housingInstallRemovePickerOpen, setHousingInstallRemovePickerOpen] = React.useState(false);
  const [selectedPlateRiceKey, setSelectedPlateRiceKey] = React.useState('');
  const [selectedPlateMainKey, setSelectedPlateMainKey] = React.useState('');
  const [selectedPlateSideKeys, setSelectedPlateSideKeys] = React.useState(['', '', '']);
  const [selectedPlateSoupKey, setSelectedPlateSoupKey] = React.useState('');
  const [selectedPlateDessertKey, setSelectedPlateDessertKey] = React.useState('');
  const [storageTab, setStorageTab] = React.useState('warehouse');
  const [storageTabDirection, setStorageTabDirection] = React.useState('forward');
  const effectiveStorageTab = housingInteriorPendingObject?.key === 'closet' ? 'clothing' : storageTab;
  const [fridgeSourceTab, setFridgeSourceTab] = React.useState('bag');
  const [fridgeSourcePickerTab, setFridgeSourcePickerTab] = React.useState('bag');
  const [fridgeSourcePickerOpen, setFridgeSourcePickerOpen] = React.useState(false);
  const [fridgeVehicleSourceKey, setFridgeVehicleSourceKey] = React.useState('');
  const [fridgeWarehouseSourceKey, setFridgeWarehouseSourceKey] = React.useState('');
  const [storageSourcePickerOpen, setStorageSourcePickerOpen] = React.useState(false);
  const [storageSourcePickerTab, setStorageSourcePickerTab] = React.useState('bag');
  const [storageSourceTab, setStorageSourceTab] = React.useState('bag');
  const [storageSourceKey, setStorageSourceKey] = React.useState('');
  const [fridgeMovingItem, setFridgeMovingItem] = React.useState(null);
  const [housingInstallSlotDetail, setHousingInstallSlotDetail] = React.useState(null);
  const [housingInstallSourcePickerKey, setHousingInstallSourcePickerKey] = React.useState('');
  const [mealCooldownNow, setMealCooldownNow] = React.useState(() => Date.now());
  const farmLogTypingTimerRef = React.useRef(null);
  const fridgeMoveTimerRef = React.useRef(null);
  const cookingApplianceTimerRef = React.useRef({});
  const cookingPrepCollapseTimerRef = React.useRef(null);
  const cookingPrepDeselectTimerRef = React.useRef(null);
  const housingStorageTabOrder = React.useMemo(() => ['warehouse', 'waterSource', 'boiler', 'appliance', 'furniture'], []);
  const changeHousingStorageTab = React.useCallback((nextTabRaw) => {
    const nextTab = String(nextTabRaw || 'warehouse');
    if (nextTab === storageTab) return;
    const currentIndex = housingStorageTabOrder.indexOf(storageTab);
    const nextIndex = housingStorageTabOrder.indexOf(nextTab);
    setStorageTabDirection(nextIndex >= currentIndex ? 'forward' : 'backward');
    setStorageTab(nextTab);
  }, [housingStorageTabOrder, storageTab]);
  const hvacSetting = housingInteriorHvacSetting || { mode: 'off', targetTemperatureC: 21 };
  const fridgeSetting = housingInteriorFridgeSetting || { fridgeTempC: 4, freezerTempC: -18 };
  const fridgeTempC = Math.max(0, Math.min(8, Number.isFinite(Number(fridgeSetting.fridgeTempC)) ? Math.round(Number(fridgeSetting.fridgeTempC)) : 4));
  const freezerTempC = Math.max(-24, Math.min(-12, Number.isFinite(Number(fridgeSetting.freezerTempC)) ? Math.round(Number(fridgeSetting.freezerTempC)) : -18));
  const coldStorageCapacityTextOf = (kind = 'fridge') => {
    const isFreezer = String(kind || '') === 'freezer';
    const usedLiters = Math.max(0, Number(isFreezer
      ? housingInteriorColdStorageCapacityInfo?.freezerUsedLiters
      : housingInteriorColdStorageCapacityInfo?.fridgeUsedLiters) || 0);
    const capacityLiters = Math.max(0, Number(isFreezer
      ? housingInteriorColdStorageCapacityInfo?.freezerCapacityLiters
      : housingInteriorColdStorageCapacityInfo?.fridgeCapacityLiters) || 0);
    if (capacityLiters <= 0) return '용량 없음';
    return `${usedLiters.toFixed(1)} / ${capacityLiters.toFixed(1)}L`;
  };
  const selectedInstallSlot = React.useMemo(() => {
    if (!housingInstallSlotDetail) return null;
    const requestedGroup = String(housingInstallSlotDetail.slotGroup || '');
    const slotGroup = requestedGroup === 'furniture' || requestedGroup === 'clothing' ? requestedGroup : 'appliance';
    const sourceRows = slotGroup === 'furniture'
      ? housingInteriorFurnitureSlotRows
      : (slotGroup === 'clothing' ? housingInteriorClothingSlotRows : housingInteriorApplianceSlotRows);
    const fallbackRows = slotGroup === 'furniture'
      ? HOUSING_FURNITURE_SLOT_DEFS
      : (slotGroup === 'clothing' ? HOUSING_CLOTHING_SLOT_DEFS : HOUSING_APPLIANCE_SLOT_DEFS);
    const slotKey = String(housingInstallSlotDetail.slotKey || '');
    return (Array.isArray(sourceRows) ? sourceRows : []).find((slot) => String(slot?.key || '') === slotKey)
      || fallbackRows.find((slot) => String(slot?.key || '') === slotKey)
      || null;
  }, [housingInstallSlotDetail, housingInteriorApplianceSlotRows, housingInteriorClothingSlotRows, housingInteriorFurnitureSlotRows]);
  const selectedInstallSlotSourceRows = React.useMemo(() => {
    if (!selectedInstallSlot || !housingInstallSlotDetail) return [];
    const requestedGroup = String(housingInstallSlotDetail.slotGroup || '');
    const slotGroup = requestedGroup === 'furniture' || requestedGroup === 'clothing' ? requestedGroup : 'appliance';
    const slotType = String(selectedInstallSlot?.type || '');
    const installedItemKey = String(selectedInstallSlot?.itemKey || '');
    if (slotGroup === 'clothing') {
      return (Array.isArray(housingInteriorClothingStorageRows) ? housingInteriorClothingStorageRows : [])
        .filter((row) => (
          String(row?.type || '') === slotType
          && String(row?.itemKey || '') !== installedItemKey
          && Math.max(0, Math.floor(Number(row?.qty) || 0)) > 0
        ))
        .map((row) => ({
          ...row,
          category: 'clothing',
          sourceType: 'wardrobe',
          sourceKey: 'wardrobe',
          sourceName: '옷장',
          sourceDetail: '집에 보관된 복장',
          sourceImageSrc: '',
          sourceIcon: '🧥'
        }));
    }
    return (Array.isArray(housingInteriorInstallSourceRows) ? housingInteriorInstallSourceRows : [])
      .filter((row) => (
        String(row?.category || '') === slotGroup
        && String(row?.type || '') === slotType
        && String(row?.itemKey || '') !== installedItemKey
      ));
  }, [housingInstallSlotDetail, housingInteriorClothingStorageRows, housingInteriorInstallSourceRows, selectedInstallSlot]);
  const selectedInstallSlotSourceLocationRows = React.useMemo(() => {
    const byKey = new Map();
    selectedInstallSlotSourceRows.forEach((row) => {
      const sourceType = String(row?.sourceType || '');
      const sourceKey = String(row?.sourceKey || '');
      const key = `${sourceType}:${sourceKey}`;
      if (!sourceType || !sourceKey) return;
      const current = byKey.get(key) || {
        key,
        sourceType,
        sourceKey,
        sourceName: String(row?.sourceName || '보관처'),
        sourceDetail: String(row?.sourceDetail || ''),
        sourceImageSrc: String(row?.sourceImageSrc || ''),
        sourceIcon: String(row?.sourceIcon || '📦'),
        itemCount: 0,
        previewItems: []
      };
      current.itemCount += Math.max(0, Math.floor(Number(row?.qty) || 0));
      if (current.previewItems.length < 4 && row?.imageSrc) current.previewItems.push(String(row.imageSrc));
      byKey.set(key, current);
    });
    return Array.from(byKey.values());
  }, [selectedInstallSlotSourceRows]);
  const selectedInstallSlotSourceRowsByPicker = React.useMemo(() => {
    if (!housingInstallSourcePickerKey) return selectedInstallSlotSourceRows;
    return selectedInstallSlotSourceRows.filter((row) => `${String(row?.sourceType || '')}:${String(row?.sourceKey || '')}` === housingInstallSourcePickerKey);
  }, [housingInstallSourcePickerKey, selectedInstallSlotSourceRows]);
  const selectedInstallSlotDestinationRows = React.useMemo(
    () => (Array.isArray(housingInteriorInstallDestinationRows) ? housingInteriorInstallDestinationRows : []),
    [housingInteriorInstallDestinationRows]
  );
  React.useEffect(() => {
    if (!housingInstallSlotDetail) setHousingInstallRemovePickerOpen(false);
  }, [housingInstallSlotDetail]);
  React.useEffect(() => {
    setHousingInstallSourcePickerKey('');
  }, [housingInstallSlotDetail]);
  const targetIndoorTemperatureC = Number(housingIndoorTemperatureInfo?.temperatureC);
  const activeIndoorHvacMode = String(housingIndoorTemperatureInfo?.activeHvacMode || 'off');
  const shouldAnimateIndoorTemperature = activeIndoorHvacMode === 'heating' || activeIndoorHvacMode === 'cooling';
  const [displayIndoorTemperatureC, setDisplayIndoorTemperatureC] = React.useState(
    Number.isFinite(targetIndoorTemperatureC) ? targetIndoorTemperatureC : null
  );
  const displayIndoorTemperatureRef = React.useRef(Number.isFinite(targetIndoorTemperatureC) ? targetIndoorTemperatureC : null);
  const indoorTemperatureAnimationRef = React.useRef(null);
  const shownIndoorTemperatureC = Number.isFinite(Number(displayIndoorTemperatureC))
    ? Number(displayIndoorTemperatureC)
    : targetIndoorTemperatureC;
  const healthValue = Math.max(0, Math.min(100, Number(housingPlayerStatusInfo?.health) || 0));
  const laborValue = Math.max(0, Math.min(100, Number(housingPlayerStatusInfo?.labor) || 0));
  const healthStatus = playerStatusStepForValue(PLAYER_HEALTH_STATUS_STEPS, healthValue);
  const laborStatus = playerStatusStepForValue(PLAYER_SELF_LABOR_STATUS_STEPS, laborValue);
  const livingDetailText = String(housingLivingConditionInfo?.detail || '');
  const hasHousingBathroom = housingHasBathroomOfFacility(housingInteriorFacilityKey);
  const housingInteriorInstalledApplianceSlotKeySet = React.useMemo(() => new Set(
    (Array.isArray(housingInteriorApplianceSlotRows) ? housingInteriorApplianceSlotRows : [])
      .filter((slot) => Boolean(slot?.installed))
      .map((slot) => String(slot?.key || ''))
      .filter(Boolean)
  ), [housingInteriorApplianceSlotRows]);
  const housingInteriorInstalledFurnitureSlotKeySet = React.useMemo(() => new Set(
    (Array.isArray(housingInteriorFurnitureSlotRows) ? housingInteriorFurnitureSlotRows : [])
      .filter((slot) => Boolean(slot?.installed))
      .map((slot) => String(slot?.key || ''))
      .filter(Boolean)
  ), [housingInteriorFurnitureSlotRows]);
  const housingInteriorHasInstalledBed = housingInteriorInstalledFurnitureSlotKeySet.has('bed');
  const housingInteriorHasInstalledPc = housingInteriorInstalledApplianceSlotKeySet.has('pc');
  const housingInteriorHasInstalledTv = housingInteriorInstalledApplianceSlotKeySet.has('tv');
  const housingHvacCoolingDeviceRows = React.useMemo(() => (
    (Array.isArray(housingInteriorApplianceSlotRows) ? housingInteriorApplianceSlotRows : [])
      .filter((slot) => Boolean(slot?.installed) && ['airConditioner', 'fan'].includes(String(slot?.type || '')))
  ), [housingInteriorApplianceSlotRows]);
  const housingHvacHeatingDeviceRows = React.useMemo(() => (
    (Array.isArray(housingInteriorApplianceSlotRows) ? housingInteriorApplianceSlotRows : [])
      .filter((slot) => Boolean(slot?.installed) && String(slot?.type || '') === 'heater')
  ), [housingInteriorApplianceSlotRows]);
  const housingInteriorHasInstalledHvacDevice = housingHvacCoolingDeviceRows.length > 0 || housingHvacHeatingDeviceRows.length > 0;
  const selectedHvacCoolingKeys = Array.isArray(hvacSetting?.selectedCoolingKeys) ? hvacSetting.selectedCoolingKeys : [];
  const selectedHvacHeatingKeys = Array.isArray(hvacSetting?.selectedHeatingKeys) ? hvacSetting.selectedHeatingKeys : [];
  const livingPanelExpanded = livingDetailText.length >= 22;
  const livingSupplyInfo = housingLivingConditionInfo?.lifeSupplyInfo || {};
  const livingFacilityQualityInfo = housingLivingConditionInfo?.facilityQualityInfo || {};
  const livingInternetInfo = housingLivingConditionInfo?.internetInfo || {};
  const livingDetailRows = [
    {
      key: 'housing',
      label: '하우징 자체',
      value: livingFacilityQualityInfo.label || '기본 주거성',
      detail: livingFacilityQualityInfo.detail || '생활여건 기준점'
    },
    {
      key: 'food',
      label: '냉장실 식료품',
      value: livingSupplyInfo.foodLabel || '0일',
      detail: Number(livingSupplyInfo.foodDays) >= 1 ? '생활여건에 반영 중' : '냉장실에 식료품을 넣어야 반영'
    },
    {
      key: 'essential',
      label: '생필품',
      value: livingSupplyInfo.essentialLabel || '0일',
      detail: Number(livingSupplyInfo.essentialDays) >= 1 ? '생활여건에 반영 중' : '생필품 부족'
    },
    {
      key: 'power',
      label: '실내전기',
      value: housingInteriorPowerInfo?.label || '-',
      detail: housingInteriorPowerInfo?.detail || '실내 전기 상태 확인 필요'
    },
    {
      key: 'internet',
      label: '인터넷',
      value: livingInternetInfo.label || '미설치',
      detail: livingInternetInfo.detail || '홈리빙센터 사무실에서 신청 가능'
    },
    {
      key: 'indoor',
      label: '실내온도',
      value: housingIndoorTemperatureInfo ? `${Math.round(Number(shownIndoorTemperatureC) || 0)}°C` : '-',
      detail: housingIndoorTemperatureInfo?.label || '실내온도 측정 대기'
    }
  ];
  const livingScoreFactors = housingLivingConditionInfo?.scoreFactors || {};
  const livingDetailDeltaByKey = {
    housing: livingScoreFactors.housing,
    food: livingScoreFactors.food,
    essential: livingScoreFactors.essential,
    power: livingScoreFactors.power,
    internet: livingScoreFactors.internet,
    indoor: livingScoreFactors.hvac
  };
  const formatLivingFactorDelta = (valueRaw = 0) => {
    const value = Math.round(Number(valueRaw) || 0);
    if (value > 0) return `+${value}`;
    if (value < 0) return `${value}`;
    return '0';
  };
  const formatHealthDelta = (valueRaw = 0) => {
    const value = Math.round((Number(valueRaw) || 0) * 10) / 10;
    if (value > 0) return `+${value.toFixed(1)}`;
    if (value < 0) return value.toFixed(1);
    return '0.0';
  };
  const indoorTemperatureBreakdown = housingIndoorTemperatureInfo?.livingScoreBreakdown
    || housingLivingConditionInfo?.indoorBreakdown
    || {};
  const indoorTemperatureHealthInfo = housingIndoorTemperatureInfo?.healthInfo || {};
  const indoorTemperatureIllnessRiskInfo = housingIndoorTemperatureInfo?.illnessRiskInfo || {};
  const indoorTemperatureDetailRows = [
    {
      key: 'temperature',
      label: '온도 보정',
      value: indoorTemperatureBreakdown.temperatureLabel || '측정 대기',
      detail: indoorTemperatureBreakdown.temperatureDetail || '실내온도 측정값 없음',
      delta: indoorTemperatureBreakdown.temperatureAdjust
    },
    {
      key: 'hvac',
      label: '공조 작동',
      value: housingIndoorTemperatureInfo?.activeHvacLabel || '공조 꺼짐',
      detail: indoorTemperatureBreakdown.hvacDetail || '공조 보정 없음',
      delta: indoorTemperatureBreakdown.activeHvacBonus
    },
    {
      key: 'total',
      label: '생활여건 합계',
      value: '실내온도 항목',
      detail: '생활여건 자세히의 실내온도 점수와 같은 값',
      delta: indoorTemperatureBreakdown.total
    },
    {
      key: 'health',
      label: '건강도 영향',
      value: indoorTemperatureHealthInfo.label || '건강 영향 없음',
      detail: indoorTemperatureHealthInfo.detail || '하루 건강도 변화 없음',
      delta: indoorTemperatureHealthInfo.delta,
      isHealth: true
    },
    {
      key: 'illness',
      label: '질병 유발',
      value: indoorTemperatureIllnessRiskInfo.label || '질병 유발 없음',
      detail: indoorTemperatureIllnessRiskInfo.detail || '온도성 질병 추가 확률 없음',
      delta: Math.round((Number(indoorTemperatureIllnessRiskInfo.totalRisk) || 0) * 1000) / 10,
      isRisk: true
    }
  ];
  const indoorTemperatureContextRows = [
    ['외부기온', housingIndoorTemperatureInfo ? `${Math.round(Number(housingIndoorTemperatureInfo.outdoorTemperatureC) || 0)}°C` : '-'],
    ['단열', housingIndoorTemperatureInfo?.profileLabel || '-'],
    ['온도 안정성', Number.isFinite(Number(housingIndoorTemperatureInfo?.stabilityPercent)) ? `${housingIndoorTemperatureInfo.stabilityPercent}%` : '-'],
    ['공조 목표', housingIndoorTemperatureInfo ? `${housingIndoorTemperatureInfo.hvacModeLabel || '-'} · ${Math.round(Number(housingIndoorTemperatureInfo.targetTemperatureC) || 21)}°C` : '-'],
    ['공조 효율', Number.isFinite(Number(housingIndoorTemperatureInfo?.hvacPowerPercent)) ? `${housingIndoorTemperatureInfo.hvacPowerPercent}%` : '-']
  ];
  const livingDetailScoreRows = livingDetailRows.map((row) => ({
    ...row,
    delta: Number(livingDetailDeltaByKey[row.key]) || 0
  }));
  const sleepQualityFactors = housingSleepQualityInfo?.factors || {};
  const sleepQualityDetailRows = [
    { key: 'housing', label: '하우징', value: '주거 구조', detail: '하우징 종류와 단열 안정성', delta: sleepQualityFactors.housing },
    { key: 'bed', label: '침대', value: '기본 침대', detail: '현재 침대/침구 품질', delta: sleepQualityFactors.bed },
    { key: 'temperature', label: '실내온도', value: housingIndoorTemperatureInfo ? `${Math.round(Number(shownIndoorTemperatureC) || 0)}°C` : '-', detail: housingIndoorTemperatureInfo?.label || '실내온도 확인 필요', delta: sleepQualityFactors.temperature },
    { key: 'power', label: '실내전기', value: housingInteriorPowerInfo?.label || '-', detail: housingInteriorPowerInfo?.detail || '실내 전기 상태 확인 필요', delta: sleepQualityFactors.power },
    { key: 'hvac', label: '공조', value: housingIndoorTemperatureInfo?.activeHvacLabel || '-', detail: '냉난방 작동 보정', delta: sleepQualityFactors.hvac },
    { key: 'fan', label: '선풍기', value: housingSleepQualityInfo?.fanInfo?.label || '-', detail: housingSleepQualityInfo?.fanInfo?.detail || '선풍기 보정 없음', delta: sleepQualityFactors.fan },
    { key: 'weather', label: '날씨', value: game?.weather || '-', detail: '비바람, 한파, 폭설 등 수면 방해', delta: sleepQualityFactors.weather },
    { key: 'stability', label: '온도 안정성', value: housingIndoorTemperatureInfo?.profileLabel || '-', detail: '밤새 온도가 크게 흔들리지 않는 정도', delta: sleepQualityFactors.stability }
  ];
  const setHvacMode = (mode) => {
    updateHousingInteriorHvacSetting?.({ ...hvacSetting, mode, deviceSelectionEnabled: true });
  };
  const toggleHvacDevice = (kind, itemKeyRaw) => {
    const itemKey = String(itemKeyRaw || '');
    if (!itemKey) return;
    const keyName = kind === 'heating' ? 'selectedHeatingKeys' : 'selectedCoolingKeys';
    const current = Array.isArray(hvacSetting?.[keyName]) ? hvacSetting[keyName] : [];
    const nextKeys = current.includes(itemKey)
      ? current.filter((key) => key !== itemKey)
      : [...current, itemKey];
    updateHousingInteriorHvacSetting?.({ ...hvacSetting, deviceSelectionEnabled: true, [keyName]: nextKeys });
  };
  const stepHvacTarget = (delta) => {
    const nextTarget = Math.max(16, Math.min(28, Math.round(Number(hvacSetting.targetTemperatureC) || 21) + delta));
    updateHousingInteriorHvacSetting?.({ ...hvacSetting, deviceSelectionEnabled: true, targetTemperatureC: nextTarget });
  };
  const stepFridgeTemp = (key, delta) => {
    const fallback = key === 'freezerTempC' ? -18 : 4;
    const min = key === 'freezerTempC' ? -24 : 0;
    const max = key === 'freezerTempC' ? -12 : 8;
    const currentTemp = Number.isFinite(Number(fridgeSetting?.[key])) ? Math.round(Number(fridgeSetting[key])) : fallback;
    const nextTemp = Math.max(min, Math.min(max, currentTemp + delta));
    updateHousingInteriorFridgeSetting?.({ ...fridgeSetting, [key]: nextTemp });
  };
  React.useEffect(() => {
    if (housingInteriorPendingObject?.key !== 'meal') return undefined;
    setMealCooldownNow(Date.now());
    const timer = window.setInterval(() => setMealCooldownNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [housingInteriorPendingObject?.key, housingMealInfo?.cooldownUntilAt]);
  React.useEffect(() => {
    if (housingInteriorPendingObject?.key === 'pc' && !housingInteriorHasInstalledPc) {
      closeHousingInteriorPendingModal?.();
    }
    if (housingInteriorPendingObject?.key === 'tv' && !housingInteriorHasInstalledTv) {
      closeHousingInteriorPendingModal?.();
    }
    if (housingInteriorPendingObject?.key === 'bed' && !housingInteriorHasInstalledBed) {
      closeHousingInteriorPendingModal?.();
    }
    if (housingInteriorPendingObject?.key === 'hvac' && !housingInteriorHasInstalledHvacDevice) {
      closeHousingInteriorPendingModal?.();
    }
  }, [
    closeHousingInteriorPendingModal,
    housingInteriorHasInstalledHvacDevice,
    housingInteriorHasInstalledBed,
    housingInteriorHasInstalledPc,
    housingInteriorHasInstalledTv,
    housingInteriorPendingObject?.key
  ]);
  React.useEffect(() => () => {
    Object.values(cookingApplianceTimerRef.current || {}).forEach((timerId) => {
      if (timerId) window.clearTimeout(timerId);
    });
    cookingApplianceTimerRef.current = {};
    if (cookingPrepCollapseTimerRef.current) {
      window.clearTimeout(cookingPrepCollapseTimerRef.current);
      cookingPrepCollapseTimerRef.current = null;
    }
    if (cookingPrepDeselectTimerRef.current && deselectingCookingPrepKey === prepKey) {
      window.clearTimeout(cookingPrepDeselectTimerRef.current);
      cookingPrepDeselectTimerRef.current = null;
    }
  }, []);
  React.useEffect(() => {
    if (housingInteriorPendingObject?.key === 'meal') {
      setKitchenTab('meal');
      setSelectedCookingApplianceKey('');
    }
    if (housingInteriorPendingObject?.key === 'storage') {
      setStorageTab('warehouse');
    }
  }, [housingInteriorPendingObject?.key]);
  React.useEffect(() => {
    if (housingInteriorPendingObject?.key === 'storage' && storageTab === 'clothing') {
      setStorageTab('warehouse');
    }
  }, [housingInteriorPendingObject?.key, storageTab]);
  const mealCooldownRemainingMs = Math.max(0, Math.floor(Number(housingMealInfo?.cooldownUntilAt) || 0) - mealCooldownNow);
  const mealCooldownSeconds = Math.ceil(mealCooldownRemainingMs / 1000);
  const mealCooldownLabel = mealCooldownSeconds > 0
    ? `${Math.floor(mealCooldownSeconds / 60)}:${String(mealCooldownSeconds % 60).padStart(2, '0')}`
    : '0:00';
  const canEatHousingMealNow = Boolean(housingMealInfo?.canEatWithoutCooldown ?? housingMealInfo?.canEat) && mealCooldownRemainingMs <= 0;
  const housingPlateOptionRows = housingMealInfo?.plateOptionRows || {};
  const housingPlateRiceRows = Array.isArray(housingPlateOptionRows.rice) ? housingPlateOptionRows.rice : [];
  const housingPlateMainRows = Array.isArray(housingPlateOptionRows.main) ? housingPlateOptionRows.main : [];
  const housingPlateSideRows = Array.isArray(housingPlateOptionRows.side) ? housingPlateOptionRows.side : [];
  const housingPlateSoupRows = Array.isArray(housingPlateOptionRows.soup) ? housingPlateOptionRows.soup : [];
  const housingPlateDessertRows = Array.isArray(housingPlateOptionRows.dessert) ? housingPlateOptionRows.dessert : [];
  React.useEffect(() => {
    const firstRice = housingPlateRiceRows.find((row) => row?.canCook) || null;
    const firstMain = housingPlateMainRows.find((row) => row?.canCook) || null;
    const selectedRiceRow = housingPlateRiceRows.find((row) => String(row?.key || '') === selectedPlateRiceKey) || null;
    const selectedMainRow = housingPlateMainRows.find((row) => String(row?.key || '') === selectedPlateMainKey) || null;
    const selectedSoupRow = housingPlateSoupRows.find((row) => String(row?.key || '') === selectedPlateSoupKey) || null;
    const selectedDessertRow = housingPlateDessertRows.find((row) => String(row?.key || '') === selectedPlateDessertKey) || null;
    if (!selectedPlateRiceKey && firstRice?.key) setSelectedPlateRiceKey(String(firstRice.key));
    if (!selectedPlateMainKey && firstMain?.key) setSelectedPlateMainKey(String(firstMain.key));
    if (selectedPlateRiceKey && !selectedRiceRow?.canCook) setSelectedPlateRiceKey('');
    if (selectedPlateMainKey && !selectedMainRow?.canCook) setSelectedPlateMainKey('');
    if (selectedPlateSoupKey && !selectedSoupRow?.canCook) setSelectedPlateSoupKey('');
    if (selectedPlateDessertKey && !selectedDessertRow?.canCook) setSelectedPlateDessertKey('');
    setSelectedPlateSideKeys((prev) => {
      const next = Array.from({ length: 3 }, (_, slotIndex) => {
        const sideKey = String(prev?.[slotIndex] || '');
        if (!sideKey) return '';
        const sideRow = housingPlateSideRows.find((row) => String(row?.key || '') === sideKey) || null;
        return sideRow?.canCook ? sideKey : '';
      });
      return next.every((sideKey, index) => sideKey === String(prev?.[index] || '')) ? prev : next;
    });
  }, [housingPlateDessertRows, housingPlateMainRows, housingPlateRiceRows, housingPlateSideRows, housingPlateSoupRows, selectedPlateDessertKey, selectedPlateMainKey, selectedPlateRiceKey, selectedPlateSoupKey]);
  const selectedPlateRice = housingPlateRiceRows.find((row) => String(row?.key || '') === selectedPlateRiceKey && row?.canCook) || null;
  const selectedPlateMain = housingPlateMainRows.find((row) => String(row?.key || '') === selectedPlateMainKey && row?.canCook) || null;
  const selectedPlateSides = selectedPlateSideKeys.map((sideKey) => (
    housingPlateSideRows.find((row) => String(row?.key || '') === String(sideKey || '') && row?.canCook) || null
  ));
  const selectedPlateSoup = housingPlateSoupRows.find((row) => String(row?.key || '') === selectedPlateSoupKey && row?.canCook) || null;
  const selectedPlateDessert = housingPlateDessertRows.find((row) => String(row?.key || '') === selectedPlateDessertKey && row?.canCook) || null;
  const selectedPlateOptions = [selectedPlateRice, selectedPlateMain, selectedPlateSoup, ...selectedPlateSides, selectedPlateDessert].filter(Boolean);
  const requiredPlateQtyByItemKey = selectedPlateOptions
    .filter(Boolean)
    .reduce((acc, option) => {
      (Array.isArray(option?.ingredients) ? option.ingredients : []).forEach((ingredient) => {
        const itemKey = String(ingredient?.itemKey || '');
        const requiredQty = Math.max(0, Number(ingredient?.requiredQty) || 0);
        if (!itemKey || requiredQty <= 0) return;
        acc[itemKey] = Math.round((Math.max(0, Number(acc[itemKey]) || 0) + requiredQty) * 10000) / 10000;
      });
      return acc;
    }, {});
  const plateCanCook = Boolean(selectedPlateRice && selectedPlateMain)
    && Object.entries(requiredPlateQtyByItemKey).every(([itemKey, requiredQty]) => {
      const sampleIngredient = selectedPlateOptions
        .flatMap((option) => (Array.isArray(option?.ingredients) ? option.ingredients : []))
        .find((ingredient) => ingredient?.itemKey === itemKey);
      const availableQty = Math.max(0, Number(sampleIngredient?.availableQty) || 0);
      return availableQty + 0.0001 >= Math.max(0, Number(requiredQty) || 0);
    });
  const plateOptionPickerActiveSlotKey = plateOptionPickerSlotKey || activePlateSlotKey;
  const activePlateSlotOptions = plateOptionPickerActiveSlotKey === 'rice'
    ? housingPlateRiceRows
    : plateOptionPickerActiveSlotKey === 'main'
      ? housingPlateMainRows
      : plateOptionPickerActiveSlotKey === 'soup'
        ? housingPlateSoupRows
        : plateOptionPickerActiveSlotKey === 'dessert'
          ? housingPlateDessertRows
          : housingPlateSideRows;
  const visibleActivePlateSlotOptions = activePlateSlotOptions.filter((option) => option?.canCook);
  const activePlateSlotLabel = plateOptionPickerActiveSlotKey === 'rice'
    ? '밥'
    : plateOptionPickerActiveSlotKey === 'main'
      ? '메인요리'
      : plateOptionPickerActiveSlotKey === 'soup'
        ? '국'
        : plateOptionPickerActiveSlotKey === 'dessert'
          ? '후식'
          : `반찬 ${Math.max(1, Math.min(3, Number(String(plateOptionPickerActiveSlotKey).replace('side', '')) || 1))}`;
  const setPlateSideKeyAt = (index, optionKey) => {
    setSelectedPlateSideKeys((prev) => {
      const next = Array.from({ length: 3 }, (_, slotIndex) => String(prev?.[slotIndex] || ''));
      next[index] = String(optionKey || '');
      return next;
    });
  };
  const cookingApplianceRows = React.useMemo(() => (
    (Array.isArray(housingInteriorApplianceSlotRows) && housingInteriorApplianceSlotRows.length
      ? housingInteriorApplianceSlotRows
      : HOUSING_APPLIANCE_SLOT_DEFS)
      .filter((slot) => ['microwave', 'riceCooker', 'electricKettle', 'waterPurifier'].includes(String(slot?.type || '')))
  ), [housingInteriorApplianceSlotRows]);
  const cookingApplianceLabelOf = (slot = null) => {
    const type = String(slot?.type || '');
    if (type === 'microwave') return '전자레인지';
    if (type === 'riceCooker') return '전기밥솥';
    if (type === 'electricKettle') return '커피포트';
    return '정수기';
  };
  const selectedCookingAppliance = cookingApplianceRows.find((slot) => String(slot?.key || '') === selectedCookingApplianceKey) || null;
  const riceCookerServingLimit = React.useMemo(() => {
    if (String(selectedCookingAppliance?.type || '') !== 'riceCooker') return 0;
    const explicitServings = Math.max(0, Math.floor(Number(selectedCookingAppliance?.servings) || 0));
    if (explicitServings > 0) return explicitServings;
    const itemKey = String(selectedCookingAppliance?.itemKey || '');
    if (itemKey === 'cookingPotIH10') return 10;
    if (itemKey === 'cookingPotClassic6') return 6;
    return 3;
  }, [selectedCookingAppliance?.itemKey, selectedCookingAppliance?.servings, selectedCookingAppliance?.type]);
  const defaultRiceCookBowls = Math.max(1, Math.min(10, Math.floor(Number(riceCookerServingLimit) || 3)));
  React.useEffect(() => {
    setSelectedCookingPrepKey('');
    setCollapsingCookingPrepKey('');
    setSelectedCookingPrepQtyByKey({});
    setDeselectingCookingPrepKey('');
    setSelectedRiceCookBowls(defaultRiceCookBowls);
    setSelectedRiceWaterSourceKey('');
    if (cookingPrepCollapseTimerRef.current) {
      window.clearTimeout(cookingPrepCollapseTimerRef.current);
      cookingPrepCollapseTimerRef.current = null;
    }
    if (cookingPrepDeselectTimerRef.current) {
      window.clearTimeout(cookingPrepDeselectTimerRef.current);
      cookingPrepDeselectTimerRef.current = null;
    }
  }, [defaultRiceCookBowls, selectedCookingApplianceKey]);
  const housingPrepRows = Array.isArray(housingMealInfo?.prepRows) ? housingMealInfo.prepRows : [];
  const cookingApplianceBatchLimit = React.useMemo(() => {
    if (String(selectedCookingAppliance?.type || '') !== 'microwave') return 1;
    const itemKey = String(selectedCookingAppliance?.itemKey || '');
    if (itemKey === 'heatWaveFlat28') return 4;
    if (itemKey === 'heatWaveD23') return 3;
    if (itemKey === 'heatWaveM20') return 2;
    return 2;
  }, [selectedCookingAppliance?.itemKey, selectedCookingAppliance?.type]);
  const cookingAppliancePrepKeySet = React.useMemo(() => {
    const type = String(selectedCookingAppliance?.type || '');
    if (type === 'microwave') {
      return new Set([
        'heatedTriangleGimbap',
        'heatedLunchBox',
        'heatedKimbapRoll',
        'heatedHotdog',
        'heatedHamburger',
        'heatedInstantRice',
        'heatedInstantSeaweedSoup',
        'heatedInstantYukgaejang',
        'heatedFrozenPorkCutlet',
        'heatedFrozenPizza',
        'heatedFrozenFriedRice',
        'heatedFrozenPasta',
        'heatedFrozenTteokbokki',
        'heatedPorridgeAbalone',
        'heatedPorridgeVegetable'
      ]);
    }
    if (type === 'electricKettle') {
      return new Set([
        'housingHotWaterCup',
        'preparedMixCoffee',
        'preparedGreenTea',
        'preparedCupRamen',
        'heatedInstantSeaweedSoup',
        'preparedCreamSoup',
        'preparedCupRiceSoup'
      ]);
    }
    if (type === 'riceCooker') {
      return new Set([
        'housingCookedRiceBowl'
      ]);
    }
    if (type === 'waterPurifier') {
      return new Set([
        'housingWaterCup',
        'housingFilledWaterBottle'
      ]);
    }
    return new Set();
  }, [selectedCookingAppliance?.type]);
  const housingPrepCookBatchQtyOf = React.useCallback((prep = null) => {
    const limit = Math.max(1, Math.floor(Number(cookingApplianceBatchLimit) || 1));
    if (String(selectedCookingAppliance?.type || '') !== 'microwave') return 1;
    const ingredients = Array.isArray(prep?.ingredients) ? prep.ingredients : [];
    const ingredientLimits = ingredients.map((ingredient) => {
      const requiredQty = Math.max(0, Number(ingredient?.requiredQty) || 0);
      if (requiredQty <= 0) return limit;
      return Math.floor((Math.max(0, Number(ingredient?.availableQty) || 0) + 0.0001) / requiredQty);
    });
    const maxByIngredients = ingredientLimits.length ? Math.min(...ingredientLimits) : limit;
    return Math.max(1, Math.min(limit, Math.floor(maxByIngredients || 0)));
  }, [cookingApplianceBatchLimit, selectedCookingAppliance?.type]);
  const cookableHousingPrepRows = housingPrepRows
    .filter((prep) => prep?.canCook && cookingAppliancePrepKeySet.has(String(prep?.key || '')))
    .map((prep) => ({
      ...prep,
      cookBatchQty: housingPrepCookBatchQtyOf(prep)
    }));
  const selectedCookingPrepEntries = React.useMemo(() => (
    Object.entries(selectedCookingPrepQtyByKey || {})
      .map(([prepKey, qtyRaw]) => ({
        prepKey: String(prepKey || ''),
        qty: Math.max(0, Math.floor(Number(qtyRaw) || 0))
      }))
      .filter((entry) => entry.prepKey && entry.qty > 0)
  ), [selectedCookingPrepQtyByKey]);
  const selectedCookingPrepTotalQty = selectedCookingPrepEntries.reduce((sum, entry) => sum + entry.qty, 0);
  const selectedCookingPrepCount = selectedCookingPrepEntries.length;
  const selectedCookingCapacityLimit = React.useMemo(() => {
    const type = String(selectedCookingAppliance?.type || '');
    if (type === 'microwave') return Math.max(1, Math.floor(Number(cookingApplianceBatchLimit) || 1));
    return Number.POSITIVE_INFINITY;
  }, [cookingApplianceBatchLimit, selectedCookingAppliance?.type]);
  const selectedCookingPrepNameByKey = React.useMemo(() => (
    cookableHousingPrepRows.reduce((acc, prep) => {
      const prepKey = String(prep?.key || '');
      if (prepKey) acc[prepKey] = String(prep?.name || prepKey);
      return acc;
    }, {})
  ), [cookableHousingPrepRows]);
  const selectedRiceCooking = React.useMemo(() => {
    if (String(selectedCookingAppliance?.type || '') !== 'riceCooker') return null;
    const prep = cookableHousingPrepRows.find((row) => String(row?.key || '') === 'housingCookedRiceBowl') || null;
    if (!prep) return null;
    const riceBaseOutputQty = Math.max(1, Number(prep?.outputQty) || 3);
    const riceCookerMaxBowls = Math.max(1, Math.min(10, Math.floor(Number(riceCookerServingLimit) || 3)));
    const riceIngredientMaxBowls = (Array.isArray(prep?.ingredients) ? prep.ingredients : []).reduce((limit, ingredient) => {
      const requiredQty = Math.max(0, Number(ingredient?.requiredQty) || 0);
      if (requiredQty <= 0) return limit;
      const availableQty = Math.max(0, Number(ingredient?.availableQty) || 0);
      const ingredientBowls = Math.floor(((availableQty + 0.0001) / requiredQty) * riceBaseOutputQty);
      return Math.min(limit, Math.max(0, ingredientBowls));
    }, riceCookerMaxBowls);
    const maxBowls = Math.max(1, Math.min(riceCookerMaxBowls, riceIngredientMaxBowls));
    const outputQty = Math.max(1, Math.min(maxBowls, Math.floor(Number(selectedRiceCookBowls) || 1)));
    const waterScale = outputQty / riceBaseOutputQty;
    const waterOptions = (Array.isArray(prep?.waterSourceOptions) ? prep.waterSourceOptions : []).map((option) => {
      const optionKey = String(option?.key || '');
      if (optionKey === 'bottledWater') {
        const requiredQty = Math.round(Math.max(0, Number(option?.requiredQtyPerCook) || 0) * waterScale * 100) / 100;
        return {
          ...option,
          canUse: Math.max(0, Number(option?.availableQty) || 0) + 0.0001 >= requiredQty
        };
      }
      if (optionKey === 'purifierWater') {
        const requiredLiters = Math.max(0, Number(option?.requiredLitersPerCook) || 0) * waterScale;
        return {
          ...option,
          canUse: Boolean(option?.hasInstalled) && Math.max(0, Number(option?.availableLiters) || 0) + 0.0001 >= requiredLiters
        };
      }
      return {
        ...option,
        canUse: Boolean(option?.canUse)
      };
    });
    const waterOption = waterOptions.find((option) => String(option?.key || '') === selectedRiceWaterSourceKey) || null;
    const waterLabel = waterOption?.label ? ` · ${waterOption.label}` : '';
    return {
      prep,
      outputQty,
      waterSource: String(waterOption?.key || ''),
      canConfirm: Boolean(waterOption?.canUse),
      summary: `지어진밥 ${outputQty}공기${waterLabel}`
    };
  }, [
    cookableHousingPrepRows,
    riceCookerServingLimit,
    selectedCookingAppliance?.type,
    selectedRiceCookBowls,
    selectedRiceWaterSourceKey
  ]);
  const cookingSelectionSummary = selectedCookingPrepEntries.length
    ? selectedCookingPrepEntries
      .map((entry) => `${selectedCookingPrepNameByKey[entry.prepKey] || entry.prepKey} ${entry.qty}개`)
      .join(' · ')
    : selectedRiceCooking?.summary || '선택된 조리 항목 없음';
  const changeCookingPrepSelectionQty = React.useCallback((prepKeyRaw = '', nextQtyRaw = 0) => {
    const prepKey = String(prepKeyRaw || '');
    if (!prepKey) return;
    const prep = cookableHousingPrepRows.find((row) => String(row?.key || '') === prepKey);
    if (!prep) return;
    const currentQty = Math.max(0, Math.floor(Number(selectedCookingPrepQtyByKey?.[prepKey]) || 0));
    const itemLimit = Math.max(1, Math.floor(Number(prep?.cookBatchQty) || 1));
    const capacityLimitForItem = Number.isFinite(selectedCookingCapacityLimit)
      ? Math.max(0, selectedCookingCapacityLimit - (selectedCookingPrepTotalQty - currentQty))
      : itemLimit;
    const maxQty = Math.max(0, Math.min(itemLimit, capacityLimitForItem));
    const nextQty = Math.max(0, Math.min(maxQty, Math.floor(Number(nextQtyRaw) || 0)));
    if (cookingPrepDeselectTimerRef.current) {
      window.clearTimeout(cookingPrepDeselectTimerRef.current);
      cookingPrepDeselectTimerRef.current = null;
    }
    if (nextQty <= 0 && currentQty > 0) {
      setDeselectingCookingPrepKey(prepKey);
      cookingPrepDeselectTimerRef.current = window.setTimeout(() => {
        setSelectedCookingPrepQtyByKey((prev) => {
          const next = { ...(prev || {}) };
          delete next[prepKey];
          return next;
        });
        setDeselectingCookingPrepKey((currentKey) => (currentKey === prepKey ? '' : currentKey));
        cookingPrepDeselectTimerRef.current = null;
      }, 180);
      return;
    }
    setDeselectingCookingPrepKey((currentKey) => (currentKey === prepKey ? '' : currentKey));
    setSelectedCookingPrepQtyByKey((prev) => {
      const next = { ...(prev || {}) };
      if (nextQty > 0) next[prepKey] = nextQty;
      else delete next[prepKey];
      return next;
    });
  }, [
    cookableHousingPrepRows,
    deselectingCookingPrepKey,
    selectedCookingCapacityLimit,
    selectedCookingPrepQtyByKey,
    selectedCookingPrepTotalQty
  ]);
  const toggleCookingPrepSelection = React.useCallback((prepKeyRaw = '') => {
    const prepKey = String(prepKeyRaw || '');
    const currentQty = Math.max(0, Math.floor(Number(selectedCookingPrepQtyByKey?.[prepKey]) || 0));
    changeCookingPrepSelectionQty(prepKey, currentQty > 0 ? 0 : 1);
  }, [changeCookingPrepSelectionQty, selectedCookingPrepQtyByKey]);
  const toggleCookingPrepExpansion = React.useCallback((prepKeyRaw = '') => {
    const prepKey = String(prepKeyRaw || '');
    if (!prepKey) return;
    if (cookingPrepCollapseTimerRef.current) {
      window.clearTimeout(cookingPrepCollapseTimerRef.current);
      cookingPrepCollapseTimerRef.current = null;
    }
    if (selectedCookingPrepKey === prepKey) {
      setCollapsingCookingPrepKey(prepKey);
      cookingPrepCollapseTimerRef.current = window.setTimeout(() => {
        setSelectedCookingPrepKey((currentKey) => (currentKey === prepKey ? '' : currentKey));
        setCollapsingCookingPrepKey((currentKey) => (currentKey === prepKey ? '' : currentKey));
        cookingPrepCollapseTimerRef.current = null;
      }, 220);
      return;
    }
    setCollapsingCookingPrepKey('');
    setSelectedCookingPrepKey(prepKey);
  }, [selectedCookingPrepKey]);
  const startCookingApplianceTask = React.useCallback((slotRaw = null, actionsRaw = [], labelRaw = '') => {
    const slotKey = String(slotRaw?.key || '');
    const slotType = String(slotRaw?.type || '');
    const actions = (Array.isArray(actionsRaw) ? actionsRaw : [])
      .map((action) => ({
        prepKey: String(action?.prepKey || ''),
        qty: Math.max(0, Number(action?.qty) || 0),
        options: action?.options && typeof action.options === 'object' ? { ...action.options } : undefined
      }))
      .filter((action) => action.prepKey && action.qty > 0);
    if (!slotKey || !actions.length) return;
    const durationMs = Math.max(0, Number(HOUSING_APPLIANCE_COOKING_DURATION_MS_BY_TYPE[slotType]) || 0);
    if (durationMs <= 0) {
      actions.forEach((action) => cookHousingMeal?.(action.prepKey, action.qty, action.options));
      return;
    }
    if (cookingApplianceTasksByKey?.[slotKey]) return;
    const now = Date.now();
    const task = {
      slotKey,
      slotType,
      label: String(labelRaw || '조리중'),
      startedAt: now,
      completeAt: now + durationMs,
      durationMs,
      actions
    };
    setCookingApplianceTasksByKey((prev) => ({
      ...(prev || {}),
      [slotKey]: task
    }));
    if (cookingApplianceTimerRef.current?.[slotKey]) {
      window.clearTimeout(cookingApplianceTimerRef.current[slotKey]);
    }
    cookingApplianceTimerRef.current[slotKey] = window.setTimeout(() => {
      if (slotType === 'riceCooker') {
        setCookingApplianceTasksByKey((prev) => ({
          ...(prev || {}),
          [slotKey]: {
            ...task,
            label: '밥 짓기 완료',
            completeAt: Date.now(),
            completed: true
          }
        }));
        delete cookingApplianceTimerRef.current[slotKey];
        return;
      }
      actions.forEach((action) => cookHousingMeal?.(action.prepKey, action.qty, action.options));
      setCookingApplianceTasksByKey((prev) => {
        const next = { ...(prev || {}) };
        delete next[slotKey];
        return next;
      });
      delete cookingApplianceTimerRef.current[slotKey];
    }, durationMs);
  }, [cookHousingMeal, cookingApplianceTasksByKey]);
  const collectCompletedCookingApplianceTask = React.useCallback((slotKeyRaw = '') => {
    const slotKey = String(slotKeyRaw || '');
    const task = cookingApplianceTasksByKey?.[slotKey] || null;
    if (!slotKey || !task?.completed) return;
    (Array.isArray(task.actions) ? task.actions : []).forEach((action) => {
      cookHousingMeal?.(action.prepKey, action.qty, action.options);
    });
    setCookingApplianceTasksByKey((prev) => {
      const next = { ...(prev || {}) };
      delete next[slotKey];
      return next;
    });
  }, [cookHousingMeal, cookingApplianceTasksByKey]);
  const confirmCookingPrepSelection = React.useCallback(() => {
    if (String(selectedCookingAppliance?.type || '') === 'riceCooker') {
      if (!selectedRiceCooking?.canConfirm) return;
      startCookingApplianceTask(
        selectedCookingAppliance,
        [{
          prepKey: 'housingCookedRiceBowl',
          qty: 1,
          options: {
            waterSource: selectedRiceCooking.waterSource,
            outputQty: selectedRiceCooking.outputQty
          }
        }],
        selectedRiceCooking.summary
      );
      setSelectedRiceWaterSourceKey('');
      setSelectedCookingApplianceKey('');
      return;
    }
    if (!selectedCookingPrepEntries.length) return;
    startCookingApplianceTask(
      selectedCookingAppliance,
      selectedCookingPrepEntries.map((entry) => ({
        prepKey: entry.prepKey,
        qty: entry.qty
      })),
      cookingSelectionSummary
    );
    setSelectedCookingPrepQtyByKey({});
    setSelectedCookingApplianceKey('');
  }, [
    cookingSelectionSummary,
    selectedCookingAppliance,
    selectedCookingPrepEntries,
    selectedRiceCooking,
    startCookingApplianceTask
  ]);
  const housingRecipeRows = Array.isArray(housingMealInfo?.recipeRows) ? housingMealInfo.recipeRows : [];
  const visibleHousingRecipeRows = housingRecipeRows.filter((recipe) => String(recipe?.category || '') === cookRecipeTab);
  const selectedCookRecipe = housingRecipeRows.find((recipe) => String(recipe?.key || '') === selectedCookRecipeKey) || null;
  const visibleSelectedCookRecipe = selectedCookRecipe
    && String(selectedCookRecipe?.category || '') === cookRecipeTab
    ? selectedCookRecipe
    : null;
  const housingWaterAvailableLiters = Math.max(0, Number(housingWaterInfo?.availableLiters) || 0);
  const housingWaterDailyLiters = Math.max(0, Number(housingWaterInfo?.dailyLivingWaterLiters) || 0);
  const housingWaterStatusText = housingWaterInfo?.hasMunicipalWater
    ? `상수도 · 생활수질 ${Math.round(Number(housingWaterInfo?.livingWaterQuality) || 0)}/100 ${housingWaterInfo?.livingWaterQualityLabel || ''}`.trim()
    : housingWaterInfo?.hasTank
      ? `물탱크 ${housingWaterInfo.displayText || '0L'} · 생활수질 ${Math.round(Number(housingWaterInfo?.livingWaterQuality) || 0)}/100 ${housingWaterInfo?.livingWaterQualityLabel || ''}`.trim()
    : '물탱크 없음';
  const fridgeTempModalConfig = fridgeTempModalKey === 'freezerTempC'
    ? {
        key: 'freezerTempC',
        label: '냉동실',
        temp: freezerTempC,
        min: -24,
        max: -12,
        recommended: '-18°C 전후'
      }
    : fridgeTempModalKey === 'fridgeTempC'
      ? {
          key: 'fridgeTempC',
          label: '냉장실',
          temp: fridgeTempC,
          min: 0,
          max: 8,
          recommended: '3~5°C'
        }
      : null;
  React.useEffect(() => {
    if (housingInteriorPendingObject?.key !== 'fridge') {
      setFridgeTempModalKey('');
      setFridgeSourceTab('bag');
      setFridgeSourcePickerOpen(false);
      setFridgeVehicleSourceKey('');
      setFridgeWarehouseSourceKey('');
      setFridgeMovingItem(null);
      if (fridgeMoveTimerRef.current) {
        window.clearTimeout(fridgeMoveTimerRef.current);
        fridgeMoveTimerRef.current = null;
      }
    }
  }, [housingInteriorPendingObject?.key]);
  React.useEffect(() => () => {
    if (fridgeMoveTimerRef.current) {
      window.clearTimeout(fridgeMoveTimerRef.current);
      fridgeMoveTimerRef.current = null;
    }
  }, []);
  React.useEffect(() => {
    setHousingInstallSlotDetail(null);
  }, [housingInteriorPendingObject?.key, storageTab]);
  React.useEffect(() => {
    if (housingInteriorPendingObject?.key !== 'fridge') return;
    const vehicleSources = Array.isArray(housingInteriorVehicleFoodSourceRows) ? housingInteriorVehicleFoodSourceRows : [];
    if (!vehicleSources.length) {
      if (fridgeVehicleSourceKey) setFridgeVehicleSourceKey('');
      return;
    }
    const hasSelected = vehicleSources.some((source) => String(source?.sourceKey || '') === fridgeVehicleSourceKey);
    if (!hasSelected) setFridgeVehicleSourceKey(String(vehicleSources[0]?.sourceKey || ''));
  }, [fridgeVehicleSourceKey, housingInteriorPendingObject?.key, housingInteriorVehicleFoodSourceRows]);
  const selectedFridgeVehicleSource = React.useMemo(() => (
    (Array.isArray(housingInteriorVehicleFoodSourceRows) ? housingInteriorVehicleFoodSourceRows : [])
      .find((source) => String(source?.sourceKey || '') === fridgeVehicleSourceKey)
    || (Array.isArray(housingInteriorVehicleFoodSourceRows) ? housingInteriorVehicleFoodSourceRows[0] : null)
    || null
  ), [fridgeVehicleSourceKey, housingInteriorVehicleFoodSourceRows]);
  const housingInteriorWarehouseFoodSourceRows = React.useMemo(
    () => (Array.isArray(housingInteriorFridgeSourceRows) ? housingInteriorFridgeSourceRows : [])
      .filter((source) => String(source?.sourceType || '') === 'warehouse'),
    [housingInteriorFridgeSourceRows]
  );
  React.useEffect(() => {
    if (housingInteriorPendingObject?.key !== 'fridge') return;
    const warehouseSources = Array.isArray(housingInteriorWarehouseFoodSourceRows) ? housingInteriorWarehouseFoodSourceRows : [];
    if (!warehouseSources.length) {
      if (fridgeWarehouseSourceKey) setFridgeWarehouseSourceKey('');
      return;
    }
    const hasSelected = warehouseSources.some((source) => String(source?.sourceKey || '') === fridgeWarehouseSourceKey);
    if (!hasSelected) setFridgeWarehouseSourceKey(String(warehouseSources[0]?.sourceKey || ''));
  }, [fridgeWarehouseSourceKey, housingInteriorPendingObject?.key, housingInteriorWarehouseFoodSourceRows]);
  const selectedFridgeWarehouseSource = React.useMemo(() => (
    (Array.isArray(housingInteriorWarehouseFoodSourceRows) ? housingInteriorWarehouseFoodSourceRows : [])
      .find((source) => String(source?.sourceKey || '') === fridgeWarehouseSourceKey)
    || (Array.isArray(housingInteriorWarehouseFoodSourceRows) ? housingInteriorWarehouseFoodSourceRows[0] : null)
    || null
  ), [fridgeWarehouseSourceKey, housingInteriorWarehouseFoodSourceRows]);
  const housingInteriorHousingStorageFoodRows = React.useMemo(
    () => (Array.isArray(housingInteriorStorageRows) ? housingInteriorStorageRows : [])
      .filter((item) => String(item?.category || '') === 'foodMart' && String(item?.subgroup || '') !== 'living'),
    [housingInteriorStorageRows]
  );
  const isWaterSourceStorageItem = React.useCallback((item) => (
    Number(item?.waterTankLiters) > 0
    || /물탱크|수원|저수조/.test(`${String(item?.name || '')} ${String(item?.desc || '')}`)
  ), []);
  const housingInteriorWaterSourceRows = React.useMemo(
    () => (Array.isArray(housingInteriorStorageRows) ? housingInteriorStorageRows : [])
      .filter((item) => isWaterSourceStorageItem(item)),
    [housingInteriorStorageRows, isWaterSourceStorageItem]
  );
  const housingInteriorWaterSourceRowsBySource = React.useMemo(() => (
    (Array.isArray(housingInteriorStorageSourceRows) ? housingInteriorStorageSourceRows : [])
      .map((source) => ({
        ...source,
        items: (Array.isArray(source?.items) ? source.items : []).filter((item) => isWaterSourceStorageItem(item))
      }))
      .filter((source) => source.items.length > 0)
  ), [housingInteriorStorageSourceRows, isWaterSourceStorageItem]);
  const housingWaterTankInstallCandidateRows = React.useMemo(() => {
    const rowsBySource = Array.isArray(housingInteriorWaterSourceRowsBySource) ? housingInteriorWaterSourceRowsBySource : [];
    const sourceRows = rowsBySource.flatMap((source) => (
      (Array.isArray(source?.items) ? source.items : [])
        .filter((item) => Math.max(0, Number(item?.waterTankLiters) || 0) > 0)
        .map((item) => ({
          ...item,
          sourceType: String(source?.sourceType || ''),
          sourceKey: String(source?.sourceKey || ''),
          sourceName: String(source?.sourceName || ''),
          sourceIcon: String(source?.sourceIcon || '')
        }))
    ));
    if (sourceRows.length) return sourceRows;
    return (Array.isArray(housingInteriorWaterSourceRows) ? housingInteriorWaterSourceRows : [])
      .filter((item) => Math.max(0, Number(item?.waterTankLiters) || 0) > 0);
  }, [housingInteriorWaterSourceRows, housingInteriorWaterSourceRowsBySource]);
  const selectedHousingInteriorField = React.useMemo(() => {
    const fields = Array.isArray(game?.fields) ? game.fields : [];
    return fields[Math.max(0, Math.floor(Number(game?.selectedField) || 0))] || null;
  }, [game?.fields, game?.selectedField]);
  const housingFoodExpiryByColdStorage = React.useMemo(() => {
    const facilityKey = String(housingInteriorFacilityKey || '');
    const day = Math.max(1, Math.floor(Number(game?.day) || 1));
    if (!facilityKey || !selectedHousingInteriorField) return { fridge: {}, freezer: {} };
    const buildMap = (batchMap) => {
      const next = {};
      const itemRows = batchMap?.[facilityKey] || {};
      Object.keys(itemRows || {}).forEach((itemKey) => {
        const summary = housingFoodStorageExpirySummaryOf({
          batchesByFacilityKey: batchMap,
          facilityKey,
          itemKey,
          day
        });
        if (summary) next[itemKey] = summary;
      });
      return next;
    };
    return {
      fridge: buildMap(selectedHousingInteriorField.housingFoodStorageBatchesByFacilityKey || {}),
      freezer: buildMap(selectedHousingInteriorField.housingFreezerFoodStorageBatchesByFacilityKey || {})
    };
  }, [game?.day, housingInteriorFacilityKey, selectedHousingInteriorField]);
  const selectedColdStorageMoveTarget = React.useMemo(() => {
    if (fridgeSourceTab === 'vehicle') {
      if (!selectedFridgeVehicleSource) return null;
      return {
        targetType: selectedFridgeVehicleSource.sourceType,
        targetKey: selectedFridgeVehicleSource.sourceKey,
        targetName: selectedFridgeVehicleSource.sourceName,
        icon: '🚗',
        title: `${selectedFridgeVehicleSource.sourceName || '내 차량'}으로 이동`
      };
    }
    if (fridgeSourceTab === 'warehouse') {
      const warehouseSource = selectedFridgeWarehouseSource;
      if (!warehouseSource) return null;
      return {
        targetType: warehouseSource.sourceType,
        targetKey: warehouseSource.sourceKey,
        targetName: warehouseSource.sourceName,
        icon: '🏚️',
        title: `${warehouseSource.sourceName || '창고'}로 이동`
      };
    }
    if (fridgeSourceTab === 'housingStorage') {
      const facilityKey = String(housingInteriorStorageInfo?.facilityKey || '');
      if (!facilityKey) return null;
      return {
        targetType: 'warehouse',
        targetKey: facilityKey,
        targetName: String(housingInteriorStorageInfo?.facilityName || '하우징 창고'),
        icon: '📦',
        title: `${String(housingInteriorStorageInfo?.facilityName || '하우징 창고')}로 이동`
      };
    }
    return {
      targetType: 'carrier',
      targetKey: '__personal_carry__',
      targetName: '개인소지품',
      icon: '🧺',
      title: '개인소지품으로 이동'
    };
  }, [fridgeSourceTab, housingInteriorStorageInfo, selectedFridgeVehicleSource, selectedFridgeWarehouseSource]);
  const fridgeSourceLabel = fridgeSourceTab === 'vehicle'
    ? (selectedFridgeVehicleSource?.sourceName || '내차량')
    : fridgeSourceTab === 'warehouse'
      ? (selectedFridgeWarehouseSource?.sourceName || '창고')
      : fridgeSourceTab === 'housingStorage'
        ? (housingInteriorStorageInfo?.facilityName || '하우징 창고')
      : '개인소지품';
  const fridgeSourcePickerOptions = React.useMemo(() => {
    const options = [];
    options.push({
      key: 'bag',
      label: '내 가방',
      detail: (Array.isArray(housingInteriorBagFoodRows) && housingInteriorBagFoodRows.length > 0)
        ? `개인소지품 · 식료품 ${housingInteriorBagFoodRows.length}종`
        : '개인소지품 · 식료품 없음',
      foodCount: Array.isArray(housingInteriorBagFoodRows) ? housingInteriorBagFoodRows.length : 0,
      previewItems: Array.isArray(housingInteriorBagFoodRows) ? housingInteriorBagFoodRows : []
    });
    (Array.isArray(housingInteriorVehicleFoodSourceRows) ? housingInteriorVehicleFoodSourceRows : [])
      .forEach((source) => {
        const sourceItems = Array.isArray(source?.items) ? source.items : [];
        options.push({
          key: 'vehicle',
          sourceKey: String(source?.sourceKey || ''),
          label: source?.sourceName || '차량',
          detail: source?.sourceDetail || `식료품 ${sourceItems.length}종`,
          foodCount: sourceItems.length,
          sourceImageSrc: String(source?.sourceImageSrc || ''),
          previewItems: sourceItems
        });
      });
    (Array.isArray(housingInteriorWarehouseFoodSourceRows) ? housingInteriorWarehouseFoodSourceRows : [])
      .forEach((source) => {
        const sourceItems = Array.isArray(source?.items) ? source.items : [];
        options.push({
          key: 'warehouse',
          sourceKey: String(source?.sourceKey || ''),
          label: source?.sourceName || '창고',
          detail: source?.sourceDetail || `식료품 ${sourceItems.length}종`,
          foodCount: sourceItems.length,
          sourceImageSrc: String(source?.sourceImageSrc || ''),
          previewItems: sourceItems
        });
      });
    if (housingInteriorStorageInfo?.facilityKey) {
      options.push({
        key: 'housingStorage',
        sourceKey: String(housingInteriorStorageInfo.facilityKey || ''),
        label: housingInteriorStorageInfo.facilityName || '적재공간',
        detail: housingInteriorHousingStorageFoodRows.length
          ? `하우징 적재공간 · 식료품 ${housingInteriorHousingStorageFoodRows.length}종`
          : '하우징 적재공간 · 식료품 없음',
        foodCount: housingInteriorHousingStorageFoodRows.length,
        sourceImageSrc: String(housingInteriorStorageInfo?.imageSrc || ''),
        previewItems: Array.isArray(housingInteriorHousingStorageFoodRows) ? housingInteriorHousingStorageFoodRows : []
      });
    }
    return options;
  }, [
    housingInteriorBagFoodRows,
    housingInteriorHousingStorageFoodRows,
    housingInteriorStorageInfo,
    housingInteriorVehicleFoodSourceRows,
    housingInteriorWarehouseFoodSourceRows
  ]);
  const fridgeSourcePickerTabs = React.useMemo(() => {
    const countOf = (key) => fridgeSourcePickerOptions.filter((option) => {
      if (String(option?.key || '') !== key) return false;
      if (key === 'warehouse') return true;
      return Math.max(0, Number(option?.foodCount) || 0) > 0;
    }).length;
    return [
      { key: 'bag', label: '가방', count: countOf('bag') },
      { key: 'vehicle', label: '차량', count: countOf('vehicle') },
      { key: 'warehouse', label: '창고', count: countOf('warehouse') },
      { key: 'housingStorage', label: '하우징', count: countOf('housingStorage') }
    ].filter((tab) => tab.count > 0);
  }, [fridgeSourcePickerOptions]);
  const visibleFridgeSourcePickerOptions = React.useMemo(() => (
    fridgeSourcePickerOptions
      .filter((option) => String(option?.key || '') === fridgeSourcePickerTab)
      .filter((option) => (
        String(option?.key || '') === 'warehouse'
        || Math.max(0, Number(option?.foodCount) || 0) > 0
      ))
      .sort((a, b) => (
        Math.max(0, Number(b?.foodCount) || 0) - Math.max(0, Number(a?.foodCount) || 0)
        || String(a?.label || '').localeCompare(String(b?.label || ''), 'ko')
      ))
  ), [fridgeSourcePickerOptions, fridgeSourcePickerTab]);
  const storageSourcePickerOptions = React.useMemo(() => (
    (Array.isArray(housingInteriorStorageSourceRows) ? housingInteriorStorageSourceRows : []).map((source) => {
      const sourceType = String(source?.sourceType || 'carrier');
      const sourceKey = String(source?.sourceKey || '');
      const items = Array.isArray(source?.items) ? source.items : [];
      const key = sourceType === 'housingColdStorage'
        ? 'housingFridge'
        : sourceType === 'warehouse'
        ? 'warehouse'
        : (sourceKey === '__personal_carry__' ? 'bag' : 'vehicle');
      return {
        key,
        sourceType,
        sourceKey,
        label: source?.sourceName || (key === 'bag' ? '개인소지품' : key === 'warehouse' ? '창고' : key === 'housingFridge' ? '하우징냉장고' : '차량'),
        detail: source?.sourceDetail || (items.length ? `보관품 ${items.length}종` : '보관품 없음'),
        foodCount: items.length,
        sourceIcon: String(source?.sourceIcon || (key === 'vehicle' ? '🚗' : key === 'warehouse' ? '🏚️' : key === 'housingFridge' ? '🧊' : '🧺')),
        sourceImageSrc: String(source?.sourceImageSrc || ''),
        previewItems: items
      };
    })
  ), [housingInteriorStorageSourceRows]);
  const storageSourcePickerTabs = React.useMemo(() => {
    const countOf = (key) => storageSourcePickerOptions.filter((option) => String(option?.key || '') === key).length;
    return [
      { key: 'vehicle', label: '차량', count: countOf('vehicle') },
      { key: 'warehouse', label: '창고', count: countOf('warehouse') },
      { key: 'bag', label: '개인소지품', count: countOf('bag') },
      { key: 'housingFridge', label: '하우징냉장고', count: countOf('housingFridge') }
    ].filter((tab) => tab.count > 0);
  }, [storageSourcePickerOptions]);
  const visibleStorageSourcePickerOptions = React.useMemo(() => (
    storageSourcePickerOptions
      .filter((option) => String(option?.key || '') === storageSourcePickerTab)
      .sort((a, b) => (
        Math.max(0, Number(b?.foodCount) || 0) - Math.max(0, Number(a?.foodCount) || 0)
        || String(a?.label || '').localeCompare(String(b?.label || ''), 'ko')
      ))
  ), [storageSourcePickerOptions, storageSourcePickerTab]);
  const selectedStorageSourceOption = React.useMemo(() => (
    storageSourcePickerOptions.find((option) => (
      String(option?.key || '') === storageSourceTab
      && (String(option?.key || '') !== 'bag' || !storageSourceKey)
      && (String(option?.key || '') === 'bag' || String(option?.sourceKey || '') === storageSourceKey)
    ))
    || storageSourcePickerOptions.find((option) => String(option?.key || '') === 'bag')
    || storageSourcePickerOptions[0]
    || null
  ), [storageSourceKey, storageSourcePickerOptions, storageSourceTab]);
  const storageSourceLabel = selectedStorageSourceOption?.label || '개인소지품';
  const storageSourceIcon = String(selectedStorageSourceOption?.sourceIcon || (String(selectedStorageSourceOption?.key || '') === 'vehicle' ? '🚗' : String(selectedStorageSourceOption?.key || '') === 'warehouse' ? '🏚️' : '🧺'));
  const selectedStorageTargetType = String(selectedStorageSourceOption?.sourceType || 'carrier');
  const selectedStorageTargetKey = String(selectedStorageSourceOption?.key || '') === 'bag'
    ? '__personal_carry__'
    : String(selectedStorageSourceOption?.sourceKey || '');
  const canMoveFromHousingStorageToSelectedTarget = Boolean(selectedStorageTargetType && selectedStorageTargetKey);
  const storageSourceDisplayRows = String(selectedStorageSourceOption?.key || '') === 'bag'
    ? housingInteriorBagRows
    : (Array.isArray(selectedStorageSourceOption?.previewItems) ? selectedStorageSourceOption.previewItems : []);
  React.useEffect(() => {
    if (!fridgeSourcePickerOpen) return;
    const currentTab = String(fridgeSourceTab || 'bag');
    const hasCurrentTab = fridgeSourcePickerTabs.some((tab) => tab.key === currentTab);
    setFridgeSourcePickerTab(hasCurrentTab ? currentTab : (fridgeSourcePickerTabs[0]?.key || 'bag'));
  }, [fridgeSourcePickerOpen, fridgeSourcePickerTabs, fridgeSourceTab]);
  React.useEffect(() => {
    if (!storageSourcePickerOpen) return;
    const currentTab = String(storageSourceTab || 'bag');
    const hasCurrentTab = storageSourcePickerTabs.some((tab) => tab.key === currentTab);
    setStorageSourcePickerTab(hasCurrentTab ? currentTab : (storageSourcePickerTabs[0]?.key || 'bag'));
  }, [storageSourcePickerOpen, storageSourcePickerTabs, storageSourceTab]);
  React.useEffect(() => {
    if (indoorTemperatureAnimationRef.current) {
      cancelAnimationFrame(indoorTemperatureAnimationRef.current);
      indoorTemperatureAnimationRef.current = null;
    }
    if (!Number.isFinite(targetIndoorTemperatureC)) {
      displayIndoorTemperatureRef.current = null;
      setDisplayIndoorTemperatureC(null);
      return undefined;
    }
    const startTemp = Number.isFinite(Number(displayIndoorTemperatureRef.current))
      ? Number(displayIndoorTemperatureRef.current)
      : targetIndoorTemperatureC;
    if (!shouldAnimateIndoorTemperature || Math.abs(startTemp - targetIndoorTemperatureC) < 0.05) {
      displayIndoorTemperatureRef.current = targetIndoorTemperatureC;
      setDisplayIndoorTemperatureC(targetIndoorTemperatureC);
      return undefined;
    }
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const durationMs = 15000;
    const tick = (nowRaw) => {
      const now = Number.isFinite(Number(nowRaw)) ? Number(nowRaw) : Date.now();
      const progress = Math.max(0, Math.min(1, (now - startTime) / durationMs));
      const easedProgress = 1 - Math.pow(1 - progress, 2);
      const nextTemp = startTemp + ((targetIndoorTemperatureC - startTemp) * easedProgress);
      displayIndoorTemperatureRef.current = nextTemp;
      setDisplayIndoorTemperatureC(nextTemp);
      if (progress < 1) {
        indoorTemperatureAnimationRef.current = requestAnimationFrame(tick);
      } else {
        displayIndoorTemperatureRef.current = targetIndoorTemperatureC;
        setDisplayIndoorTemperatureC(targetIndoorTemperatureC);
        indoorTemperatureAnimationRef.current = null;
      }
    };
    indoorTemperatureAnimationRef.current = requestAnimationFrame(tick);
    return () => {
      if (indoorTemperatureAnimationRef.current) {
        cancelAnimationFrame(indoorTemperatureAnimationRef.current);
        indoorTemperatureAnimationRef.current = null;
      }
    };
  }, [shouldAnimateIndoorTemperature, targetIndoorTemperatureC]);
  React.useEffect(() => {
    if (housingInteriorPendingObject?.key !== 'bed') {
      setBedPanelMode('main');
    }
  }, [housingInteriorPendingObject?.key]);
  const startCustomDayAdvance = () => {
    const days = Math.max(1, Math.min(14, Math.floor(Number(dayAdvanceDraft) || 1)));
    setDayAdvanceDraft(String(days));
    closeHousingInteriorPendingModal();
    advanceMultipleDays(days);
  };
  const farmLogAllRows = React.useMemo(() => {
    const rows = Array.isArray(game?.logs) ? game.logs : [];
    const flowTypeOf = (lineRaw = '') => {
      const line = String(lineRaw || '');
      if (/\(\+| \+|입금|판매|수익/.test(line)) return 'income';
      if (/\(-| -|출금|구매|비용|대출|수수료|노동력 -/.test(line)) return 'expense';
      return 'normal';
    };
    return rows
      .map((line, index) => {
        const text = String(line || '');
        const date = text.match(/^\[(\d{4}-\d{2}-\d{2})\]/)?.[1] || '';
        return { line: text, flowType: flowTypeOf(text), date, index };
      });
  }, [game?.logs]);
  const farmLogDateOptions = React.useMemo(() => (
    Array.from(new Set(farmLogAllRows.map((row) => row.date).filter(Boolean)))
  ), [farmLogAllRows]);
  const farmLogSelectedDateIndex = farmLogDateFilter === 'all'
    ? -1
    : farmLogDateOptions.indexOf(farmLogDateFilter);
  const gameDateFromDay = (dayRaw = 1) => {
    const date = new Date(2026, 0, Math.max(1, Math.floor(Number(dayRaw) || 1)));
    return date;
  };
  const formatCalendarDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const currentCalendarDate = gameDateFromDay(game?.day);
  const currentCalendarYear = currentCalendarDate.getFullYear();
  const currentCalendarMonth = currentCalendarDate.getMonth();
  const calendarMonthLabel = `${currentCalendarYear}년 ${currentCalendarMonth + 1}월`;
  const housingInteriorDateLabel = `${formatCalendarDateKey(currentCalendarDate)}(${['일', '월', '화', '수', '목', '금', '토'][currentCalendarDate.getDay()]})`;
  const calendarEvents = React.useMemo(() => (
    (Array.isArray(game?.calendarEvents) ? game.calendarEvents : [])
      .map((event, index) => ({
        id: String(event?.id || `calendar-event-${index}`),
        date: String(event?.date || ''),
        title: String(event?.title || '').trim(),
        note: String(event?.note || '').trim()
      }))
      .filter((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.date) && event.title)
  ), [game?.calendarEvents]);
  const calendarEventsByDate = React.useMemo(() => (
    calendarEvents.reduce((acc, event) => {
      const dateKey = String(event?.date || '');
      if (!dateKey) return acc;
      acc[dateKey] = [...(acc[dateKey] || []), event];
      return acc;
    }, {})
  ), [calendarEvents]);
  const calendarCells = React.useMemo(() => {
    const firstDate = new Date(currentCalendarYear, currentCalendarMonth, 1);
    const gridStart = new Date(currentCalendarYear, currentCalendarMonth, 1 - firstDate.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const dateKey = formatCalendarDateKey(date);
      return {
        key: dateKey,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === currentCalendarMonth,
        isToday: dateKey === formatCalendarDateKey(currentCalendarDate),
        events: calendarEventsByDate[dateKey] || []
      };
    });
  }, [calendarEventsByDate, currentCalendarDate, currentCalendarMonth, currentCalendarYear]);
  const activeCalendarDate = calendarSelectedDate || formatCalendarDateKey(currentCalendarDate);
  const activeCalendarEvents = calendarEventsByDate[activeCalendarDate] || [];
  const submitCalendarEvent = () => {
    const result = addCalendarEvent?.({
      date: activeCalendarDate,
      title: calendarTitleDraft,
      note: calendarNoteDraft
    });
    setCalendarMessage(result?.message || '');
    if (result?.ok) {
      setCalendarTitleDraft('');
      setCalendarNoteDraft('');
    }
  };
  const deleteCalendarEvent = (eventId) => {
    const result = removeCalendarEvent?.(eventId);
    setCalendarMessage(result?.message || '');
  };
  const renderFoodItemContent = (item) => (
    <>
      {item?.imageSrc ? (
        <span className="housing-interior-placeholder-item__thumb" aria-hidden="true">
          <img src={item.imageSrc} alt="" loading="lazy" />
        </span>
      ) : null}
      <div className="housing-interior-placeholder-item__meta">
        <span>{item.name}</span>
        <strong>{`${item.qty}${item.unit}`}</strong>
        {Number(item?.waterTankLiters) > 0 ? (
          <small>{`물탱크 ${Number(item.waterTankLiters).toLocaleString()}L`}</small>
        ) : null}
        {item.expiry ? (
          <small className={`housing-interior-food-expiry is-${item.expiry.tone || 'stable'}`.trim()}>
            {item.expiry.label}
          </small>
        ) : null}
      </div>
    </>
  );
  const openPlateSlotPicker = React.useCallback((slotKey) => {
    const safeSlotKey = String(slotKey || '');
    if (!safeSlotKey) return;
    setActivePlateSlotKey(safeSlotKey);
    setPlateOptionPickerSlotKey(safeSlotKey);
  }, []);
  const renderMealPlateSlot = ({
    slotKey,
    className = '',
    label,
    selected,
    clear
  }) => (
    <div
      className={`housing-interior-meal-plate-slot ${className} ${activePlateSlotKey === slotKey ? 'is-selected' : ''} ${selected ? '' : 'is-empty'}`.trim()}
      role="button"
      tabIndex={0}
      onClick={() => openPlateSlotPicker(slotKey)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPlateSlotPicker(slotKey);
        }
      }}
    >
      <small>{label}</small>
      {selected ? (
        <strong>{selected.name}</strong>
      ) : (
        <span className="housing-interior-meal-plate-slot__empty">
          <b>+</b>
          <strong>미선택</strong>
        </span>
      )}
      {selected ? (
        <div className="housing-interior-meal-plate-slot__actions">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openPlateSlotPicker(slotKey);
            }}
          >
            선택
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              clear?.();
            }}
          >
            비움
          </button>
        </div>
      ) : null}
    </div>
  );
  const runFridgeMoveAnimation = ({ id, direction = 'to-fridge', action }) => {
    if (!id || fridgeMovingItem) return;
    setFridgeMovingItem({ id, direction });
    action?.();
    if (fridgeMoveTimerRef.current) window.clearTimeout(fridgeMoveTimerRef.current);
    fridgeMoveTimerRef.current = window.setTimeout(() => {
      setFridgeMovingItem(null);
      fridgeMoveTimerRef.current = null;
    }, 90);
  };
  const fridgeMoveClassOf = (id) => {
    if (!fridgeMovingItem || String(fridgeMovingItem.id || '') !== String(id || '')) return '';
    return `is-moving ${String(fridgeMovingItem.direction || 'to-fridge') === 'to-freezer' ? 'is-moving-to-freezer' : 'is-moving-to-fridge'}`;
  };
  const renderFridgeSourceMoveButtons = ({
    moveId,
    sourceType,
    sourceKey,
    sourceName,
    itemKey,
  }) => (
    <div className="housing-interior-placeholder-move-actions">
      <button
        type="button"
        className="button button--ghost button--compact housing-interior-placeholder-move-button"
        title="냉장실로 이동"
        disabled={Boolean(fridgeMovingItem)}
        onClick={() => runFridgeMoveAnimation({
          id: moveId,
          direction: 'to-fridge',
          action: () => moveFoodItemToHousingFridge({
            sourceType,
            sourceKey,
            sourceName,
            itemKey,
            targetColdStorage: 'fridge'
          })
        })}
      >
        🧊
      </button>
      <button
        type="button"
        className="button button--ghost button--compact housing-interior-placeholder-move-button"
        title="냉동실로 이동"
        disabled={Boolean(fridgeMovingItem)}
        onClick={() => runFridgeMoveAnimation({
          id: moveId,
          direction: 'to-freezer',
          action: () => moveFoodItemToHousingFridge({
            sourceType,
            sourceKey,
            sourceName,
            itemKey,
            targetColdStorage: 'freezer'
          })
        })}
      >
        ❄️
      </button>
    </div>
  );
  const stepFarmLogDate = (delta) => {
    if (!farmLogDateOptions.length) return;
    if (farmLogDateFilter === 'all') {
      setFarmLogDateFilter(delta >= 0 ? farmLogDateOptions[0] : farmLogDateOptions[farmLogDateOptions.length - 1]);
      return;
    }
    const currentIndex = Math.max(0, farmLogSelectedDateIndex);
    const nextIndex = Math.max(0, Math.min(farmLogDateOptions.length - 1, currentIndex + delta));
    setFarmLogDateFilter(farmLogDateOptions[nextIndex] || 'all');
  };
  const farmLogRows = React.useMemo(() => (
    farmLogAllRows
      .filter((row) => {
        if (farmLogDateFilter !== 'all') return row.date === farmLogDateFilter;
        return true;
      })
      .filter((row) => {
        if (farmLogFilter === 'income') return row.flowType === 'income';
        if (farmLogFilter === 'expense') return row.flowType === 'expense';
        return true;
      })
      .slice(0, 140)
  ), [farmLogAllRows, farmLogDateFilter, farmLogFilter]);
  const clearFarmLogTypingTimer = React.useCallback(() => {
    if (farmLogTypingTimerRef.current) {
      clearTimeout(farmLogTypingTimerRef.current);
      farmLogTypingTimerRef.current = null;
    }
  }, []);
  const startFarmLogTypingRefresh = React.useCallback(() => {
    clearFarmLogTypingTimer();
    const sourceLines = farmLogRows.slice(0, 12).map((row) => String(row.line || '')).filter(Boolean);
    setFarmLogTypedLines([]);
    setFarmLogCurrentTypedLine('');
    if (!sourceLines.length) {
      setFarmLogTypingActive(false);
      setFarmLogTypingStatus('최신화할 영농일지가 없습니다.');
      return;
    }
    setFarmLogTypingActive(true);
    setFarmLogTypingStatus('영농일지 최신화 중...');
    let lineIndex = 0;
    let charIndex = 0;
    const tick = () => {
      const line = sourceLines[lineIndex] || '';
      if (charIndex <= line.length) {
        setFarmLogCurrentTypedLine(line.slice(0, charIndex));
        charIndex += line.length > 90 ? 3 : 2;
        farmLogTypingTimerRef.current = setTimeout(tick, 18);
        return;
      }
      setFarmLogTypedLines((prev) => [...prev, line]);
      setFarmLogCurrentTypedLine('');
      lineIndex += 1;
      charIndex = 0;
      if (lineIndex >= sourceLines.length) {
        farmLogTypingTimerRef.current = null;
        setFarmLogTypingActive(false);
        setFarmLogTypingStatus(`최신 기록 ${sourceLines.length}건 동기화 완료`);
        return;
      }
      farmLogTypingTimerRef.current = setTimeout(tick, 130);
    };
    farmLogTypingTimerRef.current = setTimeout(tick, 120);
  }, [clearFarmLogTypingTimer, farmLogRows]);
  React.useEffect(() => () => clearFarmLogTypingTimer(), [clearFarmLogTypingTimer]);
  React.useEffect(() => {
    if (housingInteriorPendingObject?.key !== 'farmLog') {
      clearFarmLogTypingTimer();
      setFarmLogTypingActive(false);
      setFarmLogTypingStatus('');
      setFarmLogTypedLines([]);
      setFarmLogCurrentTypedLine('');
    }
  }, [clearFarmLogTypingTimer, housingInteriorPendingObject?.key]);

  return (
    <section className={`housing-interior-overlay ${isNightPhase ? 'is-night' : ''}`.trim()} aria-label="하우징 내부 화면">
      <div className="housing-interior-panel">
        <div className={`housing-interior-panel__hero ${housingInteriorHasDedicatedImage ? 'is-interior-shot' : ''}`.trim()}>
          {housingInteriorImageSrc ? (
            <img
              src={housingInteriorImageSrc}
              alt=""
              loading="lazy"
              className={`housing-interior-panel__hero-image ${housingInteriorHasDedicatedImage ? 'is-interior-shot' : ''}`.trim()}
            />
          ) : null}
          <div className={`housing-interior-panel__hero-overlay ${housingInteriorHasDedicatedImage ? 'is-interior-shot' : ''}`.trim()}>
            <div className="housing-interior-status-stack">
                {housingLivingConditionInfo ? (
                  <div className={`housing-interior-living-panel is-${housingLivingConditionInfo.tone || 'normal'} ${livingPanelExpanded ? 'is-expanded' : ''}`.trim()} aria-label="생활여건 상태">
                    <span className="housing-interior-living-panel__label">생활여건</span>
                    <button
                      type="button"
                      className="housing-interior-living-panel__detail-button"
                      onClick={() => handleHousingInteriorObjectButtonClick('livingDetail')}
                    >
                      자세히
                    </button>
                    <strong>{housingLivingConditionInfo.label}</strong>
                    <div className="housing-interior-living-panel__meter" aria-hidden="true">
                      <span style={{ width: `${Math.max(0, Math.min(100, Number(housingLivingConditionInfo.score) || 0))}%` }} />
                    </div>
                    <div className="housing-interior-living-panel__score">
                      {`${Math.max(0, Math.min(100, Number(housingLivingConditionInfo.score) || 0))}/100`}
                    </div>
                    <small>{livingDetailText}</small>
                  </div>
                ) : null}
                {housingIndoorTemperatureInfo ? (
                  <div className="housing-interior-temperature-panel" aria-label="실내 온도">
                    <div className="housing-interior-temperature-panel__top">
                      <span className="housing-interior-temperature-panel__label">실내온도</span>
                      <button
                        type="button"
                        className="housing-interior-temperature-panel__detail-button"
                        onClick={() => setIndoorTemperatureDetailOpen(true)}
                      >
                        자세히
                      </button>
                    </div>
                    <strong>{`${Math.round(Number(shownIndoorTemperatureC) || 0)}°C`}</strong>
                    <span className="housing-interior-temperature-panel__state">{housingIndoorTemperatureInfo.label}</span>
                    <small>
                      {housingIndoorTemperatureInfo.activeHvacMode && housingIndoorTemperatureInfo.activeHvacMode !== 'off'
                        ? `${housingIndoorTemperatureInfo.activeHvacLabel} · 목표 ${housingIndoorTemperatureInfo.targetTemperatureC}°C`
                        : ((housingIndoorTemperatureInfo.appliedLabels || []).length
                            ? housingIndoorTemperatureInfo.appliedLabels.join(' / ')
                            : housingIndoorTemperatureInfo.profileLabel)}
                    </small>
                  </div>
                ) : null}
                {housingPlayerStatusInfo ? (
                  <div className="housing-interior-player-status-panel" aria-label="몸상태와 자가노동력">
                    <div className="housing-interior-player-status-panel__row">
                      <div>
                        <span>건강</span>
                        <strong>{`${Math.round(healthValue)}/100`}</strong>
                      </div>
                      <div className="housing-interior-player-status-panel__meter is-health" aria-hidden="true">
                        <span style={{ width: `${healthValue}%` }} />
                      </div>
                      <small title={healthStatus.detail}>{healthStatus.label}</small>
                    </div>
                    <div className="housing-interior-player-status-panel__row">
                      <div>
                        <span>자가노동력</span>
                        <strong>{`${laborValue.toFixed(1)}/100`}</strong>
                      </div>
                      <div className="housing-interior-player-status-panel__meter is-labor" aria-hidden="true">
                        <span style={{ width: `${laborValue}%` }} />
                      </div>
                      <small title={laborStatus.detail}>{laborStatus.label}</small>
                    </div>
                  </div>
                ) : null}
                <div className="housing-interior-date-panel" aria-label="현재 날짜">
                  <span>🍂 오늘</span>
                  <strong>{housingInteriorDateLabel}</strong>
                </div>
                {housingInteriorPowerInfo ? (
                  <div className={`housing-interior-power-panel is-${housingInteriorPowerInfo.tone || 'off'}`.trim()} aria-label="실내 전기 상태">
                    <span className="housing-interior-power-panel__label">두꺼비집(분전반)</span>
                    <button
                      type="button"
                      className="housing-interior-power-toggle"
                      aria-label={`실내 전기 ${housingInteriorPowerInfo.label}`}
                      onClick={toggleHousingInteriorPowerControl}
                      disabled={!housingInteriorPowerInfo.canToggle}
                    >
                      <span className={housingInteriorPowerInfo.label === 'ON' ? 'is-active' : ''}>ON</span>
                      <span className={housingInteriorPowerInfo.label === 'OFF' ? 'is-active' : ''}>OFF</span>
                    </button>
                  </div>
                ) : null}
              </div>
            {housingInteriorHasDedicatedImage ? null : (
              <span>내부 이미지가 준비되면 이 큰 패널 안에 바로 표시됩니다.</span>
            )}
            <div className="housing-interior-panel__object-grid">
              {HOUSING_INTERIOR_OBJECT_BUTTONS.map((item) => {
                const itemKey = String(item?.key || '');
                const disabled = (itemKey === 'bathroom' && !hasHousingBathroom)
                  || (itemKey === 'bed' && !housingInteriorHasInstalledBed)
                  || (itemKey === 'hvac' && !housingInteriorHasInstalledHvacDevice)
                  || (itemKey === 'pc' && !housingInteriorHasInstalledPc)
                  || (itemKey === 'tv' && !housingInteriorHasInstalledTv);
                const disabledTitle = itemKey === 'bathroom'
                  ? '이 하우징에는 욕실이 없습니다.'
                  : (itemKey === 'bed'
                    ? '침대 자리에 침대를 설치해야 사용할 수 있습니다.'
                    : (itemKey === 'hvac'
                      ? '에어컨, 선풍기, 난방기구 중 하나를 설치해야 사용할 수 있습니다.'
                      : (itemKey === 'pc'
                        ? 'PC 자리에 컴퓨터를 설치해야 사용할 수 있습니다.'
                        : (itemKey === 'tv' ? 'TV 자리에 TV를 설치해야 사용할 수 있습니다.' : item.hint))));
                return (
                  <button
                    key={item.key}
                    type="button"
                    data-sfx={item.key === 'door' || disabled ? 'none' : undefined}
                    className="housing-interior-panel__object-button"
                    title={disabled ? disabledTitle : item.hint}
                    onClick={() => handleHousingInteriorObjectButtonClick(item.key)}
                    disabled={disabled}
                    aria-disabled={disabled}
                  >
                    <span className="housing-interior-panel__object-icon" aria-hidden="true">{item.icon}</span>
                    <span className="housing-interior-panel__object-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {indoorTemperatureDetailOpen && housingIndoorTemperatureInfo ? (
        <>
          <div
            className="confirm-modal-backdrop confirm-modal-backdrop--soft"
            style={{ zIndex: 132 }}
            onClick={() => setIndoorTemperatureDetailOpen(false)}
          />
          <div
            className="confirm-modal confirm-modal--facility-detail confirm-modal--housing-indoor-temperature"
            style={{ zIndex: 133 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel__eyebrow">하우징 내부</div>
            <div className="confirm-modal__title">실내온도 자세히</div>
            <div className="housing-interior-living-detail-panel housing-interior-temperature-detail-panel">
              <div className="housing-interior-living-detail-summary">
                <span>현재 실내온도</span>
                <strong>{`${Math.round(Number(shownIndoorTemperatureC) || 0)}°C · ${housingIndoorTemperatureInfo.label || '-'}`}</strong>
                <small>
                  {`생활여건 ${formatLivingFactorDelta(indoorTemperatureBreakdown.total)} · 건강도/일 ${formatHealthDelta(indoorTemperatureHealthInfo.delta)}`}
                </small>
              </div>
              <div className="housing-interior-temperature-detail-context">
                {indoorTemperatureContextRows.map(([label, value]) => (
                  <div key={`indoor-temperature-context-${label}`}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="housing-interior-living-detail-grid">
                {indoorTemperatureDetailRows.map((row) => (
                  <div key={`indoor-temperature-detail-${row.key}`} className="housing-interior-living-detail-item">
                    <div className="housing-interior-living-detail-item__head">
                      <span>{row.label}</span>
                      <em className={`housing-interior-living-detail-delta ${row.isRisk ? (Number(row.delta) > 0 ? 'is-minus' : 'is-zero') : (Number(row.delta) > 0 ? 'is-plus' : Number(row.delta) < 0 ? 'is-minus' : 'is-zero')}`.trim()}>
                        {row.isRisk
                          ? `${Math.max(0, Number(row.delta) || 0).toFixed(1)}%`
                          : (row.isHealth ? formatHealthDelta(row.delta) : formatLivingFactorDelta(row.delta))}
                      </em>
                    </div>
                    <strong>{row.value}</strong>
                    <small>{row.detail}</small>
                  </div>
                ))}
              </div>
              <div className="footer-actions">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setIndoorTemperatureDetailOpen(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
      {housingInteriorPendingObject ? (
        <>
          <div
            className="confirm-modal-backdrop confirm-modal-backdrop--soft"
            style={{ zIndex: 130 }}
            onClick={closeHousingInteriorPendingModal}
          />
          <div
            className={`confirm-modal confirm-modal--facility-detail confirm-modal--housing-interior-object ${housingInteriorPendingObject.key === 'pc' ? 'confirm-modal--housing-pc' : ''}`.trim()}
            style={{ zIndex: 131 }}
            onClick={(e) => e.stopPropagation()}
          >
            {housingInteriorPendingObject.key !== 'pc' ? (
              <>
                {housingInteriorPendingObject.key !== 'livingDetail' ? (
                  <div className="panel__eyebrow">하우징 내부</div>
                ) : null}
                <div className="confirm-modal__title">
                  {housingInteriorPendingObject.key === 'bed' && bedPanelMode === 'dayAdvance'
                    ? '일차진행'
                    : housingInteriorPendingObject.key === 'bed' && bedPanelMode === 'sleepDetail'
                      ? '수면품질 자세히'
                      : housingInteriorPendingObject.label}
                </div>
              </>
            ) : null}
            <SmoothHeightPanel
              className="housing-interior-modal-body-motion"
              watchKey={`${housingInteriorPendingObject.key}:${bedPanelMode}:${kitchenTab}:${storageTab}`}
            >
              {housingInteriorPendingObject.key === 'bed' ? (
                bedPanelMode === 'dayAdvance' ? (
                  <div className="housing-interior-day-advance-view">
                  <div className="housing-interior-day-advance-panel">
                    <label htmlFor="housing-interior-day-advance-input">진행 일수</label>
                    <div className="housing-interior-day-advance-control">
                      <input
                        id="housing-interior-day-advance-input"
                        type="number"
                        min="1"
                        max="14"
                        step="1"
                        value={dayAdvanceDraft}
                        onChange={(event) => setDayAdvanceDraft(event.target.value)}
                      />
                      <span>최대 14일</span>
                      <button
                        type="button"
                        className="button button--primary button--compact"
                        onClick={startCustomDayAdvance}
                        disabled={timeTransitionModal.open}
                      >
                        진행
                      </button>
                    </div>
                  </div>
                  <div className="footer-actions">
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => setBedPanelMode('main')}
                    >
                      뒤로
                    </button>
                  </div>
                </div>
              ) : bedPanelMode === 'sleepDetail' ? (
                <div className="housing-interior-sleep-detail-panel">
                  <div className="housing-interior-living-detail-summary">
                    <span>현재 수면품질</span>
                    <strong>{`${housingSleepQualityInfo?.label || '-'} · ${Math.max(0, Math.min(100, Number(housingSleepQualityInfo?.score) || 0))}/100`}</strong>
                    <small>{housingSleepQualityInfo?.reason || '수면품질 계산 대기'}</small>
                  </div>
                  <div className="housing-interior-living-detail-grid">
                    {sleepQualityDetailRows.map((row) => (
                      <div key={`sleep-quality-detail-${row.key}`} className="housing-interior-living-detail-item">
                        <div className="housing-interior-living-detail-item__head">
                          <span>{row.label}</span>
                          <em className={`housing-interior-living-detail-delta ${Number(row.delta) > 0 ? 'is-plus' : Number(row.delta) < 0 ? 'is-minus' : 'is-zero'}`.trim()}>
                            {formatLivingFactorDelta(row.delta)}
                          </em>
                        </div>
                        <strong>{row.value}</strong>
                        <small>{row.detail}</small>
                      </div>
                    ))}
                  </div>
                  <div className="footer-actions">
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => setBedPanelMode('main')}
                    >
                      뒤로
                    </button>
                  </div>
                </div>              ) : (
                <>
                {housingSleepQualityInfo ? (
                  <div className="housing-interior-sleep-quality">
                    <div className="housing-interior-sleep-quality__head">
                      <span>현재 수면 품질</span>
                      <div className="housing-interior-sleep-quality__head-actions">
                        <strong>{housingSleepQualityInfo.label}</strong>
                        <button
                          type="button"
                          className="button button--ghost button--compact housing-interior-sleep-quality__detail-button"
                          onClick={() => setBedPanelMode('sleepDetail')}
                        >
                          자세히
                        </button>
                      </div>
                    </div>
                    <div className="housing-interior-sleep-quality__meter" aria-hidden="true">
                      <span style={{ width: `${Math.max(0, Math.min(100, Number(housingSleepQualityInfo.score) || 0))}%` }} />
                    </div>
                    <div className="housing-interior-sleep-quality__meta">
                      <span>{`${Math.max(0, Math.min(100, Number(housingSleepQualityInfo.score) || 0))}/100`}</span>
                      <span>{housingSleepQualityInfo.reason}</span>
                    </div>
                  </div>
                ) : null}
                <div className="housing-interior-bed-actions">
                  <button
                    type="button"
                    className="button button--ghost day-transition-animate-button"
                    onClick={() => {
                      closeHousingInteriorPendingModal();
                      startDayTimeTransition('night');
                    }}
                    disabled={isNightPhase || timeTransitionModal.open}
                  >
                    🌙 주간 종료
                  </button>
                  <button
                    type="button"
                    className="button button--primary day-transition-animate-button"
                    onClick={() => {
                      closeHousingInteriorPendingModal();
                      startDayTimeTransition('nextDay');
                    }}
                    disabled={timeTransitionModal.open}
                  >
                    ☀️ 다음날 진행
                  </button>
                  <button
                    type="button"
                    className="button button--ghost day-transition-animate-button"
                    onClick={() => setBedPanelMode('dayAdvance')}
                    disabled={timeTransitionModal.open}
                  >
                    일차진행
                  </button>
                </div>
                </>
              )
            ) : housingInteriorPendingObject.key === 'hvac' ? (
              <div className="housing-interior-hvac-panel">
                <div className="housing-interior-hvac-summary">
                  <div>
                    <span>현재 실내온도</span>
                    <strong>{housingIndoorTemperatureInfo ? `${Math.round(Number(shownIndoorTemperatureC) || 0)}°C` : '-'}</strong>
                  </div>
                  <div>
                    <span>목표온도</span>
                    <strong>{`${Math.round(Number(hvacSetting.targetTemperatureC) || 21)}°C`}</strong>
                  </div>
                </div>
                <div className="housing-interior-hvac-modes" role="group" aria-label="공조 모드">
                  {[
                    ['off', '꺼짐'],
                    ['heating', '난방'],
                    ['cooling', '냉방'],
                    ['auto', '자동']
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      className={`button button--ghost ${hvacSetting.mode === mode ? 'is-selected' : ''}`.trim()}
                      onClick={() => setHvacMode(mode)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="housing-interior-hvac-device-groups">
                  <div className="housing-interior-hvac-device-group">
                    <div className="housing-interior-hvac-device-group__head">
                      <strong>냉방 기구</strong>
                      <span>에어컨 · 선풍기</span>
                    </div>
                    {housingHvacCoolingDeviceRows.length ? (
                      <div className="housing-interior-hvac-device-list">
                        {housingHvacCoolingDeviceRows.map((slot) => {
                          const itemKey = String(slot?.itemKey || '');
                          const selected = selectedHvacCoolingKeys.includes(itemKey);
                          return (
                            <button
                              key={`hvac-cooling-device-${slot.key}-${itemKey}`}
                              type="button"
                              className={`housing-interior-hvac-device-card ${selected ? 'is-selected' : ''}`.trim()}
                              onClick={() => toggleHvacDevice('cooling', itemKey)}
                            >
                              {slot.imageSrc ? <img src={slot.imageSrc} alt="" loading="lazy" /> : <span className="housing-interior-hvac-device-card__icon">{slot.icon}</span>}
                              <span>
                                <strong>{slot.name || slot.label}</strong>
                                <small>{String(slot.type || '') === 'fan' ? '공기순환 냉방 보조' : '실내온도 냉각'}</small>
                              </span>
                              <em>{selected ? '선택' : '미선택'}</em>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="housing-interior-hvac-device-empty">설치된 에어컨/선풍기가 없습니다.</div>
                    )}
                  </div>
                  <div className="housing-interior-hvac-device-group">
                    <div className="housing-interior-hvac-device-group__head">
                      <strong>난방 기구</strong>
                      <span>난방기구만 사용 · 전기장판 제외</span>
                    </div>
                    {housingHvacHeatingDeviceRows.length ? (
                      <div className="housing-interior-hvac-device-list">
                        {housingHvacHeatingDeviceRows.map((slot) => {
                          const itemKey = String(slot?.itemKey || '');
                          const selected = selectedHvacHeatingKeys.includes(itemKey);
                          return (
                            <button
                              key={`hvac-heating-device-${slot.key}-${itemKey}`}
                              type="button"
                              className={`housing-interior-hvac-device-card ${selected ? 'is-selected' : ''}`.trim()}
                              onClick={() => toggleHvacDevice('heating', itemKey)}
                            >
                              {slot.imageSrc ? <img src={slot.imageSrc} alt="" loading="lazy" /> : <span className="housing-interior-hvac-device-card__icon">{slot.icon}</span>}
                              <span>
                                <strong>{slot.name || slot.label}</strong>
                                <small>실내온도 가열</small>
                              </span>
                              <em>{selected ? '선택' : '미선택'}</em>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="housing-interior-hvac-device-empty">설치된 난방기구가 없습니다.</div>
                    )}
                  </div>
                </div>
                <div className="housing-interior-hvac-target">
                  <button type="button" className="button button--ghost button--compact" onClick={() => stepHvacTarget(-1)}>-</button>
                  <span>{`${Math.round(Number(hvacSetting.targetTemperatureC) || 21)}°C`}</span>
                  <button type="button" className="button button--ghost button--compact" onClick={() => stepHvacTarget(1)}>+</button>
                </div>
                <p className="housing-interior-hvac-note">
                  냉방은 현재 온도보다 낮출 때만, 난방은 현재 온도보다 높일 때만 작동합니다. 자동은 목표온도 기준으로 선택된 기구 중 필요한 계열만 켭니다.
                </p>
              </div>
            ) : housingInteriorPendingObject.key === 'livingDetail' ? (
              <div className="housing-interior-living-detail-panel">
                <div className={`housing-interior-living-detail-summary is-${housingLivingConditionInfo?.tone || 'normal'}`.trim()}>
                  <span>현재 생활여건</span>
                  <strong>{`${housingLivingConditionInfo?.label || '-'} · ${Math.max(0, Math.min(100, Number(housingLivingConditionInfo?.score) || 0))}/100`}</strong>
                  <small>{housingLivingConditionInfo?.detail || '생활여건 상태 확인'}</small>
                </div>
                <div className="housing-interior-living-detail-grid">
                  {livingDetailScoreRows.map((row) => (
                    <div key={row.key} className="housing-interior-living-detail-item">
                      <div className="housing-interior-living-detail-item__head">
                        <span>{row.label}</span>
                        <em className={`housing-interior-living-detail-delta ${Number(row.delta) > 0 ? 'is-plus' : Number(row.delta) < 0 ? 'is-minus' : 'is-zero'}`.trim()}>
                          {formatLivingFactorDelta(row.delta)}
                        </em>
                      </div>
                      <strong>{row.value}</strong>
                      <small>{row.detail}</small>
                    </div>
                  ))}
                </div>
              </div>
            ) : housingInteriorPendingObject.key === 'bathroom' ? (
              <div className="housing-interior-bathroom-panel">
                <div className={`housing-interior-living-detail-summary is-${housingBathroomInfo?.cleanlinessTone || 'normal'}`.trim()}>
                  <span>욕실 상태</span>
                  <strong>{`${housingBathroomInfo?.tierLabel || '욕실 없음'} · 청결 ${Math.round(Number(housingBathroomInfo?.cleanliness) || 0)}/100`}</strong>
                  <small>{`현재 상태: ${housingBathroomInfo?.cleanlinessLabel || '확인 필요'}`}</small>
                </div>
                <div className="housing-interior-living-detail-grid">
                  <div className="housing-interior-living-detail-item">
                    <div className="housing-interior-living-detail-item__head">
                      <span>오늘 샤워</span>
                      <em className={`housing-interior-living-detail-delta ${housingBathroomInfo?.showeredToday ? 'is-plus' : 'is-zero'}`.trim()}>
                        {housingBathroomInfo?.showeredToday ? '완료' : '대기'}
                      </em>
                    </div>
                    <strong>{housingBathroomInfo?.showeredToday ? '씻음' : '안 함'}</strong>
                    <small>자가노동력 회복 없이 개인 청결 상태만 정리합니다.</small>
                  </div>
                  <div className="housing-interior-living-detail-item">
                    <div className="housing-interior-living-detail-item__head">
                      <span>작업 후 세척</span>
                      <em className={`housing-interior-living-detail-delta ${housingBathroomInfo?.chemicalWashedToday ? 'is-plus' : 'is-zero'}`.trim()}>
                        {housingBathroomInfo?.chemicalWashedToday ? '완료' : '대기'}
                      </em>
                    </div>
                    <strong>{housingBathroomInfo?.chemicalWashedToday ? '세척 기록 있음' : '세척 기록 없음'}</strong>
                    <small>농약 작업 후 피부와 작업복 표면 오염을 씻어낸 기록입니다.</small>
                  </div>
                  <div className="housing-interior-living-detail-item">
                    <div className="housing-interior-living-detail-item__head">
                      <span>욕실 청소</span>
                      <em className={`housing-interior-living-detail-delta ${housingBathroomInfo?.cleanedToday ? 'is-plus' : 'is-zero'}`.trim()}>
                        {housingBathroomInfo?.cleanedToday ? '오늘 완료' : '필요 시'}
                      </em>
                    </div>
                    <strong>{housingBathroomInfo?.cleanedDay ? `${housingBathroomInfo.cleanedDay}일차` : '기록 없음'}</strong>
                    <small>청소는 자가노동력 2를 소모하고 욕실 청결도를 올립니다.</small>
                  </div>
                </div>
                <div className="housing-interior-bed-actions">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={showerHousingBathroom}
                    disabled={!housingBathroomInfo?.hasBathroom || housingBathroomInfo?.showeredToday}
                  >
                    샤워하기
                  </button>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={washHousingBathroomAfterWork}
                    disabled={!housingBathroomInfo?.hasBathroom || housingBathroomInfo?.chemicalWashedToday}
                  >
                    작업 후 세척
                  </button>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={cleanHousingBathroom}
                    disabled={!housingBathroomInfo?.hasBathroom || Number(game?.labor || 0) < 2 || Number(housingBathroomInfo?.cleanliness || 0) >= 100}
                  >
                    욕실 청소
                  </button>
                </div>
                <p className="housing-interior-hvac-note">
                  욕실 행동은 자가노동력을 회복하지 않습니다. 샤워와 작업 후 세척은 위생 기록만 남기고, 청소는 욕실 청결 유지용입니다.
                </p>
              </div>
            ) : housingInteriorPendingObject.key === 'pc' ? (
              <HousingPcDesktop
                timeText={phoneTimeText}
                appContents={{
                  farmLog: (
                    <div className="housing-pc-app-view housing-pc-app-view--log">
                      <strong>영농일지</strong>
                      <span>{farmLogRows.length ? `최근 기록 ${farmLogRows.length}건` : '아직 기록된 영농일지가 없습니다.'}</span>
                      <div className="housing-pc-log-list">
                        {farmLogRows.slice(0, 7).map((row) => (
                          <div key={`housing-pc-log-${row.id}`} className={`housing-pc-log-item is-${row.flowType}`.trim()}>
                            <em>{row.date}</em>
                            <span>{row.line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                  calendar: (
                    <div className="housing-pc-app-view housing-pc-app-view--calendar">
                      <strong>{calendarMonthLabel}</strong>
                      <span>{`오늘 ${formatCalendarDateKey(currentCalendarDate)}`}</span>
                      <div className="housing-pc-calendar-grid" aria-label="PC 캘린더">
                        {calendarCells.map((cell) => (
                          <button
                            key={`housing-pc-calendar-cell-${cell.key}`}
                            type="button"
                            className={[
                              'housing-pc-calendar-cell',
                              cell.isCurrentMonth ? '' : 'is-muted',
                              cell.isToday ? 'is-today' : '',
                              cell.key === activeCalendarDate ? 'is-selected' : ''
                            ].filter(Boolean).join(' ')}
                            onClick={() => setCalendarSelectedDate(cell.key)}
                          >
                            <strong>{cell.day}</strong>
                            {cell.events.length ? <i>{cell.events.length}</i> : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                }}
                onSave={() => {
                  closeHousingInteriorPendingModal();
                  openSaveLoadFromHousing?.('save');
                }}
                onLoad={() => {
                  closeHousingInteriorPendingModal();
                  openSaveLoadFromHousing?.('load');
                }}
                onRequestMainMenu={() => {
                  closeHousingInteriorPendingModal();
                  openMainMenuFromHousing?.();
                }}
              />
            ) : housingInteriorPendingObject.key === 'calendar' ? (
              <div className="housing-interior-calendar">
                <div className="housing-interior-calendar__head">
                  <div>
                    <span>월간 캘린더</span>
                    <strong>{calendarMonthLabel}</strong>
                  </div>
                  <em>{`오늘 ${formatCalendarDateKey(currentCalendarDate)}`}</em>
                </div>
                <div className="housing-interior-calendar__weekdays" aria-hidden="true">
                  {['일', '월', '화', '수', '목', '금', '토'].map((weekday) => (
                    <span key={`housing-calendar-weekday-${weekday}`}>{weekday}</span>
                  ))}
                </div>
                <div className="housing-interior-calendar__grid">
                  {calendarCells.map((cell) => (
                    <button
                      type="button"
                      key={`housing-calendar-cell-${cell.key}`}
                      className={[
                        'housing-interior-calendar__cell',
                        cell.isCurrentMonth ? '' : 'is-muted',
                        cell.isToday ? 'is-today' : '',
                        cell.key === activeCalendarDate ? 'is-selected' : '',
                        cell.events.length ? 'has-event' : ''
                      ].filter(Boolean).join(' ')}
                      onClick={() => {
                        setCalendarSelectedDate(cell.key);
                        setCalendarMessage('');
                      }}
                    >
                      <strong>{cell.day}</strong>
                      {cell.events.length ? (
                        <div className="housing-interior-calendar__events">
                          <span>{`${cell.events.length}개`}</span>
                          <em>{cell.events[0]?.title}</em>
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
                <div className="housing-interior-calendar__editor">
                  <div className="housing-interior-calendar__selected">
                    <span>선택 날짜</span>
                    <strong>{activeCalendarDate}</strong>
                    {activeCalendarEvents.length ? <em>{`등록된 일정 ${activeCalendarEvents.length}개`}</em> : <em>등록된 일정 없음</em>}
                  </div>
                  <label>
                    <span>일정 제목</span>
                    <input
                      type="text"
                      value={calendarTitleDraft}
                      maxLength={40}
                      placeholder="예: 관수 점검, 농약 구매"
                      onChange={(event) => {
                        setCalendarTitleDraft(event.target.value);
                        if (calendarMessage) setCalendarMessage('');
                      }}
                    />
                  </label>
                  <label>
                    <span>메모</span>
                    <input
                      type="text"
                      value={calendarNoteDraft}
                      maxLength={80}
                      placeholder="선택 사항"
                      onChange={(event) => setCalendarNoteDraft(event.target.value)}
                    />
                  </label>
                  <button type="button" className="button button--primary" onClick={submitCalendarEvent}>
                    일정 등록
                  </button>
                  {calendarMessage ? <div className="housing-interior-calendar__message">{calendarMessage}</div> : null}
                  <div className="housing-interior-calendar__event-list">
                    {activeCalendarEvents.length ? activeCalendarEvents.map((event) => (
                      <article key={event.id} className="housing-interior-calendar__event-item">
                        <div>
                          <strong>{event.title}</strong>
                          {event.note ? <span>{event.note}</span> : null}
                        </div>
                        <button type="button" onClick={() => deleteCalendarEvent(event.id)}>삭제</button>
                      </article>
                    )) : (
                      <div className="housing-interior-calendar__empty">이 날짜에 등록된 일정이 없습니다.</div>
                    )}
                  </div>
                </div>
                <div className="footer-actions">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => handleHousingInteriorObjectButtonClick('pc')}
                  >
                    뒤로
                  </button>
                </div>
              </div>
            ) : housingInteriorPendingObject.key === 'farmLog' ? (
              <div className="housing-interior-farm-log">
                <div className="housing-interior-farm-log__summary">
                  <span>기록 수</span>
                  <strong>{`${(Array.isArray(game?.logs) ? game.logs : []).length}건`}</strong>
                </div>
                <div className="housing-interior-farm-log__toolbar">
                  <button
                    type="button"
                    className="button button--primary button--compact housing-interior-farm-log__refresh"
                    onClick={startFarmLogTypingRefresh}
                    disabled={farmLogTypingActive}
                  >
                    {farmLogTypingActive ? '최신화 중...' : '최신화 하기'}
                  </button>
                  {farmLogTypingStatus ? (
                    <span className="housing-interior-farm-log__status">{farmLogTypingStatus}</span>
                  ) : null}
                </div>
                <div className="housing-interior-farm-log__datebar" aria-label="영농일지 날짜 찾기">
                  <button
                    type="button"
                    className="button button--ghost button--compact"
                    onClick={() => stepFarmLogDate(1)}
                    disabled={!farmLogDateOptions.length || farmLogDateFilter === farmLogDateOptions[farmLogDateOptions.length - 1]}
                  >
                    이전 날짜
                  </button>
                  <select
                    className="text-input housing-interior-farm-log__date-select"
                    value={farmLogDateFilter}
                    onChange={(event) => setFarmLogDateFilter(event.target.value)}
                  >
                    <option value="all">전체 날짜</option>
                    {farmLogDateOptions.map((date) => (
                      <option key={`housing-farm-log-date-${date}`} value={date}>{date}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="button button--ghost button--compact"
                    onClick={() => stepFarmLogDate(-1)}
                    disabled={!farmLogDateOptions.length || farmLogDateFilter === farmLogDateOptions[0]}
                  >
                    다음 날짜
                  </button>
                  <span className="housing-interior-farm-log__date-count">
                    {farmLogDateFilter === 'all'
                      ? `전체 ${farmLogAllRows.length}건`
                      : `${farmLogDateFilter} ${farmLogAllRows.filter((row) => row.date === farmLogDateFilter).length}건`}
                  </span>
                </div>
                <div className="housing-interior-farm-log__tabs" role="tablist" aria-label="영농일지 필터">
                  {[
                    ['all', '전체'],
                    ['income', '수입'],
                    ['expense', '지출']
                  ].map(([key, label]) => (
                    <button
                      key={`housing-farm-log-filter-${key}`}
                      type="button"
                      className={`focus-tab ${farmLogFilter === key ? 'focus-tab--active' : ''}`.trim()}
                      onClick={() => setFarmLogFilter(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {(farmLogTypingActive || farmLogTypedLines.length > 0 || farmLogCurrentTypedLine) ? (
                  <div className="housing-interior-farm-log__typewriter" aria-live="polite">
                    <div className="housing-interior-farm-log__typewriter-head">
                      <span>PC 영농일지 동기화</span>
                      <i />
                    </div>
                    <div className="housing-interior-farm-log__typewriter-body">
                      {farmLogTypedLines.map((line, index) => (
                        <div key={`housing-farm-log-typed-${index}`} className="housing-interior-farm-log__typed-line">
                          {line}
                        </div>
                      ))}
                      {farmLogTypingActive || farmLogCurrentTypedLine ? (
                        <div className="housing-interior-farm-log__typed-line is-current">
                          {farmLogCurrentTypedLine}
                          <span className="housing-interior-farm-log__cursor" aria-hidden="true" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                {farmLogRows.length ? (
                  <div className="housing-interior-farm-log__list">
                    {farmLogRows.map((row) => (
                      <div
                        key={`housing-farm-log-${row.index}`}
                        className={`housing-interior-farm-log__item is-${row.flowType}`.trim()}
                      >
                        {row.line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-box">
                    {farmLogDateFilter !== 'all'
                      ? `${farmLogDateFilter}에 해당하는 ${farmLogFilter === 'all' ? '영농일지' : farmLogFilter === 'income' ? '수입' : '지출'} 기록이 없습니다.`
                      : (farmLogFilter === 'all' ? '아직 기록된 영농일지가 없습니다.' : `${farmLogFilter === 'income' ? '수입' : '지출'} 기록이 없습니다.`)}
                  </div>
                )}
              </div>
            ) : housingInteriorPendingObject.key === 'meal' ? (
              <div className="housing-interior-kitchen-panel">
                <div className="housing-interior-kitchen-topbar">
                  <div className="focus-tabs housing-interior-kitchen-tabs" role="tablist" aria-label="주방 메뉴">
                    {[
                      ['meal', '🍽️ 식사'],
                      ['prep', '♨️ 조리'],
                      ['cook', '🍳 요리']
                    ].map(([tabKey, label]) => (
                      <button
                        key={`housing-kitchen-tab-${tabKey}`}
                        type="button"
                        className={`focus-tab ${kitchenTab === tabKey ? 'focus-tab--active' : ''}`.trim()}
                        onClick={() => setKitchenTab(tabKey)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {kitchenTab === 'meal' ? (
                    <div className="housing-interior-fridge-temp-control housing-interior-meal-limit-badge" aria-label="meal limit">
                      <span>{`${housingMealInfo?.phaseLabel || '주간'} 식사`}</span>
                      <strong>{`${Math.max(0, Number(housingMealInfo?.remaining) || 0)}회 남음`}</strong>
                    </div>
                  ) : null}
                </div>
                {kitchenTab === 'meal' ? (
                  <div className="housing-interior-placeholder-grid housing-interior-placeholder-grid--single">
                    <div className="housing-interior-placeholder-card housing-interior-placeholder-card--storage-wide">
                      <div className="housing-interior-placeholder-card__title-row housing-interior-meal-title-row">
                        <strong>🍽️ 간단식사</strong>
                      </div>
                      <div className="housing-interior-placeholder-item-list">
                        {(Array.isArray(housingMealInfo?.preparedMealRows) ? housingMealInfo.preparedMealRows : []).length ? (
                          housingMealInfo.preparedMealRows.map((meal) => (
                            <div key={`housing-prepared-meal-${meal.mealKey}`} className="housing-interior-placeholder-item">
                              {meal.imageSrc ? (
                                <span className="housing-interior-placeholder-item__thumb" aria-hidden="true">
                                  <img src={meal.imageSrc} alt="" loading="lazy" />
                                </span>
                              ) : null}
                              <div className="housing-interior-placeholder-item__meta">
                                <span>{meal.name}</span>
                                <strong>{`${Math.max(0, Number(meal.count) || 0)}개`}</strong>
                              </div>
                              <button
                                type="button"
                                className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                onClick={() => eatHousingMeal?.(meal.mealKey)}
                                disabled={!canEatHousingMealNow}
                              >
                                먹기
                              </button>
                            </div>
                          ))
                        ) : (
                          <span>준비된 간단식사가 없습니다.</span>
                        )}
                      </div>
                      <small>{mealCooldownRemainingMs > 0 ? `다음 식사까지 ${mealCooldownLabel} 남음` : (housingMealInfo?.reason || '간단식사 상태 확인')}</small>
                      <div className="housing-interior-meal-plate-section">
                        <div className="housing-interior-placeholder-card__title-row housing-interior-meal-title-row">
                          <strong>🍱 한상 차려서 식사</strong>
                        </div>
                        <div className="housing-interior-meal-plate-builder">
                          <div className="housing-interior-meal-plate-slots" aria-label="한상 구성">
                            {renderMealPlateSlot({
                              slotKey: 'rice',
                              className: 'housing-interior-meal-plate-slot--rice',
                              label: '밥',
                              selected: selectedPlateRice,
                              clear: () => setSelectedPlateRiceKey('')
                            })}
                            {renderMealPlateSlot({
                              slotKey: 'main',
                              className: 'housing-interior-meal-plate-slot--main',
                              label: '메인요리',
                              selected: selectedPlateMain,
                              clear: () => setSelectedPlateMainKey('')
                            })}
                            {selectedPlateSides.map((side, index) => (
                              <React.Fragment key={`housing-meal-plate-builder-side-${index}`}>
                                {renderMealPlateSlot({
                                  slotKey: `side${index}`,
                                  className: 'housing-interior-meal-plate-slot--side',
                                  label: `반찬 ${index + 1}`,
                                  selected: side,
                                  clear: () => setPlateSideKeyAt(index, '')
                                })}
                              </React.Fragment>
                            ))}
                            {renderMealPlateSlot({
                              slotKey: 'soup',
                              className: 'housing-interior-meal-plate-slot--soup',
                              label: '국',
                              selected: selectedPlateSoup,
                              clear: () => setSelectedPlateSoupKey('')
                            })}
                            {renderMealPlateSlot({
                              slotKey: 'dessert',
                              className: 'housing-interior-meal-plate-slot--dessert',
                              label: '후식',
                              selected: selectedPlateDessert,
                              clear: () => setSelectedPlateDessertKey('')
                            })}
                          </div>
                          <button
                            type="button"
                            className="button button--primary housing-interior-meal-plate-builder__button"
                            onClick={() => plateHousingMeal?.({
                              riceKey: selectedPlateRiceKey,
                              mainKey: selectedPlateMainKey,
                              sideKeys: selectedPlateSideKeys,
                              soupKey: selectedPlateSoupKey,
                              dessertKey: selectedPlateDessertKey
                            })}
                            disabled={!plateCanCook}
                          >
                            한상 차려서 식사
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : kitchenTab === 'cook' ? (
                  <div className="housing-interior-placeholder-grid housing-interior-placeholder-grid--single">
                    <div className="housing-interior-placeholder-card housing-interior-placeholder-card--storage-wide">
                      <div className="housing-interior-placeholder-card__title-row housing-interior-meal-title-row">
                        <strong>🍳 요리</strong>
                        <small>{`${housingWaterStatusText} · 생활용수 ${housingWaterDailyLiters}L/일`}</small>
                      </div>
                      <div className="focus-tabs housing-interior-recipe-tabs" role="tablist" aria-label="요리 분류">
                        {HOUSING_KITCHEN_RECIPE_TABS.map(([tabKey, label]) => (
                          <button
                            key={`housing-recipe-tab-${tabKey}`}
                            type="button"
                            className={`focus-tab ${cookRecipeTab === tabKey ? 'focus-tab--active' : ''}`.trim()}
                            onClick={() => {
                              setCookRecipeTab(tabKey);
                              setSelectedCookRecipeKey('');
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="housing-interior-placeholder-item-list housing-interior-recipe-grid">
                        {visibleHousingRecipeRows.length ? (
                          visibleHousingRecipeRows.map((recipe) => (
                            <div
                              key={`housing-cook-recipe-${recipe.key}`}
                              className={[
                                'housing-interior-placeholder-item',
                                'housing-interior-recipe-card',
                                selectedCookRecipeKey === recipe.key ? 'is-selected' : '',
                                recipe.canCook ? '' : 'is-unavailable'
                              ].filter(Boolean).join(' ')}
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedCookRecipeKey(recipe.key)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  setSelectedCookRecipeKey(recipe.key);
                                }
                              }}
                            >
                              <div className="housing-interior-recipe-card__image" aria-hidden="true">
                                {recipe.imageSrc ? (
                                  <img src={recipe.imageSrc} alt="" loading="lazy" />
                                ) : (
                                  <span>이미지 준비중</span>
                                )}
                              </div>
                              <div className="housing-interior-placeholder-item__meta">
                                <span>{recipe.name}</span>
                              </div>
                              <button
                                type="button"
                                className="button button--ghost button--compact housing-interior-placeholder-move-button housing-interior-recipe-card__button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  cookHousingMeal?.(recipe.key);
                                }}
                                disabled={!recipe.canCook}
                              >
                                요리하기
                              </button>
                            </div>
                          ))
                        ) : (
                          <span>만들 수 있는 레시피가 없습니다.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="housing-interior-placeholder-grid housing-interior-placeholder-grid--single">
                    <div className="housing-interior-placeholder-card housing-interior-placeholder-card--storage-wide">
                      <div className="housing-interior-placeholder-card__title-row housing-interior-meal-title-row">
                        <strong>♨️ 조리</strong>
                        <small>{`${housingWaterStatusText} · 생활용수 ${housingWaterDailyLiters}L/일`}</small>
                      </div>
                      <div className="housing-interior-cooking-appliance-grid" aria-label="설치된 조리 가전">
                        {cookingApplianceRows.map((slot) => {
                          const slotKey = String(slot?.key || '');
                          const cookingTask = cookingApplianceTasksByKey?.[slotKey] || null;
                          const cookingCompleted = Boolean(cookingTask?.completed);
                          const cookingRemainingMs = cookingTask
                            ? (cookingCompleted ? 0 : Math.max(0, Math.floor(Number(cookingTask.completeAt) || 0) - mealCooldownNow))
                            : 0;
                          const cookingDurationMs = Math.max(1, Number(cookingTask?.durationMs) || 1);
                          const cookingProgressPct = cookingTask
                            ? Math.max(0, Math.min(100, ((cookingDurationMs - cookingRemainingMs) / cookingDurationMs) * 100))
                            : 0;
                          const cookingRemainingSeconds = Math.max(0, Math.ceil(cookingRemainingMs / 1000));
                          return (
                            <div
                              key={`housing-cooking-appliance-${slot.key}`}
                              className={`housing-interior-cooking-appliance-card ${slot.installed ? 'is-installed' : 'is-empty'} ${cookingTask ? 'is-cooking' : ''}`.trim()}
                              role={slot.installed && !cookingTask ? 'button' : undefined}
                              tabIndex={slot.installed && !cookingTask ? 0 : undefined}
                              onClick={() => {
                                if (!slot.installed || cookingTask) return;
                                setSelectedCookingApplianceKey(String(slot.key || ''));
                              }}
                              onKeyDown={(event) => {
                                if (!slot.installed || cookingTask) return;
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  setSelectedCookingApplianceKey(String(slot.key || ''));
                                }
                              }}
                            >
                              <div className="housing-interior-cooking-appliance-card__head">
                                <span>{slot.icon}</span>
                                <strong>{cookingCompleted ? '조리 완료' : (cookingTask ? '조리중' : cookingApplianceLabelOf(slot))}</strong>
                              </div>
                              {slot.installed ? (
                                <div className="housing-interior-cooking-appliance-card__body">
                                  {slot.imageSrc ? (
                                    <img src={slot.imageSrc} alt="" loading="lazy" />
                                  ) : null}
                                  <div>
                                    <strong>{slot.name}</strong>
                                    <span>{cookingTask ? (cookingCompleted ? cookingTask.label : `${cookingTask.label} · ${cookingRemainingSeconds}초`) : '현재 집에 설치됨'}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="housing-interior-cooking-appliance-card__empty">
                                  <strong>미설치</strong>
                                  <span>{slot.hint}</span>
                                </div>
                              )}
                              {cookingTask ? (
                                <>
                                  <div className="housing-interior-cooking-appliance-card__gauge" aria-label="조리 진행률">
                                    <span style={{ width: `${cookingCompleted ? 100 : cookingProgressPct}%` }} />
                                  </div>
                                  {cookingCompleted && String(slot?.type || '') === 'riceCooker' ? (
                                    <button
                                      type="button"
                                      className="button button--primary button--compact housing-interior-cooking-appliance-card__collect-button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        collectCompletedCookingApplianceTask(slotKey);
                                      }}
                                    >
                                      그릇에담기
                                    </button>
                                  ) : null}
                                </>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : housingInteriorPendingObject.key === 'storage' || housingInteriorPendingObject.key === 'closet' ? (
              <div className="housing-interior-storage-panel">
                {housingInteriorPendingObject.key !== 'closet' ? (
                <div className="focus-tabs housing-interior-storage-tabs" role="tablist" aria-label="적재 분류">
                  {[
                    ['warehouse', '📦 창고'],
                    ['waterSource', '💧 수원'],
                    ['boiler', '♨️ 보일러'],
                    ['appliance', '🔌 가전'],
                    ['furniture', '🪑 가구']
                  ].map(([tabKey, label]) => (
                    <button
                      key={`housing-storage-tab-${tabKey}`}
                      type="button"
                      className={`focus-tab ${storageTab === tabKey ? 'focus-tab--active' : ''}`.trim()}
                      onClick={() => changeHousingStorageTab(tabKey)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                ) : null}
                <div key={`housing-storage-tab-page-${effectiveStorageTab}`} className={`housing-interior-storage-tab-page is-${effectiveStorageTab} is-${storageTabDirection}`.trim()}>
                {effectiveStorageTab === 'warehouse' ? (
                  <div className="housing-interior-placeholder-grid housing-interior-placeholder-grid--storage">
                    <div className="housing-interior-placeholder-card housing-interior-placeholder-card--storage-wide">
                      <div className="housing-interior-placeholder-card__title-row">
                        <strong>📦 적재</strong>
                        {housingInteriorStorageInfo ? (
                          <small>
                            {`${Math.round(Number(housingInteriorStorageInfo.usedKg) || 0).toLocaleString()} / ${Math.round(Number(housingInteriorStorageInfo.capacityKg) || 0).toLocaleString()}kg`}
                          </small>
                        ) : null}
                      </div>
                      {housingInteriorStorageRows.length ? (
                        <div className="housing-interior-placeholder-source-list">
                          <div className="housing-interior-placeholder-source">
                            <div className="housing-interior-placeholder-source__head">
                              <strong>{housingInteriorStorageInfo?.facilityName || '하우징 창고'}</strong>
                              <span>하우징 고유 적재</span>
                            </div>
                            <div className="housing-interior-placeholder-item-list">
                              {housingInteriorStorageRows.map((item) => (
                                <div key={`housing-storage-source-${item.itemKey}`} className="housing-interior-placeholder-item">
                                  {renderFoodItemContent(item)}
                                  <button
                                    type="button"
                                    className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                    title={canMoveFromHousingStorageToSelectedTarget ? `${storageSourceLabel}로 이동` : '옮길 위치를 선택해야 합니다.'}
                                    disabled={!canMoveFromHousingStorageToSelectedTarget}
                                    onClick={() => moveFoodItemFromHousingStorageToInventory?.({
                                      targetType: selectedStorageTargetType,
                                      targetKey: selectedStorageTargetKey,
                                      targetName: storageSourceLabel,
                                      itemKey: item.itemKey
                                    })}
                                  >
                                    {storageSourceIcon}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span>하우징 적재에 보관품이 없습니다.</span>
                      )}
                    </div>
                    <div className="housing-interior-placeholder-card housing-interior-placeholder-card--bag">
                      <div className="housing-interior-placeholder-card__title-row">
                        <div className="housing-interior-fridge-source-heading">
                          <strong>{`${storageSourceIcon} ${storageSourceLabel}`}</strong>
                          <button
                            type="button"
                            className="button button--ghost button--compact housing-interior-fridge-source-select__button"
                            title="적재할 위치 선택"
                            onClick={() => setStorageSourcePickerOpen(true)}
                          >
                            🗂️ 선택
                          </button>
                        </div>
                      </div>
                      {storageSourceDisplayRows.length ? (
                        <div className="housing-interior-placeholder-item-list housing-interior-placeholder-item-list--bag">
                          {storageSourceDisplayRows.map((item) => {
                            const selectedKey = String(selectedStorageSourceOption?.key || 'bag');
                            const sourceType = String(selectedStorageSourceOption?.sourceType || (selectedKey === 'warehouse' ? 'warehouse' : 'carrier'));
                            const sourceKey = selectedKey === 'bag'
                              ? '__personal_carry__'
                              : String(selectedStorageSourceOption?.sourceKey || '');
                            const canMoveToStorage = Boolean(sourceType && sourceKey);
                            return (
                            <div key={`housing-storage-source-${selectedKey}-${selectedStorageSourceOption?.sourceKey || 'default'}-${item.itemKey}`} className="housing-interior-placeholder-item">
                              {renderFoodItemContent(item)}
                              <button
                                type="button"
                                className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                title={canMoveToStorage ? '적재로 이동' : '이 위치에서 옮길 수 없음'}
                                disabled={!canMoveToStorage}
                                onClick={() => moveFoodItemToHousingStorage?.({
                                  sourceType,
                                  sourceKey,
                                  sourceName: storageSourceLabel,
                                  itemKey: item.itemKey
                                })}
                              >
                                📦
                              </button>
                            </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span>{`${storageSourceLabel}에 보관품이 없습니다.`}</span>
                      )}
                    </div>
                  </div>
                ) : effectiveStorageTab === 'waterSource' ? (
                  <div className="housing-interior-placeholder-grid housing-interior-placeholder-grid--storage housing-interior-placeholder-grid--water-source">
                    <div className="housing-interior-placeholder-card housing-interior-placeholder-card--storage-wide">
                      <div className="housing-interior-placeholder-card__title-row">
                        <strong>💧 물탱크 관리</strong>
                        <small>{`${(Array.isArray(housingInteriorWaterTankSlotRows) ? housingInteriorWaterTankSlotRows : []).filter((slot) => slot.installed).length.toLocaleString()} / ${(Array.isArray(housingInteriorWaterTankSlotRows) ? housingInteriorWaterTankSlotRows : []).length.toLocaleString()}개 설치`}</small>
                      </div>
                      {housingWaterInfo ? (
                        <div className="housing-interior-placeholder-source__head">
                          <strong>{housingWaterInfo?.hasMunicipalWater ? '상수도 연결' : (housingWaterInfo?.hasTank ? '물탱크 사용' : '생활수 없음')}</strong>
                          <span>{housingWaterInfo?.displayText || '물탱크 없음'}</span>
                        </div>
                      ) : null}
                      <div className="housing-interior-water-tank-slot-grid">
                        <div className={`housing-interior-placeholder-card housing-interior-appliance-slot-card housing-interior-water-tank-slot-card housing-interior-external-water-tank-card ${housingWaterInfo?.hasExternalTank ? 'is-installed' : ''}`.trim()}>
                          <div className="housing-interior-appliance-slot-card__head">
                            <strong>🚰 외부 물탱크 사용</strong>
                            <small>{housingWaterInfo?.hasExternalTank ? '연결됨' : '미연결'}</small>
                          </div>
                          {housingWaterInfo?.hasExternalTank ? (
                            <>
                              <div className="housing-interior-appliance-slot-card__installed">
                                <span>농장 외부 물탱크</span>
                                <small>{housingWaterInfo?.externalTankDisplayText || '물량 확인 필요'}</small>
                                <small>{`생활수질 ${Math.round(Number(housingWaterInfo?.livingWaterQuality) || 0)}/100`}</small>
                              </div>
                              <div className="housing-interior-water-tank-slot-card__actions">
                                <button
                                  type="button"
                                  className="button button--ghost button--compact"
                                  title="외부 물탱크 물관리 기능 준비중"
                                  disabled
                                >
                                  물관리
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="housing-interior-appliance-slot-card__empty">
                              <span>외부 물탱크 없음</span>
                              <small>토지시설 물탱크가 있으면 생활수 보조 수원으로 사용합니다.</small>
                            </div>
                          )}
                        </div>
                        {(Array.isArray(housingInteriorWaterTankSlotRows) ? housingInteriorWaterTankSlotRows : []).length ? (
                          housingInteriorWaterTankSlotRows.map((slot) => (
                            <div
                              key={`housing-water-tank-slot-${slot.key}`}
                              className={`housing-interior-placeholder-card housing-interior-appliance-slot-card housing-interior-water-tank-slot-card ${slot.installed ? 'is-installed' : ''}`.trim()}
                            >
                              <div className="housing-interior-appliance-slot-card__head">
                                <strong>{`${slot.icon || '💧'} ${slot.label}`}</strong>
                                <small>{slot.installed ? `${Number(slot.capacityLiters || 0).toLocaleString()}L` : '비어있음'}</small>
                              </div>
                              {slot.installed ? (
                                <>
                                  <div className="housing-interior-appliance-slot-card__installed">
                                    {slot.imageSrc ? (
                                      <img src={slot.imageSrc} alt="" loading="lazy" />
                                    ) : null}
                                    <span>{slot.name}</span>
                                    <small>{`생활수질 ${Math.round(Number(slot.quality) || 0)}/100`}</small>
                                  </div>
                                  <div className="housing-interior-water-tank-slot-card__actions">
                                    <button
                                      type="button"
                                      className="button button--ghost button--compact"
                                      title="물관리 기능 준비중"
                                      disabled
                                    >
                                      물관리
                                    </button>
                                    <button
                                      type="button"
                                      className="button button--ghost button--compact"
                                      onClick={() => removeHousingWaterTankSlot?.({ slotKey: slot.key })}
                                    >
                                      설치해제
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="housing-interior-appliance-slot-card__empty">
                                  <span>설치된 물탱크 없음</span>
                                  <small>{slot.hint}</small>
                                  {housingWaterTankInstallCandidateRows.length ? (
                                    <div className="housing-interior-water-tank-slot-card__actions">
                                      {housingWaterTankInstallCandidateRows.map((item) => (
                                        <button
                                          key={`housing-water-tank-install-${slot.key}-${item.sourceType || 'housing'}-${item.sourceKey || 'self'}-${item.itemKey}`}
                                          type="button"
                                          className="button button--ghost button--compact"
                                          onClick={() => installHousingWaterTankSlot?.({
                                            slotKey: slot.key,
                                            itemKey: item.itemKey,
                                            sourceType: item.sourceType,
                                            sourceKey: item.sourceKey,
                                            sourceName: item.sourceName
                                          })}
                                        >
                                          {`${item.sourceIcon || '💧'} ${item.name} 설치`}
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <small>하우징 적재에 설치 가능한 물탱크가 없습니다.</small>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="housing-interior-placeholder-card housing-interior-appliance-slot-card housing-interior-water-tank-slot-card">
                            <div className="housing-interior-appliance-slot-card__head">
                              <strong>💧 물탱크 자리</strong>
                              <small>없음</small>
                            </div>
                            <div className="housing-interior-appliance-slot-card__empty">
                              <span>설치 공간 없음</span>
                              <small>이 하우징에는 내부 물탱크 설치 공간이 없습니다.</small>
                            </div>
                          </div>
                        )}
                      </div>
                      {housingInteriorWaterSourceRows.length ? (
                        <div className="housing-interior-placeholder-item-list housing-interior-water-source-storage-list">
                          {housingInteriorWaterSourceRows.map((item) => (
                            <div key={`housing-water-source-storage-${item.itemKey}`} className="housing-interior-placeholder-item">
                              {renderFoodItemContent(item)}
                              <button
                                type="button"
                                className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                title="개인소지품으로 이동"
                                onClick={() => moveFoodItemFromHousingStorageToInventory?.({ itemKey: item.itemKey })}
                              >
                                🎒
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : effectiveStorageTab === 'boiler' ? (
                  <div className="housing-interior-placeholder-grid housing-interior-placeholder-grid--storage housing-interior-placeholder-grid--boiler">
                    {(housingInteriorApplianceSlotRows.length ? housingInteriorApplianceSlotRows : HOUSING_APPLIANCE_SLOT_DEFS)
                      .filter((slot) => String(slot?.type || '') === 'boiler')
                      .map((slot) => (
                        <div
                          key={`housing-boiler-slot-${slot.key}`}
                          className={`housing-interior-placeholder-card housing-interior-appliance-slot-card housing-interior-boiler-slot-card ${slot.installed ? 'is-installed' : ''}`.trim()}
                          role="button"
                          tabIndex={0}
                          onClick={() => setHousingInstallSlotDetail({ slotGroup: 'appliance', slotKey: slot.key })}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setHousingInstallSlotDetail({ slotGroup: 'appliance', slotKey: slot.key });
                            }
                          }}
                        >
                          <div className="housing-interior-appliance-slot-card__head">
                            <strong>{`${slot.icon || '♨️'} ${slot.label}`}</strong>
                            <small>{slot.installed ? '설치됨' : '비어있음'}</small>
                          </div>
                          {slot.installed ? (
                            <div className="housing-interior-appliance-slot-card__installed">
                              {slot.imageSrc ? (
                                <img src={slot.imageSrc} alt="" loading="lazy" />
                              ) : null}
                              <span>{slot.name}</span>
                              <small>{slot.desc || '난방수와 온수 공급 설비'}</small>
                            </div>
                          ) : (
                            <div className="housing-interior-appliance-slot-card__empty">
                              <span>설치된 보일러 없음</span>
                              <small>{slot.hint || '보일러를 설치하면 난방수와 온수 관리에 사용할 수 있습니다.'}</small>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : effectiveStorageTab === 'appliance' ? (
                  <>
                    <div className="housing-interior-placeholder-grid housing-interior-placeholder-grid--storage housing-interior-placeholder-grid--appliance-slots">
                      {(housingInteriorApplianceSlotRows.length ? housingInteriorApplianceSlotRows : HOUSING_APPLIANCE_SLOT_DEFS).map((slot) => (
                        <div
                          key={`housing-appliance-slot-${slot.key}`}
                          className={`housing-interior-placeholder-card housing-interior-appliance-slot-card ${slot.installed ? 'is-installed' : ''}`.trim()}
                          role="button"
                          tabIndex={0}
                          onClick={() => setHousingInstallSlotDetail({ slotGroup: 'appliance', slotKey: slot.key })}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setHousingInstallSlotDetail({ slotGroup: 'appliance', slotKey: slot.key });
                            }
                          }}
                        >
                          <div className="housing-interior-appliance-slot-card__head">
                            <strong>{`${slot.icon} ${slot.label}`}</strong>
                          </div>
                          {slot.installed ? (
                            <div className="housing-interior-appliance-slot-card__installed">
                              {slot.imageSrc ? (
                                <img src={slot.imageSrc} alt="" loading="lazy" />
                              ) : null}
                              <span>{slot.name}</span>
                            </div>
                          ) : (
                            <div className="housing-interior-appliance-slot-card__empty">
                              <span>설치된 가전 없음</span>
                              <small>{slot.hint}</small>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : effectiveStorageTab === 'furniture' ? (
                  <div className="housing-interior-placeholder-grid housing-interior-placeholder-grid--storage housing-interior-placeholder-grid--furniture-slots">
                    {(housingInteriorFurnitureSlotRows.length ? housingInteriorFurnitureSlotRows : HOUSING_FURNITURE_SLOT_DEFS).map((slot) => (
                      <div
                        key={`housing-furniture-slot-${slot.key}`}
                        className={`housing-interior-placeholder-card housing-interior-appliance-slot-card housing-interior-furniture-slot-card ${slot.installed ? 'is-installed' : ''}`.trim()}
                        role="button"
                        tabIndex={0}
                        onClick={() => setHousingInstallSlotDetail({ slotGroup: 'furniture', slotKey: slot.key })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setHousingInstallSlotDetail({ slotGroup: 'furniture', slotKey: slot.key });
                          }
                        }}
                      >
                        <div className="housing-interior-appliance-slot-card__head">
                          <strong>{`${slot.icon} ${slot.label}`}</strong>
                        </div>
                        {slot.installed ? (
                          <div className="housing-interior-appliance-slot-card__installed">
                            {slot.imageSrc ? (
                              <img src={slot.imageSrc} alt="" loading="lazy" />
                            ) : null}
                            <span>{slot.name}</span>
                          </div>
                        ) : (
                          <div className="housing-interior-appliance-slot-card__empty">
                            <span>설치된 가구 없음</span>
                            <small>{slot.hint}</small>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="housing-interior-clothing-panel">
                    <div className="housing-interior-placeholder-grid housing-interior-placeholder-grid--storage housing-interior-placeholder-grid--clothing-slots">
                      {(housingInteriorClothingSlotRows.length ? housingInteriorClothingSlotRows : HOUSING_CLOTHING_SLOT_DEFS).map((slot) => (
                        <div
                          key={`housing-clothing-slot-${slot.key}`}
                          className={`housing-interior-placeholder-card housing-interior-appliance-slot-card housing-interior-clothing-slot-card ${slot.installed ? 'is-installed' : ''}`.trim()}
                          role="button"
                          tabIndex={0}
                          onClick={() => setHousingInstallSlotDetail({ slotGroup: 'clothing', slotKey: slot.key })}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setHousingInstallSlotDetail({ slotGroup: 'clothing', slotKey: slot.key });
                            }
                          }}
                        >
                          <div className="housing-interior-appliance-slot-card__head">
                            <strong>{`${slot.icon} ${slot.label}`}</strong>
                          </div>
                          {slot.installed ? (
                            <div className="housing-interior-appliance-slot-card__installed">
                              {slot.imageSrc ? (
                                <img src={slot.imageSrc} alt="" loading="lazy" />
                              ) : null}
                              <span>{slot.name}</span>
                            </div>
                          ) : (
                            <div className="housing-interior-appliance-slot-card__empty">
                              <span>착용한 항목 없음</span>
                              <small>{slot.hint}</small>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="housing-interior-clothing-storage-layout">
                      <div className="housing-interior-placeholder-card housing-interior-clothing-storage-card">
                        <div className="housing-interior-placeholder-card__title-row">
                          <strong>🧥 옷장 보관함</strong>
                          <small>{`${housingInteriorClothingStorageRows.length.toLocaleString()}종`}</small>
                        </div>
                        {housingInteriorClothingStorageRows.length ? (
                          <div className="housing-interior-placeholder-item-list housing-interior-placeholder-item-list--bag">
                            {housingInteriorClothingStorageRows.map((item) => (
                              <div key={`housing-clothing-wardrobe-${item.itemKey}`} className="housing-interior-placeholder-item">
                                {renderFoodItemContent(item)}
                                <div className="housing-interior-placeholder-move-actions">
                                  <button
                                    type="button"
                                    className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                    disabled={!item.slotKey}
                                    title={item.slotLabel ? `${item.slotLabel}에 착용` : '맞는 착용 부위 없음'}
                                    onClick={() => item.slotKey && installHousingSlotItem?.({
                                      slotGroup: 'clothing',
                                      slotKey: item.slotKey,
                                      sourceType: 'wardrobe',
                                      sourceKey: 'wardrobe',
                                      itemKey: item.itemKey
                                    })}
                                  >
                                    착용
                                  </button>
                                  <button
                                    type="button"
                                    className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                    title="개인소지품으로 꺼내기"
                                    onClick={() => moveClothingItemFromHousingWardrobe?.({ itemKey: item.itemKey })}
                                  >
                                    🎒
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>옷장에 보관된 복장이 없습니다.</span>
                        )}
                      </div>
                      <div className="housing-interior-placeholder-card housing-interior-clothing-storage-card">
                        <div className="housing-interior-placeholder-card__title-row">
                          <strong>🧳 개인소지품 복장</strong>
                          <small>{`${housingInteriorBagClothingRows.length.toLocaleString()}종`}</small>
                        </div>
                        {housingInteriorBagClothingRows.length ? (
                          <div className="housing-interior-placeholder-item-list housing-interior-placeholder-item-list--bag">
                            {housingInteriorBagClothingRows.map((item) => (
                              <div key={`housing-clothing-bag-${item.itemKey}`} className="housing-interior-placeholder-item">
                                {renderFoodItemContent(item)}
                                <div className="housing-interior-placeholder-move-actions">
                                  <button
                                    type="button"
                                    className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                    disabled={!item.slotKey}
                                    title={item.slotLabel ? `${item.slotLabel}에 착용` : '맞는 착용 부위 없음'}
                                    onClick={() => item.slotKey && installHousingSlotItem?.({
                                      slotGroup: 'clothing',
                                      slotKey: item.slotKey,
                                      sourceType: 'personalClothing',
                                      sourceKey: 'personal',
                                      itemKey: item.itemKey
                                    })}
                                  >
                                    선택
                                  </button>
                                  <button
                                    type="button"
                                    className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                    title="옷장에 넣기"
                                    onClick={() => moveClothingItemToHousingWardrobe?.({ itemKey: item.itemKey })}
                                  >
                                    옷장
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>개인소지품에 보관할 복장이 없습니다.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            ) : housingInteriorPendingObject.key === 'fridge' ? (
              <SmoothHeightPanel className="housing-interior-fridge-motion">
              <div className={`housing-interior-placeholder-grid housing-interior-placeholder-grid--fridge ${housingInteriorPowerInfo?.label === 'OFF' ? 'is-power-off' : ''}`.trim()}>
                <div className="housing-interior-placeholder-card housing-interior-placeholder-card--cold-storage housing-interior-placeholder-card--fridge-storage">
                  <div className="housing-interior-cold-storage-head">
                    <strong>🧊 냉장실</strong>
                    <div className="housing-interior-fridge-temp-control" aria-label="fridge temperature setting">
                      <span>설정 온도</span>
                      <strong>{`${fridgeTempC}°C`}</strong>
                      <button
                        type="button"
                        className="button button--ghost button--compact housing-interior-fridge-temp-open-button"
                        onClick={() => setFridgeTempModalKey('fridgeTempC')}
                      >
                        온도설정
                      </button>
                    </div>
                    <small className="housing-interior-cold-storage-capacity">
                      {`적재 ${coldStorageCapacityTextOf('fridge')}`}
                    </small>
                  </div>
                  {housingInteriorFridgeStoredRows.length ? (
                    <div className="housing-interior-placeholder-item-list">
                      {housingInteriorFridgeStoredRows.map((item) => {
                        const moveId = `fridge:${item.itemKey}`;
                        return (
                          <div key={`housing-fridge-${item.itemKey}`} className={`housing-interior-placeholder-item ${fridgeMoveClassOf(moveId)}`.trim()}>
                            {renderFoodItemContent({
                              ...item,
                              expiry: housingFoodExpiryByColdStorage.fridge?.[item.itemKey] || null
                            })}
                            <div className="housing-interior-placeholder-move-actions">
                              <button
                                type="button"
                                className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                title={selectedColdStorageMoveTarget?.title || '이동할 보관처 없음'}
                                disabled={Boolean(fridgeMovingItem) || !selectedColdStorageMoveTarget}
                                onClick={() => runFridgeMoveAnimation({
                                  id: moveId,
                                  direction: 'to-fridge',
                                  action: () => moveFoodItemFromHousingColdStorage?.({
                                    from: 'fridge',
                                    targetType: selectedColdStorageMoveTarget?.targetType,
                                    targetKey: selectedColdStorageMoveTarget?.targetKey,
                                    targetName: selectedColdStorageMoveTarget?.targetName,
                                    itemKey: item.itemKey
                                  })
                                })}
                              >
                                {selectedColdStorageMoveTarget?.icon || '↩'}
                              </button>
                              <button
                                type="button"
                                className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                title="냉동실로 이동"
                                disabled={Boolean(fridgeMovingItem)}
                                onClick={() => runFridgeMoveAnimation({
                                  id: moveId,
                                  direction: 'to-freezer',
                                  action: () => moveFoodItemBetweenHousingColdStorage?.({
                                    from: 'fridge',
                                    to: 'freezer',
                                    itemKey: item.itemKey
                                  })
                                })}
                              >
                                ❄️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span>보관된 식료품 없음</span>
                  )}
                </div>
                <div className="housing-interior-placeholder-card housing-interior-placeholder-card--cold-storage housing-interior-placeholder-card--freezer-storage">
                  <div className="housing-interior-cold-storage-head">
                    <strong>❄️ 냉동실</strong>
                    <div className="housing-interior-fridge-temp-control" aria-label="freezer temperature setting">
                      <span>설정 온도</span>
                      <strong>{`${freezerTempC}°C`}</strong>
                      <button
                        type="button"
                        className="button button--ghost button--compact housing-interior-fridge-temp-open-button"
                        onClick={() => setFridgeTempModalKey('freezerTempC')}
                      >
                        온도설정
                      </button>
                    </div>
                    <small className="housing-interior-cold-storage-capacity">
                      {`적재 ${coldStorageCapacityTextOf('freezer')}`}
                    </small>
                  </div>
                  {housingInteriorFreezerStoredRows.length ? (
                    <div className="housing-interior-placeholder-item-list">
                      {housingInteriorFreezerStoredRows.map((item) => {
                        const moveId = `freezer:${item.itemKey}`;
                        return (
                          <div key={`housing-freezer-${item.itemKey}`} className={`housing-interior-placeholder-item ${fridgeMoveClassOf(moveId)}`.trim()}>
                            {renderFoodItemContent({
                              ...item,
                              expiry: housingFoodExpiryByColdStorage.freezer?.[item.itemKey] || null
                            })}
                            <div className="housing-interior-placeholder-move-actions">
                              <button
                                type="button"
                                className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                title={selectedColdStorageMoveTarget?.title || '이동할 보관처 없음'}
                                disabled={Boolean(fridgeMovingItem) || !selectedColdStorageMoveTarget}
                                onClick={() => runFridgeMoveAnimation({
                                  id: moveId,
                                  direction: 'to-fridge',
                                  action: () => moveFoodItemFromHousingColdStorage?.({
                                    from: 'freezer',
                                    targetType: selectedColdStorageMoveTarget?.targetType,
                                    targetKey: selectedColdStorageMoveTarget?.targetKey,
                                    targetName: selectedColdStorageMoveTarget?.targetName,
                                    itemKey: item.itemKey
                                  })
                                })}
                              >
                                {selectedColdStorageMoveTarget?.icon || '↩'}
                              </button>
                              <button
                                type="button"
                                className="button button--ghost button--compact housing-interior-placeholder-move-button"
                                title="냉장실로 이동"
                                disabled={Boolean(fridgeMovingItem)}
                                onClick={() => runFridgeMoveAnimation({
                                  id: moveId,
                                  direction: 'to-fridge',
                                  action: () => moveFoodItemBetweenHousingColdStorage?.({
                                    from: 'freezer',
                                    to: 'fridge',
                                    itemKey: item.itemKey
                                  })
                                })}
                              >
                                🧊
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span>보관된 식료품 없음</span>
                  )}
                </div>
                <div className="housing-interior-placeholder-card housing-interior-placeholder-card--bag housing-interior-placeholder-card--fridge-source">
                  <div className="housing-interior-placeholder-card__title-row">
                    <div className="housing-interior-fridge-source-heading">
                      <strong>🧺 {fridgeSourceLabel}</strong>
                      <button
                        type="button"
                        className="button button--ghost button--compact housing-interior-fridge-source-select__button"
                        title="옮길 위치 선택"
                        onClick={() => setFridgeSourcePickerOpen(true)}
                      >
                        🗂️ 선택
                      </button>
                    </div>
                  </div>
                  {fridgeSourceTab === 'bag' ? (
                    housingInteriorBagFoodRows.length ? (
                      <div className="housing-interior-placeholder-item-list housing-interior-placeholder-item-list--bag">
                        {housingInteriorBagFoodRows.map((item) => {
                          const moveId = `bag:${item.itemKey}`;
                          return (
                            <div key={`housing-fridge-bag-${item.itemKey}`} className={`housing-interior-placeholder-item ${fridgeMoveClassOf(moveId)}`.trim()}>
                              {renderFoodItemContent(item)}
                              {renderFridgeSourceMoveButtons({
                                moveId,
                                sourceType: 'carrier',
                                sourceKey: '__personal_carry__',
                                sourceName: '개인소지품',
                                itemKey: item.itemKey
                              })}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span>개인소지품에 식료품 없음</span>
                    )
                  ) : fridgeSourceTab === 'vehicle' ? (
                    housingInteriorVehicleFoodSourceRows.length ? (
                      <div className="housing-interior-placeholder-source-list housing-interior-placeholder-source-list--vehicle">
                        {selectedFridgeVehicleSource ? (
                          <div key={`housing-fridge-vehicle-${selectedFridgeVehicleSource.sourceKey}`} className="housing-interior-placeholder-source">
                            <div className="housing-interior-placeholder-source__head">
                              <strong>{selectedFridgeVehicleSource.sourceName}</strong>
                              <span>{selectedFridgeVehicleSource.sourceDetail}</span>
                            </div>
                            <div className="housing-interior-placeholder-item-list housing-interior-placeholder-item-list--bag">
                              {selectedFridgeVehicleSource.items.length ? selectedFridgeVehicleSource.items.map((item) => {
                                const moveId = `vehicle:${selectedFridgeVehicleSource.sourceKey}:${item.itemKey}`;
                                return (
                                  <div key={`housing-fridge-vehicle-${selectedFridgeVehicleSource.sourceKey}-${item.itemKey}`} className={`housing-interior-placeholder-item ${fridgeMoveClassOf(moveId)}`.trim()}>
                                    {renderFoodItemContent(item)}
                                    {renderFridgeSourceMoveButtons({
                                      moveId,
                                      sourceType: selectedFridgeVehicleSource.sourceType,
                                      sourceKey: selectedFridgeVehicleSource.sourceKey,
                                      sourceName: selectedFridgeVehicleSource.sourceName,
                                      itemKey: item.itemKey
                                    })}
                                  </div>
                                );
                              }) : (
                                <span>선택한 차량에 식료품 없음</span>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <span>현재 토지 차량에 식료품 없음</span>
                    )
                  ) : fridgeSourceTab === 'housingStorage' ? (
                    <div className="housing-interior-placeholder-source-list housing-interior-placeholder-source-list--housing-storage">
                      <div className="housing-interior-placeholder-source">
                        <div className="housing-interior-placeholder-source__head">
                          <strong>{housingInteriorStorageInfo?.facilityName || '하우징 창고'}</strong>
                          <span>{housingInteriorHousingStorageFoodRows.length ? `하우징 적재공간 · 식료품 ${housingInteriorHousingStorageFoodRows.length}종` : '하우징 적재공간 · 식료품 없음'}</span>
                        </div>
                        {housingInteriorHousingStorageFoodRows.length ? (
                          <div className="housing-interior-placeholder-item-list housing-interior-placeholder-item-list--bag">
                            {housingInteriorHousingStorageFoodRows.map((item) => {
                              const moveId = `housing-storage:${item.itemKey}`;
                              return (
                                <div key={`housing-fridge-housing-storage-${item.itemKey}`} className={`housing-interior-placeholder-item ${fridgeMoveClassOf(moveId)}`.trim()}>
                                  {renderFoodItemContent(item)}
                                  {renderFridgeSourceMoveButtons({
                                    moveId,
                                    sourceType: 'warehouse',
                                    sourceKey: housingInteriorStorageInfo?.facilityKey,
                                    sourceName: housingInteriorStorageInfo?.facilityName || '하우징 창고',
                                    itemKey: item.itemKey
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span>하우징 창고에 식료품 없음</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    housingInteriorWarehouseFoodSourceRows.length ? (
                      <div className="housing-interior-placeholder-source-list housing-interior-placeholder-source-list--warehouse">
                        {selectedFridgeWarehouseSource ? (
                          <div key={`housing-fridge-warehouse-${selectedFridgeWarehouseSource.sourceKey}`} className="housing-interior-placeholder-source">
                            <div className="housing-interior-placeholder-source__head">
                              <strong>{selectedFridgeWarehouseSource.sourceName}</strong>
                              <span>{selectedFridgeWarehouseSource.sourceDetail}</span>
                            </div>
                            {selectedFridgeWarehouseSource.items.length ? (
                              <div className="housing-interior-placeholder-item-list housing-interior-placeholder-item-list--bag">
                                {selectedFridgeWarehouseSource.items.map((item) => {
                                  const moveId = `warehouse:${selectedFridgeWarehouseSource.sourceKey}:${item.itemKey}`;
                                  return (
                                    <div key={`housing-fridge-warehouse-${selectedFridgeWarehouseSource.sourceKey}-${item.itemKey}`} className={`housing-interior-placeholder-item ${fridgeMoveClassOf(moveId)}`.trim()}>
                                      {renderFoodItemContent(item)}
                                      {renderFridgeSourceMoveButtons({
                                        moveId,
                                        sourceType: selectedFridgeWarehouseSource.sourceType,
                                        sourceKey: selectedFridgeWarehouseSource.sourceKey,
                                        sourceName: selectedFridgeWarehouseSource.sourceName,
                                        itemKey: item.itemKey
                                      })}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span>선택한 창고에 식료품 없음</span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <span>현재 토지에 선택 가능한 창고 없음</span>
                    )
                  )}
                </div>
              </div>
              </SmoothHeightPanel>
            ) : (
              <div className="confirm-modal__desc">
                {isHousingInteriorWindowPreviewOpen
                  ? `현재 날씨: ${String(game?.weather || '정보 없음')}`
                  : '준비중'}
              </div>
            )}
            {isHousingInteriorWindowPreviewOpen && weatherSceneImage ? (
              <div className="housing-interior-window-preview">
                <img src={weatherSceneImage} alt={String(game?.weather || '현재 날씨')} loading="lazy" />
              </div>
            ) : null}
            </SmoothHeightPanel>
            {!['bed', 'pc'].includes(housingInteriorPendingObject.key) ? (
              <div className="footer-actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={closeHousingInteriorPendingModal}
                >
                  확인
                </button>
              </div>
            ) : null}
          </div>
          {selectedInstallSlot ? (
            <>
              <div
                className="confirm-modal-backdrop confirm-modal-backdrop--soft"
                style={{ zIndex: 132 }}
                onClick={() => setHousingInstallSlotDetail(null)}
              />
              <div
                className="confirm-modal confirm-modal--housing-slot-detail"
                style={{ zIndex: 133 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="panel__eyebrow">
                  {housingInstallSlotDetail?.slotGroup === 'furniture'
                    ? '가구 자리'
                    : (housingInstallSlotDetail?.slotGroup === 'clothing' ? '복장 자리' : '가전 자리')}
                </div>
                <div className="confirm-modal__title">
                  {selectedInstallSlot.installed
                    ? `${selectedInstallSlot.icon} ${selectedInstallSlot.label} 상세`
                    : `${selectedInstallSlot.icon} ${selectedInstallSlot.label} 가져올 위치 선택`}
                </div>
                {selectedInstallSlot.installed ? (
                  <div className="housing-slot-detail-current-card">
                    {selectedInstallSlot.imageSrc ? <img src={selectedInstallSlot.imageSrc} alt="" loading="lazy" /> : null}
                    <div>
                      <strong>{selectedInstallSlot.name}</strong>
                      <span>{selectedInstallSlot.desc || selectedInstallSlot.hint}</span>
                    </div>
                  </div>
                ) : null}
                {selectedInstallSlot.installed ? (
                  <div className="housing-slot-detail-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={() => {
                        if (housingInstallSlotDetail?.slotGroup === 'clothing') {
                          moveHousingSlotItemToTarget?.({
                            slotGroup: 'clothing',
                            slotKey: selectedInstallSlot.key,
                            targetType: 'carrier',
                            targetKey: ''
                          });
                          setHousingInstallSlotDetail(null);
                          return;
                        }
                        setHousingInstallRemovePickerOpen(true);
                      }}
                    >
                      {housingInstallSlotDetail?.slotGroup === 'clothing' ? '벗기' : '🧰 설치제거'}
                    </button>
                  </div>
                ) : null}
                <div className="housing-install-slot-source-panel housing-install-slot-source-panel--modal">
                  <div className="housing-install-slot-source-panel__head">
                    <strong>
                      {selectedInstallSlot.installed
                        ? '교체 가능한 물품'
                        : (housingInstallSourcePickerKey
                            ? (housingInstallSlotDetail?.slotGroup === 'clothing' ? '착용할 복장 선택' : '설치할 물품 선택')
                            : (housingInstallSlotDetail?.slotGroup === 'clothing' ? '옷장 위치 선택' : '가져올 위치 선택'))}
                    </strong>
                    {!selectedInstallSlot.installed && housingInstallSourcePickerKey ? (
                      <button
                        type="button"
                        className="button button--ghost housing-install-slot-source-panel__back"
                        onClick={() => setHousingInstallSourcePickerKey('')}
                      >
                        ← 위치
                      </button>
                    ) : null}
                  </div>
                  {!selectedInstallSlot.installed && !housingInstallSourcePickerKey && selectedInstallSlotSourceLocationRows.length ? (
                    <div className="housing-install-slot-location-list housing-install-slot-source-list--modal">
                      {selectedInstallSlotSourceLocationRows.map((source) => (
                        <button
                          key={`housing-install-location-${source.key}`}
                          type="button"
                          className="housing-slot-place-picker-option housing-install-slot-location-item"
                          onClick={() => setHousingInstallSourcePickerKey(source.key)}
                        >
                          {source.sourceImageSrc ? <img src={source.sourceImageSrc} alt="" loading="lazy" /> : <span className="housing-slot-place-picker-option__icon">{source.sourceIcon || '📦'}</span>}
                          <span>
                            <strong>{source.sourceName}</strong>
                            <small>{`${source.sourceDetail || '보관 위치'} · 설치 가능 ${Math.max(0, Number(source.itemCount) || 0).toLocaleString()}개`}</small>
                          </span>
                          <em>선택</em>
                          {source.previewItems.length ? (
                            <div className="housing-install-slot-location-preview" aria-hidden="true">
                              {source.previewItems.map((imageSrc, previewIndex) => (
                                <img key={`housing-install-location-preview-${source.key}-${previewIndex}`} src={imageSrc} alt="" loading="lazy" />
                              ))}
                            </div>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : selectedInstallSlotSourceRowsByPicker.length ? (
                    <div className="housing-install-slot-source-list housing-install-slot-source-list--modal">
                      {selectedInstallSlotSourceRowsByPicker.map((item) => (
                        <button
                          key={`housing-install-source-modal-${item.sourceType}-${item.sourceKey}-${item.itemKey}`}
                          type="button"
                          className="housing-install-slot-source-item"
                          onClick={() => {
                            installHousingSlotItem?.({
                              slotGroup: housingInstallSlotDetail?.slotGroup,
                              slotKey: selectedInstallSlot.key,
                              sourceType: item.sourceType,
                              sourceKey: item.sourceKey,
                              itemKey: item.itemKey
                            });
                            setHousingInstallSlotDetail(null);
                          }}
                        >
                          {item.imageSrc ? <img src={item.imageSrc} alt="" loading="lazy" /> : null}
                          <span>
                            <strong>{item.name}</strong>
                            <small>{`${item.sourceName || '보관처'} · ${Math.max(0, Number(item.qty) || 0).toLocaleString()}${item.unit || ''}`}</small>
                          </span>
                          <em>{housingInstallSlotDetail?.slotGroup === 'clothing' ? '착용' : (selectedInstallSlot.installed ? '교체' : '설치')}</em>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span>{housingInstallSlotDetail?.slotGroup === 'clothing'
                      ? '옷장에 같은 부위에 착용할 수 있는 복장이 없습니다.'
                      : (housingInstallSourcePickerKey ? '선택한 위치에 설치할 수 있는 물품이 없습니다.' : '현재 농장에 같은 자리에 설치할 수 있는 물품이 없습니다.')}</span>
                  )}
                </div>
                <div className="footer-actions">
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => setHousingInstallSlotDetail(null)}
                  >
                    닫기
                  </button>
                </div>
              </div>
              {housingInstallRemovePickerOpen ? (
                <>
                  <div
                    className="confirm-modal-backdrop confirm-modal-backdrop--soft"
                    style={{ zIndex: 134 }}
                    onClick={() => setHousingInstallRemovePickerOpen(false)}
                  />
                  <div
                    className="confirm-modal confirm-modal--housing-slot-place-picker"
                    style={{ zIndex: 135 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="panel__eyebrow">설치 제거</div>
                    <div className="confirm-modal__title">어디에 놓을지 선택</div>
                    {selectedInstallSlotDestinationRows.length ? (
                      <div className="housing-slot-place-picker-list">
                        {selectedInstallSlotDestinationRows.map((row) => (
                          <button
                            key={`housing-slot-place-${row.targetType}-${row.targetKey}`}
                            type="button"
                            className="housing-slot-place-picker-option"
                            onClick={() => {
                              moveHousingSlotItemToTarget?.({
                                slotGroup: housingInstallSlotDetail?.slotGroup,
                                slotKey: selectedInstallSlot.key,
                                targetType: row.targetType,
                                targetKey: row.targetKey
                              });
                              setHousingInstallRemovePickerOpen(false);
                              setHousingInstallSlotDetail(null);
                            }}
                          >
                            {row.imageSrc ? <img src={row.imageSrc} alt="" loading="lazy" /> : <span className="housing-slot-place-picker-option__icon">{row.icon || '📦'}</span>}
                            <span>
                              <strong>{row.label}</strong>
                              <small>{row.detail}</small>
                            </span>
                            <em>놓기</em>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="housing-slot-place-picker-empty">놓을 수 있는 위치가 없습니다.</span>
                    )}
                    <div className="footer-actions">
                      <button
                        type="button"
                        className="button button--primary"
                        onClick={() => setHousingInstallRemovePickerOpen(false)}
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </>
          ) : null}
          {storageSourcePickerOpen ? (
            <>
              <div
                className="confirm-modal-backdrop confirm-modal-backdrop--soft"
                style={{ zIndex: 132 }}
                onClick={() => setStorageSourcePickerOpen(false)}
              />
              <div
                className="confirm-modal confirm-modal--fridge-source-picker"
                style={{ zIndex: 133 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="panel__eyebrow">적재 위치</div>
                <div className="confirm-modal__title">적재할 위치 선택</div>
                {storageSourcePickerTabs.length ? (
                  <div className="focus-tabs housing-interior-fridge-source-picker__tabs" role="tablist" aria-label="적재 위치 종류">
                    {storageSourcePickerTabs.map((tab) => (
                      <button
                        key={`housing-storage-source-picker-tab-${tab.key}`}
                        type="button"
                        className={`focus-tab ${storageSourcePickerTab === tab.key ? 'is-active' : ''}`.trim()}
                        onClick={() => setStorageSourcePickerTab(tab.key)}
                      >
                        <span className="focus-tab__label">{tab.label}</span>
                        <span className="focus-tab__count">{tab.count}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="housing-interior-fridge-source-picker">
                  {visibleStorageSourcePickerOptions.length ? visibleStorageSourcePickerOptions.map((option) => {
                    const optionKey = String(option?.key || 'bag');
                    const sourceKey = String(option?.sourceKey || '');
                    const sourceImageSrc = String(option?.sourceImageSrc || '');
                    const previewItems = Array.isArray(option?.previewItems) ? option.previewItems : [];
                    const previewImageItems = previewItems.filter((item) => item?.imageSrc).slice(0, 4);
                    const extraPreviewCount = Math.max(0, previewItems.length - previewImageItems.length);
                    const selected = storageSourceTab === optionKey
                      && (optionKey === 'bag' || sourceKey === String(storageSourceKey || ''));
                    return (
                      <button
                        key={`housing-storage-source-picker-${optionKey}-${sourceKey || 'default'}`}
                        type="button"
                        className={`housing-interior-fridge-source-picker__option ${selected ? 'is-selected' : ''}`.trim()}
                        onClick={() => {
                          setStorageSourceTab(optionKey);
                          setStorageSourceKey(optionKey === 'bag' ? '' : sourceKey);
                          setStorageSourcePickerOpen(false);
                        }}
                      >
                        {sourceImageSrc ? (
                          <span className="housing-interior-fridge-source-picker__source-image" aria-hidden="true">
                            <img src={sourceImageSrc} alt="" loading="lazy" />
                          </span>
                        ) : null}
                        <div className="housing-interior-fridge-source-picker__option-text">
                          <strong>{option.label}</strong>
                          <span>{option.detail}</span>
                        </div>
                        {previewImageItems.length ? (
                          <div className="housing-interior-fridge-source-picker__preview" aria-hidden="true">
                            {previewImageItems.map((item, index) => (
                              <span key={`housing-storage-source-preview-${optionKey}-${sourceKey || 'default'}-${item.itemKey || index}`}>
                                <img src={item.imageSrc} alt="" loading="lazy" />
                              </span>
                            ))}
                            {extraPreviewCount > 0 ? (
                              <em>{`+${extraPreviewCount}`}</em>
                            ) : null}
                          </div>
                        ) : null}
                      </button>
                    );
                  }) : (
                    <div className="housing-interior-fridge-source-picker__empty">이 위치 종류에 선택 가능한 항목이 없습니다.</div>
                  )}
                </div>
                <div className="footer-actions">
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => setStorageSourcePickerOpen(false)}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </>
          ) : null}
          {fridgeSourcePickerOpen ? (
            <>
              <div
                className="confirm-modal-backdrop confirm-modal-backdrop--soft"
                style={{ zIndex: 132 }}
                onClick={() => setFridgeSourcePickerOpen(false)}
              />
              <div
                className="confirm-modal confirm-modal--fridge-source-picker"
                style={{ zIndex: 133 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="panel__eyebrow">식료품 위치</div>
                <div className="confirm-modal__title">가져올 위치 선택</div>
                {fridgeSourcePickerTabs.length ? (
                  <div className="focus-tabs housing-interior-fridge-source-picker__tabs" role="tablist" aria-label="식료품 위치 종류">
                    {fridgeSourcePickerTabs.map((tab) => (
                      <button
                        key={`housing-fridge-source-picker-tab-${tab.key}`}
                        type="button"
                        className={`focus-tab ${fridgeSourcePickerTab === tab.key ? 'is-active' : ''}`.trim()}
                        onClick={() => setFridgeSourcePickerTab(tab.key)}
                      >
                        <span className="focus-tab__label">{tab.label}</span>
                        <span className="focus-tab__count">{tab.count}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="housing-interior-fridge-source-picker">
                  {visibleFridgeSourcePickerOptions.length ? visibleFridgeSourcePickerOptions.map((option) => {
                    const optionKey = String(option?.key || 'bag');
                    const sourceKey = String(option?.sourceKey || '');
                    const sourceImageSrc = String(option?.sourceImageSrc || '');
                    const previewItems = Array.isArray(option?.previewItems) ? option.previewItems : [];
                    const previewImageItems = previewItems.filter((item) => item?.imageSrc).slice(0, 4);
                    const extraPreviewCount = Math.max(0, previewItems.length - previewImageItems.length);
                    const selected = fridgeSourceTab === optionKey
                      && (optionKey !== 'vehicle' || sourceKey === String(selectedFridgeVehicleSource?.sourceKey || ''))
                      && (optionKey !== 'warehouse' || sourceKey === String(selectedFridgeWarehouseSource?.sourceKey || ''));
                    return (
                      <button
                        key={`housing-fridge-source-picker-${optionKey}-${sourceKey || 'default'}`}
                        type="button"
                        className={`housing-interior-fridge-source-picker__option ${selected ? 'is-selected' : ''}`.trim()}
                        onClick={() => {
                          setFridgeSourceTab(optionKey);
                          if (optionKey === 'vehicle') setFridgeVehicleSourceKey(sourceKey);
                          if (optionKey === 'warehouse') setFridgeWarehouseSourceKey(sourceKey);
                          setFridgeSourcePickerOpen(false);
                        }}
                      >
                        {sourceImageSrc ? (
                          <span className="housing-interior-fridge-source-picker__source-image" aria-hidden="true">
                            <img src={sourceImageSrc} alt="" loading="lazy" />
                          </span>
                        ) : null}
                        <div className="housing-interior-fridge-source-picker__option-text">
                          <strong>{option.label}</strong>
                          <span>{option.detail}</span>
                        </div>
                        {previewImageItems.length ? (
                          <div className="housing-interior-fridge-source-picker__preview" aria-hidden="true">
                            {previewImageItems.map((item, index) => (
                              <span key={`housing-fridge-source-preview-${optionKey}-${sourceKey || 'default'}-${item.itemKey || index}`}>
                                <img src={item.imageSrc} alt="" loading="lazy" />
                              </span>
                            ))}
                            {extraPreviewCount > 0 ? (
                              <em>{`+${extraPreviewCount}`}</em>
                            ) : null}
                          </div>
                        ) : null}
                      </button>
                    );
                  }) : (
                    <div className="housing-interior-fridge-source-picker__empty">이 위치 종류에 선택 가능한 항목이 없습니다.</div>
                  )}
                </div>
                <div className="footer-actions">
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => setFridgeSourcePickerOpen(false)}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </>
          ) : null}
          {visibleSelectedCookRecipe ? (
            <>
              <div
                className="confirm-modal-backdrop confirm-modal-backdrop--soft"
                style={{ zIndex: 132 }}
                onClick={() => setSelectedCookRecipeKey('')}
              />
              <div
                className="confirm-modal confirm-modal--housing-recipe-detail"
                style={{ zIndex: 133 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="panel__eyebrow">{visibleSelectedCookRecipe.categoryLabel || '요리'}</div>
                <div className="confirm-modal__title">{visibleSelectedCookRecipe.name}</div>
                <div className="housing-interior-recipe-detail">
                  <div className="housing-interior-recipe-detail__image" aria-label="요리 이미지">
                    {visibleSelectedCookRecipe.imageSrc ? (
                      <img src={visibleSelectedCookRecipe.imageSrc} alt="" loading="lazy" />
                    ) : (
                      <span>이미지 준비중</span>
                    )}
                  </div>
                  <div className="housing-interior-recipe-detail__body">
                    <p>{visibleSelectedCookRecipe.desc || '레시피 설명 없음'}</p>
                    <div className="housing-interior-recipe-detail__ingredients">
                      {(Array.isArray(visibleSelectedCookRecipe.ingredients) ? visibleSelectedCookRecipe.ingredients : []).map((ingredient) => (
                        <span
                          key={`housing-recipe-detail-${visibleSelectedCookRecipe.key}-${ingredient.itemKey}`}
                          className={ingredient.ok ? 'is-ready' : 'is-missing'}
                        >
                          {ingredient.displayText || `${ingredient.name} ${Math.round((Number(ingredient.requiredQty) || 0) * 100) / 100}${ingredient.unit}`}
                        </span>
                      ))}
                      {Math.max(0, Number(visibleSelectedCookRecipe.waterLiters) || 0) > 0 ? (
                        <span
                          className={housingWaterAvailableLiters + 0.0001 >= Math.max(0, Number(visibleSelectedCookRecipe.waterLiters) || 0) ? 'is-ready' : 'is-missing'}
                        >
                          {visibleSelectedCookRecipe.waterDisplayText || `물 ${Math.round((Number(visibleSelectedCookRecipe.waterLiters) || 0) * 10) / 10}L`}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="footer-actions">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => setSelectedCookRecipeKey('')}
                  >
                    닫기
                  </button>
                  <button
                    type="button"
                    className="button button--primary"
                    disabled={!visibleSelectedCookRecipe.canCook}
                    onClick={() => {
                      cookHousingMeal?.(visibleSelectedCookRecipe.key);
                      setSelectedCookRecipeKey('');
                    }}
                  >
                    요리하기
                  </button>
                </div>
              </div>
            </>
          ) : null}
          {selectedCookingAppliance?.installed ? (
            <>
              <div
                className="confirm-modal-backdrop confirm-modal-backdrop--soft"
                style={{ zIndex: 132 }}
                onClick={() => setSelectedCookingApplianceKey('')}
              />
              <div
                className="confirm-modal confirm-modal--housing-cooking-appliance"
                style={{ zIndex: 133 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="panel__eyebrow">간편 조리</div>
                <div className="confirm-modal__title">{`${selectedCookingAppliance.icon || '♨️'} ${cookingApplianceLabelOf(selectedCookingAppliance)}로 조리`}</div>
                <div className="housing-interior-cookable-prep-list">
                  {cookableHousingPrepRows.length ? cookableHousingPrepRows.map((prep) => {
                    const prepKey = String(prep?.key || '');
                    const batchQty = Math.max(1, Math.floor(Number(prep.cookBatchQty) || 1));
                    const selectedPrepQty = Math.max(0, Math.floor(Number(selectedCookingPrepQtyByKey?.[prepKey]) || 0));
                    const prepCapacityRemain = Number.isFinite(selectedCookingCapacityLimit)
                      ? Math.max(0, selectedCookingCapacityLimit - (selectedCookingPrepTotalQty - selectedPrepQty))
                      : batchQty;
                    const maxSelectablePrepQty = Math.max(0, Math.min(batchQty, prepCapacityRemain));
                    const prepSelected = selectedPrepQty > 0;
                    const waterSourceOptions = Array.isArray(prep?.waterSourceOptions) ? prep.waterSourceOptions : [];
                    const isWaterSourcePrep = prepKey === 'housingCookedRiceBowl' && waterSourceOptions.length > 0;
                    const riceBaseOutputQty = Math.max(1, Number(prep?.outputQty) || 3);
                    const riceCookerMaxBowls = Math.max(1, Math.min(10, Math.floor(Number(riceCookerServingLimit) || 3)));
                    const riceIngredientMaxBowls = isWaterSourcePrep
                      ? (Array.isArray(prep?.ingredients) ? prep.ingredients : []).reduce((limit, ingredient) => {
                        const requiredQty = Math.max(0, Number(ingredient?.requiredQty) || 0);
                        if (requiredQty <= 0) return limit;
                        const availableQty = Math.max(0, Number(ingredient?.availableQty) || 0);
                        const ingredientBowls = Math.floor(((availableQty + 0.0001) / requiredQty) * riceBaseOutputQty);
                        return Math.min(limit, Math.max(0, ingredientBowls));
                      }, riceCookerMaxBowls)
                      : riceCookerMaxBowls;
                    const maxRiceCookBowls = Math.max(1, Math.min(riceCookerMaxBowls, riceIngredientMaxBowls));
                    const clampedSelectedRiceCookBowls = Math.max(1, Math.min(maxRiceCookBowls, Math.floor(Number(selectedRiceCookBowls) || 1)));
                    const riceCanCookBowls = (bowlsRaw) => {
                      if (!isWaterSourcePrep) return true;
                      const bowls = Math.max(1, Math.min(maxRiceCookBowls, Math.floor(Number(bowlsRaw) || 1)));
                      const scale = bowls / riceBaseOutputQty;
                      return (Array.isArray(prep?.ingredients) ? prep.ingredients : []).every((ingredient) => {
                        const requiredQty = Math.max(0, Number(ingredient?.requiredQty) || 0) * scale;
                        const availableQty = Math.max(0, Number(ingredient?.availableQty) || 0);
                        return availableQty + 0.0001 >= requiredQty;
                      });
                    };
                    const selectedRiceIngredientsOk = riceCanCookBowls(clampedSelectedRiceCookBowls);
                    const riceWaterScale = isWaterSourcePrep
                      ? clampedSelectedRiceCookBowls / riceBaseOutputQty
                      : 1;
                    const selectedWaterSourceOptions = isWaterSourcePrep
                      ? waterSourceOptions.map((option) => {
                        const optionKey = String(option?.key || '');
                        if (optionKey === 'bottledWater') {
                          const requiredQty = Math.round(Math.max(0, Number(option?.requiredQtyPerCook) || 0) * riceWaterScale * 100) / 100;
                          const displayQty = requiredQty > 0 && requiredQty < 0.01 ? 0.01 : requiredQty;
                          return {
                            ...option,
                            detail: `생수 2L ${displayQty}병 사용`,
                            canUse: selectedRiceIngredientsOk && Math.max(0, Number(option?.availableQty) || 0) + 0.0001 >= requiredQty
                          };
                        }
                        if (optionKey === 'purifierWater') {
                          const requiredLiters = Math.max(0, Number(option?.requiredLitersPerCook) || 0) * riceWaterScale;
                          const requiredMl = Math.round(requiredLiters * 1000);
                          return {
                            ...option,
                            detail: option?.hasInstalled ? `정수기물 ${requiredMl}ml 사용` : option.detail,
                            canUse: selectedRiceIngredientsOk && Boolean(option?.hasInstalled) && Math.max(0, Number(option?.availableLiters) || 0) + 0.0001 >= requiredLiters
                          };
                        }
                        return {
                          ...option,
                          canUse: selectedRiceIngredientsOk && Boolean(option?.canUse)
                        };
                      })
                      : waterSourceOptions;
                    const collapsing = collapsingCookingPrepKey === prepKey;
                    const deselecting = deselectingCookingPrepKey === prepKey;
                    const expanded = selectedCookingPrepKey === prepKey || collapsing;
                    const cardClassName = `housing-interior-cookable-prep-card ${expanded ? 'is-expanded' : ''} ${collapsing ? 'is-collapsing' : ''} ${prepSelected ? 'is-selected' : ''} ${deselecting ? 'is-deselecting' : ''}`.trim();
                    const cardContent = (
                      <>
                        <span className="housing-interior-cookable-prep-card__image" aria-hidden="true">
                          {prep.imageSrc ? (
                            <img src={prep.imageSrc} alt="" loading="lazy" />
                          ) : (
                            <span>{selectedCookingAppliance.icon || '♨️'}</span>
                          )}
                        </span>
                        <div className="housing-interior-cookable-prep-card__body">
                          <strong>{prep.name}</strong>
                          {batchQty > 1 ? (
                            <em>{`최대 ${batchQty}개`}</em>
                          ) : null}
                          {prepSelected ? (
                            <em>{`선택 ${selectedPrepQty}개`}</em>
                          ) : null}
                          <span>{prep.desc || '현재 재료로 바로 조리 가능'}</span>
                          <small>
                            {[
                              ...(Array.isArray(prep.ingredients) ? prep.ingredients : [])
                              .map((ingredient) => ingredient.displayText || ingredient.name)
                              ,
                              ...(Math.max(0, Number(prep.waterLiters) || 0) > 0 ? [prep.waterDisplayText || `물 ${Math.round((Number(prep.waterLiters) || 0) * 10) / 10}L`] : [])
                            ].join(' · ')}
                          </small>
                        </div>
                      </>
                    );
                    if (isWaterSourcePrep) {
                      return (
                        <div
                          key={`housing-cookable-prep-${prepKey}`}
                          className={cardClassName}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleCookingPrepExpansion(prepKey)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              toggleCookingPrepExpansion(prepKey);
                            }
                          }}
                        >
                          {cardContent}
                          {expanded ? (
                            <div className="housing-interior-cookable-prep-card__rice-controls">
                              <div className="housing-interior-cookable-prep-card__rice-capacity">
                                {`현재 밥솥 최대 ${riceCookerMaxBowls}공기 · 재료 기준 최대 ${maxRiceCookBowls}공기`}
                              </div>
                              <label className="housing-interior-cookable-prep-card__rice-number">
                                <span>지을 밥량</span>
                                <input
                                  type="number"
                                  min="1"
                                  max={maxRiceCookBowls}
                                  step="1"
                                  value={clampedSelectedRiceCookBowls}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) => {
                                    event.stopPropagation();
                                    const nextBowls = Math.max(1, Math.min(maxRiceCookBowls, Math.floor(Number(event.target.value) || 1)));
                                    setSelectedRiceCookBowls(nextBowls);
                                  }}
                                />
                                <strong>공기</strong>
                              </label>
                              <div className="housing-interior-cookable-prep-card__water-options">
                                {selectedWaterSourceOptions.map((option) => (
                                  <button
                                    key={`housing-rice-water-source-${option.key}`}
                                    type="button"
                                    className={`housing-interior-cookable-prep-card__water-option ${selectedRiceWaterSourceKey === String(option?.key || '') ? 'is-selected' : ''}`.trim()}
                                    aria-pressed={selectedRiceWaterSourceKey === String(option?.key || '')}
                                    disabled={!option.canUse}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (!option.canUse) return;
                                      setSelectedRiceWaterSourceKey(String(option?.key || ''));
                                    }}
                                  >
                                    <strong>{option.label}</strong>
                                    <span>{option.detail}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={`housing-cookable-prep-${prepKey}`}
                        className={cardClassName}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          toggleCookingPrepSelection(prepKey);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            toggleCookingPrepSelection(prepKey);
                          }
                        }}
                      >
                        {cardContent}
                        <div className="housing-interior-cookable-prep-card__quantity" onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            className="button button--ghost button--compact"
                            disabled={selectedPrepQty <= 0}
                            onClick={() => changeCookingPrepSelectionQty(prepKey, selectedPrepQty - 1)}
                          >
                            -
                          </button>
                          <span>{`${selectedPrepQty} / ${maxSelectablePrepQty}`}</span>
                          <button
                            type="button"
                            className="button button--ghost button--compact"
                            disabled={selectedPrepQty >= maxSelectablePrepQty}
                            onClick={() => changeCookingPrepSelectionQty(prepKey, selectedPrepQty + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="housing-interior-cookable-prep-empty">
                      현재 재료로 조리 가능한 항목이 없습니다.
                    </div>
                  )}
                </div>
                <div className="housing-interior-cookable-prep-summary">
                  <span>{cookingSelectionSummary}</span>
                  {Number.isFinite(selectedCookingCapacityLimit) ? (
                    <strong>{`전자레인지 1회 ${selectedCookingPrepTotalQty}/${selectedCookingCapacityLimit}개`}</strong>
                  ) : selectedCookingPrepCount > 0 ? (
                    <strong>{`${selectedCookingPrepCount}종 선택`}</strong>
                  ) : null}
                </div>
                <div className="footer-actions">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => setSelectedCookingApplianceKey('')}
                  >
                    닫기
                  </button>
                  <button
                    type="button"
                    className="button button--primary"
                    disabled={String(selectedCookingAppliance?.type || '') === 'riceCooker'
                      ? !selectedRiceCooking?.canConfirm
                      : selectedCookingPrepTotalQty <= 0}
                    onClick={confirmCookingPrepSelection}
                  >
                    확인
                  </button>
                </div>
              </div>
            </>
          ) : null}
          {plateOptionPickerSlotKey ? (
            <>
              <div
                className="confirm-modal-backdrop confirm-modal-backdrop--soft"
                style={{ zIndex: 132 }}
                onClick={() => setPlateOptionPickerSlotKey('')}
              />
              <div
                className="confirm-modal confirm-modal--housing-plate-option"
                style={{ zIndex: 133 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="panel__eyebrow">한상 구성</div>
                <div className="confirm-modal__title">{`${activePlateSlotLabel} 선택`}</div>
                <div className="housing-interior-meal-plate-option-list housing-interior-meal-plate-option-list--modal">
                  {visibleActivePlateSlotOptions.length ? visibleActivePlateSlotOptions.map((option) => {
                    const activeSideIndex = Math.max(0, Number(String(plateOptionPickerActiveSlotKey).replace('side', '')) || 0);
                    const selectedKey = plateOptionPickerActiveSlotKey === 'rice'
                      ? selectedPlateRiceKey
                      : plateOptionPickerActiveSlotKey === 'main'
                        ? selectedPlateMainKey
                        : plateOptionPickerActiveSlotKey === 'soup'
                          ? selectedPlateSoupKey
                          : plateOptionPickerActiveSlotKey === 'dessert'
                            ? selectedPlateDessertKey
                            : selectedPlateSideKeys[activeSideIndex];
                    return (
                      <button
                        key={`housing-meal-plate-option-modal-${plateOptionPickerActiveSlotKey}-${option.key}`}
                        type="button"
                        className={`housing-interior-meal-plate-option ${String(selectedKey || '') === String(option.key || '') ? 'is-selected' : ''}`.trim()}
                        onClick={() => {
                          if (plateOptionPickerActiveSlotKey === 'rice') setSelectedPlateRiceKey(String(option.key || ''));
                          else if (plateOptionPickerActiveSlotKey === 'main') setSelectedPlateMainKey(String(option.key || ''));
                          else if (plateOptionPickerActiveSlotKey === 'soup') setSelectedPlateSoupKey(String(option.key || ''));
                          else if (plateOptionPickerActiveSlotKey === 'dessert') setSelectedPlateDessertKey(String(option.key || ''));
                          else setPlateSideKeyAt(activeSideIndex, option.key);
                          setPlateOptionPickerSlotKey('');
                        }}
                        disabled={!option.canCook}
                      >
                        <strong>{option.name}</strong>
                        <span>{option.desc || '한상 구성 항목'}</span>
                      </button>
                    );
                  }) : (
                    <div className="housing-interior-meal-plate-option-empty">
                      선택 가능한 항목이 없습니다.
                    </div>
                  )}
                </div>
                <div className="footer-actions">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => setPlateOptionPickerSlotKey('')}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </>
          ) : null}
          {fridgeTempModalConfig ? (
            <>
              <div
                className="confirm-modal-backdrop confirm-modal-backdrop--soft"
                style={{ zIndex: 134 }}
                onClick={() => setFridgeTempModalKey('')}
              />
              <div
                className="confirm-modal confirm-modal--fridge-temp"
                style={{ zIndex: 135 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="panel__eyebrow">보관 온도</div>
                <div className="confirm-modal__title">{`${fridgeTempModalConfig.label} 온도설정`}</div>
                <div className="housing-interior-fridge-temp-modal">
                  <div className="housing-interior-fridge-temp-modal__value">
                    <span>현재 설정</span>
                    <strong>{`${fridgeTempModalConfig.temp}°C`}</strong>
                    <small>{`권장 ${fridgeTempModalConfig.recommended} · 범위 ${fridgeTempModalConfig.min}~${fridgeTempModalConfig.max}°C`}</small>
                  </div>
                  <div className="housing-interior-fridge-temp-modal__stepper" role="group" aria-label={`${fridgeTempModalConfig.label} 온도 조절`}>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => stepFridgeTemp(fridgeTempModalConfig.key, -1)}
                    >
                      -
                    </button>
                    <span>{`${fridgeTempModalConfig.temp}°C`}</span>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => stepFridgeTemp(fridgeTempModalConfig.key, 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="footer-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={() => setFridgeTempModalKey('')}
                    >
                      확인
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
