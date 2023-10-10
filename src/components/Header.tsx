import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { FunctionComponent } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import emigroLogo from '@assets/images/emigro-logo.png';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

const Header: FunctionComponent = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('session');
    navigation.navigate('Login' as never);
  };

  return (
    <StyledView className="flex-row items-center justify-center bg-red pt-8">
      <TouchableOpacity onPress={() => navigation.navigate('Wallet' as never)}>
        <StyledView className="h-14 w-40">
          <StyledImage className="h-full w-full object-contain" source={emigroLogo} />
        </StyledView>
      </TouchableOpacity>
      <StyledText className="text-white text-lg py-2 absolute right-4 top-8" onPress={handleLogout}>
        Logout
      </StyledText>
    </StyledView>
  );
};

export default Header;
