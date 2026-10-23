const test = require('node:test');
const assert = require('node:assert/strict');
const { _test, registerAcademyWithCode } = require('../academy_registration.js');

function fakeDb({ reserved = [], legacy = [] } = {}) {
  const codes = new Set(reserved.map(String));
  const oldCodes = new Set(legacy.map(String));
  const users = new Map();
  const db = {
    codes,
    users,
    collection(name) {
      return {
        doc(id) { return { kind: 'document', name, id }; },
        where(field, operator, values) {
          assert.equal(name, 'users');
          assert.equal(field, 'codigoAcademia');
          assert.equal(operator, 'in');
          return { kind: 'query', values, limit() { return this; } };
        },
      };
    },
    async runTransaction(callback) {
      const writes = [];
      const transaction = {
        async get(ref) {
          if (ref.kind === 'query') {
            return { empty: !ref.values.some((value) => oldCodes.has(String(value))) };
          }
          return { exists: codes.has(ref.id) };
        },
        create(ref, data) { writes.push({ ref, data }); },
      };
      const result = await callback(transaction);
      for (const { ref, data } of writes) {
        if (ref.name === 'academyCodes') codes.add(ref.id);
        if (ref.name === 'users') users.set(ref.id, data);
      }
      return result;
    },
  };
  return db;
}

test('reserves an unused code with the academy user in one transaction', async () => {
  const db = fakeDb();
  const userRef = db.collection('users').doc('academy-1');
  const saved = await _test.reserveAcademyCode(db, userRef, { uid: 'academy-1' }, 'Academia Teste', 'qa@example.com', 654321);
  assert.equal(saved, true);
  assert.equal(db.codes.has('654321'), true);
  assert.equal(db.users.get('academy-1').codigoAcademia, 654321);
  assert.equal(db.users.get('academy-1').academyAccount, true);

  const second = await _test.reserveAcademyCode(db, db.collection('users').doc('academy-2'), { uid: 'academy-2' }, 'Outra', 'other@example.com', 654321);
  assert.equal(second, false);
  assert.equal(db.users.has('academy-2'), false);
});

test('does not reserve a code already used by a legacy account', async () => {
  const db = fakeDb({ legacy: ['765432'] });
  const saved = await _test.reserveAcademyCode(db, db.collection('users').doc('academy-3'), { uid: 'academy-3' }, 'Nova', 'new@example.com', 765432);
  assert.equal(saved, false);
  assert.equal(db.codes.size, 0);
  assert.equal(db.users.size, 0);
});

test('rejects invalid details before creating an auth account', async () => {
  await assert.rejects(
    registerAcademyWithCode.run({ name: ' ', email: 'invalid', password: '123456' }, {}),
    (error) => error.code === 'invalid-argument'
  );
});
