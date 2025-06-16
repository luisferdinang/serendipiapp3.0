
export enum Currency {
  BS = 'Bs.',
  USD = 'USD',
}

export enum PaymentMethod {
  PAGO_MOVIL_BS = 'PAGO_MOVIL_BS',
  EFECTIVO_BS = 'EFECTIVO_BS',
  EFECTIVO_USD = 'EFECTIVO_USD',
  USDT = 'USDT',
  ADJUSTMENT = 'AJUSTE',
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  currency: Currency;
  accountType: 'bank' | 'cash' | 'digital';
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  ADJUSTMENT = 'adjustment',
}

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
  currency: Currency;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Monto total (suma de todos los métodos de pago)
  unitPrice?: number; // Precio unitario
  quantity?: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  paymentMethods: PaymentSplit[]; // Ahora soporta múltiples métodos de pago
  // Currency se deriva de los métodos de pago individuales
}

export enum FilterPeriod {
  ALL = 'all',
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  CUSTOM = 'custom',
}

export interface BsSummary {
  periodIncome: number;
  periodExpenses: number;
  cashBalance: number;
  bankBalance: number; // Pago Móvil
  totalBalance: number;
}

export interface UsdSummary {
  periodIncome: number;
  periodExpenses: number;
  cashBalance: number;
  usdtBalance: number;
  totalBalance: number;
}

export interface FinancialSummaryData {
  bs: BsSummary;
  usd: UsdSummary;
}

export interface CustomDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}
