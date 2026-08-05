import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBd_c7aywF2-HYNDCgdPaPWoBtFzmUwsI0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "cuangkibarokahstok.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cuangkibarokahstok",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "cuangkibarokahstok.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "445346592970",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:445346592970:web:9106419fced9f4f4dd9c33",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-JG4J03YXDG",
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export { app };

/**
 * Subscribe to real-time changes in a Firestore collection
 */
export function subscribeToCollection<T>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef);
    return onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as T),
          id: docSnap.id,
        }));
        onUpdate(items);
      },
      (err) => {
        if (err.code === 'permission-denied') {
          console.info(`[Firestore Rule Notice] Collection '${collectionName}' perms restricted. Please set Firestore Rules to 'allow read, write: if true;' in Firebase Console.`);
        } else {
          console.warn(`Firestore subscription warning on '${collectionName}':`, err);
        }
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn(`Failed to subscribe to collection '${collectionName}':`, err);
    return () => {};
  }
}

/**
 * Save or update a document in a Firestore collection
 */
export async function saveDocument(collectionName: string, id: string, data: any) {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      console.warn(`[Firestore Rules Notice] Save for '${collectionName}' was blocked by Firestore Rules in Firebase Console. Please set rules to 'allow read, write: if true;'.`);
    } else {
      console.error(`Failed to save document in '${collectionName}':`, err);
    }
    return false;
  }
}

/**
 * Delete a document from a Firestore collection
 */
export async function removeDocument(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      console.warn(`[Firestore Rules Notice] Delete for '${collectionName}' was blocked by Firestore Rules in Firebase Console. Please set rules to 'allow read, write: if true;'.`);
    } else {
      console.error(`Failed to delete document '${id}' from '${collectionName}':`, err);
    }
    return false;
  }
}

/**
 * Seed initial data if collection is empty
 */
export async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialItems: T[]
) {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty && initialItems.length > 0) {
      console.log(`Seeding initial data for '${collectionName}'...`);
      for (const item of initialItems) {
        const { id, ...data } = item;
        await setDoc(doc(db, collectionName, id), data);
      }
    }
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      console.info(`[Firestore Rule Notice] Seeding skipped for '${collectionName}' due to Firestore rules. Update rules in Firebase Console to enable syncing.`);
    } else {
      console.warn(`Failed to seed collection '${collectionName}':`, err);
    }
  }
}

/**
 * Firebase Authentication & Firestore Admin Credentials Helper
 */

// Verify PIN from Firestore admin_config/settings
export async function verifyPinFromFirestore(pinInput: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'admin_config', 'settings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().pin) {
      return docSnap.data().pin === pinInput.trim();
    } else {
      // Seed default pin in Firestore
      await setDoc(docRef, { pin: '26062026', defaultAdminEmail: 'airo@gmail.com' }, { merge: true });
      return pinInput.trim() === '26062026';
    }
  } catch (err) {
    console.warn('Fallback to local PIN validation:', err);
    return pinInput.trim() === '26062026';
  }
}

// Authenticate Admin via Firebase Auth & Firestore
export async function loginAdminWithFirebase(email: string, password: string): Promise<User | { email: string }> {
  const trimmedEmail = email.trim().toLowerCase();

  // If already logged in on Firebase Auth as this user
  if (auth.currentUser && auth.currentUser.email?.toLowerCase() === trimmedEmail) {
    await setDoc(
      doc(db, 'admin_users', auth.currentUser.uid),
      {
        email: trimmedEmail,
        name: 'Admin AIRO',
        phone: '085718015102',
        lastLogin: new Date().toISOString(),
        role: 'admin',
      },
      { merge: true }
    );
    return auth.currentUser;
  }

  try {
    // 1. Attempt standard Firebase Auth sign-in
    const credential = await signInWithEmailAndPassword(auth, trimmedEmail, password);

    // Save login metadata to Firestore
    await setDoc(
      doc(db, 'admin_users', credential.user.uid),
      {
        email: trimmedEmail,
        name: 'Admin AIRO',
        phone: '085718015102',
        lastLogin: new Date().toISOString(),
        role: 'admin',
      },
      { merge: true }
    );

    return credential.user;
  } catch (err: any) {
    // 2. If credentials match default Admin preset
    if (trimmedEmail === 'airo@gmail.com' && password === 'AIROASLAB2026?') {
      try {
        const newCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await setDoc(
          doc(db, 'admin_users', newCredential.user.uid),
          {
            id: newCredential.user.uid,
            email: trimmedEmail,
            name: 'Admin AIRO',
            phone: '085718015102',
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
          { merge: true }
        );
        return newCredential.user;
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          // Retry sign in
          try {
            const retryCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
            return retryCredential.user;
          } catch (retryErr) {
            // Valid preset admin override
            return { email: trimmedEmail };
          }
        }
        return { email: trimmedEmail };
      }
    }

    throw new Error('Email atau Password Admin salah!');
  }
}

// Sign Out Admin from Firebase
export async function logoutAdminFromFirebase() {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase SignOut Warning:', err);
  }
}

// Listen to Firebase Auth state
export function onAdminAuthStateChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Seed & Ensure Admin AIRO user profile exists in Firestore
 */
export async function seedAdminUserIfNotExist() {
  const adminData = {
    name: 'Admin AIRO',
    email: 'airo@gmail.com',
    phone: '085718015102',
    role: 'admin',
    pin: '26062026',
    updatedAt: new Date().toISOString(),
  };

  try {
    // Seed to Firestore 'admin_users', 'users', and 'admin_config' collections without forcing auto sign-in
    await setDoc(doc(db, 'admin_users', 'airo_admin'), adminData, { merge: true });
    await setDoc(doc(db, 'users', 'airo_admin'), adminData, { merge: true });
    await setDoc(
      doc(db, 'admin_config', 'settings'),
      { pin: '26062026', defaultAdminEmail: 'airo@gmail.com', phone: '085718015102' },
      { merge: true }
    );
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      console.info(`[Firestore Rule Notice] Admin seeding skipped due to Firestore rules. Update rules in Firebase Console.`);
    } else {
      console.warn('Seed admin user error:', err);
    }
  }
}
