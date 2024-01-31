import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import Operation from '../operation/Operation';
import { Linking } from 'react-native';

jest.mock('expo-clipboard');
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@/services/anchor', () => ({
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

jest.mock('@/services/emigro', () => ({
  getUserPublicKey: jest.fn().mockResolvedValue('somePublicKey'),
}));

jest.mock('@/storage/helpers', () => ({
  getAccessToken: jest.fn().mockResolvedValue('someToken'),
  getAssetCode: jest.fn(),
}));

jest.mock('@/store/operationStore', () => ({
  useOperationStore: jest.fn().mockReturnValue({
    operation: {
      type: 'withdraw',
    },
  }),
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
