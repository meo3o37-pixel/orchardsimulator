import { polygonContainsPoint } from './cadastreData.js';
import { routeDepthAt } from './pipeSystem.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)*1000;
const length=points=>points.slice(1).reduce((s,b,i)=>s+distance(points[i],b),0);
const projection=(p,bearing)=>(p.x*Math.cos(bearing*Math.PI/180)+p.y*Math.sin(bearing*Math.PI/180))*1000;

export function orchardTreeRows(field) {
 const rows=[];let mapped=0;
 for(const plan of field?.cadastrePlantingPlans||[]){
  const points=(plan.points||[]).slice(0,Math.max(0,Math.floor(Number(plan.done)||0)));
  if(!points.length)continue;
  mapped+=points.length;
  const origin=plan.points[0],angle=(Number(plan.planting?.angleDeg)||0)*Math.PI/180,cos=Math.cos(angle),sin=Math.sin(angle),groups=new Map();
  for(const p of points){if(!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;const dx=(p.x-origin.x)*1000,dy=(p.y-origin.y)*1000,y=Math.round((-dx*sin+dy*cos)*1000),x=dx*cos+dy*sin;const group=groups.get(y)||[];group.push({p,x});groups.set(y,group);}
  let n=0;
  for(const [key,group]of [...groups.entries()].sort((a,b)=>a[0]-b[0])){
   group.sort((a,b)=>a.x-b.x);n++;
   rows.push({key:`${plan.zoneId}:${key}`,zoneId:plan.zoneId,name:`${plan.name} · ${n}열`,points:group.map(v=>v.p),treeCount:group.length,cos,sin});
  }
 }
 const total=Math.max(0,Math.floor(Number(field?.trees)||0));
 return{rows,mapped,total,aligned:mapped===total&&total>0};
}
export function underRowPoints(row,bearing) {
 if(row.points.length<2)return null;
 const first=row.points[0],last=row.points.at(-1);
 let a={x:first.x-row.cos*.0004,y:first.y-row.sin*.0004},b={x:last.x+row.cos*.0004,y:last.y+row.sin*.0004};
 if(projection(a,bearing)>projection(b,bearing))[a,b]=[b,a];
 return[a,b];
}
export function isActualTreeRowPipe(field,route,bearing) {
 if(route.type!=='pipe100')return true;
 const source=orchardTreeRows(field);if(!source.aligned)return false;
 const row=source.rows.find(r=>r.key===route.rowKey),expected=row&&underRowPoints(row,bearing);
 return Boolean(expected&&route.points?.length===2&&distance(route.points[0],expected[0])<.02&&distance(route.points[1],expected[1])<.02);
}
function outletConnection(route,boundary) {
 const inLand=p=>polygonContainsPoint(boundary,p)||boundary.some((a,i)=>{const b=boundary[(i+1)%boundary.length],dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/den)):0;return distance(p,{x:a.x+dx*t,y:a.y+dy*t})<.0001;});
 for(let i=route.points.length-1;i>=1;i--){const a=route.points[i-1],b=route.points[i];
  if(inLand(b))return b;
  if(!inLand(a))continue;
  let lo=0,hi=1;for(let j=0;j<40;j++){const t=(lo+hi)/2,p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};if(polygonContainsPoint(boundary,p))lo=t;else hi=t;}
  const t=Math.max(0,lo-.1/Math.max(.1,distance(a,b)));
  return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
 }
 return null;
}
export function createOrchardPipeLayout(field,rowKeys,surfaceId,boundary,bearing) {
 const source=orchardTreeRows(field),fail=message=>({ok:false,message});
 if(!source.aligned)return fail('실제 나무 주수와 식재 위치를 먼저 연결해 주세요.');
 const selected=source.rows.filter(r=>rowKeys.includes(r.key));
 if(!selected.length)return fail('매설할 나무 열을 선택해 주세요.');
 const surface=field.drainage?.routes?.find(r=>r.id===surfaceId&&!['pipe100','pipe150'].includes(r.type));
 if(!surface)return fail('연결할 배수로를 먼저 설계해 주세요.');
 const connection=outletConnection(surface,boundary);if(!connection)return fail('토지 안쪽의 배수로 연결점을 찾지 못했습니다.');
 const preserved=(field.drainage?.routes||[]).filter(r=>['pipe100','pipe150'].includes(r.type)&&r.work>0);
 const routes=[];
 for(const row of selected){
  if(preserved.some(r=>r.rowKey===row.key))continue;
  const points=underRowPoints(row,bearing);if(!points)return fail(`${row.name}: 나무가 2주 이상인 열부터 매설할 수 있습니다.`);
  if(points.some(p=>!polygonContainsPoint(boundary,p)))return fail(`${row.name}: 열 끝의 연결 공간이 토지 밖입니다.`);
  const depthEnd=Math.max(.8,.6+length(points)*.002+.01);
  if(depthEnd>1.7)return fail(`${row.name}: 열이 너무 길어 구간을 나눠야 합니다.`);
  routes.push({id:`tree-row:${row.key}`,rowKey:row.key,type:'pipe100',points,depthStart:.6,depthEnd,envelope:true,work:0,blockage:0});
 }
 if(!routes.length)return fail('선택한 열에는 이미 매설한 관로가 있습니다.');
 const existingCollector=preserved.find(main=>main.type==='pipe150'&&routes.every(row=>{
  const end=row.points.at(-1);
  return main.points.slice(1).some((b,i)=>{const a=main.points[i],dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((end.x-a.x)*dx+(end.y-a.y)*dy)/den)):0;return distance(end,{x:a.x+dx*t,y:a.y+dy*t})<.02&&row.depthEnd<=routeDepthAt(main,i,t)+.02;});
 }));
 if(existingCollector)return{ok:true,routes:[...preserved,...routes],rowCount:routes.length};
 const ends=routes.map(r=>r.points.at(-1)).sort((a,b)=>projection(a,bearing)-projection(b,bearing)||a.x-b.x||a.y-b.y);
 const collector=[...ends,connection].filter((p,i,all)=>i===0||distance(p,all[i-1])>=.1);
 const depthStart=Math.max(...routes.map(r=>r.depthEnd))+.05,depthEnd=depthStart+length(collector)*.002+.01;
 const receiving=routeDepthAt(surface);
 if(depthEnd>Math.min(1.8,receiving))return fail('집수관 구배를 확보하기 어렵습니다. 열을 나눠 설계하거나 더 깊은 배수로에 연결해 주세요.');
 if(collector.length<2||length(collector)<1)return fail('배수로 연결점이 너무 가깝습니다. 다른 배수로에 연결해 주세요.');
 routes.unshift({id:`tree-collector:${routes[0].rowKey}`,type:'pipe150',points:collector,depthStart,depthEnd,envelope:true,work:0,blockage:0});
 return{ok:true,routes:[...preserved,...routes],rowCount:routes.filter(r=>r.type==='pipe100').length};
}
