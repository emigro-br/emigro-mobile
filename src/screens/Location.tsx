import React from 'react';
import { View } from 'react-native';

import { styled } from 'nativewind';

import MapScreen from '../components/MapScreen';

const StyledView = styled(View);

const Location = () => {
  return (
    <StyledView className="flex justify-center items-center w-full h-full bg-white">
      <MapScreen />
    </StyledView>
  );
};

export default Location;
