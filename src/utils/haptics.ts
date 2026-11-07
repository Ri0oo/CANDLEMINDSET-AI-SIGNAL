/**
 * Haptic vibration feedback utility using Navigator Vibration API
 */

export function triggerSignalCompleteVibration(direction?: 'UP' | 'DOWN'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return;
  }

  if (!('vibrate' in navigator)) {
    return;
  }

  try {
    // Subtle double pulse: 40ms buzz, 60ms pause, 45ms buzz
    // Provides crisp tactile confirmation without being harsh
    if (direction === 'UP') {
      navigator.vibrate([35, 45, 55]);
    } else if (direction === 'DOWN') {
      navigator.vibrate([55, 45, 35]);
    } else {
      navigator.vibrate([40, 60, 40]);
    }
  } catch {
    // Browser may restrict vibration without user gesture or in some iframe modes
  }
}
