import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { Image, Linking, Text, View } from 'react-native';

import { getUserBalance, getUserPublicKey } from '@/services/emigro';
import { IBalance } from '@/types/IBalance';

import brLogo from '@assets/images/br.png';
import usdLogo from '@assets/images/usd.png';

import { AssetCode } from '@constants/assetCode';
import { OperationType } from '@constants/constants';
import { getAccessToken } from '@/services/helpers';
import { getInteractiveUrl } from '@/services/anchor';
import AnchorButton from './AnchorButton';

const StyledView = styled(View);
const StyledText = styled(Text);

const Wallet = () => {
  const [userBalance, setUserBalance] = useState<IBalance[]>([]);
  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const navigation = useNavigation();

  const fetchUserBalance = async (): Promise<void> => {
    try {
      const { balances } = await getUserBalance();
      setUserBalance(balances);
    } catch (error) {
      console.error(error);
      throw new Error();
    }
  };

  const handleAnchorButtonPress = async (operation: string): Promise<void> => {
    const isOperationLoading = operation === OperationType.DEPOSIT ? setDepositLoading : setWithdrawLoading;
    isOperationLoading(true);

      const publicKey = await getUserPublicKey();
      const cognitoToken = await getAccessToken();

      const anchorParams = {
        account: publicKey,
        operation,
        asset_code: AssetCode.USDC,
        cognito_token: cognitoToken,
      };
  
      try {
        const { url } = await getInteractiveUrl(anchorParams);
        if (url) {
          Linking.openURL(url);
        }
      } catch (error) {
        console.error(error);
      } finally {
        isOperationLoading(false);
      }
  }

  useEffect(() => {
    return navigation.addListener('focus', () => {
      fetchUserBalance();
    });
  }, [navigation]);

  return (
    <StyledView className="flex items-center h-full">
      <StyledText className="text-center font-black text-2xl my-6">Balance</StyledText>
      {userBalance?.map(({ balance, assetCode }, index) => {
        return (
          <StyledView
            key={index}
            className="flex-row h-20 items-center justify-between m-1 px-6 w-full bg-white rounded"
          >
            <StyledView className="flex-row gap-2">
              {assetCode === AssetCode.BRL && <Image source={brLogo} style={{ width: 30, height: 30 }} />}
              {assetCode === AssetCode.USDC && <Image source={usdLogo} style={{ width: 30, height: 30 }} />}
              <StyledText className="font-bold text-xl">
                {assetCode === AssetCode.USDC ? AssetCode.USD : assetCode}
              </StyledText>
            </StyledView>
            {balance > 0 ? (
              <StyledText className="text-xl">{Number(balance).toFixed(2)}</StyledText>
            ) : (
              <StyledText className="font-bold text-xl">No funds</StyledText>
            )}
          </StyledView>
        );
      })}
      <AnchorButton onPress={handleAnchorButtonPress} depositLoading={depositLoading} withdrawLoading={withdrawLoading}/>
    </StyledView>
  );
};

export default Wallet;
