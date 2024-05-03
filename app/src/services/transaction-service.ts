import { TransactionRepository } from '@/repositories/transaction-repository';
import { TransactionDto } from '@/types/Transaction';
import { Option } from '@/types/Option';

export class TransactionService {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  async addTransaction(
    transaction: TransactionDto,
    option?: Option
  ): Promise<void> {
    await this.transactionRepository.add({ ...transaction, budgetId: '' });
  }

  async getTransactions(
    startPeriod: string,
    endPeriod: string
  ): Promise<TransactionDto[]> {
    const transactions = await this.transactionRepository.getTransactions(
      startPeriod,
      endPeriod
    );
    return transactions;
  }
}
