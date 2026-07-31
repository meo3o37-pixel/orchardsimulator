import React from 'react';
import { formatKg } from '../../utils/common';
import { isProcessingHarvestGradeLabel, normalizeHarvestGradeLabel } from '../../utils/harvestGrade';
import { isHarvestFullySortedBox } from '../storage/harvestBoxLabel';
import {
  ANIMATION_LAB_APPLE_CRATE_GREEN_ONE_THIRD_HTML,
  ANIMATION_LAB_APPLE_CRATE_GREEN_PACKED_HTML,
  ANIMATION_LAB_APPLE_CRATE_GREEN_TWO_THIRDS_HTML,
  ANIMATION_LAB_APPLE_CRATE_ONE_THIRD_HTML,
  ANIMATION_LAB_APPLE_CRATE_PACKED_HTML,
  ANIMATION_LAB_APPLE_CRATE_TWO_THIRDS_HTML
} from '../../data/animationLabPresets';

const HARVEST_BOX_CAPACITY_KG = 20;

const APPLE_CRATE_PREVIEW_HTML_BY_STATE = {
  yellow: {
    full: ANIMATION_LAB_APPLE_CRATE_PACKED_HTML,
    oneThird: ANIMATION_LAB_APPLE_CRATE_ONE_THIRD_HTML,
    twoThirds: ANIMATION_LAB_APPLE_CRATE_TWO_THIRDS_HTML
  },
  green: {
    full: ANIMATION_LAB_APPLE_CRATE_GREEN_PACKED_HTML,
    oneThird: ANIMATION_LAB_APPLE_CRATE_GREEN_ONE_THIRD_HTML,
    twoThirds: ANIMATION_LAB_APPLE_CRATE_GREEN_TWO_THIRDS_HTML
  }
};

const isAppleCrateKey = (key = '') => /appleContainer/i.test(String(key || ''));
const appleCrateToneOf = (key = '') => (/green/i.test(String(key || '')) ? 'green' : 'yellow');

const normalizePendingBoxImageKey = (key = '') => {
  const rawKey = String(key || '');
  if (rawKey === 'appleContainerYellow18kg') return 'appleContainerYellow20kg';
  if (rawKey === 'appleContainerGreen18kg') return 'appleContainerGreen20kg';
  return rawKey;
};

export const qualityStampToneClassOf = (labelRaw = '') => {
  const label = String(labelRaw || '');
  if (label.includes('가공')) return 'is-processing-grade';
  if (label.includes('불량')) return 'is-low';
  if (label.includes('특')) return 'is-premium';
  if (label.includes('상')) return 'is-high';
  if (label.includes('보통') || label.includes('중')) return 'is-normal';
  if (label.includes('하')) return 'is-low';
  return 'is-normal';
};

const harvestStampMetaOf = ({
  qualityLabel = '보통',
  gradeLabel = '미선별',
  sizeLabel = '미측정',
} = {}) => {
  const safeQualityLabel = String(qualityLabel || '보통').trim() || '보통';
  const safeGradeLabel = normalizeHarvestGradeLabel(gradeLabel, '미선별') || '미선별';
  const safeSizeLabel = String(sizeLabel || '미측정').trim() || '미측정';
  const isFullySorted = isHarvestFullySortedBox({
    gradeLabel: safeGradeLabel,
    sizeLabel: safeSizeLabel,
  });
  return {
    label: isFullySorted ? safeSizeLabel : safeQualityLabel,
    toneClass: qualityStampToneClassOf(isFullySorted ? safeGradeLabel : safeQualityLabel),
  };
};

const harvestGradeStampMetaOf = ({
  gradeLabel = '미선별',
} = {}) => {
  const safeGradeLabel = normalizeHarvestGradeLabel(gradeLabel, '미선별') || '미선별';
  if (!safeGradeLabel || safeGradeLabel === '미선별') return null;
  return {
    label: safeGradeLabel,
    toneClass: qualityStampToneClassOf(safeGradeLabel),
  };
};

