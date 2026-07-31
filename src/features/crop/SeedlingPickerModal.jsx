import React from 'react';

export default function SeedlingPickerModal({
  open,
  rows,
  selectedCropKey,
  onSelectCrop,
  onClose
}) {
  if (!open) return null;

  return (
    <>
      <div className="confirm-modal-backdrop" onClick={onClose} />
      <div className="confirm-modal" style={{ maxWidth: 760 }}>
        <div className="confirm-modal__title">묘목 선택</div>
        <div className="confirm-modal__desc">현재 토지 기준 보유 묘목(창고 + 주차 차량 적재함)에서 선택하세요.</div>
        {rows.length ? (
          <div className="option-grid age-task-equip-grid" style={{ marginTop: 10 }}>
            {rows.map((row) => (
              <button
                key={`seedling-picker-${row.cropKey}`}
                type="button"
                className={`option-card age-task-equip-card ${selectedCropKey === row.cropKey ? 'age-task-equip-card--active' : ''}`.trim()}
                onClick={() => onSelectCrop(row.cropKey)}
                style={{ textAlign: 'left' }}
              >
                <div className="harvest-equip-option-content">
                  {row.imageSrc ? (
                    <div className="harvest-equip-option-thumb" aria-hidden="true">
                      <img src={row.imageSrc} alt="" loading="lazy" />
                    </div>
                  ) : null}
                  <div className="harvest-equip-option-copy">
                    <div className="option-card__row">
                      <strong>{row.cropName}</strong>
                      <span>{`${row.totalStock}주`}</span>
                    </div>
                    <div className="option-card__meta">{`창고 ${row.warehouseStock}주 / 차량 ${row.cargoStock}주`}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-box" style={{ marginTop: 10 }}>현재 토지 창고/차량 적재함에 보유한 묘목이 없습니다.</div>
        )}
        <div className="footer-actions">
          <button className="button button--ghost" onClick={onClose}>닫기</button>
        </div>
      </div>
    </>
  );
}
