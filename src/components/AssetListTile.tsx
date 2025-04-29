import { Asset } from '@/types/assets';
import { chainIconFor, labelFor } from '@/utils/assets';

import { AssetImage } from './AssetImage';
import { ListTile } from './ListTile';

import { View, Image, StyleSheet } from 'react-native';

type Props = {
  asset: Asset;
  subtitle?: string | React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  dense?: boolean;
  testID?: string;
};

export const AssetListTile = ({
  asset,
  subtitle,
  trailing,
  onPress,
  dense,
  testID,
}: Props) => {
  const title = labelFor(asset.code);

  return (
    <ListTile
      leading={
        <View style={styles.leadingWrapper}>
          <View style={styles.assetWrapper}>
            <AssetImage
              asset={asset.code}
              size={dense ? '2xs' : 'xs'}
              style={styles.assetImage}
            />
          </View>
          {asset.chain && (
            <View style={styles.chainBadgeWrapper}>
              <Image
                source={chainIconFor(asset.chain)}
                style={styles.chainBadge}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      }
      title={title ?? asset.code}
      subtitle={subtitle}
      trailing={trailing}
      onPress={onPress}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  leadingWrapper: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetWrapper: {
    width: 32,
    height: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0', // very soft gray border
  },
  assetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Important: no cut off
  },
  chainBadgeWrapper: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  chainBadge: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
});
