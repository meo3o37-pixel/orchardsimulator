import test from 'node:test';
import assert from 'node:assert/strict';
import { orchardTreeRows, underRowPoints, isActualTreeRowPipe, createOrchardPipeLayout } from './orchardPipeLayout.js';
import { generatePlantingPreview } from './plantingDesign.js';
import { normalizeDrainage, drainageLength, analyzeDrainage, drainageWorkQuote, applyDrainageAction } from './drainage.js';
import { saveDrainageWorkPlan, cadastreJobs, executeCadastreJob, quoteCadastreJob, linkExistingTreeRows } from './cadastreWork.js';
const p=(x,y)=>({x:x/1000,y:y/1000}),boundary=[p(0,0),p(30,0),p(30,30),p(0,30)];
const planting={crop:'apple',variety:'fuji',rootstock:'M9',rowSpacing:3,treeSpacing:1.5,angleDeg:0,edgeMargin:1};
const preview=generatePlantingPreview(boundary,planting);
const field=()=>({id:'f',owned:true,py:300,trees:preview.treeCount,cropId:'fuji',plantedDay:1,slopeDeg:0,slopeBearing:90,machineParkingSlots:['dig-1'],cadastrePlantingPlans:[{zoneId:'z',name:'과원',planting,points:preview.trees,done:preview.treeCount}],drainage:normalizeDrainage({version:1,bearing:90,boundary,boundaryId:'parcel',routes:[{id:'out',type:'earth',points:[p(28,0),p(28,32)],work:32}]})});
const game=()=>({day:1,money:30000000,labor:1000,inventory:{dig:1,seedlingFuji:10},fields:[field()]});
const deps={boundary,boundaryId:'parcel',machine:{id:'dig-1',machineKey:'dig',unitNo:1,item:{usageWear:.12}},excavatorKeys:new Set(['dig']),fuel:1000,durability:100};
const layout=f=>createOrchardPipeLayout(f,orchardTreeRows(f).rows.filter(r=>r.treeCount>=2).map(r=>r.key),'out',boundary,90);
const save=(s=game())=>{const draft=layout(s.fields[0]);assert.equal(draft.ok,true,draft.message);return saveDrainageWorkPlan(s,'f',{kind:'save',scope:'pipes',plan:{version:1,bearing:90,boundary,boundaryId:'parcel',routes:draft.routes}},deps)};

test('each actual planted row produces one collinear pipe, including rotated rows',()=>{
 for(const angleDeg of [0,30,-45,90]){
  const settings={...planting,angleDeg},points=generatePlantingPreview(boundary,settings).trees;
  const f={...field(),trees:points.length,cadastrePlantingPlans:[{zoneId:'z',name:'구역',planting:settings,points,done:points.length}]};
  const rows=orchardTreeRows(f);assert.equal(rows.aligned,true);assert.equal(rows.rows.reduce((s,r)=>s+r.treeCount,0),f.trees);
  for(const row of rows.rows.filter(r=>r.treeCount>=2)){
   const segment=underRowPoints(row,90),route={type:'pipe100',rowKey:row.key,points:segment};assert.equal(isActualTreeRowPipe(f,route,90),true);
   for(const tree of row.points){const[a,b]=segment,dx=b.x-a.x,dy=b.y-a.y;assert.ok(Math.abs((tree.x-a.x)*dy-(tree.y-a.y)*dx)<1e-12);}
  }
 }
 const f=field(),draft=layout(f);assert.equal(draft.ok,true);assert.equal(draft.routes.filter(r=>r.type==='pipe100').length,orchardTreeRows(f).rows.length);
 assert.equal(analyzeDrainage({...f.drainage,routes:[...f.drainage.routes,...draft.routes]},300,f).error,'');
});

