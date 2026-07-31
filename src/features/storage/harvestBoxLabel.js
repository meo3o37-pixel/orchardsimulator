import { formatKg, longDate, roundKg } from '../../utils/common';
import { normalizeHarvestGradeLabel } from '../../utils/harvestGrade';
import { CONTAINER_ITEMS } from '../../config/items/container';

const CONTAINER_NAME_BY_KEY = Object.fromEntries(
  (CONTAINER_ITEMS || []).map((item) => [String(item?.key || ''), String(item?.name || '').trim()])
);

export function isHarvestFullySortedBox({
  gradeLabel = '',
  sizeLabel = ''
} = {}) {
  const safeGradeLabel = normalizeHarvestGradeLabel(gradeLabel);
  const safeSizeLabel = String(sizeLabel || '').trim();
  return Boolean(
    safeGradeLabel
    && safeGradeLabel !== '미선별'
    && safeSizeLabel
    && safeSizeLabel !== '미측정'
  );
}

export function compactHarvestStemStatusLabelOf({
  stemRemoved,
  stemStatusKey = '',
  stemStatus = '',
  stemStatusLabel = '',
  stemLabel = ''
} = {}) {
  if (typeof stemRemoved === 'boolean') {
    return stemRemoved ? '꼭지제거됨' : '꼭지있음';
  }
  const normalizedStatusKey = String(stemStatusKey || stemStatus || '').trim();
  if (normalizedStatusKey === 'removed') return '꼭지제거됨';
  if (normalizedStatusKey === 'attached') return '꼭지있음';
  const rawLabel = String(stemStatusLabel || stemLabel || '').trim();
  if (rawLabel === '꼭지 제거' || rawLabel === '꼭지제거' || rawLabel === '꼭지 제거됨') return '꼭지제거됨';
  if (rawLabel === '꼭지 있음' || rawLabel === '꼭지있음') return '꼭지있음';
  return rawLabel || '꼭지있음';
}

export function formatHarvestBoxStateLabel({
  cropLabel = '수확물',
  qualityLabel = '보통',
  gradeLabel = '미선별',
  sizeLabel = '미측정',
  qtyKg = 0,
  stemRemoved,
  stemStatusKey = '',
  stemStatus = '',
  stemStatusLabel = '',
  stemLabel = ''
} = {}) {
  const safeCropLabel = String(cropLabel || '수확물').trim() || '수확물';
  const safeGradeLabel = normalizeHarvestGradeLabel(gradeLabel, '미선별') || '미선별';
  const safeSizeLabel = String(sizeLabel || '미측정').trim() || '미측정';
  const safeQualityLabel = isHarvestFullySortedBox({ gradeLabel: safeGradeLabel, sizeLabel: safeSizeLabel })
    ? '-'
    : (String(qualityLabel || '보통').trim() || '보통');
  const safeQtyKg = roundKg(qtyKg, 2);
  const compactStemStatusLabel = compactHarvestStemStatusLabelOf({
    stemRemoved,
    stemStatusKey,
    stemStatus,
    stemStatusLabel,
    stemLabel
  });
  return `${safeCropLabel} ${safeQualityLabel} ${compactStemStatusLabel} ${safeGradeLabel} ${formatKg(safeQtyKg, 2)}kg`.trim();
}

export function buildHarvestBoxStateLabelParts({
  produceTypeLabel = '사과',
  cropLabel = '수확물',
  qualityLabel = '보통',
  gradeLabel = '미선별',
  sizeLabel = '미측정',
  qtyKg = 0,
  life = 0,
  harvestedDay = 0,
  loadBoxKey = '',
  stemRemoved,
  stemStatusKey = '',
  stemStatus = '',
  stemStatusLabel = '',
  stemLabel = ''
} = {}) {
  const safeProduceTypeLabel = String(produceTypeLabel || '사과').trim() || '사과';
  const safeCropLabel = String(cropLabel || '수확물').trim() || '수확물';
  const safeGradeLabel = normalizeHarvestGradeLabel(gradeLabel, '미선별') || '미선별';
  const safeSizeLabel = String(sizeLabel || '미측정').trim() || '미측정';
  const safeQualityLabel = isHarvestFullySortedBox({ gradeLabel: safeGradeLabel, sizeLabel: safeSizeLabel })
    ? '-'
    : (String(qualityLabel || '보통').trim() || '보통');
  const safeQtyKg = roundKg(qtyKg, 2);
  const numericLife = Number(life);
  const hasLife = life !== null && life !== undefined && String(life).trim() !== '' && Number.isFinite(numericLife);
  const safeLife = hasLife ? Math.max(0, Math.floor(numericLife)) : null;
  const safeHarvestedDay = Math.max(0, Math.floor(Number(harvestedDay) || 0));
  const safeLoadBoxKey = String(loadBoxKey || '').trim();
  const compactStemStatusLabel = compactHarvestStemStatusLabelOf({
    stemRemoved,
    stemStatusKey,
    stemStatus,
    stemStatusLabel,
    stemLabel
  });
  const weightLabel = `${formatKg(safeQtyKg, 2)}kg`;
  const harvestedDateText = safeHarvestedDay > 0 ? longDate(safeHarvestedDay) : '0000-00-00';
  const loadBoxLabel = CONTAINER_NAME_BY_KEY[safeLoadBoxKey] || (safeLoadBoxKey ? '수확 컨테이너' : '정보 없음');
  const text = [
    `과종: ${safeProduceTypeLabel}`,
    `품종: ${safeCropLabel}`,
    `외관 품질: ${safeQualityLabel}`,
    `꼭지 상태: ${compactStemStatusLabel}`,
    `급: ${safeGradeLabel}`,
    `크기: ${safeSizeLabel}`,
    `중량: ${weightLabel}`,
    `신선도: ${hasLife ? `${safeLife}%` : '정보 없음'}`,
    `담긴 상자: ${loadBoxLabel}`,
    `수확일: ${harvestedDateText}`,
  ].join('\n');
  return {
    produceTypeLabel: safeProduceTypeLabel,
    cropLabel: safeCropLabel,
    qualityLabel: safeQualityLabel,
    stemStatusLabel: compactStemStatusLabel,
    gradeLabel: safeGradeLabel,
    sizeLabel: safeSizeLabel,
    weightLabel,
    loadBoxLabel,
    harvestedDateText,
    life: safeLife ?? 0,
    text,
  };
}
