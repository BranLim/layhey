import {
  Accounting_Period_Days_In_Month,
  Accounting_Period_Days_In_Week,
  Accounting_Period_Days_In_Year,
  Accounting_Period_One_Day_In_Milliseconds,
  StatementPeriodSlot,
} from '@/types/StatementPeriod';
import {
  differenceInCalendarDays,
  endOfWeek,
  isDate,
  isLastDayOfMonth,
  isSunday,
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
):
  | CashFlow.SerializableCashFlowSummary
  | CashFlow.SerializableIncomeSummary
  | CashFlow.SerializableExpenseSummary => {
  if (cashFlowForPeriod.statementType === 'Expense') {
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
      total: cashFlowForPeriod.expense.total,
    } as CashFlow.SerializableExpenseSummary;
  } else if (cashFlowForPeriod.statementType === 'Income') {
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
      total: cashFlowForPeriod.income.total,
    } as CashFlow.SerializableIncomeSummary;
  } else {
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
  }
};

export {
  getCashFlowStatementPeriods,
  getStatementPeriodKey,
  isCashFlowStatement,
  isIncomeStatement,
  isExpenseStatement,
  createCashFlowSummary,
};
