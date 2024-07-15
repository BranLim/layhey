import { describe, it } from '@jest/globals';
import { getCashFlowStatementPeriods } from '@/lib/helpers/period-calculation.helper';
import { AccountingPeriod } from '@/types/AccountingPeriod';
import expect from 'expect';

describe('Statement Period Calculation tests', () => {
  describe('Start and end period is 1 week apart', () => {
    it('Should return 7 accounting slots when transaction period is within same week', () => {
      const startPeriod = '2024-01-01T00:00:00';
      const endPeriod = '2024-01-07T23:59:59';

      const accountingPeriods: AccountingPeriod[] = getCashFlowStatementPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(7);
    });
    it('Should return 7 accounting slots when transaction period is spread across two calendar weeks', () => {
      const startPeriod = '2024-01-03T00:00:00';
      const endPeriod = '2024-01-09T23:59:59';

      const accountingPeriods: AccountingPeriod[] = getCashFlowStatementPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(7);
    });
  });
  describe('Start and end period is between 2 to 4 weeks apart', () => {
    it('Should return 2 accounting slots when transaction period is spread across 2 calendar weeks', () => {
      const startPeriod = '2024-01-03T00:00:00';
      const endPeriod = '2024-01-12T23:59:59';

      const accountingPeriods: AccountingPeriod[] = getCashFlowStatementPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(2);
    });
    it('Should return 3 accounting slots when transaction period is spread across 3 calendar weeks', () => {
      const startPeriod = '2024-01-03T00:00:00';
      const endPeriod = '2024-01-16T23:59:59';

      const accountingPeriods: AccountingPeriod[] = getCashFlowStatementPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(3);
    });
    it('Should return 4 accounting slots when transaction period is spread across 4 calendar weeks', () => {
      const startPeriod = '2024-01-01T00:00:00';
      const endPeriod = '2024-01-28T23:59:59';

      const accountingPeriods: AccountingPeriod[] = getCashFlowStatementPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(4);
    });
    it('Should return 4 accounting slots when transaction period is spread across 4 calendar weeks and startPeriod is middle of week', () => {
      const startPeriod = '2024-01-03T00:00:00';
      const endPeriod = '2024-01-28T23:59:59';

      const accountingPeriods: AccountingPeriod[] = getCashFlowStatementPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(4);
    });
    it('Should return 5 accounting slots when transaction period is spread across 5 calendar weeks and startPeriod is middle of week', () => {
      const startPeriod = '2024-01-01T00:00:00';
      const endPeriod = '2024-01-30T23:59:59';

      const accountingPeriods: AccountingPeriod[] = getCashFlowStatementPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(5);
    });
  });

  describe('Start and end period is at least more than 1 month and maximum 12 months apart', () => {
    it('Should return 12 accounting slot when transaction period start 1st January and end 31 December', () => {
      const startPeriod = '2024-01-01T00:00:00';
      const endPeriod = '2024-12-31T23:59:59';

      const accountingPeriods: AccountingPeriod[] = getCashFlowStatementPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(12);
    });
    it('Should return 12 accounting slot when transaction period start 15 January and end 31 December', () => {
      const startPeriod = '2024-01-15T00:00:00';
      const endPeriod = '2024-12-31T23:59:59';

      const accountingPeriods: AccountingPeriod[] = getCashFlowStatementPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(12);
      expect(accountingPeriods[0]).toMatchObject({
        startPeriod: new Date(2024, 0, 15, 0, 0, 0, 0),
        endPeriod: new Date(2024, 0, 31, 23, 59, 59, 999),
      });
    });
  });
  describe('Start and end period is more than 1 year apart', () => {
    it('Should return 2 accounting slots when transaction period start 1st January and end 31 Jan next year', () => {
      const startPeriod = '2024-01-01T00:00:00';
      const endPeriod = '2025-01-31T23:59:59';

      const accountingPeriods: AccountingPeriod[] = getCashFlowStatementPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(2);
    });
  });
});
