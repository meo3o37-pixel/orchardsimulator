const SQM_PER_PY = 3.305785;
const PY_PER_SQKM = 1000000 / SQM_PER_PY;

export const formatCadastrePyAreaLabel = (py = 0) => {
  const value = Math.max(0, Number(py) || 0);
  if (value >= 10000) return `${(value / 10000).toFixed(1)}만평`;
  if (value >= 1000) return `${Math.round(value).toLocaleString()}평`;
  if (value >= 10) return `${Math.round(value).toLocaleString()}평`;
  return `${value.toFixed(1)}평`;
};

export const normalizeCadastreBoundaryPoints = (points = []) => (
  (Array.isArray(points) ? points : [])
    .map((point) => ({
      x: Number(point?.x) || 0,
      y: Number(point?.y) || 0
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
);

export const polygonAreaSqKmFromPoints = (points = []) => {
  const arr = normalizeCadastreBoundaryPoints(points);
  if (arr.length < 3) return 0;
  let sum = 0;
  for (let index = 0; index < arr.length; index += 1) {
    const current = arr[index];
    const next = arr[(index + 1) % arr.length];
    sum += (current.x * next.y) - (next.x * current.y);
  }
  return Math.abs(sum) / 2;
};

export const polygonAreaPyFromPoints = (points = []) => (
  Math.max(0, polygonAreaSqKmFromPoints(points) * PY_PER_SQKM)
);

export const polygonBoundsFromPoints = (points = []) => {
  const arr = normalizeCadastreBoundaryPoints(points);
  if (!arr.length) return null;
  return arr.reduce((acc, point) => ({
    minX: Math.min(acc.minX, point.x),
    maxX: Math.max(acc.maxX, point.x),
    minY: Math.min(acc.minY, point.y),
    maxY: Math.max(acc.maxY, point.y)
  }), {
    minX: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY
  });
};

export const polygonContainsPoint = (points = [], point) => {
  const arr = normalizeCadastreBoundaryPoints(points);
  if (arr.length < 3 || !point) return false;
  const px = Number(point?.x) || 0;
  const py = Number(point?.y) || 0;
  let inside = false;
  for (let index = 0, previousIndex = arr.length - 1; index < arr.length; previousIndex = index, index += 1) {
    const xi = arr[index].x;
    const yi = arr[index].y;
    const xj = arr[previousIndex].x;
    const yj = arr[previousIndex].y;
    const intersects = ((yi > py) !== (yj > py))
      && (px < (((xj - xi) * (py - yi)) / ((yj - yi) || 1e-9)) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
};

export const cadastreBoundarySvgPointsOf = (boundaryPoints = [], options = {}) => {
  const points = normalizeCadastreBoundaryPoints(boundaryPoints);
  const bounds = polygonBoundsFromPoints(points);
  if (!bounds || points.length < 3) return '';
  const width = Math.max(1e-9, bounds.maxX - bounds.minX);
  const height = Math.max(1e-9, bounds.maxY - bounds.minY);
  const pad = Number.isFinite(Number(options.pad)) ? Number(options.pad) : 8;
  const drawWidth = 100 - (pad * 2);
  const drawHeight = 100 - (pad * 2);
  const scaleX = Math.min(drawWidth / width, drawHeight / height);
  const scaleY = scaleX;
  const renderedWidth = width * scaleX;
  const renderedHeight = height * scaleY;
  const offsetX = (100 - renderedWidth) / 2;
  const offsetY = (100 - renderedHeight) / 2;
  return points.map((point) => {
    const x = offsetX + ((point.x - bounds.minX) * scaleX);
    const y = offsetY + ((point.y - bounds.minY) * scaleY);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
};

export const resolveCadastreBoundaryByPoint = ({ contours = [], markerPoint = null } = {}) => {
  if (!markerPoint) return null;
  return (Array.isArray(contours) ? contours : []).find((item) => {
    const points = normalizeCadastreBoundaryPoints(item?.points);
    return points.length >= 3 && polygonContainsPoint(points, markerPoint);
  }) || null;
};

export const buildCadastreForField = ({
  selectedField = null,
  markerPoint = null,
  contours = []
} = {}) => {
  if (!selectedField) return null;
  const boundaryContour = resolveCadastreBoundaryByPoint({ contours, markerPoint });
  const boundaryPoints = normalizeCadastreBoundaryPoints(boundaryContour?.points || []);
  return {
    parcelNo: String(selectedField?.name || selectedField?.id || '토지'),
    boundaryContourId: String(boundaryContour?.id || ''),
    boundaryPoints,
    boundarySvgPoints: cadastreBoundarySvgPointsOf(boundaryPoints),
    boundaryWorkspaceSvgPoints: cadastreBoundarySvgPointsOf(boundaryPoints, { pad: 5 }),
    boundaryAreaPy: boundaryPoints.length >= 3 ? polygonAreaPyFromPoints(boundaryPoints) : 0
  };
};
