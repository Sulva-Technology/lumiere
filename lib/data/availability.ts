import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AvailabilityDayOverride,
  AvailabilityRule,
} from "@/lib/types";

/**
 * Supabase defaults to returning at most 1000 rows per query.
 * This helper paginates through the full result set so syncing
 * and querying work correctly when there are thousands of slots.
 */
async function fetchAllRows<T extends Record<string, unknown>>(
  queryBuilder: ReturnType<ReturnType<typeof createSupabaseAdminClient>["from"]>["select"],
): Promise<T[]> {
  const PAGE = 1000;
  const all: T[] = [];
  let offset = 0;
  while (true) {
    console.log(`[fetchAllRows] fetching offset ${offset} to ${offset + PAGE - 1}`);
    const { data, error } = await (queryBuilder as any).range(offset, offset + PAGE - 1);
    if (error) {
      console.error(`[fetchAllRows] Error:`, error);
      throw error;
    }
    console.log(`[fetchAllRows] got ${data ? data.length : 0} rows`);
    if (!data || data.length === 0) break;
    all.push(...(data as T[]));
    if (data.length < PAGE) break;
    offset += PAGE;
    if (offset > 50000) {
      console.error(`[fetchAllRows] Safety break triggered at 50,000 rows!`);
      break;
    }
  }
  return all;
}

function relationFirst<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function mapRule(row: any): AvailabilityRule {
  return {
    id: row.id,
    stylistId: row.stylist_id,
    serviceId: row.service_id,
    weekday: row.weekday,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    active: row.active,
  };
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function withTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const copy = new Date(date);
  copy.setHours(hours, minutes, 0, 0);
  return copy;
}

function nextWeekday(base: Date, weekday: number) {
  const copy = startOfDay(base);
  const delta = (weekday - copy.getDay() + 7) % 7;
  copy.setDate(copy.getDate() + delta);
  return copy;
}

/** Calendar key (yyyy-mm-dd) for a moment, read in the same clock the slots are built in. */
function localDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function parseLocalDay(day: string) {
  return new Date(`${day}T00:00:00`);
}

type DayWindow = { start: number; end: number };

function mapOverride(row: any): AvailabilityDayOverride {
  return {
    id: row.id,
    stylistId: row.stylist_id,
    day: row.day,
    isOff: row.is_off,
    startTime: row.start_time ? String(row.start_time).slice(0, 5) : null,
    endTime: row.end_time ? String(row.end_time).slice(0, 5) : null,
  };
}

export async function getAvailabilityAdminRows() {
  await syncRecurringAvailabilityRules();
  const supabase = createSupabaseAdminClient();
  const [
    { data: availability, error: availabilityError },
    { data: activeReservations, error: reservationError },
  ] = await Promise.all([
    supabase
      .from("booking_availability")
      .select(
        "id, starts_at, ends_at, is_available, service_id, stylist_id, stylists(name), booking_services(name), bookings(id)",
      )
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true }),
    supabase
      .from("booking_reservations")
      .select("availability_id")
      .eq("reservation_status", "pending_payment")
      .gt("expires_at", new Date().toISOString()),
  ]);

  if (availabilityError) throw availabilityError;
  if (reservationError) throw reservationError;

  const reservedIds = new Set(
    (activeReservations ?? []).map(
      (reservation) => reservation.availability_id,
    ),
  );

  return (availability ?? []).map((slot) => ({
    id: slot.id,
    starts_at: slot.starts_at,
    ends_at: slot.ends_at,
    is_available: slot.is_available,
    has_booking: Array.isArray(slot.bookings)
      ? slot.bookings.length > 0
      : false,
    is_reserved: reservedIds.has(slot.id),
    booking_services: relationFirst(slot.booking_services) ?? null,
    stylists: relationFirst(slot.stylists) ?? null,
  }));
}

