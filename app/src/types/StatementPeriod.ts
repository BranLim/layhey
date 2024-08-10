export const Accounting_Period_One_Day_In_Milliseconds = 1000 * 60 * 60 * 24;
export const Accounting_Period_Days_In_Week = 7;
export const Accounting_Period_Days_In_Month = 31;
export const Accounting_Period_Days_In_Year = 366;

export type StatementPeriod = {
  startPeriod: Date;
  endPeriod: Date;
};

export type StatementPeriodSlot = StatementPeriod & {
  key: string;
};

export type SerializableStatementPeriod = {
  startPeriod: string;
  endPeriod: string;
};

export type SerializableStatementPeriodSlot = SerializableStatementPeriod & {
  key: string;
};

export type StatementPeriodIdentifier = {
  id?: string;
  name: string;
  description: string;
};

export type UserStatementPeriod = StatementPeriod & StatementPeriodIdentifier;

export type SerializableUserStatementPeriod = StatementPeriodIdentifier &
  SerializableStatementPeriod;

export type UserStatementPeriodResponse = SerializableUserStatementPeriod;

export type AddStatementPeriodRequest = {
  data: SerializableUserStatementPeriod;
};

export type AddStatementPeriodResponse = SerializableUserStatementPeriod;

export type UpdateAccountingPeriodRequest = AddStatementPeriodRequest;

export type GetUserAccountingPeriodsResponse = {
  statementPeriods: SerializableUserStatementPeriod[];
};
