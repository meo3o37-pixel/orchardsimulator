import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FIELD_MAP_300_INSTALLABLE_FACILITIES,
  FIELD_MAP_300_INSTALLABLE_BY_KEY
} from './installableFacilities';
import {
  FIELD_MAP_300_FACILITY_IMAGE_URLS,
  fieldMap300TreeImageKeyForAge,
  resolveFieldMap300ImageUrl
} from './facilityImageAssets';
import FIELD_MAP_300_SAVED_PRESET from './fieldMap300SavedPreset.json';
import './fieldMap300Map.css';

const GRID_COLS = 54;
const GRID_ROWS = 50;
const DEFAULT_ZOOM = 5.2;
const MIN_ZOOM = 1.2;
const MAX_ZOOM = 10;
const ZOOM_SENSITIVITY = 0.0016;
const STAGE_PADDING = 52;
const DRAG_THRESHOLD = 8;
const TREE_TUNING_OFFSET_X_LIMIT = 240;
const TREE_TUNING_OFFSET_Y_LIMIT = 400;
const FACILITY_TUNING_OFFSET_Y_LIMIT = 2000;
const FACILITY_TUNING_OFFSET_Y_SLIDER_LIMIT = 400;
const TREE_TUNING_SCALE_MIN = 0.25;
const TREE_TUNING_SCALE_MAX = 4.5;
const FACILITY_TUNING_SCALE_MAX = 12;
const TREE_TUNING_ROTATION_LIMIT = 360;
const TREE_TUNING_DEFAULTS = Object.freeze({
  offsetX: 0,
  offsetY: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 1,
  flipX: false,
  flipY: false
});
const TREE_TUNING_KEYS = Object.freeze([
  'treePainterAge1',
  'treePainterAge2',
  'treePainterAge3',
  'treePainterAge4',
  'treePainterAge5',
  'treePainterAge6'
]);
const WINTER_TREE_TUNING_KEY_MAP = Object.freeze({
  treePainterAge1Winter: 'treePainterAge1',
  treePainterAge2Winter: 'treePainterAge2',
  treePainterAge3Winter: 'treePainterAge3',
  treePainterAge4Winter: 'treePainterAge4',
  treePainterAge5Winter: 'treePainterAge5',
  treePainterAge6Winter: 'treePainterAge6'
});
const TUNABLE_ITEM_KEYS = Object.freeze(
  FIELD_MAP_300_INSTALLABLE_FACILITIES
    .map((facility) => String(facility.key))
);

const CELL_TYPES = Object.freeze({
  ORCHARD: 'orchard',
  SUMMER_GROUND: 'summer-ground',
  WINTER_GROUND: 'winter-ground',
  TREE: 'tree',
  FACILITY: 'facility',
  SHED: 'shed',
  WATER: 'water',
  WELL: 'well',
  APRON: 'apron'
});

const TREE_AGES = new Set([1, 2, 3, 4, 5, 6]);

function isGroundCellType(type) {
  return type === CELL_TYPES.ORCHARD
    || type === CELL_TYPES.SUMMER_GROUND
    || type === CELL_TYPES.WINTER_GROUND;
}

function clampTreeAge(value) {
  const age = Number(value);
  if (!Number.isFinite(age)) return 1;
  return Math.max(1, Math.min(6, Math.round(age)));
}

function treeAgeClassOf(value, prefix) {
  const safeAge = TREE_AGES.has(Number(value)) ? Number(value) : 1;
  return `${prefix}-${safeAge}`;
}

function previewImageKeyForTreeAge(value, tone = 'summer') {
  return fieldMap300TreeImageKeyForAge(clampTreeAge(value), tone);
}

function previewToneForTreeFacilityKey(facilityKey = '') {
  return String(facilityKey || '').endsWith('Winter') ? 'winter' : 'summer';
}

function previewToneForTreeCell(cell) {
  if (cell?.facilityKey) return previewToneForTreeFacilityKey(cell.facilityKey);
  return cell?.baseType === CELL_TYPES.WINTER_GROUND ? 'winter' : 'summer';
}

function isTunableFacility(facility) {
  return Boolean(facility?.key) && facility?.placementMode !== 'paint-ground-area-random';
}

function isRandomGroundAreaFacility(facility) {
  return String(facility?.placementMode || '') === 'paint-ground-area-random';
}

function getTreeAgeLabel(value) {
  return `${clampTreeAge(value)}년생`;
}

function getCanonicalTuningFacilityKey(facilityKey = '') {
  const safeKey = String(facilityKey || '');
  return WINTER_TREE_TUNING_KEY_MAP[safeKey] || safeKey;
}

function isTreeTuningKey(facilityKey) {
  return TREE_TUNING_KEYS.includes(getCanonicalTuningFacilityKey(facilityKey));
}

function getTreeTuningOffsetLimit(key, facilityKey = '') {
  if (key !== 'offsetY') return TREE_TUNING_OFFSET_X_LIMIT;
  return isTreeTuningKey(facilityKey) ? TREE_TUNING_OFFSET_Y_LIMIT : FACILITY_TUNING_OFFSET_Y_LIMIT;
}

function getTreeTuningScaleMax(facilityKey = '') {
  return isTreeTuningKey(facilityKey) ? TREE_TUNING_SCALE_MAX : FACILITY_TUNING_SCALE_MAX;
}

function clampTreeTuningValue(key, value, facilityKey = '') {
  if (key === 'flipX' || key === 'flipY') return Boolean(value);
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return TREE_TUNING_DEFAULTS[key];
  if (key === 'offsetX' || key === 'offsetY') {
    const limit = getTreeTuningOffsetLimit(key, facilityKey);
    return Math.max(-limit, Math.min(limit, numeric));
  }
  if (key === 'scaleX' || key === 'scaleY') {
    const scaleMax = getTreeTuningScaleMax(facilityKey);
    return Math.max(TREE_TUNING_SCALE_MIN, Math.min(scaleMax, numeric));
  }
  if (key === 'rotation') return Math.max(-TREE_TUNING_ROTATION_LIMIT, Math.min(TREE_TUNING_ROTATION_LIMIT, numeric));
  if (key === 'opacity') return Math.max(0.15, Math.min(1, numeric));
  return numeric;
}

function normalizeItemTransform(raw, facilityKey = '') {
  return {
    offsetX: clampTreeTuningValue('offsetX', raw?.offsetX, facilityKey),
    offsetY: clampTreeTuningValue('offsetY', raw?.offsetY, facilityKey),
    scaleX: clampTreeTuningValue('scaleX', raw?.scaleX, facilityKey),
    scaleY: clampTreeTuningValue('scaleY', raw?.scaleY, facilityKey),
    rotation: clampTreeTuningValue('rotation', raw?.rotation, facilityKey),
    opacity: clampTreeTuningValue('opacity', raw?.opacity, facilityKey),
    flipX: clampTreeTuningValue('flipX', raw?.flipX),
    flipY: clampTreeTuningValue('flipY', raw?.flipY)
  };
}

function createDefaultSelectedPixelPreview() {
  return {
    title: '픽셀 미선택',
    meta: '지도의 셀을 클릭해 확인',
    hint: '같은 셀을 다시 누르면 선택이 해제됩니다.',
    previewType: CELL_TYPES.ORCHARD,
    previewTone: 'summer',
    previewSkin: 'summer',
    previewImageKey: '',
    treeAge: null,
    facilityKey: ''
  };
}

function cloneMapData(mapData) {
  return {
    ...mapData,
    cells: mapData.cells.map((row) => row.map((cell) => ({ ...cell }))),
    treePositions: mapData.treePositions.map(([x, y]) => [x, y]),
    orchardBounds: mapData.orchardBounds ? { ...mapData.orchardBounds } : null,
    utilityBounds: mapData.utilityBounds ? { ...mapData.utilityBounds } : null,
    defaultGroundFacilityKey: String(mapData.defaultGroundFacilityKey || ''),
    defaultGroundVariantKeys: Array.isArray(mapData.defaultGroundVariantKeys)
      ? mapData.defaultGroundVariantKeys.map((key) => String(key || '')).filter(Boolean)
      : []
  };
}

function createBaseMapData(defaultGroundFacilityKey = '', defaultGroundVariantKeys = []) {
  const cells = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => ({
      type: CELL_TYPES.SUMMER_GROUND,
      baseType: CELL_TYPES.SUMMER_GROUND,
      treeAge: null,
      groundFacilityKey: null,
      groundInstanceId: null,
      facilityKey: null,
      facilityInstanceId: null
    }))
  );

  return {
    cells,
    treePositions: [],
    orchardBounds: { x1: 1, y1: 1, x2: GRID_COLS - 2, y2: GRID_ROWS - 2 },
    utilityBounds: null,
    defaultGroundFacilityKey: String(defaultGroundFacilityKey || ''),
    defaultGroundVariantKeys: Array.isArray(defaultGroundVariantKeys)
      ? defaultGroundVariantKeys.map((key) => String(key || '')).filter(Boolean)
      : []
  };
}

function resolveDefaultGroundFacilityKeyForCell(mapData, x, y) {
  const variantKeys = Array.isArray(mapData?.defaultGroundVariantKeys)
    ? mapData.defaultGroundVariantKeys.map((key) => String(key || '')).filter(Boolean)
    : [];
  if (variantKeys.length) {
    const hash = Math.abs(((x + 1) * 92821) ^ ((y + 1) * 68917) ^ ((x + 3) * (y + 5) * 131));
    return variantKeys[hash % variantKeys.length] || '';
  }
  return String(mapData?.defaultGroundFacilityKey || '');
}

