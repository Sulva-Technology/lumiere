const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');

function load(file, dependencies) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(source, { exports, require: (name) => dependencies[name] ?? {}, Date, Map, console });
  return exports;
}
const timezone = load('lib/timezone.ts', {});
const windows = load('lib/service-availability.ts', { './timezone': timezone });
const availability = load('lib/data/availability.ts', { '@/lib/timezone': timezone });

async function scenario(options = {}) {
  const writes = [];
  const booking = { id: 'booking', status: 'confirmed', service_id: 'old', stylist_id: 'artist', availability_id: 'old-slot', starts_at: '2090-12-10T17:00:00.000Z', ends_at: '2090-12-10T18:00:00.000Z', ...options.booking };
  const service = { id: 'new', active: true, duration_minutes: 90, ...options.service };
  const conflict = { id: 'other', full_name: 'Another client', starts_at: '2090-12-10T18:00:00Z', ends_at: '2090-12-10T19:00:00Z' };
  const db = { from(table) {
    let operation = 'read', values, columns = '', many = true;
    const query = {
      select(value) { columns = value; return this; },
      eq() { return this; }, neq() { return this; }, in() { return this; }, lt() { return this; }, gt() { return this; }, gte() { return this; }, limit() { return this; },
      maybeSingle() { many = false; return this; }, single() { many = false; return this; },
      insert(value) { operation = 'insert'; values = value; return this; },
      update(value) { operation = 'update'; values = value; return this; },
      delete() { operation = 'delete'; return this; },
      then(resolve, reject) {
        let data = null;
        if (operation !== 'read') {
          writes.push({ table, operation, values });
          data = table === 'bookings' ? (options.concurrent ? null : { id: booking.id }) : { id: 'new-slot' };
        } else if (table === 'booking_services') data = options.missing ? null : service;
        else if (table === 'bookings') data = many ? (options.conflict ? [conflict] : []) : (columns === 'intake_payload' ? {} : booking);
        else if (table === 'booking_reservations') data = options.hold ? [{ booking_availability: conflict }] : [];
        else if (table === 'booking_availability' || table === 'payments') data = [];
        return Promise.resolve({ data, error: null }).then(resolve, reject);
      },
    };
    return query;
  } };
  const admin = load('lib/data/admin.ts', {
    '@/lib/supabase/admin': { createSupabaseAdminClient: () => db },
    '@/lib/service-availability': windows,
    '@/lib/timezone': timezone,
    '@/lib/data/availability': availability,
    '@/lib/data/audit': { createAuditLog: async () => {} },
    '@/lib/observability': { logEvent: () => {} },
    '@/lib/format': { formatDateTime: (value) => value },
  });
  const input = options.reschedule
    ? { day: '2090-12-11', time: '10:00' }
    : { serviceId: options.same ? 'old' : 'new' };
  let error;
  try { await admin.rescheduleBooking({ bookingId: 'booking', notifyClient: false, ...input }); }
  catch (failure) { error = failure.message; }
  return { writes, error };
}

(async () => {
  const success = await scenario();
  assert.equal(success.error, undefined);
  const update = success.writes.find((write) => write.table === 'bookings');
  assert.equal(update.values.service_id, 'new');
  assert.equal(update.values.starts_at, '2090-12-10T17:00:00.000Z');
  assert.equal(update.values.ends_at, '2090-12-10T18:30:00.000Z');
  assert.equal(success.writes.some((write) => write.table === 'payments'), false);
  assert.equal(success.writes.some((write) => write.values && ('payment_status' in write.values || 'price' in write.values)), false);
  for (const service of [
    { active: false },
    { available_from: '2000-01-01', available_until: '2000-12-31' },
    { available_from: '2090-12-01', available_until: '2090-12-31' },
    { service_type: 'content' },
  ]) {
    const result = await scenario({ service });
    assert.equal(result.error, undefined);
    assert.equal(result.writes.find((write) => write.table === 'bookings').values.service_id, 'new');
    assert.equal(result.writes.some((write) => write.table === 'booking_services'), false);
  }
  for (const options of [{ conflict: true }, { hold: true }, { same: true }, { missing: true }, { service: { duration_minutes: 0 } }, { booking: { status: 'cancelled' } }, { booking: { starts_at: '2000-12-10T17:00:00Z' } }]) {
    const result = await scenario(options);
    assert.ok(result.error, JSON.stringify(options));
    assert.equal(result.writes.length, 0, result.error);
  }
  const concurrent = await scenario({ concurrent: true });
  assert.match(concurrent.error, /changed while/);
  assert.ok(concurrent.writes.some((write) => write.table === 'booking_availability' && write.operation === 'delete'));
  const moved = await scenario({ reschedule: true });
  assert.equal(moved.error, undefined);
  assert.equal(moved.writes.find((write) => write.table === 'bookings').values.service_id, 'old');
  console.log('Booking service change: success, conflicts, payments, concurrency and rescheduling checks passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
