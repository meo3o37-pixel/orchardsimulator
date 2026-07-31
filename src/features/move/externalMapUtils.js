import externalMapData from '../../data/external-map-data.json';

const clampNumber = (value, min, max) => Math.min(Math.max(Number(value) || 0, min), max);

export const EXTERNAL_MAP_BASE_WIDTH_KM = 358.89;
export const EXTERNAL_MAP_TARGET_WIDTH_KM = 60;
export const EXTERNAL_MAP_COORD_SCALE = EXTERNAL_MAP_TARGET_WIDTH_KM / EXTERNAL_MAP_BASE_WIDTH_KM;
export const EXTERNAL_MAP_MIN_ZOOM = 0.8;
export const EXTERNAL_MAP_TOWN_MOVE_MIN_ZOOM = 0.25;
export const EXTERNAL_MAP_MAX_ZOOM = 10.0;
export const EXTERNAL_MAP_OPEN_DEFAULT_ZOOM = 3.2;
export const EXTERNAL_MAP_TOWN_MOVE_DEFAULT_ZOOM = 0.5;
export const EXTERNAL_MAP_PAN_SPEED = 1.9;
export const EXTERNAL_MAP_LEGACY_MAX_X = 170;
export const EXTERNAL_MAP_LEGACY_MAX_Y = 110;
export const EXTERNAL_MAP_MAX_X = EXTERNAL_MAP_LEGACY_MAX_X * EXTERNAL_MAP_COORD_SCALE;
export const EXTERNAL_MAP_MAX_Y = EXTERNAL_MAP_LEGACY_MAX_Y * EXTERNAL_MAP_COORD_SCALE;
export const EXTERNAL_MAP_BOUNDS_PADDING = 4 * EXTERNAL_MAP_COORD_SCALE;
export const EXTERNAL_MAP_VIEW_SCALE_DENOM = 100 * EXTERNAL_MAP_COORD_SCALE;
export const EXTERNAL_MAP_IMAGE_ASPECT_RATIO = 1536 / 1024;

export const scaleExternalMapCoord = (value) => Number((Number(value || 0) * EXTERNAL_MAP_COORD_SCALE).toFixed(2));

export const normalizeExternalCoordMaybeLegacy = (value, axis = 'x') => {
  const n = Number(value);
  if (!Number.isFinite(n)) return NaN;
  const scaledMax = axis === 'y' ? EXTERNAL_MAP_MAX_Y : EXTERNAL_MAP_MAX_X;
  const legacyMax = axis === 'y' ? EXTERNAL_MAP_LEGACY_MAX_Y : EXTERNAL_MAP_LEGACY_MAX_X;
  if (Math.abs(n) <= (scaledMax + 0.01)) return n;
  if (Math.abs(n) <= (legacyMax + 0.01)) return scaleExternalMapCoord(n);
  return n;
};

