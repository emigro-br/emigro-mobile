import { styled } from 'nativewind';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  onPress?: () => void;
  bg?: string;
  children: React.ReactNode;
  textColor?: string;
  disabled?: boolean;
}

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

const Button: React.FC<ButtonProps> = ({ onPress, bg, children, textColor, disabled }) => {
  return (
    <StyledTouchableOpacity
      disabled={disabled}
      onPress={onPress}
      className={`bg-${bg} h-12 flex justify-center rounded-md shadow-md shadow-black ${disabled ? 'opacity-50' : ''}`}
    >
      <StyledText className={`text-${textColor} text-center px-4`}>{children}</StyledText>
    </StyledTouchableOpacity>
  );
};

export default Button;
