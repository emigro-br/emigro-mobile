import { styled } from 'nativewind';
import React from 'react';
import { View } from 'react-native';

const StyledView = styled(View);

type CardProps = {
  children: React.ReactNode;
};

export const Card = (props: CardProps) => {
  return (
    <StyledView className='bg-white p-4 mb-4 rounded-xl overflow-hidden shadow-md'>
      {props.children}
    </StyledView>
  );
};
