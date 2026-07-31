export const CREW_TYPES = {
  beginner: { key: 'beginner', name: '초보노동자', wage: 105000, workLabel: '수확보조/적재/운반보조/단순 정리 작업' },
  worker: { key: 'worker', name: '노동자', wage: 130000, workLabel: '적과/적엽/수확/기비/시설정비/포장 등 일반 작업' },
  skilledWorker: { key: 'skilledWorker', name: '숙련노동자', wage: 170000, workLabel: '고효율 수확/정밀 적과/현장 숙련 작업' },
  agriTechnician: { key: 'agriTechnician', name: '농업기술자', wage: 220000, workLabel: '작업지시 전정/약제살포/전문 관리 작업' }
};

export const ACTION_LABOR = {
  harvest: 10,
  transportPer100kg: 3,
  buyShop: 0,
  buyLand: 3,
  buyFacility: 4,
  rentCrew: 2,
  cancelCrew: 1,
  sellBatch: 1,
  sellAll: 2
};

export const QUALITY_IMPORTANT_TASK_BONUS = {
  winterPruning: 10,
  winterPruningHeavy: 10,
  thinning1: 10,
  thinning2: 10,
  thinning3: 10
};

export const MAJOR_LABOR_TASK_KEYS = ['winterPruning', 'winterPruningHeavy', 'thinning1', 'thinning2', 'thinning3'];

export const TEST_MARCH_DAY = 60; // 2026-03-01
