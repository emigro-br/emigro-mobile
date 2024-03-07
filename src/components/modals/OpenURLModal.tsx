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
          <Heading size="lg">Redirect Notice</Heading>
          <ModalCloseButton onPress={onClose}>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <Text>You will be redirected to the Anchor website to complete this transaction.</Text>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="outline" action="secondary" onPress={onClose}>
              <ButtonText>Close</ButtonText>
            </Button>
            <Button onPress={onConfirm} action="primary">
              <ButtonText>Continue to Anchor</ButtonText>
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </View>
);
