import {
  Accounting_Period_Days_In_Month,
  Accounting_Period_Days_In_Week,
  Accounting_Period_Days_In_Year,
  Accounting_Period_One_Day_In_Milliseconds,
  AccountingPeriod,
  StatementPeriodSlot,
} from '@/types/AccountingPeriod';
import {
  differenceInCalendarDays,
  endOfWeek,
  isDate,
  isLastDayOfMonth,
  isSunday,
  parse,
  startOfWeek,
} from 'date-fns';
import { add as addDate } from 'date-fns/add';
import {
  getMonthEnd,
  getSunday,
  getYearEnd,
  toFormattedDate,
} from '@/utils/date.utils';
import CashFlow from '@/types/CashFlow';
import CashFlowStatement = CashFlow.CashFlowStatement;
import IncomeStatement = CashFlow.IncomeStatement;
import ExpenseStatement = CashFlow.ExpenseStatement;

const getCashFlowStatementPeriods = (
  startPeriod: string,
  endPeriod: string
): StatementPeriodSlot[] => {
  const statementStartPeriod = new Date(startPeriod);
  const statementEndPeriod = new Date(endPeriod);

  return computeCashFlowStatementPeriods(
    statementStartPeriod,
    statementEndPeriod
  );
};

const computeCashFlowStatementPeriods = (
  statementStartPeriod: Date,
  statementEndPeriod: Date
): StatementPeriodSlot[] => {
  if (!isDate(statementStartPeriod) || !isDate(statementEndPeriod)) {
    throw new Error(
      'statementStartPeriod or statementEndPeriod must be date type'
    );
  }

  const diffInDays =
    differenceInCalendarDays(statementEndPeriod, statementStartPeriod) + 1;

  const periods: StatementPeriodSlot[] = [];
  let slots: StatementPeriodSlot[] = [];
  if (diffInDays <= Accounting_Period_Days_In_Month) {
    if (
      diffInDays * (1000 * 60 * 60 * 24) <=
      Accounting_Period_One_Day_In_Milliseconds
    ) {
      slots = generateSingleDayPeriodForIncomeAndExpense(
        statementStartPeriod,
        statementEndPeriod
      );
    } else if (diffInDays <= Accounting_Period_Days_In_Week) {
      slots = generateDayPeriods(statementStartPeriod, statementEndPeriod);
    } else {
      slots = generateWeekPeriods(statementStartPeriod, statementEndPeriod);
    }
  } else if (
    diffInDays > Accounting_Period_Days_In_Month &&
    diffInDays <= Accounting_Period_Days_In_Year
  ) {
    slots = generateMonthPeriods(statementStartPeriod, statementEndPeriod);
  } else {
    slots = generateYearPeriods(statementStartPeriod, statementEndPeriod);
  }
  periods.push(...slots);
  return periods;
};

const generateSingleDayPeriodForIncomeAndExpense = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
) => {
  const periods: StatementPeriodSlot[] = [];
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
    59,
    999
  );
  periods.push({
    startPeriod: currentDate,
    endPeriod: nextDate,
    key: `${getStatementPeriodKey(currentDate, nextDate)}_income`,
  });
  periods.push({
    startPeriod: currentDate,
    endPeriod: nextDate,
    key: `${getStatementPeriodKey(currentDate, nextDate)}_expense`,
  });

  return periods;
};

const generateDayPeriods = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): StatementPeriodSlot[] => {
  const endPeriod = new Date(
    accountingEndPeriod.getFullYear(),
    accountingEndPeriod.getMonth(),
    accountingEndPeriod.getDate(),
    23,
    59,
    59,
    999
  );
  const periods: StatementPeriodSlot[] = [];
  let currentDate = new Date(
    accountingStartPeriod.getFullYear(),
    accountingStartPeriod.getMonth(),
    accountingStartPeriod.getDate(),
    0,
    0,
    0
  );
  let nextDate = new Date(
    accountingStartPeriod.getFullYear(),
    accountingStartPeriod.getMonth(),
    accountingStartPeriod.getDate(),
    23,
    59,
    59,
    999
  );

  while (currentDate < endPeriod) {
    if (nextDate > endPeriod) {
      nextDate = endPeriod;
    }
    periods.push({
      startPeriod: currentDate,
      endPeriod: nextDate,
      key: getStatementPeriodKey(currentDate, nextDate),
    });
    currentDate = addDate(nextDate, { seconds: 1 });
    nextDate = addDate(nextDate, { days: 1 });
  }
  return periods;
};

const generateWeekPeriods = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): StatementPeriodSlot[] => {
  const endPeriod = new Date(
    accountingEndPeriod.getFullYear(),
    accountingEndPeriod.getMonth(),
    accountingEndPeriod.getDate(),
    23,
    59,
    59,
    999
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
    59,
    999
  );
  const periods: StatementPeriodSlot[] = [];
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
      key: getStatementPeriodKey(currentDate, nextDate),
    });
    currentDate = addDate(nextDate, { days: 1 });
  }

  return periods;
};

const generateMonthPeriods = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): StatementPeriodSlot[] => {
  const endPeriod = new Date(
    accountingEndPeriod.getFullYear(),
    accountingEndPeriod.getMonth(),
    accountingEndPeriod.getDate(),
    23,
    59,
    59,
    999
  );
  let currentDate = new Date(accountingStartPeriod.getTime());
  let nextDate = new Date(
    accountingStartPeriod.getFullYear(),
    accountingStartPeriod.getMonth(),
    accountingStartPeriod.getDate(),
    23,
    59,
    59,
    999
  );
  const periods: StatementPeriodSlot[] = [];
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
      key: getStatementPeriodKey(currentDate, nextDate),
    });
    currentDate = addDate(nextDate, { days: 1 });
  }

  return periods;
};

