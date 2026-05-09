import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  onSnapshot, 
  serverTimestamp,
  addDoc,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PhrasalVerb } from './dataService';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth Helpers
export const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      return null;
    }
    console.error("Auth Error:", error);
    throw error;
  }
};
export const logout = () => signOut(auth);

// Data Helpers
export const syncMasteredWords = async (userId: string, masteredWords: string[]) => {
  const userDoc = doc(db, 'users', userId);
  try {
    await setDoc(userDoc, {
      masteredWords,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
};

export const saveCustomWord = async (userId: string, word: PhrasalVerb) => {
  try {
    await addDoc(collection(db, 'users', userId, 'customVerbs'), {
      ...word,
      userId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/customVerbs`);
  }
};

export const deleteCustomWord = async (userId: string, wordId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'customVerbs', wordId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/customVerbs/${wordId}`);
  }
};

// Initial Connection Test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
