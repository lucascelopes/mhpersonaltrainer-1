import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from './firebase';

type AcademyRegistrationInput = { name: string; email: string; password: string };
type AcademyRegistrationResult = { created: boolean; code: number };

export async function registerAcademyWithCode(input: AcademyRegistrationInput): Promise<number> {
  const functions = getFunctions(getFirebaseApp(), 'southamerica-east1');
  const browserWindow = typeof window === 'undefined'
    ? null
    : window as Window & { __mhInviteFunctionsEmulatorConnected?: boolean };
  if (browserWindow && process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === 'true' &&
      !browserWindow.__mhInviteFunctionsEmulatorConnected) {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    browserWindow.__mhInviteFunctionsEmulatorConnected = true;
  }
  const call = httpsCallable<AcademyRegistrationInput, AcademyRegistrationResult>(functions, 'registerAcademyWithCode');
  const result = await call(input);
  if (!result.data?.created || !Number.isSafeInteger(result.data.code)) {
    throw new Error('O cadastro da academia não retornou um código válido.');
  }
  return result.data.code;
}

export function academyRegistrationErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code === 'functions/already-exists') return 'Este e-mail já possui uma conta. Entre para continuar.';
  if (code === 'functions/invalid-argument') {
    return error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : 'Confira os dados informados.';
  }
  if (code === 'functions/unavailable' || code === 'functions/deadline-exceeded') {
    return 'Não foi possível conectar ao cadastro da academia. Tente novamente.';
  }
  if (code === 'functions/resource-exhausted') return 'Não foi possível reservar um código. Tente novamente.';
  return 'Não foi possível criar a conta da academia. Tente novamente.';
}
