import React, { useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, ButtonGroup, Heading, VStack } from '@gluestack-ui/themed';
import { HandCoinsIcon, QrCodeIcon } from 'lucide-react-native';

import { cryptoAssets } from '@/types/assets';

import { AssetListActionSheet } from '@components/AssetListActionSheet';
import { CircularButton } from '@components/CircularButton';

import { PaymentStackParamList } from '@navigation/PaymentsStack';

type Props = {
  navigation: NativeStackNavigationProp<PaymentStackParamList, 'Payments'>;
};

export const Payments: React.FC<Props> = ({ navigation }) => {
  const [assetListOpen, setAssetListOpen] = useState(false);

  const availableAssets = cryptoAssets();

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading>Pick Your Payment Method</Heading>
        <ButtonGroup space="lg" mt="$8" justifyContent="space-around" flexWrap="wrap">
          <CircularButton
            icon={QrCodeIcon}
            label="Scan to Pay"
            size="lg"
            onPress={() => navigation.push('PayWithQRCode')}
          />
          <CircularButton
            icon={HandCoinsIcon}
            label="Request Payment"
            size="lg"
            onPress={() => setAssetListOpen(true)}
          />
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
