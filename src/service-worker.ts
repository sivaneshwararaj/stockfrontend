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

// Previous installation, activation, and fetch handlers remain the same...

/**
 * Push notification handler
 * Processes push notifications and displays them to the user
 */
self.addEventListener('push', (event: PushEvent) => {
  let title = 'Stocknear';
  let body = 'New notification';
  
  let options: NotificationOptions = {
    icon: ICONS.DEFAULT,
    badge: ICONS.SMALL,
    image: ICONS.LARGE,
    data: {},
    tag: 'stocknear-notification',
    renotify: true,
    silent: false,
    timestamp: Date.now(),
    requireInteraction: true,
    vibrate: [200, 100, 200],
  };

  try {
    if (event.data) {
      let data;
      
      // Try to parse the payload
      try {
        // First attempt to parse as JSON
        data = event.data.json();
        
        // Handle both string and object payloads
        if (typeof data === 'string') {
          try {
            // Try parsing string as JSON again (double encoded case)
            data = JSON.parse(data);
          } catch {
            // If parsing fails, use it as the body
            body = data;
          }
        } else {
          // Extract title and body from object
          title = data.title || title;
          body = data.body || data.message || body;
        }
      } catch (e) {
        // If JSON parsing fails, try getting text
        body = event.data.text();
        
        // Check if the text is a JSON string
        try {
          const textData = JSON.parse(body);
          title = textData.title || title;
          body = textData.body || textData.message || body;
        } catch {
          // If parsing fails, use the text as is
        }
      }

      // Update options with parsed data
      options = {
        ...options,
        body,
        // Preserve critical options
        icon: ICONS.DEFAULT,
        badge: ICONS.SMALL,
        image: ICONS.LARGE
      };
    }
  } catch (error) {
    console.error('Service worker: Error processing push notification:', error);
    options.body = body;
  }

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