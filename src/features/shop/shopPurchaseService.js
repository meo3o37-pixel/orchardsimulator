export function buildShopPurchaseRequest({
  game,
  item,
  skipHighPriceConfirm = false,
  purchaseOverride = null,
  requestedQty = 1,
  seedlingKeyByCrop = {},
  shopUnitPriceOf,
  machinePurchaseBundleMetaOfOptionKey
}) {
  if (!game || !item) return { ok: false };
  const inferredCategory = item?.category || (Object.values(seedlingKeyByCrop).includes(item?.key) ? 'seedling' : '');
  const isSeedlingItem = inferredCategory === 'seedling';
  const liveUnitPrice = shopUnitPriceOf(game, item, inferredCategory);
  const unitPrice = Math.max(0, Math.floor(Number(purchaseOverride?.price ?? liveUnitPrice ?? item?.price ?? 0)));
  const finalName = purchaseOverride?.name || item?.name;
  const purchaseOptionKey = String(purchaseOverride?.optionKey || '');
  const purchaseBundleMeta = machinePurchaseBundleMetaOfOptionKey(purchaseOptionKey);
  const parsedQty = Math.max(1, Math.floor(Number(requestedQty) || 1));
  const currentQty = game.inventory?.[item.key] || 0;
  if (item.maxQty && currentQty >= item.maxQty) return { ok: false };
  const maxPurchasableQty = item.maxQty ? Math.max(0, item.maxQty - currentQty) : Infinity;
  const buyQty = Math.max(0, Math.min(parsedQty, maxPurchasableQty));
  if (buyQty <= 0) return { ok: false };
  const totalPrice = unitPrice * buyQty;
  if (!skipHighPriceConfirm && totalPrice >= 10000000) {
    return {
      ok: false,
      needsHighPriceConfirm: true,
      pendingPurchase: { item, purchaseOverride: purchaseOverride || null, qty: buyQty }
    };
  }
  if (game.money < totalPrice) return { ok: false, reason: '보유 자금이 부족합니다.' };
  return {
    ok: true,
    inferredCategory,
    isSeedlingItem,
    unitPrice,
    finalName,
    purchaseOptionKey,
    purchaseBundleMeta,
    buyQty,
    totalPrice
  };
}

