import { containerCapacityLitersOfItem, containerLabelFromKey } from './containerUtils';

const floorLiterNonNeg = (value) => (
  Math.max(0, Math.floor(((Number(value) || 0) * 100) + 1e-9) / 100)
);

export const LEGACY_CAN_KEY_TO_CONTAINER_KEY = Object.freeze({
  can10: 'containerCan10L',
  can20: 'containerCan20L',
  can30: 'containerCan30L'
});

const CONTAINER_KEY_TO_LEGACY_CAN_KEY = Object.freeze(
  Object.entries(LEGACY_CAN_KEY_TO_CONTAINER_KEY).reduce((acc, [legacyKey, canonicalKey]) => ({
    ...acc,
    [canonicalKey]: legacyKey
  }), {})
);

export const normalizeFuelContainerKey = (containerKey) => {
  const key = String(containerKey || '');
  if (!key) return '';
  return LEGACY_CAN_KEY_TO_CONTAINER_KEY[key] || key;
};

const mergedFuelMapForContainer = (fuelStorageByContainer = {}, containerKey) => {
  const canonicalKey = normalizeFuelContainerKey(containerKey);
  if (!canonicalKey) return {};
  const merged = {};
  const aliasKeys = [canonicalKey, CONTAINER_KEY_TO_LEGACY_CAN_KEY[canonicalKey]].filter(Boolean);
  aliasKeys.forEach((key) => {
    const fuelMap = fuelStorageByContainer?.[key];
    if (!fuelMap || typeof fuelMap !== 'object') return;
    Object.entries(fuelMap).forEach(([fuelKey, liters]) => {
      if (!fuelKey) return;
      merged[fuelKey] = floorLiterNonNeg((merged[fuelKey] || 0) + floorLiterNonNeg(liters));
    });
  });
  return merged;
};

const inventoryQtyByContainerKey = (inventory = {}, containerKey) => {
  const canonicalKey = normalizeFuelContainerKey(containerKey);
  if (!canonicalKey) return 0;
  const legacyKey = CONTAINER_KEY_TO_LEGACY_CAN_KEY[canonicalKey];
  return Math.max(0, Number(inventory?.[canonicalKey] || 0) + Number(legacyKey ? (inventory?.[legacyKey] || 0) : 0));
};

export const FUEL_KIOSK_CAN_OPTIONS = [
  { key: 'containerCan10L', label: '빈말통 10L', capacity: 10 },
  { key: 'containerCan20L', label: '빈말통 20L', capacity: 20 },
  { key: 'containerCan30L', label: '빈말통 30L', capacity: 30 }
];

const activeFuelNameFromKey = (fuelKey, fuelItemNameMap = {}) => {
  if (/gasoline/i.test(fuelKey)) return '휘발유';
  if (/diesel/i.test(fuelKey)) return '경유';
  if (/kerosene/i.test(fuelKey)) return '등유';
  return fuelItemNameMap[fuelKey] || fuelKey;
};