function createInitialMapData() {
  const base = createBaseMapData();
  const cells = base.cells;
  const treePositions = [];
  const blockWidth = 3;
  const blockHeight = 2;
  const preferredOffsets = [
    [1, 1],
    [1, 0],
    [0, 1],
    [0, 0]
  ];

  for (let blockY = 0; blockY < GRID_ROWS; blockY += blockHeight) {
    for (let blockX = 0; blockX < GRID_COLS; blockX += blockWidth) {
      const candidates = preferredOffsets
        .map(([offsetX, offsetY]) => [blockX + offsetX, blockY + offsetY])
        .filter(([x, y]) =>
          x > 0
          && y > 0
          && x < GRID_COLS - 1
          && y < GRID_ROWS - 1
          && cells[y]?.[x]
          && isGroundCellType(cells[y][x].type)
        );
      const chosen = candidates[0];
      if (!chosen) continue;
      treePositions.push(chosen);
    }
  }

  treePositions.forEach(([x, y]) => {
    const bandRatio = GRID_ROWS <= 1 ? 0 : (y / (GRID_ROWS - 1));
    const treeAge = clampTreeAge(Math.floor(bandRatio * 6) + 1);
    cells[y][x].type = CELL_TYPES.TREE;
    cells[y][x].treeAge = treeAge;
  });

  return {
    cells,
    treePositions,
    orchardBounds: base.orchardBounds,
    utilityBounds: base.utilityBounds
  };
}

function normalizeTreeTuningByKey(raw) {
  return Object.fromEntries(
    TUNABLE_ITEM_KEYS.map((key) => {
      const canonicalKey = getCanonicalTuningFacilityKey(key);
      const entry = raw && typeof raw === 'object'
        ? (raw[key] ?? raw[canonicalKey] ?? null)
        : null;
      return [key, normalizeItemTransform(entry, canonicalKey)];
    })
  );
}

function isDefaultItemTransform(transform) {
  const normalized = normalizeItemTransform(transform);
  return normalized.offsetX === TREE_TUNING_DEFAULTS.offsetX
    && normalized.offsetY === TREE_TUNING_DEFAULTS.offsetY
    && normalized.scaleX === TREE_TUNING_DEFAULTS.scaleX
    && normalized.scaleY === TREE_TUNING_DEFAULTS.scaleY
    && normalized.rotation === TREE_TUNING_DEFAULTS.rotation
    && normalized.opacity === TREE_TUNING_DEFAULTS.opacity
    && normalized.flipX === TREE_TUNING_DEFAULTS.flipX
    && normalized.flipY === TREE_TUNING_DEFAULTS.flipY;
}

function hydrateItemTuningByKeyFromObjects(baseTuningByKey, objects) {
  const nextTuningByKey = normalizeTreeTuningByKey(baseTuningByKey);
  const objectList = Array.isArray(objects) ? objects : [];

  objectList.forEach((entry) => {
    const facilityKey = String(entry?.facilityKey || '');
    const canonicalKey = getCanonicalTuningFacilityKey(facilityKey);
    if (!facilityKey || !TUNABLE_ITEM_KEYS.includes(facilityKey)) return;
    if (!entry?.transform || typeof entry.transform !== 'object') return;
    if (!isDefaultItemTransform(nextTuningByKey[canonicalKey])) return;
    const normalized = normalizeItemTransform(entry.transform, canonicalKey);
    nextTuningByKey[canonicalKey] = normalized;
    TUNABLE_ITEM_KEYS.forEach((key) => {
      if (getCanonicalTuningFacilityKey(key) === canonicalKey) {
        nextTuningByKey[key] = normalized;
      }
    });
  });

  return nextTuningByKey;
}

function pickTreeOnlyTuningByKey(raw) {
  const normalized = normalizeTreeTuningByKey(raw);
  return Object.fromEntries(
    TREE_TUNING_KEYS.map((key) => [key, normalized[key] || { ...TREE_TUNING_DEFAULTS }])
  );
}

function createObjectTransformById(rawObjects, itemTuningByKey) {
  const objectTransformById = {};
  const objects = Array.isArray(rawObjects) ? rawObjects : [];
  objects.forEach((entry) => {
    const objectId = String(entry?.id || '');
    if (!objectId) return;
    const canonicalKey = getCanonicalTuningFacilityKey(entry?.facilityKey);
    const fallbackByKey = canonicalKey ? itemTuningByKey?.[canonicalKey] : null;
    objectTransformById[objectId] = normalizeItemTransform(entry?.transform || fallbackByKey, canonicalKey);
  });
  return objectTransformById;
}

function resolveObjectTransform({ objectId, facilityKey, objectTransformById, itemTuningByKey }) {
  const byId = objectId ? objectTransformById?.[String(objectId)] : null;
  if (byId) return byId;
  const canonicalKey = getCanonicalTuningFacilityKey(facilityKey);
  const byKey = canonicalKey ? itemTuningByKey?.[canonicalKey] : null;
  return normalizeItemTransform(byKey, canonicalKey);
}

function getTreeTuningDisplayValue(actual, baseline, key) {
  const actualValue = actual?.[key];
  const baselineValue = baseline?.[key];
  if (key === 'flipX' || key === 'flipY') return Boolean(actualValue);
  if (key === 'scaleX' || key === 'scaleY' || key === 'opacity') {
    const safeActual = Number.isFinite(Number(actualValue)) ? Number(actualValue) : TREE_TUNING_DEFAULTS[key];
    const safeBaseline = Number.isFinite(Number(baselineValue)) ? Number(baselineValue) : TREE_TUNING_DEFAULTS[key];
    const divisor = Math.abs(safeBaseline) > 0.0001 ? safeBaseline : TREE_TUNING_DEFAULTS[key];
    return safeActual / divisor;
  }
  const safeActual = Number.isFinite(Number(actualValue)) ? Number(actualValue) : TREE_TUNING_DEFAULTS[key];
  const safeBaseline = Number.isFinite(Number(baselineValue)) ? Number(baselineValue) : TREE_TUNING_DEFAULTS[key];
  return safeActual - safeBaseline;
}

function applyTreeTuningDisplayValue(baseline, key, rawValue, facilityKey = '') {
  if (key === 'flipX' || key === 'flipY') return Boolean(rawValue);
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) return clampTreeTuningValue(key, baseline?.[key], facilityKey);
  if (key === 'scaleX' || key === 'scaleY' || key === 'opacity') {
    const safeBaseline = Number.isFinite(Number(baseline?.[key])) ? Number(baseline[key]) : TREE_TUNING_DEFAULTS[key];
    return clampTreeTuningValue(key, safeBaseline * numeric, facilityKey);
  }
  const safeBaseline = Number.isFinite(Number(baseline?.[key])) ? Number(baseline[key]) : TREE_TUNING_DEFAULTS[key];
  return clampTreeTuningValue(key, safeBaseline + numeric, facilityKey);
}

function getDisplayControlBounds(baseline, key, facilityKey = '') {
  const safeBaseline = Number.isFinite(Number(baseline?.[key])) ? Number(baseline[key]) : TREE_TUNING_DEFAULTS[key];
  if (key === 'offsetX') {
    const limit = getTreeTuningOffsetLimit(key, facilityKey);
    const distance = limit + Math.abs(safeBaseline);
    return {
      min: -distance,
      max: distance
    };
  }
  if (key === 'offsetY') {
    const distance = isTreeTuningKey(facilityKey)
      ? TREE_TUNING_OFFSET_Y_LIMIT + Math.abs(safeBaseline)
      : FACILITY_TUNING_OFFSET_Y_SLIDER_LIMIT;
    return {
      min: -distance,
      max: distance
    };
  }
  if (key === 'rotation') {
    const distance = TREE_TUNING_ROTATION_LIMIT + Math.abs(safeBaseline);
    return { min: -distance, max: distance };
  }
  if (key === 'scaleX' || key === 'scaleY') {
    const divisor = Math.abs(safeBaseline) > 0.0001 ? safeBaseline : 1;
    const lower = TREE_TUNING_SCALE_MIN / divisor;
    const upper = getTreeTuningScaleMax(facilityKey) / divisor;
    const distance = Math.max(Math.abs(1 - lower), Math.abs(upper - 1));
    return { min: 1 - distance, max: 1 + distance };
  }
  if (key === 'opacity') {
    const divisor = Math.abs(safeBaseline) > 0.0001 ? safeBaseline : 1;
    const lower = 0.15 / divisor;
    const upper = 1 / divisor;
    const distance = Math.max(Math.abs(1 - lower), Math.abs(upper - 1));
    return { min: 1 - distance, max: 1 + distance };
  }
  return { min: 0, max: 0 };
}

