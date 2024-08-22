import React, { useState } from 'react';
import { RefreshControl } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { observer } from 'mobx-react-lite';

import { EmigroHeader } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon, Icon } from '@/components/ui/icon';
import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { CreateWallet } from '@/components/wallet/CreateWallet';
import { OperationButtons } from '@/components/wallet/OperationButtons';
import { TotalBalance } from '@/components/wallet/TotalBalance';
import { WalletBalances } from '@/components/wallet/WalletBalances';
import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';
import { FiatCurrency } from '@/types/assets';

export const Wallet = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [hide, setHide] = useState(false);

  // pass publicKey in the useEffect context, otherwise will exectue with publicKey=null
  const { publicKey } = sessionStore;

  useFocusEffect(
    React.useCallback(() => {
      if (publicKey) {
        balanceStore.fetchUserBalance().catch(console.warn);
      }
    }, [balanceStore.fetchUserBalance, publicKey]),
  );

  const onRefresh = React.useCallback(async () => {
    if (!publicKey) {
      return;
    }

    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await balanceStore
        .fetchUserBalance({
          force: true,
        })
        .catch(console.warn);
    } finally {
      setRefreshing(false);
    }
  }, [balanceStore.fetchUserBalance, publicKey]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHide(!hide);
  };

  const actions = [
    <Button onPress={() => handleToggle()} testID="toggle-button">
      <Icon as={hide ? EyeOffIcon : EyeIcon} size="xl" className="text-white" />
    </Button>,
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Wallet', header: () => <EmigroHeader actions={actions} /> }} />

      <VStack space="2xl" className="bg-primary-500 px-4">
        <TotalBalance total={balanceStore.totalBalance} cryptoOrFiat={FiatCurrency.USD} hide={hide} />
        <OperationButtons />
      </VStack>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            title="Refreshing..."
            testID="refresh-control"
          />
        }
      >
        <VStack space="lg" className="p-4">
          {balanceStore.userBalance.length > 0 && <WalletBalances userBalance={balanceStore.userBalance} hide={hide} />}
          {!publicKey && <CreateWallet />}
        </VStack>
      </ScrollView>
    </>
  );
};

export default observer(Wallet);
