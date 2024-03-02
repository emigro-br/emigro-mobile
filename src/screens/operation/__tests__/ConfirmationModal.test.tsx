import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { Sep24Transaction } from '@/types/Sep24Transaction';
import { TransactionStatus } from '@/types/TransactionStatus';

import { ConfirmationModal } from '../modals/ConfirmationModal';

const mockTransaction: Sep24Transaction = {
  amount_in: '100',
  amount_fee: '1',
  amount_out: '99',
  completed_at: '2022-01-01T00:00:00Z',
  external_transaction_id: '123',
  from: 'test',
  id: '1',
  kind: 'withdrawal',
  status: TransactionStatus.COMPLETED,
  to: 'test',
  message: '',
  more_info_url: '',
  refunded: false,
  started_at: '',
  status_eta: null,
  stellar_transaction_id: null,
  withdraw_anchor_account: '',
  withdraw_memo: '',
  withdraw_memo_type: '',
};

describe('ConfirmationModal', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <ConfirmationModal
        isVisible
        assetCode="USD"
        transaction={mockTransaction}
        onPress={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    expect(getByText('Confirm the transaction')).toBeOnTheScreen();
    expect(getByText('Are you sure you want to withdraw?')).toBeOnTheScreen();
    expect(getByText('Requested: 100 USD')).toBeOnTheScreen();
    expect(getByText('Fee: 1 USD')).toBeTruthy();
    expect(getByText('You will receive: 99 USD')).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('calls onPress when the Confirm button is pressed', async () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ConfirmationModal
        isVisible
        assetCode="USD"
        transaction={mockTransaction}
        onPress={onPress}
        onClose={jest.fn()}
      />,
    );
    fireEvent.press(getByText('Confirm'));

    await waitFor(() => {
      expect(onPress).toHaveBeenCalled();
    });
  });

  it('calls onClose when the Cancel button is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <ConfirmationModal
        isVisible
        assetCode="USD"
        transaction={mockTransaction}
        onPress={jest.fn()}
        onClose={onClose}
      />,
    );
    fireEvent.press(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a loading modal when processing', async () => {
    const { getByText, getByTestId } = render(
      <ConfirmationModal
        isVisible
        assetCode="USD"
        transaction={mockTransaction}
        onPress={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    fireEvent.press(getByText('Confirm'));

    await waitFor(() => {
      expect(getByTestId('loading-modal')).toBeOnTheScreen();
    });
  });
});
