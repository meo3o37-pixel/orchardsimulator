import React from 'react';

export default function HarvestTargetPickerModal({
  isOpen,
  options,
  selectedCropId,
  selectedAgeYear,
  onSelect,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="confirm-modal-backdrop" onClick={onClose} />
      <div className="confirm-modal confirm-modal--harvest-picker confirm-modal--harvest-target-picker">
        <div className="confirm-modal__title">수확 대상 선택</div>
        <div className="confirm-modal__desc">품종과 년생을 함께 골라서 해당 묶음만 수확합니다.</div>
        <div className="harvest-plan-picker-body harvest-plan-picker-body--target">
          {options.length ? (
            <div className="option-grid age-task-equip-grid harvest-target-grid">
              {options.map((option) => {
                const isSelected =
                  String(option?.cropId || '') === String(selectedCropId || '')
                  && Math.max(1, Math.floor(Number(option?.ageYear) || 1)) === Math.max(0, Math.floor(Number(selectedAgeYear) || 0));
                const isCompleted = Boolean(option?.isCompleted);
                return (
                  <button
                    key={`harvest-target-option-${option.key}`}
                    type="button"
                    className={`option-card age-task-equip-card ${isSelected ? 'age-task-equip-card--active' : ''}`}
                    onClick={() => onSelect(option)}
                  >
                    <div className="option-card__row">
                      <strong>{option.label}</strong>
                      <span>{isCompleted ? '수확 완료' : `${Math.round(option.remainingQtyKg).toLocaleString()}kg`}</span>
                    </div>
                    <div className="option-card__meta">
                      {isCompleted
                        ? `생존 ${Math.max(0, Number(option.aliveTrees) || 0)}주 / 해당 년생 수확 완료`
                        : `생존 ${Math.max(0, Number(option.aliveTrees) || 0)}주 / 평균 착과 ${Number(option.avgFruitLoadPerTree || 0).toFixed(1)}개/주`}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="meter__hint" style={{ marginTop: 8 }}>표시할 품종/년생 묶음이 없습니다.</div>
          )}
        </div>
        <div className="footer-actions">
          <button className="button button--primary" onClick={onClose}>확인</button>
          <button className="button button--ghost" onClick={onClose}>닫기</button>
        </div>
      </div>
    </>
  );
}
