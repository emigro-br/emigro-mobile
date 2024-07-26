import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import mockConsole from 'jest-mock-console';

import { render } from 'test-utils';

import * as anchors from '@/services/emigro/anchors';
import { Sep24Transaction, Sep24TransactionStatus } from '@/services/emigro/types';
import { CryptoAsset } from '@/types/assets';

import { WithdrawlConfirm, WithdrawlConfirmScreen } from '..';

jest.mock('@/services/emigro/anchors', () => ({
  getTransaction: jest.fn(() => Promise.resolve({ id: 'transactionId', status: 'pending_user_transfer_start' })),
  confirmWithdraw: jest.fn(() => Promise.resolve()),
}));

describe('WithdrawlConfirmScreen', () => {
  let router: any;

  beforeEach(() => {
    jest.clearAllMocks();
    router = useRouter();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ asset: CryptoAsset.USDC, id: 'transactionId' });
  });

  it('should render loading screen when transaction is null', () => {
    (anchors.getTransaction as jest.Mock).mockResolvedValueOnce(null);
    const { getByTestId } = render(<WithdrawlConfirmScreen />);
    expect(getByTestId('loading-screen')).toBeOnTheScreen();
  });

  it('should render WithdrawlConfirm when transaction is not null', async () => {
    const { findByTestId } = render(<WithdrawlConfirmScreen />);
    await waitFor(() => expect(anchors.getTransaction).toHaveBeenCalled());

    const withdrawlConfirm = await findByTestId('confirm-button');
    expect(withdrawlConfirm).toBeOnTheScreen();
  });

  it('should call confirmWithdraw and navigate to success screen on confirm button press', async () => {
    const { findByTestId } = render(<WithdrawlConfirmScreen />);
    const confirmButton = await findByTestId('confirm-button');

    fireEvent.press(confirmButton);

    expect(anchors.confirmWithdraw).toHaveBeenCalledWith({
      transactionId: 'transactionId',
      assetCode: CryptoAsset.USDC,
    });
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/<path>/success'));
  });

  it('should navigate to error screen on confirmWithdraw error', async () => {
    const restoreConsole = mockConsole();
    (anchors.confirmWithdraw as jest.Mock).mockRejectedValueOnce(new Error('Error'));
    const { findByTestId } = render(<WithdrawlConfirmScreen />);
    const confirmButton = await findByTestId('confirm-button');

    fireEvent.press(confirmButton);

    expect(anchors.confirmWithdraw).toHaveBeenCalledWith({
      transactionId: 'transactionId',
      assetCode: CryptoAsset.USDC,
    });
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/<path>/error'));
    restoreConsole();
  });

  it('should navigate to previous screen on close button press', async () => {
    const { findByTestId } = render(<WithdrawlConfirmScreen />);
    const closeButton = await findByTestId('close-button');

    fireEvent.press(closeButton);

    expect(router.dismiss).toHaveBeenCalled();
  });
});

describe('WithdrawlConfirm component', () => {
  const mockAsset: CryptoAsset = CryptoAsset.USDC;
  const mockTransaction = {
    id: 'mock-transaction-id',
    amount_in: '100.01',
    amount_out: '100',
    amount_fee: '0.01',
    status: Sep24TransactionStatus.PENDING_USER_TRANSFER_START,
  } as Sep24Transaction;

  const mockOnConfirm = jest.fn();
  const mockOnClose = jest.fn();

  it('renders correctly', () => {
    const { getByText, getByTestId, getAllByText } = render(
      <WithdrawlConfirm
        asset={mockAsset}
        transaction={mockTransaction}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Withdrawing')).toBeOnTheScreen();
    expect(getByText('Amount')).toBeOnTheScreen();
    expect(getByText('$ 100.01')).toBeOnTheScreen();
    expect(getByText('Fee')).toBeOnTheScreen();
    expect(getByText('$ 0.01')).toBeOnTheScreen();
    expect(getByText('You will receive')).toBeOnTheScreen();
    expect(getAllByText('$ 100.00')).toHaveLength(2);
    expect(getByText('Transaction ID')).toBeOnTheScreen();
    expect(getByText('mock-transaction-id')).toBeOnTheScreen();
    expect(getByTestId('close-button')).toBeOnTheScreen();
    expect(getByTestId('confirm-button')).toBeOnTheScreen();
  });

  it('calls onConfirm when the confirm button is pressed', async () => {
    const { getByTestId } = render(
      <WithdrawlConfirm
        asset={mockAsset}
        transaction={mockTransaction}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
      />,
    );

    const confirmButton = getByTestId('confirm-button');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  it('calls onClose when the close button is pressed', () => {
    const { getByTestId } = render(
      <WithdrawlConfirm
        asset={mockAsset}
        transaction={mockTransaction}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
      />,
    );

    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
