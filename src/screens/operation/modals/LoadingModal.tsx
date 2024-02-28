import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { styled } from 'nativewind';

import Button from '@components/Button';
import CustomModal from '@components/CustomModal';

const StyledView = styled(View);
const StyledText = styled(Text);

type Props = {
  isVisible: boolean;
  label?: string;
  onClose?: () => void;
};

export const LoadingModal: React.FC<Props> = ({ isVisible, label, onClose }) => (
  <CustomModal isVisible={isVisible}>
    <StyledView className="container h-max flex justify-between" testID="loading-modal">
      <StyledView className="flex flex-col justify-center items-center">
        <StyledText className="text-2xl font-bold text-center mb-4">{label || 'Loading...'}</StyledText>
        <ActivityIndicator size="large" />
      </StyledView>
      {onClose && (
        <StyledView className="flex flex-col justify-center items-center">
          <Button textColor="red" onPress={onClose}>
            Close
          </Button>
        </StyledView>
      )}
    </StyledView>
  </CustomModal>
);
