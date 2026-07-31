import React from 'react';

export default function WarehouseWorkerPickerModal({
  open,
  title,
  description,
  currentAssignment,
  currentAssignments = [],
  externalEntries,
  activeCrew,
  totalCrewCountOfTypes,
  harvestCrewTypeKeys,
  harvestCrewIconOf,
  maxSelection = 1,
  onClear,
  onChooseSelf,
  onChooseExternal,
  onConfirmSelections,
  onClose,
}) {
  const allowMultiSelect = Number(maxSelection) > 1 && typeof onConfirmSelections === 'function';

  const [draftSelection, setDraftSelection] = React.useState(null);
  const [draftSelections, setDraftSelections] = React.useState([]);
  const initializedRef = React.useRef(false);

  const isSelfAssigned = String(currentAssignment?.workerType || '') === 'self';
  const selectedWorkerId = String(currentAssignment?.workerId || '');

  React.useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (allowMultiSelect) {
      const normalized = Array.isArray(currentAssignments)
        ? currentAssignments
            .map((entry) => {
              const workerType = String(entry?.workerType || '');
              if (workerType === 'self') return { kind: 'self' };
              const workerId = String(entry?.workerId || '');
              if (!workerId) return null;
              const matchedGroup = (externalEntries || []).find(
                (group) =>
                  Array.isArray(group?.workers)
                  && group.workers.some((worker) => String(worker?.id || '') === workerId),
              );
              if (!matchedGroup) return null;
              const matchedWorker = matchedGroup.workers.find(
                (worker) => String(worker?.id || '') === workerId,
              );
              if (!matchedWorker) return null;
              return {
                kind: 'external',
                workerTypeKey: String(matchedGroup.key || ''),
                worker: matchedWorker,
              };
            })
            .filter(Boolean)
        : [];
      setDraftSelections(normalized.slice(0, Math.max(1, Number(maxSelection) || 1)));
      setDraftSelection(null);
      return;
    }

    if (isSelfAssigned) {
      setDraftSelection({ kind: 'self' });
      return;
    }

    if (selectedWorkerId) {
      const matchedGroup = (externalEntries || []).find(
        (entry) =>
          Array.isArray(entry?.workers)
          && entry.workers.some((worker) => String(worker?.id || '') === selectedWorkerId),
      );
      if (matchedGroup) {
        const matchedWorker = matchedGroup.workers.find(
          (worker) => String(worker?.id || '') === selectedWorkerId,
        );
        setDraftSelection({
          kind: 'external',
          workerTypeKey: String(matchedGroup.key || ''),
          worker: matchedWorker || null,
        });
        return;
      }
    }

    setDraftSelection(null);
  }, [
    allowMultiSelect,
    currentAssignments,
    externalEntries,
    isSelfAssigned,
    maxSelection,
    open,
    selectedWorkerId,
  ]);

  if (!open) return null;

  const draftIsSelf = draftSelection?.kind === 'self';
  const draftWorkerId = draftSelection?.kind === 'external' ? String(draftSelection?.worker?.id || '') : '';
  const hasDraftSelection = allowMultiSelect
    ? draftSelections.length > 0
    : Boolean(draftIsSelf || draftWorkerId);

  const currentLabel = String(currentAssignment?.workerLabel || '').trim();
  const selectedLabel = allowMultiSelect
    ? draftSelections
        .map((entry) => (entry?.kind === 'self' ? '나' : String(entry?.worker?.name || '')))
        .filter(Boolean)
        .join(', ')
    : draftSelection?.kind === 'self'
      ? '나'
      : draftSelection?.kind === 'external'
        ? String(draftSelection?.worker?.name || '')
        : '';

  const canConfirm = allowMultiSelect ? true : (hasDraftSelection || Boolean(currentLabel));

  const selectedCountByWorkerId = draftSelections.reduce((acc, entry) => {
    const workerId = entry?.kind === 'external' ? String(entry?.worker?.id || '') : '';
    const key = workerId || (entry?.kind === 'self' ? 'self' : '');
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const toggleMultiSelection = (nextEntry) => {
    setDraftSelections((prev) => {
      const next = [...prev];
      const targetId = nextEntry?.kind === 'self' ? 'self' : String(nextEntry?.worker?.id || '');
      const foundIndex = next.findIndex((entry) => {
        if (nextEntry?.kind === 'self') return entry?.kind === 'self';
        return entry?.kind === 'external' && String(entry?.worker?.id || '') === targetId;
      });
      if (foundIndex >= 0) {
        next.splice(foundIndex, 1);
        return next;
      }
      if (next.length >= Math.max(1, Number(maxSelection) || 1)) return next;
      next.push(nextEntry);
      return next;
    });
  };

  return (
    <>
      <div className="confirm-modal-backdrop" style={{ zIndex: 4602 }} onClick={onClose} />
      <div className="confirm-modal confirm-modal--crew-status" style={{ zIndex: 4603 }}>
        <div className="confirm-modal__title">{title}</div>
        <div className="confirm-modal__desc">{description}</div>
        <div className="crew-status-modal__body">
          <div className="harvest-plan-worker-field">
            <div className="harvest-plan-worker-field__top">
              <span>직접 배치</span>
            </div>
            <div className="option-grid" style={{ marginTop: 0 }}>
              <button
                type="button"
                className={`focus-tab slot-button-card harvest-plan-worker-chip crew-status-worker-chip ${
                  allowMultiSelect
                    ? ((selectedCountByWorkerId.self || 0) > 0 ? 'is-selected' : '')
                    : (draftIsSelf ? 'is-selected' : '')
                }`.trim()}
                onClick={() => {
                  if (allowMultiSelect) {
                    toggleMultiSelection({ kind: 'self' });
                    return;
                  }
                  setDraftSelection((prev) => (prev?.kind === 'self' ? null : { kind: 'self' }));
                }}
              >
                <div className="slot-button-card__main">
                  <span
                    className="harvest-plan-worker-chip__icon crew-status-worker-chip__icon"
                    style={{ alignSelf: 'center', marginRight: 10, fontSize: 28 }}
                    aria-hidden="true"
                  >
                    {harvestCrewIconOf('self', 'neutral')}
                  </span>
                  <div className="slot-button-content">
                    <strong>나</strong>
                    <span>직접 이 자리를 맡습니다.</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="crew-status-modal__summary">
            <div className="crew-pill">
              <span className="crew-pill__icon">⛏</span>
              <span>단순 {totalCrewCountOfTypes(activeCrew, harvestCrewTypeKeys)}명</span>
            </div>
            <div className="crew-pill">
              <span className="crew-pill__icon">⚙</span>
              <span>기술 {activeCrew.agriTechnician || 0}명</span>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
            {externalEntries.length ? (
              externalEntries.map((entry) => (
                <div key={`worker-group-${entry.key}`} className="harvest-plan-worker-field">
                  <div className="harvest-plan-worker-field__top">
                    <span>{`${entry.label}(현재 ${entry.workers.length}명)`}</span>
                  </div>
                  <div className="harvest-plan-worker-grid">
                    {entry.workers.map((worker) => {
                      const workerId = String(worker?.id || '');
                      const selectedCount = selectedCountByWorkerId[workerId] || 0;
                      const isSelected = allowMultiSelect ? selectedCount > 0 : draftWorkerId === workerId;
                      return (
                        <button
                          key={`worker-${entry.key}-${worker.id}`}
                          type="button"
                          className={`focus-tab harvest-plan-worker-chip crew-status-worker-chip ${isSelected ? 'is-selected' : ''}`.trim()}
                          onClick={() => {
                            if (allowMultiSelect) {
                              toggleMultiSelection({
                                kind: 'external',
                                workerTypeKey: String(entry.key || ''),
                                worker,
                              });
                              return;
                            }
                            setDraftSelection((prev) => {
                              if (prev?.kind === 'external' && String(prev?.worker?.id || '') === workerId) {
                                return null;
                              }
                              return {
                                kind: 'external',
                                workerTypeKey: String(entry.key || ''),
                                worker,
                              };
                            });
                          }}
                        >
                          <span className="harvest-plan-worker-chip__icon crew-status-worker-chip__icon">
                            {harvestCrewIconOf(entry.key, worker.gender)}
                          </span>
                          <span className="harvest-plan-worker-chip__name">{worker.name}</span>
                          <span className="harvest-plan-worker-chip__equip crew-status-worker-chip__period">
                            {worker.periodText || '기간 정보 없음'}
                          </span>
                          <span className="harvest-plan-worker-chip__labor">{`${worker.labor} 노동력`}</span>
                          {allowMultiSelect && selectedCount > 0 ? (
                            <span className="harvest-plan-worker-chip__equip crew-status-worker-chip__period">{`선택 ${selectedCount}회`}</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-box" style={{ marginTop: 4 }}>배정 가능한 외부 인력이 없습니다.</div>
            )}
          </div>
        </div>

        <div className="meter__hint" style={{ marginTop: 8 }}>
          {allowMultiSelect
            ? `선택중 ${draftSelections.length}/${Math.max(1, Number(maxSelection) || 1)}명: ${selectedLabel || '없음'}`
            : `선택중: ${selectedLabel || '없음'}${currentLabel ? ` (현재 배정: ${currentLabel})` : ''}`}
        </div>

        <div className="footer-actions" style={{ marginTop: 14, justifyContent: 'flex-start' }}>
          <button className="button button--ghost" type="button" onClick={onClose}>취소</button>
          <button
            className="button button--primary"
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (allowMultiSelect) {
                onConfirmSelections?.(draftSelections);
                onClose?.();
                return;
              }
              if (draftSelection?.kind === 'self') {
                onChooseSelf?.();
                onClose?.();
                return;
              }
              if (draftSelection?.kind === 'external' && draftSelection?.worker) {
                onChooseExternal?.(draftSelection.workerTypeKey, draftSelection.worker);
                onClose?.();
                return;
              }
              onClear?.();
              onClose?.();
            }}
          >
            확인
          </button>
        </div>
      </div>
    </>
  );
}
