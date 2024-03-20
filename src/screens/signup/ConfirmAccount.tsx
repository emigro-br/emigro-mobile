import React, { useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

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

import { CONFIRM_ACCOUNT_ERROR, WRONG_CODE_ERROR } from '@constants/errorMessages';

import { AnonStackParamList } from '@navigation/AnonStack';

import { confirmAccount } from '@services/auth';

type Props = NativeStackScreenProps<AnonStackParamList, 'ConfirmAccount'>;

const ConfirmAccount = ({ route, navigation }: Props) => {
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState<boolean>(false);
  const [isConfirmationSuccessful, setIsConfirmationSuccessful] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const { email, username } = route.params;

  if (!email || !username) {
    return (
      <Box flex={1} justifyContent="center">
        <Center>
          <Text size="lg">Invalid confirmation link</Text>
        </Center>
      </Box>
    );
  }

  const handleConfirmation = async () => {
    // FIXME: is not even checking if the confirmationCode is empty
    try {
      setIsLoading(true);
      setError('');
      const response = await confirmAccount({ email, username, code: confirmationCode });
      if (response?.status) {
        setIsConfirmationSuccessful(true);
        setIsConfirmationModalVisible(true);
      } else {
        setError(WRONG_CODE_ERROR);
      }
    } catch (error) {
      Sentry.captureException(error);
      // FIXME: Whe user alread confirmed: ConfirmUserError: ConfirmUserWithCognitoError: Invalid code provided, please request a code again.
      setError(CONFIRM_ACCOUNT_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseConfirmationModal = () => {
    setIsConfirmationModalVisible(false);
    if (isConfirmationSuccessful) {
      navigation.navigate('Login');
    }
  };

  return (
    <Box flex={1}>
      <VStack p="$4" space="lg">
        <Heading>Confirm your Account</Heading>

        <Card>
          <VStack space="lg">
            <Text size="lg">Enter the confirmation code sent to your email:</Text>
            <Input size="xl">
              <InputField
                placeholder="Confirmation code"
                value={confirmationCode}
                onChangeText={(text) => setConfirmationCode(text)}
              />
            </Input>
            <Button onPress={handleConfirmation} isDisabled={isLoading}>
              <ButtonText>Confirm Account</ButtonText>
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

      <ConfirmModal isOpen={isConfirmationModalVisible} onConfirm={handleCloseConfirmationModal} />
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
