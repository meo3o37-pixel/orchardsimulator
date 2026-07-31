import React from 'react';

export default function TownMarkerVehicleBadge({ markerKey, parkedKeySet }) {
  const safeMarkerKey = String(markerKey || '');
  if (!parkedKeySet?.has(safeMarkerKey)) return null;
  return <span className="map-marker__vehicle-badge" aria-hidden="true">🚗</span>;
}
