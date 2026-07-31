import React from 'react';
import { workbenchCargoStorageSlotNoOf } from './workbenchStorageSlots';
import {
  buildHarvestPalletMemoColorStyle,
  resolveHarvestPalletMemoLayer,
} from './harvestPalletMemo';
import { workbenchTaskLabelOf } from './workbenchTaskOptions';
import WarehouseHarvestSlotCardFrame from './WarehouseHarvestSlotCardFrame';
import { normalizeHarvestGradeLabel } from '../../utils/harvestGrade';

const WORKBENCH_EMPTY_SLOT_COLLAPSE_STORAGE_KEY = 'warehouse_workbench_empty_slot_collapse_v1';

function isGreenToneToken(...values) {
  return values.some((value) => {
    const token = String(value || '').toLowerCase();
    return token.includes('green') || token.includes('초록') || token.includes('녹색');
  });
}

function resolveHarvestBoxTone({
  entry = null,
  displayBoxIndex = 0,
  harvestPalletBoxToneAt = null,
  tooltip = null,
}) {
  const toneFromEntryFn = typeof harvestPalletBoxToneAt === 'function'
    ? harvestPalletBoxToneAt(entry, displayBoxIndex)
    : '';
  if (toneFromEntryFn === 'green' || toneFromEntryFn === 'yellow') return toneFromEntryFn;
  if (String(tooltip?.tone || '') === 'green') return 'green';
  return isGreenToneToken(entry?.boxTone, entry?.loadBoxKey, entry?.imageItemKey, entry?.tone) ? 'green' : 'yellow';
}

function isStemAttachedLike(entry) {
  if (!entry) return false;
  if (typeof entry?.stemRemoved === 'boolean') return entry.stemRemoved === false;
  const stemStatusKey = String(entry?.stemStatusKey || entry?.stemStatus || '').trim();
  if (stemStatusKey) {
    return stemStatusKey === 'attached' || stemStatusKey === '꼭지있음' || stemStatusKey === '꼭지 있음';
  }
  const stemStatusLabel = String(entry?.stemStatusLabel || entry?.stemLabel || '').trim();
  return stemStatusLabel === '꼭지있음' || stemStatusLabel === '꼭지 있음';
}

function countStemAttachedBoxesInSlot(slotNoRaw, harvestSlotRowMap = {}, harvestBoxTooltipBySlot = {}) {
  const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
  if (slotNo <= 0) return 0;
  const slotRow = harvestSlotRowMap?.[slotNo] || null;
  if (!slotRow || slotRow?.hasTopLayer) return 0;

  const bottomTooltips = Array.isArray(harvestBoxTooltipBySlot?.[slotNo]?.bottom)
    ? harvestBoxTooltipBySlot[slotNo].bottom
    : [];
  const tooltipCount = bottomTooltips.filter((tooltipEntry) => isStemAttachedLike(tooltipEntry)).length;
  if (tooltipCount > 0) return tooltipCount;

  const floorSourceRows = Array.isArray(slotRow?.floorSourceRows) ? slotRow.floorSourceRows : [];
  const floorCount = floorSourceRows.filter((row) => isStemAttachedLike(row)).length;
  if (floorCount > 0) return floorCount;

  return isStemAttachedLike(slotRow) ? 1 : 0;
}

function countAnyBoxesInSlot(slotNoRaw, harvestSlotRowMap = {}, harvestBoxTooltipBySlot = {}) {
  const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
  if (slotNo <= 0) return 0;
  const slotRow = harvestSlotRowMap?.[slotNo] || null;
  if (!slotRow || slotRow?.hasTopLayer) return 0;

  const bottomTooltips = Array.isArray(harvestBoxTooltipBySlot?.[slotNo]?.bottom)
    ? harvestBoxTooltipBySlot[slotNo].bottom
    : [];
  if (bottomTooltips.length > 0) return bottomTooltips.length;

  const floorSourceRows = Array.isArray(slotRow?.floorSourceRows) ? slotRow.floorSourceRows : [];
  if (floorSourceRows.length > 0) return floorSourceRows.length;

  return slotRow?.occupied ? 1 : 0;
}

function isUnsortedLike(entry) {
  const gradeLabel = normalizeHarvestGradeLabel(entry?.gradeLabel, '미선별') || '미선별';
  return gradeLabel === '미선별';
}

function countUnsortedBoxesInSlot(slotNoRaw, harvestSlotRowMap = {}, harvestBoxTooltipBySlot = {}) {
  const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
  if (slotNo <= 0) return 0;
  const slotRow = harvestSlotRowMap?.[slotNo] || null;
  if (!slotRow || slotRow?.hasTopLayer) return 0;

  const bottomTooltips = Array.isArray(harvestBoxTooltipBySlot?.[slotNo]?.bottom)
    ? harvestBoxTooltipBySlot[slotNo].bottom
    : [];
  const tooltipCount = bottomTooltips.filter((tooltipEntry) => isUnsortedLike(tooltipEntry)).length;
  if (tooltipCount > 0) return tooltipCount;

  const floorSourceRows = Array.isArray(slotRow?.floorSourceRows) ? slotRow.floorSourceRows : [];
  const floorCount = floorSourceRows.filter((row) => isUnsortedLike(row)).length;
  if (floorCount > 0) return floorCount;

  return isUnsortedLike(slotRow) ? 1 : 0;
}

function buildStaticHarvestBoxEntries({
  entry,
  filledBoxCount,
  harvestBoxesPerPallet,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxFilledAt,
  harvestPalletBoxToneAt,
  boxTooltips = [],
}) {
  return Array.from({ length: harvestBoxesPerPallet }, (_, boxIndex) => {
    const displayBoxIndex = typeof harvestPalletDisplayBoxIndexOf === 'function'
      ? harvestPalletDisplayBoxIndexOf(boxIndex)
      : boxIndex;
    const filled = typeof harvestPalletBoxFilledAt === 'function'
      ? harvestPalletBoxFilledAt(entry, displayBoxIndex)
      : displayBoxIndex < Math.max(0, Math.floor(Number(filledBoxCount) || 0));
    const tooltip = Array.isArray(boxTooltips) ? (boxTooltips[displayBoxIndex] || null) : null;
    return {
      key: `static-harvest-box-${boxIndex + 1}`,
      filled,
      tooltip,
      tone: resolveHarvestBoxTone({
        entry,
        displayBoxIndex,
        harvestPalletBoxToneAt,
        tooltip,
      }),
    };
  });
}

function buildEmptyHarvestBoxEntries({
  harvestBoxesPerPallet,
}) {
  return Array.from({ length: harvestBoxesPerPallet }, (_, boxIndex) => ({
    key: `empty-harvest-box-${boxIndex + 1}`,
    filled: false,
    tone: 'yellow',
  }));
}

const COMPATIBLE_WAREHOUSE_TARGET_TYPES = new Set([
  'warehouse-empty',
  'warehouse-stack-top',
  'warehouse-floor-harvest',
  'warehouse-empty-pallet',
  'warehouse-harvest-pallet',
]);

function isSamePendingHarvestTarget(target, pendingTarget) {
  if (!target || !pendingTarget) return false;
  const targetType = String(target?.targetType || '');
  const pendingType = String(pendingTarget?.targetType || '');
  const sameType = targetType === pendingType
    || (
      COMPATIBLE_WAREHOUSE_TARGET_TYPES.has(targetType)
      && COMPATIBLE_WAREHOUSE_TARGET_TYPES.has(pendingType)
    );
  return sameType
    && String(target?.facilityKey || '') === String(pendingTarget?.facilityKey || '')
    && Number(target?.slotNo || 0) === Number(pendingTarget?.slotNo || 0);
}

function buildInteractiveHarvestBoxEntries({
  entry,
  storageSlotNo,
  sourceLayerKey = 'bottom',
  sourceMeta = null,
  harvestBoxesPerPallet,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxFilledAt,
  harvestPalletBoxToneAt,
  visibleFilledSlots = null,
  boxTooltips = [],
  canPickBoxesIndividually = false,
  canChooseSingleLayerBoxTarget = false,
  canSendBoxesBackToTransportDock = false,
  canReceiveBoxesFromTransportDock = false,
  moveTarget = null,
  chooseHarvestMoveTarget = null,
  pickIndividualHarvestBoxToTransport = null,
  pickIndividualTransportDockHarvestBoxToTransport = null,
  pickIndividualHarvestBoxToSelectedTransportDock = null,
}) {
  return Array.from({ length: harvestBoxesPerPallet }, (_, boxIndex) => {
    const displayBoxIndex = typeof harvestPalletDisplayBoxIndexOf === 'function'
      ? harvestPalletDisplayBoxIndexOf(boxIndex)
      : boxIndex;
    const isFilledBox = Array.isArray(visibleFilledSlots)
      ? Boolean(visibleFilledSlots[displayBoxIndex])
      : (
        typeof harvestPalletBoxFilledAt === 'function'
          ? harvestPalletBoxFilledAt(entry, displayBoxIndex)
          : false
      );
    const canPickThisBox = canPickBoxesIndividually && isFilledBox;
    const canChooseThisBoxTarget = false;
    const canReceiveThisBox = canReceiveBoxesFromTransportDock && !isFilledBox;
    const canSendThisBoxBackToTransport = canSendBoxesBackToTransportDock && isFilledBox;
    const boxDomId = `warehouse-slot-box:${storageSlotNo}:${sourceLayerKey}:${displayBoxIndex}`;
    const isInteractiveBox = canPickThisBox || canChooseThisBoxTarget || canReceiveThisBox || canSendThisBoxBackToTransport;
    const tooltip = Array.isArray(boxTooltips) ? (boxTooltips[displayBoxIndex] || null) : null;
    const sourceVisualSlotNo = Math.max(1, Math.floor(Number(tooltip?.sourceVisualSlotNo || tooltip?.visualSlotNo) || displayBoxIndex + 1));
    const sourcePayload = {
      sourceType: 'warehouse-slot',
      sourceSlotNo: storageSlotNo,
      sourceLayerKey,
      sourceFloorStored: Boolean(sourceMeta?.isFloorStored || sourceMeta?.sourceFloorStored),
      sourceDomId: boxDomId,
      sourceVisualSlotNo,
      sourceDisplaySlotNo: displayBoxIndex + 1,
      sourceBatchId: String(tooltip?.sourceBatchId || ''),
      sourceBoxUnitNo: Math.max(0, Math.floor(Number(tooltip?.sourceBoxUnitNo) || 0)),
      warehouseSubTab: String(sourceMeta?.warehouseSubTab || ''),
    };
    return {
      key: `interactive-harvest-box-${storageSlotNo}-${sourceLayerKey}-${boxIndex + 1}`,
      filled: isFilledBox,
      tone: resolveHarvestBoxTone({
        entry,
        displayBoxIndex,
        harvestPalletBoxToneAt,
        tooltip,
      }),
      tooltip,
      dataSourceId: canPickThisBox ? boxDomId : undefined,
      pickable: isInteractiveBox,
      onClick: canReceiveThisBox
        ? () => pickIndividualTransportDockHarvestBoxToTransport?.(sourcePayload)
        : canSendThisBoxBackToTransport
          ? () => pickIndividualHarvestBoxToSelectedTransportDock?.(sourcePayload)
          : canPickThisBox
              ? () => pickIndividualHarvestBoxToTransport?.(sourcePayload)
              : undefined,
    };
  });
}

