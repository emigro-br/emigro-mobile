import React from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box, Card, Heading, VStack } from '@gluestack-ui/themed';

import { CryptoAsset } from '@/types/assets';

import { AssetList } from '@components/AssetList';

import { RootStackParamList } from '@navigation/index';

type Props = NativeStackScreenProps<RootStackParamList, 'Transfers'>;

export const Transfers = ({ navigation }: Props) => {
  const data = Object.values(CryptoAsset);

  return (
    <Box flex={1}>
      <VStack p="$4" space="lg">
        <Heading size="xl">Send money</Heading>
        <Card size="md" py="$1" variant="filled" bg="$white">
          <AssetList
            data={data}
            onPress={(item) =>
              navigation.push('SendAsset', {
                asset: item,
              })
            }
          />
        </Card>
      </VStack>
    </Box>
  );
};

export default Transfers;
