import { roundKg } from '../../utils/common';

const STORAGE_SLOT_LABEL_PREFIX_BY_KIND = Object.freeze({
  harvest: '수확물 적재칸',
  sorting: '선별기 적재칸',
  workbench: '작업대 적재칸',
});

export const storageSlotLabelPrefixOf = (kind = 'harvest') => (
  STORAGE_SLOT_LABEL_PREFIX_BY_KIND[String(kind || 'harvest')] || STORAGE_SLOT_LABEL_PREFIX_BY_KIND.harvest
);

export const storageSlotLabelOf = (kind = 'harvest', indexOrSlotNo = 0, options = {}) => {
  const oneBased = Boolean(options?.oneBased);
  const rawValue = Math.floor(Number(indexOrSlotNo) || 0);
  const slotNo = oneBased ? Math.max(1, rawValue) : Math.max(1, rawValue + 1);
  return `${storageSlotLabelPrefixOf(kind)} ${slotNo}`;
};

export const normalizeWorkbenchStorageSlotLabel = (label, index) => {
  const fallback = storageSlotLabelOf('workbench', index);
  const text = String(label || '').trim();
  if (!text) return fallback;
  const normalized = text.replace(/\s+/g, ' ');
  if (
    normalized === `적재칸 ${Math.max(0, Math.floor(Number(index) || 0)) + 1}`
    || normalized === `작업칸 적재자리 ${Math.max(0, Math.floor(Number(index) || 0)) + 1}`
    || normalized === `작업대 적재자리 ${Math.max(0, Math.floor(Number(index) || 0)) + 1}`
  ) {
    return fallback;
  }
  return text;
};

const normalizeHarvestStorageSlotTone = (tone) => (
  tone === 'green' ? 'green' : (tone === 'yellow' ? 'yellow' : '')
);

const createHarvestStorageSlotToneArray = (maxBoxes = 36) => (
  Array.from({ length: Math.max(1, Math.floor(Number(maxBoxes) || 36)) }, () => '')
);

const assignHarvestStorageSlotToneToFirstEmpty = (slotTones, tone = 'yellow') => {
  if (!Array.isArray(slotTones)) return 0;
  const emptyIndex = slotTones.findIndex((value) => !value);
  if (emptyIndex < 0) return 0;
  slotTones[emptyIndex] = normalizeHarvestStorageSlotTone(tone) || 'yellow';
  return emptyIndex + 1;
};

export const buildHarvestStorageSlotToneArray = (
  rawEntryOrQty,
  {
    boxCapacityKg = 20,
    maxBoxes = 36,
  } = {}
) => {
  const entry = (rawEntryOrQty && typeof rawEntryOrQty === 'object') ? rawEntryOrQty : null;
  const qtyKg = Math.max(0, Number(entry?.qtyKg ?? rawEntryOrQty) || 0);
  const safeBoxCapacityKg = Math.max(1, Number(boxCapacityKg) || 20);
  const safeMaxBoxes = Math.max(1, Math.floor(Number(maxBoxes) || 36));
  if (!entry || qtyKg <= 0) return createHarvestStorageSlotToneArray(safeMaxBoxes);
  const slotTones = createHarvestStorageSlotToneArray(safeMaxBoxes);
  const hasExplicitShapeMeta = (
    entry?.storagePalletBoxCount != null
    || entry?.storageBoxCount != null
    || entry?.storagePalletPartialBoxCount != null
    || entry?.storagePartialBoxCount != null
    || entry?.storagePalletRemainderKg != null
    || entry?.storageRemainderKg != null
    || Array.isArray(entry?.filledBoxTones)
    || Array.isArray(entry?.filledBoxSlotTones)
    || Array.isArray(entry?.partialBoxTones)
  );
  const explicitSlotTones = Array.isArray(entry?.filledBoxSlotTones) ? entry.filledBoxSlotTones : [];
  explicitSlotTones.slice(0, safeMaxBoxes).forEach((tone, index) => {
    const normalizedTone = normalizeHarvestStorageSlotTone(tone);
    if (normalizedTone) slotTones[index] = normalizedTone;
  });
  const explicitSlotCount = slotTones.reduce((sum, tone) => sum + (normalizeHarvestStorageSlotTone(tone) ? 1 : 0), 0);
  const sequentialTones = Array.isArray(entry?.filledBoxTones) ? entry.filledBoxTones : [];
  const explicitFullBoxCount = Math.max(
    0,
    Math.min(
      safeMaxBoxes,
      Math.floor(Number(entry?.storagePalletBoxCount ?? entry?.storageBoxCount) || 0)
    )
  );
  const inferredFullBoxCount = Math.max(
    0,
    Math.min(
      safeMaxBoxes,
      hasExplicitShapeMeta
        ? explicitFullBoxCount
        : Math.max(explicitFullBoxCount, Math.floor(qtyKg / safeBoxCapacityKg))
    )
  );
  const fullBoxTargetCount = explicitSlotCount > 0
    ? Math.max(0, Math.min(safeMaxBoxes, sequentialTones.length))
    : Math.max(inferredFullBoxCount, sequentialTones.length);
  const assignedFullBoxCount = slotTones.reduce((sum, tone) => sum + (normalizeHarvestStorageSlotTone(tone) ? 1 : 0), 0);
  const missingFullBoxCount = Math.max(
    0,
    Math.min(
      safeMaxBoxes - assignedFullBoxCount,
      fullBoxTargetCount - assignedFullBoxCount
    )
  );
  for (let index = 0; index < missingFullBoxCount; index += 1) {
    assignHarvestStorageSlotToneToFirstEmpty(slotTones, sequentialTones[index + assignedFullBoxCount]);
  }
  const partialBoxTones = Array.isArray(entry?.partialBoxTones) ? entry.partialBoxTones : [];
  const explicitPartialBoxCount = Math.max(
    0,
    Math.min(
      safeMaxBoxes - slotTones.reduce((sum, tone) => sum + (normalizeHarvestStorageSlotTone(tone) ? 1 : 0), 0),
      Math.max(
        Math.floor(Number(entry?.storagePalletPartialBoxCount ?? entry?.storagePartialBoxCount) || 0),
        partialBoxTones.length
      )
    )
  );
  const partialBoxesToAssign = explicitSlotCount > 0 ? 0 : explicitPartialBoxCount;
  for (let index = 0; index < partialBoxesToAssign; index += 1) {
    assignHarvestStorageSlotToneToFirstEmpty(
      slotTones,
      partialBoxTones[index] || (String(entry?.boxTone || '') === 'green' ? 'green' : 'yellow')
    );
  }
  const remainderKg = Math.max(
    0,
    Number(entry?.storagePalletRemainderKg ?? entry?.storageRemainderKg) || (
      qtyKg % safeBoxCapacityKg
    )
  );
  if (remainderKg > 0.001 && explicitPartialBoxCount <= 0 && explicitSlotCount <= 0) {
    assignHarvestStorageSlotToneToFirstEmpty(
      slotTones,
      String(entry?.boxTone || '') === 'green' ? 'green' : 'yellow'
    );
  }
  return slotTones;
};

