import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AddTransactionRequest,
  TransactionResponse,
} from '@/types/Transaction';
import { FlowViewState } from '@/states/features/cashflow/flow.slice';
import { addTransactions } from '@/states/features/cashflow/api/transactions.api';
import { isTransactionDateWithin } from '@/utils/date.utils';
import {
  CashFlowState,
  setOverallCashFlow,
} from '@/states/features/cashflow/cashflow.slice';

export const addTransaction = createAsyncThunk<
  void,
  AddTransactionRequest,
  {
    state: {
      cashflow: CashFlowState;
      flow: FlowViewState;
    };
  }
>(
  'cashflow/addTransactions',
  async (
    newTransaction: AddTransactionRequest,
    { dispatch, getState }
  ): Promise<void> => {
    const transactions = await addTransactions(newTransaction);

    let currentState = getState();

    const budgetStartPeriod: string =
      currentState.cashflow.overallCashFlowForPeriod.startPeriod;
    const budgetEndPeriod: string =
      currentState.cashflow.overallCashFlowForPeriod.endPeriod;

    transactions?.forEach((transaction: TransactionResponse) => {
      if (
        !isTransactionDateWithin(
          new Date(transaction.date),
          new Date(budgetStartPeriod),
          new Date(budgetEndPeriod)
        )
      ) {
        return;
      }

      currentState = getState();
      let totalExpense = currentState.cashflow.overallCashFlowForPeriod.outflow;
      let totalIncome = currentState.cashflow.overallCashFlowForPeriod.inflow;
      switch (transaction.mode) {
        case 'Income':
          totalIncome += transaction.amount;
          break;
        case 'Expense':
          totalExpense += transaction.amount;
          break;
      }
      dispatch(
        setOverallCashFlow({
          totalExpense: totalExpense,
          totalIncome: totalIncome,
          difference: totalIncome - totalExpense,
        })
      );
    });
  }
);
