import React from 'react';

export const PHONE_HOME_APPS = [
  ['은행', 'bank', '💳'],
  ['중고차', 'dealer', '🚘'],
  ['날씨', 'weather', '🌤'],
  ['인터넷', 'internet', '🌐'],
  ['캘린더', 'calendar', '📅'],
  ['농부24', 'farmer24', '🌾'],
  ['배달', 'baemin', '🛵'],
  ['지도', 'map', '🗺'],
  ['농지', 'land', '🌱'],
  ['농기계', 'machinery', '🚜'],
  ['인력소', 'labor', '👥'],
  ['공판장', 'auction', '📦'],
  ['건강', 'health', '💚'],
  ['설정', 'settings', '⚙']
];

const HOME_PAGE_COUNT = 3;
const PHONE_HOME_APP_LONG_PRESS_MS = 320;
const PHONE_APP_LOADING_DURATION_MS = 820;
const PHONE_RECENT_APP_LIMIT = 7;
const PHONE_RECENT_DISMISS_THRESHOLD = -82;
const PHONE_RECENT_SIDE_SWIPE_THRESHOLD = 52;
const PHONE_APP_LOADING_SKIP_KEYS = new Set(['settings', 'messages', 'contacts', 'phone-call']);
const PHONE_APP_LOADING_META = Object.freeze({
  bank: { label: '은행', icon: '🏦', detail: '계좌 정보를 확인하는 중', tone: 'mint' },
  weather: { label: '날씨', icon: '🌤️', detail: '오늘의 기상을 불러오는 중', tone: 'sky' },
  internet: { label: '인터넷', icon: '🌐', detail: '브라우저를 여는 중', tone: 'blue' },
  calendar: { label: '캘린더', icon: '📅', detail: '월간 일정을 정리하는 중', tone: 'mint' },
  land: { label: '농지', icon: '🌿', detail: '소유 농지를 정리하는 중', tone: 'leaf' },
  labor: { label: '인력', icon: '👥', detail: '작업 인력을 조회하는 중', tone: 'teal' },
  health: { label: '건강', icon: '💚', detail: '컨디션을 점검하는 중', tone: 'green' },
  settings: { label: '설정', icon: '⚙️', detail: '환경 설정을 여는 중', tone: 'slate' },
  messages: { label: '문자', icon: '💬', detail: '새 메시지를 확인하는 중', tone: 'blue' },
  contacts: { label: '연락처', icon: '📇', detail: '연락처를 불러오는 중', tone: 'blue' },
  'phone-call': { label: '전화', icon: '📞', detail: '통화 화면을 준비하는 중', tone: 'green' },
  'apple-helper-chat': { label: '박사님', icon: '🍎', detail: '대화 내용을 정리하는 중', tone: 'warm' },
  placeholder: { label: '앱', icon: '📱', detail: '앱을 실행하는 중', tone: 'slate' }
});
const PHONE_RECENT_EXTRA_APP_META = Object.freeze({
  messages: ['문자', 'messages', '💬'],
  contacts: ['연락처', 'contacts', '📇'],
  'phone-call': ['전화', 'phone-call', '📞'],
  'apple-helper-chat': ['상담', 'apple-helper-chat', '🍎'],
  placeholder: ['앱', 'placeholder', '📱']
});
const PHONE_BANK_TABS = Object.freeze([
  ['summary', '요약'],
  ['cards', '카드'],
  ['accounts', '통장'],
  ['logs', '내역']
]);
const reorderPhoneHomeAppKeys = (keys = [], draggedKey = '', targetKey = '') => {
  const source = Array.isArray(keys) ? keys.map((key) => String(key || '').trim()).filter(Boolean) : [];
  const fromKey = String(draggedKey || '').trim();
  const toKey = String(targetKey || '').trim();
  if (!fromKey || !toKey || fromKey === toKey) return source;
  const fromIndex = source.indexOf(fromKey);
  const toIndex = source.indexOf(toKey);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return source;
  const next = [...source];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};
const PHONE_NOTIFICATION_SENDER_LABEL = Object.freeze({
  me: '나',
  weather: '날씨',
  labor: '인력소',
  wallet: '결제',
  'small-apc': '소형 APC',
  system: '시스템'
});

