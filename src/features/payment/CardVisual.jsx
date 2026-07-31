import React from 'react';

const cardFamilyOf = (card) => (Number(card?.minScore || 0) > 0 ? 'credit' : 'check');
const cardVariantOf = (card, hashCodeOf) => (hashCodeOf(String(card?.id || card?.name || 'card')) % 6) + 1;
const hasFuelBenefit = (card) => /주유/.test((Array.isArray(card?.benefits) ? card.benefits : []).join(' '));

function renderCardIllustration(type, key) {
  if (type === 'apple') {
    return (
      <svg key={key} className="sim-card-illu" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 12c3-5 9-4 10-2-4 0-6 2-7 4" fill="#2b6b3a" />
        <ellipse cx="20" cy="23" rx="11" ry="10" fill="#d53e33" />
        <ellipse cx="23.5" cy="22.5" rx="8.5" ry="8" fill="#be2f27" />
        <ellipse cx="15" cy="20" rx="3.5" ry="2.5" fill="rgba(255,255,255,0.35)" />
        <path d="M20 10c0-3 2-5 4-6" stroke="#3f2b1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'leaf') {
    return (
      <svg key={key} className="sim-card-illu" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M7 26c10-18 24-14 26-14-3 16-12 22-21 22-5 0-7-3-5-8z" fill="#42a95f" />
        <path d="M11 29c6-5 12-10 19-14" stroke="#e6ffe9" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'fuel') {
    return (
      <svg key={key} className="sim-card-illu" viewBox="0 0 40 40" aria-hidden="true">
        <rect x="9" y="9" width="15" height="22" rx="2.5" fill="#2b5460" />
        <rect x="12" y="12" width="9" height="7" rx="1.2" fill="#9dd0de" />
        <path d="M24 14h4l2 4v7c0 1 1 2 2 2" stroke="#2b5460" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M11 31h11v2H11z" fill="#1b3339" />
        <circle cx="16.5" cy="24.5" r="2" fill="#f2d16f" />
      </svg>
    );
  }
  return (
    <svg key={key} className="sim-card-illu" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="14" r="6" fill="#f3c89d" />
      <path d="M10 31c1-6 6-10 10-10s9 4 10 10" fill="#5a8f52" />
      <path d="M15 13c0-5 3-8 8-8 2 0 4 1 5 2-1 1-2 2-3 4-2-1-5-1-8 2z" fill="#3d2a1d" />
      <path d="M27 25l2.4-5 2.4 5z" fill="#74b964" />
      <rect x="28.4" y="25" width="1.2" height="5" fill="#5f8a4b" />
    </svg>
  );
}

export default function CardVisual({ card, vertical = false, hashCodeOf, pseudoCardNumber }) {
  if (!card) return null;
  const family = cardFamilyOf(card);
  const variant = cardVariantOf(card, hashCodeOf);
  const showFuelIcon = hasFuelBenefit(card);
  return (
    <div className={`sim-card sim-card--${family} sim-card--v${variant} ${vertical ? 'sim-card--vertical' : ''}`}>
      <div className="sim-card__chip" />
      <div className="sim-card__brand">{card.brand}</div>
      <div className="sim-card__number">{pseudoCardNumber(card.id || card.name || 'card')}</div>
      <div className="sim-card__holder">CARDHOLDER NAME</div>
      <div className="sim-card__tag">{family === 'credit' ? 'CREDIT' : 'DEBIT'}</div>
      {showFuelIcon ? (
        <div className="sim-card__icons">
          {renderCardIllustration('fuel', `${card.id}-illu-fuel`)}
        </div>
      ) : null}
    </div>
  );
}
