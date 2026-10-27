import React from 'react';
import {normalizeFacilitySites}from'./facilityConstruction';
export default function FacilitySiteLayer({field,transform,day=1}){
 return <g className="facility-site-layer">{normalizeFacilitySites(field.facilitySites).map(site=>{
  const p=site.points.map(transform.toSvg),cx=p.reduce((s,v)=>s+v.x,0)/p.length,cy=p.reduce((s,v)=>s+v.y,0)/p.length,building=site.status==='building';
  return <g key={site.id} aria-label={`${site.name} · ${building?'건설 중':'완공'}`}><polygon points={p.map(v=>`${v.x},${v.y}`).join(' ')} fill={building?'#edd7a8':'#acb9ac'} stroke={building?'#9c7435':'#466755'} strokeWidth=".3" strokeDasharray={building?'1 .6':undefined}/><path d={`M${p[0].x},${p[0].y}L${p[2].x},${p[2].y}M${p[1].x},${p[1].y}L${p[3].x},${p[3].y}`} stroke={building?'#b4955b':'#637f70'} strokeWidth=".15"/><text x={cx} y={cy} textAnchor="middle" fontSize="1.25" fill="#274b38" stroke="#fffaf0" strokeWidth=".45" paintOrder="stroke">{site.name}</text>{building&&<text x={cx} y={cy+1.8} textAnchor="middle" fontSize="1.2" fill="#825512" stroke="#fffaf0" strokeWidth=".45" paintOrder="stroke">건설 중 · {Math.max(0,site.readyDay-day)}일 남음</text>}<title>{site.name} · {building?'외주 시공 중':'완공'}</title></g>;
 })}</g>;
}
