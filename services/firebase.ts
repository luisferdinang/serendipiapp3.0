import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import { getEnv } from "../utils/env.js";

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID'),
};

// Inicialización perezosa de Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let analytics: Analytics | null = null;

// Inicializar Firebase solo una vez
if (!getApps().length) {
  // Inicializar la aplicación de Firebase
  app = initializeApp(firebaseConfig);
  
  // Inicializar Firestore
  db = getFirestore(app);
  
  // Inicializar Auth
  auth = getAuth(app);
  
  // Inicializar Analytics solo en el cliente y en producción
  if (typeof window !== 'undefined' && getEnv('VITE_ENABLE_ANALYTICS') === true) {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
  
  // Inicializar Performance solo en el cliente
  if (typeof window !== 'undefined' && getEnv('VITE_APP_ENV') === 'production') {
    getPerformance(app);
  }
} else {
  app = getApp();
  db = getFirestore(app);
  auth = getAuth(app);
}

// Exporta los tipos de Firebase para TypeScript
export type { 
  DocumentData, 
  QueryDocumentSnapshot, 
  Timestamp,
  DocumentReference,
  CollectionReference,
  Query,
  QuerySnapshot,
  DocumentSnapshot,
  WhereFilterOp,
  OrderByDirection,
  FieldValue,
  FieldPath,
  WriteBatch,
  Transaction,
  SetOptions,
  UpdateData,
  DocumentChange,
  DocumentChangeType,
  SnapshotListenOptions,
  SnapshotOptions,
  FirestoreError,
  QueryConstraint,
  QueryConstraintType,
  QueryFieldFilterConstraint,
  QueryOrderByConstraint,
  QueryLimitConstraint,
  QueryStartAtConstraint,
  QueryEndAtConstraint,
  WithFieldValue
} from 'firebase/firestore';

export type { 
  User, 
  UserCredential, 
  AuthError,
  AuthErrorCodes,
  AuthProvider,
  UserInfo,
  UserMetadata,
  ActionCodeSettings,
  ApplicationVerifier,
  ConfirmationResult,
  MultiFactorError,
  MultiFactorResolver,
  MultiFactorUser,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  OAuthProvider,
  OAuthCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  EmailAuthProvider,
  SAMLAuthProvider
} from 'firebase/auth';

export { analytics };

export { db, auth, app };

/**
 * Convierte una fecha de milisegundos a Timestamp de Firestore
 * @param millis Tiempo en milisegundos
 * @returns Timestamp de Firestore
 */
export const fromMillis = (millis: number) => {
  const { Timestamp } = require('firebase/firestore');
  return Timestamp.fromMillis(millis);
};

/**
 * Obtiene la marca de tiempo del servidor de Firestore
 * @returns Marca de tiempo del servidor
 */
export const serverTimestamp = () => {
  const { serverTimestamp } = require('firebase/firestore');
  return serverTimestamp();
};

/**
 * Obtiene un FieldValue para incrementar un valor numérico
 * @param n Valor a incrementar (por defecto: 1)
 * @returns FieldValue para incremento
 */
export const increment = (n = 1) => {
  const { increment } = require('firebase/firestore');
  return increment(n);
};

/**
 * Obtiene un FieldValue para eliminar un campo
 * @returns FieldValue para eliminación
 */
export const deleteField = () => {
  const { deleteField } = require('firebase/firestore');
  return deleteField();
};

/**
 * Obtiene un FieldValue para una unión de arrays
 * @param elements Elementos a añadir
 * @returns FieldValue para unión de arrays
 */
export const arrayUnion = <T>(...elements: T[]) => {
  const { arrayUnion } = require('firebase/firestore');
  return arrayUnion(...elements);
};

/**
 * Obtiene un FieldValue para eliminar elementos de un array
 * @param elements Elementos a eliminar
 * @returns FieldValue para eliminación de elementos de array
 */
export const arrayRemove = <T>(...elements: T[]) => {
  const { arrayRemove } = require('firebase/firestore');
  return arrayRemove(...elements);
};
