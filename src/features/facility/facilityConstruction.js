import {generatePlantingPreview}from'../cadastre/plantingDesign.js';
import { FACILITY_OCCUPY_PY } from '../../config/sim/facilities.js';
import { polygonContainsPoint, polygonBoundsFromPoints } from '../cadastre/cadastreData.js';
import { validateCultivationZone, zoneBoundaryError } from '../cadastre/cultivationZones.js';
import { drainageFootprintPaths } from '../cadastre/drainage.js';
import { parkingGeometry } from '../cadastre/openParking.js';
import { yardFootprints } from '../cadastre/openYard.js';

const DAYS={wellFacility:3,farmPowerElectric:2,autoRefillSystem:1,irrigationControlSystem:1,evChargerStation:2,frostFan:3,portableToilet:1,outdoorToilet:3,workerRestroom:5,hygieneShowerUnit:7,panelWarehouse3:3,panelWarehouse5:4,panelWarehouse8:5,goodsWarehouseSmall:6,goodsWarehouseMedium:8,goodsWarehouseLarge:10,goodsWarehouseXl:12,coldStorageMedium:8,coldStorageLarge:10,coldStorageXl:12,coldStorageXxl:14,coldStorageMax:16,machineShedSmall:5,machineShedSmallPlus:6,machineShedMedium:7,machineShedMediumPlus:8,machineShedLarge:9,machineShedLargePlus:10,machineShedXl:12,appleSortingLineSmall:2,appleSortingLineMedium:3,appleSortingLineLarge:4,peTankSmall:1,peTankMedium:1,peTankLarge:2,peTankXl:2,peTankXxl:3};
export const facilityInstallDaysOf=key=>DAYS[key]??Math.max(2,Math.ceil((FACILITY_OCCUPY_PY[key]||2)/3));
export const requiresFacilityPlacement=facility=>Boolean(facility&&!facility.perTree&&!facility.manualInstallOnly&&facility.key!=='openStorage3000Py');
export const normalizeFacilitySites=raw=>(Array.isArray(raw)?raw:[]).filter(s=>s?.id&&s.facilityKey&&!zoneBoundaryError(s.points)&&Number.isFinite(s.startDay)&&Number.isFinite(s.readyDay)&&s.readyDay>s.startDay).map(s=>({...s,status:s.status==='complete'?'complete':'building',occupiedPy:Math.max(0,Number(s.occupiedPy)||0)}));
export const facilityFootprints=field=>normalizeFacilitySites(field?.facilitySites).filter(s=>s.occupiedPy>0).map(s=>s.points);
export const facilityReservedPy=field=>normalizeFacilitySites(field?.facilitySites).filter(s=>s.status==='building').reduce((sum,s)=>sum+s.occupiedPy,0);
export function facilityPlacementGeometry(key,center,angle=0){
 const occupiedPy=FACILITY_OCCUPY_PY[key]||0,ratio=/Warehouse|Storage|Shed|Container|House|Home|Residence|Office|Lounge|Hut|villa|estate|hanok|modular|wood|passive/i.test(key)?1.5:1;
 const width=Math.sqrt(Math.max(.25,occupiedPy)*3.305785*ratio),depth=width/ratio,a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 const points=[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]].map(([x,y])=>({x:center.x+(x*c-y*s)/1000,y:center.y+(x*s+y*c)/1000}));
 return{center:{...center},angle,width,depth,occupiedPy,points};
}
export function facilityPlacementError(field,boundary,site){
 if(!site||!Array.isArray(site.points))return'시설 위치를 선택해 주세요.';
 const ownError=validateCultivationZone({points:site.points,boundaryPoints:boundary});if(ownError)return ownError.replace('재배구역','시설');
 if(!(site.occupiedPy>0))return'';
 const excluded=[...facilityFootprints(field),...(parkingGeometry(field?.openParking)?.footprints||[]),...(parkingGeometry(field?.cadastreParkingPlan?.plan)?.footprints||[]),...yardFootprints(field,true),...drainageFootprintPaths(field?.drainage?.routes||[],'excavation')];
 for(const facility of Object.values(field.orchardInfrastructure||{})){
  const paths=[...(facility.headerDone?[facility.header||[]]:[]),...(facility.rows||[]).filter(r=>Object.values(r.done||{}).some(Boolean)).map(r=>r.points||[])];
  for(const path of paths)for(let i=1;i<path.length;i++){
   const a=path[i-1],b=path[i],d=Math.hypot(b.x-a.x,b.y-a.y);if(!d)continue;
   const nx=-(b.y-a.y)/d*.00015,ny=(b.x-a.x)/d*.00015;
   excluded.push([{x:a.x+nx,y:a.y+ny},{x:b.x+nx,y:b.y+ny},{x:b.x-nx,y:b.y-ny},{x:a.x-nx,y:a.y-ny}]);
  }
 }
 const overlap=validateCultivationZone({points:site.points,boundaryPoints:boundary,zones:excluded.map((points,i)=>({id:String(i),points}))});
 if(overlap)return'기존 시설·공사 부지·주차장·배수관로와 겹칩니다.';
 const plans=field?.cadastrePlantingPlans||[],trees=plans.flatMap(p=>(p.points||[]).slice(0,Math.max(0,Number(p.done)||0)));
 if(trees.some(p=>polygonContainsPoint(site.points,p)))return'식재된 나무와 겹칩니다. 나무가 없는 위치를 선택하거나 해당 나무를 먼저 제거해 주세요.';
 if((Number(field?.trees)||0)>trees.length)return'기존 나무의 위치가 연결되지 않았습니다. 지적도에서 기존 식재 위치를 먼저 연결해 주세요.';
 return'';
}
export const facilityPlacementCenter=boundary=>{const b=polygonBoundsFromPoints(boundary);return b?{x:(b.minX+b.maxX)/2,y:(b.minY+b.maxY)/2}:null;};
const pointKey=p=>`${Math.round(p.x*1e9)},${Math.round(p.y*1e9)}`;
function reservePlantingSpace(state,field,site){
 if(!(site.occupiedPy>0))return field.cadastrePlantingPlans;
 const exclusions=[...facilityFootprints(field),site.points,...(parkingGeometry(field.openParking)?.footprints||[]),...yardFootprints(field)];
 return(field.cadastrePlantingPlans||[]).map(plan=>{
  const zone=state.cultivationZonesByFieldId?.[String(field.id)]?.find(z=>z.id===plan.zoneId);
  if(!zone)return{...plan,points:plan.points.filter((p,i)=>i<plan.done||!polygonContainsPoint(site.points,p))};
  const preview=generatePlantingPreview(zone.points,plan.planting,field.drainage?.routes||[],exclusions);
  if(preview.error)return plan;
  const available=new Set(preview.trees.map(pointKey));
  return{...plan,points:plan.points.filter((p,i)=>i<plan.done||available.has(pointKey(p)))};
 });
}
export function queueFacilityConstruction(state,fieldIndex,order){
 const field=state.fields?.[fieldIndex];if(!field?.owned)return state;
 const site=order.installRequest?.site;
 if(!site||normalizeFacilitySites(field.facilitySites).some(s=>s.id===site.id))return state;
 return{...state,fields:state.fields.map((f,i)=>i===fieldIndex?{...f,cadastrePlantingPlans:reservePlantingSpace(state,f,site),facilitySites:[...normalizeFacilitySites(f.facilitySites),{...site,status:'building',facilityKey:order.facilityKey,name:order.facilityName,startDay:order.startDay,readyDay:order.readyDay}]}:f),facilityConstructionOrders:[...(state.facilityConstructionOrders||[]),order]};
}
export function completeFacilityConstruction(state,applyInstallation){
 const due=(state.facilityConstructionOrders||[]).filter(o=>o.readyDay<=state.day);if(!due.length)return state;
 let fields=[...state.fields],completed=[];
 for(const order of due){
  const i=fields.findIndex(f=>String(f.id)===String(order.fieldId)&&f.owned);if(i<0)continue;
  const siteId=order.installRequest?.site?.id,sites=normalizeFacilitySites(fields[i].facilitySites);
  if(siteId&&!sites.some(s=>s.id===siteId&&s.status==='building'))continue;
  const field=applyInstallation(fields[i],order);if(!field)continue;
  fields[i]={...field,facilitySites:sites.map(s=>s.id===siteId?{...s,status:'complete'}:s)};completed.push(order.id);
 }
 return completed.length?{...state,fields,facilityConstructionOrders:state.facilityConstructionOrders.filter(o=>!completed.includes(o.id))}:state;
}
