import React from 'react';

export default function WarehouseStorageCleanupPickers(props) {
  const {
    cleanupTransportPickerTaskKey,
    cleanupTransportPickerTaskLabel,
    cleanupTransportPickerSelectedTarget,
    cleanupTransportPickerTransportRows,
    cleanupTransportPickerStorageRows,
    cleanupWasteTargetStoragePrefix,
    closeCleanupTransportPicker,
    chooseCleanupTransportFromPicker,
    cleanupMoveAssistPickerTaskKey,
    cleanupMoveAssistPickerTaskLabel,
    cleanupMoveAssistPickerOptions,
    cleanupMoveAssistPickerSelectedKey,
    cleanupWasteMoveToolLaborMultiplierByKey,
    closeCleanupMoveAssistPicker,
    chooseCleanupMoveAssistFromPicker,
    toolImageSrcOf,
  } = props;

  return (
    <>
      {cleanupTransportPickerTaskKey ? (
        <>
          <div className="slot-picker-backdrop" onClick={closeCleanupTransportPicker} />
          <div className="slot-picker slot-picker--modal">
            <div className="slot-picker__title">{`${cleanupTransportPickerTaskLabel} · 적재할 곳 선택`}</div>
            <div className="slot-picker__hint">현재 토지의 주차 차량 적재함 또는 창고를 선택할 수 있습니다.</div>
            <div className="slot-picker__hint" style={{ marginTop: 8 }}>주차 차량 적재함</div>
            {cleanupTransportPickerTransportRows.length ? (
              <div className="slot-picker__tabs">
                {cleanupTransportPickerTransportRows.map((row) => {
                  const selected = cleanupTransportPickerSelectedTarget === row.target;
                  const label = `${row?.machine?.item?.name || row?.machine?.machineKey} #${row?.machine?.unitNo || 1}`;
                  return (
                    <button
                      key={`cleanup-transport-picker-${row.target}`}
                      type="button"
                      className={`focus-tab slot-button ${selected ? 'slot-button--selected-outline' : ''}`.trim()}
                      onClick={() => chooseCleanupTransportFromPicker(row.target)}
                    >
                      <strong>{label}</strong>
                      <span>{`P${Math.max(1, Number(row?.slotNo) || 1)} 주차중`}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="meter__hint" style={{ marginTop: 10 }}>현재 토지에 주차된 운반차/트럭이 없습니다.</div>
            )}
            <div className="slot-picker__hint" style={{ marginTop: 10 }}>창고</div>
            {cleanupTransportPickerStorageRows.length ? (
              <div className="slot-picker__tabs">
                {cleanupTransportPickerStorageRows.map((row) => {
                  const target = `${cleanupWasteTargetStoragePrefix}${row.key}`;
                  const selected = cleanupTransportPickerSelectedTarget === target;
                  return (
                    <button
                      key={`cleanup-storage-picker-${row.key}`}
                      type="button"
                      className={`focus-tab slot-button ${selected ? 'slot-button--selected-outline' : ''}`.trim()}
                      onClick={() => chooseCleanupTransportFromPicker(target)}
                    >
                      <strong>{row.name}</strong>
                      <span>현재 토지 창고</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="meter__hint" style={{ marginTop: 10 }}>현재 토지에 보관 가능한 창고가 없습니다.</div>
            )}
            <div className="footer-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => chooseCleanupTransportFromPicker('')}
              >
                선택 해제
              </button>
              <button className="button button--ghost" onClick={closeCleanupTransportPicker}>닫기</button>
            </div>
          </div>
        </>
      ) : null}
      {cleanupMoveAssistPickerTaskKey ? (
        <>
          <div className="slot-picker-backdrop" onClick={closeCleanupMoveAssistPicker} />
          <div className="slot-picker slot-picker--modal">
            <div className="slot-picker__title">{`${cleanupMoveAssistPickerTaskLabel} · 운반 보조도구 선택`}</div>
            <div className="slot-picker__hint">폐기 작업 노동력 감소용 보조도구를 선택합니다.</div>
            {cleanupMoveAssistPickerOptions.length ? (
              <div className="slot-picker__tabs">
                {cleanupMoveAssistPickerOptions.map((item) => {
                  const selected = cleanupMoveAssistPickerSelectedKey === String(item?.key || '');
                  const imageSrc = toolImageSrcOf(String(item?.key || ''));
                  return (
                    <button
                      key={`cleanup-move-assist-picker-${item.key}`}
                      type="button"
                      className={`focus-tab slot-button slot-button--with-thumb ${selected ? 'slot-button--selected-outline' : ''}`.trim()}
                      onClick={() => chooseCleanupMoveAssistFromPicker(item.key)}
                    >
                      {imageSrc ? (
                        <div className="slot-button__thumb" aria-hidden="true">
                          <img src={imageSrc} alt="" loading="lazy" />
                        </div>
                      ) : null}
                      <div className="slot-button-content">
                        <strong>{item.name}</strong>
                        <span>{`노동력 x${(Number(cleanupWasteMoveToolLaborMultiplierByKey?.[item.key]) || 1).toFixed(2)}`}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="meter__hint" style={{ marginTop: 10 }}>보유한 운반 보조도구가 없습니다.</div>
            )}
            <div className="footer-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => chooseCleanupMoveAssistFromPicker('')}
              >
                선택 해제
              </button>
              <button className="button button--ghost" onClick={closeCleanupMoveAssistPicker}>닫기</button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
