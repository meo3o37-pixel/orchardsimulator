const clampValue = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const CONDITION_MAX_DAYS = 14;

const normalizeConditionMap = (raw = {}, defs = {}) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const next = {};
  Object.entries(source).forEach(([keyRaw, entry]) => {
    const key = String(keyRaw || '');
    if (!defs[key]) return;
    const severity = clampValue(Math.floor(Number(entry?.severity) || 1), 1, 3);
    const remainingDays = clampValue(Math.floor(Number(entry?.remainingDays) || 0), 0, CONDITION_MAX_DAYS);
    if (remainingDays <= 0) return;
    next[key] = {
      severity,
      remainingDays,
      diagnosed: Boolean(entry?.diagnosed)
    };
  });
  return next;
};

export const PLAYER_INJURY_DEFS = Object.freeze({
  handCut: { label: '손 베임', baseDays: 2, healthLoss: 2.5, slots: ['gloves'] },
  eyeIrritation: { label: '눈 이물감', baseDays: 2, healthLoss: 2.2, slots: ['eyes'] },
  slipBruise: { label: '미끄러짐', baseDays: 3, healthLoss: 3.5, slots: ['shoes'] },
  backStrain: { label: '허리 삠', baseDays: 4, healthLoss: 4.0, slots: [] },
  headBump: { label: '머리 부딪힘', baseDays: 3, healthLoss: 3.0, slots: ['head'] },
  chemicalExposure: { label: '약제 노출', baseDays: 3, healthLoss: 4.5, slots: ['face', 'eyes', 'gloves'] }
});

export const PLAYER_ILLNESS_DEFS = Object.freeze({
  cold: {
    label: '감기 기운',
    symptoms: ['오한과 잔기침', '콧물과 목 따가움', '몸이 으슬으슬함', '목이 잠기고 머리가 무거움'],
    baseDays: 3,
    dailyHealthLoss: 0.6
  },
  severeCold: {
    label: '몸살감기',
    symptoms: ['열감과 오한이 번갈아 옴', '기침이 깊어지고 온몸이 쑤심', '머리가 무겁고 식은땀이 남', '목 통증과 근육통이 같이 옴'],
    baseDays: 4,
    dailyHealthLoss: 1.1
  },
  overwork: {
    label: '몸살 기운',
    symptoms: ['근육통과 몸 무거움', '팔다리가 쑤심', '잠을 자도 피로가 남음', '식은땀과 무기력함'],
    baseDays: 2,
    dailyHealthLoss: 0.7
  },
  exhaustion: {
    label: '과로성 탈진',
    symptoms: ['몸에 힘이 빠지고 식은땀이 남', '일어나면 어지럽고 다리가 후들거림', '가슴이 답답하고 집중이 끊김', '잠을 자도 회복이 거의 안 됨'],
    baseDays: 3,
    dailyHealthLoss: 1.2
  },
  dehydration: {
    label: '탈수 기운',
    symptoms: ['갈증과 어지러움', '입이 마르고 집중이 안 됨', '두통과 열감', '소변이 줄고 몸이 처짐'],
    baseDays: 2,
    dailyHealthLoss: 0.5
  },
  heatExhaustion: {
    label: '열탈진',
    symptoms: ['심한 갈증과 어지럼', '식은땀이 나고 몸에 힘이 빠짐', '두통과 메스꺼움이 같이 옴', '더위에 서 있기 힘듦'],
    baseDays: 3,
    dailyHealthLoss: 1.3
  },
  pesticideHeadache: {
    label: '약제 두통',
    symptoms: ['두통과 메스꺼움', '눈 따가움과 울렁거림', '목 안쪽이 칼칼함', '피부 따가움과 어지러움'],
    baseDays: 2,
    dailyHealthLoss: 0.6
  },
  pesticidePoisoning: {
    label: '약제 중독 의심',
    symptoms: ['두통과 구역감이 심해짐', '어지럽고 눈이 따가움', '목과 가슴이 답답함', '피부 따가움과 메스꺼움이 지속됨'],
    baseDays: 4,
    dailyHealthLoss: 1.4
  },
  stomachUpset: {
    label: '위장불량',
    symptoms: ['속 더부룩함', '메스꺼움과 식욕 저하', '배가 살살 아픔', '트림이 잦고 속이 불편함'],
    baseDays: 2,
    dailyHealthLoss: 0.4
  },
  acuteGastritis: {
    label: '급성 위염',
    symptoms: ['속쓰림과 메스꺼움이 심함', '명치가 묵직하고 식욕이 떨어짐', '배가 콕콕 아프고 울렁거림', '먹으면 속이 바로 불편해짐'],
    baseDays: 3,
    dailyHealthLoss: 0.9
  },
  wristAche: {
    label: '손목 통증',
    symptoms: ['손목 욱신거림', '손가락 힘이 잘 안 들어감', '손목을 돌리면 뻐근함'],
    baseDays: 2,
    dailyHealthLoss: 0.35
  },
  wristTendonitis: {
    label: '손목 건초염',
    symptoms: ['손목을 굽히면 찌릿함', '손가락 힘이 잘 안 들어감', '물건을 들 때 손목이 아픔', '손목 주변이 붓고 욱신거림'],
    baseDays: 5,
    dailyHealthLoss: 0.75
  },
  backAche: {
    label: '허리 통증',
    symptoms: ['허리 뻐근함', '허리를 숙일 때 찌릿함', '오래 서 있으면 허리가 묵직함'],
    baseDays: 3,
    dailyHealthLoss: 0.45
  },
  lumbarStrain: {
    label: '급성 요통',
    symptoms: ['허리를 펴기 힘듦', '숙일 때 허리가 찌릿함', '오래 서 있으면 통증이 올라옴', '다리까지 묵직하게 당김'],
    baseDays: 5,
    dailyHealthLoss: 0.9
  },
  sleepDebt: {
    label: '수면부족',
    symptoms: ['눈이 무겁고 멍함', '집중이 잘 안 됨', '계속 하품이 남', '몸이 느리게 반응함'],
    baseDays: 2,
    dailyHealthLoss: 0.35
  },
  insomnia: {
    label: '불면 상태',
    symptoms: ['잠들기 어렵고 머리가 맑지 않음', '밤새 뒤척여 몸이 무거움', '낮에도 멍하고 예민함', '피로가 풀리지 않고 누적됨'],
    baseDays: 4,
    dailyHealthLoss: 0.8
  }
});

