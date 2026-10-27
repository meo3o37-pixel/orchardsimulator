import test from 'node:test';
import assert from 'node:assert/strict';
import { saveParkingWorkPlan, saveDrainageWorkPlan, saveCadastreZones, cadastreJobs, quoteCadastreJob, executeCadastreJob, normalizeCadastreWork } from './cadastreWork.js';
import { normalizeDrainage } from './drainage.js';
const p=(x,y)=>({x:x/1000,y:y/1000});
const boundary=[p(0,0),p(30,0),p(30,30),p(0,30)];
const drainage=()=>({version:1,bearing:90,boundary,boundaryId:'parcel',routes:[{id:'d',type:'earth',points:[p(28,0),p(28,32)],work:32,blockage:0}]});
const field=()=>({id:0,owned:true,py:300,trees:0,cropId:null,slopeBearing:90,quality:0,machineParkingSlots:['dig-1'],drainage:normalizeDrainage(drainage())});
const game=()=>({day:1,money:10000000,labor:100,inventory:{dig:1,plantingShovel:1,seedlingFuji:1000,seedlingM26Fuji:1000,ties:1000},fields:[field()]});
const deps={boundary,boundaryId:'parcel',month:3,machine:{id:'dig-1',machineKey:'dig',unitNo:1,item:{usageWear:.12}},excavatorKeys:new Set(['dig']),fuel:100,durability:100,protectedCapacity:0,openCapacity:1,occupiedPy:()=>0,
 hasShovel:true,bindingKeys:['ties'],seedlingStock:(s,f,k)=>s.inventory[k]||0,bindingStock:(s,f,k)=>s.inventory[k]||0,treeCapacity:()=>1000,maxTreeCapacity:()=>1000,normalizeLots:f=>f.plantLots||[],
 consumeSeedlings:(s,f,k,n)=>({ok:s.inventory[k]>=n,nextInventory:{...s.inventory,[k]:s.inventory[k]-n},nextSeedlingExpiryByKey:{},nextVehicleCargoByInstance:s.vehicleCargoByInstance||{}}),
 consumeBinding:(s,f,k,n)=>({ok:s.inventory[k]>=n,nextInventory:{...s.inventory,[k]:s.inventory[k]-n},nextVehicleCargoByInstance:s.vehicleCargoByInstance||{},nextBindingOpenRemain:{}})};
const zone=(rootstock='M9')=>({id:'zone',name:'사과 1구역',kind:'farm',boundaryContourId:'parcel',points:[p(8,1),p(26,1),p(26,26),p(8,26)],planting:{crop:'apple',variety:'fuji',rootstock,rowSpacing:3,treeSpacing:1.5,angleDeg:0,edgeMargin:1}});
const confirm=(s=game(),z=zone())=>saveCadastreZones(s,0,[z],deps,z.id);

test('parking confirmation is free and changes neither usable parking nor planting space until work',()=>{
 const s={...game(),money:0,labor:0},snapshot=JSON.stringify(s),raw={version:1,slots:2,angle:0,anchor:p(1,1),boundaryId:'parcel'};
 const saved=saveParkingWorkPlan(s,0,raw,deps);assert.equal(saved.ok,true);assert.equal(JSON.stringify(s),snapshot);assert.equal(saved.state.money,0);assert.equal(saved.state.labor,0);assert.equal(saved.state.fields[0].openParking,undefined);
 assert.ok(cadastreJobs(saved.state,0).some(j=>j.id==='parking'&&j.done===0));
 assert.equal(executeCadastreJob(saved.state,0,'parking',{mode:'contractor'},deps).ok,false);
 const funded={...saved.state,money:1000000,labor:100};
 const q=quoteCadastreJob(funded,0,'parking',{mode:'excavator'},deps);assert.equal(q.ok,true);
 const done=executeCadastreJob(funded,0,'parking',{mode:'excavator',expectedDone:0},deps);assert.equal(done.ok,true);assert.equal(done.state.labor,100-q.labor);assert.equal(done.state.machineFuelByInstance['dig-1'],100-q.fuel);assert.equal(done.state.fields[0].openParking.slots,2);assert.equal(done.state.fields[0].cadastreParkingPlan,null);
 const again=executeCadastreJob(done.state,0,'parking',{mode:'contractor',expectedDone:0},deps);assert.equal(again.ok,false);
});

