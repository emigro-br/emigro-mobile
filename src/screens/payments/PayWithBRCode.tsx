import { useEffect, useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Button, ButtonText, Heading, Textarea, TextareaInput, VStack } from '@gluestack-ui/themed';
import * as Clipboard from 'expo-clipboard';
import { hasError, parsePix } from 'pix-utils';

import { PaymentStackParamList } from '@navigation/PaymentsStack';

type Props = {
  navigation: NativeStackNavigationProp<PaymentStackParamList, 'PayWithBRCode'>;
};

export const PayWithBRCode = ({ navigation }: Props) => {
  const [brCode, setBrCode] = useState<string>('');

  useEffect(() => {
    handlePaste();
  }, []);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    const pix = parsePix(text);
    if (!hasError(pix)) {
      setBrCode(text);
    }
  };

  // <InputSlot pr="$3" onPress={handlePaste}>
  //   <InputIcon as={ClipboardDocumentIcon} />
  // </InputSlot>
  return (
    <Box flex={1}>
      <VStack p="$4" space="lg">
        <Heading>Insert your Pix Copia & Cola code</Heading>
        <Textarea>
          <TextareaInput value={brCode} onChangeText={setBrCode} placeholder="Paste your Pix code here" />
        </Textarea>
        <Button onPress={() => navigation.push('ReviewPixPayment', { brCode })}>
          <ButtonText>Continue</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
