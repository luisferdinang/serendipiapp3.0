// Tipos de Firestore
export type { 
  DocumentData, 
  DocumentReference, 
  CollectionReference, 
  WithFieldValue,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  WriteBatch,
  Query,
  WhereFilterOp,
  OrderByDirection 
} from 'firebase/firestore';

// Tipos de Autenticación
export type { 
  User as FirebaseUser,
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

// Tipos de la aplicación
export type { 
  Transaction, 
  TransactionType, 
  TransactionStatus, 
  CustomDateRange, 
  FilterPeriod 
} from './transaction.js';

declare global {
  interface Window {
    // Agregar cualquier tipo global necesario
  }
}
