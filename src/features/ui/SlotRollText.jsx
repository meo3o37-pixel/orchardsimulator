import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_DURATION_MS = 560;

export default function SlotRollText({
  value,
  className = '',
  durationMs = DEFAULT_DURATION_MS,
  ariaLabel
}) {
  const nextValue = String(value ?? '');
  const [currentValue, setCurrentValue] = useState(nextValue);
  const [prevValue, setPrevValue] = useState('');
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);
  const rafRef = useRef(null);
  const rafRef2 = useRef(null);

  useEffect(() => {
    if (nextValue === currentValue) return undefined;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (rafRef2.current) {
      cancelAnimationFrame(rafRef2.current);
      rafRef2.current = null;
    }
    setPrevValue(currentValue);
    setCurrentValue(nextValue);
    setRunning(false);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      rafRef2.current = requestAnimationFrame(() => {
        rafRef2.current = null;
        setRunning(true);
        timerRef.current = setTimeout(() => {
          setPrevValue('');
          setRunning(false);
          timerRef.current = null;
        }, Math.max(100, Number(durationMs) || DEFAULT_DURATION_MS));
      });
    });
    return undefined;
  }, [nextValue, currentValue, durationMs]);

  useEffect(() => () => {
    if (!timerRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (rafRef2.current) {
      cancelAnimationFrame(rafRef2.current);
      rafRef2.current = null;
    }
  }, []);

  return (
    <span
      className={`slot-roll ${running ? 'is-running' : ''} ${className}`.trim()}
      style={{ '--slot-roll-duration': `${Math.max(100, Number(durationMs) || DEFAULT_DURATION_MS)}ms` }}
      aria-label={ariaLabel}
    >
      <span className="slot-roll__ghost" aria-hidden="true">{currentValue}</span>
      {prevValue ? <span className="slot-roll__layer slot-roll__layer--prev" aria-hidden="true">{prevValue}</span> : null}
      <span className="slot-roll__layer slot-roll__layer--next">{currentValue}</span>
    </span>
  );
}
