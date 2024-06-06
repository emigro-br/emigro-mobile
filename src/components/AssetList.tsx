import React from 'react';

import { Box, Card, FlatList, Pressable } from '@gluestack-ui/themed';

import { CryptoOrFiat } from '@/types/assets';

import { AssetListTile } from './AssetListTile';

type Props = {
  data: CryptoOrFiat[];
  onPress: (item: CryptoOrFiat) => void;
  trailing?: React.ReactNode;
  renderSubtitle?: (item: CryptoOrFiat) => string | React.ReactNode;
};

export const AssetList = ({ data, trailing, onPress, renderSubtitle }: Props) => {
  const _subtitle = (item: CryptoOrFiat) => {
    return renderSubtitle ? renderSubtitle(item) : item;
  };

  const renderItem = ({ item }) => (
    <Pressable onPress={() => onPress(item)}>
      <AssetListTile asset={item} subtitle={_subtitle(item)} trailing={trailing} />
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

export const CardAssetList = (props: CardProps) => (
  <Card variant={props.variant ?? 'flat'}>
    <AssetList {...props} />
  </Card>
);
