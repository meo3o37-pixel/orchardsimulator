import React from 'react';

export default function WarehouseStorageShareModal({
  open,
  title,
  description,
  note,
  rows,
  onClose,
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="confirm-modal-backdrop"
        style={{ zIndex: 3900 }}
        onClick={onClose}
      />
      <div className="confirm-modal" style={{ zIndex: 3901, width: 'min(760px, calc(100vw - 32px))' }}>
        <div className="confirm-modal__title">{title}</div>
        <div className="confirm-modal__desc">{description}</div>
        {note ? (
          <div
            className="confirm-modal__desc"
            style={{ marginTop: 8, color: '#5f6b5f' }}
          >
            {note}
          </div>
        ) : null}
        {rows.length ? (
          <div style={{ marginTop: 10, maxHeight: '52vh', overflowY: 'auto', border: '1px solid #d6ddd6', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f4f7f4', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>품목</th>
                  <th style={{ padding: '10px 12px' }}>수량</th>
                  <th style={{ padding: '10px 12px' }}>사용량</th>
                  <th style={{ padding: '10px 12px' }}>사용량 대비</th>
                  <th style={{ padding: '10px 12px' }}>용량 대비</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`facility-share-row-${row.itemKey}`} style={{ borderTop: '1px solid #e2e8e2' }}>
                    <td style={{ padding: '9px 12px' }}>
                      <strong>{row.name}</strong>
                      <div style={{ fontSize: 12, color: '#5f6b5f' }}>{row.categoryLabel}</div>
                    </td>
                    <td style={{ padding: '9px 12px' }}>{`${Number(row.qty).toLocaleString()}${row.unit || '개'}`}</td>
                    <td style={{ padding: '9px 12px' }}>{`${row.usedKg.toFixed(1)}kg`}</td>
                    <td style={{ padding: '9px 12px' }}>{`${row.usedPct.toFixed(1)}%`}</td>
                    <td style={{ padding: '9px 12px' }}>{`${row.capPct.toFixed(1)}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-box" style={{ marginTop: 10 }}>표시할 보관 품목이 없습니다.</div>
        )}
        <div className="footer-actions" style={{ marginTop: 12, justifyContent: 'flex-end' }}>
          <button className="button button--ghost" onClick={onClose}>닫기</button>
        </div>
      </div>
    </>
  );
}
