import { CryptoOrFiat } from '@/types/assets';
import { labelFor } from '@/utils/assets';

import { AssetAvatar } from './AssetAvatar';
import { ListTile } from './ListTile';

type Props = {
  asset: CryptoOrFiat;
  subasset?: CryptoOrFiat;
  trailing?: React.ReactNode;
  dense?: boolean;
  testID?: string;
};

export const AssetListTile = ({ asset, subasset, trailing, dense, testID }: Props) => {
  return (
    <ListTile
      leading={<AssetAvatar asset={asset} size={dense ? 'sm' : 'md'} />}
      title={labelFor(asset) || `${asset}`}
      subtitle={subasset && (asset === subasset ? `${subasset}` : labelFor(subasset))}
      trailing={trailing}
      testID={testID}
    />
  );
};
