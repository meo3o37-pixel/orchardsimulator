import test from 'node:test';
import assert from 'node:assert/strict';
import { cadastreEditorTransform, normalizeCultivationZoneMap, validateCultivationZone } from './cultivationZones.js';

const points = (rows) => rows.map(([x, y]) => ({ x, y }));
const boundaryPoints = points([[0, 0], [10, 0], [10, 10], [0, 10]]);
const rectangle = points([[1, 1], [4, 1], [4, 4], [1, 4]]);
const validate = (polygon, zones = [], excludeId = '') => validateCultivationZone({ points: polygon, boundaryPoints, zones, excludeId });

test('accepts an internal polygon and shared parcel edges', () => {
  assert.equal(validate(rectangle), '');
  assert.equal(validate(boundaryPoints), '');
});
test('rejects crossing, repeated points, zero area and nonfinite coordinates', () => {
  for (const polygon of [points([[1, 1], [4, 4], [1, 4], [4, 1]]), [...rectangle, rectangle[0]], points([[1, 1], [2, 2], [3, 3]]), [{ x: NaN, y: 0 }, ...rectangle]]) assert.notEqual(validate(polygon), '');
});
test('rejects outside vertices and edges crossing a concave parcel', () => {
  assert.notEqual(validate(points([[-1, 1], [2, 1], [2, 2]])), '');
  const concave = points([[0, 0], [10, 0], [10, 10], [7, 10], [7, 3], [3, 3], [3, 10], [0, 10]]);
  assert.notEqual(validateCultivationZone({ boundaryPoints: concave, points: points([[1, 1], [9, 1], [9, 9], [1, 9]]) }), '');
});
test('rejects overlapping and contained zones, permits touching and editing itself', () => {
  const zones = [{ id: 'a', points: rectangle }];
  assert.notEqual(validate(points([[2, 2], [5, 2], [5, 5], [2, 5]]), zones), '');
  assert.notEqual(validate(points([[2, 2], [3, 2], [3, 3], [2, 3]]), zones), '');
  assert.equal(validate(points([[4, 1], [6, 1], [6, 4], [4, 4]]), zones), '');
  assert.equal(validate(rectangle, zones, 'a'), '');
});
test('JSON save roundtrip keeps separate field zones; old and corrupt saves remain usable', () => {
  const zone = { id: 'a', kind: 'farm', name: '첫 재배구역', points: rectangle, boundaryContourId: 'parcel-1' };
  const saved = JSON.parse(JSON.stringify({ cultivationZonesByFieldId: { 1: [zone], 2: [] } }));
  assert.deepEqual(normalizeCultivationZoneMap(saved.cultivationZonesByFieldId), saved.cultivationZonesByFieldId);
  assert.deepEqual(normalizeCultivationZoneMap(undefined), {});
  assert.deepEqual(normalizeCultivationZoneMap({ 1: [null, {}, zone, zone] })['1'], [zone]);
});
test('screen transform preserves shape and inverts drawing coordinates', () => {
  const transform = cadastreEditorTransform(points([[12, -6], [12.16, -6], [12.16, -5.9], [12, -5.9]]));
  const original = { x: 12.04, y: -5.93 };
  const result = transform.toWorld(transform.toSvg(original));
  assert.ok(Math.hypot(result.x - original.x, result.y - original.y) < 1e-12);
  const a = transform.toSvg({ x: 12, y: -6 }), b = transform.toSvg({ x: 12.16, y: -5.9 });
  assert.ok(Math.abs((b.x - a.x) / (b.y - a.y) - 1.6) < 1e-10);
});
