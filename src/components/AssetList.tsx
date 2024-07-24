import React from 'react';

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { FlatList } from '@/components/ui/flat-list';
import { Pressable } from '@/components/ui/pressable';
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
      ItemSeparatorComponent={() => <Box className="h-4" />}
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
