import type { Deal } from '../types';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem('dealpulse_notifications_enabled', permission === 'granted' ? 'true' : 'false');
    return permission === 'granted';
  } catch {
    return false;
  }
}

export function isNotificationsEnabled(): boolean {
  if (!isNotificationSupported()) return false;
  return Notification.permission === 'granted' && localStorage.getItem('dealpulse_notifications_enabled') === 'true';
}

export function triggerDealPushNotification(deal: Deal) {
  if (!isNotificationsEnabled()) return;

  try {
    const title = `🔥 HOT DEAL: ${deal.store} - ${deal.discountPercentage > 0 ? `${deal.discountPercentage}% OFF` : 'Special Bonus'}`;
    const body = `${deal.title}\nNow $${deal.dealPrice.toFixed(2)} ${deal.couponCode ? `(Code: ${deal.couponCode})` : ''}`;

    const notification = new Notification(title, {
      body,
      icon: deal.imageUrl || '/images/chase_card.jpg',
      badge: '/images/chase_card.jpg',
      tag: deal.id
    });

    notification.onclick = () => {
      window.focus();
      window.open(deal.affiliateUrl, '_blank');
    };
  } catch (err) {
    console.error('Push notification failed', err);
  }
}
