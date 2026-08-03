import React from 'react';

const normalizeCountUnitLabel = (unit, fallback = '개') => {
  const raw = String(unit || fallback).trim();
  const normalized = raw.replace(/^1(?=[가-힣])/u, '');
  return normalized || fallback;
};

const formatCountWithUnit = (qty, unit, fallback = '개') => `${qty}${normalizeCountUnitLabel(unit, fallback)}`;

export default function SharedShopCartPanel({
  shopCartTotalQty,
  shopCartEntries,
  seedlingKeyByCrop,
  game,
  estimateShopPayment,
  mapShopIsPaymentShifted,
  mapTransferSelectedCarrier,
  movePaidCartEntryToSelectedCarrier,
  moveAllPaidCartEntriesToSelectedCarrier,
  won,
  shopCartSummary,
  shopCartUnpaidEntries,
  openShopCartCardPayModal,
  removeShopCartItem,
  clearShopCart,
  reopenMapTransferStep,
  toolImageSrcOf
}) {
  const hasPaidEntries = shopCartEntries.some((entry) => Boolean(entry?.paid));
  const canReopenTransferStep = hasPaidEntries && !shopCartUnpaidEntries.length && !mapShopIsPaymentShifted;
  const showMoveAllToCarrierBtn = hasPaidEntries && mapShopIsPaymentShifted;
  const canMoveAllToCarrier = Boolean(mapTransferSelectedCarrier);
  const selectedCarrierId = String(mapTransferSelectedCarrier?.id || '');
  const selectedCarrierLabel = selectedCarrierId === '__personal_carry__'
    ? '개인소지품'
    : selectedCarrierId === '__equipped_bag__' || String(mapTransferSelectedCarrier?.machineKey || '') === 'equippedBag'
      ? '가방'
      : '선택 적재함';

  return (
    <div className="shop-cart-panel">
      <div className="option-card__row">
        <strong>장바구니</strong>
        <span>{shopCartTotalQty}건</span>
      </div>
      <div className="shop-cart-center-icon" aria-hidden>
        <svg viewBox="0 0 24 24" role="presentation">
          <circle cx="9" cy="19" r="1.7" />
          <circle cx="17" cy="19" r="1.7" />
          <path d="M3 4h2l2.1 9.2a1.4 1.4 0 0 0 1.36 1.08h7.9a1.4 1.4 0 0 0 1.36-1.08L20 8H7.2" />
        </svg>
      </div>
      {shopCartEntries.length ? (
        <div className="shop-cart-list">
          {shopCartEntries.map((entry) => {
            const item = entry.item;
            const itemKey = String(item.key || '');
            const entryKey = String(entry.cartKey || itemKey);
            const finalName = String(entry.purchaseOverride?.name || item.name || itemKey);
            const itemCategory = entry.itemCategory || item.category || (Object.values(seedlingKeyByCrop).includes(itemKey) ? 'seedling' : '');
            const ownedQty = Math.max(0, Number(game.inventory?.[itemKey]) || 0);
            const maxQty = item.maxQty ? Math.max(0, Number(item.maxQty) - ownedQty) : 9999;
            const cartQty = Math.max(1, Math.min(Math.floor(Number(entry.qty) || 1), Math.max(1, maxQty)));
            const estimate = estimateShopPayment(game, item, itemCategory, cartQty, entry.purchaseOverride);
            const paid = Boolean(entry?.paid);
            const showMoveToCarrierBtn = paid && mapShopIsPaymentShifted;
            const showRemoveBtn = !paid;
            const canMoveToCarrier = Boolean(mapTransferSelectedCarrier);
            const itemImageSrc = toolImageSrcOf?.(itemKey) || '';

            return (
              <div
                key={`cart-${entryKey}`}
                className={`shop-cart-item ${showMoveToCarrierBtn ? 'shop-cart-item--with-move' : ''} ${itemImageSrc ? 'shop-cart-item--has-image' : ''}`.trim()}
              >
                {itemImageSrc ? (
                  <div className="shop-cart-item__thumb" aria-hidden="true">
                    <img src={itemImageSrc} alt="" loading="lazy" />
                  </div>
                ) : null}
                <div className="shop-cart-item__head">
                  <strong>{finalName}</strong>
                  <div className="shop-cart-item__actions">
                    {showRemoveBtn ? (
                      <button
                        className="button button--ghost button--compact day-transition-animate-button shop-cart-remove-btn"
                        title="장바구니에서 빼기"
                        onClick={() => removeShopCartItem?.(entryKey)}
                      >
                        빼기
                      </button>
                    ) : null}
                    {showMoveToCarrierBtn ? (
                      <button
                        className="button button--ghost button--compact day-transition-animate-button map-transfer-move-btn"
                        disabled={!canMoveToCarrier}
                        title={!canMoveToCarrier ? '적재할 곳을 먼저 선택해 주세요.' : `${selectedCarrierLabel}으로 옮기기`}
                        onClick={() => movePaidCartEntryToSelectedCarrier(entryKey)}
                      >
                        옮기기
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="shop-cart-item__meta">
                  {formatCountWithUnit(cartQty, item.unit)} · {won(estimate.totalPrice)} {paid ? '· 결제완료' : '· 미결제'}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-box shop-cart-empty">장바구니가 비어 있습니다.</div>
      )}
      <div className="shop-cart-summary">
        <div>미결제 총액 <strong>{won(shopCartSummary.totalPayable)}</strong></div>
      </div>
      {showMoveAllToCarrierBtn ? (
        <div className="footer-actions" style={{ marginTop: 10 }}>
          <button
            className="button button--ghost day-transition-animate-button"
            disabled={!canMoveAllToCarrier}
            title={!canMoveAllToCarrier ? '적재할 곳을 먼저 선택해 주세요.' : `${selectedCarrierLabel}으로 모두 옮기기`}
            onClick={moveAllPaidCartEntriesToSelectedCarrier}
          >
            모두 옮기기
          </button>
        </div>
      ) : null}
      {canReopenTransferStep ? (
        <div className="footer-actions" style={{ marginTop: 10 }}>
          <button
            className="button button--ghost day-transition-animate-button"
            onClick={reopenMapTransferStep}
          >
            적재 단계로 이동
          </button>
        </div>
      ) : null}
      {shopCartUnpaidEntries.length ? (
        <div className="footer-actions" style={{ marginTop: 10 }}>
          <button
            className="button button--primary day-transition-animate-button"
            onClick={openShopCartCardPayModal}
          >
            선택 상품 결제
          </button>
          <button className="button button--ghost day-transition-animate-button" disabled={!shopCartEntries.length} onClick={clearShopCart}>
            장바구니 비우기
          </button>
        </div>
      ) : null}
    </div>
  );
}
