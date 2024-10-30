import React from 'react';

import { Stack, usePathname, useRouter } from 'expo-router';

import { CardAssetList } from '@/components/AssetList';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { ChevronRightIcon, Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { balanceStore } from '@/stores/BalanceStore';

export const Transfers = () => {
  const router = useRouter();
  const path = usePathname();
  const assets = balanceStore.currentAssets();

  return (
    <>
      <Stack.Screen options={{ title: 'Transfer' }} />
      <Box className="flex-1">
        <VStack space="md" className="p-4">
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
    </>
  );
};

export default Transfers;
