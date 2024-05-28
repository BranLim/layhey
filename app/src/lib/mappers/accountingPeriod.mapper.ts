import { AccountingPeriodDocument } from '@/lib/models/accountingPeriod.model';
import {
  GetUserAccountingPeriodsResponse,
  UserAccountingPeriod,
  UserAccountingPeriodResponse,
} from '@/types/AccountingPeriod';

const toUserAccountingPeriod = (
  accountingPeriodDocument: AccountingPeriodDocument
): UserAccountingPeriod => {
  return {
    id: accountingPeriodDocument._id,
    name: accountingPeriodDocument.name,
    description: accountingPeriodDocument.description,
    startPeriod: accountingPeriodDocument.startPeriod,
    endPeriod: accountingPeriodDocument.endPeriod,
  } as UserAccountingPeriod;
};

const toUserAccountingPeriodResponse = (
  userAccountingPeriod: UserAccountingPeriod
) => {
  return {
    id: userAccountingPeriod.id,
    name: userAccountingPeriod.name,
    description: userAccountingPeriod.description,
    startPeriod: userAccountingPeriod.startPeriod?.toISOString(),
    endPeriod: userAccountingPeriod.endPeriod?.toISOString(),
  } as UserAccountingPeriodResponse;
};

const toGetUserAccountingPeriodsResponse = (
  accountingPeriods: UserAccountingPeriod[]
) => {
  return {
    accountingPeriods: accountingPeriods.map((userAccountPeriod) => {
      return {
        id: userAccountPeriod.id,
        name: userAccountPeriod.name,
        description: userAccountPeriod.description,
        startPeriod: userAccountPeriod.startPeriod?.toISOString(),
        endPeriod: userAccountPeriod.endPeriod?.toISOString(),
      } as UserAccountingPeriodResponse;
    }),
  } as GetUserAccountingPeriodsResponse;
};

export {
  toUserAccountingPeriod,
  toUserAccountingPeriodResponse,
  toGetUserAccountingPeriodsResponse,
};
