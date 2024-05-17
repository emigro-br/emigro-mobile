import { CryptoOrFiat } from '@/types/assets';
import { labelFor } from '@/utils/assets';

import { AssetAvatar } from './AssetAvatar';
import { ListTile } from './ListTile';

type Props = {
  asset: CryptoOrFiat;
  subasset?: CryptoOrFiat;
  subtitle?: string;
  trailing?: React.ReactNode;
  dense?: boolean;
  testID?: string;
};

export const AssetListTile = ({ asset, subasset, subtitle, trailing, dense, testID }: Props) => {
  if (subasset && !subtitle) {
    subtitle = asset === subasset ? `${subasset}` : labelFor(subasset);
  }
  return (
    <ListTile
      leading={<AssetAvatar asset={asset} size={dense ? 'sm' : 'md'} />}
      title={labelFor(asset) || `${asset}`}
      subtitle={subtitle}
      trailing={trailing}
      testID={testID}
    />
  );
};
