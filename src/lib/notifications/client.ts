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

/**
 * Plays a subtle acoustic tick for 10-second warning
 */
export function playTickChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {}
}

/**
 * Plays a refreshing water droplet chime for hydration alerts
 */
export function playWaterChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Drop 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(700, now);
    osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.15);

    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Drop 2 (harmonic splash)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1050, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.28);

    gain2.gain.setValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.35);
  } catch {}
}

/**
 * Plays a victory fanfare for Personal Record achievements
 */
export function playFanfareChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.12;
      const duration = idx === notes.length - 1 ? 0.45 : 0.15;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch {}
}

export interface MobileNotificationOptions {
  body?: string;
  tag?: string;
  url?: string;
  vibrate?: number[];
  renotify?: boolean;
  soundType?: 'chime' | 'tick' | 'water' | 'fanfare' | 'none';
}

/**
 * Dispatches a native Android notification via the Service Worker
 * Works when app is minimized or phone screen is locked
 */
export async function sendMobileNotification(
  title: string,
  options: MobileNotificationOptions = {}
): Promise<boolean> {
  const soundType = options.soundType || 'chime';
  if (soundType === 'chime') playGymChime();
  else if (soundType === 'tick') playTickChime();
  else if (soundType === 'water') playWaterChime();
  else if (soundType === 'fanfare') playFanfareChime();

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
