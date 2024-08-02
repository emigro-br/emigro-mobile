import React, { useState } from 'react';
import { RefreshControl } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { observer } from 'mobx-react-lite';

import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { CreateWallet } from '@/components/wallet/CreateWallet';
import { OperationButtons } from '@/components/wallet/OperationButtons';
import { WalletBalances } from '@/components/wallet/WalletBalances';
import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';

const Wallet = observer(() => {
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <>
      <Stack.Screen options={{ title: 'Wallet', header: () => <Header /> }} />

      <Box className="bg-primary-500 py-2">
        <OperationButtons />
      </Box>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} title="Refreshing..." />}
      >
        <VStack space="lg" className="p-4">
          {balanceStore.userBalance.length > 0 && <WalletBalances userBalance={balanceStore.userBalance} />}
          {!publicKey && <CreateWallet />}
        </VStack>
      </ScrollView>
    </>
  );
});

export default Wallet;
