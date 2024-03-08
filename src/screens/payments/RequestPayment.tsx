import { useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Button, ButtonText, Heading, VStack } from '@gluestack-ui/themed';

import { CryptoAsset } from '@/types/assets';

import { AssetInput } from '@components/AssetInput';

import { PaymentStackParamList } from '@navigation/PaymentsStack';

type Props = {
  navigation: NativeStackNavigationProp<PaymentStackParamList, 'RequestPayment'>;
};

export const RequestPayment = ({ navigation }: Props) => {
  const [asset, setAsset] = useState(CryptoAsset.XLM);
  const [value, setValue] = useState(0);
  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading>How much will you request?</Heading>
        <AssetInput asset={asset} value={value} onChangeValue={setValue} fontSize={36} />

        <Button
          onPress={() =>
            navigation.push('RequestWithQRCode', {
              asset,
              value,
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
