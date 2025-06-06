import React, { useState } from 'react';

import { Stack, useRouter } from 'expo-router';
import { HandCoinsIcon, QrCodeIcon } from 'lucide-react-native';

import { AssetListActionSheet } from '@/components/AssetListActionSheet';
import { CircularButton } from '@/components/CircularButton';
import { EmigroHeader } from '@/components/Header';
import { Box } from '@/components/ui/box';
import { ButtonGroup } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { CopyIcon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { balanceStore } from '@/stores/BalanceStore';
import { allCryptoCodesToObjs } from '@/utils/assets';

export const Payments = () => {
  const router = useRouter();
  const [assetListOpen, setAssetListOpen] = useState(false);

  const availableAssets = allCryptoCodesToObjs(balanceStore.currentAssets());

  return (
    <>
      <Stack.Screen options={{ title: 'Payments', header: () => <EmigroHeader /> }} />

      <Box className="flex-1 bg-white">
        <VStack space="lg" className="p-4">
          <Heading>Pick Your Payment Method</Heading>
          <ButtonGroup space="4xl" className="mt-8">
            <CircularButton
              icon={QrCodeIcon}
              label="Scan to Pay"
              size="lg"
              textSize="lg"
              onPress={() => router.push('/payments/scan')}
              testID="scan-to-pay"
            />
            <CircularButton
              icon={HandCoinsIcon}
              label="Request Payment"
              size="lg"
              textSize="lg"
              onPress={() => setAssetListOpen(true)}
              testID="request-payment"
            />
          </ButtonGroup>
          <ButtonGroup space="4xl" className="mt-8">
            <CircularButton
              icon={CopyIcon}
              label="Pix Copia & Cola"
              size="lg"
              textSize="lg"
              onPress={() => router.push('/payments/pix/copia-e-cola')}
              testID="pix-copia-e-cola"
            />
          </ButtonGroup>
        </VStack>
        <AssetListActionSheet
          assets={availableAssets}
          isOpen={assetListOpen}
          onClose={() => setAssetListOpen(false)}
          onItemPress={(asset) => {
            setAssetListOpen(false);
            router.push({
              pathname: '/payments/request',
              params: { asset },
            });
          }}
        />
      </Box>
    </>
  );
};

export default Payments;
