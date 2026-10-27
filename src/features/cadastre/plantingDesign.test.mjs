import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePlantingPreview } from './plantingDesign.js';
import { normalizePlantingSettings, plantingFieldsOf, plantingSettingsError } from './plantingSettings.js';
import { normalizeCultivationZoneMap } from './cultivationZones.js';
import { polygonContainsPoint } from './cadastreData.js';

const metres = (points) => points.map(([x, y]) => ({ x: x / 1000, y: y / 1000 }));
const rectangle = metres([[0, 0], [20, 0], [20, 10], [0, 10]]);
const settings = { rootstock: 'M9', rowSpacing: 5, treeSpacing: 5, angleDeg: 0, edgeMargin: 0 };
const distanceToBoundary = (point, polygon) => Math.min(...polygon.map((a, i) => {
  const b = polygon[(i + 1) % polygon.length];
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - a.x - t * dx, point.y - a.y - t * dy) * 1000;
}));

test('metre spacing generates exact rows and tree counts', () => {
  const result = generatePlantingPreview(rectangle, settings);
  assert.equal(result.error, '');
  assert.equal(result.treeCount, 8);
  assert.equal(result.rowCount, 2);
  assert.equal(result.usableAreaSqM, 200);
  assert.ok(Math.abs((result.trees[1].x - result.trees[0].x) * 1000 - 5) < 1e-9);
  assert.equal(generatePlantingPreview(rectangle, { ...settings, treeSpacing: 10 }).treeCount, 4);
});
test('margin applies to all edges and can remove the entire planting area', () => {
  const result = generatePlantingPreview(rectangle, { ...settings, edgeMargin: 2 });
  assert.equal(result.usableAreaSqM, 96);
  for (const point of result.trees) assert.ok(distanceToBoundary(point, rectangle) >= 2 - 0.001);
  const empty = generatePlantingPreview(rectangle, { ...settings, edgeMargin: 6 });
  assert.equal(empty.error, ''); assert.equal(empty.treeCount, 0);
});
test('angles, winding direction and map translation preserve valid placement', () => {
  for (const angleDeg of [0, 41, 90, -37, 180]) {
    const result = generatePlantingPreview(rectangle, { ...settings, angleDeg, edgeMargin: 1 });
    assert.equal(result.error, ''); assert.ok(result.treeCount > 0);
    for (const point of result.trees) {
      assert.ok(polygonContainsPoint(rectangle, point));
      assert.ok(distanceToBoundary(point, rectangle) >= 1 - 0.002);
    }
    const reverse = generatePlantingPreview([...rectangle].reverse(), { ...settings, angleDeg, edgeMargin: 1 });
    assert.equal(result.treeCount, reverse.treeCount);
    const shifted = generatePlantingPreview(rectangle.map((p) => ({ x: p.x + 27, y: p.y - 12 })), { ...settings, angleDeg, edgeMargin: 1 });
    assert.equal(result.treeCount, shifted.treeCount);
  }
});
test('concave and disconnected inset areas keep rows and trees inside with clearance', () => {
  const shapes = [
    metres([[0, 0], [20, 0], [20, 20], [14, 20], [14, 6], [6, 6], [6, 20], [0, 20]]),
    metres([[0, 0], [8, 0], [8, 3], [12, 3], [12, 0], [20, 0], [20, 8], [12, 8], [12, 5], [8, 5], [8, 8], [0, 8]])
  ];
  for (const polygon of shapes) for (const angleDeg of [0, 31, 90]) {
    const result = generatePlantingPreview(polygon, { rootstock: 'M9', rowSpacing: 3.5, treeSpacing: 1.5, angleDeg, edgeMargin: 1.5 });
    assert.equal(result.error, ''); assert.ok(result.treeCount > 0);
    for (const p of result.trees) { assert.ok(polygonContainsPoint(polygon, p)); assert.ok(distanceToBoundary(p, polygon) >= 1.5 - 0.003); }
    for (const [a, b] of result.rows) for (const t of [0.1, 0.5, 0.9]) {
      const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      assert.ok(polygonContainsPoint(polygon, p));
    }
  }
});
test('invalid and pathological settings cannot freeze the preview', () => {
  for (const patch of [{ rowSpacing: 0 }, { treeSpacing: '' }, { edgeMargin: -1 }, { angleDeg: Infinity }]) {
    assert.notEqual(plantingSettingsError({ ...settings, ...patch }), '');
    assert.notEqual(generatePlantingPreview(rectangle, { ...settings, ...patch }).error, '');
  }
  assert.notEqual(generatePlantingPreview(metres([[0, 0], [5000, 0], [5000, 5000], [0, 5000]]), { ...settings, rowSpacing: 3.5, treeSpacing: 1.5 }).error, '');
});
test('per-zone settings survive JSON save and legacy defaults do not change geometry', () => {
  const raw = { 1: [{ id: 'a', name: '후지', kind: 'farm', boundaryContourId: 'p', points: rectangle, planting: { ...settings, angleDeg: 41 } }], 2: [{ id: 'b', name: '감홍', points: rectangle }] };
  const loaded = normalizeCultivationZoneMap(JSON.parse(JSON.stringify(raw)));
  assert.deepEqual(loaded[1][0].planting, raw[1][0].planting);
  assert.equal(loaded[2][0].planting, undefined);
  assert.equal(normalizePlantingSettings(loaded[2][0].planting).rowSpacing, 3);
  assert.deepEqual(loaded[1][0].points, rectangle);
  assert.equal(normalizePlantingSettings({ edgeMargin: 0 }).edgeMargin, 0);
});

test('M9 and M26 minimums agree across input constraints, validation and generation', () => {
  for (const [rootstock, rowSpacing, treeSpacing] of [['M9', 3, 1], ['M26', 3, 1.5]]) {
    const fields = plantingFieldsOf(rootstock);
    assert.equal(fields.find((f) => f.key === 'rowSpacing').min, rowSpacing);
    assert.equal(fields.find((f) => f.key === 'treeSpacing').min, treeSpacing);
    const atLimit = { ...settings, rootstock, rowSpacing, treeSpacing };
    assert.equal(plantingSettingsError(atLimit), '');
    assert.equal(generatePlantingPreview(rectangle, atLimit).error, '');
    for (const patch of [{ rowSpacing: rowSpacing - 0.1 }, { treeSpacing: treeSpacing - 0.1 }]) {
      assert.notEqual(plantingSettingsError({ ...atLimit, ...patch }), '');
      assert.notEqual(generatePlantingPreview(rectangle, { ...atLimit, ...patch }).error, '');
    }
    assert.equal(normalizePlantingSettings({ rootstock }).rowSpacing, rowSpacing);
    assert.equal(normalizePlantingSettings({ rootstock }).treeSpacing, treeSpacing);
  }
});

test('legacy spacing is preserved and flagged rather than silently rearranged', () => {
  const old = normalizePlantingSettings({ rowSpacing: 2, treeSpacing: 1, angleDeg: 41, edgeMargin: 1 });
  assert.equal(old.rootstock, 'M9');
  assert.equal(old.rowSpacing, 2);
  assert.equal(old.treeSpacing, 1);
  assert.notEqual(plantingSettingsError(old), '');
  const zone = { id: 'm26', points: rectangle, planting: { ...settings, rootstock: 'M26', rowSpacing: 4, treeSpacing: 2 } };
  const restored = normalizeCultivationZoneMap(JSON.parse(JSON.stringify({ 1: [zone] })));
  assert.deepEqual(restored[1][0].planting, zone.planting);
  assert.notEqual(plantingSettingsError({ ...settings, rootstock: 'invalid' }), '');
});
