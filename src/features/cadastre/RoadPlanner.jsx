import React, { useMemo, useRef, useState } from 'react';
import CadastreGround from './CadastreGround';
import CadastreDisplayControls from './CadastreDisplayControls';
import CadastreMapToolbar, { cadastreViewportEvents } from './CadastreMapToolbar';
import useCadastreViewport from './useCadastreViewport';
import { cadastreEditorTransform } from './cultivationZones';
import { polygonContainsPoint } from './cadastreData';
import { connectedRoadRoutes, nearestBoundaryPoint, roadPlanError, roadTargets } from './roadPlan';

export default function RoadPlanner({ selectedField: field, cadastre, zones = [], onRoadPlanSave }) {
  const svg = useRef(null);
  const transform = useMemo(() => cadastreEditorTransform(cadastre.boundaryPoints), [cadastre.boundaryPoints]);
  const viewport = useCadastreViewport(svg, Boolean(transform), true);
  const saved = field.cadastreRoadPlan || { version: 1, entrance: null, routes: [] };
  const targets = roadTargets(field, zones);
  const [entranceDraft, setEntranceDraft] = useState(null);
  const [startId, setStartId] = useState('entrance');
  const [targetId, setTargetId] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [placingEntrance, setPlacingEntrance] = useState(false);
  const [placingWaypoint, setPlacingWaypoint] = useState(false);
  const [notice, setNotice] = useState('');
  const entrance = entranceDraft || saved.entrance;
  const start = startId === 'entrance' ? entrance : targets.find(item => item.id === startId)?.point;
  const target = targets.find(item => item.id === targetId);
  const draft = start && target ? [start, ...waypoints, target.point] : [];
  const points = values => values.map(point => { const p = transform.toSvg(point); return `${p.x},${p.y}`; }).join(' ');
  const choosePoint = event => {
    if (!placingEntrance && !placingWaypoint) return;
    const matrix = svg.current?.getScreenCTM(); if (!matrix) return;
    const point = transform.toWorld(new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()));
    if (placingEntrance) { setEntranceDraft(nearestBoundaryPoint(cadastre.boundaryPoints, point)); setWaypoints([]); setPlacingEntrance(false); }
    else if (polygonContainsPoint(cadastre.boundaryPoints, point)) setWaypoints(previous => [...previous, point]);
    setNotice('');
  };
  const save = () => {
    if (!target || !start || !entrance || startId === targetId) return;
    const id = [startId, targetId].sort().join('|');
    const routes = [...(saved.routes || []).filter(route => route.id !== id), { id, startId, endId: targetId, name: `${startId === 'entrance' ? '토지 진입점' : targets.find(item => item.id === startId)?.name} → ${target.name}`, points: draft }];
    const plan = { version: 1, entrance, routes };
    const error = roadPlanError(plan, cadastre.boundaryPoints, targets);
    if (error) { setNotice(error); return; }
    const result = onRoadPlanSave?.(plan);
    setNotice(result?.message || '도로 설계안을 저장하지 못했습니다.');
    if (result?.ok) { setEntranceDraft(null); setWaypoints([]); setPlacingWaypoint(false); }
  };
  const remove = id => {
    const routes = connectedRoadRoutes(saved.routes.filter(route => route.id !== id));
    const result = onRoadPlanSave?.({ ...saved, routes });
    setNotice(result?.ok && routes.length < saved.routes.length - 1 ? '연결이 끊긴 도로도 함께 삭제했습니다.' : result?.message || '도로 설계안을 변경하지 못했습니다.');
  };
  return <section className="action-section cadastre-panel cadastre-editor road-planner" aria-label="도로 설계">
    <h3>도로 설계</h3>
    <p>토지 진입점부터 건물·재배구역·노지 시설을 연결하고, 건물 사이도 이어 주세요. 모든 경로가 진입점에 연결되어야 저장됩니다. 저장한 선은 아직 시공된 도로가 아닙니다.</p>
    <CadastreDisplayControls />
    <div className="cadastre-layout"><div className="cadastre-map-card"><div className="cadastre-map-card__grid" aria-hidden="true" />
      <div className="cadastre-editor__map-heading"><strong>{field.name || cadastre.parcelNo}</strong><span>갈색 선: 저장된 도로 · 점선: 미리보기</span></div>
      <CadastreMapToolbar viewport={viewport} label="도로 설계 지도" />
      <svg ref={svg} className="cadastre-editor__canvas is-pannable" viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)} onClick={choosePoint} role="img" aria-label="도로 연결 지도">
        <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent} />
        {(saved.routes || []).filter(route => Array.isArray(route.points)).map(route => <polyline key={route.id} points={points(route.points)} fill="none" stroke="#8b6748" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}
        {draft.length > 1 && <polyline points={points(draft)} fill="none" stroke="#b87c33" strokeWidth="2.5" strokeDasharray="5 3" vectorEffect="non-scaling-stroke" />}
        {entrance && <circle cx={transform.toSvg(entrance).x} cy={transform.toSvg(entrance).y} r=".65" fill="#a65f2f" stroke="#fff" strokeWidth=".15" />}
        {targets.map(item => <circle key={item.id} cx={transform.toSvg(item.point).x} cy={transform.toSvg(item.point).y} r=".38" fill={(saved.routes || []).some(route => route.startId === item.id || route.endId === item.id) ? '#347c5d' : '#d29e52'} />)}
      </svg>
    </div><aside className="cadastre-editor__tools road-planner__tools">
      <div className="cadastre-setting-card">
        <h4>도로 양끝 선택</h4>
        <select aria-label="도로 시작점" value={startId} onChange={event => { setStartId(event.target.value); setWaypoints([]); }}><option value="entrance">토지 진입점</option>{targets.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select aria-label="도로 목적지" value={targetId} onChange={event => { setTargetId(event.target.value); setWaypoints([]); }}><option value="">목적지 선택</option>{targets.filter(item => item.id !== startId).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      </div>
      <button type="button" aria-pressed={placingEntrance} disabled={(saved.routes || []).length > 0} onClick={() => { setPlacingEntrance(value => !value); setPlacingWaypoint(false); }}>토지 경계에서 진입점 선택</button>
      {(saved.routes || []).length > 0 && <p>진입점을 바꾸려면 저장된 연결을 먼저 삭제해 주세요.</p>}
      <button type="button" aria-pressed={placingWaypoint} disabled={!start || !target} onClick={() => { setPlacingWaypoint(value => !value); setPlacingEntrance(false); }}>도로 중간점 {placingWaypoint ? '배치 중' : '추가'}</button>
      {waypoints.length > 0 && <button type="button" onClick={() => setWaypoints(previous => previous.slice(0, -1))}>마지막 중간점 취소</button>}
      <button type="button" disabled={!field.owned || !target || !start || !entrance || startId === targetId} onClick={save}>이 연결 설계 확정</button>
      {notice && <p role="status">{notice}</p>}
      <h4>저장된 연결</h4>
      {(saved.routes || []).length ? <div className="cadastre-editor__list">{saved.routes.map(route => <div className="cadastre-editor__row" key={route.id}><span>{route.name}</span><button type="button" onClick={() => remove(route.id)}>삭제</button></div>)}</div> : <p className="cadastre-editor__empty">저장된 도로 연결이 없습니다.</p>}
    </aside></div>
  </section>;
}
