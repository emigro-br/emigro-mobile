import React from 'react';

import { StyledProvider } from '@gluestack-style/react';
import { createProvider } from '@gluestack-ui/provider';

import { config } from '@/config/gluestack-ui.config';

const TempProvider = createProvider({ StyledProvider }) as any;
TempProvider.displayName = 'ThemeProvider';

export const ThemeProvider = ({ children, theme }: any) => {
  return (
    <TempProvider config={config} theme={theme}>
      {children}
    </TempProvider>
  );
};
