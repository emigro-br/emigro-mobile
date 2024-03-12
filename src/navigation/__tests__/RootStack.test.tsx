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
    jest.spyOn(balanceStore, 'fetchUserBalance').mockImplementation(jest.fn());
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

  it('should render Unlock when signed in and not just logged in', async () => {
    sessionStore.justLoggedIn = false;
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

  it('should not render Unlock when signed in and just logged in', async () => {
    sessionStore.justLoggedIn = true;
    jest.spyOn(sessionStore, 'loadPin').mockResolvedValue('1234');

    const { queryByText } = render(
      <NavigationContainer>
        <RootStack isSignedIn />
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(queryByText('Unlock')).toBeNull();
    });
  });

  // TODO: remove when force pin is implemented
  it('should not render Unlock when signed in and not just logged in and user has no pin', async () => {
    sessionStore.justLoggedIn = false;
    jest.spyOn(sessionStore, 'loadPin').mockResolvedValue(null);

    const { queryByText } = render(
      <NavigationContainer>
        <RootStack isSignedIn />
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(queryByText('Unlock')).toBeNull();
    });
  });
});
