// Game balance only: material density improves resistance with diminishing returns.
const clamp=(n,l,h)=>Math.max(l,Math.min(h,Number(n)||0));
const pointKey=p=>`${p.x.toFixed(8)}:${p.y.toFixed(8)}`;
export const normalizeTrellisInvestment=raw=>({spacing:clamp(raw?.spacing??5,2.5,10),wires:Math.round(clamp(raw?.wires??3,1,5)),stakes:Math.round(clamp(raw?.stakes??1,0,2))});
export const scaffoldCount=(length,spacing)=>Math.ceil(Math.max(0,length)/spacing)+1;
export function trellisRowMetrics(plan,row,{preview=false,weather='태풍'}={}){
 const s=normalizeTrellisInvestment(plan.settings),condition=preview?100:clamp(row.condition??100,0,100),health=condition/100;
 const posts=preview||row.done?.posts,wire=posts&&(preview||row.done?.wire),ties=preview||row.done?.ties;
 const actualSpacing=row.length/Math.max(1,scaffoldCount(row.length,s.spacing)-1);
 const pipeStrength=posts?clamp((5/Math.max(1,actualSpacing))**.75,.55,1.4):0;
 const stakeStrength=ties?[.45,.75,.9][s.stakes]:0;
 const wireStrength=wire?[0,.65,.78,.86,.91,.94][s.wires]:0;
 const resistance=(pipeStrength*.5+stakeStrength*.3+wireStrength*.2)*health;
 const severity=/태풍/.test(weather)?.25:/돌풍/.test(weather)?.08:/강풍/.test(weather)?.035:0;
 const damageProbability=severity?clamp(severity*(1.65-1.25*resistance),severity*.05,.7):0;
 const trainingReduction=wire?.38*(1-Math.exp(-.55*(s.wires-1)))*health*Math.min(1,pipeStrength):0;
 const upkeepFactor=1+(s.wires-1)*.12+(5/s.spacing)*.1+s.stakes*.06;
 return{condition,damageProbability,resistance,trainingReduction,upkeepFactor,actualSpacing,pipes:scaffoldCount(row.length,s.spacing),stakes:row.treeCount*s.stakes,wireMeters:row.length*s.wires+4};
}
function liveRows(field,rows){
 const mapped=new Set((field.cadastrePlantingPlans||[]).flatMap(p=>(p.points||[]).slice(0,p.done||0).map(pointKey)));
 let remain=Math.max(0,Number(field.trees)||0);
 return rows.map(row=>{const alive=Math.min(remain,row.points.filter(p=>mapped.has(pointKey(p))).length);remain-=alive;return{row,alive};});
}
export function trellisTrainingMultiplier(field){
 const p=field?.orchardInfrastructure?.trellis,total=Math.max(0,Number(field?.trees)||0);if(!p||p.materialVersion!==2||!total)return 1;
 return clamp(1-liveRows(field,p.rows).reduce((sum,{row,alive})=>sum+alive*trellisRowMetrics(p,row).trainingReduction,0)/total,.65,1);
}
export function trellisInvestmentSummary(field,previewPlan=null){
 const p=previewPlan||field?.orchardInfrastructure?.trellis;if(!p?.rows?.length)return null;
 const weights=previewPlan?p.rows.map(row=>({row,alive:row.treeCount})):liveRows(field,p.rows),total=weights.reduce((s,r)=>s+r.alive,0);
 const metrics=weights.map(({row,alive})=>({...trellisRowMetrics(p,row,{preview:Boolean(previewPlan)}),weight:alive}));
 const uncovered=previewPlan?0:Math.max(0,(Number(field.trees)||0)-total);
 const bare=trellisRowMetrics(p,{length:5,treeCount:uncovered,done:{}});
 const avg=key=>total+uncovered?(metrics.reduce((s,r)=>s+r[key]*r.weight,0)+(key==='condition'?0:bare[key]||0)*uncovered)/(total+uncovered):metrics.reduce((s,r)=>s+r[key],0)/metrics.length;
 const installed=p.rows.filter(r=>previewPlan||r.done?.posts),installedTrees=installed.reduce((s,r)=>s+r.treeCount,0);
 const condition=installedTrees?installed.reduce((s,r)=>s+trellisRowMetrics(p,r,{preview:Boolean(previewPlan)}).condition*r.treeCount,0)/installedTrees:0;
 return{risk:avg('damageProbability'),trainingSaving:avg('trainingReduction'),condition,upkeepFactor:avg('upkeepFactor'),damaged:p.rows.filter(r=>(r.condition??100)<90&&r.done?.posts).length};
}
const hash=text=>{let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return(h>>>0)/4294967296;};
export function applyDailyTrellisInvestment(field,weather,day){
 const plan=field?.orchardInfrastructure?.trellis;
 if(!plan||plan.materialVersion!==2||day<=Number(plan.lastConditionDay||0))return{field,log:''};
 const live=new Map(liveRows(field,plan.rows).map(r=>[r.row.key,r.alive]));let damaged=0,affected=0;
 const rows=plan.rows.map(row=>{
  if(!row.done?.posts)return row;
  const metrics=trellisRowMetrics(plan,row,{weather}),seed=`${field.id}:${day}:${row.key}`;
  const hit=metrics.damageProbability>0&&hash(seed)<metrics.damageProbability;
  const loss=hit?25+Math.floor(hash(`${seed}:loss`)*35):0;
  if(hit){damaged++;affected+=live.get(row.key)||0;}
  return{...row,condition:clamp(metrics.condition-.003*metrics.upkeepFactor-loss,0,100)};
 });
 const total=Math.max(0,Number(field.trees)||0),mapped=[...live.values()].reduce((a,b)=>a+b,0),unprotected=Math.max(0,total-mapped);
 const bareRisk=trellisRowMetrics(plan,{length:5,treeCount:unprotected,done:{}},{weather}).damageProbability;
 if(unprotected&&hash(`${field.id}:${day}:unprotected`)<bareRisk)affected+=unprotected;
 const ratio=total?Math.min(1,affected/total):0;
 const support=rows.filter(r=>r.done?.posts&&r.done?.wire&&r.done?.ties&&r.condition>20).reduce((s,r)=>s+r.treeCount,0);
 return{field:{...field,orchardInfrastructure:{...field.orchardInfrastructure,trellis:{...plan,rows,lastConditionDay:day}},landFacilityCounts:{...field.landFacilityCounts,trellisWireSupport:support},quality:field.quality==null?field.quality:clamp(field.quality-ratio*3,0,100),vigor:field.vigor==null?field.vigor:clamp(field.vigor-ratio*2,0,100)},log:damaged||affected?`${field.name} ${weather} 피해: 지주시설 ${damaged}열 손상 · 영향 나무 ${affected}주. 지주시설 보수가 필요합니다.`:''};
}
