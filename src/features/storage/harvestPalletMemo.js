export const DEFAULT_HARVEST_PALLET_MEMO_COLOR = 'mint';

export const HARVEST_PALLET_MEMO_COLOR_OPTIONS = Object.freeze([
  {
    key: 'mint',
    label: '연두',
    bg: 'linear-gradient(180deg, rgba(241, 254, 236, 0.98), rgba(216, 242, 207, 0.96))',
    bgHover: 'linear-gradient(180deg, rgba(248, 255, 244, 0.99), rgba(224, 246, 215, 0.98))',
    border: 'rgba(61, 128, 89, 0.3)',
    text: '#1d6b43',
  },
  {
    key: 'amber',
    label: '노랑',
    bg: 'linear-gradient(180deg, rgba(255, 248, 224, 0.99), rgba(247, 226, 165, 0.97))',
    bgHover: 'linear-gradient(180deg, rgba(255, 251, 234, 0.99), rgba(249, 232, 182, 0.98))',
    border: 'rgba(176, 130, 38, 0.32)',
    text: '#8b5a06',
  },
  {
    key: 'sky',
    label: '하늘',
    bg: 'linear-gradient(180deg, rgba(234, 247, 255, 0.99), rgba(201, 231, 250, 0.97))',
    bgHover: 'linear-gradient(180deg, rgba(242, 251, 255, 1), rgba(212, 237, 252, 0.98))',
    border: 'rgba(63, 131, 181, 0.28)',
    text: '#215f8d',
  },
  {
    key: 'rose',
    label: '분홍',
    bg: 'linear-gradient(180deg, rgba(255, 239, 243, 0.99), rgba(247, 212, 221, 0.97))',
    bgHover: 'linear-gradient(180deg, rgba(255, 245, 247, 1), rgba(250, 221, 229, 0.98))',
    border: 'rgba(177, 88, 117, 0.28)',
    text: '#8e3d58',
  },
  {
    key: 'slate',
    label: '회청',
    bg: 'linear-gradient(180deg, rgba(240, 244, 247, 0.99), rgba(214, 224, 232, 0.97))',
    bgHover: 'linear-gradient(180deg, rgba(246, 249, 252, 1), rgba(223, 231, 238, 0.98))',
    border: 'rgba(84, 104, 122, 0.28)',
    text: '#355061',
  },
]);

export function normalizeHarvestPalletMemoColor(colorRaw = '') {
  const color = String(colorRaw || '').trim();
  return HARVEST_PALLET_MEMO_COLOR_OPTIONS.some((option) => option.key === color)
    ? color
    : DEFAULT_HARVEST_PALLET_MEMO_COLOR;
}

export function resolveHarvestPalletMemoLayer(raw = null) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const text = String(raw?.text ?? raw?.memo ?? raw?.value ?? '').trim();
    return {
      text,
      color: normalizeHarvestPalletMemoColor(raw?.color),
    };
  }
  return {
    text: String(raw || '').trim(),
    color: DEFAULT_HARVEST_PALLET_MEMO_COLOR,
  };
}

export function resolveHarvestPalletMemoSlot(raw = null) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const bottom = resolveHarvestPalletMemoLayer(raw?.bottom);
    const top = resolveHarvestPalletMemoLayer(raw?.top);
    if (!bottom.text && !top.text) return null;
    return { bottom, top };
  }
  const legacyBottom = resolveHarvestPalletMemoLayer(raw);
  if (!legacyBottom.text) return null;
  return {
    bottom: legacyBottom,
    top: resolveHarvestPalletMemoLayer(null),
  };
}

export function buildHarvestPalletMemoColorStyle(colorRaw = '') {
  const option = HARVEST_PALLET_MEMO_COLOR_OPTIONS.find(
    (entry) => entry.key === normalizeHarvestPalletMemoColor(colorRaw)
  ) || HARVEST_PALLET_MEMO_COLOR_OPTIONS[0];
  return {
    '--harvest-pallet-memo-bg': option.bg,
    '--harvest-pallet-memo-bg-hover': option.bgHover,
    '--harvest-pallet-memo-border': option.border,
    '--harvest-pallet-memo-text': option.text,
  };
}
