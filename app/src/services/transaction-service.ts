import { TransactionRepository } from '@/repositories/transaction-repository';
import {
  AddTransactionRequest,
  Transaction,
  TransactionDto,
  TransactionResponse,
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
  ): Promise<Transaction[]> {
    try {
      const transactionsAdded: Transaction[] = [];

      const { transaction, hasAdvancedSetting, advancedSetting } =
        addTransactionRequest;

      if (hasAdvancedSetting) {
      } else {
        const transactionToAdd: Transaction = {
          ...transaction,
          date: new Date(transaction.date),
        };
        const newTransaction =
          await this.transactionRepository.add(transactionToAdd);
        transactionsAdded.push(newTransaction);
      }

      return transactionsAdded;
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
