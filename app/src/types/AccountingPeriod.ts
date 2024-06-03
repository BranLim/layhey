export const Accounting_Period_Days_In_Week = 7;
export const Accounting_Period_Days_In_Month = 31;
export const Accounting_Period_Days_In_Year = 366;

export type AccountingPeriod = {
  startPeriod: Date;
  endPeriod: Date;
};

export type AccountingPeriodSlot = AccountingPeriod & {
  key: string;
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
