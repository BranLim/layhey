import { TransactionRepository } from '@/repositories/transaction-repository';
import { Transaction, TransactionDto } from '@/types/Transaction';
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

  async updateTransaction(
    id: string,
    transaction: TransactionDto,
    option?: Option
  ): Promise<Transaction> {
    try {
      const updatedTransaction = await this.transactionRepository.update(id, {
        ...transaction,
        budgetId: '',
      });
      return updatedTransaction;
    } catch (error) {
      throw error;
    }
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
