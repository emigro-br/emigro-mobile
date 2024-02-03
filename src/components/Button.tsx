import { styled } from 'nativewind';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  backgroundColor?: string;
  title?: string;
  children?: React.ReactNode;
  textColor?: string;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
}

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

const Button: React.FC<ButtonProps> = ({ onPress, backgroundColor, children, title, textColor, disabled, loading }) => {
  return (
    <StyledTouchableOpacity
      disabled={disabled || loading}
      onPress={onPress}
      className={`bg-${backgroundColor} h-12 flex items-center justify-center py-2 rounded-lg px-4 ${
        disabled || loading ? 'opacity-50' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator color={textColor} testID="loading-indicator" /> // show a loading spinner when loading
      ) : (
        <StyledText className={`text-${textColor} font-bold text-center`}>{children || title}</StyledText>
      )}
    </StyledTouchableOpacity>
  );
};

export default Button;
