import appleHelperDoctorAvatar from '../../assets/images/phone/apple-helper-doctor.svg';
import managementHelperDoctorAvatar from '../../assets/images/phone/management-helper-doctor.svg';
import laborHelperChiefAvatar from '../../assets/images/phone/labor-helper-chief.svg';
import {
  APPLE_HELPER_PROMPT_LINES,
  MANAGEMENT_HELPER_PROMPT_LINES,
  LABOR_HELPER_PROMPT_LINES,
  buildPhoneHelperCommonPromptLines
} from './phoneHelperPrompts';

const PHONE_HELPER_FIELD_STATUS_QUESTION_REGEX = /(현재\s*상태|지금\s*상태|밭\s*상태|토지\s*상태|현재\s*밭|현재\s*토지|필드\s*상태|농장\s*상태|포장\s*상태|나무\s*상태|생육|생육\s*게이지|생장|성장|크는\s*정도|자라는\s*정도|얼마나\s*컸|잘\s*크|안\s*크|토양수분|토양양분|뿌리\s*수분|뿌리수분|뿌리\s*양분|뿌리양분|수분|관수|급수|물관리|물\s*줘|물\s*말라|물\s*부족|물\s*상태|물\s*얼마나|물\s*어때|양분|비료\s*상태|수세|착과량|품질|작황|컨디션)/i;
const PHONE_HELPER_MANAGEMENT_QUESTION_REGEX = /(자금|현금|잔액|돈|대출|이자|부채|상환|운영|경영|인건비|투자|예산|매출|수익|손익|비용|지출|신용|한도|재고|자재|창고|보관|저장|저온저장|시설|여력|박스|용기|팔레트|출하|판매가|판매|시세|마진|원가|회전율|수익성|품종|묘목|후지|감홍|시나노|시나노골드|뭘\s*심|뭘\s*심어|뭐\s*심|어떤\s*품종|무슨\s*품종|추천.*품종|투자할\s*가치|병목)/i;
const PHONE_HELPER_PRICE_QUESTION_REGEX = /(얼마|가격|값|비싸|싼|원|구매|사야|사는게|사면|비용)/i;
const PHONE_HELPER_VARIETY_QUESTION_REGEX = /(품종|묘목|후지|감홍|시나노|시나노골드|무슨\s*품종|어떤\s*품종|품종\s*추천|추천.*품종|뭘\s*심|뭘\s*심어|뭐\s*심|출하.*품종)/i;
const PHONE_HELPER_FORMULA_QUESTION_REGEX = /(계산|계산식|산출식|공식|어떻게\s*계산|어떻게\s*오르|어떻게\s*내리|뭐가\s*더해|뭐가\s*곱해|무슨\s*영향|뭐\s*영향|게이지|생육\s*게이지|생장\s*게이지|성장\s*게이지|생육이\s*왜|생육이\s*어떻게|생육이\s*안|생육이\s*오르|생육이\s*내리|왜\s*안\s*크|왜\s*덜\s*크|왜\s*떨어지|왜\s*낮아지|왜\s*막히|변화요소|기준|조건|언제\s*오르|언제\s*떨어지|뿌리\s*수분|뿌리수분|뿌리\s*양분|뿌리양분|수분이\s*왜|관수\s*왜|관수\s*해야|관수\s*말아|급수\s*왜|물\s*왜|물관리\s*왜|물\s*부족\s*왜|물\s*얼마나|물\s*줘야|비료\s*왜|양분이\s*왜)/i;
const PHONE_HELPER_PRUNING_QUESTION_REGEX = /(전정|강전정|약전정|동계전정|하계전정|전정도포|전정도포제|가지\s*치|가지치기|전정\s*가위|전정\s*톱|꽃눈|착과량)/i;
const PHONE_HELPER_SORTING_QUESTION_REGEX = /(APC|a\.?p\.?c\.?|산지유통센터|유통센터|선별장|출하장|선별|선과|다이|등급|A급|B급|가공품|상품과|품질\s*선별|크기\s*선별|1다이|2다이|3다이|4다이|5다이|6다이|7다이|8다이|9다이|10다이)/i;
const PHONE_HELPER_STORAGE_QUESTION_REGEX = /(APC|a\.?p\.?c\.?|산지유통센터|유통센터|저장동|저장라인|저장|보관|저온저장|저장고|냉장|냉방|장기저장|MCP|1-?MCP|부패|저장성|보관량|저장량|창고\s*여력|저장\s*여력)/i;

const PHONE_HELPER_TOOL_LABEL_BY_KEY = Object.freeze({
  'field-status': '현재 토지 상태',
  'field-formulas': '생육·게이지 산식',
  'month-tasks': '월별 작업 가이드',
  'pruning-guide': '전정 가이드',
  'pest-rules': '병해충 규칙',
  'weed-rules': '잡초 규칙',
  'sorting-rules': '선별 규칙',
  'storage-status': '저장 상태',
  'management-snapshot': '경영 현황',
  'labor-snapshot': '인력 현황',
  'variety-guide': '게임 품종 정보'
});

const PHONE_HELPER_BASIC_INFO_QUESTION_REGEX = /(날씨|기온|온도|몇\s*도|추워|더워|한파|폭염|날짜|며칠|몇월|몇 월|무슨\s*달|몇\s*월|지금\s*몇\s*월|오늘\s*상황|오늘\s*기본|오늘\s*브리핑|현재\s*상황|요약해|브리핑해|이번\s*달|이달|금월)/i;
const PHONE_HELPER_BASIC_INFO_REPLY_REGEX = /(날씨|기온|온도|도\s*(?:입니다|예요|네요)|\d+\s*도|오늘\s+\d+월|\d+월\s*\d+일|현재\s*날씨|현재\s*기온|오늘\s*할\s*일|작업\s*브리핑)/i;
const PHONE_HELPER_MONTH_TASK_QUESTION_REGEX = /(월별\s*작업|이번\s*달.*작업|이달.*작업|금월.*작업|몇월.*작업|몇\s*월.*작업|언제\s*무슨\s*작업|언제\s*뭐\s*해|지금\s*뭐\s*해|이번\s*달\s*뭐\s*해|이달\s*뭐\s*해|지금\s*해야\s*할\s*작업|시기별\s*작업|작업\s*시기|농사일정|월별\s*관리)/i;
const PHONE_HELPER_WEED_QUESTION_REGEX = /(잡초|제초|예초|라운드업|바스타|스톰프|브러시\s*커터|예초기|풀\s*베|풀베기|weed)/i;
const isPhoneHelperSortingQuestion = (text = '') => PHONE_HELPER_SORTING_QUESTION_REGEX.test(String(text || ''));
const isPhoneHelperStorageQuestion = (text = '') => PHONE_HELPER_STORAGE_QUESTION_REGEX.test(String(text || ''));
const PHONE_HELPER_SHORT_CONFIRM_REGEX = /^(예|네|넵|응|ㅇㅇ|그래|그럼|좋아|알려줘|알려주세요|해봐|해보세요|봐줘|봐주세요|확인해줘|확인해주세요|설명해줘|설명해주세요|말해줘|말해주세요)[.!?\s]*$/i;
const PHONE_HELPER_OFFER_PHRASE_REGEX = /(알려\s*드릴까요|알려\s*줄까요|볼까요|봐\s*드릴까요|봐줄까요|확인해\s*볼까요|확인해\s*드릴까요|짚어\s*드릴까요|짚어\s*볼까요|설명해\s*드릴까요|설명해\s*줄까요|말씀드릴까요|보시겠습니까|확인하시겠습니까)/i;
const PHONE_HELPER_PENDING_TOPIC_TOOL_KEYS = new Set([
  'field-status',
  'field-formulas',
  'month-tasks',
  'pruning-guide',
  'pest-rules',
  'weed-rules',
  'sorting-rules',
  'storage-status',
  'management-snapshot',
  'labor-snapshot',
  'variety-guide'
]);

export const PHONE_HELPER_CONTACTS = Object.freeze({
  'apple-helper': {
    name: '사과척척박사님',
    subtitle: '사과재배 상담',
    availability: 'online',
    avatarText: '박',
    avatarToneClass: 'tone-1',
    avatarImage: appleHelperDoctorAvatar,
    model: 'google/gemma-4-e4b',
    introText: '사과 재배, 생육, 병해충, 선별, 저장 관련 질문을 문자처럼 보내 보세요.',
    placeholder: '사과척척박사님께 물어보세요',
    quickPrompts: [],
    promptLines: APPLE_HELPER_PROMPT_LINES
  },
  'management-helper': {
    name: '경영척척박사님',
    subtitle: '자금 · 운영 · 경영 상담',
    availability: 'online',
    avatarText: '경',
    avatarToneClass: 'tone-2',
    avatarImage: managementHelperDoctorAvatar,
    model: 'google/gemma-4-e4b',
    introText: '자금 운용, 투자, 운영 판단 같은 경영 질문을 문자처럼 보내 보세요.',
    placeholder: '경영척척박사님께 물어보세요',
    quickPrompts: [],
    promptLines: MANAGEMENT_HELPER_PROMPT_LINES
  },
  'labor-helper': {
    name: '인력소장님',
    subtitle: '인력 대여 · 배정 상담',
    availability: 'online',
    avatarText: '인',
    avatarToneClass: 'tone-3',
    avatarImage: laborHelperChiefAvatar,
    model: 'google/gemma-4-e4b',
    introText: '외부 인력 대여, 작업 인원 배정, 노동력 부족 같은 질문을 문자처럼 보내 보세요.',
    placeholder: '인력소장님께 물어보세요',
    quickPrompts: [],
    promptLines: LABOR_HELPER_PROMPT_LINES
  }
});

export const DEFAULT_PHONE_HELPER_CONTACT_KEY = 'apple-helper';
export const APPLE_HELPER_CHAT_API_URL = '/__apple-helper/chat';

const PHONE_HELPER_PEST_QUESTION_REGEX = /(병해|병충해|해충|병균|응애|진딧물|노린재|깍지벌레|총채벌레|나방|검은별무늬병|갈반병|탄저병|흰가루병|점무늬낙엽병|부란병|방제|약제|농약|살충|살균)/i;
const normalizeAppleHelperChatMessage = (entry) => {
  const id = String(entry?.id || '').trim();
  const role = String(entry?.role || '').trim().toLowerCase();
  const text = String(entry?.text || '').trim();
  const createdAtRaw = entry?.createdAt;
  const createdAt = createdAtRaw instanceof Date
    ? createdAtRaw.getTime()
    : Number.isFinite(Number(createdAtRaw))
      ? Number(createdAtRaw)
      : Date.parse(String(createdAtRaw || ''));
  if (!id || !text || (role !== 'user' && role !== 'assistant')) return null;
  if (!Number.isFinite(createdAt) || createdAt <= 0) return null;
  return {
    id,
    role,
    text,
    createdAt
  };
};

export const normalizeAppleHelperChatMessages = (messages) => (
  Array.isArray(messages)
    ? messages
      .map(normalizeAppleHelperChatMessage)
      .filter(Boolean)
      .sort((a, b) => {
        if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
        return 0;
      })
    : []
);

const phoneHelperProfileSummaryText = (profile = {}, labelMap = {}, keys = [], clamp, limit = 2) => {
  const rows = (Array.isArray(keys) ? keys : [])
    .map((key) => ({
      key,
      label: String(labelMap?.[key] || key),
      value: clamp(Number(profile?.[key]) || 0, 0, 100)
    }))
    .filter((row) => row.value > 0.05)
    .sort((a, b) => b.value - a.value)
    .slice(0, Math.max(1, Math.floor(Number(limit) || 0)));
  return rows.length
    ? rows.map((row) => `${row.label} ${row.value.toFixed(1)}`).join(', ')
    : '특이 항목 없음';
};

export const normalizePhoneHelperContactKey = (contactKey) => (
  Object.prototype.hasOwnProperty.call(PHONE_HELPER_CONTACTS, contactKey)
    ? String(contactKey)
    : DEFAULT_PHONE_HELPER_CONTACT_KEY
);

