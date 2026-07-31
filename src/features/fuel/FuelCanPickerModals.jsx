import React from 'react';

export function MachineRefuelCanPickerModal({
  open,
  fuelTypeLabel,
  sourceSections,
  selectedOptionKey,
  formatLiterTextFixed2,
  onSelectOption,
  onClose
}) {
  if (!open) return null;

  return (
    <>
      <div className="confirm-modal-backdrop confirm-modal-backdrop--fuel-overlay" onClick={onClose} />
      <div className="confirm-modal machine-refuel-can-modal fuel-kiosk-overlay-modal">
        <div className="confirm-modal__title">말통 선택</div>
        <div className="confirm-modal__desc">{`${fuelTypeLabel}가 담긴 말통을 선택해 주세요.`}</div>
        {sourceSections.length ? (
          <div className="machine-refuel-can-modal__sections">
            {sourceSections.map((section) => (
              <section key={`machine-refuel-can-source-${section.key}`} className="machine-refuel-can-modal__section">
                <div className="machine-refuel-can-modal__section-title">{section.title}</div>
                <div className="fuel-kiosk-can-modal__list">
                  {(section.options || []).map((option) => {
                    const isActive = selectedOptionKey === String(option.optionKey || '');
                    return (
                      <button
                        key={`machine-refuel-can-option-${option.optionKey}`}
                        type="button"
                        className={`fuel-kiosk-can-modal__item ${isActive ? 'is-active' : ''}`.trim()}
                        onClick={() => onSelectOption(option)}
                      >
                        <strong>{option.label}</strong>
                        <span>{`${option.qty}개 · ${formatLiterTextFixed2(option.fuelLiters)}L`}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="fuel-kiosk-can-modal__empty">{`${fuelTypeLabel}가 든 말통이 없습니다.`}</div>
        )}
        <div className="footer-actions">
          <button className="button button--ghost" onClick={onClose}>닫기</button>
        </div>
      </div>
    </>
  );
}

export function FuelKioskCanPickerModal({
  open,
  options,
  activeOptionKey,
  onSelectOption,
  onClose
}) {
  if (!open) return null;

  return (
    <>
      <div className="confirm-modal-backdrop confirm-modal-backdrop--fuel-overlay" onClick={onClose} />
      <div className="confirm-modal fuel-kiosk-can-modal fuel-kiosk-overlay-modal">
        <div className="confirm-modal__title">기름 받을 용기 선택</div>
        <div className="confirm-modal__desc">소유 중인 용기 중에서 주유받을 곳을 선택해 주세요.</div>
        <div className="fuel-kiosk-can-modal__list">
          {options.length ? (
            options.map((option) => (
              <button
                key={`fuel-kiosk-can-option-${option.optionKey || option.key}`}
                type="button"
                className={`fuel-kiosk-can-modal__item ${activeOptionKey === (option.optionKey || option.key) ? 'is-active' : ''}`.trim()}
                onClick={() => onSelectOption(option)}
              >
                <strong>{option.displayLabel || option.label}</strong>
                <span>{`${option.qty}개 보유 · 남은 ${option.storableRemain}L`}</span>
              </button>
            ))
          ) : (
            <div className="fuel-kiosk-can-modal__empty">주유 가능한 용기가 없습니다.</div>
          )}
        </div>
        <div className="footer-actions">
          <button className="button button--ghost" onClick={onClose}>닫기</button>
        </div>
      </div>
    </>
  );
}
