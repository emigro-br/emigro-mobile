import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { Box, Button, ButtonText, HStack, Heading, Input, InputField, Text, VStack } from '@gluestack-ui/themed';

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
      verifyPin,
      onPinSuccess,
      onPinFail,
    }: Props,
    ref,
  ) => {
    const [pin, setPin] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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

    const handleSubmitPin = async () => {
      if (pin.length !== pinSize) {
        setError(`PIN must be ${pinSize} digits`);
        return;
      }
      setLoading(true);
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
        setLoading(false);
      }
    };

    return (
      <Box flex={1} bg="$white">
        <VStack space="4xl" p="$4">
          <Heading size="xl">{tagline ?? 'Enter your PIN code'}</Heading>
          {description && <Text>{description}</Text>}
          <HStack space="xl" justifyContent="center">
            {[...Array(pinSize)].map((_, i) => (
              <Input key={i} variant="underlined" size="xl" w="$10">
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
                    const newPin = pin.split('');
                    newPin[i] = value;
                    setPin(newPin.join(''));
                    setError('');
                    if (value !== '' && inputRefs.current[i + 1]) {
                      inputRefs.current[i + 1].focus();
                    }
                  }}
                  fontSize="$4xl"
                  fontWeight="bold"
                  textAlign="center"
                  keyboardType="number-pad"
                  secureTextEntry={secureTextEntry}
                  autoComplete="off"
                />
              </Input>
            ))}
          </HStack>
          {error && <Text color="$error500">{error}</Text>}
          <Button
            size="xl"
            onPress={handleSubmitPin}
            isDisabled={pin.length < pinSize || loading}
            testID="submit-button"
          >
            <ButtonText>{btnLabel ?? 'Submit'}</ButtonText>
          </Button>
        </VStack>
      </Box>
    );
  },
);
