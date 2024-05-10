import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { paymentStore } from '@/stores/PaymentStore';

import { SendAsset } from '../SendAsset';

jest.mock('expo-clipboard');

jest.mock('@/stores/BalanceStore', () => ({
  balanceStore: {
    get: jest.fn().mockReturnValue(100),
  },
}));

jest.mock('@/stores/PaymentStore', () => ({
  paymentStore: {
    setTransfer: jest.fn(),
  },
}));

const navigationMock: any = {
  navigate: jest.fn(),
};

const routeMock: any = {
  params: {
    asset: 'XLM',
  },
};

const validAddress = 'G'.repeat(56);

describe('SendAsset component', () => {
  test('Should render SendAsset component', () => {
    const { getByText, getByPlaceholderText } = render(<SendAsset navigation={navigationMock} route={routeMock} />);

    expect(getByText('Send XLM')).toBeDefined();
    expect(getByPlaceholderText('Enter the wallet address here')).toBeDefined();
    expect(getByText('Continue')).toBeDefined();
  });

  test('Should show form error when balance exceeds', () => {
    const { getByText, getByPlaceholderText } = render(<SendAsset navigation={navigationMock} route={routeMock} />);

    const amountInput = getByPlaceholderText('0 XLM');
    fireEvent.changeText(amountInput, '9999999999999');

    const formError = getByText('Exceeds Balance');
    expect(formError).toBeOnTheScreen();
  });

  test('Should show not form error when balance not exceeds', () => {
    const { queryByText, getByPlaceholderText } = render(<SendAsset navigation={navigationMock} route={routeMock} />);

    const amountInput = getByPlaceholderText('0 XLM');
    fireEvent.changeText(amountInput, '1');

    expect(queryByText('Exceeds Balance')).toBeNull();
  });

  test('Should show form error when address is invalid', () => {
    const { getByText, getByPlaceholderText } = render(<SendAsset navigation={navigationMock} route={routeMock} />);

    const addressInput = getByPlaceholderText('Enter the wallet address here');
    fireEvent.changeText(addressInput, 'invalidAddress');

    const formError = getByText('A valid wallet is required');
    expect(formError).toBeOnTheScreen();
  });

  test('Should not show form error when address is valid', () => {
    const { queryByText, getByPlaceholderText } = render(<SendAsset navigation={navigationMock} route={routeMock} />);

    const addressInput = getByPlaceholderText('Enter the wallet address here');

    fireEvent.changeText(addressInput, validAddress);

    expect(queryByText('A valid wallet is required')).toBeNull();
  });

  test('Should enable and call handler when Continue button is pressed', () => {
    const { getByText, getByPlaceholderText } = render(<SendAsset navigation={navigationMock} route={routeMock} />);

    const addressInput = getByPlaceholderText('Enter the wallet address here');
    const amountInput = getByPlaceholderText('0 XLM');
    const continueButton = getByText('Continue');

    fireEvent.changeText(addressInput, validAddress);
    fireEvent.changeText(amountInput, '50.00');
    fireEvent.press(continueButton);

    expect(paymentStore.setTransfer).toHaveBeenCalledWith(50, 'XLM', validAddress);
    expect(navigationMock.navigate).toHaveBeenCalledWith('ReviewTransfer');
  });
});
