import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/modal';

export const TransactionHome = () => {
  const handleCloseDrawer = () => {};

  return (
    <Drawer isOpen={true} placement='right' onClose={handleCloseDrawer}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
      </DrawerContent>
    </Drawer>
  );
};
