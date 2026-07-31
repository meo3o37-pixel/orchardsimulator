import React from 'react';

export default function TankOptionModal({
  isOpen,
  facility,
  totalCost,
  options,
  selectedOptionKeys,
  lockedOptionKeys = [],
  onToggleOption,
  onConfirm,
  onClose,
  won,
  mode = 'build',
  confirmLabel = '다음 (토지 선택)',
  backdropZIndex = 4312,
  modalZIndex = 4313
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="confirm-modal-backdrop" style={{ zIndex: backdropZIndex }} onClick={onClose} />
      <div className="confirm-modal" style={{ zIndex: modalZIndex }}>
        <div className="confirm-modal__title">물탱크 옵션 선택</div>
        <div className="confirm-modal__desc">
          {mode === 'owned'
            ? `${facility?.name || '물탱크'}에 추가할 옵션을 선택하세요.`
            : `${facility?.name || '물탱크'} 건설 시 추가할 옵션을 선택하세요.`}
          <br />
          {mode === 'owned'
            ? `이미 적용된 옵션은 변경할 수 없습니다. 사후 추가 공정비 반영 총액 ${won(totalCost)}`
            : `옵션 추가 비용은 건설비에 합산되며 총액 ${won(totalCost)} 입니다.`}
        </div>
        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
          {options.map((option) => {
            const locked = lockedOptionKeys.includes(option.key);
            const checked = selectedOptionKeys.includes(option.key) || locked;
            return (
              <label
                key={option.key}
                className="focus-tab slot-button"
                style={{ minHeight: 58, cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.75 : 1 }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={locked}
                    onChange={() => onToggleOption(option.key)}
                  />
                  <strong>{option.name}</strong>
                </span>
                <span>
                  {won(option.price)} · {option.desc}
                  {locked ? ' (이미 적용됨)' : ''}
                </span>
              </label>
            );
          })}
        </div>
        <div className="footer-actions">
          <button
            className="button button--primary"
            onClick={onConfirm}
            disabled={mode === 'owned' && totalCost <= 0}
            title={mode === 'owned' && totalCost <= 0 ? '추가할 옵션을 선택해 주세요.' : ''}
          >
            {confirmLabel}
          </button>
          <button className="button button--ghost" onClick={onClose}>취소</button>
        </div>
      </div>
    </>
  );
}
