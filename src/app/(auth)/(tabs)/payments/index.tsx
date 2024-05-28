import React, { useState } from 'react';

import { Box, ButtonGroup, CopyIcon, Heading, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { HandCoinsIcon, QrCodeIcon } from 'lucide-react-native';

import { AssetListActionSheet } from '@/components/AssetListActionSheet';
import { CircularButton } from '@/components/CircularButton';
import { useFeatureFlags } from '@/hooks/feature-flags';
import { balanceStore } from '@/stores/BalanceStore';
import { allCryptoCodesToObjs } from '@/utils/assets';

export const Payments = () => {
  const router = useRouter();
  const isFeatureEnabled = useFeatureFlags();
  const enablePix = isFeatureEnabled('pix-payment');
  const [assetListOpen, setAssetListOpen] = useState(false);

  const availableAssets = allCryptoCodesToObjs(balanceStore.currentAssets());

  const w = 120;
  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading>Pick Your Payment Method</Heading>
        <ButtonGroup space="4xl" mt="$8">
          <CircularButton
            icon={QrCodeIcon}
            label="Scan to Pay"
            size="lg"
            textSize="md"
            w={w}
            onPress={() => router.push('/payments/scan')}
          />
          <CircularButton
            icon={HandCoinsIcon}
            label="Request Payment"
            size="lg"
            textSize="md"
            w={w}
            onPress={() => setAssetListOpen(true)}
          />
        </ButtonGroup>
        <ButtonGroup space="4xl" mt="$8">
          {enablePix ? (
            <CircularButton
              icon={CopyIcon}
              label="Pix Copia & Cola"
              size="lg"
              textSize="md"
              w={w}
              onPress={() => router.push('/payments/pix/copia-e-cola')}
            />
          ) : (
            <></>
          )}
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
  );
};

export default Payments;
