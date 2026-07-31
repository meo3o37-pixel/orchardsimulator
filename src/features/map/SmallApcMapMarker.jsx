import React from 'react';

export default function SmallApcMapMarker({
  hidden = false,
  markerPos,
  dragRef,
  townMarkerCoordsLocked,
  townMarkerPositionEditMode,
  openTownMarkerDestination,
  game,
  mapImageWrapRef,
  markerPosFromPointerEvent,
  normalizeSmallApcMarkerPos,
  setGame,
  mapMarkerName,
  renderTownMarkerVehicleBadge,
}) {
  if (hidden) return null;

  return (
    <button
      type="button"
      className="map-marker map-marker--small-apc"
      style={{ left: `${markerPos.x}%`, top: `${markerPos.y}%` }}
      data-dragging={dragRef.current.dragging ? 'true' : 'false'}
      onClick={() => {
        if (townMarkerCoordsLocked || !townMarkerPositionEditMode) openTownMarkerDestination('smallApc');
      }}
      onPointerDown={(event) => {
        if (townMarkerCoordsLocked || !game) return;
        event.preventDefault();
        event.stopPropagation();
        dragRef.current = {
          dragging: true,
          moved: false,
          pointerId: event.pointerId,
          startClientX: Number(event.clientX) || 0,
          startClientY: Number(event.clientY) || 0
        };
        event.currentTarget?.setPointerCapture?.(event.pointerId);
        const wrapEl = mapImageWrapRef.current;
        if (!wrapEl) return;
        const nextPos = markerPosFromPointerEvent(event, wrapEl);
        setGame((prev) => (
          prev
            ? { ...prev, smallApcMarkerPos: nextPos, townMarkerCoordsDirty: true }
            : prev
        ));
      }}
      onPointerMove={(event) => {
        const dragState = dragRef.current;
        if (!dragState.dragging || dragState.pointerId !== event.pointerId) return;
        event.preventDefault();
        const dx = (Number(event.clientX) || 0) - dragState.startClientX;
        const dy = (Number(event.clientY) || 0) - dragState.startClientY;
        if (!dragState.moved && Math.hypot(dx, dy) >= 4) {
          dragState.moved = true;
        }
        const wrapEl = mapImageWrapRef.current;
        if (!wrapEl) return;
        const nextPos = markerPosFromPointerEvent(event, wrapEl);
        setGame((prev) => {
          if (!prev) return prev;
          const prevPos = normalizeSmallApcMarkerPos(prev.smallApcMarkerPos);
          if (Math.abs(prevPos.x - nextPos.x) < 0.01 && Math.abs(prevPos.y - nextPos.y) < 0.01) return prev;
          return { ...prev, smallApcMarkerPos: nextPos, townMarkerCoordsDirty: true };
        });
      }}
      onPointerUp={(event) => {
        const dragState = dragRef.current;
        if (!dragState.dragging || dragState.pointerId !== event.pointerId) return;
        event.preventDefault();
        event.currentTarget?.releasePointerCapture?.(event.pointerId);
        const moved = dragState.moved;
        dragRef.current = {
          dragging: false,
          moved: false,
          pointerId: null,
          startClientX: 0,
          startClientY: 0
        };
        if (!moved && !townMarkerPositionEditMode) {
          openTownMarkerDestination('smallApc');
        }
      }}
      onPointerCancel={(event) => {
        const dragState = dragRef.current;
        if (!dragState.dragging || dragState.pointerId !== event.pointerId) return;
        event.preventDefault();
        event.currentTarget?.releasePointerCapture?.(event.pointerId);
        dragRef.current = {
          dragging: false,
          moved: false,
          pointerId: null,
          startClientX: 0,
          startClientY: 0
        };
      }}
      title={mapMarkerName}
      aria-label={`${mapMarkerName} 열기`}
    >
      <span className="map-marker__pin" />
      <span className="map-marker__label">{mapMarkerName}</span>
      {renderTownMarkerVehicleBadge('smallApc')}
    </button>
  );
}
