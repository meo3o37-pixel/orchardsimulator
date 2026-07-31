import React from 'react';
import { SmallApcColdStoragePanel, SmallApcOfficePanel, SmallApcOverlay, SmallApcSortingPanel, SmallApcStaffLoungePanel, SmallApcSupportSpacePanel, SmallApcWorkshopPanel } from './ServiceOfficePanels';
import SmallApcReceivingDeskWorkflowPanel from './SmallApcReceivingDeskWorkflowPanel';

export default function SmallApcMapOverlay({
  open,
  view,
  sortingSection = 'loading',
  title,
  closing,
  pickupPanel,
  coldStoragePanel,
  officePanel,
  workshopPanel,
  loungePanel,
  staffRosterPanel,
  cafeteriaPanel,
  shippingPanel,
  receptionWorkflowRows,
  loadingSlotRows,
  generalParkingSlotRows,
  coldStorageByBuilding,
  pendingUnloadRows,
  stemRemovalJobs,
  sortingJobs,
  sortingOutputBins,
  packingJobs,
  shippingJobs,
  shippingSlotRows,
  playerVehicleDetailById,
  staffingProfile,
  onAssignLoadingSlot,
  operationProfile,
  onBack,
  onClose,
  onOpenReceivingDesk,
  onOpenLoadingYard,
  onOpenSortingLine,
  onOpenPickup,
  onOpenColdStorage,
  onOpenOffice,
  onOpenWorkshop,
  onOpenLounge,
  onOpenCafeteria,
  onOpenShipping,
}) {
  return (
    <SmallApcOverlay
      open={open}
      view={view}
      title={title}
      closing={closing}
      staffingProfile={staffingProfile}
      pickupPanel={pickupPanel}
      coldStoragePanel={coldStoragePanel || (
        <SmallApcColdStoragePanel
          className={`confirm-modal confirm-modal--small-apc-receiving ${closing ? 'is-closing' : ''}`.trim()}
          staffingProfile={staffingProfile}
          coldStorageByBuilding={coldStorageByBuilding}
          pendingUnloadRows={pendingUnloadRows}
          stemRemovalJobs={stemRemovalJobs}
          sortingJobs={sortingJobs}
          onBack={onBack}
          onClose={onClose}
        />
      )}
      officePanel={officePanel || (
        <SmallApcOfficePanel
          className={`confirm-modal confirm-modal--small-apc-receiving ${closing ? 'is-closing' : ''}`.trim()}
          staffingProfile={staffingProfile}
          onOpenLounge={onOpenLounge}
          onBack={onBack}
          onClose={onClose}
        />
      )}
      workshopPanel={workshopPanel || (
        <SmallApcWorkshopPanel
          className={`confirm-modal confirm-modal--small-apc-receiving ${closing ? 'is-closing' : ''}`.trim()}
          staffingProfile={staffingProfile}
          stemRemovalJobs={stemRemovalJobs}
          packingJobs={packingJobs}
          sortingJobs={sortingJobs}
          sortingOutputBins={sortingOutputBins}
          coldStorageByBuilding={coldStorageByBuilding}
          onBack={onBack}
          onClose={onClose}
        />
      )}
      loungePanel={loungePanel || (
        <SmallApcStaffLoungePanel
          className={`confirm-modal confirm-modal--small-apc-receiving ${closing ? 'is-closing' : ''}`.trim()}
          staffingProfile={staffingProfile}
          onBack={onBack}
          onClose={onClose}
        />
      )}
      staffRosterPanel={staffRosterPanel || (
        <SmallApcStaffLoungePanel
          className={`confirm-modal confirm-modal--small-apc-receiving ${closing ? 'is-closing' : ''}`.trim()}
          staffingProfile={staffingProfile}
          mode="roster"
          onBack={onBack}
          onClose={onClose}
        />
      )}
      cafeteriaPanel={cafeteriaPanel || (
        <SmallApcSupportSpacePanel
          className={`confirm-modal confirm-modal--small-apc-receiving ${closing ? 'is-closing' : ''}`.trim()}
          title="식당"
          summary="현장 식사와 간식 보급을 담당하는 공간입니다."
          details={[
            '작업 인원 식사 동선과 연결되는 공간입니다.',
            '추후 직원 식사비나 배식 상태와 연결될 수 있습니다.',
          ]}
          facilityProfile={staffingProfile?.facilityByKey?.cafeteria || null}
          onBack={onBack}
          onClose={onClose}
        />
      )}
      shippingPanel={shippingPanel || (
        <SmallApcSupportSpacePanel
          className={`confirm-modal confirm-modal--small-apc-receiving ${closing ? 'is-closing' : ''}`.trim()}
          title="상품출고장"
          summary="선별과 포장이 끝난 상품을 출고 차량으로 넘기는 공간입니다."
          details={[
            '출고 대기 팔레트 적치와 상차 동선이 연결될 공간입니다.',
            '추후 거래처 출고 스케줄과 차량 배차 기능이 붙을 수 있습니다.',
          ]}
          facilityProfile={staffingProfile?.facilityByKey?.shipping || null}
          shippingJobs={shippingJobs}
          shippingSlotRows={shippingSlotRows}
          onBack={onBack}
          onClose={onClose}
        />
      )}
      sortingPanel={(
        <SmallApcSortingPanel
          className={`confirm-modal confirm-modal--small-apc-receiving ${closing ? 'is-closing' : ''}`.trim()}
          initialSection={sortingSection}
          mode={sortingSection === 'sorting' ? 'sorting-only' : 'loading-only'}
          staffingProfile={staffingProfile}
          loadingSlotRows={loadingSlotRows}
          sortingJobs={sortingJobs}
          sortingOutputBins={sortingOutputBins}
          coldStorageByBuilding={coldStorageByBuilding}
          onBack={onBack}
          onClose={onClose}
        />
      )}
      receivingDeskPanel={(
        <SmallApcReceivingDeskWorkflowPanel
          className={`confirm-modal confirm-modal--small-apc-receiving ${closing ? 'is-closing' : ''}`.trim()}
          closing={closing}
          receptionWorkflowRows={receptionWorkflowRows}
          loadingSlotRows={loadingSlotRows}
          staffingProfile={staffingProfile}
          generalParkingSlotRows={generalParkingSlotRows}
          playerVehicleDetailById={playerVehicleDetailById}
          onAssignLoadingSlot={onAssignLoadingSlot}
          operationProfile={operationProfile}
          onBack={onBack}
          onClose={onClose}
        />
      )}
      onOpenReceivingDesk={onOpenReceivingDesk}
      onOpenLoadingYard={onOpenLoadingYard}
      onOpenSortingLine={onOpenSortingLine}
      onOpenPickup={onOpenPickup}
      onOpenColdStorage={onOpenColdStorage}
      onOpenOffice={onOpenOffice}
      onOpenWorkshop={onOpenWorkshop}
      onOpenLounge={onOpenLounge}
      onOpenCafeteria={onOpenCafeteria}
      onOpenShipping={onOpenShipping}
      onBack={onBack}
      onClose={onClose}
    />
  );
}
