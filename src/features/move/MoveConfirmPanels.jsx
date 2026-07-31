import React from 'react';
import { ParkingSlotSelectorPanel } from './MoveParkingPanels';

export const VehicleMoveOptionCard = ({
  machine,
  active = false,
  fuelNeed = 0,
  currentFuel = 0,
  onClick,
  showFuelLow = true,
  imageSrc = '',
  loadSummary = null,
  machineFuelTypeLabelOf,
  machineFuelUnitLabelOf
}) => {
  const fuelTypeLabel = machineFuelTypeLabelOf(machine?.item?.fuelType);
  const fuelUnitLabel = machineFuelUnitLabelOf(machine?.item?.fuelType);
  const fuelLow = currentFuel + 1e-6 < fuelNeed;
  const overloadBlocked = Boolean(loadSummary?.blocked);
  const overloaded = Boolean(loadSummary?.overloaded);
  const overloadToneText = overloadBlocked
    ? '과적 한도 초과'
    : loadSummary?.band === 'heavy'
      ? '심한 과적'
      : loadSummary?.band === 'medium'
        ? '중과적'
        : loadSummary?.band === 'light'
          ? '경미 과적'
          : '';
  return (
    <button
      type="button"
      className={`field-move-vehicle-btn ${active ? 'is-active' : ''} ${fuelLow ? 'is-fuel-low' : ''} ${overloaded ? 'is-overloaded' : ''} ${overloadBlocked ? 'is-overload-blocked' : ''}`.trim()}
      onClick={onClick}
      title={overloadBlocked ? '과적 한도(최대 적재량의 2배)를 초과했습니다.' : (fuelLow ? '현재 연료로는 이동할 수 없습니다.' : (overloaded ? '과적 상태입니다.' : ''))}
    >
      <div className="field-move-vehicle-btn__body">
        {imageSrc ? (
          <div className="field-move-vehicle-btn__thumb" aria-hidden="true">
            <img src={imageSrc} alt="" />
          </div>
        ) : null}
        <div className="field-move-vehicle-btn__meta">
          <strong>{`${machine?.item?.name || machine?.machineKey} #${machine?.unitNo}`}</strong>
          {machine?.parkingLocationLabel ? (
            <span>{machine.parkingLocationLabel}</span>
          ) : null}
          {loadSummary ? (
            <span>{`적재 ${loadSummary.loadKg.toFixed(1)}kg / ${loadSummary.payloadKg.toFixed(1)}kg (${(loadSummary.ratio * 100).toFixed(0)}%)`}</span>
          ) : (
            <span>{`적재량 ${Number(machine?.item?.payloadKg || 0).toLocaleString()}kg`}</span>
          )}
          <span>{`연료 ${fuelTypeLabel} ${currentFuel.toFixed(2)}${fuelUnitLabel} / 필요 ${fuelNeed.toFixed(2)}${fuelUnitLabel}`}</span>
          {overloaded ? <em>{overloadToneText}</em> : null}
          {showFuelLow && fuelLow ? <em>연료 부족</em> : null}
        </div>
      </div>
    </button>
  );
};

