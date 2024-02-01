import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { AssetSwap } from '../AssetSwap';
import { AssetCode } from '@constants/assetCode';
import { SwapType } from '../types';

describe('AssetSwap component', () => {
  test('Should render AssetSwap component correctly', () => {
    const mockSetAsset = jest.fn();
    const mockOnChangeValue = jest.fn();

    const { getByText } = render(
      <AssetSwap 
        asset={AssetCode.BRL}
        balance={1.0}
        onChangeAsset={mockSetAsset}
        sellOrBuy={SwapType.SELL}
        onChangeValue={mockOnChangeValue}
      />
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
        asset={AssetCode.EURC}
        balance={1.0}
        onChangeAsset={mockSetAsset}
        sellOrBuy={SwapType.SELL}
        onChangeValue={mockOnChangeValue}
      />
    );

    const input = getByPlaceholderText('0');
    fireEvent.changeText(input, '10.01');

    expect(mockOnChangeValue).toBeCalledWith(10.01, SwapType.SELL);
  });

});