const stemStampMetaOf = ({
  stemStatusKey = '',
  stemStatusLabel = '',
  stemRemoved,
} = {}) => {
  const normalizedKey = String(stemStatusKey || '').trim().toLowerCase();
  const normalizedLabel = String(stemStatusLabel || '').trim();

  if (normalizedLabel.includes('제거')) return { label: '꼭지 제거', toneClass: 'is-removed' };
  if (normalizedLabel.includes('있음')) return { label: '꼭지 있음', toneClass: 'is-attached' };

  if (['removed', 'stemremoved', 'detached', 'clean', 'off'].includes(normalizedKey)) {
    return { label: '꼭지 제거', toneClass: 'is-removed' };
  }
  if (['attached', 'stemattached', 'withstem', 'raw', 'on'].includes(normalizedKey)) {
    return { label: '꼭지 있음', toneClass: 'is-attached' };
  }

  if (typeof stemRemoved === 'boolean') {
    return stemRemoved
      ? { label: '꼭지 제거', toneClass: 'is-removed' }
      : { label: '꼭지 있음', toneClass: 'is-attached' };
  }

  return null;
};

const transparentizeAppleCratePreviewHtml = (html = '') => String(html || '')
  .replace(
    /body\s*\{[\s\S]*?background:[\s\S]*?overflow:\s*hidden;\s*\}/,
    `body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: transparent;
    overflow: hidden;
  }`
  )
  .replace(
    /\.shadow\s*\{[\s\S]*?\}/,
    `.shadow {
    display: none;
  }`
  );

const appleFreshnessVisualProfileOf = (lifeRaw = 100) => {
  const life = Math.max(0, Math.min(100, Number(lifeRaw) || 0));
  if (life >= 80) {
    return {
      filter: 'saturate(1) brightness(1) contrast(1)',
      fillOpacity: 1,
      loadOpacity: 1,
    };
  }
  if (life >= 60) {
    return {
      filter: 'saturate(0.96) brightness(0.99) contrast(0.995)',
      fillOpacity: 0.97,
      loadOpacity: 0.98,
    };
  }
  if (life >= 40) {
    return {
      filter: 'saturate(0.88) brightness(0.95) contrast(0.98) hue-rotate(-4deg)',
      fillOpacity: 0.92,
      loadOpacity: 0.95,
    };
  }
  if (life >= 20) {
    return {
      filter: 'saturate(0.76) brightness(0.9) contrast(0.96) sepia(0.08) hue-rotate(-7deg)',
      fillOpacity: 0.86,
      loadOpacity: 0.91,
    };
  }
  return {
    filter: 'saturate(0.64) brightness(0.84) contrast(0.94) sepia(0.16) hue-rotate(-10deg)',
    fillOpacity: 0.78,
    loadOpacity: 0.86,
  };
};

const applyAppleFreshnessToPreviewHtml = (html = '', lifeRaw = 100) => {
  const { filter, fillOpacity, loadOpacity } = appleFreshnessVisualProfileOf(lifeRaw);
  const freshnessCss = `
  :root {
    --apple-freshness-filter: ${filter};
    --apple-freshness-fill-opacity: ${fillOpacity};
    --apple-freshness-load-opacity: ${loadOpacity};
  }

  .apple-crate-preview__apple,
  .apple-crate-preview__load::before,
  .apple-crate-preview__inner-fill::before {
    filter: var(--apple-freshness-filter);
  }

  .apple-crate-preview__load::before {
    opacity: calc(0.98 * var(--apple-freshness-load-opacity));
  }

  .apple-crate-preview__inner-fill::before {
    opacity: calc(0.48 * var(--apple-freshness-fill-opacity));
  }`;

  return String(html || '').replace('</style>', `${freshnessCss}\n</style>`);
};

const appleCratePreviewHtmlOf = (tone = 'yellow', fillRatio = 1, life = 100) => {
  const palette = APPLE_CRATE_PREVIEW_HTML_BY_STATE[tone] || APPLE_CRATE_PREVIEW_HTML_BY_STATE.yellow;
  const raw = fillRatio >= 0.99
    ? palette.full
    : (fillRatio >= (2 / 3) ? palette.twoThirds : palette.oneThird);
  return applyAppleFreshnessToPreviewHtml(transparentizeAppleCratePreviewHtml(raw), life);
};

