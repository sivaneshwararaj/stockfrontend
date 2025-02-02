import { goto } from '$app/navigation';

export async function requestNotificationPermission() {
  // Check if the browser supports notifications
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }
  // Check the current permission status
  if (Notification.permission === 'granted') {
    return true;
  }
  // Request permission
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}


export function sendNotification(
    title: string,
    options?: NotificationOptions & { iconSize?: number; url?: string }
) {
    // Only send if permission is granted
    if (Notification.permission === 'granted') {
        // Extract custom properties and remaining NotificationOptions
        const { iconSize, url, ...notificationOptions } = options || {};

        const notification = new Notification(title, {
            icon: "/pwa-192x192.png",
            ...notificationOptions // Spread only valid NotificationOptions
        });

        // Navigate when the notification is clicked
        if (url) {
            notification.onclick = () => {
                window.focus(); // Ensure the window is focused
                goto(url); // Client-side navigation
            };
        }
    }
}