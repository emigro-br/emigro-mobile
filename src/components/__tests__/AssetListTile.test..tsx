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

    expect(assetName).toBeOnTheScreen();
    expect(assetAvatar).toBeOnTheScreen();
    expect(assetTile).toBeOnTheScreen();
    expect(assetCode).toBeNull();
  });

  test('renders correctly for currency', () => {
    const asset = FiatCurrency.EUR;
    const { getByText, queryByText, getByTestId } = render(<AssetListTile asset={asset} />);

    const assetName = getByText('Euro');
    const assetCode = queryByText('EUR');
    const assetAvatar = getByTestId('asset-avatar');

    expect(assetName).toBeOnTheScreen();
    expect(assetAvatar).toBeOnTheScreen();
    expect(assetCode).toBeNull();
  });

  test('renders correctly with subtitle', () => {
    const asset = CryptoAsset.USDC;
    const subtitle = 'Subtitle';
    const { getByText, queryByText } = render(<AssetListTile asset={asset} subtitle={subtitle} subasset={asset} />);

    const assetName = getByText('USD Coin');
    expect(assetName).toBeOnTheScreen();

    const assetSubtitle = getByText(subtitle);
    expect(assetSubtitle).toBeOnTheScreen();

    const assetCode = queryByText('USDC');
    expect(assetCode).toBeNull();
  });

  test('renders correctly with subasset equal', () => {
    const asset = CryptoAsset.USDC;
    const { getByText } = render(<AssetListTile asset={asset} subasset={asset} />);

    const assetName = getByText('USD Coin');
    expect(assetName).toBeOnTheScreen();

    const assetCode = getByText('USDC');
    expect(assetCode).toBeOnTheScreen();
  });

  test('renders correctly with subasset different', () => {
    const asset = CryptoAsset.USDC;
    const subasset = FiatCurrency.USD;
    const { getByText } = render(<AssetListTile asset={asset} subasset={subasset} />);

    const assetName = getByText('USD Coin');
    expect(assetName).toBeOnTheScreen();

    const assetCode = getByText('US Dollar');
    expect(assetCode).toBeOnTheScreen();
  });
});