export function AppleCratePreview({
  tone = 'yellow',
  fillRatio = 1,
  life = 100,
  fillLabel = '',
  overlay = null,
  title = '',
  ariaLabel = '',
}) {
  const srcDoc = appleCratePreviewHtmlOf(tone, fillRatio, life);
  const resolvedTitle = String(title || '').trim();
  const resolvedAriaLabel = String(ariaLabel || resolvedTitle || '').trim();
  return (
    <div
      className={`apple-crate-preview apple-crate-preview--${tone}`}
      title={resolvedTitle || undefined}
      aria-label={resolvedAriaLabel || undefined}
    >
      <iframe
        className="apple-crate-preview__frame"
        title={fillLabel ? `사과 컨테이너 ${fillLabel}` : '사과 컨테이너'}
        srcDoc={srcDoc}
        scrolling="no"
      />
      {overlay ? (
        <div className="apple-crate-preview__overlay">
          {overlay}
        </div>
      ) : null}
    </div>
  );
}

export function HarvestQualityStampedCrate({
  tone = 'yellow',
  fillRatio = 1,
  life = 100,
  fillLabel = '',
  qualityLabel = '보통',
  gradeLabel = '미선별',
  sizeLabel = '미측정',
  stemStatusKey = '',
  stemStatusLabel = '',
  stemRemoved,
  className = ''
}) {
  const stemStampMeta = stemStampMetaOf({ stemStatusKey, stemStatusLabel, stemRemoved });
  const stampMeta = harvestStampMetaOf({ qualityLabel, gradeLabel, sizeLabel });
  const gradeStampMeta = harvestGradeStampMetaOf({ gradeLabel, sizeLabel });
  return (
    <div className={['harvest-quality-stamped-crate', className].filter(Boolean).join(' ')}>
      {gradeStampMeta ? (
        <div className="harvest-plan-pending-box__grade-stamp">
          <div className={`harvest-quality-stamp harvest-quality-stamp--compact harvest-quality-stamp--grade ${gradeStampMeta.toneClass}`}>
            <span className="harvest-quality-stamp__ink" aria-hidden="true" />
            <span className="harvest-quality-stamp__frame" aria-hidden="true" />
            <em>{gradeStampMeta.label}</em>
          </div>
        </div>
      ) : null}
      <div className={`harvest-plan-pending-box__stamp ${isProcessingHarvestGradeLabel(gradeLabel) ? 'is-processing' : ''}`.trim()}>
        <div className={`harvest-quality-stamp harvest-quality-stamp--compact ${stampMeta.toneClass}`}>
          <span className="harvest-quality-stamp__ink" aria-hidden="true" />
          <span className="harvest-quality-stamp__frame" aria-hidden="true" />
          <em>{stampMeta.label}</em>
        </div>
      </div>
      <div className="harvest-plan-pending-box__thumb harvest-plan-pending-box__thumb--crate">
        <AppleCratePreview tone={tone} fillRatio={fillRatio} life={life} fillLabel={fillLabel} />
      </div>
      {stemStampMeta ? (
        <div className={`harvest-stem-stamp ${stemStampMeta.toneClass}`}>
          <span className="harvest-stem-stamp__ring" aria-hidden="true" />
          <strong>{stemStampMeta.label.replace(' ', '\n')}</strong>
        </div>
      ) : null}
    </div>
  );
}

