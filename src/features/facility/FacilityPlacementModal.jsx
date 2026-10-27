import {polygonContainsPoint}from'../cadastre/cadastreData';
import React,{useEffect,useId,useMemo,useRef,useState}from'react';
import {cadastreEditorTransform}from'../cadastre/cultivationZones';
import useCadastreViewport from'../cadastre/useCadastreViewport';
import CadastreMapToolbar,{cadastreViewportEvents}from'../cadastre/CadastreMapToolbar';
import CadastreGround,{CadastreGroundContext}from'../cadastre/CadastreGround';
import {liveLandSnapshot}from'../cadastre/liveLandSnapshot';
import FacilitySiteLayer from'./FacilitySiteLayer';
import {facilityPlacementGeometry,facilityPlacementCenter,facilityPlacementError,facilityInstallDaysOf}from'./facilityConstruction';
import {longDate}from'../../utils/common';
import './FacilityPlacementModal.css';

export default function FacilityPlacementModal({field,facility,boundary,day,weather,onConfirm,onClose}){
 const [center,setCenter]=useState(()=>facilityPlacementCenter(boundary)),[angle,setAngle]=useState(0),[pan,setPan]=useState(false),[submitError,setSubmitError]=useState('');
 const svg=useRef(null),dialog=useRef(null),previousFocus=useRef(null),drag=useRef(null),id=useId();
 const transform=useMemo(()=>cadastreEditorTransform(boundary),[boundary]);
 const viewport=useCadastreViewport(svg,Boolean(transform),pan);
 const site=useMemo(()=>center?facilityPlacementGeometry(facility.key,center,angle):null,[facility.key,center,angle]);
 const excludedTrees=site?.occupiedPy>0?(field.cadastrePlantingPlans||[]).reduce((sum,p)=>sum+(p.points||[]).slice(p.done||0).filter(v=>polygonContainsPoint(site.points,v)).length,0):0;
 const error=facilityPlacementError(field,boundary,site),days=facilityInstallDaysOf(facility.key),snapshot=useMemo(()=>liveLandSnapshot(field),[field]);
 useEffect(()=>{previousFocus.current=document.activeElement;dialog.current?.focus();return()=>previousFocus.current?.focus?.();},[]);
 const toPoints=points=>points.map(p=>{const v=transform.toSvg(p);return`${v.x},${v.y}`}).join(' ');
 const locate=e=>{const m=svg.current?.getScreenCTM();if(!m)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());setCenter(transform.toWorld(p));setSubmitError('');};
 const keyDown=e=>{if(e.key==='Escape'){e.stopPropagation();onClose();}if(e.key==='Tab'){const nodes=[...dialog.current.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')];const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
 return <div className="confirm-modal-backdrop facility-placement-backdrop" onKeyDown={keyDown}><section ref={dialog} tabIndex={-1} className="confirm-modal facility-placement" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
  <header><div><small>외주 시설 설치</small><h3 id={`${id}-title`}>{facility.name} 위치 선택</h3><p>{field.name} · 지도에서 위치를 선택하거나 끌어서 옮기세요.</p></div><button type="button" onClick={onClose} aria-label="시설 배치 닫기">닫기</button></header>
  {!transform?<p role="alert">토지 경계를 찾을 수 없습니다. 전체지도에서 토지 경계를 먼저 지정해 주세요.</p>:<>
  <div className="facility-placement__summary"><span>점유 <b>{site.occupiedPy}평</b></span><span>규격 <b>{site.width.toFixed(1)} × {site.depth.toFixed(1)}m</b></span><span>시공 <b>{days}일</b></span>{excludedTrees>0&&<span>예정 식재 <b>{excludedTrees}주 제외</b></span>}<span>완공 예정 <b>{longDate(day+days)}</b></span></div>
  <div className="cadastre-editor facility-placement__editor"><div className="cadastre-map-card"><CadastreMapToolbar viewport={viewport} label="시설 배치 지도" panMode={pan} onPanModeChange={setPan}/><CadastreGroundContext.Provider value={{day,weather}}><svg ref={svg} className={`cadastre-editor__canvas ${pan?'is-pannable':''}`} viewBox={viewport.viewBox} role="img" aria-label="내 토지 시설 배치 지도" {...cadastreViewportEvents(viewport)} onPointerDown={e=>{viewport.onPointerDown?.(e);if(!pan&&e.button===0&&e.isPrimary!==false){drag.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);locate(e);}}} onPointerMove={e=>{viewport.onPointerMove?.(e);if(!pan&&drag.current===e.pointerId)locate(e);}} onPointerUp={e=>{if(drag.current===e.pointerId)drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
   <CadastreGround field={field} boundaryPoints={boundary} transform={transform}/>
   {snapshot.parking?.footprints.map((p,i)=><polygon key={`p${i}`} points={toPoints(p)} fill="#d4c59c" stroke="#8e815e" strokeWidth=".2"/>)}
   {snapshot.yard?.footprints.map((p,i)=><polygon key={`y${i}`} points={toPoints(p)} fill="#c3b298" stroke="#8e815e" strokeWidth=".2"/>)}
   {snapshot.drains.map(r=><polyline key={r.id} points={toPoints(r.points)} stroke="#5685b2" fill="none" strokeWidth=".4"/>)}
   <path d={snapshot.trees.map(p=>{const v=transform.toSvg(p);return`M${v.x-.25} ${v.y}a.25 .25 0 1 0 .5 0a.25 .25 0 1 0 -.5 0`}).join(' ')} fill="#3f754c"/>
   <FacilitySiteLayer field={field} transform={transform} day={day}/>
   <polygon points={toPoints(site.points)} fill={error?'#dc7771':'#71b78c'} fillOpacity=".75" stroke={error?'#a53632':'#256342'} strokeWidth=".5"><title>{error||'설치 가능한 위치'}</title></polygon>
  </svg></CadastreGroundContext.Provider></div></div>
  <div className="facility-placement__controls"><label>회전 <input type="range" min="0" max="355" step="5" value={angle} onChange={e=>setAngle(Number(e.target.value))}/><output>{angle}°</output></label><div><button type="button" onClick={()=>setCenter(c=>({...c,x:c.x-.001}))}>←</button><button type="button" onClick={()=>setCenter(c=>({...c,y:c.y-.001}))}>↑</button><button type="button" onClick={()=>setCenter(c=>({...c,y:c.y+.001}))}>↓</button><button type="button" onClick={()=>setCenter(c=>({...c,x:c.x+.001}))}>→</button><small>1m씩 이동</small></div></div>
  <p className={`facility-placement__status ${error?'is-error':''}`} role="status">{submitError||error||'설치 가능한 위치입니다. 결제 후 외주 시공이 시작됩니다.'}</p>
  <p className="facility-placement__note">완공 전에는 시설을 사용할 수 없습니다. 공사 부지는 식재에서 제외되며 진행 상황은 실시간 지도에서 확인합니다.{site.occupiedPy===0?' 별도 면적을 차감하지 않는 부착형·실내 설비입니다.':''}</p>
  <footer><button type="button" onClick={onClose}>취소</button><button type="button" disabled={Boolean(error)} onClick={()=>{const result=onConfirm({...site,id:`facility-site:${Date.now()}:${Math.random().toString(36).slice(2,8)}`});if(result?.message)setSubmitError(result.message);}}>위치 확정 · 결제로</button></footer>
  </>}
 </section></div>;
}
