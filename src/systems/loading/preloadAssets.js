import { LOADING_ASSET_PHASES, POST_BOOT_PRELOAD_PHASES } from './assetManifest';
import { cacheAssetUrlsInServiceWorker } from '../cache/registerAssetCache';

const assetPreloadCache = new Map();
const phasePreloadCache = new Map();
const DEFAULT_TIMEOUT_MS = 12000;
const ASSET_CACHE_VERSION = '2026-08-02-asset-cache-v3';
const CACHE_DOWNLOAD_CONSENT_STORAGE_KEY = 'orchard_asset_cache_download_consent_v1';
const ASSET_CACHE_VERSION_STORAGE_KEY = 'orchard_asset_cache_version_v1';
const FAILED_ASSET_PRELOAD_STORAGE_KEY = 'orchard_failed_asset_preloads_v1';
const PHASE_PRELOAD_STATUS_STORAGE_KEY = 'orchard_phase_preload_status_v1';

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, Math.max(0, Number(ms) || 0));
});

const timeoutAfter = (ms, label) => new Promise((_, reject) => {
  setTimeout(() => reject(new Error(`${label || 'asset'} preload timeout`)), Math.max(1, Number(ms) || DEFAULT_TIMEOUT_MS));
});

const preloadImage = async (src, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  if (typeof Image === 'undefined') return { src, status: 'skipped' };
  const image = new Image();
  image.decoding = 'async';
  const loadPromise = new Promise((resolve, reject) => {
    image.onload = () => resolve({ src, status: 'loaded' });
    image.onerror = () => reject(new Error(`image preload failed: ${src}`));
    image.src = src;
  });
  const result = await Promise.race([loadPromise, timeoutAfter(timeoutMs, 'image')]);
  if (typeof image.decode === 'function') {
    await image.decode().catch(() => {});
  }
  return result;
};

const preloadByFetch = async (src, type, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  if (typeof fetch !== 'function') return { src, status: 'skipped' };
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), Math.max(1, Number(timeoutMs) || DEFAULT_TIMEOUT_MS))
    : null;
  try {
    const response = await fetch(src, {
      cache: 'force-cache',
      credentials: 'same-origin',
      signal: controller?.signal
    });
    if (!response.ok) throw new Error(`${type || 'asset'} preload failed: ${response.status}`);
    await response.blob().catch(() => null);
    return { src, status: 'loaded' };
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const readFailedAssetRecords = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(FAILED_ASSET_PRELOAD_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, record]) => record?.version === ASSET_CACHE_VERSION)
    );
  } catch {
    return {};
  }
};

const writeFailedAssetRecords = (records) => {
  if (typeof window === 'undefined') return;
  try {
    const entries = Object.entries(records || {}).filter(([src]) => src);
    if (!entries.length) {
      window.localStorage.removeItem(FAILED_ASSET_PRELOAD_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(FAILED_ASSET_PRELOAD_STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Storage can be unavailable in private or restricted browser modes.
  }
};

const readPhasePreloadStatusRecords = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PHASE_PRELOAD_STATUS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, record]) => record?.version === ASSET_CACHE_VERSION)
    );
  } catch {
    return {};
  }
};

