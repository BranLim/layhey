import { AdvancedSetting } from '@/types/AdvancedSetting';

export enum TransactionMode {
  Income = 'Income',
  Expense = 'Expense',
}

export enum TransactionSource {
  Cash = 'Cash',
  Cashback = 'Cashback',
  CreditCard = 'Credit Card',
  DirectDebit = 'Direct Debit',
  Dividend = 'Dividend',
  GovernmentAssistance = 'Government Assistance',
  Salary = 'Salary',
}

export type TransactionCategory = string;

export type Transaction = {
  id: string;
  transactionSource: TransactionSource;
  transactionType: TransactionCategory;
  mode: TransactionMode;
  amount: number;
  currency: string;
  date: Date;
  createdOn?: Date;
  lastModifiedOn?: Date;
};

export type TransactionDto = Transaction;

export type TransactionRequest = Omit<
  TransactionDto,
  'date' | 'createdOn' | 'lastModifiedOn'
> & {
  date: string;
  createdOn?: string;
  lastModifiedOn?: string;
};

export type TransactionResponse = TransactionRequest;

export type AddTransactionRequest = {
  transaction: TransactionRequest;
  hasAdvancedSetting?: boolean;
  advancedSetting?: AdvancedSetting;
};

export const modeFromValue = (value: string): TransactionMode | never => {
  const mode = (
    Object.keys(TransactionMode) as (keyof typeof TransactionMode)[]
  ).find((key) => TransactionMode[key] === value) as TransactionMode;
  if (!mode) {
    throw new Error('unknown transaction mode');
  }
  return mode;
};

export const transactionSourceFromValue = (
  value: string
): TransactionSource | never => {
  const transactionSources = Object.values(TransactionSource);

  if (transactionSources.includes(value as TransactionSource)) {
    return value as TransactionSource;
  }
  throw new Error(`Invalid transaction source: ${value}`);
};
