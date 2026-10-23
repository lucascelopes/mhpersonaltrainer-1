const { randomInt } = require('node:crypto');
const functions = require('firebase-functions/v1');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');

const REGION = 'southamerica-east1';
const MAX_CODE_ATTEMPTS = 20;

function invalid(message) {
  return new functions.https.HttpsError('invalid-argument', message);
}

async function reserveAcademyCode(db, userRef, account, name, email, code) {
  const codeRef = db.collection('academyCodes').doc(String(code));
  return db.runTransaction(async (transaction) => {
    const codeSnap = await transaction.get(codeRef);
    const oldUsers = await transaction.get(
      db.collection('users').where('codigoAcademia', 'in', [code, String(code)]).limit(1)
    );
    if (codeSnap.exists || !oldUsers.empty) return false;

    transaction.create(codeRef, {
      uid: account.uid,
      code,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(userRef, {
      uid: account.uid,
      email,
      display_name: name,
      created_time: FieldValue.serverTimestamp(),
      last_active_time: FieldValue.serverTimestamp(),
      professorAccount: false,
      academyAccount: true,
      admin: false,
      assinatura: false,
      planoChatGPT: false,
      acessoSuspenso: false,
      codigoAcademia: code,
    });
    return true;
  });
}

async function registerAcademyWithCode(data) {
  const name = typeof data?.name === 'string' ? data.name.trim().slice(0, 80) : '';
  const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = data?.password;
  if (name.length < 2) throw invalid('Informe o nome da academia.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw invalid('E-mail inválido.');
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
    throw invalid('A senha deve ter entre 6 e 128 caracteres.');
  }

  const auth = getAuth();
  let account;
  try {
    account = await auth.createUser({ email, password, displayName: name });
  } catch (error) {
    if (error?.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'Este e-mail já possui uma conta. Entre para continuar.');
    }
    if (error?.code === 'auth/invalid-email' || error?.code === 'auth/invalid-password') {
      throw invalid('Confira o e-mail e a senha informados.');
    }
    throw error;
  }

  const db = getFirestore();
  const userRef = db.collection('users').doc(account.uid);
  try {
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const code = randomInt(100000, 1000000);
      const reserved = await reserveAcademyCode(db, userRef, account, name, email, code);
      if (reserved) return { created: true, code };
    }
    throw new functions.https.HttpsError('resource-exhausted', 'Não foi possível reservar um código. Tente novamente.');
  } catch (error) {
    const userSnap = await userRef.get().catch(() => null);
    if (!userSnap?.exists) await auth.deleteUser(account.uid).catch(() => undefined);
    throw error;
  }
}

exports.registerAcademyWithCode = functions.region(REGION).https.onCall(registerAcademyWithCode);
exports._test = { reserveAcademyCode };
