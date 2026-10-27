import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeDrainage, normalizeDrainage, applyDrainageAction, drainageWorkQuote, drainageLength, applyDailyDrainage, drainageOccupiedPy, drainageFootprintPaths } from './drainage.js';
import { pipeCoveragePaths, pipeSpacing } from './pipeSystem.js';
import { generatePlantingPreview } from './plantingDesign.js';
import { parkingGeometry, parkingPlanError, parkingDrainageConflict } from './openParking.js';
const p = (x,y) => ({x:x/1000,y:y/1000});
const boundary=[p(0,0),p(30,0),p(30,30),p(0,30)];
const route=(id,type,points,extra={})=>({id,type,points,work:0,blockage:0,...extra});
const plan=()=>({version:1,bearing:90,slopeDeg:0,boundary,routes:[
 route('out','earth',[p(28,0),p(28,32)]),
 route('main','pipe150',[p(15,25),p(28,28)],{depthStart:.8,depthEnd:1,envelope:true}),
 route('branch','pipe100',[p(15,0),p(15,25)],{depthStart:.6,depthEnd:.75,envelope:true})
]});
const completed=()=>normalizeDrainage({...plan(),routes:plan().routes.map(r=>({...r,work:drainageLength(r.points)}))});
const field=()=>({id:'f',owned:true,py:300,slopeBearing:90,slopeDeg:0,trees:0,machineParkingSlots:['dig-1'],soilComposition:{sand:0,sandyLoam:0,loam:100,clayLoam:0,clay:0}});
const game=()=>({day:1,money:30000000,labor:100,inventory:{dig:1},fields:[field()]});
const deps={boundary,boundaryId:'b',machine:{id:'dig-1',machineKey:'dig',unitNo:1,item:{usageWear:.12}},excavatorKeys:new Set(['dig']),fuel:100,durability:100};
const save=(g=game(),value=plan())=>applyDrainageAction(g,'f',{kind:'save',plan:value},deps);

test('buried network validates invert grade, receiving height, outlets and minimum surface length',()=>{
 const ready=analyzeDrainage(completed(),300,field());
 assert.equal(ready.error,'');assert.equal(ready.ready,true);assert.equal(ready.builtLength,30);assert.ok(ready.pipeCoverage>.1);assert.ok(ready.pipeCapacity>0);
 const bad=plan();bad.routes[2].depthEnd=.4;
 assert.match(analyzeDrainage(bad,300,field()).error,/구배/);
 const deep=plan();deep.routes[2].depthStart=1;deep.routes[2].depthEnd=1.2;
 assert.match(analyzeDrainage(deep,300,field()).error,/연결|높이/);
 const short=completed();short.routes[0].points=[p(28,25),p(28,32)];
 assert.equal(analyzeDrainage(short,300,field()).ready,false);
 const unfinished=completed();unfinished.routes[1].work=0;
 assert.equal(analyzeDrainage(unfinished,300,field()).pipeCoverage,0);
 const blocked=completed();blocked.routes[1].blockage=95;
 assert.ok(analyzeDrainage(blocked,300,field()).pipeCapacity<=.351);
 const disconnected=plan();disconnected.routes[2].points=[p(5,0),p(5,25)];
 assert.ok(analyzeDrainage(disconnected,300,field()).error);
});

test('soil-dependent protection uses clipped unions instead of summed pipe lengths',()=>{
 const branch=plan().routes[2];
 const a=pipeCoveragePaths([branch],boundary,6),b=pipeCoveragePaths([branch,branch],boundary,6);
 assert.equal(a.fraction,b.fraction);assert.ok(a.fraction<=1);
 const sand={...field(),soilComposition:{sand:100,sandyLoam:0,loam:0,clayLoam:0,clay:0}};
 const clay={...field(),soilComposition:{sand:0,sandyLoam:0,loam:0,clayLoam:0,clay:100}};
 assert.equal(pipeSpacing(sand),10);assert.equal(pipeSpacing(clay),3);
 assert.ok(analyzeDrainage(completed(),300,sand).pipeCoverage>analyzeDrainage(completed(),300,clay).pipeCoverage);
});

test('save cannot forge completion, fees, terrain, blockage or change paid buried geometry',()=>{
 const raw=plan();raw.routes.forEach(r=>{r.work=1000;r.blockage=99});raw.paidAccess=['main','branch'];raw.waterModel=2;raw.surfaceWater=99;
 const result=save(game(),raw);assert.equal(result.ok,true);
 const saved=result.state.fields[0].drainage;assert.ok(saved.routes.every(r=>r.work===0&&r.blockage===0));assert.deepEqual(saved.paidAccess,[]);assert.equal(saved.waterModel,1);assert.equal(saved.surfaceWater,0);
 const worked=applyDrainageAction(result.state,'f',{kind:'work',mode:'contractor'},deps);assert.equal(worked.ok,true);
 assert.deepEqual(new Set(worked.state.fields[0].drainage.paidAccess),new Set(['main','branch']));
 const edited=JSON.parse(JSON.stringify(worked.state.fields[0].drainage));edited.routes[2].depthEnd=.9;
 assert.equal(save(worked.state,edited).ok,false);
 const loaded=JSON.parse(JSON.stringify(worked.state));assert.equal(loaded.fields[0].drainage.routes[2].depthEnd,.75);
});

