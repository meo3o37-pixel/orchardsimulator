import React, { useMemo } from 'react';
import { buildCadastreForField, formatCadastrePyAreaLabel } from './cadastreData';

const CADASTRE_ZONE_PRESETS = [
  { key: 'farm', icon: '🌱', label: '농지', ratio: 78, description: '식재·작업 동선 중심' },
  { key: 'building', icon: '🏗️', label: '건물 부지', ratio: 14, description: '하우징·창고·시설 배치' },
  { key: 'margin', icon: '🛤️', label: '진입/여유', ratio: 8, description: '진입로·완충 공간' }
];

const CADASTRE_PLANTING_DEFAULTS = [
  { label: '열 간격', value: '3.5m' },
  { label: '주 간격', value: '1.5m' },
  { label: '식재 각도', value: '41°' },
  { label: '경계 안쪽 여백', value: '1m' }
];

export default function CadastrePanel({
  className = '',
  selectedField = null,
  selectedFieldMarkerPoint = null,
  contours = []
}) {
  const cadastre = useMemo(() => {
    return buildCadastreForField({
      selectedField,
      markerPoint: selectedFieldMarkerPoint,
      contours
    });
  }, [contours, selectedField, selectedFieldMarkerPoint]);

  if (!cadastre) return null;

  return (
    <div className={`action-section cadastre-panel ${className}`.trim()}>
      <div className="section-subtitle">
        <h3>지적도</h3>
        <p>토지 경계, 구역 구성, 식재 설정을 한 화면에서 다룹니다.</p>
      </div>
      <div className="cadastre-layout">
        <div className="cadastre-map-card" aria-label={`${cadastre.parcelNo} 지적도 개요`}>
          <div className="cadastre-map-card__grid" aria-hidden="true" />
          {cadastre.boundaryWorkspaceSvgPoints ? (
            <div className="cadastre-real-boundary">
              <svg className="cadastre-real-boundary__svg" viewBox="0 0 100 100" role="img" aria-label={`${cadastre.parcelNo} 토지 경계`}>
                <polygon className="cadastre-real-boundary__polygon" points={cadastre.boundaryWorkspaceSvgPoints} />
              </svg>
              <div className="cadastre-real-boundary__label">
                <strong>{cadastre.parcelNo}</strong>
                {cadastre.boundaryAreaPy > 0 ? <em>{formatCadastrePyAreaLabel(cadastre.boundaryAreaPy)}</em> : null}
              </div>
              <div className="cadastre-zone-preview cadastre-zone-preview--farm" aria-hidden="true">
                <span>농지</span>
              </div>
              <div className="cadastre-zone-preview cadastre-zone-preview--building" aria-hidden="true">
                <span>건물 부지</span>
              </div>
            </div>
          ) : (
            <div className="cadastre-real-boundary cadastre-real-boundary--empty">
              <strong>연결된 경계 없음</strong>
              <span>전체지도에서 이 토지 마커가 들어가는 경계를 만들면 여기에 지적도 경계가 표시됩니다.</span>
            </div>
          )}
        </div>
        <div className="cadastre-tool-panel" aria-label="지적도 도입 기능">
          <div className="cadastre-tool-card">
            <div className="cadastre-tool-card__head">
              <strong>구역 구성</strong>
              <span>초안</span>
            </div>
            <div className="cadastre-zone-list">
              {CADASTRE_ZONE_PRESETS.map((zone) => (
                <div className="cadastre-zone-row" key={zone.key}>
                  <span className="cadastre-zone-row__icon">{zone.icon}</span>
                  <div>
                    <strong>{zone.label}</strong>
                    <em>{zone.description}</em>
                  </div>
                  <b>{zone.ratio}%</b>
                </div>
              ))}
            </div>
          </div>
          <div className="cadastre-tool-card">
            <div className="cadastre-tool-card__head">
              <strong>식재 설정</strong>
              <span>기본값</span>
            </div>
            <div className="cadastre-planting-grid">
              {CADASTRE_PLANTING_DEFAULTS.map((item) => (
                <div className="cadastre-planting-cell" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="cadastre-tool-actions">
            <button type="button">구역 만들기</button>
            <button type="button">식재선 배치</button>
          </div>
        </div>
      </div>
    </div>
  );
}
