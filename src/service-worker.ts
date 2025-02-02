/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

import { build, files, version } from "$service-worker";

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

function getIconPath(size: string) {
  return new URL(`/pwa-${size}.png`, self.location.origin).href;
}

const ICONS = {
  DEFAULT: getIconPath('192x192'),
  SMALL: getIconPath('64x64'),
  LARGE: getIconPath('512x512')
};

// Previous cache-related event listeners remain the same...

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  let title = ''; // Use an empty title to suppress "von Stocknear"
  let body: string;
  
  try {
    const payload = event.data.text();
    
    try {
      const jsonData = JSON.parse(payload);
      if (jsonData.title) {
        title = jsonData.title; // Use title from payload if provided
        body = jsonData.body;
      } else {
        body = payload;
      }
    } catch {
      body = payload;
    }
  } catch {
    body = 'New notification';
  }

  const options: NotificationOptions = {
    body,
    icon: ICONS.DEFAULT,
    badge: ICONS.SMALL,
    timestamp: Date.now(),
    requireInteraction: true,
    tag: 'stocknear-notification',
    renotify: true,
    vibrate: [200, 100, 200],
    silent: true, // Prevents Apple from modifying the notification
    data: {
      suppressNotificationFrom: true
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
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