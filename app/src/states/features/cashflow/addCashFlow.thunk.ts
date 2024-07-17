import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AddTransactionRequest,
  TransactionMode,
  TransactionResponse,
} from '@/types/Transaction';
import { FlowViewState } from '@/states/features/cashflow/flow.slice';
import { addTransactions } from '@/states/features/cashflow/api/transactions.api';
import { isDateWithin } from '@/utils/date.utils';
import {
  CashFlowState,
  setCashFlow,
  setOverallCashFlow,
} from '@/states/features/cashflow/cashflow.slice';
import CashFlow from '@/types/CashFlow';
import IncomeStatement = CashFlow.IncomeStatement;
import CashFlowStatement = CashFlow.CashFlowStatement;
import ExpenseStatement = CashFlow.ExpenseStatement;

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
      const transactionDate = new Date(transaction.date);
      if (
        !isDateWithin(
          transactionDate,
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

      currentState = getState();

      for (const period in currentState.cashflow.cashFlows) {
        const cashFlowForPeriod = currentState.cashflow.cashFlows[period];
        const cashFlowStartDate = new Date(
          cashFlowForPeriod.accountingPeriod.startPeriod
        );
        const cashFlowEndDate = new Date(
          cashFlowForPeriod.accountingPeriod.endPeriod
        );

        if (
          !isDateWithin(transactionDate, cashFlowStartDate, cashFlowEndDate)
        ) {
          continue;
        }

        switch (transaction.mode) {
          case TransactionMode.Income:
            console.log('Updating income');
            if (
              period.includes('_income') ||
              cashFlowForPeriod.statementType === 'Summary'
            ) {
              let totalIncome = transaction.amount;
              totalIncome += period.includes('_income')
                ? (cashFlowForPeriod as IncomeStatement).income.total
                : (cashFlowForPeriod as CashFlowStatement).income.total;

              dispatch(
                setCashFlow({
                  key: period,
                  parentKey: cashFlowForPeriod.parentRef,
                  transactionMode: TransactionMode.Income,
                  total: totalIncome,
                  statementType: 'Summary',
                } as CashFlow.SetCashFlowRequest)
              );
            }
            break;
          case TransactionMode.Expense:
            console.log('Updating expense');
            if (
              period.includes('_expense') ||
              cashFlowForPeriod.statementType === 'Summary'
            ) {
              let totalExpense = transaction.amount;
              totalExpense += period.includes('_income')
                ? (cashFlowForPeriod as ExpenseStatement).expense.total
                : (cashFlowForPeriod as CashFlowStatement).expense.total;

              dispatch(
                setCashFlow({
                  key: period,
                  parentKey: cashFlowForPeriod.parentRef,
                  transactionMode: TransactionMode.Expense,
                  total: totalExpense,
                  statementType: 'Summary',
                } as CashFlow.SetCashFlowRequest)
              );
            }
            break;
        }
      }
    });
  }
);
