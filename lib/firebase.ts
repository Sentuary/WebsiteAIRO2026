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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize Firebase App singleton safely without any hardcoded credentials
const app = getApps().length
  ? getApp()
  : (isConfigured ? initializeApp(firebaseConfig) : null);

export const db = app ? getFirestore(app) : (null as any);
export const auth = app ? getAuth(app) : (null as any);
export { app };

/**
 * Subscribe to real-time changes in a Firestore collection
 */
export function subscribeToCollection<T>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onError?: (err: any) => void
) {
  if (!db) {
    return () => {};
  }

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
  if (!db) return false;
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
  if (!db) return false;
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
  if (!db) return;
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

// Verify PIN directly from Firestore database ('admin_config/settings', 'admin_user', or 'admin_users')
export async function verifyPinFromFirestore(pinInput: string): Promise<boolean> {
  const cleanPin = pinInput.trim();
  if (!db) {
    throw new Error('Database Firebase belum terhubung. Periksa konfigurasi di file .env.');
  }

  try {
    // 1. Cek dari dokumen admin_config/settings
    const configDoc = await getDoc(doc(db, 'admin_config', 'settings'));
    if (configDoc.exists()) {
      const configPin = configDoc.data().pin;
      if (configPin && String(configPin).trim() === cleanPin) {
        return true;
      }
    }

    // 2. Cek juga dari koleksi admin_user atau admin_users jika ada pin per-admin
    const collectionsToCheck = ['admin_user', 'admin_users'];
    for (const colName of collectionsToCheck) {
      try {
        const usersSnap = await getDocs(collection(db, colName));
        for (const docSnap of usersSnap.docs) {
          const userPin = docSnap.data().pin;
          if (userPin && String(userPin).trim() === cleanPin) {
            return true;
          }
        }
      } catch {
        // Lanjutkan ke koleksi berikutnya jika salah satu belum ada
      }
    }

    return false;
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      console.warn('[Firestore Rules Notice] Akses verifikasi PIN dibatasi Firestore Rules. Pastikan Firestore Rules mengizinkan read/write.');
    }
    console.error('Error saat verifikasi PIN dari database Firestore:', err);
    throw new Error('Gagal memverifikasi PIN dengan database Firebase.');
  }
}

// Authenticate Admin strictly using existing accounts in Firebase (Auth or Firestore)
export async function loginAdminWithFirebase(
  email: string,
  password: string
): Promise<{ email: string; uid?: string }> {
  if (!auth && !db) {
    throw new Error('Koneksi Firebase belum terhubung. Periksa konfigurasi di file .env.');
  }

  const trimmedEmail = email.trim().toLowerCase();

  // 1. Coba verifikasi via Firebase Authentication
  if (auth) {
    try {
      const credential = await signInWithEmailAndPassword(auth, trimmedEmail, password);

      if (db) {
        try {
          await setDoc(
            doc(db, 'admin_users', credential.user.uid),
            {
              email: trimmedEmail,
              lastLogin: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {
          // Abaikan jika izin write Firestore dibatasi
        }
      }

      return {
        email: credential.user.email || trimmedEmail,
        uid: credential.user.uid,
      };
    } catch (authErr: any) {
      if (authErr.code === 'auth/invalid-email') {
        throw new Error('Format email tidak valid.');
      } else if (authErr.code === 'auth/too-many-requests') {
        throw new Error('Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.');
      } else if (
        authErr.code === 'auth/configuration-not-found' ||
        authErr.code === 'auth/operation-not-allowed'
      ) {
        throw new Error('Provider Email/Password belum diaktifkan di Firebase Console > Authentication > Sign-in method.');
      }
      // Jika auth/invalid-credential atau auth/user-not-found atau auth/wrong-password,
      // kita juga periksa database Firestore barangkali user mendaftarkannya di koleksi Firestore
    }
  }

  // 2. Cek apakah akun terdaftar di Database Firestore (koleksi 'admin_user' atau 'admin_users')
  if (db) {
    try {
      const collectionsToCheck = ['admin_user', 'admin_users'];
      for (const colName of collectionsToCheck) {
        const snap = await getDocs(collection(db, colName));
        for (const d of snap.docs) {
          const data = d.data();
          const docEmail = (data.email || '').toString().trim().toLowerCase();
          const docPassword = (data.password || '').toString();

          if (docEmail === trimmedEmail) {
            // Email terdaftar di database, verifikasi password
            if (docPassword === password) {
              try {
                await setDoc(
                  doc(db, colName, d.id),
                  { lastLogin: new Date().toISOString() },
                  { merge: true }
                );
              } catch {
                // Abaikan
              }
              return {
                email: trimmedEmail,
                uid: d.id,
              };
            } else {
              throw new Error('Password salah! Silakan periksa kembali password Anda.');
            }
          }
        }
      }
    } catch (dbErr: any) {
      if (dbErr.message?.includes('Password salah')) {
        throw dbErr;
      }
      // Abaikan jika permission Firestore belum diizinkan
    }
  }

  // 3. Jika akun sama sekali tidak terdaftar di Firebase (baik di Auth maupun Firestore)
  throw new Error('Akun tidak ditemukan di Firebase. Silakan periksa kembali email dan password Anda.');
}

// Sign Out Admin from Firebase
export async function logoutAdminFromFirebase() {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase SignOut Warning:', err);
  }
}

// Listen to Firebase Auth state
export function onAdminAuthStateChanged(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Seed data akun admin awal jika diperlukan
 */
export async function seedAdminUserIfNotExist() {
  // Tidak ada auto-create akun liar; admin mengelola akun secara resmi di Firebase Console
}
