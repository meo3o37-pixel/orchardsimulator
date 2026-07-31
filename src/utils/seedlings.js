import { SEEDLING_KEY_BY_CROP } from '../config/gameConfig';

export const SEEDLING_SHELF_LIFE_DAYS = 10;
export const SEEDLING_KEYS = Array.from(new Set(Object.values(SEEDLING_KEY_BY_CROP)));

export const seedlingQtyOfBatches = (batches = []) =>
  (batches || []).reduce((sum, batch) => sum + Math.max(0, Math.floor(Number(batch?.qty) || 0)), 0);

export const normalizeSeedlingExpiryByKey = (rawMap = {}, inventory = {}, baseDay = 1) => {
  const next = {};
  SEEDLING_KEYS.forEach((seedlingKey) => {
    const rawBatches = Array.isArray(rawMap?.[seedlingKey]) ? rawMap[seedlingKey] : [];
    const cleaned = rawBatches
      .map((batch) => ({
        qty: Math.max(0, Math.floor(Number(batch?.qty) || 0)),
        expireDay: Math.max(1, Math.floor(Number(batch?.expireDay) || (baseDay + SEEDLING_SHELF_LIFE_DAYS)))
      }))
      .filter((batch) => batch.qty > 0)
      .sort((a, b) => a.expireDay - b.expireDay);
    if (cleaned.length > 0) {
      next[seedlingKey] = cleaned;
      return;
    }
    const fallbackQty = Math.max(0, Math.floor(Number(inventory?.[seedlingKey]) || 0));
    if (fallbackQty > 0) {
      next[seedlingKey] = [{ qty: fallbackQty, expireDay: baseDay + SEEDLING_SHELF_LIFE_DAYS }];
    }
  });
  return next;
};

export const seedlingStockOf = (game, seedlingKey) => {
  if (!seedlingKey) return 0;
  const day = Math.max(1, Number(game?.day) || 1);
  const normalized = normalizeSeedlingExpiryByKey(game?.seedlingExpiryByKey || {}, game?.inventory || {}, day);
  return seedlingQtyOfBatches(normalized[seedlingKey] || []);
};

export const seedlingExpireSummaryOf = (game, seedlingKey) => {
  if (!seedlingKey) return '';
  const day = Math.max(1, Number(game?.day) || 1);
  const normalized = normalizeSeedlingExpiryByKey(game?.seedlingExpiryByKey || {}, game?.inventory || {}, day);
  const batches = [...(normalized[seedlingKey] || [])]
    .filter((batch) => (Number(batch?.qty) || 0) > 0)
    .sort((a, b) => (Number(a.expireDay) || 0) - (Number(b.expireDay) || 0));
  if (!batches.length) return '';
  const nearestExpireDay = Number(batches[0].expireDay) || day;
  const daysLeft = Math.max(0, nearestExpireDay - day + 1);
  return `\uC720\uD1B5\uAE30\uD55C ${daysLeft}\uC77C \uB0A8\uC74C`;
};

export const syncSeedlingInventory = (inventory = {}, seedlingExpiryByKey = {}) => {
  const nextInventory = { ...(inventory || {}) };
  SEEDLING_KEYS.forEach((seedlingKey) => {
    nextInventory[seedlingKey] = seedlingQtyOfBatches(seedlingExpiryByKey?.[seedlingKey] || []);
  });
  return nextInventory;
};

export const addSeedlingBatch = (seedlingExpiryByKey = {}, seedlingKey, qty, expireDay) => {
  const safeQty = Math.max(0, Math.floor(Number(qty) || 0));
  if (!seedlingKey || safeQty <= 0) return seedlingExpiryByKey || {};
  const safeExpireDay = Math.max(1, Math.floor(Number(expireDay) || 1));
  const next = { ...(seedlingExpiryByKey || {}) };
  const merged = [...(next[seedlingKey] || []), { qty: safeQty, expireDay: safeExpireDay }]
    .map((batch) => ({
      qty: Math.max(0, Math.floor(Number(batch?.qty) || 0)),
      expireDay: Math.max(1, Math.floor(Number(batch?.expireDay) || safeExpireDay))
    }))
    .filter((batch) => batch.qty > 0)
    .sort((a, b) => a.expireDay - b.expireDay);
  next[seedlingKey] = merged;
  return next;
};

export const consumeSeedlingBatches = (seedlingExpiryByKey = {}, seedlingKey, qty) => {
  const need = Math.max(0, Math.floor(Number(qty) || 0));
  if (!seedlingKey || need <= 0) return { nextSeedlingExpiryByKey: seedlingExpiryByKey || {}, consumed: 0 };
  const next = { ...(seedlingExpiryByKey || {}) };
  const queue = [...(next[seedlingKey] || [])]
    .map((batch) => ({
      qty: Math.max(0, Math.floor(Number(batch?.qty) || 0)),
      expireDay: Math.max(1, Math.floor(Number(batch?.expireDay) || 1))
    }))
    .filter((batch) => batch.qty > 0)
    .sort((a, b) => a.expireDay - b.expireDay);
  let remain = need;
  const result = [];
  queue.forEach((batch) => {
    if (remain <= 0) {
      result.push(batch);
      return;
    }
    const used = Math.min(batch.qty, remain);
    remain -= used;
    const left = batch.qty - used;
    if (left > 0) result.push({ ...batch, qty: left });
  });
  if (result.length > 0) next[seedlingKey] = result;
  else delete next[seedlingKey];
  return { nextSeedlingExpiryByKey: next, consumed: need - remain };
};

export const expireSeedlingsForDay = (inventory = {}, rawSeedlingExpiryByKey = {}, day = 1) => {
  const normalized = normalizeSeedlingExpiryByKey(rawSeedlingExpiryByKey, inventory, day);
  const nextSeedlingExpiryByKey = {};
  const expiredByKey = {};
  SEEDLING_KEYS.forEach((seedlingKey) => {
    const batches = normalized[seedlingKey] || [];
    const alive = [];
    let expired = 0;
    batches.forEach((batch) => {
      const qty = Math.max(0, Math.floor(Number(batch?.qty) || 0));
      const expireDay = Math.max(1, Math.floor(Number(batch?.expireDay) || 1));
      if (qty <= 0) return;
      if (expireDay < day) {
        expired += qty;
        return;
      }
      alive.push({ qty, expireDay });
    });
    if (alive.length > 0) nextSeedlingExpiryByKey[seedlingKey] = alive;
    if (expired > 0) expiredByKey[seedlingKey] = expired;
  });
  return {
    nextSeedlingExpiryByKey,
    expiredByKey,
    nextInventory: syncSeedlingInventory(inventory, nextSeedlingExpiryByKey)
  };
};