export const harvestStorageSlotLoadMeta = (
  rawEntryOrQty,
  {
    boxCapacityKg = 20,
    maxBoxes = 36,
  } = {}
) => {
  const entry = (rawEntryOrQty && typeof rawEntryOrQty === 'object') ? rawEntryOrQty : null;
  const qtyKg = Math.max(0, Number(entry?.qtyKg ?? rawEntryOrQty) || 0);
  if (qtyKg <= 0) return { qtyKg: 0, fullBoxes: 0, partialBoxes: 0, remainderKg: 0 };
  const safeBoxCapacityKg = Math.max(1, Number(boxCapacityKg) || 20);
  const safeMaxBoxes = Math.max(1, Math.floor(Number(maxBoxes) || 36));
  const visualSlotTones = buildHarvestStorageSlotToneArray(entry, {
    boxCapacityKg: safeBoxCapacityKg,
    maxBoxes: safeMaxBoxes,
  });
  const explicitSlotCount = visualSlotTones.reduce((sum, tone) => sum + (normalizeHarvestStorageSlotTone(tone) ? 1 : 0), 0);
  const sequentialFullBoxCount = Array.isArray(entry?.filledBoxTones)
    ? Math.max(0, Math.min(safeMaxBoxes, entry.filledBoxTones.length))
    : 0;
  const storedBoxCount = Math.max(0, Math.floor(Number(entry?.storagePalletBoxCount ?? entry?.storageBoxCount) || 0));
  const inferredFullBoxes = Math.floor(qtyKg / safeBoxCapacityKg);
  const hasExplicitShapeMeta = Boolean(entry) && (
    entry?.storagePalletBoxCount != null
    || entry?.storageBoxCount != null
    || entry?.storagePalletPartialBoxCount != null
    || entry?.storagePartialBoxCount != null
    || Array.isArray(entry?.partialBoxTones)
    || Number.isFinite(Number(entry?.totalBoxCount))
  );
  const fullBoxes = entry
    ? Math.min(
      safeMaxBoxes,
      hasExplicitShapeMeta
        ? storedBoxCount
        : Math.max(storedBoxCount, inferredFullBoxes)
    )
    : inferredFullBoxes;
  const storedRemainderKg = Math.max(0, Number(entry?.storagePalletRemainderKg ?? entry?.storageRemainderKg) || 0);
  const inferredRemainderKg = roundKg(qtyKg - (inferredFullBoxes * safeBoxCapacityKg), 2);
  const remainderKg = roundKg((
    (
      hasExplicitShapeMeta
        ? storedRemainderKg
        : Math.max(storedRemainderKg, inferredRemainderKg)
    ) + Number.EPSILON
  ), 2);
  const explicitPartialBoxSource = entry
    ? (
      entry?.storagePalletPartialBoxCount
      ?? entry?.storagePartialBoxCount
      ?? (Array.isArray(entry?.partialBoxTones) ? entry.partialBoxTones.length : null)
      ?? (
        Number.isFinite(Number(entry?.totalBoxCount))
          ? (Number(entry.totalBoxCount) - fullBoxes)
          : 0
      )
      )
    : 0;
  const explicitPartialBoxes = Math.max(0, Math.floor(Number(explicitPartialBoxSource) || 0));
  const inferredPartialBoxes = remainderKg > 0.001 ? 1 : 0;
  const basePartialBoxes = Math.max(
    0,
    Math.min(
      safeMaxBoxes - fullBoxes,
      entry
        ? (
          hasExplicitShapeMeta
            ? Math.max(explicitPartialBoxes, (explicitPartialBoxes <= 0 && remainderKg > 0.001 ? 1 : 0))
            : Math.max(explicitPartialBoxes, inferredPartialBoxes)
        )
        : inferredPartialBoxes
    )
  );
  if (explicitSlotCount > 0) {
    const authoritativeFullBoxes = Math.max(
      0,
      Math.min(
        safeMaxBoxes,
        sequentialFullBoxCount > 0
          ? sequentialFullBoxCount
          : fullBoxes
      )
    );
    const occupiedBoxes = Math.max(
      explicitSlotCount,
      authoritativeFullBoxes + (explicitSlotCount <= authoritativeFullBoxes ? basePartialBoxes : 0)
    );
    const partialBoxes = Math.max(
      0,
      Math.min(
        safeMaxBoxes - authoritativeFullBoxes,
        occupiedBoxes - authoritativeFullBoxes
      )
    );
    return {
      qtyKg,
      fullBoxes: Math.max(0, Math.min(safeMaxBoxes, occupiedBoxes - partialBoxes)),
      partialBoxes,
      remainderKg
    };
  }
  return { qtyKg, fullBoxes, partialBoxes: basePartialBoxes, remainderKg };
};

