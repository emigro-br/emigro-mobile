import { Asset } from '@/types/assets';
import { labelFor } from '@/utils/assets';
import { AssetImage } from './AssetImage';
import { ListTile } from './ListTile';
import { useChainStore } from '@/stores/ChainStore';

import { View, Image, StyleSheet } from 'react-native';

type Props = {
  asset: Asset;
  icon?: any; // ✅ Add this
  subtitle?: string | React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  dense?: boolean;
  testID?: string;
};

export const AssetListTile = ({
  asset,
  icon,
  subtitle,
  trailing,
  onPress,
  dense,
  testID,
}: Props) => {
  const chain = useChainStore((state) =>
    asset.chainId ? state.getChainById(asset.chainId) : undefined
  );

  const title = `${labelFor(asset)}`;

  return (
    <ListTile
      leading={
        <View style={styles.leadingWrapper}>
          <View style={styles.assetWrapper}>
            {icon ? (
              <Image
                source={icon}
                style={styles.assetImage}
                resizeMode="contain"
              />
            ) : (
              <AssetImage
                asset={asset}
                size="full"
                style={styles.assetImage}
              />
            )}
          </View>
          {chain?.icon && (
            <View style={styles.chainBadgeWrapper}>
              <Image
                source={chain.icon}
                style={styles.chainBadge}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      }
      title={title}
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
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetWrapper: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  assetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  chainBadgeWrapper: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  chainBadge: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
