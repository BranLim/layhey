export type Transaction = {
  category: string;
  amount: number;
  currency: string;
  date: Date;
  budgetId: string;
};

export type TransactionDto = Omit<Transaction, 'budgetId'>;
