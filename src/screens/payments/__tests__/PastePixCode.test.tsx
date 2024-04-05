import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { paymentStore } from '@stores/PaymentStore';

import { PastePixCode } from '../PastePixCode';

jest.mock('expo-clipboard', () => ({
  getStringAsync: jest.fn(),
}));

jest.mock('@stores/PaymentStore', () => ({
  paymentStore: {
    previewPixPayment: jest.fn(),
    setScannedPayment: jest.fn(),
  },
}));

describe('PastePixCode', () => {
  const validBrCode =
    '00020126320014br.gov.bcb.pix0110random-key520400005303986540115802BR5904Test6006Cidade62070503***6304ACF0';
  const navigationMock: any = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component correctly', () => {
    const { getByText, getByPlaceholderText } = render(<PastePixCode navigation={navigationMock} />);

    expect(getByText('Insert your Pix Copia & Cola code')).toBeOnTheScreen();
    expect(getByPlaceholderText('Paste your Pix code here')).toBeOnTheScreen();
    expect(getByText('Continue')).toBeOnTheScreen();
  });

  it('should only set the brCode state when text is pasted is valid', async () => {
    (Clipboard.getStringAsync as jest.Mock).mockResolvedValueOnce(validBrCode);
    const { getByTestId } = render(<PastePixCode navigation={navigationMock} />);

    await waitFor(() => {
      expect(getByTestId('text-area').props.value).toBe(validBrCode);
    });
  });

  it('should set the brCode when the clipboard value is invalid', async () => {
    const invalidBrCode = 'invalidPixCode';
    (Clipboard.getStringAsync as jest.Mock).mockResolvedValueOnce(invalidBrCode);
    const { getByTestId } = render(<PastePixCode navigation={navigationMock} />);

    await waitFor(() => {
      expect(getByTestId('text-area').props.value).toBe('');
    });
  });

  it('should set call preview payment for valid brCode', async () => {
    const { getByTestId, getByText } = render(<PastePixCode navigation={navigationMock} />);

    fireEvent(getByTestId('text-area'), 'onChangeText', validBrCode);
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(paymentStore.previewPixPayment).toHaveBeenCalled();
      expect(paymentStore.setScannedPayment).toHaveBeenCalled();
      expect(navigationMock.push).toHaveBeenCalledWith('ConfirmPayment');
    });
  });

  it('should display an error message for invalid Pix code', async () => {
    const invalidBrCode = 'invalidPixCode';
    const { getByTestId, getByText } = render(<PastePixCode navigation={navigationMock} />);

    fireEvent(getByTestId('text-area'), 'onChangeText', invalidBrCode);
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText('Invalid Pix code')).toBeOnTheScreen();
      expect(paymentStore.previewPixPayment).not.toHaveBeenCalled();
    });
  });

  it('should display an error message for dynamic Pix code', async () => {
    const dynamicBrCode =
      '00020126390014br.gov.bcb.pix2517https://fake.test5204000053039865802BR5903PIX6006Cidade62070503***63043BC8';
    const { getByTestId, getByText } = render(<PastePixCode navigation={navigationMock} />);

    fireEvent(getByTestId('text-area'), 'onChangeText', dynamicBrCode);
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText('Dynamic Pix code is not supported yet')).toBeOnTheScreen();
      expect(paymentStore.previewPixPayment).not.toHaveBeenCalled();
    });
  });
});