export const normalizeAppleHelperChatThreads = (messages) => {
  if (Array.isArray(messages)) {
    return {
      [DEFAULT_PHONE_HELPER_CONTACT_KEY]: normalizeAppleHelperChatMessages(messages)
    };
  }
  if (!messages || typeof messages !== 'object') {
    return {
      [DEFAULT_PHONE_HELPER_CONTACT_KEY]: []
    };
  }
  const next = {};
  Object.keys(PHONE_HELPER_CONTACTS).forEach((contactKey) => {
    next[contactKey] = normalizeAppleHelperChatMessages(messages?.[contactKey] || []);
  });
  return next;
};

export const appleHelperChatMessagesOf = (messages, contactKey = DEFAULT_PHONE_HELPER_CONTACT_KEY) => {
  const normalizedThreads = normalizeAppleHelperChatThreads(messages);
  return normalizedThreads[normalizePhoneHelperContactKey(contactKey)] || [];
};

export const mergeAppleHelperChatThreads = (...threadGroups) => {
  const mergedByContact = {};
  Object.keys(PHONE_HELPER_CONTACTS).forEach((contactKey) => {
    const byId = new Map();
    threadGroups.forEach((group) => {
      const rows = appleHelperChatMessagesOf(group || {}, contactKey);
      rows.forEach((entry) => {
        if (!entry?.id) return;
        byId.set(String(entry.id), entry);
      });
    });
    mergedByContact[contactKey] = normalizeAppleHelperChatMessages([...byId.values()]);
  });
  return mergedByContact;
};

