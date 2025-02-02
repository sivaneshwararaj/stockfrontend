/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

import { build, files, version } from "$service-worker";

// Constants
const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

// Helper function to resolve icon paths
function getIconPath(size: string) {
  return new URL(`/pwa-${size}.png`, self.location.origin).href;
}

// Icon configurations
const ICONS = {
  DEFAULT: getIconPath('192x192'),
  SMALL: getIconPath('64x64'),
  LARGE: getIconPath('512x512')
};

// Cache list of essential assets including icons
const ESSENTIAL_ASSETS = [
  ...ASSETS,
  ICONS.DEFAULT,
  ICONS.SMALL,
  ICONS.LARGE
];

/**
 * Installation handler
 * Caches all static assets and icon files
 */
self.addEventListener("install", (event) => {
  async function addFilesToCache() {
    try {
      const cache = await caches.open(CACHE);
      await cache.addAll(ESSENTIAL_ASSETS);
      console.log('Service worker: Cache populated successfully');
    } catch (error) {
      console.error('Service worker: Cache population failed:', error);
    }
  }

  event.waitUntil(addFilesToCache());
});

/**
 * Activation handler
 * Cleans up old caches
 */
self.addEventListener("activate", (event) => {
  async function deleteOldCaches() {
    try {
      const keys = await caches.keys();
      await Promise.all(
        keys.map(key => {
          if (key !== CACHE) {
            console.log('Service worker: Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    } catch (error) {
      console.error('Service worker: Error cleaning old caches:', error);
    }
  }

  event.waitUntil(deleteOldCaches());
});

/**
 * Fetch handler
 * Implements a cache-first strategy for static assets
 * and a network-first strategy for other requests
 */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // Serve static assets from cache first
    if (ESSENTIAL_ASSETS.includes(url.pathname)) {
      const cacheResponse = await cache.match(url.pathname);
      if (cacheResponse) {
        return cacheResponse;
      }
    }

    // Network-first strategy for other requests
    try {
      const response = await fetch(event.request);
      
      // Cache successful responses
      if (response.status === 200) {
        const responseToCache = response.clone();
        cache.put(event.request, responseToCache).catch(error => {
          console.error('Service worker: Error caching response:', error);
        });
      }
      
      return response;
    } catch (error) {
      // Fallback to cache if network fails
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      console.error('Service worker: Network and cache fetch failed:', error);
      return new Response("Network error", { status: 503 });
    }
  }

  event.respondWith(respond());
});

/**
 * Push notification handler
 * Processes push notifications and displays them to the user
 */
self.addEventListener('push', (event: PushEvent) => {
  let payload = 'No payload';
  let title = 'Stocknear';
  
  let options: NotificationOptions = {
    icon: ICONS.DEFAULT,
    badge: ICONS.SMALL,
    image: ICONS.LARGE,
    data: {},
    tag: 'stocknear-notification', // Group similar notifications
    renotify: true, // Notify even if there's an existing notification
    silent: false,
    timestamp: Date.now(), // Required for iOS
    requireInteraction: true, // Keep notification until user interacts
    vibrate: [200, 100, 200], // Vibration pattern [vibrate, pause, vibrate]
  };

  try {
    if (event.data) {
      let data;
      try {
        // Try to parse JSON payload
        data = event.data.json();
      } catch (e) {
        // Fallback to text payload
        data = { body: event.data.text() };
      }
      
      payload = data.body || data.message || 'New notification';
      title = data.title || title;
      
      // Merge options while preserving critical values
      options = {
        ...options,
        body: payload,
        ...(data.options || {}),
        // Ensure icon paths aren't overwritten
        icon: ICONS.DEFAULT,
        badge: ICONS.SMALL,
        image: ICONS.LARGE
      };
    }
  } catch (error) {
    console.error('Service worker: Error processing push notification:', error);
    options.body = payload;
  }

  // Log notification details for debugging
  console.log('Service worker: Showing notification', {
    title,
    options,
    icons: {
      icon: options.icon,
      badge: options.badge,
      image: options.image
    }
  });

  const promiseChain = self.registration.showNotification(title, options);
  event.waitUntil(promiseChain);
});

/**
 * Notification click handler
 * Handles user interaction with notifications
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL('/', self.location.origin).href;

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then((windowClients) => {
    // Focus existing window if available
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      if (client.url === urlToOpen && 'focus' in client) {
        return client.focus();
      }
    }
    // Open new window if necessary
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});

/**
 * Message handler
 * Processes messages from the main thread
 */
self.addEventListener("message", (event) => {
  // Handle skip waiting
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  
  // Handle cache update
  if (event.data && event.data.type === "CACHE_URLS") {
    event.waitUntil(
      caches.open(CACHE)
        .then((cache) => cache.addAll(event.data.payload))
        .catch((error) => console.error('Service worker: Cache update failed:', error))
    );
  }
});