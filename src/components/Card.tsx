import { styled } from 'nativewind';
import React from 'react';
import { View } from 'react-native';

const StyledView = styled(View);


type CardProps = {
  children: React.ReactNode;
  color?: string;
  borderColor?: string;
};

export const Card = (props: CardProps) => {
  const { color = 'white', borderColor } = props;
  const border = borderColor ? `border border-${borderColor}` : '';
  return (
    <StyledView className={`bg-${color} ${border} p-4 mb-4 rounded-xl shadow shadow-sm`}>
      {props.children}
    </StyledView>
  );
};
