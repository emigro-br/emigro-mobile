import { Avatar, AvatarImage } from '@gluestack-ui/themed';

import { CryptoOrFiat } from '@/types/assets';

import { iconFor, labelFor } from '@utils/assets';

type Props = {
  item: CryptoOrFiat;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  testID?: string;
};

export const AssetAvatar = ({ item, size = 'md', testID = 'asset-avatar' }: Props) => {
  return (
    <Avatar size={size} bg="$transparent" testID={testID}>
      <AvatarImage source={iconFor(item)} alt={labelFor(item)} />
    </Avatar>
  );
};
