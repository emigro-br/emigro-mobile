import React, { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { observer } from 'mobx-react-lite';

import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { CreateWallet } from '@/components/wallet/CreateWallet';

//import { WalletBalances } from '@/components/wallet/WalletBalances';
import { WalletBalancesAggregated } from '@/components/wallet/WalletBalancesAggregated';

import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';
import { TopBar } from '@/components/wallet/TopBar';
import { WalletHeaderCard } from '@/components/wallet/WalletHeaderCard';
import { WalletTransactions } from '@/components/wallet/WalletTransactions';
import { AnnouncementScroll } from '@/components/wallet/AnnouncementScroll';

export const Wallet = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [hide, setHide] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());

  const { user } = sessionStore;
  const hasWallets = user?.wallets?.length > 0;
  const walletIds = user?.wallets?.map((w) => w.id) ?? [];

  // Ensure Total Balance (header) refreshes aggregated user data
  useFocusEffect(
    React.useCallback(() => {
      if (hasWallets) {
        balanceStore.fetchUserBalance().catch(console.warn);
        setRefreshTrigger(Date.now());
      }
    }, [hasWallets])
  );

  const onRefresh = React.useCallback(async () => {
    if (!hasWallets) return;
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await balanceStore.fetchUserBalance({ force: true }).catch(console.warn);
      setRefreshTrigger(Date.now());
    } finally {
      setRefreshing(false);
    }
  }, [hasWallets]);

  const toggleHide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHide((prev) => !prev);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Wallet',
          header: () => null,
          unmountOnBlur: false,
        }}
      />

      <View className="flex-1 bg-background-0 dark:bg-background-900">
        <TopBar />

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
          <WalletHeaderCard
            hide={hide}
            toggleHide={toggleHide}
            refreshTrigger={refreshTrigger}
          />
          <AnnouncementScroll />
          <WalletTransactions />

		  <VStack space="lg" className="p-4">
		    {/* One aggregated list across ALL wallets/chains */}
		    {hasWallets ? (
		      <WalletBalancesAggregated
		        hide={hide}
		        headerRefreshing={refreshing}
		        onRefreshAll={onRefresh}
		      />
		    ) : (
		      <CreateWallet />
		    )}
		  </VStack>




        </ScrollView>
      </View>
    </>
  );
};

export default observer(Wallet);