test('drainage saved plan appears as installation work and only execution spends resources',()=>{
 const s=game();s.fields[0].drainage=null;const raw=drainage();raw.routes[0].work=999;
 const planned=saveDrainageWorkPlan(s,0,{plan:raw},deps);assert.equal(planned.ok,true);assert.equal(planned.state.money,s.money);assert.equal(planned.state.fields[0].drainage.routes[0].work,0);
 const q=quoteCadastreJob(planned.state,0,'drainage',{mode:'contractor'},deps);assert.equal(q.ok,true);assert.ok(q.remainingCost>=q.cost);
 const done=executeCadastreJob(planned.state,0,'drainage',{mode:'contractor',expectedDone:0},deps);assert.equal(done.ok,true);assert.equal(done.state.money,s.money-q.cost);assert.equal(cadastreJobs(done.state,0).find(j=>j.id==='drainage').done,32);
 assert.equal(executeCadastreJob(done.state,0,'drainage',{mode:'contractor',expectedDone:0},deps).ok,false);
 const blocked={...planned.state,fields:planned.state.fields.map(f=>({...f,drainage:{...f.drainage,boundaryId:'old'}}))};
 assert.equal(executeCadastreJob(blocked,0,'drainage',{mode:'contractor'},deps).ok,false);
});

test('planting confirmation freezes positions and exact rootstock, consumes nothing and survives reload',()=>{
 const s=game(),snapshot=JSON.stringify(s),saved=confirm(s,zone('M26'));assert.equal(saved.ok,true);assert.equal(JSON.stringify(s),snapshot);
 const f=saved.state.fields[0],plan=f.cadastrePlantingPlans[0];assert.equal(f.trees,0);assert.ok(plan.points.length>10);assert.equal(plan.done,0);assert.equal(saved.state.inventory.seedlingM26Fuji,1000);
 const loaded=JSON.parse(JSON.stringify(saved.state));loaded.fields[0]={...loaded.fields[0],...normalizeCadastreWork(loaded.fields[0])};
 assert.deepEqual(loaded.fields[0].cadastrePlantingPlans[0].points,plan.points);
 const repeated=confirm(loaded,zone('M26'));assert.equal(repeated.ok,true);assert.equal(cadastreJobs(repeated.state,0).filter(j=>j.kind==='plant').length,1);
 const q=quoteCadastreJob(loaded,0,'plant:zone',{mode:'shovel',bindingKey:'ties',quantity:5},deps);assert.equal(q.seedlingKey,'seedlingM26Fuji');assert.equal(q.amount,5);
});

test('partial planting updates real trees/lots, consumes seedlings and ties once and resumes after JSON roundtrip',()=>{
 const s=confirm().state,options={mode:'shovel',bindingKey:'ties',quantity:5,expectedDone:0};
 const result=executeCadastreJob(s,0,'plant:zone',options,deps);assert.equal(result.ok,true);
 const f=result.state.fields[0];assert.equal(f.trees,5);assert.equal(f.plantLots[0].trees,5);assert.equal(f.cadastrePlantingPlans[0].done,5);assert.equal(result.state.inventory.seedlingFuji,995);assert.equal(result.state.inventory.ties,995);assert.equal(result.state.labor,99);
 assert.equal(executeCadastreJob(result.state,0,'plant:zone',options,deps).ok,false);
 const loaded=JSON.parse(JSON.stringify(result.state));loaded.fields[0]={...loaded.fields[0],...normalizeCadastreWork(loaded.fields[0])};
 const next=executeCadastreJob(loaded,0,'plant:zone',{...options,expectedDone:5},deps);assert.equal(next.ok,true);assert.equal(next.state.fields[0].trees,10);assert.equal(next.state.fields[0].cadastrePlantingPlans[0].done,10);assert.equal(next.state.fields[0].plantLots.length,2);
 const edited=zone();edited.planting.treeSpacing=2;assert.equal(confirm(next.state,edited).ok,false);assert.equal(saveCadastreZones(next.state,0,[],deps).ok,false);
});

