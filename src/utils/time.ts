/**
 * Time utilities for CANDLE MINDSET AI SIGNAL
 * Asia/Dhaka timezone (UTC+6)
 * 24-hour format (HH:MM)
 */

export interface DhakaEntryTimeResult {
  formattedTime: string;      // e.g. "17:46"
  m1String: string;           // e.g. "M1 = 17:46"
  entryTimestamp: number;     // exact epoch timestamp
  dhakaNowString: string;     // e.g. "17:45:32"
}

/**
 * Calculates the next minute entry time in Asia/Dhaka (UTC+6)
 *
 * Rules:
 * Signal generation occurs at timestamp T.
 * The next minute boundary is calculated by taking the floor of current minute + 1 minute:
 * - 17:45:00 -> M1 = 17:46
 * - 17:45:30 -> M1 = 17:46
 * - 17:45:59 -> M1 = 17:46
 * - 17:46:00 -> M1 = 17:47
 */
export function calculateDhakaNextMinute(timestamp: number = Date.now()): DhakaEntryTimeResult {
  const currentFloorMinute = Math.floor(timestamp / 60000) * 60000;
  const nextMinuteTimestamp = currentFloorMinute + 60000;
  const nextMinuteDate = new Date(nextMinuteTimestamp);

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const nowFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedTime = timeFormatter.format(nextMinuteDate);
  const dhakaNowString = nowFormatter.format(new Date(timestamp));

  return {
    formattedTime,
    m1String: `M1 = ${formattedTime}`,
    entryTimestamp: nextMinuteTimestamp,
    dhakaNowString,
  };
}

/**
 * Returns current live time in Asia/Dhaka (HH:MM:SS)
 */
export function getLiveDhakaTime(): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return formatter.format(new Date());
}

/**
 * Checks if a Quotex screenshot timer (e.g. "13:25") is expired
 * based on current Asia/Dhaka live time.
 *
 * Example rule:
 * Screenshot captured at 13:25:
 * - 13:25 -> 0 min diff -> Fresh (Signals OK)
 * - 13:26 -> 1 min diff -> Fresh (Signals OK)
 * - 13:27 -> 2 min diff -> Fresh (Signals OK)
 * - 13:28 -> 3 min diff -> EXPIRED (Must take new screenshot)
 */
export function checkDhakaScreenshotExpiration(
  screenshotTimeStr: string,
  nowTimestamp: number = Date.now()
): {
  isExpired: boolean;
  currentDhakaTime: string;
  diffSeconds: number;
  diffMinutes: number;
  expireTimeFormatted: string;
  message: string;
} {
  const dhakaFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const currentDhakaTime = dhakaFormatter.format(new Date(nowTimestamp));

  const timeParts = screenshotTimeStr.split(':').map(Number);
  const sH = timeParts[0] || 0;
  const sM = timeParts[1] || 0;
  const sS = timeParts[2] || 0;
  const screenshotSeconds = sH * 3600 + sM * 60 + sS;

  const [nowH, nowM, nowS] = currentDhakaTime.split(':').map(Number);
  const nowDhakaSeconds = nowH * 3600 + nowM * 60 + nowS;

  // Circular difference handling 24h midnight wrap
  let diffSec = nowDhakaSeconds - screenshotSeconds;
  if (diffSec < -43200) diffSec += 86400;
  if (diffSec > 43200) diffSec -= 86400;

  let diffMin = (nowH * 60 + nowM) - (sH * 60 + sM);
  if (diffMin < -720) diffMin += 1440;
  if (diffMin > 720) diffMin -= 1440;

  // Expired if current Dhaka minute is >= screenshot minute + 3 (e.g. 1:25 -> 1:28)
  // or diffSec >= 180 (3 minutes) or screenshot is from the future (diffSec < -120)
  const isExpired = diffMin >= 3 || diffSec >= 180 || diffSec < -120;

  // Target expiry time (screenshot minute + 3)
  const expTotalMin = (sH * 60 + sM + 3) % 1440;
  const expH = String(Math.floor(expTotalMin / 60)).padStart(2, '0');
  const expM = String(expTotalMin % 60).padStart(2, '0');
  const expireTimeFormatted = `${expH}:${expM}`;

  const minStr = Math.floor(Math.abs(diffSec) / 60);
  const secStr = Math.abs(diffSec) % 60;

  return {
    isExpired,
    currentDhakaTime,
    diffSeconds: diffSec,
    diffMinutes: diffMin,
    expireTimeFormatted,
    message: isExpired
      ? `QUOTEX SCREENSHOT EXPIRED: Captured at ${screenshotTimeStr}. Dhaka time is now ${currentDhakaTime} (${minStr}m ${secStr}s elapsed). Please take a new live screenshot.`
      : `Quotex timer verified (${screenshotTimeStr}). Dhaka time: ${currentDhakaTime}. Valid until ${expireTimeFormatted}.`,
  };
}

