export type BudgetSummary = {
  startPeriod?: Date;
  endPeriod?: Date;
  inflow: number;
  outflow: number;
  difference: number;
};

export type BudgetConfiguration = {
  id: string;
  startPeriod?: Date;
  endPeriod?: Date;
  displayCurrency: string;
};
