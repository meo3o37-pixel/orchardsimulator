export const fieldFacilityOccupiedPy = (
  field,
  { facilityOccupyPy = {}, fieldFacilityCountOf = () => 0 } = {}
) =>
  Object.entries(facilityOccupyPy).reduce(
    (sum, [key, py]) => sum + (fieldFacilityCountOf(field, key) * py),
    0
  );

export const fieldUsablePy = (
  field,
  deps = {}
) => Math.max(0, (Number(field?.py) || 0) - fieldFacilityOccupiedPy(field, deps));

export const fieldMaxTreeCapacity = (field, deps = {}) =>
  Math.max(0, Math.floor(fieldUsablePy(field, deps)));

export const fieldPlantableTreeCapacityByTrellis = (
  field,
  {
    trellisFacilityKey = '',
    fieldFacilityCountOf = () => 0,
    ...deps
  } = {}
) =>
  Math.max(
    0,
    Math.min(
      fieldMaxTreeCapacity(field, deps),
      Math.max(0, Math.floor(fieldFacilityCountOf(field, trellisFacilityKey)))
    )
  );

export const fieldMaxTreeCapacityByOccupiedPy = (py, occupiedPy) =>
  Math.max(0, Math.floor(Math.max(0, (Number(py) || 0) - Math.max(0, Number(occupiedPy) || 0))));

export const facilityInstallRequiredUprootTrees = (
  field,
  facilityKey,
  deps = {}
) => {
  const needPy = Math.max(0, Number(deps?.facilityOccupyPy?.[facilityKey]) || 0);
  if (needPy <= 0) return 0;
  const nextOccupiedPy = fieldFacilityOccupiedPy(field, deps) + needPy;
  const nextMaxTrees = fieldMaxTreeCapacityByOccupiedPy(field?.py, nextOccupiedPy);
  const currentTrees = Math.max(0, Number(field?.trees) || 0);
  return Math.max(0, currentTrees - nextMaxTrees);
};

export const applyTrellisAutoUprootForFacilityInstall = (
  field,
  removedTreesRaw = 0,
  nextMaxTreesRaw = 0,
  {
    trellisFacilityKey = '',
    irrigationFacilityKeys = [],
    fieldFacilityCountOf = () => 0
  } = {}
) => {
  const installedTrellis = Math.max(0, Math.floor(fieldFacilityCountOf(field, trellisFacilityKey)));
  const removedTrees = Math.max(0, Math.floor(Number(removedTreesRaw) || 0));
  const nextMaxTrees = Math.max(0, Math.floor(Number(nextMaxTreesRaw) || 0));
  const removedByTree = Math.min(installedTrellis, removedTrees);
  const afterTreeLinkedRemoval = Math.max(0, installedTrellis - removedByTree);
  const removedByCapacity = Math.max(0, afterTreeLinkedRemoval - nextMaxTrees);
  const nextInstalledTrellis = Math.max(0, afterTreeLinkedRemoval - removedByCapacity);
  const removedTotal = Math.max(0, removedByTree + removedByCapacity);

  if (removedTotal <= 0) {
    return {
      field,
      removedByTree: 0,
      removedByCapacity: 0,
      removedTotal: 0,
      nextInstalledTrellis: installedTrellis,
      irrigationRemovedByKey: {}
    };
  }

  const nextLandFacilityCounts = { ...(field?.landFacilityCounts || {}) };
  nextLandFacilityCounts[trellisFacilityKey] = nextInstalledTrellis;
  const irrigationRemovedByKey = {};
  irrigationFacilityKeys.forEach((facilityKey) => {
    const installed = Math.max(0, Math.floor(fieldFacilityCountOf(field, facilityKey)));
    const nextInstalled = Math.max(0, installed - removedTotal);
    const removed = Math.max(0, installed - nextInstalled);
    if (removed > 0) irrigationRemovedByKey[facilityKey] = removed;
    nextLandFacilityCounts[facilityKey] = nextInstalled;
  });
  const nextLandFacilities = { ...(field?.landFacilities || {}) };
  if (nextInstalledTrellis <= 0) delete nextLandFacilities[trellisFacilityKey];
  irrigationFacilityKeys.forEach((facilityKey) => {
    if ((Number(nextLandFacilityCounts?.[facilityKey]) || 0) <= 0) delete nextLandFacilities[facilityKey];
  });

  return {
    field: {
      ...field,
      landFacilityCounts: nextLandFacilityCounts,
      landFacilities: nextLandFacilities
    },
    removedByTree,
    removedByCapacity,
    removedTotal,
    nextInstalledTrellis,
    irrigationRemovedByKey
  };
};
