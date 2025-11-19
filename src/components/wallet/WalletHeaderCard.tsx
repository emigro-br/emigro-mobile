import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';
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

import { symbolFor } from '@/utils/assets';

type Props = {
  hide: boolean;
  toggleHide: () => void;
  refreshTrigger: number;
};

const WalletHeaderCardComponent = ({ hide, toggleHide, refreshTrigger }: Props) => {
  const router = useRouter();

  const bankCurrency = sessionStore.preferences?.fiatsWithBank?.[0] ?? 'USD';


  const [localBalance, setLocalBalance] = useState<number | null>(
    balanceStore.totalBalance
  );

  useEffect(() => {
    if (balanceStore.totalBalance !== null) {
      setLocalBalance(balanceStore.totalBalance);
    }
  }, [balanceStore.totalBalance]);

  const formattedBalance =
    localBalance !== null ? symbolFor(bankCurrency, localBalance) : '';
  const showSpinner = !hide && localBalance === null;

  // Rely only on the store’s aggregated total (computed in BalanceStore.fetchUserBalance)
  // No local recomputation here to avoid overwriting the global total.


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
            <Text className="text-white text-5xl font-extrabold mt-2">
              {formattedBalance}
            </Text>
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
