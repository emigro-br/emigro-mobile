import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Animated, Easing } from 'react-native';

import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Icon, EyeIcon, EyeOffIcon, AddIcon, ArrowRightIcon, RepeatIcon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { WalletActionButton } from '@/components/wallet/WalletActionButton';

import { sessionStore } from '@/stores/SessionStore';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { fetchFiatQuote } from '@/services/emigro/quotes';
import { symbolFor } from '@/utils/assets';

type Props = {
  hide: boolean;
  toggleHide: () => void;
};

export const WalletHeaderCard = ({ hide, toggleHide }: Props) => {
  const router = useRouter();
  const fadeAnim = useState(new Animated.Value(0))[0];

  const [totalFiat, setTotalFiat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [formattedBalance, setFormattedBalance] = useState<string>('');

  const walletId = sessionStore.user?.wallets?.[0]?.id ?? '';
  const bankCurrency = sessionStore.preferences?.fiatsWithBank?.[0] ?? 'USD';

  const { balances } = useWalletBalances(walletId);

  useEffect(() => {
    const fetchTotal = async () => {
      if (!balances.length) return;

      setLoading(true);
      let sum = 0;

      await Promise.all(
        balances.map(async (asset) => {
          const rawBalance = parseFloat(asset.balance);
          if (!rawBalance || rawBalance <= 0) return;

          if (asset.symbol === bankCurrency) {
            sum += rawBalance;
          } else {
            try {
              const quote = await fetchFiatQuote(asset.symbol, bankCurrency);
              if (quote) {
                sum += quote * rawBalance;
              }
            } catch (err) {
              console.warn('[WalletHeaderCard] ⚠️ Quote fetch failed for', asset.symbol, '->', bankCurrency, err);
            }
          }
        })
      );

      setTotalFiat(sum);
      setFormattedBalance(symbolFor(bankCurrency, sum));
      setLoading(false);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    };

    fetchTotal();
  }, [balances, bankCurrency]);

  return (
    <VStack className="bg-primary-500 rounded-3xl m-4 p-6 space-y-6">
      <HStack className="justify-between items-center w-full px-4 mt-4">
        <VStack className="items-start">
          <Text className="text-white font-bold mb-1">Total Balance</Text>

          {loading || totalFiat === null || hide ? (
            <Text className="text-white text-2xl font-bold mt-2">
              {hide ? '****' : 'Loading...'}
            </Text>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text className="text-white text-5xl font-extrabold mt-2">
                {formattedBalance}
              </Text>
            </Animated.View>
          )}
        </VStack>

        <Pressable onPress={toggleHide} className="p-3 rounded-full" style={{ backgroundColor: '#ff7189' }}>
          <Icon as={hide ? EyeOffIcon : EyeIcon} className="text-black text-2xl" />
        </Pressable>
      </HStack>

      <HStack className="justify-around pt-4 mt-2">
        <WalletActionButton label="Deposit" bg="white" icon={AddIcon} onPress={() => router.push('/ramp/deposit')} />
        <WalletActionButton label="Send" bg="white" icon={ArrowRightIcon} onPress={() => router.push('/transfers')} />
        <WalletActionButton label="Swap" bg="white" icon={RepeatIcon} onPress={() => router.push('/swap')} />
      </HStack>
    </VStack>
  );
};
