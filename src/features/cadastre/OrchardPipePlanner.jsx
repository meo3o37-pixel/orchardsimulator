import useCadastreViewport from './useCadastreViewport';
import CadastreMapToolbar, {cadastreViewportEvents} from './CadastreMapToolbar';
import CadastreGround from './CadastreGround';
import CadastreTutorial from './CadastreTutorial';
import React,{useEffect,useMemo,useRef,useState}from'react';
import { cadastreEditorTransform } from './cultivationZones';
import { polygonBoundsFromPoints } from './cadastreData';
import { normalizeDrainage,analyzeDrainage,drainageLength } from './drainage';
import { orchardTreeRows,createOrchardPipeLayout } from './orchardPipeLayout';
import './OrchardPipePlanner.css';

export default function OrchardPipePlanner({selectedField:field,cadastre,zones=[],onDrainageAction,onOpenWorkTab,onSelectDesign,onLinkExistingTreeRows}){
 const source=useMemo(()=>orchardTreeRows(field),[field.cadastrePlantingPlans,field.trees]);
 const saved=useMemo(()=>normalizeDrainage(field.drainage),[field.drainage]);
 const [selected,setSelected]=useState([]),[surfaceId,setSurfaceId]=useState(''),[draft,setDraft]=useState(null),[notice,setNotice]=useState('');
 const initialized=useRef('');
 const svg=useRef(null);
 const surfaces=(saved?.routes||[]).filter(r=>!['pipe100','pipe150'].includes(r.type));
 const pipes=(saved?.routes||[]).filter(r=>['pipe100','pipe150'].includes(r.type));
 const sourceKey=JSON.stringify(source.rows.map(r=>[r.key,r.treeCount]));
 useEffect(()=>{if(initialized.current===`${field.id}:${sourceKey}`)return;initialized.current=`${field.id}:${sourceKey}`;setSelected(source.rows.filter(r=>r.treeCount>=2&&!pipes.some(p=>p.rowKey===r.key&&p.work>0)).map(r=>r.key));setDraft(null);},[field.id,sourceKey]);
 useEffect(()=>{if(!surfaces.some(s=>s.id===surfaceId))setSurfaceId(surfaces[0]?.id||'');},[field.drainage,surfaceId]);
 const bounds=polygonBoundsFromPoints(cadastre.boundaryPoints);
 const transform=useMemo(()=>bounds?cadastreEditorTransform([{x:bounds.minX-.008,y:bounds.minY-.008},{x:bounds.maxX+.008,y:bounds.maxY+.008}]):null,[cadastre.boundaryPoints]);
 const viewport=useCadastreViewport(svg,Boolean(transform),true);
 const pointsOf=points=>points.map(p=>{const q=transform.toSvg(p);return`${q.x},${q.y}`}).join(' ');
 const plan=draft?{version:1,bearing:field.slopeBearing??saved?.bearing??90,slopeDeg:field.slopeDeg,boundary:cadastre.boundaryPoints,boundaryId:cadastre.boundaryContourId,routes:[...surfaces,...draft]}:saved;
 const status=useMemo(()=>analyzeDrainage(plan,field.py,field),[plan,field.py,field.soilComposition,field.slopeDeg]);
 const visiblePipes=draft||pipes;
 const generate=()=>{const r=createOrchardPipeLayout(field,selected,surfaceId,cadastre.boundaryPoints,field.slopeBearing??saved?.bearing??90);if(!r.ok){setNotice(r.message);return;}setDraft(r.routes);setNotice('선택한 나무 열 아래에 유공관을 배치했습니다.');};
 const save=()=>{if(!draft||status.error)return;const r=onDrainageAction?.({kind:'save',scope:'pipes',plan:{...plan,routes:draft}});setNotice(r?.message||'계획을 저장하지 못했습니다.');if(r?.ok)setDraft(null);};
 const link=()=>{if(!window.confirm(`기존 ${source.total}주의 위치를 재배구역의 식재 설계 좌표에 연결할까요?\n설계 주수·품종이 일치해야 하며 나무 수·수령·재고는 변경되지 않습니다.`))return;const r=onLinkExistingTreeRows?.();setNotice(r?.message||'식재 위치를 연결하지 못했습니다.');};
 return <section className="action-section cadastre-panel cadastre-editor orchard-pipe-planner" aria-label="나무 열 유공관 매설 설계">
  <CadastreTutorial topic="pipes" />
  <div className="cadastre-layout"><div className="cadastre-map-card"><div className="cadastre-map-card__grid" aria-hidden="true"/>
   <div className="cadastre-editor__map-heading"><strong>{cadastre.parcelNo}</strong><span>초록 점: 나무 · 보라 선: 유공관</span></div>
   {transform&&<CadastreMapToolbar viewport={viewport} label="유공관 지도"/>}
   {transform&&<svg ref={svg} className="cadastre-editor__canvas is-pannable" viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)} role="img" aria-label="나무 열 아래 유공관 배치 지도">
    <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent} />
    {surfaces.map(r=><polyline key={r.id} points={pointsOf(r.points)} fill="none" stroke="#5598b6" strokeWidth=".7"/>)}
    {source.rows.map(row=><g key={row.key}><polyline points={pointsOf(row.points)} fill="none" stroke="#67926b" strokeWidth=".3" strokeDasharray=".7 .7"/><path d={row.points.map(p=>{const q=transform.toSvg(p);return`M${q.x-.15},${q.y}h.3`}).join(' ')} fill="none" stroke="#386f43" strokeWidth=".5" strokeLinecap="round"/></g>)}
    {visiblePipes.map(r=><polyline key={r.id} points={pointsOf(r.points)} fill="none" stroke={r.type==='pipe100'?'#825ba7':'#a089b3'} strokeWidth={r.type==='pipe100'?'.65':'.9'} strokeOpacity=".8" strokeDasharray={r.work+.01>=drainageLength(r.points)?undefined:'1 .6'}/>)}
   </svg>}
  </div><aside className="cadastre-editor__tools">
   <div className="cadastre-editor__metrics"><span>실제 나무</span><strong>{source.total}주</strong></div><div className="cadastre-editor__metrics"><span>위치가 연결된 나무</span><strong>{source.mapped}주 · {source.rows.length}열</strong></div>
   {!source.aligned&&<><p className="cadastre-editor__error">{source.total?'나무의 실제 열 위치를 먼저 연결해 주세요.':'식재 후 나무 열을 기준으로 매설할 수 있습니다.'}</p>{onSelectDesign&&<button type="button" onClick={()=>onSelectDesign('farm')}>재배구역·식재 설계로 이동</button>}{source.total>0&&onLinkExistingTreeRows&&<button type="button" disabled={!zones.some(z=>z.planting?.variety)} onClick={link}>기존 식재 위치 연결</button>}</>}
   <label className="cadastre-editor__rootstock"><span>물을 받을 배수로</span><select value={surfaceId} onChange={e=>{setSurfaceId(e.target.value);setDraft(null)}}><option value="">배수로 선택</option>{surfaces.map((r,i)=><option key={r.id} value={r.id}>배수로 {i+1} · {drainageLength(r.points).toFixed(1)}m</option>)}</select></label>
   {!surfaces.length&&onSelectDesign&&<button type="button" onClick={()=>onSelectDesign('drainage')}>배수로 먼저 설계하기</button>}
   <div className="orchard-pipe-planner__row-heading"><h4>매설할 나무 열</h4><button type="button" disabled={!source.aligned} onClick={()=>{setSelected(selected.length?[]:source.rows.filter(r=>r.treeCount>=2&&!pipes.some(p=>p.rowKey===r.key&&p.work>0)).map(r=>r.key));setDraft(null)}}>{selected.length?'선택 해제':'전체 선택'}</button></div>
   <div className="orchard-pipe-planner__rows">{source.rows.map(row=>{const worked=pipes.find(r=>r.rowKey===row.key&&r.work>0);return<label key={row.key}><input type="checkbox" disabled={!source.aligned||row.treeCount<2||Boolean(worked)} checked={selected.includes(row.key)} onChange={e=>{setSelected(e.target.checked?[...selected,row.key]:selected.filter(k=>k!==row.key));setDraft(null)}}/><span>{row.name}<small>{row.treeCount}주{worked?` · ${worked.work.toFixed(1)}m 매설`:''}</small></span></label>})}</div>
   <button type="button" disabled={!field.owned||!source.aligned||!selected.length||!surfaceId} onClick={generate}>선택한 열 아래로 관로 생성</button>
   <div className="cadastre-editor__metrics"><span>유공관·집수관 총 길이</span><strong>{visiblePipes.reduce((s,r)=>s+drainageLength(r.points),0).toFixed(1)}m</strong></div>
   <div className="cadastre-editor__metrics"><span>완공 보호 면적</span><strong>{((draft?analyzeDrainage(saved,field.py,field):status).pipeCoverage*100).toFixed(0)}%</strong></div>
   {draft&&status.error&&<p className="cadastre-editor__error" role="alert">{status.error}</p>}
   <div className="cadastre-editor__toolbar"><button type="button" disabled={!draft||Boolean(status.error)} onClick={save}>유공관 계획 확정</button><button type="button" disabled={!draft} onClick={()=>{setDraft(null);setNotice('')}}>변경 취소</button></div>
   {notice&&<p className="cadastre-editor__message" role="status">{notice}</p>}
   {onOpenWorkTab&&pipes.length>0&&<button type="button" disabled={Boolean(draft)} onClick={()=>onOpenWorkTab('facility')}>작업 탭에서 유공관 매설</button>}
  </aside></div>
 </section>;
}
