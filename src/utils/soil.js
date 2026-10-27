// Simplified game texture zones: percentages are land area shares, not sand/
// silt/clay particle fractions. These are game coefficients, not survey results.
export const SOIL_TYPES = Object.freeze([
  { key: 'sand', name: '사질토', drying: 1.35, excess: 2.4, channel: 1.15 },
  { key: 'sandyLoam', name: '사양토', drying: 1.16, excess: 1.6, channel: 1.08 },
  { key: 'loam', name: '양토', drying: 1, excess: 1, channel: 1 },
  { key: 'clayLoam', name: '식양토', drying: .88, excess: .55, channel: .92 },
  { key: 'clay', name: '점질토', drying: .72, excess: .25, channel: .85 }
]);

function percentages(values) {
  const total = values.reduce((sum, n) => sum + n, 0);
  const exact = values.map((n) => n / total * 100);
  const result = exact.map(Math.floor);
  const order = exact.map((n, i) => ({ i, fraction: n - result[i] })).sort((a, b) => b.fraction - a.fraction || a.i - b.i);
  const remaining = 100 - result.reduce((sum, v) => sum + v, 0);
  for (let n = 0; n < remaining; n++) result[order[n].i]++;
  return Object.fromEntries(SOIL_TYPES.map((type, i) => [type.key, result[i]]));
}

export function generateSoilComposition(landId = 0) {
  let seed = 2166136261;
  for (const char of `orchard-soil-v1:${landId}`) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const draw = random();
  const dominant = draw < .12 ? 0 : draw < .37 ? 1 : draw < .72 ? 2 : draw < .92 ? 3 : 4;
  const weights = SOIL_TYPES.map((_, i) => (3 + random() * 12) / (1 + .7 * Math.abs(i - dominant)));
  weights[dominant] += 18 + random() * 30;
  return percentages(weights);
}

export function normalizeSoilComposition(raw, landId = 0) {
  const values = SOIL_TYPES.map(({ key }) => Number(raw?.[key]));
  if (values.some((n) => !Number.isFinite(n) || n < 0 || n > 100) || values.reduce((a, b) => a + b, 0) <= 0) return generateSoilComposition(landId);
  return percentages(values);
}

export function soilProfileOf(field) {
  const composition = normalizeSoilComposition(field?.soilComposition, field?.id);
  const weighted = (key) => SOIL_TYPES.reduce((sum, type) => sum + type[key] * composition[type.key] / 100, 0);
  const dominant = SOIL_TYPES.reduce((best, type) => composition[type.key] > composition[best.key] ? type : best);
  return { composition, dominant: dominant.name, drying: weighted('drying'), excess: weighted('excess'), channel: weighted('channel') };
}

export const soilCompositionText = (field) => {
  const { composition } = soilProfileOf(field);
  return SOIL_TYPES.filter((type) => composition[type.key] > 0).map((type) => `${type.name} ${composition[type.key]}%`).join(' · ');
};

export function soilDailyWaterLoss(field, baseLoss) {
  // Unmigrated standalone callers retain legacy behavior. Game creation/load
  // materializes composition before simulation; there is no daily reroll.
  if (!field?.soilComposition) return Math.max(0, Number(baseLoss) || 0);
  const profile = soilProfileOf(field);
  const water = Math.max(0, Math.min(100, Number(field.water) || 0));
  const naturalExcess = Math.min(1, Math.max(0, water - 75) / 15) * profile.excess;
  return Math.max(0, Number(baseLoss) || 0) * profile.drying + naturalExcess;
}
