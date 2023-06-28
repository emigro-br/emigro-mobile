import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { FunctionComponent, ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledOpacity = styled(TouchableOpacity);

interface IHeader {
  children: ReactNode;
}

const Header: FunctionComponent<IHeader> = (props) => {
  const navigation = useNavigation();
  return (
    <StyledView className="flex-row items-center justify-center bg-red pt-8">
      <StyledText className="text-white text-xl py-2">Logo</StyledText>
      <StyledText
        className="text-white text-lg py-2 absolute right-4 top-8"
        onPress={() => navigation.navigate('LogIn')}
      >
        Logout
      </StyledText>
      <StyledView>{props.children}</StyledView>
    </StyledView>
  );
};

export default Header;
