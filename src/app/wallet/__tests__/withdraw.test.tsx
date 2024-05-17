import React from 'react';
import { Linking } from 'react-native';

import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import * as anchor from '@/services/emigro/anchors';
import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';
import { FiatCurrency } from '@/types/assets';

import Withdraw from '../withdraw';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@/services/emigro/anchors', () => ({
  withdrawUrl: jest.fn(),
  getTransaction: jest.fn().mockResolvedValue({
    status: 'completed',
  }),
  CallbackType: {
    EVENT_POST_MESSAGE: 'EVENT_POST_MESSAGE',
  },
}));

jest.mock('@/services/emigro/users', () => ({
  getUserPublicKey: jest.fn().mockResolvedValue('somePublicKey'),
}));

jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    session: {},
    get accessToken() {
      return 'accessToken';
    },
    get publicKey() {
      return 'publicKey';
    },
  },
}));

const mockNavigation: any = {
  replace: jest.fn(),
};

describe('Withdraw', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // Please, keep this to avoid act() warning
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('Should show loading screen when session is not ready', () => {
    // session not ready
    jest.spyOn(sessionStore, 'accessToken', 'get').mockReturnValueOnce(undefined);

    const { getByTestId } = render(<Withdraw navigation={mockNavigation} />);
    const loadingSpinner = getByTestId('loading-spinner');

    expect(loadingSpinner).toBeOnTheScreen();
  });

  test('Should show profile message when fiats are not avaiable', () => {
    sessionStore.preferences = {
      fiatsWithBank: [],
    };

    const { getByText, getByTestId } = render(<Withdraw navigation={mockNavigation} />);
    const message = getByTestId('no-currencies-msg');
    const button = getByText('Go to Profile');
    expect(message).toBeOnTheScreen();
    expect(button).toBeOnTheScreen();

    fireEvent.press(button);

    expect(mockNavigation.replace).toHaveBeenCalledWith('Root', { screen: 'ProfileTab' });
  });

  it('Should render correctly', async () => {
    sessionStore.preferences = {
      fiatsWithBank: [FiatCurrency.BRL, FiatCurrency.USD],
    };
    balanceStore.userBalance = [
      { balance: '100', assetCode: 'BRL', assetType: 'fiat' },
      { balance: '200', assetCode: 'USD', assetType: 'fiat' },
    ];

    const { getByText, queryByText } = render(<Withdraw navigation={mockNavigation} />);

    expect(getByText('Withdraw money')).toBeOnTheScreen();
    expect(getByText('Choose the currency you want to withdraw')).toBeOnTheScreen();

    expect(getByText('Brazilian Real')).toBeOnTheScreen();
    expect(getByText('100.00 BRL')).toBeOnTheScreen();
    expect(getByText('US Dollar')).toBeOnTheScreen();
    expect(getByText('200.00 USD')).toBeOnTheScreen();
    expect(queryByText('XML')).not.toBeOnTheScreen();
  });

  it('Should not open the modal when has zero balance', async () => {
    sessionStore.preferences = {
      fiatsWithBank: [FiatCurrency.ARS],
    };
    balanceStore.userBalance = [{ balance: '0', assetCode: 'ARS', assetType: 'fiat' }];

    const { getByText } = render(<Withdraw navigation={mockNavigation} />);
    const button = getByText('Argentine Peso');

    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText('You have no balance to withdraw')).toBeOnTheScreen();
    });
  });

  it('Should open the modal when asset is pressed', async () => {
    sessionStore.preferences = {
      fiatsWithBank: [FiatCurrency.ARS],
    };
    balanceStore.userBalance = [{ balance: '10', assetCode: 'ARS', assetType: 'fiat' }];

    (anchor.withdrawUrl as jest.Mock).mockResolvedValue({
      url: 'http://anchor.ars',
      type: 'withdraw',
      id: 'someId',
    });
    const { getByText, getByTestId } = render(<Withdraw navigation={mockNavigation} />);
    const button = getByText('Argentine Peso');

    fireEvent.press(button);

    await waitFor(() => {
      const openUrlModal = getByTestId('open-url-modal');
      expect(openUrlModal).toBeOnTheScreen();
      fireEvent(openUrlModal, 'onConfirm');
      // fireEvent.press(getByText('Ok, continue'));
    });

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('http://anchor.ars');
      const loadingModal = getByTestId('waiting-transaction-modal');
      expect(loadingModal).toBeOnTheScreen();
    });
  });
});
