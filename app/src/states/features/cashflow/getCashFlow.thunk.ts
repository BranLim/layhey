import { createAsyncThunk } from '@reduxjs/toolkit';
import CashFlow from '@/types/CashFlow';
import { FlowViewState } from '@/states/features/cashflow/flow.slice';
import { StatementPeriodSlot } from '@/types/AccountingPeriod';
import { toSerializableStatementPeriods } from '@/lib/mappers/accountingPeriod.mapper';
import { TransactionMode, TransactionResponse } from '@/types/Transaction';
import { getTransactions } from '@/states/features/cashflow/api/transactions.api';
import {
  CashFlowState,
  setCashFlow,
  setCashFlowStatementPeriods,
} from '@/states/features/cashflow/cashflow.slice';
import { getCashFlowStatementPeriods } from '@/lib/helpers/cashflow.helper';
import { getErrorMessage } from '@/utils/error.utils';

export const getCashFlows = createAsyncThunk<
  void,
  CashFlow.GetTransactionRequest,
  { state: { cashflow: CashFlowState; flow: FlowViewState } }
>(
  'cashflow/getCashFlow',
  async (request: CashFlow.GetTransactionRequest, { dispatch, getState }) => {
    const { startPeriod, endPeriod, reset, parentStatementSlotId } = request;

    console.log('Getting Cashflows');
    let currentState = getState();

    let parentRef = currentState.cashflow.overallCashFlowForPeriod.id;
    let statementPeriods: StatementPeriodSlot[] = [];
    if (reset) {
      statementPeriods = getCashFlowStatementPeriods(
        currentState.cashflow.overallCashFlowForPeriod.startPeriod,
        currentState.cashflow.overallCashFlowForPeriod.endPeriod
      );
    } else {
      parentRef = parentStatementSlotId;
      statementPeriods = getCashFlowStatementPeriods(startPeriod, endPeriod);
    }

    if (!statementPeriods || statementPeriods.length < 1) {
      return;
    }

    if (
      statementPeriods.every(
        (statement) =>
          !statement.key.includes('_income') &&
          !statement.key.includes('_expense')
      )
    ) {
      dispatch(
        setCashFlowStatementPeriods({
          statementPeriodSlots:
            toSerializableStatementPeriods(statementPeriods),
          parentSlotRef: parentRef,
          statementType: 'Summary',
        })
      );
    } else {
      statementPeriods.forEach((statement) => {
        dispatch(
          setCashFlowStatementPeriods({
            statementPeriodSlots: toSerializableStatementPeriods([statement]),
            parentSlotRef: parentRef,
            statementType: statement.key.includes('_income')
              ? 'Income'
              : 'Expense',
          })
        );
      });
    }

    const transactions: TransactionResponse[] = await getTransactions(
      startPeriod,
      endPeriod
    );

    statementPeriods.forEach((statementPeriod) => {
      const transactionsForPeriod = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        return (
          transactionDate > statementPeriod.startPeriod &&
          transactionDate <= statementPeriod.endPeriod
        );
      });

      if (!transactionsForPeriod || transactionsForPeriod.length < 1) {
        return;
      }

      const incomeCashFlowRequest: CashFlow.SetCashFlowRequest = {
        key: statementPeriod.key,
        parentKey: parentRef,
        transactionMode: TransactionMode.Income,
        total: 0,
        statementType: 'Summary',
      };
      const expenseCashFlowRequest: CashFlow.SetCashFlowRequest = {
        key: statementPeriod.key,
        parentKey: parentRef,
        transactionMode: TransactionMode.Expense,
        total: 0,
        statementType: 'Summary',
      };

      if (statementPeriod.key.includes('_income')) {
        incomeCashFlowRequest.statementType = 'Income';
      } else if (statementPeriod.key.includes('_expense')) {
        expenseCashFlowRequest.statementType = 'Expense';
      }

      transactionsForPeriod.forEach((transaction) => {
        switch (transaction.mode) {
          case 'Income':
            incomeCashFlowRequest.total =
              incomeCashFlowRequest.total + transaction.amount;
            break;
          case 'Expense':
            expenseCashFlowRequest.total =
              expenseCashFlowRequest.total + transaction.amount;
            break;
        }
      });

      try {
        if (
          (!statementPeriod.key.includes('_income') &&
            !statementPeriod.key.includes('_expense')) ||
          statementPeriod.key.includes('_income')
        ) {
          dispatch(setCashFlow(incomeCashFlowRequest));
        }
        if (
          (!statementPeriod.key.includes('_income') &&
            !statementPeriod.key.includes('_expense')) ||
          statementPeriod.key.includes('_expense')
        ) {
          dispatch(setCashFlow(expenseCashFlowRequest));
        }
      } catch (error) {
        console.log('GetCashFlow: Error setting cash flows.');
        console.log(`GetCashFlow: ${getErrorMessage(error)}`);
      }
    });
  }
);