export const harvestStorageSlotLoadLabel = (rawEntryOrQty, options = {}) => {
  const safeMaxBoxes = Math.max(1, Math.floor(Number(options?.maxBoxes) || 36));
  const { qtyKg, fullBoxes, partialBoxes, remainderKg } = harvestStorageSlotLoadMeta(rawEntryOrQty, options);
  if (qtyKg <= 0) return '';
  const occupiedBoxes = fullBoxes + partialBoxes;
  const boxLabel = `${occupiedBoxes.toLocaleString()}박스/${safeMaxBoxes.toLocaleString()}박스`;
  return boxLabel;
};

export const harvestStorageSlotFilledBoxCount = (rawEntryOrQty, options = {}) => {
  const safeMaxBoxes = Math.max(1, Math.floor(Number(options?.maxBoxes) || 36));
  const { fullBoxes } = harvestStorageSlotLoadMeta(rawEntryOrQty, options);
  return Math.max(0, Math.min(safeMaxBoxes, fullBoxes));
};

export const harvestStorageSlotVisualFilledBoxCount = (rawEntryOrQty, options = {}) => {
  const safeMaxBoxes = Math.max(1, Math.floor(Number(options?.maxBoxes) || 36));
  const { fullBoxes, partialBoxes } = harvestStorageSlotLoadMeta(rawEntryOrQty, options);
  return Math.max(0, Math.min(safeMaxBoxes, fullBoxes + partialBoxes));
};

export const projectHarvestStorageLayerEntry = (layerEntry, { slotNo = 0 } = {}) => {
  if (!layerEntry || typeof layerEntry !== 'object') return null;
  return {
    sourceType: String(layerEntry?.sourceType || 'harvest'),
    sourceLabel: String(layerEntry?.sourceLabel || ''),
    qtyKg: Math.max(0, Number(layerEntry?.qtyKg) || 0),
    loadBoxKey: String(layerEntry?.loadBoxKey || ''),
    boxTone: String(layerEntry?.boxTone || ''),
    filledBoxTones: Array.isArray(layerEntry?.filledBoxTones) ? layerEntry.filledBoxTones : [],
    filledBoxSlotTones: Array.isArray(layerEntry?.filledBoxSlotTones) ? layerEntry.filledBoxSlotTones : [],
    partialBoxTones: Array.isArray(layerEntry?.partialBoxTones) ? layerEntry.partialBoxTones : [],
    storagePalletBoxCount: Math.max(0, Math.floor(Number(layerEntry?.storagePalletBoxCount) || 0)),
    storagePalletPartialBoxCount: Math.max(0, Math.floor(Number(layerEntry?.storagePalletPartialBoxCount) || 0)),
    storagePalletRemainderKg: Math.max(0, Number(layerEntry?.storagePalletRemainderKg) || 0),
    slotNo: Math.max(0, Math.floor(Number(slotNo || layerEntry?.slotNo) || 0)),
  };
};

