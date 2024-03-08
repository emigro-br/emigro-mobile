import { HStack, Text, VStack } from '@gluestack-ui/themed';

import { CryptoOrFiat } from '@/types/assets';

import { labelFor } from '@utils/assets';

import { AssetAvatar } from './AssetAvatar';

type Props = {
  item: CryptoOrFiat;
};

export const AssetListTile = ({ item }: Props) => {
  return (
    <HStack space="md">
      <AssetAvatar item={item} />
      <VStack>
        <Text color="$coolGray800" fontWeight="500" $dark-color="$warmGray100">
          {item}
        </Text>
        <Text size="sm" color="$coolGray500" $dark-color="$warmGray200">
          {labelFor(item)}
        </Text>
      </VStack>
    </HStack>
  );
};
