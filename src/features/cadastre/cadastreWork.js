import {facilityFootprints}from'../facility/facilityConstruction.js';
import { normalizeCultivationZones, validateCultivationZone, zoneBoundaryError } from './cultivationZones.js';
import { normalizePlantingSettings, plantingSettingsError } from './plantingSettings.js';
import { generatePlantingPreview } from './plantingDesign.js';
import { DRAINAGE_TYPES, normalizeDrainage, drainageLength, drainageScopeMatches, drainagePlantingBlocker, drainageConflictsWithBuildings, drainageWorkQuote, applyDrainageAction } from './drainage.js';
import { isBuried, pipeRate } from './pipeSystem.js';
import { isActualTreeRowPipe } from './orchardPipeLayout.js';
import { normalizeOpenParking, parkingGeometry, parkingPlanError, parkingWorkQuote, parkingDrainageConflict, applyOpenParking } from './openParking.js';
import { allocatePipeMaterials, pipeMaterialLimits } from './pipeMaterials.js';
import { selfLaborAvailable } from '../../utils/overwork.js';
import { infrastructureJobs, quoteInfrastructureJob, executeInfrastructureJob, trellisPointReady, trellisReadyPointSet } from './orchardInfrastructure.js';
import { saveOpenYardPlan, openYardJob, quoteOpenYardWork, executeOpenYardWork, yardFootprints, yardOverlaps, yardGeometry } from './openYard.js';
import { CROPS } from '../../config/game/crops.js';

const MAX_POINTS = 50000;
const int = (n, max=MAX_POINTS) => Math.min(max, Math.max(0, Math.floor(Number(n)||0)));
const signature = z => JSON.stringify([z.kind||'farm',z.points,normalizePlantingSettings(z.planting),z.boundaryContourId]);
const ownedField = (state,id) => state?.fields?.find(f=>String(f.id)===String(id)&&f.owned);
const fail = message => ({ok:false,message});
const updateField = (state,field,next) => ({...state,fields:state.fields.map(f=>f===field?next:f)});

