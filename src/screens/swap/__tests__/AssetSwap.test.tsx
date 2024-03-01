import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { CryptoAsset } from '@/types/assets';

import { Provider } from '@components/Provider';

import { AssetSwap } from '../AssetSwap';
import { SwapType } from '../types';

describe('AssetSwap component', () => {
  test('Should render AssetSwap component correctly', () => {
    const mockSetAsset = jest.fn();
    const mockOnChangeValue = jest.fn();

    const { getByText } = render(
      <Provider>
        <AssetSwap
          asset={CryptoAsset.BRL}
          balance={1.0}
          onChangeAsset={mockSetAsset}
          sellOrBuy={SwapType.SELL}
          onChangeValue={mockOnChangeValue}
        />
      </Provider>,
    );

    const assetSwapText = getByText('BRL');
    expect(assetSwapText).toBeDefined();

    const balanceText = getByText('Balance: R$ 1.00');
    expect(balanceText).toBeDefined();
  });

  test('Should call onChangeValue when input value is changed', () => {
    const mockSetAsset = jest.fn();
    const mockOnChangeValue = jest.fn();

    const { getByPlaceholderText } = render(
      <AssetSwap
        asset={CryptoAsset.EURC}
        balance={1.0}
        onChangeAsset={mockSetAsset}
        sellOrBuy={SwapType.SELL}
        onChangeValue={mockOnChangeValue}
      />,
    );

    const input = getByPlaceholderText('0');
    fireEvent.changeText(input, '10.01');

    expect(mockOnChangeValue).toBeCalledWith(10.01, SwapType.SELL);
  });

  it('calls onPress prop when pressed', () => {
    const mockSetAsset = jest.fn();
    const mockOnChangeValue = jest.fn();
    const onPressMock = jest.fn();

    const { getByTestId } = render(
      <AssetSwap
        asset={CryptoAsset.EURC}
        balance={1.0}
        onChangeAsset={mockSetAsset}
        sellOrBuy={SwapType.SELL}
        onChangeValue={mockOnChangeValue}
        onPress={onPressMock}
      />,
    );

    const touchable = getByTestId('touchable');
    fireEvent.press(touchable);

    expect(onPressMock).toHaveBeenCalled();
  });

  // test when exceeds balance
  it('should show exceeds balance when input value exceeds balance', async () => {
    const mockSetAsset = jest.fn();
    const mockOnChangeValue = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <AssetSwap
        asset={CryptoAsset.EURC}
        balance={1.0}
        onChangeAsset={mockSetAsset}
        sellOrBuy={SwapType.SELL}
        onChangeValue={mockOnChangeValue}
      />,
    );

    const input = getByPlaceholderText('0');
    fireEvent.changeText(input, '10.01');

    await waitFor(() => {
      const exceedsBalanceText = getByText('exceeds balance');
      expect(exceedsBalanceText).toBeDefined();
    });
  });
});
