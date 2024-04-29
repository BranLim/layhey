import {TransactionService} from "@/services/transaction-service";

export const GET = async ()=> {
    var transactionService = new TransactionService();
    const transactions = await transactionService.getTransactions("","");
    return transactions;
}