export const normalizeExternalMapPoint = (point) => {
  if (!Array.isArray(point) || point.length < 2) return null;
  const x = Number(point[0]);
  const y = Number(point[1]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return {
    x: normalizeExternalCoordMaybeLegacy(x, 'x'),
    y: normalizeExternalCoordMaybeLegacy(y, 'y')
  };
};

export const normalizeExternalMapStrokeList = (list, prefix, minPoints) => {
  const src = Array.isArray(list) ? list : [];
  return src
    .map((line, idx) => {
      const points = (Array.isArray(line) ? line : [])
        .map((point) => normalizeExternalMapPoint(point))
        .filter(Boolean);
      if (points.length < minPoints) return null;
      return { id: `${prefix}-${idx + 1}`, points };
    })
    .filter(Boolean);
};

export const normalizeExternalMapMarkerList = (list) => {
  const src = Array.isArray(list) ? list : [];
  return src
    .map((item, idx) => {
      const x = Number(item?.x);
      const y = Number(item?.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      const markerType = (() => {
        const rawType = String(item?.type || item?.markerType || '').trim().toLowerCase();
        if (rawType === 'city' || rawType === 'small-city' || rawType === 'smallcity') return 'city';
        if (rawType === 'village' || rawType === 'town') return 'village';
        if (/소도시/.test(String(item?.name || ''))) return 'city';
        return idx === 1 ? 'city' : 'village';
      })();
      return {
        id: `marker-${idx + 1}`,
        type: markerType,
        name: String(item?.name || (markerType === 'city' ? '소도시' : `마을 ${idx + 1}`)),
        x: normalizeExternalCoordMaybeLegacy(x, 'x'),
        y: normalizeExternalCoordMaybeLegacy(y, 'y')
      };
    })
    .filter(Boolean);
};

export const normalizeExternalMapFieldMarkerList = (list) => {
  const src = Array.isArray(list) ? list : [];
  return src
    .map((item) => {
      const fieldId = String(item?.fieldId || '');
      const x = Number(item?.x);
      const y = Number(item?.y);
      if (!fieldId || !Number.isFinite(x) || !Number.isFinite(y)) return null;
      return {
        fieldId,
        x: Number(clampNumber(normalizeExternalCoordMaybeLegacy(x, 'x'), -EXTERNAL_MAP_MAX_X, EXTERNAL_MAP_MAX_X).toFixed(2)),
        y: Number(clampNumber(normalizeExternalCoordMaybeLegacy(y, 'y'), -EXTERNAL_MAP_MAX_Y, EXTERNAL_MAP_MAX_Y).toFixed(2))
      };
    })
    .filter(Boolean);
};

export const DEFAULT_EXTERNAL_MAP_BOUNDS = Object.freeze({
  minX: -180 * EXTERNAL_MAP_COORD_SCALE,
  maxX: 180 * EXTERNAL_MAP_COORD_SCALE,
  minY: -120 * EXTERNAL_MAP_COORD_SCALE,
  maxY: 120 * EXTERNAL_MAP_COORD_SCALE
});

export const buildExternalMapBounds = ({
  contours = [],
  roads = [],
  rivers = [],
  markers = [],
  fieldPoints = []
} = {}) => {
  const points = [];
  [contours, roads, rivers].forEach((lines) => {
    (Array.isArray(lines) ? lines : []).forEach((line) => {
      (Array.isArray(line?.points) ? line.points : []).forEach((point) => points.push(point));
    });
  });
  (Array.isArray(markers) ? markers : []).forEach((marker) => points.push(marker));
  (Array.isArray(fieldPoints) ? fieldPoints : []).forEach((point) => points.push(point));
  if (!points.length) return { ...DEFAULT_EXTERNAL_MAP_BOUNDS };
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  points.forEach((point) => {
    const x = Number(point?.x);
    const y = Number(point?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });
  if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) {
    return { ...DEFAULT_EXTERNAL_MAP_BOUNDS };
  }
  return {
    minX: minX - EXTERNAL_MAP_BOUNDS_PADDING,
    maxX: maxX + EXTERNAL_MAP_BOUNDS_PADDING,
    minY: minY - EXTERNAL_MAP_BOUNDS_PADDING,
    maxY: maxY + EXTERNAL_MAP_BOUNDS_PADDING
  };
};

export const expandBoundsToAspectRatio = (
  bounds = DEFAULT_EXTERNAL_MAP_BOUNDS,
  targetAspectRatio = EXTERNAL_MAP_IMAGE_ASPECT_RATIO
) => {
  const minX = Number(bounds?.minX);
  const maxX = Number(bounds?.maxX);
  const minY = Number(bounds?.minY);
  const maxY = Number(bounds?.maxY);
  const ratio = Number(targetAspectRatio);
  if (![minX, maxX, minY, maxY, ratio].every(Number.isFinite) || ratio <= 0) {
    return { ...DEFAULT_EXTERNAL_MAP_BOUNDS };
  }
  const width = Math.max(0.0001, maxX - minX);
  const height = Math.max(0.0001, maxY - minY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const currentRatio = width / height;
  if (Math.abs(currentRatio - ratio) < 0.000001) {
    return { minX, maxX, minY, maxY };
  }
  if (currentRatio < ratio) {
    const nextWidth = height * ratio;
    const halfWidth = nextWidth / 2;
    return {
      minX: centerX - halfWidth,
      maxX: centerX + halfWidth,
      minY,
      maxY
    };
  }
  const nextHeight = width / ratio;
  const halfHeight = nextHeight / 2;
  return {
    minX,
    maxX,
    minY: centerY - halfHeight,
    maxY: centerY + halfHeight
  };
};

export const projectExternalMapPointToPercent = (point, bounds = DEFAULT_EXTERNAL_MAP_BOUNDS) => {
  const minX = Number(bounds?.minX);
  const maxX = Number(bounds?.maxX);
  const minY = Number(bounds?.minY);
  const maxY = Number(bounds?.maxY);
  const width = Math.max(0.0001, maxX - minX);
  const height = Math.max(0.0001, maxY - minY);
  const x = clampNumber((((Number(point?.x) || 0) - minX) / width) * 100, 0, 100);
  const y = clampNumber((((Number(point?.y) || 0) - minY) / height) * 100, 0, 100);
  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2))
  };
};

export const externalMapPathPercentFromPoints = (points, bounds = DEFAULT_EXTERNAL_MAP_BOUNDS, close = false) => {
  const rows = (Array.isArray(points) ? points : [])
    .map((point) => projectExternalMapPointToPercent(point, bounds))
    .filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y));
  if (!rows.length) return '';
  const first = rows[0];
  const rest = rows.slice(1).map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${rest}${close ? ' Z' : ''}`;
};

export const EXTERNAL_MAP_PRESET = (() => {
  const raw = externalMapData && typeof externalMapData === 'object' ? externalMapData : {};
  const zoom = clampNumber(EXTERNAL_MAP_OPEN_DEFAULT_ZOOM, EXTERNAL_MAP_MIN_ZOOM, EXTERNAL_MAP_MAX_ZOOM);
  const centerX = Number(raw?.meta?.center?.x);
  const centerY = Number(raw?.meta?.center?.y);
  const fieldMarkers = normalizeExternalMapFieldMarkerList(raw?.fieldMarkers);
  const fieldMarkerPointByFieldId = fieldMarkers.reduce((acc, item) => {
    acc[item.fieldId] = { x: item.x, y: item.y };
    return acc;
  }, {});
  return {
    zoom,
    center: {
      x: Number.isFinite(centerX) ? normalizeExternalCoordMaybeLegacy(centerX, 'x') : 0,
      y: Number.isFinite(centerY) ? normalizeExternalCoordMaybeLegacy(centerY, 'y') : 0
    },
    contours: normalizeExternalMapStrokeList(raw?.lands ?? raw?.contours, 'preset-land', 3),
    roads: normalizeExternalMapStrokeList(raw?.roads, 'preset-road', 2),
    rivers: normalizeExternalMapStrokeList(raw?.rivers, 'preset-river', 2),
    markers: normalizeExternalMapMarkerList(raw?.markers),
    fieldMarkerPointByFieldId
  };
})();

export const EXTERNAL_MAP_PRESET_FIELD_ID_SET = new Set(Object.keys(EXTERNAL_MAP_PRESET?.fieldMarkerPointByFieldId || {}));
