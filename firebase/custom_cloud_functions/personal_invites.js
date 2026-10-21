const functions = require('firebase-functions/v1');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');

const REGION = 'southamerica-east1';
const FREE_STUDENT_LIMIT = 4;
const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);
const enabled = (value) => value === true || value === 'true' || value === 1;

function invalid(message) {
  return new functions.https.HttpsError('invalid-argument', message);
}

function parseCode(value) {
  const raw = String(value ?? '').trim();
  if (!/^\d{1,10}$/.test(raw)) throw invalid('Código do convite inválido.');
  const numeric = Number(raw);
  if (!Number.isSafeInteger(numeric) || numeric <= 0) throw invalid('Código do convite inválido.');
  const normalized = String(numeric);
  return { numeric, normalized, variants: [numeric, normalized] };
}

function cleanText(value, fallback, maxLength = 80) {
  const text = typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim() : '';
  return (text || fallback).slice(0, maxLength);
}

function isPremium(data) {
  if (enabled(data.admin) || String(data.role || '').trim().toLowerCase() === 'admin') return true;
  if (enabled(data.assinatura) || enabled(data.planoChatGPT)) return true;
  return [data.stripeSubscriptionStatus, data.subscriptionStatus, data.statusAssinatura, data.assinaturaStatus]
    .some((status) => ACTIVE_STATUSES.has(String(status || '').trim().toLowerCase()));
}

async function findPersonal(db, code) {
  const usersRef = db.collection('users');
  const direct = await usersRef.where('codigoPersonal', 'in', code.variants).get();
  const matches = direct.docs.filter((snap) => {
    const data = snap.data() || {};
    return enabled(data.professorAccount) && !enabled(data.admin);
  });
  if (matches.length > 1) {
    throw new functions.https.HttpsError('failed-precondition', 'Código associado a mais de um personal.');
  }
  if (matches.length === 1) {
    const snap = matches[0];
    return { userRef: snap.ref, sourceRef: snap.ref, data: snap.data() || {} };
  }

  const legacy = await db.collection('professorAccount').where('codigoPersonal', 'in', code.variants).get();
  const ids = new Set(legacy.docs.map((snap) => snap.data()?.uid || snap.id));
  if (ids.size > 1) {
    throw new functions.https.HttpsError('failed-precondition', 'Código associado a mais de um personal.');
  }
  for (const source of legacy.docs) {
    const uid = source.data()?.uid || source.id;
    const userRef = usersRef.doc(uid);
    const userSnap = await userRef.get();
    if (userSnap.exists && enabled(userSnap.data()?.professorAccount) && !enabled(userSnap.data()?.admin)) {
      return { userRef, sourceRef: source.ref, data: userSnap.data() || {} };
    }
  }
  return null;
}

async function linkedStudentCount(read, db, code, personalId) {
  const query = db.collection('users').where('codigoPersonal', 'in', code.variants);
  const snapshot = await read(query);
  return snapshot.docs.filter((snap) => {
    if (snap.id === personalId) return false;
    const data = snap.data() || {};
    return !enabled(data.admin) && !enabled(data.academyAccount) && !enabled(data.professorAccount);
  }).length;
}

async function previewPersonalInvite(data) {
  const code = parseCode(data?.code);
  const personal = await findPersonal(getFirestore(), code);
  if (!personal) throw new functions.https.HttpsError('not-found', 'Personal não encontrado.');
  return {
    displayName: cleanText(personal.data.display_name || personal.data.displayName, 'Personal'),
    specialization: cleanText(personal.data.especializacao, 'Personal trainer', 60),
    code: code.normalized,
  };
}

