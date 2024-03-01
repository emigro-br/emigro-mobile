import React from 'react';

import { StyledProvider } from '@gluestack-style/react';
import { createProvider } from '@gluestack-ui/provider';

import { config } from '@config/gluestack-ui.config';

const TempProvider = createProvider({ StyledProvider }) as any;
TempProvider.displayName = 'Provider';

export const Provider = ({ children }: any) => {
  return <TempProvider config={config}>{children}</TempProvider>;
};