export const createAppleHelperChatMessage = (role = 'assistant', text = '') => ({
  id: `apple-helper-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  text: String(text || '').trim(),
  createdAt: Date.now()
});

export const appendAppleHelperChatText = (messages, messageId, chunkText) => (
  normalizeAppleHelperChatMessages(
    (Array.isArray(messages) ? messages : []).map((entry) => (
      entry?.id === messageId
        ? { ...entry, text: `${String(entry?.text || '')}${String(chunkText || '')}` }
        : entry
    ))
  )
);

const phoneHelperErrorTextOf = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => phoneHelperErrorTextOf(entry))
      .filter(Boolean)
      .join(' / ')
      .trim();
  }
  if (value && typeof value === 'object') {
    const preferred = [
      value.message,
      value.detail,
      value.error,
      value.reason,
      value.response,
      value.statusText
    ]
      .map((entry) => phoneHelperErrorTextOf(entry))
      .filter(Boolean);
    if (preferred.length) {
      return preferred.join(' / ').trim();
    }
    try {
      return JSON.stringify(value);
    } catch {
      return '[unserializable_error_object]';
    }
  }
  return '';
};

export const appleHelperChatErrorMessageOf = (error) => {
  const rawMessage = phoneHelperErrorTextOf(error?.message)
    || phoneHelperErrorTextOf(error?.detail)
    || phoneHelperErrorTextOf(error?.error)
    || phoneHelperErrorTextOf(error)
    || '';
  if (!rawMessage) {
    return 'LM Studio 응답을 확인하지 못했습니다.';
  }
  if (rawMessage.startsWith('lm_studio_http_')) {
    const status = Math.max(0, Number(rawMessage.slice('lm_studio_http_'.length)) || 0);
    if (status === 400) {
      return 'LM Studio 400 오류: 모델명 또는 요청 형식이 맞지 않습니다.';
    }
    if (status === 404) {
      return 'LM Studio 404 오류: chat 엔드포인트 또는 모델을 찾지 못했습니다.';
    }
    if (status === 500) {
      return 'LM Studio 500 오류: 모델 추론 중 내부 오류가 발생했습니다.';
    }
    return `LM Studio HTTP 오류: ${status}`;
  }
  if (rawMessage === 'lm_studio_empty_reply') {
    return 'LM Studio가 빈 답변을 반환했습니다.';
  }
  if (rawMessage === 'lm_stream_unavailable') {
    return 'LM Studio 스트리밍 응답을 읽지 못했습니다.';
  }
  if (rawMessage === 'Failed to fetch') {
    return '상담 프록시 연결에 실패했습니다. 게임 서버 상태를 확인해 주세요.';
  }
  if (rawMessage === 'AbortError') {
    return 'LM Studio 요청이 중단되었습니다.';
  }
  if (rawMessage === 'apple_helper_proxy_unavailable') {
    return '상담 프록시를 사용할 수 없습니다.';
  }
  return `LM Studio 연결 실패: ${rawMessage}`;
};

export const isPhoneHelperPestQuestion = (text) => PHONE_HELPER_PEST_QUESTION_REGEX.test(String(text || ''));
export const isPhoneHelperWeedQuestion = (text) => PHONE_HELPER_WEED_QUESTION_REGEX.test(String(text || ''));
export const isPhoneHelperBasicInfoQuestion = (text) => PHONE_HELPER_BASIC_INFO_QUESTION_REGEX.test(String(text || ''));
export const isPhoneHelperFieldStatusQuestion = (text) => PHONE_HELPER_FIELD_STATUS_QUESTION_REGEX.test(String(text || ''));
export const isPhoneHelperManagementQuestion = (text) => PHONE_HELPER_MANAGEMENT_QUESTION_REGEX.test(String(text || ''));
export const isPhoneHelperVarietyQuestion = (text) => PHONE_HELPER_VARIETY_QUESTION_REGEX.test(String(text || ''));
export const isPhoneHelperFormulaQuestion = (text) => PHONE_HELPER_FORMULA_QUESTION_REGEX.test(String(text || ''));
export const phoneHelperReplyIncludesBasicInfo = (text) => PHONE_HELPER_BASIC_INFO_REPLY_REGEX.test(String(text || ''));
export const isPhoneHelperShortConfirmReply = (text) => PHONE_HELPER_SHORT_CONFIRM_REGEX.test(String(text || '').trim());

export const normalizePhoneHelperPendingTopicByContact = (raw = {}) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw).flatMap(([contactKey, topicKey]) => {
      const normalizedContactKey = normalizePhoneHelperContactKey(contactKey);
      const normalizedTopicKey = String(topicKey || '').trim();
      return PHONE_HELPER_PENDING_TOPIC_TOOL_KEYS.has(normalizedTopicKey)
        ? [[normalizedContactKey, normalizedTopicKey]]
        : [];
    })
  );
};

export const phoneHelperPendingTopicFromAssistantReply = (replyText = '') => {
  const text = String(replyText || '').trim();
  if (!text || !PHONE_HELPER_OFFER_PHRASE_REGEX.test(text)) return '';
  if (isPhoneHelperPestQuestion(text)) return 'pest-rules';
  if (PHONE_HELPER_PRUNING_QUESTION_REGEX.test(text)) return 'pruning-guide';
  if (PHONE_HELPER_MONTH_TASK_QUESTION_REGEX.test(text)) return 'month-tasks';
  if (isPhoneHelperWeedQuestion(text)) return 'weed-rules';
  if (isPhoneHelperSortingQuestion(text)) return 'sorting-rules';
  if (isPhoneHelperStorageQuestion(text)) return 'storage-status';
  if (isPhoneHelperFormulaQuestion(text)) return 'field-formulas';
  if (isPhoneHelperFieldStatusQuestion(text)) return 'field-status';
  if (isPhoneHelperVarietyQuestion(text)) return 'variety-guide';
  if (isPhoneHelperManagementQuestion(text)) return 'management-snapshot';
  return '';
};

const uniquePhoneHelperToolKeys = (toolKeys) => {
  const unique = [];
  (Array.isArray(toolKeys) ? toolKeys : []).forEach((toolKey) => {
    const normalized = String(toolKey || '').trim();
    if (!normalized || unique.includes(normalized)) return;
    unique.push(normalized);
  });
  return unique;
};

export const planPhoneHelperToolCalls = ({ text = '', contactKey = '', pendingTopicKey = '' } = {}) => {
  const normalizedText = String(text || '');
  const normalizedContactKey = normalizePhoneHelperContactKey(contactKey);
  const toolKeys = [];
  const asksPrice = PHONE_HELPER_PRICE_QUESTION_REGEX.test(normalizedText);
  const normalizedPendingTopicKey = String(pendingTopicKey || '').trim();

  if (PHONE_HELPER_PENDING_TOPIC_TOOL_KEYS.has(normalizedPendingTopicKey) && isPhoneHelperShortConfirmReply(normalizedText)) {
    toolKeys.push(normalizedPendingTopicKey);
    if (['pest-rules', 'weed-rules', 'pruning-guide', 'field-formulas'].includes(normalizedPendingTopicKey)) {
      toolKeys.push('field-status');
    }
  }

  if (isPhoneHelperFieldStatusQuestion(normalizedText)) {
    toolKeys.push('field-status');
  }
  if (isPhoneHelperFormulaQuestion(normalizedText)) {
    toolKeys.push('field-status', 'field-formulas');
  }
  if (PHONE_HELPER_MONTH_TASK_QUESTION_REGEX.test(normalizedText)) {
    toolKeys.push('month-tasks');
  }
  if (PHONE_HELPER_PRUNING_QUESTION_REGEX.test(normalizedText)) {
    toolKeys.push('field-status', 'pruning-guide');
  }
  if (isPhoneHelperPestQuestion(normalizedText)) {
    toolKeys.push('field-status', 'pest-rules');
  }
  if (isPhoneHelperWeedQuestion(normalizedText)) {
    toolKeys.push('field-status', 'weed-rules');
  }
  if (normalizedContactKey === 'management-helper') {
    toolKeys.push('management-snapshot');
  }
  if (normalizedContactKey === 'labor-helper') {
    toolKeys.push('labor-snapshot');
  }
  if (normalizedContactKey === 'apple-helper') {
    if (isPhoneHelperVarietyQuestion(normalizedText)) {
      toolKeys.push('variety-guide');
    }
    if (isPhoneHelperSortingQuestion(normalizedText)) {
      toolKeys.push('sorting-rules');
    }
    if (isPhoneHelperStorageQuestion(normalizedText)) {
      toolKeys.push('storage-status');
    }
    if (asksPrice && (isPhoneHelperWeedQuestion(normalizedText) || isPhoneHelperPestQuestion(normalizedText) || isPhoneHelperVarietyQuestion(normalizedText))) {
      toolKeys.push('management-snapshot');
    }
  } else {
    if (isPhoneHelperManagementQuestion(normalizedText)) {
      toolKeys.push('management-snapshot');
    }
  }

  return uniquePhoneHelperToolKeys(toolKeys);
};

export const buildPhoneHelperFieldStatusContext = ({ field, deps }) => {
  const { clamp, growthStageLabel } = deps;

  if (!field) {
    return [
      '[현재 토지 상태 참고]',
      '현재 선택된 토지가 없어 토지 상태 수치를 읽지 못했다.',
      '토지가 지정되지 않았다고 분명하게 말하고, 코드에 없는 값은 추정하지 마라.'
    ].join('\n');
  }

  return [
    '[현재 토지 상태 참고]',
    `토지명: ${String(field?.name || '이름 없음')}`,
    `생육 단계: ${String(growthStageLabel(field) || '정보 없음')}`,
    `현재 수치: 생육 ${clamp(Number(field?.growth) || 0, 0, 100).toFixed(1)} / 토양수분 ${clamp(Number(field?.water) || 0, 0, 100).toFixed(1)} / 토양양분 ${clamp(Number(field?.nutrition) || 0, 0, 100).toFixed(1)}`,
    `추가 수치: 잡초 ${clamp(Number(field?.weed) || 0, 0, 100).toFixed(1)} / 병충해 ${clamp(Number(field?.pest) || 0, 0, 100).toFixed(1)} / 수세 ${clamp(Number(field?.vigor) || 0, 0, 100).toFixed(1)}`,
    `품질 ${clamp(Number(field?.quality) || 0, 0, 100).toFixed(1)} / 주당 평균 착과량 ${Math.max(0, Number(field?.fruitLoadPerTree) || 0).toFixed(1)}`,
    '답변할 때는 위 수치를 우선 사용하고, 없는 값은 없다고 말해라.'
  ].join('\n');
};

export const buildPhoneHelperFieldFormulaContext = ({ game, field, deps }) => {
  const {
    clamp,
    toDate,
    growthStageLabel,
    monthOf,
    calendarGrowthPercent,
    canopySunlightSeasonTargetByMonth,
    canopySunlightWeatherAdjustment,
    canopySunlightVigorAdjustment,
    canopySunlightAgeAdjustmentForField,
    canopySunlightAdjustedByDayOfField,
    canopySunlightQualityBonusOf,
    dailyWaterDrain,
    rainfallWaterGain,
    dailyNutritionDrain,
    dailyWeedIncrease,
    dailyWeedWeatherBonus,
    dailyWeedNutritionBonus,
    dailyWeedWaterBonus,
    WEED_RAIN_WEATHER_BOOST_MULTIPLIER,
    WEED_MOW_GROWTH_REDUCTION_RATIO,
    pestIncreaseAgeMultiplierForField,
    vigorImpactAgeMultiplierForField,
    dailyPestIncrease,
    waterPestStressBonus,
    dailyHighVigorPestBonus,
    seasonKey,
    PEST_RAIN_WEATHER_BOOST_MULTIPLIER,
    CANOPY_SUNLIGHT_VIGOR_GAIN_MIN,
    dailyVigorIncrease,
    vigorGrowthAgeMultiplierForField,
    fruitLoadVigorDeltaByAgeForField,
    pestVigorPenaltyByLevel,
    severeWeedVigorPenaltyByLevel
  } = deps;

  if (!field) {
    return [
      '[생육·게이지 산식 참고]',
      '현재 선택된 토지가 없어 게이지 산식을 현재 값 기준으로 풀 수 없다.',
      '토지가 지정되지 않았다고 분명히 말하고, 일반식만 아주 짧게 설명해라.'
    ].join('\n');
  }

  const weatherName = String(game?.weather || '');
  const nextDay = Math.max(1, Math.floor(Number(game?.day) || 1) + 1);
  const nextMonth = monthOf(nextDay);
  const projectedGrowth = calendarGrowthPercent(nextDay, field?.lastHarvestYear, field?.cropId);
  const growthDelta = projectedGrowth - (Number(field?.growth) || 0);
  const sunlightSeasonBase = canopySunlightSeasonTargetByMonth(nextMonth);
  const sunlightWeatherAdj = canopySunlightWeatherAdjustment(weatherName);
  const sunlightVigorAdj = canopySunlightVigorAdjustment(field?.vigor);
  const sunlightAgeAdj = canopySunlightAgeAdjustmentForField(field, nextDay);
  const sunlightProjected = canopySunlightAdjustedByDayOfField(field, nextDay, weatherName);
  const waterDrainBase = dailyWaterDrain(nextMonth, weatherName);
  const waterRainGain = rainfallWaterGain(weatherName);
  const nutritionDrainBase = dailyNutritionDrain(nextMonth);
  const weedWeatherBonus = dailyWeedWeatherBonus(weatherName);
  const weedNutritionBonus = dailyWeedNutritionBonus(field?.nutrition);
  const weedWaterBonus = dailyWeedWaterBonus(field?.water);
  const weedRainBoostUntilDay = Math.max(0, Number(game?.weedRainBoostUntilDay) || 0);
  const weedRainMultiplier = nextDay <= weedRainBoostUntilDay
    ? WEED_RAIN_WEATHER_BOOST_MULTIPLIER
    : 1;
  const weedGrowthReductionUntilDay = Math.max(0, Number(field?.weedGrowthReductionUntilDay) || 0);
  const weedGrowthReductionActive = weedGrowthReductionUntilDay > 0 && nextDay <= weedGrowthReductionUntilDay;
  const weedRaw = dailyWeedIncrease(nextMonth) + weedWeatherBonus + weedNutritionBonus + weedWaterBonus;
  const weedAfterRainBoost = weedRaw > 0 ? (weedRaw * weedRainMultiplier) : weedRaw;
  const weedAfterMow = weedGrowthReductionActive
    ? (weedAfterRainBoost * (1 - WEED_MOW_GROWTH_REDUCTION_RATIO))
    : weedAfterRainBoost;
  const pestAgeMul = pestIncreaseAgeMultiplierForField(field, nextDay);
  const pestVigorAgeMul = vigorImpactAgeMultiplierForField(field, nextDay);
  const pestBase = dailyPestIncrease(nextMonth, weatherName);
  const pestWaterStressBonus = waterPestStressBonus(field?.water);
  const pestHighVigorBonus = dailyHighVigorPestBonus(field?.vigor) * pestVigorAgeMul;
  const pestWeedMultiplier = (Number(field?.weed) || 0) >= 60 && (Number(field?.weed) || 0) < 80 ? 1.15 : 1;
  const isWinterSeason = seasonKey(nextMonth) === 'winter';
  const pestRainBoostUntilDay = Math.max(0, Number(game?.pestRainBoostUntilDay) || 0);
  const pestRainMultiplier = (!isWinterSeason && nextDay <= pestRainBoostUntilDay)
    ? PEST_RAIN_WEATHER_BOOST_MULTIPLIER
    : 1;
  const pestProjectedDelta = ((pestBase + pestWaterStressBonus + pestHighVigorBonus) * pestWeedMultiplier) * pestAgeMul * pestRainMultiplier;
  const vigorSunlightProjected = canopySunlightAdjustedByDayOfField(field, nextDay, weatherName);
  const vigorGainEnabled = vigorSunlightProjected >= CANOPY_SUNLIGHT_VIGOR_GAIN_MIN;
  const vigorBaseRaw = dailyVigorIncrease(nextMonth, weatherName, field?.nutrition, field?.water) * vigorGrowthAgeMultiplierForField(field, nextDay);
  const vigorFruitLoadRaw = fruitLoadVigorDeltaByAgeForField(field, nextDay);
  const vigorBaseApplied = vigorGainEnabled ? vigorBaseRaw : Math.min(0, vigorBaseRaw);
  const vigorFruitLoadApplied = vigorGainEnabled ? vigorFruitLoadRaw : Math.min(0, vigorFruitLoadRaw);
  const vigorPestPenalty = pestVigorPenaltyByLevel(field?.pest);
  const vigorWeedPenalty = severeWeedVigorPenaltyByLevel(field?.weed);
  const nextDate = toDate(nextDay);

  return [
    '[생육·게이지 산식 참고]',
    `현재 농지: ${String(field?.name || '이름 없음')} / 생육단계: ${String(growthStageLabel(field) || '정보 없음')}`,
    `기준일: ${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')} / 날씨: ${weatherName || '정보 없음'}`,
    `생육 게이지: 내일 생육값 = calendarGrowthPercent(다음날, lastHarvestYear, cropId), 현재 ${clamp(Number(field?.growth) || 0, 0, 100).toFixed(1)} -> 내일 ${projectedGrowth.toFixed(1)} (변화 ${growthDelta >= 0 ? '+' : ''}${growthDelta.toFixed(1)}%p)`,
    `뿌리 수분: 강수 유입 ${waterRainGain >= 0 ? '+' : ''}${waterRainGain.toFixed(2)} - 기본 소모 ${waterDrainBase.toFixed(2)} = ${(waterRainGain - waterDrainBase) >= 0 ? '+' : ''}${(waterRainGain - waterDrainBase).toFixed(2)} /일`,
    `뿌리 양분: 기본적으로 dailyNutritionDrain(${nextMonth})만큼 ${nutritionDrainBase.toFixed(2)} 감소하고, 비료/엽면시비 작업 때 즉시 회복된다.`,
    `잡초 게이지: (월기본 ${dailyWeedIncrease(nextMonth).toFixed(2)} + 날씨 ${weedWeatherBonus >= 0 ? '+' : ''}${weedWeatherBonus.toFixed(2)} + 양분 ${weedNutritionBonus >= 0 ? '+' : ''}${weedNutritionBonus.toFixed(2)} + 수분 ${weedWaterBonus >= 0 ? '+' : ''}${weedWaterBonus.toFixed(2)}) x 비지속 ${weedRainMultiplier.toFixed(2)} x 예초억제 ${weedGrowthReductionActive ? (1 - WEED_MOW_GROWTH_REDUCTION_RATIO).toFixed(2) : '1.00'} = ${weedAfterMow >= 0 ? '+' : ''}${weedAfterMow.toFixed(2)} /일`,
    `병충해 게이지: (기본 ${pestBase.toFixed(2)} + 수분스트레스 ${pestWaterStressBonus >= 0 ? '+' : ''}${pestWaterStressBonus.toFixed(2)} + 고수세 ${pestHighVigorBonus >= 0 ? '+' : ''}${pestHighVigorBonus.toFixed(2)}) x 잡초배율 ${pestWeedMultiplier.toFixed(2)} x 수령배율 ${pestAgeMul.toFixed(2)} x 강수배율 ${pestRainMultiplier.toFixed(2)} = +${Math.max(0, pestProjectedDelta).toFixed(2)} /일`,
    `수세 게이지: (기본증감 ${vigorBaseApplied >= 0 ? '+' : ''}${vigorBaseApplied.toFixed(2)} + 착과연동 ${vigorFruitLoadApplied >= 0 ? '+' : ''}${vigorFruitLoadApplied.toFixed(2)}) - 병충해 ${vigorPestPenalty.toFixed(2)} - 잡초 ${vigorWeedPenalty.toFixed(2)} = ${((vigorBaseApplied + vigorFruitLoadApplied) - vigorPestPenalty - vigorWeedPenalty) >= 0 ? '+' : ''}${((vigorBaseApplied + vigorFruitLoadApplied) - vigorPestPenalty - vigorWeedPenalty).toFixed(2)} /일`,
    `수관 일조량: 계절기본 ${sunlightSeasonBase.toFixed(1)} + 날씨 ${sunlightWeatherAdj >= 0 ? '+' : ''}${sunlightWeatherAdj.toFixed(1)} + 수세 ${sunlightVigorAdj >= 0 ? '+' : ''}${sunlightVigorAdj.toFixed(1)} + 수령 ${sunlightAgeAdj >= 0 ? '+' : ''}${sunlightAgeAdj.toFixed(1)} = ${sunlightProjected.toFixed(1)} /100, 품질보너스 +${canopySunlightQualityBonusOf(sunlightProjected).toFixed(2)} /일`,
    '질문이 계산식이면 위 줄을 그대로 근거로 삼아 어떤 항목이 더해지고 어떤 배수가 곱해지는지 설명해라. 게임에 공식이 없다고 말하지 마라.'
  ].join('\n');
};

export const buildPhoneHelperMonthTaskContext = ({ game, field, deps }) => {
  const {
    monthOf,
    growthStageLabel,
    monthTaskText = {},
    monthLaborLoad = {},
    tasks = {},
    isTaskSeasonActive
  } = deps || {};

  const currentDay = Math.max(1, Math.floor(Number(game?.day) || 1));
  const currentMonth = typeof monthOf === 'function' ? monthOf(currentDay) : 1;
  const monthTaskSummary = String(monthTaskText?.[currentMonth] || '').trim() || '등록된 월 작업 요약 없음';
  const laborLoadText = String(monthLaborLoad?.[currentMonth] || '').trim() || '정보 없음';
  const monthTaskRows = Object.values(tasks || {})
    .filter((task) => task && typeof task === 'object')
    .filter((task) => (
      typeof isTaskSeasonActive === 'function'
        ? isTaskSeasonActive(field || null, task, currentMonth)
        : (Array.isArray(task?.months) && task.months.includes(currentMonth))
    ))
    .map((task) => {
      const label = String(task?.label || task?.key || '작업').trim() || '작업';
      const crew = String(task?.type || '').trim();
      return crew ? `${label} (${crew})` : label;
    })
    .filter(Boolean);
  const uniqueMonthTaskRows = [...new Set(monthTaskRows)];

  return [
    '[월별 작업 가이드 참고]',
    `${currentMonth}월 작업 요약: ${monthTaskSummary}`,
    `${currentMonth}월 작업 강도: ${laborLoadText}`,
    uniqueMonthTaskRows.length
      ? `${currentMonth}월 코드상 시즌 작업: ${uniqueMonthTaskRows.join(' / ')}`
      : `${currentMonth}월 코드상 시즌 작업 목록 없음`,
    field
      ? `현재 토지 상태 참고: ${String(field?.name || '이름 없음')} / 생육단계 ${String(growthStageLabel?.(field) || '정보 없음')} / 생육 ${Math.max(0, Number(field?.growth) || 0).toFixed(1)} / 수세 ${Math.max(0, Number(field?.vigor) || 0).toFixed(1)} / 수분 ${Math.max(0, Number(field?.water) || 0).toFixed(1)} / 양분 ${Math.max(0, Number(field?.nutrition) || 0).toFixed(1)}`
      : '현재 선택된 토지가 없어 토지 상태 기준 보정은 할 수 없다.',
    '월별 작업 질문에는 위 월 작업 요약과 코드상 시즌 작업을 먼저 기준으로 설명해라.',
    '현재 토지 상태가 있으면 지금 바로 해도 되는지, 먼저 미뤄야 하는지까지 짧게 덧붙여라.',
    '코드에 없는 월별 일정은 지어내지 마라.'
  ].join('\n');
};

export const buildPhoneHelperPruningContext = ({ game, field, deps }) => {
  const {
    clamp,
    growthStageLabel,
    tasks = {}
  } = deps || {};

  const lightTask = tasks?.winterPruning || null;
  const heavyTask = tasks?.winterPruningHeavy || null;
  const currentDay = Math.max(1, Math.floor(Number(game?.day) || 1));
  const currentYear = Number.isFinite(Number(game?.year))
    ? Math.max(1, Math.floor(Number(game?.year)))
    : null;
  const modeByAge = field?.winterPruningModeByAge && typeof field.winterPruningModeByAge === 'object'
    ? field.winterPruningModeByAge
    : {};
  const modeRows = Object.entries(modeByAge)
    .map(([ageYear, mode]) => {
      const age = Math.max(1, Math.floor(Number(ageYear) || 0));
      if (!age) return '';
      return `${age}년차: ${String(mode || '') === 'heavy' ? '강전정' : '약전정'}`;
    })
    .filter(Boolean)
    .sort((a, b) => {
      const aAge = Number(a.split('년차:')[0]) || 0;
      const bAge = Number(b.split('년차:')[0]) || 0;
      return aAge - bAge;
    });

  return [
    '[전정 가이드 참고]',
    `코드상 동계전정 작업: ${String(lightTask?.label || '동계전정(약)')} / ${String(heavyTask?.label || '동계전정(강)')}`,
    `작업 가능 시기: ${Array.isArray(lightTask?.months) && lightTask.months.length ? lightTask.months.join(', ') : '정보 없음'}월`,
    `약전정 기준: 속성상 ${Math.max(0, Number(lightTask?.labor) || 0)} 노동력, ${Math.max(0, Number(lightTask?.speed) || 0)} 속도. 가지를 적게 치는 방향이고 수세는 내려가며 꽃눈·착과량은 늘어나는 쪽으로 설명해라.`,
    `강전정 기준: 속성상 ${Math.max(0, Number(heavyTask?.labor) || 0)} 노동력, ${Math.max(0, Number(heavyTask?.speed) || 0)} 속도. 가지를 강하게 치는 방향이고 수세는 올라가며 꽃눈·착과량은 줄어드는 쪽으로 설명해라.`,
    '운용 원칙: 수세가 너무 약하면 강전정으로 회복시키고, 수세가 너무 강하면 약전정으로 진정시키는 방향이라고 설명해라.',
    '후속 작업: 전정 후에는 절단면 보호를 위한 전정도포제 작업이 이어진다고 설명해라.',
    field
      ? `현재 토지 상태 참고: ${String(field?.name || '이름 없음')} / 생육단계 ${String(growthStageLabel?.(field) || '정보 없음')} / 수세 ${clamp ? clamp(Number(field?.vigor) || 0, 0, 100).toFixed(1) : Math.max(0, Number(field?.vigor) || 0).toFixed(1)} / 착과량 ${Math.max(0, Number(field?.fruitLoadPerTree) || 0).toFixed(1)} / 전정효과연도 ${Math.max(0, Math.floor(Number(field?.winterPruningEffectYear) || 0))}`
      : '현재 선택된 토지가 없어 수세 기준 세부 조언은 일반론으로만 해야 한다.',
    field && modeRows.length
      ? `현재 토지 연령별 전정 기록: ${modeRows.join(' / ')}`
      : '현재 토지에는 저장된 연령별 강전정/약전정 기록이 없거나 아직 전정 전이다.',
    currentYear
      ? `현재 게임 연도 참고: ${currentYear}년 / 게임일수 ${currentDay}일`
      : `현재 게임일수 참고: ${currentDay}일`,
    '전정 질문에는 강전정과 약전정의 차이, 언제 어느 쪽을 쓰는지, 전정 후 도포 필요 여부를 우선 설명해라.',
    '코드에 없는 세부 전정법이나 수형 이론은 지어내지 말고, 필요하면 일반적인 경향이라고만 짧게 밝혀라.'
  ].join('\n');
};

export const buildPhoneHelperPestContext = ({ game, field, deps }) => {
  const {
    clamp,
    toDate,
    weatherRiskBandOf,
    growthStageLabel,
    normalizePestProfile,
    normalizeDiseaseProfile,
    composePestGaugeValue,
    waterPestStressBonus,
    vigorImpactAgeMultiplierForField,
    dailyHighVigorPestBonus,
    cleanupWastePenaltyProfileOfField,
    pestIncreaseAgeMultiplierForField,
    seasonKey,
    PEST_RAIN_WEATHER_BOOST_MULTIPLIER,
    dailyPestIncrease,
    dailyPestQualityPenalty,
    dailyPestDeathChance,
    PEST_PROFILE_LABEL_BY_KEY,
    PEST_PROFILE_KEYS,
    DISEASE_PROFILE_LABEL_BY_KEY,
    DISEASE_PROFILE_KEYS
  } = deps;

  if (!field) {
    return [
      '[병해충 규칙 참고]',
      '현재 선택된 농지가 없어 병해충 세부 상태는 비어 있다.',
      '코드에 있는 규칙만 말하고, 수치가 없으면 추정이라고 분명히 밝혀라.'
    ].join('\n');
  }

  const currentDay = Math.max(1, Math.floor(Number(game?.day) || 1));
  const currentDate = toDate(currentDay);
  const month = currentDate.getMonth() + 1;
  const weatherName = String(game?.weather || 'clear');
  const temperatureC = Number(game?.temperatureC) || 0;
  const weatherBand = weatherRiskBandOf(weatherName, temperatureC);
  const stageLabel = String(growthStageLabel(field) || '정보 없음');
  const pestProfile = normalizePestProfile(field?.pestProfile, Number(field?.pest ?? 10));
  const diseaseProfile = normalizeDiseaseProfile(field?.diseaseProfile, Number(field?.pest ?? 10));
  const pestGauge = clamp(
    Number(field?.pest) || composePestGaugeValue(pestProfile, diseaseProfile),
    0,
    100
  );
  const waterBonus = waterPestStressBonus(field?.water);
  const vigorAgeMul = vigorImpactAgeMultiplierForField(field, currentDay + 1);
  const highVigorBonus = dailyHighVigorPestBonus(field?.vigor) * vigorAgeMul;
  const cleanupPenalty = cleanupWastePenaltyProfileOfField(field);
  const ageMul = pestIncreaseAgeMultiplierForField(field, currentDay + 1);
  const weedValue = clamp(Number(field?.weed) || 0, 0, 100);
  const weedMul = (weedValue >= 60 && weedValue < 80) ? 1.15 : 1;
  const isWinterSeason = seasonKey(month) === 'winter';
  const pestRainBoostUntilDay = Math.max(0, Number(game?.pestRainBoostUntilDay) || 0);
  const rainMul = (!isWinterSeason && (currentDay + 1) <= pestRainBoostUntilDay)
    ? PEST_RAIN_WEATHER_BOOST_MULTIPLIER
    : 1;
  const pestBase = dailyPestIncrease(month, weatherName);
  const diseaseBase = Math.max(
    0,
    (pestBase * 0.8)
      + (weatherBand === 'rain' ? 0.24 : 0)
      + (weatherBand === 'humid' ? 0.15 : 0)
  );
  const pestQualityPenalty = dailyPestQualityPenalty(pestGauge);
  const pestDeathChancePercent = dailyPestDeathChance(pestGauge) * 100;
  const topPests = phoneHelperProfileSummaryText(
    pestProfile,
    PEST_PROFILE_LABEL_BY_KEY,
    PEST_PROFILE_KEYS,
    clamp,
    2
  );
  const topDiseases = phoneHelperProfileSummaryText(
    diseaseProfile,
    DISEASE_PROFILE_LABEL_BY_KEY,
    DISEASE_PROFILE_KEYS,
    clamp,
    2
  );

  return [
    '[병해충 규칙 참고]',
    `현재 농지: ${String(field?.name || '이름 없음')} / 생육단계: ${stageLabel}`,
    `현재 상태: 병해충 ${pestGauge.toFixed(1)}, 수분 ${clamp(Number(field?.water) || 0, 0, 100).toFixed(1)}, 잡초 ${weedValue.toFixed(1)}, 수세 ${clamp(Number(field?.vigor) || 0, 0, 100).toFixed(1)}`,
    `현재 상위 해충: ${topPests}`,
    `현재 상위 병: ${topDiseases}`,
    `해충 일일 기본증가식: (월/날씨 기본 ${pestBase.toFixed(2)} + 수분스트레스 ${waterBonus.toFixed(2)} + 고수세 ${highVigorBonus.toFixed(2)} + 정리미흡 ${Number(cleanupPenalty?.pestDailyBonus || 0).toFixed(2)}) x 잡초보정 ${weedMul.toFixed(2)} x 수령보정 ${ageMul.toFixed(2)} x 비보정 ${rainMul.toFixed(2)}`,
    `병 일일 기본증가식: (${pestBase.toFixed(2)} x 0.8) + ${(weatherBand === 'rain') ? '강우보정 0.24' : '강우보정 0'} + ${(weatherBand === 'humid') ? '다습보정 0.15' : '다습보정 0'} = ${diseaseBase.toFixed(2)}`,
    `품질 페널티는 병해충 45 이상부터 시작하고 현재 예상 일일 품질 페널티는 ${pestQualityPenalty.toFixed(2)}다.`,
    `병해충 폐사 확률은 현재 ${pestDeathChancePercent.toFixed(1)}%다.`,
    '약제 우선 기준: 병균 게이지가 높으면 살균제 축(캡탄/만코제브/클로로탈로닐/테부코나졸/스트로빌루린), 해충 게이지가 높으면 살충제 축(아세타미프리드/이미다클로프리드/에마멕틴/스피노사드)을 먼저 본다.',
    '시기 기준: 동제(보르도액/코사이드)는 휴면~발아 전, 수확 후 방어 쪽이 유리하고, 오일제(기계유/정제유)는 월동 해충 밀도 억제용이다. 영양제(칼슘/붕소)는 생육 보정용이고 칼슘/붕소 비율을 각각 30% 이상 맞추면 엽면시비 효율이 최대다.',
    '혼용 규칙: 제초제(라운드업/바스타/스톰프)는 단독 배합만 허용된다. 동제(보르도액/코사이드)와 오일제(기계유/정제유)는 혼용할 수 없다. 응애약(버티맥/엔비도) 동시 혼용도 약해 위험으로 제한된다.',
    '개화기 패널티/제한: 살충제는 개화기 수분곤충 보호 때문에 사용 제한이 크다. 버티맥/엔비도/스피노사드도 개화기 사용 불가 또는 강한 불이익이 붙는다. 캡탄은 낙화~유과 초기 과피 러셋 리스크가 있다.',
    '추천 배합 우선순위: 병해충 상세진단에서 현재 가장 높은 해충/병균 게이지를 먼저 보고, 그 게이지에 맞는 약제를 우선 추천한다. 생육단계와 맞지 않는 약제는 추천 우선순위를 내린다.',
    '작업 순서 기준: 살포기 선택 -> 물받기 -> 약제배합 -> 약제살포 순서다. 버튼이 막히면 살포기 미선택, 배합액 부족, 시기/단계 불일치부터 먼저 의심한다.',
    '답변할 때는 코드에 있는 규칙만 말하고, 계산식 질문이면 어떤 항목이 더해지고 어떤 배수가 곱해지는지 짧게 풀어서 설명해라.',
    '코드에 없는 내용은 추정이라고 분명히 밝혀라.'
  ].join('\n');
};

export const buildPhoneHelperWeedContext = ({ game, field, deps }) => {
  const {
    clamp,
    toDate,
    dailyWeedIncrease,
    dailyWeedWeatherBonus,
    dailyWeedNutritionBonus,
    dailyWeedWaterBonus,
    WEED_RAIN_WEATHER_BOOST_MULTIPLIER,
    WEED_MOW_GROWTH_REDUCTION_RATIO,
    WEED_MOW_REDUCE_AMOUNT,
    WEED_MOW_GROWTH_REDUCTION_DAYS,
    RIDE_MOWER_WEED_FLOOR,
    WALK_MOWER_WEED_FLOOR
  } = deps;

  if (!field) {
    return [
      '[잡초 규칙 참고]',
      '현재 선택된 농지가 없어 잡초 세부 상태는 비어 있다.',
      '코드에 있는 규칙만 말하고, 수치가 없으면 추정이라고 분명히 밝혀라.'
    ].join('\n');
  }

  const nextDay = Math.max(1, Math.floor(Number(game?.day) || 1) + 1);
  const nextDate = toDate(nextDay);
  const nextMonth = nextDate.getMonth() + 1;
  const weatherName = String(game?.weather || 'clear');
  const weedNow = clamp(Number(field?.weed) || 0, 0, 100);
  const waterNow = clamp(Number(field?.water) || 0, 0, 100);
  const nutritionNow = clamp(Number(field?.nutrition) || 0, 0, 100);
  const weedBase = dailyWeedIncrease(nextMonth);
  const weedWeatherBonus = dailyWeedWeatherBonus(weatherName);
  const weedNutritionBonus = dailyWeedNutritionBonus(field?.nutrition);
  const weedWaterBonus = dailyWeedWaterBonus(field?.water);
  const weedRainBoostUntilDay = Math.max(0, Number(game?.weedRainBoostUntilDay) || 0);
  const weedRainMultiplier = nextDay <= weedRainBoostUntilDay
    ? WEED_RAIN_WEATHER_BOOST_MULTIPLIER
    : 1;
  const weedGrowthReductionUntilDay = Math.max(0, Number(field?.weedGrowthReductionUntilDay) || 0);
  const weedGrowthReductionActive = weedGrowthReductionUntilDay > 0 && nextDay <= weedGrowthReductionUntilDay;
  const weedRaw = weedBase + weedWeatherBonus + weedNutritionBonus + weedWaterBonus;
  const weedAfterRainBoost = weedRaw > 0 ? (weedRaw * weedRainMultiplier) : weedRaw;
  const weedAfterMow = weedGrowthReductionActive
    ? (weedAfterRainBoost * (1 - WEED_MOW_GROWTH_REDUCTION_RATIO))
    : weedAfterRainBoost;

  return [
    '[잡초 규칙 참고]',
    `현재 농지: ${String(field?.name || '이름 없음')}`,
    `현재 상태: 잡초 ${weedNow.toFixed(1)}, 수분 ${waterNow.toFixed(1)}, 양분 ${nutritionNow.toFixed(1)}`,
    `잡초 일일 증가식: 월 기본 ${weedBase.toFixed(2)} + 날씨보정 ${weedWeatherBonus >= 0 ? '+' : ''}${weedWeatherBonus.toFixed(2)} + 양분보정 ${weedNutritionBonus >= 0 ? '+' : ''}${weedNutritionBonus.toFixed(2)} + 수분보정 ${weedWaterBonus >= 0 ? '+' : ''}${weedWaterBonus.toFixed(2)}`,
    `강수 지속 배율: x${weedRainMultiplier.toFixed(2)} / 예초 억제 적용: ${weedGrowthReductionActive ? `ON (-${Math.round(WEED_MOW_GROWTH_REDUCTION_RATIO * 100)}%)` : 'OFF'}`,
    `내일 예상 기본 순변화: ${weedAfterMow >= 0 ? '+' : ''}${weedAfterMow.toFixed(2)} /일`,
    `예초 작업 기본효과: 잡초 총감소량 기준 ${WEED_MOW_REDUCE_AMOUNT}, 예초를 끝까지 돌리면 ${WEED_MOW_GROWTH_REDUCTION_DAYS}일 동안 잡초 증가가 ${Math.round(WEED_MOW_GROWTH_REDUCTION_RATIO * 100)}% 억제된다.`,
    `예초기 하한: 승용 예초기는 잡초를 ${RIDE_MOWER_WEED_FLOOR} 아래로 못 내리고, 보행 예초기는 ${WALK_MOWER_WEED_FLOOR} 아래로 못 내린다. 어깨형 예초기는 하한 0이다.`,
    '제초 작업 수단은 두 갈래다: 1) 예초기 사용 2) 제초제 살포.',
    '제초제는 반드시 단독 배합만 허용된다. 라운드업/바스타/스톰프를 다른 약제와 섞으면 안 된다.',
    '제초제 효과 규칙: 라운드업은 14일 지속, 총 잡초감소량 250, 일일 수세패널티 1.75 / 바스타는 4일 지속, 총 잡초감소량 70, 일일 수세패널티 2.5 / 스톰프는 30일 지속, 직접 감소는 없고 잡초증가 70% 억제, 일일 수세패널티 1.5.',
    '사용자가 "잡초를 뭘로 제거하냐"처럼 물으면 예초기와 제초제를 둘 다 먼저 말하고, 어느 쪽이 더 맞는지는 현재 잡초 수준과 수세 패널티를 기준으로 짧게 설명해라.',
    '코드에 없는 내용은 추정이라고 분명히 밝혀라.'
  ].join('\n');
};

export const buildPhoneHelperSortingContext = () => {
  return [
    '[사과 선별 규칙 참고]',
    '사과 선별은 품질 선별과 크기 선별을 분리해서 처리한다.',
    '1차 선별은 품질 기준으로 A급, B급, 가공품으로 나눈다.',
    '2차 선별은 A급, B급, 가공품을 각각 다시 1다이~10다이 기준으로 나눈다.',
    '가공품도 가공용 등급으로 유지하되 크기 분류는 1다이~10다이까지 적용한다.',
    '입력값은 totalKg와 quality 0~100이고, 품질 기준점 사이는 선형 보간으로 계산한다.',
    '품질이 높을수록 A급과 큰 과 비중이 올라가고, 품질이 낮을수록 가공품과 작은 과 비중이 올라간다.',
    '최저 품질에서도 A급과 B급이 완전 0이 되지 않고, 최고 품질에서도 가공품이 완전 0이 되지 않는다.',
    '다이 기준은 1다이 560g, 5다이 295g, 10다이 160g 기준으로 본다.',
    '선별 질문에는 품질 비율, 다이 분포, 현재 물량 기준 결과를 먼저 설명하고 코드에 없는 기준은 지어내지 마라.'
  ].join('\n');
};

export const buildPhoneHelperStorageContext = ({ game, field, deps }) => {
  const {
    harvestStorageUsedKg = 0,
    harvestStorageCapacityKg = 0,
    fieldFacilityCountOf,
    facilityMap = {},
    storageCapacityKgTotalOfFieldFacility
  } = deps || {};

  const safeStorageUsedKg = Math.max(0, Math.round(Number(harvestStorageUsedKg) || 0));
  const safeStorageCapacityKg = Math.max(0, Math.round(Number(harvestStorageCapacityKg) || 0));
  const safeStorageRemainKg = Math.max(0, safeStorageCapacityKg - safeStorageUsedKg);
  const storageRows = Array.isArray(game?.storage) ? game.storage : [];
  const storageBatchCount = storageRows.length;
  const selectedFieldId = String(field?.id || '').trim();
  const selectedFieldStoredKg = selectedFieldId
    ? storageRows.reduce((sum, batch) => (
      String(batch?.storageFieldId || '').trim() === selectedFieldId
        ? sum + Math.max(0, Number(batch?.qty) || 0)
        : sum
    ), 0)
    : 0;
  const selectedFieldStorageSummary = (() => {
    if (!field || typeof fieldFacilityCountOf !== 'function' || typeof storageCapacityKgTotalOfFieldFacility !== 'function') {
      return '현재 토지 저장 시설 정보 없음';
    }
    const rows = Object.keys(field?.landFacilities || {})
      .filter((facilityKey) => {
        if (Math.max(0, Number(fieldFacilityCountOf(field, facilityKey)) || 0) <= 0) return false;
        return Math.max(0, Number(storageCapacityKgTotalOfFieldFacility(field, facilityKey)) || 0) > 0;
      })
      .map((facilityKey) => {
        const facilityName = String(facilityMap?.[facilityKey]?.name || facilityKey).trim() || facilityKey;
        const capacityKg = Math.max(0, Math.round(Number(storageCapacityKgTotalOfFieldFacility(field, facilityKey)) || 0));
        return `${facilityName} ${capacityKg.toLocaleString()}kg`;
      })
      .filter(Boolean);
    return rows.length ? rows.slice(0, 5).join(' | ') : '현재 토지 저장 시설 정보 없음';
  })();

  return [
    '[저장 상태 참고]',
    `전체 저장량 ${safeStorageUsedKg.toLocaleString()} / ${safeStorageCapacityKg.toLocaleString()}kg, 잔여 ${safeStorageRemainKg.toLocaleString()}kg, 보관 배치 ${storageBatchCount}건`,
    field
      ? `현재 토지 ${String(field?.name || '이름 없음')} 기준 저장 물량 ${Math.round(selectedFieldStoredKg).toLocaleString()}kg / 저장 시설 ${selectedFieldStorageSummary}`
      : '현재 선택된 토지가 없어 토지별 저장 시설과 저장 물량은 확인하지 못했다.',
    '저장 질문에는 먼저 전체 여력, 현재 토지 저장 시설, 저장 물량을 기준으로 설명해라.',
    '저온저장이나 장기저장 질문은 현재 저장 여력과 시설 유무를 먼저 말하고, 코드에 없는 온도나 저장 일수는 지어내지 마라.'
  ].join('\n');
};

const phoneHelperFormatInventoryQty = (qty, unit = '') => {
  const normalizedUnit = String(unit || '').trim();
  const normalizedQty = Math.max(0, Number(qty) || 0);
  if (!normalizedUnit) return normalizedQty.toLocaleString();
  return `${normalizedQty.toLocaleString()}${normalizedUnit}`;
};

export const buildPhoneHelperManagementContext = ({ game, field, deps }) => {
  const {
    won,
    loanRemaining = 0,
    creditGradeInfo = null,
    CROPS: crops = {},
    cropRowsByVarietyAndAge,
    seedlingKeyByCrop = {},
    shopItems = {},
    harvestStorageUsedKg = 0,
    harvestStorageCapacityKg = 0,
    fieldFacilityCountOf,
    facilityMap = {}
  } = deps || {};

  const money = Math.max(0, Number(game?.money) || 0);
  const loanUsed = Math.max(0, Number(game?.loanUsed) || 0);
  const loanLimit = Math.max(0, Number(game?.loanLimit) || 0);
  const creditScore = Math.max(0, Math.round(Number(game?.creditScore) || 0));
  const loanNextDueDay = Math.max(0, Math.floor(Number(game?.loanNextDueDay) || 0));
  const loanOverdueDays = Math.max(0, Math.floor(Number(game?.loanOverdueDays) || 0));
  const activeLoanContracts = Array.isArray(game?.loanContracts)
    ? game.loanContracts.filter((contract) => Number(contract?.remainingPrincipal) > 0)
    : [];
  const monthlyInstallmentTotal = activeLoanContracts.reduce((sum, contract) => {
    const principalRemaining = Math.max(0, Number(contract?.remainingPrincipal) || 0);
    const remainingMonths = Math.max(1, Math.floor(Number(contract?.remainingMonths) || 0));
    if (principalRemaining <= 0 || remainingMonths <= 0) return sum;
    return sum + Math.ceil(principalRemaining / remainingMonths);
  }, 0);
  const ownedFields = (Array.isArray(game?.fields) ? game.fields : []).filter((entry) => entry?.owned);

  const seedlingItems = Array.isArray(shopItems?.seedling) ? shopItems.seedling : [];
  const cropEntries = Object.values(crops || {})
    .filter((crop) => crop && typeof crop === 'object')
    .map((crop) => {
      const cropId = String(crop.id || '').trim();
      const seedlingKey = String(seedlingKeyByCrop?.[cropId] || '').trim();
      const seedlingItem = seedlingItems.find((item) => String(item?.key || '').trim() === seedlingKey) || null;
      return {
        id: cropId,
        name: String(crop.name || cropId || '품종').trim() || '품종',
        basePrice: Math.max(0, Number(crop.basePrice) || 0),
        seedCost: Math.max(0, Number(crop.seedCost) || 0),
        seedlingPrice: Math.max(0, Number(seedlingItem?.price) || 0)
      };
    })
    .filter((crop) => crop.id)
    .sort((a, b) => {
      if (b.basePrice !== a.basePrice) return b.basePrice - a.basePrice;
      return a.name.localeCompare(b.name, 'ko');
    });
  const varietyProfitabilitySummary = cropEntries.length
    ? cropEntries
      .slice(0, 4)
      .map((crop) => `${crop.name} 판매가 ${crop.basePrice.toLocaleString()} / 묘목 ${crop.seedlingPrice.toLocaleString()}`)
      .join(' | ')
    : '품종 수익성 정보 없음';

  const fieldRows = field && typeof cropRowsByVarietyAndAge === 'function'
    ? cropRowsByVarietyAndAge(field, Math.max(1, Math.floor(Number(game?.day) || 1)), crops)
      .filter((row) => (Number(row?.aliveTrees) || 0) > 0)
    : [];
  const fieldVarietySummary = fieldRows.length
    ? fieldRows
      .slice(0, 4)
      .map((row) => `${String(row?.cropName || row?.cropId || '품종')} ${Math.max(0, Number(row?.ageYear) || 0)}년차 ${Math.max(0, Number(row?.aliveTrees) || 0)}주`)
      .join(' | ')
    : '현재 토지 식재 정보 없음';

  const inventoryCategoryOrder = ['seedling', 'fertilizer', 'pesticide', 'container', 'fuel', 'consumableMaterial'];
  const inventoryCategoryLabelByKey = {
    seedling: '묘목',
    fertilizer: '비료',
    pesticide: '약제',
    container: '박스/용기',
    fuel: '연료',
    consumableMaterial: '자재'
  };
  const inventoryRows = inventoryCategoryOrder.flatMap((categoryKey) => {
    const items = Array.isArray(shopItems?.[categoryKey]) ? shopItems[categoryKey] : [];
    return items
      .map((item) => {
        const itemKey = String(item?.key || '').trim();
        const qty = Math.max(0, Number(game?.inventory?.[itemKey]) || 0);
        if (!itemKey || qty <= 0) return null;
        return {
          categoryKey,
          categoryLabel: inventoryCategoryLabelByKey[categoryKey] || categoryKey,
          name: String(item?.name || itemKey).trim() || itemKey,
          qty,
          qtyText: phoneHelperFormatInventoryQty(qty, item?.unit || '')
        };
      })
      .filter(Boolean);
  });
  const inventorySummary = inventoryCategoryOrder.map((categoryKey) => {
    const categoryRows = inventoryRows.filter((row) => row.categoryKey === categoryKey).slice(0, 3);
    if (!categoryRows.length) return '';
    return `${inventoryCategoryLabelByKey[categoryKey]}: ${categoryRows.map((row) => `${row.name} ${row.qtyText}`).join(', ')}`;
  }).filter(Boolean);

  const safeStorageUsedKg = Math.max(0, Math.round(Number(harvestStorageUsedKg) || 0));
  const safeStorageCapacityKg = Math.max(0, Math.round(Number(harvestStorageCapacityKg) || 0));
  const safeStorageRemainKg = Math.max(0, safeStorageCapacityKg - safeStorageUsedKg);
  const storageBatchCount = Array.isArray(game?.storage) ? game.storage.length : 0;

  const facilitySummary = (() => {
    if (!field || typeof fieldFacilityCountOf !== 'function') return '현재 토지 시설 정보 없음';
    const facilityKeys = Object.keys(field?.landFacilities || {})
      .filter((facilityKey) => Math.max(0, Number(fieldFacilityCountOf(field, facilityKey)) || 0) > 0);
    if (!facilityKeys.length) return '현재 토지 시설 정보 없음';
    const rows = facilityKeys.map((facilityKey) => {
      const count = Math.max(0, Number(fieldFacilityCountOf(field, facilityKey)) || 0);
      const facilityName = String(facilityMap?.[facilityKey]?.name || facilityKey).trim() || facilityKey;
      return `${facilityName} ${count}동`;
    });
    return rows.slice(0, 5).join(' | ');
  })();

  return [
    '[경영 현황 참고]',
    `[자금 상태] 보유 자금 ${won(money)} / 오늘 판매 ${Math.max(0, Number(game?.soldToday) || 0).toLocaleString()}kg`,
    `[대출·신용] 신용 ${creditScore}점 ${String(creditGradeInfo?.label || game?.creditGrade || '정보 없음')} / 사용 ${won(loanUsed)} / 한도 ${won(loanLimit)} / 잔여 ${won(Math.max(0, Number(loanRemaining) || 0))} / 진행중 ${activeLoanContracts.length}건 / 월상환 추정 ${won(monthlyInstallmentTotal)} / 다음 납부일 ${loanNextDueDay > 0 ? `${loanNextDueDay}일차` : '없음'}${loanOverdueDays > 0 ? ` / 연체 ${loanOverdueDays}일` : ''}`,
    field
      ? `[토지·생산성] 현재 토지 ${String(field?.name || '이름 없음')} / 생육 ${Math.max(0, Number(field?.growth) || 0).toFixed(1)} / 수세 ${Math.max(0, Number(field?.vigor) || 0).toFixed(1)} / 품질 ${Math.max(0, Number(field?.quality) || 0).toFixed(1)} / 주당 착과 ${Math.max(0, Number(field?.fruitLoadPerTree) || 0).toFixed(1)} / 토양수분 ${Math.max(0, Number(field?.water) || 0).toFixed(1)} / 토양양분 ${Math.max(0, Number(field?.nutrition) || 0).toFixed(1)} / 식재 ${fieldVarietySummary}`
      : `[토지·생산성] 보유 토지 ${ownedFields.length}필지 / 현재 선택 토지 정보 없음`,
    `[품종별 수익성] ${varietyProfitabilitySummary}`,
    inventorySummary.length
      ? `[재고·자재] ${inventorySummary.join(' | ')}`
      : '[재고·자재] 핵심 재고 정보 없음',
    `[저장·시설 여력] 저장 ${safeStorageUsedKg.toLocaleString()} / ${safeStorageCapacityKg.toLocaleString()}kg, 잔여 ${safeStorageRemainKg.toLocaleString()}kg / 보관 배치 ${storageBatchCount}건 / 현재 토지 시설 ${facilitySummary}`,
    '경영 상담은 위 수치를 우선 기준으로 하고, 게임에 없는 회계값이나 시세는 추정하지 마라.',
    '돈, 대출, 품종, 재고, 저장, 투자 질문이 오면 위 6개 축 안에서 먼저 병목과 여유를 짚어라.'
  ].join('\n');
};

export const buildPhoneHelperLaborContext = ({ game, deps }) => {
  const {
    phoneCrewTypeRows = [],
    phoneCrewRentRows = [],
    currentCrewRosterEntries = []
  } = deps || {};

  const selfLabor = Math.max(0, Number(game?.labor) || 0);
  const externalLaborRemaining = Math.max(0, Number(game?.externalLaborRemaining) || 0);
  const externalLaborToday = game?.externalCrewLaborToday || {};
  const externalLaborTotal = Math.max(0, Number(externalLaborToday?.total) || 0);
  const crewTypeSummary = (Array.isArray(phoneCrewTypeRows) ? phoneCrewTypeRows : [])
    .map((row) => {
      const name = String(row?.name || '인력').trim() || '인력';
      const remaining = Math.max(0, Number(row?.remaining) || 0);
      const wageText = String(row?.wageText || '').trim();
      return `${name} ${remaining}명 / ${wageText}`.trim();
    })
    .filter(Boolean);
  const rentStatusSummary = (Array.isArray(phoneCrewRentRows) ? phoneCrewRentRows : [])
    .slice(0, 6)
    .map((row) => {
      const typeName = String(row?.typeName || '인력').trim() || '인력';
      const count = Math.max(0, Number(row?.count) || 0);
      const statusText = String(row?.statusText || '').trim() || '상태 없음';
      const periodText = String(row?.periodText || '').trim();
      const paymentText = String(row?.pendingPaymentHint || row?.rejectedHint || '').trim();
      return `${typeName} ${count}명 / ${statusText}${periodText ? ` / ${periodText}` : ''}${paymentText ? ` / ${paymentText}` : ''}`;
    })
    .filter(Boolean);
  const rosterSummary = (Array.isArray(currentCrewRosterEntries) ? currentCrewRosterEntries : [])
    .map((entry) => {
      const workers = Array.isArray(entry?.workers) ? entry.workers : [];
      const totalLabor = workers.reduce((sum, worker) => sum + Math.max(0, Number(worker?.labor) || 0), 0);
      return `${String(entry?.label || '인력')} ${workers.length}명 / 남은 노동력 ${totalLabor.toFixed(1)}`;
    })
    .filter(Boolean);

  return [
    '[인력 현황 참고]',
    `자가노동력: ${selfLabor.toFixed(1)} / 100`,
    `외부인력 노동력: ${externalLaborRemaining.toFixed(1)} / ${externalLaborTotal.toFixed(1)}`,
    crewTypeSummary.length
      ? `오늘 대여 가능 인력: ${crewTypeSummary.join(' | ')}`
      : '오늘 대여 가능 인력 정보 없음',
    rentStatusSummary.length
      ? `현재 인력 예약/결제 현황: ${rentStatusSummary.join(' | ')}`
      : '현재 인력 예약/결제 현황 없음',
    rosterSummary.length
      ? `현재 출근 인력 명단 요약: ${rosterSummary.join(' | ')}`
      : '현재 출근 중인 외부 인력 없음',
    '인력 상담은 위 수치를 우선 기준으로 하고, 없는 계약이나 인원은 추정하지 마라.',
    '예약 현황, 결제 현황, 심사 여부를 물으면 현재 인력 예약/결제 현황 줄을 기준으로 짧게 답해라.',
    '남은 인원이나 일당을 물으면 "초보 6명/10.5만, 일반 11명/13만, 숙련 6명/17만, 기술 2명/22만"처럼 한 줄로 짧게 답해라.',
    '노동자 등급 차이를 물을 때만 적합 작업 차이를 짧게 설명해라. 단순 가용 인력 질문에는 작업 설명을 붙이지 마라.',
    '초보노동자는 단순 보조, 노동자는 일반 작업, 숙련노동자는 고효율·정밀 현장 작업, 농업기술자는 전정·약제살포 같은 전문 작업으로 구분해라.',
    '인력 부족, 배정 불가, 대여 막힘 질문이 오면 남은 자가노동력, 외부인력 노동력, 오늘 남은 대여 가능 인원부터 먼저 짚어라.'
  ].join('\n');
};

export const buildPhoneHelperVarietyContext = ({ game, field, questionText = '', deps }) => {
  const {
    CROPS: crops = {},
    cropRowsByVarietyAndAge,
    seedlingKeyByCrop = {},
    shopItems = {}
  } = deps || {};
  const seedlingItems = Array.isArray(shopItems?.seedling) ? shopItems.seedling : [];

  const cropEntries = Object.values(crops || {})
    .filter((crop) => crop && typeof crop === 'object')
    .map((crop) => ({
      id: String(crop.id || '').trim(),
      name: String(crop.name || '품종').trim() || '품종',
      seedCost: Math.max(0, Number(crop.seedCost) || 0),
      basePrice: Math.max(0, Number(crop.basePrice) || 0),
      seedlingKey: String(seedlingKeyByCrop?.[crop.id] || '').trim()
    }))
    .map((crop) => {
      const seedlingItem = seedlingItems.find((item) => String(item?.key || '') === crop.seedlingKey) || null;
      return {
        ...crop,
        seedlingName: String(seedlingItem?.name || '').trim(),
        seedlingPrice: Math.max(0, Number(seedlingItem?.price) || 0)
      };
    })
    .filter((crop) => crop.id);
  const normalizedQuestion = String(questionText || '').trim();
  const targetCrop = cropEntries.find((crop) => (
    normalizedQuestion.includes(crop.name)
    || normalizedQuestion.toLowerCase().includes(crop.id.toLowerCase())
  )) || null;

  const fieldRows = field && typeof cropRowsByVarietyAndAge === 'function'
    ? cropRowsByVarietyAndAge(field, Math.max(1, Math.floor(Number(game?.day) || 1)), crops)
      .filter((row) => (Number(row?.aliveTrees) || 0) > 0)
    : [];
  const plantedSummary = fieldRows
    .map((row) => `${String(row?.cropName || '품종')} ${Math.max(0, Number(row?.ageYear) || 0)}년차 ${Math.max(0, Number(row?.aliveTrees) || 0)}주`)
    .filter(Boolean);
  const targetFieldRows = targetCrop
    ? fieldRows.filter((row) => String(row?.cropId || '') === targetCrop.id)
    : [];
  const targetFieldSummary = targetFieldRows
    .map((row) => `${Math.max(0, Number(row?.ageYear) || 0)}년차 ${Math.max(0, Number(row?.aliveTrees) || 0)}주`)
    .filter(Boolean);

  return [
    '[게임 품종 정보 참고]',
    `현재 게임에 구현된 사과 품종은 ${cropEntries.map((crop) => crop.name).join(', ')}뿐이다.`,
    '품종이나 묘목 얘기가 나오면 아래 구현 데이터를 먼저 기준으로 설명해라.',
    ...cropEntries.map((crop) => `${crop.name}: cropId ${crop.id} / 상점 묘목 ${crop.seedlingName || crop.seedlingKey || '정보 없음'} / 묘목 가격 ${crop.seedlingPrice} / 기준 판매가 ${crop.basePrice} / 내부 seedCost ${crop.seedCost}`),
    field
      ? (plantedSummary.length
        ? `현재 토지 식재 현황: ${plantedSummary.join(' / ')}`
        : `현재 토지 ${String(field?.name || '이름 없음')}에는 살아 있는 식재 품종 정보가 없다.`)
      : '현재 선택된 토지가 없어 토지별 식재 품종은 확인하지 못했다.',
    ...(targetCrop ? [
      `[질문에 직접 언급된 품종 상세: ${targetCrop.name}]`,
      `${targetCrop.name} 상세 데이터: cropId ${targetCrop.id} / 상점 묘목 ${targetCrop.seedlingName || targetCrop.seedlingKey || '정보 없음'} / 묘목 가격 ${targetCrop.seedlingPrice} / 기준 판매가 ${targetCrop.basePrice} / 내부 seedCost ${targetCrop.seedCost}`,
      targetCrop.id === 'fuji'
        ? '후지는 코드에 전용 생육 곡선이 들어가 있다. 11월 15일~11월 30일에 생육 100을 유지하도록 설정되어 있다.'
        : targetCrop.id === 'hongro'
          ? '홍로는 조생종에 맞춰 9월 상순~중순 수확 구간으로 별도 생육 곡선을 사용한다.'
          : targetCrop.id === 'gamhong'
            ? '감홍은 만생종보다 이른 10월 하순~11월 초 수확 구간으로 별도 생육 곡선을 사용한다.'
            : '시나노골드는 10월 하순~11월 중순 수확 구간으로 별도 생육 곡선을 사용한다.',
      field
        ? (targetFieldSummary.length
          ? `현재 선택 토지의 ${targetCrop.name} 식재 현황: ${targetFieldSummary.join(' / ')}`
          : `현재 선택 토지에는 ${targetCrop.name} 식재 묶음이 확인되지 않는다.`)
        : `현재 선택 토지가 없어 ${targetCrop.name}의 토지별 식재 현황은 확인하지 못했다.`,
      '사용자가 이 품종이 뭐냐고 물으면 위 상세 데이터를 먼저 풀어서 설명하고, 가격/식재 여부/코드상 특징을 함께 말해라.'
    ] : []),
    '품종 추천, 품종 비교, 묘목 질문, 출하용 품종 질문이 오면 위 구현 데이터 안에서만 답해라.',
    '없는 품종을 새로 만들어 말하지 마라.'
  ].join('\n');
};

export const buildPhoneHelperToolContext = (toolResults = []) => {
  const normalizedResults = (Array.isArray(toolResults) ? toolResults : [])
    .map((entry) => ({
      key: String(entry?.key || '').trim(),
      content: String(entry?.content || '').trim()
    }))
    .filter((entry) => entry.key && entry.content);

  if (!normalizedResults.length) {
    return '';
  }

  return [
    '[내부 도구 실행 결과]',
    '아래 내용은 게임 내부 상태와 규칙에서 바로 읽어온 값이다. 답변할 때 이 내용을 가장 우선해서 사용하고, 없거나 모르는 값만 일반 설명으로 보완해라.',
    ...normalizedResults.map((entry) => [
      `[도구: ${PHONE_HELPER_TOOL_LABEL_BY_KEY[entry.key] || entry.key}]`,
      entry.content
    ].join('\n'))
  ].join('\n\n');
};

export const buildPhoneHelperSystemPrompt = ({
  contactProfile,
  game,
  pestRuleContext = '',
  toolContext = '',
  memorySummary = '',
  toDate,
  dailyBriefAllowed = true,
  includeBasicInfoContext = false
}) => {
  return [
    `너는 농장 시뮬레이터 안의 연락처 '${contactProfile.name}'이다.`,
    String(memorySummary || '').trim() ? `[이전 상담 요약]\n${String(memorySummary || '').trim()}` : '',
    ...(Array.isArray(contactProfile?.promptLines) ? contactProfile.promptLines : []),
    ...buildPhoneHelperCommonPromptLines({
      game,
      toDate,
      dailyBriefAllowed,
      includeBasicInfoContext,
      toolContext,
      pestRuleContext
    })
  ].filter(Boolean).join('\n');
};

export const requestPhoneHelperReply = async ({
  apiUrl = APPLE_HELPER_CHAT_API_URL,
  model,
  systemPrompt,
  history = [],
  onChunk
}) => {
  const normalizedHistory = (Array.isArray(history) ? history : [])
    .filter((entry) => (
      entry
      && (entry.role === 'user' || entry.role === 'assistant')
      && String(entry.text || '').trim()
    ))
    .slice(-12)
    .map((entry) => ({
      role: entry.role,
      content: String(entry.text || '').trim()
    }));
  const buildFallbackPromptFromHistory = () => {
    const lines = [];
    if (String(systemPrompt || '').trim()) {
      lines.push('[시스템 지침]');
      lines.push(String(systemPrompt || '').trim());
    }
    if (normalizedHistory.length) {
      lines.push('[대화 기록]');
      normalizedHistory.forEach((entry) => {
        lines.push(`${entry.role === 'user' ? '사용자' : '상담사'}: ${entry.content}`);
      });
    }
    lines.push('위 대화 흐름을 이어서, 마지막 사용자 말에만 자연스럽게 답해라.');
    return lines.filter(Boolean).join('\n');
  };
  const buildRequestBody = (mode = 'chat_messages') => {
    if (mode === 'single_user_prompt') {
      return {
        model: String(model || PHONE_HELPER_CONTACTS[DEFAULT_PHONE_HELPER_CONTACT_KEY].model),
        stream: true,
        temperature: 0.5,
        max_tokens: 5000,
        messages: [
          {
            role: 'user',
            content: buildFallbackPromptFromHistory()
          }
        ]
      };
    }
    return {
      model: String(model || PHONE_HELPER_CONTACTS[DEFAULT_PHONE_HELPER_CONTACT_KEY].model),
      stream: true,
      temperature: 0.5,
      max_tokens: 5000,
      messages: [
        { role: 'system', content: systemPrompt },
        ...normalizedHistory
      ]
    };
  };
  const isLmStudioNoUserQueryError = (detailValue = '') => (
    /No user query found in messages/i.test(String(detailValue || ''))
  );
  const buildPhoneHelperRequestError = (fallbackMessage, detailValue = '') => {
    const resolvedDetail = phoneHelperErrorTextOf(detailValue);
    const error = new Error(resolvedDetail || String(fallbackMessage || 'LM Studio 요청에 실패했습니다.'));
    if (resolvedDetail) {
      error.detail = resolvedDetail;
    }
    return error;
  };

  const requestWithBody = async (requestBody) => {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let detailValue = '';
      try {
        const errorPayload = await response.json();
        detailValue = (
          phoneHelperErrorTextOf(errorPayload?.detail)
          || phoneHelperErrorTextOf(errorPayload?.error)
          || phoneHelperErrorTextOf(errorPayload)
        );
      } catch {
        detailValue = '';
      }
      throw buildPhoneHelperRequestError(`lm_studio_http_${response.status}`, detailValue);
    }

    if (!response.body) {
      throw new Error('lm_stream_unavailable');
    }

    let reply = '';
    let streamDone = false;
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (!streamDone) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';
      for (const eventBlock of events) {
        const lines = String(eventBlock || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data) continue;
          if (data === '[DONE]') {
            streamDone = true;
            break;
          }
          let payload = null;
          try {
            payload = JSON.parse(data);
          } catch {
            payload = null;
          }
          if (!payload) continue;
          if (payload.error) {
            throw buildPhoneHelperRequestError(
              'lm_stream_proxy_failed',
              payload.detail || payload.error || payload
            );
          }
          const deltaRaw = payload?.choices?.[0]?.delta?.content;
          const delta = Array.isArray(deltaRaw)
            ? deltaRaw.map((part) => {
              if (typeof part === 'string') return part;
              if (part && typeof part === 'object' && 'text' in part) return String(part.text || '');
              return '';
            }).join('')
            : String(deltaRaw || '');
          if (!delta) continue;
          reply += delta;
          if (typeof onChunk === 'function') {
            onChunk(delta);
          }
        }
        if (streamDone) break;
      }
    }

    return reply.trim();
  };

  let trimmedReply = '';
  try {
    trimmedReply = await requestWithBody(buildRequestBody('chat_messages'));
  } catch (error) {
    if (!isLmStudioNoUserQueryError(error?.detail || error?.message || '')) {
      throw error;
    }
    trimmedReply = await requestWithBody(buildRequestBody('single_user_prompt'));
  }

  if (!trimmedReply) {
    throw new Error('lm_studio_empty_reply');
  }

  return trimmedReply;
};

