const functions = require('firebase-functions/v1');
const { FieldValue } = require('firebase-admin/firestore');

async function removePlaintextPassword(change) {
  if (!change.after.exists) return false;
  const data = change.after.data() || {};
  if (!Object.prototype.hasOwnProperty.call(data, 'password')) return false;

  await change.after.ref.update({ password: FieldValue.delete() });
  return true;
}

const trigger = (path) => functions.region('southamerica-east1')
  .firestore.document(path)
  .onWrite(removePlaintextPassword);

exports.stripUserPlaintextPassword = trigger('users/{userId}');
exports.stripPersonalAccountPlaintextPassword = trigger('users/{userId}/personalAccount/{accountId}');
exports.stripProfessorAccountPlaintextPassword = trigger('professorAccount/{accountId}');
exports._test = { removePlaintextPassword };
