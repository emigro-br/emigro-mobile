import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';

import { inputPIN, render } from 'test-utils';

import { IPaymentResponse } from '@/types/IPaymentResponse';
import { IVendor } from '@/types/IVendor';
import { CryptoAsset } from '@/types/assets';

import { paymentStore } from '@stores/PaymentStore';

import { ConfirmPayment } from '../ConfirmPayment';

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    publicKey: 'mockPublicKey',
    verifyPin: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('@stores/BalanceStore', () => ({
  balanceStore: {
    get: jest.fn().mockReturnValue(100),
  },
}));

jest.mock('@services/emigro', () => ({
  handleQuote: jest.fn().mockResolvedValue(10),
}));

describe('ConfirmPayment component', () => {
  const mockNavigation: any = {
    popToTop: jest.fn(),
    navigate: jest.fn(),
  };

  const mockProps = {
    navigation: mockNavigation,
  };

  const mockScannedVendor: IVendor = {
    assetCode: CryptoAsset.USDC,
    amount: 10,
    name: 'John Doe',
    address: '123 Main St',
    publicKey: 'mokced-publicKey',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    paymentStore.setScannedPayment(mockScannedVendor);
  });

  it('renders the component correctly', async () => {
    const { getByText } = render(<ConfirmPayment {...mockProps} />);

    expect(getByText('Review the details of this payment')).toBeOnTheScreen();
    expect(getByText('Requested value')).toBeOnTheScreen();
    expect(getByText('10 US Dollar')).toBeOnTheScreen();
    expect(getByText('for John Doe')).toBeOnTheScreen();
    expect(getByText('Location: 123 Main St')).toBeOnTheScreen();
    expect(getByText('Select the account')).toBeOnTheScreen();
    expect(getByText('Balance: $ 100.00')).toBeOnTheScreen();
    expect(getByText('Pay')).toBeOnTheScreen();

    await waitFor(() => {
      // the quote is fetched and displayed
      expect(getByText('$ 10.00')).toBeOnTheScreen();
    });
  });

  it('calls the handlePressPay function when the "Pay" button is pressed', async () => {
    const setTransactionMock = jest.spyOn(paymentStore, 'setTransaction');
    const { getByText, getByTestId } = render(<ConfirmPayment {...mockProps} />);

    // wait the quote is fetched and displayed
    await waitFor(() => {
      expect(getByText('$ 10.00')).toBeOnTheScreen();
    });

    const payButton = getByText('Pay');
    fireEvent.press(payButton);

    expect(setTransactionMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(getByTestId('pin-screen')).toBeOnTheScreen();
    });
  });

  it('calls the handleConfirmPayment function when the PIN is successfully verified', async () => {
    const payMock = jest
      .spyOn(paymentStore, 'pay')
      .mockResolvedValue({ transactionHash: 'mockHash' } as IPaymentResponse);
    const { getByText, getByTestId } = render(<ConfirmPayment {...mockProps} />);

    // wait the quote is fetched and displayed
    await waitFor(() => {
      expect(getByText('$ 10.00')).toBeOnTheScreen();
    });

    const payButton = getByText('Pay');
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(getByTestId('pin-screen')).toBeOnTheScreen();
    });

    inputPIN('1234');

    await waitFor(() => {
      expect(getByTestId('success-modal')).toBeOnTheScreen(); // FIXME: it's always present
      expect(payMock).toHaveBeenCalled();
    });
  });

  it('displays an error message when the payment fails', async () => {
    const payMock = jest.spyOn(paymentStore, 'pay').mockRejectedValue(new Error('Payment failed'));
    const { getByText, getByTestId } = render(<ConfirmPayment {...mockProps} />);

    // wait the quote is fetched and displayed
    await waitFor(() => {
      expect(getByText('$ 10.00')).toBeOnTheScreen();
    });

    const payButton = getByText('Pay');
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(getByTestId('pin-screen')).toBeOnTheScreen();
    });

    inputPIN('1234');

    await waitFor(() => {
      expect(getByTestId('error-modal')).toBeOnTheScreen(); // FIXME: it's always present
      expect(payMock).toHaveBeenCalled();
    });
  });
});
