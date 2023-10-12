import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import emigroLogo from '@assets/images/emigro-logo.png';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

export const Welcome = () => {
  const navigation = useNavigation();
  return (
    <StyledView className="flex justify-center">
      <StyledView className="flex-row items-center justify-center bg-red pt-8">
        <StyledView className="h-14 w-40">
          <StyledImage className="h-full w-full object-contain" source={emigroLogo}></StyledImage>
        </StyledView>
      </StyledView>
      <StyledView className="px-16 my-12">
        <StyledText className="text-[24px] text-center mb-12">THE TRAVELLERS DIGITAL WALLET</StyledText>
        <StyledText className="text-[23px] text-center">Instant cross-border retail payments</StyledText>
      </StyledView>
      <StyledView className="bg-blue mx-2 rounded-md mt-20">
        <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
          <StyledText className="text-[23px] text-center py-2 text-white">Create an Account</StyledText>
        </TouchableOpacity>
      </StyledView>
      <StyledText className="text-lg text-center my-8">Already have an account?</StyledText>
      <StyledView className="bg-red mx-2 rounded-md">
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <StyledText className="text-[23px] text-center py-2 text-white">Log In</StyledText>
        </TouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
