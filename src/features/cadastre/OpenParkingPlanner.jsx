import CadastreGround from './CadastreGround';
import CadastreTutorial from './CadastreTutorial';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize } from 'lucide-react';
import { cadastreEditorTransform } from './cultivationZones';
import { parkingGeometry, parkingPlanError, parkingWorkQuote } from './openParking';
import useCadastreViewport from './useCadastreViewport';

export default function OpenParkingPlanner({ selectedField: field, cadastre, zones = [], onOpenParkingSave, onOpenWorkTab }) {
  const fresh = () => ({ version: 1, slots: field.cadastreParkingPlan?.plan?.slots || field.openParking?.slots || 1, angle: field.cadastreParkingPlan?.plan?.angle ?? field.openParking?.angle ?? 0, anchor: field.cadastreParkingPlan?.plan?.anchor || field.openParking?.anchor || null, boundaryId: cadastre.boundaryContourId });
  const [plan, setPlan] = useState(fresh);
  const [placing, setPlacing] = useState(false);
  const [notice, setNotice] = useState('');
  const [dirty, setDirty] = useState(false);
  const svg = useRef(null);
  const transform = useMemo(() => cadastreEditorTransform(cadastre.boundaryPoints), [cadastre.boundaryPoints]);
  const viewport = useCadastreViewport(svg, Boolean(transform), !placing);
  // Parent updates may recreate the saved object without changing its data. Those must not erase a draft.
  const savedPlanKey = JSON.stringify([field.id, cadastre.boundaryContourId, field.openParking?.boundaryId,
    field.openParking?.slots, field.openParking?.angle, field.openParking?.anchor?.x, field.openParking?.anchor?.y, field.cadastreParkingPlan?.plan]);
  useEffect(() => { setPlan(fresh()); setDirty(false); setPlacing(false); }, [savedPlanKey]);
  const geometry = useMemo(() => parkingGeometry(plan, cadastre.boundaryPoints), [plan, cadastre.boundaryPoints]);
  const error = parkingPlanError(field, geometry, cadastre.boundaryPoints, zones);
  const editable = Boolean(field.owned && onOpenParkingSave && transform);
  const pointsOf = (points) => points.map((p) => { const q = transform.toSvg(p); return `${q.x},${q.y}`; }).join(' ');
  const patch = (next) => { setPlan(next); setDirty(true); setNotice(''); };
  const quote = parkingWorkQuote(field, plan, cadastre.boundaryPoints, 'contractor');
  const save = () => {
    if (!editable || error || !dirty) return;
    const result = onOpenParkingSave(plan);
    setNotice(result?.message || '저장하지 못했습니다.');
    if (result?.ok) { setDirty(false); setPlacing(false); }
  };
  return <section className="action-section cadastre-panel cadastre-editor open-parking-planner" aria-label="노지 주차장 배치">
    <CadastreTutorial topic="parking" />


    <div className="cadastre-layout">
      <div className="cadastre-map-card">
        <div className="cadastre-map-card__grid" aria-hidden="true" />
        <div className="cadastre-editor__map-heading"><strong>{cadastre.parcelNo}</strong><span>{placing ? '주차장 시작 모서리를 눌러 배치' : '노란색: 주차면 · 회색: 통로'}</span></div>
        <div className="cadastre-editor__map-toolbar" role="toolbar" aria-label="주차장 지도 보기">
          <button type="button" aria-label="주차장 지도 축소" onClick={viewport.zoomOut}>−</button><output>{viewport.zoomPercent}%</output><button type="button" aria-label="주차장 지도 확대" onClick={viewport.zoomIn}>+</button><button type="button" title="화면 맞춤" aria-label="주차장 지도 화면 맞춤" onClick={viewport.reset}><Maximize size={18} aria-hidden="true" /></button>
        </div>
        {transform && <svg ref={svg} className={`cadastre-editor__canvas ${placing ? 'is-editing' : 'is-pannable'}`} viewBox={viewport.viewBox} aria-label="노지 주차장 배치 지도"
          onPointerDownCapture={viewport.onPointerDownCapture} onPointerMoveCapture={viewport.onPointerMoveCapture} onPointerDown={viewport.onPointerDown} onPointerMove={viewport.onPointerMove} onPointerUpCapture={viewport.endPointer} onPointerCancelCapture={viewport.endPointer} onClickCapture={viewport.onClickCapture}
          onClick={(e) => {
            if (!placing || !editable) return;
            const matrix = svg.current?.getScreenCTM(); if (!matrix) return;
            const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
            patch({ ...plan, anchor: transform.toWorld(p) });
          }}>
          <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent} />
          {zones.map((z) => <polygon key={z.id} points={pointsOf(z.points)} fill={z.kind === 'farm' ? '#a8cfa2' : '#9a9a90'} fillOpacity=".25" stroke="#6b8470" strokeWidth=".15" />)}
          {(field.drainage?.routes || []).map((r) => <polyline key={r.id} points={pointsOf(r.points)} fill="none" stroke="#1976a5" strokeWidth=".6" />)}
          {geometry && <g aria-label={`노지 주차 ${plan.slots}칸 미리보기`}>
            {geometry.footprints.slice(1).map((p, i) => <polygon key={i} points={pointsOf(p)} fill="#a6aaa5" fillOpacity=".8" stroke="#5e6b63" strokeWidth=".2" />)}
            {geometry.bays.map((p, i) => { const center = transform.toSvg({ x: p.reduce((s, q) => s + q.x, 0) / 4, y: p.reduce((s, q) => s + q.y, 0) / 4 }); return <g key={i}><polygon points={pointsOf(p)} fill={error ? '#e1a7a0' : '#e8cb7c'} stroke="#745e2d" strokeWidth=".2" /><text x={center.x} y={center.y} textAnchor="middle" dominantBaseline="middle" fontSize="1.2">{i + 1}</text></g>; })}
          </g>}
        </svg>}
        {!transform && <p className="cadastre-editor__message">연결된 토지 경계가 없습니다. 전체지도에서 토지 경계를 연결한 뒤 주차장을 배치해 주세요.</p>}
      </div>
      <aside className="cadastre-editor__tools">
        <h4>배치 설정</h4>
        <div className="cadastre-editor__form">
          <label className="cadastre-editor__rootstock">주차 칸 수<select className="text-input" value={plan.slots} disabled={!editable} onChange={(e) => patch({ ...plan, slots: Number(e.target.value) })}>{Array.from({ length: 20 }, (_, i) => <option key={i} value={i + 1}>{i + 1}칸 · {(i + 1) * 4}평</option>)}</select></label>
          <label className="cadastre-editor__rootstock">배치 방향<select className="text-input" value={plan.angle} disabled={!editable} onChange={(e) => patch({ ...plan, angle: Number(e.target.value) })}>{[0, 90, 180, 270].map((v) => <option key={v} value={v}>{v}°</option>)}</select></label>
        </div>
        <button type="button" disabled={!editable} aria-pressed={placing} onClick={() => setPlacing(!placing)}>{placing ? '위치 선택 마치기 · 지도 이동' : '지도에서 위치 선택'}</button>
        <small>주차장과 옆의 폭 3m 회차 공간을 토지 안에 배치하세요. 농장 진입로 연결은 현재 요구하지 않습니다.</small>
        <div className="cadastre-editor__metrics"><span>주차면</span><strong>{plan.slots * 4}평 · {plan.slots}칸</strong></div>
        <div className="cadastre-editor__metrics"><span>회차 공간</span><strong>{geometry ? Math.max(0, geometry.occupiedPy - plan.slots * 4).toFixed(1) : '—'}평</strong></div>
        <div className="cadastre-editor__metrics"><span>총 점유 면적</span><strong>{geometry ? geometry.occupiedPy.toFixed(1) : '—'}평</strong></div>
        <div className="cadastre-editor__metrics"><span>예상 외주 작업비</span><strong>{(quote.cost || 0).toLocaleString()}원</strong></div>
        {error && <p className="cadastre-editor__error" role="alert">{error}</p>}
        <div className="cadastre-editor__toolbar"><button type="button" disabled={!editable || !dirty || Boolean(error)} onClick={save}>주차장 계획 확정</button><button type="button" disabled={!dirty} onClick={() => { setPlan(fresh()); setDirty(false); setPlacing(false); setNotice('변경을 취소했습니다.'); }}>변경 취소</button></div>
        {notice && <p className="cadastre-editor__message" role="status">{notice}</p>}
        {field.cadastreParkingPlan && onOpenWorkTab && <button type="button" disabled={dirty} onClick={() => onOpenWorkTab('facility')}>작업 탭에서 시공</button>}
      </aside>
    </div>
  </section>;
}
