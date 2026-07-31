export const PLAYER_HEALTH_STATUS_STEPS = Object.freeze([
  { min: 96, label: '몸이 날아갈 듯함', detail: '컨디션 최고. 무리한 작업도 버틸 만함' },
  { min: 90, label: '아주 건강함', detail: '하루 작업을 넉넉하게 소화 가능' },
  { min: 82, label: '몸이 가벼움', detail: '움직임이 편하고 집중도 좋음' },
  { min: 74, label: '괜찮음', detail: '평소처럼 일하기 좋은 상태' },
  { min: 66, label: '살짝 피곤함', detail: '긴 작업은 조금 부담됨' },
  { min: 58, label: '몸이 무거움', detail: '작업 사이 휴식이 있으면 좋음' },
  { min: 50, label: '피로가 쌓임', detail: '무리하면 회복이 늦어짐' },
  { min: 42, label: '컨디션 저하', detail: '식사나 휴식이 필요한 상태' },
  { min: 34, label: '몸살 기운', detail: '힘든 작업은 피하는 게 좋음' },
  { min: 26, label: '많이 지침', detail: '간단한 일도 버겁게 느껴짐' },
  { min: 18, label: '거의 방전됨', detail: '오늘은 쉬는 쪽이 나음' },
  { min: 10, label: '위험 신호', detail: '회복 전까지 작업 중단 권장' },
  { min: 0, label: '쓰러지기 직전', detail: '즉시 휴식과 회복이 필요함' },
]);

export const PLAYER_SELF_LABOR_STATUS_STEPS = Object.freeze([
  { min: 96, label: '힘이 넘침', detail: '큰 작업도 바로 시작 가능' },
  { min: 90, label: '여유 만만', detail: '오늘 작업량을 넉넉히 잡아도 됨' },
  { min: 82, label: '든든함', detail: '웬만한 작업은 무리 없음' },
  { min: 74, label: '괜찮게 남음', detail: '중간 규모 작업까지 가능' },
  { min: 66, label: '조금 줄어듦', detail: '작업 우선순위를 정하면 좋음' },
  { min: 58, label: '절반쯤 남음', detail: '큰일 하나면 꽤 소모될 수 있음' },
  { min: 50, label: '슬슬 아껴야 함', detail: '가벼운 작업 위주가 좋음' },
  { min: 42, label: '힘이 빠짐', detail: '연속 작업은 부담됨' },
  { min: 34, label: '많이 부족함', detail: '작업량을 줄이는 게 좋음' },
  { min: 26, label: '거의 바닥', detail: '작은 일 몇 개가 한계' },
  { min: 18, label: '헉헉댐', detail: '잠깐 쉬고 움직이는 게 좋음' },
  { min: 10, label: '기진맥진', detail: '작업 실패 위험이 커짐' },
  { min: 0, label: '완전 방전', detail: '휴식 없이는 일하기 어려움' },
]);

const clampValue = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export const playerStatusStepForValue = (steps, value) => {
  const safeValue = clampValue(Number(value) || 0, 0, 100);
  return steps.find((step) => safeValue >= Number(step.min || 0)) || steps[steps.length - 1];
};

export const healthWorkEfficiencyMultiplierOf = (healthRaw = 100) => {
  const health = Number.isFinite(Number(healthRaw)) ? clampValue(Number(healthRaw), 0, 100) : 100;
  if (health >= 90) return 1.02;
  if (health >= 75) return 1;
  if (health >= 60) return 0.98;
  if (health >= 45) return 0.95;
  if (health >= 30) return 0.91;
  if (health >= 15) return 0.85;
  return 0.75;
};

export const healthSleepDeltaOf = (sleepQualityInfo = null) => {
  const score = clampValue(Number(sleepQualityInfo?.score) || 0, 0, 100);
  if (score >= 90) return 0.8;
  if (score >= 75) return 0.4;
  if (score >= 55) return 0.1;
  if (score >= 35) return -0.4;
  return -0.9;
};

export const healthLivingDeltaOf = (livingConditionInfo = null) => {
  const score = clampValue(Number(livingConditionInfo?.score) || 0, 0, 100);
  if (score >= 90) return 0.5;
  if (score >= 75) return 0.25;
  if (score >= 60) return 0.05;
  if (score >= 45) return -0.25;
  if (score >= 30) return -0.65;
  return -1.0;
};

export const healthLaborFatigueDeltaOf = ({ remainingSelfLabor = 100, nightUsedLabor = 0 } = {}) => {
  const remaining = clampValue(Number(remainingSelfLabor) || 0, 0, 125);
  const nightUsed = Math.max(0, Number(nightUsedLabor) || 0);
  const dayFatigue = remaining <= 0 ? -1.4
    : remaining <= 5 ? -1.1
      : remaining <= 10 ? -0.7
        : remaining <= 30 ? -0.3
          : 0;
  const nightFatigue = nightUsed >= 40 ? -0.8
    : nightUsed >= 20 ? -0.4
      : 0;
  return dayFatigue + nightFatigue;
};

const healthDeltaToneOf = (deltaRaw = 0) => {
  const delta = Number(deltaRaw) || 0;
  if (delta >= 0.5) return '회복 좋음';
  if (delta > 0) return '조금 회복';
  if (delta <= -1.2) return '건강 악화';
  if (delta < 0) return '조금 나빠짐';
  return '변화 없음';
};

const signedFixed = (valueRaw = 0) => {
  const value = Math.round((Number(valueRaw) || 0) * 10) / 10;
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}`;
};

export const healthChangeReasonTextOf = (factors = {}) => {
  const rows = [
    ['기본회복', factors.base],
    ['수면', factors.sleep],
    ['생활여건', factors.living],
    ['노동피로', factors.laborFatigue],
  ]
    .filter(([, value]) => Math.abs(Number(value) || 0) >= 0.05)
    .map(([label, value]) => `${label} ${signedFixed(value)}`);
  return rows.join(' / ');
};

export const dailyHealthChangeOf = ({
  currentHealth = 100,
  sleepQualityInfo = null,
  livingConditionInfo = null,
  remainingSelfLabor = 100,
  nightUsedLabor = 0
} = {}) => {
  const previousHealth = Number.isFinite(Number(currentHealth)) ? clampValue(Number(currentHealth), 0, 100) : 100;
  const factors = {
    base: 0.5,
    sleep: healthSleepDeltaOf(sleepQualityInfo),
    living: healthLivingDeltaOf(livingConditionInfo),
    laborFatigue: healthLaborFatigueDeltaOf({ remainingSelfLabor, nightUsedLabor })
  };
  const rawDelta = factors.base + factors.sleep + factors.living + factors.laborFatigue;
  const delta = Math.round(clampValue(rawDelta, -3, 3) * 10) / 10;
  const nextHealth = Math.round(clampValue(previousHealth + delta, 0, 100) * 10) / 10;
  return {
    previousHealth,
    nextHealth,
    delta: Math.round((nextHealth - previousHealth) * 10) / 10,
    rawDelta,
    tone: healthDeltaToneOf(delta),
    factors,
    reasonText: healthChangeReasonTextOf(factors)
  };
};
