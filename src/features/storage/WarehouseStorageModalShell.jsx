import React from 'react';

export default function WarehouseStorageModalShell({
  open,
  carrierOnlyMode,
  closing,
  onClose,
  leftPane,
  rightPane,
  overlay,
}) {
  if (!open) return null;

  return (
    <>
      <div
        className={`confirm-modal-backdrop ${carrierOnlyMode ? 'confirm-modal-backdrop--carrier-only' : ''} ${closing ? 'is-closing' : ''}`.trim()}
        onClick={onClose}
      />
      {leftPane}
      {rightPane}
      {overlay}
    </>
  );
}
