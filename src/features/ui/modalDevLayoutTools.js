const DEV_MODAL_LAYOUT_STORAGE_KEY_PREFIX = 'orchard_dev_modal_layout_cache_v3';
const DEV_MODAL_LAYOUT_MANIFEST_STORAGE_KEY_PREFIX = 'orchard_dev_modal_layout_manifest_cache_v1';
const DEV_MODAL_LAYOUT_META_STORAGE_KEY_PREFIX = 'orchard_dev_modal_layout_meta_cache_v1';
const DEV_MODAL_MOTION_STORAGE_KEY_PREFIX = 'orchard_dev_modal_motion_cache_v1';
const DEV_MODAL_LAYOUT_ENDPOINT = '/__dev-modal-layout';
const DEV_MODAL_LAYOUT_MIGRATION_KEY_PREFIX = 'orchard_dev_modal_layout_migration_v4';
const DEV_MODAL_LAYOUT_SHARED_KEY = 'global';
const DEV_UI_DRAWER_ID = 'orchard-dev-ui-drawer';
const DEV_UI_LAUNCHER_ID = 'orchard-dev-ui-launcher';
const DEV_UI_RESIZE_HANDLE_CLASS = 'ui-dev-resize-handle';
const DEV_MODAL_LAYOUT_MODE = 'translate-only';

const EXPLICIT_TARGET_SELECTOR = [
  '.confirm-modal--harvest-transport',
  '.confirm-modal--harvest-transport-side',
  '.harvest-plan-modal-cluster',
  '.harvest-plan-dual-modal-wrap',
  '.map-shop-dual-modal',
  '.confirm-modal--warehouse-storage-left',
  '.confirm-modal--warehouse-storage-right',
  '.slot-picker'
].join(', ');

const INNER_TARGET_SELECTOR = [
  '.confirm-modal .panel',
  '.confirm-modal .panel-card',
  '.confirm-modal .option-card',
  '.confirm-modal .harvest-plan-labor-meter',
  '.confirm-modal [class$="-panel"]',
  '.confirm-modal [class*="-panel "]',
  '.confirm-modal [class$="-card"]',
  '.confirm-modal [class*="-card "]',
  '.slot-picker .panel',
  '.slot-picker .panel-card',
  '.slot-picker .option-card',
  '.slot-picker .harvest-plan-labor-meter',
  '.slot-picker [class$="-panel"]',
  '.slot-picker [class*="-panel "]',
  '.slot-picker [class$="-card"]',
  '.slot-picker [class*="-card "]'
].join(', ');

const TARGET_SELECTOR = [
  EXPLICIT_TARGET_SELECTOR,
  INNER_TARGET_SELECTOR,
  '.confirm-modal',
].join(', ');

const COMPOSITE_TARGET_SELECTOR = [
  '.harvest-plan-modal-cluster',
  '.harvest-plan-dual-modal-wrap',
  '.map-shop-dual-modal'
].join(', ');

const isCompositeTarget = (element) => Boolean(element?.matches?.(COMPOSITE_TARGET_SELECTOR));

const DEFAULT_LAYOUT = Object.freeze({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  opacity: 1,
  scale: 1,
  radius: 0,
  shadow: 18,
  background: ''
});
const DEFAULT_MOTION = Object.freeze({
  enterX: 120,
  exitX: 120,
  durationMs: 560,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
});

const cacheStorageKeyOf = () => `${DEV_MODAL_LAYOUT_STORAGE_KEY_PREFIX}:${DEV_MODAL_LAYOUT_SHARED_KEY}`;
const manifestStorageKeyOf = () => `${DEV_MODAL_LAYOUT_MANIFEST_STORAGE_KEY_PREFIX}:${DEV_MODAL_LAYOUT_SHARED_KEY}`;
const metaStorageKeyOf = () => `${DEV_MODAL_LAYOUT_META_STORAGE_KEY_PREFIX}:${DEV_MODAL_LAYOUT_SHARED_KEY}`;
const migrationStorageKeyOf = () => `${DEV_MODAL_LAYOUT_MIGRATION_KEY_PREFIX}:${DEV_MODAL_LAYOUT_SHARED_KEY}`;
const motionStorageKeyOf = () => `${DEV_MODAL_MOTION_STORAGE_KEY_PREFIX}:${DEV_MODAL_LAYOUT_SHARED_KEY}`;

const normalizeKeyPart = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^0-9a-zA-Z가-힣_-]+/g, '')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const sanitizeFiniteNumber = (value, fallback = 0) => (
  Number.isFinite(Number(value)) ? Number(value) : fallback
);

const sanitizeColor = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^#[0-9a-fA-F]{3,8}$/.test(raw)) return raw;
  if (/^rgba?\([^)]+\)$/.test(raw)) return raw;
  return '';
};

const modalTitleTextOf = (element) => {
  const direct = element?.querySelector?.(
    '.confirm-modal__title, .slot-picker__title, .harvest-transport-pallet-panel__header strong'
  )?.textContent;
  return String(direct || '').trim();
};

const buildTargetKey = (element) => {
  if (element?.matches?.('.confirm-modal--harvest-transport-side')) {
    return 'confirm-modal-harvest-transport-side';
  }
  const classNames = Array.from(element?.classList || []).filter((className) => (
    className !== 'confirm-modal' &&
    className !== 'slot-picker' &&
    !className.startsWith('ui-dev-') &&
    !className.startsWith('is-') &&
    !className.endsWith('--on')
  ));
  const preferredClassNames = classNames.filter((className) => (
    className.startsWith('confirm-modal--') ||
    className.startsWith('slot-picker--') ||
    className.endsWith('-modal') ||
    className.endsWith('-cluster') ||
    className.endsWith('__shell') ||
    className.includes('pallet-panel')
  ));
  const classPart = normalizeKeyPart(
    preferredClassNames.join('-') ||
    classNames.join('-') ||
    (element?.classList?.contains('slot-picker') ? 'slot-picker' : 'confirm-modal')
  );
  const titlePart = normalizeKeyPart(modalTitleTextOf(element));
  return [classPart, titlePart].filter(Boolean).join('::') || 'confirm-modal';
};

const buildTargetLabel = (element) => {
  const title = modalTitleTextOf(element);
  if (title) return title;
  if (element?.matches?.('.confirm-modal--harvest-transport-side')) return '팔레트 모달';
  const className = Array.from(element?.classList || []).find((name) => (
    name.startsWith('confirm-modal--') ||
    name.startsWith('slot-picker--') ||
    name.endsWith('-modal') ||
    name.endsWith('-cluster') ||
    name.endsWith('__shell') ||
    name.includes('pallet-panel')
  ));
  return className || '모달';
};

const isTransportLayoutKey = (key) => {
  const normalizedKey = String(key || '').trim();
  if (!normalizedKey) return false;
  const [classPartRaw = '', titlePartRaw = ''] = normalizedKey.split('::');
  const classPart = String(classPartRaw || '').trim();
  const titlePart = String(titlePartRaw || '').trim();
  return (
    classPart.includes('harvest-transport') ||
    normalizedKey === 'harvest-transport-modal-cluster__shell::수확' ||
    (titlePart === '수확' && classPart.includes('confirm-modal'))
  );
};

const isPersistableTransportLayoutKey = (key) => {
  const normalizedKey = String(key || '').trim();
  return normalizedKey.includes('harvest-transport-side');
};

const isTransportLayoutElement = (element) => {
  if (!element?.matches) return false;
  return element.matches(
    '.confirm-modal--harvest-transport, .confirm-modal--harvest-transport-side, .harvest-transport-modal-cluster__shell'
  );
};

const sanitizeLayout = (value) => ({
  x: Number.isFinite(Number(value?.x)) ? Math.round(Number(value.x)) : 0,
  y: Number.isFinite(Number(value?.y)) ? Math.round(Number(value.y)) : 0,
  width: Number.isFinite(Number(value?.width)) ? Math.max(0, Math.round(Number(value.width))) : 0,
  height: Number.isFinite(Number(value?.height)) ? Math.max(0, Math.round(Number(value.height))) : 0,
  opacity: Number.isFinite(Number(value?.opacity)) ? clamp(Number(value.opacity), 0.2, 1) : 1,
  scale: Number.isFinite(Number(value?.scale)) ? clamp(Number(value.scale), 0.6, 1.4) : 1,
  radius: Number.isFinite(Number(value?.radius)) ? Math.max(0, Math.round(Number(value.radius))) : 0,
  shadow: Number.isFinite(Number(value?.shadow)) ? Math.max(0, Math.round(Number(value.shadow))) : 18,
  background: sanitizeColor(value?.background)
});

const sanitizeRectSnapshot = (value) => {
  if (!value || typeof value !== 'object') return null;
  return {
    left: Math.round(sanitizeFiniteNumber(value.left, 0) * 100) / 100,
    top: Math.round(sanitizeFiniteNumber(value.top, 0) * 100) / 100,
    width: Math.round(Math.max(0, sanitizeFiniteNumber(value.width, 0)) * 100) / 100,
    height: Math.round(Math.max(0, sanitizeFiniteNumber(value.height, 0)) * 100) / 100,
    right: Math.round(sanitizeFiniteNumber(value.right, 0) * 100) / 100,
    bottom: Math.round(sanitizeFiniteNumber(value.bottom, 0) * 100) / 100
  };
};

