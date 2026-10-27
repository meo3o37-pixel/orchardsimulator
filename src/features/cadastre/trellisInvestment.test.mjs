import test from 'node:test';
import assert from 'node:assert/strict';
import{build}from'esbuild';
import{mkdtemp,writeFile,readFile}from'node:fs/promises';
import{tmpdir}from'node:os';import{join}from'node:path';import{pathToFileURL,fileURLToPath}from'node:url';
import{normalizeTrellisInvestment,scaffoldCount,trellisRowMetrics,trellisTrainingMultiplier,trellisInvestmentSummary,applyDailyTrellisInvestment}from'./trellisInvestment.js';
import{infrastructureSource,saveInfrastructurePlan,infrastructureNeeds,quoteInfrastructureJob,executeInfrastructureJob,infrastructureJobs,trellisPointReady}from'./orchardInfrastructure.js';
import{SHOP_ITEMS}from'../../config/items/index.js';
const point=(x,y)=>({x:x/1000,y:y/1000}),boundary=[point(0,0),point(40,0),point(40,20),point(0,20)];
const points=Array.from({length:16},(_,i)=>point(5+i*2,5));
const row=(extra={})=>({key:'z:0',name:'시험 1열',treeCount:16,length:30,points,done:{posts:true,wire:true,ties:true},condition:100,...extra});
const plan=(settings={},extra={})=>({version:1,materialVersion:2,kind:'trellis',settings:normalizeTrellisInvestment(settings),rows:[row()],...extra});
const field=(settings={},extra={})=>({id:'f',name:'시험',trees:16,quality:80,vigor:70,cadastrePlantingPlans:[{points,done:16}],orchardInfrastructure:{trellis:plan(settings)},...extra});

test('the store and design use the existing three materials and metre wire units',()=>{
 assert.equal(scaffoldCount(30,5),7);assert.equal(scaffoldCount(31,5),8);
 const p=plan(),r=p.rows[0];assert.deepEqual(infrastructureNeeds(p,r,'posts'),{scaffoldPipe:7});
 assert.equal(infrastructureNeeds(p,r,'ties').trellisStake,16);assert.equal(infrastructureNeeds(p,r,'wire').trellisWire,94);
 assert.equal(SHOP_ITEMS.consumableMaterial.find(i=>i.key==='trellisWire').unit,'m');assert.ok(!SHOP_ITEMS.consumableMaterial.some(i=>i.key==='orchardEndPost4m'));
 const high=plan({spacing:2.5,stakes:2,wires:5});assert.equal(infrastructureNeeds(high,r,'posts').scaffoldPipe,13);assert.equal(infrastructureNeeds(high,r,'ties').trellisStake,32);assert.equal(infrastructureNeeds(high,r,'wire').trellisWire,154);
});
test('more pipe, individual stakes and wire lower risk, with diminishing training returns and higher upkeep',()=>{
 const r=row(),weak=trellisRowMetrics(plan({spacing:10,stakes:0,wires:1}),r),base=trellisRowMetrics(plan(),r),rich=trellisRowMetrics(plan({spacing:2.5,stakes:2,wires:5}),r);
 assert.ok(weak.damageProbability>base.damageProbability&&base.damageProbability>rich.damageProbability&&rich.damageProbability>0);
 assert.ok(rich.upkeepFactor>base.upkeepFactor&&base.upkeepFactor>weak.upkeepFactor);
 const reductions=[1,2,3,4,5].map(wires=>trellisRowMetrics(plan({wires}),r).trainingReduction);
 assert.equal(reductions[0],0);for(let i=1;i<5;i++)assert.ok(reductions[i]>reductions[i-1]);assert.ok(reductions[2]-reductions[1]>reductions[4]-reductions[3]);assert.ok(reductions[4]<.35);
 assert.ok(trellisRowMetrics(plan(),r,{weather:'태풍'}).damageProbability>trellisRowMetrics(plan(),r,{weather:'강풍'}).damageProbability);assert.equal(trellisRowMetrics(plan(),r,{weather:'맑음'}).damageProbability,0);
});
test('unfinished wires, unprotected trees and damaged rows never claim full-field benefits',()=>{
 const f=field(),full=trellisTrainingMultiplier(f);assert.ok(full<1);
 const unfinished=field({}, {orchardInfrastructure:{trellis:plan({}, {rows:[row({done:{posts:true}})]})}});assert.equal(trellisTrainingMultiplier(unfinished),1);
 const partial=field({}, {trees:32});assert.equal(trellisInvestmentSummary(partial).condition,100);assert.ok(trellisTrainingMultiplier(partial)>full);assert.ok(Math.abs((1-trellisTrainingMultiplier(partial))*2-(1-full))<1e-10);
 const worn=field({}, {orchardInfrastructure:{trellis:plan({}, {rows:[row({condition:30})]})}});assert.ok(trellisTrainingMultiplier(worn)>full);assert.ok(trellisInvestmentSummary(worn).risk>trellisInvestmentSummary(f).risk);
 assert.equal(trellisPointReady(field({}, {orchardInfrastructure:{trellis:plan({}, {rows:[row({condition:10})]})}}),points[0]),false);
});
test('deterministic storms persist damage, replay once, and materially favor stronger investment',()=>{
 let weakHits=0,strongHits=0,first;
 for(let day=1;day<=1000;day++){
  const weak=applyDailyTrellisInvestment(field({spacing:10,stakes:0,wires:1}),'태풍',day),strong=applyDailyTrellisInvestment(field({spacing:2.5,stakes:2,wires:5}),'태풍',day);
  if(weak.log){weakHits++;first??={day,result:weak};}if(strong.log)strongHits++;
 }
 assert.ok(weakHits>strongHits*2);assert.ok(strongHits>0);
 const loaded=JSON.parse(JSON.stringify(first.result.field));assert.equal(JSON.stringify(applyDailyTrellisInvestment(loaded,'태풍',first.day).field),JSON.stringify(loaded));assert.equal(applyDailyTrellisInvestment(loaded,'태풍',first.day).log,'');
 assert.ok(first.result.field.quality<80&&first.result.field.vigor<70);assert.ok(loaded.orchardInfrastructure.trellis.rows[0].condition<90);
 const sunny=applyDailyTrellisInvestment(field(),'맑음',1);assert.equal(sunny.log,'');assert.equal(sunny.field.quality,80);assert.ok(sunny.field.orchardInfrastructure.trellis.rows[0].condition<100);
});

