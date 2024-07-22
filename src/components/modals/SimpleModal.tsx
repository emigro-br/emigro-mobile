import { View } from "@/components/ui/view";

import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";

import { Heading } from "@/components/ui/heading";
import { CloseIcon, Icon } from "@/components/ui/icon";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import React from 'react';

type Props = {
  isOpen: boolean;
  title: string;
  children?: React.ReactNode;
  onAction?: () => void;
  onClose?: () => void;
  testID?: string;
};

export const SimpleModal = ({ isOpen, title, children, onClose, onAction, testID }: Props) => {
  if (!isOpen) return;

  return (
    <View testID={testID}>
      <Modal isOpen={isOpen} size="lg">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg" className="w-5/6">
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
