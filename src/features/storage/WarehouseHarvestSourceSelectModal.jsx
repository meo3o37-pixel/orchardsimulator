import React from 'react';
import { formatKg } from '../../utils/common';
import HarvestPendingBoxesPanel from '../harvest/HarvestPendingBoxesPanel';

const cardMaxCountOf = (card) => (
  String(card?.cardKind || '') === 'partial'
    ? 1
    : Math.max(0, Math.floor(Number(card?.boxCount) || 0))
);

const cardSelectedCountOf = (card) => (
  String(card?.cardKind || '') === 'partial'
    ? Math.max(0, Math.min(1, Math.floor(Number(card?.selectedCount) || 0)))
    : Math.max(0, Math.min(cardMaxCountOf(card), Math.floor(Number(card?.selectedCount) || 0)))
);

const cardSelectedKgOf = (card) => {
  if (!card) return 0;
  if (String(card?.cardKind || '') === 'partial') {
    return cardSelectedCountOf(card) > 0
      ? Math.max(0, Number(card?.qtyKg) || 0)
      : 0;
  }
  const maxCount = Math.max(1, cardMaxCountOf(card));
  const selectedCount = cardSelectedCountOf(card);
  return Math.round((((Math.max(0, Number(card?.qtyKg) || 0) / maxCount) * selectedCount) + Number.EPSILON) * 10) / 10;
};