const zones=[{id:'z',kind:'farm',name:'과원',points:boundary,boundaryContourId:'b',planting:{crop:'apple',variety:'fuji',rootstock:'M9',rowSpacing:3,treeSpacing:1.5,edgeMargin:1,angleDeg:0}}];
const deps={boundary,boundaryId:'b',pipeMaterialStock:(s,f,key)=>s.inventory[key]||0,consumePipeMaterial:(s,f,key,n)=>({ok:(s.inventory[key]||0)>=n,inventory:{...s.inventory,[key]:(s.inventory[key]||0)-n},vehicleCargoByInstance:s.vehicleCargoByInstance})};
function saved(settings={}){const s={day:1,money:10000000,labor:100,inventory:{},fields:[{id:'f',owned:true,trees:0}],cultivationZonesByFieldId:{f:structuredClone(zones)}};const src=infrastructureSource(s.fields[0],zones,boundary);return saveInfrastructurePlan(s,'f','trellis',{rowKeys:[src.rows[0].key],settings},deps).state;}
test('manual construction requires real scaffold stock and richer plans cost more to hire',()=>{
 const s=saved(),p=s.fields[0].orchardInfrastructure.trellis,q=quoteInfrastructureJob(s,'f','infra:trellis:posts',{mode:'manual'},deps);assert.equal(q.ok,false);assert.match(q.message,/비계파이프/);
 const need=infrastructureNeeds(p,p.rows[0],'posts').scaffoldPipe;s.inventory.scaffoldPipe=need;
 const r=executeInfrastructureJob(s,'f','infra:trellis:posts',{mode:'manual'},deps);assert.equal(r.ok,true,r.message);assert.equal(r.state.inventory.scaffoldPipe,0);
 const cheap=quoteInfrastructureJob(saved({spacing:10}),'f','infra:trellis:posts',{mode:'contractor'},deps),rich=quoteInfrastructureJob(saved({spacing:2.5}),'f','infra:trellis:posts',{mode:'contractor'},deps);assert.ok(rich.cost>cheap.cost);
});
test('repair never charges for wire and stakes that have not yet been installed',()=>{
 const p=plan(),r=row({done:{posts:true},condition:40});assert.deepEqual(Object.keys(infrastructureNeeds(p,r,'repair')),['scaffoldPipe']);
});
test('repair restores only the damaged row and consumes replacement materials and labor',()=>{
 const s=saved();let f=s.fields[0],p=f.orchardInfrastructure.trellis;
 p.rows=p.rows.map(r=>({...r,done:{posts:true,wire:true,ties:true},condition:10}));
 const need=infrastructureNeeds(p,p.rows[0],'repair');for(const[k,n]of Object.entries(need))s.inventory[k]=k==='bindingString400Pack'?Math.ceil(n/400):Math.ceil(n);
 assert.ok(infrastructureJobs(f).some(j=>j.stage==='repair'));const before=JSON.stringify(s);
 const fail=executeInfrastructureJob({...s,labor:-10,laborOverwork:{day:1,used:10}},'f','infra:trellis:repair',{mode:'manual'},deps);assert.equal(fail.ok,false);assert.equal(JSON.stringify(s),before);
 const r=executeInfrastructureJob(s,'f','infra:trellis:repair',{mode:'manual'},deps);assert.equal(r.ok,true,r.message);assert.ok(r.state.labor<s.labor);assert.ok(r.state.inventory.scaffoldPipe<s.inventory.scaffoldPipe);assert.equal(r.state.fields[0].orchardInfrastructure.trellis.rows[0].condition,100);assert.ok(!infrastructureJobs(r.state.fields[0]).some(j=>j.stage==='repair'));
});

