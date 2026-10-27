import test from 'node:test';
import assert from 'node:assert/strict';
import { SOIL_TYPES, generateSoilComposition, normalizeSoilComposition, soilProfileOf, soilDailyWaterLoss } from './soil.js';
import { createLandPool } from '../config/game/land.js';
import { applyDailyDrainage, drainageRequirement } from '../features/cadastre/drainage.js';

const pure = (key) => Object.fromEntries(SOIL_TYPES.map((type) => [type.key, type.key === key ? 100 : 0]));
test('land composition is deterministic, diverse, integer and sums to 100', () => {
  const pool = createLandPool();
  assert.ok(pool.length > 500);
  const dominantCounts = Object.fromEntries(SOIL_TYPES.map((type) => [type.name, 0]));
  for (const land of pool) {
    assert.deepEqual(land.soilComposition, generateSoilComposition(land.id));
    assert.equal(Object.values(land.soilComposition).reduce((a, b) => a + b, 0), 100);
    assert.ok(Object.values(land.soilComposition).every((v) => Number.isInteger(v) && v >= 0 && v <= 100));
    dominantCounts[soilProfileOf(land).dominant]++;
  }
  assert.ok(new Set(pool.map((land) => JSON.stringify(land.soilComposition))).size > pool.length * .9);
  assert.ok(Object.values(dominantCounts).every((n) => n > 15));
});

test('save round trips preserve composition, legacy fallback and repairs stay stable', () => {
  for (let id = 0; id < 500; id++) {
    const original = generateSoilComposition(id);
    assert.deepEqual(normalizeSoilComposition(JSON.parse(JSON.stringify(original)), id), original);
    assert.deepEqual(normalizeSoilComposition(undefined, id), original);
    assert.deepEqual(normalizeSoilComposition({ sand: -1 }, id), original);
  }
  const repaired = normalizeSoilComposition({ sand: 3, sandyLoam: 3, loam: 3, clayLoam: 3, clay: 3 }, 0);
  assert.equal(Object.values(repaired).reduce((a, b) => a + b, 0), 100);
  assert.deepEqual(normalizeSoilComposition(repaired, 0), repaired);
});

const nextWater = (field, rain = 0, day = 1) => applyDailyDrainage(field, Math.max(0, field.water - soilDailyWaterLoss(field, .72)) + rain, rain, day).water;
test('sand trades fast wet-weather drainage for more dry-weather irrigation', () => {
  const sand = { soilComposition: pure('sand'), water: 95 };
  const clay = { soilComposition: pure('clay'), water: 95 };
  assert.ok(nextWater(sand, 5.2) < nextWater(clay, 5.2));
  const simulate = (field) => {
    let current = { ...field, water: 40 };
    for (let day = 1; day <= 20; day++) current = { ...current, water: nextWater(current, 0, day) };
    return current.water;
  };
  assert.ok(simulate(sand) < simulate(clay));
  assert.ok(simulate(sand) > 15); // Drying is gradual, not an immediate death penalty.
  assert.equal(soilDailyWaterLoss({ water: 95 }, .72), .72);
  assert.equal(soilDailyWaterLoss({ ...sand, water: 60 }, .72), .72 * 1.35);
});

test('completed channels respect texture, excess-water floor and legacy behavior', () => {
  const p = (x, y) => ({ x: x / 1000, y: y / 1000 });
  const drainage = { version: 1, bearing: 90, boundary: [p(0,0),p(30,0),p(30,30),p(0,30)], routes: [{ id: 'r', type: 'earth', points: [p(15,0),p(15,32)], work: 32 }] };
  const field = { py: 300, drainage };
  const sand = { ...field, soilComposition: pure('sand') };
  const clay = { ...field, soilComposition: pure('clay') };
  assert.ok(applyDailyDrainage(sand, 95, 0, 1).water < applyDailyDrainage(clay, 95, 0, 1).water);
  assert.equal(applyDailyDrainage(sand, 76, 0, 1).water, 75);
  assert.equal(applyDailyDrainage(sand, 60, 0, 1).water, 60);
  assert.equal(applyDailyDrainage(field, 95, 0, 1).water, 92);
  assert.deepEqual(drainageRequirement(300), { length: 30, outlets: 1 });
  const first = applyDailyDrainage(sand, 95, 0, 1);
  assert.equal(applyDailyDrainage({ ...sand, drainage: first.drainage }, 95, 0, 1).water, first.water);
});
