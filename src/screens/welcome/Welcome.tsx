import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import emigroLogo from '@assets/images/emigro-logo.png';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

export const Welcome: React.FunctionComponent = () => {
  const navigation = useNavigation();
  return (
    <StyledView className="flex">
      <StyledView className="items-center justify-center bg-red pt-40 pb-20">
        <StyledView className="h-20 w-80 mb-10">
          <StyledImage className="h-full w-full object-contain" source={emigroLogo} />
        </StyledView>
        <StyledText className="text-2xl text-center text-white font-bold mb-2">The Travellers Digital Wallet</StyledText>
        <StyledText className="text-lg text-white text-center">Instant cross-border retail payments</StyledText>
      </StyledView>


      <StyledView className="bg-transparent border border-red rounded-md mx-4 mt-10 mb-4">
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <StyledText className="text-red text-lg font-semibold text-center py-2">Access your account</StyledText>
        </TouchableOpacity>
      </StyledView>

      <StyledView className="bg-red rounded-md mx-4">
        <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
          <StyledText className="text-lg text-center font-semibold py-2 text-white">Create an Account</StyledText>
        </TouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
