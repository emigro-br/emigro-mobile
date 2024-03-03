import React from 'react';
import { Linking } from 'react-native';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import * as anchor from '@services/anchor';

import Withdraw from '../Withdraw';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@services/anchor', () => ({
  getInteractiveUrl: jest.fn(),
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
    accessToken: 'someAccessToken',
    publicKey: 'somePublicKey',
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

  it('Should render correctly', async () => {
    const { queryByText } = render(<Withdraw />);

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
    (anchor.getInteractiveUrl as jest.Mock).mockResolvedValue({
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
      expect(Linking.openURL).toHaveBeenCalledWith('http://anchor.ars');
    });
  });

  it('Should call handleOnPress when BRL button is pressed', async () => {
    (anchor.getInteractiveUrl as jest.Mock).mockResolvedValue({
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
      expect(Linking.openURL).toHaveBeenCalledWith('http://anchor.brl');
    });
  });

  it('Should call handleOnPress when EURC button is pressed', async () => {
    (anchor.getInteractiveUrl as jest.Mock).mockResolvedValue({
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
      expect(Linking.openURL).toHaveBeenCalledWith('http://anchor.eurc');
    });
  });
});
