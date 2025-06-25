// src/app/(auth)/(tabs)/wallet/index.tsx

import React, { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { observer } from 'mobx-react-lite';

import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { CreateWallet } from '@/components/wallet/CreateWallet';
import { WalletBalances } from '@/components/wallet/WalletBalances';
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
  const walletId = user?.wallets?.[0]?.id ?? null;

  useFocusEffect(
    React.useCallback(() => {
      if (hasWallets) {
        console.log('[Wallet] Fetching user balance...');
        balanceStore.fetchUserBalance().catch(console.warn);
        setRefreshTrigger(Date.now()); // 🔁 trigger refresh for WalletHeaderCard
      }
    }, [hasWallets])
  );

  const onRefresh = React.useCallback(async () => {
    if (!hasWallets) return;
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      console.log('[Wallet] Refreshing user balance...');
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
      <Stack.Screen options={{ title: 'Wallet', header: () => null }} />

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
            {/* Wallet balances if wallet ID exists */}
            {walletId && <WalletBalances walletId={walletId} hide={hide} />}

            {/* Show CreateWallet only if there are no wallets */}
            {!hasWallets && <CreateWallet />}
          </VStack>
        </ScrollView>
      </View>
    </>
  );
};

export default observer(Wallet);
