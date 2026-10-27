import React, { useRef } from 'react';

export default function PlantingAngleDial({ value, disabled = false, onChange }) {
  const dragging = useRef(false);
  const angle = Number.isFinite(Number(value)) ? Math.min(180, Math.max(-180, Number(value))) : 0;
  const updateFromPointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    if (Math.hypot(x, y) < 8) return;
    const next = Math.round(Math.atan2(y, x) * 180 / Math.PI);
    if (next !== angle) onChange(next);
  };

  return <div className="cadastre-angle-control">
    <div className="cadastre-angle-dial" role="slider" tabIndex={disabled ? -1 : 0}
      aria-label="식재 각도 다이얼" aria-valuemin={-180} aria-valuemax={180} aria-valuenow={angle} aria-valuetext={`${angle}도`} aria-disabled={disabled}
      title="식재 각도" style={{ '--planting-angle': `${angle}deg` }}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0) return;
        event.preventDefault(); event.stopPropagation();
        event.currentTarget.focus();
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        updateFromPointer(event);
      }}
      onPointerMove={(event) => { if (dragging.current && !disabled) updateFromPointer(event); }}
      onPointerUp={(event) => {
        if (dragging.current && !disabled) updateFromPointer(event);
        dragging.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { dragging.current = false; }}
      onLostPointerCapture={() => { dragging.current = false; }}
      onKeyDown={(event) => {
        if (disabled) return;
        const step = event.shiftKey ? 10 : 1;
        const changes = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: 10, PageDown: -10 };
        if (!(event.key in changes) && event.key !== 'Home' && event.key !== 'End') return;
        event.preventDefault(); event.stopPropagation();
        onChange(event.key === 'Home' ? 0 : event.key === 'End' ? 180 : Math.min(180, Math.max(-180, angle + changes[event.key])));
      }}>
      <span className="cadastre-angle-dial__needle" aria-hidden="true" />
      <span className="cadastre-angle-dial__pivot" aria-hidden="true" />
    </div>
    <div className="cadastre-angle-control__value"><span>식재 방향</span><output>{angle}°</output></div>
  </div>;
}
