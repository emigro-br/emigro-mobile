import { Image } from "@/components/ui/image";

import { ImageProps } from 'react-native';

import { Asset, CryptoOrFiat } from '@/types/assets';
import { iconFor, labelFor } from '@/utils/assets';

type Props = ImageProps & {
  asset: CryptoOrFiat | Asset;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'full' | 'xl' | '2xl' | '2xs';
  testID?: string;
};

export const AssetImage = ({ asset, size = 'sm', testID = 'asset-avatar' }: Props) => {
  if (!asset) {
    console.debug('AssetImage: asset is required');
    return null;
  }

  let imageSource;
  let imageAlt;
  if (typeof asset === 'string') {
    imageSource = iconFor(asset);
    imageAlt = labelFor(asset);
  } else {
    imageSource = asset.icon;
    imageAlt = asset.name;
  }

  if (!imageSource) {
    //FIXME: add placeholder image
    console.debug(`AssetImage: icon not found for ${asset}`);
    return null;
  }

  return (
    <Image
      size={size}
      source={imageSource}
      alt={imageAlt}
      // borderRadius="$full"
      testID={testID}
    />
  );
};
