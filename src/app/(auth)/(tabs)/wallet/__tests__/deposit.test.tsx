import React from 'react';
import { Linking } from 'react-native';

import { fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import mockConsole from 'jest-mock-console';

import { render } from 'test-utils';

import { depositUrl } from '@/services/emigro/anchors';
import { sessionStore } from '@/stores/SessionStore';
import { FiatCurrency } from '@/types/assets';

import Deposit from '../deposit';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    get accessToken() {
      return 'accessToken';
    },
    get publicKey() {
      return 'publicKey';
    },
    fetchPublicKey: jest.fn(),
  },
}));

jest.mock('@/services/emigro/anchors', () => ({
  depositUrl: jest.fn(() => ({
    url: 'https://anchor.url',
    id: 'transaction-id',
  })),
  CallbackType: {},
}));

describe('Deposit screen', () => {
  let router: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    router = useRouter();

    sessionStore.preferences = {
      fiatsWithBank: [FiatCurrency.ARS],
    };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('Should show loading screen when session is not ready', () => {
    // session not ready
    jest.spyOn(sessionStore, 'accessToken', 'get').mockReturnValueOnce(undefined);

    const { getByTestId } = render(<Deposit />);
    const loadingSpinner = getByTestId('loading-spinner');

    expect(loadingSpinner).toBeOnTheScreen();
  });

  test('Should show profile message when fiats are not avaiable', () => {
    sessionStore.preferences = {
      fiatsWithBank: [],
    };

    const { getByText, getByTestId } = render(<Deposit />);
    const message = getByTestId('no-currencies-msg');
    const button = getByText('Go to Profile');
    expect(message).toBeOnTheScreen();
    expect(button).toBeOnTheScreen();

    fireEvent.press(button);

    expect(router.replace).toHaveBeenCalledWith('/profile');
  });

  test('Should display available assets', () => {
    sessionStore.preferences = {
      fiatsWithBank: [FiatCurrency.BRL, FiatCurrency.USD],
    };

    const { getByText, queryByText } = render(<Deposit />);

    expect(getByText('Brazilian Real')).toBeOnTheScreen();
    expect(getByText('BRL')).toBeOnTheScreen();

    expect(getByText('US Dollar')).toBeOnTheScreen();
    expect(getByText('USDC')).toBeOnTheScreen();
    expect(queryByText('XML')).not.toBeOnTheScreen();
  });

  test('Should open URL and navigate back when modal is pressed', async () => {
    const { getByText, getByTestId } = render(<Deposit />);
    const asset = getByText('ARS');
    fireEvent.press(asset);

    let openUrlModal: any;
    await waitFor(() => {
      openUrlModal = getByTestId('open-url-modal');
      expect(openUrlModal).toBeOnTheScreen();
    });

    fireEvent(openUrlModal, 'onConfirm');

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('https://anchor.url');
      expect(router.back).toHaveBeenCalled();
    });
  });

  test.skip('Should display default error message when an error occurs', async () => {
    const restoreConsole = mockConsole();
    // // mock getInteractiveUrl to throw an error
    const error = new Error('An error occurred');
    (depositUrl as jest.Mock).mockRejectedValueOnce(error);

    const { getByText, getByTestId } = render(<Deposit />);
    const asset = getByText('ARS');
    fireEvent.press(asset);

    await waitFor(() => {
      const modal = getByTestId('open-url-modal');
      expect(modal).toBeOnTheScreen();
    });

    let button: any;
    await waitFor(() => {
      button = getByText('Continue to Anchor');
      expect(button).toBeOnTheScreen();
    });

    await waitFor(() => {
      const errorMessage = getByText('Something went wrong. Please try again');
      expect(errorMessage).toBeOnTheScreen();
      // expect(console.warn).toHaveBeenCalledWith(error);
    });
    restoreConsole();
  });
});
