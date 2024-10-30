import React from 'react';

import { StyledProvider } from '@gluestack-style/react';
import { createProvider } from '@gluestack-ui/provider';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

const TempProvider = createProvider({ StyledProvider }) as any;
TempProvider.displayName = 'ThemeProvider';

export const ThemeProvider = ({ children, theme }: any) => {
  return <GluestackUIProvider mode={theme}>{children}</GluestackUIProvider>;
};
