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
import { confirmAccount, resendConfirmationCode } from '@/services/emigro/auth';


const ConfirmAccount = () => {
  const router = useRouter();
  const { email, externalId } = useLocalSearchParams<{
    email: string;
    externalId: string;
  }>();

  // 🔎 Normalize possible array params & log
  const emailParam = Array.isArray(email) ? email[0] : email;
  const externalIdParam = Array.isArray(externalId) ? externalId[0] : externalId;
  const externalIdClean = externalIdParam && externalIdParam.trim().length > 0 ? externalIdParam : undefined;

  console.log('[confirm.tsx][params]', {
    raw: { email, externalId },
    normalized: { emailParam, externalIdParam, externalIdClean },
  });

  
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [info, setInfo] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // We must have an email; externalId is preferred but may be empty if coming from login redirect
  if (!emailParam) {
    console.log('[confirm.tsx] ❌ Missing emailParam, cannot proceed');
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
      console.log('[confirm.tsx][handleConfirmation] ➡️ payload:', {
        email: emailParam,
        externalId: externalIdParam,
        code,
      });
	  const payload: any = { email: emailParam as string, code };
	  if (externalIdClean) payload.externalId = externalIdClean;

	  const response = await confirmAccount(payload);
	  console.log('[confirm.tsx][handleConfirmation] ⬅️ response:', response);


	  if (response) {
	    setIsSuccessModalVisible(true);
	  } else {
	    setError(WRONG_CODE_ERROR);
	  }
	  
	  } catch (error: any) {
	    const msg = (error?.message || error?.response?.data || '').toString();
	    console.log('[confirm.tsx][handleConfirmation] ❌ error:', {
	      status: error?.response?.status,
	      data: error?.response?.data,
	      message: error?.message,
	    });

	    // ✅ Idempotent client: if backend says CONFIRMED already, treat as success
	    if (/status\s+is\s+CONFIRMED/i.test(msg) || /already\s*confirm/i.test(msg)) {
	      setIsSuccessModalVisible(true);
	    } else {
	      Sentry.captureException(error);
	      setError(CONFIRM_ACCOUNT_ERROR);
	    }
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
                {emailParam}
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
			{/* Resend code with cooldown + feedback */}
			<Pressable
			  disabled={isResending || resendCooldown > 0}
			  onPress={async () => {
			    try {
			      setError('');
			      setInfo('');
			      setIsResending(true);
				        console.log('[confirm.tsx][resend] ➡️ calling with:', {
				          email: emailParam,
				          externalId: externalIdClean,
				        });
				  const res = await resendConfirmationCode(emailParam as string, externalIdClean);

			      console.log('[confirm.tsx][resend] ⬅️ result:', res);

			      const data = res?.data || {};
			      if (data.blocked) {
			        setError(data.message || 'Too many requests. Please try again in 24 hours.');
			        if (typeof data.secondsToWait === 'number') {
			          setResendCooldown(data.secondsToWait);
			        }
			        return;
			      }

			      if (res?.success) {
			        setInfo(data.message || 'Verification code sent. Check your inbox and spam folder.');
			        if (typeof data.secondsToWait === 'number' && data.secondsToWait > 0) {
			          setResendCooldown(data.secondsToWait);
			        } else {
			          setResendCooldown(15);
			        }
			      } else {
			        setError('Failed to resend the code. Please try again shortly.');
			      }
			    } catch (e: any) {
			      console.log('[confirm.tsx][resend] ❌ error:', {
			        status: e?.response?.status,
			        data: e?.response?.data,
			        message: e?.message,
			      });
			      setError('Failed to resend the code. Please try again.');
			    } finally {
			      setIsResending(false);
			    }
			  }}
			>
			  <Box className={`rounded-full py-3 items-center justify-center mt-3 border ${resendCooldown > 0 ? 'border-[#555]' : 'border-[#333]'}`}>
			    <Text className="text-white">
			      {isResending
			        ? 'Sending code…'
			        : resendCooldown > 0
			          ? `Resend code (${resendCooldown}s)`
			          : 'Resend code'}
			    </Text>
			  </Box>
			</Pressable>



          </VStack>
        </Card>
		{info ? (
		  <Text className="text-success-500 text-center mt-2">
		    {info}
		  </Text>
		) : null}

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
