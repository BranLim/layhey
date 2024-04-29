import { Transaction } from '@/types/Transaction';
import { transactionSchema } from '@/models/transaction-model';
import { connectMongo } from '@/lib/mongodb';

export class TransactionRepository {
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  async add(transaction: Transaction) {
    const client = await connectMongo();
    const TransactionModel = client.model(
      'Transaction',
      transactionSchema,
      this.collection
    );
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
    const TransactionModel = client.model(
      'Transaction',
      transactionSchema,
      this.collection
    );
    const transactions = await TransactionModel.find<Transaction>({});
    return transactions;
  }
}
