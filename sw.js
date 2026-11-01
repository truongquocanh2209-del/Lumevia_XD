'use strict';

/*
 * AEVORA StudyOS offline app shell.
 * This worker caches only the same-origin application shell. It does not cache
 * external learning resources, user-linked destinations, or arbitrary API data.
 */
const CACHE_PREFIX = 'orilynth-app-shell-';
const CACHE_NAME = `${CACHE_PREFIX}v3.7.0`;
const APP_SHELL = [
  './',
  './index.html',
  './site.css?v=3.7.0',
  './app.js?v=3.7.0',
  './evolution.js?v=3.7.0',
  './exam-import.js?v=3.7.0',
  './aevora.js?v=3.7.0',
  './next.js?v=3.7.0',
  './studio.js?v=3.7.0',
  './mastery30.js?v=3.7.0',
  './profile30.js?v=3.7.0',
  './motion32.js?v=3.7.0',
  './upgrade33.js?v=3.7.0',
  './experience37.js?v=3.7.0',
  './manifest.webmanifest',
  './assets/fonts/DejaVuSerif.woff',
  './assets/fonts/DejaVuSerif-Bold.woff',
  './assets/fonts/DejaVuSans.woff',
  './assets/fonts/DejaVuSans-Bold.woff',
  './lumevia-favicon.png',
  './lumevia-mark.png',
  './lumevia-icon-192.png',
  './lumevia-icon-512.png'
];

const absoluteUrl = path => new URL(path, self.registration.scope).href;
const inScope = url => url.origin === self.location.origin && url.pathname.startsWith(new URL(self.registration.scope).pathname);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL.map(absoluteUrl));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // Retain the immediately previous release while its tabs may still be open.
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME && key !== `${CACHE_PREFIX}v3.6.0`).map(key => caches.delete(key))); 
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!inScope(url)) return;

  // Navigation is network-first so deployments can update normally, with a
  // cached index fallback when the network is unavailable.
  if (request.mode === 'navigate') {
    const scopeUrl = new URL(self.registration.scope);
    const appIndexPath = new URL('./index.html', self.registration.scope).pathname;
    // Only the application entry point needs SPA-style offline fallback; do not
    // replace README or other same-origin documents with the app shell.
    if (url.pathname !== scopeUrl.pathname && url.pathname !== appIndexPath) return;
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request,{cacheName:CACHE_NAME})) || (await caches.match(absoluteUrl('./index.html'),{cacheName:CACHE_NAME})) || Response.error();
      }
    })());
    return;
  }

  // Cache only versioned shell files and selected local scene images, never arbitrary URLs.
  const shellUrls = new Set(APP_SHELL.map(absoluteUrl));
  const sceneRoot = new URL('./assets/scenes/', self.registration.scope).href;
  if (!shellUrls.has(url.href) && !(url.href.startsWith(sceneRoot) && url.pathname.endsWith('.webp'))) return;
  // Same-origin application assets are cache-first after the initial install.
  event.respondWith((async () => {
    const cached = await caches.match(request,{cacheName:CACHE_NAME});
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
