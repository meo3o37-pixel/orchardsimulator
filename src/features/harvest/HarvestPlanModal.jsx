import React from 'react';
import HarvestPendingBoxesPanel from './HarvestPendingBoxesPanel';

const isAppleCrateKey = (key = '') => /appleContainer/i.test(String(key || ''));
const appleCrateToneOf = (key = '') => (/green/i.test(String(key || '')) ? 'green' : 'yellow');

function AppleCratePreview({ tone = 'yellow' }) {
  return (
    <div className={`apple-crate-preview apple-crate-preview--${tone}`}>
      <div className="apple-crate-preview__model">
        <div className="apple-crate-preview__inner-top" />
        <div className="apple-crate-preview__handle apple-crate-preview__handle--1" />
        <div className="apple-crate-preview__handle apple-crate-preview__handle--2" />
        <div className="apple-crate-preview__handle apple-crate-preview__handle--3" />
        <div className="apple-crate-preview__handle apple-crate-preview__handle--4" />
        <div className="apple-crate-preview__handle apple-crate-preview__handle--5" />
        <div className="apple-crate-preview__bar apple-crate-preview__bar--1" />
        <div className="apple-crate-preview__bar apple-crate-preview__bar--2" />
        <div className="apple-crate-preview__bar apple-crate-preview__bar--3" />
        <div className="apple-crate-preview__grid-area">
          <div className="apple-crate-preview__col">
            <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
            <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
            <div className="apple-crate-preview__mesh" />
          </div>
          <div className="apple-crate-preview__col">
            <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
            <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
            <div className="apple-crate-preview__mesh" />
          </div>
          <div className="apple-crate-preview__col" />
          <div className="apple-crate-preview__col">
            <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
            <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
            <div className="apple-crate-preview__mesh" />
          </div>
          <div className="apple-crate-preview__col">
            <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
            <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
            <div className="apple-crate-preview__mesh" />
          </div>
        </div>
        <div className="apple-crate-preview__center-panel" />
        <div className="apple-crate-preview__bottom-row">
          <div className="apple-crate-preview__bottom-cell" />
          <div className="apple-crate-preview__bottom-cell" />
          <div className="apple-crate-preview__bottom-cell" />
          <div className="apple-crate-preview__bottom-cell" />
          <div className="apple-crate-preview__bottom-cell" />
          <div className="apple-crate-preview__bottom-cell" />
        </div>
        <div className="apple-crate-preview__side-frame apple-crate-preview__side-frame--left" />
        <div className="apple-crate-preview__side-frame apple-crate-preview__side-frame--right" />
        <div className="apple-crate-preview__corner apple-crate-preview__corner--1" />
        <div className="apple-crate-preview__corner apple-crate-preview__corner--2" />
      </div>
    </div>
  );
}

