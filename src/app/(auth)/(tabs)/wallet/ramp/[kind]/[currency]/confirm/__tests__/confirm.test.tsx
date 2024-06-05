import React from 'react';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { Sep24Transaction, Sep24TransactionStatus } from '@/services/emigro/types';
import { CryptoAsset } from '@/types/assets';

import { WithdrawlConfirm } from '..';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

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
