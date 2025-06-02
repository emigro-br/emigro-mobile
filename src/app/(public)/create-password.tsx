import { useState } from 'react';
import {
  Keyboard,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Toast } from '@/components/Toast';
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
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { PinScreen } from '@/screens/PinScreen';
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
      render: ({ id }) => (
        <Toast
          id={id}
          title="Failed to create new password"
          description={message}
          action="error"
        />
      ),
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <Box className="flex-1 bg-black justify-center">
            <VStack space="lg" className="p-6">
              <Heading size="xl" className="text-white text-center mb-6">
                Create New Password
              </Heading>

              <Text className="text-white text-center mb-4">
                Enter your new password and confirm it.
              </Text>

              <TextInput
                placeholder={`At least ${minPasswordLength} characters`}
                placeholderTextColor="#888"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                style={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: 30,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  fontSize: 16,
                  textAlign: 'center',
                  color: 'white',
                  borderWidth: 1,
                  borderColor: '#333',
                  marginBottom: 16,
                }}
              />

              <TextInput
                placeholder="Confirm password"
                placeholderTextColor="#888"
                secureTextEntry
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: 30,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  fontSize: 16,
                  textAlign: 'center',
                  color: 'white',
                  borderWidth: 1,
                  borderColor: '#333',
                  marginBottom: 16,
                }}
              />

              {password.length > 0 && !isValidForm && (
                <FormControl isInvalid>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>{formError}</FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}

              <Button
                size="xl"
                className="rounded-full bg-primary-500 mt-4"
                onPress={handleCreatePassword}
                disabled={!isValidForm || isSending}
              >
                <ButtonText className="text-white font-bold text-lg">
                  {isSending ? 'Validating...' : 'Create new password'}
                </ButtonText>
              </Button>
            </VStack>
          </Box>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CreateNewPassword;
