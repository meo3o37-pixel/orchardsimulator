import test from 'node:test';
import assert from 'node:assert/strict';
import { parkingGeometry, parkingPlanError, parkingWorkQuote, applyOpenParking, parkingDrainageConflict, normalizeOpenParking } from './openParking.js';
import { polygonAreaPyFromPoints, polygonContainsPoint } from './cadastreData.js';
import { generatePlantingPreview } from './plantingDesign.js';
import { fieldFacilityOccupiedPy } from '../facility/facilityLandUtils.js';
import { fieldOpenParkingCapacityByPy, fieldTotalParkingCapacity } from '../facility/facilityMetaUtils.js';

const metres = (rows) => rows.map(([x, y]) => ({ x: x / 1000, y: y / 1000 }));
const boundary = metres([[0, 0], [60, 0], [60, 60], [0, 60]]);
const plan = (slots = 1) => ({ version: 1, slots, angle: 0, anchor: { x: .005, y: .005 }, boundaryId: 'parcel' });
const state = (patch = {}) => ({ money: 1000000, labor: 100, fields: [{ id: 'a', owned: true, py: 1000, trees: 0, machineParkingSlots: [], ...patch }] });
const deps = { boundary, boundaryId: 'parcel', occupiedPy: fieldFacilityOccupiedPy };

test('each bay occupies exactly 4 py; only the adjacent 3 m manoeuvring aisle occupies extra land', () => {
  for (const slots of [1, 2, 3, 20]) {
    const g = parkingGeometry(plan(slots), boundary);
    assert.ok(Math.abs(polygonAreaPyFromPoints(g.parking) - slots * 4) < .0001);
    assert.ok(g.occupiedPy > slots * 4);
    assert.equal(g.footprints.length, 2);
    assert.ok(Math.abs(g.occupiedPy - slots * (4 + 7.5 / 3.305785)) < .0001);
    assert.ok(g.bays.every((p) => Math.abs(polygonAreaPyFromPoints(p) - 4) < .0001));
  }
});

test('parking can stand in the parcel interior without any entrance connection', () => {
  const interior = { ...plan(2), anchor: { x: .03, y: .03 } };
  const g = parkingGeometry(interior, boundary);
  assert.equal(parkingPlanError({ trees: 0 }, g, boundary), '');
  assert.ok(g.footprints.flat().every((p) => p.x > .02 && p.y > .02));
});

test('legacy entrance is removed from saved land occupation and drainage collisions without a new fee', () => {
  const saved = applyOpenParking(state(), 'a', plan(), deps).state.fields[0];
  const oldRoad = metres([[0, 30], [40, 30], [40, 33], [0, 33]]);
  const legacy = { ...saved, openParking: { ...saved.openParking, occupiedPy: saved.openParking.occupiedPy + 100, footprints: [...saved.openParking.footprints, oldRoad] } };
  assert.ok(Math.abs(fieldFacilityOccupiedPy(legacy) - saved.openParking.occupiedPy) < .0001);
  const fixed = normalizeOpenParking(JSON.parse(JSON.stringify(legacy.openParking)));
  assert.equal(fixed.footprints.length, 2);
  assert.equal(parkingWorkQuote(legacy, plan(), boundary).cost, 0);
  assert.equal(parkingDrainageConflict(legacy, { routes: [{ id: 'd', type: 'earth', points: metres([[10, 31], [20, 31]]) }] }), false);
});
test('outside placement, malformed plans and unowned land cannot change state', () => {
  assert.equal(parkingGeometry(plan(0), boundary), null);
  const s = state();
  for (const raw of [null, plan(21), { ...plan(), anchor: { x: -.001, y: .01 } }, { ...plan(), boundaryId: 'other' }]) {
    const result = applyOpenParking(s, 'a', raw, deps);
    assert.equal(result.ok, false); assert.equal(result.state, s);
  }
  assert.equal(applyOpenParking(state({ owned: false }), 'a', plan(), deps).ok, false);
});
test('first bay is free; expansion is atomic and repeated saves do not charge twice', () => {
  const initial = applyOpenParking(state(), 'a', plan(), deps);
  assert.equal(initial.ok, true); assert.equal(initial.state.money, 1000000);
  const expanded = applyOpenParking(initial.state, 'a', plan(3), deps);
  assert.equal(expanded.ok, true); assert.equal(expanded.state.money, 700000);
  assert.equal(expanded.state.labor, 100);
  assert.equal(applyOpenParking(expanded.state, 'a', plan(3), deps).state.money, 700000);
  const poor = { ...initial.state, money: 0 };
  assert.equal(applyOpenParking(poor, 'a', plan(3), deps).state, poor);
  assert.ok(parkingWorkQuote(expanded.state.fields[0], { ...plan(3), angle: 90 }, boundary).cost > 20000);
});

