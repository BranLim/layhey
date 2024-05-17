import { Transaction } from '@/types/Transaction';
import { AccountingPeriod, CashFlowNodes } from '@/types/CashFlow';

export const computeCashFlowNodes = async (
  accountingPeriod: AccountingPeriod,
  transactions: Transaction[]
): Promise<CashFlowNodes> => {
  const nodes = [];
  const edges = [];
  return { nodes, edges };
};
