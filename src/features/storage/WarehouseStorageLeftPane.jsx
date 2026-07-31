import React from 'react';
import WarehouseStorageContentPane from './WarehouseStorageContentPane';

export default function WarehouseStorageLeftPane(props) {
  const {
    personalOnlyMode,
    carrierOnlyMode,
    leftModalRef,
    closing,
    carrierOnlyPaneProps,
    contentPaneProps,
  } = props;

  if (personalOnlyMode) return null;

  if (carrierOnlyMode) {
    const {
      secondaryCarrier,
      personalCarrierId,
      machineDisplayNameWithRentTag,
      secondaryCarrierUsedKg,
      secondaryCarrierPayloadKg,
      secondaryCarrierCargoRows,
      itemMetaByKey,
      itemNameByKey,
      facilityUnloadQtyByKey,
      setFacilityUnloadQtyByKey,
      moveSecondaryCarrierItemToSelectedCarrier,
    } = carrierOnlyPaneProps;

    return (
      <div
        ref={leftModalRef}
        className={`confirm-modal confirm-modal--warehouse-storage confirm-modal--warehouse-storage-left confirm-modal--map-shop-cart is-transfer-linked is-carrier-only ${closing ? 'is-closing' : ''}`.trim()}
      >
        <div className="shop-cart-panel" style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="option-card__row">
            <strong>
              {String(secondaryCarrier?.id || '') === personalCarrierId
                ? '개인 가방'
                : `${machineDisplayNameWithRentTag(secondaryCarrier)} 적재함`}
            </strong>
            <span>{`적재량 ${secondaryCarrierUsedKg.toFixed(1)} / ${secondaryCarrierPayloadKg.toFixed(1)}kg`}</span>
          </div>
          <div className="shop-cart-item__meta" style={{ marginTop: 4 }}>
            {String(secondaryCarrier?.id || '') === personalCarrierId
              ? '개인 가방에 들어있는 물품입니다.'
              : '탑승 차량 적재함에 들어있는 물품입니다.'}
          </div>
          {secondaryCarrierCargoRows.length ? (
            <div className="shop-cart-list">
              {secondaryCarrierCargoRows.map((row) => {
                const meta = itemMetaByKey?.[row.itemKey] || {};
                const unit = String(meta?.unit || '개');
                const weightKg = Math.max(0, Number(meta?.weightKg) || 0);
                const secondaryRowKey = `secondary-${String(row?.rowKey || row?.itemKey || '')}`;
                return (
                  <div key={`carrier-only-secondary-${String(row?.rowKey || row.itemKey)}`} className="shop-cart-item">
                    <div style={{ display: 'grid', gap: 2 }}>
                      <strong>{row.label || itemNameByKey[row.itemKey] || row.itemKey}</strong>
                      <div className="shop-cart-item__meta">
                        {`무게 ${weightKg > 0 ? `${weightKg}kg/${unit}` : '-'}${weightKg > 0 ? ` · 총 ${(weightKg * Math.max(0, Number(row.qty) || 0)).toFixed(1)}kg` : ''}`}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <input
                        className="text-input shop-buy-qty-input"
                        style={{ width: 64, height: 34, padding: '0 8px', textAlign: 'center' }}
                        type="number"
                        min={1}
                        max={Math.max(1, Number(row?.qty) || 1)}
                        value={(() => {
                          const max = Math.max(1, Number(row?.qty) || 1);
                          const raw = Math.max(1, Math.floor(Number(facilityUnloadQtyByKey[secondaryRowKey]) || 1));
                          return Math.min(max, raw);
                        })()}
                        onChange={(e) => {
                          const raw = Math.floor(Number(e.target.value) || 1);
                          const max = Math.max(1, Number(row?.qty) || 1);
                          const next = Math.max(1, Math.min(max, raw));
                          setFacilityUnloadQtyByKey((prev) => ({ ...(prev || {}), [secondaryRowKey]: next }));
                        }}
                      />
                      <button
                        type="button"
                        className="button button--ghost button--compact facility-workbench-install-button"
                        onClick={() => moveSecondaryCarrierItemToSelectedCarrier(row, facilityUnloadQtyByKey[secondaryRowKey] || 1)}
                      >
                        {'옮기기'}
                      </button>
                      <span>{`${row.qty}${unit}`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-box shop-cart-empty">표시할 적재품이 없습니다.</div>
          )}
        </div>
      </div>
    );
  }

  return <WarehouseStorageContentPane {...contentPaneProps} />;
}
