import { START_DATE } from '../config/gameConfig';

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const won = (v) => `${Math.round(v).toLocaleString()}원`;
export const roundKg = (valueRaw, fractionDigits = 2) => {
  const digits = Math.max(0, Math.floor(Number(fractionDigits) || 0));
  const unit = 10 ** digits;
  return Math.max(0, Math.round(((Number(valueRaw) || 0) + Number.EPSILON) * unit) / unit);
};
export const formatKg = (valueRaw, fractionDigits = 2) => (
  roundKg(valueRaw, fractionDigits).toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  })
);
export const toDate = (day) =>
  new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate() + day - 1);
export const inputDate = (day) => {
  const d = toDate(day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const dayFromInput = (value) => {
  const date = new Date(value);
  const diff = date.getTime() - START_DATE.getTime();
  return Math.floor(diff / 86400000) + 1;
};
export const longDate = (day) => {
  const d = toDate(day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const monthOf = (day) => toDate(day).getMonth() + 1;
export const seasonKo = (month) =>
  ([3, 4, 5].includes(month) ? '봄' : [6, 7, 8].includes(month) ? '여름' : [9, 10, 11].includes(month) ? '가을' : '겨울');
export const diaryLine = (day, text) => `[${longDate(day)}] ${text}`;
export const pushDiary = (prev, text, day = prev.day) => [diaryLine(day, text), ...(prev.logs || [])].slice(0, 120);
export const randIntInclusive = (min, max) => {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
};
