import React, { useState } from 'react';

import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { View } from '@/components/ui/view';

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
            <HStack space="sm" className="items-center">
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