function buildFieldMap300StateSnapshot({ mapData, facilityInstanceSeed, treeTuningByKey, objectTransformById }) {
  const groundObjects = [];
  const treeObjects = [];
  const facilityObjects = [];
  let objectSeq = 1;

  for (let y = 0; y < GRID_ROWS; y += 1) {
    for (let x = 0; x < GRID_COLS; x += 1) {
      const cell = mapData?.cells?.[y]?.[x];
      if (!cell) continue;

      if (cell.type === CELL_TYPES.TREE) {
        const treeAge = clampTreeAge(cell.treeAge);
        treeObjects.push({
          id: String(cell.facilityInstanceId || `tree-${objectSeq++}`),
          kind: 'tree',
          facilityKey: String(cell.facilityKey || `treePainterAge${treeAge}`),
          x,
          y,
          treeAge,
          transform: resolveObjectTransform({
            objectId: cell.facilityInstanceId,
            facilityKey: cell.facilityKey || `treePainterAge${treeAge}`,
            objectTransformById,
            itemTuningByKey: treeTuningByKey
          })
        });
        continue;
      }

      const groundFacility = cell?.groundFacilityKey ? FIELD_MAP_300_INSTALLABLE_BY_KEY[cell.groundFacilityKey] : null;
      if (groundFacility?.placementMode === 'paint-ground') {
        groundObjects.push({
          id: String(cell.groundInstanceId || `ground-${objectSeq++}`),
          kind: 'ground',
          facilityKey: groundFacility.key,
          x,
          y,
          type: String(cell.baseType || groundFacility.type || CELL_TYPES.SUMMER_GROUND),
          transform: resolveObjectTransform({
            objectId: cell.groundInstanceId,
            facilityKey: groundFacility.key,
            objectTransformById,
            itemTuningByKey: treeTuningByKey
          })
        });
      }

      const facility = cell.facilityKey ? FIELD_MAP_300_INSTALLABLE_BY_KEY[cell.facilityKey] : null;
      if (!facility) continue;
    }
  }

  for (let y = 0; y < GRID_ROWS; y += 1) {
    for (let x = 0; x < GRID_COLS; x += 1) {
      const cell = mapData?.cells?.[y]?.[x];
      const facility = cell?.facilityKey ? FIELD_MAP_300_INSTALLABLE_BY_KEY[cell.facilityKey] : null;
      const facilityInstanceId = String(cell?.facilityInstanceId || '');
      if (!facility || facility.placementMode || !facilityInstanceId) continue;
      if (x > 0 && mapData.cells[y][x - 1]?.facilityInstanceId === facilityInstanceId) continue;
      if (y > 0 && mapData.cells[y - 1][x]?.facilityInstanceId === facilityInstanceId) continue;
      facilityObjects.push({
        id: facilityInstanceId,
        kind: 'facility',
        facilityKey: facility.key,
        x,
        y,
        width: Number(facility.width || 1),
        height: Number(facility.height || 1),
        type: String(facility.type || CELL_TYPES.FACILITY),
        occupyPy: Number(facility.occupyPy || 0),
        transform: resolveObjectTransform({
          objectId: facilityInstanceId,
          facilityKey: facility.key,
          objectTransformById,
          itemTuningByKey: treeTuningByKey
        })
      });
    }
  }

  return {
    version: 1,
    grid: {
      cols: GRID_COLS,
      rows: GRID_ROWS
    },
    defaultGroundFacilityKey: String(mapData?.defaultGroundFacilityKey || ''),
    defaultGroundVariantKeys: Array.isArray(mapData?.defaultGroundVariantKeys)
      ? mapData.defaultGroundVariantKeys.map((key) => String(key || '')).filter(Boolean)
      : [],
    facilityInstanceSeed: Math.max(1, Number(facilityInstanceSeed || 1)),
    orchardBounds: mapData?.orchardBounds ? { ...mapData.orchardBounds } : null,
    utilityBounds: mapData?.utilityBounds ? { ...mapData.utilityBounds } : null,
    itemTuningByKey: normalizeTreeTuningByKey(treeTuningByKey),
    treeTuningByKey: pickTreeOnlyTuningByKey(treeTuningByKey),
    objects: [
      ...groundObjects,
      ...treeObjects,
      ...facilityObjects
    ]
  };
}

function createFieldMap300RuntimeState(savedPresetRaw) {
  const savedPreset = savedPresetRaw && typeof savedPresetRaw === 'object' ? savedPresetRaw : null;
  const objects = Array.isArray(savedPreset?.objects) ? savedPreset.objects : [];
  const defaultGroundFacilityKey = String(savedPreset?.defaultGroundFacilityKey || '');
  const defaultGroundVariantKeys = Array.isArray(savedPreset?.defaultGroundVariantKeys)
    ? savedPreset.defaultGroundVariantKeys.map((key) => String(key || '')).filter(Boolean)
    : [];
  const treeTuningByKey = hydrateItemTuningByKeyFromObjects(
    savedPreset?.itemTuningByKey || savedPreset?.treeTuningByKey,
    objects
  );
  const objectTransformById = createObjectTransformById(objects, treeTuningByKey);

  if (!objects.length) {
    return {
      mapData: savedPreset ? createBaseMapData(defaultGroundFacilityKey, defaultGroundVariantKeys) : createInitialMapData(),
      facilityInstanceSeed: Math.max(1, Number(savedPreset?.facilityInstanceSeed || 1)),
      treeTuningByKey,
      objectTransformById
    };
  }

  let mapData = createBaseMapData(defaultGroundFacilityKey, defaultGroundVariantKeys);
  let facilityInstanceSeed = Math.max(1, Number(savedPreset?.facilityInstanceSeed || 1));
  const orderedObjects = [
    ...objects.filter((entry) => entry?.kind === 'ground'),
    ...objects.filter((entry) => entry?.kind === 'tree'),
    ...objects.filter((entry) => entry?.kind === 'facility')
  ];

  orderedObjects.forEach((entry) => {
    const facilityKey = String(entry?.facilityKey || '');
    const facility = FIELD_MAP_300_INSTALLABLE_BY_KEY[facilityKey];
    const startX = Number(entry?.x);
    const startY = Number(entry?.y);
    if (!facility || !Number.isFinite(startX) || !Number.isFinite(startY)) return;
    const result = placeFacilityAt({
      mapData,
      startX,
      startY,
      facility,
      facilityInstanceSeed,
      forcedObjectId: String(entry?.id || '')
    });
    if (!result.placed) return;
    mapData = result.mapData;
    facilityInstanceSeed = result.facilityInstanceSeed;
  });

  return {
    mapData,
    facilityInstanceSeed,
    treeTuningByKey,
    objectTransformById
  };
}

function createSelectedPixelPreview({ mapData, x, y }) {
  const cell = mapData?.cells?.[y]?.[x];
  const type = cell?.type || CELL_TYPES.ORCHARD;
  const facility = cell?.facilityKey ? FIELD_MAP_300_INSTALLABLE_BY_KEY[cell.facilityKey] : null;
  const fallbackGroundFacilityKey = resolveDefaultGroundFacilityKeyForCell(mapData, x, y);
  const resolvedGroundFacilityKey = String(cell?.groundFacilityKey || fallbackGroundFacilityKey);
  const groundFacility = resolvedGroundFacilityKey ? FIELD_MAP_300_INSTALLABLE_BY_KEY[resolvedGroundFacilityKey] : null;
  const treeAge = clampTreeAge(cell?.treeAge);

  if (type === CELL_TYPES.TREE) {
    const previewTone = previewToneForTreeCell(cell);
    return {
      x,
      y,
      title: `${getTreeAgeLabel(treeAge)} 나무 픽셀`,
      meta: `${x + 1}열 ${y + 1}행 ${getTreeAgeLabel(treeAge)} 식재주`,
      hint: `${getTreeAgeLabel(treeAge)} 과수 위치로 표현된 식재 픽셀입니다.`,
      previewType: CELL_TYPES.TREE,
      previewTone,
      previewSkin: 'tree',
      previewImageKey: previewImageKeyForTreeAge(treeAge, previewTone),
      treeAge,
      facilityKey: cell?.facilityKey || ''
    };
  }

  if (facility) {
    return {
      x,
      y,
      title: facility.name,
      meta: `${x + 1}열 ${y + 1}행 ${facility.width} x ${facility.height}칸`,
      hint: facility.hint,
      previewType: type,
      previewTone: facility.previewTone || 'summer',
      previewSkin: facility.previewSkin || 'facility',
      previewImageKey: facility.previewImageKey || '',
      previewImageName: facility.previewImageName || '',
      treeAge: null,
      facilityKey: facility.key
    };
  }

  if (groundFacility?.placementMode === 'paint-ground') {
    return {
      x,
      y,
      title: groundFacility.name,
      meta: `${x + 1}열 ${y + 1}행 바닥 픽셀`,
      hint: groundFacility.hint,
      previewType: String(cell?.baseType || groundFacility.type || CELL_TYPES.SUMMER_GROUND),
      previewTone: groundFacility.previewTone || 'summer',
      previewSkin: groundFacility.previewSkin || 'summer',
      previewImageKey: groundFacility.previewImageKey || '',
      previewImageName: groundFacility.previewImageName || '',
      treeAge: null,
      facilityKey: groundFacility.key
    };
  }

  if (type === CELL_TYPES.WINTER_GROUND) {
    return {
      x,
      y,
      title: '동계 바닥 픽셀',
      meta: `${x + 1}열 ${y + 1}행 동계 바닥`,
      hint: '겨울 휴면기 톤을 표현한 바닥 구역입니다.',
      previewType: CELL_TYPES.WINTER_GROUND,
      previewTone: 'winter',
      previewSkin: 'winter',
      previewImageKey: '',
      treeAge: null,
      facilityKey: ''
    };
  }

  return {
    x,
    y,
    title: '과원 바닥 픽셀',
    meta: `${x + 1}열 ${y + 1}행 과원 바닥`,
    hint: '식재열 사이에 있는 기본 과원 바닥입니다.',
    previewType: CELL_TYPES.SUMMER_GROUND,
    previewTone: 'summer',
    previewSkin: 'summer',
    previewImageKey: '',
    treeAge: null,
    facilityKey: ''
  };
}

function cellClassNameOf(cell, x, y) {
  const classNames = ['fieldmap300-map__cell'];
  const baseType = cell.baseType ?? cell.type;
  if (baseType === CELL_TYPES.ORCHARD) classNames.push('is-orchard');
  if (baseType === CELL_TYPES.SUMMER_GROUND) classNames.push('is-summer-ground');
  if (baseType === CELL_TYPES.WINTER_GROUND) classNames.push('is-winter-ground');
  if (cell.type === CELL_TYPES.TREE) {
    classNames.push('is-tree', treeAgeClassOf(cell.treeAge, 'is-tree-age'));
  }
  if (cell.type === CELL_TYPES.FACILITY) classNames.push('is-facility');
  if (cell.type === CELL_TYPES.SHED) classNames.push('is-facility', 'is-shed');
  if (cell.type === CELL_TYPES.WATER) classNames.push('is-water');
  if (cell.type === CELL_TYPES.WELL) classNames.push('is-well');
  if (cell.type === CELL_TYPES.APRON) classNames.push('is-apron');
  if (x === 0 || y === 0 || x === GRID_COLS - 1 || y === GRID_ROWS - 1) classNames.push('is-edge');
  return classNames.join(' ');
}

