import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { getUserBalance } from '@/services/emigro';

import brLogo from '@assets/images/br.png';
import usdLogo from '@assets/images/usd.png';

const StyledView = styled(View);
const StyledText = styled(Text);

interface Balance {
  assetCode: string;
  balance: number;
  assetType: string;
}

const Wallet = () => {
  const [userBalance, setUserBalance] = useState<Balance[]>([]);

  const navigation = useNavigation();

  const handleGetUserBalance = async () => {
    try {
      const userBalance = await getUserBalance();
      setUserBalance(userBalance.balances);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      handleGetUserBalance();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <>
      <StyledView className="flex items-center h-full">
        <StyledText className="text-center font-black text-2xl my-6">Balance</StyledText>
        {userBalance?.map((balances, index) => {
          if (balances.balance > 0) {
            return (
              <StyledView
                key={index}
                className="flex-row h-20 items-center justify-between m-1 px-6 w-full bg-white rounded"
              >
                <StyledView className="flex-row gap-2">
                  {balances.assetCode === 'BRL' && <Image source={brLogo} style={{ width: 30, height: 30 }} />}
                  {balances.assetCode === 'USDC' && <Image source={usdLogo} style={{ width: 30, height: 30 }} />}
                  <StyledText className="font-bold text-xl">
                    {balances.assetCode === 'USDC'
                      ? 'USD'
                      : balances.assetCode
                      ? balances.assetCode
                      : balances.assetType}
                  </StyledText>
                </StyledView>
                <StyledText className="text-xl">{Number(balances.balance).toFixed(2)}</StyledText>
              </StyledView>
            );
          }
          return null;
        })}
      </StyledView>
    </>
  );
};

export default Wallet;
