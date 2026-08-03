import React from 'react';

export default function MapTransferPanelHeader({
  mapTransferSelectedCarrier,
  mapTransferPersonalCarrierId,
  mapShopIsPaymentShifted,
  currentLoadKg,
  payloadKg,
  machineImageSrcOf
}) {
  const selectedCarrierId = String(mapTransferSelectedCarrier?.id || '');
  const isPersonalCarrier = selectedCarrierId === mapTransferPersonalCarrierId;
  const isEquippedBagCarrier = selectedCarrierId === '__equipped_bag__'
    || String(mapTransferSelectedCarrier?.machineKey || '') === 'equippedBag';
  const selectedCarrierName = isPersonalCarrier
    ? '개인소지품'
    : isEquippedBagCarrier
      ? '가방'
      : `${mapTransferSelectedCarrier?.item?.name || mapTransferSelectedCarrier?.machineKey || '선택 적재함'} #${mapTransferSelectedCarrier?.unitNo}`;
  const selectedCarrierLabel = mapTransferSelectedCarrier
    ? selectedCarrierName.trim()
    : (mapShopIsPaymentShifted ? '적재를 선택해주세요' : '적재하시려면 적재를 선택해주세요');
  const selectedCarrierImageSrc = (
    mapTransferSelectedCarrier
    && typeof machineImageSrcOf === 'function'
  )
    ? String(machineImageSrcOf(mapTransferSelectedCarrier) || '')
    : '';
  return (
    <div
      className={`confirm-modal__title ${mapTransferSelectedCarrier ? 'confirm-modal__title--split' : ''}`.trim()}
      style={mapTransferSelectedCarrier ? { display: 'flex', alignItems: 'center', gap: 10 } : undefined}
    >
      {selectedCarrierImageSrc ? (
        <div
          aria-hidden="true"
          style={{
            width: 72,
            height: 48,
            flex: '0 0 auto',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.72)',
            border: '1px solid rgba(122, 152, 127, 0.24)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <img
            src={selectedCarrierImageSrc}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      ) : null}
      <div style={{ minWidth: 0, flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 14, lineHeight: 1.25, wordBreak: 'keep-all' }}>{selectedCarrierLabel}</span>
        {mapTransferSelectedCarrier ? (
          <span className="confirm-modal__title-meta" style={{ display: 'block', marginLeft: 0, fontSize: 13 }}>
            {`${Math.max(0, Math.round(currentLoadKg))} / ${Math.max(0, Math.round(payloadKg))}kg`}
          </span>
        ) : null}
      </div>
    </div>
  );
}
