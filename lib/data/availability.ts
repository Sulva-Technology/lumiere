import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AvailabilityRule, BookingService } from '@/lib/types';

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
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function withTime(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number);
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

export async function getAvailabilityAdminRows() {
  await syncRecurringAvailabilityRules();
  const supabase = createSupabaseAdminClient();
  const [{ data: availability, error: availabilityError }, { data: activeReservations, error: reservationError }] = await Promise.all([
    supabase
      .from('booking_availability')
      .select('id, starts_at, ends_at, is_available, service_id, stylist_id, stylists(name), booking_services(name), bookings(id)')
      .order('starts_at', { ascending: false }),
    supabase.from('booking_reservations').select('availability_id').eq('reservation_status', 'pending_payment').gt('expires_at', new Date().toISOString()),
  ]);

  if (availabilityError) throw availabilityError;
  if (reservationError) throw reservationError;

  const reservedIds = new Set((activeReservations ?? []).map((reservation) => reservation.availability_id));

  return (availability ?? []).map((slot) => ({
    id: slot.id,
    starts_at: slot.starts_at,
    ends_at: slot.ends_at,
    is_available: slot.is_available,
    has_booking: Array.isArray(slot.bookings) ? slot.bookings.length > 0 : false,
    is_reserved: reservedIds.has(slot.id),
    booking_services: relationFirst(slot.booking_services) ?? null,
    stylists: relationFirst(slot.stylists) ?? null,
  }));
}

export async function createAvailabilitySlot(input: { stylistId: string; serviceId: string; startsAt: string; durationMinutes: number }) {
  const supabase = createSupabaseAdminClient();
  const startsAtDate = new Date(input.startsAt);
  const endsAtDate = new Date(startsAtDate.getTime() + input.durationMinutes * 60_000);

  const { data: overlapping } = await supabase
    .from('booking_availability')
    .select('id')
    .eq('stylist_id', input.stylistId)
    .lt('starts_at', endsAtDate.toISOString())
    .gt('ends_at', startsAtDate.toISOString())
    .limit(1)
    .maybeSingle();

  if (overlapping) {
    throw new Error('That time overlaps an existing availability slot.');
  }

  const { data, error } = await supabase
    .from('booking_availability')
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

export async function deleteAvailabilitySlot(id: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: booking }, { data: reservation }] = await Promise.all([
    supabase.from('bookings').select('id').eq('availability_id', id).maybeSingle(),
    supabase.from('booking_reservations').select('id').eq('availability_id', id).eq('reservation_status', 'pending_payment').gt('expires_at', new Date().toISOString()).maybeSingle(),
  ]);

  if (booking || reservation) {
    throw new Error('This slot is already reserved or booked and cannot be removed.');
  }

  const { error } = await supabase.from('booking_availability').delete().eq('id', id);
  if (error) throw error;
}

export async function getAvailabilityRules() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('booking_availability_rules').select('*').order('weekday').order('start_time');
  if (error) throw error;
  return (data ?? []).map(mapRule);
}

export async function upsertAvailabilityRule(input: { id?: string; stylistId: string; serviceId: string; weekday: number; startTime: string; endTime: string; active?: boolean }) {
  if (toMinutes(input.endTime) <= toMinutes(input.startTime)) {
    throw new Error('End time must be later than start time.');
  }

  const supabase = createSupabaseAdminClient();
  const payload = {
    stylist_id: input.stylistId,
    service_id: input.serviceId,
    weekday: input.weekday,
    start_time: `${input.startTime}:00`,
    end_time: `${input.endTime}:00`,
    active: input.active ?? true,
  };

  const query = input.id
    ? supabase.from('booking_availability_rules').update(payload).eq('id', input.id)
    : supabase.from('booking_availability_rules').insert(payload);

  const { data, error } = await query.select('*').single();
  if (error) throw error;

  await syncRecurringAvailabilityRules();
  return mapRule(data);
}

export async function deleteAvailabilityRule(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('booking_availability_rules').delete().eq('id', id);
  if (error) throw error;
}

export async function syncRecurringAvailabilityRules(weeksAhead = 16) {
  const supabase = createSupabaseAdminClient();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + weeksAhead * 7);

  const [{ data: rules, error: rulesError }, { data: services, error: servicesError }, { data: existing, error: existingError }] = await Promise.all([
    supabase.from('booking_availability_rules').select('*').eq('active', true),
    supabase.from('booking_services').select('id, duration_minutes').eq('active', true),
    supabase.from('booking_availability').select('id, stylist_id, service_id, starts_at, ends_at').gte('starts_at', new Date().toISOString()).lte('starts_at', horizon.toISOString()),
  ]);

  if (rulesError) throw rulesError;
  if (servicesError) throw servicesError;
  if (existingError) throw existingError;

  const durationByService = new Map((services ?? []).map((service: any) => [service.id, service.duration_minutes]));
  const existingWindows = (existing ?? []).map((slot: any) => ({
    stylistId: slot.stylist_id,
    start: new Date(slot.starts_at).getTime(),
    end: new Date(slot.ends_at).getTime(),
  }));
  const existingKeys = new Set((existing ?? []).map((slot: any) => `${slot.stylist_id}:${slot.service_id}:${new Date(slot.starts_at).toISOString()}`));
  const inserts: Array<{ stylist_id: string; service_id: string; starts_at: string; ends_at: string; is_available: true }> = [];
  const now = new Date();

  for (const rule of rules ?? []) {
    const duration = durationByService.get(rule.service_id);
    if (!duration) continue;

    let day = nextWeekday(now, rule.weekday);
    while (day <= horizon) {
      const ruleStart = withTime(day, rule.start_time.slice(0, 5));
      const ruleEnd = withTime(day, rule.end_time.slice(0, 5));
      let cursor = new Date(ruleStart);

      while (cursor.getTime() + duration * 60_000 <= ruleEnd.getTime()) {
        if (cursor > now) {
          const slotEnd = new Date(cursor.getTime() + duration * 60_000);
          const slotKey = `${rule.stylist_id}:${rule.service_id}:${cursor.toISOString()}`;
          const overlaps = existingWindows.some((window) => window.stylistId === rule.stylist_id && window.start < slotEnd.getTime() && window.end > cursor.getTime());

          if (!existingKeys.has(slotKey) && !overlaps) {
            inserts.push({
              stylist_id: rule.stylist_id,
              service_id: rule.service_id,
              starts_at: cursor.toISOString(),
              ends_at: slotEnd.toISOString(),
              is_available: true,
            });
            existingKeys.add(slotKey);
            existingWindows.push({ stylistId: rule.stylist_id, start: cursor.getTime(), end: slotEnd.getTime() });
          }
        }

        cursor = new Date(cursor.getTime() + duration * 60_000);
      }

      day = new Date(day);
      day.setDate(day.getDate() + 7);
    }
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from('booking_availability').insert(inserts);
    if (insertError) throw insertError;
  }
}
