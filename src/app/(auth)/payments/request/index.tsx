import { useState } from 'react';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { AssetInput } from '@/components/AssetInput';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { CryptoAsset } from '@/types/assets';

export const RequestPayment = () => {
  const router = useRouter();
  const { asset } = useLocalSearchParams<{ asset: CryptoAsset }>();
  const [value, setValue] = useState<number | null>(0);

  if (!asset) {
    return <></>;
  }

  const handleGenerateQRCode = (value: number) => {
    router.replace({
      pathname: '/payments/request/show-qr-code',
      params: { asset, value: `${value}` },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Request Payment' }} />
      <Box className="flex-1 bg-white">
        <VStack space="lg" className="p-4">
          <Heading>How much will you request?</Heading>
          <Box>
            <AssetInput asset={asset} value={value} onChangeValue={setValue} size="4xl" testID="asset-input" />
            <HStack>
              <Button variant="link" size="sm" onPress={() => handleGenerateQRCode(0)}>
                <ButtonText>Request open amount</ButtonText>
              </Button>
            </HStack>
          </Box>
          <Button
            onPress={() => handleGenerateQRCode(value!)}
            size="xl"
            disabled={!value}
            testID="generate-qr-code-button"
          >
            <ButtonText>Generate QR Code</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default RequestPayment;
