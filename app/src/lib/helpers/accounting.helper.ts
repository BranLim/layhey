import {
  Accounting_Period_Days_In_Month,
  Accounting_Period_Days_In_Week,
  Accounting_Period_Days_In_Year,
  AccountingPeriod,
  AccountingPeriodSlot,
} from '@/types/AccountingPeriod';
import {
  addDays,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInYears,
  Duration,
  isBefore,
  isDate,
  isLastDayOfMonth,
  isSunday,
  parse,
  startOfISOWeek,
  startOfWeek,
} from 'date-fns';
import { add as addDate } from 'date-fns/add';
import { toFormattedDate } from '@/utils/date.utils';

const computeAccountingPeriodSlots = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): AccountingPeriodSlot[] => {
  if (!isDate(accountingStartPeriod) || !isDate(accountingEndPeriod)) {
    throw new Error(
      'accountingStartPeriod or accountingEndPeriod must be date type'
    );
  }

  const diffInDays =
    differenceInCalendarDays(accountingEndPeriod, accountingStartPeriod) + 1;

  const periods: AccountingPeriodSlot[] = [];
  const duration: Duration = {};

  /*
   * If both startDate and endDate are same month, startDate is > 1 and endDate is < endOfMonth then
   *  - first slot is: startPeriod = startDate, endPeriod = startDate + n = sundayOfTheWeek
   *  - subsequent slots is: startPeriod = startDayOfWeek, endPeriod = sunDayOfTheWeek
   *  - final slot is: startPeriod = startDayOfWeek, endPeriood = endPeriod
   * */
  if (diffInDays <= Accounting_Period_Days_In_Month) {
    let slots: AccountingPeriodSlot[] = [];
    if (diffInDays <= Accounting_Period_Days_In_Week) {
      slots = generateDaySlots(accountingStartPeriod, accountingEndPeriod);
    } else {
      slots = generateWeekSlots(accountingStartPeriod, accountingEndPeriod);
    }
    periods.push(...slots);
  } else {
  }

  return periods;
};

const generateDaySlots = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): AccountingPeriodSlot[] => {
  const periods: AccountingPeriodSlot[] = [];
  let currentDate = new Date(
    accountingStartPeriod.getFullYear(),
    accountingStartPeriod.getMonth(),
    accountingStartPeriod.getDay(),
    0,
    0,
    0
  );
  let nextDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDay(),
    23,
    59,
    59
  );
  for (let i = 0; i < Accounting_Period_Days_In_Week; i++) {
    periods.push({
      startPeriod: currentDate,
      endPeriod: nextDate,
      key: getAccountingSlotKey(currentDate, nextDate),
    });
    currentDate = addDate(currentDate, { days: 1 });
    nextDate = addDate(nextDate, { days: 1 });
  }
  return periods;
};

const generateWeekSlots = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): AccountingPeriodSlot[] => {
  const periods: AccountingPeriodSlot[] = [];

  let currentDate = new Date(accountingStartPeriod.getTime());
  let nextDate = new Date(accountingStartPeriod.getTime());

  const diffInWeeks = differenceInCalendarWeeks(
    accountingEndPeriod,
    accountingStartPeriod,
    { weekStartsOn: 1 }
  );
  for (let i = 0; i < diffInWeeks; i++) {
    if (!isSunday(currentDate)) {
      nextDate = getSunday(nextDate);
    }
    periods.push({
      startPeriod: currentDate,
      endPeriod: nextDate,
      key: getAccountingSlotKey(currentDate, nextDate),
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

const getAccountingSlotKey = (startDate: Date, endDate: Date) =>
  `${toFormattedDate(startDate, 'yyyyMMdd')}_${toFormattedDate(endDate, 'yyyyMMdd')}`;

const getSunday = (currentDate: Date): Date => {
  const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  return addDays(startOfWeekDate, 6);
};

export {
  computeAccountingPeriodSlots,
  getAccountingPeriodSlot,
  getAccountingPeriodFromSlotKey,
};
