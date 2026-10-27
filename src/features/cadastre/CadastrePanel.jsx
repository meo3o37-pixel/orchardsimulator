import {facilityFootprints}from'../facility/facilityConstruction';
import CadastreGround, { CadastreGroundContext } from './CadastreGround';
import CadastreTutorial from './CadastreTutorial';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, Hand, Maximize, Pencil, Plus, Save, Trash2, Undo2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { buildCadastreForField, formatCadastrePyAreaLabel, polygonAreaPyFromPoints } from './cadastreData';
import { cadastreEditorTransform, normalizeCultivationZones, validateCultivationZone } from './cultivationZones';
import { generatePlantingPreview } from './plantingDesign';
import { PLANTING_CROPS, PLANTING_ROOTSTOCKS, plantingFieldsOf, plantingRootstockOf, normalizePlantingSettings, plantingSettingsError } from './plantingSettings';
import PlantingAngleDial from './PlantingAngleDial';
import useCadastreViewport from './useCadastreViewport';
import DrainagePlanner from './DrainagePlanner';
import InfrastructurePlanner from './InfrastructurePlanner';
import OrchardPipePlanner from './OrchardPipePlanner';
import { drainageConflictsWithBuildings } from './drainage';
import OpenFacilitiesPlanner from './OpenFacilitiesPlanner';
import { yardFootprints } from './openYard';
import { normalizeOpenParking } from './openParking';
import SoilSummary from './SoilSummary';
import LiveLandView from './LiveLandView';
import CadastreModeTabs from './CadastreModeTabs';

export default function CadastrePanel(props) {
  const { selectedField, selectedFieldMarkerPoint, contours = [] } = props;
  const [localSection,setLocalSection]=useState('realtime');
  const section=props.section??localSection,setSection=props.onSectionChange??setLocalSection;
  const sectionId=useId();
  const sectionTabs=[{key:'realtime',label:'실시간'},{key:'design',label:'설계'}];
  const sectionKeyDown=event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const next=event.key==='Home'?'realtime':event.key==='End'?'design':section==='realtime'?'design':'realtime';
    setSection(next);requestAnimationFrame(()=>document.getElementById(`${sectionId}-tab-${next}`)?.focus());
  };
  const [mode, setMode] = useState(() => selectedField.owned && !selectedField.openParking && !Number(selectedField.trees) ? 'parking' : 'farm');
  const cadastre = useMemo(() => buildCadastreForField({ selectedField, markerPoint: selectedFieldMarkerPoint, contours }), [selectedField, selectedFieldMarkerPoint, contours]);
  const groundEnvironment = useMemo(() => ({
    day: props.drainageGame?.day ?? 1,
    weather: props.drainageGame?.weather ?? ''
  }), [props.drainageGame?.day, props.drainageGame?.weather]);
  if (!cadastre) return null;
  return <CadastreGroundContext.Provider value={groundEnvironment}><div className={props.className || undefined}>
    <div className="cadastre-section-tabs" role="tablist" aria-label="지적도 하위 탭" onKeyDown={sectionKeyDown}>
      {sectionTabs.map(tab=><button key={tab.key} type="button" role="tab" id={`${sectionId}-tab-${tab.key}`} aria-controls={`${sectionId}-panel-${tab.key}`} aria-selected={section===tab.key} tabIndex={section===tab.key?0:-1} onClick={()=>setSection(tab.key)}>{tab.label}</button>)}
    </div>
    <div className="cadastre-section-panel" role="tabpanel" id={`${sectionId}-panel-realtime`} aria-labelledby={`${sectionId}-tab-realtime`} hidden={section!=='realtime'}>
      <LiveLandView field={selectedField} cadastre={cadastre} zones={props.zones || []} onOpenDesign={()=>{setSection('design');setMode('farm');}} />
      <SoilSummary field={selectedField} />
    </div>
    <div className="cadastre-section-panel" role="tabpanel" id={`${sectionId}-panel-design`} aria-labelledby={`${sectionId}-tab-design`} hidden={section!=='design'}>
    <CadastreModeTabs mode={mode} onChange={setMode} />
    <div className="cadastre-design-view" hidden={mode !== 'farm'}><CultivationEditor key={`${selectedField.id}:${cadastre.boundaryContourId}`} {...props} className="" cadastre={cadastre} /></div>
    <div className="cadastre-design-view" hidden={mode !== 'drainage'}><DrainagePlanner key={`${selectedField.id}:${cadastre.boundaryContourId}`} {...props} cadastre={cadastre} /></div>
    <div className="cadastre-design-view" hidden={mode !== 'pipes'}><OrchardPipePlanner key={`${selectedField.id}:${cadastre.boundaryContourId}`} {...props} cadastre={cadastre} onSelectDesign={setMode} /></div>
    {['trellis','irrigation'].map(kind=><div className="cadastre-design-view" hidden={mode!==kind} key={kind}><InfrastructurePlanner key={`${selectedField.id}:${cadastre.boundaryContourId}:${kind}`} kind={kind} {...props} cadastre={cadastre} onSelectDesign={setMode}/></div>)}
    <div className="cadastre-design-view" hidden={mode !== 'parking'}><OpenFacilitiesPlanner key={`${selectedField.id}:${cadastre.boundaryContourId}`} {...props} cadastre={cadastre} /></div>
    </div>
  </div></CadastreGroundContext.Provider>;
}

