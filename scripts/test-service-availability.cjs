// Run with: node scripts/test-service-availability.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const { serviceStatus, bookingWindowFromRow, isServiceBookable, isServiceVisible } = require('../lib/service-availability.ts');
const { businessDateKey } = require('../lib/timezone.ts');
const { adminBookingServiceSchema } = require('../lib/schemas.ts');
const bookingWindow = { startsOn: '2026-12-01', endsOn: '2026-12-31' };
const service = { active: true, bookingWindow };
const row = { active: true, available_from: bookingWindow.startsOn, available_until: bookingWindow.endsOn };
assert.equal(isServiceVisible(row, '2026-11-05'), true);
assert.equal(isServiceVisible(row, '2026-12-01'), true);
assert.equal(isServiceVisible(row, '2026-12-31'), true);
assert.equal(isServiceVisible(row, '2027-01-01'), false);
assert.equal(isServiceVisible({ ...row, active: false }, '2026-11-05'), false);
assert.equal(isServiceVisible(row, businessDateKey('2027-01-01T06:59:59Z')), true);
assert.equal(isServiceVisible(row, businessDateKey('2027-01-01T07:00:00Z')), false);
assert.equal(isServiceBookable({ active: true, available_from: '2090-12-01', available_until: '2090-12-31' }), false);
assert.equal(serviceStatus(service, '2026-11-30'), 'Scheduled');
assert.equal(serviceStatus(service, '2026-12-01'), 'Active');
assert.equal(serviceStatus(service, '2026-12-31'), 'Active');
assert.equal(serviceStatus(service, '2027-01-01'), 'Expired');
assert.equal(serviceStatus({ ...service, active: false }, '2026-12-15'), 'Hidden');
assert.equal(serviceStatus({ active: true }, '2027-01-01'), 'Active');
assert.equal(serviceStatus(service, businessDateKey('2027-01-01T06:59:59Z')), 'Active');
assert.equal(serviceStatus(service, businessDateKey('2027-01-01T07:00:00Z')), 'Expired');
assert.equal(isServiceBookable({ active: false }), false);
assert.equal(isServiceBookable({ active: true, available_from: '2000-01-01', available_until: '2000-12-31' }), false);
assert.deepEqual(bookingWindowFromRow({ available_from: bookingWindow.startsOn, available_until: bookingWindow.endsOn }), bookingWindow);
assert.equal(bookingWindowFromRow({}), null);
const input = { name: 'Holiday Specials', slug: 'holiday-specials', durationMinutes: 60, price: 90, serviceType: 'makeup', bookingWindow };
assert.equal(adminBookingServiceSchema.safeParse(input).success, true);
for (const invalidWindow of [
  { startsOn: '2026-12-31', endsOn: '2026-12-01' },
  { startsOn: '2026-02-30', endsOn: '2026-12-31' },
  { startsOn: '', endsOn: '2026-12-31' },
  { startsOn: '2026-12-01' },
]) assert.equal(adminBookingServiceSchema.safeParse({ ...input, bookingWindow: invalidWindow }).success, false);
assert.equal(adminBookingServiceSchema.safeParse({ ...input, bookingWindow: null }).success, true);
console.log('Service availability: all boundary, timezone, and validation checks passed.');
