import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TextInput } from 'react-native';

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
    const inputRefs = useRef<TextInput[]>([]);

    useEffect(() => {
      inputRefs.current[0].focus();
    }, []);

    useImperativeHandle(ref, () => ({
      clear,
    }));

    const clear = () => {
      setPin('');
      inputRefs.current[0].focus();
    };

    const handleSubmitPin = async (pin: string) => {
      if (pin.length !== pinSize) {
        setError(`PIN must be ${pinSize} digits`);
        return;
      }
      setIsSending(true);
      try {
        // Make API call to verify PIN
        const isPinCorrect = await verifyPin?.(pin);
        if (!isPinCorrect) {
          throw new InvalidPinError();
        }
        // If PIN is correct
        onPinSuccess(pin);
      } catch (e) {
        if (e instanceof InvalidPinError) {
          setError('PIN is incorrect');

          // If max attempts reached, call onPinFail
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

    return (
      <Box testID="pin-screen" className="flex-1 bg-white">
        <VStack space="4xl" className="p-4">
          <Heading size="xl">{tagline ?? 'Enter your PIN code'}</Heading>
          {description && <Text>{description}</Text>}
          <HStack space="xl" className="justify-center">
            {[...Array(pinSize)].map((_, i) => (
              <Input key={i} variant="underlined" size="xl" className="w-10">
                <InputField
                  ref={(ref: TextInput) => (inputRefs.current[i] = ref)}
                  value={pin[i]}
                  maxLength={1}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace') {
                      // Focus the previous input when backspace is pressed
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
                    if (value !== '' && inputRefs.current[i + 1]) {
                      inputRefs.current[i + 1].focus();
                    }
                    // auto submit pin when all inputs are filled
                    if (autoSubmit && newPin.length === pinSize) {
                      handleSubmitPin(newPin);
                    }
                  }}
                  keyboardType="number-pad"
                  secureTextEntry={secureTextEntry}
                  autoComplete="off"
                  className="text-4xl font-bold text-center"
                />
              </Input>
            ))}
          </HStack>
          {error && <Text className="text-error-500">{error}</Text>}
          <Button
            size="xl"
            onPress={() => handleSubmitPin(pin)}
            disabled={pin.length < pinSize || isSending}
            testID="submit-button"
          >
            <ButtonText>{btnLabel ?? 'Submit'}</ButtonText>
          </Button>
        </VStack>
      </Box>
    );
  },
);
