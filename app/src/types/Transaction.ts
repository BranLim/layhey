export enum TransactionCategory {
  Income = 'Income',
  Expense = 'Expense',
}

export enum IncomeType {
  Salary = 'Salary',
  Dividend = 'Dividend',
  Cashback = 'Cashback',
  GovernmentAssistance = 'Government Assistance',
}

export enum ExpenseType {
  CreditCard = 'Credit Card',
  Cash = 'Cash',
  DirectDebit = 'Direct Debit',
}

export type TransactionType = IncomeType | ExpenseType;

export type Transaction = {
  id: string;
  transactionType: TransactionType;
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
): TransactionType | never => {
  const incomeValues = Object.values(IncomeType);
  const expenseValues = Object.values(ExpenseType);

  if (incomeValues.includes(value as IncomeType)) {
    return value as IncomeType;
  }
  if (expenseValues.includes(value as ExpenseType)) {
    return value as ExpenseType;
  }
  throw new Error(`Invalid transaction type: ${value}`);
};

export type TransactionDto = Omit<Transaction, 'budgetId'>;
