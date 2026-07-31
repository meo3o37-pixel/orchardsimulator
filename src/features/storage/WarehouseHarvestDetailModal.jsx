import React from 'react';
import { PROCESSING_GRADE_LABEL, LEGACY_PROCESSING_GRADE_LABEL, normalizeHarvestGradeLabel } from '../../utils/harvestGrade';
import HarvestPendingBoxesPanel from '../harvest/HarvestPendingBoxesPanel';
import { storageSlotLabelOf } from './storageSlotModel';

const GRADE_ORDER = Object.freeze({
  미선별: 0,
  'A급': 1,
  'B급': 2,
  [PROCESSING_GRADE_LABEL]: 3,
  [LEGACY_PROCESSING_GRADE_LABEL]: 3,
});

const normalizeLayerLabel = (value) => {
  const label = String(value || '').trim();
  if (!label) return '1층';
  if (label === '1단') return '1층';
  if (label === '2단') return '2층';
  return label;
};

const ratioPercentTextOf = (count, totalCount) => {
  if (totalCount <= 0) return '0%';
  return `${Math.round((Math.max(0, Number(count) || 0) / totalCount) * 100)}%`;
};

export default function WarehouseHarvestDetailModal({
  slot,
  locationLabel,
  layer,
  summary,
  imageSrc,
  batchRows,
  cardSections,
  canMergeRemainders = false,
  mergeRemaindersLabel = '',
  onMergeRemainders,
  selectedCardId = '',
  onSelectCard = null,
}) {
  if (!slot) return null;

  const targetLayerLabel = layer === 'top' ? '2층' : '1층';
  const descText = slot.isHarvestStored
    ? `${locationLabel} · ${targetLayerLabel} 수확물 보관 정보`
    : `${locationLabel} · 팔레트 상태 정보`;

  const layerRows = React.useMemo(
    () => (Array.isArray(batchRows)
      ? batchRows.filter((row) => normalizeLayerLabel(row?.layerLabel || '1층') === targetLayerLabel)
      : []),
    [batchRows, targetLayerLabel]
  );

  const layerRowCount = layerRows.length;

  const gradeSummaryRows = React.useMemo(
    () => Object.entries(
      layerRows.reduce((acc, row) => {
        const gradeLabel = normalizeHarvestGradeLabel(row?.gradeLabel, '미선별') || '미선별';
        acc[gradeLabel] = Math.max(0, Number(acc[gradeLabel]) || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => {
      const aOrder = Number.isFinite(GRADE_ORDER[a[0]]) ? GRADE_ORDER[a[0]] : 99;
      const bOrder = Number.isFinite(GRADE_ORDER[b[0]]) ? GRADE_ORDER[b[0]] : 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return String(a[0]).localeCompare(String(b[0]), 'ko');
    }),
    [layerRows]
  );

  const qualitySummaryRows = React.useMemo(
    () => Object.entries(
      layerRows.reduce((acc, row) => {
        const qualityLabel = String(row?.qualityLabel || '').trim() || '보통';
        acc[qualityLabel] = Math.max(0, Number(acc[qualityLabel]) || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => Number(b[1]) - Number(a[1]) || String(a[0]).localeCompare(String(b[0]), 'ko')),
    [layerRows]
  );

  const sizeSummaryRows = React.useMemo(
    () => Object.entries(
      layerRows.reduce((acc, row) => {
        const sizeLabel = String(row?.sizeLabel || '').trim() || '미측정';
        acc[sizeLabel] = Math.max(0, Number(acc[sizeLabel]) || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => {
      const aDie = Number(String(a[0]).replace(/[^0-9]/g, '')) || 999;
      const bDie = Number(String(b[0]).replace(/[^0-9]/g, '')) || 999;
      if (aDie !== bDie) return aDie - bDie;
      return String(a[0]).localeCompare(String(b[0]), 'ko');
    }),
    [layerRows]
  );

  return (
    <div className="warehouse-harvest-detail-pane warehouse-harvest-detail-pane--enter">
      <div className="confirm-modal__desc">{descText}</div>
      {slot.isHarvestStored ? (
        <div className="meter__hint facility-storage-harvest-detail-summary">
          {`총 ${Math.max(0, Number(summary?.totalBoxes) || 0).toLocaleString()}상자 · 총무게 ${Math.max(0, Number(summary?.totalWeightKg) || 0).toLocaleString()}kg`}
        </div>
      ) : null}
      {slot.isHarvestStored && layerRowCount > 0 ? (
        <div className="facility-storage-harvest-detail-ratio">
          <div className="facility-storage-harvest-detail-ratio__grid">
            <div className="facility-storage-harvest-detail-ratio__card">
              <strong>급 비율</strong>
              <div className="facility-storage-harvest-detail-ratio__bars facility-storage-harvest-detail-ratio__bars--scrollable">
                {gradeSummaryRows.map(([label, count]) => (
                  <div key={`harvest-detail-grade-${label}`} className="facility-storage-harvest-detail-ratio__row">
                    <div className="facility-storage-harvest-detail-ratio__head">
                      <span>{label}</span>
                      <strong>{ratioPercentTextOf(count, layerRowCount)}</strong>
                    </div>
                    <div className="facility-storage-harvest-detail-ratio__track" aria-hidden="true">
                      <span
                        className="facility-storage-harvest-detail-ratio__fill facility-storage-harvest-detail-ratio__fill--grade"
                        style={{ width: ratioPercentTextOf(count, layerRowCount) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="facility-storage-harvest-detail-ratio__card">
              <strong>품질 비율</strong>
              <div className="facility-storage-harvest-detail-ratio__bars facility-storage-harvest-detail-ratio__bars--scrollable">
                {qualitySummaryRows.map(([label, count]) => (
                  <div key={`harvest-detail-quality-${label}`} className="facility-storage-harvest-detail-ratio__row">
                    <div className="facility-storage-harvest-detail-ratio__head">
                      <span>{label}</span>
                      <strong>{ratioPercentTextOf(count, layerRowCount)}</strong>
                    </div>
                    <div className="facility-storage-harvest-detail-ratio__track" aria-hidden="true">
                      <span
                        className="facility-storage-harvest-detail-ratio__fill facility-storage-harvest-detail-ratio__fill--quality"
                        style={{ width: ratioPercentTextOf(count, layerRowCount) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="facility-storage-harvest-detail-ratio__card">
              <strong>크기 비율</strong>
              <div className="facility-storage-harvest-detail-ratio__bars facility-storage-harvest-detail-ratio__bars--scrollable">
                {sizeSummaryRows.map(([label, count]) => (
                  <div key={`harvest-detail-size-${label}`} className="facility-storage-harvest-detail-ratio__row">
                    <div className="facility-storage-harvest-detail-ratio__head">
                      <span>{label}</span>
                      <strong>{ratioPercentTextOf(count, layerRowCount)}</strong>
                    </div>
                    <div className="facility-storage-harvest-detail-ratio__track" aria-hidden="true">
                      <span
                        className="facility-storage-harvest-detail-ratio__fill facility-storage-harvest-detail-ratio__fill--grade"
                        style={{ width: ratioPercentTextOf(count, layerRowCount) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {slot.isHarvestStored && canMergeRemainders ? (
        <div className="footer-actions" style={{ justifyContent: 'flex-start', marginTop: 10 }}>
          <button
            type="button"
            className="button button--ghost button--compact facility-workbench-install-button"
            onClick={onMergeRemainders}
          >
            {mergeRemaindersLabel || '잔량 합치기'}
          </button>
        </div>
      ) : null}
      {imageSrc && !batchRows.length ? (
        <div className="shop-item-detail-modal__hero">
          <img
            src={imageSrc}
            alt={storageSlotLabelOf('harvest', slot.slotNo, { oneBased: true })}
            loading="lazy"
          />
        </div>
      ) : null}
      {cardSections.length ? (
        <div className="facility-storage-harvest-detail-sections" style={{ marginTop: 14 }}>
          {cardSections.map((section) => (
            <div key={`harvest-detail-section-${section.key}`} className="facility-storage-harvest-detail-section">
              {cardSections.length > 1 ? (
                <div className="facility-storage-harvest-detail-section__head">
                  <strong>{section.title}</strong>
                </div>
              ) : null}
              <HarvestPendingBoxesPanel
                title=""
                pendingLoadSummary={{ groupedRows: section.groupedRows }}
                layout="row"
                panelClassName="harvest-plan-pending-panel--modal facility-storage-harvest-detail-panel"
                className="facility-storage-harvest-detail-grid"
                selectedCardIds={selectedCardId ? [String(selectedCardId)] : []}
                onCardClick={onSelectCard}
                emptyText=""
              />
            </div>
          ))}
        </div>
      ) : null}
      {cardSections.length ? (
        <div className="empty-box" style={{ marginTop: 16 }}>
          박스 카드를 누르면 별도 상세 모달이 열립니다.
        </div>
      ) : null}
      {!imageSrc && !cardSections.length ? (
        <div className="empty-box" style={{ marginTop: 12 }}>
          표시할 팔레트 상세 정보가 없습니다.
        </div>
      ) : null}
    </div>
  );
}
