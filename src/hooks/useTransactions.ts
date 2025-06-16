
import { useState, useEffect, useCallback } from 'react';
import { Transaction, FilterPeriod, FinancialSummaryData, Currency, TransactionType, CustomDateRange } from '../types';
import { PAYMENT_METHOD_OPTIONS, INITIAL_EXCHANGE_RATE, formatDateForInput, parseInputDate } from '../constants';
import { transactionService } from '../services/transactionService';

const today = new Date();

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>(FilterPeriod.ALL);
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({
    startDate: formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1)), // First day of current month
    endDate: formatDateForInput(today), // Today
  });

  const [exchangeRate, setExchangeRateState] = useState<number>(INITIAL_EXCHANGE_RATE);

  const loadInitialData = useCallback(async () => {
    console.log('Iniciando carga de datos...');
    setIsLoading(true);
    setError(null);
    
    // Establecer un tiempo de espera máximo de 10 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Tiempo de espera agotado al cargar los datos')), 10000)
    );

    try {
      console.log('Obteniendo transacciones y tasa de cambio...');
      
      // Usar Promise.race para manejar el tiempo de espera
      const data = await Promise.race([
        Promise.all([
          transactionService.getTransactions(),
          transactionService.getExchangeRate()
        ]),
        timeoutPromise
      ]) as [Transaction[], number | null];
      
      const [storedTransactions, storedRate] = data;
      
      console.log('Transacciones cargadas:', storedTransactions);
      console.log('Tasa de cambio cargada:', storedRate);
      
      // Verificar si storedTransactions es un array
      if (!Array.isArray(storedTransactions)) {
        throw new Error('Formato de transacciones inválido');
      }
      
      const sortedTransactions = [...storedTransactions].sort((a: Transaction, b: Transaction) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      console.log('Transacciones ordenadas:', sortedTransactions);
      
      setTransactions(sortedTransactions);
      
      if (storedRate !== null && typeof storedRate === 'number') {
        console.log('Estableciendo tasa de cambio:', storedRate);
        setExchangeRateState(storedRate);
      } else {
        console.log('No se encontró tasa de cambio guardada, usando valor por defecto');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido al cargar datos';
      console.error('Error en loadInitialData:', e);
      setError(`Error al cargar datos: ${errorMessage}. Por favor, recarga la página.`);
      
      // Establecer datos vacíos para permitir que la aplicación se renderice
      setTransactions([]);
      setExchangeRateState(INITIAL_EXCHANGE_RATE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const setAndSaveExchangeRate = async (rate: number) => {
    setExchangeRateState(rate);
    try {
      await transactionService.saveExchangeRate(rate);
    } catch (e) {
      console.error("Failed to save exchange rate", e);
      // Optionally notify user
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    // Asegurarse de que la fecha esté en el formato correcto
    const transactionDate = new Date(transactionData.date);
    const normalizedDate = formatDateForInput(transactionDate);
    
    const newTransaction: Transaction = {
      ...transactionData,
      date: normalizedDate, // Asegurar formato consistente
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // Simple unique ID
    };
    
    const updatedTransactions = [newTransaction, ...transactions].sort((a: Transaction, b: Transaction) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setTransactions(updatedTransactions);
    await transactionService.saveTransactions(updatedTransactions);
  };

  const updateTransaction = async (transaction: Transaction) => {
    const updatedTransactions = transactions.map((t: Transaction) => 
      t.id === transaction.id ? { ...transaction } : t
    );
    const sortedTransactions = [...updatedTransactions].sort((a: Transaction, b: Transaction) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setTransactions(sortedTransactions);
    await transactionService.saveTransactions(sortedTransactions);
  };

  const deleteTransaction = async (id: string) => {
    const updatedTransactions = transactions.filter((t: Transaction) => t.id !== id);
    setTransactions(updatedTransactions);
    await transactionService.saveTransactions(updatedTransactions);
  };

  const getPaymentMethodDetails = (methodId: string) => {
    return PAYMENT_METHOD_OPTIONS.find(m => m.id === methodId);
  };

  const getFilteredTransactions = useCallback((): Transaction[] => {
    if (!transactions || transactions.length === 0) return [];
    
    return transactions.filter((t: Transaction) => {
      // Filtrado por período
      if (filterPeriod === FilterPeriod.ALL) return true;
      
      try {
        // Asegurarse de que la transacción tenga una fecha válida
        if (!t.date) return false;
        
        // Convertir la fecha de la transacción a un objeto Date
        const transactionDate = new Date(t.date);
        if (isNaN(transactionDate.getTime())) return false;
        
        // Normalizar la hora a medianoche para comparación
        transactionDate.setHours(0, 0, 0, 0);
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        switch (filterPeriod) {
          case FilterPeriod.TODAY: {
            const today = new Date(now);
            return (
              transactionDate.getFullYear() === today.getFullYear() &&
              transactionDate.getMonth() === today.getMonth() &&
              transactionDate.getDate() === today.getDate()
            );
          }
          case FilterPeriod.WEEK: {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            weekAgo.setHours(0, 0, 0, 0);
            return transactionDate >= weekAgo && transactionDate <= now;
          }
          case FilterPeriod.MONTH: {
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            firstDayOfMonth.setHours(0, 0, 0, 0);
            return transactionDate >= firstDayOfMonth && transactionDate <= now;
          }
          case FilterPeriod.CUSTOM: {
            if (!customDateRange.startDate || !customDateRange.endDate) return true;
            
            try {
              const startDate = new Date(customDateRange.startDate);
              const endDate = new Date(customDateRange.endDate);
              
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
              
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(23, 59, 59, 999);
              
              return transactionDate >= startDate && transactionDate <= endDate;
            } catch (e) {
              console.error('Error al analizar fechas personalizadas:', e);
              return false;
            }
          }
          default:
            return true;
        }
      } catch (e) {
        console.error('Error al filtrar transacción:', e, 'Transacción:', t);
        return false;
      }
    });
  }, [transactions, filterPeriod, customDateRange]);

  const filteredTransactions = getFilteredTransactions();

  const incomeAndAdjustments = filteredTransactions.filter(
    (t: Transaction) => t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT
  );
  const expenses = filteredTransactions.filter((t: Transaction) => t.type === TransactionType.EXPENSE);

  const financialSummary: FinancialSummaryData = {
    bs: { 
      periodIncome: 0, 
      periodExpenses: 0,
      cashBalance: 0, 
      bankBalance: 0, 
      totalBalance: 0 
    },
    usd: { 
      periodIncome: 0, 
      periodExpenses: 0,
      cashBalance: 0, 
      usdtBalance: 0, 
      totalBalance: 0 
    }
  };

  // Procesar todas las transacciones
  transactions.forEach(t => {
    // Asegurarse de que paymentMethods sea un array
    const paymentMethods = Array.isArray(t.paymentMethods) ? t.paymentMethods : [];
    
    // Procesar cada método de pago en la transacción
    paymentMethods.forEach(payment => {
      const methodDetails = getPaymentMethodDetails(payment.method);
      if (!methodDetails) return;

      const isWithinFilterPeriod = filteredTransactions.some(ft => ft.id === t.id);
      
      // Calcular saldos totales independientemente del período de filtro
      if (methodDetails.currency === Currency.BS) {
        if (t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT) {
          if (methodDetails.accountType === 'cash') financialSummary.bs.cashBalance += payment.amount;
          if (methodDetails.accountType === 'bank') financialSummary.bs.bankBalance += payment.amount;
        } else if (t.type === TransactionType.EXPENSE) {
          if (methodDetails.accountType === 'cash') financialSummary.bs.cashBalance -= payment.amount;
          if (methodDetails.accountType === 'bank') financialSummary.bs.bankBalance -= payment.amount;
        }
      } else if (methodDetails.currency === Currency.USD) {
        if (t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT) {
          if (methodDetails.accountType === 'cash') financialSummary.usd.cashBalance += payment.amount;
          if (methodDetails.accountType === 'digital') financialSummary.usd.usdtBalance += payment.amount;
        } else if (t.type === TransactionType.EXPENSE) {
          if (methodDetails.accountType === 'cash') financialSummary.usd.cashBalance -= payment.amount;
          if (methodDetails.accountType === 'digital') financialSummary.usd.usdtBalance -= payment.amount;
        }
      }
      
      // Calcular ingresos y gastos del período solo para transacciones dentro del filtro
      if (isWithinFilterPeriod) {
        if (t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT) {
          if (methodDetails.currency === Currency.BS) {
            financialSummary.bs.periodIncome += payment.amount;
          } else if (methodDetails.currency === Currency.USD) {
            financialSummary.usd.periodIncome += payment.amount;
          }
        } else if (t.type === TransactionType.EXPENSE) {
          if (methodDetails.currency === Currency.BS) {
            financialSummary.bs.periodExpenses += payment.amount;
          } else if (methodDetails.currency === Currency.USD) {
            financialSummary.usd.periodExpenses += payment.amount;
          }
        }
      }
    });
  });

  // Calcular saldos totales
  financialSummary.bs.totalBalance = financialSummary.bs.cashBalance + financialSummary.bs.bankBalance;
  financialSummary.usd.totalBalance = financialSummary.usd.cashBalance + financialSummary.usd.usdtBalance;

  return {
    transactions: filteredTransactions, // Return filtered for lists
    allTransactions: transactions, // For calculations that might need all data before filtering (like total balance)
    incomeAndAdjustments,
    expenses,
    financialSummary,
    filterPeriod,
    setFilterPeriod,
    customDateRange,
    setCustomDateRange,
    exchangeRate,
    setExchangeRate: setAndSaveExchangeRate,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading,
    error,
    getPaymentMethodDetails,
  };
};
