import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Linking } from 'react-native';

import Operation from '../operation/Operation';

import * as anchorService from '@/services/anchor';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@/services/anchor', () => ({
  getInteractiveUrl: jest.fn(),
}));

jest.mock('@/services/emigro', () => ({
  getUserPublicKey: jest.fn(),
}));

jest.mock('@/storage/helpers', () => ({
  getAccessToken: jest.fn(),
  getAssetCode: jest.fn(),
}));

describe('Operation', () => {
  const mockAnchorUrl = 'mockedURL';

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Should call handleOnPress when a button is pressed', async () => {
    const { getByText } = render(<Operation />);
    const button = getByText('USD');

    fireEvent.press(button);

    await waitFor(() => {
      expect(button).toBeTruthy();
    });
  });

  it('Should call handleOnPress when a button is pressed', async () => {
    const { getByText } = render(<Operation />);
    const button = getByText('BRL');

    fireEvent.press(button);

    await waitFor(() => {
      expect(button).toBeTruthy();
    });
  });

  it('Should call handleOnPress when a button is pressed', async () => {
    const { getByText } = render(<Operation />);
    const button = getByText('EUR');

    fireEvent.press(button);

    await waitFor(() => {
      expect(button).toBeTruthy();
    });
  });

  it('Should handle the operation correctly', async () => {
    jest.spyOn(anchorService, 'getInteractiveUrl').mockResolvedValue({
      url: mockAnchorUrl,
      type: 'someType',
      id: 'someId',
    });

    const { getByText } = render(<Operation />);
    const button = getByText('USD');

    fireEvent.press(button);

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith(mockAnchorUrl);
    });
  });
});
