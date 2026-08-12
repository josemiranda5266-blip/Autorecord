import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

// Try initializing Firebase safely if credentials exist in localStorage or env
try {
  const env = (import.meta as any).env || {};
  const firebaseConfig = (window as unknown as { __FIREBASE_CONFIG__?: Record<string, string> }).__FIREBASE_CONFIG__ || {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
  }
} catch (e) {
  console.warn('Firebase initialization skipped or running in local mode:', e);
}

export const auth = authInstance;
export const db = dbInstance;
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase Auth no está configurado aún. Se está utilizando el modo local/demo.');
  }
  return await signInWithPopup(auth, googleProvider);
}

export async function logoutFirebase() {
  if (auth) {
    await fbSignOut(auth);
  }
}
