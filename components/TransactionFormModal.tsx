
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Transaction, TransactionType, PaymentMethod, Currency } from '../types';
import { PAYMENT_METHOD_OPTIONS, TRANSACTION_TYPE_OPTIONS, formatDateForInput, getCurrencyForPaymentMethod } from '../constants';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transactionData: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>(''); // Monto total (calculado)
  const [unitPrice, setUnitPrice] = useState<string>(''); // Precio unitario
  const [quantity, setQuantity] = useState<string>(''); // Cantidad
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [paymentSplits, setPaymentSplits] = useState<Array<{
    method: PaymentMethod;
    amount: number;
    currency: Currency;
  }>>([
    { method: PaymentMethod.PAGO_MOVIL_BS, amount: 0, currency: Currency.BS }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcular el monto total basado en los métodos de pago
  useEffect(() => {
    const total = paymentSplits.reduce((sum, pm) => sum + (isNaN(pm.amount) ? 0 : pm.amount), 0);
    setAmount(total.toFixed(2));
  }, [paymentSplits]);
  
  // Manejar cambios en los métodos de pago
  const handlePaymentMethodChange = (index: number, field: 'method' | 'amount', value: any) => {
    const updatedSplits = [...paymentSplits];
    
    if (field === 'method') {
      const currency = getCurrencyForPaymentMethod(value as PaymentMethod);
      updatedSplits[index] = { ...updatedSplits[index], method: value as PaymentMethod, currency };
    } else {
      updatedSplits[index] = { ...updatedSplits[index], [field]: value };
    }
    
    setPaymentSplits(updatedSplits);
  };
  
  const addPaymentMethod = () => {
    setPaymentSplits([
      ...paymentSplits,
      { method: PaymentMethod.EFECTIVO_BS, amount: 0, currency: Currency.BS }
    ]);
  };
  
  const removePaymentMethod = (index: number) => {
    if (paymentSplits.length > 1) {
      const updatedSplits = [...paymentSplits];
      updatedSplits.splice(index, 1);
      setPaymentSplits(updatedSplits);
    }
  };

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setUnitPrice(initialData.unitPrice ? initialData.unitPrice.toString() : '');
      setQuantity(initialData.quantity ? initialData.quantity.toString() : '');
      setDate(initialData.date);
      setType(initialData.type);
      // Usar los métodos de pago existentes o crear uno por defecto
      if ('paymentMethods' in initialData && initialData.paymentMethods && initialData.paymentMethods.length > 0) {
        setPaymentSplits(initialData.paymentMethods);
      } else {
        setPaymentSplits([{
          method: (initialData as any).paymentMethod || PaymentMethod.PAGO_MOVIL_BS,
          amount: initialData.amount || 0,
          currency: getCurrencyForPaymentMethod((initialData as any).paymentMethod || PaymentMethod.PAGO_MOVIL_BS)
        }]);
      }
    } else {
      const resetForm = () => {
        setDescription('');
        setAmount('');
        setUnitPrice('');
        setQuantity('');
        setDate(formatDateForInput(new Date()));
        setType(TransactionType.INCOME);
        setPaymentSplits([{ method: PaymentMethod.PAGO_MOVIL_BS, amount: 0, currency: Currency.BS }]);
        setErrors({});
      };
      resetForm();
    }
    setErrors({}); // Clear errors when modal opens or initialData changes
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar el formulario
    const validationErrors: Record<string, string> = {};
    if (!description) validationErrors.description = 'La descripción es requerida';
    
    // Validar que haya al menos un método de pago con monto mayor a cero
    const validPaymentMethods = paymentSplits.filter(pm => pm.amount > 0);
    if (validPaymentMethods.length === 0) {
      validationErrors.paymentMethods = 'Debe agregar al menos un método de pago con monto mayor a cero';
    }
    
    // Validar que la suma de los montos coincida con el monto total
    const totalAmount = validPaymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
    if (Math.abs(totalAmount - parseFloat(amount || '0')) > 0.01) { // Tolerancia para errores de redondeo
      validationErrors.amount = 'La suma de los métodos de pago debe coincidir con el monto total';
    }
    
    if (!date) validationErrors.date = 'La fecha es requerida';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Preparar los datos de la transacción
    const transactionData: Omit<Transaction, 'id'> = {
      description,
      amount: totalAmount,
      unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
      quantity: quantity ? parseFloat(quantity) : undefined,
      date,
      type,
      paymentMethods: validPaymentMethods,
    };
    
    onSubmit(transactionData);
    const resetForm = () => {
      setDescription('');
      setAmount('');
      setUnitPrice('');
      setQuantity('');
      setDate(formatDateForInput(new Date()));
      setType(TransactionType.INCOME);
      setPaymentSplits([{ method: PaymentMethod.PAGO_MOVIL_BS, amount: 0, currency: Currency.BS }]);
      setErrors({});
    };
    resetForm();
  };

  const isAdjustment = type === TransactionType.ADJUSTMENT;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Editar Transacción' : 'Nueva Transacción'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          id="type"
          label="Tipo de Transacción"
          options={TRANSACTION_TYPE_OPTIONS.map(t => ({ value: t.id, label: t.label }))}
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          required
        />
        <Input
          id="description"
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />
        {!isAdjustment && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Métodos de Pago
            </label>
            
            {paymentSplits.map((pm, index) => (
              <div key={index} className="flex gap-2 mb-3 items-end">
                <div className="flex-1">
                  <Select
                    value={pm.method}
                    onChange={(e) => handlePaymentMethodChange(index, 'method', e.target.value as PaymentMethod)}
                    options={PAYMENT_METHOD_OPTIONS.map(opt => ({
                      value: opt.id,
                      label: opt.label
                    }))}
                    error={errors[`paymentMethod_${index}`]}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Monto"
                    value={pm.amount || ''}
                    onChange={(e) => handlePaymentMethodChange(index, 'amount', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                {paymentSplits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePaymentMethod(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPaymentMethod}
              className="mt-2 text-sm text-blue-500 hover:text-blue-700"
            >
              + Agregar otro método de pago
            </button>
            {errors.paymentMethods && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentMethods}</p>
            )}
          </div>
        )}
        {!isAdjustment && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="quantity"
                label="Cantidad"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                error={errors.quantity}
                step="0.01"
                min="0.01"
                required
              />
              <Input
                id="unitPrice"
                label="Precio Unitario"
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                error={errors.unitPrice}
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <Input
              id="amount"
              label="Monto Total"
              type="number"
              value={amount}
              readOnly
              className="opacity-80 cursor-not-allowed"
              error={errors.amount}
              step="0.01"
              required
            />
          </>
        )}
        {isAdjustment && (
          <Input
            id="amount"
            label="Monto del Ajuste"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            step="0.01"
            required
          />
        )}
        <Input
          id="date"
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Métodos de Pago
          </label>
          
          {paymentSplits.map((pm, index) => (
            <div key={index} className="flex gap-2 mb-3 items-end">
              <div className="flex-1">
                <Select
                  value={pm.method}
                  onChange={(e) => handlePaymentMethodChange(index, 'method', e.target.value as PaymentMethod)}
                  options={PAYMENT_METHOD_OPTIONS.map(opt => ({
                    value: opt.id,
                    label: opt.label
                  }))}
                  error={errors[`paymentMethod_${index}`]}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Monto"
                  value={pm.amount || ''}
                  onChange={(e) => handlePaymentMethodChange(index, 'amount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              {paymentSplits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePaymentMethod(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addPaymentMethod}
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            + Agregar otro método de pago
          </button>
          
          {errors.paymentMethods && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentMethods}</p>
          )}
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">{initialData ? 'Actualizar' : 'Agregar'}</Button>
        </div>
      </form>
    </Modal>
  );
};
