import { initializeApp, getApps, getApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (
  typeof window !== 'undefined' &&
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === 'true'
) {
  const browserWindow = window as Window & { __mhFirebaseEmulatorsConnected?: boolean };
  if (!browserWindow.__mhFirebaseEmulatorsConnected) {
    const authEmulatorUrl =
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099';
    const firestoreEmulator =
      process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
    const [firestoreHost, firestorePort] = firestoreEmulator.split(':');

    browserWindow.__mhFirebaseEmulatorsConnected = true;
    connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
    connectFirestoreEmulator(db, firestoreHost, Number(firestorePort));
  }
}
