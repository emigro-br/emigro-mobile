import { ImageProps } from 'react-native';
import { Image } from '@/components/ui/image';
import { Asset, CryptoOrFiat } from '@/types/assets';
import { iconFor, labelFor } from '@/utils/assets';

type Props = ImageProps & {
  asset: CryptoOrFiat | Asset;
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  testID?: string;
};

export const AssetImage = ({
  asset,
  size = 'sm',
  testID = 'asset-avatar',
  ...rest
}: Props) => {
  if (!asset) {
    console.debug('[AssetImage] ❌ asset is required');
    return null;
  }

  const source = iconFor(asset);
  const alt = labelFor(asset);

  if (!source) {
    console.debug(`[AssetImage] ❌ No icon found for asset: ${JSON.stringify(asset)}`);
    return null;
  }

  return (
    <Image
      source={source}
      alt={alt}
      size={size}
      style={{ borderRadius: 16 }} 
      testID={testID}
      {...rest}
    />
  );
};
