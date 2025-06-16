import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction, CustomDateRange, FilterPeriod } from '../types';
import { FilterControls } from '../components/FilterControls';
import { FinancialSummary } from '../components/FinancialSummary';
import { TransactionList } from '../components/TransactionList';
import { CurrencyConverter } from '../components/CurrencyConverter';
import { TransactionFormModal } from '../components/TransactionFormModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { Button } from '../components/ui/Button';

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const Dashboard: React.FC = () => {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<{ id: string, description: string } | null>(null);
  const navigate = useNavigate();

  const handleOpenModal = (transaction?: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTransaction(undefined);
    setIsModalOpen(false);
  };

  const handleSubmit = (transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction({ ...editingTransaction, ...transactionData });
    } else {
      addTransaction(transactionData);
    }
    handleCloseModal();
  };

  const handleDeleteClick = (id: string, description: string) => {
    setTransactionToDelete({ id, description });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCustomRangeChange = (name: keyof CustomDateRange, value: string) => {
    setCustomDateRange(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-300">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto p-4">
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsCurrencyModalOpen(true)}
              variant="outline"
              className="bg-slate-800 hover:bg-slate-700 text-white"
            >
              Cambiar Moneda
            </Button>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="mr-2" />
              Nueva Transacción
            </Button>
          </div>
        </div>

        <FilterControls
          filterPeriod={filterPeriod}
          setFilterPeriod={setFilterPeriod}
          customDateRange={customDateRange}
          onCustomRangeChange={handleCustomRangeChange}
        />

        <FinancialSummary summary={financialSummary} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Ingresos y Ajustes</h2>
          <TransactionList
            transactions={incomeAndAdjustments}
            onEdit={handleOpenModal}
            onDelete={handleDeleteClick}
            getPaymentMethodDetails={getPaymentMethodDetails}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Gastos</h2>
          <TransactionList
            transactions={expenses}
            onEdit={handleOpenModal}
            onDelete={handleDeleteClick}
            getPaymentMethodDetails={getPaymentMethodDetails}
          />
        </div>
      </div>

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        transaction={editingTransaction}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        description={transactionToDelete?.description || ''}
      />

      <CurrencyConverter
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        exchangeRate={exchangeRate}
        onExchangeRateChange={setExchangeRate}
      />
    </div>
  );
};

export default Dashboard;
