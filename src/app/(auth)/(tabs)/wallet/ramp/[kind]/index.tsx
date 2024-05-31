import React from 'react';

import { Box, ChevronRightIcon, Heading, Icon, VStack } from '@gluestack-ui/themed';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { CardAssetList } from '@/components/AssetList';
import { balanceStore } from '@/stores/BalanceStore';
import { CryptoAsset } from '@/types/assets';
import { AssetToCurrency } from '@/utils/assets';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const AssetForOperation = () => {
  const router = useRouter();
  const { kind } = useLocalSearchParams();
  const capitalized = capitalize(kind as string);

  const myCurrencies = balanceStore
    .currentAssets()
    .filter((asset) => asset !== CryptoAsset.XLM)
    .map((asset) => AssetToCurrency[asset]);

  return (
    <>
      <Stack.Screen
        options={{
          title: capitalized,
        }}
      />
      <Box flex={1}>
        <VStack p="$4" space="md">
          <Heading size="xl">{capitalized} money</Heading>
          <CardAssetList
            data={myCurrencies}
            trailing={<Icon as={ChevronRightIcon} size="md" />}
            onPress={(currency) =>
              router.push({
                pathname: `./${currency}`,
              })
            }
          />
        </VStack>
      </Box>
    </>
  );
};

export default AssetForOperation;