export default function WarehouseHarvestSourceSelectModal({
  locationLabel,
  cardSections,
  picker,
  selectedTransportLabel,
  selectedTransportMode,
  harvestBoxesPerPallet,
  onPatchPicker,
  onConfirmLoad,
  onClose,
}) {
  const pendingTarget = picker?.pendingTarget || null;
  const selectedSourceCards = Array.isArray(picker?.selectedSourceCards) ? picker.selectedSourceCards : [];
  const selectionMap = new Map(
    selectedSourceCards
      .map((card) => [String(card?.id || ''), card])
      .filter(([id]) => id)
  );
  const cards = cardSections.flatMap((section) => {
    const groupedRows = Array.isArray(section?.groupedRows) ? section.groupedRows : [];
    return groupedRows.flatMap((row) => {
      const sourceBatchIds = Array.isArray(row?.sourceBatchIds)
        ? row.sourceBatchIds.map((value) => String(value || '')).filter(Boolean)
        : [];
      const sourceBoxUnitNos = Array.isArray(row?.sourceBoxUnitNos)
        ? row.sourceBoxUnitNos.map((value) => Math.max(0, Math.floor(Number(value) || 0))).filter((value) => value > 0)
        : [];
      const sourceBatchId = String(row?.sourceBatchId || sourceBatchIds[0] || '');
      const sourceBoxUnitNo = Math.max(0, Math.floor(Number(row?.sourceBoxUnitNo || sourceBoxUnitNos[0]) || 0));
      if (!sourceBatchId && sourceBoxUnitNo <= 0 && !sourceBatchIds.length && !sourceBoxUnitNos.length) return [];
      const qty = Math.max(0, Number(row?.qty) || 0);
      const remainderKg = Math.max(0, Number(row?.remainderKg) || 0);
      const fullBoxQtyKg = Math.max(0, qty - remainderKg);
      const fullBoxCount = Math.max(0, Math.floor(fullBoxQtyKg / 20));
      const sourceKey = sourceBatchId || `unit-${sourceBoxUnitNo}`;
      const base = {
        imageItemKey: String(row?.imageItemKey || ''),
        cropLabel: String(row?.cropLabel || '수확물'),
        cropId: String(row?.cropId || ''),
        qualityLabel: String(row?.qualityLabel || '보통'),
        stemStatusKey: String(row?.stemStatusKey || row?.stemStatus || ''),
        stemStatusLabel: String(row?.stemStatusLabel || row?.stemLabel || ''),
        stemRemoved: typeof row?.stemRemoved === 'boolean' ? row.stemRemoved : undefined,
        sourceBatchId,
        sourceBoxUnitNo,
        sourceBatchIds,
        sourceBoxUnitNos,
      };
      const nextCards = [];
      if (fullBoxCount > 0 && fullBoxQtyKg > 0.001) {
        nextCards.push({
          ...base,
          id: `full-${sourceKey}`,
          value: `${base.cropLabel} ${fullBoxCount.toLocaleString()}박스`,
          detailText: base.qualityLabel,
          boxCount: fullBoxCount,
          qtyKg: fullBoxQtyKg,
          fillRatio: 1,
          fillLabel: '',
          cardKind: 'full',
          sourceFillStep: 3,
        });
      }
      if (Boolean(row?.hasRemainder) && remainderKg > 0.001) {
        const fillStep = Math.max(1, Math.min(2, Math.floor(Number(row?.sourceFillStep) || 1)));
        nextCards.push({
          ...base,
          id: `partial-${sourceKey}-${fillStep}`,
          value: `${base.cropLabel} ${fillStep}/3박스`,
          detailText: `잔량 ${formatKg(remainderKg, 2)}kg`,
          boxCount: 1,
          qtyKg: remainderKg,
          fillRatio: fillStep / 3,
          fillLabel: `${fillStep}/3`,
          cardKind: 'partial',
          sourceFillStep: fillStep,
        });
      }
      return nextCards.map((card) => ({
        ...card,
        selectedCount: cardSelectedCountOf(selectionMap.get(String(card.id)) || null),
      }));
    });
  });
  const targetType = String(pendingTarget?.targetType || '');
  const targetAvailableKg = Math.max(0, Number(pendingTarget?.availableKg) || 0);
  const targetUsesBoxCapacityOnly = [
    'warehouse-empty',
    'warehouse-floor-harvest',
    'warehouse-stack-top',
    'warehouse-empty-pallet',
    'warehouse-harvest-pallet',
    'vehicle-slot',
  ].includes(targetType);
  const isSameFacilityGeneralTarget = targetType === 'warehouse-general'
    && String(picker?.sourceFacilityKey || '') !== ''
    && String(pendingTarget?.facilityKey || '') === String(picker?.sourceFacilityKey || '');
  const targetCurrentBoxCount = targetUsesBoxCapacityOnly
    ? Math.max(0, Math.floor(Number(pendingTarget?.filledBoxCount) || 0))
    : 0;
  const targetCapacityBoxes = targetUsesBoxCapacityOnly
    ? Math.max(
      1,
      Math.floor(Number(pendingTarget?.maxBoxes ?? pendingTarget?.capacityBoxes) || Number(harvestBoxesPerPallet) || 36)
    )
    : 0;
  const targetRemainingBoxSlots = targetUsesBoxCapacityOnly
    ? Math.max(0, targetCapacityBoxes - targetCurrentBoxCount)
    : Number.POSITIVE_INFINITY;
  const totalSelectedBoxCount = selectedSourceCards.reduce((sum, card) => (
    sum + cardSelectedCountOf(card)
  ), 0);
  const totalSelectedKg = selectedSourceCards.reduce((sum, card) => (
    sum + cardSelectedKgOf(card)
  ), 0);
  const selectionFitsKg = isSameFacilityGeneralTarget || targetUsesBoxCapacityOnly || totalSelectedKg <= targetAvailableKg + 0.001;
  const selectionFitsBoxes = totalSelectedBoxCount <= targetRemainingBoxSlots;
  const canConfirm = selectedSourceCards.length > 0 && totalSelectedBoxCount > 0 && selectionFitsKg && selectionFitsBoxes;

  const patchCardSelection = (card, nextCountRaw) => {
    const maxCount = cardMaxCountOf(card);
    const nextCount = String(card?.cardKind || '') === 'partial'
      ? Math.max(0, Math.min(1, Math.floor(Number(nextCountRaw) || 0)))
      : Math.max(0, Math.min(maxCount, Math.floor(Number(nextCountRaw) || 0)));
    const nextCards = selectedSourceCards
      .filter((selectedCard) => String(selectedCard?.id || '') !== String(card?.id || ''));
    if (nextCount > 0) {
      nextCards.push({
        ...card,
        selectedCount: nextCount
      });
    }
    onPatchPicker?.({ selectedSourceCards: nextCards });
  };

  const canIncreaseCard = (card) => {
    const currentCard = selectionMap.get(String(card?.id || '')) || card;
    const currentCount = cardSelectedCountOf(currentCard);
    const maxCount = cardMaxCountOf(card);
    if (currentCount >= maxCount) return false;
    const nextCard = { ...card, selectedCount: currentCount + 1 };
    const nextTotalBoxes = totalSelectedBoxCount - currentCount + cardSelectedCountOf(nextCard);
    const nextTotalKg = totalSelectedKg - cardSelectedKgOf(currentCard) + cardSelectedKgOf(nextCard);
    if (!isSameFacilityGeneralTarget && !targetUsesBoxCapacityOnly && nextTotalKg > targetAvailableKg + 0.001) return false;
    if (nextTotalBoxes > targetRemainingBoxSlots) return false;
    return true;
  };

  return (
    <div className="warehouse-harvest-detail-pane warehouse-harvest-detail-pane--enter">
      <div className="confirm-modal__desc">
        {`${locationLabel}에서 추가 적재할 수확물을 고른 뒤 바로 적재합니다.`}
      </div>
      <div className="meter__hint facility-storage-harvest-detail-summary">
        {`선택 운반기구 ${String(selectedTransportLabel || '없음')} · 모드 ${String(selectedTransportMode || 'pallet') === 'individual' ? '개별 적재' : '팔레트째 적재'}`}
      </div>
      {pendingTarget ? (
        <div className="meter__hint facility-storage-harvest-detail-summary" style={{ marginTop: 6 }}>
          {`목적지 ${String(pendingTarget?.title || '')} · ${String(pendingTarget?.desc || '')} · 선택 ${totalSelectedBoxCount.toLocaleString()}박스 / ${Math.round(totalSelectedKg).toLocaleString()}kg`}
        </div>
      ) : null}
      {cardSections.length ? (
        <div className="facility-storage-harvest-detail-sections" style={{ marginTop: 14 }}>
          {cardSections.map((section) => (
            <div key={`harvest-source-section-${section.key}`} className="facility-storage-harvest-detail-section">
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
                emptyText=""
                renderCardFooter={(card) => {
                  const selectedCard = selectionMap.get(String(card?.id || '')) || card;
                  const selectedCount = cardSelectedCountOf(selectedCard);
                  return (
                    <div className="footer-actions facility-storage-harvest-detail-card__actions">
                      <div className="warehouse-storage-carrier-cargo-row__actions" style={{ justifyContent: 'center', gap: 8, flexWrap: 'nowrap' }}>
                        <button
                          type="button"
                          className="button button--ghost button--compact"
                          onClick={(event) => {
                            event.stopPropagation();
                            patchCardSelection(card, selectedCount - 1);
                          }}
                          disabled={selectedCount <= 0}
                        >
                          -
                        </button>
                        <div className="warehouse-storage-card-qty-pill" style={{ minWidth: 52, textAlign: 'center' }}>
                          {selectedCount}
                        </div>
                        <button
                          type="button"
                          className="button button--ghost button--compact"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!canIncreaseCard(card)) return;
                            patchCardSelection(card, selectedCount + 1);
                          }}
                          disabled={!canIncreaseCard(card)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-box" style={{ marginTop: 12 }}>선택할 수확물 상자가 없습니다.</div>
      )}
      <div className="facility-storage-harvest-detail-summary facility-storage-harvest-detail-summary--modal-actions" style={{ marginTop: 16 }}>
        <div className="meter__hint" style={{ margin: 0 }}>
          {!selectionFitsBoxes
            ? `팔레트는 최대 ${Math.max(0, Math.floor(Number(harvestBoxesPerPallet) || 36)).toLocaleString()}박스까지만 적재할 수 있습니다.`
            : (!selectionFitsKg
              ? `선택한 팔레트 적재 여유가 부족합니다. (잔여 ${Math.round(targetAvailableKg).toLocaleString()}kg)`
              : '상자별 수량을 정한 뒤 적재를 누르면 바로 옮깁니다.')}
        </div>
        <div className="footer-actions" style={{ marginTop: 0 }}>
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={onConfirmLoad}
            disabled={!canConfirm}
          >
            적재
          </button>
        </div>
      </div>
    </div>
  );
}
