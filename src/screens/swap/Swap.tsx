
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Button from '@/components/Button';
import { AssetCode } from '@constants/assetCode';
import { styled } from 'nativewind';
import { ArrowDownCircleIcon } from 'react-native-heroicons/solid';
import { AssetSwap } from './AssetSwap';
import { SwapType } from './types';
import BalanceStore from '@/stores/BalanceStore';

const StyledView = styled(View);
const StyledText = styled(Text);

export const Swap = () => {
   const [sellAsset, setSellAsset] = useState<AssetCode>(AssetCode.EURC);
   const [buyAsset, setBuyAsset] = useState<AssetCode>(AssetCode.BRL);
   const [sellValue, setSellValue] = useState(0);
   const [buyValue, setBuyValue] = useState(0);
   const rate = 1.0829;

   const onChangeValue = (value: number, type: SwapType) => {
      if (type === SwapType.SELL) {
         setSellValue(value);
         setBuyValue(value * rate);
      } else {
         setBuyValue(value);
         setSellValue(value / rate);
      }
   }

   const handlePress = () => {
      console.log('handlePress');
   }

   return (
      <StyledView className='h-full p-4'>
         <StyledText className='text-2xl font-bold mb-4'>Sell {sellAsset}</StyledText>
         <AssetSwap 
            asset={sellAsset} 
            balance={BalanceStore.get(sellAsset)} 
            sellOrBuy={SwapType.SELL} 
            value={sellValue} 
            onChangeAsset={setSellAsset} 
            onChangeValue={onChangeValue} 
         />
         <StyledView className='items-center mb-4' testID='arrowIcon'>
            <ArrowDownCircleIcon size={36} color='red' />
         </StyledView>
         <AssetSwap 
            asset={buyAsset} 
            balance={BalanceStore.get(buyAsset)} 
            sellOrBuy={SwapType.BUY} 
            value={buyValue} 
            onChangeAsset={setBuyAsset} 
            onChangeValue={onChangeValue} 
         />
         <StyledText className='text-gray text-xs mb-4'>1 {sellAsset} ≈ {rate} {buyAsset}</StyledText>
         <Button backgroundColor='red' textColor='white' onPress={handlePress}>Review order</Button>
      </StyledView>
   );
};
