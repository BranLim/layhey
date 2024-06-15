import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AddTransactionRequest,
  TransactionMode,
  TransactionResponse,
} from '@/types/Transaction';
import {
  FlowViewState,
  showCashFlows,
} from '@/states/features/cashflow/flow.slice';
import { addTransactions } from '@/states/features/cashflow/api/transactions.api';
import { isTransactionDateWithin } from '@/utils/date.utils';
import {
  CashFlowState,
  setCashFlow,
  setOverallCashFlow,
  updateCashFlowSummaryGraphNode,
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
        !isTransactionDateWithin(
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
          !isTransactionDateWithin(
            transactionDate,
            cashFlowStartDate,
            cashFlowEndDate
          )
        ) {
          return;
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
                  transactionMode: TransactionMode.Income,
                  total: totalIncome,
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
                  transactionMode: TransactionMode.Expense,
                  total: totalExpense,
                } as CashFlow.SetCashFlowRequest)
              );
            }
            break;
        }

        currentState = getState();
        dispatch(
          updateCashFlowSummaryGraphNode({
            parentStatementId: cashFlowForPeriod.parentRef ?? '',
            statementId: cashFlowForPeriod.id,
            cashFlowStatementSlotKey: period,
          })
        );

        currentState = getState();
        const nodes = [...currentState.flow.nodes];
        const foundNode =
          nodes.find(
            (node) => node.data && node.data.id === cashFlowForPeriod.parentRef
          )?.id ?? '';
        dispatch(
          showCashFlows({
            targetNodeId: foundNode,
            cashFlowSummaries: [
              ...currentState.cashflow.cashFlowSummaries[foundNode],
            ],
            updateMode: 'Append',
          })
        );
      }
    });
  }
);
