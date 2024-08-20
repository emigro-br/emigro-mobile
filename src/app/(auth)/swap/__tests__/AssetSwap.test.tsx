import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { CryptoAsset } from '@/types/assets';

import { AssetSwap } from '../AssetSwap';
import { SwapType } from '../types';

describe('AssetSwap component', () => {
  const assets = [CryptoAsset.BRZ, CryptoAsset.EURC, CryptoAsset.USDC];

  test('Should render AssetSwap component correctly', () => {
    const mockSetAsset = jest.fn();
    const mockOnChangeValue = jest.fn();

    const { getByText } = render(
      <AssetSwap
        asset={CryptoAsset.BRZ}
        assets={assets}
        balance={1.0}
        onChangeAsset={mockSetAsset}
        sellOrBuy={SwapType.SELL}
        onChangeValue={mockOnChangeValue}
      />,
    );

    const assetSwapText = getByText('BRZ');
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
        assets={assets}
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

    const testID = 'my-box';
    const { getByTestId } = render(
      <AssetSwap
        asset={CryptoAsset.EURC}
        assets={assets}
        balance={1.0}
        onChangeAsset={mockSetAsset}
        sellOrBuy={SwapType.SELL}
        onChangeValue={mockOnChangeValue}
        onPress={onPressMock}
        testID={testID}
      />,
    );

    const myBox = getByTestId(testID);
    fireEvent.press(myBox);

    expect(onPressMock).toHaveBeenCalled();
  });

  // test when exceeds balance
  it('should show exceeds balance when input value exceeds balance', async () => {
    const mockSetAsset = jest.fn();
    const mockOnChangeValue = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <AssetSwap
        asset={CryptoAsset.EURC}
        assets={assets}
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
