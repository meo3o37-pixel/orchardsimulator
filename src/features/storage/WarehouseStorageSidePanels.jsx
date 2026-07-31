import React from 'react';
import WarehouseStorageShareModal from './WarehouseStorageShareModal';

export default function WarehouseStorageSidePanels(props) {
  const {
    personalOnlyMode,
    carrierOnlyMode,
    closing,
    interactionLocked,
    interactionLockedReason,
    selectedCarrier,
    selectedTransportRow,
    sidePanelHeightPx,
    sidePanelOffsetPx,
    facilityStorageModalOpen,
    facilityStorageShareModalOpen,
    activeFacilityStorageKey,
    activeFacilityStorageUsedKg,
    activeFacilityStorageCapacityKg,
    activeFacilityStorageUsagePct,
    activeFacilityStorageShareRows,
    stripColdStorageIconName,
    decodeUnicodeEscapes,
    facilityName,
    renderFacilityStorageSelectedCarrierPanel,
    renderFacilityStorageCarrierSelector,
    renderFacilityStorageForkliftPanel,
    closeShareModal,
  } = props;

  return (
    <>
      {personalOnlyMode ? (
        <div
          className={`confirm-modal confirm-modal--warehouse-storage confirm-modal--warehouse-storage-right is-carrier-only is-personal-only is-expanded ${closing ? 'is-closing' : ''}`.trim()}
          style={interactionLocked ? { pointerEvents: 'none' } : undefined}
          title={interactionLocked ? interactionLockedReason : ''}
        >
          {renderFacilityStorageSelectedCarrierPanel()}
        </div>
      ) : carrierOnlyMode ? (
        <div
          className={`confirm-modal confirm-modal--warehouse-storage confirm-modal--warehouse-storage-right is-carrier-only is-expanded ${closing ? 'is-closing' : ''}`.trim()}
          style={interactionLocked ? { pointerEvents: 'none' } : undefined}
          title={interactionLocked ? interactionLockedReason : ''}
        >
          {!selectedCarrier
            ? renderFacilityStorageCarrierSelector('현재 토지 차량 적재함 선택', '선택한 차량 정보를 찾지 못했습니다. 아래 목록에서 다시 선택해 주세요.')
            : renderFacilityStorageSelectedCarrierPanel()}
        </div>
      ) : (
        <>
          <div
            className={`confirm-modal confirm-modal--warehouse-storage confirm-modal--warehouse-storage-right is-top-panel ${
              `${selectedCarrier ? 'is-docked ' : ''}${selectedCarrier ? 'is-expanded' : ''}`.trim()
            } ${closing ? 'is-closing' : ''}`.trim()}
            style={{
              height: `${sidePanelHeightPx}px`,
              top: `calc(50% - ${sidePanelOffsetPx}px)`,
              ...(interactionLocked ? { pointerEvents: 'none' } : {})
            }}
            title={interactionLocked ? interactionLockedReason : ''}
          >
            {!selectedCarrier
              ? renderFacilityStorageCarrierSelector('적재하시려면 저장공간을 선택해주세요')
              : renderFacilityStorageSelectedCarrierPanel()}
          </div>
          <div
            className={`confirm-modal confirm-modal--warehouse-storage confirm-modal--warehouse-storage-right is-bottom-panel ${
              `${selectedTransportRow ? 'is-docked ' : ''}${selectedTransportRow ? 'is-transport-selected' : ''}`.trim()
            } ${closing ? 'is-closing' : ''}`.trim()}
            style={{
              height: `${sidePanelHeightPx}px`,
              top: `calc(50% + ${sidePanelOffsetPx}px)`,
              ...(interactionLocked ? { pointerEvents: 'none' } : {})
            }}
            title={interactionLocked ? interactionLockedReason : ''}
          >
            {renderFacilityStorageForkliftPanel()}
          </div>
        </>
      )}
      <WarehouseStorageShareModal
        open={facilityStorageModalOpen && facilityStorageShareModalOpen && Boolean(activeFacilityStorageKey)}
        title="창고 점유율 상세"
        description={`${decodeUnicodeEscapes(stripColdStorageIconName(facilityName || '창고'))} · ${Math.round(activeFacilityStorageUsedKg).toLocaleString()} / ${Math.round(activeFacilityStorageCapacityKg).toLocaleString()}kg (${activeFacilityStorageUsagePct.toFixed(1)}%)`}
        note="주차된 차량·농기계는 주차 보관분이라 창고 적재중량과 점유율 계산에 포함되지 않습니다."
        rows={activeFacilityStorageShareRows}
        onClose={closeShareModal}
      />
    </>
  );
}
