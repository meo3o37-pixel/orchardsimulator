import useCadastreViewport from './useCadastreViewport';
import CadastreMapToolbar, {cadastreViewportEvents} from './CadastreMapToolbar';
import CadastreGround from './CadastreGround';
import CadastreDisplayControls from './CadastreDisplayControls';
import CadastreTutorial from './CadastreTutorial';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cadastreEditorTransform } from './cultivationZones';
import { polygonBoundsFromPoints } from './cadastreData';
import { DRAINAGE_TYPES, DRAINAGE_SELF_WORK_COST_FACTOR, normalizeDrainage, analyzeDrainage, drainageLength } from './drainage';
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
  const selectedType = DRAINAGE_TYPES.find((entry) => entry.key === type);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const svg = useRef(null);
  const previewLine = useRef(null);
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
  const hasPendingWork = saved?.routes.some((route) => route.work + .001 < drainageLength(route.points));
  const canPlacePoint = drawing && !panMode && editable && drawing.length < 128;
  const lastPoint = drawing?.length ? transform?.toSvg(drawing.at(-1)) : null;
  const pointAtPointer = (event) => {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return null;
    const position = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    let point = transform.toWorld(position);
    let nearest = 1;
    const snapToSegment = (a, b) => {
      const dx = b.x - a.x, dy = b.y - a.y, den = dx * dx + dy * dy;
      const t = den ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / den)) : 0;
      const q = { x: a.x + t * dx, y: a.y + t * dy };
      const distance = Math.hypot(q.x - point.x, q.y - point.y) * 1000;
      if (distance < nearest) { nearest = distance; point = q; }
    };
    // Snap to existing channels and keep external outlet endpoints outside the boundary.
    plan.routes.forEach((r) => r.points.slice(1).forEach((b, i) => snapToSegment(r.points[i], b)));
    if (!drawing.length) cadastre.boundaryPoints.forEach((a, i, points) => snapToSegment(a, points[(i + 1) % points.length]));
    return point;
  };
  const movePointer = (event) => {
    viewport.onPointerMove(event);
    const line = previewLine.current;
    if (!line || event.pointerType === 'touch') return;
    const point = pointAtPointer(event);
    if (!point) return;
    const end = transform.toSvg(point);
    // Update just the preview so mouse movement does not rerender the map.
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('visibility', 'visible');
  };
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
    <CadastreDisplayControls />

    <div className="cadastre-layout">
      <div className="cadastre-map-card">
        <div className="cadastre-map-card__grid" aria-hidden="true" />
        <div className="cadastre-editor__map-heading"><strong>{cadastre.parcelNo}</strong><span>{drawing ? '시작점부터 하류 방향으로 점을 찍으세요' : '색 수로: 완공 / 점선: 미시공'}</span></div>
        {transform&&<CadastreMapToolbar viewport={viewport} label="배수로 지도" panMode={panMode} onPanModeChange={setPanMode}/>}
        {transform ? <svg ref={svg} className={`cadastre-editor__canvas ${drawing&&!panMode?'is-editing':'is-pannable'}`} viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)} aria-label="배수로 배치 지도"
          onPointerMove={movePointer}
          onPointerLeave={() => previewLine.current?.setAttribute('visibility', 'hidden')}
          onClick={(event) => {
            if (!canPlacePoint) return;
            const point = pointAtPointer(event);
            if (point) setDrawing([...drawing, point]);
          }}>
          <defs><marker id={arrow} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#1976a5" /></marker></defs>
          <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent} />
          <g aria-label="하경사 방향"><line x1="50" y1="50" x2={50 + Math.cos(plan.bearing * Math.PI / 180) * 13} y2={50 + Math.sin(plan.bearing * Math.PI / 180) * 13} stroke="#a27724" strokeWidth=".6" markerEnd={`url(#${arrow})`} /><text x="51" y="46" fontSize="2.2">하경사</text></g>
          {plan.routes.map((r) => <g key={r.id}><polyline points={pointsOf(r.points)} fill="none" stroke={isBuried(r) ? '#7952a8' : '#1976a5'} strokeWidth={r.type === 'pipe150' ? '1.2' : '.8'} strokeDasharray={r.work + .01 >= drainageLength(r.points) ? undefined : '2 1'} markerEnd={`url(#${arrow})`} /><circle cx={transform.toSvg(r.points.at(-1)).x} cy={transform.toSvg(r.points.at(-1)).y} r=".8" fill={isBuried(r) ? '#7952a8' : '#1976a5'} />{isBuried(r) && <rect x={transform.toSvg(r.points[0]).x - .7} y={transform.toSvg(r.points[0]).y - .7} width="1.4" height="1.4" fill="#7952a8"><title>점검구</title></rect>}</g>)}
          {lastPoint && <g pointerEvents="none" aria-hidden="true">
            <polyline points={pointsOf(drawing)} fill="none" stroke="#d78925" strokeWidth="1" strokeLinejoin="round" />
            {canPlacePoint && <line key={drawing.length} ref={previewLine} x1={lastPoint.x} y1={lastPoint.y} x2={lastPoint.x} y2={lastPoint.y}
              visibility="hidden" stroke="#ad6210" strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
            <circle cx={lastPoint.x} cy={lastPoint.y} r=".67" fill="#d78925" stroke="#fff9e9" strokeWidth=".24" />
          </g>}
        </svg> : <p>연결된 토지 경계가 필요합니다.</p>}
      </div>
      <aside className="cadastre-editor__tools">
        <div className="cadastre-setting-card">
          <h4>배수 기준</h4>
          <div className="cadastre-editor__metrics"><span>토지 면적</span><strong>{Number(field.py || 0).toLocaleString()}평</strong></div>
          <div className="cadastre-editor__metrics"><span>최소 길이</span><strong>{status.requirement.length}m</strong></div>
          <div className="cadastre-editor__metrics"><span>완공·연결 길이</span><strong>{(built?.builtLength || 0).toFixed(1)}m</strong></div>
          <div className="cadastre-editor__metrics"><span>완공 배출구</span><strong>{built?.outletCount || 0}/{status.requirement.outlets}개</strong></div>
          <div className="cadastre-editor__metrics"><span>토양 반영 배수 능력</span><strong>{((built?.capacity || 0) * soil.channel).toFixed(2)}/일</strong></div>
          <strong>{built?.ready ? '최소 배수 기준 충족' : Number(field.trees) > 0 && !saved ? '기존 식재 농장: 새 식재 기준 적용 유예' : '최소 배수 기준 미달'}</strong>
          <div className="cadastre-editor__metrics"><span>토지 하경사 방향</span><strong>{slopeBearingLabel(bearing)}</strong></div>
        </div>
        <div className="cadastre-setting-card">
          <label className="cadastre-editor__rootstock"><span>배수로 종류</span><select value={type} disabled={!editable || Boolean(drawing)} onChange={(e) => setType(e.target.value)}>{DRAINAGE_TYPES.filter(t => !t.buried).map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}</select></label>
          <div className="cadastre-editor__metrics"><span>전문 외주</span><strong>{selectedType.price.toLocaleString()}원/m</strong></div>
          <div className="cadastre-editor__metrics"><span>자가 시공 재료비</span><strong>{(selectedType.price * DRAINAGE_SELF_WORK_COST_FACTOR).toLocaleString()}원/m</strong></div>
          <small>자가 시공에는 현재 토지에 주차한 내 굴삭기가 필요하며, 노동력·연료·내구도를 사용합니다. 배출구 비용은 별도입니다.</small>
        </div>
        <div className="cadastre-editor__toolbar">{drawing ? <><button type="button" disabled={drawing.length < 2} onClick={finishLine}>선 그리기 완료</button><button type="button" disabled={!drawing.length} onClick={() => setDrawing(drawing.slice(0, -1))}>한 점 취소</button><button type="button" onClick={() => setDrawing(null)}>그리기 취소</button></> : <button type="button" className="cadastre-editor__command" disabled={!editable || plan.routes.length >= 64} onClick={() => setDrawing([])}>배수로 그리기</button>}</div>
        {plan.routes.map((r, i) => <div key={r.id} className="drainage-route-row"><span>{DRAINAGE_TYPES.find((t) => t.key === r.type)?.name} {i + 1} · {drainageLength(r.points).toFixed(1)}m<br />시공 {r.work.toFixed(1)}m · 막힘 {r.blockage.toFixed(0)}%{isBuried(r) && <><br />깊이 {r.depthStart} → {r.depthEnd}m · {r.envelope ? '추가 피복' : '기본 피복'}</>}</span><button type="button" disabled={!editable || r.work > 0 || Boolean(drawing)} onClick={() => patch({ ...plan, routes: plan.routes.filter((n) => n.id !== r.id) })}>계획 삭제</button></div>)}
        {status.error ? <p className="cadastre-editor__error" role="alert">{status.error}</p> : <small>설계 길이 {status.length.toFixed(1)}m · 수로 점유 약 {status.areaPy.toFixed(1)}평(외부 꼬리 포함)</small>}
        <div className="cadastre-editor__toolbar">
          <button type="button" className="cadastre-design-confirm" disabled={!editable || !dirty || Boolean(drawing) || Boolean(status.error)} onClick={act}>설계 확정</button>
          {editable && onOpenWorkTab && hasPendingWork && !dirty && !drawing && <button type="button" className="cadastre-editor__command" onClick={() => onOpenWorkTab('facility')}>작업 탭에서 시공 방식 선택</button>}
        </div>
        {notice ? <p className="cadastre-editor__message" role="status">{notice}</p> : null}
      </aside>
    </div>
  </section>;
}
