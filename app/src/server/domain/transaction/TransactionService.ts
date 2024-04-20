import { TransactionRepository } from '@/server/domain/transaction/TransactionRepository';
import { Transaction } from '@/server/domain/transaction/Transaction';

export class TransactionService {
  private transactionRepository: TransactionRepository;
  constructor() {
    this.transactionRepository = new TransactionRepository('transactions');
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    await this.transactionRepository.add(transaction);
  }
}
