import React from 'react';

import { NavigationContext } from '@react-navigation/native';

import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { UserProfile } from '@/services/emigro/types';
import { sessionStore } from '@/stores/SessionStore';

import Profile from '..';

jest.mock('expo-clipboard');

jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    clear: jest.fn(),
    publicKey: 'test-public',
    get profile() {
      return null;
    },
  },
}));

const renderWithProviders = (component: JSX.Element) => {
  // fake NavigationContext value data
  const navContext: any = {
    isFocused: () => true,
    // addListener returns an unscubscribe function.
    addListener: jest.fn(() => jest.fn()),
  };
  return render(<NavigationContext.Provider value={navContext}>{component}</NavigationContext.Provider>);
};

describe('Profile screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should appear loading screen while fetching the user information', async () => {
    jest.spyOn(sessionStore, 'profile', 'get').mockReturnValue(null);
    const { getByTestId } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(getByTestId('loading')).toBeOnTheScreen();
    });
  });

  test('Should render the Profile screen correctly', async () => {
    jest.spyOn(sessionStore, 'profile', 'get').mockReturnValue({
      given_name: 'Test Name',
      family_name: 'Test Last Name',
      email: 'test@email.com',
      address: 'Test Address',
    } as UserProfile);
    const screen = renderWithProviders(<Profile />);

    await waitFor(() => {
      // expect(getByLabelText('Full Name')).toBeOnTheScreen();
      expect(screen.getByRole('header')).toHaveTextContent('Test Name Test Last Name');
      // expect(queryAllByText('Test Name Test Last Name')).toHaveLength(2);
      // expect(getByText('Email address')).toBeOnTheScreen();
      // expect(getByText('test@email.com')).toBeOnTheScreen();
      // expect(getByText('Address')).toBeOnTheScreen();
      // expect(getByText('Test Address')).toBeOnTheScreen();
      // expect(getByText('Delete account')).toBeOnTheScreen();
      // expect(getByText('Logout')).toBeOnTheScreen();
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });

  test('Should trigger the Logout action and clear the storage', async () => {
    const { getByText } = renderWithProviders(<Profile />);

    const logoutButton = getByText('Logout');

    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(sessionStore.clear).toHaveBeenCalled();
    });
  });
});
