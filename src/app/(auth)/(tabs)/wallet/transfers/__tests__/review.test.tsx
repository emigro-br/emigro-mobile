import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import { TransferTransaction, transferStore } from '@/stores/TransferStore';
import { CryptoAsset } from '@/types/assets';

import { ReviewTransfer } from '../review';

jest.mock('@/stores/SecurityStore', () => ({
  securityStore: {
    verifyPin: jest.fn(),
  },
}));

describe('ReviewTransfer', () => {
  const transaction: TransferTransaction = {
    destinationAddress: 'D'.repeat(56),
    amount: 100,
    asset: CryptoAsset.XLM,
  };

  beforeEach(() => {
    transferStore.setTransfer(transaction);
  });

  test('Should render review transfer details', () => {
    const { getByText } = render(<ReviewTransfer />);

    expect(getByText('Review Transfer')).toBeOnTheScreen();
    expect(getByText('You Pay')).toBeOnTheScreen();
    expect(getByText('100 XLM')).toBeOnTheScreen();
    expect(getByText('Recipient')).toBeOnTheScreen();
    expect(getByText('DDDDD...DDDDD')).toBeOnTheScreen();
    expect(getByText('Send')).toBeOnTheScreen();
  });

  test('Should goes to confirm with PIN when Send button is pressed', async () => {
    const router = useRouter();

    const { getByText } = render(<ReviewTransfer />);
    const sendButton = getByText('Send');

    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('./confirm');
    });
  });
});
