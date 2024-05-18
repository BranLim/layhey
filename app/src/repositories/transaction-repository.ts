import { Transaction } from '@/types/Transaction';
import { connectMongo } from '@/database/mongodb';
import {
  TransactionDocument,
  TransactionModel,
} from '@/models/transaction-model';

export class TransactionRepository {
  constructor() {}

  async add(transaction: Transaction) {
    await connectMongo();

    const newTransaction = new TransactionModel({
      date: transaction.date,
      amount: transaction.amount,
      currency: transaction.currency,
      category: transaction.category,
      transactionSource: transaction.transactionSource,
      transactionType: transaction.transactionType,
      budget: undefined,
    });
    await newTransaction.save();
  }

  async update(id: string, transaction: Transaction): Promise<Transaction> {
    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      id,
      {
        date: transaction.date,
        amount: transaction.amount,
        currency: transaction.currency,
        category: transaction.category,
        transactionSource: transaction.transactionSource,
        transactionType: transaction.transactionType,
        budget: undefined,
      },
      { new: true }
    );
    return updatedTransaction;
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
    return foundTransactions.map(
      (transaction: TransactionDocument) =>
        ({
          id: transaction._id,
          category: transaction.category,
          transactionSource: transaction.transactionSource,
          amount: transaction.amount,
          currency: transaction.currency,
          date: transaction.date,
          budgetId: '',
        }) as Transaction
    );
  }

  async getTransaction(id: string): Promise<Transaction> {
    await connectMongo();
    const foundTransaction = await TransactionModel.findById(id);
    return {
      id: foundTransaction._id,
      category: foundTransaction.category,
      transactionSource: foundTransaction.transactionSource,
      amount: foundTransaction.amount,
      currency: foundTransaction.currency,

      date: foundTransaction.date,
      budgetId: foundTransaction.budget?._id ?? '',
    } as Transaction;
  }
}
