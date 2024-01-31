import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import CustomModal from '@components/CustomModal';
import Button from '@components/Button';
import { LoadingModal } from './LoadingModal';
import { Sep24Transaction } from '../../../types/Sep24Transaction';

const StyledView = styled(View);
const StyledText = styled(Text);

type ConfirmationModalProps = {
  isVisible: boolean;
  assetCode: string;
  transaction: Sep24Transaction;
  onPress: () => void;
  onClose: () => void;
};

export const ConfirmationModal: React.FunctionComponent<ConfirmationModalProps> = ({ isVisible, assetCode, transaction, onPress, onClose }) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleOnPress = async () => {
    setIsProcessing(true);
    await onPress();
    setIsProcessing(false);
  };

  if (isProcessing) {
    return (
      <LoadingModal isVisible={isProcessing} label='Processing...' />
    );
  }

  return (
    <CustomModal isVisible={isVisible}>
      <StyledView className="container h-max flex justify-between">
        <StyledView className="flex flex-col justify-center">
          <StyledText className="text-2xl font-bold text-center mb-4">Confirm the transaction</StyledText>
          <StyledText className="mb-4">
            Are you sure you want to withdraw?
          </StyledText>
          <StyledText className="mb-2">
            Requested: {transaction.amount_in} {assetCode}
          </StyledText>
          <StyledText className="mb-2">
            Fee: {transaction.amount_fee} {assetCode}
          </StyledText>
          <StyledText className="mb-4 font-bold">
            You will receive: {transaction.amount_out} {assetCode}
          </StyledText>
          <StyledView className="w-full">
            <Button onPress={handleOnPress} backgroundColor="red" textColor="white">
              <Text>Confirm</Text>
            </Button>
          </StyledView>
          <StyledView className="items-center">
            <TouchableOpacity onPress={onClose}>
              <StyledText className='text-center text-red mt-2 py-2 px-3'>Cancel</StyledText>
            </TouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>
    </CustomModal>
  );
}; 
