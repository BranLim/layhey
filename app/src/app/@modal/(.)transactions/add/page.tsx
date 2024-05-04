'use client';

import AddTransaction from '@/app/transactions/add/page';
import { Modal, ModalBody, ModalContent, ModalOverlay } from '@chakra-ui/modal';
import { useDisclosure } from '@chakra-ui/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, selectIsOpen } from '@/slices/modal-slice';

export default function AddTransactionModal() {
  const isOpen = useSelector(selectIsOpen);
  const dispatch = useDispatch();

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} size={'lg'}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <AddTransaction />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
