import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { getUserBalance } from '@/services/emigro';

import { balances } from '@api/balance';

import brLogo from '@assets/images/br.png';
import usdLogo from '@assets/images/usd.png';

import Header from '@components/Header';

const StyledView = styled(View);
const StyledText = styled(Text);

const Wallet = () => {
  const [userData, setUserData] = useState([]);

  const handleGetUser = async () => {
    try {
      const user = await getUserBalance();
      console.log(user, 'user en wallet');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleGetUser();
  }, []);

  return (
    <>
      <Header children />
      <StyledView className="flex justify-center items-center">
        <StyledText className="text-center font-bold text-xl my-4">Balances:</StyledText>
        {userData}
      </StyledView>
    </>
  );
};

export default Wallet;
