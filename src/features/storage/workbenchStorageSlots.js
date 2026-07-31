const WORKBENCH_CARGO_SLOT_STRIDE = 32;
const WORKBENCH_CARGO_STORAGE_SLOT_BASE = 1000;
const SORTING_CARGO_SLOT_STRIDE = 32;
const SORTING_CARGO_STORAGE_SLOT_BASE = 2000;

const parseTrailingSlotNo = (value, fallback = 0) => {
  const text = String(value || '');
  const matched = text.match(/(\d+)\s*$/);
  return matched ? Math.max(0, Math.floor(Number(matched[1]) || 0)) : fallback;
};

export const workbenchCargoStorageSlotNoOf = (workbenchSlotKeyRaw, cargoSlotKeyRaw) => {
  const workbenchSlotNo = parseTrailingSlotNo(workbenchSlotKeyRaw, 0);
  const cargoSlotNo = parseTrailingSlotNo(cargoSlotKeyRaw, 0);
  if (workbenchSlotNo <= 0 || cargoSlotNo <= 0) return 0;
  return WORKBENCH_CARGO_STORAGE_SLOT_BASE
    + ((workbenchSlotNo - 1) * WORKBENCH_CARGO_SLOT_STRIDE)
    + cargoSlotNo;
};

export const sortingCargoStorageSlotNoOf = (sortingSlotKeyRaw, cargoSlotKeyRaw) => {
  const sortingSlotNo = parseTrailingSlotNo(sortingSlotKeyRaw, 0);
  const cargoSlotNo = parseTrailingSlotNo(cargoSlotKeyRaw, 0);
  if (sortingSlotNo <= 0 || cargoSlotNo <= 0) return 0;
  return SORTING_CARGO_STORAGE_SLOT_BASE
    + ((sortingSlotNo - 1) * SORTING_CARGO_SLOT_STRIDE)
    + cargoSlotNo;
};

export const parseWorkbenchCargoStorageSlotNo = (slotNoRaw) => {
  const slotNo = Math.max(0, Math.floor(Number(slotNoRaw) || 0));
  if (slotNo < WORKBENCH_CARGO_STORAGE_SLOT_BASE) return null;
  const relative = slotNo - WORKBENCH_CARGO_STORAGE_SLOT_BASE;
  const workbenchSlotNo = Math.floor(relative / WORKBENCH_CARGO_SLOT_STRIDE) + 1;
  const cargoSlotNo = (relative % WORKBENCH_CARGO_SLOT_STRIDE) + 1;
  if (workbenchSlotNo <= 0 || cargoSlotNo <= 0) return null;
  return {
    workbenchSlotNo,
    cargoSlotNo
  };
};

export const buildWorkbenchCargoSlotEntry = ({
  storageSlotNo: storageSlotNoRaw,
  savedSlotsRaw = [],
  storedHarvestSlotsByNo = {},
  storedFloorRowsBySlot = {},
  buildHarvestPalletSlotEntries,
}) => {
  const storageSlotNo = Math.max(1, Math.floor(Number(storageSlotNoRaw) || 0));
  if (storageSlotNo <= 0 || typeof buildHarvestPalletSlotEntries !== 'function') return null;
  const savedEntry = Array.isArray(savedSlotsRaw) ? (savedSlotsRaw[storageSlotNo - 1] || null) : null;
  const storedHarvestEntry = storedHarvestSlotsByNo?.[storageSlotNo] || null;
  const storedFloorRow = storedFloorRowsBySlot?.[storageSlotNo] || null;
  const normalizedEntry = buildHarvestPalletSlotEntries({
    slotCount: 1,
    savedSlotsRaw: [savedEntry],
    storedHarvestSlotsByNo: storedHarvestEntry ? { 1: storedHarvestEntry } : {},
    storedFloorRowsBySlot: storedFloorRow ? { 1: storedFloorRow } : {},
    legacyHarvestKg: 0,
  })?.[0] || null;
  if (!normalizedEntry) return null;
  return {
    ...normalizedEntry,
    slotNo: storageSlotNo,
    topLayer: normalizedEntry?.topLayer
      ? {
        ...normalizedEntry.topLayer,
        slotNo: storageSlotNo,
      }
      : null,
  };
};

export const buildSortingCargoSlotEntry = buildWorkbenchCargoSlotEntry;
