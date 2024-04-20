import { Transaction } from '@/server/domain/transaction/Transaction';
import { MongoClient } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export class TransactionRepository {
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  async add(transaction: Transaction) {
    const client: MongoClient = await clientPromise;
    const collection = client.db().collection(this.collection);
    await collection.insertOne(transaction);
  }
}
