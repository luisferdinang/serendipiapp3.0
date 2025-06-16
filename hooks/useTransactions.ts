
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
    setIsLoading(true);
    setError(null);
    try {
      const [storedTransactions, storedRate] = await Promise.all([
        transactionService.getTransactions(),
        transactionService.getExchangeRate()
      ]);
      setTransactions(storedTransactions.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      if (storedRate !== null) {
        setExchangeRateState(storedRate);
      }
    } catch (e) {
      setError("Error al cargar datos. Intenta de nuevo.");
      console.error(e);
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
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // Simple unique ID
    };
    const updatedTransactions = [newTransaction, ...transactions].sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    return transactions
      .filter((t: Transaction) => {
        // Filtrado por período
        if (filterPeriod === FilterPeriod.ALL) return true;
        
        const transactionDate = new Date(t.date);
        const start = new Date();
        
        switch (filterPeriod) {
          case FilterPeriod.TODAY:
            start.setHours(0, 0, 0, 0);
            return transactionDate >= start;
          case FilterPeriod.WEEK:
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            return transactionDate >= start;
          case FilterPeriod.MONTH:
            start.setMonth(start.getMonth() - 1);
            start.setHours(0, 0, 0, 0);
            return transactionDate >= start;
          case FilterPeriod.CUSTOM:
            const startDate = parseInputDate(customDateRange.startDate);
            const endDate = parseInputDate(customDateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            return transactionDate >= startDate && transactionDate <= endDate;
          default:
            return true;
        }
      })
      .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterPeriod, customDateRange]);

  const filteredTransactions = getFilteredTransactions();

  const incomeAndAdjustments = filteredTransactions.filter(
    (t: Transaction) => t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT
  );
  const expenses = filteredTransactions.filter((t: Transaction) => t.type === TransactionType.EXPENSE);

  const financialSummary: FinancialSummaryData = transactions.reduce<FinancialSummaryData>((acc: FinancialSummaryData, t: Transaction) => {
    const methodDetails = getPaymentMethodDetails(t.paymentMethod);
    if (!methodDetails) return acc;

    const isWithinFilterPeriod = filteredTransactions.some((ft: Transaction) => ft.id === t.id);
    
    // Calculate total balances regardless of filter period (balances are cumulative)
    if (methodDetails.currency === Currency.BS) {
        if (t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT) {
            if (methodDetails.accountType === 'cash') acc.bs.cashBalance += t.amount;
            if (methodDetails.accountType === 'bank') acc.bs.bankBalance += t.amount;
        } else if (t.type === TransactionType.EXPENSE) {
            if (methodDetails.accountType === 'cash') acc.bs.cashBalance -= t.amount;
            if (methodDetails.accountType === 'bank') acc.bs.bankBalance -= t.amount;
        }
    } else if (methodDetails.currency === Currency.USD) {
        if (t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT) {
            if (methodDetails.accountType === 'cash') acc.usd.cashBalance += t.amount;
            if (methodDetails.accountType === 'digital') acc.usd.usdtBalance += t.amount;
        } else if (t.type === TransactionType.EXPENSE) {
            if (methodDetails.accountType === 'cash') acc.usd.cashBalance -= t.amount;
            if (methodDetails.accountType === 'digital') acc.usd.usdtBalance -= t.amount;
        }
    }
    
    // Calculate period income only for transactions within the filter
    if (isWithinFilterPeriod && (t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT)) {
        if (methodDetails.currency === Currency.BS) {
            acc.bs.periodIncome += t.amount;
        } else if (methodDetails.currency === Currency.USD) {
            acc.usd.periodIncome += t.amount;
        }
    }

    return acc;
  }, {
    bs: { periodIncome: 0, cashBalance: 0, bankBalance: 0, totalBalance: 0 },
    usd: { periodIncome: 0, cashBalance: 0, usdtBalance: 0, totalBalance: 0 },
  });

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
