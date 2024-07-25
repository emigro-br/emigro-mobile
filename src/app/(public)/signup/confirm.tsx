import React, { useState } from 'react';

import * as Sentry from '@sentry/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { CheckCircleIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CONFIRM_ACCOUNT_ERROR, WRONG_CODE_ERROR } from '@/constants/errorMessages';
import { confirmAccount } from '@/services/emigro/auth';

const ConfirmAccount = () => {
  const router = useRouter();
  const { email, externalId } = useLocalSearchParams<{ email: string; externalId: string }>();
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!email || !externalId) {
    return (
      <Box className="flex-1 justify-center">
        <Center>
          <Text size="lg">Invalid confirmation link</Text>
        </Center>
      </Box>
    );
  }

  const handleConfirmation = async () => {
    try {
      setIsConfirming(true);
      setError('');
      const response = await confirmAccount({ email, code, externalId });
      if (response?.status) {
        setIsSuccessModalVisible(true);
      } else {
        setError(WRONG_CODE_ERROR);
      }
    } catch (error) {
      Sentry.captureException(error);
      setError(CONFIRM_ACCOUNT_ERROR);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCloseConfirmationModal = () => {
    setIsSuccessModalVisible(false);
    router.navigate('/login');
  };

  return (
    <Box className="flex-1">
      <VStack space="lg" className="p-4">
        <Heading>Enter Confirmation Code</Heading>

        <Card>
          <VStack space="lg">
            <Text size="lg">
              Enter the confirmation code we sent to <Text bold>{email}</Text>:
            </Text>
            <Input size="xl" isDisabled={isConfirming}>
              <InputField placeholder="Confirmation code" value={code} onChangeText={(text) => setCode(text)} />
            </Input>
            <Button onPress={handleConfirmation} isDisabled={!code || isConfirming} testID="confirm-button">
              <ButtonText>Verify</ButtonText>
            </Button>
          </VStack>
        </Card>

        {/* <Text>Didn't receive the code?
          <Link onPress={() => console.log('send')}>
              <Text color="$primary500" ml="$2" bold>Resend it</Text>
          </Link>
        </Text> */}

        <Text className="text-error-500" testID="confirm-account-error">
          {error}
        </Text>
      </VStack>
      <ConfirmModal isOpen={isSuccessModalVisible} onConfirm={handleCloseConfirmationModal} />
    </Box>
  );
};

type ConfirmModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
};

const ConfirmModal = ({ isOpen, onConfirm }: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <HStack space="sm" className="items-center">
            <Icon as={CheckCircleIcon} className="text-success-700  dark:text-success-300" />
            <Heading size="lg">Confirmation successful</Heading>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <Text>Your account has been successfully confirmed.</Text>
        </ModalBody>
        <ModalFooter>
          <Button action="primary" onPress={onConfirm}>
            <ButtonText>Continue</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmAccount;
