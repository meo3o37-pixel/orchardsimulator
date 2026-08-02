import React from 'react';

const normalizeCountUnitLabel = (unit, fallback = '개') => {
  const raw = String(unit || fallback).trim();
  const normalized = raw.replace(/^1(?=[가-힣])/u, '');
  return normalized || fallback;
};

const formatCountWithUnit = (qty, unit, fallback = '개') => `${qty}${normalizeCountUnitLabel(unit, fallback)}`;

export default function MapShopItemCard({
  item,
  itemCategory,
  keyPrefix = 'map-item',
  game,
  isDealerMachineShopSession,
  multiBuyCategories,
  shopBuyQtyByKey,
  clamp,
  estimateShopPayment,
  shopBuyFlashByKey,
  toolImageSrcOf,
  containerCapacityLitersOfItem,
  fuelJerrycanSizeClassByCapacity,
  machineFuelTypeLabelOf,
  machineDriveEfficiencyTextOfItem,
  canOpenItemDetailModal,
  shouldIgnoreDetailCardOpen,
  openShopItemDetailModal,
  won,
  seedlingExpireSummaryOf,
  triggerShopBuyFlash,
  vehiclePurchaseOptionsOf,
  openTransportPurchaseModal,
  openDealerPurchaseContractModal,
  playShopBarcodeSound,
  addItemToShopCart
}) {
  const ownedQty = Math.max(0, Number(game?.inventory?.[item.key]) || 0);
  const soldOut = Boolean(item.maxQty && ownedQty >= item.maxQty);
  const maxQtyByCap = item.maxQty ? Math.max(0, item.maxQty - ownedQty) : 9999;
  const maxSelectableQty = Math.max(1, Math.min(9999, maxQtyByCap || 1));
  const isDealerMachineItem = isDealerMachineShopSession
    && ['machine', 'transport', 'passenger'].includes(String(itemCategory || ''));
  const multiBuyEnabled = !isDealerMachineItem && multiBuyCategories.includes(itemCategory);
  const [localDraftQty, setLocalDraftQty] = React.useState(() => Math.max(
    1,
    Math.floor(Number(shopBuyQtyByKey?.[item.key]) || 1)
  ));
  React.useEffect(() => {
    setLocalDraftQty((prev) => clamp(Math.floor(Number(prev) || 1), 1, maxSelectableQty));
  }, [item?.key, maxSelectableQty, clamp]);
  const rawDraftQty = Math.floor(Number(localDraftQty) || 1);
  const buyQty = multiBuyEnabled ? clamp(rawDraftQty, 1, maxSelectableQty) : 1;
  const estimate = game
    ? estimateShopPayment(game, item, itemCategory, buyQty)
    : {
        unitPrice: Math.max(0, Number(item?.price) || 0),
        totalPrice: Math.max(0, Number(item?.price) || 0) * buyQty
      };
  const isBuyFlashing = Boolean(shopBuyFlashByKey[item.key]);
  const isPalletVisualItem = String(itemCategory || '') === 'container'
    && /pallet|팔레트|파렛트/i.test(`${String(item?.key || '')} ${String(item?.name || '')}`);
  const isImageHiddenItem = ['fertilizerNk', 'fertilizerOrganic'].includes(String(item.key || ''));
  const shouldPreferMountedSprayerImage = String(itemCategory || '') === 'machine' && String(item?.type || '') === 'spray';
  const toolImageSrc = (['tool', 'machine', 'transport', 'passenger', 'consumableMaterial', 'fertilizer', 'pesticide', 'pollen', 'seedling', 'foodMart', 'appliance', 'furniture'].includes(String(itemCategory || '')) || isPalletVisualItem)
    && !isImageHiddenItem
    ? toolImageSrcOf(item.key, { preferMountedSprayer: shouldPreferMountedSprayerImage })
    : '';
  const itemCapacityLiters = itemCategory === 'container'
    ? Math.max(0, containerCapacityLitersOfItem(item))
    : 0;
  const itemCanSizeClass = itemCategory === 'container'
    ? fuelJerrycanSizeClassByCapacity(itemCapacityLiters)
    : '';
  const isShopAppleCrateItem = itemCategory === 'container' && /appleContainer/i.test(String(item.key || ''));
  const isShopPalletItem = isPalletVisualItem;
  const isShopFuelContainerItem = itemCategory === 'container'
    && !isShopAppleCrateItem
    && !isShopPalletItem
    && (
      Boolean(item?.sourceFuelKey)
      || Boolean(item?.isStoredFuelItem)
      || /fuel|jerry|can|diesel|gasoline|kerosene/i.test(`${String(item?.key || '')} ${String(item?.name || '')}`)
    );
  const shopAppleCrateTone = /green/i.test(String(item.key || '')) ? 'green' : 'yellow';
  const machineFuelTypeLabel = item.fuelType ? machineFuelTypeLabelOf(item.fuelType) : '';
  const machineDriveEfficiencyText = machineDriveEfficiencyTextOfItem
    ? machineDriveEfficiencyTextOfItem(item)
    : '';
  const canOpenDetailModal = canOpenItemDetailModal(item, itemCategory, { allowNonEquipment: true });
  return (
    <article
      key={`${keyPrefix}-${item.key}`}
      className={`option-card ${soldOut ? 'option-card--selected' : ''} ${toolImageSrc ? 'shop-tool-card--has-image' : ''}`.trim()}
      role={canOpenDetailModal ? 'button' : undefined}
      tabIndex={canOpenDetailModal ? 0 : undefined}
      style={canOpenDetailModal ? { cursor: 'pointer' } : undefined}
      onClick={(event) => {
        if (!canOpenDetailModal || shouldIgnoreDetailCardOpen?.(event.target)) return;
        openShopItemDetailModal(item, itemCategory, { allowNonEquipment: true });
      }}
      onKeyDown={(event) => {
        if (!canOpenDetailModal) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openShopItemDetailModal(item, itemCategory, { allowNonEquipment: true });
      }}
    >
      {toolImageSrc && !isShopPalletItem ? (
        <div className="shop-tool-thumb" aria-hidden="true">
          <img src={toolImageSrc} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className="option-card__row">
        <strong>{item.name}</strong>
        <span>{won(estimate.unitPrice)}</span>
      </div>
      {itemCategory === 'container' ? (
        <div className="shop-can-preview" aria-hidden="true">
          {isShopAppleCrateItem ? (
            <div className={`apple-crate-preview apple-crate-preview--${shopAppleCrateTone}`}>
              <div className="apple-crate-preview__model">
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
          ) : isShopPalletItem ? (
            toolImageSrc ? <img src={toolImageSrc} alt="" loading="lazy" /> : null
          ) : isShopFuelContainerItem ? (
            <div className={`fuel-jerrycan fuel-jerrycan--diesel ${itemCanSizeClass}`.trim()}>
              <div className="fuel-jerrycan__spout" />
              <div className="fuel-jerrycan__handle" />
              <div className="fuel-jerrycan__cap" />
              <div className="fuel-jerrycan__body">
                <div className="fuel-jerrycan__panel" />
                <div className="fuel-jerrycan__cross fuel-jerrycan__cross--a" />
                <div className="fuel-jerrycan__cross fuel-jerrycan__cross--b" />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="option-card__meta">{item.desc}</div>
      {item.formulation ? (
        <div className="option-card__meta">{`제형 ${item.formulation}`}</div>
      ) : null}
      {Number(item.weightKg) > 0 ? (
        <div className="option-card__meta">{`무게 ${Number(item.weightKg).toLocaleString()}kg`}</div>
      ) : null}
      {itemCategory === 'appliance' && (Number(item.fridgeLiters) > 0 || Number(item.freezerLiters) > 0) ? (
        <div className="option-card__meta">
          {`냉장 ${Math.max(0, Number(item.fridgeLiters) || 0).toLocaleString()}L / 냉동 ${Math.max(0, Number(item.freezerLiters) || 0).toLocaleString()}L`}
        </div>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'microwave' ? (
        <>
          {Number(item.ovenLiters) > 0 ? (
            <div className="option-card__meta">{`조리실 ${Number(item.ovenLiters).toLocaleString()}L`}</div>
          ) : null}
          {Number(item.outputWatts) > 0 ? (
            <div className="option-card__meta">{`출력 ${Number(item.outputWatts).toLocaleString()}W`}</div>
          ) : null}
        </>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'riceCooker' ? (
        <>
          {Number(item.servings) > 0 ? (
            <div className="option-card__meta">{`${Number(item.servings).toLocaleString()}인용`}</div>
          ) : null}
          {String(item.heatingType || '') ? (
            <div className="option-card__meta">{`가열방식 ${String(item.heatingType)}`}</div>
          ) : null}
          {Number(item.outputWatts) > 0 ? (
            <div className="option-card__meta">{`출력 ${Number(item.outputWatts).toLocaleString()}W`}</div>
          ) : null}
        </>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'washingMachine' ? (
        <>
          {Number(item.washCapacityKg) > 0 ? (
            <div className="option-card__meta">{`세탁 ${Number(item.washCapacityKg).toLocaleString()}kg${Number(item.dryCapacityKg) > 0 ? ` / 건조 ${Number(item.dryCapacityKg).toLocaleString()}kg` : ''}`}</div>
          ) : null}
          {String(item.washerType || '') ? (
            <div className="option-card__meta">{`방식 ${String(item.washerType)}`}</div>
          ) : null}
          {Number(item.waterLitersPerCycle) > 0 ? (
            <div className="option-card__meta">{`물 사용량 약 ${Number(item.waterLitersPerCycle).toLocaleString()}L/회`}</div>
          ) : null}
        </>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'airConditioner' ? (
        <>
          {String(item.acType || '') ? (
            <div className="option-card__meta">{`형태 ${String(item.acType)}`}</div>
          ) : null}
          {Number(item.coolingAreaPyeong) > 0 ? (
            <div className="option-card__meta">{`냉방면적 ${Number(item.coolingAreaPyeong).toLocaleString()}평형`}</div>
          ) : null}
          {Number(item.coolingCapacityKw) > 0 ? (
            <div className="option-card__meta">{`냉방능력 ${Number(item.coolingCapacityKw).toLocaleString()}kW`}</div>
          ) : null}
        </>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'fan' ? (
        <>
          {String(item.fanType || '') ? (
            <div className="option-card__meta">{`형태 ${String(item.fanType)}`}</div>
          ) : null}
          {Number(item.bladeInch) > 0 ? (
            <div className="option-card__meta">{`날개 ${Number(item.bladeInch).toLocaleString()}인치`}</div>
          ) : null}
          {Number(item.speedSteps) > 0 ? (
            <div className="option-card__meta">{`풍속 ${Number(item.speedSteps).toLocaleString()}단`}</div>
          ) : null}
          {item.oscillation ? (
            <div className="option-card__meta">좌우회전 지원</div>
          ) : null}
        </>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'heatingMat' ? (
        <>
          {String(item.matType || '') ? (
            <div className="option-card__meta">{`종류 ${String(item.matType)}`}</div>
          ) : null}
          {String(item.matSize || '') ? (
            <div className="option-card__meta">{`크기 ${String(item.matSize)}`}</div>
          ) : null}
          {Number(item.heatSteps) > 0 ? (
            <div className="option-card__meta">{`온도 ${Number(item.heatSteps).toLocaleString()}단`}</div>
          ) : null}
          {Number(item.waterTankLiters) > 0 ? (
            <div className="option-card__meta">{`물탱크 ${Number(item.waterTankLiters).toLocaleString()}L`}</div>
          ) : null}
        </>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'boiler' ? (
        <>
          {String(item.boilerType || '') ? (
            <div className="option-card__meta">{`종류 ${String(item.boilerType)}`}</div>
          ) : null}
          {String(item.fuelLabel || '') ? (
            <div className="option-card__meta">{`연료 ${String(item.fuelLabel)}`}</div>
          ) : null}
          {Number(item.heatingAreaPyeong) > 0 ? (
            <div className="option-card__meta">{`난방면적 ${Number(item.heatingAreaPyeong).toLocaleString()}평형`}</div>
          ) : null}
          {Number(item.outputKw) > 0 ? (
            <div className="option-card__meta">{`출력 ${Number(item.outputKw).toLocaleString()}kW`}</div>
          ) : null}
          {Number(item.hotWaterLitersPerMin) > 0 ? (
            <div className="option-card__meta">{`온수 ${Number(item.hotWaterLitersPerMin).toLocaleString()}L/분`}</div>
          ) : null}
          {item.exhaustRequired ? (
            <div className="option-card__meta">연통/배기 필요</div>
          ) : null}
        </>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'inductionCooktop' ? (
        <>
          {Number(item.burnerCount) > 0 ? (
            <div className="option-card__meta">{`${Number(item.burnerCount).toLocaleString()}구`}</div>
          ) : null}
          {String(item.cooktopType || '') ? (
            <div className="option-card__meta">{`방식 ${String(item.cooktopType)}`}</div>
          ) : null}
          {Number(item.maxPowerWatts) > 0 ? (
            <div className="option-card__meta">{`최대출력 ${Number(item.maxPowerWatts).toLocaleString()}W`}</div>
          ) : null}
        </>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'waterPurifier' ? (
        <>
          {String(item.purifierType || '') ? (
            <div className="option-card__meta">{`형태 ${String(item.purifierType)}`}</div>
          ) : null}
          {String(item.waterModes || '') ? (
            <div className="option-card__meta">{`출수 ${String(item.waterModes)}`}</div>
          ) : null}
          {Number(item.filterMonths) > 0 ? (
            <div className="option-card__meta">{`필터 ${Number(item.filterMonths).toLocaleString()}개월 주기`}</div>
          ) : null}
          {Number(item.tankLiters) > 0 ? (
            <div className="option-card__meta">{`탱크 ${Number(item.tankLiters).toLocaleString()}L`}</div>
          ) : null}
        </>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'electricKettle' ? (
        <>
          {Number(item.kettleLiters) > 0 ? (
            <div className="option-card__meta">{`용량 ${Number(item.kettleLiters).toLocaleString()}L`}</div>
          ) : null}
          {String(item.kettleType || '') ? (
            <div className="option-card__meta">{`형태 ${String(item.kettleType)}`}</div>
          ) : null}
          {Number(item.outputWatts) > 0 ? (
            <div className="option-card__meta">{`출력 ${Number(item.outputWatts).toLocaleString()}W`}</div>
          ) : null}
          {item.keepWarm ? (
            <div className="option-card__meta">보온 기능 지원</div>
          ) : null}
        </>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'computer' ? (
        <>
          {String(item.computerKind || '') ? (
            <div className="option-card__meta">{`종류 ${String(item.computerKind)}`}</div>
          ) : null}
          {String(item.cpuTier || '') ? (
            <div className="option-card__meta">{`CPU ${String(item.cpuTier)}`}</div>
          ) : null}
          {(Number(item.memoryGb) > 0 || Number(item.storageGb) > 0) ? (
            <div className="option-card__meta">{`메모리 ${Number(item.memoryGb).toLocaleString()}GB / 저장 ${Number(item.storageGb).toLocaleString()}GB`}</div>
          ) : null}
          {Number(item.screenInch) > 0 ? (
            <div className="option-card__meta">{`화면 ${Number(item.screenInch).toLocaleString()}인치`}</div>
          ) : null}
        </>
      ) : null}
      {itemCategory === 'appliance' && String(item.type || '') === 'tv' ? (
        <>
          {Number(item.screenInch) > 0 ? (
            <div className="option-card__meta">{`화면 ${Number(item.screenInch).toLocaleString()}인치`}</div>
          ) : null}
          {String(item.resolution || '') ? (
            <div className="option-card__meta">{`해상도 ${String(item.resolution)}`}</div>
          ) : null}
          <div className="option-card__meta">{item.smartTv ? '스마트 기능 지원' : '일반 TV'}</div>
        </>
      ) : null}
      {itemCategory === 'appliance' && Number(item.dailyPowerKwh) > 0 ? (
        <div className="option-card__meta">{`소비전력 약 ${Number(item.dailyPowerKwh).toLocaleString()}kWh/일`}</div>
      ) : null}
      {itemCategory === 'furniture' ? (
        <>
          {String(item.furnitureSize || '') ? (
            <div className="option-card__meta">{`크기 ${String(item.furnitureSize)}`}</div>
          ) : null}
          {String(item.material || '') ? (
            <div className="option-card__meta">{`재질 ${String(item.material)}`}</div>
          ) : null}
          {Number(item.sleepQualityBonus) > 0 ? (
            <div className="option-card__meta">{`수면품질 +${Number(item.sleepQualityBonus).toLocaleString()}`}</div>
          ) : null}
          {Number(item.workComfortBonus) > 0 ? (
            <div className="option-card__meta">{`작업편의 +${Number(item.workComfortBonus).toLocaleString()}`}</div>
          ) : null}
          {Number(item.storageCapacityKg) > 0 ? (
            <div className="option-card__meta">{`수납 ${Number(item.storageCapacityKg).toLocaleString()}kg`}</div>
          ) : null}
          {Number(item.mealComfortBonus) > 0 ? (
            <div className="option-card__meta">{`식사편의 +${Number(item.mealComfortBonus).toLocaleString()}`}</div>
          ) : null}
        </>
      ) : null}
      {Number(item.payloadKg) > 0 ? (
        <div className="option-card__meta">{`적재량 ${Number(item.payloadKg).toLocaleString()}kg`}</div>
      ) : null}
      {item.type === 'tractor' && Number(item.engineHp) > 0 ? (
        <>
          <div className="option-card__meta">{`출력 ${Number(item.engineHp).toLocaleString()}마력`}</div>
        </>
      ) : null}
      {item.type === 'rotary' ? (
        <>
          {Number(item.workingWidthMm) > 0 ? (
            <div className="option-card__meta">{`작업폭 ${Number(item.workingWidthMm).toLocaleString()}mm`}</div>
          ) : null}
          {(Number(item.recommendedHpMin) > 0 || Number(item.recommendedHpMax) > 0) ? (
            <div className="option-card__meta">
              {`권장 출력 ${
                Number(item.recommendedHpMax) > 0
                  ? `${Number(item.recommendedHpMin).toLocaleString()}~${Number(item.recommendedHpMax).toLocaleString()}마력`
                  : `${Number(item.recommendedHpMin).toLocaleString()}마력 이상`
              }`}
            </div>
          ) : null}
        </>
      ) : null}
      {item.type === 'spray' ? (
        <>
          {Number(item.sprayTankLiters) > 0 ? (
            <div className="option-card__meta">{`약탱크 ${Number(item.sprayTankLiters).toLocaleString()}L`}</div>
          ) : null}
          {String(item.machineSizeMm || '') ? (
            <div className="option-card__meta">{`작업 크기 ${String(item.machineSizeMm)}`}</div>
          ) : null}
          {String(item.driveEngineModel || '') ? (
            <div className="option-card__meta">{`주행 엔진 ${String(item.driveEngineModel)}`}</div>
          ) : null}
          {String(item.blowerEngineModel || '') ? (
            <div className="option-card__meta">{`송풍 엔진 ${String(item.blowerEngineModel)}`}</div>
          ) : null}
          {Number(item.blowerAirflowM3Min) > 0 ? (
            <div className="option-card__meta">{`풍량 ${Number(item.blowerAirflowM3Min).toLocaleString()}m³/min`}</div>
          ) : null}
          {String(item.pumpModel || '') ? (
            <div className="option-card__meta">{`펌프 ${String(item.pumpModel)}`}</div>
          ) : null}
        </>
      ) : null}
      {machineFuelTypeLabel ? (
        <div className="option-card__meta">사용 연료 {machineFuelTypeLabel}</div>
      ) : null}
      {machineDriveEfficiencyText ? (
        <div className="option-card__meta">{machineDriveEfficiencyText}</div>
      ) : null}
      {itemCategory !== 'pesticide' ? (
        <div className="option-card__meta">보유 {formatCountWithUnit(ownedQty, item.unit)}{item.maxQty ? ` / 최대 ${formatCountWithUnit(item.maxQty, item.unit)}` : ''}</div>
      ) : null}
      {itemCategory === 'seedling' ? (
        <div className="option-card__meta">{seedlingExpireSummaryOf(game, item.key)}</div>
      ) : null}
      {multiBuyEnabled ? (
        <>
          <div className="option-card__meta">담기 수량 {formatCountWithUnit(buyQty, item.unit)} · 결제금 {won(estimate.totalPrice)}</div>
          <div className="footer-actions" style={{ marginTop: 8 }}>
            <input
              className="text-input shop-buy-qty-input"
              style={{ width: 86 }}
              type="number"
              min={1}
              max={maxSelectableQty}
              step={1}
              value={buyQty}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const next = clamp(Math.floor(Number(e.target.value) || 1), 1, maxSelectableQty);
                setLocalDraftQty(next);
              }}
            />
          </div>
        </>
      ) : null}
      <div className="footer-actions" style={{ marginTop: 10 }}>
        <button
          className={`button button--ghost day-transition-animate-button shop-buy-add-btn ${multiBuyEnabled && isBuyFlashing ? 'button--buy-flash' : ''}`.trim()}
          disabled={soldOut}
          title={soldOut ? '최대 보유 수량에 도달했습니다.' : ''}
          onClick={(e) => {
            e.stopPropagation();
            if (multiBuyEnabled) triggerShopBuyFlash(item.key);
            const hasPurchaseOptions = vehiclePurchaseOptionsOf(item).length > 0;
            if (hasPurchaseOptions) {
              openTransportPurchaseModal(item, { dealerMode: isDealerMachineItem });
              return;
            }
            if (isDealerMachineItem) {
              openDealerPurchaseContractModal(item.key, estimate.unitPrice, item.name);
              return;
            }
            playShopBarcodeSound?.();
            addItemToShopCart(item, itemCategory, buyQty);
          }}
        >
          {soldOut ? '보유 완료' : (vehiclePurchaseOptionsOf(item).length > 0 ? '옵션 선택' : (isDealerMachineItem ? '계약서 작성' : `${formatCountWithUnit(buyQty, item.unit)} 담기`))}
        </button>
      </div>
    </article>
  );
}