const PHONE_HELPER_LEAKED_REPLY_LINE_PATTERNS = [
  /^\[시스템 지침\]$/i,
  /^\[대화 기록\]$/i,
  /^thinking\b/i,
  /^analysis\b/i,
  /^reasoning\b/i,
  /^사용자 질문에 바로 답해라\.?$/i,
  /^짧게 답해라\.?$/i,
  /^짧은 호출에는 짧게만 반응해라\.?$/i,
  /^자기소개, 직함 소개, 역할 설명을 반복하지 마라\.?$/i,
  /^고객센터 안내문처럼 말하지 마라\.?$/i,
  /^묻지 않은 날씨, 일정, 브리핑을 먼저 꺼내지 마라\.?$/i,
  /^thinking,\s*분석과정,\s*중간추론을 출력하지 마라\.?$/i,
  /^사용자가 욕설, 모욕, 반말, 시비조 표현을 쓰면 고객센터처럼 제지하지 말고 캐릭터답게 짧게 받아쳐라\.?$/i,
  /^욕설이나 반말 시비가 들어오면 너무 점잖게 굴지 말고, 성격 있는 NPC처럼 1~2문장 안에서 빈정거리거나 맞받아쳐도 된다\.?$/i,
  /^사용자가 먼저 욕설이나 반말로 나오면 NPC도 짧은 반말, 퉁명스러운 말투, 띠꺼운 반응을 써도 된다\.? 다만 장황하게 싸우지 말고 바로 본론으로 돌아와라\.?$/i,
  /^같은 경고문, 같은 빈정거림, 같은 문장 구조를 반복하지 마라\.?$/i,
  /^사용자가 다른 NPC를 묻는 잡담이면 본론으로 강하게 몰아붙이지 말고, 캐릭터성 있는 짧은 대사로 먼저 받아라\.?$/i,
  /^위 대화 흐름을 이어서, 마지막 사용자 말에만 자연스럽게 답해라\.?$/i,
  /^(사용자|상담사):\s*/i
];

