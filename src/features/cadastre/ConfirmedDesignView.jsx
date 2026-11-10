import React, { useMemo, useRef } from 'react';
import CadastreGround from './CadastreGround';
import CadastreDisplayControls from './CadastreDisplayControls';
import CadastreMapToolbar, { cadastreViewportEvents } from './CadastreMapToolbar';
import { cadastreEditorTransform, normalizeCultivationZones } from './cultivationZones';
import { generatePlantingPreview } from './plantingDesign';
import { parkingGeometry } from './openParking';
import { yardGeometry } from './openYard';
import { normalizeFacilitySites } from '../facility/facilityConstruction';
import { isIrrigationMainBuried } from './orchardInfrastructure';
import { DEFAULT_SCAFFOLD_SPACING_M } from '../../config/items/consumableMaterial';
import useCadastreViewport from './useCadastreViewport';
import './ConfirmedDesignView.css';

const validPath = points => Array.isArray(points) && points.length >= 2 && points.every(point => Number.isFinite(point?.x) && Number.isFinite(point?.y));
const validFootprint = points => validPath(points) && points.length >= 3;

export default function ConfirmedDesignView({ field, cadastre, zones: rawZones = [] }) {
  const svg = useRef(null);
  const zones = useMemo(() => normalizeCultivationZones(rawZones), [rawZones]);
  const transform = useMemo(() => cadastreEditorTransform(cadastre.boundaryPoints), [cadastre.boundaryPoints]);
  const viewport = useCadastreViewport(svg, Boolean(transform), true);
  const points = values => values.map(point => { const p = transform.toSvg(point); return `${p.x},${p.y}`; }).join(' ');
  const treePath = values => values.map(point => { const p = transform.toSvg(point), r = .13; return `M${p.x-r},${p.y}a${r},${r} 0 1,0 ${2*r},0a${r},${r} 0 1,0 ${-2*r},0`; }).join(' ');
  const planting = useMemo(() => zones.filter(zone => zone.kind === 'farm' && zone.planting?.variety).map(zone => {
    const preview = generatePlantingPreview(zone.points, zone.planting, field.drainage?.routes || []);
    return { id: zone.id, rows: preview?.rows || [], treePath: treePath(preview?.trees || []) };
  }), [zones, field.drainage, transform]);
  const trellis = field.orchardInfrastructure?.trellis;
  const irrigation = field.orchardInfrastructure?.irrigation;
  const irrigationMainBuried = isIrrigationMainBuried(irrigation?.settings);
  const routes = (field.drainage?.routes || []).filter(route => validPath(route.points));
  const parking = parkingGeometry(field.cadastreParkingPlan?.plan || field.openParking);
  const yard = yardGeometry(field.cadastreYardPlan?.plan || field.openYard);
  const facilityPlans = (Array.isArray(field.cadastreFacilityLayoutPlans) ? field.cadastreFacilityLayoutPlans : []).filter(plan => validFootprint(plan.points));
  const plannedIds = new Set(facilityPlans.map(plan => plan.id));
  const facilitySites = normalizeFacilitySites(field.facilitySites).filter(site => validFootprint(site.points) && !plannedIds.has(site.id));
  const irrigationSource = [...facilitySites, ...facilityPlans].find(site => String(site.id) === String(irrigation?.sourceId));
  const electricRoutes = (field.cadastreElectricPlan?.routes || []).filter(route => validPath(route.points));
  const roadRoutes = (field.cadastreRoadPlan?.routes || []).filter(route => validPath(route.points));
  const planItems = [
    ...zones.filter(zone => zone.points?.length >= 3).map(zone => ({ key: `zone-${zone.id}`, type: '재배구역·식재', name: zone.name, detail: zone.planting?.variety ? `${zone.planting.variety} 식재 계획` : '구역 경계 확정' })),
    ...(trellis?.rows || []).filter(row => validPath(row.points)).map(row => ({ key: `trellis-${row.key}`, type: '지주시설', name: row.name, detail: `비계파이프 최대 ${trellis.settings?.spacing ?? DEFAULT_SCAFFOLD_SPACING_M}m 간격 · 와이어 ${trellis.settings?.wires ?? 3}단` })),
    ...(irrigation?.rows || []).filter(row => validPath(row.points)).map(row => ({ key: `irrigation-${row.key}`, type: '관수시설', name: row.name, detail: `${irrigation.settings?.method === 'drip' ? '주관 연결 점적호스' : irrigation.settings?.method === 'micro' ? '열별 32mm 주관 · 미세살수' : '열별 32mm 주관 · 스프링클러'}${irrigation.settings?.mainPlacement === 'custom' ? ' · 직접 그린 주관' : ''}${irrigationMainBuried ? ' · 주관 땅속 매설' : irrigation.settings?.mainHeightM > 0 ? ` · 지면 위 ${irrigation.settings.mainHeightM}m` : ''}${irrigationSource ? ` · 수원 ${irrigationSource.name || irrigationSource.facilityKey}` : irrigation.awaitingWaterSource ? ' · 수원 미연결' : ''}` })),
    ...routes.map((route, index) => ({ key: `route-${route.id || index}`, type: route.type === 'pipe100' || route.type === 'pipe150' ? '유공관' : '배수로', name: `${route.type === 'pipe100' || route.type === 'pipe150' ? '유공관' : '배수로'} ${index + 1}`, detail: '경로 확정' })),
    ...(parking ? [{ key: 'parking', type: '노지 시설', name: '노지 주차장', detail: `${parking.plan.slots}칸` }] : []),
    ...(yard ? [{ key: 'yard', type: '노지 시설', name: '노지 야적창고', detail: `${yard.plan.width} × ${yard.plan.depth}m` }] : []),
    ...facilityPlans.map((plan, index) => ({ key: `facility-plan-${plan.id || index}`, type: '시설·건물', name: plan.name || plan.facilityKey || '시설 설계안', detail: '배치 설계 확정' })),
    ...facilitySites.map(site => ({ key: `facility-site-${site.id}`, type: '시설·건물', name: site.name || site.facilityKey, detail: site.status === 'building' ? '시공 중인 배치' : '완공된 배치' })),
    ...electricRoutes.map(route => ({ key: `electric-${route.targetId}`, type: '전기', name: route.targetName || '전기 연결', detail: `전봇대 ${(route.poles || []).length}개 · 전선 설계 확정` })),
    ...roadRoutes.map(route => ({ key: `road-${route.id}`, type: '도로', name: route.name || '도로 연결', detail: '도로 연결 설계 확정' }))
  ];
  const count = planItems.length;
  return <section className="action-section cadastre-panel cadastre-editor confirmed-design" aria-label="확정된 설계 현황">
    <h3>확정된 설계 현황</h3>
    <p>저장한 설계를 한 지도에 모았습니다. 실제 시공 상태는 실시간 탭에서 확인할 수 있습니다.</p>
    <CadastreDisplayControls />
    <div className="confirmed-design__layout"><div className="cadastre-map-card confirmed-design__map">
      <div className="cadastre-map-card__grid" aria-hidden="true" />
      <div className="cadastre-editor__map-heading"><strong>{field.name || cadastre.parcelNo}</strong><span>확정된 설계 {count}개 항목</span></div>
      <CadastreMapToolbar viewport={viewport} label="확정된 설계 지도" />
      <svg ref={svg} className="cadastre-editor__canvas is-pannable" viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)} role="img" aria-label="확정된 설계 종합 지도">
        <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zones={zones} zoomPercent={viewport.zoomPercent} />
        {zones.filter(zone => zone.points?.length >= 3).map(zone => <polygon key={zone.id} points={points(zone.points)} fill={zone.kind === 'farm' ? '#7acb9750' : '#d0ba8555'} stroke={zone.kind === 'farm' ? '#267c66' : '#8a7044'} strokeWidth="1.4" vectorEffect="non-scaling-stroke"><title>{zone.name}</title></polygon>)}
        {planting.map(plan => <g key={plan.id}><g fill="none" stroke="#378757" strokeWidth="1.2">{plan.rows.map((row, index) => validPath(row) && <polyline key={index} points={points(row)} vectorEffect="non-scaling-stroke" />)}</g><path d={plan.treePath} fill="#24583b" /></g>)}
        {routes.map(route => <polyline key={route.id} points={points(route.points)} fill="none" stroke={route.type === 'pipe100' || route.type === 'pipe150' ? '#7952a8' : '#287ea8'} strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
        {(trellis?.rows || []).filter(row => validPath(row.points)).map(row => <polyline key={row.key} points={points([row.points[0], row.points.at(-1)])} fill="none" stroke="#483b2f" strokeWidth="1.7" vectorEffect="non-scaling-stroke" />)}
        {validPath(irrigation?.header) && <polyline points={points(irrigation.header)} fill="none" stroke="#217ca8" strokeWidth="2.2" strokeDasharray={irrigationMainBuried ? '5 3' : undefined} vectorEffect="non-scaling-stroke" />}
        {(irrigation?.rows || []).filter(row => validPath(row.route || row.points)).map(row => <polyline key={row.key} points={points(row.route || [row.points[0], row.points.at(-1)])} fill="none" stroke={irrigation.settings?.method === 'drip' ? '#2d8a65' : '#217ca8'} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />)}
        {irrigation?.settings?.method !== 'drip' && (irrigation?.rows || []).map(row => <path key={`head-${row.key}`} d={(row.points || []).map(point => { const p = transform.toSvg(point), r = .32; return `M${p.x-r} ${p.y}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0`; }).join(' ')} fill="#217ca8" />)}
        {parking && <g><polygon points={points(parking.aisle)} fill="#aab1b5aa" /><polygon points={points(parking.parking)} fill="#e3c985aa" stroke="#8c7446" strokeWidth="1.4" vectorEffect="non-scaling-stroke" /></g>}
        {yard && <g><polygon points={points(yard.aisle)} fill="#aab1b5aa" /><polygon points={points(yard.storage)} fill="#ba9e79aa" stroke="#765b3e" strokeWidth="1.4" vectorEffect="non-scaling-stroke" /></g>}
        {facilityPlans.map((plan, index) => <polygon key={plan.id || index} points={points(plan.points)} fill="#79acc655" stroke="#246f94" strokeWidth="1.7" strokeDasharray="5 3" vectorEffect="non-scaling-stroke"><title>{plan.name || '시설 설계안'} · 배치 설계 확정</title></polygon>)}
        {facilitySites.map(site => <polygon key={site.id} points={points(site.points)} fill="#acb9ac88" stroke="#466755" strokeWidth="1.7" vectorEffect="non-scaling-stroke"><title>{site.name || '시설'} · {site.status === 'building' ? '시공 중' : '완공'}</title></polygon>)}
        {validPath(irrigation?.header) && irrigationSource && <circle cx={transform.toSvg(irrigation.header[0]).x} cy={transform.toSvg(irrigation.header[0]).y} r=".8" fill="#176f9a" stroke="#fff" strokeWidth=".25"><title>관수 수원 · {irrigationSource.name || irrigationSource.facilityKey}</title></circle>}
        {roadRoutes.map(route => <polyline key={`road-${route.id}`} points={points(route.points)} fill="none" stroke="#765238" strokeWidth="3" vectorEffect="non-scaling-stroke"><title>{route.name || '도로 연결'} · 도로 설계</title></polyline>)}
        {electricRoutes.map(route => <g key={`electric-${route.targetId}`}><polyline points={points(route.points)} fill="none" stroke="#b47b24" strokeWidth="2.4" vectorEffect="non-scaling-stroke"><title>{route.targetName || '전기 연결'} · 전선 설계</title></polyline>{(route.poles || []).map((pole, index) => <circle key={index} cx={transform.toSvg(pole).x} cy={transform.toSvg(pole).y} r=".45" fill="#9a6b2a" stroke="#fff" strokeWidth=".12" />)}</g>)}
      </svg>
    </div><aside className="confirmed-design__side" aria-label="확정된 설계 목록">
      <div className="confirmed-design__side-heading"><h4>확정된 설계</h4><span>{count}개 항목</span></div>
      {count ? <ul>{planItems.map(item => <li key={item.key}><span className="confirmed-design__type">{item.type}</span><strong>{item.name}</strong><small>{item.detail}</small></li>)}</ul> : <p>확정된 설계가 아직 없습니다.</p>}
    </aside></div>
    <div className="confirmed-design__legend"><span>▧ 재배구역·식재</span><span>━ 지주시설</span><span>━ 관수</span><span>━ 배수·유공관</span><span>▣ 노지 시설</span><span>▣ 시설·건물</span><span>━ 전기</span><span>━ 도로</span></div>
    {!count && <p className="confirmed-design__empty">확정된 설계가 아직 없습니다. 설계 탭에서 계획을 확정해 주세요.</p>}
  </section>;
}
