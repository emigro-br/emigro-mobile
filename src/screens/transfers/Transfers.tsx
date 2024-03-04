import React from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Card, Heading, Text, VStack } from '@gluestack-ui/themed';

import { CryptoAsset } from '@/types/assets';

import { AssetList } from '@components/AssetList';

import { WalletStackParamList } from '@navigation/WalletStack';

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList, 'TransfersRoot'>;
};

export const Transfers = ({ navigation }: Props) => {
  const data = Object.values(CryptoAsset);

  return (
    <Box flex={1}>
      <VStack p="$4" space="md">
        <Heading size="xl">Send money</Heading>
        <Text>Choose the currency you want to send</Text>
        <Card size="md" py="$1" variant="filled" bg="$white">
          <AssetList
            data={data}
            onPress={(item) =>
              navigation.push('TransfersRoot', {
                screen: 'SendAsset',
                params: {
                  asset: item,
                },
              })
            }
          />
        </Card>
      </VStack>
    </Box>
  );
};

export default Transfers;
