import test from 'node:test';
import assert from 'node:assert/strict';
import { SHOP_ITEMS } from '../../config/items/index.js';
import { DRAINAGE_MATERIAL_ITEMS } from '../../config/items/drainageMaterial.js';
import { applyDrainageAction, drainageLength, drainageWorkQuote } from './drainage.js';
import { allocatePipeMaterials } from './pipeMaterials.js';
const [branch,main]=DRAINAGE_MATERIAL_ITEMS;
const p=(x,y)=>({x:x/1000,y:y/1000}),boundary=[p(0,0),p(30,0),p(30,30),p(0,30)];
const raw={version:1,bearing:90,boundary,routes:[
 {id:'out',type:'earth',points:[p(28,0),p(28,32)],work:32},
 {id:'main',type:'pipe150',points:[p(15,25),p(28,28)],depthStart:.8,depthEnd:1},
 {id:'branch',type:'pipe100',points:[p(15,0),p(15,25)],depthStart:.6,depthEnd:.75}
]};
const consume=(s,f,key,n)=>({ok:(s.inventory[key]||0)>=n,inventory:{...s.inventory,[key]:(s.inventory[key]||0)-n},vehicleCargoByInstance:s.vehicleCargoByInstance});
const deps={boundary,boundaryId:'b',fuel:100,pipeMaterialStock:(s,f,key)=>s.inventory[key]||0,consumePipeMaterial:consume};
const game=()=>({day:1,money:3000000,labor:100,inventory:{[branch.key]:5,[main.key]:3},fields:[{id:'f',owned:true,trees:0,py:300,slopeDeg:0,slopeBearing:90}]});
const save=s=>applyDrainageAction(s,'f',{kind:'save',plan:raw},deps).state;

const ownDeps={...deps,machine:{id:'dig-1',machineKey:'dig',unitNo:1,item:{usageWear:.12}},excavatorKeys:new Set(['dig']),durability:100};
const ownGame=inventory=>{const s=save(game());s.inventory={dig:1,...inventory};s.fields[0].machineParkingSlots=['dig-1'];s.fields[0].drainage.routes[0].work=32;return s;};
const ownWork=s=>applyDrainageAction(s,'f',{kind:'work',mode:'excavator',scope:'all'},ownDeps);

test('own excavator without purchased pipes cannot spend anything or advance burial',()=>{
 const s=ownGame({}),before=JSON.stringify(s),r=ownWork(s);
 assert.equal(r.ok,false);assert.match(r.message,/농자재마트/);assert.equal(JSON.stringify(s),before);
});
test('own excavator is limited per diameter and does not substitute main pipes for branches',()=>{
 const s=ownGame({[branch.key]:1}),r=ownWork(s);assert.equal(r.ok,true,r.message);
 assert.equal(r.state.fields[0].drainage.routes.find(p=>p.type==='pipe100').work,6);
 assert.equal(r.state.fields[0].drainage.routes.find(p=>p.type==='pipe150').work,0);
 assert.equal(r.state.inventory[branch.key],0);assert.ok(r.state.labor<s.labor);
 assert.equal(ownWork(r.state).ok,false);
 const mainOnly=ownWork(ownGame({[main.key]:1}));assert.equal(mainOnly.ok,true,mainOnly.message);
 assert.equal(mainOnly.state.fields[0].drainage.routes.find(p=>p.type==='pipe150').work,6);
 assert.equal(mainOnly.state.fields[0].drainage.routes.find(p=>p.type==='pipe100').work,0);
});
test('own excavator uses offcuts after reload and stops at their exact length',()=>{
 const s=ownGame({});s.fields[0].cadastrePipeOffcuts={[branch.key]:2.5};
 const r=ownWork(JSON.parse(JSON.stringify(s)));assert.equal(r.ok,true,r.message);
 assert.equal(r.state.fields[0].drainage.routes.find(p=>p.type==='pipe100').work,2.5);
 assert.equal(r.state.fields[0].cadastrePipeOffcuts[branch.key],0);
 assert.equal(ownWork(r.state).ok,false);
});

