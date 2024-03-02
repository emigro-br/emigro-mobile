import React from 'react';
import { Linking } from 'react-native';

import {
  Button,
  ButtonText,
  CheckCircleIcon,
  HStack,
  Heading,
  Icon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  View,
} from '@gluestack-ui/themed';

type SuccessModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  publicKey: string;
  testID?: string;
};

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  publicKey,
  testID = 'success-modal',
}) => (
  <View testID={testID}>
    <Modal isOpen={isOpen}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <HStack space="sm" alignItems="center">
            <Icon as={CheckCircleIcon} color="$success700" $dark-color="$success300" />
            <Heading size="lg">{title}</Heading>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <Text>
            You can check the status of your transaction in the{' '}
            <Text
              style={{ color: '#1D4ED8' }}
              onPress={() => Linking.openURL(`https://stellar.expert/explorer/public/account/${publicKey}`)}
            >
              Stellar explorer
            </Text>
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button action="positive" onPress={onClose}>
            <ButtonText>Close</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </View>
);
