import React from 'react';

import { Box, Card, ChevronRightIcon, Heading, Icon, Text, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

import { AssetList } from '@/components/AssetList';
import { balanceStore } from '@/stores/BalanceStore';

export const Transfers = () => {
  const router = useRouter();
  const data = balanceStore.currentAssets();

  return (
    <Box flex={1}>
      <VStack p="$4" space="md">
        <Heading size="xl">Send money</Heading>
        <Text>Choose the currency you want to send</Text>
        <Card variant="flat">
          <AssetList
            data={data}
            trailing={<Icon as={ChevronRightIcon} size="md" />}
            onPress={(item) =>
              router.push({
                pathname: '/wallet/transfers/send',
                params: { asset: item },
              })
            }
          />
        </Card>
      </VStack>
    </Box>
  );
};

export default Transfers;
