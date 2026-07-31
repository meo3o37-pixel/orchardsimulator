import { clamp } from './common';

const GROWTH_STAGE_EMOJI_MAP = {
  미식재: '🟫',
  휴면기: '🌙',
  '저온요구 충족': '❄️',
  '화아 유지': '🌿',
  '휴면 해제': '🌤️',
  '수액 이동': '💧',
  '발아 준비': '🌱',
  발아: '🌱',
  '화뢰 형성': '🌼',
  '화뢰 발달': '🌼',
  풍선기: '🎈',
  '개화 시작': '🌸',
  '개화 진행': '🌸',
  '수분 진행': '🐝',
  '수정진행(만개)': '🌺',
  낙화: '🍂',
  '수정 완료': '✅',
  '배발달 초기': '🥚',
  '유과 형성': '🍏',
  '초기 결실': '🍏',
  '종자 형성': '🌰',
  '1차 생리낙과': '🍃',
  '2차 생리낙과': '🍃',
  '결실 안정': '🟢',
  '생리낙과 종료': '✔️',
  '과실 비대 시작': '📈',
  세포분열기: '🧬',
  '비대 전환기': '🔄',
  '과실 비대 진행': '📈',
  세포비대기: '🫧',
  '성숙 전환기': '🍎',
  '착색 시작': '🎨',
  '착색 진행': '🎨',
  '성숙 진행': '🍎',
  '완숙 직전': '🍎',
  '성숙 완료': '🍎',
  수확기: '🧺',
  '휴면 준비기(양분축적·낙엽기)': '🍂'
};

export const growthStageLabel = (field) => {
  if (!field?.cropId) return '미식재';
  const g = Number(field.growth) || 0;

  if (g < 1) return '휴면기';
  if (g < 2) return '저온요구 충족';
  if (g < 3) return '화아 유지';
  if (g < 4) return '휴면 해제';
  if (g < 5) return '수액 이동';
  if (g < 6) return '발아 준비';
  if (g < 7) return '발아';
  if (g < 8) return '화뢰 형성';
  if (g < 8.8) return '화뢰 발달';
  if (g < 9.6) return '풍선기';
  if (g < 10.8) return '개화 시작';
  if (g < 12.2) return '개화 진행';
  if (g < 14) return '수분 진행';
  if (g < 16) return '수정진행(만개)';
  if (g < 19) return '낙화';
  if (g < 22) return '수정 완료';
  if (g < 25) return '배발달 초기';
  if (g < 30) return '유과 형성';
  if (g < 35) return '초기 결실';
  if (g < 40) return '종자 형성';
  if (g < 46) return '1차 생리낙과';
  if (g < 52) return '2차 생리낙과';
  if (g < 58) return '결실 안정';
  if (g < 62) return '생리낙과 종료';
  if (g < 67) return '과실 비대 시작';
  if (g < 72) return '세포분열기';
  if (g < 75) return '비대 전환기';
  if (g < 80) return '과실 비대 진행';
  if (g < 84) return '세포비대기';
  if (g < 87) return '성숙 전환기';
  if (g < 90) return '착색 시작';
  if (g < 93) return '착색 진행';
  if (g < 96) return '성숙 진행';
  if (g < 98) return '완숙 직전';
  if (g < 99.5) return '성숙 완료';
  if (g < 99.9) return '수확기';
  return '휴면 준비기(양분축적·낙엽기)';
};

export const growthStageText = (field) => {
  const label = growthStageLabel(field);
  const emoji = GROWTH_STAGE_EMOJI_MAP[label];
  return emoji ? `${emoji} ${label}` : label;
};
export const vigorStateText = (vigor) => {
  const v = clamp(Number(vigor) || 0, 0, 100);
  const bucket = Math.min(100, Math.floor(v / 10) * 10);
  const labels = {
    0: '수세 매우 약함',
    10: '수세 약함',
    20: '수세 다소 약함',
    30: '수세 약간 약함',
    40: '수세 약간 낮음',
    50: '보통',
    60: '수세 약간 강함',
    70: '수세 강함',
    80: '수세 매우 강함',
    90: '수세 과다',
    100: '수세 비정상적 과다'
  };
  return labels[bucket];
};

export const soilWaterStateText = (value) => {
  const v = clamp(Number(value) || 0, 0, 100);
  if (v < 10) return '극건조';
  if (v < 20) return '건조';
  if (v < 30) return '부족';
  if (v < 45) return '약간 부족';
  if (v < 50) return '보통';
  if (v < 60) return '적정';
  if (v < 75) return '양호';
  if (v < 90) return '다소 과습';
  return '과습';
};