export function normalizeCadastreWork(field) {
 let budget=MAX_POINTS;
 const seen=new Set();
 const plans=(Array.isArray(field?.cadastrePlantingPlans)?field.cadastrePlantingPlans:[]).slice(0,200).flatMap(p=>{
  if(!p?.zoneId||seen.has(p.zoneId)||!Array.isArray(p.points)||p.points.length>budget||!p.points.every(v=>Number.isFinite(v?.x)&&Number.isFinite(v?.y)))return[];
  const planting=normalizePlantingSettings(p.planting);
  if(!planting.variety||plantingSettingsError(planting))return[];
  seen.add(p.zoneId);budget-=p.points.length;
  return[{zoneId:String(p.zoneId),name:String(p.name||'재배구역').slice(0,40),signature:String(p.signature||''),boundaryId:String(p.boundaryId||''),planting,points:p.points.map(({x,y})=>({x,y})),done:int(p.done,p.points.length)}];
 });
 const pending=field?.cadastreParkingPlan;
 const yard=yardGeometry(field?.cadastreYardPlan?.plan);
 return {cadastreYardPlan:yard&&!zoneBoundaryError(field.cadastreYardPlan.boundary)?{plan:{...yard.plan,footprints:yard.footprints},boundary:field.cadastreYardPlan.boundary}:null,cadastrePlantingPlans:plans,cadastreParkingPlan:pending&&normalizeOpenParking(pending.plan)&&!zoneBoundaryError(pending.boundary)?{plan:normalizeOpenParking(pending.plan),boundary:pending.boundary.map(({x,y})=>({x,y}))}:null,
  cadastrePlantContractorDay:int(field?.cadastrePlantContractorDay,1000000),cadastrePlantContractorTrees:int(field?.cadastrePlantContractorTrees,200),
  cadastreParkingCompleted:Number.isFinite(field?.cadastreParkingCompleted?.area)&&field.cadastreParkingCompleted.area>0?{area:field.cadastreParkingCompleted.area,day:int(field.cadastreParkingCompleted.day,1000000)}:null};
}
export function saveParkingWorkPlan(state,id,raw,deps={}) {
 const field=ownedField(state,id);if(!field)return fail('소유한 토지에서 계획해 주세요.');
 if(raw?.boundaryId!==deps.boundaryId||zoneBoundaryError(deps.boundary))return fail('현재 토지 경계를 다시 확인해 주세요.');
 const geometry=parkingGeometry(raw,deps.boundary);
 const error=parkingPlanError(field,geometry,deps.boundary,state.cultivationZonesByFieldId?.[String(id)]||[]);
 if(error)return fail(error);
 return{ok:true,message:'주차장 계획을 확정했습니다. 작업 → 설치작업에서 시공해 주세요.',state:updateField(state,field,{...field,cadastreParkingPlan:{plan:geometry.plan,boundary:deps.boundary.map(({x,y})=>({x,y}))}})};
}
export function saveDrainageWorkPlan(state,id,action,deps={}) {
 const field=ownedField(state,id);if(!field)return fail('소유한 토지에서 계획해 주세요.');
 const scope=action.scope||'all';
 const old=normalizeDrainage(field.drainage);
 if(scope!=='all')action={...action,plan:{...action.plan,routes:[...(old?.routes||[]).filter(r=>!drainageScopeMatches(r,scope)),...(action.plan?.routes||[]).filter(r=>drainageScopeMatches(r,scope))]}};
 if(drainageConflictsWithBuildings(action.plan,(field.facilitySites||[]).filter(s=>s.occupiedPy>0).map(s=>({kind:'building',points:s.points}))))return fail('배수 시설이 건물·공사 부지와 겹칩니다.');
 const parking=field.cadastreParkingPlan?normalizeOpenParking(field.cadastreParkingPlan.plan):field.openParking;
 if(parkingDrainageConflict({...field,openParking:parking},action.plan))return fail('배수 시설이 확정한 주차장·회차 공간과 겹칩니다.');
 return applyDrainageAction(state,id,{...action,kind:'save'},deps);
}
export function saveCadastreZones(state,id,raw,deps={},confirmZoneId='') {
 const field=ownedField(state,id);if(!field)return fail('소유한 토지에서 계획해 주세요.');
 const zones=normalizeCultivationZones(raw);
 if(confirmZoneId&&!zones.some(z=>z.id===confirmZoneId&&z.kind==='farm'))return fail('식재할 재배구역을 선택해 주세요.');
 if(zones.length!==raw?.length||zoneBoundaryError(deps.boundary))return fail('구역과 토지 경계를 확인해 주세요.');
 for(const z of zones){const error=validateCultivationZone({points:z.points,boundaryPoints:deps.boundary,zones,excludeId:z.id});if(error)return fail(error);}
 if(zones.some(z=>z.kind==='building'&&yardFootprints(field,true).some(p=>yardOverlaps(p,z.points))))return fail('건물 구역이 야적창고·통로와 겹칩니다.');
 if(drainageConflictsWithBuildings(field.drainage,zones))return fail('건물 구역이 배수 시설과 겹칩니다.');
 const old=normalizeCadastreWork(field).cadastrePlantingPlans;
 for(const p of old){const z=zones.find(z=>z.id===p.zoneId);if(p.done>0&&(!z||signature(z)!==p.signature))return fail('이미 식재한 구역의 경계·품종·간격은 변경하거나 삭제할 수 없습니다.');}
 if(confirmZoneId&&Number(field.trees)>old.reduce((s,p)=>s+p.done,0))return{ok:true,message:'식재 열 설계를 저장했습니다. 유공관 설계 탭에서 기존 나무 위치를 연결해 주세요.',state:{...state,cultivationZonesByFieldId:{...(state.cultivationZonesByFieldId||{}),[String(id)]:zones}}};
 const ids=new Set([...old.map(p=>p.zoneId),...(confirmZoneId?[confirmZoneId]:[])]);
 const parking=field.cadastreParkingPlan?parkingGeometry(field.cadastreParkingPlan.plan,deps.boundary):null;
 const exclusion=[...facilityFootprints(field),...(parking?.footprints||[...(field.openParking?.footprints||[]),...yardFootprints(field)]),...yardFootprints(field)];
 const plans=[];let total=0;
 for(const z of zones){
  if(!ids.has(z.id))continue;
  const previous=old.find(p=>p.zoneId===z.id);
  if(previous?.done>0){plans.push(previous);total+=previous.points.length;continue;}
  if(!z.planting?.variety||plantingSettingsError(z.planting))return fail('식재할 품종·대목·간격을 확인해 주세요.');
  const preview=generatePlantingPreview(z.points,z.planting,field.drainage?.routes||[],exclusion);
  if(preview.error||!preview.treeCount)return fail(preview.error||'식재 가능한 위치가 없습니다.');
  total+=preview.treeCount;if(total>MAX_POINTS)return fail('한 토지의 설계는 50,000주까지 가능합니다.');
  plans.push({zoneId:z.id,name:z.name,signature:signature(z),boundaryId:deps.boundaryId,planting:z.planting,points:preview.trees,done:0});
 }
 if(total>(deps.maxTreeCapacity?.(field)??MAX_POINTS))return fail(`설계 ${total}주가 토지의 최대 식재 용량을 넘습니다. 간격이나 구역을 조정해 주세요.`);
 return{ok:true,message:confirmZoneId?'식재 계획을 확정했습니다. 작업 → 시즌작업에서 식재해 주세요.':'구역을 저장했습니다.',state:{...updateField(state,field,{...field,cadastrePlantingPlans:plans}),cultivationZonesByFieldId:{...(state.cultivationZonesByFieldId||{}),[String(id)]:zones}}};
}
export function linkExistingTreeRows(state,id,deps={}) {
 const field=ownedField(state,id);if(!field||!(Number(field.trees)>0))return fail('기존 나무가 있는 토지에서 연결해 주세요.');
 if((field.drainage?.routes||[]).some(r=>isBuried(r)&&r.work>0))return fail('이미 매설한 관이 있어 기존 식재 좌표를 다시 연결할 수 없습니다.');
 const zones=normalizeCultivationZones(state.cultivationZonesByFieldId?.[String(id)]||[]).filter(z=>z.kind==='farm'&&z.planting?.variety);
 if(!zones.length||zoneBoundaryError(deps.boundary))return fail('재배구역에서 품종·간격을 정한 식재 열 설계를 먼저 저장해 주세요.');
 const plans=[];const varieties={};let total=0;
 for(const z of zones){
  const error=validateCultivationZone({points:z.points,boundaryPoints:deps.boundary,zones,excludeId:z.id});if(error)return fail(error);
  const preview=generatePlantingPreview(z.points,z.planting,field.drainage?.routes||[],[...(field.openParking?.footprints||[]),...facilityFootprints(field),...yardFootprints(field)]);
  if(preview.error)return fail(preview.error);
  total+=preview.treeCount;if(total>MAX_POINTS)return fail('연결 가능한 식재 위치 수를 넘었습니다.');
  varieties[z.planting.variety]=(varieties[z.planting.variety]||0)+preview.treeCount;
  plans.push({zoneId:z.id,name:z.name,signature:signature(z),boundaryId:deps.boundaryId,planting:z.planting,points:preview.trees,done:preview.treeCount});
 }
 if(total!==Number(field.trees))return fail(`기존 나무 ${field.trees}주와 설계 ${total}주가 다릅니다. 식재 간격·구역을 맞춰 주세요.`);
 const lots=deps.normalizeLots?.(field)||field.plantLots||[{cropId:field.cropId,trees:field.trees}];
 const existing={};for(const lot of lots)existing[lot.cropId]=(existing[lot.cropId]||0)+(Number(lot.trees)||0);
 if(Object.keys({...existing,...varieties}).some(key=>(existing[key]||0)!==(varieties[key]||0)))return fail('기존 품종별 나무 수와 설계가 다릅니다.');
 return{ok:true,message:`기존 ${total}주의 위치를 식재 열 설계에 연결했습니다.`,state:updateField(state,field,{...field,cadastrePlantingPlans:plans})};
}
export function cadastreJobs(state,id) {
 const field=ownedField(state,id);if(!field)return[];
 const {cadastrePlantingPlans,cadastreParkingPlan}=normalizeCadastreWork(field),jobs=infrastructureJobs(field);
 const drainage=normalizeDrainage(field.drainage);
 for(const scope of ['surface','pipes']){
  const routes=drainage?.routes.filter(r=>drainageScopeMatches(r,scope))||[];
  if(!routes.length)continue;
  const pipes=scope==='pipes',base=pipes?'pipes':'drainage';
  jobs.push({id:base,kind:base,scope,panel:'facility',label:pipes?'나무 열 유공관 매설':'배수로 시공',total:routes.reduce((s,r)=>s+drainageLength(r.points),0),done:routes.reduce((s,r)=>s+r.work,0),unit:'m'});
  if(routes.some(r=>r.work>0&&r.blockage>0))jobs.push({id:`${base}Clean`,kind:`${base}Clean`,scope,panel:'facility',label:pipes?'유공관 세척':'배수로 세척',total:routes.reduce((s,r)=>s+r.work,0),done:0,unit:'m'});
 }
 if(cadastreParkingPlan){const g=parkingGeometry(cadastreParkingPlan.plan,cadastreParkingPlan.boundary);if(g)jobs.push({id:'parking',kind:'parking',panel:'facility',label:`노지 주차장 ${g.plan.slots}칸 조성`,total:g.occupiedPy,done:0,unit:'평'});}
 else if(field.cadastreParkingCompleted)jobs.push({id:'parking',kind:'parking',panel:'facility',label:`노지 주차장 ${field.openParking?.slots||0}칸 조성`,total:field.cadastreParkingCompleted.area,done:field.cadastreParkingCompleted.area,unit:'평'});
 for(const p of cadastrePlantingPlans)jobs.push({id:`plant:${p.zoneId}`,kind:'plant',panel:'season',label:`${p.name} · ${CROPS[p.planting.variety]?.name} 식재`,total:p.points.length,done:p.done,unit:'주',plan:p});
 const yardJob=openYardJob(field);if(yardJob)jobs.push(yardJob);
 return jobs;
}
const seedKey = p => `${p.planting.rootstock==='M26'?'seedlingM26':'seedling'}${({fuji:'Fuji',summerPrince:'SummerPrince',hongro:'Hongro',gamhong:'Gamhong',sinano:'Sinano'})[p.planting.variety]}`;
export function quoteCadastreJob(state,id,jobId,options={},deps={}) {
 const field=ownedField(state,id),job=cadastreJobs(state,id).find(j=>j.id===jobId);
 if(!field||!job)return fail('확정된 계획이 없습니다.');
 if(job.kind==='yard')return quoteOpenYardWork(state,id,options,deps);
 if(job.kind==='infrastructure')return quoteInfrastructureJob(state,id,jobId,options,deps);
 if(job.done+.001>=job.total)return fail('이미 완료한 작업입니다.');
 const mode=options.mode||'contractor',machine=deps.machine;
 if(!['contractor','excavator',...(job.kind==='plant'?['shovel']:[])].includes(mode))return fail('작업 방식을 선택해 주세요.');
 if(mode==='excavator'&&(!machine||!deps.excavatorKeys?.has(machine.machineKey)||!(field.machineParkingSlots||[]).includes(machine.id)||!(Number(state.inventory?.[machine.machineKey])>=Number(machine.unitNo||1))||!(deps.durability>0)))return fail('현재 토지에 주차된 정상 상태의 내 굴삭기를 선택해 주세요.');
 let q;
 if(job.kind==='drainageClean'||job.kind==='pipesClean'){
  const d=normalizeDrainage(field.drainage),built=d.routes.filter(r=>r.work>0&&drainageScopeMatches(r,job.scope));
  const cost=mode==='contractor'?Math.max(20000,Math.ceil(built.reduce((s,r)=>s+r.work*(isBuried(r)?pipeRate(r):DRAINAGE_TYPES.find(t=>t.key===r.type).price),0)*.05)):0;
  const labor=mode==='excavator'?Math.max(1,job.total*.025):0,fuel=labor*.6;
  if(mode==='contractor'&&d.lastWorkDay===state.day&&d.contractorMeters>=199.9)return fail('오늘 외주 작업 한도를 사용했습니다.');
  if(state.money<cost||selfLaborAvailable(state)<labor||mode==='excavator'&&deps.fuel<fuel)return fail('세척 작업비·노동력·연료를 확인해 주세요.');
  return{ok:true,amount:job.total,unit:'m',cost,labor,fuel};
 }
 if(job.kind==='drainage'||job.kind==='pipes'){
  if(job.kind==='drainage'&&Number(field.trees)>0)return fail('나무가 있는 토지는 배수로 굴착 전에 위치 확인이 필요합니다.');
  if(job.kind==='pipes'&&(field.drainage?.routes||[]).some(r=>r.type==='pipe100'&&r.work+.01<drainageLength(r.points)&&!isActualTreeRowPipe(field,r,field.drainage.bearing)))return fail('실제 나무 열 아래로 유공관 설계를 다시 확정해 주세요.');
  q=drainageWorkQuote(field.drainage,mode,state.day,state.labor,deps.fuel||0,selfLaborAvailable(state),job.scope,mode==='excavator'?pipeMaterialLimits(state,field,deps):null);
  if(q.error)return fail(q.error);
  const pipeMaterials=allocatePipeMaterials(state,field,normalizeDrainage(field.drainage),q.plan,deps);
  q={...q,cost:Math.max(0,q.cost-pipeMaterials.credit),pipeMaterials};
  if(state.money<q.cost)return fail('오늘 시공비가 부족합니다.');
  const d=normalizeDrainage(field.drainage);
  const materials=d.routes.filter(r=>drainageScopeMatches(r,job.scope)).reduce((s,r)=>s+Math.max(0,drainageLength(r.points)-r.work)*(isBuried(r)?pipeRate(r):DRAINAGE_TYPES.find(t=>t.key===r.type).price)*(mode==='excavator'?.45:1),0);
  const access=d.routes.filter(r=>drainageScopeMatches(r,job.scope)&&isBuried(r)&&r.work<drainageLength(r.points)&&!d.paidAccess.includes(r.id)).length*80000;
  return {...q,ok:true,amount:q.length,unit:'m',remainingCost:Math.max(q.cost,Math.ceil(materials+access+q.outletCost-pipeMaterials.credit))};
 }
 if(job.kind==='parking'){
  const pending=normalizeCadastreWork(field).cadastreParkingPlan;
  q=parkingWorkQuote(field,pending.plan,pending.boundary,mode);if(q.error)return fail(q.error);
  if(mode==='excavator'&&(selfLaborAvailable(state)<q.labor||deps.fuel<q.fuel))return fail('주차장 시공에 필요한 노동력·연료가 부족합니다.');
  if(state.money<q.cost)return fail('주차장 시공비가 부족합니다.');
  return{...q,ok:true,amount:job.total,unit:'평'};
 }
 const p=job.plan,month=deps.month;
 if(![3,4].includes(month))return fail('식재는 3~4월에 가능합니다. 계획은 유지됩니다.');
 if(field.cadastreYardPlan)return fail('확정한 야적창고 공사를 먼저 완료해 주세요.');
 if(field.cadastreParkingPlan)return fail('확정한 주차장 공사를 먼저 완료해 주세요.');
 const blocked=drainagePlantingBlocker(field);if(blocked)return fail(blocked);
 const zone=state.cultivationZonesByFieldId?.[String(id)]?.find(z=>z.id===p.zoneId);
 if(!zone||signature(zone)!==p.signature||p.boundaryId!==deps.boundaryId)return fail('구역·경계가 변경되었습니다. 식재 계획을 다시 확정해 주세요.');
 const preview=generatePlantingPreview(zone.points,p.planting,field.drainage?.routes||[],[...(field.openParking?.footprints||[]),...yardFootprints(field),...facilityFootprints(field)]);
 if(preview.treeCount!==p.points.length||preview.trees.some((v,i)=>Math.abs(v.x-p.points[i].x)>1e-9||Math.abs(v.y-p.points[i].y)>1e-9))return fail('시설 배치가 변경되었습니다. 식재 계획을 다시 확인해 주세요.');
 if(mode==='shovel'&&!deps.hasShovel)return fail('삽이 필요합니다.');
 const key=seedKey(p),bindingKey=options.bindingKey;
 if(!deps.bindingKeys?.includes(bindingKey))return fail('사용할 결속재를 선택해 주세요.');
 const stock=deps.seedlingStock?.(state,field,key)||0,bindingStock=deps.bindingStock?.(state,field,bindingKey)||0;
 const readyPositions=trellisReadyPointSet(field);
 let supported=0;for(const point of p.points.slice(job.done)){if(!trellisPointReady(field,point,readyPositions))break;supported++;}
 if(!supported)return fail('식재할 열의 지주시설 시공을 먼저 완료해 주세요.');
 const remaining=Math.min(job.total-job.done,supported),lpm=mode==='excavator'?.28:.2;
 const contractorRemain=field.cadastrePlantContractorDay===state.day?Math.max(0,200-(field.cadastrePlantContractorTrees||0)):200;
 const amount=int(Math.min(remaining,int(options.quantity)||remaining,stock,bindingStock,Math.max(0,(deps.treeCapacity?.(field)||0)-(field.trees||0)),mode==='contractor'?contractorRemain:selfLaborAvailable(state)/lpm,mode==='excavator'?(deps.fuel||0)/.02:Infinity,mode==='contractor'?Math.floor(state.money/2500):Infinity));
 if(!amount)return fail(stock<=0?'계획한 품종·대목의 묘목이 없습니다.':bindingStock<=0?'결속재가 없습니다.':mode==='contractor'&&!contractorRemain?'오늘 외주 식재 한도 200주를 사용했습니다.':'식재 공간·지주·노동력·연료·작업비를 확인해 주세요.');
 return{ok:true,amount,unit:'주',cost:mode==='contractor'?amount*2500:0,labor:mode==='contractor'?0:amount*lpm,fuel:mode==='excavator'?amount*.02:0,seedlingKey:key,bindingKey,stock,bindingStock,remainingCost:mode==='contractor'?remaining*2500:0};
}
export function executeCadastreJob(state,id,jobId,options={},deps={}) {
 const field=ownedField(state,id),job=cadastreJobs(state,id).find(j=>j.id===jobId);
 if(!field||!job)return fail('확정된 작업이 없습니다.');
 if(options.expectedDone!=null&&Math.abs(job.done-options.expectedDone)>.001)return fail('진행량이 변경되었습니다. 다시 확인해 주세요.');
 const q=quoteCadastreJob(state,id,jobId,options,deps);if(!q.ok)return q;
 const mode=options.mode||'contractor';
 if(job.kind==='yard')return executeOpenYardWork(state,id,options,deps);
 if(job.kind==='infrastructure')return executeInfrastructureJob(state,id,jobId,options,deps);
 if(['drainage','pipes','drainageClean','pipesClean'].includes(job.kind)){
  if(field.drainage?.boundaryId!==deps.boundaryId||JSON.stringify(field.drainage?.boundary)!==JSON.stringify(deps.boundary))return fail('토지 경계가 변경되었습니다. 배수 계획을 다시 확인해 주세요.');
  if(parkingDrainageConflict(field,field.drainage))return fail('배수 시설이 주차장과 겹칩니다.');
  return applyDrainageAction(state,id,{kind:job.kind.endsWith('Clean')?'clean':'work',scope:job.scope,mode,machineId:options.machineId},deps);
 }
 if(job.kind==='parking'){
  const pending=normalizeCadastreWork(field).cadastreParkingPlan;
  if(pending.plan.boundaryId!==deps.boundaryId||JSON.stringify(pending.boundary)!==JSON.stringify(deps.boundary))return fail('토지 경계가 변경되었습니다. 주차장 계획을 다시 확정해 주세요.');
  const result=applyOpenParking(state,id,pending.plan,{...deps,workMode:mode});if(!result.ok)return result;
  const current=ownedField(result.state,id);
  return{...result,state:updateField(result.state,current,{...current,cadastreParkingPlan:null,cadastreParkingCompleted:{day:state.day,area:job.total}})};
 }
 const seedlings=deps.consumeSeedlings(state,field,q.seedlingKey,q.amount);if(!seedlings.ok)return fail('묘목 재고가 변경되었습니다.');
 const intermediate={...state,inventory:seedlings.nextInventory,seedlingExpiryByKey:seedlings.nextSeedlingExpiryByKey,vehicleCargoByInstance:seedlings.nextVehicleCargoByInstance,bindingOpenRemain:state.bindingOpenRemain||{}};
 const binding=deps.consumeBinding(intermediate,field,q.bindingKey,q.amount);if(!binding.ok)return fail('결속재 재고가 변경되었습니다.');
 const plans=normalizeCadastreWork(field).cadastrePlantingPlans.map(p=>p.zoneId===job.plan.zoneId?{...p,done:p.done+q.amount}:p);
 const first=!field.cropId;
 const next={...field,cropId:field.cropId||job.plan.planting.variety,plantedDay:field.plantedDay||state.day,lastHarvestYear:null,trees:(field.trees||0)+q.amount,
  plantLots:[...(deps.normalizeLots?.(field)||field.plantLots||[]),{id:`plan-${job.plan.zoneId}-${state.day}-${job.done}`,cropId:job.plan.planting.variety,plantedDay:state.day,trees:q.amount}],
  cadastrePlantingPlans:plans,quality:first?0:field.quality,fruitLoadPerTree:first?0:field.fruitLoadPerTree,fruitLoadReductionByAge:first?{}:field.fruitLoadReductionByAge,
  ...(mode==='contractor'?{cadastrePlantContractorDay:state.day,cadastrePlantContractorTrees:(field.cadastrePlantContractorDay===state.day?field.cadastrePlantContractorTrees||0:0)+q.amount}:{})};
 const message=`${job.plan.name} ${CROPS[job.plan.planting.variety].name} ${job.plan.planting.rootstock} 식재 ${q.amount}주 (${job.done+q.amount}/${job.total}주)`;
 return{ok:true,message,state:{...updateField(state,field,next),money:state.money-q.cost,labor:state.labor-q.labor,inventory:binding.nextInventory,seedlingExpiryByKey:seedlings.nextSeedlingExpiryByKey,vehicleCargoByInstance:binding.nextVehicleCargoByInstance,bindingOpenRemain:binding.nextBindingOpenRemain,
  ...(mode==='excavator'?{machineFuelByInstance:{...(state.machineFuelByInstance||{}),[deps.machine.id]:Math.max(0,deps.fuel-q.fuel)},equipmentDurabilityByInstance:{...(state.equipmentDurabilityByInstance||{}),[deps.machine.id]:Math.max(0,deps.durability-q.fuel/4.8*(Number(deps.machine.item?.usageWear)||.12))}}:{})}};
}
