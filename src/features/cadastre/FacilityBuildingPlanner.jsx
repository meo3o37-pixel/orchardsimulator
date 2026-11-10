import React, { useEffect, useMemo, useRef, useState } from 'react';
import CadastreGround from './CadastreGround';
import CadastreDisplayControls from './CadastreDisplayControls';
import CadastreMapToolbar, { cadastreViewportEvents } from './CadastreMapToolbar';
import useCadastreViewport from './useCadastreViewport';
import { cadastreEditorTransform } from './cultivationZones';
import { facilityPlacementError, facilityPlacementGeometry, normalizeFacilitySites, requiresFacilityPlacement } from '../facility/facilityConstruction';
import FacilitySiteLayer from '../facility/FacilitySiteLayer';
import { FACILITIES_BY_TAB, FACILITY_TABS } from '../../config/sim/facilityCatalog';
import { constructionFacilityImageSrcOf } from '../map/ServiceOfficePanels';
import { polygonContainsPoint } from './cadastreData';
import { evChargerParking, evChargerSiteForSlot, evChargerSlotError } from './evChargerParking';
import FacilityAngleDial from './FacilityAngleDial';
import './FacilityBuildingPlanner.css';

const choices = Object.values(FACILITIES_BY_TAB).flat().filter(facility => requiresFacilityPlacement(facility) && !facility.baseProvided && facility.key !== 'farmPowerElectric' && !facility.key.startsWith('appleSortingLine'));

