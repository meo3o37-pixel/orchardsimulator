import React from 'react';

const toolLabelOf = (tool) => (
  tool === 'pan'
    ? '\uC774\uB3D9'
    : tool === 'land'
      ? '\uD1A0\uC9C0 \uADF8\uB9AC\uAE30'
      : tool === 'road'
        ? '\uB3C4\uB85C'
        : tool === 'river'
        ? '\uAC15'
        : tool === 'marker'
          ? '\uB9C8\uCEE4 \uBC30\uCE58'
          : tool === 'vectorEraser'
            ? '\uBCA1\uD130 \uC9C0\uC6B0\uAC1C'
            : '\uBBF8\uC138 \uC9C0\uC6B0\uAC1C'
);

const markerPlacementLabelOf = (mode) => (
  mode === 'newVillage'
    ? '\uC0C8\uB85C \uB9C8\uC744 \uBC30\uCE58'
    : mode === 'newField'
      ? '\uC0C8\uB85C \uD1A0\uC9C0 \uBC30\uCE58'
      : mode === 'newCity'
        ? '\uC0C8\uB85C \uC18C\uB3C4\uC2DC \uBC30\uCE58'
        : '\uB9C8\uCEE4 \uC6C0\uAE30\uAE30'
);

const TOOL_OPTIONS = [
  { key: 'pan', label: '\uC774\uB3D9' },
  { key: 'land', label: '\uD1A0\uC9C0 \uADF8\uB9AC\uAE30' },
  { key: 'road', label: '\uB3C4\uB85C' },
  { key: 'river', label: '\uAC15' },
  { key: 'marker', label: '\uB9C8\uCEE4 \uBC30\uCE58' },
  { key: 'vectorEraser', label: '\uBCA1\uD130 \uC9C0\uC6B0\uAC1C' },
  { key: 'fineEraser', label: '\uBBF8\uC138 \uC9C0\uC6B0\uAC1C' }
];

const MARKER_PLACEMENT_OPTIONS = [
  { key: 'newVillage', label: '\uC0C8\uB85C \uB9C8\uC744 \uBC30\uCE58' },
  { key: 'newField', label: '\uC0C8\uB85C \uD1A0\uC9C0 \uBC30\uCE58' },
  { key: 'newCity', label: '\uC0C8\uB85C \uC18C\uB3C4\uC2DC \uBC30\uCE58' },
  { key: 'move', label: '\uB9C8\uCEE4 \uC6C0\uAE30\uAE30' }
];

const clampBoundarySize = (value, min, max) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
};

