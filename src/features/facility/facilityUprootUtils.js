export const fieldAgeRowsForUproot = (field, day, deps) =>
  deps
    .cropRowsByVarietyAndAge(field, day, deps.crops)
    .map((row) => {
      const ageYear = Math.max(1, Math.floor(Number(row?.ageYear) || 1));
      const trees = Math.max(0, Number(row?.trees) || 0);
      return {
        ageYear,
        ageKey: `${ageYear}`,
        trees
      };
    })
    .filter((row) => row.trees > 0)
    .sort((a, b) => a.ageYear - b.ageYear);

export const normalizeUprootPlanByAge = (planByAge = {}) =>
  Object.entries(planByAge || {}).reduce((acc, [ageKey, qty]) => {
    const normalizedAge = `${Math.max(1, Math.floor(Number(ageKey) || 1))}`;
    const normalizedQty = Math.max(0, Math.floor(Number(qty) || 0));
    if (normalizedQty <= 0) return acc;
    return {
      ...acc,
      [normalizedAge]: (acc[normalizedAge] || 0) + normalizedQty
    };
  }, {});

export const validateFacilityUprootPlan = (field, day, requiredTrees, planByAge = {}, deps) => {
  const need = Math.max(0, Math.floor(Number(requiredTrees) || 0));
  if (need <= 0) return { ok: true, planByAge: {} };
  const ageRows = fieldAgeRowsForUproot(field, day, deps);
  const availableByAge = ageRows.reduce((acc, row) => ({ ...acc, [row.ageKey]: row.trees }), {});
  const totalAvailable = ageRows.reduce((sum, row) => sum + row.trees, 0);
  if (totalAvailable < need) {
    return { ok: false, reason: `캐낼 수 있는 나무가 부족합니다. (필요 ${need}주 / 보유 ${totalAvailable}주)` };
  }
  const normalizedPlan = normalizeUprootPlanByAge(planByAge);
  const pickedTotal = Object.values(normalizedPlan).reduce((sum, qty) => sum + qty, 0);
  if (pickedTotal !== need) {
    return { ok: false, reason: `캐낼 나무 수를 정확히 선택해 주세요. (필요 ${need}주 / 선택 ${pickedTotal}주)` };
  }
  for (const [ageKey, qty] of Object.entries(normalizedPlan)) {
    const available = Math.max(0, Number(availableByAge?.[ageKey]) || 0);
    if (qty > available) {
      return { ok: false, reason: `${ageKey}년차는 최대 ${available}주까지 선택할 수 있습니다.` };
    }
  }
  return { ok: true, planByAge: normalizedPlan };
};

export const applyUprootPlanToField = (field, day, planByAge = {}, deps) => {
  const normalizedPlan = normalizeUprootPlanByAge(planByAge);
  const lots = deps.normalizePlantLotsForField(field).map((lot) => ({ ...lot }));
  const removedByAge = {};
  Object.entries(normalizedPlan).forEach(([ageKey, qty]) => {
    let remain = Math.max(0, Number(qty) || 0);
    for (let i = 0; i < lots.length && remain > 0; i += 1) {
      const lot = lots[i];
      const lotAge = `${Math.max(1, Math.floor(Number(deps.treeAgeFromDay(lot.plantedDay, day)) || 1))}`;
      if (lotAge !== ageKey) continue;
      const take = Math.min(Math.max(0, Number(lot.trees) || 0), remain);
      if (take <= 0) continue;
      lot.trees -= take;
      remain -= take;
      removedByAge[ageKey] = (removedByAge[ageKey] || 0) + take;
    }
  });
  const removedTotal = Object.values(removedByAge).reduce((sum, qty) => sum + qty, 0);
  const nextPlantLots = lots.filter((lot) => (Number(lot?.trees) || 0) > 0);
  const nextTrees = Math.max(0, (Number(field?.trees) || 0) - removedTotal);
  const nextDeadTrees = Math.max(0, Math.min(Number(field?.deadTrees) || 0, nextTrees));
  const cleared = nextTrees <= 0;
  return {
    removedByAge,
    removedTotal,
    field: {
      ...field,
      trees: nextTrees,
      deadTrees: nextDeadTrees,
      plantLots: cleared ? [] : nextPlantLots,
      cropId: cleared ? null : field.cropId,
      plantedDay: cleared ? null : (nextPlantLots[0]?.plantedDay ?? field.plantedDay),
      lastHarvestYear: cleared ? null : field.lastHarvestYear,
      growth: cleared ? 0 : field.growth,
      fruitLoadReductionByAge: cleared ? {} : (field.fruitLoadReductionByAge || {}),
      ageTaskWorkedTreesByTask: cleared ? {} : (field.ageTaskWorkedTreesByTask || {}),
      note: cleared ? '미식재' : field.note
    }
  };
};
