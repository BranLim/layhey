import {TransactionRepository} from '@/repositories/transaction-repository';
import {Transaction} from '@/types/Transaction';
import {Option} from '@/types/Option';

export class TransactionService {
    private transactionRepository: TransactionRepository;

    constructor() {
        this.transactionRepository = new TransactionRepository('transactions');
    }

    async addTransaction(
        transaction: Transaction,
        option?: Option
    ): Promise<void> {
        await this.transactionRepository.add(transaction);
    }

    async getTransactions(startPeriod: string, endPeriod: string): Promise<Transaction[]> {
        const transactions = await this.transactionRepository.getTransactions(startPeriod, endPeriod);
        return transactions
    }
}
