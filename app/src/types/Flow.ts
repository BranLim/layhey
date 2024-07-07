import CashFlow from '@/types/CashFlow';

namespace Flow {
  export type CashFlowNodeData = CashFlow.SerializableCashFlowSummary & {
    rootNode?: boolean;
    isExpanded?: boolean;
    isToolbarVisible: boolean;
  };

  export type IncomeNodeData = CashFlow.SerializableIncomeSummary & {
    rootNode?: boolean;
    isExpanded?: boolean;
    isToolbarVisible: boolean;
  };

  export type ExpenseNodeData = CashFlow.SerializableExpenseSummary & {
    rootNode?: boolean;
    isExpanded?: boolean;
    isToolbarVisible: boolean;
  };

  export type FlowNodeData =
    | CashFlowNodeData
    | IncomeNodeData
    | ExpenseNodeData
    | undefined;
}

export default Flow;
