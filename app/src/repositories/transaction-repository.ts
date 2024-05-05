import { Transaction, TransactionDto } from '@/types/Transaction';
import { connectMongo } from '@/lib/mongodb';
import { TransactionModel } from '@/models/transaction-model';

export class TransactionRepository {
  constructor() {}

  async add(transaction: Transaction) {
    await connectMongo();

    const newTransaction = new TransactionModel({
      date: transaction.date,
      amount: transaction.amount,
      currency: transaction.currency,
      category: transaction.category,
      transactionType: transaction.transactionType,
      budget: undefined,
    });
    await newTransaction.save();
  }

  async getTransactions(
    startPeriod: string,
    endPeriod: string
  ): Promise<Transaction[]> {
    await connectMongo();

    const foundTransactions = await TransactionModel.find({
      date: {
        $gte: new Date(startPeriod),
        $lte: new Date(endPeriod),
      },
    });
    if (!foundTransactions) {
      return [] as Transaction[];
    }
    const transactions: Transaction[] = foundTransactions.map(
      (transaction) =>
        ({
          category: transaction.category,
          amount: transaction.amount,
          currency: transaction.currency,
          date: transaction.date,
          budgetId: transaction.budget?._id ?? '',
        }) as Transaction
    );
    return transactions;
  }

  async update(id: string, transaction: Transaction): Promise<Transaction> {
    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      id,
      {
        date: transaction.date,
        amount: transaction.amount,
        currency: transaction.currency,
        category: transaction.category,
        transactionType: transaction.transactionType,
        budget: undefined,
      },
      { new: true }
    );
    return updatedTransaction;
  }
}
