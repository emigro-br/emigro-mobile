import React from 'react';

import {
  Button,
  ButtonText,
  Center,
  HStack,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Text,
  View,
} from '@gluestack-ui/themed';

type Props = {
  isOpen: boolean;
  text?: string;
  onClose?: () => void;
  testID?: string;
};

export const LoadingModal: React.FC<Props> = ({ isOpen, text, onClose, testID = 'loading-modal' }) => {
  if (!isOpen) return;

  return (
    <View testID={testID}>
      <Modal isOpen={isOpen}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader />
          <ModalBody>
            <Center>
              <HStack>
                <Spinner size="small" />
                <Text size="lg" bold ml="$2">
                  {text || 'Loading...'}
                </Text>
              </HStack>
            </Center>
          </ModalBody>
          <ModalFooter justifyContent="center">
            {onClose && (
              <Button onPress={onClose} action="primary">
                <ButtonText>Close</ButtonText>
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </View>
  );
};
