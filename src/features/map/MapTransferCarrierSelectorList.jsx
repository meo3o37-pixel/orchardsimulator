import React from 'react';

export default function MapTransferCarrierSelectorList({
  mapTransferParkedCarrierRows,
  mapTransferSelectedCarrierId,
  setMapTransferSelectedCarrierId,
  machineImageSrcOf
}) {
  return (
    <>
      {mapTransferParkedCarrierRows.map((row) => {
        const imageSrc = typeof machineImageSrcOf === 'function'
          ? String(machineImageSrcOf(row.machine) || '')
          : '';
        return (
        <button
          type="button"
          key={`map-transfer-carrier-${row.machine.id}`}
          className={`map-transfer-vehicle-card ${mapTransferSelectedCarrierId === row.machine.id ? 'is-active' : ''}`.trim()}
          onClick={() => {
            setMapTransferSelectedCarrierId((prev) => (prev === row.machine.id ? '' : row.machine.id));
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {imageSrc ? (
              <div
                aria-hidden="true"
                style={{
                  width: 74,
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
                  src={imageSrc}
                  alt=""
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            ) : null}
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <div className="map-transfer-vehicle-card__head">
                <strong>{row.isPersonal ? '개인소지품' : `${row.machine.item?.name || row.machine.machineKey} #${row.machine.unitNo}`}</strong>
                <span>{row.isPersonal ? '기본' : (row.slotLabel || `P${row.slotNo}`)}</span>
              </div>
              <div className="map-transfer-vehicle-card__meta">
                {`적재량 ${(Number(row.machine.item?.payloadKg) || 0).toLocaleString()}kg`}
              </div>
            </div>
          </div>
        </button>
        );
      })}
    </>
  );
}
