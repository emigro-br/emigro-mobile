import React from 'react';

import { fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import { balanceStore } from '@/stores/BalanceStore';
import { CryptoAsset } from '@/types/assets';

import { Transfers } from '..';

jest.mock('@/stores/BalanceStore', () => ({
  balanceStore: {
    currentAssets: jest.fn(),
  },
}));

describe('Transfers', () => {
  beforeEach(() => {
    (balanceStore.currentAssets as jest.Mock).mockReturnValue([CryptoAsset.XLM]);
  });

  test('Should render the screen correctly', () => {
    const { getByText } = render(<Transfers />);

    expect(getByText('Send money')).toBeOnTheScreen();
    expect(getByText('XLM')).toBeOnTheScreen();
    expect(getByText('Stellar Lumens')).toBeOnTheScreen();
  });

  test('Should navigate to SendAsset screen when an asset is pressed', () => {
    const router = useRouter();
    const { getByText } = render(<Transfers />);
    const assetButton = getByText('XLM');

    fireEvent.press(assetButton);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/<path>/send',
      params: { asset: CryptoAsset.XLM },
    });
  });
});