const hashStringToUnit = (value) => {
  const text = String(value || '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
};

const terrainPolygonPointsOf = (marker, radius, squish = 0.9) => {
  const centerX = Number(marker?.p?.x) || 0;
  const centerY = Number(marker?.p?.y) || 0;
  const seed = hashStringToUnit(marker?.fieldId || marker?.label || '');
  const angleOffset = seed * Math.PI * 2;
  const shapeSeed = hashStringToUnit(`${marker?.fieldId || ''}:shape`);
  const formatPoint = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const rotatePoint = (x, y, angle) => ({
    x: centerX + (x * Math.cos(angle)) - (y * Math.sin(angle)),
    y: centerY + (x * Math.sin(angle)) + (y * Math.cos(angle))
  });
  if (shapeSeed < 0.16) {
    const width = radius * (1.02 + (hashStringToUnit(`${marker?.fieldId || ''}:w`) * 0.22));
    const height = radius * (0.92 + (hashStringToUnit(`${marker?.fieldId || ''}:h`) * 0.2));
    const skew = (hashStringToUnit(`${marker?.fieldId || ''}:skew`) - 0.5) * radius * 0.16;
    const angle = (seed - 0.5) * 0.38;
    const halfW = width / 2;
    const halfH = height / 2;
    return [
      rotatePoint(-halfW + skew, -halfH, angle),
      rotatePoint(halfW + (skew * 0.35), -halfH, angle),
      rotatePoint(halfW - skew, halfH, angle),
      rotatePoint(-halfW - (skew * 0.35), halfH, angle)
    ].map((point) => formatPoint(point.x, point.y)).join(' ');
  }
  const pointCount = shapeSeed < 0.78
    ? 5 + Math.floor(hashStringToUnit(`${marker?.fieldId || ''}:edges`) * 4)
    : 8 + Math.floor(seed * 3);
  return Array.from({ length: pointCount }, (_, index) => {
    const turn = index / pointCount;
    const roughA = hashStringToUnit(`${marker?.fieldId || ''}:a:${index}`);
    const roughB = hashStringToUnit(`${marker?.fieldId || ''}:b:${index}`);
    const roughness = shapeSeed < 0.78 ? 0.16 : 0.22;
    const pointRadius = radius * ((1 - roughness) + (roughA * roughness));
    const angle = angleOffset + (turn * Math.PI * 2) + ((roughB - 0.5) * (shapeSeed < 0.78 ? 0.14 : 0.18));
    const x = centerX + (Math.cos(angle) * pointRadius);
    const y = centerY + (Math.sin(angle) * pointRadius * squish);
    return formatPoint(x, y);
  }).join(' ');
};

const boundaryPolygonPointsOf = (marker) => {
  const points = Array.isArray(marker?.boundarySourcePoints) ? marker.boundarySourcePoints : [];
  if (points.length < 3) return '';
  return points.map((point) => {
    const projected = point?.p || point;
    const x = Number(projected?.x);
    const y = Number(projected?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return '';
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).filter(Boolean).join(' ');
};

export default function TownMoveMapModal({
  closing = false,
  isNightPhase = false,
  devMode,
  isPanning = false,
  zoom,
  mapTool,
  villageMarkersVisible,
  cityMarkersVisible,
  fieldMarkersVisible,
  fieldBoundariesVisible,
  landAreasVisible,
  coordinateMeasureEnabled,
  markerPlacementMode,
  fieldPlacementTargetId,
  fieldPlacementTargetLabel,
  markerMoveTarget,
  onZoomBy,
  onResetView,
  onSelectTool,
  onToggleVillageMarkersVisible,
  onToggleCityMarkersVisible,
  onToggleFieldMarkersVisible,
  onToggleFieldBoundariesVisible,
  onToggleLandAreasVisible,
  onToggleCoordinateMeasureEnabled,
  onSelectMarkerPlacementMode,
  onSelectFieldPlacementTarget,
  onSelectMarkerMoveTarget,
  onGenerateLandFromFields,
  onUndoPoint,
  onClearData,
  onExportData,
  contourCount,
  roadCount,
  riverCount,
  markerCount,
  draftPointCount,
  viewportRef,
  onWheel,
  onPointerDown,
  onPointerMove,
  onPointerLeave,
  onPointerUp,
  viewportWidth,
  viewportHeight,
  gridLineViews,
  contourPaths,
  contourAreaViews,
  hoverContourId,
  setHoverContourId,
  roadPaths,
  riverPaths,
  centerTileImageSrc = '',
  centerTileImageView,
  centerTileDimensionView,
  undevelopedTileLabelViews,
  draftPath,
  draftAreaView,
  cursorCoordinateView,
  eraserPreview,
  draftPointViews,
  markerViews,
  hoverMarkerId,
  setHoverMarkerId,
  fieldSelectMode,
  onOpenMarkerConfirm,
  fieldMarkerViews,
  fieldBoundaryViews,
  hoverFieldMarkerId,
  setHoverFieldMarkerId,
  onPickFieldMarker,
  onClose
}) {
  const [isCenterTileImageReady, setIsCenterTileImageReady] = React.useState(false);
  const [pendingTargetFieldId, setPendingTargetFieldId] = React.useState('');
  const pendingTargetTimerRef = React.useRef(null);
  const isFieldPlacementMode = devMode && mapTool === 'marker' && markerPlacementMode === 'newField';
  const isMarkerMoveMode = devMode && mapTool === 'marker' && markerPlacementMode === 'move';
  const isMarkerInteractionEnabled = mapTool !== 'road' && mapTool !== 'river';
  const resolvedCenterTileImageSrc = String(centerTileImageSrc || '');
  const shouldShowCenterTileLoading = Boolean(centerTileImageView) && Boolean(resolvedCenterTileImageSrc) && !isCenterTileImageReady;
  const useFastFieldMarkerLayer = Boolean(isPanning)
    && !devMode
    && !coordinateMeasureEnabled
    && (Array.isArray(fieldMarkerViews) ? fieldMarkerViews.length : 0) > 320;
  const ownedFieldRows = React.useMemo(() => (
    (Array.isArray(fieldMarkerViews) ? fieldMarkerViews : [])
      .filter((marker) => marker?.owned)
      .slice()
      .sort((a, b) => Number(Boolean(b?.isCurrent)) - Number(Boolean(a?.isCurrent)))
  ), [fieldMarkerViews]);
  const safeFieldBoundaryViews = React.useMemo(() => (
    Array.isArray(fieldBoundaryViews) ? fieldBoundaryViews : []
  ), [fieldBoundaryViews]);
  const fieldBoundaryPolygonViews = React.useMemo(() => (
    safeFieldBoundaryViews.map((marker) => {
      const boundaryPoints = boundaryPolygonPointsOf(marker);
      if (boundaryPoints) {
        return {
          ...marker,
          boundaryPoints
        };
      }
      const centerX = Number(marker?.p?.x) || 0;
      const centerY = Number(marker?.p?.y) || 0;
      const nearestDistance = safeFieldBoundaryViews.reduce((best, other) => {
        if (String(other?.fieldId || '') === String(marker?.fieldId || '')) return best;
        const dx = centerX - (Number(other?.p?.x) || 0);
        const dy = centerY - (Number(other?.p?.y) || 0);
        const distance = Math.hypot(dx, dy);
        return distance > 0 ? Math.min(best, distance) : best;
      }, Number.POSITIVE_INFINITY);
      const areaPy = Math.max(0, Number(marker?.py) || 0);
      const areaRadius = clampBoundarySize(Math.sqrt(areaPy || 900) * 0.92, 32, 92);
      const spacingRadius = Number.isFinite(nearestDistance)
        ? clampBoundarySize(nearestDistance * 0.36, 18, 92)
        : areaRadius;
      const edgeDistance = Math.max(18, Math.min(
        centerX,
        centerY,
        Math.max(0, Number(viewportWidth) - centerX),
        Math.max(0, Number(viewportHeight) - centerY)
      ));
      const radius = Math.max(16, Math.min(areaRadius, spacingRadius, edgeDistance * 0.92));
      return {
        ...marker,
        boundaryPoints: terrainPolygonPointsOf(marker, radius)
      };
    })
  ), [safeFieldBoundaryViews, viewportHeight, viewportWidth]);
  const settlementQuickRows = React.useMemo(() => (
    (Array.isArray(markerViews) ? markerViews : [])
      .slice()
      .sort((a, b) => {
        const currentDiff = Number(Boolean(b?.isCurrentLocation)) - Number(Boolean(a?.isCurrentLocation));
        if (currentDiff !== 0) return currentDiff;
        const cityDiff = Number(String(a?.settlementKind || '') === 'city') - Number(String(b?.settlementKind || '') === 'city');
        if (cityDiff !== 0) return cityDiff;
        return String(a?.settlementLabel || '').localeCompare(String(b?.settlementLabel || ''), 'ko');
      })
  ), [markerViews]);

  const activateFieldMarker = React.useCallback((marker) => {
    if (!isMarkerInteractionEnabled || !marker) return;
    if (isFieldPlacementMode) {
      onSelectFieldPlacementTarget(String(marker.fieldId || ''));
      return;
    }
    if (isMarkerMoveMode) {
      onSelectMarkerMoveTarget({ kind: 'field', id: String(marker.fieldId || '') });
      return;
    }
    onPickFieldMarker(marker);
  }, [
    isFieldPlacementMode,
    isMarkerInteractionEnabled,
    isMarkerMoveMode,
    onPickFieldMarker,
    onSelectFieldPlacementTarget,
    onSelectMarkerMoveTarget
  ]);
  const activateSettlementMarker = React.useCallback((marker) => {
    if (!isMarkerInteractionEnabled || !marker) return;
    if (isMarkerMoveMode) {
      onSelectMarkerMoveTarget({ kind: marker.settlementKind, id: String(marker.id || '') });
      return;
    }
    if (fieldSelectMode && marker.settlementKind === 'village') {
      onOpenMarkerConfirm(marker);
      return;
    }
    onOpenMarkerConfirm(marker);
  }, [
    fieldSelectMode,
    isMarkerInteractionEnabled,
    isMarkerMoveMode,
    onOpenMarkerConfirm,
    onSelectMarkerMoveTarget
  ]);

  const queueFieldActivation = React.useCallback((marker, options = {}) => {
    if (!marker) return;
    const emphasizeSelection = Boolean(options?.emphasizeSelection);
    const fieldId = String(marker.fieldId || '');
    if (!emphasizeSelection || !fieldId) {
      activateFieldMarker(marker);
      return;
    }
    if (pendingTargetTimerRef.current) {
      clearTimeout(pendingTargetTimerRef.current);
      pendingTargetTimerRef.current = null;
    }
    setPendingTargetFieldId(fieldId);
    pendingTargetTimerRef.current = setTimeout(() => {
      pendingTargetTimerRef.current = null;
      activateFieldMarker(marker);
    }, 110);
  }, [activateFieldMarker]);

  React.useEffect(() => {
    if (!resolvedCenterTileImageSrc) {
      setIsCenterTileImageReady(true);
      return undefined;
    }
    let cancelled = false;
    setIsCenterTileImageReady(false);
    const image = new window.Image();
    image.decoding = 'async';
    image.src = resolvedCenterTileImageSrc;
    const finish = () => {
      if (cancelled) return;
      setIsCenterTileImageReady(true);
    };
    const fail = () => {
      if (cancelled) return;
      setIsCenterTileImageReady(true);
    };
    if (image.complete) {
      if (typeof image.decode === 'function') {
        image.decode().then(finish).catch(fail);
      } else {
        finish();
      }
      return () => {
        cancelled = true;
      };
    }
    image.onload = () => {
      if (typeof image.decode === 'function') {
        image.decode().then(finish).catch(fail);
        return;
      }
      finish();
    };
    image.onerror = fail;
    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [resolvedCenterTileImageSrc]);

  React.useEffect(() => {
    setPendingTargetFieldId('');
  }, [fieldMarkerViews]);

  React.useEffect(() => () => {
    if (!pendingTargetTimerRef.current) return;
    clearTimeout(pendingTargetTimerRef.current);
    pendingTargetTimerRef.current = null;
  }, []);

  return (
    <div className={`confirm-modal field-move-modal confirm-modal--external-map ${closing ? 'is-closing' : ''} ${isNightPhase ? 'is-night' : ''}`.trim()}>
      <div className="confirm-modal__title">{'\uC804\uCCB4\uC9C0\uB3C4'}</div>
      <div className="meter__hint" style={{ marginTop: -2, marginBottom: 8 }}>
        {`\uBC30\uC728 ${Math.round((Number(zoom) || 1) * 100)}%`}
      </div>
      <div className="external-map-viewer">
        {devMode ? (
          <div className="external-map-viewer__toolbar">
            <div className="external-map-viewer__zoom">{`\uBC30\uC728 ${Math.round((Number(zoom) || 1) * 100)}%`}</div>
            <div className="external-map-viewer__actions">
              <button type="button" className="button button--ghost button--compact" onClick={() => onZoomBy(-0.12)}>-</button>
              <button type="button" className="button button--ghost button--compact" onClick={() => onZoomBy(0.12)}>+</button>
              <button type="button" className="button button--ghost button--compact" onClick={onResetView}>{'\uCD08\uAE30\uD654'}</button>
            </div>
          </div>
        ) : null}
        {devMode ? (
          <div className="external-map-viewer__editor">
            <div className="external-map-viewer__editor-stack">
              <div className="external-map-viewer__editor-tools">
                {TOOL_OPTIONS.map((tool) => (
                  <button
                    key={tool.key}
                    type="button"
                    className={`button button--ghost button--compact ${mapTool === tool.key ? 'is-active' : ''}`.trim()}
                    onClick={() => onSelectTool(tool.key)}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
              {mapTool === 'marker' ? (
                <div className="external-map-viewer__editor-subtools">
                  {MARKER_PLACEMENT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={`button button--ghost button--compact ${markerPlacementMode === option.key ? 'is-active' : ''}`.trim()}
                      onClick={() => onSelectMarkerPlacementMode(option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                  {markerPlacementMode === 'newField' || markerPlacementMode === 'move' ? (
                    <div className="external-map-viewer__editor-target">
                      {markerPlacementMode === 'newField'
                        ? `\uBC30\uCE58 \uB300\uC0C1 ${fieldPlacementTargetLabel || '\uD1A0\uC9C0 \uB9C8\uCEE4\uB97C \uBA3C\uC800 \uACE0\uB974\uC138\uC694'}`
                        : `\uC774\uB3D9 \uB300\uC0C1 ${fieldPlacementTargetLabel || '\uC62E\uAE38 \uB9C8\uCEE4\uB97C \uBA3C\uC800 \uACE0\uB974\uC138\uC694'}`}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="external-map-viewer__editor-actions">
              <button
                type="button"
                className={`button button--ghost button--compact ${fieldMarkersVisible ? 'is-active' : ''}`.trim()}
                onClick={onToggleFieldMarkersVisible}
              >
                {fieldMarkersVisible ? '\uD1A0\uC9C0 \uD45C\uC2DC ON' : '\uD1A0\uC9C0 \uD45C\uC2DC OFF'}
              </button>
              <button
                type="button"
                className={`button button--ghost button--compact ${fieldBoundariesVisible ? 'is-active' : ''}`.trim()}
                onClick={onToggleFieldBoundariesVisible}
              >
                {fieldBoundariesVisible ? '토지 경계 표시 ON' : '토지 경계 표시 OFF'}
              </button>
              <button
                type="button"
                className={`button button--ghost button--compact ${villageMarkersVisible ? 'is-active' : ''}`.trim()}
                onClick={onToggleVillageMarkersVisible}
              >
                {villageMarkersVisible ? '\uB9C8\uC744 \uD45C\uC2DC ON' : '\uB9C8\uC744 \uD45C\uC2DC OFF'}
              </button>
              <button
                type="button"
                className={`button button--ghost button--compact ${cityMarkersVisible ? 'is-active' : ''}`.trim()}
                onClick={onToggleCityMarkersVisible}
              >
                {cityMarkersVisible ? '\uC18C\uB3C4\uC2DC \uD45C\uC2DC ON' : '\uC18C\uB3C4\uC2DC \uD45C\uC2DC OFF'}
              </button>
              <button
                type="button"
                className={`button button--ghost button--compact ${landAreasVisible ? 'is-active' : ''}`.trim()}
                onClick={onToggleLandAreasVisible}
              >
                {landAreasVisible ? '\uD1A0\uC9C0 \uC601\uC5ED \uD45C\uC2DC ON' : '\uD1A0\uC9C0 \uC601\uC5ED \uD45C\uC2DC OFF'}
              </button>
              <button
                type="button"
                className={`button button--ghost button--compact ${coordinateMeasureEnabled ? 'is-active' : ''}`.trim()}
                onClick={onToggleCoordinateMeasureEnabled}
              >
                {coordinateMeasureEnabled ? '\uC88C\uD45C \uCE21\uC815 ON' : '\uC88C\uD45C \uCE21\uC815 OFF'}
              </button>
              <button type="button" className="button button--ghost button--compact" onClick={onGenerateLandFromFields}>{'\uD1A0\uC9C0 \uC790\uB3D9\uC0DD\uC131'}</button>
              <button type="button" className="button button--ghost button--compact" onClick={onUndoPoint}>{'\uC810 \uCDE8\uC18C'}</button>
              <button type="button" className="button button--ghost button--compact" onClick={onClearData}>{'\uC804\uCCB4 \uC0AD\uC81C'}</button>
              <button type="button" className="button button--ghost button--compact" onClick={onExportData}>{'\uB370\uC774\uD130 \uC800\uC7A5'}</button>
            </div>
          </div>
        ) : null}
        {devMode ? (
          <div className="external-map-viewer__meta">
            {`\uB3C4\uAD6C: ${toolLabelOf(mapTool)}${mapTool === 'marker' ? ` / ${markerPlacementLabelOf(markerPlacementMode)}` : ''} / \uD1A0\uC9C0 ${contourCount} \u00B7 \uB3C4\uB85C ${roadCount} \u00B7 \uAC15 ${riverCount} \u00B7 \uB9C8\uCEE4 ${markerCount} / \uB4DC\uB798\uD504\uD2B8 ${draftPointCount}\uC810`}
          </div>
        ) : null}
        {!devMode ? (
          <div className="external-map-viewer__view-options">
            <button
              type="button"
              className={`button button--ghost button--compact ${fieldBoundariesVisible ? 'is-active' : ''}`.trim()}
              onClick={onToggleFieldBoundariesVisible}
            >
              {fieldBoundariesVisible ? '토지 경계 표시 ON' : '토지 경계 표시 OFF'}
            </button>
          </div>
        ) : null}
        <div
          ref={viewportRef}
          className={`external-map-viewer__viewport external-map-viewer__viewport--tool-${devMode ? mapTool : 'pan'}`.trim()}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {settlementQuickRows.length > 0 ? (
            <aside className="external-map-viewer__settlement-panel" aria-label="마을과 도시 빠른 선택">
              <div className="external-map-viewer__owned-panel-kicker">거점</div>
              <div className="external-map-viewer__owned-panel-title">마을 / 도시</div>
              <div className="external-map-viewer__owned-panel-list external-map-viewer__owned-panel-list--settlements">
                {settlementQuickRows.map((marker) => {
                  const isHovered = isMarkerInteractionEnabled && String(hoverMarkerId || '') === String(marker.id || '');
                  const isDisabled = !isMarkerInteractionEnabled;
                  const settlementEmoji = marker.settlementKind === 'city' ? '🏙️' : '🏡';
                  return (
                    <button
                      key={`settlement-panel-${marker.id}`}
                      type="button"
                      disabled={isDisabled}
                      className={`external-map-viewer__owned-panel-item external-map-viewer__settlement-panel-item ${marker.isCurrentLocation ? 'is-current' : ''} ${isHovered ? 'is-pending-target' : ''}`.trim()}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                      }}
                      onMouseEnter={() => {
                        if (!isMarkerInteractionEnabled) return;
                        setHoverMarkerId(String(marker.id || ''));
                      }}
                      onMouseLeave={() => {
                        if (!isMarkerInteractionEnabled) return;
                        setHoverMarkerId('');
                      }}
                      onFocus={() => {
                        if (!isMarkerInteractionEnabled) return;
                        setHoverMarkerId(String(marker.id || ''));
                      }}
                      onBlur={() => {
                        if (!isMarkerInteractionEnabled) return;
                        setHoverMarkerId('');
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        activateSettlementMarker(marker);
                      }}
                    >
                      <span
                        className={`external-map-viewer__owned-panel-dot external-map-viewer__settlement-panel-dot external-map-viewer__settlement-panel-dot--${marker.settlementKind} ${marker.isCurrentLocation ? 'is-current' : ''} ${isHovered ? 'is-pending-target' : ''}`.trim()}
                        aria-hidden="true"
                      />
                      <span className="external-map-viewer__owned-panel-name">{`${settlementEmoji} ${marker.settlementLabel}`}</span>
                      <span className="external-map-viewer__owned-panel-state">
                        {marker.isCurrentLocation ? '현재' : marker.settlementKind === 'city' ? '도시' : '마을'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          ) : null}
          {ownedFieldRows.length > 0 ? (
            <aside className="external-map-viewer__owned-panel" aria-label="소유 토지 목록">
              <div className="external-map-viewer__owned-panel-kicker">내 땅</div>
              <div className="external-map-viewer__owned-panel-title">{`소유 토지 ${ownedFieldRows.length}곳`}</div>
              <div className="external-map-viewer__owned-panel-list">
                {ownedFieldRows.map((marker) => {
                  const isPendingTarget = String(pendingTargetFieldId || '') === String(marker.fieldId || '');
                  const isHoverLinked = String(hoverFieldMarkerId || '') === String(marker.fieldId || '');
                  const isDisabled = !isMarkerInteractionEnabled || (marker.isCurrent && !isFieldPlacementMode && !isMarkerMoveMode);
                  return (
                  <button
                    key={`owned-field-panel-${marker.fieldId}`}
                    type="button"
                    disabled={isDisabled}
                    className={`external-map-viewer__owned-panel-item ${marker.isCurrent ? 'is-current' : ''} ${isPendingTarget || isHoverLinked ? 'is-pending-target' : ''}`.trim()}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                    }}
                    onMouseEnter={() => {
                      if (!isMarkerInteractionEnabled) return;
                      setHoverFieldMarkerId(String(marker.fieldId || ''));
                    }}
                    onMouseLeave={() => {
                      if (!isMarkerInteractionEnabled) return;
                      setHoverFieldMarkerId('');
                    }}
                    onFocus={() => {
                      if (!isMarkerInteractionEnabled) return;
                      setHoverFieldMarkerId(String(marker.fieldId || ''));
                    }}
                    onBlur={() => {
                      if (!isMarkerInteractionEnabled) return;
                      setHoverFieldMarkerId('');
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      queueFieldActivation(marker, { emphasizeSelection: true });
                    }}
                  >
                    <span className={`external-map-viewer__owned-panel-dot ${marker.isCurrent ? 'is-current' : ''} ${isPendingTarget || isHoverLinked ? 'is-pending-target' : ''}`.trim()} aria-hidden="true" />
                    <span className="external-map-viewer__owned-panel-name">{marker.label}</span>
                    <span className="external-map-viewer__owned-panel-state">{marker.isCurrent ? '현재' : (isPendingTarget || isHoverLinked) ? '도착 선택' : '이동'}</span>
                  </button>
                  );
                })}
              </div>
            </aside>
          ) : null}
          {shouldShowCenterTileLoading ? (
            <div className="external-map-viewer__loading-overlay">
              <div className="external-map-viewer__loading-card">
                <div className="external-map-viewer__loading-spinner" />
                <div className="external-map-viewer__loading-text">{'\uC9C0\uB3C4 \uB85C\uB529\uC911...'}</div>
              </div>
            </div>
          ) : null}
          <svg className="external-map-viewer__virtual-svg" viewBox={`0 0 ${viewportWidth} ${viewportHeight}`} preserveAspectRatio="none" aria-label={'\uC804\uCCB4 \uC9C0\uB3C4 \uD3B8\uC9D1 \uC601\uC5ED'}>
            <defs>
              <pattern id="external-map-land-hatch" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(28)">
                <line x1="0" y1="0" x2="0" y2="12" className="external-map-viewer__land-hatch-line" />
              </pattern>
            </defs>
            <rect x="0" y="0" width={viewportWidth} height={viewportHeight} fill="#e2ecde" />
            {centerTileImageView ? (
              <image
                href={resolvedCenterTileImageSrc}
                x={Number(centerTileImageView.x) || 0}
                y={Number(centerTileImageView.y) || 0}
                width={Math.max(0, Number(centerTileImageView.width) || 0)}
                height={Math.max(0, Number(centerTileImageView.height) || 0)}
                preserveAspectRatio="none"
                className={`external-map-viewer__center-image ${isCenterTileImageReady ? 'is-ready' : ''}`.trim()}
              />
            ) : null}
            {centerTileDimensionView ? (
              <g className="external-map-viewer__dimension">
                <line x1={Number(centerTileDimensionView.topLeftX) || 0} y1={Number(centerTileDimensionView.topLeftY) || 0} x2={Number(centerTileDimensionView.topLeftX) || 0} y2={Number(centerTileDimensionView.topY) || 0} />
                <line x1={Number(centerTileDimensionView.topRightX) || 0} y1={Number(centerTileDimensionView.topLeftY) || 0} x2={Number(centerTileDimensionView.topRightX) || 0} y2={Number(centerTileDimensionView.topY) || 0} />
                <line x1={Number(centerTileDimensionView.topLeftX) || 0} y1={Number(centerTileDimensionView.topY) || 0} x2={Number(centerTileDimensionView.topRightX) || 0} y2={Number(centerTileDimensionView.topY) || 0} />
                <text x={((Number(centerTileDimensionView.topLeftX) || 0) + (Number(centerTileDimensionView.topRightX) || 0)) / 2} y={(Number(centerTileDimensionView.topY) || 0) - 6}>
                  {centerTileDimensionView.widthLabel}
                </text>
                <line x1={Number(centerTileDimensionView.topLeftX) || 0} y1={Number(centerTileDimensionView.topLeftY) || 0} x2={Number(centerTileDimensionView.leftX) || 0} y2={Number(centerTileDimensionView.topLeftY) || 0} />
                <line x1={Number(centerTileDimensionView.topLeftX) || 0} y1={Number(centerTileDimensionView.bottomLeftY) || 0} x2={Number(centerTileDimensionView.leftX) || 0} y2={Number(centerTileDimensionView.bottomLeftY) || 0} />
                <line x1={Number(centerTileDimensionView.leftX) || 0} y1={Number(centerTileDimensionView.topLeftY) || 0} x2={Number(centerTileDimensionView.leftX) || 0} y2={Number(centerTileDimensionView.bottomLeftY) || 0} />
                <text
                  x={(Number(centerTileDimensionView.leftX) || 0) - 8}
                  y={((Number(centerTileDimensionView.topLeftY) || 0) + (Number(centerTileDimensionView.bottomLeftY) || 0)) / 2}
                  transform={`rotate(-90 ${(Number(centerTileDimensionView.leftX) || 0) - 8} ${((Number(centerTileDimensionView.topLeftY) || 0) + (Number(centerTileDimensionView.bottomLeftY) || 0)) / 2})`}
                >
                  {centerTileDimensionView.heightLabel}
                </text>
              </g>
            ) : null}
            {Array.isArray(gridLineViews) ? gridLineViews.map((line) => (
              <line
                key={line.key}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                className="external-map-viewer__grid-line"
              />
            )) : null}
            {Array.isArray(undevelopedTileLabelViews) ? undevelopedTileLabelViews.map((labelView) => (
              <g key={labelView.key} className="external-map-viewer__undeveloped-label">
                <text x={Number(labelView.x) || 0} y={Number(labelView.y) || 0}>{labelView.label}</text>
              </g>
            )) : null}
            {contourPaths.map((c) => (
              <g
                key={c.key}
                className="external-map-viewer__land-group"
                onMouseEnter={() => {
                  if (devMode) return;
                  setHoverContourId(String(c.key || ''));
                }}
                onMouseLeave={() => {
                  if (devMode) return;
                  setHoverContourId('');
                }}
              >
                <path d={c.d} className="external-map-viewer__draw external-map-viewer__draw--land-hit" />
                <path d={c.d} className="external-map-viewer__draw external-map-viewer__draw--land-base" />
                <path d={c.d} className="external-map-viewer__draw external-map-viewer__draw--land-hatch" />
                <path d={c.d} className="external-map-viewer__draw external-map-viewer__draw--land-outline" />
              </g>
            ))}
            {Array.isArray(contourAreaViews) ? contourAreaViews.filter((area) => String(hoverContourId || '') === String(area.contourId || '')).map((area) => (
              <g key={area.key} className="external-map-viewer__area-badge">
                <rect x={area.x - (Number(area.badgeWidth) / 2)} y={area.y - 14} width={area.badgeWidth} height="22" rx="11" />
                <text x={area.x} y={area.y}>{area.label}</text>
              </g>
            )) : null}
            {roadPaths.map((r) => <path key={r.key} d={r.d} className="external-map-viewer__draw external-map-viewer__draw--road" />)}
            {riverPaths.map((r) => <path key={r.key} d={r.d} className="external-map-viewer__draw external-map-viewer__draw--river" />)}
            {fieldBoundariesVisible ? fieldBoundaryPolygonViews.map((marker) => {
              const isHovered = isMarkerInteractionEnabled && String(hoverFieldMarkerId || '') === String(marker.fieldId || '');
              const isPlacementTarget = isFieldPlacementMode && String(marker.fieldId || '') === String(fieldPlacementTargetId || '');
              const isPendingTarget = String(pendingTargetFieldId || '') === String(marker.fieldId || '');
              return (
                <g
                  key={`field-boundary-${marker.fieldId}`}
                  className={`external-map-viewer__field-boundary ${marker.owned ? 'is-owned' : 'is-unowned'} ${marker.isCurrent ? 'is-current' : ''} ${isHovered ? 'is-hovered' : ''} ${isPendingTarget ? 'is-pending-target' : ''} ${isPlacementTarget ? 'is-placement-target' : ''}`.trim()}
                  aria-hidden="true"
                >
                  <polygon points={marker.boundaryPoints} />
                </g>
              );
            }) : null}
            {draftPath ? (
              <path
                d={draftPath}
                className={`external-map-viewer__draw ${
                  mapTool === 'road'
                    ? 'external-map-viewer__draw--road'
                    : mapTool === 'river'
                      ? 'external-map-viewer__draw--river'
                      : 'external-map-viewer__draw--draft'
                }`}
              />
            ) : null}
            {draftAreaView ? (
              <g className="external-map-viewer__area-badge external-map-viewer__area-badge--draft">
                <rect x={draftAreaView.x - (Number(draftAreaView.badgeWidth) / 2)} y={draftAreaView.y - 14} width={draftAreaView.badgeWidth} height="22" rx="11" />
                <text x={draftAreaView.x} y={draftAreaView.y}>{draftAreaView.label}</text>
              </g>
            ) : null}
            {cursorCoordinateView ? (
              <g className="external-map-viewer__coord-badge">
                <rect
                  x={Math.max(8, Number(cursorCoordinateView.screenX) + 12)}
                  y={Math.max(8, Number(cursorCoordinateView.screenY) - 36)}
                  width={Math.max(136, (String(cursorCoordinateView.label || '').length * 7.8) + 18)}
                  height="24"
                  rx="12"
                />
                <text
                  x={Math.max(8, Number(cursorCoordinateView.screenX) + 12) + (Math.max(136, (String(cursorCoordinateView.label || '').length * 7.8) + 18) / 2)}
                  y={Math.max(8, Number(cursorCoordinateView.screenY) - 24)}
                >
                  {cursorCoordinateView.label}
                </text>
              </g>
            ) : null}
            {eraserPreview ? (
              <g className="external-map-viewer__eraser-preview">
                <circle
                  cx={Number(eraserPreview.screenX) || 0}
                  cy={Number(eraserPreview.screenY) || 0}
                  r={Math.max(0, Number(eraserPreview.radiusPx) || 0)}
                />
                <circle
                  className="external-map-viewer__eraser-preview-center"
                  cx={Number(eraserPreview.screenX) || 0}
                  cy={Number(eraserPreview.screenY) || 0}
                  r="2.4"
                />
              </g>
            ) : null}
            {Array.isArray(draftPointViews) ? draftPointViews.map((point) => (
              <g key={point.key} className={`external-map-viewer__draft-point ${point.canClose ? 'is-close-target' : ''}`.trim()}>
                {point.canClose ? <circle className="external-map-viewer__draft-point-ring" cx={point.p.x} cy={point.p.y} r="9.5" /> : null}
                <circle className="external-map-viewer__draft-point-dot" cx={point.p.x} cy={point.p.y} r={point.isFirst ? 4.4 : 3.6} />
                {point.showCloseHint ? (
                  <g className="external-map-viewer__draft-hint">
                    <rect x={point.p.x + 12} y={point.p.y - 34} width="112" height="24" rx="12" />
                    <text x={point.p.x + 68} y={point.p.y - 22}>{'\uD1A0\uC9C0 \uBC30\uCE58 \uB05D\uB0B4\uAE30'}</text>
                  </g>
                ) : null}
              </g>
            )) : null}
            {markerViews.map((marker) => {
              const isHovered = isMarkerInteractionEnabled && String(hoverMarkerId || '') === String(marker.id || '');
              const markerScale = isHovered ? 1.42 : 1;
              const markerCenterX = Number(marker?.p?.x) || 0;
              const markerCenterY = Number(marker?.p?.y) || 0;
              const markerCenterScaleTransform = `translate(${markerCenterX} ${markerCenterY}) scale(${markerScale}) translate(${-markerCenterX} ${-markerCenterY})`;
              return (
                <g
                  key={marker.id}
                  className={`external-map-viewer__marker external-map-viewer__marker--${marker.settlementKind} ${marker.isCurrentLocation ? 'is-current-location' : ''} ${isMarkerInteractionEnabled ? '' : 'is-inert'}`.trim()}
                  role={isMarkerInteractionEnabled ? 'button' : undefined}
                  tabIndex={isMarkerInteractionEnabled ? 0 : -1}
                  onMouseEnter={() => {
                    if (!isMarkerInteractionEnabled) return;
                    setHoverMarkerId(String(marker.id || ''));
                  }}
                  onMouseLeave={() => {
                    if (!isMarkerInteractionEnabled) return;
                    setHoverMarkerId('');
                  }}
                  onFocus={() => {
                    if (!isMarkerInteractionEnabled) return;
                    setHoverMarkerId(String(marker.id || ''));
                  }}
                  onBlur={() => {
                    if (!isMarkerInteractionEnabled) return;
                    setHoverMarkerId('');
                  }}
                  onPointerDown={(event) => {
                    if (!isMarkerInteractionEnabled) return;
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    if (!isMarkerInteractionEnabled) return;
                    event.stopPropagation();
                    activateSettlementMarker(marker);
                  }}
                  onKeyDown={(event) => {
                    if (!isMarkerInteractionEnabled) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      activateSettlementMarker(marker);
                    }
                  }}
                >
                  <circle className="external-map-viewer__marker-hit" cx={marker.p.x} cy={marker.p.y} r="26" />
                  <g className="external-map-viewer__marker-visual" transform={markerCenterScaleTransform}>
                    {marker.settlementKind === 'city' ? (
                      <g className="external-map-viewer__village-icon--city">
                        <rect x={marker.p.x - 9} y={marker.p.y - 9} width="18" height="18" rx="4" />
                        <rect x={marker.p.x - 12} y={marker.p.y + 10} width="24" height="5" rx="2.5" />
                      </g>
                    ) : (
                      <g className="external-map-viewer__village-icon--village">
                        <path d={`M ${marker.p.x - 10} ${marker.p.y + 5} L ${marker.p.x} ${marker.p.y - 10} L ${marker.p.x + 10} ${marker.p.y + 5} Z`} />
                        <rect x={marker.p.x - 9} y={marker.p.y + 5} width="18" height="10" rx="2.5" />
                      </g>
                    )}
                  </g>
                  <text x={marker.p.x} y={marker.p.y + 35}>{marker.settlementLabel}</text>
                  {marker.isCurrentLocation ? (
                    <text className="external-map-viewer__marker-current-tag" x={marker.p.x} y={marker.p.y - 18}>{'\uD604\uC7AC\uC704\uCE58'}</text>
                  ) : null}
                </g>
              );
            })}
            {useFastFieldMarkerLayer ? (
              <g className="external-map-viewer__field-marker-fast-layer" aria-hidden="true">
                {fieldMarkerViews.map((marker) => (
                  <circle
                    key={`field-marker-fast-${marker.fieldId}`}
                    className={`external-map-viewer__field-marker-fast-dot ${marker.owned ? 'is-owned' : 'is-unowned'} ${marker.isCurrent ? 'is-current' : ''}`.trim()}
                    cx={marker.p.x}
                    cy={marker.p.y}
                    r={marker.isCurrent ? 8.2 : marker.owned ? 6.8 : 4.6}
                  />
                ))}
              </g>
            ) : fieldMarkerViews.map((marker) => {
              const isHovered = isMarkerInteractionEnabled && String(hoverFieldMarkerId || '') === String(marker.fieldId || '');
              const isPlacementTarget = isFieldPlacementMode && String(marker.fieldId || '') === String(fieldPlacementTargetId || '');
              const isPendingTarget = String(pendingTargetFieldId || '') === String(marker.fieldId || '');
              const isDestinationPreview = isPendingTarget || isHovered;
              const shouldShowPersistentPyLabel = Boolean(coordinateMeasureEnabled);
              const shouldShowHoverLabel = !devMode && isHovered;
              const markerRadius = marker.isCurrent ? 8.2 : marker.owned ? 6.8 : 5;
              const markerHitRadius = marker.isCurrent ? 30 : marker.owned ? 28 : 24;
              const markerLabel = isFieldPlacementMode
                ? `${marker.label} (\uC774\uB3D9 \uB300\uC0C1\uC73C\uB85C \uC120\uD0DD)`
                : marker.isCurrent
                  ? `${marker.label} (\uD604\uC7AC \uD1A0\uC9C0)`
                  : marker.owned
                    ? marker.label
                    : `${marker.label} (\uBBF8\uBCF4\uC720)`;
              return (
                <g
                  key={`field-marker-${marker.fieldId}`}
                  className={`external-map-viewer__field-marker ${marker.owned ? 'is-owned' : 'is-unowned'} ${marker.isCurrent ? 'is-current' : ''} ${isHovered ? 'is-hovered' : ''} ${isDestinationPreview ? 'is-pending-target' : ''} ${isPlacementTarget || (isMarkerMoveMode && String(markerMoveTarget?.kind || '') === 'field' && String(markerMoveTarget?.id || '') === String(marker.fieldId || '')) ? 'is-placement-target' : ''} ${isMarkerInteractionEnabled ? '' : 'is-inert'}`.trim()}
                  role={isMarkerInteractionEnabled ? 'button' : undefined}
                  tabIndex={isMarkerInteractionEnabled ? 0 : -1}
                  onPointerDown={(event) => {
                    if (!isMarkerInteractionEnabled) return;
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    if (!isMarkerInteractionEnabled) return;
                    event.preventDefault();
                    event.stopPropagation();
                    queueFieldActivation(marker);
                  }}
                  onMouseEnter={() => {
                    if (!isMarkerInteractionEnabled) return;
                    setHoverFieldMarkerId(String(marker.fieldId || ''));
                  }}
                  onMouseLeave={() => {
                    if (!isMarkerInteractionEnabled) return;
                    setHoverFieldMarkerId('');
                  }}
                  onFocus={() => {
                    if (!isMarkerInteractionEnabled) return;
                    setHoverFieldMarkerId(String(marker.fieldId || ''));
                  }}
                  onBlur={() => {
                    if (!isMarkerInteractionEnabled) return;
                    setHoverFieldMarkerId('');
                  }}
                  onKeyDown={(event) => {
                    if (!isMarkerInteractionEnabled) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      queueFieldActivation(marker);
                    }
                  }}
                  title={markerLabel}
                  aria-label={markerLabel}
                >
                  <circle className="external-map-viewer__field-marker-hit" cx={marker.p.x} cy={marker.p.y} r={markerHitRadius} />
                  {marker.owned ? <circle className="external-map-viewer__field-marker-owned-ring" cx={marker.p.x} cy={marker.p.y} r={marker.isCurrent ? 12.6 : 10.4} /> : null}
                  {marker.isCurrent ? <circle className="external-map-viewer__field-marker-current-ring" cx={marker.p.x} cy={marker.p.y} r="14.8" /> : null}
                  {isPlacementTarget ? <circle className="external-map-viewer__field-marker-placement-ring" cx={marker.p.x} cy={marker.p.y} r={marker.isCurrent ? 17.6 : 15.2} /> : null}
                  <g className="external-map-viewer__field-marker-visual">
                    <circle className="external-map-viewer__field-marker-dot" cx={marker.p.x} cy={marker.p.y} r={markerRadius} />
                  </g>
                  {(marker.isCurrent || isPlacementTarget || shouldShowPersistentPyLabel || shouldShowHoverLabel) ? (
                    <text className="external-map-viewer__field-marker-label" x={marker.p.x} y={marker.p.y + 28}>
                      {shouldShowPersistentPyLabel ? (marker.pyLabel || marker.hoverLabel || marker.label) : (marker.hoverLabel || marker.label)}
                    </text>
                  ) : null}
                  {marker.isCurrent ? (
                    <text className="external-map-viewer__field-marker-current-tag" x={marker.p.x} y={marker.p.y - 18}>{'\uD604\uC7AC'}</text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      {devMode ? (
        <div className="footer-actions">
          <button className="button button--ghost" onClick={onClose}>{'\uB2EB\uAE30'}</button>
        </div>
      ) : null}
    </div>
  );
}
