import React, { useEffect, useState } from 'react';
import { WORKBENCH_TASK_OPTIONS } from './workbenchTaskOptions';

export default function WarehouseWorkbenchTaskPickerModal({
  open,
  picker,
  selectedTaskKey = '',
  onSelectTask,
  onClose,
}) {
  const [draftTaskKey, setDraftTaskKey] = useState(String(selectedTaskKey || ''));

  useEffect(() => {
    if (!open) return;
    setDraftTaskKey(String(selectedTaskKey || ''));
  }, [open, selectedTaskKey]);

  if (!open || !picker) return null;

  return (
    <>
      <div
        className="slot-picker-backdrop"
        style={{ zIndex: 3902 }}
        onClick={onClose}
      />
      <div
        className="slot-picker slot-picker--modal slot-picker--workbench-task-modal"
        style={{ zIndex: 3903 }}
      >
        <div className="slot-picker__title">
          {`${String(picker?.workbenchName || picker?.workbenchSlotLabel || '작업대')} 작업 선택`}
        </div>
        <div className="slot-picker__hint">
          실제 처리 로직은 다음 단계에서 붙이고, 지금은 이 작업대에 어떤 작업을 걸어둘지 먼저 고릅니다.
        </div>
        <div className="slot-picker__tabs slot-picker__tabs--save-slots">
          {WORKBENCH_TASK_OPTIONS.map((option) => {
            const selected = draftTaskKey === option.key;
            return (
              <button
                key={option.key}
                type="button"
                className={`focus-tab slot-button-card warehouse-workbench-task-picker__option ${selected ? 'slot-button--selected-outline is-selected' : ''}`.trim()}
                onClick={() => setDraftTaskKey((prev) => (prev === option.key ? '' : option.key))}
                title={option.label}
              >
                <div className="slot-button-card__main">
                  <div className="slot-button-content">
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                    <small>{selected ? '현재 선택됨' : '선택 후 확인을 누르면 이 작업대 기본 작업으로 저장됩니다.'}</small>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="footer-actions">
          <button className="button button--ghost" type="button" onClick={onClose}>취소</button>
          <button
            className="button button--primary"
            type="button"
            onClick={() => onSelectTask?.(draftTaskKey)}
          >
            확인
          </button>
        </div>
      </div>
    </>
  );
}
