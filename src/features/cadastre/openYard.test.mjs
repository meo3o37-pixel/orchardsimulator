import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{yardGeometry,normalizeOpenYard,yardPlanError,saveOpenYardPlan,quoteOpenYardWork,executeOpenYardWork,yardFootprints}from'./openYard.js';
import{parkingGeometry,parkingPlanError}from'./openParking.js';
import{cadastreJobs,quoteCadastreJob,executeCadastreJob,saveCadastreZones,normalizeCadastreWork}from'./cadastreWork.js';
import{applyDrainageAction}from'./drainage.js';
import{generatePlantingPreview}from'./plantingDesign.js';
const p=(x,y)=>({x:x/1000,y:y/1000}),boundary=[p(0,0),p(30,0),p(30,30),p(0,30)],plan={version:1,width:6,depth:6,angle:0,anchor:p(5,5),boundaryId:'b'};
const field=()=>({id:'f',owned:true,py:300,trees:0,slopeDeg:0,machineParkingSlots:['dig-1']});
const game=()=>({day:1,money:10000000,labor:100,inventory:{dig:1,trellisStake:15},storage:[{qty:1000,storageFacilityKey:'openStorage3000Py'}],fields:[field()],cultivationZonesByFieldId:{f:[]}});
const deps={boundary,boundaryId:'b',machine:{id:'dig-1',machineKey:'dig',unitNo:1,item:{usageWear:.12}},excavatorKeys:new Set(['dig']),fuel:100,durability:100,openYardUsedKg:()=>1000};
const save=(s=game(),raw=plan,d=deps)=>saveOpenYardPlan(s,'f',raw,d);
test('geometry separates storage, aisle and true pallet capacity at any supported rotation',()=>{
 const g=yardGeometry(plan);assert.equal(g.slots,9);assert.equal(g.capacityKg,13500);assert.ok(Math.abs(g.occupiedPy-g.storagePy-g.aislePy)<1e-9);assert.equal(g.pallets.length,9);
 for(const angle of[0,45,90,135,180,225,270,315]){const rotated=yardGeometry({...plan,anchor:p(15,15),angle});assert.equal(rotated.capacityKg,g.capacityKg);assert.equal(yardPlanError(field(),rotated,boundary), '');}
 assert.equal(yardGeometry({...plan,width:0}),null);assert.equal(yardGeometry({...plan,depth:Infinity}),null);
 assert.equal(normalizeOpenYard({...plan,capacityKg:999999}).capacityKg,13500);
});
test('confirmation is free, cannot forge completion and adds a separate work card',()=>{
 const s=game(),r=save(s,{...plan,done:999,capacityKg:999999});assert.equal(r.ok,true,r.message);assert.equal(r.state.money,s.money);assert.deepEqual(r.state.inventory,s.inventory);assert.deepEqual(r.state.storage,s.storage);assert.equal(r.state.fields[0].openYard,undefined);
 const job=cadastreJobs(r.state,'f').find(j=>j.id==='yard');assert.equal(job.done,0);assert.ok(job.total>16);assert.ok(normalizeCadastreWork(r.state.fields[0]).cadastreYardPlan);
 const loaded=JSON.parse(JSON.stringify(r.state));assert.equal(quoteCadastreJob(loaded,'f','yard',{mode:'contractor'},deps).ok,true);
});
test('outside, overlapping, planted and incomplete-position land are rejected',()=>{
 assert.equal(save(game(),{...plan,anchor:p(28,28)}).ok,false);
 const s=game();s.fields[0].openParking={...parkingGeometry({version:1,slots:1,angle:0,anchor:p(5,5)}).plan,footprints:parkingGeometry({version:1,slots:1,angle:0,anchor:p(5,5)}).footprints};assert.equal(save(s).ok,false);
 const planted=game();planted.fields[0].trees=1;planted.fields[0].cadastrePlantingPlans=[{points:[p(7,7)],done:1}];assert.equal(save(planted).ok,false);
 planted.fields[0].cadastrePlantingPlans=[];assert.match(save(planted).message,/위치/);
 const posts=game();posts.fields[0].orchardInfrastructure={trellis:{rows:[{points:[p(2,7),p(15,7)],done:{posts:true}}]}};assert.equal(save(posts).ok,false);
});
test('shrinking below existing stock or used pallet number is blocked without deleting anything',()=>{
 const s=game(),before=JSON.stringify(s);assert.equal(save(s,plan,{...deps,openYardUsedKg:()=>14000}).ok,false);assert.equal(save(s,plan,{...deps,openYardUsedSlot:()=>10}).ok,false);assert.equal(JSON.stringify(s),before);
 const saved=save(s).state;assert.equal(executeOpenYardWork(saved,'f',{mode:'contractor'},{...deps,openYardUsedKg:()=>14000}).ok,false);assert.equal(saved.fields[0].openYard,undefined);
});
test('work execution uses quoted cost, keeps inventory and storage, and cannot charge twice',()=>{
 const s=save().state,q=quoteCadastreJob(s,'f','yard',{mode:'contractor'},deps),r=executeCadastreJob(s,'f','yard',{mode:'contractor',expectedDone:0},deps);assert.equal(r.ok,true,r.message);assert.equal(s.money-r.state.money,q.cost);assert.equal(r.state.fields[0].openYard.capacityKg,13500);assert.equal(r.state.fields[0].cadastreYardPlan,null);assert.deepEqual(r.state.inventory,s.inventory);assert.deepEqual(r.state.storage,s.storage);
 assert.equal(executeCadastreJob(r.state,'f','yard',{mode:'contractor',expectedDone:0},deps).ok,false);
 assert.equal(cadastreJobs(r.state,'f').find(j=>j.id==='yard').done,q.amount);
});
test('own excavator requires ownership, parking, condition, fuel and labor; fees are atomic',()=>{
 const s=save().state,before=JSON.stringify(s);for(const bad of[{fuel:0},{durability:0},{machine:null}])assert.equal(executeOpenYardWork(s,'f',{mode:'excavator'},{...deps,...bad}).ok,false);assert.equal(JSON.stringify(s),before);
 const q=quoteOpenYardWork(s,'f',{mode:'excavator'},deps),r=executeOpenYardWork(s,'f',{mode:'excavator'},deps);assert.equal(r.ok,true,r.message);assert.equal(r.state.labor,s.labor-q.labor);assert.equal(r.state.machineFuelByInstance['dig-1'],100-q.fuel);assert.ok(r.state.equipmentDurabilityByInstance['dig-1']<100);
});
test('reserved yards block parking, drainage, buildings and planting until construction finishes',()=>{
 const s=save().state,parking=parkingGeometry({version:1,slots:1,angle:0,anchor:p(5,5)});assert.match(parkingPlanError(s.fields[0],parking,boundary),/겹/);
 const drain={version:1,bearing:90,boundary,routes:[{id:'out',type:'earth',points:[p(7,0),p(7,32)]}]};assert.equal(applyDrainageAction(s,'f',{kind:'save',plan:drain},deps).ok,false);
 const zone={id:'build',kind:'building',name:'창고',points:[p(6,6),p(8,6),p(8,8),p(6,8)]};assert.equal(saveCadastreZones(s,'f',[zone],deps).ok,false);
});
test('completed footprints remove prospective tree sites and preserve the row lattice elsewhere',()=>{
 const settings={crop:'apple',variety:'fuji',rootstock:'M9',rowSpacing:3,treeSpacing:1.5,edgeMargin:1,angleDeg:0};
 const original=generatePlantingPreview(boundary,settings),s=executeOpenYardWork(save().state,'f',{mode:'contractor'},deps).state,masked=generatePlantingPreview(boundary,settings,[],yardFootprints(s.fields[0]));assert.ok(masked.treeCount<original.treeCount);const originalSet=new Set(original.trees.map(p=>JSON.stringify(p)));assert.ok(masked.trees.every(p=>originalSet.has(JSON.stringify(p))));
});
test('real application storage capacity and pallet count follow completed geometry rather than parcel size',()=>{
 const text=fs.readFileSync(new URL('../../App.jsx',import.meta.url),'utf8'),names=['openStorageHarvestPalletSlotCountOfField','openStorageOccupyPyOfField','fieldFacilityCountOf','storageCapacityKgPerUnitOfFacility','storageCapacityKgTotalOfFieldFacility'];
 const src=names.map(name=>text.match(new RegExp('const '+name+' = [\\s\\S]+?\\n};'))?.[0]);assert.ok(src.every(Boolean));
 const build=new Function('normalizeOpenYard',`const OPEN_STORAGE_BASE_FACILITY_KEY='openStorage3000Py',OPEN_STORAGE_PY_PER_SLOT=200,OPEN_STORAGE_PY_MIN_OCCUPY=1,OPEN_STORAGE_PALLET_SLOT_CAPACITY_KG=1500,TANK_FACILITY_KEYS=[],STORAGE_CAPACITY_KG_BY_FACILITY={};${src.join('\n')}return{slots:openStorageHarvestPalletSlotCountOfField,capacity:storageCapacityKgTotalOfFieldFacility,area:openStorageOccupyPyOfField}`);
 const app=build(normalizeOpenYard),f={...field(),py:9999,openYard:normalizeOpenYard(plan)};assert.equal(app.slots(f),9);assert.equal(app.capacity(f,'openStorage3000Py'),13500);assert.equal(app.area(f),f.openYard.occupiedPy);
});
