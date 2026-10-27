import React,{useMemo,useRef,useState,useEffect}from'react';
import CadastreGround from'./CadastreGround';
import useCadastreViewport from'./useCadastreViewport';
import CadastreMapToolbar,{cadastreViewportEvents}from'./CadastreMapToolbar';
import {cadastreEditorTransform}from'./cultivationZones';
import {yardGeometry,yardPlanError,YARD_SLOT_KG}from'./openYard';
export default function OpenYardPlanner({selectedField:field,cadastre,zones=[],onOpenYardSave,onOpenWorkTab,openYardStorageUsage}){
 const fresh=()=>({version:1,width:field.cadastreYardPlan?.plan?.width||field.openYard?.width||6,depth:field.cadastreYardPlan?.plan?.depth||field.openYard?.depth||6,angle:field.cadastreYardPlan?.plan?.angle??field.openYard?.angle??0,anchor:field.cadastreYardPlan?.plan?.anchor||field.openYard?.anchor||null,boundaryId:cadastre.boundaryContourId});
 const[plan,setPlan]=useState(fresh),[placing,setPlacing]=useState(false),[dirty,setDirty]=useState(false),[notice,setNotice]=useState('');
 const svg=useRef(null),transform=useMemo(()=>cadastreEditorTransform(cadastre.boundaryPoints),[cadastre.boundaryPoints]),viewport=useCadastreViewport(svg,true,!placing);
 const savedKey=JSON.stringify([field.id,field.openYard,field.cadastreYardPlan,cadastre.boundaryContourId]);
 useEffect(()=>{setPlan(fresh());setDirty(false);setPlacing(false)},[savedKey]);
 const geometry=useMemo(()=>yardGeometry(plan),[plan]),error=yardPlanError(field,geometry,cadastre.boundaryPoints,zones,openYardStorageUsage?.kg||0,openYardStorageUsage?.slot||0);
 const points=ps=>ps.map(p=>{const q=transform.toSvg(p);return`${q.x},${q.y}`}).join(' ');
 const patch=next=>{setPlan(next);setDirty(true);setNotice('')};
 const palletPath=geometry?.pallets.map(poly=>poly.map((p,i)=>{const q=transform.toSvg(p);return`${i?'L':'M'}${q.x} ${q.y}`}).join(' ')+'Z').join(' ');
 const editable=Boolean(field.owned&&onOpenYardSave);
 return<section className="action-section cadastre-panel cadastre-editor open-yard-planner" aria-label="노지 야적창고 설계">
  <h3>노지 야적창고 설계</h3><p className="open-yard-planner__hint">적재면의 가로·세로와 위치를 정하세요. 옆의 3m 통로는 점유 면적에 포함되며 저장 용량에서는 제외됩니다.</p>
  <div className="cadastre-layout"><div className="cadastre-map-card"><div className="cadastre-map-card__grid" aria-hidden="true"/>
   <div className="cadastre-editor__map-heading"><strong>{cadastre.parcelNo}</strong><span>{placing?'적재면 시작 모서리를 눌러 배치':'갈색: 적재면 · 회색: 통로'}</span></div>
   <CadastreMapToolbar viewport={viewport} label="야적창고 지도"/>
   <svg ref={svg} viewBox={viewport.viewBox} className={`cadastre-editor__canvas ${placing?'is-editing':'is-pannable'}`} role="img" aria-label="야적창고 배치 지도" {...cadastreViewportEvents(viewport)} onClick={e=>{if(!placing||!editable)return;const m=svg.current.getScreenCTM();if(!m)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());patch({...plan,anchor:transform.toWorld(p)})}}>
    <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent}/>
    {(field.openParking?.footprints||[]).map((p,i)=><polygon key={i} points={points(p)} fill="#d3c18c" fillOpacity=".7" stroke="#7f7758" strokeWidth=".2"/>)}
    {(field.drainage?.routes||[]).map(r=><polyline key={r.id} points={points(r.points)} fill="none" stroke="#6285b5" strokeWidth=".6"/>)}
    {geometry&&<g><polygon points={points(geometry.aisle)} fill="#aeb7b1" fillOpacity=".8" stroke="#647167" strokeWidth=".25"/><polygon points={points(geometry.storage)} fill={error?'#d9a099':'#c7a978'} fillOpacity=".85" stroke="#786343" strokeWidth=".3"/><path d={palletPath} fill="#876f4c" fillOpacity=".7" stroke="#f9f2dc" strokeWidth=".13"/></g>}
   </svg>
  </div><aside className="cadastre-editor__tools">
   <div className="open-yard-planner__dimensions"><label>가로(m)<input type="number" min="2" max="100" step=".5" value={plan.width} disabled={!editable} onChange={e=>patch({...plan,width:Number(e.target.value)})}/></label><label>세로(m)<input type="number" min="2" max="100" step=".5" value={plan.depth} disabled={!editable} onChange={e=>patch({...plan,depth:Number(e.target.value)})}/></label></div>
   <label>배치 방향<select value={plan.angle} disabled={!editable} onChange={e=>patch({...plan,angle:Number(e.target.value)})}>{[0,45,90,135,180,225,270,315].map(v=><option key={v} value={v}>{v}°</option>)}</select></label>
   <button type="button" disabled={!editable} aria-pressed={placing} onClick={()=>setPlacing(!placing)}>{placing?'위치 선택 마치기 · 지도 이동':'지도에서 위치 선택'}</button>
   <div className="cadastre-editor__metrics"><span>적재면 / 통로</span><strong>{geometry?`${geometry.storagePy.toFixed(1)}평 / ${geometry.aislePy.toFixed(1)}평`:'—'}</strong></div>
   <div className="cadastre-editor__metrics"><span>총 점유 면적</span><strong>{geometry?`${geometry.occupiedPy.toFixed(1)}평`:'—'}</strong></div>
   <div className="cadastre-editor__metrics"><span>적재칸 / 저장 용량</span><strong>{geometry?`${geometry.slots}칸 / ${geometry.capacityKg.toLocaleString()}kg`:'—'}</strong></div>
   <p className="open-yard-planner__hint">게임 기준 적재칸 1개당 약 1평·{YARD_SLOT_KG.toLocaleString()}kg. 비·눈에 노출되는 노지 보관이며 기존 날씨 영향을 받습니다. 시공 후 그 자리는 식재 위치에서 제외됩니다.</p>
   {error&&<p role="alert" className="cadastre-editor__error">{error}</p>}
   <button type="button" disabled={!editable||!dirty||Boolean(error)} onClick={()=>{const r=onOpenYardSave(plan);setNotice(r?.message||'저장하지 못했습니다.');if(r?.ok){setDirty(false);setPlacing(false)}}}>야적창고 계획 확정</button>
   <button type="button" disabled={!dirty} onClick={()=>{setPlan(fresh());setDirty(false);setPlacing(false);setNotice('작성 중인 변경을 취소했습니다.')}}>변경 취소</button>
   {notice&&<p role="status">{notice}</p>}
   {field.cadastreYardPlan&&onOpenWorkTab&&<button type="button" disabled={dirty} onClick={()=>onOpenWorkTab('facility')}>작업 탭에서 시공</button>}
   {field.cadastreYardPlan&&<button type="button" onClick={()=>{const r=onOpenYardSave({kind:'cancel'});setNotice(r?.message||'계획을 취소하지 못했습니다.')}}>확정 계획 취소</button>}
  </aside></div>
 </section>;
}
