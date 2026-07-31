import React from 'react';

export function FuelKioskCancelConfirmModal({
  open,
  remainingLiters,
  formatLiterText,
  onClose,
  onConfirm
}) {
  if (!open) return null;

  return (
    <>
      <div className="confirm-modal-backdrop confirm-modal-backdrop--fuel-overlay" onClick={onClose} />
      <div className="confirm-modal fuel-kiosk-overlay-modal">
        <div className="confirm-modal__title">결제 취소 확인</div>
        <div className="confirm-modal__desc">
          {`남은 주유량(${formatLiterText(remainingLiters)}L)을 결제 취소 하시겠습니까?`}
        </div>
        <div className="footer-actions">
          <button className="button button--ghost" onClick={onClose}>닫기</button>
          <button className="button button--danger" onClick={onConfirm}>결제 취소</button>
        </div>
      </div>
    </>
  );
}
