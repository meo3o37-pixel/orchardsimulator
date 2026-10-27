import React, { memo, useEffect, useMemo, useRef } from 'react';
import { visibleWeedChunks, weedAmount, weedChunkPlants, weedChunkSettings, weedGeometry, weedRandom, weedSeed, weedSpeciesForField, weedViewportBounds } from './weedLayout';

const imageLoads = new Map(), clusterSets = new Map(), chunks = new Map();
const MAX_CACHE_BYTES = 24 * 1024 * 1024;
let cacheBytes = 0;
const canvasOf = (size) => {
  const canvas = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(size,size) : document.createElement('canvas');
  canvas.width = canvas.height = size;
  return canvas;
};
function loadImage(src) {
  if (!imageLoads.has(src)) imageLoads.set(src,new Promise((resolve,reject) => {
    const image = new Image(); image.decoding = 'async'; image.onload = () => resolve(image); image.onerror = () => reject(new Error(`잡초 이미지 로드 실패: ${src}`)); image.src = src;
  }).catch((error) => { imageLoads.delete(src); throw error; }));
  return imageLoads.get(src);
}
function cached(key) {
  const item = chunks.get(key);
  if (item) { chunks.delete(key); chunks.set(key,item); }
  return item?.canvas;
}
function storeChunk(key,canvas) {
  const bytes = canvas.width * canvas.height * 4;
  const previous=chunks.get(key);
  if(previous){cacheBytes-=previous.bytes;chunks.delete(key);}
  chunks.set(key,{canvas,bytes}); cacheBytes += bytes;
  while (cacheBytes > MAX_CACHE_BYTES && chunks.size > 1) {
    const oldest = chunks.keys().next().value, item = chunks.get(oldest);
    chunks.delete(oldest); cacheBytes -= item.bytes; item.canvas.width = item.canvas.height = 0;
  }
}
export function createWeedClusterSprites(fieldId,images) {
  const key = String(fieldId);
  if (clusterSets.has(key)) return clusterSets.get(key);
  const sprites = images.map((_,primary) => {
    const canvas = canvasOf(128), ctx = canvas.getContext('2d'), random = weedRandom(weedSeed(`${fieldId}:cluster:${primary}`));
    for (let i=0;i<72;i++) {
      const angle = random()*Math.PI*2, radius = Math.sqrt(random())*.8, size = (.28+random()*.38)/2.6*128;
      const x = 64+Math.cos(angle)*radius/2.6*128, y = 64+Math.sin(angle)*radius/2.6*128;
      const rotation = random()*Math.PI*2, variant = random()<.8 ? primary : Math.floor(random()*images.length);
      const c = Math.cos(rotation), s = Math.sin(rotation);
      ctx.setTransform(c,s,-s,c,x,y); ctx.drawImage(images[variant],-size/2,-size/2,size,size);
    }
    return canvas;
  });
  clusterSets.set(key,sprites);
  // Only keep a few small field-specific overview stamps, not every visited farm.
  while (clusterSets.size>8) clusterSets.delete(clusterSets.keys().next().value);
  return sprites;
}
export function createWeedChunkJob(layout,fieldId,x,y,cover,size,images,clusters) {
  const canvas = canvasOf(size), ctx = canvas.getContext('2d');
  const coarse = size / layout.chunkMeters < 12;
  const plants = weedChunkPlants(layout,fieldId,x,y,cover,coarse);
  const scale = size/layout.chunkSize;
  ctx.imageSmoothingEnabled = true;
  return {canvas,ctx,plants,index:0,scale,left:x*layout.chunkSize,top:y*layout.chunkSize,sprites:coarse?clusters:images};
}
export function advanceWeedChunkJob(job,deadline) {
  const {ctx,plants,scale,sprites,left,top} = job;
  while (job.index<plants.length) {
    if (job.index%32===0 && performance.now()>=deadline) return false;
    const plant=plants[job.index++];
    const px = (plant.x-left)*scale, py = (plant.y-top)*scale, width = plant.width*scale;
    const c = Math.cos(plant.rotation), s = Math.sin(plant.rotation);
    ctx.setTransform(c*plant.flip,s*plant.flip,-s,c,px,py); ctx.globalAlpha = plant.alpha;
    ctx.drawImage(sprites[plant.variant],-width/2,-width/2,width,width);
  }
  return true;
}
export function paintWeedChunk(...args) {
  const job=createWeedChunkJob(...args); advanceWeedChunkJob(job,Infinity); return job.canvas;
}

