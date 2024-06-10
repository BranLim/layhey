import {
  SerializableAccountingPeriod,
  SerializableStatementPeriodSlot,
} from '@/types/AccountingPeriod';
import { TransactionMode } from '@/types/Transaction';

namespace CashFlow {
  export type CashFlowType = 'income' | 'expense';
  export type CashFlowStatementType = 'Summary' | 'Income' | 'Expense';
  export type GraphUpdateMode = 'Reset' | 'InPlace' | 'Append';

  export type CashFlowStatements = {
    [key: string]: CashFlowStatement;
  };

  type Statement = {
    id: string;
    parentRef?: string;
    statementType: CashFlowStatementType;
  };

  export type CashFlowStatement = Statement & {
    accountingPeriod: SerializableAccountingPeriod;
    income: CashFlow;
    expense: CashFlow;
  };

  export type IncomeStatement = Statement & {
    statementType: 'Income';
    accountingPeriod: SerializableAccountingPeriod;
    income: CashFlow;
  };

  export type SetCashFlowRequest = {
    key: string;
    type: TransactionMode;
    total: number;
  };

  export type ExpenseStatement = Statement & {
    statementType: 'Expense';
    accountingPeriod: SerializableAccountingPeriod;
    expense: CashFlow;
  };

  export type CashFlow = {
    type: CashFlowType;
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

  export type CashFlowNodeData = SerializableCashFlowSummary & {
    rootNode?: boolean;
    isExpanded?: boolean;
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
    append: boolean;
  };
  export type GetTransactionRequest = {
    startPeriod: string;
    endPeriod: string;
    append: boolean;
    parentNodeId: string;
    parentStatementSlotId: string;
  };

  export type UpdateCashFlowSummaryGraphNodeRequest = {
    parentStatementId: string;
    statementId: string;
    cashFlowStatementSlotKey: string;
  };
}

export default CashFlow;