const writePhasePreloadStatusRecords = (records) => {
  if (typeof window === 'undefined') return;
  try {
    const entries = Object.entries(records || {}).filter(([phaseKey]) => phaseKey);
    if (!entries.length) {
      window.localStorage.removeItem(PHASE_PRELOAD_STATUS_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(PHASE_PRELOAD_STATUS_STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Storage can be unavailable in private or restricted browser modes.
  }
};

const phaseAssetCountOf = (phaseKey) => {
  const phase = LOADING_ASSET_PHASES[phaseKey];
  return Array.isArray(phase?.assets) ? phase.assets.length : 0;
};

const markLoadingPhaseComplete = (phaseKey, summary = {}) => {
  const key = String(phaseKey || '');
  if (!key) return;
  const total = phaseAssetCountOf(key);
  if (Number(summary.failed) > 0) return;
  if (total > 0 && Number(summary.loaded) < total) return;
  const records = readPhasePreloadStatusRecords();
  records[key] = {
    phaseKey: key,
    version: ASSET_CACHE_VERSION,
    total,
    completedAt: Date.now()
  };
  writePhasePreloadStatusRecords(records);
};

const clearLoadingPhaseComplete = (phaseKey) => {
  const key = String(phaseKey || '');
  if (!key) return;
  const records = readPhasePreloadStatusRecords();
  if (!records[key]) return;
  delete records[key];
  writePhasePreloadStatusRecords(records);
};

const recordAssetPreloadFailure = (src, error) => {
  if (!src) return;
  const records = readFailedAssetRecords();
  const previous = records[src] || {};
  records[src] = {
    src,
    count: Math.max(0, Number(previous.count) || 0) + 1,
    error: String(error || ''),
    lastFailedAt: Date.now(),
    version: ASSET_CACHE_VERSION
  };
  writeFailedAssetRecords(records);
};

const clearAssetPreloadFailure = (src) => {
  if (!src) return;
  const records = readFailedAssetRecords();
  if (!records[src]) return;
  delete records[src];
  writeFailedAssetRecords(records);
};

const preloadOneAsset = (asset, options = {}) => {
  const src = String(asset?.src || '');
  if (!src) return Promise.resolve({ src, status: 'skipped' });
  if (assetPreloadCache.has(src)) return assetPreloadCache.get(src);

  const timeoutMs = Math.max(1000, Number(options.timeoutMs) || DEFAULT_TIMEOUT_MS);
  const type = String(asset?.type || 'asset');
  const promise = (
    type === 'image'
      ? preloadImage(src, timeoutMs)
      : preloadByFetch(src, type, timeoutMs)
  )
    .then((result) => {
      clearAssetPreloadFailure(src);
      if (result?.status === 'loaded') {
        cacheAssetUrlsInServiceWorker([src]).catch(() => {});
      }
      return result;
    })
    .catch((error) => {
      const message = String(error?.message || error);
      assetPreloadCache.delete(src);
      recordAssetPreloadFailure(src, message);
      return {
        src,
        status: 'failed',
        error: message
      };
    });

  assetPreloadCache.set(src, promise);
  return promise;
};

export const getAssetCacheVersion = () => ASSET_CACHE_VERSION;

export const getFailedAssetPreloadRecords = () => readFailedAssetRecords();

export const clearFailedAssetPreloadRecords = () => writeFailedAssetRecords({});

export const getLoadingPhasePreloadStatusRecords = () => readPhasePreloadStatusRecords();

export const isLoadingPhasePreloaded = (phaseKey) => {
  const key = String(phaseKey || '');
  const record = readPhasePreloadStatusRecords()[key];
  if (!record || record.version !== ASSET_CACHE_VERSION) return false;
  return Number(record.total) === phaseAssetCountOf(key);
};

export const getIncompleteLoadingPhaseKeys = (phaseKeys = []) => {
  const keys = Array.isArray(phaseKeys) ? phaseKeys : [phaseKeys];
  return keys.filter((phaseKey) => {
    const key = String(phaseKey || '');
    return key && !isLoadingPhasePreloaded(key);
  });
};

const completedPhaseSummaryOf = (phaseKey) => {
  const total = phaseAssetCountOf(phaseKey);
  const phase = LOADING_ASSET_PHASES[phaseKey];
  return {
    total,
    loaded: total,
    failed: 0,
    skipped: 0,
    cached: true,
    results: (phase?.assets || []).map((asset) => ({ src: asset.src, status: 'cached' }))
  };
};

const getAssetTypeFromSrc = (src) => {
  const cleanSrc = String(src || '').split('?')[0].toLowerCase();
  if (/\.(png|jpe?g|webp|avif|gif|svg)$/.test(cleanSrc)) return 'image';
  if (/\.(mp3|wav|ogg|m4a|aac)$/.test(cleanSrc)) return 'audio';
  return 'asset';
};

export const retryFailedAssetPreloads = (options = {}) => {
  const records = Object.values(readFailedAssetRecords());
  if (!records.length) {
    return Promise.resolve({ total: 0, loaded: 0, failed: 0, skipped: 0, results: [] });
  }
  return preloadAssets(records.map((record) => ({
    type: getAssetTypeFromSrc(record.src),
    src: record.src,
    label: record.src
  })), {
    concurrency: 2,
    ...options
  });
};

export const hasAssetCacheDownloadConsent = () => {
  return getAssetCacheDownloadConsentStatus() === 'accepted';
};

export const getAssetCacheDownloadConsentStatus = () => {
  if (typeof window === 'undefined') return 'accepted';
  try {
    const value = window.localStorage.getItem(CACHE_DOWNLOAD_CONSENT_STORAGE_KEY);
    const cachedVersion = window.localStorage.getItem(ASSET_CACHE_VERSION_STORAGE_KEY);
    if ((value === 'accepted' || value === 'declined') && cachedVersion !== ASSET_CACHE_VERSION) return 'pending';
    if (value === 'accepted' || value === 'declined') return value;
    return 'pending';
  } catch {
    return 'pending';
  }
};

export const setAssetCacheDownloadConsent = (accepted) => {
  if (typeof window === 'undefined') return;
  try {
    if (accepted) {
      window.localStorage.setItem(CACHE_DOWNLOAD_CONSENT_STORAGE_KEY, 'accepted');
    } else {
      window.localStorage.setItem(CACHE_DOWNLOAD_CONSENT_STORAGE_KEY, 'declined');
    }
    window.localStorage.setItem(ASSET_CACHE_VERSION_STORAGE_KEY, ASSET_CACHE_VERSION);
  } catch {
    // Storage can be unavailable in private or restricted browser modes.
  }
};

export const preloadAssets = async (assets = [], options = {}) => {
  const queue = [...(Array.isArray(assets) ? assets : [])].filter((asset) => asset?.src);
  const total = queue.length;
  const concurrency = Math.max(1, Math.floor(Number(options.concurrency) || 4));
  const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
  const results = [];
  let completed = 0;
  let nextIndex = 0;

  if (!total) {
    onProgress?.({ completed: 0, total: 0, ratio: 1, current: null });
    return { total: 0, loaded: 0, failed: 0, skipped: 0, results: [] };
  }

  const runWorker = async () => {
    while (nextIndex < total) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const asset = queue[currentIndex];
      onProgress?.({
        completed,
        total,
        ratio: total > 0 ? completed / total : 1,
        current: asset
      });
      const result = await preloadOneAsset(asset, options);
      results[currentIndex] = result;
      completed += 1;
      onProgress?.({
        completed,
        total,
        ratio: total > 0 ? completed / total : 1,
        current: asset,
        result
      });
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, total) }, () => runWorker()));
  return {
    total,
    loaded: results.filter((item) => item?.status === 'loaded').length,
    failed: results.filter((item) => item?.status === 'failed').length,
    skipped: results.filter((item) => item?.status === 'skipped').length,
    results
  };
};