function resolveGroundPreviewImageUrl(cell, mapData = null, x = -1, y = -1) {
  const fallbackGroundFacilityKey = x >= 0 && y >= 0
    ? resolveDefaultGroundFacilityKeyForCell(mapData, x, y)
    : String(mapData?.defaultGroundFacilityKey || '');
  const groundFacilityKey = String(cell?.groundFacilityKey || fallbackGroundFacilityKey || '');
  if (!groundFacilityKey) return '';
  const groundFacility = FIELD_MAP_300_INSTALLABLE_BY_KEY[groundFacilityKey] || null;
  return resolveFieldMap300ImageUrl(groundFacility);
}

function createItemArtStyle(tuning) {
  const safeTuning = tuning || TREE_TUNING_DEFAULTS;
  const scaleX = (safeTuning.flipX ? -1 : 1) * safeTuning.scaleX;
  const scaleY = (safeTuning.flipY ? -1 : 1) * safeTuning.scaleY;
  return {
    transform: `translate(${safeTuning.offsetX}%, ${safeTuning.offsetY}%) rotate(${safeTuning.rotation}deg) scale(${scaleX}, ${scaleY})`,
    opacity: safeTuning.opacity
  };
}

function createTreeImageStyle(tuning) {
  const safeTuning = tuning || TREE_TUNING_DEFAULTS;
  const signedScaleX = (safeTuning.flipX ? -1 : 1) * safeTuning.scaleX;
  const signedScaleY = (safeTuning.flipY ? -1 : 1) * safeTuning.scaleY;
  return {
    '--fieldmap300-tree-offset-x': `${safeTuning.offsetX}%`,
    '--fieldmap300-tree-offset-y': `${safeTuning.offsetY}%`,
    '--fieldmap300-tree-scale-x': String(safeTuning.scaleX),
    '--fieldmap300-tree-scale-y': String(safeTuning.scaleY),
    '--fieldmap300-tree-scale-x-signed': String(signedScaleX),
    '--fieldmap300-tree-scale-y-signed': String(signedScaleY),
    '--fieldmap300-tree-rotation': `${safeTuning.rotation}deg`,
    '--fieldmap300-tree-opacity': String(safeTuning.opacity),
    '--fieldmap300-tree-flip-x': safeTuning.flipX ? '-1' : '1',
    '--fieldmap300-tree-flip-y': safeTuning.flipY ? '-1' : '1'
  };
}

function collectObjectIdsByFacilityKey(mapData, facilityKey) {
  const ids = new Set();
  const canonicalKey = getCanonicalTuningFacilityKey(facilityKey);
  if (!mapData?.cells || !canonicalKey) return ids;
  for (let y = 0; y < GRID_ROWS; y += 1) {
    for (let x = 0; x < GRID_COLS; x += 1) {
      const cell = mapData.cells?.[y]?.[x];
      if (getCanonicalTuningFacilityKey(cell?.facilityKey) === canonicalKey && cell?.facilityInstanceId) {
        ids.add(String(cell.facilityInstanceId));
      }
      if (getCanonicalTuningFacilityKey(cell?.groundFacilityKey) === canonicalKey && cell?.groundInstanceId) {
        ids.add(String(cell.groundInstanceId));
      }
    }
  }
  return ids;
}

function getPlacementStartFromAnchor({ facility, anchorX, anchorY }) {
  const safeWidth = Math.max(1, Number(facility?.width || 1));
  const safeHeight = Math.max(1, Number(facility?.height || 1));
  return {
    startX: Math.round(Number(anchorX || 0) - ((safeWidth - 1) / 2)),
    startY: Math.round(Number(anchorY || 0) - ((safeHeight - 1) / 2))
  };
}

function getAreaRectFromCells(startCell, endCell) {
  return {
    startX: Math.min(Number(startCell?.x || 0), Number(endCell?.x || 0)),
    startY: Math.min(Number(startCell?.y || 0), Number(endCell?.y || 0)),
    endX: Math.max(Number(startCell?.x || 0), Number(endCell?.x || 0)),
    endY: Math.max(Number(startCell?.y || 0), Number(endCell?.y || 0))
  };
}

function canPlaceFacilityAt({ mapData, startX, startY, facility }) {
  if (!facility || !mapData?.cells) return false;
  const endX = startX + facility.width - 1;
  const endY = startY + facility.height - 1;
  if (startX < 0 || startY < 0 || endX >= GRID_COLS || endY >= GRID_ROWS) return false;

  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      const cell = mapData.cells?.[y]?.[x];
      if (!cell) return false;
      if (facility.placementMode === 'paint-tree') {
        if (!isGroundCellType(cell.type)) return false;
        continue;
      }
      if (facility.placementMode === 'paint-ground') continue;
      if (!isGroundCellType(cell.type) && cell.type !== CELL_TYPES.TREE) return false;
    }
  }

  return true;
}

function placeFacilityAt({ mapData, startX, startY, facility, facilityInstanceSeed, forcedObjectId = '' }) {
  if (!facility || !canPlaceFacilityAt({ mapData, startX, startY, facility })) {
    return { placed: false, mapData, facilityInstanceSeed, placedObjectId: '' };
  }

  const nextMapData = cloneMapData(mapData);
  let nextSeed = Number(facilityInstanceSeed) || 1;

  if (facility.placementMode === 'paint-tree') {
    const placedObjectId = String(forcedObjectId || `paint-tree-${nextSeed + 1}`);
    nextMapData.cells[startY][startX].type = CELL_TYPES.TREE;
    nextMapData.cells[startY][startX].treeAge = clampTreeAge(facility.treeAge);
    nextMapData.cells[startY][startX].facilityKey = facility.key;
    nextMapData.cells[startY][startX].facilityInstanceId = placedObjectId;
    nextSeed += 1;
    const exists = nextMapData.treePositions.some(([treeX, treeY]) => treeX === startX && treeY === startY);
    if (!exists) nextMapData.treePositions.push([startX, startY]);
    return { placed: true, mapData: nextMapData, facilityInstanceSeed: nextSeed, placedObjectId };
  }

  if (facility.placementMode === 'paint-ground') {
    const placedObjectId = String(forcedObjectId || `paint-ground-${nextSeed + 1}`);
    nextMapData.cells[startY][startX].baseType = facility.type;
    nextMapData.cells[startY][startX].groundFacilityKey = facility.key;
    nextMapData.cells[startY][startX].groundInstanceId = placedObjectId;
    nextSeed += 1;
    return { placed: true, mapData: nextMapData, facilityInstanceSeed: nextSeed, placedObjectId };
  }

  const facilityInstanceId = String(forcedObjectId || `facility-${facility.key}-${nextSeed + 1}`);
  nextSeed += 1;
  for (let y = startY; y < startY + facility.height; y += 1) {
    for (let x = startX; x < startX + facility.width; x += 1) {
      nextMapData.cells[y][x].type = facility.type;
      nextMapData.cells[y][x].treeAge = null;
      nextMapData.cells[y][x].facilityKey = facility.key;
      nextMapData.cells[y][x].facilityInstanceId = facilityInstanceId;
    }
  }
  nextMapData.treePositions = nextMapData.treePositions.filter(([treeX, treeY]) => !(
    treeX >= startX
    && treeX < startX + facility.width
    && treeY >= startY
    && treeY < startY + facility.height
  ));

  return { placed: true, mapData: nextMapData, facilityInstanceSeed: nextSeed, placedObjectId: facilityInstanceId };
}

function paintRandomGroundArea({
  mapData,
  startCell,
  endCell,
  facility,
  facilityInstanceSeed,
  treeTuningByKey
}) {
  const variantKeys = Array.isArray(facility?.variantKeys) ? facility.variantKeys.filter(Boolean) : [];
  if (!variantKeys.length || !mapData?.cells) {
    return { placed: false, mapData, facilityInstanceSeed, placedObjects: [] };
  }

  const nextMapData = cloneMapData(mapData);
  const placedObjects = [];
  let nextSeed = Number(facilityInstanceSeed) || 1;
  const { startX, startY, endX, endY } = getAreaRectFromCells(startCell, endCell);

  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      const variantKey = variantKeys[Math.floor(Math.random() * variantKeys.length)] || variantKeys[0];
      const placedObjectId = `paint-ground-${nextSeed + 1}`;
      nextSeed += 1;
      nextMapData.cells[y][x].baseType = facility.type || CELL_TYPES.SUMMER_GROUND;
      nextMapData.cells[y][x].groundFacilityKey = variantKey;
      nextMapData.cells[y][x].groundInstanceId = placedObjectId;
      placedObjects.push({
        objectId: placedObjectId,
        facilityKey: variantKey,
        transform: normalizeItemTransform(
          treeTuningByKey?.[getCanonicalTuningFacilityKey(variantKey)] || TREE_TUNING_DEFAULTS,
          getCanonicalTuningFacilityKey(variantKey)
        )
      });
    }
  }

  return {
    placed: true,
    mapData: nextMapData,
    facilityInstanceSeed: nextSeed,
    placedObjects
  };
}

function clearFacilityPlacementAt(mapData, facilityInstanceId) {
  const safeId = String(facilityInstanceId || '');
  if (!safeId) return { mapData, removed: false };
  const nextMapData = cloneMapData(mapData);
  let removed = false;
  for (let y = 0; y < GRID_ROWS; y += 1) {
    for (let x = 0; x < GRID_COLS; x += 1) {
      const cell = nextMapData.cells[y][x];
      if (String(cell?.facilityInstanceId || '') !== safeId) continue;
      cell.type = cell.baseType || CELL_TYPES.SUMMER_GROUND;
      cell.treeAge = null;
      cell.facilityKey = null;
      cell.facilityInstanceId = null;
      removed = true;
    }
  }
  return { mapData: nextMapData, removed };
}