const generateYearPeriods = (
  accountingStartPeriod: Date,
  accountingEndPeriod: Date
): StatementPeriodSlot[] => {
  const endPeriod = new Date(
    accountingEndPeriod.getFullYear(),
    accountingEndPeriod.getMonth(),
    accountingEndPeriod.getDate(),
    23,
    59,
    59,
    999
  );
  let currentDate = new Date(accountingStartPeriod.getTime());
  let nextDate = new Date(
    accountingStartPeriod.getFullYear(),
    accountingStartPeriod.getMonth(),
    accountingStartPeriod.getDate(),
    23,
    59,
    59,
    999
  );
  const periods: StatementPeriodSlot[] = [];
  while (currentDate < endPeriod) {
    nextDate = getYearEnd(currentDate);

    if (nextDate > endPeriod) {
      nextDate = endPeriod;
    }
    periods.push({
      startPeriod: currentDate,
      endPeriod: nextDate,
      key: getStatementPeriodKey(currentDate, nextDate),
    });
    currentDate = addDate(nextDate, { days: 1 });
  }

  return periods;
};

const getAccountingPeriodSlot = (
  statementPeriods: StatementPeriodSlot[],
  transactionDate: Date
): StatementPeriodSlot | undefined => {
  return statementPeriods?.find(
    (value) =>
      value.startPeriod <= transactionDate && value.endPeriod >= transactionDate
  );
};

const getMatchingCashFlowStatementPeriodSlots = (
  statementPeriods: StatementPeriodSlot[],
  transactionDate: Date
): StatementPeriodSlot[] | undefined => {
  if (!statementPeriods) {
    return undefined;
  }
  const allMatchingSlots = statementPeriods?.filter(
    (value) =>
      value.startPeriod <= transactionDate && value.endPeriod >= transactionDate
  );
  if (!allMatchingSlots || allMatchingSlots.length === 0) {
    return undefined;
  }
  allMatchingSlots.sort(
    (slot1: StatementPeriodSlot, slot2: StatementPeriodSlot) => {
      const slo1Time = slot1.endPeriod.getTime() - slot1.startPeriod.getTime();
      const slot2Time = slot2.endPeriod.getTime() - slot2.startPeriod.getTime();

      if (slo1Time > slot2Time) {
        return 1;
      }
      if (slo1Time < slot2Time) {
        return -1;
      }

      return 0;
    }
  );
  return allMatchingSlots;
};

const getStatementPeriodFromSlotKey = (
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

const getStatementPeriodKey = (startDate: Date, endDate: Date) =>
  `${toFormattedDate(startDate, 'yyyyMMdd')}_${toFormattedDate(endDate, 'yyyyMMdd')}`;

const isCashFlowStatement = (obj: any) =>
  typeof obj === 'object' &&
  'income' in obj &&
  'expense' in obj &&
  (obj as CashFlowStatement).statementType === 'Summary';

const isIncomeStatement = (obj: any) =>
  typeof obj === 'object' &&
  'income' in obj &&
  (obj as IncomeStatement).statementType === 'Income';

const isExpenseStatement = (obj: any) =>
  typeof obj === 'object' &&
  'expense' in obj &&
  (obj as ExpenseStatement).statementType === 'Expense';

const createCashFlowSummary = (
  cashFlowForPeriod: CashFlowStatement | IncomeStatement | ExpenseStatement
) => {
  if (cashFlowForPeriod.statementType === 'Summary') {
    return {
      id: cashFlowForPeriod.id,
      parentRef: cashFlowForPeriod.parentRef,
      statementType: cashFlowForPeriod.statementType,
      startPeriod: new Date(
        cashFlowForPeriod.accountingPeriod.startPeriod
      ).toISOString(),
      endPeriod: new Date(
        cashFlowForPeriod.accountingPeriod.endPeriod
      ).toISOString(),
      inflow: cashFlowForPeriod.income.total,
      outflow: cashFlowForPeriod.expense.total,
      difference:
        cashFlowForPeriod.income.total - cashFlowForPeriod.expense.total,
      currency: 'SGD',
    } as CashFlow.SerializableCashFlowSummary;
  } else if (cashFlowForPeriod.statementType === 'Income') {
    return {
      id: cashFlowForPeriod.id,
      parentRef: cashFlowForPeriod.parentRef,
      statementType: cashFlowForPeriod.statementType,
      accountingPeriod: {
        startPeriod: new Date(
          cashFlowForPeriod.accountingPeriod.startPeriod
        ).toISOString(),
        endPeriod: new Date(
          cashFlowForPeriod.accountingPeriod.endPeriod
        ).toISOString(),
      },
      total: cashFlowForPeriod.income.total,
    } as CashFlow.SerializableIncomeSummary;
  } else {
    return {
      id: cashFlowForPeriod.id,
      parentRef: cashFlowForPeriod.parentRef,
      statementType: cashFlowForPeriod.statementType,
      accountingPeriod: {
        startPeriod: new Date(
          cashFlowForPeriod.accountingPeriod.startPeriod
        ).toISOString(),
        endPeriod: new Date(
          cashFlowForPeriod.accountingPeriod.endPeriod
        ).toISOString(),
      },
      total: cashFlowForPeriod.expense.total,
    } as CashFlow.SerializableExpenseSummary;
  }
};

export {
  getCashFlowStatementPeriods,
  getAccountingPeriodSlot,
  getStatementPeriodFromSlotKey,
  getMatchingCashFlowStatementPeriodSlots,
  getStatementPeriodKey,
  isCashFlowStatement,
  isIncomeStatement,
  isExpenseStatement,
  createCashFlowSummary,
};
