import { AccountingPeriodDocument } from '@/lib/models/accountingPeriod.model';
import {
  GetUserAccountingPeriodsResponse,
  SerializableStatementPeriodSlot,
  StatementPeriodSlot,
  UserStatementPeriod,
  UserStatementPeriodResponse,
} from '@/types/StatementPeriod';

const toUserAccountingPeriod = (
  accountingPeriodDocument: AccountingPeriodDocument
): UserStatementPeriod => {
  return {
    id: accountingPeriodDocument._id,
    name: accountingPeriodDocument.name,
    description: accountingPeriodDocument.description,
    startPeriod: accountingPeriodDocument.startPeriod,
    endPeriod: accountingPeriodDocument.endPeriod,
  } as UserStatementPeriod;
};

const toGetUserAccountingPeriodsResponse = (
  accountingPeriods: UserStatementPeriod[]
) => {
  return {
    accountingPeriods: accountingPeriods.map((userAccountPeriod) => {
      return {
        id: userAccountPeriod.id,
        name: userAccountPeriod.name,
        description: userAccountPeriod.description,
        startPeriod: userAccountPeriod.startPeriod?.toISOString(),
        endPeriod: userAccountPeriod.endPeriod?.toISOString(),
      } as UserStatementPeriodResponse;
    }),
  } as GetUserAccountingPeriodsResponse;
};

const toSerializableStatementPeriods = (
  statementPeriods: StatementPeriodSlot[]
): SerializableStatementPeriodSlot[] => {
  return statementPeriods.map((slot) => {
    return {
      ...slot,
      startPeriod: slot.startPeriod.toISOString(),
      endPeriod: slot.endPeriod.toISOString(),
    } as SerializableStatementPeriodSlot;
  });
};

export {
  toUserAccountingPeriod,
  toGetUserAccountingPeriodsResponse,
  toSerializableStatementPeriods,
};
