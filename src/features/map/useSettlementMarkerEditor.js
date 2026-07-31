import { useCallback } from 'react';
import { markerPosFromPointerEvent as defaultMarkerPosFromPointerEvent } from './settlementMarkerPositions';

export const createSettlementMarkerDragState = () => ({
  dragging: false,
  moved: false,
  pointerId: null,
  startClientX: 0,
  startClientY: 0,
});

export default function useSettlementMarkerEditor({
  game,
  mapImageWrapRef,
  markerPosFromPointerEvent = defaultMarkerPosFromPointerEvent,
  setGame,
  townMarkerCoordsLocked,
  townMarkerPositionEditMode,
}) {
  return useCallback((row, dragRef, normalizePosition, openTownMarkerDestination) => {
    const isLocked = townMarkerCoordsLocked || !row?.draggable;
    const allowDirectDrag = Boolean(row?.directDrag);
    const dragEnabled = !isLocked && (townMarkerPositionEditMode || allowDirectDrag);
    return {
      'data-dragging': dragRef.current.dragging ? 'true' : 'false',
      onClick: () => {
        if (isLocked || (!townMarkerPositionEditMode && !allowDirectDrag)) {
          openTownMarkerDestination(row.key);
        }
      },
      onPointerDown: (event) => {
        if (!dragEnabled || !game) {
          if (!row?.draggable) {
            event.preventDefault();
            event.stopPropagation();
          }
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        dragRef.current = {
          dragging: true,
          moved: false,
          pointerId: event.pointerId,
          startClientX: Number(event.clientX) || 0,
          startClientY: Number(event.clientY) || 0,
        };
        event.currentTarget?.setPointerCapture?.(event.pointerId);
        const wrapEl = mapImageWrapRef.current;
        if (!wrapEl) return;
        const nextPos = markerPosFromPointerEvent(event, wrapEl);
        setGame((prev) => (
          prev
            ? {
                ...prev,
                [row.stateKey]: nextPos,
                townMarkerCoordsDirty: true,
              }
            : prev
        ));
      },
      onPointerMove: (event) => {
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
          const prevPos = normalizePosition(prev[row.stateKey]);
          if (Math.abs(prevPos.x - nextPos.x) < 0.01 && Math.abs(prevPos.y - nextPos.y) < 0.01) return prev;
          return {
            ...prev,
            [row.stateKey]: nextPos,
            townMarkerCoordsDirty: true,
          };
        });
      },
      onPointerUp: (event) => {
        const dragState = dragRef.current;
        if (!dragState.dragging || dragState.pointerId !== event.pointerId) return;
        event.preventDefault();
        event.currentTarget?.releasePointerCapture?.(event.pointerId);
        const moved = dragState.moved;
        dragRef.current = createSettlementMarkerDragState();
        if (!moved && !townMarkerPositionEditMode) {
          openTownMarkerDestination(row.key);
        }
      },
      onPointerCancel: (event) => {
        const dragState = dragRef.current;
        if (!dragState.dragging || dragState.pointerId !== event.pointerId) return;
        event.preventDefault();
        event.currentTarget?.releasePointerCapture?.(event.pointerId);
        dragRef.current = createSettlementMarkerDragState();
      },
    };
  }, [
    game,
    mapImageWrapRef,
    markerPosFromPointerEvent,
    setGame,
    townMarkerCoordsLocked,
    townMarkerPositionEditMode,
  ]);
}
