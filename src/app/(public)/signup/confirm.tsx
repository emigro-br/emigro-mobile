import React, { useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { CheckCircleIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  CONFIRM_ACCOUNT_ERROR,
  WRONG_CODE_ERROR,
} from '@/constants/errorMessages';
import { confirmAccount } from '@/services/emigro/auth';

const ConfirmAccount = () => {
  const router = useRouter();
  const { email, externalId } = useLocalSearchParams<{
    email: string;
    externalId: string;
  }>();

  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!email || !externalId) {
    return (
      <Box className="flex-1 bg-black justify-center">
        <Center>
          <Text size="lg" className="text-white">
            Invalid confirmation link
          </Text>
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
    <Box className="flex-1 bg-black">
      <VStack space="lg" className="p-4">
        <Heading className="text-white text-center">
          Enter Confirmation Code
        </Heading>

        <Card className="bg-[#1a1a1a] rounded-2xl p-6">
          <VStack space="lg">
            <Text size="lg" className="text-white">
              Enter the confirmation code we sent to{' '}
              <Text bold className="text-white">
                {email}
              </Text>
              :
            </Text>
            <Input size="xl" isDisabled={isConfirming}>
              <InputField
                placeholder="Confirmation code"
                placeholderTextColor="#888"
                value={code}
                onChangeText={(text) => setCode(text)}
                className="text-white"
              />
            </Input>
            <Pressable
              onPress={handleConfirmation}
              disabled={!code || isConfirming}
              testID="confirm-button"
            >
              <Box
                className={`bg-primary-500 rounded-full py-4 items-center justify-center ${
                  !code || isConfirming ? 'opacity-50' : ''
                }`}
              >
                <Text className="text-white font-bold text-lg">
                  {isConfirming ? 'Verifying...' : 'Verify'}
                </Text>
              </Box>
            </Pressable>
          </VStack>
        </Card>

        {error ? (
          <Text
            className="text-error-500 text-center mt-2"
            testID="confirm-account-error"
          >
            {error}
          </Text>
        ) : null}
      </VStack>

      <ConfirmModal
        isOpen={isSuccessModalVisible}
        onConfirm={handleCloseConfirmationModal}
      />
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
            <Icon as={CheckCircleIcon} className="text-success-700" />
            <Heading size="lg">Confirmation successful</Heading>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <Text>Your account has been successfully confirmed.</Text>
        </ModalBody>
        <ModalFooter>
          <Pressable onPress={onConfirm} className="w-full">
            <Box className="bg-primary-500 rounded-full py-4 items-center justify-center w-full">
              <Text className="text-white font-bold text-lg">Continue</Text>
            </Box>
          </Pressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmAccount;
