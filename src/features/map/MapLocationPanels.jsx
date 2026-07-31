import React from 'react';

const ENTRY_BUTTON_EMOJI_BY_KEY = Object.freeze({
  shop: '🛒',
  pickup: '📦',
  office: '🏢',
  labor: '🧑‍🌾',
  receiving: '📝',
  'loading-yard': '🚚',
  sorting: '🍎',
  'cold-storage': '❄️',
  lounge: '🛋️',
  cafeteria: '🍽️',
  shipping: '📤',
  'bank-counter': '🏦',
  atm: '💳',
  'lpg-shop': '🔥',
  'ev-charge': '🔌'
});

const ENTRY_BUTTON_STAFF_EMOJI_BY_STATUS = Object.freeze({
  working: '🧑',
  moving: '🏃',
  resting: '😴',
  eating: '🍚',
  absent: '🌙',
  vacation: '🏖️',
  hangoverLeave: '🤢',
  sickLeave: '🤒',
  offDuty: '🏠',
  unauthorizedLeave: '💨',
  missing: '🫥',
  late: '⏰',
  training: '🧠',
  meeting: '📋',
  smokingBreak: '🚬'
});

function resolveEntryButtonEmoji(action = {}) {
  const icon = String(action?.icon || '').trim();
  if (icon) return icon;
  const label = String(action?.label || '').trim();
  if (label) {
    if (label.includes('주유')) return '⛽';
    if (label.includes('LPG') && label.includes('충전')) return '⛽';
    if (label.includes('LPG')) return '🔥';
    if (label.includes('전기') || label.includes('EV') || label.includes('충전')) return '🔌';
    if (label.includes('기술상담')) return '💡';
    if (label.includes('농민 상담')) return '🧑‍🌾';
    if (label.includes('시설견적')) return '📄';
    if (label.includes('임대') && label.includes('농기계')) return '🚜';
    if (label.includes('외래') && label.includes('진료')) return '🩺';
    if (label.includes('응급실')) return '🚑';
    if (label.includes('중고') && label.includes('농기계')) return '🚜';
    if (label.includes('대여') && label.includes('농기계')) return '🧰';
    if (label.includes('반납')) return '↩️';
    if (label.includes('차량보관소')) return '🚗';
    if (label.includes('작업실')) return '🛠️';
    if (label.includes('상품구매') || label === '상점') return '🛒';
    if (label.includes('임시보관소')) return '📦';
    if (label.includes('사무실')) return '🏢';
    if (label.includes('인력대여')) return '🧑‍🌾';
    if (label.includes('하차장')) return '🚚';
    if (label.includes('휴게실') || label.includes('휴게소')) return '🛋️';
    if (label.includes('식당')) return '🍽️';
    if (label.includes('출고장')) return '📤';
    if (label.includes('은행 창구')) return '🪟';
    if (label.includes('입고') || label.includes('접수')) return '📝';
    if (label.includes('선별')) return '🍎';
    if (label.includes('저온창고')) return '❄️';
    if (label.includes('은행')) return '🏦';
    if (label.includes('ATM')) return '💳';
  }

  const actionKey = String(action?.key || '').trim();
  if (ENTRY_BUTTON_EMOJI_BY_KEY[actionKey]) return ENTRY_BUTTON_EMOJI_BY_KEY[actionKey];
  return '';
}

function resolveEntryButtonStaffEmoji(statusKey = '') {
  const normalizedStatusKey = String(statusKey || '').trim();
  return ENTRY_BUTTON_STAFF_EMOJI_BY_STATUS[normalizedStatusKey] || '🧑';
}

function EntryButtonStaffVisual({ action }) {
  const slots = Array.isArray(action?.staffVisualSlots) ? action.staffVisualSlots : [];
  if (!slots.length) return null;
  return (
    <span className="map-entry-btn__staff-grid" aria-hidden="true">
      {slots.map((slot, index) => {
        const statusKey = String(slot?.statusKey || '').trim();
        const isEmpty = Boolean(slot?.isEmpty);
        const emoji = isEmpty ? '▫️' : resolveEntryButtonStaffEmoji(statusKey);
        const statusLabel = String(slot?.statusLabel || (isEmpty ? '미배치' : '배치됨')).trim();
        return (
          <span
            key={`${String(action?.key || 'entry')}-staff-${index}`}
            className={`map-entry-btn__staff-slot ${isEmpty ? 'is-empty' : `is-${statusKey || 'working'}`}`.trim()}
            title={statusLabel}
          >
            {emoji}
          </span>
        );
      })}
    </span>
  );
}