export const projectHarvestStorageDisplayFields = (
  entry,
  {
    slotNo = 0,
    palletCapacityKg = 720,
    aggregateLayerQty = false,
  } = {}
) => {
  if (!entry || typeof entry !== 'object') return null;
  const safeSlotNo = Math.max(0, Math.floor(Number(slotNo || entry?.slotNo) || 0));
  const sourceType = String(entry?.sourceType || '');
  const isFloorStored = sourceType === 'floorHarvest';
  const isHarvestStored = sourceType === 'harvest' || isFloorStored;
  const topLayer = projectHarvestStorageLayerEntry(entry?.topLayer || null, { slotNo: safeSlotNo });
  const bottomQtyKg = Math.max(0, Number(entry?.qtyKg) || 0);
  const topQtyKg = Math.max(0, Number(topLayer?.qtyKg) || 0);
  const qtyKg = aggregateLayerQty ? (bottomQtyKg + topQtyKg) : bottomQtyKg;
  const floorBoxCount = Math.max(0, Math.floor(Number(entry?.floorBoxCount) || 0));
  const visualSlotTones = buildHarvestStorageSlotToneArray(entry);
  return {
    sourceType,
    sourceLabel: String(entry?.sourceLabel || ''),
    isFloorStored,
    isHarvestStored,
    hasTopLayer: Boolean(topLayer),
    qtyKg,
    remainKg: Math.max(0, Math.max(0, Number(palletCapacityKg) || 0) - qtyKg),
    loadBoxKey: String(entry?.loadBoxKey || ''),
    boxTone: String(entry?.boxTone || ''),
    filledBoxTones: Array.isArray(entry?.filledBoxTones) ? entry.filledBoxTones : [],
    filledBoxSlotTones: visualSlotTones,
    partialBoxTones: Array.isArray(entry?.partialBoxTones) ? entry.partialBoxTones : [],
    topLayer,
    storagePalletBoxCount: Math.max(0, Math.floor(Number(entry?.storagePalletBoxCount) || 0)),
    storagePalletPartialBoxCount: Math.max(0, Math.floor(Number(entry?.storagePalletPartialBoxCount) || 0)),
    storagePalletRemainderKg: Math.max(0, Number(entry?.storagePalletRemainderKg) || 0),
    floorBoxText: String(entry?.floorBoxText || ''),
    floorDetailText: String(entry?.floorDetailText || ''),
    floorSourceRows: Array.isArray(entry?.floorSourceRows) ? entry.floorSourceRows : [],
    loadLabel: isFloorStored ? String(entry?.floorBoxText || '') : harvestStorageSlotLoadLabel(entry),
    filledBoxCount: isFloorStored
      ? floorBoxCount
      : visualSlotTones.reduce((sum, tone) => sum + (normalizeHarvestStorageSlotTone(tone) ? 1 : 0), 0),
    topLayerFilledBoxCount: harvestStorageSlotFilledBoxCount(topLayer),
  };
};

export const harvestStorageMoveStatusLabelOf = (
  target,
  {
    disabled = false,
    isSelectedSourceSlot = false,
    sameSourceLabel = '선택됨',
    fallbackDisabledLabel = '선택 불가',
    stackTopLabel = '2단 적재',
    floorHarvestLabel = '바닥 추가 적재',
    harvestPalletLabel = '추가 적재',
    emptyPalletLabel = '빈 팔레트',
    emptyLabel = '이동 가능',
    occupiedLabel = '이동 가능',
  } = {}
) => {
  if (isSelectedSourceSlot) return sameSourceLabel;
  if (disabled) return String(target?.blockReason || target?.displayLabel || fallbackDisabledLabel);
  const targetType = String(target?.targetType || '');
  if (targetType === 'warehouse-stack-top') return stackTopLabel;
  if (targetType === 'warehouse-floor-harvest') return floorHarvestLabel;
  if (targetType === 'warehouse-harvest-pallet') return harvestPalletLabel;
  if (targetType === 'warehouse-empty-pallet') return emptyPalletLabel;
  if (targetType === 'warehouse-empty') return emptyLabel;
  return occupiedLabel;
};

export const harvestStorageMoveTargetButtonLabelOf = ({ disabled = false } = {}) => (
  disabled ? '적재 불가' : '적재'
);

export const harvestStorageSlotPrimaryActionLabelOf = ({ occupied = false } = {}) => (
  occupied ? '이동' : '팔레트 적재'
);
