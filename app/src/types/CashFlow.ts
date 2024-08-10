import {
  SerializableStatementPeriod,
  SerializableStatementPeriodSlot,
} from '@/types/StatementPeriod';
import { TransactionMode } from '@/types/Transaction';

namespace CashFlow {
  export type CashFlowType = 'income' | 'expense';
  export type CashFlowStatementType = 'Summary' | 'Income' | 'Expense';

  type Statement = {
    id: string;
    parentRef?: string;
    statementType: CashFlowStatementType;
  };

  export type CashFlow = {
    type: CashFlowType;
    total: number;
  };

  export type CashFlowStatement = Statement & {
    statementType: 'Summary';
    accountingPeriod: SerializableStatementPeriod;
    income: CashFlow;
    expense: CashFlow;
  };

  export type IncomeStatement = Statement & {
    statementType: 'Income';
    accountingPeriod: SerializableStatementPeriod;
    income: CashFlow;
  };

  export type ExpenseStatement = Statement & {
    statementType: 'Expense';
    accountingPeriod: SerializableStatementPeriod;
    expense: CashFlow;
  };

  export type CashFlowStatements = {
    [key: string]: CashFlowStatement | IncomeStatement | ExpenseStatement;
  };

  export type SetCashFlowRequest = {
    key: string;
    parentKey: string;
    transactionMode: TransactionMode;
    statementType: CashFlowStatementType;
    total: number;
  };

  export type CashFlowSummary = Statement & {
    startPeriod?: Date;
    endPeriod?: Date;
    inflow: number;
    outflow: number;
    difference: number;
    currency: string;
  };

  export type SerializableCashFlowSummary = Omit<
    CashFlowSummary,
    'startPeriod' | 'endPeriod'
  > &
    Statement & {
      startPeriod: string;
      endPeriod: string;
    };

  export type SerializableIncomeSummary = Statement &
    Omit<IncomeStatement, 'income' | 'accountingPeriod'> & {
      startPeriod: string;
      endPeriod: string;
      total: number;
    };

  export type SerializableExpenseSummary = Statement &
    Omit<ExpenseStatement, 'expense' | 'accountingPeriod'> & {
      startPeriod: string;
      endPeriod: string;
      total: number;
    };

  export type CashflowCalculationResult = {
    totalIncome: number;
    totalExpense: number;
    difference: number;
  };
  export type CashFlowInitialisationRequest = {
    statementPeriodSlots: SerializableStatementPeriodSlot[];
    statementType: CashFlow.CashFlowStatementType;
    parentSlotRef?: string;
  };
  export type GetTransactionRequest = {
    startPeriod: string;
    endPeriod: string;
    reset: boolean;
    parentNodeId: string;
    parentStatementSlotId: string;
  };

  export type SetCashFlowSummaryRequest = {
    parentStatementId: string;
    statementId: string;
    summaryIndex: number;
    updatedCashFlowSummary:
      | SerializableCashFlowSummary
      | SerializableIncomeSummary
      | SerializableExpenseSummary;
  };

  export type UpdateNodeSize = {
    id: string;
    width: number;
    height: number;
  };

  export type CategorisedCashflow = {
    category: string;
    amount: number;
  };
}

export default CashFlow;
