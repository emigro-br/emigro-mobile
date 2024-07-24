import React from 'react';

import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { CloseCircleIcon, Icon } from '@/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';

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
          <HStack space="sm" className="items-center">
            <Icon as={CloseCircleIcon} className="text-error-700" />
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