export const normalizePlayerInjuries = (raw = {}) => normalizeConditionMap(raw, PLAYER_INJURY_DEFS);
export const normalizePlayerIllnesses = (raw = {}) => normalizeConditionMap(raw, PLAYER_ILLNESS_DEFS);

const symptomLabelOf = (def = {}, random = Math.random) => {
  const symptoms = Array.isArray(def?.symptoms) ? def.symptoms : [];
  if (symptoms.length > 0) {
    const index = clampValue(Math.floor((Number(random()) || 0) * symptoms.length), 0, symptoms.length - 1);
    return symptoms[index];
  }
  return def?.symptomLabel || '몸이 평소와 다릅니다.';
};

const taskRiskProfileOf = (taskKeyRaw = '') => {
  const taskKey = String(taskKeyRaw || '');
  if (/pest|spray|herbicide|foliar|bloomPest|overwinter/i.test(taskKey)) {
    return { injuryKey: 'chemicalExposure', baseRisk: 0.025 };
  }
  if (/prun|thinning|leafPlucking|canopy|seal/i.test(taskKey)) {
    return { injuryKey: 'handCut', baseRisk: 0.02 };
  }
  if (/mow|shred|cleanup/i.test(taskKey)) {
    return { injuryKey: 'eyeIrritation', baseRisk: 0.022 };
  }
  if (/trellis|irrigation|brick|container|reflective|plant/i.test(taskKey)) {
    return { injuryKey: 'backStrain', baseRisk: 0.015 };
  }
  return { injuryKey: 'slipBruise', baseRisk: 0.008 };
};

const equippedSlotSetOf = (field = null) => {
  const byFacility = field?.housingClothingEquipmentsByFacilityKey || {};
  const slots = new Set();
  Object.values(byFacility || {}).forEach((slotMap) => {
    Object.entries(slotMap || {}).forEach(([slotKey, itemKey]) => {
      if (itemKey) slots.add(String(slotKey || ''));
    });
  });
  return slots;
};

