import React, { useState } from 'react';

import { Box, ChevronRightIcon, Heading, Icon, VStack } from '@gluestack-ui/themed';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { CardAssetList } from '@/components/AssetList';
import { SimpleModal } from '@/components/modals/SimpleModal';
import { balanceStore } from '@/stores/BalanceStore';
import { CryptoAsset, CryptoOrFiat, FiatCurrency } from '@/types/assets';
import { AssetToCurrency, CurrencyToAsset } from '@/utils/assets';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const AssetForOperation = () => {
  const router = useRouter();
  const { kind } = useLocalSearchParams();
  const [currencyForDeposit, setCurrencyForDeposit] = useState<FiatCurrency | null>(null);

  const capitalized = capitalize(kind as string);

  const myCurrencies = balanceStore
    .currentAssets()
    .filter((asset) => asset !== CryptoAsset.XLM)
    .map((asset) => AssetToCurrency[asset]);

  const renderSubtitle = (currency: CryptoOrFiat) => {
    const asset = CurrencyToAsset[currency as FiatCurrency];
    const balance = balanceStore.get(asset);
    return `${balance.toFixed(2)} ${asset}`;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: capitalized,
        }}
      />

      <SimpleModal
        isOpen={!!currencyForDeposit}
        title="Your wallet is empty. Would you like to deposit in it?"
        onClose={() => setCurrencyForDeposit(null)}
        onAction={() => {
          setCurrencyForDeposit(null);
          router.dismissAll();
          router.push(`/wallet/ramp/deposit/${currencyForDeposit}`);
        }}
      />

      <Box flex={1}>
        <VStack p="$4" space="md">
          <Heading size="xl">{capitalized} money</Heading>
          <CardAssetList
            data={myCurrencies}
            trailing={<Icon as={ChevronRightIcon} size="md" />}
            renderSubtitle={renderSubtitle}
            onPress={(currency) => {
              const asset = CurrencyToAsset[currency as FiatCurrency];
              if (kind === 'withdraw' && balanceStore.get(asset) <= 0.01) {
                setCurrencyForDeposit(currency as FiatCurrency);
              } else {
                router.push({
                  pathname: `./${currency}`,
                });
              }
            }}
          />
        </VStack>
      </Box>
    </>
  );
};

export default AssetForOperation;
