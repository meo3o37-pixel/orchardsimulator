export const resolveSettlementTravelMarkerPointById = (markerId, markerList = []) => {
  const markers = Array.isArray(markerList) ? markerList : [];
  const villages = markers.filter((marker) => String(marker?.type || 'village') !== 'city');
  if (!villages.length) return null;
  const wantedId = String(markerId || '');
  const target = wantedId
    ? markers.find((marker) => String(marker?.id || '') === wantedId)
    : null;
  const picked = target || villages[0];
  if (!picked) return null;
  return {
    x: Number(picked.x) || 0,
    y: Number(picked.y) || 0,
  };
};

export const resolveSettlementMoveInitialCenter = ({
  locationContext,
  townCurrentMarkerId,
  currentFieldIndex,
  fields,
  markerList,
  resolveFieldPointByIndex,
  fallbackCenter,
} = {}) => {
  const nextLocationContext = String(locationContext || 'field') === 'town' ? 'town' : 'field';
  if (nextLocationContext === 'town') {
    const townPoint = resolveSettlementTravelMarkerPointById(townCurrentMarkerId, markerList);
    if (townPoint) return townPoint;
  }
  const fieldPoint = resolveFieldPointByIndex?.(currentFieldIndex, fields);
  if (fieldPoint) return fieldPoint;
  return fallbackCenter;
};

export const fieldToSettlementDistanceKm = ({
  fieldIndex,
  markerId,
  fields,
  markerList,
  resolveFieldPointByIndex,
  distanceKmBetweenMapPoints,
  normalizeDistanceKm,
  fallbackDistanceKm = 0,
} = {}) => {
  const fieldPoint = resolveFieldPointByIndex?.(fieldIndex, fields);
  const townPoint = resolveSettlementTravelMarkerPointById(markerId, markerList);
  return normalizeDistanceKm?.(
    distanceKmBetweenMapPoints?.(fieldPoint, townPoint),
    fallbackDistanceKm,
  ) ?? fallbackDistanceKm;
};

export const settlementToFieldDistanceKm = ({
  markerId,
  fieldIndex,
  fields,
  markerList,
  resolveFieldPointByIndex,
  distanceKmBetweenMapPoints,
  normalizeDistanceKm,
  fallbackDistanceKm = 0,
} = {}) => {
  const fieldPoint = resolveFieldPointByIndex?.(fieldIndex, fields);
  const townPoint = resolveSettlementTravelMarkerPointById(markerId, markerList);
  return normalizeDistanceKm?.(
    distanceKmBetweenMapPoints?.(townPoint, fieldPoint),
    fallbackDistanceKm,
  ) ?? fallbackDistanceKm;
};

export const settlementToSettlementDistanceKm = ({
  fromMarkerId,
  toMarkerId,
  markerList,
  distanceKmBetweenMapPoints,
  normalizeDistanceKm,
  fallbackDistanceKm = 0,
} = {}) => {
  const fromPoint = resolveSettlementTravelMarkerPointById(fromMarkerId, markerList);
  const toPoint = resolveSettlementTravelMarkerPointById(toMarkerId, markerList);
  return normalizeDistanceKm?.(
    distanceKmBetweenMapPoints?.(fromPoint, toPoint),
    fallbackDistanceKm,
  ) ?? fallbackDistanceKm;
};

export const fieldToFieldDistanceKm = ({
  fromFieldIndex,
  toFieldIndex,
  fields,
  resolveFieldPointByIndex,
  distanceKmBetweenMapPoints,
  normalizeDistanceKm,
} = {}) => {
  const fromPoint = resolveFieldPointByIndex?.(fromFieldIndex, fields);
  const toPoint = resolveFieldPointByIndex?.(toFieldIndex, fields);
  return normalizeDistanceKm?.(distanceKmBetweenMapPoints?.(fromPoint, toPoint)) ?? 0;
};
