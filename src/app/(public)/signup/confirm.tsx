import React, { useState } from 'react';

import {
  Box,
  Button,
  ButtonText,
  Card,
  Center,
  CheckCircleIcon,
  FormControlErrorText,
  HStack,
  Heading,
  Icon,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import * as Sentry from '@sentry/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

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
      <Box flex={1} justifyContent="center">
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
    <Box flex={1}>
      <VStack p="$4" space="lg">
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

        <FormControlErrorText testID="confirm-account-error">{error}</FormControlErrorText>
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
          <HStack space="sm" alignItems="center">
            <Icon as={CheckCircleIcon} color="$success700" $dark-color="$success300" />
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
