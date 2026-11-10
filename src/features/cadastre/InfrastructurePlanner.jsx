import CadastreGround,{CadastreGroundDisplayContext} from './CadastreGround';
import CadastreDisplayControls from './CadastreDisplayControls';
import useCadastreViewport from './useCadastreViewport';
import CadastreMapToolbar, {cadastreViewportEvents} from './CadastreMapToolbar';
import React,{useContext,useId,useMemo,useRef,useState}from'react';
import {cadastreEditorTransform}from'./cultivationZones';
import {infrastructureSource,infrastructureSettings,infrastructureWaterSources,buildInfrastructurePlan,infrastructureNeeds,infrastructureStages,isIrrigationMainBuried,IRRIGATION_MAIN_MAX_POINTS}from'./orchardInfrastructure';
import {infrastructureIrrigationDemand,INFRASTRUCTURE_PUMP}from'./infrastructureIrrigation';
import {SHOP_ITEMS}from'../../config/items/index';
import {DEFAULT_SCAFFOLD_SPACING_M,MAX_TRELLIS_STAKES_PER_TREE,SCAFFOLD_PIPE_LENGTH_M}from'../../config/items/consumableMaterial';
import {trellisInvestmentSummary,trellisRowMetrics,scaffoldCount}from'./trellisInvestment';
import './InfrastructurePlanner.css';
const catalog=Object.fromEntries(Object.values(SHOP_ITEMS).flat().map(i=>[i.key,i]));
const RECOMMENDED_OPTION_MARK = '★ 추천';
const STAKE_COUNT_OPTIONS = Array.from({length: MAX_TRELLIS_STAKES_PER_TREE + 1}, (_, count) => count);
const STAKE_RECOMMENDED_FOR = {1: '일반수형', 2: '2축', 3: '다축', 4: '다축'};
// Each pair is an offset along and across the row in map units.
const STAKE_MARK_OFFSETS = [
 [],
 [[0,.24]],
 [[0,-.24],[0,.24]],
 [[-.24,-.24],[.24,-.24],[0,.30]],
 [[-.24,-.24],[.24,-.24],[-.24,.24],[.24,.24]]
];
const circleAt=(point,r)=>`M${point.x-r} ${point.y}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0`;
export default function InfrastructurePlanner({kind,selectedField:field,zones=[],cadastre,onInfrastructureSave,onIrrigationSettings,onOpenWorkTab,onSelectDesign}){
 const old=field.orchardInfrastructure?.[kind],source=useMemo(()=>infrastructureSource(field,zones,cadastre.boundaryPoints),[field,zones,cadastre.boundaryPoints]);
 const waterSources=useMemo(()=>kind==='irrigation'?infrastructureWaterSources(field):[],[kind,field]);
 const [settings,setSettings]=useState(()=>infrastructureSettings(kind,old?.settings)),[keys,setKeys]=useState(()=>kind==='irrigation'?old?.rows?.map(row=>row.key)??null:null),[zoneId,setZoneId]=useState(()=>old?.rows?.[0]?.zoneId??source.rows[0]?.zoneId??''),[rowsOpen,setRowsOpen]=useState(false),[materialsOpen,setMaterialsOpen]=useState(false),[investmentOpen,setInvestmentOpen]=useState(false),[sourceId,setSourceId]=useState(()=>old?.sourceId||''),[notice,setNotice]=useState('');
 const [showWire,setShowWire]=useState(false),[showSupports,setShowSupports]=useState(false),[showTrees,setShowTrees]=useState(false);
 const [mainWaypoints,setMainWaypoints]=useState(()=>old?.mainWaypoints||[]);
 const [drawingMain,setDrawingMain]=useState(null);
 const [panMode,setPanMode]=useState(false);
 const previewLine=useRef(null);
 const confirmDialog=useRef(null);
 const confirmId=useId();
 const zoneChoices=useMemo(()=>[...new Map(source.rows.map(row=>[String(row.zoneId),{id:String(row.zoneId),name:zones.find(zone=>String(zone.id)===String(row.zoneId))?.name||row.name.split(' · ')[0]}])).values()], [source.rows,zones]);
 const activeZoneId=zoneChoices.some(zone=>zone.id===String(zoneId))?String(zoneId):zoneChoices[0]?.id??'';
 const availableRows=useMemo(()=>source.rows.filter(row=>String(row.zoneId)===activeZoneId),[source.rows,activeZoneId]);
 const selected=useMemo(()=>availableRows.filter(row=>!keys||keys.includes(row.key)).map(row=>row.key),[keys,availableRows]),svg=useRef(null),transform=useMemo(()=>cadastreEditorTransform(cadastre.boundaryPoints),[cadastre.boundaryPoints]);
 const waterFacility=waterSources.find(site=>site.id===sourceId),waterSource=waterFacility?.point||null;
 const needsWaterSource=kind==='irrigation'&&!waterSource;
 const replacesPlan=Boolean(old&&!old.awaitingWaterSource);
 const canDrawMain=Boolean(drawingMain&&!panMode&&field.owned&&drawingMain.length<IRRIGATION_MAIN_MAX_POINTS);
 const viewport=useCadastreViewport(svg,Boolean(transform),!drawingMain||panMode);
 const {showSoil}=useContext(CadastreGroundDisplayContext);
 const trellis=field.orchardInfrastructure?.trellis;
 const trellisOverlay=useMemo(()=>kind==='irrigation'?(trellis?.rows||[]).filter(row=>Array.isArray(row.points)&&row.points.length>=2&&row.points.every(point=>Number.isFinite(point?.x)&&Number.isFinite(point?.y))).map(row=>{
  const a=row.points[0],b=row.points.at(-1),start=transform.toSvg(a),end=transform.toSvg(b),length=Math.hypot(a.x-b.x,a.y-b.y)*1000;
  const count=Math.max(1,scaffoldCount(length,trellis.settings?.spacing||DEFAULT_SCAFFOLD_SPACING_M)-1);
  const posts=Array.from({length:count+1},(_,i)=>circleAt({x:start.x+(end.x-start.x)*i/count,y:start.y+(end.y-start.y)*i/count},.34)).join(' ');
  const dx=end.x-start.x,dy=end.y-start.y,span=Math.hypot(dx,dy)||1;
  const ux=dx/span,uy=dy/span;
  const stakeOffsets=STAKE_MARK_OFFSETS[trellis.settings?.stakes]||[];
  const stakes=row.points.flatMap(point=>{
   const at=transform.toSvg(point);
   return stakeOffsets.map(([along,across])=>circleAt({x:at.x+ux*along-uy*across,y:at.y+uy*along+ux*across},.11));
  }).join(' ');
  const nx=-uy*.24,ny=ux*.24;
  return{key:row.key,name:row.name,line:`${start.x+nx},${start.y+ny} ${end.x+nx},${end.y+ny}`,posts,stakes};
 }):[],[kind,trellis,transform]);
 const treePath=useMemo(()=>showTrees?source.rows.flatMap(row=>row.points).map(point=>circleAt(transform.toSvg(point),.22)).join(' '):'',[showTrees,source.rows,transform]);
 const result=useMemo(()=>source.error?{ok:false,message:source.error}:buildInfrastructurePlan(kind,source,settings,selected,waterSource,mainWaypoints),[kind,source,settings,selected,waterSource,mainWaypoints]);
 const p=result.plan,points=ps=>ps.map(v=>{const q=transform.toSvg(v);return`${q.x},${q.y}`}).join(' ');
 const mainSketch=drawingMain??(!p&&settings.mainPlacement==='custom'?mainWaypoints:[]);
 const sketchEnd=mainSketch.length?transform.toSvg(mainSketch.at(-1)):null;
 const pointerPoint=event=>{
  const matrix=svg.current?.getScreenCTM();
  return matrix?new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()):null;
 };
 const movePointer=event=>{
  viewport.onPointerMove(event);
  const line=previewLine.current;
  if(!line||event.pointerType==='touch')return;
  const point=pointerPoint(event);
  if(!point)return;
  line.setAttribute('x2',point.x);
  line.setAttribute('y2',point.y);
  line.setAttribute('visibility','visible');
 };
 const addWaypoint=event=>{
  if(!canDrawMain)return;
  const position=pointerPoint(event);
  if(!position)return;
  const point=transform.toWorld(position);
  const previous=drawingMain.at(-1);
  if(previous&&Math.hypot(point.x-previous.x,point.y-previous.y)<.00001)return;
  setDrawingMain([...drawingMain,point]);
 };
 const materials=useMemo(()=>{const need={};if(p)for(const stage of infrastructureStages(kind)){const rows=stage==='header'?[null]:p.rows;for(const row of rows)for(const[k,v]of Object.entries(infrastructureNeeds(p,row,stage)))need[k]=(need[k]||0)+v;}return need},[p,kind]);
 const purchaseCost=Object.entries(materials).reduce((sum,[key,n])=>sum+Math.ceil(n/(key==='bindingString400Pack'?400:key.includes('100m')?100:1))*(catalog[key]?.price||0),0);
 const demand=useMemo(()=>old?infrastructureIrrigationDemand(field):null,[old,field]);
 const investment=kind==='trellis'&&p?trellisInvestmentSummary(field,p):null;
 const currentInvestment=kind==='trellis'&&old?.materialVersion===2?trellisInvestmentSummary(field):null;
 const set=(key,value)=>setSettings(s=>({...s,[key]:value}));
 const save=()=>{
  if(!p||drawingMain||!field.owned)return;
  const r=onInfrastructureSave?.(kind,{settings,rowKeys:selected,waterSourceId:waterFacility?.id||'',mainWaypoints});setNotice(r?.message||'설계를 저장하지 못했습니다.');
 };
 const requestSave=()=>{
  if(replacesPlan||needsWaterSource)confirmDialog.current?.showModal();
  else save();
 };
 return<section className="action-section cadastre-panel cadastre-editor orchard-infrastructure" aria-label={kind==='trellis'?'지주시설 설계':'관수시설 설계'}>
  <h3>{kind==='trellis'?'지주시설 설계':'관수시설 설계'}</h3>
  <div className="orchard-infrastructure__display"><CadastreDisplayControls /><div className="cadastre-design-display orchard-infrastructure__layers" role="group" aria-label={`${kind==='trellis'?'지주':'관수'} 지도 설계 표시`}><span>설계 표시</span>{kind==='irrigation'&&<><button type="button" aria-pressed={showWire} onClick={()=>setShowWire(value=>!value)}>와이어 <small>{showWire?'켜짐':'꺼짐'}</small></button><button type="button" aria-pressed={showSupports} onClick={()=>setShowSupports(value=>!value)}>지주 <small>{showSupports?'켜짐':'꺼짐'}</small></button></>}<button type="button" aria-pressed={showTrees} onClick={()=>setShowTrees(value=>!value)}>나무 <small>{showTrees?'켜짐':'꺼짐'}</small></button></div></div>
  <div className="cadastre-layout"><div className="cadastre-map-card"><div className="cadastre-map-card__grid" aria-hidden="true"/>
   <div className="cadastre-editor__map-heading"><strong>{field.name}</strong>{kind==='trellis'?<div className="orchard-infrastructure__legend"><span><i className="orchard-infrastructure__legend-post" aria-hidden="true"/>비계파이프</span><span><i className="orchard-infrastructure__legend-wire" aria-hidden="true"/>와이어</span></div>:<div className="orchard-infrastructure__legend orchard-infrastructure__legend--irrigation"><span><i className="orchard-infrastructure__legend-main" aria-hidden="true"/>32mm 주관</span>{settings.method==='drip'?<span><i className="orchard-infrastructure__legend-drip" aria-hidden="true"/>16mm 점적호스</span>:<span><i className="orchard-infrastructure__legend-sprinkler" aria-hidden="true"/>살수 장치</span>}{needsWaterSource&&<em>수원 미연결</em>}</div>}</div>
   <CadastreMapToolbar viewport={viewport} label={kind==='trellis'?'지주시설 지도':'관수시설 지도'} panMode={panMode} onPanModeChange={drawingMain?setPanMode:undefined}/>
   <svg ref={svg} viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)} onPointerMove={movePointer} onPointerLeave={()=>previewLine.current?.setAttribute('visibility','hidden')} onClick={addWaypoint} className={`cadastre-editor__canvas ${drawingMain&&!panMode?'is-editing':'is-pannable'}`} role="img" aria-label="과원 시설 배치 지도">
    <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={showSoil?viewport.zoomPercent:100}/>
    {kind==='irrigation'&&waterSources.map(site=>{const point=transform.toSvg(site.point);return<g key={site.id} role="button" tabIndex={drawingMain?-1:0} aria-label={`${site.name} 수원 선택`} onClick={()=>{if(!drawingMain)setSourceId(site.id)}} onKeyDown={event=>{if(!drawingMain&&(event.key==='Enter'||event.key===' ')){event.preventDefault();setSourceId(site.id)}}}><circle cx={point.x} cy={point.y} r="1.6" fill={site.id===sourceId?'#176f9a':'#f9fbf4'} stroke="#176f9a" strokeWidth=".45"/><text x={point.x} y={point.y+.45} textAnchor="middle" fontSize="1.25" fill={site.id===sourceId?'#fff':'#176f9a'} pointerEvents="none">{site.type==='well'?'관':'탱'}</text><title>{site.name} · {site.status==='planned'?'배치 설계':'시설 배치'}</title></g>})}
    {kind==='irrigation'&&settings.mainPlacement==='custom'&&(!p||drawingMain)&&availableRows.filter(row=>selected.includes(row.key)).map(row=><polyline key={row.key} points={points([row.points[0],row.points.at(-1)])} fill="none" stroke="#648775" strokeWidth="1.4" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" pointerEvents="none"/>)}
    {!drawingMain&&p?.rows.map(row=><g key={row.key}><polyline points={points(kind==='irrigation'?row.route||[row.points[0],row.points.at(-1)]:[row.points[0],row.points.at(-1)])} fill="none" stroke={kind==='trellis'?'#111111':settings.method==='drip'?'#2d8a65':'#3988b5'} strokeWidth={kind==='trellis'?'.24':'1.4'} strokeLinecap={kind==='irrigation'?'round':undefined} strokeLinejoin={kind==='irrigation'?'round':undefined} vectorEffect={kind==='irrigation'?'non-scaling-stroke':undefined}/>
     {kind==='trellis'&&Array.from({length:Math.ceil(row.length/p.settings.spacing)+1},(_,i)=>{const count=Math.ceil(row.length/p.settings.spacing),a=row.points[0],b=row.points.at(-1),q=transform.toSvg({x:a.x+(b.x-a.x)*i/count,y:a.y+(b.y-a.y)*i/count});return<circle key={i} cx={q.x} cy={q.y} r=".27" fill={i===0||i===count?'#5f6870':'#899198'}/>})}
     {kind==='irrigation'&&settings.method!=='drip'&&<path d={row.points.map(point=>{const q=transform.toSvg(point),r=.3;return`M${q.x-r} ${q.y}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0`}).join(' ')} fill="#257ca3"/>}
    </g>)}
    {kind==='irrigation'&&!drawingMain&&p?.header.length>1&&<polyline points={points(p.header)} fill="none" stroke="#216d99" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={isIrrigationMainBuried(p.settings)?'5 3':undefined} vectorEffect="non-scaling-stroke"/>}
    {sketchEnd&&<g pointerEvents="none" aria-hidden="true">
     <polyline points={points(mainSketch)} fill="none" stroke="#216d99" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
     {canDrawMain&&<line key={drawingMain.length} ref={previewLine} x1={sketchEnd.x} y1={sketchEnd.y} x2={sketchEnd.x} y2={sketchEnd.y} visibility="hidden" stroke="#216d99" strokeWidth="2.5" strokeDasharray="7 6" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>}
     {mainSketch.map((point,index)=>{const at=transform.toSvg(point);return <circle key={index} cx={at.x} cy={at.y} r=".63" fill="#216d99" stroke="#fffdf8" strokeWidth=".25"/>})}
    </g>}
    {kind==='irrigation'&&showWire&&trellisOverlay.map(row=><polyline key={`wire-${row.key}`} points={row.line} fill="none" stroke="#303a38" strokeWidth="1.2" strokeDasharray="4 2" vectorEffect="non-scaling-stroke" pointerEvents="none"><title>{row.name} · 설계된 와이어 {trellis.settings?.wires||1}단</title></polyline>)}
    {kind==='irrigation'&&showSupports&&trellisOverlay.map(row=><g key={`supports-${row.key}`} pointerEvents="none"><path d={row.posts} fill="#414d51"/><path d={row.stakes} fill="#9b6334"/><title>{row.name} · 비계파이프 · 나무당 개별 지주 {trellis.settings?.stakes||0}개</title></g>)}
    {showTrees&&<path d={treePath} fill="#2c7746" stroke="#f7fbf2" strokeWidth=".09" pointerEvents="none"><title>재배구역 식재 계획의 나무 위치</title></path>}
    {waterSource&&kind==='irrigation'&&<circle cx={transform.toSvg(waterSource).x} cy={transform.toSvg(waterSource).y} r="1.2" fill="#176f9a"/>}
   </svg>
  </div><aside className="cadastre-editor__tools">
   {source.error&&<><p role="alert">{source.error}</p><button type="button" onClick={()=>onSelectDesign('farm')}>식재 열 설계로 이동</button></>}
   <label>설계할 재배구역<select value={activeZoneId} onChange={e=>{setZoneId(e.target.value);setKeys(null)}}>{zoneChoices.map(zone=><option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></label>
   {kind==='irrigation'&&<><label>관수 수원<select value={waterFacility?.id||''} onChange={e=>setSourceId(e.target.value)}><option value="">나중에 연결</option>{waterSources.map(site=><option key={site.id} value={site.id}>{site.name} · {site.type==='well'?'관정':'물탱크'}{site.status==='planned'?' (설계안)':''}</option>)}</select></label>{old?.awaitingWaterSource&&<p>저장된 설계는 수원 연결을 기다리고 있습니다.</p>}</>}
   {kind==='trellis'?<><label><span>비계파이프 최대 간격 · {RECOMMENDED_OPTION_MARK} {DEFAULT_SCAFFOLD_SPACING_M}m</span><input type="number" min="2.5" max="10" step=".5" value={settings.spacing} onChange={e=>set('spacing',Number(e.target.value))}/></label><label><span>나무당 개별 지주</span><select value={settings.stakes} onChange={e=>set('stakes',Number(e.target.value))}>{STAKE_COUNT_OPTIONS.map(n=><option key={n} value={n}>{STAKE_RECOMMENDED_FOR[n]?`${RECOMMENDED_OPTION_MARK} · ${n}개 (${STAKE_RECOMMENDED_FOR[n]})`:`${n}개`}</option>)}</select></label><label><span>와이어 단수</span><select value={settings.wires} onChange={e=>set('wires',Number(e.target.value))}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n===3?`${RECOMMENDED_OPTION_MARK} · `:''}{n}단</option>)}</select></label></>:<>
    <div className="orchard-infrastructure__method cadastre-setting-card" role="group" aria-label="관수 방식"><strong>관수 방식</strong><div className="orchard-infrastructure__method-options">{[{key:'drip',name:'점적관수',detail:'점적구당 2L/h'},{key:'sprinkler',name:'스프링클러',detail:'주당 40L/h'},{key:'micro',name:'미세살수',detail:'주당 30L/h'}].map(method=><button key={method.key} type="button" aria-pressed={settings.method===method.key} onClick={()=>set('method',method.key)}><strong>{method.name}</strong><small>{method.detail}</small></button>)}</div></div>
    <label>32mm 주관 배치<select value={settings.mainPlacement} disabled={Boolean(drawingMain)} onChange={e=>set('mainPlacement',e.target.value)}><option value="buried">{RECOMMENDED_OPTION_MARK} · 열 시작부 자동 연결</option><option value="edge">재배구역 가장자리 자동 연결</option><option value="custom">지도에서 직접 그리기</option></select></label>
    <label>주관 설치 방식<select value={settings.mainMount} onChange={e=>set('mainMount',e.target.value)}><option value="buried">땅속 매설</option><option value="scaffold">비계파이프 높이에 설치 ({SCAFFOLD_PIPE_LENGTH_M}m)</option></select></label>
    {settings.mainPlacement==='custom'&&<>
     <p>{drawingMain?`지도에서 순서대로 점을 찍으세요. ${drawingMain.length}개 배치됨`:'수원 쪽부터 주관을 그리면 선택한 나무 열이 가까운 지점에 자동 연결됩니다.'}</p>
     <div className="cadastre-editor__toolbar">{drawingMain?<>
      <button type="button" disabled={drawingMain.length<2} onClick={()=>{setMainWaypoints(drawingMain);setDrawingMain(null);setPanMode(false);}}>경로 그리기 완료</button>
      <button type="button" disabled={!drawingMain.length} onClick={()=>setDrawingMain(drawingMain.slice(0,-1))}>한 점 취소</button>
      <button type="button" onClick={()=>{setDrawingMain(null);setPanMode(false);}}>그리기 취소</button>
     </>:<button type="button" disabled={!field.owned} onClick={()=>{setDrawingMain([]);svg.current?.scrollIntoView({block:'nearest'});}}>{mainWaypoints.length?'주관 다시 그리기':'주관 경로 그리기'}</button>}</div>
    </>}
    {p&&!drawingMain&&<small>32mm 주관 길이 {p.headerLength.toLocaleString('ko-KR',{maximumFractionDigits:1})}m{needsWaterSource?' · 수원 연결 구간 제외':''}</small>}
    {settings.method!=='drip'&&<p>32mm 관을 각 나무 열에 한 줄씩 놓고 살수 장치를 연결합니다.</p>}
    {settings.method==='drip'&&<><label>점적구 배치 기준<select value={settings.emitterMode} onChange={e=>set('emitterMode',e.target.value)}><option value="tree">{RECOMMENDED_OPTION_MARK} · 나무 수 기준</option><option value="row">열당 고정 개수</option></select></label>{settings.emitterMode==='row'?<label>열당 점적구<input type="number" min="1" max="500" step="1" value={settings.rowEmitters} onChange={e=>set('rowEmitters',Number(e.target.value))}/></label>:<label>나무당 점적구<select value={settings.emitters} onChange={e=>set('emitters',Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n} value={n}>{n===2?`${RECOMMENDED_OPTION_MARK} · `:''}{n}개</option>)}</select></label>}</>}
   </>}
   <div className="orchard-infrastructure__row-heading"><div><h4>설계할 나무 열</h4><small>{availableRows.length}열 중 {selected.length}열 선택</small></div><button type="button" className="orchard-infrastructure__row-toggle" aria-expanded={rowsOpen} aria-controls={`orchard-infrastructure-rows-${kind}`} onClick={()=>setRowsOpen(open=>!open)}>{rowsOpen?'접기':'펼치기'}</button></div>
   <div id={`orchard-infrastructure-rows-${kind}`} className={`orchard-infrastructure__row-picker${rowsOpen?' is-open':''}`} aria-hidden={!rowsOpen}><button type="button" disabled={!rowsOpen} onClick={()=>setKeys(selected.length===availableRows.length?[]:availableRows.map(r=>r.key))}>{selected.length===availableRows.length?'선택 해제':'전체 선택'}</button><div className="orchard-infrastructure__rows">{availableRows.map(row=><label key={row.key}><input type="checkbox" disabled={!rowsOpen} checked={selected.includes(row.key)} onChange={e=>setKeys(e.target.checked?[...selected,row.key]:selected.filter(k=>k!==row.key))}/><span>{row.name}<small>{row.treeCount}주 · {Math.hypot(row.points.at(-1).x-row.points[0].x,row.points.at(-1).y-row.points[0].y).toFixed(5)*1000}m</small></span></label>)}</div></div>
   <div className="orchard-infrastructure__row-heading"><h4>설계 자재량</h4><button type="button" className="orchard-infrastructure__row-toggle" aria-expanded={materialsOpen} aria-controls={`orchard-infrastructure-materials-${kind}`} onClick={()=>setMaterialsOpen(open=>!open)}>{materialsOpen?'접기':'펼치기'}</button></div>
   <div id={`orchard-infrastructure-materials-${kind}`} className={`orchard-infrastructure__material-details${materialsOpen?' is-open':''}`} aria-hidden={!materialsOpen}><div><dl className="orchard-infrastructure__materials">{Object.entries(materials).map(([key,n])=><div key={key}><dt>{catalog[key]?.name||key}</dt><dd>{n.toLocaleString('ko-KR',{maximumFractionDigits:1})}{key.includes('100m')||key==='trellisWire'?'m':key==='bindingString400Pack'?'개':catalog[key]?.unit}</dd></div>)}</dl></div></div>
   {investment&&<div className="trellis-investment-summary"><div className="trellis-investment-summary__heading"><h4>선택 열 완공 시 예상</h4><button type="button" className="orchard-infrastructure__row-toggle" aria-expanded={investmentOpen} aria-controls="trellis-investment-details" onClick={()=>setInvestmentOpen(open=>!open)}>{investmentOpen?'접기':'펼치기'}</button></div><div id="trellis-investment-details" className={`trellis-investment-summary__details${investmentOpen?' is-open':''}`} aria-hidden={!investmentOpen}><div><dl><div><dt>전량 신규 자재 구매비</dt><dd>{purchaseCost.toLocaleString()}원</dd></div><div><dt>태풍 때 열별 파손 확률</dt><dd>{(investment.risk*100).toFixed(1)}%</dd></div><div><dt>가지유인 노동력 절감</dt><dd>{(investment.trainingSaving*100).toFixed(1)}%</dd></div><div><dt>유지보수 부담 지수</dt><dd>×{investment.upkeepFactor.toFixed(2)}</dd></div></dl><small>게임 밸런스 기준. 실제 효과는 설치 범위와 내구도에 따라 달라지며, 자재를 늘릴수록 추가 효과는 줄어듭니다.</small></div></div></div>}
   {kind==='trellis'&&old&&old.materialVersion!==2&&<p role="alert">비계파이프 자재 기준으로 설계를 다시 확정해 주세요. 기존 진행량은 초기화됩니다.</p>}
   {!result.ok&&!drawingMain&&<p role="alert" className="cadastre-editor__error">{result.message}</p>}
   <button type="button" className="cadastre-design-confirm" disabled={!field.owned||!result.ok||Boolean(drawingMain)} onClick={requestSave}>{old?.awaitingWaterSource&&waterFacility?'수원 연결 확정':'설계 확정'}</button>
   {notice&&<p role="status">{notice}</p>}
   {old&&!old.awaitingWaterSource&&<button type="button" onClick={()=>onOpenWorkTab?.('facility')}>작업 탭에서 시공</button>}
  </aside></div>
  {currentInvestment&&<section className="trellis-investment-status" aria-label="지주시설 투자 효과"><h4>현재 시공 상태와 효과</h4><p>평균 내구도 {currentInvestment.condition.toFixed(1)}% · 현재 가지유인 절감 {(currentInvestment.trainingSaving*100).toFixed(1)}% · 보수 대상 {currentInvestment.damaged}열</p><div>{old.rows.map(row=>{const m=trellisRowMetrics(old,row);return<article key={row.key}><strong>{row.name}</strong><span>{row.done?.posts?'비계 설치':'비계 미설치'} · {row.done?.wire?'와이어 연결':'와이어 미연결'}</span><progress max="100" value={m.condition} aria-label={`${row.name} 내구도`}/><small>내구도 {m.condition.toFixed(1)}% · 태풍 파손 확률 {(m.damageProbability*100).toFixed(1)}%</small></article>})}</div>{currentInvestment.damaged>0&&<button type="button" onClick={()=>onOpenWorkTab?.('facility')}>작업 탭에서 손상 시설 보수</button>}</section>}
  {kind==='irrigation'&&old&&!old.awaitingWaterSource&&<section className="orchard-infrastructure__operation" aria-label="구역별 관수 운전"><h4>구역별 순차 관수</h4><p>게임 기준 펌프 {INFRASTRUCTURE_PUMP.litersPerHour.toLocaleString()}L/h · 양정 {INFRASTRUCTURE_PUMP.headM}m. 관정 직결은 완공된 관정·농사용 전기·지하수가 필요하고, 물탱크 연결은 완공된 물탱크·관수펌프·농사용 전기·저장 물이 필요합니다.</p>
   <div className="orchard-infrastructure__operation-controls"><label>구역당 열 수<input type="number" min="1" max="20" value={settings.groupSize} onChange={e=>set('groupSize',Number(e.target.value))}/></label><label>구역당 운전 시간<input type="number" min=".25" max="4" step=".25" value={settings.hours} onChange={e=>set('hours',Number(e.target.value))}/></label>
   <button type="button" onClick={()=>{const r=onIrrigationSettings?.({...settings,enabled:old.settings.enabled});setNotice(r?.message||'운전 설정을 저장하지 못했습니다.')}}>운전 설정 저장</button>
   <button type="button" onClick={()=>{const r=onIrrigationSettings?.({...settings,enabled:!old.settings.enabled});setNotice(r?.message||'운전 설정을 저장하지 못했습니다.')}}>{old.settings.enabled?'관수 끄기':'관수 켜기'}</button></div>
   <p>현재 저장된 운전: {demand?.groups.length||0}구역 · {demand?.hours?.toFixed(1)||0}시간/일 · 필요 물 {Math.round(demand?.liters||0).toLocaleString()}L/일 · {waterSources.find(site=>site.id===old.sourceId)?.type==='well'?`지하수 ${Math.floor((field.groundwaterTonsBase||0)*1000).toLocaleString()}L`:`탱크 ${Math.floor(field.tankWaterLiters||0).toLocaleString()}L`}</p>
   {demand?.error&&<p role="status">{demand.error}</p>}
   <div className="orchard-infrastructure__groups">{demand?.groups.map((g,i)=><div key={i}><strong>{i+1}구역 · {g.trees}주</strong><span>{Math.round(g.litersPerHour)}L/h · 필요 양정 {g.requiredHead.toFixed(1)}m</span><b>{g.ready?'급수 가능':'유량·압력 부족'}</b></div>)}</div>
  </section>}
  {(replacesPlan||needsWaterSource)&&<dialog
   ref={confirmDialog}
   className="confirm-modal orchard-infrastructure__confirm"
   aria-labelledby={`${confirmId}-title`}
   aria-describedby={`${confirmId}-desc`}
   onKeyDown={event=>{if(event.key==='Escape')event.stopPropagation();}}
  >
   <div className="confirm-modal__title" id={`${confirmId}-title`}>
    {needsWaterSource?'수원 연결은 나중에 할까요?':`${kind==='trellis'?'지주시설':'관수시설'} 설계를 다시 확정할까요?`}
   </div>
   <div className="confirm-modal__desc" id={`${confirmId}-desc`}>
    {needsWaterSource&&<p>관수 설계를 먼저 확정할 수 있습니다. 물탱크를 설치하거나 관정을 판 뒤, 이 설계에서 수원을 선택하고 다시 확정하면 시공을 이어갈 수 있습니다.</p>}
    {replacesPlan&&<p>새 설계를 확정하면 기존 시공 진행량이 초기화되고, 사용한 자재는 돌려받을 수 없습니다.</p>}
   </div>
   <div className="footer-actions">
    <button type="button" className="button button--ghost" onClick={()=>confirmDialog.current?.close()}>취소</button>
    <button type="button" className="button button--primary" onClick={()=>{
     if(!confirmDialog.current?.open)return;
     confirmDialog.current.close();
     save();
    }}>{needsWaterSource?'수원 없이 확정':'새 설계 확정'}</button>
   </div>
  </dialog>}
 </section>;
}
