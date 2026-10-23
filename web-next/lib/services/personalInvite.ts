import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from './firebase';

type InvitePreview = {
  displayName: string;
  specialization: string;
  code: string;
};

declare global {
  interface Window {
    __mhInviteFunctionsEmulatorConnected?: boolean;
  }
}

const inviteFunctions = () => {
  const functions = getFunctions(getFirebaseApp(), 'southamerica-east1');
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === 'true' &&
      !window.__mhInviteFunctionsEmulatorConnected) {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    window.__mhInviteFunctionsEmulatorConnected = true;
  }
  return functions;
};

export const inviteErrorMessage = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code === 'functions/not-found') return 'Personal não encontrado.';
  if (code === 'functions/resource-exhausted') return 'Este personal atingiu o limite de alunos do plano gratuito.';
  if (code === 'functions/already-exists') return 'Este e-mail já possui uma conta. Entre para continuar.';
  if (code === 'functions/unavailable' || code === 'functions/deadline-exceeded') {
    return 'Não foi possível conectar ao serviço de convites. Tente novamente.';
  }
  if (code === 'functions/invalid-argument' || code === 'functions/failed-precondition') {
    return error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Convite inválido.';
  }
  return 'Não foi possível concluir o convite. Tente novamente.';
};

export async function previewPersonalInvite(code: string): Promise<InvitePreview> {
  const call = httpsCallable<{ code: string }, InvitePreview>(inviteFunctions(), 'previewPersonalInvite');
  const result = await call({ code });
  return result.data;
}

export async function registerStudentWithInvite(input: {
  code: string;
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  const call = httpsCallable<typeof input, { created: boolean }>(inviteFunctions(), 'registerStudentWithInvite');
  const result = await call(input);
  if (!result.data?.created) throw new Error('Invite registration did not complete.');
}

export async function claimPersonalInvite(code: string): Promise<void> {
  const call = httpsCallable<{ code: string }, { linked: boolean }>(inviteFunctions(), 'claimPersonalInvite');
  const result = await call({ code });
  if (!result.data?.linked) throw new Error('Invite link did not complete.');
}
