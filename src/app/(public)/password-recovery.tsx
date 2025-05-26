import React, { useState, useRef } from 'react';
import { Animated, Keyboard, TextInput } from 'react-native';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Icon, LockIcon } from '@/components/ui/icon';
import { Toast } from '@/components/Toast';
import { useToast } from '@/components/ui/toast';
import { Pressable } from '@/components/ui/pressable';
import { resetPassword } from '@/services/emigro/auth';

type FormData = {
  email: string;
};

const PasswordRecovery = () => {
  const router = useRouter();
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<FormData>({
    defaultValues: { email: '' },
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const onSubmit: SubmitHandler<FormData> = async ({ email }) => {
    Keyboard.dismiss();
    setIsSending(true);

    try {
      const result = await resetPassword(email);
      if (result.success) {
        router.push({ pathname: '/create-password', params: { email } });
      }
    } catch (error) {
      toast.show({
        duration: 8000,
        render: ({ id }) => (
          <Toast
            id={id}
            title="Failed to reset your password"
            description={
              error instanceof Error
                ? error.message
                : 'Could not send the recovery e-mail, please try again later.'
            }
            action="error"
          />
        ),
      });
    } finally {
      setIsSending(false);
    }
  };

  const { isDirty, isValid } = formState;
  const isDisabled = !isDirty || !isValid || isSending;

  return (
    <Box className="flex-1 bg-black justify-center">
      <VStack space="lg" className="p-6">
        <HStack className="items-center mb-4">
          <Icon as={LockIcon} size="xl" className="text-primary-500 mr-2" />
          <Heading size="xl" className="text-white">
            Password Recovery
          </Heading>
        </HStack>

        <Text className="text-white mb-2">
          Enter your email address and we will send you instructions to reset your password.
        </Text>

        <Controller
          control={control}
          name="email"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Email"
              placeholderTextColor="#888"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 30,
                paddingVertical: 12,
                paddingHorizontal: 20,
                fontSize: 16,
                textAlign: 'center',
                color: 'white',
                borderWidth: 1,
                borderColor: focusedField === 'email' ? '#ff0033' : '#333',
              }}
            />
          )}
        />

        <Pressable onPressIn={animatePress} onPress={handleSubmit(onSubmit)} disabled={isDisabled}>
          <Animated.View
            style={{ transform: [{ scale: scaleAnim }] }}
            className={`bg-primary-500 rounded-full py-4 items-center justify-center mt-4 ${
              isDisabled ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {isSending ? 'Sending...' : 'Send Email'}
            </Text>
          </Animated.View>
        </Pressable>
      </VStack>
    </Box>
  );
};

export default PasswordRecovery;
