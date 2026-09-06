import React from 'react';

import { HarvestQualityStampedCrate } from '../harvest/HarvestPendingBoxesPanel';
import { normalizeHarvestGradeLabel } from '../../utils/harvestGrade';
import {
  fuelJerrycanSizeClassByCapacity,
  parseCapacityLitersFromText,
} from '../fuel/containerUtils';

function AppleCratePreview({ tone }) {
  return (
    <div className={`apple-crate-preview apple-crate-preview--${tone}`.trim()}>
      <div className="apple-crate-preview__model">
        <div className="apple-crate-preview__top-cap" />
        <div className="apple-crate-preview__inner-top" />
        <div className="apple-crate-preview__handle apple-crate-preview__handle--1" />
        <div className="apple-crate-preview__handle apple-crate-preview__handle--2" />
        <div className="apple-crate-preview__handle apple-crate-preview__handle--3" />
        <div className="apple-crate-preview__handle apple-crate-preview__handle--4" />
        <div className="apple-crate-preview__handle apple-crate-preview__handle--5" />
        <div className="apple-crate-preview__bar apple-crate-preview__bar--1" />
        <div className="apple-crate-preview__bar apple-crate-preview__bar--2" />
        <div className="apple-crate-preview__bar apple-crate-preview__bar--3" />
        <div className="apple-crate-preview__grid-area">
          <div className="apple-crate-preview__col">
            <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
            <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
            <div className="apple-crate-preview__mesh" />
          </div>
          <div className="apple-crate-preview__col">
            <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
            <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
            <div className="apple-crate-preview__mesh" />
          </div>
          <div className="apple-crate-preview__col" />
          <div className="apple-crate-preview__col">
            <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
            <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
            <div className="apple-crate-preview__mesh" />
          </div>
          <div className="apple-crate-preview__col">
            <div className="apple-crate-preview__vline apple-crate-preview__vline--1" />
            <div className="apple-crate-preview__vline apple-crate-preview__vline--2" />
            <div className="apple-crate-preview__mesh" />
          </div>
        </div>
        <div className="apple-crate-preview__center-panel" />
        <div className="apple-crate-preview__bottom-row">
          <div className="apple-crate-preview__bottom-cell" />
          <div className="apple-crate-preview__bottom-cell" />
          <div className="apple-crate-preview__bottom-cell" />
          <div className="apple-crate-preview__bottom-cell" />
          <div className="apple-crate-preview__bottom-cell" />
          <div className="apple-crate-preview__bottom-cell" />
        </div>
        <div className="apple-crate-preview__side-frame apple-crate-preview__side-frame--left" />
        <div className="apple-crate-preview__side-frame apple-crate-preview__side-frame--right" />
        <div className="apple-crate-preview__corner apple-crate-preview__corner--1" />
        <div className="apple-crate-preview__corner apple-crate-preview__corner--2" />
      </div>
    </div>
  );
}