const sanitizeLaborHelperTone = (text) => (
  String(text || '')
    .replace(/작업内容是/g, '작업 내용을')
    .replace(/作業/g, '작업')
    .replace(/内容/g, '내용')
    .replace(/말해줘야겠지요\?/g, '말씀해 주셔야 합니다.')
    .replace(/말해줘야겠죠\?/g, '말씀해 주셔야 합니다.')
    .replace(/말해줘야겠지\?/g, '말씀해 주셔야 합니다.')
    .replace(/말해줘야지\?/g, '말씀해 주셔야 합니다.')
    .replace(/말해줘야 합니다\./g, '말씀해 주셔야 합니다.')
    .replace(/말해줘야 확인할 수 있습니다\./g, '말씀해 주셔야 확인할 수 있습니다.')
);

export const sanitizePhoneHelperReplyText = (text, options = {}) => {
  const normalized = String(text || '').replace(/\r/g, '').trim();
  if (!normalized) return '';
  const contactKey = normalizePhoneHelperContactKey(options?.contactKey);

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const filtered = [];
  const seen = new Set();

  lines.forEach((line) => {
    const normalizedLine = line.replace(/\s+/g, ' ').trim();
    if (!normalizedLine) return;
    if (PHONE_HELPER_LEAKED_REPLY_LINE_PATTERNS.some((pattern) => pattern.test(normalizedLine))) {
      return;
    }
    if (normalizedLine.length >= 6 && seen.has(normalizedLine)) {
      return;
    }
    seen.add(normalizedLine);
    filtered.push(normalizedLine);
  });

  const replyText = filtered.join('\n').trim();
  return contactKey === 'labor-helper'
    ? sanitizeLaborHelperTone(replyText).trim()
    : replyText;
};

