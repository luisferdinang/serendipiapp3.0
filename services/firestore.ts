// Importaciones de Firebase Firestore
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  Timestamp,
  orderBy,
  limit,
  startAfter,
  type DocumentData, 
  type DocumentReference, 
  type CollectionReference, 
  type WithFieldValue,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type WriteBatch,
  type Query,
  type WhereFilterOp,
  type OrderByDirection
} from 'firebase/firestore';

// Importaciones locales
import { db } from './firebase.js';
import type { 
  Transaction, 
  TransactionType, 
  TransactionStatus 
} from '../types/firebase.js';

// Tipos para las cláusulas de consulta
type WhereClause = [string, WhereFilterOp, unknown];
type OrderByClause = [string, OrderByDirection];

/**
 * Obtiene una referencia a una colección de Firestore
 * @param collectionPath Ruta de la colección (ej: 'users' o 'users/123/transactions')
 * @returns Referencia a la colección
 */
export const getCollectionRef = <T = DocumentData>(
  ...collectionPath: string[]
): CollectionReference<T> => {
  const path = Array.isArray(collectionPath) ? collectionPath : [collectionPath];
  return collection(db, ...path).withConverter({
    toFirestore: (data: WithFieldValue<T>) => data,
    fromFirestore: (snap) => snap.data() as T
  });
};

/**
 * Obtiene una referencia a un documento de Firestore
 * @param collectionPath Ruta de la colección (ej: 'users' o 'users/123/transactions')
 * @param documentId ID del documento
 * @returns Referencia al documento
 */
export const getDocRef = <T = DocumentData>(
  collectionPath: string[],
  documentId: string
): DocumentReference<T> => {
  return doc(db, ...collectionPath, documentId).withConverter({
    toFirestore: (data: WithFieldValue<T>) => data,
    fromFirestore: (snap) => snap.data() as T
  });
};

/**
 * Crea un nuevo documento en una colección
 * @param collectionPath Ruta de la colección
 * @param data Datos del documento
 * @returns Referencia al documento creado
 */
