import { businessDateKey } from './timezone';

export type ServiceWindow = { startsOn: string; endsOn: string };

export function bookingWindowFromRow(row: { available_from?: string | null; available_until?: string | null }): ServiceWindow | null {
  return row.available_from && row.available_until
    ? { startsOn: row.available_from, endsOn: row.available_until }
    : null;
}

/** Where today sits relative to the service's allowed appointment dates. */
export function serviceStatus(service: { active?: boolean; bookingWindow?: ServiceWindow | null }, today = businessDateKey(new Date())) {
  if (service.active === false) return 'Hidden';
  if (service.bookingWindow && today < service.bookingWindow.startsOn) return 'Scheduled';
  if (service.bookingWindow && today > service.bookingWindow.endsOn) return 'Expired';
  return 'Active';
}

export function isServiceBookable(row: { active?: boolean; available_from?: string | null; available_until?: string | null }) {
  return serviceAcceptsBookings({ active: row.active, bookingWindow: bookingWindowFromRow(row) });
}

/** Customers may book now for any service whose appointment window has not ended. */
export function serviceAcceptsBookings(service: { active?: boolean; bookingWindow?: ServiceWindow | null }, today = businessDateKey(new Date())) {
  return service.active !== false && (!service.bookingWindow || today <= service.bookingWindow.endsOn);
}

/** The chosen appointment itself must fall inside the configured date range. */
export function serviceAllowsAppointment(service: { active?: boolean; bookingWindow?: ServiceWindow | null }, startsAt: string | Date) {
  if (!serviceAcceptsBookings(service)) return false;
  if (!service.bookingWindow) return true;
  const appointmentDay = businessDateKey(startsAt);
  return appointmentDay >= service.bookingWindow.startsOn && appointmentDay <= service.bookingWindow.endsOn;
}

/** Future-window services are advertised immediately and disappear after the end. */
export function isServiceVisible(row: { active?: boolean; available_from?: string | null; available_until?: string | null }, today = businessDateKey(new Date())) {
  return serviceAcceptsBookings({ active: row.active, bookingWindow: bookingWindowFromRow(row) }, today);
}

function formatDay(day: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${day}T00:00:00Z`));
}

export function appointmentWindowLabel(service: { bookingWindow?: ServiceWindow | null }) {
  if (!service.bookingWindow) return null;
  return `Appointments ${formatDay(service.bookingWindow.startsOn)} – ${formatDay(service.bookingWindow.endsOn)}`;
}
