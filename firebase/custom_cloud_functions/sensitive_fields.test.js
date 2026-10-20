const assert = require('node:assert/strict');
const test = require('node:test');
const { removePlaintextPassword } = require('./sensitive_fields.js')._test;

test('removes only a persisted password and stops after the follow-up write', async () => {
  const updates = [];
  const ref = { update: async (value) => updates.push(value) };
  assert.equal(await removePlaintextPassword({ after: { exists: true, data: () => ({ password: 'synthetic-test-only', display_name: 'Tester' }), ref } }), true);
  assert.equal(updates.length, 1);
  assert.deepEqual(Object.keys(updates[0]), ['password']);
  assert.equal(await removePlaintextPassword({ after: { exists: true, data: () => ({ display_name: 'Tester' }), ref } }), false);
  assert.equal(await removePlaintextPassword({ after: { exists: false, ref } }), false);
  assert.equal(updates.length, 1);
});
