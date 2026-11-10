import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCadastreForField, polygonAreaPyFromPoints, polygonContainsPoint } from './cadastreData.js';

const outline = [{ x: 0, y: 0 }, { x: .22, y: 0 }, { x: .22, y: .22 }, { x: 0, y: .22 }];
const markerPoint = { x: .1, y: .1 };
const contours = [{ id: 'parcel', points: outline }];
const build = (selectedField, zones = []) => buildCadastreForField({ selectedField, markerPoint, contours, zones });

test('a new parcel uses its registered area for the boundary geometry', () => {
  const cadastre = build({ id: 'field', py: 473 });
  assert.equal(cadastre.boundaryCalibrated, true);
  assert.equal(cadastre.boundaryAreaPy, 473);
  assert.ok(Math.abs(polygonAreaPyFromPoints(cadastre.boundaryPoints) - 473) < .01);
  assert.ok(polygonContainsPoint(cadastre.boundaryPoints, markerPoint));
  assert.ok(cadastre.outlineAreaPy > 14000);
});

test('a calibrated parcel keeps the same geometry after a zone is saved', () => {
  const initial = build({ id: 'field', py: 473 });
  const saved = build({ id: 'field', py: 473, cadastreMetricBoundary: true }, [{ id: 'zone' }]);
  assert.deepEqual(saved.boundaryPoints, initial.boundaryPoints);
});

test('legacy designs retain their original coordinates', () => {
  const cadastre = build({ id: 'field', py: 473 }, [{ id: 'old-zone' }]);
  assert.equal(cadastre.boundaryCalibrated, false);
  assert.deepEqual(cadastre.boundaryPoints, outline);
});
