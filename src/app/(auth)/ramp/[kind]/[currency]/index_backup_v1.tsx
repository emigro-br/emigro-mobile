import React, { useState } from 'react';
import {
  Stack,
  useFocusEffect,
  useGlobalSearchParams,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from 'expo-router';

import { Sep24TransactionHistoryContainer } from '@/components/Sep24TransactionHistory';
import { OpenURLModal } from '@/components/modals/OpenURLModal';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { OperationKind } from '@/services/emigro/anchors';
import { balanceStore } from '@/stores/BalanceStore';
import { FiatCurrency } from '@/types/assets';
import { CurrencyToAsset, fiatByCode, symbolFor } from '@/utils/assets';

const OperationRouter = () => {
  console.log('[OperationRouter] Rendering...');

  // Get "kind" (deposit/withdraw) from the query string
  const { kind } = useGlobalSearchParams();
  // Get "currency" (e.g. USD, EUR, etc.) from the query string
  const { currency } = useLocalSearchParams<{ currency: FiatCurrency }>();

  console.log('[OperationRouter] kind:', kind, 'currency:', currency);

  if (!currency) {
    console.error('[OperationRouter] Missing currency param, throwing Error...');
    throw new Error('Currency is required');
  }

  if (kind === 'deposit') {
    console.log('[OperationRouter] Routing to <Deposit />');
    return <Deposit currency={currency} />;
  } else if (kind === 'withdraw') {
    console.log('[OperationRouter] Routing to <Withdraw />');
    return <Withdraw currency={currency} />;
  } else {
    console.error('[OperationRouter] Invalid kind operation:', kind);
    throw new Error('Invalid kind operation: ' + kind);
  }
};

type KindProps = {
  currency: FiatCurrency;
};

export const Deposit = ({ currency }: KindProps) => {
  console.log('[Deposit] component loaded, currency:', currency);
  return <OperationHome title="Deposit" kind={OperationKind.DEPOSIT} currency={currency} />;
};

export const Withdraw = ({ currency }: KindProps) => {
  console.log('[Withdraw] component loaded, currency:', currency);
  return <OperationHome title="Withdraw" kind={OperationKind.WITHDRAW} currency={currency} />;
};

type LayoutProps = {
  title: string;
  kind: OperationKind;
  currency: string; // e.g., "USD"
};

export const OperationHome = ({ title, kind, currency }: LayoutProps) => {
  console.log('[OperationHome] Rendering...', { title, kind, currency });

  const router = useRouter();
  const path = usePathname();
  const [isOpenUrlModal, setIsOpenUrlModal] = useState(false);

  // Force refresh transaction history
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());

  console.log('[OperationHome] path:', path);

  // Convert the currency to a known fiat object (e.g. { code: 'USD', name: 'US Dollar', ... })
  const fiat = fiatByCode[currency as FiatCurrency];
  // Convert that fiat to the correct asset code if relevant
  const asset = CurrencyToAsset[fiat.code as FiatCurrency];
  // Retrieve the current user balance for that asset
  const balance = balanceStore.get(asset);

  console.log('[OperationHome] Derived fiat:', fiat, 'asset:', asset, 'balance:', balance);

  // Refresh the transaction history container whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('[OperationHome/useFocusEffect] Setting refreshedAt to now');
      setRefreshedAt(new Date());
    }, [])
  );

  /**
   * This function is called when the user taps "New transaction"
   * For deposit: opens the URL modal which will eventually navigate to /webview
   */
  const handleNewTransaction = (thisKind: OperationKind) => {
    console.log('[OperationHome/handleNewTransaction] Called with kind:', thisKind);
    // For deposit, we show the "OpenURLModal"
    setIsOpenUrlModal(true);
  };

  /**
   * Called when user confirms the URL modal
   * Navigates to the webview route, passing { asset } as param
   */
  const handleOpenConfimed = async () => {
    console.log('[OperationHome/handleOpenConfimed] path:', path, 'asset:', asset);

    router.push({
      pathname: `${path}/webview`,
      params: { asset }, // FIXME: might also need { currency } depending on how the webview file expects it
    });
    setIsOpenUrlModal(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerBackTitleVisible: false,
        }}
      />

      <OpenURLModal
        isOpen={isOpenUrlModal}
        onClose={() => {
          console.log('[OperationHome/OpenURLModal] onClose triggered');
          setIsOpenUrlModal(false);
        }}
        onConfirm={() => {
          console.log('[OperationHome/OpenURLModal] onConfirm triggered');
          handleOpenConfimed();
        }}
        testID="open-url-modal"
      />

      <ScrollView className="flex-1 bg-white">
        <Box className="flex-1">
          <VStack space="md" className="p-4">
            <Heading size="xl">
              {title} in {fiat.name}
            </Heading>
            <Text bold className="mb-2">
              Balance: {symbolFor(asset, balance)}
            </Text>
            <Button variant="outline" onPress={() => handleNewTransaction(kind)}>
              <ButtonText>New transaction</ButtonText>
            </Button>
            <Box className="mb-4" />

            {/**
             * Transaction history container
             */}
            <Sep24TransactionHistoryContainer
              asset={asset}
              kind={kind}
              refreshedAt={refreshedAt}
            />
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
};

export default OperationRouter;
