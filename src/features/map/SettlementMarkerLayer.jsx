import React from 'react';
import useSettlementMarkerEditor from './useSettlementMarkerEditor';

export default function SettlementMarkerLayer({
  coordRows = [],
  markerRows = [],
  showCoordPanel = true,
  mapCoordPanelCollapsed = false,
  onToggleCoordPanel,
  dragRefsByKey = {},
  normalizePositionByStateKey = {},
  openTownMarkerDestination,
  renderTownMarkerVehicleBadge,
  game,
  mapImageWrapRef,
  markerPosFromPointerEvent,
  setGame,
  townMarkerCoordsLocked,
  townMarkerPositionEditMode,
}) {
  const bindEditor = useSettlementMarkerEditor({
    game,
    mapImageWrapRef,
    markerPosFromPointerEvent,
    setGame,
    townMarkerCoordsLocked,
    townMarkerPositionEditMode,
  });

  return (
    <>
      {showCoordPanel ? (
        <div className="map-coord-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: mapCoordPanelCollapsed ? 0 : 6 }}>
            <div className="map-coord-panel__title" style={{ marginBottom: 0 }}>마커 좌표</div>
            <button
              type="button"
              className="button button--ghost button--compact"
              onClick={onToggleCoordPanel}
              aria-pressed={mapCoordPanelCollapsed}
            >
              {mapCoordPanelCollapsed ? '펼치기' : '접기'}
            </button>
          </div>
          {!mapCoordPanelCollapsed ? (
            <>
              {coordRows.map((row) => (
                <div key={`coord-${row.key}`} className="map-coord-panel__row">
                  {(() => {
                    const safePos = row?.pos && Number.isFinite(row.pos.x) && Number.isFinite(row.pos.y)
                      ? row.pos
                      : { x: 50, y: 50 };
                    return (
                      <>
                  <span>{row.label}</span>
                  <strong>{`X ${safePos.x.toFixed(1)} / Y ${safePos.y.toFixed(1)}`}</strong>
                      </>
                    );
                  })()}
                </div>
              ))}
            </>
          ) : null}
        </div>
      ) : null}
      {markerRows.filter((row) => !row.hidden).map((row) => {
        const dragRef = dragRefsByKey[row.key];
        const normalizePosition = normalizePositionByStateKey[row.stateKey];
        if (!dragRef || typeof normalizePosition !== 'function') return null;
        return (
          <button
            key={row.key}
            type="button"
            className={`map-marker ${row.className}`.trim()}
            style={{
              left: `${(Number.isFinite(row?.pos?.x) ? row.pos.x : 50)}%`,
              top: `${(Number.isFinite(row?.pos?.y) ? row.pos.y : 50)}%`,
            }}
            title={row.label}
            aria-label={`${row.label} 열기`}
            {...bindEditor(row, dragRef, normalizePosition, openTownMarkerDestination)}
          >
            <span className="map-marker__pin" />
            <span className="map-marker__label">{row.label}</span>
            {renderTownMarkerVehicleBadge(row.key)}
          </button>
        );
      })}
    </>
  );
}