function buildPendingDisplayCards(rows, boxCapacityKg = HARVEST_BOX_CAPACITY_KG) {
  const explicitSourceCards = rows.flatMap((row) => {
    const sourceBatchIds = Array.isArray(row?.sourceBatchIds)
      ? row.sourceBatchIds.map((value) => String(value || '')).filter(Boolean)
      : [];
    const sourceBoxUnitNos = Array.isArray(row?.sourceBoxUnitNos)
      ? row.sourceBoxUnitNos.map((value) => Math.max(0, Math.floor(Number(value) || 0))).filter((value) => value > 0)
      : [];
    const sourceBatchId = String(row?.sourceBatchId || sourceBatchIds[0] || '');
    const sourceBoxUnitNo = Math.max(0, Math.floor(Number(row?.sourceBoxUnitNo || sourceBoxUnitNos[0]) || 0));
    if (!sourceBatchId && sourceBoxUnitNo <= 0 && !sourceBatchIds.length && !sourceBoxUnitNos.length) return [];
    const cards = [];
    const imageItemKey = normalizePendingBoxImageKey(row?.imageItemKey);
    const qualityLabel = String(row?.qualityLabel || '보통');
    const cropLabel = String(row?.cropLabel || '기타');
    const cropId = String(row?.cropId || '');
    const qty = Math.max(0, Number(row?.qty) || 0);
    const remainderKg = Math.max(0, Number(row?.remainderKg) || 0);
    const fullBoxQtyKg = Math.max(0, qty - remainderKg);
    const fullBoxCount = Math.max(0, Math.floor(fullBoxQtyKg / boxCapacityKg));
    const sourceKey = sourceBatchId || `unit-${sourceBoxUnitNo}`;
    const sharedCardMeta = {
      displayKey: String(row?.displayKey || row?.key || ''),
      sourceFacilityKey: String(row?.sourceFacilityKey || ''),
      sourceSlotNo: Math.max(0, Math.floor(Number(row?.sourceSlotNo) || 0)),
      isHarvestStoredBox: Boolean(row?.isHarvestStoredBox),
      loadBoxKey: imageItemKey,
      harvestedDay: Math.max(0, Number(row?.harvestedDay) || 0),
      life: Math.max(0, Number(row?.life) || 0),
      gradeLabel: normalizeHarvestGradeLabel(row?.gradeLabel, '미선별') || '미선별',
      sizeLabel: String(row?.sizeLabel || '').trim() || '미측정',
      produceTypeLabel: String(row?.produceTypeLabel || '사과')
    };
    if (fullBoxCount > 0 && fullBoxQtyKg > 0.001) {
      cards.push({
        id: `full-${sourceKey}`,
        title: qualityLabel,
        value: `${cropLabel} ${fullBoxCount}박스`,
        tone: 'quality',
        imageItemKey,
        cropLabel,
        cropId,
        qualityLabel,
        boxCount: fullBoxCount,
        qtyKg: fullBoxQtyKg,
        fillRatio: 1,
        fillLabel: '',
        cardKind: 'full',
        sourceBatchId,
        sourceBoxUnitNo,
        sourceBatchIds,
        sourceBoxUnitNos,
        stemStatusKey: String(row?.stemStatusKey || row?.stemStatus || ''),
        stemStatusLabel: String(row?.stemStatusLabel || row?.stemLabel || ''),
        stemRemoved: typeof row?.stemRemoved === 'boolean' ? row.stemRemoved : undefined,
        qty: fullBoxCount,
        ...sharedCardMeta
      });
    }
    if (Boolean(row?.hasRemainder) && remainderKg > 0.001) {
      const fillStep = Math.max(1, Math.min(2, Math.floor(Number(row?.sourceFillStep) || 1)));
      const fillRatio = fillStep / 3;
      const fillLabel = `${fillStep}/3`;
      cards.push({
        id: `partial-${sourceKey}-${fillStep}`,
        title: qualityLabel,
        value: `${cropLabel} ${fillLabel}박스`,
        detailText: `잔량 ${formatKg(remainderKg, 2)}kg`,
        tone: 'partial',
        imageItemKey,
        fillRatio,
        fillLabel,
        cropLabel,
        cropId,
        qualityLabel,
        boxCount: 0,
        qtyKg: remainderKg,
        cardKind: 'partial',
        sourceBatchId,
        sourceBoxUnitNo,
        sourceBatchIds,
        sourceBoxUnitNos,
        sourceFillStep: fillStep,
        stemStatusKey: String(row?.stemStatusKey || row?.stemStatus || ''),
        stemStatusLabel: String(row?.stemStatusLabel || row?.stemLabel || ''),
        stemRemoved: typeof row?.stemRemoved === 'boolean' ? row.stemRemoved : undefined,
        qty: 1,
        ...sharedCardMeta
      });
    }
    return cards;
  });
  if (explicitSourceCards.length) return explicitSourceCards;

  const fullBoxBuckets = new Map();
  const partialBoxBuckets = new Map();

  rows.forEach((row, index) => {
    const qty = Math.max(0, Number(row?.qty) || 0);
    const remainderKg = Math.max(0, Number(row?.remainderKg) || 0);
    const hasRemainder = Boolean(row?.hasRemainder) && remainderKg > 0.001;
    const fullBoxCount = Math.max(0, Math.floor((qty - remainderKg) / boxCapacityKg));
    if (fullBoxCount > 0) {
      const imageItemKey = normalizePendingBoxImageKey(row?.imageItemKey);
      const qualityLabel = String(row?.qualityLabel || '보통');
      const cropLabel = String(row?.cropLabel || '기타');
      const gradeLabel = normalizeHarvestGradeLabel(row?.gradeLabel, '미선별') || '미선별';
      const sizeLabel = String(row?.sizeLabel || '').trim() || '미측정';
      const bucketKey = `${imageItemKey || `no-image-${index + 1}`}::${qualityLabel}::${cropLabel}::${String(row?.stemStatusKey || row?.stemStatus || (row?.stemRemoved ? 'removed' : 'attached'))}::${gradeLabel}::${sizeLabel}`;
      const bucket = fullBoxBuckets.get(bucketKey) || {
        id: `full-${bucketKey}`,
        tone: 'quality',
        imageItemKey,
        boxCount: 0,
        title: qualityLabel,
        cropLabel,
        cropId: String(row?.cropId || ''),
        gradeLabel,
        sizeLabel,
        produceTypeLabel: String(row?.produceTypeLabel || '사과'),
        stemStatusKey: String(row?.stemStatusKey || row?.stemStatus || ''),
        stemStatusLabel: String(row?.stemStatusLabel || row?.stemLabel || ''),
        stemRemoved: typeof row?.stemRemoved === 'boolean' ? row.stemRemoved : undefined
      };
      bucket.boxCount += fullBoxCount;
      fullBoxBuckets.set(bucketKey, bucket);
    }
    if (hasRemainder) {
      const ratio = Math.max(0, Math.min(1, remainderKg / boxCapacityKg));
      const fillStep = ratio > (1 / 3) ? 2 : 1;
      const fillRatio = fillStep / 3;
      const fillLabel = `${fillStep}/3`;
      const cropLabel = String(row?.cropLabel || '기타');
      const imageItemKey = normalizePendingBoxImageKey(row?.imageItemKey);
      const qualityLabel = String(row?.qualityLabel || '보통');
      const gradeLabel = normalizeHarvestGradeLabel(row?.gradeLabel, '미선별') || '미선별';
      const sizeLabel = String(row?.sizeLabel || '').trim() || '미측정';
      const bucketKey = `${imageItemKey || `no-image-${index + 1}`}::${qualityLabel}::${cropLabel}::${String(row?.stemStatusKey || row?.stemStatus || (row?.stemRemoved ? 'removed' : 'attached'))}::${gradeLabel}::${sizeLabel}::${fillStep}`;
      const bucket = partialBoxBuckets.get(bucketKey) || {
        id: `partial-${bucketKey}`,
        title: qualityLabel,
        tone: 'partial',
        imageItemKey,
        cropLabel,
        cropId: String(row?.cropId || ''),
        gradeLabel,
        sizeLabel,
        produceTypeLabel: String(row?.produceTypeLabel || '사과'),
        fillStep,
        fillRatio,
        fillLabel,
        qtyKg: 0,
        stemStatusKey: String(row?.stemStatusKey || row?.stemStatus || ''),
        stemStatusLabel: String(row?.stemStatusLabel || row?.stemLabel || ''),
        stemRemoved: typeof row?.stemRemoved === 'boolean' ? row.stemRemoved : undefined
      };
      bucket.qtyKg += remainderKg;
      partialBoxBuckets.set(bucketKey, bucket);
    }
  });

  const fullBoxCards = Array.from(fullBoxBuckets.values()).map((bucket) => ({
    id: bucket.id,
    title: bucket.title,
    value: `${String(bucket.cropLabel || '기타')} ${Math.max(0, Number(bucket.boxCount) || 0)}박스`,
    tone: bucket.tone,
    imageItemKey: bucket.imageItemKey,
    cropLabel: String(bucket.cropLabel || '기타'),
    cropId: String(bucket.cropId || ''),
    qualityLabel: String(bucket.title || '보통'),
    gradeLabel: normalizeHarvestGradeLabel(bucket.gradeLabel, '미선별') || '미선별',
    sizeLabel: String(bucket.sizeLabel || '').trim() || '미측정',
    produceTypeLabel: String(bucket.produceTypeLabel || '사과'),
    boxCount: Math.max(0, Number(bucket.boxCount) || 0),
    qtyKg: Math.max(0, Number(bucket.boxCount) || 0) * boxCapacityKg,
    fillRatio: 1,
    fillLabel: '',
    cardKind: 'full',
    stemStatusKey: String(bucket?.stemStatusKey || ''),
    stemStatusLabel: String(bucket?.stemStatusLabel || ''),
    stemRemoved: typeof bucket?.stemRemoved === 'boolean' ? bucket.stemRemoved : undefined
  }));

  const partialBoxCards = Array.from(partialBoxBuckets.values()).map((bucket) => ({
    id: bucket.id,
    title: bucket.title,
    value: `${String(bucket.cropLabel || '기타')} ${bucket.fillLabel}박스`,
    detailText: `잔량 ${formatKg(bucket.qtyKg, 2)}kg`,
    tone: 'partial',
    imageItemKey: bucket.imageItemKey,
    fillRatio: bucket.fillRatio,
    fillLabel: bucket.fillLabel,
    cropLabel: String(bucket.cropLabel || '기타'),
    cropId: String(bucket.cropId || ''),
    qualityLabel: String(bucket.title || '보통'),
    gradeLabel: normalizeHarvestGradeLabel(bucket.gradeLabel, '미선별') || '미선별',
    sizeLabel: String(bucket.sizeLabel || '').trim() || '미측정',
    produceTypeLabel: String(bucket.produceTypeLabel || '사과'),
    boxCount: 0,
    qtyKg: Math.max(0, Number(bucket.qtyKg) || 0),
    cardKind: 'partial',
    stemStatusKey: String(bucket?.stemStatusKey || ''),
    stemStatusLabel: String(bucket?.stemStatusLabel || ''),
    stemRemoved: typeof bucket?.stemRemoved === 'boolean' ? bucket.stemRemoved : undefined
  }));

  return [...fullBoxCards, ...partialBoxCards];
}

