import React from 'react';

// import { Linking } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import * as anchor from '@services/anchor';

import { sessionStore } from '@stores/SessionStore';

import Withdraw from '../Withdraw';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@services/anchor', () => ({
  getInteractiveWithdrawUrl: jest.fn(),
  getTransaction: jest.fn().mockResolvedValue({
    status: 'completed',
  }),
  CallbackType: {
    EVENT_POST_MESSAGE: 'EVENT_POST_MESSAGE',
  },
}));

jest.mock('@services/emigro', () => ({
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
    const { getByText, queryByText } = render(<Withdraw />);

    expect(getByText('Withdraw money')).toBeOnTheScreen();
    expect(getByText('Choose the currency you want to withdraw')).toBeOnTheScreen();

    await waitFor(() => {
      // only because of the useEffect
      expect(queryByText('ARS')).toBeOnTheScreen();
      expect(queryByText('BRL')).toBeOnTheScreen();
      expect(queryByText('EURC')).toBeOnTheScreen();
      expect(queryByText('USDC')).not.toBeOnTheScreen();
      expect(queryByText('XML')).not.toBeOnTheScreen();
    });
  });

  it('Should call handleOnPress when ARS button is pressed', async () => {
    (anchor.getInteractiveWithdrawUrl as jest.Mock).mockResolvedValue({
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

  it('Should call handleOnPress when BRL button is pressed', async () => {
    (anchor.getInteractiveWithdrawUrl as jest.Mock).mockResolvedValue({
      url: 'http://anchor.brl',
      type: 'withdraw',
      id: 'someId',
    });
    const { getByText, getByTestId } = render(<Withdraw />);
    const button = getByText('BRL');

    fireEvent.press(button);

    await waitFor(() => {
      const loadingModal = getByTestId('loading-url-modal');
      expect(loadingModal).toBeOnTheScreen();
    });

    await waitFor(() => {
      const openUrlModal = getByTestId('open-url-modal');
      expect(openUrlModal).toBeOnTheScreen();
      // expect(Linking.openURL).toHaveBeenCalledWith('http://anchor.brl');
    });
  });

  it('Should call handleOnPress when EURC button is pressed', async () => {
    (anchor.getInteractiveWithdrawUrl as jest.Mock).mockResolvedValue({
      url: 'http://anchor.eurc',
      type: 'withdraw',
      id: 'someId',
    });
    const { getByText, getByTestId } = render(<Withdraw />);
    const button = getByText('EURC');

    fireEvent.press(button);

    await waitFor(() => {
      const loadingModal = getByTestId('loading-url-modal');
      expect(loadingModal).toBeOnTheScreen();
    });

    await waitFor(() => {
      const openUrlModal = getByTestId('open-url-modal');
      expect(openUrlModal).toBeOnTheScreen();
      // expect(Linking.openURL).toHaveBeenCalledWith('http://anchor.eurc');
    });
  });
});
