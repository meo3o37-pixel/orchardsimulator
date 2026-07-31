import React from 'react';
import { harvestPalletDisplayBoxIndexOf } from '../harvest/harvestPalletGrid';
import WarehouseHarvestSingleLayerCard from './WarehouseHarvestSingleLayerCard';

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
  const metaTone = String(boxMeta?.tone || '').toLowerCase();
  if (metaTone === 'green' || metaTone === 'yellow') return metaTone;
  const previewTone = String(previewLike?.boxTones?.[previewSlotIndex] || '').toLowerCase();
  if (previewTone === 'green' || previewTone === 'yellow') return previewTone;
  return 'yellow';
}

function resolveTransportDockPreviewBoxMeta({
  slotBoxMeta = null,
  previewLike = null,
  previewSlotIndex = 0,
  displaySlotNo = 0,
} = {}) {
  const slotNo = Math.max(1, Math.floor(Number(displaySlotNo || (Number(previewSlotIndex) || 0) + 1) || 1));
  const addedFilledSlotNos = Array.isArray(previewLike?.addedFilledSlotNos)
    ? previewLike.addedFilledSlotNos.map((value) => Math.max(1, Math.floor(Number(value) || 0))).filter(Boolean)
    : [];
  const syntheticAddedMeta = previewLike?.addedBoxMetaBySlotNo?.[slotNo] || null;
  const storedMeta = previewLike?.storedBoxMetaBySlotNo?.[slotNo] || null;
  const shouldPreferSynthetic = Boolean(previewLike?.isSyntheticTransportDockTargetPreview)
    && addedFilledSlotNos.includes(slotNo);
  const previewMeta = shouldPreferSynthetic
    ? (syntheticAddedMeta || storedMeta || slotBoxMeta || null)
    : (storedMeta || syntheticAddedMeta || slotBoxMeta || null);
  if (previewMeta?.tooltipEntry && typeof previewMeta.tooltipEntry === 'object') {
    return {
      ...previewMeta.tooltipEntry,
      tone: previewMeta?.tone === 'green' ? 'green' : 'yellow',
      sourceBatchId: String(previewMeta?.sourceBatchId || previewMeta.tooltipEntry?.sourceBatchId || ''),
      sourceBoxUnitNo: Math.max(0, Math.floor(Number(previewMeta?.sourceBoxUnitNo || previewMeta.tooltipEntry?.sourceBoxUnitNo) || 0)),
      sourceVisualSlotNo: Math.max(0, Math.floor(Number(previewMeta?.sourceVisualSlotNo || previewMeta.tooltipEntry?.sourceVisualSlotNo) || 0)),
    };
  }
  return previewMeta || slotBoxMeta || null;
}

