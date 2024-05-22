export type AccountingPeriod = {
  startPeriod?: Date;
  endPeriod?: Date;
};

export type UserAccountingPeriod = AccountingPeriod & {
  id?: string;
  name: string;
  description: string;
};
export type UserAccountingPeriodRequest = UserAccountingPeriod;

export type AddAccountingPeriodRequest = {
  data: UserAccountingPeriodRequest;
};
export type UpdateAccountingPeriodRequest = AddAccountingPeriodRequest;

export type GetUserAccountingPeriodResponse = {
  accountingPeriods: UserAccountingPeriod[];
};
