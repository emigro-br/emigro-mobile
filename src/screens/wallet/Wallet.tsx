import React, { useState } from 'react';
import { RefreshControl } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { Box, ScrollView, VStack } from '@gluestack-ui/themed';
import { observer } from 'mobx-react-lite';

import Balance from '@components/Balance';
import OperationButtons from '@components/OperationButtons';

import { balanceStore } from '@stores/BalanceStore';

const Wallet: React.FC = observer(() => {
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      balanceStore.fetchUserBalance();
    }, [balanceStore.fetchUserBalance]),
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await balanceStore.fetchUserBalance();
    } finally {
      setRefreshing(false);
    }
  }, [balanceStore.fetchUserBalance]);

  return (
    <ScrollView
      bg="$white"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} title="Refreshing..." />}
    >
      <VStack p="$4" space="lg">
        <Box py="$8">
          <OperationButtons />
        </Box>
        <Balance userBalance={balanceStore.userBalance} />
      </VStack>
    </ScrollView>
  );
});

export default Wallet;
