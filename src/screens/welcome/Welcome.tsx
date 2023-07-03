import { styled } from 'nativewind';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import Header from '@components/Header';

const StyledView = styled(View);
const StyledText = styled(Text);

export const Welcome = ({ navigation }: any) => {
  return (
    <StyledView className="flex justify-center">
      <Header children />
      <StyledView className="px-16 my-12">
        <StyledText className="text-[24px] text-center mb-12">THE TRAVELLERS DIGITAL WALLET</StyledText>
        <StyledText className="text-[23px] text-center">Instant cross-border retail payments</StyledText>
      </StyledView>
      <StyledView className="bg-red mx-2 rounded-md mt-20">
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <StyledText className="text-[23px] text-center py-2 text-white">Create an Account</StyledText>
        </TouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
