export type AccountingPeriod = {
  startPeriod?: Date;
  endPeriod?: Date;
};

export type CashFlow = {
  type: string;
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

export type CashFlowSummaryState = Omit<
  CashFlowSummary,
  'startPeriod' | 'endPeriod'
> & {
  startPeriod: string;
  endPeriod: string;
};

export type CashFlowNodes = {
  nodes: any[];
  edges: any[];
};
