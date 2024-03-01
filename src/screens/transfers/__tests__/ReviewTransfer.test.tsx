import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { Provider } from '@components/Provider';

import { paymentStore } from '@stores/PaymentStore';

import { ReviewTransfer } from '../ReviewTransfer';

jest.mock('@stores/PaymentStore', () => ({
  paymentStore: {
    transaction: {
      from: {
        wallet: 'fromWallet',
      },
      to: {
        wallet: 'toWallet',
        value: 100,
        asset: 'asset',
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
    const { getByText } = render(
      <Provider>
        <ReviewTransfer navigation={navigationMock} route={routeMock} />
      </Provider>,
    );

    expect(getByText('Review Transfer')).toBeDefined();
    expect(getByText('You Pay')).toBeDefined();
    expect(getByText('Recipient')).toBeDefined();
    expect(getByText('Send')).toBeDefined();
  });

  test('Should call handlePress when Send button is pressed', async () => {
    // mock pay function
    (paymentStore.pay as jest.Mock).mockResolvedValue({ transactionHash: 'hash' });

    const { getByText } = render(
      <Provider>
        <ReviewTransfer navigation={navigationMock} route={routeMock} />
      </Provider>,
    );
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
  //     <Provider>
  //       <ReviewTransfer navigation={navigationMock} route={routeMock} />
  //     </Provider>
  //   );
  //   const sendButton = getByText('Send');

  //   fireEvent.press(sendButton);

  //   await waitFor(() => {
  //     expect(getByText('Failed on execute transfer. Please try again.')).toBeDefined();
  //   });
  // });
});
