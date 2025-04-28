import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Image, Animated, Easing } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { EyeIcon, EyeOffIcon, AddIcon, ArrowUpIcon, ArrowRightIcon, RepeatIcon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { CircularButton } from '@/components/CircularButton';
import { FiatCurrency } from '@/types/assets';
import { symbolFor } from '@/utils/assets';
import { balanceStore } from '@/stores/BalanceStore';
import { WalletActionButton } from '@/components/wallet/WalletActionButton';

type Props = {
  hide: boolean;
  toggleHide: () => void;
};

export const WalletHeaderCard = ({ hide, toggleHide }: Props) => {
  const router = useRouter();
  const [amountPart, setAmountPart] = useState<string | null>(null);
  const [centsPart, setCentsPart] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchedOnce, setFetchedOnce] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const checkBalance = () => {
      // console.log('[WalletHeaderCard] Checking balance:', balanceStore.totalBalance);

      if (!fetchedOnce) {
        // First time we try to fetch balance
        if (balanceStore.totalBalance === undefined) {
          console.log('[WalletHeaderCard] Balance is undefined, still waiting...');
          return;
        }
        setFetchedOnce(true);
      }

      const balance = hide ? '****' : symbolFor(FiatCurrency.USD, balanceStore.totalBalance);
      const parts = balance.replace('$', '').split('.') ?? [];
      setAmountPart(parts[0]);
      setCentsPart(parts[1] || null);
      setLoading(false);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    };

    checkBalance();

    const interval = setInterval(checkBalance, 300);
    return () => clearInterval(interval);
  }, [hide, balanceStore.totalBalance]);

  return (
    <VStack className="bg-primary-500 rounded-3xl m-4 p-6 space-y-6">
      {/* Logo */}
      {/*<View className="items-center">
        <Image
          source={require('@/assets/images/emigro-logo.png')}
          style={{ width: 140, height: 60, resizeMode: 'contain' }}
        />
      </View>*/}

{/* Total Balance + Eye aligned properly */}
<HStack className="justify-between items-center w-full px-4 mt-4">
  {/* Left side: Total Balance + Amount */}
  <VStack className="items-start">
    <Text className="text-white font-bold mb-1">Total Balance</Text>

    {loading ? (
      <Text className="text-white text-2xl font-bold mt-2">Loading...</Text>
    ) : (
      <Animated.View style={{ opacity: fadeAnim }}>
        <HStack className="items-end">
          <Text className="text-white text-5xl font-extrabold">
            ${amountPart}
          </Text>
          {centsPart && (
            <Text className="text-white text-5xl font-extrabold -mt-[10px]">
              .{centsPart}
            </Text>
          )}
        </HStack>
      </Animated.View>
    )}
  </VStack>

  {/* Right side: Eye Icon in Circle */}
  <Pressable onPress={toggleHide} className="p-3 rounded-full" style={{ backgroundColor: '#ff7189' }}>
    <Icon as={hide ? EyeOffIcon : EyeIcon} className="text-black text-2xl" />
  </Pressable>
</HStack>


      {/* Operations */}
      <HStack className="justify-around pt-4 mt-2">
        <WalletActionButton label="Deposit" bg="white" icon={AddIcon} onPress={() => router.push('/ramp/deposit')} />
        {/*<WalletActionButton label="Withdraw" bg="white" icon={ArrowUpIcon} onPress={() => router.push('/ramp/withdraw')} />*/}
        <WalletActionButton label="Send" bg="white" icon={ArrowRightIcon} onPress={() => router.push('/transfers')} />
        <WalletActionButton label="Swap" bg="white" icon={RepeatIcon} onPress={() => router.push('/swap')} />
      </HStack>
    </VStack>
  );
};
