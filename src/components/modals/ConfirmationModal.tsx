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
  View,
} from '@gluestack-ui/themed';

import { LoadingModal } from './LoadingModal';

type Props = {
  title: string;
  isOpen: boolean;
  children: React.ReactNode;
  onPress: () => void;
  onClose: () => void;
  testID?: string;
};

export const ConfirmationModal: React.FC<Props> = ({
  title,
  isOpen,
  children,
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
      <Modal isOpen={isOpen} size="lg">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <HStack space="sm" alignItems="center">
              <Heading size="lg">{title}</Heading>
            </HStack>
          </ModalHeader>
          <ModalBody>{children}</ModalBody>
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