test('mixed construction shares 200m/day and charges per-kind own labor and fuel, with access fees once',()=>{
 const raw=completed();raw.routes[1].work=0;raw.routes[2].work=0;raw.lastWorkDay=1;raw.contractorMeters=190;
 let quote=drainageWorkQuote(raw,'contractor',1,100,100);assert.equal(quote.length,10);assert.equal(quote.plan.contractorMeters,200);
 assert.match(drainageWorkQuote(JSON.parse(JSON.stringify(quote.plan)),'contractor',1,100,100).error,/200m/);
 quote=drainageWorkQuote(raw,'excavator',1,3.5,100,3.5);assert.ok(Math.abs(quote.length-10)<1e-8);assert.ok(Math.abs(quote.labor-3.5)<1e-8);assert.ok(Math.abs(quote.fuel-1.8)<1e-8);
 const continued=drainageWorkQuote(quote.plan,'excavator',1,100,100);assert.ok(continued.length>0);assert.ok(continued.plan.paidAccess.includes('main'));
 const g=save().state;const worked=applyDrainageAction(g,'f',{kind:'work',mode:'excavator'},deps);assert.equal(worked.ok,true);assert.ok(worked.state.labor<100);assert.ok(worked.state.machineFuelByInstance['dig-1']<100);
 assert.equal(applyDrainageAction({...g,money:0},'f',{kind:'work',mode:'contractor'},deps).ok,false);
 assert.equal(applyDrainageAction({...g,fields:[{...g.fields[0],trees:10}]},'f',{kind:'work',mode:'contractor'},deps).ok,false);
});

test('daily surface/root model conserves incoming moisture, shares outlet capacity and is idempotent',()=>{
 const f={...field(),drainage:completed()};
 const result=applyDailyDrainage(f,90.2,5.2,2), d=result.drainage;
 assert.equal(d.waterModel,2);assert.ok(d.lastPipeDrained>0);assert.ok(d.lastSurfaceDrained>0);
 assert.ok(d.lastDrained<=3.0001);assert.ok(Math.abs(90.2-result.water-d.surfaceWater-d.lastDrained)<1e-8);
 const again=applyDailyDrainage({...f,drainage:JSON.parse(JSON.stringify(d))},90.2,5.2,2);assert.equal(again.water,result.water);assert.equal(again.drainage.surfaceWater,d.surfaceWater);
 assert.equal(applyDailyDrainage(f,60,0,2).water,60);
 const blocked=completed();blocked.routes[0].blockage=100;
 assert.equal(applyDailyDrainage({...f,drainage:blocked},95,0,2).drainage.lastPipeDrained,0);
 const partial=completed();partial.routes[2].work=0;
 assert.equal(applyDailyDrainage({...f,drainage:partial},95,0,2).drainage.waterModel,1);
});

test('sediment, envelope choice and paid cleaning affect actual pipe condition',()=>{
 const f={...field(),soilComposition:{sand:100,sandyLoam:0,loam:0,clayLoam:0,clay:0}};
 const bare=completed();bare.routes[2].envelope=false;
 const covered=applyDailyDrainage({...f,drainage:completed()},95,5.2,2),uncovered=applyDailyDrainage({...f,drainage:bare},95,5.2,2);
 assert.ok(covered.drainage.routes[2].blockage<uncovered.drainage.routes[2].blockage);
 const g={...game(),day:2,fields:[{...f,drainage:uncovered.drainage}]};
 const cleaned=applyDrainageAction(g,'f',{kind:'clean',mode:'contractor'},deps);assert.equal(cleaned.ok,true);assert.ok(cleaned.state.money<g.money);assert.ok(cleaned.state.fields[0].drainage.routes.every(r=>r.blockage===0));
});

test('buried runs allow tree rows above them, while access points and excavation remain protected',()=>{
 const buried=completed();buried.routes=buried.routes.filter(r=>r.type!=='earth');
 assert.ok(drainageOccupiedPy(buried)<1);
 const settings={rowSpacing:3,treeSpacing:1,edgeMargin:0,angleDeg:0};
 const plain=generatePlantingPreview(boundary,settings),withPipe=generatePlantingPreview(boundary,settings,buried.routes);
 assert.ok(withPipe.treeCount<=plain.treeCount);assert.ok(withPipe.treeCount>plain.treeCount*.7);
 const underRow=[route('under','pipe100',[p(14.5,0),p(14.5,29)],{depthStart:.6,depthEnd:.8})];
 const abovePipe=generatePlantingPreview(boundary,settings,underRow);
 assert.ok(abovePipe.trees.some(tree=>Math.abs(tree.x-.0145)<1e-8&&Math.abs(tree.y-.0105)<1e-8));
 const accessAtTree=[route('access','pipe100',[p(14.5,10.5),p(14.5,29)],{depthStart:.6,depthEnd:.8})];
 const withAccess=generatePlantingPreview(boundary,settings,accessAtTree);
 assert.ok(!withAccess.trees.some(tree=>Math.abs(tree.x-.0145)<1e-8&&Math.abs(tree.y-.0105)<1e-8));
 assert.ok(drainageFootprintPaths(buried.routes,'excavation').length>0);
});

test('buried excavation conflicts with building and parking footprints in either placement order',()=>{
 const building={id:'house',kind:'building',points:[p(14,10),p(16,10),p(16,15),p(14,15)]};
 const g={...game(),cultivationZonesByFieldId:{f:[building]}};
 assert.equal(save(g).ok,false);
 const base=save().state;
 assert.equal(applyDrainageAction({...base,cultivationZonesByFieldId:{f:[building]}},'f',{kind:'work',mode:'contractor'},deps).ok,false);
 const parkingPlan={version:1,slots:1,angle:0,anchor:p(14,12),boundaryId:'test'};
 const parking=parkingGeometry(parkingPlan,boundary);
 assert.ok(parking);
 const f={...field(),drainage:completed(),openParking:{...parking.plan,footprints:parking.footprints,occupiedPy:parking.occupiedPy}};
 assert.equal(parkingDrainageConflict(f,completed()),true);
 assert.match(parkingPlanError({...field(),drainage:completed()},parking,boundary,[]),/겹칩니다/);
});
