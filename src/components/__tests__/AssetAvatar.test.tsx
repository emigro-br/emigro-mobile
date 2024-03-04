import React from 'react';

import { render } from '@testing-library/react-native';

import { CryptoAsset } from '@/types/assets';

import { AssetAvatar } from '../AssetAvatar';

describe('AssetAvatar component', () => {
  const mockItem = CryptoAsset.USDC;

  it('renders the asset avatar correctly', () => {
    const { getByTestId, getByLabelText } = render(<AssetAvatar item={mockItem} />);

    expect(getByTestId('asset-avatar')).toBeTruthy();
    expect(getByLabelText('USD Coin')).toBeTruthy();
  });
});
