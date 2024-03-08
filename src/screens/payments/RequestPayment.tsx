import { useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box, Button, ButtonText, Heading, VStack } from '@gluestack-ui/themed';

import { CryptoAsset } from '@/types/assets';

import { AssetInput } from '@components/AssetInput';

import { PaymentStackParamList } from '@navigation/PaymentsStack';

type Props = NativeStackScreenProps<PaymentStackParamList, 'RequestPayment'>;

export const RequestPayment = ({ navigation, route }: Props) => {
  const [value, setValue] = useState<number | null>(0);

  const asset: CryptoAsset = route.params.asset as CryptoAsset;

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading>How much will you request?</Heading>
        <AssetInput asset={asset} value={value} onChangeValue={setValue} fontSize={36} />

        <Button
          onPress={() =>
            navigation.push('RequestWithQRCode', {
              asset,
              value: value!,
            })
          }
          isDisabled={!value}
        >
          <ButtonText>Generate QR Code</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
