import React from 'react';

export default function MapShopTempStoragePanel({
  title,
  containerClassName = 'map-shop-dual-modal map-shop-dual-modal--temp-storage',
  mapTransferSelectedCarrier,
  storageDurationLabel,
  currentMapShopTempStorageEntries,
  itemCategoryByKey,
  day,
  toolImageSrcOf,
  moveTempStorageEntryToSelectedCarrier,
  moveTempStorageVehicleToCurrentParking,
  longDate,
  goBackMapLocationModal,
  closeMapLocationModal,
  renderMapTransferPlaceholderModal
}) {
  return (
    <div
      className={`${containerClassName} ${mapTransferSelectedCarrier ? 'is-transfer-linked' : ''}`.trim()}
    >
      <div className="confirm-modal confirm-modal--map-shop confirm-modal--map-shop-main confirm-modal--map-shop-temp-storage-main">
        <div className="confirm-modal__title">{`${title} 물품 임시보관소`}</div>
        <div className="confirm-modal__desc">{`구매 후 미수령 물품은 ${storageDurationLabel} 동안 보관됩니다.`}</div>
        {currentMapShopTempStorageEntries.length ? (
          <div className="option-grid warehouse-storage-modal-card-grid map-temp-storage-card-grid">
            {currentMapShopTempStorageEntries.map((row) => {
              const itemKey = String(row?.item?.key || '');
              const itemCategory = String(row?.item?.category || itemCategoryByKey?.[itemKey] || '');
              const itemName = String(row?.purchaseOverride?.name || row?.item?.name || row?.item?.key || '물품');
              const unit = String(row?.item?.unit || '개');
              const qty = Math.max(0, Math.floor(Number(row?.qty) || 0));
              const weightKg = Math.max(0, Number(row?.item?.weightKg) || 0);
              const remainDays = Math.max(0, Math.floor(Number(row?.expireDay) || 0) - Math.max(1, Number(day) || 1) + 1);
              const isPalletVisualItem = String(itemCategory || '') === 'container'
                && /pallet|파렛트|팔레트/i.test(`${itemKey} ${itemName}`);
              const isAppleCrateVisualItem = String(itemCategory || '') === 'container'
                && /appleContainer/i.test(itemKey);
              const shouldPreferMountedSprayerImage = String(itemCategory || '') === 'machine' && String(row?.item?.type || '') === 'spray';
              const isVehiclePickupItem = String(itemCategory || '') === 'machine'
                && ['transport', 'passenger'].includes(String(row?.item?.type || ''))
                && Boolean(row?.instanceId);
              const toolImageSrc = toolImageSrcOf?.(itemKey, { preferMountedSprayer: shouldPreferMountedSprayerImage }) || '';
              const crateTone = /green/i.test(itemKey) ? 'green' : 'yellow';
              return (
                <div
                  key={`map-temp-storage-${row.id}`}
                  className={`option-card map-temp-storage-card ${isVehiclePickupItem ? 'map-temp-storage-card--vehicle-pickup' : ''} ${toolImageSrc || isAppleCrateVisualItem ? 'shop-tool-card--has-image' : ''} ${!isVehiclePickupItem && !mapTransferSelectedCarrier ? 'is-disabled' : ''}`.trim()}
                  role="button"
                  tabIndex={0}
                  title={isVehiclePickupItem ? '주차장으로 출고할 차량입니다.' : (!mapTransferSelectedCarrier ? '적재할 차량을 먼저 선택해 주세요.' : '눌러서 적재함에 담기')}
                  onClick={() => {
                    if (isVehiclePickupItem) return;
                    moveTempStorageEntryToSelectedCarrier(row.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isVehiclePickupItem) {
                        moveTempStorageVehicleToCurrentParking?.(row.id);
                        return;
                      }
                      moveTempStorageEntryToSelectedCarrier(row.id);
                    }
                  }}
                >
                  {isAppleCrateVisualItem ? (
                    <div className="shop-can-preview" aria-hidden="true">
                      <div className={`apple-crate-preview apple-crate-preview--${crateTone}`}>
                        <div className="apple-crate-preview__model">
                          <div className="apple-crate-preview__inner-top" />
                          <div className="apple-crate-preview__handle apple-crate-preview__handle--1" />
                          <div className="apple-crate-preview__handle apple-crate-preview__handle--2" />
                          <div className="apple-crate-preview__handle apple-crate-preview__handle--3" />
                          <div className="apple-crate-preview__handle apple-crate-preview__handle--4" />
                          <div className="apple-crate-preview__handle apple-crate-preview__handle--5" />
                          <div className="apple-crate-preview__bar apple-crate-preview__bar--1" />
                          <div className="apple-crate-preview__bar apple-crate-preview__bar--2" />
                          <div className="apple-crate-preview__bar apple-crate-preview__bar--3" />
                          <div className="apple-crate-preview__grid-area">
                            <div className="apple-crate-preview__col">
                              <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
                              <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
                              <div className="apple-crate-preview__mesh" />
                            </div>
                            <div className="apple-crate-preview__col">
                              <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
                              <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
                              <div className="apple-crate-preview__mesh" />
                            </div>
                            <div className="apple-crate-preview__col" />
                            <div className="apple-crate-preview__col">
                              <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
                              <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
                              <div className="apple-crate-preview__mesh" />
                            </div>
                            <div className="apple-crate-preview__col">
                              <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
                              <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
                              <div className="apple-crate-preview__mesh" />
                            </div>
                          </div>
                          <div className="apple-crate-preview__center-panel" />
                          <div className="apple-crate-preview__bottom-row">
                            <div className="apple-crate-preview__bottom-cell" />
                            <div className="apple-crate-preview__bottom-cell" />
                            <div className="apple-crate-preview__bottom-cell" />
                            <div className="apple-crate-preview__bottom-cell" />
                            <div className="apple-crate-preview__bottom-cell" />
                            <div className="apple-crate-preview__bottom-cell" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : toolImageSrc ? (
                    <div className="shop-tool-thumb" aria-hidden="true">
                      <img src={toolImageSrc} alt="" loading="lazy" />
                    </div>
                  ) : null}
                  <div className="warehouse-storage-card-qty">{qty}{unit}</div>
                  <div className="storage-card__head">
                    <strong>{itemName}</strong>
                  </div>
                  {isVehiclePickupItem ? (
                    <div className="storage-card__meta">출고 대기 차량</div>
                  ) : null}
                  {weightKg > 0 ? (
                    <div className="storage-card__meta">{`무게 ${Number(weightKg).toLocaleString()}kg`}</div>
                  ) : null}
                  <div className="storage-card__meta">{`만료 ${longDate(row.expireDay)} (${remainDays}일 남음)`}</div>
                  {isVehiclePickupItem ? (
                    <button
                      type="button"
                      className="button button--primary map-temp-storage-card__release-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        moveTempStorageVehicleToCurrentParking?.(row.id);
                      }}
                    >
                      주차장으로 출고
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-box shop-cart-empty" style={{ marginTop: 10 }}>임시보관 중인 물품이 없습니다.</div>
        )}
        <div className="footer-actions map-temp-storage-actions">
          <button className="button button--ghost warehouse-storage-footer-button" onClick={goBackMapLocationModal}>뒤로</button>
          <button className="button button--ghost warehouse-storage-footer-button" onClick={closeMapLocationModal}>나가기</button>
        </div>
      </div>
      {renderMapTransferPlaceholderModal({ docked: true })}
    </div>
  );
}
