import { styled } from 'nativewind';
import React from 'react';
import { Image, Text, View } from 'react-native';

import { balances } from '@api/balance';

import brLogo from '@assets/images/br.png';
import usdLogo from '@assets/images/usd.png';

import Header from '@components/Header';

const StyledView = styled(View);
const StyledText = styled(Text);

const Wallet = () => {
  return (
    <>
      <Header children />
      <StyledView className="flex justify-center items-center">
        <StyledText className="text-center font-bold text-xl my-4">Balances:</StyledText>
        {balances.map(
          (bal, index) =>
            bal.asset_type !== 'native' && (
              <StyledView
                key={index}
                className="flex-row justify-between m-1 p-3 w-[200px] border-gray border-2 rounded"
              >
                <StyledView className="flex-row gap-1">
                  {bal.asset_code === 'BRL' && <Image source={brLogo} style={{ width: 20, height: 20 }} />}
                  {bal.asset_code === 'USDC' && <Image source={usdLogo} style={{ width: 20, height: 20 }} />}
                  <StyledText className="font-bold">{bal.asset_code}:</StyledText>
                </StyledView>
                <StyledText>{bal.balance}</StyledText>
              </StyledView>
            ),
        )}
      </StyledView>
    </>
  );
};

export default Wallet;