function LoadBoxSidePanel({
  side = 'right',
  stockOptions = [],
  appliedOptions = [],
  selectedIds = [],
  selectionIdOf,
  onToggleOption,
  getOptionImageSrc,
  isClosing = false
}) {
  const renderOptionVisual = (option) => {
    const imageSrc = getOptionImageSrc ? getOptionImageSrc(option) : '';
    if (imageSrc) {
      return (
        <div className="harvest-loadbox-thumb" aria-hidden="true">
          <img src={imageSrc} alt={option.label} />
        </div>
      );
    }
    if (isAppleCrateKey(option?.key)) {
      return (
        <div className="harvest-loadbox-thumb harvest-loadbox-thumb--crate" aria-hidden="true">
          <AppleCratePreview tone={appleCrateToneOf(option?.key)} />
        </div>
      );
    }
    return (
      <div className="harvest-loadbox-thumb" aria-hidden="true">
        <span>박스</span>
      </div>
    );
  };

  const renderOptionCard = (option, sourceLabel) => {
    const selectionId = selectionIdOf ? selectionIdOf(option) : `${option.key}:${option.sourceType}`;
    const isSelected = selectedIds.includes(selectionId);
    return (
      <button
        key={`harvest-load-box-side-${selectionId}`}
        type="button"
        className={`option-card age-task-equip-card harvest-loadbox-card ${isSelected ? 'age-task-equip-card--active' : ''}`.trim()}
        onClick={() => onToggleOption?.(option)}
      >
        <div className="harvest-loadbox-card__content">
          {renderOptionVisual(option)}
          <div className="harvest-loadbox-card__copy">
            <div className="harvest-loadbox-card__top">
              <strong className="harvest-loadbox-card__title">{option.label}</strong>
              <span className="harvest-loadbox-card__qty">{`보유 ${option.qty}개`}</span>
            </div>
            <div className="harvest-loadbox-card__meta">{sourceLabel}</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={`confirm-modal confirm-modal--harvest-pending-side confirm-modal--harvest-loadbox-side confirm-modal--harvest-loadbox-side--${side} ${isClosing ? 'is-closing' : ''}`.trim()}>
      <div className="confirm-modal__title">적재박스 선택</div>
      <div className="confirm-modal__desc">수확물 적재에 사용할 박스를 선택합니다.</div>
      <div className="harvest-loadbox-side__body">
        {stockOptions.length ? (
          <section className="harvest-loadbox-side__section">
            <div className="harvest-loadbox-side__heading">창고/차량</div>
            <div className="option-grid age-task-equip-grid harvest-loadbox-grid harvest-loadbox-side__grid">
              {stockOptions.map((option) => renderOptionCard(
                option,
                `창고 ${option.warehouseQty}개 / 차량 ${option.parkedCargoQty}개`
              ))}
            </div>
          </section>
        ) : null}
        <section className="harvest-loadbox-side__section">
          <div className="harvest-loadbox-side__heading">토지에 놓인 상자</div>
          {appliedOptions.length ? (
            <div className="option-grid age-task-equip-grid harvest-loadbox-grid harvest-loadbox-side__grid">
              {appliedOptions.map((option) => renderOptionCard(
                option,
                `현재 토지 배치 ${Math.max(0, Number(option.appliedQty) || 0)}개`
              ))}
            </div>
          ) : (
            <div className="meter__hint">현재 토지에 놓인 상자가 없습니다.</div>
          )}
        </section>
        {!stockOptions.length && !appliedOptions.length ? (
          <div className="meter__hint">보유 중인 적재박스가 없습니다.</div>
        ) : null}
      </div>
    </div>
  );
}

function PendingBoxesPanel({ side = 'right', pendingLoadSummary, pendingLoadLabel, pendingLoadHint, pendingLoadImageSrc, pendingLoadImageItemKey, isClosing = false }) {
  return (
    <div className={`confirm-modal confirm-modal--harvest-pending-side confirm-modal--harvest-pending-side--${side} ${isClosing ? 'is-closing' : ''}`.trim()}>
      <div className="confirm-modal__title">토지에 놓인 수확물</div>
      <div className="confirm-modal__desc">{pendingLoadHint}</div>
      <HarvestPendingBoxesPanel
        title="대기 박스 목록"
        pendingLoadSummary={pendingLoadSummary}
        pendingLoadLabel={pendingLoadLabel}
        pendingLoadImageSrc={pendingLoadImageSrc}
        pendingLoadImageItemKey={pendingLoadImageItemKey}
        emptyText="현재 운반 대기 박스가 없습니다."
        panelClassName="harvest-plan-pending-panel--modal harvest-bottom-pending-panel"
      />
    </div>
  );
}

export default function HarvestPlanModal({
  isOpen,
  isClosing = false,
  onClose,
  titleDesc,
  selectedTargetLabel,
  onOpenTargetModal,
  selfLaborGaugeText,
  selfLaborGaugePercent,
  externalLaborGaugeText,
  externalLaborRatio,
  projectedQtyText,
  projectedQtyHint,
  averageFruitLoadText,
  averageFruitLoadHint,
  qualityText,
  qualityHint,
  pendingLoadSummary,
  pendingLoadLabel,
  pendingLoadHint,
  pendingLoadImageSrc,
  pendingLoadImageItemKey,
  stockLoadBoxOptions,
  appliedLoadBoxOptions,
  selectedLoadBoxIds,
  selectionIdOf,
  onToggleLoadBoxOption,
  getLoadBoxImageSrc,
  harvestDonePct,
  harvestStageProgress,
  harvestDoneQty,
  harvestTotalSeasonQty,
  harvestRemainingQty,
  harvestThisRunQty,
  harvestTargetCompleted,
  showUpperPhaseHint,
  selectedLoadBoxLabel,
  onOpenLoadBoxModal,
  harvestLaborSummaryText,
  harvestAssignedWorkerCards = [],
  onOpenLaborModal,
  harvestPlanUseSelfLabor,
  harvestEffectiveSelfLabor,
  harvestSelfLaborSliderMax,
  harvestSelectedExternalHeadcount,
  harvestEffectiveExternalLabor,
  harvestSelectedExternalLaborCap,
  harvestExternalLaborSliderMax,
  onChangeInlineSelfLabor,
  onChangeInlineExternalLabor,
  onShowBreakdown,
  lowerExecuteBlockedReason,
  upperExecuteBlockedReason,
  harvestExecuteSubmitting = false,
  onExecuteLower,
  onExecuteUpper,
  lowerRunQty,
  upperRunQty
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className={`confirm-modal-backdrop ${isClosing ? 'is-closing' : ''}`.trim()} onClick={onClose} />
      <div
        className={`harvest-plan-modal-cluster ${isClosing ? 'is-closing' : ''}`.trim()}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div className={`confirm-modal confirm-modal--harvest-pending-side confirm-modal--harvest-pending-side--left confirm-modal--harvest-side-action ${isClosing ? 'is-closing' : ''}`.trim()}>
          <button type="button" className="button button--ghost harvest-plan-picker-button harvest-plan-side-action-button" onClick={onOpenLaborModal}>
            <span>투입인력 및 장비선택</span>
            <strong>{harvestLaborSummaryText}</strong>
            <span className="harvest-plan-side-action-button__arrow" aria-hidden="true">›</span>
          </button>
          <div className="harvest-plan-assigned-worker-grid">
            {harvestAssignedWorkerCards.length ? (
              harvestAssignedWorkerCards.map((worker) => (
                <div key={`harvest-plan-assigned-worker-${worker.id}`} className="harvest-plan-assigned-worker-card">
                  <div className="harvest-plan-assigned-worker-card__icon" aria-hidden="true">{worker.icon}</div>
                  <div className="harvest-plan-assigned-worker-card__name">{worker.name}</div>
                  {worker.statusLabel ? (
                    <div className="harvest-plan-assigned-worker-card__status">{worker.statusLabel}</div>
                  ) : null}
                  {worker.assignedCards?.length ? (
                    <div className="harvest-plan-assigned-worker-card__equipment" aria-label="선택한 장비">
                      {worker.assignedCards.map((card) => (
                        card.imageSrc ? (
                          <span
                            key={`harvest-plan-assigned-worker-equip-${worker.id}-${card.tokenId}`}
                            className="harvest-plan-assigned-worker-card__equipment-icon"
                            title={card.label}
                          >
                            <img src={card.imageSrc} alt={card.label} />
                          </span>
                        ) : null
                      ))}
                    </div>
                  ) : null}
                  <div className="harvest-plan-assigned-worker-card__meta">{worker.meta}</div>
                </div>
              ))
            ) : (
              <div className="harvest-plan-assigned-worker-grid__empty">배정된 인원이 없습니다.</div>
            )}
          </div>
        </div>
        <LoadBoxSidePanel
          side="right"
          stockOptions={stockLoadBoxOptions}
          appliedOptions={appliedLoadBoxOptions}
          selectedIds={selectedLoadBoxIds}
          selectionIdOf={selectionIdOf}
          onToggleOption={onToggleLoadBoxOption}
          getOptionImageSrc={getLoadBoxImageSrc}
          isClosing={isClosing}
        />
        <div className={`confirm-modal confirm-modal--harvest-plan ${isClosing ? 'is-closing' : ''}`.trim()}>
          <div className="harvest-plan-topbar">
            <div className="harvest-plan-topbar__title">
              <div className="confirm-modal__title">수확</div>
            </div>
            <div className="harvest-plan-topbar__crop-slot">
              <div className="harvest-plan-topbar__crop">
              <button
                type="button"
                className="button button--ghost harvest-plan-picker-button harvest-plan-crop-line harvest-plan-crop-button"
                aria-label="수확 대상과 발생 수령을 선택"
                onClick={onOpenTargetModal}
              >
                <span className="harvest-plan-crop-button__label">{selectedTargetLabel}</span>
                <span className="harvest-plan-crop-button__arrow" aria-hidden="true">▾</span>
              </button>
              </div>
            </div>
          </div>
          <div className="harvest-plan-summary-grid">
            <div className="harvest-plan-summary-card">
              <span>선택 대상 예상 수확량</span>
              <strong>{projectedQtyText}</strong>
              <small>{projectedQtyHint}</small>
            </div>
            <div className="harvest-plan-summary-card">
              <span>선택 년생 평균 착과량</span>
              <strong>{averageFruitLoadText}</strong>
              <small>{averageFruitLoadHint}</small>
            </div>
            <div className="harvest-plan-summary-card">
              <span>선택 품질</span>
              <strong>{qualityText}</strong>
              <small>{qualityHint}</small>
            </div>
          </div>
          <div className="harvest-plan-progress">
            <div className="harvest-plan-progress__top">
              <span>수확 진행률</span>
              <strong>{harvestDonePct.toFixed(1)}%</strong>
            </div>
            <div className="harvest-plan-progress__stage">
              <div className="harvest-plan-progress__stage-top">
                <span>하단 작업</span>
                <strong>{harvestStageProgress.lowerProgressPct.toFixed(1)}%</strong>
              </div>
              <div className="harvest-plan-progress__track" aria-hidden="true">
                <div className="harvest-plan-progress__fill" style={{ width: `${harvestStageProgress.lowerProgressPct}%` }} />
              </div>
              <div className="harvest-plan-progress__meta">
                <span>실적 {Math.round(harvestStageProgress.lowerHarvestedQty).toLocaleString()} / 총 {Math.round(harvestStageProgress.lowerTotalQty).toLocaleString()}kg</span>
                <span>잔여 {Math.round(harvestStageProgress.lowerRemainingQty).toLocaleString()}kg</span>
                <span>무장비 인원 작업 구간</span>
              </div>
            </div>
            <div className="harvest-plan-progress__stage">
              <div className="harvest-plan-progress__stage-top">
                <span>상단 작업</span>
                <strong>{harvestStageProgress.upperProgressPct.toFixed(1)}%</strong>
              </div>
              <div className="harvest-plan-progress__track" aria-hidden="true">
                <div className="harvest-plan-progress__fill harvest-plan-progress__fill--upper" style={{ width: `${harvestStageProgress.upperProgressPct}%` }} />
              </div>
              <div className="harvest-plan-progress__meta">
                <span>실적 {Math.round(harvestStageProgress.upperHarvestedQty).toLocaleString()} / 총 {Math.round(harvestStageProgress.upperTotalQty).toLocaleString()}kg</span>
                <span>잔여 {Math.round(harvestStageProgress.upperRemainingQty).toLocaleString()}kg</span>
                <span>사다리 고소작업차 배정 인원만 작업</span>
              </div>
            </div>
            <div className="harvest-plan-progress__meta">
              <span>전체 실적 {harvestDoneQty.toLocaleString()} / 총 {harvestTotalSeasonQty.toLocaleString()}kg</span>
              <span>잔여 미수확량 {harvestRemainingQty.toLocaleString()}kg</span>
              <span>이번 작업 예상 {Math.round(harvestThisRunQty).toLocaleString()}kg</span>
              {harvestTargetCompleted ? <span>이 대상은 이미 수확 완료되었습니다.</span> : null}
              {showUpperPhaseHint ? <span>현재는 상단 작업 단계로 장비 배정 인원 노동력만 반영됩니다.</span> : null}
            </div>
          </div>
          <div className="harvest-plan-bottom-dock">
            <div className="harvest-plan-editor">
              <div className="harvest-plan-inline-slider-panel">
                <label className={`harvest-plan-inline-slider ${!harvestPlanUseSelfLabor ? 'harvest-plan-inline-slider--inactive' : ''}`}>
                  <div className="harvest-plan-inline-slider__top">
                    <strong>자가노동력 투입량</strong>
                    <span>{`${harvestEffectiveSelfLabor}/${harvestSelfLaborSliderMax}`}</span>
                  </div>
                  <input
                    className="control-slider"
                    type="range"
                    min={0}
                    max={harvestSelfLaborSliderMax}
                    step={1}
                    value={harvestEffectiveSelfLabor}
                    onChange={(e) => onChangeInlineSelfLabor(Number(e.target.value) || 0)}
                  />
                </label>
                <label className={`harvest-plan-inline-slider ${harvestSelectedExternalHeadcount <= 0 ? 'harvest-plan-inline-slider--inactive' : ''}`}>
                  <div className="harvest-plan-inline-slider__top">
                    <strong>선택한 외부인력 노동력 투입량</strong>
                    <span>{`${harvestEffectiveExternalLabor}/${harvestSelectedExternalLaborCap}`}</span>
                  </div>
                  {harvestSelectedExternalHeadcount > 0 && harvestSelectedExternalLaborCap > harvestExternalLaborSliderMax ? (
                    <div className="meter__hint">{`현재 작업 최대 투입 가능 ${harvestExternalLaborSliderMax}`}</div>
                  ) : null}
                  <input
                    className="control-slider"
                    type="range"
                    min={0}
                    max={harvestExternalLaborSliderMax}
                    step={1}
                    value={harvestEffectiveExternalLabor}
                    disabled={harvestSelectedExternalHeadcount <= 0}
                    onChange={(e) => onChangeInlineExternalLabor(Number(e.target.value) || 0)}
                  />
                </label>
              </div>
            </div>
            <div className="footer-actions">
              <button type="button" className="button button--ghost button--compact" onClick={onShowBreakdown}>산출식</button>
              <button
                type="button"
                className="button button--primary"
                disabled={Boolean(lowerExecuteBlockedReason) || harvestExecuteSubmitting}
                title={harvestExecuteSubmitting ? '수확 실행 중입니다.' : lowerExecuteBlockedReason}
                onClick={() => onExecuteLower?.()}
              >
                {`하단 수확 실행 (${Math.round(lowerRunQty).toLocaleString()}kg)`}
              </button>
              <button
                type="button"
                className="button button--primary"
                disabled={Boolean(upperExecuteBlockedReason) || harvestExecuteSubmitting}
                title={harvestExecuteSubmitting ? '수확 실행 중입니다.' : upperExecuteBlockedReason}
                onClick={() => onExecuteUpper?.()}
              >
                {`상단 수확 실행 (${Math.round(upperRunQty).toLocaleString()}kg)`}
              </button>
              <button type="button" className="button button--ghost harvest-plan-footer-close" onClick={onClose}>닫기</button>
            </div>
          </div>
        </div>
        <PendingBoxesPanel
          side="bottom"
          pendingLoadSummary={pendingLoadSummary}
          pendingLoadLabel={pendingLoadLabel}
          pendingLoadHint={pendingLoadHint}
          pendingLoadImageSrc={pendingLoadImageSrc}
          pendingLoadImageItemKey={pendingLoadImageItemKey}
          isClosing={isClosing}
        />
      </div>
    </>
  );
}
