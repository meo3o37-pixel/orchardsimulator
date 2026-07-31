import React from 'react';

const qualityStampToneClassOf = (labelRaw = '') => {
  const label = String(labelRaw || '');
  if (label.includes('특')) return 'is-premium';
  if (label.includes('상')) return 'is-high';
  if (label.includes('보통') || label.includes('중')) return 'is-normal';
  if (label.includes('하')) return 'is-low';
  return 'is-normal';
};

const isAppleCrateKey = (key = '') => /appleContainer/i.test(String(key || ''));
const appleCrateToneOf = (key = '') => (/green/i.test(String(key || '')) ? 'green' : 'yellow');

function AppleCratePreview({ tone = 'yellow' }) {
  return (
    <div className={`apple-crate-preview apple-crate-preview--${tone}`}>
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
        <div className="apple-crate-preview__side-frame apple-crate-preview__side-frame--left" />
        <div className="apple-crate-preview__side-frame apple-crate-preview__side-frame--right" />
        <div className="apple-crate-preview__corner apple-crate-preview__corner--1" />
        <div className="apple-crate-preview__corner apple-crate-preview__corner--2" />
      </div>
    </div>
  );
}

export default function HarvestPendingLoadSummary({
  title = '운반 대기',
  summary,
  pendingKg,
  imageSrc,
  imageItemKey = '',
  hintText = '',
  countOnly = false,
  showImage = true
}) {
  const groupedRows = Array.isArray(summary?.groupedRows) ? summary.groupedRows : [];
  const fullBoxes = Math.max(0, Number(summary?.fullBoxes) || 0);
  const hasRemainderBox = Boolean(summary?.hasRemainderBox);
  const countLabel = hasRemainderBox
    ? (fullBoxes > 0 ? `${fullBoxes}박스 + 잔량박스 1` : '잔량박스 1')
    : `${fullBoxes}박스`;
  const showCratePreview = isAppleCrateKey(imageItemKey);

  return (
    <div className="harvest-pending-summary">
      <span>{title}</span>
      <div className="harvest-pending-summary__body">
        {showImage ? (
          <div className={`harvest-pending-summary__thumb ${showCratePreview ? 'harvest-pending-summary__thumb--crate' : ''}`}>
            {showCratePreview ? (
              <AppleCratePreview tone={appleCrateToneOf(imageItemKey)} />
            ) : imageSrc ? (
              <img src={imageSrc} alt="담은 박스" />
            ) : (
              <span>박스</span>
            )}
          </div>
        ) : null}
        <div className="harvest-pending-summary__copy">
          <div className="harvest-pending-summary__stamps">
            {countOnly ? (
              <div className="harvest-pending-summary__count-only">
                <strong>{countLabel}</strong>
              </div>
            ) : groupedRows.length ? groupedRows.map((row, index) => (
              <div
                key={`pending-quality-row-${row.qualityLabel}-${index + 1}`}
                className={`harvest-quality-stamp ${qualityStampToneClassOf(row.qualityLabel)}`}
              >
                <span className="harvest-quality-stamp__ink" aria-hidden="true" />
                <span className="harvest-quality-stamp__frame" aria-hidden="true" />
                <em>{row.qualityLabel}</em>
                <strong>{row.boxText}</strong>
              </div>
            )) : (
              <strong>{countLabel}</strong>
            )}
          </div>
        </div>
      </div>
      <small>{hintText || `${Math.max(0, Number(pendingKg) || 0).toLocaleString()}kg`}</small>
    </div>
  );
}
