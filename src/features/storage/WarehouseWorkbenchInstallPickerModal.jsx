import React from 'react';

export default function WarehouseWorkbenchInstallPickerModal({
  open,
  selectedTable,
  picker,
  tableOptions,
  onInstall,
  onSelectTable,
  onClearTableSelection,
  onClose
}) {
  if (!open || !picker) return null;

  return (
    <>
      <div
        className="slot-picker-backdrop"
        style={{ zIndex: 3902 }}
        onClick={onClose}
      />
      <div className="slot-picker slot-picker--modal" style={{ zIndex: 3903 }}>
        <div className="slot-picker__title">
          {selectedTable
            ? `${selectedTable.name} 자재를 어디서 가져올까요?`
            : `${picker.slotLabel}에 어떤 작업대를 설치할까요?`}
        </div>
        <div className="slot-picker__hint">
          {selectedTable
            ? '현재 토지의 창고나 주차 차량 적재함 중에서 설치 자재를 꺼낼 위치를 고릅니다.'
            : '현재 토지에 자재만 있으면 작업대 종류를 고르는 즉시 바로 설치합니다.'}
        </div>
        <div className="slot-picker__tabs slot-picker__tabs--save-slots">
          {selectedTable
            ? selectedTable.availableSourceOptions.map((option) => (
              <button
                key={option.optionKey}
                type="button"
                className="focus-tab slot-button-card"
                onClick={() => onInstall(option.optionKey)}
                title={`${selectedTable.name} 설치`}
              >
                <div className="slot-button-card__main">
                  {selectedTable.imageUrl ? (
                    <div className="slot-button-card__thumb" aria-hidden="true">
                      <img src={selectedTable.imageUrl} alt="" />
                    </div>
                  ) : null}
                  <div className="slot-button-content">
                    <strong>{`${selectedTable.name} 설치`}</strong>
                    <span>{option.requirementText}</span>
                    {option.sourceAllocations.map((allocation) => (
                      <small key={`${option.optionKey}:${allocation.sourceType}:${allocation.sourceKey}`}>
                        {`${allocation.sourceName} · 컨테이너 ${Math.max(0, Number(allocation.useAppleContainerQty) || 0)}개 · 파레트 ${Math.max(0, Number(allocation.usePalletQty) || 0)}개`}
                      </small>
                    ))}
                  </div>
                </div>
              </button>
            ))
            : tableOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`focus-tab slot-button-card ${option.canInstall ? '' : 'is-disabled'}`.trim()}
                disabled={!option.canInstall}
                onClick={() => {
                  const directInstallOption = Array.isArray(option.availableSourceOptions)
                    ? option.availableSourceOptions[0]
                    : null;
                  if (directInstallOption?.optionKey) {
                    onInstall(directInstallOption.optionKey);
                    return;
                  }
                  onSelectTable(option.key);
                }}
                title={option.canInstall ? `${option.name} 설치` : option.stockText}
              >
                <div className="slot-button-card__main">
                  {option.imageUrl ? (
                    <div className="slot-button-card__thumb" aria-hidden="true">
                      <img src={option.imageUrl} alt="" />
                    </div>
                  ) : null}
                  <div className="slot-button-content">
                    <strong>{option.name}</strong>
                    <span>{option.requirementText}</span>
                    <small>{option.stockText}</small>
                  </div>
                </div>
              </button>
            ))}
          {selectedTable && !selectedTable.availableSourceOptions.length ? (
            <div className="empty-box" style={{ gridColumn: '1 / -1' }}>
              현재 토지의 다른 창고나 차량 적재함에도 설치 자재가 없습니다.
            </div>
          ) : null}
          {!selectedTable && !tableOptions.some((option) => option.canInstall) ? (
            <div className="empty-box" style={{ gridColumn: '1 / -1' }}>
              설치 가능한 작업대가 없습니다.
            </div>
          ) : null}
        </div>
        <div className="footer-actions">
          {selectedTable ? (
            <button className="button button--ghost" type="button" onClick={onClearTableSelection}>작업대 다시 선택</button>
          ) : null}
          <button className="button button--ghost" type="button" onClick={onClose}>취소</button>
        </div>
      </div>
    </>
  );
}
