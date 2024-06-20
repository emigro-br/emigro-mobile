import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import { ReviewTransfer } from '../review';

jest.mock('@/stores/SecurityStore', () => ({
  securityStore: {
    verifyPin: jest.fn(),
  },
}));

jest.mock('@/stores/PaymentStore', () => ({
  paymentStore: {
    transaction: {
      from: {
        wallet: 'F'.repeat(56),
      },
      to: {
        wallet: 'D'.repeat(56),
        value: 100,
        asset: 'XLM',
      },
    },
  },
}));

describe('ReviewTransfer', () => {
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
