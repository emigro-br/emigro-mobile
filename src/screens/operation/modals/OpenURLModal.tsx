import React from 'react';

import {
  Button,
  ButtonText,
  Heading,
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
  onConfirm: () => void;
};

export const OpenURLModal: React.FunctionComponent<Props> = ({ isOpen, onConfirm }) => (
  <View testID="open-url-modal">
    <Modal isOpen={isOpen}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Redirect Notice</Heading>
        </ModalHeader>
        <ModalBody>
          <Text>You will be redirected to the Anchor website to complete this transaction.</Text>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onConfirm} action="primary">
            <ButtonText>Continue to Anchor</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </View>
);
