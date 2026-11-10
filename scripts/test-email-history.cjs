const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');

function load(file, dependencies) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, require: (name) => dependencies[name] ?? {}, console: { ...console, error() {} }, Date, Set, Intl });
  return exports;
}

const descriptions = load('lib/email-history.ts', {});
const env = { getOptionalEnv: (name, fallback = '') => name === 'RESEND_API_KEY' ? 'test-key' : fallback };

(async () => {
  const subjects = [
    ['Itz Lola Beauty booking confirmation BKG-123', 'booking_confirmation', 'BKG-123'],
    ['New booking confirmed: BKG-123', 'booking_confirmation', 'BKG-123'],
    ['Itz Lola Beauty updated booking confirmation BKG-123', 'booking_rescheduled', 'BKG-123'],
    ['Booking moved: BKG-123', 'booking_rescheduled', 'BKG-123'],
    ['Itz Lola Beauty booking service change BKG-123', 'booking_service_changed', 'BKG-123'],
    ['Booking service changed: BKG-123', 'booking_service_changed', 'BKG-123'],
    ['Itz Lola Beauty order confirmation ORD-456', 'order_confirmation', 'ORD-456'],
    ['New paid order: ORD-456', 'order_confirmation', 'ORD-456'],
    ['Itz Lola Beauty order update ORD-456', 'order_status_update', 'ORD-456'],
    ['Following up on your event', 'other', undefined],
  ];
  for (const [subject, kind, reference] of subjects) {
    const result = descriptions.describeEmail(subject);
    assert.equal(result.kind, kind, subject);
    assert.equal(result.reference, reference, subject);
  }

  let providerError = null, hasMore = true, options;
  const history = load('lib/data/email-history.ts', {
    '@/lib/env': env,
    '@/lib/email-history': descriptions,
    resend: { Resend: class { emails = { list: async (input) => {
      options = input;
      return { error: providerError, data: providerError ? null : { has_more: hasMore, data: [{
        id: 'message-id', subject: subjects[2][0], to: ['client@example.com'],
        created_at: '2026-11-09T10:00:00Z', last_event: 'delivered',
      }] } };
    } }; } },
  });
  let result = await history.getEmailHistory('older-cursor');
  assert.equal(options.after, 'older-cursor');
  assert.equal(options.limit, 50);
  assert.equal(result.nextCursor, 'message-id');
  assert.equal(result.entries[0].status, 'delivered');
  assert.equal(result.entries[0].kind, 'booking_rescheduled');
  hasMore = false;
  assert.equal((await history.getEmailHistory()).nextCursor, null);
  providerError = { name: 'restricted_api_key' };
  await assert.rejects(history.getEmailHistory(), /full access/);

  let authorized = false, readCount = 0;
  const route = load('app/api/admin/emails/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200, headers: init?.headers }) } },
    '@/lib/auth': { requireAdminApiUser: async () => { if (!authorized) throw new Error('Unauthorized'); } },
    '@/lib/data/email-history': { getEmailHistory: async () => { readCount++; return { entries: [], nextCursor: null }; } },
  });
  const request = (value) => ({ nextUrl: new URL(`http://localhost/api/admin/emails${value}`) });
  assert.equal((await route.GET(request(''))).status, 401);
  assert.equal(readCount, 0);
  authorized = true;
  assert.equal((await route.GET(request('?after=invalid'))).status, 400);
  assert.equal(readCount, 0);
  result = await route.GET(request('?after=12345678-1234-1234-1234-123456789abc'));
  assert.equal(result.status, 200);
  assert.equal(result.headers['Cache-Control'], 'no-store');

  const sent = [];
  const notifications = load('lib/notifications.ts', {
    '@/lib/env': env,
    '@/lib/timezone': { BUSINESS_TIME_ZONE: 'America/New_York' },
    resend: { Resend: class { emails = { send: async (payload) => { sent.push(payload); return { data: { id: 'sent-id' }, error: null }; } }; } },
  });
  const booking = {
    storeName: 'Itz Lola Beauty', supportEmail: 'studio@example.com', bookingContactEmail: 'studio@example.com',
    fullName: 'Test Client', email: 'client@example.com', bookingReference: 'BKG-123',
    serviceName: 'Soft Glam', stylistName: 'Lola', startsAt: '2026-12-10T12:00:00Z', phone: '123',
  };
  for (const [extra, kind] of [[{}, 'booking_confirmation'], [{ rescheduledFrom: '2026-12-09T12:00:00Z' }, 'booking_rescheduled'], [{ serviceChanged: true }, 'booking_service_changed']]) {
    sent.length = 0;
    await notifications.sendBookingConfirmationEmails({ ...booking, ...extra });
    assert.equal(sent.length, 2);
    for (const email of sent) assert.equal(descriptions.describeEmail(email.subject).kind, kind);
  }
  const unconfigured = load('lib/notifications.ts', { '@/lib/env': { getOptionalEnv: () => '' } });
  await assert.rejects(unconfigured.sendAdminCustomEmail({ to: 'test@example.com', subject: 'Test', message: 'Test' }), /not configured/);
  console.log('Email history: classification, provider pagination/status, access control, errors, and booking email subjects passed. No emails sent.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