function clearGroundPaintAt(mapData, groundInstanceId) {
  const safeId = String(groundInstanceId || '');
  if (!safeId) return { mapData, removed: false };
  const nextMapData = cloneMapData(mapData);
  let removed = false;
  for (let y = 0; y < GRID_ROWS; y += 1) {
    for (let x = 0; x < GRID_COLS; x += 1) {
      const cell = nextMapData.cells[y][x];
      if (String(cell?.groundInstanceId || '') !== safeId) continue;
      cell.baseType = CELL_TYPES.SUMMER_GROUND;
      if (cell.type !== CELL_TYPES.TREE && !cell.facilityKey) {
        cell.type = CELL_TYPES.SUMMER_GROUND;
      }
      cell.groundFacilityKey = null;
      cell.groundInstanceId = null;
      removed = true;
    }
  }
  return { mapData: nextMapData, removed };
}

function clearTreeAt(mapData, x, y) {
  const nextMapData = cloneMapData(mapData);
  const cell = nextMapData.cells?.[y]?.[x];
  if (!cell || cell.type !== CELL_TYPES.TREE) return { mapData, removed: false, removedObjectId: '' };
  const removedObjectId = String(cell.facilityInstanceId || '');
  cell.type = cell.baseType || CELL_TYPES.SUMMER_GROUND;
  cell.treeAge = null;
  cell.facilityKey = null;
  cell.facilityInstanceId = null;
  nextMapData.treePositions = nextMapData.treePositions.filter(([treeX, treeY]) => !(treeX === x && treeY === y));
  return { mapData: nextMapData, removed: true, removedObjectId };
}

function FacilityArt({ facility, className = '' }) {
  const previewImageUrl = resolveFieldMap300ImageUrl(facility);
  const treeAgeClass = facility?.previewSkin === 'tree'
    ? ` ${treeAgeClassOf(facility?.treeAge, 'fieldmap300-map__overlay-art--tree-age')}`
    : '';

  return (
    <span
      className={`fieldmap300-map__overlay-art fieldmap300-map__overlay-art--${facility?.previewSkin || 'facility'}${treeAgeClass}${className ? ` ${className}` : ''}`.trim()}
      aria-hidden="true"
    >
      {previewImageUrl ? <img src={previewImageUrl} alt={facility?.name || ''} loading="eager" decoding="async" /> : null}
    </span>
  );
}

