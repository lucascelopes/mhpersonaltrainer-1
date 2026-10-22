import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from './firebase';

export async function generateAvailablePersonalCode(): Promise<number> {
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
  const preview = httpsCallable<{ code: string }, unknown>(functions, 'previewPersonalInvite');
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = Math.floor(100000 + Math.random() * 900000);
    try {
      await preview({ code: String(candidate) });
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      if (code === 'functions/not-found') return candidate;
      if (code === 'functions/failed-precondition') continue;
      throw error;
    }
  }
  throw new Error('Não foi possível gerar um código disponível. Tente novamente.');
}
