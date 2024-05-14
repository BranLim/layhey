export enum TransactionCategory {
  Income = 'Income',
  Expense = 'Expense',
}

export enum TransactionSource {
  Salary = 'Salary',
  Dividend = 'Dividend',
  Cashback = 'Cashback',
  GovernmentAssistance = 'Government Assistance',
  CreditCard = 'Credit Card',
  Cash = 'Cash',
  DirectDebit = 'Direct Debit',
}

export type Transaction = {
  id: string;
  transactionSource: TransactionSource;
  transactionType: string;
  category: TransactionCategory;
  amount: number;
  currency: string;
  date: Date;
  budgetId: string;
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

export type TransactionDto = Omit<Transaction, 'budgetId'>;