const protectionRatioOf = (injuryKey = '', equippedSlots = new Set()) => {
  const slots = PLAYER_INJURY_DEFS[injuryKey]?.slots || [];
  if (!slots.length) return 0;
  const equippedCount = slots.reduce((sum, slot) => sum + (equippedSlots.has(slot) ? 1 : 0), 0);
  return clampValue(equippedCount / slots.length, 0, 1);
};

export const rollWorkAccident = ({
  taskKey = '',
  source = 'work',
  field = null,
  health = 100,
  remainingLabor = 100,
  weatherName = '',
  timeOfDay = 'day',
  random = Math.random
} = {}) => {
  if (String(source || 'work') === 'workOrder') return null;
  const profile = taskRiskProfileOf(taskKey);
  const equippedSlots = equippedSlotSetOf(field);
  const protectionRatio = protectionRatioOf(profile.injuryKey, equippedSlots);
  const weatherText = String(weatherName || '');
  const isWet = /비|소나기|폭우|눈|우천|장마/.test(weatherText);
  const risk = clampValue(
    profile.baseRisk
      + (isWet ? 0.01 : 0)
      + (String(timeOfDay || 'day') === 'night' ? 0.01 : 0)
      + (Number(health) <= 40 ? 0.012 : 0)
      + (Number(remainingLabor) <= 10 ? 0.012 : 0),
    0,
    0.12
  ) * (1 - (protectionRatio * 0.65));
  if ((Number(random()) || 0) >= risk) return null;
  const severityRoll = Number(random()) || 0;
  const severity = severityRoll > 0.92 ? 3 : (severityRoll > 0.65 ? 2 : 1);
  const def = PLAYER_INJURY_DEFS[profile.injuryKey];
  const healthLoss = Math.round((def.healthLoss * (0.75 + severity * 0.35)) * 10) / 10;
  return {
    key: profile.injuryKey,
    label: def.label,
    severity,
    remainingDays: Math.max(1, Math.floor(def.baseDays + severity - 1)),
    healthLoss,
    risk,
    protected: protectionRatio > 0
  };
};

export const applyWorkAccidentToGameState = (gameState, accident = null, pushDiary = null) => {
  if (!gameState || !accident) return gameState;
  const current = normalizePlayerInjuries(gameState.playerInjuries || {});
  const existing = current[accident.key] || {};
  const nextInjuries = {
    ...current,
    [accident.key]: {
      severity: Math.max(Math.floor(Number(existing.severity) || 0), accident.severity),
      remainingDays: Math.max(Math.floor(Number(existing.remainingDays) || 0), accident.remainingDays)
    }
  };
  const prevHealth = Number.isFinite(Number(gameState.health)) ? clampValue(Number(gameState.health), 0, 100) : 100;
  const nextHealth = Math.round(clampValue(prevHealth - accident.healthLoss, 0, 100) * 10) / 10;
  const protectionText = accident.protected ? '보호구 덕분에 피해가 줄었습니다.' : '맞는 보호구가 없었습니다.';
  const logText = `작업 사고: ${accident.label} ${accident.severity}단계 (건강 -${accident.healthLoss.toFixed(1)}, ${prevHealth.toFixed(1)} → ${nextHealth.toFixed(1)}) · ${protectionText}`;
  return {
    ...gameState,
    health: nextHealth,
    playerInjuries: nextInjuries,
    logs: typeof pushDiary === 'function'
      ? pushDiary(gameState, logText)
      : [logText, ...(gameState.logs || [])].slice(0, 120)
  };
};

const decayConditions = (raw = {}, defs = {}) => {
  const normalized = normalizeConditionMap(raw, defs);
  const next = {};
  Object.entries(normalized).forEach(([key, entry]) => {
    const remainingDays = Math.max(0, Math.floor(Number(entry.remainingDays) || 0) - 1);
    if (remainingDays > 0) next[key] = { ...entry, remainingDays };
  });
  return next;
};

