import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { withTheme } from '@/__utils__/helpers';
import { CryptoAsset, CryptoOrFiat, FiatCurrency } from '@/types/assets';

import { AssetList } from '../AssetList';

describe('AssetList component', () => {
  const mockData: CryptoOrFiat[] = [FiatCurrency.EUR, CryptoAsset.USDC];

  it('renders the list of assets correctly', () => {
    const onPressMock = jest.fn();
    const { getByText, getByLabelText } = render(withTheme(<AssetList data={mockData} onPress={onPressMock} />));

    // Check if the list items are rendered correctly
    expect(getByText('EUR')).toBeOnTheScreen();
    expect(getByLabelText('Euro')).toBeOnTheScreen();

    expect(getByText('USDC')).toBeOnTheScreen();
    expect(getByLabelText('USD Coin')).toBeOnTheScreen();
  });

  it('calls the onPress function when an item is pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<AssetList data={mockData} onPress={onPressMock} />);

    // Simulate pressing the first item
    fireEvent.press(getByText('EUR'));

    // Check if the onPress function is called with the correct item
    expect(onPressMock).toHaveBeenCalledWith(mockData[0]);
  });
});
