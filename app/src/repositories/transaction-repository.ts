import { Transaction } from '@/types/Transaction';
import { connectMongo } from '@/lib/mongodb';
import TransactionModel from '@/models/transaction-model';

export class TransactionRepository {
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  async add(transaction: Transaction) {
    const client = await connectMongo();

    const newTransaction = new TransactionModel({
      ...transaction,
    });
    await newTransaction.save();
  }

  async getTransactions(
    startPeriod: string,
    endPeriod: string
  ): Promise<Transaction[]> {
    const client = await connectMongo();

    const foundTransactions = await TransactionModel.find({});
    return [];
    //return transactions;
  }
}