export const preloadLoadingPhase = (phaseKey, options = {}) => {
  const phase = LOADING_ASSET_PHASES[phaseKey];
  if (!phase) {
    return Promise.resolve({ total: 0, loaded: 0, failed: 0, skipped: 0, results: [] });
  }
  if (!options.force && !hasAssetCacheDownloadConsent()) {
    return Promise.resolve({
      total: phase.assets.length,
      loaded: 0,
      failed: 0,
      skipped: phase.assets.length,
      results: phase.assets.map((asset) => ({ src: asset.src, status: 'skipped' }))
    });
  }
  const cacheKey = String(phaseKey || '');
  if (!options.force && isLoadingPhasePreloaded(cacheKey)) {
    const summary = completedPhaseSummaryOf(cacheKey);
    if (typeof options.onProgress === 'function') {
      options.onProgress({
        completed: summary.total,
        total: summary.total,
        current: null,
        result: { status: 'cached' }
      });
    }
    return Promise.resolve(summary);
  }
  if (!options.onProgress && phasePreloadCache.has(cacheKey)) {
    return phasePreloadCache.get(cacheKey);
  }
  const promise = preloadAssets(phase.assets, {
    concurrency: phase.concurrency,
    ...options
  }).then((summary) => {
    if (summary?.failed > 0) {
      clearLoadingPhaseComplete(cacheKey);
    } else if (options.force || hasAssetCacheDownloadConsent()) {
      markLoadingPhaseComplete(cacheKey, summary);
    }
    return summary;
  });
  if (!options.onProgress) {
    phasePreloadCache.set(cacheKey, promise);
    promise.then((summary) => {
      if (summary?.failed > 0) phasePreloadCache.delete(cacheKey);
    }).catch(() => {
      phasePreloadCache.delete(cacheKey);
    });
  }
  return promise;
};

