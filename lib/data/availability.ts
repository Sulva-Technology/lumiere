import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  addDaysToKey,
  businessDateKey,
  businessDateTime,
  weekdayOfKey,
} from "@/lib/timezone";
import type {
  AvailabilityDayOverride,
  AvailabilityRule,
} from "@/lib/types";

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

/** A finish time of 00:00 means midnight at the end of the day. */
function endMinutes(value: string) {
  const minutes = toMinutes(value);
  return minutes === 0 ? 24 * 60 : minutes;
}

function endTimeValue(value: string) {
  return endMinutes(value) === 24 * 60 ? "24:00:00" : `${value}:00`;
}

// All day and hour math runs on the studio's clock (see lib/timezone), not the server's.
function startOfDay(date: Date) {
  return businessDateTime(businessDateKey(date));
}

function withTime(date: Date, time: string) {
  return businessDateTime(businessDateKey(date), time);
}

/** Calendar key (yyyy-mm-dd) for a moment, read in the same clock the slots are built in. */
function localDateKey(date: Date) {
  return businessDateKey(date);
}

function parseLocalDay(day: string) {
  return businessDateTime(day);
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
      .gte("starts_at", parseLocalDay(input.startDate).toISOString())
      .lt("starts_at", parseLocalDay(addDaysToKey(input.endDate, 1)).toISOString()),
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
  let currentKey = input.startDate;

  while (currentKey <= input.endDate) {
    const current = parseLocalDay(currentKey);
    const weekday = weekdayOfKey(currentKey);
    const isWeekend = weekday === 0 || weekday === 6;
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

    currentKey = addDaysToKey(currentKey, 1);
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

export interface WeeklyTimeRange {
  startTime: string;
  endTime: string;
}

export interface WeeklyAvailabilityDay {
  weekday: number;
  off: boolean;
  /** One or more working stretches; the gaps between them are her breaks. */
  ranges: WeeklyTimeRange[];
}


type SupabaseAdmin = ReturnType<typeof createSupabaseAdminClient>;

/** How far ahead clients can book. The calendar is computed, so this costs nothing to extend. */
export const BOOKING_WINDOW_DAYS = 183;
/** Clients can start an appointment on any half hour inside her working hours. */
const START_STEP_MINUTES = 30;
/**
 * Break she keeps free after every appointment (cleanup, reset, travel). Clients
 * still see and book the service's own length; this only spaces bookings apart.
 */
export const BOOKING_BUFFER_MINUTES = 30;
const BUFFER_MS = BOOKING_BUFFER_MINUTES * 60_000;
/** Used only until she saves her first working week, so the calendar is never empty. */
const FALLBACK_WINDOW: DayWindow = { start: 9 * 60, end: 17 * 60 };
/** Open times are not stored rows; their id carries the start time until a client books it. */
const OPEN_TIME_PREFIX = "open:";

type BusyWindow = { start: number; end: number };

interface StylistSchedule {
  weekly: Map<number, DayWindow[]>;
  hasWeeklyHours: boolean;
  overrides: Map<string, DayWindow | null>;
  busy: BusyWindow[];
}

function toTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  return parseLocalDay(addDaysToKey(localDateKey(date), days));
}

/**
 * Everything needed to draw her calendar: the normal week, changed dates, and the
 * times already taken by a confirmed booking or a client mid-checkout.
 */
async function loadStylistSchedule(
  supabase: SupabaseAdmin,
  stylistId: string,
  serviceId?: string,
): Promise<StylistSchedule> {
  const nowIso = new Date().toISOString();
  const [rulesResult, overrides, bookingsResult, reservationsResult] =
    await Promise.all([
      supabase
        .from("booking_availability_rules")
        .select("service_id, weekday, start_time, end_time")
        .eq("stylist_id", stylistId)
        .eq("active", true),
      dayOverrideWindows(supabase, stylistId),
      supabase
        .from("bookings")
        .select("starts_at, ends_at")
        .eq("stylist_id", stylistId)
        .in("status", ["confirmed", "completed"])
        .gte("ends_at", nowIso),
      supabase
        .from("booking_reservations")
        .select("booking_availability(starts_at, ends_at)")
        .eq("stylist_id", stylistId)
        .eq("reservation_status", "pending_payment")
        .gt("expires_at", nowIso),
    ]);

  if (rulesResult.error) throw rulesResult.error;
  if (bookingsResult.error) throw bookingsResult.error;
  if (reservationsResult.error) throw reservationsResult.error;

  // Each rule is its own working stretch, so a gap between two rules on the same
  // weekday is a break clients cannot book. A rule tied to one service only adds
  // hours for that service.
  const weekly = new Map<number, DayWindow[]>();
  let hasWeeklyHours = false;
  for (const rule of rulesResult.data ?? []) {
    if (rule.service_id !== null && rule.service_id !== serviceId) continue;
    hasWeeklyHours = true;
    const window = {
      start: toMinutes(String(rule.start_time).slice(0, 5)),
      end: endMinutes(String(rule.end_time).slice(0, 5)),
    };
    weekly.set(rule.weekday, [...(weekly.get(rule.weekday) ?? []), window]);
  }
  for (const windows of weekly.values()) {
    windows.sort((a, b) => a.start - b.start);
  }

  const busy: BusyWindow[] = [];
  for (const booking of bookingsResult.data ?? []) {
    busy.push({
      start: new Date(booking.starts_at).getTime(),
      end: new Date(booking.ends_at).getTime(),
    });
  }
  for (const reservation of reservationsResult.data ?? []) {
    const held = relationFirst(
      reservation.booking_availability as
        | { starts_at: string; ends_at: string }
        | { starts_at: string; ends_at: string }[]
        | null,
    );
    if (!held) continue;
    busy.push({
      start: new Date(held.starts_at).getTime(),
      end: new Date(held.ends_at).getTime(),
    });
  }

  return { weekly, hasWeeklyHours, overrides, busy };
}

/** Her hours on one date: a changed date wins, otherwise the normal week. Empty = day off. */
function windowsForDay(schedule: StylistSchedule, day: Date): DayWindow[] {
  const key = localDateKey(day);
  if (schedule.overrides.has(key)) {
    const override = schedule.overrides.get(key);
    return override ? [override] : [];
  }
  if (!schedule.hasWeeklyHours) return [FALLBACK_WINDOW];
  return schedule.weekly.get(weekdayOfKey(key)) ?? [];
}

function openTimesForDay(
  schedule: StylistSchedule,
  day: Date,
  durationMinutes: number,
  now: Date,
) {
  const seen = new Set<number>();
  const times: Array<{ start: Date; end: Date }> = [];

  for (const window of windowsForDay(schedule, day)) {
    let cursor = withTime(day, toTime(window.start));
    const windowEnd = withTime(day, toTime(window.end)).getTime();

    while (cursor.getTime() + durationMinutes * 60_000 <= windowEnd) {
      const start = cursor.getTime();
      const end = start + durationMinutes * 60_000;
      // Keep a break after both the existing appointment and the new one.
      const taken = schedule.busy.some(
        (busy) => start < busy.end + BUFFER_MS && end + BUFFER_MS > busy.start,
      );
      if (cursor > now && !taken && !seen.has(start)) {
        seen.add(start);
        times.push({ start: new Date(start), end: new Date(end) });
      }
      cursor = new Date(start + START_STEP_MINUTES * 60_000);
    }
  }

  return times.sort((a, b) => a.start.getTime() - b.start.getTime());
}

async function serviceDuration(supabase: SupabaseAdmin, serviceId: string) {
  const { data, error } = await supabase
    .from("booking_services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Selected service is unavailable.");
  return data.duration_minutes as number;
}

/** Every time a client can book with her for this service, from now to the end of the booking window. */
export async function listOpenTimes(stylistId: string, serviceId: string) {
  const supabase = createSupabaseAdminClient();
  const [duration, schedule] = await Promise.all([
    serviceDuration(supabase, serviceId),
    loadStylistSchedule(supabase, stylistId, serviceId),
  ]);

  const now = new Date();
  const today = startOfDay(now);
  const times: Array<{
    id: string;
    stylistId: string;
    serviceId: string;
    startsAt: string;
    endsAt: string;
    isAvailable: boolean;
  }> = [];

  for (let offset = 0; offset <= BOOKING_WINDOW_DAYS; offset += 1) {
    for (const time of openTimesForDay(schedule, addDays(today, offset), duration, now)) {
      times.push({
        id: `${OPEN_TIME_PREFIX}${time.start.toISOString()}`,
        stylistId,
        serviceId,
        startsAt: time.start.toISOString(),
        endsAt: time.end.toISOString(),
        isAvailable: true,
      });
    }
  }
  return times;
}

export function parseOpenTimeId(id: string) {
  if (!id.startsWith(OPEN_TIME_PREFIX)) return null;
  const startsAt = new Date(id.slice(OPEN_TIME_PREFIX.length));
  return Number.isNaN(startsAt.getTime()) ? null : startsAt;
}

/**
 * Turn the time a client picked into a stored slot, right before their hold is created.
 * Rechecks her schedule first, so a day she just turned off can no longer be booked.
 */
export async function claimOpenTime(input: {
  stylistId: string;
  serviceId: string;
  startsAt: Date;
}) {
  const supabase = createSupabaseAdminClient();
  const [duration, schedule] = await Promise.all([
    serviceDuration(supabase, input.serviceId),
    loadStylistSchedule(supabase, input.stylistId, input.serviceId),
  ]);

  const stillOpen = openTimesForDay(
    schedule,
    startOfDay(input.startsAt),
    duration,
    new Date(),
  ).some((time) => time.start.getTime() === input.startsAt.getTime());
  if (!stillOpen) {
    throw new Error("That appointment time is no longer available.");
  }

  const startsAtIso = input.startsAt.toISOString();
  const endsAtIso = new Date(
    input.startsAt.getTime() + duration * 60_000,
  ).toISOString();

  // Reuse a stored slot for this exact time when nobody has ever booked it
  // (each slot can only carry one booking).
  const { data: existing, error: existingError } = await supabase
    .from("booking_availability")
    .select("id, bookings(id)")
    .eq("stylist_id", input.stylistId)
    .eq("service_id", input.serviceId)
    .eq("starts_at", startsAtIso)
    .eq("ends_at", endsAtIso);
  if (existingError) throw existingError;

  const reusable = (existing ?? []).find(
    (slot) => !Array.isArray(slot.bookings) || slot.bookings.length === 0,
  );
  if (reusable) {
    const { data, error } = await supabase
      .from("booking_availability")
      .update({ is_available: true })
      .eq("id", reusable.id)
      .select("id, starts_at, ends_at, is_available, stylist_id, service_id")
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("booking_availability")
    .insert({
      stylist_id: input.stylistId,
      service_id: input.serviceId,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      is_available: true,
    })
    .select("id, starts_at, ends_at, is_available, stylist_id, service_id")
    .single();
  if (error) throw error;
  return data;
}

export interface ScheduleDay {
  day: string;
  open: boolean;
  ranges: WeeklyTimeRange[];
  changed: boolean;
  bookings: number;
}

/** Her calendar as she sees it in admin: each date, its hours, and how many clients are booked. */
export async function getScheduleDays(stylistId: string): Promise<ScheduleDay[]> {
  const supabase = createSupabaseAdminClient();
  const today = startOfDay(new Date());
  const [schedule, bookingsResult] = await Promise.all([
    loadStylistSchedule(supabase, stylistId),
    supabase
      .from("bookings")
      .select("starts_at")
      .eq("stylist_id", stylistId)
      .in("status", ["confirmed", "completed"])
      .gte("starts_at", today.toISOString()),
  ]);
  if (bookingsResult.error) throw bookingsResult.error;

  const bookingsByDay = new Map<string, number>();
  for (const booking of bookingsResult.data ?? []) {
    const key = localDateKey(new Date(booking.starts_at));
    bookingsByDay.set(key, (bookingsByDay.get(key) ?? 0) + 1);
  }

  const days: ScheduleDay[] = [];
  for (let offset = 0; offset <= BOOKING_WINDOW_DAYS; offset += 1) {
    const date = addDays(today, offset);
    const key = localDateKey(date);
    const windows = windowsForDay(schedule, date);
    days.push({
      day: key,
      open: windows.length > 0,
      ranges: windows.map((window) => ({
        startTime: toTime(window.start),
        endTime: toTime(window.end),
      })),
      changed: schedule.overrides.has(key),
      bookings: bookingsByDay.get(key) ?? 0,
    });
  }
  return days;
}

/** Per-date changes as a lookup: date -> window, or null when the whole day is off. */
async function dayOverrideWindows(supabase: SupabaseAdmin, stylistId: string) {
  const { data, error } = await supabase
    .from("booking_availability_day_overrides")
    .select("day, is_off, start_time, end_time")
    .eq("stylist_id", stylistId)
    .gte("day", localDateKey(new Date()));
  if (error) throw error;

  const overrides = new Map<string, DayWindow | null>();
  for (const row of data ?? []) {
    overrides.set(
      row.day as string,
      row.is_off || !row.start_time || !row.end_time
        ? null
        : {
            start: toMinutes(String(row.start_time).slice(0, 5)),
            end: endMinutes(String(row.end_time).slice(0, 5)),
          },
    );
  }
  return overrides;
}

async function bookingsOnDay(supabase: SupabaseAdmin, stylistId: string, day: string) {
  const start = parseLocalDay(day);
  const end = addDays(start, 1);
  const { count, error } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("stylist_id", stylistId)
    .in("status", ["confirmed", "completed"])
    .gte("starts_at", start.toISOString())
    .lt("starts_at", end.toISOString());
  if (error) throw error;
  return count ?? 0;
}

/**
 * Save the whole working week at once: the grid is the source of truth, so previous
 * general rules are replaced. The calendar reads it directly, nothing else to rebuild.
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
    if (day.off) continue;
    if (day.ranges.length === 0) {
      throw new Error("Add at least one time for each working day.");
    }
    const sorted = [...day.ranges].sort(
      (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
    );
    for (const [index, range] of sorted.entries()) {
      if (endMinutes(range.endTime) <= toMinutes(range.startTime)) {
        throw new Error("Each finish time must be later than its start time.");
      }
      const next = sorted[index + 1];
      if (next && toMinutes(next.startTime) < endMinutes(range.endTime)) {
        throw new Error("Two of the times on the same day overlap.");
      }
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
    .flatMap((day) =>
      day.ranges.map((range) => ({
        stylist_id: input.stylistId,
        service_id: null,
        weekday: day.weekday,
        start_time: `${range.startTime}:00`,
        end_time: endTimeValue(range.endTime),
        active: true,
      })),
    );

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("booking_availability_rules")
      .insert(rows);
    if (insertError) throw insertError;
  }

  return { daysOn: input.days.filter((day) => !day.off).length };
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
      endMinutes(input.endTime) <= toMinutes(input.startTime))
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
        end_time: input.mode === "hours" && input.endTime ? endTimeValue(input.endTime) : null,
      },
      { onConflict: "stylist_id,day" },
    )
    .select("*")
    .single();
  if (error) throw error;

  // Existing bookings are never cancelled by a schedule change; tell her they are still on.
  const booked = await bookingsOnDay(supabase, input.stylistId, input.day);
  return { override: mapOverride(data), booked };
}

/** Undo a per-date change; the date falls back to the weekly grid. */
export async function deleteDayOverride(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("booking_availability_day_overrides")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return { undone: true };
}
