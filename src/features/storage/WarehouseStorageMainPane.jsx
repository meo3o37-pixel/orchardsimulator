import React from 'react';

export default function WarehouseStorageMainPane({
  modalRef,
  className,
  activeFacilityStorageKey,
  entrySelector,
  title,
  coldStatus,
  hideTabs,
  primaryTabs,
  activeTab,
  activeFacilityTab,
  onSelectPrimaryTab,
  showFacilityShortcut,
  facilityButtonIcon,
  onSelectFacilityTabShortcut,
  harvestTabs,
  activeHarvestTab,
  onSelectHarvestTab,
  facilityTabs,
  onSelectFacilityTab,
  panelClassName,
  onPanelAnimationEnd,
  children,
  showFooter,
  usedKgText,
  capacityKgText,
  usagePctText,
  interactionLocked = false,
  interactionLockedReason = '',
  onOpenShareModal,
  ventilationAction,
  onBack,
  onClose,
}) {
  const usagePctValue = Math.max(0, Math.min(100, Number.parseFloat(String(usagePctText || '')) || 0));
  const usageGaugeColorPct = Math.max(10, Math.min(100, usagePctValue || 0));
  const usageGaugeHue = 145 - (((usageGaugeColorPct - 10) / 90) * 137);
  const usageGaugeFillColor = `hsl(${usageGaugeHue.toFixed(1)} 58% 46%)`;
  const usageGaugeGlowColor = `hsl(${usageGaugeHue.toFixed(1)} 68% 58%)`;
  const showInteractionLockShield = Boolean(activeFacilityStorageKey && interactionLocked);

  return (
    <div
      ref={modalRef}
      className={className}
    >
      {!activeFacilityStorageKey ? (
        entrySelector
      ) : (
        <>
          <div className="warehouse-storage-header-row">
            <div className="confirm-modal__title">{title}</div>
            {coldStatus ? (
              <div className="warehouse-storage-header-status">
                {coldStatus}
              </div>
            ) : null}
          </div>
          {!hideTabs ? (
            <>
              <div className="warehouse-storage-tabs-bar" style={{ marginTop: 10 }}>
                <div className="focus-tabs warehouse-storage-tabs-bar__main">
                  {primaryTabs.map((tab) => (
                    <button
                      key={tab.key}
                      className={`focus-tab focus-tab--farm-main-animate ${activeTab === tab.key ? 'focus-tab--active' : ''}`.trim()}
                      disabled={interactionLocked}
                      title={interactionLocked ? interactionLockedReason : ''}
                      onClick={() => onSelectPrimaryTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {showFacilityShortcut ? (
                  <button
                    type="button"
                    className={`focus-tab focus-tab--facility-icon focus-tab--facility-shortcut focus-tab--farm-main-animate warehouse-storage-tabs-bar__facility-shortcut warehouse-storage-tabs-bar__facility-tab ${activeTab === 'facility' ? 'focus-tab--active' : ''}`.trim()}
                    disabled={interactionLocked}
                    onClick={onSelectFacilityTabShortcut}
                    title="수확물시설"
                    aria-label="수확물시설"
                  >
                    <span className="warehouse-storage-tabs-bar__facility-icon" aria-hidden="true">{facilityButtonIcon}</span>
                    <span className="warehouse-storage-tabs-bar__facility-label">수확물시설</span>
                  </button>
                ) : null}
              </div>
              {(activeTab === 'harvest' || (activeTab === 'facility' && activeFacilityTab === 'harvest')) && harvestTabs.length > 1 ? (
                <div className="focus-tabs warehouse-storage-harvest-subtabs" style={{ marginTop: 12 }}>
                  {harvestTabs.map((tab) => (
                    <button
                      key={`facility-storage-harvest-tab-${tab.key}`}
                      type="button"
                      className={`focus-tab focus-tab--farm-main-animate warehouse-storage-harvest-subtab ${activeHarvestTab === tab.key ? 'focus-tab--active' : ''}`.trim()}
                      disabled={interactionLocked}
                      title={interactionLocked ? interactionLockedReason : ''}
                      onClick={() => onSelectHarvestTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              ) : activeTab === 'facility' ? (
                <div className="focus-tabs warehouse-storage-harvest-subtabs" style={{ marginTop: 12 }}>
                  {facilityTabs.map((tab) => (
                    <button
                      key={`facility-storage-facility-tab-${tab.key}`}
                      type="button"
                      className={`focus-tab focus-tab--farm-main-animate warehouse-storage-harvest-subtab warehouse-storage-facility-subtab ${activeFacilityTab === tab.key ? 'focus-tab--active' : ''}`.trim()}
                      disabled={interactionLocked}
                      title={interactionLocked ? interactionLockedReason : ''}
                      onClick={() => onSelectFacilityTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
          <div className={panelClassName} onAnimationEnd={onPanelAnimationEnd}>
            {children}
          </div>
        </>
      )}
      {showFooter ? (
        <div className="warehouse-storage-footer-row">
          <div className="warehouse-storage-footer-main">
            <div className="inline-summary inline-summary--storage-compact">
              <div className="summary-chip summary-chip--storage-compact"><span>현재 보관량</span><strong>{usedKgText}</strong></div>
              <div className="summary-chip summary-chip--storage-compact"><span>최대 보관량</span><strong>{capacityKgText}</strong></div>
              <div className="summary-chip summary-chip--storage-compact summary-chip--storage-gauge">
                <span>사용률</span>
                <strong>{usagePctText}</strong>
                <div className="summary-chip__gauge" aria-hidden="true">
                  <div
                    className="summary-chip__gauge-fill"
                    style={{
                      width: `${usagePctValue}%`,
                      '--usage-gauge-fill': usageGaugeFillColor,
                      '--usage-gauge-glow': usageGaugeGlowColor,
                    }}
                  />
                </div>
              </div>
            </div>
            <button
              className="button button--ghost warehouse-storage-footer-button"
              type="button"
              onClick={onOpenShareModal}
              title={interactionLocked ? interactionLockedReason : ''}
              disabled={interactionLocked || !activeFacilityStorageKey}
            >
              점유율 확인
            </button>
            {ventilationAction ? (
              <button
                className={`button button--ghost warehouse-storage-footer-button warehouse-storage-footer-button--ventilation ${(interactionLocked || ventilationAction.disabled) ? 'is-disabled-look' : ''}`.trim()}
                type="button"
                title={interactionLocked ? interactionLockedReason : (ventilationAction.title || '')}
                onClick={ventilationAction.onClick}
                disabled={interactionLocked || Boolean(ventilationAction.disabled)}
              >
                {ventilationAction.label}
              </button>
            ) : null}
          </div>
          <div className="footer-actions warehouse-storage-footer-actions" style={{ marginTop: 0 }}>
            <span className="warehouse-storage-footer-actions__right">
              <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
              <button className="button button--ghost warehouse-storage-footer-button warehouse-storage-footer-button--close" onClick={onClose}>닫기</button>
            </span>
          </div>
        </div>
      ) : null}
      {showInteractionLockShield ? (
        <div
          aria-hidden="true"
          title={interactionLockedReason}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            cursor: 'not-allowed',
            background: 'transparent',
          }}
        />
      ) : null}
    </div>
  );
}
