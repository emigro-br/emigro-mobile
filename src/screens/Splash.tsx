import { Image, View } from 'react-native';

import { styled } from 'nativewind';

import splash from '@assets/images/splash.png';

const StyledView = styled(View);
const StyledImage = styled(Image);

export const SplashScreen = () => {
  return (
    <StyledView>
      <StyledImage className="h-full w-full object-contain" source={splash} />
    </StyledView>
  );
};
