import useCadastreViewport from './useCadastreViewport';
import CadastreMapToolbar, {cadastreViewportEvents} from './CadastreMapToolbar';
import CadastreGround from './CadastreGround';
import CadastreTutorial from './CadastreTutorial';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cadastreEditorTransform } from './cultivationZones';
import { polygonBoundsFromPoints } from './cadastreData';
import { DRAINAGE_TYPES, normalizeDrainage, analyzeDrainage, drainageLength } from './drainage';
import { soilProfileOf } from '../../utils/soil';
import { slopeBearingOf, slopeBearingLabel } from '../../utils/terrain';
import { isBuried } from './pipeSystem';

export default function DrainagePlanner({ selectedField: field, cadastre, zones = [], onDrainageAction, onOpenWorkTab }) {
  const saved = useMemo(() => { const p = normalizeDrainage(field.drainage); return p ? { ...p, routes: p.routes.filter(r => !isBuried(r)) } : null; }, [field.drainage]);
  const soil = soilProfileOf(field);
  const bearing = slopeBearingOf(field);
  const fresh = () => saved ? { ...saved, slopeDeg: Number(field.slopeDeg) || 0 } : { version: 1, bearing, slopeDeg: Number(field.slopeDeg) || 0, boundary: cadastre.boundaryPoints, boundaryId: cadastre.boundaryContourId, routes: [] };
  const [plan, setPlan] = useState(fresh);
  const [drawing, setDrawing] = useState(null);
  const [panMode,setPanMode]=useState(false);
  const [type, setType] = useState('earth');
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const svg = useRef(null);
  const arrow = useId().replaceAll(':', '');
  useEffect(() => {
    if (dirty || drawing) { setNotice('게임 상태가 변경되었습니다. 작성 중인 계획은 유지되며 저장할 때 다시 검사합니다.'); return; }
    setPlan(fresh()); setDrawing(null); setDirty(false);
  }, [saved, cadastre.boundaryContourId, bearing]);
  const bounds = polygonBoundsFromPoints(cadastre.boundaryPoints);
  const transform = useMemo(() => bounds ? cadastreEditorTransform([{ x: bounds.minX - .008, y: bounds.minY - .008 }, { x: bounds.maxX + .008, y: bounds.maxY + .008 }]) : null, [cadastre.boundaryPoints]);
  const viewport=useCadastreViewport(svg,Boolean(transform),!drawing||panMode);
  const pointsOf = (points) => points.map((p) => { const q = transform.toSvg(p); return `${q.x},${q.y}`; }).join(' ');
  const status = useMemo(() => analyzeDrainage(plan, field.py, field), [plan, field.py, field.soilComposition, field.slopeDeg]);
  const built = useMemo(() => saved ? analyzeDrainage(saved, field.py, field) : null, [saved, field.py, field.soilComposition, field.slopeDeg]);
  const editable = Boolean(field.owned && onDrainageAction && transform);
  const patch = (next) => { setPlan(next); setDirty(true); setNotice(''); };
  const finishLine = () => {
    if (drawing?.length < 2) return;
    patch({ ...plan, routes: [...plan.routes, { id: `drain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type, points: drawing, work: 0, blockage: 0 }] });
    setDrawing(null);
  };
  const act = () => {
    if (!editable) return;
    const result = onDrainageAction({ kind: 'save', scope: 'surface', plan });
    setNotice(result?.message || '요청을 처리하지 못했습니다.');
    if (result?.ok) setDirty(false);
  };
  return <section className="action-section cadastre-panel cadastre-editor drainage-planner" aria-label="배수로 설계·시공">
    <CadastreTutorial topic="drainage" />

    <div className="cadastre-layout">
      <div className="cadastre-map-card">
        <div className="cadastre-map-card__grid" aria-hidden="true" />
        <div className="cadastre-editor__map-heading"><strong>{cadastre.parcelNo}</strong><span>{drawing ? '시작점부터 하류 방향으로 점을 찍으세요' : '색 수로: 완공 / 점선: 미시공'}</span></div>
        {transform&&<CadastreMapToolbar viewport={viewport} label="배수로 지도" panMode={panMode} onPanModeChange={setPanMode}/>}
        {transform ? <svg ref={svg} className={`cadastre-editor__canvas ${drawing&&!panMode?'is-editing':'is-pannable'}`} viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)} aria-label="배수로 배치 지도" onClick={(e) => {
          if (!drawing || panMode || !editable || drawing.length >= 128) return;
          const matrix = svg.current.getScreenCTM(); if (!matrix) return;
          const position = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
          let point = transform.toWorld(position);
          let nearest = 1;
          // Snap endpoints to a nearby existing channel, making junctions practical to draw.
          plan.routes.forEach((r) => r.points.slice(1).forEach((b, i) => {
            const a = r.points[i], dx = b.x - a.x, dy = b.y - a.y, den = dx * dx + dy * dy;
            const t = den ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / den)) : 0;
            const q = { x: a.x + t * dx, y: a.y + t * dy }, distance = Math.hypot(q.x - point.x, q.y - point.y) * 1000;
            if (distance < nearest) { nearest = distance; point = q; }
          }));
          // Boundary clicks can land a fraction of a pixel outside the parcel.
          // Snap only the first point; external outlet endpoints stay outside.
          if (!drawing.length) cadastre.boundaryPoints.forEach((a, i) => {
            const b = cadastre.boundaryPoints[(i + 1) % cadastre.boundaryPoints.length];
            const dx = b.x - a.x, dy = b.y - a.y, den = dx * dx + dy * dy;
            const t = den ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / den)) : 0;
            const q = { x: a.x + dx * t, y: a.y + dy * t }, distance = Math.hypot(point.x - q.x, point.y - q.y) * 1000;
            if (distance < nearest) { nearest = distance; point = q; }
          });
          setDrawing([...drawing, point]);
        }}>
          <defs><marker id={arrow} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#1976a5" /></marker></defs>
          <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent} />
          <g aria-label="하경사 방향"><line x1="50" y1="50" x2={50 + Math.cos(plan.bearing * Math.PI / 180) * 13} y2={50 + Math.sin(plan.bearing * Math.PI / 180) * 13} stroke="#a27724" strokeWidth=".6" markerEnd={`url(#${arrow})`} /><text x="51" y="46" fontSize="2.2">하경사</text></g>
          {plan.routes.map((r) => <g key={r.id}><polyline points={pointsOf(r.points)} fill="none" stroke={isBuried(r) ? '#7952a8' : '#1976a5'} strokeWidth={r.type === 'pipe150' ? '1.2' : '.8'} strokeDasharray={r.work + .01 >= drainageLength(r.points) ? undefined : '2 1'} markerEnd={`url(#${arrow})`} /><circle cx={transform.toSvg(r.points.at(-1)).x} cy={transform.toSvg(r.points.at(-1)).y} r=".8" fill={isBuried(r) ? '#7952a8' : '#1976a5'} />{isBuried(r) && <rect x={transform.toSvg(r.points[0]).x - .7} y={transform.toSvg(r.points[0]).y - .7} width="1.4" height="1.4" fill="#7952a8"><title>점검구</title></rect>}</g>)}
          {drawing?.length ? <polyline points={pointsOf(drawing)} fill="none" stroke="#d78925" strokeWidth="1" /> : null}
        </svg> : <p>연결된 토지 경계가 필요합니다.</p>}
      </div>
      <aside className="cadastre-editor__tools">
        <h4>배수 기준</h4>
        <div className="cadastre-editor__metrics"><span>토지 면적</span><strong>{Number(field.py || 0).toLocaleString()}평</strong></div>
        <div className="cadastre-editor__metrics"><span>최소 길이</span><strong>{status.requirement.length}m</strong></div>
        <div className="cadastre-editor__metrics"><span>완공·연결 길이</span><strong>{(built?.builtLength || 0).toFixed(1)}m</strong></div>
        <div className="cadastre-editor__metrics"><span>완공 배출구</span><strong>{built?.outletCount || 0}/{status.requirement.outlets}개</strong></div>
        <div className="cadastre-editor__metrics"><span>토양 반영 배수 능력</span><strong>{((built?.capacity || 0) * soil.channel).toFixed(2)}/일</strong></div>
        <strong>{built?.ready ? '최소 배수 기준 충족' : Number(field.trees) > 0 && !saved ? '기존 식재 농장: 새 식재 기준 적용 유예' : '최소 배수 기준 미달'}</strong>
        <div className="cadastre-editor__metrics"><span>토지 하경사 방향</span><strong>{slopeBearingLabel(bearing)}</strong></div>
        <label className="cadastre-editor__rootstock"><span>배수로 종류</span><select value={type} disabled={!editable || Boolean(drawing)} onChange={(e) => setType(e.target.value)}>{DRAINAGE_TYPES.filter(t => !t.buried).map((t) => <option key={t.key} value={t.key}>{t.name} · 외주 {t.price.toLocaleString()}원/m</option>)}</select></label>
        <div className="cadastre-editor__toolbar">{drawing ? <><button type="button" disabled={drawing.length < 2} onClick={finishLine}>선 그리기 완료</button><button type="button" disabled={!drawing.length} onClick={() => setDrawing(drawing.slice(0, -1))}>한 점 취소</button><button type="button" onClick={() => setDrawing(null)}>그리기 취소</button></> : <button type="button" className="cadastre-editor__command" disabled={!editable || plan.routes.length >= 64} onClick={() => setDrawing([])}>배수로 그리기</button>}</div>
        {plan.routes.map((r, i) => <div key={r.id} className="drainage-route-row"><span>{DRAINAGE_TYPES.find((t) => t.key === r.type)?.name} {i + 1} · {drainageLength(r.points).toFixed(1)}m<br />시공 {r.work.toFixed(1)}m · 막힘 {r.blockage.toFixed(0)}%{isBuried(r) && <><br />깊이 {r.depthStart} → {r.depthEnd}m · {r.envelope ? '추가 피복' : '기본 피복'}</>}</span><button type="button" disabled={!editable || r.work > 0 || Boolean(drawing)} onClick={() => patch({ ...plan, routes: plan.routes.filter((n) => n.id !== r.id) })}>계획 삭제</button></div>)}
        {status.error ? <p className="cadastre-editor__error" role="alert">{status.error}</p> : <small>설계 길이 {status.length.toFixed(1)}m · 수로 점유 약 {status.areaPy.toFixed(1)}평(외부 꼬리 포함)</small>}
        <div className="cadastre-editor__toolbar"><button type="button" disabled={!editable || !dirty || Boolean(drawing) || Boolean(status.error)} onClick={act}>배수 계획 확정</button><button type="button" disabled={!dirty && !drawing} onClick={() => { setPlan(fresh()); setDrawing(null); setDirty(false); }}>변경 취소</button></div>
        {notice ? <p className="cadastre-editor__message" role="status">{notice}</p> : null}
        {onOpenWorkTab && <button type="button" disabled={!saved || dirty} onClick={() => onOpenWorkTab('facility')}>작업 탭에서 시공·세척</button>}
      </aside>
    </div>
  </section>;
}
