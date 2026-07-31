window.FieldMap300MapRuntime = (() => {
  const GRID_COLS = 54;
  const GRID_ROWS = 50;
  const DEFAULT_ZOOM = 5.2;
  const MIN_ZOOM = 1.2;
  const MAX_ZOOM = 10;
  const ZOOM_SENSITIVITY = 0.0016;
  const CELL_TYPES = Object.freeze({
    EMPTY: 'empty',
    ORCHARD: 'orchard',
    SUMMER_GROUND: 'summer-ground',
    WINTER_GROUND: 'winter-ground',
    TREE: 'tree',
    FACILITY: 'facility',
    SHED: 'shed',
    WATER: 'water',
    WELL: 'well',
    APRON: 'apron',
  });

  const isGroundCellType = (type) => (
    type === CELL_TYPES.ORCHARD
    || type === CELL_TYPES.SUMMER_GROUND
    || type === CELL_TYPES.WINTER_GROUND
  );

  const clampTreeAge = (value) => {
    const age = Number(value);
    if (!Number.isFinite(age)) return 1;
    return Math.max(1, Math.min(6, Math.round(age)));
  };

  const getTreeAgeLabel = (value) => `${clampTreeAge(value)}년생`;

  const getTreeAgeClass = (value, prefix) => `${prefix}-${clampTreeAge(value)}`;

  const SELECTED_PIXEL_COPY_BY_TYPE = Object.freeze({
    [CELL_TYPES.ORCHARD]: {
      title: '과원 바닥 픽셀',
      label: '과원 바닥',
      hint: '식재열 사이에 있는 기본 과원 바닥입니다.',
      swatchClass: 'selected-preview__swatch--orchard',
      previewTone: 'summer',
      previewSkin: 'summer',
    },
    [CELL_TYPES.SUMMER_GROUND]: {
      title: '하계 바닥 픽셀',
      label: '하계 바닥',
      hint: '생육기 초록 바닥이 표현된 구역입니다.',
      swatchClass: 'selected-preview__swatch--summer',
      previewTone: 'summer',
      previewSkin: 'summer',
    },
    [CELL_TYPES.WINTER_GROUND]: {
      title: '동계 바닥 픽셀',
      label: '동계 바닥',
      hint: '겨울 휴면기 톤을 표현한 바닥 구역입니다.',
      swatchClass: 'selected-preview__swatch--winter',
      previewTone: 'winter',
      previewSkin: 'winter',
    },
    [CELL_TYPES.TREE]: {
      title: '식재주 픽셀',
      label: '식재주',
      hint: '실제 과수 1주가 심긴 지점입니다.',
      swatchClass: 'selected-preview__swatch--tree',
      previewTone: 'summer',
      previewSkin: 'tree',
    },
    [CELL_TYPES.FACILITY]: {
      title: '시설 픽셀',
      label: '시설',
      hint: '설치된 농장 시설이 차지한 구역입니다.',
      swatchClass: 'selected-preview__swatch--facility',
      previewTone: 'summer',
      previewSkin: 'facility',
    },
    [CELL_TYPES.SHED]: {
      title: '창고 픽셀',
      label: '창고',
      hint: '창고나 보관 시설이 차지한 구역입니다.',
      swatchClass: 'selected-preview__swatch--shed',
      previewTone: 'summer',
      previewSkin: 'shed',
    },
    [CELL_TYPES.WATER]: {
      title: '급수 픽셀',
      label: '급수',
      hint: '급수 시설이나 물 관련 설비가 놓인 구역입니다.',
      swatchClass: 'selected-preview__swatch--water',
      previewTone: 'summer',
      previewSkin: 'water',
    },
    [CELL_TYPES.WELL]: {
      title: '관정 픽셀',
      label: '관정',
      hint: '관정이나 취수 설비가 있는 구역입니다.',
      swatchClass: 'selected-preview__swatch--well',
      previewTone: 'summer',
      previewSkin: 'well',
    },
    [CELL_TYPES.APRON]: {
      title: '작업 마당 픽셀',
      label: '작업 마당',
      hint: '이동과 상하차 작업을 위한 바닥 구역입니다.',
      swatchClass: 'selected-preview__swatch--apron',
      previewTone: 'summer',
      previewSkin: 'summer',
    },
  });

  const getSelectedPixelCopy = (type) => (
    SELECTED_PIXEL_COPY_BY_TYPE[type] || SELECTED_PIXEL_COPY_BY_TYPE[CELL_TYPES.ORCHARD]
  );

  const createDefaultSelectedPixelPreview = () => ({
    title: '픽셀 미선택',
    meta: '지도의 셀을 클릭해 확인',
    hint: '같은 셀을 다시 누르면 선택이 해제됩니다.',
    swatchClass: 'selected-preview__swatch--orchard',
    previewType: CELL_TYPES.ORCHARD,
    previewTone: 'summer',
    previewSkin: 'summer',
    previewImageKey: '',
    treeAge: null,
    facilityKey: '',
  });

  const createSelectedPixelPreview = ({ mapData, x, y, installableByKey }) => {
    const cell = mapData?.cells?.[y]?.[x];
    const type = cell?.type || CELL_TYPES.ORCHARD;
    const facility = cell?.facilityKey ? installableByKey?.[cell.facilityKey] : null;
    const copy = getSelectedPixelCopy(type);
    const treeAge = clampTreeAge(cell?.treeAge);
    const title = type === CELL_TYPES.TREE
      ? `${getTreeAgeLabel(treeAge)} 나무 픽셀`
      : (facility?.name ?? copy.title);
    const meta = facility
      ? `${x + 1}열 ${y + 1}행 ${facility.width} x ${facility.height}칸`
      : type === CELL_TYPES.TREE
        ? `${x + 1}열 ${y + 1}행 ${getTreeAgeLabel(treeAge)} 식재주`
        : `${x + 1}열 ${y + 1}행 ${copy.label}`;
    const hint = type === CELL_TYPES.TREE
      ? `${getTreeAgeLabel(treeAge)} 과수 위치로 표현된 식재 픽셀입니다.`
      : (facility?.hint ?? copy.hint);

    return {
      x,
      y,
      title,
      meta,
      hint,
      swatchClass: copy.swatchClass,
      previewType: type,
      previewTone: facility?.previewTone ?? copy.previewTone,
      previewSkin: facility?.previewSkin ?? copy.previewSkin,
      previewImageKey: facility?.previewImageKey || '',
      treeAge: type === CELL_TYPES.TREE ? treeAge : null,
      facilityKey: facility?.key || '',
    };
  };

  const formatOrchardSummary = (treeCount) => `식재수 ${Number(treeCount) || 0}주`;

  const createTreeArtElement = () => {
    const art = document.createElement('div');
    art.className = 'tree-art';

    const trunk = document.createElement('span');
    trunk.className = 'tree-art__trunk';
    art.appendChild(trunk);

    for (const index of [1, 2, 3, 4]) {
      const leaf = document.createElement('span');
      leaf.className = `tree-art__leaf tree-art__leaf--${index}`;
      art.appendChild(leaf);
    }

    return art;
  };

  const createPlacedFacilityArtElement = ({ facility, facilityImageUrls }) => {
    if (!facility?.previewSkin) return null;
    const art = document.createElement('div');
    art.className = `placed-facility-overlay__art placed-facility-overlay__art--${facility.previewSkin}`;
    const imageKey = String(facility?.previewImageKey || '');
    const previewImageUrl = imageKey ? String(facilityImageUrls?.[imageKey] || '') : '';

    if (previewImageUrl) {
      art.classList.add('placed-facility-overlay__art--image');
      const img = document.createElement('img');
      img.src = previewImageUrl;
      img.alt = facility.name || '';
      img.loading = 'eager';
      img.decoding = 'async';
      art.appendChild(img);
      return art;
    }

    if (facility.previewSkin === 'tree') {
      art.classList.add(getTreeAgeClass(facility.treeAge, 'placed-facility-overlay__art--tree-age'));
      art.appendChild(createTreeArtElement());
      return art;
    }

    if (['well', 'tank', 'power', 'pump', 'control', 'fan', 'drip', 'sprinkler'].includes(facility.previewSkin)) {
      art.appendChild(document.createElement('span'));
      return art;
    }

    return null;
  };

  const normalizeInstallableFacilities = (rawFacilities) => (
    Array.isArray(rawFacilities) ? rawFacilities : []
  ).map((facility) => ({
    ...facility,
    type: facility.type === 'tree'
      ? CELL_TYPES.TREE
      : facility.type === 'summer-ground'
        ? CELL_TYPES.SUMMER_GROUND
        : facility.type === 'winter-ground'
          ? CELL_TYPES.WINTER_GROUND
          : facility.type === 'well'
            ? CELL_TYPES.WELL
            : facility.type === 'water'
              ? CELL_TYPES.WATER
              : facility.type === 'shed'
                ? CELL_TYPES.SHED
                : facility.type === 'apron'
                  ? CELL_TYPES.APRON
                  : CELL_TYPES.FACILITY,
  }));

  const createInitialMapData = () => {
    const cells = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => ({
        type: CELL_TYPES.SUMMER_GROUND,
        baseType: CELL_TYPES.SUMMER_GROUND,
        treeAge: null,
        groundFacilityKey: null,
        groundInstanceId: null,
        facilityKey: null,
        facilityInstanceId: null,
      }))
    );

    const treePositions = [];
    const blockWidth = 3;
    const blockHeight = 2;
    const preferredOffsets = [
      [1, 1],
      [1, 0],
      [2, 1],
      [0, 1],
      [2, 0],
      [0, 0],
    ];

    for (let blockY = 0; blockY < GRID_ROWS; blockY += blockHeight) {
      for (let blockX = 0; blockX < GRID_COLS; blockX += blockWidth) {
        const candidates = preferredOffsets
          .map(([offsetX, offsetY]) => [blockX + offsetX, blockY + offsetY])
          .filter(([x, y]) =>
            x > 0
            && y > 0
            && x < GRID_COLS - 1
            && y < GRID_ROWS - 1
            && cells[y]
            && cells[y][x]
            && isGroundCellType(cells[y][x].type)
          );
        const chosen = candidates[0];
        if (!chosen) continue;
        treePositions.push(chosen);
      }
    }

    treePositions.forEach(([x, y]) => {
      const bandRatio = GRID_ROWS <= 1 ? 0 : (y / (GRID_ROWS - 1));
      const treeAge = clampTreeAge(Math.floor(bandRatio * 6) + 1);
      cells[y][x].type = CELL_TYPES.TREE;
      cells[y][x].treeAge = treeAge;
    });

    return {
      cells,
      treePositions,
      orchardBounds: { x1: 1, y1: 1, x2: GRID_COLS - 2, y2: GRID_ROWS - 2 },
      utilityBounds: null,
    };
  };

  const cellClassNameOf = ({ cell, x, y }) => {
    const classNames = ['grid-cell'];
    const baseType = cell.baseType ?? cell.type;
    if (baseType === CELL_TYPES.ORCHARD) classNames.push('grid-cell--orchard');
    if (baseType === CELL_TYPES.SUMMER_GROUND) classNames.push('grid-cell--summer-ground');
    if (baseType === CELL_TYPES.WINTER_GROUND) classNames.push('grid-cell--winter-ground');
    if (cell.type === CELL_TYPES.TREE) {
      classNames.push('grid-cell--tree');
      classNames.push(getTreeAgeClass(cell.treeAge, 'grid-cell--tree-age'));
    }
    if (cell.type === CELL_TYPES.FACILITY) classNames.push('grid-cell--facility');
    if (cell.type === CELL_TYPES.SHED) classNames.push('grid-cell--facility', 'grid-cell--shed');
    if (cell.type === CELL_TYPES.WATER) classNames.push('grid-cell--water');
    if (cell.type === CELL_TYPES.APRON) classNames.push('grid-cell--apron');
    if (x === 0 || y === 0 || x === GRID_COLS - 1 || y === GRID_ROWS - 1) classNames.push('grid-cell--edge');
    return classNames.join(' ');
  };

  const createGridCellViewModel = ({ mapData, x, y }) => {
    const cell = mapData?.cells?.[y]?.[x];
    const type = cell?.type || CELL_TYPES.ORCHARD;
    const treeAge = clampTreeAge(cell?.treeAge);
    return {
      x,
      y,
      type,
      className: cellClassNameOf({ cell, x, y }),
      title: type === CELL_TYPES.TREE
        ? `${x + 1}열 / ${y + 1}행 / ${getTreeAgeLabel(treeAge)}`
        : `${x + 1}열 / ${y + 1}행 / ${type}`,
      treeAge: type === CELL_TYPES.TREE ? treeAge : null,
    };
  };

  const createGridCellViewModels = (mapData) => {
    const cells = [];
    for (let y = 0; y < GRID_ROWS; y += 1) {
      for (let x = 0; x < GRID_COLS; x += 1) {
        cells.push(createGridCellViewModel({ mapData, x, y }));
      }
    }
    return cells;
  };

  const createPlacementGhostLayout = ({
    startX,
    startY,
    facility,
    cellSize,
    gridOffsetLeft,
    gridOffsetTop,
  }) => ({
    left: gridOffsetLeft + (startX * cellSize),
    top: gridOffsetTop + (startY * cellSize),
    width: facility.width * cellSize,
    height: facility.height * cellSize,
  });

  const collectPlacedFacilityOverlays = ({
    mapData,
    installableByKey,
    gridOffsetLeft,
    gridOffsetTop,
    cellSize,
  }) => {
    const overlays = [];
    if (!mapData?.cells || !installableByKey || !cellSize) return overlays;

    for (let y = 0; y < GRID_ROWS; y += 1) {
      for (let x = 0; x < GRID_COLS; x += 1) {
        const cell = mapData.cells[y][x];
        const facility = cell?.facilityKey ? installableByKey[cell.facilityKey] : null;
        const facilityInstanceId = cell?.facilityInstanceId;
        if (!facility || facility.placementMode) continue;
        if (!facilityInstanceId) continue;
        if (x > 0 && mapData.cells[y][x - 1]?.facilityInstanceId === facilityInstanceId) continue;
        if (y > 0 && mapData.cells[y - 1][x]?.facilityInstanceId === facilityInstanceId) continue;

        overlays.push({
          x,
          y,
          facility,
          toneClass: facility.type === CELL_TYPES.WATER
            ? 'placed-facility-overlay--water'
            : facility.type === CELL_TYPES.WELL
              ? 'placed-facility-overlay--well'
              : 'placed-facility-overlay--facility',
          left: gridOffsetLeft + (x * cellSize),
          top: gridOffsetTop + (y * cellSize),
          width: facility.width * cellSize,
          height: facility.height * cellSize,
        });
      }
    }

    return overlays;
  };

  const getStageInnerSize = ({ stageWidth, stageHeight, padding = 52 }) => ({
    width: Math.max(0, Number(stageWidth || 0) - padding),
    height: Math.max(0, Number(stageHeight || 0) - padding),
  });

  const getPanBounds = ({
    gridWidth,
    gridHeight,
    zoom,
    stageWidth,
    stageHeight,
    padding = 52,
  }) => {
    const { width, height } = getStageInnerSize({ stageWidth, stageHeight, padding });
    const overflowX = Math.max(0, ((Number(gridWidth || 0) * zoom) - width) / 2);
    const overflowY = Math.max(0, ((Number(gridHeight || 0) * zoom) - height) / 2);
    return { overflowX, overflowY };
  };

  const clampPanPosition = ({ panX, panY, gridWidth, gridHeight, zoom, stageWidth, stageHeight, padding = 52 }) => {
    const { overflowX, overflowY } = getPanBounds({
      gridWidth,
      gridHeight,
      zoom,
      stageWidth,
      stageHeight,
      padding,
    });
    return {
      panX: Math.max(-overflowX, Math.min(overflowX, Number(panX || 0))),
      panY: Math.max(-overflowY, Math.min(overflowY, Number(panY || 0))),
    };
  };

  const createViewportRenderState = ({ zoom, panX, panY, isDragging }) => ({
    shellTransform: `translate(-50%, -50%) scale(${Number(zoom || 0).toFixed(3)})`,
    viewportTransform: `translate(${Number(panX || 0).toFixed(1)}px, ${Number(panY || 0).toFixed(1)}px)`,
    cursor: isDragging ? 'grabbing' : 'grab',
  });

  const createZoomState = ({
    nextZoom,
    currentZoom,
    panX,
    panY,
    anchorClientX = null,
    anchorClientY = null,
    stageRect = null,
    gridWidth,
    gridHeight,
    stageWidth,
    stageHeight,
    minZoom = MIN_ZOOM,
    maxZoom = MAX_ZOOM,
    padding = 52,
  }) => {
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, Number(nextZoom || currentZoom || minZoom)));
    let nextPanX = Number(panX || 0);
    let nextPanY = Number(panY || 0);

    if (
      stageRect
      && typeof anchorClientX === 'number'
      && typeof anchorClientY === 'number'
    ) {
      const anchorOffsetX = anchorClientX - (stageRect.left + stageRect.width / 2);
      const anchorOffsetY = anchorClientY - (stageRect.top + stageRect.height / 2);
      const worldX = (anchorOffsetX - nextPanX) / currentZoom;
      const worldY = (anchorOffsetY - nextPanY) / currentZoom;
      nextPanX = anchorOffsetX - (worldX * clampedZoom);
      nextPanY = anchorOffsetY - (worldY * clampedZoom);
    }

    const clampedPan = clampPanPosition({
      panX: nextPanX,
      panY: nextPanY,
      gridWidth,
      gridHeight,
      zoom: clampedZoom,
      stageWidth,
      stageHeight,
      padding,
    });

    return {
      zoom: clampedZoom,
      panX: clampedPan.panX,
      panY: clampedPan.panY,
    };
  };

  const createDragState = ({ dragOriginX, dragOriginY, dragStartX, dragStartY, clientX, clientY, gridWidth, gridHeight, zoom, stageWidth, stageHeight, padding = 52 }) => {
    const rawPanX = Number(dragOriginX || 0) + (Number(clientX || 0) - Number(dragStartX || 0));
    const rawPanY = Number(dragOriginY || 0) + (Number(clientY || 0) - Number(dragStartY || 0));
    return clampPanPosition({
      panX: rawPanX,
      panY: rawPanY,
      gridWidth,
      gridHeight,
      zoom,
      stageWidth,
      stageHeight,
      padding,
    });
  };

  const canPlaceFacilityAt = ({ mapData, startX, startY, facility }) => {
    if (!facility || !mapData?.cells) return false;
    const endX = startX + facility.width - 1;
    const endY = startY + facility.height - 1;
    if (endX >= GRID_COLS || endY >= GRID_ROWS) return false;

    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        const cell = mapData.cells?.[y]?.[x];
        if (!cell) return false;
        if (facility.placementMode === 'paint-tree') {
          if (!isGroundCellType(cell.type)) return false;
          continue;
        }
        if (facility.placementMode === 'paint-ground') {
          continue;
        }
        if (!isGroundCellType(cell.type) && cell.type !== CELL_TYPES.TREE) return false;
      }
    }
    return true;
  };

  const placeFacilityAt = ({ mapData, startX, startY, facility, facilityInstanceSeed }) => {
    if (!facility || !mapData?.cells) {
      return { placed: false, mapData, facilityInstanceSeed };
    }
    if (!canPlaceFacilityAt({ mapData, startX, startY, facility })) {
      return { placed: false, mapData, facilityInstanceSeed };
    }

    let nextSeed = Number(facilityInstanceSeed) || 1;

    if (facility.placementMode === 'paint-tree') {
      mapData.cells[startY][startX].type = CELL_TYPES.TREE;
      mapData.cells[startY][startX].treeAge = clampTreeAge(facility.treeAge);
      mapData.cells[startY][startX].facilityKey = facility.key;
      mapData.cells[startY][startX].facilityInstanceId = `paint-tree-${nextSeed += 1}`;
      const exists = mapData.treePositions.some(([treeX, treeY]) => treeX === startX && treeY === startY);
      if (!exists) mapData.treePositions.push([startX, startY]);
      return { placed: true, mapData, facilityInstanceSeed: nextSeed };
    }

    if (facility.placementMode === 'paint-ground') {
      mapData.cells[startY][startX].baseType = facility.type;
      mapData.cells[startY][startX].groundFacilityKey = facility.key;
      mapData.cells[startY][startX].groundInstanceId = `paint-ground-${nextSeed += 1}`;
      return { placed: true, mapData, facilityInstanceSeed: nextSeed };
    }

    const facilityInstanceId = `facility-${facility.key}-${nextSeed += 1}`;
    for (let y = startY; y < startY + facility.height; y += 1) {
      for (let x = startX; x < startX + facility.width; x += 1) {
        mapData.cells[y][x].type = facility.type;
        mapData.cells[y][x].treeAge = null;
        mapData.cells[y][x].facilityKey = facility.key;
        mapData.cells[y][x].facilityInstanceId = facilityInstanceId;
      }
    }
    mapData.treePositions = mapData.treePositions.filter(([treeX, treeY]) => {
      return !(treeX >= startX && treeX < startX + facility.width && treeY >= startY && treeY < startY + facility.height);
    });
    return { placed: true, mapData, facilityInstanceSeed: nextSeed };
  };

  return Object.freeze({
    GRID_COLS,
    GRID_ROWS,
    CELL_TYPES,
    isGroundCellType,
    clampTreeAge,
    getTreeAgeLabel,
    getTreeAgeClass,
    createDefaultSelectedPixelPreview,
    createSelectedPixelPreview,
    formatOrchardSummary,
    createTreeArtElement,
    createPlacedFacilityArtElement,
    normalizeInstallableFacilities,
    createInitialMapData,
    cellClassNameOf,
    createGridCellViewModel,
    createGridCellViewModels,
    createPlacementGhostLayout,
    collectPlacedFacilityOverlays,
    DEFAULT_ZOOM,
    MIN_ZOOM,
    MAX_ZOOM,
    ZOOM_SENSITIVITY,
    getStageInnerSize,
    getPanBounds,
    clampPanPosition,
    createViewportRenderState,
    createZoomState,
    createDragState,
    canPlaceFacilityAt,
    placeFacilityAt,
  });
})();