export default function FacilityBuildingPlanner({ field, cadastre, onFacilityLayoutSave }) {
  const svg = useRef(null);
  const transform = useMemo(() => cadastreEditorTransform(cadastre.boundaryPoints), [cadastre.boundaryPoints]);
  const [facilityKey, setFacilityKey] = useState(choices[0]?.key || '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!pickerOpen) return undefined;
    const previous = document.activeElement;
    searchRef.current?.focus();
    return () => previous?.focus?.();
  }, [pickerOpen]);
  const [center, setCenter] = useState(null);
  const [selectedSlotNo, setSelectedSlotNo] = useState(0);
  const [angle, setAngle] = useState(0);
  const [notice, setNotice] = useState('');
  const [pan, setPan] = useState(false);
  const viewport = useCadastreViewport(svg, Boolean(transform), pan);
  const sites = normalizeFacilitySites(field.facilitySites);
  const plans = Array.isArray(field.cadastreFacilityLayoutPlans) ? field.cadastreFacilityLayoutPlans : [];
  const facility = choices.find(item => item.key === facilityKey);
  const isEvCharger = facilityKey === 'evChargerStation';
  const parking = evChargerParking(field);
  const visibleChoices = choices.filter(item => (category === 'all' || FACILITIES_BY_TAB[category]?.some(row => row.key === item.key)) && `${item.name} ${item.desc || ''}`.toLocaleLowerCase('ko-KR').includes(query.trim().toLocaleLowerCase('ko-KR')));
  const draft = isEvCharger ? evChargerSiteForSlot(field, selectedSlotNo) : center && facility ? facilityPlacementGeometry(facilityKey, center, angle) : null;
  const reserved = plans.map(plan => ({ ...plan, status: 'building', startDay: 0, readyDay: 1 }));
  const error = draft ? evChargerSlotError(field, { ...draft, facilityKey }) || facilityPlacementError({ ...field, facilitySites: [...sites, ...reserved] }, cadastre.boundaryPoints, draft) : '';
  const points = polygon => polygon.map(point => { const p = transform.toSvg(point); return `${p.x},${p.y}`; }).join(' ');
  const choosePoint = event => {
    if (pan || !facility) return;
    const matrix = svg.current?.getScreenCTM(); if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const world = transform.toWorld(point);
    if (isEvCharger) {
      const slotIndex = parking?.bays.findIndex(bay => polygonContainsPoint(bay, world)) ?? -1;
      if (slotIndex < 0) { setNotice('파란 주차칸을 선택해 주세요. 충전소는 선택한 칸의 바깥쪽 가장자리에 배치됩니다.'); return; }
      setSelectedSlotNo(slotIndex + 1);
    } else setCenter(world);
    setNotice('');
  };
  const save = () => {
    if (!draft || error || !facility) return;
    const plan = { ...draft, id: `facility-layout:${Date.now()}:${Math.random().toString(36).slice(2,8)}`, facilityKey, name: facility.name };
    const result = onFacilityLayoutSave?.([...plans, plan]);
    setNotice(result?.message || '설계안을 저장하지 못했습니다.');
    if (result?.ok) { setCenter(null); setSelectedSlotNo(0); }
  };
  const remove = id => { const result = onFacilityLayoutSave?.(plans.filter(plan => plan.id !== id)); setNotice(result?.message || '설계안을 삭제하지 못했습니다.'); };
  return <section className="action-section cadastre-panel cadastre-editor" aria-label="시설·건물 설계">
    <h3>시설·건물 설계</h3>
    <p>시설을 고른 뒤 지도에서 위치를 정해 설계안을 저장하세요. 설계 저장은 건설·결제가 아닙니다.</p>
    <CadastreDisplayControls />
    <div className="cadastre-layout"><div className="cadastre-map-card">
      <div className="cadastre-map-card__grid" aria-hidden="true" />
      <div className="cadastre-editor__map-heading"><strong>{field.name || cadastre.parcelNo}</strong><span>시설·건물 배치</span></div>
      {transform && <CadastreMapToolbar viewport={viewport} label="시설·건물 지도" panMode={pan} onPanModeChange={setPan} />}
      {transform && <svg ref={svg} className={`cadastre-editor__canvas ${pan ? 'is-pannable' : 'is-editing'}`} viewBox={viewport.viewBox} {...cadastreViewportEvents(viewport)} onClick={choosePoint} role="img" aria-label="시설과 건물 배치 지도">
        <CadastreGround field={field} boundaryPoints={cadastre.boundaryPoints} transform={transform} zoomPercent={viewport.zoomPercent} />
        <FacilitySiteLayer field={field} transform={transform} />
        {isEvCharger && parking?.bays.map((bay, index) => <g key={index} pointerEvents="none"><polygon points={points(bay)} fill={selectedSlotNo === index + 1 ? '#79c9ef' : '#d8eff8'} fillOpacity=".65" stroke="#246f94" strokeWidth=".4" /><text x={transform.toSvg({ x: (bay[0].x + bay[2].x) / 2, y: (bay[0].y + bay[2].y) / 2 }).x} y={transform.toSvg({ x: (bay[0].x + bay[2].x) / 2, y: (bay[0].y + bay[2].y) / 2 }).y} textAnchor="middle" dominantBaseline="middle" fontSize="2.2" fill="#24516a">{index + 1}</text></g>)}
        {plans.map(plan => <polygon key={plan.id} points={points(plan.points)} fill="#79acc6" fillOpacity=".32" stroke="#246f94" strokeWidth=".45" strokeDasharray="1 .5" pointerEvents="none"><title>{plan.name} · 설계안</title></polygon>)}
        {draft && <polygon points={points(draft.points)} fill={error ? '#db8d86' : '#75b69a'} fillOpacity=".55" stroke={error ? '#a53632' : '#23664d'} strokeWidth=".55" pointerEvents="none" />}
      </svg>}
    </div><aside className="cadastre-editor__tools">
      <div className="cadastre-setting-card">
        <h4>새 설계안</h4>
        <button type="button" className="facility-building__choose" onClick={() => setPickerOpen(true)}><span>{facility ? <>{constructionFacilityImageSrcOf(facility.key) && <img src={constructionFacilityImageSrcOf(facility.key)} alt="" />}{facility.name}</> : '시설·건물 선택'}</span><strong>변경</strong></button>
        {!isEvCharger && <FacilityAngleDial value={angle} onChange={setAngle} />}
        <p>{isEvCharger ? parking ? `파란 주차칸을 누르면 충전소가 해당 칸 바깥쪽 가장자리에 배치됩니다.${selectedSlotNo ? ` 선택: ${selectedSlotNo}번 칸` : ''}` : '주차장 설계에서 주차칸을 먼저 정해 주세요.' : '지도에서 위치를 선택하세요. 파란 점선은 저장된 설계안입니다.'}</p>
      </div>
      {error && <p className="cadastre-editor__error" role="alert">{error}</p>}
      <button type="button" disabled={!draft || Boolean(error) || !field.owned} onClick={save}>설계안 저장</button>
      {notice && <p role="status">{notice}</p>}
      <h4>저장된 설계안</h4>
      {plans.length ? <div className="cadastre-editor__list">{plans.map(plan => <div className="cadastre-editor__row" key={plan.id}><span>{plan.name}</span><button type="button" onClick={() => remove(plan.id)} aria-label={`${plan.name} 설계안 삭제`}>삭제</button></div>)}</div> : <p className="cadastre-editor__empty">저장된 설계안이 없습니다.</p>}
      <h4>배치된 시설·건물</h4>
      {sites.length ? <div className="cadastre-editor__list">{sites.map(site => <div className="cadastre-editor__row" key={site.id}><span>{site.name}</span><small>{site.status === 'building' ? '건설 중' : '완공'}</small></div>)}</div> : <p className="cadastre-editor__empty">배치된 시설·건물이 없습니다.</p>}
    </aside></div>
    {pickerOpen && <div className="facility-building__backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setPickerOpen(false); }}>
      <section ref={dialogRef} className="facility-building__picker" role="dialog" aria-modal="true" aria-label="설계할 시설·건물 선택" onKeyDown={event => {
        if (event.key === 'Escape') { event.stopPropagation(); setPickerOpen(false); }
        if (event.key !== 'Tab') return;
        const focusable = [...dialogRef.current.querySelectorAll('button:not(:disabled),input:not(:disabled)')];
        if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1)?.focus(); }
        else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0]?.focus(); }
      }}>
        <header><div><h3>설계할 시설·건물 선택</h3><p>이름을 검색하거나 종류별로 골라보세요.</p></div><button type="button" onClick={() => setPickerOpen(false)} aria-label="선택 창 닫기">닫기</button></header>
        <input ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="시설·건물 이름 검색" aria-label="시설·건물 검색" />
        <nav aria-label="시설 분류"><button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>전체</button>{FACILITY_TABS.filter(([key]) => choices.some(item => FACILITIES_BY_TAB[key]?.some(row => row.key === item.key))).map(([key,label]) => <button key={key} type="button" aria-pressed={category === key} onClick={() => setCategory(key)}>{label}</button>)}</nav>
        <div className="facility-building__choices">{visibleChoices.map(item => { const image = constructionFacilityImageSrcOf(item.key); return <button key={item.key} type="button" className="facility-building__card" aria-pressed={facilityKey === item.key} onClick={() => { setFacilityKey(item.key); setCenter(null); setSelectedSlotNo(0); setNotice(''); setPickerOpen(false); }}><span className="facility-building__image">{image ? <img src={image} alt="" loading="lazy" /> : <span aria-hidden="true">🏗️</span>}</span><strong>{item.name}</strong><small>{item.desc}</small></button>; })}</div>
        {!visibleChoices.length && <p className="facility-building__empty">검색 결과가 없습니다.</p>}
      </section>
    </div>}
  </section>;
}
