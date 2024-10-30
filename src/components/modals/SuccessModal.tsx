import React from 'react';

import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { CheckCircleIcon, Icon } from '@/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { View } from '@/components/ui/view';

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
          <HStack space="sm" className="items-center">
            <Icon as={CheckCircleIcon} className="text-success-700" />
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
