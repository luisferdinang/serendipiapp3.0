
import React, { useState } from 'react';
import { Header } from './components/Header';
import { FilterControls } from './components/FilterControls';
import { FinancialSummary } from './components/FinancialSummary';
import { TransactionList } from './components/TransactionList';
import { CurrencyConverter } from './components/CurrencyConverter';
import { TransactionFormModal } from './components/TransactionFormModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { Button } from './components/ui/Button';
import { useTransactions } from './hooks/useTransactions';
import { Transaction, CustomDateRange, FilterPeriod, FinancialSummaryData } from './types';
import { INITIAL_EXCHANGE_RATE } from './constants';

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);


const App: React.FC = () => {
  const {
    transactions,
    incomeAndAdjustments,
    expenses,
    financialSummary,
    filterPeriod,
    setFilterPeriod,
    customDateRange,
    setCustomDateRange,
    exchangeRate,
    setExchangeRate,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading,
    error,
    getPaymentMethodDetails
  } = useTransactions();

  // Estado inicial para evitar errores de undefined
  const safeFinancialSummary = financialSummary || {
    bs: { periodIncome: 0, periodExpenses: 0, cashBalance: 0, bankBalance: 0, totalBalance: 0 },
    usd: { periodIncome: 0, periodExpenses: 0, cashBalance: 0, usdtBalance: 0, totalBalance: 0 }
  };

  const safeExchangeRate = exchangeRate || INITIAL_EXCHANGE_RATE;

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<{ id: string, description: string } | null>(null);

  const handleOpenTransactionModal = (transaction?: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setEditingTransaction(undefined);
    setIsTransactionModalOpen(false);
  };

  const handleSubmitTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction({ ...editingTransaction, ...transactionData });
    } else {
      addTransaction(transactionData);
    }
  };

  const handleOpenDeleteModal = (id: string, description: string) => {
    setTransactionToDelete({ id, description });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
    setIsDeleteModalOpen(false);
  };

  const handleCustomRangeChange = (name: keyof CustomDateRange, value: string) => {
    setCustomDateRange(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-sky-400 text-xl animate-pulse">Cargando Finanzas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-black">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {error && <div className="bg-red-500/20 border border-red-700 text-red-300 p-4 rounded-md mb-6">{error}</div>}
        
        <div className="flex justify-end mb-6">
          <Button onClick={() => handleOpenTransactionModal()} variant="primary" size="lg" leftIcon={<PlusIcon />}>
            Nueva Transacción
          </Button>
        </div>

        <FilterControls 
          currentFilter={filterPeriod}
          onFilterChange={(newFilter) => setFilterPeriod(newFilter as FilterPeriod)}
          customRange={customDateRange}
          onCustomRangeChange={handleCustomRangeChange}
        />

        <FinancialSummary summary={safeFinancialSummary} />

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <TransactionList
            title="Historial de Ingresos y Ajustes"
            transactions={incomeAndAdjustments}
            onEdit={handleOpenTransactionModal}
            onDelete={handleOpenDeleteModal}
            getPaymentMethodDetails={getPaymentMethodDetails}
          />
          <TransactionList
            title="Historial de Gastos"
            transactions={expenses}
            onEdit={handleOpenTransactionModal}
            onDelete={handleOpenDeleteModal}
            getPaymentMethodDetails={getPaymentMethodDetails}
          />
        </div>

        <CurrencyConverter 
          bsTotal={safeFinancialSummary.bs.totalBalance}
          exchangeRate={safeExchangeRate}
          onExchangeRateChange={setExchangeRate}
        />

        <TransactionFormModal
          isOpen={isTransactionModalOpen}
          onClose={handleCloseTransactionModal}
          onSubmit={handleSubmitTransaction}
          initialData={editingTransaction}
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={transactionToDelete?.description}
        />
      </main>
      <footer className="text-center p-6 text-slate-500 border-t border-slate-700/50 mt-12">
        <p>&copy; {new Date().getFullYear()} Serendipia Studio. Todos los derechos reservados.</p>
        <p className="text-xs mt-1">Hecho con amor y código.</p>
      </footer>
    </div>
  );
};

export default App;
