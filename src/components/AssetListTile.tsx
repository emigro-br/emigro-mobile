import { CryptoOrFiat } from '@/types/assets';
import { labelFor } from '@/utils/assets';

import { AssetImage } from './AssetImage';
import { ListTile } from './ListTile';

type Props = {
  asset: CryptoOrFiat;
  assetType?: 'crypto' | 'fiat'; // TODO: workaround for icon and title
  subasset?: CryptoOrFiat;
  subtitle?: string | React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  dense?: boolean;
  testID?: string;
};

export const AssetListTile = ({
  asset,
  assetType = 'crypto',
  subasset,
  subtitle,
  trailing,
  onPress,
  dense,
  testID,
}: Props) => {
  const title = labelFor(asset, assetType);

  if (subasset && !subtitle) {
    subtitle = asset === subasset ? `${subasset}` : labelFor(subasset);
  }
  return (
    <ListTile
      leading={<AssetImage asset={asset} size={dense ? '2xs' : 'xs'} />}
      title={title ?? asset}
      subtitle={subtitle}
      trailing={trailing}
      onPress={onPress}
      testID={testID}
    />
  );
};
