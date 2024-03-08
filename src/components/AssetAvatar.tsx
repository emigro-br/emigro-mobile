import { Avatar, AvatarImage } from '@gluestack-ui/themed';

import { CryptoOrFiat } from '@/types/assets';

import { iconFor, labelFor } from '@utils/assets';

type Props = {
  item: CryptoOrFiat;
  testID?: string;
};

export const AssetAvatar = ({ item, testID = 'asset-avatar' }: Props) => {
  return (
    <Avatar size="md" bg="$transparent" testID={testID}>
      <AvatarImage source={iconFor(item)} alt={labelFor(item)} />
    </Avatar>
  );
};