export function buildShopPurchaseApplyState({
  prev,
  item,
  buyQty,
  finalName,
  totalPrice,
  isSeedlingItem,
  purchaseOptionKey,
  purchaseBundleMeta,
  normalizeSeedlingExpiryByKey,
  addSeedlingBatch,
  seedlingShelfLifeDays,
  syncSeedlingInventory,
  machineParkingInstanceId,
  pushDiary,
  won
}) {
  const prevQty = prev.inventory?.[item.key] || 0;
  const nextQty = prevQty + buyQty;
  const baseSeedlingExpiryByKey = normalizeSeedlingExpiryByKey(prev.seedlingExpiryByKey || {}, prev.inventory || {}, prev.day);
  const nextSeedlingExpiryByKey = isSeedlingItem
    ? addSeedlingBatch(baseSeedlingExpiryByKey, item.key, buyQty, prev.day + seedlingShelfLifeDays)
    : baseSeedlingExpiryByKey;
  const equipmentDurability =
    item.durable
      ? (() => {
          const next = { ...(prev.equipmentDurability || {}) };
          next[item.key] = 100;
          return next;
        })()
      : (prev.equipmentDurability || {});
  const equipmentDurabilityByInstance =
    item.durable
      ? (() => {
          const next = { ...(prev.equipmentDurabilityByInstance || {}) };
          for (let unitNo = (prevQty + 1); unitNo <= nextQty; unitNo += 1) {
            next[machineParkingInstanceId(item.key, unitNo)] = 100;
          }
          return next;
        })()
      : (prev.equipmentDurabilityByInstance || {});
  const machinePurchaseOptionByInstance =
    item.durable
      ? (() => {
          const next = { ...(prev.machinePurchaseOptionByInstance || {}) };
          for (let unitNo = (prevQty + 1); unitNo <= nextQty; unitNo += 1) {
            const instanceId = machineParkingInstanceId(item.key, unitNo);
            if (purchaseOptionKey && !purchaseBundleMeta) next[instanceId] = purchaseOptionKey;
            else delete next[instanceId];
          }
          return next;
        })()
      : (prev.machinePurchaseOptionByInstance || {});
  const nextInventoryBase = isSeedlingItem
    ? syncSeedlingInventory({ ...(prev.inventory || {}), [item.key]: nextQty }, nextSeedlingExpiryByKey)
    : { ...(prev.inventory || {}), [item.key]: nextQty };
  const bundleInventory =
    purchaseBundleMeta
      ? (() => {
          const bundleItemKey = String(purchaseBundleMeta.itemKey || '');
          const bundleCurrentQty = Math.max(0, Number(nextInventoryBase[bundleItemKey]) || 0);
          return {
            ...nextInventoryBase,
            [bundleItemKey]: bundleCurrentQty + buyQty
          };
        })()
      : nextInventoryBase;
  const bundleEquipmentDurability =
    purchaseBundleMeta && purchaseBundleMeta.item?.durable
      ? (() => {
          const bundleItemKey = String(purchaseBundleMeta.itemKey || '');
          const next = { ...equipmentDurability };
          next[bundleItemKey] = 100;
          return next;
        })()
      : equipmentDurability;
  const bundleEquipmentDurabilityByInstance =
    purchaseBundleMeta && purchaseBundleMeta.item?.durable
      ? (() => {
          const bundleItemKey = String(purchaseBundleMeta.itemKey || '');
          const bundleCurrentQty = Math.max(0, Number(prev.inventory?.[bundleItemKey]) || 0);
          const next = { ...equipmentDurabilityByInstance };
          for (let unitNo = (bundleCurrentQty + 1); unitNo <= (bundleCurrentQty + buyQty); unitNo += 1) {
            next[machineParkingInstanceId(bundleItemKey, unitNo)] = 100;
          }
          return next;
        })()
      : equipmentDurabilityByInstance;
  const ssLinkedCargoBedByBaseInstance =
    purchaseBundleMeta
      ? (() => {
          const bundleItemKey = String(purchaseBundleMeta.itemKey || '');
          const bundleCurrentQty = Math.max(0, Number(prev.inventory?.[bundleItemKey]) || 0);
          const next = { ...(prev.ssLinkedCargoBedByBaseInstance || {}) };
          for (let unitOffset = 0; unitOffset < buyQty; unitOffset += 1) {
            const baseUnitNo = prevQty + unitOffset + 1;
            const bundleUnitNo = bundleCurrentQty + unitOffset + 1;
            next[machineParkingInstanceId(item.key, baseUnitNo)] = machineParkingInstanceId(bundleItemKey, bundleUnitNo);
          }
          return next;
        })()
      : (prev.ssLinkedCargoBedByBaseInstance || {});
  const bundleLogText = purchaseBundleMeta ? ` + ${purchaseBundleMeta.item?.name || 'SS기 적재함'} ${buyQty}${purchaseBundleMeta.item?.unit || '대'}` : '';

  return {
    ...prev,
    labor: prev.labor,
    money: prev.money - totalPrice,
    inventory: bundleInventory,
    seedlingExpiryByKey: nextSeedlingExpiryByKey,
    equipmentDurability: bundleEquipmentDurability,
    equipmentDurabilityByInstance: bundleEquipmentDurabilityByInstance,
    machinePurchaseOptionByInstance,
    ssLinkedCargoBedByBaseInstance,
    logs: pushDiary(
      prev,
      `상점 구매: ${finalName} ${buyQty}${item.unit}${bundleLogText} (결제금 ${won(totalPrice)})`
    )
  };
}
