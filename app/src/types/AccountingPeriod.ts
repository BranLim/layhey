export type AccountingPeriod = {
  startPeriod?: Date;
  endPeriod?: Date;
};

export type UserAccountingPeriod = AccountingPeriod & {
  id?: string;
  name: string;
  description: string;
};
export type UserAccountingPeriodRequest = Omit<
  UserAccountingPeriod,
  'startPeriod' | 'endPeriod'
> & {
  startPeriod: string;
  endPeriod: string;
};

export type UserAccountingPeriodResponse = UserAccountingPeriod;

export type AddAccountingPeriodRequest = {
  data: UserAccountingPeriodRequest;
};
export type UpdateAccountingPeriodRequest = AddAccountingPeriodRequest;

export type GetUserAccountingPeriodsResponse = {
  accountingPeriods: UserAccountingPeriod[];
};
