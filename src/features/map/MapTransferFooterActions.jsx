import React from 'react';

export default function MapTransferFooterActions({
  mapTransferSelectedCarrier,
  setMapTransferSelectedCarrierId,
  setMapShopExitAnimating,
  returnToMapShop,
  closeMapLocationModal
}) {
  return (
    <div className="footer-actions map-transfer-footer-actions">
      {mapTransferSelectedCarrier ? (
        <div className="map-transfer-footer-actions__row map-transfer-footer-actions__row--top">
          <button
            type="button"
            className="button button--ghost day-transition-animate-button"
            onClick={() => {
              setMapTransferSelectedCarrierId('');
            }}
          >
            적재함 선택
          </button>
        </div>
      ) : null}
      <div className="map-transfer-footer-actions__row">
        <button
          type="button"
          className="button button--ghost warehouse-storage-footer-button"
          onClick={() => {
            setMapShopExitAnimating(false);
            if (typeof returnToMapShop === 'function') {
              returnToMapShop();
            }
          }}
        >
          상점으로 돌아가기
        </button>
        <button
          type="button"
          className="button button--ghost warehouse-storage-footer-button"
          onClick={closeMapLocationModal}
        >
          나가기
        </button>
      </div>
    </div>
  );
}