test('own excavator uses own labor, fuel and wear instead of contractor money', () => {
  const machine = { id: 'digger:1', machineKey: 'digger', unitNo: 1, item: { usageWear: .12 } };
  const s = { ...state({ machineParkingSlots: [machine.id] }), inventory: { digger: 1 } };
  const built = applyOpenParking(s, 'a', plan(), deps).state;
  const ownDeps = { ...deps, workMode: 'excavator', machine, excavatorKeys: new Set(['digger']), fuel: 10, durability: 80 };
  const result = applyOpenParking(built, 'a', plan(3), ownDeps);
  assert.equal(result.ok, true);
  assert.equal(result.state.money, 1000000);
  assert.equal(result.state.labor, 80);
  assert.equal(result.state.machineFuelByInstance[machine.id], 6);
  assert.ok(result.state.equipmentDurabilityByInstance[machine.id] < 80);
  assert.deepEqual(result.state.fields[0].machineParkingSlots, [machine.id]);
  for (const invalid of [{ ...ownDeps, fuel: 1 }, { ...ownDeps, durability: 0 }, { ...ownDeps, machine: null }, { ...ownDeps, excavatorKeys: new Set() }]) {
    const failed = applyOpenParking(built, 'a', plan(3), invalid);
    assert.equal(failed.ok, false); assert.equal(failed.state, built);
  }
  for (const invalidState of [{ ...built, labor: 0 }, { ...built, inventory: {} }, { ...built, fields: [{ ...built.fields[0], machineParkingSlots: [] }] }]) {
    const failed = applyOpenParking(invalidState, 'a', plan(3), ownDeps);
    assert.equal(failed.ok, false); assert.equal(failed.state, invalidState);
  }
  assert.equal(applyOpenParking(built, 'a', plan(3), { ...ownDeps, workMode: 'invalid' }).ok, false);
});
test('parked vehicles survive first setup, block resize, and block truncating migration', () => {
  const initial = applyOpenParking(state({ machineParkingSlots: ['truck'] }), 'a', plan(), deps);
  assert.equal(initial.ok, true);
  assert.deepEqual(initial.state.fields[0].machineParkingSlots, ['truck']);
  assert.equal(applyOpenParking(initial.state, 'a', plan(2), deps).ok, false);
  assert.equal(applyOpenParking(state({ machineParkingSlots: [null, 'truck'] }), 'a', plan(), deps).ok, false);
  assert.equal(applyOpenParking(state({ evChargeSlotNos: [2] }), 'a', plan(), deps).ok, false);
  assert.equal(applyOpenParking(state({ machineParkingSlots: ['truck'] }), 'a', plan(), { ...deps, protectedCapacity: 2, openCapacity: 4 }).ok, true);
  assert.equal(applyOpenParking(state({ machineParkingSlots: [null, null, null, null, 'truck'] }), 'a', plan(3), { ...deps, protectedCapacity: 2, openCapacity: 4 }).ok, false);
});
test('actual capacity follows saved bay count and legacy saves retain automatic capacity', () => {
  assert.equal(fieldOpenParkingCapacityByPy({ py: 300 }), 4);
  const saved = JSON.parse(JSON.stringify(applyOpenParking(state(), 'a', plan(2), deps).state.fields[0]));
  assert.equal(fieldOpenParkingCapacityByPy(saved), 2);
  assert.equal(fieldTotalParkingCapacity(saved), 2);
  assert.ok(Math.abs(fieldFacilityOccupiedPy(saved) - saved.openParking.occupiedPy) < 1e-8);
});
test('drainage collision is blocked in both construction orders', () => {
  const drainage = { routes: [{ id: 'd', type: 'earth', points: metres([[0, 7], [20, 7]]) }] };
  assert.match(parkingPlanError({ trees: 0, drainage }, parkingGeometry(plan(), boundary), boundary), /배수로/);
  const field = applyOpenParking(state(), 'a', plan(), deps).state.fields[0];
  assert.equal(parkingDrainageConflict(field, drainage), true);
  assert.equal(parkingDrainageConflict(field, { routes: [] }), false);
});
test('buildings and existing trees block destructive placement', () => {
  const g = parkingGeometry(plan(), boundary);
  assert.match(parkingPlanError({ trees: 1 }, g, boundary), /나무/);
  assert.ok(parkingPlanError({}, g, boundary, [{ id: 'b', kind: 'building', points: g.parking }]));
  assert.equal(applyOpenParking(state({ py: 1 }), 'a', plan(), deps).ok, false);
});
test('parking removes trees and row segments without moving remaining tree positions', () => {
  const settings = { rootstock: 'M9', rowSpacing: 3, treeSpacing: 1, angleDeg: 0, edgeMargin: 0 };
  const full = generatePlantingPreview(boundary, settings);
  const g = parkingGeometry(plan(3), boundary);
  const reduced = generatePlantingPreview(boundary, settings, [], g.footprints);
  assert.equal(reduced.error, ''); assert.ok(reduced.treeCount < full.treeCount);
  const original = new Set(full.trees.map((p) => `${p.x}:${p.y}`));
  assert.ok(reduced.trees.every((p) => original.has(`${p.x}:${p.y}`)));
  assert.ok(reduced.trees.every((p) => !g.footprints.some((q) => polygonContainsPoint(q, p))));
});
