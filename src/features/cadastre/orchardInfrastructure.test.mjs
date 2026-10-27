import test from 'node:test';
import assert from 'node:assert/strict';
import {infrastructureSource,saveInfrastructurePlan,infrastructureJobs,quoteInfrastructureJob,executeInfrastructureJob,trellisPointReady,infrastructureReadyRows,infrastructureNeeds,setInfrastructureIrrigation}from'./orchardInfrastructure.js';
import {infrastructureIrrigationDemand,infrastructureIrrigationDelivery}from'./infrastructureIrrigation.js';
import {processDailyWaterSystems}from'../water/waterDailyUtils.js';
import {quoteCadastreJob,executeCadastreJob,cadastreJobs}from'./cadastreWork.js';
const pt=(x,y)=>({x:x/1000,y:y/1000}),boundary=[pt(0,0),pt(30,0),pt(30,30),pt(0,30)],planting={crop:'apple',variety:'fuji',rootstock:'M9',rowSpacing:3,treeSpacing:1.5,edgeMargin:1,angleDeg:0};
const zones=[{id:'z',kind:'farm',name:'과원',points:boundary,boundaryContourId:'b',planting}];
const game=()=>({day:1,money:100000000,labor:100,inventory:{},fields:[{id:'f',name:'시험',owned:true,trees:0,slopeDeg:0,slopeBearing:90,landFacilityCounts:{trellisWireSupport:2700,dripIrrigation:2700},landFacilities:{dripIrrigation:true}}],cultivationZonesByFieldId:{f:structuredClone(zones)}});
const deps={boundary,boundaryId:'b',pipeMaterialStock:(s,f,k)=>s.inventory[k]||0,consumePipeMaterial:(s,f,k,n)=>({ok:(s.inventory[k]||0)>=n,inventory:{...s.inventory,[k]:(s.inventory[k]||0)-n},vehicleCargoByInstance:s.vehicleCargoByInstance})};
const source=s=>infrastructureSource(s.fields[0],s.cultivationZonesByFieldId.f,boundary);
const save=(s=game(),kind='trellis',extra={})=>saveInfrastructurePlan(s,'f',kind,{settings:{},rowKeys:source(s).rows.slice(0,2).map(r=>r.key),waterSource:pt(1,1),...extra},deps);
const step=(s,kind,stage,mode='contractor')=>executeInfrastructureJob(s,'f',`infra:${kind}:${stage}`,{mode},deps);
function complete(s,kind){for(const stage of kind==='trellis'?['posts','wire','ties']:['header','lines','emitters']){let i=0;while(infrastructureJobs(s.fields[0]).some(j=>j.id===`infra:${kind}:${stage}`&&j.done<j.total)){const r=step(s,kind,stage);if(!r.ok&&r.message.includes('다음 날')){s={...s,day:s.day+1};continue;}assert.equal(r.ok,true,r.message);s=r.state;if(++i>50)throw Error('loop');}}return s;}
function live(s){const rows=source(s).rows,points=rows.flatMap(r=>r.points);s.fields[0]={...s.fields[0],trees:points.length,cadastrePlantingPlans:[{zoneId:'z',points,done:points.length}]};return s;}

