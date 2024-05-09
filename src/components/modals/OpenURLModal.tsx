import React from 'react';

import {
  Button,
  ButtonGroup,
  ButtonText,
  CloseIcon,
  Heading,
  Icon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  View,
} from '@gluestack-ui/themed';

type Props = {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  testID?: string;
};

export const OpenURLModal: React.FunctionComponent<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  testID = 'open-url-modal',
}) => (
  <View testID={testID}>
    <Modal isOpen={isOpen}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">We're taking you to an external website</Heading>
          <ModalCloseButton onPress={onClose}>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <Text>You'll be taken outside Emigro app to complete this transaction in the Anchor website.</Text>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="outline" action="secondary" onPress={onClose}>
              <ButtonText>Close</ButtonText>
            </Button>
            <Button onPress={onConfirm} action="primary">
              <ButtonText>Ok, continue</ButtonText>
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </View>
);
