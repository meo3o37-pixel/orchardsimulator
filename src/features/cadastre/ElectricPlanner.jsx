import React, { useMemo, useRef, useState } from 'react';
import CadastreGround from './CadastreGround';
import CadastreDisplayControls from './CadastreDisplayControls';
import CadastreMapToolbar, { cadastreViewportEvents } from './CadastreMapToolbar';
import useCadastreViewport from './useCadastreViewport';
import { cadastreEditorTransform } from './cultivationZones';
import { polygonContainsPoint } from './cadastreData';
import { normalizeFacilitySites } from '../facility/facilityConstruction';
import FacilitySiteLayer from '../facility/FacilitySiteLayer';
import './ElectricPlanner.css';

const MAX_SPAN_M = 30; // 캐주얼 게임 규칙. 실제 시공 기준이 아니다.
const electricKeys = new Set(['wellFacility', 'evChargerStation', 'coldStorageMedium', 'coldStorageLarge', 'coldStorageXl', 'coldStorageXxl', 'coldStorageMax', 'frostFan', 'autoRefillSystem', 'irrigationControlSystem']);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) * 1000;
const center = site => ({ x: site.points.reduce((sum, point) => sum + point.x, 0) / site.points.length, y: site.points.reduce((sum, point) => sum + point.y, 0) / site.points.length });

