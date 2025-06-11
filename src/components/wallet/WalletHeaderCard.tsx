import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Animated, Easing, ActivityIndicator } from 'react-native';
import { observer } from 'mobx-react-lite';

import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import {
  Icon,
  EyeIcon,
  EyeOffIcon,
  AddIcon,
  ArrowRightIcon,
  RepeatIcon,
} from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { WalletActionButton } from '@/components/wallet/WalletActionButton';

import { sessionStore } from '@/stores/SessionStore';
import { balanceStore } from '@/stores/BalanceStore';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { fetchFiatQuote } from '@/services/emigro/quotes';
import { symbolFor } from '@/utils/assets';

type Props = {
  hide: boolean;
  toggleHide: () => void;
  refreshTrigger: number;
};

const WalletHeaderCardComponent = ({ hide, toggleHide, refreshTrigger }: Props) => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const walletId = sessionStore.user?.wallets?.[0]?.id ?? '';
  const bankCurrency = sessionStore.preferences?.fiatsWithBank?.[0] ?? 'USD';
  const { balances } = useWalletBalances(walletId);

  // ✅ Cache local balance so UI doesn't flash
  const [localBalance, setLocalBalance] = useState<number | null>(
    balanceStore.totalBalance
  );

  // Keep local balance in sync with store
  useEffect(() => {
    if (balanceStore.totalBalance !== null) {
      setLocalBalance(balanceStore.totalBalance);
    }
  }, [balanceStore.totalBalance]);

  const formattedBalance =
    localBalance !== null ? symbolFor(bankCurrency, localBalance) : '';
  const showSpinner = !hide && localBalance === null;

  useEffect(() => {
    const fetchTotal = async () => {
      if (!balances.length) return;

      fadeAnim.setValue(0);
      let sum = 0;

      await Promise.all(
        balances.map(async (asset) => {
          const raw = parseFloat(asset.balance);
          if (!raw || raw <= 0) return;

          if (asset.symbol === bankCurrency) {
            sum += raw;
          } else {
            try {
              const quote = await fetchFiatQuote(asset.symbol, bankCurrency);
              if (quote) sum += quote * raw;
            } catch (err) {
              console.warn('[WalletHeaderCard] Quote fetch failed:', asset.symbol, err);
            }
          }
        })
      );

      balanceStore.setTotalBalance(sum);
      setLocalBalance(sum); // Update local value too

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    };

    fetchTotal();
  }, [balances, bankCurrency, refreshTrigger]);

  return (
    <VStack className="bg-primary-500 rounded-3xl m-4 p-6 space-y-6">
      <HStack className="justify-between items-center w-full px-4 mt-4">
        <VStack className="items-start">
          <Text className="text-white font-bold mb-1">Total Balance</Text>

          {hide ? (
            <Text className="text-white text-2xl font-bold mt-2">****</Text>
          ) : showSpinner ? (
            <ActivityIndicator
              size="large"
              color="#ffffff"
              style={{ marginTop: 8 }}
            />
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text className="text-white text-5xl font-extrabold mt-2">
                {formattedBalance}
              </Text>
            </Animated.View>
          )}
        </VStack>

        <Pressable
          onPress={toggleHide}
          className="p-3 rounded-full"
          style={{ backgroundColor: '#ff7189' }}
        >
          <Icon as={hide ? EyeOffIcon : EyeIcon} className="text-black text-2xl" />
        </Pressable>
      </HStack>

      <HStack className="justify-around pt-4 mt-2">
        <WalletActionButton
          label="Deposit"
          bg="white"
          icon={AddIcon}
          onPress={() => router.push('/ramp/deposit')}
        />
        <WalletActionButton
          label="Send"
          bg="white"
          icon={ArrowRightIcon}
          onPress={() => router.push('/transfers')}
        />
        <WalletActionButton
          label="Swap"
          bg="white"
          icon={RepeatIcon}
          onPress={() => router.push('/swap')}
        />
      </HStack>
    </VStack>
  );
};

export const WalletHeaderCard = observer(WalletHeaderCardComponent);