test('unknown, mismatched and shifted tree positions cannot create or execute row pipes',()=>{
 const f=field();assert.equal(layout({...f,cadastrePlantingPlans:[]}).ok,false);assert.equal(layout({...f,trees:f.trees+1}).ok,false);
 const draft=layout(f);draft.routes.find(r=>r.type==='pipe100').points[0].x+=.001;
 const s=game();assert.equal(saveDrainageWorkPlan(s,'f',{scope:'pipes',plan:{...f.drainage,routes:draft.routes}},deps).ok,false);
 const saved=save();assert.equal(saved.ok,true);
 const changed={...saved.state,fields:saved.state.fields.map(f=>({...f,trees:f.trees-1}))};
 assert.equal(quoteCadastreJob(changed,'f','pipes',{mode:'contractor'},deps).ok,false);
});

test('two work cards bill and advance only their own route types, retaining the shared quota',()=>{
 let s=game();s.fields[0].drainage.routes[0].work=0;s.fields[0].trees=0;s.fields[0].cadastrePlantingPlans=[];
 const surface=executeCadastreJob(s,'f','drainage',{mode:'contractor',expectedDone:0},deps);assert.equal(surface.ok,true);
 s=surface.state;s.fields[0]={...s.fields[0],trees:field().trees,cadastrePlantingPlans:field().cadastrePlantingPlans};
 const saved=save(s);assert.equal(saved.ok,true);s=saved.state;
 const jobs=cadastreJobs(s,'f');assert.equal(jobs.find(j=>j.id==='drainage').label,'배수로 시공');assert.equal(jobs.find(j=>j.id==='pipes').label,'나무 열 유공관 매설');
 const quote=quoteCadastreJob(s,'f','pipes',{mode:'contractor'},deps);assert.equal(quote.ok,true);assert.ok(Math.abs(quote.amount-168)<1e-8);assert.equal(quote.outletCost,0);
 const before=JSON.stringify(s.fields[0].drainage.routes.find(r=>r.id==='out'));
 const worked=executeCadastreJob(s,'f','pipes',{mode:'contractor',expectedDone:0},deps);assert.equal(worked.ok,true);assert.equal(worked.state.fields[0].trees,field().trees);assert.equal(JSON.stringify(worked.state.fields[0].drainage.routes.find(r=>r.id==='out')),before);
 assert.equal(worked.state.fields[0].drainage.contractorMeters,200);
 assert.equal(quoteCadastreJob(JSON.parse(JSON.stringify(worked.state)),'f','pipes',{mode:'contractor'},deps).ok,false);
 const next=quoteCadastreJob({...worked.state,day:2},'f','pipes',{mode:'contractor'},deps);assert.equal(next.ok,true);
});

test('pipes can be installed under existing mapped trees without consuming or deleting a tree',()=>{
 const saved=save();assert.equal(saved.ok,true);
 saved.state.inventory.drainagePerforatedPipe100x6m=2;saved.state.inventory.drainageCollectorPipe150x6m=1;
 const materialDeps={...deps,pipeMaterialStock:(s,f,k)=>s.inventory[k]||0,consumePipeMaterial:(s,f,k,n)=>({ok:(s.inventory[k]||0)>=n,inventory:{...s.inventory,[k]:s.inventory[k]-n},vehicleCargoByInstance:s.vehicleCargoByInstance})};
 const blocked=quoteCadastreJob({...saved.state,inventory:{dig:1}},'f','pipes',{mode:'excavator',machineId:'dig-1'},materialDeps);assert.equal(blocked.ok,false);assert.match(blocked.message,/농자재마트/);
 const quoted=quoteCadastreJob(saved.state,'f','pipes',{mode:'excavator',machineId:'dig-1'},materialDeps);assert.equal(quoted.amount,18);
 const before=JSON.stringify({trees:saved.state.fields[0].trees,plans:saved.state.fields[0].cadastrePlantingPlans});
 const worked=executeCadastreJob(saved.state,'f','pipes',{mode:'excavator',machineId:'dig-1'},materialDeps);assert.equal(worked.ok,true,worked.message);
 assert.equal(saved.state.money-worked.state.money,quoted.cost);assert.equal(worked.state.inventory.drainagePerforatedPipe100x6m,0);assert.equal(worked.state.inventory.drainageCollectorPipe150x6m,0);
 assert.equal(JSON.stringify({trees:worked.state.fields[0].trees,plans:worked.state.fields[0].cadastrePlantingPlans}),before);
 assert.ok(worked.state.machineFuelByInstance['dig-1']<1000);assert.ok(worked.state.labor<1000);
 const loaded=JSON.parse(JSON.stringify(worked.state));loaded.fields[0].drainage=normalizeDrainage(loaded.fields[0].drainage);
 assert.ok(loaded.fields[0].drainage.routes.some(r=>r.type==='pipe100'&&r.rowKey&&r.work>0));
});

