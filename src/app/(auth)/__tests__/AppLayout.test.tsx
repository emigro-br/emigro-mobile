import React from 'react';

import { waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { balanceStore } from '@/stores/BalanceStore';
import { securityStore } from '@/stores/SecurityStore';
import { sessionStore } from '@/stores/SessionStore';
import { FiatCurrency } from '@/types/assets';
import { AppLayout } from '../_layout';

describe.skip('AppLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(balanceStore, 'fetchUserBalance').mockResolvedValue([]);
  });

  it('should render AnonRoot when not signed in', async () => {
    const { getByText } = render(
      <AppLayout />,
    );

    await waitFor(() => {
      expect(getByText('Login')).toBeOnTheScreen();
    });
  });

  it('should goes Onboarding when it is not finished yet', async () => {
    sessionStore.preferences = { fiatsWithBank: [] };

    const { getByText } = render(<AppLayout />);
    await waitFor(() => {
      expect(getByText('Choose your main currency')).toBeOnTheScreen();
    });
  });

  it('should render Unlock when signed in and has pin', async () => {
    sessionStore.preferences = { fiatsWithBank: [FiatCurrency.USD] };
    securityStore.setPin('1234');

    const { getByText } = render(<AppLayout />);

    await waitFor(() => {
      expect(getByText('Unlock')).toBeOnTheScreen();
    });
  });
});
