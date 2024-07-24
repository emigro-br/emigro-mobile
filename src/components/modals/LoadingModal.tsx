import React from 'react';

import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';

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
                <Text size="lg" bold className="ml-2">
                  {text || 'Loading...'}
                </Text>
              </HStack>
            </Center>
          </ModalBody>
          <ModalFooter className="justify-center">
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
