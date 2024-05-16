import { TransactionRepository } from '@/repositories/transaction-repository';
import {
  AddTransactionRequest,
  Transaction,
  TransactionDto,
} from '@/types/Transaction';
import { Option } from '@/types/Option';

export class TransactionService {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  async addTransaction(
    addTransactionRequest: AddTransactionRequest,
    option?: Option
  ): Promise<void> {
    try {
      const { transaction, hasAdditionalRules, rules } = addTransactionRequest;
      const transactionToAdd: Transaction = {
        ...transaction,
        date: new Date(transaction.date),
        budgetId: '',
      };
      await this.transactionRepository.add(transactionToAdd);
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
  ): Promise<Transaction[]> {
    const transactions = await this.transactionRepository.getTransactions(
      startPeriod,
      endPeriod
    );
    return transactions;
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
