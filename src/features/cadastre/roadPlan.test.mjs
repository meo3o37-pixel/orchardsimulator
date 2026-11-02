import test from 'node:test';
import assert from 'node:assert/strict';
import { connectedRoadRoutes, roadPlanError } from './roadPlan.js';

const boundary = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
const entrance = { x: 0, y: 5 };
const targets = [
  { id: 'facility:a', point: { x: 3, y: 5 } },
  { id: 'facility:b', point: { x: 7, y: 5 } }
];
const access = { id: 'entrance|facility:a', startId: 'entrance', endId: 'facility:a', points: [entrance, targets[0].point] };
const between = { id: 'facility:a|facility:b', startId: 'facility:a', endId: 'facility:b', points: [targets[0].point, targets[1].point] };

test('진입점에서 건물로, 다시 다른 건물로 이어지는 도로를 저장할 수 있다', () => {
  assert.equal(roadPlanError({ entrance, routes: [access, between] }, boundary, targets), '');
});

test('진입점에서 떨어진 도로와 토지 밖 경로는 거부한다', () => {
  assert.match(roadPlanError({ entrance, routes: [between] }, boundary, targets), /진입점/);
  const outside = { ...access, points: [entrance, { x: 5, y: 12 }, targets[0].point] };
  assert.match(roadPlanError({ entrance, routes: [outside] }, boundary, targets), /토지 경계/);
});

test('간선 삭제 뒤 끊긴 연결을 함께 제거한다', () => {
  assert.deepEqual(connectedRoadRoutes([between]), []);
  assert.deepEqual(connectedRoadRoutes([access, between]), [access, between]);
});
