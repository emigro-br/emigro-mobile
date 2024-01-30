import { styled } from 'nativewind';
import React from 'react';
import { Text, View } from 'react-native';
import CustomModal from '@components/CustomModal';
import Button from '@components/Button';

const StyledView = styled(View);
const StyledText = styled(Text);

type ErrorModalProps = {
  isVisible: boolean;
  errorMessage: string;
  onClose: () => void;
};

export const ErrorModal: React.FunctionComponent<ErrorModalProps> = ({ isVisible, errorMessage, onClose }) => (
  <CustomModal isVisible={isVisible}>
    <StyledView className="container h-max flex justify-between">
      <StyledView className="flex flex-col justify-center items-center">
        <StyledText className="text-2xl font-bold text-center mb-4">Transaction Failed</StyledText>
        <StyledText className="text-center mb-4">
          Failed message: <Text>{errorMessage}</Text>
        </StyledText>
        <Button onPress={onClose} backgroundColor="red" textColor="white">
          <Text>Close</Text>
        </Button>
      </StyledView>
    </StyledView>
  </CustomModal>
);
