import { infrastructureReadyRows } from './orchardInfrastructure.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)*1000;
// Game pump: 2m³/h, 30m head; Darcy-Weisbach approximation, fixed f=.03.
export const INFRASTRUCTURE_PUMP={litersPerHour:2000,headM:30};
const friction=(length,diameterMm,litersPerHour)=>{
 const d=diameterMm/1000,q=litersPerHour/3600000,v=q/(Math.PI*d*d/4);
 return .03*length/d*v*v/(2*9.81);
};
const token=p=>`${p.x.toFixed(8)}:${p.y.toFixed(8)}`;
export function infrastructureIrrigationDemand(field){
 const p=field?.orchardInfrastructure?.irrigation;
 if(!p)return{groups:[],liters:0,hours:0,error:'관수 설계가 없습니다.'};
 const live=new Set((field.cadastrePlantingPlans||[]).flatMap(plan=>(plan.points||[]).slice(0,plan.done||0).map(token)));
 const mapped=Math.max(0,Number(field.trees)||0),allRows=infrastructureReadyRows(field,'irrigation');let remaining=mapped;
 const rows=allRows.map(row=>{const trees=Math.min(remaining,row.points.filter(point=>live.has(token(point))).length);remaining-=trees;return{...row,liveTrees:trees};}).filter(row=>row.liveTrees>0);
 const flow=p.settings.method==='drip'?2*p.settings.emitters:p.settings.method==='micro'?30:40;
 const radians=(Number(field.slopeBearing)||0)*Math.PI/180,slope=Math.tan((Number(field.slopeDeg)||0)*Math.PI/180),source=p.header[0];
 const groupSize=p.settings.groupSize,groups=[];
 for(let i=0;i<rows.length;i+=groupSize){
  const group=rows.slice(i,i+groupSize),trees=group.reduce((s,r)=>s+r.liveTrees,0),lph=trees*flow;
  const elevation=Math.max(0,...group.map(r=>Math.max(...r.points.map(point=>((source.x-point.x)*Math.cos(radians)+(source.y-point.y)*Math.sin(radians))*1000*slope))));
  const loss=friction(p.headerLength,28,lph)+Math.max(...group.map(row=>friction(row.length,14,row.liveTrees*flow/p.settings.lines)));
  const head=10+elevation+loss+3;
  groups.push({rows:group.map(r=>r.key),trees,litersPerHour:lph,requiredHead:head,ready:lph<=INFRASTRUCTURE_PUMP.litersPerHour&&head<=INFRASTRUCTURE_PUMP.headM,liters:lph*p.settings.hours});
 }
 const hours=groups.length*p.settings.hours,liters=groups.reduce((s,g)=>s+(g.ready?g.liters:0),0);
 return{groups,hours,liters,trees:rows.reduce((s,r)=>s+r.liveTrees,0),error:!rows.length?'시공 완료된 열에 실제 식재 위치가 연결된 나무가 없습니다.':hours>24?'구역별 순차 운전 시간이 하루 24시간을 넘습니다.':groups.some(g=>!g.ready)?'유량·압력 부족 구역은 급수하지 않습니다. 구역당 열 수를 줄여 주세요.':''};
}
export function infrastructureIrrigationDelivery(field,availableLiters,{tankReady,pumpActive,usable=true}={}){
 const demand=infrastructureIrrigationDemand(field),p=field?.orchardInfrastructure?.irrigation;
 if(!p?.settings.enabled||!tankReady||!pumpActive||!usable||demand.hours>24||!demand.liters)return{...demand,usedLiters:0,waterGain:0};
 const usedLiters=Math.max(0,Math.min(Number(availableLiters)||0,demand.liters));
 // Match existing field-average moisture units; only delivered water contributes.
 return{...demand,usedLiters,waterGain:field.trees>0?usedLiters/field.trees*.2:0};
}
