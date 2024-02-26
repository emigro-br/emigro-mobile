import React from 'react';
import { Linking } from 'react-native';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import Operation from '../operation/Operation';

jest.mock('expo-clipboard');
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@services/anchor', () => ({
  getInteractiveUrl: jest.fn().mockResolvedValue({
    url: 'http://mock.url', // do not use variables here
    type: 'withdraw',
    id: 'someId',
  }),
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

jest.mock('@stores/OperationStore', () => ({
  operationStore: {
    operation: {
      type: 'withdraw',
    },
    setOperationType: jest.fn(),
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

  it('Should call handleOnPress when a button is pressed', async () => {
    const { getByText } = render(<Operation />);
    const button = getByText('USD');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('http://mock.url');
    });
  });

  it('Should call handleOnPress when a button is pressed', async () => {
    const { getByText } = render(<Operation />);
    const button = getByText('BRL');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('http://mock.url');
    });
  });

  it('Should call handleOnPress when a button is pressed', async () => {
    const { getByText } = render(<Operation />);
    const button = getByText('EUR');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('http://mock.url');
    });
  });

  it('Should handle the operation correctly', async () => {
    const { getByText } = render(<Operation />);
    const button = getByText('USD');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('http://mock.url');
    });
  });
});
