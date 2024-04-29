import { MongoClient } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Transaction } from '@/types/Transaction';

export class TransactionRepository {
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  async add(transaction: Transaction) {
    const client: MongoClient = await clientPromise;
    const collection = client.db().collection<Transaction>(this.collection);
    await collection.insertOne(transaction);
  }

  async getTransactions(
    startPeriod: string,
    endPeriod: string
  ): Promise<Transaction[]> {
    const client: MongoClient = await clientPromise;
    const collection = client.db().collection<Transaction>(this.collection);
    const transactions = await collection.find().toArray();
    return transactions;
  }
}
