export const parseCapacityLitersFromText = (text) => {
  const matched = String(text || '').match(/(\d+)\s*L/i);
  return matched ? Math.max(0, Number(matched[1]) || 0) : 0;
};

export const containerCapacityLitersOfItem = (item) => (
  parseCapacityLitersFromText(item?.name || '')
  || parseCapacityLitersFromText(item?.desc || '')
  || 0
);

export const fuelJerrycanSizeClassByCapacity = (capacityLiters) => {
  const cap = Math.max(0, Number(capacityLiters) || 0);
  if (cap >= 30) return 'fuel-jerrycan--size-30';
  if (cap >= 20) return 'fuel-jerrycan--size-20';
  if (cap > 0) return 'fuel-jerrycan--size-10';
  return 'fuel-jerrycan--size-20';
};

export const containerLabelFromKey = (containerKey) => {
  const cap = parseCapacityLitersFromText(containerKey);
  if (cap > 0) return `빈말통 ${cap}L`;
  return String(containerKey || '빈말통');
};

export const resolveFuelContainerItem = ({
  items = [],
  inventory = {},
  canKey = '',
  targetCap = 0
}) => {
  const directOwnedQty = Math.max(0, Number(inventory?.[canKey]) || 0);
  if (directOwnedQty > 0) {
    return {
      key: canKey,
      name: containerLabelFromKey(canKey),
      unit: '개',
      __synthetic: true,
      __capacity: targetCap
    };
  }
  if (!items.length) {
    const inventoryKeys = Object.keys(inventory || {});
    const guessedKey = inventoryKeys.find((key) => {
      const qty = Math.max(0, Number(inventory?.[key]) || 0);
      if (qty <= 0) return false;
      if (targetCap > 0 && String(key).includes(String(targetCap))) return true;
      return false;
    });
    if (!guessedKey) return null;
    return {
      key: guessedKey,
      name: containerLabelFromKey(guessedKey),
      unit: '개',
      __synthetic: true,
      __capacity: targetCap || parseCapacityLitersFromText(guessedKey)
    };
  }
  const withMeta = items.map((item) => ({
    item,
    capacity: containerCapacityLitersOfItem(item),
    ownedQty: Math.max(0, Number(inventory?.[item?.key]) || 0)
  }));
  const exactOwned = withMeta.find((entry) => entry.capacity === targetCap && entry.ownedQty > 0);
  if (exactOwned) return exactOwned.item;
  const exactAny = withMeta.find((entry) => entry.capacity === targetCap);
  if (exactAny) return exactAny.item;
  const anyOwned = withMeta.find((entry) => entry.ownedQty > 0);
  if (anyOwned) return anyOwned.item;
  return withMeta[0]?.item || null;
};
