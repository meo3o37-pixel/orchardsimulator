const SW_VERSION = 'orchard-sw-v2';
const APP_SHELL_CACHE = `${SW_VERSION}:app-shell`;
const RUNTIME_CACHE = `${SW_VERSION}:runtime-assets`;
const MAX_RUNTIME_ENTRIES = 900;
const CACHEABLE_EXTENSIONS = /\.(?:css|js|mjs|html|png|jpe?g|webp|avif|gif|svg|ico|mp3|wav|ogg|m4a|mp4|webm|woff2?|ttf|otf)$/i;

self.__ORCHARD_PRECACHE_MANIFEST = self.__ORCHARD_PRECACHE_MANIFEST || [];

try {
  importScripts('/orchard-asset-manifest.js');
} catch {
  self.__ORCHARD_PRECACHE_MANIFEST = [];
}

const normalizeUrl = (urlRaw) => {
  try {
    const url = new URL(String(urlRaw || ''), self.location.origin);
    if (url.origin !== self.location.origin) return '';
    return `${url.pathname}${url.search}`;
  } catch {
    return '';
  }
};

const cacheKeyOf = (requestOrUrl) => {
  const rawUrl = typeof requestOrUrl === 'string' ? requestOrUrl : requestOrUrl?.url;
  return normalizeUrl(rawUrl);
};

const isCacheableRequest = (request) => {
  if (!request || request.method !== 'GET') return false;
  const key = cacheKeyOf(request);
  if (!key) return false;
  if (key.startsWith('/api/') || key.startsWith('/data/')) return false;
  return key === '/' || CACHEABLE_EXTENSIONS.test(key.split('?')[0]);
};

const isAppCodeRequest = (request) => {
  const key = cacheKeyOf(request);
  const pathname = key.split('?')[0];
  return request?.mode === 'navigate'
    || pathname === '/'
    || pathname === '/index.html'
    || /\.(?:js|mjs|css)$/i.test(pathname);
};

const trimCache = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const deleteCount = keys.length - maxEntries;
  await Promise.all(keys.slice(0, deleteCount).map((key) => cache.delete(key)));
};

const addUrlsToCache = async (cacheName, urlsRaw = []) => {
  const urls = [...new Set((Array.isArray(urlsRaw) ? urlsRaw : [])
    .map(normalizeUrl)
    .filter(Boolean))];
  if (!urls.length) return;
  const cache = await caches.open(cacheName);
  await Promise.all(urls.map(async (url) => {
    try {
      const request = new Request(url, { credentials: 'same-origin', cache: 'reload' });
      const response = await fetch(request);
      if (response && response.ok) await cache.put(url, response);
    } catch {
      // Slow or offline networks should not break app boot.
    }
  }));
  await trimCache(cacheName, MAX_RUNTIME_ENTRIES);
};

self.addEventListener('install', (event) => {
  const manifest = Array.isArray(self.__ORCHARD_PRECACHE_MANIFEST)
    ? self.__ORCHARD_PRECACHE_MANIFEST
    : [];
  event.waitUntil((async () => {
    await addUrlsToCache(APP_SHELL_CACHE, ['/', '/index.html', ...manifest]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith('orchard-sw-') && !name.startsWith(SW_VERSION))
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const type = String(event?.data?.type || '');
  if (type === 'ORCHARD_CACHE_URLS') {
    event.waitUntil(addUrlsToCache(RUNTIME_CACHE, event.data.urls || []));
  }
  if (type === 'ORCHARD_CLEAR_ASSET_CACHE') {
    event.waitUntil(Promise.all([caches.delete(APP_SHELL_CACHE), caches.delete(RUNTIME_CACHE)]));
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (!isCacheableRequest(request)) return;

  event.respondWith((async () => {
    const appCache = await caches.open(APP_SHELL_CACHE);
    const runtimeCache = await caches.open(RUNTIME_CACHE);

    if (isAppCodeRequest(request)) {
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) await runtimeCache.put(request, fresh.clone());
        return fresh;
      } catch {
        const fallback = await runtimeCache.match(request)
          || await appCache.match(request)
          || await appCache.match('/index.html')
          || await appCache.match('/');
        if (fallback) return fallback;
        throw new Error('app_code_fetch_failed');
      }
    }

    const cached = await appCache.match(request) || await runtimeCache.match(request);

    if (cached) {
      event.waitUntil((async () => {
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) await runtimeCache.put(request, fresh.clone());
          await trimCache(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES);
        } catch {
          // Cached response is enough when offline or slow.
        }
      })());
      return cached;
    }

    try {
      const response = await fetch(request);
      if (response && response.ok) {
        await runtimeCache.put(request, response.clone());
        event.waitUntil(trimCache(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES));
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const fallback = await appCache.match('/index.html') || await appCache.match('/');
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});
