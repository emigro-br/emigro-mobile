import React from 'react';

import {
  Button,
  ButtonText,
  CloseCircleIcon,
  HStack,
  Heading,
  Icon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  View,
} from '@gluestack-ui/themed';

type Props = {
  isOpen: boolean;
  title: string;
  errorMessage: string;
  onClose: () => void;
  testID?: string;
};

export const ErrorModal: React.FC<Props> = ({ title, isOpen, errorMessage, onClose, testID = 'error-modal' }) => (
  <View testID={testID}>
    <Modal isOpen={isOpen}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <HStack space="sm" alignItems="center">
            <Icon as={CloseCircleIcon} color="$error700" />
            <Heading size="lg">{title}</Heading>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <Text>{errorMessage}</Text>
        </ModalBody>
        <ModalFooter>
          <Button action="negative" onPress={onClose}>
            <ButtonText>Close</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </View>
);