export default function PhoneQuickDrawer({
  quickDrawerOpen,
  setQuickDrawerOpen,
  phoneUnlocked,
  phoneSwipeY,
  phoneLockIsDragging,
  handlePhoneLockPointerDown,
  handlePhoneLockPointerMove,
  finishPhoneSwipe,
  unlockPhone,
  isNightPhase = false,
  phoneTimeText,
  phoneDateText,
  phoneWeatherText,
  phoneWeatherDescText,
  phoneMoneyText,
  phoneHealthGaugeValue,
  phoneSelfLaborValue,
  audioMenuBgmVolume,
  setAudioMenuBgmVolume,
  audioWeatherBgmVolume,
  setAudioWeatherBgmVolume,
  audioSfxVolume,
  setAudioSfxVolume,
  openWeatherAppFromLockShortcut,
  openWalletFromLockShortcut,
  phoneSwipeProgress,
  handlePhoneHomePointerDown,
  handlePhoneHomePointerMove,
  finishPhoneHomeSwipe,
  phoneHomeDragX,
  phoneHomeIsDragging,
  phoneOpenedApp,
  phoneAppTransitionPhase,
  phoneAppOrigin,
  openPhoneApp,
  switchPhoneApp,
  closePhoneApp,
  weatherIconOf,
  game,
  phoneNotifications,
  phoneNotificationHiddenIds,
  phoneBannerNotification,
  phoneForecastRows,
  phoneHomeApps,
  phoneHomePage,
  setPhoneHomePage,
  phonePressedAppKey,
  flashPhoneAppPress,
  runPhonePressAction,
  savePhoneHomeAppOrder,
  phoneBagRows = [],
  openInventoryModal,
  openPhoneMessagesApp,
  openPhoneHelperChatApp,
  activePhoneHelperContact,
  phoneHelperContacts,
  canUseDevMode,
  devMode,
  setDevMode,
  devDateDraft,
  setDevDateDraft,
  devSetDate,
  devMoneyDraft,
  setDevMoneyDraft,
  devSetMoney,
  devFastNextDay,
  setDevFastNextDay,
  devSuperForecastRows,
  devAutoPageReloadEnabled,
  setDevAutoPageReloadEnabled,
  autoSaveEnabled,
  setAutoSaveEnabled,
  autoRestoreViewEnabled,
  setAutoRestoreViewEnabled,
  showHousingDevSettings,
  housingEntryButtonDragEnabled,
  toggleHousingEntryButtonDragEnabled,
  housingEntryButtonPositionDirty,
  saveHousingEntryButtonLayout,
  townMarkerCoordsLocked,
  toggleTownMarkerCoordsLocked,
  smallApcDevPlayerUnloadSkipEnabled,
  toggleSmallApcDevPlayerUnloadSkipEnabled,
  smallApcDevPlayerWorkSkipEnabled,
  toggleSmallApcDevPlayerWorkSkipEnabled,
  smallApcDevPlayerSortingSkipEnabled,
  toggleSmallApcDevPlayerSortingSkipEnabled,
  townMarkerCoordsDirty,
  townMarkerLayoutSavedAtDay,
  saveTownMarkerLayout,
  devLmStudioModels,
  devLmStudioModelsLoading,
  devLmStudioModelsError,
  loadDevLmStudioModels,
  phoneHelperModelOverrides,
  applyPhoneHelperModelOverride,
  resetPhoneHelperModelOverride,
  currentPhoneHelperContact,
  phoneHelperPendingLaborRequest,
  markPhoneNotificationsRead,
  removePhoneNotifications,
  appleHelperChatMessages,
  appleHelperChatThreads,
  appleHelperChatDraft,
  setAppleHelperChatDraft,
  appleHelperChatPending,
  appleHelperChatStreaming,
  appleHelperChatError,
  sendAppleHelperChatMessage,
  walletDetailSummary,
  walletMoneyLogs,
  issuedCardProducts,
  issuedAccountProducts,
  bankAccountNumberById,
  formatMoneyText,
  renderWalletCardVisual,
  openCardUsageFromPhone,
  minCrewStartDate,
  phoneCrewTypeRows,
  updatePhoneCrewDraft,
  rentCrewFromPhone,
  phoneCrewRentRows,
  payApprovedCrewRentFromPhone,
  approveRejectedCrewRentFromPhone,
  cancelCrewRentFromPhone,
  renamePlayerFromPhone,
  renameFarmFromPhone,
  renameLandFromPhone,
  addCalendarEvent,
  removeCalendarEvent
}) {
  const appleHelperChatInputRef = React.useRef(null);
  const previousAppleHelperChatPendingRef = React.useRef(false);
  const [devDatePanelOpen, setDevDatePanelOpen] = React.useState(false);
  const [devMoneyPanelOpen, setDevMoneyPanelOpen] = React.useState(false);
  const [devForecastPanelOpen, setDevForecastPanelOpen] = React.useState(false);
  const [phoneBankTab, setPhoneBankTab] = React.useState('summary');
  const [phoneBankTabDirection, setPhoneBankTabDirection] = React.useState('forward');
  const [phoneLandEditingIndex, setPhoneLandEditingIndex] = React.useState(-1);
  const [phoneLandNameDraft, setPhoneLandNameDraft] = React.useState('');
  const [phoneLandNameError, setPhoneLandNameError] = React.useState('');
  const [phoneCalendarSelectedDate, setPhoneCalendarSelectedDate] = React.useState('');
  const [phoneCalendarTitleDraft, setPhoneCalendarTitleDraft] = React.useState('');
  const [phoneCalendarMessage, setPhoneCalendarMessage] = React.useState('');
  const [phoneBagModalOpen, setPhoneBagModalOpen] = React.useState(false);
  const helperContacts = React.useMemo(() => {
    if (!phoneHelperContacts || typeof phoneHelperContacts !== 'object') return [];
    return Object.entries(phoneHelperContacts).map(([key, contact], index) => ({
      key,
      name: String(contact?.name || '').trim() || `상담원 ${index + 1}`,
      subtitle: String(contact?.subtitle || '').trim(),
      availability: String(contact?.availability || 'online').trim().toLowerCase() === 'offline' ? 'offline' : 'online',
      avatarText: String(contact?.avatarText || '').trim() || String(contact?.name || '?').trim().slice(0, 1) || '?',
      avatarToneClass: String(contact?.avatarToneClass || `tone-${(index % 4) + 1}`).trim(),
      avatarImage: String(contact?.avatarImage || '').trim(),
      introText: String(contact?.introText || '').trim(),
      placeholder: String(contact?.placeholder || '').trim(),
      quickPrompts: Array.isArray(contact?.quickPrompts) ? contact.quickPrompts.map((entry) => String(entry || '').trim()).filter(Boolean) : []
    }));
  }, [phoneHelperContacts]);
  const defaultHelperContact = helperContacts[0] || {
    key: 'apple-helper',
    name: '상담원',
    subtitle: '',
    availability: 'online',
    avatarText: '상',
    avatarToneClass: 'tone-1',
    avatarImage: '',
    introText: '',
    placeholder: '상담 내용을 입력하세요',
    quickPrompts: []
  };
  const PHONE_NOTIFICATION_DELETE_THRESHOLD = -76;
  const phoneHasOpenApp = Boolean(phoneOpenedApp);
  const phoneAppTransitionClass = phoneAppTransitionPhase === 'opening'
    ? 'is-opening'
    : phoneAppTransitionPhase === 'closing'
      ? 'is-closing'
      : phoneAppTransitionPhase === 'open'
        ? 'is-open'
        : '';
  const phoneLoadedAppKeysRef = React.useRef(new Set());
  const phoneAppLoadingTimerRef = React.useRef(null);
  const [phoneAppLoadingKey, setPhoneAppLoadingKey] = React.useState('');
  React.useEffect(() => (
    () => {
      if (phoneAppLoadingTimerRef.current) {
        clearTimeout(phoneAppLoadingTimerRef.current);
        phoneAppLoadingTimerRef.current = null;
      }
    }
  ), []);
  React.useEffect(() => {
    if (phoneUnlocked && quickDrawerOpen) return;
    phoneLoadedAppKeysRef.current = new Set();
    setPhoneAppLoadingKey('');
    if (phoneAppLoadingTimerRef.current) {
      clearTimeout(phoneAppLoadingTimerRef.current);
      phoneAppLoadingTimerRef.current = null;
    }
  }, [phoneUnlocked, quickDrawerOpen]);
  React.useEffect(() => {
    const appKey = String(phoneOpenedApp || '');
    if (phoneAppLoadingTimerRef.current) {
      clearTimeout(phoneAppLoadingTimerRef.current);
      phoneAppLoadingTimerRef.current = null;
    }
    if (
      !appKey
      || !phoneUnlocked
      || !quickDrawerOpen
      || PHONE_APP_LOADING_SKIP_KEYS.has(appKey)
      || phoneLoadedAppKeysRef.current.has(appKey)
    ) {
      setPhoneAppLoadingKey('');
      return;
    }
    setPhoneAppLoadingKey(appKey);
    phoneAppLoadingTimerRef.current = setTimeout(() => {
      phoneLoadedAppKeysRef.current.add(appKey);
      setPhoneAppLoadingKey((currentKey) => (currentKey === appKey ? '' : currentKey));
      phoneAppLoadingTimerRef.current = null;
    }, PHONE_APP_LOADING_DURATION_MS);
  }, [phoneOpenedApp, phoneUnlocked, quickDrawerOpen]);
  const phoneHomePanelsStyle = {
    transform: `translate3d(calc(${phoneHomePage * -(100 / HOME_PAGE_COUNT)}% + ${Math.round(Number(phoneHomeDragX) || 0)}px), 0, 0)`
  };
  const moneyText = React.useCallback((value) => (
    typeof formatMoneyText === 'function'
      ? formatMoneyText(value)
      : `${Math.round(Number(value) || 0).toLocaleString()}원`
  ), [formatMoneyText]);
  const phoneIssuedCards = React.useMemo(() => (
    Array.isArray(issuedCardProducts) ? issuedCardProducts.filter(Boolean) : []
  ), [issuedCardProducts]);
  const phoneIssuedAccounts = React.useMemo(() => (
    Array.isArray(issuedAccountProducts) ? issuedAccountProducts.filter(Boolean) : []
  ), [issuedAccountProducts]);
  const phoneWalletLogs = React.useMemo(() => (
    Array.isArray(walletMoneyLogs) ? walletMoneyLogs.filter(Boolean) : []
  ), [walletMoneyLogs]);
  const phoneGameDateFromDay = React.useCallback((dayRaw = 1) => (
    new Date(2026, 0, Math.max(1, Math.floor(Number(dayRaw) || 1)))
  ), []);
  const phoneFormatCalendarDateKey = React.useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);
  const phoneCalendarDate = phoneGameDateFromDay(game?.day);
  const phoneCalendarYear = phoneCalendarDate.getFullYear();
  const phoneCalendarMonth = phoneCalendarDate.getMonth();
  const phoneCalendarTodayKey = phoneFormatCalendarDateKey(phoneCalendarDate);
  const phoneCalendarMonthLabel = `${phoneCalendarYear}년 ${phoneCalendarMonth + 1}월`;
  const phoneCalendarEvents = React.useMemo(() => (
    (Array.isArray(game?.calendarEvents) ? game.calendarEvents : [])
      .map((event, index) => ({
        id: String(event?.id || `phone-calendar-event-${index}`),
        date: String(event?.date || ''),
        title: String(event?.title || '').trim(),
        note: String(event?.note || '').trim()
      }))
      .filter((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.date) && event.title)
  ), [game?.calendarEvents]);
  const phoneCalendarEventsByDate = React.useMemo(() => (
    phoneCalendarEvents.reduce((acc, event) => {
      const dateKey = String(event?.date || '');
      if (!dateKey) return acc;
      acc[dateKey] = [...(acc[dateKey] || []), event];
      return acc;
    }, {})
  ), [phoneCalendarEvents]);
  const phoneCalendarCells = React.useMemo(() => {
    const firstDate = new Date(phoneCalendarYear, phoneCalendarMonth, 1);
    const gridStart = new Date(phoneCalendarYear, phoneCalendarMonth, 1 - firstDate.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const dateKey = phoneFormatCalendarDateKey(date);
      return {
        key: dateKey,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === phoneCalendarMonth,
        isToday: dateKey === phoneCalendarTodayKey,
        events: phoneCalendarEventsByDate[dateKey] || []
      };
    });
  }, [phoneCalendarEventsByDate, phoneCalendarMonth, phoneCalendarTodayKey, phoneCalendarYear, phoneFormatCalendarDateKey]);
  const phoneActiveCalendarDate = phoneCalendarSelectedDate || phoneCalendarTodayKey;
  const phoneActiveCalendarEvents = phoneCalendarEventsByDate[phoneActiveCalendarDate] || [];
  const submitPhoneCalendarEvent = React.useCallback(() => {
    const result = addCalendarEvent?.({
      date: phoneActiveCalendarDate,
      title: phoneCalendarTitleDraft
    });
    setPhoneCalendarMessage(result?.message || '');
    if (result?.ok) setPhoneCalendarTitleDraft('');
  }, [addCalendarEvent, phoneActiveCalendarDate, phoneCalendarTitleDraft]);
  const deletePhoneCalendarEvent = React.useCallback((eventId) => {
    const result = removeCalendarEvent?.(eventId);
    setPhoneCalendarMessage(result?.message || '');
  }, [removeCalendarEvent]);
  const phoneBagItemKindCount = Array.isArray(phoneBagRows) ? phoneBagRows.length : 0;
  const phoneOwnedLandRows = React.useMemo(() => (
    (Array.isArray(game?.fields) ? game.fields : [])
      .map((field, index) => ({ field, index }))
      .filter(({ field }) => Boolean(field?.owned))
      .map(({ field, index }) => {
      const name = String(field?.name || field?.fieldName || `농지 ${index + 1}`).trim();
      const areaPy = Math.max(0, Math.floor(Number(field?.areaPy ?? field?.sizePy ?? field?.py) || 0));
      const treeCount = Math.max(0, Math.floor(Number(field?.treeCount ?? field?.trees ?? field?.plantedTreeCount) || 0));
      const cropName = String(field?.cropName || field?.cropLabel || field?.cropId || '').trim();
      const isCurrent = Number(game?.selectedField) === index;
      const acquiredDay = Math.max(0, Math.floor(Number(field?.acquiredDay ?? field?.purchaseDay ?? 0) || 0));
      return {
        key: String(field?.id || field?.key || `field-${index}`),
        fieldIndex: index,
        name,
        areaText: areaPy > 0 ? `${areaPy.toLocaleString()}평` : '평수 정보 없음',
        cropText: cropName ? `재식 ${cropName}${treeCount > 0 ? ` · ${treeCount.toLocaleString()}주` : ''}` : '미재식',
        metaText: `${isCurrent ? '현재 위치' : '소유 농지'}${acquiredDay > 0 ? ` · ${acquiredDay}일차 취득` : ''}`,
        moneyText: isCurrent ? `자금 ${moneyText(game?.money || 0)}` : ''
      };
    })
  ), [game?.fields, game?.money, game?.selectedField, moneyText]);
  const selectPhoneBankTab = React.useCallback((nextTab) => {
    const currentIndex = PHONE_BANK_TABS.findIndex(([key]) => key === phoneBankTab);
    const nextIndex = PHONE_BANK_TABS.findIndex(([key]) => key === nextTab);
    setPhoneBankTabDirection(nextIndex >= currentIndex ? 'forward' : 'back');
    setPhoneBankTab(nextTab);
  }, [phoneBankTab]);
  const startPhoneLandNameEdit = React.useCallback((row) => {
    setPhoneLandEditingIndex(Math.max(0, Math.floor(Number(row?.fieldIndex) || 0)));
    setPhoneLandNameDraft(String(row?.name || '').trim());
    setPhoneLandNameError('');
  }, []);
  const cancelPhoneLandNameEdit = React.useCallback(() => {
    setPhoneLandEditingIndex(-1);
    setPhoneLandNameDraft('');
    setPhoneLandNameError('');
  }, []);
  const savePhoneLandNameEdit = React.useCallback(() => {
    if (typeof renameLandFromPhone !== 'function') return;
    const result = renameLandFromPhone(phoneLandEditingIndex, phoneLandNameDraft);
    if (!result?.ok) {
      setPhoneLandNameError(result?.message || '토지 이름을 변경할 수 없습니다.');
      return;
    }
    cancelPhoneLandNameEdit();
  }, [cancelPhoneLandNameEdit, phoneLandEditingIndex, phoneLandNameDraft, renameLandFromPhone]);
  React.useEffect(() => {
    if (phoneOpenedApp !== 'land') cancelPhoneLandNameEdit();
  }, [cancelPhoneLandNameEdit, phoneOpenedApp]);
  const pendingCardAmountOf = React.useCallback((cardId) => (
    (Array.isArray(game?.pendingCreditCardBills) ? game.pendingCreditCardBills : [])
      .filter((bill) => String(bill?.cardId || '') === String(cardId || ''))
      .reduce((sum, bill) => sum + Math.max(0, Math.floor(Number(bill?.amount) || 0)), 0)
  ), [game?.pendingCreditCardBills]);
  const phoneScreenRef = React.useRef(null);
  const phoneHomeLongPressTimerRef = React.useRef(null);
  const phoneHomeDragRef = React.useRef({
    active: false,
    pointerId: null,
    appKey: '',
    moved: false,
    startX: 0,
    startY: 0,
  });
  const phoneHomeSuppressClickRef = React.useRef(false);
  const helperChatTypingTimerRef = React.useRef(null);
  const helperChatLoadingHintTimerRef = React.useRef(null);
  const helperChatPrevStreamingAssistantIdRef = React.useRef('');
  const helperChatPrevVisibleMessageCountRef = React.useRef(0);
  const helperChatPrevLastAssistantIdRef = React.useRef('');
  const helperChatAutoScrollEnabledRef = React.useRef(true);
  const helperPresenceLabelOf = React.useCallback((contact) => (
    String(contact?.availability || 'online').trim().toLowerCase() === 'offline' ? '오프라인' : '온라인'
  ), []);
  const devHelperModelRows = React.useMemo(() => (
    Array.isArray(devLmStudioModels)
      ? devLmStudioModels.map((modelId) => String(modelId || '').trim()).filter(Boolean)
      : []
  ), [devLmStudioModels]);
  const phoneAppEdgeSwipeRef = React.useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastAt: 0,
    deltaX: 0,
    velocityX: 0,
    engaged: false
  });
  const [phoneAppEdgeSwipeX, setPhoneAppEdgeSwipeX] = React.useState(0);
  const [phoneHomeDragOrderKeys, setPhoneHomeDragOrderKeys] = React.useState(() => []);
  const [phoneHomeDraggingAppKey, setPhoneHomeDraggingAppKey] = React.useState('');
  const [phoneHomeReorderMode, setPhoneHomeReorderMode] = React.useState(false);
  const [phonePlaceholderApp, setPhonePlaceholderApp] = React.useState({ key: '', label: '' });
  const [phoneRecentViewOpen, setPhoneRecentViewOpen] = React.useState(false);
  const [phoneRecentAppKeys, setPhoneRecentAppKeys] = React.useState([]);
  const [phoneRecentActiveIndex, setPhoneRecentActiveIndex] = React.useState(0);
  const [phoneRecentFlowDragX, setPhoneRecentFlowDragX] = React.useState(0);
  const [phoneRecentDismissOffsetByKey, setPhoneRecentDismissOffsetByKey] = React.useState({});
  const phoneRecentDismissRef = React.useRef({
    active: false,
    pointerId: null,
    appKey: '',
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    engaged: false,
    mode: ''
  });
  const phoneRecentSuppressClickRef = React.useRef(false);
  const phoneAppLoadingView = React.useMemo(() => {
    if (!phoneAppLoadingKey) return null;
    const base = PHONE_APP_LOADING_META[phoneAppLoadingKey] || PHONE_APP_LOADING_META.placeholder;
    if (phoneAppLoadingKey !== 'placeholder') return base;
    return {
      ...base,
      label: String(phonePlaceholderApp?.label || '').trim() || base.label,
      detail: `${String(phonePlaceholderApp?.label || '').trim() || base.label}을 여는 중`
    };
  }, [phoneAppLoadingKey, phonePlaceholderApp?.label]);
  const appleHelperChatListRef = React.useRef(null);
  const [helperChatRenderedTextById, setHelperChatRenderedTextById] = React.useState({});
  const [helperChatAnimatingMessageId, setHelperChatAnimatingMessageId] = React.useState('');
  const [helperChatShowLoadingHint, setHelperChatShowLoadingHint] = React.useState(false);
  const [phoneCallingContactKey, setPhoneCallingContactKey] = React.useState('');
  const helperChatTypingDelayOf = React.useCallback((text = '', nextLength = 0) => {
    const lastChar = String(text || '').charAt(Math.max(0, Number(nextLength) - 1));
    if (!lastChar) return 30;
    if (lastChar === '\n') return 140;
    if (/[.!?]/u.test(lastChar)) return 110;
    if (/[,:;]/u.test(lastChar)) return 68;
    if (/\s/u.test(lastChar)) return 30;
    return /[가-힣]/u.test(lastChar) ? 26 : 24;
  }, []);
  const clearHelperChatTypingTimer = React.useCallback(() => {
    if (helperChatTypingTimerRef.current) {
      clearTimeout(helperChatTypingTimerRef.current);
      helperChatTypingTimerRef.current = null;
    }
  }, []);
  const capturePhoneAppOrigin = React.useCallback((target) => {
    const screenRect = phoneScreenRef.current?.getBoundingClientRect?.();
    const targetRect = target?.getBoundingClientRect?.();
    if (!screenRect || !targetRect || !screenRect.width || !screenRect.height) return null;
    return {
      x: ((targetRect.left + (targetRect.width / 2)) - screenRect.left).toFixed(2),
      y: ((targetRect.top + (targetRect.height / 2)) - screenRect.top).toFixed(2),
      scaleX: (targetRect.width / screenRect.width).toFixed(4),
      scaleY: (targetRect.height / screenRect.height).toFixed(4)
    };
  }, []);
  const phoneAppTransitionStyle = phoneAppOrigin
    ? {
        '--phone-app-origin-x': `${phoneAppOrigin.x}px`,
        '--phone-app-origin-y': `${phoneAppOrigin.y}px`,
        '--phone-app-origin-scale-x': Number(phoneAppOrigin.scaleX) || 0.2,
        '--phone-app-origin-scale-y': Number(phoneAppOrigin.scaleY) || 0.2
      }
    : undefined;
  const hiddenNotificationIdSet = React.useMemo(
    () => new Set((Array.isArray(phoneNotificationHiddenIds) ? phoneNotificationHiddenIds : []).map((id) => String(id || '')).filter(Boolean)),
    [phoneNotificationHiddenIds]
  );
  const notificationSenderLabelOf = React.useCallback((entry) => {
    const sourceKey = String(entry?.source || '').trim();
    if (sourceKey && PHONE_NOTIFICATION_SENDER_LABEL[sourceKey]) {
      return PHONE_NOTIFICATION_SENDER_LABEL[sourceKey];
    }
    const fallback = String(entry?.source || entry?.title || '시스템').trim();
    return fallback || '시스템';
  }, []);
  const lockNotificationPreviewTextOf = React.useCallback((entry) => {
    const actionApp = String(entry?.actionApp || '').trim();
    const type = String(entry?.type || '').trim();
    if (actionApp === 'apple-helper-chat' || type === 'assistant' || type === 'message-outgoing') {
      return '새 메시지가 도착했습니다.';
    }
    return String(entry?.body || '').trim();
  }, []);
  const visiblePhoneNotifications = React.useMemo(
    () => (Array.isArray(phoneNotifications) ? phoneNotifications : []).filter(
      (entry) => !hiddenNotificationIdSet.has(String(entry?.id || ''))
    ),
    [hiddenNotificationIdSet, phoneNotifications]
  );
  const phoneMessageThreads = React.useMemo(() => {
    const notifications = Array.isArray(visiblePhoneNotifications) ? visiblePhoneNotifications : [];
    const contactNameByKey = new Map(helperContacts.map((contact) => [String(contact.key || ''), String(contact.name || '').trim()]));
    const threadMap = new Map();
    const helperThreadMap = appleHelperChatThreads && typeof appleHelperChatThreads === 'object'
      ? appleHelperChatThreads
      : {};
    helperContacts.forEach((contact) => {
      const contactKey = String(contact?.key || '').trim();
      if (!contactKey) return;
      const history = Array.isArray(helperThreadMap[contactKey]) ? helperThreadMap[contactKey] : [];
      if (!history.length) return;
      const latestMessage = history.length ? history[history.length - 1] : null;
      const latestMessageText = String(latestMessage?.text || '').trim();
      const latestMessageAt = Number.isFinite(Number(latestMessage?.createdAt)) ? Number(latestMessage.createdAt) : 0;
      const relatedNotifications = notifications.filter((entry) => (
        String(entry?.actionApp || '').trim() === 'apple-helper-chat'
        && String(entry?.actionContact || '').trim() === contactKey
      ));
      const latestNotification = relatedNotifications.reduce((latest, entry) => {
        const createdAt = Number.isFinite(Number(entry?.createdAt)) ? Number(entry.createdAt) : 0;
        if (!latest) return entry;
        const latestCreatedAt = Number.isFinite(Number(latest?.createdAt)) ? Number(latest.createdAt) : 0;
        return createdAt >= latestCreatedAt ? entry : latest;
      }, null);
      const latestNotificationAt = Number.isFinite(Number(latestNotification?.createdAt))
        ? Number(latestNotification.createdAt)
        : 0;
      const unreadCount = relatedNotifications.reduce((sum, entry) => sum + (entry?.read ? 0 : 1), 0);
      const notificationIds = relatedNotifications
        .map((entry) => String(entry?.id || '').trim())
        .filter(Boolean);
      const createdAt = Math.max(latestMessageAt, latestNotificationAt);
      const preview = createdAt === latestNotificationAt && String(latestNotification?.body || '').trim()
        ? String(latestNotification?.body || '').trim()
        : latestMessageText;
      const createdAtLabel = String(latestNotification?.createdAtLabel || '').trim()
        || (createdAt
          ? new Intl.DateTimeFormat('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).format(new Date(createdAt))
          : '상담 가능');
      threadMap.set(`apple-helper-chat:${contactKey}`, {
        id: `apple-helper-chat:${contactKey}`,
        actionApp: 'apple-helper-chat',
        actionContact: contactKey,
        senderLabel: String(contact?.name || '').trim() || '상담사',
        title: '',
        preview,
        createdAt,
        createdAtLabel,
        unreadCount,
        notificationIds
      });
    });
    notifications.forEach((entry) => {
      const actionApp = String(entry?.actionApp || '').trim();
      const actionContact = String(entry?.actionContact || '').trim();
      if (actionApp === 'apple-helper-chat') return;
      const senderLabel = actionApp === 'apple-helper-chat'
        ? (contactNameByKey.get(actionContact) || String(entry?.title || '').trim() || '상담원')
        : notificationSenderLabelOf(entry);
      const threadKey = actionApp === 'apple-helper-chat'
        ? `apple-helper-chat:${actionContact || 'default'}`
        : `notification:${String(senderLabel || entry?.source || entry?.title || 'system').trim()}`;
      const current = threadMap.get(threadKey);
      const createdAt = Number.isFinite(Number(entry?.createdAt)) ? Number(entry.createdAt) : 0;
      if (!current) {
        threadMap.set(threadKey, {
          id: threadKey,
          actionApp,
          actionContact,
          senderLabel,
          title: String(entry?.title || '').trim(),
          preview: String(entry?.body || '').trim(),
          createdAt,
          createdAtLabel: String(entry?.createdAtLabel || entry?.source || '').trim(),
          unreadCount: entry?.read ? 0 : 1,
          notificationIds: [String(entry?.id || '').trim()].filter(Boolean)
        });
        return;
      }
      current.notificationIds.push(String(entry?.id || '').trim());
      if (!entry?.read) current.unreadCount += 1;
      if (createdAt >= current.createdAt) {
        current.actionApp = actionApp;
        current.actionContact = actionContact;
        current.senderLabel = senderLabel;
        current.title = String(entry?.title || '').trim();
        current.preview = String(entry?.body || '').trim();
        current.createdAt = createdAt;
        current.createdAtLabel = String(entry?.createdAtLabel || entry?.source || '').trim();
      }
    });
    return Array.from(threadMap.values()).sort((a, b) => {
      if (a.createdAt !== b.createdAt) return b.createdAt - a.createdAt;
      return String(a.id || '').localeCompare(String(b.id || ''), 'ko');
    });
  }, [appleHelperChatThreads, helperContacts, notificationSenderLabelOf, visiblePhoneNotifications]);
  const phoneLockNotifications = visiblePhoneNotifications.filter((entry) => !entry?.read).slice(0, 3);
  const unreadMessageCount = Array.isArray(phoneNotifications)
    ? phoneNotifications.filter((entry) => !entry?.read && !hiddenNotificationIdSet.has(String(entry?.id || ''))).length
    : 0;
  const unreadMessageBadgeText = unreadMessageCount > 9 ? '9+' : String(unreadMessageCount || '');
  const [settingsPlayerNameDraft, setSettingsPlayerNameDraft] = React.useState(String(game?.playerName || ''));
  const [settingsPlayerNameMessage, setSettingsPlayerNameMessage] = React.useState('');
  const [settingsFarmNameDraft, setSettingsFarmNameDraft] = React.useState(String(game?.farmName || ''));
  const [settingsFarmNameMessage, setSettingsFarmNameMessage] = React.useState('');
  const [devLanguageModelPanelOpen, setDevLanguageModelPanelOpen] = React.useState(false);
  const [selectedMessageThread, setSelectedMessageThread] = React.useState(null);
  const [lockNotificationSwipeOffsetById, setLockNotificationSwipeOffsetById] = React.useState({});
  const [messageSwipeOffsetById, setMessageSwipeOffsetById] = React.useState({});
  const [removingLockNotificationId, setRemovingLockNotificationId] = React.useState('');
  const [removingMessageNotificationId, setRemovingMessageNotificationId] = React.useState('');
  const lockNotificationSwipeRef = React.useRef({
    id: '',
    pointerId: null,
    startX: 0,
    startY: 0,
    engaged: false
  });
  const messageSwipeRef = React.useRef({
    id: '',
    pointerId: null,
    startX: 0,
    startY: 0,
    engaged: false
  });
  const lockNotificationRemoveTimerRef = React.useRef(null);
  const messageRemoveTimerRef = React.useRef(null);
  const activeStreamingAssistantMessageId = React.useMemo(() => {
    if (!appleHelperChatPending || !appleHelperChatStreaming) return '';
    const messageList = Array.isArray(appleHelperChatMessages) ? appleHelperChatMessages : [];
    const lastAssistantMessage = [...messageList].reverse().find((entry) => entry?.role === 'assistant');
    return String(lastAssistantMessage?.id || '');
  }, [appleHelperChatMessages, appleHelperChatPending, appleHelperChatStreaming]);
  const visibleAppleHelperChatMessages = React.useMemo(() => {
    const messageList = Array.isArray(appleHelperChatMessages) ? appleHelperChatMessages : [];
    if (!activeStreamingAssistantMessageId) return messageList;
    return messageList.filter((entry) => String(entry?.id || '') !== activeStreamingAssistantMessageId);
  }, [activeStreamingAssistantMessageId, appleHelperChatMessages]);
  React.useEffect(() => (
    () => {
      clearHelperChatTypingTimer();
      if (helperChatLoadingHintTimerRef.current) {
        clearTimeout(helperChatLoadingHintTimerRef.current);
        helperChatLoadingHintTimerRef.current = null;
      }
      if (lockNotificationRemoveTimerRef.current) {
        clearTimeout(lockNotificationRemoveTimerRef.current);
        lockNotificationRemoveTimerRef.current = null;
      }
      if (messageRemoveTimerRef.current) {
        clearTimeout(messageRemoveTimerRef.current);
        messageRemoveTimerRef.current = null;
      }
    }
  ), [clearHelperChatTypingTimer]);
  React.useEffect(() => {
    if (phoneOpenedApp !== 'settings') return;
    setSettingsPlayerNameDraft(String(game?.playerName || ''));
    setSettingsPlayerNameMessage('');
    setSettingsFarmNameDraft(String(game?.farmName || ''));
    setSettingsFarmNameMessage('');
  }, [game?.farmName, game?.playerName, phoneOpenedApp]);
  React.useEffect(() => {
    if (helperChatLoadingHintTimerRef.current) {
      clearTimeout(helperChatLoadingHintTimerRef.current);
      helperChatLoadingHintTimerRef.current = null;
    }
    if (!appleHelperChatPending || appleHelperChatStreaming) {
      setHelperChatShowLoadingHint(false);
      return;
    }
    setHelperChatShowLoadingHint(false);
    helperChatLoadingHintTimerRef.current = setTimeout(() => {
      helperChatLoadingHintTimerRef.current = null;
      setHelperChatShowLoadingHint(true);
    }, 12000);
  }, [appleHelperChatPending, appleHelperChatStreaming]);
  React.useEffect(() => {
    if (phoneOpenedApp === 'messages') return;
    setSelectedMessageThread(null);
  }, [phoneOpenedApp]);
  const selectedMessageEntries = React.useMemo(() => {
    const threadIds = new Set(
      (Array.isArray(selectedMessageThread?.notificationIds) ? selectedMessageThread.notificationIds : [])
        .map((id) => String(id || '').trim())
        .filter(Boolean)
    );
    if (!threadIds.size) return [];
    return (Array.isArray(visiblePhoneNotifications) ? visiblePhoneNotifications : [])
      .filter((entry) => threadIds.has(String(entry?.id || '').trim()))
      .sort((a, b) => {
        const aTime = Number(entryTimeOf(a)) || 0;
        const bTime = Number(entryTimeOf(b)) || 0;
        if (aTime !== bTime) return aTime - bTime;
        return String(a?.id || '').localeCompare(String(b?.id || ''), 'ko');
      });
  }, [selectedMessageThread, visiblePhoneNotifications]);
  function entryTimeOf(entry = null) {
    const raw = Number(entry?.createdAt);
    return Number.isFinite(raw) ? raw : 0;
  }
  React.useEffect(() => {
    if (phoneOpenedApp !== 'apple-helper-chat') return;
    const node = appleHelperChatListRef.current;
    if (!node) return;
    if (!helperChatAutoScrollEnabledRef.current) return;
    node.scrollTop = node.scrollHeight;
  }, [appleHelperChatPending, helperChatRenderedTextById, phoneOpenedApp, visibleAppleHelperChatMessages]);
  React.useEffect(() => {
    if (phoneOpenedApp !== 'apple-helper-chat') return;
    helperChatAutoScrollEnabledRef.current = true;
  }, [phoneOpenedApp, activePhoneHelperContact]);
  const handleAppleHelperChatScroll = React.useCallback((event) => {
    const node = event.currentTarget;
    if (!node) return;
    const remaining = Math.max(0, node.scrollHeight - node.clientHeight - node.scrollTop);
    helperChatAutoScrollEnabledRef.current = remaining <= 36;
  }, []);
  const renderHelperChatAssistantText = React.useCallback((messageId, text) => {
    const resolvedText = String(text || '');
    if (!resolvedText) return '';
    const chars = Array.from(resolvedText);
    const isAnimating = String(helperChatAnimatingMessageId || '') === String(messageId || '');
    const latestIndex = chars.length - 1;
    return chars.map((char, index) => (
      <span
        key={`${messageId || 'assistant'}-${index}`}
        className={isAnimating && index === latestIndex ? 'phone-galaxy-helper-chat__char is-entering' : 'phone-galaxy-helper-chat__char'}
      >
        {char}
      </span>
    ));
  }, [helperChatAnimatingMessageId]);
  React.useEffect(() => {
    const visibleMessages = Array.isArray(visibleAppleHelperChatMessages) ? visibleAppleHelperChatMessages : [];
    const streamingAssistantId = String(activeStreamingAssistantMessageId || '');
    const latestVisibleMessage = visibleMessages.length ? visibleMessages[visibleMessages.length - 1] : null;
    const latestAssistantEntry = [...visibleMessages].reverse().find((entry) => entry?.role === 'assistant') || null;
    const latestAssistantId = String(latestAssistantEntry?.id || '');
    const previousVisibleCount = Math.max(0, Number(helperChatPrevVisibleMessageCountRef.current) || 0);
    const previousLastAssistantId = String(helperChatPrevLastAssistantIdRef.current || '');
    const syncRenderedTexts = (preservedMessageId = '') => {
      setHelperChatRenderedTextById((prev) => {
        const next = {};
        visibleMessages.forEach((entry) => {
          const entryId = String(entry?.id || '');
          if (!entryId) return;
          if (entry?.role === 'assistant' && preservedMessageId && preservedMessageId === entryId) {
            next[entryId] = String(prev?.[entryId] || '');
            return;
          }
          next[entryId] = String(entry?.text || '');
        });
        return next;
      });
    };

    if (!visibleMessages.length) {
      clearHelperChatTypingTimer();
      helperChatPrevStreamingAssistantIdRef.current = streamingAssistantId;
      helperChatPrevVisibleMessageCountRef.current = 0;
      helperChatPrevLastAssistantIdRef.current = '';
      setHelperChatAnimatingMessageId('');
      setHelperChatRenderedTextById({});
      return;
    }

    if (streamingAssistantId) {
      clearHelperChatTypingTimer();
      helperChatPrevStreamingAssistantIdRef.current = streamingAssistantId;
      helperChatPrevVisibleMessageCountRef.current = visibleMessages.length;
      helperChatPrevLastAssistantIdRef.current = latestAssistantId;
      setHelperChatAnimatingMessageId('');
      syncRenderedTexts();
      return;
    }

    const completedAssistantId = String(helperChatPrevStreamingAssistantIdRef.current || '');
    helperChatPrevStreamingAssistantIdRef.current = '';

    const completedAssistantEntry = completedAssistantId
      ? visibleMessages.find((entry) => entry?.role === 'assistant' && String(entry?.id || '') === completedAssistantId)
      : null;
    const shouldAnimateFreshAssistant = (
      !completedAssistantEntry?.text
      && previousVisibleCount > 0
      && visibleMessages.length > previousVisibleCount
      && latestVisibleMessage?.role === 'assistant'
      && latestAssistantEntry?.text
      && latestAssistantId
      && latestAssistantId !== previousLastAssistantId
    );

    if (!completedAssistantEntry?.text && !shouldAnimateFreshAssistant) {
      clearHelperChatTypingTimer();
      setHelperChatAnimatingMessageId('');
      helperChatPrevVisibleMessageCountRef.current = visibleMessages.length;
      helperChatPrevLastAssistantIdRef.current = latestAssistantId;
      syncRenderedTexts();
      return;
    }

    clearHelperChatTypingTimer();
    const targetEntry = completedAssistantEntry?.text ? completedAssistantEntry : latestAssistantEntry;
    const targetMessageId = String(targetEntry?.id || '');
    const targetText = String(targetEntry?.text || '');
    helperChatPrevVisibleMessageCountRef.current = visibleMessages.length;
    helperChatPrevLastAssistantIdRef.current = latestAssistantId;
    setHelperChatAnimatingMessageId(targetMessageId);
    setHelperChatRenderedTextById((prev) => {
      const next = {};
      visibleMessages.forEach((entry) => {
        const entryId = String(entry?.id || '');
        if (!entryId) return;
        if (entry?.role === 'assistant' && entryId === targetMessageId) {
          next[entryId] = '';
          return;
        }
        next[entryId] = String(prev?.[entryId] || entry?.text || '');
      });
      return next;
    });

    const stepTyping = () => {
      let finished = false;
      let nextDelay = 20;
      setHelperChatRenderedTextById((prev) => {
        const currentText = String(prev?.[targetMessageId] || '');
        if (currentText.length >= targetText.length) {
          finished = true;
          return prev;
        }
        const nextText = targetText.slice(0, currentText.length + 1);
        nextDelay = helperChatTypingDelayOf(targetText, nextText.length);
        if (nextText.length >= targetText.length) {
          finished = true;
        }
        return {
          ...prev,
          [targetMessageId]: nextText
        };
      });
      if (finished) {
        setHelperChatAnimatingMessageId('');
        clearHelperChatTypingTimer();
        return;
      }
      helperChatTypingTimerRef.current = setTimeout(stepTyping, nextDelay);
    };

    helperChatTypingTimerRef.current = setTimeout(stepTyping, 32);

    return () => {
      clearHelperChatTypingTimer();
      setHelperChatAnimatingMessageId('');
    };
  }, [
    activeStreamingAssistantMessageId,
    clearHelperChatTypingTimer,
    helperChatTypingDelayOf,
    visibleAppleHelperChatMessages
  ]);
  const scheduleLockNotificationRemoval = React.useCallback((id) => {
    const targetId = String(id || '');
    if (!targetId) return;
    setRemovingLockNotificationId(targetId);
    if (lockNotificationRemoveTimerRef.current) {
      clearTimeout(lockNotificationRemoveTimerRef.current);
    }
    lockNotificationRemoveTimerRef.current = setTimeout(() => {
      removePhoneNotifications?.([targetId]);
      setLockNotificationSwipeOffsetById((prev) => {
        const next = { ...prev };
        delete next[targetId];
        return next;
      });
      setRemovingLockNotificationId((current) => (current === targetId ? '' : current));
      lockNotificationRemoveTimerRef.current = null;
    }, 180);
  }, [removePhoneNotifications]);
  const scheduleMessageRemoval = React.useCallback((id, notificationIds = []) => {
    const targetId = String(id || '');
    const targetNotificationIds = Array.isArray(notificationIds)
      ? notificationIds.map((entryId) => String(entryId || '').trim()).filter(Boolean)
      : [];
    if (!targetId) return;
    setRemovingMessageNotificationId(targetId);
    if (messageRemoveTimerRef.current) {
      clearTimeout(messageRemoveTimerRef.current);
    }
    messageRemoveTimerRef.current = setTimeout(() => {
      removePhoneNotifications?.(targetNotificationIds.length ? targetNotificationIds : [targetId]);
      setMessageSwipeOffsetById((prev) => {
        const next = { ...prev };
        delete next[targetId];
        return next;
      });
      setRemovingMessageNotificationId((current) => (current === targetId ? '' : current));
      messageRemoveTimerRef.current = null;
    }, 180);
  }, [removePhoneNotifications]);
  const resetLockNotificationSwipe = React.useCallback((id) => {
    const targetId = String(id || '');
    setLockNotificationSwipeOffsetById((prev) => {
      if (!(targetId in prev)) return prev;
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
  }, []);
  const resetMessageSwipe = React.useCallback((id) => {
    const targetId = String(id || '');
    setMessageSwipeOffsetById((prev) => {
      if (!(targetId in prev)) return prev;
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
  }, []);
  const handleLockNotificationPointerDown = React.useCallback((event, id) => {
    event.stopPropagation();
    lockNotificationSwipeRef.current = {
      id: String(id || ''),
      pointerId: event.pointerId,
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      engaged: false
    };
    event.currentTarget?.setPointerCapture?.(event.pointerId);
  }, []);
  const handleLockNotificationPointerMove = React.useCallback((event, id) => {
    const drag = lockNotificationSwipeRef.current;
    const targetId = String(id || '');
    if (drag.id !== targetId || drag.pointerId !== event.pointerId) return;
    event.stopPropagation();
    const deltaX = (Number(event.clientX) || 0) - drag.startX;
    const deltaY = Math.abs((Number(event.clientY) || 0) - drag.startY);
    const engaged = drag.engaged || (deltaX < -8 && Math.abs(deltaX) > (deltaY * 1.15));
    lockNotificationSwipeRef.current = { ...drag, engaged };
    if (!engaged) return;
    setLockNotificationSwipeOffsetById((prev) => ({
      ...prev,
      [targetId]: Math.max(-96, Math.min(0, deltaX))
    }));
  }, []);
  const handleLockNotificationPointerUp = React.useCallback((event, id) => {
    const drag = lockNotificationSwipeRef.current;
    const targetId = String(id || '');
    if (drag.id !== targetId || drag.pointerId !== event.pointerId) return;
    event.stopPropagation();
    const finalOffset = Number(lockNotificationSwipeOffsetById[targetId] || 0);
    if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    lockNotificationSwipeRef.current = {
      id: '',
      pointerId: null,
      startX: 0,
      startY: 0,
      engaged: false
    };
    if (finalOffset <= PHONE_NOTIFICATION_DELETE_THRESHOLD) {
      scheduleLockNotificationRemoval(targetId);
      return;
    }
    resetLockNotificationSwipe(targetId);
  }, [PHONE_NOTIFICATION_DELETE_THRESHOLD, lockNotificationSwipeOffsetById, resetLockNotificationSwipe, scheduleLockNotificationRemoval]);
  const handleMessagePointerDown = React.useCallback((event, id) => {
    messageSwipeRef.current = {
      id: String(id || ''),
      pointerId: event.pointerId,
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      engaged: false
    };
    event.currentTarget?.setPointerCapture?.(event.pointerId);
  }, []);
  const handleMessagePointerMove = React.useCallback((event, id) => {
    const drag = messageSwipeRef.current;
    const targetId = String(id || '');
    if (drag.id !== targetId || drag.pointerId !== event.pointerId) return;
    const deltaX = (Number(event.clientX) || 0) - drag.startX;
    const deltaY = Math.abs((Number(event.clientY) || 0) - drag.startY);
    const engaged = drag.engaged || (deltaX < -8 && Math.abs(deltaX) > (deltaY * 1.15));
    messageSwipeRef.current = { ...drag, engaged };
    if (!engaged) return;
    setMessageSwipeOffsetById((prev) => ({
      ...prev,
      [targetId]: Math.max(-96, Math.min(0, deltaX))
    }));
  }, []);
  function openPhoneMessageThread(thread = null) {
    const threadIds = Array.isArray(thread?.notificationIds) ? thread.notificationIds : [];
    if (threadIds.length) {
      markPhoneNotificationsRead?.(threadIds);
    }
    if (String(thread?.actionApp || '').trim() === 'apple-helper-chat') {
      openPhoneNotificationTarget({
        actionApp: thread?.actionApp,
        actionContact: thread?.actionContact
      });
      return;
    }
    setSelectedMessageThread(thread || null);
  }
  function closePhoneMessageThread() {
    setSelectedMessageThread(null);
  }
  const handleMessagePointerUp = React.useCallback((event, id, notificationIds = [], thread = null) => {
    const drag = messageSwipeRef.current;
    const targetId = String(id || '');
    if (drag.id !== targetId || drag.pointerId !== event.pointerId) return;
    const finalOffset = Number(messageSwipeOffsetById[targetId] || 0);
    const wasEngaged = Boolean(drag.engaged);
    if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    messageSwipeRef.current = {
      id: '',
      pointerId: null,
      startX: 0,
      startY: 0,
      engaged: false
    };
    if (finalOffset <= PHONE_NOTIFICATION_DELETE_THRESHOLD) {
      scheduleMessageRemoval(targetId, notificationIds);
      return;
    }
    if (!wasEngaged) {
      resetMessageSwipe(targetId);
      openPhoneMessageThread(thread);
      return;
    }
    resetMessageSwipe(targetId);
  }, [PHONE_NOTIFICATION_DELETE_THRESHOLD, messageSwipeOffsetById, resetMessageSwipe, scheduleMessageRemoval]);
  const phoneHomeSourceApps = React.useMemo(() => (
    Array.isArray(phoneHomeApps) && phoneHomeApps.length ? phoneHomeApps : PHONE_HOME_APPS
  ), [phoneHomeApps]);
  const phoneHomeSourceOrderKeys = React.useMemo(() => (
    phoneHomeSourceApps.map(([, key]) => String(key || '').trim()).filter(Boolean)
  ), [phoneHomeSourceApps]);
  const phoneHomeAppMap = React.useMemo(() => {
    const next = new Map();
    phoneHomeSourceApps.forEach((app) => {
      const key = String(app?.[1] || '').trim();
      if (!key) return;
      next.set(key, app);
    });
    return next;
  }, [phoneHomeSourceApps]);
  const phoneRecentAppMap = React.useMemo(() => {
    const next = new Map();
    phoneHomeSourceApps.forEach((app) => {
      const key = String(app?.[1] || '').trim();
      if (key) next.set(key, app);
    });
    Object.values(PHONE_RECENT_EXTRA_APP_META).forEach((app) => {
      const key = String(app?.[1] || '').trim();
      if (key) next.set(key, app);
    });
    if (String(phonePlaceholderApp?.label || '').trim()) {
      next.set('placeholder', [
        String(phonePlaceholderApp.label || '앱').trim() || '앱',
        'placeholder',
        '📱'
      ]);
    }
    const currentContactName = String(
      helperContacts.find((contact) => contact.key === String(activePhoneHelperContact || '').trim())?.name
      || defaultHelperContact.name
      || ''
    ).trim();
    if (currentContactName) {
      next.set('apple-helper-chat', [currentContactName, 'apple-helper-chat', '🍎']);
    }
    return next;
  }, [activePhoneHelperContact, defaultHelperContact.name, helperContacts, phoneHomeSourceApps, phonePlaceholderApp?.label]);
  const phoneRecentApps = React.useMemo(() => (
    phoneRecentAppKeys
      .map((key) => phoneRecentAppMap.get(key) || null)
      .filter(Boolean)
  ), [phoneRecentAppKeys, phoneRecentAppMap]);
  React.useEffect(() => {
    const appKey = String(phoneOpenedApp || '').trim();
    if (!appKey || !phoneUnlocked || !quickDrawerOpen) return;
    setPhoneRecentViewOpen(false);
    setPhoneRecentActiveIndex(0);
    setPhoneRecentFlowDragX(0);
    setPhoneRecentAppKeys((prev) => [
      appKey,
      ...prev.filter((key) => key !== appKey)
    ].slice(0, PHONE_RECENT_APP_LIMIT));
  }, [phoneOpenedApp, phoneUnlocked, quickDrawerOpen]);
  React.useEffect(() => {
    setPhoneRecentActiveIndex((prev) => Math.max(0, Math.min(prev, Math.max(0, phoneRecentApps.length - 1))));
  }, [phoneRecentApps.length]);
  React.useEffect(() => {
    if (phoneUnlocked && quickDrawerOpen) return;
    setPhoneRecentViewOpen(false);
    setPhoneRecentFlowDragX(0);
  }, [phoneUnlocked, quickDrawerOpen]);
  React.useEffect(() => {
    if (phoneHomeDragRef.current.active) return;
    setPhoneHomeDragOrderKeys(phoneHomeSourceOrderKeys);
  }, [phoneHomeSourceOrderKeys]);
  const clearPhoneHomeLongPressTimer = React.useCallback(() => {
    if (phoneHomeLongPressTimerRef.current) {
      clearTimeout(phoneHomeLongPressTimerRef.current);
      phoneHomeLongPressTimerRef.current = null;
    }
  }, []);
  const finishPhoneHomeReorder = React.useCallback((pointerId = null, currentTarget = null) => {
    clearPhoneHomeLongPressTimer();
    const drag = phoneHomeDragRef.current;
    if (pointerId !== null && drag.pointerId !== null && drag.pointerId !== pointerId) return;
    if (currentTarget?.hasPointerCapture?.(drag.pointerId)) {
      try {
        currentTarget.releasePointerCapture(drag.pointerId);
      } catch {}
    }
    if (drag.active) {
      const currentOrder = phoneHomeSourceOrderKeys;
      const nextOrder = phoneHomeDragOrderKeys;
      const changed = currentOrder.length === nextOrder.length
        ? currentOrder.some((key, index) => key !== nextOrder[index])
        : true;
      if (changed) savePhoneHomeAppOrder?.(nextOrder);
      phoneHomeSuppressClickRef.current = true;
    }
    phoneHomeDragRef.current = {
      active: false,
      pointerId: null,
      appKey: '',
      moved: false,
      startX: 0,
      startY: 0,
    };
    setPhoneHomeDraggingAppKey('');
    setPhoneHomeReorderMode(false);
  }, [clearPhoneHomeLongPressTimer, phoneHomeDragOrderKeys, phoneHomeSourceOrderKeys, savePhoneHomeAppOrder]);
  React.useEffect(() => () => {
    clearPhoneHomeLongPressTimer();
  }, [clearPhoneHomeLongPressTimer]);
  const handlePhoneHomeAppPointerDown = React.useCallback((event, appKey) => {
    const normalizedKey = String(appKey || '').trim();
    if (!normalizedKey) return;
    const targetEl = event.currentTarget;
    const pointerId = event.pointerId;
    const startX = Number(event.clientX) || 0;
    const startY = Number(event.clientY) || 0;
    clearPhoneHomeLongPressTimer();
    phoneHomeSuppressClickRef.current = false;
    phoneHomeDragRef.current = {
      active: false,
      pointerId,
      appKey: normalizedKey,
      moved: false,
      startX,
      startY,
    };
    phoneHomeLongPressTimerRef.current = setTimeout(() => {
      phoneHomeLongPressTimerRef.current = null;
      phoneHomeDragRef.current = {
        active: true,
        pointerId,
        appKey: normalizedKey,
        moved: false,
        startX,
        startY,
      };
      setPhoneHomeDragOrderKeys((prev) => (
        prev.length ? prev : phoneHomeSourceOrderKeys
      ));
      setPhoneHomeDraggingAppKey(normalizedKey);
      setPhoneHomeReorderMode(true);
      try {
        targetEl?.setPointerCapture?.(pointerId);
      } catch {}
    }, PHONE_HOME_APP_LONG_PRESS_MS);
  }, [clearPhoneHomeLongPressTimer, phoneHomeSourceOrderKeys]);
  const handlePhoneHomeAppPointerMove = React.useCallback((event) => {
    const drag = phoneHomeDragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    if (!drag.active) {
      const deltaX = Math.abs((Number(event.clientX) || 0) - drag.startX);
      const deltaY = Math.abs((Number(event.clientY) || 0) - drag.startY);
      if (deltaX > 8 || deltaY > 8) clearPhoneHomeLongPressTimer();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const hoveredEl = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('[data-phone-home-app-key]');
    const hoveredKey = String(hoveredEl?.getAttribute?.('data-phone-home-app-key') || '').trim();
    if (!hoveredKey || hoveredKey === drag.appKey) return;
    drag.moved = true;
    setPhoneHomeDragOrderKeys((prev) => reorderPhoneHomeAppKeys(prev, drag.appKey, hoveredKey));
  }, [clearPhoneHomeLongPressTimer]);
  const handlePhoneHomeAppPointerUp = React.useCallback((event) => {
    finishPhoneHomeReorder(event.pointerId, event.currentTarget);
  }, [finishPhoneHomeReorder]);
  const handlePhoneHomeAppPointerCancel = React.useCallback((event) => {
    finishPhoneHomeReorder(event.pointerId, event.currentTarget);
  }, [finishPhoneHomeReorder]);
  const handlePhoneHomeAppClick = React.useCallback((event, app) => {
    if (phoneHomeSuppressClickRef.current || phoneHomeReorderMode) {
      phoneHomeSuppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const [, key] = app;
    const appPressKey = `home:${key}`;
    const origin = capturePhoneAppOrigin(event.currentTarget);
    if (key === 'bank') {
      runPhonePressAction(appPressKey, () => {
        setPhoneBankTab('summary');
        openPhoneApp('bank', origin);
      });
      return;
    }
    if (key === 'weather') {
      runPhonePressAction(appPressKey, () => openPhoneApp('weather', origin));
      return;
    }
    if (key === 'calendar') {
      runPhonePressAction(appPressKey, () => openPhoneApp('calendar', origin));
      return;
    }
    if (key === 'labor') {
      runPhonePressAction(appPressKey, () => openPhoneApp('labor', origin));
      return;
    }
    if (key === 'health') {
      runPhonePressAction(appPressKey, () => openPhoneApp('health', origin));
      return;
    }
    if (key === 'land') {
      runPhonePressAction(appPressKey, () => openPhoneApp('land', origin));
      return;
    }
    if (key === 'settings') {
      runPhonePressAction(appPressKey, () => openPhoneApp('settings', origin));
      return;
    }
    runPhonePressAction(appPressKey, () => {
      setPhonePlaceholderApp({
        key: String(key || '').trim(),
        label: String(app?.[0] || '앱').trim() || '앱'
      });
      openPhoneApp('placeholder', origin);
    });
  }, [capturePhoneAppOrigin, openPhoneApp, phoneHomeReorderMode, runPhonePressAction]);
  const renderedPhoneHomeApps = React.useMemo(() => (
    phoneHomeDragOrderKeys
      .map((key) => phoneHomeAppMap.get(key) || null)
      .filter(Boolean)
  ), [phoneHomeAppMap, phoneHomeDragOrderKeys]);
  const phoneHomeDisplayApps = React.useMemo(() => {
    const preferredKeys = ['bank', 'dealer', 'weather', 'farmer24', 'baemin', 'map', 'land', 'machinery', 'labor', 'auction', 'calendar', 'settings', 'health'];
    const preferredIndexByKey = new Map(preferredKeys.map((key, index) => [key, index]));
    return [...renderedPhoneHomeApps].sort((left, right) => {
      const leftKey = String(left?.[1] || '').trim();
      const rightKey = String(right?.[1] || '').trim();
      const leftPreferredIndex = preferredIndexByKey.has(leftKey) ? preferredIndexByKey.get(leftKey) : Number.MAX_SAFE_INTEGER;
      const rightPreferredIndex = preferredIndexByKey.has(rightKey) ? preferredIndexByKey.get(rightKey) : Number.MAX_SAFE_INTEGER;
      if (leftPreferredIndex !== rightPreferredIndex) return leftPreferredIndex - rightPreferredIndex;
      return renderedPhoneHomeApps.indexOf(left) - renderedPhoneHomeApps.indexOf(right);
    });
  }, [renderedPhoneHomeApps]);
  const renderPhoneRecentPreview = React.useCallback((appKey, label, emoji) => {
    const key = String(appKey || '').trim();
    const appLabel = String(label || '앱').trim() || '앱';
    const appEmoji = String(emoji || '📱').trim() || '📱';
    if (key === 'bank') {
      const latestLog = phoneWalletLogs[0] || null;
      return (
        <span className="phone-galaxy-recents__screen phone-galaxy-recents__screen--bank">
          <span className="phone-galaxy-recents__screen-head">
            <span>은행</span>
            <b>{phoneMoneyText}</b>
          </span>
          <span className="phone-galaxy-recents__screen-card">
            <em>농장 잔액</em>
            <strong>{phoneMoneyText}</strong>
          </span>
          <span className="phone-galaxy-recents__screen-list">
            <i />
            <span>{latestLog ? String(latestLog?.label || latestLog?.title || '최근 거래') : '최근 거래 없음'}</span>
          </span>
        </span>
      );
    }
    if (key === 'weather') {
      return (
        <span className="phone-galaxy-recents__screen phone-galaxy-recents__screen--weather">
          <span className="phone-galaxy-recents__screen-head">
            <span>날씨</span>
            <b>{phoneWeatherText}</b>
          </span>
          <span className="phone-galaxy-recents__screen-weather-icon">{weatherIconOf?.(game?.weather) || '🌤️'}</span>
          <span className="phone-galaxy-recents__screen-copy">{phoneWeatherDescText}</span>
        </span>
      );
    }
    if (key === 'calendar') {
      const todayEvents = phoneCalendarEventsByDate[phoneCalendarTodayKey] || [];
      return (
        <span className="phone-galaxy-recents__screen phone-galaxy-recents__screen--calendar">
          <span className="phone-galaxy-recents__screen-head">
            <span>캘린더</span>
            <b>{phoneCalendarMonthLabel}</b>
          </span>
          <span className="phone-galaxy-recents__calendar-grid">
            {phoneCalendarCells.slice(0, 14).map((cell) => (
              <i
                key={`recent-calendar-${cell.key}`}
                className={`${cell.isToday ? 'is-today' : ''} ${cell.events.length ? 'has-event' : ''}`.trim()}
              />
            ))}
          </span>
          <span className="phone-galaxy-recents__screen-copy">
            {todayEvents.length ? todayEvents[0].title : '오늘 일정 없음'}
          </span>
        </span>
      );
    }
    if (key === 'health') {
      return (
        <span className="phone-galaxy-recents__screen phone-galaxy-recents__screen--health">
          <span className="phone-galaxy-recents__screen-head">
            <span>건강</span>
            <b>{`${Math.round(Number(phoneHealthGaugeValue) || 0)}/100`}</b>
          </span>
          <span className="phone-galaxy-recents__ring" style={{ '--recent-ring-value': `${Math.max(0, Math.min(100, Number(phoneHealthGaugeValue) || 0))}%` }}>
            <strong>{Math.round(Number(phoneHealthGaugeValue) || 0)}</strong>
          </span>
          <span className="phone-galaxy-recents__screen-copy">현재 컨디션</span>
        </span>
      );
    }
    if (key === 'messages' || key === 'apple-helper-chat') {
      const latestThread = phoneMessageThreads[0] || null;
      return (
        <span className="phone-galaxy-recents__screen phone-galaxy-recents__screen--messages">
          <span className="phone-galaxy-recents__screen-head">
            <span>{key === 'messages' ? '문자' : appLabel}</span>
            <b>{unreadMessageCount > 0 ? `${unreadMessageCount}개` : '읽음'}</b>
          </span>
          <span className="phone-galaxy-recents__bubble">
            {latestThread ? String(latestThread.preview || latestThread.senderLabel || '새 메시지') : '새 메시지 없음'}
          </span>
          <span className="phone-galaxy-recents__screen-copy">{latestThread?.senderLabel || '메시지'}</span>
        </span>
      );
    }
    if (key === 'land') {
      const currentLand = phoneOwnedLandRows.find((row) => row.fieldIndex === Number(game?.selectedField)) || phoneOwnedLandRows[0] || null;
      return (
        <span className="phone-galaxy-recents__screen phone-galaxy-recents__screen--land">
          <span className="phone-galaxy-recents__screen-head">
            <span>농지</span>
            <b>{phoneOwnedLandRows.length}필지</b>
          </span>
          <span className="phone-galaxy-recents__field-lines">
            <i />
            <i />
            <i />
          </span>
          <span className="phone-galaxy-recents__screen-copy">{currentLand?.name || '소유 농지 없음'}</span>
        </span>
      );
    }
    return (
      <span className="phone-galaxy-recents__screen phone-galaxy-recents__screen--generic">
        <span className="phone-galaxy-recents__generic-icon">{appEmoji}</span>
        <span className="phone-galaxy-recents__screen-copy">{appLabel}</span>
      </span>
    );
  }, [
    game?.selectedField,
    game?.weather,
    phoneCalendarCells,
    phoneCalendarEventsByDate,
    phoneCalendarMonthLabel,
    phoneCalendarTodayKey,
    phoneHealthGaugeValue,
    phoneMessageThreads,
    phoneMoneyText,
    phoneOwnedLandRows,
    phoneWalletLogs,
    phoneWeatherDescText,
    phoneWeatherText,
    unreadMessageCount,
    weatherIconOf
  ]);
  const openPhoneRecentApp = React.useCallback((appKey) => {
    const key = String(appKey || '').trim();
    if (!key) return;
    setPhoneRecentViewOpen(false);
    if (key === 'bank') {
      setPhoneBankTab('summary');
      openPhoneApp('bank');
      return;
    }
    if (key === 'messages') {
      openPhoneMessagesApp();
      return;
    }
    if (key === 'apple-helper-chat') {
      openPhoneHelperChatApp(String(activePhoneHelperContact || defaultHelperContact.key || 'apple-helper'));
      return;
    }
    if (key === 'placeholder') {
      openPhoneApp('placeholder');
      return;
    }
    openPhoneApp(key);
  }, [activePhoneHelperContact, defaultHelperContact.key, openPhoneApp, openPhoneHelperChatApp, openPhoneMessagesApp]);
  const dismissPhoneRecentApp = React.useCallback((appKey) => {
    const key = String(appKey || '').trim();
    if (!key) return;
    setPhoneRecentAppKeys((prev) => prev.filter((entry) => entry !== key));
    setPhoneRecentDismissOffsetByKey((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (String(phoneOpenedApp || '').trim() === key) closePhoneApp();
  }, [closePhoneApp, phoneOpenedApp]);
  const handlePhoneRecentPointerDown = React.useCallback((event, appKey) => {
    const key = String(appKey || '').trim();
    if (!key) return;
    phoneRecentDismissRef.current = {
      active: true,
      pointerId: event.pointerId,
      appKey: key,
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      offsetX: 0,
      offsetY: 0,
      engaged: false,
      mode: ''
    };
    try {
      event.currentTarget?.setPointerCapture?.(event.pointerId);
    } catch {}
  }, []);
  const handlePhoneRecentPointerMove = React.useCallback((event) => {
    const drag = phoneRecentDismissRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const currentX = Number(event.clientX) || 0;
    const currentY = Number(event.clientY) || 0;
    const deltaX = currentX - drag.startX;
    const deltaY = Math.min(0, currentY - drag.startY);
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const nextMode = drag.mode
      || (deltaY <= -10 && absDeltaY > absDeltaX * 1.1 ? 'dismiss' : '')
      || (absDeltaX >= 12 && absDeltaX > absDeltaY * 1.15 ? 'side' : '');
    const engaged = drag.engaged || Boolean(nextMode);
    phoneRecentDismissRef.current = {
      ...drag,
      offsetX: deltaX,
      offsetY: deltaY,
      engaged,
      mode: nextMode
    };
    if (!engaged) return;
    event.preventDefault();
    event.stopPropagation();
    if (nextMode === 'side') {
      setPhoneRecentFlowDragX(Math.max(-96, Math.min(96, deltaX)));
      return;
    }
    if (nextMode === 'dismiss') {
      setPhoneRecentDismissOffsetByKey((prev) => ({
        ...prev,
        [drag.appKey]: Math.max(-128, deltaY)
      }));
    }
  }, []);
  const finishPhoneRecentPointer = React.useCallback((event) => {
    const drag = phoneRecentDismissRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const shouldDismiss = drag.mode === 'dismiss' && drag.offsetY <= PHONE_RECENT_DISMISS_THRESHOLD;
    const shouldMoveSide = drag.mode === 'side' && Math.abs(drag.offsetX) >= PHONE_RECENT_SIDE_SWIPE_THRESHOLD;
    const sideDirection = drag.offsetX < 0 ? 1 : -1;
    phoneRecentDismissRef.current = {
      active: false,
      pointerId: null,
      appKey: '',
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      engaged: false,
      mode: ''
    };
    try {
      event.currentTarget?.releasePointerCapture?.(event.pointerId);
    } catch {}
    if (shouldDismiss) {
      phoneRecentSuppressClickRef.current = true;
      dismissPhoneRecentApp(drag.appKey);
      return;
    }
    if (drag.engaged) phoneRecentSuppressClickRef.current = true;
    if (shouldMoveSide) {
      setPhoneRecentActiveIndex((prev) => Math.max(0, Math.min(phoneRecentApps.length - 1, prev + sideDirection)));
    }
    setPhoneRecentFlowDragX(0);
    setPhoneRecentDismissOffsetByKey((prev) => ({
      ...prev,
      [drag.appKey]: 0
    }));
  }, [dismissPhoneRecentApp, phoneRecentApps.length]);
  const togglePhoneRecentView = React.useCallback(() => {
    setPhoneRecentFlowDragX(0);
    setPhoneRecentViewOpen((prev) => !prev);
  }, []);
  const closePhoneRecentOrApp = React.useCallback(() => {
    if (phoneRecentViewOpen) {
      setPhoneRecentViewOpen(false);
      return;
    }
    closePhoneApp();
  }, [closePhoneApp, phoneRecentViewOpen]);
  const currentHelperContact = helperContacts.find((entry) => entry.key === String(activePhoneHelperContact || '').trim())
    || (currentPhoneHelperContact ? {
      key: String(activePhoneHelperContact || defaultHelperContact.key),
      name: String(currentPhoneHelperContact?.name || defaultHelperContact.name),
      subtitle: String(currentPhoneHelperContact?.subtitle || defaultHelperContact.subtitle),
      avatarText: String(currentPhoneHelperContact?.avatarText || defaultHelperContact.avatarText),
      avatarToneClass: String(currentPhoneHelperContact?.avatarToneClass || defaultHelperContact.avatarToneClass),
      avatarImage: String(currentPhoneHelperContact?.avatarImage || defaultHelperContact.avatarImage || ''),
      introText: String(currentPhoneHelperContact?.introText || defaultHelperContact.introText),
      placeholder: String(currentPhoneHelperContact?.placeholder || defaultHelperContact.placeholder),
      quickPrompts: Array.isArray(currentPhoneHelperContact?.quickPrompts) ? currentPhoneHelperContact.quickPrompts : defaultHelperContact.quickPrompts
    } : defaultHelperContact);
  const currentCallingContact = helperContacts.find((entry) => entry.key === String(phoneCallingContactKey || '').trim())
    || currentHelperContact
    || defaultHelperContact;
  const openPhoneHelperContact = React.useCallback((contactKey, event) => {
    const origin = capturePhoneAppOrigin(event.currentTarget);
    openPhoneHelperChatApp(contactKey, origin);
  }, [capturePhoneAppOrigin, openPhoneHelperChatApp]);
  const openPhoneHelperCall = React.useCallback((contactKey, event) => {
    event.stopPropagation();
    const origin = capturePhoneAppOrigin(event.currentTarget);
    setPhoneCallingContactKey(String(contactKey || ''));
    openPhoneApp('phone-call', origin);
  }, [capturePhoneAppOrigin, openPhoneApp]);
  const renderHelperAvatar = React.useCallback((contact, className) => {
    const avatarImage = String(contact?.avatarImage || '').trim();
    if (avatarImage) {
      return (
        <div className={`${className} is-image-avatar ${contact?.avatarToneClass || ''}`.trim()}>
          <img src={avatarImage} alt="" />
        </div>
      );
    }
    return (
      <div className={`${className} ${contact?.avatarToneClass || ''}`.trim()}>
        {contact?.avatarText}
      </div>
    );
  }, []);
  const openPhoneHelperText = React.useCallback((contactKey, event) => {
    event.stopPropagation();
    const origin = capturePhoneAppOrigin(event.currentTarget);
    openPhoneHelperChatApp(contactKey, origin);
  }, [capturePhoneAppOrigin, openPhoneHelperChatApp]);
  const openPhoneNotificationTarget = React.useCallback((entry = null) => {
    const actionApp = String(entry?.actionApp || '').trim();
    const actionContact = String(entry?.actionContact || '').trim();
    if (actionApp === 'apple-helper-chat') {
      openPhoneHelperChatApp(actionContact || defaultHelperContact.key);
      return;
    }
    openPhoneMessagesApp();
  }, [defaultHelperContact.key, openPhoneHelperChatApp, openPhoneMessagesApp]);
  const handleAppleHelperChatSubmit = React.useCallback(async () => {
    await sendAppleHelperChatMessage?.(appleHelperChatDraft);
  }, [appleHelperChatDraft, sendAppleHelperChatMessage]);
  const showLaborPendingConfirmActions = (
    String(currentHelperContact?.key || '').trim() === 'labor-helper'
    && Boolean(phoneHelperPendingLaborRequest?.awaitingConfirmation)
  );
  const payableLaborRentRow = React.useMemo(() => (
    Array.isArray(phoneCrewRentRows)
      ? phoneCrewRentRows.find((row) => Boolean(row?.canPayApproved)) || null
      : null
  ), [phoneCrewRentRows]);
  const showLaborPendingPaymentAction = (
    String(currentHelperContact?.key || '').trim() === 'labor-helper'
    && !showLaborPendingConfirmActions
    && Boolean(payableLaborRentRow)
  );
  const handleLaborPendingConfirmAction = React.useCallback(async (actionText) => {
    if (!actionText) return;
    await sendAppleHelperChatMessage?.(actionText);
  }, [sendAppleHelperChatMessage]);
  React.useEffect(() => {
    const wasPending = previousAppleHelperChatPendingRef.current;
    previousAppleHelperChatPendingRef.current = appleHelperChatPending;
    if (!wasPending || appleHelperChatPending) return;
    if (phoneOpenedApp !== 'apple-helper-chat') return;
    requestAnimationFrame(() => {
      appleHelperChatInputRef.current?.focus?.();
    });
  }, [appleHelperChatPending, phoneOpenedApp]);
  const handlePhoneAppEdgePointerDown = React.useCallback((event) => {
    if (!phoneHasOpenApp) return;
    const target = event.target;
    if (
      target instanceof Element
      && target.closest('button, input, textarea, select, label, [role="button"]')
    ) {
      return;
    }
    if (
      target instanceof Element
      && target.closest('.phone-galaxy-helper-chat__list, .phone-galaxy-helper-chat__bubble')
    ) {
      return;
    }
    const hostRect = event.currentTarget?.getBoundingClientRect?.();
    const localX = (Number(event.clientX) || 0) - (hostRect?.left || 0);
    if (localX > 28) return;
    phoneAppEdgeSwipeRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      lastX: Number(event.clientX) || 0,
      lastAt: Date.now(),
      deltaX: 0,
      velocityX: 0,
      engaged: false
    };
    event.currentTarget?.setPointerCapture?.(event.pointerId);
  }, [phoneHasOpenApp]);
  const handlePhoneAppEdgePointerMove = React.useCallback((event) => {
    const drag = phoneAppEdgeSwipeRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const currentX = Number(event.clientX) || 0;
    const currentY = Number(event.clientY) || 0;
    const rawDeltaX = Math.max(0, currentX - drag.startX);
    const rawDeltaY = Math.abs(currentY - drag.startY);
    const currentAt = Date.now();
    const dt = Math.max(1, currentAt - (drag.lastAt || currentAt));
    const velocityX = (currentX - (drag.lastX || currentX)) / dt;
    const engaged = drag.engaged || (rawDeltaX >= 10 && rawDeltaX > (rawDeltaY * 1.15));
    phoneAppEdgeSwipeRef.current = {
      ...drag,
      lastX: currentX,
      lastAt: currentAt,
      deltaX: rawDeltaX,
      velocityX,
      engaged
    };
    if (!engaged) return;
    setPhoneAppEdgeSwipeX(Math.min(96, rawDeltaX));
  }, []);
  const finishPhoneAppEdgeSwipe = React.useCallback((event) => {
    const drag = phoneAppEdgeSwipeRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const shouldClose = drag.engaged && (drag.deltaX >= 70 || (drag.deltaX >= 24 && drag.velocityX >= 0.45));
    setPhoneAppEdgeSwipeX(0);
    phoneAppEdgeSwipeRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastAt: 0,
      deltaX: 0,
      velocityX: 0,
      engaged: false
    };
    event.currentTarget?.releasePointerCapture?.(event.pointerId);
    if (shouldClose) closePhoneApp();
  }, [closePhoneApp]);
  return (
    <>
      <button
        type="button"
        className={`quick-drawer-handle ${quickDrawerOpen ? 'is-open' : ''} ${isNightPhase ? 'is-night' : ''}`.trim()}
        onClick={() => setQuickDrawerOpen((v) => !v)}
        aria-label="빠른 메뉴"
      >
        <span className="quick-drawer-handle__phone" aria-hidden="true">
          <span className="quick-drawer-handle__phone-notch" />
        </span>
        {unreadMessageCount > 0 ? (
          <span className="quick-drawer-handle__badge" aria-label={`미읽은 메시지 ${unreadMessageCount}개`}>
            {unreadMessageBadgeText}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        className={`quick-drawer-bag-handle ${isNightPhase ? 'is-night' : ''}`.trim()}
        onClick={() => {
          if (typeof openInventoryModal === 'function') {
            openInventoryModal();
            return;
          }
          setPhoneBagModalOpen(true);
        }}
        aria-label="가방 열기"
        title="가방"
      >
        <span className="quick-drawer-bag-handle__bag" aria-hidden="true">
          <span className="quick-drawer-bag-handle__bag-handle" />
          <span className="quick-drawer-bag-handle__bag-pocket" />
        </span>
      </button>
      {phoneBagModalOpen ? (
        <div className="quick-bag-modal-backdrop" onClick={() => setPhoneBagModalOpen(false)}>
          <section
            className={`quick-bag-modal ${isNightPhase ? 'is-night' : ''}`.trim()}
            role="dialog"
            aria-modal="true"
            aria-label="내 개인 소지품"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="quick-bag-modal__head">
              <div>
                <span>가방</span>
                <strong>내 개인 소지품</strong>
              </div>
              <button type="button" onClick={() => setPhoneBagModalOpen(false)} aria-label="가방 닫기">×</button>
            </div>
            <div className="quick-bag-modal__summary">
              <span>종류</span>
              <strong>{`${phoneBagItemKindCount}종`}</strong>
            </div>
            <div className="quick-bag-modal__list">
              {phoneBagItemKindCount > 0 ? phoneBagRows.map((item) => (
                <article key={`quick-bag-${item.key}`} className="quick-bag-modal__item">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.metaText}</span>
                  </div>
                  <em>{item.qtyText}</em>
                </article>
              )) : (
                <div className="quick-bag-modal__empty">가방에 개인 소지품이 없습니다.</div>
              )}
            </div>
          </section>
        </div>
      ) : null}
      {quickDrawerOpen ? (
        <button
          type="button"
          className="quick-drawer-backdrop"
          onClick={() => setQuickDrawerOpen(false)}
          aria-label="서랍 닫기"
        />
      ) : null}
      <aside className={`quick-drawer ${quickDrawerOpen ? 'is-open' : ''}`}>
        <div className="phone-ui">
          <div className="phone-ui__frame">
            <div className="phone-ui__notch" />
            <div ref={phoneScreenRef} className={`phone-ui__screen ${phoneUnlocked ? 'is-unlocked' : ''}`.trim()}>
              <div className="phone-galaxy-wallpaper" />
              <div
                className={`phone-galaxy-lock ${phoneUnlocked ? '' : 'is-active'} ${phoneLockIsDragging ? 'is-dragging' : ''}`.trim()}
                style={phoneUnlocked ? undefined : { transform: `translateY(${-phoneSwipeY}px)` }}
                onPointerDown={handlePhoneLockPointerDown}
                onPointerMove={handlePhoneLockPointerMove}
                onPointerUp={finishPhoneSwipe}
                onPointerCancel={finishPhoneSwipe}
              >
                <div className="phone-galaxy-center">
                  <div className="phone-galaxy-clock">{phoneTimeText}</div>
                  <div className="phone-galaxy-date">{phoneDateText}</div>
                  <button
                    type="button"
                    className="phone-galaxy-weather phone-galaxy-weather--button"
                    onClick={openWeatherAppFromLockShortcut}
                    onPointerDown={(event) => event.stopPropagation()}
                    onPointerUp={(event) => event.stopPropagation()}
                    aria-label="날씨 앱 열기"
                  >
                    {phoneWeatherText}
                  </button>
                  {phoneWeatherDescText ? <div className="phone-galaxy-weather-desc">{phoneWeatherDescText}</div> : null}
                  <button
                    type="button"
                    className="phone-galaxy-balance"
                    onClick={openWalletFromLockShortcut}
                    onPointerDown={(event) => event.stopPropagation()}
                    onPointerUp={(event) => event.stopPropagation()}
                    aria-label="지갑 열기"
                  >
                    {phoneMoneyText}
                  </button>
                  {phoneLockNotifications.length ? (
                    <div className="phone-galaxy-lock-notifications" role="list" aria-label="잠금화면 알림">
                      {phoneLockNotifications.map((entry) => {
                        const swipeOffset = Number(lockNotificationSwipeOffsetById[String(entry.id || '')] || 0);
                        const deleteRevealProgress = Math.max(0, Math.min(1, Math.abs(swipeOffset) / 88));
                        return (
                        <div
                          key={entry.id}
                          className={`phone-galaxy-lock-notification-row ${removingLockNotificationId === entry.id ? 'is-removing' : ''}`.trim()}
                          onPointerDown={(event) => handleLockNotificationPointerDown(event, entry.id)}
                          onPointerMove={(event) => handleLockNotificationPointerMove(event, entry.id)}
                          onPointerUp={(event) => handleLockNotificationPointerUp(event, entry.id)}
                          onPointerCancel={(event) => handleLockNotificationPointerUp(event, entry.id)}
                        >
                          <button
                            type="button"
                            className="phone-galaxy-lock-notification-delete"
                            style={{
                              opacity: deleteRevealProgress,
                              transform: `translateX(${Math.round((1 - deleteRevealProgress) * 20)}px) scale(${(0.94 + (deleteRevealProgress * 0.06)).toFixed(3)})`,
                              pointerEvents: deleteRevealProgress >= 0.35 ? 'auto' : 'none'
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              scheduleLockNotificationRemoval(entry.id);
                            }}
                            aria-label="알림 삭제"
                          >
                            삭제
                          </button>
                          <button
                            type="button"
                            className={`phone-galaxy-lock-notification ${entry.read ? '' : 'is-unread'}`.trim()}
                            style={{ transform: `translateX(${swipeOffset}px)` }}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (swipeOffset <= -8) {
                                resetLockNotificationSwipe(entry.id);
                                return;
                              }
                              markPhoneNotificationsRead([entry.id]);
                              unlockPhone?.();
                              openPhoneMessagesApp();
                            }}
                          >
                            <strong>{entry.title}</strong>
                            <span>{lockNotificationPreviewTextOf(entry)}</span>
                          </button>
                        </div>
                        );
                      })}
                    </div>
                  ) : null}
                  <div className="phone-galaxy-status">
                    <span>●</span>
                    <span>5G</span>
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>
                <div className="phone-galaxy-bottom">
                  <div className="phone-galaxy-info">위로 올려서 잠금 해제</div>
                  <div className="phone-galaxy-shortcuts">
                    <button
                      type="button"
                      className="phone-galaxy-shortcut"
                      onClick={openWalletFromLockShortcut}
                      onPointerDown={(event) => event.stopPropagation()}
                      onPointerUp={(event) => event.stopPropagation()}
                      aria-label="지갑 바로 열기"
                    >
                      ₩
                    </button>
                    <div className="phone-galaxy-shortcut">◎</div>
                  </div>
                  <div className="phone-galaxy-swipe-hint">
                    <span style={{ width: `${phoneSwipeProgress * 100}%` }} />
                  </div>
                </div>
              </div>
              <div
                className={`phone-galaxy-home ${phoneUnlocked ? 'is-active' : ''} ${phoneHomeIsDragging ? 'is-dragging' : ''} ${phoneHasOpenApp ? 'is-app-open' : ''}`.trim()}
                onPointerDown={handlePhoneHomePointerDown}
                onPointerMove={handlePhoneHomePointerMove}
                onPointerUp={finishPhoneHomeSwipe}
                onPointerCancel={finishPhoneHomeSwipe}
              >
                <div className="phone-galaxy-home-status">
                  <strong>{phoneTimeText}</strong>
                  <span>5G 100%</span>
                </div>
                {!phoneHasOpenApp && phoneBannerNotification ? (
                  <button
                    type="button"
                    className={`phone-galaxy-banner ${phoneBannerNotification.read ? '' : 'is-unread'} ${phoneBannerNotification.priority === 'high' ? 'is-high-priority' : ''}`.trim()}
                    onClick={() => {
                      markPhoneNotificationsRead([phoneBannerNotification.id]);
                      openPhoneNotificationTarget(phoneBannerNotification);
                    }}
                  >
                    <strong>{phoneBannerNotification.title}</strong>
                    <span>{phoneBannerNotification.body}</span>
                  </button>
                ) : null}
                {phoneOpenedApp === 'apple-helper-chat' ? (
                  <div
                    className={`phone-galaxy-helper-chat ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-helper-chat__head">
                      <button type="button" onClick={closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      {renderHelperAvatar(currentHelperContact, 'phone-galaxy-helper-chat__avatar')}
                      <div className="phone-galaxy-helper-chat__head-copy">
                        <strong>{currentHelperContact.name}</strong>
                        <span>{currentHelperContact.subtitle}</span>
                      </div>
                      <div className="phone-galaxy-helper-chat__status">
                        {appleHelperChatPending ? '답변 작성 중' : '상담 가능'}
                      </div>
                    </div>
                    <div
                      ref={appleHelperChatListRef}
                      className="phone-galaxy-helper-chat__list"
                      onScroll={handleAppleHelperChatScroll}
                    >
                      {visibleAppleHelperChatMessages.length ? (
                        visibleAppleHelperChatMessages.map((entry) => (
                          <div
                            key={entry.id}
                            className={`phone-galaxy-helper-chat__row ${entry.role === 'user' ? 'is-user' : 'is-assistant'}`.trim()}
                          >
                            <div className="phone-galaxy-helper-chat__bubble">
                              <div className="phone-galaxy-helper-chat__bubble-text">
                                {entry.role === 'assistant'
                                  ? renderHelperChatAssistantText(
                                    entry.id,
                                    String(helperChatRenderedTextById[String(entry.id || '')] ?? entry.text ?? '')
                                  )
                                  : entry.text}
                              </div>
                              <div className="phone-galaxy-helper-chat__bubble-time">
                                {new Intl.DateTimeFormat('ko-KR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                }).format(new Date(entry.createdAt))}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : null}
                      {appleHelperChatPending ? (
                        <div className="phone-galaxy-helper-chat__row is-assistant">
                          <div className="phone-galaxy-helper-chat__bubble is-pending">
                            <div className="phone-galaxy-helper-chat__typing">
                              <span />
                              <span />
                              <span />
                            </div>
                            {helperChatShowLoadingHint ? (
                              <div className="phone-galaxy-helper-chat__loading-hint">
                                박사님이 과원 자료를 뒤적이는 중입니다. 언어모델이 깨어나는데 1-2분 걸릴 수 있어요.
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="phone-galaxy-helper-chat__composer">
                      <div className="phone-galaxy-helper-chat__error" aria-live="polite">
                        {appleHelperChatError || ' '}
                      </div>
                      {showLaborPendingConfirmActions ? (
                        <div className="phone-galaxy-helper-chat__confirm-actions">
                          <button
                            type="button"
                            className="phone-galaxy-helper-chat__confirm-action is-confirm"
                            onClick={() => {
                              void handleLaborPendingConfirmAction('확인');
                            }}
                            disabled={appleHelperChatPending}
                          >
                            확인
                          </button>
                          <button
                            type="button"
                            className="phone-galaxy-helper-chat__confirm-action is-cancel"
                            onClick={() => {
                              void handleLaborPendingConfirmAction('취소');
                            }}
                            disabled={appleHelperChatPending}
                          >
                            취소
                          </button>
                        </div>
                      ) : null}
                      {showLaborPendingPaymentAction ? (
                        <div className="phone-galaxy-helper-chat__confirm-actions">
                          <button
                            type="button"
                            className="phone-galaxy-helper-chat__confirm-action is-pay"
                            onClick={() => {
                              void handleLaborPendingConfirmAction('결제해');
                            }}
                            disabled={appleHelperChatPending}
                          >
                            결제하기
                          </button>
                        </div>
                      ) : null}
                      <div className="phone-galaxy-helper-chat__composer-row">
                        <textarea
                          ref={appleHelperChatInputRef}
                          value={appleHelperChatDraft}
                          onChange={(event) => setAppleHelperChatDraft?.(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                              event.preventDefault();
                              if (appleHelperChatPending) return;
                              void handleAppleHelperChatSubmit();
                            }
                          }}
                          placeholder={currentHelperContact.placeholder || `${currentHelperContact.name}께 물어보세요`}
                          rows={2}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            void handleAppleHelperChatSubmit();
                          }}
                          disabled={appleHelperChatPending || !String(appleHelperChatDraft || '').trim()}
                        >
                          전송
                        </button>
                      </div>
                    </div>
                  </div>
                ) : phoneOpenedApp === 'messages' ? (
                  <div
                    className={`phone-galaxy-messages-app ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-messages-app__head">
                      <button type="button" onClick={selectedMessageThread ? closePhoneMessageThread : closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      <strong>{selectedMessageThread ? (selectedMessageThread.senderLabel || '대화') : '메시지'}</strong>
                      <div>{selectedMessageThread ? '' : `${phoneMessageThreads.length}개`}</div>
                    </div>
                    {selectedMessageThread ? (
                      <div className="phone-galaxy-message-thread">
                        <div className="phone-galaxy-message-thread__list">
                          {selectedMessageEntries.length ? (
                            selectedMessageEntries.map((entry, index) => (
                              <div
                                key={`message-thread-${entry?.id || index}`}
                                className="phone-galaxy-message-thread__bubble-wrap is-incoming"
                              >
                                <div className="phone-galaxy-message-thread__bubble is-incoming">
                                  {String(entry?.title || '').trim() ? (
                                    <strong>{String(entry.title || '').trim()}</strong>
                                  ) : null}
                                  <span>{String(entry?.body || '').trim() || '내용 없음'}</span>
                                  <em>
                                    {entry?.createdAt
                                      ? new Intl.DateTimeFormat('ko-KR', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: false
                                        }).format(new Date(entry.createdAt))
                                      : String(entry?.createdAtLabel || '').trim()}
                                  </em>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="phone-galaxy-messages-app__empty">표시할 대화 내용이 없습니다.</div>
                          )}
                        </div>
                      </div>
                    ) : (
                    <div className="phone-galaxy-messages-app__list">
                      {phoneMessageThreads.length ? (
                        phoneMessageThreads.map((thread) => (
                          (() => {
                            const senderLabel = String(thread.senderLabel || '').trim() || '메시지';
                            const previewText = String(thread.preview || '').trim();
                            const unreadCount = Math.max(0, Math.floor(Number(thread.unreadCount) || 0));
                            const threadIds = Array.isArray(thread.notificationIds) ? thread.notificationIds : [];
                            const helperContact = String(thread.actionApp || '').trim() === 'apple-helper-chat'
                              ? helperContacts.find((contact) => String(contact.key || '').trim() === String(thread.actionContact || '').trim()) || null
                              : null;
                            return (
                          <div
                            key={thread.id}
                            className={`phone-galaxy-message-row-wrap ${removingMessageNotificationId === thread.id ? 'is-removing' : ''}`.trim()}
                            onPointerDown={(event) => handleMessagePointerDown(event, thread.id)}
                            onPointerMove={(event) => handleMessagePointerMove(event, thread.id)}
                            onPointerUp={(event) => handleMessagePointerUp(event, thread.id, threadIds, thread)}
                            onPointerCancel={(event) => handleMessagePointerUp(event, thread.id, threadIds, thread)}
                          >
                            <button
                              type="button"
                              className="phone-galaxy-message-delete"
                              style={{
                                opacity: Number(messageSwipeOffsetById[thread.id] || 0) < -18 ? 1 : 0,
                                transform: Number(messageSwipeOffsetById[thread.id] || 0) < -18 ? 'translateX(0) scale(1)' : undefined
                              }}
                              onClick={(event) => {
                                event.stopPropagation();
                                scheduleMessageRemoval(thread.id, threadIds);
                              }}
                              aria-label="메시지 삭제"
                            >
                              삭제
                            </button>
                            <button
                              type="button"
                              className={`phone-galaxy-message-row ${unreadCount > 0 ? 'is-unread' : ''} ${thread.actionApp ? 'is-actionable' : ''}`.trim()}
                              style={{
                                transform: `translateX(${Math.round(Number(messageSwipeOffsetById[thread.id] || 0))}px)`,
                                transition: removingMessageNotificationId === thread.id ? 'none' : 'transform 160ms ease'
                              }}
                              onClick={() => {
                                if (Number(messageSwipeOffsetById[thread.id] || 0) <= -18) {
                                  resetMessageSwipe(thread.id);
                                }
                              }}
                            >
                              {helperContact ? (
                                renderHelperAvatar(helperContact, 'phone-galaxy-message-row__avatar')
                              ) : (
                                <div className="phone-galaxy-message-row__avatar phone-galaxy-message-row__avatar--fallback" aria-hidden="true">
                                  {String(senderLabel || 'M').slice(0, 1)}
                                </div>
                              )}
                              <div className="phone-galaxy-message-row__content">
                                <div className="phone-galaxy-message-row__meta">
                                  <strong>{senderLabel}</strong>
                                  <span>{thread.createdAtLabel}</span>
                                </div>
                                <div className="phone-galaxy-message-row__body">{previewText}</div>
                                {unreadCount > 0 ? (
                                  <div className="phone-galaxy-message-row__thread-meta">
                                    <span className="phone-galaxy-message-row__unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                                  </div>
                                ) : null}
                              </div>
                            </button>
                          </div>
                            );
                          })()
                        ))
                      ) : (
                        <div className="phone-galaxy-messages-app__empty">도착한 메시지가 없습니다.</div>
                      )}
                    </div>
                    )}
                  </div>
                ) : phoneOpenedApp === 'contacts' ? (
                  <div
                    className={`phone-galaxy-contacts ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-contacts__head">
                      <button type="button" onClick={closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      <strong>연락처</strong>
                      <div>
                        <button type="button" aria-label="추가">+</button>
                        <button type="button" aria-label="검색">⌕</button>
                        <button type="button" aria-label="더보기">⋮</button>
                      </div>
                    </div>
                    <div className="phone-galaxy-contacts__section">휴대전화</div>
                    <div className="phone-galaxy-contacts__list">
                      {helperContacts.map((contact) => (
                        <div
                          key={contact.key}
                          className="phone-galaxy-contact-row is-emphasis"
                        >
                          {renderHelperAvatar(contact, 'phone-galaxy-contact-avatar')}
                          <div className="phone-galaxy-contact-copy">
                            <div className="phone-galaxy-contact-name">{contact.name}</div>
                            <div className="phone-galaxy-contact-subtitle">{contact.subtitle}</div>
                            <div className="phone-galaxy-contact-meta">
                              <div
                                className={`phone-galaxy-contact-presence ${contact.availability === 'offline' ? 'is-offline' : 'is-online'}`.trim()}
                              >
                                <span className="phone-galaxy-contact-presence__dot" aria-hidden="true" />
                                <span>{helperPresenceLabelOf(contact)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="phone-galaxy-contact-actions">
                            <button
                              type="button"
                              className="phone-galaxy-contact-action phone-galaxy-contact-action--call"
                              onClick={(event) => openPhoneHelperCall(contact.key, event)}
                            >
                              통화
                            </button>
                            <button
                              type="button"
                              className="phone-galaxy-contact-action phone-galaxy-contact-action--text"
                              onClick={(event) => openPhoneHelperText(contact.key, event)}
                            >
                              문자
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : phoneOpenedApp === 'phone-call' ? (
                  <div
                    className={`phone-galaxy-phone-call ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-phone-call__head">
                      <button type="button" onClick={closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      <strong>통화</strong>
                      <div>상담 가능</div>
                    </div>
                    <div className="phone-galaxy-phone-call__body">
                      {renderHelperAvatar(currentCallingContact, 'phone-galaxy-phone-call__avatar')}
                      <strong>{currentCallingContact.name}</strong>
                      <span>{currentCallingContact.subtitle}</span>
                      <p>지금은 문자 상담이 더 자연스럽게 연결돼. 바로 문자로 전환해서 물어볼래?</p>
                    </div>
                    <div className="phone-galaxy-phone-call__actions">
                      <button
                        type="button"
                        className="phone-galaxy-phone-call__action phone-galaxy-phone-call__action--mute"
                        onClick={() => switchPhoneApp('contacts')}
                      >
                        끊기
                      </button>
                      <button
                        type="button"
                        className="phone-galaxy-phone-call__action phone-galaxy-phone-call__action--chat"
                        onClick={(event) => openPhoneHelperText(currentCallingContact.key, event)}
                      >
                        문자로 전환
                      </button>
                    </div>
                  </div>
                ) : phoneOpenedApp === 'weather' ? (
                  <div
                    className={`phone-galaxy-weather-app ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-weather-app__head">
                      <button type="button" onClick={closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      <strong>날씨</strong>
                      <div>{`${weatherIconOf(game.weather)} ${Math.round(Number(game.temperatureC) || 0)}°C`}</div>
                    </div>
                    <div className="phone-galaxy-weather-app__art" aria-hidden="true">
                      <span className="phone-galaxy-weather-app__moon" />
                      <span className="phone-galaxy-weather-app__whale" />
                      <span className="phone-galaxy-weather-app__hill" />
                    </div>
                    <div className="phone-galaxy-weather-app__today">
                      <div className="phone-galaxy-weather-app__today-main">{`${weatherIconOf(game.weather)} ${game.weather}`}</div>
                      <div className="phone-galaxy-weather-app__today-date">{phoneDateText}</div>
                      <div className="phone-galaxy-weather-app__today-temp">{`${Math.round(Number(game.temperatureC) || 0)}°C`}</div>
                      <div className="phone-galaxy-weather-app__today-desc">{game.weatherDesc}</div>
                    </div>
                  <div className="phone-galaxy-weather-app__list">
                    {phoneForecastRows.map((row, index) => (
                      <div key={`phone-forecast-${row.day}-${index}`} className="phone-galaxy-weather-row">
                        <span>{`${row.label} (${row.weekday}) · ${row.weatherText || ''}`}</span>
                        <span>{`${row.tempText || ''} · ${row.precipitationText}${row.coldRiskText ? ` · ${row.coldRiskText}` : ''}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
                ) : phoneOpenedApp === 'calendar' ? (
                  <div
                    className={`phone-galaxy-calendar-app ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-calendar-app__head">
                      <button type="button" onClick={closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      <strong>캘린더</strong>
                      <div>{phoneCalendarMonthLabel}</div>
                    </div>
                    <div className="phone-galaxy-calendar-app__today">
                      <span>오늘</span>
                      <strong>{phoneCalendarTodayKey}</strong>
                      <em>{`등록 일정 ${(phoneCalendarEventsByDate[phoneCalendarTodayKey] || []).length}개`}</em>
                    </div>
                    <div className="phone-galaxy-calendar-app__weekdays" aria-hidden="true">
                      {['일', '월', '화', '수', '목', '금', '토'].map((label) => (
                        <span key={`phone-calendar-weekday-${label}`}>{label}</span>
                      ))}
                    </div>
                    <div className="phone-galaxy-calendar-app__grid">
                      {phoneCalendarCells.map((cell) => (
                        <div
                          key={`phone-calendar-cell-${cell.key}`}
                          className={[
                            'phone-galaxy-calendar-app__cell',
                            cell.isCurrentMonth ? '' : 'is-muted',
                            cell.isToday ? 'is-today' : '',
                            cell.key === phoneActiveCalendarDate ? 'is-selected' : '',
                            cell.events.length ? 'has-event' : ''
                          ].filter(Boolean).join(' ')}
                          onClick={() => {
                            setPhoneCalendarSelectedDate(cell.key);
                            setPhoneCalendarMessage('');
                          }}
                        >
                          <strong>{cell.day}</strong>
                          {cell.events.length ? (
                            <span className="phone-galaxy-calendar-app__dots" aria-label={`일정 ${cell.events.length}개`}>
                              <i />
                              <em>{cell.events.length}</em>
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <div className="phone-galaxy-calendar-app__recent">
                      <div className="phone-galaxy-calendar-app__section-title">{`${phoneActiveCalendarDate} 일정`}</div>
                      <div className="phone-galaxy-calendar-app__quick-add">
                        <input
                          type="text"
                          value={phoneCalendarTitleDraft}
                          maxLength={40}
                          placeholder="일정 제목"
                          onChange={(event) => {
                            setPhoneCalendarTitleDraft(event.target.value);
                            if (phoneCalendarMessage) setPhoneCalendarMessage('');
                          }}
                        />
                        <button type="button" onClick={submitPhoneCalendarEvent}>등록</button>
                      </div>
                      {phoneCalendarMessage ? <div className="phone-galaxy-calendar-app__message">{phoneCalendarMessage}</div> : null}
                      {phoneActiveCalendarEvents.length ? phoneActiveCalendarEvents.map((event) => (
                        <article key={`phone-calendar-event-${event.id}`} className="phone-galaxy-calendar-app__log">
                          <span>{event.date}</span>
                          <strong>{event.title}</strong>
                          <button type="button" onClick={() => deletePhoneCalendarEvent(event.id)}>삭제</button>
                        </article>
                      )) : (
                        <div className="phone-galaxy-calendar-app__empty">이 날짜에 등록된 일정이 없습니다.</div>
                      )}
                    </div>
                  </div>
                ) : phoneOpenedApp === 'land' ? (
                  <div
                    className={`phone-galaxy-land-app ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-land-app__head">
                      <button type="button" onClick={closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      <strong>농지</strong>
                      <div>{`${phoneOwnedLandRows.length}필지`}</div>
                    </div>
                    <div className="phone-galaxy-land-app__summary">
                      <span>내가 소유한 농지</span>
                      <strong>{`${phoneOwnedLandRows.length}필지`}</strong>
                      <em>{phoneOwnedLandRows.length ? '소유 토지 현황' : '소유 농지 없음'}</em>
                    </div>
                    <div className="phone-galaxy-land-app__list">
                      {phoneOwnedLandRows.length ? phoneOwnedLandRows.map((row) => (
                        <article key={`phone-land-${row.key}`} className="phone-galaxy-land-app__card">
                          <div className="phone-galaxy-land-app__card-head">
                            {phoneLandEditingIndex === row.fieldIndex ? (
                              <input
                                className="phone-galaxy-land-app__name-input"
                                type="text"
                                value={phoneLandNameDraft}
                                maxLength={18}
                                onChange={(event) => {
                                  setPhoneLandNameDraft(event.target.value);
                                  if (phoneLandNameError) setPhoneLandNameError('');
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') savePhoneLandNameEdit();
                                  if (event.key === 'Escape') cancelPhoneLandNameEdit();
                                }}
                                aria-label="토지 이름"
                              />
                            ) : (
                              <strong>{row.name}</strong>
                            )}
                            <span>{row.areaText}</span>
                          </div>
                          <div className="phone-galaxy-land-app__crop">{row.cropText}</div>
                          <div className="phone-galaxy-land-app__meta">{row.metaText}</div>
                          {row.moneyText ? <div className="phone-galaxy-land-app__money">{row.moneyText}</div> : null}
                          {phoneLandEditingIndex === row.fieldIndex ? (
                            <>
                              {phoneLandNameError ? <div className="phone-galaxy-land-app__error">{phoneLandNameError}</div> : null}
                              <div className="phone-galaxy-land-app__actions">
                                <button type="button" onClick={savePhoneLandNameEdit}>저장</button>
                                <button type="button" onClick={cancelPhoneLandNameEdit}>취소</button>
                              </div>
                            </>
                          ) : (
                            <div className="phone-galaxy-land-app__actions">
                              <button type="button" onClick={() => startPhoneLandNameEdit(row)}>이름 수정</button>
                            </div>
                          )}
                        </article>
                      )) : (
                        <div className="phone-galaxy-land-app__empty">소유한 농지가 없습니다.</div>
                      )}
                    </div>
                  </div>
                ) : phoneOpenedApp === 'labor' ? (
                  <div
                    className={`phone-galaxy-labor-app ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-labor-app__head">
                      <button type="button" onClick={closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      <strong>인력소</strong>
                      <div>대여 등록</div>
                    </div>
                    <div className="phone-galaxy-labor-app__summary">
                      {phoneCrewTypeRows.map((row) => (
                        <div key={`phone-labor-summary-${row.key}`} className="phone-galaxy-labor-app__chip">
                          <span>{`${row.name} · ${row.availableDayText || ''}`.trim()}</span>
                          <strong>{`남음 ${row.remaining}명`}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="phone-galaxy-labor-app__urgent-box">
                      <div className="phone-galaxy-labor-app__urgent-row">
                        <span>긴급 인력 예약</span>
                        <span className="phone-galaxy-labor-app__urgent-toggle is-on">항상 ON</span>
                      </div>
                      <div className="phone-galaxy-labor-app__urgent-hint">
                        오늘부터 2일 뒤까지 급행 예약 가능. 추가비용이 붙습니다.
                      </div>
                    </div>
                    <div className="phone-galaxy-labor-app__forms">
                      {phoneCrewTypeRows.map((row) => (
                        <div key={`phone-labor-form-${row.key}`} className="phone-galaxy-labor-app__card">
                          <div className="phone-galaxy-labor-app__card-head">
                            <strong>{row.name}</strong>
                            <span>{row.wageText}</span>
                          </div>
                          <div className="phone-galaxy-labor-app__urgent-hint" style={{ marginBottom: 10 }}>
                            {`${row.availableDayText || ''} 시작 기준 남은 예약 가능 인원 ${row.remaining}명`}
                          </div>
                          <div className="phone-galaxy-labor-app__grid">
                            <label>
                              <span>인원</span>
                              <input
                                type="number"
                                min={1}
                                max={row.remaining}
                                value={row.draft.count}
                                onChange={(event) => updatePhoneCrewDraft(row.key, 'count', event.target.value)}
                              />
                            </label>
                            <label>
                              <span>시작일</span>
                              <input
                                type="date"
                                min={minCrewStartDate}
                                value={row.draft.start}
                                onChange={(event) => updatePhoneCrewDraft(row.key, 'start', event.target.value)}
                              />
                            </label>
                            <label>
                              <span>종료일</span>
                              <input
                                type="date"
                                min={row.draft.start}
                                value={row.draft.end}
                                onChange={(event) => updatePhoneCrewDraft(row.key, 'end', event.target.value)}
                              />
                            </label>
                          </div>
                          <button
                            type="button"
                            className="phone-galaxy-labor-app__submit"
                            onClick={() => rentCrewFromPhone(row.key)}
                            disabled={row.remaining <= 0}
                          >
                            대여 등록
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="phone-galaxy-labor-app__list">
                      {phoneCrewRentRows.length ? (
                        phoneCrewRentRows.map((row) => (
                          <div key={`phone-labor-rent-${row.id}`} className="phone-galaxy-labor-app__rent">
                            <div className="phone-galaxy-labor-app__rent-head">
                              <strong>{`${row.typeName} ${row.count}명`}</strong>
                              <span>{row.statusText}</span>
                            </div>
                            <div className="phone-galaxy-labor-app__rent-meta">{row.periodText}</div>
                            {row.reviewText ? <div className="phone-galaxy-labor-app__rent-hint">{row.reviewText}</div> : null}
                            {row.pendingPaymentHint ? <div className="phone-galaxy-labor-app__rent-hint">{row.pendingPaymentHint}</div> : null}
                            {row.rejectedHint ? <div className="phone-galaxy-labor-app__rent-hint">{row.rejectedHint}</div> : null}
                            <div className="phone-galaxy-labor-app__rent-actions">
                              {row.canPayApproved ? (
                                <button type="button" onClick={() => payApprovedCrewRentFromPhone(row.id)}>결제하기</button>
                              ) : null}
                              {row.canApproveRejected ? (
                                <button type="button" onClick={() => approveRejectedCrewRentFromPhone(row.id)}>추가 비용 결제</button>
                              ) : null}
                              {row.canCancel ? (
                                <button type="button" onClick={() => cancelCrewRentFromPhone(row.id)}>대여 취소</button>
                              ) : null}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="phone-galaxy-labor-app__empty">등록된 대여가 없습니다.</div>
                      )}
                    </div>
                  </div>
                ) : phoneOpenedApp === 'health' ? (
                  <div
                    className={`phone-galaxy-health-app ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-health-app__head">
                      <button type="button" onClick={closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      <strong>건강</strong>
                      <div>{`${Math.round(Number(phoneHealthGaugeValue) || 0)}/100`}</div>
                    </div>
                    <div className="phone-galaxy-health-app__hero">
                      <div className="phone-galaxy-health-app__hero-value">{`${Math.round(Number(phoneHealthGaugeValue) || 0)}/100`}</div>
                      <div className="phone-galaxy-health-app__hero-label">현재 컨디션 양호</div>
                      <div className="phone-galaxy-health-app__hero-date">{`${phoneDateText} · 농장 작업 가능 상태`}</div>
                    </div>
                    <div className="phone-galaxy-health-app__meter">
                      <span style={{ width: `${Math.max(0, Math.min(100, Number(phoneHealthGaugeValue) || 0))}%` }} />
                    </div>
                    <div className="phone-galaxy-health-app__stats">
                      <div>
                        <em>자가 노동력</em>
                        <strong>{`${Math.max(0, Math.min(100, Number(phoneSelfLaborValue) || 0)).toFixed(1)}/100`}</strong>
                        <small>오늘 직접 투입 가능한 노동력</small>
                      </div>
                      <div>
                        <em>활동 상태</em>
                        <strong>정상</strong>
                        <small>오늘 작업 진행 가능</small>
                      </div>
                      <div>
                        <em>피로도</em>
                        <strong>낮음</strong>
                        <small>과로 경고 없음</small>
                      </div>
                      <div>
                        <em>회복 권장</em>
                        <strong>수면</strong>
                        <small>다음날 회복 반영 예정</small>
                      </div>
                    </div>
                  </div>
                ) : phoneOpenedApp === 'bank' ? (
                  <div
                    className={`phone-galaxy-bank-app ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-bank-app__head">
                      <button type="button" onClick={closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      <strong>은행</strong>
                      <div>{phoneIssuedCards.length + phoneIssuedAccounts.length}개</div>
                    </div>
                    <div className="phone-galaxy-bank-app__balance">
                      <span>보유 자금</span>
                      <strong>{moneyText(game?.money || 0)}</strong>
                      <em>{walletDetailSummary?.primaryAccountName || '주통장 미지정'}</em>
                    </div>
                    <div className="phone-galaxy-bank-app__tabs" role="tablist" aria-label="은행 앱 보기 전환">
                      {PHONE_BANK_TABS.map(([key, label]) => (
                        <button
                          key={`phone-bank-tab-${key}`}
                          type="button"
                          role="tab"
                          aria-selected={phoneBankTab === key}
                          className={phoneBankTab === key ? 'is-active' : ''}
                          onClick={() => selectPhoneBankTab(key)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="phone-galaxy-bank-app__content">
                      <div
                        key={`phone-bank-panel-${phoneBankTab}`}
                        className={`phone-galaxy-bank-app__tab-panel is-${phoneBankTabDirection}`.trim()}
                      >
                      {phoneBankTab === 'summary' ? (
                        <div className="phone-galaxy-bank-app__summary">
                          <div><span>최근 수입</span><strong>{moneyText(walletDetailSummary?.recentIncome || 0)}</strong></div>
                          <div><span>최근 지출</span><strong>{moneyText(walletDetailSummary?.recentExpense || 0)}</strong></div>
                          <div><span>다음 카드 청구</span><strong>{moneyText(walletDetailSummary?.nextMonthCardBill || 0)}</strong></div>
                          <div><span>전체 청구예정</span><strong>{moneyText(walletDetailSummary?.pendingCardBillTotal || 0)}</strong></div>
                          <div><span>보유 카드</span><strong>{phoneIssuedCards.length}개</strong></div>
                          <div><span>보유 통장</span><strong>{phoneIssuedAccounts.length}개</strong></div>
                        </div>
                      ) : null}
                      {phoneBankTab === 'cards' ? (
                        <div className="phone-galaxy-bank-app__list">
                          {phoneIssuedCards.length ? phoneIssuedCards.map((card) => {
                            const isCredit = Number(card?.minScore || 0) > 0;
                            const pendingAmount = pendingCardAmountOf(card?.id);
                            return (
                              <article key={`phone-bank-card-${card.id}`} className="phone-galaxy-bank-app__card">
                                {typeof renderWalletCardVisual === 'function' ? (
                                  <div className="phone-galaxy-bank-app__card-art">{renderWalletCardVisual(card)}</div>
                                ) : null}
                                <div className="phone-galaxy-bank-app__item-head">
                                  <strong>{card.name}</strong>
                                  <span>{isCredit ? '신용카드' : '체크카드'}</span>
                                </div>
                                <div className="phone-galaxy-bank-app__meta">{card.brand} · {Number(card.annualFee) > 0 ? `연회비 ${moneyText(card.annualFee || 0)}` : '연회비 없음'}</div>
                                <div className="phone-galaxy-bank-app__chips">
                                  <span>{isCredit ? `신용 기준 ${card.minScore}점+` : '즉시 출금'}</span>
                                  <span>{pendingAmount > 0 ? `청구예정 ${moneyText(pendingAmount)}` : '청구예정 없음'}</span>
                                </div>
                                <button type="button" onClick={() => openCardUsageFromPhone?.(card.id)}>사용내역</button>
                              </article>
                            );
                          }) : (
                            <div className="phone-galaxy-bank-app__empty">발급된 카드가 없습니다.</div>
                          )}
                        </div>
                      ) : null}
                      {phoneBankTab === 'accounts' ? (
                        <div className="phone-galaxy-bank-app__list">
                          {phoneIssuedAccounts.length ? phoneIssuedAccounts.map((account) => {
                            const isPrimary = String(game?.primaryAccountId || '') === String(account.id || '');
                            return (
                              <article key={`phone-bank-account-${account.id}`} className="phone-galaxy-bank-app__account">
                                <div className="phone-galaxy-bank-app__item-head">
                                  <strong>{account.name}</strong>
                                  {isPrimary ? <span>주통장</span> : null}
                                </div>
                                <div className="phone-galaxy-bank-app__meta">{account.bank} · {account.type}</div>
                                <div className="phone-galaxy-bank-app__meta">{bankAccountNumberById?.[account.id] || '계좌번호 미발급'}</div>
                                {account.desc ? <div className="phone-galaxy-bank-app__desc">{account.desc}</div> : null}
                              </article>
                            );
                          }) : (
                            <div className="phone-galaxy-bank-app__empty">발급된 통장이 없습니다.</div>
                          )}
                        </div>
                      ) : null}
                      {phoneBankTab === 'logs' ? (
                        <div className="phone-galaxy-bank-app__logs">
                          {phoneWalletLogs.length ? phoneWalletLogs.map((item, index) => (
                            <article key={`phone-bank-log-${index}`} className={`phone-galaxy-bank-app__log phone-galaxy-bank-app__log--${item.flowType === 'income' ? 'income' : 'expense'}`}>
                              <strong>{item.amount >= 0 ? '+' : '-'}{moneyText(Math.abs(item.amount || 0))}</strong>
                              <span>{item.line}</span>
                            </article>
                          )) : (
                            <div className="phone-galaxy-bank-app__empty">자금 내역이 없습니다.</div>
                          )}
                        </div>
                      ) : null}
                      </div>
                    </div>
                  </div>
                ) : phoneOpenedApp === 'placeholder' ? (
                  <div
                    className={`phone-galaxy-placeholder-app ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-placeholder-app__head">
                      <button type="button" onClick={closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      <strong>{phonePlaceholderApp.label || '앱'}</strong>
                      <div>준비 중</div>
                    </div>
                    <div className="phone-galaxy-placeholder-app__body">
                      <div className="phone-galaxy-placeholder-app__emoji" aria-hidden="true">🛠️</div>
                      <strong>{`${phonePlaceholderApp.label || '이 앱'} 준비 중`}</strong>
                      <p>기본 화면은 열리지만 세부 기능은 아직 제작 중입니다.</p>
                    </div>
                  </div>
                ) : phoneOpenedApp === 'settings' ? (
                  <div
                    className={`phone-galaxy-settings-app ${phoneAppTransitionClass} ${phoneAppEdgeSwipeX > 0 ? 'is-edge-swiping' : ''}`.trim()}
                    style={{
                      ...phoneAppTransitionStyle,
                      transform: phoneAppEdgeSwipeX > 0 ? `translateX(${Math.round(phoneAppEdgeSwipeX)}px)` : undefined
                    }}
                    onPointerDown={handlePhoneAppEdgePointerDown}
                    onPointerMove={handlePhoneAppEdgePointerMove}
                    onPointerUp={finishPhoneAppEdgeSwipe}
                    onPointerCancel={finishPhoneAppEdgeSwipe}
                  >
                    <div className="phone-galaxy-settings-app__head">
                      <button type="button" onClick={closePhoneApp} aria-label="뒤로">
                        &lt;
                      </button>
                      <strong>설정</strong>
                      <div>기기 및 게임</div>
                    </div>
                    <div className="phone-galaxy-settings-app__section">
                      <div className="phone-galaxy-settings-app__section-title">내 정보</div>
                      <div className="phone-galaxy-settings-app__name-card">
                        <label className="phone-galaxy-settings-app__name-field">
                          <span>내 이름</span>
                          <input
                            type="text"
                            value={settingsPlayerNameDraft}
                            maxLength={24}
                            onChange={(event) => {
                              setSettingsPlayerNameDraft(event.target.value);
                              if (settingsPlayerNameMessage) setSettingsPlayerNameMessage('');
                            }}
                            placeholder="이름 입력"
                          />
                        </label>
                        <button
                          type="button"
                          className="phone-galaxy-settings-app__name-save"
                          onClick={() => {
                            const result = renamePlayerFromPhone?.(settingsPlayerNameDraft);
                            if (!result) return;
                            setSettingsPlayerNameMessage(String(result.message || ''));
                            if (result.ok) {
                              setSettingsPlayerNameDraft(String(result.playerName || settingsPlayerNameDraft).trim());
                            }
                          }}
                        >
                          이름 변경
                        </button>
                        {settingsPlayerNameMessage ? (
                          <div className="phone-galaxy-settings-app__name-message">{settingsPlayerNameMessage}</div>
                        ) : null}
                        <label className="phone-galaxy-settings-app__name-field">
                          <span>농장 이름</span>
                          <input
                            type="text"
                            value={settingsFarmNameDraft}
                            maxLength={32}
                            onChange={(event) => {
                              setSettingsFarmNameDraft(event.target.value);
                              if (settingsFarmNameMessage) setSettingsFarmNameMessage('');
                            }}
                            placeholder="농장 이름 입력"
                          />
                        </label>
                        <button
                          type="button"
                          className="phone-galaxy-settings-app__name-save"
                          onClick={() => {
                            const result = renameFarmFromPhone?.(settingsFarmNameDraft);
                            if (!result) return;
                            setSettingsFarmNameMessage(String(result.message || ''));
                            if (result.ok) {
                              setSettingsFarmNameDraft(String(result.farmName || settingsFarmNameDraft).trim());
                            }
                          }}
                        >
                          농장 이름 변경
                        </button>
                        {settingsFarmNameMessage ? (
                          <div className="phone-galaxy-settings-app__name-message">{settingsFarmNameMessage}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className="phone-galaxy-settings-app__section">
                      <div className="phone-galaxy-settings-app__section-title">화면</div>
                      <div className="phone-galaxy-settings-app__row">
                        <span>잠금화면 알림</span>
                        <em>ON</em>
                      </div>
                      <div className="phone-galaxy-settings-app__row">
                        <span>홈 배너 알림</span>
                        <em>ON</em>
                      </div>
                      <div className="phone-galaxy-settings-app__row">
                        <span>앱 열기 애니메이션</span>
                        <em>적용 중</em>
                      </div>
                    </div>
                    <div className="phone-galaxy-settings-app__section">
                      <div className="phone-galaxy-settings-app__section-title">소리</div>
                      <div className="phone-galaxy-settings-app__audio-stack">
                        <label className="phone-galaxy-settings-app__audio-slider-row">
                          <div className="phone-galaxy-settings-app__audio-slider-head">
                            <span>메인메뉴 BGM</span>
                            <strong>{`${Math.round((Number(audioMenuBgmVolume) || 0) * 100)}%`}</strong>
                          </div>
                          <input
                            className="phone-galaxy-settings-app__audio-slider"
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={Math.round((Number(audioMenuBgmVolume) || 0) * 100)}
                            onChange={(event) => setAudioMenuBgmVolume?.(Math.max(0, Math.min(1, Number(event.target.value) / 100)))}
                            style={{ '--phone-settings-audio-progress': `${Math.round((Number(audioMenuBgmVolume) || 0) * 100)}%` }}
                            aria-label="메인메뉴 BGM 볼륨"
                          />
                          <em>타이틀 화면 배경음에만 적용</em>
                        </label>
                        <label className="phone-galaxy-settings-app__audio-slider-row">
                          <div className="phone-galaxy-settings-app__audio-slider-head">
                            <span>날씨 배경음</span>
                            <strong>{`${Math.round((Number(audioWeatherBgmVolume) || 0) * 100)}%`}</strong>
                          </div>
                          <input
                            className="phone-galaxy-settings-app__audio-slider"
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={Math.round((Number(audioWeatherBgmVolume) || 0) * 100)}
                            onChange={(event) => setAudioWeatherBgmVolume?.(Math.max(0, Math.min(1, Number(event.target.value) / 100)))}
                            style={{ '--phone-settings-audio-progress': `${Math.round((Number(audioWeatherBgmVolume) || 0) * 100)}%` }}
                            aria-label="날씨 배경음 볼륨"
                          />
                          <em>농장 화면 계절·날씨 환경음에만 적용</em>
                        </label>
                        <label className="phone-galaxy-settings-app__audio-slider-row">
                          <div className="phone-galaxy-settings-app__audio-slider-head">
                            <span>게임 효과음</span>
                            <strong>{`${Math.round((Number(audioSfxVolume) || 0) * 100)}%`}</strong>
                          </div>
                          <input
                            className="phone-galaxy-settings-app__audio-slider"
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={Math.round((Number(audioSfxVolume) || 0) * 100)}
                            onChange={(event) => setAudioSfxVolume?.(Math.max(0, Math.min(1, Number(event.target.value) / 100)))}
                            style={{ '--phone-settings-audio-progress': `${Math.round((Number(audioSfxVolume) || 0) * 100)}%` }}
                            aria-label="게임 효과음 볼륨"
                          />
                          <em>버튼음 등 인터랙션 효과음에 적용</em>
                        </label>
                      </div>
                    </div>
                    <div className="phone-galaxy-settings-app__section">
                      <div className="phone-galaxy-settings-app__section-title">게임 진행</div>
                      <div className="phone-galaxy-settings-app__row">
                        <span>현재 날짜</span>
                        <em>{phoneDateText}</em>
                      </div>
                      <div className="phone-galaxy-settings-app__row">
                        <span>현재 날씨</span>
                        <em>{phoneWeatherText}</em>
                      </div>
                      <div className="phone-galaxy-settings-app__row">
                        <span>농장 잔액</span>
                        <em>{phoneMoneyText}</em>
                      </div>
                      <div className="phone-galaxy-settings-app__row">
                        <span>화면 자동복원</span>
                        <button
                          type="button"
                          className={`phone-galaxy-settings-app__toggle ${autoSaveEnabled && autoRestoreViewEnabled ? 'is-on' : ''}`.trim()}
                          onClick={() => setAutoRestoreViewEnabled?.((prev) => !prev)}
                        >
                          {autoSaveEnabled && autoRestoreViewEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <div className="phone-galaxy-settings-app__hint">
                        자동저장이 켜진 상태에서 새로고침하면 마지막 저장 슬롯과 보던 화면을 다시 엽니다.
                      </div>
                    </div>
                    {canUseDevMode ? (
                      <div className="phone-galaxy-settings-app__section">
                        <div className="phone-galaxy-settings-app__section-title">개발자</div>
                        <div className="phone-galaxy-settings-app__row">
                          <span>개발자 모드</span>
                          <button
                            type="button"
                            className={`phone-galaxy-settings-app__toggle ${devMode ? 'is-on' : ''}`.trim()}
                            onClick={() => setDevMode?.((prev) => !prev)}
                          >
                            {devMode ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        <div className="phone-galaxy-settings-app__dev-actions">
                          <button
                            type="button"
                            className="phone-galaxy-settings-app__mini-btn"
                            onClick={() => setDevDatePanelOpen((prev) => !prev)}
                            disabled={!devMode}
                          >
                            날짜선택
                          </button>
                          <button
                            type="button"
                            className="phone-galaxy-settings-app__mini-btn"
                            onClick={() => setDevMoneyPanelOpen((prev) => !prev)}
                            disabled={!devMode}
                          >
                            자금설정
                          </button>
                          <button
                            type="button"
                            className={`phone-galaxy-settings-app__mini-btn ${devFastNextDay ? 'is-on' : ''}`.trim()}
                            onClick={() => setDevFastNextDay?.((prev) => !prev)}
                            disabled={!devMode}
                          >
                            {devFastNextDay ? '빠른 다음날 ON' : '빠른 다음날 OFF'}
                          </button>
                          <button
                            type="button"
                            className="phone-galaxy-settings-app__mini-btn"
                            onClick={() => setDevForecastPanelOpen((prev) => !prev)}
                            disabled={!devMode}
                          >
                            슈퍼일기예보 보기
                          </button>
                        </div>
                        {devMode && devDatePanelOpen ? (
                          <div className="phone-galaxy-settings-app__dev-tool-panel">
                            <label>
                              <span>날짜</span>
                              <input
                                type="date"
                                value={devDateDraft || ''}
                                onChange={(event) => setDevDateDraft?.(event.target.value)}
                              />
                            </label>
                            <button
                              type="button"
                              className="phone-galaxy-settings-app__mini-btn"
                              onClick={() => devSetDate?.()}
                            >
                              날짜 적용
                            </button>
                          </div>
                        ) : null}
                        {devMode && devMoneyPanelOpen ? (
                          <div className="phone-galaxy-settings-app__dev-tool-panel">
                            <label>
                              <span>자금</span>
                              <input
                                type="number"
                                min={0}
                                step={10000}
                                value={devMoneyDraft || ''}
                                onChange={(event) => setDevMoneyDraft?.(event.target.value)}
                              />
                            </label>
                            <button
                              type="button"
                              className="phone-galaxy-settings-app__mini-btn"
                              onClick={() => devSetMoney?.()}
                            >
                              자금 적용
                            </button>
                          </div>
                        ) : null}
                        {devMode && devForecastPanelOpen ? (
                          <div className="phone-galaxy-settings-app__dev-forecast">
                            <strong>슈퍼일기예보</strong>
                            {(Array.isArray(devSuperForecastRows) ? devSuperForecastRows : []).map((row) => (
                              <div key={`phone-dev-super-forecast-${row.day}`} className="phone-galaxy-settings-app__dev-forecast-row">
                                <span>{row.dateText}</span>
                                <em>{row.weatherName}</em>
                                <b>{row.tempText}</b>
                                <small>{row.precipitationText}</small>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {devMode && showHousingDevSettings ? (
                          <div className="phone-galaxy-settings-app__dev-tool-panel">
                            <strong>하우징</strong>
                            <div className="phone-galaxy-settings-app__row">
                              <span>하우징 버튼 위치 드래그</span>
                              <button
                                type="button"
                                className={`phone-galaxy-settings-app__toggle ${housingEntryButtonDragEnabled ? 'is-on' : ''}`.trim()}
                                onClick={() => toggleHousingEntryButtonDragEnabled?.()}
                              >
                                {housingEntryButtonDragEnabled ? 'ON' : 'OFF'}
                              </button>
                            </div>
                            <div className="phone-galaxy-settings-app__row">
                              <span>들어가기 위치 고정</span>
                              <button
                                type="button"
                                className="phone-galaxy-settings-app__mini-btn"
                                onClick={() => saveHousingEntryButtonLayout?.()}
                                disabled={!housingEntryButtonPositionDirty}
                              >
                                고정
                              </button>
                            </div>
                            <div className="phone-galaxy-settings-app__row">
                              <span>위치 상태</span>
                              <em>{housingEntryButtonPositionDirty ? '조정 후 미고정' : '고정됨'}</em>
                            </div>
                          </div>
                        ) : null}
                        <div className="phone-galaxy-settings-app__row">
                          <span>자동저장</span>
                          <button
                            type="button"
                            className={`phone-galaxy-settings-app__toggle ${autoSaveEnabled ? 'is-on' : ''}`.trim()}
                            onClick={() => setAutoSaveEnabled?.((prev) => !prev)}
                          >
                            {autoSaveEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        <div className="phone-galaxy-settings-app__row">
                          <span>코드 반영 자동 새로고침</span>
                          <button
                            type="button"
                            className={`phone-galaxy-settings-app__toggle ${devAutoPageReloadEnabled ? 'is-on' : ''}`.trim()}
                            onClick={() => setDevAutoPageReloadEnabled?.((prev) => !prev)}
                          >
                            {devAutoPageReloadEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        <div className="phone-galaxy-settings-app__row">
                          <span>지도 마커 고정</span>
                          <button
                            type="button"
                            className={`phone-galaxy-settings-app__toggle ${townMarkerCoordsLocked ? 'is-on' : ''}`.trim()}
                            onClick={() => toggleTownMarkerCoordsLocked?.()}
                          >
                            {townMarkerCoordsLocked ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        <div className="phone-galaxy-settings-app__row">
                          <span>지도 마커 위치저장</span>
                          <button
                            type="button"
                            className="phone-galaxy-settings-app__mini-btn"
                            onClick={() => saveTownMarkerLayout?.()}
                            disabled={!townMarkerCoordsDirty}
                          >
                            저장
                          </button>
                        </div>
                        <div className="phone-galaxy-settings-app__row">
                          <span>마커 위치 상태</span>
                          <em>{townMarkerCoordsDirty ? '저장 필요' : (townMarkerLayoutSavedAtDay > 0 ? `${townMarkerLayoutSavedAtDay}일차 저장됨` : '기본값 사용 중')}</em>
                        </div>
                        <div className="phone-galaxy-settings-app__row">
                          <span>소형 APC 내 하차 스킵</span>
                          <button
                            type="button"
                            className={`phone-galaxy-settings-app__toggle ${smallApcDevPlayerUnloadSkipEnabled ? 'is-on' : ''}`.trim()}
                            onClick={() => toggleSmallApcDevPlayerUnloadSkipEnabled?.()}
                          >
                            {smallApcDevPlayerUnloadSkipEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        <div className="phone-galaxy-settings-app__row">
                          <span>소형 APC 내 작업 스킵</span>
                          <button
                            type="button"
                            className={`phone-galaxy-settings-app__toggle ${smallApcDevPlayerWorkSkipEnabled ? 'is-on' : ''}`.trim()}
                            onClick={() => toggleSmallApcDevPlayerWorkSkipEnabled?.()}
                          >
                            {smallApcDevPlayerWorkSkipEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        <div className="phone-galaxy-settings-app__row">
                          <span>소형 APC 선별 스킵</span>
                          <button
                            type="button"
                            className={`phone-galaxy-settings-app__toggle ${smallApcDevPlayerSortingSkipEnabled ? 'is-on' : ''}`.trim()}
                            onClick={() => toggleSmallApcDevPlayerSortingSkipEnabled?.()}
                          >
                            {smallApcDevPlayerSortingSkipEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        <div className="phone-galaxy-settings-app__dev-hint">
                          이 계정은 개발자 기능을 사용할 수 있습니다. 지도 마커 고정을 끄면 지도에서 바로 위치를 조정할 수 있고, 위치저장을 누르면 현재 배치를 저장한 뒤 다시 고정합니다.
                        </div>
                        <div className={`phone-galaxy-settings-app__dev-model-head ${devLanguageModelPanelOpen ? 'is-open' : ''}`.trim()}>
                          <button
                            type="button"
                            className="phone-galaxy-settings-app__dev-model-toggle"
                            onClick={() => setDevLanguageModelPanelOpen((prev) => !prev)}
                            aria-expanded={devLanguageModelPanelOpen}
                          >
                            <strong>AI 언어모델 선택</strong>
                            <span>{devLanguageModelPanelOpen ? '접기' : '펼치기'}</span>
                          </button>
                          {devLanguageModelPanelOpen ? (
                            <button
                              type="button"
                              className="phone-galaxy-settings-app__mini-btn"
                              onClick={() => { void loadDevLmStudioModels?.(); }}
                              disabled={devLmStudioModelsLoading}
                            >
                              {devLmStudioModelsLoading ? '불러오는 중' : '새로고침'}
                            </button>
                          ) : null}
                        </div>
                        {devLanguageModelPanelOpen ? (
                          <div className="phone-galaxy-settings-app__dev-current">
                          {helperContacts.map((contact) => {
                            const contactKey = String(contact?.key || '').trim();
                            const usingDefaultModel = !String(phoneHelperModelOverrides?.[contactKey] || '').trim();
                            const selectedModelId = String(contact?.model || '-').trim() || '-';
                            return (
                              <div
                                key={`settings-dev-current-${contactKey}`}
                                className={`phone-galaxy-settings-app__dev-current-card ${usingDefaultModel ? 'is-default' : 'is-selected'}`.trim()}
                              >
                                <span>{contact.name}</span>
                                <em>{usingDefaultModel ? '기본값' : '직접 선택됨'}</em>
                                {devHelperModelRows.length ? (
                                  <label className={`phone-galaxy-settings-app__select-wrap ${usingDefaultModel ? 'is-default' : 'is-selected'}`.trim()}>
                                    <select
                                      className="phone-galaxy-settings-app__select"
                                      value={selectedModelId}
                                      onChange={(event) => applyPhoneHelperModelOverride?.(contactKey, event.target.value)}
                                    >
                                      {devHelperModelRows.map((modelId) => (
                                        <option key={`settings-dev-inline-model-${contactKey}-${modelId}`} value={modelId}>
                                          {modelId}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                ) : (
                                  <div className="phone-galaxy-settings-app__dev-empty">
                                    {devLmStudioModelsLoading ? 'LM Studio 모델 목록을 불러오는 중입니다.' : '현재 로드된 LM Studio 모델이 없습니다.'}
                                  </div>
                                )}
                                <strong className="phone-galaxy-settings-app__selected-model">{selectedModelId}</strong>
                                <button
                                  type="button"
                                  className="phone-galaxy-settings-app__mini-btn"
                                  onClick={() => resetPhoneHelperModelOverride?.(contactKey)}
                                  disabled={usingDefaultModel}
                                >
                                  기본값 복구
                                </button>
                              </div>
                            );
                          })}
                          </div>
                        ) : null}
                        {devLanguageModelPanelOpen && devLmStudioModelsError ? (
                          <div className="phone-galaxy-settings-app__dev-error">{devLmStudioModelsError}</div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="phone-galaxy-home-shell">
                    <div className="phone-galaxy-home-pages" aria-label="홈 화면 페이지">
                      <span className="phone-galaxy-home-pages__menu">≡</span>
                      {[0, 1, 2].map((index) => (
                        <button
                          key={`phone-page-dot-${index}`}
                          type="button"
                          className={`phone-galaxy-home-pages__dot ${phoneHomePage === index ? 'is-active' : ''}`.trim()}
                          aria-label={`홈 화면 ${index + 1}페이지`}
                          onClick={() => setPhoneHomePage(index)}
                        />
                      ))}
                      <span className="phone-galaxy-home-pages__add">＋</span>
                    </div>
                    <div className="phone-galaxy-home-panels-viewport">
                      <div className={`phone-galaxy-home-panels ${phoneHomeIsDragging ? 'is-dragging' : ''}`.trim()} style={phoneHomePanelsStyle}>
                        <section className="phone-galaxy-home-panel">
                          <div className={`phone-galaxy-home-app-grid ${phoneHomeReorderMode ? 'is-reordering' : ''}`.trim()}>
                            {phoneHomeDisplayApps.slice(0, 4).map(([label, key, emoji]) => {
                              const appPressKey = `home:${key}`;
                              return (
                                <button
                                  key={`home-app-${key}`}
                                  type="button"
                                  data-phone-home-app-key={key}
                                  className={`phone-galaxy-home-app ${phonePressedAppKey === appPressKey ? 'is-pressed' : ''} ${phoneHomeDraggingAppKey === key ? 'is-dragging' : ''} ${phoneHomeReorderMode ? 'is-reordering' : ''}`.trim()}
                                  onPointerDown={(event) => {
                                    flashPhoneAppPress(appPressKey);
                                    handlePhoneHomeAppPointerDown(event, key);
                                  }}
                                  onPointerMove={handlePhoneHomeAppPointerMove}
                                  onPointerUp={handlePhoneHomeAppPointerUp}
                                  onPointerCancel={handlePhoneHomeAppPointerCancel}
                                  onClick={(event) => handlePhoneHomeAppClick(event, [label, key, emoji])}
                                >
                                  <span className={`phone-galaxy-home-app__icon phone-galaxy-home-app__icon--${key} phone-galaxy-icon--emoji`} aria-hidden="true">{emoji}</span>
                                  <em>{label}</em>
                                </button>
                              );
                            })}
                            <button
                              type="button"
                              className="phone-galaxy-health-widget"
                              onClick={(event) => {
                                const origin = capturePhoneAppOrigin(event.currentTarget);
                                runPhonePressAction('widget:health', () => openPhoneApp('health', origin));
                              }}
                            >
                              <div className="phone-galaxy-health-widget__head">
                                <strong>건강</strong>
                                <span>{`${Math.round(Number(phoneHealthGaugeValue) || 0)}/100`}</span>
                              </div>
                              <div className="phone-galaxy-health-widget__hero">
                                <b>{`${Math.round(Number(phoneHealthGaugeValue) || 0)}`}</b>
                                <small>현재 컨디션</small>
                              </div>
                              <div className="phone-galaxy-health-widget__meter">
                                <span style={{ width: `${Math.max(0, Math.min(100, Number(phoneHealthGaugeValue) || 0))}%` }} />
                              </div>
                              <div className="phone-galaxy-health-widget__stats">
                                <div>
                                  <em>건강</em>
                                  <b>{`${Math.round(Number(phoneHealthGaugeValue) || 0)}/100`}</b>
                                  <small>현재 컨디션</small>
                                </div>
                                <div>
                                  <em>자가 노동력</em>
                                  <b>{`${Math.round(Number(phoneHealthGaugeValue) || 0)}/100`}</b>
                                  <small>오늘 작업 가능</small>
                                </div>
                              </div>
                            </button>
                            {phoneHomeDisplayApps.slice(4).map(([label, key, emoji]) => {
                              const appPressKey = `home:${key}`;
                              return (
                                <button
                                  key={`home-app-${key}`}
                                  type="button"
                                  data-phone-home-app-key={key}
                                  className={`phone-galaxy-home-app ${phonePressedAppKey === appPressKey ? 'is-pressed' : ''} ${phoneHomeDraggingAppKey === key ? 'is-dragging' : ''} ${phoneHomeReorderMode ? 'is-reordering' : ''}`.trim()}
                                  onPointerDown={(event) => {
                                    flashPhoneAppPress(appPressKey);
                                    handlePhoneHomeAppPointerDown(event, key);
                                  }}
                                  onPointerMove={handlePhoneHomeAppPointerMove}
                                  onPointerUp={handlePhoneHomeAppPointerUp}
                                  onPointerCancel={handlePhoneHomeAppPointerCancel}
                                  onClick={(event) => handlePhoneHomeAppClick(event, [label, key, emoji])}
                                >
                                  <span className={`phone-galaxy-home-app__icon phone-galaxy-home-app__icon--${key} phone-galaxy-icon--emoji`} aria-hidden="true">{emoji}</span>
                                  <em>{label}</em>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                        {[2, 3].map((pageNo) => (
                          <section key={`phone-home-panel-${pageNo}`} className="phone-galaxy-home-panel" />
                        ))}
                      </div>
                    </div>
                    <div className="phone-galaxy-bottom-dock">
                      <button
                        type="button"
                        className={`phone-galaxy-dock-app ${phonePressedAppKey === 'dock:phone' ? 'is-pressed' : ''}`.trim()}
                        aria-label="전화"
                        onPointerDown={() => flashPhoneAppPress('dock:phone')}
                        onClick={(event) => {
                          const origin = capturePhoneAppOrigin(event.currentTarget);
                          runPhonePressAction('dock:phone', () => openPhoneApp('contacts', origin));
                        }}
                      >
                        <span className="phone-galaxy-dock-app__icon phone-galaxy-dock-app__icon--phone phone-galaxy-icon--emoji" aria-hidden="true">📞</span>
                      </button>
                      <button
                        type="button"
                        className={`phone-galaxy-dock-app ${phonePressedAppKey === 'dock:message' ? 'is-pressed' : ''}`.trim()}
                        aria-label="메시지"
                        onPointerDown={() => flashPhoneAppPress('dock:message')}
                        onClick={(event) => {
                          const origin = capturePhoneAppOrigin(event.currentTarget);
                          runPhonePressAction('dock:message', () => openPhoneMessagesApp(origin));
                        }}
                      >
                        <span className="phone-galaxy-dock-app__icon phone-galaxy-dock-app__icon--msg phone-galaxy-icon--emoji" aria-hidden="true">💬</span>
                        {unreadMessageCount > 0 ? (
                          <span className="phone-galaxy-dock-app__badge" aria-label={`미읽은 메시지 ${unreadMessageCount}개`}>
                            {unreadMessageBadgeText}
                          </span>
                        ) : null}
                      </button>
                      <button
                        type="button"
                        className={`phone-galaxy-dock-app ${phonePressedAppKey === 'dock:web' ? 'is-pressed' : ''}`.trim()}
                        aria-label="인터넷"
                        onPointerDown={() => flashPhoneAppPress('dock:web')}
                        onClick={() => flashPhoneAppPress('dock:web', 165)}
                      >
                        <span className="phone-galaxy-dock-app__icon phone-galaxy-dock-app__icon--web phone-galaxy-icon--emoji" aria-hidden="true">🌐</span>
                      </button>
                      <button
                        type="button"
                        className={`phone-galaxy-dock-app ${phonePressedAppKey === 'dock:camera' ? 'is-pressed' : ''}`.trim()}
                        aria-label="카메라"
                        onPointerDown={() => flashPhoneAppPress('dock:camera')}
                        onClick={() => flashPhoneAppPress('dock:camera', 165)}
                      >
                        <span className="phone-galaxy-dock-app__icon phone-galaxy-dock-app__icon--cam phone-galaxy-icon--emoji" aria-hidden="true">📷</span>
                      </button>
                    </div>
                  </div>
                )}
                {phoneRecentViewOpen ? (
                  <div className="phone-galaxy-recents" aria-label="최근 앱">
                    <div className="phone-galaxy-recents__shade" onClick={() => setPhoneRecentViewOpen(false)} />
                    <div className="phone-galaxy-recents__head">
                      <strong>최근 앱</strong>
                      <span>좌우로 넘기고 위로 밀면 종료</span>
                    </div>
                    {phoneRecentApps.length ? (
                      <div className="phone-galaxy-recents__flow">
                        {phoneRecentApps.map(([label, key, emoji], index) => {
                          const normalizedKey = String(key || '').trim();
                          const offsetY = Number(phoneRecentDismissOffsetByKey[normalizedKey] || 0);
                          const relativeIndex = index - phoneRecentActiveIndex;
                          const depth = Math.abs(relativeIndex);
                          const dragShiftX = phoneRecentFlowDragX * Math.max(0.18, 1 - (depth * 0.18));
                          const recentCardScale = Math.max(0.72, 1 - (depth * 0.08) + (offsetY / 560));
                          const recentCardTransform = `translate3d(${(relativeIndex * 78) + dragShiftX}px, ${Math.round(offsetY)}px, ${depth * -42}px) rotateY(${relativeIndex * -16}deg) scale(${recentCardScale})`;
                          const isFarCard = depth > 3;
                          return (
                            <button
                              key={`phone-recent-app-${normalizedKey}`}
                              type="button"
                              className={`phone-galaxy-recents__card ${phoneOpenedApp === normalizedKey ? 'is-current' : ''}`.trim()}
                              style={{
                                '--phone-recent-index': relativeIndex,
                                '--phone-recent-depth': depth,
                                transform: recentCardTransform,
                                zIndex: 20 - depth,
                                pointerEvents: isFarCard ? 'none' : undefined,
                                opacity: isFarCard
                                  ? 0
                                  : (offsetY < 0 ? Math.max(0.2, 1 + (offsetY / 132)) : Math.max(0.34, 1 - (depth * 0.22)))
                              }}
                              onPointerDown={(event) => handlePhoneRecentPointerDown(event, normalizedKey)}
                              onPointerMove={handlePhoneRecentPointerMove}
                              onPointerUp={finishPhoneRecentPointer}
                              onPointerCancel={finishPhoneRecentPointer}
                              onClick={(event) => {
                                if (phoneRecentSuppressClickRef.current || Number(phoneRecentDismissOffsetByKey[normalizedKey] || 0) < -8) {
                                  phoneRecentSuppressClickRef.current = false;
                                  event.preventDefault();
                                  event.stopPropagation();
                                  return;
                                }
                                openPhoneRecentApp(normalizedKey);
                              }}
                            >
                              {renderPhoneRecentPreview(normalizedKey, label, emoji)}
                              <span className="phone-galaxy-recents__caption">
                                <strong>{label}</strong>
                                <em>{phoneOpenedApp === normalizedKey ? '사용 중' : '대기 중'}</em>
                              </span>
                              <span className="phone-galaxy-recents__handle" aria-hidden="true" />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="phone-galaxy-recents__empty">
                        <strong>실행 중인 앱 없음</strong>
                        <span>앱을 열면 여기에 표시됩니다.</span>
                      </div>
                    )}
                  </div>
                ) : null}
                {phoneAppLoadingView ? (
                  <div
                    className={`phone-galaxy-app-loader phone-galaxy-app-loader--${phoneAppLoadingView.tone || 'slate'}`.trim()}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="phone-galaxy-app-loader__orb" aria-hidden="true" />
                    <div className="phone-galaxy-app-loader__icon" aria-hidden="true">
                      {phoneAppLoadingView.icon}
                    </div>
                    <div className="phone-galaxy-app-loader__text">
                      <strong>{phoneAppLoadingView.label}</strong>
                      <span>{phoneAppLoadingView.detail}</span>
                    </div>
                    <div className="phone-galaxy-app-loader__bar" aria-hidden="true">
                      <span />
                    </div>
                  </div>
                ) : null}
                <div className="phone-galaxy-nav-bar">
                  <button
                    type="button"
                    className={phonePressedAppKey === 'nav:recent' ? 'is-pressed' : ''}
                    aria-label="최근 앱"
                    onPointerDown={() => flashPhoneAppPress('nav:recent')}
                    onClick={() => runPhonePressAction('nav:recent', togglePhoneRecentView)}
                  >
                    III
                  </button>
                  <button
                    type="button"
                    className={phonePressedAppKey === 'nav:home' ? 'is-pressed' : ''}
                    aria-label="홈"
                    onPointerDown={() => flashPhoneAppPress('nav:home')}
                    onClick={() => runPhonePressAction('nav:home', closePhoneRecentOrApp)}
                  >
                    O
                  </button>
                  <button
                    type="button"
                    className={phonePressedAppKey === 'nav:back' ? 'is-pressed' : ''}
                    aria-label="뒤로"
                    onPointerDown={() => flashPhoneAppPress('nav:back')}
                    onClick={() => runPhonePressAction('nav:back', closePhoneRecentOrApp)}
                  >
                    &lt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