const extractJsonObjectFromText = (text) => {
  const normalized = String(text || '').trim();
  if (!normalized) return '';
  const fenceMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : normalized;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace < 0 || lastBrace < firstBrace) return candidate;
  return candidate.slice(firstBrace, lastBrace + 1);
};

export const parsePhoneHelperLaborIntentResponse = (text) => {
  const raw = extractJsonObjectFromText(text);
  let payload = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = null;
  }
  const normalizedIntent = String(payload?.intent || '').trim().toLowerCase();
  const allowedIntentSet = new Set(['reserve', 'confirm', 'cancel', 'pay', 'availability', 'status', 'pause', 'chat', 'unknown']);
  const allowedCrewTypeSet = new Set(['beginner', 'worker', 'skilledWorker', 'agriTechnician']);
  const crewTypeRaw = String(payload?.crewType || '').trim();
  return {
    intent: allowedIntentSet.has(normalizedIntent) ? normalizedIntent : 'unknown',
    crewType: allowedCrewTypeSet.has(crewTypeRaw) ? crewTypeRaw : '',
    count: Math.max(0, Math.floor(Number(payload?.count) || 0)),
    allIn: Boolean(payload?.allIn),
    clearCrewType: Boolean(payload?.clearCrewType),
    clearDate: Boolean(payload?.clearDate),
    useMinStartDay: Boolean(payload?.useMinStartDay),
    startOffsetDays: Math.max(0, Math.floor(Number(payload?.startOffsetDays) || 0)),
    durationDays: Math.max(0, Math.floor(Number(payload?.durationDays) || 0)),
    endOffsetDays: Math.max(0, Math.floor(Number(payload?.endOffsetDays) || 0)),
    dateText: String(payload?.dateText || '').trim(),
    note: String(payload?.note || '').trim(),
    replyText: String(payload?.replyText || '').trim()
  };
};

