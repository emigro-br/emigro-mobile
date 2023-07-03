import { styled } from 'nativewind';
import React from 'react';
import { Text, View } from 'react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

const Location = () => {
  return (
    <StyledView>
      <StyledText>Location</StyledText>
    </StyledView>
  );
};

export default Location;
