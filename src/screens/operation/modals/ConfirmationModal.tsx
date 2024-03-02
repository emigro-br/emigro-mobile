import React, { useState } from 'react';

import {
  Button,
  ButtonGroup,
  ButtonText,
  HStack,
  Heading,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  VStack,
  View,
} from '@gluestack-ui/themed';

import { Sep24Transaction } from '@/types/Sep24Transaction';

import { LoadingModal } from './LoadingModal';

type Props = {
  title: string;
  isOpen: boolean;
  assetCode: string;
  transaction: Sep24Transaction;
  onPress: () => void;
  onClose: () => void;
  testID?: string;
};

export const ConfirmationModal: React.FC<Props> = ({
  title,
  isOpen,
  assetCode,
  transaction,
  onPress,
  onClose,
  testID = 'confirmation-modal',
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleOnPress = async () => {
    setIsProcessing(true);
    await onPress();
    setIsProcessing(false);
  };

  if (isProcessing) {
    return <LoadingModal isOpen={isProcessing} text="Processing..." />;
  }

  return (
    <View testID={testID}>
      <Modal isOpen={isOpen}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <HStack space="sm" alignItems="center">
              <Heading size="lg">{title}</Heading>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <Text size="lg" mb="$4">
              Are you sure you want to withdraw?
            </Text>
            <VStack space="xs">
              <Text>
                Requested: {transaction.amount_in} {assetCode}
              </Text>
              <Text>
                Fee: {transaction.amount_fee} {assetCode}
              </Text>
              <Text bold>
                You will receive: {transaction.amount_out} {assetCode}
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="outline" action="secondary" onPress={onClose}>
                <ButtonText>Close</ButtonText>
              </Button>
              <Button action="primary" onPress={handleOnPress}>
                <ButtonText>Confirm</ButtonText>
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </View>
  );
};
