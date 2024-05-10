import React, { useState } from 'react';
import { RefreshControl } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, ScrollView, VStack } from '@gluestack-ui/themed';
import { observer } from 'mobx-react-lite';

import { CreateWallet } from '@/components/CreateWallet';
import OperationButtons from '@/components/OperationButtons';
import { WalletBalances } from '@/components/WalletBalances';
import { WalletStackParamList } from '@/navigation/WalletStack';
import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList>;
};

const Wallet = observer(({ navigation }: Props) => {
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
    try {
      await balanceStore.fetchUserBalance().catch(console.warn);
    } finally {
      setRefreshing(false);
    }
  }, [balanceStore.fetchUserBalance, publicKey]);

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} title="Refreshing..." />}>
      <Box bg="$primary500" py="$2">
        <OperationButtons navigation={navigation} />
      </Box>
      <VStack space="lg" p="$4">
        {balanceStore.userBalance.length > 0 && (
          <WalletBalances userBalance={balanceStore.userBalance} navigation={navigation} />
        )}
        {!publicKey && <CreateWallet />}
      </VStack>
    </ScrollView>
  );
});

export default Wallet;
