import { polygonAreaPyFromPoints, polygonContainsPoint } from './cadastreData.js';

export const WEED_CELL_METERS = 1.5;
export const WEED_CHUNK_METERS = 12;
export const WEED_PLANTS_PER_CELL = 72;
const GROUPS = ['grass', 'broadleaf', 'rosette', 'creeping', 'mixed'];
export const weedAmount = (value) => Math.round(Math.max(0, Math.min(100, Number(value) || 0)) * 10) / 10;

function hash(seed, x = 0, y = 0) {
  let h = Math.imul(seed ^ Math.imul(x, 374761393), 668265263) ^ Math.imul(y, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}
export function weedSeed(fieldId) {
  let seed = 2166136261;
  for (const char of `orchard-weeds-v1:${fieldId}`) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  return seed;
}
export function weedRandom(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
export function weedSpeciesForField(fieldId) {
  const random = weedRandom(weedSeed(fieldId));
  const all = GROUPS.flatMap((group) => Array.from({ length: 9 }, (_, i) => `/images/orchard-weeds/weed-${group}-${String(i + 1).padStart(2, '0')}.png`));
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return all.slice(0, 8);
}
export function weedGeometry(boundaryPoints, transform, rawPy) {
  if (typeof transform?.toSvg !== 'function' || !Array.isArray(boundaryPoints) || boundaryPoints.length < 3) return null;
  const points = boundaryPoints.map((p) => transform.toSvg(p));
  const area = Math.abs(points.reduce((sum, p, i) => { const q = points[(i + 1) % points.length]; return sum + p.x * q.y - q.x * p.y; }, 0)) / 2;
  const py = Number(rawPy) > 0 && Number.isFinite(Number(rawPy)) ? Number(rawPy) : polygonAreaPyFromPoints(boundaryPoints);
  if (!(area > 0 && py > 0)) return null;
  const unitsPerMeter = Math.sqrt(area / (py * 3.305785));
  return { points, unitsPerMeter, chunkMeters: WEED_CHUNK_METERS, chunkSize: unitsPerMeter * WEED_CHUNK_METERS,
    minX: Math.min(...points.map((p) => p.x)), maxX: Math.max(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)), maxY: Math.max(...points.map((p) => p.y)) };
}
export function weedViewportBounds(rect, matrix) {
  if (!rect || !matrix || !(rect.width > 0 && rect.height > 0)) return null;
  const {a,b,c,d,e,f} = matrix, determinant = a*d-b*c;
  if (![a,b,c,d,e,f,determinant].every(Number.isFinite) || Math.abs(determinant)<1e-12) return null;
  // preserveAspectRatio="meet" may reveal world space outside the nominal
  // square viewBox. Invert the actual CSS viewport, including that extra space.
  const corners = [[rect.left,rect.top],[rect.left+rect.width,rect.top],
    [rect.left,rect.top+rect.height],[rect.left+rect.width,rect.top+rect.height]].map(([px,py]) => ({
    x: (d*(px-e)-c*(py-f))/determinant,
    y: (-b*(px-e)+a*(py-f))/determinant
  }));
  const x = Math.min(...corners.map((p)=>p.x)), y = Math.min(...corners.map((p)=>p.y));
  return {x,y,width:Math.max(...corners.map((p)=>p.x))-x,height:Math.max(...corners.map((p)=>p.y))-y};
}
function segmentHitsRect(p, q, left, top, right, bottom) {
  let a = 0, b = 1;
  const dx = q.x - p.x, dy = q.y - p.y;
  for (const [s, t] of [[-dx, p.x-left], [dx, right-p.x], [-dy, p.y-top], [dy, bottom-p.y]]) {
    if (s === 0) { if (t < 0) return false; continue; }
    const r = t / s;
    if (s < 0) a = Math.max(a, r); else b = Math.min(b, r);
    if (a > b) return false;
  }
  return true;
}
export function visibleWeedChunks(layout, view) {
  if (!layout) return [];
  const size = layout.chunkSize;
  const left = Math.max(layout.minX, view.x), right = Math.min(layout.maxX, view.x + view.width);
  const top = Math.max(layout.minY, view.y), bottom = Math.min(layout.maxY, view.y + view.height);
  if (left >= right || top >= bottom) return [];
  const result = [];
  for (let y = Math.floor(top/size); y <= Math.floor(bottom/size); y++) for (let x = Math.floor(left/size); x <= Math.floor(right/size); x++) {
    const l = x*size, t = y*size, r = l+size, b = t+size;
    const inside = polygonContainsPoint(layout.points, { x:(l+r)/2, y:(t+b)/2 })
      || layout.points.some((p, i) => segmentHitsRect(p, layout.points[(i+1)%layout.points.length], l,t,r,b));
    if (inside) result.push({ x, y });
  }
  // Prioritise the centre while new chunks are painted in short frame budgets.
  return result.sort((a,b) => (a.x*size+size/2-view.x-view.width/2)**2+(a.y*size+size/2-view.y-view.height/2)**2
    - ((b.x*size+size/2-view.x-view.width/2)**2+(b.y*size+size/2-view.y-view.height/2)**2));
}
export function weedChunkSettings(layout, view, pixelsPerUnit) {
  const pixelsPerMeter = pixelsPerUnit * layout.unitsPerMeter;
  let meters;
  if (pixelsPerMeter >= 12) {
    // Smaller close-up chunks preserve native detail even on small farms at 800%.
    meters = 12 / 2**Math.max(0,Math.ceil(Math.log2(12*pixelsPerMeter/512)));
  } else {
    const span = Math.max(view.width,view.height)/layout.unitsPerMeter;
    meters = 12*2**Math.max(0,Math.ceil(Math.log2(span/144)));
  }
  const drawLayout = {...layout,chunkMeters:meters,chunkSize:meters*layout.unitsPerMeter};
  // 64px increments avoid allocating a 512px texture for a 257px region.
  const resolution = Math.max(64,Math.min(512,Math.ceil(drawLayout.chunkSize*pixelsPerUnit/64)*64));
  return {layout:drawLayout,resolution};
}
export function weedChunkPlants(layout, fieldId, chunkX, chunkY, amount, clustered = false) {
  const cover = weedAmount(amount);
  if (!layout || !cover) return [];
  const unit = layout.unitsPerMeter, meters = layout.chunkMeters || WEED_CHUNK_METERS;
  const left = chunkX * meters, top = chunkY * meters;
  const right = left + meters, bottom = top + meters, margin = 1.9;
  const seed = weedSeed(fieldId), result = [];
  const touches = (x,y,width) => x+width*.71 >= left && x-width*.71 <= right && y+width*.71 >= top && y-width*.71 <= bottom;
  for (let gy = Math.floor((top-margin)/WEED_CELL_METERS); gy <= Math.floor((bottom+margin)/WEED_CELL_METERS); gy++) {
    for (let gx = Math.floor((left-margin)/WEED_CELL_METERS); gx <= Math.floor((right+margin)/WEED_CELL_METERS); gx++) {
      const cellSeed = hash(seed,gx,gy), random = weedRandom(cellSeed);
      const cx = (gx+.5)*WEED_CELL_METERS+(random()-.5)*.5, cy = (gy+.5)*WEED_CELL_METERS+(random()-.5)*.5;
      const radius = .55+random()*.6, rank = random()*100;
      const primary = random()<.8 ? Math.floor(random()*5) : 5+Math.floor(random()*3), rotation = random()*Math.PI*2;
      if (clustered) {
        const alpha = Math.min(1,Math.max(0,(cover-rank)/2)), width = (radius*2+.66)*1.1;
        if (alpha && touches(cx,cy,width)) result.push({ id:`${gx}:${gy}`, kind:'cluster', x:cx*unit,y:cy*unit,width:width*unit,widthMeters:width,alpha,rotation,flip:1,variant:primary });
        continue;
      }
      for (let i=0; i<WEED_PLANTS_PER_CELL; i++) {
        // Independent per-plant seeds keep all positions stable when cover changes.
        const next = weedRandom(hash(cellSeed,i,17)), angle=next()*Math.PI*2, distance=Math.sqrt(next())*radius;
        const x=cx+Math.cos(angle)*distance, y=cy+Math.sin(angle)*distance;
        const width=.28+next()*.38, priority=(rank+(next()-.5)*10+100)%100;
        const rotation=next()*Math.PI*2, flip=next()<.5?-1:1, variant=next()<.8?primary:Math.floor(next()*8);
        const alpha=Math.min(1,Math.max(0,(cover-priority)/2));
        if (alpha && touches(x,y,width)) result.push({id:`${gx}:${gy}:${i}`,kind:'plant',x:x*unit,y:y*unit,width:width*unit,widthMeters:width,alpha,rotation,flip,variant});
      }
    }
  }
  return result;
}
