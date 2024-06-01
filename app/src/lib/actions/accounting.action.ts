import {
  AccountingPeriod,
  AddAccountingPeriodRequest,
  UserAccountingPeriod,
} from '@/types/AccountingPeriod';
import { add, findAll } from '@/lib/repositories/accountingPeriod.repository';
import { getErrorMessage } from '@/utils/error.utils';
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  Duration,
  isBefore,
} from 'date-fns';
import { add as addDate } from 'date-fns/add';

const addAccountingPeriod = async (
  addAccountingPeriodRequest: AddAccountingPeriodRequest
): Promise<UserAccountingPeriod> => {
  const { name, description, startPeriod, endPeriod } =
    addAccountingPeriodRequest.data;
  const addedAccountingPeriod = await add({
    id: '',
    name: name,
    description: description,
    startPeriod: new Date(startPeriod),
    endPeriod: new Date(endPeriod),
  });
  return {
    ...addedAccountingPeriod,
  };
};

const getAccountingPeriods = async (): Promise<UserAccountingPeriod[]> => {
  try {
    const addedAccountingPeriod = await findAll();
    if (addedAccountingPeriod) {
      console.log(`Found ${addedAccountingPeriod.length} accounting periods`);
    }
    return addedAccountingPeriod;
  } catch (error) {
    console.log(`Error loading accounting periods. ${getErrorMessage(error)}`);
    throw error;
  }
};

const deriveTransactionPeriods = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): AccountingPeriod[] => {
  const diffInDays = differenceInCalendarDays(
    accountingEndPeriod,
    accountingStartPeriod
  );

  const periods: AccountingPeriod[] = [];
  const duration: Duration = {};

  let noOfDates = 0;
  if (diffInDays <= 7) {
    duration.days = 1;
    noOfDates = diffInDays;
  } else if (diffInDays > 7 && diffInDays <= 28) {
    duration.days = 7;
    noOfDates = differenceInCalendarWeeks(
      accountingEndPeriod,
      accountingStartPeriod
    );
  } else if (diffInDays > 28 && diffInDays <= 365) {
    duration.days = 28;
    noOfDates = differenceInCalendarMonths(
      accountingEndPeriod,
      accountingStartPeriod
    );
  } else {
    duration.days = 365;
    noOfDates = differenceInYears(accountingEndPeriod, accountingStartPeriod);
  }

  let currentDate = new Date(accountingStartPeriod);
  let nextDate = new Date(accountingStartPeriod);
  for (let i = 0; i < noOfDates; i++) {
    nextDate = addDate(nextDate, duration);
    const period: AccountingPeriod = {
      startPeriod: currentDate,
      endPeriod: nextDate,
    };
    periods.push(period);
    currentDate = nextDate;
  }
  if (isBefore(nextDate, accountingEndPeriod)) {
    periods.push({ startPeriod: nextDate, endPeriod: accountingEndPeriod });
  }

  return periods;
};

export { addAccountingPeriod, getAccountingPeriods, deriveTransactionPeriods };
