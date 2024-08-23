import React, { useState } from 'react';

import { Stack, useLocalSearchParams, usePathname, useRouter } from 'expo-router';

import { CardAssetList } from '@/components/AssetList';
import { SimpleModal } from '@/components/modals/SimpleModal';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { ChevronRightIcon, Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { balanceStore } from '@/stores/BalanceStore';
import { CryptoAsset, CryptoOrFiat, FiatCurrency } from '@/types/assets';
import { AssetToCurrency, CurrencyToAsset } from '@/utils/assets';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const AssetForOperation = () => {
  const router = useRouter();
  const path = usePathname();
  const { kind } = useLocalSearchParams();
  const [currencyForDeposit, setCurrencyForDeposit] = useState<FiatCurrency | null>(null);

  const capitalized = capitalize(kind as string);

  const myCurrencies = balanceStore
    .currentAssets()
    .filter((asset) => asset !== CryptoAsset.XLM) // disable XLM ramps
    .filter((asset) => asset !== CryptoAsset.BRZ) // FIXME: Transfero SEP24 is not implemented
    .map((asset) => AssetToCurrency[asset])
    .filter((a) => a !== undefined) as FiatCurrency[];

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
          router.push(`/ramp/deposit/${currencyForDeposit}`);
        }}
      />
      <Box className="flex-1">
        <VStack space="md" className="p-4">
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
                router.push(`${path}/${currency}`);
              }
            }}
          />
        </VStack>
      </Box>
    </>
  );
};

export default AssetForOperation;
