import React, { useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, ButtonGroup, CopyIcon, Heading, VStack } from '@gluestack-ui/themed';
import { HandCoinsIcon, QrCodeIcon } from 'lucide-react-native';

import { AssetListActionSheet } from '@/components/AssetListActionSheet';
import { CircularButton } from '@/components/CircularButton';
import { useFeatureFlags } from '@/hooks/feature-flags';
import { PaymentStackParamList } from '@/navigation/PaymentsStack';
import { cryptoAssets } from '@/types/assets';

type Props = {
  navigation: NativeStackNavigationProp<PaymentStackParamList, 'Payments'>;
};

export const Payments: React.FC<Props> = ({ navigation }) => {
  const isFeatureEnabled = useFeatureFlags();
  const enablePix = isFeatureEnabled('pix-payment');
  const [assetListOpen, setAssetListOpen] = useState(false);

  const availableAssets = cryptoAssets();

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
            onPress={() => navigation.push('PayWithQRCode')}
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
              onPress={() => navigation.push('PastePixCode')}
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
          navigation.push('RequestPayment', { asset });
        }}
      />
    </Box>
  );
};
