import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { balanceStore } from '@stores/BalanceStore';
import { sessionStore } from '@stores/SessionStore';

import RootStack from '../RootStack';

describe('RootStack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(balanceStore, 'fetchUserBalance').mockResolvedValue([]);
  });

  it('should render AnonRoot when not signed in', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <RootStack isSignedIn={false} />
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(getByText('Login')).toBeOnTheScreen();
    });
  });

  it('should goes Onboarding when it is not finished yet', async () => {
    sessionStore.preferences = { fiatsWithBank: [] };

    const { getByText } = render(
      <NavigationContainer>
        <RootStack isSignedIn />
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(getByText('Choose your main currency')).toBeOnTheScreen();
    });
  });

  it('should render Unlock when signed in and has pin', async () => {
    jest.spyOn(sessionStore, 'loadPin').mockResolvedValue('1234');

    const { getByText } = render(
      <NavigationContainer>
        <RootStack isSignedIn />
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(getByText('Unlock')).toBeOnTheScreen();
    });
  });
});
