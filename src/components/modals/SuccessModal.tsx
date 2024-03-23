import React from 'react';

import {
  Button,
  ButtonText,
  CheckCircleIcon,
  HStack,
  Heading,
  Icon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  View,
} from '@gluestack-ui/themed';

type SuccessModalProps = {
  isOpen: boolean;
  title: string;
  children?: React.ReactNode;
  onClose: () => void;
  testID?: string;
};

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  testID = 'success-modal',
}) => (
  <View testID={testID}>
    <Modal isOpen={isOpen}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <HStack space="sm" alignItems="center">
            <Icon as={CheckCircleIcon} color="$success700" $dark-color="$success300" />
            <Heading size="lg">{title}</Heading>
          </HStack>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button action="positive" onPress={onClose}>
            <ButtonText>Close</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </View>
);
