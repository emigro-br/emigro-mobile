import React from 'react';

import { Box, Card, FlatList, Pressable } from '@gluestack-ui/themed';

import { CryptoOrFiat } from '@/types/assets';

import { AssetListTile } from './AssetListTile';

type Props = {
  data: CryptoOrFiat[];
  onPress: (item: CryptoOrFiat) => void;
  trailing?: React.ReactNode;
};

export const AssetList = ({ data, trailing, onPress }: Props) => {
  const renderItem = ({ item }) => (
    <Pressable onPress={() => onPress(item)}>
      <AssetListTile asset={item} subasset={item} trailing={trailing} />
    </Pressable>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item as string}
      ItemSeparatorComponent={() => <Box h="$4" />}
    />
  );
};

type CardProps = Props & {
  variant?: 'flat' | 'outline' | 'elevated' | 'ghost' | 'filled' | undefined;
};

export const CardAssetList = ({ variant = 'flat', data, trailing, onPress }: CardProps) => (
  <Card variant={variant}>
    <AssetList data={data} trailing={trailing} onPress={onPress} />
  </Card>
);
