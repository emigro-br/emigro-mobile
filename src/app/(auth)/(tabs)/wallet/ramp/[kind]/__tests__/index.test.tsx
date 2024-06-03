import React from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { fireEvent, render } from 'test-utils';

import { balanceStore } from '@/stores/BalanceStore';
import { CryptoAsset } from '@/types/assets';

import AssetForOperation from '..';

jest.mock('@/stores/BalanceStore', () => ({
  balanceStore: {
    currentAssets: jest.fn(() => []),
    get: jest.fn(() => 10),
  },
}));

describe('AssetForOperation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ kind: 'deposit' });
    (balanceStore.currentAssets as jest.Mock).mockReturnValue([CryptoAsset.USDC]);
  });

  it('should render', () => {
    const { getByText } = render(<AssetForOperation />);
    expect(getByText('Deposit money')).toBeOnTheScreen();
    expect(getByText('10.00 USDC')).toBeOnTheScreen();
  });

  it('should navigate on press', () => {
    const router = useRouter();
    const { getByText } = render(<AssetForOperation />);
    const item = getByText('10.00 USDC');

    fireEvent.press(item);

    expect(router.push).toHaveBeenCalledWith({ pathname: './USD' });
  });
});
