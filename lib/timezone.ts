/**
 * Every appointment time on the site is read and written in the studio's clock,
 * no matter where the server runs or where the client is browsing from.
 * Arizona stays on MST (UTC-7) all year.
 */
export const BUSINESS_TIME_ZONE = "America/Phoenix";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function zonedParts(date: Date) {
  const parts: Record<string, number> = {};
  for (const part of partsFormatter.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }
  return parts as Record<"year" | "month" | "day" | "hour" | "minute" | "second", number>;
}

/** Milliseconds the business clock is ahead of UTC at this moment. */
function zoneOffset(date: Date) {
  const p = zonedParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Calendar date (yyyy-mm-dd) of a moment on the business clock. */
export function businessDateKey(value: Date | string) {
  const p = zonedParts(new Date(value));
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** The moment a business-clock date and time (hh:mm, "24:00" allowed) happens. */
export function businessDateTime(day: string, time = "00:00") {
  const [year, month, date] = day.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const wallClock = Date.UTC(year, month - 1, date, hours, minutes);
  const guess = wallClock - zoneOffset(new Date(wallClock));
  return new Date(wallClock - zoneOffset(new Date(guess)));
}

/** Shift a yyyy-mm-dd date by whole days. */
export function addDaysToKey(day: string, days: number) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + days)).toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday for a yyyy-mm-dd date. */
export function weekdayOfKey(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date)).getUTCDay();
}
