import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSlopeBearing, slopeBearingOf, slopeBearingLabel } from './terrain.js';
import { createLandPool } from '../config/game/land.js';
import { applyDrainageAction } from '../features/cadastre/drainage.js';

test('random terrain covers all eight directions and stays fixed per land and save', () => {
  const pool = createLandPool(), counts = new Map();
  for (const land of pool) {
    const bearing = slopeBearingOf(land);
    assert.equal(bearing, generateSlopeBearing(land.id));
    assert.equal(slopeBearingOf(JSON.parse(JSON.stringify(land))), bearing);
    assert.equal(bearing % 45, 0);
    assert.ok(bearing >= 0 && bearing < 360);
    counts.set(bearing, (counts.get(bearing) || 0) + 1);
  }
  assert.equal(counts.size, 8);
  assert.ok([...counts.values()].every((n) => n > 40 && n < 150));
  assert.match(slopeBearingLabel(270), /북쪽/);
});

test('legacy migration preserves existing route direction and rejects corrupt terrain', () => {
  const old = { id: 0, drainage: { version: 1, bearing: 135, routes: [{ work: 20 }] } };
  assert.equal(slopeBearingOf(old), 135);
  assert.equal(slopeBearingOf({ ...old, slopeBearing: 45 }), 45);
  for (const value of [null, undefined, NaN, Infinity, -1, 360, '90']) {
    assert.equal(slopeBearingOf({ id: 0, slopeBearing: value }), generateSlopeBearing(0));
  }
  assert.equal(slopeBearingOf({ id: 0, drainage: { version: 1, bearing: 135, routes: [] } }), generateSlopeBearing(0));
});

test('editor cannot choose a convenient downhill direction for save or construction', () => {
  const p = (x, y) => ({ x: x / 1000, y: y / 1000 });
  const boundary = [p(0,0),p(30,0),p(30,30),p(0,30)];
  const plan = { version: 1, bearing: 90, boundary, routes: [{ id: 'r', type: 'earth', points: [p(15,0),p(15,32)], work: 0 }] };
  const state = { day: 1, money: 2000000, labor: 100, fields: [{ id: 0, owned: true, py: 300, trees: 0, slopeBearing: 90 }] };
  const bad = applyDrainageAction(state, 0, { kind: 'save', plan: { ...plan, bearing: 0 } }, { boundary });
  assert.equal(bad.ok, false);
  assert.match(bad.message, /경사 방향/);
  const saved = applyDrainageAction(state, 0, { kind: 'save', plan }, { boundary });
  assert.equal(saved.ok, true);
  const tampered = { ...saved.state, fields: saved.state.fields.map((field) => ({ ...field, slopeBearing: 180 })) };
  assert.equal(applyDrainageAction(tampered, 0, { kind: 'work', mode: 'contractor' }).ok, false);
  assert.equal(applyDrainageAction(saved.state, 0, { kind: 'work', mode: 'contractor' }).ok, true);
});
