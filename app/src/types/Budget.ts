export type BudgetSummary = {
  startPeriod: string;
  endPeriod: string;
  inflow: number;
  outflow: number;
  difference: number;
};

export type BudgetConfiguration = {
  id: string;
  startPeriod: string;
  endPeriod: string;
  displayCurrency: string;
};
