import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { styled } from 'nativewind';

import CustomModal from '@components/CustomModal';

const StyledView = styled(View);
const StyledText = styled(Text);

type LoadingModalProps = {
  isVisible: boolean;
  label?: string;
};

export const LoadingModal: React.FunctionComponent<LoadingModalProps> = ({ isVisible, label }) => (
  <CustomModal isVisible={isVisible}>
    <StyledView className="container h-max flex justify-between">
      <StyledView className="flex flex-col justify-center items-center">
        <StyledText className="text-2xl font-bold text-center mb-4">{label || 'Loading...'}</StyledText>
        <ActivityIndicator size="large" />
      </StyledView>
    </StyledView>
  </CustomModal>
);
