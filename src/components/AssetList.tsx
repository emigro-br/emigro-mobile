import React from 'react';

import { Box, FlatList, Pressable } from '@gluestack-ui/themed';

import { CryptoOrFiat } from '@/types/assets';

import { AssetListTile } from './AssetListTile';

type Props = {
  data: CryptoOrFiat[];
  onPress: (item: CryptoOrFiat) => void;
};

export const AssetList = ({ data, onPress }: Props) => {
  return (
    <FlatList
      data={data}
      renderItem={({ item }: { item: CryptoOrFiat }) => (
        <Pressable onPress={() => onPress(item)}>
          <AssetListTile asset={item} subasset={item} />
        </Pressable>
      )}
      keyExtractor={(item: CryptoOrFiat) => item}
      ItemSeparatorComponent={() => <Box h="$4" />}
    />
  );
};
