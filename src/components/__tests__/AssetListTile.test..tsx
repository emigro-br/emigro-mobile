import { render } from 'test-utils';

import { CryptoAsset, FiatCurrency } from '@/types/assets';

import { AssetListTile } from '../AssetListTile';

describe('AssetListTile', () => {
  test('renders correctly for crypto', () => {
    const item = CryptoAsset.USDC;
    const { getByText, getByTestId } = render(<AssetListTile asset={item} />);

    const assetCode = getByText('USDC');
    const assetName = getByText('USD Coin');
    const assetAvatar = getByTestId('asset-avatar');

    expect(assetCode).toBeOnTheScreen();
    expect(assetName).toBeOnTheScreen();
    expect(assetAvatar).toBeOnTheScreen();
  });

  test('renders correctly for currency', () => {
    const item = FiatCurrency.EUR;
    const { getByText, getByTestId } = render(<AssetListTile asset={item} />);

    const assetCode = getByText('EUR');
    const assetName = getByText('Euro');
    const assetAvatar = getByTestId('asset-avatar');

    expect(assetCode).toBeOnTheScreen();
    expect(assetName).toBeOnTheScreen();
    expect(assetAvatar).toBeOnTheScreen();
  });

  test('renders correctly with dense prop', () => {
    const item = CryptoAsset.USDC;
    const { queryByText, getByTestId } = render(<AssetListTile asset={item} dense />);

    const assetCode = queryByText('USDC');
    const assetName = queryByText('USD Coin');
    const assetAvatar = getByTestId('asset-avatar');

    expect(assetCode).toBeNull();
    expect(assetAvatar).toBeOnTheScreen();
    expect(assetName).toBeOnTheScreen();
  });
});