function CultivationEditor({ className = '', selectedField, cadastre, zones: rawZones, onZonesChange, onOpenWorkTab }) {
  const parking = useMemo(() => normalizeOpenParking(selectedField.openParking), [selectedField.openParking]);
  const zones = useMemo(() => normalizeCultivationZones(rawZones), [rawZones]);
  const transform = useMemo(() => cadastreEditorTransform(cadastre.boundaryPoints), [cadastre.boundaryPoints]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(null);
  const [closed, setClosed] = useState(false);
  const [vertexIndex, setVertexIndex] = useState(null);
  const [message, setMessage] = useState('');
  const [deletePending, setDeletePending] = useState(false);
  const [plantingDraft, setPlantingDraft] = useState(null);
  const [showRows, setShowRows] = useState(true);
  const [showTrees, setShowTrees] = useState(true);
  const [panMode, setPanMode] = useState(false);
  const svgRef = useRef(null);
  const dragIndex = useRef(null);
  const vertexFrame = useRef(0);
  const pendingVertex = useRef(null);
  const [vertexDragging, setVertexDragging] = useState(false);
  useEffect(() => () => { if (vertexFrame.current) cancelAnimationFrame(vertexFrame.current); }, []);
  const viewport = useCadastreViewport(svgRef, Boolean(transform), !draft || panMode);
  const selected = zones.find((zone) => zone.id === selectedId);
  const plantingSettings = useMemo(() => plantingDraft?.zoneId === selectedId ? plantingDraft.values : normalizePlantingSettings(selected?.planting), [plantingDraft, selectedId, selected?.planting]);
  const selectedBoundaryError = useMemo(() => selected ? validateCultivationZone({ points: selected.points, boundaryPoints: cadastre.boundaryPoints, zones, excludeId: selected.id }) : '', [selected, cadastre.boundaryPoints, zones]);
  const plantingPreview = useMemo(() => selected && !draft && !selectedBoundaryError ? generatePlantingPreview(selected.points, plantingSettings, selectedField.drainage?.routes || [], [...(parking?.footprints || []), ...facilityFootprints(selectedField), ...yardFootprints(selectedField)]) : null, [selected, draft, selectedBoundaryError, plantingSettings, selectedField.drainage, selectedField.facilitySites, selectedField.openYard, parking]);
  const plantingError = plantingSettingsError(plantingSettings) || plantingPreview?.error || selectedBoundaryError;
  const editable = Boolean(selectedField?.owned && onZonesChange && transform);
  const error = useMemo(() => draft && closed && !vertexDragging ? validateCultivationZone({ points: draft.points, boundaryPoints: cadastre.boundaryPoints, zones, excludeId: draft.id }) : '', [draft?.points, draft?.id, closed, vertexDragging, cadastre.boundaryPoints, zones]);
  const svgPoints = (points) => points.map((point) => { const p = transform.toSvg(point); return `${p.x},${p.y}`; }).join(' ');
  const cancel = () => { finishVertex(); setDraft(null); setClosed(false); setVertexIndex(null); setMessage(''); };
  const select = (id) => { if (draft || panMode || id === selectedId) return; setSelectedId(id); setPlantingDraft(null); setDeletePending(false); setMessage(''); };
  const begin = (zone = null) => {
    setDraft(zone ? { ...zone, points: zone.points.map((point) => ({ ...point })) } : { id: '', kind: 'farm', name: `재배구역 ${zones.length + 1}`, points: [] });
    setClosed(Boolean(zone)); setVertexIndex(null); setMessage(''); setDeletePending(false); setPanMode(false);
  };
  const eventPoint = (event) => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix || !transform) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return transform.toWorld(point);
  };
  const closeBoundary = () => {
    if (draft.points.length < 3) return;
    setClosed(true); setVertexIndex(null);
  };
  const useParcelBoundary = () => {
    if (!draft || !editable) return;
    const points = cadastre.boundaryPoints.map(({ x, y }) => ({ x, y }));
    const boundaryError = validateCultivationZone({ points, boundaryPoints: cadastre.boundaryPoints, zones, excludeId: draft.id });
    if (boundaryError) {
      setMessage(`토지 전체를 사용할 수 없습니다. ${boundaryError}`);
      return;
    }
    setDraft((prev) => ({ ...prev, points }));
    setClosed(true); setVertexIndex(null); setPanMode(false);
    dragIndex.current = null;
    setMessage('토지 경계를 그대로 적용했습니다. 확인 후 저장해 주세요.');
  };
  const save = (event) => {
    event.preventDefault();
    if (!draft || !closed || !editable || vertexDragging || error) return;
    const name = draft.name.trim();
    if (!name) { setMessage('구역명을 입력해 주세요.'); return; }
    const zone = { ...draft, id: draft.id || `zone-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`, name, boundaryContourId: cadastre.boundaryContourId };
    if (drainageConflictsWithBuildings(selectedField.drainage, [zone])) { setMessage('건물 구역이 기존 배수로·유공관과 겹칩니다. 위치를 옮겨 주세요.'); return; }
    const result = onZonesChange([...zones.filter((row) => row.id !== zone.id), zone]);
    if (result?.ok === false) { setMessage(result.message); return; }
    setSelectedId(zone.id); setDraft(null); setMessage('재배구역을 저장했습니다.');
  };
  const deleteSelected = () => {
    const result = onZonesChange(zones.filter((zone) => zone.id !== selectedId));
    if (result?.ok === false) { setMessage(result.message); return; }
    setSelectedId(''); setDeletePending(false); setMessage('재배구역을 삭제했습니다.');
  };
  const savePlanting = (event) => {
    event.preventDefault();
    if (!selected || !editable || plantingError) return;
    if (!plantingSettings.variety) { setMessage('품종을 먼저 선택해 주세요.'); return; }
    const result = onZonesChange(zones.map((zone) => zone.id === selectedId ? { ...zone, planting: normalizePlantingSettings(plantingSettings) } : zone), { confirmPlanting: selectedId });
    if (result?.ok === false) { setMessage(result.message); return; }
    setPlantingDraft(null); setMessage(result?.message || '식재 계획을 확정했습니다. 작업 → 시즌작업에서 실행해 주세요.');
  };
  const plantingPaths = useMemo(() => {
    if (!transform || !plantingPreview) return null;
    const line = (points, close = false) => points.map((point, i) => {
      const p = transform.toSvg(point);
      return `${i ? 'L' : 'M'}${p.x.toFixed(3)},${p.y.toFixed(3)}`;
    }).join(' ') + (close ? 'Z' : '');
    return {
      inset: plantingPreview.inset.map((ring) => line(ring, true)).join(' '),
      rows: plantingPreview.rows.map((row) => line(row)).join(' '),
      trees: plantingPreview.trees.map((point) => {
        const p = transform.toSvg(point);
        return `M${(p.x - 0.3).toFixed(3)},${p.y.toFixed(3)}a.3,.3 0 1,0 .6,0a.3,.3 0 1,0 -.6,0`;
      }).join(' ')
    };
  }, [plantingPreview, transform]);
  const moveVertex = (point, index) => setDraft((prev) => prev ? { ...prev, points: prev.points.map((p, i) => i === index ? point : p) } : prev);
  const flushVertex = () => {
    if (vertexFrame.current) cancelAnimationFrame(vertexFrame.current);
    vertexFrame.current = 0;
    const pending = pendingVertex.current;
    pendingVertex.current = null;
    if (pending) { const point = eventPoint(pending); if (point) moveVertex(point, pending.index); }
  };
  const finishVertex = () => { flushVertex(); dragIndex.current = null; setVertexDragging(false); };
  const queueVertex = (event) => {
    pendingVertex.current = { clientX: event.clientX, clientY: event.clientY, index: dragIndex.current };
    if (!vertexFrame.current) vertexFrame.current = requestAnimationFrame(flushVertex);
  };
  const insertVertex = (index, midpoint) => {
    if (draft.points.length >= 256) return;
    setDraft((prev) => ({ ...prev, points: [...prev.points.slice(0, index + 1), midpoint, ...prev.points.slice(index + 1)] }));
    setVertexIndex(index + 1);
  };
  const draftArea = draft?.points.length >= 3 ? polygonAreaPyFromPoints(draft.points) : 0;

  return (
    <section className={`action-section cadastre-panel cadastre-editor ${className}`.trim()}>
      <CadastreTutorial topic="farm" title="지적도" />
      <div className="cadastre-layout">
        <div className="cadastre-map-card">
          <div className="cadastre-map-card__grid" aria-hidden="true" />
          <div className="cadastre-editor__map-heading"><strong>{cadastre.parcelNo}</strong><span>{formatCadastrePyAreaLabel(cadastre.boundaryAreaPy)}</span></div>
          {transform && <div className="cadastre-editor__map-toolbar" role="toolbar" aria-label="지도 보기">
            <button type="button" title="축소" aria-label="지적도 축소" disabled={viewport.zoomPercent <= 50} onClick={viewport.zoomOut}><ZoomOut size={18} /></button>
            <output aria-label="지도 배율">{viewport.zoomPercent}%</output>
            <button type="button" title="확대" aria-label="지적도 확대" disabled={viewport.zoomPercent >= 800} onClick={viewport.zoomIn}><ZoomIn size={18} /></button>
            <button type="button" title="화면 맞춤" aria-label="지적도 화면 맞춤" onClick={viewport.reset}><Maximize size={18} /></button>
            <button type="button" title="지도 이동" aria-label="지적도 이동 모드" aria-pressed={panMode} onClick={() => setPanMode((value) => !value)}><Hand size={18} /></button>
          </div>}
          {transform ? (
            <svg ref={svgRef} className={`cadastre-editor__canvas ${draft && !panMode ? 'is-editing' : 'is-pannable'}`} viewBox={viewport.viewBox} aria-label={`${cadastre.parcelNo} 재배구역 지도`}
              onPointerDownCapture={(event) => { if (viewport.onPointerDownCapture(event)) finishVertex(); }}
              onPointerMoveCapture={viewport.onPointerMoveCapture}
              onPointerDown={viewport.onPointerDown}
              onClickCapture={viewport.onClickCapture}
              onClick={(event) => {
                if (!draft || closed || panMode) return;
                const point = eventPoint(event);
                if (!point || draft.points.length >= 256) return;
                setDraft((prev) => ({ ...prev, points: [...prev.points, point] })); setMessage('');
              }}
              onPointerMove={(event) => { viewport.onPointerMove(event); if (dragIndex.current !== null) queueVertex(event); }}
              onPointerUpCapture={viewport.endPointer}
              onPointerCancelCapture={viewport.endPointer}
              onPointerUp={finishVertex}
              onPointerCancel={finishVertex}
              onLostPointerCapture={(event) => { if (event.target === event.currentTarget) { viewport.endPointer(event); finishVertex(); } }}>
              <title>{cadastre.parcelNo} 재배구역</title>
              <CadastreGround field={selectedField} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent} />
              {(parking?.footprints || []).map((points, i) => <polygon key={`parking-${i}`} points={svgPoints(points)} fill={i ? '#a6aaa5' : '#e8cb7c'} fillOpacity=".8" stroke="#745e2d" strokeWidth=".2" pointerEvents="none"><title>{i ? '주차장 회차 공간 · 식재 제외' : '노지 주차장 · 식재 제외'}</title></polygon>)}
              {zones.filter((zone) => zone.id !== draft?.id).map((zone) => (
                <polygon key={zone.id} points={svgPoints(zone.points)} className={`cadastre-editor__zone ${selectedId === zone.id ? 'is-selected' : ''}`}
                  role="button" tabIndex={draft ? -1 : 0} aria-label={`${zone.name}, ${formatCadastrePyAreaLabel(polygonAreaPyFromPoints(zone.points))}`}
                  onClick={(event) => { if (!draft) { event.stopPropagation(); select(zone.id); } }}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(zone.id); } }}>
                  <title>{zone.name}</title>
                </polygon>
              ))}
              {plantingPaths && <g className="cadastre-editor__planting" role="img" aria-label={`식재 미리보기 ${plantingPreview.treeCount}주`} data-tree-count={plantingPreview.treeCount}>
                <path className="cadastre-editor__inset" d={plantingPaths.inset} fillRule="evenodd" />
                {showRows && <path className="cadastre-editor__planting-rows" d={plantingPaths.rows} />}
                {showTrees && <path className="cadastre-editor__planting-trees" d={plantingPaths.trees} />}
              </g>}
              {draft && <>
                {closed ? <polygon className={`cadastre-editor__draft ${error ? 'is-invalid' : ''}`} points={svgPoints(draft.points)} /> : <polyline className="cadastre-editor__draft is-open" points={svgPoints(draft.points)} />}
                {closed && draft.points.map((p, index) => {
                  const next = draft.points[(index + 1) % draft.points.length];
                  const midpoint = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
                  const position = transform.toSvg(midpoint);
                  return <circle key={`mid-${index}`} className="cadastre-editor__midpoint" cx={position.x} cy={position.y} r={80 / viewport.zoomPercent} role="button" tabIndex={panMode ? -1 : 0} aria-label={`경계점 ${index + 1} 뒤에 점 추가`}
                    onClick={(event) => { event.stopPropagation(); if (!panMode) insertVertex(index, midpoint); }}
                    onKeyDown={(event) => { if (!panMode && event.key === 'Enter') { event.preventDefault(); insertVertex(index, midpoint); } }}><title>점 추가</title></circle>;
                })}
                {draft.points.map((point, index) => {
                  const p = transform.toSvg(point);
                  return <circle key={index} className={`cadastre-editor__vertex ${vertexIndex === index ? 'is-selected' : ''}`} cx={p.x} cy={p.y} r={115 / viewport.zoomPercent} role="button" tabIndex={panMode ? -1 : 0} aria-label={`경계점 ${index + 1}${index === 0 && !closed ? ', 경계 완성' : ''}`}
                    onPointerDown={(event) => { if (panMode) return; event.stopPropagation(); if (!closed) return; dragIndex.current = index; setVertexDragging(true); setVertexIndex(index); svgRef.current.setPointerCapture(event.pointerId); }}
                    onClick={(event) => { event.stopPropagation(); if (panMode) return; if (!closed && index === 0 && draft.points.length >= 3) closeBoundary(); else setVertexIndex(index); }}
                    onKeyDown={(event) => {
                      if (panMode) return;
                      if (event.key === 'Enter' && index === 0 && !closed) { event.preventDefault(); closeBoundary(); return; }
                      const directions = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, -0.5], ArrowDown: [0, 0.5] };
                      const direction = directions[event.key];
                      if (closed && direction) { event.preventDefault(); event.stopPropagation(); setVertexIndex(index); moveVertex(transform.toWorld({ x: p.x + direction[0], y: p.y + direction[1] }), index); }
                    }}><title>{index === 0 && !closed ? '경계 완성' : `경계점 ${index + 1}`}</title></circle>;
                })}
              </>}
            </svg>
          ) : <div className="cadastre-real-boundary cadastre-real-boundary--empty"><strong>연결된 경계 없음</strong></div>}
        </div>
        <aside className="cadastre-editor__tools" aria-label="재배구역 관리">
          <div className="cadastre-editor__heading"><h4>재배구역</h4><span>{zones.length}개</span></div>
          <button className="cadastre-editor__command" type="button" disabled={!editable || Boolean(draft) || zones.length >= 200} onClick={() => begin()}><Plus size={18} />재배구역 만들기</button>
          <div className="cadastre-editor__list">
            {zones.length === 0 ? <p className="cadastre-editor__empty">등록된 재배구역 없음</p> : zones.map((zone) => (
              <button key={zone.id} type="button" className={`cadastre-editor__row ${selectedId === zone.id ? 'is-selected' : ''}`} disabled={Boolean(draft)} onClick={() => select(zone.id)}>
                <span>{zone.name}</span><small>{formatCadastrePyAreaLabel(polygonAreaPyFromPoints(zone.points))}</small>
              </button>
            ))}
          </div>
          {draft ? (
            <form className="cadastre-editor__form" onSubmit={save}>
              <h4>{draft.id ? '재배구역 수정' : '새 재배구역'}</h4>
              <label htmlFor="cadastre-zone-name">구역명</label>
              <input id="cadastre-zone-name" className="text-input" value={draft.name} maxLength={40} required onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} />
              <button type="button" className="cadastre-editor__command" disabled={!editable} onClick={useParcelBoundary}><Maximize size={18} />토지 그대로 사용</button>
              <div className="cadastre-editor__metrics"><span>구역 면적</span><strong>{formatCadastrePyAreaLabel(draftArea)}</strong></div>
              <div className="cadastre-editor__toolbar">
                {!closed && <><button type="button" title="한 점 되돌리기" aria-label="한 점 되돌리기" disabled={!draft.points.length} onClick={() => setDraft((prev) => ({ ...prev, points: prev.points.slice(0, -1) }))}><Undo2 size={18} /></button><button type="button" className="cadastre-editor__command" disabled={draft.points.length < 3} onClick={closeBoundary}><Check size={18} />경계 완성</button></>}
                {closed && <button type="button" title="선택한 점 삭제" aria-label="선택한 점 삭제" disabled={vertexIndex === null || draft.points.length <= 3} onClick={() => { setDraft((prev) => ({ ...prev, points: prev.points.filter((_, i) => i !== vertexIndex) })); setVertexIndex(null); }}><Trash2 size={18} /></button>}
              </div>
              {error && <p className="cadastre-editor__error" role="alert">{error}</p>}
              <div className="cadastre-editor__toolbar"><button type="submit" className="cadastre-editor__command" disabled={vertexDragging || !closed || Boolean(error) || !draft.name.trim()}><Save size={18} />저장</button><button type="button" className="cadastre-editor__command" onClick={cancel}><X size={18} />취소</button></div>
            </form>
          ) : selected && <div className="cadastre-editor__selection">
            <h4>{selected.name}</h4>
            <div className="cadastre-editor__metrics"><span>구역 면적</span><strong>{formatCadastrePyAreaLabel(polygonAreaPyFromPoints(selected.points))}</strong></div>
            {selectedBoundaryError && <p className="cadastre-editor__error">토지 경계가 변경되었습니다. 구역 경계를 확인해 주세요.</p>}
            <div className="cadastre-editor__toolbar"><button type="button" className="cadastre-editor__command" disabled={!editable} onClick={() => begin(selected)}><Pencil size={18} />경계 수정</button><button type="button" title="구역 삭제" aria-label="구역 삭제" disabled={!editable} onClick={() => setDeletePending(true)}><Trash2 size={18} /></button></div>
            {deletePending && <div className="cadastre-editor__delete" role="group" aria-label="구역 삭제 확인"><p>{selected.name} 구역을 삭제할까요?</p><div className="cadastre-editor__toolbar"><button type="button" className="cadastre-editor__command" onClick={deleteSelected}>삭제</button><button type="button" className="cadastre-editor__command" onClick={() => setDeletePending(false)}>취소</button></div></div>}
            <form className="cadastre-editor__planting-form" onSubmit={savePlanting}>
              <h4>식재 설정</h4>
              <label className="cadastre-editor__rootstock" htmlFor="cadastre-crop"><span>품목</span>
                <select id="cadastre-crop" className="text-input" disabled={!editable} value={plantingSettings.crop || 'apple'} onChange={(event) => {
                  setPlantingDraft({ zoneId: selectedId, values: { ...plantingSettings, crop: event.target.value, variety: '' } });
                  setMessage('');
                }}>
                  {PLANTING_CROPS.map((crop) => <option key={crop.key} value={crop.key}>{crop.label}</option>)}
                </select>
              </label>
              <label className="cadastre-editor__rootstock" htmlFor="cadastre-variety"><span>품종</span>
                <select id="cadastre-variety" className="text-input" required disabled={!editable} value={plantingSettings.variety || ''} onChange={(event) => {
                  setPlantingDraft({ zoneId: selectedId, values: { ...plantingSettings, crop: plantingSettings.crop || 'apple', variety: event.target.value } });
                  setMessage('');
                }}>
                  <option value="" disabled>품종 선택</option>
                  {PLANTING_CROPS.find((crop) => crop.key === (plantingSettings.crop || 'apple'))?.varieties.map((variety) => <option key={variety.key} value={variety.key}>{variety.label}</option>)}
                </select>
              </label>
              <label className="cadastre-editor__rootstock" htmlFor="cadastre-rootstock"><span>대목</span>
                <select id="cadastre-rootstock" className="text-input" disabled={!editable} value={plantingSettings.rootstock} onChange={(event) => {
                  const limits = plantingRootstockOf(event.target.value);
                  setPlantingDraft({ zoneId: selectedId, values: {
                    ...plantingSettings,
                    rootstock: limits.key,
                    rowSpacing: Math.max(limits.rowSpacing, Number(plantingSettings.rowSpacing) || 0),
                    treeSpacing: Math.max(limits.treeSpacing, Number(plantingSettings.treeSpacing) || 0)
                  } });
                  setMessage(`${limits.label} 대목 기준을 적용했습니다.`);
                }}>
                  {PLANTING_ROOTSTOCKS.map((rootstock) => <option key={rootstock.key} value={rootstock.key}>{rootstock.label}</option>)}
                </select>
              </label>
              <div className="cadastre-editor__planting-fields">
                {plantingFieldsOf(plantingSettings.rootstock).map((field) => <label key={field.key} htmlFor={`cadastre-${field.key}`}>
                  <span>{field.label}</span>
                  <div className="cadastre-editor__number"><input id={`cadastre-${field.key}`} type="number" className="text-input" min={field.min} max={field.max} step={field.step} required disabled={!editable}
                    value={plantingSettings[field.key]} onChange={(event) => { setPlantingDraft({ zoneId: selectedId, values: { ...plantingSettings, [field.key]: event.target.value } }); setMessage(''); }} /><span>{field.unit}</span></div>
                  {(field.key === 'rowSpacing' || field.key === 'treeSpacing') && <small className="cadastre-editor__minimum">최소 {field.min}m</small>}
                </label>)}
              </div>
              <PlantingAngleDial value={plantingSettings.angleDeg} disabled={!editable} onChange={(angleDeg) => {
                setPlantingDraft({ zoneId: selectedId, values: { ...plantingSettings, angleDeg } });
                setMessage('');
              }} />
              <div className="cadastre-editor__preview-options"><label><input type="checkbox" checked={showRows} onChange={(event) => setShowRows(event.target.checked)} />식재선</label><label><input type="checkbox" checked={showTrees} onChange={(event) => setShowTrees(event.target.checked)} />나무</label></div>
              {plantingError ? <p className="cadastre-editor__error" role="alert">{plantingError}</p> : <>
                <div className="cadastre-editor__metrics"><span>배치 가능</span><strong aria-live="polite">{(plantingPreview?.treeCount || 0).toLocaleString()}주 · {plantingPreview?.rowCount || 0}열</strong></div>
                {selectedField.cadastrePlantingPlans?.some(p => p.zoneId === selected.id) && <div className="cadastre-editor__metrics"><span>실제 식재 완료</span><strong>{selectedField.cadastrePlantingPlans.find(p => p.zoneId === selected.id).done}주</strong></div>}
                <div className="cadastre-editor__metrics"><span>여백 제외 면적</span><strong>{formatCadastrePyAreaLabel((plantingPreview?.usableAreaSqM || 0) / 3.305785)}</strong></div>
                {plantingPreview?.treeCount === 0 && <p className="cadastre-editor__empty">현재 간격과 여백에 배치 가능한 나무가 없습니다.</p>}
              </>}
              <div className="cadastre-editor__toolbar"><button className="cadastre-editor__command" type="submit" disabled={!editable || !plantingSettings.variety || Boolean(plantingError)}><Save size={18} />식재 계획 확정</button><button className="cadastre-editor__command" type="button" disabled={!plantingDraft} onClick={() => { setPlantingDraft(null); setMessage(''); }}><Undo2 size={18} />되돌리기</button></div>
              {onOpenWorkTab && selectedField.cadastrePlantingPlans?.some(p => p.zoneId === selected.id) && <button type="button" className="cadastre-editor__command" onClick={() => onOpenWorkTab('season')}>작업 탭에서 식재</button>}
            </form>
          </div>}
          {message && <p className="cadastre-editor__message" role="status">{message}</p>}
        </aside>
      </div>
    </section>
  );
}
