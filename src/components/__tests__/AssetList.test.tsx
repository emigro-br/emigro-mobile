import React from 'react';
import { View } from 'react-native';

import { fireEvent } from '@testing-library/react-native';

import { render } from 'test-utils';

import { CryptoAsset, CryptoOrFiat, FiatCurrency } from '@/types/assets';

import { AssetList } from '../AssetList';

describe('AssetList component', () => {
  const mockData: CryptoOrFiat[] = [FiatCurrency.EUR, CryptoAsset.USDC];

  it('renders the list of assets correctly', () => {
    const onPressMock = jest.fn();
    const trailing = <View testID="trailing" />;
    const { getByText, getByLabelText, getAllByTestId } = render(
      <AssetList data={mockData} onPress={onPressMock} trailing={trailing} />,
    );

    // Check if the list items are rendered correctly
    expect(getByText('EUR')).toBeOnTheScreen();
    expect(getByLabelText('Euro')).toBeOnTheScreen();

    expect(getByText('USDC')).toBeOnTheScreen();
    expect(getByLabelText('USD Coin')).toBeOnTheScreen();

    // Check if the trailing element is rendered
    expect(getAllByTestId('trailing')).toHaveLength(mockData.length);
  });

  it('renders the custom subtitle correctly', () => {
    const renderSubtitleMock = (item: CryptoOrFiat) => `Subtitle for ${item}`;
    const { getByText } = render(<AssetList data={mockData} onPress={jest.fn()} renderSubtitle={renderSubtitleMock} />);

    // Check if the custom subtitle is rendered correctly
    expect(getByText('Subtitle for EUR')).toBeOnTheScreen();
    expect(getByText('Subtitle for USDC')).toBeOnTheScreen();
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
