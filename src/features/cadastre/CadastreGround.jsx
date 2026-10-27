import {facilityFootprints}from'../facility/facilityConstruction';
import CadastreWeeds from './CadastreWeeds';
import React, { createContext, memo, useContext, useId, useMemo } from 'react';
import { drainageFootprintPaths, drainageLength } from './drainage';
import { SOIL_TYPES, soilProfileOf } from '../../utils/soil';
import coverageColors from './groundCoverageColors.json';
import snowColors from './groundSnowColors.json';
import { groundSeasonOf } from './groundSeason';

export const CadastreGroundContext = createContext({ day: 1, weather: '' });

const clamp = (value, max = 100) => Math.max(0, Math.min(max, Number(value) || 0));
const fixed = (value) => Number(value.toFixed(3));
const TERRAIN = '/images/cadastre-ground/coverage';
const SNOW = '/images/cadastre-ground/snow';
const SOIL_FILES = { sand: 'sand', sandyLoam: 'sandy-loam', loam: 'loam', clayLoam: 'clay-loam', clay: 'clay' };
const DETAIL = '/images/cadastre-ground/detail';
const DETAIL_LAYERS = [
  { key: 'soil-fine', size: 8.7, angle: 13 },
  { key: 'soil-crumb', size: 12.73, angle: -29 },
  { key: 'turf-fine', size: 7.43, angle: 41 },
  { key: 'turf-mixed', size: 11.61, angle: -17 }
];
const meanColor = (composition, lower, upper = lower, blend = 0) => `rgb(${[0, 1, 2].map((channel) => Math.round(SOIL_TYPES.reduce((sum, type) => {
  const colors = coverageColors[type.key];
  const value = colors[lower / 10][channel] * (1 - blend) + colors[upper / 10][channel] * blend;
  return sum + value * composition[type.key] / 100;
}, 0))).join(',')})`;
const surfaceImage = (key, level) => `${TERRAIN}/${SOIL_FILES[key]}-${String(level).padStart(3, '0')}.webp`;
const SURFACE_TILE_SIZE = 4;
function SurfacePattern({id,src,size,offset,angle=0}) {
  // Mirrored neighbours meet on identical source edges. A second rotated scale
  // softens the mirror motif without stretching a photograph across the land.
  return <pattern id={id} width={size*2} height={size*2} patternUnits="userSpaceOnUse"
    patternTransform={`translate(${offset} ${offset*.73}) rotate(${angle} 50 50)`}>
    <image href={src} width={size} height={size} preserveAspectRatio="none" />
    <image href={src} width={size} height={size} preserveAspectRatio="none" transform={`translate(${size*2} 0) scale(-1 1)`} />
    <image href={src} width={size} height={size} preserveAspectRatio="none" transform={`translate(0 ${size*2}) scale(1 -1)`} />
    <image href={src} width={size} height={size} preserveAspectRatio="none" transform={`translate(${size*2} ${size*2}) scale(-1 -1)`} />
  </pattern>;
}
const pointsPath = (points, transform) => points.map((point) => {
  const p = transform.toSvg(point);
  return `${fixed(p.x)},${fixed(p.y)}`;
}).join(' ');

