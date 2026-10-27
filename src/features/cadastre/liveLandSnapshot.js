import { parkingGeometry } from './openParking.js';
import { yardGeometry } from './openYard.js';
import { scaffoldCount } from './trellisInvestment.js';
const valid=p=>Number.isFinite(p?.x)&&Number.isFinite(p?.y);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)*1000;
// Work is stored as installed metres starting at the first route point.
export function installedRoutePoints(points,installed){
 if(!Array.isArray(points)||points.length<2||!points.every(valid)||!(installed>0))return[];
 let left=Number(installed),out=[{...points[0]}];
 for(let i=1;i<points.length&&left>1e-7;i++){
  const a=points[i-1],b=points[i],length=distance(a,b);if(length<1e-7)continue;
  const t=Math.min(1,left/length);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});left-=length;
 }
 return out.length>=2?out:[];
}
export function liveLandSnapshot(field){
 const total=Math.max(0,Math.floor(Number(field?.trees)||0)),trees=[];
 for(const plan of field?.cadastrePlantingPlans||[]){
  const done=Math.max(0,Math.floor(Number(plan.done)||0));
  for(const point of (plan.points||[]).slice(0,done))if(valid(point)&&trees.length<total)trees.push({x:point.x,y:point.y});
 }
 const drains=(field?.drainage?.routes||[]).flatMap(r=>{
  const points=installedRoutePoints(r.points,r.work);return points.length?[{id:r.id,type:r.type,points,work:r.work}]:[];
 });
 const parking=parkingGeometry(field?.openParking),yard=yardGeometry(field?.openYard);
 const trellis=field?.orchardInfrastructure?.trellis;
 const posts=[],wires=[];
 for(const row of trellis?.rows||[]){
  const points=(row.points||[]).filter(valid);if(points.length<2)continue;
  const condition=Math.max(0,Math.min(100,Number(row.condition??100))),a=points[0],b=points.at(-1);
  if(row.done?.posts){
   const count=scaffoldCount(distance(a,b),Math.max(2.5,Number(trellis.settings?.spacing)||5));
   for(let i=0;i<count;i++)posts.push({x:a.x+(b.x-a.x)*i/(count-1),y:a.y+(b.y-a.y)*i/(count-1),condition});
  }
  if(row.done?.wire)wires.push({key:row.key,points:[a,b],condition});
 }
 const irrigation=field?.orchardInfrastructure?.irrigation,waterLines=[],nozzles=[];
 if(irrigation?.headerDone&&irrigation.header?.length>1&&irrigation.header.every(valid))waterLines.push({key:'header',type:'main',points:irrigation.header});
 for(const row of irrigation?.rows||[]){
  const points=(row.points||[]).filter(valid);if(points.length<2)continue;
  if(row.done?.lines)waterLines.push({key:row.key,type:'lateral',points:[points[0],points.at(-1)]});
  if(row.done?.emitters)nozzles.push(...points);
 }
 return{total,trees,unmapped:Math.max(0,total-trees.length),drains,parking,yard,posts,wires,waterLines,nozzles};
}
