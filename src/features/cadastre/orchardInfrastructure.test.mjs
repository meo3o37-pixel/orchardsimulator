import test from 'node:test';
import assert from 'node:assert/strict';
import {buildInfrastructurePlan,infrastructureSource,infrastructureWaterSources,saveInfrastructurePlan,infrastructureJobs,quoteInfrastructureJob,executeInfrastructureJob,trellisPointReady,infrastructureReadyRows,infrastructureNeeds,setInfrastructureIrrigation}from'./orchardInfrastructure.js';
import {infrastructureIrrigationDemand,infrastructureIrrigationDelivery}from'./infrastructureIrrigation.js';
import {processDailyWaterSystems}from'../water/waterDailyUtils.js';
import {settleDailyFinance}from'../payment/dailyFinanceSettlement.js';
import {quoteCadastreJob,executeCadastreJob,cadastreJobs}from'./cadastreWork.js';
const pt=(x,y)=>({x:x/1000,y:y/1000}),boundary=[pt(0,0),pt(30,0),pt(30,30),pt(0,30)],planting={crop:'apple',variety:'fuji',rootstock:'M9',rowSpacing:3,treeSpacing:1.5,edgeMargin:1,angleDeg:0};
const zones=[{id:'z',kind:'farm',name:'과원',points:boundary,boundaryContourId:'b',planting}];
const waterSite={id:'tank-1',facilityKey:'peTankSmall',name:'관수 물탱크',points:[pt(.5,.5),pt(1.5,.5),pt(1.5,1.5),pt(.5,1.5)]};
const game=()=>({day:1,money:100000000,labor:100,inventory:{},fields:[{id:'f',name:'시험',owned:true,trees:0,slopeDeg:0,slopeBearing:90,cadastreFacilityLayoutPlans:[structuredClone(waterSite)],landFacilityCounts:{trellisWireSupport:2700,dripIrrigation:2700},landFacilities:{dripIrrigation:true}}],cultivationZonesByFieldId:{f:structuredClone(zones)}});
const deps={boundary,boundaryId:'b',pipeMaterialStock:(s,f,k)=>s.inventory[k]||0,consumePipeMaterial:(s,f,k,n)=>({ok:(s.inventory[k]||0)>=n,inventory:{...s.inventory,[k]:(s.inventory[k]||0)-n},vehicleCargoByInstance:s.vehicleCargoByInstance})};
const source=s=>infrastructureSource(s.fields[0],s.cultivationZonesByFieldId.f,boundary);
const save=(s=game(),kind='trellis',extra={})=>saveInfrastructurePlan(s,'f',kind,{settings:{},rowKeys:source(s).rows.slice(0,2).map(r=>r.key),waterSourceId:'tank-1',...extra},deps);
const step=(s,kind,stage,mode='contractor')=>executeInfrastructureJob(s,'f',`infra:${kind}:${stage}`,{mode},deps);
function withCompletedWire(s){const field=s.fields[0],rows=field.orchardInfrastructure.irrigation.rows;field.orchardInfrastructure={...field.orchardInfrastructure,trellis:{kind:'trellis',rows:rows.map(row=>({...row,done:{posts:true,wire:true,ties:true},condition:100}))}};return s;}
function complete(s,kind){if(kind==='irrigation'&&s.fields[0].orchardInfrastructure.irrigation.settings.method==='drip')s=withCompletedWire(s);for(const stage of kind==='trellis'?['posts','wire','ties']:['header','lines','emitters']){let i=0;while(infrastructureJobs(s.fields[0]).some(j=>j.id===`infra:${kind}:${stage}`&&j.done<j.total)){const r=step(s,kind,stage);if(!r.ok&&r.message.includes('다음 날')){s={...s,day:s.day+1};continue;}assert.equal(r.ok,true,r.message);s=r.state;if(++i>50)throw Error('loop');}}return s;}
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
 assert.equal(save(game(),'irrigation',{waterSourceId:'missing'}).ok,false);
 const linked=save(game(),'irrigation',{waterSource:pt(-1,-1)});assert.equal(linked.ok,true,linked.message);assert.deepEqual(linked.state.fields[0].orchardInfrastructure.irrigation.header[0],pt(1,1));
 const s=save().state;s.cultivationZonesByFieldId.f[0]={...zones[0],planting:{...planting,treeSpacing:2}};
 assert.equal(step(s,'trellis','posts').ok,false);s.cultivationZonesByFieldId.f=zones;
 assert.equal(executeInfrastructureJob(s,'f','infra:trellis:posts',{mode:'contractor'},{...deps,boundary:[...boundary].reverse()}).ok,false);
});
test('irrigation connects only to a placed tank or well and rejects a moved source before construction',()=>{
 const s=game();s.fields[0].cadastreFacilityLayoutPlans.push({...waterSite,id:'well-1',facilityKey:'wellFacility',name:'관정',points:waterSite.points.map(point=>({x:point.x+.02,y:point.y+.02}))});
 s.fields[0].cadastreFacilityLayoutPlans.push({...waterSite,id:'shed-1',facilityKey:'machineShedSmall'});
 assert.deepEqual(infrastructureWaterSources(s.fields[0]).map(site=>site.id),['tank-1','well-1']);
 const saved=save(s,'irrigation',{waterSourceId:'well-1'});assert.equal(saved.ok,true,saved.message);
 const field=saved.state.fields[0],plan=field.orchardInfrastructure.irrigation;
 assert.equal(plan.sourceId,'well-1');assert.equal(quoteInfrastructureJob(saved.state,'f','infra:irrigation:header',{mode:'contractor'},deps).ok,true);
 field.cadastreFacilityLayoutPlans[1].points=field.cadastreFacilityLayoutPlans[1].points.map(point=>({x:point.x+.001,y:point.y}));
 assert.match(quoteInfrastructureJob(saved.state,'f','infra:irrigation:header',{mode:'contractor'},deps).message,/수원|물탱크|관정/);
});
test('irrigation confirmed without a source resumes with the saved rows and settings after a source is built',()=>{
 const initial=game();
 initial.fields[0].cadastreFacilityLayoutPlans=[];
 const rowKeys=[source(initial).rows[1].key];
 const pending=save(initial,'irrigation',{waterSourceId:'',rowKeys,settings:{method:'drip',mainPlacement:'edge',emitters:3,enabled:true}});
 assert.equal(pending.ok,true,pending.message);
 assert.equal(pending.state.money,initial.money);
 const reloaded=JSON.parse(JSON.stringify(pending.state));
 const field=reloaded.fields[0],plan=field.orchardInfrastructure.irrigation;
 assert.equal(plan.awaitingWaterSource,true);
 assert.deepEqual(plan.header,[plan.rows[0].tap]);
 assert.deepEqual(plan.rows.map(row=>row.key),rowKeys);
 assert.equal(plan.settings.enabled,false);
 assert.match(step(reloaded,'irrigation','header').message,/물탱크.*관정/);
 assert.equal(setInfrastructureIrrigation(reloaded,'f',{enabled:true}).ok,false);
 assert.equal(infrastructureIrrigationDelivery(field,1000,{tankReady:true,pumpActive:true}).usedLiters,0);

 field.facilitySites=[{...waterSite,status:'complete',startDay:1,readyDay:2,occupiedPy:1}];
 const linked=save(reloaded,'irrigation',{rowKeys:plan.rows.map(row=>row.key),settings:plan.settings});
 assert.equal(linked.ok,true,linked.message);
 const connected=linked.state.fields[0].orchardInfrastructure.irrigation;
 assert.equal(connected.awaitingWaterSource,undefined);
 assert.equal(connected.sourceId,waterSite.id);
 assert.deepEqual(connected.rows.map(row=>row.key),rowKeys);
 assert.deepEqual(connected.settings,plan.settings);
 assert.deepEqual(connected.header[0],pt(1,1));
 assert.ok(connected.headerLength>0);
 assert.equal(step(linked.state,'irrigation','header').ok,true);
});
test('drawn main keeps its waypoints across reload and adds row connections and height to material and pressure calculations',()=>{
 const mainWaypoints=[pt(4,1),pt(4,18),pt(8,21)];
 const settings={method:'sprinkler',mainPlacement:'custom',mainMount:'scaffold'};
 const pending=save(game(),'irrigation',{settings,mainWaypoints,waterSourceId:''});
 assert.equal(pending.ok,true,pending.message);
 const reloaded=JSON.parse(JSON.stringify(pending.state));
 const plan=reloaded.fields[0].orchardInfrastructure.irrigation;
 assert.deepEqual(plan.mainWaypoints,mainWaypoints);
 assert.equal(plan.settings.mainHeightM,3);
 assert.deepEqual(plan.header[0],mainWaypoints[0]);
 assert.equal(plan.headerLength,22);
 for(const row of plan.rows){
  assert.equal(row.tap.x,mainWaypoints[0].x);
  assert.equal(row.tap.y,row.points[0].y);
  assert.ok(plan.header.some(p=>p.x===row.tap.x&&p.y===row.tap.y));
 }
 const raw={mainWaypoints:plan.mainWaypoints,rowKeys:plan.rows.map(row=>row.key)};
 const raised=save(reloaded,'irrigation',{...raw,settings:plan.settings});
 const flat=save(reloaded,'irrigation',{...raw,settings:{...plan.settings,mainMount:'buried'}});
 assert.equal(raised.ok,true,raised.message);
 assert.equal(flat.ok,true,flat.message);
 const connected=raised.state.fields[0].orchardInfrastructure.irrigation;
 assert.deepEqual(connected.mainWaypoints,mainWaypoints);
 assert.deepEqual(connected.header[0],pt(1,1));
 assert.ok(Math.abs(connected.headerLength-(22+Math.hypot(3,3)))<1e-9);
 assert.equal(flat.state.fields[0].orchardInfrastructure.irrigation.settings.mainHeightM,0);
 assert.ok(connected.rows[0].lineLength>flat.state.fields[0].orchardInfrastructure.irrigation.rows[0].lineLength);
 assert.equal(infrastructureNeeds(connected,null,'header').irrigationMain32x100m,connected.headerLength);
 const raisedDemand=infrastructureIrrigationDemand(complete(live(raised.state),'irrigation').fields[0]);
 const flatDemand=infrastructureIrrigationDemand(complete(live(flat.state),'irrigation').fields[0]);
 assert.ok(raisedDemand.groups[0].requiredHead>=flatDemand.groups[0].requiredHead+3);
 const opposite=save(game(),'irrigation',{settings,mainWaypoints:[pt(29,1),pt(29,18)],waterSourceId:''});
 assert.equal(opposite.ok,true,opposite.message);
 const oppositeRow=opposite.state.fields[0].orchardInfrastructure.irrigation.rows[0];
 assert.deepEqual(oppositeRow.route[1],oppositeRow.points.at(-1));
});
test('changing operation settings preserves the height of a previously confirmed main',()=>{
 const s=save(game(),'irrigation').state;
 const plan=s.fields[0].orchardInfrastructure.irrigation;
 delete plan.settings.mainMount;
 plan.settings.mainHeightM=2.4;
 const updated=setInfrastructureIrrigation(s,'f',{hours:2,groupSize:4,enabled:true});
 assert.equal(updated.ok,true);
 const saved=updated.state.fields[0].orchardInfrastructure.irrigation;
 assert.equal(saved.settings.mainHeightM,2.4);
 assert.equal(saved.settings.mainMount,undefined);
 assert.equal(saved.settings.hours,2);
 assert.equal(saved.settings.groupSize,4);
});
test('drawn main rejects routes crossing a narrow building and invalid waypoints',()=>{
 const s=source(game()),keys=s.rows.slice(0,2).map(row=>row.key),settings={mainPlacement:'custom'};
 const building=[pt(4.21,10),pt(4.23,10),pt(4.23,14),pt(4.21,14)];
 const preview=buildInfrastructurePlan('irrigation',{...s,buildings:[building]},settings,keys,null,[pt(2,12),pt(28,12)]);
 assert.match(preview.message,/건물 구역/);
 assert.equal(save(game(),'irrigation',{settings,mainWaypoints:[pt(4,4),pt(31,5)]}).ok,false);
 assert.equal(save(game(),'irrigation',{settings,mainWaypoints:[pt(4,4),pt(4,4)]}).ok,false);
});
test('contractor limit persists across reload and different infrastructure jobs; next day resumes',()=>{
 const s=save().state;s.fields[0].orchardWorkDay=s.day;s.fields[0].orchardContractorLabor=39.9;
 assert.match(step(JSON.parse(JSON.stringify(s)),'trellis','posts').message,/다음 날/);s.day++;assert.equal(step(s,'trellis','posts').ok,true);
});
test('work queue delegates infrastructure quote and execution consistently',()=>{
 const s=save().state,q=quoteCadastreJob(s,'f','infra:trellis:posts',{mode:'contractor'},deps);assert.equal(q.ok,true,q.message);
 const r=executeCadastreJob(s,'f','infra:trellis:posts',{mode:'contractor'},deps);assert.equal(r.ok,true,r.message);assert.equal(s.money-r.state.money,q.cost);
});
test('drip design uses one connected hose per row and separate 32mm main',()=>{
 const s=save(game(),'irrigation',{settings:{lines:2,emitters:2}}).state,p=s.fields[0].orchardInfrastructure.irrigation,row=p.rows[0];
 assert.equal(p.materialVersion,3);assert.equal(p.settings.lines,1);
 assert.equal(infrastructureNeeds(p,null,'header').irrigationMain32x100m,p.headerLength);
 assert.equal(infrastructureNeeds(p,row,'lines').dripHose16x100m,row.lineLength);
 assert.equal(infrastructureNeeds(p,row,'emitters').dripNozzle,undefined);
 assert.equal(infrastructureNeeds(p,row,'emitters').irrigationValve25,1);
 assert.deepEqual(row.route,[row.points[0],row.points.at(-1)]);assert.ok(p.header.some(point=>point.x===row.tap.x&&point.y===row.tap.y));
 assert.equal(s.fields[0].landFacilityCounts.dripIrrigation,0);assert.equal(s.fields[0].landFacilities.dripIrrigation,false);
});
test('fixed drip outlets per row change running flow while the hose material follows length',()=>{
 let s=live(save(game(),'irrigation',{settings:{emitterMode:'row',rowEmitters:7}}).state);
 const plan=s.fields[0].orchardInfrastructure.irrigation;
 assert.equal(infrastructureNeeds(plan,plan.rows[0],'lines').dripHose16x100m,plan.rows[0].lineLength);
 assert.equal(infrastructureNeeds(plan,plan.rows[0],'emitters').irrigationValve25,1);
 s=complete(s,'irrigation');
 const demand=infrastructureIrrigationDemand(s.fields[0]);
 assert.equal(demand.trees,38);
 assert.equal(demand.groups[0].litersPerHour,28);
 assert.equal(demand.liters,28);
});
test('edge main connects every drip hose; sprinkler and micro use 32mm main along each row',()=>{
 const edge=save(game(),'irrigation',{settings:{method:'drip',mainPlacement:'edge'}});
 assert.equal(edge.ok,true,edge.message);
 const drip=edge.state.fields[0].orchardInfrastructure.irrigation;
 assert.ok(drip.rows.every(row=>drip.header.some(point=>Math.hypot(point.x-row.route[0].x,point.y-row.route[0].y)<1e-10)));
 assert.ok(drip.rows.every(row=>row.lineLength>=row.length));
 for(const method of ['sprinkler','micro']){
  const saved=save(game(),'irrigation',{settings:{method}});assert.equal(saved.ok,true,saved.message);
  const plan=saved.state.fields[0].orchardInfrastructure.irrigation,row=plan.rows[0],needs=infrastructureNeeds(plan,row,'lines');
  assert.equal(needs.irrigationMain32x100m,row.length);assert.equal(needs.dripHose16x100m,undefined);
  assert.equal(infrastructureNeeds(plan,row,'emitters')[method==='sprinkler'?'sprinklerNozzle':'microSprinklerNozzle'],row.treeCount);
  assert.ok(plan.header.some(point=>point.x===row.route[0].x&&point.y===row.route[0].y));
 }
});
test('manual row construction consumes the chosen hose or 32mm main roll and keeps cut leftovers',()=>{
 for(const [method,item] of [['drip','dripHose16x100m'],['sprinkler','irrigationMain32x100m']]){
  let state=save(game(),'irrigation',{settings:{method}}).state;
  state=step(state,'irrigation','header').state;
  if(method==='drip')state=withCompletedWire(state);
  state={...state,inventory:{[item]:1}};
  const row=state.fields[0].orchardInfrastructure.irrigation.rows[0],result=step(state,'irrigation','lines','manual');
  assert.equal(result.ok,true,result.message);
  assert.equal(result.state.inventory[item],0);
  assert.ok(Math.abs(result.state.fields[0].orchardMaterialRemainders[item]-(100-row.lineLength))<1e-6);
 }
 const legacy=save(game(),'irrigation').state.fields[0].orchardInfrastructure.irrigation;
 assert.equal(infrastructureNeeds({...legacy,materialVersion:2,settings:{...legacy.settings,lines:2}},legacy.rows[0],'lines').irrigationPipe100mRoll,legacy.rows[0].length*2+2);
});
test('drip hose installation and operation require the matching row wire',()=>{
 let state=live(save(game(),'irrigation').state);
 state=step(state,'irrigation','header').state;
 assert.match(step(state,'irrigation','lines').message,/지주 와이어/);
 state=withCompletedWire(state);
 assert.equal(step(state,'irrigation','lines').ok,true);
 state=complete(state,'irrigation');
 assert.ok(infrastructureIrrigationDemand(state.fields[0]).liters>0);
 delete state.fields[0].orchardInfrastructure.trellis;
 assert.equal(infrastructureIrrigationDemand(state.fields[0]).liters,0);
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
 let s=complete(live(save(game(),'irrigation').state),'irrigation');s=setInfrastructureIrrigation(s,'f',{enabled:true,hours:1,groupSize:2}).state;const f={...s.fields[0],tankWaterLiters:1000,facilitySites:[{...waterSite,status:'complete',startDay:1,readyDay:2}]};
 const waterDeps={fieldFacilityCountOf:()=>1,fieldIrrigationPumpActive:()=>true,fieldTankOperationalCapacityLiters:()=>1000,clamp:(n,l,h)=>Math.max(l,Math.min(h,n)),fieldHasAutoRefillSystem:()=>false,fieldHasTankOption:()=>false,fieldFacilityUsable:(_field,key)=>key!=='wellFacility',tankAutoRefillTargetRatio:1,growthStageLabel:()=>'',coldRiskInfoOfStageAndTemp:()=>({active:false}),splitTankWaterByUnit:()=>[],splitTankWaterByFacility:()=>({}),tankUnitWaterMapFromUnits:()=>({}),facilityDurabilityRuleOf:()=>({}),applyFacilityDurabilityWear:m=>m,tankFacilityKeys:[],waterPumpUnitLiter:1000,microSprinklerIrrigationFacilityKey:'microSprinklerIrrigation'};
 const r=processDailyWaterSystems({field:f,nextDay:2,prevMoney:100000},waterDeps);assert.equal(r.irrigationUseLiters,152);assert.equal(r.nextTankWater,848);assert.equal(r.irrigationWaterGain,152/f.trees*.2);
 const off=processDailyWaterSystems({field:{...f,orchardInfrastructure:{...f.orchardInfrastructure,irrigation:{...f.orchardInfrastructure.irrigation,settings:{...f.orchardInfrastructure.irrigation.settings,enabled:false}}}},nextDay:2,prevMoney:100000},waterDeps);assert.equal(off.irrigationUseLiters,0);assert.equal(off.irrigationWaterGain,0);assert.equal(off.nextTankWater,1000);
});
test('a completed well directly irrigates from groundwater without a tank and charges only delivered water',()=>{
 const well={...waterSite,id:'well-1',facilityKey:'wellFacility',name:'관정'};
 const s=game();s.fields[0].cadastreFacilityLayoutPlans.push(well);
 let built=complete(live(save(s,'irrigation',{waterSourceId:'well-1'}).state),'irrigation');built=setInfrastructureIrrigation(built,'f',{enabled:true,hours:1,groupSize:2}).state;
 const field={...built.fields[0],facilitySites:[{...well,status:'complete',startDay:1,readyDay:2}],groundwaterTonsBase:1,groundwaterDailyRechargeLiters:0,tankWaterLiters:0};
 const deps={fieldFacilityCountOf:()=>0,fieldIrrigationPumpActive:()=>false,fieldTankOperationalCapacityLiters:()=>0,clamp:(n,l,h)=>Math.max(l,Math.min(h,n)),fieldHasAutoRefillSystem:()=>false,fieldHasTankOption:()=>false,fieldFacilityUsable:(_field,key)=>key==='wellFacility'||key==='farmPowerElectric',tankAutoRefillTargetRatio:1,growthStageLabel:()=>'',coldRiskInfoOfStageAndTemp:()=>({active:false}),splitTankWaterByUnit:()=>[],splitTankWaterByFacility:()=>({}),tankUnitWaterMapFromUnits:()=>({}),facilityDurabilityRuleOf:()=>({irrigationPer1000L:1}),applyFacilityDurabilityWear:m=>m,tankFacilityKeys:[],waterPumpUnitLiter:1000,waterPumpPowerFeePer1000L:100,waterEnvFeePerLiter:.1,microSprinklerIrrigationFacilityKey:'microSprinklerIrrigation'};
 const delivered=processDailyWaterSystems({field,nextDay:2,prevMoney:1000},deps);
 assert.equal(delivered.irrigationUseLiters,152);assert.equal(delivered.directWellIrrigationLiters,152);assert.equal(delivered.nextTankWater,0);assert.equal(delivered.nextGroundwaterTonsBase,.848);assert.equal(delivered.directWellIrrigationPowerFee,15);assert.equal(delivered.directWellIrrigationEnvFee,15);
 const settled=settleDailyFinance({prev:{money:1000},nextDay:2,autoRefillPowerFeeTotal:0,autoRefillEnvFeeTotal:0,directWellIrrigationPowerFeeTotal:delivered.directWellIrrigationPowerFee,directWellIrrigationEnvFeeTotal:delivered.directWellIrrigationEnvFee,standbyPowerFeeTotal:0,evSlowChargeCostTotal:0,cardEffectsById:{},cardProductById:{}},{toDate:()=>new Date('2026-11-04'),clampCreditScore:n=>n,creditGradeFromScore:()=> 'good',loanLimitFromGrade:()=>0});
 assert.equal(settled.nextMoney,970);
 assert.equal(processDailyWaterSystems({field,nextDay:2,prevMoney:0},deps).directWellIrrigationLiters,0);
 assert.equal(processDailyWaterSystems({field:{...field,facilitySites:[]},nextDay:2,prevMoney:1000},deps).directWellIrrigationLiters,0);
 const shifted={...field,facilitySites:field.facilitySites.map(site=>({...site,points:site.points.map(point=>({x:point.x+.001,y:point.y}))}))};
 assert.equal(processDailyWaterSystems({field:shifted,nextDay:2,prevMoney:1000},deps).directWellIrrigationLiters,0);
});