async function registerStudentWithInvite(data) {
  const code = parseCode(data?.code);
  const name = cleanText(data?.name, '', 80);
  const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = data?.password;
  if (name.length < 2) throw invalid('Informe seu nome completo.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || email.endsWith('@admin.com')) {
    throw invalid('E-mail inválido para cadastro de aluno.');
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
    throw invalid('A senha deve ter entre 6 e 128 caracteres.');
  }

  const db = getFirestore();
  const personal = await findPersonal(db, code);
  if (!personal) throw new functions.https.HttpsError('not-found', 'Personal não encontrado.');
  const personalName = cleanText(personal.data.display_name || personal.data.displayName, 'Personal');
  if (!isPremium(personal.data)) {
    const current = await linkedStudentCount((query) => query.get(), db, code, personal.userRef.id);
    if (current >= FREE_STUDENT_LIMIT) {
      throw new functions.https.HttpsError('resource-exhausted', 'Este personal atingiu o limite de alunos do plano gratuito.');
    }
  }

  let account;
  try {
    account = await getAuth().createUser({ email, password, displayName: name });
  } catch (error) {
    if (error?.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'Este e-mail já possui uma conta. Entre para continuar.');
    }
    if (error?.code === 'auth/invalid-password' || error?.code === 'auth/invalid-email') {
      throw invalid('Confira o e-mail e a senha informados.');
    }
    throw error;
  }

  try {
    await db.runTransaction(async (transaction) => {
      const personalSnap = await transaction.get(personal.userRef);
      if (!personalSnap.exists || !enabled(personalSnap.data()?.professorAccount) || enabled(personalSnap.data()?.admin)) {
        throw new functions.https.HttpsError('failed-precondition', 'Este convite não está mais disponível.');
      }
      if (personal.sourceRef.path !== personal.userRef.path) {
        const source = await transaction.get(personal.sourceRef);
        if (!source.exists || !code.variants.includes(source.data()?.codigoPersonal)) {
          throw new functions.https.HttpsError('failed-precondition', 'Este convite não está mais disponível.');
        }
      } else if (!code.variants.includes(personalSnap.data()?.codigoPersonal)) {
        throw new functions.https.HttpsError('failed-precondition', 'Este convite não está mais disponível.');
      }
      const personalData = personalSnap.data() || {};
      if (!isPremium(personalData)) {
        const current = await linkedStudentCount((query) => transaction.get(query), db, code, personal.userRef.id);
        if (current >= FREE_STUDENT_LIMIT) {
          throw new functions.https.HttpsError('resource-exhausted', 'Este personal atingiu o limite de alunos do plano gratuito.');
        }
      }
      transaction.create(db.collection('users').doc(account.uid), {
        uid: account.uid,
        email,
        display_name: name,
        created_time: FieldValue.serverTimestamp(),
        last_active_time: FieldValue.serverTimestamp(),
        professorAccount: false,
        academyAccount: false,
        admin: false,
        assinatura: false,
        planoChatGPT: false,
        acessoSuspenso: false,
        codigoPersonal: code.numeric,
        personalAccountId: personal.userRef.id,
        nameDoSeuPersonal: personalName,
      });
      transaction.update(personal.userRef, { inviteRosterVersion: FieldValue.increment(1) });
    });
    return { created: true };
  } catch (error) {
    const linked = await db.collection('users').doc(account.uid).get().catch(() => null);
    if (linked?.exists && linked.data()?.email === email && linked.data()?.codigoPersonal === code.numeric) {
      return { created: true };
    }
    try {
      await getAuth().deleteUser(account.uid);
    } catch (cleanupError) {
      console.error('Failed to remove incomplete invited account.', cleanupError);
    }
    throw error;
  }
}

async function claimPersonalInvite(data, context) {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Entre na conta de aluno para usar o convite.');
  const code = parseCode(data?.code);
  const db = getFirestore();
  const personal = await findPersonal(db, code);
  if (!personal) throw new functions.https.HttpsError('not-found', 'Personal não encontrado.');
  const studentRef = db.collection('users').doc(uid);

  await db.runTransaction(async (transaction) => {
    const personalSnap = await transaction.get(personal.userRef);
    const studentSnap = await transaction.get(studentRef);
    if (!personalSnap.exists || !enabled(personalSnap.data()?.professorAccount) || enabled(personalSnap.data()?.admin)) {
      throw new functions.https.HttpsError('failed-precondition', 'Este convite não está mais disponível.');
    }
    if (!studentSnap.exists) throw new functions.https.HttpsError('failed-precondition', 'Cadastro do aluno não encontrado.');
    const student = studentSnap.data() || {};
    if (enabled(student.admin) || enabled(student.academyAccount) || enabled(student.professorAccount)) {
      throw new functions.https.HttpsError('permission-denied', 'Este convite é exclusivo para alunos.');
    }
    if (personal.sourceRef.path !== personal.userRef.path) {
      const source = await transaction.get(personal.sourceRef);
      if (!source.exists || !code.variants.includes(source.data()?.codigoPersonal)) {
        throw new functions.https.HttpsError('failed-precondition', 'Este convite não está mais disponível.');
      }
    } else if (!code.variants.includes(personalSnap.data()?.codigoPersonal)) {
      throw new functions.https.HttpsError('failed-precondition', 'Este convite não está mais disponível.');
    }
    if (code.variants.includes(student.codigoPersonal) && student.personalAccountId === personal.userRef.id) return;
    const personalData = personalSnap.data() || {};
    if (!isPremium(personalData)) {
      const current = await linkedStudentCount((query) => transaction.get(query), db, code, personal.userRef.id);
      if (current >= FREE_STUDENT_LIMIT) {
        throw new functions.https.HttpsError('resource-exhausted', 'Este personal atingiu o limite de alunos do plano gratuito.');
      }
    }
    transaction.update(studentRef, {
      codigoPersonal: code.numeric,
      personalAccountId: personal.userRef.id,
      nameDoSeuPersonal: cleanText(personalData.display_name || personalData.displayName, 'Personal'),
    });
    transaction.update(personal.userRef, { inviteRosterVersion: FieldValue.increment(1) });
  });
  return { linked: true };
}

exports.previewPersonalInvite = functions.region(REGION).https.onCall(previewPersonalInvite);
exports.registerStudentWithInvite = functions.region(REGION).https.onCall(registerStudentWithInvite);
exports.claimPersonalInvite = functions.region(REGION).https.onCall(claimPersonalInvite);
exports._test = { parseCode, isPremium, findPersonal, linkedStudentCount };
