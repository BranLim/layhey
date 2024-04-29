'use client';

import { useFloating } from '@floating-ui/react';
import { IconButton, MenuIcon } from '@chakra-ui/react';
import * as React from 'react';

interface MenuProps {
  label: string;
  nested?: boolean;
  children?: React.ReactNode;
}

export const Menu = (menuProps: MenuProps) => {
  const { floatingStyles, refs, context } = useFloating<HTMLButtonElement>({});
};
