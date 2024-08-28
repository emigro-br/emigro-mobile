import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import mockConsole from 'jest-mock-console';

import { InvalidPixError, paymentStore } from '@/stores/PaymentStore';

import { PastePixCode } from '../copia-e-cola';

jest.mock('expo-clipboard', () => ({
  getStringAsync: jest.fn().mockResolvedValue(''),
}));

jest.mock('@/stores/PaymentStore', () => ({
  ...jest.requireActual('@/stores/PaymentStore'),
  paymentStore: {
    preview: jest.fn(),
    setScannedPayment: jest.fn(),
  },
}));

describe('PastePixCode', () => {
  let router: any;
  const validStaticBrCode =
    '00020126320014br.gov.bcb.pix0110random-key520400005303986540115802BR5904Test6006Cidade62070503***6304ACF0';

  beforeEach(() => {
    jest.clearAllMocks();
    router = useRouter();
  });

  it('should render the component correctly', () => {
    const { getByText, getByPlaceholderText } = render(<PastePixCode />);

    expect(getByText('Insert your Pix Copia & Cola code')).toBeOnTheScreen();
    expect(getByPlaceholderText('Paste your Pix code here')).toBeOnTheScreen();
    expect(getByText('Continue')).toBeOnTheScreen();
  });

  it('should only set the brCode state when text is pasted is valid', async () => {
    (Clipboard.getStringAsync as jest.Mock).mockResolvedValueOnce(validStaticBrCode);
    const { getByTestId } = render(<PastePixCode />);

    await waitFor(() => {
      expect(getByTestId('text-area').props.value).toBe(validStaticBrCode);
    });
  });

  it('should set the brCode when the clipboard value is invalid', async () => {
    const invalidBrCode = 'invalidPixCode';
    (Clipboard.getStringAsync as jest.Mock).mockResolvedValueOnce(invalidBrCode);
    const { getByTestId } = render(<PastePixCode />);

    await waitFor(() => {
      expect(getByTestId('text-area').props.value).toBe('');
    });
  });

  it('should set call preview payment for valid static brCode', async () => {
    const { getByTestId, getByText } = render(<PastePixCode />);

    fireEvent(getByTestId('text-area'), 'onChangeText', validStaticBrCode);
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(paymentStore.preview).toHaveBeenCalled();
      expect(paymentStore.setScannedPayment).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith('/payments/confirm');
    });
  });

  it('should set call preview payment for valid dynamic brCode', async () => {
    const dynamicBrCode =
      '00020126390014br.gov.bcb.pix2517https://fake.test5204000053039865802BR5903PIX6006Cidade62070503***63043BC8';
    const { getByTestId, getByText } = render(<PastePixCode />);

    fireEvent(getByTestId('text-area'), 'onChangeText', dynamicBrCode);
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(paymentStore.preview).toHaveBeenCalled();
      expect(paymentStore.setScannedPayment).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith('/payments/confirm');
    });
  });

  it('should display an error message for invalid Pix code', async () => {
    const invalidBrCode = 'invalidPixCode';
    const { getByTestId, getByText } = render(<PastePixCode />);
    jest.spyOn(paymentStore, 'preview').mockRejectedValueOnce(new InvalidPixError(invalidBrCode));

    fireEvent(getByTestId('text-area'), 'onChangeText', invalidBrCode);
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText('Invalid Pix code')).toBeOnTheScreen();
    });
  });

  it('should display an error message for any other error', async () => {
    const restoreConsole = mockConsole();
    const { getByTestId, getByText } = render(<PastePixCode />);
    jest.spyOn(paymentStore, 'preview').mockRejectedValueOnce(new Error('Any Error'));

    fireEvent(getByTestId('text-area'), 'onChangeText', validStaticBrCode);
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText('An error occurred while checking this payment')).toBeOnTheScreen();
    });
    restoreConsole();
  });
});
