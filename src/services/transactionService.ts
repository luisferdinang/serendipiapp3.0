
import { Transaction, TransactionType } from '../types';
import { FirestoreService } from './firestoreService';
import { where, orderBy, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'transactions';
const SETTINGS_COLLECTION = 'settings';

class TransactionService extends FirestoreService<Transaction> {
  constructor() {
    super(COLLECTION_NAME);
  }

  // Obtener transacciones con opción de filtrado por fecha
  async getTransactions(
    startDate?: Date,
    endDate?: Date
  ): Promise<Transaction[]> {
    // Si no se proporcionan fechas, devolver todas las transacciones
    if (!startDate && !endDate) {
      return this.getAll();
    }
    
    const constraints: any[] = [];
    
    if (startDate) {
      constraints.push(where('date', '>=', Timestamp.fromDate(startDate)));
    }
    
    if (endDate) {
      // Ajustar para incluir todo el día final
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      constraints.push(where('date', '<=', Timestamp.fromDate(endOfDay)));
    }
    
    // Ordenar por fecha descendente por defecto
    constraints.push(orderBy('date', 'desc'));
    
    return this.query(constraints);
  }

  // Obtener transacciones agrupadas por tipo
  async getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
    return this.query([
      where('type', '==', type),
      orderBy('date', 'desc')
    ]);
  }

  // Guardar múltiples transacciones
  async saveTransactions(transactions: Transaction[]): Promise<void> {
    // Eliminar transacciones existentes primero si es necesario
    const existingTransactions = await this.getAll();
    const deletePromises = existingTransactions.map(tx => this.delete(tx.id));
    await Promise.all(deletePromises);
    
    // Agregar las nuevas transacciones
    const addPromises = transactions.map(tx => {
      // Extraer el id del objeto para no guardarlo dos veces
      const { id, ...txData } = tx;
      return this.create(txData);
    });
    
    await Promise.all(addPromises);
  }

  // Obtener el tipo de cambio actual
  async getExchangeRate(): Promise<number | null> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, 'exchange_rate');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().rate as number;
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
      await setDoc(docRef, { rate, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error('Error al guardar el tipo de cambio:', error);
      throw error;
    }
  }

  // Métodos heredados de FirestoreService:
  // - create(transaction: Omit<Transaction, 'id'>): Promise<Transaction>
  // - getById(id: string): Promise<Transaction | null>
  // - update(id: string, data: Partial<Transaction>): Promise<Transaction>
  // - delete(id: string): Promise<{ id: string }>
}

export const transactionService = new TransactionService();

// Tipos de exportación para facilitar las importaciones
export { TransactionType, PaymentMethod } from '../types';
export type { Transaction } from '../types';
