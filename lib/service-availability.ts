import { businessDateKey } from './timezone';

export type ServiceWindow = { startsOn: string; endsOn: string };

export function bookingWindowFromRow(row: { available_from?: string | null; available_until?: string | null }): ServiceWindow | null {
  return row.available_from && row.available_until
    ? { startsOn: row.available_from, endsOn: row.available_until }
    : null;
}

/** Booking placement dates, inclusive, on the studio's clock. No cron needed. */
export function serviceStatus(service: { active?: boolean; bookingWindow?: ServiceWindow | null }, today = businessDateKey(new Date())) {
  if (service.active === false) return 'Hidden';
  if (service.bookingWindow && today < service.bookingWindow.startsOn) return 'Scheduled';
  if (service.bookingWindow && today > service.bookingWindow.endsOn) return 'Expired';
  return 'Active';
}

export function isServiceBookable(row: { active?: boolean; available_from?: string | null; available_until?: string | null }) {
  return serviceStatus({ active: row.active, bookingWindow: bookingWindowFromRow(row) }) === 'Active';
}