export default memo(function CadastreWeeds({ fieldId, amount, areaPy, boundaryPoints, transform, exclusions = [] }) {
  const root = useRef(null), canvasRef = useRef(null);
  const cover = weedAmount(amount);
  const layout = useMemo(() => weedGeometry(boundaryPoints,transform,areaPy),[boundaryPoints,transform,areaPy]);
  const species = useMemo(() => weedSpeciesForField(fieldId),[fieldId]);
  useEffect(() => {
    const node = root.current, canvas = canvasRef.current, svg = node?.ownerSVGElement;
    if (!node || !canvas || !svg) return;
    if (!layout || !cover) { canvas.width=canvas.height=1; return; }
    let disposed = false, active = false, frame = 0, images = null, stamps = null, loading = false;
    const jobs = new Map();
    const holes = exclusions.map((points) => new Path2D(`M${points.trim().replace(/\s+/g,' L')} Z`));
    const schedule = () => { if (!disposed && active && !frame) frame = requestAnimationFrame(paint); };
    const paint = () => {
      frame = 0;
      if (disposed || !active || !svg.getClientRects().length) return;
      if (!images) {
        if (!loading) {
          loading = true;
          Promise.all(species.map(loadImage)).then((loaded) => { if (!disposed) { images=loaded; stamps=createWeedClusterSprites(fieldId,loaded); schedule(); } })
            .catch((error) => { if (!disposed) console.warn(error.message); });
        }
        return;
      }
      const matrix = svg.getScreenCTM();
      const view = weedViewportBounds(svg.getBoundingClientRect(),matrix);
      if (!view) return;
      const dpr = Math.min(2,window.devicePixelRatio||1), pixelsPerUnit = Math.hypot(matrix.a,matrix.b)*dpr;
      const limit = Math.min(1,1536/Math.max(view.width*pixelsPerUnit,view.height*pixelsPerUnit));
      const width = Math.max(1,Math.ceil(view.width*pixelsPerUnit*limit)), height = Math.max(1,Math.ceil(view.height*pixelsPerUnit*limit));
      node.setAttribute('x',view.x); node.setAttribute('y',view.y); node.setAttribute('width',view.width); node.setAttribute('height',view.height);
      if (canvas.width!==width) canvas.width=width;
      if (canvas.height!==height) canvas.height=height;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,width,height);
      ctx.setTransform(width/view.width,0,0,height/view.height,-view.x*width/view.width,-view.y*height/view.height);
      const {layout:drawLayout,resolution} = weedChunkSettings(layout,view,pixelsPerUnit*limit);
      const meters=drawLayout.chunkMeters;
      const list = visibleWeedChunks(drawLayout,view), deadline = performance.now()+7;
      const visibleKeys=new Set(list.map((chunk)=>`${fieldId}:${layout.unitsPerMeter.toPrecision(10)}:${cover}:${meters}:${chunk.x}:${chunk.y}:${resolution}`));
      for(const [key,job] of jobs) if(!visibleKeys.has(key)){job.canvas.width=job.canvas.height=0;jobs.delete(key);}
      let pending = false, generated = 0;
      for (const chunk of list) {
        const prefix = `${fieldId}:${layout.unitsPerMeter.toPrecision(10)}:${cover}:${meters}:${chunk.x}:${chunk.y}:`;
        let tile = cached(prefix+resolution);
        if (!tile && generated<4 && performance.now()<deadline) {
          const key=prefix+resolution;
          let job=jobs.get(key);
          if(!job){job=createWeedChunkJob(drawLayout,fieldId,chunk.x,chunk.y,cover,resolution,images,stamps);jobs.set(key,job);}
          if(advanceWeedChunkJob(job,deadline)){tile=job.canvas;storeChunk(key,tile);jobs.delete(key);generated++;}
        }
        if (!tile) {
          pending = true;
          for (const fallback of [512,448,384,320,256,192,128,64]) { tile=cached(prefix+fallback); if (tile) break; }
        }
        if (tile) ctx.drawImage(tile,chunk.x*drawLayout.chunkSize,chunk.y*drawLayout.chunkSize,drawLayout.chunkSize,drawLayout.chunkSize);
      }
      // Erase all facility footprints, including overlapping exclusion polygons.
      ctx.globalCompositeOperation='destination-out';
      for (const hole of holes) ctx.fill(hole);
      ctx.globalCompositeOperation='source-over';
      node.setAttribute('data-weed-lod',resolution/meters<12?'clusters':'plants');
      if (pending) schedule();
    };
    const observer = new MutationObserver(schedule);
    observer.observe(svg,{attributes:true,attributeFilter:['viewBox']});
    const resize = new ResizeObserver(schedule); resize.observe(svg);
    const visibility = typeof IntersectionObserver==='function' ? new IntersectionObserver((entries) => {
      active=entries.some((entry) => entry.isIntersecting);
      if (active) schedule();
      else {
        if(frame)cancelAnimationFrame(frame); frame=0; canvas.width=canvas.height=1;
        for(const job of jobs.values())job.canvas.width=job.canvas.height=0;
        jobs.clear();
      }
    }) : null;
    if (visibility) visibility.observe(svg); else {active=true;schedule();}
    return () => { disposed=true; if(frame)cancelAnimationFrame(frame); observer.disconnect();resize.disconnect();visibility?.disconnect();for(const job of jobs.values())job.canvas.width=job.canvas.height=0;jobs.clear(); };
  },[layout,fieldId,cover,species,exclusions]);
  return <foreignObject ref={root} x="0" y="0" width="100" height="100" pointerEvents="none" style={{display:cover?'block':'none',overflow:'hidden'}}
    data-weed={cover} aria-label={`잡초 피복 ${cover}%`}>
    <canvas ref={canvasRef} xmlns="http://www.w3.org/1999/xhtml" width="1" height="1" style={{display:'block',width:'100%',height:'100%',pointerEvents:'none'}} />
  </foreignObject>;
});
