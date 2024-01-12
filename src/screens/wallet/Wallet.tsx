import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';

import refreshLogo from '../../assets/images/refresh.png';

import { getUserBalance } from '@/services/emigro';
import { useOperationStore } from '@/store/operationStore';
import { IBalance } from '@/types/IBalance';

import Balance from '@components/Balance';
import OperationButton from '@components/OperationButton';

import { OperationType } from '@constants/constants';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledImage = styled(Image);

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

  const handleRefreshBalance = () => {
    fetchUserBalance();
  };

  useEffect(() => {
    fetchUserBalance();
  }, []);

  return (
    <StyledScrollView>
      <StyledView className="flex items-center bg-white h-full">
        <StyledView className="p-4 mt-12">
          <OperationButton onPress={handleOnPress} />
        </StyledView>
        <TouchableOpacity onPress={handleRefreshBalance}>
          <StyledView className="h-14 w-40 flex items-center">
            <StyledImage source={refreshLogo} />
          </StyledView>
        </TouchableOpacity>
        <StyledView className="m-1 px-6 w-full">
          <Balance userBalance={userBalance} />
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
};

export default Wallet;
