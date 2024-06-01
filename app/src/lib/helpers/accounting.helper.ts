import {
  Accounting_Period_Days_In_Month,
  Accounting_Period_Days_In_Week,
  Accounting_Period_Days_In_Year,
  AccountingPeriod,
  AccountingPeriodSlot,
} from '@/types/AccountingPeriod';
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInYears,
  Duration,
  isBefore,
  parse,
} from 'date-fns';
import { add as addDate } from 'date-fns/add';
import { toFormattedDate } from '@/utils/date.utils';

const computeAccountingPeriodSlots = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): AccountingPeriodSlot[] => {
  const diffInDays = differenceInCalendarDays(
    accountingEndPeriod,
    accountingStartPeriod
  );

  const periods: AccountingPeriodSlot[] = [];
  const duration: Duration = {};

  let noOfDates = 0;
  if (diffInDays <= Accounting_Period_Days_In_Week) {
    duration.days = 1;
    noOfDates = diffInDays;
  } else if (
    diffInDays > Accounting_Period_Days_In_Week &&
    diffInDays <= Accounting_Period_Days_In_Month
  ) {
    duration.days = Accounting_Period_Days_In_Week;
    noOfDates = differenceInCalendarWeeks(
      accountingEndPeriod,
      accountingStartPeriod
    );
  } else if (
    diffInDays > Accounting_Period_Days_In_Month &&
    diffInDays <= Accounting_Period_Days_In_Year
  ) {
    duration.days = Accounting_Period_Days_In_Month;
    noOfDates = differenceInCalendarMonths(
      accountingEndPeriod,
      accountingStartPeriod
    );
  } else {
    duration.days = Accounting_Period_Days_In_Year;
    noOfDates = differenceInYears(accountingEndPeriod, accountingStartPeriod);
  }

  let currentDate = new Date(accountingStartPeriod);
  let nextDate = new Date(accountingStartPeriod);
  for (let i = 0; i < noOfDates; i++) {
    nextDate = addDate(nextDate, duration);
    const period: AccountingPeriodSlot = {
      startPeriod: currentDate,
      endPeriod: nextDate,
      key: `${toFormattedDate(currentDate, 'yyyyMMdd')}_${toFormattedDate(nextDate, 'yyyyMMdd')}`,
    };
    periods.push(period);
    currentDate = nextDate;
  }
  if (isBefore(nextDate, accountingEndPeriod)) {
    periods.push({
      startPeriod: nextDate,
      endPeriod: accountingEndPeriod,
      key: `${toFormattedDate(nextDate, 'yyyyMMdd')}_${toFormattedDate(accountingEndPeriod, 'yyyyMMdd')}`,
    });
  }

  return periods;
};

const getAccountingPeriodSlot = (
  accountingPeriods: AccountingPeriodSlot[],
  transactionDate: Date
): AccountingPeriodSlot | undefined => {
  return accountingPeriods?.find(
    (value) =>
      value.startPeriod <= transactionDate && value.endPeriod >= transactionDate
  );
};

const getAccountingPeriodFromSlotKey = (
  slotKey: string
): AccountingPeriod | undefined => {
  const dates = slotKey.split('_');
  if (!dates || dates.length < 2) {
    return undefined;
  }
  const startPeriod = parse(dates[0], 'yyyyMMdd', new Date());
  const endPeriod = parse(dates[1], 'yyyyMMdd', new Date());
  return { startPeriod, endPeriod } as AccountingPeriod;
};

export {
  computeAccountingPeriodSlots,
  getAccountingPeriodSlot,
  getAccountingPeriodFromSlotKey,
};
