import { styled } from 'nativewind';
import React from 'react';
import { View } from 'react-native';

const StyledView = styled(View);


type CardProps = {
  children: React.ReactNode;
  color?: string;
};

export const Card = (props: CardProps) => {
  const { color = 'white' } = props;
  return (
    <StyledView className={`bg-${color} p-4 mb-4 rounded-xl overflow-hidden`}>
      {props.children}
    </StyledView>
  );
};
