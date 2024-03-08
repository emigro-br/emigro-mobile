import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { paymentStore } from '@stores/PaymentStore';

import { ReviewTransfer } from '../ReviewTransfer';

jest.mock('@stores/PaymentStore', () => ({
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
    pay: jest.fn(),
  },
}));

const navigationMock: any = {
  navigate: jest.fn(),
};

const routeMock: any = {};

describe('ReviewTransfer component', () => {
  test('Should render review transfer details', () => {
    const { getByText } = render(<ReviewTransfer navigation={navigationMock} route={routeMock} />);

    expect(getByText('Review Transfer')).toBeOnTheScreen();
    expect(getByText('You Pay')).toBeOnTheScreen();
    expect(getByText('100 XLM')).toBeOnTheScreen();
    expect(getByText('Recipient')).toBeOnTheScreen();
    expect(getByText('DDDDD...DDDDD')).toBeOnTheScreen();
    expect(getByText('Send')).toBeOnTheScreen();
  });

  test('Should call handlePress when Send button is pressed', async () => {
    // mock pay function
    (paymentStore.pay as jest.Mock).mockResolvedValue({ transactionHash: 'hash' });

    const { getByText } = render(<ReviewTransfer navigation={navigationMock} route={routeMock} />);
    const sendButton = getByText('Send');

    fireEvent.press(sendButton);

    expect(paymentStore.pay).toHaveBeenCalled();

    await waitFor(() => {
      expect(getByText('Sending...')).toBeDefined();
    });
  });

  // test('Should show error dialog when transaction fails', async () => {
  //   // mock pay function
  //   (paymentStore.pay as jest.Mock).mockRejectedValue(new Error('Error'));

  //   const { getByText } = render(
  //       <ReviewTransfer navigation={navigationMock} route={routeMock} />
  //   );
  //   const sendButton = getByText('Send');

  //   fireEvent.press(sendButton);

  //   await waitFor(() => {
  //     expect(getByText('Failed on execute transfer. Please try again.')).toBeDefined();
  //   });
  // });
});
