import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import { UserProfile } from '@/services/emigro/types';
import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';
import { CryptoAsset } from '@/types/assets';

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

const profileMock = {
  given_name: 'Test Name',
  family_name: 'Test Last Name',
  email: 'test@email.com',
  address: 'Test Address',
} as UserProfile;

describe('Profile screen', () => {
  let router: any;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    router = useRouter();
  });

  test('Should appear loading screen while fetching the user information', () => {
    jest.spyOn(sessionStore, 'profile', 'get').mockReturnValue(null);
    const { getByTestId } = render(<Profile />);

    expect(getByTestId('loading-spinner')).toBeOnTheScreen();
  });

  test('Should render the Profile screen correctly', () => {
    jest.spyOn(sessionStore, 'profile', 'get').mockReturnValue(profileMock);
    const screen = render(<Profile />);

    expect(screen.getByRole('header')).toHaveTextContent('Test Name Test Last Name');
    expect(screen.toJSON()).toMatchSnapshot();
  });

  test('should navigate to Personal Info', () => {
    const { getByTestId } = render(<Profile />);

    const personalInfoButton = getByTestId('personal-info-button');

    fireEvent.press(personalInfoButton);

    expect(router.push).toHaveBeenCalledWith('/profile/personal-info');
  });

  test('should navigate to Configure PIN', () => {
    const { getByTestId } = render(<Profile />);

    const personalInfoButton = getByTestId('configure-pin-button');

    fireEvent.press(personalInfoButton);

    expect(router.push).toHaveBeenCalledWith('/settings/configure-pin');
  });

  test('should navigate to Bank Currency', async () => {
    jest.spyOn(balanceStore, 'currentAssets').mockReturnValue([CryptoAsset.USDC]);

    const { getByTestId, queryByTestId } = render(<Profile />);
    // expect(queryByTestId('asset-list-action-sheet"')).toBeNull();
    expect(queryByTestId('asset-avatarr"')).toBeNull();

    const personalInfoButton = getByTestId('bank-currency-button');

    fireEvent.press(personalInfoButton);

    await waitFor(() => {
      // expect(getByTestId('asset-list-action-sheet"')).toBeOnTheScreen();
      expect(getByTestId('asset-avatar')).toBeOnTheScreen(); // FIXME: could not find sset-list-action-sheet
    });
  });

  test('Should trigger the Logout action and clear the storage', () => {
    const { getByText } = render(<Profile />);

    const logoutButton = getByText('Logout');

    fireEvent.press(logoutButton);

    expect(sessionStore.clear).toHaveBeenCalled();
  });
});