test('saving either design keeps the other design and previously paid construction intact',()=>{
 const saved=save();assert.equal(saved.ok,true);
 const original=saved.state.fields[0].drainage;
 const surface=saveDrainageWorkPlan(saved.state,'f',{scope:'surface',plan:{...original,routes:original.routes.filter(r=>r.type==='earth')}},deps);assert.equal(surface.ok,true);
 assert.deepEqual(surface.state.fields[0].drainage.routes.filter(r=>r.type==='pipe100'),original.routes.filter(r=>r.type==='pipe100'));
 assert.equal(surface.state.money,saved.state.money);
 const result=executeCadastreJob(surface.state,'f','pipes',{mode:'contractor'},deps);assert.equal(result.ok,true);
 const replanned=layout(result.state.fields[0]);assert.equal(replanned.ok,true,replanned.message);
 assert.equal(replanned.routes.filter(r=>r.type==='pipe150').length,1);
 const again=saveDrainageWorkPlan(result.state,'f',{scope:'pipes',plan:{...original,routes:replanned.routes}},deps);assert.equal(again.ok,true,again.message);
 assert.equal(again.state.fields[0].drainage.contractorMeters,result.state.fields[0].drainage.contractorMeters);
});

test('legacy positions are linked only with explicit matching counts and varieties, for free',()=>{
 const f=field();f.cadastrePlantingPlans=[];f.plantLots=[{id:'old',cropId:'fuji',trees:f.trees,plantedDay:1}];
 const s={...game(),fields:[f],cultivationZonesByFieldId:{f:[{id:'z',kind:'farm',name:'과원',points:boundary,boundaryContourId:'parcel',planting}]}};
 const d={...deps,normalizeLots:field=>field.plantLots};const before=JSON.stringify({money:s.money,labor:s.labor,inventory:s.inventory,lots:f.plantLots});
 const linked=linkExistingTreeRows(s,'f',d);assert.equal(linked.ok,true,linked.message);assert.equal(orchardTreeRows(linked.state.fields[0]).aligned,true);
 assert.equal(JSON.stringify({money:linked.state.money,labor:linked.state.labor,inventory:linked.state.inventory,lots:linked.state.fields[0].plantLots}),before);
 assert.equal(linkExistingTreeRows({...s,fields:[{...f,trees:f.trees+1}]},'f',d).ok,false);
 const wrong=JSON.parse(JSON.stringify(s));wrong.cultivationZonesByFieldId.f[0].planting.variety='hongro';assert.equal(linkExistingTreeRows(wrong,'f',d).ok,false);
});

test('row-sized networks beyond the old 64-route limit survive normalization',()=>{
 const b=[p(0,0),p(100,0),p(100,200),p(0,200)],points=generatePlantingPreview(b,planting).trees;
 const f={...field(),trees:points.length,cadastrePlantingPlans:[{zoneId:'large',name:'과원',planting,points,done:points.length}],drainage:{version:1,bearing:90,boundary:b,routes:[{id:'out',type:'main',points:[p(96,0),p(96,202)],work:202}]}};
 const rows=orchardTreeRows(f),draft=createOrchardPipeLayout(f,rows.rows.map(r=>r.key),'out',b,90);assert.equal(draft.ok,true,draft.message);assert.ok(draft.routes.length>64);
 const normalized=normalizeDrainage({...f.drainage,routes:[...f.drainage.routes,...draft.routes]});assert.equal(normalized.routes.length,draft.routes.length+1);
 assert.equal(analyzeDrainage(normalized,1000,f).error,'');
});