async function bundle(relative,plugins=[]){const dir=await mkdtemp(join(tmpdir(),'trellis-investment-')),out=join(dir,'module.mjs');await build({entryPoints:[fileURLToPath(new URL(relative,import.meta.url))],outfile:out,bundle:true,platform:'node',format:'esm',plugins,logLevel:'silent'});return import(pathToFileURL(out));}
const taskMath=await bundle('../../utils/taskMath.js');
test('real task calculators reduce canopy training labor once and leave other jobs unchanged',()=>{
 const plain=field({}, {orchardInfrastructure:{}}),rich=field({wires:5}),task={key:'canopyTraining',speed:20};
 const ratio=trellisTrainingMultiplier(rich);assert.equal(taskMath.taskLaborPerTree(task,rich),ratio);assert.equal(taskMath.taskLaborPerTree(task,plain),1);
 assert.ok(Math.abs(taskMath.taskLaborNeed(task,rich)-taskMath.taskLaborNeed(task,plain)*ratio)<1e-10);
 assert.equal(taskMath.taskLaborPerTree({key:'pollination'},plain),taskMath.taskLaborPerTree({key:'pollination'},rich));
});
const lifecycle=await bundle('../day/advanceDayFieldLifecycleUtils.js',[{name:'controlled-biology',setup(b){b.onLoad({filter:/advanceDayField(Surface|Biology|Finalize)Utils\.js$/},a=>({contents:a.path.includes('Surface')?'export const buildAdvanceDayFieldSurface=()=>({nextWeed:0});':a.path.includes('Biology')?'export const buildAdvanceDayFieldBiology=()=>({});':'export const finalizeAdvanceDayField=p=>({nextField:{...p.field}});'}));}}]);
test('real daily lifecycle saves row damage and exposes its weather diary entry',()=>{
 const f=field({spacing:10,stakes:0,wires:1});let day=1;while(!applyDailyTrellisInvestment(f,'태풍',day).log)day++;
 const out=lifecycle.processAdvanceDayFieldLifecycle({field:f,nextDay:day,nextWater:60,weatherName:'태풍'},{surface:{},biology:{},finalize:{dailyWaterQualityPenalty:()=>0}}).fieldFinalizationResult;
 assert.ok(out.windDamageLogText.includes('지주시설'));assert.ok(out.nextField.orchardInfrastructure.trellis.rows[0].condition<90);assert.equal(out.nextField.orchardInfrastructure.trellis.lastConditionDay,day);
});
