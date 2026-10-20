const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator, collection, addDoc, getDocs, doc, setDoc, serverTimestamp } = require('firebase/firestore');

const source = path.resolve(__dirname, '../lib/services/errorReporting.ts');
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const helperModule = { exports: {} };
vm.runInThisContext(`(function(exports,require,module){${compiled}\n})`, { filename: source })(helperModule.exports, require, helperModule);
const { shouldReportAppError } = helperModule.exports;
assert.equal(shouldReportAppError({ message: 'NEXT_REDIRECT' }), false);
assert.equal(shouldReportAppError({ code: 'NEXT_REDIRECT;replace;/admin' }), false);
assert.equal(shouldReportAppError({ message: 'Failed to redirect after login' }), true);
assert.equal(shouldReportAppError({ message: 'Should have a queue.' }), true);

const projectId = 'demo-mhpersonal';
const rulesUrl = `http://127.0.0.1:8080/emulator/v1/projects/${projectId}:securityRules`;
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
const admin = require('firebase-admin');
const adminApp = admin.initializeApp({ projectId }, `app-error-rules-${Date.now()}`);
const adminDb = adminApp.firestore();

async function setRules(rules) {
  const response = await fetch(rulesUrl, {
    method: 'PUT', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ignore_errors: false, rules }),
  });
  assert.equal(response.status, 200, `Rules rejected: ${await response.text()}`);
}

async function client(label) {
  const app = initializeApp({ projectId, apiKey: 'demo-key' }, `${label}-${Date.now()}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  const email = `${label}-${Date.now()}@example.test`;
  const { user } = await createUserWithEmailAndPassword(auth, email, 'Synthetic-error-test-2026!');
  return { app, db, uid: user.uid, email };
}

async function main() {
  const originalResponse = await fetch(rulesUrl);
  assert.equal(originalResponse.status, 200, 'Firestore emulator is required');
  const originalRules = (await originalResponse.json()).rules;
  const content = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');
  const clients = [];
  const createdErrorIds = [];
  try {
    await setRules({ files: [{ name: 'security.rules', content }] });
    const ordinary = await client('qa-error-user'); clients.push(ordinary);
    const administrator = await client('qa-error-admin'); clients.push(administrator);
    await setDoc(doc(ordinary.db, 'users', ordinary.uid), { uid: ordinary.uid, email: ordinary.email, admin: false, professorAccount: false });
    await adminDb.collection('users').doc(administrator.uid).set({ uid: administrator.uid, email: 'qa-admin@admin.com', admin: true });

    const valid = { type: 'error', message: 'Synthetic real error', userId: ordinary.uid, createdAt: serverTimestamp() };
    const errorDoc = await addDoc(collection(ordinary.db, 'appErrors'), valid);
    createdErrorIds.push(errorDoc.id);
    assert.equal((await getDocs(collection(administrator.db, 'appErrors'))).docs.some((row) => row.id === errorDoc.id), true);
    await assert.rejects(() => getDocs(collection(ordinary.db, 'appErrors')), (error) => error.code === 'permission-denied');
    await assert.rejects(() => addDoc(collection(ordinary.db, 'appErrors'), { ...valid, userId: administrator.uid }), (error) => error.code === 'permission-denied');
    await assert.rejects(() => addDoc(collection(ordinary.db, 'appErrors'), { ...valid, message: 'x'.repeat(421) }), (error) => error.code === 'permission-denied');
    console.log(JSON.stringify({ navigationNoiseExcluded: true, realErrorsKept: true, ownerCreateAllowed: true, adminReadAllowed: true, userReadDenied: true, spoofDenied: true, oversizedMessageDenied: true }));
  } finally {
    await setRules(originalRules);
    for (const id of createdErrorIds) await adminDb.collection('appErrors').doc(id).delete();
    for (const entry of clients) {
      await adminDb.collection('users').doc(entry.uid).delete();
      await adminApp.auth().deleteUser(entry.uid);
      await deleteApp(entry.app);
    }
    await adminApp.delete();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