function ParkedMachineStorageCard({
  item,
  openShopItemDetailModal,
}) {
  const imageSrc = String(item?.imageSrc || '');
  const slotNo = Math.max(0, Number(item?.parkingSlotNo) || 0);
  const zoneLabel = String(item?.slotZoneLabel || '');
  const isProtectedSlot = Boolean(item?.isProtectedSlot);
  const durability = Number(item?.durability);
  const hasPayload = false;
  const actionButtons = null;

  return (
    <div
      className={`option-card parking-slot-card ${imageSrc ? 'parking-slot-card--with-machine-bg' : ''}`.trim()}
      style={{
        padding: 12,
        display: 'flex',
        minHeight: 170,
        ...(imageSrc ? { ['--parking-machine-bg']: `url("${imageSrc}")` } : {})
      }}
    >
      <button
        type="button"
        className={`control-slot-empty parking-slot-button is-active ${isProtectedSlot ? 'is-available' : 'is-openfield'} is-occupied`.trim()}
        aria-label={`parking-slot-${slotNo || item?.displayKey || item?.key || 'machine'}`}
        onClick={() => {
          openShopItemDetailModal(item, 'machine', {
            viewOnly: true,
            machineInstanceId: String(item?.machineInstanceId || ''),
            parkingSlotNo: slotNo
          });
        }}
        title={zoneLabel ? `${zoneLabel} 주차칸` : '주차 장비 상세정보'}
      >
        <span className="control-slot-empty__label">
          {String(item?.name || `P${slotNo}`)}
        </span>
        <span className="parking-slot-badge-wrap">
          {zoneLabel ? (
            <span className={`parking-slot-badge parking-slot-badge--left ${isProtectedSlot ? 'is-protected' : 'is-openfield'}`.trim()}>
              {zoneLabel}
            </span>
          ) : null}
          {slotNo > 0 ? (
            <span className="parking-slot-badge parking-slot-badge--right">
              {`P${slotNo}`}
            </span>
          ) : null}
        </span>
      </button>
      <div className="storage-card__meta" style={{ marginTop: 10 }}>
        {`${zoneLabel || '주차'}${slotNo > 0 ? ` 주차 P${slotNo}` : ''}`}
      </div>
      {Number(item?.weightKg) > 0 ? (
        <div className="storage-card__meta">{`무게 ${Number(item.weightKg).toLocaleString()}kg`}</div>
      ) : null}
      {Number.isFinite(durability) ? (
        <>
          <div className={`storage-card__meta ${durability >= 30 ? '' : 'is-bad'}`.trim()}>{`내구도 ${durability.toFixed(1)}%`}</div>
          <div className={`storage-card__durability-gauge ${durability >= 30 ? '' : 'is-bad'}`.trim()}>
            <span style={{ width: `${Math.max(0, Math.min(100, durability)).toFixed(1)}%` }} />
          </div>
        </>
      ) : null}
      {hasPayload ? (
        <div className="footer-actions warehouse-storage-card-actions">
          <button
            type="button"
            className="button button--primary button--compact facility-workbench-install-button"
            onClick={() => openFacilityStorageMachineLoadEntryForCarrier?.(String(item?.machineInstanceId || ''))}
          >
            적재
          </button>
        </div>
      ) : null}
      {hasPayload ? (
        <div className="footer-actions warehouse-storage-card-actions">
          <button
            type="button"
            className="button button--ghost button--compact facility-workbench-install-button"
            onClick={() => openFacilityStorageCarrierPanelForMachine?.(String(item?.machineInstanceId || ''))}
          >
            운반
          </button>
          <button
            type="button"
            className="button button--primary button--compact facility-workbench-install-button"
            onClick={() => openFacilityStorageMachineLoadEntryForCarrier?.(String(item?.machineInstanceId || ''))}
          >
            적재
          </button>
        </div>
      ) : null}
      {actionButtons}
    </div>
  );
}

