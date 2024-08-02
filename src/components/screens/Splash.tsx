import { Image, View } from 'react-native';

import splash from '@/assets/images/splash.png';

// Keep this component simple and clean, without gluestack theme
export const SplashScreen = () => {
  return (
    <View>
      <Image
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        source={splash}
      />
    </View>
  );
};
