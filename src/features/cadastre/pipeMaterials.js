import { DRAINAGE_MATERIAL_ITEMS } from '../../config/items/drainageMaterial.js';
const metres = points => points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.y-points[i].y)*1000,0);
const rounded = n => Math.round(Math.max(0,n)*1e6)/1e6;

export function pipeMaterialLimits(state, field, deps={}) {
 return Object.fromEntries(DRAINAGE_MATERIAL_ITEMS.map(item=>[
  item.drainageRouteType,
  Math.min(item.lengthM,Math.max(0,Number(field.cadastrePipeOffcuts?.[item.key])||0))+
  (deps.consumePipeMaterial?Math.max(0,Math.floor(Number(deps.pipeMaterialStock?.(state,field,item.key))||0))*item.lengthM:0)
 ]));
}

// Only current-field warehouse / parked cargo sources are exposed by the app.
export function allocatePipeMaterials(state, field, before, after, deps={}) {
 const offcuts={...(field.cadastrePipeOffcuts||{})},rows=[];let credit=0;
 for(const item of DRAINAGE_MATERIAL_ITEMS){
  const length=after.routes.reduce((sum,r)=>sum+(r.type===item.drainageRouteType?Math.max(0,Math.min(metres(r.points),r.work)-(before.routes.find(old=>old.id===r.id)?.work||0)):0),0);
  if(length<1e-6)continue;
  const stored=Math.min(item.lengthM,Math.max(0,Number(offcuts[item.key])||0));
  const stock=deps.consumePipeMaterial?Math.max(0,Math.floor(Number(deps.pipeMaterialStock?.(state,field,item.key))||0)):0;
  const units=Math.min(stock,Math.max(0,Math.ceil((length-stored-1e-6)/item.lengthM)));
  const used=Math.min(length,stored+units*item.lengthM);
  offcuts[item.key]=rounded(stored+units*item.lengthM-used);
  credit+=used*item.price/item.lengthM;
  rows.push({key:item.key,name:item.name,units,used:rounded(used),remaining:offcuts[item.key],supplied:rounded(length-used)});
 }
 return{credit:Math.floor(credit),offcuts,rows};
}

export function consumeAllocatedPipes(state,field,allocation,deps={}){
 let next=state;
 for(const row of allocation.rows){
  if(!row.units)continue;
  const result=deps.consumePipeMaterial?.(next,field,row.key,row.units);
  if(!result?.ok)return{ok:false};
  next={...next,inventory:result.inventory,vehicleCargoByInstance:result.vehicleCargoByInstance};
 }
 return{ok:true,state:next};
}
