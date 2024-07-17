import { AdvancedSetting } from '@/types/AdvancedSetting';

export enum TransactionMode {
  Income = 'Income',
  Expense = 'Expense',
}

export enum TransactionSource {
  Cash = 'Cash',
  Cheque = 'Cheque',
  CreditCard = 'Credit Card',
  DirectDebit = 'Direct Debit',
  DirectCredit = 'Direct Credit',
}

export type TransactionCategoryName = string;

export type TransactionCategory = {
  id: string;
  name: TransactionCategoryName;
  description: string;
};

export type TransactionCategoryDto = TransactionCategory;

export type TransactionCategoriesResponse = {
  categories: TransactionCategory[];
};

export type Transaction = {
  id: string;
  transactionSource: TransactionSource;
  transactionCategory: TransactionCategoryName;
  mode: TransactionMode;
  amount: number;
  currency: string;
  date: Date;
  createdOn?: Date;
  lastModifiedOn?: Date;
};

export type SerializableTransaction = Omit<
  Transaction,
  'mode' | 'transactionSource' | 'date' | 'createdOn' | 'lastModifiedOn'
> & {
  mode: string;
  transactionSource: string;
  date: string;
  createdOn?: string;
  lastModifiedOn?: string;
};

export type TransactionDto = Transaction;

export type TransactionRequest = SerializableTransaction;
export type TransactionResponse = SerializableTransaction;

export type AddTransactionRequest = {
  transaction: TransactionRequest;
  hasAdvancedSetting?: boolean;
  advancedSetting?: AdvancedSetting;
};

export type TransactionQueryParams = {
  startPeriod: string;
  endPeriod: string;
  mode?: string;
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
