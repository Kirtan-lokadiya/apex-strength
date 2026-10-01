'use client';

/**
 * Android PWA Native Push & Local Notification Service
 * 100% Free, Unlimited, Works Offline in Gym Environment
 */

export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return 'denied';
  }
}

/**
 * Synthesizes a gym chime using Web Audio API
 * Plays reliable acoustic cue even when user is wearing headphones
 */
export function playGymChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Dual-tone high pitch sequence (880Hz -> 1760Hz)
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.25);

    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second beep for punchy feedback
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, now + 0.35);
    osc2.frequency.setValueAtTime(1760, now + 0.5);

    gain2.gain.setValueAtTime(0.3, now + 0.35);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.35);
    osc2.stop(now + 0.65);
  } catch {
    // Audio context may require user interaction policy
  }
}

export interface MobileNotificationOptions {
  body?: string;
  tag?: string;
  url?: string;
  vibrate?: number[];
  renotify?: boolean;
}

/**
 * Dispatches a native Android notification via the Service Worker
 * Works when app is minimized or phone screen is locked
 */
export async function sendMobileNotification(
  title: string,
  options: MobileNotificationOptions = {}
): Promise<boolean> {
  // Always trigger sound & haptic vibration
  playGymChime();

  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(options.vibrate || [300, 100, 300, 100, 300]);
    } catch {}
  }

  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration && registration.showNotification) {
      await registration.showNotification(title, {
        body: options.body || 'Ready for your next set!',
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        vibrate: options.vibrate || [400, 150, 400],
        data: { url: options.url || '/workout' },
        tag: options.tag || 'apex-alert',
        renotify: options.renotify ?? true,
      } as NotificationOptions & { vibrate?: number[]; badge?: string; renotify?: boolean });
      return true;
    }
  } catch (e) {
    console.warn('Service worker notification failed, trying fallback:', e);
  }

  // Fallback direct Notification object
  try {
    new Notification(title, {
      body: options.body,
      icon: '/icons/icon-192.svg',
      tag: options.tag,
    });
    return true;
  } catch {
    return false;
  }
}