export default function HarvestPendingBoxesPanel({
  title = '대기 박스 목록',
  pendingLoadSummary,
  pendingLoadBoxSummary,
  pendingLoadLabel,
  pendingLoadImageSrc,
  pendingLoadImageItemKey,
  emptyText = '현재 운반 대기 박스가 없습니다.',
  layout = 'grid',
  className = '',
  panelClassName = '',
  selectedCardIds = [],
  onToggleCard = null,
  onCardClick = null,
  crateCountOverlay = false,
  renderCardFooter = null,
}) {
  const effectivePendingLoadSummary = pendingLoadSummary || pendingLoadBoxSummary || null;
  const pendingRows = Array.isArray(effectivePendingLoadSummary?.groupedRows) ? effectivePendingLoadSummary.groupedRows : [];
  const explicitDisplayCards = Array.isArray(effectivePendingLoadSummary?.displayCards)
    ? effectivePendingLoadSummary.displayCards
    : [];
  const pendingCards = explicitDisplayCards.length ? explicitDisplayCards : buildPendingDisplayCards(pendingRows);
  const selectedIdSet = new Set((selectedCardIds || []).map((id) => String(id || '')));
  const gridClassName = [
    'harvest-plan-pending-grid',
    'harvest-plan-pending-grid--grouped',
    layout === 'row' ? 'harvest-plan-pending-grid--row' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={['harvest-plan-pending-panel', 'harvest-plan-pending-panel--shared', panelClassName].filter(Boolean).join(' ')}>
      {title ? (
        <div className="harvest-plan-pending-panel__head">
          <strong>{title}</strong>
        </div>
      ) : null}
      <div className="harvest-plan-pending-panel__body">
        {pendingCards.length ? (
          <div className={gridClassName}>
            {pendingCards.map((card) => {
              const imageItemKey = normalizePendingBoxImageKey(card?.imageItemKey || pendingLoadImageItemKey);
              const showCratePreview = isAppleCrateKey(imageItemKey);
              const crateTone = appleCrateToneOf(imageItemKey);
              const imageSrc = showCratePreview ? '' : pendingLoadImageSrc;
              const isSelectable = typeof onToggleCard === 'function';
              const isClickable = typeof onCardClick === 'function';
              const isSelected = selectedIdSet.has(String(card?.id || ''));
              const CardTag = isSelectable || isClickable ? 'button' : 'div';
              const stemStampMeta = stemStampMetaOf({
                stemStatusKey: card?.stemStatusKey,
                stemStatusLabel: card?.stemStatusLabel,
                stemRemoved: card?.stemRemoved,
              });
              const stampMeta = harvestStampMetaOf({
                qualityLabel: card?.title || card?.qualityLabel || '보통',
                gradeLabel: card?.gradeLabel || '미선별',
                sizeLabel: card?.sizeLabel || '미측정',
              });
              const gradeStampMeta = harvestGradeStampMetaOf({
                gradeLabel: card?.gradeLabel || '미선별',
                sizeLabel: card?.sizeLabel || '미측정',
              });
              return (
                <CardTag
                  key={card.id}
                  className={`harvest-plan-pending-box harvest-plan-pending-box--${card.tone} ${isSelectable || isClickable ? 'is-selectable' : ''} ${isSelected ? 'is-selected' : ''}`.trim()}
                  type={isSelectable || isClickable ? 'button' : undefined}
                  aria-pressed={isSelectable ? isSelected : undefined}
                  onClick={isSelectable || isClickable ? () => {
                    if (isSelectable) onToggleCard(card.id);
                    if (isClickable) onCardClick(card);
                  } : undefined}
                >
                  {gradeStampMeta ? (
                    <div className="harvest-plan-pending-box__grade-stamp">
                      <div className={`harvest-quality-stamp harvest-quality-stamp--compact harvest-quality-stamp--grade ${gradeStampMeta.toneClass}`}>
                        <span className="harvest-quality-stamp__ink" aria-hidden="true" />
                        <span className="harvest-quality-stamp__frame" aria-hidden="true" />
                        <em>{gradeStampMeta.label}</em>
                      </div>
                    </div>
                  ) : null}
                  <div className={`harvest-plan-pending-box__stamp ${isProcessingHarvestGradeLabel(card?.gradeLabel) ? 'is-processing' : ''}`.trim()}>
                    <div className={`harvest-quality-stamp harvest-quality-stamp--compact ${stampMeta.toneClass}`}>
                      <span className="harvest-quality-stamp__ink" aria-hidden="true" />
                      <span className="harvest-quality-stamp__frame" aria-hidden="true" />
                      <em>{stampMeta.label}</em>
                    </div>
                  </div>
                  {stemStampMeta ? (
                    <div className={`harvest-stem-stamp ${stemStampMeta.toneClass}`}>
                      <span className="harvest-stem-stamp__ring" aria-hidden="true" />
                      <strong>{stemStampMeta.label.replace(' ', '\n')}</strong>
                    </div>
                  ) : null}
                  <div className="harvest-plan-pending-box__visual">
                    <div className={`harvest-plan-pending-box__thumb ${showCratePreview ? 'harvest-plan-pending-box__thumb--crate' : ''}`}>
                      {showCratePreview ? (
                        <AppleCratePreview
                          tone={crateTone}
                          fillRatio={card.fillRatio ?? 1}
                          life={card?.life}
                          fillLabel={card.fillLabel || ''}
                          overlay={crateCountOverlay ? (
                            <span className="harvest-plan-pending-box__count harvest-plan-pending-box__count--overlay">
                              {card.value}
                            </span>
                          ) : null}
                        />
                      ) : imageSrc ? (
                        <img src={imageSrc} alt={pendingLoadLabel || '운반 대기 박스'} />
                      ) : (
                        <span>박스</span>
                      )}
                    </div>
                    {!showCratePreview || !crateCountOverlay ? (
                      <span className="harvest-plan-pending-box__count">{card.value}</span>
                    ) : null}
                    {card.detailText ? (
                      <span className="harvest-plan-pending-box__detail">{card.detailText}</span>
                    ) : null}
                  </div>
                  {typeof renderCardFooter === 'function' ? renderCardFooter(card) : null}
                </CardTag>
              );
            })}
          </div>
        ) : (
          <div className="harvest-plan-pending-panel__empty">{emptyText}</div>
        )}
      </div>
    </div>
  );
}
