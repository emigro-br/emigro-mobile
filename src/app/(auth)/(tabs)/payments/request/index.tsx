import { useState } from 'react';

import { Box, Button, ButtonText, HStack, Heading, VStack } from '@gluestack-ui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AssetInput } from '@/components/AssetInput';
import { CryptoAsset } from '@/types/assets';

export const RequestPayment = () => {
  const router = useRouter();
  const { asset } = useLocalSearchParams<{ asset: CryptoAsset }>();
  const [value, setValue] = useState<number | null>(0);

  if (!asset) {
    return <></>;
  }

  const handleGenerateQRCode = (value: number) => {
    router.navigate({
      pathname: '/payments/request/show-qr-code',
      params: { asset, value: `${value}` },
    });
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

export default RequestPayment;