export default memo(function CadastreGround({ field, boundaryPoints, transform, zones = [], zoomPercent = 100 }) {
  const id = `ground-${useId().replace(/:/g, '')}`;
  const environment = useContext(CadastreGroundContext);
  const season = groundSeasonOf(environment.day, environment.weather);
  const cover = season.greenCover, water = clamp(field?.water);
  const lower = Math.floor(cover / 10) * 10, upper = Math.min(100, lower + 10);
  const blend = (cover - lower) / 10;
  const detail = clamp((Math.max(100, Number(zoomPercent) || 100) - 100) / 200, 1);
  const textureOffset = (Math.abs(Number(field?.id) || 0) % 31) / 3;
  const soil = useMemo(() => soilProfileOf({ id: field?.id, soilComposition: field?.soilComposition }), [field?.id, field?.soilComposition]);
  const boundary = useMemo(() => pointsPath(boundaryPoints, transform), [boundaryPoints, transform]);
  const exclusions = useMemo(() => [
    ...facilityFootprints(field),
    ...(field?.openParking?.footprints || []),
    ...(field?.openYard?.footprints || []),
    ...zones.filter((zone) => zone.kind === 'building').map((zone) => zone.points),
    ...drainageFootprintPaths((field?.drainage?.routes || []).filter((route) => route.work > 0 && route.work + .01 >= drainageLength(route.points)))
  ].filter((points) => Array.isArray(points) && points.length >= 3).map((points) => pointsPath(points, transform)), [field?.facilitySites, field?.openParking, field?.openYard, field?.drainage, zones, transform]);
  const layers = useMemo(() => {
    let accumulated = 0;
    return SOIL_TYPES.filter((type) => soil.composition[type.key] > 0).map((type) => {
      const weight = soil.composition[type.key]; accumulated += weight;
      // Source-over alpha yields the area-weighted mixture of the soil textures.
      return { key: type.key, opacity: weight / accumulated };
    });
  }, [soil]);
  const baseColor = meanColor(soil.composition, 0);
  const snowColor = `rgb(${[0, 1, 2].map((channel) => Math.round(SOIL_TYPES.reduce((sum, type) => sum + snowColors[type.key][channel] * soil.composition[type.key] / 100, 0))).join(',')})`;
  const surfaceColor = meanColor(soil.composition, lower, upper, blend);
  const coarseShare = (soil.composition.sand + soil.composition.sandyLoam * .7 + soil.composition.loam * .4 + soil.composition.clayLoam * .2) / 100;
  const dry = clamp((25 - water) / 25, 1), wet = clamp((water - 65) / 35, 1);
  const clay = (soil.composition.clay + soil.composition.clayLoam * .45) / 100;
  const levels = [...new Set([0,lower,...(blend>0?[upper]:[])])];
  const surfaces = layers.flatMap((layer) => levels.map((level) => ({key:layer.key,level,src:surfaceImage(layer.key,level)})));
  if(season.isSnowing) for(const layer of layers) surfaces.push({key:layer.key,level:'snow',src:`${SNOW}/${SOIL_FILES[layer.key]}.webp`});
  const tileId = (key,level,variant) => `${id}-tile-${key}-${level}-${variant}`;
  const image = (key,level,opacity=1) => <g opacity={opacity}>
    <rect width="100" height="100" fill={`url(#${tileId(key,level,'a')})`} />
    <rect width="100" height="100" fill={`url(#${tileId(key,level,'b')})`} opacity=".24" />
  </g>;
  return <g pointerEvents="none" role="img" aria-label={`토지 바닥 · ${soil.dominant} 중심 · 수분 ${Math.round(water)} · ${season.label} 풀빛 ${Math.round(cover)}%`}
    data-cover={cover} data-water={water} data-cover-lower={lower} data-cover-upper={upper} data-cover-blend={fixed(blend)} data-detail={fixed(detail)} data-season={season.label} data-snow={season.snowOpacity} data-surface-tiling="mirrored" data-surface-tile-size={SURFACE_TILE_SIZE}>
    <defs>
      <clipPath id={`${id}-parcel`}><polygon points={boundary} /></clipPath>
      <mask id={`${id}-usable`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100" style={{ maskType: 'luminance' }}>
        <rect width="100" height="100" fill="white" />
        {exclusions.map((points, i) => <polygon key={i} points={points} fill="black" />)}
      </mask>
      {surfaces.flatMap((surface) => [
        <SurfacePattern key={`${surface.key}-${surface.level}-a`} id={tileId(surface.key,surface.level,'a')} src={surface.src} size={SURFACE_TILE_SIZE} offset={textureOffset} />,
        <SurfacePattern key={`${surface.key}-${surface.level}-b`} id={tileId(surface.key,surface.level,'b')} src={surface.src} size={SURFACE_TILE_SIZE*Math.SQRT2} offset={textureOffset+1.7} angle={37} />
      ])}
      {DETAIL_LAYERS.map((layer) => <pattern key={layer.key} id={`${id}-${layer.key}`} width={layer.size} height={layer.size} patternUnits="userSpaceOnUse"
        patternTransform={`translate(${textureOffset} ${textureOffset * .73}) rotate(${layer.angle} 50 50)`}>
        <image href={`${DETAIL}/${layer.key}.webp`} width={layer.size} height={layer.size} preserveAspectRatio="none" />
      </pattern>)}
      {season.isSnowing && <pattern id={`${id}-snow-detail`} width="8.11" height="8.11" patternUnits="userSpaceOnUse" patternTransform={`translate(${textureOffset} 0) rotate(-23 50 50)`}>
        <image href={`${SNOW}/snow-detail.webp`} width="8.11" height="8.11" />
      </pattern>}
    </defs>
    <g clipPath={`url(#${id}-parcel)`} style={{ isolation: 'isolate' }}>
      <rect width="100" height="100" fill={baseColor} />
      <g>{layers.map((layer) => <g key={layer.key} opacity={layer.opacity}>{image(layer.key, 0)}</g>)}</g>
      {cover > 0 && <g mask={`url(#${id}-usable)`}>
        <rect width="100" height="100" fill={surfaceColor} />
        <g>
          {layers.map((layer) => <g key={layer.key} opacity={layer.opacity}>
            {image(layer.key, lower)}
            {blend > 0 && image(layer.key, upper, blend)}
          </g>)}
        </g>
      </g>}
      <g style={{ mixBlendMode: 'soft-light' }} opacity={.12 + detail * .18}>
        <rect width="100" height="100" fill={`url(#${id}-soil-fine)`} opacity={.8 - coarseShare * .3} />
        <rect width="100" height="100" fill={`url(#${id}-soil-crumb)`} opacity={.25 + coarseShare * .35} />
      </g>
      {cover > 0 && <g mask={`url(#${id}-usable)`} style={{ mixBlendMode: 'soft-light' }} opacity={cover / 100 * (.08 + detail * .2)}>
        <rect width="100" height="100" fill={`url(#${id}-turf-fine)`} opacity=".65" />
        <rect width="100" height="100" fill={`url(#${id}-turf-mixed)`} opacity=".35" />
      </g>}
      <rect width="100" height="100" fill="#f4dfb2" opacity={dry * .23} />
      <rect width="100" height="100" fill="#c2a16b" opacity={season.dormantTint} />
      {dry * clay * (1 - cover / 100) > .01 && <path d="M14 48L22 43 28 45 33 39 40 41 46 35M28 45L30 55 37 59M33 39L31 30M61 66L68 62 76 65 83 59M68 62L66 52M76 65L73 76"
        fill="none" stroke="#593d2b" strokeWidth=".13" opacity={dry * clay * (1 - cover / 100) * .45} />}
      <rect width="100" height="100" fill="#302316" opacity={wet * .36} />
      {wet > 0 && <path d="M9 28Q18 17 30 25T52 28Q57 43 41 47T17 42ZM59 66Q71 53 86 61T92 81Q76 90 61 80Z" fill="#3d3020" opacity={wet * .13} />}
      <CadastreWeeds fieldId={field?.id} amount={field?.weed} areaPy={field?.py} boundaryPoints={boundaryPoints} transform={transform} exclusions={exclusions} />
      {season.isSnowing && <g opacity={season.snowOpacity} style={{ isolation: 'isolate' }}>
        <rect width="100" height="100" fill={snowColor} />
        <g>
          {layers.map((layer) => <g key={layer.key} opacity={layer.opacity}>{image(layer.key,'snow')}</g>)}
        </g>
        <rect width="100" height="100" fill={`url(#${id}-snow-detail)`} style={{ mixBlendMode: 'soft-light' }} opacity={.1 + detail * .15} />
      </g>}
    </g>
    <polygon className="cadastre-real-boundary__polygon" points={boundary} style={{ fill: 'none' }} />
  </g>;
});