test('preplant source builds real row geometry; free confirmation resets old count and ignores forged progress',()=>{
 const s=game(),before=JSON.stringify(s.inventory),r=save(s,'trellis',{rows:[{done:{ties:true}}]});assert.equal(r.ok,true,r.message);
 assert.equal(r.state.money,s.money);assert.equal(JSON.stringify(r.state.inventory),before);assert.equal(r.state.fields[0].trees,0);assert.equal(r.state.fields[0].landFacilityCounts.trellisWireSupport,0);
 assert.equal(infrastructureReadyRows(r.state.fields[0],'trellis').length,0);assert.equal(cadastreJobs(r.state,'f').filter(j=>j.kind==='infrastructure').length,3);
});
test('stages enforce prerequisites, own material and atomic labor; one complete row grants only its own support',()=>{
 let s=save().state;assert.equal(step(s,'trellis','wire').ok,false);
 const before=JSON.stringify(s);assert.equal(step(s,'trellis','posts','manual').ok,false);assert.equal(JSON.stringify(s),before);
 const p=s.fields[0].orchardInfrastructure.trellis,row=p.rows[0],need=infrastructureNeeds(p,row,'posts');s={...s,inventory:{...need}};
 const r=step(s,'trellis','posts','manual');assert.equal(r.ok,true,r.message);assert.ok(r.state.labor<s.labor);s=r.state;
 assert.equal(trellisPointReady(s.fields[0],row.points[0]),false);s=step(s,'trellis','wire').state;s=step(s,'trellis','ties').state;
 assert.equal(trellisPointReady(s.fields[0],row.points[0]),true);assert.equal(trellisPointReady(s.fields[0],p.rows[1].points[0]),false);assert.equal(s.fields[0].landFacilityCounts.trellisWireSupport,row.treeCount);
});
test('material packs keep remainders and failures never charge or advance',()=>{
 let s=save().state;s=step(s,'trellis','posts').state;s=step(s,'trellis','wire').state;
 const row=s.fields[0].orchardInfrastructure.trellis.rows[0];s.inventory={trellisStake:row.treeCount,bindingString400Pack:1};
 const noMoney={...s,money:0},failed=step(noMoney,'trellis','ties');assert.equal(failed.ok,false);
 const r=step(s,'trellis','ties','manual');assert.equal(r.ok,true,r.message);assert.equal(r.state.inventory.bindingString400Pack,0);assert.equal(r.state.fields[0].orchardMaterialRemainders.bindingString400Pack,400-row.treeCount);
 const loaded=JSON.parse(JSON.stringify(r.state));assert.equal(infrastructureReadyRows(loaded.fields[0],'trellis').length,1);
 const done=infrastructureJobs(loaded.fields[0]).find(j=>j.stage==='ties').done;assert.equal(executeInfrastructureJob(loaded,'f','infra:trellis:ties',{mode:'manual',expectedDone:done-1},deps).ok,false);
});
test('boundary, ownership, changed spacing and outside source block construction',()=>{
 assert.equal(save({...game(),fields:[{...game().fields[0],owned:false}]}).ok,false);
 assert.equal(save(game(),'irrigation',{waterSource:pt(-1,-1)}).ok,false);
 const s=save().state;s.cultivationZonesByFieldId.f[0]={...zones[0],planting:{...planting,treeSpacing:2}};
 assert.equal(step(s,'trellis','posts').ok,false);s.cultivationZonesByFieldId.f=zones;
 assert.equal(executeInfrastructureJob(s,'f','infra:trellis:posts',{mode:'contractor'},{...deps,boundary:[...boundary].reverse()}).ok,false);
});
test('contractor limit persists across reload and different infrastructure jobs; next day resumes',()=>{
 const s=save().state;s.fields[0].orchardWorkDay=s.day;s.fields[0].orchardContractorLabor=39.9;
 assert.match(step(JSON.parse(JSON.stringify(s)),'trellis','posts').message,/다음 날/);s.day++;assert.equal(step(s,'trellis','posts').ok,true);
});
test('work queue delegates infrastructure quote and execution consistently',()=>{
 const s=save().state,q=quoteCadastreJob(s,'f','infra:trellis:posts',{mode:'contractor'},deps);assert.equal(q.ok,true,q.message);
 const r=executeCadastreJob(s,'f','infra:trellis:posts',{mode:'contractor'},deps);assert.equal(r.ok,true,r.message);assert.equal(s.money-r.state.money,q.cost);
});
test('irrigation quantities use row metres and nozzle counts rather than one metre per tree',()=>{
 const s=save(game(),'irrigation',{settings:{lines:2,emitters:2}}).state,p=s.fields[0].orchardInfrastructure.irrigation,row=p.rows[0];
 assert.equal(infrastructureNeeds(p,row,'lines').irrigationPipe100mRoll,row.length*2+2);assert.equal(infrastructureNeeds(p,row,'emitters').dripNozzle,row.treeCount*2);
 assert.equal(s.fields[0].landFacilityCounts.dripIrrigation,0);assert.equal(s.fields[0].landFacilities.dripIrrigation,false);
});
test('only finished, actually planted rows receive water, bounded by stored water and power',()=>{
 let s=live(save(game(),'irrigation').state);assert.equal(infrastructureIrrigationDemand(s.fields[0]).liters,0);s=complete(s,'irrigation');
 const f=s.fields[0];f.orchardInfrastructure.irrigation.settings.enabled=true;const d=infrastructureIrrigationDemand(f);assert.equal(d.groups.length,1);assert.equal(d.trees,38);assert.equal(d.liters,152);
 assert.equal(infrastructureIrrigationDelivery(f,1000,{tankReady:true,pumpActive:false}).usedLiters,0);
 const delivered=infrastructureIrrigationDelivery(f,100,{tankReady:true,pumpActive:true});assert.equal(delivered.usedLiters,100);assert.equal(delivered.waterGain,100/f.trees*.2);
});
test('group flow, elevation pressure and total sequential hours affect actual supply',()=>{
 let s=complete(live(save(game(),'irrigation',{rowKeys:source(game()).rows.map(r=>r.key),settings:{method:'sprinkler',groupSize:10,hours:1}}).state),'irrigation');
 let f=s.fields[0];f.orchardInfrastructure.irrigation.settings.enabled=true;assert.equal(infrastructureIrrigationDemand(f).groups[0].ready,false);
 f.orchardInfrastructure.irrigation.settings.groupSize=1;assert.ok(infrastructureIrrigationDemand(f).groups.every(g=>g.ready));
 f.orchardInfrastructure.irrigation.settings.hours=4;assert.ok(infrastructureIrrigationDemand(f).hours>24);assert.equal(infrastructureIrrigationDelivery(f,100000,{tankReady:true,pumpActive:true}).usedLiters,0);
 f.orchardInfrastructure.irrigation.settings.hours=1;f.slopeDeg=60;f.slopeBearing=270;assert.ok(infrastructureIrrigationDemand(f).groups.some(g=>!g.ready));
});
test('daily water pipeline uses new design once, does not stack legacy/passive water',()=>{
 let s=complete(live(save(game(),'irrigation').state),'irrigation');s=setInfrastructureIrrigation(s,'f',{enabled:true,hours:1,groupSize:2}).state;const f={...s.fields[0],tankWaterLiters:1000};
 const waterDeps={fieldFacilityCountOf:()=>1,fieldIrrigationPumpActive:()=>true,fieldTankOperationalCapacityLiters:()=>1000,clamp:(n,l,h)=>Math.max(l,Math.min(h,n)),fieldHasAutoRefillSystem:()=>false,fieldHasTankOption:()=>false,fieldFacilityUsable:()=>true,tankAutoRefillTargetRatio:1,growthStageLabel:()=>'',coldRiskInfoOfStageAndTemp:()=>({active:false}),splitTankWaterByUnit:()=>[],splitTankWaterByFacility:()=>({}),tankUnitWaterMapFromUnits:()=>({}),facilityDurabilityRuleOf:()=>({}),applyFacilityDurabilityWear:m=>m,tankFacilityKeys:[],waterPumpUnitLiter:1000,microSprinklerIrrigationFacilityKey:'microSprinklerIrrigation'};
 const r=processDailyWaterSystems({field:f,nextDay:2,prevMoney:100000},waterDeps);assert.equal(r.irrigationUseLiters,152);assert.equal(r.nextTankWater,848);assert.equal(r.irrigationWaterGain,152/f.trees*.2);
 const off=processDailyWaterSystems({field:{...f,orchardInfrastructure:{...f.orchardInfrastructure,irrigation:{...f.orchardInfrastructure.irrigation,settings:{...f.orchardInfrastructure.irrigation.settings,enabled:false}}}},nextDay:2,prevMoney:100000},waterDeps);assert.equal(off.irrigationUseLiters,0);assert.equal(off.irrigationWaterGain,0);assert.equal(off.nextTankWater,1000);
});
