import React from 'react';

export default function InventoryModal({
  open,
  onClose,
  equipmentRows = [],
  activityInfo = null,
  personalRows = [],
  bagRows = []
}) {
  if (!open) return null;
  const visibleEquipmentRows = Array.isArray(equipmentRows) ? equipmentRows : [];
  const activity = Math.max(0, Math.min(100, Math.round(Number(activityInfo?.activity) || 100)));
  const workDropPct = Math.max(0, Math.round((1 - Math.max(0, Number(activityInfo?.efficiencyMultiplier) || 1)) * 100));
  const visiblePersonalRows = Array.isArray(personalRows) ? personalRows.filter((row) => row?.key) : [];
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
              <span>{`활동성 ${activity}/100${workDropPct > 0 ? ` · 작업효율 -${workDropPct}%` : ''}`}</span>
            </div>
            <div className="inventory-equipment-grid">
              {visibleEquipmentRows.map((row) => (
                <button type="button" key={row.key} className={`inventory-equipment-slot ${row.installed ? 'is-equipped' : ''}`.trim()}>
                  <span>{row.label}</span>
                  <em>
                    {row.installed
                      ? `${row.name}${Number(row.activityPenalty) > 0 ? ` · 활동성 -${Number(row.activityPenalty).toFixed(1)}` : ''}`
                      : row.hint}
                  </em>
                </button>
              ))}
            </div>
          </section>
          <section className="inventory-control-card inventory-bag-panel">
            <div className="inventory-control-card__head">
              <strong>개인소지품</strong>
              <span>개인 소지품 항목</span>
            </div>
            <div className="inventory-bag-list">
              {visiblePersonalRows.length ? (
                visiblePersonalRows.map((row) => (
                  <button type="button" key={`inventory-personal-row-${row.key}`} className="inventory-bag-row">
                    <span className="inventory-bag-row__name">{row.name}</span>
                    <span className="inventory-bag-row__qty">{row.qtyText}</span>
                    <span className="inventory-bag-row__meta">{row.metaText}</span>
                  </button>
                ))
              ) : (
                <div className="inventory-bag-empty">개인소지품에 든 항목이 없습니다.</div>
              )}
            </div>
          </section>
          <section className="inventory-control-card inventory-carried-bag-panel">
            <div className="inventory-control-card__head">
              <strong>가방 인벤토리</strong>
              <span>착용한 가방 내부 항목</span>
            </div>
            <div className="inventory-bag-list">
              {visibleBagRows.length ? (
                visibleBagRows.map((row) => (
                  <button type="button" key={`inventory-carried-bag-row-${row.key}`} className="inventory-bag-row">
                    <span className="inventory-bag-row__name">{row.name}</span>
                    <span className="inventory-bag-row__qty">{row.qtyText}</span>
                    <span className="inventory-bag-row__meta">{row.metaText}</span>
                  </button>
                ))
              ) : (
                <div className="inventory-bag-empty">착용한 가방에 든 항목이 없습니다.</div>
              )}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
