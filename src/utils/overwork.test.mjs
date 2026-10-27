import test from 'node:test';
import assert from 'node:assert/strict';
import { selfLaborAvailable, overworkOf, overworkPenalty, evaluateLaborTransition, normalizeOverworkGame, createLaborStateController } from './overwork.js';
import { applyDrainageAction, drainageWorkQuote } from '../features/cadastre/drainage.js';
const game = (labor = 0) => ({ day: 1, labor, money: 2000000, inventory: { apple: 3 }, fields: [], logs: [] });
const spend = (g, cost) => evaluateLaborTransition(g, { ...g, labor: g.labor - cost });

test('allows exactly -10; rejects greater spend atomically', () => {
  assert.equal(selfLaborAvailable(game(3)), 13);
  const result = spend(game(3), 13);
  assert.equal(result.ok, true);
  assert.equal(result.state.labor, -10);
  assert.equal(result.state.laborOverwork.used, 10);
  assert.equal(selfLaborAvailable(result.state), 0);
  assert.equal(spend(result.state, .1).ok, false);
  assert.equal(spend(game(3), 13.1).ok, false);
  assert.equal(spend(game(0), 0).extra, 0);
});

test('decimal thresholds and next-day debt plus fatigue agree with proposal', () => {
  for (const [debt, fatigue] of [[0,0],[.1,1],[3,1],[3.01,3],[7,3],[7.01,5],[10,5]]) {
    assert.equal(overworkPenalty(debt).fatigue, fatigue);
  }
  const worked = spend(game(0), 10).state;
  const next = evaluateLaborTransition(worked, { ...worked, day: 2, labor: 100 });
  assert.equal(next.state.labor, 85);
  assert.equal(next.state.laborOverwork.used, 0);
  assert.equal(next.settlement.total, 15);
  assert.equal(evaluateLaborTransition(next.state, { ...next.state, labor: 85 }).state.labor, 85);
  assert.equal(evaluateLaborTransition(next.state, { ...next.state, day: 3, labor: 100 }).state.labor, 100);
});

test('meal and night recovery cannot reset cumulative daily borrowing', () => {
  let state = spend(game(), 7).state;
  state = evaluateLaborTransition(state, { ...state, labor: 5 }).state;
  assert.equal(selfLaborAvailable(state), 8);
  state = spend(state, 8).state;
  assert.equal(state.labor, -3);
  assert.equal(state.laborOverwork.used, 10);
  state = evaluateLaborTransition(state, { ...state, timeOfDay: 'night', labor: 30 }).state;
  assert.equal(selfLaborAvailable(state), 30);
  assert.equal(spend(state, 30.1).ok, false);
  assert.equal(spend(state, 30).ok, true);
  assert.equal(evaluateLaborTransition(state, { ...state, day: 2, labor: 100 }).state.labor, 85);
});

test('save/load preserves used quota, legacy negatives and fallback remain bounded', () => {
  const used = spend(game(), 8).state;
  const recovered = evaluateLaborTransition(used, { ...used, labor: 4 }).state;
  const loaded = normalizeOverworkGame(JSON.parse(JSON.stringify(recovered)));
  assert.equal(selfLaborAvailable(loaded), 6);
  assert.deepEqual(overworkOf(loaded), { day: 1, used: 8 });
  assert.equal(overworkOf(game(-5)).used, 5);
  assert.equal(selfLaborAvailable(normalizeOverworkGame(game(-50))), 0);
  assert.equal(selfLaborAvailable(null), 0);
});

test('confirmation is before commit; cancelling preserves all resources and confirms again on retry', () => {
  const initial = game(2), messages = [];
  let accept = false, commits = 0;
  const controller = createLaborStateController(initial, { confirm: (text) => { messages.push(text); return accept; }, commit: () => commits++ });
  const action = (prev) => ({ ...prev, labor: prev.labor - 5, money: prev.money - 100, inventory: { apple: 2 }, fields: [{ id: 1 }], logs: ['work'] });
  const snapshot = JSON.stringify(controller.get());
  assert.equal(controller.update(action), false);
  assert.equal(JSON.stringify(controller.get()), snapshot);
  assert.equal(commits, 0);
  assert.match(messages[0], /노동력 -3.0/);
  assert.match(messages[0], /다음 날 노동력 차감 4.0/);
  accept = true;
  assert.equal(controller.update(action), true);
  assert.equal(controller.get().labor, -3);
  assert.equal(controller.get().inventory.apple, 2);
  assert.equal(messages.length, 2);
  assert.equal(controller.update((prev) => ({ ...prev, labor: prev.labor - 8 })), false);
  assert.equal(controller.get().labor, -3);
});

test('controller uses latest state for consecutive setters and replace does not charge a loaded save', () => {
  const controller = createLaborStateController(game(3), { confirm: () => true });
  controller.update((prev) => ({ ...prev, labor: prev.labor - 5 }));
  controller.update((prev) => ({ ...prev, labor: prev.labor - 2 }));
  assert.equal(controller.get().labor, -4);
  assert.equal(controller.get().laborOverwork.used, 4);
  const loaded = { ...controller.get(), day: 20, laborOverwork: { day: 20, used: 4 } };
  controller.replace(JSON.parse(JSON.stringify(loaded)));
  assert.equal(controller.get().labor, -4);
  controller.update((prev) => ({ ...prev, day: 21, labor: 100 }));
  assert.equal(controller.get().labor, 93);
});

test('own excavator can use 50m at zero labor; quota and fuel constrain repeated work', () => {
  const p = (x,y) => ({ x:x/1000, y:y/1000 });
  const boundary = [p(0,0),p(60,0),p(60,100),p(0,100)];
  const drainage = { version:1, bearing:90, boundary, routes:[{ id:'r', type:'earth', points:[p(30,0),p(30,102)], work:0 }] };
  const state = { ...game(), inventory:{digger:1}, fields:[{ id:0, owned:true, py:600, trees:0, slopeBearing:90, drainage, machineParkingSlots:['digger-1'] }] };
  const deps = { machine:{id:'digger-1', machineKey:'digger',unitNo:1,item:{}}, excavatorKeys:new Set(['digger']), fuel:100, durability:100 };
  assert.equal(drainageWorkQuote(drainage,'excavator',1,0,100).length,50);
  const controller = createLaborStateController(state, { confirm:()=>true });
  const apply = (mode) => controller.update((prev) => { const result=applyDrainageAction(prev,0,{kind:'work',mode},deps); return result.ok?result.state:prev; });
  assert.equal(apply('excavator'),true);
  assert.equal(controller.get().labor,-10);
  assert.equal(controller.get().fields[0].drainage.routes[0].work,50);
  assert.equal(apply('excavator'),false);
  assert.equal(apply('contractor'),true);
  assert.equal(controller.get().labor,-10);
  assert.equal(controller.get().laborOverwork.used,10);
});

test('missing day and ledger remain safe for legacy construction states', () => {
  assert.deepEqual(overworkOf({ labor: 100 }), { day: undefined, used: 0 });
  assert.equal(selfLaborAvailable({ labor: 100 }), 110);
  assert.equal(selfLaborAvailable({ labor: 0 }), 10);
});