function FacilityHarvestBoxGrid({
  boxEntries = [],
}) {
  const hasFilledBoxes = boxEntries.some((boxEntry) => Boolean(boxEntry?.filled));
  return (
    <div
      className={`warehouse-harvest-slot-box-grid warehouse-harvest-slot-box-grid--layer ${hasFilledBoxes ? 'has-filled-boxes' : ''}`.trim()}
    >
      {boxEntries.map((boxEntry, boxIndex) => {
        const tooltip = boxEntry?.tooltip || null;
        const toneClassName = boxEntry?.tone === 'packed' ? 'is-packed' : (boxEntry?.tone === 'green' ? 'is-green' : 'is-yellow');
        const className = `warehouse-harvest-slot-box ${typeof boxEntry?.onClick === 'function' || typeof boxEntry?.onPointerDown === 'function' ? 'warehouse-harvest-slot-box-button' : ''} ${boxEntry?.filled ? 'is-filled' : ''} ${toneClassName} ${boxEntry?.pickable ? 'is-box-pickable' : ''}`.trim();
        const commonProps = {
          key: boxEntry?.key || `facility-harvest-box-${boxIndex + 1}`,
          className,
          style: boxEntry?.style,
          'aria-label': boxEntry?.filled ? String(tooltip?.text || '') : '',
          title: boxEntry?.filled ? String(tooltip?.text || '') : '',
          'data-harvest-move-source-id': boxEntry?.dataSourceId,
        };
        if (typeof boxEntry?.onClick === 'function' || typeof boxEntry?.onPointerDown === 'function') {
          return (
            <button
              {...commonProps}
              type="button"
              tabIndex={-1}
              onPointerDown={boxEntry?.onPointerDown}
              onClick={boxEntry?.onClick}
            />
          );
        }
        return <span {...commonProps} />;
      })}
    </div>
  );
}

