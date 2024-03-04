import React, { useState } from 'react';
import { RefreshControl } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, ScrollView, VStack } from '@gluestack-ui/themed';
import { observer } from 'mobx-react-lite';

import Balance from '@components/Balance';
import OperationButtons from '@components/OperationButtons';

import { WalletStackParamList } from '@navigation/WalletStack';

import { balanceStore } from '@stores/BalanceStore';

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList>;
};

const Wallet = observer(({ navigation }: Props) => {
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
          <OperationButtons navigation={navigation} />
        </Box>
        <Balance userBalance={balanceStore.userBalance} />
      </VStack>
    </ScrollView>
  );
});

export default Wallet;
