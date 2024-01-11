import { styled } from 'nativewind';
import { Image, Text, View } from 'react-native';

import { IBalance } from '@/types/IBalance';
import { getAssetIcon } from '@/utils/getAssetIcon';

import { AssetCode } from '@constants/assetCode';

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
        return (
          <StyledView
            key={index}
            className="flex-row h-20 items-center justify-between m-1 px-4 w-full border border-slate-300 bg-white rounded-xl"
          >
            <StyledView className="flex-row gap-2">
              <Image source={getAssetIcon(assetCode)} style={{ width: 30, height: 30 }} />
              <StyledText className="font-bold text-lg">
                {assetCode === AssetCode.USDC ? AssetCode.USD : assetCode}
              </StyledText>
            </StyledView>
            {Number(balance) > 0 ? (
              <StyledText className="text-base">{Number(balance)}</StyledText>
            ) : (
              <StyledText className="font-bold text-lg">No funds</StyledText>
            )}
          </StyledView>
        );
      })}
    </StyledView>
  );
};

export default Balance;