test('mart catalog exposes HDPE pipes in whole six-metre lengths with weight and price',()=>{
 for(const item of DRAINAGE_MATERIAL_ITEMS){const catalog=SHOP_ITEMS.consumableMaterial.find(i=>i.key===item.key);assert.equal(catalog.lengthM,6);assert.equal(catalog.unit,'본');assert.equal(catalog.material,'HDPE');assert.ok(catalog.weightKg>0&&catalog.price>0);}
});
test('planning is free; execution consumes whole pipes once and deducts exactly their used value',()=>{
 const initial=game(),s=save(initial);assert.deepEqual(s.inventory,initial.inventory);
 const q=drainageWorkQuote(s.fields[0].drainage,'contractor',1,100,100,100,'all');
 const alloc=allocatePipeMaterials(s,s.fields[0],s.fields[0].drainage,q.plan,deps);
 const r=applyDrainageAction(s,'f',{kind:'work',mode:'contractor',scope:'all'},deps);assert.equal(r.ok,true,r.message);
 assert.equal(r.state.money,s.money-q.cost+alloc.credit);assert.equal(r.state.inventory[branch.key],0);assert.equal(r.state.inventory[main.key],0);
 assert.equal(r.state.fields[0].cadastrePipeOffcuts[branch.key],5);
 assert.equal(r.state.fields[0].drainage.routes[0].work,32);
 const before=JSON.stringify(r.state);assert.equal(applyDrainageAction(r.state,'f',{kind:'work',mode:'contractor',scope:'all'},deps).ok,false);assert.equal(JSON.stringify(r.state),before);
});
test('short offcuts survive JSON reload and pay only for the next installed metres',()=>{
 const s=save(game()),f=s.fields[0],before=f.drainage;
 const partial={...before,routes:before.routes.map(r=>r.id==='branch'?{...r,work:2}:r)};
 const a=allocatePipeMaterials(s,f,before,partial,deps);assert.equal(a.rows.find(r=>r.key===branch.key).units,1);assert.equal(a.offcuts[branch.key],4);
 const loaded=JSON.parse(JSON.stringify({...f,cadastrePipeOffcuts:a.offcuts}));
 const further={...partial,routes:partial.routes.map(r=>r.id==='branch'?{...r,work:5}:r)};
 const b=allocatePipeMaterials({...s,inventory:{}},loaded,partial,further,deps);
 assert.equal(b.rows.find(r=>r.key===branch.key).units,0);assert.equal(b.offcuts[branch.key],1);assert.equal(b.credit,7700);
});
test('insufficient money or changed stock never consumes pipes or advances work',()=>{
 const s=save(game()),before=JSON.stringify(s);
 assert.equal(applyDrainageAction({...s,money:0},'f',{kind:'work',mode:'contractor',scope:'all'},deps).ok,false);
 assert.equal(applyDrainageAction(s,'f',{kind:'work',mode:'contractor',scope:'all'},{...deps,consumePipeMaterial:()=>({ok:false})}).ok,false);
 assert.equal(JSON.stringify(s),before);
});
test('surface work never consumes buried-pipe stock; absent stock keeps inclusive supplier pricing',()=>{
 const s=save(game());s.fields[0].drainage.routes[0].work=0;
 const r=applyDrainageAction(s,'f',{kind:'work',mode:'contractor',scope:'surface'},deps);assert.equal(r.ok,true,r.message);assert.deepEqual(r.state.inventory,s.inventory);
 const empty={...save(game()),inventory:{}};const q=drainageWorkQuote(empty.fields[0].drainage,'contractor',1,100,100,100,'all');
 const noStock=applyDrainageAction(empty,'f',{kind:'work',mode:'contractor',scope:'all'},deps);assert.equal(noStock.ok,true,noStock.message);assert.equal(noStock.state.money,empty.money-q.cost);
 assert.ok(drainageLength(noStock.state.fields[0].drainage.routes[1].points)>0);
});
