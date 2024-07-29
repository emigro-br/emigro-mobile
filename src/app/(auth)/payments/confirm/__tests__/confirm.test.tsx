import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { inputPIN, render } from 'test-utils';

import * as quotesService from '@/services/emigro/quotes';
import { Transaction } from '@/services/emigro/types';
import { balanceStore } from '@/stores/BalanceStore';
import { paymentStore } from '@/stores/PaymentStore';
import { Payment, PixPayment } from '@/types/PixPayment';
import { CryptoAsset } from '@/types/assets';

import { ConfirmPayment } from '..';

jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    publicKey: 'mockPublicKey',
  },
}));

jest.mock('@/stores/SecurityStore', () => ({
  securityStore: {
    pin: '1234',
    verifyPin: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('@/stores/BalanceStore', () => ({
  balanceStore: {
    get: jest.fn().mockReturnValue(100),
    currentAssets: jest.fn().mockReturnValue([]),
  },
}));

describe('ConfirmPayment component', () => {
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
    jest.useFakeTimers();
    paymentStore.setScannedPayment(mockScannedPayment);
  });

  it('renders correctly for stellar payment', async () => {
    paymentStore.setScannedPayment(mockScannedPayment); // for full test coverage
    jest.spyOn(quotesService, 'fetchQuote');
    // const { getByText, queryByText, queryAllByText } = render(<ConfirmPayment />);
    const screen = render(<ConfirmPayment />);

    // receiver info
    // expect(getByText('Review the payment')).toBeOnTheScreen();
    // expect(queryAllByText('$ 10.00')).toHaveLength(2); // the amount is displayed twice
    // expect(getByText('for John Doe')).toBeOnTheScreen();
    // expect(getByText('in 123 Main St')).toBeOnTheScreen();

    // // stellar info
    // expect(getByText('Institution:')).toBeOnTheScreen();
    // expect(getByText('Stellar Network')).toBeOnTheScreen();
    // expect(getByText('Wallet Key:')).toBeOnTheScreen();
    // expect(getByText('mocke...etkey')).toBeOnTheScreen(); // masked
    // // expect(getByText('Identifier:')).toBeOnTheScreen();

    // // not pix info
    // expect(queryByText('CPF/CNPJ:')).toBeNull();

    // // payment
    // expect(getByText('Select the account')).toBeOnTheScreen();
    // expect(getByText('Balance: $ 100.00')).toBeOnTheScreen();
    // expect(getByText('Pay')).toBeOnTheScreen();

    expect(screen.toJSON()).toMatchSnapshot();

    expect(quotesService.fetchQuote).not.toHaveBeenCalled();
  });

  it('renders correctly for pix payment', async () => {
    paymentStore.setScannedPayment(mockPixPayment); // for full test coverage
    jest.spyOn(quotesService, 'fetchQuote');
    // const { getByText, queryByText, queryAllByText } = render(<ConfirmPayment />);
    const screen = render(<ConfirmPayment />);

    // receiver info
    // expect(getByText('Review the payment')).toBeOnTheScreen();
    // expect(queryAllByText('$ 10.00')).toHaveLength(2); // the amount is displayed twice
    // expect(getByText('for John Doe')).toBeOnTheScreen();
    // expect(getByText('in 123 Main St')).toBeOnTheScreen();

    // // pix info
    // expect(getByText('Pix Key:')).toBeOnTheScreen();
    // expect(getByText('mocked-pixkey')).toBeOnTheScreen();
    // expect(getByText('Identifier:')).toBeOnTheScreen();
    // expect(getByText('mocked-identifier')).toBeOnTheScreen();
    // expect(getByText('CPF/CNPJ:')).toBeOnTheScreen();
    // expect(getByText('mocked-taxId')).toBeOnTheScreen();
    // expect(getByText('Institution:')).toBeOnTheScreen();
    // expect(getByText('Mock Bank')).toBeOnTheScreen();

    // // not stellar
    // expect(queryByText('Wallet Key:')).toBeNull();

    // // payment
    // expect(getByText('Select the account')).toBeOnTheScreen();
    // expect(getByText('Balance: $ 100.00')).toBeOnTheScreen();
    // expect(getByText('Pay')).toBeOnTheScreen();

    expect(screen.toJSON()).toMatchSnapshot();
    expect(quotesService.fetchQuote).not.toHaveBeenCalled();
  });

  it('should quote when change the asset', async () => {
    jest
      .spyOn(quotesService, 'fetchQuote')
      .mockResolvedValueOnce({ source_amount: 99 } as quotesService.IQuoteResponse);
    jest.spyOn(balanceStore, 'get').mockReturnValue(50); // enough balance

    const { getByTestId } = render(<ConfirmPayment />);
    const select = getByTestId('select-account');
    fireEvent(select, 'onChange', { value: 'BRZ' });

    await waitFor(() => {
      expect(getByTestId('balance')).toHaveTextContent('Balance: R$ 50.00');
    });

    await waitFor(() => {
      expect(quotesService.fetchQuote).toHaveBeenCalledWith({
        from: CryptoAsset.BRZ,
        to: CryptoAsset.USDC,
        amount: mockPixPayment.transactionAmount.toString(),
        type: 'strict_receive',
      });
    });
    expect(getByTestId('quote')).toHaveTextContent('R$ 99.00');
  });

  it('should open the edit amount when the "edit" is pressed', async () => {
    const mockPixZeroAmount = { ...mockPixPayment, transactionAmount: 0 };
    paymentStore.setScannedPayment(mockPixZeroAmount); // for full test coverage
    const { getByText, getByTestId } = render(<ConfirmPayment />);
    expect(getByTestId('amount')).toHaveTextContent('$ 0.00');
    const edit = getByText('Edit');
    expect(edit).toBeOnTheScreen();

    fireEvent.press(edit);

    await waitFor(() => {
      expect(getByTestId('input-amount-action-sheet')).toBeOnTheScreen();
    });
  });

  it('calls the handlePressPay function when the "Pay" button is pressed', async () => {
    const setTransactionMock = jest.spyOn(paymentStore, 'setTransaction');
    const { getByText, getByTestId } = render(<ConfirmPayment />);

    const payButton = getByText('Pay');
    fireEvent.press(payButton);

    expect(setTransactionMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(getByTestId('pin-screen')).toBeOnTheScreen();
    });
  });

  it('goes to success screen when the PIN is verified and payment was successfully', async () => {
    const router = useRouter();
    const payMock = jest.spyOn(paymentStore, 'pay').mockResolvedValue({ status: 'paid' } as Transaction);
    const { getByText, getByTestId } = render(<ConfirmPayment />);

    const payButton = getByText('Pay');
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(getByTestId('pin-screen')).toBeOnTheScreen();
    });

    inputPIN('1234');

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/<path>/success');
      expect(payMock).toHaveBeenCalled();
    });
  });

  it('goes to waiting screen when the payment is processing', async () => {
    const router = useRouter();
    const payMock = jest.spyOn(paymentStore, 'pay').mockResolvedValue({ status: 'pending' } as Transaction);
    const { getByText, getByTestId } = render(<ConfirmPayment />);

    const payButton = getByText('Pay');
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(getByTestId('pin-screen')).toBeOnTheScreen();
    });

    inputPIN('1234');

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/<path>/waiting');
      expect(payMock).toHaveBeenCalled();
    });
  });

  it('goes to error screen when the payment fails', async () => {
    const router = useRouter();
    const payMock = jest.spyOn(paymentStore, 'pay').mockRejectedValue(new Error('Payment failed'));
    const { getByText, getByTestId } = render(<ConfirmPayment />);

    const payButton = getByText('Pay');
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(getByTestId('pin-screen')).toBeOnTheScreen();
    });

    inputPIN('1234');

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/<path>/error',
        params: { error: 'Payment failed' },
      });
      expect(payMock).toHaveBeenCalled();
    });
  });
});
