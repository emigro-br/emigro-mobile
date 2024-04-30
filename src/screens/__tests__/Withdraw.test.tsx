import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { FiatCurrency } from '@/types/assets';

import * as anchor from '@services/emigro/anchors';

import { sessionStore } from '@stores/SessionStore';

import Withdraw from '../Withdraw';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@services/emigro/anchors', () => ({
  withdrawUrl: jest.fn(),
  getTransaction: jest.fn().mockResolvedValue({
    status: 'completed',
  }),
  CallbackType: {
    EVENT_POST_MESSAGE: 'EVENT_POST_MESSAGE',
  },
}));

jest.mock('@services/emigro/users', () => ({
  getUserPublicKey: jest.fn().mockResolvedValue('somePublicKey'),
}));

jest.mock('@stores/SessionStore', () => ({
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

    const { getByTestId } = render(<Withdraw />);
    const loadingSpinner = getByTestId('loading-spinner');

    expect(loadingSpinner).toBeOnTheScreen();
  });

  it('Should render correctly', async () => {
    sessionStore.preferences = {
      fiatsWithBank: [FiatCurrency.BRL, FiatCurrency.USD],
    };
    const { getByText, queryByText } = render(<Withdraw />);

    expect(getByText('Withdraw money')).toBeOnTheScreen();
    expect(getByText('Choose the currency you want to withdraw')).toBeOnTheScreen();

    expect(getByText('BRL')).toBeOnTheScreen();
    expect(getByText('USD')).toBeOnTheScreen();
    expect(queryByText('XML')).not.toBeOnTheScreen();
  });

  it('Should open the modal when asset is pressed', async () => {
    sessionStore.preferences = {
      fiatsWithBank: [FiatCurrency.ARS],
    };
    (anchor.withdrawUrl as jest.Mock).mockResolvedValue({
      url: 'http://anchor.ars',
      type: 'withdraw',
      id: 'someId',
    });
    const { getByText, getByTestId } = render(<Withdraw />);
    const button = getByText('ARS');

    fireEvent.press(button);

    await waitFor(() => {
      const loadingModal = getByTestId('loading-url-modal');
      expect(loadingModal).toBeOnTheScreen();
    });

    await waitFor(() => {
      const openUrlModal = getByTestId('open-url-modal');
      expect(openUrlModal).toBeOnTheScreen();
      // expect(Linking.openURL).toHaveBeenCalledWith('http://anchor.ars');
    });
  });
});
