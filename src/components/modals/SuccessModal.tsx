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

type Props = {
  isOpen: boolean;
  title: string;
  children?: React.ReactNode;
  onClose: () => void;
  testID?: string;
};

export const SuccessModal: React.FC<Props> = ({ isOpen, title, children, onClose, testID = 'success-modal' }) => (
  <View testID={testID}>
    <Modal isOpen={isOpen} size="lg">
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
