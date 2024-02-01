import { styled } from 'nativewind';
import React, { useState } from 'react';
import { observer } from "mobx-react";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { RefreshControl, ScrollView, View } from 'react-native';

import Balance from '@components/Balance';
import OperationButton from '@components/OperationButton';
import { OperationType } from '@constants/constants';
import { useOperationStore } from '@/stores/operationStore';
import BalanceStore from '@/stores/BalanceStore';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);

const Wallet: React.FunctionComponent = observer(() => {
  const [refreshing, setRefreshing] = useState(false);
  const { setOperationType } = useOperationStore();
  const navigation = useNavigation();

  const handleOnPress = (operationType: OperationType) => {
    setOperationType(operationType);
    navigation.navigate('Operation' as never);
  };

  useFocusEffect(
    React.useCallback(() => {
      BalanceStore.fetchUserBalance();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await BalanceStore.fetchUserBalance();
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <StyledScrollView
      className='flex-1 bg-white'
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} title='Refreshing...' />
      }>
      <StyledView className="flex items-center">
        <StyledView className="px-4 py-8">
          <OperationButton onPress={handleOnPress} />
        </StyledView>
        <StyledView className="px-4 w-full">
          <Balance userBalance={BalanceStore.userBalance} />
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
});

export default Wallet;
