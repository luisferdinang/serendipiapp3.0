export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date | any;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  currency: string;
  exchangeRate?: number;
  convertedAmount?: number;
  convertedCurrency?: string;
  attachments?: string[];
  tags?: string[];
  notes?: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

export interface CustomDateRange {
  start?: Date;
  end?: Date;
}

export type FilterPeriod = 
  | 'today' 
  | 'yesterday' 
  | 'thisWeek' 
  | 'lastWeek' 
  | 'thisMonth' 
  | 'lastMonth' 
  | 'thisYear' 
  | 'lastYear' 
  | 'allTime' 
  | 'custom';
