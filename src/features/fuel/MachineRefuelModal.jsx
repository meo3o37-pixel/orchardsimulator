import React from 'react';

export default function MachineRefuelModal({
  open,
  closing,
  animating,
  targetName,
  unitNo,
  hasSeparateSprayTank,
  resolvedTankKey,
  onSelectTankKey,
  tankLabel,
  animatedTankLiters,
  tankCapacityLiters,
  animatedTankPercent,
  fuelTypeLabel,
  selectedCan,
  formatLiterText,
  animatedCanLiters,
  availableLiters,
  maxLiters,
  fuelType,
  litersDraft,
  onChangeLitersDraft,
  onOpenCanPicker,
  selectedCanPreviewClassName,
  selectedCanFillRatio,
  selectedCanSizeClass,
  fuelTone,
  tankPreviewContent,
  onConfirm,
  onClose,
  onBackdropClose
}) {
  if (!open) return null;

  return (
    <>
      <div className={`confirm-modal-backdrop confirm-modal-backdrop--fuel-overlay ${closing ? 'is-closing' : ''}`.trim()} onClick={onBackdropClose} />
      <div className={`confirm-modal machine-refuel-modal ${closing ? 'is-closing' : ''}`.trim()}>
        <div className="confirm-modal__title">장비 주유</div>
        <div className="confirm-modal__desc">
          {`${targetName} #${unitNo}`}
        </div>
        {hasSeparateSprayTank ? (
          <div className="slot-picker__tabs" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className={`focus-tab slot-button ${resolvedTankKey === 'drive' ? 'slot-button--selected-outline' : ''}`}
              onClick={() => onSelectTankKey('drive')}
              disabled={animating}
            >
              <strong>주행 엔진</strong>
            </button>
            <button
              type="button"
              className={`focus-tab slot-button ${resolvedTankKey === 'spray' ? 'slot-button--selected-outline' : ''}`}
              onClick={() => onSelectTankKey('spray')}
              disabled={animating}
            >
              <strong>송풍 엔진</strong>
            </button>
          </div>
        ) : null}
        <div className="machine-refuel-modal__stats">
          <div className="machine-refuel-modal__line">
            <span>{tankLabel}</span>
            <strong>{`${animatedTankLiters.toFixed(1)}L / ${tankCapacityLiters.toFixed(1)}L (${animatedTankPercent.toFixed(0)}%)`}</strong>
          </div>
          <div className="machine-refuel-modal__line">
            <span>연료 종류</span>
            <strong>{fuelTypeLabel}</strong>
          </div>
          <div className="machine-refuel-modal__line">
            <span>{selectedCan ? '선택 말통 연료' : '보유 연료'}</span>
            <strong>{`${formatLiterText(selectedCan ? animatedCanLiters : availableLiters)}L`}</strong>
          </div>
          <div className="machine-refuel-modal__line">
            <span>주유 가능</span>
            <strong>{`${formatLiterText(maxLiters)}L`}</strong>
          </div>
        </div>
        <div className={`machine-refuel-modal__bar ${fuelType === 'gasoline' ? 'is-gasoline' : (fuelType === 'kerosene' ? 'is-kerosene' : 'is-diesel')}`.trim()}>
          <span style={{ width: `${animatedTankPercent}%` }} />
        </div>
        <div className="machine-refuel-modal__input">
          <label className="field-label">주유 리터</label>
          <div className="machine-refuel-modal__input-row">
            <input
              className="text-input"
              type="number"
              min={0.01}
              step={0.01}
              max={maxLiters || 0.01}
              value={litersDraft}
              onChange={(e) => onChangeLitersDraft(e.target.value)}
              disabled={maxLiters <= 0 || animating}
            />
            <span>L</span>
          </div>
          <div className="machine-refuel-modal__can-row">
            <button
              type="button"
              className="machine-refuel-modal__can-chip machine-refuel-modal__can-chip--button"
              onClick={onOpenCanPicker}
              disabled={animating}
            >
              {selectedCan ? (
                <div className={`machine-refuel-modal__can-preview ${selectedCanPreviewClassName}`.trim()}>
                  <div className={`fuel-jerrycan fuel-jerrycan--${fuelTone} ${selectedCanSizeClass}`.trim()}>
                    <div className="fuel-jerrycan__spout" />
                    <div className="fuel-jerrycan__handle" />
                    <div className="fuel-jerrycan__cap" />
                    <div className="fuel-jerrycan__body">
                      <div
                        className="fuel-kiosk-fill-anim__liquid"
                        style={{ '--fuel-fill-ratio': `${selectedCanFillRatio}` }}
                      />
                      <div className="fuel-jerrycan__panel" />
                      <div className="fuel-jerrycan__cross fuel-jerrycan__cross--a" />
                      <div className="fuel-jerrycan__cross fuel-jerrycan__cross--b" />
                    </div>
                  </div>
                  <span>{`${selectedCan.label} · ${selectedCan.sourceTitle}`}</span>
                </div>
              ) : '말통 미선택'}
            </button>
            <div className="machine-refuel-modal__tank-chip">
              {tankPreviewContent}
            </div>
          </div>
        </div>
        <div className="footer-actions">
          <button
            className="button button--primary"
            onClick={onConfirm}
            disabled={!selectedCan || maxLiters <= 0 || animating}
            title={!selectedCan ? '말통을 먼저 선택해 주세요.' : (maxLiters <= 0 ? '주유 가능한 연료가 없습니다.' : '')}
          >
            {animating ? '주유중...' : '주유'}
          </button>
          <button className="button button--ghost" onClick={onClose} disabled={animating}>닫기</button>
        </div>
      </div>
    </>
  );
}
