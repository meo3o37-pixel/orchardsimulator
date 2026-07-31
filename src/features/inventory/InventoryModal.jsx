import React from 'react';

const EQUIPMENT_SLOTS = [
  ['head', '모자', '머리 보호 장비'],
  ['top', '상의', '작업복 상의'],
  ['bottom', '하의', '작업복 하의'],
  ['gloves', '장갑', '손 보호 장비'],
  ['shoes', '신발', '작업화'],
  ['bag', '가방', '개인 수납 장비'],
  ['tool1', '도구 1', '주 사용 도구'],
  ['tool2', '도구 2', '보조 도구']
];

export default function InventoryModal({
  open,
  onClose,
  bagRows = []
}) {
  if (!open) return null;
  const visibleBagRows = Array.isArray(bagRows) ? bagRows.filter((row) => row?.key) : [];

  return (
    <>
      <button
        type="button"
        className="inventory-modal-backdrop"
        onClick={onClose}
        aria-label="인벤토리 닫기"
      />
      <section className="inventory-modal" role="dialog" aria-modal="true" aria-label="개인 인벤토리">
        <header className="inventory-modal__header">
          <div>
            <span>작업자 장비</span>
            <h2>인벤토리</h2>
          </div>
          <button type="button" className="inventory-modal__close" onClick={onClose} aria-label="인벤토리 닫기">
            ×
          </button>
        </header>
        <div className="inventory-modal__layout">
          <section className="inventory-control-card inventory-equipment-panel">
            <div className="inventory-control-card__head">
              <strong>착용 장비</strong>
              <span>작업복 · 보호구 · 휴대 장비</span>
            </div>
            <div className="inventory-equipment-grid">
              {EQUIPMENT_SLOTS.map(([key, label, desc]) => (
                <button type="button" key={key} className="inventory-equipment-slot">
                  <span>{label}</span>
                  <em>{desc}</em>
                </button>
              ))}
            </div>
          </section>
          <section className="inventory-control-card inventory-bag-panel">
            <div className="inventory-control-card__head">
              <strong>가방</strong>
              <span>개인 소지품 항목</span>
            </div>
            <div className="inventory-bag-list">
              {visibleBagRows.length ? (
                visibleBagRows.map((row) => (
                  <button type="button" key={`inventory-bag-row-${row.key}`} className="inventory-bag-row">
                    <span className="inventory-bag-row__name">{row.name}</span>
                    <span className="inventory-bag-row__qty">{row.qtyText}</span>
                    <span className="inventory-bag-row__meta">{row.metaText}</span>
                  </button>
                ))
              ) : (
                <div className="inventory-bag-empty">가방에 든 항목이 없습니다.</div>
              )}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
