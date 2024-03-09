import { HStack, Text, VStack } from '@gluestack-ui/themed';

import { CryptoOrFiat } from '@/types/assets';

import { labelFor } from '@utils/assets';

import { AssetAvatar } from './AssetAvatar';

type Props = {
  asset: CryptoOrFiat;
  dense?: boolean;
};

export const AssetListTile = ({ asset, dense }: Props) => {
  return (
    <HStack space="md" alignItems="center">
      <AssetAvatar asset={asset} size={dense ? 'sm' : 'md'} />
      <VStack>
        <Text color="$coolGray800" fontWeight="500" $dark-color="$warmGray100">
          {dense ? labelFor(asset) : asset}
        </Text>
        {!dense && (
          <Text size="sm" color="$coolGray500" $dark-color="$warmGray200">
            {labelFor(asset)}
          </Text>
        )}
      </VStack>
    </HStack>
  );
};
