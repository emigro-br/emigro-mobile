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
import { AssetInput } from '@/components/AssetInput';

import { sessionStore } from '@/stores/SessionStore';
import { balanceStore } from '@/stores/BalanceStore';
import { OperationKind } from '@/services/emigro/anchors';
import { CurrencyToAsset, fiatByCode, symbolFor } from '@/utils/assets';
import { FiatCurrency } from '@/types/assets';
import { api } from '@/services/emigro/api';

const OperationRouter = () => {
  console.log('[OperationRouter] Rendering...');

  const { kind } = useGlobalSearchParams();
  const { currency } = useLocalSearchParams<{ currency: FiatCurrency }>();

  console.log('[OperationRouter] kind:', kind, 'currency:', currency);

  if (!currency) {
    console.error('[OperationRouter] ❌ Missing currency param, throwing Error...');
    throw new Error('Currency is required');
  }

  if (kind === 'deposit') {
    return <Deposit currency={currency} />;
  } else if (kind === 'withdraw') {
    return <Withdraw currency={currency} />;
  } else {
    console.error('[OperationRouter] ❌ Invalid kind operation:', kind);
    throw new Error('Invalid kind operation: ' + kind);
  }
};

type KindProps = { currency: FiatCurrency };

const Deposit = ({ currency }: KindProps) => {
  return <OperationHome title="Deposit" kind={OperationKind.DEPOSIT} currency={currency} />;
};

const Withdraw = ({ currency }: KindProps) => {
  return <OperationHome title="Withdraw" kind={OperationKind.WITHDRAW} currency={currency} />;
};

type LayoutProps = {
  title: string;
  kind: OperationKind;
  currency: string; // e.g., "USD"
};

const OperationHome = ({ title, kind, currency }: LayoutProps) => {
  console.log('[OperationHome] Rendering...', { title, kind, currency });

  const router = useRouter();
  const path = usePathname();
  const [isOpenUrlModal, setIsOpenUrlModal] = useState(false);
  const [fiatAmount, setFiatAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);

  // Force refresh transaction history
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());

  console.log('[OperationHome] path:', path);

  // Convert the currency to a known fiat object
  const fiat = fiatByCode[currency as FiatCurrency];
  const asset = CurrencyToAsset[fiat.code as FiatCurrency];
  const balance = balanceStore.get(asset);

  // Get user details
  const userId = sessionStore.user?.id;
  const walletAddress = sessionStore.user?.publicKey;

  console.log('[OperationHome] Derived fiat:', fiat, 'asset:', asset, 'balance:', balance);
  console.log('[OperationHome] User ID:', userId, 'Wallet Address:', walletAddress);

  useFocusEffect(
    React.useCallback(() => {
      setRefreshedAt(new Date());
    }, [])
  );

  /**
   * ✅ FIXED: Creates an Onramp session and ensures URL is passed correctly.
   */
const handleNewTransaction = async () => {
  if (!userId || !walletAddress || !fiatAmount) {
    console.error('[handleNewTransaction] ❌ Missing required data:', {
      userId, walletAddress, fiatAmount, currency
    });
    return;
  }

  console.log('[handleNewTransaction] 🔵 Creating Coinbase Onramp session...');
  setLoading(true);

  try {
    const response = await api().post('/coinbase/onramp', {
      userId,
      walletAddress,
      fiatAmount,
      fiatCurrency: currency,
    });

    console.log('[handleNewTransaction] ✅ Response:', response.data);

    const { onrampUrl } = response.data;

    if (!onrampUrl) {
      console.error('[handleNewTransaction] ❌ No Onramp URL received');
      return;
    }

    console.log('[handleNewTransaction] ✅ Coinbase URL:', onrampUrl);

    // ✅ Ensure the URL is properly encoded before passing it
    const encodedUrl = encodeURIComponent(onrampUrl);

    // ✅ Navigate to WebView with the correct params
    router.push({
      pathname: `/ramp/deposit/${currency}/webview`,
      params: { url: encodedUrl },
    });
  } catch (error) {
    console.error('[handleNewTransaction] ❌ Error:', error);
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Stack.Screen options={{ title, headerBackTitleVisible: false }} />

      <OpenURLModal
        isOpen={isOpenUrlModal}
        onClose={() => setIsOpenUrlModal(false)}
        onConfirm={() => {
          if (!onrampUrl) {
            console.error('[OpenURLModal] ❌ No URL set, cannot proceed.');
            return;
          }
          console.log('[OpenURLModal] 🚀 Navigating to WebView:', onrampUrl);
router.push({
  pathname: `/ramp/deposit/${currency}/webview`,
  params: { url: encodeURIComponent(onrampUrl) }, // ✅ Ensure URL is encoded correctly
});
        }}
        testID="open-url-modal"
      />

      <ScrollView className="flex-1 bg-white">
        <Box className="flex-1">
          <VStack space="md" className="p-4">
            <Heading size="xl">{title} in {fiat.name}</Heading>
            <Text bold className="mb-2">Balance: {symbolFor(asset, balance)}</Text>

            <AssetInput
              asset={currency}
              value={fiatAmount}
              onChangeValue={setFiatAmount}
              precision={2}
            />

            <Button variant="outline" onPress={handleNewTransaction} disabled={loading || !fiatAmount}>
              <ButtonText>{loading ? 'Loading...' : 'Pay with Coinbase'}</ButtonText>
            </Button>

            <Sep24TransactionHistoryContainer asset={asset} kind={kind} refreshedAt={refreshedAt} />
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
};

export default OperationRouter;
