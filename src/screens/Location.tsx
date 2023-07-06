import { styled } from 'nativewind';
import React from 'react';
import { Text, View } from 'react-native';

import MapScreen from '@components/Map';

const StyledView = styled(View);
const StyledText = styled(Text);

const Location = () => {
  return (
    <StyledView className="flex justify-center items-center w-full h-full">
      <MapScreen />
    </StyledView>
  );
};

export default Location;
