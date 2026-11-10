import {facilityFootprints,normalizeFacilitySites}from'../facility/facilityConstruction.js';
import { generatePlantingPreview } from './plantingDesign.js';
import { normalizeCultivationZones, segmentsMeet, validateCultivationZone } from './cultivationZones.js';
import { orchardTreeRows } from './orchardPipeLayout.js';
import { polygonContainsPoint } from './cadastreData.js';
import { selfLaborAvailable } from '../../utils/overwork.js';
import { yardFootprints } from './openYard.js';
import { SHOP_ITEMS } from '../../config/items/index.js';
import { SCAFFOLD_PIPE_LENGTH_M } from '../../config/items/consumableMaterial.js';
import { normalizeTrellisInvestment, scaffoldCount } from './trellisInvestment.js';
const catalog=Object.fromEntries(Object.values(SHOP_ITEMS).flat().map(item=>[item.key,item]));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)*1000;
const sum=a=>a.reduce((s,v)=>s+v,0);
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,Number(v)||0));
const fail=message=>({ok:false,message});
const replace=(s,f,n)=>({...s,fields:s.fields.map(v=>v===f?n:v)});
const getField=(s,id)=>s.fields?.find(f=>String(f.id)===String(id)&&f.owned);
export const INFRASTRUCTURE_TASKS=['trellisInstall','irrigationPipeInstall','dripNozzleInstall','sprinklerNozzleInstall','microSprinklerNozzleInstall'];
export const infrastructureTaskOwned=(field,key)=>Boolean(key==='trellisInstall'?field?.orchardInfrastructure?.trellis:INFRASTRUCTURE_TASKS.includes(key)&&field?.orchardInfrastructure?.irrigation);
const waterSourceType=key=>key==='wellFacility'?'well':/^peTank/.test(key||'')?'tank':null;
const awaitingWaterSourceMessage='물탱크를 설치하거나 관정을 판 뒤, 관수시설 설계에서 수원으로 연결해 주세요.';
export const IRRIGATION_MAIN_MAX_POINTS = 128;
const centerOf=site=>({x:sum(site.points.map(point=>point.x))/site.points.length,y:sum(site.points.map(point=>point.y))/site.points.length});
export function infrastructureWaterSources(field){
 const planned=Array.isArray(field?.cadastreFacilityLayoutPlans)?field.cadastreFacilityLayoutPlans:[];
 const sites=new Map([...planned,...normalizeFacilitySites(field?.facilitySites)].filter(site=>waterSourceType(site.facilityKey)&&site.id&&Array.isArray(site.points)&&site.points.length>=3&&site.points.every(point=>Number.isFinite(point.x)&&Number.isFinite(point.y))).map(site=>[String(site.id),site]));
 return[...sites.values()].map(site=>({id:String(site.id),name:site.name||site.facilityKey,facilityKey:site.facilityKey,type:waterSourceType(site.facilityKey),point:centerOf(site),status:site.status||'planned'}));
}

