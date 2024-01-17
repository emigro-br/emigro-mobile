import { styled } from 'nativewind';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  onPress?: () => void;
  backgroundColor?: string;
  children: React.ReactNode;
  textColor?: string;
  disabled?: boolean;
}

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

const Button: React.FunctionComponent<ButtonProps> = ({ onPress, backgroundColor, children, textColor, disabled }) => {
  return (
    <StyledTouchableOpacity
      disabled={disabled}
      onPress={onPress}
      className={`bg-${backgroundColor} h-12 flex items-center justify-center py-2 rounded-lg px-4 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <StyledText className={`text-${textColor} font-bold text-center`}>{children}</StyledText>
    </StyledTouchableOpacity>
  );
};

export default Button;