function ParkedMachineParkingCard({
  item,
  openShopItemDetailModal,
  openFacilityStorageMachineLoadEntryForCarrier,
  openFacilityStorageCarrierPanelForMachine,
  clamp,
  durabilityToneClass,
}) {
  const imageSrc = String(item?.imageSrc || '');
  const slotNo = Math.max(0, Number(item?.parkingSlotNo) || 0);
  const zoneLabel = String(item?.slotZoneLabel || '');
  const isProtectedSlot = Boolean(item?.isProtectedSlot);
  const durability = Number(item?.durability);
  const hasFuelGauge = Boolean(item?.hasFuelGauge);
  const hasSeparateSprayFuel = Boolean(item?.hasSeparateSprayFuel);
  const hasLiquidGauge = Boolean(item?.hasLiquidGauge) && Number(item?.liquidCap) > 0;
  const hasPayload = Boolean(item?.hasPayload);
  const fuelRatio = clamp(Number(item?.fuelRatio) || 0, 0, 100);
  const sprayFuelRatio = clamp(Number(item?.sprayFuelRatio) || 0, 0, 100);
  const liquidRatio = clamp(Number(item?.liquidRatio) || 0, 0, 100);
  const payloadRatio = Math.max(0, Number(item?.payloadRatio) || 0);
  const payloadBarRatio = clamp(Number(item?.payloadBarRatio) || 0, 0, 100);
  const fuelUnitLabel = String(item?.fuelUnitLabel || 'L');
  const actionButtons = hasPayload ? (
    <div className="footer-actions warehouse-storage-card-actions">
      <button
        type="button"
        className="button button--ghost button--compact facility-workbench-install-button"
        onClick={() => openFacilityStorageCarrierPanelForMachine?.(String(item?.machineInstanceId || ''))}
      >
        운반
      </button>
      <button
        type="button"
        className="button button--primary button--compact facility-workbench-install-button"
        onClick={() => openFacilityStorageMachineLoadEntryForCarrier?.(String(item?.machineInstanceId || ''))}
      >
        적재
      </button>
    </div>
  ) : null;

  return (
    <div
      className={`option-card parking-slot-card ${imageSrc ? 'parking-slot-card--with-machine-bg' : ''}`.trim()}
      style={{
        padding: 12,
        display: 'flex',
        minHeight: 170,
        ...(imageSrc ? { ['--parking-machine-bg']: `url("${imageSrc}")` } : {})
      }}
    >
      <button
        type="button"
        className={`control-slot-empty parking-slot-button is-active ${isProtectedSlot ? 'is-available' : 'is-openfield'}`.trim()}
        aria-label={`parking-slot-${slotNo || item?.displayKey || item?.key || 'machine'}`}
        onClick={() => {
          openShopItemDetailModal(item, 'machine', {
            viewOnly: true,
            machineInstanceId: String(item?.machineInstanceId || ''),
            parkingSlotNo: slotNo
          });
        }}
        title={zoneLabel ? `${zoneLabel} 주차칸` : '주차 장비 상세정보'}
      >
        <span className="control-slot-empty__label">
          {String(item?.name || `P${slotNo}`)}
        </span>
        <span className="parking-slot-badge-wrap">
          {zoneLabel ? (
            <span className={`parking-slot-badge parking-slot-badge--left ${isProtectedSlot ? 'is-protected' : 'is-openfield'}`.trim()}>
              {zoneLabel}
            </span>
          ) : null}
          {slotNo > 0 ? (
            <span className="parking-slot-badge parking-slot-badge--right">
              {`P${slotNo}`}
            </span>
          ) : null}
        </span>
      </button>
      {actionButtons}
      {hasFuelGauge ? (
        hasSeparateSprayFuel ? (
          <>
            <div className="parking-slot-fuel">
              <div className="parking-slot-fuel__head">
                <div className="parking-slot-fuel__topline">
                  <span className="parking-slot-fuel__label">주행</span>
                  <strong className="parking-slot-fuel__percent">{`${fuelRatio.toFixed(0)}%`}</strong>
                </div>
                <span className="parking-slot-fuel__value">{`${String(item?.fuelTypeLabel || '연료')} ${Number(item?.fuelCurrent || 0).toFixed(1)}${fuelUnitLabel} / ${Number(item?.fuelCap || 0).toFixed(1)}${fuelUnitLabel}`}</span>
              </div>
              <div className={`parking-slot-fuel__bar ${String(item?.fuelToneClass || '')}`.trim()}>
                <span style={{ width: `${fuelRatio}%` }} />
              </div>
            </div>
            <div className="parking-slot-fuel">
              <div className="parking-slot-fuel__head">
                <div className="parking-slot-fuel__topline">
                  <span className="parking-slot-fuel__label">송풍</span>
                  <strong className="parking-slot-fuel__percent">{`${sprayFuelRatio.toFixed(0)}%`}</strong>
                </div>
                <span className="parking-slot-fuel__value">{`${String(item?.fuelTypeLabel || '연료')} ${Number(item?.sprayFuelCurrent || 0).toFixed(1)}L / ${Number(item?.sprayFuelCap || 0).toFixed(1)}L`}</span>
              </div>
              <div className={`parking-slot-fuel__bar ${String(item?.fuelToneClass || '')}`.trim()}>
                <span style={{ width: `${sprayFuelRatio}%` }} />
              </div>
            </div>
          </>
        ) : (
          <div className="parking-slot-fuel">
            <div className="parking-slot-fuel__head">
              <div className="parking-slot-fuel__topline">
                <span className="parking-slot-fuel__value">{`${String(item?.fuelTypeLabel || '연료')} ${Number(item?.fuelCurrent || 0).toFixed(1)}${fuelUnitLabel} / ${Number(item?.fuelCap || 0).toFixed(1)}${fuelUnitLabel}`}</span>
                <strong className="parking-slot-fuel__percent">{`${fuelRatio.toFixed(0)}%`}</strong>
              </div>
            </div>
            <div className={`parking-slot-fuel__bar ${String(item?.fuelToneClass || '')}`.trim()}>
              <span style={{ width: `${fuelRatio}%` }} />
            </div>
          </div>
        )
      ) : null}
      {hasLiquidGauge ? (
        <div className="parking-slot-fuel">
          <div className="parking-slot-fuel__head">
            <div className="parking-slot-fuel__topline">
              <span className="parking-slot-fuel__value">{`액체 ${Number(item?.liquidCurrent || 0).toFixed(1)}L / ${Number(item?.liquidCap || 0).toFixed(1)}L · ${String(item?.liquidStatus || '미배합')}`}</span>
              <strong className="parking-slot-fuel__percent">{`${liquidRatio.toFixed(0)}%`}</strong>
            </div>
          </div>
          <div className={`parking-slot-fuel__bar ${String(item?.liquidToneClass || '')}`.trim()}>
            <span style={{ width: `${liquidRatio}%` }} />
          </div>
        </div>
      ) : null}
      {hasPayload ? (
        <div className="parking-slot-fuel parking-slot-payload">
          <div className="parking-slot-fuel__head">
            <div className="parking-slot-fuel__topline">
              <span className="parking-slot-fuel__value">{`적재량 ${Number(item?.loadKg || 0).toFixed(1)}kg / ${Number(item?.payloadKg || 0).toFixed(1)}kg · ${String(item?.payloadStatus || '정상')}`}</span>
              <strong className="parking-slot-fuel__percent">{`${payloadRatio.toFixed(0)}%`}</strong>
            </div>
          </div>
          <div className={`parking-slot-fuel__bar ${String(item?.payloadToneClass || '')}`.trim()}>
            <span style={{ width: `${payloadBarRatio}%` }} />
          </div>
        </div>
      ) : null}
      {Number.isFinite(durability) ? (
        <div className={`parking-slot-durability ${durabilityToneClass(durability)}`}>
          {`내구도 ${durability.toFixed(1)}%`}
        </div>
      ) : null}
    </div>
  );
}