function TreeTuningPanel({ facility, tuning, displayBounds, disabled = false, onChange, onReset }) {
  const controls = [
    { key: 'offsetX', label: '위치 X', min: -TREE_TUNING_OFFSET_X_LIMIT, max: TREE_TUNING_OFFSET_X_LIMIT, step: 0.25, unit: '%', decimals: 2 },
    { key: 'offsetY', label: '위치 Y', min: -TREE_TUNING_OFFSET_Y_LIMIT, max: TREE_TUNING_OFFSET_Y_LIMIT, step: 0.25, unit: '%', decimals: 2 },
    { key: 'scaleX', label: '크기 가로', min: TREE_TUNING_SCALE_MIN, max: TREE_TUNING_SCALE_MAX, step: 0.01, unit: 'x', decimals: 2 },
    { key: 'scaleY', label: '크기 세로', min: TREE_TUNING_SCALE_MIN, max: TREE_TUNING_SCALE_MAX, step: 0.01, unit: 'x', decimals: 2 },
    { key: 'rotation', label: '회전', min: -TREE_TUNING_ROTATION_LIMIT, max: TREE_TUNING_ROTATION_LIMIT, step: 0.5, unit: 'deg', decimals: 1 },
    { key: 'opacity', label: '불투명도', min: 0.15, max: 1, step: 0.01, unit: '', decimals: 2 }
  ];
  const formatControlValue = (control, value) => Number(value).toFixed(control.decimals);
  const [draftValues, setDraftValues] = useState(() =>
    Object.fromEntries(
      controls.map((control) => [
        control.key,
        formatControlValue(
          control,
          tuning?.[control.key]
            ?? (
              control.key === 'scaleX'
              || control.key === 'scaleY'
              || control.key === 'opacity'
                ? 1
                : 0
            )
        )
      ])
    )
  );

  useEffect(() => {
    setDraftValues(
      Object.fromEntries(
        controls.map((control) => [
          control.key,
          formatControlValue(
            control,
            tuning?.[control.key]
              ?? (
                control.key === 'scaleX'
                || control.key === 'scaleY'
                || control.key === 'opacity'
                  ? 1
                  : 0
              )
          )
        ])
      )
    );
  }, [tuning]);

  function commitDraftValue(control, rawValue, fallbackValue) {
    if (
      rawValue === ''
      || rawValue === '-'
      || rawValue === '.'
      || rawValue === '-.'
      || !Number.isFinite(Number(rawValue))
    ) {
      setDraftValues((prev) => ({ ...prev, [control.key]: fallbackValue }));
      return;
    }
    onChange(control.key, rawValue);
    setDraftValues((prev) => ({ ...prev, [control.key]: formatControlValue(control, rawValue) }));
  }

  return (
    <aside className="fieldmap300-map__tuning panel-card">
      <div className="fieldmap300-map__tuning-head">
        <div className="fieldmap300-map__tuning-copy-wrap">
          <div className="fieldmap300-map__tuning-label">선택 항목 조절</div>
          <p className="fieldmap300-map__tuning-copy">
            {disabled
              ? '설치 라이브러리에서 나무, 땅, 시설 항목을 선택하면 해당 항목만 따로 조절할 수 있습니다.'
              : `${facility?.name || '선택 항목'} 위치와 크기를 바로 맞춥니다.`}
          </p>
        </div>
        <button type="button" className="button button--ghost button--compact" onClick={onReset}>
          초기화
        </button>
      </div>
      <div className="fieldmap300-map__tuning-controls">
        <div className="fieldmap300-map__tuning-toggle-row">
          <button
            type="button"
            className={`fieldmap300-map__tuning-toggle${tuning?.flipX ? ' is-active' : ''}`.trim()}
            disabled={disabled}
            onClick={() => onChange('flipX', !tuning?.flipX)}
          >
            좌우 반전
          </button>
          <button
            type="button"
            className={`fieldmap300-map__tuning-toggle${tuning?.flipY ? ' is-active' : ''}`.trim()}
            disabled={disabled}
            onClick={() => onChange('flipY', !tuning?.flipY)}
          >
            상하 반전
          </button>
        </div>
        {controls.map((control) => {
          const bounds = displayBounds?.[control.key] || { min: 0, max: 0 };
          const currentValue = Number(
            tuning?.[control.key]
            ?? (
              control.key === 'scaleX'
              || control.key === 'scaleY'
              || control.key === 'opacity'
                ? 1
                : 0
            )
          );
          const formattedCurrentValue = formatControlValue(control, currentValue);
          return (
            <label key={control.key} className={`fieldmap300-map__tuning-control${disabled ? ' is-disabled' : ''}`.trim()}>
              <span className="fieldmap300-map__tuning-name">{control.label}</span>
              <div className="fieldmap300-map__tuning-row">
                <input
                  type="range"
                  min={bounds.min}
                  max={bounds.max}
                  step={control.step}
                  value={currentValue}
                  disabled={disabled}
                  onChange={(event) => {
                    const { value } = event.target;
                    setDraftValues((prev) => ({ ...prev, [control.key]: formatControlValue(control, value) }));
                    onChange(control.key, value);
                  }}
                />
                <div className="fieldmap300-map__tuning-value">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="fieldmap300-map__tuning-number"
                    value={draftValues[control.key] ?? formattedCurrentValue}
                    disabled={disabled}
                    aria-label={`${control.label} 직접 입력`}
                    onChange={(event) => {
                      const { value } = event.target;
                      setDraftValues((prev) => ({ ...prev, [control.key]: value }));
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter') return;
                      event.preventDefault();
                      event.currentTarget.blur();
                    }}
                    onBlur={(event) => {
                      commitDraftValue(control, event.target.value, formattedCurrentValue);
                    }}
                  />
                  {control.unit ? <span className="fieldmap300-map__tuning-unit">{control.unit}</span> : null}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </aside>
  );
}

export default function FieldMap300Map({
  selectedFacilityKey = '',
  onSelectedPixelChange,
  onMapStateChange,
  initialPresetState = null,
  saveCommitTick = 0,
  clearAllPixelsTick = 0,
  deleteSelectedItemTick = 0,
  wrapRef = null
}) {
  const stageRef = useRef(null);
  const deleteSelectedHandledTickRef = useRef(0);
  const suppressNextCellClickRef = useRef(false);
  const initialRuntimeState = useMemo(
    () => createFieldMap300RuntimeState(initialPresetState || FIELD_MAP_300_SAVED_PRESET),
    [initialPresetState]
  );
  const initialTreeTuningBaselineByKey = useMemo(
    () => normalizeTreeTuningByKey(initialRuntimeState.treeTuningByKey),
    [initialRuntimeState.treeTuningByKey]
  );
  const [mapData, setMapData] = useState(() => initialRuntimeState.mapData);
  const [facilityInstanceSeed, setFacilityInstanceSeed] = useState(() => initialRuntimeState.facilityInstanceSeed);
  const [selectedCellCoords, setSelectedCellCoords] = useState(null);
  const [hoverCellCoords, setHoverCellCoords] = useState(null);
  const [cellSize, setCellSize] = useState(18);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [treeTuningBaselineByKey, setTreeTuningBaselineByKey] = useState(() => initialTreeTuningBaselineByKey);
  const [treeTuningByKey, setTreeTuningByKey] = useState(() => initialTreeTuningBaselineByKey);
  const [objectTransformById, setObjectTransformById] = useState(() => initialRuntimeState.objectTransformById || {});
  const [dragState, setDragState] = useState({
    active: false,
    pending: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0
  });
  const [areaPaintState, setAreaPaintState] = useState({
    active: false,
    pointerId: null,
    startCell: null,
    currentCell: null
  });

  const selectedFacility = FIELD_MAP_300_INSTALLABLE_BY_KEY[String(selectedFacilityKey || '')] || null;
  const isAreaGroundPainterSelected = isRandomGroundAreaFacility(selectedFacility);
  const activeTreeTuningKey = isTunableFacility(selectedFacility) ? getCanonicalTuningFacilityKey(selectedFacility.key) : '';
  const activeTreeBaselineTuning = activeTreeTuningKey
    ? treeTuningBaselineByKey[activeTreeTuningKey] || TREE_TUNING_DEFAULTS
    : TREE_TUNING_DEFAULTS;
  const activeTreeTuning = activeTreeTuningKey
    ? treeTuningByKey[activeTreeTuningKey] || treeTuningBaselineByKey[activeTreeTuningKey] || TREE_TUNING_DEFAULTS
    : TREE_TUNING_DEFAULTS;
  const activeTreeTuningDisplay = useMemo(() => ({
    offsetX: getTreeTuningDisplayValue(activeTreeTuning, activeTreeBaselineTuning, 'offsetX'),
    offsetY: getTreeTuningDisplayValue(activeTreeTuning, activeTreeBaselineTuning, 'offsetY'),
    scaleX: getTreeTuningDisplayValue(activeTreeTuning, activeTreeBaselineTuning, 'scaleX'),
    scaleY: getTreeTuningDisplayValue(activeTreeTuning, activeTreeBaselineTuning, 'scaleY'),
    rotation: getTreeTuningDisplayValue(activeTreeTuning, activeTreeBaselineTuning, 'rotation'),
    opacity: getTreeTuningDisplayValue(activeTreeTuning, activeTreeBaselineTuning, 'opacity'),
    flipX: Boolean(activeTreeTuning?.flipX),
    flipY: Boolean(activeTreeTuning?.flipY)
  }), [activeTreeBaselineTuning, activeTreeTuning]);
  const activeTreeTuningBounds = useMemo(() => ({
    offsetX: getDisplayControlBounds(activeTreeBaselineTuning, 'offsetX', activeTreeTuningKey),
    offsetY: getDisplayControlBounds(activeTreeBaselineTuning, 'offsetY', activeTreeTuningKey),
    scaleX: getDisplayControlBounds(activeTreeBaselineTuning, 'scaleX', activeTreeTuningKey),
    scaleY: getDisplayControlBounds(activeTreeBaselineTuning, 'scaleY', activeTreeTuningKey),
    rotation: getDisplayControlBounds(activeTreeBaselineTuning, 'rotation', activeTreeTuningKey),
    opacity: getDisplayControlBounds(activeTreeBaselineTuning, 'opacity', activeTreeTuningKey)
  }), [activeTreeBaselineTuning, activeTreeTuningKey]);
  const gridWidth = cellSize * GRID_COLS;
  const gridHeight = cellSize * GRID_ROWS;
  const guideText = selectedFacility
    ? isAreaGroundPainterSelected
      ? `${selectedFacility.name} 모드입니다. 시작 셀부터 끝 셀까지 드래그하면 영역 안이 랜덤 배치됩니다.`
      : `${selectedFacility.name} 설치 모드입니다. 지도의 원하는 위치에 커서를 올려 범위를 확인한 뒤 클릭해 배치하세요.`
    : '휠로 확대하고 드래그로 이동할 수 있습니다. 셀을 클릭하면 현재 픽셀 정보를 바로 확인할 수 있습니다.';
  const modeLabel = selectedFacility ? `${selectedFacility.name} 설치 중` : '픽셀 탐색 중';
  const mapStyle = useMemo(() => {
    const style = {};
    TREE_TUNING_KEYS.forEach((key) => {
      const tuning = treeTuningByKey[key] || treeTuningBaselineByKey[key] || TREE_TUNING_DEFAULTS;
      style[`--${key}-offset-x`] = `${tuning.offsetX}%`;
      style[`--${key}-offset-y`] = `${tuning.offsetY}%`;
      style[`--${key}-scale-x`] = String(tuning.scaleX);
      style[`--${key}-scale-y`] = String(tuning.scaleY);
      style[`--${key}-rotation`] = `${tuning.rotation}deg`;
      style[`--${key}-opacity`] = String(tuning.opacity);
      style[`--${key}-flip-x`] = tuning.flipX ? '-1' : '1';
      style[`--${key}-flip-y`] = tuning.flipY ? '-1' : '1';
    });
    return style;
  }, [treeTuningBaselineByKey, treeTuningByKey]);

  useEffect(() => {
    if (!selectedCellCoords) return;
    onSelectedPixelChange?.(createSelectedPixelPreview({
      mapData,
      x: selectedCellCoords.x,
      y: selectedCellCoords.y
    }));
  }, [mapData, onSelectedPixelChange, selectedCellCoords]);

  useEffect(() => {
    if (!onMapStateChange) return;
    onMapStateChange(buildFieldMap300StateSnapshot({
      mapData,
      facilityInstanceSeed,
      treeTuningByKey,
      objectTransformById
    }));
  }, [facilityInstanceSeed, mapData, objectTransformById, onMapStateChange, treeTuningByKey]);

  useEffect(() => {
    if (!saveCommitTick) return;
    setTreeTuningBaselineByKey(normalizeTreeTuningByKey(treeTuningByKey));
  }, [saveCommitTick]);

  useEffect(() => {
    if (isAreaGroundPainterSelected) return;
    setAreaPaintState({
      active: false,
      pointerId: null,
      startCell: null,
      currentCell: null
    });
  }, [isAreaGroundPainterSelected]);

  useEffect(() => {
    if (!clearAllPixelsTick) return;
    setMapData(createBaseMapData());
    setFacilityInstanceSeed(1);
    setObjectTransformById({});
    setSelectedCellCoords(null);
    setHoverCellCoords(null);
    onSelectedPixelChange?.(createDefaultSelectedPixelPreview());
  }, [clearAllPixelsTick, onSelectedPixelChange]);

  useEffect(() => {
    if (!deleteSelectedItemTick || deleteSelectedHandledTickRef.current === deleteSelectedItemTick) return;
    deleteSelectedHandledTickRef.current = deleteSelectedItemTick;
    if (!selectedCellCoords) return;
    const selectedCell = mapData?.cells?.[selectedCellCoords.y]?.[selectedCellCoords.x];
    if (!selectedCell) return;

    const facilityInstanceId = String(selectedCell.facilityInstanceId || '');
    const groundInstanceId = String(selectedCell.groundInstanceId || '');

    if (selectedCell.type === CELL_TYPES.TREE) {
      const result = clearTreeAt(mapData, selectedCellCoords.x, selectedCellCoords.y);
      if (!result.removed) return;
      setMapData(result.mapData);
      if (result.removedObjectId) {
        setObjectTransformById((current) => {
          const next = { ...current };
          delete next[result.removedObjectId];
          return next;
        });
      }
      onSelectedPixelChange?.(createSelectedPixelPreview({
        mapData: result.mapData,
        x: selectedCellCoords.x,
        y: selectedCellCoords.y
      }));
      return;
    }

    if (facilityInstanceId) {
      const result = clearFacilityPlacementAt(mapData, facilityInstanceId);
      if (!result.removed) return;
      setMapData(result.mapData);
      setObjectTransformById((current) => {
        const next = { ...current };
        delete next[facilityInstanceId];
        return next;
      });
      onSelectedPixelChange?.(createSelectedPixelPreview({
        mapData: result.mapData,
        x: selectedCellCoords.x,
        y: selectedCellCoords.y
      }));
      return;
    }

    if (groundInstanceId) {
      const result = clearGroundPaintAt(mapData, groundInstanceId);
      if (!result.removed) return;
      setMapData(result.mapData);
      setObjectTransformById((current) => {
        const next = { ...current };
        delete next[groundInstanceId];
        return next;
      });
      onSelectedPixelChange?.(createSelectedPixelPreview({
        mapData: result.mapData,
        x: selectedCellCoords.x,
        y: selectedCellCoords.y
      }));
    }
  }, [deleteSelectedItemTick, mapData, onSelectedPixelChange, selectedCellCoords]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const updateLayout = () => {
      const stageInnerWidth = Math.max(0, stage.clientWidth - STAGE_PADDING);
      const stageInnerHeight = Math.max(0, stage.clientHeight - STAGE_PADDING);
      const fitCellSize = Math.floor(Math.min(stageInnerWidth / GRID_COLS, stageInnerHeight / GRID_ROWS));
      const safeCellSize = Math.max(1, fitCellSize);
      setCellSize(safeCellSize);
      setPan((prev) => clampPanPosition({
        panX: prev.x,
        panY: prev.y,
        gridWidth: safeCellSize * GRID_COLS,
        gridHeight: safeCellSize * GRID_ROWS,
        zoom,
        stageWidth: stage.clientWidth,
        stageHeight: stage.clientHeight
      }));
    };

    updateLayout();
    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(stage);
    return () => resizeObserver.disconnect();
  }, [zoom]);

  const gridCells = useMemo(() => {
    const cells = [];
    for (let y = 0; y < GRID_ROWS; y += 1) {
      for (let x = 0; x < GRID_COLS; x += 1) {
        const cell = mapData.cells[y][x];
        cells.push({
          x,
          y,
          type: cell.type,
          baseType: cell.baseType,
          treeAge: cell.treeAge,
          groundFacilityKey: cell.groundFacilityKey || '',
          groundInstanceId: cell.groundInstanceId || '',
          title: cell.type === CELL_TYPES.TREE
            ? `${x + 1}열 / ${y + 1}행 / ${getTreeAgeLabel(cell.treeAge)}`
            : `${x + 1}열 / ${y + 1}행 / ${cell.type}`,
          className: cellClassNameOf(cell, x, y),
          facilityKey: cell.facilityKey || '',
          facilityInstanceId: cell.facilityInstanceId || ''
        });
      }
    }
    return cells;
  }, [mapData]);

  const overlays = useMemo(() => {
    const nextOverlays = [];
    for (let y = 0; y < GRID_ROWS; y += 1) {
      for (let x = 0; x < GRID_COLS; x += 1) {
        const cell = mapData.cells[y][x];
        const facility = cell?.facilityKey ? FIELD_MAP_300_INSTALLABLE_BY_KEY[cell.facilityKey] : null;
        const facilityInstanceId = cell?.facilityInstanceId;
        if (!facility || !facilityInstanceId) continue;
        if (facility.placementMode === 'paint-tree') {
          nextOverlays.push({
            key: facilityInstanceId,
            x,
            y,
            sortBottom: y + 1,
            facility,
            isMatchingSelection: selectedFacility?.key === facility.key,
            transform: resolveObjectTransform({
              objectId: facilityInstanceId,
              facilityKey: facility.key,
              objectTransformById,
              itemTuningByKey: treeTuningByKey
            }),
            className: `is-tree ${treeAgeClassOf(cell.treeAge, 'is-tree-age')}`.trim()
          });
          continue;
        }
        if (facility.placementMode) continue;
        if (x > 0 && mapData.cells[y][x - 1]?.facilityInstanceId === facilityInstanceId) continue;
        if (y > 0 && mapData.cells[y - 1][x]?.facilityInstanceId === facilityInstanceId) continue;
        nextOverlays.push({
          key: facilityInstanceId,
          x,
          y,
          sortBottom: y + Number(facility.height || 1),
          facility,
          isMatchingSelection: selectedFacility?.key === facility.key,
          transform: resolveObjectTransform({
            objectId: facilityInstanceId,
            facilityKey: facility.key,
            objectTransformById,
            itemTuningByKey: treeTuningByKey
          }),
          className: facility.type === CELL_TYPES.WATER
            ? facility.key === 'peTankXl' || facility.key === 'peTankXxl'
              ? 'is-water is-water-xl'
              : 'is-water'
            : facility.type === CELL_TYPES.WELL
              ? 'is-well'
              : facility.type === CELL_TYPES.SHED
                ? 'is-facility is-shed'
                : 'is-facility'
        });
      }
    }
    nextOverlays.sort((left, right) => {
      if (left.sortBottom !== right.sortBottom) return left.sortBottom - right.sortBottom;
      if (left.y !== right.y) return left.y - right.y;
      if (left.x !== right.x) return left.x - right.x;
      return String(left.key).localeCompare(String(right.key));
    });
    return nextOverlays;
  }, [mapData, objectTransformById, selectedFacility?.key, treeTuningByKey]);

  const placementGhost = useMemo(() => {
    if (!selectedFacility || !hoverCellCoords) return null;
    if (isAreaGroundPainterSelected) {
      const startCell = areaPaintState.startCell || hoverCellCoords;
      const endCell = areaPaintState.currentCell || hoverCellCoords;
      const { startX, startY, endX, endY } = getAreaRectFromCells(startCell, endCell);
      return {
        left: startX * cellSize,
        top: startY * cellSize,
        width: ((endX - startX) + 1) * cellSize,
        height: ((endY - startY) + 1) * cellSize,
        isValid: true
      };
    }
    const { startX, startY } = getPlacementStartFromAnchor({
      facility: selectedFacility,
      anchorX: hoverCellCoords.x,
      anchorY: hoverCellCoords.y
    });
    const isValid = canPlaceFacilityAt({
      mapData,
      startX,
      startY,
      facility: selectedFacility
    });
    return {
      left: startX * cellSize,
      top: startY * cellSize,
      width: selectedFacility.width * cellSize,
      height: selectedFacility.height * cellSize,
      isValid
    };
  }, [areaPaintState.currentCell, areaPaintState.startCell, cellSize, hoverCellCoords, isAreaGroundPainterSelected, mapData, selectedFacility]);

  function handleTreeTuningChange(key, rawValue) {
    if (!activeTreeTuningKey) return;
    const baseline = treeTuningBaselineByKey[activeTreeTuningKey] || TREE_TUNING_DEFAULTS;
    const currentSource = treeTuningByKey[activeTreeTuningKey] || treeTuningBaselineByKey[activeTreeTuningKey] || TREE_TUNING_DEFAULTS;
    const nextTransform = normalizeItemTransform({
      ...currentSource,
      [key]: key === 'flipX' || key === 'flipY'
        ? clampTreeTuningValue(key, rawValue)
        : applyTreeTuningDisplayValue(baseline, key, rawValue, activeTreeTuningKey)
    }, activeTreeTuningKey);
    setTreeTuningByKey((current) => ({
      ...current,
      [activeTreeTuningKey]: nextTransform
    }));
    const objectIds = collectObjectIdsByFacilityKey(mapData, activeTreeTuningKey);
    if (objectIds.size) {
      setObjectTransformById((current) => {
        const next = { ...current };
        objectIds.forEach((objectId) => {
          next[objectId] = nextTransform;
        });
        return next;
      });
    }
  }

  function resetTreeTuning() {
    if (!activeTreeTuningKey) return;
    const nextTransform = normalizeItemTransform(treeTuningBaselineByKey[activeTreeTuningKey] || TREE_TUNING_DEFAULTS, activeTreeTuningKey);
    setTreeTuningByKey((current) => ({
      ...current,
      [activeTreeTuningKey]: nextTransform
    }));
    const objectIds = collectObjectIdsByFacilityKey(mapData, activeTreeTuningKey);
    if (objectIds.size) {
      setObjectTransformById((current) => {
        const next = { ...current };
        objectIds.forEach((objectId) => {
          next[objectId] = nextTransform;
        });
        return next;
      });
    }
  }

  function clearSelectedCell() {
    setSelectedCellCoords(null);
    onSelectedPixelChange?.(createDefaultSelectedPixelPreview());
  }

  function applyAreaGroundPaint(startCell, endCell) {
    if (!selectedFacility || !isAreaGroundPainterSelected) return;
    const result = paintRandomGroundArea({
      mapData,
      startCell,
      endCell,
      facility: selectedFacility,
      facilityInstanceSeed,
      treeTuningByKey
    });
    if (!result.placed) return;
    setMapData(result.mapData);
    setFacilityInstanceSeed(result.facilityInstanceSeed);
    if (result.placedObjects.length) {
      setObjectTransformById((current) => {
        const next = { ...current };
        result.placedObjects.forEach(({ objectId, transform }) => {
          next[objectId] = transform;
        });
        return next;
      });
    }
    setSelectedCellCoords({ x: endCell.x, y: endCell.y });
    onSelectedPixelChange?.(createSelectedPixelPreview({
      mapData: result.mapData,
      x: endCell.x,
      y: endCell.y
    }));
  }

  function handleCellClick(cellX, cellY) {
    if (suppressNextCellClickRef.current) {
      suppressNextCellClickRef.current = false;
      return;
    }
    if (selectedFacility) {
      if (isAreaGroundPainterSelected) {
        applyAreaGroundPaint({ x: cellX, y: cellY }, { x: cellX, y: cellY });
        return;
      }
      const { startX, startY } = getPlacementStartFromAnchor({
        facility: selectedFacility,
        anchorX: cellX,
        anchorY: cellY
      });
      const result = placeFacilityAt({
        mapData,
        startX,
        startY,
        facility: selectedFacility,
        facilityInstanceSeed
      });
      if (result.placed) {
        setMapData(result.mapData);
        setFacilityInstanceSeed(result.facilityInstanceSeed);
        if (result.placedObjectId) {
          setObjectTransformById((current) => ({
            ...current,
            [result.placedObjectId]: normalizeItemTransform(
              treeTuningByKey[getCanonicalTuningFacilityKey(selectedFacility.key)] || treeTuningBaselineByKey[getCanonicalTuningFacilityKey(selectedFacility.key)] || TREE_TUNING_DEFAULTS,
              getCanonicalTuningFacilityKey(selectedFacility.key)
            )
          }));
        }
        setSelectedCellCoords({ x: cellX, y: cellY });
        onSelectedPixelChange?.(createSelectedPixelPreview({
          mapData: result.mapData,
          x: cellX,
          y: cellY
        }));
      }
      return;
    }

    if (selectedCellCoords?.x === cellX && selectedCellCoords?.y === cellY) {
      clearSelectedCell();
      return;
    }

    setSelectedCellCoords({ x: cellX, y: cellY });
    onSelectedPixelChange?.(createSelectedPixelPreview({ mapData, x: cellX, y: cellY }));
  }

  function handleAreaPaintPointerDown(event, cellX, cellY) {
    if (!isAreaGroundPainterSelected || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setAreaPaintState({
      active: true,
      pointerId: event.pointerId,
      startCell: { x: cellX, y: cellY },
      currentCell: { x: cellX, y: cellY }
    });
    setHoverCellCoords({ x: cellX, y: cellY });
  }

  function handleAreaPaintPointerEnter(cellX, cellY) {
    setHoverCellCoords({ x: cellX, y: cellY });
    if (!isAreaGroundPainterSelected) return;
    if (!areaPaintState.active) {
      return;
    }
    setAreaPaintState((prev) => ({
      ...prev,
      currentCell: { x: cellX, y: cellY }
    }));
  }

  function finalizeAreaPaint(pointerId = null) {
    if (!isAreaGroundPainterSelected || !areaPaintState.active) return false;
    if (pointerId !== null && areaPaintState.pointerId !== null && areaPaintState.pointerId !== pointerId) return false;
    const startCell = areaPaintState.startCell;
    const endCell = areaPaintState.currentCell || areaPaintState.startCell;
    const isDragArea = Boolean(
      startCell
      && endCell
      && (startCell.x !== endCell.x || startCell.y !== endCell.y)
    );
    applyAreaGroundPaint(startCell, endCell);
    setAreaPaintState({
      active: false,
      pointerId: null,
      startCell: null,
      currentCell: null
    });
    if (isDragArea) suppressNextCellClickRef.current = true;
    return true;
  }

  function handleWheel(event) {
    event.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const nextZoom = zoom * Math.exp(-event.deltaY * ZOOM_SENSITIVITY);
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
    if (Math.abs(clampedZoom - zoom) < 0.0001) return;
    const stageRect = stage.getBoundingClientRect();
    const anchorOffsetX = event.clientX - (stageRect.left + stageRect.width / 2);
    const anchorOffsetY = event.clientY - (stageRect.top + stageRect.height / 2);
    const worldX = (anchorOffsetX - pan.x) / zoom;
    const worldY = (anchorOffsetY - pan.y) / zoom;
    const nextPanX = anchorOffsetX - (worldX * clampedZoom);
    const nextPanY = anchorOffsetY - (worldY * clampedZoom);
    setZoom(clampedZoom);
    setPan(clampPanPosition({
      panX: nextPanX,
      panY: nextPanY,
      gridWidth,
      gridHeight,
      zoom: clampedZoom,
      stageWidth: stage.clientWidth,
      stageHeight: stage.clientHeight
    }));
  }

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    if (selectedFacility) return;
    if (zoom <= MIN_ZOOM) return;
    setDragState({
      active: false,
      pending: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y
    });
  }

  function handlePointerMove(event) {
    if (!dragState.pending && !dragState.active) return;
    const stage = stageRef.current;
    if (!stage) return;
    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    const movedEnough = Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD;

    if (!dragState.active) {
      if (!movedEnough) return;
      stage.setPointerCapture?.(event.pointerId);
      setDragState((prev) => ({ ...prev, active: true }));
    }

    setPan(clampPanPosition({
      panX: dragState.originX + deltaX,
      panY: dragState.originY + deltaY,
      gridWidth,
      gridHeight,
      zoom,
      stageWidth: stage.clientWidth,
      stageHeight: stage.clientHeight
    }));
  }

  function handlePointerUp(event) {
    if (finalizeAreaPaint(event.pointerId)) return;
    if (!dragState.pending && !dragState.active) return;
    const stage = stageRef.current;
    if (dragState.active) {
      stage?.releasePointerCapture?.(event.pointerId);
    }
    setDragState((prev) => ({ ...prev, active: false, pending: false, pointerId: null }));
  }

  return (
    <div className="animation-lab__map-only-preview" ref={wrapRef}>
      <TreeTuningPanel
        facility={selectedFacility}
        tuning={activeTreeTuningDisplay}
        displayBounds={activeTreeTuningBounds}
        disabled={!activeTreeTuningKey}
        onChange={handleTreeTuningChange}
        onReset={resetTreeTuning}
      />
      <section className="fieldmap300-map panel-card" style={mapStyle}>
        <div className="fieldmap300-map__header">
          <div className="fieldmap300-map__heading">
            <div className="fieldmap300-map__eyebrow">현재토지 가상 지도</div>
            <h3 className="fieldmap300-map__title">300평 과수 배치 미리보기</h3>
            <p className="fieldmap300-map__description">{guideText}</p>
          </div>
          <div className="fieldmap300-map__meta">
            <div className="fieldmap300-map__summary">식재수 {mapData.treePositions.length}주</div>
            <div className="fieldmap300-map__summary">픽셀수 {GRID_COLS * GRID_ROWS}칸</div>
            <div className={`fieldmap300-map__mode${selectedFacility ? ' is-install' : ''}`.trim()}>{modeLabel}</div>
          </div>
        </div>
        <div className="fieldmap300-map__stage-shell">
        <div
          ref={stageRef}
          className={`fieldmap300-map__stage${dragState.active ? ' is-dragging' : ''}${selectedFacility ? ' is-installing' : ''}`}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={() => {
              if (areaPaintState.active) finalizeAreaPaint(areaPaintState.pointerId);
              setHoverCellCoords(null);
              if (dragState.active || dragState.pending) handlePointerUp({ pointerId: dragState.pointerId });
            }}
          >
            <div
              className="fieldmap300-map__viewport"
              style={{ transform: `translate(${pan.x.toFixed(1)}px, ${pan.y.toFixed(1)}px)` }}
            >
              <div
                className="fieldmap300-map__grid-shell"
                style={{ transform: `translate(-50%, -50%) scale(${zoom.toFixed(3)})` }}
              >
                <div
                  className="fieldmap300-map__grid"
                  style={{
                    width: `${gridWidth}px`,
                    height: `${gridHeight}px`,
                    gridTemplateColumns: `repeat(${GRID_COLS}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, ${cellSize}px)`
                  }}
                >
                  {gridCells.map((cell) => {
                    const isSelected = selectedCellCoords?.x === cell.x && selectedCellCoords?.y === cell.y;
                    const treePreviewImageUrl = cell.type === CELL_TYPES.TREE
                      ? String(FIELD_MAP_300_FACILITY_IMAGE_URLS?.[previewImageKeyForTreeAge(cell.treeAge, previewToneForTreeCell(cell))] || '')
                      : '';
                    const resolvedGroundFacilityKey = String(
                      cell.groundFacilityKey || resolveDefaultGroundFacilityKeyForCell(mapData, cell.x, cell.y) || ''
                    );
                    const groundPreviewImageUrl = resolveGroundPreviewImageUrl(cell, mapData, cell.x, cell.y);
                    const objectTransform = resolveObjectTransform({
                      objectId: cell.facilityInstanceId,
                      facilityKey: cell.facilityKey,
                      objectTransformById,
                      itemTuningByKey: treeTuningByKey
                    });
                    const groundTuning = groundPreviewImageUrl
                      ? resolveObjectTransform({
                        objectId: cell.groundInstanceId,
                        facilityKey: resolvedGroundFacilityKey,
                        objectTransformById,
                        itemTuningByKey: treeTuningByKey
                      })
                      : null;
                    return (
                      <button
                        key={`${cell.x}-${cell.y}`}
                        type="button"
                        className={`${cell.className}${isSelected ? ' is-selected' : ''}`.trim()}
                        title={cell.title}
                        onMouseEnter={() => {
                          if (selectedFacility) handleAreaPaintPointerEnter(cell.x, cell.y);
                        }}
                        onFocus={() => {
                          if (selectedFacility) setHoverCellCoords({ x: cell.x, y: cell.y });
                        }}
                        onPointerDown={(event) => handleAreaPaintPointerDown(event, cell.x, cell.y)}
                        onPointerEnter={() => {
                          if (selectedFacility) handleAreaPaintPointerEnter(cell.x, cell.y);
                        }}
                        onPointerUp={(event) => {
                          if (isAreaGroundPainterSelected) {
                            event.preventDefault();
                            event.stopPropagation();
                            finalizeAreaPaint(event.pointerId);
                          }
                        }}
                        onClick={() => handleCellClick(cell.x, cell.y)}
                      >
                        {groundPreviewImageUrl ? (
                          <img
                            src={groundPreviewImageUrl}
                            alt=""
                            className="fieldmap300-map__cell-ground-image"
                            style={createItemArtStyle(groundTuning)}
                            loading="eager"
                            decoding="async"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="fieldmap300-map__overlay-layer" aria-hidden="true">
                  {overlays.map((overlay) => (
                    <div
                      key={overlay.key}
                      className={`fieldmap300-map__overlay ${overlay.className}${overlay.isMatchingSelection ? ' is-matching-selection' : ''}`.trim()}
                      style={{
                        left: `${overlay.x * cellSize}px`,
                        top: `${overlay.y * cellSize}px`,
                        width: `${overlay.facility.width * cellSize}px`,
                        height: `${overlay.facility.height * cellSize}px`
                      }}
                    >
                      <div className="fieldmap300-map__overlay-transform" style={createItemArtStyle(overlay.transform)}>
                        <FacilityArt facility={overlay.facility} />
                      </div>
                    </div>
                  ))}
                </div>

                {placementGhost ? (
                  <div
                    className={`fieldmap300-map__ghost${placementGhost.isValid ? '' : ' is-invalid'}`.trim()}
                    style={{
                      left: `${placementGhost.left}px`,
                      top: `${placementGhost.top}px`,
                      width: `${placementGhost.width}px`,
                      height: `${placementGhost.height}px`
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>
          <div className="fieldmap300-map__legend" aria-hidden="true">
            <span>휠 확대</span>
            <span>드래그 이동</span>
            <span>클릭 선택</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function clampPanPosition({ panX, panY, gridWidth, gridHeight, zoom, stageWidth, stageHeight }) {
  const innerWidth = Math.max(0, Number(stageWidth || 0) - STAGE_PADDING);
  const innerHeight = Math.max(0, Number(stageHeight || 0) - STAGE_PADDING);
  const overflowX = Math.max(0, ((Number(gridWidth || 0) * zoom) - innerWidth) / 2);
  const overflowY = Math.max(0, ((Number(gridHeight || 0) * zoom) - innerHeight) / 2);
  return {
    x: Math.max(-overflowX, Math.min(overflowX, Number(panX || 0))),
    y: Math.max(-overflowY, Math.min(overflowY, Number(panY || 0)))
  };
}