export const requestPhoneHelperLaborIntent = async ({
  apiUrl = APPLE_HELPER_CHAT_API_URL,
  model,
  history = [],
  currentGameDay = 1,
  minStartDay = 1,
  remainingByType = {},
  pendingDraft = null
}) => {
  const availabilityText = [
    `초보노동자 ${Math.max(0, Math.floor(Number(remainingByType?.beginner) || 0))}명, 일당 105000원, 단순 보조 위주`,
    `노동자 ${Math.max(0, Math.floor(Number(remainingByType?.worker) || 0))}명, 일당 130000원, 일반 작업용`,
    `숙련노동자 ${Math.max(0, Math.floor(Number(remainingByType?.skilledWorker) || 0))}명, 일당 170000원, 숙련 작업용`,
    `농업기술자 ${Math.max(0, Math.floor(Number(remainingByType?.agriTechnician) || 0))}명, 일당 220000원, 전문 작업용`
  ].join(', ');
  const normalizedPendingDraft = pendingDraft && typeof pendingDraft === 'object'
    ? {
      crewType: String(pendingDraft.crewType || '').trim(),
      count: Math.max(0, Math.floor(Number(pendingDraft.count) || 0)),
      startDay: Math.max(0, Math.floor(Number(pendingDraft.startDay) || 0)),
      endDay: Math.max(0, Math.floor(Number(pendingDraft.endDay) || 0))
    }
    : null;
  const systemPrompt = [
    "너는 농장 시뮬레이터 '인력소장님'의 머릿속 메모 슬롯 해석기다.",
    '절대 일반 대답을 하지 말고 JSON 객체 하나만 출력해라.',
    '허용 intent는 reserve, confirm, cancel, pay, availability, status, pause, chat, unknown 뿐이다.',
    'crewType 허용값은 beginner, worker, skilledWorker, agriTechnician, 빈문자열 뿐이다.',
    'count는 정수다. 모르면 0이다.',
    'allIn은 사용자가 남아 있는 인원을 가능한 만큼 전부 쓰겠다는 뜻일 때만 true다.',
    'useMinStartDay는 사용자가 가장 빠른 가능일, 최대한 빠르게, 제일 이른 날 같은 뜻으로 허용 가능한 가장 이른 날짜를 원할 때만 true다.',
    'startOffsetDays는 현재 게임일 기준 시작일까지 며칠 뒤인지 숫자로 넣어라. 오늘은 0, 내일은 1, 모레는 2, 일주일 뒤/한 주 뒤는 7이다. 모르면 0이다.',
    'durationDays는 사용기간이 며칠인지 숫자로 넣어라. 하루는 1, 이틀은 2, 일주일 동안/한 주간은 7이다. 모르면 0이다.',
    'endOffsetDays는 현재 게임일 기준 종료일까지 며칠 뒤인지 숫자로 넣어라. "까지" 표현일 때만 주로 사용하고 모르면 0이다.',
    'dateText는 사용자가 말한 날짜나 기간 표현만 짧게 넣어라. 날짜 정보가 없으면 빈문자열이다.',
    '사용자가 "3일뒤", "3일후", "일주일 뒤", "한 주 뒤", "내일", "11월 17일"처럼 시작일만 말하면 dateText에는 그대로 넣되 종료일/기간은 아직 모르는 상태로 둔다.',
    '사용자가 "11월 18일까지", "3일후까지"처럼 "까지"를 붙이면 시작일이 아니라 종료일 슬롯으로 해석해라.',
    '사용자가 "3일동안", "일주일 동안", "한 주간", "이틀", "하루", "하루만", "이틀만"처럼 사용기간만 말하면 dateText에는 그 기간 표현을 그대로 넣어라.',
    '사용자가 "이번 주말", "다음 주 월요일", "월요일부터 수요일", "월화수"처럼 요일이나 주말을 말해도 dateText에 그대로 넣어라.',
    'status intent는 이미 진행 중인 예약의 상태, 승인 여부, 결제 필요 여부를 확인하려는 뜻일 때다.',
    'availability intent는 지금 대여 가능한 인원이나 남은 수량을 확인하려는 뜻일 때다.',
    'pause intent는 지금 바로 결정을 미루거나 대화를 잠시 멈추려는 뜻일 때다.',
    'confirm intent는 이전 예약 초안을 그대로 확정하려는 뜻일 때다.',
    'pay intent는 사용자가 결제 의사를 말한 경우다. 단, 채팅에서는 실제 결제를 실행하지 않고 인력소 화면의 결제 버튼으로 안내한다.',
    '사용자가 추천이나 "뭐가 좋아요"처럼 네 판단을 물었고 현재 예약 초안이 있으면, 빈 슬롯을 자연스럽게 추론해 reserve로 보충해라. 완전히 설명만 원하는 말이면 chat이다.',
    'reserve intent는 인력종류, 시작일, 종료일/기간, 인원 중 하나 이상을 소장 메모에 새로 적거나 수정하는 뜻일 때다. 대화 맥락상 짧은 조각 답변이어도 메모 보충이면 reserve로 둬라.',
    '이전 예약 초안이 이미 있으면 새 입력이 짧아도 비어 있는 메모 슬롯을 보충하거나 기존 슬롯을 수정하는 의미인지 먼저 봐라.',
    '사용자가 "아니", "말고", "바꿔", "수정"과 함께 새 인력종류, 날짜, 기간, 인원을 말하면 cancel이 아니라 reserve로 두고 새 값으로 기존 메모를 덮어써라.',
    '사용자가 "숙련 말고", "초보 말고"처럼 현재 인력종류만 부정하고 대체 인력종류를 말하지 않으면 clearCrewType을 true로 두고 reserve로 해석해라.',
    '사용자가 "오늘부터 아닌데요", "그날 말고요"처럼 현재 날짜만 부정하고 새 날짜를 말하지 않으면 clearDate를 true로 두고 reserve로 해석해라.',
    '한 문장에 같은 슬롯 후보가 여러 개 있으면 마지막으로 말한 값을 채택해라. 예: "초보 말고 숙련"은 skilledWorker, "2명 말고 3명"은 count 3이다.',
    '작업 종류로 직종을 추론해라. 전지, 전정, 가지치기, 약제, 방제, 살포는 농업기술자다. 수확, 적과, 적엽, 포장, 운반, 시설정비 같은 일반 작업은 노동자나 숙련노동자다.',
    '사용자가 직종 선택을 너에게 맡겼다면 맥락에 맞는 직종을 하나 골라라. 일반 작업이면 보통 숙련노동자 쪽을 먼저 보고, 전문 작업이 분명할 때만 농업기술자를 골라라.',
    '최종 예약 확정은 인력종류, 시작일, 종료일/사용기간, 인원이 모두 있어야 한다. 하나라도 부족하면 reserve로 보충하되 confirm으로 보지 마라.',
    'chat intent는 예약 처리와 무관한 가벼운 잡담이나 호칭, 안부, 말투 확인 같은 말이다.',
    '의미가 불분명하고 예약 정보도 없으면 unknown으로 둬라.',
    'replyText는 실제 사용자에게 보여줄 인력소장님 답장이다.',
    'replyText는 JSON 설명이 아니라 문자 답장처럼 자연스럽게 써라.',
    'replyText는 1~2문장으로 짧게 써라. 같은 문장을 반복하지 마라.',
    'replyText에는 "현재 메모", "?등급", "?명" 같은 내부 슬롯 표시를 절대 쓰지 마라.',
    'replyText에서 이미 적은 내용은 필요한 만큼만 짧게 확인하고, 부족한 정보 하나만 자연스럽게 물어라.',
    '사용자가 "아니", "말고", "수정"처럼 정정을 말하면 고집하지 말고 먼저 정정 의사를 받아라.',
    'availability intent의 replyText는 "초보 6명/10.5만, 일반 11명/13만, 숙련 6명/17만, 기술 2명/22만 있습니다."처럼 한 줄로 짧게 써라.',
    '예약 확정, 취소처럼 실제 게임 처리가 필요한 경우에도 replyText는 짧게 쓰되, 앱이 최종 처리 문구로 덮어쓸 수 있다.',
    '결제 의사를 말하면 replyText는 "결제는 인력소 화면 예약 목록에서 처리해 주세요"처럼 안내해라.',
    `현재 게임일: ${Math.max(1, Math.floor(Number(currentGameDay) || 1))}`,
    `예약 가능 최소 시작일: ${Math.max(1, Math.floor(Number(minStartDay) || 1))}`,
    `오늘 남은 대여 가능 인원: ${availabilityText}`,
    `현재 예약 초안: ${JSON.stringify(normalizedPendingDraft || { crewType: '', count: 0, startDay: 0, endDay: 0 })}`,
    '출력 스키마:',
    '{"intent":"reserve","crewType":"","count":0,"allIn":false,"clearCrewType":false,"clearDate":false,"useMinStartDay":false,"startOffsetDays":0,"durationDays":0,"endOffsetDays":0,"dateText":"","note":"","replyText":""}'
  ].join('\n');
  const raw = await requestPhoneHelperReply({
    apiUrl,
    model,
    systemPrompt,
    history: (Array.isArray(history) ? history : []).slice(-8),
    onChunk: () => {}
  });
  return parsePhoneHelperLaborIntentResponse(raw);
};
