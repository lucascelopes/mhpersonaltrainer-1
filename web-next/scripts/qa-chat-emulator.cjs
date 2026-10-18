// Service regression against local Firebase emulators; never loads .env files.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, deleteUser } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator, collection, doc, addDoc, getDoc, getDocs, deleteDoc, query, where, serverTimestamp } = require('firebase/firestore');

async function main() {
  const projectId = 'demo-mhpersonal';
  const app = initializeApp({ projectId, apiKey: 'demo-key' }, `chat-regression-${Date.now()}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  const created = new Set();
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
    const args = { userId: user.uid, userName: 'Synthetic concurrency user', otherUserId: 'support', otherName: 'Support QA', type: 'support' };
    const concurrent = await Promise.all(Array.from({length:8}, () => ensureConversation(args)));
    concurrent.forEach((conversation) => created.add(conversation.id));
    assert.equal(created.size, 1, 'Concurrent calls must return the same conversation');
    const rows = await getDocs(query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid)));
    rows.docs.forEach((row) => created.add(row.id));
    assert.equal(rows.size, 1, 'Concurrent calls must persist exactly one conversation');
    await sendMessage({conversationId:concurrent[0].id, senderId:user.uid, content:'Synthetic service regression message'});
    const sent = await getDocs(collection(db, 'conversations', concurrent[0].id, 'messages'));
    assert.equal(sent.size, 1, 'Sending must persist one message');
    assert.equal(sent.docs[0].data().content, 'Synthetic service regression message');
    const summary = await getDoc(doc(db, 'conversations', concurrent[0].id));
    assert.equal(summary.data().lastMessage, 'Synthetic service regression message', 'Summary must match persisted message');

    const legacy = await addDoc(collection(db, 'conversations'), {
      participants: [user.uid, 'qa-legacy-peer'], type: 'direct', createdAt: serverTimestamp(),
      participantInfo: {}, unreadCount: {}, lastMessage: 'Keep existing history',
    });
    created.add(legacy.id);
    const reused = await ensureConversation({...args, otherUserId:'qa-legacy-peer', type:'direct'});
    assert.equal(reused.id, legacy.id, 'A legacy conversation must retain its original ID');
    const afterLegacy = await getDocs(query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid)));
    afterLegacy.docs.forEach((row) => created.add(row.id));
    assert.equal(afterLegacy.size, 2, 'Legacy reuse must not create another conversation');
    console.log(JSON.stringify({projectId, concurrentCalls:8, newConversations:rows.size, messageAndSummaryPersisted:true, legacyIdPreserved:true}));
  } finally {
    for (const id of created) {
      const messages = await getDocs(collection(db, 'conversations', id, 'messages'));
      for (const message of messages.docs) await deleteDoc(message.ref);
      await deleteDoc(doc(db, 'conversations', id));
    }
    if (user) await deleteUser(user);
    await deleteApp(app);
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
