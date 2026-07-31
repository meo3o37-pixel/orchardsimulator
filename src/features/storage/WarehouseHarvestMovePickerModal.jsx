import React from 'react';
import { HarvestQualityStampedCrate } from '../harvest/HarvestPendingBoxesPanel';
import { normalizeHarvestGradeLabel } from '../../utils/harvestGrade';
import {
  harvestStorageMoveStatusLabelOf,
  harvestStorageMoveTargetButtonLabelOf,
} from './storageSlotModel';

export default function WarehouseHarvestMovePickerModal({
  picker,
  onClose,
  embedded = false,
  selectedTransportLabel,
  selectedTransportMode,
  selectedTransportCanMovePallet,
  onChooseTransportMode,
  targetSummaryLabel,
  targetSummaryVisual,
  onPatchPicker,
  viewKey,
  onChooseTarget,
  storageRows,
  warehouseContentKey,
  sortingRows,
  workbenchRows,
  generalRows,
  formatCountWithUnit,
  targetSlotRows,
  harvestPalletLayerEntryOf,
  harvestPalletFilledBoxCount,
  harvestPalletVisualFilledBoxCount,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxToneAt,
  individualFillAnimBySlot,
  palletItemImageSrc,
  harvestBoxesPerPallet,
}) {
  if (!picker) return null;

  const warehouseSubTab = String(picker?.warehouseSubTab || 'storage') === 'general'
    ? 'storage'
    : String(picker?.warehouseSubTab || 'storage');
  const sourceTypeRaw = String(picker?.sourceType || 'warehouse-slot');
  const isGeneralSource = sourceTypeRaw === 'warehouse-general';
  const sourceBoxCard = picker?.sourceBoxCard || null;
  const shouldShowIndividualQtyBar = isGeneralSource || (String(selectedTransportMode || 'pallet') === 'individual' && sourceBoxCard);
  const handleTargetClick = (target) => {
    if (!target) return;
    onChooseTarget(target);
  };
  const preferredWorkbenchTargetSlotNo = Math.max(0, Math.floor(Number(picker?.preferredWorkbenchTargetSlotNo) || 0));
  const preferredWorkbenchTargetRef = React.useRef(null);

  React.useEffect(() => {
    if (warehouseSubTab !== 'workbench') return;
    if (preferredWorkbenchTargetSlotNo <= 0) return;
    preferredWorkbenchTargetRef.current?.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [preferredWorkbenchTargetSlotNo, warehouseSubTab]);

  return (
    <>
      {!embedded ? <div className="slot-picker-backdrop" onClick={onClose} /> : null}
      <div className={embedded ? 'warehouse-harvest-move-pane' : 'slot-picker slot-picker--modal slot-picker--harvest-move-modal'}>
        {!embedded ? <div className="slot-picker__title">수확물 하역</div> : null}
        {!embedded ? (
          <div className="slot-picker__summary-row" style={{ marginTop: 6 }}>
            <div className="summary-chip summary-chip--storage-compact">
              <span>선택 운반기구</span>
              <div className="summary-chip__transport-row">
                <strong>{selectedTransportLabel}</strong>
              </div>
            </div>
            <div
              className={[
                'summary-chip',
                'summary-chip--storage-compact',
                targetSummaryVisual ? 'summary-chip--harvest-preview' : '',
              ].filter(Boolean).join(' ')}
            >
              <div className="summary-chip__harvest-preview-main">
                <span>선택 이동대상</span>
                <strong>{targetSummaryLabel}</strong>
              </div>
              {targetSummaryVisual?.kind === 'general' ? (
                <div className="summary-chip__target-preview" aria-hidden="true">
                  <div className="summary-chip__target-card">
                    <div className="summary-chip__target-card-qty">{targetSummaryVisual.boxText}</div>
                    <div className="summary-chip__target-card-title">{targetSummaryVisual.cropLabel}</div>
                    <div className="summary-chip__target-crate-preview">
                      <HarvestQualityStampedCrate
                        tone={targetSummaryVisual.crateTone}
                        fillRatio={targetSummaryVisual.fillRatio}
                        life={targetSummaryVisual?.life}
                        fillLabel={targetSummaryVisual.fillLabel}
                        qualityLabel={targetSummaryVisual.qualityLabel}
                        gradeLabel={normalizeHarvestGradeLabel(targetSummaryVisual?.gradeLabel, '미선별') || '미선별'}
                        sizeLabel={String(targetSummaryVisual?.sizeLabel || '미측정')}
                        stemStatusKey={String(targetSummaryVisual?.stemStatusKey || targetSummaryVisual?.stemStatus || '')}
                        stemStatusLabel={String(targetSummaryVisual?.stemStatusLabel || targetSummaryVisual?.stemLabel || '')}
                        stemRemoved={typeof targetSummaryVisual?.stemRemoved === 'boolean' ? targetSummaryVisual.stemRemoved : undefined}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="slot-picker__body slot-picker__body--harvest-move">
          <div
            key={viewKey}
            className="focus-tab-panel slot-picker__harvest-move-main-panel"
          >
            <>
                <div className="slot-picker__hint" style={{ marginTop: 8 }}>창고 선택</div>
                <div className="slot-picker__tabs slot-picker__tabs--harvest-move-entities">
                  {storageRows.map((row) => {
                    const selected = String(picker?.targetFacilityKey || '') === String(row?.key || '');
                    return (
                      <button
                        key={`harvest-move-warehouse-${row.key}`}
                        type="button"
                        className={`focus-tab focus-tab--farm-main-animate slot-button slot-picker__harvest-move-warehouse-tone ${row?.isColdStorage && row?.coldEnabled ? 'is-cold-storage' : 'is-general-storage'} ${selected ? 'slot-button--selected-outline' : ''}`.trim()}
                        onClick={() => onPatchPicker({ targetFacilityKey: String(row?.key || '') })}
                      >
                        <strong>{row.name}</strong>
                      </button>
                    );
                  })}
                </div>
                <div className="focus-tabs warehouse-storage-harvest-subtabs slot-picker__harvest-move-subtabs" style={{ marginTop: 10, marginBottom: 10 }}>
                  {[
                    ['storage', '저장공간'],
                    ['sorting', '선별기'],
                    ['workbench', '작업대'],
                  ].map(([key, label]) => (
                    <button
                      key={`harvest-move-warehouse-subtab-${key}`}
                      type="button"
                      className={`focus-tab focus-tab--farm-main-animate warehouse-storage-harvest-subtab ${warehouseSubTab === key ? 'focus-tab--active' : ''}`.trim()}
                      onClick={() => onPatchPicker({ warehouseSubTab: key })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div
                  key={`harvest-move-warehouse-content-${warehouseContentKey || 'none'}`}
                  className="focus-tab-panel slot-picker__harvest-move-warehouse-panel"
                >
                  {warehouseSubTab === 'sorting' ? (
                    <>
                      <div className="slot-picker__hint" style={{ marginTop: 0 }}>선별기 선택</div>
                      {sortingRows.length ? (
                        <div className="warehouse-workbench-slot-list slot-picker__harvest-move-scroll-y">
                          {sortingRows.map((row) => (
                            <div
                              key={`harvest-move-sorting-${row.key}`}
                              className="warehouse-workbench-slot-card is-occupied warehouse-workbench-slot-card--harvest-move"
                            >
                              <div className="warehouse-workbench-slot-card__label">{row.desc || '선별기 슬롯'}</div>
                              <div className="warehouse-workbench-slot-card__table-name">{row.title}</div>
                              <div className="warehouse-workbench-slot-card__slot-stage">
                                <div className="warehouse-workbench-slot-card__cargo-group warehouse-workbench-slot-card__cargo-group--left">
                                  {row.storageSlots.map((cargoSlot) => {
                                    const hasPalletBackground = cargoSlot.hasEmptyPallet || (cargoSlot.hasStoredHarvest && !cargoSlot.isFloorStored);
                                    const disabled = !cargoSlot?.target?.canChoose;
                                    const statusLabel = harvestStorageMoveStatusLabelOf(cargoSlot?.target || null, {
                                      disabled,
                                    });
                                    return (
                                      <button
                                        key={`harvest-move-sorting-${row.key}-${cargoSlot.key}`}
                                        type="button"
                                        className={`warehouse-harvest-slot-card warehouse-harvest-slot-card--move-target warehouse-harvest-slot-card--actionable ${cargoSlot.occupied ? `warehouse-harvest-slot-card--occupied ${cargoSlot.hasStoredHarvest ? `warehouse-harvest-slot-card--with-boxes warehouse-harvest-slot-card--single-layer${cargoSlot.isFloorStored ? ' warehouse-harvest-slot-card--floor-stored' : ''}` : ''} ${hasPalletBackground ? 'warehouse-harvest-slot-card--with-pallet-bg' : ''}` : 'warehouse-harvest-slot-card--empty'} ${disabled ? 'is-disabled' : ''}`.trim()}
                                        disabled={disabled}
                                        title={String(cargoSlot?.target?.blockReason || cargoSlot?.target?.displayLabel || statusLabel)}
                                        style={hasPalletBackground && palletItemImageSrc ? { '--warehouse-pallet-bg': `url("${palletItemImageSrc}")` } : undefined}
                                        onClick={() => handleTargetClick(cargoSlot?.target || null)}
                                      >
                                        <strong>{cargoSlot.title}</strong>
                                        <span className="warehouse-harvest-slot-card__status">{statusLabel}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="meter__hint" style={{ marginTop: 10 }}>설치된 선별기가 없습니다.</div>
                      )}
                    </>
                  ) : warehouseSubTab === 'workbench' ? (
                    <>
                      <div className="slot-picker__hint" style={{ marginTop: 0 }}>작업대 선택</div>
                      {workbenchRows.length ? (
                        <div className="warehouse-workbench-slot-list slot-picker__harvest-move-scroll-y">
                          {workbenchRows.map((row) => (
                            <div
                              key={`harvest-move-workbench-${row.key}`}
                              className="warehouse-workbench-slot-card is-occupied warehouse-workbench-slot-card--harvest-move"
                            >
                              <div className="warehouse-workbench-slot-card__label">{row.slotLabel || row.desc || '작업칸'}</div>
                              <div className="warehouse-workbench-slot-card__table-name">{row.title}</div>
                              <div className="warehouse-workbench-slot-card__slot-stage">
                                <div className="warehouse-workbench-slot-card__cargo-group warehouse-workbench-slot-card__cargo-group--left">
                                  {row.cargoSlots.slice(0, 2).map((cargoSlot) => {
                                    const hasPalletBackground = cargoSlot.hasEmptyPallet || (cargoSlot.hasStoredHarvest && !cargoSlot.isFloorStored);
                                    const isSelectedSourceSlot = sourceTypeRaw === 'warehouse-slot'
                                      && Number(picker?.sourceSlotNo || 0) === Number(cargoSlot?.storageSlotNo || 0);
                                    const isPreferredWorkbenchTarget = preferredWorkbenchTargetSlotNo > 0
                                      && Number(cargoSlot?.storageSlotNo || 0) === preferredWorkbenchTargetSlotNo;
                                    const disabled = !cargoSlot?.target?.canChoose;
                                    const statusLabel = harvestStorageMoveStatusLabelOf(cargoSlot?.target || null, {
                                      disabled,
                                      isSelectedSourceSlot,
                                    });
                                    return (
                                      <div
                                        key={`harvest-move-workbench-left-${row.key}-${cargoSlot.key}`}
                                        className="warehouse-workbench-slot-card__cargo-card"
                                      >
                                        <div
                                          ref={isPreferredWorkbenchTarget ? preferredWorkbenchTargetRef : null}
                                          className={`warehouse-harvest-slot-card warehouse-harvest-slot-card--move-target warehouse-harvest-slot-card--actionable ${cargoSlot.occupied ? `warehouse-harvest-slot-card--occupied ${cargoSlot.hasStoredHarvest ? `warehouse-harvest-slot-card--with-boxes warehouse-harvest-slot-card--single-layer${cargoSlot.isFloorStored ? ' warehouse-harvest-slot-card--floor-stored' : ''}` : ''} ${hasPalletBackground ? 'warehouse-harvest-slot-card--with-pallet-bg' : ''}` : 'warehouse-harvest-slot-card--empty'} ${isPreferredWorkbenchTarget ? 'warehouse-harvest-slot-card--selected' : ''}`.trim()}
                                          title={String(cargoSlot?.target?.blockReason || cargoSlot?.target?.displayLabel || statusLabel)}
                                          style={hasPalletBackground && palletItemImageSrc ? { '--warehouse-pallet-bg': `url("${palletItemImageSrc}")` } : undefined}
                                        >
                                          {cargoSlot.occupied ? (
                                            <div className="warehouse-harvest-slot-stack" aria-hidden="true">
                                              <div className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--single is-active ${cargoSlot.isFloorStored ? 'warehouse-harvest-slot-layer-card--floor' : ''}`.trim()}>
                                                {cargoSlot.isFloorStored ? null : <span className="warehouse-harvest-slot-layer-card__badge">1단</span>}
                                                <div className="warehouse-harvest-slot-box-grid">
                                                  {Array.from({ length: harvestBoxesPerPallet }, (_, boxIndex) => {
                                                    const displayBoxIndex = typeof harvestPalletDisplayBoxIndexOf === 'function'
                                                      ? harvestPalletDisplayBoxIndexOf(boxIndex)
                                                      : boxIndex;
                                                    const filledCount = Math.max(
                                                      0,
                                                      Math.min(harvestBoxesPerPallet, Math.floor(Number(cargoSlot?.filledBoxCount) || 0))
                                                    );
                                                    return (
                                                      <span
                                                        key={`harvest-move-workbench-left-box-${row.key}-${cargoSlot.key}-${boxIndex + 1}`}
                                                        className={`warehouse-harvest-slot-box ${displayBoxIndex < filledCount ? 'is-filled' : ''} ${harvestPalletBoxToneAt?.(cargoSlot?.bottomLayer || null, displayBoxIndex) === 'green' ? 'is-green' : 'is-yellow'}`.trim()}
                                                      />
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                              <span className="warehouse-harvest-slot-card__load-label warehouse-harvest-slot-card__load-label--with-actions">
                                                {statusLabel}
                                              </span>
                                            </div>
                                          ) : (
                                            <>
                                              <strong>{cargoSlot.label}</strong>
                                            </>
                                          )}
                                          <div className="footer-actions warehouse-harvest-slot-actions">
                                            <button
                                              type="button"
                                              className="button button--compact button--ghost facility-workbench-install-button day-transition-animate-button"
                                              disabled={disabled}
                                              title={String(cargoSlot?.target?.blockReason || cargoSlot?.target?.displayLabel || statusLabel)}
                                              onClick={() => handleTargetClick(cargoSlot?.target || null)}
                                            >
                                              {harvestStorageMoveTargetButtonLabelOf({ disabled })}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="warehouse-workbench-slot-card__center-stage">
                                  {row.imageUrl ? (
                                    <div className="warehouse-workbench-slot-card__table-visual" aria-hidden="true">
                                      <img src={row.imageUrl} alt="" />
                                    </div>
                                  ) : null}
                                  <div className="warehouse-workbench-slot-card__crew-layout">
                                    {row.roleLabels.map((label, index) => (
                                      <div
                                        key={`harvest-move-workbench-crew-${row.key}-${index + 1}`}
                                        className="warehouse-workbench-slot-card__crew-card"
                                      >
                                        <strong className="warehouse-workbench-slot-card__crew-role">{label}</strong>
                                        <span className="warehouse-workbench-slot-card__crew-status">투입 가능</span>
                                        <span className="warehouse-workbench-slot-card__crew-status warehouse-workbench-slot-card__crew-status--labor">
                                          투입 가능
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="warehouse-workbench-slot-card__cargo-group warehouse-workbench-slot-card__cargo-group--right">
                                  {row.cargoSlots.slice(2, 4).map((cargoSlot) => {
                                    const hasPalletBackground = cargoSlot.hasEmptyPallet || (cargoSlot.hasStoredHarvest && !cargoSlot.isFloorStored);
                                    const isSelectedSourceSlot = sourceTypeRaw === 'warehouse-slot'
                                      && Number(picker?.sourceSlotNo || 0) === Number(cargoSlot?.storageSlotNo || 0);
                                    const isPreferredWorkbenchTarget = preferredWorkbenchTargetSlotNo > 0
                                      && Number(cargoSlot?.storageSlotNo || 0) === preferredWorkbenchTargetSlotNo;
                                    const disabled = !cargoSlot?.target?.canChoose;
                                    const statusLabel = harvestStorageMoveStatusLabelOf(cargoSlot?.target || null, {
                                      disabled,
                                      isSelectedSourceSlot,
                                    });
                                    return (
                                      <div
                                        key={`harvest-move-workbench-right-${row.key}-${cargoSlot.key}`}
                                        className="warehouse-workbench-slot-card__cargo-card"
                                      >
                                        <div
                                          ref={isPreferredWorkbenchTarget ? preferredWorkbenchTargetRef : null}
                                          className={`warehouse-harvest-slot-card warehouse-harvest-slot-card--move-target warehouse-harvest-slot-card--actionable ${cargoSlot.occupied ? `warehouse-harvest-slot-card--occupied ${cargoSlot.hasStoredHarvest ? `warehouse-harvest-slot-card--with-boxes warehouse-harvest-slot-card--single-layer${cargoSlot.isFloorStored ? ' warehouse-harvest-slot-card--floor-stored' : ''}` : ''} ${hasPalletBackground ? 'warehouse-harvest-slot-card--with-pallet-bg' : ''}` : 'warehouse-harvest-slot-card--empty'} ${isPreferredWorkbenchTarget ? 'warehouse-harvest-slot-card--selected' : ''}`.trim()}
                                          title={String(cargoSlot?.target?.blockReason || cargoSlot?.target?.displayLabel || statusLabel)}
                                          style={hasPalletBackground && palletItemImageSrc ? { '--warehouse-pallet-bg': `url("${palletItemImageSrc}")` } : undefined}
                                        >
                                          {cargoSlot.occupied ? (
                                            <div className="warehouse-harvest-slot-stack" aria-hidden="true">
                                              <div className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--single is-active ${cargoSlot.isFloorStored ? 'warehouse-harvest-slot-layer-card--floor' : ''}`.trim()}>
                                                {cargoSlot.isFloorStored ? null : <span className="warehouse-harvest-slot-layer-card__badge">1단</span>}
                                                <div className="warehouse-harvest-slot-box-grid">
                                                  {Array.from({ length: harvestBoxesPerPallet }, (_, boxIndex) => {
                                                    const displayBoxIndex = typeof harvestPalletDisplayBoxIndexOf === 'function'
                                                      ? harvestPalletDisplayBoxIndexOf(boxIndex)
                                                      : boxIndex;
                                                    const filledCount = Math.max(
                                                      0,
                                                      Math.min(harvestBoxesPerPallet, Math.floor(Number(cargoSlot?.filledBoxCount) || 0))
                                                    );
                                                    return (
                                                      <span
                                                        key={`harvest-move-workbench-right-box-${row.key}-${cargoSlot.key}-${boxIndex + 1}`}
                                                        className={`warehouse-harvest-slot-box ${displayBoxIndex < filledCount ? 'is-filled' : ''} ${harvestPalletBoxToneAt?.(cargoSlot?.bottomLayer || null, displayBoxIndex) === 'green' ? 'is-green' : 'is-yellow'}`.trim()}
                                                      />
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                              <span className="warehouse-harvest-slot-card__load-label warehouse-harvest-slot-card__load-label--with-actions">
                                                {statusLabel}
                                              </span>
                                            </div>
                                          ) : (
                                            <>
                                              <strong>{cargoSlot.label}</strong>
                                            </>
                                          )}
                                          <div className="footer-actions warehouse-harvest-slot-actions">
                                            <button
                                              type="button"
                                              className="button button--compact button--ghost facility-workbench-install-button day-transition-animate-button"
                                              disabled={disabled}
                                              title={String(cargoSlot?.target?.blockReason || cargoSlot?.target?.displayLabel || statusLabel)}
                                              onClick={() => handleTargetClick(cargoSlot?.target || null)}
                                            >
                                              {harvestStorageMoveTargetButtonLabelOf({ disabled })}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="meter__hint" style={{ marginTop: 10 }}>설치된 작업대가 없습니다.</div>
                      )}
                    </>
                  ) : warehouseSubTab === 'general' ? (
                    <>
                      <div className="slot-picker__hint" style={{ marginTop: 0 }}>일반저장 내용</div>
                      {generalRows.length ? (
                        <div className="option-grid warehouse-storage-modal-card-grid warehouse-storage-modal-card-grid--harvest-move-general slot-picker__harvest-move-scroll-y">
                          {(() => {
                            const unloadMode = String(selectedTransportMode || 'pallet') === 'individual' ? 'individual' : 'pallet';
                            const actionRow = generalRows[0] || null;
                            if (!actionRow || unloadMode !== 'individual') return null;
                            return (
                              <button
                                key={`harvest-move-general-action-${String(actionRow.key || 'default')}`}
                                type="button"
                                className={`focus-tab slot-button-card harvest-move-general-action-card ${actionRow.canChoose ? '' : 'is-disabled'}`.trim()}
                                disabled={!actionRow.canChoose}
                                onClick={() => handleTargetClick(actionRow)}
                              >
                                <div className="slot-button-content">
                                  <strong>일반저장 하역</strong>
                                  <span>{String(actionRow.desc || '')}</span>
                                  <small>
                                    {actionRow.canChoose
                                      ? '이 창고의 일반저장으로 박스를 옮깁니다.'
                                      : '개별 적재에서만 일반저장으로 내려놓을 수 있습니다.'}
                                  </small>
                                </div>
                              </button>
                            );
                          })()}
                          {generalRows.map((row, rowIndex) => {
                            const crateVisualKey = String(row?.loadBoxKey || row?.key || '');
                            const appleCrateTone = /green/i.test(crateVisualKey) ? 'green' : 'yellow';
                            const isSelectedGeneralSource = isGeneralSource
                              && String(picker?.sourceRowKey || '') === String(row?.displayKey || row?.key || '');
                            if (row?.isEmptyGeneralStorage) {
                              return (
                                <div
                                  key={`harvest-move-general-empty-${row.key}`}
                                  className="focus-tab slot-button-card is-disabled"
                                  aria-disabled="true"
                                >
                                  <div className="slot-button-content">
                                    <strong>{row.title}</strong>
                                    <span>{row.desc}</span>
                                    <small>현재 비어 있음</small>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div
                                key={`harvest-move-general-${row.key}-${rowIndex + 1}`}
                                className={`focus-tab option-card warehouse-storage-card--harvest-box warehouse-storage-card--harvest-box-static ${isSelectedGeneralSource ? 'option-card--selected warehouse-storage-card--selected-source' : ''}`.trim()}
                                aria-disabled="true"
                              >
                                <div className="warehouse-storage-card-qty">
                                  {String(row?.boxText || formatCountWithUnit(row?.qty, row?.unit))}
                                </div>
                                <div className="storage-card__head">
                                  <strong>{String(row?.cropLabel || row?.name || '수확물')}</strong>
                                </div>
                                {isSelectedGeneralSource ? (
                                  <div className="warehouse-storage-card__selected-badge">선택됨</div>
                                ) : null}
                                <div className="warehouse-storage-harvest-crate-preview" aria-hidden="true">
                                  <HarvestQualityStampedCrate
                                    tone={appleCrateTone}
                                    fillRatio={Math.max(0, Math.min(1, Number(row?.fillRatio) || 1))}
                                    life={row?.life}
                                    fillLabel={String(row?.fillLabel || '')}
                                    qualityLabel={String(row?.qualityLabel || '보통')}
                                    gradeLabel={normalizeHarvestGradeLabel(row?.gradeLabel, '미선별') || '미선별'}
                                    sizeLabel={String(row?.sizeLabel || '미측정')}
                                    stemStatusKey={String(row?.stemStatusKey || row?.stemStatus || '')}
                                    stemStatusLabel={String(row?.stemStatusLabel || row?.stemLabel || '')}
                                    stemRemoved={typeof row?.stemRemoved === 'boolean' ? row.stemRemoved : undefined}
                                  />
                                </div>
                                {String(row?.detailText || '') ? (
                                  <div className="storage-card__meta">{String(row.detailText)}</div>
                                ) : null}
                                {Number(row?.totalKg) > 0 ? (
                                  <div className="storage-card__meta">{`보관량 ${Number(row.totalKg).toLocaleString()}kg`}</div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="meter__hint" style={{ marginTop: 10 }}>선택한 창고에 사용할 일반저장이 없습니다.</div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="slot-picker__hint" style={{ marginTop: 0 }}>수확물 저장칸 선택</div>
                      <div className="slot-picker__tabs slot-picker__tabs--pallet-move-slots slot-picker__harvest-move-scroll-y">
                        {targetSlotRows.map((row) => {
                          const disabled = !row.canChoose;
                          const isSelectedSourceSlot = String(picker?.sourceType || 'warehouse-slot') === 'warehouse-slot'
                            && String(picker?.sourceFacilityKey || '') === String(row?.facilityKey || picker?.targetFacilityKey || '')
                            && Math.max(1, Math.floor(Number(picker?.sourceSlotNo) || 0)) === Math.max(1, Math.floor(Number(row?.slotNo) || 0));
                          const sourceEntry = row.entry || null;
                          const bottomLayerEntry = harvestPalletLayerEntryOf(sourceEntry, 'bottom') || sourceEntry || null;
                          const topLayerEntry = row.hasTopLayer
                            ? (harvestPalletLayerEntryOf(sourceEntry, 'top') || row.topLayer || null)
                            : null;
                          const bottomFilledBoxCount = harvestPalletVisualFilledBoxCount(bottomLayerEntry);
                          const topFilledBoxCount = harvestPalletVisualFilledBoxCount(topLayerEntry);
                          const statusLabel = harvestStorageMoveStatusLabelOf(row, {
                            disabled,
                            isSelectedSourceSlot,
                          });
                          const cardClassName = `warehouse-harvest-slot-card warehouse-harvest-slot-card--move-target ${row.occupied ? 'warehouse-harvest-slot-card--occupied' : 'warehouse-harvest-slot-card--empty'} ${row.isHarvestStored ? 'warehouse-harvest-slot-card--with-pallet-bg warehouse-harvest-slot-card--with-boxes' : ''} ${row.isFloorStored ? 'warehouse-harvest-slot-card--with-boxes warehouse-harvest-slot-card--single-layer warehouse-harvest-slot-card--floor-stored' : ''} ${row.isHarvestStored && row.hasTopLayer ? 'warehouse-harvest-slot-card--stacked' : ''} ${row.isHarvestStored && !row.hasTopLayer ? 'warehouse-harvest-slot-card--single-layer' : ''} ${isSelectedSourceSlot ? 'warehouse-harvest-slot-card--selected warehouse-harvest-slot-card--selected-source' : ''}`.trim();
                          return (
                            <button
                              key={`harvest-move-slot-${row.slotNo}`}
                              type="button"
                              className={`focus-tab focus-tab--farm-main-animate slot-button slot-button--pallet-move-slot slot-button--pallet-move-slot-visual ${disabled ? 'is-disabled' : ''}`.trim()}
                              disabled={disabled}
                              onClick={() => handleTargetClick(row)}
                            >
                              <div
                                className={cardClassName}
                                style={row.isHarvestStored && palletItemImageSrc ? { '--warehouse-pallet-bg': `url("${palletItemImageSrc}")` } : undefined}
                              >
                                {row.isHarvestStored || row.isFloorStored ? (
                                  row.hasTopLayer ? (
                                    <div className="warehouse-harvest-slot-stack" aria-hidden="true">
                                      <div className="warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--bottom is-active">
                                        <span className="warehouse-harvest-slot-layer-card__badge">1단</span>
                                        <div className="warehouse-harvest-slot-box-grid warehouse-harvest-slot-box-grid--layer">
                                          {Array.from({ length: harvestBoxesPerPallet }, (_, boxIndex) => {
                                            const displayBoxIndex = harvestPalletDisplayBoxIndexOf(boxIndex);
                                            return (
                                              <span
                                                key={`harvest-move-slot-${row.slotNo}-bottom-box-${boxIndex + 1}`}
                                                className={`warehouse-harvest-slot-box ${displayBoxIndex < bottomFilledBoxCount ? 'is-filled' : ''} ${harvestPalletBoxToneAt(bottomLayerEntry, displayBoxIndex) === 'green' ? 'is-green' : 'is-yellow'}`.trim()}
                                              />
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <div className="warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--top is-active">
                                        <span className="warehouse-harvest-slot-layer-card__badge">2단</span>
                                        <div className="warehouse-harvest-slot-box-grid warehouse-harvest-slot-box-grid--layer">
                                          {Array.from({ length: harvestBoxesPerPallet }, (_, boxIndex) => {
                                            const displayBoxIndex = harvestPalletDisplayBoxIndexOf(boxIndex);
                                            return (
                                              <span
                                                key={`harvest-move-slot-${row.slotNo}-top-box-${boxIndex + 1}`}
                                                className={`warehouse-harvest-slot-box ${displayBoxIndex < topFilledBoxCount ? 'is-filled' : ''} ${harvestPalletBoxToneAt(topLayerEntry, displayBoxIndex) === 'green' ? 'is-green' : 'is-yellow'}`.trim()}
                                              />
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <span className="warehouse-harvest-slot-card__load-label">
                                        {statusLabel}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="warehouse-harvest-slot-stack" aria-hidden="true">
                                      <div className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--single is-active ${row.isFloorStored ? 'warehouse-harvest-slot-layer-card--floor' : ''}`.trim()}>
                                        {row.isFloorStored ? null : <span className="warehouse-harvest-slot-layer-card__badge">1단</span>}
                                        <div className="warehouse-harvest-slot-box-grid">
                                          {Array.from({ length: harvestBoxesPerPallet }, (_, boxIndex) => {
                                            const displayBoxIndex = harvestPalletDisplayBoxIndexOf(boxIndex);
                                            return (
                                              <span
                                                key={`harvest-move-slot-${row.slotNo}-box-${boxIndex + 1}`}
                                                className={`warehouse-harvest-slot-box ${displayBoxIndex < bottomFilledBoxCount ? 'is-filled' : ''} ${harvestPalletBoxToneAt(bottomLayerEntry, displayBoxIndex) === 'green' ? 'is-green' : 'is-yellow'}`.trim()}
                                              />
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <span className="warehouse-harvest-slot-card__load-label">
                                        {statusLabel}
                                      </span>
                                    </div>
                                  )
                                ) : (
                                  <>
                                    <strong>{row.title}</strong>
                                    <span className="warehouse-harvest-slot-card__status">{row.desc}</span>
                                  </>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
            </>
          </div>
        </div>
        {!embedded ? (
          <div className="footer-actions">
            <button className="button button--ghost facility-workbench-install-button" onClick={onClose}>취소</button>
          </div>
        ) : null}
      </div>
    </>
  );
}
