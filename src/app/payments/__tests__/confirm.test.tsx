import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';

import { inputPIN, render } from 'test-utils';

import { Payment, PixPayment } from '@/types/PixPayment';
import { CryptoAsset } from '@/types/assets';

import * as quotesService from '@services/emigro/quotes';
import { PaymentResponse } from '@services/emigro/types';

import { paymentStore } from '@stores/PaymentStore';

import { ConfirmPayment } from '../confirm';

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

describe('ConfirmPayment component', () => {
  const mockNavigation: any = {
    popToTop: jest.fn(),
    navigate: jest.fn(),
  };

  const mockProps = {
    navigation: mockNavigation,
  };

  const mockScannedPayment: Payment = {
    brCode: 'mocked-brCode',
    assetCode: CryptoAsset.USDC,
    transactionAmount: 10,
    merchantName: 'John Doe',
    merchantCity: '123 Main St',
    walletKey: 'mocked-walletkey',
  };

  const mockPixPayment: PixPayment = {
    assetCode: CryptoAsset.USDC,
    transactionAmount: 10,
    merchantName: 'John Doe',
    merchantCity: '123 Main St',
    pixKey: 'mocked-pixkey',
    // pix fields
    brCode: 'mocked-brCode',
    txid: 'mocked-identifier',
    taxId: 'mocked-taxId',
    bankName: 'Mock Bank',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    paymentStore.setScannedPayment(mockScannedPayment);
  });

  it('renders correctly for stellar payment', async () => {
    paymentStore.setScannedPayment(mockScannedPayment); // for full test coverage
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ source_amount: 10 } as quotesService.IQuoteResponse);
    const { getByText, queryByText } = render(<ConfirmPayment {...mockProps} />);

    // receiver info
    expect(getByText('Review the payment')).toBeOnTheScreen();
    expect(getByText('$ 10.00')).toBeOnTheScreen();
    expect(getByText('for John Doe')).toBeOnTheScreen();
    expect(getByText('in 123 Main St')).toBeOnTheScreen();

    // stellar info
    expect(getByText('Institution:')).toBeOnTheScreen();
    expect(getByText('Stellar Network')).toBeOnTheScreen();
    expect(getByText('Wallet Key:')).toBeOnTheScreen();
    expect(getByText('mocke...etkey')).toBeOnTheScreen(); // masked
    // expect(getByText('Identifier:')).toBeOnTheScreen();

    // not pix info
    expect(queryByText('CPF/CNPJ:')).toBeNull();

    // payment
    expect(getByText('Select the account')).toBeOnTheScreen();
    expect(getByText('Balance: $ 100.00')).toBeOnTheScreen();
    expect(getByText('Pay')).toBeOnTheScreen();

    await waitFor(() => {
      // the quote is fetched and displayed
      expect(getByText('$ 10.00')).toBeOnTheScreen();
    });
  });

  it('renders correctly for pix payment', async () => {
    paymentStore.setScannedPayment(mockPixPayment); // for full test coverage
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ source_amount: 10 } as quotesService.IQuoteResponse);
    const { getByText, queryByText } = render(<ConfirmPayment {...mockProps} />);

    // receiver info
    expect(getByText('Review the payment')).toBeOnTheScreen();
    expect(getByText('$ 10.00')).toBeOnTheScreen();
    expect(getByText('for John Doe')).toBeOnTheScreen();
    expect(getByText('in 123 Main St')).toBeOnTheScreen();

    // pix info
    expect(getByText('Pix Key:')).toBeOnTheScreen();
    expect(getByText('mocked-pixkey')).toBeOnTheScreen();
    expect(getByText('Identifier:')).toBeOnTheScreen();
    expect(getByText('mocked-identifier')).toBeOnTheScreen();
    expect(getByText('CPF/CNPJ:')).toBeOnTheScreen();
    expect(getByText('mocked-taxId')).toBeOnTheScreen();
    expect(getByText('Institution:')).toBeOnTheScreen();
    expect(getByText('Mock Bank')).toBeOnTheScreen();

    // not stellar
    expect(queryByText('Wallet Key:')).toBeNull();

    // payment
    expect(getByText('Select the account')).toBeOnTheScreen();
    expect(getByText('Balance: $ 100.00')).toBeOnTheScreen();
    expect(getByText('Pay')).toBeOnTheScreen();

    await waitFor(() => {
      // the quote is fetched and displayed
      expect(getByText('$ 10.00')).toBeOnTheScreen();
    });
  });

  it('should open the edit amount when the "edit" is pressed', async () => {
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ source_amount: 10 } as quotesService.IQuoteResponse);
    const mockPixZeroAmount = { ...mockPixPayment, transactionAmount: 0 };
    paymentStore.setScannedPayment(mockPixZeroAmount); // for full test coverage
    const { getByText, getByTestId } = render(<ConfirmPayment {...mockProps} />);
    expect(getByText('$ 0.00')).toBeOnTheScreen();
    const edit = getByText('Edit');
    expect(edit).toBeOnTheScreen();

    fireEvent.press(edit);

    await waitFor(() => {
      expect(getByTestId('input-amount-action-sheet')).toBeOnTheScreen();
    });
  });

  it('calls the handlePressPay function when the "Pay" button is pressed', async () => {
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ source_amount: 10 } as quotesService.IQuoteResponse);
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
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ source_amount: 10 } as quotesService.IQuoteResponse);
    const payMock = jest
      .spyOn(paymentStore, 'pay')
      .mockResolvedValue({ transactionHash: 'mockHash' } as PaymentResponse);
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
      // expect(getByText('Processing...')).toBeOnTheScreen(); // FIXME: changed to success, too fast to see it
      expect(getByTestId('success-modal')).toBeOnTheScreen(); // FIXME: it's always present
      expect(payMock).toHaveBeenCalled();
    });
  });

  it('displays an error message when the payment fails', async () => {
    jest
      .spyOn(quotesService, 'handleQuote')
      .mockResolvedValueOnce({ source_amount: 10 } as quotesService.IQuoteResponse);
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
