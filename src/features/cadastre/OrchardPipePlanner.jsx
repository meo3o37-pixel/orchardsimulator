import useCadastreViewport from './useCadastreViewport';
import CadastreMapToolbar, {cadastreViewportEvents} from './CadastreMapToolbar';
import {DrainStroke} from './DesignRouteStroke';
import CadastreGround from './CadastreGround';
import CadastreDisplayControls from './CadastreDisplayControls';
import CadastreTutorial from './CadastreTutorial';
import React,{useEffect,useId,useMemo,useRef,useState}from'react';
import {createPortal} from 'react-dom';
import { cadastreEditorTransform } from './cultivationZones';
import { polygonBoundsFromPoints } from './cadastreData';
import { normalizeDrainage,analyzeDrainage,drainageLength,drainageFootprintPaths } from './drainage';
import { orchardPipeRows,createOrchardPipeLayout,underRowPoints } from './orchardPipeLayout';
import { infrastructureSource } from './orchardInfrastructure';
import './OrchardPipePlanner.css';
import pipe100Image from '../../assets/images/아이템/소모성도구/HDPE유공관100mm6m.png';
import pipe150Image from '../../assets/images/아이템/소모성도구/HDPE유공관150mm6m.png';
import {routeDepthAt,pipeGradeError,junctionDepthOK} from './pipeSystem';

