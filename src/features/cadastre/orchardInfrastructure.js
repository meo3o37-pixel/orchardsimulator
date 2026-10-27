import {facilityFootprints}from'../facility/facilityConstruction.js';
import { generatePlantingPreview } from './plantingDesign.js';
import { normalizeCultivationZones, validateCultivationZone } from './cultivationZones.js';
import { orchardTreeRows } from './orchardPipeLayout.js';
import { polygonContainsPoint } from './cadastreData.js';
import { selfLaborAvailable } from '../../utils/overwork.js';
import { yardFootprints } from './openYard.js';
import { SHOP_ITEMS } from '../../config/items/index.js';
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

export function infrastructureSource(field,zonesRaw=[],boundary){
 const zones=normalizeCultivationZones(zonesRaw).filter(z=>z.kind==='farm'&&z.planting?.variety);
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
 return{rows,boundary,error:rows.length?'':'2주 이상 배치된 나무 열이 필요합니다.',signature:JSON.stringify(rows.map(r=>[r.key,r.points]))};
}
export function infrastructureSettings(kind,raw={}){
 if(kind==='trellis')return normalizeTrellisInvestment(raw);
 return{lines:Math.round(clamp(raw.lines??1,1,2)),method:['drip','sprinkler','micro'].includes(raw.method)?raw.method:'drip',emitters:Math.round(clamp(raw.emitters??2,1,4)),hours:clamp(raw.hours??1,.25,4),groupSize:Math.round(clamp(raw.groupSize??2,1,20)),enabled:Boolean(raw.enabled)};
}
const add=(bag,key,n)=>{bag[key]=(bag[key]||0)+n;};
const packSize=key=>key==='irrigationPipe100mRoll'||key==='irrigationMain32x100m'?100:key==='bindingString400Pack'?400:1;
export function buildInfrastructurePlan(kind,source,raw,selectedKeys,waterSource){
 const settings=infrastructureSettings(kind,raw),rows=source.rows.filter(r=>selectedKeys.includes(r.key)).map(r=>({...r,length:dist(r.points[0],r.points.at(-1)),done:{}}));
 if(!rows.length)return fail('설계할 나무 열을 선택해 주세요.');
 if(kind==='irrigation'&&(!Number.isFinite(waterSource?.x)||!Number.isFinite(waterSource?.y)))return fail('지도에서 수원 연결 위치를 선택해 주세요.');
 // A single header from the selected source through row starts, in source order.
 const header=kind==='irrigation'?[waterSource,...rows.map(r=>r.points[0])]:[];
 const headerLength=sum(header.slice(1).map((p,i)=>dist(header[i],p)));
 return{ok:true,plan:{version:1,materialVersion:2,kind,sourceSignature:source.signature,settings,rows,header,headerLength,headerDone:false}};
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
 if(stage==='header'){add(need,'irrigationMain32x100m',plan.headerLength);add(need,'irrigationFilterSet',1);}
 if(stage==='lines')add(need,'irrigationPipe100mRoll',row.length*s.lines+2);
 if(stage==='emitters'){add(need,s.method==='drip'?'dripNozzle':s.method==='micro'?'microSprinklerNozzle':'sprinklerNozzle',row.treeCount*(s.method==='drip'?s.emitters:1));add(need,'irrigationValve25',1);}
 return need;
}
export function infrastructureJobs(field){
 return ['trellis','irrigation'].flatMap(kind=>{
  const p=field.orchardInfrastructure?.[kind];if(!p?.rows?.length)return[];
  const jobs=infrastructureStages(kind).map(stage=>({id:`infra:${kind}:${stage}`,kind:'infrastructure',infraKind:kind,stage,panel:'facility',label:`${kind==='trellis'?'지주시설':'관수시설'} · ${labels[stage]}`,total:stage==='header'?1:p.rows.length,done:stage==='header'?(p.headerDone?1:0):p.rows.filter(r=>r.done[stage]).length,unit:stage==='header'?'건':'열'}));
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
const stageLabor=(stage,p,row)=>stage==='posts'?scaffoldCount(row.length,p.settings.spacing)*.5:stage==='wire'?(row.length*p.settings.wires+4)*.025:stage==='ties'?row.treeCount*.15*Math.max(.6,p.settings.stakes??1):stage==='repair'?(scaffoldCount(row.length,p.settings.spacing)*.5+(row.done?.wire?row.length*p.settings.wires*.025:0)+(row.done?.ties?row.treeCount*.15:0))*(1-clamp(row.condition??100,0,100)/100)*.6+.3:stage==='header'?p.headerLength*.04+1:stage==='lines'?(row.length*p.settings.lines+2)*.04:row.treeCount*.1+.3;
export function quoteInfrastructureJob(state,id,jobId,options={},deps={}){
 const f=getField(state,id),job=f&&infrastructureJobs(f).find(j=>j.id===jobId);if(!job)return fail('확정된 시설 설계가 없습니다.');
 if(options.expectedDone!=null&&options.expectedDone!==job.done)return fail('진행량이 변경되었습니다. 다시 확인해 주세요.');
 const p=f.orchardInfrastructure[job.infraKind],stages=infrastructureStages(job.infraKind),index=stages.indexOf(job.stage);
 if(job.infraKind==='trellis'&&p.materialVersion!==2)return fail('지주시설 자재 기준이 바뀌었습니다. 비계파이프 설계를 다시 확정해 주세요.');
 const row=job.stage==='header'?null:job.stage==='repair'?p.rows.find(r=>r.done?.posts&&(r.condition??100)<90):p.rows.find(r=>!r.done[job.stage]&&stages.slice(0,index).every(s=>s==='header'?p.headerDone:r.done[s]));
 if(job.stage==='header'?p.headerDone:!row)return fail(job.done>=job.total?'이미 완료한 공정입니다.':'앞 공정을 먼저 완료해 주세요.');
 const source=infrastructureSource(f,state.cultivationZonesByFieldId?.[String(id)],deps.boundary);
 if(source.error||source.signature!==p.sourceSignature||JSON.stringify(deps.boundary)!==JSON.stringify(p.boundary))return fail('식재 열·토지 경계가 바뀌었습니다. 시설 설계를 다시 확정해 주세요.');
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
export function infrastructureReadyRows(field,kind){const p=field.orchardInfrastructure?.[kind];return p?p.rows.filter(r=>rowReady(p,r)):[];}
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
 const result=buildInfrastructurePlan(kind,source,raw.settings,raw.rowKeys||[],raw.waterSource);if(!result.ok)return result;
 const p=result.plan;
 if(kind==='irrigation')p.settings.enabled=false;
 if(kind==='irrigation'&&p.header.some(point=>!polygonContainsPoint(deps.boundary,point)))return fail('수원과 관수 연결점은 토지 안에 배치해 주세요.');
 // Sample header crossings as well as endpoints; reject routing through buildings.
 for(let i=1;i<p.header.length;i++)for(let t=0;t<=1;t+=.02){const a=p.header[i-1],b=p.header[i],point={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};if(!polygonContainsPoint(deps.boundary,point)||(state.cultivationZonesByFieldId?.[String(id)]||[]).some(z=>z.kind==='building'&&polygonContainsPoint(z.points,point)))return fail('관수 주관이 토지 밖 또는 건물 구역을 지납니다. 수원 위치나 선택 열을 바꿔 주세요.');}
 const countKeys=kind==='trellis'?['trellisWireSupport']:['irrigationPipeBase','dripIrrigation','sprinklerIrrigation','microSprinklerIrrigation'];
 const counts={...f.landFacilityCounts};for(const key of countKeys)counts[key]=0;
 const facilities={...f.landFacilities};for(const key of countKeys)facilities[key]=false;
 const field={...f,landFacilities:facilities,landFacilityCounts:counts,orchardInfrastructure:{...f.orchardInfrastructure,[kind]:{...p,boundary:deps.boundary,boundaryId:deps.boundaryId}},...(kind==='irrigation'?{irrigationPlan:null,microSprinklerEnabled:false}:{})};
 return{ok:true,message:`${kind==='trellis'?'지주':'관수'} 설계를 확정했습니다. 기존 설치 수량은 초기화됩니다. 작업 → 설치작업에서 진행해 주세요.`,state:replace(state,f,field)};
}
export function setInfrastructureIrrigation(state,id,raw){
 const f=getField(state,id),p=f?.orchardInfrastructure?.irrigation;if(!p)return fail('관수 설계를 먼저 확정해 주세요.');
 return{ok:true,message:raw.enabled?'설계 관수를 켰습니다. 물·펌프·전원 조건을 확인한 뒤 다음 날 급수합니다.':'설계 관수를 껐습니다.',state:replace(state,f,{...f,orchardInfrastructure:{...f.orchardInfrastructure,irrigation:{...p,settings:{...p.settings,...infrastructureSettings('irrigation',{...p.settings,hours:raw.hours,groupSize:raw.groupSize,enabled:raw.enabled})}}}})};
}
