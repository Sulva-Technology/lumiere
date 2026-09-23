import { businessDateKey } from './timezone';
import type { BookingService, ServiceSpecial } from './types';

type SpecialRow = {
  special_price?: number | string | null;
  special_label?: string | null;
  special_starts_on?: string | null;
  special_ends_on?: string | null;
};

export const SPECIAL_COLUMNS = 'special_price, special_label, special_starts_on, special_ends_on';

export function specialFromRow(row: SpecialRow): ServiceSpecial | null {
  const price = Number(row.special_price);
  if (row.special_price == null || !Number.isFinite(price) || !row.special_starts_on || !row.special_ends_on) return null;
  return {
    price,
    label: row.special_label?.trim() || null,
    startsOn: row.special_starts_on.slice(0, 10),
    endsOn: row.special_ends_on.slice(0, 10),
  };
}

/** True when an appointment on this business date gets the special price. */
export function specialAppliesOn(special: ServiceSpecial | null | undefined, dateKey: string) {
  return !!special && dateKey >= special.startsOn && dateKey <= special.endsOn;
}

/** Special is worth showing until its last bookable appointment date has passed. */
export function isSpecialCurrent(special: ServiceSpecial | null | undefined, today = businessDateKey(new Date())) {
  return !!special && special.endsOn >= today;
}

/** Price charged for an appointment starting at this moment. */
export function priceForAppointment(service: Pick<BookingService, 'price' | 'special'>, startsAt: string | Date) {
  return specialAppliesOn(service.special, businessDateKey(startsAt)) ? service.special!.price : service.price;
}

function formatDay(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** "Oct 1 – Oct 31" style range for customer-facing copy. */
export function formatSpecialWindow(special: ServiceSpecial) {
  return special.startsOn === special.endsOn ? formatDay(special.startsOn) : `${formatDay(special.startsOn)} – ${formatDay(special.endsOn)}`;
}
