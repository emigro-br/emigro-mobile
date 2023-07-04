import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { FunctionComponent, ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

interface IHeader {
  children: ReactNode;
}

const Header: FunctionComponent<IHeader> = (props) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    navigation.navigate('LogIn' as never);
  };

  return (
    <StyledView className="flex-row items-center justify-center bg-red pt-8">
      <TouchableOpacity onPress={() => navigation.navigate('Root' as never)}>
        <StyledText className="text-white text-xl py-2">Logo</StyledText>
      </TouchableOpacity>
      <StyledText className="text-white text-lg py-2 absolute right-4 top-8" onPress={handleLogout}>
        Logout
      </StyledText>
      <StyledView>{props.children}</StyledView>
    </StyledView>
  );
};

export default Header;
