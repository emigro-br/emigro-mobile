import React from 'react';
import { Text, View } from 'react-native';

import { styled } from 'nativewind';

import Button from '@components/Button';
import CustomModal from '@components/CustomModal';

const StyledView = styled(View);
const StyledText = styled(Text);

type Props = {
  isVisible: boolean;
  onConfirm: () => void;
};

export const OpenURLModal: React.FunctionComponent<Props> = ({ isVisible, onConfirm }) => (
  <CustomModal isVisible={isVisible}>
    <StyledView className="container h-max flex justify-between">
      <StyledText className="text-lg mb-4">
        You will be redirected to the Anchor website to complete this transaction.
      </StyledText>
      <StyledView className="items-center">
        <Button onPress={onConfirm} backgroundColor="red" textColor="white">
          Continue
        </Button>
      </StyledView>
    </StyledView>
  </CustomModal>
);
