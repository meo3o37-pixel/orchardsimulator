const SERVICE_WORKER_URL = '/orchard-service-worker.js';

let registrationPromise = null;

export const isAssetServiceWorkerSupported = () => (
  typeof window !== 'undefined'
  && typeof navigator !== 'undefined'
  && 'serviceWorker' in navigator
  && window.isSecureContext
);

export const registerAssetCacheServiceWorker = () => {
  if (!isAssetServiceWorkerSupported()) return Promise.resolve(null);
  if (!import.meta.env.PROD) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => {});
    if (typeof caches !== 'undefined' && typeof caches.keys === 'function') {
      caches.keys()
        .then((keys) => Promise.all(keys
          .filter((key) => String(key || '').startsWith('orchard-sw-'))
          .map((key) => caches.delete(key))))
        .catch(() => {});
    }
    return Promise.resolve(null);
  }
  if (registrationPromise) return registrationPromise;

  registrationPromise = navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: '/' })
    .then((registration) => {
      registration.update().catch(() => {});
      return registration;
    })
    .catch((error) => {
      console.warn('[asset-cache] service worker registration failed', error);
      return null;
    });

  return registrationPromise;
};

export const cacheAssetUrlsInServiceWorker = async (urlsRaw = []) => {
  if (!isAssetServiceWorkerSupported()) return false;
  if (!import.meta.env.PROD) return false;
  const urls = [...new Set((Array.isArray(urlsRaw) ? urlsRaw : [urlsRaw])
    .map((url) => String(url || '').trim())
    .filter(Boolean))];
  if (!urls.length) return false;

  const registration = await registerAssetCacheServiceWorker();
  const target = navigator.serviceWorker.controller
    || registration?.active
    || registration?.waiting
    || registration?.installing;
  if (!target || typeof target.postMessage !== 'function') return false;
  target.postMessage({ type: 'ORCHARD_CACHE_URLS', urls });
  return true;
};
