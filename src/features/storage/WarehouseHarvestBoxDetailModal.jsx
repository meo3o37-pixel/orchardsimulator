import React from 'react';
import { createPortal } from 'react-dom';
import { HarvestQualityStampedCrate } from '../harvest/HarvestPendingBoxesPanel';
import { formatKg, longDate } from '../../utils/common';
import { normalizeHarvestGradeLabel } from '../../utils/harvestGrade';
import { CONTAINER_ITEMS } from '../../config/items/container';
import { isHarvestFullySortedBox } from './harvestBoxLabel';

const CONTAINER_NAME_BY_KEY = Object.fromEntries(
  (CONTAINER_ITEMS || []).map((item) => [String(item?.key || ''), String(item?.name || '').trim()])
);

export default function WarehouseHarvestBoxDetailModal({
  card,
  onClose,
  canApplyOneMcp = false,
  oneMcpActionLabel = '1-MCP 처리',
  oneMcpDisabledReason = '',
  onApplyOneMcp = null,
}) {
  if (!card || typeof document === 'undefined') return null;

  const detailGradeLabel = normalizeHarvestGradeLabel(card?.gradeLabel, '미선별') || '미선별';
  const detailSizeLabel = String(card?.sizeLabel || '').trim() || '미측정';
  const isFullySorted = isHarvestFullySortedBox({
    gradeLabel: detailGradeLabel,
    sizeLabel: detailSizeLabel,
  });
  const detailProduceTypeLabel = String(card?.produceTypeLabel || '사과').trim() || '사과';
  const detailCultivarLabel = String(card?.cropLabel || '기타').trim() || '기타';
  const detailQualityLabel = isFullySorted
    ? '-'
    : (String(card?.qualityLabel || '보통').trim() || '보통');
  const detailStemStatusLabel = String(card?.stemStatusLabel || '꼭지 있음').trim() || '꼭지 있음';
  const detailHarvestedDay = Math.max(0, Math.floor(Number(card?.harvestedDay) || 0));
  const detailHarvestedDateText = detailHarvestedDay > 0 ? longDate(detailHarvestedDay) : '0000-00-00';
  const detailLife = Math.max(0, Math.floor(Number(card?.life) || 0));
  const detailOneMcpTreated = Boolean(
    card?.oneMcpTreated
    || card?.isOneMcpTreated
    || card?.storageTreatment1Mcp
    || card?.longStorageAgentTreated
    || card?.postharvestTreatment1Mcp
  );
  const detailOneMcpLabel = detailOneMcpTreated ? '처리함' : '미처리';
  const detailLoadBoxKey = String(card?.loadBoxKey || card?.imageItemKey || '').trim();
  const detailLoadBoxLabel = CONTAINER_NAME_BY_KEY[detailLoadBoxKey]
    || (detailLoadBoxKey ? '수확 컨테이너' : '정보 없음');
  const detailBoxStateLabel = card.cardKind === 'partial'
    ? `${String(card?.fillLabel || '')} 박스`
    : `${Math.max(0, Number(card?.boxCount) || 0).toLocaleString()}박스`;
  const detailQtyLabel = card?.detailText || `${formatKg(card?.qtyKg, 2)}kg`;

  return createPortal(
    <div
      className="confirm-modal-backdrop confirm-modal-backdrop--soft warehouse-harvest-box-detail-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${detailCultivarLabel} 박스 상세`}
      style={{
        zIndex: 3906,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backdropFilter: 'blur(6px)'
      }}
      onClick={onClose}
    >
      <div
        className="facility-storage-harvest-detail-card facility-storage-harvest-detail-card--box-modal"
        style={{ width: 'min(760px, calc(100vw - 48px))', margin: 0, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-modal__title facility-storage-harvest-detail-card__modal-title">
          {`${detailCultivarLabel} 박스 상세`}
        </div>

        <div className="facility-storage-harvest-detail-card__hero">
          <div className="facility-storage-harvest-detail-card__thumb facility-storage-harvest-detail-card__thumb--hero">
            <div className="facility-storage-harvest-detail-card__crate facility-storage-harvest-detail-card__crate--hero harvest-plan-pending-box">
              <HarvestQualityStampedCrate
                tone={/green/i.test(String(card?.loadBoxKey || card?.imageItemKey || '')) ? 'green' : 'yellow'}
                fillRatio={card?.fillRatio ?? (card?.cardKind === 'partial' ? 1 / 3 : 1)}
                life={card?.life}
                fillLabel={card?.fillLabel || ''}
                qualityLabel={detailQualityLabel}
                gradeLabel={detailGradeLabel}
                sizeLabel={detailSizeLabel}
                stemStatusKey={card?.stemStatusKey || ''}
                stemStatusLabel={detailStemStatusLabel}
                stemRemoved={card?.stemRemoved}
              />
            </div>
          </div>
          <div className="facility-storage-harvest-detail-card__hero-copy">
            <div className="facility-storage-harvest-detail-card__title-row facility-storage-harvest-detail-card__title-row--centered">
              <strong>{detailCultivarLabel}</strong>
              <span className="facility-storage-harvest-detail-card__layer-chip">{detailBoxStateLabel || '박스'}</span>
            </div>
            <div className="facility-storage-harvest-detail-card__box-meta facility-storage-harvest-detail-card__box-meta--centered">
              {`${detailProduceTypeLabel} · ${detailCultivarLabel} · ${detailQualityLabel} · ${detailStemStatusLabel}`}
            </div>
          </div>
        </div>

        <div className="facility-storage-harvest-detail-card__body">
          <div className="facility-storage-harvest-detail-card__metric-row">
            <div className="facility-storage-harvest-detail-card__metric-card is-primary">
              <span className="facility-storage-harvest-detail-card__metric-label">과종</span>
              <strong>{detailProduceTypeLabel}</strong>
            </div>
            <div className="facility-storage-harvest-detail-card__metric-card">
              <span className="facility-storage-harvest-detail-card__metric-label">품종</span>
              <strong>{detailCultivarLabel}</strong>
            </div>
            <div className="facility-storage-harvest-detail-card__metric-card">
              <span className="facility-storage-harvest-detail-card__metric-label">외관 품질</span>
              <strong>{detailQualityLabel}</strong>
            </div>
            <div className="facility-storage-harvest-detail-card__metric-card">
              <span className="facility-storage-harvest-detail-card__metric-label">꼭지 상태</span>
              <strong>{detailStemStatusLabel}</strong>
            </div>
            <div className="facility-storage-harvest-detail-card__metric-card">
              <span className="facility-storage-harvest-detail-card__metric-label">급</span>
              <strong>{detailGradeLabel}</strong>
            </div>
            <div className="facility-storage-harvest-detail-card__metric-card">
              <span className="facility-storage-harvest-detail-card__metric-label">크기</span>
              <strong>{detailSizeLabel}</strong>
            </div>
            <div className="facility-storage-harvest-detail-card__metric-card">
              <span className="facility-storage-harvest-detail-card__metric-label">중량</span>
              <strong>{detailQtyLabel}</strong>
            </div>
            <div className="facility-storage-harvest-detail-card__metric-card">
              <span className="facility-storage-harvest-detail-card__metric-label">신선도</span>
              <strong>{`${detailLife}%`}</strong>
            </div>
            <div className="facility-storage-harvest-detail-card__metric-card">
              <span className="facility-storage-harvest-detail-card__metric-label">장기저장제(1-MCP)</span>
              <strong>{detailOneMcpLabel}</strong>
            </div>
            <div className="facility-storage-harvest-detail-card__metric-card">
              <span className="facility-storage-harvest-detail-card__metric-label">담긴 상자</span>
              <strong>{detailLoadBoxLabel}</strong>
            </div>
            <div className="facility-storage-harvest-detail-card__metric-card facility-storage-harvest-detail-card__metric-card--full">
              <span className="facility-storage-harvest-detail-card__metric-label">수확일</span>
              <strong>{detailHarvestedDateText}</strong>
            </div>
          </div>

          <div className="footer-actions facility-storage-harvest-detail-card__footer">
            {onApplyOneMcp ? (
              <button
                type="button"
                className="button button--ghost"
                disabled={!canApplyOneMcp}
                title={!canApplyOneMcp ? oneMcpDisabledReason : ''}
                onClick={() => onApplyOneMcp(card)}
              >
                {detailOneMcpTreated ? '1-MCP 처리 완료' : oneMcpActionLabel}
              </button>
            ) : null}
            <button type="button" className="button button--ghost" onClick={onClose}>닫기</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
