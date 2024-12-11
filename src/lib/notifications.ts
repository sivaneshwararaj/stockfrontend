
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

export function sendNotification(title: string, options?: NotificationOptions & { iconSize?: number }) {
  // Only send if permission is granted
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: "/pwa-192x192.png", // Use the imported image directly
      ...options
    });
  }
}