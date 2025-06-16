import { Transaction, TransactionType, PaymentMethod } from '../types.js';
import { transactionService } from '../services/transactionService.js';

interface ImportedTransaction {
  date: string;
  type: string;
  description: string;
  quantity: number | null;
  unitPrice: number | null;
  income: number;
  expense: number;
  payment: {
    banco: number;
    efectivo: number;
    usd: number;
    usdt: number;
  };
  id: string;
}

function mapToTransaction(tx: ImportedTransaction): Transaction {
  // Mapear el tipo de transacción
  let type: TransactionType;
  switch(tx.type.toLowerCase()) {
    case 'venta':
      type = TransactionType.INCOME;
      break;
    case 'gasto':
      type = TransactionType.EXPENSE;
      break;
    case 'ajuste':
      type = TransactionType.ADJUSTMENT;
      break;
    default:
      type = TransactionType.INCOME; // Por defecto
  }

  // Determinar monto y método de pago
  const amount = tx.income || tx.expense || 0;
  let paymentMethod: PaymentMethod = PaymentMethod.EFECTIVO_BS; // Valor por defecto
  
  if (tx.payment.banco > 0) paymentMethod = PaymentMethod.PAGO_MOVIL_BS;
  else if (tx.payment.usd > 0) paymentMethod = PaymentMethod.EFECTIVO_USD;
  else if (tx.payment.usdt > 0) paymentMethod = PaymentMethod.USDT;

  // Mapear a la estructura de Transaction
  return {
    id: tx.id,
    date: tx.date,
    type,
    description: tx.description,
    amount,
    paymentMethod,
    quantity: tx.quantity || 1
  };
}

export async function importTransactions(transactionsData: ImportedTransaction[]): Promise<void> {
  try {
    console.log('Procesando transacciones...');
    const transactions = transactionsData.map(mapToTransaction);
    
    // Usar el método saveTransactions que ya maneja el guardado por lotes
    await transactionService.saveTransactions(transactions);
    const importedCount = transactions.length;
    
    console.log('¡Importación completada con éxito!');
    console.log(`Total de transacciones importadas: ${importedCount}`);
  } catch (error) {
    console.error('Error durante la importación:', error);
    throw error; // Relanzar el error para manejarlo en el llamador
  }
}