const sanitizeViewportSnapshot = (value) => {
  if (!value || typeof value !== 'object') return null;
  return {
    width: Math.max(0, Math.round(sanitizeFiniteNumber(value.width, 0))),
    height: Math.max(0, Math.round(sanitizeFiniteNumber(value.height, 0)))
  };
};

const sanitizeCssSnapshot = (value) => {
  if (!value || typeof value !== 'object') return null;
  return {
    position: String(value.position || '').trim(),
    left: String(value.left || '').trim(),
    top: String(value.top || '').trim(),
    right: String(value.right || '').trim(),
    bottom: String(value.bottom || '').trim(),
    width: String(value.width || '').trim(),
    height: String(value.height || '').trim(),
    maxWidth: String(value.maxWidth || '').trim(),
    maxHeight: String(value.maxHeight || '').trim(),
    translate: String(value.translate || '').trim(),
    transform: String(value.transform || '').trim(),
    transformOrigin: String(value.transformOrigin || '').trim()
  };
};

const sanitizeTranslateSnapshot = (value) => {
  if (!value || typeof value !== 'object') return null;
  return {
    x: Math.round(sanitizeFiniteNumber(value.x, 0)),
    y: Math.round(sanitizeFiniteNumber(value.y, 0)),
    value: String(value.value || '').trim()
  };
};

const inferAnchorFromCssSnapshot = (cssSnapshot) => {
  const css = sanitizeCssSnapshot(cssSnapshot);
  if (!css) return 'unknown';
  const transformText = `${css.transform} ${css.translate}`.toLowerCase();
  if (transformText.includes('-50%')) return 'center';
  if (css.left && css.top) return 'top-left';
  if (css.right && css.top) return 'top-right';
  if (css.left && css.bottom) return 'bottom-left';
  if (css.right && css.bottom) return 'bottom-right';
  return 'custom';
};

const captureRectSnapshot = (element) => {
  if (!element?.getBoundingClientRect) return null;
  const rect = element.getBoundingClientRect();
  return sanitizeRectSnapshot(rect);
};

const captureParentRectSnapshot = (element) => {
  const parent = element?.offsetParent || element?.parentElement || null;
  if (!parent?.getBoundingClientRect) return null;
  return sanitizeRectSnapshot(parent.getBoundingClientRect());
};

const captureViewportSnapshot = () => sanitizeViewportSnapshot({
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  height: typeof window !== 'undefined' ? window.innerHeight : 0
});

const captureCssSnapshot = (element) => {
  if (typeof window === 'undefined' || !element) return null;
  const style = window.getComputedStyle(element);
  return sanitizeCssSnapshot({
    position: style.position,
    left: style.left,
    top: style.top,
    right: style.right,
    bottom: style.bottom,
    width: style.width,
    height: style.height,
    maxWidth: style.maxWidth,
    maxHeight: style.maxHeight,
    translate: style.translate,
    transform: style.transform,
    transformOrigin: style.transformOrigin
  });
};

const buildLayoutDebugSnapshot = (element, layout) => {
  const safeLayout = sanitizeLayout(layout);
  const cssSnapshot = captureCssSnapshot(element);
  return {
    version: 2,
    layoutMode: DEV_MODAL_LAYOUT_MODE,
    anchor: inferAnchorFromCssSnapshot(cssSnapshot),
    positionMode: String(cssSnapshot?.position || '').trim(),
    viewport: captureViewportSnapshot(),
    elementRect: captureRectSnapshot(element),
    parentRect: captureParentRectSnapshot(element),
    computedCss: cssSnapshot,
    appliedTranslate: sanitizeTranslateSnapshot({
      x: safeLayout.x,
      y: safeLayout.y,
      value: `${safeLayout.x}px ${safeLayout.y}px`
    }),
    delta: {
      x: safeLayout.x,
      y: safeLayout.y,
      width: safeLayout.width,
      height: safeLayout.height
    }
  };
};

const sanitizeLayoutMap = (raw) => {
  if (!raw || typeof raw !== 'object') return {};
  return Object.entries(raw).reduce((acc, [key, value]) => {
    const normalizedKey = String(key || '').trim();
    if (!normalizedKey || !value || typeof value !== 'object') return acc;
    if (isTransportLayoutKey(normalizedKey) && !isPersistableTransportLayoutKey(normalizedKey)) return acc;
    acc[normalizedKey] = sanitizeLayout(value);
    return acc;
  }, {});
};

const sanitizeLayoutManifestEntry = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const key = String(raw.key || '').trim();
  if (!key) return null;
  return {
    id: String(raw.id || '').trim() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    key,
    label: String(raw.label || '').trim(),
    saveName: String(raw.saveName || '').trim(),
    className: String(raw.className || '').trim(),
    titleText: String(raw.titleText || '').trim(),
    layout: sanitizeLayout(raw.layout || {}),
    debugSnapshot: (raw.debugSnapshot && typeof raw.debugSnapshot === 'object')
      ? {
          version: Math.max(1, Math.round(sanitizeFiniteNumber(raw.debugSnapshot.version, 1))),
          layoutMode: String(raw.debugSnapshot.layoutMode || '').trim() || DEV_MODAL_LAYOUT_MODE,
          anchor: String(raw.debugSnapshot.anchor || '').trim() || 'unknown',
          positionMode: String(raw.debugSnapshot.positionMode || '').trim(),
          viewport: sanitizeViewportSnapshot(raw.debugSnapshot.viewport),
          elementRect: sanitizeRectSnapshot(raw.debugSnapshot.elementRect),
          parentRect: sanitizeRectSnapshot(raw.debugSnapshot.parentRect),
          computedCss: sanitizeCssSnapshot(raw.debugSnapshot.computedCss),
          appliedTranslate: sanitizeTranslateSnapshot(raw.debugSnapshot.appliedTranslate),
          delta: sanitizeRectSnapshot({
            left: raw.debugSnapshot?.delta?.x,
            top: raw.debugSnapshot?.delta?.y,
            width: raw.debugSnapshot?.delta?.width,
            height: raw.debugSnapshot?.delta?.height,
            right: 0,
            bottom: 0
          }) && {
            x: Math.round(sanitizeFiniteNumber(raw.debugSnapshot?.delta?.x, 0)),
            y: Math.round(sanitizeFiniteNumber(raw.debugSnapshot?.delta?.y, 0)),
            width: Math.max(0, Math.round(sanitizeFiniteNumber(raw.debugSnapshot?.delta?.width, 0))),
            height: Math.max(0, Math.round(sanitizeFiniteNumber(raw.debugSnapshot?.delta?.height, 0)))
          }
        }
      : null,
    savedAt: String(raw.savedAt || '').trim(),
    timestamp: Number.isFinite(Number(raw.timestamp)) ? Number(raw.timestamp) : Date.now()
  };
};

const sanitizeLayoutManifest = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => sanitizeLayoutManifestEntry(entry))
    .filter(Boolean);
};

