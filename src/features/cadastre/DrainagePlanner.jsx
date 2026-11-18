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
import { infrastructureSource } from './orchardInfrastructure';
import earthDrainImage from '../../assets/images/아이템/소모성도구/흙수로.png';
import peDrainImage from '../../assets/images/아이템/소모성도구/PE관200mm6m.png';
import concreteDrainImage from '../../assets/images/아이템/소모성도구/콘크리트수로600mm1m.png';
const DRAIN_IMAGES={earth:earthDrainImage,lined:peDrainImage,main:concreteDrainImage};
import {DRAIN_VISUAL,DrainStroke} from './DesignRouteStroke';
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
  const [showPlantingRows,setShowPlantingRows]=useState(true);
  const plantingSource=useMemo(()=>infrastructureSource({...field,drainage:{...field.drainage,routes:[...(field.drainage?.routes||[]).filter(isBuried),...plan.routes]}},zones,cadastre.boundaryPoints),[field,zones,cadastre.boundaryPoints,plan.routes]);
  const plantingWithoutSurface=useMemo(()=>infrastructureSource({...field,drainage:{...field.drainage,routes:(field.drainage?.routes||[]).filter(isBuried)}},zones,cadastre.boundaryPoints),[field,zones,cadastre.boundaryPoints]);
  const originalTreeCount=plantingWithoutSurface.rows.reduce((sum,row)=>sum+row.treeCount,0);
  const remainingTreeCount=plantingSource.rows.reduce((sum,row)=>sum+row.treeCount,0);
  const excludedTreeCount=Math.max(0,originalTreeCount-remainingTreeCount);
  const svg = useRef(null);
  const previewLine = useRef(null);
  const snapTarget=useRef(null);
  const [connectionHint,setConnectionHint]=useState(null);
  const arrow = useId().replaceAll(':', '');
  const boundaryClip=`drain-boundary-${arrow}`;
  useEffect(() => {
    if (dirty || drawing) { setNotice('게임 상태가 변경되었습니다. 작성 중인 계획은 유지되며 저장할 때 다시 검사합니다.'); return; }
    setPlan(fresh()); setDrawing(null); setDirty(false);
  }, [saved, cadastre.boundaryContourId, bearing]);
  const bounds = polygonBoundsFromPoints(cadastre.boundaryPoints);
  const transform = useMemo(() => bounds ? cadastreEditorTransform([{ x: bounds.minX - .008, y: bounds.minY - .008 }, { x: bounds.maxX + .008, y: bounds.maxY + .008 }]) : null, [cadastre.boundaryPoints]);
  const viewport=useCadastreViewport(svg,Boolean(transform),!drawing||panMode);
  const downhill = (a,b) => ((b.x-a.x)*Math.cos(bearing*Math.PI/180)+(b.y-a.y)*Math.sin(bearing*Math.PI/180))*1000 > .05;
  const pointsOf = (points) => points.map((p) => { const q = transform.toSvg(p); return `${q.x},${q.y}`; }).join(' ');
  const boundaryOutlets = useMemo(() => plan.routes.flatMap(route => route.points.slice(1).flatMap((b,index) => {
    const a=route.points[index],dx=b.x-a.x,dy=b.y-a.y;
    return cadastre.boundaryPoints.flatMap((c,edge) => {
      const d=cadastre.boundaryPoints[(edge+1)%cadastre.boundaryPoints.length],ex=d.x-c.x,ey=d.y-c.y,den=dx*ey-dy*ex;
      if(Math.abs(den)<1e-14)return [];
      const t=((c.x-a.x)*ey-(c.y-a.y)*ex)/den,u=((c.x-a.x)*dy-(c.y-a.y)*dx)/den;
      if(t<0||t>1||u<0||u>=1)return [];
      return [{point:{x:a.x+dx*t,y:a.y+dy*t},from:a,key:`${route.id}-${index}-${edge}`}];
    });
  })),[plan.routes,cadastre.boundaryPoints]);
  const status = useMemo(() => analyzeDrainage(plan, field.py, field), [plan, field.py, field.soilComposition, field.slopeDeg]);
  const built = useMemo(() => saved ? analyzeDrainage(saved, field.py, field) : null, [saved, field.py, field.soilComposition, field.slopeDeg]);
  const editable = Boolean(field.owned && onDrainageAction && transform);
  const constructedLength=(saved?.routes||[]).filter(route=>!isBuried(route)).reduce((sum,route)=>sum+Math.min(route.work,drainageLength(route.points)),0);
  const hasPendingWork = saved?.routes.some((route) => route.work + .001 < drainageLength(route.points));
  const canPlacePoint = drawing && !panMode && editable && drawing.length < 128;
  const lastPoint = drawing?.length ? transform?.toSvg(drawing.at(-1)) : null;
  const pointAtPointer = (event) => {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return null;
    const position = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const rawPoint = transform.toWorld(position);
    let point = rawPoint;
    let nearest = 12;
    snapTarget.current=null;
    const snapToSegment = (a, b, route=null) => {
      const dx = b.x - a.x, dy = b.y - a.y, den = dx * dx + dy * dy;
      const t = den ? Math.max(0, Math.min(1, ((rawPoint.x - a.x) * dx + (rawPoint.y - a.y) * dy) / den)) : 0;
      const q = { x: a.x + t * dx, y: a.y + t * dy };
      const screen=transform.toSvg(q),screenPoint=new DOMPoint(screen.x,screen.y).matrixTransform(matrix);
      const distance = Math.hypot(screenPoint.x-event.clientX,screenPoint.y-event.clientY);
      if (distance < nearest) { nearest = distance; point = q; snapTarget.current=route?{point:q,routeId:route.id}:null; }
    };
    // Snap to existing channels and keep external outlet endpoints outside the boundary.
    plan.routes.forEach((r) => r.points.slice(1).forEach((b, i) => snapToSegment(r.points[i], b,r)));
    if (!drawing.length) cadastre.boundaryPoints.forEach((a, i, points) => snapToSegment(a, points[(i + 1) % points.length]));
    return point;
  };
  const movePointer = (event) => {
    viewport.onPointerMove(event);
    if(!canPlacePoint){setConnectionHint(null);return;}
    const point = pointAtPointer(event);
    setConnectionHint(snapTarget.current);
    const line = previewLine.current;
    if (!line || event.pointerType === 'touch') return;
    if (!point) return;
    const end = transform.toSvg(point);
    // Update just the preview so mouse movement does not rerender the map.
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('visibility', 'visible');
    line.setAttribute('marker-end', downhill(drawing.at(-1),point) ? `url(#${arrow})` : '');
  };
  const patch = (next) => { setPlan(next); setDirty(true); setNotice(''); };
  const finishLine = () => {
    if (drawing?.length < 2) return;
    patch(normalizeDrainage({ ...plan, routes: [...plan.routes, { id: `drain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type, points: drawing, work: 0, blockage: 0 }] })||plan);
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
    <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:8}}>
      <CadastreDisplayControls />
      <div className="cadastre-design-display" role="group" aria-label="배수로 지도 설계 표시"><span>설계 표시</span><button type="button" aria-pressed={showPlantingRows} onClick={()=>setShowPlantingRows(value=>!value)}>식재 예정 열 <small>{showPlantingRows?'켜짐':'꺼짐'}</small></button></div>
    </div>
    
    <div className="cadastre-layout">
      <div className="cadastre-map-card">
        <div className="cadastre-map-card__grid" aria-hidden="true" />
        <div className="cadastre-editor__map-heading"><strong>{cadastre.parcelNo}</strong><span>{drawing ? '시작점부터 하류 방향으로 점을 찍으세요' : '점선: 설계 · 실선: 시공됨'}</span></div>
        <div className="cadastre-design-display" aria-label="배수로 종류 범례">{DRAINAGE_TYPES.filter(t=>DRAIN_VISUAL[t.key]).map(t=><span key={t.key} style={{display:'inline-flex',alignItems:'center',gap:5}}><svg width="28" height="14" aria-hidden="true"><DrainStroke points="2,7 26,7" type={t.key} complete/></svg>{t.name}</span>)}</div>
        {transform&&<CadastreMapToolbar viewport={viewport} label="배수로 지도" panMode={panMode} onPanModeChange={setPanMode}/>}
        {transform ? <svg ref={svg} className={`cadastre-editor__canvas ${drawing&&!panMode?'is-editing':'is-pannable'}`} viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)} aria-label="배수로 배치 지도"
          onPointerMove={movePointer}
          onContextMenu={(event) => {
            if (!drawing) return;
            event.preventDefault();
            setDrawing(null);
            previewLine.current?.setAttribute('visibility', 'hidden');
          }}
          onPointerLeave={() => {previewLine.current?.setAttribute('visibility', 'hidden');setConnectionHint(null);}}
          onClick={(event) => {
            if (!canPlacePoint) return;
            const point = pointAtPointer(event);
            if (point) {
              const next=[...drawing,point];
              if(snapTarget.current&&next.length>=2){
                patch({...plan,routes:[...plan.routes,{id:`drain-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,type,points:next,work:0,blockage:0}]});
                setDrawing(null);setConnectionHint(null);setNotice('기존 배수로에 연결했습니다. 설계 확정 시 경사와 배출구 연결을 검사합니다.');
              }else setDrawing(next);
            }
          }}>
          <defs><marker id={arrow} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#1976a5" /></marker></defs>
          <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent} />
          {showPlantingRows&&<g pointerEvents="none">{(plantingSource.rowSegments||[]).map((segment,index)=><polyline key={`segment-${index}`} points={pointsOf(segment)} fill="none" stroke="#43805b" strokeWidth="1.2" strokeDasharray="4 3" vectorEffect="non-scaling-stroke"/>)}{plantingSource.rows.map(row=><g key={`planting-${row.key}`}>{row.points.map((point,index)=>{const at=transform.toSvg(point);return <circle key={index} cx={at.x} cy={at.y} r=".16" fill="#43805b"/>})}<title>{row.name} · 식재 예정 {row.treeCount}주</title></g>)}</g>}
          <g pointerEvents="none" aria-label={`토지 하경사 방향 ${slopeBearingLabel(bearing)}`}>
            <line x1="50" y1="50" x2={50+Math.cos(bearing*Math.PI/180)*8} y2={50+Math.sin(bearing*Math.PI/180)*8} stroke="#a27724" strokeWidth=".45" markerEnd={`url(#${arrow})`} />
            <text x="50" y="47" textAnchor="middle" fontSize="1.8" fill="#805b18" stroke="#fffdf4" strokeWidth=".3" paintOrder="stroke">하경사 방향</text>
          </g>
          <defs><clipPath id={boundaryClip}><polygon points={pointsOf(cadastre.boundaryPoints)}/></clipPath></defs>
          <g clipPath={`url(#${boundaryClip})`}>
          {plan.routes.map(r=>{
            let remaining=Math.max(0,r.work),builtPoints=[r.points[0]];
            for(let i=1;i<r.points.length&&remaining>0;i++){const a=r.points[i-1],b=r.points[i],length=drainageLength([a,b]);if(remaining>=length){builtPoints.push(b);remaining-=length;}else{const t=remaining/length;builtPoints.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});remaining=0;}}
            const complete=r.work+.01>=drainageLength(r.points);
            return <g key={r.id}><DrainStroke points={pointsOf(r.points)} type={r.type}/>{builtPoints.length>1&&<DrainStroke points={pointsOf(builtPoints)} type={r.type} complete/>}<circle cx={transform.toSvg(r.points.at(-1)).x} cy={transform.toSvg(r.points.at(-1)).y} r=".3" fill={(DRAIN_VISUAL[r.type]||DRAIN_VISUAL.earth).color}><title>{DRAINAGE_TYPES.find(t=>t.key===r.type)?.name} · {complete?'완공':'설계'} · 시공 {r.work.toFixed(1)}m</title></circle></g>;
          })}
          {plan.routes.map(route=><g key={'flow-'+route.id} pointerEvents="none">{route.points.slice(1).map((b,i)=>{const a=route.points[i];if(!downhill(a,b))return null;const start=transform.toSvg(a),end=transform.toSvg(b),dx=end.x-start.x,dy=end.y-start.y,len=Math.hypot(dx,dy);if(len<.5)return null;const mx=(start.x+end.x)/2,my=(start.y+end.y)/2,half=Math.min(.8,len/4),offset=1.1,nx=-dy/len*offset,ny=dx/len*offset;return <line key={i} x1={mx+nx-dx/len*half} y1={my+ny-dy/len*half} x2={mx+nx+dx/len*half} y2={my+ny+dy/len*half} stroke="#1976a5" strokeWidth=".3" markerEnd={`url(#${arrow})`}><title>하경사 방향으로 흐름</title></line>})}</g>)}
          {lastPoint && <g pointerEvents="none" aria-hidden="true">
            <DrainStroke points={pointsOf(drawing)} type={type}/>
            {canPlacePoint && <line key={drawing.length} ref={previewLine} x1={lastPoint.x} y1={lastPoint.y} x2={lastPoint.x} y2={lastPoint.y}
              visibility="hidden" stroke={DRAIN_VISUAL[type].color} strokeWidth={DRAIN_VISUAL[type].width} strokeDasharray={DRAIN_VISUAL[type].dash} strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
            <circle cx={lastPoint.x} cy={lastPoint.y} r=".67" fill="#d78925" stroke="#fff9e9" strokeWidth=".24" />
          </g>}
          </g>
          <g pointerEvents="none" aria-label="경계 배출구">{boundaryOutlets.map(outlet=>{
            const at=transform.toSvg(outlet.point),from=transform.toSvg(outlet.from),dx=at.x-from.x,dy=at.y-from.y,length=Math.hypot(dx,dy)||1,size=.65/(viewport.zoomPercent/100),tail=Math.min(length,size*3);
            return <g key={outlet.key}><line x1={at.x-dx/length*tail} y1={at.y-dy/length*tail} x2={at.x} y2={at.y} stroke="#1976a5" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" clipPath={`url(#${boundaryClip})`}/><circle cx={at.x} cy={at.y} r={size} fill="#fffdf4" stroke="#1976a5" strokeWidth="1.7" vectorEffect="non-scaling-stroke"/><circle cx={at.x} cy={at.y} r={size*.4} fill="#1976a5"/><title>토지 경계 배출구 · 외부 배수 연결</title></g>;
          })}</g>
          {canPlacePoint&&connectionHint&&(()=>{const at=transform.toSvg(connectionHint.point),scale=100/viewport.zoomPercent;return <g pointerEvents="none" transform={`translate(${at.x} ${at.y}) scale(${scale})`}><circle r="1" fill="#fffdf4" stroke="#238b62" strokeWidth=".25"/><circle r=".35" fill="#238b62"/><rect x="1.5" y="-3.7" width="19" height="3" rx=".7" fill="#245c44"/><text x="2.3" y="-1.7" fontSize="1.4" fill="#fff">클릭 · 기존 배수로에 연결</text></g>})()}
        </svg> : <p>연결된 토지 경계가 필요합니다.</p>}
      </div>
      <aside className="cadastre-editor__tools">
        <div className="cadastre-setting-card">
          <h4>배수 기준</h4>
          <div className="cadastre-editor__metrics"><span>토지 면적</span><strong>{Number(field.py || 0).toLocaleString()}평</strong></div>
          <div className="cadastre-editor__metrics"><span>최소 길이</span><strong>{status.requirement.length}m</strong></div>
          <div aria-label="최소 배수로 길이 충족률">
            <div className="cadastre-editor__metrics"><span>설계 길이 충족률</span><strong>{Math.min(100,Math.round(plan.routes.filter(route=>!isBuried(route)).reduce((sum,route)=>sum+drainageLength(route.points),0)/status.requirement.length*100))}%</strong></div>
            <progress aria-label="설계 길이 충족률" max={status.requirement.length} value={Math.min(status.requirement.length,plan.routes.filter(route=>!isBuried(route)).reduce((sum,route)=>sum+drainageLength(route.points),0))} style={{width:'100%',accentColor:'#438765'}}/>
            <div className="cadastre-editor__metrics"><span>현재 시공된 배수로</span><strong>{constructedLength.toFixed(1)} / {status.requirement.length}m</strong></div>
            <progress aria-label="현재 시공된 배수로 길이" max={status.requirement.length} value={Math.min(status.requirement.length,constructedLength)} style={{width:'100%',accentColor:'#287ea8'}}/>
          </div>
          <div className="cadastre-editor__metrics"><span>완공 배출구</span><strong>{built?.outletCount || 0}/{status.requirement.outlets}개</strong></div>
          <div className="cadastre-editor__metrics"><span>토양 반영 배수 능력</span><strong>{((built?.capacity || 0) * soil.channel).toFixed(2)}/일</strong></div>
          <div className="drainage-tree-impact">
            <div><span className="drainage-tree-impact__label">배수로로 제외되는 예정 나무</span><strong>{excludedTreeCount.toLocaleString()}<span>주</span></strong></div>
            <p>식재 예정 {originalTreeCount.toLocaleString()}주 <span aria-hidden="true">→</span> 배수로 반영 {remainingTreeCount.toLocaleString()}주</p>
            <small>배수로 폭에 겹치는 식재 위치를 제외한 수입니다.</small>
          </div>
          <div className={`drainage-status ${built?.ready?'is-ready':'is-pending'}`} role="status">
            <span className="drainage-status__icon" aria-hidden="true">{built?.ready?'✓':'!'}</span>
            <div><strong>{built?.ready?'배수 기준 충족':Number(field.trees)>0&&!saved?'기존 농장 · 기준 유예':'배수 기준 미달'}</strong><p>{built?.ready?'완공된 배수로가 배출구까지 연결되었습니다.':Number(field.trees)>0&&!saved?'새 식재 전 배수 계획을 준비해 주세요.':'최소 길이와 배출구를 확보하고 시공해 주세요.'}</p></div>
            <span className="drainage-status__badge">{built?.ready?'충족':Number(field.trees)>0&&!saved?'유예':'미달'}</span>
          </div>
          <div className="drainage-slope-info">
            <span className="drainage-slope-info__compass" aria-hidden="true"><span style={{transform:`rotate(${bearing-90}deg)`}}>↓</span></span>
            <div><span className="drainage-slope-info__label">토지 하경사 방향</span><strong>{slopeBearingLabel(bearing)}</strong><span className="drainage-slope-info__hint">화살표 방향으로 물이 흐릅니다</span></div>
            <div className="drainage-slope-info__angle"><span>경사각</span><strong>{(Number(field.slopeDeg)||0).toLocaleString('ko-KR',{maximumFractionDigits:1})}°</strong></div>
          </div>
        </div>
        <div className="cadastre-setting-card">
          <div className="drainage-type-picker" role="group" aria-label="배수로 종류"><strong>배수로 종류</strong>{DRAINAGE_TYPES.filter(t=>!t.buried).map(t=><button className="drainage-type-picker__option" key={t.key} type="button" disabled={!editable||Boolean(drawing)} aria-pressed={type===t.key} onClick={()=>setType(t.key)}><img src={DRAIN_IMAGES[t.key]} alt=""/><span><strong>{t.name}</strong><small>{t.fixedSizeLabel}</small></span><span className="drainage-type-picker__check" aria-hidden="true">{type===t.key?'✓':'○'}</span></button>)}</div>
          <div className="cadastre-editor__metrics"><span>전문 외주</span><strong>{selectedType.price.toLocaleString()}원/m</strong></div>
          <small>{selectedType.desc}</small>
          <div className="cadastre-editor__metrics"><span>고정 규격</span><strong>{selectedType.fixedSizeLabel}</strong></div>
          <div className="cadastre-editor__metrics"><span>굴착 폭</span><strong>{Math.round(selectedType.width*100)}cm</strong></div>
          <div className="cadastre-editor__metrics"><span>식재 제외 폭 · 양옆 여유 포함</span><strong>{(selectedType.width+1).toFixed(1)}m</strong></div>
          <div className="cadastre-editor__metrics"><span>자가 시공 재료비</span><strong>{(selectedType.price * DRAINAGE_SELF_WORK_COST_FACTOR).toLocaleString()}원/m</strong></div>
          <small>자가 시공은 삽 또는 현재 토지에 주차한 내 굴삭기로 가능합니다. 삽 작업은 1m당 노동력 8로 굴삭기의 40배가 들며 연료는 사용하지 않습니다. 굴삭기는 노동력·연료·내구도를 사용합니다. 배출구 비용은 별도입니다.</small>
        </div>
        <div className="cadastre-editor__toolbar">{drawing ? <><button type="button" disabled={drawing.length < 2} onClick={finishLine}>선 그리기 완료</button><button type="button" disabled={!drawing.length} onClick={() => setDrawing(drawing.slice(0, -1))}>한 점 취소</button><button type="button" onClick={() => setDrawing(null)}>그리기 취소</button></> : <button type="button" className="cadastre-editor__command" disabled={!editable || plan.routes.length >= 64} onClick={() => setDrawing([])}>배수로 그리기</button>}</div>
        {plan.routes.map((r, i) => <div key={r.id} className="drainage-route-row"><span>{DRAINAGE_TYPES.find((t) => t.key === r.type)?.name} {i + 1} · {drainageLength(r.points).toFixed(1)}m<br />시공 {r.work.toFixed(1)}m · 막힘 {r.blockage.toFixed(0)}%{isBuried(r) && <><br />깊이 {r.depthStart} → {r.depthEnd}m · {r.envelope ? '추가 피복' : '기본 피복'}</>}</span><button type="button" disabled={!editable || r.work > 0 || Boolean(drawing)} onClick={() => patch({ ...plan, routes: plan.routes.filter((n) => n.id !== r.id) })}>계획 삭제</button></div>)}
        {status.error ? <p className="cadastre-editor__error" role="alert">{status.error}</p> : <small>설계 길이 {status.length.toFixed(1)}m · 수로 점유 약 {status.areaPy.toFixed(1)}평(외부 꼬리 포함)</small>}
        <div className="cadastre-editor__toolbar">
          <button type="button" className="cadastre-design-confirm" disabled={!editable || !dirty || Boolean(drawing) || Boolean(status.error)} onClick={act}>{saved&&!dirty&&!drawing?'확정완료':'설계 확정'}</button>
          {editable && onOpenWorkTab && hasPendingWork && !dirty && !drawing && <button type="button" className="cadastre-editor__command" onClick={() => onOpenWorkTab('facility')}>작업 탭에서 시공 방식 선택</button>}
        </div>
        {notice ? <p className="cadastre-editor__message" role="status">{notice}</p> : null}
      </aside>
    </div>
  </section>;
}
