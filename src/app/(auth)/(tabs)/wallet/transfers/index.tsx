import React from 'react';

import { Box, ChevronRightIcon, Heading, Icon, Text, VStack } from '@gluestack-ui/themed';
import { usePathname, useRouter } from 'expo-router';

import { CardAssetList } from '@/components/AssetList';
import { balanceStore } from '@/stores/BalanceStore';

export const Transfers = () => {
  const router = useRouter();
  const path = usePathname();
  const assets = balanceStore.currentAssets();

  return (
    <Box flex={1}>
      <VStack p="$4" space="md">
        <Heading size="xl">Send money</Heading>
        <Text>Choose the currency you want to send</Text>
        <CardAssetList
          data={assets}
          trailing={<Icon as={ChevronRightIcon} size="md" />}
          onPress={(item) =>
            router.push({
              pathname: `${path}/send`,
              params: { asset: item },
            })
          }
        />
      </VStack>
    </Box>
  );
};

export default Transfers;
