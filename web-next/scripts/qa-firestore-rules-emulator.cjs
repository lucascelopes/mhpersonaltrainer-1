// Run against local Auth and Firestore emulators. Restores the emulator's previous rules.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator, doc, getDoc, getDocs, setDoc, updateDoc, query, collection, where } = require('firebase/firestore');

const projectId = 'demo-mhpersonal';
const rulesUrl = `http://127.0.0.1:8080/emulator/v1/projects/${projectId}:securityRules`;
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
const admin = require('firebase-admin');
const adminApp = admin.initializeApp({ projectId }, `rules-audit-${Date.now()}`);
const adminDb = adminApp.firestore();

async function setRules(rules) {
  const response = await fetch(rulesUrl, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ignore_errors: false, rules }),
  });
  assert.equal(response.status, 200, `Emulator rejected rules: ${await response.text()}`);
}

async function client(label) {
  const app = initializeApp({ projectId, apiKey: 'demo-key' }, `${label}-${Date.now()}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  const credentials = await createUserWithEmailAndPassword(auth, `${label}-${Date.now()}@example.test`, 'Synthetic-security-test-2026!');
  return { app, db, uid: credentials.user.uid };
}

async function expectDenied(operation, message) {
  await assert.rejects(operation, (error) => error.code === 'permission-denied', message);
}

async function main() {
  const previousResponse = await fetch(rulesUrl);
  assert.equal(previousResponse.status, 200, 'Firestore emulator is required');
  const previous = (await previousResponse.json()).rules;
  const content = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');
  const clients = [];
  try {
    await setRules({ files: [{ name: 'security.rules', content }] });
    const personal = await client('rules-personal'); clients.push(personal);
    const student = await client('rules-student'); clients.push(student);
    const stranger = await client('rules-stranger'); clients.push(stranger);
    const administrator = await client('rules-admin'); clients.push(administrator);

    await setDoc(doc(personal.db, 'users', personal.uid), {
      uid: personal.uid, email: 'personal@example.test', admin: false,
      professorAccount: true, accountType: 'personal', codigoPersonal: 4312, alunos: [],
    });
    await setDoc(doc(student.db, 'users', student.uid), {
      uid: student.uid, email: 'student@example.test', admin: false,
      professorAccount: false, accountType: 'aluno', codigoPersonal: 9999,
    });
    await setDoc(doc(stranger.db, 'users', stranger.uid), {
      uid: stranger.uid, email: 'stranger@example.test', admin: false,
      professorAccount: true, accountType: 'personal', codigoPersonal: 7777,
    });
    await adminDb.collection('users').doc(administrator.uid).set({
      uid: administrator.uid, email: 'administrator@admin.com', admin: true,
      professorAccount: false,
    });

    await getDoc(doc(student.db, 'users', student.uid));
    await expectDenied(() => getDoc(doc(personal.db, 'users', student.uid)), 'Unlinked student profile must be private');
    await updateDoc(doc(personal.db, 'users', personal.uid), { alunos: [student.uid] });
    await expectDenied(() => getDoc(doc(personal.db, 'users', student.uid)), 'Self-edited roster must not grant access');
    await expectDenied(() => setDoc(doc(personal.db, 'users', student.uid, 'createTreinos', 'unauthorized'), { name: 'synthetic' }), 'Self-edited roster must not grant write access');

    await updateDoc(doc(student.db, 'users', student.uid), { codigoPersonal: 4312 });
    assert.equal((await getDoc(doc(personal.db, 'users', student.uid))).exists(), true, 'Student-approved link should allow personal access');
    assert.equal((await getDocs(query(collection(personal.db, 'users'), where('codigoPersonal', '==', 4312)))).docs.some((row) => row.id === student.uid), true, 'Linked student query should work');
    await setDoc(doc(personal.db, 'users', student.uid, 'createTreinos', 'authorized'), { name: 'synthetic' });
    await expectDenied(() => getDoc(doc(stranger.db, 'users', student.uid)), 'Other personal must not access student');
    await expectDenied(() => updateDoc(doc(stranger.db, 'users', stranger.uid), { codigoPersonal: 4312 }), 'Personal code must not be changed to impersonate another personal');
    assert.equal((await getDoc(doc(administrator.db, 'users', student.uid))).exists(), true, 'Admin access should work');

    console.log(JSON.stringify({ unlinkedReadDenied: true, selfEditedRosterDenied: true, selfEditedRosterWriteDenied: true, linkedReadAndQueryAllowed: true, linkedWorkoutWriteAllowed: true, otherPersonalDenied: true, codeChangeDenied: true, adminReadAllowed: true }));
  } finally {
    await setRules(previous);
    for (const entry of clients) {
      await adminDb.recursiveDelete(adminDb.collection('users').doc(entry.uid));
      await adminApp.auth().deleteUser(entry.uid);
      await deleteApp(entry.app);
    }
    await adminApp.delete();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