test('season, drainage, pending construction, trellis, equipment and materials block without any mutations',()=>{
 const s=confirm().state,options={mode:'shovel',bindingKey:'ties',quantity:5};
 for(const change of [{month:5},{treeCapacity:()=>0},{hasShovel:false},{seedlingStock:()=>0},{bindingStock:()=>0},{consumeBinding:()=>({ok:false})}]){
  const snapshot=JSON.stringify(s);const result=executeCadastreJob(s,0,'plant:zone',options,{...deps,...change});assert.equal(result.ok,false);assert.equal(JSON.stringify(s),snapshot);
 }
 const noDrain={...s,fields:s.fields.map(f=>({...f,drainage:null}))};assert.equal(quoteCadastreJob(noDrain,0,'plant:zone',options,deps).ok,false);
 const pending=saveParkingWorkPlan(s,0,{version:1,slots:1,angle:0,anchor:p(1,1),boundaryId:'parcel'},deps).state;assert.equal(quoteCadastreJob(pending,0,'plant:zone',options,deps).ok,false);
 const noMachine={...deps,machine:null};assert.equal(quoteCadastreJob(s,0,'plant:zone',{...options,mode:'excavator'},noMachine).ok,false);
 const unowned={...s,inventory:{...s.inventory,dig:undefined}};assert.equal(quoteCadastreJob(unowned,0,'plant:zone',{...options,mode:'excavator'},deps).ok,false);
 assert.equal(quoteCadastreJob(s,0,'plant:zone',{...options,mode:'excavator'},{...deps,durability:0}).ok,false);
 const own=executeCadastreJob(s,0,'plant:zone',{...options,mode:'excavator'},deps);assert.equal(own.ok,true);assert.equal(own.state.machineFuelByInstance['dig-1'],99.9);
});

test('land ownership, geometry changes and obstacles cannot bypass confirmed positions',()=>{
 const s=confirm().state;
 assert.equal(executeCadastreJob({...s,fields:s.fields.map(f=>({...f,owned:false}))},0,'plant:zone',{mode:'shovel',bindingKey:'ties'},deps).ok,false);
 const changed=JSON.parse(JSON.stringify(s));changed.cultivationZonesByFieldId['0'][0].points[0].x+=.0001;
 assert.equal(quoteCadastreJob(changed,0,'plant:zone',{mode:'shovel',bindingKey:'ties'},deps).ok,false);
 const empty=game();empty.fields[0].drainage=null;
 const parking=saveParkingWorkPlan(empty,0,{version:1,slots:1,angle:0,anchor:p(26,10),boundaryId:'parcel'},deps);
 assert.equal(parking.ok,true);assert.equal(saveDrainageWorkPlan(parking.state,0,{plan:drainage()},deps).ok,false);
});

test('contractor planting shares a persisted 200-tree daily allowance across zones',()=>{
 const b=[p(0,0),p(60,0),p(60,60),p(0,60)],d={...deps,boundary:b};
 let s=game();s.fields[0].drainage=normalizeDrainage({version:1,bearing:90,boundary:b,boundaryId:'parcel',routes:[{id:'out',type:'main',points:[p(59,0),p(59,62)],work:62,blockage:0}]});
 const a={...zone(),id:'a',points:[p(1,1),p(29,1),p(29,58),p(1,58)]},z={...zone(),id:'b',points:[p(31,1),p(57,1),p(57,58),p(31,58)]};
 let r=saveCadastreZones(s,0,[a,z],d,'a');assert.equal(r.ok,true);r=saveCadastreZones(r.state,0,[a,z],d,'b');assert.equal(r.ok,true);s=r.state;
 r=executeCadastreJob(s,0,'plant:a',{mode:'contractor',bindingKey:'ties',quantity:150},d);assert.equal(r.ok,true);assert.equal(r.state.fields[0].trees,150);
 const q=quoteCadastreJob(r.state,0,'plant:b',{mode:'contractor',bindingKey:'ties',quantity:150},d);assert.equal(q.amount,50);
 r=executeCadastreJob(r.state,0,'plant:b',{mode:'contractor',bindingKey:'ties',quantity:150},d);assert.equal(r.state.fields[0].trees,200);assert.equal(r.state.labor,100);
 s=JSON.parse(JSON.stringify(r.state));s.fields[0]={...s.fields[0],...normalizeCadastreWork(s.fields[0])};assert.equal(quoteCadastreJob(s,0,'plant:b',{mode:'contractor',bindingKey:'ties'},d).ok,false);
 assert.ok(quoteCadastreJob({...s,day:2},0,'plant:b',{mode:'contractor',bindingKey:'ties'},d).amount>0);
});

test('maintenance appears in installation work and disappears only after successful cleaning',()=>{
 const s=game();s.fields[0].drainage.routes[0].blockage=25;
 assert.ok(cadastreJobs(s,0).some(j=>j.id==='drainageClean'));
 const result=executeCadastreJob(s,0,'drainageClean',{mode:'contractor'},deps);assert.equal(result.ok,true);assert.ok(result.state.money<s.money);assert.ok(!cadastreJobs(result.state,0).some(j=>j.id==='drainageClean'));
});