export const preloadLoadingPhases = async (phaseKeys = [], options = {}) => {
  const keys = [...new Set((Array.isArray(phaseKeys) ? phaseKeys : [phaseKeys]).filter(Boolean).map((key) => String(key)))];
  const summaries = [];
  for (const phaseKey of keys) {
    const summary = await preloadLoadingPhase(phaseKey, options);
    summaries.push({ phaseKey, ...summary });
  }
  return summaries;
};

export const warmLoadingPhases = (phaseKeys = [], options = {}) => {
  const keys = Array.isArray(phaseKeys) ? phaseKeys : [phaseKeys];
  keys.filter(Boolean).forEach((phaseKey) => {
    preloadLoadingPhase(phaseKey, options);
  });
};

export const preloadLoadingPhaseWithProgress = (phaseKey, options = {}) => {
  const phase = LOADING_ASSET_PHASES[phaseKey];
  if (!phase) {
    return Promise.resolve({ total: 0, loaded: 0, failed: 0, skipped: 0, results: [] });
  }
  if (!options.force && !hasAssetCacheDownloadConsent()) {
    return Promise.resolve({
      total: phase.assets.length,
      loaded: 0,
      failed: 0,
      skipped: phase.assets.length,
      results: phase.assets.map((asset) => ({ src: asset.src, status: 'skipped' }))
    });
  }
  if (!options.force && isLoadingPhasePreloaded(phaseKey)) {
    return Promise.resolve(completedPhaseSummaryOf(phaseKey));
  }
  return preloadAssets(phase.assets, {
    concurrency: phase.concurrency,
    ...options
  }).then((summary) => {
    if (summary?.failed > 0) {
      clearLoadingPhaseComplete(phaseKey);
    } else if (options.force || hasAssetCacheDownloadConsent()) {
      markLoadingPhaseComplete(phaseKey, summary);
    }
    return summary;
  });
};

export const schedulePostBootPreload = (options = {}) => {
  if (typeof window === 'undefined') return () => {};
  if (!options.force && !hasAssetCacheDownloadConsent()) return () => {};
  let cancelled = false;
  const idle = window.requestIdleCallback || ((callback) => setTimeout(() => callback({ timeRemaining: () => 0 }), 700));
  const cancelIdle = window.cancelIdleCallback || clearTimeout;
  const handles = [];

  POST_BOOT_PRELOAD_PHASES.forEach((phaseKey, idx) => {
    const handle = idle(async () => {
      if (cancelled) return;
      await wait(idx * 250);
      if (cancelled) return;
      preloadLoadingPhase(phaseKey, {
        timeoutMs: options.timeoutMs || DEFAULT_TIMEOUT_MS,
        onProgress: options.onProgress
      });
    });
    handles.push(handle);
  });

  const retryHandle = idle(async () => {
    if (cancelled) return;
    await wait(POST_BOOT_PRELOAD_PHASES.length * 250 + 500);
    if (cancelled) return;
    retryFailedAssetPreloads({
      timeoutMs: options.timeoutMs || DEFAULT_TIMEOUT_MS
    });
  });
  handles.push(retryHandle);

  return () => {
    cancelled = true;
    handles.forEach((handle) => cancelIdle(handle));
  };
};

export const getLoadingPhase = (phaseKey) => LOADING_ASSET_PHASES[phaseKey] || null;
