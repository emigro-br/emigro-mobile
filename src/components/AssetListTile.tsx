import { CryptoOrFiat } from '@/types/assets';
import { iconFor, labelFor } from '@/utils/assets';

import { AssetAvatar } from './AssetAvatar';
import { ListTile } from './ListTile';

type Props = {
  asset: CryptoOrFiat;
  assetType?: 'crypto' | 'fiat'; // TODO: workaround for icon and title
  subasset?: CryptoOrFiat;
  subtitle?: string | React.ReactNode;
  trailing?: React.ReactNode;
  dense?: boolean;
  testID?: string;
};

export const AssetListTile = ({ asset, assetType = 'crypto', subasset, subtitle, trailing, dense, testID }: Props) => {
  const title = labelFor(asset, assetType);
  const icon = iconFor(asset, assetType);

  if (subasset && !subtitle) {
    subtitle = asset === subasset ? `${subasset}` : labelFor(subasset);
  }
  return (
    <ListTile
      leading={<AssetAvatar asset={asset} icon={icon} size={dense ? 'sm' : 'md'} />}
      title={title ?? asset}
      subtitle={subtitle}
      trailing={trailing}
      testID={testID}
    />
  );
};