function FacilityHarvestSlotCard({
  slotNo = 0,
  slotLabel = '',
  slotEntry = null,
  palletImageSrc = '',
  activeFacilityStorageKey = '',
  openHarvestDetail = null,
  editHarvestPalletMemo = null,
  openHarvestPalletMovePicker = null,
  selectedTransportRow = null,
  selectedTransportCanMovePallet = false,
  selectedTransportCanStackPallet = false,
  selectedTransportHasPalletOnDock = false,
  selectedTransportIndividualCarryLimit = 0,
  selectedTransportMode = 'pallet',
  harvestMoveActive = false,
  pendingHarvestMoveTarget = null,
  chooseHarvestMoveTarget = null,
  pickIndividualHarvestBoxToTransport = null,
  pickIndividualTransportDockHarvestBoxToTransport = null,
  pickIndividualHarvestBoxToSelectedTransportDock = null,
  movingHarvestPreviewSource = null,
  movingHarvestPreviewBoxCount = 0,
  movingHarvestPreviewFilledBoxCount = 0,
  visibleLayerBySlot = {},
  setVisibleLayerBySlot = null,
  harvestPalletDisplayBoxIndexOf = null,
  harvestPalletBoxFilledAt = null,
  harvestPalletVisibleFilledSlotsAfterPreview = null,
  harvestPalletBoxToneAt = null,
  harvestBoxesPerPallet = 0,
  harvestBoxTooltipBySlot = {},
  cardClassName = '',
  headerNode = null,
  openDetailSource = null,
  movePickerMeta = null,
  manualContent = null,
  hideLoadLabel = false,
}) {
  const isIndividualTransportMode = String(selectedTransportMode || 'pallet') === 'individual';
  const hasTopLayer = Boolean(slotEntry?.topLayer || slotEntry?.bottomLayer?.topLayer);
  const visibleLayerKey = hasTopLayer && visibleLayerBySlot?.[slotNo] === 'top'
    ? 'top'
    : 'bottom';
  const bottomLayerEntry = slotEntry?.bottomLayer || null;
  const topLayerEntry = slotEntry?.topLayer || slotEntry?.bottomLayer?.topLayer || null;
  const visibleLayerEntry = visibleLayerKey === 'top' ? topLayerEntry : bottomLayerEntry;
  const countLayerBoxes = React.useCallback((entry, fallbackCount = 0) => {
    if (!entry) return 0;
    if (typeof harvestPalletBoxFilledAt === 'function' && harvestBoxesPerPallet > 0) {
      return Array.from({ length: harvestBoxesPerPallet }, (_, boxIndex) => {
        const displayBoxIndex = typeof harvestPalletDisplayBoxIndexOf === 'function'
          ? harvestPalletDisplayBoxIndexOf(boxIndex)
          : boxIndex;
        return harvestPalletBoxFilledAt(entry, displayBoxIndex) ? 1 : 0;
      }).reduce((sum, filled) => sum + filled, 0);
    }
    return Math.max(
      0,
      Math.floor(
        Number(
          fallbackCount
          || entry?.storagePalletBoxCount
          || 0
        ) || 0,
      ),
    );
  }, [harvestBoxesPerPallet, harvestPalletBoxFilledAt, harvestPalletDisplayBoxIndexOf]);
  const movingSourceType = String(movingHarvestPreviewSource?.sourceType || '');
  const movingSourceSlotNo = Math.max(0, Math.floor(Number(movingHarvestPreviewSource?.sourceSlotNo) || 0));
  const movingSourceLayerKey = String(movingHarvestPreviewSource?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
  const isMovingEmptyPalletWholePallet = !isIndividualTransportMode
    && (
      movingSourceType === 'empty-pallet-stock'
      || Boolean(movingHarvestPreviewSource?.isEmptyPallet)
      || Boolean(movingHarvestPreviewSource?.isEmptyPalletSnapshot)
    );
  const moveTarget = slotEntry?.target || null;
  const moveTargetType = String(moveTarget?.targetType || '');
  const isPendingMoveTarget = isSamePendingHarvestTarget(moveTarget, pendingHarvestMoveTarget);
  const moveTargetDisabledReason = !moveTarget?.canChoose
    ? String(moveTarget?.blockReason || '현재 선택 상태로는 이 저장공간에 적재할 수 없습니다.')
    : '';
  const isCurrentMoveSourceSlot = harvestMoveActive
    && movingSourceType === 'warehouse-slot'
    && movingSourceSlotNo === Math.max(0, Number(slotNo || 0));
  const hideEmptyPalletNonStackPlaceAction = isMovingEmptyPalletWholePallet
    && Boolean(slotEntry?.occupied)
    && moveTargetType !== 'warehouse-stack-top';
  const canStartIndividualWarehouseTargetSelection = Boolean(selectedTransportRow)
    && isIndividualTransportMode
    && Boolean(moveTarget)
    && !isCurrentMoveSourceSlot
    && (
      moveTargetType === 'warehouse-empty'
      || moveTargetType === 'warehouse-floor-harvest'
      || moveTargetType === 'warehouse-empty-pallet'
      || moveTargetType === 'warehouse-harvest-pallet'
    );
  const shouldUseMoveTargetAction = (
    (
      harvestMoveActive
      && Boolean(moveTarget)
      && !isCurrentMoveSourceSlot
      && (
        isIndividualTransportMode
          ? (
            moveTargetType === 'warehouse-empty'
            || moveTargetType === 'warehouse-floor-harvest'
            || moveTargetType === 'warehouse-empty-pallet'
            || moveTargetType === 'warehouse-harvest-pallet'
          )
          : (
            moveTargetType === 'warehouse-empty'
            || moveTargetType === 'warehouse-stack-top'
          )
      )
    )
    || canStartIndividualWarehouseTargetSelection
  ) && !hideEmptyPalletNonStackPlaceAction;
  const isMovingWholePalletSource = movingSourceType === 'warehouse-slot'
    && !isIndividualTransportMode
    && movingSourceSlotNo === Math.max(0, Number(slotNo || 0))
    && movingSourceLayerKey === visibleLayerKey;
  const effectiveOccupied = isMovingWholePalletSource ? false : Boolean(slotEntry?.occupied);
  const effectiveIsHarvestStored = isMovingWholePalletSource ? false : Boolean(slotEntry?.hasStoredHarvest);
  const effectiveIsFloorStored = isMovingWholePalletSource ? false : Boolean(slotEntry?.isFloorStored);
  const effectiveHasEmptyPallet = isMovingWholePalletSource ? false : Boolean(slotEntry?.hasEmptyPallet);
  const effectiveHasTopLayer = isMovingWholePalletSource ? false : hasTopLayer;
  const visibleBoxTooltips = visibleLayerKey === 'top'
    ? (Array.isArray(harvestBoxTooltipBySlot?.[slotNo]?.top) ? harvestBoxTooltipBySlot[slotNo].top : [])
    : (Array.isArray(harvestBoxTooltipBySlot?.[slotNo]?.bottom) ? harvestBoxTooltipBySlot[slotNo].bottom : []);
  const rawVisibleFilledBoxCount = effectiveIsFloorStored
    ? Math.max(0, Math.floor(Number(slotEntry?.filledBoxCount) || 0))
    : countLayerBoxes(
      visibleLayerEntry,
      visibleLayerKey === 'top' ? slotEntry?.topLayerFilledBoxCount : slotEntry?.filledBoxCount,
    );
  const isMovingSourceSlot = String(movingHarvestPreviewSource?.sourceType || '') === 'warehouse-slot'
    && Math.max(0, Math.floor(Number(movingHarvestPreviewSource?.sourceSlotNo) || 0)) === Math.max(0, Number(slotNo || 0))
    && String(movingHarvestPreviewSource?.sourceLayerKey || 'bottom') === visibleLayerKey;
  const previewMovingBoxCount = isMovingSourceSlot && isIndividualTransportMode
    ? Math.min(
        Math.max(0, rawVisibleFilledBoxCount),
        Math.max(0, Math.floor(Number(movingHarvestPreviewBoxCount) || 0))
      )
    : 0;
  const visibleFilledSlots = previewMovingBoxCount > 0 && typeof harvestPalletVisibleFilledSlotsAfterPreview === 'function'
    ? harvestPalletVisibleFilledSlotsAfterPreview(visibleLayerEntry, movingHarvestPreviewSource, previewMovingBoxCount)
    : null;
  const visibleFilledBoxCount = Array.isArray(visibleFilledSlots)
    ? visibleFilledSlots.reduce((sum, filled) => sum + (filled ? 1 : 0), 0)
    : Math.max(0, rawVisibleFilledBoxCount - previewMovingBoxCount);
  const visibleLoadLabel = effectiveIsFloorStored
    ? String(slotEntry?.loadLabel || visibleLayerEntry?.floorBoxText || '')
    : `${Math.max(0, visibleFilledBoxCount).toLocaleString()}박스/${Math.max(0, Math.floor(Number(harvestBoxesPerPallet) || 0)).toLocaleString()}박스`;
  const visibleLayerMemo = effectiveOccupied && effectiveIsHarvestStored && !effectiveIsFloorStored && visibleFilledBoxCount > 0
    ? String(
      visibleLayerEntry?.palletMemo
      || (visibleLayerKey === 'top' ? slotEntry?.topMemo : slotEntry?.bottomMemo)
      || ''
    )
    : '';
  const fallbackMemoLayer = resolveHarvestPalletMemoLayer(
    visibleLayerKey === 'top'
      ? { text: slotEntry?.topMemo, color: slotEntry?.topMemoColor }
      : { text: slotEntry?.bottomMemo, color: slotEntry?.bottomMemoColor }
  );
  const visibleLayerMemoColor = effectiveOccupied && effectiveIsHarvestStored && !effectiveIsFloorStored && visibleFilledBoxCount > 0
    ? (
      visibleLayerEntry?.palletMemo
        ? visibleLayerEntry?.palletMemoColor
        : fallbackMemoLayer.color
    )
    : fallbackMemoLayer.color;
  const canDisplayEmptyPalletAsIndividualTarget = moveTargetType === 'warehouse-empty-pallet'
    && effectiveOccupied
    && effectiveHasEmptyPallet
    && !effectiveHasTopLayer
    && !effectiveIsHarvestStored
    && !effectiveIsFloorStored;
  const displayAsEmptyTarget = false;
  const renderSlotOccupied = displayAsEmptyTarget ? false : effectiveOccupied;
  const renderHasTopLayer = displayAsEmptyTarget ? false : effectiveHasTopLayer;
  const renderIsHarvestStored = displayAsEmptyTarget ? false : effectiveIsHarvestStored;
  const renderIsFloorStored = displayAsEmptyTarget ? false : effectiveIsFloorStored;
  const renderVisibleFilledBoxCount = displayAsEmptyTarget ? 0 : visibleFilledBoxCount;
  const renderVisibleLoadLabel = displayAsEmptyTarget ? '' : visibleLoadLabel;
  const renderVisibleLayerMemo = displayAsEmptyTarget ? '' : visibleLayerMemo;
  const canUseStackedPalletSource = !effectiveHasTopLayer || Boolean(selectedTransportCanStackPallet);
  const canPickVisibleHarvestPallet = Boolean(selectedTransportRow)
    && Boolean(selectedTransportCanMovePallet)
    && !selectedTransportHasPalletOnDock
    && !isIndividualTransportMode
    && renderSlotOccupied
    && renderIsHarvestStored
    && !renderIsFloorStored
    && canUseStackedPalletSource
    && (!renderHasTopLayer || visibleLayerKey === 'top');
  const canLoadEmptyPalletToSelectedTransport = Boolean(selectedTransportRow)
    && Boolean(selectedTransportCanMovePallet)
    && !selectedTransportHasPalletOnDock
    && !isIndividualTransportMode
    && renderSlotOccupied
    && !renderIsHarvestStored
    && !renderIsFloorStored
    && !renderHasTopLayer;
  const showTransportActions = canPickVisibleHarvestPallet || canLoadEmptyPalletToSelectedTransport;
  const canPickBoxesIndividually = Boolean(selectedTransportRow)
    && isIndividualTransportMode
    && Boolean(pendingHarvestMoveTarget)
    && typeof pickIndividualHarvestBoxToTransport === 'function'
    && Math.max(0, Math.floor(Number(selectedTransportIndividualCarryLimit) || 0)) > 0
    && renderSlotOccupied
    && renderIsHarvestStored
    && !renderHasTopLayer;
  const canChooseSingleLayerBoxTarget = false;
  const canSendBoxesBackToTransportDock = isPendingMoveTarget
    && isIndividualTransportMode
    && typeof pickIndividualHarvestBoxToSelectedTransportDock === 'function';
  const canReceiveBoxesFromTransportDock = false;
  const buildLayerBoxEntries = (layerKey, layerEntry, filledCount, filledSlotsOverride = null) => {
    const boxTooltips = layerKey === 'top'
      ? (Array.isArray(harvestBoxTooltipBySlot?.[slotNo]?.top) ? harvestBoxTooltipBySlot[slotNo].top : [])
      : (Array.isArray(harvestBoxTooltipBySlot?.[slotNo]?.bottom) ? harvestBoxTooltipBySlot[slotNo].bottom : []);
    const isActiveLayer = layerKey === visibleLayerKey;
    if (displayAsEmptyTarget && isActiveLayer) {
      return buildEmptyHarvestBoxEntries({ harvestBoxesPerPallet });
    }
    const shouldUseInteractiveEntries = isActiveLayer && (
      canPickBoxesIndividually
      || canChooseSingleLayerBoxTarget
      || canSendBoxesBackToTransportDock
      || canReceiveBoxesFromTransportDock
    );
    if (shouldUseInteractiveEntries) {
      return buildInteractiveHarvestBoxEntries({
        entry: layerEntry,
        storageSlotNo: Math.max(0, Number(slotNo || 0)),
        sourceLayerKey: layerKey,
        sourceMeta: {
          isFloorStored: Boolean(renderIsFloorStored),
          warehouseSubTab: 'storage',
        },
        harvestBoxesPerPallet,
        harvestPalletDisplayBoxIndexOf,
        harvestPalletBoxFilledAt,
        harvestPalletBoxToneAt,
        visibleFilledSlots: isActiveLayer ? filledSlotsOverride : null,
        boxTooltips,
        canPickBoxesIndividually,
        canChooseSingleLayerBoxTarget,
        canSendBoxesBackToTransportDock,
        canReceiveBoxesFromTransportDock,
        moveTarget,
        chooseHarvestMoveTarget,
        pickIndividualHarvestBoxToTransport,
        pickIndividualTransportDockHarvestBoxToTransport,
        pickIndividualHarvestBoxToSelectedTransportDock,
      });
    }
    return buildStaticHarvestBoxEntries({
      entry: layerEntry,
      filledBoxCount: filledCount,
      harvestBoxesPerPallet,
      harvestPalletDisplayBoxIndexOf,
      harvestPalletBoxFilledAt,
      harvestPalletBoxToneAt,
      boxTooltips,
    });
  };
  const bottomLayerBoxEntries = buildLayerBoxEntries(
    'bottom',
    bottomLayerEntry,
    visibleLayerKey === 'bottom' ? renderVisibleFilledBoxCount : countLayerBoxes(bottomLayerEntry, slotEntry?.filledBoxCount),
    visibleLayerKey === 'bottom' ? visibleFilledSlots : null,
  );
  const topLayerBoxEntries = renderHasTopLayer
    ? buildLayerBoxEntries(
      'top',
      topLayerEntry,
      visibleLayerKey === 'top' ? renderVisibleFilledBoxCount : countLayerBoxes(topLayerEntry, slotEntry?.topLayerFilledBoxCount),
      visibleLayerKey === 'top' ? visibleFilledSlots : null,
    )
    : [];
  const hasInteractiveSingleLayerBoxes = !renderHasTopLayer && bottomLayerBoxEntries.some(
    (boxEntry) => Boolean(boxEntry?.pickable) || typeof boxEntry?.onClick === 'function',
  );
  const hasFilledSingleLayerBoxes = !renderHasTopLayer && bottomLayerBoxEntries.some(
    (boxEntry) => Boolean(boxEntry?.filled),
  );
  const moveTargetActionLabel = moveTargetType === 'warehouse-stack-top'
    ? '2단 적재'
    : (isIndividualTransportMode ? '결합' : '놓기');
  const shouldDockMoveTargetButtonBelowGrid = hasInteractiveSingleLayerBoxes && isIndividualTransportMode;
  const hideStackTopMoveTargetButton = moveTargetType === 'warehouse-stack-top'
    && Boolean(selectedTransportRow)
    && !Boolean(selectedTransportCanStackPallet);
  const canOpenDetailByCard = renderSlotOccupied && !selectedTransportRow;
  const openDetail = () => {
    if (!openHarvestDetail) return;
    openHarvestDetail({
      layerKey: visibleLayerKey,
      slotNo,
      source: {
        type: 'warehouse',
        facilityKey: String(activeFacilityStorageKey || ''),
        slotNo,
        ...(openDetailSource || {}),
      },
    });
  };
  const chooseMoveTarget = (event) => {
    event?.stopPropagation?.();
    if (moveTarget && typeof chooseHarvestMoveTarget === 'function') {
      chooseHarvestMoveTarget(moveTarget);
    }
  };
  const cardActsAsButton = canOpenDetailByCard;
  const shouldShowHeaderNode = !renderSlotOccupied && !displayAsEmptyTarget;
  const title = renderVisibleFilledBoxCount > 0
    ? undefined
    : (
      renderSlotOccupied
        ? String(visibleLayerEntry?.sourceLabel || slotEntry?.sourceLabel || '수확물 보관중')
        : String(moveTarget?.blockReason || '빈 적재칸')
    );
  return (
    <div
      className={`warehouse-harvest-slot-card ${renderSlotOccupied ? 'warehouse-harvest-slot-card--occupied' : 'warehouse-harvest-slot-card--empty'} ${renderSlotOccupied && !renderIsFloorStored && palletImageSrc ? 'warehouse-harvest-slot-card--with-pallet-bg' : ''} ${renderVisibleFilledBoxCount > 0 ? 'warehouse-harvest-slot-card--with-boxes' : ''} ${showTransportActions ? 'warehouse-harvest-slot-card--actionable' : ''} ${renderHasTopLayer ? 'warehouse-harvest-slot-card--stacked' : ''} ${!renderHasTopLayer && renderVisibleFilledBoxCount > 0 ? 'warehouse-harvest-slot-card--single-layer' : ''} ${renderIsFloorStored ? 'warehouse-harvest-slot-card--floor-stored' : ''} ${renderHasTopLayer && visibleLayerKey === 'top' ? 'warehouse-harvest-slot-card--view-top' : ''} ${renderHasTopLayer && visibleLayerKey === 'bottom' ? 'warehouse-harvest-slot-card--view-bottom' : ''} ${isMovingWholePalletSource ? 'warehouse-harvest-slot-card--moving-source' : ''} ${isPendingMoveTarget ? 'warehouse-harvest-slot-card--selected' : ''} ${cardClassName}`.trim()}
      title={title}
      style={renderSlotOccupied && !renderIsFloorStored && palletImageSrc ? { '--warehouse-pallet-bg': `url("${palletImageSrc}")` } : undefined}
      role={cardActsAsButton ? 'button' : undefined}
      tabIndex={cardActsAsButton ? 0 : undefined}
      onClick={canOpenDetailByCard ? openDetail : undefined}
      onKeyDown={cardActsAsButton ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetail();
        }
      } : undefined}
    >
      {shouldShowHeaderNode ? headerNode : null}
      {(renderIsHarvestStored || displayAsEmptyTarget) ? (
        <>
          {!renderIsFloorStored ? (
            <>
              <button
                type="button"
                className={`warehouse-harvest-slot-card__memo-button ${renderVisibleLayerMemo ? 'has-memo' : ''}`.trim()}
                style={renderVisibleLayerMemo ? buildHarvestPalletMemoColorStyle(visibleLayerMemoColor) : undefined}
                title={renderVisibleLayerMemo ? `${visibleLayerKey === 'top' ? '2단' : '1단'} 메모 수정: ${renderVisibleLayerMemo}` : `${visibleLayerKey === 'top' ? '2단' : '1단'} 메모 추가`}
                aria-label={renderVisibleLayerMemo ? `${slotLabel} ${visibleLayerKey === 'top' ? '2단' : '1단'} 메모 수정` : `${slotLabel} ${visibleLayerKey === 'top' ? '2단' : '1단'} 메모 추가`}
                onClick={(event) => {
                  event.stopPropagation();
                  editHarvestPalletMemo?.(slotNo, visibleLayerKey);
                }}
              >
                {renderVisibleLayerMemo ? '메모✓' : '메모'}
              </button>
              {renderVisibleLayerMemo ? (
                <div
                  className="warehouse-harvest-slot-card__memo-text"
                  style={buildHarvestPalletMemoColorStyle(visibleLayerMemoColor)}
                  title={renderVisibleLayerMemo}
                >
                  {renderVisibleLayerMemo}
                </div>
              ) : null}
            </>
          ) : null}
          {renderHasTopLayer ? (
            <>
              <button
                type="button"
                className={`warehouse-harvest-slot-layer-toggle warehouse-harvest-slot-layer-toggle--top ${visibleLayerKey === 'top' ? 'is-active' : ''}`.trim()}
                aria-label="2단 보기"
                title="2단 보기"
                onClick={(event) => {
                  event.stopPropagation();
                  setVisibleLayerBySlot?.((prev) => ({ ...(prev || {}), [slotNo]: 'top' }));
                }}
              >
                ▲
              </button>
              <button
                type="button"
                className={`warehouse-harvest-slot-layer-toggle warehouse-harvest-slot-layer-toggle--bottom ${visibleLayerKey === 'bottom' ? 'is-active' : ''}`.trim()}
                aria-label="1단 보기"
                title="1단 보기"
                onClick={(event) => {
                  event.stopPropagation();
                  setVisibleLayerBySlot?.((prev) => ({ ...(prev || {}), [slotNo]: 'bottom' }));
                }}
              >
                ▼
              </button>
            </>
          ) : null}
          {renderHasTopLayer ? (
            <div className="warehouse-harvest-slot-stack" aria-hidden={showTransportActions ? undefined : true}>
              <button
                type="button"
                className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--bottom ${visibleLayerKey === 'bottom' ? 'is-active' : 'is-inactive'} ${renderIsFloorStored ? 'warehouse-harvest-slot-layer-card--floor' : ''}`.trim()}
                onClick={(event) => {
                  event.stopPropagation();
                  if (visibleLayerKey === 'bottom') {
                    if (selectedTransportRow) return;
                    openHarvestDetail?.({
                      layerKey: 'bottom',
                      slotNo,
                      source: {
                        type: 'warehouse',
                        facilityKey: String(activeFacilityStorageKey || ''),
                        slotNo,
                        ...(openDetailSource || {}),
                      },
                    });
                    return;
                  }
                  setVisibleLayerBySlot?.((prev) => ({ ...(prev || {}), [slotNo]: 'bottom' }));
                }}
              >
                {!renderIsFloorStored ? (
                  <span className="warehouse-harvest-slot-layer-card__badge">1단</span>
                ) : null}
                {visibleLayerKey === 'bottom' ? (
                  <FacilityHarvestBoxGrid boxEntries={bottomLayerBoxEntries} />
                ) : null}
              </button>
              <button
                type="button"
                className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--top ${visibleLayerKey === 'top' ? 'is-active' : 'is-inactive'}`.trim()}
                onClick={(event) => {
                  event.stopPropagation();
                  if (visibleLayerKey === 'top') {
                    if (selectedTransportRow) return;
                    openHarvestDetail?.({
                      layerKey: 'top',
                      slotNo,
                      source: {
                        type: 'warehouse',
                        facilityKey: String(activeFacilityStorageKey || ''),
                        slotNo,
                        ...(openDetailSource || {}),
                      },
                    });
                    return;
                  }
                  setVisibleLayerBySlot?.((prev) => ({ ...(prev || {}), [slotNo]: 'top' }));
                }}
              >
                <span className="warehouse-harvest-slot-layer-card__badge">2단</span>
                {visibleLayerKey === 'top' ? (
                  <FacilityHarvestBoxGrid boxEntries={topLayerBoxEntries} />
                ) : null}
              </button>
              {renderSlotOccupied && renderVisibleLoadLabel && !hideLoadLabel ? (
                <span className="warehouse-harvest-slot-card__load-label">
                  {String(renderVisibleLoadLabel || '').split(' + ')[0] || renderVisibleLoadLabel}
                </span>
              ) : null}
            </div>
          ) : (
            (renderVisibleFilledBoxCount > 0 || displayAsEmptyTarget) ? (
              <div
                className={`warehouse-harvest-slot-stack ${hasInteractiveSingleLayerBoxes ? 'has-interactive-boxes' : ''} ${hasFilledSingleLayerBoxes ? 'has-filled-boxes' : ''}`.trim()}
                aria-hidden={showTransportActions ? undefined : true}
              >
                <div
                  className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--single is-active ${hasFilledSingleLayerBoxes ? 'has-filled-boxes' : ''} ${renderIsFloorStored ? 'warehouse-harvest-slot-layer-card--floor' : ''} ${displayAsEmptyTarget ? 'warehouse-harvest-slot-layer-card--empty-target' : ''}`.trim()}
                >
                  {!renderIsFloorStored ? (
                    <span className="warehouse-harvest-slot-layer-card__badge">1단</span>
                  ) : null}
                  <FacilityHarvestBoxGrid boxEntries={bottomLayerBoxEntries} />
                </div>
                {renderSlotOccupied && renderVisibleLoadLabel && !hideLoadLabel ? (
                  <span className="warehouse-harvest-slot-card__load-label">
                    {String(renderVisibleLoadLabel || '').split(' + ')[0] || renderVisibleLoadLabel}
                  </span>
                ) : null}
              </div>
            ) : null
          )}
          {shouldUseMoveTargetAction && !isIndividualTransportMode && !isPendingMoveTarget && Boolean(moveTarget?.canChoose) && !hideStackTopMoveTargetButton ? (
            <button
              type="button"
              className={`button button--compact button--primary facility-workbench-install-button warehouse-harvest-slot-card__move-target-button${moveTargetType === 'warehouse-stack-top' ? ' warehouse-harvest-slot-card__move-target-button--stack-top' : ''}${shouldDockMoveTargetButtonBelowGrid ? ' warehouse-harvest-slot-card__move-target-button--below-grid' : ''}`}
              title={moveTargetDisabledReason || (isIndividualTransportMode ? '개별 적재 대상으로 이 저장공간을 선택합니다.' : '현재 운반기구의 팔레트를 이 저장공간에 내려놓습니다.')}
              onClick={chooseMoveTarget}
            >
              {moveTargetActionLabel}
            </button>
          ) : showTransportActions ? (
            <button
              type="button"
              className="button button--compact button--primary facility-workbench-install-button warehouse-harvest-slot-card__move-target-button"
              title="현재 선택한 운반기구로 이 팔레트를 들어 옮깁니다."
              onClick={(event) => {
                event.stopPropagation();
                openHarvestPalletMovePicker?.(slotNo, visibleLayerKey, null, movePickerMeta || undefined);
              }}
            >
              들기
            </button>
          ) : null}
        </>
      ) : shouldUseMoveTargetAction && !isIndividualTransportMode && !isPendingMoveTarget && Boolean(moveTarget?.canChoose) && !hideStackTopMoveTargetButton ? (
        <button
          type="button"
          className={`button button--compact button--primary facility-workbench-install-button warehouse-harvest-slot-card__move-target-button${moveTargetType === 'warehouse-stack-top' ? ' warehouse-harvest-slot-card__move-target-button--stack-top' : ''}${shouldDockMoveTargetButtonBelowGrid ? ' warehouse-harvest-slot-card__move-target-button--below-grid' : ''}`}
          title={moveTargetDisabledReason || (isIndividualTransportMode ? '개별 적재 대상으로 이 저장공간을 선택합니다.' : '현재 운반기구의 팔레트를 이 저장공간에 내려놓습니다.')}
          onClick={chooseMoveTarget}
        >
          {moveTargetActionLabel}
        </button>
      ) : showTransportActions ? (
        <button
          type="button"
          className="button button--compact button--primary facility-workbench-install-button warehouse-harvest-slot-card__move-target-button"
          title="현재 선택한 운반기구로 이 팔레트를 들어 옮깁니다."
          onClick={(event) => {
            event.stopPropagation();
            openHarvestPalletMovePicker?.(slotNo, visibleLayerKey, null, movePickerMeta || undefined);
          }}
        >
          들기
        </button>
      ) : manualContent}
    </div>
  );
}

function WarehouseSortingPanel({
  activeFacilityStorageKey,
  slots,
  locationLabel,
  sortingPalletByEquipment,
  sortingWorkerByEquipment,
  sortingInOutSelectionByFacility,
  sortingHarvestSlotRows,
  sortingStaffPlanOf,
  sortingStorageSlotsOf,
  buildSortingPreviewHtml,
  sortingPreviewFrameKeyOf,
  appleContainerLabelOf,
  palletImageSrc,
  openShopItemDetailModal,
  unloadSortingStoragePallet,
  openSortingStoragePalletLoadPicker,
  openSortingBoxPicker,
  openSortingInOutModal,
  setSortingWorkerPicker,
  openSortingRunConfirm,
  sortingStartStateByEquipmentKey,
  sortingAnimatingByEquipmentKey,
  normalizeSortingInOutSlotNoList,
  openHarvestDetail,
  editHarvestPalletMemo,
  openSortingInstallFromEmptySlot,
  openHarvestPalletUnloadPicker,
  openHarvestPalletMovePicker,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxFilledAt,
  harvestPalletVisibleFilledSlotsAfterPreview,
  harvestPalletBoxToneAt,
  harvestBoxesPerPallet,
  selectedTransportRow,
  selectedTransportCanMovePallet,
  selectedTransportHasPalletOnDock = false,
  selectedTransportIndividualCarryLimit = 0,
  selectedTransportCanStackPallet = false,
  selectedTransportMode = 'pallet',
  harvestMoveActive = false,
  visibleLayerBySlot = {},
  setVisibleLayerBySlot = null,
  pendingHarvestMoveTarget = null,
  chooseHarvestMoveTarget = null,
  harvestBoxTooltipBySlot = {},
  pickIndividualHarvestBoxToTransport = null,
  pickIndividualTransportDockHarvestBoxToTransport = null,
  pickIndividualHarvestBoxToSelectedTransportDock = null,
  movingHarvestPreviewSource = null,
  movingHarvestPreviewBoxCount = 0,
  movingHarvestPreviewFilledBoxCount = 0,
  movingHarvestPreviewDockAvailableBoxCount = 0,
  laborText,
  crewIconOf,
}) {
  const sortingPreviewFrameRefByEquipment = React.useRef({});
  const sortingHarvestSlotRowMap = React.useMemo(() => {
    const rows = Array.isArray(sortingHarvestSlotRows) ? sortingHarvestSlotRows : [];
    return rows.reduce((acc, row) => {
      const sortingSlotKey = String(row?.key || '');
      const storageSlots = Array.isArray(row?.storageSlots) ? row.storageSlots : [];
      if (!sortingSlotKey) return acc;
      acc[sortingSlotKey] = storageSlots.reduce((slotAcc, slotEntry) => {
        const cargoSlotKey = String(slotEntry?.key || slotEntry?.cargoSlotKey || '');
        if (cargoSlotKey) slotAcc[cargoSlotKey] = slotEntry;
        return slotAcc;
      }, {});
      return acc;
    }, {});
  }, [sortingHarvestSlotRows]);

  return (
    <div className="warehouse-sorting-slot-list">
      {slots.map((slot) => (
        <div
          key={slot.key}
          className={`warehouse-sorting-slot-card ${slot.item ? 'is-occupied' : ''}`.trim()}
        >
          {slot.item ? null : (
            <div className="warehouse-sorting-slot-card__label">{slot.label}</div>
          )}
          {slot.item ? (
            (() => {
              const item = slot.item;
              const equipmentStorageKey = String(item?.displayKey || item?.key || '');
              const canOpenWarehouseDetail = Boolean(item?.key);
              const sortingStaffPlan = sortingStaffPlanOf(item);
              const sortingWorkerSlotKeys = Array.isArray(sortingStaffPlan?.cards)
                ? sortingStaffPlan.cards.map((card) => String(card?.key || '')).filter(Boolean)
                : [];
              const sortingWorkerAssignments = sortingWorkerByEquipment?.[equipmentStorageKey] || {};
              const readSortingWorkerAssignment = (slotKeyRaw) => {
                const slotKey = String(slotKeyRaw || '');
                if (!slotKey) return null;
                return sortingWorkerAssignments?.[slotKey]
                  || sortingWorkerAssignments?.[slotKey.replace('-worker-slot-', '-staff-slot-')]
                  || null;
              };
              const assignedSortingWorkerCount = sortingWorkerSlotKeys.reduce(
                (count, key) => (readSortingWorkerAssignment(key) ? count + 1 : count),
                0
              );
              const sortingHasSelfWorkerAssigned = sortingWorkerSlotKeys.some((key) => (
                String(
                  readSortingWorkerAssignment(key)?.workerTypeKey
                  || readSortingWorkerAssignment(key)?.workerType
                  || ''
                ) === 'self'
              ));
              const sortingWorkerCards = (Array.isArray(sortingStaffPlan?.cards) ? sortingStaffPlan.cards : []).map((workerSlot) => {
                const assignment = readSortingWorkerAssignment(workerSlot?.key);
                const workerTypeKey = String(assignment?.workerTypeKey || assignment?.workerType || '');
                const workerGender = String(assignment?.workerGender || 'neutral');
                const workerName = String(assignment?.workerLabel || '').trim();
                const workerLabor = Math.max(0, Number(assignment?.workerLabor) || 0);
                return (
                  <div
                    key={`sorting-crew-card-${equipmentStorageKey}-${workerSlot.key}`}
                    className={`warehouse-workbench-slot-card__crew-card warehouse-sorting-slot-card__count-card ${assignment ? 'is-assigned' : ''}`.trim()}
                    aria-label={assignment ? '인원 배치됨' : '인원 미배치'}
                    title={assignment ? '인원 배치됨' : '인원 미배치'}
                  >
                    {assignment ? (
                      <>
                        <span className="warehouse-workbench-slot-card__crew-icon warehouse-sorting-slot-card__count-icon" aria-hidden="true">
                          {crewIconOf?.(workerTypeKey || 'self', workerGender)}
                        </span>
                        <strong className="warehouse-workbench-slot-card__crew-name">{workerName || '배치됨'}</strong>
                        <span className="warehouse-workbench-slot-card__crew-status warehouse-workbench-slot-card__crew-status--labor">
                          <span className="warehouse-workbench-slot-card__crew-status-label">노동력 :</span>{' '}
                          <strong className="warehouse-workbench-slot-card__crew-status-value">{laborText?.(workerLabor)}</strong>
                        </span>
                      </>
                    ) : (
                      <strong className="warehouse-workbench-slot-card__crew-name">미배치</strong>
                    )}
                  </div>
                );
              });
              const sortingStorageSlots = Array.isArray(sortingStorageSlotsOf(item))
                ? sortingStorageSlotsOf(item)
                : [];
              const sortingStorageSlotRows = sortingStorageSlots
                .map((positionSlot) => sortingHarvestSlotRowMap?.[String(slot.key || '')]?.[String(positionSlot?.key || '')] || null)
                .filter(Boolean);
              const sortingInOutSelection = sortingInOutSelectionByFacility?.[
                String(activeFacilityStorageKey || '')
              ]?.[
                equipmentStorageKey
              ] || null;
              const normalizeSortingSlotNos = typeof normalizeSortingInOutSlotNoList === 'function'
                ? normalizeSortingInOutSlotNoList
                : ((rawValue) => (Array.isArray(rawValue) ? rawValue : []));
              const selectedInputSlotNos = normalizeSortingSlotNos(
                sortingInOutSelection?.inputSlotNos ?? sortingInOutSelection?.inputSlotNo
              );
              const selectedOutputSlotNos = normalizeSortingSlotNos(
                sortingInOutSelection?.outputSlotNos ?? sortingInOutSelection?.outputSlotNo
              );
              const sortingStartState = sortingStartStateByEquipmentKey?.[equipmentStorageKey] || null;
              const sortingRunBlockedReason = String(sortingStartState?.blockedReason || '').trim();
              const sortingIsAnimating = Boolean(sortingAnimatingByEquipmentKey?.[equipmentStorageKey]);
              const sortingSelfWorkerLocked = sortingIsAnimating && sortingHasSelfWorkerAssigned;
              const selectedSortingBoxLabel = sortingStartState?.selectedBoxItemKey
                ? String(appleContainerLabelOf?.(sortingStartState.selectedBoxItemKey) || sortingStartState.selectedBoxItemKey)
                : '미선택';
              const selectedInputSummary = selectedInputSlotNos.length > 0
                ? `${selectedInputSlotNos[0]}번`
                : '미선택';
              const selectedOutputSummary = selectedOutputSlotNos.length > 0
                ? `${selectedOutputSlotNos.length}칸`
                : '미선택';
              const openSortingItemDetail = () => {
                if (!canOpenWarehouseDetail) return;
                openShopItemDetailModal(item, String(item?.category || ''), {
                  viewOnly: true,
                  allowNonEquipment: true,
                  quantity: Number(item?.qty) || 0,
                  unit: String(item?.unit || ''),
                  openRemain: Number(item?.openRemain) || 0,
                  locationLabel,
                });
              };
              const openSortingWorkerAssign = () => {
                const preferredSlotKey = sortingWorkerSlotKeys[0] || '';
                const preferredSlot = sortingStaffPlan?.cards?.find(
                  (card) => String(card?.key || '') === preferredSlotKey
                ) || sortingStaffPlan?.cards?.[0] || null;
                if (!preferredSlot || typeof setSortingWorkerPicker !== 'function') return;
                setSortingWorkerPicker({
                  equipmentStorageKey,
                  equipmentName: String(item?.name || '선별기'),
                  mode: 'root',
                  slotKey: String(preferredSlot.key || ''),
                  slotLabel: String(preferredSlot.label || '인원칸'),
                  slotKeys: sortingWorkerSlotKeys,
                });
              };
              const openSortingBoxSelect = () => {
                openSortingBoxPicker?.(
                  String(slot.key || ''),
                  equipmentStorageKey,
                  String(slot.label || ''),
                  String(item?.name || '선별기')
                );
              };
              const openSortingInOutSelect = () => {
                openSortingInOutModal?.(
                  String(slot.key || ''),
                  equipmentStorageKey,
                  String(slot.label || ''),
                  String(item?.name || '선별기')
                );
              };
              const openSortingRun = () => {
                const previewFrame = sortingPreviewFrameRefByEquipment.current?.[equipmentStorageKey] || null;
                openSortingRunConfirm?.(item, previewFrame?.contentWindow || null);
              };
              return (
                <>
                  {canOpenWarehouseDetail ? (
                    <button
                      type="button"
                      className="warehouse-sorting-slot-card__detail-button"
                      disabled={sortingSelfWorkerLocked}
                      onClick={openSortingItemDetail}
                      title={sortingSelfWorkerLocked ? '내가 선별 작업 중일 때는 조작할 수 없습니다.' : '선별기 상세정보 확인'}
                    >
                      {String(item?.name || '선별기')}
                    </button>
                  ) : null}
                  <div className="warehouse-sorting-slot-card__equipment-preview">
                    <iframe
                      key={typeof sortingPreviewFrameKeyOf === 'function' ? sortingPreviewFrameKeyOf(item) : equipmentStorageKey}
                      ref={(node) => {
                        if (node) {
                          sortingPreviewFrameRefByEquipment.current[equipmentStorageKey] = node;
                        } else {
                          delete sortingPreviewFrameRefByEquipment.current[equipmentStorageKey];
                        }
                      }}
                      className="warehouse-sorting-slot-card__equipment-preview-frame"
                      title={`${item.name} 테스트 애니메이션 미리보기`}
                      srcDoc={buildSortingPreviewHtml(item)}
                      tabIndex={-1}
                      style={sortingSelfWorkerLocked ? { pointerEvents: 'none' } : undefined}
                    />
                    <div className="warehouse-sorting-slot-card__preview-summary">
                      {`인원 ${assignedSortingWorkerCount.toLocaleString()}명 / ${sortingWorkerSlotKeys.length.toLocaleString()}명 배치`}
                    </div>
                    <div className="warehouse-sorting-slot-card__selection-summary">
                      <span>{`투입 ${selectedInputSummary}`}</span>
                      <span>{`배출 ${selectedOutputSummary}`}</span>
                      <span>{`박스 ${selectedSortingBoxLabel}`}</span>
                    </div>
                    <div className="warehouse-sorting-slot-card__action-row">
                      <button
                        className="button button--compact button--primary facility-workbench-install-button warehouse-sorting-slot-card__action-button"
                        type="button"
                        disabled={sortingSelfWorkerLocked}
                        onClick={openSortingWorkerAssign}
                        title={sortingSelfWorkerLocked ? '내가 선별 작업 중일 때는 조작할 수 없습니다.' : '인원 배치'}
                      >
                        👷 인원배치
                      </button>
                      <button
                        className="button button--compact button--ghost facility-workbench-install-button warehouse-sorting-slot-card__action-button"
                        type="button"
                        disabled={sortingSelfWorkerLocked}
                        onClick={openSortingBoxSelect}
                        title={sortingSelfWorkerLocked ? '내가 선별 작업 중일 때는 조작할 수 없습니다.' : '박스 선택'}
                      >
                        📦 박스선택
                      </button>
                      <button
                        className="button button--compact button--ghost facility-workbench-install-button warehouse-sorting-slot-card__action-button"
                        type="button"
                        disabled={sortingSelfWorkerLocked}
                        onClick={openSortingInOutSelect}
                        title={sortingSelfWorkerLocked ? '내가 선별 작업 중일 때는 조작할 수 없습니다.' : '투입/배출 선택'}
                      >
                        🔄 투입배출
                      </button>
                      <button
                        className="button button--compact button--primary facility-workbench-install-button warehouse-sorting-slot-card__action-button warehouse-sorting-slot-card__action-button--run"
                        type="button"
                        disabled={sortingSelfWorkerLocked || Boolean(sortingRunBlockedReason) || sortingIsAnimating}
                        onClick={openSortingRun}
                        title={sortingSelfWorkerLocked
                          ? '내가 선별 작업 중일 때는 조작할 수 없습니다.'
                          : (sortingRunBlockedReason || (sortingIsAnimating ? '선별기 작동 중' : '선별 시작'))}
                      >
                        {sortingIsAnimating ? '작동 중' : '▶ 선별시작'}
                      </button>
                    </div>
                  </div>
                  {sortingWorkerCards.length ? (
                    <div
                      className="warehouse-workbench-slot-card__crew-layout warehouse-sorting-slot-card__footer-crew-layout"
                      style={{ gridTemplateColumns: `repeat(${Math.max(1, sortingWorkerCards.length)}, 92px)` }}
                    >
                      {sortingWorkerCards}
                    </div>
                  ) : null}
                </>
              );
            })()
          ) : (
            <>
              <div className="warehouse-sorting-slot-card__hint">비어 있는 선별기칸</div>
              <div className="warehouse-sorting-slot-card__actions">
                <button
                  className="button button--compact button--primary facility-workbench-install-button"
                  type="button"
                  onClick={openSortingInstallFromEmptySlot}
                >
                  설치
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function SortingCargoSlotCard({
  parentSlot,
  sortingItem,
  cargoSlot,
  activeFacilityStorageKey,
  palletImageSrc,
  openHarvestDetail,
  editHarvestPalletMemo,
  openSortingStoragePalletLoadPicker,
  unloadSortingStoragePallet,
  openHarvestPalletMovePicker,
  openHarvestPalletUnloadPicker,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxFilledAt,
  harvestPalletVisibleFilledSlotsAfterPreview,
  harvestPalletBoxToneAt,
  harvestBoxTooltipBySlot = {},
  harvestBoxesPerPallet,
  selectedTransportRow,
  selectedTransportCanMovePallet,
  selectedTransportHasPalletOnDock = false,
  selectedTransportIndividualCarryLimit = 0,
  selectedTransportCanStackPallet = false,
  selectedTransportMode = 'pallet',
  harvestMoveActive = false,
  visibleLayerBySlot = {},
  setVisibleLayerBySlot = null,
  pendingHarvestMoveTarget = null,
  chooseHarvestMoveTarget = null,
  pickIndividualHarvestBoxToTransport = null,
  pickIndividualTransportDockHarvestBoxToTransport = null,
  pickIndividualHarvestBoxToSelectedTransportDock = null,
  movingHarvestPreviewSource = null,
  movingHarvestPreviewBoxCount = 0,
  movingHarvestPreviewFilledBoxCount = 0,
  movingHarvestPreviewDockAvailableBoxCount = 0,
  individualFillAnimBySlot = {},
}) {
  return (
    <WarehouseHarvestSlotCardFrame
      slotNo={cargoSlot.storageSlotNo}
      slotLabel={cargoSlot.title || cargoSlot.label}
      slotEntry={cargoSlot}
      palletImageSrc={palletImageSrc}
      activeFacilityStorageKey={activeFacilityStorageKey}
      visibleLayerBySlot={visibleLayerBySlot}
      selectedTransportRow={selectedTransportRow}
      selectedTransportCanMovePallet={selectedTransportCanMovePallet}
      selectedTransportHasPalletOnDock={selectedTransportHasPalletOnDock}
      selectedTransportIndividualCarryLimit={selectedTransportIndividualCarryLimit}
      selectedTransportCanStackPallet={selectedTransportCanStackPallet}
      openHarvestDetail={openHarvestDetail}
      editHarvestPalletMemo={editHarvestPalletMemo}
      setVisibleLayerBySlot={setVisibleLayerBySlot}
      openHarvestPalletMovePicker={openHarvestPalletMovePicker}
      harvestMoveActive={harvestMoveActive}
      chooseHarvestMoveTarget={chooseHarvestMoveTarget}
      pendingHarvestMoveTarget={pendingHarvestMoveTarget}
      pickIndividualHarvestBoxToTransport={pickIndividualHarvestBoxToTransport}
      pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
      pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
      openHarvestPalletUnloadPicker={openHarvestPalletUnloadPicker}
      movingHarvestPreviewSource={movingHarvestPreviewSource}
      movingHarvestPreviewBoxCount={movingHarvestPreviewBoxCount}
      movingHarvestPreviewFilledBoxCount={movingHarvestPreviewFilledBoxCount}
      selectedTransportMode={selectedTransportMode}
      harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
      harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
      harvestPalletVisibleFilledSlotsAfterPreview={harvestPalletVisibleFilledSlotsAfterPreview}
      harvestPalletBoxToneAt={harvestPalletBoxToneAt}
      harvestBoxesPerPallet={harvestBoxesPerPallet}
      harvestBoxTooltipBySlot={harvestBoxTooltipBySlot}
      individualFillAnimBySlot={individualFillAnimBySlot}
      cardClassName="warehouse-harvest-slot-card--sorting-storage warehouse-harvest-slot-card--single-layer"
      openDetailSource={{
        slotLabel: cargoSlot.title || cargoSlot.label,
        sortingSlotKey: parentSlot.key,
        sortingSlotLabel: parentSlot.label,
        equipmentStorageKey: String(sortingItem?.displayKey || sortingItem?.key || ''),
        cargoSlotKey: cargoSlot.key,
        cargoSlotLabel: cargoSlot.title || cargoSlot.label,
      }}
      movePickerMeta={{
        facilityType: 'sorting-storage',
        warehouseSubTab: 'sorting',
        sortingMeta: {
          sortingSlotKey: parentSlot.key,
          equipmentStorageKey: String(sortingItem?.displayKey || sortingItem?.key || ''),
          equipmentName: String(sortingItem?.name || '선별기'),
          cargoSlotKey: cargoSlot.key,
          cargoSlotLabel: cargoSlot.title || cargoSlot.label,
        },
      }}
      onManualLoad={() => openSortingStoragePalletLoadPicker?.(parentSlot, sortingItem, cargoSlot)}
      onManualUnload={() => unloadSortingStoragePallet?.(parentSlot, sortingItem, cargoSlot)}
      canManualLoad
      hideLoadLabel
    />
  );
}

function WorkbenchCargoSlotCard({
  parentSlot,
  cargoSlot,
  activeFacilityStorageKey,
  palletImageSrc,
  openHarvestDetail,
  editHarvestPalletMemo,
  openHarvestPalletLoadPicker,
  openHarvestPalletUnloadPicker,
  openHarvestPalletMovePicker,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxFilledAt,
  harvestPalletVisibleFilledSlotsAfterPreview,
  harvestPalletBoxToneAt,
  harvestBoxTooltipBySlot = {},
  harvestBoxesPerPallet,
  selectedTransportRow,
  selectedTransportCanMovePallet,
  selectedTransportCanStackPallet = false,
  selectedTransportHasPalletOnDock = false,
  selectedTransportIndividualCarryLimit = 0,
  selectedTransportMode = 'pallet',
  harvestMoveActive = false,
  visibleLayerBySlot = {},
  setVisibleLayerBySlot = null,
  pendingHarvestMoveTarget = null,
  chooseHarvestMoveTarget = null,
  pickIndividualHarvestBoxToTransport = null,
  pickIndividualTransportDockHarvestBoxToTransport = null,
  pickIndividualHarvestBoxToSelectedTransportDock = null,
  movingHarvestPreviewSource = null,
  movingHarvestPreviewBoxCount = 0,
  movingHarvestPreviewFilledBoxCount = 0,
  movingHarvestPreviewDockAvailableBoxCount = 0,
  individualFillAnimBySlot = {},
}) {
  const workbenchMeta = {
    workbenchSlotKey: parentSlot.key,
    workbenchSlotLabel: parentSlot.label,
    workbenchName: parentSlot.installedTable?.name || '작업대',
    cargoSlotKey: cargoSlot.key,
    cargoSlotLabel: cargoSlot.label,
  };

  return (
    <div className="warehouse-workbench-slot-card__cargo-card">
      <WarehouseHarvestSlotCardFrame
        slotNo={cargoSlot.storageSlotNo}
        slotLabel={cargoSlot.label}
        slotEntry={cargoSlot}
        palletImageSrc={palletImageSrc}
        activeFacilityStorageKey={activeFacilityStorageKey}
        visibleLayerBySlot={visibleLayerBySlot}
        selectedTransportRow={selectedTransportRow}
        selectedTransportCanMovePallet={selectedTransportCanMovePallet}
        selectedTransportHasPalletOnDock={selectedTransportHasPalletOnDock}
        selectedTransportIndividualCarryLimit={selectedTransportIndividualCarryLimit}
        selectedTransportCanStackPallet={selectedTransportCanStackPallet}
        openHarvestDetail={openHarvestDetail}
        editHarvestPalletMemo={editHarvestPalletMemo}
        setVisibleLayerBySlot={setVisibleLayerBySlot}
        openHarvestPalletMovePicker={openHarvestPalletMovePicker}
        harvestMoveActive={harvestMoveActive}
        chooseHarvestMoveTarget={chooseHarvestMoveTarget}
        pendingHarvestMoveTarget={pendingHarvestMoveTarget}
        pickIndividualHarvestBoxToTransport={pickIndividualHarvestBoxToTransport}
        pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
        pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
        openHarvestPalletUnloadPicker={openHarvestPalletUnloadPicker}
        movingHarvestPreviewSource={movingHarvestPreviewSource}
        movingHarvestPreviewBoxCount={movingHarvestPreviewBoxCount}
        movingHarvestPreviewFilledBoxCount={movingHarvestPreviewFilledBoxCount}
        selectedTransportMode={selectedTransportMode}
        harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
        harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
        harvestPalletVisibleFilledSlotsAfterPreview={harvestPalletVisibleFilledSlotsAfterPreview}
        harvestPalletBoxToneAt={harvestPalletBoxToneAt}
        harvestBoxesPerPallet={harvestBoxesPerPallet}
        harvestBoxTooltipBySlot={harvestBoxTooltipBySlot}
        individualFillAnimBySlot={individualFillAnimBySlot}
        openDetailSource={{
          slotLabel: cargoSlot.label,
          workbenchSlotKey: parentSlot.key,
          workbenchSlotLabel: parentSlot.label,
          cargoSlotKey: cargoSlot.key,
          cargoSlotLabel: cargoSlot.label,
        }}
        movePickerMeta={{
          facilityType: 'workbench',
          warehouseSubTab: 'workbench',
          workbenchMeta,
        }}
        onManualLoad={() => {
          openHarvestPalletLoadPicker?.(cargoSlot.storageSlotNo, {
            facilityType: 'workbench',
            warehouseSubTab: 'workbench',
            workbenchMeta,
          });
        }}
        onManualUnload={() => {
          openHarvestPalletUnloadPicker?.(cargoSlot.storageSlotNo, {
            facilityType: 'workbench',
            workbenchMeta,
          });
        }}
        canManualLoad
      />
    </div>
  );
}

function WarehouseWorkbenchPanel({
  slots,
  activeFacilityStorageKey,
  selectedTransportRow,
  selectedTransportCanMovePallet,
  selectedTransportHasPalletOnDock = false,
  selectedTransportCanStackPallet = false,
  selectedTransportMode = 'pallet',
  harvestMoveActive = false,
  visibleLayerBySlot = {},
  setVisibleLayerBySlot = null,
  pendingHarvestMoveTarget = null,
  chooseHarvestMoveTarget = null,
  workbenchStaffPlanOf,
  workbenchCargoPlanOf,
  workbenchHarvestSlotRows,
  harvestSlotRows = [],
  harvestBoxCapacityKg,
  palletImageSrc,
  openHarvestDetail,
  editHarvestPalletMemo,
  openHarvestPalletLoadPicker,
  openHarvestPalletUnloadPicker,
  openHarvestPalletMovePicker,
  harvestPalletVisualFilledBoxCount,
  harvestPalletLoadLabel,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxFilledAt,
  harvestPalletVisibleFilledSlotsAfterPreview,
  harvestPalletBoxToneAt,
  harvestBoxTooltipBySlot = {},
  harvestBoxesPerPallet,
  selectedTransportIndividualCarryLimit = 0,
  pickIndividualHarvestBoxToTransport = null,
  pickIndividualTransportDockHarvestBoxToTransport = null,
  pickIndividualHarvestBoxToSelectedTransportDock = null,
  movingHarvestPreviewSource = null,
  movingHarvestPreviewBoxCount = 0,
  movingHarvestPreviewFilledBoxCount = 0,
  movingHarvestPreviewDockAvailableBoxCount = 0,
  individualFillAnimBySlot,
  workbenchTaskByFacility = {},
  workbenchInOutSelectionByFacility = {},
  workbenchStartStateBySlotKey = {},
  workbenchInlineAnimationBySlotKey = {},
  openWorkbenchTaskPicker = null,
  openWorkbenchInOutModal = null,
  openWorkbenchBoxPicker = null,
  startWorkbenchTask = null,
  setWorkbenchWorkerPicker,
  openWorkbenchInstallPicker,
  uninstallWorkbenchTable,
  openShopItemDetailModal,
  locationLabel,
  laborText,
  crewIconOf,
}) {
  const workbenchHarvestSlotRowMap = React.useMemo(() => {
    const rows = Array.isArray(workbenchHarvestSlotRows) ? workbenchHarvestSlotRows : [];
    return rows.reduce((acc, row) => {
      const slotNo = Number(row?.auxStorageSlotNo || row?.storageSlotNo || row?.slotNo);
      if (slotNo > 0) acc[slotNo] = row;
      return acc;
    }, {});
  }, [workbenchHarvestSlotRows]);
  const harvestSlotRowMap = React.useMemo(() => {
    const rows = Array.isArray(harvestSlotRows) ? harvestSlotRows : [];
    return rows.reduce((acc, row) => {
      const slotNo = Math.max(0, Math.floor(Number(row?.slotNo || row?.storageSlotNo || 0) || 0));
      if (slotNo > 0) acc[slotNo] = row;
      return acc;
    }, {});
  }, [harvestSlotRows]);
  const workbenchCollapseStorageScopeKey = React.useMemo(
    () => String(activeFacilityStorageKey || 'default'),
    [activeFacilityStorageKey]
  );
  const [collapsedEmptyWorkbenchSlots, setCollapsedEmptyWorkbenchSlots] = React.useState(() => {
    try {
      const raw = localStorage.getItem(WORKBENCH_EMPTY_SLOT_COLLAPSE_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      const scopedState = parsed?.[String(activeFacilityStorageKey || 'default')];
      return scopedState && typeof scopedState === 'object' ? scopedState : {};
    } catch {
      return {};
    }
  });
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(WORKBENCH_EMPTY_SLOT_COLLAPSE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const nextMap = parsed && typeof parsed === 'object' ? parsed : {};
      const scopedState = nextMap?.[workbenchCollapseStorageScopeKey];
      setCollapsedEmptyWorkbenchSlots(scopedState && typeof scopedState === 'object' ? scopedState : {});
    } catch {
      setCollapsedEmptyWorkbenchSlots({});
    }
  }, [workbenchCollapseStorageScopeKey]);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(WORKBENCH_EMPTY_SLOT_COLLAPSE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const nextMap = parsed && typeof parsed === 'object' ? { ...parsed } : {};
      nextMap[workbenchCollapseStorageScopeKey] = collapsedEmptyWorkbenchSlots;
      localStorage.setItem(WORKBENCH_EMPTY_SLOT_COLLAPSE_STORAGE_KEY, JSON.stringify(nextMap));
    } catch {
      // localStorage 접근 실패 시 무시
    }
  }, [collapsedEmptyWorkbenchSlots, workbenchCollapseStorageScopeKey]);
  const isEmptyWorkbenchSlotCollapsed = React.useCallback(
    (slotKey) => Boolean(collapsedEmptyWorkbenchSlots?.[String(slotKey || '')]),
    [collapsedEmptyWorkbenchSlots]
  );
  const toggleEmptyWorkbenchSlotCollapsed = React.useCallback((slotKey) => {
    const normalizedKey = String(slotKey || '');
    if (!normalizedKey) return;
    setCollapsedEmptyWorkbenchSlots((prev) => ({
      ...prev,
      [normalizedKey]: !prev?.[normalizedKey],
    }));
  }, []);

  return (
    <div className="warehouse-workbench-slot-list">
      {slots.map((slot) => {
        const emptySlotCollapsed = !slot.installedTable && isEmptyWorkbenchSlotCollapsed(slot.key);
        const inlineAnimation = workbenchInlineAnimationBySlotKey?.[String(slot.key || '')] || null;
        const inlineAnimationPlan = inlineAnimation?.plan || null;
        const inlineAnimationPhase = String(inlineAnimation?.phase || '');
        const inlineAnimationActive = ['transition-out', 'animating', 'applying'].includes(inlineAnimationPhase);
        return (
          <div
            key={slot.key}
            className={`warehouse-workbench-slot-card ${slot.installedTable ? 'is-occupied' : ''} ${emptySlotCollapsed ? 'is-collapsed-empty' : ''} ${inlineAnimationActive ? 'is-inline-animating' : ''}`.trim()}
          >
            {slot.installedTable ? null : (
              <div className="warehouse-workbench-slot-card__empty-head">
                <div className="warehouse-workbench-slot-card__label">{slot.label}</div>
                <button
                  type="button"
                  className={`warehouse-workbench-slot-card__collapse-toggle ${emptySlotCollapsed ? 'is-collapsed' : ''}`.trim()}
                  onClick={() => toggleEmptyWorkbenchSlotCollapsed(slot.key)}
                  aria-label={emptySlotCollapsed ? `${slot.label} 펼치기` : `${slot.label} 접기`}
                  title={emptySlotCollapsed ? '펼치기' : '접기'}
                >
                  <span className="warehouse-workbench-slot-card__collapse-toggle-icon" aria-hidden="true" />
                </button>
              </div>
            )}
            {slot.installedTable ? (
              <>
              <button
                type="button"
                className="warehouse-sorting-slot-card__detail-button warehouse-workbench-slot-card__detail-button"
                onClick={() => openShopItemDetailModal?.(
                  {
                    key: String(slot.installedTable?.tableKey || ''),
                    name: String(slot.installedTable?.name || '작업대'),
                    desc: String(slot.installedTable?.desc || '').trim(),
                    qty: 1,
                    unit: '세트',
                    category: 'tool',
                  },
                  'tool',
                  {
                    viewOnly: true,
                    allowNonEquipment: true,
                    quantity: 1,
                    unit: '세트',
                    locationLabel,
                    workbenchSlotIndex: Math.max(1, Number(String(slot.key || '').replace('workbench-slot-', '')) || 1),
                  }
                )}
                title="작업대 상세정보 확인"
              >
                {String(slot.installedTable?.name || '작업대')}
              </button>
              {(() => {
                const workerSlots = workbenchStaffPlanOf(slot.installedTable, slot.key, activeFacilityStorageKey);
                const assignedNames = workerSlots
                  .map((workerSlot) => String(workerSlot?.assignment?.workerLabel || '').trim())
                  .filter(Boolean);
                const uniqueAssignedNames = assignedNames.filter((name, index, array) => array.indexOf(name) === index);
                const selectedTaskKey = String(
                  workbenchTaskByFacility?.[String(activeFacilityStorageKey || '')]?.[String(slot.key || '')] || ''
                );
                const selectedTaskLabel = workbenchTaskLabelOf(selectedTaskKey);
                const inOutSelection = workbenchInOutSelectionByFacility?.[
                  String(activeFacilityStorageKey || '')
                ]?.[
                  String(slot.key || '')
                ] || null;
                const selectedInputSlotNos = Array.isArray(inOutSelection?.inputSlotNos)
                  ? inOutSelection.inputSlotNos.filter((value, index, array) => (
                    Number(value) > 0 && array.indexOf(value) === index
                  ))
                  : [];
                const selectedOutputSlotNos = Array.isArray(inOutSelection?.outputSlotNos)
                  ? inOutSelection.outputSlotNos.filter((value, index, array) => (
                    Number(value) > 0 && array.indexOf(value) === index
                  ))
                  : [];
                const hasAssignedWorker = assignedNames.length > 0;
                const hasSelectedTask = Boolean(selectedTaskKey);
                const taskUsesUnsortedInputBoxes = ['partialSortOnly', 'stemRemovalPartialSort'].includes(String(selectedTaskKey || ''));
                const hasSelectedInputSlot = selectedInputSlotNos.length > 0;
                const hasSelectedInOutSlot = (selectedInputSlotNos.length + selectedOutputSlotNos.length) > 0;
                const workbenchStartState = workbenchStartStateBySlotKey?.[slot.key] || null;
                const hasSelectedWorkbenchBox = Boolean(workbenchStartState?.selectedBoxItemKey);
                const hasEnoughSelectedWorkbenchBoxStock = workbenchStartState?.hasEnoughSelectedBoxStock !== false;
                const hasEnoughAssignedLabor = workbenchStartState?.hasEnoughAssignedLabor !== false;
                const hasProcessableOutputSpace = Math.max(0, Number(workbenchStartState?.processableBoxCount) || 0) > 0;
                const selectedInputBoxCount = selectedInputSlotNos.reduce(
                  (sum, slotNo) => sum + (
                    taskUsesUnsortedInputBoxes
                      ? countUnsortedBoxesInSlot(slotNo, harvestSlotRowMap, harvestBoxTooltipBySlot)
                      : countStemAttachedBoxesInSlot(slotNo, harvestSlotRowMap, harvestBoxTooltipBySlot)
                  ),
                  0
                );
                const hasProcessableInputBox = selectedInputBoxCount > 0;
                const canStartWorkbenchTask = hasAssignedWorker
                  && hasSelectedTask
                  && hasSelectedInOutSlot
                  && hasSelectedInputSlot
                  && hasSelectedWorkbenchBox
                  && hasEnoughSelectedWorkbenchBoxStock
                  && hasEnoughAssignedLabor
                  && hasProcessableOutputSpace
                  && hasProcessableInputBox;
                const startBlockedReasons = [];
                if (!hasAssignedWorker) startBlockedReasons.push('인원을 먼저 배치해야 합니다.');
                if (!hasSelectedTask) startBlockedReasons.push('작업을 먼저 선택해야 합니다.');
                if (!hasSelectedInOutSlot) startBlockedReasons.push('투입 또는 배출 자리를 1개 이상 선택해야 합니다.');
                if (hasSelectedInOutSlot && !hasSelectedInputSlot) startBlockedReasons.push('투입 자리를 1개 이상 선택해야 합니다.');
                if (!hasSelectedWorkbenchBox) startBlockedReasons.push('박스를 먼저 선택해야 합니다.');
                if (hasSelectedWorkbenchBox && !hasEnoughSelectedWorkbenchBoxStock && workbenchStartState?.blockedReason) {
                  startBlockedReasons.push(workbenchStartState.blockedReason);
                }
                if (hasAssignedWorker && !hasEnoughAssignedLabor && workbenchStartState?.blockedReason) {
                  startBlockedReasons.push(workbenchStartState.blockedReason);
                }
                if (hasSelectedInOutSlot && !hasProcessableOutputSpace && workbenchStartState?.blockedReason) {
                  startBlockedReasons.push(workbenchStartState.blockedReason);
                }
                if (hasSelectedInputSlot && !hasProcessableInputBox) {
                  startBlockedReasons.push(taskUsesUnsortedInputBoxes
                    ? (selectedTaskKey === 'stemRemovalPartialSort'
                      ? '투입칸에 꼭지제거 후 부분선별할 미선별 박스가 없습니다.'
                      : '투입칸에 부분선별할 미선별 박스가 없습니다.')
                    : '투입칸에 꼭지제거할 박스가 없습니다.');
                }
                const startBlockedReasonText = startBlockedReasons.join(' ') || String(workbenchStartState?.blockedReason || '').trim();
                const preferredWorkerSlot = workerSlots.find((workerSlot) => !workerSlot?.assignment) || workerSlots[0] || null;
                const startButtonLabel = inlineAnimationActive ? '작업 진행 중' : '▶ 작업시작';
                return (
                  <>
                    <div
                      className={`warehouse-workbench-slot-card__content ${inlineAnimationPhase ? `is-${inlineAnimationPhase}` : ''}`.trim()}
                    >
                      <div className="warehouse-workbench-slot-card__slot-stage">
                        <div className="warehouse-workbench-slot-card__center-stage">
                          {selectedTaskLabel ? (
                            <span className="warehouse-workbench-slot-card__task-badge warehouse-workbench-slot-card__task-badge--stage">
                              <small>현재 작업</small>
                              <strong>{selectedTaskLabel}</strong>
                              <span className="warehouse-workbench-slot-card__task-count">{`투입 ${selectedInputBoxCount}박스`}</span>
                            </span>
                          ) : null}
                          {slot.installedTable?.imageUrl ? (
                            <div className="warehouse-workbench-slot-card__table-visual" aria-hidden="true">
                              <img src={slot.installedTable.imageUrl} alt="" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="warehouse-workbench-slot-card__crew-layout">
                        {workerSlots.map((workerSlot) => {
                          const assignment = workerSlot?.assignment || null;
                          const workerTypeKey = String(assignment?.workerTypeKey || assignment?.workerType || '');
                          const workerGender = String(assignment?.workerGender || 'neutral');
                          const workerName = String(assignment?.workerLabel || '').trim();
                          const workerLabor = Math.max(0, Number(assignment?.workerLabor) || 0);
                          return (
                            <div
                              key={`workbench-crew-card-${slot.key}-${workerSlot.key}`}
                              className={`warehouse-workbench-slot-card__crew-card ${assignment ? 'is-assigned' : ''}`.trim()}
                              aria-label={assignment ? `${workerSlot.label} ${workerName}` : `${workerSlot.label} 미배치`}
                            >
                              {assignment ? (
                                <>
                                  <span className="warehouse-workbench-slot-card__crew-icon" aria-hidden="true">
                                    {crewIconOf(workerTypeKey || 'self', workerGender)}
                                  </span>
                                  <strong className="warehouse-workbench-slot-card__crew-name">{workerName}</strong>
                                  <span className="warehouse-workbench-slot-card__crew-status warehouse-workbench-slot-card__crew-status--labor">
                                    <span className="warehouse-workbench-slot-card__crew-status-label">노동력 :</span>{' '}
                                    <strong className="warehouse-workbench-slot-card__crew-status-value">{laborText(workerLabor)}</strong>
                                  </span>
                                </>
                              ) : (
                                <strong className="warehouse-workbench-slot-card__crew-name">미배치</strong>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="warehouse-workbench-slot-card__action-row">
                        <button
                          className="button button--compact button--primary facility-workbench-install-button warehouse-workbench-slot-card__assign-button"
                          type="button"
                          disabled={inlineAnimationActive}
                          onClick={() => {
                            if (!preferredWorkerSlot) return;
                            setWorkbenchWorkerPicker({
                              facilityKey: String(activeFacilityStorageKey || ''),
                              workbenchSlotKey: slot.key,
                              workbenchSlotLabel: slot.label,
                              workbenchName: slot.installedTable?.name || '작업대',
                              positionKey: preferredWorkerSlot.key,
                              positionTitle: preferredWorkerSlot.label,
                              positionKeys: workerSlots.map((workerSlot) => String(workerSlot?.key || '')).filter(Boolean),
                            });
                          }}
                        >
                          👷 인원배치
                        </button>
                        <button
                          className="button button--compact button--ghost facility-workbench-install-button warehouse-workbench-slot-card__task-button"
                          type="button"
                          disabled={inlineAnimationActive}
                          onClick={() => {
                            openWorkbenchTaskPicker?.(
                              slot.key,
                              slot.label,
                              slot.installedTable?.name || '작업대'
                            );
                          }}
                        >
                          🛠️ 작업선택
                        </button>
                        <button
                          className="button button--compact button--ghost facility-workbench-install-button warehouse-workbench-slot-card__task-button"
                          type="button"
                          disabled={inlineAnimationActive}
                          onClick={() => {
                            openWorkbenchInOutModal?.(
                              slot.key,
                              slot.label,
                              slot.installedTable?.name || '작업대'
                            );
                          }}
                        >
                          🔄 투입배출
                        </button>
                        <button
                          className="button button--compact button--ghost facility-workbench-install-button warehouse-workbench-slot-card__task-button"
                          type="button"
                          disabled={inlineAnimationActive}
                          onClick={() => {
                            openWorkbenchBoxPicker?.(
                              slot.key,
                              slot.label,
                              slot.installedTable?.name || '작업대'
                            );
                          }}
                        >
                          📦 박스선택
                        </button>
                        {canStartWorkbenchTask && !inlineAnimationActive ? (
                          <button
                            className="button button--compact facility-workbench-install-button warehouse-workbench-slot-card__start-button"
                            type="button"
                            onClick={() => {
                              startWorkbenchTask?.(slot.key);
                            }}
                          >
                            {startButtonLabel}
                          </button>
                        ) : (
                          <span className="disabled-tip" title={inlineAnimationActive ? '작업대에서 애니메이션을 재생 중입니다.' : startBlockedReasonText}>
                            <button
                              className="button button--compact facility-workbench-install-button warehouse-workbench-slot-card__start-button"
                              type="button"
                              disabled
                              aria-disabled="true"
                            >
                              {startButtonLabel}
                            </button>
                          </span>
                        )}
                      </div>
                      <div className="warehouse-workbench-slot-card__crew-summary">
                        <strong>{`배치 인원 ${Math.max(0, Number(workbenchStartState?.assignedWorkerCount) || uniqueAssignedNames.length)}/${workerSlots.length}명`}</strong>
                        <span>{uniqueAssignedNames.length > 0 ? uniqueAssignedNames.join(', ') : '아직 배치된 인원이 없습니다.'}</span>
                        {hasAssignedWorker && workbenchStartState?.totalLaborCost > 0 ? (
                          <span>{`예상 노동력 ${laborText(workbenchStartState.totalLaborCost)} (박스당 ${laborText(workbenchStartState.laborCostPerBox)})`}</span>
                        ) : null}
                      </div>
                    </div>
                    {inlineAnimationPlan ? (
                      <div
                        className={`warehouse-workbench-slot-card__inline-animation ${inlineAnimationPhase ? `is-${inlineAnimationPhase}` : ''}`.trim()}
                        aria-live="polite"
                      >
                        <div className="warehouse-workbench-slot-card__inline-animation-meta">
                          <span>{inlineAnimationPlan.workbenchLabel || slot.label}</span>
                          <span>{inlineAnimationPlan.taskLabel || '작업'}</span>
                          <span>{`${Math.max(0, Number(inlineAnimationPlan.processableBoxCount) || 0)}박스`}</span>
                        </div>
                        <div className="warehouse-workbench-slot-card__inline-animation-frame-wrap">
                          <iframe
                            key={inlineAnimationPlan.presetKey}
                            title={`${slot.label} 작업 애니메이션`}
                            srcDoc={inlineAnimationPlan.html}
                            className="warehouse-workbench-slot-card__inline-animation-frame"
                          />
                        </div>
                        <div className="warehouse-workbench-slot-card__inline-animation-status">
                          {inlineAnimationPhase === 'transition-out'
                            ? '작업대를 준비하는 중입니다...'
                            : inlineAnimationPhase === 'applying'
                              ? '작업 결과를 반영하는 중입니다...'
                              : (inlineAnimationPlan.statusText || '작업을 진행 중입니다...')}
                        </div>
                      </div>
                    ) : null}
                  </>
                );
              })()}
              </>
            ) : (
              <>
                {emptySlotCollapsed ? null : (
                  <>
                    <div className="warehouse-workbench-slot-card__hint">비어 있는 작업칸</div>
                    <div className="warehouse-workbench-slot-card__actions">
                      <button
                        className="button button--compact button--primary facility-workbench-install-button"
                        type="button"
                        onClick={() => openWorkbenchInstallPicker(slot.key.replace('workbench-slot-', ''))}
                      >
                        작업대 설치
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )})}
    </div>
  );
}

function WarehouseCoolingPanel({
  slots,
  facilityLabel,
  statusLabel,
  tempLabel,
  isOn,
  facilityType,
}) {
  return (
    <div className="warehouse-cooling-slot-list">
      {slots.map((slot) => (
        <article
          key={slot.key}
          className={`warehouse-cooling-slot-card warehouse-cooling-slot-card--${facilityType || 'generic'} ${isOn ? 'is-on' : 'is-off'}`.trim()}
        >
          <div className="warehouse-cooling-slot-card__head">
            <div>
              <div className="warehouse-cooling-slot-card__label">{slot.label}</div>
              <strong className="warehouse-cooling-slot-card__title">{slot.title}</strong>
            </div>
            <span className={`warehouse-cooling-slot-card__state ${isOn ? 'is-on' : 'is-off'}`.trim()}>
              {statusLabel}
            </span>
          </div>
          {slot.imageSrc ? (
            <div className="warehouse-cooling-slot-card__visual" aria-hidden="true">
              <img src={slot.imageSrc} alt="" />
            </div>
          ) : null}
          <div className="warehouse-cooling-slot-card__meta">
            <span>{`${facilityLabel} 연결중`}</span>
            <span>{`설비가동비 ${slot.costText || '0원'}`}</span>
            <span>{`설정온도 ${tempLabel || '0°C'}`}</span>
            <span>{slot.summary}</span>
            <span className={slot.durabilityClassName || ''}>
              {`내구도 ${Number(slot.durabilityPct || 0).toFixed(1)}%`}
            </span>
            <div className={`storage-card__durability-gauge ${slot.durabilityClassName || ''}`.trim()}>
              <span style={{ width: `${Math.max(0, Math.min(100, Number(slot.durabilityPct) || 0)).toFixed(1)}%` }} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export { WarehouseSortingPanel, WarehouseWorkbenchPanel, WarehouseCoolingPanel };
