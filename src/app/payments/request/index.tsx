import { useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box, Button, ButtonText, HStack, Heading, VStack } from '@gluestack-ui/themed';

import { CryptoAsset } from '@/types/assets';

import { AssetInput } from '@components/AssetInput';

import { PaymentStackParamList } from '@navigation/PaymentsStack';

type Props = NativeStackScreenProps<PaymentStackParamList, 'RequestPayment'>;

export const RequestPayment = ({ navigation, route }: Props) => {
  const [value, setValue] = useState<number | null>(0);

  const asset: CryptoAsset = route.params.asset as CryptoAsset;

  const handleGenerateQRCode = (value: number) => {
    navigation.push('RequestWithQRCode', { asset, value });
  };

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading>How much will you request?</Heading>
        <Box>
          <AssetInput asset={asset} value={value} onChangeValue={setValue} fontSize={36} testID="asset-input" />
          <HStack>
            <Button variant="link" size="sm" onPress={() => handleGenerateQRCode(0)}>
              <ButtonText>Request open amount</ButtonText>
            </Button>
          </HStack>
        </Box>
        <Button onPress={() => handleGenerateQRCode(value!)} isDisabled={!value} testID="generate-qr-code-button">
          <ButtonText>Generate QR Code</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
