import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { getUserBalance } from '@/services/emigro';
import { useOperationStore } from '@/store/operationStore';
import { IBalance } from '@/types/IBalance';

import Balance from '@components/Balance';
import OperationButton from '@components/OperationButton';

import { OperationType } from '@constants/constants';

const StyledView = styled(View);

const Wallet: React.FunctionComponent = () => {
  const [userBalance, setUserBalance] = useState<IBalance[]>([]);
  const { setOperationType } = useOperationStore();
  const navigation = useNavigation();

  const fetchUserBalance = async (): Promise<void> => {
    try {
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

  useEffect(() => {
    fetchUserBalance();
  }, []);

  return (
    <StyledView className="flex items-center h-full">
      <StyledView className="gap-2 m-1 px-6 w-full flex-row justify-around">
        <OperationButton onPress={handleOnPress} />
      </StyledView>
      <StyledView className="gap-2 m-1 px-6 w-full">
        <Balance userBalance={userBalance} />
      </StyledView>
    </StyledView>
  );
};

export default Wallet;
