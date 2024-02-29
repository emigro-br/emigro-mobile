import React, { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { observer } from 'mobx-react-lite';
import { styled } from 'nativewind';

import Balance from '@components/Balance';
import OperationButtons from '@components/OperationButtons';

import { balanceStore } from '@stores/BalanceStore';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);

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
    <StyledScrollView
      className="flex-1 bg-white"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} title="Refreshing..." />}
    >
      <StyledView className="flex">
        <StyledView className="px-4 py-8">
          <OperationButtons />
        </StyledView>
        <StyledView className="px-4 w-full">
          <Balance userBalance={balanceStore.userBalance} />
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
});

export default Wallet;
