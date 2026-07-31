import React from 'react';
import { MapDualShopModal, MapEntryModal } from './MapLocationPanels';

function durabilityToneClass(value) {
  const durability = Number(value) || 0;
  if (durability >= 70) return 'durability--green';
  if (durability >= 45) return 'durability--yellow';
  if (durability >= 20) return 'durability--orange';
  return 'durability--red';
}

export function MachineRentalPanel({
  className = 'confirm-modal confirm-modal--labor-office',
  title,
  rentalOfferCountText,
  activeRentCount,
  currentDay,
  rentalDays,
  minDays,
  maxDays,
  machineRentDaysDraft,
  onChangeDaysDraft,
  machineRentalOffersView,
  activeMachineRents,
  itemMap,
  inventory,
  money,
  clamp,
  won,
  toolImageSrcOf,
  longDate,
  parseMachineParkingInstanceId,
  canOpenItemDetailModal,
  shouldIgnoreDetailCardOpen,
  openShopItemDetailModal,
  onStartCheckout,
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="panel__header">
        <div><div className="panel__eyebrow">{title}</div><h2>농기계 대여사업장</h2></div>
        <div className="inline-summary">
          <div className="summary-chip"><span>대여 가능 장비</span><strong>{rentalOfferCountText}</strong></div>
          <div className="summary-chip"><span>대여중</span><strong>{activeRentCount}건</strong></div>
        </div>
      </div>
      <div className="meter__hint" style={{ marginBottom: 10 }}>
        매월 1일 대여 매물이 랜덤으로 갱신됩니다. 대여 등록 후 결제를 완료하면 직접운반/운반요청을 선택할 수 있습니다.
      </div>
      <div className="inline-summary" style={{ marginBottom: 10 }}>
        <div className="summary-chip"><span>대여 기간</span><strong>{`${rentalDays}일`}</strong></div>
        <div style={{ width: 180 }}>
          <input
            className="text-input"
            type="number"
            min={minDays}
            max={maxDays}
            value={machineRentDaysDraft}
            onChange={(e) => onChangeDaysDraft(String(e.target.value || ''))}
          />
        </div>
      </div>
      {machineRentalOffersView.length ? (
        <div className="option-grid">
          {machineRentalOffersView.map((entry) => {
            const item = entry.item;
            const itemCategory = String(item?.category || (item?.type === 'transport' ? 'transport' : item?.type === 'passenger' ? 'passenger' : 'machine'));
            const shouldPreferMountedSprayerImage = String(item?.type || '') === 'spray';
            const toolImageSrc = toolImageSrcOf?.(String(item?.key || ''), { preferMountedSprayer: shouldPreferMountedSprayerImage }) || '';
            const days = clamp(Math.floor(Number(machineRentDaysDraft) || 1), minDays, maxDays);
            const totalFee = Math.max(0, Math.floor(Number(entry.dailyFee || 0) * days));
            const durability = Math.max(0, Math.min(100, Number(entry?.durability) || 0));
            const durabilityClass = durabilityToneClass(durability);
            const currentQty = Math.max(0, Number(inventory?.[item.key]) || 0);
            const reachMaxQty = Boolean(item?.maxQty && currentQty >= item.maxQty);
            const noMoney = (Number(money) || 0) < totalFee;
            const canOpenDetailModal = canOpenItemDetailModal?.(item, itemCategory, { allowNonEquipment: true });
            return (
              <div
                key={`rental-item-${item.key}`}
                className={`option-card ${toolImageSrc ? 'shop-tool-card--has-image' : ''}`.trim()}
                role={canOpenDetailModal ? 'button' : undefined}
                tabIndex={canOpenDetailModal ? 0 : undefined}
                style={canOpenDetailModal ? { cursor: 'pointer' } : undefined}
                onClick={(event) => {
                  if (!canOpenDetailModal || shouldIgnoreDetailCardOpen?.(event.target)) return;
                  openShopItemDetailModal?.(item, itemCategory, { allowNonEquipment: true });
                }}
                onKeyDown={(event) => {
                  if (!canOpenDetailModal) return;
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  openShopItemDetailModal?.(item, itemCategory, { allowNonEquipment: true });
                }}
              >
                {toolImageSrc ? (
                  <div className="shop-tool-thumb" aria-hidden="true">
                    <img src={toolImageSrc} alt="" loading="lazy" />
                  </div>
                ) : null}
                <div className="option-card__row"><strong>{item.name}</strong><span>{`일 ${won(entry.dailyFee)}`}</span></div>
                <div className="option-card__meta">{`${days}일 대여료 ${won(totalFee)}`}</div>
                <div className="option-card__meta">{`내구도 ${durability.toFixed(1)}%`}</div>
                <div className={`storage-card__durability-gauge ${durabilityClass}`}>
                  <span style={{ width: `${durability.toFixed(1)}%` }} />
                </div>
                <div className="footer-actions" style={{ marginTop: 10 }}>
                  <button
                    className="button button--ghost day-transition-animate-button"
                    onClick={() => onStartCheckout(item.key)}
                    disabled={reachMaxQty || noMoney}
                    title={reachMaxQty ? '최대 보유 수량에 도달했습니다.' : (noMoney ? '보유 자금이 부족합니다.' : '')}
                  >
                    대여 등록
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-box">대여 가능한 장비가 없습니다.</div>
      )}
      <div className="panel__header" style={{ marginTop: 14 }}>
        <div><h2>대여 목록</h2></div>
      </div>
      {activeMachineRents.length ? (
        <div className="storage-list">
          {activeMachineRents
            .slice()
            .sort((a, b) => Number(a.endDay) - Number(b.endDay))
            .map((rent) => {
              const item = itemMap[String(rent?.itemKey || '')];
              const parsedInstance = parseMachineParkingInstanceId(rent?.instanceId || '');
              const unitLabel = parsedInstance ? ` #${parsedInstance.unitNo}` : '';
              const remainDays = Math.max(0, (Number(rent?.endDay) || 0) - Number(currentDay || 1) + 1);
              const overdue = Number(rent?.endDay || 0) < Number(currentDay || 1);
              return (
                <div key={`active-machine-rent-${rent.id}`} className="storage-card">
                  <div className="storage-card__head">
                    <strong>{`${item?.name || rent.itemKey}${unitLabel}`}</strong>
                    <span>{overdue ? '반납 필요' : '대여중'}</span>
                  </div>
                  <div className="storage-card__meta">{`기간 ${longDate(rent.startDay)} ~ ${longDate(rent.endDay)} · ${overdue ? '만료' : `남은 ${remainDays}일`}`}</div>
                  <div className="storage-card__meta">{`총 대여료 ${won(rent.totalFee)}`}</div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="empty-box">현재 대여중인 장비가 없습니다.</div>
      )}
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function MachineRentalReturnPanel({
  className = 'confirm-modal confirm-modal--labor-office',
  title,
  activeMachineRents,
  currentDay,
  deliveryFeeText,
  itemMap,
  longDate,
  parseMachineParkingInstanceId,
  onDirectReturn,
  onRequestDelivery,
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="panel__header">
        <div><div className="panel__eyebrow">{title}</div><h2>반납소</h2></div>
        <div className="inline-summary">
          <div className="summary-chip"><span>반납 대상</span><strong>{activeMachineRents.length}건</strong></div>
          <div className="summary-chip"><span>운반요청비</span><strong>{deliveryFeeText}</strong></div>
        </div>
      </div>
      <div className="meter__hint" style={{ marginBottom: 10 }}>
        반납일에는 직접 반납하거나, 반납 운반요청(7만원)으로 처리할 수 있습니다.
      </div>
      {activeMachineRents.length ? (
        <div className="storage-list">
          {activeMachineRents
            .slice()
            .sort((a, b) => Number(a.endDay) - Number(b.endDay))
            .map((rent) => {
              const item = itemMap[String(rent?.itemKey || '')];
              const parsedInstance = parseMachineParkingInstanceId(rent?.instanceId || '');
              const unitLabel = parsedInstance ? ` #${parsedInstance.unitNo}` : '';
              const overdue = Number(rent?.endDay || 0) < Number(currentDay || 1);
              return (
                <div key={`return-machine-rent-${rent.id}`} className="storage-card">
                  <div className="storage-card__head">
                    <strong>{`${item?.name || rent.itemKey}${unitLabel}`}</strong>
                    <span>{overdue ? '만료' : '대여중'}</span>
                  </div>
                  <div className="storage-card__meta">{`대여기간 ${longDate(rent.startDay)} ~ ${longDate(rent.endDay)}`}</div>
                  <div className="footer-actions" style={{ marginTop: 10 }}>
                    <button className="button button--ghost day-transition-animate-button" onClick={() => onDirectReturn(rent.id)}>직접 반납</button>
                    <button className="button button--ghost day-transition-animate-button" onClick={() => onRequestDelivery(rent.id)}>반납 운반요청</button>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="empty-box">현재 반납할 대여 장비가 없습니다.</div>
      )}
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function UsedMachineOffersPanel({
  className = 'confirm-modal confirm-modal--labor-office',
  title,
  usedMachineOffersView,
  money,
  inventory,
  won,
  toolImageSrcOf,
  canOpenItemDetailModal,
  shouldIgnoreDetailCardOpen,
  openShopItemDetailModal,
  onBuyOffer,
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="panel__header">
        <div><div className="panel__eyebrow">{title}</div><h2>중고 농기계구매</h2></div>
        <div className="inline-summary">
          <div className="summary-chip"><span>오늘 매물</span><strong>{usedMachineOffersView.length}개</strong></div>
          <div className="summary-chip"><span>보유 자금</span><strong>{won(money)}</strong></div>
        </div>
      </div>
      <div className="meter__hint" style={{ marginBottom: 10 }}>
        매물은 30일(한 달)마다 바뀝니다. 구매 즉시 내 장비로 등록됩니다.
      </div>
      {usedMachineOffersView.length ? (
        <div className="option-grid">
          {usedMachineOffersView.map((offer) => {
            const item = offer.item;
            const itemCategory = String(item?.category || (item?.type === 'transport' ? 'transport' : item?.type === 'passenger' ? 'passenger' : 'machine'));
            const shouldPreferMountedSprayerImage = String(item?.type || '') === 'spray';
            const toolImageSrc = toolImageSrcOf?.(String(item?.key || ''), { preferMountedSprayer: shouldPreferMountedSprayerImage }) || '';
            const durability = Math.max(0, Math.min(100, Number(offer.durability) || 0));
            const durabilityClass = durabilityToneClass(durability);
            const currentQty = Math.max(0, Number(inventory?.[item.key]) || 0);
            const reachMaxQty = Boolean(item?.maxQty && currentQty >= item.maxQty);
            const noMoney = (Number(money) || 0) < Number(offer.price || 0);
            const disabled = reachMaxQty || noMoney;
            const canOpenDetailModal = canOpenItemDetailModal?.(item, itemCategory, { allowNonEquipment: true });
            return (
              <div
                key={`used-offer-${offer.id}`}
                className={`option-card ${toolImageSrc ? 'shop-tool-card--has-image' : ''}`.trim()}
                role={canOpenDetailModal ? 'button' : undefined}
                tabIndex={canOpenDetailModal ? 0 : undefined}
                style={canOpenDetailModal ? { cursor: 'pointer' } : undefined}
                onClick={(event) => {
                  if (!canOpenDetailModal || shouldIgnoreDetailCardOpen?.(event.target)) return;
                  openShopItemDetailModal?.(item, itemCategory, { viewOnly: true, allowNonEquipment: true });
                }}
                onKeyDown={(event) => {
                  if (!canOpenDetailModal) return;
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  openShopItemDetailModal?.(item, itemCategory, { viewOnly: true, allowNonEquipment: true });
                }}
              >
                {toolImageSrc ? (
                  <div className="shop-tool-thumb" aria-hidden="true">
                    <img src={toolImageSrc} alt="" loading="lazy" />
                  </div>
                ) : null}
                <div className="option-card__row"><strong>{item.name}</strong><span>{offer.typeLabel}</span></div>
                <div className="option-card__meta">{`신품 ${won(offer.basePrice)} · 중고 ${won(offer.price)} (${offer.discountPct}% 할인)`}</div>
                {offer.purchaseOptionLabel ? (
                  <div className="option-card__meta">{`옵션 ${offer.purchaseOptionLabel}`}</div>
                ) : null}
                <div className="option-card__meta">{`내구도 ${Number(offer.durability || 0).toFixed(1)}%`}</div>
                <div className={`storage-card__durability-gauge ${durabilityClass}`}>
                  <span style={{ width: `${durability.toFixed(1)}%` }} />
                </div>
                {offer.jackpot ? <div className="meter__hint">개꿀 특가 매물</div> : null}
                <div className="footer-actions" style={{ marginTop: 10 }}>
                  <button
                    className="button button--ghost day-transition-animate-button"
                    onClick={() => onBuyOffer(offer.id)}
                    disabled={disabled}
                    title={reachMaxQty ? '최대 보유 수량에 도달했습니다.' : (noMoney ? '보유 자금이 부족합니다.' : '')}
                  >
                    구매
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-box">오늘 등록된 중고 매물이 없습니다.</div>
      )}
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function UsedCarDealerPanel({
  className = 'confirm-modal confirm-modal--labor-office',
  title,
  usedCarOffersView,
  money,
  inventory,
  won,
  toolImageSrcOf,
  onBuyOffer,
  onBack,
  onClose
}) {
  return (
    <div className={className}>
      <div className="panel__header">
        <div><div className="panel__eyebrow">{title}</div><h2>중고차 매물</h2></div>
        <div className="inline-summary">
          <div className="summary-chip"><span>오늘 매물</span><strong>{usedCarOffersView.length}대</strong></div>
          <div className="summary-chip"><span>보유 자금</span><strong>{won(money)}</strong></div>
        </div>
      </div>
      <div className="meter__hint" style={{ marginBottom: 10 }}>
        매물은 7일마다 일부 교체됩니다. 구매 즉시 내 차량으로 등록되며, 상태 점수와 사용감이 반영됩니다.
      </div>
      {usedCarOffersView.length ? (
        <div className="option-grid">
          {usedCarOffersView.map((offer) => {
            const item = offer.item;
            const itemCategory = String(item?.type || '') === 'passenger' ? 'passenger' : 'transport';
            const toolImageSrc = toolImageSrcOf?.(String(item?.key || '')) || '';
            const durability = Math.max(0, Math.min(100, Number(offer.durability) || 0));
            const durabilityClass = durabilityToneClass(durability);
            const currentQty = Math.max(0, Number(inventory?.[item.key]) || 0);
            const reachMaxQty = Boolean(item?.maxQty && currentQty >= item.maxQty);
            const noMoney = (Number(money) || 0) < Number(offer.price || 0);
            const disabled = reachMaxQty || noMoney;
            return (
              <div
                key={`used-car-offer-${offer.id}`}
                className={`option-card ${toolImageSrc ? 'shop-tool-card--has-image' : ''}`.trim()}
              >
                {toolImageSrc ? (
                  <div className="shop-tool-thumb" aria-hidden="true">
                    <img src={toolImageSrc} alt="" loading="lazy" />
                  </div>
                ) : null}
                <div className="option-card__row"><strong>{offer.displayName}</strong><span>{offer.typeLabel}</span></div>
                <div className="option-card__meta">{`${offer.year}년식 · ${offer.mileageText} · ${offer.ownerText}`}</div>
                <div className="option-card__meta">{`${offer.accidentLabel} · 상태 ${offer.gradeLabel} (${offer.overallScore}점)`}</div>
                <div className="option-card__meta">{`엔진 ${offer.engineScore} / 미션 ${offer.missionScore} / 외관 ${offer.bodyScore}`}</div>
                <div className="option-card__meta">{itemCategory === 'transport' ? `적재함 ${offer.cargoBedScore} / 하부 ${offer.frameRustScore}` : `실내 ${offer.interiorScore} / 타이어 ${offer.tireScore}`}</div>
                {offer.dealerMemo ? <div className="meter__hint">{offer.dealerMemo}</div> : null}
                <div className="option-card__meta">{`신차 ${won(offer.basePrice)} · 중고 ${won(offer.price)} (${offer.discountPct}% 감가)`}</div>
                <div className="option-card__meta">{`초기 내구도 ${durability.toFixed(1)}%`}</div>
                <div className={`storage-card__durability-gauge ${durabilityClass}`}>
                  <span style={{ width: `${durability.toFixed(1)}%` }} />
                </div>
                <div className="footer-actions" style={{ marginTop: 10 }}>
                  <button
                    className="button button--ghost day-transition-animate-button"
                    onClick={() => onBuyOffer(offer.id)}
                    disabled={disabled}
                    title={reachMaxQty ? '최대 보유 수량에 도달했습니다.' : (noMoney ? '보유 자금이 부족합니다.' : '')}
                  >
                    구매
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-box">오늘 등록된 중고차 매물이 없습니다.</div>
      )}
      <div className="footer-actions" style={{ marginTop: 14 }}>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onBack}>뒤로</button>
        <button className="button button--ghost warehouse-storage-footer-button" onClick={onClose}>나가기</button>
      </div>
    </div>
  );
}

export function MachineRentOverlay({
  open,
  view,
  title,
  closing = false,
  menuActions = [],
  pickupPanel = null,
  rentalPanel = null,
  rentalReturnPanel = null,
  usedPanel = null,
  shouldBlockShop = false,
  shopModalProps = null,
  onBack,
  onClose
}) {
  if (!open) return null;
  return (
    <>
      <div className={`confirm-modal-backdrop ${closing ? 'is-closing' : ''}`.trim()} onClick={onClose} />
      {view === 'menu' ? (
        <MapEntryModal
          className={`confirm-modal confirm-modal--map-shop-entry ${closing ? 'is-closing' : ''}`.trim()}
          title={title}
          actions={menuActions}
          onBack={onBack}
          onClose={onClose}
        />
      ) : view === 'pickup' ? (
        pickupPanel
      ) : view === 'rental' ? (
        rentalPanel
      ) : view === 'rentalReturn' ? (
        rentalReturnPanel
      ) : view === 'used' ? (
        usedPanel
      ) : shouldBlockShop ? (
        <MapEntryModal
          className={`confirm-modal confirm-modal--map-shop-entry ${closing ? 'is-closing' : ''}`.trim()}
          title={title}
          description="마을에서는 상점 기능을 사용할 수 없습니다."
          actions={[]}
          onBack={onBack}
          onClose={onClose}
        />
      ) : (
        <MapDualShopModal {...shopModalProps} />
      )}
    </>
  );
}
