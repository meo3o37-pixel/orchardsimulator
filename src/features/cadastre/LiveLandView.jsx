import FacilitySiteLayer from '../facility/FacilitySiteLayer';
import {normalizeFacilitySites}from'../facility/facilityConstruction';
import {longDate}from'../../utils/common';
import React,{useContext,useId,useMemo,useRef}from'react';
import CadastreGround,{CadastreGroundContext}from'./CadastreGround';
import CadastreMapToolbar,{cadastreViewportEvents}from'./CadastreMapToolbar';
import useCadastreViewport from'./useCadastreViewport';
import {cadastreEditorTransform}from'./cultivationZones';
import {liveLandSnapshot}from'./liveLandSnapshot';
import {groundSeasonOf}from'./groundSeason';
import './LiveLandView.css';

export default function LiveLandView({field,cadastre,zones=[],onOpenDesign}){
 const snapshot=useMemo(()=>liveLandSnapshot(field),[field]),svg=useRef(null),id=useId().replace(/:/g,'');
 const environment=useContext(CadastreGroundContext),season=groundSeasonOf(environment.day,environment.weather);
 const transform=useMemo(()=>cadastreEditorTransform([...cadastre.boundaryPoints,...snapshot.drains.flatMap(r=>r.points)]),[cadastre.boundaryPoints,snapshot.drains]);
 const viewport=useCadastreViewport(svg,Boolean(transform),true);
 const toPoints=points=>points.map(point=>{const p=transform.toSvg(point);return`${p.x},${p.y}`}).join(' ');
 const circlePath=(points,metres,offset=0)=>points.map(point=>{
  const p=transform.toSvg(point),edge=transform.toSvg({x:point.x+metres/1000,y:point.y}),r=Math.abs(edge.x-p.x),x=p.x+offset*r,y=p.y-offset*r;
  return`M${x-r},${y}a${r},${r} 0 1,0 ${2*r},0a${r},${r} 0 1,0 ${-2*r},0`;
 }).join(' ');
 const paths=useMemo(()=>({shadow:circlePath(snapshot.trees,.66,-.25),trees:circlePath(snapshot.trees,.62),light:circlePath(snapshot.trees,.3,.6),posts:circlePath(snapshot.posts,.15),brokenPosts:circlePath(snapshot.posts.filter(p=>p.condition<=20),.2),nozzles:circlePath(snapshot.nozzles,.12)}),[snapshot,transform]);
 const groundField=useMemo(()=>({...field,drainage:{...field.drainage,routes:snapshot.drains}}),[field,snapshot.drains]);
 return<section className="action-section cadastre-panel cadastre-editor cadastre-live" aria-label="현 토지 상황">
  <header className="cadastre-live__header"><div><h3>현 토지 상황</h3><p>{field.name||cadastre.parcelNo} · 위에서 본 현재 토지</p></div><span>현재 상태</span></header>
  <div className="cadastre-live__metrics"><div><span>토지 면적</span><strong>{Math.round(cadastre.boundaryAreaPy||field.py||0).toLocaleString()}평</strong></div><div><span>식재 수량</span><strong>{snapshot.total.toLocaleString()}주</strong></div><div><span>시공된 배수·관로</span><strong>{snapshot.drains.length+snapshot.waterLines.length}구간</strong></div><div><span>비계파이프</span><strong>{snapshot.posts.length.toLocaleString()}본</strong></div></div>
  <div className="cadastre-map-card cadastre-live__map"><CadastreMapToolbar viewport={viewport} label="현 토지 지도"/>
   <svg ref={svg} className="cadastre-editor__canvas is-pannable" role="img" aria-label="현 토지 상황 탑뷰 지도" viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)}>
    <defs><clipPath id={`${id}-land`}><polygon points={toPoints(cadastre.boundaryPoints)}/></clipPath><pattern id={`${id}-yard`} width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#cfb99a"/><path d="M0 0L2 2M1 0L2 1" stroke="#b29b7b" strokeWidth=".1"/></pattern></defs>
    <CadastreGround field={groundField} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent}/>
    {snapshot.parking&&<g aria-label={`완공 주차장 ${snapshot.parking.plan.slots}칸`}><polygon points={toPoints(snapshot.parking.aisle)} fill="#bbbcb3" stroke="#90968b" strokeWidth=".15"/>{snapshot.parking.bays.map((bay,i)=><polygon key={i} points={toPoints(bay)} fill="#dfd2a8" stroke="#faf7eb" strokeWidth=".3"/>)}</g>}
    {snapshot.yard&&<g aria-label="완공 야적창고"><polygon points={toPoints(snapshot.yard.aisle)} fill="#bcbdb1"/><polygon points={toPoints(snapshot.yard.storage)} fill={`url(#${id}-yard)`} stroke="#8e7456" strokeWidth=".3"/></g>}
    <g clipPath={`url(#${id}-land)`}>
     {snapshot.wires.map(r=><polyline key={r.key} points={toPoints(r.points)} fill="none" stroke={r.condition<=20?'#b9604f':'#ac8550'} strokeWidth=".28" strokeDasharray={r.condition<=20?'.6 .4':undefined}/>)}
     {snapshot.waterLines.map(r=><polyline key={r.key} points={toPoints(r.points)} fill="none" stroke={r.type==='main'?'#287ea8':'#43a2a5'} strokeWidth={r.type==='main'?'.55':'.3'}/>)}
     <g aria-label={`연결된 식재 위치 ${snapshot.trees.length}주`}><path d={paths.shadow} fill="#173c32" opacity=".2"/><path d={paths.trees} fill={season.greenCover>30?'#3b7650':'#747d52'} stroke="#275438" strokeWidth=".08"/><path d={paths.light} fill={season.greenCover>30?'#7eac67':'#a9a576'} opacity=".7"/></g>
     <path d={paths.posts} fill="#66513a" stroke="#fff6db" strokeWidth=".06"/><path d={paths.brokenPosts} fill="#bb5a49"/><path d={paths.nozzles} fill="#9ee3e2" stroke="#287ea8" strokeWidth=".06"/>
    </g>
    {snapshot.drains.map(r=><polyline key={r.id} points={toPoints(r.points)} fill="none" stroke={r.type==='pipe100'||r.type==='pipe150'?'#8a6aa9':'#4094b7'} strokeWidth={r.type==='pipe150'?'.6':'.4'} strokeDasharray={r.type==='pipe100'||r.type==='pipe150'?'1 .6':undefined}/>) }
    <FacilitySiteLayer field={field} transform={transform} day={environment.day}/>
    <polygon points={toPoints(cadastre.boundaryPoints)} fill="none" stroke="#34694a" strokeWidth=".28"/>
   </svg>
  </div>
  <div className="cadastre-live__legend"><span><i className="is-tree"/>식재 위치</span><span><i className="is-post"/>지주·와이어</span><span><i className="is-water"/>배수·관수</span><span><i className="is-pipe"/>지하 유공관</span><span><i className="is-yard"/>주차장·야적창고</span></div>
  {normalizeFacilitySites(field.facilitySites).some(s=>s.status==='building')&&<div className="cadastre-live__construction" aria-label="외주 공사 진행">{normalizeFacilitySites(field.facilitySites).filter(s=>s.status==='building').map(s=><article key={s.id}><div><strong>{s.name}</strong><span>건설 중</span></div><progress max={s.readyDay-s.startDay} value={Math.max(0,Math.min(s.readyDay-s.startDay,environment.day-s.startDay))}/><small>착공 {longDate(s.startDay)} · 완공 예정 {longDate(s.readyDay)} · {Math.max(0,s.readyDay-environment.day)}일 남음</small></article>)}</div>}
  {snapshot.unmapped>0&&<p className="cadastre-live__notice">나무 {snapshot.unmapped.toLocaleString()}주는 식재 위치가 연결되지 않아 지도에 표시하지 않았습니다.</p>}
  {Number(field.deadTrees)>0&&<p className="cadastre-live__notice">고사목 {Number(field.deadTrees).toLocaleString()}주 · 개별 고사 위치는 구분되지 않습니다.</p>}
  <footer><small>저장된 식재 위치와 실제 시공된 구간을 표시합니다.</small><button type="button" onClick={onOpenDesign}>설계로 이동</button></footer>
 </section>;
}
