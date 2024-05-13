import React, { useState } from 'react';
import { RefreshControl } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { Box, ScrollView, VStack } from '@gluestack-ui/themed';
import * as Haptics from 'expo-haptics';
import { observer } from 'mobx-react-lite';

import { CreateWallet } from '@/components/CreateWallet';
import OperationButtons from '@/components/OperationButtons';
import { WalletBalances } from '@/components/WalletBalances';
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
      <Box bg="$primary500" py="$2">
        <OperationButtons />
      </Box>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} title="Refreshing..." />}
      >
        <VStack space="lg" p="$4">
          {balanceStore.userBalance.length > 0 && <WalletBalances userBalance={balanceStore.userBalance} />}
          {!publicKey && <CreateWallet />}
        </VStack>
      </ScrollView>
    </>
  );
});

export default Wallet;
