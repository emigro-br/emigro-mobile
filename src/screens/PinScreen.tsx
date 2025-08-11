import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  ScrollView,
  TextInput as RNTextInput,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

class InvalidPinError extends Error {
  constructor() {
    super('Invalid PIN');
    this.name = 'InvalidPinError';
  }
}

const defaultPinSize = 4;
const defaultMaxAttempts = 3;

type Props = {
  tagline?: string;
  description?: string;
  btnLabel?: string;
  verifyPin?: (pin: string) => Promise<boolean>;
  onPinSuccess: (pin: string) => void;
  onPinFail: (error: Error) => void;
  maxAttempts?: number;
  pinSize?: number;
  autoSubmit?: boolean;
  secureTextEntry?: boolean;
};

export const PinScreen = forwardRef(
  (
    {
      tagline,
      description,
      btnLabel,
      maxAttempts = defaultMaxAttempts,
      pinSize = defaultPinSize,
      secureTextEntry = true,
      autoSubmit = false,
      verifyPin,
      onPinSuccess,
      onPinFail,
    }: Props,
    ref,
  ) => {
    const [pin, setPin] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [error, setError] = useState('');
    const [isSending, setIsSending] = useState(false);
    const inputRefs = useRef<RNTextInput[]>([]);
    const insets = useSafeAreaInsets();

    useEffect(() => {
      inputRefs.current[0]?.focus();
    }, []);

    useImperativeHandle(ref, () => ({
      clear,
    }));

    const clear = () => {
      setPin('');
      inputRefs.current[0]?.focus();
    };

    const handleSubmitPin = async (value: string) => {
      if (value.length !== pinSize) {
        setError(`PIN must be ${pinSize} digits`);
        return;
      }
      setIsSending(true);
      try {
        const isPinCorrect = await verifyPin?.(value);
        if (!isPinCorrect) throw new InvalidPinError();
        onPinSuccess(value);
      } catch (e) {
        if (e instanceof InvalidPinError) {
          setError('PIN is incorrect');
          if (attempts + 1 >= maxAttempts) {
            setError('Maximum attempts reached');
            onPinFail(new Error('Maximum attempts reached'));
          } else {
            setAttempts((prev) => prev + 1);
            clear();
          }
        } else if (e instanceof Error) {
          setError(e.message);
          onPinFail(e);
        } else {
          setError('An error occurred');
          onPinFail(new Error('An error occurred'));
        }
      } finally {
        setIsSending(false);
      }
    };

    const contentContainerStyle: ViewStyle = {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: Math.max(insets.bottom, 16) + 24, // keep button above keyboard/home bar
    };

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          // Offset accounts for the notch/header so padding behavior lines up nicely
          keyboardVerticalOffset={insets.top}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
              contentContainerStyle={contentContainerStyle}
              keyboardShouldPersistTaps="handled"
            >
              <Box className="flex-1">
                <VStack space="4xl">
                  <Heading size="xl" className="text-white text-center">
                    {tagline ?? 'Enter your PIN code'}
                  </Heading>

                  {description ? (
                    <Text className="text-white text-center text-base mt-2">
                      {description}
                    </Text>
                  ) : null}

                  <HStack space="md" className="justify-center mt-10 mb-4">
                    {[...Array(pinSize)].map((_, i) => (
                      <Input
                        key={i}
                        variant="underlined"
                        size="xl"
                        className="w-14 h-16 border-white items-center justify-center"
                      >
                        <InputField
                          ref={(r: RNTextInput) => {
                            // store refs safely
                            if (r) inputRefs.current[i] = r;
                          }}
                          value={pin[i] ?? ''}
                          maxLength={1}
                          autoFocus={i === 0}
                          returnKeyType={i === pinSize - 1 ? 'done' : 'next'}
                          blurOnSubmit={false}
                          onSubmitEditing={() => {
                            if (i < pinSize - 1) {
                              inputRefs.current[i + 1]?.focus();
                            } else if (pin.length === pinSize) {
                              handleSubmitPin(pin);
                            }
                          }}
                          onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === 'Backspace') {
                              if (!pin[i] && inputRefs.current[i - 1]) {
                                inputRefs.current[i - 1].focus();
                                const newPin = pin.split('');
                                newPin[i - 1] = '';
                                setPin(newPin.join(''));
                              }
                            }
                          }}
                          onChangeText={(value) => {
                            const pins = pin.split('');
                            pins[i] = value;
                            const newPin = pins.join('');
                            setPin(newPin);
                            setError('');

                            if (value && inputRefs.current[i + 1]) {
                              inputRefs.current[i + 1].focus();
                            }

                            if (autoSubmit && newPin.length === pinSize) {
                              handleSubmitPin(newPin);
                            }
                          }}
                          keyboardType="number-pad"
                          secureTextEntry={secureTextEntry}
                          autoComplete="off"
                          className="text-white text-4xl text-center pt-1"
                          style={{
                            height: 60,
                          }}
                        />
                      </Input>
                    ))}
                  </HStack>

                  {error ? (
                    <Text className="text-error-500 text-center mt-2">{error}</Text>
                  ) : null}

                  {/* Footer/CTA section with safe bottom inset so it never hides behind the keyboard */}
                  <VStack className="mt-6" style={{ marginBottom: Math.max(insets.bottom, 12) }}>
                    <Button
                      size="xl"
                      className="rounded-full"
                      onPress={() => handleSubmitPin(pin)}
                      disabled={pin.length < pinSize || isSending}
                      testID="submit-button"
                    >
                      <ButtonText className="text-white font-bold text-lg">
                        {btnLabel ?? 'Submit'}
                      </ButtonText>
                    </Button>
                  </VStack>
                </VStack>
              </Box>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  },
);
