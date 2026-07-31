const DEFAULT_HARVEST_PALLET_BOX_COUNT = 36;
const DEFAULT_HARVEST_PALLET_COLUMN_COUNT = 6;

export const harvestPalletDisplayBoxIndexOf = (
  displayIndex,
  columnCount = DEFAULT_HARVEST_PALLET_COLUMN_COUNT,
  maxBoxes = DEFAULT_HARVEST_PALLET_BOX_COUNT
) => {
  const safeIndex = Math.max(0, Math.floor(Number(displayIndex) || 0));
  const safeColumns = Math.max(1, Math.floor(Number(columnCount) || 1));
  const safeMaxBoxes = Math.max(1, Math.floor(Number(maxBoxes) || DEFAULT_HARVEST_PALLET_BOX_COUNT));
  const rowCount = Math.max(1, Math.ceil(safeMaxBoxes / safeColumns));
  const rowIndex = Math.floor(safeIndex / safeColumns);
  const columnIndex = safeIndex % safeColumns;
  return ((rowCount - 1 - rowIndex) * safeColumns) + columnIndex;
};

export const buildHarvestPalletSlotMeta = ({
  entries = [],
  maxBoxes = DEFAULT_HARVEST_PALLET_BOX_COUNT,
  getVisualSlotNo = (entry) => entry?.visualSlotNo,
  getSortValue = (entry) => entry?.sortValue,
  getEntryMeta = (entry) => entry,
} = {}) => {
  const safeMaxBoxes = Math.max(1, Math.floor(Number(maxBoxes) || DEFAULT_HARVEST_PALLET_BOX_COUNT));
  const slots = Array.from({ length: safeMaxBoxes }, (_, index) => ({
    visualSlotNo: index + 1,
    filled: false,
  }));
  const normalizedEntries = (Array.isArray(entries) ? entries : [])
    .map((entry, index) => {
      const visualSlotNo = Math.max(0, Math.floor(Number(getVisualSlotNo(entry)) || 0));
      return {
        entry,
        index,
        visualSlotNo: visualSlotNo >= 1 && visualSlotNo <= safeMaxBoxes ? visualSlotNo : 0,
        sortValue: Math.max(0, Math.floor(Number(getSortValue(entry)) || 0)),
      };
    })
    .sort((a, b) => (
      (a.visualSlotNo || Number.MAX_SAFE_INTEGER) - (b.visualSlotNo || Number.MAX_SAFE_INTEGER)
    ) || (
      a.sortValue - b.sortValue
    ) || (
      a.index - b.index
    ));
  const unplacedEntries = [];
  normalizedEntries.forEach((entry) => {
    if (entry.visualSlotNo > 0 && !slots[entry.visualSlotNo - 1].filled) {
      slots[entry.visualSlotNo - 1] = {
        ...slots[entry.visualSlotNo - 1],
        ...getEntryMeta(entry.entry),
        visualSlotNo: entry.visualSlotNo,
        filled: true,
      };
      return;
    }
    unplacedEntries.push(entry);
  });
  let nextEmptyIndex = 0;
  unplacedEntries.forEach((entry) => {
    while (nextEmptyIndex < slots.length && slots[nextEmptyIndex].filled) {
      nextEmptyIndex += 1;
    }
    if (nextEmptyIndex >= slots.length) return;
    slots[nextEmptyIndex] = {
      ...slots[nextEmptyIndex],
      ...getEntryMeta(entry.entry),
      visualSlotNo: nextEmptyIndex + 1,
      filled: true,
    };
    nextEmptyIndex += 1;
  });
  return slots;
};
