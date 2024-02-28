import React from 'react';
import { Linking } from 'react-native';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import * as anchor from '@services/anchor';

import Operation from '../operation/Operation';

jest.mock('expo-clipboard');
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
    session: null,
    getAccessToken: jest.fn().mockReturnValue('someToken'),
  },
}));

describe('Operation', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // Please, keep this to avoid act() warning
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('Should render correctly', async () => {
    const { queryByText } = render(<Operation />);

    expect(queryByText('ARS')).toBeDefined();
    expect(queryByText('BRL')).toBeDefined();
    expect(queryByText('EURC')).toBeDefined();
    expect(queryByText('USDC')).toBeNull();
    expect(queryByText('XML')).toBeNull();
  });

  it('Should call handleOnPress when ARS button is pressed', async () => {
    (anchor.getInteractiveUrl as jest.Mock).mockResolvedValue({
      url: 'http://anchor.ars',
      type: 'withdraw',
      id: 'someId',
    });
    const { getByText } = render(<Operation />);
    const button = getByText('ARS');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('http://anchor.ars');
    });
  });

  it('Should call handleOnPress when BRL button is pressed', async () => {
    (anchor.getInteractiveUrl as jest.Mock).mockResolvedValue({
      url: 'http://anchor.brl',
      type: 'withdraw',
      id: 'someId',
    });
    const { getByText } = render(<Operation />);
    const button = getByText('BRL');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('http://anchor.brl');
    });
  });

  it('Should call handleOnPress when EURC button is pressed', async () => {
    (anchor.getInteractiveUrl as jest.Mock).mockResolvedValue({
      url: 'http://anchor.eurc',
      type: 'withdraw',
      id: 'someId',
    });
    const { getByText } = render(<Operation />);
    const button = getByText('EURC');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('http://anchor.eurc');
    });
  });
});
