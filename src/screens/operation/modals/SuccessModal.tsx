import React from 'react';
import { Linking, Text, View } from 'react-native';

import { styled } from 'nativewind';

import Button from '@components/Button';
import CustomModal from '@components/CustomModal';

const StyledView = styled(View);
const StyledText = styled(Text);

type SuccessModalProps = {
  isVisible: boolean;
  onClose: () => void;
  publicKey: string;
};

export const SuccessModal: React.FunctionComponent<SuccessModalProps> = ({ isVisible, onClose, publicKey }) => (
  <CustomModal isVisible={isVisible}>
    <StyledView className="container h-max flex justify-between">
      <StyledView className="flex flex-col justify-center items-center">
        <StyledText className="text-2xl font-bold text-center mb-4">Transaction successful!</StyledText>
        <StyledText className="text-center mb-4">
          You can check the status of your transaction in the{' '}
          <Text
            style={{ color: '#1D4ED8' }}
            onPress={() => Linking.openURL(`https://stellar.expert/explorer/public/account/${publicKey}`)}
          >
            Stellar explorer
          </Text>
        </StyledText>
        <Button onPress={onClose} backgroundColor="red" textColor="white">
          <Text>Close</Text>
        </Button>
      </StyledView>
    </StyledView>
  </CustomModal>
);