export async function createAvailabilitySlot(input: {
  stylistId: string;
  serviceId: string;
  startsAt: string;
  durationMinutes: number;
}) {
  const supabase = createSupabaseAdminClient();
  const startsAtDate = new Date(input.startsAt);
  const endsAtDate = new Date(
    startsAtDate.getTime() + input.durationMinutes * 60_000,
  );

  const { data: overlapping } = await supabase
    .from("booking_availability")
    .select("id")
    .eq("stylist_id", input.stylistId)
    .eq("service_id", input.serviceId)
    .lt("starts_at", endsAtDate.toISOString())
    .gt("ends_at", startsAtDate.toISOString())
    .limit(1)
    .maybeSingle();

  if (overlapping) {
    throw new Error("That time overlaps an existing availability slot.");
  }

  const { data, error } = await supabase
    .from("booking_availability")
    .insert({
      stylist_id: input.stylistId,
      service_id: input.serviceId,
      starts_at: startsAtDate.toISOString(),
      ends_at: endsAtDate.toISOString(),
      is_available: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createAvailabilitySchedule(input: {
  stylistId: string;
  startDate: string;
  endDate: string;
  weekdayStartTime: string;
  weekdayEndTime: string;
  weekendStartTime: string;
  weekendEndTime: string;
}) {
  if (
    toMinutes(input.weekdayEndTime) <= toMinutes(input.weekdayStartTime) ||
    toMinutes(input.weekendEndTime) <= toMinutes(input.weekendStartTime)
  ) {
    throw new Error("Each end time must be later than its start time.");
  }

  const supabase = createSupabaseAdminClient();
  const [
    { data: services, error: servicesError },
    { data: existing, error: existingError },
  ] = await Promise.all([
    supabase
      .from("booking_services")
      .select("id, duration_minutes")
      .eq("active", true),
    supabase
      .from("booking_availability")
      .select("stylist_id, service_id, starts_at")
      .eq("stylist_id", input.stylistId)
      .gte("starts_at", `${input.startDate}T00:00:00.000Z`)
      .lte("starts_at", `${input.endDate}T23:59:59.999Z`),
  ]);

  if (servicesError) throw servicesError;
  if (existingError) throw existingError;

  const existingKeys = new Set(
    (existing ?? []).map(
      (slot) =>
        `${slot.stylist_id}:${slot.service_id}:${new Date(slot.starts_at).toISOString()}`,
    ),
  );
  const inserts: Array<{
    stylist_id: string;
    service_id: string;
    starts_at: string;
    ends_at: string;
    is_available: true;
  }> = [];
  const current = new Date(`${input.startDate}T00:00:00`);
  const lastDay = new Date(`${input.endDate}T00:00:00`);

  while (current <= lastDay) {
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;
    const startTime = isWeekend
      ? input.weekendStartTime
      : input.weekdayStartTime;
    const endTime = isWeekend ? input.weekendEndTime : input.weekdayEndTime;

    for (const service of services ?? []) {
      let cursor = withTime(current, startTime);
      const windowEnd = withTime(current, endTime);

      while (
        cursor.getTime() + service.duration_minutes * 60_000 <=
        windowEnd.getTime()
      ) {
        const slotEnd = new Date(
          cursor.getTime() + service.duration_minutes * 60_000,
        );
        const key = `${input.stylistId}:${service.id}:${cursor.toISOString()}`;
        if (!existingKeys.has(key) && cursor > new Date()) {
          inserts.push({
            stylist_id: input.stylistId,
            service_id: service.id,
            starts_at: cursor.toISOString(),
            ends_at: slotEnd.toISOString(),
            is_available: true,
          });
          existingKeys.add(key);
        }
        cursor = new Date(cursor.getTime() + 30 * 60_000);
      }
    }

    current.setDate(current.getDate() + 1);
  }

  if (inserts.length > 0) {
    const { error } = await supabase
      .from("booking_availability")
      .insert(inserts);
    if (error) throw error;
  }

  return { created: inserts.length };
}

export async function deleteAvailabilitySlot(id: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: booking }, { data: reservation }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id")
      .eq("availability_id", id)
      .maybeSingle(),
    supabase
      .from("booking_reservations")
      .select("id")
      .eq("availability_id", id)
      .eq("reservation_status", "pending_payment")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle(),
  ]);

  if (booking || reservation) {
    throw new Error(
      "This slot is already reserved or booked and cannot be removed.",
    );
  }

  const { error } = await supabase
    .from("booking_availability")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getAvailabilityRules() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_availability_rules")
    .select("*")
    .order("weekday")
    .order("start_time");
  if (error) throw error;
  return (data ?? []).map(mapRule);
}

