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
  isLoading?: boolean;
  onConfirm: () => void;
  onClose?: () => void;
  testID?: string;
};

export const OpenURLModal: React.FC<Props> = ({
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
  testID = 'open-url-modal',
}) => {
  if (!isOpen) return;

  return (
    <View testID={testID}>
      <Modal isOpen={isOpen}>
        <ModalBackdrop />
        <ModalContent width="90%">
          <ModalHeader>
            <Heading size="lg" w="$5/6">
              Finish this transaction alongside our partner
            </Heading>
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
              <Button onPress={onConfirm} action="primary" isDisabled={isLoading}>
                <ButtonText>{isLoading ? 'Please wait...' : 'Continue'}</ButtonText>
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </View>
  );
};
