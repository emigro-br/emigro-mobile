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
  View,
} from '@gluestack-ui/themed';

type Props = {
  isOpen: boolean;
  title: string;
  children?: React.ReactNode;
  onAction?: () => void;
  onClose?: () => void;
  testID?: string;
};

export const SimpleModal = ({
  isOpen,
  title,
  children,
  onClose,
  onAction,
  testID,
}: Props) => {
  if (!isOpen) return;

  return (
    <View testID={testID}>
      <Modal isOpen={isOpen}>
        <ModalBackdrop />
        <ModalContent width="90%">
          <ModalHeader>
            <Heading size="lg" w="$5/6">
              {title}
            </Heading>
            <ModalCloseButton onPress={onClose}>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          {children && <ModalBody>{children}</ModalBody>}
          <ModalFooter>
            <ButtonGroup>
              <Button variant="outline" action="secondary" onPress={onClose}>
                <ButtonText>Close</ButtonText>
              </Button>
              <Button onPress={onAction} action="primary">
                <ButtonText>Deposit now</ButtonText>
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </View>
  );
};
