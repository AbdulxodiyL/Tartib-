export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendNotification(title, body, icon = '/icon-192.png') {
  if (Notification.permission !== 'granted') return;
  const n = new Notification(title, { body, icon, badge: '/icon-192.png', vibrate: [200, 100, 200] });
  setTimeout(() => n.close(), 6000);
}
