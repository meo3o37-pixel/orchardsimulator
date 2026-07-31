import { clamp, toDate } from './common';

export const treeAgeFromDay = (plantedDay, day) => {
  if (!plantedDay) return 0;
  const plantedYear = toDate(plantedDay).getFullYear();
  const currentYear = toDate(day).getFullYear();
  return Math.max(1, (currentYear - plantedYear) + 1);
};

export const treeAgeYear = (field, day) => treeAgeFromDay(field?.plantedDay, day);
export const liveTreeCount = (field) =>
  Math.max(0, (Number(field?.trees) || 0) - (Number(field?.deadTrees) || 0));

export const normalizePlantLotsForField = (field) => {
  const raw = Array.isArray(field?.plantLots) ? field.plantLots : [];
  const legacyCropId = field?.cropId || null;
  let lots = raw
    .map((lot, idx) => ({
      id: lot?.id || `lot-${field?.id || 'field'}-${idx}`,
      cropId: lot?.cropId || field?.cropId || null,
      plantedDay: Number(lot?.plantedDay) || Number(field?.plantedDay) || 1,
      trees: Math.max(0, Number(lot?.trees) || 0)
    }))
    .filter((lot) => lot.cropId && lot.trees > 0)
  if (!lots.length && legacyCropId && (Number(field?.trees) || 0) > 0) {
    lots = [
      {
        id: `legacy-${field.id || 'field'}`,
        cropId: legacyCropId,
        plantedDay: Number(field?.plantedDay) || 1,
        trees: Math.max(0, Number(field?.trees) || 0)
      }
    ];
  }
  return lots.sort((a, b) => a.plantedDay - b.plantedDay);
};

export const distributeDeadAcrossLots = (lots, totalDead) => {
  if (!lots.length) return [];
  const lotTotalTrees = lots.reduce((sum, lot) => sum + lot.trees, 0);
  if (lotTotalTrees <= 0) return lots.map((lot) => ({ ...lot, deadTrees: 0, aliveTrees: 0 }));
  let remainDead = Math.max(0, Math.min(Number(totalDead) || 0, lotTotalTrees));
  const withDead = lots.map((lot) => {
    const share = Math.min(lot.trees, Math.floor((remainDead * lot.trees) / lotTotalTrees));
    return { ...lot, deadTrees: share };
  });
  remainDead -= withDead.reduce((sum, lot) => sum + lot.deadTrees, 0);
  let cursor = 0;
  while (remainDead > 0 && withDead.length) {
    const target = withDead[cursor % withDead.length];
    if (target.deadTrees < target.trees) {
      target.deadTrees += 1;
      remainDead -= 1;
    }
    cursor += 1;
    if (cursor > withDead.length * 3 && remainDead > 0) break;
  }
  return withDead.map((lot) => ({
    ...lot,
    deadTrees: Math.max(0, Math.min(lot.deadTrees, lot.trees)),
    aliveTrees: Math.max(0, lot.trees - lot.deadTrees)
  }));
};

export const shrinkOneTreeFromLots = (lots) => {
  const next = normalizePlantLotsForField({ plantLots: lots, cropId: null, plantedDay: null, trees: 0 });
  const targetIdx = next.findIndex((lot) => lot.trees > 0);
  if (targetIdx < 0) return next;
  next[targetIdx] = { ...next[targetIdx], trees: Math.max(0, next[targetIdx].trees - 1) };
  return next.filter((lot) => lot.trees > 0);
};

export const cropRowsByVarietyAndAge = (field, day, crops) => {
  const lots = normalizePlantLotsForField(field);
  const lotsWithDead = distributeDeadAcrossLots(lots, Number(field?.deadTrees) || 0);
  const grouped = {};
  lotsWithDead.forEach((lot) => {
    const ageYear = treeAgeFromDay(lot.plantedDay, day);
    const key = `${String(lot.cropId || '')}:${ageYear}`;
    if (!grouped[key]) {
      grouped[key] = {
        key,
        cropId: lot.cropId,
        cropName: crops?.[lot.cropId]?.name || '작물',
        ageYear,
        trees: 0,
        aliveTrees: 0,
        deadTrees: 0
      };
    }
    grouped[key].trees += lot.trees;
    grouped[key].aliveTrees += lot.aliveTrees;
    grouped[key].deadTrees += lot.deadTrees;
  });
  return Object.values(grouped).sort((a, b) => a.ageYear - b.ageYear);
};

export const maturityYieldRate = (growth) => {
  const g = clamp(Number(growth) || 0, 0, 100);
  if (g < 90) return 0;
  if (g >= 100) return 1;
  return 0.75 + ((g - 90) / 10) * 0.25;
};
