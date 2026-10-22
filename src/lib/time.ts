/**
 * The gym is located in Toronto, so admins enter session dates/times as
 * wall-clock values in this timezone and customers see them the same way.
 *
 * The booking cut-off must therefore be evaluated in this timezone too. If it
 * is not, a server running in UTC (e.g. Vercel) parses "18:00" as 18:00 UTC
 * instead of 18:00 Toronto — shifting every same-day session by several hours
 * and wrongly closing sessions that are still hours away.
 */
export const GYM_TIME_ZONE = "America/Toronto";

/** A session stays bookable until 20 minutes before its start time. */
export const BOOKING_CUTOFF_MS = 20 * 60 * 1000;

/**
 * Convert a wall-clock date ("YYYY-MM-DD") and time ("HH:MM") in `timeZone`
 * into a UTC epoch timestamp in milliseconds.
 *
 * Works regardless of the server's local timezone and handles DST.
 */
export function zonedWallClockToEpoch(
  dateStr: string,
  timeStr: string,
  timeZone: string = GYM_TIME_ZONE
): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);

  // Treat the wall clock as if it were UTC, then correct by the zone offset.
  const guess = Date.UTC(y, m - 1, d, hh, mm);

  const offsetAt = (instant: number): number => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(instant));
    const get = (t: string) =>
      Number(parts.find((p) => p.type === t)?.value ?? 0);
    const asUtc = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second")
    );
    return asUtc - instant;
  };

  let result = guess - offsetAt(guess);
  // Refine once so times near a DST transition resolve to the right offset.
  const refined = guess - offsetAt(result);
  if (refined !== result) result = refined;
  return result;
}

/**
 * Whether a session (wall-clock date + start time in the gym timezone) is
 * still bookable: at least 20 minutes before it starts.
 */
export function isSessionBookable(
  dateStr: string,
  startStr: string,
  nowMs: number = Date.now()
): boolean {
  return zonedWallClockToEpoch(dateStr, startStr) - nowMs >= BOOKING_CUTOFF_MS;
}
