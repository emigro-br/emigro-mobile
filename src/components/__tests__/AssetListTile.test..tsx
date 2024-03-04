import { render } from '@testing-library/react-native';

import { CryptoAsset } from '@/types/assets';

import { Provider } from '@components/Provider';

import { AssetToName } from '@utils/assets';

import { AssetListTile } from '../AssetListTile';

describe('AssetListTile', () => {
  test('renders asset name and type', () => {
    const item = CryptoAsset.USDC;
    const { getByText, getByTestId } = render(
      <Provider>
        <AssetListTile item={item} />
      </Provider>,
    );

    const assetName = getByText(item);
    const assetType = getByText(AssetToName[item]);
    const assetAvatar = getByTestId('asset-avatar');

    expect(assetName).toBeOnTheScreen();
    expect(assetType).toBeOnTheScreen();
    expect(assetAvatar).toBeOnTheScreen();
  });
});
