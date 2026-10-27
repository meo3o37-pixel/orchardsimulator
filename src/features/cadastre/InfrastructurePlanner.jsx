import CadastreGround from './CadastreGround';
import useCadastreViewport from './useCadastreViewport';
import CadastreMapToolbar, {cadastreViewportEvents} from './CadastreMapToolbar';
import React,{useMemo,useRef,useState}from'react';
import {cadastreEditorTransform}from'./cultivationZones';
import {infrastructureSource,infrastructureSettings,buildInfrastructurePlan,infrastructureNeeds,infrastructureStages,infrastructureJobs}from'./orchardInfrastructure';
import {infrastructureIrrigationDemand,INFRASTRUCTURE_PUMP}from'./infrastructureIrrigation';
import {SHOP_ITEMS}from'../../config/items/index';
import {trellisInvestmentSummary,trellisRowMetrics}from'./trellisInvestment';
import './InfrastructurePlanner.css';
const catalog=Object.fromEntries(Object.values(SHOP_ITEMS).flat().map(i=>[i.key,i]));
export default function InfrastructurePlanner({kind,selectedField:field,zones=[],cadastre,onInfrastructureSave,onIrrigationSettings,onOpenWorkTab,onSelectDesign}){
 const old=field.orchardInfrastructure?.[kind],source=useMemo(()=>infrastructureSource(field,zones,cadastre.boundaryPoints),[field,zones,cadastre.boundaryPoints]);
 const [settings,setSettings]=useState(()=>infrastructureSettings(kind,old?.settings)),[keys,setKeys]=useState(old?.rows.map(r=>r.key)||null),[waterSource,setWaterSource]=useState(old?.header?.[0]||null),[notice,setNotice]=useState('');
 const selected=keys??source.rows.map(r=>r.key),svg=useRef(null),transform=useMemo(()=>cadastreEditorTransform(cadastre.boundaryPoints),[cadastre.boundaryPoints]);
 const viewport=useCadastreViewport(svg,Boolean(transform),true);
 const result=useMemo(()=>source.error?{ok:false,message:source.error}:buildInfrastructurePlan(kind,source,settings,selected,waterSource),[kind,source,settings,selected,waterSource]);
 const p=result.plan,points=ps=>ps.map(v=>{const q=transform.toSvg(v);return`${q.x},${q.y}`}).join(' ');
 const materials=useMemo(()=>{const need={};if(p)for(const stage of infrastructureStages(kind)){const rows=stage==='header'?[null]:p.rows;for(const row of rows)for(const[k,v]of Object.entries(infrastructureNeeds(p,row,stage)))need[k]=(need[k]||0)+v;}return need},[p,kind]);
 const purchaseCost=Object.entries(materials).reduce((sum,[key,n])=>sum+Math.ceil(n/(key==='bindingString400Pack'?400:key.includes('100m')?100:1))*(catalog[key]?.price||0),0);
 const demand=useMemo(()=>old?infrastructureIrrigationDemand(field):null,[old,field]);
 const investment=kind==='trellis'&&p?trellisInvestmentSummary(field,p):null;
 const currentInvestment=kind==='trellis'&&old?.materialVersion===2?trellisInvestmentSummary(field):null;
 const set=(key,value)=>setSettings(s=>({...s,[key]:value}));
 const save=()=>{
  if(!p)return;
  if(old&&!window.confirm('새 설계를 확정하면 이 시설의 기존 시공 진행량이 초기화됩니다. 자재는 반환되지 않습니다. 계속할까요?'))return;
  const r=onInfrastructureSave?.(kind,{settings,rowKeys:selected,waterSource});setNotice(r?.message||'설계를 저장하지 못했습니다.');
 };
 const pick=event=>{if(kind!=='irrigation')return;const matrix=svg.current?.getScreenCTM();if(!matrix)return;const pt=svg.current.createSVGPoint();pt.x=event.clientX;pt.y=event.clientY;setWaterSource(transform.toWorld(pt.matrixTransform(matrix.inverse())))};
 return<section className="action-section cadastre-panel cadastre-editor orchard-infrastructure" aria-label={kind==='trellis'?'지주시설 설계':'관수시설 설계'}>
  <h3>{kind==='trellis'?'지주시설 설계':'관수시설 설계'}</h3>
  <p>{kind==='trellis'?'비계파이프를 열 양 끝과 중간에 배치하고, 개별 지주 수와 와이어 단수를 선택하세요. 투자량에 따라 강풍 저항·가지유인 노동력·보수 부담이 달라집니다.':'지도에서 같은 토지의 관수용 수원 연결 위치를 선택하세요. 주관과 열별 관수선을 자동 연결합니다.'}</p>
  <div className="cadastre-layout"><div className="cadastre-map-card"><div className="cadastre-map-card__grid" aria-hidden="true"/>
   <div className="cadastre-editor__map-heading"><strong>{field.name}</strong><span>{kind==='trellis'?'● 비계파이프 · 금색 선: 와이어':'파란 선: 주관 · 초록 선: 열별 관수선'}</span></div>
   <CadastreMapToolbar viewport={viewport} label={kind==='trellis'?'지주시설 지도':'관수시설 지도'}/>
   <svg ref={svg} viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)} className="cadastre-editor__canvas is-pannable" role="img" aria-label="과원 시설 배치 지도" onClick={pick}>
    <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent}/>
    {p?.rows.map(row=><g key={row.key}><polyline points={points([row.points[0],row.points.at(-1)])} fill="none" stroke={kind==='trellis'?'#ae8951':'#438b73'} strokeWidth=".6"/>
     {kind==='trellis'&&Array.from({length:Math.ceil(row.length/p.settings.spacing)+1},(_,i)=>{const count=Math.ceil(row.length/p.settings.spacing),a=row.points[0],b=row.points.at(-1),q=transform.toSvg({x:a.x+(b.x-a.x)*i/count,y:a.y+(b.y-a.y)*i/count});return<circle key={i} cx={q.x} cy={q.y} r=".55" fill={i===0||i===count?'#774e30':'#b58b56'}/>})}
    </g>)}
    {kind==='irrigation'&&p&&<polyline points={points(p.header)} fill="none" stroke="#3988b5" strokeWidth=".9"/>}
    {waterSource&&kind==='irrigation'&&<circle cx={transform.toSvg(waterSource).x} cy={transform.toSvg(waterSource).y} r="1.2" fill="#176f9a"/>}
   </svg>
  </div><aside className="cadastre-editor__tools">
   {source.error&&<><p role="alert">{source.error}</p><button type="button" onClick={()=>onSelectDesign('farm')}>식재 열 설계로 이동</button></>}
   {kind==='trellis'?<><label>비계파이프 최대 간격<input type="number" min="2.5" max="10" step=".5" value={settings.spacing} onChange={e=>set('spacing',Number(e.target.value))}/></label><label>나무당 개별 지주<select value={settings.stakes} onChange={e=>set('stakes',Number(e.target.value))}>{[0,1,2].map(n=><option key={n} value={n}>{n}개</option>)}</select></label><label>와이어 단수<select value={settings.wires} onChange={e=>set('wires',Number(e.target.value))}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}단</option>)}</select></label></>:<>
    <label>관수 방식<select value={settings.method} onChange={e=>set('method',e.target.value)}><option value="drip">점적관수 · 점적구당 2L/h</option><option value="sprinkler">스프링클러 · 주당 40L/h</option><option value="micro">미세살수 · 주당 30L/h</option></select></label>
    <label>열별 관수선<select value={settings.lines} onChange={e=>set('lines',Number(e.target.value))}><option value="1">1줄</option><option value="2">2줄</option></select></label>
    {settings.method==='drip'&&<label>나무당 점적구<select value={settings.emitters} onChange={e=>set('emitters',Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n} value={n}>{n}개</option>)}</select></label>}
   </>}
   <div className="orchard-infrastructure__row-heading"><h4>설계할 나무 열</h4><button type="button" onClick={()=>setKeys(selected.length?[]:source.rows.map(r=>r.key))}>{selected.length?'선택 해제':'전체 선택'}</button></div>
   <div className="orchard-infrastructure__rows">{source.rows.map(row=><label key={row.key}><input type="checkbox" checked={selected.includes(row.key)} onChange={e=>setKeys(e.target.checked?[...selected,row.key]:selected.filter(k=>k!==row.key))}/><span>{row.name}<small>{row.treeCount}주 · {Math.hypot(row.points.at(-1).x-row.points[0].x,row.points.at(-1).y-row.points[0].y).toFixed(5)*1000}m</small></span></label>)}</div>
   <h4>설계 자재량</h4><dl className="orchard-infrastructure__materials">{Object.entries(materials).map(([key,n])=><div key={key}><dt>{catalog[key]?.name||key}</dt><dd>{n.toLocaleString('ko-KR',{maximumFractionDigits:1})}{key.includes('100m')||key==='trellisWire'?'m':key==='bindingString400Pack'?'개':catalog[key]?.unit}</dd></div>)}</dl>
   {investment&&<div className="trellis-investment-summary"><h4>선택 열 완공 시 예상</h4><dl><div><dt>전량 신규 자재 구매비</dt><dd>{purchaseCost.toLocaleString()}원</dd></div><div><dt>태풍 때 열별 파손 확률</dt><dd>{(investment.risk*100).toFixed(1)}%</dd></div><div><dt>가지유인 노동력 절감</dt><dd>{(investment.trainingSaving*100).toFixed(1)}%</dd></div><div><dt>유지보수 부담 지수</dt><dd>×{investment.upkeepFactor.toFixed(2)}</dd></div></dl><small>게임 밸런스 기준. 실제 효과는 설치 범위와 내구도에 따라 달라지며, 자재를 늘릴수록 추가 효과는 줄어듭니다.</small></div>}
   {kind==='trellis'&&old&&old.materialVersion!==2&&<p role="alert">비계파이프 자재 기준으로 설계를 다시 확정해 주세요. 기존 진행량은 초기화됩니다.</p>}
   {!result.ok&&<p role="alert" className="cadastre-editor__error">{result.message}</p>}
   <button type="button" disabled={!field.owned||!result.ok} onClick={save}>설계 확정</button>
   {notice&&<p role="status">{notice}</p>}
   {old&&<button type="button" onClick={()=>onOpenWorkTab?.('facility')}>작업 탭에서 시공</button>}
  </aside></div>
  {currentInvestment&&<section className="trellis-investment-status" aria-label="지주시설 투자 효과"><h4>현재 시공 상태와 효과</h4><p>평균 내구도 {currentInvestment.condition.toFixed(1)}% · 현재 가지유인 절감 {(currentInvestment.trainingSaving*100).toFixed(1)}% · 보수 대상 {currentInvestment.damaged}열</p><div>{old.rows.map(row=>{const m=trellisRowMetrics(old,row);return<article key={row.key}><strong>{row.name}</strong><span>{row.done?.posts?'비계 설치':'비계 미설치'} · {row.done?.wire?'와이어 연결':'와이어 미연결'}</span><progress max="100" value={m.condition} aria-label={`${row.name} 내구도`}/><small>내구도 {m.condition.toFixed(1)}% · 태풍 파손 확률 {(m.damageProbability*100).toFixed(1)}%</small></article>})}</div>{currentInvestment.damaged>0&&<button type="button" onClick={()=>onOpenWorkTab?.('facility')}>작업 탭에서 손상 시설 보수</button>}</section>}
  {kind==='irrigation'&&old&&<section className="orchard-infrastructure__operation" aria-label="구역별 관수 운전"><h4>구역별 순차 관수</h4><p>게임 기준 펌프 {INFRASTRUCTURE_PUMP.litersPerHour.toLocaleString()}L/h · 양정 {INFRASTRUCTURE_PUMP.headM}m. 관수펌프·농사용 전기·관정·관수용 물탱크가 필요합니다.</p>
   <div className="orchard-infrastructure__operation-controls"><label>구역당 열 수<input type="number" min="1" max="20" value={settings.groupSize} onChange={e=>set('groupSize',Number(e.target.value))}/></label><label>구역당 운전 시간<input type="number" min=".25" max="4" step=".25" value={settings.hours} onChange={e=>set('hours',Number(e.target.value))}/></label>
   <button type="button" onClick={()=>{const r=onIrrigationSettings?.({...settings,enabled:old.settings.enabled});setNotice(r?.message||'운전 설정을 저장하지 못했습니다.')}}>운전 설정 저장</button>
   <button type="button" onClick={()=>{const r=onIrrigationSettings?.({...settings,enabled:!old.settings.enabled});setNotice(r?.message||'운전 설정을 저장하지 못했습니다.')}}>{old.settings.enabled?'관수 끄기':'관수 켜기'}</button></div>
   <p>현재 저장된 운전: {demand?.groups.length||0}구역 · {demand?.hours?.toFixed(1)||0}시간/일 · 필요 물 {Math.round(demand?.liters||0).toLocaleString()}L/일 · 탱크 {Math.floor(field.tankWaterLiters||0).toLocaleString()}L</p>
   {demand?.error&&<p role="status">{demand.error}</p>}
   <div className="orchard-infrastructure__groups">{demand?.groups.map((g,i)=><div key={i}><strong>{i+1}구역 · {g.trees}주</strong><span>{Math.round(g.litersPerHour)}L/h · 필요 양정 {g.requiredHead.toFixed(1)}m</span><b>{g.ready?'급수 가능':'유량·압력 부족'}</b></div>)}</div>
  </section>}
 </section>;
}
