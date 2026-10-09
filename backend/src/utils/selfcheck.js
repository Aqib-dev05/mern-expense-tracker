// Dependency-free sanity checks for money/date helpers: `npm run test:utils`
import assert from 'node:assert/strict';
import { toMinor, fromMinor, hasValidPrecision } from './money.js';
import { resolveRange, previousRange, parseDateOnly, addMonths, toDateKey } from './dates.js';
import { csvText } from './csv.js';

assert.equal(toMinor(0.1 + 0.2), 30);
assert.equal(toMinor(19.99), 1999);
assert.equal(fromMinor(12345), 123.45);
assert.equal(hasValidPrecision(10.25), true);
assert.equal(hasValidPrecision(10.255), false);

assert.equal(parseDateOnly('2026-02-30'), null);
assert.equal(toDateKey(parseDateOnly('2026-10-08')), '2026-10-08');
assert.equal(toDateKey(addMonths(parseDateOnly('2026-01-31'), 1)), '2026-02-28');

const now = new Date('2026-10-08T10:00:00Z');
const tm = resolveRange({ range: 'this_month' }, now);
assert.equal(toDateKey(tm.start), '2026-10-01');
assert.equal(toDateKey(tm.end), '2026-11-01');
assert.equal(toDateKey(previousRange(tm).start), '2026-09-01');
const l6 = resolveRange({ range: 'last_6_months' }, now);
assert.equal(toDateKey(l6.start), '2026-05-01');
const custom = resolveRange({ range: 'custom', startDate: '2026-10-01', endDate: '2026-10-10' });
assert.equal(toDateKey(custom.end), '2026-10-11');
assert.throws(() => resolveRange({ range: 'custom', startDate: '2026-10-10', endDate: '2026-10-01' }));

assert.equal(csvText('=SUM(A1)'), "'=SUM(A1)");
assert.equal(csvText('a,"b"'), '"a,""b"""');

console.log('utils self-check passed');
