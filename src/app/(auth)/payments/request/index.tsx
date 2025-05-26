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
      <Box className="flex-1 bg-[#0a0a0a]">
        <VStack space="lg" className="p-4">
          <Heading size="xl" className="text-center" style={{ color: '#ffffff' }}>
            How much will you request?
          </Heading>

          <Box>
            <AssetInput
              asset={asset}
              value={value}
              onChangeValue={setValue}
              size="4xl"
              testID="asset-input"
            />
            <HStack className="justify-center mt-2">
              <Button variant="link" size="sm" onPress={() => handleGenerateQRCode(0)}>
                <ButtonText className="text-white">Request open amount</ButtonText>
              </Button>
            </HStack>
          </Box>

          <Button
            onPress={() => handleGenerateQRCode(value!)}
            size="xl"
            disabled={!value}
            testID="generate-qr-code-button"
            className="mt-6 rounded-full"
            style={{ height: 56 }}
          >
            <ButtonText className="text-lg text-white">Generate QR Code</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default RequestPayment;
