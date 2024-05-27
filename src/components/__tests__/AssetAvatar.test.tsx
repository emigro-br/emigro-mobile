import React from 'react';

import { render } from '@testing-library/react-native';

import { CryptoAsset } from '@/types/assets';

import { AssetAvatar } from '../AssetAvatar';

describe('AssetAvatar component', () => {
  const mockItem = CryptoAsset.USDC;

  it('render the asset avatar correctly', () => {
    const { getByTestId, getByLabelText } = render(<AssetAvatar asset={mockItem} />);

    expect(getByTestId('asset-avatar')).toBeTruthy();
    expect(getByLabelText('USD Coin')).toBeTruthy();
  });

  it('render with custom icon', () => {
    const icon = 'https://example.com/icon.png';
    const { getByTestId } = render(<AssetAvatar asset={mockItem} icon={icon} />);

    expect(getByTestId('asset-avatar').props.children.props.source).toBe(icon);
  });

  it('render with custom alt', () => {
    const alt = 'USD Coin Icon';
    const { getByTestId } = render(<AssetAvatar asset={mockItem} alt={alt} />);

    expect(getByTestId('asset-avatar').props.children.props.alt).toBe(alt);
  });
});
