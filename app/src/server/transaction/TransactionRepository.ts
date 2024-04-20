import { Transaction } from '@/server/transaction/Transaction';

interface TransactionRepository {
  add(transaction: Transaction): Promise<void>;
}