export const soilNutritionStateText = (value) => {
  const v = clamp(Number(value) || 0, 0, 100);
  const bucket = Math.min(100, Math.floor(v / 10) * 10);
  const labels = {
    0: '양분 극고갈',
    10: '양분 매우 부족',
    20: '양분 부족',
    30: '양분 다소 부족',
    40: '양분 약간 낮음',
    50: '보통',
    60: '양분 약간 높음',
    70: '양분 양호',
    80: '양분 높음',
    90: '양분 과다(비료 과다 주의)',
    100: '양분 비정상적 과다(비료 과다 주의)'
  };
  return labels[bucket];
};

export const pestStateText = (value) => {
  const v = clamp(Number(value) || 0, 0, 100);
  if (v < 10) return '매우 낮음';
  if (v < 20) return '낮음';
  if (v < 30) return '주의';
  if (v < 40) return '경계';
  if (v < 50) return '높음';
  if (v < 60) return '매우 높음';
  if (v < 70) return '위험';
  if (v < 80) return '매우 위험';
  if (v < 90) return '치명적';
  return '재앙';
};

const QUALITY_STATE_LABELS = [
  '상품성 붕괴 하',
  '상품성 붕괴 상',
  '비상품 하',
  '비상품 상',
  '심각 불량 하',
  '심각 불량 상',
  '매우 불량 하',
  '매우 불량 상',
  '불량 하',
  '불량 상',
  '불량 하하',
  '불량 하중',
  '불량 중하',
  '불량 중중',
  '불량 상하',
  '불량 상중',
  '하품 하하',
  '하품 하중',
  '하품 중하',
  '하품 중중',
  '하품 상하',
  '하품 상중',
  '하품+ 하',
  '하품+ 상',
  '보통 미달 하하',
  '보통 미달 하중',
  '보통 미달 중하',
  '보통 미달 중중',
  '보통 미달 상하',
  '보통 미달 상중',
  '보통 하하',
  '보통 하중',
  '보통 중하',
  '보통 중중',
  '보통 상하',
  '보통 상중',
  '보통+ 하',
  '보통+ 상',
  '안정 품질 하',
  '안정 품질 상',
  '양호 하하',
  '양호 하중',
  '양호 중하',
  '양호 중중',
  '양호 상하',
  '양호 상중',
  '양호+ 하',
  '양호+ 상',
  '우수 진입 하',
  '우수 진입 상',
  '우수 하하',
  '우수 하중',
  '우수 중하',
  '우수 중중',
  '우수 상하',
  '우수 상중',
  '우수+ 하',
  '우수+ 상',
  '상급 진입 하',
  '상급 진입 상',
  '극상 하하',
  '극상 하중',
  '극상 중하',
  '극상 중중',
  '극상 상하',
  '극상 상중',
  '극상+ 하',
  '극상+ 상',
  '최상급 하',
  '최상급 상',
  '최상급 하하',
  '최상급 하중',
  '최상급 중하',
  '최상급 중중',
  '최상급 상하',
  '최상급 상중',
  '최상급+ 하',
  '최상급+ 상',
  '특상급 하',
  '특상급 상',
  '특상급 하하',
  '특상급 하중',
  '특상급 중하',
  '특상급 중중',
  '특상급 상하',
  '특상급 상중',
  '특상급+ 하',
  '특상급+ 상',
  '프리미엄 진입 하',
  '프리미엄 진입 상',
  '프리미엄 하하',
  '프리미엄 하중',
  '프리미엄 중하',
  '프리미엄 중중',
  '프리미엄 상하',
  '프리미엄 상중',
  '프리미엄+ 하',
  '프리미엄+ 상',
  '대회 출품급 하',
  '대회 출품급 중',
  '대회 출품급 상'
];

export const qualityStateText = (value, month = null) => {
  const rounded = Math.round(clamp(Number(value) || 0, 0, 100));
  return QUALITY_STATE_LABELS[rounded] || '보통 중중';
};

export const weedStateText = (value) => {
  const v = clamp(Number(value) || 0, 0, 100);
  if (v < 10) return '매우 낮음';
  if (v < 25) return '낮음';
  if (v < 45) return '보통';
  if (v < 65) return '높음';
  if (v < 85) return '매우 높음';
  return '심각';
};

