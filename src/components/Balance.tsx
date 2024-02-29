import { Image, Text, View } from 'react-native';

import { styled } from 'nativewind';

import { IBalance } from '@/types/IBalance';
import { CryptoAsset } from '@/types/assets';

import { AssetToName, AssetToSymbol, iconFor } from '@utils/assets';

const StyledView = styled(View);
const StyledText = styled(Text);

interface BalanceProps {
  userBalance: IBalance[];
}

const Balance: React.FunctionComponent<BalanceProps> = ({ userBalance }) => {
  return (
    <StyledView className="flex items-center h-full">
      <StyledText className="w-full text-left text-xl font-medium mb-2">Accounts</StyledText>
      {userBalance?.map(({ balance, assetCode, assetType }, index) => {
        const asset: CryptoAsset =
          assetType === 'native' ? CryptoAsset.XLM : CryptoAsset[assetCode as keyof typeof CryptoAsset];
        return (
          <StyledView
            key={index}
            className="flex-row items-center justify-between h-16 m-1 px-3 w-full border border-slate-300 bg-white rounded-xl"
          >
            <StyledView className="flex-row gap-2">
              <Image source={iconFor(asset)} style={{ width: 30, height: 30 }} />
              <StyledText className="font-bold text-lg">{AssetToName[asset]}</StyledText>
            </StyledView>
            <StyledText className="text-base">
              {AssetToSymbol[asset]} {Number(balance).toFixed(2)}
            </StyledText>
          </StyledView>
        );
      })}
    </StyledView>
  );
};

export default Balance;
