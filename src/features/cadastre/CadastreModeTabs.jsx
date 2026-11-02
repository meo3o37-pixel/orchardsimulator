import React, { useLayoutEffect, useRef, useState } from 'react';
import { Fence, Trees, Warehouse } from 'lucide-react';
import './CadastreModeTabs.css';

const TABS = [
  { key: 'farm', Icon: Trees, label: '재배구역·식재 설계' },
  { key: 'cultivation-facility', Icon: Fence, label: '재배시설 설계' },
  { key: 'facility', Icon: Warehouse, label: '일반시설 설계' }
];
const FACILITY_MODES = ['parking', 'buildings', 'electric'];
const CULTIVATION_FACILITY_MODES = ['trellis', 'irrigation', 'drainage', 'pipes'];
export default function CadastreModeTabs({ mode, onChange }) {
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState(null);
  useLayoutEffect(() => {
    const nav = navRef.current;
    const measure = () => {
      const button = nav?.querySelector('[aria-pressed="true"]');
      if (!button) return;
      const next = { x: button.offsetLeft, y: button.offsetTop, width: button.offsetWidth, height: button.offsetHeight };
      setIndicator(prev => prev && Object.keys(next).every(key => prev[key] === next[key]) ? prev : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    nav.querySelectorAll('button').forEach(button => observer.observe(button));
    return () => observer.disconnect();
  }, [mode]);
  return <nav ref={navRef} className="cadastre-mode-tabs cadastre-work-tabs" aria-label="지적도 작업">
    {indicator && <span className="cadastre-work-tabs__indicator" aria-hidden="true" style={{ width: indicator.width, height: indicator.height, transform: `translate(${indicator.x}px, ${indicator.y}px)` }} />}
    {TABS.map(({ key, Icon, label, accessible, badge }) => <button key={key} className="cadastre-work-tabs__button" type="button" aria-label={accessible || label} aria-pressed={key === 'facility' ? FACILITY_MODES.includes(mode) : key === 'cultivation-facility' ? CULTIVATION_FACILITY_MODES.includes(mode) : mode === key} onClick={() => onChange(key)}>
      <span className="cadastre-work-tabs__icon" aria-hidden="true"><Icon size={19} strokeWidth={1.8} /></span>
      <span className="cadastre-work-tabs__label">{label}</span>
      {badge && <small className="cadastre-work-tabs__badge" aria-hidden="true">{badge}</small>}
    </button>)}
  </nav>;
}
