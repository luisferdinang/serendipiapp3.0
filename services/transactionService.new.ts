import { Transaction, TransactionType } from '../types.js';
import { FirestoreService } from './firestoreService.js';
import { 
  where, 
  orderBy, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query as firestoreQuery,
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase.js';

const COLLECTION_NAME = 'transactions';
const SETTINGS_COLLECTION = 'settings';

export class TransactionService extends FirestoreService<Transaction> {
  constructor() {
    super(COLLECTION_NAME);
  }

  // Obtener transacciones con opción de filtrado por fecha
  async getTransactions(
    startDate?: Date,
    endDate?: Date
  ): Promise<Transaction[]> {
    try {
      const conditions: QueryConstraint[] = [];
      
      if (startDate) {
        conditions.push(where('date', '>=', startDate.toISOString().split('T')[0]));
      }
      
      if (endDate) {
        // Ajustar para incluir todo el día final
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        conditions.push(where('date', '<=', endOfDay.toISOString().split('T')[0]));
      }
      
      // Ordenar por fecha descendente por defecto
      conditions.push(orderBy('date', 'desc'));
      
      // Usar el método query de la clase base
      const transactions = conditions.length > 0 
        ? await this.query(conditions)
        : await this.getAll();
      
      // Asegurarse de que todas las transacciones tengan fecha válida
      return transactions.map(tx => ({
        ...tx,
        date: tx.date || new Date().toISOString().split('T')[0] // Usar fecha actual si no hay fecha
      }));
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      return [];
    }
  }

  // Obtener transacciones agrupadas por tipo
  async getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
    try {
      const conditions = [
        where('type', '==', type),
        orderBy('date', 'desc')
      ];
      
      return await this.query(conditions);
    } catch (error) {
      console.error('Error al obtener transacciones por tipo:', error);
      return [];
    }
  }

  // Guardar múltiples transacciones
  async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      const batch: Promise<any>[] = [];
      
      // Eliminar transacciones existentes primero si es necesario
      const existingTransactions = await this.getAll();
      existingTransactions.forEach(tx => {
        batch.push(this.delete(tx.id));
      });
      
      // Agregar las nuevas transacciones
      transactions.forEach(tx => {
        const { id, ...txData } = tx;
        batch.push(this.create(txData));
      });
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Error al guardar transacciones:', error);
      throw error;
    }
  }

  // Obtener el tipo de cambio actual
  async getExchangeRate(): Promise<number | null> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, 'exchange_rate');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data()?.rate as number || null;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener el tipo de cambio:', error);
      return null;
    }
  }

  // Guardar el tipo de cambio
  async saveExchangeRate(rate: number): Promise<void> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, 'exchange_rate');
      await setDoc(docRef, { 
        rate, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    } catch (error) {
      console.error('Error al guardar el tipo de cambio:', error);
      throw error;
    }
  }

  // Sobrescribir el método create para asegurar que se incluya la fecha de creación
  override async create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = new Date().toISOString();
    const transactionData = {
      ...data,
      createdAt: now,
      updatedAt: now
    };
    return super.create(transactionData);
  }
  
  // Sobrescribir el método update para actualizar la fecha de actualización
  override async update(id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<Transaction> {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    return super.update(id, updateData);
  }

  // Sobrescribir el método query para asegurar el tipado correcto
  protected override async query(constraints: QueryConstraint[]): Promise<Transaction[]> {
    const results = await super.query(constraints);
    return results as Transaction[];
  }

  // Sobrescribir el método getAll para asegurar el tipado correcto
  protected override async getAll(): Promise<Transaction[]> {
    const results = await super.getAll();
    return results as Transaction[];
  }
}

// Crear una instancia del servicio de transacciones
export const transactionService = new TransactionService();

// Tipos de exportación para facilitar las importaciones
export type { Transaction, TransactionType } from '../types.js';
