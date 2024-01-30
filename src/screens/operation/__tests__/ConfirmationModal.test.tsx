import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { Sep24Transaction } from '@/types/Sep24Transaction';
import { TransactionStatus } from '@/types/TransactionStatus';

const mockTransaction: Sep24Transaction = {
    amount_in: '100',
    amount_fee: '1',
    amount_out: '99',
    completed_at: '2022-01-01T00:00:00Z',
    external_transaction_id: '123',
    from: 'test',
    id: '1',
    kind: 'withdraw',
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
    withdraw_memo_type: ''
};

describe('ConfirmationModal', () => {
    it('renders correctly', () => {
        const { getByText } = render(
            <ConfirmationModal 
                isVisible={true} 
                assetCode="USD" 
                transaction={mockTransaction} 
                onPress={jest.fn()} 
                onClose={jest.fn()} 
            />
        );
        expect(getByText('Confirm the transaction')).toBeTruthy();
        expect(getByText('Are you sure you want to withdraw?')).toBeTruthy();
        expect(getByText('Requested: 100 USD')).toBeTruthy();
        expect(getByText('Fee: 1 USD')).toBeTruthy();
        expect(getByText('You will receive: 99 USD')).toBeTruthy();
        expect(getByText('Confirm')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
    });

    it('calls onPress when the Confirm button is pressed', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <ConfirmationModal 
                isVisible={true} 
                assetCode="USD" 
                transaction={mockTransaction} 
                onPress={onPress} 
                onClose={jest.fn()} 
            />
        );
        fireEvent.press(getByText('Confirm'));
        expect(onPress).toHaveBeenCalled();
    });

    it('calls onClose when the Cancel button is pressed', () => {
        const onClose = jest.fn();
        const { getByText } = render(
            <ConfirmationModal 
                isVisible={true} 
                assetCode="USD" 
                transaction={mockTransaction} 
                onPress={jest.fn()} 
                onClose={onClose} 
            />
        );
        fireEvent.press(getByText('Cancel'));
        expect(onClose).toHaveBeenCalled();
    });

    it('shows a loading modal when processing', () => {
        const { getByText } = render(
            <ConfirmationModal 
                isVisible={true} 
                assetCode="USD" 
                transaction={mockTransaction} 
                onPress={jest.fn()} 
                onClose={jest.fn()} 
            />
        );
        fireEvent.press(getByText('Confirm'));
        expect(getByText('Processing...')).toBeTruthy();
    });
});
