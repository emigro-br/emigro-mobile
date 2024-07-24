import { useState } from 'react';
import { Keyboard } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { Toast } from '@/components/Toast';
import { PinScreen } from '@/components/screens/PinScreen';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { AlertCircleIcon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { confirmResetPassword } from '@/services/emigro/auth';
import { CustomError } from '@/types/errors';

const minPasswordLength = 8;

export const CreateNewPassword = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email } = params;

  const toast = useToast();
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSending, setIsSending] = useState(false);

  const cleanUp = () => {
    setPin('');
    setPassword('');
    setConfirmPassword('');
  };

  // FIXME: use some validation library: react-hook-form, formik, yup
  const validateForm = () => {
    if (password.length < minPasswordLength) {
      return `Password must be at least ${minPasswordLength} characters long`;
    }
    if (confirmPassword.length < minPasswordLength) {
      return `Confirm password must be at least ${minPasswordLength} characters long`;
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleCreatePassword = async () => {
    Keyboard.dismiss();
    const defaultError = 'Could not create a new password, please try again later.';
    try {
      setIsSending(true);
      const result = await confirmResetPassword(email, pin, password);
      if (result.success) {
        onSuccess();
      } else {
        onError(defaultError);
      }
    } catch (error) {
      let message = defaultError;
      if (error instanceof Error) {
        message = error.message;
      }
      onError(message);

      // required to type the reset code again
      if (error instanceof CustomError && error.name === 'ExpiredCodeException') {
        cleanUp();
      }
    } finally {
      setIsSending(false);
    }
  };

  const onSuccess = () => {
    toast.show({
      duration: 5000,
      render: ({ id }) => (
        <Toast
          id={id}
          title="Password created"
          description="Your password has been created successfully."
          action="success"
        />
      ),
    });
    router.push('/login');
  };

  const onError = (message: string) => {
    toast.show({
      duration: 10000,
      render: ({ id }) => <Toast id={id} title="Failed on create new password" description={message} action="error" />,
    });
  };

  if (!pin) {
    return (
      <PinScreen
        pinSize={6}
        tagline="Password Reset Code"
        description="Enter the code you received in your email."
        btnLabel="Continue"
        secureTextEntry={false}
        verifyPin={() => Promise.resolve(true)}
        onPinSuccess={setPin}
        onPinFail={() => {}}
      />
    );
  }

  const formError = validateForm();
  const isValidForm = formError === '';

  return (
    <Box className="flex-1 bg-white">
      <VStack space="2xl" className="p-4">
        <Heading>Create New Password</Heading>
        <Text>Enter your new password and confirm it.</Text>
        <FormControl>
          <Input size="lg">
            <InputField
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholder={`at least ${minPasswordLength} chars`}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="next"
            />
          </Input>
        </FormControl>
        <Input size="lg">
          <InputField
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            placeholder="Confirm password"
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="done"
          />
        </Input>
        {password.length > 0 && !isValidForm && (
          <FormControl isInvalid={!isValidForm}>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} />
              <FormControlErrorText>{formError}</FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
        <Button size="xl" onPress={handleCreatePassword} isDisabled={!isValidForm || isSending}>
          <ButtonText>{isSending ? 'Validating...' : 'Create new password'}</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

export default CreateNewPassword;
