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
    try {
      await this.transactionRepository.add({ ...transaction, budgetId: '' });
    } catch (error) {
      throw error;
    }
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
    return transactions.map((transaction) => {
      return {
        id: transaction.id,
        category: transaction.category,
        transactionType: transaction.transactionType,
        amount: transaction.amount,
        currency: transaction.currency,
        date: transaction.date,
      } as TransactionDto;
    });
  }

  async getTransaction(id: string): Promise<TransactionDto> {
    const transaction = await this.transactionRepository.getTransaction(id);
    return {
      id: transaction.id,
      category: transaction.category,
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      currency: transaction.currency,
      date: transaction.date,
    } as TransactionDto;
  }
}
