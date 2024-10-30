import React from 'react';

import { render } from '@testing-library/react-native';

import { CryptoAsset } from '@/types/assets';
import { cryptoCodeToObj } from '@/utils/assets';

import { AssetImage } from '../AssetImage';

describe('AssetAvatar component', () => {
  const assetCode = CryptoAsset.USDC;

  it('render the asset avatar correctly', () => {
    const { getByTestId, getByLabelText } = render(<AssetImage asset={assetCode} />);

    expect(getByTestId('asset-avatar')).toBeOnTheScreen();
    expect(getByLabelText('USD Coin')).toBeOnTheScreen();
  });

  it('render with Asset', () => {
    const asset = cryptoCodeToObj(assetCode);
    const { getByTestId } = render(<AssetImage asset={asset} />);

    const image = getByTestId('asset-avatar');
    expect(image).toBeOnTheScreen();
    expect(image.props.source).toEqual(asset.icon);
  });

  it('not render without asset', () => {
    const { queryByTestId } = render(<AssetImage asset={null} />);
    expect(queryByTestId('asset-avatar')).toBeNull();
  });

  it('not render with invalid asset', () => {
    const { queryByTestId } = render(<AssetImage asset="XXX" />);
    expect(queryByTestId('asset-avatar')).toBeNull();
  });
});