export async function upsertAvailabilityRule(input: {
  id?: string;
  stylistId: string;
  serviceId?: string | null;
  weekday: number;
  startTime: string;
  endTime: string;
  active?: boolean;
}) {
  if (toMinutes(input.endTime) <= toMinutes(input.startTime)) {
    throw new Error("End time must be later than start time.");
  }

  const supabase = createSupabaseAdminClient();
  const payload = {
    stylist_id: input.stylistId,
    service_id: input.serviceId ?? null,
    weekday: input.weekday,
    start_time: `${input.startTime}:00`,
    end_time: `${input.endTime}:00`,
    active: input.active ?? true,
  };

  const query = input.id
    ? supabase
        .from("booking_availability_rules")
        .update(payload)
        .eq("id", input.id)
    : supabase.from("booking_availability_rules").insert(payload);

  const { data, error } = await query.select("*").single();
  if (error) throw error;

  await syncRecurringAvailabilityRules();
  return mapRule(data);
}

export async function deleteAvailabilityRule(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("booking_availability_rules")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export interface WeeklyAvailabilityDay {
  weekday: number;
  off: boolean;
  startTime: string;
  endTime: string;
}

export interface AvailabilityChangeResult {
  removed: number;
  kept: number;
}

/** Booked or held slots must survive a schedule change, so she never loses a client. */
async function protectedSlotIds(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  stylistId: string,
) {
  const nowIso = new Date().toISOString();
  const [{ data: bookings }, { data: reservations }] = await Promise.all([
    supabase
      .from("bookings")
      .select("availability_id")
      .eq("stylist_id", stylistId)
      .gte("starts_at", nowIso),
    supabase
      .from("booking_reservations")
      .select("availability_id")
      .eq("stylist_id", stylistId)
      .eq("reservation_status", "pending_payment")
      .gt("expires_at", nowIso),
  ]);

  const ids = new Set<string>();
  for (const row of [...(bookings ?? []), ...(reservations ?? [])]) {
    if (row.availability_id) ids.add(row.availability_id as string);
  }
  return ids;
}

/** The weekly grid as a lookup: weekday -> window. A weekday with no window is a day off. */
async function weeklyCoverage(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  stylistId: string,
) {
  const { data, error } = await supabase
    .from("booking_availability_rules")
    .select("weekday, start_time, end_time")
    .eq("stylist_id", stylistId)
    .eq("active", true)
    .is("service_id", null);
  if (error) throw error;

  const coverage = new Map<number, DayWindow>();
  for (const rule of data ?? []) {
    const start = toMinutes(String(rule.start_time).slice(0, 5));
    const end = toMinutes(String(rule.end_time).slice(0, 5));
    const current = coverage.get(rule.weekday);
    coverage.set(rule.weekday, {
      start: current ? Math.min(current.start, start) : start,
      end: current ? Math.max(current.end, end) : end,
    });
  }
  return coverage;
}

/** Per-date changes as a lookup: date -> window, or null when the whole day is off. */
async function dayOverrideWindows(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  stylistId: string,
) {
  const { data, error } = await supabase
    .from("booking_availability_day_overrides")
    .select("day, is_off, start_time, end_time")
    .eq("stylist_id", stylistId);
  if (error) throw error;

  const overrides = new Map<string, DayWindow | null>();
  for (const row of data ?? []) {
    overrides.set(
      row.day as string,
      row.is_off
        ? null
        : {
            start: toMinutes(String(row.start_time).slice(0, 5)),
            end: toMinutes(String(row.end_time).slice(0, 5)),
          },
    );
  }
  return overrides;
}

/**
 * Drop open slots the new schedule no longer covers, so the public booking page stops
 * offering times she switched off. Slots with a booking or a pending hold are kept.
 */
async function pruneOpenSlots(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  stylistId: string,
  range: { from: string; to?: string },
): Promise<AvailabilityChangeResult> {
  const [coverage, overrides, protectedIds] = await Promise.all([
    weeklyCoverage(supabase, stylistId),
    dayOverrideWindows(supabase, stylistId),
    protectedSlotIds(supabase, stylistId),
  ]);

  // Nothing is configured yet, so there is no schedule to prune against.
  if (coverage.size === 0 && overrides.size === 0) {
    return { removed: 0, kept: 0 };
  }

  let slotsQuery = supabase
    .from("booking_availability")
    .select("id, starts_at, ends_at")
    .eq("stylist_id", stylistId)
    .gte("starts_at", range.from);
  if (range.to) slotsQuery = slotsQuery.lte("starts_at", range.to);

  const { data: slots, error } = await slotsQuery;
  if (error) throw error;

  const removeIds: string[] = [];
  let kept = 0;

  for (const slot of slots ?? []) {
    const startsAt = new Date(slot.starts_at);
    const endsAt = new Date(slot.ends_at);
    const dayKey = localDateKey(startsAt);
    const window = overrides.has(dayKey)
      ? overrides.get(dayKey) ?? null
      : coverage.get(startsAt.getDay()) ?? null;
    const covered =
      window !== null &&
      minutesOfDay(startsAt) >= window.start &&
      minutesOfDay(endsAt) <= window.end;

    if (covered) continue;
    if (protectedIds.has(slot.id)) {
      kept += 1;
      continue;
    }
    removeIds.push(slot.id);
  }

  for (let index = 0; index < removeIds.length; index += 100) {
    const chunk = removeIds.slice(index, index + 100);
    const { error: deleteError } = await supabase
      .from("booking_availability")
      .delete()
      .in("id", chunk);
    if (deleteError) throw deleteError;
  }

  return { removed: removeIds.length, kept };
}

function dayBounds(day: string) {
  const start = parseLocalDay(day);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

/**
 * Save the whole working week at once: the grid is the source of truth, so previous
 * general rules are replaced. Everything open that the new grid does not cover goes.
 */
export async function saveWeeklyHours(input: {
  stylistId: string;
  days: WeeklyAvailabilityDay[];
}) {
  const seen = new Set<number>();
  for (const day of input.days) {
    if (seen.has(day.weekday)) {
      throw new Error("Each day can only be set once.");
    }
    seen.add(day.weekday);
    if (!day.off && toMinutes(day.endTime) <= toMinutes(day.startTime)) {
      throw new Error("The finish time must be later than the start time.");
    }
  }

  const supabase = createSupabaseAdminClient();
  const { error: clearError } = await supabase
    .from("booking_availability_rules")
    .delete()
    .eq("stylist_id", input.stylistId)
    .is("service_id", null);
  if (clearError) throw clearError;

  const rows = input.days
    .filter((day) => !day.off)
    .map((day) => ({
      stylist_id: input.stylistId,
      service_id: null,
      weekday: day.weekday,
      start_time: `${day.startTime}:00`,
      end_time: `${day.endTime}:00`,
      active: true,
    }));

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("booking_availability_rules")
      .insert(rows);
    if (insertError) throw insertError;
  }

  const result = await pruneOpenSlots(supabase, input.stylistId, {
    from: new Date().toISOString(),
  });
  await syncRecurringAvailabilityRules();

  return { ...result, daysOn: rows.length };
}

export async function getDayOverrides(stylistId?: string) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("booking_availability_day_overrides")
    .select("*")
    .gte("day", localDateKey(new Date()))
    .order("day");
  if (stylistId) query = query.eq("stylist_id", stylistId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapOverride);
}

