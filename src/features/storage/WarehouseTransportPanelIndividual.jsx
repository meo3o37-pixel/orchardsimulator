import React from 'react';
import { harvestPalletDisplayBoxIndexOf } from '../harvest/harvestPalletGrid';
import { AppleCratePreview, qualityStampToneClassOf } from '../harvest/HarvestPendingBoxesPanel';
import WarehouseHarvestSingleLayerCard from './WarehouseHarvestSingleLayerCard';
import { normalizeHarvestGradeLabel } from '../../utils/harvestGrade';
import { buildHarvestBoxStateLabelParts, compactHarvestStemStatusLabelOf } from './harvestBoxLabel';

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

function resolveTransportDockBoxTone(boxMeta = null, previewLike = null, previewSlotIndex = 0) {
  const metaTone = String(
    boxMeta?.tone
    || boxMeta?.tooltipEntry?.tone
    || (
      /green/i.test(String(
        boxMeta?.loadBoxKey
        || boxMeta?.tooltipEntry?.loadBoxKey
        || boxMeta?.imageItemKey
        || ''
      ))
        ? 'green'
        : ''
    )
  ).toLowerCase();
  if (metaTone === 'green' || metaTone === 'yellow') return metaTone;
  const previewTone = String(previewLike?.boxTones?.[previewSlotIndex] || '').toLowerCase();
  if (previewTone === 'green' || previewTone === 'yellow') return previewTone;
  return 'yellow';
}

function resolveTransportDockTooltipText(...entries) {
  const matchedTextEntry = entries.find((entry) => String(entry?.text || '').trim());
  if (matchedTextEntry) return String(matchedTextEntry.text || '').trim();
  const fallbackEntry = entries.find((entry) => (
    String(entry?.detailText || '').trim()
    || String(entry?.value || '').trim()
    || String(entry?.cropLabel || '').trim()
    || String(entry?.qualityLabel || '').trim()
    || String(entry?.gradeLabel || '').trim()
  ));
  if (!fallbackEntry) return '';
  const detailedText = buildHarvestBoxStateLabelParts({
    produceTypeLabel: String(fallbackEntry?.produceTypeLabel || '사과').trim() || '사과',
    cropLabel: String(fallbackEntry?.cropLabel || '').trim() || '수확물',
    qualityLabel: String(fallbackEntry?.qualityLabel || '').trim() || '보통',
    gradeLabel: String(fallbackEntry?.gradeLabel || '').trim() || '미선별',
    sizeLabel: String(fallbackEntry?.sizeLabel || '').trim() || '미측정',
    qtyKg: Math.max(0, Number(fallbackEntry?.qtyKg) || 0),
    life: Math.max(0, Math.floor(Number(fallbackEntry?.life) || 0)),
    harvestedDay: Math.max(0, Math.floor(Number(fallbackEntry?.harvestedDay) || 0)),
    loadBoxKey: String(
      fallbackEntry?.loadBoxKey
      || fallbackEntry?.imageItemKey
      || ''
    ).trim(),
    stemRemoved: typeof fallbackEntry?.stemRemoved === 'boolean' ? fallbackEntry.stemRemoved : undefined,
    stemStatusKey: String(fallbackEntry?.stemStatusKey || fallbackEntry?.stemStatus || '').trim(),
    stemStatus: String(fallbackEntry?.stemStatus || '').trim(),
    stemStatusLabel: String(fallbackEntry?.stemStatusLabel || '').trim(),
    stemLabel: String(fallbackEntry?.stemLabel || '').trim(),
  }).text;
  if (String(detailedText || '').trim()) return String(detailedText || '').trim();
  const fallbackParts = [
    String(fallbackEntry?.cropLabel || '').trim(),
    String(fallbackEntry?.qualityLabel || '').trim(),
    String(fallbackEntry?.stemStatusLabel || fallbackEntry?.stemLabel || '').trim(),
    String(fallbackEntry?.gradeLabel || '').trim(),
    String(fallbackEntry?.weightLabel || fallbackEntry?.detailText || fallbackEntry?.value || '').trim(),
  ].filter(Boolean);
  return fallbackParts.join(' · ').trim();
}

function resolveTransportDockTooltipEntry({
  previewLike = null,
  displaySlotNo = 0,
  liveTooltipEntry = null,
  syntheticAddedBoxMeta = null,
} = {}) {
  const addedFilledSlotNos = Array.isArray(previewLike?.addedFilledSlotNos)
    ? previewLike.addedFilledSlotNos.map((slotNo) => Math.max(1, Math.floor(Number(slotNo) || 0))).filter(Boolean)
    : [];
  const shouldPreferSyntheticTooltip = Boolean(previewLike?.isSyntheticTransportDockTargetPreview)
    && addedFilledSlotNos.includes(Math.max(1, Math.floor(Number(displaySlotNo) || 0)));
  if (shouldPreferSyntheticTooltip) {
    return syntheticAddedBoxMeta?.tooltipEntry || liveTooltipEntry || null;
  }
  return liveTooltipEntry || syntheticAddedBoxMeta?.tooltipEntry || null;
}