export const buildFuelKioskAvailableCanOptions = ({
  game,
  baseContainerItems = [],
  fuelKioskVisualFuelKey = '',
  fuelItemNameMap = {},
  inventoryByContainer = null,
  fuelStorageByContainer = null
}) => {
  if (!game && !inventoryByContainer) return [];
  const inventorySource = (
    inventoryByContainer && typeof inventoryByContainer === 'object'
      ? inventoryByContainer
      : (game?.inventory || {})
  );
  const fuelStorageSource = (
    fuelStorageByContainer && typeof fuelStorageByContainer === 'object'
      ? fuelStorageByContainer
      : (game?.fuelStorageByContainer || {})
  );

  const byKey = {};
  baseContainerItems.forEach((item) => {
    const canonicalKey = normalizeFuelContainerKey(item?.key);
    if (!canonicalKey) return;
    byKey[canonicalKey] = {
      key: canonicalKey,
      label: String(item.name || containerLabelFromKey(item.key)),
      capacityPerUnit: Math.max(0, containerCapacityLitersOfItem(item)),
      qty: inventoryQtyByContainerKey(inventorySource, canonicalKey)
    };
  });

  FUEL_KIOSK_CAN_OPTIONS.forEach((option) => {
    const key = normalizeFuelContainerKey(option.key);
    if (byKey[key]) return;
    byKey[key] = {
      key,
      label: option.label,
      capacityPerUnit: Math.max(0, Number(option.capacity) || 0),
      qty: inventoryQtyByContainerKey(inventorySource, key)
    };
  });

  return Object.values(byKey)
    .filter((entry) => entry.qty > 0 && entry.capacityPerUnit > 0)
    .flatMap((entry) => {
      const cap = entry.capacityPerUnit;
      const totalCapacity = cap * entry.qty;
      const fuelMap = mergedFuelMapForContainer(fuelStorageSource, entry.key);
      const totalStored = floorLiterNonNeg(
        Math.max(0, Math.min(totalCapacity, Object.values(fuelMap).reduce((sum, liters) => sum + floorLiterNonNeg(liters), 0)))
      );
      const sameFuelStored = floorLiterNonNeg(fuelMap?.[fuelKioskVisualFuelKey]);
      const otherFuelStored = floorLiterNonNeg(Math.max(0, totalStored - sameFuelStored));

      const sameFullCanCount = Math.min(entry.qty, Math.floor(sameFuelStored / cap));
      const samePartialLiters = floorLiterNonNeg(sameFuelStored - (sameFullCanCount * cap));
      const samePartialCanCount = samePartialLiters > 0 ? 1 : 0;
      const remainCanSlots = Math.max(0, entry.qty - sameFullCanCount - samePartialCanCount);
      const otherFullCanCount = Math.min(remainCanSlots, Math.floor(otherFuelStored / cap));
      const otherPartialLiters = floorLiterNonNeg(otherFuelStored - (otherFullCanCount * cap));
      const otherPartialCanCount = otherPartialLiters > 0 && (remainCanSlots - otherFullCanCount) > 0 ? 1 : 0;
      const emptyCanCount = Math.max(0, remainCanSlots - otherFullCanCount - otherPartialCanCount);

      const samePartialRemain = floorLiterNonNeg(Math.max(0, cap - samePartialLiters));
      const totalStorableRemain = floorLiterNonNeg(
        Math.max(0, (emptyCanCount * cap) + (samePartialCanCount > 0 ? samePartialRemain : 0))
      );
      const fuelName = activeFuelNameFromKey(fuelKioskVisualFuelKey, fuelItemNameMap);

      const options = [];

      if (sameFullCanCount > 0) {
        const fullLabel = `말통 ${cap}L/${cap}L (${fuelName})`;
        options.push({
          ...entry,
          optionKey: `${entry.key}__full`,
          qty: sameFullCanCount,
          totalCapacity,
          totalStored,
          sameFuelStored: cap,
          sameFuelStoredPerCan: cap,
          activeFuelKey: String(fuelKioskVisualFuelKey || ''),
          storableRemain: 0,
          targetCanRemain: 0,
          displayLabel: fullLabel,
          optionLabel: `${fullLabel} (${sameFullCanCount}개 보유 · 추가 0L)`
        });
      }

      if (samePartialCanCount > 0 && samePartialRemain > 0) {
        const partialLabel = `말통 ${samePartialLiters}L/${cap}L (${fuelName})`;
        options.push({
          ...entry,
          optionKey: `${entry.key}__partial`,
          qty: 1,
          totalCapacity,
          totalStored,
          sameFuelStored: samePartialLiters,
          sameFuelStoredPerCan: samePartialLiters,
          activeFuelKey: String(fuelKioskVisualFuelKey || ''),
          storableRemain: samePartialRemain,
          targetCanRemain: samePartialRemain,
          displayLabel: partialLabel,
          optionLabel: `${partialLabel} (1개 보유 · 추가 ${samePartialRemain}L)`
        });
      }

      if (otherFullCanCount > 0) {
        const otherFuelKey = String(
          Object.entries(fuelMap || {})
            .filter(([fuelKey]) => String(fuelKey || '') !== String(fuelKioskVisualFuelKey || ''))
            .sort((a, b) => floorLiterNonNeg(b?.[1]) - floorLiterNonNeg(a?.[1]))?.[0]?.[0]
          || ''
        );
        const otherFuelName = activeFuelNameFromKey(otherFuelKey, fuelItemNameMap);
        const fullLabel = `${otherFuelName}말통(${cap}L/${cap}L)`;
        options.push({
          ...entry,
          optionKey: `${entry.key}__other_full`,
          qty: otherFullCanCount,
          totalCapacity,
          totalStored,
          sameFuelStored: cap,
          sameFuelStoredPerCan: cap,
          activeFuelKey: otherFuelKey,
          storableRemain: 0,
          targetCanRemain: 0,
          displayLabel: fullLabel,
          optionLabel: `${fullLabel} (${otherFullCanCount}개 보유 · 추가 0L)`
        });
      }

      if (otherPartialCanCount > 0) {
        const otherFuelKey = String(
          Object.entries(fuelMap || {})
            .filter(([fuelKey]) => String(fuelKey || '') !== String(fuelKioskVisualFuelKey || ''))
            .sort((a, b) => floorLiterNonNeg(b?.[1]) - floorLiterNonNeg(a?.[1]))?.[0]?.[0]
          || ''
        );
        const otherFuelName = activeFuelNameFromKey(otherFuelKey, fuelItemNameMap);
        const partialLabel = `${otherFuelName}말통(${otherPartialLiters}L/${cap}L)`;
        options.push({
          ...entry,
          optionKey: `${entry.key}__other_partial`,
          qty: 1,
          totalCapacity,
          totalStored,
          sameFuelStored: otherPartialLiters,
          sameFuelStoredPerCan: otherPartialLiters,
          activeFuelKey: otherFuelKey,
          storableRemain: 0,
          targetCanRemain: 0,
          displayLabel: partialLabel,
          optionLabel: `${partialLabel} (1개 보유 · 추가 0L)`
        });
      }

      if (emptyCanCount > 0) {
        const emptyRemain = emptyCanCount * cap;
        const emptyLabel = `빈말통 ${cap}L`;
        options.push({
          ...entry,
          optionKey: `${entry.key}__empty`,
          qty: emptyCanCount,
          totalCapacity,
          totalStored,
          sameFuelStored: 0,
          sameFuelStoredPerCan: 0,
          activeFuelKey: '',
          storableRemain: emptyRemain,
          targetCanRemain: cap,
          displayLabel: emptyLabel,
          optionLabel: `${emptyLabel} (${emptyCanCount}개 보유 · 추가 ${emptyRemain}L)`
        });
      }

      return options;
    })
    .sort((a, b) => b.storableRemain - a.storableRemain);
};

export const fuelKioskCanFillRatioFromLabel = (label) => {
  const text = String(label || '');
  const pair = text.match(/(\d+(?:\.\d+)?)L\/(\d+(?:\.\d+)?)L/);
  if (pair) {
    const filled = floorLiterNonNeg(pair[1]);
    const cap = floorLiterNonNeg(pair[2]);
    return cap > 0 ? Math.max(0, Math.min(1, filled / cap)) : 0;
  }
  return 0;
};

export const pickCanKeyByLiters = (liters) => {
  const qty = Math.max(0, Math.floor(Number(liters) || 0));
  return FUEL_KIOSK_CAN_OPTIONS.find((option) => qty <= option.capacity)?.key
    || FUEL_KIOSK_CAN_OPTIONS[FUEL_KIOSK_CAN_OPTIONS.length - 1].key;
};
