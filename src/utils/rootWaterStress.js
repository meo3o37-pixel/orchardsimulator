import { soilProfileOf } from './soil.js';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v) || 0));
export function normalizeRootWaterStress(raw) {
  return { version: 1, lastDay: Math.floor(clamp(raw?.lastDay, 0, 1000000)), wetDays: Math.floor(clamp(raw?.wetDays, 0, 365)), load: clamp(raw?.load, 0, 100) };
}
export function rootSoilRisk(field) {
  // Game coefficients: facilities mitigate actual moisture, not ownership fees.
  return .75 + .65 * (1 - clamp((soilProfileOf(field).excess - .25) / 2.15, 0, 1));
}
export function advanceRootWaterStress(field, water, day) {
  const old = normalizeRootWaterStress(field?.rootWaterStress);
  if (old.lastDay >= day) return old;
  const w = clamp(water, 0, 100), risk = rootSoilRisk(field);
  const wetDays = w >= 80 ? (old.lastDay === day - 1 ? old.wetDays : 0) + 1 : 0;
  const delta = w >= 80 ? ((w - 75) / 25) * 5 * risk : w <= 75 ? -5 : -1;
  return normalizeRootWaterStress({ lastDay: day, wetDays, load: old.load + delta });
}
export function rootWaterStressEffects(field) {
  const state = normalizeRootWaterStress(field?.rootWaterStress);
  const water = clamp(field?.water, 0, 100);
  const planted = Boolean(field?.cropId && Number(field?.trees) > 0);
  const active = planted && water >= 80 && (state.wetDays >= 2 || water >= 90 || state.load >= 25);
  if (!active) return { qualityPenalty: 0, vigorPenalty: 0, label: water >= 80 ? '과습 관찰' : state.load > 0 ? '회복 중' : '정상', state };
  const duration = Math.min(7, Math.max(state.wetDays - 1, state.load / 15));
  const risk = rootSoilRisk(field);
  return { qualityPenalty: Math.min(2.2, (.14 + (water - 80) * .035 + duration * .12) * risk),
    vigorPenalty: Math.min(3, (.30 + (water - 80) * .04 + duration * .18) * risk),
    label: water >= 95 && state.wetDays >= 4 ? '심각한 습해' : water >= 90 ? '습해 위험' : '지속 과습', state };
}
export function rootWaterStressHint(field) {
  const e = rootWaterStressEffects(field);
  const text = `${e.label} · 연속 과습 ${e.state.wetDays}일 · 뿌리 스트레스 ${e.state.load.toFixed(1)}/100`;
  return e.vigorPenalty ? `${text} · 수세 최소 -${e.vigorPenalty.toFixed(2)}/일 · 수분에 의한 품질 손실 -${e.qualityPenalty.toFixed(2)}/일` : text;
}
export function enforceRootVigorPenalty(previous, next, effects) {
  if (!(effects.vigorPenalty > 0)) return next;
  // Apply the larger loss, not a stacking second loss. Rain bonuses cannot
  // cancel root oxygen stress, and stronger existing damage remains intact.
  return { ...next, vigor: clamp(Math.min(Number(next.vigor) || 0, (Number(previous.vigor) || 0) - effects.vigorPenalty), 0, 100) };
}
