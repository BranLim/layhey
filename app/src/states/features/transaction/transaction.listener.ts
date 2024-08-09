import { ListenerEffectAPI, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/states/store';
import { UpdateTransactionEvent } from '@/types/Transaction';
import { closeModal, openModal } from '@/states/common/modal.slice';
import { getTransactionById } from '@/states/features/transaction/getTransactions.thunk';

const handleUpdateTransaction = (
  action: PayloadAction<UpdateTransactionEvent>,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
): void => {
  const { target, source, data } = action.payload;

  const currentState = listenerApi.getState();
  const selectedNode = currentState.flow.selectedNode;
  if (!selectedNode) {
    return;
  }

  listenerApi.dispatch(openModal(target));
  listenerApi.dispatch(closeModal(source));
  listenerApi.dispatch(getTransactionById({ id: data.id }));
};

export { handleUpdateTransaction };