const PLAYER_ILLNESS_PROGRESSION_DEFS = Object.freeze({
  cold: { nextKey: 'severeCold', baseRisk: 0.04, healthRisk: 0.025, coldRisk: 0.08 },
  overwork: { nextKey: 'exhaustion', baseRisk: 0.035, laborRisk: 0.06, healthRisk: 0.025 },
  dehydration: { nextKey: 'heatExhaustion', baseRisk: 0.035, heatRisk: 0.07, laborRisk: 0.02 },
  pesticideHeadache: { nextKey: 'pesticidePoisoning', baseRisk: 0.035, injuryKey: 'chemicalExposure', injuryRisk: 0.08 },
  stomachUpset: { nextKey: 'acuteGastritis', baseRisk: 0.025, healthRisk: 0.02 },
  wristAche: { nextKey: 'wristTendonitis', baseRisk: 0.025, injuryKey: 'handCut', injuryRisk: 0.035, laborRisk: 0.015 },
  backAche: { nextKey: 'lumbarStrain', baseRisk: 0.03, injuryKey: 'backStrain', injuryRisk: 0.055, laborRisk: 0.02 },
  sleepDebt: { nextKey: 'insomnia', baseRisk: 0.03, laborRisk: 0.045, healthRisk: 0.02 }
});

const progressPlayerIllnesses = ({
  illnesses = {},
  injuries = {},
  health = 100,
  remainingSelfLabor = 100,
  indoorColdRisk = 0,
  indoorHeatRisk = 0,
  random = Math.random
} = {}) => {
  const nextIllnesses = { ...(illnesses || {}) };
  const logs = [];
  Object.entries(PLAYER_ILLNESS_PROGRESSION_DEFS).forEach(([sourceKey, rule]) => {
    const sourceEntry = nextIllnesses[sourceKey];
    const targetKey = String(rule.nextKey || '');
    const targetDef = PLAYER_ILLNESS_DEFS[targetKey];
    if (!sourceEntry || !targetDef || nextIllnesses[targetKey]) return;
    const severity = Math.max(1, Number(sourceEntry.severity) || 1);
    const risk = clampValue(
      Number(rule.baseRisk) || 0
        + (severity >= 2 ? 0.025 : 0)
        + (Number(health) <= 45 ? (Number(rule.healthRisk) || 0) : 0)
        + (Number(remainingSelfLabor) <= 8 ? (Number(rule.laborRisk) || 0) : 0)
        + (rule.injuryKey && injuries?.[rule.injuryKey] ? (Number(rule.injuryRisk) || 0) : 0)
        + ((Number(rule.coldRisk) || 0) * clampValue(Number(indoorColdRisk) || 0, 0, 0.4))
        + ((Number(rule.heatRisk) || 0) * clampValue(Number(indoorHeatRisk) || 0, 0, 0.4)),
      0,
      0.22
    );
    if ((Number(random()) || 0) >= risk) return;
    const nextSeverity = clampValue(Math.floor(severity + 1), 1, 3);
    delete nextIllnesses[sourceKey];
    nextIllnesses[targetKey] = {
      severity: nextSeverity,
      remainingDays: Math.max(1, Math.floor(Number(targetDef.baseDays) || 2) + nextSeverity - 1),
      diagnosed: false
    };
    logs.push(`증상 악화: ${PLAYER_ILLNESS_DEFS[sourceKey]?.label || sourceKey}이 ${targetDef.label}으로 번진 것 같습니다. 병원 진단이 필요합니다.`);
  });
  return { illnesses: nextIllnesses, logs };
};