export default function OrchardPipePlanner({selectedField:field,cadastre,zones=[],onDrainageAction,onOpenWorkTab,onSelectDesign,onLinkExistingTreeRows}){
 const source=useMemo(()=>orchardPipeRows(field),[field.cadastrePlantingPlans,field.trees]);
 const saved=useMemo(()=>normalizeDrainage(field.drainage),[field.drainage]);
 const [selected,setSelected]=useState([]),[surfaceId,setSurfaceId]=useState(''),[draft,setDraft]=useState(null),[notice,setNotice]=useState(''),[linkConfirmOpen,setLinkConfirmOpen]=useState(false);
 const linkCancelRef=useRef(null),linkTriggerRef=useRef(null);
 const [showDrainage,setShowDrainage]=useState(true);
 const [showTreeRows,setShowTreeRows]=useState(true);
 const [showPipes,setShowPipes]=useState(true);
 const [pipeType,setPipeType]=useState(()=>field.drainage?.routes?.find(route=>route.rowKey)?.type||'pipe100');
 const [manualRow,setManualRow]=useState(null),[manualTarget,setManualTarget]=useState(null);
 const plannedPlanting=useMemo(()=>infrastructureSource(field,zones,cadastre.boundaryPoints),[field,zones,cadastre.boundaryPoints]);
 const plannedTreeCount=plannedPlanting.rows.reduce((total,row)=>total+row.treeCount,0);
 const drainageClipId=`pipe-drainage-${useId().replaceAll(':','')}`;
 const plantingMaskId=`${drainageClipId}-planting`;
 const plantingExclusions=useMemo(()=>drainageFootprintPaths((saved?.routes||[]).filter(route=>!['pipe100','pipe150'].includes(route.type)),'planting'),[saved]);
 useEffect(()=>{if(!linkConfirmOpen)return;linkCancelRef.current?.focus();const onKeyDown=e=>{if(e.key==='Escape'){e.preventDefault();setLinkConfirmOpen(false)}if(e.key==='Tab'){const buttons=[...document.querySelectorAll('.orchard-pipe-planner__confirm button')];if(!buttons.length)return;const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};document.addEventListener('keydown',onKeyDown);return()=>{document.removeEventListener('keydown',onKeyDown);linkTriggerRef.current?.focus()}},[linkConfirmOpen]);
 const initialized=useRef('');
 const svg=useRef(null);
 const surfaces=(saved?.routes||[]).filter(r=>!['pipe100','pipe150'].includes(r.type));
 const pipes=(saved?.routes||[]).filter(r=>['pipe100','pipe150'].includes(r.type));
 const sourceKey=JSON.stringify(source.rows.map(r=>[r.key,r.treeCount]));
 useEffect(()=>{if(initialized.current===`${field.id}:${sourceKey}`)return;initialized.current=`${field.id}:${sourceKey}`;setSelected(pipes.some(p=>p.rowKey)?pipes.filter(p=>p.rowKey&&!p.work).map(p=>p.rowKey):source.rows.filter(r=>r.treeCount>=2).map(r=>r.key));setDraft(null);},[field.id,sourceKey]);
 useEffect(()=>{if(!surfaces.some(s=>s.id===surfaceId))setSurfaceId(surfaces[0]?.id||'');},[field.drainage,surfaceId]);
 const bounds=polygonBoundsFromPoints(cadastre.boundaryPoints);
 const transform=useMemo(()=>bounds?cadastreEditorTransform([{x:bounds.minX-.008,y:bounds.minY-.008},{x:bounds.maxX+.008,y:bounds.maxY+.008}]):null,[cadastre.boundaryPoints]);
 const viewport=useCadastreViewport(svg,Boolean(transform),true);
 const pointsOf=points=>points.map(p=>{const q=transform.toSvg(p);return`${q.x},${q.y}`}).join(' ');
 const plan=draft?{version:1,bearing:field.slopeBearing??saved?.bearing??90,slopeDeg:field.slopeDeg,boundary:cadastre.boundaryPoints,boundaryId:cadastre.boundaryContourId,routes:[...surfaces,...draft]}:saved;
 const status=useMemo(()=>analyzeDrainage(plan,field.py,field),[plan,field.py,field.soilComposition,field.slopeDeg]);
 const autoPreview=useMemo(()=>{
  const savedRows=pipes.filter(route=>route.rowKey),pendingSavedRows=savedRows.filter(route=>!route.work);
  const sameSelection=pendingSavedRows.length===selected.length&&pendingSavedRows.every(route=>selected.includes(route.rowKey)&&route.type===pipeType);
  if(savedRows.length&&sameSelection)return {ok:true,routes:pipes};
  return source.aligned&&selected.length&&surfaceId?createOrchardPipeLayout(field,selected,surfaceId,cadastre.boundaryPoints,field.slopeBearing??saved?.bearing??90,pipeType):null;
 },[field,source.aligned,selected,surfaceId,cadastre.boundaryPoints,saved?.bearing,pipeType]);
 useEffect(()=>{if(autoPreview?.ok)setDraft(autoPreview.routes);else setDraft(null);},[autoPreview]);
 const selectedPipeSketch=useMemo(()=>source.rows.filter(row=>selected.includes(row.key)&&row.points.length>=2).map(row=>({id:`preview-${row.key}`,rowKey:row.key,type:pipeType,points:underRowPoints(row,field.slopeBearing??saved?.bearing??90),depthStart:.6,depthEnd:.8,work:0,blockage:0})),[source.rows,selected,pipeType,field.slopeBearing,saved?.bearing]);
 const visiblePipes=draft||(autoPreview?.ok?autoPreview.routes:[...pipes,...selectedPipeSketch.filter(row=>!pipes.some(pipe=>pipe.rowKey===row.rowKey))]);
 const pipeDesignSignature=routes=>JSON.stringify(routes.map(route=>({id:route.id,type:route.type,rowKey:route.rowKey||'',points:route.points,depthStart:route.depthStart,depthEnd:route.depthEnd,envelope:Boolean(route.envelope)})).sort((a,b)=>a.id.localeCompare(b.id)));
 const designConfirmed=pipes.length>0&&pipeDesignSignature(draft||pipes)===pipeDesignSignature(pipes);
 const connectionStatus=useMemo(()=>analyzeDrainage({version:1,bearing:field.slopeBearing??saved?.bearing??90,slopeDeg:field.slopeDeg,boundary:cadastre.boundaryPoints,routes:[...surfaces,...visiblePipes]},field.py,field),[field,saved,visiblePipes,cadastre.boundaryPoints]);
 const connectedPipeIds=useMemo(()=>new Set(connectionStatus.connectedRouteIds||[]),[connectionStatus]);
 const findManualTarget=event=>{
  const matrix=svg.current?.getScreenCTM();if(!manualRow||!matrix)return null;
  const pos=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()),point=transform.toWorld(pos);
  let best=null,limit=14;
  for(const route of [...surfaces,...visiblePipes].filter(r=>r.rowKey!==manualRow&&!r.id.startsWith(`tree-link:${manualRow}`)))route.points.slice(1).forEach((b,i)=>{
   const a=route.points[i],dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/den)):0,p={x:a.x+dx*t,y:a.y+dy*t},at=transform.toSvg(p),screen=new DOMPoint(at.x,at.y).matrixTransform(matrix),gap=Math.hypot(screen.x-event.clientX,screen.y-event.clientY);
   if(gap<limit){limit=gap;best={point:p,route,segment:i,t};}
  });return best;
 };
 const connectManual=event=>{
  if(!manualRow)return;const target=findManualTarget(event),start=visiblePipes.find(r=>r.rowKey===manualRow);
  if(!target||!start)return;
  const a=start.points.at(-1),b=target.point,length=Math.hypot(a.x-b.x,a.y-b.y)*1000;
  if(length<1){setNotice('연결관 길이는 1m 이상이어야 합니다. 다른 지점을 선택해 주세요.');return;}
  const link={id:`tree-link:${manualRow}:${Date.now()}`,type:'pipe150',points:[a,b],depthStart:start.depthEnd,depthEnd:routeDepthAt(target.route,target.segment,target.t),envelope:true,work:0,blockage:0};
  const bearing=(field.slopeBearing??saved?.bearing??90)*Math.PI/180,slope=Math.tan((field.slopeDeg||0)*Math.PI/180);
  const requiredEnd=(from,to,depth)=>depth+Math.hypot(to.x-from.x,to.y-from.y)*1000*.002-((to.x-from.x)*Math.cos(bearing)+(to.y-from.y)*Math.sin(bearing))*1000*slope+.001;
  const adjusted=visiblePipes.map(route=>({...route}));
  const required=requiredEnd(a,b,link.depthStart);
  if(required>link.depthEnd&&target.route.rowKey&&((b.x-a.x)*Math.cos(bearing)+(b.y-a.y)*Math.sin(bearing))<=.00005){
   const receiving=adjusted.find(route=>route.id===target.route.id),delta=required-link.depthEnd;
   if(receiving.work>0){setNotice('이미 시공된 관의 깊이는 변경할 수 없습니다. 미시공 관이나 다른 지점을 선택해 주세요.');return;}
   receiving.depthStart+=delta;receiving.depthEnd+=delta;link.depthEnd=required;
   // Propagate the deeper invert through existing downstream connections.
   for(let pass=0;pass<adjusted.length;pass++){
    let changed=false;
    for(const upstream of adjusted)for(const downstream of adjusted){
     if(upstream.id===downstream.id)continue;
     const end=upstream.points.at(-1);
     for(let i=1;i<downstream.points.length;i++){
      const c=downstream.points[i-1],d=downstream.points[i],dx=d.x-c.x,dy=d.y-c.y,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((end.x-c.x)*dx+(end.y-c.y)*dy)/den)):0;
      if(Math.hypot(end.x-c.x-dx*t,end.y-c.y-dy*t)*1000>.05)continue;
      const extra=upstream.depthEnd-routeDepthAt(downstream,i-1,t);
      if(extra>.00001){if(downstream.work>0){setNotice('하류에 이미 시공된 관이 있어 깊이를 조정할 수 없습니다.');return;}downstream.depthStart+=extra;downstream.depthEnd+=extra;changed=true;}
     }
    }if(!changed)break;
   }
   if(adjusted.some(route=>route.depthEnd>1.8||route.depthStart>1.8)){setNotice('자동 깊이 조정 시 최대 매설 깊이 1.8m를 초과합니다. 더 가까운 지점을 선택해 주세요.');return;}
   if(adjusted.some(route=>surfaces.some(surface=>junctionDepthOK(visiblePipes.find(old=>old.id===route.id),surface)&&!junctionDepthOK(route,surface)))){setNotice('깊이 조정 후 배수로보다 관이 낮아집니다. 다른 연결 지점을 선택해 주세요.');return;}
  }
  const error=pipeGradeError(link,field.slopeBearing??saved?.bearing??90,field.slopeDeg||0);
  if(error){setNotice(error);return;}
  setDraft([...adjusted,link]);setManualRow(null);setManualTarget(null);setNotice('관 깊이와 하류 구배를 맞춰 연결했습니다. 설계 확정을 눌러 저장해 주세요.');
 };
 const save=()=>{if(!draft||status.error)return;const r=onDrainageAction?.({kind:'save',scope:'pipes',plan:{...plan,routes:draft}});setNotice(r?.message||'계획을 저장하지 못했습니다.');if(r?.ok)setDraft(null);};
 const link=()=>{setLinkConfirmOpen(false);const r=onLinkExistingTreeRows?.();setNotice(r?.message||'식재 위치를 연결하지 못했습니다.');};
 return <section className="action-section cadastre-panel cadastre-editor orchard-pipe-planner" aria-label="나무 열 유공관 매설 설계">
  <CadastreTutorial topic="pipes" />
  <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:8}}>
  <CadastreDisplayControls />
  <div className="cadastre-design-display" role="group" aria-label="유공관 지도 설계 표시"><span>설계 표시</span><button type="button" aria-pressed={showDrainage} onClick={()=>setShowDrainage(value=>!value)}>배수로 <small>{showDrainage?'켜짐':'꺼짐'}</small></button></div>
  <div className="cadastre-design-display" role="group" aria-label="식재 열 표시"><button type="button" aria-pressed={showTreeRows} onClick={()=>{const next=!showTreeRows;setShowTreeRows(next)}}>식재 열 <small>{showTreeRows?'켜짐':'꺼짐'}</small></button>{showTreeRows&&<span>{plannedTreeCount.toLocaleString()}주 · {plannedPlanting.rows.length}열</span>}<button type="button" aria-pressed={showPipes} onClick={()=>setShowPipes(value=>!value)}>유공관 <small>{showPipes?'켜짐':'꺼짐'}</small></button></div>
  </div>
  <div className="cadastre-layout"><div className="cadastre-map-card"><div className="cadastre-map-card__grid" aria-hidden="true"/>
   <div className="cadastre-editor__map-heading"><strong>{cadastre.parcelNo}</strong><span>초록 점: 나무 · 보라 선: 유공관</span></div>
   {transform&&<CadastreMapToolbar viewport={viewport} label="유공관 지도"/>}
   {transform&&<svg ref={svg} className={`cadastre-editor__canvas ${manualRow?'is-editing':'is-pannable'}`} viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)} onClick={connectManual} onPointerMove={event=>{viewport.onPointerMove(event);if(manualRow)setManualTarget(findManualTarget(event));}} onPointerLeave={()=>setManualTarget(null)} onContextMenu={event=>{if(manualRow){event.preventDefault();setManualRow(null);setManualTarget(null);}}} role="img" aria-label="나무 열 아래 유공관 배치 지도">
    <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent} />
    <defs><clipPath id={drainageClipId}><polygon points={pointsOf(cadastre.boundaryPoints)}/></clipPath><mask id={plantingMaskId} maskUnits="userSpaceOnUse" x="-1000" y="-1000" width="2000" height="2000" style={{maskType:'luminance'}}><rect x="-1000" y="-1000" width="2000" height="2000" fill="white"/>{plantingExclusions.map((polygon,index)=><polygon key={index} points={pointsOf(polygon)} fill="black"/>)}</mask></defs>
    <g clipPath={`url(#${drainageClipId})`}>{showDrainage&&surfaces.map(r=><DrainStroke key={r.id} points={pointsOf(r.points)} type={r.type} complete={r.work+.01>=drainageLength(r.points)}/>)}</g>
    {showTreeRows&&<g mask={`url(#${plantingMaskId})`} pointerEvents="none">{(plannedPlanting.rowSegments||[]).map((segment,index)=><polyline key={index} points={pointsOf(segment)} fill="none" stroke="#67926b" strokeWidth="1" strokeOpacity=".65" vectorEffect="non-scaling-stroke"/>)}{plannedPlanting.rows.flatMap(row=>row.points.map((point,index)=>{const at=transform.toSvg(point);return <circle key={`${row.key}-${index}`} cx={at.x} cy={at.y} r={Math.min(.23,1.2/Math.sqrt(viewport.zoomPercent/100))} fill="#43805b"/>}))}</g>}
    {showPipes&&visiblePipes.map(r=><DrainStroke key={r.id} points={pointsOf(r.points)} type={r.type} complete={r.work+.01>=drainageLength(r.points)}/>)}
    {showPipes&&visiblePipes.filter(route=>route.id.startsWith('tree-link:')).map(route=>{const at=transform.toSvg(route.points.at(-1));return <g key={`junction-${route.id}`} pointerEvents="none"><circle cx={at.x} cy={at.y} r={.55*100/viewport.zoomPercent} fill="#fffdf8" stroke="#8646bf" strokeWidth="2" vectorEffect="non-scaling-stroke"/><title>배수로 연결 지점</title></g>})}
    {manualRow&&(()=>{const start=visiblePipes.find(r=>r.rowKey===manualRow),at=start&&transform.toSvg(start.points.at(-1)),end=manualTarget&&transform.toSvg(manualTarget.point),radius=.6*100/viewport.zoomPercent;return at&&<g pointerEvents="none"><circle cx={at.x} cy={at.y} r={radius} fill="#fff" stroke="#8646bf" strokeWidth="2" vectorEffect="non-scaling-stroke"/>{end&&<><line x1={at.x} y1={at.y} x2={end.x} y2={end.y} stroke="#b486d6" strokeWidth="2" strokeDasharray="5 4" vectorEffect="non-scaling-stroke"/><circle cx={end.x} cy={end.y} r={radius} fill="#e9f6ed" stroke="#43805b" strokeWidth="2" vectorEffect="non-scaling-stroke"/></>}</g>})()}
   </svg>}
  </div><aside className="cadastre-editor__tools">
   <div className="cadastre-setting-card">
    <div className="cadastre-editor__metrics"><span>식재 설계 나무</span><strong>{source.total}주</strong></div>
    <div className="cadastre-editor__metrics"><span>관로 기준 나무 열</span><strong>{source.mapped}주 · {source.rows.length}열</strong></div>
   </div>
   {!source.aligned&&<><p className="cadastre-editor__error">{source.total?'나무의 실제 열 위치를 먼저 연결해 주세요.':'식재 전에 식재 열 설계를 확정하면 예정 열 아래에 매설할 수 있습니다.'}</p>{onSelectDesign&&<button type="button" onClick={()=>onSelectDesign('farm')}>재배구역·식재 설계로 이동</button>}{source.total>0&&onLinkExistingTreeRows&&<button type="button" ref={linkTriggerRef} disabled={!zones.some(z=>z.planting?.variety)} onClick={()=>setLinkConfirmOpen(true)}>기존 식재 위치 연결</button>}</>}
   <div className="cadastre-setting-card pipe-size-picker" role="group" aria-label="유공관 규격"><strong>유공관 규격</strong>{[{key:'pipe100',label:'100mm · 경제형',capacity:3,image:pipe100Image},{key:'pipe150',label:'150mm · 대용량',capacity:7,image:pipe150Image}].map(option=><button type="button" key={option.key} className="pipe-size-picker__option" aria-pressed={pipeType===option.key} onClick={()=>{setPipeType(option.key);setDraft(null)}}><img src={option.image} alt=""/><span><strong>{option.label}</strong><small>배수 능력 {option.capacity}</small></span><span aria-hidden="true">{pipeType===option.key?'✓':'○'}</span></button>)}<small>토양과 경사에 맞춰 자유롭게 선택하세요. 150mm는 비용과 운반 중량이 더 큽니다. 열별 관로를 만든 뒤 가까운 배수로 지점에 잇기를 눌러 연결하세요.</small></div>
   <label className="cadastre-editor__rootstock"><span>물을 받을 배수로</span><select value={surfaceId} onChange={e=>{setSurfaceId(e.target.value);setDraft(null)}}><option value="">배수로 선택</option>{surfaces.map((r,i)=><option key={r.id} value={r.id}>배수로 {i+1} · {drainageLength(r.points).toFixed(1)}m</option>)}</select></label>
   {!surfaces.length&&onSelectDesign&&<button type="button" onClick={()=>onSelectDesign('drainage')}>배수로 먼저 설계하기</button>}
   {showPipes&&(!visiblePipes.length||autoPreview?.ok===false)&&<p role="status">{autoPreview?.message||(!source.aligned?'식재 열 설계를 먼저 확정해 주세요.':!surfaceId?'물을 받을 배수로를 선택하면 유공관을 연결합니다.':'표시할 나무 열을 선택해 주세요.')}{autoPreview?.ok===false&&' 선택한 열의 보라색 선은 연결 전 위치 미리보기입니다.'}</p>}
   <div className="orchard-pipe-planner__row-heading"><h4>매설할 나무 열</h4><button type="button" disabled={!source.aligned} onClick={()=>{setSelected(selected.length?[]:source.rows.filter(r=>r.treeCount>=2&&!pipes.some(p=>p.rowKey===r.key&&p.work>0)).map(r=>r.key));setDraft(null)}}>{selected.length?'선택 해제':'전체 선택'}</button></div>
   <div className="orchard-pipe-planner__rows">{source.rows.map(row=>{const pipe=visiblePipes.find(p=>p.rowKey===row.key),connected=Boolean(pipe&&connectedPipeIds.has(pipe.id)),worked=pipes.find(r=>r.rowKey===row.key&&r.work>0);return<label key={row.key}><input type="checkbox" disabled={!source.aligned||row.treeCount<2||Boolean(worked)} checked={selected.includes(row.key)} onChange={e=>{setSelected(e.target.checked?[...selected,row.key]:selected.filter(k=>k!==row.key));setDraft(null)}}/><span>{row.name}<small>{row.treeCount}주{worked?` · ${worked.work.toFixed(1)}m 매설`:''}</small></span><button type="button" onClick={event=>{event.preventDefault();event.stopPropagation();if(connected&&pipe){const links=visiblePipes.filter(route=>route.id.startsWith(`tree-link:${row.key}:`)||route.id===`tree-link:${row.key}`);if(links.some(route=>route.work>0)){setNotice('이미 시공된 연결관은 취소할 수 없습니다.');return;}if(!links.length){setNotice('이 열은 다른 관로를 통해 연결되어 있습니다. 직접 연결한 열에서 연결을 취소해 주세요.');return;}setDraft(visiblePipes.filter(route=>!links.includes(route)));setManualRow(null);setManualTarget(null);setNotice(`${row.name}의 연결을 취소했습니다.`);return;}if(pipe){setManualRow(row.key);setManualTarget(null);setNotice(`${row.name}: 연결할 배수로나 다른 열 유공관을 클릭하세요. 오른쪽 클릭으로 취소합니다.`);}}} className={`pipe-connection-badge ${connected?'is-connected':pipe?'is-checking':'is-missing'}`} title={connected?'클릭하면 이 열의 미시공 연결을 취소합니다':pipe?connectionStatus.error||'배수로까지 연결이 필요합니다.':'관로를 생성하면 연결 상태를 확인합니다'}>{connected?'✓ 배수로 연결 완료':pipe?'! 배수로 연결 확인 필요':'○ 미연결'}</button></label>})}</div>
   <button type="button" disabled={!field.owned||!source.aligned||!selected.length||!surfaceId} onClick={()=>{const result=createOrchardPipeLayout(field,selected,surfaceId,cadastre.boundaryPoints,field.slopeBearing??saved?.bearing??90,pipeType,true);if(!result.ok){setNotice(result.message);return;}setDraft(result.routes);setNotice('선택한 배수로의 가까운 지점에 집수관을 연결했습니다. 설계 확정을 눌러 저장해 주세요.');}}>가까운 배수로 지점에 잇기</button>
   <div className="cadastre-setting-card">
    <div className="cadastre-editor__metrics"><span>유공관·집수관 총 길이</span><strong>{visiblePipes.reduce((s,r)=>s+drainageLength(r.points),0).toFixed(1)}m</strong></div>
    <div className="cadastre-editor__metrics"><span>완공 보호 면적</span><strong>{((draft?analyzeDrainage(saved,field.py,field):status).pipeCoverage*100).toFixed(0)}%</strong></div>
   </div>
   {draft&&status.error&&visiblePipes.some(pipe=>pipe.rowKey&&!connectedPipeIds.has(pipe.id))&&<div className="pipe-unconnected-warning" role="alert"><div className="pipe-unconnected-warning__heading"><span aria-hidden="true">!</span><strong>배수로 연결 확인</strong><b>{visiblePipes.filter(pipe=>pipe.rowKey&&!connectedPipeIds.has(pipe.id)).length}열 미완료</b></div><p>{status.error}</p><div className="pipe-unconnected-warning__rows">{source.rows.filter(row=>visiblePipes.some(pipe=>pipe.rowKey===row.key&&!connectedPipeIds.has(pipe.id))).map(row=><button type="button" key={row.key} onClick={()=>{setManualRow(row.key);setManualTarget(null);setNotice(`${row.name}: 지도에서 연결할 배수로나 다른 유공관을 클릭하세요.`);svg.current?.scrollIntoView({block:'nearest'});}}>{row.name}<span aria-hidden="true"> ↗</span></button>)}</div><small>열 이름을 누르면 지도에서 수동 연결할 수 있습니다.</small></div>}
   {draft&&status.error&&!visiblePipes.some(pipe=>pipe.rowKey&&!connectedPipeIds.has(pipe.id))&&!designConfirmed&&<p className="cadastre-editor__error" role="alert">설계 확정 불가: {status.error}</p>}
   <div className="cadastre-editor__toolbar"><button type="button" className="cadastre-design-confirm" disabled={designConfirmed||!draft||Boolean(status.error)} onClick={save}>{designConfirmed?'확정완료':'유공관 계획 확정'}</button></div>
   {notice&&<p className="cadastre-editor__message" role="status">{notice}</p>}
   {onOpenWorkTab&&pipes.length>0&&<button type="button" disabled={Boolean(draft)&&!designConfirmed} onClick={()=>onOpenWorkTab('facility')}>작업 탭에서 유공관 매설</button>}
  </aside></div>
  {linkConfirmOpen&&createPortal(<><div className="confirm-modal-backdrop orchard-pipe-planner__confirm-backdrop" onClick={()=>setLinkConfirmOpen(false)}/><div className="confirm-modal orchard-pipe-planner__confirm" role="dialog" aria-modal="true" aria-labelledby="orchard-pipe-link-title" aria-describedby="orchard-pipe-link-desc"><div className="confirm-modal__title" id="orchard-pipe-link-title">기존 식재 위치 연결</div><div className="confirm-modal__desc" id="orchard-pipe-link-desc">기존 {source.total}주의 위치를 재배구역의 식재 설계 좌표에 연결할까요?<br/>설계 주수·품종이 일치해야 하며 나무 수·수령·재고는 변경되지 않습니다.</div><div className="footer-actions"><button type="button" className="button button--ghost" ref={linkCancelRef} onClick={()=>setLinkConfirmOpen(false)}>취소</button><button type="button" className="button button--primary" onClick={link}>위치 연결</button></div></div></>,document.body)}
 </section>;
}
