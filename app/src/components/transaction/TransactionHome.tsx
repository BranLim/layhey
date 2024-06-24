import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { closeModal, selectIsOpenModal } from '@/states/common/modal.slice';

export const TransactionHome = () => {
  const isOpen = useAppSelector((state) =>
    selectIsOpenModal(state, 'TransactionDrawer')
  );
  const dispatch = useAppDispatch();
  const handleCloseDrawer = () => {
    dispatch(closeModal('TransactionDrawer'));
  };

  return (
    <Drawer isOpen={isOpen} placement='right' onClose={handleCloseDrawer}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
      </DrawerContent>
    </Drawer>
  );
};
