import { styled } from 'nativewind';
import { Image, Text, View } from 'react-native';

import { IBalance } from '@/types/IBalance';

import brlLogo from '@assets/images/br.png';
import usdLogo from '@assets/images/usd.png';

import { AssetCode } from '@constants/assetCode';

const StyledView = styled(View);
const StyledText = styled(Text);

interface BalanceProps {
  userBalance: IBalance[];
}

const Balance: React.FunctionComponent<BalanceProps> = ({ userBalance }) => {
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
              {assetCode === AssetCode.BRL && <Image source={brlLogo} style={{ width: 30, height: 30 }} />}
              {assetCode === AssetCode.USDC && <Image source={usdLogo} style={{ width: 30, height: 30 }} />}
              <StyledText className="font-bold text-xl">
                {assetCode === AssetCode.USDC ? AssetCode.USD : assetCode}
              </StyledText>
            </StyledView>
            {Number(balance) > 0 ? (
              <StyledText className="text-xl">{Number(balance)}</StyledText>
            ) : (
              <StyledText className="font-bold text-xl">No funds</StyledText>
            )}
          </StyledView>
        );
      })}
    </StyledView>
  );
};

export default Balance;
