import { render } from 'test-utils';

import { CryptoAsset, FiatCurrency } from '@/types/assets';

import { AssetListTile } from '../AssetListTile';

describe('AssetListTile', () => {
  test('renders correctly for crypto', () => {
    const testID = 'asset-list-tile';
    const item = CryptoAsset.USDC;
    const { getByText, queryByText, getByTestId } = render(<AssetListTile asset={item} testID={testID} />);

    const assetName = getByText('USD Coin');
    const assetAvatar = getByTestId('asset-avatar');
    const assetCode = queryByText('USDC');
    const assetTile = getByTestId(testID);

    expect(assetCode).toBeNull();
    expect(assetName).toBeOnTheScreen();
    expect(assetAvatar).toBeOnTheScreen();
    expect(assetTile).toBeOnTheScreen();
  });

  test('renders correctly for currency', () => {
    const asset = FiatCurrency.EUR;
    const subasset = CryptoAsset.EURC;
    const { getByText, getByTestId } = render(<AssetListTile asset={asset} subasset={subasset} />);

    const assetName = getByText('Euro');
    const assetCode = getByText('Euro Coin');
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
