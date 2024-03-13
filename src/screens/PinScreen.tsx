import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { Box, Button, ButtonText, HStack, Heading, Input, InputField, Text, VStack } from '@gluestack-ui/themed';

type Props = {
  tagline?: string;
  btnLabel?: string;
  verifyPin?: (pin: string) => Promise<boolean>;
  onPinSuccess: (pin: string) => void;
  onPinFail: (error: Error) => void;
};

export const PinScreen = forwardRef(({ tagline, btnLabel, verifyPin, onPinSuccess, onPinFail }: Props, ref) => {
  const pinSize = 4;
  const [pin, setPin] = useState('');
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

  const handlePress = async () => {
    if (pin.length !== pinSize) {
      setError(`PIN must be ${pinSize} digits`);
      return;
    }
    setLoading(true);
    try {
      // Make API call to verify PIN
      const isPinCorrect = await verifyPin?.(pin);
      if (!isPinCorrect) {
        throw new Error('Invalid PIN');
      }
      // If PIN is correct
      onPinSuccess(pin);
    } catch (e) {
      // If PIN is incorrect
      onPinFail(e as Error);
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} bg="$white">
      <VStack space="4xl" p="$4">
        <Heading size="xl">{tagline ?? 'Enter your PIN code'}</Heading>
        <HStack space="xl" justifyContent="center">
          {[...Array(pinSize)].map((_, i) => (
            <Input key={i} variant="underlined" size="xl" w="$10">
              <InputField
                ref={(ref: TextInput) => (inputRefs.current[i] = ref)}
                value={pin[i]}
                maxLength={1}
                // isFocused={pin.length === i}

                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') {
                    //
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
                secureTextEntry
                autoComplete="off"
              />
            </Input>
          ))}
        </HStack>
        {error && <Text color="$error500">{error}</Text>}
        <Button size="xl" onPress={handlePress} isDisabled={pin.length < pinSize || loading} testID="submit-button">
          <ButtonText>{btnLabel ?? 'Submit'}</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
});
