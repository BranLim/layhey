import { SerializableAccountingPeriod } from '@/types/AccountingPeriod';

export type CashFlowType = 'income' | 'expense';
export type CashFlowStatementType = 'Summary' | 'Income' | 'Expense';

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
  accountingPeriod: SerializableAccountingPeriod;
  income: CashFlow;
};

export type ExpenseStatement = Statement & {
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
