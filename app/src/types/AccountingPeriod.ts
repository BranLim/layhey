export type AccountingPeriod = {
  startPeriod?: Date;
  endPeriod?: Date;
};
export type SerializableAccountingPeriod = {
  startPeriod: string;
  endPeriod: string;
};

export type AccountingPeriodIdentifier = {
  id?: string;
  name: string;
  description: string;
};

export type UserAccountingPeriod = AccountingPeriod &
  AccountingPeriodIdentifier;

export type SerializableUserAccountingPeriod = AccountingPeriodIdentifier &
  SerializableAccountingPeriod;

export type UserAccountingPeriodRequest = SerializableUserAccountingPeriod;

export type UserAccountingPeriodResponse = SerializableUserAccountingPeriod;

export type AddAccountingPeriodRequest = {
  data: UserAccountingPeriodRequest;
};
export type UpdateAccountingPeriodRequest = AddAccountingPeriodRequest;

export type GetUserAccountingPeriodsResponse = {
  accountingPeriods: UserAccountingPeriodResponse[];
};