/** Switch a single date off, or give it different hours, without touching the week. */
export async function applyDayOverride(input: {
  stylistId: string;
  day: string;
  mode: "off" | "hours";
  startTime?: string;
  endTime?: string;
}) {
  if (
    input.mode === "hours" &&
    (!input.startTime ||
      !input.endTime ||
      toMinutes(input.endTime) <= toMinutes(input.startTime))
  ) {
    throw new Error("The finish time must be later than the start time.");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_availability_day_overrides")
    .upsert(
      {
        stylist_id: input.stylistId,
        day: input.day,
        is_off: input.mode === "off",
        start_time: input.mode === "hours" ? `${input.startTime}:00` : null,
        end_time: input.mode === "hours" ? `${input.endTime}:00` : null,
      },
      { onConflict: "stylist_id,day" },
    )
    .select("*")
    .single();
  if (error) throw error;

  const result = await pruneOpenSlots(
    supabase,
    input.stylistId,
    dayBounds(input.day),
  );
  await syncRecurringAvailabilityRules();

  return { override: mapOverride(data), ...result };
}

/** Undo a per-date change; the date falls back to the weekly grid. */
export async function deleteDayOverride(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data: row, error: loadError } = await supabase
    .from("booking_availability_day_overrides")
    .select("id, stylist_id, day")
    .eq("id", id)
    .maybeSingle();
  if (loadError) throw loadError;
  if (!row) throw new Error("That day change is no longer there.");

  const { error } = await supabase
    .from("booking_availability_day_overrides")
    .delete()
    .eq("id", id);
  if (error) throw error;

  const result = await pruneOpenSlots(
    supabase,
    row.stylist_id,
    dayBounds(row.day),
  );
  await syncRecurringAvailabilityRules();
  return result;
}

