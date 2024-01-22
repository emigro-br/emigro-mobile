import { styled } from 'nativewind';
import React, { useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { RefreshControl, ScrollView, View } from 'react-native';

import { getUserBalance } from '@/services/emigro';
import { useOperationStore } from '@/store/operationStore';
import { IBalance } from '@/types/IBalance';

import Balance from '@components/Balance';
import OperationButton from '@components/OperationButton';

import { OperationType } from '@constants/constants';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);

const Wallet: React.FunctionComponent = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [userBalance, setUserBalance] = useState<IBalance[]>([]);
  const { setOperationType } = useOperationStore();
  const navigation = useNavigation();

  const fetchUserBalance = async (): Promise<void> => {
    try {
      console.debug('Fetching user balance...');
      const balances = await getUserBalance();
      setUserBalance(balances);
    } catch (error) {
      console.error(error);
      throw new Error();
    }
  };

  const handleOnPress = (operationType: OperationType) => {
    setOperationType(operationType);
    navigation.navigate('Operation' as never);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserBalance();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserBalance();
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
          <Balance userBalance={userBalance} />
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
};

export default Wallet;