export function infrastructureSource(field,zonesRaw=[],boundary){
 const normalizedZones=normalizeCultivationZones(zonesRaw);
 const zones=normalizedZones.filter(z=>z.kind==='farm'&&z.planting?.variety);
 if(!zones.length)return{rows:[],error:'재배구역의 품종·식재 간격을 먼저 저장해 주세요.'};
 const plans=[];
 for(const z of zones){
  const error=validateCultivationZone({points:z.points,boundaryPoints:boundary,zones,excludeId:z.id});if(error)return{rows:[],error};
  const preview=generatePlantingPreview(z.points,z.planting,field.drainage?.routes||[],[...(field.openParking?.footprints||[]),...facilityFootprints(field),...yardFootprints(field)]);
  if(preview.error)return{rows:[],error:preview.error};
  plans.push({zoneId:z.id,name:z.name,planting:z.planting,points:preview.trees,done:preview.treeCount});
 }
 const total=sum(plans.map(p=>p.done));if(total>15000)return{rows:[],error:'한 번에 설계 가능한 나무는 15,000주입니다. 재배구역을 나눠 주세요.'};
 const rows=orchardTreeRows({trees:total,cadastrePlantingPlans:plans}).rows.filter(r=>r.points.length>=2);
 if(rows.length>500)return{rows:[],error:'설계 가능한 나무 열은 500열입니다.'};
 return{rows,zones:zones.map(zone=>({id:zone.id,name:zone.name,points:zone.points})),boundary,buildings:normalizedZones.filter(zone=>zone.kind==='building').map(zone=>zone.points),error:rows.length?'':'2주 이상 배치된 나무 열이 필요합니다.',signature:JSON.stringify(rows.map(r=>[r.key,r.points]))};
}
export function infrastructureSettings(kind,raw={}){
 if(kind==='trellis')return normalizeTrellisInvestment(raw);
 const mainMount=raw.mainMount==='scaffold'||(raw.mainMount==null&&Number(raw.mainHeightM)>0)?'scaffold':'buried';
 return{lines:Math.round(clamp(raw.lines??1,1,2)),method:['drip','sprinkler','micro'].includes(raw.method)?raw.method:'drip',mainPlacement:['edge','custom'].includes(raw.mainPlacement)?raw.mainPlacement:'buried',mainMount,mainHeightM:mainMount==='scaffold'?SCAFFOLD_PIPE_LENGTH_M:0,emitterMode:raw.emitterMode==='row'?'row':'tree',emitters:Math.round(clamp(raw.emitters??2,1,4)),rowEmitters:Math.round(clamp(raw.rowEmitters??20,1,500)),hours:clamp(raw.hours??1,.25,4),groupSize:Math.round(clamp(raw.groupSize??2,1,20)),enabled:Boolean(raw.enabled)};
}
export const isIrrigationMainBuried=settings=>settings?.mainMount==='buried'||(settings?.mainMount==null&&settings?.method==='drip'&&settings.mainPlacement==='buried'&&!settings.mainHeightM);
export const irrigationNozzleCount=(settings,row)=>settings.method==='drip'?(settings.emitterMode==='row'?settings.rowEmitters:row.treeCount*settings.emitters):row.treeCount;
const add=(bag,key,n)=>{bag[key]=(bag[key]||0)+n;};
const packSize=key=>['irrigationPipe100mRoll','irrigationMain32x100m','dripHose16x100m'].includes(key)?100:key==='bindingString400Pack'?400:1;
const pathLength=points=>sum(points.slice(1).map((point,index)=>dist(points[index],point)));
const tapOnEdge=(point,a,b,zonePoints)=>{
 const dx=b.x-a.x,dy=b.y-a.y,edgeLength=dist(a,b),margin=Math.min(.49,.25/edgeLength),t=clamp(((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy),margin,1-margin);
 const edge={x:a.x+dx*t,y:a.y+dy*t};
 const length=Math.hypot(dx,dy),offset={x:-dy/length*.00025,y:dx/length*.00025};
 const left={x:edge.x+offset.x,y:edge.y+offset.y},right={x:edge.x-offset.x,y:edge.y-offset.y};
 return{point:polygonContainsPoint(zonePoints,left)?left:right,t};
};
function buildCustomMain(rawWaypoints, rows, waterSource, source, method) {
 if(!Array.isArray(rawWaypoints)||rawWaypoints.length<2||rawWaypoints.length>IRRIGATION_MAIN_MAX_POINTS||rawWaypoints.some(p=>!Number.isFinite(p?.x)||!Number.isFinite(p?.y)))return fail('지도에서 주관 경로를 두 점 이상 그려 주세요.');
 const waypoints=rawWaypoints.map(({x,y})=>({x,y}));
 const segments=waypoints.slice(1).map((end,index)=>({start:waypoints[index],end,taps:[]}));
 if(segments.some(({start,end})=>dist(start,end)<.01))return fail('주관 경로에서 서로 겹치는 점을 지워 주세요.');
 const crosses=(a,b,polygon)=>polygon.some((point,i)=>segmentsMeet(a,b,point,polygon[(i+1)%polygon.length]));
 const blocked=(a,b)=>!polygonContainsPoint(source.boundary,a)||!polygonContainsPoint(source.boundary,b)||crosses(a,b,source.boundary)
  ||(source.buildings||[]).some(polygon=>polygonContainsPoint(polygon,a)||polygonContainsPoint(polygon,b)||crosses(a,b,polygon));
 if(segments.some(({start,end})=>blocked(start,end)))return fail('주관 경로는 토지 안에 그리고 건물 구역을 피해 주세요.');
 if(waterSource&&blocked(waterSource,waypoints[0]))return fail('수원에서 주관 시작점까지 연결할 수 없습니다. 시작점을 수원 가까이 옮겨 주세요.');
 const routed=rows.map(row=>{
  const first=row.points[0],last=row.points.at(-1);
  let nearest=null;
  for(const entry of [first,last])for(const segment of segments){
   const {start,end}=segment,dx=end.x-start.x,dy=end.y-start.y;
   const t=clamp(((entry.x-start.x)*dx+(entry.y-start.y)*dy)/(dx*dx+dy*dy),0,1);
   const point=t===0?start:t===1?end:{x:start.x+t*dx,y:start.y+t*dy};
   const gap=dist(point,entry);
   if(!nearest||gap<nearest.gap)nearest={segment,t,point,entry,gap};
  }
  const {segment,t,point,entry}=nearest;
  if(t>0&&t<1)segment.taps.push({t,point});
  const route=[point,entry,entry===first?last:first];
  return{...row,tap:point,route,lineLength:pathLength(route),...(method==='drip'?{mount:'trellisLowerWire'}:{})};
 });
 if(routed.some(row=>blocked(row.tap,row.route[1])))return fail('주관과 나무 열을 잇는 배관이 토지 밖 또는 건물 구역을 지납니다. 경로를 다시 그려 주세요.');
 const header=[waypoints[0],...segments.flatMap(({end,taps})=>[...taps.sort((a,b)=>a.t-b.t).filter((tap,index,ordered)=>index===0||tap.t!==ordered[index-1].t).map(tap=>tap.point),end])];
 return{ok:true,waypoints,header,rows:routed};
}

export function buildInfrastructurePlan(kind,source,raw,selectedKeys,waterSource,mainWaypoints){
 const settings=infrastructureSettings(kind,raw),rows=source.rows.filter(r=>selectedKeys.includes(r.key)).map(r=>({...r,length:dist(r.points[0],r.points.at(-1)),done:{}}));
 if(!rows.length)return fail('설계할 나무 열을 선택해 주세요.');
 if(kind==='irrigation'&&waterSource&&(!Number.isFinite(waterSource.x)||!Number.isFinite(waterSource.y)))return fail('물탱크 또는 관정의 위치를 확인해 주세요.');
 if(kind==='trellis')return{ok:true,plan:{version:1,materialVersion:2,kind,sourceSignature:source.signature,settings,rows,header:[],headerLength:0,headerDone:false}};
 if(rows.some(row=>String(row.zoneId)!==String(rows[0].zoneId)))return fail('관수 설계는 한 재배구역의 나무 열을 선택해 주세요.');
 settings.lines=1;
 let routed=rows,header,waypoints;
 if(settings.mainPlacement==='custom'){
  const custom=buildCustomMain(mainWaypoints,rows,waterSource,source,settings.method);
  if(!custom.ok)return custom;
  ({rows:routed,header,waypoints}=custom);
 }else if(settings.mainPlacement==='edge'){
  const zone=source.zones?.find(candidate=>String(candidate.id)===String(rows[0].zoneId));
  if(!zone?.points?.length)return fail('재배구역 경계를 찾지 못했습니다.');
  const edges=zone.points.map((a,index)=>[a,zone.points[(index+1)%zone.points.length]]).filter(([a,b])=>dist(a,b)>.1);
  if(!edges.length)return fail('주관을 배치할 재배구역 가장자리가 없습니다.');
  const [a,b]=edges.reduce((best,edge)=>{
   const score=sum(rows.map(row=>{const tap=tapOnEdge(row.points[0],edge[0],edge[1],zone.points).point;return dist(tap,row.points[0])**2;}));
   return !best||score<best.score?{edge,score}:best;
  },null).edge;
  routed=rows.map(row=>{const tap=tapOnEdge(row.points[0],a,b,zone.points);const route=[tap.point,row.points[0],row.points.at(-1)];return{...row,tap:tap.point,route,lineLength:pathLength(route),...(settings.method==='drip'?{mount:'trellisLowerWire'}:{}),edgePosition:tap.t};});
  if(routed.some(row=>!polygonContainsPoint(zone.points,row.tap)||Array.from({length:21},(_,step)=>{const t=step/20,a=row.tap,b=row.points[0];return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}}).some(point=>!polygonContainsPoint(zone.points,point))))return fail('재배구역 가장자리에서 선택 열까지 관수선을 이을 수 없습니다. 주관을 직접 그리거나 열을 나눠 주세요.');
  const ordered=[...routed].sort((first,second)=>first.edgePosition-second.edgePosition);
  if(waterSource&&dist(waterSource,ordered.at(-1).tap)<dist(waterSource,ordered[0].tap))ordered.reverse();
  header=ordered.map(row=>row.tap);
 }else{
  routed=rows.map(row=>({...row,tap:row.points[0],route:[row.points[0],row.points.at(-1)],lineLength:row.length,...(settings.method==='drip'?{mount:'trellisLowerWire'}:{})}));
  header=routed.map(row=>row.tap);
 }
 const height=settings.mainHeightM;
 if(height)routed=routed.map(row=>{
  const gap=dist(row.tap,row.route.length>2?row.route[1]:row.points[0]);
  return{...row,lineLength:row.lineLength-gap+Math.hypot(gap,height)};
 });
 let headerLength=pathLength(header);
 if(waterSource){
  headerLength+=Math.hypot(dist(waterSource,header[0]),height);
  header.unshift(waterSource);
 }
 return{ok:true,plan:{version:2,materialVersion:3,kind,sourceSignature:source.signature,zoneSignature:JSON.stringify(source.zones?.find(zone=>String(zone.id)===String(rows[0].zoneId))?.points||[]),settings,rows:routed,header,headerLength,headerDone:false,...(waypoints?{mainWaypoints:waypoints}:{}),...(!waterSource?{awaitingWaterSource:true}:{})}};
}
export const infrastructureStages=kind=>kind==='trellis'?['posts','wire','ties']:['header','lines','emitters'];
const labels={posts:'비계파이프 설치',wire:'와이어 연결',ties:'개별 지주·결속 준비',repair:'손상 지주시설 보수',header:'주관·필터 연결',lines:'열별 관수배관 설치',emitters:'노즐·구역밸브 설치'};
export function infrastructureNeeds(plan,row,stage){
 const need={},s=plan.settings;
 if(stage==='posts')add(need,'scaffoldPipe',scaffoldCount(row.length,s.spacing));
 if(stage==='wire')add(need,'trellisWire',row.length*s.wires+4);
 if(stage==='ties'){add(need,'trellisStake',row.treeCount*(s.stakes??1));add(need,'bindingString400Pack',row.treeCount*Math.max(1,s.stakes??1));}
 if(stage==='repair'){
  const loss=1-clamp(row.condition??100,0,100)/100;
  add(need,'scaffoldPipe',Math.max(1,Math.ceil(scaffoldCount(row.length,s.spacing)*loss*.35)));
  if(row.done?.wire)add(need,'trellisWire',(row.length*s.wires+4)*loss);
  if(row.done?.ties)add(need,'trellisStake',Math.ceil(row.treeCount*(s.stakes??1)*loss*.35));
  if(row.done?.ties)add(need,'bindingString400Pack',Math.ceil(row.treeCount*loss));
 }
 if(stage==='header')add(need,'irrigationMain32x100m',plan.headerLength);
 if(stage==='lines'){
  if(plan.materialVersion===3)add(need,s.method==='drip'?'dripHose16x100m':'irrigationMain32x100m',row.lineLength);
  else add(need,'irrigationPipe100mRoll',row.length*s.lines+2);
 }
 if(stage==='emitters'){
  if(plan.materialVersion!==3||s.method!=='drip')add(need,s.method==='drip'?'dripNozzle':s.method==='micro'?'microSprinklerNozzle':'sprinklerNozzle',irrigationNozzleCount(s,row));
  add(need,'irrigationValve25',1);
 }
 return need;
}
export function infrastructureJobs(field){
 return ['trellis','irrigation'].flatMap(kind=>{
  const p=field.orchardInfrastructure?.[kind];if(!p?.rows?.length)return[];
  const jobs=infrastructureStages(kind).map(stage=>({id:`infra:${kind}:${stage}`,kind:'infrastructure',infraKind:kind,stage,panel:'facility',label:`${kind==='trellis'?'지주시설':'관수시설'} · ${kind==='irrigation'&&p.materialVersion===3&&stage==='lines'?(p.settings.method==='drip'?'와이어 하단 점적호스 설치':'열별 32mm 주관 설치'):kind==='irrigation'&&p.materialVersion===3&&stage==='emitters'&&p.settings.method==='drip'?'점적호스 밸브 연결':labels[stage]}`,total:stage==='header'?1:p.rows.length,done:stage==='header'?(p.headerDone?1:0):p.rows.filter(r=>r.done[stage]).length,unit:stage==='header'?'건':'열'}));
  const damaged=kind==='trellis'?p.rows.filter(r=>r.done?.posts&&(r.condition??100)<90).length:0;
  if(damaged)jobs.unshift({id:'infra:trellis:repair',kind:'infrastructure',infraKind:kind,stage:'repair',panel:'facility',label:'지주시설 · 손상 지주시설 보수',total:damaged,done:0,unit:'열'});
  return jobs;
 });
}
function requirementsQuote(state,field,need,deps,manual){
 const offcuts={...(field.orchardMaterialRemainders||{})},materials=[];let cost=0;
 for(const [key,amount]of Object.entries(need)){
  if(amount<=1e-6)continue;
  const meta=catalog[key];if(!meta)return fail('등록되지 않은 설계 자재입니다.');
  if(!manual){cost+=amount/packSize(key)*meta.price;continue;}
  const size=packSize(key),stored=clamp(offcuts[key],0,size),units=Math.max(0,Math.ceil((amount-stored-1e-7)/size));
  const stock=deps.consumePipeMaterial?Math.floor(deps.pipeMaterialStock?.(state,field,key)||0):0;
  if(stock<units)return fail(`${meta.name} 부족: ${units}${meta.unit} 필요 / 보유 ${stock}${meta.unit}. 농자재마트에서 구매해 가져와 주세요.`);
  offcuts[key]=Math.max(0,stored+units*size-amount);materials.push({key,units,name:meta.name});
 }
 return{ok:true,cost:Math.ceil(cost),offcuts,materials};
}
const stageLabor=(stage,p,row)=>stage==='posts'?scaffoldCount(row.length,p.settings.spacing)*.5:stage==='wire'?(row.length*p.settings.wires+4)*.025:stage==='ties'?row.treeCount*.15*Math.max(.6,p.settings.stakes??1):stage==='repair'?(scaffoldCount(row.length,p.settings.spacing)*.5+(row.done?.wire?row.length*p.settings.wires*.025:0)+(row.done?.ties?row.treeCount*.15:0))*(1-clamp(row.condition??100,0,100)/100)*.6+.3:stage==='header'?p.headerLength*.04+1:stage==='lines'?(p.materialVersion===3?row.lineLength:row.length*p.settings.lines+2)*.04:row.treeCount*.1+.3;
export function quoteInfrastructureJob(state,id,jobId,options={},deps={}){
 const f=getField(state,id),job=f&&infrastructureJobs(f).find(j=>j.id===jobId);if(!job)return fail('확정된 시설 설계가 없습니다.');
 if(options.expectedDone!=null&&options.expectedDone!==job.done)return fail('진행량이 변경되었습니다. 다시 확인해 주세요.');
 const p=f.orchardInfrastructure[job.infraKind],stages=infrastructureStages(job.infraKind),index=stages.indexOf(job.stage);
 if(p.awaitingWaterSource)return fail(awaitingWaterSourceMessage);
 if(job.infraKind==='trellis'&&p.materialVersion!==2)return fail('지주시설 자재 기준이 바뀌었습니다. 비계파이프 설계를 다시 확정해 주세요.');
 const row=job.stage==='header'?null:job.stage==='repair'?p.rows.find(r=>r.done?.posts&&(r.condition??100)<90):p.rows.find(r=>!r.done[job.stage]&&stages.slice(0,index).every(s=>s==='header'?p.headerDone:r.done[s]));
 if(job.stage==='header'?p.headerDone:!row)return fail(job.done>=job.total?'이미 완료한 공정입니다.':'앞 공정을 먼저 완료해 주세요.');
 if(p.kind==='irrigation'&&p.materialVersion===3&&p.settings.method==='drip'&&job.stage==='lines'){
  const support=f.orchardInfrastructure?.trellis?.rows?.find(candidate=>candidate.key===row.key);
  if(!support?.done?.wire||(support.condition??100)<=20)return fail(`${row.name}: 지주 와이어를 먼저 설치·보수한 뒤 점적호스를 와이어 하단에 달아 주세요.`);
 }
 const source=infrastructureSource(f,state.cultivationZonesByFieldId?.[String(id)],deps.boundary);
 if(source.error||source.signature!==p.sourceSignature||JSON.stringify(deps.boundary)!==JSON.stringify(p.boundary))return fail('식재 열·토지 경계가 바뀌었습니다. 시설 설계를 다시 확정해 주세요.');
 if(p.kind==='irrigation'&&p.materialVersion===3&&p.zoneSignature!==JSON.stringify(source.zones?.find(zone=>String(zone.id)===String(p.rows[0]?.zoneId))?.points||[]))return fail('재배구역 경계가 바뀌었습니다. 관수 주관을 다시 설계해 주세요.');
 if(p.kind==='irrigation'&&p.sourceId){const waterFacility=infrastructureWaterSources(f).find(site=>site.id===p.sourceId);if(!waterFacility||dist(waterFacility.point,p.header[0])>.001)return fail('연결한 물탱크·관정 위치가 바뀌었습니다. 관수 설계를 다시 확정해 주세요.');}
 const manual=options.mode==='manual';if(!manual&&options.mode!=='contractor')return fail('내 노동력 또는 전문 외주를 선택해 주세요.');
 const labor=stageLabor(job.stage,p,row),need=infrastructureNeeds(p,row,job.stage),materials=requirementsQuote(state,f,need,deps,manual);if(!materials.ok)return materials;
 const spent=f.orchardWorkDay===state.day?Number(f.orchardContractorLabor)||0:0;
 if(manual&&selfLaborAvailable(state)+1e-6<labor)return fail(`노동력 ${labor.toFixed(1)}이 필요합니다.`);
 if(!manual&&spent+labor>40)return fail('오늘 시설 외주 작업량을 사용했습니다. 다음 날 이어서 진행해 주세요.');
 const cost=manual?0:Math.ceil(materials.cost+labor*18000);
 if(state.money<cost)return fail(`공사비 ${cost.toLocaleString()}원이 필요합니다.`);
 return{ok:true,amount:1,unit:job.unit,cost,labor:manual?labor:0,fuel:0,workLabor:labor,materials,rowKey:row?.key,job};
}
const rowReady=(p,r)=>infrastructureStages(p.kind).every(s=>s==='header'?p.headerDone:r.done[s])&&(p.kind!=='trellis'||(r.condition??100)>20);
export function infrastructureReadyRows(field,kind){const p=field.orchardInfrastructure?.[kind];return p?p.rows.filter(r=>rowReady(p,r)&&(kind!=='irrigation'||p.materialVersion!==3||p.settings.method!=='drip'||field.orchardInfrastructure?.trellis?.rows?.some(support=>support.key===r.key&&support.done?.wire&&(support.condition??100)>20))):[];}
const pointKey=p=>`${p.x.toFixed(8)}:${p.y.toFixed(8)}`;
export function trellisReadyPointSet(field){return field.orchardInfrastructure?.trellis?new Set(infrastructureReadyRows(field,'trellis').flatMap(r=>r.points.map(pointKey))):null;}
export function trellisPointReady(field,point,ready=trellisReadyPointSet(field)){return !ready||ready.has(pointKey(point));}
export function executeInfrastructureJob(state,id,jobId,options,deps){
 const q=quoteInfrastructureJob(state,id,jobId,options,deps);if(!q.ok)return q;
 const f=getField(state,id),p=f.orchardInfrastructure[q.job.infraKind];let next=state;
 if(options.mode==='manual')for(const material of q.materials.materials){if(!material.units)continue;const consumed=deps.consumePipeMaterial(next,f,material.key,material.units);if(!consumed?.ok)return fail('공사용 자재 재고가 변경되었습니다.');next={...next,inventory:consumed.inventory,vehicleCargoByInstance:consumed.vehicleCargoByInstance};}
 const updated={...p,headerDone:p.headerDone||q.job.stage==='header',rows:p.rows.map(r=>r.key===q.rowKey?{...r,...(q.job.stage==='repair'||q.job.stage==='posts'?{condition:100}:{}),done:{...r.done,...(q.job.stage==='repair'?{}:{[q.job.stage]:true})}}:r)};
 let field={...f,orchardInfrastructure:{...f.orchardInfrastructure,[q.job.infraKind]:updated},...(options.mode==='manual'?{orchardMaterialRemainders:q.materials.offcuts}:{orchardWorkDay:state.day,orchardContractorLabor:(f.orchardWorkDay===state.day?Number(f.orchardContractorLabor)||0:0)+q.workLabor})};
 if(q.job.infraKind==='trellis')field={...field,landFacilityCounts:{...field.landFacilityCounts,trellisWireSupport:sum(infrastructureReadyRows(field,'trellis').map(r=>r.treeCount))}};
 // New irrigation stays independent of legacy per-tree facility assignment.
 return{ok:true,message:`${q.job.label} ${q.rowKey?updated.rows.find(r=>r.key===q.rowKey).name:'수원 연결'} 완료`,state:{...replace(next,f,field),money:state.money-q.cost,labor:state.labor-q.labor}};
}
export function saveInfrastructurePlan(state,id,kind,raw,deps){
 const f=getField(state,id);if(!f||!['trellis','irrigation'].includes(kind))return fail('소유 토지의 시설을 선택해 주세요.');
 const source=infrastructureSource(f,state.cultivationZonesByFieldId?.[String(id)],deps.boundary);if(source.error)return fail(source.error);
 const waterSourceId=String(raw.waterSourceId??'');
 const waterFacility=kind==='irrigation'&&waterSourceId?infrastructureWaterSources(f).find(site=>site.id===waterSourceId):null;
 if(kind==='irrigation'&&waterSourceId&&!waterFacility)return fail('지도에 배치된 물탱크 또는 관정을 수원으로 선택해 주세요.');
 const result=buildInfrastructurePlan(kind,source,raw.settings,raw.rowKeys||[],waterFacility?.point||null,raw.mainWaypoints);if(!result.ok)return result;
 const p=result.plan;
 if(waterFacility)p.sourceId=waterFacility.id;
 if(kind==='irrigation')p.settings.enabled=false;
 if(kind==='irrigation'&&p.header.some(point=>!polygonContainsPoint(deps.boundary,point)))return fail('수원과 관수 연결점은 토지 안에 배치해 주세요.');
 if(kind==='irrigation'&&p.materialVersion===3){
  if(p.rows.some(row=>!p.header.some(point=>dist(point,row.tap)<.001)))return fail('모든 열의 관수선을 32mm 주관에 연결해 주세요.');
  const buildings=(state.cultivationZonesByFieldId?.[String(id)]||[]).filter(zone=>zone.kind==='building');
  for(const path of [p.header,...p.rows.map(row=>row.route)])for(let i=1;i<path.length;i++)for(let step=0;step<=50;step++){
   const a=path[i-1],b=path[i],t=step/50,point={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
   if(!polygonContainsPoint(deps.boundary,point)||buildings.some(zone=>polygonContainsPoint(zone.points,point)))return fail('관수 배관이 토지 밖 또는 건물 구역을 지납니다. 주관 배치나 선택 열을 바꿔 주세요.');
  }
 }
 const countKeys=kind==='trellis'?['trellisWireSupport']:['irrigationPipeBase','dripIrrigation','sprinklerIrrigation','microSprinklerIrrigation'];
 const counts={...f.landFacilityCounts};for(const key of countKeys)counts[key]=0;
 const facilities={...f.landFacilities};for(const key of countKeys)facilities[key]=false;
 const field={...f,landFacilities:facilities,landFacilityCounts:counts,orchardInfrastructure:{...f.orchardInfrastructure,[kind]:{...p,boundary:deps.boundary,boundaryId:deps.boundaryId}},...(kind==='irrigation'?{irrigationPlan:null,microSprinklerEnabled:false}:{})};
 const message=p.awaitingWaterSource?`관수 설계를 확정했습니다. ${awaitingWaterSourceMessage}`:`${kind==='trellis'?'지주':'관수'} 설계를 확정했습니다. 작업 → 설치작업에서 진행해 주세요.`;
 return{ok:true,message,state:replace(state,f,field)};
}
export function setInfrastructureIrrigation(state,id,raw){
 const f=getField(state,id),p=f?.orchardInfrastructure?.irrigation;if(!p)return fail('관수 설계를 먼저 확정해 주세요.');
 if(p.awaitingWaterSource)return fail(awaitingWaterSourceMessage);
 const {hours,groupSize,enabled}=infrastructureSettings('irrigation',raw);
 return{ok:true,message:enabled?'설계 관수를 켰습니다. 물·펌프·전원 조건을 확인한 뒤 다음 날 급수합니다.':'설계 관수를 껐습니다.',state:replace(state,f,{...f,orchardInfrastructure:{...f.orchardInfrastructure,irrigation:{...p,settings:{...p.settings,hours,groupSize,enabled}}}})};
}
