import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { Swap } from '../Swap';
import { SwapType } from '../types';
import { AssetCode } from '@constants/assetCode';

describe('Swap component', () => {
  test('Should render Swap component correctly', () => {
    const { getByText, getByTestId } = render(<Swap />);

    const sellText = getByText(`Sell ${AssetCode.EURC}`);
    const buyText = getByText(`1 ${AssetCode.EURC} ≈ 1.0829 ${AssetCode.BRL}`);
    // check arrow icon
    const arrowIcon = getByTestId('arrowIcon');

    expect(sellText).toBeDefined();
    expect(buyText).toBeDefined();
    expect(arrowIcon).toBeDefined();
  });

  test('Should update sellValue and buyValue when onChangeValue is called', async () => {
    const { findAllByPlaceholderText } = render(<Swap />);

    const [sellInput, buyInput] = await findAllByPlaceholderText('0');

    fireEvent.changeText(sellInput, '10');

    expect(sellInput.props.value).toBe('10');
    expect(buyInput.props.value).toBe('10.83');
  });
});
