import { createAsyncThunk } from '@reduxjs/toolkit';
import CashFlow from '@/types/CashFlow';
import { FlowViewState } from '@/states/features/cashflow/flow.slice';
import {
  TransactionMode,
  TransactionQueryParams,
  TransactionResponse,
} from '@/types/Transaction';
import { getTransactionsApi } from '@/states/features/cashflow/api/transactions.api';
import {
  CashFlowState,
  setOverallCashFlow,
} from '@/states/features/cashflow/cashflow.slice';

export const getOverallCashFlowSummary = createAsyncThunk<
  void,
  CashFlow.GetTransactionRequest,
  {
    state: {
      cashflow: CashFlowState;
      flow: FlowViewState;
    };
  }
>(
  'cashflow/getOverallCashFlowSummary',
  async (
    request: CashFlow.GetTransactionRequest,
    { dispatch }
  ): Promise<void> => {
    const { startPeriod, endPeriod } = request;

    const transactionSearchParams: TransactionQueryParams = {
      startPeriod,
      endPeriod,
    };

    const transactions: TransactionResponse[] = await getTransactionsApi(
      transactionSearchParams
    );

    let totalIncome = 0;
    let totalExpense = 0;
    transactions?.forEach((transaction) => {
      switch (transaction.mode) {
        case TransactionMode.Income:
          totalIncome += transaction.amount;
          break;
        case TransactionMode.Expense:
          totalExpense += transaction.amount;
          break;
      }
    });

    dispatch(
      setOverallCashFlow({
        totalExpense: totalExpense,
        totalIncome: totalIncome,
        difference: totalIncome - totalExpense,
      } as CashFlow.CashflowCalculationResult)
    );
  }
);
