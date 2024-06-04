export type CashFlowType = 'income' | 'expense';

export type CashFlow = {
  type: CashFlowType;
  period: string;
  total: number;
};

export type CashFlowSummary = {
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
> & {
  startPeriod: string;
  endPeriod: string;
};

export type CashFlowNodeData = SerializableCashFlowSummary & {
  rootNode?: boolean;
  isExpanded?: boolean;
};
