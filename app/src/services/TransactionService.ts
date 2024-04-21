import { TransactionRepository } from '@/repositories/TransactionRepository';
import { Transaction } from '@/types/Transaction';

export class TransactionService {
  private transactionRepository: TransactionRepository;
  constructor() {
    this.transactionRepository = new TransactionRepository('transactions');
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    await this.transactionRepository.add(transaction);
  }
}
