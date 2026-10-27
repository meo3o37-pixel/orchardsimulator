import polygonClipping from 'polygon-clipping';
import {polygonAreaSqKmFromPoints,polygonContainsPoint}from'./cadastreData.js';
import {validateCultivationZone}from'./cultivationZones.js';
import {drainageFootprintPaths}from'./drainage.js';
import {selfLaborAvailable}from'../../utils/overwork.js';
import {parkingGeometry}from'./openParking.js';
export const OPEN_YARD_KEY='openStorage3000Py';
export const YARD_PY_M2=3.305785,YARD_SLOT_KG=1500,YARD_AISLE_M=3;
const point=p=>Number.isFinite(p?.x)&&Number.isFinite(p?.y);
const ring=p=>[p.map(v=>[v.x,v.y])];
const area=multi=>multi.reduce((sum,poly)=>sum+poly.reduce((s,r,i)=>s+(i?-1:1)*polygonAreaSqKmFromPoints(r.map(([x,y])=>({x,y}))),0),0);
export function yardOverlaps(a,b){try{return area(polygonClipping.intersection(ring(a),ring(b)))>1e-10}catch{return true}}
export function yardGeometry(raw){
 if(raw?.version!==1||!point(raw.anchor)||!Number.isFinite(raw.width)||!Number.isFinite(raw.depth)||!Number.isFinite(raw.angle)||raw.width<2||raw.depth<2||raw.width>100||raw.depth>100||raw.angle<0||raw.angle>=360)return null;
 const plan={version:1,width:raw.width,depth:raw.depth,angle:raw.angle,anchor:{...raw.anchor},boundaryId:String(raw.boundaryId||'')};
 const c=Math.cos(raw.angle*Math.PI/180),s=Math.sin(raw.angle*Math.PI/180);
 const world=(x,y)=>({x:raw.anchor.x+(x*c-y*s)/1000,y:raw.anchor.y+(x*s+y*c)/1000});
 const rect=(x,y,w,h)=>[world(x,y),world(x+w,y),world(x+w,y+h),world(x,y+h)];
 const storage=rect(0,0,raw.width,raw.depth),aisle=rect(0,raw.depth,raw.width,YARD_AISLE_M),pitch=Math.sqrt(YARD_PY_M2);
 const cols=Math.floor(raw.width/pitch),rows=Math.floor(raw.depth/pitch),slots=cols*rows;
 const pallets=Array.from({length:slots},(_,i)=>rect((i%cols)*pitch+(pitch-1.1)/2,Math.floor(i/cols)*pitch+(pitch-1.1)/2,1.1,1.1));
 return{plan,storage,aisle,footprints:[storage,aisle],storagePy:raw.width*raw.depth/YARD_PY_M2,aislePy:raw.width*YARD_AISLE_M/YARD_PY_M2,occupiedPy:raw.width*(raw.depth+YARD_AISLE_M)/YARD_PY_M2,slots,capacityKg:slots*YARD_SLOT_KG,pallets};
}
export function normalizeOpenYard(raw){const g=yardGeometry(raw);return g?{...g.plan,footprints:g.footprints,occupiedPy:g.occupiedPy,storagePy:g.storagePy,slots:g.slots,capacityKg:g.capacityKg}:null;}
export function yardFootprints(field,includePending=false){return[...(normalizeOpenYard(field?.openYard)?.footprints||[]),...(includePending?(yardGeometry(field?.cadastreYardPlan?.plan)?.footprints||[]):[])];}
export function yardPlanError(field,g,boundary,zones=[],usedKg=0,usedSlot=0){
 if(!g)return'지도에서 야적창고 위치와 크기를 정해 주세요.';
 for(const footprint of g.footprints){const error=validateCultivationZone({points:footprint,boundaryPoints:boundary,zones:zones.filter(z=>z.kind!=='farm')});if(error)return`야적면·통로: ${error}`;}
 if(g.capacityKg+1e-6<usedKg||g.slots<usedSlot)return'현재 보관 중인 물품·수확물·파렛트를 수용할 수 없습니다. 적재면을 넓히거나 먼저 옮겨 주세요.';
 const planted=(field.cadastrePlantingPlans||[]).flatMap(p=>(p.points||[]).slice(0,p.done||0));
 if(Number(field.trees)>planted.length)return'기존 나무의 위치가 연결되지 않았습니다. 식재 위치를 연결하거나 빈 토지에 설계해 주세요.';
 if(planted.some(p=>g.footprints.some(poly=>polygonContainsPoint(poly,p))))return'야적면·통로에 나무가 있습니다. 나무가 없는 위치에 배치해 주세요.';
 const obstacles=[...(field.facilitySites||[]).filter(s=>s.occupiedPy>0).map(s=>s.points),...(field.openParking?.footprints||[]),...(parkingGeometry(field.cadastreParkingPlan?.plan)?.footprints||[]),...drainageFootprintPaths(field.drainage?.routes||[],'excavation')];
 const builtPaths=[];
 for(const facility of Object.values(field.orchardInfrastructure||{})){
  if(facility.headerDone)builtPaths.push(facility.header||[]);
  for(const row of facility.rows||[])if(Object.values(row.done||{}).some(Boolean))builtPaths.push(row.points||[]);
 }
 for(const path of builtPaths)for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i],d=Math.hypot(b.x-a.x,b.y-a.y);if(!d)continue;
  const nx=-(b.y-a.y)/d*.00015,ny=(b.x-a.x)/d*.00015;
  obstacles.push([{x:a.x+nx,y:a.y+ny},{x:b.x+nx,y:b.y+ny},{x:b.x-nx,y:b.y-ny},{x:a.x-nx,y:a.y-ny}]);
 }
 // Pending parking records normally contain canonical geometry; also check externally rebuilt footprints in the caller.
 if(g.footprints.some(p=>obstacles.some(q=>yardOverlaps(p,q))))return'야적창고가 주차장·통로·배수 시설과 겹칩니다.';
 return'';
}
const fail=message=>({ok:false,message});
function checked(state,id,raw,deps){
 const field=state.fields?.find(f=>String(f.id)===String(id)&&f.owned);if(!field)return fail('소유한 토지에서만 설계할 수 있습니다.');
 if(!deps.boundary?.length||raw?.boundaryId!==deps.boundaryId)return fail('현재 토지 경계를 확인해 주세요.');
 const g=yardGeometry(raw),error=yardPlanError(field,g,deps.boundary,state.cultivationZonesByFieldId?.[String(id)]||[],deps.openYardUsedKg?.(state,field)||0,deps.openYardUsedSlot?.(state,field)||0);if(error)return fail(error);
 return{ok:true,field,g};
}
export function saveOpenYardPlan(state,id,raw,deps){
 if(raw?.kind==='cancel'){
  const f=state.fields?.find(f=>String(f.id)===String(id)&&f.owned);if(!f)return fail('소유한 토지를 선택해 주세요.');
  return{ok:true,message:'미시공 야적창고 계획을 취소했습니다.',state:{...state,fields:state.fields.map(field=>field===f?{...field,cadastreYardPlan:null}:field)}};
 }
 const checkedPlan=checked(state,id,raw,deps);if(!checkedPlan.ok)return checkedPlan;const{field,g}=checkedPlan;
 return{ok:true,message:'야적창고 계획을 확정했습니다. 작업 → 설치작업에서 시공해 주세요.',state:{...state,fields:state.fields.map(f=>f===field?{...f,cadastreYardPlan:{plan:{...g.plan,footprints:g.footprints},boundary:deps.boundary.map(p=>({...p}))}}:f)}};
}
export function openYardJob(field){const pending=field?.cadastreYardPlan,g=yardGeometry(pending?.plan||field?.openYard);return g?{id:'yard',kind:'yard',panel:'facility',label:`노지 야적창고 ${g.storagePy.toFixed(1)}평 조성`,total:g.occupiedPy,done:pending?0:g.occupiedPy,unit:'평'}:null;}
export function quoteOpenYardWork(state,id,options={},deps={}){
 const field=state.fields?.find(f=>String(f.id)===String(id));const pending=field?.cadastreYardPlan;if(!pending)return fail('확정된 야적창고 계획이 없습니다.');
 if(JSON.stringify(deps.boundary)!==JSON.stringify(pending.boundary))return fail('토지 경계가 변경되었습니다. 다시 설계해 주세요.');
 if(options.expectedDone!=null&&options.expectedDone!==0)return fail('진행량이 변경되었습니다. 다시 확인해 주세요.');
 const valid=checked(state,id,pending.plan,deps);if(!valid.ok)return valid;
 const g=valid.g,mode=options.mode||'contractor';if(!['contractor','excavator'].includes(mode))return fail('전문 외주 또는 내 굴삭기를 선택해 주세요.');
 // Initial game balance; no real-world construction price claim.
 const slopeFactor=1+Math.min(30,Math.max(0,Number(field.slopeDeg)||0))*.03;
 const cost=Math.ceil((mode==='contractor'?100000+g.occupiedPy*40000:g.occupiedPy*18000)*slopeFactor);
 const labor=mode==='excavator'?Math.ceil(g.occupiedPy*.25*10)/10:0,fuel=mode==='excavator'?Math.ceil(g.occupiedPy*.15*10)/10:0;
 if(mode==='excavator'){
  const m=deps.machine;
  if(!m||!deps.excavatorKeys?.has(m.machineKey)||!(field.machineParkingSlots||[]).includes(m.id)||!(state.inventory?.[m.machineKey]>=Number(m.unitNo||1))||!(deps.durability>0))return fail('현재 토지에 주차된 정상 상태의 내 굴삭기를 선택해 주세요.');
  if(selfLaborAvailable(state)<labor||deps.fuel<fuel)return fail('야적창고 정지 작업에 필요한 노동력·굴삭기 연료가 부족합니다.');
 }
 if(state.money<cost)return fail(`야적창고 작업비 ${cost.toLocaleString()}원이 필요합니다.`);
 return{ok:true,amount:g.occupiedPy,unit:'평',cost,labor,fuel,g};
}
export function executeOpenYardWork(state,id,options,deps){
 const q=quoteOpenYardWork(state,id,options,deps);if(!q.ok)return q;const field=state.fields.find(f=>String(f.id)===String(id)),m=deps.machine;
 const next={...state,money:state.money-q.cost,labor:state.labor-q.labor,fields:state.fields.map(f=>f===field?{...f,openYard:normalizeOpenYard(q.g.plan),cadastreYardPlan:null}:f)};
 if(options.mode==='excavator'){next.machineFuelByInstance={...state.machineFuelByInstance,[m.id]:deps.fuel-q.fuel};next.equipmentDurabilityByInstance={...state.equipmentDurabilityByInstance,[m.id]:Math.max(0,deps.durability-q.fuel/4.8*(m.item?.usageWear||.12))};}
 return{ok:true,message:`노지 야적창고 완공 · 적재 ${q.g.storagePy.toFixed(1)}평 · ${q.g.slots}칸 · 용량 ${q.g.capacityKg.toLocaleString()}kg`,state:next};
}