type AvailabilitySyncScope = {
  stylistId?: string;
  serviceId?: string;
};

/**
 * Materialize recurring working hours into bookable slots.
 *
 * The optional scope keeps client booking requests fast: a customer only needs
 * slots for the stylist and service they selected, while admin changes can
 * still refresh the complete schedule.
 */
export async function syncRecurringAvailabilityRules(
  weeksAhead = 13,
  scope: AvailabilitySyncScope = {},
) {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + weeksAhead * 7);

  const rulesQuery = supabase
    .from("booking_availability_rules")
    .select("*")
    .eq("active", true);
  const servicesQuery = supabase
    .from("booking_services")
    .select("id, duration_minutes")
    .eq("active", true);

  if (scope.stylistId) rulesQuery.eq("stylist_id", scope.stylistId);
  if (scope.serviceId) {
    rulesQuery.or(
      `service_id.is.null,service_id.eq.${scope.serviceId}`,
    );
    servicesQuery.eq("id", scope.serviceId);
  }

  const [
    { data: rules, error: rulesError },
    { data: services, error: servicesError },
  ] = await Promise.all([
    rulesQuery,
    servicesQuery,
  ]);

  if (rulesError) throw rulesError;
  if (servicesError) throw servicesError;

  // Paginate to get ALL existing slots — Supabase defaults to 1000 rows
  // which was silently truncating results and preventing later months
  // from being generated.
  let existing: any[] = [];
  try {
    const existingQuery = supabase
      .from("booking_availability")
      .select("id, stylist_id, service_id, starts_at, ends_at")
      .gte("starts_at", now.toISOString())
      .lte("starts_at", horizon.toISOString());
    if (scope.stylistId) existingQuery.eq("stylist_id", scope.stylistId);
    if (scope.serviceId) existingQuery.eq("service_id", scope.serviceId);
    existing = await fetchAllRows(existingQuery as any);
  } catch (existingError) {
    throw existingError;
  }

  let safeOverrideRows: any[] = [];
  try {
    const overridesQuery = supabase
      .from("booking_availability_day_overrides")
      .select("stylist_id, day, is_off, start_time, end_time")
      .gte("day", localDateKey(now));
    if (scope.stylistId) overridesQuery.eq("stylist_id", scope.stylistId);
    safeOverrideRows = await fetchAllRows(overridesQuery as any);
  } catch {
    // If the day-overrides table doesn't exist yet (migration 018 pending),
    // fall back to an empty list so availability still loads correctly.
    safeOverrideRows = [];
  }

  const durationByService = new Map(
    (services ?? []).map((service: any) => [
      service.id,
      service.duration_minutes,
    ]),
  );
  const allServiceIds = Array.from(durationByService.keys());
  const overrideIndex = new Map<
    string,
    { isOff: boolean; startTime: string | null; endTime: string | null }
  >();
  for (const row of safeOverrideRows) {
    overrideIndex.set(`${row.stylist_id}:${row.day}`, {
      isOff: row.is_off,
      startTime: row.start_time ? String(row.start_time).slice(0, 5) : null,
      endTime: row.end_time ? String(row.end_time).slice(0, 5) : null,
    });
  }

  const existingWindows = (existing ?? []).map((slot: any) => ({
    stylistId: slot.stylist_id,
    serviceId: slot.service_id,
    start: new Date(slot.starts_at).getTime(),
    end: new Date(slot.ends_at).getTime(),
  }));
  const existingKeys = new Set(
    (existing ?? []).map(
      (slot: any) =>
        `${slot.stylist_id}:${slot.service_id}:${new Date(slot.starts_at).toISOString()}`,
    ),
  );
  const inserts: Array<{
    stylist_id: string;
    service_id: string;
    starts_at: string;
    ends_at: string;
    is_available: true;
  }> = [];
  const daysHandledByOverride = new Set<string>();

  function fillWindow(
    stylistId: string,
    day: Date,
    serviceIds: string[],
    startTime: string,
    endTime: string,
  ) {
    const windowStart = withTime(day, startTime);
    const windowEnd = withTime(day, endTime);

    for (const serviceId of serviceIds) {
      const duration = durationByService.get(serviceId);
      if (!duration) continue;

      let cursor = new Date(windowStart);

      while (cursor.getTime() + duration * 60_000 <= windowEnd.getTime()) {
        if (cursor > now) {
          const slotEnd = new Date(cursor.getTime() + duration * 60_000);
          const slotKey = `${stylistId}:${serviceId}:${cursor.toISOString()}`;
          const overlaps = existingWindows.some(
            (window) =>
              window.stylistId === stylistId &&
              window.serviceId === serviceId &&
              window.start < slotEnd.getTime() &&
              window.end > cursor.getTime(),
          );

          if (!existingKeys.has(slotKey) && !overlaps) {
            inserts.push({
              stylist_id: stylistId,
              service_id: serviceId,
              starts_at: cursor.toISOString(),
              ends_at: slotEnd.toISOString(),
              is_available: true,
            });
            existingKeys.add(slotKey);
            existingWindows.push({
              stylistId,
              serviceId,
              start: cursor.getTime(),
              end: slotEnd.getTime(),
            });
          }
        }

        cursor = new Date(cursor.getTime() + 30 * 60_000); // 30-minute steps for more flexible start times
      }
    }
  }

  for (const rule of rules ?? []) {
    let day = nextWeekday(now, rule.weekday);

    while (day <= horizon) {
      const overrideKey = `${rule.stylist_id}:${localDateKey(day)}`;
      const override = overrideIndex.get(overrideKey);

      if (override?.isOff) {
        day = new Date(day);
        day.setDate(day.getDate() + 7);
        continue;
      }

      if (override) {
        // Different hours for this one date: build them once, from every active service.
        if (daysHandledByOverride.has(overrideKey)) {
          day = new Date(day);
          day.setDate(day.getDate() + 7);
          continue;
        }
        daysHandledByOverride.add(overrideKey);
        if (override.startTime && override.endTime) {
          fillWindow(
            rule.stylist_id,
            day,
            allServiceIds,
            override.startTime,
            override.endTime,
          );
        }
      } else {
        // A rule with no service applies to every active service.
        fillWindow(
          rule.stylist_id,
          day,
          rule.service_id ? [rule.service_id] : allServiceIds,
          rule.start_time.slice(0, 5),
          rule.end_time.slice(0, 5),
        );
      }

      day = new Date(day);
      day.setDate(day.getDate() + 7);
    }
  }

  // A changed date can also land on a weekday she is normally off, so those are built
  // separately — a rule loop never reaches them.
  for (const [overrideKey, override] of overrideIndex) {
    if (override.isOff || daysHandledByOverride.has(overrideKey)) continue;
    if (!override.startTime || !override.endTime) continue;

    const separator = overrideKey.lastIndexOf(":");
    const stylistId = overrideKey.slice(0, separator);
    const day = parseLocalDay(overrideKey.slice(separator + 1));
    if (day < startOfDay(now) || day > horizon) continue;

    daysHandledByOverride.add(overrideKey);
    fillWindow(
      stylistId,
      day,
      allServiceIds,
      override.startTime,
      override.endTime,
    );
  }

  // Batch inserts in chunks of 500 to avoid request-size limits and timeouts
  const chunks = [];
  for (let i = 0; i < inserts.length; i += 500) {
    chunks.push(inserts.slice(i, i + 500));
  }

  // Process chunks with concurrency limit to avoid exhausting connection pool
  const CONCURRENCY = 5;
  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const batch = chunks.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (chunk) => {
        const { error: insertError } = await supabase
          .from("booking_availability")
          .insert(chunk);
        if (insertError) throw insertError;
      })
    );
  }
}