export const TownMoveMarkerConfirmPanel = ({
  sourceLabel,
  destinationLabel,
  distanceKm,
  locationContext,
  townArrivalVehicleId,
  walkLaborNeedText,
  vehicleLaborNeedText,
  onWalk,
  townReturnVehicle,
  townReturnVehicleFuelNeed,
  townReturnVehicleCurrentFuel,
  townReturnVehicleFuelUnitLabel,
  onMoveByVehicle,
  currentFieldVehicleInstances,
  selectedVehicleId = '',
  selectedVehicle,
  selectedVehicleFuelNeed,
  selectedVehicleLaborNeedText,
  resolveCurrentFuel,
  resolveFuelNeed,
  resolveLoadSummary,
  onSelectVehicle,
  moveByVehicleDisabled = false,
  moveByVehicleTitle = '',
  formatDistanceKmText,
  machineFuelTypeLabelOf,
  machineFuelUnitLabelOf,
  landMoveFuelNeedLitersOfMachine,
  machineImageSrcOf
}) => (
  <>
    <div className="confirm-modal__title">{`${destinationLabel} 이동`}</div>
    <div className="confirm-modal__desc">
      {`${sourceLabel} → ${destinationLabel} (${formatDistanceKmText(distanceKm)})`}
    </div>
    <div className="field-move-modal__section">
      <div className="field-move-modal__section-head">
        <strong>걸어서 이동</strong>
        <span>{`노동력 -${walkLaborNeedText}`}</span>
      </div>
      <button
        className="button button--ghost"
        onClick={onWalk}
        disabled={locationContext === 'town' && Boolean(townArrivalVehicleId)}
        title={locationContext === 'town' && townArrivalVehicleId ? '탑승 중에는 탈것 이동을 사용해 주세요.' : ''}
      >
        걸어가기
      </button>
    </div>
    <div className="field-move-modal__section">
      <div className="field-move-modal__section-head">
        <strong>탈것 이용 이동</strong>
        <span>{`노동력 -${vehicleLaborNeedText} + 연료 소모`}</span>
      </div>
      {locationContext === 'town' ? (
        townReturnVehicle ? (
          <>
            <div className="field-move-vehicle-list">
              <VehicleMoveOptionCard
                machine={townReturnVehicle}
                active
                fuelNeed={townReturnVehicleFuelNeed}
                currentFuel={townReturnVehicleCurrentFuel}
                onClick={() => {}}
                showFuelLow={false}
                imageSrc={machineImageSrcOf?.(townReturnVehicle) || ''}
                loadSummary={typeof resolveLoadSummary === 'function' ? resolveLoadSummary(townReturnVehicle) : null}
                machineFuelTypeLabelOf={machineFuelTypeLabelOf}
                machineFuelUnitLabelOf={machineFuelUnitLabelOf}
              />
            </div>
            <button
              className="button button--primary"
              onClick={onMoveByVehicle}
              disabled={moveByVehicleDisabled}
              title={moveByVehicleTitle}
            >
              {`${townReturnVehicle.item?.name || townReturnVehicle.machineKey}로 이동`}
            </button>
            <div className="meter__hint" style={{ marginTop: 8 }}>
              {`예상 소모: 노동력 ${vehicleLaborNeedText} / 연료 ${townReturnVehicleFuelNeed.toFixed(2)}${townReturnVehicleFuelUnitLabel}`}
            </div>
          </>
        ) : currentFieldVehicleInstances.length ? (
          <>
            <div className="field-move-vehicle-list">
              {currentFieldVehicleInstances.map((machine) => {
                const isActive = machine.id === selectedVehicleId;
                const fuelNeed = typeof resolveFuelNeed === 'function'
                  ? resolveFuelNeed(machine, distanceKm)
                  : landMoveFuelNeedLitersOfMachine(machine.item, distanceKm);
                const currentFuel = resolveCurrentFuel(machine);
                return (
                  <VehicleMoveOptionCard
                    key={`town-remote-move-vehicle-${machine.id}`}
                    machine={machine}
                    active={isActive}
                    fuelNeed={fuelNeed}
                    currentFuel={currentFuel}
                    onClick={() => onSelectVehicle(machine.id)}
                    imageSrc={machineImageSrcOf?.(machine) || ''}
                    loadSummary={typeof resolveLoadSummary === 'function' ? resolveLoadSummary(machine) : null}
                    machineFuelTypeLabelOf={machineFuelTypeLabelOf}
                    machineFuelUnitLabelOf={machineFuelUnitLabelOf}
                  />
                );
              })}
            </div>
            <button
              className="button button--primary"
              onClick={onMoveByVehicle}
              disabled={moveByVehicleDisabled}
              title={moveByVehicleTitle}
            >
              {selectedVehicle
                ? `${selectedVehicle.item?.name || selectedVehicle.machineKey}로 이동`
                : '탈것 선택'}
            </button>
            {selectedVehicle ? (
              <div className="meter__hint" style={{ marginTop: 8 }}>
                {`예상 소모: 노동력 ${selectedVehicleLaborNeedText} / 연료 ${selectedVehicleFuelNeed.toFixed(2)}${machineFuelUnitLabelOf(selectedVehicle.item?.fuelType)}`}
              </div>
            ) : null}
          </>
        ) : (
          <div className="meter__hint">주차된 차량이 없습니다.</div>
        )
      ) : currentFieldVehicleInstances.length ? (
        <>
          <div className="field-move-vehicle-list">
            {currentFieldVehicleInstances.map((machine) => {
              const isActive = machine.id === selectedVehicleId;
              const fuelNeed = typeof resolveFuelNeed === 'function'
                ? resolveFuelNeed(machine, distanceKm)
                : landMoveFuelNeedLitersOfMachine(machine.item, distanceKm);
              const currentFuel = resolveCurrentFuel(machine);
              return (
                <VehicleMoveOptionCard
                  key={`town-move-vehicle-${machine.id}`}
                  machine={machine}
                  active={isActive}
                  fuelNeed={fuelNeed}
                  currentFuel={currentFuel}
                  onClick={() => onSelectVehicle(machine.id)}
                  imageSrc={machineImageSrcOf?.(machine) || ''}
                  loadSummary={typeof resolveLoadSummary === 'function' ? resolveLoadSummary(machine) : null}
                  machineFuelTypeLabelOf={machineFuelTypeLabelOf}
                  machineFuelUnitLabelOf={machineFuelUnitLabelOf}
                />
              );
            })}
          </div>
          <button
            className="button button--primary"
            onClick={onMoveByVehicle}
            disabled={moveByVehicleDisabled}
            title={moveByVehicleTitle}
          >
            {selectedVehicle
              ? `${selectedVehicle.item?.name || selectedVehicle.machineKey}로 이동`
              : '탈것 선택'}
          </button>
          {selectedVehicle ? (
            <div className="meter__hint" style={{ marginTop: 8 }}>
              {`예상 소모: 노동력 ${selectedVehicleLaborNeedText} / 연료 ${selectedVehicleFuelNeed.toFixed(2)}${machineFuelUnitLabelOf(selectedVehicle.item?.fuelType)}`}
            </div>
          ) : null}
        </>
      ) : (
        <div className="meter__hint">현재 토지에 이동 가능한 탈것(승용/화물)이 주차되어 있지 않습니다.</div>
      )}
    </div>
  </>
);

