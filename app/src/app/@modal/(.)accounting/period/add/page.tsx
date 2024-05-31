'use client';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Divider, Text } from '@chakra-ui/react';
import { closeModal, selectIsOpenModal } from '@/states/common/modal.slice';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import AddAccountingPeriod from '@/app/accounting/period/add/page';

export default function AddAccountingPeriodModal() {
  const isOpen = useAppSelector((state) =>
    selectIsOpenModal(state, 'AddAccountingPeriodModal')
  );
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleCloseModal = () => {
    dispatch(closeModal('AddAccountingPeriodModal'));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      onCloseComplete={() => {
        router.push('/');
      }}
      size={'lg'}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color='gray.500'>Create Accounting Period</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize='sm'>
            Define an accounting period to simplify and speed up your workflow
            when using Cash Flow Viewer.
          </Text>
          <Divider pb={4} />
          <AddAccountingPeriod />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
