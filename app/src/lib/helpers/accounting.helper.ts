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
  endOfMonth,
  endOfWeek,
  isBefore,
  isDate,
  isLastDayOfMonth,
  isSunday,
  parse,
  startOfISOWeek,
  startOfWeek,
} from 'date-fns';
import { add as addDate } from 'date-fns/add';
import { getMonthEnd, getSunday, toFormattedDate } from '@/utils/date.utils';
import { next } from 'sucrase/dist/types/parser/tokenizer';

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
  let slots: AccountingPeriodSlot[] = [];
  if (diffInDays <= Accounting_Period_Days_In_Month) {
    if (diffInDays <= Accounting_Period_Days_In_Week) {
      slots = generateDaySlots(accountingStartPeriod, accountingEndPeriod);
    } else {
      slots = generateWeekSlots(accountingStartPeriod, accountingEndPeriod);
    }
  } else {
    slots = generateMonthSlot(accountingStartPeriod, accountingEndPeriod);
  }
  periods.push(...slots);
  return periods;
};

const generateDaySlots = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): AccountingPeriodSlot[] => {
  const endPeriod = new Date(
    accountingEndPeriod.getFullYear(),
    accountingEndPeriod.getMonth(),
    accountingEndPeriod.getDate(),
    23,
    59,
    59
  );
  const periods: AccountingPeriodSlot[] = [];
  let currentDate = new Date(
    accountingStartPeriod.getFullYear(),
    accountingStartPeriod.getMonth(),
    accountingStartPeriod.getDate(),
    0,
    0,
    0
  );
  let nextDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
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
    if (nextDate > endPeriod) {
      nextDate = endPeriod;
    }
  }
  return periods;
};

const generateWeekSlots = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): AccountingPeriodSlot[] => {
  const endPeriod = new Date(
    accountingEndPeriod.getFullYear(),
    accountingEndPeriod.getMonth(),
    accountingEndPeriod.getDate(),
    23,
    59,
    59
  );
  const weekStartDate = startOfWeek(accountingStartPeriod, { weekStartsOn: 1 });
  const weekEndDate = endOfWeek(accountingEndPeriod, { weekStartsOn: 1 });

  const diffInWeeks = Math.ceil(
    (weekEndDate.getTime() - weekStartDate.getTime()) /
      (1000 * 60 * 60 * 24 * 7)
  );

  let currentDate = new Date(accountingStartPeriod.getTime());
  let nextDate = new Date(
    accountingStartPeriod.getFullYear(),
    accountingStartPeriod.getMonth(),
    accountingStartPeriod.getDate(),
    23,
    59,
    59
  );
  const periods: AccountingPeriodSlot[] = [];
  for (let i = 0; i < diffInWeeks; i++) {
    if (!isSunday(currentDate)) {
      nextDate = getSunday(currentDate);
    }
    if (nextDate > endPeriod) {
      nextDate = endPeriod;
    }
    periods.push({
      startPeriod: currentDate,
      endPeriod: nextDate,
      key: getAccountingSlotKey(currentDate, nextDate),
    });
    currentDate = addDate(nextDate, { days: 1 });
  }

  return periods;
};

const generateMonthSlot = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): AccountingPeriodSlot[] => {
  const endPeriod = new Date(
    accountingEndPeriod.getFullYear(),
    accountingEndPeriod.getMonth(),
    accountingEndPeriod.getDate(),
    23,
    59,
    59
  );
  let currentDate = new Date(accountingStartPeriod.getTime());
  let nextDate = new Date(
    accountingStartPeriod.getFullYear(),
    accountingStartPeriod.getMonth(),
    accountingStartPeriod.getDate(),
    23,
    59,
    59
  );
  const periods: AccountingPeriodSlot[] = [];
  while (currentDate < endPeriod) {
    if (!isLastDayOfMonth(currentDate)) {
      nextDate = getMonthEnd(currentDate);
    }
    if (nextDate > endPeriod) {
      nextDate = endPeriod;
    }
    periods.push({
      startPeriod: currentDate,
      endPeriod: nextDate,
      key: getAccountingSlotKey(currentDate, nextDate),
    });
    currentDate = addDate(nextDate, { months: 1 });
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

export {
  computeAccountingPeriodSlots,
  getAccountingPeriodSlot,
  getAccountingPeriodFromSlotKey,
};
