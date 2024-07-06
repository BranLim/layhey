import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { closeModal, selectIsOpenModal } from '@/states/common/modal.slice';
import { TransactionList } from '@/components/transaction/TransactionList';
import { Button, Flex, Spacer, Text } from '@chakra-ui/react';
import { selectPeriodForSelectedNode } from '@/states/features/cashflow/flow.slice';

export const TransactionHome = () => {
  const isOpen = useAppSelector((state) =>
    selectIsOpenModal(state, 'TransactionDrawer')
  );
  const transactionPeriod = useAppSelector((state) =>
    selectPeriodForSelectedNode(state)
  );
  const dispatch = useAppDispatch();
  const handleCloseDrawer = () => {
    dispatch(closeModal('TransactionDrawer'));
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={handleCloseDrawer}
      size={'lg'}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Transactions</DrawerHeader>
        <DrawerBody>
          <TransactionList transactions={[]} />
        </DrawerBody>
        <DrawerFooter>
          <Flex alignItems='right' pt={4} pb={2}>
            <Spacer />
            <Button
              mt={4}
              mr={2}
              colorScheme='gray'
              onMouseDown={() => handleCloseDrawer()}
            >
              Close
            </Button>
          </Flex>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
