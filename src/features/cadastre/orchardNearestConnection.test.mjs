import test from 'node:test';
import assert from 'node:assert/strict';
import {createOrchardPipeLayout} from './orchardPipeLayout.js';
import {junctionDepthOK} from './pipeSystem.js';
import {normalizeDrainage,analyzeDrainage} from './drainage.js';
const p=(x,y)=>({x:x/1000,y:y/1000});
test('distant rows join the nearest point of an already connected row without an edge collector',()=>{
 const boundary=[p(0,0),p(30,0),p(30,30),p(0,30)];
 const field={trees:4,slopeDeg:0,cadastrePlantingPlans:[{zoneId:'z',name:'test',planting:{angleDeg:0},points:[p(2,5),p(25,5),p(2,10),p(20,10)],done:4}],drainage:{routes:[{id:'out',type:'earth',points:[p(28,0),p(28,32)],work:0}]}};
 const keys=['z:0','z:5000'];
 const bare=createOrchardPipeLayout(field,keys,'out',boundary,90,'pipe100');
 assert.equal(bare.ok,true);assert.equal(bare.routes.length,2);
 const linked=createOrchardPipeLayout(field,keys,'out',boundary,90,'pipe100',true);
 assert.equal(linked.ok,true,linked.message);
 const link=linked.routes.find(r=>r.id==='tree-link:z:5000');
 assert.ok(link);assert.ok(Math.abs(link.points.at(-1).x-.0204)<1e-10);assert.equal(link.points.at(-1).y,.005);
 assert.equal(junctionDepthOK(link,linked.routes.find(r=>r.rowKey==='z:0'),90),true);
 assert.equal(linked.routes.some(r=>r.id.startsWith('tree-collector:')),false);
 const status=analyzeDrainage({version:1,bearing:90,boundary,routes:[...field.drainage.routes,...linked.routes]},300,field);
 assert.equal(status.error,'');
 for(const route of linked.routes)assert.ok(status.connectedRouteIds.includes(route.id));
});
test('short connectors survive normalization and use the same connectivity result',()=>{
 const boundary=[p(0,0),p(30,0),p(30,30),p(0,30)];
 const raw={version:1,bearing:90,boundary,routes:[{id:'out',type:'earth',points:[p(28,0),p(28,32)],work:0},{id:'tree-link:short',type:'pipe150',points:[p(27.5,15),p(28,15)],depthStart:.8,depthEnd:.8,work:0}]};
 assert.equal(normalizeDrainage(raw).routes.length,2);
 const status=analyzeDrainage(raw,300,{slopeDeg:0});assert.equal(status.error,'');assert.ok(status.connectedRouteIds.includes('tree-link:short'));
});
