import React from 'react';

export default function WarehouseOtherWarehouseTransferModal({
  open,
  picker,
  warehouseRows,
  stripColdStorageIconName,
  onSelectWarehouse,
  onClose,
}) {
  if (!open || !picker) return null;

  const itemName = String(picker?.itemName || '아이템');
  const qty = Math.max(1, Math.floor(Number(picker?.qty) || 1));

  return (
    <>
      <div className="confirm-modal-backdrop" style={{ zIndex: 3902 }} onClick={onClose} />
      <div className="confirm-modal" style={{ zIndex: 3903, width: 'min(760px, calc(100vw - 32px))' }}>
        <div className="confirm-modal__title">옮길 창고 선택</div>
        <div className="confirm-modal__desc">
          {`${itemName} ${qty}개를 옮길 현재 토지의 창고를 선택해 주세요.`}
        </div>
        {warehouseRows.length ? (
          <div
            className="map-transfer-vehicle-list"
            style={{ marginTop: 12, maxHeight: '46vh', overflowY: 'auto' }}
          >
            {warehouseRows.map((row) => {
              const facilityKey = String(row?.key || '');
              const isGreenWarehouse = facilityKey.startsWith('panelWarehouse') || facilityKey.startsWith('goodsWarehouse');
              return (
                <button
                  key={`other-warehouse-transfer-target-${facilityKey}`}
                  type="button"
                  className={`map-transfer-vehicle-card ${isGreenWarehouse ? 'is-green-warehouse' : ''} ${row.isColdStorage && row.coldEnabled ? 'is-cold-on' : ''}`.trim()}
                  onClick={() => onSelectWarehouse?.(row)}
                >
                  <div className="map-transfer-vehicle-card__head">
                    <strong>{stripColdStorageIconName(row?.name || '창고')}</strong>
                    {row.isColdStorage ? <span>{`냉장 ${row.coldStatusLabel || 'OFF'}`}</span> : null}
                  </div>
                  <div className="map-transfer-vehicle-card__meta">
                    {`보관량 ${Math.max(0, Math.round(Number(row?.usedKg) || 0)).toLocaleString()} / ${Math.max(0, Math.round(Number(row?.capacityKg) || 0)).toLocaleString()}kg`}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="empty-box" style={{ marginTop: 12 }}>
            현재 토지에 옮길 수 있는 다른 창고가 없습니다.
          </div>
        )}
        <div className="footer-actions" style={{ marginTop: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="button button--ghost" onClick={onClose}>닫기</button>
        </div>
      </div>
    </>
  );
}
