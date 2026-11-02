import React, { useRef } from 'react';

export default function FacilityAngleDial({ value, onChange }) {
  const dragging = useRef(false);
  const angle = ((Math.round(Number(value) || 0) % 360) + 360) % 360;
  const update = event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    if (Math.hypot(x, y) < 7) return;
    onChange((Math.round(Math.atan2(y, x) * 180 / Math.PI) + 360) % 360);
  };
  return <div className="facility-angle">
    <div className="facility-angle__dial" role="slider" tabIndex={0} aria-label="시설 방향" aria-valuemin={0} aria-valuemax={359} aria-valuenow={angle} aria-valuetext={`${angle}도`}
      style={{ '--facility-angle': `${angle}deg` }}
      onPointerDown={event => {
        if (event.button !== 0) return;
        event.preventDefault();
        dragging.current = true;
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event);
      }}
      onPointerMove={event => { if (dragging.current) update(event); }}
      onPointerUp={event => { if (dragging.current) update(event); dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
      onLostPointerCapture={() => { dragging.current = false; }}
      onKeyDown={event => {
        const delta = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
        if (delta === undefined && event.key !== 'Home') return;
        event.preventDefault();
        onChange(event.key === 'Home' ? 0 : (angle + (event.shiftKey ? delta * 10 : delta) + 360) % 360);
      }}>
      <span className="facility-angle__needle" aria-hidden="true" />
      <span className="facility-angle__pivot" aria-hidden="true" />
    </div>
    <span className="facility-angle__value">방향 <output>{angle}°</output></span>
  </div>;
}
