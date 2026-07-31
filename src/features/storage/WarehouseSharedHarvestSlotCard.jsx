import React from 'react';
import {
  buildHarvestPalletMemoColorStyle,
  resolveHarvestPalletMemoLayer,
} from './harvestPalletMemo';

const COMPATIBLE_WAREHOUSE_TARGET_TYPES = new Set([
  'warehouse-empty',
  'warehouse-stack-top',
  'warehouse-floor-harvest',
  'warehouse-empty-pallet',
  'warehouse-harvest-pallet',
]);

export function isSamePendingHarvestTarget(target, pendingTarget) {
  if (!target || !pendingTarget) return false;
  const targetType = String(target?.targetType || '');
  const pendingType = String(pendingTarget?.targetType || '');
  const sameType = targetType === pendingType
    || (
      COMPATIBLE_WAREHOUSE_TARGET_TYPES.has(targetType)
      && COMPATIBLE_WAREHOUSE_TARGET_TYPES.has(pendingType)
    );
  if (!sameType) return false;
  if (targetType === 'vehicle-slot' || pendingType === 'vehicle-slot') {
    return String(
      target?.targetVehicleInstanceId
      || target?.vehicleInstanceId
      || ''
    ) === String(
      pendingTarget?.targetVehicleInstanceId
      || pendingTarget?.vehicleInstanceId
      || ''
    ) && Number(
      target?.targetVehiclePalletSlotNo
      || target?.vehiclePalletSlotNo
      || target?.slotNo
      || 0
    ) === Number(
      pendingTarget?.targetVehiclePalletSlotNo
      || pendingTarget?.vehiclePalletSlotNo
      || pendingTarget?.slotNo
      || 0
    );
  }
  return String(target?.facilityKey || '') === String(pendingTarget?.facilityKey || '')
    && Number(target?.slotNo || 0) === Number(pendingTarget?.slotNo || 0);
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
      tone: (() => {
        const tone = harvestPalletBoxToneAt?.(entry, displayBoxIndex);
        if (tone === 'packed') return 'packed';
        return tone === 'green' ? 'green' : 'yellow';
      })(),
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

function buildHarvestBoxFillAnimMetaMap(fillAnimEntry = null) {
  const tick = Math.max(0, Math.floor(Number(fillAnimEntry?.tick) || 0));
  if (tick <= 0) return new Map();
  const visualSlotNos = Array.isArray(fillAnimEntry?.visualSlotNos)
    ? fillAnimEntry.visualSlotNos
        .map((value) => Math.max(0, Math.floor(Number(value) || 0)))
        .filter((value, index, array) => value > 0 && array.indexOf(value) === index)
    : [];
  return visualSlotNos.reduce((acc, visualSlotNo, index) => {
    acc.set(visualSlotNo, {
      tick,
      order: index,
    });
    return acc;
  }, new Map());
}

function buildHarvestBoxPendingVisualSlotSet(fillAnimEntry = null) {
  if (!fillAnimEntry?.deferCommitVisual) return new Set();
  const pendingVisualSlotNos = Array.isArray(fillAnimEntry?.pendingVisualSlotNos)
    ? fillAnimEntry.pendingVisualSlotNos
        .map((value) => Math.max(0, Math.floor(Number(value) || 0)))
        .filter((value, index, array) => value > 0 && array.indexOf(value) === index)
    : [];
  return new Set(pendingVisualSlotNos);
}

function buildInteractiveHarvestBoxEntries({
  entry,
  storageSlotNo,
  sourceLayerKey = 'bottom',
  sourceMeta = null,
  sourceType = 'warehouse-slot',
  sourceVehicleInstanceId = '',
  sourceVehicleFloorStored = false,
  sourceDomIdPrefix = 'warehouse-slot-box',
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
    const boxDomId = sourceType === 'vehicle-slot'
      ? `${sourceDomIdPrefix}:${sourceVehicleInstanceId}:${storageSlotNo}:${sourceLayerKey}:${displayBoxIndex}`
      : `${sourceDomIdPrefix}:${storageSlotNo}:${sourceLayerKey}:${displayBoxIndex}`;
    const tooltip = Array.isArray(boxTooltips) ? (boxTooltips[displayBoxIndex] || null) : null;
    const sourceVisualSlotNo = Math.max(1, Math.floor(Number(tooltip?.sourceVisualSlotNo || tooltip?.visualSlotNo) || displayBoxIndex + 1));
    const sourcePayload = {
      sourceType,
      sourceSlotNo: sourceType === 'warehouse-slot' ? storageSlotNo : 0,
      sourceVehicleInstanceId,
      sourceVehiclePalletSlotNo: sourceType === 'vehicle-slot' ? storageSlotNo : 0,
      sourceLayerKey,
      sourceVehicleFloorStored,
      sourceFloorStored: Boolean(sourceMeta?.isFloorStored || sourceMeta?.sourceFloorStored),
      sourceDomId: boxDomId,
      sourceVisualSlotNo,
      sourceDisplaySlotNo: displayBoxIndex + 1,
      sourceBatchId: String(tooltip?.sourceBatchId || ''),
      sourceBoxUnitNo: Math.max(0, Math.floor(Number(tooltip?.sourceBoxUnitNo) || 0)),
      warehouseSubTab: String(sourceMeta?.warehouseSubTab || ''),
    };
    const isInteractiveBox = canPickThisBox || canChooseThisBoxTarget || canReceiveThisBox || canSendThisBoxBackToTransport;
    return {
      key: `interactive-harvest-box-${storageSlotNo}-${sourceLayerKey}-${boxIndex + 1}`,
      filled: isFilledBox,
      tone: (() => {
        const tone = harvestPalletBoxToneAt?.(entry, displayBoxIndex);
        if (tone === 'packed') return 'packed';
        return tone === 'green' ? 'green' : 'yellow';
      })(),
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

export function HarvestBoxGrid({
  boxEntries = [],
}) {
  const normalizedBoxEntries = boxEntries.map((boxEntry) => ({
    ...boxEntry,
    filled: Boolean(boxEntry?.filled),
    tone: boxEntry?.tone === 'packed' ? 'packed' : (boxEntry?.tone === 'green' ? 'green' : 'yellow'),
  }));
  const hasFilledBoxes = normalizedBoxEntries.some((boxEntry) => Boolean(boxEntry?.filled));
  return (
    <div
      className={`warehouse-harvest-slot-box-grid warehouse-harvest-slot-box-grid--layer ${hasFilledBoxes ? 'has-filled-boxes' : ''}`.trim()}
    >
      {normalizedBoxEntries.map((boxEntry, boxIndex) => {
        const tooltip = boxEntry?.tooltip || null;
        const toneClassName = boxEntry?.tone === 'packed' ? 'is-packed' : (boxEntry?.tone === 'green' ? 'is-green' : 'is-yellow');
        const className = `warehouse-harvest-slot-box ${typeof boxEntry?.onClick === 'function' || typeof boxEntry?.onPointerDown === 'function' ? 'warehouse-harvest-slot-box-button' : ''} ${boxEntry?.filled ? 'is-filled' : ''} ${toneClassName} ${boxEntry?.pickable ? 'is-box-pickable' : ''} ${boxEntry?.fillAnimMeta ? 'is-individual-fill-drop' : ''}`.trim();
        const commonProps = {
          key: boxEntry?.key || `shared-harvest-box-${boxIndex + 1}`,
          className,
          style: boxEntry?.fillAnimMeta
            ? {
              ...(boxEntry?.style || {}),
              '--harvest-fill-drop-delay-ms': `${Math.max(0, Number(boxEntry.fillAnimMeta?.order) || 0) * 64}ms`,
            }
            : boxEntry?.style,
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

export default function WarehouseSharedHarvestSlotCard({
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
  visibleLayerSlotKey = null,
  harvestPalletDisplayBoxIndexOf = null,
  harvestPalletBoxFilledAt = null,
  harvestPalletVisibleFilledSlotsAfterPreview = null,
  harvestPalletBoxToneAt = null,
  harvestBoxesPerPallet = 0,
  harvestBoxTooltipBySlot = {},
  individualFillAnimBySlot = {},
  animateSlotShell = true,
  cardClassName = '',
  headerNode = null,
  overlayBadgeContent = null,
  openDetailSource = null,
  movePickerMeta = null,
  manualContent = null,
  hideLoadLabel = false,
  alwaysShowManualContent = false,
  onTransportPickHarvestPallet = null,
  onTransportPickEmptyPallet = null,
  cardButtonEnabled = false,
  onCardButtonClick = null,
  forceSelected = false,
  suppressDetailOpen = false,
  suppressMemoButton = false,
}) {
  const slotContextType = String(openDetailSource?.type || '') === 'vehicle' ? 'vehicle-slot' : 'warehouse-slot';
  const slotContextVehicleInstanceId = String(openDetailSource?.vehicleInstanceId || movePickerMeta?.vehicleInstanceId || '');
  const visibleLayerStateKey = visibleLayerSlotKey ?? slotNo;
  const isIndividualTransportMode = String(selectedTransportMode || 'pallet') === 'individual';
  const hasTopLayer = Boolean(slotEntry?.hasTopLayer || slotEntry?.topLayer || slotEntry?.bottomLayer?.topLayer);
  const visibleLayerKey = hasTopLayer && visibleLayerBySlot?.[visibleLayerStateKey] === 'top'
    ? 'top'
    : 'bottom';
  const bottomLayerEntry = slotEntry?.bottomLayer || slotEntry || null;
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
    && (
      (
        slotContextType === 'warehouse-slot'
        && movingSourceType === 'warehouse-slot'
        && movingSourceSlotNo === Math.max(0, Number(slotNo || 0))
      )
      || (
        slotContextType === 'vehicle-slot'
        && movingSourceType === 'vehicle-slot'
        && String(movingHarvestPreviewSource?.sourceVehicleInstanceId || '') === slotContextVehicleInstanceId
        && Math.max(0, Math.floor(Number(movingHarvestPreviewSource?.sourceVehiclePalletSlotNo) || 0)) === Math.max(0, Number(slotNo || 0))
      )
    );
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
      || moveTargetType === 'vehicle-slot'
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
            || moveTargetType === 'vehicle-slot'
          )
          : (
            moveTargetType === 'warehouse-empty'
            || moveTargetType === 'warehouse-stack-top'
            || moveTargetType === 'vehicle-slot'
          )
      )
    )
    || canStartIndividualWarehouseTargetSelection
  ) && !hideEmptyPalletNonStackPlaceAction;
  const isMovingWholePalletSource = !isIndividualTransportMode
    && movingSourceLayerKey === visibleLayerKey
    && (
      (
        slotContextType === 'warehouse-slot'
        && movingSourceType === 'warehouse-slot'
        && movingSourceSlotNo === Math.max(0, Number(slotNo || 0))
      )
      || (
        slotContextType === 'vehicle-slot'
        && movingSourceType === 'vehicle-slot'
        && String(movingHarvestPreviewSource?.sourceVehicleInstanceId || '') === slotContextVehicleInstanceId
        && Math.max(0, Math.floor(Number(movingHarvestPreviewSource?.sourceVehiclePalletSlotNo) || 0)) === Math.max(0, Number(slotNo || 0))
      )
    );
  const effectiveOccupied = isMovingWholePalletSource ? false : Boolean(slotEntry?.occupied);
  const effectiveIsHarvestStored = isMovingWholePalletSource
    ? false
    : Boolean(slotEntry?.hasStoredHarvest ?? slotEntry?.isHarvestStored);
  const effectiveIsFloorStored = isMovingWholePalletSource
    ? false
    : Boolean(slotEntry?.isFloorStored);
  const effectiveHasTopLayer = isMovingWholePalletSource ? false : hasTopLayer;
  const effectiveHasEmptyPallet = isMovingWholePalletSource
    ? false
    : Boolean(
      slotEntry?.hasEmptyPallet
      ?? (effectiveOccupied && !effectiveIsHarvestStored && !effectiveIsFloorStored)
    );
  const rawVisibleFilledBoxCount = effectiveIsFloorStored
    ? Math.max(0, Math.floor(Number(slotEntry?.filledBoxCount) || 0))
    : countLayerBoxes(
      visibleLayerEntry,
      visibleLayerKey === 'top' ? slotEntry?.topLayerFilledBoxCount : slotEntry?.filledBoxCount,
    );
  const isMovingSourceSlot = (
    (
      slotContextType === 'warehouse-slot'
      && String(movingHarvestPreviewSource?.sourceType || '') === 'warehouse-slot'
      && Math.max(0, Math.floor(Number(movingHarvestPreviewSource?.sourceSlotNo) || 0)) === Math.max(0, Number(slotNo || 0))
    )
    || (
      slotContextType === 'vehicle-slot'
      && String(movingHarvestPreviewSource?.sourceType || '') === 'vehicle-slot'
      && String(movingHarvestPreviewSource?.sourceVehicleInstanceId || '') === slotContextVehicleInstanceId
      && Math.max(0, Math.floor(Number(movingHarvestPreviewSource?.sourceVehiclePalletSlotNo) || 0)) === Math.max(0, Number(slotNo || 0))
    )
  ) && String(movingHarvestPreviewSource?.sourceLayerKey || 'bottom') === visibleLayerKey;
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
  const activeIndividualFillAnimEntry = (() => {
    if (slotContextType === 'vehicle-slot') {
      return individualFillAnimBySlot?.[`vehicle:${slotContextVehicleInstanceId}:${slotNo}`] || null;
    }
    return visibleLayerKey === 'bottom'
      ? (individualFillAnimBySlot?.[`warehouse:${slotNo}`] || null)
      : null;
  })();
  const fillAnimMetaByVisualSlotNo = React.useMemo(
    () => buildHarvestBoxFillAnimMetaMap(activeIndividualFillAnimEntry),
    [activeIndividualFillAnimEntry]
  );
  const pendingFillVisualSlotNoSet = React.useMemo(
    () => buildHarvestBoxPendingVisualSlotSet(activeIndividualFillAnimEntry),
    [activeIndividualFillAnimEntry]
  );
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
  const displayAsEmptyTarget = isIndividualTransportMode
    && Math.max(0, Math.floor(Number(movingHarvestPreviewFilledBoxCount) || 0)) > 0
    && shouldUseMoveTargetAction
    && (Boolean(moveTarget?.canChoose) || isPendingMoveTarget)
    && (
      moveTargetType === 'warehouse-empty'
      || moveTargetType === 'warehouse-floor-harvest'
      || canDisplayEmptyPalletAsIndividualTarget
    )
    && (
      canDisplayEmptyPalletAsIndividualTarget
      || (
        !effectiveOccupied
        && !effectiveHasTopLayer
        && !effectiveIsHarvestStored
        && !effectiveIsFloorStored
        )
    );
  const keepPalletOccupiedWhileTargeting = displayAsEmptyTarget
    && canDisplayEmptyPalletAsIndividualTarget;
  const useEmptyTargetTone = displayAsEmptyTarget
    && !keepPalletOccupiedWhileTargeting;
  const useEmptyPalletTargetTone = displayAsEmptyTarget
    && keepPalletOccupiedWhileTargeting;
  const renderSlotOccupied = displayAsEmptyTarget
    ? keepPalletOccupiedWhileTargeting
    : effectiveOccupied;
  const renderHasTopLayer = displayAsEmptyTarget ? false : effectiveHasTopLayer;
  const renderIsHarvestStored = displayAsEmptyTarget ? false : effectiveIsHarvestStored;
  const renderIsFloorStored = displayAsEmptyTarget ? false : effectiveIsFloorStored;
  const renderVisibleFilledBoxCount = displayAsEmptyTarget ? 0 : visibleFilledBoxCount;
  const renderVisibleLoadLabel = displayAsEmptyTarget ? '' : visibleLoadLabel;
  const renderVisibleLayerMemo = displayAsEmptyTarget ? '' : visibleLayerMemo;
  const isEmptyPalletOccupiedCard = renderSlotOccupied
    && !renderIsHarvestStored
    && !renderIsFloorStored
    && !renderHasTopLayer
    && Boolean(palletImageSrc);
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
  const canChooseSingleLayerBoxTarget = isIndividualTransportMode
    && Math.max(0, Math.floor(Number(movingHarvestPreviewFilledBoxCount) || 0)) > 0
    && shouldUseMoveTargetAction
    && Boolean(moveTarget?.canChoose)
    && !isPendingMoveTarget
    && (
      moveTargetType === 'warehouse-empty'
      || moveTargetType === 'warehouse-floor-harvest'
      || moveTargetType === 'vehicle-slot'
      || moveTargetType === 'warehouse-empty-pallet'
    );
  const canSendBoxesBackToTransportDock = isPendingMoveTarget
    && isIndividualTransportMode
    && typeof pickIndividualHarvestBoxToSelectedTransportDock === 'function';
  const canReceiveBoxesFromTransportDock = false;
  React.useEffect(() => {
    if (!isIndividualTransportMode) return;
    if (!isPendingMoveTarget) return;
    if (Math.max(0, Math.floor(Number(movingHarvestPreviewFilledBoxCount) || 0)) <= 0) return;
    if (displayAsEmptyTarget || canReceiveBoxesFromTransportDock) return;
    const slotKind = slotEntry?.isWorkbenchCargoSlot
      ? 'workbench'
      : (slotEntry?.isSortingCargoSlot ? 'sorting' : 'storage');
    console.info('[harvest-move-debug] pending target lost interactive empty state', {
      slotKind,
      slotNo,
      moveTargetType,
      pendingTargetType: String(pendingHarvestMoveTarget?.targetType || ''),
      occupied: Boolean(slotEntry?.occupied),
      hasStoredHarvest: Boolean(slotEntry?.hasStoredHarvest ?? slotEntry?.isHarvestStored),
      isFloorStored: Boolean(slotEntry?.isFloorStored),
      hasEmptyPallet: Boolean(slotEntry?.hasEmptyPallet),
      shouldUseMoveTargetAction,
      canChooseMoveTarget: Boolean(moveTarget?.canChoose),
      canReceiveBoxesFromTransportDock,
      canSendBoxesBackToTransportDock,
      movingHarvestPreviewFilledBoxCount: Math.max(0, Math.floor(Number(movingHarvestPreviewFilledBoxCount) || 0)),
      movingHarvestPreviewBoxCount: Math.max(0, Math.floor(Number(movingHarvestPreviewBoxCount) || 0)),
      movingSourceType: String(movingHarvestPreviewSource?.sourceType || ''),
      movingSourceSlotNo: Math.max(0, Math.floor(Number(movingHarvestPreviewSource?.sourceSlotNo || 0) || 0)),
      movingSourceVehicleInstanceId: String(movingHarvestPreviewSource?.sourceVehicleInstanceId || ''),
      movingSourceVehiclePalletSlotNo: Math.max(0, Math.floor(Number(movingHarvestPreviewSource?.sourceVehiclePalletSlotNo || 0) || 0)),
    });
  }, [
    canReceiveBoxesFromTransportDock,
    canSendBoxesBackToTransportDock,
    displayAsEmptyTarget,
    isIndividualTransportMode,
    isPendingMoveTarget,
    moveTarget,
    moveTargetType,
    movingHarvestPreviewBoxCount,
    movingHarvestPreviewFilledBoxCount,
    movingHarvestPreviewSource,
    pendingHarvestMoveTarget,
    shouldUseMoveTargetAction,
    slotEntry,
    slotNo,
  ]);
  const buildLayerBoxEntries = (layerKey, layerEntry, filledCount, filledSlotsOverride = null) => {
    const boxTooltips = layerKey === 'top'
      ? (Array.isArray(harvestBoxTooltipBySlot?.[slotNo]?.top) ? harvestBoxTooltipBySlot[slotNo].top : [])
      : (Array.isArray(harvestBoxTooltipBySlot?.[slotNo]?.bottom) ? harvestBoxTooltipBySlot[slotNo].bottom : []);
    const isActiveLayer = layerKey === visibleLayerKey;
    const withFillAnimMeta = (boxEntries) => boxEntries.map((boxEntry, boxIndex) => {
      const displayBoxIndex = typeof harvestPalletDisplayBoxIndexOf === 'function'
        ? harvestPalletDisplayBoxIndexOf(boxIndex)
        : boxIndex;
      const visualSlotNo = displayBoxIndex + 1;
      const isPendingCommitBox = layerKey === visibleLayerKey
        && pendingFillVisualSlotNoSet.has(visualSlotNo)
        && Boolean(boxEntry?.filled);
      const fillAnimMeta = layerKey === visibleLayerKey
        ? (fillAnimMetaByVisualSlotNo.get(visualSlotNo) || null)
        : null;
      if (!fillAnimMeta) {
        if (!isPendingCommitBox) return boxEntry;
        return {
          ...boxEntry,
          filled: false,
          pickable: false,
          onClick: undefined,
          onPointerDown: undefined,
          dataSourceId: undefined,
        };
      }
      if (!boxEntry?.filled && !isPendingCommitBox) return boxEntry;
      return {
        ...boxEntry,
        filled: true,
        fillAnimMeta,
        pickable: false,
        onClick: undefined,
        onPointerDown: undefined,
        dataSourceId: undefined,
      };
    });
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
      return withFillAnimMeta(buildInteractiveHarvestBoxEntries({
        entry: layerEntry,
        storageSlotNo: Math.max(0, Number(slotNo || 0)),
        sourceLayerKey: layerKey,
        sourceMeta: {
          isFloorStored: Boolean(renderIsFloorStored),
          warehouseSubTab: slotEntry?.isWorkbenchCargoSlot
            ? 'workbench'
            : (slotEntry?.isSortingCargoSlot ? 'sorting' : 'storage'),
        },
        sourceType: slotContextType,
        sourceVehicleInstanceId: slotContextVehicleInstanceId,
        sourceVehicleFloorStored: Boolean(renderIsFloorStored),
        sourceDomIdPrefix: slotContextType === 'vehicle-slot' ? 'vehicle-slot-box' : 'warehouse-slot-box',
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
      }));
    }
    return withFillAnimMeta(buildStaticHarvestBoxEntries({
      entry: layerEntry,
      filledBoxCount: filledCount,
      harvestBoxesPerPallet,
      harvestPalletDisplayBoxIndexOf,
      harvestPalletBoxFilledAt,
      harvestPalletBoxToneAt,
      boxTooltips,
    }));
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
  const shouldKeepSingleLayerGridMounted = !renderHasTopLayer
    && isMovingSourceSlot
    && previewMovingBoxCount > 0
    && renderIsHarvestStored
    && !renderIsFloorStored;
  const moveTargetActionLabel = moveTargetType === 'warehouse-stack-top'
    ? '2단 적재'
    : (isIndividualTransportMode ? '결합' : '놓기');
  const shouldDockMoveTargetButtonBelowGrid = hasInteractiveSingleLayerBoxes && isIndividualTransportMode;
  const hideStackTopMoveTargetButton = moveTargetType === 'warehouse-stack-top'
    && Boolean(selectedTransportRow)
    && !Boolean(selectedTransportCanStackPallet);
  const canOpenDetailByCard = !suppressDetailOpen && renderSlotOccupied && !selectedTransportRow;
  const canAnimateSlotShell = Boolean(animateSlotShell) && !renderHasTopLayer && !renderIsFloorStored;
  const hasOccupiedSlotShell = canAnimateSlotShell && renderSlotOccupied;
  const canAnimateStackDock = renderHasTopLayer && !renderIsFloorStored;
  const hasAnimatedStackDock = canAnimateStackDock && renderSlotOccupied;
  const slotShellAnimationTimerRef = React.useRef(null);
  const slotShellInitializedRef = React.useRef(false);
  const previousOccupiedSlotShellRef = React.useRef(hasOccupiedSlotShell);
  const previousSlotShellHadPalletRef = React.useRef(Boolean(palletImageSrc));
  const latestSlotShellSnapshotRef = React.useRef(null);
  const [slotShellAnimationState, setSlotShellAnimationState] = React.useState('');
  const [undockingSlotGhostSnapshot, setUndockingSlotGhostSnapshot] = React.useState(null);
  const stackDockAnimationTimerRef = React.useRef(null);
  const stackDockInitializedRef = React.useRef(false);
  const previousAnimatedStackDockRef = React.useRef(hasAnimatedStackDock);
  const [stackDockAnimationState, setStackDockAnimationState] = React.useState('');
  React.useEffect(() => {
    if (!slotShellInitializedRef.current) {
      slotShellInitializedRef.current = true;
      previousOccupiedSlotShellRef.current = hasOccupiedSlotShell;
      previousSlotShellHadPalletRef.current = Boolean(palletImageSrc);
      return undefined;
    }
    if (slotShellAnimationTimerRef.current) {
      window.clearTimeout(slotShellAnimationTimerRef.current);
      slotShellAnimationTimerRef.current = null;
    }
    const hadOccupiedSlotShell = previousOccupiedSlotShellRef.current;
    if (!hadOccupiedSlotShell && hasOccupiedSlotShell) {
      setUndockingSlotGhostSnapshot(null);
      setSlotShellAnimationState('is-slot-shell-docking');
      slotShellAnimationTimerRef.current = window.setTimeout(() => {
        setSlotShellAnimationState('');
        slotShellAnimationTimerRef.current = null;
      }, 800);
    } else if (hadOccupiedSlotShell && !hasOccupiedSlotShell) {
      setUndockingSlotGhostSnapshot(latestSlotShellSnapshotRef.current);
      setSlotShellAnimationState('is-slot-shell-undocking');
      slotShellAnimationTimerRef.current = window.setTimeout(() => {
        setSlotShellAnimationState('');
        setUndockingSlotGhostSnapshot(null);
        slotShellAnimationTimerRef.current = null;
      }, 800);
    }
    previousOccupiedSlotShellRef.current = hasOccupiedSlotShell;
    previousSlotShellHadPalletRef.current = Boolean(palletImageSrc);
    return undefined;
  }, [hasOccupiedSlotShell, palletImageSrc]);
  React.useEffect(() => () => {
    if (slotShellAnimationTimerRef.current) {
      window.clearTimeout(slotShellAnimationTimerRef.current);
      slotShellAnimationTimerRef.current = null;
    }
  }, []);
  React.useEffect(() => {
    if (!stackDockInitializedRef.current) {
      stackDockInitializedRef.current = true;
      previousAnimatedStackDockRef.current = hasAnimatedStackDock;
      return undefined;
    }
    if (stackDockAnimationTimerRef.current) {
      window.clearTimeout(stackDockAnimationTimerRef.current);
      stackDockAnimationTimerRef.current = null;
    }
    const hadAnimatedStackDock = previousAnimatedStackDockRef.current;
    if (!hadAnimatedStackDock && hasAnimatedStackDock) {
      setStackDockAnimationState('is-stack-drop-anim');
      stackDockAnimationTimerRef.current = window.setTimeout(() => {
        setStackDockAnimationState('');
        stackDockAnimationTimerRef.current = null;
      }, 800);
    }
    previousAnimatedStackDockRef.current = hasAnimatedStackDock;
    return undefined;
  }, [hasAnimatedStackDock]);
  React.useEffect(() => () => {
    if (stackDockAnimationTimerRef.current) {
      window.clearTimeout(stackDockAnimationTimerRef.current);
      stackDockAnimationTimerRef.current = null;
    }
  }, []);
  const openDetail = () => {
    if (!openHarvestDetail) return;
    openHarvestDetail({
      layerKey: visibleLayerKey,
      slotNo,
      source: {
        type: String(openDetailSource?.type || 'warehouse'),
        facilityKey: String(activeFacilityStorageKey || ''),
        slotNo,
        ...(openDetailSource || {}),
      },
    });
  };
  const handleCardClick = (event) => {
    if (typeof onCardButtonClick === 'function') {
      onCardButtonClick(event);
      return;
    }
    if (canOpenDetailByCard) openDetail();
  };
  const chooseMoveTarget = (event) => {
    event?.stopPropagation?.();
    if (moveTarget && typeof chooseHarvestMoveTarget === 'function') {
      chooseHarvestMoveTarget(moveTarget);
    }
  };
  const cardActsAsButton = cardButtonEnabled || canOpenDetailByCard;
  const shouldShowHeaderNode = !renderSlotOccupied && !displayAsEmptyTarget;
  const title = renderVisibleFilledBoxCount > 0
    ? undefined
    : (
      renderSlotOccupied
        ? String(visibleLayerEntry?.sourceLabel || slotEntry?.sourceLabel || '수확물 보관중')
        : String(moveTarget?.blockReason || '빈 적재칸')
    );
  React.useEffect(() => {
    if (!hasOccupiedSlotShell) return;
    latestSlotShellSnapshotRef.current = {
      boxEntries: bottomLayerBoxEntries,
      loadLabel: renderVisibleLoadLabel,
      hasPalletBg: Boolean(palletImageSrc),
    };
  }, [bottomLayerBoxEntries, hasOccupiedSlotShell, palletImageSrc, renderVisibleLoadLabel]);
  return (
    <div
      className={`warehouse-harvest-slot-card ${renderSlotOccupied ? 'warehouse-harvest-slot-card--occupied' : 'warehouse-harvest-slot-card--empty'} ${renderSlotOccupied && !renderIsFloorStored && palletImageSrc ? 'warehouse-harvest-slot-card--with-pallet-bg' : ''} ${renderVisibleFilledBoxCount > 0 ? 'warehouse-harvest-slot-card--with-boxes' : ''} ${showTransportActions ? 'warehouse-harvest-slot-card--actionable' : ''} ${renderHasTopLayer ? 'warehouse-harvest-slot-card--stacked' : ''} ${!renderHasTopLayer && renderVisibleFilledBoxCount > 0 ? 'warehouse-harvest-slot-card--single-layer' : ''} ${renderIsFloorStored ? 'warehouse-harvest-slot-card--floor-stored' : ''} ${isEmptyPalletOccupiedCard ? 'warehouse-harvest-slot-card--empty-pallet-occupied' : ''} ${renderHasTopLayer && visibleLayerKey === 'top' ? 'warehouse-harvest-slot-card--view-top' : ''} ${renderHasTopLayer && visibleLayerKey === 'bottom' ? 'warehouse-harvest-slot-card--view-bottom' : ''} ${isMovingWholePalletSource ? 'warehouse-harvest-slot-card--moving-source' : ''} ${useEmptyTargetTone ? 'warehouse-harvest-slot-card--empty-target-tone' : ''} ${useEmptyPalletTargetTone ? 'warehouse-harvest-slot-card--empty-pallet-target-tone' : ''} ${(isPendingMoveTarget || forceSelected) ? 'warehouse-harvest-slot-card--selected' : ''} ${slotShellAnimationState} ${stackDockAnimationState} ${cardClassName}`.trim()}
      title={title}
      style={renderSlotOccupied && !renderIsFloorStored && palletImageSrc ? { '--warehouse-pallet-bg': `url("${palletImageSrc}")` } : undefined}
      role={cardActsAsButton ? 'button' : undefined}
      tabIndex={cardActsAsButton ? 0 : undefined}
      onClick={cardActsAsButton ? handleCardClick : undefined}
      onKeyDown={cardActsAsButton ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCardClick(event);
        }
      } : undefined}
    >
      {canAnimateSlotShell ? (
        <div className="warehouse-harvest-slot-card__slot-shell-motion-layer" aria-hidden="true">
          {slotShellAnimationState === 'is-slot-shell-undocking' && undockingSlotGhostSnapshot ? (
            <div
              className={`warehouse-harvest-slot-card__slot-shell-motion warehouse-harvest-slot-card__slot-shell-motion--undock ${undockingSlotGhostSnapshot.hasPalletBg ? 'has-pallet-bg' : ''}`.trim()}
            >
              <div className="warehouse-harvest-slot-card__slot-shell-motion-card">
                <span className="warehouse-harvest-slot-layer-card__badge">1단</span>
                <HarvestBoxGrid boxEntries={undockingSlotGhostSnapshot.boxEntries} />
                {undockingSlotGhostSnapshot.loadLabel ? (
                  <span className="warehouse-harvest-slot-card__load-label">
                    {String(undockingSlotGhostSnapshot.loadLabel || '').split(' + ')[0] || undockingSlotGhostSnapshot.loadLabel}
                  </span>
                ) : null}
              </div>
            </div>
          ) : slotShellAnimationState === 'is-slot-shell-docking' ? (
            <span
              className={`warehouse-harvest-slot-card__slot-shell-motion warehouse-harvest-slot-card__slot-shell-motion--dock ${previousSlotShellHadPalletRef.current ? 'has-pallet-bg' : ''}`.trim()}
            />
          ) : null}
        </div>
      ) : null}
      {shouldShowHeaderNode ? headerNode : null}
      {overlayBadgeContent ? (
        <div className="warehouse-harvest-slot-card__overlay-chips">
          {overlayBadgeContent}
        </div>
      ) : null}
      {(renderIsHarvestStored || displayAsEmptyTarget) ? (
        <>
          {!renderIsFloorStored ? (
            <>
              {!suppressMemoButton ? (
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
              ) : null}
              {renderVisibleLayerMemo ? (
                <div
                  className={`warehouse-harvest-slot-card__memo-text${suppressMemoButton ? ' warehouse-harvest-slot-card__memo-text--bottom-inline' : ''}`}
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
                  setVisibleLayerBySlot?.((prev) => ({ ...(prev || {}), [visibleLayerStateKey]: 'top' }));
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
                  setVisibleLayerBySlot?.((prev) => ({ ...(prev || {}), [visibleLayerStateKey]: 'bottom' }));
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
                className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--bottom warehouse-harvest-slot-layer-card--stack-drop ${visibleLayerKey === 'bottom' ? 'is-active' : 'is-inactive'} ${renderIsFloorStored ? 'warehouse-harvest-slot-layer-card--floor' : ''}`.trim()}
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
                  setVisibleLayerBySlot?.((prev) => ({ ...(prev || {}), [visibleLayerStateKey]: 'bottom' }));
                }}
              >
                {!renderIsFloorStored ? (
                  <span className="warehouse-harvest-slot-layer-card__badge">1단</span>
                ) : null}
                {visibleLayerKey === 'bottom' ? (
                  <HarvestBoxGrid boxEntries={bottomLayerBoxEntries} />
                ) : null}
              </button>
              <button
                type="button"
                className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--top warehouse-harvest-slot-layer-card--stack-drop ${visibleLayerKey === 'top' ? 'is-active' : 'is-inactive'}`.trim()}
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
                  setVisibleLayerBySlot?.((prev) => ({ ...(prev || {}), [visibleLayerStateKey]: 'top' }));
                }}
              >
                <span className="warehouse-harvest-slot-layer-card__badge">2단</span>
                {visibleLayerKey === 'top' ? (
                  <HarvestBoxGrid boxEntries={topLayerBoxEntries} />
                ) : null}
              </button>
              {renderSlotOccupied && renderVisibleLoadLabel && !hideLoadLabel ? (
                <span className="warehouse-harvest-slot-card__load-label">
                  {String(renderVisibleLoadLabel || '').split(' + ')[0] || renderVisibleLoadLabel}
                </span>
              ) : null}
            </div>
          ) : (
            (renderVisibleFilledBoxCount > 0 || displayAsEmptyTarget || shouldKeepSingleLayerGridMounted) ? (
              <div
                className={`warehouse-harvest-slot-stack ${hasInteractiveSingleLayerBoxes ? 'has-interactive-boxes' : ''} ${hasFilledSingleLayerBoxes ? 'has-filled-boxes' : ''} ${slotShellAnimationState === 'is-slot-shell-docking' ? 'is-slot-shell-docking' : ''}`.trim()}
                aria-hidden={showTransportActions ? undefined : true}
              >
                <div
                  className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--single is-active ${renderIsFloorStored ? 'warehouse-harvest-slot-layer-card--floor' : ''}`.trim()}
                >
                  {!renderIsFloorStored ? (
                    <span className="warehouse-harvest-slot-layer-card__badge">1단</span>
                  ) : null}
                  <HarvestBoxGrid boxEntries={bottomLayerBoxEntries} />
                </div>
                {renderSlotOccupied && renderVisibleLoadLabel && !hideLoadLabel ? (
                  <span className="warehouse-harvest-slot-card__load-label">
                    {String(renderVisibleLoadLabel || '').split(' + ')[0] || renderVisibleLoadLabel}
                  </span>
                ) : null}
              </div>
            ) : null
          )}
          {shouldUseMoveTargetAction && !isPendingMoveTarget && Boolean(moveTarget?.canChoose) && !hideStackTopMoveTargetButton ? (
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
                if (renderIsHarvestStored && typeof onTransportPickHarvestPallet === 'function') {
                  onTransportPickHarvestPallet(slotNo, visibleLayerKey);
                  return;
                }
                if (!renderIsHarvestStored && typeof onTransportPickEmptyPallet === 'function') {
                  onTransportPickEmptyPallet(slotNo, visibleLayerKey);
                  return;
                }
                openHarvestPalletMovePicker?.(slotNo, visibleLayerKey, null, movePickerMeta || undefined);
              }}
            >
              들기
            </button>
          ) : null}
        </>
      ) : shouldUseMoveTargetAction && !isPendingMoveTarget && Boolean(moveTarget?.canChoose) && !hideStackTopMoveTargetButton ? (
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
            if (renderIsHarvestStored && typeof onTransportPickHarvestPallet === 'function') {
              onTransportPickHarvestPallet(slotNo, visibleLayerKey);
              return;
            }
            if (!renderIsHarvestStored && typeof onTransportPickEmptyPallet === 'function') {
              onTransportPickEmptyPallet(slotNo, visibleLayerKey);
              return;
            }
            openHarvestPalletMovePicker?.(slotNo, visibleLayerKey, null, movePickerMeta || undefined);
          }}
        >
          들기
        </button>
      ) : (alwaysShowManualContent ? null : manualContent)}
      {alwaysShowManualContent ? manualContent : null}
    </div>
  );
}