export const rollDailyPlayerConditions = ({
  gameState = null,
  weatherName = '',
  temperatureC = 15,
  indoorInfo = null,
  remainingSelfLabor = 100,
  random = Math.random
} = {}) => {
  if (!gameState) return { playerInjuries: {}, playerIllnesses: {}, healthDelta: 0, logs: [] };
  const nextInjuries = decayConditions(gameState.playerInjuries || {}, PLAYER_INJURY_DEFS);
  const nextIllnesses = decayConditions(gameState.playerIllnesses || {}, PLAYER_ILLNESS_DEFS);
  const logs = [];
  let healthDelta = 0;
  Object.entries(nextInjuries).forEach(([key, entry]) => {
    const loss = Math.round((0.15 * Math.max(1, Number(entry.severity) || 1)) * 10) / 10;
    healthDelta -= loss;
    logs.push(`부상 회복 중: ${PLAYER_INJURY_DEFS[key]?.label || key} (${entry.remainingDays}일 남음, 건강 -${loss.toFixed(1)})`);
  });
  Object.entries(nextIllnesses).forEach(([key, entry]) => {
    const def = PLAYER_ILLNESS_DEFS[key] || {};
    const loss = Math.round(((def.dailyHealthLoss || 0.4) * Math.max(1, Number(entry.severity) || 1)) * 10) / 10;
    healthDelta -= loss;
    const visibleLabel = entry.diagnosed ? (def.label || key) : symptomLabelOf(def, random);
    const prefix = entry.diagnosed ? '진단받은 병' : '증상';
    logs.push(`${prefix}: ${visibleLabel} (${entry.remainingDays}일 남음, 건강 -${loss.toFixed(1)})`);
  });

  const weatherText = String(weatherName || '');
  const isWet = /비|소나기|폭우|눈|우천|장마/.test(weatherText);
  const temp = Number(temperatureC) || 15;
  const indoorIllnessRiskInfo = indoorInfo?.illnessRiskInfo || {};
  const indoorColdRisk = Math.max(0, Number(indoorIllnessRiskInfo.coldRisk) || 0);
  const indoorHeatRisk = Math.max(0, Number(indoorIllnessRiskInfo.heatRisk) || 0);
  const progressedIllnessResult = progressPlayerIllnesses({
    illnesses: nextIllnesses,
    injuries: nextInjuries,
    health: gameState?.health,
    remainingSelfLabor,
    indoorColdRisk,
    indoorHeatRisk,
    random
  });
  Object.keys(nextIllnesses).forEach((key) => {
    if (!progressedIllnessResult.illnesses[key]) delete nextIllnesses[key];
  });
  Object.assign(nextIllnesses, progressedIllnessResult.illnesses);
  logs.push(...progressedIllnessResult.logs);
  const candidates = [
    { key: 'cold', risk: (isWet ? 0.035 : 0) + (temp <= 3 ? 0.025 : 0) + indoorColdRisk },
    { key: 'overwork', risk: Number(remainingSelfLabor) <= 5 ? 0.045 : (Number(remainingSelfLabor) <= 15 ? 0.02 : 0) },
    { key: 'dehydration', risk: (temp >= 30 ? 0.025 : 0) + indoorHeatRisk },
    { key: 'pesticideHeadache', risk: nextInjuries.chemicalExposure ? 0.05 : 0 },
    { key: 'wristAche', risk: nextInjuries.handCut || Number(remainingSelfLabor) <= 12 ? 0.012 : 0 },
    { key: 'backAche', risk: nextInjuries.backStrain ? 0.045 : 0 },
    { key: 'stomachUpset', risk: Number(gameState?.health) <= 35 ? 0.012 : 0 },
    { key: 'sleepDebt', risk: Number(remainingSelfLabor) <= 0 ? 0.018 : 0 },
  ];
  candidates.forEach((candidate) => {
    const progressedKey = PLAYER_ILLNESS_PROGRESSION_DEFS[candidate.key]?.nextKey || '';
    if (nextIllnesses[candidate.key] || (progressedKey && nextIllnesses[progressedKey]) || candidate.risk <= 0) return;
    if ((Number(random()) || 0) >= candidate.risk) return;
    const def = PLAYER_ILLNESS_DEFS[candidate.key];
    nextIllnesses[candidate.key] = { severity: 1, remainingDays: def.baseDays, diagnosed: false };
    logs.push(`새로운 증상: ${symptomLabelOf(def, random)}이 느껴집니다. 병원에서 진단받아야 정확히 알 수 있습니다.`);
  });

  return {
    playerInjuries: nextInjuries,
    playerIllnesses: nextIllnesses,
    healthDelta: Math.round(healthDelta * 10) / 10,
    logs
  };
};
