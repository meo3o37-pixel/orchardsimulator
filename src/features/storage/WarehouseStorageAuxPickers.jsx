import React from 'react';
import { storageSlotLabelOf } from './storageSlotModel';

const HarvestLoadSourcePickerModal = ({
  title,
  hint,
  items,
  onClose,
  onChoose
}) => {
  const warehouseItems = React.useMemo(
    () => (items || []).filter((item) => String(item?.sourceType || '') === 'warehouse'),
    [items]
  );
  const carrierItems = React.useMemo(
    () => (items || []).filter((item) => String(item?.sourceType || '') === 'carrier'),
    [items]
  );
  const availableTabs = React.useMemo(() => {
    const next = [];
    if (warehouseItems.length > 0) next.push({ key: 'warehouse', label: '창고' });
    if (carrierItems.length > 0) next.push({ key: 'carrier', label: '차량' });
    return next;
  }, [carrierItems.length, warehouseItems.length]);
  const [activeTab, setActiveTab] = React.useState(() => availableTabs[0]?.key || 'warehouse');

  React.useEffect(() => {
    if (!availableTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(availableTabs[0]?.key || 'warehouse');
    }
  }, [activeTab, availableTabs]);

  const visibleItems = activeTab === 'carrier' ? carrierItems : warehouseItems;

  return (
    <>
      <div className="slot-picker-backdrop" onClick={onClose} />
      <div className="slot-picker slot-picker--modal">
        <div className="slot-picker__title">{title}</div>
        {hint ? <div className="slot-picker__hint">{hint}</div> : null}
        {availableTabs.length > 1 ? (
          <div className="focus-tabs slot-picker__target-tabs" style={{ marginTop: 12 }}>
            {availableTabs.map((tab) => {
              const selected = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`focus-tab focus-tab--farm-main-animate ${selected ? 'focus-tab--active' : ''}`.trim()}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : null}
        <div className="slot-picker__tabs" style={{ marginTop: availableTabs.length > 1 ? 12 : undefined }}>
          {visibleItems.map((item) => (
            <div
              key={item.slot}
              className="focus-tab focus-tab--farm-main-animate slot-button-card"
              role="button"
              tabIndex={0}
              onClick={(event) => onChoose(item.slot, event)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onChoose(item.slot, event);
                }
              }}
            >
              <div className="slot-button-card__main">
                {item.imageSrc ? (
                  <div className="slot-button-card__thumb" aria-hidden="true">
                    <img src={item.imageSrc} alt="" />
                  </div>
                ) : null}
                <div className="slot-button-content">
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="footer-actions"><button className="button button--ghost" onClick={onClose}>취소</button></div>
      </div>
    </>
  );
};

export default function WarehouseStorageAuxPickers({
  SlotPickerComponent,
  entryModalOpen,
  entrySelectorNode,
  onCloseEntryModal,
  harvestLoadPicker,
  harvestLoadSourceRows,
  onCloseHarvestLoadPicker,
  onChooseHarvestLoadSource,
  sortingPalletLoadPicker,
  onCloseSortingPalletLoadPicker,
  onChooseSortingPalletLoadSource,
  carrierPalletLoadPicker,
  onCloseCarrierPalletLoadPicker,
  onChooseCarrierPalletLoadSource
}) {
  const Picker = SlotPickerComponent;

  return (
    <>
      {entryModalOpen ? (
        <>
          <div className="confirm-modal-backdrop" onClick={onCloseEntryModal} />
          <div className="confirm-modal field-move-modal facility-storage-entry-modal">
            {entrySelectorNode}
          </div>
        </>
      ) : null}

      {harvestLoadPicker ? (
        <HarvestLoadSourcePickerModal
          title={String(harvestLoadPicker?.slotLabel || '').trim()
            ? `${String(harvestLoadPicker.slotLabel)}에 어떤 팔레트를 적재할까요?`
            : `${storageSlotLabelOf('harvest', harvestLoadPicker?.slotNo || 1, { oneBased: true })}에 어떤 팔레트를 적재할까요?`}
          hint="선택할 파레트를 골라주세요. (토지 창고 보관분 또는 주차 차량 적재함)"
          items={harvestLoadSourceRows}
          onClose={onCloseHarvestLoadPicker}
          onChoose={onChooseHarvestLoadSource}
        />
      ) : null}

      {sortingPalletLoadPicker ? (
        <HarvestLoadSourcePickerModal
          title={`${String(sortingPalletLoadPicker?.positionTitle || '저장공간')}에 어떤 팔레트를 적재할까요?`}
          hint="선택할 파레트를 골라주세요. (토지 창고 보관분 또는 주차 차량 적재함)"
          items={harvestLoadSourceRows}
          onClose={onCloseSortingPalletLoadPicker}
          onChoose={onChooseSortingPalletLoadSource}
        />
      ) : null}

      {carrierPalletLoadPicker ? (
        <HarvestLoadSourcePickerModal
          title={`차량 P${Math.max(1, Math.floor(Number(carrierPalletLoadPicker?.slotNo) || 1))}에 어떤 빈 파레트를 적재할까요?`}
          hint="빈 파레트를 골라주세요. (토지 창고 보관분 또는 주차 차량 적재함)"
          items={harvestLoadSourceRows}
          onClose={onCloseCarrierPalletLoadPicker}
          onChoose={onChooseCarrierPalletLoadSource}
        />
      ) : null}
    </>
  );
}
