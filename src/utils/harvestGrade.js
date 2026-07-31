export const PROCESSING_GRADE_LABEL = '가공급';
export const LEGACY_PROCESSING_GRADE_LABEL = '가공품';

export function normalizeHarvestGradeLabel(value, fallback = '') {
  const gradeLabel = String(value || '').trim();
  if (!gradeLabel) return String(fallback || '').trim();
  if (gradeLabel === LEGACY_PROCESSING_GRADE_LABEL) return PROCESSING_GRADE_LABEL;
  return gradeLabel;
}

export function isProcessingHarvestGradeLabel(value) {
  return normalizeHarvestGradeLabel(value) === PROCESSING_GRADE_LABEL;
}
