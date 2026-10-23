// Regression against the disposable demo emulators in firebase.qa-chat.json; never loads .env files.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, deleteUser } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator, collection, doc, addDoc, getDoc, getDocs, query, where, serverTimestamp } = require('firebase/firestore');

async function main() {
  const projectId = 'demo-mhpersonal';
  const app = initializeApp({ projectId, apiKey: 'demo-key' }, `chat-regression-${Date.now()}`);
  const auth = getAuth(app);
  const authEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9199';
  const [firestoreHost, firestorePort] = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8180').split(':');
  connectAuthEmulator(auth, `http://${authEmulator}`, { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, firestoreHost, Number(firestorePort));
  let outsiderApp;
  let user;
  try {
    ({user} = await createUserWithEmailAndPassword(auth, `chat-regression-${Date.now()}@example.test`, 'Synthetic-chat-test-2026!'));
    const source = path.resolve(__dirname, '../lib/services/chat.ts');
    const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const serviceModule = { exports: {} };
    const serviceRequire = (id) => {
      if (id === './firebase') return { getFirebaseDb: () => db };
      // These integrations are not used by ensureConversation; no external calls.
      if (id === './firestoreService' || id === './notifications') return {};
      return require(id);
    };
    vm.runInThisContext(`(function(exports,require,module){${compiled}\n})`, { filename: source })(serviceModule.exports, serviceRequire, serviceModule);
    const { ensureConversation, sendMessage } = serviceModule.exports;
    const payloadSource = path.resolve(__dirname, '../lib/firestorePayload.ts');
    const payloadCompiled = ts.transpileModule(fs.readFileSync(payloadSource, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const payloadModule = { exports: {} };
    vm.runInThisContext(`(function(exports,require,module){${payloadCompiled}\n})`, { filename: payloadSource })(payloadModule.exports, require, payloadModule);
    const { omitUndefinedFirestoreFields } = payloadModule.exports;
    const args = { userId: user.uid, userName: 'Synthetic concurrency user', otherUserId: 'support', otherName: 'Support QA', type: 'support' };

    const appError = omitUndefinedFirestoreFields({
      type: 'error', message: 'Synthetic AppErrorReporter regression', name: undefined,
      code: undefined, stack: undefined, source: 'qa-emulator', url: 'https://qa.example.test',
      line: undefined, column: undefined, userId: user.uid, role: undefined,
      userAgent: 'Synthetic QA', createdAt: serverTimestamp(),
    });
    assert.equal(Object.hasOwn(appError, 'code'), false, 'Undefined Firestore fields must be omitted');
    await addDoc(collection(db, 'appErrors'), appError);

    const concurrent = await Promise.all(Array.from({length:8}, () => ensureConversation(args)));
    assert.equal(new Set(concurrent.map((conversation) => conversation.id)).size, 1, 'Concurrent calls must return the same conversation');
    const rows = await getDocs(query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid)));
    assert.equal(rows.size, 1, 'Concurrent calls must persist exactly one conversation');
    await sendMessage({conversationId:concurrent[0].id, senderId:user.uid, content:'Synthetic service regression message'});
    const sent = await getDocs(collection(db, 'conversations', concurrent[0].id, 'messages'));
    assert.equal(sent.size, 1, 'Sending must persist one message');
    assert.equal(sent.docs[0].data().content, 'Synthetic service regression message');
    const summary = await getDoc(doc(db, 'conversations', concurrent[0].id));
    assert.equal(summary.data().lastMessage, 'Synthetic service regression message', 'Summary must match persisted message');

    outsiderApp = initializeApp({ projectId, apiKey: 'demo-key' }, `chat-regression-outsider-${Date.now()}`);
    const outsiderAuth = getAuth(outsiderApp);
    connectAuthEmulator(outsiderAuth, `http://${authEmulator}`, { disableWarnings: true });
    const outsiderDb = getFirestore(outsiderApp);
    connectFirestoreEmulator(outsiderDb, firestoreHost, Number(firestorePort));
    await createUserWithEmailAndPassword(outsiderAuth, `chat-outsider-${Date.now()}@example.test`, 'Synthetic-outsider-test-2026!');
    await assert.rejects(
      getDoc(doc(outsiderDb, 'conversations', concurrent[0].id)),
      (error) => error.code === 'permission-denied',
      'A non-participant must not read a conversation'
    );

    const legacy = await addDoc(collection(db, 'conversations'), {
      participants: [user.uid, 'qa-legacy-peer'], type: 'direct', createdAt: serverTimestamp(),
      participantInfo: {}, unreadCount: {}, lastMessage: 'Keep existing history',
    });
    const reused = await ensureConversation({...args, otherUserId:'qa-legacy-peer', type:'direct'});
    assert.equal(reused.id, legacy.id, 'A legacy conversation must retain its original ID');
    const afterLegacy = await getDocs(query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid)));
    assert.equal(afterLegacy.size, 2, 'Legacy reuse must not create another conversation');
    console.log(JSON.stringify({projectId, concurrentCalls:8, newConversations:rows.size, messageAndSummaryPersisted:true, nonParticipantReadDenied:true, legacyIdPreserved:true, appErrorFieldsSanitized:true}));
  } finally {
    if (user) await deleteUser(user).catch(() => {});
    // Firestore rules intentionally reserve deletes to admins. The disposable emulator
    // is discarded by `firebase emulators:exec` after this script finishes.
    if (outsiderApp) await deleteApp(outsiderApp);
    await deleteApp(app);
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
