import React from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Card, Heading, Text, VStack } from '@gluestack-ui/themed';

import { AssetList } from '@components/AssetList';

import { WalletStackParamList } from '@navigation/WalletStack';

import { balanceStore } from '@stores/BalanceStore';

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList, 'TransfersRoot'>;
};

export const Transfers = ({ navigation }: Props) => {
  const data = balanceStore.currentAssets();

  return (
    <Box flex={1}>
      <VStack p="$4" space="md">
        <Heading size="xl">Send money</Heading>
        <Text>Choose the currency you want to send</Text>
        <Card variant="flat">
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
