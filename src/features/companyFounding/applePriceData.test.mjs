import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { registerApplePriceApi } from '../../../server/applePriceApi.mjs';
import { DEFAULT_APPLE_PRICE_TABS, validateApplePriceTabs, applePriceRowInStock, editApplePriceRows } from './applePriceData.mjs';

test('existing price tables default to in stock without changing prices', () => {
  const tabs = validateApplePriceTabs(DEFAULT_APPLE_PRICE_TABS);
  assert.deepEqual(tabs[0].sections[0].rows, DEFAULT_APPLE_PRICE_TABS[0].sections[0].rows);
  assert.ok(tabs[0].sections.every(s => s.rowStock.every(Boolean)));
});
test('out-of-stock survives validation and JSON round trip', () => {
  const tabs = structuredClone(DEFAULT_APPLE_PRICE_TABS);
  tabs[0].sections[0].rowStock = tabs[0].sections[0].rows.map((_, i) => i !== 1);
  const result = validateApplePriceTabs(JSON.parse(JSON.stringify(validateApplePriceTabs(tabs))));
  assert.equal(applePriceRowInStock(result[0].sections[0], 1), false);
});
test('invalid stock types and length are rejected', () => {
  for (const stock of [[false], 'false', [true, 'false', true, true, true, true]]) {
    const tabs = structuredClone(DEFAULT_APPLE_PRICE_TABS);
    tabs[0].sections[0].rowStock = stock;
    assert.throws(() => validateApplePriceTabs(tabs), /재고/);
  }
});
test('stock follows row move, duplicate, delete and add without mutating source', () => {
  const source = { columns: ['상품', '가격'], rows: [['A', '1'], ['B', '2']], rowStock: [true, false] };
  const moved = editApplePriceRows(source, 'up', 1);
  assert.deepEqual(moved.rows, [['B', '2'], ['A', '1']]);
  assert.deepEqual(moved.rowStock, [false, true]);
  const copied = editApplePriceRows(moved, 'duplicate', 0);
  assert.deepEqual(copied.rowStock, [false, false, true]);
  assert.notEqual(copied.rows[0], copied.rows[1]);
  const removed = editApplePriceRows(copied, 'delete', 0);
  assert.deepEqual(removed.rowStock, [false, true]);
  assert.deepEqual(editApplePriceRows(removed, 'add').rowStock, [false, true, true]);
  assert.deepEqual(editApplePriceRows(moved, 'down', 0), source);
  assert.deepEqual(source.rowStock, [true, false]);
  assert.equal(editApplePriceRows(source, 'up', 0), source);
});

test('owner can save stock and public GET reads it; unauthorized writes remain blocked', async () => {
  let handler;
  let store = { revision: 0, tabs: structuredClone(DEFAULT_APPLE_PRICE_TABS) };
  registerApplePriceApi({ middlewares: { use(fn) { handler = fn; } } }, {
    readJsonFile: async () => structuredClone(store),
    writeJsonFile: async (file, value) => { if (!file.endsWith('.previous')) store = structuredClone(value); },
    getSessionFromRequest: req => req.headers.authorization ? { username: req.headers.authorization } : null,
    readCompanyRoomData: async () => ({}),
    isCompanyRoomMemberSession: () => true,
    isCompanyRoomOwnerSession: session => session.username === 'owner'
  });
  const request = async (method, payload, user) => {
    const req = Readable.from(payload ? [Buffer.from(JSON.stringify(payload))] : []);
    Object.assign(req, { method, url: '/__apple-price-board', headers: { authorization: user } });
    let result;
    const res = { setHeader() {}, end(body) { result = { status: this.statusCode, ...JSON.parse(body) }; } };
    await handler(req, res, () => assert.fail('Unexpected route fallthrough'));
    return result;
  };
  const tabs = validateApplePriceTabs(store.tabs);
  tabs[0].sections[0].rowStock[0] = false;
  assert.equal((await request('POST', { revision: 0, tabs })).status, 401);
  assert.equal((await request('POST', { revision: 0, tabs }, 'member')).status, 403);
  assert.equal((await request('POST', { revision: 0, tabs }, 'owner')).status, 200);
  const published = await request('GET');
  assert.equal(published.revision, 1);
  assert.equal(published.tabs[0].sections[0].rowStock[0], false);
  assert.deepEqual(published.tabs[0].sections[0].rows, DEFAULT_APPLE_PRICE_TABS[0].sections[0].rows);
  assert.equal((await request('POST', { revision: 0, tabs }, 'owner')).status, 409);
});