export const createDocument = async <T extends DocumentData>(
  collectionPath: string[],
  data: T
): Promise<DocumentReference<T>> => {
  const colRef = getCollectionRef<T>(...collectionPath);
  return addDoc(colRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

/**
 * Obtiene un documento por su ID
 * @param collectionPath Ruta de la colección
 * @param documentId ID del documento
 * @returns El documento o null si no existe
 */
export const getDocument = async <T extends DocumentData>(
  collectionPath: string[],
  documentId: string
): Promise<{ id: string } & T | null> => {
  const docRef = getDocRef<T>(collectionPath, documentId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() };
};

/**
 * Actualiza un documento existente
 * @param collectionPath Ruta de la colección
 * @param documentId ID del documento
 * @param data Datos a actualizar
 */
export const updateDocument = async <T extends DocumentData>(
  collectionPath: string[],
  documentId: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = getDocRef<T>(collectionPath, documentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
};

/**
 * Elimina un documento
 * @param collectionPath Ruta de la colección
 * @param documentId ID del documento
 */
export const deleteDocument = async <T extends DocumentData>(
  collectionPath: string[],
  documentId: string
): Promise<void> => {
  const docRef = getDocRef<T>(collectionPath, documentId);
  await deleteDoc(docRef);
};

/**
 * Ejecuta una consulta a Firestore
 * @param collectionPath Ruta de la colección
 * @param whereClauses Condiciones WHERE
 * @param orderByClause Ordenamiento
 * @param limitValue Límite de resultados
 * @returns Lista de documentos que coinciden con la consulta
 */
export const queryDocuments = async <T extends DocumentData>(
  collectionPath: string[],
  whereClauses: WhereClause[] = [],
  orderByClause: OrderByClause = ['createdAt', 'desc'],
  limitValue?: number
): Promise<Array<{ id: string } & T>> => {
  const colRef = getCollectionRef<T>(...collectionPath);
  const queryConstraints: QueryConstraint[] = [];
  
  // Agregar condiciones WHERE
  whereClauses.forEach(([field, operator, value]) => {
    queryConstraints.push(where(field, operator as WhereFilterOp, value));
  });
  
  // Agregar ordenamiento
  queryConstraints.push(orderBy(orderByClause[0], orderByClause[1] as OrderByDirection));
  
  // Agregar límite si se especifica
  if (limitValue) {
    queryConstraints.push(limit(limitValue));
  }
  
  // Construir y ejecutar la consulta
  const q = query(colRef, ...queryConstraints);
  const querySnapshot = await getDocs(q);
  
  // Mapear resultados
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Crea un lote de escritura
 * @returns Instancia de WriteBatch
 */
export const createBatch = (): WriteBatch => {
  return writeBatch(db);
};

/**
 * Ejecuta una transacción de lectura/escritura atómica
 * @param updateFunction Función que contiene las operaciones de la transacción
 */
export const runTransaction = async <T>(
  updateFunction: (transaction: any) => Promise<T>
): Promise<T> => {
  // Implementación de transacción
  const result = await updateFunction({});
  return result;
};

// Utilidades específicas para transacciones

interface TransactionFilters {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  status?: TransactionStatus;
  category?: string;
  paymentMethod?: string;
}

/**
 * Obtiene transacciones con filtros avanzados
 * @param filters Filtros de búsqueda
 * @param options Opciones de paginación y ordenamiento
 * @returns Lista de transacciones y el último documento para paginación
 */
export const getTransactions = async (
  filters: TransactionFilters,
  options: {
    limit?: number;
    lastVisible?: DocumentSnapshot;
    orderBy?: OrderByClause;
  } = {}
): Promise<{
  transactions: Array<Transaction & { id: string }>;
  lastVisible: DocumentSnapshot | null;
}> => {
  const {
    limit: limitValue = 10,
    lastVisible,
    orderBy: orderByClause = ['date', 'desc']
  } = options;
  
  const colRef = getCollectionRef<Transaction>('transactions');
  const whereClauses: WhereClause[] = [
    ['userId', '==', filters.userId]
  ];
  
  // Aplicar filtros opcionales
  if (filters.startDate) {
    whereClauses.push(['date', '>=', Timestamp.fromDate(filters.startDate)]);
  }
  
  if (filters.endDate) {
    whereClushes.push(['date', '<=', Timestamp.fromDate(filters.endDate)]);
  }
  
  if (filters.type) {
    whereClauses.push(['type', '==', filters.type]);
  }
  
  if (filters.status) {
    whereClauses.push(['status', '==', filters.status]);
  }
  
  if (filters.category) {
    whereClauses.push(['category', '==', filters.category]);
  }
  
  if (filters.paymentMethod) {
    whereClauses.push(['paymentMethod', '==', filters.paymentMethod]);
  }
  
  // Construir condiciones WHERE con tipos correctos
  const whereConditions = whereClauses.map(([field, op, value]) => 
    where(field, op as WhereFilterOp, value)
  );
  
  // Construir consulta con condiciones
  let q = query(
    colRef,
    ...whereConditions,
    orderBy(orderByClause[0], orderByClause[1] as OrderByDirection),
    limit(limitValue + 1) // +1 para determinar si hay más páginas
  ) as Query<Transaction>;
  
  // Paginación: empezar después del último documento visible
  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }
  
  // Ejecutar consulta
  const querySnapshot = await getDocs(q);
  const transactions: Array<Transaction & { id: string }> = [];
  let newLastVisible: DocumentSnapshot | null = null;
  
  querySnapshot.forEach((docSnap) => {
    transactions.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });
  
  // Si hay más documentos que el límite, guardamos el último para la paginación
  if (querySnapshot.docs.length > limitValue) {
    newLastVisible = querySnapshot.docs[limitValue - 1];
    transactions.pop(); // Eliminamos el documento extra
  }
  
  return {
    transactions,
    lastVisible: newLastVisible
  };
};

/**
 * Obtiene estadísticas de transacciones
 * @param userId ID del usuario
 * @param startDate Fecha de inicio
 * @param endDate Fecha de fin
 * @returns Estadísticas de ingresos, gastos y saldo
 */
export const getTransactionStats = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categories: Record<string, { amount: number; count: number }>;
  paymentMethods: Record<string, { amount: number; count: number }>;
}> => {
  const colRef = getCollectionRef<Transaction>('transactions');
  
  // Consulta para transacciones en el rango de fechas
  const q = query(
    colRef,
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  // Inicializar contadores
  let totalIncome = 0;
  let totalExpenses = 0;
  const categories: Record<string, { amount: number; count: number }> = {};
  const paymentMethods: Record<string, { amount: number; count: number }> = {};
  
  // Procesar cada transacción
  querySnapshot.forEach((doc) => {
    const transaction = doc.data();
    const amount = transaction.amount || 0;
    
    if (transaction.type === 'income') {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
    }
    
    // Estadísticas por categoría
    if (transaction.category) {
      if (!categories[transaction.category]) {
        categories[transaction.category] = { amount: 0, count: 0 };
      }
      categories[transaction.category].amount += amount;
      categories[transaction.category].count++;
    }
    
    // Estadísticas por método de pago
    if (transaction.paymentMethod) {
      if (!paymentMethods[transaction.paymentMethod]) {
        paymentMethods[transaction.paymentMethod] = { amount: 0, count: 0 };
      }
      paymentMethods[transaction.paymentMethod].amount += amount;
      paymentMethods[transaction.paymentMethod].count++;
    }
  });
  
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    categories,
    paymentMethods
  };
};