function EntryButtonLabel({ action }) {
  const emoji = resolveEntryButtonEmoji(action);
  const hasStaffVisual = Array.isArray(action?.staffVisualSlots) && action.staffVisualSlots.length > 0;
  return (
    <span className="map-entry-btn__content">
      {emoji ? <span className="map-entry-btn__emoji" aria-hidden="true">{emoji}</span> : null}
      <span className="map-entry-btn__label">{action?.label}</span>
      {hasStaffVisual ? <EntryButtonStaffVisual action={action} /> : null}
      {!hasStaffVisual && action?.metaLabel ? <small className="map-entry-btn__meta">{action.metaLabel}</small> : null}
      {!hasStaffVisual && action?.detailLabel ? <small className="map-entry-btn__detail">{action.detailLabel}</small> : null}
    </span>
  );
}

export function MapEntryModal({
  className = 'confirm-modal confirm-modal--map-shop-entry',
  title,
  description = '원하는 기능을 선택해 주세요.',
  actions = [],
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="confirm-modal__title">{`${title} 입구`}</div>
      <div className="confirm-modal__desc">{description}</div>
      <div className="map-shop-entry-grid">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            className={`button button--ghost day-transition-animate-button map-shop-entry-btn ${action.className || ''}`.trim()}
            onClick={action.onClick}
          >
            <EntryButtonLabel action={action} />
          </button>
        ))}
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function MapBankEntryModal({
  className = 'confirm-modal confirm-modal--map-bank-entry',
  onOpenBankCounter,
  onOpenBankAtm,
  onOpenPickup,
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="confirm-modal__title">은행 입구</div>
      <div className="confirm-modal__desc">원하는 기능을 선택해 주세요.</div>
      <div className="map-bank-entry-grid">
        <button
          type="button"
          className="button button--ghost day-transition-animate-button map-shop-entry-btn"
          onClick={onOpenBankCounter}
        >
          <EntryButtonLabel action={{ key: 'bank-counter', label: '은행 창구' }} />
        </button>
        <button
          type="button"
          className="button button--ghost day-transition-animate-button map-shop-entry-btn"
          onClick={onOpenBankAtm}
        >
          <EntryButtonLabel action={{ key: 'atm', label: 'ATM 창구' }} />
        </button>
        <button
          type="button"
          className="button button--ghost day-transition-animate-button map-shop-entry-btn"
          onClick={onOpenPickup}
        >
          <EntryButtonLabel action={{ key: 'pickup', label: '물품 임시보관소' }} />
        </button>
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function MapBankServiceSelectModal({
  className = 'confirm-modal confirm-modal--map-bank-entry',
  title,
  description = '이용할 창구를 선택해 주세요.',
  actions = [],
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="confirm-modal__title">{title}</div>
      <div className="confirm-modal__desc">{description}</div>
      <div className="map-bank-entry-grid">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            className={`button button--ghost day-transition-animate-button map-shop-entry-btn map-bank-entry-btn ${action.busy ? 'is-busy' : ''}`.trim()}
            onClick={action.onClick}
          >
            <EntryButtonLabel action={action} />
            <span className="map-bank-entry-btn__status">{action.busy ? '사용중' : '사용가능'}</span>
          </button>
        ))}
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function MapDualShopModal({
  containerClassName,
  title,
  description,
  tabs = null,
  itemsContent,
  showCart = true,
  cartPanel = null,
  paymentDockedPlaceholder = null,
  floatingPlaceholder = null,
  onBack,
  onClose
}) {
  return (
    <>
      <div className={containerClassName}>
        <div className="confirm-modal confirm-modal--map-shop confirm-modal--map-shop-main">
          <div className="confirm-modal__title">{title}</div>
          <div className="confirm-modal__desc">{description}</div>
          {tabs}
          <div className="option-grid shop-option-grid map-shop-option-grid">
            {itemsContent}
          </div>
          <div className="footer-actions">
            <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
            <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
          </div>
        </div>
        {showCart ? (
          <div className="confirm-modal confirm-modal--map-shop-cart">
            {cartPanel}
          </div>
        ) : null}
        {paymentDockedPlaceholder}
      </div>
      {floatingPlaceholder}
    </>
  );
}

export function FuelStationShopModal({
  title = '주유소',
  description = '지도 마커에서 바로 여는 연료 상점입니다.',
  boardContent,
  kioskContent,
  transferPlaceholder = null,
  className = 'confirm-modal confirm-modal--map-shop',
  onBack,
  onClose
}) {
  return (
    <div className={className} style={{ width: 'min(1480px, calc(100vw - 30px))', height: 'min(860px, calc(100vh - 24px))' }}>
      <div className="confirm-modal__title">{title}</div>
      <div className="confirm-modal__desc">{description}</div>
      <div className="fuel-station-dual-panel" style={{ marginTop: 10, flex: 1 }}>
        <div className="fuel-tab-layout">
          <div className="fuel-tab-layout__left">{boardContent}</div>
          <div className="fuel-tab-layout__right">{kioskContent}</div>
        </div>
        {transferPlaceholder}
      </div>
      <div className="footer-actions">
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}
