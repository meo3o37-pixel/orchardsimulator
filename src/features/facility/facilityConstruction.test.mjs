import test from'node:test';import assert from'node:assert/strict';
import{facilityPlacementGeometry,facilityPlacementError,facilityInstallDaysOf,queueFacilityConstruction,completeFacilityConstruction,facilityReservedPy,facilityFootprints,normalizeFacilitySites}from'./facilityConstruction.js';
import{FACILITY_MAP,FACILITY_OCCUPY_PY}from'../../config/sim/facilities.js';
import{polygonAreaPyFromPoints}from'../cadastre/cadastreData.js';
import{cadastreJobs}from'../cadastre/cadastreWork.js';
import{fieldFacilityOccupiedPy}from'./facilityLandUtils.js';
import{generatePlantingPreview}from'../cadastre/plantingDesign.js';
const p=(x,y)=>({x:x/1000,y:y/1000}),boundary=[p(0,0),p(30,0),p(30,30),p(0,30)];
const site={...facilityPlacementGeometry('panelWarehouse5',p(15,15),30),id:'site-1'};
const field={id:0,owned:true,trees:0,py:272,facilitySites:[],landFacilities:{},landFacilityCounts:{}};
const state={day:10,money:1e8,labor:50,fields:[field],facilityConstructionOrders:[]};
const order={id:'order-1',fieldId:'0',fieldName:'시험 토지',facilityKey:'panelWarehouse5',facilityName:'판넬창고 5평',startDay:10,readyDay:14,buildDays:4,occupiedPy:5,installRequest:{site,housingFurnitureIncluded:true},housingOptionKeys:['test-option']};
test('catalogue facilities have positive schedules and footprint area survives rotation',()=>{
 for(const key of Object.keys(FACILITY_MAP))assert.ok(Number.isInteger(facilityInstallDaysOf(key))&&facilityInstallDaysOf(key)>0);
 assert.equal(facilityInstallDaysOf('peTankSmall'),1);assert.equal(facilityInstallDaysOf('panelWarehouse5'),4);assert.equal(facilityInstallDaysOf('coldStorageMax'),16);
 for(const angle of[0,30,90,135])assert.ok(Math.abs(polygonAreaPyFromPoints(facilityPlacementGeometry('panelWarehouse5',p(15,15),angle).points)-5)<1e-7);
});
test('placement validates parcel, built trees, reserved facilities and buried routes',()=>{
 assert.equal(facilityPlacementError(field,boundary,site),'');
 assert.ok(facilityPlacementError(field,boundary,facilityPlacementGeometry('panelWarehouse5',p(0,0))));
 assert.match(facilityPlacementError({...field,trees:1,cadastrePlantingPlans:[{done:1,points:[p(15,15)]}]},boundary,site),/나무/);
 assert.match(facilityPlacementError({...field,trees:1},boundary,site),/연결/);
 const queued=queueFacilityConstruction(state,0,order);
 assert.match(facilityPlacementError(queued.fields[0],boundary,site),/겹칩니다/);
 assert.match(facilityPlacementError({...field,drainage:{routes:[{id:'pipe',type:'pipe100',points:[p(5,15),p(25,15)],work:20}]}},boundary,site),/겹칩니다/);
});
test('paid external construction reserves land without activating facilities, labour or work jobs',()=>{
 const original=JSON.stringify(state),queued=queueFacilityConstruction(state,0,order);
 assert.equal(JSON.stringify(state),original);assert.equal(queued.fields[0].landFacilityCounts.panelWarehouse5,undefined);
 assert.equal(queued.labor,state.labor);assert.equal(facilityReservedPy(queued.fields[0]),5);assert.equal(facilityFootprints(queued.fields[0]).length,1);
 assert.ok(!cadastreJobs(queued,0).some(j=>j.label.includes('판넬창고')));
 assert.strictEqual(queueFacilityConstruction(queued,0,order),queued);
});
test('due date completes once after a save roundtrip and preserves install options',()=>{
 const queued=JSON.parse(JSON.stringify(queueFacilityConstruction(state,0,order)));let calls=0;
 const install=(f,o)=>{calls++;assert.deepEqual(o.housingOptionKeys,['test-option']);assert.equal(o.installRequest.housingFurnitureIncluded,true);return{...f,landFacilities:{...f.landFacilities,panelWarehouse5:true},landFacilityCounts:{...f.landFacilityCounts,panelWarehouse5:1}};};
 assert.strictEqual(completeFacilityConstruction({...queued,day:13},install).fields,queued.fields);assert.equal(calls,0);
 const done=completeFacilityConstruction({...queued,day:14},install);assert.equal(calls,1);assert.equal(done.facilityConstructionOrders.length,0);assert.equal(done.fields[0].facilitySites[0].status,'complete');assert.equal(done.fields[0].landFacilityCounts.panelWarehouse5,1);assert.equal(facilityReservedPy(done.fields[0]),0);
 completeFacilityConstruction(done,install);assert.equal(calls,1);
 const deps={facilityOccupyPy:FACILITY_OCCUPY_PY,fieldFacilityCountOf:(f,key)=>f.landFacilityCounts[key]||0};
 assert.equal(fieldFacilityOccupiedPy(queued.fields[0],deps),5);assert.equal(fieldFacilityOccupiedPy(done.fields[0],deps),5);
 assert.equal(normalizeFacilitySites(done.fields[0].facilitySites).length,1);
});
test('reserved and finished footprints both remove planting points',()=>{
 const settings={crop:'apple',variety:'fuji',rootstock:'M9',rowSpacing:3,treeSpacing:1,edgeMargin:1,angleDeg:0};
 const full=generatePlantingPreview(boundary,settings),queued=queueFacilityConstruction(state,0,order);
 const reserved=generatePlantingPreview(boundary,settings,[],facilityFootprints(queued.fields[0]));
 assert.ok(reserved.treeCount<full.treeCount);assert.ok(reserved.treeCount>0);
});

test('partial planting keeps existing trees and drops only prospective points underneath new construction',()=>{
 const points=[p(5,15),p(15,15),p(25,15)],partial={...state,fields:[{...field,trees:1,cadastrePlantingPlans:[{zoneId:'z',done:1,points}]}]};
 const queued=queueFacilityConstruction(partial,0,order),plan=queued.fields[0].cadastrePlantingPlans[0];
 assert.equal(plan.done,1);assert.deepEqual(plan.points,[points[0],points[2]]);assert.equal(queued.fields[0].trees,1);assert.equal(partial.fields[0].cadastrePlantingPlans[0].points.length,3);
});