export const FieldMoveConfirmPanel = ({
  sourceLabel,
  destinationLabel,
  distanceKm,
  walkLaborNeedText,
  vehicleLaborNeedText,
  onWalk,
  carrierInstances,
  selectedVehicleId = '',
  selectedVehicle,
  selectedVehicleFuelNeed,
  selectedVehicleLaborNeedText,
  resolveCurrentFuel,
  resolveFuelNeed,
  resolveLoadSummary,
  onSelectVehicle,
  parkingCapacity,
  openParkingCapacity,
  parkingSlots,
  activeParkingSlotNo = 0,
  resolveParkedMachine,
  onSelectParkingSlot,
  parkingSlotLabel,
  onMoveByVehicle,
  moveByVehicleDisabled = false,
  moveByVehicleTitle = '',
  formatDistanceKmText,
  machineFuelTypeLabelOf,
  machineFuelUnitLabelOf,
  landMoveFuelNeedLitersOfMachine,
  machineImageSrcOf
}) => (
  <>
    <div className="confirm-modal__title">토지 이동</div>
    <div className="confirm-modal__desc">
      {`${sourceLabel} → ${destinationLabel} (${formatDistanceKmText(distanceKm)})`}
    </div>
    <div className="field-move-modal__section">
      <div className="field-move-modal__section-head">
        <strong>걸어서 이동</strong>
        <span>{`노동력 -${walkLaborNeedText}`}</span>
      </div>
      <button className="button button--ghost" onClick={onWalk}>
        걸어가기
      </button>
    </div>
    <div className="field-move-modal__section">
      <div className="field-move-modal__section-head">
        <strong>탈것 이용 이동</strong>
        <span>{`노동력 -${vehicleLaborNeedText} + 연료 소모`}</span>
      </div>
      {carrierInstances.length ? (
        <>
          <div className="field-move-vehicle-list">
            {carrierInstances.map((machine) => {
              const isActive = machine.id === selectedVehicleId;
              const fuelNeed = typeof resolveFuelNeed === 'function'
                ? resolveFuelNeed(machine, distanceKm)
                : landMoveFuelNeedLitersOfMachine(machine.item, distanceKm);
              const currentFuel = resolveCurrentFuel(machine);
              return (
                <VehicleMoveOptionCard
                  key={`field-move-vehicle-${machine.id}`}
                  machine={machine}
                  active={isActive}
                  fuelNeed={fuelNeed}
                  currentFuel={currentFuel}
                  onClick={() => onSelectVehicle(machine.id)}
                  imageSrc={machineImageSrcOf?.(machine) || ''}
                  loadSummary={typeof resolveLoadSummary === 'function' ? resolveLoadSummary(machine) : null}
                  machineFuelTypeLabelOf={machineFuelTypeLabelOf}
                  machineFuelUnitLabelOf={machineFuelUnitLabelOf}
                />
              );
            })}
          </div>
          <ParkingSlotSelectorPanel
            title="도착지 주차칸 선택"
            capacity={parkingCapacity}
            openCapacity={openParkingCapacity}
            parkingSlots={parkingSlots}
            activeSlotNo={activeParkingSlotNo}
            resolveParkedMachine={resolveParkedMachine}
            machineImageSrcOf={machineImageSrcOf}
            onSelect={onSelectParkingSlot}
            slotLabel={parkingSlotLabel}
            occupiedText="사용중"
            emptyText="주차가능"
            emptyHint="도착 토지에 주차칸이 없습니다."
            className="field-move-parking-panel--two-row-scroll"
          />
          <button
            className="button button--primary"
            onClick={onMoveByVehicle}
            disabled={moveByVehicleDisabled}
            title={moveByVehicleTitle}
          >
            {selectedVehicle
              ? `${selectedVehicle.item?.name || selectedVehicle.machineKey}로 이동`
              : '탈것 선택'}
          </button>
          {selectedVehicle ? (
            <div className="meter__hint" style={{ marginTop: 8 }}>
              {`예상 소모: 노동력 ${selectedVehicleLaborNeedText} / 연료 ${selectedVehicleFuelNeed.toFixed(2)}${machineFuelUnitLabelOf(selectedVehicle.item?.fuelType)}`}
            </div>
          ) : null}
        </>
      ) : (
        <div className="meter__hint">현재 토지에 이동 가능한 탈것(적재량 + 연료형)이 주차되어 있지 않습니다.</div>
      )}
    </div>
  </>
);

