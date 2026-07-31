import React from 'react';

export default function WarehouseWorkbenchInOutModal({
  open,
  picker,
  children,
  onConfirm,
  onClose,
}) {
  if (!open || !picker) return null;

  return (
    <>
      <div
        className="slot-picker-backdrop"
        style={{ zIndex: 3902 }}
        onClick={onClose}
      />
      <div
        className="slot-picker slot-picker--modal slot-picker--workbench-inout-modal"
        style={{ zIndex: 3903 }}
      >
        <div className="slot-picker__title">
          {`${String(picker?.workbenchName || picker?.workbenchSlotLabel || '작업대')} 투입배출`}
        </div>
        <div className="warehouse-workbench-inout-modal__body">
          {children}
        </div>
        <div className="footer-actions">
          <button className="button button--ghost" type="button" onClick={onClose}>닫기</button>
          <button className="button button--primary" type="button" onClick={onConfirm || onClose}>확인</button>
        </div>
      </div>
    </>
  );
}
