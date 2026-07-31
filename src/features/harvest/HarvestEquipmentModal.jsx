import React from 'react';

export default function HarvestEquipmentModal({
  isOpen,
  equipmentCards,
  selectedEquipmentIds,
  onToggleEquipment,
  stockLoadBoxOptions,
  appliedLoadBoxOptions,
  selectedLoadBoxIds,
  selectionIdOf,
  onToggleLoadBoxOption,
  onClose,
  onConfirm,
  hasAnyLoadBoxOptions
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="confirm-modal-backdrop" onClick={onClose} />
      <div className="confirm-modal confirm-modal--harvest-picker">
        <div className="confirm-modal__title">수확장비 선택</div>
        <div className="confirm-modal__desc">과수용 사다리와 고소작업차를 중복 선택할 수 있고, 아래에서 수확 바구니도 함께 고를 수 있습니다.</div>
        <div className="harvest-plan-picker-body">
          {equipmentCards.length ? (
            <>
              <div className="option-grid age-task-equip-grid">
                {equipmentCards.map((option) => {
                  const isSelected = selectedEquipmentIds.includes(option.id);
                  return (
                    <div key={`harvest-equip-modal-${option.id}`} className="harvest-equip-card-stack">
                      <button
                        type="button"
                        className={`option-card age-task-equip-card ${isSelected ? 'age-task-equip-card--active' : ''}`}
                        onClick={() => onToggleEquipment(option.id)}
                      >
                        <div className="harvest-equip-option-content">
                          {option.imageSrc ? (
                            <div className={`harvest-equip-option-thumb ${option.isLadder ? 'harvest-equip-option-thumb--ladder' : ''}`.trim()}>
                              <img src={option.imageSrc} alt={option.label} loading="lazy" />
                            </div>
                          ) : null}
                          <div className="harvest-equip-option-copy">
                            <div className="option-card__row">
                              <strong>{option.label}</strong>
                              <span>{option.durabilityText}</span>
                            </div>
                            <div className="option-card__meta">{option.seatText}</div>
                          </div>
                        </div>
                      </button>
                      {option.fuelGauge ? (
                        <button
                          type="button"
                          className="mow-fuel-button parking-slot-fuel parking-slot-fuel--clickable"
                          onClick={() => option.onOpenFuelGauge?.()}
                          title={option.fuelGauge.isElectric ? 'EV 충전 모달 열기' : '주유 열기'}
                        >
                          <div className="parking-slot-fuel__head">
                            <strong>{`${option.fuelGauge.ratio.toFixed(0)}%`}</strong>
                            <span>{option.fuelGauge.text}</span>
                          </div>
                          <div className={`parking-slot-fuel__bar ${option.fuelGauge.toneClass}`.trim()}>
                            <span style={{ width: `${option.fuelGauge.ratio}%` }} />
                          </div>
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="harvest-plan-picker-section">
                <div className="harvest-plan-picker-section__title">수확 바구니</div>
                {hasAnyLoadBoxOptions ? (
                  <>
                    {stockLoadBoxOptions.length ? (
                      <>
                        <div className="meter__hint" style={{ marginBottom: 6 }}>창고/차량</div>
                        <div className="option-grid age-task-equip-grid" style={{ marginBottom: 10 }}>
                          {stockLoadBoxOptions.map((option) => {
                            const isSelected = selectedLoadBoxIds.includes(selectionIdOf(option));
                            return (
                              <button
                                key={`harvest-load-box-inline-${option.key}-${option.sourceType}`}
                                type="button"
                                className={`option-card age-task-equip-card ${isSelected ? 'age-task-equip-card--active' : ''}`}
                                onClick={() => onToggleLoadBoxOption(option)}
                              >
                                <div className="option-card__row">
                                  <strong>{option.label}</strong>
                                  <span>{`보유 ${option.qty}개`}</span>
                                </div>
                                <div className="option-card__meta">{`창고 ${option.warehouseQty}개 / 차량 ${option.parkedCargoQty}개`}</div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : null}
                    {appliedLoadBoxOptions.length ? (
                      <>
                        <div className="meter__hint" style={{ marginBottom: 6 }}>토지 도포</div>
                        <div className="option-grid age-task-equip-grid">
                          {appliedLoadBoxOptions.map((option) => {
                            const isSelected = selectedLoadBoxIds.includes(selectionIdOf(option));
                            return (
                              <button
                                key={`harvest-load-box-inline-${option.key}-${option.sourceType}`}
                                type="button"
                                className={`option-card age-task-equip-card ${isSelected ? 'age-task-equip-card--active' : ''}`}
                                onClick={() => onToggleLoadBoxOption(option)}
                              >
                                <div className="option-card__row">
                                  <strong>{option.label}</strong>
                                  <span>{`보유 ${option.qty}개`}</span>
                                </div>
                                <div className="option-card__meta">{`현재 토지 도포 ${Math.max(0, Number(option.appliedQty) || 0)}개`}</div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : null}
                  </>
                ) : (
                  <div className="meter__hint">보유한 수확 바구니가 없습니다.</div>
                )}
              </div>
            </>
          ) : (
            <div className="meter__hint">보유한 과수용 사다리/고소작업차가 없습니다.</div>
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