function WarehouseStorageCard({
  item,
  activeTab,
  activeHarvestTab,
  locationLabel,
  selectedCarrier,
  selectedTransportRow,
  selectedTransportCanMovePallet,
  selectedHarvestSourceRowKey,
  selectedHarvestSourceRow,
  generalFirstLoadAnimByRow,
  facilityMoveQtyByKey,
  setFacilityMoveQtyByKey,
  moveStorageItemToSelectedCarrier,
  openOtherWarehouseTransferPlaceholder,
  openHarvestGeneralMovePicker,
  requestDisposeWarehouseItem,
  openFuelKioskFromWarehouseMachineItem,
  openShopItemDetailModal,
  shouldIgnoreDetailCardOpen,
  toolImageSrcOf,
  disposalVerbForItem,
  isReflectiveFilmItemKey,
  formatCountWithUnit,
  formatLiterTextFixed2,
  shoulderBrushFuelSummaryOfItem,
  durabilityToneClass,
  clamp,
}) {
  const isParkedMachineRow = Boolean(item?.isParkedMachineRow);
  const warehouseImageSrc = String(item?.imageSrc || toolImageSrcOf(item.key) || '');
  const isFacilityRow = String(item?.category || '') === 'facility';
  const disposalVerb = disposalVerbForItem(item);
  const canDispose = item.qty > 0 || (
    (item.category === 'pesticide' || item.category === 'fertilizer' || item.category === 'pollen' || isReflectiveFilmItemKey(item.key))
    && item.openRemain > 0
  );
  const canDisposeThisRow = canDispose && !isFacilityRow && !isParkedMachineRow;
  const hasTransferQty = Math.max(0, Number(item?.qty) || 0) > 0;
  const isContainerItem = item.category === 'container';
  const isPalletItem = isContainerItem && /pallet|파렛트|팔레트/i.test(`${String(item?.key || '')} ${String(item?.name || '')}`);
  const showCardThumb = Boolean(warehouseImageSrc) && !isPalletItem;
  const canOpenWarehouseDetail = Boolean(item?.key);
  const isFuelContainerItem = isContainerItem
    && !/appleContainer/i.test(String(item.key || ''))
    && !isPalletItem
    && (
      Boolean(item?.sourceFuelKey)
      || Boolean(item?.isStoredFuelItem)
      || /fuel|jerry|can|diesel|gasoline|kerosene|말통|연료|경유|휘발유|등유/i.test(`${String(item?.key || '')} ${String(item?.name || '')}`)
    );
  const containerCapacityLiters = isFuelContainerItem
    ? Math.max(0, Number(item.capacityPerUnit) || parseCapacityLitersFromText(item.name) || 0)
    : 0;
  const containerCanSizeClass = isFuelContainerItem
    ? fuelJerrycanSizeClassByCapacity(containerCapacityLiters)
    : '';
  const containerFilledLiters = isFuelContainerItem
    ? Math.max(0, Math.min(containerCapacityLiters, Number(item.storedLitersPerCan ?? (item.isStoredFuelItem ? item.totalStoredFuelLiters : 0)) || 0))
    : 0;
  const containerFillRatio = containerCapacityLiters > 0
    ? Math.max(0, Math.min(1, containerFilledLiters / containerCapacityLiters))
    : 0;
  const containerFuelKey = String(item.sourceFuelKey || '');
  const containerFuelTone = /kerosene/i.test(containerFuelKey) ? 'kerosene' : (/gasoline/i.test(containerFuelKey) ? 'gasoline' : 'diesel');
  const crateVisualKey = String(item?.loadBoxKey || item?.key || '');
  const isAppleCrateItem = Boolean(item?.isHarvestStoredBox) || (isContainerItem && /appleContainer/i.test(crateVisualKey));
  const appleCrateTone = /green/i.test(crateVisualKey) ? 'green' : 'yellow';
  const qtyKey = item.displayKey || item.key;
  const transferMaxQty = Math.max(1, Math.floor(Number(item?.qty) || 1));
  const transferQty = Math.min(
    transferMaxQty,
    Math.max(1, Math.floor(Number(facilityMoveQtyByKey[qtyKey]) || 1)),
  );
  const shoulderBrushFuel = shoulderBrushFuelSummaryOfItem(item);
  const shoulderBrushFuelRatio = shoulderBrushFuel?.capacityTotal > 0
    ? clamp((Number(shoulderBrushFuel.currentTotal) || 0) / shoulderBrushFuel.capacityTotal, 0, 1)
    : 0;
  const shoulderBrushFuelToneClass = String(item?.fuelType || '').toLowerCase() === 'gasoline'
    ? 'is-gasoline'
    : (String(item?.fuelType || '').toLowerCase() === 'kerosene' ? 'is-kerosene' : 'is-diesel');
  const showGeneralHarvestMoveAction = item?.isHarvestStoredBox && activeTab === 'harvest' && activeHarvestTab === 'general';
  const canShowCarrierTransferAction = Boolean(selectedCarrier) && hasTransferQty && !isParkedMachineRow;
  const canShowOtherWarehouseTransferAction = Boolean(selectedTransportRow) && hasTransferQty && !isParkedMachineRow && !isFacilityRow;
  const canShowTransferQtyInput = canShowCarrierTransferAction || canShowOtherWarehouseTransferAction;
  const displayKey = String(item?.displayKey || item?.key || '');
  const selectedSourceRowDisplayKey = String(selectedHarvestSourceRow?.displayKey || selectedHarvestSourceRow?.key || '');
  const selectedSourceRowCropLabel = String(selectedHarvestSourceRow?.cropLabel || selectedHarvestSourceRow?.name || '');
  const selectedSourceRowBoxText = String(selectedHarvestSourceRow?.boxText || '');
  const selectedSourceRowTotalKg = Math.max(0, Number(selectedHarvestSourceRow?.totalKg) || 0);
  const isSelectedHarvestSourceByMeta = Boolean(
    showGeneralHarvestMoveAction
    && selectedHarvestSourceRow
    && String(item?.cropLabel || item?.name || '') === selectedSourceRowCropLabel
    && String(item?.boxText || '') === selectedSourceRowBoxText
    && Math.abs((Math.max(0, Number(item?.totalKg) || 0)) - selectedSourceRowTotalKg) < 0.001
  );
  const isSelectedHarvestSource = Boolean(
    showGeneralHarvestMoveAction
    && (
      (selectedHarvestSourceRowKey && displayKey === String(selectedHarvestSourceRowKey))
      || (selectedSourceRowDisplayKey && displayKey === selectedSourceRowDisplayKey)
      || isSelectedHarvestSourceByMeta
    )
  );
  const selectedCardStyle = isSelectedHarvestSource
    ? {
      background: 'linear-gradient(180deg, rgba(216, 234, 209, 0.94), rgba(245, 236, 218, 0.94))',
      borderColor: 'rgba(53, 126, 79, 0.48)',
      boxShadow: '0 18px 34px rgba(40, 84, 63, 0.16), 0 0 0 3px rgba(93, 166, 116, 0.14)',
      transform: 'translateY(-2px)',
    }
    : undefined;

  const openDetail = () => {
    openShopItemDetailModal(item, String(item?.category || ''), {
      viewOnly: true,
      allowNonEquipment: true,
      machineInstanceId: String(item?.machineInstanceId || ''),
      parkingSlotNo: Math.max(0, Number(item?.parkingSlotNo) || 0),
      quantity: Number(item?.qty) || 0,
      unit: String(item?.unit || ''),
      openRemain: Number(item?.openRemain) || 0,
      locationLabel,
    });
  };

  return (
    <div
      className={`option-card option-card--farm-main-animate ${showCardThumb ? 'shop-tool-card--has-image' : ''} ${item?.isHarvestStoredBox ? 'warehouse-storage-card--harvest-box' : ''} ${showGeneralHarvestMoveAction ? 'warehouse-storage-card--general-harvest-movable' : ''} ${isSelectedHarvestSource ? 'option-card--selected warehouse-storage-card--selected-source' : ''} ${isFacilityRow ? 'warehouse-storage-card--facility' : ''}`.trim()}
      role={canOpenWarehouseDetail ? 'button' : undefined}
      tabIndex={canOpenWarehouseDetail ? 0 : undefined}
      style={canOpenWarehouseDetail ? { cursor: 'pointer', ...(selectedCardStyle || {}) } : selectedCardStyle}
      title={canOpenWarehouseDetail ? '눌러서 상세정보 확인' : undefined}
      onClick={(event) => {
        const closestRoleButton = event.target instanceof Element
          ? event.target.closest('[role="button"]')
          : null;
        if (
          !canOpenWarehouseDetail
          || (
            shouldIgnoreDetailCardOpen(event.target)
            && closestRoleButton !== event.currentTarget
          )
        ) return;
        openDetail();
      }}
      onKeyDown={(event) => {
        if (!canOpenWarehouseDetail) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openDetail();
      }}
    >
      {showCardThumb ? (
        <div className="shop-tool-thumb" aria-hidden="true">
          <img src={warehouseImageSrc} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className="storage-card__head">
        <strong>{item?.isHarvestStoredBox ? String(item?.cropLabel || item?.name || '수확물') : item.name}</strong>
        <span className="warehouse-storage-card-qty">
          {item?.isHarvestStoredBox
            ? String(item?.boxText || formatCountWithUnit(item.qty, item.unit))
            : formatCountWithUnit(item.qty, item.unit)}
        </span>
      </div>
      {isSelectedHarvestSource ? (
        <div className="warehouse-storage-card__selected-badge">선택됨</div>
      ) : null}
      {(isContainerItem || Boolean(item?.isHarvestStoredBox)) ? (
        item?.isHarvestStoredBox ? (
          <div className="warehouse-storage-harvest-crate-preview" aria-hidden="true">
            <HarvestQualityStampedCrate
              tone={appleCrateTone}
              fillRatio={Math.max(0, Math.min(1, Number(item?.fillRatio) || 1))}
              life={item?.life}
              fillLabel={String(item?.fillLabel || '')}
              qualityLabel={String(item?.qualityLabel || '보통')}
              gradeLabel={normalizeHarvestGradeLabel(item?.gradeLabel, '미선별') || '미선별'}
              sizeLabel={String(item?.sizeLabel || '미측정')}
              stemStatusKey={String(item?.stemStatusKey || item?.stemStatus || '')}
              stemStatusLabel={String(item?.stemStatusLabel || item?.stemLabel || '')}
              stemRemoved={typeof item?.stemRemoved === 'boolean' ? item.stemRemoved : undefined}
            />
          </div>
        ) : isAppleCrateItem ? (
          <AppleCratePreview tone={appleCrateTone} />
        ) : isPalletItem ? (
          <div className="storage-can-preview">
            <img src={toolImageSrcOf(item.key)} alt="" loading="lazy" />
          </div>
        ) : isFuelContainerItem ? (
          <div className="storage-can-preview">
            <div className={`fuel-jerrycan fuel-jerrycan--${containerFuelTone} ${containerCanSizeClass}`.trim()}>
              <div className="fuel-jerrycan__spout" />
              <div className="fuel-jerrycan__handle" />
              <div className="fuel-jerrycan__cap" />
              <div className="fuel-jerrycan__body">
                {containerFillRatio > 0 ? (
                  <div
                    className="fuel-kiosk-fill-anim__liquid"
                    style={{
                      '--fuel-fill-ratio': `${containerFillRatio}`,
                      '--fuel-liquid-solid': (
                        containerFuelTone === 'kerosene'
                          ? '#7b4d28'
                          : (containerFuelTone === 'gasoline' ? '#f5c036' : '#2fbf86')
                      ),
                    }}
                  />
                ) : null}
                <div className="fuel-jerrycan__panel" />
                <div className="fuel-jerrycan__cross fuel-jerrycan__cross--a" />
                <div className="fuel-jerrycan__cross fuel-jerrycan__cross--b" />
              </div>
            </div>
            <div className="storage-can-preview__meta">{`${formatLiterTextFixed2(containerFilledLiters)}L/${formatLiterTextFixed2(containerCapacityLiters)}L`}</div>
          </div>
        ) : null
      ) : null}
      {String(item?.detailText || '') ? (
        <div className="storage-card__meta">{String(item.detailText)}</div>
      ) : null}
      {Number(item?.totalKg) > 0 ? (
        <div className="storage-card__meta">{`보관량 ${Number(item.totalKg).toLocaleString()}kg`}</div>
      ) : Number(item.weightKg) > 0 ? (
        <div className="storage-card__meta">{`무게 ${Number(item.weightKg).toLocaleString()}kg`}</div>
      ) : null}
      {item.durable && Number.isFinite(Number(item.durability)) ? (
        <>
          <div className={`storage-card__meta ${durabilityToneClass(item.durability)}`}>{`내구도 ${Number(item.durability).toFixed(1)}%`}</div>
          <div className={`storage-card__durability-gauge ${durabilityToneClass(item.durability)}`}>
            <span style={{ width: `${clamp(Number(item.durability) || 0, 0, 100).toFixed(1)}%` }} />
          </div>
        </>
      ) : null}
      {shoulderBrushFuel ? (
        <button
          type="button"
          className={`storage-card__fuel-button ${shoulderBrushFuelToneClass}`.trim()}
          onClick={() => openFuelKioskFromWarehouseMachineItem(item)}
          title="주유 열기"
        >
          <div className="storage-card__fuel-button-head">
            <strong>연료</strong>
            <span>{`${Number(shoulderBrushFuel.currentTotal).toFixed(2)}L / ${Number(shoulderBrushFuel.capacityTotal).toFixed(2)}L${Number(shoulderBrushFuel.units) > 1 ? ' (합산)' : ''}`}</span>
          </div>
          <div className={`storage-card__fuel ${shoulderBrushFuelToneClass}`.trim()}>
            <span style={{ width: `${(shoulderBrushFuelRatio * 100).toFixed(1)}%` }} />
          </div>
        </button>
      ) : null}
      <div className="footer-actions warehouse-storage-card-actions">
        {showGeneralHarvestMoveAction ? (
          <button
            type="button"
            className="button button--ghost button--compact facility-workbench-install-button"
            disabled={!selectedTransportRow || selectedTransportCanMovePallet}
            title={
              !selectedTransportRow
                ? '운반기구를 먼저 선택해 주세요.'
                : (selectedTransportCanMovePallet ? '일반저장은 지게차나 팔레트 잭으로 바로 옮길 수 없습니다.' : '')
            }
            onClick={() => openHarvestGeneralMovePicker(item)}
          >
            이동
          </button>
        ) : null}
        {isFacilityRow ? null : (
          <button
            className="button button--ghost button--compact facility-workbench-install-button"
            disabled={!canDisposeThisRow}
            title={!canDisposeThisRow ? '폐기할 수량이 없습니다.' : ''}
            onClick={() => requestDisposeWarehouseItem(item)}
          >
            {disposalVerb}
          </button>
        )}
        {canShowTransferQtyInput ? (
          <>
            <input
              className="text-input shop-buy-qty-input"
              style={{ width: 64, height: 34, padding: '0 8px', textAlign: 'center' }}
              type="number"
              min={1}
              max={transferMaxQty}
              value={transferQty}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onDoubleClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              onChange={(event) => {
                const raw = Math.floor(Number(event.target.value) || 1);
                const next = Math.max(1, Math.min(transferMaxQty, raw));
                setFacilityMoveQtyByKey((prev) => ({ ...(prev || {}), [qtyKey]: next }));
              }}
            />
            {canShowCarrierTransferAction ? (
            <button
              type="button"
              className="button button--ghost button--compact"
              disabled={!selectedTransportRow}
              title={!selectedTransportRow ? '운반기구를 먼저 선택해 주세요.' : ''}
              onClick={() => moveStorageItemToSelectedCarrier(item, transferQty)}
            >
              옮기기
            </button>
            ) : null}
            {canShowOtherWarehouseTransferAction ? (
            <button
              type="button"
              className="button button--ghost button--compact"
              onClick={() => openOtherWarehouseTransferPlaceholder?.(item, transferQty)}
            >
              다른 창고로 옮기기
            </button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function WarehouseStorageCardGrid({
  items,
  activeTab,
  activeHarvestTab,
  locationLabel,
  isFacilityList,
  generalGridMaxHeightPx,
  gridRef,
  selectedCarrier,
  selectedTransportRow,
  selectedTransportCanMovePallet,
  selectedHarvestSourceRowKey,
  selectedHarvestSourceRow,
  generalFirstLoadAnimByRow,
  facilityMoveQtyByKey,
  setFacilityMoveQtyByKey,
  openFacilityStorageMachineLoadEntryForCarrier,
  openFacilityStorageCarrierPanelForMachine,
  moveStorageItemToSelectedCarrier,
  openOtherWarehouseTransferPlaceholder,
  openHarvestGeneralMovePicker,
  requestDisposeWarehouseItem,
  openFuelKioskFromWarehouseMachineItem,
  openShopItemDetailModal,
  shouldIgnoreDetailCardOpen,
  toolImageSrcOf,
  disposalVerbForItem,
  isReflectiveFilmItemKey,
  formatCountWithUnit,
  formatLiterTextFixed2,
  shoulderBrushFuelSummaryOfItem,
  durabilityToneClass,
  clamp,
}) {
  return (
    <div
      ref={activeHarvestTab === 'general' ? gridRef : null}
      className={`option-grid warehouse-storage-modal-card-grid ${isFacilityList ? 'warehouse-storage-modal-card-grid--facility-list' : ''} ${activeHarvestTab === 'general' ? 'warehouse-storage-modal-card-grid--general' : ''} ${generalGridMaxHeightPx > 0 ? 'warehouse-storage-modal-card-grid--general-scrollable' : ''}`.trim()}
      style={generalGridMaxHeightPx > 0 ? { maxHeight: `${generalGridMaxHeightPx}px` } : undefined}
    >
      {items.map((item) => (
        item?.isParkedMachineRow ? (
          <ParkedMachineParkingCard
            key={item.displayKey || item.key}
            item={item}
            openShopItemDetailModal={openShopItemDetailModal}
            openFacilityStorageMachineLoadEntryForCarrier={openFacilityStorageMachineLoadEntryForCarrier}
            openFacilityStorageCarrierPanelForMachine={openFacilityStorageCarrierPanelForMachine}
            durabilityToneClass={durabilityToneClass}
            clamp={clamp}
          />
        ) : (
          <WarehouseStorageCard
            key={item.displayKey || item.key}
            item={item}
            activeTab={activeTab}
            activeHarvestTab={activeHarvestTab}
            locationLabel={locationLabel}
            selectedCarrier={selectedCarrier}
            selectedTransportRow={selectedTransportRow}
            selectedTransportCanMovePallet={selectedTransportCanMovePallet}
            selectedHarvestSourceRowKey={selectedHarvestSourceRowKey}
            selectedHarvestSourceRow={selectedHarvestSourceRow}
            generalFirstLoadAnimByRow={generalFirstLoadAnimByRow}
            facilityMoveQtyByKey={facilityMoveQtyByKey}
            setFacilityMoveQtyByKey={setFacilityMoveQtyByKey}
            moveStorageItemToSelectedCarrier={moveStorageItemToSelectedCarrier}
            openOtherWarehouseTransferPlaceholder={openOtherWarehouseTransferPlaceholder}
            openHarvestGeneralMovePicker={openHarvestGeneralMovePicker}
            requestDisposeWarehouseItem={requestDisposeWarehouseItem}
            openFuelKioskFromWarehouseMachineItem={openFuelKioskFromWarehouseMachineItem}
            openShopItemDetailModal={openShopItemDetailModal}
            shouldIgnoreDetailCardOpen={shouldIgnoreDetailCardOpen}
            toolImageSrcOf={toolImageSrcOf}
            disposalVerbForItem={disposalVerbForItem}
            isReflectiveFilmItemKey={isReflectiveFilmItemKey}
            formatCountWithUnit={formatCountWithUnit}
            formatLiterTextFixed2={formatLiterTextFixed2}
            shoulderBrushFuelSummaryOfItem={shoulderBrushFuelSummaryOfItem}
            durabilityToneClass={durabilityToneClass}
            clamp={clamp}
          />
        )
      ))}
    </div>
  );
}
