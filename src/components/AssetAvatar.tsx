import { Avatar, AvatarImage } from '@gluestack-ui/themed';

import { CryptoOrFiat } from '@/types/assets';
import { iconFor, labelFor } from '@/utils/assets';

type Props = {
  asset: CryptoOrFiat;
  icon?: string; // TODO: we can for the icon later
  size?: 'xs' | 'sm' | 'md' | 'lg';
  alt?: string;
  testID?: string;
};

export const AssetAvatar = ({ asset, icon, alt, size = 'md', testID = 'asset-avatar' }: Props) => {
  return (
    <Avatar size={size} bg="$transparent" testID={testID}>
      <AvatarImage source={icon ?? iconFor(asset)} alt={alt ?? labelFor(asset)} />
    </Avatar>
  );
};