export const TownReturnConfirmPanel = ({
  title,
  sourceLabel,
  targetLabel,
  distanceKm,
  isFromTownContext,
  hasTownArrivalVehicle,
  walkLaborNeedText,
  vehicleLaborNeedText,
  onWalk,
  townReturnVehicle,
  townReturnVehicleFuelNeed,
  townReturnVehicleLaborNeedText,
  townReturnVehicleCurrentFuel,
  carrierInstances,
  selectedVehicleId = '',
  activeVehicle,
  activeVehicleFuelNeed,
  activeVehicleLaborNeedText,
  resolveCurrentFuel,
  resolveFuelNeed,
  resolveLoadSummary,
  onSelectVehicle,
  destinationFieldLabel,
  parkingCapacity,
  openParkingCapacity,
  parkingSlots,
  activeParkingSlotNo = 0,
  resolveParkedMachine,
  onSelectParkingSlot,
  onMoveByVehicle,
  moveByVehicleDisabled = false,
  moveByVehicleTitle = '',
  formatDistanceKmText,
  machineFuelTypeLabelOf,
  machineFuelUnitLabelOf,
  landMoveFuelNeedLitersOfMachine,
  machineImageSrcOf
}) => (
  <>
    <div className="confirm-modal__title">{title}</div>
    <div className="confirm-modal__desc">
      {`${sourceLabel} → ${targetLabel} (${formatDistanceKmText(distanceKm)})`}
    </div>
    <div className="field-move-modal__section">
      <div className="field-move-modal__section-head">
        <strong>걸어서 이동</strong>
        <span>{`노동력 -${walkLaborNeedText}`}</span>
      </div>
      <button
        className="button button--ghost"
        onClick={onWalk}
        disabled={isFromTownContext && hasTownArrivalVehicle}
        title={isFromTownContext && hasTownArrivalVehicle ? '마을에 차량이 남아 있습니다. 먼저 주차해 주세요.' : ''}
      >
        걸어가기
      </button>
      {isFromTownContext && hasTownArrivalVehicle ? (
        <div className="meter__hint" style={{ marginTop: 8 }}>
          차량을 먼저 마을 지점 주차칸에 주차해야 걸어서 귀가할 수 있습니다.
        </div>
      ) : null}
    </div>
    <div className="field-move-modal__section">
      <div className="field-move-modal__section-head">
        <strong>탈것 이용 이동</strong>
        <span>{townReturnVehicle || !isFromTownContext ? `노동력 -${vehicleLaborNeedText} + 연료 소모` : '도보 이동중'}</span>
      </div>
      {isFromTownContext ? (
        <>
          {townReturnVehicle ? (
            <div className="field-move-vehicle-list">
              <VehicleMoveOptionCard
                machine={townReturnVehicle}
                active
                fuelNeed={townReturnVehicleFuelNeed}
                currentFuel={townReturnVehicleCurrentFuel}
                onClick={() => {}}
                showFuelLow={false}
                imageSrc={machineImageSrcOf?.(townReturnVehicle) || ''}
                loadSummary={typeof resolveLoadSummary === 'function' ? resolveLoadSummary(townReturnVehicle) : null}
                machineFuelTypeLabelOf={machineFuelTypeLabelOf}
                machineFuelUnitLabelOf={machineFuelUnitLabelOf}
              />
            </div>
          ) : null}
          {townReturnVehicle ? (
            <>
              <div className="meter__hint" style={{ marginTop: 8 }}>
                {`도착 토지: ${destinationFieldLabel}`}
              </div>
              <div style={{ marginTop: 8 }}>
                <ParkingSlotSelectorPanel
                  title="도착지 주차칸 선택"
                  capacity={parkingCapacity}
                  openCapacity={openParkingCapacity}
                  parkingSlots={parkingSlots}
                  activeSlotNo={activeParkingSlotNo}
                  resolveParkedMachine={resolveParkedMachine}
                  machineImageSrcOf={machineImageSrcOf}
                  onSelect={onSelectParkingSlot}
                  slotLabel={`${destinationFieldLabel} 주차`}
                  occupiedText={(parkedVehicle) => `${parkedVehicle?.item?.name || '사용중'}${Number(parkedVehicle?.unitNo) > 0 ? ` #${parkedVehicle.unitNo}` : ''}`}
                  emptyText="선택 가능"
                  emptyHint="선택한 토지에 주차칸이 없습니다."
                />
              </div>
              <button
                className="button button--primary"
                onClick={onMoveByVehicle}
                disabled={moveByVehicleDisabled}
                title={moveByVehicleTitle}
              >
                {`${townReturnVehicle.item?.name || townReturnVehicle.machineKey}로 이동`}
              </button>
              <div className="meter__hint" style={{ marginTop: 8 }}>
                {`예상 소모: 노동력 ${townReturnVehicleLaborNeedText} / 연료 ${townReturnVehicleFuelNeed.toFixed(2)}${machineFuelUnitLabelOf(townReturnVehicle.item?.fuelType)}`}
              </div>
            </>
          ) : carrierInstances.length ? (
            <>
              <div className="field-move-vehicle-list">
                {carrierInstances.map((machine) => {
                  const isActive = machine.id === selectedVehicleId;
                  const fuelNeed = typeof resolveFuelNeed === 'function'
                    ? resolveFuelNeed(machine, distanceKm)
                    : landMoveFuelNeedLitersOfMachine(machine.item, distanceKm);
                  const currentFuel = resolveCurrentFuel(machine);
                  return (
                    <VehicleMoveOptionCard
                      key={`town-return-remote-vehicle-${machine.id}`}
                      machine={machine}
                      active={isActive}
                      fuelNeed={fuelNeed}
                      currentFuel={currentFuel}
                      onClick={() => onSelectVehicle(machine.id)}
                      imageSrc={machineImageSrcOf?.(machine) || ''}
                      loadSummary={typeof resolveLoadSummary === 'function' ? resolveLoadSummary(machine) : null}
                      machineFuelTypeLabelOf={machineFuelTypeLabelOf}
                      machineFuelUnitLabelOf={machineFuelUnitLabelOf}
                    />
                  );
                })}
              </div>
              <div className="meter__hint" style={{ marginTop: 8 }}>
                {`도착 토지: ${destinationFieldLabel}`}
              </div>
              <div style={{ marginTop: 8 }}>
                <ParkingSlotSelectorPanel
                  title="도착지 주차칸 선택"
                  capacity={parkingCapacity}
                  openCapacity={openParkingCapacity}
                  parkingSlots={parkingSlots}
                  activeSlotNo={activeParkingSlotNo}
                  resolveParkedMachine={resolveParkedMachine}
                  machineImageSrcOf={machineImageSrcOf}
                  onSelect={onSelectParkingSlot}
                  slotLabel={`${destinationFieldLabel} 주차`}
                  occupiedText={(parkedVehicle) => `${parkedVehicle?.item?.name || '사용중'}${Number(parkedVehicle?.unitNo) > 0 ? ` #${parkedVehicle.unitNo}` : ''}`}
                  emptyText="선택 가능"
                  emptyHint="선택한 토지에 주차칸이 없습니다."
                />
              </div>
              <button
                className="button button--primary"
                onClick={onMoveByVehicle}
                disabled={moveByVehicleDisabled}
                title={moveByVehicleTitle}
              >
                {activeVehicle
                  ? `${activeVehicle.item?.name || activeVehicle.machineKey}로 이동`
                  : '탈것 선택'}
              </button>
              {activeVehicle ? (
                <div className="meter__hint" style={{ marginTop: 8 }}>
                  {`예상 소모: 노동력 ${activeVehicleLaborNeedText} / 연료 ${activeVehicleFuelNeed.toFixed(2)}${machineFuelUnitLabelOf(activeVehicle.item?.fuelType)}`}
                </div>
              ) : null}
            </>
          ) : null}
        </>
      ) : (
        <>
          {carrierInstances.length ? (
            <div className="field-move-vehicle-list">
              {carrierInstances.map((machine) => {
                const isActive = machine.id === selectedVehicleId;
                const fuelNeed = typeof resolveFuelNeed === 'function'
                  ? resolveFuelNeed(machine, distanceKm)
                  : landMoveFuelNeedLitersOfMachine(machine.item, distanceKm);
                const currentFuel = resolveCurrentFuel(machine);
                return (
                <VehicleMoveOptionCard
                  key={`town-to-field-vehicle-${machine.id}`}
                  machine={machine}
                  active={isActive}
                  fuelNeed={fuelNeed}
                  currentFuel={currentFuel}
                  onClick={() => onSelectVehicle(machine.id)}
                  imageSrc={machineImageSrcOf?.(machine) || ''}
                  loadSummary={typeof resolveLoadSummary === 'function' ? resolveLoadSummary(machine) : null}
                  machineFuelTypeLabelOf={machineFuelTypeLabelOf}
                  machineFuelUnitLabelOf={machineFuelUnitLabelOf}
                />
                );
              })}
            </div>
          ) : (
            <div className="meter__hint">현재 토지에 이동 가능한 탈것(적재량 + 연료형)이 주차되어 있지 않습니다.</div>
          )}
          <div className="meter__hint" style={{ marginTop: 8 }}>
            {`도착 토지: ${destinationFieldLabel}`}
          </div>
          <div style={{ marginTop: 8 }}>
            <ParkingSlotSelectorPanel
              title="도착지 주차칸 선택"
              capacity={parkingCapacity}
              openCapacity={openParkingCapacity}
              parkingSlots={parkingSlots}
              activeSlotNo={activeParkingSlotNo}
              resolveParkedMachine={resolveParkedMachine}
              machineImageSrcOf={machineImageSrcOf}
              onSelect={onSelectParkingSlot}
              slotLabel={`${destinationFieldLabel} 주차`}
              occupiedText={(parkedVehicle) => `${parkedVehicle?.item?.name || '사용중'}${Number(parkedVehicle?.unitNo) > 0 ? ` #${parkedVehicle.unitNo}` : ''}`}
              emptyText="선택 가능"
              emptyHint="선택한 토지에 주차칸이 없습니다."
            />
          </div>
          <button
            className="button button--primary"
            onClick={onMoveByVehicle}
            disabled={moveByVehicleDisabled}
            title={moveByVehicleTitle}
          >
            {activeVehicle
              ? `${activeVehicle.item?.name || activeVehicle.machineKey}로 이동`
              : '탈것 선택'}
          </button>
          {activeVehicle ? (
            <div className="meter__hint" style={{ marginTop: 8 }}>
              {`예상 소모: 노동력 ${activeVehicleLaborNeedText} / 연료 ${activeVehicleFuelNeed.toFixed(2)}${machineFuelUnitLabelOf(activeVehicle.item?.fuelType)}`}
            </div>
          ) : null}
        </>
      )}
    </div>
  </>
);