export default function WarehouseTransportPanelIndividual({
  selectedTransportRow,
  harvestForkliftRows,
  selectedTransportKey,
  selectedTransportDockInstanceId = '',
  setSelectedTransportKey,
  onClearSelection,
  selectedTransportMode,
  selectedTransportCanMovePallet,
  selectedTransportCanUseDockPallet = false,
  selectedTransportCanUseIndividualMode = true,
  onChooseTransportMode,
  selectedTransportImageSrc,
  selectedTransportCanStackPallet,
  machineDisplayNameWithRentTag,
  machineImageSrcOfParkingState,
  toolImageSrcOf,
  equipmentDurabilityOf,
  laborText,
  game,
  activeFacilityStorageKey,
  carrierLadderCapacityKgByKey,
  palletJackPalletMoveLabor,
  forkliftPalletMoveLabor,
  transportDockPreview,
  transportDockHarvestBoxTooltipsBySlot = {},
  individualFillAnimBySlot = {},
  transportLoadState,
  transportDockMotion,
  harvestBoxesPerPallet,
  palletItemImageSrc,
  pendingHarvestMoveTarget = null,
  pendingHarvestMoveTargetCanReceive = false,
  onClearPendingHarvestMoveTarget = null,
  onConfirmIndividualTransportDockLoad = null,
  onPickIndividualTransportDockHarvestBox = null,
  onLoadEmptyPalletToTransport,
  onPickEmptyPalletFromTransport,
  onUnloadEmptyPalletFromTransport,
}) {
  const lastTransportDockBoxPickRef = React.useRef({ key: '', at: 0 });
  const transportDockPreviewResetKey = [
    String(transportDockPreview?.previewKey || ''),
    Math.max(0, Math.floor(Number(transportDockPreview?.filledBoxCount) || 0)),
    Array.isArray(transportDockPreview?.filledSlots)
      ? transportDockPreview.filledSlots.map((filled) => (filled ? '1' : '0')).join('')
      : '',
  ].join(':');
  React.useEffect(() => {
    lastTransportDockBoxPickRef.current = { key: '', at: 0 };
  }, [transportDockPreviewResetKey]);
  const transportModeOptions = selectedTransportCanMovePallet
    ? [
        ['pallet', '팔레트 적재'],
        ['individual', '개별 적재'],
      ]
    : [
        ['individual', '개별 적재'],
      ];

  const transportDockClassName = selectedTransportRow?.sourceType === 'machine'
    ? 'is-machine-dock'
    : 'is-tool-dock';
  const canInteractWithPendingTransportDockPair = String(selectedTransportMode || 'pallet') === 'individual'
    && Boolean(pendingHarvestMoveTarget)
    && Boolean(pendingHarvestMoveTargetCanReceive)
    && Boolean(transportDockPreview);
  const canClearPendingHarvestMoveTarget = String(selectedTransportMode || 'pallet') === 'individual'
    && Boolean(pendingHarvestMoveTarget)
    && typeof onClearPendingHarvestMoveTarget === 'function';
  const isPendingTransportDockTarget = String(pendingHarvestMoveTarget?.targetType || '') === 'vehicle-slot'
    && String(
      pendingHarvestMoveTarget?.targetVehicleInstanceId
      || pendingHarvestMoveTarget?.vehicleInstanceId
      || ''
    ) === String(selectedTransportDockInstanceId || '')
    && Math.max(
      1,
      Math.floor(
        Number(
          pendingHarvestMoveTarget?.targetVehiclePalletSlotNo
          || pendingHarvestMoveTarget?.vehiclePalletSlotNo
          || 1
        ) || 1
      )
    ) === 1;
  const showPendingTargetGlow = canInteractWithPendingTransportDockPair;
  const transportDockFilledSlotCount = Math.max(
    0,
    Math.floor(Number(transportDockPreview?.filledBoxCount) || 0),
    Array.isArray(transportDockPreview?.filledSlots)
      ? transportDockPreview.filledSlots.filter(Boolean).length
      : 0
  );
  const canTryPickTransportDockBoxesIndividually = String(selectedTransportMode || 'pallet') === 'individual'
    && Boolean(transportDockPreview)
    && transportDockFilledSlotCount > 0
    && typeof onPickIndividualTransportDockHarvestBox === 'function';
  const canPickTransportDockBoxesIndividually = canInteractWithPendingTransportDockPair
    && canTryPickTransportDockBoxesIndividually;
  const selectedToolKey = String(selectedTransportRow?.toolKey || '');
  const useCompactTransportDockGrid = ['manualCarry', 'handCart2Wheel', 'platformCart4Wheel'].includes(selectedToolKey);
  const getTransportDockFillAnimMetaByVisualSlotNo = (previewLike = null) => {
    const slotNo = Math.max(
      1,
      Math.floor(Number(
        previewLike?.sourceVehiclePalletSlotNo
        || transportDockPreview?.sourceVehiclePalletSlotNo
        || 1
      ) || 1)
    );
    const vehicleInstanceId = String(
      previewLike?.sourceVehicleInstanceId
      || selectedTransportDockInstanceId
      || ''
    );
    return buildHarvestBoxFillAnimMetaMap(individualFillAnimBySlot?.[`vehicle:${vehicleInstanceId}:${slotNo}`] || null);
  };

  const renderCompactTransportDockBoxes = (previewLike = null, capacityRaw = 0, { ghost = false } = {}) => {
    const capacity = Math.max(1, Math.floor(Number(capacityRaw) || 1));
    const isManualCarry = selectedToolKey === 'manualCarry' || capacity <= 1;
    const fillAnimMetaByVisualSlotNo = getTransportDockFillAnimMetaByVisualSlotNo(previewLike);

    if (isManualCarry) {
      const fillLabel = String(previewLike?.sourceBoxFillLabel || '').trim();
      const directFillRatio = Math.max(0, Math.min(1, Number(previewLike?.sourceBoxFillRatio) || 0));
      const fillRatio = directFillRatio > 0
        ? directFillRatio
        : fillLabel === '1/3'
          ? (1 / 3)
          : fillLabel === '2/3'
            ? (2 / 3)
            : 1;
      const filledSlotIndex = Array.isArray(previewLike?.filledSlots)
        ? previewLike.filledSlots.findIndex(Boolean)
        : -1;
      const manualStoredBoxMeta = previewLike?.storedBoxMetaBySlotNo && typeof previewLike.storedBoxMetaBySlotNo === 'object'
        ? (previewLike.storedBoxMetaBySlotNo[1] || null)
        : null;
      const manualAddedBoxMeta = previewLike?.addedBoxMetaBySlotNo && typeof previewLike.addedBoxMetaBySlotNo === 'object'
        ? (previewLike.addedBoxMetaBySlotNo[1] || null)
        : null;
      const resolvedTone = filledSlotIndex >= 0 && Array.isArray(previewLike?.boxTones)
        ? String(previewLike.boxTones[filledSlotIndex] || '')
        : String(manualAddedBoxMeta?.tone || manualStoredBoxMeta?.tone || previewLike?.sourceBoxTone || '');
      const tone = resolvedTone.toLowerCase() === 'green' ? 'green' : 'yellow';
      const isFilled = Boolean(previewLike) && Math.max(0, Math.floor(Number(previewLike?.filledBoxCount) || 0)) > 0;
      const manualSourceVisualSlotNo = Math.max(
        1,
        Math.floor(Number(
          manualAddedBoxMeta?.sourceVisualSlotNo
          || manualStoredBoxMeta?.sourceVisualSlotNo
          || previewLike?.sourceVisualSlotNo
          || previewLike?.sourceVehicleVisualSlotNo
          || 1
        ) || 1)
      );
      const manualTooltipSlotNo = Math.max(1, Math.floor(Number(previewLike?.sourceVehiclePalletSlotNo) || 1));
      const manualTooltipLayerKey = String(previewLike?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
      const manualDisplaySlotNo = 1;
      const manualTooltipEntry = transportDockHarvestBoxTooltipsBySlot?.[manualTooltipSlotNo]?.[manualTooltipLayerKey]?.[manualSourceVisualSlotNo - 1] || null;
      const manualResolvedTooltipEntry = resolveTransportDockTooltipEntry({
        previewLike,
        displaySlotNo: manualDisplaySlotNo,
        liveTooltipEntry: manualTooltipEntry || manualStoredBoxMeta?.tooltipEntry || null,
        syntheticAddedBoxMeta: manualAddedBoxMeta || manualStoredBoxMeta,
      });
      const manualGradeLabel = normalizeHarvestGradeLabel(
        manualResolvedTooltipEntry?.gradeLabel || previewLike?.sourceBoxCard?.gradeLabel,
        '미선별'
      ) || '미선별';
      const manualQualityLabel = String(
        manualResolvedTooltipEntry?.qualityLabel || previewLike?.sourceBoxCard?.qualityLabel || '보통'
      ).trim() || '보통';
      const manualStemRemoved = typeof manualResolvedTooltipEntry?.stemRemoved === 'boolean'
        ? manualResolvedTooltipEntry.stemRemoved
        : typeof previewLike?.sourceBoxCard?.stemRemoved === 'boolean'
          ? previewLike.sourceBoxCard.stemRemoved
          : undefined;
      const manualStemStatusKey = String(
        manualResolvedTooltipEntry?.stemStatusKey
          || manualResolvedTooltipEntry?.stemStatus
          || previewLike?.sourceBoxCard?.stemStatusKey
          || previewLike?.sourceBoxCard?.stemStatus
          || ''
      ).trim();
      const manualStemStatusLabel = compactHarvestStemStatusLabelOf({
        stemRemoved: manualStemRemoved,
        stemStatusKey: manualStemStatusKey,
        stemStatusLabel: manualResolvedTooltipEntry?.stemStatusLabel
          || manualResolvedTooltipEntry?.stemLabel
          || previewLike?.sourceBoxCard?.stemStatusLabel,
        stemLabel: manualResolvedTooltipEntry?.stemLabel || previewLike?.sourceBoxCard?.stemLabel,
      });
      const manualGradeStamp = manualGradeLabel && manualGradeLabel !== '미선별'
        ? (
          <div className="warehouse-storage-transport-dock-preview__manual-grade-stamp">
            <div className={`harvest-quality-stamp harvest-quality-stamp--compact harvest-quality-stamp--grade ${qualityStampToneClassOf(manualGradeLabel)}`}>
              <span className="harvest-quality-stamp__ink" aria-hidden="true" />
              <span className="harvest-quality-stamp__frame" aria-hidden="true" />
              <em>{manualGradeLabel}</em>
            </div>
          </div>
        )
        : null;
      const manualQualityStamp = (
        <div className="warehouse-storage-transport-dock-preview__manual-quality-stamp">
          <div className={`harvest-quality-stamp harvest-quality-stamp--compact ${qualityStampToneClassOf(manualQualityLabel)}`}>
            <span className="harvest-quality-stamp__ink" aria-hidden="true" />
            <span className="harvest-quality-stamp__frame" aria-hidden="true" />
            <em className="warehouse-storage-transport-dock-preview__manual-quality-stamp-text">{manualQualityLabel}</em>
          </div>
        </div>
      );
      const manualStemStamp = manualStemStatusLabel
        ? (
          <div className="warehouse-storage-transport-dock-preview__manual-stem-stamp">
            <div
              className={`harvest-stem-stamp ${
                manualStemRemoved === true
                  || String(manualStemStatusKey || '').toLowerCase().includes('removed')
                  ? 'is-removed'
                  : 'is-attached'
              }`}
            >
              <span className="harvest-stem-stamp__ring" aria-hidden="true" />
              <strong>{manualStemStatusLabel}</strong>
            </div>
          </div>
        )
        : null;
      const manualOverlay = (
        <>
          {manualGradeStamp}
          {manualStemStamp}
          {manualQualityStamp}
        </>
      );
      const canClickManualCarryBox = !ghost
        && isFilled
        && canPickTransportDockBoxesIndividually
        && previewLike
        && typeof onPickIndividualTransportDockHarvestBox === 'function';
      const requestPickManualCarryBox = (event, inputType = 'click') => {
        if (!canClickManualCarryBox) return;
        event.preventDefault();
        event.stopPropagation();
        const pickKey = [
          String(previewLike?.sourceVehicleInstanceId || selectedTransportDockInstanceId || ''),
          Math.max(1, Math.floor(Number(previewLike?.sourceVehiclePalletSlotNo) || 1)),
          String(previewLike?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom',
          manualSourceVisualSlotNo,
          'manual-carry',
        ].join(':');
        const now = Date.now();
        const previousPick = lastTransportDockBoxPickRef.current || { key: '', at: 0 };
        if (previousPick.key === pickKey && now - Math.max(0, Number(previousPick.at) || 0) < 160) {
          return;
        }
        lastTransportDockBoxPickRef.current = { key: pickKey, at: now };
        onPickIndividualTransportDockHarvestBox({
          sourceDomId: `transport-dock-box:${String(selectedTransportKey || '')}:${manualSourceVisualSlotNo - 1}`,
          sourceType: 'vehicle-slot',
          sourceVehicleInstanceId: String(previewLike?.sourceVehicleInstanceId || selectedTransportDockInstanceId || ''),
          sourceVehiclePalletSlotNo: Math.max(1, Math.floor(Number(previewLike?.sourceVehiclePalletSlotNo) || 1)),
          sourceLayerKey: String(previewLike?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom',
          sourceVisualSlotNo: manualSourceVisualSlotNo,
          sourceDisplaySlotNo: manualDisplaySlotNo,
          sourceBatchId: String(
            manualResolvedTooltipEntry?.sourceBatchId
            || manualAddedBoxMeta?.sourceBatchId
            || manualStoredBoxMeta?.sourceBatchId
            || previewLike?.sourceBatchId
            || ''
          ),
          sourceBoxUnitNo: Math.max(0, Math.floor(Number(
            manualResolvedTooltipEntry?.sourceBoxUnitNo
            || manualAddedBoxMeta?.sourceBoxUnitNo
            || manualStoredBoxMeta?.sourceBoxUnitNo
            || previewLike?.sourceBoxUnitNo
          ) || 0)),
          sourceInputEventType: inputType,
        });
      };

      return (
        <div
          className={`warehouse-storage-transport-dock-preview__compact-grid is-manual-carry ${isFilled ? '' : 'is-empty-preview'}`.trim()}
          style={{
            width: '100%',
            height: '100%',
            minHeight: 0,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {isFilled ? (
            canClickManualCarryBox ? (
              <button
                type="button"
                className="warehouse-storage-transport-dock-preview__manual-carry-pick"
                tabIndex={-1}
                data-harvest-move-source-id={`transport-dock-box:${String(selectedTransportKey || '')}:${manualSourceVisualSlotNo - 1}`}
                title={resolveTransportDockTooltipText(
                  manualResolvedTooltipEntry,
                  manualAddedBoxMeta?.tooltipEntry,
                  manualStoredBoxMeta?.tooltipEntry,
                  previewLike?.sourceBoxCard
                )}
                aria-label={resolveTransportDockTooltipText(
                  manualResolvedTooltipEntry,
                  manualAddedBoxMeta?.tooltipEntry,
                  manualStoredBoxMeta?.tooltipEntry,
                  previewLike?.sourceBoxCard
                )}
                onClick={(event) => requestPickManualCarryBox(event, 'click')}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 0,
                  display: 'grid',
                  placeItems: 'stretch',
                  padding: 0,
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <AppleCratePreview tone={tone} fillRatio={fillRatio} fillLabel={fillLabel} overlay={manualOverlay} />
              </button>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 0,
                  display: 'grid',
                  placeItems: 'stretch',
                }}
              >
                <AppleCratePreview tone={tone} fillRatio={fillRatio} fillLabel={fillLabel} overlay={manualOverlay} />
              </div>
            )
          ) : (
            <span
              className="warehouse-harvest-slot-box"
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                minHeight: 0,
                borderRadius: '18px',
              }}
            />
          )}
        </div>
      );
    }

    const columnCount = isManualCarry
      ? 1
      : selectedToolKey === 'handCart2Wheel'
        ? 1
        : selectedToolKey === 'platformCart4Wheel'
          ? 2
          : Math.min(4, capacity);
    const rowCount = isManualCarry ? 1 : Math.max(1, Math.ceil(capacity / columnCount));
    const sourceSlotIndexForDisplayCell = (displayCellIndex) => {
      if (isManualCarry) return displayCellIndex;
      const rowIndex = Math.floor(displayCellIndex / columnCount);
      const columnIndex = displayCellIndex % columnCount;
      const sourceRowIndex = Math.max(0, rowCount - 1 - rowIndex);
      return Math.min(capacity - 1, (sourceRowIndex * columnCount) + columnIndex);
    };

    return (
      <div
        className={`warehouse-harvest-slot-box-grid warehouse-storage-transport-dock-preview__compact-grid ${previewLike ? '' : 'is-empty-preview'}`.trim()}
        style={{
          '--compact-grid-columns': columnCount,
          '--compact-grid-rows': rowCount,
          '--compact-grid-gap': isManualCarry ? '0px' : '6px',
          '--compact-grid-cell-size': isManualCarry ? '100%' : '28px',
          display: 'grid',
          gridTemplateColumns: isManualCarry
            ? `repeat(${columnCount}, minmax(0, 1fr))`
            : `repeat(${columnCount}, var(--compact-grid-cell-size))`,
          gridTemplateRows: isManualCarry
            ? `repeat(${rowCount}, minmax(0, 1fr))`
            : `repeat(${rowCount}, var(--compact-grid-cell-size))`,
          gap: 'var(--compact-grid-gap)',
          minHeight: 0,
          alignContent: 'stretch',
          justifySelf: 'center',
          alignSelf: 'start',
        }}
      >
        {Array.from({ length: capacity }, (_, boxIndex) => {
          const sourceSlotIndex = sourceSlotIndexForDisplayCell(boxIndex);
          const previewSlotNo = sourceSlotIndex + 1;
          const storedBoxMeta = previewLike?.storedBoxMetaBySlotNo && typeof previewLike.storedBoxMetaBySlotNo === 'object'
            ? (previewLike.storedBoxMetaBySlotNo[previewSlotNo] || null)
            : null;
          const syntheticAddedBoxMeta = previewLike?.addedBoxMetaBySlotNo && typeof previewLike.addedBoxMetaBySlotNo === 'object'
            ? (previewLike.addedBoxMetaBySlotNo[previewSlotNo] || null)
            : null;
          const boxMeta = previewLike
            ? (() => {
                const displayBoxIndex = sourceSlotIndex;
                const tooltipSlotNo = Math.max(1, Math.floor(Number(previewLike?.sourceVehiclePalletSlotNo) || 1));
                const tooltipLayerKey = String(previewLike?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
                const liveTooltipEntry = transportDockHarvestBoxTooltipsBySlot?.[tooltipSlotNo]?.[tooltipLayerKey]?.[displayBoxIndex] || null;
                const filled = Array.isArray(previewLike?.filledSlots)
                  ? Boolean(previewLike.filledSlots[displayBoxIndex])
                  : displayBoxIndex < Math.max(0, Math.floor(Number(previewLike?.filledBoxCount) || 0));
                return {
                  displayBoxIndex,
                  tooltipEntry: resolveTransportDockTooltipEntry({
                    previewLike,
                    displaySlotNo: previewSlotNo,
                    liveTooltipEntry: liveTooltipEntry || storedBoxMeta?.tooltipEntry || null,
                    syntheticAddedBoxMeta: syntheticAddedBoxMeta || storedBoxMeta,
                  }),
                  filled,
                  tone: syntheticAddedBoxMeta?.tone || storedBoxMeta?.tone,
                  loadBoxKey: syntheticAddedBoxMeta?.loadBoxKey || storedBoxMeta?.loadBoxKey,
                };
              })()
            : { displayBoxIndex: boxIndex, tooltipEntry: null, filled: false };
          const sourceVisualSlotNo = Math.max(1, Math.floor(Number(
            syntheticAddedBoxMeta?.sourceVisualSlotNo
            || storedBoxMeta?.sourceVisualSlotNo
            || boxMeta?.tooltipEntry?.sourceVisualSlotNo
            || boxMeta?.tooltipEntry?.visualSlotNo
            || boxMeta.displayBoxIndex + 1
          ) || 1));
          const canClickThisBox = !ghost && canPickTransportDockBoxesIndividually && boxMeta.filled;
          const requestPickBox = (event, inputType = 'click') => {
            if (!canClickThisBox || !previewLike) return;
            event.preventDefault();
            event.stopPropagation();
            const pickKey = [
              String(previewLike?.sourceVehicleInstanceId || selectedTransportDockInstanceId || ''),
              Math.max(1, Math.floor(Number(previewLike?.sourceVehiclePalletSlotNo) || 1)),
              String(previewLike?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom',
              sourceVisualSlotNo,
              boxIndex + 1,
            ].join(':');
            const now = Date.now();
            const previousPick = lastTransportDockBoxPickRef.current || { key: '', at: 0 };
            if (previousPick.key === pickKey && now - Math.max(0, Number(previousPick.at) || 0) < 160) {
              return;
            }
            lastTransportDockBoxPickRef.current = { key: pickKey, at: now };
            onPickIndividualTransportDockHarvestBox({
              sourceDomId: `transport-dock-box:${String(selectedTransportKey || '')}:${sourceVisualSlotNo - 1}`,
              sourceType: 'vehicle-slot',
              sourceVehicleInstanceId: String(previewLike?.sourceVehicleInstanceId || selectedTransportDockInstanceId || ''),
              sourceVehiclePalletSlotNo: Math.max(1, Math.floor(Number(previewLike?.sourceVehiclePalletSlotNo) || 1)),
              sourceLayerKey: String(previewLike?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom',
              sourceVisualSlotNo,
              sourceDisplaySlotNo: boxMeta.displayBoxIndex + 1,
              sourceBatchId: String(boxMeta?.tooltipEntry?.sourceBatchId || syntheticAddedBoxMeta?.sourceBatchId || storedBoxMeta?.sourceBatchId || ''),
              sourceBoxUnitNo: Math.max(0, Math.floor(Number(
                boxMeta?.tooltipEntry?.sourceBoxUnitNo
                || syntheticAddedBoxMeta?.sourceBoxUnitNo
                || storedBoxMeta?.sourceBoxUnitNo
              ) || 0)),
              sourceInputEventType: inputType,
            });
          };
          const sharedProps = {
            key: `compact-transport-dock-box-${boxIndex + 1}`,
            className: `warehouse-harvest-slot-box ${boxMeta.filled ? 'is-filled' : ''} ${resolveTransportDockBoxTone(boxMeta, previewLike, boxMeta.displayBoxIndex) === 'green' ? 'is-green' : 'is-yellow'} ${canClickThisBox ? 'is-box-pickable' : ''} ${boxMeta.filled && fillAnimMetaByVisualSlotNo.get(previewSlotNo) ? 'is-individual-fill-drop' : ''}`.trim(),
            'aria-label': boxMeta.filled ? resolveTransportDockTooltipText(boxMeta?.tooltipEntry, syntheticAddedBoxMeta?.tooltipEntry, storedBoxMeta?.tooltipEntry, previewLike?.sourceBoxCard) : '',
            title: boxMeta.filled ? resolveTransportDockTooltipText(boxMeta?.tooltipEntry, syntheticAddedBoxMeta?.tooltipEntry, storedBoxMeta?.tooltipEntry, previewLike?.sourceBoxCard) : '',
            'data-harvest-move-source-id': canClickThisBox
              ? `transport-dock-box:${String(selectedTransportKey || '')}:${sourceVisualSlotNo - 1}`
              : undefined,
            style: {
              ...(isManualCarry
                ? {
                    width: '100%',
                    height: '100%',
                    minHeight: 0,
                    borderRadius: '18px',
                  }
                : {
                    width: '100%',
                    minWidth: 0,
                    minHeight: 0,
                    aspectRatio: '1 / 1',
                    placeSelf: 'center',
                  }),
              ...(boxMeta.filled && fillAnimMetaByVisualSlotNo.get(previewSlotNo)
                ? {
                    '--harvest-fill-drop-delay-ms': `${Math.max(0, Number(fillAnimMetaByVisualSlotNo.get(previewSlotNo)?.order) || 0) * 64}ms`,
                  }
                : {}),
            },
          };
          if (canClickThisBox) {
            return (
              <button
                {...sharedProps}
                type="button"
                tabIndex={-1}
                onClick={(event) => requestPickBox(event, 'click')}
              />
            );
          }
          return <span {...sharedProps} />;
        })}
      </div>
    );
  };

  const renderTransportDockCardBody = (previewLike, { ghost = false, suppressActions = false } = {}) => {
    const previewFilledBoxCount = Math.max(
      0,
      Math.floor(Number(previewLike?.filledBoxCount) || 0),
      Array.isArray(previewLike?.filledSlots)
        ? previewLike.filledSlots.filter(Boolean).length
        : 0
    );
    const fillAnimMetaByVisualSlotNo = getTransportDockFillAnimMetaByVisualSlotNo(previewLike);

    if (previewLike) {
      if (previewLike.isEmptyPallet) {
        const canUnloadEmptyPallet = !previewLike.isBuiltInEmptyPallet
          && typeof onUnloadEmptyPalletFromTransport === 'function';
        return (
          <>
            <strong>빈 팔레트</strong>
            <span className="warehouse-harvest-slot-card__status">비어 있음</span>
            {!ghost && canUnloadEmptyPallet ? (
              <button
                type="button"
                className="button button--compact button--ghost warehouse-storage-transport-dock-preview__action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onUnloadEmptyPalletFromTransport();
                }}
                title="현재 운반기구 적재칸의 빈 팔레트를 비우고 원래 상태로 되돌립니다."
              >
                비우기
              </button>
            ) : null}
          </>
        );
      }

      if (useCompactTransportDockGrid && previewFilledBoxCount <= 0) {
        previewLike = null;
      }

      if (useCompactTransportDockGrid) {
        const compactCapacity = Math.max(
          1,
          Math.floor(Number(previewLike?.maxBoxes || transportLoadState?.capacityBoxes) || 1)
        );
        return renderCompactTransportDockBoxes(previewLike, compactCapacity, { ghost });
      }

      return (
        <WarehouseHarvestSingleLayerCard
          layerLabel="1단"
          showLayerBadge={false}
          loadLabel={previewLike.loadLabel}
          boxEntries={Array.from({ length: Math.max(1, Math.floor(Number(previewLike?.maxBoxes) || harvestBoxesPerPallet)) }, (_, boxIndex) => {
            const displayBoxCapacity = Math.max(1, Math.floor(Number(previewLike?.maxBoxes) || harvestBoxesPerPallet));
            const displayBoxIndex = harvestPalletDisplayBoxIndexOf(boxIndex, Math.min(6, displayBoxCapacity), displayBoxCapacity);
            const previewSlotIndex = displayBoxIndex;
            const previewSlotNo = displayBoxIndex + 1;
            const tooltipSlotNo = Math.max(1, Math.floor(Number(previewLike?.sourceVehiclePalletSlotNo) || 1));
            const tooltipLayerKey = String(previewLike?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
            const liveTooltipEntry = transportDockHarvestBoxTooltipsBySlot?.[tooltipSlotNo]?.[tooltipLayerKey]?.[displayBoxIndex] || null;
            const syntheticAddedBoxMeta = previewLike?.addedBoxMetaBySlotNo && typeof previewLike.addedBoxMetaBySlotNo === 'object'
              ? (previewLike.addedBoxMetaBySlotNo[previewSlotNo] || null)
              : null;
            const isFilledBox = Array.isArray(previewLike?.filledSlots)
              ? Boolean(previewLike.filledSlots[previewSlotIndex])
              : liveTooltipEntry
                ? Boolean(liveTooltipEntry.filled)
                : displayBoxIndex < previewLike.filledBoxCount;
            const boxMeta = resolveTransportDockTooltipEntry({
              previewLike,
              displaySlotNo: previewSlotNo,
              liveTooltipEntry,
              syntheticAddedBoxMeta,
            });
            const boxTooltip = isFilledBox
              ? (
                boxMeta || syntheticAddedBoxMeta?.tooltipEntry || (syntheticAddedBoxMeta
                  ? {
                      sourceBatchId: String(syntheticAddedBoxMeta?.sourceBatchId || ''),
                      sourceBoxUnitNo: Math.max(0, Math.floor(Number(syntheticAddedBoxMeta?.sourceBoxUnitNo) || 0)),
                      sourceVisualSlotNo: Math.max(0, Math.floor(Number(syntheticAddedBoxMeta?.sourceVisualSlotNo) || 0)),
                      tone: syntheticAddedBoxMeta?.tone,
                      loadBoxKey: syntheticAddedBoxMeta?.loadBoxKey,
                    }
                  : null)
              )
              : null;
            const toneMeta = boxMeta || syntheticAddedBoxMeta || null;
            const sourceVisualSlotNo = Math.max(1, Math.floor(Number(
              syntheticAddedBoxMeta?.sourceVisualSlotNo
              || boxMeta?.visualSlotNo
              || displayBoxIndex + 1
            ) || 1));
            const canClickThisBox = !ghost && canPickTransportDockBoxesIndividually && isFilledBox;
            const requestPickBox = (event, inputType = 'click') => {
              if (!canClickThisBox) return;
              event.preventDefault();
              event.stopPropagation();
              const pickKey = [
                String(previewLike?.sourceVehicleInstanceId || selectedTransportDockInstanceId || ''),
                Math.max(1, Math.floor(Number(previewLike?.sourceVehiclePalletSlotNo) || 1)),
                String(previewLike?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom',
                sourceVisualSlotNo,
                boxIndex + 1,
              ].join(':');
              const now = Date.now();
              const previousPick = lastTransportDockBoxPickRef.current || { key: '', at: 0 };
              if (previousPick.key === pickKey && now - Math.max(0, Number(previousPick.at) || 0) < 160) {
                return;
              }
              lastTransportDockBoxPickRef.current = { key: pickKey, at: now };
              onPickIndividualTransportDockHarvestBox({
                sourceDomId: `transport-dock-box:${String(selectedTransportKey || '')}:${sourceVisualSlotNo - 1}`,
                sourceType: 'vehicle-slot',
                sourceVehicleInstanceId: String(previewLike?.sourceVehicleInstanceId || selectedTransportDockInstanceId || ''),
                sourceVehiclePalletSlotNo: Math.max(1, Math.floor(Number(previewLike?.sourceVehiclePalletSlotNo) || 1)),
                sourceLayerKey: String(previewLike?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom',
                sourceVisualSlotNo,
                sourceDisplaySlotNo: displayBoxIndex + 1,
                sourceBatchId: String(boxTooltip?.sourceBatchId || syntheticAddedBoxMeta?.sourceBatchId || ''),
                sourceBoxUnitNo: Math.max(0, Math.floor(Number(
                  boxTooltip?.sourceBoxUnitNo
                  || syntheticAddedBoxMeta?.sourceBoxUnitNo
                ) || 0)),
                sourceInputEventType: inputType,
              });
            };
            const handlePickBoxClick = canClickThisBox
              ? (event) => {
                  requestPickBox(event, 'click');
                }
              : undefined;
            return {
              key: `transport-dock-preview-box-${boxIndex + 1}`,
              filled: isFilledBox,
              tone: resolveTransportDockBoxTone(toneMeta, previewLike, previewSlotIndex),
              fillAnimMeta: isFilledBox
                ? (
                    fillAnimMetaByVisualSlotNo.get(previewSlotNo) || null
                  )
                : null,
              pickable: canClickThisBox,
              tooltip: isFilledBox ? boxTooltip : null,
              dataSourceId: canClickThisBox
                ? `transport-dock-box:${String(selectedTransportKey || '')}:${sourceVisualSlotNo - 1}`
                : undefined,
              onClick: handlePickBoxClick,
            };
          })}
        />
      );
    }

    const emptyBoxCapacity = Math.max(
      1,
      Math.floor(Number(transportLoadState?.capacityBoxes) || harvestBoxesPerPallet)
    );

    if (useCompactTransportDockGrid) {
      return (
        <>
          {renderCompactTransportDockBoxes(null, emptyBoxCapacity, { ghost })}
          {!suppressActions && selectedTransportCanMovePallet && typeof onLoadEmptyPalletToTransport === 'function' ? (
            <button
              type="button"
              className="button button--compact button--primary facility-workbench-install-button warehouse-storage-transport-dock-preview__action-button warehouse-storage-transport-dock-preview__load-button"
              onClick={onLoadEmptyPalletToTransport}
              title="현재 운반기구 적재칸에 빈 팔레트를 적재합니다."
            >
              팔레트 적재
            </button>
          ) : null}
        </>
      );
    }

    return (
      <>
        <strong>적재칸 1</strong>
        <span className="warehouse-harvest-slot-card__status">비어 있음</span>
        <WarehouseHarvestSingleLayerCard
          layerLabel="1단"
          showLayerBadge={false}
          boxEntries={Array.from({ length: emptyBoxCapacity }, (_, boxIndex) => ({
            key: `transport-dock-empty-box-${boxIndex + 1}`,
            filled: false,
            tone: 'yellow',
          }))}
        />
        {!suppressActions && selectedTransportCanMovePallet && typeof onLoadEmptyPalletToTransport === 'function' ? (
          <button
            type="button"
            className="button button--compact button--primary facility-workbench-install-button warehouse-storage-transport-dock-preview__action-button warehouse-storage-transport-dock-preview__load-button"
            onClick={onLoadEmptyPalletToTransport}
            title="현재 운반기구 적재칸에 빈 팔레트를 적재합니다."
          >
            팔레트 적재
          </button>
        ) : null}
      </>
    );
  };

  const renderTransportLoadSlot = () => {
    if (!transportLoadState) return null;
    const visibleTransportDockPreview = transportDockPreview || null;
    const visibleTransportDockFilledBoxCount = Math.max(
      0,
      Math.floor(Number(visibleTransportDockPreview?.filledBoxCount) || 0),
      Array.isArray(visibleTransportDockPreview?.filledSlots)
        ? visibleTransportDockPreview.filledSlots.filter(Boolean).length
        : 0
    );
    const visibleTransportDockHasBoxes = Boolean(visibleTransportDockPreview)
      && !visibleTransportDockPreview?.isEmptyPallet
      && visibleTransportDockFilledBoxCount > 0;
    const showDockAsOccupied = Boolean(visibleTransportDockPreview?.isEmptyPallet) || visibleTransportDockHasBoxes;
    const showCompactEmptyDock = useCompactTransportDockGrid
      && !Boolean(visibleTransportDockPreview?.isEmptyPallet)
      && !visibleTransportDockHasBoxes;

    return (
      <div className="warehouse-storage-transport-selected__slot-block">
        <div
          className={`warehouse-storage-transport-dock-preview ${transportDockClassName} ${showDockAsOccupied ? 'is-occupied' : 'is-empty'} ${visibleTransportDockPreview?.isEmptyPallet && !visibleTransportDockPreview?.isBuiltInEmptyPallet && typeof onUnloadEmptyPalletFromTransport === 'function' ? 'has-empty-pallet-action' : ''} ${canPickTransportDockBoxesIndividually ? 'can-pick-boxes' : ''} ${showPendingTargetGlow ? 'is-pending-target' : ''}`.trim()}
        >
          <div
            data-transport-dock-id={visibleTransportDockPreview?.previewKey || undefined}
            className={`warehouse-harvest-slot-card warehouse-harvest-slot-card--transport-dock-preview ${useCompactTransportDockGrid ? 'warehouse-harvest-slot-card--compact-dock-grid' : ''} ${showDockAsOccupied ? 'warehouse-harvest-slot-card--occupied' : 'warehouse-harvest-slot-card--empty'} ${(visibleTransportDockPreview?.isEmptyPallet || visibleTransportDockHasBoxes) ? 'warehouse-harvest-slot-card--with-pallet-bg' : ''} ${visibleTransportDockHasBoxes ? 'warehouse-harvest-slot-card--with-boxes warehouse-harvest-slot-card--single-layer' : ''} ${showCompactEmptyDock ? 'warehouse-harvest-slot-card--compact-empty-dock' : ''} ${showPendingTargetGlow ? 'warehouse-harvest-slot-card--selected warehouse-harvest-slot-card--transport-dock-pending-target' : ''}`.trim()}
            onClick={visibleTransportDockPreview?.isEmptyPallet && !visibleTransportDockPreview?.isBuiltInEmptyPallet && typeof onUnloadEmptyPalletFromTransport === 'function'
              ? (event) => {
                  if (event.target?.closest?.('button')) return;
                  event.stopPropagation();
                  onUnloadEmptyPalletFromTransport();
                }
              : undefined}
            style={visibleTransportDockPreview && palletItemImageSrc
              ? { '--warehouse-pallet-bg': `url("${palletItemImageSrc}")` }
              : undefined}
          >
            {renderTransportDockCardBody(visibleTransportDockPreview || null)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`warehouse-storage-transport-panel ${selectedTransportRow ? 'is-selected' : ''}`.trim()}>
      <div className="warehouse-storage-transport-panel__header">
        <strong>운반기구</strong>
        <span>{`${harvestForkliftRows.length.toLocaleString()}개`}</span>
      </div>
      {selectedTransportRow ? (
        <div className="warehouse-storage-transport-selected">
          {typeof onChooseTransportMode === 'function' ? (
            <div className="warehouse-storage-transport-selected__action-row">
              <div
                className="transport-mode-switch warehouse-storage-transport-selected__mode-switch"
                role="group"
                aria-label="수확물 이동 방식 선택"
                style={{ gridTemplateColumns: `repeat(${transportModeOptions.length}, minmax(0, 1fr))` }}
              >
                {transportModeOptions.map(([modeKey, modeLabel]) => {
                  const active = String(selectedTransportMode || 'pallet') === modeKey;
                  const disabled = modeKey === 'individual' && !selectedTransportCanUseIndividualMode;
                  return (
                    <button
                      key={`transport-mode-${modeKey}`}
                      type="button"
                      className={`transport-mode-switch__option ${active ? 'is-active' : ''}`.trim()}
                      onClick={() => onChooseTransportMode(modeKey)}
                      disabled={disabled}
                      title={
                        disabled
                          ? '개별 적재는 운반기구 적재칸에 팔레트를 먼저 실은 뒤에만 선택할 수 있습니다.'
                          : modeKey === 'pallet'
                            ? '팔레트를 그대로 목적지로 적재합니다.'
                            : '목적지까지 상자를 개별 적재합니다.'
                      }
                    >
                      {modeLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="warehouse-storage-transport-selected__card">
            <div className="warehouse-storage-transport-selected__head">
              <strong>
                {selectedTransportRow.sourceType === 'machine'
                  ? machineDisplayNameWithRentTag(selectedTransportRow.machine)
                  : String(selectedTransportRow?.toolName || selectedTransportRow?.toolMeta?.name || '운반기구')}
              </strong>
              <div className="warehouse-storage-transport-selected__actions">
                {canClearPendingHarvestMoveTarget ? (
                  <button
                    type="button"
                    className="button button--ghost button--compact day-transition-animate-button"
                    title="현재 설정된 결합 개별 적재 대상을 해제합니다."
                    onClick={() => onClearPendingHarvestMoveTarget()}
                  >
                    결합해제
                  </button>
                ) : null}
                <button
                  type="button"
                  className="button button--ghost button--compact day-transition-animate-button"
                  onClick={() => {
                    if (typeof onClearSelection === 'function') {
                      onClearSelection();
                      return;
                    }
                    setSelectedTransportKey('');
                  }}
                >
                  선택 취소
                </button>
              </div>
            </div>
            {renderTransportLoadSlot()}
            {selectedTransportImageSrc ? (
              <div className="warehouse-storage-transport-selected__image">
                <img
                  src={selectedTransportImageSrc}
                  alt={selectedTransportRow.sourceType === 'machine'
                    ? machineDisplayNameWithRentTag(selectedTransportRow.machine)
                    : String(selectedTransportRow?.toolName || selectedTransportRow?.toolMeta?.name || '운반기구')}
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : harvestForkliftRows.length ? (
        <div className="map-transfer-vehicle-list warehouse-storage-harvest-forklift-list">
          {harvestForkliftRows.map((row) => {
            const machine = row.machine;
            const isMachineRow = row.sourceType === 'machine';
            const isSelectedTransport = String(row?.key || '') === String(selectedTransportKey || '');
            const hasLoadedHarvestOnDock = Boolean(row?.hasLoadedHarvestOnDock);
            const isCartToolRow = ['handCart2Wheel', 'platformCart4Wheel'].includes(String(row?.toolKey || ''));
            const imageSrc = isMachineRow
              ? machineImageSrcOfParkingState(machine, game)
              : toolImageSrcOf(String(row?.toolKey || ''));
            const title = isMachineRow
              ? machineDisplayNameWithRentTag(machine)
              : String(row?.toolName || row?.toolMeta?.name || '운반기구');
            const metaText = row.sourceType === 'manual'
              ? '개별 적재 전용'
              : isMachineRow
                ? [
                    `내구도 ${equipmentDurabilityOf(game, machine?.machineKey).toFixed(1)}%`,
                    hasLoadedHarvestOnDock ? '적재중' : '',
                    '팔레트 이동 가능',
                  ].filter(Boolean).join(' · ')
                : (
                    isCartToolRow
                      ? [
                          hasLoadedHarvestOnDock ? '적재중' : '',
                          '개별 적재 전용',
                        ].filter(Boolean).join(' · ')
                      : String(row?.toolKey || '').startsWith('carrierLadder')
                        ? [
                            Number(row?.ladderUnitCount || 0) >= 2 ? '상하차용 사다리세트' : '상하차용 사다리',
                            Number(carrierLadderCapacityKgByKey?.[String(row?.toolKey || '')]) > 0
                              ? `적재한도 ${Number(carrierLadderCapacityKgByKey?.[String(row?.toolKey || '')]).toLocaleString()}kg`
                              : '',
                          ].filter(Boolean).join(' · ')
                        : [
                            '창고 내 바닥 이동 전용',
                            '팔레트 이동 가능',
                          ].filter(Boolean).join(' · ')
                  );
            return (
              <button
                key={`harvest-forklift-${String(row?.key || machine?.id || row.slotNo)}`}
                type="button"
                className={`map-transfer-vehicle-card warehouse-storage-harvest-forklift-card ${isSelectedTransport ? 'is-active' : ''}`.trim()}
                onClick={() => setSelectedTransportKey(String(row?.key || ''))}
              >
                <div className="warehouse-storage-harvest-forklift-card__content">
                  {imageSrc ? (
                    <div className="warehouse-storage-harvest-forklift-card__thumb">
                      <img src={imageSrc} alt={title} loading="lazy" />
                    </div>
                  ) : null}
                  <div className="warehouse-storage-harvest-forklift-card__text">
                    <div className="map-transfer-vehicle-card__head">
                      <strong>{title}</strong>
                      <div className="map-transfer-vehicle-card__head-side">
                        {hasLoadedHarvestOnDock ? (
                          <span className="map-transfer-vehicle-card__load-badge">적재중</span>
                        ) : null}
                        <span>{row.slotLabel || `P${row.slotNo}`}</span>
                      </div>
                    </div>
                    <div className="map-transfer-vehicle-card__meta">{metaText}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="empty-box warehouse-storage-transport-panel__empty">
          {activeFacilityStorageKey
            ? '현재 사용할 수 있는 지게차, 카트류, 상하차용 사다리가 없습니다.'
            : '현재 사용할 수 있는 지게차와 상하차용 사다리가 없습니다.'}
        </div>
      )}
    </div>
  );
}
