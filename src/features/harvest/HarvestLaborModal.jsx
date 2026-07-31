import React from 'react';

const WORKER_TYPE_KEYS = ['beginner', 'worker', 'skilledWorker'];
const WORKER_TYPE_LABELS = {
  beginner: '초보노동자',
  worker: '노동',
  skilledWorker: '숙련노동자'
};

function AssignedCards({ cards }) {
  if (!cards.length) return null;
  return (
    <span className="harvest-plan-worker-chip__equip" aria-label="배정 장비">
      {cards.map((card) => (
        card.imageSrc ? (
          <span
            key={card.tokenId}
            className="harvest-plan-worker-chip__equip-icon"
            title={card.displayLabel || card.cardTitle}
          >
            <img src={card.imageSrc} alt={card.displayLabel || card.cardTitle} />
          </span>
        ) : (
          <span
            key={card.tokenId}
            className="harvest-plan-worker-chip__equip-badge"
            title={card.displayLabel || card.cardTitle}
          >
            {card.displayLabel || card.cardTitle}
          </span>
        )
      ))}
    </span>
  );
}

export default function HarvestLaborModal({
  isOpen,
  game,
  selfWorkerSelected,
  selfWorkerAssignedCards,
  selfLaborValue,
  getWorkerStatusLabel,
  onToggleSelfWorker,
  onDropSelfWorkerEquipment,
  availableWorkerMix,
  selectedWorkerMix,
  workerRosterByType,
  selectedWorkerIdsByType,
  workerEquipmentByWorkerId,
  workerEquipmentCardMap,
  crewIconOf,
  onToggleWorker,
  onDropWorkerEquipment,
  getWorkerDropFeedback,
  availableSimpleWorkers,
  selectedExternalHeadcount,
  effectiveExternalLabor,
  effectiveSelfLabor,
  externalLaborSliderMax,
  onAutoFillExternalLabor,
  onConfirm,
  onClose,
  workerEquipmentCards,
  workerEquipmentOwnerByTokenId,
  pressedEquipmentTokenId,
  draggingEquipmentTokenId,
  onPressEquipmentToken,
  onReleaseEquipmentToken,
  onLeaveEquipmentToken,
  onStartDragEquipment,
  onEndDragEquipment,
  onCleanupDragEquipment,
  onAutoAssignEquipment,
  onOpenFuelGauge
}) {
  if (!isOpen) return null;

  const unassignedCards = workerEquipmentCards.filter((card) => !workerEquipmentOwnerByTokenId?.[card.tokenId]);
  const [dropFeedback, setDropFeedback] = React.useState({ workerId: '', ok: true, reason: '' });
  const clearDropFeedback = React.useCallback(() => {
    setDropFeedback({ workerId: '', ok: true, reason: '' });
  }, []);

  const updateDropFeedback = React.useCallback((workerId, tokenId) => {
    if (!tokenId || !getWorkerDropFeedback) {
      clearDropFeedback();
      return;
    }
    const next = getWorkerDropFeedback(workerId, tokenId) || { ok: true, reason: '' };
    setDropFeedback({
      workerId: String(workerId || ''),
      ok: Boolean(next.ok),
      reason: String(next.reason || '')
    });
  }, [clearDropFeedback, getWorkerDropFeedback]);

  React.useEffect(() => {
    if (!draggingEquipmentTokenId) clearDropFeedback();
  }, [clearDropFeedback, draggingEquipmentTokenId]);

  React.useEffect(() => {
    if (!isOpen) onCleanupDragEquipment?.();
  }, [isOpen, onCleanupDragEquipment]);

  const selfWorkerStatusLabel = typeof getWorkerStatusLabel === 'function'
    ? String(getWorkerStatusLabel('self', 'self') || '')
    : '';

  return (
    <>
      <div className="confirm-modal-backdrop confirm-modal-backdrop--soft" onClick={onClose} />
      <div className="harvest-plan-dual-modal-wrap">
        <div className="confirm-modal confirm-modal--harvest-picker">
          <div className="harvest-plan-picker-body">
            {game ? (
              <div className="harvest-plan-worker-field">
                <div className="harvest-plan-worker-field__top">
                  <span>나 (자가노동력)</span>
                  <strong>{selfWorkerSelected ? '참여중' : '미선택'}</strong>
                </div>
                <div className="harvest-plan-worker-grid">
                  <button
                    type="button"
                    className={`harvest-plan-worker-chip ${selfWorkerSelected ? 'harvest-plan-worker-chip--active harvest-plan-worker-chip--droppable' : 'harvest-plan-worker-chip--locked'} ${selfWorkerStatusLabel ? 'harvest-plan-worker-chip--day-locked' : ''} ${dropFeedback.workerId === 'self-worker' && !dropFeedback.ok ? 'harvest-plan-worker-chip--drop-invalid' : ''}`.trim()}
                    onClick={onToggleSelfWorker}
                    onDragOver={(event) => {
                      event.preventDefault();
                      const tokenId = String(event.dataTransfer.getData('text/plain') || draggingEquipmentTokenId || '');
                      updateDropFeedback('self-worker', tokenId);
                    }}
                    onDragLeave={() => {
                      if (dropFeedback.workerId === 'self-worker') clearDropFeedback();
                    }}
                    onDrop={(event) => {
                      const tokenId = String(event.dataTransfer.getData('text/plain') || draggingEquipmentTokenId || '');
                      if (!tokenId) return;
                      event.preventDefault();
                      clearDropFeedback();
                      onCleanupDragEquipment?.();
                      onDropSelfWorkerEquipment(tokenId);
                    }}
                  >
                    <span className="harvest-plan-worker-chip__icon">🧑‍🌾</span>
                    <span className="harvest-plan-worker-chip__name">나</span>
                    {selfWorkerStatusLabel ? (
                      <span className="harvest-plan-worker-chip__status">{selfWorkerStatusLabel}</span>
                    ) : null}
                    <span className="harvest-plan-worker-chip__equip-wrap">
                      <AssignedCards cards={selfWorkerAssignedCards} />
                      {dropFeedback.workerId === 'self-worker' && !dropFeedback.ok ? (
                        <span className="harvest-plan-worker-chip__drop-reason">{dropFeedback.reason}</span>
                      ) : null}
                    </span>
                    <span className="harvest-plan-worker-chip__labor">{`${selfLaborValue} 노동력`}</span>
                  </button>
                </div>
              </div>
            ) : null}
            {WORKER_TYPE_KEYS.map((typeKey) => {
              const availableCount = Number(availableWorkerMix?.[typeKey] || 0);
              if (availableCount <= 0) return null;
              return (
                <div key={`harvest-worker-field-${typeKey}`} className="harvest-plan-worker-field">
                  <div className="harvest-plan-worker-field__top">
                    <span>{`${WORKER_TYPE_LABELS[typeKey]} (현재 ${availableCount}명)`}</span>
                    <strong>{`${selectedWorkerMix?.[typeKey] || 0}명 선택`}</strong>
                  </div>
                  <div className="harvest-plan-worker-grid">
                    {(workerRosterByType?.[typeKey] || []).map((worker, index) => {
                      const isSelected = (selectedWorkerIdsByType?.[typeKey] || []).includes(String(worker?.id || ''));
                      const workerStatusLabel = typeof getWorkerStatusLabel === 'function'
                        ? String(getWorkerStatusLabel(worker?.id, typeKey) || '')
                        : '';
                      const assignedCards = (workerEquipmentByWorkerId?.[worker.id] || [])
                        .map((tokenId) => workerEquipmentCardMap?.[tokenId] || null)
                        .filter(Boolean);
                      return (
                        <button
                          key={worker.id || `harvest-${typeKey}-${index + 1}`}
                          type="button"
                          className={`harvest-plan-worker-chip ${isSelected ? 'harvest-plan-worker-chip--active' : ''} ${isSelected ? 'harvest-plan-worker-chip--droppable' : 'harvest-plan-worker-chip--locked'} ${workerStatusLabel ? 'harvest-plan-worker-chip--day-locked' : ''} ${dropFeedback.workerId === String(worker.id || '') && !dropFeedback.ok ? 'harvest-plan-worker-chip--drop-invalid' : ''}`.trim()}
                          onClick={() => onToggleWorker(typeKey, worker.id)}
                          onDragOver={(event) => {
                            event.preventDefault();
                            const tokenId = String(event.dataTransfer.getData('text/plain') || draggingEquipmentTokenId || '');
                            updateDropFeedback(worker.id, tokenId);
                          }}
                          onDragLeave={() => {
                            if (dropFeedback.workerId === String(worker.id || '')) clearDropFeedback();
                          }}
                          onDrop={(event) => {
                            const tokenId = String(event.dataTransfer.getData('text/plain') || draggingEquipmentTokenId || '');
                            if (!tokenId) return;
                            event.preventDefault();
                            clearDropFeedback();
                            onCleanupDragEquipment?.();
                            onDropWorkerEquipment(worker.id, tokenId);
                          }}
                        >
                          <span className="harvest-plan-worker-chip__icon">{crewIconOf(typeKey, worker.gender)}</span>
                          <span className="harvest-plan-worker-chip__name">{worker.name}</span>
                          {workerStatusLabel ? (
                            <span className="harvest-plan-worker-chip__status">{workerStatusLabel}</span>
                          ) : null}
                          <span className="harvest-plan-worker-chip__equip-wrap">
                            <AssignedCards cards={assignedCards} />
                            {dropFeedback.workerId === String(worker.id || '') && !dropFeedback.ok ? (
                              <span className="harvest-plan-worker-chip__drop-reason">{dropFeedback.reason}</span>
                            ) : null}
                          </span>
                          <span className="harvest-plan-worker-chip__labor">{worker.labor} 노동력</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {availableSimpleWorkers <= 0 ? (
              <div className="meter__hint">현재 수확에 투입 가능한 외부인력이 없습니다.</div>
            ) : null}
          </div>
          <div className="footer-actions">
            <button className="button button--ghost" onClick={onClose}>닫기</button>
            <button
              className="button button--primary"
              onClick={() => {
                if (selectedExternalHeadcount > 0 && effectiveExternalLabor <= 0) {
                  onAutoFillExternalLabor();
                }
                onConfirm();
              }}
            >
              확인
            </button>
          </div>
        </div>
        <div className="confirm-modal confirm-modal--harvest-picker confirm-modal--harvest-assignment">
          <div className="confirm-modal__title">장비 배정</div>
          <div className="confirm-modal__desc">장비 카드를 잡아당겨 선택된 노동자 카드 위에 놓으면 바로 배정됩니다.</div>
          <div className="footer-actions" style={{ justifyContent: 'flex-start', marginBottom: 10 }}>
            <button type="button" className="button button--ghost button--compact" onClick={onAutoAssignEquipment}>
              자동 배정
            </button>
          </div>
          <div className="harvest-plan-assignment-grid">
            {unassignedCards.length ? (
              unassignedCards.map((card) => (
                <div
                  key={card.tokenId}
                  className={`harvest-plan-assignment-card ${pressedEquipmentTokenId === card.tokenId ? 'harvest-plan-assignment-card--pressed' : ''} ${draggingEquipmentTokenId === card.tokenId ? 'harvest-plan-assignment-card--dragging' : ''} ${card.fuelGauge ? 'harvest-plan-assignment-card--with-fuel' : ''}`.trim()}
                  draggable
                  onPointerDown={() => onPressEquipmentToken(card.tokenId)}
                  onPointerUp={() => onReleaseEquipmentToken()}
                  onPointerCancel={() => onReleaseEquipmentToken()}
                  onPointerLeave={() => onLeaveEquipmentToken(card.tokenId)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', card.tokenId);
                    event.dataTransfer.effectAllowed = 'move';
                    const dragThumb = event.currentTarget.querySelector('.harvest-plan-assignment-card__thumb');
                    onStartDragEquipment(card.tokenId, dragThumb, event.dataTransfer);
                  }}
                  onDragEnd={() => onEndDragEquipment()}
                >
                  <div className="harvest-plan-assignment-card__main">
                    {card.imageSrc ? (
                      <div className={`harvest-plan-assignment-card__thumb ${String(card.itemKey || '').startsWith('orchardHarvestBasket') ? 'harvest-plan-assignment-card__thumb--basket' : ''} ${card.itemKey === 'orchardLadder' ? 'harvest-plan-assignment-card__thumb--ladder' : ''}`.trim()}>
                        <img src={card.imageSrc} alt={card.cardTitle} />
                      </div>
                    ) : null}
                    <div className="harvest-plan-assignment-card__body">
                      <strong>{card.cardTitle}</strong>
                      <span>{card.metaText}</span>
                      <small>아직 배정 전</small>
                    </div>
                  </div>
                  {card.fuelGauge ? (
                    <button
                      type="button"
                      className="parking-slot-fuel parking-slot-fuel--clickable harvest-plan-assignment-card__fuel"
                      draggable={false}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenFuelGauge(card);
                      }}
                      title={card.fuelGauge?.isElectric ? 'EV 충전 모달 열기' : '주유 열기'}
                    >
                      <div className="parking-slot-fuel__head">
                        <strong>{`${Math.max(0, Number(card.fuelGauge?.ratio) || 0).toFixed(0)}%`}</strong>
                        <span>
                          {card.fuelGauge?.isElectric
                            ? `${String(card.fuelGauge?.typeLabel || '전기')} ${Math.max(0, Number(card.fuelGauge?.current) || 0).toFixed(1)}kWh / ${Math.max(0, Number(card.fuelGauge?.capacity) || 0).toFixed(1)}kWh`
                            : `${String(card.fuelGauge?.typeLabel || '연료')} ${Math.max(0, Number(card.fuelGauge?.current) || 0).toFixed(1)}L / ${Math.max(0, Number(card.fuelGauge?.capacity) || 0).toFixed(1)}L`}
                        </span>
                      </div>
                      <div className={`parking-slot-fuel__bar ${String(card.fuelGauge?.toneClass || '')}`.trim()}>
                        <span style={{ width: `${Math.max(0, Number(card.fuelGauge?.ratio) || 0)}%` }} />
                      </div>
                    </button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="meter__hint">
                {workerEquipmentCards.length
                  ? '배정 가능한 장비가 없습니다.'
                  : '먼저 수확장비 선택에서 사다리, 고소작업차, 과일수확바구니를 골라주세요.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