const readCachedLayoutManifest = (accountUsername) => {
  try {
    const raw = localStorage.getItem(manifestStorageKeyOf(accountUsername));
    return raw ? sanitizeLayoutManifest(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
};

const writeCachedLayoutManifest = (accountUsername, layoutManifest = []) => {
  try {
    localStorage.setItem(manifestStorageKeyOf(accountUsername), JSON.stringify(sanitizeLayoutManifest(layoutManifest)));
  } catch {
    // localStorage unavailable
  }
};

const clearCachedLayoutManifest = (accountUsername) => {
  try {
    localStorage.removeItem(manifestStorageKeyOf(accountUsername));
  } catch {
    // localStorage unavailable
  }
};

const sanitizeMotionPreset = (value) => ({
  enterX: Number.isFinite(Number(value?.enterX)) ? Math.round(Number(value.enterX)) : DEFAULT_MOTION.enterX,
  exitX: Number.isFinite(Number(value?.exitX)) ? Math.round(Number(value.exitX)) : DEFAULT_MOTION.exitX,
  durationMs: Number.isFinite(Number(value?.durationMs)) ? clamp(Math.round(Number(value.durationMs)), 120, 4000) : DEFAULT_MOTION.durationMs,
  easing: String(value?.easing || DEFAULT_MOTION.easing).trim() || DEFAULT_MOTION.easing
});

const sanitizeMotionPresetMap = (raw) => {
  if (!raw || typeof raw !== 'object') return {};
  return Object.entries(raw).reduce((acc, [key, value]) => {
    const normalizedKey = normalizeKeyPart(key);
    if (!normalizedKey || !value || typeof value !== 'object') return acc;
    acc[normalizedKey] = sanitizeMotionPreset(value);
    return acc;
  }, {});
};

const isTransportLayoutResetPending = (accountUsername) => {
  try {
    return localStorage.getItem(migrationStorageKeyOf(accountUsername)) !== 'transport-layout-reset';
  } catch {
    return true;
  }
};

const markTransportLayoutResetComplete = (accountUsername) => {
  try {
    localStorage.setItem(migrationStorageKeyOf(accountUsername), 'transport-layout-reset');
  } catch {
    // localStorage unavailable
  }
};

const resetLegacyTransportLayouts = (accountUsername, rawLayoutMap) => {
  const layoutMap = sanitizeLayoutMap(rawLayoutMap);
  if (!isTransportLayoutResetPending(accountUsername)) {
    return { changed: false, layoutMap };
  }
  let changed = false;
  const nextLayoutMap = { ...layoutMap };
  Object.keys(nextLayoutMap).forEach((key) => {
    const normalizedKey = String(key || '').trim();
    if (!normalizedKey) return;
    const shouldReset = isTransportLayoutKey(normalizedKey) && !isPersistableTransportLayoutKey(normalizedKey);
    if (!shouldReset) return;
    delete nextLayoutMap[normalizedKey];
    changed = true;
  });
  markTransportLayoutResetComplete(accountUsername);
  return { changed, layoutMap: nextLayoutMap };
};

const readCachedLayoutMap = (accountUsername) => {
  try {
    const raw = localStorage.getItem(cacheStorageKeyOf(accountUsername));
    return raw ? sanitizeLayoutMap(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
};

const writeCachedLayoutMap = (accountUsername, layoutMap) => {
  try {
    localStorage.setItem(cacheStorageKeyOf(accountUsername), JSON.stringify(sanitizeLayoutMap(layoutMap)));
  } catch {
    // localStorage unavailable
  }
};

const readCachedLayoutMeta = (accountUsername) => {
  try {
    const raw = localStorage.getItem(metaStorageKeyOf(accountUsername));
    if (!raw) return { saveName: '', savedAt: '' };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { saveName: '', savedAt: '' };
    return {
      saveName: String(parsed.saveName || '').trim(),
      savedAt: String(parsed.savedAt || '').trim()
    };
  } catch {
    return { saveName: '', savedAt: '' };
  }
};

const writeCachedLayoutMeta = (accountUsername, saveName = '', savedAt = '') => {
  try {
    const envelope = {
      saveName: String(saveName || '').trim(),
      savedAt: String(savedAt || '').trim()
    };
    localStorage.setItem(metaStorageKeyOf(accountUsername), JSON.stringify(envelope));
  } catch {
    // localStorage unavailable
  }
};

const clearCachedLayoutMeta = (accountUsername) => {
  try {
    localStorage.removeItem(metaStorageKeyOf(accountUsername));
  } catch {
    // localStorage unavailable
  }
};

const readCachedMotionPresetMap = (accountUsername) => {
  try {
    const raw = localStorage.getItem(motionStorageKeyOf(accountUsername));
    return raw ? sanitizeMotionPresetMap(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
};

const writeCachedMotionPresetMap = (accountUsername, motionPresetMap) => {
  try {
    localStorage.setItem(motionStorageKeyOf(accountUsername), JSON.stringify(sanitizeMotionPresetMap(motionPresetMap)));
  } catch {
    // localStorage unavailable
  }
};

const clearCachedLayoutMap = (accountUsername) => {
  try {
    localStorage.removeItem(cacheStorageKeyOf(accountUsername));
  } catch {
    // localStorage unavailable
  }
};

const sanitizeLayoutEnvelope = (payload) => {
  if (payload && typeof payload === 'object' && payload.layouts && typeof payload.layouts === 'object') {
    return {
      layouts: sanitizeLayoutMap(payload.layouts),
      saveName: String(payload.saveName || '').trim(),
      savedAt: String(payload.savedAt || '').trim()
    };
  }
  return {
    layouts: sanitizeLayoutMap(payload),
    saveName: '',
    savedAt: ''
  };
};

const loadSavedLayoutMap = async ({ accountUsername = '', canPersist = false } = {}) => {
  if (!canPersist) {
    return {
      layoutMap: {},
      manifest: [],
      saveName: '',
      savedAt: ''
    };
  }
  try {
    const response = await fetch(
      `${DEV_MODAL_LAYOUT_ENDPOINT}?username=${encodeURIComponent(String(accountUsername || ''))}`,
      { credentials: 'same-origin' }
    );
    if (!response.ok) throw new Error(`load_failed_${response.status}`);
    const payload = await response.json();
    const envelope = sanitizeLayoutEnvelope(payload?.layouts ?? payload);
    const layoutMap = envelope.layouts;
    const saveName = envelope.saveName || '';
    const savedAt = envelope.savedAt || '';
    const manifest = sanitizeLayoutManifest(payload?.layoutManifest || []);
    return {
      layoutMap,
      manifest,
      saveName,
      savedAt
    };
  } catch {
    return {
      layoutMap: {},
      manifest: [],
      saveName: '',
      savedAt: ''
    };
  }
};

const saveLayoutMap = async ({
  accountUsername = '',
  canPersist = false,
  layoutMap = {},
  saveName = '',
  savedAt = '',
  layoutManifest = []
} = {}) => {
  const sanitized = sanitizeLayoutMap(layoutMap);
  const manifest = sanitizeLayoutManifest(layoutManifest);
  if (!canPersist) return sanitized;
  try {
    await fetch(DEV_MODAL_LAYOUT_ENDPOINT, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        username: accountUsername,
        layouts: sanitized,
        saveName: String(saveName || '').trim(),
        savedAt: String(savedAt || '').trim(),
        layoutManifest: manifest
      })
    });
  } catch {
    // local cache already updated
  }
  return sanitized;
};

const applyLayoutToElement = (element, layout = DEFAULT_LAYOUT) => {
  if (!element) return;
  const next = { ...DEFAULT_LAYOUT, ...sanitizeLayout(layout) };
  const compositeTarget = isCompositeTarget(element);
  const usesTransformOffset = Boolean(element?.matches?.('.confirm-modal--harvest-transport-side'));
  element.dataset.devUiOffsetX = String(next.x);
  element.dataset.devUiOffsetY = String(next.y);
  element.dataset.devUiWidth = String(next.width);
  element.dataset.devUiHeight = String(next.height);
  element.dataset.devUiOpacity = String(next.opacity);
  element.dataset.devUiScale = String(next.scale);
  element.dataset.devUiRadius = String(next.radius);
  element.dataset.devUiShadow = String(next.shadow);
  element.dataset.devUiBackground = String(next.background || '');
  if (usesTransformOffset) {
    element.dataset.devUiUsesTransformOffset = '1';
    element.style.translate = '0px 0px';
    element.style.transform = 'none';
    element.style.left = `calc(100% + 12px + ${next.x}px)`;
    element.style.top = `${next.y}px`;
  } else {
    delete element.dataset.devUiUsesTransformOffset;
    element.style.removeProperty('left');
    element.style.removeProperty('top');
    element.style.removeProperty('transform');
    element.style.translate = `${next.x}px ${next.y}px`;
  }
  element.style.opacity = compositeTarget ? '1' : String(next.opacity);
  element.style.scale = compositeTarget ? '1' : String(next.scale);
  element.style.boxShadow = compositeTarget
    ? 'none'
    : `0 ${Math.max(8, Math.round(next.shadow * 0.8))}px ${Math.max(18, next.shadow * 2)}px rgba(35, 45, 33, 0.18)`;
  element.style.borderRadius = compositeTarget ? '' : (next.radius > 0 ? `${next.radius}px` : '');
  element.style.width = next.width > 0 ? `${next.width}px` : '';
  element.style.height = next.height > 0 ? `${next.height}px` : '';
  element.style.background = compositeTarget ? '' : (next.background || '');
};

const readElementLayout = (element) => ({
  x: Number(element?.dataset?.devUiOffsetX || 0) || 0,
  y: Number(element?.dataset?.devUiOffsetY || 0) || 0,
  width: Number(element?.dataset?.devUiWidth || 0) || 0,
  height: Number(element?.dataset?.devUiHeight || 0) || 0,
  opacity: Number(element?.dataset?.devUiOpacity || 1) || 1,
  scale: Number(element?.dataset?.devUiScale || 1) || 1,
  radius: Number(element?.dataset?.devUiRadius || 0) || 0,
  shadow: Number(element?.dataset?.devUiShadow || 18) || 18,
  background: String(element?.dataset?.devUiBackground || '')
});

const isVisibleTarget = (element) => {
  if (!element || !(element instanceof HTMLElement)) return false;
  if (element.closest(`#${DEV_UI_DRAWER_ID}`) || element.closest(`#${DEV_UI_LAUNCHER_ID}`)) return false;
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const isNestedGenericTarget = (element) => {
  if (!element?.matches?.('.confirm-modal')) return false;
  if (element.matches('.confirm-modal--harvest-transport, .confirm-modal--harvest-transport-side')) return false;
  const compositeParent = element.parentElement?.closest?.(COMPOSITE_TARGET_SELECTOR);
  return Boolean(compositeParent);
};

const currentVisibleTargetElements = () => Array.from(document.querySelectorAll(TARGET_SELECTOR))
  .filter(isVisibleTarget)
  .filter((element) => !isNestedGenericTarget(element));

const resolveEditableTarget = (eventTarget) => {
  if (!eventTarget?.closest) return null;
  const innerTarget = eventTarget.closest(INNER_TARGET_SELECTOR);
  if (innerTarget && isVisibleTarget(innerTarget)) return innerTarget;
  const explicitTarget = eventTarget.closest(EXPLICIT_TARGET_SELECTOR);
  if (explicitTarget && isVisibleTarget(explicitTarget)) return explicitTarget;
  const compositeTarget = eventTarget.closest(COMPOSITE_TARGET_SELECTOR);
  if (compositeTarget && isVisibleTarget(compositeTarget)) return compositeTarget;
  const directTarget = eventTarget.closest(TARGET_SELECTOR);
  if (!directTarget || !isVisibleTarget(directTarget)) return null;
  if (isNestedGenericTarget(directTarget)) {
    const parentComposite = directTarget.parentElement?.closest?.(COMPOSITE_TARGET_SELECTOR);
    if (parentComposite && isVisibleTarget(parentComposite)) return parentComposite;
  }
  return directTarget;
};

const createNumberInput = ({ min, max, step, value, onChange }) => {
  const wrap = document.createElement('div');
  wrap.className = 'ui-dev-drawer__number-control';

  const range = document.createElement('input');
  range.type = 'range';
  range.className = 'ui-dev-drawer__range';
  if (min !== undefined) range.min = String(min);
  if (max !== undefined) range.max = String(max);
  if (step !== undefined) range.step = String(step);
  range.value = String(value);

  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'ui-dev-drawer__input ui-dev-drawer__input--number';
  if (min !== undefined) input.min = String(min);
  if (max !== undefined) input.max = String(max);
  if (step !== undefined) input.step = String(step);
  input.value = String(value);

  const syncValue = (nextValue, source = 'input') => {
    const normalized = String(nextValue ?? '');
    if (source !== 'range') range.value = normalized;
    if (source !== 'input') input.value = normalized;
    onChange(normalized, { skipRenderControls: source === 'range' || source === 'input' });
  };

  range.addEventListener('input', () => syncValue(range.value, 'range'));
  input.addEventListener('input', () => syncValue(input.value, 'input'));
  range.addEventListener('change', () => onChange(range.value, { skipRenderControls: false }));
  input.addEventListener('change', () => onChange(input.value, { skipRenderControls: false }));

  wrap.appendChild(range);
  wrap.appendChild(input);
  return wrap;
};

const createTextInput = ({ value, placeholder, onChange }) => {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'ui-dev-drawer__input';
  input.value = String(value || '');
  input.placeholder = placeholder;
  input.addEventListener('input', () => onChange(input.value));
  return input;
};

const RESIZE_DIRECTIONS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

export const installSavedModalLayouts = ({ accountUsername = '' } = {}) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const normalizedAccountUsername = DEV_MODAL_LAYOUT_SHARED_KEY;
  const canPersist = true;
  let destroyed = false;
  let syncFrame = 0;
  let layoutMap = {};
  const touchedElements = new Set();

  const resetLayoutFromElement = (element) => {
    if (!element) return;
    element.style.removeProperty('left');
    element.style.removeProperty('top');
    element.style.removeProperty('translate');
    element.style.removeProperty('transform');
    element.style.removeProperty('opacity');
    element.style.removeProperty('scale');
    element.style.removeProperty('box-shadow');
    element.style.removeProperty('border-radius');
    element.style.removeProperty('width');
    element.style.removeProperty('height');
    element.style.removeProperty('background');
    delete element.dataset.devUiOffsetX;
    delete element.dataset.devUiOffsetY;
    delete element.dataset.devUiWidth;
    delete element.dataset.devUiHeight;
    delete element.dataset.devUiOpacity;
    delete element.dataset.devUiScale;
    delete element.dataset.devUiRadius;
    delete element.dataset.devUiShadow;
    delete element.dataset.devUiBackground;
    delete element.dataset.devUiUsesTransformOffset;
  };

  const syncTargetStyles = () => {
    syncFrame = 0;
    if (destroyed) return;
    const layoutKeys = Object.keys(layoutMap || {});
    if (!layoutKeys.length) return;
    currentVisibleTargetElements()
      .forEach((element) => {
        const key = buildTargetKey(element);
        if (isTransportLayoutElement(element) && !isPersistableTransportLayoutKey(key)) return;
        if (!layoutMap[key]) return;
        applyLayoutToElement(element, layoutMap[key]);
        touchedElements.add(element);
      });
  };

  const requestSync = () => {
    if (destroyed || syncFrame) return;
    syncFrame = window.requestAnimationFrame(syncTargetStyles);
  };

  loadSavedLayoutMap({
    accountUsername: normalizedAccountUsername,
    canPersist
  }).then(async (loaded) => {
    if (destroyed) return;
    const migrated = resetLegacyTransportLayouts(normalizedAccountUsername, loaded?.layoutMap || {});
    layoutMap = migrated.layoutMap;
    if (migrated.changed) {
      layoutMap = await saveLayoutMap({
        accountUsername: normalizedAccountUsername,
        canPersist,
        layoutMap
      });
      if (destroyed) return;
    }
    requestSync();
  });

  const observer = new MutationObserver(() => {
    requestSync();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', requestSync);

  return () => {
    destroyed = true;
    if (syncFrame) {
      window.cancelAnimationFrame(syncFrame);
      syncFrame = 0;
    }
    observer.disconnect();
    window.removeEventListener('resize', requestSync);
    touchedElements.forEach((element) => resetLayoutFromElement(element));
    touchedElements.clear();
  };
};

export const installModalDevLayoutTools = ({ enabled = false, accountUsername = '' } = {}) => {
  if (!enabled || typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const normalizedAccountUsername = DEV_MODAL_LAYOUT_SHARED_KEY;
  const canPersist = true;
  const enhancedElements = new WeakSet();
  let destroyed = false;
  let layoutMap = {};
  let dragState = null;
  let selectedKey = '';
  let selectedElement = null;
  let launcher = null;
  let drawer = null;
  let targetListBody = null;
  let controlsBody = null;
  let statusEl = null;
  let savedSummaryOverlay = null;
  let saveNameModalOverlay = null;
  let isDirectSelectionEnabled = false;
  let lastSavedLayoutName = '';
  let lastSavedLayoutManifest = [];
  let drawerVisible = false;
  let motionPresetMap = {};
  let selectedMotionPresetKey = '';

  const setStatus = (text) => {
    if (statusEl) statusEl.textContent = String(text || '');
  };

  const getManifestEntryByKey = (key) => {
    const normalizedKey = String(key || '').trim();
    if (!normalizedKey || !Array.isArray(lastSavedLayoutManifest)) return null;
    return lastSavedLayoutManifest.find((entry) => String(entry?.key || '').trim() === normalizedKey) || null;
  };

  const getDisplayLabel = (element) => {
    const key = buildTargetKey(element);
    const manifest = getManifestEntryByKey(key);
    return (manifest && manifest.label) || buildTargetLabel(element);
  };

  const formatLayoutSummary = (layout = {}) => {
    const safe = sanitizeLayout(layout);
    return `x${Math.round(safe.x)}, y${Math.round(safe.y)}, w${Math.round(safe.width)}, h${Math.round(safe.height)}`;
  };

  const closeSavedLayoutSummary = () => {
    if (!savedSummaryOverlay) return;
    savedSummaryOverlay.remove();
    savedSummaryOverlay = null;
  };

  const closeSaveNameDialog = () => {
    if (!saveNameModalOverlay) return;
    saveNameModalOverlay.remove();
    saveNameModalOverlay = null;
  };

  const openSaveNameDialog = (initialValue = '') => new Promise((resolve) => {
    if (saveNameModalOverlay) closeSaveNameDialog();

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(15,23,42,0.45)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '12px';
    overlay.tabIndex = -1;

    const panel = document.createElement('div');
    panel.style.width = 'min(540px, 100%)';
    panel.style.background = '#0b1327';
    panel.style.border = '1px solid #334155';
    panel.style.borderRadius = '14px';
    panel.style.padding = '14px';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.gap = '10px';
    panel.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';

    const title = document.createElement('div');
    title.style.fontWeight = '700';
    title.textContent = '저장 이름 입력';

    const desc = document.createElement('div');
    desc.style.color = '#94a3b8';
    desc.style.fontSize = '13px';
    desc.textContent = '현재 편집된 UI 위치를 저장할 이름을 입력하세요.';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'ui-dev-drawer__input';
    input.value = String(initialValue || '').trim();
    input.placeholder = '예: 메인화면 하단 모달 배치';
    input.autocomplete = 'off';
    input.style.margin = '0';

    const helper = document.createElement('div');
    helper.style.minHeight = '18px';
    helper.style.color = '#ef4444';
    helper.style.fontSize = '12px';

    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '8px';
    buttonRow.style.justifyContent = 'flex-end';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'ui-dev-drawer__action';
    cancel.textContent = '취소';

    const submit = document.createElement('button');
    submit.type = 'button';
    submit.className = 'ui-dev-drawer__action ui-dev-drawer__action--primary';
    submit.textContent = '저장';

    const finish = (result) => {
      if (saveNameModalOverlay !== overlay) return;
      closeSaveNameDialog();
      resolve(result);
    };

    const submitName = () => {
      const trimmed = String(input.value || '').trim();
      if (!trimmed) {
        helper.textContent = '저장 이름을 입력해 주세요.';
        input.focus();
        return;
      }
      finish(trimmed);
    };

    cancel.addEventListener('click', () => {
      finish(null);
    });

    submit.addEventListener('click', submitName);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitName();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        finish(null);
      }
    });

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        finish(null);
      }
    });

    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish(null);
      }
    });

    buttonRow.appendChild(cancel);
    buttonRow.appendChild(submit);
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(input);
    panel.appendChild(helper);
    panel.appendChild(buttonRow);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    saveNameModalOverlay = overlay;
    requestAnimationFrame(() => {
      if (saveNameModalOverlay === overlay) {
        input.focus();
      }
    });
  });

  const removeSavedLayoutEntry = async (entryToRemove) => {
    const targetId = String(entryToRemove?.id || '').trim();
    const targetKey = String(entryToRemove?.key || '').trim();
    const targetLabel = String(entryToRemove?.label || '항목').trim();
    if (!targetKey) return;
    if (!window.confirm(`"${targetLabel}" 위치 데이터를 삭제할까요?`)) return;

    const normalizedManifest = Array.isArray(lastSavedLayoutManifest) ? lastSavedLayoutManifest : [];
    const nextManifest = targetId
      ? normalizedManifest.filter((entry) => String(entry?.id || '').trim() !== targetId)
      : normalizedManifest.filter((entry) => String(entry?.key || '').trim() !== targetKey || entry !== entryToRemove);
    const nextLayoutMap = nextManifest.reduce((acc, entry) => {
      const key = String(entry?.key || '').trim();
      if (!key) return acc;
      const layout = sanitizeLayout(entry?.layout || {});
      acc[key] = layout;
      return acc;
    }, {});

    const savedAtIso = new Date().toISOString();
    layoutMap = await saveLayoutMap({
      accountUsername: normalizedAccountUsername,
      canPersist,
      layoutMap: nextLayoutMap,
      saveName: nextManifest.length ? (String(nextManifest[nextManifest.length - 1]?.saveName || '').trim() || (lastSavedLayoutName || '')) : '',
      savedAt: savedAtIso,
      layoutManifest: nextManifest
    });

    writeCachedMotionPresetMap(normalizedAccountUsername, motionPresetMap);
    lastSavedLayoutManifest = nextManifest;
    lastSavedLayoutName = nextManifest.length ? String(nextManifest[nextManifest.length - 1]?.saveName || '').trim() : '';

    setStatus(`"${targetLabel}" 위치 데이터가 삭제되었습니다.`);
    renderTargetList();
    renderControls();
    closeSavedLayoutSummary();
    showSavedLayoutSummary();
  };

  const renderSavedLayoutCardSummary = () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.35)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '12px';

    const closeOnBg = (event) => {
      if (event.target === overlay) closeSavedLayoutSummary();
    };
    overlay.addEventListener('click', closeOnBg);
    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeSavedLayoutSummary();
    });
    overlay.tabIndex = 0;

    const panel = document.createElement('div');
    panel.style.width = 'min(900px, calc(100vw - 24px))';
    panel.style.maxHeight = '80vh';
    panel.style.background = '#1e293b';
    panel.style.border = '1px solid #334155';
    panel.style.borderRadius = '12px';
    panel.style.padding = '14px';
    panel.style.overflow = 'hidden';
    panel.style.color = '#f8fafc';
    panel.style.boxShadow = '0 18px 40px rgba(0,0,0,0.35)';
    overlay.appendChild(panel);

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '10px';

    const title = document.createElement('div');
    title.style.fontSize = '16px';
    title.style.fontWeight = '700';
    title.textContent = 'UI위치저장목록';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ui-dev-drawer__action';
    closeBtn.textContent = '닫기';
    closeBtn.addEventListener('click', () => closeSavedLayoutSummary());
    header.appendChild(closeBtn);

    panel.appendChild(header);

    const empty = document.createElement('div');
    empty.style.color = '#94a3b8';
    empty.style.fontSize = '14px';
    if (!Array.isArray(lastSavedLayoutManifest) || !lastSavedLayoutManifest.length) {
      empty.textContent = '저장된 위치 데이터가 없습니다.';
      panel.appendChild(empty);
      return overlay;
    }

    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gap = '10px';
    list.style.maxHeight = '64vh';
    list.style.overflow = 'auto';
    list.style.paddingRight = '4px';

    lastSavedLayoutManifest.forEach((entry, index) => {
      const safe = sanitizeLayout(entry?.layout || {});
      const card = document.createElement('div');
      card.style.border = '1px solid #334155';
      card.style.borderRadius = '10px';
      card.style.background = '#0f172a';
      card.style.padding = '10px';
      card.style.display = 'flex';
      card.style.gap = '10px';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'space-between';

      const left = document.createElement('div');
      left.style.flex = '1';

      const itemTitle = document.createElement('div');
      itemTitle.style.fontSize = '14px';
      itemTitle.style.fontWeight = '700';
      const displaySaveName = String(entry?.saveName || '').trim();
      const displayLabel = String(entry?.label || `항목 ${index + 1}`).trim();
      itemTitle.textContent = `${index + 1}. ${displayLabel}${displaySaveName ? ` (${displaySaveName})` : ''}`;

      const itemInfo = document.createElement('div');
      itemInfo.style.fontSize = '12px';
      itemInfo.style.color = '#cbd5e1';
      const entrySaveName = String(entry?.saveName || '').trim();
      itemInfo.textContent = `${entrySaveName ? `저장 이름: ${entrySaveName} / ` : ''}위치: ${formatLayoutSummary(safe)} / 키: ${String(entry?.key || '').trim()}`;

      const debugInfo = document.createElement('div');
      debugInfo.style.fontSize = '11px';
      debugInfo.style.color = '#94a3b8';
      const anchor = String(entry?.debugSnapshot?.anchor || 'unknown').trim();
      const layoutMode = String(entry?.debugSnapshot?.layoutMode || DEV_MODAL_LAYOUT_MODE).trim();
      const positionMode = String(entry?.debugSnapshot?.positionMode || '').trim() || '-';
      const viewportWidth = Math.max(0, Number(entry?.debugSnapshot?.viewport?.width) || 0);
      const viewportHeight = Math.max(0, Number(entry?.debugSnapshot?.viewport?.height) || 0);
      const appliedTranslate = String(entry?.debugSnapshot?.appliedTranslate?.value || '').trim() || `${safe.x}px ${safe.y}px`;
      debugInfo.textContent = `기준점: ${anchor} / mode: ${layoutMode} / position: ${positionMode} / translate: ${appliedTranslate} / viewport: ${viewportWidth}x${viewportHeight}`;

      left.appendChild(itemTitle);
      left.appendChild(itemInfo);
      left.appendChild(debugInfo);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'ui-dev-drawer__action';
      del.textContent = '삭제';
      del.addEventListener('click', () => {
        void removeSavedLayoutEntry(entry);
      });

      card.appendChild(left);
      card.appendChild(del);
      list.appendChild(card);
    });

    panel.appendChild(list);
    return overlay;
  };

  const showSavedLayoutSummary = () => {
    closeSavedLayoutSummary();
    savedSummaryOverlay = renderSavedLayoutCardSummary();
    document.body.appendChild(savedSummaryOverlay);
    requestAnimationFrame(() => savedSummaryOverlay?.focus());
  };

  const clearSavedLayoutData = async () => {
    if (!window.confirm('저장된 위치 데이터를 삭제할까요?')) return;
    layoutMap = {};
    lastSavedLayoutManifest = [];
    lastSavedLayoutName = '';
    if (canPersist) {
      try {
        await fetch(DEV_MODAL_LAYOUT_ENDPOINT, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify({
            username: normalizedAccountUsername,
            layouts: {},
            saveName: '',
            savedAt: '',
            layoutManifest: []
          })
        });
      } catch {
        // best effort
      }
    }
    setStatus('저장된 위치 데이터가 삭제되었습니다.');
    renderTargetList();
    renderControls();
  };

  const currentMotion = () => {
    const candidate = motionPresetMap[selectedMotionPresetKey] || DEFAULT_MOTION;
    return sanitizeMotionPreset(candidate);
  };

  const runMotionPreview = () => {
    if (!selectedElement || !selectedKey) return;
    const motion = currentMotion();
    selectedElement.animate(
      [
        { transform: `translateX(${motion.enterX}px)`, opacity: 0.55 },
        { transform: 'translateX(0)', opacity: 1 }
      ],
      { duration: motion.durationMs, easing: motion.easing, fill: 'none' }
    );
  };

  const currentTargetElements = () => currentVisibleTargetElements();

  const syncTargetStyles = () => {
    currentTargetElements().forEach((element) => {
      const key = buildTargetKey(element);
      if (isTransportLayoutElement(element) && !isPersistableTransportLayoutKey(key)) {
        applyLayoutToElement(element, DEFAULT_LAYOUT);
        return;
      }
      applyLayoutToElement(element, layoutMap[key] || DEFAULT_LAYOUT);
    });
  };

  const renderTargetList = () => {
    if (!targetListBody) return;
    targetListBody.innerHTML = '';
    const elements = currentTargetElements();
    elements.forEach((element) => {
      enhanceElement(element);
      const key = buildTargetKey(element);
      const manifest = getManifestEntryByKey(key);
      const label = (manifest && manifest.label) || getDisplayLabel(element);
      const layout = layoutMap[key] || readElementLayout(element);
      const item = document.createElement('div');
      item.className = 'ui-dev-drawer__target-item';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = `ui-dev-drawer__target ${selectedKey === key ? 'is-active' : ''}`.trim();
      button.textContent = `${label}`;
      button.addEventListener('click', () => setSelectedElement(element));

      const info = document.createElement('div');
      info.className = 'ui-dev-drawer__target-info';
      info.textContent = `위치: ${formatLayoutSummary(layout)}`;

      item.appendChild(button);
      item.appendChild(info);
      targetListBody.appendChild(item);
    });
    if (!elements.length) {
      const empty = document.createElement('div');
      empty.className = 'ui-dev-drawer__empty';
      empty.textContent = '현재 편집 가능한 항목이 없습니다. 모달/패널을 열고 다시 시도해 주세요.';
      targetListBody.appendChild(empty);
    }
  };

  const stopDrag = () => {
    if (!dragState) return;
    document.removeEventListener('pointermove', handlePointerMove, true);
    document.removeEventListener('pointerup', handlePointerUp, true);
    document.body.classList.remove('ui-dev-dragging');
    dragState.element?.classList?.remove('ui-dev-edit-target--dragging');
    dragState = null;
  };

  const setSelectedElement = (element) => {
    if (selectedElement === element) return;
    if (selectedElement) selectedElement.classList.remove('ui-dev-edit-target--selected');
    selectedElement = element || null;
    selectedKey = selectedElement ? buildTargetKey(selectedElement) : '';
    if (selectedElement) selectedElement.classList.add('ui-dev-edit-target--selected');
    renderTargetList();
    renderControls();
  };

  const updateSelectedLayout = (partial, options = {}) => {
    const { skipRenderControls = false } = options || {};
    if (!selectedElement || !selectedKey) return;
    const isPersistableTransportSelected = isTransportLayoutElement(selectedElement)
      && isPersistableTransportLayoutKey(selectedKey);
    const next = {
      ...DEFAULT_LAYOUT,
      ...(layoutMap[selectedKey] || readElementLayout(selectedElement)),
      ...partial
    };
    if (isTransportLayoutElement(selectedElement) && !isPersistableTransportSelected) {
      applyLayoutToElement(selectedElement, sanitizeLayout(next));
      if (!skipRenderControls) renderControls();
      renderTargetList();
      return;
    }
    layoutMap = {
      ...layoutMap,
      [selectedKey]: sanitizeLayout(next)
    };
    applyLayoutToElement(selectedElement, layoutMap[selectedKey]);
    if (!skipRenderControls) renderControls();
    renderTargetList();
  };

  const resetSelectedLayout = () => {
    if (!selectedKey || !selectedElement) return;
    layoutMap = {
      ...layoutMap,
      [selectedKey]: { ...DEFAULT_LAYOUT }
    };
    applyLayoutToElement(selectedElement, DEFAULT_LAYOUT);
    renderControls();
    setStatus('선택 요소가 초기화되었습니다.');
  };

  const centerSelectedLayout = () => {
    updateSelectedLayout({ x: 0, y: 0 });
    setStatus('선택 요소를 중앙으로 이동했습니다.');
  };

  const persistLayouts = async () => {
    if (!canPersist) {
      setStatus('현재 로그인 상태에서만 위치를 저장할 수 있습니다.');
      return;
    }
    if (!selectedElement || !selectedKey) {
      setStatus('저장할 모달을 먼저 선택해 주세요.');
      return;
    }
    const enteredName = await openSaveNameDialog(lastSavedLayoutName || '');
    if (enteredName === null) {
      setStatus('저장을 취소했습니다.');
      return;
    }
    const trimmedName = String(enteredName || '').trim();
    const savedAtIso = new Date().toISOString();
    const selectedLayout = sanitizeLayout(layoutMap[selectedKey] || readElementLayout(selectedElement));
    const existingManifest = Array.isArray(lastSavedLayoutManifest) ? lastSavedLayoutManifest : [];
    const selectedLabel = String(buildTargetLabel(selectedElement)).trim();
    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      key: selectedKey,
      label: selectedLabel,
      saveName: trimmedName,
      titleText: String(modalTitleTextOf(selectedElement)).trim(),
      className: String(Array.from(selectedElement.classList || []).join(' ')),
      layout: selectedLayout,
      debugSnapshot: buildLayoutDebugSnapshot(selectedElement, selectedLayout),
      savedAt: savedAtIso,
      timestamp: Date.now()
    };
    const layoutManifest = existingManifest.concat([newEntry]);
    const nextLayoutMap = layoutManifest.reduce((acc, entry) => {
      const key = String(entry?.key || '').trim();
      if (!key) return acc;
      acc[key] = sanitizeLayout(entry?.layout || {});
      return acc;
    }, {});
    await saveLayoutMap({
      accountUsername: normalizedAccountUsername,
      canPersist,
      layoutMap: nextLayoutMap,
      saveName: trimmedName,
      savedAt: savedAtIso,
      layoutManifest
    });
    layoutMap = nextLayoutMap;
    writeCachedMotionPresetMap(normalizedAccountUsername, motionPresetMap);
    lastSavedLayoutName = trimmedName;
    lastSavedLayoutManifest = layoutManifest;
    setStatus(`저장되었습니다. ${selectedLabel} / 저장제목: ${trimmedName}`);
  };

  function handlePointerUp() {
    stopDrag();
  }

  function handlePointerMove(event) {
    if (!dragState?.element) return;
    if (dragState.mode === 'resize') {
      const dx = event.clientX - dragState.startX;
      const dy = event.clientY - dragState.startY;
      const nextPatch = {};
      if (dragState.direction.includes('e')) {
        nextPatch.width = Math.max(180, Math.round(dragState.baseWidth + dx));
      }
      if (dragState.direction.includes('s')) {
        nextPatch.height = Math.max(120, Math.round(dragState.baseHeight + dy));
      }
      if (dragState.direction.includes('w')) {
        const nextWidth = Math.max(180, Math.round(dragState.baseWidth - dx));
        nextPatch.width = nextWidth;
        nextPatch.x = Math.round(dragState.origin.x + (dragState.baseWidth - nextWidth));
      }
      if (dragState.direction.includes('n')) {
        const nextHeight = Math.max(120, Math.round(dragState.baseHeight - dy));
        nextPatch.height = nextHeight;
        nextPatch.y = Math.round(dragState.origin.y + (dragState.baseHeight - nextHeight));
      }
      updateSelectedLayout(nextPatch);
      return;
    }
    const nextX = dragState.origin.x + (event.clientX - dragState.startX);
    const nextY = dragState.origin.y + (event.clientY - dragState.startY);
    updateSelectedLayout({ x: Math.round(nextX), y: Math.round(nextY) });
  }

  const startDrag = (event, element) => {
    if (!element || element !== selectedElement) return;
    event.preventDefault();
    event.stopPropagation();
    const origin = readElementLayout(element);
    dragState = {
      element,
      startX: event.clientX,
      startY: event.clientY,
      origin
    };
    element.classList.add('ui-dev-edit-target--dragging');
    document.body.classList.add('ui-dev-dragging');
    document.addEventListener('pointermove', handlePointerMove, true);
    document.addEventListener('pointerup', handlePointerUp, true);
  };

  const startResize = (event, element, direction) => {
    if (!element || element !== selectedElement) return;
    event.preventDefault();
    event.stopPropagation();
    const origin = readElementLayout(element);
    const rect = element.getBoundingClientRect();
    dragState = {
      mode: 'resize',
      direction,
      element,
      startX: event.clientX,
      startY: event.clientY,
      origin,
      baseWidth: Math.max(180, Math.round(rect.width)),
      baseHeight: Math.max(120, Math.round(rect.height))
    };
    element.classList.add('ui-dev-edit-target--dragging');
    document.body.classList.add('ui-dev-dragging');
    document.addEventListener('pointermove', handlePointerMove, true);
    document.addEventListener('pointerup', handlePointerUp, true);
  };

  const ensureResizeHandles = (element) => {
    if (!element) return;
    RESIZE_DIRECTIONS.forEach((direction) => {
      if (element.querySelector('.' + DEV_UI_RESIZE_HANDLE_CLASS + '[data-direction="' + direction + '"]')) return;
      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = `${DEV_UI_RESIZE_HANDLE_CLASS} ${DEV_UI_RESIZE_HANDLE_CLASS}--${direction}`;
      handle.dataset.direction = direction;
      handle.tabIndex = -1;
      handle.setAttribute('aria-hidden', 'true');
      handle.addEventListener('pointerdown', (event) => startResize(event, element, direction), true);
      element.appendChild(handle);
    });
  };

  const enhanceElement = (element) => {
    if (!element) return;
    const key = buildTargetKey(element);
    const previousKey = String(element.dataset.devUiTargetKey || '').trim();
    if (!enhancedElements.has(element)) {
      enhancedElements.add(element);
      element.classList.add('ui-dev-edit-target');
      ensureResizeHandles(element);
    }
    if (previousKey !== key) {
      element.dataset.devUiTargetKey = key;
      applyLayoutToElement(element, layoutMap[key] || DEFAULT_LAYOUT);
      return;
    }
    if (!element.dataset.devUiOffsetX && !element.dataset.devUiOffsetY) {
      applyLayoutToElement(element, layoutMap[key] || DEFAULT_LAYOUT);
    }
  };

  const appendField = ({ label, description = '', inputElement }) => {
    const field = document.createElement('label');
    field.className = 'ui-dev-drawer__field';

    const head = document.createElement('div');
    head.className = 'ui-dev-drawer__field-head';

    const title = document.createElement('span');
    title.textContent = label;
    head.appendChild(title);

    if (description) {
      const desc = document.createElement('small');
      desc.textContent = description;
      head.appendChild(desc);
    }

    field.appendChild(head);
    field.appendChild(inputElement);
    controlsBody.appendChild(field);
  };

  const appendSectionTitle = (text) => {
    const title = document.createElement('div');
    title.className = 'ui-dev-drawer__section-title';
    title.textContent = text;
    controlsBody.appendChild(title);
  };

  const renderControls = () => {
    if (!controlsBody) return;
    controlsBody.innerHTML = '';

    const selectionModeButton = document.createElement('button');
    selectionModeButton.type = 'button';
    selectionModeButton.className = `ui-dev-drawer__action ${isDirectSelectionEnabled ? 'is-active' : ''}`.trim();
    selectionModeButton.textContent = `클릭 선택 모드: ${isDirectSelectionEnabled ? 'ON' : 'OFF'}`;
    selectionModeButton.title = isDirectSelectionEnabled
      ? '모달/패널을 클릭하면 바로 선택됩니다.'
      : '선택 모드가 꺼져 있습니다. 이 버튼을 켜고 클릭하면 선택됩니다.';
    selectionModeButton.addEventListener('click', () => {
      isDirectSelectionEnabled = !isDirectSelectionEnabled;
      setStatus(`클릭 선택 모드가 ${isDirectSelectionEnabled ? 'ON' : 'OFF'}로 변경되었습니다.`);
      renderControls();
    });
    controlsBody.appendChild(selectionModeButton);

    const summary = document.createElement('div');
    summary.className = 'ui-dev-drawer__summary';
    summary.textContent = selectedElement
      ? `현재 선택: ${getDisplayLabel(selectedElement)}`
      : '선택된 요소가 없습니다';
    controlsBody.appendChild(summary);

    const dragHint = document.createElement('div');
    dragHint.className = 'ui-dev-drawer__summary';
    dragHint.textContent = '드래그나 터치로 위치를 이동할 수 있습니다. 선택된 요소를 클릭해 좌표를 직접 편집하세요.';
    controlsBody.appendChild(dragHint);

    const hasSelection = Boolean(selectedElement && selectedKey);
    const topActions = document.createElement('div');
    topActions.className = 'ui-dev-drawer__actions';

    const centerButton = document.createElement('button');
    centerButton.type = 'button';
    centerButton.className = 'ui-dev-drawer__action';
    centerButton.textContent = '중앙 정렬';
    centerButton.disabled = !hasSelection;
    centerButton.title = hasSelection ? '' : '먼저 요소를 선택해 주세요';
    centerButton.addEventListener('click', centerSelectedLayout);
    topActions.appendChild(centerButton);

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'ui-dev-drawer__action';
    resetButton.textContent = '선택값 초기화';
    resetButton.disabled = !hasSelection;
    resetButton.title = hasSelection ? '' : '먼저 요소를 선택해 주세요';
    resetButton.addEventListener('click', resetSelectedLayout);
    topActions.appendChild(resetButton);

    const viewSavedButton = document.createElement('button');
    viewSavedButton.type = 'button';
    viewSavedButton.className = 'ui-dev-drawer__action';
    viewSavedButton.textContent = '저장 위치 보기';
    viewSavedButton.addEventListener('click', showSavedLayoutSummary);
    topActions.appendChild(viewSavedButton);

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'ui-dev-drawer__action ui-dev-drawer__action--primary';
    saveButton.textContent = '데이터 저장하기';
    saveButton.disabled = !canPersist;
    saveButton.title = '게임폴더 data/dev-modal-layout에 저장합니다.';
    saveButton.addEventListener('click', () => { void persistLayouts(); });
    topActions.appendChild(saveButton);

    controlsBody.prepend(topActions);

    if (!selectedElement || !selectedKey) return;

    const layout = {
      ...DEFAULT_LAYOUT,
      ...(layoutMap[selectedKey] || readElementLayout(selectedElement))
    };

    appendSectionTitle('위치');
    appendField({
      label: '위치 X',
      description: '오른쪽(+), 왼쪽(-)',
      inputElement: createNumberInput({
        min: -2000,
        max: 2000,
        step: 1,
        value: layout.x,
        onChange: (value, options) => updateSelectedLayout({ x: Math.round(Number(value) || 0) }, options)
      })
    });
    appendField({
      label: '위치 Y',
      description: '아래(+), 위(-)',
      inputElement: createNumberInput({
        min: -2000,
        max: 2000,
        step: 1,
        value: layout.y,
        onChange: (value, options) => updateSelectedLayout({ y: Math.round(Number(value) || 0) }, options)
      })
    });
    appendField({
      label: '너비',
      description: '0 이상 정수',
      inputElement: createNumberInput({
        min: 0,
        max: 2400,
        step: 1,
        value: layout.width,
        onChange: (value, options) => updateSelectedLayout({ width: Math.max(0, Math.round(Number(value) || 0)) }, options)
      })
    });
    appendField({
      label: '높이',
      description: '0 이상 정수',
      inputElement: createNumberInput({
        min: 0,
        max: 1800,
        step: 1,
        value: layout.height,
        onChange: (value, options) => updateSelectedLayout({ height: Math.max(0, Math.round(Number(value) || 0)) }, options)
      })
    });

    appendSectionTitle('변형');
    appendField({
      label: '투명도',
      description: '0.2 ~ 1',
      inputElement: createNumberInput({
        min: 0.2,
        max: 1,
        step: 0.05,
        value: layout.opacity,
        onChange: (value, options) => updateSelectedLayout({ opacity: clamp(Number(value) || 1, 0.2, 1) }, options)
      })
    });
    appendField({
      label: '스케일',
      description: '0.6 ~ 1.4',
      inputElement: createNumberInput({
        min: 0.6,
        max: 1.4,
        step: 0.05,
        value: layout.scale,
        onChange: (value, options) => updateSelectedLayout({ scale: clamp(Number(value) || 1, 0.6, 1.4) }, options)
      })
    });
    appendField({
      label: '둥근 모서리',
      description: '0 ~ 80',
      inputElement: createNumberInput({
        min: 0,
        max: 80,
        step: 1,
        value: layout.radius,
        onChange: (value, options) => updateSelectedLayout({ radius: Math.max(0, Math.round(Number(value) || 0)) }, options)
      })
    });
    appendField({
      label: '그림자',
      description: '0 ~ 80',
      inputElement: createNumberInput({
        min: 0,
        max: 80,
        step: 1,
        value: layout.shadow,
        onChange: (value, options) => updateSelectedLayout({ shadow: Math.max(0, Math.round(Number(value) || 0)) }, options)
      })
    });
    appendField({
      label: '배경색',
      description: '#fffaf2 또는 rgba(...)',
      inputElement: createTextInput({
        value: layout.background || '',
      placeholder: '#fffaf2 또는 rgba(255,250,242,0.98)',
        onChange: (value) => updateSelectedLayout({ background: value })
      })
    });

    appendSectionTitle('모션');
    const motion = currentMotion();
    appendField({
      label: '입장 X(px)',
      description: '입장 위치 좌표',
      inputElement: createNumberInput({
        min: -2400,
        max: 2400,
        step: 1,
        value: motion.enterX,
        onChange: (value) => {
          if (!selectedMotionPresetKey) selectedMotionPresetKey = 'default';
          motionPresetMap = {
            ...motionPresetMap,
            [selectedMotionPresetKey]: sanitizeMotionPreset({ ...motion, enterX: Number(value) || 0 })
          };
          writeCachedMotionPresetMap(normalizedAccountUsername, motionPresetMap);
        }
      })
    });
    appendField({
      label: '퇴장 X(px)',
      description: '퇴장 위치 좌표',
      inputElement: createNumberInput({
        min: -2400,
        max: 2400,
        step: 1,
        value: motion.exitX,
        onChange: (value) => {
          if (!selectedMotionPresetKey) selectedMotionPresetKey = 'default';
          motionPresetMap = {
            ...motionPresetMap,
            [selectedMotionPresetKey]: sanitizeMotionPreset({ ...motion, exitX: Number(value) || 0 })
          };
          writeCachedMotionPresetMap(normalizedAccountUsername, motionPresetMap);
        }
      })
    });
    appendField({
      label: '지속 시간(ms)',
      description: '애니메이션 진행 시간',
      inputElement: createNumberInput({
        min: 120,
        max: 4000,
        step: 10,
        value: motion.durationMs,
        onChange: (value) => {
          if (!selectedMotionPresetKey) selectedMotionPresetKey = 'default';
          motionPresetMap = {
            ...motionPresetMap,
            [selectedMotionPresetKey]: sanitizeMotionPreset({ ...motion, durationMs: Number(value) || 0 })
          };
          writeCachedMotionPresetMap(normalizedAccountUsername, motionPresetMap);
        }
      })
    });
    appendField({
      label: 'Easing',
      description: 'cubic-bezier(...)',
      inputElement: createTextInput({
        value: motion.easing,
        placeholder: 'cubic-bezier(0.22, 1, 0.36, 1)',
        onChange: (value) => {
          if (!selectedMotionPresetKey) selectedMotionPresetKey = 'default';
          motionPresetMap = {
            ...motionPresetMap,
            [selectedMotionPresetKey]: sanitizeMotionPreset({ ...motion, easing: value })
          };
          writeCachedMotionPresetMap(normalizedAccountUsername, motionPresetMap);
        }
      })
    });

    const motionActions = document.createElement('div');
    motionActions.className = 'ui-dev-drawer__actions';
  const previewMotionButton = document.createElement('button');
  previewMotionButton.type = 'button';
  previewMotionButton.className = 'ui-dev-drawer__action';
  previewMotionButton.textContent = '모션 미리보기';
  previewMotionButton.addEventListener('click', runMotionPreview);
  motionActions.appendChild(previewMotionButton);

  const saveMotionButton = document.createElement('button');
  saveMotionButton.type = 'button';
  saveMotionButton.className = 'ui-dev-drawer__action';
  saveMotionButton.textContent = '모션 저장';
  saveMotionButton.addEventListener('click', () => {
    const enteredName = window.prompt('모션 저장 이름을 입력하세요.', selectedMotionPresetKey || 'transport_slide');
    if (enteredName === null) return;
    const presetKey = normalizeKeyPart(enteredName);
    if (!presetKey) {
      setStatus('모션 저장 키가 비어있으면 저장할 수 없습니다.');
      return;
    }
      motionPresetMap = {
        ...motionPresetMap,
        [presetKey]: sanitizeMotionPreset(motion)
      };
      selectedMotionPresetKey = presetKey;
      writeCachedMotionPresetMap(normalizedAccountUsername, motionPresetMap);
      setStatus(`모션 저장: ${presetKey}`);
      renderControls();
    });
    motionActions.appendChild(saveMotionButton);
    controlsBody.appendChild(motionActions);

    const presetField = document.createElement('label');
    presetField.className = 'ui-dev-drawer__field';
    const presetHead = document.createElement('div');
    presetHead.className = 'ui-dev-drawer__field-head';
    const presetTitle = document.createElement('span');
    presetTitle.textContent = '저장 모션';
    presetHead.appendChild(presetTitle);
    presetField.appendChild(presetHead);
    const presetSelect = document.createElement('select');
    presetSelect.className = 'ui-dev-drawer__input';
    const presetKeys = Object.keys(motionPresetMap);
    if (!presetKeys.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = '저장 모션이 없습니다';
      presetSelect.appendChild(option);
    } else {
      presetKeys.forEach((key) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        option.selected = key === selectedMotionPresetKey;
        presetSelect.appendChild(option);
      });
    }
    presetSelect.addEventListener('change', () => {
      selectedMotionPresetKey = String(presetSelect.value || '').trim();
      renderControls();
    });
    presetField.appendChild(presetSelect);
    controlsBody.appendChild(presetField);

  };

  const restoreCurrentTargetLayouts = () => {
    currentTargetElements().forEach((element) => {
      const key = buildTargetKey(element);
      applyLayoutToElement(element, layoutMap[key] || DEFAULT_LAYOUT);
    });
  };

  const toggleDrawer = () => {
    drawerVisible = !drawerVisible;
    if (drawer) drawer.classList.toggle('is-open', drawerVisible);
    if (launcher) launcher.classList.toggle('is-open', drawerVisible);
    if (drawerVisible) {
      renderTargetList();
      renderControls();
    } else {
      closeSavedLayoutSummary();
      closeSaveNameDialog();
      stopDrag();
      restoreCurrentTargetLayouts();
      if (selectedElement) selectedElement.classList.remove('ui-dev-edit-target--selected');
      selectedElement = null;
      selectedKey = '';
    }
  };

  const buildUiShell = () => {
    launcher = document.createElement('button');
    launcher.id = DEV_UI_LAUNCHER_ID;
    launcher.type = 'button';
    launcher.className = 'ui-dev-launcher';
  launcher.textContent = 'UI 편집';
    launcher.addEventListener('click', toggleDrawer);

    drawer = document.createElement('aside');
    drawer.id = DEV_UI_DRAWER_ID;
    drawer.className = 'ui-dev-drawer';

  const title = document.createElement('div');
  title.className = 'ui-dev-drawer__title';
  title.textContent = '개발자 UI 편집';
  drawer.appendChild(title);

  const desc = document.createElement('div');
  desc.className = 'ui-dev-drawer__desc';
  desc.textContent = 'UI 편집은 클릭 선택 ON/OFF로 동작합니다. ON일 때만 모달/패널 클릭으로 선택/드래그할 수 있습니다.';
    drawer.appendChild(desc);

  const targetSection = document.createElement('div');
  targetSection.className = 'ui-dev-drawer__section';
  const targetTitle = document.createElement('div');
  targetTitle.className = 'ui-dev-drawer__section-title';
  targetTitle.textContent = '목표 모달';
    targetSection.appendChild(targetTitle);
    targetListBody = document.createElement('div');
    targetListBody.className = 'ui-dev-drawer__targets';
    targetSection.appendChild(targetListBody);
    drawer.appendChild(targetSection);

  const controlSection = document.createElement('div');
  controlSection.className = 'ui-dev-drawer__section';
  const controlTitle = document.createElement('div');
  controlTitle.className = 'ui-dev-drawer__section-title';
  controlTitle.textContent = '편집 설정';
    controlSection.appendChild(controlTitle);
    controlsBody = document.createElement('div');
    controlsBody.className = 'ui-dev-drawer__controls';
    controlSection.appendChild(controlsBody);
    drawer.appendChild(controlSection);

    statusEl = document.createElement('div');
    statusEl.className = 'ui-dev-drawer__status';
    statusEl.textContent = canPersist
      ? '게임폴더 data/dev-modal-layout에 저장됩니다.'
      : '현재 저장할 수 없습니다.';
    drawer.appendChild(statusEl);

    document.body.appendChild(launcher);
    document.body.appendChild(drawer);
  };

  const handleDocumentPointerDown = (event) => {
    if (!drawerVisible) return;
    if (event.target?.closest?.(`#${DEV_UI_DRAWER_ID}`) || event.target?.closest?.(`#${DEV_UI_LAUNCHER_ID}`)) return;
    if (!isDirectSelectionEnabled) return;
    const resizeHandle = event.target?.closest?.(`.${DEV_UI_RESIZE_HANDLE_CLASS}`);
    if (resizeHandle) {
      const resizeTarget = resizeHandle.parentElement || resolveEditableTarget(resizeHandle);
      if (resizeTarget) {
        enhanceElement(resizeTarget);
        setSelectedElement(resizeTarget);
      }
      return;
    }
    const target = resolveEditableTarget(event.target);
    if (target) {
      enhanceElement(target);
      setSelectedElement(target);
      startDrag(event, target);
    }
  };

  const boot = async () => {
    motionPresetMap = readCachedMotionPresetMap(normalizedAccountUsername);
    if (!Object.keys(motionPresetMap).length) {
      motionPresetMap = { default: { ...DEFAULT_MOTION } };
      writeCachedMotionPresetMap(normalizedAccountUsername, motionPresetMap);
    }
    selectedMotionPresetKey = Object.keys(motionPresetMap)[0] || 'default';

    const loaded = await loadSavedLayoutMap({
      accountUsername: normalizedAccountUsername,
      canPersist
    });
    lastSavedLayoutName = String(loaded?.saveName || '').trim();
    lastSavedLayoutManifest = Array.isArray(loaded?.manifest) ? loaded.manifest : [];
    const migrated = resetLegacyTransportLayouts(normalizedAccountUsername, loaded?.layoutMap || {});
    layoutMap = migrated.layoutMap;
    if (migrated.changed) {
      layoutMap = await saveLayoutMap({
        accountUsername: normalizedAccountUsername,
        canPersist,
        layoutMap
      });
    }
    if (destroyed) return;
    buildUiShell();
    currentTargetElements().forEach((element) => enhanceElement(element));
    syncTargetStyles();
    document.addEventListener('pointerdown', handleDocumentPointerDown, true);
  };

  void boot();

  return () => {
    destroyed = true;
    stopDrag();
    closeSavedLayoutSummary();
    closeSaveNameDialog();
    document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
    document.querySelectorAll('.ui-dev-edit-target').forEach((element) => {
      element.classList.remove('ui-dev-edit-target', 'ui-dev-edit-target--selected', 'ui-dev-edit-target--dragging');
      element.style.removeProperty('translate');
      element.style.removeProperty('opacity');
      element.style.removeProperty('scale');
      element.style.removeProperty('width');
      element.style.removeProperty('height');
      element.style.removeProperty('border-radius');
      element.style.removeProperty('box-shadow');
      element.style.removeProperty('background');
      element.querySelectorAll(`.${DEV_UI_RESIZE_HANDLE_CLASS}`).forEach((handle) => handle.remove());
      delete element.dataset.devUiTargetKey;
      delete element.dataset.devUiOffsetX;
      delete element.dataset.devUiOffsetY;
      delete element.dataset.devUiWidth;
      delete element.dataset.devUiHeight;
      delete element.dataset.devUiOpacity;
      delete element.dataset.devUiScale;
      delete element.dataset.devUiRadius;
      delete element.dataset.devUiShadow;
      delete element.dataset.devUiBackground;
    });
    launcher?.remove();
    drawer?.remove();
  };
};

