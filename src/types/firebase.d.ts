// Tipos para Firebase
import { 
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

// Tipos para autenticación
import { 
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

export type {
  // Firestore
  DocumentData,
  DocumentReference,
  CollectionReference,
  WithFieldValue,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  WriteBatch,
  Query,
  WhereFilterOp,
  OrderByDirection,
  // Auth
  FirebaseUser as User,
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
};

// Tipos para transacciones
export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date | any; // Firestore Timestamp o Date
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  currency: string;
  exchangeRate?: number;
  convertedAmount?: number;
  convertedCurrency?: string;
  attachments?: string[];
  tags?: string[];
  notes?: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';
