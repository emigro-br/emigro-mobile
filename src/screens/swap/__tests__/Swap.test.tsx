import React from 'react';

import { NavigationProp } from '@react-navigation/native';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { CryptoAsset } from '@/types/assets';

import { RootStackParamList } from '@navigation/index';

import * as emigroService from '@services/emigro';

import { balanceStore } from '@stores/BalanceStore';
import { paymentStore } from '@stores/PaymentStore';

import { Swap } from '../Swap';

jest.mock('@/services/emigro', () => ({
  handleQuote: jest.fn().mockResolvedValue('1.0829'),
}));

const navigation = {
  navigate: jest.fn(),
} as unknown as NavigationProp<RootStackParamList, 'Swap'>;

describe('Swap component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  test('Should render Swap component correctly', async () => {
    const { getByText, getByTestId } = render(<Swap navigation={navigation} />);

    // check title
    const sellText = getByText(`Sell ${CryptoAsset.EURC}`);
    expect(sellText).toBeDefined();

    // check arrow icon
    const arrowIcon = getByTestId('arrowIcon');
    expect(arrowIcon).toBeDefined();

    await waitFor(() => {
      // check rate
      const buyText = getByText(`1 ${CryptoAsset.EURC} ≈ 1.082900 ${CryptoAsset.BRL}`);
      expect(buyText).toBeDefined();
      expect(emigroService.handleQuote).toHaveBeenCalledTimes(1);
    });
  });

  test('Should update sellValue and buyValue when onChangeValue is called', async () => {
    const { findAllByPlaceholderText } = render(<Swap navigation={navigation} />);

    const [sellInput, buyInput] = await findAllByPlaceholderText('0');

    fireEvent.changeText(sellInput, '10');

    await waitFor(() => {
      expect(sellInput.props.value).toBe('10');
    });

    await waitFor(() => {
      expect(buyInput.props.value).toBe('10.83');
    });
  });

  test('Should update bloc and navigate to DetailsSwap when button is pressed', async () => {
    const spy = jest.spyOn(paymentStore, 'setSwap');
    jest.spyOn(balanceStore, 'get').mockReturnValue(100); // enough balance

    const { getByText, findAllByPlaceholderText } = render(<Swap navigation={navigation} />);

    const [sellInput, buyInput] = await findAllByPlaceholderText('0');
    fireEvent.changeText(sellInput, '10');

    await waitFor(() => {
      expect(buyInput.props.value).toBe('10.83');
    });

    const button = getByText('Review order');
    fireEvent.press(button);

    const transaction = {
      from: CryptoAsset.EURC,
      fromValue: 10,
      to: CryptoAsset.BRL,
      toValue: 10.829,
      rate: 1.0829,
      fees: 0,
    };

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(transaction);
      expect(navigation.navigate).toHaveBeenCalledWith('DetailsSwap');
    });
  });
});
