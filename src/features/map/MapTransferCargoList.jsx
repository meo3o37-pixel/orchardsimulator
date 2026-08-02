import React from 'react';

export default function MapTransferCargoList({
  mapTransferSelectedCarrierCargoRows,
  isFuelCanDirectSelectMode,
  mapTransferCarrierCargoRows,
  itemMetaByKey,
  itemNameByKey,
  moveCarrierCargoRowToShopCart,
  formatLiterText,
  formatLiterTextFixed2,
  containerCapacityLitersOfItem,
  parseCapacityLitersFromText,
  mapTransferSelectedCarrier,
  normalizeFuelStorageByContainer,
  game,
  fuelCanSplitByGroupSource,
  clamp,
  floorLitersToStep,
  fuelItemNameMap,
  machineFuelTypeLabelOf,
  normalizeFuelContainerKey,
  fuelKioskAvailableCanOptions,
  fuelKioskBorrowedCan,
  fuelKioskCanKey,
  stageFuelCanToKiosk,
  setFuelKioskDirectTargetCarrierId,
  toolImageSrcOf
}) {
  const renderItemThumb = (itemKeyRaw) => {
    const imageSrc = toolImageSrcOf?.(String(itemKeyRaw || '')) || '';
    if (!imageSrc) return null;
    return (
      <div className="shop-cart-item__thumb map-transfer-cargo-row__thumb" aria-hidden="true">
        <img src={imageSrc} alt="" loading="lazy" />
      </div>
    );
  };

  return (
    <>
      {mapTransferSelectedCarrierCargoRows.flatMap((row, rowIndex) => {
        const itemKey = String(row?.itemKey || '');
        const qty = Math.max(0, Number(row?.qty) || 0);
        const meta = itemMetaByKey?.[itemKey] || {};
        const itemName = String(itemNameByKey?.[itemKey] || meta?.name || itemKey);
        const unit = String(meta?.unit || '개');
        const weightKg = Math.max(0, Number(meta?.weightKg) || 0);
        if (!isFuelCanDirectSelectMode) {
          if (rowIndex > 0) return [];
          return mapTransferCarrierCargoRows.map((entry) => {
            const entryMeta = itemMetaByKey?.[entry.itemKey] || {};
            const entryUnit = String(entryMeta?.unit || unit || '개');
            const entryWeightKg = Math.max(0, Number(entryMeta?.weightKg) || 0);
            const canReturnToCart = Math.max(0, Number(entryMeta?.price) || 0) > 0;
            const entryImageSrc = toolImageSrcOf?.(String(entry.itemKey || '')) || '';
            return (
              <div key={`map-transfer-cargo-row-${entry.rowKey || entry.itemKey}`} className={`shop-cart-item shop-cart-item--with-move map-transfer-cargo-row ${entryImageSrc ? 'shop-cart-item--has-image' : ''}`.trim()}>
                {renderItemThumb(entry.itemKey)}
                <div className="shop-cart-item__head">
                  <strong>{entry.label || itemNameByKey?.[entry.itemKey] || entry.itemKey}</strong>
                  <div className="shop-cart-item__actions">
                    {canReturnToCart ? (
                      <button
                        className="button button--ghost button--compact day-transition-animate-button map-transfer-move-btn"
                        onClick={() => moveCarrierCargoRowToShopCart(entry)}
                      >
                        옮기기
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="shop-cart-item__meta">{`${entry.qty}${entryUnit}${entryWeightKg > 0 ? ` · 총 ${formatLiterText(entryWeightKg * Math.max(0, Number(entry.qty) || 0))}kg` : ''}`}</div>
              </div>
            );
          });
        }
        if (!isFuelCanDirectSelectMode) {
          const canCapacityLiters = Math.max(
            0,
            containerCapacityLitersOfItem(meta)
            || parseCapacityLitersFromText(meta?.name)
            || parseCapacityLitersFromText(itemKey)
            || 0
          );
          if (canCapacityLiters > 0) {
            const carrierId = String(mapTransferSelectedCarrier?.id || '');
            const carrierFuelByContainer = normalizeFuelStorageByContainer(
              game?.vehicleFuelStorageByInstance?.[carrierId] || {}
            );
            const globalFuelByContainer = normalizeFuelStorageByContainer(
              game?.fuelStorageByContainer || {}
            );
            let fuelMap = carrierFuelByContainer?.[itemKey] || {};
            const globalFuelMap = globalFuelByContainer?.[itemKey] || {};
            if (!Object.keys(fuelMap || {}).length && Object.keys(globalFuelMap || {}).length) {
              fuelMap = globalFuelMap;
            }
            let qtyRemain = Math.max(0, qty);
            const displayRows = [];
            const vehicleSplitGroupKey = `vehicle:${itemKey}`;
            const legacySplitGroupKey = String(itemKey);
            const warehouseSplitGroupKey = `warehouse:${normalizeFuelContainerKey(itemKey) || itemKey}`;
            const vehicleSplitRaw = (
              Array.isArray(fuelCanSplitByGroupSource?.[vehicleSplitGroupKey])
                ? fuelCanSplitByGroupSource[vehicleSplitGroupKey]
                : (
                  Array.isArray(fuelCanSplitByGroupSource?.[legacySplitGroupKey])
                    ? fuelCanSplitByGroupSource[legacySplitGroupKey]
                    : (
                      Array.isArray(fuelCanSplitByGroupSource?.[warehouseSplitGroupKey])
                        ? fuelCanSplitByGroupSource[warehouseSplitGroupKey]
                        : null
                    )
                )
            );
            const normalizedVehicleSplit = Array.isArray(vehicleSplitRaw)
              ? vehicleSplitRaw
                .map((value) => floorLitersToStep(clamp(Number(value) || 0, 0, canCapacityLiters)))
                .filter((value) => value > 0)
              : [];
            let hasAppliedVehicleSplit = false;
            Object.entries(fuelMap || {}).forEach(([fuelKeyRaw, litersRaw]) => {
              if (qtyRemain <= 0) return;
              const fuelKey = String(fuelKeyRaw || '');
              const liters = floorLitersToStep(litersRaw);
              if (!fuelKey || liters <= 0) return;
              const fuelNameRaw = String(fuelItemNameMap?.[fuelKey] || fuelKey || '');
              const fuelName = fuelNameRaw.replace(/\s*\([^)]*\)\s*/g, '').trim() || fuelNameRaw;
              if (!hasAppliedVehicleSplit && normalizedVehicleSplit.length > 0) {
                const splitTotal = floorLitersToStep(
                  normalizedVehicleSplit.reduce((sum, value) => sum + floorLitersToStep(value), 0)
                );
                const canCountMatch = normalizedVehicleSplit.length <= qtyRemain;
                const litersMatch = Math.abs(splitTotal - liters) <= 0.02;
                if (canCountMatch && litersMatch) {
                  normalizedVehicleSplit.forEach((splitLiters, splitIndex) => {
                    displayRows.push({
                      id: `${itemKey}__${fuelKey}__split__${splitIndex}`,
                      qty: 1,
                      label: `${fuelName}말통(${formatLiterTextFixed2(splitLiters)}L/${formatLiterTextFixed2(canCapacityLiters)}L)`
                    });
                  });
                  qtyRemain -= normalizedVehicleSplit.length;
                  hasAppliedVehicleSplit = true;
                  return;
                }
              }
              const fullCount = Math.min(qtyRemain, Math.floor(liters / canCapacityLiters));
              const partialLiters = floorLitersToStep(liters - (fullCount * canCapacityLiters));
              if (fullCount > 0) {
                displayRows.push({
                  id: `${itemKey}__${fuelKey}__full`,
                  qty: fullCount,
                  label: `${fuelName}말통(${formatLiterText(canCapacityLiters)}L/${formatLiterText(canCapacityLiters)}L)`
                });
                qtyRemain -= fullCount;
              }
              if (qtyRemain > 0 && partialLiters > 0) {
                displayRows.push({
                  id: `${itemKey}__${fuelKey}__partial`,
                  qty: 1,
                  label: `${fuelName}말통(${formatLiterText(partialLiters)}L/${formatLiterText(canCapacityLiters)}L)`
                });
                qtyRemain -= 1;
              }
            });
            if (!hasAppliedVehicleSplit && normalizedVehicleSplit.length > 0 && qtyRemain > 0) {
              const fallbackFuelKey = String(Object.keys(fuelMap || {})[0] || '');
              const fallbackFuelNameRaw = String(fuelItemNameMap?.[fallbackFuelKey] || machineFuelTypeLabelOf(mapTransferSelectedCarrier?.item?.fuelType) || '연료');
              const fallbackFuelName = fallbackFuelNameRaw.replace(/\s*\([^)]*\)\s*/g, '').trim() || fallbackFuelNameRaw;
              const splitCount = Math.min(qtyRemain, normalizedVehicleSplit.length);
              for (let splitIndex = 0; splitIndex < splitCount; splitIndex += 1) {
                const splitLiters = normalizedVehicleSplit[splitIndex];
                displayRows.push({
                  id: `${itemKey}__split_fallback__${splitIndex}`,
                  qty: 1,
                  label: `${fallbackFuelName}말통(${formatLiterTextFixed2(splitLiters)}L/${formatLiterTextFixed2(canCapacityLiters)}L)`
                });
              }
              qtyRemain -= splitCount;
            }
            if (qtyRemain > 0) {
              displayRows.push({
                id: `${itemKey}__empty`,
                qty: qtyRemain,
                label: itemName
              });
            }
            return displayRows
              .filter((entry) => Math.max(0, Number(entry?.qty) || 0) > 0)
              .map((entry) => (
                <div key={`map-transfer-cargo-row-${entry.id}`} className={`shop-cart-item shop-cart-item--with-move map-transfer-cargo-row ${toolImageSrcOf?.(itemKey) ? 'shop-cart-item--has-image' : ''}`.trim()}>
                  {renderItemThumb(itemKey)}
                  <div className="shop-cart-item__head">
                    <strong>{entry.label}</strong>
                  </div>
                  <div className="shop-cart-item__meta">{`${entry.qty}${unit}${weightKg > 0 ? ` · 총 ${formatLiterText(weightKg * Math.max(0, Number(entry.qty) || 0))}kg` : ''}`}</div>
                </div>
              ));
          }
          if (qty <= 0) return [];
          const itemImageSrc = toolImageSrcOf?.(itemKey) || '';
          return (
            <div key={`map-transfer-cargo-row-${itemKey}__all`} className={`shop-cart-item shop-cart-item--with-move map-transfer-cargo-row ${itemImageSrc ? 'shop-cart-item--has-image' : ''}`.trim()}>
              {renderItemThumb(itemKey)}
              <div className="shop-cart-item__head">
                <strong>{itemName}</strong>
              </div>
              <div className="shop-cart-item__meta">{`${qty}${unit}${weightKg > 0 ? ` · 총 ${formatLiterText(weightKg * Math.max(0, qty))}kg` : ''}`}</div>
            </div>
          );
        }
        const splitCanRows = (() => {
          const canCapacityLiters = Math.max(
            0,
            containerCapacityLitersOfItem(meta)
            || parseCapacityLitersFromText(meta?.name)
            || parseCapacityLitersFromText(itemKey)
            || 0
          );
          if (canCapacityLiters <= 0) return null;
          const options = (fuelKioskAvailableCanOptions || [])
            .filter((option) => String(option?.key || '') === itemKey && String(option?.optionKey || '') !== '__staged__')
            .sort((a, b) => {
              const aFilled = Math.max(0, Number(a?.sameFuelStoredPerCan ?? a?.sameFuelStored) || 0);
              const bFilled = Math.max(0, Number(b?.sameFuelStoredPerCan ?? b?.sameFuelStored) || 0);
              if (bFilled !== aFilled) return bFilled - aFilled;
              const aRemain = Math.max(0, Number(a?.targetCanRemain ?? a?.storableRemain) || 0);
              const bRemain = Math.max(0, Number(b?.targetCanRemain ?? b?.storableRemain) || 0);
              return bRemain - aRemain;
            });
          if (!options.length) return null;
          let remainQty = qty;
          const rows = [];
          options.forEach((option) => {
            if (remainQty <= 0) return;
            const maxOptionQty = Math.max(0, Math.floor(Number(option?.qty) || 0));
            if (maxOptionQty <= 0) return;
            const optionKey = String(option?.optionKey || option?.key || '');
            const borrowedMatchesOption = (
              String(fuelKioskBorrowedCan?.carrierId || '') === String(mapTransferSelectedCarrier?.id || '')
              && String(fuelKioskBorrowedCan?.itemKey || '') === itemKey
              && String(fuelKioskBorrowedCan?.optionKey || '') === optionKey
            );
            const optionQty = Math.max(0, Math.min(remainQty, maxOptionQty) - (borrowedMatchesOption ? 1 : 0));
            remainQty = Math.max(0, remainQty - Math.min(remainQty, maxOptionQty));
            if (optionQty <= 0) return;
            rows.push({
              id: `${itemKey}__${optionKey || 'option'}`,
              qty: optionQty,
              label: String(option?.displayLabel || itemName),
              optionKey,
              canRemainLiters: Math.max(0, Number(option?.targetCanRemain ?? option?.storableRemain) || 0),
              selectable: Boolean(optionKey)
            });
          });
          return rows;
        })();
        const displayRows = Array.isArray(splitCanRows) ? splitCanRows : [];
        return displayRows.map((entry) => {
          const isCanSelectable = Boolean(isFuelCanDirectSelectMode && entry.selectable);
          const isCanSelected = isCanSelectable && fuelKioskCanKey === entry.optionKey;
          const itemImageSrc = toolImageSrcOf?.(itemKey) || '';
          if (isCanSelectable) {
            return (
              <button
                key={`map-transfer-cargo-row-${entry.id}`}
                type="button"
                className={`shop-cart-item shop-cart-item--with-move map-transfer-cargo-row map-transfer-cargo-row--selectable ${isCanSelected ? 'is-active' : ''} ${itemImageSrc ? 'shop-cart-item--has-image' : ''}`.trim()}
                onClick={() => {
                  stageFuelCanToKiosk(entry.optionKey, itemKey);
                  setFuelKioskDirectTargetCarrierId('');
                }}
                title="주유할 말통으로 선택"
              >
                {renderItemThumb(itemKey)}
                <div className="shop-cart-item__head">
                  <strong>{entry.label}</strong>
                </div>
                <div className="shop-cart-item__meta">{`${entry.qty}${unit}${weightKg > 0 ? ` · 총 ${formatLiterText(weightKg * Math.max(0, Number(entry.qty) || 0))}kg` : ''} · 남은 ${entry.canRemainLiters}L`}</div>
              </button>
            );
          }
          return (
            <div key={`map-transfer-cargo-row-${entry.id}`} className={`shop-cart-item shop-cart-item--with-move map-transfer-cargo-row ${itemImageSrc ? 'shop-cart-item--has-image' : ''}`.trim()}>
              {renderItemThumb(itemKey)}
              <div className="shop-cart-item__head">
                <strong>{entry.label}</strong>
              </div>
              <div className="shop-cart-item__meta">{`${entry.qty}${unit}${weightKg > 0 ? ` · 총 ${formatLiterText(weightKg * Math.max(0, Number(entry.qty) || 0))}kg` : ''}`}</div>
            </div>
          );
        });
      })}
    </>
  );
}
