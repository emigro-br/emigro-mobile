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

import { AnnouncementScroll } from '@/components/wallet/AnnouncementScroll';

export const Wallet = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [hide, setHide] = useState(false);
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
      await balanceStore.fetchUserBalance({ force: true }).catch(console.warn);
    } finally {
      setRefreshing(false);
    }
  }, [balanceStore.fetchUserBalance, publicKey]);

  const toggleHide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHide((prev) => !prev);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Wallet', header: () => null }} />

      <View className="flex-1 bg-background-0 dark:bg-background-900">

        {/* Top bar */}
        <TopBar />
        {/* Scrollable content */}
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
  {/* Full width Wallet Card */}
  <WalletHeaderCard hide={hide} toggleHide={toggleHide} />
<AnnouncementScroll />

  {/* Padding for the rest */}
  <VStack space="lg" className="p-4">
    {balanceStore.userBalance.length > 0 && (
      <WalletBalances userBalance={balanceStore.userBalance} hide={hide} />
    )}
    {!publicKey && <CreateWallet />}
  </VStack>
</ScrollView>

      </View>
    </>
  );
};

export default observer(Wallet);