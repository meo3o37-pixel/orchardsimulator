import React from 'react';
import WarehouseHarvestSlotPanel from './WarehouseHarvestSlotPanel';

function OutputSourceSummary({
  selectedSourceEntries,
  normalizeHarvestGradeLabel,
  processGradeLabel,
  qualityStateText,
  clamp,
  prefix = 'sorting',
}) {
  const selectedSourceCount = Array.isArray(selectedSourceEntries) ? selectedSourceEntries.length : 0;
  const formatRatioPercent = (count) => {
    if (selectedSourceCount <= 0) return '0%';
    return `${Math.round((Math.max(0, Number(count) || 0) / selectedSourceCount) * 100)}%`;
  };
  const gradeSummaryRows = selectedSourceCount > 0
    ? Object.entries(selectedSourceEntries.reduce((acc, entry) => {
      const gradeLabel = normalizeHarvestGradeLabel(entry?.batch?.gradeLabel, '미선별') || '미선별';
      acc[gradeLabel] = Math.max(0, Number(acc[gradeLabel]) || 0) + 1;
      return acc;
    }, {})).sort((a, b) => {
      const gradeOrder = { '미선별': 0, 'A급': 1, 'B급': 2, [processGradeLabel]: 3 };
      const aOrder = Number(gradeOrder?.[a[0]]) ?? 99;
      const bOrder = Number(gradeOrder?.[b[0]]) ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return String(a[0]).localeCompare(String(b[0]), 'ko');
    })
    : [];
  const qualitySummaryRows = selectedSourceCount > 0
    ? Object.entries(selectedSourceEntries.reduce((acc, entry) => {
      const qualityValue = clamp(Number(entry?.batch?.quality) || 0, 0, 100);
      const qualityLabel = String(qualityStateText(qualityValue) || '보통');
      const current = acc[qualityLabel] || { count: 0, maxQuality: 0 };
      current.count += 1;
      current.maxQuality = Math.max(current.maxQuality, qualityValue);
      acc[qualityLabel] = current;
      return acc;
    }, {})).sort((a, b) => Number(b?.[1]?.maxQuality || 0) - Number(a?.[1]?.maxQuality || 0))
    : [];

  return (
    <div className="sorting-output-rule-picker__source-summary">
      <div className="sorting-output-rule-picker__source-summary-title">
        {selectedSourceCount > 0
          ? `선택한 투입칸 ${selectedSourceCount}박스 기준 대략`
          : '선택한 투입칸에 상자가 없습니다.'}
      </div>
      {selectedSourceCount > 0 ? (
        <div className="sorting-output-rule-picker__source-summary-grid">
          <div className="sorting-output-rule-picker__source-summary-card">
            <strong>급 비율</strong>
            <div className="sorting-output-rule-picker__source-summary-bars">
              {gradeSummaryRows.map(([label, count]) => (
                <div key={`${prefix}-grade-summary-${label}`} className="sorting-output-rule-picker__source-bar-row">
                  <div className="sorting-output-rule-picker__source-bar-head">
                    <span>{label}</span>
                    <strong>{formatRatioPercent(count)}</strong>
                  </div>
                  <div className="sorting-output-rule-picker__source-bar-track" aria-hidden="true">
                    <span
                      className="sorting-output-rule-picker__source-bar-fill sorting-output-rule-picker__source-bar-fill--grade"
                      style={{ width: formatRatioPercent(count) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="sorting-output-rule-picker__source-summary-card">
            <strong>품질 비율</strong>
            <div className="sorting-output-rule-picker__source-summary-bars">
              {qualitySummaryRows.map(([label, entry]) => (
                <div key={`${prefix}-quality-summary-${label}`} className="sorting-output-rule-picker__source-bar-row">
                  <div className="sorting-output-rule-picker__source-bar-head">
                    <span>{label}</span>
                    <strong>{formatRatioPercent(entry?.count)}</strong>
                  </div>
                  <div className="sorting-output-rule-picker__source-bar-track" aria-hidden="true">
                    <span
                      className="sorting-output-rule-picker__source-bar-fill sorting-output-rule-picker__source-bar-fill--quality"
                      style={{ width: formatRatioPercent(entry?.count) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function WorkbenchInOutPanel({
  facilityStorageWorkbenchInOutModal,
  facilityStorageWorkbenchInOutSelectionByFacility,
  facilityStorageWorkbenchTaskByFacility,
  normalizeWorkbenchInOutSlotNoList,
  normalizeWorkbenchOutputRuleMap,
  facilityStorageHarvestSlotCount,
  facilityStorageHarvestSlotRowsWithTargets,
  palletItemImageSrc,
  activeFacilityStorageKey,
  facilityStorageHarvestSlotToneClassName,
  facilityStorageHarvestVisibleLayerBySlot,
  facilityStorageSelectedTransportRow,
  facilityStorageSelectedTransportCanMovePallet,
  facilityStorageSelectedTransportHasPalletOnDock,
  facilityStorageSelectedTransportIndividualCarryLimit,
  facilityStorageSelectedTransportCanStackPallet,
  openFacilityStorageHarvestDetail,
  editHarvestPalletMemo,
  setFacilityStorageHarvestVisibleLayerBySlot,
  openHarvestPalletMovePicker,
  pickIndividualHarvestBoxToTransport,
  pickIndividualTransportDockHarvestBoxToTransport,
  pickIndividualHarvestBoxToSelectedTransportDock,
  openHarvestPalletUnloadPicker,
  openHarvestPalletLoadPicker,
  facilityStorageHarvestMovePicker,
  facilityStorageActiveHarvestMoveSource,
  requestHarvestMoveTargetFromCarrier,
  facilityStorageTransportDockInteractionFilledBoxCount,
  facilityStorageSelectedTransportMode,
  harvestBoxesPerPallet,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxFilledAt,
  harvestPalletVisibleFilledSlotsAfterPreview,
  harvestPalletBoxToneAt,
  facilityStorageHarvestBoxTooltipBySlot,
  renderWorkbenchInOutSlotBadgeChips,
  workbenchOutputRuleLabelOf,
  hasOtherFacilityInOutOwner,
  toggleWorkbenchInOutSlotSelection,
  openWorkbenchOutputRulePicker,
  clearWorkbenchOutputRule,
}) {
  const facilityKey = String(facilityStorageWorkbenchInOutModal?.facilityKey || '');
  const workbenchSlotKey = String(facilityStorageWorkbenchInOutModal?.workbenchSlotKey || '');
  const currentSelection = facilityStorageWorkbenchInOutSelectionByFacility?.[facilityKey]?.[workbenchSlotKey] || null;
  const selectedTaskKey = String(facilityStorageWorkbenchTaskByFacility?.[facilityKey]?.[workbenchSlotKey] || '');
  const usesRuleBasedOutput = !selectedTaskKey || ['partialSortOnly', 'stemRemovalPartialSort'].includes(selectedTaskKey);
  const inputSlotNos = normalizeWorkbenchInOutSlotNoList(
    currentSelection?.inputSlotNos ?? currentSelection?.inputSlotNo
  );
  const outputSlotNos = normalizeWorkbenchInOutSlotNoList(
    currentSelection?.outputSlotNos ?? currentSelection?.outputSlotNo
  );
  const outputRulesBySlotNo = normalizeWorkbenchOutputRuleMap(
    currentSelection?.outputRulesBySlotNo ?? currentSelection?.outputAssignmentsBySlotNo
  );

  return (
    <WarehouseHarvestSlotPanel
      slotCount={facilityStorageHarvestSlotCount}
      slotRows={facilityStorageHarvestSlotRowsWithTargets}
      palletImageSrc={palletItemImageSrc}
      activeFacilityStorageKey={activeFacilityStorageKey}
      storageToneClassName={facilityStorageHarvestSlotToneClassName}
      visibleLayerBySlot={facilityStorageHarvestVisibleLayerBySlot}
      selectedTransportRow={facilityStorageSelectedTransportRow}
      selectedTransportCanMovePallet={facilityStorageSelectedTransportCanMovePallet}
      selectedTransportHasPalletOnDock={facilityStorageSelectedTransportHasPalletOnDock}
      selectedTransportIndividualCarryLimit={facilityStorageSelectedTransportIndividualCarryLimit}
      selectedTransportCanStackPallet={facilityStorageSelectedTransportCanStackPallet}
      openHarvestDetail={openFacilityStorageHarvestDetail}
      editHarvestPalletMemo={editHarvestPalletMemo}
      setVisibleLayerBySlot={setFacilityStorageHarvestVisibleLayerBySlot}
      openHarvestPalletMovePicker={openHarvestPalletMovePicker}
      pickIndividualHarvestBoxToTransport={pickIndividualHarvestBoxToTransport}
      pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
      pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
      openHarvestPalletUnloadPicker={openHarvestPalletUnloadPicker}
      openHarvestPalletLoadPicker={openHarvestPalletLoadPicker}
      harvestMoveActive={Boolean(facilityStorageHarvestMovePicker || facilityStorageActiveHarvestMoveSource)}
      chooseHarvestMoveTarget={requestHarvestMoveTargetFromCarrier}
      pendingHarvestMoveTarget={facilityStorageHarvestMovePicker?.pendingTarget || null}
      movingHarvestPreviewSource={facilityStorageActiveHarvestMoveSource}
      movingHarvestPreviewBoxCount={Math.max(0, Math.floor(Number(facilityStorageHarvestMovePicker?.selectedBoxCount) || 0))}
      movingHarvestPreviewFilledBoxCount={facilityStorageTransportDockInteractionFilledBoxCount}
      movingHarvestPreviewCarriesWholePallet={
        Boolean(facilityStorageActiveHarvestMoveSource)
        && !Boolean(facilityStorageActiveHarvestMoveSource?.sourceBoxCard)
        && String(facilityStorageSelectedTransportMode || 'pallet') !== 'individual'
      }
      selectedTransportMode={facilityStorageSelectedTransportMode}
      harvestBoxesPerPallet={harvestBoxesPerPallet}
      harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
      harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
      harvestPalletVisibleFilledSlotsAfterPreview={harvestPalletVisibleFilledSlotsAfterPreview}
      harvestPalletBoxToneAt={harvestPalletBoxToneAt}
      harvestBoxTooltipBySlot={facilityStorageHarvestBoxTooltipBySlot}
      renderSlotOverlayBadges={renderWorkbenchInOutSlotBadgeChips}
      alwaysShowSlotManualContent
      renderSlotManualContent={(slot) => {
        const slotNo = Math.max(0, Math.floor(Number(slot?.slotNo) || 0));
        if (slot?.hasTopLayer) return null;
        const isInputSelected = inputSlotNos.includes(slotNo);
        const isOutputSelected = outputSlotNos.includes(slotNo);
        const currentOutputRule = outputRulesBySlotNo?.[slotNo] || null;
        const currentOutputRuleLabel = workbenchOutputRuleLabelOf(currentOutputRule);
        const isOccupiedByOther = hasOtherFacilityInOutOwner(
          facilityKey,
          slotNo,
          'workbench',
          workbenchSlotKey
        );
        if (isOccupiedByOther && !isInputSelected && !isOutputSelected) return null;
        return (
          <div className="warehouse-workbench-inout-slot-actions">
            <div className="warehouse-workbench-inout-slot-actions__buttons">
              <button
                type="button"
                className={`button button--compact facility-workbench-install-button warehouse-workbench-inout-slot-actions__button warehouse-workbench-inout-slot-actions__button--input ${
                  isInputSelected ? 'is-selected' : ''
                }`.trim()}
                aria-pressed={isInputSelected}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleWorkbenchInOutSlotSelection('input', slotNo);
                }}
              >
                {isInputSelected ? '투입취소' : '투입선택'}
              </button>
              <button
                type="button"
                className={`button button--compact facility-workbench-install-button warehouse-workbench-inout-slot-actions__button warehouse-workbench-inout-slot-actions__button--output ${
                  isOutputSelected ? 'is-selected' : ''
                }`.trim()}
                aria-pressed={isOutputSelected}
                onClick={(event) => {
                  event.stopPropagation();
                  if (usesRuleBasedOutput) {
                    openWorkbenchOutputRulePicker(slotNo);
                  } else {
                    toggleWorkbenchInOutSlotSelection('output', slotNo);
                  }
                }}
                title={currentOutputRuleLabel || undefined}
              >
                {usesRuleBasedOutput
                  ? (isOutputSelected ? '배출수정' : '배출선택')
                  : (isOutputSelected ? '배출취소' : '배출선택')}
              </button>
              {usesRuleBasedOutput && isOutputSelected ? (
                <button
                  type="button"
                  className="button button--compact facility-workbench-install-button warehouse-workbench-inout-slot-actions__button warehouse-workbench-inout-slot-actions__button--output is-selected"
                  onClick={(event) => {
                    event.stopPropagation();
                    clearWorkbenchOutputRule(slotNo);
                  }}
                >
                  배출취소
                </button>
              ) : null}
            </div>
          </div>
        );
      }}
    />
  );
}

export function SortingInOutPanel({
  facilityStorageSortingInOutModal,
  facilityStorageSortingInOutSelectionByFacility,
  normalizeSortingInOutSlotNoList,
  normalizeSortingOutputRuleMap,
  facilityStorageHarvestSlotCount,
  facilityStorageHarvestSlotRowsWithTargets,
  palletItemImageSrc,
  activeFacilityStorageKey,
  facilityStorageHarvestSlotToneClassName,
  facilityStorageHarvestVisibleLayerBySlot,
  facilityStorageSelectedTransportRow,
  facilityStorageSelectedTransportCanMovePallet,
  facilityStorageSelectedTransportHasPalletOnDock,
  facilityStorageSelectedTransportIndividualCarryLimit,
  facilityStorageSelectedTransportCanStackPallet,
  openFacilityStorageHarvestDetail,
  editHarvestPalletMemo,
  setFacilityStorageHarvestVisibleLayerBySlot,
  openHarvestPalletMovePicker,
  pickIndividualHarvestBoxToTransport,
  pickIndividualTransportDockHarvestBoxToTransport,
  pickIndividualHarvestBoxToSelectedTransportDock,
  openHarvestPalletUnloadPicker,
  openHarvestPalletLoadPicker,
  facilityStorageHarvestMovePicker,
  facilityStorageActiveHarvestMoveSource,
  requestHarvestMoveTargetFromCarrier,
  facilityStorageTransportDockInteractionFilledBoxCount,
  facilityStorageSelectedTransportMode,
  harvestBoxesPerPallet,
  harvestPalletDisplayBoxIndexOf,
  harvestPalletBoxFilledAt,
  harvestPalletVisibleFilledSlotsAfterPreview,
  harvestPalletBoxToneAt,
  facilityStorageHarvestBoxTooltipBySlot,
  renderWorkbenchInOutSlotBadgeChips,
  hasOtherFacilityInOutOwner,
  toggleSortingInOutSlotSelection,
  openSortingOutputRulePicker,
  clearSortingOutputRule,
}) {
  const facilityKey = String(facilityStorageSortingInOutModal?.facilityKey || '');
  const equipmentStorageKey = String(facilityStorageSortingInOutModal?.equipmentStorageKey || '');
  const currentSelection = facilityStorageSortingInOutSelectionByFacility?.[facilityKey]?.[equipmentStorageKey] || null;
  const inputSlotNos = normalizeSortingInOutSlotNoList(
    currentSelection?.inputSlotNos ?? currentSelection?.inputSlotNo
  );
  const outputSlotNos = normalizeSortingInOutSlotNoList(
    currentSelection?.outputSlotNos ?? currentSelection?.outputSlotNo
  );
  normalizeSortingOutputRuleMap(
    currentSelection?.outputRulesBySlotNo ?? currentSelection?.outputAssignmentsBySlotNo
  );

  return (
    <WarehouseHarvestSlotPanel
      slotCount={facilityStorageHarvestSlotCount}
      slotRows={facilityStorageHarvestSlotRowsWithTargets}
      palletImageSrc={palletItemImageSrc}
      activeFacilityStorageKey={activeFacilityStorageKey}
      storageToneClassName={facilityStorageHarvestSlotToneClassName}
      visibleLayerBySlot={facilityStorageHarvestVisibleLayerBySlot}
      selectedTransportRow={facilityStorageSelectedTransportRow}
      selectedTransportCanMovePallet={facilityStorageSelectedTransportCanMovePallet}
      selectedTransportHasPalletOnDock={facilityStorageSelectedTransportHasPalletOnDock}
      selectedTransportIndividualCarryLimit={facilityStorageSelectedTransportIndividualCarryLimit}
      selectedTransportCanStackPallet={facilityStorageSelectedTransportCanStackPallet}
      openHarvestDetail={openFacilityStorageHarvestDetail}
      editHarvestPalletMemo={editHarvestPalletMemo}
      setVisibleLayerBySlot={setFacilityStorageHarvestVisibleLayerBySlot}
      openHarvestPalletMovePicker={openHarvestPalletMovePicker}
      pickIndividualHarvestBoxToTransport={pickIndividualHarvestBoxToTransport}
      pickIndividualTransportDockHarvestBoxToTransport={pickIndividualTransportDockHarvestBoxToTransport}
      pickIndividualHarvestBoxToSelectedTransportDock={pickIndividualHarvestBoxToSelectedTransportDock}
      openHarvestPalletUnloadPicker={openHarvestPalletUnloadPicker}
      openHarvestPalletLoadPicker={openHarvestPalletLoadPicker}
      harvestMoveActive={Boolean(facilityStorageHarvestMovePicker || facilityStorageActiveHarvestMoveSource)}
      chooseHarvestMoveTarget={requestHarvestMoveTargetFromCarrier}
      pendingHarvestMoveTarget={facilityStorageHarvestMovePicker?.pendingTarget || null}
      movingHarvestPreviewSource={facilityStorageActiveHarvestMoveSource}
      movingHarvestPreviewBoxCount={Math.max(0, Math.floor(Number(facilityStorageHarvestMovePicker?.selectedBoxCount) || 0))}
      movingHarvestPreviewFilledBoxCount={facilityStorageTransportDockInteractionFilledBoxCount}
      movingHarvestPreviewCarriesWholePallet={
        Boolean(facilityStorageActiveHarvestMoveSource)
        && !Boolean(facilityStorageActiveHarvestMoveSource?.sourceBoxCard)
        && String(facilityStorageSelectedTransportMode || 'pallet') !== 'individual'
      }
      selectedTransportMode={facilityStorageSelectedTransportMode}
      harvestBoxesPerPallet={harvestBoxesPerPallet}
      harvestPalletDisplayBoxIndexOf={harvestPalletDisplayBoxIndexOf}
      harvestPalletBoxFilledAt={harvestPalletBoxFilledAt}
      harvestPalletVisibleFilledSlotsAfterPreview={harvestPalletVisibleFilledSlotsAfterPreview}
      harvestPalletBoxToneAt={harvestPalletBoxToneAt}
      harvestBoxTooltipBySlot={facilityStorageHarvestBoxTooltipBySlot}
      renderSlotOverlayBadges={renderWorkbenchInOutSlotBadgeChips}
      alwaysShowSlotManualContent
      renderSlotManualContent={(slot) => {
        const slotNo = Math.max(0, Math.floor(Number(slot?.slotNo) || 0));
        if (slot?.hasTopLayer) return null;
        const isInputSelected = inputSlotNos.includes(slotNo);
        const isOutputSelected = outputSlotNos.includes(slotNo);
        const isOccupiedByOther = hasOtherFacilityInOutOwner(
          facilityKey,
          slotNo,
          'sorting',
          equipmentStorageKey
        );
        if (isOccupiedByOther && !isInputSelected && !isOutputSelected) return null;
        return (
          <div className="warehouse-workbench-inout-slot-actions">
            <div className="warehouse-workbench-inout-slot-actions__buttons">
              <button
                type="button"
                className={`button button--compact facility-workbench-install-button warehouse-workbench-inout-slot-actions__button warehouse-workbench-inout-slot-actions__button--input ${
                  isInputSelected ? 'is-selected' : ''
                }`.trim()}
                aria-pressed={isInputSelected}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSortingInOutSlotSelection('input', slotNo);
                }}
              >
                {isInputSelected ? '투입취소' : '투입선택'}
              </button>
              <button
                type="button"
                className={`button button--compact facility-workbench-install-button warehouse-workbench-inout-slot-actions__button warehouse-workbench-inout-slot-actions__button--output ${
                  isOutputSelected ? 'is-selected' : ''
                }`.trim()}
                aria-pressed={isOutputSelected}
                onClick={(event) => {
                  event.stopPropagation();
                  openSortingOutputRulePicker(slotNo);
                }}
              >
                {isOutputSelected ? '배출수정' : '배출선택'}
              </button>
              {isOutputSelected ? (
                <button
                  type="button"
                  className="button button--compact facility-workbench-install-button warehouse-workbench-inout-slot-actions__button warehouse-workbench-inout-slot-actions__button--output is-selected"
                  onClick={(event) => {
                    event.stopPropagation();
                    clearSortingOutputRule(slotNo);
                  }}
                >
                  배출취소
                </button>
              ) : null}
            </div>
          </div>
        );
      }}
    />
  );
}

export function SortingOutputRulePickerBody({
  facilityStorageSortingOutputRulePicker,
  resolveSortingTaskContext,
  game,
  sortingOutputRuleLabelOf,
  normalizeHarvestGradeLabel,
  processGradeLabel,
  sortingOutputRuleOptions,
  sortingMixedOutputRule,
  selectSortingOutputRuleGrade,
  selectSortingOutputRule,
  closeSortingOutputRulePicker,
  clearSortingOutputRule,
  qualityStateText,
  clamp,
}) {
  if (!facilityStorageSortingOutputRulePicker) return null;
  const pickerFacilityKey = String(facilityStorageSortingOutputRulePicker.facilityKey || '');
  const pickerEquipmentStorageKey = String(facilityStorageSortingOutputRulePicker.equipmentStorageKey || '');
  const pickerContext = (pickerFacilityKey && pickerEquipmentStorageKey)
    ? resolveSortingTaskContext(game, pickerFacilityKey, pickerEquipmentStorageKey)
    : null;
  const currentRuleLabel = sortingOutputRuleLabelOf(facilityStorageSortingOutputRulePicker.currentRule);
  const selectedGradeLabel = String(
    facilityStorageSortingOutputRulePicker.selectedGradeLabel
    || facilityStorageSortingOutputRulePicker.currentRule?.gradeLabel
    || 'A급'
  );
  const gradeOptions = ['A급', 'B급', processGradeLabel];
  const dieOptions = sortingOutputRuleOptions.filter((rule) => (
    normalizeHarvestGradeLabel(rule.gradeLabel) === selectedGradeLabel
  ));
  const selectedSourceEntries = Array.isArray(pickerContext?.selectedSourceEntries)
    ? pickerContext.selectedSourceEntries
    : [];

  return (
    <>
      <div className="confirm-modal__title">어떤 급 어떤 다이를 배출할까요?</div>
      <div className="confirm-modal__desc">
        {`${String(facilityStorageSortingOutputRulePicker.equipmentName || '선별기')}의 ${Math.max(0, Number(facilityStorageSortingOutputRulePicker.slotNo) || 0)}번 적재칸에 나갈 선별 결과를 고르세요.`}
      </div>
      <OutputSourceSummary
        selectedSourceEntries={selectedSourceEntries}
        normalizeHarvestGradeLabel={normalizeHarvestGradeLabel}
        processGradeLabel={processGradeLabel}
        qualityStateText={qualityStateText}
        clamp={clamp}
        prefix="sorting"
      />
      {currentRuleLabel ? (
        <div className="sorting-output-rule-picker__current">
          {`현재 설정: ${currentRuleLabel}`}
        </div>
      ) : null}
      <div className="sorting-output-rule-picker__section">
        <div className="sorting-output-rule-picker__section-title">혼합배출칸</div>
        <button
          type="button"
          className={`sorting-output-rule-picker__option sorting-output-rule-picker__option--mixed ${
            String(facilityStorageSortingOutputRulePicker.currentRule?.ruleType || '') === 'mixed' ? 'is-selected' : ''
          }`.trim()}
          onClick={() => selectSortingOutputRule(sortingMixedOutputRule)}
        >
          <strong>혼합배출칸</strong>
          <span>급·다이 상관없이 적재</span>
        </button>
      </div>
      <div className="sorting-output-rule-picker__section">
        <div className="sorting-output-rule-picker__section-title">급선택</div>
        <div className="sorting-output-rule-picker__grade-grid">
          {gradeOptions.map((gradeLabel) => {
            const isSelected = selectedGradeLabel === gradeLabel;
            return (
              <button
                key={gradeLabel}
                type="button"
                className={`sorting-output-rule-picker__option sorting-output-rule-picker__option--grade ${isSelected ? 'is-selected' : ''}`.trim()}
                onClick={() => selectSortingOutputRuleGrade(gradeLabel)}
              >
                <strong>{gradeLabel}</strong>
              </button>
            );
          })}
        </div>
      </div>
      <div className="sorting-output-rule-picker__section">
        <div className="sorting-output-rule-picker__section-title">다이선택</div>
        <div className="sorting-output-rule-picker__grid">
          {dieOptions.map((rule) => {
            const optionKey = `${normalizeHarvestGradeLabel(rule.gradeLabel)}:${String(rule.dieKey || '')}`;
            const isSelected = normalizeHarvestGradeLabel(facilityStorageSortingOutputRulePicker.currentRule?.gradeLabel) === normalizeHarvestGradeLabel(rule.gradeLabel)
              && String(facilityStorageSortingOutputRulePicker.currentRule?.dieKey || '') === String(rule.dieKey || '');
            return (
              <button
                key={optionKey}
                type="button"
                className={`sorting-output-rule-picker__option sorting-output-rule-picker__option--die ${isSelected ? 'is-selected' : ''}`.trim()}
                onClick={() => selectSortingOutputRule(rule)}
              >
                <strong>{String(rule.sizeLabel || '')}</strong>
                <span>{selectedGradeLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="footer-actions">
        <button className="button button--ghost" type="button" onClick={closeSortingOutputRulePicker}>닫기</button>
        {facilityStorageSortingOutputRulePicker.currentRule ? (
          <button className="button button--danger" type="button" onClick={() => clearSortingOutputRule()}>
            배출취소
          </button>
        ) : null}
      </div>
    </>
  );
}

export function WorkbenchOutputRulePickerBody({
  facilityStorageWorkbenchOutputRulePicker,
  resolveWorkbenchTaskContext,
  game,
  workbenchOutputRuleLabelOf,
  normalizeHarvestGradeLabel,
  processGradeLabel,
  workbenchMixedOutputRule,
  selectWorkbenchOutputRule,
  closeWorkbenchOutputRulePicker,
  clearWorkbenchOutputRule,
  qualityStateText,
  clamp,
}) {
  if (!facilityStorageWorkbenchOutputRulePicker) return null;
  const pickerFacilityKey = String(facilityStorageWorkbenchOutputRulePicker.facilityKey || '');
  const pickerWorkbenchSlotKey = String(facilityStorageWorkbenchOutputRulePicker.workbenchSlotKey || '');
  const pickerContext = (pickerFacilityKey && pickerWorkbenchSlotKey)
    ? resolveWorkbenchTaskContext(game, pickerFacilityKey, pickerWorkbenchSlotKey)
    : null;
  const currentRuleLabel = workbenchOutputRuleLabelOf(facilityStorageWorkbenchOutputRulePicker.currentRule);
  const gradeOptions = ['A급', 'B급', processGradeLabel];
  const selectedSourceEntries = Array.isArray(pickerContext?.selectedSourceEntries)
    ? pickerContext.selectedSourceEntries
    : [];

  return (
    <>
      <div className="confirm-modal__title">어떤 급을 배출할까요?</div>
      <div className="confirm-modal__desc">
        {`${String(facilityStorageWorkbenchOutputRulePicker.workbenchName || '작업대')}의 ${Math.max(0, Number(facilityStorageWorkbenchOutputRulePicker.slotNo) || 0)}번 적재칸에 나갈 급을 고르세요.`}
      </div>
      <OutputSourceSummary
        selectedSourceEntries={selectedSourceEntries}
        normalizeHarvestGradeLabel={normalizeHarvestGradeLabel}
        processGradeLabel={processGradeLabel}
        qualityStateText={qualityStateText}
        clamp={clamp}
        prefix="workbench"
      />
      {currentRuleLabel ? (
        <div className="sorting-output-rule-picker__current">
          {`현재 설정: ${currentRuleLabel}`}
        </div>
      ) : null}
      <div className="sorting-output-rule-picker__section">
        <div className="sorting-output-rule-picker__section-title">혼합배출칸</div>
        <button
          type="button"
          className={`sorting-output-rule-picker__option sorting-output-rule-picker__option--mixed ${
            String(facilityStorageWorkbenchOutputRulePicker.currentRule?.ruleType || '') === 'mixed' ? 'is-selected' : ''
          }`.trim()}
          onClick={() => selectWorkbenchOutputRule(workbenchMixedOutputRule)}
        >
          <strong>혼합배출칸</strong>
          <span>급 상관없이 적재</span>
        </button>
      </div>
      <div className="sorting-output-rule-picker__section">
        <div className="sorting-output-rule-picker__section-title">급선택</div>
        <div className="sorting-output-rule-picker__grid">
          {gradeOptions.map((gradeLabel) => {
            const isSelected = normalizeHarvestGradeLabel(facilityStorageWorkbenchOutputRulePicker.currentRule?.gradeLabel) === gradeLabel
              && String(facilityStorageWorkbenchOutputRulePicker.currentRule?.ruleType || '') !== 'mixed';
            return (
              <button
                key={`workbench-grade-only-${gradeLabel}`}
                type="button"
                className={`sorting-output-rule-picker__option sorting-output-rule-picker__option--grade ${isSelected ? 'is-selected' : ''}`.trim()}
                onClick={() => selectWorkbenchOutputRule({ gradeLabel })}
              >
                <strong>{gradeLabel}</strong>
                <span>해당 급만 적재</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="footer-actions">
        <button className="button button--ghost" type="button" onClick={closeWorkbenchOutputRulePicker}>닫기</button>
        {facilityStorageWorkbenchOutputRulePicker.currentRule ? (
          <button className="button button--danger" type="button" onClick={() => clearWorkbenchOutputRule()}>
            배출취소
          </button>
        ) : null}
      </div>
    </>
  );
}
