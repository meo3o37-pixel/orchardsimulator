import { useCallback, useEffect, useRef, useState } from 'react';

const INITIAL_VIEW = { x: 0, y: 0, size: 100 };
const clampSize = (size) => Math.min(200, Math.max(12.5, size));

export default function useCadastreViewport(svgRef, enabled, canPan) {
  const [view, setView] = useState(INITIAL_VIEW);
  const viewRef = useRef(INITIAL_VIEW);
  const paintedView = useRef(INITIAL_VIEW);
  const pan = useRef(null);
  const touches = useRef(new Map());
  const pinch = useRef(null);
  const suppressClick = useRef(false);
  const frame = useRef(0);
  const settleTimer = useRef(0);
  const paintView = useCallback(() => {
    frame.current = 0;
    const next = viewRef.current;
    svgRef.current?.setAttribute('viewBox', `${next.x} ${next.y} ${next.size} ${next.size}`);
    paintedView.current = next;
  }, [svgRef]);
  const commitView = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    clearTimeout(settleTimer.current);
    paintView();
    setView(viewRef.current);
  }, [paintView]);
  const applyView = useCallback((next) => {
    viewRef.current = next;
    if (!frame.current) frame.current = requestAnimationFrame(paintView);
    clearTimeout(settleTimer.current);
    // Pointer gestures commit on release; wheel/toolbar changes settle after a short pause.
    if (!pan.current && !pinch.current) settleTimer.current = setTimeout(commitView, 100);
  }, [paintView, commitView]);
  useEffect(() => () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    clearTimeout(settleTimer.current);
  }, []);
  const screenPoint = useCallback((x, y) => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(x, y).matrixTransform(matrix.inverse());
    const painted = paintedView.current, current = viewRef.current;
    return { x: current.x + (point.x - painted.x) / painted.size * current.size, y: current.y + (point.y - painted.y) / painted.size * current.size };
  }, [svgRef]);
  const zoom = useCallback((factor, anchor = null) => {
    const current = viewRef.current;
    const size = clampSize(current.size / factor);
    const point = anchor || { x: current.x + current.size / 2, y: current.y + current.size / 2 };
    const ratio = size / current.size;
    applyView({ x: point.x - (point.x - current.x) * ratio, y: point.y - (point.y - current.y) * ratio, size });
  }, [applyView]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !enabled) return undefined;
    const wheel = (event) => {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 200 : 1);
      zoom(Math.exp(-Math.max(-300, Math.min(300, delta)) * 0.002), screenPoint(event.clientX, event.clientY));
    };
    svg.addEventListener('wheel', wheel, { passive: false });
    return () => svg.removeEventListener('wheel', wheel);
  }, [svgRef, enabled, screenPoint, zoom]);

  const onPointerDownCapture = (event) => {
    clearTimeout(settleTimer.current);
    if (!pinch.current && touches.current.size === 0) suppressClick.current = false;
    if (event.pointerType !== 'touch') return false;
    touches.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (touches.current.size !== 2) return false;
    const [a, b] = [...touches.current.values()];
    const anchor = screenPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
    if (!anchor) return false;
    pinch.current = { distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), size: viewRef.current.size, anchor };
    pan.current = null;
    suppressClick.current = true;
    for (const id of touches.current.keys()) svgRef.current.setPointerCapture(id);
    event.preventDefault(); event.stopPropagation();
    return true;
  };
  const onPointerMoveCapture = (event) => {
    if (touches.current.has(event.pointerId)) touches.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (!pinch.current || touches.current.size < 2) return;
    const [a, b] = [...touches.current.values()];
    const midpoint = screenPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
    if (!midpoint) return;
    const current = viewRef.current;
    const size = clampSize(pinch.current.size * pinch.current.distance / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)));
    applyView({
      x: pinch.current.anchor.x - (midpoint.x - current.x) / current.size * size,
      y: pinch.current.anchor.y - (midpoint.y - current.y) / current.size * size,
      size
    });
    event.preventDefault(); event.stopPropagation();
  };
  const onPointerDown = (event) => {
    if (!canPan || pinch.current || (event.button !== 0 && event.button !== 1)) return;
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return;
    suppressClick.current = false;
    pan.current = { id: event.pointerId, x: event.clientX, y: event.clientY, view: viewRef.current, unitsPerPixel: 1 / matrix.a };
    if (event.button === 1) event.preventDefault();
  };
  const onPointerMove = (event) => {
    const start = pan.current;
    if (!start || start.id !== event.pointerId || pinch.current) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < 3 && !suppressClick.current) return;
    suppressClick.current = true;
    svgRef.current.setPointerCapture(event.pointerId);
    applyView({ ...start.view, x: start.view.x - dx * start.unitsPerPixel, y: start.view.y - dy * start.unitsPerPixel });
  };
  const endPointer = (event) => {
    const wasMoving = Boolean(pinch.current || pan.current?.id === event.pointerId);
    touches.current.delete(event.pointerId);
    if (pinch.current) {
      pinch.current = null;
      pan.current = null;
    }
    if (pan.current?.id === event.pointerId) pan.current = null;
    if (wasMoving) commitView();
  };

  return {
    viewBox: `${view.x} ${view.y} ${view.size} ${view.size}`,
    zoomPercent: Math.round(10000 / view.size),
    zoomIn: () => zoom(1.25),
    zoomOut: () => zoom(0.8),
    reset: () => { pan.current = null; pinch.current = null; applyView(INITIAL_VIEW); },
    onPointerDownCapture,
    onPointerMoveCapture,
    onPointerDown,
    onPointerMove,
    endPointer,
    onClickCapture: (event) => {
      if (!suppressClick.current) return;
      suppressClick.current = false;
      event.preventDefault(); event.stopPropagation();
    }
  };
}
