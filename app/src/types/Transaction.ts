import { Rule } from '@/types/Rule';

export enum TransactionCategory {
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

export type Transaction = {
  id: string;
  transactionSource: TransactionSource;
  transactionType: string;
  category: TransactionCategory;
  amount: number;
  currency: string;
  date: string;
  budgetId: string;
};

export type TransactionDto = Omit<Transaction, 'budgetId'>;

export type AddTransactionRequest = {
  transaction: TransactionDto;
  hasAdditionalRules?: boolean;
  rules: Rule[];
};

export const categoryFromValue = (
  value: string
): TransactionCategory | never => {
  const transactionCategory = (
    Object.keys(TransactionCategory) as (keyof typeof TransactionCategory)[]
  ).find((key) => TransactionCategory[key] === value) as TransactionCategory;
  if (!transactionCategory) {
    throw new Error('unknown transaction category');
  }
  return transactionCategory;
};

export const transactionTypeFromValue = (
  value: string
): TransactionSource | never => {
  const transactionSources = Object.values(TransactionSource);

  if (transactionSources.includes(value as TransactionSource)) {
    return value as TransactionSource;
  }
  throw new Error(`Invalid transaction type: ${value}`);
};
