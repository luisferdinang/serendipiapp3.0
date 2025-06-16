import React, { useState } from 'react';
// Se elimina useNavigate ya que no se está utilizando
import { useTransactions } from '../hooks/useTransactions.js';
import { Transaction, CustomDateRange, FilterPeriod } from '../types/index.js';
import { FilterControls } from '../components/FilterControls.jsx';
import { FinancialSummary } from '../components/FinancialSummary.jsx';
import { TransactionList } from '../components/TransactionList.jsx';
import { CurrencyConverter } from '../components/CurrencyConverter.jsx';
import { TransactionFormModal } from '../components/TransactionFormModal.jsx';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal.jsx';
import { Button } from '../components/ui/Button.jsx';

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const Dashboard: React.FC = () => {
  const {
    // Se elimina transactions ya que no se usa
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

  const handleOpenModal = (transaction?: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTransaction(undefined);
    setIsModalOpen(false);
  };

  const handleSubmitTransaction = (transactionData: Omit<Transaction, 'id'>) => {
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

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCustomRangeChange = (name: keyof CustomDateRange, value: string) => {
    setCustomDateRange((prev: CustomDateRange) => ({ ...prev, [name]: value }));
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
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
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

        <div className="mb-8">
          <FilterControls
            currentFilter={filterPeriod}
            onFilterChange={setFilterPeriod}
            customRange={customDateRange}
            onCustomRangeChange={handleCustomRangeChange}
          />
        </div>

        <FinancialSummary summary={financialSummary} />

        <div className="mb-8">
          <TransactionList
            title="Ingresos y Ajustes"
            transactions={incomeAndAdjustments}
            onEdit={handleOpenModal}
            onDelete={(id, description) => setTransactionToDelete({ id, description })}
            getPaymentMethodDetails={getPaymentMethodDetails}
          />
        </div>

        <div className="mb-8">
          <TransactionList
            title="Gastos"
            transactions={expenses}
            onEdit={handleOpenModal}
            onDelete={(id, description) => setTransactionToDelete({ id, description })}
            getPaymentMethodDetails={getPaymentMethodDetails}
          />
        </div>

        <TransactionFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitTransaction}
          initialData={editingTransaction}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={transactionToDelete?.description}
        />

        {isCurrencyModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Conversor de Moneda</h2>
                <button 
                  onClick={() => setIsCurrencyModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Cerrar conversor de moneda"
                >
                  ✕
                </button>
              </div>
              <CurrencyConverter
                bsTotal={0}
                exchangeRate={exchangeRate}
                onExchangeRateChange={setExchangeRate}
                onClose={() => setIsCurrencyModalOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
