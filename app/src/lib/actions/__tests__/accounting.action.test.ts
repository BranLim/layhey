import { describe, it } from '@jest/globals';
import { deriveTransactionPeriods } from '@/lib/actions/accounting.action';
import { AccountingPeriod } from '@/types/AccountingPeriod';
import expect from 'expect';

describe('AccountingAction tests', () => {
  describe('Start and end period is 1 week apart', () => {
    it('Should return 7 accounting periods when derive transaction periods', () => {
      const startPeriod = new Date(2024, 0, 1);
      const endPeriod = new Date(2024, 0, 7, 23, 59, 59);

      const accountingPeriods: AccountingPeriod[] = deriveTransactionPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(7);
    });
  });
  describe('Start and end period is 4 weeks apart', () => {
    it('Should return 4 accounting periods when derive transaction periods', () => {
      const startPeriod = new Date(2024, 0, 1);
      const endPeriod = new Date(2024, 0, 28, 23, 59, 59);

      const accountingPeriods: AccountingPeriod[] = deriveTransactionPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(4);
    });
  });

  describe('Start and end period is 12 month apart', () => {
    it('Should return 12 accounting periods when derive transaction periods', () => {
      const startPeriod = new Date(2024, 0, 1);
      const endPeriod = new Date(2024, 11, 31, 23, 59, 59);

      const accountingPeriods: AccountingPeriod[] = deriveTransactionPeriods(
        startPeriod,
        endPeriod
      );

      expect(accountingPeriods.length).toBe(12);
    });
  });
});
