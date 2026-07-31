import React from 'react';

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

export default function HarvestLoadBoxModal({
  isOpen,
  stockOptions,
  appliedOptions,
  selectedIds,
  selectionIdOf,
  onToggleOption,
  onClose,
  onConfirm,
  getOptionImageSrc,
  modalClassName = ''
}) {
  if (!isOpen) return null;

  const hasAnyOption = stockOptions.length || appliedOptions.length;

  const renderOptionVisual = (option) => {
    if (isAppleCrateKey(option?.key)) {
      return (
        <div className="harvest-loadbox-thumb harvest-loadbox-thumb--crate" aria-hidden="true">
          <AppleCratePreview tone={appleCrateToneOf(option?.key)} />
        </div>
      );
    }
    const imageSrc = getOptionImageSrc ? getOptionImageSrc(option) : '';
    return (
      <div className="harvest-loadbox-thumb" aria-hidden="true">
        {imageSrc ? <img src={imageSrc} alt={option.label} /> : <span>박스</span>}
      </div>
    );
  };

  const renderOptionCard = (option, sourceLabel) => {
    const isSelected = selectedIds.includes(selectionIdOf(option));
    return (
      <button
        key={`harvest-load-box-modal-${option.key}-${option.sourceType}`}
        type="button"
        className={`option-card age-task-equip-card harvest-loadbox-card ${isSelected ? 'age-task-equip-card--active' : ''}`}
        onClick={() => onToggleOption(option)}
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
    <>
      <div className="confirm-modal-backdrop" onClick={onClose} />
      <div className={`confirm-modal confirm-modal--harvest-picker ${String(modalClassName || '').trim()}`.trim()}>
        <div className="confirm-modal__title">적재박스 선택</div>
        <div className="confirm-modal__desc">수확물 적재에 사용할 박스를 선택해 주세요.</div>
        <div className="harvest-plan-picker-body">
          {hasAnyOption ? (
            <>
              {stockOptions.length ? (
                <>
                  <div className="meter__hint" style={{ marginBottom: 6 }}>창고/차량</div>
                  <div className="option-grid age-task-equip-grid harvest-loadbox-grid" style={{ marginBottom: 10 }}>
                    {stockOptions.map((option) => renderOptionCard(
                      option,
                      `창고 ${option.warehouseQty}개 / 차량 ${option.parkedCargoQty}개`
                    ))}
                  </div>
                </>
              ) : null}
              {appliedOptions.length ? (
                <>
                  <div className="meter__hint" style={{ marginBottom: 6 }}>현재 도포</div>
                  <div className="option-grid age-task-equip-grid harvest-loadbox-grid">
                    {appliedOptions.map((option) => renderOptionCard(
                      option,
                      `현재 도포 ${Math.max(0, Number(option.appliedQty) || 0)}개`
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="meter__hint">보유 중인 20kg 사과 컨테이너가 없습니다.</div>
          )}
        </div>
        <div className="footer-actions">
          <button className="button button--ghost" onClick={onClose}>닫기</button>
          <button className="button button--primary" onClick={onConfirm}>확인</button>
        </div>
      </div>
    </>
  );
}