export default function WarehouseTransportPanelForklift({
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
  const transportModeOptions = [
    ['pallet', '팔레트 적재'],
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
  const isIndividualTransportMode = String(selectedTransportMode || 'pallet') === 'individual';
  const hasOccupiedTransportDock = Boolean(transportDockPreview);
  const transportDockAnimationTimerRef = React.useRef(null);
  const transportDockInitializedRef = React.useRef(false);
  const previousOccupiedTransportDockRef = React.useRef(hasOccupiedTransportDock);
  const previousTransportDockHadPalletRef = React.useRef(Boolean(palletItemImageSrc) && hasOccupiedTransportDock);
  const latestTransportDockSnapshotRef = React.useRef(null);
  const [transportDockAnimationState, setTransportDockAnimationState] = React.useState('');
  const [undockingTransportDockSnapshot, setUndockingTransportDockSnapshot] = React.useState(null);
  React.useEffect(() => {
    if (!hasOccupiedTransportDock) return;
    latestTransportDockSnapshotRef.current = {
      previewLike: transportDockPreview,
      hasPalletBg: Boolean(palletItemImageSrc),
    };
  }, [hasOccupiedTransportDock, palletItemImageSrc, transportDockPreview]);
  React.useEffect(() => {
    if (!transportDockInitializedRef.current) {
      transportDockInitializedRef.current = true;
      previousOccupiedTransportDockRef.current = hasOccupiedTransportDock;
      previousTransportDockHadPalletRef.current = Boolean(palletItemImageSrc) && hasOccupiedTransportDock;
      return undefined;
    }
    if (transportDockAnimationTimerRef.current) {
      window.clearTimeout(transportDockAnimationTimerRef.current);
      transportDockAnimationTimerRef.current = null;
    }
    if (isIndividualTransportMode) {
      setTransportDockAnimationState('');
      setUndockingTransportDockSnapshot(null);
      previousOccupiedTransportDockRef.current = hasOccupiedTransportDock;
      previousTransportDockHadPalletRef.current = Boolean(palletItemImageSrc) && hasOccupiedTransportDock;
      return undefined;
    }
    const hadOccupiedTransportDock = previousOccupiedTransportDockRef.current;
    if (!hadOccupiedTransportDock && hasOccupiedTransportDock) {
      setUndockingTransportDockSnapshot(null);
      setTransportDockAnimationState('is-slot-shell-docking');
      transportDockAnimationTimerRef.current = window.setTimeout(() => {
        setTransportDockAnimationState('');
        transportDockAnimationTimerRef.current = null;
      }, 800);
    } else if (hadOccupiedTransportDock && !hasOccupiedTransportDock) {
      setUndockingTransportDockSnapshot(latestTransportDockSnapshotRef.current);
      setTransportDockAnimationState('is-slot-shell-undocking');
      transportDockAnimationTimerRef.current = window.setTimeout(() => {
        setTransportDockAnimationState('');
        setUndockingTransportDockSnapshot(null);
        transportDockAnimationTimerRef.current = null;
      }, 800);
    }
    previousOccupiedTransportDockRef.current = hasOccupiedTransportDock;
    previousTransportDockHadPalletRef.current = Boolean(palletItemImageSrc) && hasOccupiedTransportDock;
    return undefined;
  }, [hasOccupiedTransportDock, isIndividualTransportMode, palletItemImageSrc]);
  React.useEffect(() => () => {
    if (transportDockAnimationTimerRef.current) {
      window.clearTimeout(transportDockAnimationTimerRef.current);
      transportDockAnimationTimerRef.current = null;
    }
  }, []);
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
  const renderTransportDockCardBody = (previewLike, { ghost = false, suppressActions = false } = {}) => {
    if (previewLike) {
      if (previewLike.isEmptyPallet) {
        return (
          <>
            <WarehouseHarvestSingleLayerCard
              layerLabel="1단"
              showLayerBadge={false}
              loadLabel=""
              boxEntries={Array.from({ length: Math.max(1, Math.floor(Number(previewLike?.maxBoxes) || harvestBoxesPerPallet)) }, (_, boxIndex) => ({
                key: `transport-dock-empty-pallet-box-${boxIndex + 1}`,
                filled: false,
                tone: 'yellow',
              }))}
            />
            <strong>팔레트</strong>
            <span className="warehouse-harvest-slot-card__status">빈 팔레트</span>
            {!ghost && typeof onUnloadEmptyPalletFromTransport === 'function' ? (
              <button
                type="button"
                className="button button--compact button--ghost warehouse-storage-transport-dock-preview__action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onUnloadEmptyPalletFromTransport();
                }}
                title="현재 운반기구 적재칸의 빈 팔레트를 빼고 원래 상태로 되돌립니다."
              >
                빼기
              </button>
            ) : null}
          </>
        );
      }
      return (
        <WarehouseHarvestSingleLayerCard
          layerLabel="1단"
          showLayerBadge={false}
          loadLabel={previewLike.loadLabel}
          boxEntries={Array.from({ length: Math.max(1, Math.floor(Number(previewLike?.maxBoxes) || harvestBoxesPerPallet)) }, (_, boxIndex) => {
            const fillAnimMetaByVisualSlotNo = getTransportDockFillAnimMetaByVisualSlotNo(previewLike);
            const displayBoxCapacity = Math.max(1, Math.floor(Number(previewLike?.maxBoxes) || harvestBoxesPerPallet));
            const displayBoxIndex = harvestPalletDisplayBoxIndexOf(boxIndex, Math.min(6, displayBoxCapacity), displayBoxCapacity);
            const previewSlotIndex = displayBoxIndex;
            const previewSlotNo = displayBoxIndex + 1;
            const tooltipSlotNo = Math.max(1, Math.floor(Number(previewLike?.sourceVehiclePalletSlotNo) || 1));
            const tooltipLayerKey = String(previewLike?.sourceLayerKey || 'bottom') === 'top' ? 'top' : 'bottom';
            const slotBoxMeta = transportDockHarvestBoxTooltipsBySlot?.[tooltipSlotNo]?.[tooltipLayerKey]?.[displayBoxIndex] || null;
            const boxMeta = resolveTransportDockPreviewBoxMeta({
              slotBoxMeta,
              previewLike,
              previewSlotIndex,
              displaySlotNo: previewSlotNo,
            });
            const isFilledBox = Array.isArray(previewLike?.filledSlots)
              ? Boolean(previewLike.filledSlots[previewSlotIndex])
              : boxMeta
              ? Boolean(boxMeta.filled)
              : displayBoxIndex < previewLike.filledBoxCount;
            const boxTooltip = isFilledBox ? boxMeta : null;
            const sourceVisualSlotNo = Math.max(1, Math.floor(Number(
              boxMeta?.sourceVisualSlotNo
              || boxMeta?.visualSlotNo
            ) || displayBoxIndex + 1));
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
              if (previousPick.key === pickKey && now - Math.max(0, Number(previousPick.at) || 0) < 350) {
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
                sourceBatchId: String(boxTooltip?.sourceBatchId || ''),
                sourceBoxUnitNo: Math.max(0, Math.floor(Number(boxTooltip?.sourceBoxUnitNo) || 0)),
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
              tone: resolveTransportDockBoxTone(boxMeta, previewLike, previewSlotIndex),
              fillAnimMeta: isFilledBox
                ? (fillAnimMetaByVisualSlotNo.get(previewSlotNo) || null)
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
    return (
      <>
        <strong>적재칸 1</strong>
        <span className="warehouse-harvest-slot-card__status">비어 있음</span>
        {!suppressActions && selectedTransportCanUseDockPallet && typeof onLoadEmptyPalletToTransport === 'function' ? (
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
    const showDockAsOccupied = Boolean(visibleTransportDockPreview);
    const transportDockCardClassName = `warehouse-harvest-slot-card warehouse-harvest-slot-card--transport-dock-preview ${showDockAsOccupied ? 'warehouse-harvest-slot-card--occupied' : 'warehouse-harvest-slot-card--empty'} ${visibleTransportDockPreview ? 'warehouse-harvest-slot-card--with-pallet-bg' : ''} ${visibleTransportDockPreview && !visibleTransportDockPreview.isEmptyPallet ? 'warehouse-harvest-slot-card--with-boxes warehouse-harvest-slot-card--single-layer' : ''} ${showPendingTargetGlow ? 'warehouse-harvest-slot-card--selected warehouse-harvest-slot-card--transport-dock-pending-target' : ''} ${transportDockAnimationState === 'is-slot-shell-docking' && showDockAsOccupied ? 'warehouse-harvest-slot-card--transport-dock-slot-shell-docking' : ''}`.trim();

    return (
      <div className="warehouse-storage-transport-selected__slot-block">
        <div
          className={`warehouse-storage-transport-dock-preview ${transportDockClassName} ${showDockAsOccupied ? 'is-occupied' : 'is-empty'} ${visibleTransportDockPreview?.isEmptyPallet && typeof onUnloadEmptyPalletFromTransport === 'function' ? 'has-empty-pallet-action' : ''} ${canPickTransportDockBoxesIndividually ? 'can-pick-boxes' : ''} ${showPendingTargetGlow ? 'is-pending-target' : ''}`.trim()}
        >
          {transportDockAnimationState === 'is-slot-shell-undocking' && undockingTransportDockSnapshot ? (
            <div className="warehouse-storage-transport-dock-preview__slot-shell-motion-layer" aria-hidden="true">
              <div className="warehouse-storage-transport-dock-preview__slot-shell-motion warehouse-storage-transport-dock-preview__slot-shell-motion--undock">
                <div
                  className={`warehouse-harvest-slot-card warehouse-harvest-slot-card--transport-dock-preview warehouse-harvest-slot-card--occupied ${undockingTransportDockSnapshot.hasPalletBg ? 'warehouse-harvest-slot-card--with-pallet-bg' : ''} ${!undockingTransportDockSnapshot.previewLike?.isEmptyPallet ? 'warehouse-harvest-slot-card--with-boxes warehouse-harvest-slot-card--single-layer' : ''}`.trim()}
                  style={undockingTransportDockSnapshot.hasPalletBg && palletItemImageSrc
                    ? { '--warehouse-pallet-bg': `url("${palletItemImageSrc}")` }
                    : undefined}
                >
                  {renderTransportDockCardBody(undockingTransportDockSnapshot.previewLike || null, { ghost: true, suppressActions: true })}
                </div>
              </div>
            </div>
          ) : null}
          <div
            data-transport-dock-id={visibleTransportDockPreview?.previewKey || undefined}
            className={transportDockCardClassName}
            onClick={visibleTransportDockPreview?.isEmptyPallet && typeof onUnloadEmptyPalletFromTransport === 'function'
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
                style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
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
                          ? '개별 적재는 운반기구 적재칸에 팔레트를 먼저 실어야 선택할 수 있습니다.'
                          : modeKey === 'pallet'
                            ? '팔레트를 그대로 목적지에 적재합니다.'
                            : '목적지까지 가져간 상자를 개별 적재합니다.'
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
                    title="현재 네온으로 결합된 개별 적재 대상을 해제합니다."
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
            {false && selectedTransportRow.sourceType !== 'manual' && !transportDockPreview ? (
              <>
                <div className="storage-card__meta" style={{ marginTop: 6 }}>
                  {selectedTransportRow.sourceType === 'tool'
                  && String(selectedTransportRow?.toolKey || '').startsWith('carrierLadder')
                    ? `적재한도 ${Math.max(0, Number(carrierLadderCapacityKgByKey?.[String(selectedTransportRow?.toolKey || '')]) || 0).toLocaleString()}kg · 사다리 보조`
                    : '팔레트 이동 가능'}
                </div>
                <div className="storage-card__meta" style={{ marginTop: 4 }}>
                  {selectedTransportRow.sourceType === 'tool'
                  && String(selectedTransportRow?.toolKey || '').startsWith('carrierLadder')
                    ? `${Math.max(0, Number(selectedTransportRow?.ladderUnitCount) || 0) >= 2 ? '상하차 세트로' : ''}작업차 옆에서 쓰는 용도의 보조 설비입니다.`
                    : (
                      selectedTransportCanStackPallet
                        ? '창고 이동, 적치 변경, 차량 적재가 가능합니다.'
                        : '창고 내 바닥 이동만 가능합니다.'
                    )}
                </div>
              </>
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
            const imageSrc = isMachineRow
              ? machineImageSrcOfParkingState(machine, game)
              : toolImageSrcOf(String(row?.toolKey || ''));
            const title = isMachineRow
              ? machineDisplayNameWithRentTag(machine)
              : String(row?.toolName || row?.toolMeta?.name || '운반기구');
            const metaText = row.sourceType === 'manual'
              ? '장비 없이 직접 운반 · 1박스 적재'
              : isMachineRow
                ? [
                  `내구도 ${equipmentDurabilityOf(game, machine?.machineKey).toFixed(1)}%`,
                  hasLoadedHarvestOnDock ? '적재중' : '',
                  '팔레트 이동 가능',
                ].filter(Boolean).join(' · ')
                : (
                  String(row?.toolKey || '').startsWith('carrierLadder')
                    ? [
                      Number(row?.ladderUnitCount || 0) >= 2 ? '상하차용 사다리 세트' : '상하차용 사다리',
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
            ? '현재 사용할 수 있는 지게차, 팔레트잭, 상하차용 사다리가 없습니다.'
            : '현재 사용할 수 있는 지게차나 상하차용 사다리가 없습니다.'}
        </div>
      )}
    </div>
  );
}
