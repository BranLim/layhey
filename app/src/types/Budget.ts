export type BudgetTransaction = {
  type: string;
  period: string;
  total: number;
};

export type BudgetSummary = {
  startPeriod?: Date;
  endPeriod?: Date;
  inflow: number;
  outflow: number;
  difference: number;
  currency: string;
};

export type BudgetSummaryState = Omit<
  BudgetSummary,
  'startPeriod' | 'endPeriod'
> & {
  startPeriod: string;
  endPeriod: string;
};

export type BudgetConfiguration = {
  id: string;
  startPeriod?: Date;
  endPeriod?: Date;
  displayCurrency: string;
};
