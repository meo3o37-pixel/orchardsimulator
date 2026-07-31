export function buildFinalizedMachinePurchaseState(prev, options) {
  if (!prev) return prev;
  const {
    item,
    durability = 100,
    parkedFieldIndex = -1,
    parkedSlotNo = 0,
    cargoParkedSlotNo = 0,
    viaLabel = '직접운반',
    addToTempStorage = false,
    displayName,
    purchaseOptionKey = '',
    tempStorageShopKey = 'machineRent',
    tempStorageSourceKind = 'machine-purchase',
    machinePurchaseBundleMetaOfOptionKey,
    addInventoryUnitsToState,
    machineParkingInstanceId,
    assignMachinePurchaseOptionToUnitRange,
    parkMachineInstanceAtField,
    appendMachineRentTempStorageEntry,
    pushDiary,
    used = false,
    usedLogLabel = '중고 농기계 인수',
    vehiclePlateOverride = null
  } = options;
  const safeDurability = Math.max(1, Math.min(100, Number(durability) || 100));
  const purchaseBundleMeta = machinePurchaseBundleMetaOfOptionKey(purchaseOptionKey);
  const mainAdded = addInventoryUnitsToState(prev, item.key, 1, safeDurability);
  if (mainAdded.addedQty <= 0) return prev;
  const nextInstanceId = machineParkingInstanceId(item.key, mainAdded.endUnitNo);
  let next = purchaseBundleMeta
    ? mainAdded.nextState
    : assignMachinePurchaseOptionToUnitRange(mainAdded.nextState, item.key, mainAdded.startUnitNo, mainAdded.endUnitNo, purchaseOptionKey);
  if (vehiclePlateOverride && typeof vehiclePlateOverride === 'object') {
    next = {
      ...next,
      vehiclePlateByInstance: {
        ...(next.vehiclePlateByInstance || {}),
        [nextInstanceId]: { ...vehiclePlateOverride }
      }
    };
  }
  if (parkedFieldIndex >= 0 && parkedSlotNo > 0) {
    next = parkMachineInstanceAtField(next, nextInstanceId, parkedFieldIndex, parkedSlotNo);
  }
  if (purchaseBundleMeta) {
    const bundleAdded = addInventoryUnitsToState(next, purchaseBundleMeta.itemKey, 1, safeDurability);
    next = bundleAdded.nextState;
    const bundleInstanceId = machineParkingInstanceId(String(purchaseBundleMeta.itemKey || ''), bundleAdded.endUnitNo);
    if (parkedFieldIndex >= 0 && cargoParkedSlotNo > 0) {
      next = parkMachineInstanceAtField(next, bundleInstanceId, parkedFieldIndex, cargoParkedSlotNo);
    }
  }
  if (addToTempStorage) {
    next = appendMachineRentTempStorageEntry(next, item, {
      shopKey: tempStorageShopKey,
      sourceKind: tempStorageSourceKind,
      qty: 1,
      purchaseOverride: {
        name: displayName,
        optionKey: purchaseOptionKey
      }
    });
  }
  return {
    ...next,
    logs: pushDiary(
      next,
      used
        ? `${usedLogLabel}: ${displayName} #${mainAdded.endUnitNo} (내구도 ${safeDurability.toFixed(1)}%, ${viaLabel})`
        : `장비 인수: ${displayName} #${mainAdded.endUnitNo} (${viaLabel})`
    )
  };
}

export function buildTransportPurchaseResolution({
  pendingTransportPurchase,
  item,
  vehiclePurchaseOptionsOf,
  machinePurchaseOptionCost
}) {
  if (!pendingTransportPurchase || !item) return { ok: false };
  const options = vehiclePurchaseOptionsOf(item);
  if (!options.length) return { ok: false };
  const selectedOption = options.find((x) => String(x?.key || '') === String(pendingTransportPurchase.optionKey || '')) || options[0];
  const optionCost = machinePurchaseOptionCost(item, selectedOption);
  const finalPrice = item.price + optionCost;
  const displayName = `${item.name} (${selectedOption.label})`;
  return {
    ok: true,
    selectedOption,
    optionCost,
    finalPrice,
    displayName,
    purchaseOptionKey: String(selectedOption?.key || '')
  };
}