export default function ElectricPlanner({ field, cadastre, onElectricPlanSave }) {
  const svg = useRef(null);
  const transform = useMemo(() => cadastreEditorTransform(cadastre.boundaryPoints), [cadastre.boundaryPoints]);
  const viewport = useCadastreViewport(svg, Boolean(transform), true);
  const allSites = normalizeFacilitySites(field.facilitySites);
  const sites = allSites.filter(site => electricKeys.has(site.facilityKey) && site.status === 'complete' && site.points?.length >= 3);
  const powerSite = allSites.find(site => site.facilityKey === 'farmPowerElectric' && site.status === 'complete');
  const saved = field.cadastreElectricPlan || { routes: [] };
  const [targetId, setTargetId] = useState('');
  const [start, setStart] = useState(null);
  const [poles, setPoles] = useState([]);
  const [placingPole, setPlacingPole] = useState(false);
  const [notice, setNotice] = useState('');
  const target = sites.find(site => site.id === targetId);
  const destination = target ? center(target) : null;
  const origin = powerSite ? center(powerSite) : start;
  const draft = origin && destination ? [origin, ...poles, destination] : [];
  const tooLong = draft.some((point, index) => index > 0 && distance(draft[index - 1], point) > MAX_SPAN_M);
  const points = list => list.map(point => { const p = transform.toSvg(point); return `${p.x},${p.y}`; }).join(' ');
  const clickMap = event => {
    const matrix = svg.current?.getScreenCTM(); if (!matrix) return;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const point = transform.toWorld(p);
    if (!polygonContainsPoint(cadastre.boundaryPoints, point)) return;
    if (placingPole && origin) setPoles(previous => [...previous, point]);
    else if (!powerSite) { setStart(point); setPoles([]); }
    setNotice('');
  };
  const save = () => {
    if (!field.owned || !field.landFacilities?.farmPowerElectric) return setNotice('먼저 농사용전기를 설치해 주세요.');
    if (!target || !origin) return setNotice('시설을 고르고 지도에서 전기 시작점을 찍어 주세요.');
    if (tooLong) return setNotice(`한 구간은 ${MAX_SPAN_M}m까지 이어집니다. 지도에서 전봇대를 추가해 주세요.`);
    const routes = [...(saved.routes || []).filter(route => route.targetId !== target.id), { targetId: target.id, targetName: target.name, points: draft, poles }];
    const result = onElectricPlanSave?.({ version: 1, routes });
    setNotice(result?.message || '설계를 저장하지 못했습니다.');
    if (result?.ok) { setStart(null); setPoles([]); setPlacingPole(false); }
  };
  const remove = id => { const result = onElectricPlanSave?.({ version: 1, routes: (saved.routes || []).filter(route => route.targetId !== id) }); setNotice(result?.message || '설계를 삭제하지 못했습니다.'); };
  return <section className="action-section cadastre-panel cadastre-editor electric-planner" aria-label="전기 설계">
    <h3>전기 설계</h3><p>전기를 쓸 시설을 고르세요. 선이 길면 지도에 전봇대를 놓으면 됩니다. 설계 저장은 시공이 아닙니다.</p>
    <CadastreDisplayControls />
    <div className="cadastre-layout"><div className="cadastre-map-card"><div className="cadastre-map-card__grid" aria-hidden="true" />
      <div className="cadastre-editor__map-heading"><strong>{field.name || cadastre.parcelNo}</strong><span>노란 선: 전선 · 원: 전봇대</span></div>
      <CadastreMapToolbar viewport={viewport} label="전기 설계 지도" />
      <svg ref={svg} className="cadastre-editor__canvas is-editing" viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)} onClick={clickMap} role="img" aria-label="전기 연결 지도">
        <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zoomPercent={viewport.zoomPercent} />
        <FacilitySiteLayer field={field} transform={transform} />
        {(saved.routes || []).map(route => <g key={route.targetId}><polyline points={points(route.points)} fill="none" stroke="#b47b24" strokeWidth="2" vectorEffect="non-scaling-stroke" />{(route.poles || []).map((pole, index) => <circle key={index} cx={transform.toSvg(pole).x} cy={transform.toSvg(pole).y} r=".45" fill="#9a6b2a" stroke="#fff" strokeWidth=".12" />)}</g>)}
        {draft.length > 1 && <polyline points={points(draft)} fill="none" stroke={tooLong ? '#c04e3e' : '#e9a93d'} strokeWidth="2.5" strokeDasharray="5 3" vectorEffect="non-scaling-stroke" />}
        {origin && <circle cx={transform.toSvg(origin).x} cy={transform.toSvg(origin).y} r=".65" fill="#e9a93d" />}
        {poles.map((pole, index) => <circle key={index} cx={transform.toSvg(pole).x} cy={transform.toSvg(pole).y} r=".45" fill="#9a6b2a" />)}
      </svg>
    </div><aside className="cadastre-editor__tools electric-planner__tools">
      <div className="cadastre-setting-card">
        <h4>연결할 시설</h4>
        <select aria-label="전기 연결 시설" value={targetId} onChange={event => { setTargetId(event.target.value); setNotice(''); }}><option value="">시설 선택</option>{sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}</select>
        {!sites.length && <p>지도에 배치된 전기 사용 시설이 없습니다.</p>}
        {!powerSite && <p>농사용전기 설비가 지도에 없으면 시작점을 직접 찍어 주세요.</p>}
      </div>
      <button type="button" aria-pressed={placingPole} disabled={!origin} onClick={() => setPlacingPole(value => !value)}>{placingPole ? '전봇대 배치 중 · 끝내기' : '전봇대 추가'}</button>
      {poles.length > 0 && <button type="button" onClick={() => setPoles(previous => previous.slice(0, -1))}>마지막 전봇대 취소</button>}
      <p>{draft.length > 1 ? `전선 ${draft.slice(1).reduce((sum, point, index) => sum + distance(draft[index], point), 0).toFixed(1)}m · 전봇대 ${poles.length}개${tooLong ? ' · 긴 구간에 전봇대 필요' : ''}` : powerSite ? '시설을 선택하면 전선을 미리 볼 수 있습니다.' : '시설을 선택하고 지도에서 시작점을 찍으세요.'}</p>
      <button type="button" className="cadastre-design-confirm" disabled={!target || !origin || tooLong} onClick={save}>전기 설계 확정</button>
      {notice && <p role="status">{notice}</p>}
      <h4>저장된 연결</h4>{(saved.routes || []).length ? (saved.routes || []).map(route => <div className="electric-planner__saved" key={route.targetId}><span>{route.targetName} · 전봇대 {(route.poles || []).length}개</span><button type="button" onClick={() => remove(route.targetId)}>삭제</button></div>) : <p>저장된 전선이 없습니다.</p>}
    </aside></div>
  </section>;
}
