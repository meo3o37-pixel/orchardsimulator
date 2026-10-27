// Stable game terrain, independent of soil composition and daily weather.
export function generateSlopeBearing(landId = 0) {
  let seed = 2166136261;
  for (const char of `orchard-slope-v1:${landId}`) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b) >>> 0;
  seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b) >>> 0;
  return ((seed ^ (seed >>> 16)) >>> 0) % 8 * 45;
}

const validBearing = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value < 360;
export function slopeBearingOf(field) {
  if (validBearing(field?.slopeBearing)) return field.slopeBearing;
  // Preserve existing routes when migrating old saves, rather than rotating
  // their downhill axis and stranding already paid-for construction.
  if (field?.drainage?.version === 1 && field.drainage.routes?.length && validBearing(field.drainage.bearing)) return field.drainage.bearing;
  return generateSlopeBearing(field?.id);
}

export function slopeBearingLabel(bearing) {
  const labels = ['동쪽 →', '남동쪽 ↘', '남쪽 ↓', '남서쪽 ↙', '서쪽 ←', '북서쪽 ↖', '북쪽 ↑', '북동쪽 ↗'];
  return `${labels[Math.round(bearing / 45) % 8]} (${bearing}°)`;
}
