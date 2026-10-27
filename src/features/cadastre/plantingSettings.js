import { CROPS } from '../../config/game/crops.js';

export const PLANTING_CROPS = [{ key: 'apple', label: '사과', varieties: Object.values(CROPS).map(({ id, name }) => ({ key: id, label: name })) }];

// Game spacing limits; these are not universal agronomic recommendations.
export const PLANTING_ROOTSTOCKS = [
  { key: 'M9', label: 'M9', rowSpacing: 3, treeSpacing: 1 },
  { key: 'M26', label: 'M26', rowSpacing: 3, treeSpacing: 1.5 }
];

export const plantingRootstockOf = (key) => PLANTING_ROOTSTOCKS.find((rootstock) => rootstock.key === key) || PLANTING_ROOTSTOCKS[0];

const PLANTING_FIELDS = [
  { key: 'rowSpacing', label: '열 간격', unit: 'm', min: 1, max: 30, step: 0.1, defaultValue: 3.5 },
  { key: 'treeSpacing', label: '주 간격', unit: 'm', min: 0.5, max: 20, step: 0.1, defaultValue: 1.5 },
  { key: 'angleDeg', label: '식재 각도', unit: '°', min: -180, max: 180, step: 1, defaultValue: 0 },
  { key: 'edgeMargin', label: '경계 안쪽 여백', unit: 'm', min: 0, max: 50, step: 0.1, defaultValue: 1 }
];

export const plantingFieldsOf = (rootstock) => {
  const limits = plantingRootstockOf(rootstock);
  return PLANTING_FIELDS.map((field) => field.key in limits ? { ...field, min: limits[field.key], defaultValue: limits[field.key] } : field);
};

export const normalizePlantingSettings = (raw) => {
  const rootstock = plantingRootstockOf(raw?.rootstock);
  return {
    // Keep legacy plans unlabelled instead of guessing a variety for existing trees.
    ...(raw?.crop != null || raw?.variety != null ? {
      crop: 'apple',
      variety: PLANTING_CROPS[0].varieties.some((variety) => variety.key === raw?.variety) ? raw.variety : ''
    } : {}),
    rootstock: rootstock.key,
    ...Object.fromEntries(PLANTING_FIELDS.map((field) => {
      const value = raw?.[field.key];
      const number = value == null || value === '' ? NaN : Number(value);
      const fallback = rootstock[field.key] ?? field.defaultValue;
      // Preserve existing layouts; stricter rootstock limits are checked on save.
      return [field.key, Number.isFinite(number) ? Math.min(field.max, Math.max(field.min, number)) : fallback];
    }))
  };
};

export const plantingSettingsError = (raw) => {
  if (raw?.crop != null && raw.crop !== 'apple') return '품목을 선택해 주세요.';
  if (raw?.variety && !PLANTING_CROPS[0].varieties.some((variety) => variety.key === raw.variety)) return '품종을 선택해 주세요.';
  if (raw?.rootstock != null && !PLANTING_ROOTSTOCKS.some((rootstock) => rootstock.key === raw.rootstock)) return '대목을 선택해 주세요.';
  const rootstock = plantingRootstockOf(raw?.rootstock);
  for (const field of plantingFieldsOf(rootstock.key)) {
    const value = raw?.[field.key];
    const number = value == null || value === '' ? NaN : Number(value);
    if (!Number.isFinite(number) || number < field.min || number > field.max) return `${rootstock.label} ${field.label}: ${field.min}~${field.max}${field.unit} 범위로 입력해 주세요.`;
  }
  return '';
};
