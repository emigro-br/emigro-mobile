import { Image, Text, View } from 'react-native';

import { styled } from 'nativewind';

import { IBalance } from '@/types/IBalance';
import { getAssetIcon } from '@/utils/getAssetIcon';

import { AssetCode, AssetCodeToName, AssetCodeToSymbol } from '@constants/assetCode';

const StyledView = styled(View);
const StyledText = styled(Text);

interface BalanceProps {
  userBalance: IBalance[];
}

const Balance: React.FunctionComponent<BalanceProps> = ({ userBalance }) => {
  return (
    <StyledView className="flex items-center h-full">
      <StyledText className="w-full text-left text-xl font-medium mb-2">Accounts</StyledText>
      {userBalance?.map(({ balance, assetCode }, index) => {
        const asset: AssetCode = AssetCode[assetCode as keyof typeof AssetCode];
        return (
          <StyledView
            key={index}
            className="flex-row items-center justify-between h-16 m-1 px-3 w-full border border-slate-300 bg-white rounded-xl"
          >
            <StyledView className="flex-row gap-2">
              <Image source={getAssetIcon(assetCode)} style={{ width: 30, height: 30 }} />
              <StyledText className="font-bold text-lg">{AssetCodeToName[asset]}</StyledText>
            </StyledView>
            <StyledText className="text-base">
              {AssetCodeToSymbol[asset]} {Number(balance).toFixed(2)}
            </StyledText>
          </StyledView>
        );
      })}
    </StyledView>
  );
};

export default Balance;
